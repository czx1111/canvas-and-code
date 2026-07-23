---
slug: js-event-loop
title: "JavaScript 事件循环机制详解"
category: Frontend
date: 2026-07-23
readTime: 3 min
tags: [JavaScript, 异步, Event Loop]
---

## 核心概念

JavaScript 是**单线程**的，但通过**事件循环（Event Loop）** 实现了异步非阻塞。

事件循环的核心流程：

1. **执行栈**中的同步代码先执行完毕
2. 取出**微任务队列**中的所有任务执行（`Promise.then`、`queueMicrotask`）
3. 如有必要，取一个**宏任务**执行（`setTimeout`、`setInterval`、I/O）
4. 渲染 DOM（浏览器决定时机）
5. 回到第 1 步

## 微任务 vs 宏任务

| 类型 | 示例 | 优先级 |
|------|------|--------|
| 微任务 | `Promise.then/catch/finally`、`queueMicrotask`、`MutationObserver` | 高（全部清空） |
| 宏任务 | `setTimeout`、`setInterval`、`I/O`、`postMessage` | 低（每次只取一个） |

## 经典面试题

```js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');
// 输出顺序: 1 → 4 → 3 → 2
```

**原因**：同步代码先执行（1、4），然后清空微任务队列（3），最后执行宏任务（2）。

## 关键理解

> 每一轮事件循环 = 一次宏任务 + 清空所有微任务

不要把事件循环想得太复杂，它就是一个**无限循环**，不断检查"有没有东西要执行"。
