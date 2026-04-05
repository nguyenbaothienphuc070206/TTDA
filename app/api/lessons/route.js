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
    .from("lessons")
    .select("id,title,belt,belt_level,type,duration,created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return jsonError({ message: "Unable to load lessons.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ lessons: data || [] }, { requestId });
}
