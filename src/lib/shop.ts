import { prisma } from "@/lib/prisma";

export async function getPublishedProducts(options?: {
  categoryId?: string;
  q?: string;
}) {
  const { categoryId, q } = options ?? {};

  return prisma.product.findMany({
    where: {
      isPublished: true,
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPublishedProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getShopCategories() {
  return prisma.category.findMany({
    where: {
      products: { some: { isPublished: true } },
    },
    orderBy: { name: "asc" },
  });
}

export function getProductCoverImage(
  images: { url: string; sortOrder: number }[],
): string | null {
  if (images.length === 0) return null;
  return images[0]?.url ?? null;
}

export function getTotalStock(sizes: { currentStock: number }[]): number {
  return sizes.reduce((sum, s) => sum + s.currentStock, 0);
}
