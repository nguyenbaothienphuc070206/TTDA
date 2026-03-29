import { getBeltById } from "@/data/belts";
import { checkRateLimit, isBodyTooLarge } from "@/lib/apiGuards";
import { createCompatResponder } from "@/lib/api/compatResponse";
import { chatCompletion, hasOpenAi } from "@/lib/ai/openai";

function asText(value) {
  return String(value || "").trim();
}

function normalizeRequest(body) {
  const scenario = asText(body?.scenario).slice(0, 1400);
  const name = asText(body?.name).slice(0, 80);
  const beltId = asText(body?.beltId).slice(0, 40);
  const imageDataUrl = asText(body?.imageDataUrl);

  // Guard: avoid sending huge base64 strings.
  const safeImage = imageDataUrl && imageDataUrl.length <= 220_000 ? imageDataUrl : "";

  return { scenario, name, beltId, imageDataUrl: safeImage };
}

function buildHeuristicOptions({ beltTitle, scenario }) {
  const level = beltTitle ? `(${beltTitle})` : "";
  const focus = scenario ? `Tình huống: ${scenario}` : "";

  const baseSafety =
    "An toàn: mang bảo hộ, dừng ngay nếu đau nhói/chóng mặt, ưu tiên kiểm soát hơn tốc độ.";

  return [
    {
      title: `Giữ khoảng cách + thăm dò ${level}`.trim(),
      when: "Khi đối thủ áp sát nhanh hoặc bạn chưa bắt được nhịp.",
      steps: [
        "Giữ tay thủ cao, cằm thu, mắt nhìn ngực/vai đối thủ.",
        "Di chuyển ngang 2-3 bước, tránh lùi thẳng liên tục.",
        "Ra đòn thăm dò nhẹ để đo phản xạ rồi reset vị trí.",
      ],
      safety: baseSafety,
    },
    {
      title: `Cắt góc + phản 1 nhịp ${level}`.trim(),
      when: "Khi đối thủ lao vào theo đường thẳng hoặc lộ nhịp ra đòn.",
      steps: [
        "Bước chéo ra ngoài (cắt góc) thay vì đứng yên đỡ đòn.",
        "Chặn/gạt để làm lệch hướng, phản một đòn rõ ràng rồi thoát.",
        "Không ham combo dài: ưu tiên 1 đòn chắc + rút về thủ.",
      ],
      safety: baseSafety,
    },
    {
      title: `Reset nhịp thở + đổi tempo ${level}`.trim(),
      when: "Khi bạn bị cuốn vào nhịp đối thủ hoặc bắt đầu hụt hơi.",
      steps: [
        "Chủ động lùi 1 nhịp ngắn, thở ra dài 1 lần để lấy lại bình tĩnh.",
        "Đổi tempo: chậm 1-2 nhịp rồi tăng nhanh 1 nhịp để phá phản xạ.",
        "Chọn mục tiêu đơn: kiểm soát khoảng cách hoặc sửa 1 lỗi kỹ thuật.",
      ],
      safety: baseSafety,
    },
  ].map((opt) => ({
    ...opt,
    context: focus,
  }));
}

function stripCodeFences(text) {
  const s = String(text || "").trim();
  if (!s) return "";

  if (s.startsWith("```")) {
    const firstNewline = s.indexOf("\n");
    const withoutFirstLine = firstNewline >= 0 ? s.slice(firstNewline + 1) : s;
    const end = withoutFirstLine.lastIndexOf("```");
    return (end >= 0 ? withoutFirstLine.slice(0, end) : withoutFirstLine).trim();
  }

  return s;
}

function tryParseOptions(text) {
  const cleaned = stripCodeFences(text);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const maybeJson = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;

  try {
    const obj = JSON.parse(maybeJson);
    const options = Array.isArray(obj?.options) ? obj.options : null;
    if (!options || options.length !== 3) return null;

    const normalized = options
      .map((o) => {
        if (!o || typeof o !== "object") return null;
        const title = asText(o.title).slice(0, 120);
        const when = asText(o.when).slice(0, 220);
        const safety = asText(o.safety).slice(0, 240);
        const stepsRaw = Array.isArray(o.steps) ? o.steps : [];
        const steps = stepsRaw
          .map((x) => asText(x).slice(0, 220))
          .filter(Boolean)
          .slice(0, 6);

        if (!title || steps.length < 2) return null;

        return { title, when, steps, safety };
      })
      .filter(Boolean);

    return normalized.length === 3 ? normalized : null;
  } catch {
    return null;
  }
}

async function buildOpenAiOptions({ name, beltTitle, scenario, imageDataUrl }) {
  const who = asText(name) || "võ sinh";

  const system = [
    "Bạn là trợ lý chiến thuật sparring Vovinam (đối luyện trong CLB) - ưu tiên an toàn.",
    "Nhiệm vụ: đưa ra CHÍNH XÁC 3 phương án chiến thuật cho tình huống người dùng mô tả.",
    "Ràng buộc bắt buộc:",
    "- Không hướng dẫn gây thương tích nghiêm trọng; không nhắm vào điểm yếu/vital points.",
    "- Luôn nhắc an toàn (bảo hộ, dừng khi đau, tập với HLV).",
    "- Viết tiếng Việt, ngắn gọn, thực dụng.",
    "- Output JSON ONLY (không markdown, không giải thích thêm):",
    "  {\"options\":[{\"title\":string,\"when\":string,\"steps\":[string,string,string],\"safety\":string}, ... x3] }",
    "- Mỗi option: steps 3-5 dòng, mệnh lệnh ngắn.",
  ].join("\n");

  const userText = [
    `Tên: ${who}`,
    beltTitle ? `Cấp đai: ${beltTitle}` : "",
    scenario ? `Tình huống: ${scenario}` : "Tình huống: (không có)",
  ]
    .filter(Boolean)
    .join("\n");

  const userContent = imageDataUrl
    ? [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ]
    : userText;

  const reply = await chatCompletion({
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    temperature: 0.6,
  });

  const parsed = tryParseOptions(reply);
  if (!parsed) {
    throw new Error("OpenAI returned invalid JSON");
  }

  return parsed;
}

export async function POST(request) {
  const api = createCompatResponder(request);
  if (isBodyTooLarge(request, 260_000)) {
    return api.fail({ message: "Body quá lớn.", code: "BODY_TOO_LARGE", status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "ai_sparring",
    limit: 30,
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

  const { scenario, name, beltId, imageDataUrl } = normalizeRequest(body);
  const beltTitle = (getBeltById(beltId)?.title || "").trim();

  const hasAnyInput = Boolean(scenario || imageDataUrl);
  if (!hasAnyInput) {
    return api.fail({
      message: "Bạn hãy nhập tình huống (hoặc chọn 1 ảnh) để AI gợi ý.",
      code: "VALIDATION_ERROR",
      status: 400,
    });
  }

  try {
    if (hasOpenAi()) {
      const options = await buildOpenAiOptions({
        name,
        beltTitle,
        scenario,
        imageDataUrl,
      });

      return api.ok({ options, mode: "openai" });
    }
  } catch {
    // fall through to heuristic
  }

  const options = buildHeuristicOptions({ beltTitle, scenario });
  return api.ok({ options, mode: "heuristic" });
}

