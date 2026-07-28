import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Canvas & Code";
const SITE_URL = "https://xdcr.de5.net";
const DEFAULT_DESCRIPTION =
  "Canvas & Code — A blog about engineering, design, and the craft of building things with warmth and intention.";

/**
 * SEO — manages document <title>, meta description, and Open Graph tags.
 *
 * @param {string} title — page title (without site name)
 * @param {string} [description] — meta description
 * @param {string} [ogType] — Open Graph type (default: "website")
 * @param {string} [ogImage] — Open Graph image URL
 */
export default function SEO({ title, description = DEFAULT_DESCRIPTION, ogType = "website", ogImage }) {
  const location = useLocation();
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  // BrowserRouter: clean URLs that crawlers and social scrapers can use.
  // Trailing slash matches the URL GitHub Pages finally serves (it 301s
  // bare directory paths to the slash-suffixed version), and matches the
  // canonical URLs emitted by vite-plugin-prerender at build time.
  const path = location.pathname === "/" ? "/" : location.pathname.replace(/\/?$/, "/");
  const currentUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title || SITE_NAME} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || SITE_NAME} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
