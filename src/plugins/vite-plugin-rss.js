import fs from "fs";
import path from "path";

/**
 * Vite plugin: generates an RSS 2.0 feed (feed.xml) from posts-data.js
 * at build time. The feed is placed in the public/ directory so it's
 * copied to the dist root during build.
 *
 * Also generates a feed.xml in the project root's public/ folder
 * during dev server startup for local testing.
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

  function generateFeed() {
    if (!fs.existsSync(postsDataPath)) {
      console.log("[rss-feed] posts-data.js not found, skipping feed generation.");
      return;
    }

    const raw = fs.readFileSync(postsDataPath, "utf-8");
    let posts = [];
    try {
      const match = raw.match(/export const posts = ([\s\S]*?);$/m);
      if (match) {
        posts = JSON.parse(match[1]);
      }
    } catch (err) {
      console.warn("[rss-feed] Failed to parse posts-data.js:", err.message);
      return;
    }

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
      <link>${SITE_URL}/#/post/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/#/post/${escapeXml(post.slug)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <content:encoded><![CDATA[${stripMarkdown(post.content || "").substring(0, 1000)}...]]></content:encoded>
      <category>${escapeXml(post.category || "Thoughts")}</category>
    </item>
`;
    }

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
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
    buildStart() {
      generateFeed();
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
