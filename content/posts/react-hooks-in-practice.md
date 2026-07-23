---
slug: react-hooks-in-practice
title: "React Hooks in Practice: Patterns I Actually Use"
titleZh: "React Hooks 实战：我真正使用的模式"
excerpt: "Beyond useState and useEffect — the hook patterns that solve real problems in production React applications."
excerptZh: "超越 useState 和 useEffect——那些在生产级 React 应用中解决真实问题的 Hook 模式。"
category: Engineering
date: 2026-07-23
readTime: 7 min
coverImage: ""
featured: false
---

## Beyond the Basics

Every React tutorial teaches `useState` and `useEffect`. But when you build real applications, you quickly discover that the built-in hooks are just primitives — building blocks for more powerful patterns.

Here are the patterns I reach for again and again.

## 1. Custom Data Hooks

The most valuable pattern: wrap your data fetching in a custom hook.

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

The key detail: the `cancelled` flag prevents state updates after unmount. This eliminates the classic "can't perform a React state update on an unmounted component" warning.

## 2. Context with Reducer

For global state that multiple components need to read and update:

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

This is simpler than Redux for most applications, and it lives entirely within React's own APIs.

## 3. The Derived State Pattern

A common mistake: storing derived data in state.

```jsx
// Bad: storing filtered posts in state
const [posts, setPosts] = useState(allPosts);
const [filteredPosts, setFilteredPosts] = useState(allPosts);

// Good: derive it on the fly
const [posts] = useState(allPosts);
const [category, setCategory] = useState('All');
const filteredPosts = useMemo(
  () => category === 'All' ? posts : posts.filter(p => p.category === category),
  [posts, category]
);
```

Use `useMemo` for expensive derivations. The golden rule: **don't put anything in state that can be computed from existing state**.

## 4. The Effect Cleanup Pattern

Every side effect should clean up after itself:

```jsx
useEffect(() => {
  const controller = new AbortController();
  
  fetch(`/api/posts/${slug}`, { signal: controller.signal })
    .then(res => res.json())
    .then(setPost);

  return () => controller.abort();
}, [slug]);
```

Using `AbortController` is cleaner than the `cancelled` flag — it actually cancels the network request.

## 5. Refs for Mutable Values

When you need a mutable value that should *not* trigger re-renders:

```jsx
function SearchInput() {
  const [query, setQuery] = useState('');
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    setQuery(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // perform search
    }, 300);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return <input value={query} onChange={handleChange} />;
}
```

## Conclusion

The beauty of React hooks is that they are **composable**. You start with `useState` and `useEffect`, and you build up to custom hooks that express your application's specific needs.

The patterns above are not rocket science. They are just careful applications of the basics. But they will make your codebase dramatically more maintainable.

---

*Good abstractions are not discovered, they are extracted. Start concrete, find the pattern, then abstract.*
