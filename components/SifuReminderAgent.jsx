"use client";

import { useEffect } from "react";

import { readAnalytics } from "@/lib/analytics";
import { readProfile, writeProfile } from "@/lib/profile";

function daysBetween(nowMs, thenMs) {
  const msPerDay = 24 * 60 * 60 * 1000;
  if (!Number.isFinite(nowMs) || !Number.isFinite(thenMs)) return 0;
  if (thenMs <= 0 || nowMs <= thenMs) return 0;
  return Math.floor((nowMs - thenMs) / msPerDay);
}

function maxTimestamp(map) {
  if (!map || typeof map !== "object") return 0;

  let best = 0;
  for (const ts of Object.values(map)) {
    const n = Number(ts);
    if (Number.isFinite(n) && n > best) best = n;
  }
  return best;
}

function lastActivityAt(analytics) {
  const a = analytics && typeof analytics === "object" ? analytics : {};

  return Math.max(
    maxTimestamp(a.lessonLastViewedAt),
    maxTimestamp(a.techniqueLastViewedAt),
    maxTimestamp(a.videoLastViewedAt)
  );
}

async function showSifuNotification({ title, body, url }) {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  const reg = ("serviceWorker" in navigator)
    ? await navigator.serviceWorker.ready.catch(() => null)
    : null;

  const payload = {
    body,
    tag: "vovinam-sifu-reminder",
    renotify: true,
    data: { url },
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  };

  try {
    if (reg && typeof reg.showNotification === "function") {
      await reg.showNotification(title, payload);
      return true;
    }

    // Fallback: Notification constructor.
    new Notification(title, payload);
    return true;
  } catch {
    return false;
  }
}

export default function SifuReminderAgent() {
  useEffect(() => {
    let cancelled = false;

    const maybeSend = async () => {
      if (cancelled) return;

      const profile = readProfile();
      const reminders = profile?.reminders && typeof profile.reminders === "object" ? profile.reminders : {};
      if (!reminders.enabled) return;

      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const nowMs = Date.now();
      const lastSentAt = Number(reminders.lastSentAt) || 0;

      // Avoid spamming: at most once per 24h.
      if (lastSentAt && nowMs - lastSentAt < 24 * 60 * 60 * 1000) return;

      const analytics = readAnalytics();
      const threshold = Number(reminders.daysWithoutPractice) || 3;
      const lastAt = lastActivityAt(analytics);
      if (!lastAt) return;

      const inactiveDays = daysBetween(nowMs, lastAt);
      if (inactiveDays < Math.max(1, Math.round(threshold))) return;

      const sent = await showSifuNotification({
        title: "Lời nhắc sư phụ",
        body: "Sư phụ thấy bạn nghỉ hơi lâu rồi đó, vào ôn bài 5 phút nhé!",
        url: "/hoc-tap",
      });

      if (!sent) return;

      writeProfile({
        ...profile,
        reminders: {
          ...reminders,
          lastSentAt: nowMs,
        },
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        maybeSend();
      }
    };

    // Run once after load and then when relevant data changes.
    maybeSend();
    window.addEventListener("vovinam-analytics", maybeSend);
    window.addEventListener("vovinam-profile", maybeSend);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener("vovinam-analytics", maybeSend);
      window.removeEventListener("vovinam-profile", maybeSend);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
