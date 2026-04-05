import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 12_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({
    request,
    key: "video_analyze_post",
    limit: 15,
    windowMs: 60 * 1000,
  });

  if (!rl.ok) {
    const res = jsonError({ message: "Too many requests.", code: "RATE_LIMITED" }, { status: 429, requestId });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  const supabase = createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
  }

  const body = await request.json().catch(() => ({}));
  const submissionId = asSafeText(body?.submissionId, 120);

  if (!submissionId) {
    return jsonError({ message: "Missing submissionId.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
  }

  const admin = createSupabaseServiceClient();

  const { data: submission, error: submissionErr } = await admin
    .from("video_submissions")
    .select("id,user_id,storage_path,status")
    .eq("id", submissionId)
    .eq("user_id", user.id)
    .single();

  if (submissionErr || !submission) {
    return jsonError({ message: "Submission not found.", code: "NOT_FOUND" }, { status: 404, requestId });
  }

  const { data: job, error: jobErr } = await admin
    .from("pose_analysis_jobs")
    .insert({
      video_id: submission.id,
      user_id: user.id,
      engine: "mediapipe",
      status: "queued",
    })
    .select("id,video_id,status,created_at")
    .single();

  if (jobErr || !job) {
    return jsonError({ message: "Unable to create analysis job.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  await admin
    .from("video_submissions")
    .update({ status: "queued", updated_at: new Date().toISOString() })
    .eq("id", submission.id);

  return jsonOk(
    {
      job,
      queue: {
        status: "queued",
        nextStep: "worker_process_video",
      },
    },
    { requestId }
  );
}
