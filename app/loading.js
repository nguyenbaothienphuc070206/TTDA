export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-7 sm:p-12">
        <div className="h-7 w-56 rounded-2xl bg-white/10 animate-pulse" />
        <div className="mt-4 h-4 w-full max-w-xl rounded-2xl bg-white/10 animate-pulse" />
        <div className="mt-2 h-4 w-full max-w-lg rounded-2xl bg-white/10 animate-pulse" />

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="h-24 rounded-3xl border border-white/10 bg-white/5" />
          <div className="h-24 rounded-3xl border border-white/10 bg-white/5" />
          <div className="h-24 rounded-3xl border border-white/10 bg-white/5" />
        </div>

        <p className="mt-6 text-sm text-slate-300">Đang tải…</p>
      </div>
    </div>
  );
}
