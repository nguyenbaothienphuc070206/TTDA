export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="surface-card-strong enterprise-shell rounded-[2.25rem] p-6 sm:p-12">
        <div className="accent-line" />
        <div className="skeleton-shimmer mt-5 h-8 w-60 rounded-2xl" />
        <div className="skeleton-shimmer mt-5 h-4 w-full max-w-2xl rounded-2xl" />
        <div className="skeleton-shimmer mt-2 h-4 w-full max-w-xl rounded-2xl" />

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="surface-card rounded-3xl p-3">
            <div className="skeleton-shimmer h-4 w-2/3 rounded-xl" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-5/6 rounded-xl" />
          </div>
          <div className="surface-card rounded-3xl p-3">
            <div className="skeleton-shimmer h-4 w-1/2 rounded-xl" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-2/3 rounded-xl" />
          </div>
          <div className="surface-card rounded-3xl p-3">
            <div className="skeleton-shimmer h-4 w-3/5 rounded-xl" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-4/6 rounded-xl" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <div className="surface-card rounded-3xl p-4">
            <div className="skeleton-shimmer h-4 w-40 rounded-xl" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-11/12 rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-10/12 rounded-xl" />
          </div>
          <div className="surface-card rounded-3xl p-4">
            <div className="skeleton-shimmer h-4 w-44 rounded-xl" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-11/12 rounded-xl" />
            <div className="skeleton-shimmer mt-2 h-3 w-9/12 rounded-xl" />
          </div>
        </div>

        <p className="mt-6 text-sm font-medium text-slate-300">Đang tải dữ liệu và dựng giao diện premium...</p>
        <span className="sr-only">Đang tải nội dung trang, vui lòng chờ.</span>
      </div>
    </div>
  );
}
