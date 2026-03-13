import { VIDEOS } from "@/data/videos";
import { isBeltAllowed, normalizeBeltId } from "@/lib/ai/belts";

function normalizeText(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(text, qTokens) {
  const t = normalizeText(text);
  if (!t) return 0;
  let s = 0;
  for (const tok of qTokens) {
    if (tok && t.includes(tok)) s += 1;
  }
  return s;
}

export function recommendVideos({ query, sources, limit = 2, userBeltId }) {
  const picked = [];
  const beltId = normalizeBeltId(userBeltId) || null;

  const allowedVideos = (VIDEOS || []).filter((v) => {
    if (!beltId) return true;
    return isBeltAllowed({ userBeltId: beltId, docBeltId: v?.beltId });
  });

  // 1) Prefer videos already retrieved.
  for (const s of sources || []) {
    const url = String(s?.url || "");
    const m = url.match(/^\/video\/([^/?#]+)/);
    if (m?.[1]) picked.push(m[1]);
  }

  const uniq = Array.from(new Set(picked)).filter(Boolean);
  if (uniq.length >= limit) {
    return uniq
      .slice(0, limit)
      .map((id) => allowedVideos.find((v) => v.id === id))
      .filter(Boolean);
  }

  // 2) Otherwise: simple lexical match on demo videos.
  const q = normalizeText(query);
  const qTokens = q.split(" ").filter(Boolean).slice(0, 12);

  const scored = allowedVideos
    .map((v) => ({
      video: v,
      score: score([v.title, v.summary, ...(v.tags || [])].join(" "), qTokens),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  for (const item of scored) {
    if (uniq.includes(item.video.id)) continue;
    uniq.push(item.video.id);
    if (uniq.length >= limit) break;
  }

  return uniq
    .slice(0, limit)
    .map((id) => allowedVideos.find((v) => v.id === id))
    .filter(Boolean);
}
