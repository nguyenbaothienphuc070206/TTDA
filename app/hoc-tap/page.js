import LearningDashboard from "@/components/LearningDashboard";
import MotivationPanel from "@/components/MotivationPanel";
import Link from "next/link";
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
      chip: "14 Belt Levels",
      quickRoadmap: "Roadmap",
      quickProgress: "Progress",
      quickSchedule: "Schedule",
      motivationTitle: "Keep your standards high, keep your pace humane",
      motivationMessage:
        "Do not chase volume. Choose one lesson, do it cleanly, then mark it done. That habit compounds fast.",
      motivationPoint1: "One clean rep is better than ten rushed reps",
      motivationPoint2: "If form drops, reduce intensity",
      motivationPoint3: "Consistency beats motivation spikes",
      motivationPrimary: "Open roadmap",
      motivationSecondary: "View progress",
    };
  }

  if (id === "ja") {
    return {
      title: "コース（Learning Dashboard）",
      description:
        "青帯護身から紅帯四級まで、全帯レベルで学習を整理。完了したレッスンに基づいて進捗を自動計算します。",
      chip: "14段階の帯",
      quickRoadmap: "ロードマップ",
      quickProgress: "進捗",
      quickSchedule: "スケジュール",
      motivationTitle: "基準は高く、ペースは無理なく",
      motivationMessage:
        "量を追いすぎず、1レッスンを丁寧に完了させましょう。その積み重ねが最短です。",
      motivationPoint1: "速い反復より正確な1回",
      motivationPoint2: "フォームが崩れたら強度を下げる",
      motivationPoint3: "継続は一時的な気分を超える",
      motivationPrimary: "ロードマップを開く",
      motivationSecondary: "進捗を見る",
    };
  }

  return {
    title: "Khóa học (Learning Dashboard)",
    description:
      "Phân chia đầy đủ theo cấp đai từ Lam đai tự vệ đến Hồng đai tứ, và tự động tính tiến độ dựa trên bài học bạn đã đánh dấu hoàn thành.",
    chip: "14 cấp đai",
    quickRoadmap: "Roadmap",
    quickProgress: "Tiến độ",
    quickSchedule: "Lịch tập",
    motivationTitle: "Giữ tiêu chuẩn cao, giữ nhịp tập vừa sức",
    motivationMessage:
      "Đừng chạy theo số lượng. Chọn 1 bài, tập sạch động tác rồi đánh dấu hoàn thành. Thói quen này tăng trưởng rất nhanh.",
    motivationPoint1: "1 lần đúng còn hơn 10 lần vội",
    motivationPoint2: "Form xấu đi thì giảm cường độ",
    motivationPoint3: "Đều đặn thắng cảm hứng nhất thời",
    motivationPrimary: "Mở lộ trình",
    motivationSecondary: "Xem tiến độ",
  };
}

export default async function LearningDashboardPage() {
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
          <Link href="/lo-trinh" className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10">
            {copy.quickRoadmap}
          </Link>
          <Link href="/tien-do" className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10">
            {copy.quickProgress}
          </Link>
          <Link href="/lich-tap" className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10">
            {copy.quickSchedule}
          </Link>
        </div>
      </header>

      <div className="mb-6">
        <MotivationPanel
          title={copy.motivationTitle}
          message={copy.motivationMessage}
          points={[copy.motivationPoint1, copy.motivationPoint2, copy.motivationPoint3]}
          primaryHref="/lo-trinh"
          primaryLabel={copy.motivationPrimary}
          secondaryHref="/tien-do"
          secondaryLabel={copy.motivationSecondary}
        />
      </div>

      <LearningDashboard />
    </div>
  );
}
