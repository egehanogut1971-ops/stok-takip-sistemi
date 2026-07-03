import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/orders";
import { isStaff } from "@/lib/roles";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES = [
  ORDER_STATUS.HAZIRLANIYOR,
  ORDER_STATUS.KARGODA,
  ORDER_STATUS.TESLIM_EDILDI,
  ORDER_STATUS.IPTAL,
];

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const status = String(body.status ?? "");

    if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Sipariş güncellenemedi." },
      { status: 400 },
    );
  }
}

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(order);
}
