import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";

export default function NotFound() {
  const { lang } = useI18n();

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <p className="font-display text-7xl md:text-8xl text-primary mb-4">404</p>
      <p className="font-display text-2xl text-ink mb-2">
        {lang === "zh" ? "页面走丢了" : "Page not found"}
      </p>
      <p className="text-muted mb-10">
        {lang === "zh"
          ? "你访问的页面不存在，或者已经被移动了。"
          : "The page you're looking for doesn't exist or has been moved."}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-active transition-colors"
        >
          <Home className="w-4 h-4" />
          {lang === "zh" ? "回到首页" : "Back home"}
        </Link>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-hairline text-ink font-medium text-sm hover:bg-surface-soft transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === "zh" ? "浏览博客" : "Browse blog"}
        </Link>
      </div>
    </div>
  );
}
