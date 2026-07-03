import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/profit";
import {
  formatShippingAddress,
  getOrderStatusLabel,
  getPublicOrder,
} from "@/lib/orderQueries";
import { ORDER_STATUS } from "@/lib/orders";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await getPublicOrder(orderNumber);

  if (!order) {
    notFound();
  }

  const isPaid = order.status === ORDER_STATUS.ODENDI;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div
        className={`rounded-2xl p-8 text-center ${
          isPaid
            ? "bg-emerald-50 ring-1 ring-emerald-200"
            : "bg-amber-50 ring-1 ring-amber-200"
        }`}
      >
        <h1
          className={`text-2xl font-bold ${
            isPaid ? "text-emerald-900" : "text-amber-900"
          }`}
        >
          {isPaid ? "Ödemeniz alındı!" : "Sipariş kaydedildi"}
        </h1>
        <p
          className={`mt-2 ${isPaid ? "text-emerald-800" : "text-amber-800"}`}
        >
          Sipariş numaranız:{" "}
          <span className="font-mono font-semibold">{order.orderNumber}</span>
        </p>
        <p className="mt-1 text-sm opacity-80">
          Durum: {getOrderStatusLabel(order.status)}
        </p>
        {isPaid && (
          <p className="mt-3 text-sm text-emerald-700">
            Stok otomatik olarak düşürüldü.
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="mb-4 text-lg font-semibold">Sipariş Özeti</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-slate-100 pb-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-slate-500">
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

      <div className="rounded-2xl bg-white p-6 text-sm text-slate-700 ring-1 ring-slate-200">
        <h2 className="mb-2 font-semibold text-slate-900">Teslimat</h2>
        <p>{order.guestName}</p>
        <p>{order.guestEmail}</p>
        <p>{order.guestPhone}</p>
        <p className="mt-2">{formatShippingAddress(order.shippingAddress)}</p>
      </div>

      <Link
        href="/magaza"
        className="block rounded-full bg-emerald-600 py-3.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Mağazaya Dön
      </Link>
    </div>
  );
}
