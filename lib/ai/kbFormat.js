function normalizeAscii(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRaw(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function toList(value) {
  const list = Array.isArray(value) ? value : [];
  return list.map((x) => String(x || "").trim()).filter(Boolean);
}

export function beltFromDifficulty(difficulty) {
  if (difficulty === "easy") return "lam-dai";
  if (difficulty === "medium") return "hoang-dai";
  if (difficulty === "hard") return "hong-dai";
  return null;
}

function detectWarningsText(text) {
  const raw = normalizeRaw(text);
  const ascii = normalizeAscii(text);
  if (!raw && !ascii) return [];

  const warnings = [];

  const hasRaw = (...needles) => needles.some((n) => raw.includes(String(n).toLowerCase()));
  const hasAscii = (...needles) => needles.some((n) => ascii.includes(normalizeAscii(n)));

  // Prefer diacritic-aware matches to avoid collisions (e.g. "gợi" vs "gối").
  if (hasRaw("gối")) warnings.push("gối");
  else if (hasAscii("đau gối", "dau goi", "khớp gối", "khop goi")) warnings.push("gối");

  if (hasRaw("cổ chân")) warnings.push("cổ chân");
  else if (hasAscii("co chan")) warnings.push("cổ chân");

  if (hasRaw("hông", "khớp hông")) warnings.push("hông");
  else if (hasAscii("hong", "khop hong")) warnings.push("hông");

  if (hasRaw("cổ tay", "khớp cổ tay")) warnings.push("cổ tay");
  else if (hasAscii("co tay", "khop co tay")) warnings.push("cổ tay");

  if (hasRaw("đau cổ", "cổ vai", "cổ vai gáy", "vai gáy")) warnings.push("cổ");
  else if (hasAscii("dau co", "co vai", "co vai gay", "vai gay")) warnings.push("cổ");

  if (hasRaw("vai", "khớp vai")) warnings.push("vai");
  else if (hasAscii("vai", "khop vai")) warnings.push("vai");

  if (hasRaw("lưng", "cột sống")) warnings.push("lưng");
  else if (hasAscii("lung", "cot song")) warnings.push("lưng");

  if (hasRaw("chấn thương")) warnings.push("chấn thương");
  else if (hasAscii("chan thuong")) warnings.push("chấn thương");

  // Dedup, keep stable order.
  return Array.from(new Set(warnings));
}

function tagLine(parts) {
  const tokens = (parts || [])
    .map((p) => (p && typeof p === "object" ? { key: p.key, value: p.value } : null))
    .filter((p) => p && p.key && p.value)
    .map((p) => `[${String(p.key).trim()}: ${String(p.value).trim()}]`);

  return tokens.join(" ");
}

function formatTagsLine(tags) {
  const list = toList(tags);
  if (!list.length) return "";
  return `Tags: ${list.join(", ")}`;
}

export function formatTechniqueMarkdown({ technique, category }) {
  const t = technique && typeof technique === "object" ? technique : {};
  const title = String(t.title || "Kỹ thuật").trim() || "Kỹ thuật";

  const beltId = beltFromDifficulty(t.difficulty);
  const categoryTitle = String(category?.title || "").trim();
  const categoryId = String(t.categoryId || "").trim();

  const steps = toList(t.steps);
  const mistakes = toList(t.mistakes);
  const safety = toList(t.safety);
  const tags = toList(t.tags);

  const warnings = detectWarningsText(
    [t.summary, ...steps, ...mistakes, ...safety, ...tags].filter(Boolean).join("\n")
  );

  const headerTags = [
    { key: "Type", value: "technique" },
    ...(beltId ? [{ key: "Level", value: beltId }] : []),
    ...(categoryTitle ? [{ key: "Category", value: categoryTitle }] : categoryId ? [{ key: "Category", value: categoryId }] : []),
    ...warnings.slice(0, 3).map((w) => ({ key: "Warning", value: w })),
  ];

  const out = [];
  out.push(`# ${title}`);

  const tl = tagLine(headerTags);
  if (tl) out.push(tl);

  const tl2 = formatTagsLine(tags);
  if (tl2) out.push(tl2);

  if (String(t.summary || "").trim()) {
    out.push("\n## Tóm tắt");
    out.push(String(t.summary).trim());
  }

  if (steps.length) {
    out.push("\n## Các bước");
    steps.forEach((s, i) => out.push(`${i + 1}. ${s}`));
  }

  if (mistakes.length) {
    out.push("\n## Lỗi thường gặp");
    mistakes.forEach((m) => out.push(`- ${m}`));
  }

  if (safety.length) {
    out.push("\n## An toàn");
    safety.forEach((x) => out.push(`- ${x}`));
  }

  return out.join("\n").trim() + "\n";
}

export function formatVideoMarkdown({ video }) {
  const v = video && typeof video === "object" ? video : {};
  const title = String(v.title || "Video").trim() || "Video";

  const beltId = String(v.beltId || "").trim();
  const transcript = toList(v.transcript);
  const tags = toList(v.tags);

  const warnings = detectWarningsText(
    [v.summary, ...transcript, ...tags].filter(Boolean).join("\n")
  );

  const headerTags = [
    { key: "Type", value: "video" },
    ...(beltId ? [{ key: "Level", value: beltId }] : []),
    ...warnings.slice(0, 3).map((w) => ({ key: "Warning", value: w })),
  ];

  const out = [];
  out.push(`# ${title}`);

  const tl = tagLine(headerTags);
  if (tl) out.push(tl);

  const tl2 = formatTagsLine(tags);
  if (tl2) out.push(tl2);

  if (String(v.summary || "").trim()) {
    out.push("\n## Tóm tắt");
    out.push(String(v.summary).trim());
  }

  if (transcript.length) {
    out.push("\n## Nội dung chính");
    transcript.forEach((line) => out.push(`- ${line}`));
  }

  return out.join("\n").trim() + "\n";
}

export function extractWarningTagsFromMarkdown(text) {
  // Helper when ingesting arbitrary .md files.
  return detectWarningsText(text);
}
