"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MOVEMENT_TYPES } from "@/lib/constants";

type Product = {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  category: { name: string };
};

export default function StockInPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        type: MOVEMENT_TYPES.GIRIS,
        quantity: Number(quantity),
        note,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Kayıt başarısız.");
      return;
    }

    setSuccess("Stok girişi kaydedildi.");
    setQuantity("");
    setNote("");
    router.refresh();
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stok Girişi</h1>
        <p className="mt-1 text-lg text-slate-600">Tedarikten gelen ürünleri kaydedin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-base font-medium">Ürün</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-lg"
            required
          >
            <option value="">Ürün seçin</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.currentStock} {p.unit}) — {p.category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-base font-medium">Miktar</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-lg"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-base font-medium">Not (isteğe bağlı)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-lg"
            placeholder="Örn: Tedarikçiden 50 adet geldi"
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 p-3 text-green-700">{success}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-3 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Stok Girişi Kaydet"}
        </button>
      </form>
    </div>
  );
}
