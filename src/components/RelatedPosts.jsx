import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { posts as allPosts } from "../generated/posts-data.js";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * RelatedPosts — recommends related posts based on shared category or title keywords.
 *
 * @param {object} props
 * @param {string} props.currentSlug — slug of the current post (to exclude it)
 * @param {string} props.category — category to match
 * @param {number} [props.max=3] — max number of related posts to show
 */
export default function RelatedPosts({ currentSlug, category, max = 3 }) {
  const { lang, t } = useI18n();

  const related = useMemo(() => {
    if (!allPosts.length) return [];

    // Score each post by shared category + title keyword overlap
    const current = allPosts.find((p) => p.slug === currentSlug);
    const currentTitleWords = current
      ? (current.title || "").toLowerCase().split(/\s+/).filter((w) => w.length > 2)
      : [];

    const scored = allPosts
      .filter((p) => p.slug !== currentSlug)
      .map((p) => {
        let score = 0;
        if (p.category === category) score += 5;
        const titleWords = (p.title || "").toLowerCase().split(/\s+/).filter((w) => w.length > 2);
        const overlap = titleWords.filter((w) => currentTitleWords.includes(w)).length;
        score += overlap * 2;
        return { post: p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map((x) => x.post);

    // If not enough scored posts, fill with same-category posts
    if (scored.length < max) {
      const fillers = allPosts
        .filter((p) => p.slug !== currentSlug && !scored.find((s) => s.slug === p.slug))
        .filter((p) => p.category === category)
        .slice(0, max - scored.length);
      scored.push(...fillers);
    }

    // If still not enough, fill with most recent
    if (scored.length < max) {
      const fillers = allPosts
        .filter((p) => p.slug !== currentSlug && !scored.find((s) => s.slug === p.slug))
        .slice(0, max - scored.length);
      scored.push(...fillers);
    }

    return scored;
  }, [currentSlug, category, max]);

  if (!related.length) return null;

  const getTitle = (p) => lang === "zh" && p.titleZh ? p.titleZh : p.title;

  return (
    <div className="mt-12">
      <h3 className="font-display text-lg font-semibold text-ink mb-4">
        {lang === "zh" ? "相关文章" : "Related Posts"}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((post) => (
          <Link
            key={post.slug}
            to={`/post/${post.slug}`}
            className="group block rounded-lg border border-hairline bg-surface-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 text-xs text-muted mb-2">
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                {t(`common.categories.${post.category}`) || post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.date}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-ink leading-snug group-hover:text-primary transition-colors">
              {getTitle(post)}
            </h4>
            {post.excerpt && (
              <p className="mt-1.5 text-xs text-muted line-clamp-2">
                {lang === "zh" && post.excerptZh ? post.excerptZh : post.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
