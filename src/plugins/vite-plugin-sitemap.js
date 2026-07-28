import fs from "fs";
import path from "path";

/**
 * Vite plugin: generates sitemap.xml at build time.
 * Includes all static routes + dynamic post/note routes.
 *
 * @param {object} options
 * @param {string} options.siteUrl — base URL of the site (e.g. "https://example.com")
 */
export function sitemapPlugin({ siteUrl = "https://xdcr.de5.net" } = {}) {
  const root = process.cwd();

  function getDynamicRoutes() {
    const routes = [];
    const postsData = path.resolve(root, "src/generated/posts-data.js");
    const notesData = path.resolve(root, "src/generated/notes-data.js");

    if (fs.existsSync(postsData)) {
      const raw = fs.readFileSync(postsData, "utf-8");
      const match = raw.match(/export const posts = ([\s\S]*?);$/m);
      if (match) {
        try {
          const posts = JSON.parse(match[1]);
          for (const p of posts) {
            routes.push({ path: `/post/${p.slug}`, date: p.date });
          }
        } catch {}
      }
    }

    if (fs.existsSync(notesData)) {
      const raw = fs.readFileSync(notesData, "utf-8");
      const match = raw.match(/export const notes = ([\s\S]*?);$/m);
      if (match) {
        try {
          const notes = JSON.parse(match[1]);
          for (const n of notes) {
            routes.push({ path: `/note/${n.slug}`, date: n.date });
          }
        } catch {}
      }
    }

    return routes;
  }

  function generateSitemap() {
    // Keep in sync with the routes in App.jsx.
    // Trailing slashes match the URLs GitHub Pages finally serves.
    const staticRoutes = ["/", "/blog/", "/notes/", "/tags/", "/series/", "/links/", "/guestbook/", "/about/", "/archive/", "/projects/", "/changelog/"];
    const dynamicRoutes = getDynamicRoutes();

    const base = siteUrl.replace(/\/$/, "");
    const now = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const r of staticRoutes) {
      xml += `  <url>\n    <loc>${base}${r}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    for (const r of dynamicRoutes) {
      const lastmod = r.date || now;
      xml += `  <url>\n    <loc>${base}${r.path}/</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    xml += `</urlset>\n`;

    const outPath = path.resolve(root, "public/sitemap.xml");
    fs.writeFileSync(outPath, xml, "utf-8");
    console.log(`[sitemap] Generated sitemap.xml → ${path.relative(root, outPath)}`);

    // Also generate robots.txt
    const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
    const robotsPath = path.resolve(root, "public/robots.txt");
    fs.writeFileSync(robotsPath, robotsTxt, "utf-8");
    console.log(`[sitemap] Generated robots.txt → ${path.relative(root, robotsPath)}`);
  }

  return {
    name: "sitemap",
    buildStart() {
      // Run after blog-content plugin generates posts-data.js
      setTimeout(generateSitemap, 0);
    },
    configureServer(server) {
      generateSitemap();
    },
  };
}
