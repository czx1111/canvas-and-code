import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "reading-history";
const MAX_ITEMS = 20;

/**
 * useReadingHistory — tracks recently viewed posts/notes in localStorage.
 *
 * Stores { slug, type, title, date, viewedAt } entries.
 * Provides functions to add, clear, and retrieve history.
 */
export function useReadingHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const addEntry = useCallback((entry) => {
    setHistory((prev) => {
      // Remove existing entry with same slug+type
      const filtered = prev.filter(
        (h) => !(h.slug === entry.slug && h.type === entry.type)
      );
      const next = [{ ...entry, viewedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { history, addEntry, clearHistory };
}
