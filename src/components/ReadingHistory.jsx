import { Link } from "react-router-dom";
import { Clock, Trash2, FileText, NotebookPen } from "lucide-react";
import { useReadingHistory } from "../hooks/useReadingHistory.js";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * ReadingHistory — displays recently viewed posts and notes.
 * Shows a compact list with clear-history button.
 */
export default function ReadingHistory() {
  const { history, clearHistory } = useReadingHistory();
  const { lang } = useI18n();

  if (history.length === 0) return null;

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return lang === "zh" ? "刚刚" : "just now";
    if (diffMin < 60) return lang === "zh" ? `${diffMin}分钟前` : `${diffMin}m ago`;
    if (diffHr < 24) return lang === "zh" ? `${diffHr}小时前` : `${diffHr}h ago`;
    if (diffDay < 7) return lang === "zh" ? `${diffDay}天前` : `${diffDay}d ago`;
    return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US");
  };

  return (
    <div className="rounded-lg border border-hairline bg-surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Clock className="w-4 h-4 text-primary" />
          {lang === "zh" ? "阅读历史" : "Reading History"}
        </h3>
        <button
          onClick={clearHistory}
          className="p-1 rounded text-muted hover:text-danger transition-colors"
          title={lang === "zh" ? "清除历史" : "Clear history"}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <ul className="space-y-1.5">
        {history.slice(0, 8).map((h) => {
          const path = h.type === "post" ? `/post/${h.slug}` : `/note/${h.slug}`;
          return (
            <li key={`${h.type}-${h.slug}`}>
              <Link
                to={path}
                className="group flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-md hover:bg-surface-soft transition-colors"
              >
                {h.type === "post" ? (
                  <FileText className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                ) : (
                  <NotebookPen className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                )}
                <span className="flex-1 text-sm text-ink group-hover:text-primary transition-colors truncate">
                  {h.title || h.slug}
                </span>
                <span className="text-xs text-muted flex-shrink-0">
                  {formatTime(h.viewedAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
