import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, Tag, ArrowRight, BookOpen, Eye } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useNotesData } from "../contexts/NotesDataContext.jsx";
import { useViewCounts } from "../hooks/useViewCount.js";

export default function Notes() {
  const { t, lang } = useI18n();
  const { notes, noteCategories } = useNotesData();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Build category list: ["All", ...from data, ...custom if missing]
  const customCats = ["Frontend", "Backend", "Algorithm", "Database", "Network", "Tools", "OS", "Other"];
  const allCats = ["All", ...new Set([...noteCategories, ...customCats])];

  const filtered = useMemo(() => {
    let result = notes;
    if (activeCategory !== "All") {
      result = result.filter((n) => n.category === activeCategory);
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
  }, [notes, activeCategory, searchQuery]);

  const categoryLabel = (cat) => {
    if (cat === "All") return t("notes.all");
    return t(`notes.categories.${cat}`) !== `notes.categories.${cat}`
      ? t(`notes.categories.${cat}`)
      : cat;
  };

  // Batch fetch view counts for all notes
  const allSlugs = useMemo(() => notes.map((n) => n.slug), [notes]);
  const { counts: viewCounts } = useViewCounts(allSlugs);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (lang === "zh") return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-surface-soft border border-hairline">
            {allCats.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={t("notes.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-hairline bg-white text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64"
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
                      <time className="text-xs text-muted">{formatDate(note.date)}</time>
                    </div>
                    <h3 className="font-display text-lg text-ink group-hover:text-primary transition-colors mb-2 leading-snug">
                      {title}
                    </h3>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-xs text-muted bg-surface-card"
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
