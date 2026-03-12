import Link from "next/link";

export const metadata = {
  title: "Không tìm thấy",
};

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 sm:p-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
          404
        </p>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Không tìm thấy trang bạn cần
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Có thể đường dẫn bị sai hoặc bài học chưa tồn tại.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Về trang chủ
          </Link>
          <Link
            href="/lo-trinh"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Xem lộ trình
          </Link>
        </div>
      </div>
    </div>
  );
}
