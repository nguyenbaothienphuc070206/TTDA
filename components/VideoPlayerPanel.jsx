"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import HlsVideoPlayer from "@/components/HlsVideoPlayer";
import OfflineVideoControls from "@/components/OfflineVideoControls";
import YouTubeEmbed from "@/components/YouTubeEmbed";
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

export default function VideoPlayerPanel({ video }) {
  const playerApiRef = useRef(null);

  const [planId, setPlanId] = useState("free");
  const isPremium = planId === "premium";

  const videoId = String(video?.id || "").trim();
  const title = String(video?.title || "Video").trim();
  const beltId = String(video?.beltId || "").trim();

  const isLocked = Boolean(beltId) && beltId !== "lam-dai";
  const canAccess = !isLocked || isPremium;

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
          throw new Error(data?.error || "Không tạo được transcript.");
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
          setTranscriptError(err instanceof Error ? err.message : "Không tạo được transcript.");
        }
      } finally {
        if (!cancelled) setLoadingTranscript(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, canAccess]);

  const onSeek = (startSec) => {
    try {
      playerApiRef.current?.seekTo?.(startSec);
    } catch {
      // ignore
    }
  };

  const transcriptTitle = useMemo(() => {
    if (mode === "openai") return "Transcript (AI)";
    return "Transcript";
  }, [mode]);

  if (!canAccess) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold text-white">Video Premium</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Video này thuộc Hoàng/Huyền đai. Mở Premium để xem video, transcript và
          hỏi AI Coach (RAG).
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/ho-so"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          >
            Mở khóa Premium
          </Link>
          <Link
            href="/video"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            Xem video Lam đai
          </Link>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-400">
          Lưu ý: Premium hiện là demo theo hồ sơ (localStorage).
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-[var(--shadow-card)]">
      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
        {video?.hlsUrl ? (
          <HlsVideoPlayer
            src={video.hlsUrl}
            title={title}
            className="h-full w-full"
            apiRef={playerApiRef}
          />
        ) : (
          <YouTubeEmbed
            src={video?.embedUrl}
            title={title}
            className="h-full w-full"
            apiRef={playerApiRef}
          />
        )}
      </div>

      <div className="mt-4">
        <OfflineVideoControls videoId={videoId} title={title} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
        <div className="text-xs font-semibold text-slate-300">{transcriptTitle}</div>

        {loadingTranscript ? (
          <div className="mt-2 text-sm leading-6 text-slate-300">Đang tạo transcript…</div>
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
          <div className="mt-2 text-sm leading-6 text-slate-300">Chưa có transcript.</div>
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
