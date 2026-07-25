import { useState, useEffect } from "react";
import { FileText, Type, Users, Eye, Clock } from "lucide-react";
import { useI18n } from "../contexts/I18nContext.jsx";
import { siteStats } from "../generated/site-stats.js";
import { formatDate } from "../lib/date.js";
import { isSupabaseConfigured, registerSiteVisit, fetchSiteStats } from "../lib/supabase.js";

export default function SiteStats() {
  const { lang } = useI18n();
  const [visitors, setVisitors] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (isSupabaseConfigured) {
          await registerSiteVisit();
          const stats = await fetchSiteStats();
          if (!cancelled) {
            setVisitors(stats.visitors);
            setTotalViews(stats.totalViews);
          }
        }
      } catch (err) {
        console.warn("[site-stats] Unexpected error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatNumber = (n) => {
    if (n >= 10000) return lang === "zh" ? `${(n / 10000).toFixed(1)}万` : `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  // Primary stats — shown as large number cards
  const primaryStats = [
    {
      icon: FileText,
      label: lang === "zh" ? "文章数目" : "Articles",
      value: String(siteStats.totalPosts + siteStats.totalNotes),
    },
    {
      icon: Type,
      label: lang === "zh" ? "总字数" : "Words",
      value: formatNumber(siteStats.totalWords),
    },
    {
      icon: Users,
      label: lang === "zh" ? "访客数" : "Visitors",
      value: loading ? "—" : formatNumber(visitors),
    },
    {
      icon: Eye,
      label: lang === "zh" ? "浏览量" : "Views",
      value: loading ? "—" : formatNumber(totalViews),
    },
  ];

  return (
    <div className="rounded-xl border border-hairline bg-surface-soft/50 p-6">
      <h3 className="font-display text-lg text-ink mb-5">
        {lang === "zh" ? "网站信息" : "Site Info"}
      </h3>

      {/* Primary stats — 4 equal columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {primaryStats.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-surface-soft/60 border border-hairline/50 text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xl font-display font-bold text-ink leading-none mb-1">
              {item.value}
            </p>
            <p className="text-xs text-muted">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Last updated — full width footer row */}
      <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-surface-soft/40 border border-hairline/30">
        <Clock className="w-3.5 h-3.5 text-muted flex-shrink-0" />
        <span className="text-xs text-muted">{lang === "zh" ? "最后更新" : "Last Updated"}</span>
        <span className="text-xs font-medium text-ink">{formatDate(siteStats.latestDate, lang)}</span>
      </div>
    </div>
  );
}
