import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { Link } from "react-router-dom";
import { slugify, extractTextFromChildren } from "../lib/toc.js";
import { Check, Copy } from "lucide-react";

/** CodeBlock — wraps <pre> with a copy-to-clipboard button */
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef(null);

  const handleCopy = useCallback(() => {
    const text = preRef.current?.textContent || "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="relative group my-lg">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-surface-card/80 backdrop-blur-sm text-muted hover:text-primary transition-all opacity-0 group-hover:opacity-100 z-10"
        title="Copy code"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre
        ref={preRef}
        className="border-l-4 border-primary/30 rounded-r-md p-lg overflow-x-auto text-sm leading-relaxed font-mono"
        style={{ backgroundColor: "var(--color-code-bg)", color: "var(--color-code-text)" }}
      >
        {children}
      </pre>
    </div>
  );
}

export default function PostContent({ content }) {
  if (!content) return null;

  return (
    <div className="post-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mt-2xl mb-lg leading-tight">
              {children}
            </h1>
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
          pre: ({ children }) => (
            <CodeBlock>{children}</CodeBlock>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ""}
              className="w-full rounded-lg my-lg border border-hairline"
              loading="lazy"
            />
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
