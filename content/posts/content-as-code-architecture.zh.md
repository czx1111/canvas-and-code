---
slug: content-as-code-architecture
title: "内容即代码：五层博客架构"
excerpt: "如何将博客文章视为版本控制的 Markdown 文件，消除后端复杂性，同时保留完整的编辑控制。"
category: Engineering
date: 2024-12-10
readTime: 8 分钟
---

## 博客后端的问题

大多数博客平台需要数据库、管理面板、身份验证和托管后端。这些每一个都增加了复杂性、维护负担和故障点。

但问问自己：**博客到底需要什么？**

1. 存储文本内容
2. 将内容渲染为 HTML
3. 提供给读者

就是这样。不需要数据库。不需要管理面板。不需要身份验证。

## 内容即代码

核心洞察很简单：**博客文章是文本文件，而文本文件就是代码**。如果我们这样对待它们，就能免费获得软件开发工作流的全部好处：

- **版本控制** — 每次编辑都被追踪、可比较、可回退
- **无后端** — 文件作为静态资源提供
- **无数据库** — 内容存在于文件系统中，而非数据库
- **无身份验证** — Git 处理访问控制
- **通过 CI/CD 部署** — 推送到 main，网站更新

## 五层架构

### 第一层：内容

```
content/posts/
├── my-first-post.md        # 英文
├── my-first-post.zh.md     # 中文翻译
├── another-post.md
└── another-post.zh.md
```

每个 Markdown 文件都有带元数据的 YAML frontmatter：

```yaml
---
slug: my-first-post
title: "我的第一篇文章"
excerpt: "简短描述"
category: Engineering
date: 2024-12-01
readTime: 5 分钟
---
```

### 第二层：构建

一个 Vite 插件（`vite-plugin-blog-content.js`）在构建时运行：

1. 扫描 `content/posts/*.md`
2. 用 `gray-matter` 解析 frontmatter
3. 匹配 `.zh.md` 文件作为中文翻译
4. 生成 `src/generated/posts-data.js`

此文件是自动生成的，被 git 忽略。它是构建产物，不是源代码。

### 第三层：数据

生成的 `posts-data.js` 通过 React Context 消费：

```jsx
const { posts } = useBlogData();
// posts 是完全解析的文章对象数组
```

结合 `useI18n` 进行语言切换，数据层提供了视图层所需的一切。

### 第四层：视图

使用 HashRouter（兼容 GitHub Pages）的 React SPA：

- `/` — 首页，含精选和最近文章
- `/blog` — 可筛选、可搜索的文章网格
- `/post/:slug` — 完整文章渲染
- `/about` — 关于页面
- `/source` — 架构浏览器

### 第五层：部署

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

推送到 `main`。GitHub Actions 构建。GitHub Pages 提供。完成。

## 为什么这很重要

这种架构消除了整整一类问题：

| 传统博客 | 内容即代码 |
|---|---|
| 需要维护的数据库 | 无 |
| 需要保护的管理面板 | 无 |
| 需要构建的身份验证系统 | 无 |
| 需要托管的服务器 | 静态 CDN |
| 备份策略 | Git 就是备份 |
| 迁移工具 | 直接复制文件 |

代价是什么？你需要会使用 Git。但如果你在读这篇文章，你可能已经会了。

## 添加新文章

1. 创建 `content/posts/my-new-post.md`
2.（可选）创建 `my-new-post.zh.md`
3. `git add . && git commit -m "Add: new post" && git push`
4. GitHub Actions 处理其余部分

没有管理面板。没有登录。没有"草稿"模式。只需写、提交、发布。

---

*最好的后端是没有后端。最好的数据库是文件系统。最好的 CMS 是你的文本编辑器。*
