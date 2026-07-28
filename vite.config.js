import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { blogContentPlugin } from './src/plugins/vite-plugin-blog-content.js'
import { rssFeedPlugin } from './src/plugins/vite-plugin-rss.js'
import { sitemapPlugin } from './src/plugins/vite-plugin-sitemap.js'
import { prerenderMetaPlugin } from './src/plugins/vite-plugin-prerender.js'

export default defineConfig({
  plugins: [react(), blogContentPlugin(), rssFeedPlugin(), sitemapPlugin(), prerenderMetaPlugin()],
  base: '/',
  resolve: {
    alias: [
      // Bundle only the highlight.js grammars this blog actually uses.
      // rehype-highlight imports { common, createLowlight } from "lowlight";
      // the package barrel also re-exports the full ~190-language `all` set,
      // and its `common` fallback alone bundles 37 grammars. The shim below
      // exports the same surface backed by an 8-grammar subset.
      {
        find: /^lowlight$/,
        replacement: fileURLToPath(new URL('./src/lib/lowlight-subset.js', import.meta.url)),
      },
    ],
  },
  server: {
    port: 3000,
    open: true,
  },
})
