"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const disabled =
      process.env.NODE_ENV !== "production" ||
      String(process.env.NEXT_PUBLIC_DISABLE_SW || "").trim() === "1";

    if (disabled) {
      // Prevent stale SW from hijacking navigation during development or diagnostics.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {
          // ignore
        });

      if (typeof window.caches !== "undefined") {
        window.caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys
                .filter((k) => k.startsWith("vovinam-static-") || k.startsWith("vovinam-pages-"))
                .map((k) => window.caches.delete(k))
            )
          )
          .catch(() => {
            // ignore
          });
      }

      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silent: PWA is optional.
      });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}