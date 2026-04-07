import Link from "next/link";
import { getLocale } from "next-intl/server";

import JourneyStarterPanel from "@/components/JourneyStarterPanel";
import MotivationPanel from "@/components/MotivationPanel";
import { isPitchModeEnabled } from "@/lib/pitchMode";

export const metadata = {
  title: "Learning",
};

function HubCard({ href, title, description, cta }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-200/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_55%)]" />
      <div className="relative">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        <div className="mt-4 text-sm font-semibold text-cyan-200 transition group-hover:text-white">
          {cta}
        </div>
      </div>
    </Link>
  );
}

function QuickLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
    >
      {children}
    </Link>
  );
}

function StatChip({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-3 py-2">
      <div className="text-sm font-semibold text-white">{value}</div>
      <div className="text-[11px] text-slate-300">{label}</div>
    </div>
  );
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Learning",
      intro: "Gather Course and Video in one place for easier access.",
      eyebrow: "Training Hub",
      courseTitle: "Course",
      courseDesc: "Course dashboard across all 14 belt levels with learning progress.",
      courseCta: "Open course →",
      videoTitle: "Video",
      videoDesc: "Technique video library with quick in-page AI Q&A.",
      videoCta: "Open video library →",
      stat1Label: "Core tracks",
      stat2Label: "Practice flow",
      stat3Label: "Support tools",
      quickTools: "Quick learning tools",
      quickDesc: "Everything related to practice and progress is grouped in Learning.",
      motivationTitle: "Build momentum, not pressure",
      motivationMessage:
        "You only need one clean session today. Keep it focused, log progress, and let consistency do the heavy work.",
      motivationPoint1: "One lesson done is real progress",
      motivationPoint2: "Clean form beats fast reps",
      motivationPoint3: "Short sessions can still be high quality",
      motivationPrimary: "Start one lesson",
      motivationSecondary: "Plan this week",
      roadmap: "Roadmap",
      techniques: "Techniques",
      schedule: "Schedule",
      nutrition: "Nutrition",
      progress: "Progress",
      aiCoach: "AI Coach",
      formCheck: "AI Form Check",
    };
  }

  if (id === "ja") {
    return {
      title: "学習",
      intro: "Course と Video を1か所にまとめ、見つけやすくしました。",
      eyebrow: "トレーニングハブ",
      courseTitle: "コース",
      courseDesc: "14段階の帯レベルに対応した学習ダッシュボードと進捗管理。",
      courseCta: "コースを開く →",
      videoTitle: "動画",
      videoDesc: "技術動画ライブラリとページ内のAIクイックQ&A。",
      videoCta: "動画ライブラリを開く →",
      stat1Label: "主要トラック",
      stat2Label: "練習フロー",
      stat3Label: "補助ツール",
      quickTools: "クイック学習ツール",
      quickDesc: "練習と進捗に関する機能は Learning にまとまっています。",
      motivationTitle: "焦らず、勢いを作る",
      motivationMessage:
        "今日は1セッションを丁寧にやるだけで十分です。記録を残し、継続で積み上げましょう。",
      motivationPoint1: "1レッスン完了は確かな前進",
      motivationPoint2: "速さより正確なフォーム",
      motivationPoint3: "短時間でも質は高められる",
      motivationPrimary: "1レッスン開始",
      motivationSecondary: "今週を計画",
      roadmap: "ロードマップ",
      techniques: "技術",
      schedule: "スケジュール",
      nutrition: "栄養",
      progress: "進捗",
      aiCoach: "AIコーチ",
      formCheck: "AIフォームチェック",
    };
  }

  return {
    title: "Learning",
    intro: "Core flow cho người mới: AI Coach tạo buổi tập mỗi ngày, AI Form Check sửa form, rồi vào đúng bài cần học.",
    eyebrow: "Training Hub",
    courseTitle: "Course",
    courseDesc: "Dashboard khóa học theo hệ 14 cấp đai và tiến độ bài học.",
    courseCta: "Mở khóa học →",
    videoTitle: "Video",
    videoDesc: "Thư viện video bài quyền + hỏi nhanh kỹ thuật ngay trên trang.",
    videoCta: "Mở thư viện video →",
    stat1Label: "Trục học chính",
    stat2Label: "Luồng luyện tập",
    stat3Label: "Công cụ hỗ trợ",
    quickTools: "Công cụ học nhanh",
    quickDesc: "Dùng Learning như trung tâm điều phối: mở buổi tập, kiểm tra form và theo dõi tiến độ theo ngày.",
    motivationTitle: "Tập đều để tạo đà, không cần ép bản thân",
    motivationMessage:
      "Hôm nay chỉ cần làm trọn 1 buổi thật chỉn chu. Ghi lại tiến độ và để sự đều đặn kéo bạn tiến lên.",
    motivationPoint1: "Hoàn thành 1 bài là đã tiến bộ",
    motivationPoint2: "Đúng form quan trọng hơn tập nhanh",
    motivationPoint3: "Buổi ngắn vẫn có thể rất chất lượng",
    motivationPrimary: "Bắt đầu 1 bài",
    motivationSecondary: "Lên lịch tuần này",
    roadmap: "Roadmap",
    techniques: "Techniques",
    schedule: "Schedule",
    nutrition: "Nutrition",
    progress: "Progress",
    aiCoach: "AI Coach",
    formCheck: "AI Form Check",
  };
}

export default async function LearningHubPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);
  const pitchMode = isPitchModeEnabled();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-(--shadow-card) sm:p-8">
        <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
          {copy.eyebrow}
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{copy.intro}</p>

        <div className="mt-3 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100">
          90% người mới bỏ cuộc trong 2 tuần đầu khi thiếu lộ trình. Learning giữ bạn trong nhịp tập với flow rõ ràng mỗi ngày.
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <StatChip value="2" label={copy.stat1Label} />
          <StatChip value="7 ngày" label={copy.stat2Label} />
          <StatChip value="6+" label={copy.stat3Label} />
        </div>
      </header>

      <div className="mb-6">
        <JourneyStarterPanel />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <HubCard
          href="/hoc-tap"
          title={copy.courseTitle}
          description={copy.courseDesc}
          cta={copy.courseCta}
        />
        <HubCard
          href="/video"
          title={copy.videoTitle}
          description={copy.videoDesc}
          cta={copy.videoCta}
        />
      </div>

      <section className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-6 shadow-(--shadow-card)">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Pitch focus</p>
        <h2 className="mt-1 text-lg font-semibold text-white">AI Coach + AI Form Check là trục chính</h2>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          Khi bật chế độ pitch, điều hướng học tập được rút gọn để judge thấy rõ vòng lặp cốt lõi: tạo buổi tập, sửa form ngay,
          rồi bấm hoàn thành để giữ streak.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <QuickLink href="/ai-coach">{copy.aiCoach}</QuickLink>
          <QuickLink href="/form-check">{copy.formCheck}</QuickLink>
          <QuickLink href="/tien-do">{copy.progress}</QuickLink>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-(--shadow-card)">
        <h2 className="text-sm font-semibold text-white">{copy.quickTools}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.quickDesc}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <QuickLink href="/lo-trinh">{copy.roadmap}</QuickLink>
          <QuickLink href="/ky-thuat">{copy.techniques}</QuickLink>
          <QuickLink href="/lich-tap">{copy.schedule}</QuickLink>
          {!pitchMode ? <QuickLink href="/dinh-duong">{copy.nutrition}</QuickLink> : null}
          <QuickLink href="/tien-do">{copy.progress}</QuickLink>
          <QuickLink href="/ai-coach">{copy.aiCoach}</QuickLink>
          <QuickLink href="/form-check">{copy.formCheck}</QuickLink>
        </div>
      </section>

      <div className="mt-6">
        <MotivationPanel
          title={copy.motivationTitle}
          message={copy.motivationMessage}
          points={[copy.motivationPoint1, copy.motivationPoint2, copy.motivationPoint3]}
          primaryHref="/hoc-tap"
          primaryLabel={copy.motivationPrimary}
          secondaryHref="/lich-tap"
          secondaryLabel={copy.motivationSecondary}
        />
      </div>
    </div>
  );
}
