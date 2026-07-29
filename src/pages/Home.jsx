import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, CodeXml, Palette, Lightbulb, Pen, Tag, Clock, Shuffle, Hash, MessageCircle, Link2 } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useBlogData } from "../contexts/BlogDataContext.jsx";
import { formatDate } from "../lib/date.js";
import { posts as allPosts } from "../generated/posts-data.js";
import { notes as allNotes } from "../generated/notes-data.js";
import PostCard from "../components/PostCard.jsx";
import ReadingHistory from "../components/ReadingHistory.jsx";
import PopularPosts from "../components/PopularPosts.jsx";
import ContinueReading from "../components/ContinueReading.jsx";
import SEO from "../components/SEO.jsx";
import { useViewCounts } from "../hooks/useViewCount.js";

export default function Home() {
  const { t, lang } = useI18n();
  const { posts } = useBlogData();
  const navigate = useNavigate();

  const handleRandomArticle = () => {
    const all = [...allPosts, ...allNotes];
    if (all.length === 0) return;
    const random = all[Math.floor(Math.random() * all.length)];
    const path = allPosts.includes(random) ? `/post/${random.slug}` : `/note/${random.slug}`;
    navigate(path);
  };

  const featured = posts.find((p) => p.featured) || posts[0];
  const recent = posts.filter((p) => p !== featured).slice(0, 3);
  const [coverError, setCoverError] = useState(false);

  // Batch fetch view counts for posts on home page
  const postSlugs = useMemo(() => posts.map((p) => p.slug), [posts]);
  const { counts: postViewCounts } = useViewCounts(postSlugs);

  const categories = [
    { icon: CodeXml, name: t("home.catEngineering"), desc: lang === "zh" ? "代码、架构与软件构建工艺" : "Code, architecture, and the craft of building software", color: "text-primary", bg: "bg-primary/10", cat: "Engineering" },
    { icon: Palette, name: t("home.catDesign"), desc: lang === "zh" ? "视觉思维、界面与好设计的温暖" : "Visual thinking, interfaces, and the warmth of good design", color: "text-accent-teal", bg: "bg-accent-teal/10", cat: "Design" },
    { icon: Lightbulb, name: t("home.catThoughts"), desc: lang === "zh" ? "想法、灵感与之间的空间" : "Ideas, inspiration, and the spaces in between", color: "text-accent-amber", bg: "bg-accent-amber/10", cat: "Thoughts" },
  ];

  const ft = featured
    ? { title: lang === "zh" && featured.titleZh ? featured.titleZh : featured.title, excerpt: lang === "zh" && featured.excerptZh ? featured.excerptZh : featured.excerpt }
    : null;

  return (
    <div>
      <SEO />
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Grid paper background — 稿纸渐显 */}
        <div
          className="absolute inset-0 animate-fade-in opacity-0"
          style={{
            backgroundImage: 'linear-gradient(var(--color-hairline) 1px, transparent 1px), linear-gradient(90deg, var(--color-hairline) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to right, transparent 0%, black 60%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 60%)',
          }}
        />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-teal/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-section relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Pen className="w-3 h-3" />
              {lang === "zh" ? "个人博客" : "Personal Blog"}
            </div>
            <h1 className="font-display text-display md:text-display-lg text-ink tracking-tight mb-6">
              Canvas<span className="text-primary">&amp;</span>Code
            </h1>
            <p className="text-lg md:text-xl text-body leading-relaxed mb-8 max-w-lg">
              {t("home.heroTagline")}
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-active transition-colors shadow-sm shadow-primary/20"
              >
                <BookOpen className="w-4 h-4" />
                {t("home.heroCta")}
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-hairline text-ink font-medium text-sm hover:bg-surface-soft transition-colors"
              >
                {t("home.heroAbout")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to="/blog"
              state={{ category: cat.cat }}
              className="group p-5 rounded-xl border border-hairline bg-surface-soft/50 hover:bg-surface-soft hover:border-hairline transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${cat.bg} ${cat.color} mb-3`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-ink mb-1">{cat.name}</h3>
              <p className="text-sm text-muted leading-relaxed">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Continue Reading — renders only when an article is left unfinished */}
      <ContinueReading />

      {/* Featured */}
      {featured && ft && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-ink">{t("home.featuredTitle")}</h2>
            <Link to="/blog" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              {t("home.recentViewAll")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <Link
            to={`/post/${featured.slug}`}
            className="group block rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/20 bg-surface-soft border border-hairline"
          >
            <div className="relative overflow-hidden h-64">
              {featured.coverImage && !coverError ? (
                <img
                  src={featured.coverImage}
                  alt={ft.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
                  onError={() => setCoverError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent-teal/10 to-accent-amber/15 flex items-center justify-center transition-transform duration-700 ease-editorial group-hover:scale-[1.03]">
                  <span className="font-display text-6xl text-primary/30 select-none">
                    {ft.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-canvas/90 backdrop-blur-sm text-xs font-medium text-ink">
                  <Tag className="w-3 h-3" />
                  {t(`common.categories.${featured.category}`)}
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3 text-xs text-muted">
                <time>{formatDate(featured.date, lang)}</time>
                <span className="w-1 h-1 rounded-full bg-hairline" />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featured.readTime}
                </span>
              </div>
              <h3 className="font-display text-2xl text-ink group-hover:text-primary transition-colors mb-2 leading-snug">
                {ft.title}
              </h3>
              <p className="text-body leading-relaxed line-clamp-2 mb-4">
                {ft.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t("blog.readMore")}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Recent Posts */}
      {recent.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="font-display text-2xl text-ink mb-6">{t("home.recentTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recent.map((post, i) => (
              <PostCard key={post.slug} post={post} delay={i * 100} viewCount={postViewCounts[post.slug] || 0} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Posts */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <PopularPosts />
      </section>

      {/* Random Article + Quick Links */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Random Article */}
          <button
            onClick={handleRandomArticle}
            className="group flex items-center gap-4 p-5 rounded-xl border border-hairline bg-surface-soft/50 hover:bg-surface-soft hover:border-hairline transition-all hover:-translate-y-0.5 hover:shadow-sm text-left"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-teal/10 text-accent-teal flex-shrink-0">
              <Shuffle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-ink mb-0.5">
                {lang === "zh" ? "随机一文" : "Random Article"}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {lang === "zh" ? "不知道看什么？试试手气" : "Don't know what to read? Try your luck"}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors flex-shrink-0" />
          </button>

          {/* Quick Links */}
          <div className="flex items-center gap-2 p-5 rounded-xl border border-hairline bg-surface-soft/50">
            <Link
              to="/tags"
              className="flex flex-col items-center gap-1.5 flex-1 p-2 rounded-lg hover:bg-surface-soft transition-colors group"
            >
              <Hash className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
              <span className="text-xs text-muted group-hover:text-ink transition-colors">{lang === "zh" ? "标签" : "Tags"}</span>
            </Link>
            <Link
              to="/links"
              className="flex flex-col items-center gap-1.5 flex-1 p-2 rounded-lg hover:bg-surface-soft transition-colors group"
            >
              <Link2 className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
              <span className="text-xs text-muted group-hover:text-ink transition-colors">{lang === "zh" ? "友链" : "Links"}</span>
            </Link>
            <Link
              to="/guestbook"
              className="flex flex-col items-center gap-1.5 flex-1 p-2 rounded-lg hover:bg-surface-soft transition-colors group"
            >
              <MessageCircle className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
              <span className="text-xs text-muted group-hover:text-ink transition-colors">{lang === "zh" ? "留言" : "Guest"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Reading History */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <ReadingHistory />
      </section>

    </div>
  );
}
