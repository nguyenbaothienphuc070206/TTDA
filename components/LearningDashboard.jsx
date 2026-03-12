"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BELTS } from "@/data/belts";
import { VIDEOS } from "@/data/videos";
import { LESSONS, getLessonsByLevel } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";

function ProgressBar({ percent }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full bg-gradient-to-r from-cyan-300 to-blue-500 progress-bar"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

function BeltCard({ belt, doneSlugs }) {
  const lessons = useMemo(
    () => getLessonsByLevel(belt.lessonLevel),
    [belt.lessonLevel]
  );

  const total = lessons.length;
  const doneCount = lessons.filter((l) => doneSlugs.includes(l.slug)).length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const videoCount = useMemo(
    () => VIDEOS.filter((v) => v.beltId === belt.id).length,
    [belt.id]
  );

  return (
    <section className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_55%)]" />

      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">{belt.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {belt.description}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200">
            {doneCount}/{total} • {percent}%
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold text-slate-300">Tiến độ</div>
            <div className="mt-3">
              <ProgressBar percent={percent} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Dựa trên số bài bạn đã đánh dấu hoàn thành.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold text-slate-300">Tài nguyên</div>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Bài học</span>
                <span className="font-semibold text-white">{total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Video (mẫu)</span>
                <span className="font-semibold text-white">{videoCount}</span>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Video hiện là dữ liệu demo (bạn thay link thật sau).
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/lo-trinh#${belt.lessonLevel}`}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Xem lộ trình
          </Link>
          <Link
            href="/video"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Xem video
          </Link>
          <Link
            href="/tien-do"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Xem tiến độ
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs font-semibold text-slate-300">Gợi ý học nhanh</div>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-300">
            {lessons.slice(0, 3).map((l) => (
              <li key={l.slug}>
                •{" "}
                <Link
                  href={`/bai-hoc/${l.slug}`}
                  className="underline decoration-white/20 underline-offset-4 hover:text-white"
                >
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            (Gợi ý dựa trên danh sách bài trong level {belt.lessonLevel})
          </p>
        </div>
      </div>
    </section>
  );
}

export default function LearningDashboard() {
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

  const overallDone = doneSlugs.length;
  const overallPercent =
    totalLessons === 0 ? 0 : Math.round((overallDone / totalLessons) * 100);

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Tổng quan tiến độ</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Bạn đã hoàn thành {overallDone}/{totalLessons} bài.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
            {overallPercent}%
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-300 to-blue-500 progress-bar"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {BELTS.map((belt) => (
          <div key={belt.id} className="lg:col-span-1">
            <BeltCard belt={belt} doneSlugs={doneSlugs} />
          </div>
        ))}
      </div>
    </div>
  );
}
