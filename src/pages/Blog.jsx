import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useBlogData } from "../contexts/BlogDataContext.jsx";
import PostCard from "../components/PostCard.jsx";

export default function Blog() {
  const { t, lang } = useI18n();
  const { posts } = useBlogData();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
    }
  }, [location.state]);

  const categories = ["All", "Engineering", "Design", "Thoughts"];

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.titleZh && p.titleZh.includes(q)) ||
          (p.excerptZh && p.excerptZh.includes(q))
      );
    }
    return result;
  }, [posts, activeCategory, searchQuery]);

  const categoryLabel = (cat) => {
    if (cat === "All") return t("blog.all");
    return t(`common.categories.${cat}`);
  };

  return (
    <div>
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-3">
          {t("blog.title")}
        </h1>
        <p className="text-muted text-lg max-w-lg">{t("blog.subtitle")}</p>
      </section>

      {/* Filter + Search */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-soft border border-hairline">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
              placeholder={t("blog.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-hairline bg-white text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64"
            />
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <PostCard key={post.slug} post={post} delay={i * 100} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink mb-2">{t("blog.noResults")}</p>
            <p className="text-muted">{t("blog.noResultsDesc")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
