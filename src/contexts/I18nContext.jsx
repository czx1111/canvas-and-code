import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../i18n.js";

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("blog-lang") || "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("blog-lang", lang);
  }, [lang]);

  const t = (path) => {
    const keys = path.split(".");
    let val = translations[lang];
    for (const k of keys) {
      if (val && typeof val === "object") {
        val = val[k];
      } else {
        return path;
      }
    }
    return val ?? path;
  };

  const toggleLang = () => setLang((prev) => (prev === "en" ? "zh" : "en"));

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
