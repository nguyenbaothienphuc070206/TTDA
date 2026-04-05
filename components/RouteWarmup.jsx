"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CORE_ROUTES = [
  "/lo-trinh",
  "/hoc-tap",
  "/video",
  "/ky-thuat",
  "/lich-tap",
  "/cong-dong",
  "/tien-do",
];

export default function RouteWarmup() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (window.sessionStorage.getItem("vovinam_prefetch_warmed_v1") === "1") {
      return undefined;
    }

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const effectiveType = String(connection?.effectiveType || "").toLowerCase();
    const saveData = Boolean(connection?.saveData);
    const perfLite = document.documentElement?.dataset?.performance === "lite";
    const lowBandwidth = effectiveType.includes("2g") || effectiveType.includes("3g");

    if (saveData || lowBandwidth || perfLite) {
      return undefined;
    }

    const lowCpu = Number(navigator.hardwareConcurrency || 0) > 0 && Number(navigator.hardwareConcurrency || 0) <= 4;
    const lowMem = Number(navigator.deviceMemory || 0) > 0 && Number(navigator.deviceMemory || 0) <= 4;
    const routes = lowCpu || lowMem ? CORE_ROUTES.slice(0, 3) : CORE_ROUTES;
    const intervalMs = lowCpu || lowMem ? 650 : 320;

    let cancelled = false;

    const warmup = () => {
      if (cancelled) return;

      let index = 0;
      const runNext = () => {
        if (cancelled || index >= routes.length) {
          if (!cancelled) {
            window.sessionStorage.setItem("vovinam_prefetch_warmed_v1", "1");
          }
          return;
        }

        router.prefetch(routes[index]);
        index += 1;
        window.setTimeout(runNext, intervalMs);
      };

      runNext();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warmup, { timeout: 2800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timer = window.setTimeout(warmup, 800);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  return null;
}
