import { getStockRows } from "@/lib/stockRows";
import { StockTable } from "@/components/StockTable";

export default async function AlertsPage() {
  const lowStock = await getStockRows({ lowStockOnly: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Düşük Stok Uyarıları</h1>
        <p className="mt-1 text-lg text-slate-600">
          Yeniden almanız gereken bedenler ({lowStock.length})
        </p>
      </div>

      {lowStock.length === 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-lg text-green-800">
          Tüm bedenler yeterli stok seviyesinde.
        </div>
      ) : (
        <StockTable rows={lowStock} />
      )}
    </div>
  );
}
