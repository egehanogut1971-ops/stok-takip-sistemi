import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const categoryId = String(body.categoryId ?? "");
    const costPrice = Number(body.costPrice ?? 0);
    const salePrice = Number(body.salePrice ?? 0);
    const minStock = Number(body.minStock ?? 0);
    const unit = String(body.unit ?? "adet");
    const sku = body.sku ? String(body.sku).trim() : null;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Ürün adı ve kategori gerekli." },
        { status: 400 },
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId,
        costPrice,
        salePrice,
        minStock,
        unit,
        sku,
      },
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: "Ürün güncellenemedi." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
