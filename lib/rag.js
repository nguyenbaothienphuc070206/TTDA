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

function scoreDoc(queryTokens, docTokens) {
  if (queryTokens.length === 0 || docTokens.length === 0) return 0;

  const freq = new Map();
  for (const tok of docTokens) {
    freq.set(tok, (freq.get(tok) || 0) + 1);
  }

  let score = 0;
  for (const q of queryTokens) {
    const f = freq.get(q) || 0;
    if (f > 0) score += 1 + Math.log(1 + f);
  }

  // slight length penalty
  return score / (1 + Math.log(1 + docTokens.length));
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

    const dTokens = tokenize(d.text);
    const score = scoreDoc(qTokens, dTokens);
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
