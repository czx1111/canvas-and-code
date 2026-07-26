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
 *
 * 定制：昵称栏改为 QQ 号输入，自动获取 QQ 头像，邮箱栏隐藏（由 QQ 号自动填充）。
 */
export default function Comments() {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const location = useLocation();
  const [error, setError] = useState(null);

  const envId = import.meta.env.VITE_TWIKOO_ENV_ID;

  // ── Twikoo 初始化 ──────────────────────────────────────
  useEffect(() => {
    if (!envId || !containerRef.current) return;

    let cancelled = false;
    setError(null);

    const initTwikoo = async () => {
      try {
        const mod = await import("twikoo");
        const twikoo =
          mod.default && typeof mod.default.init === "function"
            ? mod.default
            : mod;
        if (cancelled || !containerRef.current) return;

        // Safely clear previous Twikoo instance without innerHTML
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }

        const result = twikoo.init({
          envId,
          el: containerRef.current,
          lang: lang === "zh" ? "zh-CN" : "en",
          darkMode: theme === "dark",
          path: location.pathname,
        });
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

  // ── 定制 Twikoo 表单：昵称栏改为 QQ 号 ──────────────────
  // 使用 MutationObserver 监听 DOM 变化，替代 setInterval 轮询
  // 观察范围限定在评论区容器内，避免全局 DOM 监听的性能开销
  useEffect(() => {
    if (!containerRef.current) return;

    const customize = () => {
      const root = containerRef.current;
      if (!root) return;
      // 在评论区容器内查找 Twikoo 表单
      const metaInputs = root.querySelectorAll(".tk-meta-input");
      metaInputs.forEach((metaInput) => {
        // 跳过已定制的表单
        if (metaInput.querySelector('input[name="nick"][data-qq-restrict]')) return;

        // 1. 覆盖 clearNickIfFromQQInput（包裹在 try-catch 中防止 Twikoo 内部结构变化导致崩溃）
        try {
          const twikooEl = metaInput.closest(".twikoo");
          if (twikooEl && twikooEl.__vue__) {
            const rootVue = twikooEl.__vue__;
            const findComp = (vm) => {
              if (vm.clearNickIfFromQQInput) return vm;
              for (const child of vm.$children || []) {
                const f = findComp(child);
                if (f) return f;
              }
              return null;
            };
            const comp = findComp(rootVue);
            if (comp) {
              comp.clearNickIfFromQQInput = function () {};
            }
          }
        } catch {
          // Twikoo 内部结构变化时静默失败
        }

        // 2. 定制昵称输入框
        const nickInput = metaInput.querySelector('input[name="nick"]');
        if (nickInput) {
          const nickWrapper = nickInput.closest(".el-input");
          const label = nickWrapper?.querySelector(
            ".el-input-group__prepend"
          );
          if (label) label.textContent = "QQ";
          nickInput.placeholder = "请输入QQ号";
          nickInput.setAttribute("inputmode", "numeric");
          nickInput.setAttribute("pattern", "[0-9]*");
          nickInput.setAttribute("maxlength", "11");

          if (!nickInput.dataset.qqRestrict) {
            nickInput.dataset.qqRestrict = "true";
            let isProcessing = false;
            nickInput.addEventListener("input", (e) => {
              if (isProcessing) return;
              const digits = e.target.value
                .replace(/[^0-9]/g, "")
                .substring(0, 11);
              if (digits !== e.target.value) {
                isProcessing = true;
                const setter = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  "value"
                ).set;
                setter.call(e.target, digits);
                e.target.dispatchEvent(new Event("input", { bubbles: true }));
                isProcessing = false;
              }
            });
          }
        }

        // 3. 隐藏邮箱栏
        const mailInput = metaInput.querySelector('input[name="mail"]');
        if (mailInput) {
          const mailWrapper = mailInput.closest(".el-input");
          if (mailWrapper) mailWrapper.style.display = "none";
        }

        // 4. 将 QQ 提示写入评论输入框 placeholder
        const submit = metaInput.closest(".tk-submit");
        if (submit) {
          const textarea = submit.querySelector(".el-textarea__inner");
          if (textarea && !textarea.dataset.qqHint) {
            textarea.dataset.qqHint = "true";
            const originalPlaceholder = textarea.placeholder || "";
            textarea.placeholder =
              (lang === "zh"
                ? "输入QQ号将自动获取QQ头像\n"
                : "Enter your QQ number to auto-fetch your avatar\n"
              ) + originalPlaceholder;
          }
        }
      });
    };

    // MutationObserver 范围限定在评论区容器内
    const observer = new MutationObserver(() => customize());
    observer.observe(containerRef.current, { childList: true, subtree: true });
    // Run once immediately
    customize();

    return () => observer.disconnect();
  }, []);

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
