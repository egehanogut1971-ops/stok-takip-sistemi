import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function resolveListingSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name) || "urun";
  let candidate = base;
  let counter = 0;

  while (true) {
    const existing = await prisma.shopListing.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export async function syncListingImages(
  listingId: string,
  urls: string[],
): Promise<void> {
  await prisma.shopListingImage.deleteMany({ where: { listingId } });

  const cleaned = urls.map((url) => url.trim()).filter(Boolean);
  if (cleaned.length === 0) return;

  await prisma.shopListingImage.createMany({
    data: cleaned.map((url, index) => ({
      listingId,
      url,
      sortOrder: index,
    })),
  });
}

export type ReviewInput = {
  id?: string;
  authorName: string;
  rating: number;
  text: string;
  sortOrder?: number;
};

export async function syncListingReviews(
  listingId: string,
  reviews: ReviewInput[],
): Promise<void> {
  await prisma.shopReview.deleteMany({ where: { listingId } });

  const cleaned = reviews
    .map((review, index) => ({
      authorName: review.authorName.trim(),
      rating: Math.min(5, Math.max(1, Math.floor(review.rating))),
      text: review.text.trim(),
      sortOrder: review.sortOrder ?? index,
    }))
    .filter((review) => review.authorName && review.text);

  if (cleaned.length === 0) return;

  await prisma.shopReview.createMany({
    data: cleaned.map((review) => ({
      listingId,
      ...review,
    })),
  });
}

export function parseImageUrls(body: unknown): string[] {
  if (!Array.isArray(body)) return [];
  return body.map((item) => String(item).trim()).filter(Boolean);
}

export function parseReviews(body: unknown): ReviewInput[] {
  if (!Array.isArray(body)) return [];
  return body.map((item, index) => {
    const data = item as Record<string, unknown>;
    return {
      id: data.id ? String(data.id) : undefined,
      authorName: String(data.authorName ?? ""),
      rating: Number(data.rating ?? 5),
      text: String(data.text ?? ""),
      sortOrder: Number(data.sortOrder ?? index),
    };
  });
}

export const listingInclude = {
  product: {
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" as const } },
    },
  },
  images: { orderBy: { sortOrder: "asc" as const } },
  reviews: { orderBy: { sortOrder: "asc" as const } },
} as const;
