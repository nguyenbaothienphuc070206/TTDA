import { getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";

function asText(value) {
  return String(value || "").trim();
}

export async function POST(request) {
  const requestId = getRequestId(request);

  try {
    const body = await request.json().catch(() => ({}));
    const videoPath = asText(body?.video_path || body?.videoPath);
    const idealPose = Array.isArray(body?.ideal_pose || body?.idealPose)
      ? body.ideal_pose || body.idealPose
      : [];

    if (!videoPath) {
      return jsonError({ message: "Missing video_path.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
    }

    const analyzerUrl = asText(process.env.VIDEO_ANALYZER_URL) || "http://127.0.0.1:8010";
    const res = await fetch(`${analyzerUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_path: videoPath,
        ideal_pose: idealPose,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return jsonError({ message: json?.detail || "Video analysis failed.", code: "ANALYSIS_FAILED" }, { status: 500, requestId });
    }

    return jsonOk({ analysis: json }, { requestId });
  } catch (e) {
    return jsonError(
      {
        message: e?.message || "Unable to analyze video.",
        code: "ANALYSIS_FAILED",
      },
      { status: 500, requestId }
    );
  }
}
