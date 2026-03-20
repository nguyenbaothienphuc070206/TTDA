"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";

import LessonCard from "@/components/LessonCard";
import { LESSONS } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      statusStart:
        "Start simple: pick 1 Blue Self-Defense lesson, practice slowly for clean technique, then mark complete.",
      statusDone:
        "Excellent - you completed the whole roadmap. Now review and gradually increase speed/endurance.",
      statusNext: (title, minutes) =>
        `Suggested next: ${title} • ${minutes} minutes. (This card is highlighted)`,
      heading: "Vovinam Training Roadmap",
      description:
        "Pick lessons across the full belt path from Blue Self-Defense to Red Level 4. Mark complete to save progress locally. You can also tap \"Ask AI about this lesson\" for common mistakes.",
      createSchedule: "Create 7-day schedule",
      progress: "Progress",
      pathMap: "Roadmap path",
      pathMapDesc: "The path lights up as you complete lessons in order.",
      litSegments: (a, b) => `${a}/${b} lit segments`,
    };
  }

  if (id === "ja") {
    return {
      statusStart:
        "まずは軽く始めましょう。青帯護身のレッスンを1つ選び、ゆっくり正確に練習してから完了を記録します。",
      statusDone:
        "素晴らしいです。ロードマップをすべて完了しました。復習しながら、速度と持久力を段階的に上げましょう。",
      statusNext: (title, minutes) =>
        `次のおすすめ: ${title} • ${minutes}分（このカードをハイライト中）`,
      heading: "Vovinam 練習ロードマップ",
      description:
        "青帯護身から紅帯四級まで、全帯システムでレッスンを選べます。完了を記録すると進捗は端末に保存されます。\"このレッスンをAIに質問\" でよくあるミスも確認できます。",
      createSchedule: "7日間スケジュールを作成",
      progress: "進捗",
      pathMap: "ロードマップ",
      pathMapDesc: "順番どおりに完了するとルートが点灯していきます。",
      litSegments: (a, b) => `${a}/${b} 点灯セグメント`,
    };
  }

  return {
    statusStart:
      "Bắt đầu nhẹ thôi: chọn 1 bài Lam đai tự vệ, tập chậm cho sạch động tác rồi đánh dấu.",
    statusDone:
      "Quá chất - bạn đã hoàn thành toàn bộ lộ trình. Giờ ôn lại + tăng dần tốc độ/độ bền là đẹp.",
    statusNext: (title, minutes) =>
      `Gợi ý tiếp theo: ${title} • ${minutes} phút. (Card đang được highlight)`,
    heading: "Lộ trình luyện Vovinam",
    description:
      "Chọn bài theo đầy đủ hệ đai từ Lam đai tự vệ đến Hồng đai tứ. Đánh dấu hoàn thành để lưu tiến độ (tự lưu trên máy). Bạn cũng có thể bấm “Hỏi AI về bài này” để xem lỗi thường gặp.",
    createSchedule: "Tạo lịch tập 7 ngày",
    progress: "Tiến độ",
    pathMap: "Bản đồ lộ trình",
    pathMapDesc: "Con đường sẽ sáng dần khi bạn hoàn thành bài theo thứ tự.",
    litSegments: (a, b) => `${a}/${b} đoạn sáng`,
  };
}

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
  const locale = useLocale();
  const copy = getCopy(locale);
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

  const contiguousDoneCount = useMemo(() => {
    const done = new Set(doneSlugs);
    let count = 0;

    for (const lesson of LESSONS) {
      if (done.has(lesson.slug)) count += 1;
      else break;
    }

    return count;
  }, [doneSlugs]);

  const activeSlug = nextLesson?.slug || "";

  const statusLine = useMemo(() => {
    if (totalLessons === 0) return "";

    if (doneCount === 0) {
      return copy.statusStart;
    }

    if (doneCount >= totalLessons) {
      return copy.statusDone;
    }

    if (nextLesson) {
      return copy.statusNext(nextLesson.title, nextLesson.minutes);
    }

    return "";
  }, [copy, doneCount, nextLesson, totalLessons]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] fade-in-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {copy.heading}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {copy.description}
            </p>
          </div>
          <Link
            href="/lich-tap"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.createSchedule}
          </Link>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">{copy.progress}</div>
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

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)] stagger-fade">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">{copy.pathMap}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {copy.pathMapDesc}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
            {copy.litSegments(contiguousDoneCount, totalLessons)}
          </span>
        </div>

        <div className="mt-6">
          {LESSONS.map((lesson, idx) => {
            const done = doneSlugs.includes(lesson.slug);
            const isNext = Boolean(activeSlug && lesson.slug === activeSlug);
            const isAllDone = doneCount >= totalLessons && totalLessons > 0;
            const nodeState = isAllDone
              ? "done"
              : done
                ? "done"
                : isNext
                  ? "next"
                  : "todo";

            const segmentLit = idx < contiguousDoneCount;
            const showConnector = idx < LESSONS.length - 1;

            return (
              <div key={lesson.slug} className="relative pb-10 pl-12 last:pb-0">
                {showConnector ? (
                  <div
                    aria-hidden
                    className={
                      "absolute left-5 top-7 bottom-0 w-px " +
                      (segmentLit
                        ? "bg-gradient-to-b from-blue-400/70 to-blue-600/50"
                        : "bg-white/10")
                    }
                  />
                ) : null}

                <div
                  aria-hidden
                  className={
                    "absolute left-[1.12rem] top-7 h-4 w-4 rounded-full border " +
                    (nodeState === "done"
                      ? "border-blue-300/30 bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_0_6px_rgba(59,130,246,0.12)]"
                      : nodeState === "next"
                        ? "border-blue-400/45 bg-slate-950/40 shadow-[0_0_0_6px_rgba(59,130,246,0.10)]"
                        : "border-white/10 bg-white/10")
                  }
                />

                <LessonCard lesson={lesson} isActive={isNext} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
