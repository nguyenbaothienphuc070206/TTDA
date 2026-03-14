"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { readProfile } from "@/lib/profile";

function difficultyLabel(d) {
  if (d === "easy") return "Dễ";
  if (d === "medium") return "Vừa";
  if (d === "hard") return "Khó";
  return "-";
}

export default function TechniqueDetailPanel({ technique, category }) {
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
          ← Quay lại Thư viện kỹ thuật
        </Link>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {t.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {t.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
            {cat?.title || "Kỹ thuật"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
            Độ khó: {difficultyLabel(t.difficulty)}
          </span>
          {showLocked ? (
            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-blue-100">
              Premium
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
            Kỹ thuật Hoàng/Huyền đai (Premium)
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Mở Premium để xem hướng dẫn chi tiết (các bước, lỗi thường gặp và an
            toàn) cho kỹ thuật này.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/ho-so"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              Mở khóa Premium
            </Link>
            <Link
              href="/ky-thuat"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            >
              Xem kỹ thuật Lam đai
            </Link>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">
            Lưu ý: Premium hiện là demo theo hồ sơ (localStorage).
          </p>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold text-slate-300">Các bước</div>
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
              <div className="text-xs font-semibold text-slate-300">Lỗi thường gặp</div>
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
              <div className="text-xs font-semibold text-slate-300">An toàn</div>
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
