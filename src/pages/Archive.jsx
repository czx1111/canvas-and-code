import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { posts as allPosts } from "../generated/posts-data.js";
import { notes as allNotes } from "../generated/notes-data.js";
import Timeline from "../components/Timeline.jsx";
import SEO from "../components/SEO.jsx";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * Archive — displays all posts and notes in a timeline view,
 * with a filter toggle between posts / notes / all.
 */
export default function Archive() {
  const { lang, t } = useI18n();
  const [filter, setFilter] = useState("all");

  const items = useMemo(() => {
    const postItems = allPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      titleZh: p.titleZh,
      date: p.date,
      category: p.category,
      type: "post",
    }));
    const noteItems = allNotes.map((n) => ({
      slug: n.slug,
      title: n.title,
      titleZh: n.titleZh,
      date: n.date,
      category: n.category,
      type: "note",
    }));

    let combined = [...postItems, ...noteItems];
    if (filter === "posts") combined = postItems;
    if (filter === "notes") combined = noteItems;

    return combined.filter((i) => i.date);
  }, [filter]);

  const filters = [
    { key: "all", label: lang === "zh" ? "全部" : "All" },
    { key: "posts", label: t("nav.blog") },
    { key: "notes", label: t("nav.notes") },
  ];

  return (
    <>
      <SEO
        title={lang === "zh" ? "归档" : "Archive"}
        description={lang === "zh" ? "所有文章和随笔的时间线归档" : "Timeline archive of all posts and notes"}
      />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
          {lang === "zh" ? "归档" : "Archive"}
        </h1>
        <p className="text-muted text-sm mb-8">
          {lang === "zh" ? "按时间浏览所有内容" : "Browse all content by date"}
        </p>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-8">
          <Filter className="w-4 h-4 text-muted" />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-canvas"
                  : "bg-surface-soft text-muted hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {items.length > 0 ? (
          <Timeline items={items} />
        ) : (
          <p className="text-muted text-center py-12">
            {lang === "zh" ? "暂无内容" : "No content yet"}
          </p>
        )}
      </div>
    </>
  );
}
