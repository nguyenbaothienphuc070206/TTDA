function normalizeText(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const t = normalizeText(text);
  if (!t) return [];
  return t.split(" ").filter(Boolean);
}

function buildIndex(text) {
  const tokens = tokenize(text);
  const freq = Object.create(null);

  for (const tok of tokens) {
    freq[tok] = (freq[tok] || 0) + 1;
  }

  return { freq, len: tokens.length };
}

function scoreDoc(queryTokens, index) {
  if (queryTokens.length === 0 || !index || typeof index !== "object") return 0;
  const freq = index.freq && typeof index.freq === "object" ? index.freq : null;
  const len = Number(index.len) || 0;
  if (!freq || len <= 0) return 0;

  let score = 0;
  for (const q of queryTokens) {
    const f = Number(freq[q]) || 0;
    if (f > 0) score += 1 + Math.log(1 + f);
  }

  // slight length penalty
  return score / (1 + Math.log(1 + len));
}

export function buildDocuments({ techniques, videos }) {
  const docs = [];

  for (const t of techniques || []) {
    const text = [
      t.title,
      t.summary,
      ...(t.steps || []),
      ...(t.mistakes || []),
      ...(t.safety || []),
      ...(t.tags || []),
    ]
      .filter(Boolean)
      .join("\n");

    docs.push({
      id: `technique:${t.slug}`,
      type: "technique",
      title: t.title,
      url: `/ky-thuat#${t.slug}`,
      text,
      index: buildIndex(text),
      meta: { slug: t.slug, categoryId: t.categoryId },
    });
  }

  for (const v of videos || []) {
    const text = [v.title, v.summary, ...(v.transcript || []), ...(v.tags || [])]
      .filter(Boolean)
      .join("\n");

    docs.push({
      id: `video:${v.id}`,
      type: "video",
      title: v.title,
      url: `/video/${v.id}`,
      text,
      index: buildIndex(text),
      meta: { id: v.id, beltId: v.beltId },
    });
  }

  return docs;
}

export function searchDocuments({ query, docs, limit = 5, filter }) {
  const qTokens = tokenize(query);
  const scored = [];

  for (const d of docs || []) {
    if (typeof filter === "function" && !filter(d)) continue;

    const index = d.index && typeof d.index === "object" ? d.index : buildIndex(d.text);
    const score = scoreDoc(qTokens, index);
    if (score <= 0) continue;

    scored.push({ doc: d, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, limit));
}

export function extractHighlights(docText, maxLines = 4) {
  const lines = String(docText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.slice(0, Math.max(1, maxLines));
}
