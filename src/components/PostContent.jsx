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

export default function PostContent({ content }) {
  if (!content) return null;

  return (
    <div className="post-content">
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
              <h2 id={id} className="font-display text-2xl md:text-3xl font-semibold text-ink mt-xl mb-md leading-tight scroll-mt-20">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = slugify(extractTextFromChildren(children));
            return (
              <h3 id={id} className="font-display text-xl md:text-2xl font-semibold text-ink mt-lg mb-sm leading-tight scroll-mt-20">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="font-display text-lg font-semibold text-ink mt-md mb-xs leading-tight">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-body leading-[1.8] mb-md text-[15px]">
              {children}
            </p>
          ),
          a: ({ href, children }) => {
            const isInternal = href && href.startsWith("#/");
            if (isInternal) {
              return <Link to={href.slice(1)} className="text-primary underline hover:text-primary-active">{children}</Link>;
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary-active">
                {children}
              </a>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-lg mb-md space-y-xs text-body leading-[1.8] text-[15px] marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-lg mb-md space-y-xs text-body leading-[1.8] text-[15px] marker:text-primary marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-xs">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 bg-surface-soft py-sm pl-lg pr-md my-lg rounded-r-md">
              {children}
            </blockquote>
          ),
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
