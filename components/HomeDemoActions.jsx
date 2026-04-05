"use client";

import { useState } from "react";

export default function HomeDemoActions({
  primaryLabel = "Demo AI Coach",
  secondaryLabel = "Tạo buổi tập hôm nay",
  aiPrompt = "Gợi ý cho tôi 1 buổi tập Vovinam 20 phút hôm nay, phù hợp người mới.",
}) {
  const [sending, setSending] = useState(false);

  const askAiCoach = () => {
    if (typeof window === "undefined") return;

    setSending(true);
    window.dispatchEvent(
      new CustomEvent("vovinam-ai-ask", {
        detail: {
          query: aiPrompt,
          context: { kind: "roadmap" },
        },
      })
    );

    window.setTimeout(() => setSending(false), 600);
  };

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={askAiCoach}
        className="inline-flex h-10 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/12 px-4 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/18 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
      >
        {sending ? "Dang mo AI Coach..." : primaryLabel}
      </button>

      <button
        type="button"
        onClick={askAiCoach}
        className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/15 bg-white/6 px-4 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
      >
        {secondaryLabel}
      </button>
    </div>
  );
}
