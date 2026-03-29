import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { BELT_FAMILIES, getBeltsByFamilyId } from "@/data/belts";

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
  const levelFamilies = BELT_FAMILIES.map((family) => ({
    id: family.id,
    title: t(`levelGroups.${family.id}`),
    belts: getBeltsByFamilyId(family.id),
  })).filter((family) => family.belts.length > 0);

  return (
    <footer className="border-t border-white/10 bg-slate-950/15">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card-strong)] sm:p-8">
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
                href="/learning"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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

        <div className="mt-10 grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300 to-blue-500 text-slate-950 font-extrabold shadow-sm">
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

              <details>
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-1 text-sm text-slate-300 transition hover:text-white">
                  <span>{t("links.learning")}</span>
                  <span className="text-xs text-slate-400">▾</span>
                </summary>
                <div className="mt-2 grid gap-2 pl-3">
                  <FooterLink href="/learning">{t("links.learning")}</FooterLink>
                  <FooterLink href="/hoc-tap">{t("links.course")}</FooterLink>
                  <FooterLink href="/video">{t("links.videos")}</FooterLink>
                  <FooterLink href="/ky-thuat">{t("links.techniques")}</FooterLink>
                </div>
              </details>

              <FooterLink href="/cong-dong">{t("links.community")}</FooterLink>
              <FooterLink href="/lo-trinh">{t("links.roadmap")}</FooterLink>
              <FooterLink href="/lich-tap">{t("links.schedule")}</FooterLink>
              <FooterLink href="/dinh-duong">{t("links.nutrition")}</FooterLink>
              <FooterLink href="/tien-do">{t("links.progress")}</FooterLink>
              <FooterLink href="/cua-hang">{t("links.shop")}</FooterLink>
              <FooterLink href="/ai-coach">{t("links.aiCoach")}</FooterLink>
              <FooterLink href="/ho-so">{t("links.profile")}</FooterLink>
              <FooterLink href="/admin">{t("links.admin")}</FooterLink>
              <FooterLink href="/chinh-sach-bao-mat">{t("links.privacy")}</FooterLink>
              <FooterLink href="/dieu-khoan">{t("links.terms")}</FooterLink>
            </div>
          </div>

          <div>
            <FooterTitle>{t("levelTitle")}</FooterTitle>
            <div className="mt-3 grid gap-2">
              {levelFamilies.map((family) => (
                <details
                  key={family.id}
                  className="py-1"
                  open={family.id === "lam"}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{family.title}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                      {family.belts.length}
                    </span>
                  </summary>

                  <div className="mt-3 grid gap-2">
                    {family.belts.map((belt) => (
                      <FooterLink key={belt.id} href={`/lo-trinh#${belt.lessonLevel}`}>
                        {belt.title}
                      </FooterLink>
                    ))}
                  </div>
                </details>
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

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
