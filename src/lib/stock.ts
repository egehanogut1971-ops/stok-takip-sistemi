import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES, type MovementType } from "@/lib/constants";

export async function applyStockMovement({
  productId,
  userId,
  type,
  quantity,
  note,
}: {
  productId: string;
  userId: string;
  type: MovementType;
  quantity: number;
  note?: string;
}) {
  if (quantity <= 0) {
    throw new Error("Miktar sıfırdan büyük olmalıdır.");
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new Error("Ürün bulunamadı.");
    }

    let delta = 0;
    if (type === MOVEMENT_TYPES.GIRIS || type === MOVEMENT_TYPES.BASLANGIC) {
      delta = quantity;
    } else if (type === MOVEMENT_TYPES.CIKIS) {
      delta = -quantity;
      if (product.currentStock - quantity < 0) {
        throw new Error("Stok yetersiz.");
      }
    } else if (type === MOVEMENT_TYPES.DUZELTME) {
      delta = quantity - product.currentStock;
      if (quantity < 0) {
        throw new Error("Geçersiz stok miktarı.");
      }
    }

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        userId,
        type,
        quantity: type === MOVEMENT_TYPES.DUZELTME ? Math.abs(delta) : quantity,
        note,
      },
    });

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock:
          type === MOVEMENT_TYPES.DUZELTME
            ? quantity
            : product.currentStock + delta,
      },
      include: { category: true },
    });

    return { movement, product: updatedProduct };
  });
}
