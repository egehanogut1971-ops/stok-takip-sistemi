import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES, type MovementType } from "@/lib/constants";
import { applyStockMovement } from "@/lib/stock";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const movements = await prisma.stockMovement.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(type ? { type } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
            },
          }
        : {}),
    },
    include: {
      product: { include: { category: true } },
      user: { select: { id: true, name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(movements);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productId = String(body.productId ?? "");
    const type = String(body.type ?? "") as MovementType;
    const quantity = Number(body.quantity ?? 0);
    const note = body.note ? String(body.note).trim() : undefined;

    if (!productId || !type) {
      return NextResponse.json(
        { error: "Ürün ve hareket türü gerekli." },
        { status: 400 },
      );
    }

    if (!Object.values(MOVEMENT_TYPES).includes(type)) {
      return NextResponse.json(
        { error: "Geçersiz hareket türü." },
        { status: 400 },
      );
    }

    const result = await applyStockMovement({
      productId,
      userId: session.user.id,
      type,
      quantity,
      note,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Hareket kaydedilemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
