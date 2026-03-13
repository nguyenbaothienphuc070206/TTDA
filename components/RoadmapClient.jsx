"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import LessonCard from "@/components/LessonCard";
import { LEVELS, LESSONS, getLessonsByLevel } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";

function ProgressBar({ percent }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 progress-bar"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

export default function RoadmapClient() {
  const totalLessons = useMemo(() => LESSONS.length, []);
  const [doneSlugs, setDoneSlugs] = useState([]);

  useEffect(() => {
    const sync = () => {
      const done = readDoneSlugs();
      setDoneSlugs(Array.isArray(done) ? done : []);
    };

    sync();
    window.addEventListener("vovinam-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const doneCount = doneSlugs.length;
  const percent =
    totalLessons === 0 ? 0 : Math.round((doneCount / totalLessons) * 100);

  const nextLesson = useMemo(() => {
    const done = new Set(doneSlugs);
    return LESSONS.find((l) => !done.has(l.slug)) || null;
  }, [doneSlugs]);

  const activeSlug = nextLesson?.slug || "";

  const statusLine = useMemo(() => {
    if (totalLessons === 0) return "";

    if (doneCount === 0) {
      return "Bắt đầu nhẹ thôi: chọn 1 bài Lam đai, tập chậm cho sạch động tác rồi đánh dấu.";
    }

    if (doneCount >= totalLessons) {
      return "Quá chất — bạn đã hoàn thành toàn bộ lộ trình. Giờ ôn lại + tăng dần tốc độ/độ bền là đẹp.";
    }

    if (nextLesson) {
      return `Gợi ý tiếp theo: ${nextLesson.title} • ${nextLesson.minutes} phút. (Card đang được highlight)`;
    }

    return "";
  }, [doneCount, nextLesson, totalLessons]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Lộ trình luyện Vovinam
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Chọn bài theo cấp Lam/Hoàng/Huyền đai. Đánh dấu hoàn thành để lưu
              tiến độ (tự lưu trên máy). Bạn cũng có thể bấm “Hỏi AI về bài này”
              để xem lỗi thường gặp.
            </p>
          </div>
          <Link
            href="/lich-tap"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            Tạo lịch tập 7 ngày
          </Link>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">Tiến độ</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
              {doneCount}/{totalLessons} • {percent}%
            </div>
          </div>
          <div className="mt-2">
            <ProgressBar percent={percent} />
          </div>
          {statusLine ? (
            <p className="mt-2 text-xs leading-5 text-slate-300">{statusLine}</p>
          ) : null}
        </div>
      </header>

      <div className="mt-8 space-y-10 stagger-fade">
        {LEVELS.map((level) => {
          const lessons = getLessonsByLevel(level.id);

          return (
            <section
              key={level.id}
              id={level.id}
              className="space-y-4 scroll-mt-28"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {level.title}
                    <span className="ml-2 text-sm font-semibold text-slate-400">
                      ({level.short})
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    {level.description}
                  </p>
                </div>

                <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                  {lessons.length} bài
                </span>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.slug}
                    lesson={lesson}
                    isActive={Boolean(activeSlug && lesson.slug === activeSlug)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
