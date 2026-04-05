"use client";

import { useState } from "react";

const WOW_WORKOUT = {
  warmup: "5 phút khởi động",
  core: "10 đòn cơ bản (đấm thẳng, đá tạt)",
  reflex: "3 bài phản xạ",
  note: "Giữ form chuẩn, không cần nhanh.",
};

export default function HomeDemoActions({
  title = "Thử ngay AI Coach",
  primaryLabel = "Tạo buổi tập cho tôi",
  secondaryLabel = "",
  aiPrompt = "Gợi ý cho tôi 1 buổi tập Vovinam 20 phút hôm nay, phù hợp người mới.",
  resultLatencyMs = 800,
  showSecondary = false,
}) {
  const [sending, setSending] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const askAiCoach = () => {
    if (typeof window === "undefined") return;

    setSending(true);
    setShowResult(false);

    // Best-effort trigger for live demo feel; UI never depends on AI response.
    try {
      window.dispatchEvent(
        new CustomEvent("vovinam-ai-ask", {
          detail: {
            query: aiPrompt,
            context: { kind: "roadmap" },
          },
        })
      );
    } catch {
      // ignore
    }

    window.setTimeout(() => {
      setShowResult(true);
      setSending(false);
    }, Math.max(400, Number(resultLatencyMs) || 800));
  };

  return (
    <section className="surface-card enterprise-shell ui3d-card fade-in-up mt-4 rounded-3xl p-4 sm:p-5">
      <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={askAiCoach}
          className="cta-primary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          {sending ? "AI đang suy nghĩ..." : primaryLabel}
        </button>

        {showSecondary && secondaryLabel ? (
          <button
            type="button"
            onClick={askAiCoach}
            className="cta-secondary inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>

      {showResult ? (
        <div className="fade-in-up mt-3 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
              Buổi tập hôm nay
            </div>
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/12 px-2 py-1 text-[11px] font-semibold text-cyan-100">
              AI tạo trong 0.8s
            </span>
          </div>

          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-slate-200">
            <li>• {WOW_WORKOUT.warmup}</li>
            <li>• {WOW_WORKOUT.core}</li>
            <li>• {WOW_WORKOUT.reflex}</li>
          </ul>
          <p className="mt-2 text-xs text-slate-300">Lưu ý: {WOW_WORKOUT.note}</p>
        </div>
      ) : null}
    </section>
  );
}
