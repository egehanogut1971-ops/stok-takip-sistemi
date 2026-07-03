"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SizeOption = {
  id: string;
  size: string;
  currentStock: number;
};

export function AddToCartForm({
  sizes,
  disabled,
}: {
  sizes: SizeOption[];
  disabled?: boolean;
}) {
  const router = useRouter();
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

    router.push("/magaza/sepet");
    router.refresh();
  }

  if (availableSizes.length === 0 || disabled) {
    return (
      <div className="shop-card p-5 text-sm text-[var(--shop-text-muted)]">
        Bu ürün şu an sepete eklenemez.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="shop-card p-6">
      <h2 className="font-semibold text-[var(--shop-text-primary)]">Sepete Ekle</h2>

      <div className="mt-4 flex flex-wrap gap-2">
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
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                outOfStock
                  ? "cursor-not-allowed bg-[var(--shop-surface-muted)] text-[var(--shop-text-faint)] line-through opacity-50"
                  : selected
                    ? "bg-[var(--shop-accent)] text-white"
                    : "bg-[var(--shop-accent-soft)] text-[var(--shop-text-secondary)] hover:bg-[var(--shop-accent-soft)]"
              }`}
            >
              {size.size}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <label className="text-sm font-medium text-[var(--shop-text-secondary)]">
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
          className="shop-input w-20 text-center"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-[var(--shop-error)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="shop-btn-primary mt-6 w-full py-3.5 text-sm disabled:opacity-60"
      >
        {loading ? "Ekleniyor..." : "Sepete Ekle"}
      </button>
    </form>
  );
}
