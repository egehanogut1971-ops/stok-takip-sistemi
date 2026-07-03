import { prisma } from "@/lib/prisma";

export type StockRow = {
  productSizeId: string;
  productId: string;
  name: string;
  size: string;
  sku: string | null;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  category: { id: string; name: string };
};

export async function getStockRows(options?: {
  categoryId?: string;
  q?: string;
  lowStockOnly?: boolean;
}): Promise<StockRow[]> {
  const sizes = await prisma.productSize.findMany({
    where: {
      ...(options?.categoryId
        ? { product: { categoryId: options.categoryId } }
        : {}),
      ...(options?.q
        ? {
            product: {
              OR: [
                { name: { contains: options.q } },
                { sku: { contains: options.q } },
              ],
            },
          }
        : {}),
    },
    include: {
      product: { include: { category: true } },
    },
    orderBy: [{ product: { name: "asc" } }, { size: "asc" }],
  });

  let rows: StockRow[] = sizes.map((s) => ({
    productSizeId: s.id,
    productId: s.productId,
    name: s.product.name,
    size: s.size,
    sku: s.product.sku,
    costPrice: s.product.costPrice,
    salePrice: s.product.salePrice,
    currentStock: s.currentStock,
    minStock: s.minStock,
    category: s.product.category,
  }));

  if (options?.lowStockOnly) {
    rows = rows.filter((r) => r.currentStock <= r.minStock);
  }

  return rows;
}
