import { useState, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { Link } from "react-router-dom";
import { slugify, extractTextFromChildren } from "../lib/toc.js";
import { Check, Copy, ChevronDown, Terminal } from "lucide-react";
import Lightbox from "./Lightbox.jsx";

/**
 * Sanitize schema — extends the GitHub-style default schema to allow `className`
 * on specific elements (needed for code highlighting classes) and `loading` on images.
 *
 * Plugin order: rehype-raw → rehype-sanitize → rehype-highlight
 *   1. rehype-raw      parses raw HTML embedded in markdown
 *   2. rehype-sanitize strips dangerous tags/attributes (script, iframe, on*, javascript:)
 *   3. rehype-highlight adds highlight spans on the already-sanitized tree
 *
 * Security notes:
 *   - `className` is only allowed on code/pre/span (for syntax highlighting), not on all elements
 *   - `loading` is allowed on img for lazy loading
 *   - No additional tag types are permitted beyond the GitHub default
 *   - `style` attribute is NOT allowed (prevents CSS-based attacks)
 */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Allow className only on code-related elements for syntax highlighting
    code: [...(defaultSchema.attributes.code || []), "className"],
    pre: [...(defaultSchema.attributes.pre || []), "className"],
    span: [...(defaultSchema.attributes.span || []), "className"],
    // Allow lazy loading on images
    img: [...(defaultSchema.attributes.img || []), "loading"],
  },
};

/** CodeBlock — wraps <pre> with copy button, language tag, line numbers, and collapse */
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const preRef = useRef(null);

  // Extract language from className (e.g. "language-js")
  const language = useMemo(() => {
    if (!className) return null;
    const match = className.match(/language-(\w+)/);
    return match ? match[1] : null;
  }, [className]);

  const handleCopy = useCallback(() => {
    const text = preRef.current?.textContent || "";
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Clipboard API may not be available in insecure contexts
      });
  }, []);

  // Count lines for line numbers
  const lineCount = useMemo(() => {
    const text = preRef.current?.textContent || "";
    return text.split("\n").length;
  }, [children]);

  return (
    <div className="relative group my-lg rounded-lg border border-hairline overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface-soft border-b border-hairline">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted" />
          <span className="text-xs font-mono text-muted uppercase tracking-wide">
            {language || "code"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {lineCount > 20 && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="p-1 rounded text-muted hover:text-ink transition-colors"
              title={collapsed ? "Expand" : "Collapse"}
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-muted hover:text-ink transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className={`relative ${collapsed ? "max-h-24 overflow-hidden" : ""}`}>
        {collapsed && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        )}
        <pre
          ref={preRef}
          className="p-lg overflow-x-auto text-sm leading-relaxed font-mono"
          style={{ backgroundColor: "var(--color-code-bg)", color: "var(--color-code-text)" }}
        >
          {children}
        </pre>
      </div>
    </div>
  );
}

/** ImageWithLightbox — wraps img with click-to-zoom lightbox */
function ImageWithLightbox({ src, alt }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt || ""}
        className="w-full rounded-lg my-lg border border-hairline cursor-zoom-in hover:opacity-90 transition-opacity"
        loading="lazy"
        onError={() => setImgError(true)}
        style={imgError ? { display: "none" } : undefined}
        onClick={() => !imgError && setLightboxOpen(true)}
      />
      {imgError && (
        <div className="w-full rounded-lg my-lg border border-hairline bg-surface-soft p-8 text-center text-sm text-muted">
          {alt || "Image failed to load"}
        </div>
      )}
      {lightboxOpen && !imgError && (
        <Lightbox
          images={[{ src, alt: alt || "" }]}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

/**
 * Sidenote — Tufte-style margin note.
 * Written in markdown as an inline note: ^[note text]
 * Wide screens (≥1500px): floats into the left margin.
 * Narrow screens: degrades to inline muted parenthesized text.
 */
function Sidenote({ n, text }) {
  return (
    <span className="sidenote-wrapper">
      <sup className="sidenote-ref">{n}</sup>
      <span className="sidenote" role="note">
        <span className="sidenote-num">{n}</span>
        {text}
      </span>
    </span>
  );
}

/**
 * transformSidenotes — walks paragraph children, splits plain-text nodes on
 * the inline-note syntax ^[...], and returns a new children array with
 * <Sidenote> elements injected. Element children (links, code, etc.) are
 * left untouched so their markup is never broken.
 *
 * @param {React.ReactNode} children
 * @param {() => number} nextNum — returns the next sidenote number
 */
function transformSidenotes(children, nextNum) {
  const splitText = (text) => {
    const parts = [];
    const re = /\^\[([^\]]+)\]/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push({ __note: m[1] });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  const walk = (child) => {
    if (typeof child === "string") return splitText(child);
    if (Array.isArray(child)) return child.flatMap(walk);
    return [child];
  };

  return walk(children)
    .flat()
    .map((part, i) =>
      part && typeof part === "object" && part.__note
        ? <Sidenote key={`sn-${i}`} n={nextNum()} text={part.__note} />
        : part
    );
}

/** PullQuote — editorial pull quote. Written in markdown as: > [!pull] quote text */
function PullQuote({ text }) {
  return (
    <div className="pull-quote">
      <p>
        <span className="pull-quote-mark" aria-hidden="true">&ldquo;</span>
        {text}
      </p>
    </div>
  );
}

export default function PostContent({ content, dropCap = false }) {
  if (!content) return null;

  // Sidenote numbering resets per article render (render order is deterministic)
  let sidenoteCounter = 0;
  const nextSidenoteNum = () => ++sidenoteCounter;

  return (
    <div className={`post-content${dropCap ? " drop-cap" : ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
        ]}
        components={{
          h1: ({ children }) => (
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mt-xl mb-md leading-tight scroll-mt-20">
              {children}
            </h2>
          ),
          h2: ({ children }) => {
            const id = slugify(extractTextFromChildren(children));
            return (
              <h2 id={id} className="font-display text-h2 font-semibold text-ink mt-xxl mb-md leading-tight scroll-mt-20">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = slugify(extractTextFromChildren(children));
            return (
              <h3 id={id} className="font-display text-h3 font-semibold text-ink mt-xl mb-sm leading-tight scroll-mt-20">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="font-display text-h4 font-semibold text-ink mt-lg mb-xs leading-tight">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-body text-prose mb-lg">
              {transformSidenotes(children, nextSidenoteNum)}
            </p>
          ),
          a: ({ href, children }) => {
            // Internal links: "/post/x" (BrowserRouter) and legacy "#/post/x"
            // (written when the site used HashRouter) both become router Links.
            if (href && href.startsWith("#/")) {
              return <Link to={href.slice(1)} className="text-primary underline hover:text-primary-active">{children}</Link>;
            }
            if (href && href.startsWith("/")) {
              return <Link to={href} className="text-primary underline hover:text-primary-active">{children}</Link>;
            }
            // Same-page anchor links (e.g. "#some-heading") stay in-page.
            if (href && href.startsWith("#")) {
              return <a href={href} className="text-primary underline hover:text-primary-active">{children}</a>;
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary-active">
                {children}
              </a>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-lg mb-lg space-y-xs text-body text-prose marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-lg mb-lg space-y-xs text-body text-prose marker:text-primary marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-xs">{children}</li>,
          blockquote: ({ children }) => {
            // Pull-quote convention: "> [!pull] quote text" renders as an
            // editorial pull quote instead of a regular blockquote.
            const text = extractTextFromChildren(children).trim();
            const pullMatch = text.match(/^\[!pull\]\s*/i);
            if (pullMatch) {
              return <PullQuote text={text.slice(pullMatch[0].length).trim()} />;
            }
            return (
              <blockquote className="border-l-4 border-primary/30 bg-surface-soft py-sm pl-lg pr-md my-lg rounded-r-md">
                {children}
              </blockquote>
            );
          },
          code: ({ inline, className, children }) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary font-mono text-[0.85em] font-medium">
                  {children}
                </code>
              );
            }
            return <code className={`font-mono ${className || ""}`}>{children}</code>;
          },
          pre: ({ children, className }) => (
            <CodeBlock className={className}>{children}</CodeBlock>
          ),
          img: ({ src, alt }) => (
            <ImageWithLightbox src={src} alt={alt} />
          ),
          hr: () => <hr className="border-hairline my-xl" />,
          table: ({ children }) => (
            <div className="my-lg overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-surface-soft">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-hairline px-md py-sm text-left font-semibold text-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-hairline px-md py-sm text-body">{children}</td>
          ),
          strong: ({ children }) => <strong className="font-semibold text-body-strong">{children}</strong>,
          em: ({ children }) => <em className="italic text-body-strong">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
