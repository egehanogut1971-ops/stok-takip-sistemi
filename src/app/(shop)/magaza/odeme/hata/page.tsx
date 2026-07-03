import Link from "next/link";
import { CheckoutSteps } from "@/components/shop/CheckoutSteps";

type PageProps = {
  searchParams: Promise<{ order?: string; reason?: string }>;
};

export default async function PaymentErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-8 text-center">
      <CheckoutSteps current={3} />
      <div className="rounded-2xl bg-red-50 p-10 ring-1 ring-red-100">
        <h1 className="text-2xl font-bold text-red-900">Ödeme Başarısız</h1>
        <p className="mt-3 text-red-700">
          Ödemeniz tamamlanamadı. Stok düşülmedi; tekrar deneyebilirsiniz.
        </p>
        {params.order && (
          <p className="mt-2 text-sm text-red-600">
            Sipariş: <span className="font-mono">{params.order}</span>
          </p>
        )}
      </div>
      <div className="flex justify-center gap-4">
        <Link
          href="/magaza/sepet"
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Sepete Dön
        </Link>
        <Link
          href="/magaza"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Mağaza
        </Link>
      </div>
    </div>
  );
}
