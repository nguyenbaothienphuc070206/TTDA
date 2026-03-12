"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onLogout = async () => {
    setBusy(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={busy}
      className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
    >
      {busy ? "Đang thoát…" : "Đăng xuất"}
    </button>
  );
}
