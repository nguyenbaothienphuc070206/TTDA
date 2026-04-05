import { NextResponse } from "next/server";

function asText(value) {
  return String(value || "").trim();
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const productId = asText(body?.productId);

  if (!productId) {
    return NextResponse.json({ ok: false, error: "missing_product_id" }, { status: 400 });
  }

  // For production, persist this to analytics DB or event queue.
  console.log("[affiliate.track]", {
    productId,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, productId });
}
