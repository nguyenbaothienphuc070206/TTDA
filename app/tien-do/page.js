import ProgressDashboard from "@/components/ProgressDashboard";
import MotivationPanel from "@/components/MotivationPanel";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Tiến độ học tập",
};

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Learning Progress",
      description:
        "Track completed lessons and see which content you view most often. (Stats are device-based in this demo because no DB is connected yet.)",
      chip: "Progress Intelligence",
      actionCourse: "Open course",
      actionSchedule: "Open schedule",
      actionCoach: "Ask AI Coach",
      motivationTitle: "Your progress is real, even when it feels slow",
      motivationMessage:
        "Small wins matter. Keep the streak alive with one quality block today, then review what improved.",
      motivationPoint1: "Track trend, not just one day",
      motivationPoint2: "Protect technique before speed",
      motivationPoint3: "Celebrate completion, then reset calmly",
      motivationPrimary: "Continue course",
      motivationSecondary: "Talk to AI Coach",
    };
  }

  if (id === "ja") {
    return {
      title: "学習進捗",
      description:
        "完了したレッスン数と、よく見るコンテンツを確認できます。（このデモではDB未接続のため、統計は端末単位です。）",
      chip: "進捗インサイト",
      actionCourse: "コースを開く",
      actionSchedule: "スケジュールを開く",
      actionCoach: "AIコーチに相談",
      motivationTitle: "遅く感じても、進歩は積み上がっている",
      motivationMessage:
        "小さな達成を重ねましょう。今日は質の高い1ブロックを終え、改善点を確認すれば十分です。",
      motivationPoint1: "1日より全体の推移を見る",
      motivationPoint2: "速度よりフォームを守る",
      motivationPoint3: "達成を認めて、静かに次へ",
      motivationPrimary: "コースを続ける",
      motivationSecondary: "AIコーチに相談",
    };
  }

  return {
    title: "Tiến độ học tập",
    description:
      "Theo dõi số bài đã hoàn thành và thống kê xem bạn hay xem nội dung nào nhất. (Thống kê theo thiết bị vì bản demo chưa có DB.)",
    chip: "Progress Intelligence",
    actionCourse: "Mở khóa học",
    actionSchedule: "Mở lịch tập",
    actionCoach: "Hỏi AI Coach",
    motivationTitle: "Tiến độ của bạn là thật, dù có lúc thấy chậm",
    motivationMessage:
      "Những bước nhỏ đều có giá trị. Hôm nay chỉ cần hoàn thành 1 block tập chất lượng rồi nhìn lại điều bạn làm tốt hơn hôm qua.",
    motivationPoint1: "Nhìn xu hướng tuần, đừng chỉ nhìn 1 ngày",
    motivationPoint2: "Giữ form trước khi tăng tốc",
    motivationPoint3: "Hoàn thành xong thì bình tĩnh reset",
    motivationPrimary: "Tiếp tục khóa học",
    motivationSecondary: "Trao đổi AI Coach",
  };
}

export default async function ProgressPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {copy.chip}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/hoc-tap" className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10">
            {copy.actionCourse}
          </Link>
          <Link href="/lich-tap" className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10">
            {copy.actionSchedule}
          </Link>
          <Link href="/ai-coach" className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10">
            {copy.actionCoach}
          </Link>
        </div>
      </header>

      <div className="mb-6">
        <MotivationPanel
          title={copy.motivationTitle}
          message={copy.motivationMessage}
          points={[copy.motivationPoint1, copy.motivationPoint2, copy.motivationPoint3]}
          primaryHref="/hoc-tap"
          primaryLabel={copy.motivationPrimary}
          secondaryHref="/ai-coach"
          secondaryLabel={copy.motivationSecondary}
        />
      </div>

      <ProgressDashboard />
    </div>
  );
}
