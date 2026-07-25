import { useMemo } from "react";
import { Link } from "react-router-dom";
import { posts as allPosts } from "../generated/posts-data.js";
import { notes as allNotes } from "../generated/notes-data.js";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * TagCloud — displays all tags across posts and notes as a cloud.
 * Tag font size is proportional to usage count.
 *
 * @param {object} props
 * @param {string} [props.basePath="/blog"] — base path for tag filter links
 * @param {number} [props.minSize=0.75] — minimum font size in rem
 * @param {number} [props.maxSize=1.5] — maximum font size in rem
 */
export default function TagCloud({ basePath = "/blog", minSize = 0.75, maxSize = 1.5 }) {
  const { lang } = useI18n();

  const tags = useMemo(() => {
    const counts = new Map();

    // Count tags from notes (posts don't have tags currently)
    for (const note of allNotes) {
      if (note.tags) {
        for (const tag of note.tags) {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      }
    }

    // Also count categories from posts as pseudo-tags
    for (const post of allPosts) {
      if (post.category) {
        counts.set(post.category, (counts.get(post.category) || 0) + 1);
      }
    }

    const max = Math.max(...counts.values(), 1);
    const min = Math.min(...counts.values(), 0);

    return Array.from(counts.entries())
      .map(([tag, count]) => ({
        tag,
        count,
        size: minSize + ((count - min) / Math.max(max - min, 1)) * (maxSize - minSize),
      }))
      .sort((a, b) => b.count - a.count);
  }, [minSize, maxSize]);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map(({ tag, count, size }) => (
        <Link
          key={tag}
          to={`${basePath}?tag=${encodeURIComponent(tag)}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 text-primary hover:bg-primary/15 transition-colors"
          style={{ fontSize: `${size}rem` }}
        >
          {tag}
          <span className="text-[0.7em] text-muted font-mono">{count}</span>
        </Link>
      ))}
    </div>
  );
}
