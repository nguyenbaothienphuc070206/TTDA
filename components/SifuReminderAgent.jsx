"use client";

import { useEffect } from "react";

import { TECHNIQUES } from "@/data/wiki";
import { readAnalytics } from "@/lib/analytics";
import { readProfile, writeProfile } from "@/lib/profile";

function daysBetween(nowMs, thenMs) {
  const msPerDay = 24 * 60 * 60 * 1000;
  if (!Number.isFinite(nowMs) || !Number.isFinite(thenMs)) return 0;
  if (thenMs <= 0 || nowMs <= thenMs) return 0;
  return Math.floor((nowMs - thenMs) / msPerDay);
}

function pickTechniqueReminder(analytics, thresholdDays) {
  const map = analytics?.techniqueLastViewedAt && typeof analytics.techniqueLastViewedAt === "object"
    ? analytics.techniqueLastViewedAt
    : {};

  const nowMs = Date.now();
  let best = null;

  for (const [slug, ts] of Object.entries(map)) {
    const last = Number(ts);
    if (!Number.isFinite(last) || last <= 0) continue;

    const d = daysBetween(nowMs, last);
    if (d < thresholdDays) continue;

    if (!best || d > best.days) {
      const technique = TECHNIQUES.find((t) => t.slug === slug);
      best = {
        slug,
        title: technique ? technique.title : slug,
        days: d,
      };
    }
  }

  return best;
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
      const reminder = pickTechniqueReminder(analytics, Math.max(1, Math.round(threshold)));
      if (!reminder) return;

      const sent = await showSifuNotification({
        title: "Lời nhắc sư phụ",
        body: `Đã ${reminder.days} ngày bạn chưa luyện tập ${reminder.title}, dành 5 phút ôn lại nhé?`,
        url: `/ky-thuat#${encodeURIComponent(reminder.slug)}`,
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
