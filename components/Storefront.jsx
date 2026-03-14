"use client";

import { PRODUCTS, formatVnd } from "@/data/store";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

export default function Storefront() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">Mua hàng qua đối tác</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Đây là cửa hàng theo mô hình Affiliate: bấm “Mua tại đối tác” để mở trang
        mua hàng bên ngoài.
      </p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm leading-6 text-slate-300">
        Khi bạn mua qua liên kết, ứng dụng có thể nhận hoa hồng (không làm tăng
        giá). Giá hiển thị chỉ để tham khảo; giá thực tế theo trang đối tác.
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PRODUCTS.map((p) => {
          const href = String(p.affiliateUrl || "").trim();
          const partnerName = String(p.partnerName || "Đối tác").trim() || "Đối tác";

          return (
            <div key={p.id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{p.name}</div>
                  <div className="mt-1 text-xs text-slate-300">{p.category}</div>
                </div>

                <div className="text-sm font-semibold text-white">{formatVnd(p.priceVnd)}</div>
              </div>

              {p.badges && p.badges.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.badges.map((b) => (
                    <Pill key={b}>{b}</Pill>
                  ))}
                </div>
              ) : null}

              <p className="mt-3 text-sm leading-6 text-slate-300">{p.summary}</p>

              <div className="mt-4">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                  >
                    Mua tại {partnerName} →
                  </a>
                ) : (
                  <div className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-300">
                    Chưa có link đối tác
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
