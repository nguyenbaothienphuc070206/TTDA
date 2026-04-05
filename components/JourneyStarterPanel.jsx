"use client";

import Link from "next/link";
import { useState } from "react";

const PLAN = {
  beltTitle: "Lam đai tự vệ",
  lessonSlug: "lam-dai-tu-ve-quyen",
  videoId: "lam-dai-tu-ve-quyen",
  techniqueSlug: "da-tong-truoc",
};

export default function JourneyStarterPanel() {
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const runTest = () => {
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      setTested(true);
    }, 800);
  };

  const runAiPlan = () => {
    if (typeof window === "undefined") return;

    setGenerating(true);

    try {
      window.dispatchEvent(
        new CustomEvent("vovinam-ai-ask", {
          detail: {
            query:
              "Tôi mới tập. Hãy tạo buổi tập hôm nay theo cấp Lam đai tự vệ gồm quyền, phản xạ và video hướng dẫn.",
            context: { kind: "journey" },
          },
        })
      );
    } catch {
      // ignore
    }

    window.setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 900);
  };

  return (
    <section className="surface-card-strong enterprise-shell rounded-3xl p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">Bắt đầu tại đây (Recommended)</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Đây là đường đi chuẩn cho người mới: test nhanh, để AI tạo buổi tập, rồi vào thẳng bài đầu tiên.
      </p>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <button
          type="button"
          onClick={runTest}
          className="cta-secondary inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white"
        >
          {testing ? "Đang test trình độ..." : "Test trình độ 30s"}
        </button>

        <button
          type="button"
          onClick={runAiPlan}
          className="cta-primary inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold"
          disabled={!tested}
        >
          {generating ? "AI đang tạo buổi tập..." : "AI tạo buổi tập hôm nay"}
        </button>

        <Link
          href="/bai-hoc/lam-dai-tu-ve-quyen?from=journey"
          className={
            "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition " +
            (generated
              ? "cta-primary"
              : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")
          }
        >
          Bắt đầu bài đầu tiên
        </Link>
      </div>

      {generated ? (
        <div className="fade-in-up mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">AI Navigator</p>
          <p className="mt-1">Bạn đang ở: {PLAN.beltTitle}</p>
          <ul className="mt-2 grid gap-1 leading-6">
            <li>• Quyền Lam đai tự vệ</li>
            <li>• 1 bài phản xạ</li>
            <li>• 1 video hướng dẫn</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/bai-hoc/${PLAN.lessonSlug}?from=ai`} className="cta-primary inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold">
              Bắt đầu ngay
            </Link>
            <Link href={`/video?from=ai&focusVideo=${PLAN.videoId}`} className="cta-secondary inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white">
              Mở video buổi tập
            </Link>
            <Link href={`/ky-thuat?focus=${PLAN.techniqueSlug}&from=ai`} className="cta-secondary inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white">
              Xem kỹ thuật liên quan
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
