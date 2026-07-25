import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { blogContentPlugin } from './src/plugins/vite-plugin-blog-content.js'
import { rssFeedPlugin } from './src/plugins/vite-plugin-rss.js'

export default defineConfig({
  plugins: [react(), blogContentPlugin(), rssFeedPlugin()],
  base: './',
  server: {
    port: 3000,
    open: true,
  },
})
