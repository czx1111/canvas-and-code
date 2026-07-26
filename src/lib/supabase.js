import { createClient } from "@supabase/supabase-js";

// These values are safe to expose in the frontend (protected by RLS policies).
// Read exclusively from env vars — do NOT hardcode credentials in source.
// When unset, supabase will be null and the app falls back to localStorage.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// If credentials are not configured, supabase will be null and the app
// will gracefully fall back to localStorage-based view counting.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ── Input validation ─────────────────────────────────────────────────────
// Slug format: alphanumeric, dashes, underscores, max 200 chars.
// This matches the validation in the Supabase RPC function (see supabase/rls_policies.sql).
const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
const MAX_SLUG_LENGTH = 200;
const MAX_VISITOR_ID_LENGTH = 100;

/**
 * Validate a slug before sending it to Supabase.
 * Returns the slug if valid, null if invalid.
 *
 * @param {string} slug
 * @returns {string|null}
 */
function validateSlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  if (slug.length > MAX_SLUG_LENGTH) return null;
  if (!SLUG_REGEX.test(slug)) return null;
  return slug;
}

/**
 * Validate a visitor ID before sending it to Supabase.
 * Allows alphanumeric, dashes — must be non-empty and reasonably short.
 *
 * @param {string} id
 * @returns {string|null}
 */
function validateVisitorId(id) {
  if (!id || typeof id !== "string") return null;
  if (id.length === 0 || id.length > MAX_VISITOR_ID_LENGTH) return null;
  // Allow alphanumeric + dashes (format: timestamp-randomstring)
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return null;
  return id;
}

// ── Client-side rate limiting ─────────────────────────────────────────────
// Prevents rapid-fire requests from inflating view counts.
// Uses a sliding window in localStorage: max 1 increment per slug per 60s.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_KEY = "supabase-rate-limit";

/**
 * Check if a slug can be incremented (rate limit not exceeded).
 * Returns true if allowed, false if rate-limited.
 *
 * @param {string} slug
 * @returns {boolean}
 */
function checkRateLimit(slug) {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const map = raw ? JSON.parse(raw) : {};

    // Clean up expired entries
    for (const key of Object.keys(map)) {
      if (now - map[key] > RATE_LIMIT_WINDOW_MS) {
        delete map[key];
      }
    }

    if (map[slug] && now - map[slug] < RATE_LIMIT_WINDOW_MS) {
      return false; // Rate limited
    }

    map[slug] = now;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(map));
    return true;
  } catch {
    // If localStorage fails, allow the request (don't block functionality)
    return true;
  }
}

/**
 * Increment the view count for a given slug in the database.
 * Uses an upsert RPC function for atomic increment (avoids race conditions).
 *
 * Includes input validation and client-side rate limiting (1 req/slug/60s)
 * to prevent view count manipulation.
 *
 * @param {string} slug
 * @returns {Promise<number>} the new count after incrementing
 */
export async function incrementViewCount(slug) {
  if (!supabase) return 0;

  // Validate slug format before sending to Supabase
  const validSlug = validateSlug(slug);
  if (!validSlug) {
    console.warn("[view-count] Invalid slug rejected:", slug);
    return 0;
  }

  // Client-side rate limit: 1 increment per slug per 60 seconds
  if (!checkRateLimit(validSlug)) {
    return 0;
  }

  try {
    const { data, error } = await supabase.rpc("increment_view_count", {
      note_slug: validSlug,
    });
    if (error) {
      console.warn("[view-count] Supabase RPC error:", error.message);
      return 0;
    }
    return data || 0;
  } catch (err) {
    console.warn("[view-count] Failed to increment:", err.message);
    return 0;
  }
}

/**
 * Fetch view counts for all notes in a single query.
 * Slugs are validated and filtered before querying.
 *
 * @param {string[]} slugs
 * @returns {Promise<Record<string, number>>} map of slug → count
 */
export async function fetchViewCounts(slugs) {
  if (!supabase || !slugs.length) return {};

  // Validate and filter slugs before querying
  const validSlugs = slugs.map(validateSlug).filter(Boolean);
  if (!validSlugs.length) return {};

  try {
    const { data, error } = await supabase
      .from("view_counts")
      .select("slug, count")
      .in("slug", validSlugs);

    if (error) {
      console.warn("[view-count] Supabase query error:", error.message);
      return {};
    }

    const map = {};
    for (const row of data || []) {
      map[row.slug] = row.count;
    }
    return map;
  } catch (err) {
    console.warn("[view-count] Failed to fetch counts:", err.message);
    return {};
  }
}

// ── Site-wide stats (visitors + total views) ────────────

const VISITOR_KEY = "site-visitor-id";

function getOrCreateVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (id && validateVisitorId(id)) {
      return id;
    }
    // Generate a new safe visitor ID (timestamp + random alphanumeric)
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/**
 * Register a site visit (unique per browser).
 * Inserts a row into site_visits if this visitor hasn't been seen before.
 *
 * @returns {Promise<void>}
 */
export async function registerSiteVisit() {
  if (!supabase) return;

  try {
    const visitorId = validateVisitorId(getOrCreateVisitorId());
    if (!visitorId) return;
    const { error } = await supabase.from("site_visits").upsert(
      { visitor_id: visitorId },
      { onConflict: "visitor_id", ignoreDuplicates: true }
    );
    if (error) {
      console.warn("[site-stats] Visit upsert error:", error.message);
    }
  } catch (err) {
    console.warn("[site-stats] Failed to register visit:", err.message);
  }
}

/**
 * Fetch total unique visitors and total page views.
 *
 * @returns {Promise<{ visitors: number, totalViews: number }>}
 */
export async function fetchSiteStats() {
  if (!supabase) return { visitors: 0, totalViews: 0 };

  try {
    // Count unique visitors
    const { count: visitors, error: vErr } = await supabase
      .from("site_visits")
      .select("*", { count: "exact", head: true });

    if (vErr) console.warn("[site-stats] visitors error:", vErr.message);

    // Sum total views from view_counts
    const { data: vcData, error: vcErr } = await supabase
      .from("view_counts")
      .select("count");

    let totalViews = 0;
    if (vcErr) {
      console.warn("[site-stats] views error:", vcErr.message);
    } else if (vcData) {
      totalViews = vcData.reduce((sum, row) => sum + (row.count || 0), 0);
    }

    return { visitors: visitors || 0, totalViews };
  } catch (err) {
    console.warn("[site-stats] Failed to fetch:", err.message);
    return { visitors: 0, totalViews: 0 };
  }
}
