---
slug: http-cache-strategy
title: "HTTP 缓存策略：强缓存与协商缓存"
category: Backend
date: 2026-07-23
readTime: 3 min
tags: [HTTP, 缓存, 性能优化]
---

## 两层缓存

HTTP 缓存分为两层，浏览器按顺序检查：

```
请求 → 强缓存命中？→ 直接用本地副本（不发请求）
         ↓ 未命中
       协商缓存 → 服务器返回 304？→ 用本地副本
                    ↓ 200
                  重新下载资源
```

## 强缓存

不发送请求，直接使用本地缓存。

| Header | 说明 |
|--------|------|
| `Cache-Control: max-age=3600` | 资源在 3600 秒内有效 |
| `Cache-Control: public/private` | 是否可被中间代理缓存 |
| `Cache-Control: no-cache` | 跳过强缓存，直接协商 |
| `Cache-Control: no-store` | 完全不缓存 |
| `Expires: Wed, 25 Dec 2024 00:00:00 GMT` | 绝对过期时间（已被 Cache-Control 取代） |

## 协商缓存

发送请求询问服务器资源是否变化，返回 304 则用本地缓存。

| Header | 说明 |
|--------|------|
| `Last-Modified` / `If-Modified-Since` | 基于修改时间 |
| `ETag` / `If-None-Match` | 基于内容哈希（更精确） |

`ETag` 优先级高于 `Last-Modified`。

## 实践建议

- **HTML**：`no-cache`（每次协商，确保最新）
- **带 hash 的 JS/CSS**：`max-age=31536000`（一年强缓存，文件名变了就自动失效）
- **图片/字体**：`max-age=86400`（合理缓存）
