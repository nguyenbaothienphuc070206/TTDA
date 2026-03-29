export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-7 sm:p-12">
        <div className="skeleton-shimmer h-7 w-56 rounded-2xl" />
        <div className="skeleton-shimmer mt-4 h-4 w-full max-w-xl rounded-2xl" />
        <div className="skeleton-shimmer mt-2 h-4 w-full max-w-lg rounded-2xl" />

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
            <div className="skeleton-shimmer h-4 w-2/3 rounded-xl" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-5/6 rounded-xl" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
            <div className="skeleton-shimmer h-4 w-1/2 rounded-xl" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-2/3 rounded-xl" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
            <div className="skeleton-shimmer h-4 w-3/5 rounded-xl" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-4/6 rounded-xl" />
          </div>
        </div>

        <p className="mt-6 text-sm font-medium text-slate-300">Đang tải dữ liệu và dựng giao diện...</p>
      </div>
    </div>
  );
}
