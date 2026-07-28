import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { posts as allPosts } from "../generated/posts-data.js";
import { useI18n } from "../contexts/I18nContext.jsx";
import { useReadingHistory } from "../hooks/useReadingHistory.js";
import SEO from "../components/SEO.jsx";

/**
 * Series — magazine-style landing page for post series.
 *
 * Fully data-driven: groups posts by the `series` frontmatter field.
 * A new series appears automatically the first time a post names it.
 * Optional per-series metadata via frontmatter (set on any post, first
 * non-empty wins): seriesTitle, seriesDescription, seriesStatus.
 * Read/unread progress comes from the reading-history localStorage.
 */
export default function Series() {
  const { lang } = useI18n();
  const { history } = useReadingHistory();

  const readSlugs = useMemo(
    () => new Set(history.filter((h) => h.type === "post").map((h) => h.slug)),
    [history]
  );

  const groups = useMemo(() => {
    const map = new Map();
    for (const p of allPosts) {
      if (!p.series) continue;
      if (!map.has(p.series)) map.set(p.series, []);
      map.get(p.series).push(p);
    }
    const list = [];
    for (const [id, posts] of map) {
      posts.sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
      const firstNonEmpty = (field) => posts.find((p) => p[field])?.[field] || "";
      const latest = posts.reduce((m, p) => (p.date > m ? p.date : m), "");
      list.push({
        id,
        title: firstNonEmpty("seriesTitle") || id,
        description: firstNonEmpty("seriesDescription") || posts[0].excerpt || "",
        status: firstNonEmpty("seriesStatus"),
        posts,
        latest,
      });
    }
    // Most recently active series first
    list.sort((a, b) => new Date(b.latest) - new Date(a.latest));
    return list;
  }, []);

  const getTitle = (p) => (lang === "zh" && p.titleZh ? p.titleZh : p.title);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <SEO
        title={lang === "zh" ? "专栏" : "Series"}
        description={lang === "zh" ? "按专题连载的系列文章" : "Ongoing article series by topic"}
      />

      {/* Header */}
      <section className="pt-4 pb-10">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-primary" />
          <p className="text-xs font-mono tracking-widest text-muted uppercase">Series</p>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-3">
          {lang === "zh" ? "专栏系列" : "Series"}
        </h1>
        <p className="text-body">
          {lang === "zh"
            ? `${groups.length} 个专栏 · ${groups.reduce((n, g) => n + g.posts.length, 0)} 篇文章`
            : `${groups.length} series · ${groups.reduce((n, g) => n + g.posts.length, 0)} articles`}
        </p>
      </section>

      {/* Series cards */}
      {groups.length === 0 ? (
        <p className="text-muted">
          {lang === "zh" ? "暂无专栏。" : "No series yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
          {groups.map((g, gi) => {
            const readCount = g.posts.filter((p) => readSlugs.has(p.slug)).length;
            const completed = g.status === "completed";
            // First unread post (fall back to the first post)
            const nextPost = g.posts.find((p) => !readSlugs.has(p.slug)) || g.posts[0];
            return (
              <div
                key={g.id}
                className={`relative flex flex-col p-5 rounded-xl border bg-surface-soft/50 hover:bg-surface-soft transition-colors ${
                  completed ? "border-hairline" : "border-primary/50"
                }`}
              >
                <span
                  className={`absolute top-4 right-4 text-xs px-2.5 py-0.5 rounded-full ${
                    completed
                      ? "bg-success/15 text-success"
                      : "bg-primary text-white"
                  }`}
                >
                  {completed
                    ? lang === "zh" ? "已完结" : "Completed"
                    : lang === "zh" ? "连载中" : "Ongoing"}
                </span>

                <p className="text-xs font-mono text-primary mb-1.5">
                  VOL.{String(gi + 1).padStart(2, "0")}
                </p>
                <h2 className="font-display text-xl text-ink leading-snug mb-2 pr-14">
                  {g.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-5 flex-1">
                  {g.description}
                </p>

                {/* Progress dots — each links to its post */}
                <div className="flex items-center gap-1.5 mb-4">
                  {g.posts.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/post/${p.slug}`}
                      title={getTitle(p)}
                      className={`w-2 h-2 rounded-full transition-transform hover:scale-125 ${
                        readSlugs.has(p.slug)
                          ? "bg-primary"
                          : "bg-hairline border border-hairline"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-muted ml-1.5">
                    {lang === "zh"
                      ? `已读 ${readCount}/${g.posts.length}`
                      : `${readCount}/${g.posts.length} read`}
                  </span>
                </div>

                <Link
                  to={`/post/${nextPost.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {readCount === 0
                    ? lang === "zh" ? "开始阅读" : "Start reading"
                    : readCount === g.posts.length
                      ? lang === "zh" ? "重读一遍" : "Read again"
                      : lang === "zh" ? "继续阅读" : "Continue"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
