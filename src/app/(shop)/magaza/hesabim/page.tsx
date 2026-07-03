import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/profit";
import { getOrderStatusLabel } from "@/lib/orderQueries";
import { ROLES } from "@/lib/roles";

export default async function HesabimPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== ROLES.CUSTOMER) {
    redirect("/magaza/giris?callbackUrl=/magaza/hesabim");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--shop-text-primary)]">
          Hesabım
        </h1>
        <p className="mt-2 text-[var(--shop-text-muted)]">
          Profil bilgileriniz ve sipariş geçmişiniz
        </p>
      </div>

      <div className="shop-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--shop-text-primary)]">
          Profil
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--shop-text-muted)]">Ad Soyad</dt>
            <dd className="font-medium">{session.user.name}</dd>
          </div>
          {session.user.email && (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--shop-text-muted)]">E-posta</dt>
              <dd className="font-medium">{session.user.email}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="shop-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--shop-text-primary)]">
          Siparişlerim
        </h2>
        {orders.length === 0 ? (
          <p className="text-[var(--shop-text-muted)]">
            Henüz siparişiniz yok.{" "}
            <Link href="/magaza" className="text-[var(--shop-accent)] hover:underline">
              Alışverişe başlayın
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-[var(--shop-border)]">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <Link
                    href={`/magaza/hesabim/siparisler/${order.orderNumber}`}
                    className="font-mono font-semibold text-[var(--shop-text-primary)] hover:text-[var(--shop-accent)]"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--shop-text-muted)]">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")} ·{" "}
                    {getOrderStatusLabel(order.status)}
                  </p>
                </div>
                <span className="font-semibold">{formatCurrency(order.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
