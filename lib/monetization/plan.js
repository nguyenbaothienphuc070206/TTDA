export function isPremiumPlan(plan) {
  const p = String(plan || "").toLowerCase();
  return p === "premium" || p === "pro" || p === "elite";
}

export function shouldShowUpgrade({ aiUsedToday = 0, plan = "free" } = {}) {
  if (isPremiumPlan(plan)) return false;
  return Number(aiUsedToday || 0) >= 5;
}

export function recommendStoreByBelt(beltLevel) {
  const b = String(beltLevel || "").toLowerCase();
  if (b.includes("lam")) return ["vo-phuc-basic", "bao-ho-ong-quyen"];
  if (b.includes("hoang")) return ["gang-boxing", "thiet-bi-phuc-hoi"];
  return ["binh-khi-go", "bao-ho-cao-cap"];
}
