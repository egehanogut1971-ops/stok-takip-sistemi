import Link from "next/link";
import { CartView } from "@/components/shop/CartView";

export default function SepetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sepetim</h1>
        <p className="mt-2 text-slate-600">Seçtiğiniz ürünleri kontrol edin.</p>
      </div>
      <CartView />
      <Link href="/magaza" className="inline-block text-emerald-700 hover:underline">
        ← Alışverişe devam et
      </Link>
    </div>
  );
}
