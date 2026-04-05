import { getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";

function asText(value) {
  return String(value || "").trim();
}

async function askOpenAi(prompt) {
  const apiKey = asText(process.env.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const model = asText(process.env.OPENAI_MODEL) || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || "OpenAI request failed");
  }

  return asText(json?.choices?.[0]?.message?.content);
}

export async function POST(request) {
  const requestId = getRequestId(request);

  try {
    const body = await request.json().catch(() => ({}));
    const goal = asText(body?.goal || "lam_dai");
    const days = Math.max(1, Math.min(7, Number(body?.days || body?.days_per_week || 3)));

    const prompt = `Tao lich tap Vovinam dang JSON.\nMuc tieu: ${goal}\nSo buoi moi tuan: ${days}.\nMoi buoi gom: warmup, core, cooldown.\nTra ve ngan gon va de ap dung.`;

    const plan = await askOpenAi(prompt);
    return jsonOk({ plan }, { requestId });
  } catch (e) {
    return jsonError(
      {
        message: e?.message || "Unable to generate AI plan.",
        code: "AI_FAILED",
      },
      { status: 500, requestId }
    );
  }
}
