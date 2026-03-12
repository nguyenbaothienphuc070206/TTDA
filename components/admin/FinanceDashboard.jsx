"use client";

import { useEffect, useMemo, useState } from "react";

import { formatVnd } from "@/data/store";
import { readOrders } from "@/lib/orders";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-300">{sub}</div> : null}
    </div>
  );
}

export default function FinanceDashboard() {
  const [orders, setOrders] = useState(() => readOrders());

  useEffect(() => {
    const sync = () => setOrders(readOrders());

    sync();
    window.addEventListener("vovinam-orders", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-orders", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const normalized = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];

    return list
      .map((o) => {
        if (!o || typeof o !== "object") return null;
        const id = String(o.id || "");
        const createdAt = typeof o.createdAt === "number" ? o.createdAt : 0;
        const status = String(o.status || "unknown");
        const totalVnd = Number(o.totalVnd) || 0;
        if (!id) return null;
        return { id, createdAt, status, totalVnd };
      })
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders]);

  const revenueVnd = useMemo(() => {
    return normalized.reduce((sum, o) => sum + (Number(o.totalVnd) || 0), 0);
  }, [normalized]);

  const avgVnd = useMemo(() => {
    if (!normalized.length) return 0;
    return Math.round(revenueVnd / normalized.length);
  }, [normalized.length, revenueVnd]);

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Tài chính</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Tổng hợp đơn hàng từ Cửa hàng (demo). Nếu bật Stripe thật, nên dùng webhook để ghi nhận.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard label="Số đơn" value={normalized.length} />
          <StatCard label="Doanh thu" value={formatVnd(revenueVnd)} />
          <StatCard label="Giá trị TB" value={formatVnd(avgVnd)} sub="/đơn" />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Đơn hàng gần đây</h3>

        {normalized.length ? (
          <div className="mt-4 grid gap-2">
            {normalized.slice(0, 20).map((o) => (
              <div key={o.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{formatVnd(o.totalVnd)}</div>
                    <div className="mt-1 text-xs text-slate-300">
                      {new Date(o.createdAt).toLocaleString("vi-VN")} • {o.status}
                    </div>
                  </div>
                  <div className="text-xs text-slate-300">{o.id}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
            Chưa có đơn hàng nào (hãy tạo đơn demo ở trang Cửa hàng).
          </div>
        )}
      </section>
    </div>
  );
}
