import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * PostNav — previous / next article navigation shown at the bottom of posts/notes.
 *
 * @param {object} prev — { slug, title, titleZh } or null
 * @param {object} next — { slug, title, titleZh } or null
 * @param {string} basePath — "/post" or "/note" (default: "/post")
 */
export default function PostNav({ prev, next, basePath = "/post" }) {
  const { lang, t } = useI18n();

  if (!prev && !next) return null;

  const getLabel = (item) => {
    if (!item) return "";
    return lang === "zh" && item.titleZh ? item.titleZh : item.title;
  };

  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <Link
          to={`${basePath}/${prev.slug}`}
          className="group flex flex-col p-4 rounded-xl border border-hairline bg-surface-soft/40 hover:bg-surface-soft hover:border-hairline transition-all hover:shadow-sm"
        >
          <span className="flex items-center gap-1 text-xs text-muted mb-2">
            <ArrowLeft className="w-3 h-3" />
            {t("post.prevPost")}
          </span>
          <span className="font-display text-sm text-ink group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {getLabel(prev)}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {next ? (
        <Link
          to={`${basePath}/${next.slug}`}
          className="group flex flex-col p-4 rounded-xl border border-hairline bg-surface-soft/40 hover:bg-surface-soft hover:border-hairline transition-all hover:shadow-sm text-right"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-muted mb-2">
            {t("post.nextPost")}
            <ArrowRight className="w-3 h-3" />
          </span>
          <span className="font-display text-sm text-ink group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {getLabel(next)}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
