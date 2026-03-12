import { NextResponse } from "next/server";

import { TECHNIQUES } from "@/data/wiki";
import { VIDEOS } from "@/data/videos";
import {
  buildDocuments,
  extractHighlights,
  searchDocuments,
} from "@/lib/rag";
import { checkRateLimit, isBodyTooLarge } from "@/lib/apiGuards";

const DOCS = buildDocuments({ techniques: TECHNIQUES, videos: VIDEOS });

function asText(value) {
  return String(value || "").trim();
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

    if (query.length < 2) {
      return NextResponse.json(
        { error: "Câu hỏi quá ngắn. Hãy nhập tối thiểu 2 ký tự." },
        { status: 400 }
      );
    }

    const videoId = asText(context?.videoId).slice(0, 64);

    const results = searchDocuments({
      query,
      docs: DOCS,
      limit: 5,
      filter: videoId
        ? (d) => d.type !== "video" || d.meta?.id === videoId
        : undefined,
    });

    const sources = results.map(({ doc, score }) => {
      return {
        id: doc.id,
        type: doc.type,
        title: doc.title,
        url: doc.url,
        score: Math.round(score * 100) / 100,
        highlights: extractHighlights(doc.text, 3),
      };
    });

    const top = sources[0];

    const lines = [];
    lines.push(`Gợi ý nhanh (RAG): ${query}`);

    if (!top) {
      lines.push(
        "- Mình chưa thấy đoạn khớp trong dữ liệu mẫu. Bạn thử hỏi cụ thể hơn (tên kỹ thuật/đòn/tư thế)."
      );
      lines.push(
        "- Ví dụ: 'đá tống trước sai thường gặp', 'tấn trung bình giữ gối thế nào?'"
      );

      return NextResponse.json({ answer: lines.join("\n"), sources: [] });
    }

    lines.push("- Mình tìm thấy một số đoạn liên quan trong thư viện.");

    for (const s of sources.slice(0, 3)) {
      const hl = Array.isArray(s.highlights) ? s.highlights : [];
      if (hl.length === 0) continue;

      lines.push(`\nTài liệu: ${s.title}`);
      for (const h of hl) {
        lines.push(`• ${h}`);
      }
    }

    lines.push(
      "\nLưu ý: Đây là trả lời dựa trên dữ liệu mẫu trong project (RAG-lite). Nếu bạn muốn chatbot 'xịn' hơn, mình có thể tích hợp LLM qua biến môi trường."
    );

    const res = NextResponse.json({
      answer: lines.join("\n"),
      sources,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    const res = NextResponse.json(
      { error: "Không xử lý được yêu cầu. Vui lòng thử lại." },
      { status: 500 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
