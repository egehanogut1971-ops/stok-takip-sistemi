import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES } from "@/lib/constants";
import { applyStockMovement } from "@/lib/stock";
import { resolveProductSlug } from "@/lib/productHelpers";
import { isStaff } from "@/lib/roles";

type Params = { params: Promise<{ id: string }> };

type SizeUpdate = {
  id?: string;
  size: string;
  minStock?: number;
  initialStock?: number;
};

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      sizes: { orderBy: { size: "asc" } },
      shopListing: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const categoryId = String(body.categoryId ?? "");
    const costPrice = Number(body.costPrice ?? 0);
    const sku = body.sku ? String(body.sku).trim() : null;
    const sizes: SizeUpdate[] = Array.isArray(body.sizes)
      ? body.sizes.map((s: SizeUpdate) => ({
          id: s.id ? String(s.id) : undefined,
          size: String(s.size ?? "").trim(),
          minStock: Number(s.minStock ?? 0),
          initialStock: Number(s.initialStock ?? 0),
        }))
      : [];

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Ürün adı ve kategori gerekli." },
        { status: 400 },
      );
    }

    if (sizes.length === 0) {
      return NextResponse.json(
        { error: "En az bir beden gerekli." },
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

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { sizes: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    const slug = await resolveProductSlug(name, id);

    await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId,
        costPrice,
        sku,
        slug,
      },
    });

    const keptIds = new Set(
      sizes.filter((s) => s.id).map((s) => s.id as string),
    );

    for (const old of existing.sizes) {
      if (!keptIds.has(old.id)) {
        if (old.currentStock > 0) {
          return NextResponse.json(
            { error: `"${old.size}" bedeninde stok varken silinemez.` },
            { status: 400 },
          );
        }
        await prisma.productSize.delete({ where: { id: old.id } });
      }
    }

    for (const input of sizes) {
      if (input.id) {
        await prisma.productSize.update({
          where: { id: input.id },
          data: { size: input.size, minStock: input.minStock ?? 0 },
        });
      } else {
        const created = await prisma.productSize.create({
          data: {
            productId: id,
            size: input.size,
            minStock: input.minStock ?? 0,
            currentStock: 0,
          },
        });

        if ((input.initialStock ?? 0) > 0) {
          await applyStockMovement({
            productSizeId: created.id,
            userId: session.user.id,
            type: MOVEMENT_TYPES.BASLANGIC,
            quantity: input.initialStock!,
            note: "Yeni beden başlangıç stoku",
          });
        }
      }
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: { orderBy: { size: "asc" } },
        shopListing: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ürün güncellenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
