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

  const stats = [
    {
      icon: FileText,
      label: lang === "zh" ? "文章数目" : "Articles",
      value: String(siteStats.totalPosts + siteStats.totalNotes),
    },
    {
      icon: Type,
      label: lang === "zh" ? "本站总字数" : "Total Words",
      value: formatNumber(siteStats.totalWords),
    },
    {
      icon: Users,
      label: lang === "zh" ? "本站访客数" : "Visitors",
      value: loading ? "—" : formatNumber(visitors),
    },
    {
      icon: Eye,
      label: lang === "zh" ? "本站总浏览量" : "Total Views",
      value: loading ? "—" : formatNumber(totalViews),
    },
    {
      icon: Clock,
      label: lang === "zh" ? "最后更新" : "Last Updated",
      value: formatDate(siteStats.latestDate, lang),
    },
  ];

  return (
    <div className="rounded-xl border border-hairline bg-surface-soft/50 p-6">
      <h3 className="font-display text-lg text-ink mb-4">
        {lang === "zh" ? "网站信息" : "Site Info"}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface-soft/60 border border-hairline/50"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted truncate">{item.label}</p>
              <p className="text-sm font-semibold text-ink">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
