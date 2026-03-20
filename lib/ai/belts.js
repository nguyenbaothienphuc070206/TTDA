import { BELT_IDS } from "@/data/belts";

export const BELT_ORDER = BELT_IDS;

function normalizeAliasKey(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

const BELT_ALIAS_MAP = {
  "lam-dai-tu-ve": "lam-dai-tu-ve",
  "lam-dai-tuve": "lam-dai-tu-ve",
  "lam-tu-ve": "lam-dai-tu-ve",
  "lam-dai": "lam-dai",
  "lam-dai-1": "lam-dai-nhat",
  "lam-dai-nhat": "lam-dai-nhat",
  "lam-dai-nhi": "lam-dai-nhi",
  "lam-dai-2": "lam-dai-nhi",
  "lam-dai-tam": "lam-dai-tam",
  "lam-dai-3": "lam-dai-tam",

  "hoang-dai": "hoang-dai",
  "hoang-dai-1": "hoang-dai-nhat",
  "hoang-dai-nhat": "hoang-dai-nhat",
  "hoang-dai-nhi": "hoang-dai-nhi",
  "hoang-dai-2": "hoang-dai-nhi",
  "hoang-dai-tam": "hoang-dai-tam",
  "hoang-dai-3": "hoang-dai-tam",

  "hong-dai": "hong-dai",
  "hong-dai-1": "hong-dai-nhat",
  "hong-dai-nhat": "hong-dai-nhat",
  "hong-dai-nhi": "hong-dai-nhi",
  "hong-dai-2": "hong-dai-nhi",
  "hong-dai-tam": "hong-dai-tam",
  "hong-dai-3": "hong-dai-tam",
  "hong-dai-tu": "hong-dai-tu",
  "hong-dai-4": "hong-dai-tu",

  // Legacy aliases from previous app versions.
  "huyen-dai": "hong-dai",
  "huyen-dai-nhat": "hong-dai-nhat",
  "huyen-dai-nhi": "hong-dai-nhi",
  "huyen-dai-tam": "hong-dai-tam",
  "huyen-dai-tu": "hong-dai-tu",
};

export function isKnownBeltId(id) {
  return BELT_ORDER.includes(String(id || "").trim());
}

export function tryNormalizeBeltId(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  if (isKnownBeltId(raw)) return raw;

  const key = normalizeAliasKey(raw);
  if (isKnownBeltId(key)) return key;

  const mapped = BELT_ALIAS_MAP[key];
  if (mapped && isKnownBeltId(mapped)) return mapped;

  return "";
}

export function normalizeBeltId(input) {
  return tryNormalizeBeltId(input) || BELT_ORDER[0];
}

export function beltRank(id) {
  const safe = normalizeBeltId(id);
  const idx = BELT_ORDER.indexOf(safe);
  return idx < 0 ? 0 : idx;
}

export function isBeltAllowed({ userBeltId, docBeltId }) {
  const userRank = beltRank(userBeltId);
  const doc = String(docBeltId || "").trim();
  if (!doc) return true;

  const safeDoc = normalizeBeltId(doc);
  return userRank >= beltRank(safeDoc);
}