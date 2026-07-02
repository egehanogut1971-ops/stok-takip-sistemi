export function calcProfit(salePrice: number, costPrice: number) {
  const unitProfit = salePrice - costPrice;
  const margin = salePrice > 0 ? (unitProfit / salePrice) * 100 : 0;
  return { unitProfit, margin };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number) {
  return `%${value.toFixed(1)}`;
}

export function getStockStatus(current: number, min: number) {
  if (current <= 0) return "empty" as const;
  if (current <= min) return "low" as const;
  return "ok" as const;
}

export const STOCK_STATUS_LABELS = {
  empty: "Tükendi",
  low: "Az",
  ok: "Yeterli",
} as const;

export const STOCK_STATUS_CLASSES = {
  empty: "bg-red-100 text-red-800",
  low: "bg-yellow-100 text-yellow-800",
  ok: "bg-green-100 text-green-800",
} as const;
