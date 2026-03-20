"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Sign in",
      desc: "Sign in with Google to sync some features (Community / Admin).",
      signingOut: "Signing out...",
      logout: "Sign out",
      redirecting: "Redirecting...",
      continueGoogle: "Continue with Google",
      googleError: "Unable to sign in with Google. Please check your Supabase configuration.",
      envError: "Missing Supabase env configuration or network error.",
      checkingSession: "Checking sign-in session...",
      email: "Email:",
      role: "Role:",
      defaultRole: "user",
    };
  }

  if (id === "ja") {
    return {
      title: "ログイン",
      desc: "Google でログインして、一部機能 (Community / Admin) を同期します。",
      signingOut: "ログアウト中...",
      logout: "ログアウト",
      redirecting: "リダイレクト中...",
      continueGoogle: "Google で続行",
      googleError: "Google ログインに失敗しました。Supabase 設定を確認してください。",
      envError: "Supabase の環境設定不足またはネットワークエラーです。",
      checkingSession: "ログインセッションを確認中...",
      email: "メール:",
      role: "ロール:",
      defaultRole: "user",
    };
  }

  return {
    title: "Đăng nhập",
    desc: "Đăng nhập Google để đồng bộ một số tính năng (Community / Admin).",
    signingOut: "Đang đăng xuất...",
    logout: "Đăng xuất",
    redirecting: "Đang chuyển hướng...",
    continueGoogle: "Tiếp tục với Google",
    googleError: "Không thể đăng nhập bằng Google. Hãy kiểm tra cấu hình Supabase.",
    envError: "Thiếu cấu hình Supabase env hoặc lỗi mạng.",
    checkingSession: "Đang kiểm tra phiên đăng nhập...",
    email: "Email:",
    role: "Role:",
    defaultRole: "user",
  };
}

function Message({ tone, children }) {
  const styles =
    tone === "error"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-50"
      : "border-white/10 bg-white/5 text-slate-200";

  return <div className={`rounded-2xl border p-4 text-sm ${styles}`}>{children}</div>;
}

export default function UserAuthPanel() {
  const locale = useLocale();
  const copy = getCopy(locale);
  const [status, setStatus] = useState("loading"); // loading | signed_in | signed_out
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setError("");

    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("signed_out");
        setEmail("");
        setRole("");
        return;
      }

      const nextEmail = typeof data?.user?.email === "string" ? data.user.email : "";
      const nextRole = typeof data?.role === "string" ? data.role : "";
      setEmail(nextEmail);
      setRole(nextRole);
      setStatus("signed_in");
    } catch {
      setStatus("signed_out");
      setEmail("");
      setRole("");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onGoogle = async () => {
    setError("");
    setBusy(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        "/ho-so"
      )}`;

      const { error: e } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (e) {
        setError(copy.googleError);
      }
    } catch {
      setError(copy.envError);
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setError("");
    setBusy(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setBusy(false);
      refresh();
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{copy.title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            {copy.desc}
          </p>
        </div>

        {status === "signed_in" ? (
          <button
            type="button"
            onClick={onLogout}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {busy ? copy.signingOut : copy.logout}
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            {busy ? copy.redirecting : copy.continueGoogle}
          </button>
        )}
      </div>

      {error ? (
        <div className="mt-4">
          <Message tone="error">{error}</Message>
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="mt-4">
          <Message tone="info">{copy.checkingSession}</Message>
        </div>
      ) : null}

      {status === "signed_in" ? (
        <div className="mt-4">
          <Message tone="info">
            <div>
              <span className="text-slate-300">{copy.email}</span>{" "}
              <span className="font-semibold text-white">{email || "-"}</span>
            </div>
            <div className="mt-1">
              <span className="text-slate-300">{copy.role}</span>{" "}
              <span className="font-semibold text-white">{role || copy.defaultRole}</span>
            </div>
          </Message>
        </div>
      ) : null}
    </div>
  );
}

