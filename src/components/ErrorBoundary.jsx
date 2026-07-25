import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * ErrorBoundary — catches unhandled errors in child components
 * and displays a friendly fallback UI instead of a white screen.
 */
export default class ErrorBoundary extends Component {
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
      return (
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h1 className="font-display text-3xl text-ink mb-3">
            Something went wrong
          </h1>
          <p className="text-muted mb-8 leading-relaxed">
            An unexpected error occurred. Try refreshing the page — if the
            problem persists, please come back later.
          </p>
          {this.state.error && (
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
              Try again
            </button>
            <a
              href="#/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-hairline text-ink font-medium text-sm hover:bg-surface-soft transition-colors"
            >
              Back home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
