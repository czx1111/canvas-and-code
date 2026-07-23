---
slug: react-hooks-in-practice
title: "React Hooks 实战：我真正使用的模式"
excerpt: "超越 useState 和 useEffect——那些在生产级 React 应用中解决真实问题的 Hook 模式。"
category: Engineering
date: 2024-11-28
readTime: 7 分钟
---

## 超越基础

每个 React 教程都教 `useState` 和 `useEffect`。但当你构建真实应用时，你很快发现内置 Hooks 只是原语——更强大模式的构建块。

以下是我一次又一次使用的模式。

## 1. 自定义数据 Hook

最有价值的模式：将数据获取封装在自定义 Hook 中。

```jsx
function usePost(slug) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPost(slug)
      .then(data => {
        if (!cancelled) {
          setPost(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [slug]);

  return { post, loading, error };
}
```

关键细节：`cancelled` 标志防止卸载后的状态更新。这消除了经典的"无法在已卸载组件上执行状态更新"警告。

## 2. Context + Reducer

对于多个组件需要读取和更新的全局状态：

```jsx
const BlogStateContext = createContext();

function blogReducer(state, action) {
  switch (action.type) {
    case 'SET_POSTS':
      return { ...state, posts: action.posts };
    case 'SET_LANG':
      return { ...state, lang: action.lang };
    default:
      return state;
  }
}

export function BlogProvider({ children }) {
  const [state, dispatch] = useReducer(blogReducer, initialState);
  return (
    <BlogStateContext.Provider value={{ state, dispatch }}>
      {children}
    </BlogStateContext.Provider>
  );
}
```

对于大多数应用来说，这比 Redux 更简单，且完全在 React 自身的 API 内。

## 3. 派生状态模式

一个常见错误：将派生数据存储在状态中。

```jsx
// 差：将过滤后的文章存储在状态中
const [posts, setPosts] = useState(allPosts);
const [filteredPosts, setFilteredPosts] = useState(allPosts);

// 好：即时派生
const [posts] = useState(allPosts);
const [category, setCategory] = useState('All');
const filteredPosts = useMemo(
  () => category === 'All' ? posts : posts.filter(p => p.category === category),
  [posts, category]
);
```

对昂贵的派生使用 `useMemo`。黄金法则：**不要将可以从现有状态计算出的任何东西放入状态**。

## 4. Effect 清理模式

每个副作用都应在之后清理自己：

```jsx
useEffect(() => {
  const controller = new AbortController();
  
  fetch(`/api/posts/${slug}`, { signal: controller.signal })
    .then(res => res.json())
    .then(setPost);

  return () => controller.abort();
}, [slug]);
```

使用 `AbortController` 比 `cancelled` 标志更干净——它实际上取消了网络请求。

## 5. Refs 用于可变值

当你需要一个*不应*触发重新渲染的可变值时：

```jsx
function SearchInput() {
  const [query, setQuery] = useState('');
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    setQuery(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // 执行搜索
    }, 300);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return <input value={query} onChange={handleChange} />;
}
```

## 结论

React Hooks 的美妙之处在于它们是**可组合的**。你从 `useState` 和 `useEffect` 开始，逐步构建出表达你应用特定需求的自定义 Hooks。

上述模式并非火箭科学。它们只是基础知识的谨慎应用。但它们会让你的代码库变得更加可维护。

---

*好的抽象不是发现的，而是提取的。从具体开始，找到模式，然后抽象。*
