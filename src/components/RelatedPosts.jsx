import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { posts as allPosts } from "../generated/posts-data.js";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * Tokenize text into meaningful keywords for matching.
 * Splits on non-alphanumeric (works for both English and Chinese).
 */
function tokenize(text) {
  if (!text) return [];
  // Split on spaces, punctuation, and also split CJK characters into bi-grams
  const words = text.toLowerCase().split(/[\s,，。、；;：:！!？?（）()【】\[\]""''`'{}|/\\<>]+/).filter((w) => w.length > 1);
  // Also extract CJK bigrams for better Chinese matching
  const cjkBigrams = [];
  const cjkChars = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  if (cjkChars) {
    const cjkStr = cjkChars.join("");
    for (let i = 0; i < cjkStr.length - 1; i++) {
      cjkBigrams.push(cjkStr.substring(i, i + 2));
    }
  }
  return [...words, ...cjkBigrams];
}

/**
 * RelatedPosts — recommends truly related posts based on content similarity.
 *
 * Scoring algorithm:
 *   - Shared category: +5
 *   - Shared title/excerpt keywords: +2 per keyword
 *   - Shared tags (from content analysis): +3 per tag
 *
 * Posts with a score of 0 are NOT shown — only truly related content appears.
 * If no related posts meet the threshold, the section is hidden entirely.
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

    const current = allPosts.find((p) => p.slug === currentSlug);
    if (!current) return [];

    // Build keyword set from current post's title + excerpt + content summary
    const currentText = [
      current.title || "",
      current.titleZh || "",
      current.excerpt || "",
      current.excerptZh || "",
    ].join(" ");

    // Also extract keywords from content (first 500 chars for performance)
    const contentPreview = (current.content || "").substring(0, 500);
    const currentKeywords = new Set([
      ...tokenize(currentText),
      ...tokenize(contentPreview),
    ]);

    const scored = allPosts
      .filter((p) => p.slug !== currentSlug)
      .map((p) => {
        let score = 0;

        // 1. Category match (strong signal)
        if (p.category === category) score += 5;

        // 2. Title keyword overlap
        const pTitleText = [p.title || "", p.titleZh || "", p.excerpt || "", p.excerptZh || ""].join(" ");
        const pTitleTokens = new Set(tokenize(pTitleText));
        let titleOverlap = 0;
        for (const tk of pTitleTokens) {
          if (currentKeywords.has(tk)) titleOverlap++;
        }
        score += titleOverlap * 2;

        // 3. Content keyword overlap (weaker signal, more tokens)
        const pContentPreview = (p.content || "").substring(0, 500);
        const pContentTokens = new Set(tokenize(pContentPreview));
        let contentOverlap = 0;
        for (const ct of pContentTokens) {
          if (currentKeywords.has(ct)) contentOverlap++;
        }
        score += Math.min(contentOverlap, 10); // cap content overlap

        return { post: p, score, titleOverlap };
      })
      .filter((x) => x.score >= 5) // Only show posts with meaningful similarity
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map((x) => x.post);

    return scored;
  }, [currentSlug, category, max]);

  // Don't render if no truly related posts found
  if (!related.length) return null;

  const getTitle = (p) => (lang === "zh" && p.titleZh ? p.titleZh : p.title);

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
