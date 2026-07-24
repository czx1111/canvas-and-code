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

  useEffect(() => {
    if (!envId || !containerRef.current) return;

    let cancelled = false;
    let customizeInterval = null;
    setError(null);

    // ── 定制 Twikoo 表单：昵称栏改为 QQ 号输入 ──────────────
    // Twikoo 内置 checkQQ() 逻辑：当昵称为纯 QQ 号时，自动将邮箱设为
    // "号码@qq.com"，从而触发 QQ 头像显示。
    // 但 getQQNick() 在未配置 QQ_API_KEY 时会调用 clearNickIfFromQQInput()
    // 清空昵称，因此需要覆盖该方法以保留 QQ 号作为昵称。
    //
    // 定制函数在 useEffect 顶层定义（非 async initTwikoo 内部），
    // 确保 setInterval 不依赖 await import() 的完成时机。
    const customizeTwikoo = () => {
      const container = containerRef.current;
      if (!container || cancelled) return;

      // 1. 覆盖 clearNickIfFromQQInput，防止 QQ 号被清空
      const twikooEl = container.querySelector(".twikoo");
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
          // 不清空昵称，保留用户输入的 QQ 号
          comp.clearNickIfFromQQInput = function () {};
        }
      }

      // 2. 定制昵称输入框
      const nickInput = container.querySelector('input[name="nick"]');
      if (nickInput) {
        // 修改标签文字
        const nickWrapper = nickInput.closest(".el-input");
        const label = nickWrapper?.querySelector(
          ".el-input-group__prepend"
        );
        if (label) {
          label.textContent = "QQ";
        }
        // 修改占位符
        nickInput.placeholder =
          lang === "zh" ? "请输入QQ号" : "Enter QQ number";
        // 限制输入类型
        nickInput.setAttribute("inputmode", "numeric");
        nickInput.setAttribute("pattern", "[0-9]*");
        nickInput.setAttribute("maxlength", "11");

        // 添加输入限制：只允许数字
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

      // 3. 隐藏邮箱栏（由 QQ 号通过 checkQQ() 自动填充）
      const mailInput = container.querySelector('input[name="mail"]');
      if (mailInput) {
        const mailWrapper = mailInput.closest(".el-input");
        if (mailWrapper) {
          mailWrapper.style.display = "none";
        }
      }

      // 4. 添加提示文字
      const metaInput = container.querySelector(".tk-meta-input");
      if (metaInput && !metaInput.querySelector(".tk-qq-hint")) {
        const hint = document.createElement("div");
        hint.className = "tk-qq-hint";
        hint.textContent =
          lang === "zh"
            ? "输入QQ号将自动获取QQ头像"
            : "Enter your QQ number to use your QQ avatar";
        metaInput.appendChild(hint);
      }
    };

    // 立即开始轮询定制（不依赖 await import 完成时机）
    // customizeTwikoo 内部会跳过已完成的定制，所以高频调用是安全的。
    customizeInterval = setInterval(customizeTwikoo, 500);

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
          // 按 SPA 路由路径隔离评论，避免所有页面共享同一套评论
          path: location.pathname,
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
      if (customizeInterval) clearInterval(customizeInterval);
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
