import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useNotesData } from "../contexts/NotesDataContext.jsx";
import { formatDate } from "../lib/date.js";
import { useViewCount } from "../hooks/useViewCount.js";
import ArticleLayout from "../components/ArticleLayout.jsx";
import SEO from "../components/SEO.jsx";
import { useReadingHistory } from "../hooks/useReadingHistory.js";
import { getCategoryLabel, getCategoryConfig } from "../lib/categories.js";

export default function NoteDetail() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const { notes } = useNotesData();

  const note = notes.find((n) => n.slug === slug);
  const currentIndex = notes.findIndex((n) => n.slug === slug);
  const prevNote = currentIndex > 0 ? notes[currentIndex - 1] : null;
  const nextNote = currentIndex >= 0 && currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;
  const { count: viewCount } = useViewCount(note ? slug : null);
  const { addEntry } = useReadingHistory();

  // Track reading history
  useEffect(() => {
    if (note) {
      addEntry({
        slug: note.slug,
        type: "note",
        title: lang === "zh" && note.titleZh ? note.titleZh : note.title,
        date: note.date,
      });
    }
  }, [note, addEntry, lang]);

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
  const catLabel = getCategoryLabel(note.category, lang);
  const catConfig = getCategoryConfig(note.category);
  const CatIcon = catConfig.icon;

  const header = (
    <header className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
          {CatIcon && <CatIcon className="w-3 h-3" />}
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
        <time className="text-xs text-muted">{formatDate(note.date, lang)}</time>
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
  );

  const articleFooter = (
    <Link
      to="/notes"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-active transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {t("notes.backToNotes")}
    </Link>
  );

  return (
    <ArticleLayout
      backTo="/notes"
      backLabel={t("notes.backToNotes")}
      header={header}
      content={content}
      footer={articleFooter}
      prev={prevNote}
      next={nextNote}
      basePath="/note"
      currentSlug={note.slug}
      category={note.category}
    >
      <SEO title={title} ogType="article" />
    </ArticleLayout>
  );
}
