export const ORDER_STATUS = {
  BEKLEMEDE: "BEKLEMEDE",
  ODENDI: "ODENDI",
  HAZIRLANIYOR: "HAZIRLANIYOR",
  KARGODA: "KARGODA",
  TESLIM_EDILDI: "TESLIM_EDILDI",
  IPTAL: "IPTAL",
  ODEME_BASARISIZ: "ODEME_BASARISIZ",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  BEKLEMEDE: "Ödeme Bekliyor",
  ODENDI: "Ödendi",
  HAZIRLANIYOR: "Hazırlanıyor",
  KARGODA: "Kargoda",
  TESLIM_EDILDI: "Teslim Edildi",
  IPTAL: "İptal",
  ODEME_BASARISIZ: "Ödeme Başarısız",
};

export type ShippingAddress = {
  city: string;
  district: string;
  line: string;
  postalCode?: string;
};

export function getShippingCost(): number {
  const value = Number(process.env.SHIPPING_COST ?? 79);
  return Number.isFinite(value) && value >= 0 ? value : 79;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

export function calcOrderTotals(subtotal: number) {
  const shippingCost = getShippingCost();
  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
  };
}
