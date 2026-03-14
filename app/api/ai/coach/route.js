import { NextResponse } from "next/server";

import { TECHNIQUES, TECHNIQUE_CATEGORIES } from "@/data/wiki";
import { VIDEOS } from "@/data/videos";
import { getLessonBySlug } from "@/data/lessons";
import {
  buildDocuments,
  extractHighlights,
  searchDocuments,
} from "@/lib/rag";
import { BELT_ORDER, normalizeBeltId, isBeltAllowed } from "@/lib/ai/belts";
import {
  AI_COACH_NOT_FOUND_MESSAGE,
  buildAiCoachFewShotMessages,
  buildAiCoachSystemPrompt,
} from "@/lib/ai/prompt";
import { createEmbedding, chatCompletion, hasOpenAi, streamChatCompletion } from "@/lib/ai/openai";
import { recommendVideos } from "@/lib/ai/recommendVideos";
import { checkRateLimit, isBodyTooLarge } from "@/lib/apiGuards";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";

const DOCS = buildDocuments({
  techniques: TECHNIQUES,
  videos: VIDEOS,
  categories: TECHNIQUE_CATEGORIES,
});

function asText(value) {
  return String(value || "").trim();
}

function wantsStream(request, body) {
  if (body?.stream) return true;
  const accept = request?.headers?.get?.("accept") || "";
  return String(accept).includes("text/event-stream");
}

function sseEvent(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sanitizeHistory(history) {
  const list = Array.isArray(history) ? history : [];
  const cleaned = [];

  for (const item of list.slice(-10)) {
    const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : "";
    const content = String(item?.content || "").trim();
    if (!role || !content) continue;
    cleaned.push({ role, content: content.slice(0, 1200) });
  }

  // keep only last 8 turns to limit tokens
  return cleaned.slice(-8);
}

function toSource(doc, score) {
  return {
    id: doc.id,
    type: doc.type,
    title: doc.title,
    url: doc.url,
    score: Math.round(Number(score || 0) * 100) / 100,
    highlights: extractHighlights(doc.text, 3),
    meta: doc.meta || {},
    text: doc.text,
  };
}

function toKbSource(row) {
  const title = String(row?.title || row?.metadata?.title || row?.source_id || row?.id || "").trim();
  const url = String(row?.url || row?.metadata?.url || "").trim();
  const content = String(row?.content || "");

  return {
    id: String(row?.id || "").trim(),
    type: String(row?.source || "kb").trim() || "kb",
    title: title || "Tài liệu",
    url: url || (row?.source === "video" && row?.source_id ? `/video/${row.source_id}` : ""),
    score: Math.round(Number(row?.similarity || 0) * 100) / 100,
    highlights: extractHighlights(content, 3),
    meta: {
      ...(row?.metadata && typeof row.metadata === "object" ? row.metadata : {}),
      source: row?.source,
      sourceId: row?.source_id,
      beltId: row?.belt_id,
    },
    text: content,
    beltId: row?.belt_id || null,
  };
}

function beltFromLessonLevel(levelId) {
  if (levelId === "co-ban") return "lam-dai";
  if (levelId === "trung-cap") return "hoang-dai";
  if (levelId === "nang-cao") return "huyen-dai";
  return null;
}

function lessonToSource(lesson) {
  if (!lesson) return null;

  const beltId = beltFromLessonLevel(lesson.level);
  const text = [
    `BÀI HỌC: ${lesson.title}`,
    lesson.summary ? `Tóm tắt: ${lesson.summary}` : "",
    Array.isArray(lesson.goals) && lesson.goals.length
      ? `Mục tiêu:\n- ${lesson.goals.join("\n- ")}`
      : "",
    Array.isArray(lesson.steps) && lesson.steps.length
      ? `Các bước:\n- ${lesson.steps.join("\n- ")}`
      : "",
    Array.isArray(lesson.mistakes) && lesson.mistakes.length
      ? `Lỗi thường gặp:\n- ${lesson.mistakes.join("\n- ")}`
      : "",
    Array.isArray(lesson.tips) && lesson.tips.length
      ? `Mẹo tập:\n- ${lesson.tips.join("\n- ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: `lesson:${lesson.slug}`,
    type: "lesson",
    title: lesson.title,
    url: `/bai-hoc/${lesson.slug}`,
    score: 1,
    highlights: extractHighlights(text, 4),
    meta: {
      kind: "lesson",
      slug: lesson.slug,
      level: lesson.level,
      beltId,
    },
    text,
  };
}

async function resolveUserContext({ request, body }) {
  const fromBodyBeltId = normalizeBeltId(body?.beltId);
  const fromBodyName = asText(body?.name).slice(0, 80);

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        user: null,
        name: fromBodyName,
        beltId: fromBodyBeltId,
      };
    }

    // Best-effort: use DB belt if it matches our app belts.
    const { data: progress } = await supabase
      .from("student_progress")
      .select("belt_rank")
      .eq("user_id", user.id)
      .maybeSingle();

    const rawDbBelt = asText(progress?.belt_rank);
    const dbBelt = BELT_ORDER.includes(rawDbBelt) ? rawDbBelt : "";

    return {
      user,
      name: fromBodyName,
      beltId: dbBelt || fromBodyBeltId,
      supabase,
    };
  } catch {
    return { user: null, name: fromBodyName, beltId: fromBodyBeltId };
  }
}

async function retrieveSources({ query, videoId }) {
  const openAiReady = hasOpenAi();
  const supabaseReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Prefer vector search when both OpenAI + Supabase service key exist.
  if (openAiReady && supabaseReady) {
    const embedding = await createEmbedding({ text: query });
    const supabase = createSupabaseServiceClient();

    const merged = [];

    // If asking inside a video context, prefer that video chunks but still allow techniques.
    if (videoId) {
      const { data: videoRows } = await supabase
        .rpc("match_ai_knowledge_chunks", {
          query_embedding: embedding,
          match_count: 6,
          match_threshold: 0.65,
          filter_source: "video",
          filter_belt_id: null,
        })
        .catch(() => ({ data: null }));

      for (const r of videoRows || []) {
        if (String(r?.source_id || "") === videoId) {
          merged.push(r);
        }
      }
    }

    const { data: rows, error } = await supabase.rpc("match_ai_knowledge_chunks", {
      query_embedding: embedding,
      match_count: 10,
      match_threshold: 0.70,
      filter_source: null,
      filter_belt_id: null,
    });

    if (error) {
      // Fall back to local search if vector RPC fails.
      // (Do not throw; keep the app usable.)
    } else {
      for (const r of rows || []) merged.push(r);
    }

    const dedup = new Map();
    for (const r of merged) {
      const id = String(r?.id || "");
      if (!id) continue;
      if (!dedup.has(id)) dedup.set(id, r);
    }

    const sources = Array.from(dedup.values())
      .map((r) => toKbSource(r))
      .filter(Boolean)
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 6);

    return { sources, mode: "vector" };
  }

  // Fallback: in-repo RAG-lite.
  const results = searchDocuments({
    query,
    docs: DOCS,
    limit: 6,
    filter: videoId
      ? (d) => d.type === "technique" || (d.type === "video" && d.meta?.id === videoId)
      : undefined,
  });

  const sources = results.map(({ doc, score }) => toSource(doc, score));
  return { sources, mode: "local" };
}

function buildContextBlock(sources, beltId) {
  const lines = [];
  lines.push("TÀI LIỆU (trích đoạn) — chỉ dùng các đoạn sau để trả lời:");

  sources.slice(0, 5).forEach((s, idx) => {
    const tag = `S${idx + 1}`;
    const text = String(s.text || "").trim();
    const limited = text.length > 1600 ? `${text.slice(0, 1600)}\n…` : text;
    const safeUrl = String(s.url || "").trim();

    lines.push("\n" + `[${tag}] ${s.title}${safeUrl ? ` (${safeUrl})` : ""}`);
    if (s.meta?.beltId) lines.push(`Belt: ${s.meta.beltId}`);
    lines.push(limited);
  });

  lines.push("\nNHẮC LẠI: Nếu không đủ thông tin trong TÀI LIỆU, phải trả lời đúng câu từ chối.");
  lines.push(`Cấp đai môn sinh: ${beltId}`);
  return lines.join("\n");
}

export async function POST(request) {
  if (isBodyTooLarge(request, 30_000)) {
    return NextResponse.json({ error: "Body quá lớn." }, { status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "ai_coach",
    limit: 60,
    windowMs: 5 * 60 * 1000,
  });

  if (!rl.ok) {
    const res = NextResponse.json(
      { error: "Bạn hỏi quá nhanh. Vui lòng chờ một chút." },
      { status: 429 }
    );
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
    }

    const rawQuery = asText(body?.query);
    if (rawQuery.length > 500) {
      return NextResponse.json(
        { error: "Câu hỏi quá dài. Hãy giữ dưới 500 ký tự." },
        { status: 400 }
      );
    }

    const query = rawQuery;
    const context = body?.context || null;
    const history = sanitizeHistory(body?.history);

    if (query.length < 2) {
      return NextResponse.json(
        { error: "Câu hỏi quá ngắn. Hãy nhập tối thiểu 2 ký tự." },
        { status: 400 }
      );
    }

    const videoId = asText(context?.videoId).slice(0, 64);
    const lessonSlug = asText(context?.lessonSlug).slice(0, 80);

    const userCtx = await resolveUserContext({ request, body });
    const beltId = normalizeBeltId(userCtx?.beltId);

    const { sources: rawSources, mode } = await retrieveSources({ query, videoId });

    // If a lesson context exists, include it as a high-signal grounded source.
    const lesson = lessonSlug ? getLessonBySlug(lessonSlug) : null;
    const lessonSource = lessonToSource(lesson);
    const mergedSources = lessonSource
      ? [lessonSource, ...(rawSources || [])]
      : rawSources;

    // Enforce belt gating (only if doc declares belt).
    const sources = (mergedSources || []).filter((s) =>
      isBeltAllowed({ userBeltId: beltId, docBeltId: s?.meta?.beltId })
    );

    const top = sources[0];

    // Video recommendations for UX.
    const recommendedVideos = recommendVideos({ query, sources, userBeltId: beltId });

    if (!top) {
      const res = NextResponse.json({
        answer: AI_COACH_NOT_FOUND_MESSAGE,
        sources: [],
        recommendedVideos: recommendedVideos.map((v) => ({
          id: v.id,
          title: v.title,
          summary: v.summary,
          url: `/video/${v.id}`,
        })),
        mode,
      });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    const system = buildAiCoachSystemPrompt({ beltId });
    const contextBlock = buildContextBlock(sources, beltId);
    const fewShot = buildAiCoachFewShotMessages();

    const messages = [
      { role: "system", content: system },
      { role: "system", content: contextBlock },
      ...(Array.isArray(fewShot) ? fewShot : []),
      // Lightweight memory: include last turns if provided.
      ...(history.length > 0
        ? [{ role: "system", content: `LỊCH SỬ GẦN ĐÂY (để giữ mạch hội thoại):\n${history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join("\n")}` }]
        : []),
      { role: "user", content: query },
    ];

    const openAiReady = hasOpenAi();
    const doStream = openAiReady && wantsStream(request, body);

    // Best-effort store chat history in Supabase when user is logged in.
    const sessionId = asText(body?.sessionId);
    const canStore = Boolean(userCtx?.user && userCtx?.supabase);

    let storedSessionId = sessionId;
    let storedUserMessageId = "";
    if (canStore && !storedSessionId) {
      try {
        const { data } = await userCtx.supabase
          .from("ai_chat_sessions")
          .insert({ user_id: userCtx.user.id, title: query.slice(0, 80) })
          .select("id")
          .single();
        storedSessionId = data?.id || "";
      } catch {
        storedSessionId = "";
      }
    }

    if (canStore && storedSessionId) {
      try {
        const { data } = await userCtx.supabase
          .from("ai_chat_messages")
          .insert({
          session_id: storedSessionId,
          user_id: userCtx.user.id,
          role: "user",
          content: query,
          meta: { videoId: videoId || null, beltId },
        })
          .select("id")
          .single();

        storedUserMessageId = data?.id || "";
      } catch {
        // ignore
      }
    }

    if (!openAiReady) {
      // No LLM key: return a safe, source-grounded Markdown answer.
      const md = [
        "## Lý thuyết",
        ...sources.slice(0, 1).flatMap((s) => s.highlights?.length ? [s.highlights[0]] : []),
        "\n## Các bước thực hiện",
        ...sources.slice(0, 1).flatMap((s) => (s.highlights || []).slice(0, 3).map((h, i) => `${i + 1}. ${h}`)),
        "\n## Lưu ý an toàn",
        "- Khởi động kỹ khớp cổ chân/gối/hông trước khi tập.",
        "- Tập chậm để đúng kỹ thuật, không cố biên độ khi đau.",
        "\n_(Ghi chú: Chưa cấu hình OPENAI_API_KEY nên đây là trả lời RAG-lite dựa trên dữ liệu trong project.)_",
      ].join("\n");

      let assistantMessageId = "";
      if (canStore && storedSessionId) {
        try {
          const { data } = await userCtx.supabase
            .from("ai_chat_messages")
            .insert({
              session_id: storedSessionId,
              user_id: userCtx.user.id,
              role: "assistant",
              content: md,
              meta: {
                sources: sources.slice(0, 5).map((s) => ({ id: s.id, url: s.url, score: s.score })),
                userMessageId: storedUserMessageId || null,
              },
            })
            .select("id")
            .single();
          assistantMessageId = data?.id || "";
        } catch {
          assistantMessageId = "";
        }
      }

      const res = NextResponse.json({
        answer: md,
        sources: sources.map((s) => ({
          id: s.id,
          type: s.type,
          title: s.title,
          url: s.url,
          score: s.score,
          highlights: s.highlights,
        })),
        recommendedVideos: recommendedVideos.map((v) => ({
          id: v.id,
          title: v.title,
          summary: v.summary,
          url: `/video/${v.id}`,
        })),
        sessionId: storedSessionId || null,
        userMessageId: storedUserMessageId || null,
        assistantMessageId: assistantMessageId || null,
        mode,
      });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    if (!doStream) {
      const answer = await chatCompletion({ messages });

      let assistantMessageId = "";
      if (canStore && storedSessionId) {
        try {
          const { data } = await userCtx.supabase
            .from("ai_chat_messages")
            .insert({
            session_id: storedSessionId,
            user_id: userCtx.user.id,
            role: "assistant",
            content: answer,
            meta: {
              sources: sources.slice(0, 5).map((s) => ({ id: s.id, url: s.url, score: s.score })),
              userMessageId: storedUserMessageId || null,
            },
          })
            .select("id")
            .single();
          assistantMessageId = data?.id || "";
        } catch {
          // ignore
          assistantMessageId = "";
        }
      }

      const res = NextResponse.json({
        answer,
        sources: sources.map((s) => ({
          id: s.id,
          type: s.type,
          title: s.title,
          url: s.url,
          score: s.score,
          highlights: s.highlights,
        })),
        recommendedVideos: recommendedVideos.map((v) => ({
          id: v.id,
          title: v.title,
          summary: v.summary,
          url: `/video/${v.id}`,
        })),
        sessionId: storedSessionId || null,
        userMessageId: storedUserMessageId || null,
        assistantMessageId: assistantMessageId || null,
        mode,
      });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    // Streaming (SSE)
    const encoder = new TextEncoder();
    let full = "";
    let assistantMessageId = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(
              sseEvent("meta", {
                sources: sources.map((s) => ({
                  id: s.id,
                  type: s.type,
                  title: s.title,
                  url: s.url,
                  score: s.score,
                  highlights: s.highlights,
                })),
                recommendedVideos: recommendedVideos.map((v) => ({
                  id: v.id,
                  title: v.title,
                  summary: v.summary,
                  url: `/video/${v.id}`,
                })),
                sessionId: storedSessionId || null,
                mode,
              })
            )
          );

          for await (const chunk of streamChatCompletion({ messages })) {
            full += chunk;
            controller.enqueue(encoder.encode(sseEvent("delta", { text: chunk })));
          }

          if (canStore && storedSessionId) {
            try {
              const { data } = await userCtx.supabase
                .from("ai_chat_messages")
                .insert({
                session_id: storedSessionId,
                user_id: userCtx.user.id,
                role: "assistant",
                content: full,
                meta: {
                  sources: sources.slice(0, 5).map((s) => ({ id: s.id, url: s.url, score: s.score })),
                  userMessageId: storedUserMessageId || null,
                },
              })
                .select("id")
                .single();

              assistantMessageId = data?.id || "";
            } catch {
              // ignore
              assistantMessageId = "";
            }
          }

          controller.enqueue(
            encoder.encode(
              sseEvent("done", {
                ok: true,
                sessionId: storedSessionId || null,
                userMessageId: storedUserMessageId || null,
                assistantMessageId: assistantMessageId || null,
              })
            )
          );
          controller.close();
        } catch (e) {
          controller.enqueue(
            encoder.encode(
              sseEvent("error", { error: "Không xử lý được yêu cầu. Vui lòng thử lại." })
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
      },
    });
  } catch {
    const res = NextResponse.json(
      { error: "Không xử lý được yêu cầu. Vui lòng thử lại." },
      { status: 500 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
