import { useState, useEffect, useCallback } from "react";
import {
  isSupabaseConfigured,
  incrementViewCount,
  fetchViewCounts,
} from "../lib/supabase.js";

const STORAGE_PREFIX = "view-count-";

// ── localStorage helpers (fallback) ─────────────────────

function localGet(key) {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return stored ? parseInt(stored, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function localIncrement(key) {
  try {
    const current = localGet(key) + 1;
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(current));
    return current;
  } catch {
    return 1;
  }
}

// ── useViewCount hook ───────────────────────────────────

/**
 * useViewCount — tracks view counts via Supabase (or localStorage fallback).
 *
 * On mount, it increments the view count for the given key.
 * Returns the count after incrementing.
 *
 * @param {string|null} key — unique identifier (e.g., note slug)
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

    let cancelled = false;

    async function run() {
      if (isSupabaseConfigured) {
        const newCount = await incrementViewCount(key);
        if (!cancelled) {
          setCount(newCount);
          setLoading(false);
        }
      } else {
        // Fallback to localStorage
        const newCount = localIncrement(key);
        if (!cancelled) {
          setCount(newCount);
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { count, loading };
}

// ── useViewCounts hook (batch fetch for lists) ─────────

/**
 * useViewCounts — batch fetch view counts for multiple slugs.
 * Used in list views where we display counts without incrementing.
 *
 * @param {string[]} slugs
 * @returns {{ counts: Record<string, number>, loading: boolean }}
 */
export function useViewCounts(slugs) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (isSupabaseConfigured) {
        const map = await fetchViewCounts(slugs);
        if (!cancelled) {
          setCounts(map);
          setLoading(false);
        }
      } else {
        // Fallback: read from localStorage
        const map = {};
        for (const slug of slugs) {
          map[slug] = localGet(slug);
        }
        if (!cancelled) {
          setCounts(map);
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);

  return { counts, loading };
}

// ── Legacy read-only helper (still used for simple cases) ──

export function getViewCount(key) {
  return localGet(key);
}
