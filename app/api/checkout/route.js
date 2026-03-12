import { NextResponse } from "next/server";

import { getProductById } from "@/data/store";
import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";

function normalizeItems(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const productId = String(item.productId || item.id || "").trim().slice(0, 64);
      const qtyNumber = Number(item.qty);
      const qty = Number.isFinite(qtyNumber) ? Math.round(qtyNumber) : 0;

      if (!productId) return null;
      if (qty <= 0) return null;

      return { productId, qty: Math.min(99, qty) };
    })
    .filter(Boolean);
}

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  if (isBodyTooLarge(request, 50_000)) {
    return NextResponse.json({ error: "Body quá lớn." }, { status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "checkout",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rl.ok) {
    const res = NextResponse.json(
      { error: "Thao tác quá nhanh. Vui lòng thử lại sau." },
      { status: 429 }
    );
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
  }

  const items = normalizeItems(body?.items);

  if (items.length > 20) {
    return NextResponse.json(
      { error: "Giỏ hàng quá lớn. Tối đa 20 sản phẩm." },
      { status: 400 }
    );
  }

  if (!items.length) {
    return NextResponse.json({ error: "Giỏ hàng trống." }, { status: 400 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    const res = NextResponse.json({ mode: "demo", reason: "stripe_not_configured" });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${baseUrl}/cua-hang?success=1&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${baseUrl}/cua-hang?cancel=1`);

  // Keep a compact copy of the cart so the client can rebuild the order after redirect.
  // (Stripe metadata values are strings and have length limits; keep it short.)
  const itemsJson = JSON.stringify(items);
  if (itemsJson.length > 480) {
    return NextResponse.json(
      { error: "Giỏ hàng quá lớn để xử lý an toàn. Hãy giảm số lượng sản phẩm." },
      { status: 400 }
    );
  }
  params.set("metadata[items_json]", itemsJson);

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let stripeRes;
  try {
    stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    });
  } catch {
    return NextResponse.json(
      { error: "Không kết nối được Stripe. Vui lòng thử lại." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }

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

  const res = NextResponse.json({ mode: "stripe", url: data.url });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
