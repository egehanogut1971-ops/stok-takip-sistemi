"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/profit";

type CartLine = {
  productSizeId: string;
  quantity: number;
  productName: string;
  size: string;
  unitPrice: number;
  lineTotal: number;
  maxStock: number;
  slug: string;
  imageUrl: string | null;
};

type CartViewProps = {
  paymentEnabled?: boolean;
  variant?: "page" | "drawer";
  onCheckout?: () => void;
  onCartUpdate?: () => void;
};

export function CartView({
  paymentEnabled = true,
  variant = "page",
  onCheckout,
  onCartUpdate,
}: CartViewProps) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isDrawer = variant === "drawer";

  async function loadCart() {
    setLoading(true);
    const res = await fetch("/api/shop/cart");
    const data = await res.json();
    setItems(data.items ?? []);
    setSubtotal(data.subtotal ?? 0);
    setShippingCost(data.shippingCost ?? 0);
    setLoading(false);
    onCartUpdate?.();
  }

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateQuantity(productSizeId: string, quantity: number) {
    setError("");
    const res = await fetch("/api/shop/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSizeId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Güncellenemedi.");
      return;
    }
    setItems(data.items ?? []);
    setSubtotal(data.subtotal ?? 0);
    setShippingCost(data.shippingCost ?? 0);
    onCartUpdate?.();
  }

  async function removeItem(productSizeId: string) {
    setError("");
    const res = await fetch("/api/shop/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSizeId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Kaldırılamadı.");
      return;
    }
    setItems(data.items ?? []);
    setSubtotal(data.subtotal ?? 0);
    setShippingCost(data.shippingCost ?? 0);
    onCartUpdate?.();
  }

  if (loading) {
    return <p className="text-sm text-[var(--shop-text-muted)]">Sepet yükleniyor...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[var(--shop-text-muted)]">Sepetiniz boş.</p>
        {!isDrawer && (
          <Link
            href="/magaza"
            className="mt-4 inline-block text-sm uppercase tracking-wider text-[var(--shop-text-primary)] hover:underline"
          >
            Alışverişe başla
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={isDrawer ? "space-y-6" : "grid gap-8 lg:grid-cols-[2fr_1fr]"}>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productSizeId}
            className="flex gap-4 border-b border-[var(--shop-border)] pb-4"
          >
            <div className="h-24 w-20 shrink-0 overflow-hidden bg-[var(--shop-surface-muted)]">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-[var(--shop-text-muted)]">
                  Beden {item.size}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={item.maxStock}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      item.productSizeId,
                      Number(e.target.value) || 1,
                    )
                  }
                  className="shop-input w-16 text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productSizeId)}
                  className="text-xs text-[var(--shop-text-muted)] hover:text-[var(--shop-error)]"
                >
                  Kaldır
                </button>
              </div>
            </div>
            <div className="text-sm font-medium">{formatCurrency(item.lineTotal)}</div>
          </div>
        ))}
      </div>

      <aside className={isDrawer ? "border-t border-[var(--shop-border)] pt-4" : "shop-card p-6"}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--shop-text-muted)]">Ara toplam</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--shop-text-muted)]">Kargo</span>
            <span>{formatCurrency(shippingCost)}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--shop-border)] pt-3 text-base font-medium">
            <span>Toplam</span>
            <span>{formatCurrency(subtotal + shippingCost)}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-[var(--shop-error)]">{error}</p>}

        {isDrawer ? (
          <button
            type="button"
            onClick={onCheckout}
            className="shop-btn-primary mt-6 w-full py-4"
          >
            {paymentEnabled ? "Ödemeye Geç" : "Sipariş Ver"}
          </button>
        ) : (
          <Link
            href="/magaza/odeme"
            className="shop-btn-primary mt-6 block py-4 text-center"
          >
            {paymentEnabled ? "Ödemeye Geç" : "Sipariş Ver"}
          </Link>
        )}
      </aside>
    </div>
  );
}
