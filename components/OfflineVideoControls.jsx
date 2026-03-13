"use client";

import { useEffect, useMemo, useState } from "react";

import { readProfile, writeProfile } from "@/lib/profile";

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

export default function OfflineVideoControls({ videoId, title }) {
  const [profile, setProfile] = useState(() => readProfile());
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setProfile(readProfile());

    sync();
    window.addEventListener("vovinam-profile", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-profile", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const saved = useMemo(() => {
    const list = Array.isArray(profile.offlineVideos) ? profile.offlineVideos : [];
    return list.includes(videoId);
  }, [profile.offlineVideos, videoId]);

  const onSave = async () => {
    setNotice("");
    setBusy(true);

    try {
      const nextList = Array.from(
        new Set([...(Array.isArray(profile.offlineVideos) ? profile.offlineVideos : []), videoId])
      );

      writeProfile({
        ...profile,
        offlineVideos: nextList,
      });

      const ok = await postToServiceWorker({
        type: "CACHE_URLS",
        payload: { urls: ["/", "/video", `/video/${videoId}`] },
      });

      setNotice(
        ok
          ? "Đã lưu offline (trang + transcript). Video YouTube có thể không xem offline."
          : "Đã lưu danh sách offline. (Không gửi được yêu cầu cache cho Service Worker)"
      );
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setNotice("");
    setBusy(true);

    try {
      const nextList = (Array.isArray(profile.offlineVideos) ? profile.offlineVideos : []).filter((x) => x !== videoId);

      writeProfile({
        ...profile,
        offlineVideos: nextList,
      });

      const ok = await postToServiceWorker({
        type: "UNCACHE_URLS",
        payload: { urls: [`/video/${videoId}`] },
      });

      setNotice(ok ? "Đã xoá offline." : "Đã xoá khỏi danh sách offline." );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-300">Offline</div>
          <div className="mt-1 text-sm font-semibold text-white truncate">{title}</div>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Lưu để mở lại trang khi mạng yếu/không có mạng. (Demo: cache HTML + assets + transcript)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {saved ? (
            <button
              type="button"
              disabled={busy}
              onClick={onRemove}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            >
              {busy ? "Đang xử lý…" : "Xoá offline"}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onSave}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 px-3 text-xs font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              {busy ? "Đang lưu…" : "Lưu offline"}
            </button>
          )}
        </div>
      </div>

      {notice ? (
        <div className="mt-3 text-xs text-slate-200">
          {notice}
        </div>
      ) : null}

      <div className="mt-2 text-xs text-slate-400">
        Trạng thái: <span className="font-semibold text-slate-200">{saved ? "Đã lưu" : "Chưa lưu"}</span>
      </div>
    </div>
  );
}
