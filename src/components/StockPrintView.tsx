"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  calcProfit,
  formatCurrency,
  formatPercent,
} from "@/lib/profit";
import type { ProductRow } from "@/components/StockTable";

export function StockPrintActions({
  products,
  categoryName,
}: {
  products: ProductRow[];
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
          "Kategori",
          "Stok",
          "Alış",
          "Satış",
          "Kar",
          "Marj",
        ],
      ],
      body: products.map((p) => {
        const { unitProfit, margin } = calcProfit(p.salePrice, p.costPrice);
        return [
          p.name,
          p.category.name,
          `${p.currentStock} ${p.unit}`,
          formatCurrency(p.costPrice),
          formatCurrency(p.salePrice),
          formatCurrency(unitProfit),
          formatPercent(margin),
        ];
      }),
      styles: { fontSize: 9 },
    });

    const fileName = `stok-listesi-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }

  const totalItems = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.costPrice,
    0,
  );

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
              <th className="p-2 text-left">Kategori</th>
              <th className="p-2 text-left">Stok</th>
              <th className="p-2 text-left">Alış</th>
              <th className="p-2 text-left">Satış</th>
              <th className="p-2 text-left">Kar</th>
              <th className="p-2 text-left">Marj</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const { unitProfit, margin } = calcProfit(
                p.salePrice,
                p.costPrice,
              );
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.category.name}</td>
                  <td className="p-2">
                    {p.currentStock} {p.unit}
                  </td>
                  <td className="p-2">{formatCurrency(p.costPrice)}</td>
                  <td className="p-2">{formatCurrency(p.salePrice)}</td>
                  <td className="p-2">{formatCurrency(unitProfit)}</td>
                  <td className="p-2">{formatPercent(margin)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-4 text-sm">
          <p>Toplam ürün çeşidi: {products.length}</p>
          <p>Toplam adet: {totalItems}</p>
          <p>Toplam stok değeri: {formatCurrency(totalValue)}</p>
        </div>
      </div>
    </div>
  );
}
