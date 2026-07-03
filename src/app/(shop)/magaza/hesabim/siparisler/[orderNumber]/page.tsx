import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/profit";
import {
  formatShippingAddress,
  getCustomerOrder,
  getOrderStatusLabel,
} from "@/lib/orderQueries";
import { getTrackingUrl, ORDER_STATUS } from "@/lib/orders";
import { ROLES } from "@/lib/roles";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default async function CustomerOrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== ROLES.CUSTOMER) {
    redirect("/magaza/giris?callbackUrl=/magaza/hesabim");
  }

  const { orderNumber } = await params;
  const order = await getCustomerOrder(orderNumber, session.user.id);

  if (!order) {
    notFound();
  }

  const trackingUrl = getTrackingUrl(order.carrier, order.trackingNumber);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/magaza/hesabim"
        className="text-sm text-[var(--shop-text-muted)] hover:text-[var(--shop-accent)]"
      >
        ← Hesabıma dön
      </Link>

      <div className="shop-card p-6">
        <h1 className="text-xl font-semibold text-[var(--shop-text-primary)]">
          Sipariş {order.orderNumber}
        </h1>
        <p className="mt-2 text-sm text-[var(--shop-text-muted)]">
          {new Date(order.createdAt).toLocaleString("tr-TR")} ·{" "}
          {getOrderStatusLabel(order.status)}
        </p>

        {order.status === ORDER_STATUS.KARGODA && order.trackingNumber && (
          <div className="mt-4 rounded-xl bg-[var(--shop-surface-muted)] p-4 text-sm">
            <p className="font-medium text-[var(--shop-text-primary)]">Kargo takip</p>
            {order.carrier && (
              <p className="mt-1 text-[var(--shop-text-muted)]">
                Firma: {order.carrier}
              </p>
            )}
            <p className="mt-1 font-mono">{order.trackingNumber}</p>
            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-[var(--shop-accent)] hover:underline"
              >
                Kargoyu takip et →
              </a>
            )}
          </div>
        )}
      </div>

      <div className="shop-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Ürünler</h2>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between border-b border-[var(--shop-border)] pb-3 text-sm last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-[var(--shop-text-muted)]">
                  {item.size} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatCurrency(item.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-[var(--shop-border)] pt-4">
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

      <div className="shop-card p-6 text-sm">
        <h2 className="mb-2 font-semibold">Teslimat</h2>
        <p>{formatShippingAddress(order.shippingAddress)}</p>
      </div>
    </div>
  );
}
