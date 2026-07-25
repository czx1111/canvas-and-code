import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PostContent from "./PostContent.jsx";
import TableOfContents from "./TableOfContents.jsx";
import ReadingProgress from "./ReadingProgress.jsx";
import PostNav from "./PostNav.jsx";
import Comments from "./Comments.jsx";

/**
 * ArticleLayout — shared layout for PostDetail and NoteDetail.
 *
 * Extracts the common structure: reading progress bar, back link,
 * article header, TOC (mobile + desktop sidebar), content body,
 * footer, prev/next nav, and comments.
 *
 * @param {object} props
 * @param {string} props.backTo — route path for back link (e.g. "/blog")
 * @param {string} props.backLabel — text for back link
 * @param {React.ReactNode} props.header — article header content (badges, title, meta)
 * @param {string} props.content — markdown content string
 * @param {React.ReactNode} [props.coverImage] — optional cover image element
 * @param {React.ReactNode} [props.footer] — optional article footer content
 * @param {object} [props.prev] — previous article data
 * @param {object} [props.next] — next article data
 * @param {string} [props.basePath="/post"] — base path for prev/next links
 * @param {React.ReactNode} [props.children] — additional content (e.g. SEO)
 */
export default function ArticleLayout({
  backTo,
  backLabel,
  header,
  content,
  coverImage,
  footer,
  prev,
  next,
  basePath = "/post",
  children,
}) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {children}
      <ReadingProgress />
      <div className="flex gap-10">
        <article className="flex-1 min-w-0 max-w-3xl mx-auto xl:mx-0">
          {/* Back link */}
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>

          {/* Header */}
          {header}

          {/* Cover Image */}
          {coverImage}

          {/* Content */}
          <TableOfContents content={content} variant="mobile" />
          <PostContent content={content} />

          {/* Footer */}
          {footer && <footer className="mt-12 pt-8 border-t border-hairline">{footer}</footer>}

          {/* Prev / Next */}
          <div className="mt-8">
            <PostNav prev={prev} next={next} basePath={basePath} />
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
