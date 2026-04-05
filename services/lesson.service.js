import { LESSONS } from "@/data/lessons";

export function getLessons() {
  return LESSONS;
}

export function getLessonsByBelt(beltId) {
  const safeBeltId = String(beltId || "").trim().toLowerCase();
  if (!safeBeltId) return LESSONS;

  return LESSONS.filter((lesson) => String(lesson.level || "").toLowerCase() === safeBeltId);
}

export function getNextLesson(progress) {
  const list = Array.isArray(progress) ? progress : [];
  const completed = list.filter((p) => Boolean(p?.completed));
  return completed.length < 5 ? "basic" : "advanced";
}
