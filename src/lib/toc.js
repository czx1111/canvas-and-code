/**
 * slugify — convert heading text to URL-safe anchor id.
 * Handles CJK characters, spaces, and special chars.
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, "") // strip markdown formatting
    .replace(/[^\w\u4e00-\u9fff]+/g, "-") // non-word/cjk → dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

/**
 * extractTextFromChildren — recursively extract plain text
 * from React node trees (used for heading id generation).
 */
export function extractTextFromChildren(children) {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("");
  if (children && children.props) return extractTextFromChildren(children.props.children);
  return "";
}

/**
 * extractHeadings — parse a markdown string and return
 * an array of { level, text, id } for h2 and h3 headings.
 * Skips headings inside fenced code blocks.
 */
export function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;
  const seen = new Map();

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].replace(/[*_`~]/g, "").trim();
    let id = slugify(text);

    // deduplicate
    const count = seen.get(id) || 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;

    headings.push({ level, text, id });
  }

  return headings;
}
