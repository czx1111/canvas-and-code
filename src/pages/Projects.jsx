import { useState, useMemo } from "react";
import { FolderGit2, ExternalLink, Github, Star, Filter } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import SEO from "../components/SEO.jsx";

/**
 * Projects — displays personal projects and open-source work.
 * Data is defined inline; edit the `projects` array to add/remove items.
 */

const projects = [
  {
    name: "Canvas & Code",
    desc: "基于 React + Vite + Tailwind CSS 的个人博客系统，内容即代码，无后端，Git 即 CMS。",
    descEn:
      "A personal blog system built with React + Vite + Tailwind CSS. Content as code, no backend, Git as CMS.",
    tags: ["React", "Vite", "Tailwind CSS", "Twikoo"],
    category: "web",
    github: "https://github.com/czx1111/canvas-and-code",
    demo: "https://czx1111.github.io/canvas-and-code/",
    stars: 0,
    featured: true,
    status: "active",
  },
  {
    name: "NoteHub",
    desc: "轻量级 Markdown 笔记管理工具，支持双向链接、标签分类和全文搜索。",
    descEn:
      "A lightweight Markdown note manager with bidirectional links, tag filtering, and full-text search.",
    tags: ["Vue", "IndexedDB", "Markdown"],
    category: "tools",
    github: "https://github.com/czx1111",
    demo: "",
    stars: 0,
    featured: false,
    status: "active",
  },
  {
    name: "AlgoVisualizer",
    desc: "算法可视化平台，支持排序、图论、动态规划等常见算法的动画演示。",
    descEn:
      "Algorithm visualization platform with animated demos for sorting, graph theory, dynamic programming, and more.",
    tags: ["React", "D3.js", "Algorithm"],
    category: "web",
    github: "https://github.com/czx1111",
    demo: "",
    stars: 0,
    featured: false,
    status: "active",
  },
  {
    name: "GoShell",
    desc: "用 Go 编写的轻量级 Web 终端，支持命令历史、管道和自定义别名。",
    descEn:
      "A lightweight web terminal written in Go, supporting command history, pipes, and custom aliases.",
    tags: ["Go", "WebSocket", "CLI"],
    category: "tools",
    github: "https://github.com/czx1111",
    demo: "",
    stars: 0,
    featured: false,
    status: "active",
  },
  {
    name: "Design Tokens Kit",
    desc: "设计令牌管理工具，一键导出 CSS Variables / Tailwind Config / JSON 格式。",
    descEn:
      "Design token management tool with one-click export to CSS Variables / Tailwind Config / JSON.",
    tags: ["TypeScript", "Design System", "CLI"],
    category: "opensource",
    github: "https://github.com/czx1111",
    demo: "",
    stars: 0,
    featured: false,
    status: "active",
  },
  {
    name: "PicCompress",
    desc: "纯前端图片压缩工具，支持批量处理、格式转换和质量调节，所有处理在浏览器完成。",
    descEn:
      "Pure frontend image compression tool with batch processing, format conversion, and quality adjustment. All processing happens in the browser.",
    tags: ["React", "Canvas API", "WASM"],
    category: "tools",
    github: "https://github.com/czx1111",
    demo: "",
    stars: 0,
    featured: false,
    status: "archived",
  },
];

const statusConfig = {
  active: {
    labelZh: "维护中",
    labelEn: "Active",
    color: "text-success bg-success/10 border-success/20",
    dot: "bg-success",
  },
  archived: {
    labelZh: "已归档",
    labelEn: "Archived",
    color: "text-muted bg-surface-card border-hairline",
    dot: "bg-muted",
  },
};

export default function Projects() {
  const { lang } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { key: "all", label: lang === "zh" ? "全部" : "All" },
    { key: "web", label: lang === "zh" ? "Web 应用" : "Web Apps" },
    { key: "tools", label: lang === "zh" ? "工具" : "Tools" },
    { key: "opensource", label: lang === "zh" ? "开源" : "Open Source" },
  ];

  const filtered = useMemo(() => {
    if (activeCategory === "all") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Sort: featured first, then by name
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [filtered]);

  return (
    <div>
      <SEO
        title={lang === "zh" ? "项目" : "Projects"}
        description={lang === "zh" ? "我的个人项目与开源作品" : "My personal projects and open-source work"}
      />
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <FolderGit2 className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {lang === "zh" ? "项目" : "Projects"}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-3">
          {lang === "zh" ? "项目展示" : "Projects"}
        </h1>
        <p className="text-muted text-lg max-w-lg leading-relaxed">
          {lang === "zh"
            ? "我的个人项目、开源作品和实验性想法。每一个都是好奇心驱动的产物。"
            : "My personal projects, open-source work, and experimental ideas. Each one is driven by curiosity."}
        </p>
      </section>

      {/* Filter */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-primary text-white"
                  : "bg-surface-soft text-muted hover:text-ink border border-hairline"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sorted.map((project, i) => {
            const st = statusConfig[project.status] || statusConfig.active;
            return (
              <div
                key={project.name}
                className="group animate-fade-in-up rounded-xl border border-hairline/50 bg-surface-soft/40 hover:bg-surface-soft hover:border-hairline transition-all hover:shadow-sm hover:-translate-y-0.5 p-6 flex flex-col"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FolderGit2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-medium text-ink group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      {project.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent-amber">
                          <Star className="w-3 h-3 fill-accent-amber" />
                          {lang === "zh" ? "精选" : "Featured"}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${st.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {lang === "zh" ? st.labelZh : st.labelEn}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-body leading-relaxed mb-4 flex-1">
                  {lang === "zh" ? project.desc : project.descEn}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded text-[10px] text-muted bg-surface-card border border-hairline font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-canvas text-sm font-medium text-ink hover:border-primary hover:text-primary transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      {lang === "zh" ? "源码" : "Code"}
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-canvas text-sm font-medium text-ink hover:border-primary hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {lang === "zh" ? "演示" : "Demo"}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sorted.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted">
              {lang === "zh" ? "该分类下暂无项目" : "No projects in this category yet."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
