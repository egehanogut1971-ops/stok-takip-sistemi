import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES } from "@/lib/constants";
import { applyStockMovement } from "@/lib/stock";
import { getStockRows } from "@/lib/stockRows";
import { resolveProductSlug } from "@/lib/productHelpers";
import { isStaff } from "@/lib/roles";

type SizeInput = {
  size: string;
  initialStock?: number;
  minStock?: number;
};

function parseSizes(body: unknown): SizeInput[] {
  if (!Array.isArray(body)) return [];
  return body.map((s) => ({
    size: String(s.size ?? "").trim(),
    initialStock: Number(s.initialStock ?? 0),
    minStock: Number(s.minStock ?? 0),
  }));
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const q = searchParams.get("q")?.trim();
  const lowStock = searchParams.get("lowStock") === "true";
  const view = searchParams.get("view");

  if (view === "rows") {
    const rows = await getStockRows({ categoryId, q, lowStockOnly: lowStock });
    return NextResponse.json(rows);
  }

  const products = await prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [{ name: { contains: q } }, { sku: { contains: q } }],
          }
        : {}),
    },
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" } },
      shopListing: true,
    },
    orderBy: { name: "asc" },
  });

  if (lowStock) {
    const filtered = products
      .map((p) => ({
        ...p,
        sizes: p.sizes.filter((s) => s.currentStock <= s.minStock),
      }))
      .filter((p) => p.sizes.length > 0);
    return NextResponse.json(filtered);
  }

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const categoryId = String(body.categoryId ?? "");
    const costPrice = Number(body.costPrice ?? 0);
    const sku = body.sku ? String(body.sku).trim() : null;
    const sizes = parseSizes(body.sizes);

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Ürün adı ve kategori gerekli." },
        { status: 400 },
      );
    }

    if (sizes.length === 0) {
      return NextResponse.json(
        { error: "En az bir beden eklemelisiniz." },
        { status: 400 },
      );
    }

    const sizeNames = sizes.map((s) => s.size);
    if (sizeNames.some((s) => !s)) {
      return NextResponse.json(
        { error: "Beden adı boş olamaz." },
        { status: 400 },
      );
    }

    if (new Set(sizeNames).size !== sizeNames.length) {
      return NextResponse.json(
        { error: "Aynı beden iki kez eklenemez." },
        { status: 400 },
      );
    }

    if (costPrice < 0) {
      return NextResponse.json(
        { error: "Maliyet fiyatı negatif olamaz." },
        { status: 400 },
      );
    }

    for (const s of sizes) {
      if ((s.initialStock ?? 0) < 0 || (s.minStock ?? 0) < 0) {
        return NextResponse.json(
          { error: "Stok değerleri negatif olamaz." },
          { status: 400 },
        );
      }
    }

    const slug = await resolveProductSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        costPrice,
        salePrice: 0,
        sku,
        slug,
        isPublished: false,
        sizes: {
          create: sizes.map((s) => ({
            size: s.size,
            minStock: s.minStock,
            currentStock: 0,
          })),
        },
      },
      include: {
        category: true,
        sizes: { orderBy: { size: "asc" } },
        shopListing: true,
      },
    });

    for (const input of sizes) {
      if ((input.initialStock ?? 0) > 0) {
        const createdSize = product.sizes.find((s) => s.size === input.size);
        if (createdSize) {
          await applyStockMovement({
            productSizeId: createdSize.id,
            userId: session.user.id,
            type: MOVEMENT_TYPES.BASLANGIC,
            quantity: input.initialStock ?? 0,
            note: "Başlangıç stoku",
          });
        }
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        sizes: { orderBy: { size: "asc" } },
        shopListing: true,
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ürün eklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
