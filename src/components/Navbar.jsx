import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, House, BookOpen, User, NotebookPen, Sun, Moon, Search, Archive, Hash, FolderGit2, GitCommit, ChevronDown, Layers } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";

export default function Navbar({ onSearchOpen }) {
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();

  // Primary links — always visible on desktop
  const primaryLinks = [
    { to: "/", label: t("nav.home"), icon: House },
    { to: "/blog", label: t("nav.blog"), icon: BookOpen },
    { to: "/notes", label: t("nav.notes"), icon: NotebookPen },
    { to: "/about", label: t("nav.about"), icon: User },
  ];

  // Secondary links — collapsed into "More" dropdown on desktop
  const secondaryLinks = [
    { to: "/series", label: t("nav.series"), icon: Layers },
    { to: "/tags", label: t("nav.tags"), icon: Hash },
    { to: "/archive", label: t("nav.archive"), icon: Archive },
    { to: "/projects", label: t("nav.projects"), icon: FolderGit2 },
    { to: "/changelog", label: t("nav.changelog"), icon: GitCommit },
  ];

  // All links for mobile menu
  const allLinks = [...primaryLinks, ...secondaryLinks];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isSecondaryActive = secondaryLinks.some((l) => isActive(l.to));

  // Close "More" dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-canvas/80 border-b border-hairline">
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-white font-display text-sm font-bold">C</span>
          </div>
          <span className="font-display text-lg text-ink tracking-tight">Canvas &amp; Code</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {primaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "text-primary"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* More Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSecondaryActive
                  ? "text-primary"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              }`}
            >
              {lang === "zh" ? "更多" : "More"}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {moreOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-hairline bg-canvas shadow-lg overflow-hidden animate-fadeIn">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? "text-primary bg-primary/5"
                        : "text-body hover:bg-surface-soft hover:text-ink"
                    }`}
                  >
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-hairline mx-1.5" />

          {/* Search Button */}
          <button
            onClick={onSearchOpen}
            className="p-2 rounded-lg text-sm font-medium transition-colors text-body hover:bg-surface-soft hover:text-ink"
            title={lang === "zh" ? "搜索 (Ctrl+K)" : "Search (Ctrl+K)"}
          >
            <Search className="w-4 h-4" />
          </button>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-sm font-medium transition-colors text-body hover:bg-surface-soft hover:text-ink"
            title={theme === "dark" ? (lang === "zh" ? "切换到亮色" : "Switch to light") : (lang === "zh" ? "切换到暗色" : "Switch to dark")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors text-body hover:bg-surface-soft hover:text-ink"
            title={lang === "zh" ? "切换语言" : "Switch language"}
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold">{lang === "en" ? "EN" : "中"}</span>
          </button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={onSearchOpen}
            className="p-2 rounded-lg text-body hover:bg-surface-soft"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-body hover:bg-surface-soft"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleLang}
            className="p-2 rounded-lg text-body hover:bg-surface-soft flex items-center gap-1"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-semibold">{lang === "en" ? "EN" : "中"}</span>
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-lg text-body hover:bg-surface-soft"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-hairline bg-canvas ${
          mobileOpen ? "max-h-96 opacity-100 border-t" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-1">
          {allLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary"
                  : "text-body hover:bg-surface-soft"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
