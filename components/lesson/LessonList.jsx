export default function LessonList({ lessons }) {
  const items = Array.isArray(lessons) ? lessons : [];

  return (
    <div className="grid gap-2">
      {items.map((lesson) => (
        <article key={lesson.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
          <div className="text-sm font-semibold text-white">{lesson.title}</div>
          <div className="mt-1 text-xs text-slate-300">
            Belt: {lesson.belt || "-"} · Duration: {lesson.duration || 0} min
          </div>
        </article>
      ))}
    </div>
  );
}
