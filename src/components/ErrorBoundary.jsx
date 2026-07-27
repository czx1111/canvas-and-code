import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { I18nContext } from "../contexts/I18nContext.jsx";

/**
 * ErrorBoundary — catches unhandled errors in child components
 * and displays a friendly fallback UI instead of a white screen.
 *
 * Uses I18nContext for localized error messages.
 */
export default class ErrorBoundary extends Component {
  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { t, lang } = this.context || { t: (s) => s, lang: "en" };

      return (
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h1 className="font-display text-3xl text-ink mb-3">
            {lang === "zh" ? "出错了" : "Something went wrong"}
          </h1>
          <p className="text-muted mb-8 leading-relaxed">
            {lang === "zh"
              ? "发生了意外错误。试试刷新页面——如果问题持续存在，请稍后再来。"
              : "An unexpected error occurred. Try refreshing the page — if the problem persists, please come back later."}
          </p>
          {this.state.error && import.meta.env.DEV && (
            <pre className="text-xs text-muted bg-surface-soft border border-hairline rounded-lg p-4 mb-6 overflow-x-auto text-left">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-active transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {lang === "zh" ? "重试" : "Try again"}
            </button>
            <a
              href="#/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-hairline text-ink font-medium text-sm hover:bg-surface-soft transition-colors"
            >
              {lang === "zh" ? "回到首页" : "Back home"}
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
