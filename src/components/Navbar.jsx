import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, House, BookOpen, User, NotebookPen } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";

export default function Navbar() {
  const { t, lang, toggleLang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: t("nav.home"), icon: House },
    { to: "/blog", label: t("nav.blog"), icon: BookOpen },
    { to: "/notes", label: t("nav.notes"), icon: NotebookPen },
    { to: "/about", label: t("nav.about"), icon: User },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-canvas/80 border-b border-hairline">
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-white font-display text-sm font-bold">C</span>
          </div>
          <span className="font-display text-lg text-ink tracking-tight">Canvas &amp; Code</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "text-primary"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent text-body hover:bg-surface-soft hover:text-ink"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-semibold">{lang === "en" ? "EN" : "中"}</span>
          </button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
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
      {mobileOpen && (
        <div className="md:hidden border-t border-hairline bg-canvas">
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
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
      )}
    </header>
  );
}
