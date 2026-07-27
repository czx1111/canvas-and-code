import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Eye, Flame } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useNotesData } from "../contexts/NotesDataContext.jsx";
import { useBlogData } from "../contexts/BlogDataContext.jsx";
import { useViewCounts } from "../hooks/useViewCount.js";

/**
 * PopularPosts — displays top-viewed articles on the home page.
 * Uses the existing Supabase view count system (or localStorage fallback).
 * Shows top 5 articles (both posts and notes) sorted by view count.
 */
export default function PopularPosts() {
  const { lang } = useI18n();
  const { notes } = useNotesData();
  const { posts } = useBlogData();

  // Combine posts and notes into a single list with type info
  const allArticles = useMemo(() => {
    const postList = posts.map((p) => ({ ...p, type: "post" }));
    const noteList = notes.map((n) => ({ ...n, type: "note" }));
    return [...postList, ...noteList];
  }, [posts, notes]);

  const allSlugs = useMemo(() => allArticles.map((a) => a.slug), [allArticles]);
  const { counts: viewCounts, loading } = useViewCounts(allSlugs);

  const popular = useMemo(() => {
    return allArticles
      .map((article) => ({
        ...article,
        viewCount: viewCounts[article.slug] || 0,
      }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .filter((a) => a.viewCount > 0);
  }, [allArticles, viewCounts]);

  // Don't render if no view count data yet
  if (loading || popular.length === 0) return null;

  const getTitle = (article) =>
    lang === "zh" && article.titleZh ? article.titleZh : article.title;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-accent-amber/10 flex items-center justify-center">
          <Flame className="w-4 h-4 text-accent-amber" />
        </div>
        <h2 className="font-display text-2xl text-ink">
          {lang === "zh" ? "热门文章" : "Popular Posts"}
        </h2>
        <span className="text-xs text-muted flex items-center gap-1 ml-1">
          <TrendingUp className="w-3 h-3" />
          {lang === "zh" ? "按浏览量" : "by views"}
        </span>
      </div>

      <div className="rounded-xl border border-hairline bg-surface-soft/40 overflow-hidden">
        {popular.map((article, i) => (
          <Link
            key={`${article.type}-${article.slug}`}
            to={article.type === "post" ? `/post/${article.slug}` : `/note/${article.slug}`}
            className={`group flex items-center gap-4 p-4 hover:bg-surface-soft transition-colors ${
              i !== popular.length - 1 ? "border-b border-hairline/50" : ""
            }`}
          >
            {/* Rank badge */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm font-bold ${
                i === 0
                  ? "bg-accent-amber/15 text-accent-amber"
                  : i === 1
                  ? "bg-primary/10 text-primary"
                  : i === 2
                  ? "bg-accent-teal/10 text-accent-teal"
                  : "bg-surface-soft text-muted"
              }`}
            >
              {i + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-ink group-hover:text-primary transition-colors truncate">
                {getTitle(article)}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {article.type === "post"
                  ? (lang === "zh" ? "博客" : "Blog")
                  : (lang === "zh" ? "随笔" : "Note")}
                {" · "}
                {article.category}
              </p>
            </div>

            {/* View count */}
            <div className="flex items-center gap-1 text-xs text-muted flex-shrink-0">
              <Eye className="w-3 h-3" />
              <span className="font-mono">{article.viewCount}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
