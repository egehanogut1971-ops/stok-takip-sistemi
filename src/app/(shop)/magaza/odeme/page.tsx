import Link from "next/link";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { CheckoutSteps } from "@/components/shop/CheckoutSteps";
import { isPaymentEnabled } from "@/lib/shopConfig";

export default function OdemePage() {
  const paymentEnabled = isPaymentEnabled();

  return (
    <div className="space-y-8">
      <CheckoutSteps current={2} paymentEnabled={paymentEnabled} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Teslimat Bilgileri</h1>
        <p className="mt-1 text-slate-600">
          {paymentEnabled
            ? "Bilgilerinizi girin ve güvenli ödemeye geçin."
            : "Bilgilerinizi girin ve siparişinizi tamamlayın."}
        </p>
      </div>
      <CheckoutForm paymentEnabled={paymentEnabled} />
      <Link
        href="/magaza/sepet"
        className="inline-block text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Sepete dön
      </Link>
    </div>
  );
}
