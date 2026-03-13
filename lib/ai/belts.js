export const BELT_ORDER = ["lam-dai", "hoang-dai", "huyen-dai"];

export function normalizeBeltId(input) {
  const id = String(input || "").trim();
  return BELT_ORDER.includes(id) ? id : "lam-dai";
}

export function beltRank(id) {
  const safe = normalizeBeltId(id);
  const idx = BELT_ORDER.indexOf(safe);
  return idx < 0 ? 0 : idx;
}

export function isBeltAllowed({ userBeltId, docBeltId }) {
  const userRank = beltRank(userBeltId);
  const doc = String(docBeltId || "").trim();
  if (!doc) return true; // unknown => allow (treat as basic)
  if (!BELT_ORDER.includes(doc)) return true;
  return userRank >= beltRank(doc);
}
