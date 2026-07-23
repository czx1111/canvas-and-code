# Canvas & Code

A personal blog built with React + Vite + Tailwind CSS, deployed to GitHub Pages.

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Architecture

Five-layer "Content as Code" architecture:

1. **Content** — Markdown files in `content/posts/`
2. **Build** — Vite plugin generates `posts-data.js`
3. **Data** — React Context provides posts to the app
4. **View** — React SPA with HashRouter
5. **Deploy** — GitHub Actions → GitHub Pages

## Add a New Post

1. Create `content/posts/my-post.md` with frontmatter
2. (Optional) Create `content/posts/my-post.zh.md` for Chinese
3. Commit and push — GitHub Actions auto-deploys

## Tech Stack

- React 18 + Vite
- Tailwind CSS (Warm Canvas Editorial design system)
- React Router (HashRouter)
- react-markdown + remark-gfm + rehype-raw
- gray-matter (frontmatter parsing)
- Lucide React (icons)

## License

MIT
