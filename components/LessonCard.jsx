"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, MessageCircle, Play } from "lucide-react";

import { isLessonDone, toggleLessonDone } from "@/lib/progress";

export default function LessonCard({ lesson, isActive = false }) {
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

  const onAskAi = () => {
    if (typeof window === "undefined") return;

    const question = `Mình đang học bài “${lesson.title}”. Bạn chỉ ra lỗi thường gặp, cách sửa và lưu ý an toàn giúp mình nhé.`;
    window.dispatchEvent(
      new CustomEvent("vovinam-ai-ask", {
        detail: {
          query: question,
          context: {
            kind: "lesson",
            lessonSlug: lesson.slug,
            lessonTitle: lesson.title,
            lessonLevel: lesson.level,
          },
        },
      })
    );
  };

  return (
    <div
      className={
        "group relative overflow-hidden rounded-3xl border bg-white/5 p-5 shadow-[var(--shadow-card)] transition will-change-transform hover:bg-white/10 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[var(--shadow-card-strong)] hover:border-blue-400/35 " +
        (isActive
          ? "border-blue-400/40 ring-2 ring-blue-400/20"
          : "border-white/10")
      }
    >
      <div
        className={
          "absolute inset-0 transition-opacity bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_55%)] " +
          (isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")
        }
      />

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
            {isActive && !done ? (
              <span className="rounded-full border border-blue-400/25 bg-blue-500/10 px-2.5 py-1 text-blue-100">
                Gợi ý tiếp theo
              </span>
            ) : null}
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

        <div className="h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/15 to-blue-600/10" />
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center">
        <Link
          href={`/bai-hoc/${lesson.slug}`}
          className="col-span-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50 sm:w-auto"
        >
          <Play className="h-4 w-4" />
          <span>Xem</span>
        </Link>

        <button
          type="button"
          onClick={onToggle}
          className={
            "col-span-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 sm:w-auto " +
            (done
              ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20 focus:ring-emerald-300/30"
              : "border-white/10 bg-white/5 text-white hover:bg-white/10 focus:ring-blue-400/30")
          }
        >
          <Check className="h-4 w-4" />
          <span className="whitespace-nowrap">{done ? "Đã đánh dấu" : "Đánh dấu"}</span>
        </button>

        <button
          type="button"
          onClick={onAskAi}
          className="col-span-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30 sm:w-auto"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Hỏi AI về bài này</span>
        </button>
      </div>
    </div>
  );
}
