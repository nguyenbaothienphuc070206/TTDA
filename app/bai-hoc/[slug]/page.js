import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import JsonLd from "@/components/JsonLd";
import LessonDoneButton from "@/components/LessonDoneButton";
import TrackView from "@/components/TrackView";
import { LESSONS, LEVELS, getLessonBySlug } from "@/data/lessons";

function Card({ title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="grid gap-2 text-sm leading-6 text-slate-300">
      {items.map((t, idx) => (
        <li key={idx} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }) {
  return (
    <ol className="grid gap-3 text-sm leading-6 text-slate-300">
      {items.map((t, idx) => (
        <li key={idx} className="flex gap-3">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-white">
            {idx + 1}
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
  );
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      fallbackTitle: "Lesson",
      backRoadmap: "Roadmap",
      fallbackLevel: "Lesson",
      minutes: "min",
      viewSchedule: "View schedule",
      goals: "Goals",
      steps: "Step-by-step",
      mistakes: "Common mistakes",
      tips: "Self-practice tips",
      prev: "Previous",
      next: "Next",
      done: "Finished",
      none: "None",
      backToRoadmap: "Back to roadmap",
      viewLesson: "View lesson",
    };
  }

  if (id === "ja") {
    return {
      fallbackTitle: "レッスン",
      backRoadmap: "ロードマップ",
      fallbackLevel: "レッスン",
      minutes: "分",
      viewSchedule: "スケジュールを見る",
      goals: "目標",
      steps: "ステップガイド",
      mistakes: "よくあるミス",
      tips: "自主練のコツ",
      prev: "前のレッスン",
      next: "次のレッスン",
      done: "完了",
      none: "なし",
      backToRoadmap: "ロードマップへ戻る",
      viewLesson: "レッスンを見る",
    };
  }

  return {
    fallbackTitle: "Bài học",
    backRoadmap: "Lộ trình",
    fallbackLevel: "Bài học",
    minutes: "phút",
    viewSchedule: "Xem lịch tập",
    goals: "Mục tiêu",
    steps: "Hướng dẫn từng bước",
    mistakes: "Lỗi thường gặp",
    tips: "Gợi ý tự tập",
    prev: "Bài trước",
    next: "Bài tiếp theo",
    done: "Hoàn tất",
    none: "Không có",
    backToRoadmap: "Quay lại lộ trình",
    viewLesson: "Xem bài",
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return { title: "Bài học" };
  }

  return {
    title: lesson.title,
    description: lesson.summary,
    openGraph: {
      title: lesson.title,
      description: lesson.summary,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: lesson.title,
      description: lesson.summary,
    },
  };
}

export default async function LessonPage({ params }) {
  const locale = await getLocale();
  const copy = getCopy(locale);

  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: lesson.title,
    description: lesson.summary,
    timeRequired: `PT${Math.max(1, Number(lesson.minutes) || 0)}M`,
    url: `/bai-hoc/${lesson.slug}`,
    author: {
      "@type": "Organization",
      name: "Vovinam Learning",
    },
  };

  const level = LEVELS.find((l) => l.id === lesson.level);

  const index = LESSONS.findIndex((l) => l.slug === lesson.slug);
  const prev = index > 0 ? LESSONS[index - 1] : null;
  const next = index >= 0 && index < LESSONS.length - 1 ? LESSONS[index + 1] : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <TrackView type="lesson" id={lesson.slug} />
      <JsonLd data={jsonLd} />
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-300">
        <Link href="/lo-trinh" className="hover:text-white transition">
          ← {copy.backRoadmap}
        </Link>
        <span className="text-white/20">/</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
          {level?.title || copy.fallbackLevel}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
          {lesson.minutes} {copy.minutes}
        </span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {lesson.title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
        {lesson.summary}
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <LessonDoneButton slug={lesson.slug} />
        <Link
          href="/lich-tap"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        >
          {copy.viewSchedule}
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        <Card title={copy.goals}>
          <List items={lesson.goals} />
        </Card>

        <Card title={copy.steps}>
          <Steps items={lesson.steps} />
        </Card>

        <Card title={copy.mistakes}>
          <List items={lesson.mistakes} />
        </Card>

        <Card title={copy.tips}>
          <List items={lesson.tips} />
        </Card>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/bai-hoc/${prev.slug}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
          >
            <div className="text-xs font-semibold text-slate-300">{copy.prev}</div>
            <div className="mt-1 font-semibold text-white">{prev.title}</div>
          </Link>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-semibold text-slate-300">{copy.prev}</div>
            <div className="mt-1 font-semibold text-slate-400">{copy.none}</div>
          </div>
        )}

        {next ? (
          <Link
            href={`/bai-hoc/${next.slug}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
          >
            <div className="text-xs font-semibold text-slate-300">{copy.next}</div>
            <div className="mt-1 font-semibold text-white">{next.title}</div>
          </Link>
        ) : (
          <Link
            href="/lo-trinh"
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
          >
            <div className="text-xs font-semibold text-slate-300">{copy.done}</div>
            <div className="mt-1 font-semibold text-white">{copy.backToRoadmap}</div>
          </Link>
        )}
      </div>
    </div>
  );
}
