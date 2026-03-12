import { NextResponse } from "next/server";

export async function GET(request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe chưa được cấu hình." }, { status: 400 });
  }

  const url = new URL(request.url);
  const sessionId = String(url.searchParams.get("session_id") || "").trim();

  if (!sessionId) {
    return NextResponse.json({ error: "Thiếu session_id." }, { status: 400 });
  }

  const stripeRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
      },
    }
  );

  const data = await stripeRes.json().catch(() => null);

  if (!stripeRes.ok) {
    const message =
      data && data.error && typeof data.error.message === "string"
        ? data.error.message
        : "Stripe trả về lỗi.";

    return NextResponse.json({ error: message }, { status: 502 });
  }

  const metadata = data && typeof data.metadata === "object" ? data.metadata : {};
  let items = [];
  try {
    items = JSON.parse(String(metadata.items_json || "[]"));
  } catch {
    items = [];
  }

  return NextResponse.json({
    id: data?.id || sessionId,
    payment_status: String(data?.payment_status || ""),
    amount_total: typeof data?.amount_total === "number" ? data.amount_total : null,
    currency: String(data?.currency || ""),
    items: Array.isArray(items) ? items : [],
  });
}