import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag, Share2, Check, Twitter, Github, Linkedin, Eye, ImageIcon } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useBlogData } from "../contexts/BlogDataContext.jsx";
import { formatDate } from "../lib/date.js";
import ArticleLayout from "../components/ArticleLayout.jsx";
import SEO from "../components/SEO.jsx";
import { useReadingHistory } from "../hooks/useReadingHistory.js";
import { useViewCount } from "../hooks/useViewCount.js";

export default function PostDetail() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const { posts } = useBlogData();
  const [copied, setCopied] = useState(false);
  const { addEntry } = useReadingHistory();

  const post = posts.find((p) => p.slug === slug);
  const { count: viewCount } = useViewCount(post ? slug : null);
  const [coverError, setCoverError] = useState(false);

  // Reset cover error state when navigating to a different post
  useEffect(() => { setCoverError(false); }, [slug]);

  // Track reading history
  useEffect(() => {
    if (post) {
      addEntry({
        slug: post.slug,
        type: "post",
        title: lang === "zh" && post.titleZh ? post.titleZh : post.title,
        date: post.date,
      });
    }
  }, [post, addEntry, lang]);
  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

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
      .catch(() => {});
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(title);
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  };

  const header = (
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
        <span className="flex items-center gap-1 text-xs text-muted">
          <Eye className="w-3 h-3" />
          {viewCount} {lang === "zh" ? "次阅读" : "views"}
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
  );

  const coverImage = post.coverImage && !coverError ? (
    <div className="rounded-xl overflow-hidden mb-10 border border-hairline">
      <img
        src={post.coverImage}
        alt={title}
        className="w-full h-64 md:h-80 object-cover"
        onError={() => setCoverError(true)}
      />
    </div>
  ) : coverError ? (
    <div className="rounded-xl overflow-hidden mb-10 border border-hairline h-64 md:h-80 bg-surface-soft flex flex-col items-center justify-center gap-2 text-muted">
      <ImageIcon className="w-8 h-8" />
      <span className="text-sm">{lang === "zh" ? "封面图加载失败" : "Cover image failed to load"}</span>
    </div>
  ) : null;

  const articleFooter = (
    <>
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
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-soft text-muted hover:text-primary transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="https://github.com/czx1111" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-soft text-muted hover:text-primary transition-colors">
            <Github className="w-4 h-4" />
          </a>
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-soft text-muted hover:text-primary transition-colors">
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
    </>
  );

  return (
    <ArticleLayout
      backTo="/blog"
      backLabel={t("post.backToBlog")}
      header={header}
      content={content}
      coverImage={coverImage}
      footer={articleFooter}
      prev={prevPost}
      next={nextPost}
      basePath="/post"
      currentSlug={post.slug}
      category={post.category}
      seriesId={post.series}
    >
      <SEO title={title} description={post.excerpt} ogType="article" ogImage={post.coverImage} />
    </ArticleLayout>
  );
}
