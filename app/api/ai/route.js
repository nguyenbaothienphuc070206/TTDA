import { NextResponse } from "next/server";

function asText(value) {
  return String(value || "").trim();
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = asText(body?.question).slice(0, 2000);

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const apiKey = asText(process.env.OPENAI_API_KEY);
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY on server" },
        { status: 500 }
      );
    }

    const model = asText(process.env.OPENAI_MODEL) || "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: question }],
        temperature: 0.3,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenAI request failed" },
        { status: response.status }
      );
    }

    const answer = String(data?.choices?.[0]?.message?.content || "").trim();
    return NextResponse.json({ answer, raw: data });
  } catch {
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
