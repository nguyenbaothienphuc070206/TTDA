"use client";

import { useEffect, useRef, useState } from "react";

export default function HlsVideoPlayer({ src, title, poster, className, apiRef, onFatalError }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!apiRef || typeof apiRef !== "object") return;

    apiRef.current = {
      seekTo: (seconds) => {
        const video = videoRef.current;
        const t = Number(seconds);
        if (!video || Number.isNaN(t)) return;

        try {
          video.currentTime = Math.max(0, t);
          // Best-effort: resume playback after seeking.
          video.play?.().catch?.(() => {});
        } catch {
          // ignore
        }
      },

      setPlaybackRate: (rate) => {
        const video = videoRef.current;
        const r = Number(rate);
        if (!video || !Number.isFinite(r) || r <= 0) return;

        try {
          video.playbackRate = r;
        } catch {
          // ignore
        }
      },
    };

    return () => {
      try {
        apiRef.current = null;
      } catch {
        // ignore
      }
    };
  }, [apiRef]);

  useEffect(() => {
    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;

    setError("");

    const reportFatal = (message) => {
      const safeMessage = String(message || "Không phát được video.").trim();
      setError(safeMessage);
      try {
        onFatalError?.(safeMessage);
      } catch {
        // ignore
      }
    };

    const cleanup = () => {
      const hls = hlsRef.current;
      hlsRef.current = null;

      try {
        if (hls) hls.destroy();
      } catch {
        // ignore
      }

      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        // ignore
      }
    };

    const init = async () => {
      if (!src) {
        reportFatal("Thiếu nguồn video.");
        return;
      }

      // Native HLS (Safari)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }

      const mod = await import("hls.js");
      if (cancelled) return;

      const Hls = mod.default;
      if (!Hls || typeof Hls.isSupported !== "function") {
        reportFatal("Không tải được player HLS.");
        return;
      }

      if (!Hls.isSupported()) {
        reportFatal("Trình duyệt không hỗ trợ HLS.");
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data?.fatal) {
          cleanup();
          reportFatal("Không phát được HLS trên thiết bị này.");
        }
      });

      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        try {
          hls.loadSource(src);
        } catch {
          cleanup();
          reportFatal("Không phát được HLS (loadSource lỗi).");
        }
      });
    };

    init().catch(() => {
      if (!cancelled) reportFatal("Không tải được player HLS.");
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [onFatalError, src]);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={title || "Video"}
      />

      {error ? (
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3 text-xs text-rose-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
