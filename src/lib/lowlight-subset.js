/**
 * lowlight subset shim — aliased as "lowlight" in vite.config.js.
 *
 * Why this exists: rehype-highlight imports { common, createLowlight } from
 * "lowlight" and falls back to `common` when no `languages` option is given.
 * The real lowlight package barrel also re-exports the full ~190-language
 * `all` set, and its `common` set bundles 37 grammars — far more than this
 * blog uses. Aliasing the package to this shim keeps the ArticleLayout chunk
 * to highlight.js core plus only the grammars registered below.
 *
 * The registered set mirrors every language tag used by code fences in
 * content/posts and content/notes (jsx, c, yaml, css, js, python, html, sql,
 * bash). Aliases ship inside each grammar, so jsx/js resolve to javascript
 * and html resolves to xml automatically. Auto-detection (`detect: true`)
 * guesses among these languages only.
 */
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

// The relative path bypasses both the "lowlight" alias and the package
// exports map, which only exposes the root barrel with its heavy re-exports.
export { createLowlight } from "../../node_modules/lowlight/lib/index.js";

/** Grammar record consumed by rehype-highlight as its default language set. */
export const common = { bash, c, css, javascript, python, sql, xml, yaml };
