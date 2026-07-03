"use client";

import {
  calcProfit,
  formatCurrency,
  formatPercent,
  getStockStatus,
  STOCK_STATUS_CLASSES,
  STOCK_STATUS_LABELS,
} from "@/lib/profit";

export type StockRow = {
  productSizeId: string;
  productId: string;
  name: string;
  size: string;
  sku: string | null;
  costPrice: number;
  salePrice: number;
  minStock: number;
  currentStock: number;
  category: { id: string; name: string };
};

export function StockTable({ rows }: { rows: StockRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-lg text-slate-500">
        Gösterilecek ürün yok.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-base">
        <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3">Ürün</th>
            <th className="px-4 py-3">Beden</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Stok</th>
            <th className="px-4 py-3">Alış</th>
            <th className="px-4 py-3">Satış</th>
            <th className="px-4 py-3">Kar</th>
            <th className="px-4 py-3">Marj</th>
            <th className="px-4 py-3">Durum</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { unitProfit, margin } = calcProfit(
              row.salePrice,
              row.costPrice,
            );
            const status = getStockStatus(row.currentStock, row.minStock);

            return (
              <tr key={row.productSizeId} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">{row.size}</td>
                <td className="px-4 py-3">{row.category.name}</td>
                <td className="px-4 py-3 font-semibold">
                  {row.currentStock} adet
                </td>
                <td className="px-4 py-3">{formatCurrency(row.costPrice)}</td>
                <td className="px-4 py-3">{formatCurrency(row.salePrice)}</td>
                <td className="px-4 py-3">{formatCurrency(unitProfit)}</td>
                <td className="px-4 py-3">{formatPercent(margin)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${STOCK_STATUS_CLASSES[status]}`}
                  >
                    {STOCK_STATUS_LABELS[status]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StockSummary({ rows }: { rows: StockRow[] }) {
  const totalItems = rows.reduce((sum, r) => sum + r.currentStock, 0);
  const totalValue = rows.reduce(
    (sum, r) => sum + r.currentStock * r.costPrice,
    0,
  );
  const uniqueProducts = new Set(rows.map((r) => r.productId)).size;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Ürün Çeşidi</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          {uniqueProducts}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Toplam Adet</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{totalItems}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Stok Değeri</p>
        <p className="mt-1 text-3xl font-bold text-emerald-700">
          {formatCurrency(totalValue)}
        </p>
      </div>
    </div>
  );
}
