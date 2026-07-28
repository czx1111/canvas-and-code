import { useEffect, useRef, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import {
  getProgress,
  saveProgress,
  PROGRESS_MIN,
  PROGRESS_MAX,
} from "../hooks/useReadingProgress.js";

/**
 * ResumeReading — two jobs for article pages (posts + notes):
 *
 * 1. Continuously saves scroll progress for the current article (throttled).
 * 2. On entry, if a previous session left off mid-article, shows a small
 *    floating pill offering to jump back to that position.
 *
 * @param {object} props
 * @param {"post"|"note"} props.type
 * @param {string} props.slug
 */
export default function ResumeReading({ type, slug }) {
  const { lang } = useI18n();
  const [saved, setSaved] = useState(null);
  const throttleRef = useRef(null);

  useEffect(() => {
    if (!slug) return;

    // Offer resume if there's an unfinished previous read
    const prev = getProgress(type, slug);
    if (prev && prev.progress > PROGRESS_MIN && prev.progress < PROGRESS_MAX) {
      setSaved(prev);
    } else {
      setSaved(null);
    }

    const onScroll = () => {
      if (throttleRef.current) return;
      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        if (max > 0) saveProgress(type, slug, el.scrollTop / max);
      }, 500);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
        throttleRef.current = null;
      }
    };
  }, [type, slug]);

  if (!saved) return null;

  const pct = Math.round(saved.progress * 100);

  const resume = () => {
    const el = document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    window.scrollTo({ top: saved.progress * max, behavior: "smooth" });
    setSaved(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-4 pr-2 py-2 rounded-full border border-hairline bg-canvas shadow-lg animate-fade-in-up">
      <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="text-sm text-body whitespace-nowrap">
        {lang === "zh" ? `上次读到 ${pct}%` : `You left off at ${pct}%`}
      </span>
      <button
        onClick={resume}
        className="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary-active transition-colors"
      >
        {lang === "zh" ? "继续" : "Resume"}
      </button>
      <button
        onClick={() => setSaved(null)}
        className="p-1 rounded-full text-muted hover:text-ink transition-colors"
        title={lang === "zh" ? "忽略" : "Dismiss"}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
