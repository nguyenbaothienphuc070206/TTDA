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
      <body className="min-h-screen bg-(--app-bg) text-(--app-fg)">
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          <div className="surface-card-strong enterprise-shell hero-noise rounded-[2.25rem] p-8 text-center sm:p-12">
            <div className="accent-line" />
            <h1 className="headline-gradient mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Môn sinh lạc đường rồi?
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-200">
              Hệ thống vừa gặp trục trặc tạm thời. Bạn có thể thử lại hoặc quay về trang chủ.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => reset()}
                className="cta-secondary inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                Thử lại
              </button>

              <Link
                href="/"
                className="cta-primary inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
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
