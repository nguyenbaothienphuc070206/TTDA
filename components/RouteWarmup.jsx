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
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const effectiveType = String(connection?.effectiveType || "").toLowerCase();
    const saveData = Boolean(connection?.saveData);
    const perfLite = document.documentElement?.dataset?.performance === "lite";
    const lowBandwidth = effectiveType.includes("2g") || effectiveType.includes("3g");

    if (saveData || lowBandwidth || perfLite) {
      return undefined;
    }

    const lowCpu = Number(navigator.hardwareConcurrency || 0) > 0 && Number(navigator.hardwareConcurrency || 0) <= 4;
    const routes = lowCpu ? CORE_ROUTES.slice(0, 3) : CORE_ROUTES;

    let cancelled = false;

    const warmup = () => {
      if (cancelled) return;
      routes.forEach((route) => {
        router.prefetch(route);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warmup, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timer = window.setTimeout(warmup, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  return null;
}
