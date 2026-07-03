"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/profit";
import Link from "next/link";

export function CheckoutForm() {
  const router = useRouter();
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
          router.replace("/magaza/sepet");
        }
      })
      .catch(() => {
        setLoading(false);
        router.replace("/magaza/sepet");
      });
  }, [router]);

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

    router.push(`/magaza/odeme/${data.orderNumber}`);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-200">
        <p className="text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Teslimat Bilgileri
        </h2>

        <input
          placeholder="Ad Soyad"
          value={form.guestName}
          onChange={(e) => setForm({ ...form, guestName: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          required
        />
        <input
          type="email"
          placeholder="E-posta"
          value={form.guestEmail}
          onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          required
        />
        <input
          placeholder="Telefon (05xx xxx xx xx)"
          value={form.guestPhone}
          onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            placeholder="İl"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            required
          />
          <input
            placeholder="İlçe"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>
        <textarea
          placeholder="Açık adres"
          value={form.line}
          onChange={(e) => setForm({ ...form, line: e.target.value })}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          required
        />

        <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            <Link
              href="/magaza/mesafeli-satis"
              target="_blank"
              className="font-medium text-emerald-700 hover:underline"
            >
              Mesafeli satış sözleşmesini
            </Link>{" "}
            ve{" "}
            <Link
              href="/magaza/gizlilik"
              target="_blank"
              className="font-medium text-emerald-700 hover:underline"
            >
              gizlilik politikasını
            </Link>{" "}
            okudum, kabul ediyorum.
          </span>
        </label>
      </div>

      <aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Sipariş Özeti</h2>
        <div className="mt-4 space-y-2 text-slate-700">
          <div className="flex justify-between text-sm">
            <span>Ara toplam</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Kargo</span>
            <span>{formatCurrency(shippingCost)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
            <span>Toplam</span>
            <span>{formatCurrency(subtotal + shippingCost)}</span>
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          Sonraki adımda iyzico ile güvenli kart ödemesi yapılır. Ödeme
          onaylandığında stok otomatik düşer.
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Hazırlanıyor..." : "Ödemeye Geç"}
        </button>
      </aside>
    </form>
  );
}
