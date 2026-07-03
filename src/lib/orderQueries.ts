import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export async function getPublicOrder(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}

export function formatShippingAddress(address: unknown): string {
  if (!address || typeof address !== "object") return "";
  const data = address as Record<string, unknown>;
  const parts = [
    String(data.line ?? ""),
    String(data.district ?? ""),
    String(data.city ?? ""),
    data.postalCode ? String(data.postalCode) : "",
  ].filter(Boolean);
  return parts.join(", ");
}

export function getOrderStatusLabel(status: string): string {
  return (
    ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ?? status
  );
}
