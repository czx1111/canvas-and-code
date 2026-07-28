import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Vite plugin: generates an RSS 2.0 feed (feed.xml) from posts-data.js
 * at build time. The feed is placed in the public/ directory so it's
 * copied to the dist root during build.
 *
 * Also generates a feed.xml in the project root's public/ folder
 * during dev server startup for local testing.
 *
 * Post data is loaded via dynamic import() of the generated ESM data file
 * (with cache-busting query) — no fragile regex parsing of our own output.
 */
export function rssFeedPlugin() {
  const SITE_TITLE = "Canvas & Code";
  const SITE_DESCRIPTION =
    "Thoughts on engineering, design, and the craft of building things with warmth and intention.";
  const SITE_URL = "https://xdcr.de5.net";
  const postsDataPath = path.resolve(process.cwd(), "src/generated/posts-data.js");
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

  /** Load the generated posts ESM data file (cache-busted on every call). */
  async function loadPosts() {
    if (!fs.existsSync(postsDataPath)) return [];
    try {
      const mod = await import(`${pathToFileURL(postsDataPath).href}?t=${Date.now()}`);
      return Array.isArray(mod.posts) ? mod.posts : [];
    } catch (err) {
      console.warn(`[rss-feed] Failed to load posts-data.js: ${err.message}`);
      return [];
    }
  }

  async function generateFeed() {
    if (!fs.existsSync(postsDataPath)) {
      console.log("[rss-feed] posts-data.js not found, skipping feed generation.");
      return;
    }

    const posts = await loadPosts();

    if (posts.length === 0) {
      console.log("[rss-feed] No posts found, skipping feed generation.");
      return;
    }

    const now = new Date().toUTCString();

    let items = "";
    for (const post of posts) {
      const pubDate = post.date
        ? new Date(post.date).toUTCString()
        : now;
      const description = escapeXml(stripMarkdown(post.excerpt || ""));
      const content = escapeXml(stripMarkdown(post.content || "").substring(0, 500)) + "...";

      items += `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/post/${escapeXml(post.slug)}/</link>
      <guid isPermaLink="true">${SITE_URL}/post/${escapeXml(post.slug)}/</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <content:encoded><![CDATA[${stripMarkdown(post.content || "").substring(0, 1000)}...]]></content:encoded>
      <category>${escapeXml(post.category || "Thoughts")}</category>
    </item>
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
${items}  </channel>
</rss>`;

    // Ensure public/ directory exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, feed, "utf-8");
    console.log(`[rss-feed] Generated feed.xml with ${posts.length} posts → ${path.relative(process.cwd(), outputPath)}`);
  }

  return {
    name: "rss-feed",
    // buildStart hooks run sequentially in plugin order, so blog-content
    // has already written posts-data.js when this plugin runs.
    async buildStart() {
      await generateFeed();
    },
    configureServer(server) {
      generateFeed();
      // Watch posts-data.js for changes
      const watcher = fs.watch(postsDataPath, () => {
        console.log("[rss-feed] posts-data.js changed, regenerating feed...");
        generateFeed();
      });
      server.httpServer.on("close", () => {
        watcher.close();
      });
    },
  };
}
