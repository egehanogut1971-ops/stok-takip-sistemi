import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/profit";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "@/lib/orders";
import { getStockRows } from "@/lib/stockRows";

const PAID_STATUSES = [
  ORDER_STATUS.ODENDI,
  ORDER_STATUS.HAZIRLANIYOR,
  ORDER_STATUS.KARGODA,
  ORDER_STATUS.TESLIM_EDILDI,
];

const PENDING_STATUSES = [
  ORDER_STATUS.BEKLEMEDE,
  ORDER_STATUS.ODENDI,
  ORDER_STATUS.HAZIRLANIYOR,
];

export default async function PanelDashboardPage() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [todayOrders, weekOrders, pendingCount, recentOrders, lowStock] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfDay },
          status: { not: ORDER_STATUS.IPTAL },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfWeek },
          status: { not: ORDER_STATUS.IPTAL },
        },
      }),
      prisma.order.count({
        where: { status: { in: PENDING_STATUSES } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      getStockRows({ lowStockOnly: true }),
    ]);

  const todayRevenue = todayOrders
    .filter((o) => PAID_STATUSES.includes(o.status as (typeof PAID_STATUSES)[number]))
    .reduce((sum, o) => sum + o.total, 0);

  const weekRevenue = weekOrders
    .filter((o) => PAID_STATUSES.includes(o.status as (typeof PAID_STATUSES)[number]))
    .reduce((sum, o) => sum + o.total, 0);

  const cards = [
    {
      label: "Bugün sipariş",
      value: String(todayOrders.length),
      sub: formatCurrency(todayRevenue),
    },
    {
      label: "Son 7 gün",
      value: String(weekOrders.length),
      sub: formatCurrency(weekRevenue),
    },
    {
      label: "Bekleyen sipariş",
      value: String(pendingCount),
      sub: "işlem gerektiren",
    },
    {
      label: "Düşük stok",
      value: String(lowStock.length),
      sub: "beden uyarısı",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel Özeti</h1>
        <p className="mt-1 text-lg text-slate-600">
          Mağaza ve stok durumuna hızlı bakış
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm text-emerald-700">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Son Siparişler</h2>
            <Link
              href="/panel/siparisler"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-slate-600">Henüz sipariş yok.</p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ORDER_STATUS_LABELS[
                        order.status as keyof typeof ORDER_STATUS_LABELS
                      ] ?? order.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Düşük Stok</h2>
            <Link
              href="/panel/uyarilar"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Tüm uyarılar
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-green-700">Tüm bedenler yeterli seviyede.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowStock.slice(0, 5).map((row) => (
                <li key={row.productSizeId} className="flex justify-between">
                  <span>
                    {row.name} ({row.size})
                  </span>
                  <span className="font-medium text-amber-700">
                    {row.currentStock} adet
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/panel/stok"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Stok Tablosu
        </Link>
        <Link
          href="/panel/siparisler"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Siparişler
        </Link>
        <Link
          href="/magaza/yonetim"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Mağaza Yönetimi
        </Link>
      </div>
    </div>
  );
}
