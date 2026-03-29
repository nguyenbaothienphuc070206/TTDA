import { isSameOrigin } from "@/lib/apiGuards";
import { createCompatResponder } from "@/lib/api/compatResponse";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

export async function POST(request) {
  const api = createCompatResponder(request);
  if (!isSameOrigin(request)) {
    return api.fail({ message: "Origin không hợp lệ.", code: "INVALID_ORIGIN", status: 403 });
  }

  try {
    const supabase = createSupabaseRouteHandlerClient();
    await supabase.auth.signOut();
  } catch {
    // Even if signOut fails, still return ok to avoid trapping users.
  }

  return api.ok({ ok: true });
}
