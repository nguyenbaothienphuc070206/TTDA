import { readJson, writeJson } from "./storage";

export const ORDERS_KEY = "vovinam_orders_v1";

function normalizeOrders(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((order) => {
      if (!order || typeof order !== "object") return null;

      const id = String(order.id || "").trim();
      const createdAt = typeof order.createdAt === "number" ? order.createdAt : Date.now();
      const status = String(order.status || "").trim() || "unknown";
      const items = Array.isArray(order.items) ? order.items : [];
      const totalVndNumber = Number(order.totalVnd);
      const totalVnd = Number.isFinite(totalVndNumber) ? Math.max(0, Math.round(totalVndNumber)) : 0;

      if (!id) return null;

      return {
        id,
        createdAt,
        status,
        items,
        totalVnd,
      };
    })
    .filter(Boolean);
}

export function readOrders() {
  return normalizeOrders(readJson(ORDERS_KEY, []));
}

export function writeOrders(orders) {
  const safe = normalizeOrders(orders);
  writeJson(ORDERS_KEY, safe);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vovinam-orders"));
  }

  return safe;
}

export function createLocalOrder({ items, totalVnd, status }) {
  const orderId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `order_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const next = [
    {
      id: orderId,
      createdAt: Date.now(),
      status: status || "paid_demo",
      items: Array.isArray(items) ? items : [],
      totalVnd: Number(totalVnd) || 0,
    },
    ...readOrders(),
  ];

  writeOrders(next);
  return next[0];
}
