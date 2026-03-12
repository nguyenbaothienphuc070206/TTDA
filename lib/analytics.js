import { readJson, writeJson } from "@/lib/storage";

export const ANALYTICS_KEY = "vovinam_analytics_v1";

function defaultState() {
  return {
    lessonViews: {},
    videoViews: {},
    techniqueViews: {},
    updatedAt: null,
  };
}

export function readAnalytics() {
  const raw = readJson(ANALYTICS_KEY, null);
  if (!raw || typeof raw !== "object") return defaultState();

  return {
    ...defaultState(),
    ...raw,
    lessonViews: raw.lessonViews && typeof raw.lessonViews === "object" ? raw.lessonViews : {},
    videoViews: raw.videoViews && typeof raw.videoViews === "object" ? raw.videoViews : {},
    techniqueViews:
      raw.techniqueViews && typeof raw.techniqueViews === "object" ? raw.techniqueViews : {},
  };
}

export function writeAnalytics(next) {
  const safe = next && typeof next === "object" ? next : defaultState();
  safe.updatedAt = new Date().toISOString();
  writeJson(ANALYTICS_KEY, safe);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vovinam-analytics"));
  }
}

function inc(map, id) {
  const key = String(id || "");
  if (!key) return map;

  const current = Number(map[key]) || 0;
  return { ...map, [key]: current + 1 };
}

export function trackView({ type, id }) {
  const state = readAnalytics();

  if (type === "lesson") {
    writeAnalytics({ ...state, lessonViews: inc(state.lessonViews, id) });
    return;
  }

  if (type === "video") {
    writeAnalytics({ ...state, videoViews: inc(state.videoViews, id) });
    return;
  }

  if (type === "technique") {
    writeAnalytics({ ...state, techniqueViews: inc(state.techniqueViews, id) });
  }
}

export function topByCount(map, limit = 5) {
  const entries = Object.entries(map || {})
    .map(([id, count]) => ({ id, count: Number(count) || 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  return entries.slice(0, Math.max(1, limit));
}
