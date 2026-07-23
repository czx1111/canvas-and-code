---
slug: git-rebase-vs-merge
title: "Git Rebase vs Merge：什么时候用哪个"
category: Tools
date: 2026-07-23
readTime: 2 min
tags: [Git, 协作, 版本控制]
---

## 核心区别

```
Merge：保留所有历史，合并分支产生一个 merge commit
Rebase：把当前分支的提交"搬到"目标分支顶端，历史线性
```

## 图示

### Merge

```
A---B---C feature
   /
D---E---F---M main (merge commit)
```

### Rebase

```
D---E---F---A'---B'---C' main (线性历史)
```

## 使用场景

| 场景 | 推荐 | 原因 |
|------|------|------|
| 个人 feature 分支同步 main | `rebase` | 历史干净，无多余的 merge commit |
| 合并 PR 到 main | `merge` | 保留完整历史，可追溯 |
| 多人共享分支 | `merge` | rebase 会改写历史，影响他人 |

## 黄金法则

> **不要 rebase 已经推送到远程并被他人在使用的分支。**

因为 rebase 会改写 commit hash，导致其他人的本地历史与远程不一致。

## 实用技巧

```bash
# 交互式 rebase — 压缩/修改/重排提交
git rebase -i HEAD~3

# rebase 后安全推送（覆盖远程）
git push --force-with-lease
```
