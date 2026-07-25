import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * RouteScrollToTop — scrolls to top on every route path change.
 * Place it inside <HashRouter> alongside <Routes>.
 */
export default function RouteScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
