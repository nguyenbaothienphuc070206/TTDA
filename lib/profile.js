import { readJson, writeJson } from "./storage";

export const PROFILE_KEY = "vovinam_profile_v1";

const DEFAULT_PROFILE = {
  name: "Học viên",
  beltId: "lam-dai",
  certificateId: "",
  beltHistory: [],
  diary: [],
};

function normalizeProfile(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PROFILE };

  const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : DEFAULT_PROFILE.name;
  const beltId = typeof raw.beltId === "string" && raw.beltId ? raw.beltId : DEFAULT_PROFILE.beltId;
  const certificateId = typeof raw.certificateId === "string" ? raw.certificateId : "";

  const beltHistory = Array.isArray(raw.beltHistory) ? raw.beltHistory : [];
  const diary = Array.isArray(raw.diary) ? raw.diary : [];

  return {
    ...DEFAULT_PROFILE,
    name,
    beltId,
    certificateId,
    beltHistory,
    diary,
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
