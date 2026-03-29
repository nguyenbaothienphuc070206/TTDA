import { getBeltById } from "@/data/belts";
import { checkRateLimit, isBodyTooLarge } from "@/lib/apiGuards";
import { createCompatResponder } from "@/lib/api/compatResponse";
import { chatCompletion, hasOpenAi } from "@/lib/ai/openai";

function asText(value) {
  return String(value || "").trim();
}

function normalizeDiaryEntry(raw) {
  const date = asText(raw?.date).slice(0, 10);
  const title = asText(raw?.title).slice(0, 140);
  const note = asText(raw?.note).slice(0, 2400);
  return { date, title, note };
}

function hasAnyKeyword(text, keywords) {
  const s = String(text || "").toLowerCase();
  return keywords.some((k) => s.includes(k));
}

function buildHeuristicReply({ name, beltTitle, entry }) {
  const who = name ? `${name}` : "môn sinh";
  const focus = entry.title || "buổi tập";
  const note = entry.note || "";

  const pain = hasAnyKeyword(note, [
    "đau",
    "chấn thương",
    "sưng",
    "nhói",
    "bầm",
    "tê",
    "chuột rút",
    "căng",
    "lật cổ chân",
    "gối",
    "lưng",
    "vai",
    "cổ",
    "đầu",
  ]);

  const breath = hasAnyKeyword(note, ["hụt hơi", "mệt", "thở", "tim", "sức bền", "đuối"]);
  const balance = hasAnyKeyword(note, ["thăng bằng", "ngã", "loạng", "lệch"]);
  const technique = hasAnyKeyword(`${focus} ${note}`, [
    "đá",
    "tống",
    "quyền",
    "đòn",
    "đấm",
    "đỡ",
    "gạt",
    "tấn",
    "trụ",
  ]);

  const lines = [];
  lines.push(
    `Chào ${who}${beltTitle ? ` (${beltTitle})` : ""}. Thầy đọc nhật ký “${focus}” rồi.`
  );

  if (pain) {
    lines.push(
      "Nếu có đau nhói/sưng hoặc đau tăng dần: ưu tiên giảm cường độ, nghỉ đúng lúc và hỏi HLV/bác sĩ khi cần."
    );
  } else {
    lines.push("Tốt lắm - quan trọng là giữ nhịp đều và tập đúng kỹ thuật.");
  }

  lines.push("\nGợi ý buổi sau:");
  if (technique) {
    lines.push("- Chia nhỏ kỹ thuật: tập chậm 5-8 phút, ưu tiên trụ vững và đường đòn đúng.");
    lines.push("- Quay 1 đoạn ngắn để tự soi: vai thả lỏng, hông xoay đủ, gối không đổ vào trong.");
  } else {
    lines.push("- Khởi động kỹ 6-8 phút (cổ chân/gối/hông/vai), rồi mới vào bài chính.");
    lines.push("- Chọn 1 mục tiêu rõ: đúng nhịp thở hoặc đúng trụ, không ôm quá nhiều thứ.");
  }

  if (breath) {
    lines.push("- Thêm 2 hiệp cardio nhẹ 2-3 phút, tập thở ra dài để tránh hụt hơi.");
  }
  if (balance) {
    lines.push("- Tập thăng bằng 3 hiệp x 30s/1 chân; khi đá, siết nhẹ bụng và nhìn cố định 1 điểm.");
  }

  lines.push("\nNhắc an toàn: tập chậm khi mỏi, dừng nếu đau bất thường, ưu tiên kỹ thuật hơn tốc độ.");
  return lines.join("\n").trim();
}

async function buildOpenAiReply({ name, beltTitle, entry }) {
  const who = asText(name).slice(0, 80) || "môn sinh";

  const system = [
    "Bạn là sư phụ/HLV Vovinam, giọng ấm áp nhưng kỷ luật.",
    "Nhiệm vụ: đọc nhật ký tập luyện và phản hồi ngắn gọn, thực tế, có tính động viên.",
    "Quy tắc bắt buộc:",
    "- KHÔNG bịa thêm thông tin ngoài nhật ký.",
    "- Tối đa 8 câu ngắn.",
    "- Luôn có 2-4 gợi ý cụ thể cho buổi sau (dạng bullet '- ').",
    "- Luôn có 1 câu nhắc an toàn cuối cùng.",
    "- Nếu nhật ký có dấu hiệu chấn thương/đau mạnh/choáng: ưu tiên khuyên nghỉ, giảm cường độ, và hỏi HLV/bác sĩ khi cần.",
    "- Không chẩn đoán y khoa, không khuyến khích tập tiếp khi đau.",
    "- Viết bằng tiếng Việt.",
  ].join("\n");

  const user = [
    `Tên môn sinh: ${who}`,
    beltTitle ? `Cấp đai: ${beltTitle}` : "",
    entry.date ? `Ngày: ${entry.date}` : "",
    entry.title ? `Tiêu đề: ${entry.title}` : "",
    entry.note ? `Nhật ký: ${entry.note}` : "Nhật ký: (trống)",
  ]
    .filter(Boolean)
    .join("\n");

  const reply = await chatCompletion({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.6,
  });

  return asText(reply).slice(0, 2400);
}

export async function POST(request) {
  const api = createCompatResponder(request);
  if (isBodyTooLarge(request, 20_000)) {
    return api.fail({ message: "Body quá lớn.", code: "BODY_TOO_LARGE", status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "ai_diary",
    limit: 40,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.ok) {
    return api.fail({
      message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
      code: "RATE_LIMITED",
      status: 429,
      retryAfterSec: rl.retryAfterSec,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return api.fail({ message: "Body JSON không hợp lệ.", code: "INVALID_JSON", status: 400 });
  }

  const entry = normalizeDiaryEntry(body?.entry);
  const name = asText(body?.name).slice(0, 80);
  const beltId = asText(body?.beltId).slice(0, 40);
  const beltTitle = (getBeltById(beltId)?.title || "").trim();

  const hasContent = Boolean(entry.title || entry.note);
  if (!hasContent) {
    return api.ok({
      reply: buildHeuristicReply({ name, beltTitle, entry }),
      mode: "heuristic",
    });
  }

  try {
    if (hasOpenAi()) {
      const reply = await buildOpenAiReply({ name, beltTitle, entry });
      return api.ok({ reply, mode: "openai" });
    }
  } catch {
    // fall through to heuristic
  }

  return api.ok({
    reply: buildHeuristicReply({ name, beltTitle, entry }),
    mode: "heuristic",
  });
}

