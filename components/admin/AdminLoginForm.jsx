"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

function Message({ tone, children }) {
  const styles =
    tone === "error"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-50"
      : "border-white/10 bg-white/5 text-slate-200";

  return <div className={`rounded-2xl border p-4 text-sm ${styles}`}>{children}</div>;
}

export default function AdminLoginForm() {
  const searchParams = useSearchParams();

  const reason = searchParams?.get("reason");

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const onGoogle = async () => {
    setError("");
    setInfo("");
    setBusy(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        "/admin"
      )}`;

      const { error: e } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (e) {
        setError("Không thể đăng nhập bằng Google. Hãy kiểm tra cấu hình Supabase.");
      }
    } catch {
      setError("Thiếu cấu hình Supabase env hoặc lỗi mạng.");
    } finally {
      setBusy(false);
    }
  };

  const onOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    setBusy(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next: "/admin" }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data && typeof data.error === "string" ? data.error : "Đăng nhập thất bại.";
        setError(msg);
        return;
      }

      setInfo("Đã gửi link đăng nhập. Vui lòng kiểm tra email của bạn.");
    } catch {
      setError("Có lỗi mạng khi gửi email đăng nhập.");
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
        Khu vực quản trị. Đăng nhập bằng Google hoặc Email OTP.
      </p>

      {reason === "missing_supabase_env" ? (
        <div className="mt-4">
          <Message tone="error">
            Thiếu cấu hình Supabase env. Hãy thiết lập{" "}
            <span className="font-semibold">NEXT_PUBLIC_SUPABASE_URL</span> và{" "}
            <span className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>.
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

      {reason === "admin_only" ? (
        <div className="mt-4">
          <Message tone="error">Module này chỉ dành cho Admin.</Message>
        </div>
      ) : null}

      {reason === "auth_failed" ? (
        <div className="mt-4">
          <Message tone="error">Không thể hoàn tất đăng nhập. Vui lòng thử lại.</Message>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Message tone="error">{error}</Message>
        </div>
      ) : null}

      {info ? (
        <div className="mt-4">
          <Message tone="info">{info}</Message>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          {busy ? "Đang chuyển hướng…" : "Tiếp tục với Google"}
        </button>
      </div>

      <form onSubmit={onOtp} className="mt-4 grid gap-3">
        <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-200">Email (OTP / Magic link)</div>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            placeholder="you@example.com"
          />
          <div className="mt-2 text-xs text-slate-300">
            Hệ thống sẽ gửi link đăng nhập qua email.
          </div>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        >
          {busy ? "Đang gửi…" : "Gửi link đăng nhập"}
        </button>
      </form>

      <p className="mt-4 text-xs leading-5 text-slate-300">
        Lưu ý: Quyền truy cập Admin/Coach được kiểm tra bằng Supabase RLS + bảng <span className="font-semibold">user_roles</span>.
      </p>
    </div>
  );
}
