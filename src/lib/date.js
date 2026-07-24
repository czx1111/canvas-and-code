/**
 * Format a date string into a human-readable format.
 * @param {string} dateStr - ISO date string
 * @param {string} lang - Language code ("zh" or "en")
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr, lang = "en") {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (lang === "zh") return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}