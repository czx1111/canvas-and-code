import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext.jsx";

const SITE_NAME = "Canvas & Code";
const SITE_URL = "https://xdcr.de5.net";
const DEFAULT_DESCRIPTION =
  "Canvas & Code — A blog about engineering, design, and the craft of building things with warmth and intention.";
const DEFAULT_KEYWORDS =
  "Canvas & Code, blog, web development, frontend, design, React, engineering, 博客, 前端, 设计";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.png`;

/**
 * SEO — manages document <title>, meta description/keywords, canonical URL,
 * Open Graph and Twitter Card tags, and the <html lang> attribute.
 *
 * @param {string} title — page title (without site name)
 * @param {string} [description] — meta description
 * @param {string} [keywords] — page-specific keywords (prepended to site defaults)
 * @param {string} [ogType] — Open Graph type (default: "website")
 * @param {string} [ogImage] — OG image URL or absolute path (defaults to site cover)
 * @param {string} [publishedTime] — ISO date, emitted as article:published_time
 * @param {boolean} [noindex] — tell crawlers not to index this page
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "",
  ogType = "website",
  ogImage,
  publishedTime = "",
  noindex = false,
}) {
  const location = useLocation();
  const { lang } = useI18n();
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  // BrowserRouter: clean URLs that crawlers and social scrapers can use.
  // Trailing slash matches the URL GitHub Pages finally serves (it 301s
  // bare directory paths to the slash-suffixed version), and matches the
  // canonical URLs emitted by vite-plugin-prerender at build time.
  const path = location.pathname === "/" ? "/" : location.pathname.replace(/\/?$/, "/");
  const currentUrl = `${SITE_URL}${path}`;
  // Scrapers require absolute image URLs; fall back to the site cover.
  const image = ogImage
    ? /^https?:\/\//.test(ogImage)
      ? ogImage
      : `${SITE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`
    : DEFAULT_OG_IMAGE;
  const allKeywords = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;

  return (
    <Helmet htmlAttributes={{ lang: lang === "zh" ? "zh-CN" : "en" }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={currentUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title || SITE_NAME} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={lang === "zh" ? "zh_CN" : "en_US"} />
      <meta property="og:locale:alternate" content={lang === "zh" ? "en_US" : "zh_CN"} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || SITE_NAME} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
