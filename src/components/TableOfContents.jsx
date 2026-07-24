import { useState, useEffect } from "react";
import { List } from "lucide-react";
import { extractHeadings } from "../lib/toc.js";

/**
 * TableOfContents — floating sticky sidebar TOC (desktop)
 * + collapsible block (mobile). Pass variant="mobile" or
 * variant="desktop" to render only one mode.
 *
 * Auto-extracts h2/h3 from markdown and highlights the
 * current section via IntersectionObserver.
 */
export default function TableOfContents({ content, variant }) {
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const headings = extractHeadings(content || "");
  const headingIds = headings.map((h) => h.id).join(",");

  useEffect(() => {
    if (headings.length < 3) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headingIds]);

  // Don't render TOC for short articles
  if (headings.length < 3) return null;

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
    setMobileOpen(false);
  };

  const tocList = (
    <ul className="space-y-1 border-l border-hairline">
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
          <a
            href={`#${h.id}`}
            onClick={(e) => handleClick(e, h.id)}
            className={`block pl-3 -ml-px text-sm leading-relaxed border-l border-transparent transition-colors ${
              activeId === h.id
                ? "border-primary text-primary font-medium"
                : "text-muted hover:text-ink"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );

  // ── Mobile: collapsible block ──────────────────────
  if (variant === "mobile") {
    return (
      <div className="xl:hidden mb-8">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-hairline bg-surface-soft/50 text-sm font-medium text-ink hover:bg-surface-soft transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <List className="w-4 h-4 text-primary" />
            目录
          </span>
          <span className="text-muted text-xs">{headings.length} 节</span>
        </button>
        {mobileOpen && (
          <div className="mt-3 px-4 py-3 rounded-lg border border-hairline bg-surface-soft/30">
            {tocList}
          </div>
        )}
      </div>
    );
  }

  // ── Desktop: sticky sidebar ────────────────────────
  return (
    <div className="hidden xl:block">
      <div className="sticky top-20">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          <List className="w-3.5 h-3.5" />
          目录
        </p>
        <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {tocList}
        </nav>
      </div>
    </div>
  );
}
