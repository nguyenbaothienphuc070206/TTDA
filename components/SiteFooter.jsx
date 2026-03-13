import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LEVELS } from "@/data/lessons";

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-sm text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded-lg"
    >
      {children}
    </Link>
  );
}

function FooterTitle({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">
      {children}
    </p>
  );
}

export default async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();
  const emergencySupportUrl = String(process.env.NEXT_PUBLIC_EMERGENCY_SUPPORT_URL || "").trim();

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                {t("ctaTitle")}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                {t("ctaDescription")}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/lo-trinh"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {t("startLearning")}
              </Link>
              <Link
                href="/lich-tap"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              >
                {t("createSchedule")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-slate-950 font-extrabold shadow-sm">
                V
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{t("brandName")}</p>
                <p className="text-xs text-slate-300">{t("brandSubtitle")}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              {t("brandDescription")}
            </p>
          </div>

          <div>
            <FooterTitle>{t("navTitle")}</FooterTitle>
            <div className="mt-3 grid gap-2">
              <FooterLink href="/">{t("links.home")}</FooterLink>
              <FooterLink href="/lo-trinh">{t("links.roadmap")}</FooterLink>
              <FooterLink href="/hoc-tap">{t("links.course")}</FooterLink>
              <FooterLink href="/video">{t("links.videos")}</FooterLink>
              <FooterLink href="/ky-thuat">{t("links.techniques")}</FooterLink>
              <FooterLink href="/lich-tap">{t("links.schedule")}</FooterLink>
              <FooterLink href="/dinh-duong">{t("links.nutrition")}</FooterLink>
              <FooterLink href="/tien-do">{t("links.progress")}</FooterLink>
              <FooterLink href="/cua-hang">{t("links.store")}</FooterLink>
              <FooterLink href="/ho-so">{t("links.profile")}</FooterLink>
              <FooterLink href="/ai-coach">{t("links.aiCoach")}</FooterLink>
              <FooterLink href="/admin">{t("links.admin")}</FooterLink>
              <FooterLink href="/chinh-sach-bao-mat">{t("links.privacy")}</FooterLink>
              <FooterLink href="/dieu-khoan">{t("links.terms")}</FooterLink>
            </div>
          </div>

          <div>
            <FooterTitle>{t("levelTitle")}</FooterTitle>
            <div className="mt-3 grid gap-2">
              {LEVELS.map((level) => (
                <FooterLink key={level.id} href={`/lo-trinh#${level.id}`}>
                  {level.title}
                </FooterLink>
              ))}
            </div>
          </div>

          <div>
            <FooterTitle>{t("safetyTitle")}</FooterTitle>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/80" />
                <span>{t("safety1")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/80" />
                <span>{t("safety2")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/80" />
                <span>{t("safety3")}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/80" />
                <span>{t("safety4")}</span>
              </li>
            </ul>

            {emergencySupportUrl ? (
              <div className="mt-4">
                <a
                  href={emergencySupportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  {t("emergencySupport")}
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {year} {t("brandName")} • {t("copyright")}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href="#top"
              className="text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded-lg"
            >
              {t("backToTop")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
