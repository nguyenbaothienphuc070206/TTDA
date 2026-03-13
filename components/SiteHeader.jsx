"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { LESSONS } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

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

export default function SiteHeader() {
  const t = useTranslations("nav");
  const total = useMemo(() => LESSONS.length, []);
  const [doneCount, setDoneCount] = useState(0);
  const pathname = usePathname() || "/";

  useEffect(() => {
    const update = () => {
      const done = readDoneSlugs();
      setDoneCount(Array.isArray(done) ? done.length : 0);
    };

    update();

    window.addEventListener("vovinam-progress", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("vovinam-progress", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const isActive = (href) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--header-bg)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400/40 rounded-xl"
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

        <nav className="flex flex-wrap items-center gap-1">
          <NavItem href="/lo-trinh" active={isActive("/lo-trinh")}>{t("roadmap")}</NavItem>
          <NavItem href="/hoc-tap" active={isActive("/hoc-tap")}>{t("course")}</NavItem>
          <NavItem href="/video" active={isActive("/video")}>{t("videos")}</NavItem>
          <NavItem href="/ky-thuat" active={isActive("/ky-thuat")}>{t("techniques")}</NavItem>
          <NavItem href="/lich-tap" active={isActive("/lich-tap")}>{t("schedule")}</NavItem>
          <NavItem href="/dinh-duong" active={isActive("/dinh-duong")}>{t("nutrition")}</NavItem>
          <NavItem href="/cua-hang" active={isActive("/cua-hang")}>{t("store")}</NavItem>
          <NavItem href="/ho-so" active={isActive("/ho-so")}>{t("profile")}</NavItem>

          <Link
            href="/tien-do"
            className="hidden sm:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 ml-1 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            aria-label={t("progressAria")}
          >
            <span className="text-xs text-slate-300">{t("progress")}</span>
            <span className="text-xs font-semibold text-blue-200">
              {doneCount}/{total}
            </span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 progress-bar"
                style={{ width: `${percent}%` }}
              />
            </div>
          </Link>

          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
