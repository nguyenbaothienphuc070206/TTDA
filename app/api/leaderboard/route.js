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
    .from("global_leaderboard")
    .select("user_id,display_name,streak_days,technique_score_avg,completed_lessons,rank_points")
    .order("rank_points", { ascending: false })
    .limit(100);

  if (error) {
    return jsonError({ message: "Unable to load leaderboard.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
  }

  return jsonOk({ leaderboard: data || [] }, { requestId });
}
