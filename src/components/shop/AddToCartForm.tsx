"use client";

import { useState } from "react";
import { useCartDrawer } from "@/components/shop/CartDrawerProvider";

type SizeOption = {
  id: string;
  size: string;
  currentStock: number;
};

export function AddToCartForm({
  sizes,
  disabled,
  compact = false,
}: {
  sizes: SizeOption[];
  disabled?: boolean;
  compact?: boolean;
}) {
  const { openCart, refreshCartCount } = useCartDrawer();
  const availableSizes = sizes.filter((size) => size.currentStock > 0);
  const allSizes = sizes;
  const [productSizeId, setProductSizeId] = useState(
    availableSizes[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedSize = availableSizes.find((size) => size.id === productSizeId);
  const maxQuantity = selectedSize?.currentStock ?? 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/shop/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSizeId, quantity }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Sepete eklenemedi.");
      return;
    }

    await refreshCartCount();
    openCart("cart");
  }

  if (availableSizes.length === 0 || disabled) {
    return (
      <p className="text-sm text-[var(--shop-text-muted)]">
        Bu ürün şu an sepete eklenemez.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-6"}>
      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--shop-text-muted)]">
          Beden Seçin
        </p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => {
            const outOfStock = size.currentStock <= 0;
            const selected = productSizeId === size.id;
            return (
              <button
                key={size.id}
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  if (outOfStock) return;
                  setProductSizeId(size.id);
                  setQuantity(1);
                }}
                className={`size-btn ${
                  outOfStock
                    ? "size-btn-disabled"
                    : selected
                      ? "size-btn-selected"
                      : "hover:border-[var(--shop-accent)]"
                }`}
              >
                {size.size}
              </button>
            );
          })}
        </div>
      </div>

      {!compact && (
        <div className="flex items-center gap-4">
          <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--shop-text-muted)]">
            Adet
          </label>
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.min(maxQuantity, Math.max(1, Number(e.target.value) || 1)),
              )
            }
            className="shop-input w-20 text-center text-sm"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--shop-error)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="shop-btn-primary w-full py-4 disabled:opacity-60"
      >
        {loading ? "Ekleniyor..." : "Sepete Ekle"}
      </button>
    </form>
  );
}
