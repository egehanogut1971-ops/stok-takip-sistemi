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
      <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700 ring-1 ring-red-100">
        Bu ürün şu an sepete eklenemez.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 ring-1 ring-slate-200"
    >
      <h2 className="font-semibold text-slate-900">Sepete Ekle</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {availableSizes.map((size) => (
          <button
            key={size.id}
            type="button"
            onClick={() => {
              setProductSizeId(size.id);
              setQuantity(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              productSizeId === size.id
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {size.size}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Adet</label>
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
          className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-center"
        />
        <span className="text-xs text-slate-500">Max {maxQuantity}</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Ekleniyor..." : "Sepete Ekle"}
      </button>
    </form>
  );
}
