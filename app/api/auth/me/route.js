import { NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";
import { getAppRoleForUserId } from "@/lib/supabase/roles";

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const role = await getAppRoleForUserId(supabase, user.id);

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email || null,
      },
      role,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return NextResponse.json({ error: "Không đọc được session." }, { status: 500 });
  }
}
