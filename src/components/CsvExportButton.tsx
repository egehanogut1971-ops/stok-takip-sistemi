"use client";

import { calcProfit, formatCurrency, formatPercent } from "@/lib/profit";
import type { ProductRow } from "@/components/StockTable";

export function CsvExportButton({ products }: { products: ProductRow[] }) {
  function handleExport() {
    const header =
      "ad,kategori,stok,birim,alis,satis,kar,marj";
    const rows = products.map((p) => {
      const { unitProfit, margin } = calcProfit(p.salePrice, p.costPrice);
      return [
        p.name,
        p.category.name,
        p.currentStock,
        p.unit,
        p.costPrice,
        p.salePrice,
        unitProfit.toFixed(2),
        margin.toFixed(1),
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stok-listesi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-slate-300 px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
    >
      CSV İndir
    </button>
  );
}
