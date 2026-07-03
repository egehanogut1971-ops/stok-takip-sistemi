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
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        Bu ürün şu an sepete eklenemez.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">Sepete Ekle</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Beden</span>
          <select
            value={productSizeId}
            onChange={(e) => {
              setProductSizeId(e.target.value);
              setQuantity(1);
            }}
            className="w-full rounded-lg border px-4 py-3"
          >
            {availableSizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.size} ({size.currentStock} adet)
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Adet</span>
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
            className="w-full rounded-lg border px-4 py-3"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Ekleniyor..." : "Sepete Ekle"}
      </button>
    </form>
  );
}
