import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag, Share2, Check, Twitter, Github, Linkedin } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useBlogData } from "../contexts/BlogDataContext.jsx";
import { formatDate } from "../lib/date.js";
import PostContent from "../components/PostContent.jsx";
import TableOfContents from "../components/TableOfContents.jsx";
import ReadingProgress from "../components/ReadingProgress.jsx";
import PostNav from "../components/PostNav.jsx";
import Comments from "../components/Comments.jsx";

export default function PostDetail() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const { posts } = useBlogData();
  const [copied, setCopied] = useState(false);

  const post = posts.find((p) => p.slug === slug);
  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl text-ink mb-2">404</p>
        <p className="text-muted mb-8">Post not found.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-active transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("post.backToBlog")}
        </Link>
      </div>
    );
  }

  const title = lang === "zh" && post.titleZh ? post.titleZh : post.title;
  const content = lang === "zh" && post.contentZh ? post.contentZh : post.content;
  const categoryLabel = t(`common.categories.${post.category}`);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // 在不安全上下文（如 HTTP）中剪贴板 API 不可用，静默处理
      });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <ReadingProgress />
      <div className="flex gap-10">
      <article className="flex-1 min-w-0 max-w-3xl mx-auto xl:mx-0">
      {/* Back link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("post.backToBlog")}
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
            <Tag className="w-3 h-3" />
            {categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight tracking-tight mb-4">
          {title}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-display text-sm font-bold">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{lang === "zh" ? "作者" : "Author"}</p>
              <time className="text-xs text-muted">{formatDate(post.date, lang)}</time>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="rounded-xl overflow-hidden mb-10 border border-hairline">
          <img
            src={post.coverImage}
            alt={title}
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <TableOfContents content={content} variant="mobile" />
      <PostContent content={content} />

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-hairline">
        {/* Share */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-muted" />
            <span className="text-sm text-muted">
              {lang === "zh" ? "分享这篇文章" : "Share this post"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 rounded-lg hover:bg-surface-soft text-muted hover:text-primary transition-colors">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
            </button>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-soft text-muted hover:text-primary transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://github.com/czx1111" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-soft text-muted hover:text-primary transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-soft text-muted hover:text-primary transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Author Card */}
        <div className="p-6 rounded-xl bg-surface-soft border border-hairline">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display text-lg font-bold">A</span>
            </div>
            <div>
              <p className="font-medium text-ink mb-1">{lang === "zh" ? "作者" : "Author"}</p>
              <p className="text-sm text-muted leading-relaxed">
                {lang === "zh"
                  ? "写作者、开发者，充满好奇心。在网上构建事物并分享我一路学到的东西。"
                  : "Writer, developer, and curious mind. Building things on the web and sharing what I learn along the way."}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Prev / Next */}
      <div className="mt-8">
        <PostNav prev={prevPost} next={nextPost} />
      </div>

      {/* Comments */}
      <Comments />
      </article>
      <aside className="hidden xl:block w-56 flex-shrink-0">
        <TableOfContents content={content} variant="desktop" />
      </aside>
      </div>
    </div>
  );
}
