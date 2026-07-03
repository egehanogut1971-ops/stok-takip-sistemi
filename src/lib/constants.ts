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

export const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "Tek Beden",
] as const;
