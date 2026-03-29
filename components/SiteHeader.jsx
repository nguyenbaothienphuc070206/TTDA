"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { LESSONS } from "@/data/lessons";
import { fetchCommunityConversations } from "@/lib/community/messagesApi";
import { readDoneSlugs } from "@/lib/progress";

function NavItem({ href, active, children }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "inline-flex h-10 items-center rounded-full px-3.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 " +
        (active
          ? "bg-linear-to-r from-cyan-300/30 to-blue-500/30 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.4),0_10px_24px_rgba(14,116,144,0.2)]"
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
        "inline-flex min-w-44 flex-col rounded-2xl px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 " +
        (active
          ? "bg-linear-to-r from-cyan-300/30 to-blue-500/30 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.4),0_10px_24px_rgba(14,116,144,0.24)]"
          : "text-slate-200 hover:bg-white/10 hover:text-white")
      }
    >
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span className="inline-flex items-center gap-1 text-[11px]">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/20 px-1.5 text-[10px] font-semibold leading-none text-emerald-200">
            {safeDone}
          </span>
          <span className="text-slate-300">{remainingCount}</span>
        </span>
      </span>

      <span className="mt-1 h-1.5 w-full overflow-hidden rounded-full border border-slate-400/25 bg-slate-400/20">
        <span
          className="block h-full rounded-full bg-linear-to-r from-emerald-400 to-green-500"
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
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 " +
          (active
            ? "bg-linear-to-r from-cyan-300/30 to-blue-500/30 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.4),0_10px_24px_rgba(14,116,144,0.24)]"
            : "text-slate-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white")
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
          className="surface-card absolute left-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl"
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
  const [communityUnread, setCommunityUnread] = useState(0);

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

  useEffect(() => {
    let mounted = true;

    const syncUnread = async () => {
      try {
        const data = await fetchCommunityConversations({ limit: 20 });
        if (!mounted) return;
        setCommunityUnread(Math.max(0, Number(data?.unreadTotal) || 0));
      } catch {
        if (!mounted) return;
        setCommunityUnread(0);
      }
    };

    syncUnread();

    const timer = window.setInterval(syncUnread, 12_000);
    window.addEventListener("focus", syncUnread);

    return () => {
      mounted = false;
      clearInterval(timer);
      window.removeEventListener("focus", syncUnread);
    };
  }, []);

  const remainingCount = Math.max(0, totalLessons - doneCount);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-(--header-bg) backdrop-blur-xl">
      <div className="accent-line" />
      <div className="mx-auto w-full max-w-6xl px-4 py-2.5">
        <div className="surface-card-strong rounded-[1.75rem] px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          >
            <span className="pulse-ring inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300 to-blue-600 text-slate-950 font-extrabold shadow-sm">
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
          </div>

          <nav className="relative mt-2 w-full overflow-x-auto overflow-y-visible pb-1 ai-scrollbar">
            <div className="flex min-w-max items-center gap-1.5 pr-1">
              <LearningNavMenu label={t("learning")} items={learningItems} isActive={isActive} />
              {navItems.map((item) => {
                const isCommunity = item.href === "/cong-dong";
                const showBadge = isCommunity && communityUnread > 0;

                return (
                  <NavItem key={item.href} href={item.href} active={isActive(item.href)}>
                    <span className="inline-flex items-center gap-2">
                      <span>{item.label}</span>
                      {showBadge ? (
                        <span
                          aria-label={t("communityUnreadAria", { count: communityUnread })}
                          className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
                        >
                          {communityUnread}
                        </span>
                      ) : null}
                    </span>
                  </NavItem>
                );
              })}
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
