"use client";

import { useEffect, useRef, useState } from "react";

export default function HlsVideoPlayer({ src, title, poster, className }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;

    setError("");

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
        setError("Thiếu nguồn video.");
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
        setError("Không tải được player HLS.");
        return;
      }

      if (!Hls.isSupported()) {
        setError("Trình duyệt không hỗ trợ HLS.");
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
          setError("Không phát được HLS trên thiết bị này.");
        }
      });

      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        try {
          hls.loadSource(src);
        } catch {
          cleanup();
          setError("Không phát được HLS (loadSource lỗi).");
        }
      });
    };

    init().catch(() => {
      if (!cancelled) setError("Không tải được player HLS.");
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [src]);

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
