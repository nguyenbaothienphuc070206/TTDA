"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // Log for debugging in dev only.
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 text-center sm:p-12">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Môn sinh lạc đường rồi?
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-200">
              Hệ thống vừa gặp trục trặc tạm thời. Bạn có thể thử lại hoặc quay về trang chủ.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                Thử lại
              </button>

              <Link
                href="/"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
