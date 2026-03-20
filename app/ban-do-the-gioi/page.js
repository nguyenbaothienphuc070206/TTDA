import Link from "next/link";
import { getLocale } from "next-intl/server";

import WorldHeatmap from "@/components/WorldHeatmap";

export const metadata = {
  title: "Bản đồ Võ đạo Thế giới",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      heading: "Global Martial Spirit Map",
      description:
        "This demo heatmap simulates activity levels by country. Click a country to view details.",
      backHome: "Back to home",
    };
  }

  if (id === "ja") {
    return {
      heading: "世界武道ヒートマップ",
      description:
        "このデモヒートマップは国ごとの活動度を表します。国をクリックすると詳細を確認できます。",
      backHome: "ホームへ戻る",
    };
  }

  return {
    heading: "Bản đồ Võ đạo Thế giới",
    description:
      "Global heatmap (demo) mô phỏng mức độ hoạt động theo quốc gia. Click vào quốc gia để xem thông tin.",
    backHome: "Về trang chủ",
  };
}

export default async function GlobalVoDaoMapPage() {
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
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.backHome} →
          </Link>
        </div>
      </header>

      <WorldHeatmap />
    </div>
  );
}
