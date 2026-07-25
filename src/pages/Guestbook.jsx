import { MessageCircle, Sparkles } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import Comments from "../components/Comments.jsx";
import SEO from "../components/SEO.jsx";

/**
 * Guestbook — a site-wide guestbook page using Twikoo comments.
 * Reuses the existing Comments component with a fixed path of /guestbook.
 */
export default function Guestbook() {
  const { lang } = useI18n();

  return (
    <div>
      <SEO
        title={lang === "zh" ? "留言板" : "Guestbook"}
        description={lang === "zh" ? "欢迎留下你的足迹" : "Leave your footprints here"}
      />
      {/* Header */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {lang === "zh" ? "留言板" : "Guestbook"}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink tracking-tight mb-3">
          {lang === "zh" ? "留下你的足迹" : "Leave Your Footprints"}
        </h1>
        <p className="text-muted text-lg max-w-lg leading-relaxed">
          {lang === "zh"
            ? "说点什么吧——可以是一句问候、一个建议、或者随便聊聊。每条留言我都会看到。"
            : "Say something — a greeting, a suggestion, or just chat. I read every message."}
        </p>
      </section>

      {/* Decorative banner */}
      <section className="max-w-3xl mx-auto px-6 pb-8">
        <div className="rounded-xl bg-gradient-to-br from-primary/8 via-accent-teal/5 to-accent-amber/8 border border-hairline p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-0.5">
              {lang === "zh" ? "欢迎留言！" : "Welcome!"}
            </p>
            <p className="text-xs text-muted leading-relaxed">
              {lang === "zh"
                ? "输入 QQ 号可自动获取头像，无需填写邮箱。"
                : "Enter your QQ number to auto-fetch your avatar. No email required."}
            </p>
          </div>
        </div>
      </section>

      {/* Comments / Guestbook */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <Comments />
      </section>
    </div>
  );
}
