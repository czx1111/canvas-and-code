import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, NotebookPen, ArrowRight, X } from "lucide-react";
import { useSearch } from "../hooks/useSearch.js";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * SearchModal — full-screen search overlay triggered by Cmd+K / Ctrl+K.
 * Searches across all posts and notes (title, excerpt, tags, content).
 * Supports keyboard navigation (↑↓ to navigate, Enter to open, Esc to close).
 */
export default function SearchModal({ open, onClose }) {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const { results } = useSearch(query);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      const r = results[activeIndex];
      const path = r.type === "post" ? `/post/${r.slug}` : `/note/${r.slug}`;
      navigate(path);
      onClose();
    }
  }, [results, activeIndex, navigate, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const el = resultsRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const getTitle = (r) => lang === "zh" && r.titleZh ? r.titleZh : r.title;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl rounded-xl border border-hairline bg-canvas shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline">
          <Search className="w-5 h-5 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={lang === "zh" ? "搜索文章和随笔..." : "Search posts and notes..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-ink placeholder:text-muted text-sm outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface-soft transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="px-4 py-8 text-center text-sm text-muted">
              {lang === "zh" ? "输入关键词开始搜索" : "Type to start searching"}
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">
              {lang === "zh" ? `未找到与 "${query}" 相关的内容` : `No results for "${query}"`}
            </div>
          ) : (
            <ul className="py-2">
              {results.map((r, i) => {
                const path = r.type === "post" ? `/post/${r.slug}` : `/note/${r.slug}`;
                return (
                  <li key={`${r.type}-${r.slug}`}>
                    <button
                      data-idx={i}
                      onClick={() => { navigate(path); onClose(); }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === activeIndex ? "bg-surface-soft" : "hover:bg-surface-soft/50"
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        {r.type === "post" ? (
                          <FileText className="w-4 h-4 text-primary" />
                        ) : (
                          <NotebookPen className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{getTitle(r)}</p>
                        <p className="text-xs text-muted truncate">
                          {r.type === "post" ? t("nav.blog") : t("nav.notes")}
                          {r.category ? ` · ${r.category}` : ""}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted flex-shrink-0 opacity-0 group-hover:opacity-100" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-hairline flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-surface-soft font-mono text-[10px]">↑↓</kbd>
              {lang === "zh" ? "导航" : "navigate"}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-surface-soft font-mono text-[10px]">↵</kbd>
              {lang === "zh" ? "打开" : "open"}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-surface-soft font-mono text-[10px]">esc</kbd>
              {lang === "zh" ? "关闭" : "close"}
            </span>
          </div>
          {results.length > 0 && (
            <span>{results.length} {lang === "zh" ? "条结果" : "results"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
