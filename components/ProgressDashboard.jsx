"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LESSONS } from "@/data/lessons";
import { VIDEOS } from "@/data/videos";
import { TECHNIQUES } from "@/data/wiki";
import { readDoneSlugs } from "@/lib/progress";
import { readAnalytics, topByCount } from "@/lib/analytics";

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

function TopList({ title, items, resolve, hrefFor }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-sm font-semibold text-white">{title}</div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-300">Chưa có dữ liệu.</p>
      ) : (
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
          {items.map((it) => {
            const name = resolve(it.id);
            const href = hrefFor(it.id);
            return (
              <li key={it.id} className="flex items-center justify-between gap-3">
                <Link
                  href={href}
                  className="min-w-0 truncate underline decoration-white/20 underline-offset-4 hover:text-white"
                >
                  {name}
                </Link>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
                  {it.count}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function ProgressDashboard() {
  const total = useMemo(() => LESSONS.length, []);
  const [done, setDone] = useState([]);
  const [analytics, setAnalytics] = useState(() => readAnalytics());

  useEffect(() => {
    const syncProgress = () => {
      setDone(readDoneSlugs());
    };

    const syncAnalytics = () => {
      setAnalytics(readAnalytics());
    };

    syncProgress();
    syncAnalytics();

    window.addEventListener("vovinam-progress", syncProgress);
    window.addEventListener("vovinam-analytics", syncAnalytics);
    window.addEventListener("storage", () => {
      syncProgress();
      syncAnalytics();
    });

    return () => {
      window.removeEventListener("vovinam-progress", syncProgress);
      window.removeEventListener("vovinam-analytics", syncAnalytics);
    };
  }, []);

  const doneCount = done.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const doneLessons = useMemo(() => {
    const set = new Set(done);
    return LESSONS.filter((l) => set.has(l.slug));
  }, [done]);

  const topLessons = useMemo(
    () => topByCount(analytics.lessonViews, 5),
    [analytics.lessonViews]
  );
  const topVideos = useMemo(
    () => topByCount(analytics.videoViews, 5),
    [analytics.videoViews]
  );
  const topTechniques = useMemo(
    () => topByCount(analytics.techniqueViews, 5),
    [analytics.techniqueViews]
  );

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Tổng quan</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Hoàn thành {doneCount}/{total} bài
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
            {percent}%
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar percent={percent} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            href="/lo-trinh"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Tiếp tục học
          </Link>
          <Link
            href="/video"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Xem video
          </Link>
          <Link
            href="/dinh-duong"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Dinh dưỡng
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Bài đã hoàn thành</h2>
        {doneLessons.length === 0 ? (
          <p className="mt-2 text-sm text-slate-300">Bạn chưa đánh dấu bài nào.</p>
        ) : (
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
            {doneLessons.map((l) => (
              <li key={l.slug} className="flex items-center justify-between gap-3">
                <Link
                  href={`/bai-hoc/${l.slug}`}
                  className="min-w-0 truncate underline decoration-white/20 underline-offset-4 hover:text-white"
                >
                  {l.title}
                </Link>
                <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                  Done
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        <TopList
          title="Xem nhiều nhất: Bài học"
          items={topLessons}
          resolve={(id) => LESSONS.find((l) => l.slug === id)?.title || id}
          hrefFor={(id) => `/bai-hoc/${id}`}
        />
        <TopList
          title="Xem nhiều nhất: Video"
          items={topVideos}
          resolve={(id) => VIDEOS.find((v) => v.id === id)?.title || id}
          hrefFor={(id) => `/video/${id}`}
        />
        <TopList
          title="Xem nhiều nhất: Kỹ thuật"
          items={topTechniques}
          resolve={(id) => TECHNIQUES.find((t) => t.slug === id)?.title || id}
          hrefFor={(id) => `/ky-thuat#${id}`}
        />
      </div>
    </div>
  );
}
