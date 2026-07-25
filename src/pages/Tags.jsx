import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Hash, ArrowRight, FileText, NotebookPen, Clock } from "lucide-react";
import { posts as allPosts } from "../generated/posts-data.js";
import { notes as allNotes } from "../generated/notes-data.js";
import { useI18n } from "../contexts/I18nContext.jsx";
import { formatDate } from "../lib/date.js";
import { getCategoryLabel as getNoteCategoryLabel } from "../lib/categories.js";
import SEO from "../components/SEO.jsx";

/**
 * Tags — displays all tags as a cloud and lets users filter content by tag.
 * Combines tags from notes and categories from posts.
 */
export default function Tags() {
  const { lang, t } = useI18n();
  const [activeTag, setActiveTag] = useState(null);

  // Build tag map: tag -> [{ type, slug, title, titleZh, date, category, readTime }]
  const { tagMap, sortedTags } = useMemo(() => {
    const map = new Map();

    // Collect from notes
    for (const note of allNotes) {
      if (note.tags) {
        for (const tag of note.tags) {
          if (!map.has(tag)) map.set(tag, []);
          map.get(tag).push({
            type: "note",
            slug: note.slug,
            title: note.title,
            titleZh: note.titleZh,
            date: note.date,
            category: note.category,
            readTime: note.readTime,
          });
        }
      }
    }

    // Collect categories from posts as pseudo-tags
    for (const post of allPosts) {
      if (post.category) {
        if (!map.has(post.category)) map.set(post.category, []);
        map.get(post.category).push({
          type: "post",
          slug: post.slug,
          title: post.title,
          titleZh: post.titleZh,
          date: post.date,
          category: post.category,
          readTime: post.readTime,
        });
      }
    }

    const sorted = Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
    return { tagMap: map, sortedTags: sorted };
  }, []);

  const maxCount = Math.max(...sortedTags.map(([, items]) => items.length), 1);
  const minCount = Math.min(...sortedTags.map(([, items]) => items.length), 1);

  const getTagSize = (count) => {
    const min = 0.8;
    const max = 1.6;
    const ratio = (count - minCount) / Math.max(maxCount - minCount, 1);
    return min + ratio * (max - min);
  };

  const activeItems = activeTag ? tagMap.get(activeTag) || [] : [];

  const getTitle = (item) => (lang === "zh" && item.titleZh ? item.titleZh : item.title);
  const getCategoryLabel = (cat) => {
    const noteLabel = getNoteCategoryLabel(cat, lang);
    if (noteLabel !== cat) return noteLabel;
    const commonLabel = t(`common.categories.${cat}`);
    return commonLabel !== `common.categories.${cat}` ? commonLabel : cat;
  };

  return (
    <div>
      <SEO
        title={lang === "zh" ? "标签" : "Tags"}
        description={lang === "zh" ? "按标签浏览所有文章和随笔" : "Browse all posts and notes by tag"}
      />
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {lang === "zh" ? "标签" : "Tags"}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-3">
          {lang === "zh" ? "标签云" : "Tag Cloud"}
        </h1>
        <p className="text-muted text-lg max-w-lg">
          {lang === "zh" ? "按标签浏览所有内容，发现你感兴趣的主题。" : "Browse all content by tag and discover topics you're interested in."}
        </p>
      </section>

      {/* Tag Cloud */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap gap-3 items-center p-6 rounded-xl border border-hairline bg-surface-soft/40">
          {sortedTags.map(([tag, items]) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all ${
                activeTag === tag
                  ? "bg-primary text-white shadow-sm"
                  : "bg-primary/8 text-primary hover:bg-primary/15"
              }`}
              style={{ fontSize: `${getTagSize(items.length)}rem` }}
            >
              {tag}
              <span className={`text-[0.7em] font-mono ${activeTag === tag ? "text-white/70" : "text-muted"}`}>
                {items.length}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Filtered Results */}
      {activeTag && (
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-ink">
              <span className="text-primary">#{activeTag}</span>
              <span className="text-muted text-base font-normal ml-2">
                {activeItems.length} {lang === "zh" ? "条内容" : "items"}
              </span>
            </h2>
            <button
              onClick={() => setActiveTag(null)}
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              {lang === "zh" ? "清除筛选" : "Clear filter"}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {activeItems
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((item, i) => {
                const path = item.type === "post" ? `/post/${item.slug}` : `/note/${item.slug}`;
                return (
                  <Link
                    key={`${item.type}-${item.slug}`}
                    to={path}
                    className="group animate-fade-in-up flex items-start gap-4 p-5 rounded-xl border border-hairline/50 bg-surface-soft/40 hover:bg-surface-soft hover:border-hairline transition-all hover:shadow-sm"
                    style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {item.type === "post" ? (
                            <FileText className="w-2.5 h-2.5" />
                          ) : (
                            <NotebookPen className="w-2.5 h-2.5" />
                          )}
                          {getCategoryLabel(item.category)}
                        </span>
                        {item.readTime && (
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Clock className="w-3 h-3" />
                            {item.readTime}
                          </span>
                        )}
                        <time className="text-xs text-muted">{formatDate(item.date, lang)}</time>
                      </div>
                      <h3 className="font-display text-lg text-ink group-hover:text-primary transition-colors leading-snug">
                        {getTitle(item)}
                      </h3>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      {/* Hint when no tag selected */}
      {!activeTag && (
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="text-center py-16 rounded-xl border border-dashed border-hairline">
            <Hash className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-muted">
              {lang === "zh" ? "点击上方任意标签，查看相关内容" : "Click any tag above to see related content"}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
