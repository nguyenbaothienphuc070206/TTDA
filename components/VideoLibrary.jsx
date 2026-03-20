"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Lock, PlayCircle } from "lucide-react";
import { useLocale } from "next-intl";

import {
  BELT_FAMILIES,
  getBeltById,
  getBeltFamilyId,
  getBeltsByFamilyId,
  isFreeBeltId,
} from "@/data/belts";
import { readProfile } from "@/lib/profile";

function beltLabel(beltId) {
  return String(getBeltById(beltId)?.title || "").trim();
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      familyDescriptions: {
        lam: "Fundamental foundation, free to help you lock in technique and breathing rhythm.",
        hoang: "Strategic intermediate stage focused on counters and distance control.",
        hong: "Advanced intensive stage requiring conditioning, technique, and tactical thinking.",
      },
      unknownFamilyTitle: "Other videos",
      unknownFamilyDescription: "Videos that are not assigned to a specific belt level yet.",
      unknownBeltTitle: "Other",
      defaultVideoTitle: "Video",
      minuteLabel: (minutes) => `${minutes} min`,
      premiumTag: "Premium",
      premiumHint: "Unlock Premium to access the full Yellow/Red belt library and ask AI Coach (RAG).",
      unlock: "Unlock",
      ragQa: "RAG Q&A",
      watchVideo: "Watch video",
      beltFallback: "Belt level",
      videosCount: (count) => `${count} ${count === 1 ? "video" : "videos"}`,
    };
  }

  if (id === "ja") {
    return {
      familyDescriptions: {
        lam: "基礎土台。無料で開放され、技術と呼吸のリズムを固められます。",
        hoang: "中級戦略段階。反撃と間合い管理に重点を置きます。",
        hong: "上級集中段階。体力・技術・戦術思考が求められます。",
      },
      unknownFamilyTitle: "その他の動画",
      unknownFamilyDescription: "まだ帯レベルに紐づいていない動画です。",
      unknownBeltTitle: "その他",
      defaultVideoTitle: "動画",
      minuteLabel: (minutes) => `${minutes}分`,
      premiumTag: "プレミアム",
      premiumHint: "プレミアムで黄帯/紅帯の全動画と AI Coach（RAG）を利用できます。",
      unlock: "ロック解除",
      ragQa: "RAG Q&A",
      watchVideo: "動画を見る",
      beltFallback: "帯レベル",
      videosCount: (count) => `${count}本`,
    };
  }

  return {
    familyDescriptions: {
      lam: "Nền tảng cơ bản, mở miễn phí để học chắc kỹ thuật và nhịp thở.",
      hoang: "Trung cấp chiến lược, tập trung phản đòn và kiểm soát cự ly.",
      hong: "Cao cấp chuyên sâu, yêu cầu thể lực, kỹ thuật và tư duy chiến thuật cao.",
    },
    unknownFamilyTitle: "Video khác",
    unknownFamilyDescription: "Các video chưa gắn cấp đai cụ thể.",
    unknownBeltTitle: "Khác",
    defaultVideoTitle: "Video",
    minuteLabel: (minutes) => `${minutes} phút`,
    premiumTag: "Premium",
    premiumHint: "Mở Premium để xem đầy đủ hệ Hoàng/Hồng đai và hỏi AI Coach (RAG).",
    unlock: "Mở khóa",
    ragQa: "RAG Q&A",
    watchVideo: "Xem video",
    beltFallback: "Cấp đai",
    videosCount: (count) => `${count} video`,
  };
}

function groupVideosByFamily(videos, copy) {
  const list = Array.isArray(videos) ? videos : [];
  const byBelt = new Map();

  for (const video of list) {
    const beltId = String(video?.beltId || "").trim();
    if (!beltId) continue;

    const current = byBelt.get(beltId) || [];
    current.push(video);
    byBelt.set(beltId, current);
  }

  const groups = BELT_FAMILIES.map((family) => {
    const belts = getBeltsByFamilyId(family.id)
      .map((belt) => ({
        belt,
        videos: byBelt.get(belt.id) || [],
      }))
      .filter((x) => x.videos.length > 0);

    return {
      id: family.id,
      title: family.title,
      description: copy.familyDescriptions[family.id] || "",
      belts,
    };
  }).filter((group) => group.belts.length > 0);

  const unknown = list.filter((video) => !getBeltFamilyId(video?.beltId));
  if (unknown.length > 0) {
    groups.push({
      id: "khac",
      title: copy.unknownFamilyTitle,
      description: copy.unknownFamilyDescription,
      belts: [
        {
          belt: { id: "khac", title: copy.unknownBeltTitle },
          videos: unknown,
        },
      ],
    });
  }

  return groups;
}

export default function VideoLibrary({ videos }) {
  const locale = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);
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

  const familyGroups = useMemo(() => groupVideosByFamily(videos, copy), [videos, copy]);

  const renderVideoCard = (video) => {
    const id = String(video?.id || "").trim();
    const title = String(video?.title || copy.defaultVideoTitle).trim();
    const summary = String(video?.summary || "").trim();
    const minutes = Math.max(1, Number(video?.minutes) || 0);
    const beltId = String(video?.beltId || "").trim();

    const isLocked = Boolean(beltId) && !isFreeBeltId(beltId) && !isPremium;
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
                <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">{summary}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
                    {copy.minuteLabel(minutes)}
                  </span>
                  {beltText ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                      {beltText}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-blue-100">
                    {copy.premiumTag}
                  </span>
                </div>
              </div>

              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/10 to-blue-600/5 text-blue-100">
                <Lock className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-400">
                {copy.premiumHint}
              </p>
              <Link
                href="/ho-so#goi-premium"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {copy.unlock}
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
              <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">{summary}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200">
                  {copy.minuteLabel(minutes)}
                </span>
                {beltText ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                    {beltText}
                  </span>
                ) : null}
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                  {copy.ragQa}
                </span>
              </div>
            </div>

            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-400/15 to-blue-600/10 text-blue-100">
              <PlayCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition group-hover:brightness-110">
            {copy.watchVideo}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="grid gap-6 stagger-fade">
      {familyGroups.map((family) => (
        <section
          key={family.id}
          className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-[var(--shadow-card)]"
        >
          <header>
            <h2 className="text-base sm:text-lg font-semibold text-white">{family.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">{family.description}</p>
          </header>

          <div className="mt-4 grid gap-3">
            {family.belts.map((group, idx) => {
              const beltTitle = String(group?.belt?.title || copy.beltFallback).trim();
              return (
                <details
                  key={`${family.id}-${group?.belt?.id || idx}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                  open={idx === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{beltTitle}</div>
                      <div className="mt-0.5 text-xs text-slate-300">
                        {copy.videosCount(group.videos.length)}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-300" />
                  </summary>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {group.videos.map((video) => renderVideoCard(video))}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
