import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Impact Dashboard",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      intro: "Simulated metrics to illustrate product impact.",
      churnTitle: "Dropout rate",
      churnDesc: "Reduced thanks to a clearer roadmap and regular training reminders.",
      masteryTitle: "Mastery speed",
      masteryDesc: "Improved through AI Coach: instant guidance on common mistakes and safety.",
    };
  }

  if (id === "ja") {
    return {
      intro: "プロダクト効果を示すためのシミュレーション指標です。",
      churnTitle: "離脱率",
      churnDesc: "明確なロードマップと練習リマインダーにより改善。",
      masteryTitle: "習得スピード",
      masteryDesc: "AIコーチで、よくあるミスと安全面を即時に確認できるため向上。",
    };
  }

  return {
    intro: "Số liệu mô phỏng để minh hoạ hiệu quả sản phẩm.",
    churnTitle: "Tỷ lệ bỏ tập",
    churnDesc: "Giảm nhờ lộ trình rõ ràng và nhắc luyện tập.",
    masteryTitle: "Tốc độ nắm vững",
    masteryDesc: "Nhờ AI Coach: hỏi lỗi thường gặp & an toàn ngay khi tập.",
  };
}

export default async function ImpactDashboardPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Impact Dashboard
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-200">
          {copy.intro}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-6">
          <div className="text-sm font-semibold text-white">{copy.churnTitle}</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
            −30%
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-200">
            {copy.churnDesc}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-6">
          <div className="text-sm font-semibold text-white">{copy.masteryTitle}</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
            +20%
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-200">
            {copy.masteryDesc}
          </div>
        </div>
      </div>
    </div>
  );
}
