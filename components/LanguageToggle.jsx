"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const YEAR_SECONDS = 60 * 60 * 24 * 365;

const LANGS = [
  { locale: "vi", flag: "🇻🇳", labelKey: "vi" },
  { locale: "en", flag: "🇺🇸", labelKey: "en" },
  { locale: "ja", flag: "🇯🇵", labelKey: "ja" },
];

function setLocaleCookie(locale) {
  if (typeof document === "undefined") return;
  const safe = String(locale || "").trim();
  if (!safe) return;

  document.cookie = `NEXT_LOCALE=${encodeURIComponent(safe)}; Path=/; Max-Age=${YEAR_SECONDS}; SameSite=Lax`;
}

export default function LanguageToggle() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  const current = useMemo(() => {
    return LANGS.find((l) => l.locale === locale) || LANGS[0];
  }, [locale]);

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

  const onPick = (nextLocale) => {
    setLocaleCookie(nextLocale);
    setOpen(false);

    // Refresh server components with the new locale cookie.
    try {
      router.refresh();
    } catch {
      // fallback
      window.location.reload();
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        aria-label={t("label")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span aria-hidden>{current.flag}</span>
        <span className="hidden sm:inline">{t("label")}</span>
        <span className="text-blue-200" suppressHydrationWarning>
          {t(current.labelKey)}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--header-bg)] shadow-[var(--shadow-card)] backdrop-blur"
        >
          {LANGS.map((l) => {
            const active = l.locale === locale;

            return (
              <button
                key={l.locale}
                type="button"
                role="menuitem"
                onClick={() => onPick(l.locale)}
                className={
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition focus:outline-none " +
                  (active
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10 hover:text-white")
                }
              >
                <span aria-hidden className="text-base">
                  {l.flag}
                </span>
                <span className="font-semibold">{t(l.labelKey)}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
