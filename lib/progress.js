import { readJson, writeJson } from "./storage";

export const DONE_KEY = "vovinam_done_v1";

export function readDoneSlugs() {
  const list = readJson(DONE_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function writeDoneSlugs(slugs) {
  const safe = Array.isArray(slugs) ? slugs : [];
  writeJson(DONE_KEY, safe);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vovinam-progress"));
  }
}

export function isLessonDone(slug) {
  const done = readDoneSlugs();
  return done.includes(slug);
}

export function toggleLessonDone(slug) {
  const done = readDoneSlugs();

  if (done.includes(slug)) {
    const next = done.filter((s) => s !== slug);
    writeDoneSlugs(next);
    return next;
  }

  const next = [...done, slug];
  writeDoneSlugs(next);
  return next;
}
