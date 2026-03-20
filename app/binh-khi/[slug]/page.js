import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { getBeltById } from "@/data/belts";
import { WEAPONS, getWeaponBySlug } from "@/data/weapons";

export async function generateStaticParams() {
  return WEAPONS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const weapon = getWeaponBySlug(slug);
  if (!weapon) return { title: "Binh Khí Phổ" };

  const title = `${weapon.title} | Binh Khí Phổ`;
  const description = weapon.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      section: "WEAPON COMPENDIUM",
      requirement: "Required level",
      onlyFor: (title) => (
        <>
          Available for <span className="font-semibold text-white">{title}</span> and above.
        </>
      ),
      safetyGoal:
        "Goal: safety and discipline. If you have not reached the required level yet, train your fundamentals first and ask your coach.",
      historyRole: "History & role in Vovinam",
      careSafety: "Maintenance & safety",
    };
  }

  if (id === "ja") {
    return {
      section: "武器技法ライブラリ",
      requirement: "必要レベル",
      onlyFor: (title) => (
        <>
          <span className="font-semibold text-white">{title}</span> 以上が対象です。
        </>
      ),
      safetyGoal:
        "目的は安全と規律です。必要帯に達していない場合は、まず基礎技術を練習し、指導者に相談してください。",
      historyRole: "Vovinamにおける歴史と役割",
      careSafety: "保管と安全",
    };
  }

  return {
    section: "BINH KHÍ PHỔ",
    requirement: "Yêu cầu cấp bậc",
    onlyFor: (title) => (
      <>
        Chỉ dành cho <span className="font-semibold text-white">{title}</span> trở lên.
      </>
    ),
    safetyGoal:
      "Mục tiêu là an toàn và kỷ luật: nếu chưa đạt cấp phù hợp, hãy tập kỹ thuật nền tảng trước và hỏi HLV.",
    historyRole: "Lịch sử & vai trò trong Vovinam",
    careSafety: "Bảo quản & an toàn",
  };
}

export default async function WeaponWikiPage({ params }) {
  const { slug } = await params;
  const locale = await getLocale();
  const copy = getCopy(locale);

  const weapon = getWeaponBySlug(slug);
  if (!weapon) notFound();

  const belt = getBeltById(weapon.requiredBeltId);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-6">
        <div className="text-xs font-semibold text-slate-300 tracking-widest">{copy.section}</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {weapon.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{weapon.summary}</p>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
            <div className="text-sm font-semibold text-white">{copy.requirement}</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {belt ? (
                <>
                  {copy.onlyFor(belt.title)}
                  <span className="block mt-1 text-xs text-slate-400">({belt.short})</span>
                </>
              ) : (
                <>
                  {copy.onlyFor(weapon.requiredBeltId)}
                </>
              )}
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              {copy.safetyGoal}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
            <div className="text-sm font-semibold text-white">{copy.historyRole}</div>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              {weapon.history.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
            <div className="text-sm font-semibold text-white">{copy.careSafety}</div>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              {weapon.care.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
