import { useEffect, useRef } from "react";

/**
 * useKeyboardShortcuts — global keyboard shortcut handler.
 *
 * Registers a set of shortcuts:
 * - Cmd/Ctrl + K  → open search modal
 * - Cmd/Ctrl + ,  → toggle dark/light theme
 * - g h           → go to home
 * - g b           → go to blog
 * - g n           → go to notes
 * - g a           → go to about
 *
 * @param {object} handlers
 * @param {function} handlers.onOpenSearch — called when Cmd/Ctrl+K is pressed
 * @param {function} [handlers.onToggleTheme] — called when Cmd/Ctrl+, is pressed
 * @param {function} [handlers.onNavigate] — called with a route path for g+key combos
 */
export function useKeyboardShortcuts({ onOpenSearch, onToggleTheme, onNavigate }) {
  const handlerRef = useRef({ onOpenSearch, onToggleTheme, onNavigate });
  handlerRef.current = { onOpenSearch, onToggleTheme, onNavigate };

  useEffect(() => {
    let gPressed = false;
    let gTimer = null;

    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K → search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handlerRef.current.onOpenSearch?.();
        return;
      }

      // Cmd/Ctrl + , → toggle theme
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        handlerRef.current.onToggleTheme?.();
        return;
      }

      // g + key navigation (only when not typing in an input)
      const tag = e.target?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || e.target?.isContentEditable;

      if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "g" && !gPressed) {
          gPressed = true;
          clearTimeout(gTimer);
          gTimer = setTimeout(() => { gPressed = false; }, 800);
          return;
        }

        if (gPressed) {
          const routeMap = {
            h: "/",
            b: "/blog",
            n: "/notes",
            a: "/about",
          };
          const route = routeMap[e.key.toLowerCase()];
          if (route) {
            e.preventDefault();
            handlerRef.current.onNavigate?.(route);
          }
          gPressed = false;
          clearTimeout(gTimer);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(gTimer);
    };
  }, []);
}
