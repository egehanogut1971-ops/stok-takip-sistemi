import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";

export async function resolveProductSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name) || "urun";
  let candidate = base;
  let counter = 0;

  while (true) {
    const existing = await prisma.product.findFirst({
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

export function buildDefaultSlug(name: string, id: string): string {
  return uniqueSlug(name, id);
}

export async function syncProductImages(
  productId: string,
  urls: string[],
): Promise<void> {
  await prisma.productImage.deleteMany({ where: { productId } });

  const cleaned = urls.map((url) => url.trim()).filter(Boolean);
  if (cleaned.length === 0) return;

  await prisma.productImage.createMany({
    data: cleaned.map((url, index) => ({
      productId,
      url,
      sortOrder: index,
    })),
  });
}

export function parseImageUrls(body: unknown): string[] {
  if (!Array.isArray(body)) return [];
  return body.map((item) => String(item).trim()).filter(Boolean);
}
