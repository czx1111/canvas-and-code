import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

/**
 * ScrollToTop — a floating button that appears after scrolling down
 * and smoothly scrolls back to the top when clicked.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="scroll-to-top fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary-active transition-all duration-300 hover:scale-110"
      title="Back to top"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
