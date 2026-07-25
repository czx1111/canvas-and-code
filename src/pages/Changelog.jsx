import { useState, useMemo } from "react";
import {
  GitCommit,
  Sparkles,
  Wrench,
  Bug,
  Palette,
  Zap,
  Filter,
} from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import SEO from "../components/SEO.jsx";

/**
 * Changelog — displays site update history in a timeline view.
 * Data is defined inline; edit the `changelog` array to add new entries.
 *
 * Entry types:
 *   - feature:    New functionality
 *   - improvement: Enhancement to existing features
 *   - fix:        Bug fix
 *   - design:     UI/UX or visual change
 *   - performance: Performance optimization
 */

const typeConfig = {
  feature: {
    icon: Sparkles,
    labelZh: "新功能",
    labelEn: "Feature",
    color: "text-accent-teal bg-accent-teal/10 border-accent-teal/20",
    dot: "bg-accent-teal",
  },
  improvement: {
    icon: Zap,
    labelZh: "优化",
    labelEn: "Improvement",
    color: "text-primary bg-primary/10 border-primary/20",
    dot: "bg-primary",
  },
  fix: {
    icon: Bug,
    labelZh: "修复",
    labelEn: "Fix",
    color: "text-error bg-error/10 border-error/20",
    dot: "bg-error",
  },
  design: {
    icon: Palette,
    labelZh: "设计",
    labelEn: "Design",
    color: "text-accent-amber bg-accent-amber/10 border-accent-amber/20",
    dot: "bg-accent-amber",
  },
  performance: {
    icon: Wrench,
    labelZh: "性能",
    labelEn: "Performance",
    color: "text-success bg-success/10 border-success/20",
    dot: "bg-success",
  },
};

const changelog = [
  {
    version: "v1.4.0",
    date: "2026-07-25",
    titleZh: "新增项目展示页与更新日志",
    titleEn: "Added Projects page and Changelog",
    entries: [
      {
        type: "feature",
        descZh: "新增项目展示页，支持分类筛选和状态标识",
        descEn: "Added Projects page with category filtering and status badges",
      },
      {
        type: "feature",
        descZh: "新增网站更新日志页，记录站点迭代历程",
        descEn: "Added site changelog page to track iteration history",
      },
      {
        type: "improvement",
        descZh: "导航栏和页脚新增项目与更新日志入口",
        descEn: "Added Projects and Changelog links to navbar and footer",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-07-20",
    titleZh: "浏览量统计与热门文章",
    titleEn: "View counts and popular posts",
    entries: [
      {
        type: "feature",
        descZh: "接入 Supabase 实现随笔浏览量统计",
        descEn: "Integrated Supabase for notes view count tracking",
      },
      {
        type: "feature",
        descZh: "首页新增热门文章板块，按浏览量排序展示 Top 5",
        descEn: "Added popular posts section on homepage, showing Top 5 by views",
      },
      {
        type: "feature",
        descZh: "新增站点访客统计（site_visits 表）",
        descEn: "Added site visitor tracking (site_visits table)",
      },
      {
        type: "improvement",
        descZh: "浏览量无数据时自动降级为 localStorage 模式",
        descEn: "View counts gracefully degrade to localStorage when offline",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-07-15",
    titleZh: "评论系统与留言板",
    titleEn: "Comment system and guestbook",
    entries: [
      {
        type: "feature",
        descZh: "集成 Twikoo 评论系统，支持 QQ 头像自动获取",
        descEn: "Integrated Twikoo comment system with QQ avatar support",
      },
      {
        type: "feature",
        descZh: "新增留言板页面，全站级评论留言",
        descEn: "Added guestbook page with site-wide comments",
      },
      {
        type: "improvement",
        descZh: "评论安全防护：频率限制、禁用词过滤、人工审核",
        descEn: "Comment security: rate limiting, forbidden words filter, manual review",
      },
      {
        type: "performance",
        descZh: "GitHub Actions 每 10 分钟保活 Twikoo，消除冷启动延迟",
        descEn: "GitHub Actions pings Twikoo every 10 min to prevent cold starts",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-07-10",
    titleZh: "搜索、标签云与归档",
    titleEn: "Search, tag cloud, and archive",
    entries: [
      {
        type: "feature",
        descZh: "新增 Ctrl+K 全局搜索弹窗，搜索文章和随笔",
        descEn: "Added Ctrl+K global search modal for posts and notes",
      },
      {
        type: "feature",
        descZh: "新增标签云页面，按标签浏览所有内容",
        descEn: "Added tag cloud page to browse all content by tags",
      },
      {
        type: "feature",
        descZh: "新增归档页面，时间线浏览所有文章和随笔",
        descEn: "Added archive page with timeline view of all content",
      },
      {
        type: "feature",
        descZh: "新增友情链接页面",
        descEn: "Added friend links page",
      },
      {
        type: "improvement",
        descZh: "首页新增随机一文和阅读历史功能",
        descEn: "Added random article and reading history to homepage",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-07-05",
    titleZh: "站点初始版本",
    titleEn: "Initial site release",
    entries: [
      {
        type: "feature",
        descZh: "基于 React + Vite + Tailwind CSS 构建博客系统",
        descEn: "Built blog system with React + Vite + Tailwind CSS",
      },
      {
        type: "feature",
        descZh: "内容即代码架构：Markdown 文件 + Git 版本控制 + GitHub Actions 自动部署",
        descEn: "Content-as-code architecture: Markdown files + Git versioning + GitHub Actions auto-deploy",
      },
      {
        type: "feature",
        descZh: "支持中英双语切换和暗黑/亮色主题",
        descEn: "Bilingual (CN/EN) support and dark/light theme toggle",
      },
      {
        type: "design",
        descZh: "温暖的设计系统：奶油色画布、珊瑚色点缀、衬线展示字体",
        descEn: "Warm design system: cream canvas, coral accents, serif display font",
      },
      {
        type: "feature",
        descZh: "文章详情支持目录、阅读进度条、相关文章、上下篇导航",
        descEn: "Post detail: TOC, reading progress bar, related posts, prev/next navigation",
      },
      {
        type: "feature",
        descZh: "自动生成 RSS Feed 和 Sitemap",
        descEn: "Auto-generated RSS Feed and Sitemap",
      },
    ],
  },
];

export default function Changelog() {
  const { lang } = useI18n();
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { key: "all", label: lang === "zh" ? "全部" : "All" },
    { key: "feature", label: lang === "zh" ? "新功能" : "Features" },
    { key: "improvement", label: lang === "zh" ? "优化" : "Improvements" },
    { key: "fix", label: lang === "zh" ? "修复" : "Fixes" },
    { key: "design", label: lang === "zh" ? "设计" : "Design" },
    { key: "performance", label: lang === "zh" ? "性能" : "Performance" },
  ];

  // Filter entries within each version
  const filteredChangelog = useMemo(() => {
    if (activeFilter === "all") return changelog;
    return changelog
      .map((version) => ({
        ...version,
        entries: version.entries.filter((e) => e.type === activeFilter),
      }))
      .filter((v) => v.entries.length > 0);
  }, [activeFilter]);

  // Stats
  const totalEntries = changelog.reduce((sum, v) => sum + v.entries.length, 0);

  return (
    <div>
      <SEO
        title={lang === "zh" ? "更新日志" : "Changelog"}
        description={lang === "zh" ? "网站功能迭代与更新记录" : "Site feature iterations and update history"}
      />
      {/* Header */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <GitCommit className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {lang === "zh" ? "更新日志" : "Changelog"}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-3">
          {lang === "zh" ? "网站更新日志" : "Site Changelog"}
        </h1>
        <p className="text-muted text-lg max-w-lg leading-relaxed">
          {lang === "zh"
            ? `记录每一次迭代。目前已发布 ${changelog.length} 个版本，共 ${totalEntries} 项更新。`
            : `Tracking every iteration. ${changelog.length} versions released with ${totalEntries} updates in total.`}
        </p>
      </section>

      {/* Filter */}
      <section className="max-w-3xl mx-auto px-6 pb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted flex-shrink-0" />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f.key
                  ? "bg-primary text-white"
                  : "bg-surface-soft text-muted hover:text-ink border border-hairline"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-hairline" />

          {filteredChangelog.map((version, vi) => (
            <div
              key={version.version}
              className="relative pl-12 pb-12 last:pb-0 animate-fade-in-up"
              style={{ animationDelay: `${vi * 100}ms`, opacity: 0 }}
            >
              {/* Version dot */}
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-canvas border-2 border-primary flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>

              {/* Version header */}
              <div className="mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-display text-2xl font-bold text-ink">
                    {version.version}
                  </h2>
                  <span className="text-xs text-muted">
                    {version.date}
                  </span>
                </div>
                <p className="text-sm text-body mt-1">
                  {lang === "zh" ? version.titleZh : version.titleEn}
                </p>
              </div>

              {/* Entries */}
              <div className="space-y-2">
                {version.entries.map((entry, ei) => {
                  const tc = typeConfig[entry.type] || typeConfig.feature;
                  const Icon = tc.icon;
                  return (
                    <div
                      key={ei}
                      className="flex items-start gap-3 p-3.5 rounded-lg border border-hairline/50 bg-surface-soft/30 hover:bg-surface-soft transition-colors"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${tc.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {lang === "zh" ? tc.labelZh : tc.labelEn}
                      </span>
                      <p className="text-sm text-body leading-relaxed pt-0.5">
                        {lang === "zh" ? entry.descZh : entry.descEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredChangelog.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted">
                {lang === "zh" ? "该类型下暂无更新记录" : "No updates of this type yet."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
