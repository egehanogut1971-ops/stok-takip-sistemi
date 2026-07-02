"use client";

import {
  calcProfit,
  formatCurrency,
  formatPercent,
  getStockStatus,
  STOCK_STATUS_CLASSES,
  STOCK_STATUS_LABELS,
} from "@/lib/profit";

export type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  currentStock: number;
  category: { id: string; name: string };
};

export function StockTable({ products }: { products: ProductRow[] }) {
  if (products.length === 0) {
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
          {products.map((product) => {
            const { unitProfit, margin } = calcProfit(
              product.salePrice,
              product.costPrice,
            );
            const status = getStockStatus(
              product.currentStock,
              product.minStock,
            );

            return (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3 font-semibold">
                  {product.currentStock} {product.unit}
                </td>
                <td className="px-4 py-3">{formatCurrency(product.costPrice)}</td>
                <td className="px-4 py-3">{formatCurrency(product.salePrice)}</td>
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

export function StockSummary({ products }: { products: ProductRow[] }) {
  const totalItems = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.costPrice,
    0,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Ürün Çeşidi</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          {products.length}
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
