"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CloudDownload, WifiOff } from "lucide-react";

import { BELTS } from "@/data/belts";
import { VIDEOS } from "@/data/videos";
import { LESSONS, getLessonsByLevel } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";
import { readProfile } from "@/lib/profile";

const LAST_VISIT_KEY = "vovinam_last_visit_hoc_tap_v1";
const OFFLINE_MODE_KEY = "vovinam_offline_mode_v1";
const OFFLINE_LESSONS_KEY = "vovinam_offline_lessons_v1";

async function postToServiceWorker(message) {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;

  const reg = await navigator.serviceWorker.ready.catch(() => null);
  const target = reg?.active || navigator.serviceWorker.controller;
  if (!target || typeof target.postMessage !== "function") return false;

  try {
    target.postMessage(message);
    return true;
  } catch {
    return false;
  }
}

function daysBetween(nowMs, thenMs) {
  const msPerDay = 24 * 60 * 60 * 1000;
  if (!Number.isFinite(nowMs) || !Number.isFinite(thenMs)) return 0;
  if (thenMs <= 0 || nowMs <= thenMs) return 0;
  return Math.floor((nowMs - thenMs) / msPerDay);
}

function ProgressBar({ percent }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 progress-bar"
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

  const progressNote = useMemo(() => {
    if (total === 0) return "Chưa có bài trong cấp này.";
    if (doneCount === 0) {
      return `Bắt đầu ${belt.title}: chọn 1 bài, tập chậm 15–20 phút cho sạch động tác rồi đánh dấu.`;
    }
    if (doneCount >= total) {
      return `Bạn đã hoàn thành toàn bộ ${belt.title}. Oke — giờ ôn lại + tăng dần độ bền là đẹp.`;
    }
    return `Bạn đã chốt ${doneCount}/${total} bài ${belt.title}. Giữ nhịp đều, hôm nay làm thêm 1 bài là tiến bộ.`;
  }, [belt.title, doneCount, total]);

  const videoCount = useMemo(
    () => VIDEOS.filter((v) => v.beltId === belt.id).length,
    [belt.id]
  );

  return (
    <section className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] transition hover:scale-[1.02] hover:border-blue-400/30 hover:bg-white/10 hover:shadow-[var(--shadow-card-strong)]">
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_55%)]" />

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
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold text-slate-300">Tiến độ</div>
            <div className="mt-3">
              <ProgressBar percent={percent} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              {progressNote}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 shadow-[var(--shadow-card)]">
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
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          >
            Xem lộ trình
          </Link>
          <Link
            href="/video"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            Xem video
          </Link>
          <Link
            href="/tien-do"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            Xem tiến độ
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 shadow-[var(--shadow-card)]">
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
  const [showNudge, setShowNudge] = useState(false);
  const [offlineEnabled, setOfflineEnabled] = useState(false);
  const [offlineLessonSlugs, setOfflineLessonSlugs] = useState([]);
  const [offlineNotice, setOfflineNotice] = useState("");
  const [offlineBusy, setOfflineBusy] = useState(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      setOfflineEnabled(window.localStorage.getItem(OFFLINE_MODE_KEY) === "1");
    } catch {
      // ignore
    }

    try {
      const raw = window.localStorage.getItem(OFFLINE_LESSONS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const slugs = Array.isArray(data)
        ? data.map((x) => String(x || "").trim()).filter(Boolean)
        : [];
      setOfflineLessonSlugs(slugs.slice(0, 5));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nowMs = Date.now();
    const prev = Number(window.localStorage.getItem(LAST_VISIT_KEY) || 0);
    const inactiveDays = daysBetween(nowMs, prev);

    let timerId = 0;

    // "Lâu rồi chưa ghé" → nudge nhẹ.
    if (prev > 0 && inactiveDays >= 7) {
      timerId = window.setTimeout(() => {
        setShowNudge(true);
      }, 0);
    }

    try {
      window.localStorage.setItem(LAST_VISIT_KEY, String(nowMs));
    } catch {
      // ignore
    }

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  const overallDone = doneSlugs.length;
  const overallPercent =
    totalLessons === 0 ? 0 : Math.round((overallDone / totalLessons) * 100);

  const offlineTargets = useMemo(() => {
    const done = new Set(doneSlugs);
    const undone = LESSONS.filter((l) => !done.has(l.slug));
    const list = (undone.length ? undone : LESSONS).slice(0, 5);
    return list.map((l) => l.slug);
  }, [doneSlugs]);

  const toggleOffline = async () => {
    setOfflineNotice("");
    setOfflineBusy(true);

    try {
      if (!offlineEnabled) {
        const slugs = offlineTargets;
        const urls = ["/", "/hoc-tap", "/lo-trinh", ...slugs.map((s) => `/bai-hoc/${s}`)];

        setOfflineLessonSlugs(slugs);
        try {
          window.localStorage.setItem(OFFLINE_MODE_KEY, "1");
          window.localStorage.setItem(OFFLINE_LESSONS_KEY, JSON.stringify(slugs));
        } catch {
          // ignore
        }

        const ok = await postToServiceWorker({
          type: "CACHE_URLS",
          payload: { urls },
        });

        setOfflineEnabled(true);
        setOfflineNotice(
          ok
            ? "Đã tải 5 bài học về thiết bị, tập luyện mượt mà ngay cả khi không có mạng!"
            : "Đã bật offline. (Không gửi được yêu cầu cache cho Service Worker)"
        );
        return;
      }

      const slugs = offlineLessonSlugs.length > 0 ? offlineLessonSlugs : offlineTargets;

      try {
        window.localStorage.setItem(OFFLINE_MODE_KEY, "0");
        window.localStorage.removeItem(OFFLINE_LESSONS_KEY);
      } catch {
        // ignore
      }

      await postToServiceWorker({
        type: "UNCACHE_URLS",
        payload: { urls: slugs.map((s) => `/bai-hoc/${s}`) },
      });

      setOfflineEnabled(false);
      setOfflineLessonSlugs([]);
      setOfflineNotice("Đã tắt offline.");
    } finally {
      setOfflineBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      {showNudge ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <p className="text-sm leading-6 text-slate-300">
            {(() => {
              const profile = readProfile();
              const rawName = String(profile?.name || "").trim();
              const name = rawName && rawName !== "Học viên" ? rawName : "bạn";
              return `Chào ${name}… hôm nay ôn lại Tấn Trung Bình 5 phút thôi nhé?`;
            })()}
          </p>
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
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
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 progress-bar"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/30 text-blue-100">
                {offlineEnabled ? (
                  <WifiOff className="h-5 w-5" />
                ) : (
                  <CloudDownload className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">Chế độ offline</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Tải trước 5 bài học để mở nhanh khi mạng yếu/không có mạng.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={offlineBusy}
            onClick={toggleOffline}
            className={
              offlineEnabled
                ? "inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                : "inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            }
          >
            {offlineBusy
              ? offlineEnabled
                ? "Đang tắt…"
                : "Đang tải…"
              : offlineEnabled
                ? "Tắt offline"
                : "Tải 5 bài offline"}
          </button>
        </div>

        {offlineNotice ? (
          <div
            className={
              "mt-4 rounded-2xl border p-4 text-sm leading-6 " +
              (offlineEnabled && offlineNotice.startsWith("Đã tải")
                ? "border-blue-400/20 bg-blue-500/10 text-slate-100"
                : "border-white/10 bg-slate-950/30 text-slate-200")
            }
          >
            {offlineNotice}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 stagger-fade">
        {BELTS.map((belt) => (
          <div key={belt.id} className="lg:col-span-1">
            <BeltCard belt={belt} doneSlugs={doneSlugs} />
          </div>
        ))}
      </div>
    </div>
  );
}
