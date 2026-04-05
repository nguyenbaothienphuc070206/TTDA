import Link from "next/link";
import { getLocale } from "next-intl/server";

import ScheduleBuilder from "@/components/ScheduleBuilder";

export const metadata = {
  title: "Lịch tập",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Schedule",
      description:
        "Build a simple 7-day plan and stay consistent. Your schedule is saved locally on this device.",
      thienVo: "Open Thiền Võ (Box Breathing) →",
    };
  }

  if (id === "ja") {
    return {
      title: "トレーニングスケジュール",
      description:
        "7日間のシンプルな練習計画を作成して継続しましょう。スケジュールはこの端末に保存されます。",
      thienVo: "Thiền Võ（ボックス呼吸）を開く →",
    };
  }

  return {
    title: "Lịch tập tuần",
    description:
      "Duy trì nhịp. Giữ kỷ luật.",
    thienVo: "Mở Thiền Võ (Box Breathing) →",
  };
}

export default async function SchedulePage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>

        <div className="mt-4">
          <Link
            href="/thien-vo"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.thienVo}
          </Link>
        </div>
      </header>

      <ScheduleBuilder />
    </div>
  );
}
