/**
 * Note Categories — Central configuration
 *
 * To add a new category, simply add an object to the array below.
 * It will automatically appear in the Notes page filter, note detail
 * category badge, tags page, archive timeline, and i18n lookups.
 *
 * Format:
 *   {
 *     key:   "Frontend",          // must match the `category` field in note frontmatter
 *     zh:    "前端",              // Chinese label
 *     en:    "Frontend",          // English label
 *     icon:  Monitor,             // optional Lucide icon (imported above)
 *     order: 1,                   // sort order (lower = earlier in the list)
 *   }
 *
 * Notes with a category not listed here will still display, using the
 * raw category string as the label.
 */

import {
  Monitor,
  Server,
  Brain,
  Database,
  Network,
  Wrench,
  Terminal,
  Boxes,
  Cpu,
  Globe,
  Shield,
  Smartphone,
  Cloud,
  Code,
  FileQuestion,
} from "lucide-react";

export const noteCategories = [
  { key: "Frontend",  zh: "前端",       en: "Frontend",        icon: Monitor,    order: 1 },
  { key: "Backend",   zh: "后端",       en: "Backend",         icon: Server,     order: 2 },
  { key: "Database",  zh: "数据库",     en: "Database",        icon: Database,   order: 3 },
  { key: "Algorithm", zh: "算法",       en: "Algorithm",       icon: Brain,      order: 4 },
  { key: "Network",   zh: "计算机网络", en: "Network",         icon: Network,    order: 5 },
  { key: "OS",        zh: "操作系统",   en: "Operating System", icon: Terminal,   order: 6 },
  { key: "Tools",     zh: "工具",       en: "Tools",           icon: Wrench,     order: 7 },
  { key: "Security",  zh: "安全",       en: "Security",        icon: Shield,     order: 8 },
  { key: "Mobile",    zh: "移动开发",   en: "Mobile",          icon: Smartphone, order: 9 },
  { key: "Cloud",     zh: "云原生",     en: "Cloud",           icon: Cloud,      order: 10 },
  { key: "Other",     zh: "其他",       en: "Other",           icon: Boxes,      order: 99 },
];

// Quick lookups
const categoryMap = new Map(noteCategories.map((c) => [c.key, c]));

/**
 * Get category config by key, with graceful fallback.
 */
export function getCategoryConfig(key) {
  return (
    categoryMap.get(key) || {
      key,
      zh: key,
      en: key,
      icon: FileQuestion,
      order: 100,
    }
  );
}

/**
 * Get localized label for a category.
 */
export function getCategoryLabel(key, lang) {
  const config = getCategoryConfig(key);
  return lang === "zh" ? config.zh : config.en;
}

/**
 * Get all configured category keys in order.
 */
export function getAllCategoryKeys() {
  return noteCategories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((c) => c.key);
}

/**
 * Merge configured categories with any categories found in notes data
 * (for categories that exist in frontmatter but aren't in the config yet).
 * Returns ordered list of keys.
 */
export function getMergedCategoryKeys(dataCategories) {
  const configured = getAllCategoryKeys();
  const configuredSet = new Set(configured);
  const extras = (dataCategories || []).filter((c) => !configuredSet.has(c));
  return [...configured, ...extras];
}
