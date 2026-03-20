"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";

import { readProfile } from "@/lib/profile";

function difficultyLabel(d, locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    if (d === "easy") return "Easy";
    if (d === "medium") return "Medium";
    if (d === "hard") return "Hard";
    return "-";
  }

  if (id === "ja") {
    if (d === "easy") return "易しい";
    if (d === "medium") return "普通";
    if (d === "hard") return "難しい";
    return "-";
  }

  if (d === "easy") return "Dễ";
  if (d === "medium") return "Vừa";
  if (d === "hard") return "Khó";
  return "-";
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      backToLibrary: "Back to Technique Library",
      fallbackCategory: "Technique",
      difficulty: "Difficulty",
      premiumTag: "Premium",
      premiumTitle: "Yellow/Red belt techniques (Premium)",
      premiumDesc:
        "Unlock Premium to view full guidance (steps, common mistakes, and safety notes) for this technique.",
      unlockPremium: "Unlock Premium",
      viewFreeTechniques: "View Blue belt techniques",
      premiumNote: "Note: Premium is currently demo-based using local profile storage.",
      steps: "Steps",
      mistakes: "Common mistakes",
      safety: "Safety",
    };
  }

  if (id === "ja") {
    return {
      backToLibrary: "技術ライブラリへ戻る",
      fallbackCategory: "技術",
      difficulty: "難易度",
      premiumTag: "プレミアム",
      premiumTitle: "黄帯・紅帯技術（プレミアム）",
      premiumDesc:
        "この技術の詳細ガイド（手順、よくあるミス、安全ポイント）を表示するにはプレミアムを有効化してください。",
      unlockPremium: "プレミアムを開放",
      viewFreeTechniques: "青帯技術を見る",
      premiumNote: "注: プレミアムは現在、プロフィール（localStorage）によるデモ実装です。",
      steps: "手順",
      mistakes: "よくあるミス",
      safety: "安全",
    };
  }

  return {
    backToLibrary: "Quay lại Thư viện kỹ thuật",
    fallbackCategory: "Kỹ thuật",
    difficulty: "Độ khó",
    premiumTag: "Premium",
    premiumTitle: "Kỹ thuật Hoàng/Hồng đai (Premium)",
    premiumDesc:
      "Mở Premium để xem hướng dẫn chi tiết (các bước, lỗi thường gặp và an toàn) cho kỹ thuật này.",
    unlockPremium: "Mở khóa Premium",
    viewFreeTechniques: "Xem kỹ thuật Lam đai",
    premiumNote: "Lưu ý: Premium hiện là demo theo hồ sơ (localStorage).",
    steps: "Các bước",
    mistakes: "Lỗi thường gặp",
    safety: "An toàn",
  };
}

export default function TechniqueDetailPanel({ technique, category }) {
  const locale = useLocale();
  const copy = getCopy(locale);

  const [planId, setPlanId] = useState("free");

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

  const t = technique && typeof technique === "object" ? technique : {};
  const cat = category && typeof category === "object" ? category : null;

  const isPremium = planId === "premium";

  const isLocked = useMemo(() => {
    const diff = String(t?.difficulty || "");
    return diff === "medium" || diff === "hard";
  }, [t?.difficulty]);

  const showLocked = isLocked && !isPremium;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <Link
          href="/ky-thuat"
          className="text-xs font-semibold text-cyan-200 underline decoration-white/10 underline-offset-4 hover:text-cyan-100"
        >
          ← {copy.backToLibrary}
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {t.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {t.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
            {cat?.title || copy.fallbackCategory}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            {copy.difficulty}: {difficultyLabel(t.difficulty, locale)}
          </span>
          {showLocked ? (
            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-blue-100">
              {copy.premiumTag}
            </span>
          ) : null}
          {(Array.isArray(t.tags) ? t.tags : []).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {showLocked ? (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">
            {copy.premiumTitle}
          </h2>
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
              href="/ky-thuat"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            >
              {copy.viewFreeTechniques}
            </Link>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">
            {copy.premiumNote}
          </p>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold text-slate-300">{copy.steps}</div>
            <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              {(Array.isArray(t.steps) ? t.steps : []).map((s, idx) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-white">
                    {idx + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-4">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs font-semibold text-slate-300">{copy.mistakes}</div>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {(Array.isArray(t.mistakes) ? t.mistakes : []).map((m) => (
                  <li key={m} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs font-semibold text-slate-300">{copy.safety}</div>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
                {(Array.isArray(t.safety) ? t.safety : []).map((m) => (
                  <li key={m} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
