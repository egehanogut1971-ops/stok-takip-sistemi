import { prisma } from "@/lib/prisma";
import {
  MOVEMENT_SOURCES,
  MOVEMENT_TYPES,
  type MovementType,
} from "@/lib/constants";

export async function applyStockMovement({
  productSizeId,
  userId,
  type,
  quantity,
  note,
}: {
  productSizeId: string;
  userId: string;
  type: MovementType;
  quantity: number;
  note?: string;
}) {
  if (quantity <= 0) {
    throw new Error("Miktar sıfırdan büyük olmalıdır.");
  }

  return prisma.$transaction(async (tx) => {
    const productSize = await tx.productSize.findUnique({
      where: { id: productSizeId },
      include: { product: { include: { category: true } } },
    });
    if (!productSize) {
      throw new Error("Beden bulunamadı.");
    }

    let delta = 0;
    if (type === MOVEMENT_TYPES.GIRIS || type === MOVEMENT_TYPES.BASLANGIC) {
      delta = quantity;
    } else if (type === MOVEMENT_TYPES.CIKIS) {
      delta = -quantity;
      if (productSize.currentStock - quantity < 0) {
        throw new Error("Stok yetersiz.");
      }
    } else if (type === MOVEMENT_TYPES.DUZELTME) {
      delta = quantity - productSize.currentStock;
      if (quantity < 0) {
        throw new Error("Geçersiz stok miktarı.");
      }
    }

    const movement = await tx.stockMovement.create({
      data: {
        productSizeId,
        userId,
        type,
        source: MOVEMENT_SOURCES.MANUAL,
        quantity: type === MOVEMENT_TYPES.DUZELTME ? Math.abs(delta) : quantity,
        note,
      },
    });

    const updatedSize = await tx.productSize.update({
      where: { id: productSizeId },
      data: {
        currentStock:
          type === MOVEMENT_TYPES.DUZELTME
            ? quantity
            : productSize.currentStock + delta,
      },
      include: { product: { include: { category: true } } },
    });

    return { movement, productSize: updatedSize };
  });
}
