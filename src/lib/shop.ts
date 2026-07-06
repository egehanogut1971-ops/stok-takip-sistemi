import { prisma } from "@/lib/prisma";
import { listingInclude } from "@/lib/listingHelpers";
import { getTotalStock, isListingInStock } from "@/lib/stockUtils";

export { getTotalStock, isListingInStock };

export async function getPublishedListings(options?: {
  categoryId?: string;
  q?: string;
}) {
  const { categoryId, q } = options ?? {};

  return prisma.shopListing.findMany({
    where: {
      isPublished: true,
      ...(categoryId ? { product: { categoryId } } : {}),
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: listingInclude,
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
  });
}

export async function getFeaturedListings(limit = 8) {
  return prisma.shopListing.findMany({
    where: { isPublished: true, isFeatured: true },
    include: listingInclude,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    take: limit,
  });
}

export async function getPublishedListingBySlug(slug: string) {
  return prisma.shopListing.findFirst({
    where: { slug, isPublished: true },
    include: listingInclude,
  });
}

export async function getShopCategories() {
  return prisma.category.findMany({
    where: {
      products: {
        some: {
          shopListing: { isPublished: true },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export function getListingCoverImage(
  images: { url: string; sortOrder: number }[],
): string | null {
  if (images.length === 0) return null;
  return images[0]?.url ?? null;
}

export async function getProductsWithoutListing() {
  return prisma.product.findMany({
    where: { shopListing: null },
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAllListings() {
  return prisma.shopListing.findMany({
    include: listingInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getListingById(id: string) {
  return prisma.shopListing.findUnique({
    where: { id },
    include: listingInclude,
  });
}

// Backward-compatible aliases used during migration
export const getPublishedProducts = getPublishedListings;
export const getPublishedProductBySlug = getPublishedListingBySlug;
export const getProductCoverImage = getListingCoverImage;
