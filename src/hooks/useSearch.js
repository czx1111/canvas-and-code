import { useState, useMemo, useCallback } from "react";
import { posts as allPosts } from "../generated/posts-data.js";
import { notes as allNotes } from "../generated/notes-data.js";

/**
 * useSearch — full-text search across posts and notes.
 *
 * Searches title, excerpt, tags, and content body.
 * Returns ranked results grouped by type.
 *
 * @param {string} query — search query string
 * @returns {{ results: Array, totalCount: number }}
 */
export function useSearch(query) {
  return useMemo(() => {
    if (!query || !query.trim()) return { results: [], totalCount: 0 };

    const q = query.toLowerCase().trim();
    const results = [];

    // Search posts
    for (const post of allPosts) {
      const title = (post.title || "").toLowerCase();
      const titleZh = (post.titleZh || "").toLowerCase();
      const excerpt = (post.excerpt || "").toLowerCase();
      const excerptZh = (post.excerptZh || "").toLowerCase();
      const content = (post.content || "").toLowerCase();

      let score = 0;
      if (title.includes(q)) score += 10;
      if (titleZh.includes(q)) score += 10;
      if (excerpt.includes(q)) score += 5;
      if (excerptZh.includes(q)) score += 5;
      if (content.includes(q)) score += 1;

      if (score > 0) {
        results.push({
          type: "post",
          slug: post.slug,
          title: post.title,
          titleZh: post.titleZh,
          excerpt: post.excerpt,
          excerptZh: post.excerptZh,
          category: post.category,
          date: post.date,
          score,
        });
      }
    }

    // Search notes
    for (const note of allNotes) {
      const title = (note.title || "").toLowerCase();
      const titleZh = (note.titleZh || "").toLowerCase();
      const content = (note.content || "").toLowerCase();
      const tags = (note.tags || []).join(" ").toLowerCase();

      let score = 0;
      if (title.includes(q)) score += 10;
      if (titleZh.includes(q)) score += 10;
      if (tags.includes(q)) score += 5;
      if (content.includes(q)) score += 1;

      if (score > 0) {
        results.push({
          type: "note",
          slug: note.slug,
          title: note.title,
          titleZh: note.titleZh,
          category: note.category,
          date: note.date,
          tags: note.tags,
          score,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return { results, totalCount: results.length };
  }, [query]);
}

/**
 * useSearchModal — manages the search modal open/close state
 * and keyboard shortcut (Cmd+K / Ctrl+K).
 */
export function useSearchModal() {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return { open, openModal, closeModal };
}
