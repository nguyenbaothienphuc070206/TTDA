import { readJson, writeJson } from "./storage";

export const PROFILE_KEY = "vovinam_profile_v1";

const DEFAULT_PROFILE = {
  name: "Học viên",
  beltId: "lam-dai",
  planId: "free",
  joinedAt: 0,
  certificateId: "",
  certificates: [],
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
  const planIdRaw = typeof raw.planId === "string" ? raw.planId : "";
  const planId = planIdRaw === "premium" ? "premium" : "free";
  const certificateId = typeof raw.certificateId === "string" ? raw.certificateId : "";

  const certificates = Array.isArray(raw.certificates) ? raw.certificates : [];
  const normalizedCertificates = certificates
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const id = typeof c.id === "string" ? c.id.trim() : "";
      const beltId = typeof c.beltId === "string" ? c.beltId.trim() : "";
      const issuedAt = typeof c.issuedAt === "number" && Number.isFinite(c.issuedAt) ? c.issuedAt : 0;
      const studentName = typeof c.studentName === "string" ? c.studentName.trim() : "";
      if (!id || !beltId || !issuedAt) return null;
      return {
        id,
        beltId,
        issuedAt,
        studentName: studentName || null,
      };
    })
    .filter(Boolean);

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
    planId,
    joinedAt,
    certificateId,
    certificates: normalizedCertificates,
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
