import { MapPin, Calendar, Coffee, Mail, Github, Twitter } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import SiteStats from "../components/SiteStats.jsx";

export default function About() {
  const { t, lang } = useI18n();

  const quickInfo = [
    { icon: MapPin, label: lang === "zh" ? "所在地" : "Based in", value: lang === "zh" ? "互联网" : "The Internet" },
    { icon: Calendar, label: lang === "zh" ? "写作始于" : "Writing since", value: "2024" },
    { icon: Coffee, label: lang === "zh" ? "燃料" : "Fuel", value: lang === "zh" ? "咖啡与好奇心" : "Coffee & Curiosity" },
    { icon: Mail, label: lang === "zh" ? "邮箱" : "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
  ];

  const colophon = [
    { label: "Framework", value: "React + Vite" },
    { label: "Styling", value: "Tailwind CSS" },
    { label: lang === "zh" ? "标题字体" : "Display Font", value: "Playfair Display" },
    { label: lang === "zh" ? "正文字体" : "Body Font", value: "Inter" },
    { label: lang === "zh" ? "代码字体" : "Code Font", value: "JetBrains Mono" },
    { label: "Hosting", value: "GitHub Pages" },
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Mail, href: "mailto:hello@example.com", label: "Email" },
  ];

  return (
    <div>
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-12">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-4">
            {t("about.title")}
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            {lang === "zh" ? "关于我是谁以及为什么写作的一点介绍。" : "A little about who I am and why I write."}
          </p>
        </div>

        {/* Hero card */}
        <div className="rounded-xl border border-hairline bg-surface-soft/50 overflow-hidden mb-12">
          <div className="h-48 relative">
            <img
              src="https://picsum.photos/seed/workspace/800/300"
              alt={lang === "zh" ? "工作空间" : "Workspace"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/60 to-transparent" />
          </div>
          <div className="p-6 -mt-12 relative">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center border-4 border-surface-soft mb-4 shadow-lg">
              <span className="text-white font-display text-2xl font-bold">A</span>
            </div>
            <h2 className="font-display text-2xl text-ink mb-1">
              {lang === "zh" ? "作者" : "Author"}
            </h2>
            <p className="text-primary text-sm font-medium mb-4">
              {lang === "zh" ? "写作者 · 开发者 · 设计师" : "Writer · Developer · Designer"}
            </p>
            <p className="text-body leading-relaxed mb-6">
              {lang === "zh"
                ? "我是一名软件开发者和设计爱好者，相信以温暖和意图来构建事物。这个博客是我在互联网上的角落，分享关于工程、设计、创意以及工艺与技术交叉领域的思考。"
                : "I'm a software developer and design enthusiast who believes in building things with warmth and intention. This blog is my corner of the internet where I share thoughts on engineering, design, creativity, and the intersection of craft and technology."}
            </p>
            <p className="text-body leading-relaxed">
              {lang === "zh"
                ? "不写代码时，你会发现我在笔记本上涂鸦、阅读排版文章，或者尝试让网络感觉更人性化的新方法。"
                : "When I'm not coding, you'll find me sketching in notebooks, reading about typography, or experimenting with new ways to make the web feel more human."}
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {quickInfo.map((info) => (
            <div
              key={info.label}
              className="flex items-center gap-3 p-4 rounded-xl border border-hairline bg-surface-soft/30"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <info.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">{info.label}</p>
                {info.href ? (
                  <a href={info.href} className="text-sm font-medium text-ink hover:text-primary transition-colors">
                    {info.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-ink">{info.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Site Stats */}
        <div className="mb-12">
          <SiteStats />
        </div>

        {/* About This Blog */}
        <div className="mb-12">
          <h2 className="font-display text-2xl text-ink mb-4">
            {t("about.blogTitle")}
          </h2>
          <div className="space-y-4 text-body leading-relaxed">
            <p>
              <strong className="font-medium text-ink">Canvas &amp; Code</strong>{" "}
              {t("about.blogP1")}
            </p>
            <p>{t("about.blogP2")}</p>
            <p>{t("about.blogP3")}</p>
          </div>
        </div>

        {/* Colophon */}
        <div className="rounded-xl border border-hairline bg-surface-dark p-6 mb-12">
          <h3 className="text-sm font-medium text-on-dark uppercase tracking-wider mb-4">
            {t("about.colophonTitle")}
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {colophon.map((item) => (
              <div key={item.label} className="contents">
                <span className="text-on-dark/50">{item.label}</span>
                <span className="text-on-dark/85">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connect */}
        <div>
          <h2 className="font-display text-2xl text-ink mb-4">
            {lang === "zh" ? "联系" : "Connect"}
          </h2>
          <p className="text-body leading-relaxed mb-6">
            {lang === "zh"
              ? "我总是乐于聊聊代码、设计或其间的一切。在网上找到我："
              : "I'm always happy to chat about code, design, or anything in between. Find me around the web:"}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-hairline bg-white text-sm font-medium text-ink hover:border-primary hover:text-primary transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
