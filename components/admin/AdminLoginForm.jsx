"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function Message({ tone, children }) {
  const styles =
    tone === "error"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-50"
      : "border-white/10 bg-white/5 text-slate-200";

  return <div className={`rounded-2xl border p-4 text-sm ${styles}`}>{children}</div>;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reason = searchParams?.get("reason");

  const [role, setRole] = useState("coach");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setBusy(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data && typeof data.error === "string" ? data.error : "Đăng nhập thất bại.";
        setError(msg);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Có lỗi mạng khi đăng nhập.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Admin / Coach
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Khu vực quản trị (demo). Cần đăng nhập để truy cập.
      </p>

      {reason === "missing_secret" ? (
        <div className="mt-4">
          <Message tone="error">
            Thiếu cấu hình <span className="font-semibold">AUTH_SECRET</span>. Hãy thiết lập env rồi
            thử lại.
          </Message>
        </div>
      ) : null}

      {reason === "unauthorized" ? (
        <div className="mt-4">
          <Message tone="info">Bạn cần đăng nhập để truy cập khu vực admin.</Message>
        </div>
      ) : null}

      {reason === "forbidden" ? (
        <div className="mt-4">
          <Message tone="error">Tài khoản hiện tại không đủ quyền truy cập.</Message>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Message tone="error">{error}</Message>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-200">Vai trò</div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            <option value="coach">Coach</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-200">Mật khẩu</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            placeholder="••••••••"
          />
          <div className="mt-2 text-xs text-slate-300">
            Gợi ý: thiết lập <span className="font-semibold">ADMIN_PASSWORD</span> /{" "}
            <span className="font-semibold">COACH_PASSWORD</span> trong env.
          </div>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-4 text-xs leading-5 text-slate-300">
        Lưu ý: Demo này dùng cookie phiên (HMAC). Nếu triển khai thật: cần DB, audit log, và rotate
        secret.
      </p>
    </div>
  );
}
