import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 8_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({
    request,
    key: "video_upload_url_post",
    limit: 20,
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
  const fileName = asSafeText(body?.fileName, 120) || `video-${Date.now()}.mp4`;
  const contentType = asSafeText(body?.contentType, 80) || "video/mp4";
  const lessonSlug = asSafeText(body?.lessonSlug, 80) || null;

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${Date.now()}-${safeName}`;

  const admin = createSupabaseServiceClient();
  const { data, error } = await admin.storage
    .from("training-videos")
    .createSignedUploadUrl(storagePath, {
      upsert: false,
    });

  if (error || !data) {
    return jsonError({ message: "Unable to create upload URL.", code: "STORAGE_ERROR" }, { status: 500, requestId });
  }

  const insert = await admin
    .from("video_submissions")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      lesson_slug: lessonSlug,
      status: "uploaded",
      public_url: null,
    })
    .select("id,storage_path,status,created_at")
    .single();

  if (insert.error || !insert.data) {
    return jsonError({ message: "Unable to create submission.", code: "DB_WRITE_FAILED" }, { status: 500, requestId });
  }

  return jsonOk(
    {
      submission: insert.data,
      upload: {
        path: storagePath,
        token: data.token,
        signedUrl: data.signedUrl,
        contentType,
      },
    },
    { requestId }
  );
}
