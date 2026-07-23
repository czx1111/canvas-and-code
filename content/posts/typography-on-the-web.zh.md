---
slug: typography-on-the-web
title: "Web 排版：实用指南"
excerpt: "从字体加载到垂直节奏——那些区分业余网站与专业网站的排版决策。"
category: Design
date: 2024-11-20
readTime: 6 分钟
---

## 排版为什么重要

排版是 Web 设计的 95%。在任何人注意到你的配色方案、间距或动画之前，他们会先*阅读*你的内容。如果阅读困难，其他都不重要。

## 字体加载

Web 排版的技术基础是你如何加载字体。糟糕的字体加载会导致 FOUT（无样式文本闪烁）或 FOIT（不可见文本闪烁）。

### 现代方法

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

关键点：
- `preconnect` 预热 DNS/TLS 连接
- `display=swap` 立即显示回退文本，字体加载后替换
- 只加载你实际使用的字重

## 字体配对

好的字体配对创造*对比而非冲突*。以下是本博客使用的配对：

| 角色 | 字体 | 原因 |
|------|------|------|
| 展示 | Playfair Display | 衬线，优雅，编辑感 |
| 正文 | Inter | 无衬线，易读，现代 |
| 代码 | JetBrains Mono | 等宽，连字，清晰 |

规则：**一种衬线 + 一种无衬线**。两种衬线会打架。两种无衬线会很无聊。配对才是魔法所在。

## 垂直节奏

专业排版有*节奏*——一致的垂直间距创造视觉韵律。

```css
/* 基本单位：8px */
p { margin-bottom: 16px; }     /* 2 单位 */
h2 { margin-top: 32px; }       /* 4 单位 */
h2 { margin-bottom: 16px; }    /* 2 单位 */
section { margin-bottom: 48px; } /* 6 单位 */
```

当每个间距值都是基本单位的倍数时，页面就会*流动*。当间距是随机的，页面就会感到抖动。

## 行高与行宽

两个常被忽视的属性：

### 行高

- **正文**：1.5–1.8
- **标题**：1.1–1.3

正文需要更大的行高以提高可读性。标题需要更紧凑的行高以感觉像*单元*。

### 行宽

阅读的最佳行长为**45–75 个字符**。在 Web 上，这转化为正文约 `640px`–`720px` 的 `max-width`。

```css
.article-body {
  max-width: 680px;
  line-height: 1.8;
}
```

## 通过字号建立层级

| 元素 | 大小 | 字重 |
|------|------|------|
| h1 | 3rem–4rem | 700 |
| h2 | 2rem–2.5rem | 600 |
| h3 | 1.5rem–1.75rem | 600 |
| h4 | 1.25rem | 600 |
| 正文 | 1rem–1.0625rem | 400 |
| 小字 | 0.875rem | 400 |

关键：每个级别应与下一级*明显*不同。如果你的 h2 和 h3 大小太相似，层级就被破坏了。

## 结论

好的排版是看不见的。读者不会注意到它——他们只是觉得内容容易阅读。这就是目标。

---

*排版是安排书面语言使其在展示时清晰、易读且吸引人的艺术。*
