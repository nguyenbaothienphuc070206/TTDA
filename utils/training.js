export function getNextLesson(progress) {
  const safe = Array.isArray(progress) ? progress : [];
  const completed = safe.filter((p) => Boolean(p?.completed));

  if (completed.length < 5) return "basic";
  return "advanced";
}
