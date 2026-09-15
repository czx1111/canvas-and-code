import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Vite plugin: generates an RSS 2.0 feed (feed.xml) from posts-data.js and
 * notes-data.js at build time. The feed is placed in the public/ directory
 * so it's copied to the dist root during build.
 *
 * Also generates a feed.xml in the project root's public/ folder
 * during dev server startup for local testing.
 *
 * Both content types are merged by date (newest first) so feed readers
 * see notes as well as blog posts. Item data is loaded via dynamic
 * import() of the generated ESM data files (with cache-busting query) —
 * no fragile regex parsing of our own output.
 */
export function rssFeedPlugin() {
  const SITE_TITLE = "Canvas & Code";
  const SITE_DESCRIPTION =
    "Thoughts on engineering, design, and the craft of building things with warmth and intention.";
  const SITE_URL = "https://xdcr.de5.net";
  const postsDataPath = path.resolve(process.cwd(), "src/generated/posts-data.js");
  const notesDataPath = path.resolve(process.cwd(), "src/generated/notes-data.js");
  const outputPath = path.resolve(process.cwd(), "public/feed.xml");

  function escapeXml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function stripMarkdown(md) {
    if (!md) return "";
    return md
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]*`/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[#>*_\-|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Make text safe inside a CDATA section (breaks any "]]>" sequence). */
  function cdataSafe(str) {
    if (!str) return "";
    return String(str).replace(/\]\]>/g, "]]]]><![CDATA[>");
  }

  /** Load a generated ESM data file (cache-busted on every call). */
  async function loadData(filePath, exportName) {
    if (!fs.existsSync(filePath)) return [];
    try {
      const mod = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`);
      return Array.isArray(mod[exportName]) ? mod[exportName] : [];
    } catch (err) {
      console.warn(`[rss-feed] Failed to load ${path.basename(filePath)}: ${err.message}`);
      return [];
    }
  }

  /**
   * Merge posts and notes into a single list ordered by date (newest first).
   * Items without a date sort first (treated as freshly added), mirroring
   * how the sitemap and archive handle dating.
   */
  async function loadAllItems() {
    const [posts, notes] = await Promise.all([
      loadData(postsDataPath, "posts"),
      loadData(notesDataPath, "notes"),
    ]);

    const postItems = posts.map((post) => ({ ...post, __feedType: "post" }));
    const noteItems = notes.map((note) => ({ ...note, __feedType: "note" }));

    return [...postItems, ...noteItems].sort((a, b) => {
      if (!a.date && b.date) return -1;
      if (a.date && !b.date) return 1;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
  }

  async function generateFeed() {
    if (!fs.existsSync(postsDataPath)) {
      console.log("[rss-feed] posts-data.js not found, skipping feed generation.");
      return;
    }

    const items = await loadAllItems();

    if (items.length === 0) {
      console.log("[rss-feed] No posts or notes found, skipping feed generation.");
      return;
    }

    const now = new Date().toUTCString();

    let itemXml = "";
    for (const item of items) {
      const isPost = item.__feedType === "post";
      const linkPath = isPost ? `/post/${item.slug}` : `/note/${item.slug}`;
      const pubDate = item.date
        ? new Date(item.date).toUTCString()
        : now;
      const description = escapeXml(stripMarkdown(item.excerpt || item.content || "").slice(0, 300));
      const content = escapeXml(stripMarkdown(item.content || "").slice(0, 1000));

      let categoryXml = "";
      if (isPost && item.category) {
        categoryXml += `      <category>${escapeXml(item.category)}</category>\n`;
      }
      for (const tag of item.tags || []) {
        categoryXml += `      <category>${escapeXml(tag)}</category>\n`;
      }

      itemXml += `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}${linkPath}/</link>
      <guid isPermaLink="true">${SITE_URL}${linkPath}/</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <content:encoded><![CDATA[${cdataSafe(stripMarkdown(item.content || "").slice(0, 1000))}]]></content:encoded>
${categoryXml}    </item>
`;
    }

    // <language> note: RSS 2.0 allows a single language value per channel.
    // This is a bilingual blog whose primary content is English, so the
    // feed declares en-us.
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <!-- Bilingual blog; RSS 2.0 supports one language value and the primary content is English, hence en-us. -->
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${itemXml}  </channel>
</rss>`;

    // Ensure public/ directory exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, feed, "utf-8");
    console.log(`[rss-feed] Generated feed.xml with ${items.length} items (posts + notes) → ${path.relative(process.cwd(), outputPath)}`);
  }

  return {
    name: "rss-feed",
    // buildStart hooks run sequentially in plugin order, so blog-content
    // has already written the data files when this plugin runs.
    async buildStart() {
      await generateFeed();
    },
    configureServer(server) {
      generateFeed();
      // Watch both generated data files for changes
      const watchPaths = [postsDataPath, notesDataPath].filter((p) => fs.existsSync(p));
      const watchers = watchPaths.map((p) =>
        fs.watch(p, () => {
          console.log(`[rss-feed] ${path.basename(p)} changed, regenerating feed...`);
          generateFeed();
        })
      );
      server.httpServer.on("close", () => {
        watchers.forEach((w) => w.close());
      });
    },
  };
}
