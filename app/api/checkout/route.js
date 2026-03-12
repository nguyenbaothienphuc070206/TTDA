import { NextResponse } from "next/server";

import { getProductById } from "@/data/store";

function normalizeItems(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const productId = String(item.productId || item.id || "").trim();
      const qtyNumber = Number(item.qty);
      const qty = Number.isFinite(qtyNumber) ? Math.round(qtyNumber) : 0;

      if (!productId) return null;
      if (qty <= 0) return null;

      return { productId, qty };
    })
    .filter(Boolean);
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const items = normalizeItems(body?.items);

  if (!items.length) {
    return NextResponse.json({ error: "Giỏ hàng trống." }, { status: 400 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    return NextResponse.json({ mode: "demo", reason: "stripe_not_configured" });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${baseUrl}/cua-hang?success=1`);
  params.set("cancel_url", `${baseUrl}/cua-hang?cancel=1`);

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const product = getProductById(item.productId);

    if (!product) {
      return NextResponse.json(
        { error: `Không tìm thấy sản phẩm: ${item.productId}` },
        { status: 400 }
      );
    }

    const unitAmount = Math.max(0, Math.round(Number(product.priceVnd) || 0));

    params.set(`line_items[${i}][price_data][currency]`, "vnd");
    params.set(`line_items[${i}][price_data][product_data][name]`, product.name);
    params.set(`line_items[${i}][price_data][unit_amount]`, String(unitAmount));
    params.set(`line_items[${i}][quantity]`, String(item.qty));
  }

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await stripeRes.json().catch(() => null);

  if (!stripeRes.ok) {
    const message =
      data && data.error && typeof data.error.message === "string"
        ? data.error.message
        : "Stripe trả về lỗi.";

    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!data || typeof data.url !== "string" || !data.url) {
    return NextResponse.json({ error: "Stripe không trả về URL checkout." }, { status: 502 });
  }

  return NextResponse.json({ mode: "stripe", url: data.url });
}
