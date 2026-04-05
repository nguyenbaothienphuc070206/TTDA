export async function trackClick(productId) {
  const safeProductId = String(productId || "").trim();
  if (!safeProductId) return { ok: false, reason: "missing_product_id" };

  const res = await fetch("/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId: safeProductId }),
  });

  return res.json();
}
