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
    .from("progress")
    .select("id,user_id,lesson_id,completed,completed_at,time_spent,updated_at,score")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) {
    return jsonError({ message: "Unable to load progress.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ progress: data || [] }, { requestId });
}
