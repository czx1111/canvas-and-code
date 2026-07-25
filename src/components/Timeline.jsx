import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { getCategoryLabel as getNoteCategoryLabel } from "../lib/categories.js";

/**
 * Timeline — vertical timeline of articles grouped by year.
 *
 * @param {object} props
 * @param {Array} props.items — array of { slug, title, titleZh, date, category, type }
 * @param {string} [props.basePath="/post"] — base path for item links
 */
export default function Timeline({ items, basePath = "/post" }) {
  const { lang, t } = useI18n();

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!item.date) continue;
      const year = new Date(item.date).getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year).push(item);
    }
    // Sort years descending, items within year by date descending
    const sorted = Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
    for (const [, list] of sorted) {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return sorted;
  }, [items]);

  if (!grouped.length) return null;

  const getTitle = (item) => lang === "zh" && item.titleZh ? item.titleZh : item.title;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = lang === "zh"
      ? ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-hairline" />

      <div className="space-y-8">
        {grouped.map(([year, yearItems]) => (
          <div key={year}>
            {/* Year header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary text-canvas flex items-center justify-center text-xs font-bold flex-shrink-0 relative z-10">
                {String(year).slice(-2)}
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">{year}</h2>
              <span className="text-sm text-muted">({yearItems.length})</span>
            </div>

            {/* Items */}
            <div className="ml-9 space-y-2">
              {yearItems.map((item) => (
                <Link
                  key={`${item.type || "post"}-${item.slug}`}
                  to={`${basePath}/${item.slug}`}
                  className="group flex items-start gap-3 py-2 px-3 -ml-3 rounded-lg hover:bg-surface-soft transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-muted flex-shrink-0 w-20 pt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink group-hover:text-primary transition-colors font-medium leading-snug">
                      {getTitle(item)}
                    </p>
                    {item.category && (() => {
                      const noteLabel = getNoteCategoryLabel(item.category, lang);
                      const label = noteLabel !== item.category ? noteLabel : (t(`common.categories.${item.category}`) !== `common.categories.${item.category}` ? t(`common.categories.${item.category}`) : item.category);
                      return <span className="text-xs text-muted">{label}</span>;
                    })()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
