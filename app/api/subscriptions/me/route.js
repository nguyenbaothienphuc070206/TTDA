import { getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

export async function GET(request) {
  const requestId = getRequestId(request);

  const supabase = createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("id,user_id,plan,status,expires_at,updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return jsonError({ message: "Unable to load subscription.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  return jsonOk(
    {
      subscription: data || {
        user_id: user.id,
        plan: "free",
        status: "active",
        expires_at: null,
      },
    },
    { requestId }
  );
}
