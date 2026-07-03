"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  calcProfit,
  formatCurrency,
  formatPercent,
} from "@/lib/profit";
import type { StockRow } from "@/components/StockTable";

export function StockPrintActions({
  rows,
  categoryName,
}: {
  rows: StockRow[];
  categoryName?: string;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  function handlePdf() {
    const doc = new jsPDF({ orientation: "landscape" });
    const date = new Date().toLocaleString("tr-TR");

    doc.setFontSize(16);
    doc.text("Stok Listesi", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tarih: ${date}`, 14, 22);
    if (categoryName) {
      doc.text(`Kategori: ${categoryName}`, 14, 28);
    }

    autoTable(doc, {
      startY: categoryName ? 34 : 28,
      head: [
        [
          "Ürün",
          "Beden",
          "Kategori",
          "Stok",
          "Alış",
          "Satış",
          "Kar",
          "Marj",
        ],
      ],
      body: rows.map((r) => {
        const { unitProfit, margin } = calcProfit(r.salePrice, r.costPrice);
        return [
          r.name,
          r.size,
          r.category.name,
          `${r.currentStock} adet`,
          formatCurrency(r.costPrice),
          formatCurrency(r.salePrice),
          formatCurrency(unitProfit),
          formatPercent(margin),
        ];
      }),
      styles: { fontSize: 9 },
    });

    const fileName = `stok-listesi-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }

  const totalItems = rows.reduce((sum, r) => sum + r.currentStock, 0);
  const totalValue = rows.reduce(
    (sum, r) => sum + r.currentStock * r.costPrice,
    0,
  );
  const uniqueProducts = new Set(rows.map((r) => r.productId)).size;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePrint}
          className="rounded-lg bg-emerald-600 px-5 py-3 text-base font-medium text-white hover:bg-emerald-700"
        >
          Yazdır
        </button>
        <button
          onClick={handlePdf}
          className="rounded-lg border border-emerald-600 px-5 py-3 text-base font-medium text-emerald-700 hover:bg-emerald-50"
        >
          PDF İndir
        </button>
      </div>

      <div ref={printRef} className="print-area hidden print:block">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Stok Listesi</h2>
          <p className="text-slate-600">
            Tarih: {new Date().toLocaleString("tr-TR")}
          </p>
          {categoryName && <p className="text-slate-600">Kategori: {categoryName}</p>}
        </div>
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Ürün</th>
              <th className="p-2 text-left">Beden</th>
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-left">Stok</th>
              <th className="p-2 text-left">Alış</th>
              <th className="p-2 text-left">Satış</th>
              <th className="p-2 text-left">Kar</th>
              <th className="p-2 text-left">Marj</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const { unitProfit, margin } = calcProfit(
                r.salePrice,
                r.costPrice,
              );
              return (
                <tr key={r.productSizeId} className="border-b">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.size}</td>
                  <td className="p-2">{r.category.name}</td>
                  <td className="p-2">{r.currentStock} adet</td>
                  <td className="p-2">{formatCurrency(r.costPrice)}</td>
                  <td className="p-2">{formatCurrency(r.salePrice)}</td>
                  <td className="p-2">{formatCurrency(unitProfit)}</td>
                  <td className="p-2">{formatPercent(margin)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-4 text-sm">
          <p>Toplam ürün çeşidi: {uniqueProducts}</p>
          <p>Toplam adet: {totalItems}</p>
          <p>Toplam stok değeri: {formatCurrency(totalValue)}</p>
        </div>
      </div>
    </div>
  );
}
