import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES } from "@/lib/constants";
import { applyStockMovement } from "@/lib/stock";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const q = searchParams.get("q")?.trim();
  const lowStock = searchParams.get("lowStock") === "true";

  const products = await prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { sku: { contains: q } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  if (lowStock) {
    const filtered = products.filter((p) => p.currentStock <= p.minStock);
    return NextResponse.json(filtered);
  }

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const categoryId = String(body.categoryId ?? "");
    const costPrice = Number(body.costPrice ?? 0);
    const salePrice = Number(body.salePrice ?? 0);
    const minStock = Number(body.minStock ?? 0);
    const initialStock = Number(body.initialStock ?? 0);
    const unit = String(body.unit ?? "adet");
    const sku = body.sku ? String(body.sku).trim() : null;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Ürün adı ve kategori gerekli." },
        { status: 400 },
      );
    }

    if (costPrice < 0 || salePrice < 0 || minStock < 0 || initialStock < 0) {
      return NextResponse.json(
        { error: "Fiyat ve stok değerleri negatif olamaz." },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        costPrice,
        salePrice,
        minStock,
        currentStock: 0,
        unit,
        sku,
      },
      include: { category: true },
    });

    if (initialStock > 0) {
      await applyStockMovement({
        productId: product.id,
        userId: session.user.id,
        type: MOVEMENT_TYPES.BASLANGIC,
        quantity: initialStock,
        note: "Başlangıç stoku",
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ürün eklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
