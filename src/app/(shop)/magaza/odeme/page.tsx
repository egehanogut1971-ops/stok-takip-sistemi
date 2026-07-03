import Link from "next/link";
import { CheckoutForm } from "@/components/shop/CheckoutForm";

export default function OdemePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ödeme</h1>
        <p className="mt-2 text-slate-600">
          Teslimat bilgilerinizi girin ve siparişi tamamlayın.
        </p>
      </div>
      <CheckoutForm />
      <Link href="/magaza/sepet" className="inline-block text-emerald-700 hover:underline">
        ← Sepete dön
      </Link>
    </div>
  );
}
