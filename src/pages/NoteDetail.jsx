import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag, Eye } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useNotesData } from "../contexts/NotesDataContext.jsx";
import { useViewCount } from "../hooks/useViewCount.js";
import PostContent from "../components/PostContent.jsx";
import TableOfContents from "../components/TableOfContents.jsx";
import ReadingProgress from "../components/ReadingProgress.jsx";
import PostNav from "../components/PostNav.jsx";

export default function NoteDetail() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const { notes } = useNotesData();
  const [copied, setCopied] = useState(false);

  const note = notes.find((n) => n.slug === slug);
  const currentIndex = notes.findIndex((n) => n.slug === slug);
  const prevNote = currentIndex > 0 ? notes[currentIndex - 1] : null;
  const nextNote = currentIndex >= 0 && currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;
  const { count: viewCount } = useViewCount(note ? slug : null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!note) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl text-ink mb-2">404</p>
        <p className="text-muted mb-8">
          {lang === "zh" ? "未找到这篇随笔。" : "Note not found."}
        </p>
        <Link
          to="/notes"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-active transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("notes.backToNotes")}
        </Link>
      </div>
    );
  }

  const title = lang === "zh" && note.titleZh ? note.titleZh : note.title;
  const content = lang === "zh" && note.contentZh ? note.contentZh : note.content;
  const catLabel =
    t(`notes.categories.${note.category}`) !== `notes.categories.${note.category}`
      ? t(`notes.categories.${note.category}`)
      : note.category;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (lang === "zh") return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <ReadingProgress />
      <div className="flex gap-10">
      <article className="flex-1 min-w-0 max-w-3xl mx-auto xl:mx-0">
      {/* Back link */}
      <Link
        to="/notes"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("notes.backToNotes")}
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
            <Tag className="w-3 h-3" />
            {catLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3 h-3" />
            {note.readTime}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Eye className="w-3 h-3" />
            {viewCount} {lang === "zh" ? "次阅读" : "views"}
          </span>
          <time className="text-xs text-muted">{formatDate(note.date)}</time>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight tracking-tight mb-4">
          {title}
        </h1>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded text-xs text-muted bg-surface-soft border border-hairline"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <TableOfContents content={content} variant="mobile" />
      <PostContent content={content} />

      {/* Footer — back to notes */}
      <footer className="mt-12 pt-8 border-t border-hairline">
        <Link
          to="/notes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-active transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("notes.backToNotes")}
        </Link>
      </footer>

      {/* Prev / Next */}
      <div className="mt-8">
        <PostNav prev={prevNote} next={nextNote} basePath="/note" />
      </div>
      </article>
      <aside className="hidden xl:block w-56 flex-shrink-0">
        <TableOfContents content={content} variant="desktop" />
      </aside>
      </div>
    </div>
  );
}
