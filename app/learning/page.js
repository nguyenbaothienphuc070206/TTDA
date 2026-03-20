import Link from "next/link";
import { getLocale } from "next-intl/server";

export const metadata = {
  title: "Learning",
};

function HubCard({ href, title, description, cta }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
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

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Learning",
      intro: "Gather Course and Video in one place for easier access.",
      courseTitle: "Course",
      courseDesc: "Course dashboard across all 14 belt levels with learning progress.",
      courseCta: "Open course →",
      videoTitle: "Video",
      videoDesc: "Technique video library with quick in-page AI Q&A.",
      videoCta: "Open video library →",
      quickTools: "Quick learning tools",
      quickDesc: "Everything related to practice and progress is grouped in Learning.",
      roadmap: "Roadmap",
      techniques: "Techniques",
      schedule: "Schedule",
      nutrition: "Nutrition",
      progress: "Progress",
      aiCoach: "AI Coach",
    };
  }

  if (id === "ja") {
    return {
      title: "学習",
      intro: "Course と Video を1か所にまとめ、見つけやすくしました。",
      courseTitle: "コース",
      courseDesc: "14段階の帯レベルに対応した学習ダッシュボードと進捗管理。",
      courseCta: "コースを開く →",
      videoTitle: "動画",
      videoDesc: "技術動画ライブラリとページ内のAIクイックQ&A。",
      videoCta: "動画ライブラリを開く →",
      quickTools: "クイック学習ツール",
      quickDesc: "練習と進捗に関する機能は Learning にまとまっています。",
      roadmap: "ロードマップ",
      techniques: "技術",
      schedule: "スケジュール",
      nutrition: "栄養",
      progress: "進捗",
      aiCoach: "AIコーチ",
    };
  }

  return {
    title: "Learning",
    intro: "Gom Course và Video vào một nơi để dễ tìm.",
    courseTitle: "Course",
    courseDesc: "Dashboard khóa học theo hệ 14 cấp đai và tiến độ bài học.",
    courseCta: "Mở khóa học →",
    videoTitle: "Video",
    videoDesc: "Thư viện video bài quyền + hỏi nhanh kỹ thuật ngay trên trang.",
    videoCta: "Mở thư viện video →",
    quickTools: "Công cụ học nhanh",
    quickDesc: "Mọi thứ liên quan đến luyện tập/tiến độ nằm trong nhóm Learning.",
    roadmap: "Roadmap",
    techniques: "Techniques",
    schedule: "Schedule",
    nutrition: "Nutrition",
    progress: "Progress",
    aiCoach: "AI Coach",
  };
}

export default async function LearningHubPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.intro}
        </p>
      </header>

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

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold text-white">{copy.quickTools}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.quickDesc}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <QuickLink href="/lo-trinh">{copy.roadmap}</QuickLink>
          <QuickLink href="/ky-thuat">{copy.techniques}</QuickLink>
          <QuickLink href="/lich-tap">{copy.schedule}</QuickLink>
          <QuickLink href="/dinh-duong">{copy.nutrition}</QuickLink>
          <QuickLink href="/tien-do">{copy.progress}</QuickLink>
          <QuickLink href="/ai-coach">{copy.aiCoach}</QuickLink>
        </div>
      </section>
    </div>
  );
}
