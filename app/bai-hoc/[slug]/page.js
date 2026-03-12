import Link from "next/link";
import { notFound } from "next/navigation";

import LessonDoneButton from "@/components/LessonDoneButton";
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

export function generateMetadata({ params }) {
  const lesson = getLessonBySlug(params.slug);

  if (!lesson) {
    return { title: "Bài học" };
  }

  return {
    title: lesson.title,
    description: lesson.summary,
  };
}

export default function LessonPage({ params }) {
  const lesson = getLessonBySlug(params.slug);
  if (!lesson) notFound();

  const level = LEVELS.find((l) => l.id === lesson.level);

  const index = LESSONS.findIndex((l) => l.slug === lesson.slug);
  const prev = index > 0 ? LESSONS[index - 1] : null;
  const next = index >= 0 && index < LESSONS.length - 1 ? LESSONS[index + 1] : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-300">
        <Link href="/lo-trinh" className="hover:text-white transition">
          ← Lộ trình
        </Link>
        <span className="text-white/20">/</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
          {level?.title || "Bài học"}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
          {lesson.minutes} phút
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
          Xem lịch tập
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        <Card title="Mục tiêu">
          <List items={lesson.goals} />
        </Card>

        <Card title="Hướng dẫn từng bước">
          <Steps items={lesson.steps} />
        </Card>

        <Card title="Lỗi thường gặp">
          <List items={lesson.mistakes} />
        </Card>

        <Card title="Gợi ý tự tập">
          <List items={lesson.tips} />
        </Card>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/bai-hoc/${prev.slug}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
          >
            <div className="text-xs font-semibold text-slate-300">Bài trước</div>
            <div className="mt-1 font-semibold text-white">{prev.title}</div>
          </Link>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-semibold text-slate-300">Bài trước</div>
            <div className="mt-1 font-semibold text-slate-400">Không có</div>
          </div>
        )}

        {next ? (
          <Link
            href={`/bai-hoc/${next.slug}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
          >
            <div className="text-xs font-semibold text-slate-300">Bài tiếp theo</div>
            <div className="mt-1 font-semibold text-white">{next.title}</div>
          </Link>
        ) : (
          <Link
            href="/lo-trinh"
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
          >
            <div className="text-xs font-semibold text-slate-300">Hoàn tất</div>
            <div className="mt-1 font-semibold text-white">Quay lại lộ trình</div>
          </Link>
        )}
      </div>
    </div>
  );
}
