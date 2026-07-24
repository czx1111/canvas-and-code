import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useI18n } from "../contexts/I18nContext.jsx";

/**
 * Twikoo 评论组件
 *
 * 使用前请在 Twikoo 控制台创建环境，并将环境 ID 填入 .env：
 *   VITE_TWIKOO_ENV_ID=https://your-twikoo-backend.vercel.app
 *
 * 部署方式参考：https://twikoo.js.org/
 */
export default function Comments() {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const location = useLocation();
  const [error, setError] = useState(null);

  const envId = import.meta.env.VITE_TWIKOO_ENV_ID;

  useEffect(() => {
    if (!envId || !containerRef.current) return;

    let cancelled = false;
    setError(null);

    const initTwikoo = async () => {
      try {
        const mod = await import("twikoo");
        // twikoo 的 UMD 打包在 Vite ESM 互操作下，
        // init 可能在 mod 上也可能在 mod.default 上
        const twikoo =
          mod.default && typeof mod.default.init === "function"
            ? mod.default
            : mod;
        if (cancelled || !containerRef.current) return;

        // 清空上一次的评论内容（SPA 路由切换时需要重新初始化）
        containerRef.current.innerHTML = "";

        const result = twikoo.init({
          envId,
          el: containerRef.current,
          lang: lang === "zh" ? "zh-CN" : "en",
          darkMode: theme === "dark",
        });
        // twikoo.init() 可能返回 Promise，需要处理拒绝情况
        if (result && typeof result.catch === "function") {
          result.catch((err) => {
            if (!cancelled) {
              console.warn("[twikoo] init failed:", err);
              setError(String(err));
            }
          });
        }
      } catch (err) {
        setError(err.message || String(err));
      }
    };

    initTwikoo();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envId, lang, theme, location.pathname]);

  // 未配置 envId 时不渲染评论区
  if (!envId) return null;

  return (
    <section className="mt-12 pt-8 border-t border-hairline">
      <h2 className="font-display text-2xl font-semibold text-ink mb-lg">
        {t("post.comments")}
      </h2>
      {error && (
        <p className="text-sm text-red-500">
          Failed to load comments: {error}
        </p>
      )}
      <div ref={containerRef} />
    </section>
  );
}
