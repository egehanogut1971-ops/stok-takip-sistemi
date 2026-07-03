import { isIyzicoConfigured } from "@/lib/iyzico";

export function isPaymentEnabled(): boolean {
  if (process.env.SKIP_PAYMENT === "true") {
    return false;
  }
  return isIyzicoConfigured();
}

export type PaymentMode = "live" | "sandbox" | "skipped";

export function getPaymentMode(): PaymentMode {
  if (process.env.SKIP_PAYMENT === "true" || !isIyzicoConfigured()) {
    return "skipped";
  }
  const baseUrl = process.env.IYZICO_BASE_URL ?? "";
  return baseUrl.includes("sandbox") ? "sandbox" : "live";
}

export function getShopName(): string {
  return process.env.SHOP_NAME?.trim() || "Mağaza";
}

export function getShopTagline(): string {
  return (
    process.env.SHOP_TAGLINE?.trim() ||
    "Kaliteli ürünler, hızlı teslimat — güvenle alışveriş yapın."
  );
}
