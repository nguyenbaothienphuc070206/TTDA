"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const WATCHED_KEY = "vovinam_video_done_v1";

const DEFAULT_TODAY = [
  {
    id: "lam-dai-tu-ve-quyen",
    title: "Video quyền Lam đai tự vệ",
  },
  {
    id: "lam-dai-tu-ve-phan-don",
    title: "Video phản đòn cơ bản",
  },
];

function readWatched() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WATCHED_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.map((x) => String(x || "")).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeWatched(list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WATCHED_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export default function VideoTodayPanel() {
  const [from] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return String(params.get("from") || "").trim().toLowerCase();
  });

  const [focusVideo] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return String(params.get("focusVideo") || "").trim();
  });

  const [watched, setWatched] = useState(() => readWatched());

  const sourceLabel =
    from === "ai"
      ? "Bạn đang đi từ AI Coach"
      : from === "course"
        ? "Bạn đang đi từ Course"
        : "Video cho buổi tập hôm nay";

  const items = useMemo(() => {
    if (!focusVideo) return DEFAULT_TODAY;
    const extra = {
      id: focusVideo,
      title: "Video được đề xuất cho buổi tập hiện tại",
    };
    return [extra, ...DEFAULT_TODAY.filter((x) => x.id !== focusVideo)].slice(0, 2);
  }, [focusVideo]);

  const markWatched = (id) => {
    const safeId = String(id || "").trim();
    if (!safeId) return;
    const next = Array.from(new Set([...watched, safeId]));
    setWatched(next);
    writeWatched(next);
  };

  return (
    <section className="surface-card enterprise-shell rounded-3xl p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Navigator</p>
      <h2 className="mt-1 text-lg font-semibold text-white">{sourceLabel}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Xem theo thứ tự dưới đây để video phục vụ trực tiếp buổi tập, không bị loãng như thư viện.
      </p>

      <div className="mt-4 grid gap-2">
        {items.map((item) => {
          const done = watched.includes(item.id);
          return (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/video/${item.id}`} className="text-sm font-semibold text-cyan-100 hover:text-white">
                  {item.title}
                </Link>
                <button
                  type="button"
                  onClick={() => markWatched(item.id)}
                  className={
                    "inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold " +
                    (done
                      ? "border border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10")
                  }
                >
                  {done ? "Đã xem" : "Đánh dấu đã xem"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/hoc-tap?from=video" className="cta-secondary inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white">
          Quay lại Course
        </Link>
        <Link href="/ky-thuat?focus=da-tong-truoc&from=video" className="cta-secondary inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white">
          Mở kỹ thuật liên quan
        </Link>
      </div>
    </section>
  );
}
