import { createCompatResponder } from "@/lib/api/compatResponse";
import { fetchWithResilience } from "@/lib/api/upstreamResilience";

export async function GET(request) {
  const api = createCompatResponder(request);
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    return api.fail({ message: "Stripe chưa được cấu hình.", code: "NOT_CONFIGURED", status: 400 });
  }

  const url = new URL(request.url);
  const sessionId = String(url.searchParams.get("session_id") || "").trim();

  if (!sessionId) {
    return api.fail({ message: "Thiếu session_id.", code: "VALIDATION_ERROR", status: 400 });
  }

  const stripeReq = await fetchWithResilience(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      service: "stripe_checkout_lookup",
      timeoutMs: 9_000,
      retries: 1,
      method: "GET",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
      },
    }
  );

  if (!stripeReq.ok && !stripeReq.response) {
    return api.fail({
      message: "Không kết nối được Stripe.",
      code: stripeReq.type === "circuit_open" ? "UPSTREAM_CIRCUIT_OPEN" : "UPSTREAM_ERROR",
      status: 502,
    });
  }

  const stripeRes = stripeReq.response;
  if (!stripeRes) {
    return api.fail({ message: "Không kết nối được Stripe.", code: "UPSTREAM_ERROR", status: 502 });
  }

  const data = await stripeRes.json().catch(() => null);

  if (!stripeRes.ok) {
    const message =
      data && data.error && typeof data.error.message === "string"
        ? data.error.message
        : "Stripe trả về lỗi.";

    return api.fail({ message, code: "UPSTREAM_ERROR", status: 502 });
  }

  const metadata = data && typeof data.metadata === "object" ? data.metadata : {};
  let items = [];
  try {
    items = JSON.parse(String(metadata.items_json || "[]"));
  } catch {
    items = [];
  }

  return api.ok({
    id: data?.id || sessionId,
    payment_status: String(data?.payment_status || ""),
    amount_total: typeof data?.amount_total === "number" ? data.amount_total : null,
    currency: String(data?.currency || ""),
    items: Array.isArray(items) ? items : [],
  });
}