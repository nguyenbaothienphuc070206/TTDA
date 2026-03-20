"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";

import HlsVideoPlayer from "@/components/HlsVideoPlayer";
import OfflineVideoControls from "@/components/OfflineVideoControls";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { isFreeBeltId } from "@/data/belts";
import { readProfile } from "@/lib/profile";

const TRANSCRIPT_KEY_PREFIX = "vovinam_video_transcript_v1:";

function readStoredTranscript(videoId) {
  if (typeof window === "undefined") return null;
  const id = String(videoId || "").trim();
  if (!id) return null;

  try {
    const raw = window.localStorage.getItem(`${TRANSCRIPT_KEY_PREFIX}${id}`);
    if (!raw) return null;

    const data = JSON.parse(raw);
    const segments = Array.isArray(data?.segments) ? data.segments : null;
    if (!segments) return null;

    const cleaned = segments
      .map((s) => ({
        startSec: Math.max(0, Math.floor(Number(s?.startSec))),
        text: String(s?.text || "").trim(),
      }))
      .filter((s) => Number.isFinite(s.startSec) && s.text);

    if (cleaned.length === 0) return null;

    return {
      segments: cleaned.slice(0, 30),
      mode: typeof data?.mode === "string" ? data.mode : "",
    };
  } catch {
    return null;
  }
}

function writeStoredTranscript(videoId, payload) {
  if (typeof window === "undefined") return;
  const id = String(videoId || "").trim();
  if (!id) return;

  try {
    window.localStorage.setItem(`${TRANSCRIPT_KEY_PREFIX}${id}`, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function formatTime(seconds) {
  const t = Math.max(0, Math.floor(Number(seconds) || 0));
  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      defaultTitle: "Video",
      playerFatal: "Cannot play this video.",
      transcriptCreateError: "Could not generate transcript.",
      premiumTitle: "Premium Video",
      premiumDesc:
        "This video belongs to Yellow/Red belt levels. Unlock Premium to watch video, transcript, and ask AI Coach (RAG).",
      unlockPremium: "Unlock Premium",
      viewFreeVideos: "View Blue belt videos",
      premiumNote: "Note: Premium is currently demo-based using local profile storage.",
      noSource: "No valid playback source for this video.",
      fallbackPlaying: "Using backup source to play this video.",
      retryPrimary: "Retry primary source",
      openYoutube: "Open on YouTube",
      playbackOptions: "Playback options",
      cameraAngle: "Camera angle",
      speedHint: "Tip: use 0.5x to inspect detailed hand/foot timing.",
      transcriptAi: "Transcript (AI)",
      transcript: "Transcript",
      loadingTranscript: "Generating transcript…",
      noTranscript: "No transcript yet.",
    };
  }

  if (id === "ja") {
    return {
      defaultTitle: "動画",
      playerFatal: "動画を再生できません。",
      transcriptCreateError: "トランスクリプトを作成できません。",
      premiumTitle: "プレミアム動画",
      premiumDesc:
        "この動画は黄帯・紅帯レベル向けです。プレミアムを有効化すると動画、トランスクリプト、AIコーチ（RAG）が利用できます。",
      unlockPremium: "プレミアムを開放",
      viewFreeVideos: "青帯動画を見る",
      premiumNote: "注: プレミアムは現在、プロフィール（localStorage）によるデモ実装です。",
      noSource: "この動画に有効な再生ソースがありません。",
      fallbackPlaying: "バックアップソースで再生しています。",
      retryPrimary: "メインソースを再試行",
      openYoutube: "YouTubeで開く",
      playbackOptions: "再生オプション",
      cameraAngle: "視点",
      speedHint: "ヒント: 0.5x で手足の出し引きタイミングを確認できます。",
      transcriptAi: "文字起こし（AI）",
      transcript: "文字起こし",
      loadingTranscript: "文字起こしを生成中…",
      noTranscript: "まだ文字起こしがありません。",
    };
  }

  return {
    defaultTitle: "Video",
    playerFatal: "Không phát được video.",
    transcriptCreateError: "Không tạo được transcript.",
    premiumTitle: "Video Premium",
    premiumDesc:
      "Video này thuộc hệ Hoàng/Hồng đai. Mở Premium để xem video, transcript và hỏi AI Coach (RAG).",
    unlockPremium: "Mở khóa Premium",
    viewFreeVideos: "Xem video hệ Lam đai",
    premiumNote: "Lưu ý: Premium hiện là demo theo hồ sơ (localStorage).",
    noSource: "Không có nguồn phát hợp lệ cho video này.",
    fallbackPlaying: "Đang dùng nguồn dự phòng để phát video.",
    retryPrimary: "Thử lại nguồn chính",
    openYoutube: "Mở trên YouTube",
    playbackOptions: "Tùy chọn phát",
    cameraAngle: "Góc nhìn",
    speedHint: "Gợi ý: dùng 0.5x để soi chi tiết nhịp ra-thu tay/chân.",
    transcriptAi: "Transcript (AI)",
    transcript: "Transcript",
    loadingTranscript: "Đang tạo transcript…",
    noTranscript: "Chưa có transcript.",
  };
}

export default function VideoPlayerPanel({ video }) {
  const locale = useLocale();
  const copy = getCopy(locale);

  const playerApiRef = useRef(null);

  const [planId, setPlanId] = useState("free");
  const isPremium = planId === "premium";

  const videoId = String(video?.id || "").trim();
  const title = String(video?.title || copy.defaultTitle).trim();
  const beltId = String(video?.beltId || "").trim();

  const angleOptions = useMemo(() => {
    const raw = Array.isArray(video?.angles) ? video.angles : [];
    return raw
      .map((a) => ({
        id: String(a?.id || "").trim(),
        label: String(a?.label || "").trim(),
        hlsUrl: typeof a?.hlsUrl === "string" ? a.hlsUrl : "",
        embedUrl: typeof a?.embedUrl === "string" ? a.embedUrl : "",
        watchUrl: typeof a?.watchUrl === "string" ? a.watchUrl : "",
      }))
      .filter((a) => a.id && a.label && (a.hlsUrl || a.embedUrl));
  }, [video]);

  const [angleId, setAngleId] = useState(() => angleOptions[0]?.id || "");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [playerError, setPlayerError] = useState("");

  useEffect(() => {
    setAngleId(angleOptions[0]?.id || "");
    setPlaybackRate(1);
    setUseEmbedFallback(false);
    setPlayerError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const activeAngle = useMemo(() => {
    if (!angleOptions.length) return null;
    return angleOptions.find((a) => a.id === angleId) || angleOptions[0] || null;
  }, [angleId, angleOptions]);

  const source = useMemo(() => {
    if (activeAngle) {
      return {
        hlsUrl: activeAngle.hlsUrl,
        embedUrl: activeAngle.embedUrl,
        watchUrl: activeAngle.watchUrl,
      };
    }

    return {
      hlsUrl: typeof video?.hlsUrl === "string" ? video.hlsUrl : "",
      embedUrl: typeof video?.embedUrl === "string" ? video.embedUrl : "",
      watchUrl: typeof video?.watchUrl === "string" ? video.watchUrl : "",
    };
  }, [activeAngle, video]);

  const isLocked = Boolean(beltId) && !isFreeBeltId(beltId);
  const canAccess = !isLocked || isPremium;

  const onPlayerFatal = useCallback(
    (message) => {
      setPlayerError(String(message || copy.playerFatal).trim());
      if (source.embedUrl) {
        setUseEmbedFallback(true);
      }
    },
    [copy.playerFatal, source.embedUrl]
  );

  useEffect(() => {
    try {
      playerApiRef.current?.setPlaybackRate?.(playbackRate);
    } catch {
      // ignore
    }
  }, [playbackRate, angleId, videoId]);

  useEffect(() => {
    const sync = () => {
      const p = readProfile();
      setPlanId(p?.planId === "premium" ? "premium" : "free");
    };

    sync();
    window.addEventListener("vovinam-profile", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-profile", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const stored = useMemo(() => readStoredTranscript(videoId), [videoId]);
  const [segments, setSegments] = useState(() => stored?.segments || []);
  const [mode, setMode] = useState(() => stored?.mode || "");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState("");

  useEffect(() => {
    if (!videoId) return;
    if (!canAccess) return;
    if (segments.length > 0) return;

    let cancelled = false;

    const run = async () => {
      setLoadingTranscript(true);
      setTranscriptError("");

      try {
        const res = await fetch("/api/ai/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || copy.transcriptCreateError);
        }

        const nextSegments = Array.isArray(data?.segments) ? data.segments : [];
        const cleaned = nextSegments
          .map((s) => ({
            startSec: Math.max(0, Math.floor(Number(s?.startSec))),
            text: String(s?.text || "").trim(),
          }))
          .filter((s) => Number.isFinite(s.startSec) && s.text)
          .slice(0, 30);

        if (cancelled) return;

        setSegments(cleaned);
        setMode(typeof data?.mode === "string" ? data.mode : "");
        writeStoredTranscript(videoId, {
          segments: cleaned,
          mode: typeof data?.mode === "string" ? data.mode : "",
          createdAt: Date.now(),
        });
      } catch (err) {
        if (!cancelled) {
          setTranscriptError(err instanceof Error ? err.message : copy.transcriptCreateError);
        }
      } finally {
        if (!cancelled) setLoadingTranscript(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [videoId, canAccess, copy.transcriptCreateError, segments.length]);

  const onSeek = (startSec) => {
    try {
      playerApiRef.current?.seekTo?.(startSec);
    } catch {
      // ignore
    }
  };

  const transcriptTitle = useMemo(() => {
    if (mode === "openai") return copy.transcriptAi;
    return copy.transcript;
  }, [copy.transcript, copy.transcriptAi, mode]);

  const showHls = Boolean(source.hlsUrl) && !useEmbedFallback;

  if (!canAccess) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold text-white">{copy.premiumTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {copy.premiumDesc}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/ho-so#goi-premium"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          >
            {copy.unlockPremium}
          </Link>
          <Link
            href="/video"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.viewFreeVideos}
          </Link>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          {copy.premiumNote}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-[var(--shadow-card)]">
      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
        {showHls ? (
          <HlsVideoPlayer
            src={source.hlsUrl}
            title={title}
            className="h-full w-full"
            apiRef={playerApiRef}
            onFatalError={onPlayerFatal}
          />
        ) : source.embedUrl ? (
          <YouTubeEmbed
            src={source.embedUrl}
            title={title}
            className="h-full w-full"
            apiRef={playerApiRef}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-200">
            {copy.noSource}
          </div>
        )}
      </div>

      {useEmbedFallback && source.embedUrl ? (
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3 text-xs text-slate-200">
          {playerError || copy.fallbackPlaying}
          <button
            type="button"
            onClick={() => {
              setUseEmbedFallback(false);
              setPlayerError("");
            }}
            className="ml-2 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {copy.retryPrimary}
          </button>

          {source.watchUrl ? (
            <a
              href={source.watchUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            >
              {copy.openYoutube}
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4">
        <OfflineVideoControls videoId={videoId} title={title} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-300">{copy.playbackOptions}</div>
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlaybackRate(1)}
              className={
                "inline-flex h-9 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400/30 " +
                (playbackRate === 1
                  ? "bg-white/10 text-white"
                  : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white")
              }
              aria-pressed={playbackRate === 1}
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => setPlaybackRate(0.5)}
              className={
                "inline-flex h-9 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400/30 " +
                (playbackRate === 0.5
                  ? "bg-white/10 text-white"
                  : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white")
              }
              aria-pressed={playbackRate === 0.5}
            >
              0.5x
            </button>
          </div>
        </div>

        {angleOptions.length > 1 ? (
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-300">{copy.cameraAngle}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {angleOptions.map((a) => {
                const active = a.id === (activeAngle?.id || "");
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAngleId(a.id)}
                    className={
                      "inline-flex h-9 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400/30 " +
                      (active
                        ? "bg-white/10 text-white"
                        : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white")
                    }
                    aria-pressed={active}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <p className="mt-3 text-xs leading-5 text-slate-400">
          {copy.speedHint}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
        <div className="text-xs font-semibold text-slate-300">{transcriptTitle}</div>

        {loadingTranscript ? (
          <div className="mt-2 text-sm leading-6 text-slate-300">{copy.loadingTranscript}</div>
        ) : segments.length > 0 ? (
          <ul className="mt-2 grid gap-2">
            {segments.map((s) => (
              <li key={`${s.startSec}-${s.text.slice(0, 20)}`}>
                <button
                  type="button"
                  onClick={() => onSeek(s.startSec)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex shrink-0 rounded-xl border border-white/10 bg-slate-950/40 px-2 py-1 text-xs font-semibold text-slate-200">
                      {formatTime(s.startSec)}
                    </span>
                    <span className="text-sm leading-6 text-slate-300">{s.text}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 text-sm leading-6 text-slate-300">{copy.noTranscript}</div>
        )}

        {transcriptError ? (
          <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-xs text-rose-100">
            {transcriptError}
          </div>
        ) : null}
      </div>
    </section>
  );
}

