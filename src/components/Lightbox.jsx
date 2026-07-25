import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Lightbox — full-screen image viewer with keyboard navigation.
 *
 * @param {object} props
 * @param {Array<{src: string, alt: string}>} props.images — list of images
 * @param {number} props.initialIndex — starting image index
 * @param {function} props.onClose — called when lightbox should close
 */
export default function Lightbox({ images, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex || 0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, next, prev]);

  if (!images || images.length === 0) return null;

  const current = images[index];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={onClose}>
      {/* Close button */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        onClick={onClose}
        title="Close (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous button (only if multiple images) */}
      {images.length > 1 && (
        <button
          className="absolute left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          title="Previous (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <figure className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.src}
          alt={current.alt || ""}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        {current.alt && (
          <figcaption className="mt-3 text-sm text-white/70 text-center max-w-2xl">
            {current.alt}
          </figcaption>
        )}
        {images.length > 1 && (
          <span className="mt-2 text-xs text-white/50">
            {index + 1} / {images.length}
          </span>
        )}
      </figure>

      {/* Next button (only if multiple images) */}
      {images.length > 1 && (
        <button
          className="absolute right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          onClick={(e) => { e.stopPropagation(); next(); }}
          title="Next (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
