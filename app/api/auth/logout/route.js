import { NextResponse } from "next/server";

import { isSameOrigin } from "@/lib/apiGuards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  try {
    const supabase = createSupabaseRouteHandlerClient();
    await supabase.auth.signOut();
  } catch {
    // Even if signOut fails, still return ok to avoid trapping users.
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
