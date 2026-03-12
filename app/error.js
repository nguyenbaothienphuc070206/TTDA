"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // Log for debugging in dev only.
      // (We intentionally don't show error details to end users.)
      console.error(error);
    }
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 sm:p-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
          Môn sinh đang chào
        </p>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Hệ thống xin phép dừng 1 nhịp
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Trong lúc bạn luyện tập, ứng dụng vừa gặp lỗi. Hãy thử lại, hoặc quay
          về trang chủ để tiếp tục.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Thử lại
          </button>

          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
