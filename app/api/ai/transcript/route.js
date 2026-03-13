import { NextResponse } from "next/server";

import { getVideoById } from "@/data/videos";
import { checkRateLimit, isBodyTooLarge } from "@/lib/apiGuards";
import { chatCompletion, hasOpenAi } from "@/lib/ai/openai";

function asText(value) {
  return String(value || "").trim();
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function extractJsonArray(text) {
  const raw = String(text || "");
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;

  const slice = raw.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function normalizeSegments(list, durationSec) {
  const maxSec = Math.max(0, Math.floor(Number(durationSec) || 0) - 1);

  const cleaned = (Array.isArray(list) ? list : [])
    .map((item) => {
      const startRaw =
        item?.startSec ?? item?.start ?? item?.t ?? item?.time ?? item?.sec ?? 0;
      const startSecNum = Math.floor(Number(startRaw));
      const startSec = Number.isFinite(startSecNum)
        ? clamp(startSecNum, 0, maxSec)
        : 0;

      const text = String(item?.text ?? item?.line ?? item?.content ?? "").trim();
      return { startSec, text: text.slice(0, 240) };
    })
    .filter((s) => s.text);

  cleaned.sort((a, b) => a.startSec - b.startSec);

  const dedup = [];
  const seen = new Set();
  for (const seg of cleaned) {
    const key = `${seg.startSec}:${seg.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(seg);
  }

  return dedup.slice(0, 24);
}

function buildHeuristicSegments(video) {
  const minutes = Math.max(1, Math.round(Number(video?.minutes) || 0));
  const durationSec = minutes * 60;

  const lines = Array.isArray(video?.transcript)
    ? video.transcript.map((t) => String(t || "").trim()).filter(Boolean)
    : [];

  if (lines.length === 0) {
    const summary = asText(video?.summary);
    const fallback = summary || "Mở video và tập chậm theo hướng dẫn, ưu tiên an toàn.";
    return {
      durationSec,
      segments: [{ startSec: 0, text: fallback.slice(0, 240) }],
    };
  }

  const step = Math.max(5, Math.floor(durationSec / Math.max(1, lines.length + 1)));

  const segments = lines.map((text, idx) => ({
    startSec: clamp(idx * step, 0, Math.max(0, durationSec - 1)),
    text: text.slice(0, 240),
  }));

  return { durationSec, segments: segments.slice(0, 24) };
}

async function buildOpenAiSegments(video) {
  const minutes = Math.max(1, Math.round(Number(video?.minutes) || 0));
  const durationSec = minutes * 60;

  const title = asText(video?.title);
  const summary = asText(video?.summary);
  const tags = Array.isArray(video?.tags) ? video.tags.slice(0, 8) : [];
  const seedLines = Array.isArray(video?.transcript) ? video.transcript.slice(0, 12) : [];

  const system = [
    "Bạn là trợ lý tạo transcript có timestamp cho video tập Vovinam.",
    "Không bịa ra thông tin nhạy cảm; ưu tiên hướng dẫn an toàn.",
    "Trả về CHỈ một JSON array, mỗi phần tử có dạng: {\"startSec\": number, \"text\": string}.",
    "Yêu cầu:",
    `- startSec là giây (0..${Math.max(0, durationSec - 1)}) và tăng dần`,
    "- 8 đến 16 đoạn, mỗi đoạn 1 câu ngắn (tối đa 18 từ)",
    "- Nội dung bám theo tiêu đề/tóm tắt; nếu có seed lines thì dùng làm gợi ý",
  ].join("\n");

  const user = [
    `Tiêu đề: ${title || "(không có)"}`,
    summary ? `Tóm tắt: ${summary}` : "",
    tags.length ? `Tags: ${tags.join(", ")}` : "",
    seedLines.length ? `Gợi ý transcript (không có timestamp):\n- ${seedLines.join("\n- ")}` : "",
    `Thời lượng ước tính: ${durationSec} giây.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const raw = await chatCompletion({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.3,
  });

  const parsed = extractJsonArray(raw);
  const segments = normalizeSegments(parsed, durationSec);

  if (segments.length === 0) {
    const fallback = buildHeuristicSegments(video);
    return { durationSec: fallback.durationSec, segments: fallback.segments, mode: "heuristic" };
  }

  return { durationSec, segments, mode: "openai" };
}

export async function POST(request) {
  if (isBodyTooLarge(request, 10_000)) {
    return NextResponse.json({ error: "Body quá lớn." }, { status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "ai_transcript",
    limit: 25,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.ok) {
    const res = NextResponse.json(
      { error: "Bạn thao tác quá nhanh. Vui lòng thử lại sau." },
      { status: 429 }
    );
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const videoId = asText(body?.videoId).slice(0, 64);
  if (!videoId) {
    return NextResponse.json({ error: "Thiếu videoId." }, { status: 400 });
  }

  const video = getVideoById(videoId);
  if (!video) {
    return NextResponse.json({ error: "Không tìm thấy video." }, { status: 404 });
  }

  try {
    if (hasOpenAi()) {
      const out = await buildOpenAiSegments(video);
      const res = NextResponse.json({
        segments: out.segments,
        mode: out.mode,
        durationSec: out.durationSec,
      });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    const heuristic = buildHeuristicSegments(video);
    const res = NextResponse.json({
      segments: heuristic.segments,
      mode: "heuristic",
      durationSec: heuristic.durationSec,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    const heuristic = buildHeuristicSegments(video);
    const res = NextResponse.json({
      segments: heuristic.segments,
      mode: "heuristic",
      durationSec: heuristic.durationSec,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
