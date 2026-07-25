import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, List } from "lucide-react";
import { posts as allPosts } from "../generated/posts-data.js";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * PostSeries — displays a series navigation box for posts that belong to a series.
 *
 * Shows the series title, all posts in the series in order,
 * and highlights the current post.
 *
 * @param {object} props
 * @param {string} props.seriesId — the series identifier from frontmatter
 * @param {string} props.currentSlug — slug of the current post
 */
export default function PostSeries({ seriesId, currentSlug }) {
  const { lang } = useI18n();

  const seriesPosts = useMemo(() => {
    if (!seriesId) return [];
    return allPosts
      .filter((p) => p.series === seriesId)
      .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
  }, [seriesId]);

  if (seriesPosts.length <= 1) return null;

  const currentIndex = seriesPosts.findIndex((p) => p.slug === currentSlug);
  const getTitle = (p) => lang === "zh" && p.titleZh ? p.titleZh : p.title;

  return (
    <div className="my-8 rounded-lg border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <List className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-ink">
          {lang === "zh" ? "系列文章" : "Series"}
        </h3>
        <span className="text-xs text-muted">
          ({currentIndex + 1}/{seriesPosts.length})
        </span>
      </div>
      <ol className="space-y-1">
        {seriesPosts.map((post, i) => {
          const isCurrent = post.slug === currentSlug;
          return (
            <li key={post.slug}>
              <Link
                to={`/post/${post.slug}`}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-body hover:bg-surface-soft"
                }`}
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full border border-hairline flex items-center justify-center text-[10px] font-mono">
                  {i + 1}
                </span>
                <span className="text-sm flex-1 truncate">{getTitle(post)}</span>
                {isCurrent && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
