import LearningDashboard from "@/components/LearningDashboard";
import MotivationPanel from "@/components/MotivationPanel";
import OfflineMeshPanel from "@/components/OfflineMeshPanel";
import TechniqueFeedbackSection from "@/components/TechniqueFeedbackSection";
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
        "Organized by all belt levels from Blue Self-Defense to Red Level 4, with progress tracking and a built-in technique feedback section.",
      chip: "14 Belt Levels",
      quickTechniqueFeedback: "Technique Feedback",
      quickProgress: "Progress",
      quickCommunity: "Community",
      motivationTitle: "Keep your standards high, keep your pace humane",
      motivationMessage:
        "Do not chase volume. Choose one lesson, train with clean form, then use the feedback loop to improve.",
      motivationPoint1: "One clean rep is better than ten rushed reps",
      motivationPoint2: "Use checklist + common errors after every session",
      motivationPoint3: "Consistency beats motivation spikes",
      motivationPrimary: "Open technique feedback",
      motivationSecondary: "View progress",
    };
  }

  if (id === "ja") {
    return {
      title: "コース（Learning Dashboard）",
      description:
        "青帯護身から紅帯四級まで、全帯レベルで学習を整理。進捗管理に加えて技術フィードバック機能を提供します。",
      chip: "14段階の帯",
      quickTechniqueFeedback: "技術フィードバック",
      quickProgress: "進捗",
      quickCommunity: "コミュニティ",
      motivationTitle: "基準は高く、ペースは無理なく",
      motivationMessage:
        "量を追いすぎず、1レッスンを丁寧に練習し、フィードバックで改善しましょう。",
      motivationPoint1: "速い反復より正確な1回",
      motivationPoint2: "毎回チェックリストで自己確認する",
      motivationPoint3: "継続は一時的な気分を超える",
      motivationPrimary: "技術フィードバックへ",
      motivationSecondary: "進捗を見る",
    };
  }

  return {
    title: "Khóa học (Learning Dashboard)",
    description:
      "Phân chia đầy đủ theo cấp đai từ Lam đai tự vệ đến Hồng đai tứ, kèm theo chấm chữa kỹ thuật để bạn biết sai ở đâu và sửa thế nào.",
    chip: "14 cấp đai",
    quickTechniqueFeedback: "Chấm chữa kỹ thuật",
    quickProgress: "Tiến độ",
    quickCommunity: "Cộng đồng",
    motivationTitle: "Giữ tiêu chuẩn cao, giữ nhịp tập vừa sức",
    motivationMessage:
      "Đừng chạy theo số lượng. Chọn 1 bài, tập sạch động tác, rồi dùng vòng lặp feedback để tiến bộ thật.",
    motivationPoint1: "1 lần đúng còn hơn 10 lần vội",
    motivationPoint2: "Luôn tự kiểm tra checklist sau khi tập",
    motivationPoint3: "Đều đặn thắng cảm hứng nhất thời",
    motivationPrimary: "Mở chấm chữa",
    motivationSecondary: "Xem tiến độ",
  };
}

export default async function LearningDashboardPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 surface-card-strong enterprise-shell rounded-3xl p-6 sm:p-8">
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
          <Link href="#cham-chua-ky-thuat" className="cta-secondary inline-flex h-9 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white">
            {copy.quickTechniqueFeedback}
          </Link>
          <Link href="/tien-do" className="cta-secondary inline-flex h-9 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white">
            {copy.quickProgress}
          </Link>
          <Link href="/cong-dong" className="cta-secondary inline-flex h-9 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white">
            {copy.quickCommunity}
          </Link>
        </div>
      </header>

      <div className="mb-6">
        <MotivationPanel
          title={copy.motivationTitle}
          message={copy.motivationMessage}
          points={[copy.motivationPoint1, copy.motivationPoint2, copy.motivationPoint3]}
          primaryHref="#cham-chua-ky-thuat"
          primaryLabel={copy.motivationPrimary}
          secondaryHref="/tien-do"
          secondaryLabel={copy.motivationSecondary}
        />
      </div>

      <LearningDashboard />

      <TechniqueFeedbackSection />

      <div className="mt-6">
        <OfflineMeshPanel />
      </div>
    </div>
  );
}
