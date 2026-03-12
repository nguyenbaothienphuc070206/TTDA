import { readJson, writeJson } from "./storage";

export const PROFILE_KEY = "vovinam_profile_v1";

const DEFAULT_PROFILE = {
  name: "Học viên",
  beltId: "lam-dai",
  joinedAt: 0,
  certificateId: "",
  beltHistory: [],
  diary: [],
  offlineVideos: [],
  reminders: {
    enabled: false,
    lastSentAt: 0,
    daysWithoutPractice: 3,
  },
};

function normalizeProfile(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PROFILE };

  const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : DEFAULT_PROFILE.name;
  const beltId = typeof raw.beltId === "string" && raw.beltId ? raw.beltId : DEFAULT_PROFILE.beltId;
  const certificateId = typeof raw.certificateId === "string" ? raw.certificateId : "";

  const joinedAt = typeof raw.joinedAt === "number" && Number.isFinite(raw.joinedAt) ? raw.joinedAt : 0;

  const beltHistory = Array.isArray(raw.beltHistory) ? raw.beltHistory : [];
  const diary = Array.isArray(raw.diary) ? raw.diary : [];

  const offlineVideos = Array.isArray(raw.offlineVideos)
    ? raw.offlineVideos.map((x) => String(x || "").trim()).filter(Boolean)
    : [];

  const rawReminders = raw.reminders && typeof raw.reminders === "object" ? raw.reminders : {};
  const reminders = {
    enabled: Boolean(rawReminders.enabled),
    lastSentAt:
      typeof rawReminders.lastSentAt === "number" && Number.isFinite(rawReminders.lastSentAt)
        ? rawReminders.lastSentAt
        : 0,
    daysWithoutPractice:
      typeof rawReminders.daysWithoutPractice === "number" && Number.isFinite(rawReminders.daysWithoutPractice)
        ? Math.max(1, Math.round(rawReminders.daysWithoutPractice))
        : DEFAULT_PROFILE.reminders.daysWithoutPractice,
  };

  return {
    ...DEFAULT_PROFILE,
    name,
    beltId,
    joinedAt,
    certificateId,
    beltHistory,
    diary,
    offlineVideos,
    reminders,
  };
}

export function readProfile() {
  return normalizeProfile(readJson(PROFILE_KEY, null));
}

export function writeProfile(profile) {
  const safe = normalizeProfile(profile);
  writeJson(PROFILE_KEY, safe);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vovinam-profile"));
  }

  return safe;
}
