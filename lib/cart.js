import { readJson, writeJson } from "./storage";

export const CART_KEY = "vovinam_cart_v1";

function normalizeCart(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const productId = String(item.productId || item.id || "").trim();
      const qtyNumber = Number(item.qty);
      const qty = Number.isFinite(qtyNumber) ? Math.round(qtyNumber) : 1;

      if (!productId) return null;
      if (qty <= 0) return null;

      return { productId, qty };
    })
    .filter(Boolean);
}

export function readCart() {
  return normalizeCart(readJson(CART_KEY, []));
}

export function writeCart(items) {
  const safe = normalizeCart(items);
  writeJson(CART_KEY, safe);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vovinam-cart"));
  }

  return safe;
}

export function addToCart(productId, qty = 1) {
  const safeId = String(productId || "").trim();
  const addQtyNumber = Number(qty);
  const addQty = Number.isFinite(addQtyNumber) ? Math.max(1, Math.round(addQtyNumber)) : 1;

  if (!safeId) return readCart();

  const current = readCart();
  const existing = current.find((x) => x.productId === safeId);

  if (existing) {
    const next = current.map((x) =>
      x.productId === safeId ? { ...x, qty: x.qty + addQty } : x
    );
    return writeCart(next);
  }

  return writeCart([...current, { productId: safeId, qty: addQty }]);
}

export function setCartItemQty(productId, qty) {
  const safeId = String(productId || "").trim();
  const qtyNumber = Number(qty);
  const safeQty = Number.isFinite(qtyNumber) ? Math.round(qtyNumber) : 0;

  if (!safeId) return readCart();

  const current = readCart();

  if (safeQty <= 0) {
    return writeCart(current.filter((x) => x.productId !== safeId));
  }

  const next = current.map((x) => (x.productId === safeId ? { ...x, qty: safeQty } : x));
  return writeCart(next);
}

export function clearCart() {
  return writeCart([]);
}

export function cartItemCount(items) {
  const safe = normalizeCart(items);
  return safe.reduce((sum, item) => sum + item.qty, 0);
}
