import { NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function toSafeNextPath(value, fallback) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.includes("\\")) return fallback;
  return raw;
}

export async function GET(request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const next = toSafeNextPath(url.searchParams.get("next"), "/");

  if (code) {
    try {
      const supabase = createSupabaseRouteHandlerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(new URL(next, url.origin));
      }
    } catch {
      // fallthrough
    }
  }

  const failUrl = new URL("/admin/login", url.origin);
  failUrl.searchParams.set("reason", "auth_failed");
  return NextResponse.redirect(failUrl);
}
