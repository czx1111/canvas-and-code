import { createClient } from "@supabase/supabase-js";

// These values are safe to expose in the frontend (protected by RLS policies).
// Defaults are used when env vars are not set (e.g. local dev without .env).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://bwsoxnloendutloszvam.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_IU9xBssI6XGzLMzk9wn34g_tO_mlreU";

// If credentials are not configured, supabase will be null and the app
// will gracefully fall back to localStorage-based view counting.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Increment the view count for a given slug in the database.
 * Uses an upsert RPC function for atomic increment (avoids race conditions).
 *
 * @param {string} slug
 * @returns {Promise<number>} the new count after incrementing
 */
export async function incrementViewCount(slug) {
  if (!supabase) return 0;

  try {
    const { data, error } = await supabase.rpc("increment_view_count", {
      note_slug: slug,
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
 *
 * @param {string[]} slugs
 * @returns {Promise<Record<string, number>>} map of slug → count
 */
export async function fetchViewCounts(slugs) {
  if (!supabase || !slugs.length) return {};

  try {
    const { data, error } = await supabase
      .from("view_counts")
      .select("slug, count")
      .in("slug", slugs);

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
