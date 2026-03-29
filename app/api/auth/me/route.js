import { createCompatResponder } from "@/lib/api/compatResponse";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";
import { getAppRoleForUserId } from "@/lib/supabase/roles";

export async function GET(request) {
  const api = createCompatResponder(request);
  try {
    const supabase = createSupabaseRouteHandlerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return api.fail({ message: "Chưa đăng nhập.", code: "UNAUTHORIZED", status: 401 });
    }

    const role = await getAppRoleForUserId(supabase, user.id);

    return api.ok({
      user: {
        id: user.id,
        email: user.email || null,
      },
      role,
    });
  } catch {
    return api.fail({ message: "Không đọc được session.", code: "INTERNAL_ERROR", status: 500 });
  }
}
