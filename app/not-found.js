import Link from "next/link";

export const metadata = {
  title: "Không tìm thấy",
};

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 text-center sm:p-12">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Môn sinh lạc đường rồi?
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-200">
          Hãy để Sư phụ dẫn bạn quay lại trang chủ nhé!
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
