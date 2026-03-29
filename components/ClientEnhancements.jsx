"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PwaRegister = dynamic(() => import("@/components/PwaRegister"), { ssr: false });
const ViewportReveal = dynamic(() => import("@/components/ViewportReveal"), { ssr: false });
const SifuReminderAgent = dynamic(() => import("@/components/SifuReminderAgent"), { ssr: false });
const AiCoachBubble = dynamic(() => import("@/components/AiCoachBubble"), { ssr: false });

function isLitePerformanceDevice() {
  if (typeof window === "undefined") return false;

  if (document.documentElement?.dataset?.performance === "lite") {
    return true;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection?.saveData);
  const effectiveType = String(connection?.effectiveType || "").toLowerCase();
  const lowBandwidth = effectiveType.includes("2g") || effectiveType.includes("3g");
  const lowCpu = Number(navigator.hardwareConcurrency || 0) > 0 && Number(navigator.hardwareConcurrency || 0) <= 4;
  const lowMem = Number(navigator.deviceMemory || 0) > 0 && Number(navigator.deviceMemory || 0) <= 4;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  return saveData || lowBandwidth || lowCpu || lowMem || Boolean(reducedMotion);
}

export default function ClientEnhancements() {
  const [enhancedReady, setEnhancedReady] = useState(false);
  const liteMode = isLitePerformanceDevice();

  useEffect(() => {
    const lite = isLitePerformanceDevice();

    if (lite) {
      return undefined;
    }

    const activate = () => setEnhancedReady(true);

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(activate, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(activate, 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <PwaRegister />
      {enhancedReady && !liteMode ? <ViewportReveal /> : null}
      {enhancedReady && !liteMode ? <SifuReminderAgent /> : null}
      {enhancedReady && !liteMode ? <AiCoachBubble /> : null}
    </>
  );
}
