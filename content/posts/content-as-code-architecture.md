---
slug: content-as-code-architecture
title: "Content as Code: A Five-Layer Blog Architecture"
titleZh: "内容即代码：五层博客架构"
excerpt: "How treating blog posts as version-controlled Markdown files eliminates backend complexity while keeping full editorial control."
excerptZh: "如何将博客文章视为版本控制的 Markdown 文件，消除后端复杂性，同时保留完整的编辑控制。"
category: Engineering
date: 2024-12-10
readTime: 8 min
coverImage: ""
featured: false
---

## The Problem with Blog Backends

Most blog platforms require a database, an admin panel, authentication, and a hosting backend. Each of these adds complexity, maintenance burden, and points of failure.

But ask yourself: **what does a blog actually need?**

1. Store text content
2. Render that content as HTML
3. Serve it to readers

That is it. No database needed. No admin panel needed. No authentication needed.

## Content as Code

The core insight is simple: **blog posts are text files, and text files are code**. If we treat them as such, we get all the benefits of a software development workflow for free:

- **Version control** — every edit is tracked, diffable, revertible
- **No backend** — files are served as static assets
- **No database** — content lives in the filesystem, not a DB
- **No auth** — Git handles access control
- **Deploy via CI/CD** — push to main, the site updates

## The Five Layers

### Layer 1: Content

```
content/posts/
├── my-first-post.md        # English
├── my-first-post.zh.md     # Chinese translation
├── another-post.md
└── another-post.zh.md
```

Each Markdown file has YAML frontmatter with metadata:

```yaml
---
slug: my-first-post
title: "My First Post"
titleZh: "我的第一篇文章"
excerpt: "A short description"
category: Engineering
date: 2024-12-01
readTime: 5 min
---
```

### Layer 2: Build

A Vite plugin (`vite-plugin-blog-content.js`) runs at build time:

1. Scans `content/posts/*.md`
2. Parses frontmatter with `gray-matter`
3. Matches `.zh.md` files as Chinese translations
4. Generates `src/generated/posts-data.js`

This file is auto-generated and git-ignored. It is a build artifact, not source code.

### Layer 3: Data

The generated `posts-data.js` is consumed via React Context:

```jsx
const { posts } = useBlogData();
// posts is an array of fully-parsed post objects
```

Combined with `useI18n` for language switching, the data layer provides everything the view layer needs.

### Layer 4: View

React SPA with HashRouter (for GitHub Pages compatibility):

- `/` — Home page with featured + recent posts
- `/blog` — Filterable, searchable post grid
- `/post/:slug` — Full article rendering
- `/about` — About page
- `/source` — Architecture explorer

### Layer 5: Deploy

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/deploy-pages@v4
```

Push to `main`. GitHub Actions builds. GitHub Pages serves. Done.

## Why This Matters

This architecture eliminates an entire class of problems:

| Traditional Blog | Content as Code |
|---|---|
| Database to maintain | None |
| Admin panel to secure | None |
| Auth system to build | None |
| Server to host | Static CDN |
| Backup strategy | Git is the backup |
| Migration tooling | Just copy the files |

The tradeoff? You need to know Git. But if you are reading this, you probably already do.

## Adding a New Post

1. Create `content/posts/my-new-post.md`
2. (Optional) Create `my-new-post.zh.md`
3. `git add . && git commit -m "Add: new post" && git push`
4. GitHub Actions handles the rest

No admin panel. No login. No "draft" mode. Just write, commit, and ship.

---

*The best backend is no backend. The best database is the filesystem. The best CMS is your text editor.*
