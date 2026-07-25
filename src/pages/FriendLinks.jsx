import { Link } from "react-router-dom";
import { ExternalLink, Link2, Heart, Mail } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import SEO from "../components/SEO.jsx";

/**
 * FriendLinks — displays friend links (blogroll).
 * Data is defined inline; edit the `friendLinks` array to add/remove links.
 */
const friendLinks = [
  {
    name: "Example Blog",
    url: "https://example.com",
    avatar: "https://picsum.photos/seed/friend1/100/100",
    desc: "一个优秀的个人博客",
    descEn: "An excellent personal blog",
    tags: ["前端", "设计"],
  },
  {
    name: "Another Site",
    url: "https://another.example.com",
    avatar: "https://picsum.photos/seed/friend2/100/100",
    desc: "关于后端与架构的思考",
    descEn: "Thoughts on backend and architecture",
    tags: ["后端", "架构"],
  },
  {
    name: "Dev Notes",
    url: "https://dev.example.com",
    avatar: "https://picsum.photos/seed/friend3/100/100",
    desc: "开发者的日常笔记",
    descEn: "A developer's daily notes",
    tags: ["工具", "效率"],
  },
  {
    name: "Design Hub",
    url: "https://design.example.com",
    avatar: "https://picsum.photos/seed/friend4/100/100",
    desc: "视觉设计与创意灵感",
    descEn: "Visual design and creative inspiration",
    tags: ["设计", "创意"],
  },
];

// My own site info for link exchange
const mySiteInfo = {
  name: "Canvas & Code",
  url: "https://canvas-and-code.example.com",
  avatar: "https://picsum.photos/seed/canvas-code/100/100",
  desc: "关于工程、设计与创造之道的个人博客",
  descEn: "A personal blog about engineering, design, and the craft of building things.",
};

export default function FriendLinks() {
  const { lang } = useI18n();

  return (
    <div>
      <SEO
        title={lang === "zh" ? "友链" : "Friend Links"}
        description={lang === "zh" ? "我欣赏的博客与朋友们" : "Blogs I admire and friends"}
      />
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {lang === "zh" ? "友链" : "Links"}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-3">
          {lang === "zh" ? "友情链接" : "Friend Links"}
        </h1>
        <p className="text-muted text-lg max-w-lg">
          {lang === "zh"
            ? "我欣赏的博客与朋友们，欢迎互相交流。"
            : "Blogs I admire and friends. Always happy to connect."}
        </p>
      </section>

      {/* Link Exchange Info */}
      <section className="max-w-5xl mx-auto px-6 pb-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-semibold text-ink">
              {lang === "zh" ? "申请友链" : "Link Exchange"}
            </h2>
          </div>
          <p className="text-sm text-body leading-relaxed mb-4">
            {lang === "zh"
              ? "如果你想和我交换友链，请将以下信息添加到你的网站，然后通过下方联系方式告诉我我："
              : "If you'd like to exchange links, please add the following info to your site and let me know via the contact below:"}
          </p>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-canvas/60 border border-hairline">
            <img
              src={mySiteInfo.avatar}
              alt={mySiteInfo.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-medium text-ink text-sm">{mySiteInfo.name}</p>
              <p className="text-xs text-muted truncate">{mySiteInfo.url}</p>
              <p className="text-xs text-body mt-1">
                {lang === "zh" ? mySiteInfo.desc : mySiteInfo.descEn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <a
              href="mailto:hello@example.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-surface-soft text-sm font-medium text-ink hover:border-primary hover:text-primary transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {lang === "zh" ? "联系我" : "Contact me"}
            </a>
          </div>
        </div>
      </section>

      {/* Friend Links Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendLinks.map((link, i) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group animate-fade-in-up flex items-start gap-4 p-5 rounded-xl border border-hairline/50 bg-surface-soft/40 hover:bg-surface-soft hover:border-hairline transition-all hover:shadow-sm hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
            >
              <img
                src={link.avatar}
                alt={link.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-hairline"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-display text-base font-medium text-ink group-hover:text-primary transition-colors truncate">
                    {link.name}
                  </h3>
                  <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-2">
                  {lang === "zh" ? link.desc : link.descEn}
                </p>
                {link.tags && link.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {link.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[10px] text-muted bg-surface-card border border-hairline"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
