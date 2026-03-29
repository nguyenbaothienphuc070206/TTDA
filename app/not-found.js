import Link from "next/link";

export const metadata = {
  title: "Không tìm thấy",
};

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <div className="surface-card-strong enterprise-shell hero-noise rounded-[2.25rem] p-8 text-center sm:p-12">
        <div className="accent-line" />
        <h1 className="headline-gradient mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Môn sinh lạc đường rồi?
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-200">
          Hãy để Sư phụ dẫn bạn quay lại trang chủ nhé!
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="cta-primary inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Về trang chủ
          </Link>
          <Link
            href="/lo-trinh"
            className="cta-secondary inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Mở lộ trình
          </Link>
        </div>
      </div>
    </div>
  );
}
