"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckoutSteps } from "@/components/shop/CheckoutSteps";

export default function PaymentPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initPayment() {
      const res = await fetch("/api/shop/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "Ödeme başlatılamadı.");
        return;
      }

      if (data.checkoutFormContent) {
        const container = document.getElementById("iyzico-checkout");
        if (container) {
          container.innerHTML = data.checkoutFormContent;
          const scripts = container.querySelectorAll("script");
          scripts.forEach((oldScript) => {
            const script = document.createElement("script");
            script.text = oldScript.textContent ?? "";
            oldScript.replaceWith(script);
          });
        }
      }
    }

    initPayment();
  }, [orderNumber]);

  return (
    <div className="space-y-8">
      <CheckoutSteps current={3} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Güvenli Ödeme</h1>
        <p className="mt-1 text-slate-600">
          Sipariş no: <span className="font-mono">{orderNumber}</span>
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-200">
          <p className="text-slate-600">Ödeme formu yükleniyor...</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-red-100">
          <p>{error}</p>
          <Link
            href="/magaza/odeme"
            className="mt-4 inline-block text-sm font-medium underline"
          >
            Geri dön
          </Link>
        </div>
      )}

      <div
        id="iyzico-checkout"
        className="min-h-[400px] rounded-2xl bg-white p-4 ring-1 ring-slate-200"
      />
    </div>
  );
}
