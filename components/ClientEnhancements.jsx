"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PwaRegister = dynamic(() => import("@/components/PwaRegister"), { ssr: false });
const SifuReminderAgent = dynamic(() => import("@/components/SifuReminderAgent"), { ssr: false });
const AiCoachBubble = dynamic(() => import("@/components/AiCoachBubble"), { ssr: false });
const RouteWarmup = dynamic(() => import("@/components/RouteWarmup"), { ssr: false });

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
  const [baseReady, setBaseReady] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.visibilityState === "visible";
  });
  const [enhancedReady, setEnhancedReady] = useState(false);
  const liteMode = isLitePerformanceDevice();

  useEffect(() => {
    const lite = isLitePerformanceDevice();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setBaseReady(true);
      }
    };

    if (document.visibilityState !== "visible") {
      document.addEventListener("visibilitychange", onVisible);
    }

    if (lite) {
      return () => {
        document.removeEventListener("visibilitychange", onVisible);
      };
    }

    const activate = () => {
      if (document.visibilityState !== "visible") return;
      setEnhancedReady(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(activate, { timeout: 1500 });
      return () => {
        document.removeEventListener("visibilitychange", onVisible);
        window.cancelIdleCallback(id);
      };
    }

    const timer = window.setTimeout(activate, 650);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {baseReady ? <PwaRegister /> : null}
      {baseReady && !liteMode ? <RouteWarmup /> : null}
      {enhancedReady && !liteMode ? <SifuReminderAgent /> : null}
      {enhancedReady && !liteMode ? <AiCoachBubble /> : null}
    </>
  );
}
