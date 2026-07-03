import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/profit";
import {
  formatShippingAddress,
  getOrderStatusLabel,
  getPublicOrder,
} from "@/lib/orderQueries";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await getPublicOrder(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-emerald-900">
          Siparişiniz alındı
        </h1>
        <p className="mt-2 text-emerald-800">
          Sipariş numaranız:{" "}
          <span className="font-mono font-semibold">{order.orderNumber}</span>
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          Durum: {getOrderStatusLabel(order.status)}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Sipariş Özeti</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-slate-100 pb-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-slate-600">
                  {item.size} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatCurrency(item.lineTotal)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
          <div className="flex justify-between text-sm">
            <span>Ara toplam</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Kargo</span>
            <span>{formatCurrency(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Toplam</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
        <h2 className="mb-2 font-semibold text-slate-900">Teslimat</h2>
        <p>{order.guestName}</p>
        <p>{order.guestEmail}</p>
        <p>{order.guestPhone}</p>
        <p className="mt-2">{formatShippingAddress(order.shippingAddress)}</p>
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Kart ile online ödeme Faz 3&apos;te eklenecek. Siparişiniz şu an
        &quot;Ödeme Bekliyor&quot; durumunda kaydedildi.
      </p>

      <div className="flex gap-4">
        <Link
          href="/magaza"
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Mağazaya Dön
        </Link>
      </div>
    </div>
  );
}
