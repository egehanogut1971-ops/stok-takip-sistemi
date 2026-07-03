import Link from "next/link";
import { CartView } from "@/components/shop/CartView";
import { CheckoutSteps } from "@/components/shop/CheckoutSteps";

export default function SepetPage() {
  return (
    <div className="space-y-8">
      <CheckoutSteps current={1} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sepetim</h1>
        <p className="mt-1 text-slate-600">Seçtiğiniz ürünleri kontrol edin.</p>
      </div>
      <CartView />
      <Link
        href="/magaza"
        className="inline-block text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Alışverişe devam et
      </Link>
    </div>
  );
}
