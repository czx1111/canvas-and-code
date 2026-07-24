import { Link } from "react-router-dom";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";

export default function PostCard({ post, delay = 0 }) {
  const { lang, t } = useI18n();

  const title = lang === "zh" && post.titleZh ? post.titleZh : post.title;
  const excerpt = lang === "zh" && post.excerptZh ? post.excerptZh : post.excerpt;
  const categoryLabel = t(`common.categories.${post.category}`);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (lang === "zh") return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="animate-fade-in-up h-full" style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
      <Link
        to={`/post/${post.slug}`}
        className="group flex flex-col h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-0.5 bg-surface-soft/60 border border-hairline/50 hover:border-hairline"
      >
        {/* Cover — fixed height */}
        <div className="relative overflow-hidden h-48 flex-shrink-0">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent-teal/10 to-accent-amber/15 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <span className="font-display text-5xl text-primary/30 select-none">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-canvas/90 backdrop-blur-sm text-xs font-medium text-ink">
              <Tag className="w-3 h-3" />
              {categoryLabel}
            </span>
          </div>
        </div>
        {/* Body — flex-1 so all cards in a row are equal height */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-3 text-xs text-muted">
            <time>{formatDate(post.date)}</time>
            <span className="w-1 h-1 rounded-full bg-hairline" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>
          <h3 className="font-display text-ink group-hover:text-primary transition-colors mb-2 leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-body leading-relaxed line-clamp-2 mb-4">
            {excerpt}
          </p>
          {/* Read more — pushed to bottom */}
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
            {t("blog.readMore")}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}
