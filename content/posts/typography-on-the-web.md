---
slug: typography-on-the-web
title: "Typography on the Web: A Practical Guide"
titleZh: "Web 排版：实用指南"
excerpt: "From font loading to vertical rhythm — the typographic decisions that separate amateur sites from professional ones."
excerptZh: "从字体加载到垂直节奏——那些区分业余网站与专业网站的排版决策。"
category: Design
date: 2024-11-20
readTime: 6 min
coverImage: ""
featured: false
---

## Why Typography Matters

Typography is 95% of web design. Before anyone notices your color palette, your spacing, or your animations, they *read* your content. If reading is hard, nothing else matters.

## Font Loading

The technical foundation of web typography is how you load fonts. Bad font loading causes FOUT (Flash of Unstyled Text) or FOIT (Flash of Invisible Text).

### The Modern Approach

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

Key points:
- `preconnect` warms the DNS/TLS connection
- `display=swap` shows fallback text immediately, swaps when the font loads
- Only load the weights you actually use

## Font Pairing

A good font pairing creates *contrast without conflict*. Here is the pairing used on this blog:

| Role | Font | Why |
|------|------|-----|
| Display | Playfair Display | Serif, elegant, editorial |
| Body | Inter | Sans-serif, readable, modern |
| Code | JetBrains Mono | Monospace, ligatures, clear |

The rule: **one serif + one sans-serif**. Two serifs fight. Two sans-serifs are boring. The pairing is where the magic happens.

## Vertical Rhythm

Professional typography has *rhythm* — consistent vertical spacing that creates a visual cadence.

```css
/* Base unit: 8px */
p { margin-bottom: 16px; }     /* 2 units */
h2 { margin-top: 32px; }       /* 4 units */
h2 { margin-bottom: 16px; }    /* 2 units */
section { margin-bottom: 48px; } /* 6 units */
```

When every spacing value is a multiple of your base unit, the page *flows*. When spacing is random, the page feels jittery.

## Line Height and Measure

Two often-overlooked properties:

### Line Height

- **Body text**: 1.5–1.8
- **Headlines**: 1.1–1.3

Body text needs more line height for readability. Headlines need tighter line height to feel like *units*.

### Measure (Line Length)

The optimal line length for reading is **45–75 characters**. On the web, this translates to a `max-width` of about `640px`–`720px` for body text.

```css
.article-body {
  max-width: 680px;
  line-height: 1.8;
}
```

## Hierarchy Through Size

| Element | Size | Weight |
|---------|------|--------|
| h1 | 3rem–4rem | 700 |
| h2 | 2rem–2.5rem | 600 |
| h3 | 1.5rem–1.75rem | 600 |
| h4 | 1.25rem | 600 |
| Body | 1rem–1.0625rem | 400 |
| Small | 0.875rem | 400 |

The key: each level should be *clearly* different from the next. If your h2 and h3 are too similar in size, the hierarchy is broken.

## Conclusion

Good typography is invisible. The reader does not notice it — they just find the content easy to read. That is the goal.

---

*Typography is the art of arranging written language to make it legible, readable, and appealing when displayed.*
