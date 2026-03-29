"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const THEME_KEY = "vovinam_theme_v1";

const THEMES = [
  { id: "light" },
  { id: "dark" },
  { id: "vodo" },
];

function applyTheme(themeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = themeId;
}

function normalizeTheme(themeId) {
  const id = String(themeId || "");
  return THEMES.some((t) => t.id === id) ? id : "light";
}

export default function ThemeToggle() {
  const t = useTranslations("theme");
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return normalizeTheme(window.localStorage.getItem(THEME_KEY));
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const options = useMemo(() => {
    return [
      { id: "light", label: t("light") },
      { id: "dark", label: t("dark") },
      { id: "vodo", label: t("vodo") },
    ];
  }, [t]);

  const current = useMemo(() => {
    return options.find((opt) => opt.id === theme) || options[0];
  }, [options, theme]);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [open]);

  const onSelect = (next) => {
    const normalized = normalizeTheme(next);
    setTheme(normalized);
    setOpen(false);

    try {
      window.localStorage.setItem(THEME_KEY, normalized);
    } catch {
      // ignore
    }

    applyTheme(normalized);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        aria-label={t("toggleAria")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="hidden sm:inline">{t("label")}</span>
        <span className="text-blue-200" suppressHydrationWarning>
          {current?.label || t("light")}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-60 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--header-bg)] shadow-[var(--shadow-card)] backdrop-blur"
        >
          {options.map((opt) => {
            const active = theme === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                role="menuitem"
                onClick={() => onSelect(opt.id)}
                className={
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition focus:outline-none " +
                  (active
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10 hover:text-white")
                }
                suppressHydrationWarning
              >
                <span className="font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
