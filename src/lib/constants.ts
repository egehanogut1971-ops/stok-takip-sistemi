export const MOVEMENT_TYPES = {
  BASLANGIC: "BASLANGIC",
  GIRIS: "GIRIS",
  CIKIS: "CIKIS",
  DUZELTME: "DUZELTME",
} as const;

export type MovementType = (typeof MOVEMENT_TYPES)[keyof typeof MOVEMENT_TYPES];

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  BASLANGIC: "Başlangıç Stoku",
  GIRIS: "Stok Girişi",
  CIKIS: "Stok Çıkışı",
  DUZELTME: "Sayım Düzeltmesi",
};

export const UNITS = ["adet", "kg", "lt", "paket"] as const;
