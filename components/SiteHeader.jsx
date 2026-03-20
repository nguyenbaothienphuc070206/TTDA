"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { LESSONS } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";

function NavItem({ href, active, children }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "rounded-full px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 " +
        (active
          ? "bg-white/10 text-white"
          : "text-slate-200 hover:bg-white/10 hover:text-white")
      }
    >
      {children}
    </Link>
  );
}

function ProgressNavItem({ href, active, label, doneCount, remainingCount, totalLessons }) {
  const safeTotal = Math.max(0, Number(totalLessons) || 0);
  const safeDone = Math.max(0, Number(doneCount) || 0);
  const percent = safeTotal > 0 ? Math.round((safeDone / safeTotal) * 100) : 0;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "inline-flex min-w-[150px] flex-col rounded-2xl px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 " +
        (active
          ? "bg-white/10 text-white"
          : "text-slate-200 hover:bg-white/10 hover:text-white")
      }
    >
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span className="inline-flex items-center gap-1 text-[11px]">
          <span className="rounded-full border border-emerald-400/25 bg-emerald-500/15 px-1.5 py-0.5 font-semibold text-emerald-200">
            {safeDone}
          </span>
          <span className="text-slate-300">{remainingCount}</span>
        </span>
      </span>

      <span className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
          style={{ width: `${percent}%` }}
        />
      </span>
    </Link>
  );
}

function LearningNavMenu({ label, items, isActive }) {
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const active = items.some((item) => isActive(item.href));

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

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 " +
          (active
            ? "bg-white/10 text-white"
            : "text-slate-200 hover:bg-white/10 hover:text-white")
        }
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{label}</span>
        <span className={"text-[10px] transition " + (open ? "rotate-180" : "")}>▾</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--header-bg)] shadow-[var(--shadow-card)] backdrop-blur"
        >
          {items.map((item) => {
            const itemActive = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={
                  "block px-3 py-2 text-sm transition focus:outline-none " +
                  (itemActive
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10 hover:text-white")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname() || "/";
  const totalLessons = LESSONS.length;
  const [doneCount, setDoneCount] = useState(0);

  const isActive = (href) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const learningItems = [
    { href: "/learning", label: t("learning") },
    { href: "/hoc-tap", label: t("course") },
    { href: "/video", label: t("videos") },
    { href: "/ky-thuat", label: t("techniques") },
  ];

  const navItems = [
    { href: "/cong-dong", label: t("community") },
    { href: "/lo-trinh", label: t("roadmap") },
    { href: "/lich-tap", label: t("schedule") },
    { href: "/dinh-duong", label: t("nutrition") },
    { href: "/cua-hang", label: t("store") },
    { href: "/ho-so", label: t("profile") },
  ];

  useEffect(() => {
    const lessonSlugSet = new Set(LESSONS.map((lesson) => lesson.slug));

    const sync = () => {
      const done = readDoneSlugs();
      const safe = Array.isArray(done)
        ? done.filter((slug) => lessonSlugSet.has(String(slug || "")))
        : [];
      setDoneCount(safe.length);
    };

    sync();
    window.addEventListener("vovinam-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const remainingCount = Math.max(0, totalLessons - doneCount);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--header-bg)] backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-slate-950 font-extrabold shadow-sm">
              V
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight text-white">
                {t("brandTitle")}
              </span>
              <span className="block text-xs text-slate-300">
                {t("brandSubtitle")}
              </span>
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <nav className="w-full">
            <div className="flex flex-wrap items-center gap-1">
              <LearningNavMenu label={t("learning")} items={learningItems} isActive={isActive} />
              {navItems.map((item) => (
                <NavItem key={item.href} href={item.href} active={isActive(item.href)}>
                  {item.label}
                </NavItem>
              ))}
              <ProgressNavItem
                href="/tien-do"
                active={isActive("/tien-do")}
                label={t("progress")}
                doneCount={doneCount}
                remainingCount={remainingCount}
                totalLessons={totalLessons}
              />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
