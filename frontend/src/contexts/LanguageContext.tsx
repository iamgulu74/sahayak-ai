'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, Translations, TRANSLATIONS } from "@/lib/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: TRANSLATIONS.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Read saved language on client mount
  useEffect(() => {
    try {
      // Check cookie first or localStorage
      const match = typeof document !== 'undefined' ? document.cookie.match(/googtrans=\/en\/([a-z]{2})/) : null;
      const cookieLang = match ? (match[1] as LanguageCode) : null;
      const saved = (cookieLang || localStorage.getItem("sahayak_language")) as LanguageCode;

      if (saved && (saved === "en" || saved === "hi" || saved === "or")) {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      }
    } catch {}
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    if (typeof window === "undefined") return;
    if (lang === language) return;

    try {
      // 1. Save in state and storage
      setLanguageState(lang);
      localStorage.setItem("sahayak_language", lang);
      document.documentElement.lang = lang;

      // 2. Set or clear Google Translate cookie
      const hostname = window.location.hostname;
      if (lang === "en") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (hostname && hostname !== "localhost") {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
        }
      } else {
        const cookieVal = `/en/${lang}`;
        document.cookie = `googtrans=${cookieVal}; path=/;`;
        if (hostname && hostname !== "localhost") {
          document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
        }
      }

      // 3. Trigger Google Translate combo if present
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (combo) {
        combo.value = lang === "en" ? "" : lang;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // 4. Reload immediately and cleanly so the entire page translates 100%
      // without lag, without React state corruption, and without user needing to refresh manually!
      window.location.reload();
    } catch (e) {
      console.error("Language switch error:", e);
      window.location.reload();
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
