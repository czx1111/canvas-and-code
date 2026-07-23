import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { blogContentPlugin } from './src/plugins/vite-plugin-blog-content.js'

export default defineConfig({
  plugins: [react(), blogContentPlugin()],
  base: './',
  server: {
    port: 3000,
    open: true,
  },
})
