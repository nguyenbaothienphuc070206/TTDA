"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const THEME_KEY = "vovinam_theme_v1";

const THEMES = [
  { id: "dark" },
  { id: "midnight" },
];

function applyTheme(themeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = themeId;
}

function normalizeTheme(themeId) {
  const id = String(themeId || "");
  return THEMES.some((t) => t.id === id) ? id : "dark";
}

export default function ThemeToggle() {
  const t = useTranslations("theme");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return normalizeTheme(window.localStorage.getItem(THEME_KEY));
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const label = useMemo(() => {
    return theme === "midnight" ? t("midnight") : t("dark");
  }, [theme, t]);

  const onToggle = () => {
    const next = theme === "midnight" ? "dark" : "midnight";
    setTheme(next);

    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }

    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
      aria-label={t("toggleAria")}
      aria-pressed={theme === "midnight"}
    >
      <span className="hidden sm:inline">{t("label")}</span>
      <span className="text-blue-200" suppressHydrationWarning>
        {label}
      </span>
    </button>
  );
}
