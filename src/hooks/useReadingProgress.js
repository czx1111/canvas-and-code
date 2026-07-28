const STORAGE_KEY = "reading-progress";
const MAX_ENTRIES = 50;

// A document counts as "in progress" only within this range:
// below MIN the reader barely started, above MAX it counts as finished.
export const PROGRESS_MIN = 0.05;
export const PROGRESS_MAX = 0.97;

/**
 * useReadingProgress — persists per-article scroll progress in localStorage.
 *
 * Storage shape: { "post:my-slug": { progress: 0..1, updatedAt: ISO } }
 * Fully data-driven: any post/note slug works automatically, no setup needed.
 */

function readMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map && typeof map === "object" ? map : {};
  } catch {
    return {};
  }
}

function writeMap(map) {
  try {
    // Prune oldest entries to keep the map bounded
    const entries = Object.entries(map);
    if (entries.length > MAX_ENTRIES) {
      entries.sort((a, b) => new Date(b[1].updatedAt) - new Date(a[1].updatedAt));
      map = Object.fromEntries(entries.slice(0, MAX_ENTRIES));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

function keyOf(type, slug) {
  return `${type}:${slug}`;
}

/** Get saved progress for one article, or null. */
export function getProgress(type, slug) {
  return readMap()[keyOf(type, slug)] || null;
}

/** Save progress (0..1) for one article. */
export function saveProgress(type, slug, progress) {
  const map = readMap();
  map[keyOf(type, slug)] = {
    progress: Math.min(1, Math.max(0, progress)),
    updatedAt: new Date().toISOString(),
  };
  writeMap(map);
}

/** Remove an article's saved progress (e.g. after finishing). */
export function clearProgress(type, slug) {
  const map = readMap();
  delete map[keyOf(type, slug)];
  writeMap(map);
}

/**
 * Find the most recently updated article still "in progress".
 * Returns { type, slug, progress, updatedAt } or null.
 */
export function getMostRecentInProgress() {
  const map = readMap();
  let best = null;
  for (const [key, val] of Object.entries(map)) {
    if (!val || typeof val.progress !== "number") continue;
    if (val.progress <= PROGRESS_MIN || val.progress >= PROGRESS_MAX) continue;
    if (!best || new Date(val.updatedAt) > new Date(best.updatedAt)) {
      best = { key, ...val };
    }
  }
  if (!best) return null;
  const sep = best.key.indexOf(":");
  return {
    type: best.key.slice(0, sep),
    slug: best.key.slice(sep + 1),
    progress: best.progress,
    updatedAt: best.updatedAt,
  };
}
