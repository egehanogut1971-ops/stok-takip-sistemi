import { isIyzicoConfigured } from "@/lib/iyzico";

export function isPaymentEnabled(): boolean {
  if (process.env.SKIP_PAYMENT === "true") {
    return false;
  }
  return isIyzicoConfigured();
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
