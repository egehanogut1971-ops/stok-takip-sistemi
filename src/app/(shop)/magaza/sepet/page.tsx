import Link from "next/link";
import { CartView } from "@/components/shop/CartView";
import { CheckoutSteps } from "@/components/shop/CheckoutSteps";
import { isPaymentEnabled } from "@/lib/shopConfig";

export default function SepetPage() {
  const paymentEnabled = isPaymentEnabled();

  return (
    <div className="space-y-8">
      <CheckoutSteps current={1} paymentEnabled={paymentEnabled} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sepetim</h1>
        <p className="mt-1 text-slate-600">Seçtiğiniz ürünleri kontrol edin.</p>
      </div>
      <CartView paymentEnabled={paymentEnabled} />
      <Link
        href="/magaza"
        className="inline-block text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Alışverişe devam et
      </Link>
    </div>
  );
}
