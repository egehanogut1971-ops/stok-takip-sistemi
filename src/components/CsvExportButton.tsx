"use client";

import { calcProfit, formatCurrency, formatPercent } from "@/lib/profit";
import type { StockRow } from "@/components/StockTable";

export function CsvExportButton({ rows }: { rows: StockRow[] }) {
  function handleExport() {
    const header = "ad,kategori,beden,stok,alis,satis,kar,marj";
    const csvRows = rows.map((r) => {
      const { unitProfit, margin } = calcProfit(r.salePrice, r.costPrice);
      return [
        r.name,
        r.category.name,
        r.size,
        r.currentStock,
        r.costPrice,
        r.salePrice,
        unitProfit.toFixed(2),
        margin.toFixed(1),
      ].join(",");
    });

    const csv = [header, ...csvRows].join("\n");
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
