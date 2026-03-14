"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { readProfile } from "@/lib/profile";

function beltLabel(beltId) {
  if (beltId === "lam-dai") return "Lam đai";
  if (beltId === "hoang-dai") return "Hoàng đai";
  if (beltId === "huyen-dai") return "Huyền đai";
  return "";
}

export default function VideoLibrary({ videos }) {
  const [planId, setPlanId] = useState("free");
  const isPremium = planId === "premium";

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

  const list = Array.isArray(videos) ? videos : [];

  return (
    <div className="grid gap-3 lg:grid-cols-2 stagger-fade">
      {list.map((video) => {
        const id = String(video?.id || "").trim();
        const title = String(video?.title || "Video").trim();
        const summary = String(video?.summary || "").trim();
        const minutes = Math.max(1, Number(video?.minutes) || 0);
        const beltId = String(video?.beltId || "").trim();

        const isLocked = beltId && beltId !== "lam-dai" && !isPremium;
        const beltText = beltLabel(beltId);

        if (isLocked) {
          return (
            <div
              key={id || title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)]"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_55%)]" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {summary}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
                        {minutes} phút
                      </span>
                      {beltText ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                          {beltText}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-blue-100">
                        Premium
                      </span>
                    </div>
                  </div>

                  <div className="h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/10 to-blue-600/5" />
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-400">
                    Mở Premium để xem video và hỏi AI Coach (RAG).
                  </p>
                  <Link
                    href="/ho-so"
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  >
                    Mở khóa
                  </Link>
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={id || title}
            href={`/video/${id}`}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)] transition will-change-transform hover:bg-white/10 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[var(--shadow-card-strong)] hover:border-blue-400/35 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_55%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{summary}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
                      {minutes} phút
                    </span>
                    {beltText ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                        {beltText}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                      RAG Q&A
                    </span>
                  </div>
                </div>

                <div className="h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/15 to-blue-600/10" />
              </div>

              <div className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition group-hover:brightness-110">
                Xem video
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
