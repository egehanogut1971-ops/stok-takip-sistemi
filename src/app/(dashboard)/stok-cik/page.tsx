"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MOVEMENT_TYPES } from "@/lib/constants";

type StockRowOption = {
  productSizeId: string;
  name: string;
  size: string;
  currentStock: number;
  category: { name: string };
};

export default function StockOutPage() {
  const router = useRouter();
  const [rows, setRows] = useState<StockRowOption[]>([]);
  const [productSizeId, setProductSizeId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function loadRows() {
    fetch("/api/products?view=rows")
      .then((r) => r.json())
      .then(setRows);
  }

  useEffect(() => {
    loadRows();
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
        productSizeId,
        type: MOVEMENT_TYPES.CIKIS,
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

    setSuccess("Stok çıkışı kaydedildi.");
    setQuantity("");
    setNote("");
    router.refresh();
    loadRows();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stok Çıkışı</h1>
        <p className="mt-1 text-lg text-slate-600">Satış veya çıkış kaydı yapın</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-base font-medium">Ürün / Beden</label>
          <select
            value={productSizeId}
            onChange={(e) => setProductSizeId(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-lg"
            required
          >
            <option value="">Beden seçin</option>
            {rows.map((r) => (
              <option key={r.productSizeId} value={r.productSizeId}>
                {r.name} — {r.size} ({r.currentStock} adet)
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
            placeholder="Örn: Müşteriye satış"
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 p-3 text-green-700">{success}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 py-3 text-lg font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Stok Çıkışı Kaydet"}
        </button>
      </form>
    </div>
  );
}
