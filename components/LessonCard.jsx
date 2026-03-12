"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { isLessonDone, toggleLessonDone } from "@/lib/progress";

export default function LessonCard({ lesson }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sync = () => {
      setDone(isLessonDone(lesson.slug));
    };

    sync();
    window.addEventListener("vovinam-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [lesson.slug]);

  const onToggle = () => {
    const next = toggleLessonDone(lesson.slug);
    setDone(next.includes(lesson.slug));
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_55%)]" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            {lesson.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            {lesson.summary}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
              {lesson.minutes} phút
            </span>
            {done ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/15 px-2.5 py-1 text-emerald-200">
                Đã hoàn thành
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                Chưa hoàn thành
              </span>
            )}
          </div>
        </div>

        <div className="h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300/15 to-blue-500/10" />
      </div>

      <div className="relative mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/bai-hoc/${lesson.slug}`}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          Xem bài
        </Link>

        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        >
          {done ? "Bỏ đánh dấu" : "Đánh dấu hoàn thành"}
        </button>
      </div>
    </div>
  );
}
