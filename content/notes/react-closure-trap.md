---
slug: react-closure-trap
title: "React Hooks 中的闭包陷阱"
category: Frontend
date: 2024-12-22
readTime: 4 min
tags: [React, Hooks, 闭包]
---

## 什么是闭包陷阱

在 React 函数组件中，每次渲染都会创建**新的闭包**。如果 `useEffect` 或 `setTimeout` 捕获了旧的状态值，就会读到"过时"的数据。

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 永远是 0！
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 空依赖数组 → 只捕获了第一次渲染的 count
}
```

## 三种解法

### 1. 函数式更新

```jsx
setCount(prev => prev + 1); // 不依赖外部 count
```

### 2. 依赖数组加入 count

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  return () => clearInterval(timer);
}, [count]); // 每次 count 变化都重建 effect
```

### 3. useRef 保存最新值

```jsx
const countRef = useRef(count);
countRef.current = count; // 每次渲染更新

useEffect(() => {
  const timer = setInterval(() => {
    console.log(countRef.current); // 永远是最新值
    setCount(c => c + 1);
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

## 本质

闭包陷阱不是 React 的 bug，而是 JavaScript 闭包语义的自然结果。理解了**每次渲染都是一次新的函数调用**，就理解了一切。
