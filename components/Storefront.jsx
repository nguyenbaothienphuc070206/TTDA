"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PRODUCTS, formatVnd, getProductById } from "@/data/store";
import { addToCart, clearCart, readCart, setCartItemQty } from "@/lib/cart";
import { createLocalOrder, readOrders, writeOrders } from "@/lib/orders";

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

function MessageBox({ tone, children }) {
  const styles =
    tone === "success"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-50"
      : tone === "error"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-50"
      : "border-white/10 bg-white/5 text-slate-200";

  return <div className={`rounded-2xl border p-4 text-sm ${styles}`}>{children}</div>;
}

export default function Storefront() {
  const searchParams = useSearchParams();

  const [cart, setCart] = useState(() => readCart());
  const [message, setMessage] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [processedSessionId, setProcessedSessionId] = useState("");

  useEffect(() => {
    const sync = () => setCart(readCart());

    sync();
    window.addEventListener("vovinam-cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const success = searchParams?.get("success");
    const cancel = searchParams?.get("cancel");
    const sessionId = String(searchParams?.get("session_id") || "").trim();

    if (cancel === "1") {
      setMessage({ tone: "info", text: "Bạn đã hủy thanh toán." });
      return;
    }

    if (success !== "1") {
      return;
    }

    if (!sessionId) {
      setMessage({
        tone: "success",
        text: "Thanh toán thành công.",
      });
      return;
    }

    if (processedSessionId === sessionId) {
      return;
    }

    setProcessedSessionId(sessionId);

    const run = async () => {
      setMessage({ tone: "info", text: "Đang xác nhận thanh toán Stripe…" });

      try {
        const res = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const err =
            data && typeof data.error === "string" ? data.error : "Không xác nhận được phiên thanh toán.";
          setMessage({ tone: "error", text: err });
          return;
        }

        const paymentStatus = String(data?.payment_status || "");
        if (paymentStatus && paymentStatus !== "paid") {
          setMessage({
            tone: "info",
            text: `Phiên thanh toán đang ở trạng thái: ${paymentStatus}.`,
          });
          return;
        }

        const orderId = `stripe_${sessionId}`;
        const existed = readOrders().some((o) => o && o.id === orderId);

        const rawItems = Array.isArray(data?.items) ? data.items : [];
        const lineItems = rawItems
          .map((it) => {
            if (!it || typeof it !== "object") return null;
            const productId = String(it.productId || "").trim();
            const qtyNumber = Number(it.qty);
            const qty = Number.isFinite(qtyNumber) ? Math.round(qtyNumber) : 0;
            if (!productId || qty <= 0) return null;

            const product = getProductById(productId);
            if (!product) return null;

            return {
              productId: product.id,
              name: product.name,
              qty,
              priceVnd: product.priceVnd,
            };
          })
          .filter(Boolean);

        const computedTotalVnd = lineItems.reduce((sum, l) => sum + l.priceVnd * l.qty, 0);
        const stripeTotal = Number(data?.amount_total);
        const totalVnd = Number.isFinite(stripeTotal)
          ? Math.max(0, Math.round(stripeTotal))
          : computedTotalVnd;

        if (!existed) {
          const next = [
            {
              id: orderId,
              createdAt: Date.now(),
              status: "paid_stripe",
              items: lineItems,
              totalVnd,
            },
            ...readOrders(),
          ];
          writeOrders(next);
        }

        clearCart();
        setCart([]);

        setMessage({
          tone: "success",
          text: `Thanh toán thành công. Đơn hàng đã được ghi nhận: ${orderId}.`,
        });
      } catch {
        setMessage({ tone: "error", text: "Có lỗi mạng khi xác nhận thanh toán." });
      }
    };

    run();
  }, [searchParams, processedSessionId]);

  const lines = useMemo(() => {
    return cart
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;

        return {
          ...product,
          qty: item.qty,
          lineTotalVnd: product.priceVnd * item.qty,
        };
      })
      .filter(Boolean);
  }, [cart]);

  const totalVnd = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.lineTotalVnd, 0);
  }, [lines]);

  const onAdd = (productId) => {
    const next = addToCart(productId, 1);
    setCart(next);
    setMessage({ tone: "success", text: "Đã thêm vào giỏ hàng." });
  };

  const onCheckout = async () => {
    setMessage(null);

    if (lines.length === 0) {
      setMessage({ tone: "info", text: "Giỏ hàng đang trống." });
      return;
    }

    setIsCheckingOut(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const err = data && typeof data.error === "string" ? data.error : "Không tạo được phiên thanh toán.";
        setMessage({ tone: "error", text: err });
        return;
      }

      if (data && typeof data.url === "string" && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data && data.mode === "demo") {
        const order = createLocalOrder({
          items: lines.map((l) => ({
            productId: l.id,
            name: l.name,
            qty: l.qty,
            priceVnd: l.priceVnd,
          })),
          totalVnd,
          status: "paid_demo",
        });

        clearCart();
        setCart([]);

        setMessage({
          tone: "success",
          text: `Đã tạo đơn hàng (demo): ${order.id}. Bạn có thể bật Stripe bằng STRIPE_SECRET_KEY để thanh toán online.`,
        });
        return;
      }

      setMessage({
        tone: "info",
        text: "Chưa bật cổng thanh toán. (Thiếu STRIPE_SECRET_KEY)",
      });
    } catch {
      setMessage({ tone: "error", text: "Có lỗi mạng khi tạo phiên thanh toán." });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:col-span-2">
        <h2 className="text-xl font-semibold text-white">Sản phẩm</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Demo cửa hàng: thêm vào giỏ và thử checkout. (Giỏ hàng lưu trên máy)
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{p.name}</div>
                  <div className="mt-1 text-xs text-slate-300">{p.category}</div>
                </div>

                <div className="text-sm font-semibold text-white">{formatVnd(p.priceVnd)}</div>
              </div>

              {p.badges && p.badges.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.badges.map((b) => (
                    <Pill key={b}>{b}</Pill>
                  ))}
                </div>
              ) : null}

              <p className="mt-3 text-sm leading-6 text-slate-300">{p.summary}</p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => onAdd(p.id)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Giỏ hàng</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Điều chỉnh số lượng và thanh toán.
        </p>

        {message ? (
          <div className="mt-4">
            <MessageBox tone={message.tone}>{message.text}</MessageBox>
          </div>
        ) : null}

        {lines.length ? (
          <div className="mt-4 grid gap-3">
            {lines.map((line) => (
              <div key={line.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{line.name}</div>
                    <div className="mt-1 text-xs text-slate-300">{formatVnd(line.priceVnd)} / món</div>
                  </div>

                  <div className="text-sm font-semibold text-white">{formatVnd(line.lineTotalVnd)}</div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = setCartItemQty(line.id, line.qty - 1);
                        setCart(next);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                      aria-label={`Giảm số lượng ${line.name}`}
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold text-white">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = setCartItemQty(line.id, line.qty + 1);
                        setCart(next);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                      aria-label={`Tăng số lượng ${line.name}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = setCartItemQty(line.id, 0);
                      setCart(next);
                    }}
                    className="text-xs font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-200">Tổng</span>
                <span className="text-lg font-semibold text-white">{formatVnd(totalVnd)}</span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                disabled={isCheckingOut}
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                {isCheckingOut ? "Đang tạo phiên thanh toán…" : "Thanh toán online"}
              </button>
              <p className="mt-2 text-xs leading-5 text-slate-300">
                Nếu chưa cấu hình Stripe, hệ thống sẽ tạo đơn hàng demo để bạn xem luồng.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
            Chưa có sản phẩm nào trong giỏ.
          </div>
        )}
      </aside>
    </div>
  );
}
