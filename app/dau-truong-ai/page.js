import Link from "next/link";
import { getLocale } from "next-intl/server";

import AiSparringSimulator from "@/components/AiSparringSimulator";

export const metadata = {
  title: "Đấu trường AI",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      heading: "AI Sparring Arena",
      description:
        "Enter a sparring scenario (optionally with an image), and the system returns exactly 3 tactical options based on your belt level. Focus on safety, rhythm control, and clean technique.",
      openCoach: "Open AI Coach",
    };
  }

  if (id === "ja") {
    return {
      heading: "AIスパーリングアリーナ",
      description:
        "スパーリング状況（画像添付可）を入力すると、帯レベルに応じた戦術案を3つ返します。安全性、リズム管理、正確な技術を重視します。",
      openCoach: "AIコーチを開く",
    };
  }

  return {
    heading: "Đấu trường AI",
    description:
      "Nhập tình huống sparring (và có thể kèm ảnh), hệ thống trả về đúng 3 phương án chiến thuật theo cấp đai. Tập trung an toàn, kiểm soát nhịp và kỹ thuật sạch.",
    openCoach: "Mở AI Coach",
  };
}

export default async function AiArenaPage() {
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
            href="/ai-coach"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.openCoach} →
          </Link>
        </div>
      </header>

      <AiSparringSimulator />
    </div>
  );
}
