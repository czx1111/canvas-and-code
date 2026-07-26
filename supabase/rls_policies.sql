-- ============================================================================
-- Supabase RLS Security Policies — Canvas & Code Blog
-- ============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard → SQL Editor).
-- This script is idempotent — safe to run multiple times.
-- ============================================================================

-- ── 1. Enable Row Level Security ──────────────────────────────────────────

ALTER TABLE view_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- ── 2. view_counts policies ───────────────────────────────────────────────
-- anon role can only READ view counts. All writes go through the
-- increment_view_count RPC function (SECURITY DEFINER), which bypasses RLS.

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "view_counts_select_all" ON view_counts;
DROP POLICY IF EXISTS "view_counts_insert_anon" ON view_counts;
DROP POLICY IF EXISTS "view_counts_update_anon" ON view_counts;
DROP POLICY IF EXISTS "view_counts_delete_anon" ON view_counts;

-- Allow everyone (including anon) to read view counts
CREATE POLICY "view_counts_select_all"
  ON view_counts
  FOR SELECT
  USING (true);

-- Explicitly DENY insert/update/delete via RLS for anon
-- (No policy = denied by default when RLS is enabled, but we add
--  these for clarity and documentation)
CREATE POLICY "view_counts_insert_anon"
  ON view_counts
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "view_counts_update_anon"
  ON view_counts
  FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "view_counts_delete_anon"
  ON view_counts
  FOR DELETE
  TO anon
  USING (false);

-- ── 3. site_visits policies ───────────────────────────────────────────────
-- anon role can INSERT (upsert) their own visitor_id and SELECT count.
-- Cannot UPDATE or DELETE existing rows.

DROP POLICY IF EXISTS "site_visits_select_all" ON site_visits;
DROP POLICY IF EXISTS "site_visits_insert_anon" ON site_visits;
DROP POLICY IF EXISTS "site_visits_update_anon" ON site_visits;
DROP POLICY IF EXISTS "site_visits_delete_anon" ON site_visits;

-- Allow everyone to read site_visits (needed for count queries)
CREATE POLICY "site_visits_select_all"
  ON site_visits
  FOR SELECT
  USING (true);

-- Allow anon to insert their own visitor_id (for upsert on first visit)
CREATE POLICY "site_visits_insert_anon"
  ON site_visits
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Deny update and delete for anon
CREATE POLICY "site_visits_update_anon"
  ON site_visits
  FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "site_visits_delete_anon"
  ON site_visits
  FOR DELETE
  TO anon
  USING (false);

-- ── 4. Revoke direct table permissions from anon ─────────────────────────
-- Even with RLS, explicitly revoke dangerous permissions as defense-in-depth.

REVOKE UPDATE, DELETE ON view_counts FROM anon;
REVOKE UPDATE, DELETE ON site_visits FROM anon;

-- ── 5. Harden the increment_view_count RPC function ───────────────────────
-- Recreate as SECURITY DEFINER with input validation.
-- This function runs with the owner's privileges, bypassing RLS,
-- so input validation is critical.

DROP FUNCTION IF EXISTS increment_view_count(p_note_slug text);

CREATE OR REPLACE FUNCTION increment_view_count(p_note_slug text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
  v_clean_slug text;
BEGIN
  -- Validate input: reject NULL, empty, or suspiciously long slugs
  IF p_note_slug IS NULL OR length(p_note_slug) = 0 THEN
    RAISE EXCEPTION 'Invalid slug: NULL or empty';
  END IF;

  IF length(p_note_slug) > 200 THEN
    RAISE EXCEPTION 'Invalid slug: exceeds 200 characters';
  END IF;

  -- Sanitize: only allow alphanumeric, dashes, underscores
  -- (matches typical blog slug format)
  v_clean_slug := regexp_replace(p_note_slug, '[^a-zA-Z0-9_-]', '', 'g');

  -- Reject if sanitization changed the slug (means it had bad chars)
  IF v_clean_slug IS DISTINCT FROM p_note_slug THEN
    RAISE EXCEPTION 'Invalid slug: contains forbidden characters';
  END IF;

  -- Atomic upsert + increment
  INSERT INTO view_counts (slug, count)
  VALUES (p_note_slug, 1)
  ON CONFLICT (slug)
  DO UPDATE SET count = view_counts.count + 1
  RETURNING count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- Grant execute to anon (safe because of input validation above)
GRANT EXECUTE ON FUNCTION increment_view_count(text) TO anon;

-- ── 6. Verification queries ───────────────────────────────────────────────
-- Run these to verify the policies are correctly applied:

-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public' AND tablename IN ('view_counts', 'site_visits');
-- Expected: both should show rowsecurity = true

-- SELECT tablename, policyname, cmd, roles FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- ── 7. Table structure requirements ───────────────────────────────────────
-- Make sure these constraints exist (run if tables were created without them):

-- ALTER TABLE view_counts ADD CONSTRAINT view_counts_pkey PRIMARY KEY (slug);
-- ALTER TABLE site_visits ADD CONSTRAINT site_visits_pkey PRIMARY KEY (visitor_id);
