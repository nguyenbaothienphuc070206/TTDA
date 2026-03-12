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

function formatTime(ms) {
  if (!ms || typeof ms !== "number") return "—";
  return new Date(ms).toLocaleString("vi-VN");
}

export default function RbacPanel() {
  const [session, setSession] = useState(null);
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
          setSession(null);
          return;
        }

        setSession(data?.session || null);
      } catch {
        setError("Có lỗi mạng khi đọc session.");
        setSession(null);
      }
    };

    run();
  }, []);

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">RBAC</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Trạng thái phiên đăng nhập hiện tại (cookie HMAC). Middleware chặn truy cập admin nếu chưa đăng nhập.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-50">
            {error}
          </div>
        ) : null}

        {session ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Box title="Role">
              <span className="font-semibold text-white">{session.role}</span>
            </Box>
            <Box title="Subject">
              <span className="font-semibold text-white">{session.sub}</span>
            </Box>
            <Box title="Issued At">{formatTime(session.iat)}</Box>
            <Box title="Expires At">{formatTime(session.exp)}</Box>
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
