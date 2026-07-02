import { prisma } from "@/lib/prisma";
import { StockTable } from "@/components/StockTable";

export default async function AlertsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { currentStock: "asc" },
  });

  const lowStock = products.filter((p) => p.currentStock <= p.minStock);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Düşük Stok Uyarıları</h1>
        <p className="mt-1 text-lg text-slate-600">
          Yeniden almanız gereken ürünler ({lowStock.length})
        </p>
      </div>

      {lowStock.length === 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-lg text-green-800">
          Tüm ürünler yeterli stok seviyesinde.
        </div>
      ) : (
        <StockTable products={lowStock} />
      )}
    </div>
  );
}
