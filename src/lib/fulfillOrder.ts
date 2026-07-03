import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES } from "@/lib/constants";
import { ORDER_STATUS } from "@/lib/orders";
import { ROLES } from "@/lib/roles";

const SYSTEM_USERNAME = "sistem";

export async function getSystemUserId(): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { username: SYSTEM_USERNAME },
  });

  if (existing) return existing.id;

  const password = await bcrypt.hash(
    `system-${Date.now()}-${Math.random().toString(36)}`,
    10,
  );

  const user = await prisma.user.create({
    data: {
      username: SYSTEM_USERNAME,
      name: "Sistem",
      password,
      role: ROLES.STAFF,
    },
  });

  return user.id;
}

export async function fulfillOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Sipariş bulunamadı.");
  }

  if (order.status === ORDER_STATUS.ODENDI) {
    return;
  }

  const systemUserId = await getSystemUserId();

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const productSize = await tx.productSize.findUnique({
        where: { id: item.productSizeId },
      });

      if (!productSize) {
        throw new Error(`${item.productName} beden bulunamadı.`);
      }

      if (productSize.currentStock < item.quantity) {
        throw new Error(
          `${item.productName} (${item.size}) için yeterli stok yok.`,
        );
      }

      await tx.stockMovement.create({
        data: {
          productSizeId: item.productSizeId,
          userId: systemUserId,
          type: MOVEMENT_TYPES.CIKIS,
          quantity: item.quantity,
          note: `Sipariş #${order.orderNumber}`,
        },
      });

      await tx.productSize.update({
        where: { id: item.productSizeId },
        data: {
          currentStock: productSize.currentStock - item.quantity,
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.ODENDI,
      },
    });
  });
}

export async function markOrderPaymentFailed(orderId: string): Promise<void> {
  await prisma.order.updateMany({
    where: {
      id: orderId,
      status: ORDER_STATUS.BEKLEMEDE,
    },
    data: { status: ORDER_STATUS.ODEME_BASARISIZ },
  });
}
