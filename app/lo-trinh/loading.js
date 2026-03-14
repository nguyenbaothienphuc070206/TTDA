function LessonCardSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[var(--shadow-card)]">
      <div className="h-5 w-56 rounded-2xl bg-white/10 animate-pulse" />
      <div className="mt-3 h-4 w-full max-w-[28rem] rounded-2xl bg-white/10 animate-pulse" />
      <div className="mt-2 h-4 w-full max-w-[22rem] rounded-2xl bg-white/10 animate-pulse" />

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-6 w-20 rounded-full border border-white/10 bg-white/5" />
        <div className="h-6 w-28 rounded-full border border-white/10 bg-white/5" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center">
        <div className="col-span-1 h-10 w-full rounded-2xl bg-white/10 animate-pulse sm:w-24" />
        <div className="col-span-1 h-10 w-full rounded-2xl bg-white/10 animate-pulse sm:w-28" />
        <div className="col-span-2 h-10 w-full rounded-2xl bg-white/10 animate-pulse sm:w-40" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="h-8 w-64 rounded-2xl bg-white/10 animate-pulse" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded-2xl bg-white/10 animate-pulse" />
        <div className="mt-2 h-4 w-full max-w-xl rounded-2xl bg-white/10 animate-pulse" />

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-24 rounded-2xl bg-white/10 animate-pulse" />
            <div className="h-7 w-20 rounded-2xl border border-white/10 bg-white/5" />
          </div>
          <div className="mt-3 h-2.5 w-full rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-lg rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </header>

      <div className="mt-8 space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="h-6 w-48 rounded-2xl bg-white/10 animate-pulse" />
            <div className="mt-2 h-4 w-72 rounded-2xl bg-white/10 animate-pulse" />
          </div>
          <div className="h-7 w-16 rounded-full border border-white/10 bg-white/5" />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <LessonCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
