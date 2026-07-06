"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/profit";
import Link from "next/link";

type CheckoutFormProps = {
  paymentEnabled?: boolean;
  variant?: "page" | "drawer";
  onBack?: () => void;
  onSuccess?: () => void;
};

export function CheckoutForm({
  paymentEnabled = true,
  variant = "page",
  onBack,
  onSuccess,
}: CheckoutFormProps) {
  const router = useRouter();
  const isDrawer = variant === "drawer";
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    city: "",
    district: "",
    line: "",
    postalCode: "",
  });

  useEffect(() => {
    fetch("/api/shop/cart")
      .then((res) => res.json())
      .then((data) => {
        setSubtotal(data.subtotal ?? 0);
        setShippingCost(data.shippingCost ?? 0);
        setLoading(false);
        if ((data.items ?? []).length === 0) {
          if (isDrawer && onBack) {
            onBack();
          } else if (!isDrawer) {
            router.replace("/magaza/sepet");
          }
        }
      })
      .catch(() => {
        setLoading(false);
        if (!isDrawer) router.replace("/magaza/sepet");
      });
  }, [router, isDrawer, onBack]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Mesafeli satış sözleşmesini onaylamalısınız.");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/shop/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        shippingAddress: {
          city: form.city,
          district: form.district,
          line: form.line,
          postalCode: form.postalCode || undefined,
        },
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Sipariş oluşturulamadı.");
      return;
    }

    onSuccess?.();

    if (data.paymentEnabled === false) {
      router.push(`/magaza/siparis/${data.orderNumber}`);
    } else {
      router.push(`/magaza/odeme/${data.orderNumber}`);
    }
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-[var(--shop-text-muted)]">Yükleniyor...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={isDrawer ? "space-y-6" : "grid gap-8 lg:grid-cols-[2fr_1fr]"}>
      <div className="space-y-4">
        {isDrawer && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs uppercase tracking-wider text-[var(--shop-text-muted)] hover:text-[var(--shop-text-primary)]"
          >
            ← Sepete dön
          </button>
        )}

        <input
          placeholder="Ad Soyad"
          value={form.guestName}
          onChange={(e) => setForm({ ...form, guestName: e.target.value })}
          className="shop-input w-full text-sm"
          required
        />
        <input
          type="email"
          placeholder="E-posta"
          value={form.guestEmail}
          onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
          className="shop-input w-full text-sm"
          required
        />
        <input
          placeholder="Telefon"
          value={form.guestPhone}
          onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
          className="shop-input w-full text-sm"
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="İl"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="shop-input text-sm"
            required
          />
          <input
            placeholder="İlçe"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            className="shop-input text-sm"
            required
          />
        </div>
        <textarea
          placeholder="Açık adres"
          value={form.line}
          onChange={(e) => setForm({ ...form, line: e.target.value })}
          rows={3}
          className="shop-input w-full text-sm"
          required
        />

        <label className="flex items-start gap-3 text-xs text-[var(--shop-text-muted)]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <Link href="/magaza/mesafeli-satis" target="_blank" className="underline">
              Mesafeli satış sözleşmesini
            </Link>{" "}
            kabul ediyorum.
          </span>
        </label>
      </div>

      <aside className={isDrawer ? "border-t border-[var(--shop-border)] pt-4" : "shop-card p-6"}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Ara toplam</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kargo</span>
            <span>{formatCurrency(shippingCost)}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--shop-border)] pt-3 font-medium">
            <span>Toplam</span>
            <span>{formatCurrency(subtotal + shippingCost)}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-[var(--shop-error)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="shop-btn-primary mt-6 w-full py-4 disabled:opacity-60"
        >
          {submitting
            ? "Hazırlanıyor..."
            : paymentEnabled
              ? "Ödemeye Geç"
              : "Siparişi Tamamla"}
        </button>
      </aside>
    </form>
  );
}
