import { useState, useEffect } from "react";

const STORAGE_PREFIX = "view-count-";

/**
 * useViewCount — a localStorage-based view counter for static sites.
 *
 * On mount, it reads the current count from localStorage and increments it by 1.
 * Returns the count after incrementing.
 *
 * Note: This tracks views per-browser (local), not global unique views,
 * since the site is a static SPA on GitHub Pages with no backend.
 *
 * @param {string} key — unique identifier (e.g., note slug)
 * @returns {{ count: number, loading: boolean }}
 */
export function useViewCount(key) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }

    const storageKey = `${STORAGE_PREFIX}${key}`;
    let current = 0;

    try {
      const stored = localStorage.getItem(storageKey);
      current = stored ? parseInt(stored, 10) || 0 : 0;
      current += 1;
      localStorage.setItem(storageKey, String(current));
    } catch {
      // localStorage may be unavailable (private mode, etc.)
      current = 1;
    }

    setCount(current);
    setLoading(false);
  }, [key]);

  return { count, loading };
}

/**
 * getViewCount — read-only helper to get the current view count without incrementing.
 * Used in list views where we just want to display, not increment.
 *
 * @param {string} key — unique identifier (e.g., note slug)
 * @returns {number}
 */
export function getViewCount(key) {
  if (!key) return 0;
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return stored ? parseInt(stored, 10) || 0 : 0;
  } catch {
    return 0;
  }
}
