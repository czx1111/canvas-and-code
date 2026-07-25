import { Link } from "react-router-dom";
import { Github, Rss, Linkedin } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";

export default function Footer() {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/notes", label: t("nav.notes") },
    { to: "/about", label: t("nav.about") },
  ];

  const exploreLinks = [
    { to: "/tags", label: t("nav.tags") },
    { to: "/archive", label: t("nav.archive") },
    { to: "/projects", label: lang === "zh" ? "项目" : "Projects" },
    { to: "/changelog", label: lang === "zh" ? "更新日志" : "Changelog" },
    { to: "/links", label: lang === "zh" ? "友链" : "Links" },
    { to: "/guestbook", label: lang === "zh" ? "留言板" : "Guestbook" },
  ];

  const socialLinks = [
    { href: "https://github.com/czx1111", label: "GitHub", icon: Github },
    { href: "./feed.xml", label: "RSS", icon: Rss },
    { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  ];

  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-display text-xs font-bold">C</span>
              </div>
              <span className="font-display text-base text-ink tracking-tight">Canvas &amp; Code</span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              {t("footer.brandDesc")}
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-3 uppercase tracking-wider">
              {t("footer.nav")}
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-3 uppercase tracking-wider">
              {lang === "zh" ? "探索" : "Explore"}
            </h4>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-3 uppercase tracking-wider">
              {t("footer.social")}
            </h4>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {year} Canvas &amp; Code. {t("footer.rights")}
          </p>
          <p className="text-xs text-muted">{t("footer.deployed")}</p>
        </div>
      </div>
    </footer>
  );
}
