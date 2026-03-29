"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { callGateway } from "@/lib/api/gatewayClient";
import { loginWithPasskey, logoutPasskey, registerPasskey } from "@/lib/auth/passkeyClient";

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
      passkeyTitle: "Biometric passkey",
      passkeyDesc: "Use Face ID / Touch ID / Windows Hello for quick sign-in on this device.",
      passkeyCreate: "Create passkey",
      passkeyLogin: "Sign in with passkey",
      passkeyLogout: "Sign out passkey",
      passkeyBusy: "Processing passkey...",
      passkeyOk: "Passkey is ready.",
      passkeyLoginOk: "Signed in via passkey.",
      passkeyError: "Passkey failed. Please try again.",
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
      passkeyTitle: "生体認証パスキー",
      passkeyDesc: "Face ID / Touch ID / Windows Hello でこの端末に素早くログインできます。",
      passkeyCreate: "パスキーを作成",
      passkeyLogin: "パスキーでログイン",
      passkeyLogout: "パスキーをログアウト",
      passkeyBusy: "パスキー処理中...",
      passkeyOk: "パスキーの準備ができました。",
      passkeyLoginOk: "パスキーでログインしました。",
      passkeyError: "パスキーに失敗しました。再試行してください。",
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
    passkeyTitle: "Passkey sinh trắc học",
    passkeyDesc: "Dùng Face ID / Touch ID / Windows Hello để đăng nhập nhanh trên thiết bị này.",
    passkeyCreate: "Tạo passkey",
    passkeyLogin: "Đăng nhập passkey",
    passkeyLogout: "Đăng xuất passkey",
    passkeyBusy: "Đang xử lý passkey...",
    passkeyOk: "Đã sẵn sàng passkey.",
    passkeyLoginOk: "Đã đăng nhập bằng passkey.",
    passkeyError: "Passkey lỗi, vui lòng thử lại.",
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
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyMessage, setPasskeyMessage] = useState("");
  const [passkeySigned, setPasskeySigned] = useState(false);

  const refresh = async () => {
    setError("");

    try {
      const res = await callGateway({
        target: "authMe",
        method: "GET",
      });
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
      await callGateway({
        target: "authLogout",
        method: "POST",
      });
    } catch {
      // ignore
    } finally {
      setBusy(false);
      refresh();
    }
  };

  const onPasskeyRegister = async () => {
    setError("");
    setPasskeyBusy(true);
    setPasskeyMessage("");

    try {
      await registerPasskey();
      setPasskeyMessage(copy.passkeyOk);
    } catch {
      setPasskeyMessage(copy.passkeyError);
    } finally {
      setPasskeyBusy(false);
    }
  };

  const onPasskeyLogin = async () => {
    setError("");
    setPasskeyBusy(true);
    setPasskeyMessage("");

    try {
      await loginWithPasskey();
      setPasskeySigned(true);
      setPasskeyMessage(copy.passkeyLoginOk);
    } catch {
      setPasskeyMessage(copy.passkeyError);
    } finally {
      setPasskeyBusy(false);
    }
  };

  const onPasskeyLogout = async () => {
    setPasskeyBusy(true);
    setPasskeyMessage("");
    try {
      await logoutPasskey();
      setPasskeySigned(false);
    } catch {
      // ignore
    } finally {
      setPasskeyBusy(false);
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

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
        <div className="text-sm font-semibold text-white">{copy.passkeyTitle}</div>
        <div className="mt-1 text-xs leading-5 text-slate-300">{copy.passkeyDesc}</div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPasskeyRegister}
            disabled={passkeyBusy}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            {passkeyBusy ? copy.passkeyBusy : copy.passkeyCreate}
          </button>

          <button
            type="button"
            onClick={onPasskeyLogin}
            disabled={passkeyBusy}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-xs font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
          >
            {passkeyBusy ? copy.passkeyBusy : copy.passkeyLogin}
          </button>

          {passkeySigned ? (
            <button
              type="button"
              onClick={onPasskeyLogout}
              disabled={passkeyBusy}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              {copy.passkeyLogout}
            </button>
          ) : null}
        </div>

        {passkeyMessage ? (
          <div className="mt-3 text-xs text-slate-300">{passkeyMessage}</div>
        ) : null}
      </div>
    </div>
  );
}

