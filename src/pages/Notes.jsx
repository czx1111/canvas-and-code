import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, Tag, ArrowRight, BookOpen, Eye } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useNotesData } from "../contexts/NotesDataContext.jsx";
import { formatDate } from "../lib/date.js";
import { useViewCounts } from "../hooks/useViewCount.js";
import SEO from "../components/SEO.jsx";

export default function Notes() {
  const { t, lang } = useI18n();
  const { notes, noteCategories } = useNotesData();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);

  // Build category list: ["All", ...from data, ...custom if missing]
  const customCats = ["Frontend", "Backend", "Algorithm", "Database", "Network", "Tools", "OS", "Other"];
  const allCats = ["All", ...new Set([...noteCategories, ...customCats])];

  const filtered = useMemo(() => {
    let result = notes;
    if (activeCategory !== "All") {
      result = result.filter((n) => n.category === activeCategory);
    }
    if (activeTag) {
      result = result.filter((n) => n.tags.includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.titleZh && n.titleZh.includes(q)) ||
          n.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [notes, activeCategory, activeTag, searchQuery]);

  const categoryLabel = (cat) => {
    if (cat === "All") return t("notes.all");
    return t(`notes.categories.${cat}`) !== `notes.categories.${cat}`
      ? t(`notes.categories.${cat}`)
      : cat;
  };

  // Batch fetch view counts for all notes
  const allSlugs = useMemo(() => notes.map((n) => n.slug), [notes]);
  const { counts: viewCounts } = useViewCounts(allSlugs);

  return (
    <div>
      <SEO title={t("notes.title")} description={t("notes.subtitle")} />
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {lang === "zh" ? "随笔" : "Notes"}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-3">
          {t("notes.title")}
        </h1>
        <p className="text-muted text-lg max-w-lg">{t("notes.subtitle")}</p>
      </section>

      {/* Filter + Search */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        {activeTag && (
          <div className="mb-3 flex items-center gap-2 text-sm text-muted">
            <span>{lang === "zh" ? "标签筛选:" : "Tag filter:"}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
              #{activeTag}
              <button
                onClick={() => setActiveTag(null)}
                className="hover:text-primary-active ml-0.5"
              >
                ✕
              </button>
            </span>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2">
            {allCats.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "bg-surface-soft text-muted hover:text-ink border border-hairline"
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={t("notes.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-hairline bg-surface-soft text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
      </section>

      {/* Notes List */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((note, i) => {
              const title = lang === "zh" && note.titleZh ? note.titleZh : note.title;
              const catLabel = t(`notes.categories.${note.category}`) !== `notes.categories.${note.category}`
                ? t(`notes.categories.${note.category}`)
                : note.category;
              return (
                <Link
                  key={note.slug}
                  to={`/note/${note.slug}`}
                  className="group animate-fade-in-up flex items-start gap-4 p-5 rounded-xl border border-hairline/50 bg-surface-soft/40 hover:bg-surface-soft hover:border-hairline transition-all hover:shadow-sm"
                  style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
                >
                  {/* Left: content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                        <Tag className="w-2.5 h-2.5" />
                        {catLabel}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Clock className="w-3 h-3" />
                        {note.readTime}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Eye className="w-3 h-3" />
                        {viewCounts[note.slug] || 0} {lang === "zh" ? "阅读" : "views"}
                      </span>
                      <time className="text-xs text-muted">{formatDate(note.date, lang)}</time>
                    </div>
                    <h3 className="font-display text-lg text-ink group-hover:text-primary transition-colors mb-2 leading-snug">
                      {title}
                    </h3>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveTag(activeTag === tag ? null : tag);
                            }}
                            className={`px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                              activeTag === tag
                                ? "bg-primary/20 text-primary font-medium"
                                : "text-muted bg-surface-card hover:bg-primary/10 hover:text-primary"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Right: arrow */}
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink mb-2">{t("notes.noResults")}</p>
            <p className="text-muted">{t("notes.noResultsDesc")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
