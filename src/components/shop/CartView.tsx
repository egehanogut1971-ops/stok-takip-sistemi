"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function CartView() {
  const router = useRouter();
  const [items, setItems] = useState<CartLine[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCart() {
    setLoading(true);
    const res = await fetch("/api/shop/cart");
    const data = await res.json();
    setItems(data.items ?? []);
    setSubtotal(data.subtotal ?? 0);
    setShippingCost(data.shippingCost ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
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
    router.refresh();
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
    router.refresh();
  }

  if (loading) {
    return <p className="text-slate-600">Sepet yükleniyor...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-lg text-slate-600">Sepetiniz boş.</p>
        <Link
          href="/magaza"
          className="mt-4 inline-block text-emerald-700 hover:underline"
        >
          Alışverişe başla
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productSizeId}
            className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Görsel yok
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link
                  href={`/magaza/urun/${item.slug}`}
                  className="font-semibold text-slate-900 hover:text-emerald-700"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-slate-600">Beden: {item.size}</p>
                <p className="text-sm text-slate-600">
                  Birim: {formatCurrency(item.unitPrice)}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
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
                  className="w-20 rounded-lg border px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productSizeId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Kaldır
                </button>
              </div>
            </div>

            <div className="text-right font-semibold">
              {formatCurrency(item.lineTotal)}
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Sipariş Özeti</h2>
        <div className="mt-4 space-y-2 text-slate-700">
          <div className="flex justify-between">
            <span>Ara toplam</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kargo</span>
            <span>{formatCurrency(shippingCost)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
            <span>Toplam</span>
            <span>{formatCurrency(subtotal + shippingCost)}</span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <Link
          href="/magaza/odeme"
          className="mt-6 block rounded-full bg-emerald-600 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Ödemeye Geç
        </Link>
      </aside>
    </div>
  );
}
