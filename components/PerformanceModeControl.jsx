"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";

const STORAGE_KEY = "vovinam_perf_mode_v1";

function detectLiteMode() {
  if (typeof window === "undefined") return false;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection?.saveData);
  const effectiveType = String(connection?.effectiveType || "").toLowerCase();
  const lowBandwidth = effectiveType.includes("2g") || effectiveType.includes("3g");
  const lowCpu = Number(navigator.hardwareConcurrency || 0) > 0 && Number(navigator.hardwareConcurrency || 0) <= 4;
  const lowMem = Number(navigator.deviceMemory || 0) > 0 && Number(navigator.deviceMemory || 0) <= 4;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  return saveData || lowBandwidth || lowCpu || lowMem || Boolean(reducedMotion);
}

function applyMode(mode) {
  if (typeof document === "undefined") return;

  if (mode === "lite" || mode === "full") {
    document.documentElement.dataset.performance = mode;
    return;
  }

  document.documentElement.dataset.performance = detectLiteMode() ? "lite" : "full";
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Performance mode",
      desc: "Choose visuals for your device. Auto mode adapts by network and hardware.",
      auto: "Auto",
      lite: "Battery saver",
      full: "Best visuals",
    };
  }

  if (id === "ja") {
    return {
      title: "パフォーマンスモード",
      desc: "端末に合わせて表示を調整します。自動は回線と端末性能で最適化します。",
      auto: "自動",
      lite: "省電力",
      full: "高品質表示",
    };
  }

  return {
    title: "Chế độ hiệu năng",
    desc: "Tùy chọn hiển thị theo máy của bạn. Auto sẽ tự tối ưu theo mạng và cấu hình.",
    auto: "Tự động",
    lite: "Tiết kiệm pin",
    full: "Hiển thị đẹp nhất",
  };
}

export default function PerformanceModeControl() {
  const locale = useLocale();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "auto";
    const saved = String(window.localStorage.getItem(STORAGE_KEY) || "auto").toLowerCase();
    return saved === "lite" || saved === "full" ? saved : "auto";
  });

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  const setPerfMode = (nextMode) => {
    setMode(nextMode);

    if (typeof window === "undefined") return;

    if (nextMode === "auto") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    }

    applyMode(nextMode);
  };

  const buttonClass = (value) =>
    "inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition " +
    (mode === value
      ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
      : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white");

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <div className="text-sm font-semibold text-white">{copy.title}</div>
      <p className="mt-1 text-xs leading-5 text-slate-300">{copy.desc}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPerfMode("auto")} className={buttonClass("auto")}>
          {copy.auto}
        </button>
        <button type="button" onClick={() => setPerfMode("lite")} className={buttonClass("lite")}>
          {copy.lite}
        </button>
        <button type="button" onClick={() => setPerfMode("full")} className={buttonClass("full")}>
          {copy.full}
        </button>
      </div>
    </section>
  );
}
