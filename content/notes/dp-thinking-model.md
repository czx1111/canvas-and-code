---
slug: dp-thinking-model
title: "动态规划的三步思维模型"
category: Algorithm
date: 2025-01-10
readTime: 3 min
tags: [算法, 动态规划, DP]
---

## 三步法

解动态规划题，永远问自己三个问题：

### 1. 状态是什么？

> `dp[i]` 代表什么含义？

状态定义是 DP 最关键的一步。常见的：
- `dp[i]` = 前 i 个元素的最优解
- `dp[i][j]` = 从 i 到 j 的最优解
- `dp[i][w]` = 前 i 个物品、容量 w 时的最优解

### 2. 转移方程是什么？

> `dp[i]` 怎么从 `dp[i-1]`（或其他状态）推出？

```js
// 斐波那契
dp[i] = dp[i-1] + dp[i-2]

// 最长公共子序列
if (s1[i] === s2[j]) dp[i][j] = dp[i-1][j-1] + 1
else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
```

### 3. 初始值和边界？

> `dp[0]`、`dp[1]` 是什么？越界怎么办？

## 模板

```js
function dp(nums) {
  const n = nums.length;
  const dp = new Array(n + 1);

  // 1. 初始值
  dp[0] = 0;
  dp[1] = nums[0];

  // 2. 转移
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1]);
  }

  // 3. 返回
  return dp[n];
}
```

## 优化

- **空间优化**：如果只依赖前一个状态，可以用滚动变量代替数组
- **初始化技巧**：`dp` 数组长度设为 `n+1`，多一个"虚拟的第 0 位"来处理边界

## 本质

> 动态规划 = 递归 + 记忆化。先把问题拆成子问题（递归），然后从底向上算（避免重复计算）。
