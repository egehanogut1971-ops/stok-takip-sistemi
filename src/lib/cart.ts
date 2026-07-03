import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getProductCoverImage } from "@/lib/shop";

export const CART_COOKIE = "shop-cart";
const CART_MAX_AGE = 60 * 60 * 24 * 7;

export type CartItemInput = {
  productSizeId: string;
  quantity: number;
};

export type CartLine = {
  productSizeId: string;
  quantity: number;
  productName: string;
  size: string;
  unitPrice: number;
  lineTotal: number;
  maxStock: number;
  slug: string;
  imageUrl: string | null;
};

export type ResolvedCart = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
};

type CartCookie = {
  items: CartItemInput[];
};

function parseCartCookie(raw: string | undefined): CartCookie {
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw) as CartCookie;
    if (!Array.isArray(parsed.items)) return { items: [] };
    return {
      items: parsed.items
        .map((item) => ({
          productSizeId: String(item.productSizeId ?? ""),
          quantity: Math.max(1, Math.floor(Number(item.quantity ?? 1))),
        }))
        .filter((item) => item.productSizeId),
    };
  } catch {
    return { items: [] };
  }
}

export async function readCartCookie(): Promise<CartItemInput[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  return parseCartCookie(raw).items;
}

export async function writeCartCookie(items: CartItemInput[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify({ items }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
}

export async function clearCartCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}

export async function resolveCartItems(
  items: CartItemInput[],
): Promise<ResolvedCart> {
  if (items.length === 0) {
    return { items: [], itemCount: 0, subtotal: 0 };
  }

  const sizeIds = items.map((item) => item.productSizeId);
  const sizes = await prisma.productSize.findMany({
    where: {
      id: { in: sizeIds },
      product: { isPublished: true },
    },
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  const sizeMap = new Map(sizes.map((size) => [size.id, size]));
  const lines: CartLine[] = [];

  for (const item of items) {
    const size = sizeMap.get(item.productSizeId);
    if (!size) continue;

    const quantity = Math.min(item.quantity, size.currentStock);
    if (quantity <= 0) continue;

    lines.push({
      productSizeId: size.id,
      quantity,
      productName: size.product.name,
      size: size.size,
      unitPrice: size.product.salePrice,
      lineTotal: size.product.salePrice * quantity,
      maxStock: size.currentStock,
      slug: size.product.slug,
      imageUrl: getProductCoverImage(size.product.images),
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return { items: lines, itemCount, subtotal };
}

export async function getResolvedCart(): Promise<ResolvedCart> {
  const items = await readCartCookie();
  return resolveCartItems(items);
}

export async function mergeCartItem(
  productSizeId: string,
  quantity: number,
): Promise<{ error?: string }> {
  const size = await prisma.productSize.findFirst({
    where: {
      id: productSizeId,
      product: { isPublished: true },
    },
  });

  if (!size) {
    return { error: "Ürün bulunamadı." };
  }

  if (size.currentStock <= 0) {
    return { error: "Bu beden stokta yok." };
  }

  const current = await readCartCookie();
  const existing = current.find((item) => item.productSizeId === productSizeId);
  const nextQuantity = (existing?.quantity ?? 0) + quantity;

  if (nextQuantity > size.currentStock) {
    return {
      error: `En fazla ${size.currentStock} adet ekleyebilirsiniz.`,
    };
  }

  const nextItems = existing
    ? current.map((item) =>
        item.productSizeId === productSizeId
          ? { ...item, quantity: nextQuantity }
          : item,
      )
    : [...current, { productSizeId, quantity }];

  await writeCartCookie(nextItems);
  return {};
}

export async function updateCartItemQuantity(
  productSizeId: string,
  quantity: number,
): Promise<{ error?: string }> {
  const current = await readCartCookie();
  const size = await prisma.productSize.findFirst({
    where: {
      id: productSizeId,
      product: { isPublished: true },
    },
  });

  if (!size) {
    return { error: "Ürün bulunamadı." };
  }

  if (quantity <= 0) {
    await writeCartCookie(
      current.filter((item) => item.productSizeId !== productSizeId),
    );
    return {};
  }

  if (quantity > size.currentStock) {
    return { error: `En fazla ${size.currentStock} adet seçebilirsiniz.` };
  }

  const exists = current.some((item) => item.productSizeId === productSizeId);
  if (!exists) {
    return { error: "Sepette bu ürün yok." };
  }

  await writeCartCookie(
    current.map((item) =>
      item.productSizeId === productSizeId ? { ...item, quantity } : item,
    ),
  );
  return {};
}

export async function removeCartItem(
  productSizeId: string,
): Promise<void> {
  const current = await readCartCookie();
  await writeCartCookie(
    current.filter((item) => item.productSizeId !== productSizeId),
  );
}

export async function syncCartWithStock(): Promise<void> {
  const current = await readCartCookie();
  const resolved = await resolveCartItems(current);
  await writeCartCookie(
    resolved.items.map((line) => ({
      productSizeId: line.productSizeId,
      quantity: line.quantity,
    })),
  );
}
