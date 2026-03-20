import Link from "next/link";
import { getLocale } from "next-intl/server";

import ThienVoBreathing from "@/components/ThienVoBreathing";

export const metadata = {
  title: "Thiền Võ",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      heading: "Meditation & Breathwork",
      description:
        "Breathing is foundational: stay calm, control power, and recover faster. This page provides Box Breathing (4-4-4-4) with gentle ambient sound.",
      backToSchedule: "Back to Schedule",
    };
  }

  if (id === "ja") {
    return {
      heading: "瞑想と呼吸法",
      description:
        "呼吸は土台です。落ち着き、力をコントロールし、回復を早めます。このページでは穏やかな環境音付きのボックス呼吸（4-4-4-4）を提供します。",
      backToSchedule: "スケジュールに戻る",
    };
  }

  return {
    heading: "Thiền Võ",
    description:
      "Thở là kỹ thuật nền tảng: bình tĩnh, kiểm soát lực và phục hồi nhanh. Trang này cung cấp Box Breathing (4-4-4-4) kèm âm nền nhẹ.",
    backToSchedule: "Quay lại Lịch tập",
  };
}

export default async function ThienVoPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {copy.heading}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              {copy.description}
            </p>
          </div>

          <Link
            href="/lich-tap"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.backToSchedule} →
          </Link>
        </div>
      </header>

      <ThienVoBreathing />
    </div>
  );
}

