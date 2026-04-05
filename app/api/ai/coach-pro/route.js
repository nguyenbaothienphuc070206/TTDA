import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import { asSafeText, getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function asText(value) {
  return String(value || "").trim();
}

async function askOpenAi(prompt) {
  const apiKey = asText(process.env.OPENAI_API_KEY);
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const model = asText(process.env.OPENAI_MODEL) || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content:
            "Ban la HLV Vovinam ca nhan. Tra loi ngan, thuc chien, khong ly thuyet dai. Luon co nhac an toan.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || "OpenAI request failed");
  }

  return asText(json?.choices?.[0]?.message?.content);
}

function summarizeProgress(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const done = list.filter((x) => x?.completed).length;
  const total = list.length;
  const failReaction = list.some((x) => String(x?.lesson_id || "").includes("phan-don") && !x?.completed);
  return {
    done,
    total,
    weakReaction: failReaction,
  };
}

export async function POST(request) {
  const requestId = getRequestId(request);

  if (!isSameOrigin(request)) {
    return jsonError({ message: "Invalid origin.", code: "INVALID_ORIGIN" }, { status: 403, requestId });
  }

  if (isBodyTooLarge(request, 20_000)) {
    return jsonError({ message: "Request body too large.", code: "BODY_TOO_LARGE" }, { status: 413, requestId });
  }

  const rl = checkRateLimit({ request, key: "ai_coach_pro_post", limit: 30, windowMs: 60 * 1000 });
  if (!rl.ok) {
    const res = jsonError({ message: "Too many requests.", code: "RATE_LIMITED" }, { status: 429, requestId });
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
    }

    const body = await request.json().catch(() => ({}));
    const question = asSafeText(body?.question, 1200);
    if (!question) {
      return jsonError({ message: "Missing question.", code: "VALIDATION_ERROR" }, { status: 400, requestId });
    }

    const [{ data: profile }, { data: progressRows }, { data: memoryRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("belt_level,consistency_score,streak_days")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("progress")
        .select("lesson_id,completed")
        .eq("user_id", user.id)
        .limit(400),
      supabase
        .from("ai_memory")
        .select("key,value,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const progress = summarizeProgress(progressRows || []);
    const memoryText = (memoryRows || [])
      .map((m) => `${m.key}: ${m.value}`)
      .slice(0, 10)
      .join("; ");

    const prompt = [
      `Cap dai: ${profile?.belt_level || "lam_dai"}`,
      `Tien do: ${progress.done}/${progress.total}`,
      `Consistency score: ${Number(profile?.consistency_score || 0)}`,
      `Streak: ${Number(profile?.streak_days || 0)} ngay`,
      `Memory: ${memoryText || "chua co"}`,
      `Cau hoi: ${question}`,
      "Yeu cau: 1) Phan tich loi cu the 2) Bai sua loi 3) Dieu chinh theo level 4) Nhac an toan",
    ].join("\n");

    const result = await askOpenAi(prompt);

    const weakReaction = progress.weakReaction || /phan\s*don|reaction/i.test(result);
    const memoryKey = weakReaction ? "weak_reaction" : "latest_insight";

    await Promise.all([
      supabase.from("ai_memory").insert({
        user_id: user.id,
        key: memoryKey,
        value: result.slice(0, 1000),
      }),
      supabase.from("analytics").insert({
        user_id: user.id,
        event: "ai_used",
        metadata: {
          route: "ai/coach-pro",
          weakReaction,
          questionLength: question.length,
        },
      }),
      supabase.from("profiles").upsert(
        {
          user_id: user.id,
          last_active: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      ),
    ]);

    return jsonOk(
      {
        result,
        insight: {
          weak_reaction: weakReaction,
          recommendation: weakReaction ? "phan-don Lam dai" : "standard flow",
        },
      },
      { requestId }
    );
  } catch (e) {
    return jsonError(
      {
        message: e?.message || "Unable to run AI coach.",
        code: "AI_FAILED",
      },
      { status: 500, requestId }
    );
  }
}
