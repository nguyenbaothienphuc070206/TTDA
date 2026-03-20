import LearningDashboard from "@/components/LearningDashboard";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Khóa học",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Course (Learning Dashboard)",
      description:
        "Organized by all belt levels from Blue Self-Defense to Red Level 4, with automatic progress tracking based on completed lessons.",
    };
  }

  if (id === "ja") {
    return {
      title: "コース（Learning Dashboard）",
      description:
        "青帯護身から紅帯四級まで、全帯レベルで学習を整理。完了したレッスンに基づいて進捗を自動計算します。",
    };
  }

  return {
    title: "Khóa học (Learning Dashboard)",
    description:
      "Phân chia đầy đủ theo cấp đai từ Lam đai tự vệ đến Hồng đai tứ, và tự động tính tiến độ dựa trên bài học bạn đã đánh dấu hoàn thành.",
  };
}

export default async function LearningDashboardPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>
      </header>

      <LearningDashboard />
    </div>
  );
}
