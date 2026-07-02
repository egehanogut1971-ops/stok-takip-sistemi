"use client";

import { calcProfit, formatCurrency, formatPercent } from "@/lib/profit";

export function ProfitPreview({
  costPrice,
  salePrice,
}: {
  costPrice: number;
  salePrice: number;
}) {
  const { unitProfit, margin } = calcProfit(salePrice, costPrice);
  const negative = unitProfit < 0;

  return (
    <div
      className={`rounded-lg border p-4 ${
        negative ? "border-red-300 bg-red-50" : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <h3 className="mb-2 text-base font-semibold text-slate-800">
        Kar Önizleme
      </h3>
      <div className="grid gap-2 text-base sm:grid-cols-2">
        <p>
          <span className="text-slate-600">Birim Kar:</span>{" "}
          <strong className={negative ? "text-red-700" : "text-emerald-700"}>
            {formatCurrency(unitProfit)}
          </strong>
        </p>
        <p>
          <span className="text-slate-600">Kar Marjı:</span>{" "}
          <strong className={negative ? "text-red-700" : "text-emerald-700"}>
            {formatPercent(margin)}
          </strong>
        </p>
      </div>
      {negative && (
        <p className="mt-2 text-sm font-medium text-red-700">
          Uyarı: Satış fiyatı alış fiyatının altında!
        </p>
      )}
    </div>
  );
}
