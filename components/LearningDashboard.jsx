"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CloudDownload, WifiOff } from "lucide-react";
import { useLocale } from "next-intl";

import { BELTS } from "@/data/belts";
import { VIDEOS } from "@/data/videos";
import { LESSONS, getLessonsByBeltId, getLessonsByLevel } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";
import { readProfile } from "@/lib/profile";

const LAST_VISIT_KEY = "vovinam_last_visit_hoc_tap_v1";
const OFFLINE_MODE_KEY = "vovinam_offline_mode_v1";
const OFFLINE_LESSONS_KEY = "vovinam_offline_lessons_v1";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      noLessonsInBelt: "No lessons in this belt level yet.",
      startBelt: (title) =>
        `Start ${title}: pick 1 lesson, practice slowly for 15-20 minutes, then mark complete.`,
      doneBelt: (title) =>
        `You completed all ${title} lessons. Great - now review and gradually build endurance.`,
      progressBelt: (done, total, title) =>
        `You completed ${done}/${total} lessons in ${title}. Keep steady pace and add one more lesson today.`,
      progress: "Progress",
      resources: "Resources",
      lessons: "Lessons",
      videos: "Videos",
      mappedVideo: "Videos are mapped to the current belt level.",
      viewRoadmap: "View roadmap",
      viewVideo: "View videos",
      viewProgress: "View progress",
      quickSuggestion: "Quick suggestions",
      curriculumHint: (title) => `(Suggested from the ${title} curriculum)`,
      nudge: (name) => `Hi ${name}... how about a quick 5-minute stance review today?`,
      defaultName: "you",
      overviewTitle: "Progress overview",
      overviewDesc: (done, total) => `You completed ${done}/${total} lessons.`,
      offlineTitle: "Offline mode",
      offlineDesc: "Preload 5 lessons for fast access on weak/offline networks.",
      turningOff: "Turning off...",
      downloading: "Downloading...",
      turnOffOffline: "Disable offline",
      loadOffline: "Download 5 offline lessons",
      offlineLoadOk: "Downloaded 5 lessons to this device for smoother offline practice!",
      offlineLoadFallback: "Offline mode enabled. (Could not send cache request to Service Worker)",
      offlineTurnedOff: "Offline mode disabled.",
    };
  }

  if (id === "ja") {
    return {
      noLessonsInBelt: "この帯レベルにはまだレッスンがありません。",
      startBelt: (title) =>
        `${title}を開始: 1レッスン選んで15-20分ゆっくり練習し、完了を記録しましょう。`,
      doneBelt: (title) =>
        `${title}をすべて完了しました。いい流れです。復習しながら持久力を段階的に上げましょう。`,
      progressBelt: (done, total, title) =>
        `${title} は ${done}/${total} 完了。一定ペースで、今日はもう1レッスン進めましょう。`,
      progress: "進捗",
      resources: "リソース",
      lessons: "レッスン",
      videos: "動画",
      mappedVideo: "動画は現在の帯レベルに対応しています。",
      viewRoadmap: "ロードマップを見る",
      viewVideo: "動画を見る",
      viewProgress: "進捗を見る",
      quickSuggestion: "クイック提案",
      curriculumHint: (title) => `（${title} のカリキュラムに基づく提案）`,
      nudge: (name) => `${name}さん、今日は5分だけ基本の立ち方を復習しましょう。`,
      defaultName: "あなた",
      overviewTitle: "進捗サマリー",
      overviewDesc: (done, total) => `${done}/${total} レッスンを完了しました。`,
      offlineTitle: "オフラインモード",
      offlineDesc: "電波が弱い/オフライン時のために5レッスンを事前保存します。",
      turningOff: "オフライン解除中...",
      downloading: "ダウンロード中...",
      turnOffOffline: "オフラインを無効化",
      loadOffline: "5レッスンをオフライン保存",
      offlineLoadOk: "5レッスンを端末に保存しました。オフラインでも練習しやすくなります。",
      offlineLoadFallback: "オフラインは有効化されました。（Service Worker にキャッシュ要求を送信できませんでした）",
      offlineTurnedOff: "オフラインを無効化しました。",
    };
  }

  return {
    noLessonsInBelt: "Chưa có bài trong cấp này.",
    startBelt: (title) =>
      `Bắt đầu ${title}: chọn 1 bài, tập chậm 15-20 phút cho sạch động tác rồi đánh dấu.`,
    doneBelt: (title) =>
      `Bạn đã hoàn thành toàn bộ ${title}. Oke - giờ ôn lại + tăng dần độ bền là đẹp.`,
    progressBelt: (done, total, title) =>
      `Bạn đã chốt ${done}/${total} bài ${title}. Giữ nhịp đều, hôm nay làm thêm 1 bài là tiến bộ.`,
    progress: "Tiến độ",
    resources: "Tài nguyên",
    lessons: "Bài học",
    videos: "Video",
    mappedVideo: "Video được map theo đúng cấp đai hiện tại.",
    viewRoadmap: "Xem lộ trình",
    viewVideo: "Xem video",
    viewProgress: "Xem tiến độ",
    quickSuggestion: "Gợi ý học nhanh",
    curriculumHint: (title) => `(Gợi ý dựa trên giáo trình ${title})`,
    nudge: (name) => `Chào ${name}… hôm nay ôn lại Tấn Trung Bình 5 phút thôi nhé?`,
    defaultName: "bạn",
    overviewTitle: "Tổng quan tiến độ",
    overviewDesc: (done, total) => `Bạn đã hoàn thành ${done}/${total} bài.`,
    offlineTitle: "Chế độ offline",
    offlineDesc: "Tải trước 5 bài học để mở nhanh khi mạng yếu/không có mạng.",
    turningOff: "Đang tắt...",
    downloading: "Đang tải...",
    turnOffOffline: "Tắt offline",
    loadOffline: "Tải 5 bài offline",
    offlineLoadOk: "Đã tải 5 bài học về thiết bị, tập luyện mượt mà ngay cả khi không có mạng!",
    offlineLoadFallback: "Đã bật offline. (Không gửi được yêu cầu cache cho Service Worker)",
    offlineTurnedOff: "Đã tắt offline.",
  };
}

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
    <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-950/40">
      <div
        className="h-full bg-linear-to-r from-cyan-300 to-blue-500 progress-bar"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

function resolveLessonsForBelt(belt) {
  const beltId = String(belt?.id || "").trim();
  const levelId = String(belt?.lessonLevel || "").trim();

  if (typeof getLessonsByBeltId === "function" && beltId) {
    return getLessonsByBeltId(beltId);
  }

  if (typeof getLessonsByLevel === "function" && levelId) {
    return getLessonsByLevel(levelId);
  }

  return LESSONS.filter((l) => {
    const lBeltId = String(l?.beltId || "").trim();
    const lLevelId = String(l?.level || "").trim();
    return (beltId && lBeltId === beltId) || (levelId && lLevelId === levelId);
  });
}

function BeltCard({ belt, doneSlugs, copy }) {
  const lessons = useMemo(
    () => resolveLessonsForBelt(belt),
    [belt]
  );

  const total = lessons.length;
  const doneCount = lessons.filter((l) => doneSlugs.includes(l.slug)).length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const progressNote = useMemo(() => {
    if (total === 0) return copy.noLessonsInBelt;
    if (doneCount === 0) {
      return copy.startBelt(belt.title);
    }
    if (doneCount >= total) {
      return copy.doneBelt(belt.title);
    }
    return copy.progressBelt(doneCount, total, belt.title);
  }, [belt.title, copy, doneCount, total]);

  const videoCount = useMemo(
    () => VIDEOS.filter((v) => v.beltId === belt.id).length,
    [belt.id]
  );

  return (
    <section className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:scale-[1.01] hover:border-cyan-300/35 hover:bg-white/10 hover:shadow-[var(--shadow-card-strong)]">
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
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold text-slate-300">{copy.progress}</div>
            <div className="mt-3">
              <ProgressBar percent={percent} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              {progressNote}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold text-slate-300">{copy.resources}</div>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>{copy.lessons}</span>
                <span className="font-semibold text-white">{total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.videos}</span>
                <span className="font-semibold text-white">{videoCount}</span>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">{copy.mappedVideo}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/lo-trinh"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            {copy.viewRoadmap}
          </Link>
          <Link
            href="/video"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.viewVideo}
          </Link>
          <Link
            href="/tien-do"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.viewProgress}
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 shadow-[var(--shadow-card)]">
          <div className="text-xs font-semibold text-slate-300">{copy.quickSuggestion}</div>
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
            {copy.curriculumHint(belt.title)}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function LearningDashboard() {
  const locale = useLocale();
  const copy = getCopy(locale);
  const totalLessons = useMemo(() => LESSONS.length, []);
  const [doneSlugs, setDoneSlugs] = useState([]);
  const [showNudge, setShowNudge] = useState(false);
  const [offlineEnabled, setOfflineEnabled] = useState(false);
  const [offlineLessonSlugs, setOfflineLessonSlugs] = useState([]);
  const [offlineNotice, setOfflineNotice] = useState("");
  const [offlineNoticeTone, setOfflineNoticeTone] = useState("info");
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
    setOfflineNoticeTone("info");
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
        setOfflineNotice(ok ? copy.offlineLoadOk : copy.offlineLoadFallback);
        setOfflineNoticeTone(ok ? "success" : "info");
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
      setOfflineNotice(copy.offlineTurnedOff);
      setOfflineNoticeTone("info");
    } finally {
      setOfflineBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      {showNudge ? (
        <div className="rounded-3xl border border-cyan-300/20 bg-linear-to-r from-cyan-300/10 to-blue-500/10 p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <p className="text-sm leading-6 text-slate-300">
            {(() => {
              const profile = readProfile();
              const rawName = String(profile?.name || "").trim();
              const name = rawName && rawName !== "Học viên" ? rawName : copy.defaultName;
              return copy.nudge(name);
            })()}
          </p>
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card-strong)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{copy.overviewTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {copy.overviewDesc(overallDone, totalLessons)}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/35 px-4 py-2 text-sm font-semibold text-cyan-100">
            {overallPercent}%
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-950/40">
          <div
            className="h-full bg-linear-to-r from-cyan-300 to-blue-500 progress-bar"
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
                <h2 className="text-lg font-semibold text-white">{copy.offlineTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {copy.offlineDesc}
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
                ? "inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                : "inline-flex h-11 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
            }
          >
            {offlineBusy
              ? offlineEnabled
                ? copy.turningOff
                : copy.downloading
              : offlineEnabled
                ? copy.turnOffOffline
                : copy.loadOffline}
          </button>
        </div>

        {offlineNotice ? (
          <div
            className={
              "mt-4 rounded-2xl border p-4 text-sm leading-6 " +
              (offlineNoticeTone === "success"
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
            <BeltCard belt={belt} doneSlugs={doneSlugs} copy={copy} />
          </div>
        ))}
      </div>
    </div>
  );
}

