"use client";

import { useEffect, useState } from "react";

function Box({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-6">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-3 text-sm leading-6 text-slate-300">{children}</div>
    </div>
  );
}

export default function RbacPanel() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setError("");

      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg = data && typeof data.error === "string" ? data.error : "Không đọc được session.";
          setError(msg);
          setMe(null);
          return;
        }

        setMe(data || null);
      } catch {
        setError("Có lỗi mạng khi đọc session.");
        setMe(null);
      }
    };

    run();
  }, []);

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">RBAC</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Trạng thái đăng nhập hiện tại (Supabase Auth). Middleware chặn truy cập admin nếu chưa đăng nhập hoặc không đủ quyền.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-50">
            {error}
          </div>
        ) : null}

        {me?.user ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Box title="Role">
              <span className="font-semibold text-white">{me.role}</span>
            </Box>
            <Box title="User ID">
              <span className="font-semibold text-white">{me.user.id}</span>
            </Box>
            <Box title="Email">
              <span className="font-semibold text-white">{me.user.email || "—"}</span>
            </Box>
            <Box title="Ghi chú">Role đọc từ bảng user_roles (RLS).</Box>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
            Chưa có session hoặc không đọc được.
          </div>
        )}
      </section>
    </div>
  );
}
