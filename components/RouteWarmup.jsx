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
    let cancelled = false;

    const warmup = () => {
      if (cancelled) return;
      CORE_ROUTES.forEach((route) => {
        router.prefetch(route);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warmup, { timeout: 1200 });
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
