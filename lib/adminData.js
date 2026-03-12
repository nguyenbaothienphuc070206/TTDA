import { readJson, writeJson } from "./storage";

export const MEMBERS_KEY = "vovinam_members_v1";
export const ATTENDANCE_KEY = "vovinam_attendance_v1";
export const EXAMS_KEY = "vovinam_exams_v1";

function dispatch(name) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(name));
}

function normalizeArray(raw) {
  return Array.isArray(raw) ? raw : [];
}

export function readMembers() {
  return normalizeArray(readJson(MEMBERS_KEY, []));
}

export function writeMembers(members) {
  const safe = normalizeArray(members);
  writeJson(MEMBERS_KEY, safe);
  dispatch("vovinam-admin-members");
  return safe;
}

export function readAttendance() {
  return normalizeArray(readJson(ATTENDANCE_KEY, []));
}

export function writeAttendance(records) {
  const safe = normalizeArray(records);
  writeJson(ATTENDANCE_KEY, safe);
  dispatch("vovinam-admin-attendance");
  return safe;
}

export function readExams() {
  return normalizeArray(readJson(EXAMS_KEY, []));
}

export function writeExams(exams) {
  const safe = normalizeArray(exams);
  writeJson(EXAMS_KEY, safe);
  dispatch("vovinam-admin-exams");
  return safe;
}
