"use client";

import { useEffect, useMemo, useRef } from "react";

function withParams(url, params) {
  const raw = String(url || "").trim();
  if (!raw) return "";

  try {
    const u = new URL(raw);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      u.searchParams.set(k, String(v));
    });
    return u.toString();
  } catch {
    return raw;
  }
}

export default function YouTubeEmbed({ src, title, className, apiRef }) {
  const iframeRef = useRef(null);

  const iframeSrc = useMemo(() => {
    return withParams(src, {
      enablejsapi: 1,
      playsinline: 1,
      rel: 0,
    });
  }, [src]);

  const postMessageOrigin = useMemo(() => {
    try {
      const u = new URL(iframeSrc);
      return u.origin;
    } catch {
      return "*";
    }
  }, [iframeSrc]);

  useEffect(() => {
    if (!apiRef || typeof apiRef !== "object") return;

    apiRef.current = {
      seekTo: (seconds) => {
        const frame = iframeRef.current;
        const t = Math.floor(Number(seconds));
        if (!frame?.contentWindow || Number.isNaN(t)) return;

        try {
          frame.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "seekTo", args: [Math.max(0, t), true] }),
            postMessageOrigin
          );
          frame.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "playVideo", args: [] }),
            postMessageOrigin
          );
        } catch {
          // ignore
        }
      },

      setPlaybackRate: (rate) => {
        const frame = iframeRef.current;
        const r = Number(rate);
        if (!frame?.contentWindow || !Number.isFinite(r) || r <= 0) return;

        try {
          frame.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "setPlaybackRate", args: [r] }),
            postMessageOrigin
          );
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
  }, [apiRef, postMessageOrigin]);

  return (
    <div className={className}>
      <iframe
        ref={iframeRef}
        className="h-full w-full"
        src={iframeSrc}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
