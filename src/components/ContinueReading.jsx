import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { getMostRecentInProgress } from "../hooks/useReadingProgress.js";
import { posts as allPosts } from "../generated/posts-data.js";
import { notes as allNotes } from "../generated/notes-data.js";

/**
 * ContinueReading — home-page card showing the article the reader most
 * recently left unfinished, with a progress bar and remaining-time estimate.
 * Renders nothing when there is no in-progress article.
 *
 * Fully data-driven: works for any post/note slug, new content included.
 */
export default function ContinueReading() {
  const { lang } = useI18n();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const recent = getMostRecentInProgress();
    if (!recent) return;
    const source = recent.type === "post" ? allPosts : allNotes;
    const doc = source.find((d) => d.slug === recent.slug);
    if (!doc) return;
    setItem({ ...recent, doc });
  }, []);

  if (!item) return null;

  const { doc, progress } = item;
  const pct = Math.round(progress * 100);
  const title = lang === "zh" && doc.titleZh ? doc.titleZh : doc.title;
  const path = item.type === "post" ? `/post/${doc.slug}` : `/note/${doc.slug}`;
  const category = doc.category || "";

  // readTime is stored as "N min" — estimate remaining minutes
  const totalMin = parseInt(doc.readTime, 10) || 0;
  const remainMin = Math.max(1, Math.ceil(totalMin * (1 - progress)));

  return (
    <section className="max-w-5xl mx-auto px-6 pb-16">
      <p className="text-xs font-mono tracking-widest text-muted uppercase mb-3">
        {lang === "zh" ? "继续阅读" : "Continue reading"}
      </p>
      <div className="flex items-center gap-5 p-5 rounded-xl border border-hairline bg-surface-soft/50">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-ink truncate mb-1">{title}</h3>
          <p className="text-sm text-muted mb-3">
            {category}
            {category && " · "}
            {lang === "zh"
              ? `已读 ${pct}%${totalMin ? ` · 剩余约 ${remainMin} 分钟` : ""}`
              : `${pct}% read${totalMin ? ` · ~${remainMin} min left` : ""}`}
          </p>
          <div className="h-1 rounded-full bg-hairline overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <Link
          to={path}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors"
        >
          {lang === "zh" ? "继续" : "Resume"}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
