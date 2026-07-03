import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  clearCartCookie,
  getResolvedCart,
  syncCartWithStock,
} from "@/lib/cart";
import { fulfillOrder } from "@/lib/fulfillOrder";
import {
  calcOrderTotals,
  generateOrderNumber,
  ORDER_STATUS,
  type ShippingAddress,
} from "@/lib/orders";
import { ROLES } from "@/lib/roles";
import { isPaymentEnabled } from "@/lib/shopConfig";

function parseAddress(body: unknown): ShippingAddress | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  const city = String(data.city ?? "").trim();
  const district = String(data.district ?? "").trim();
  const line = String(data.line ?? "").trim();
  const postalCode = data.postalCode
    ? String(data.postalCode).trim()
    : undefined;

  if (!city || !district || !line) return null;
  return { city, district, line, postalCode };
}

export async function POST(request: Request) {
  try {
    await syncCartWithStock();
    const cart = await getResolvedCart();

    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Sepetiniz boş." }, { status: 400 });
    }

    const body = await request.json();
    const guestName = String(body.guestName ?? "").trim();
    const guestEmail = String(body.guestEmail ?? "").trim();
    const guestPhone = String(body.guestPhone ?? "").trim();
    const shippingAddress = parseAddress(body.shippingAddress);

    if (!guestName || !guestEmail || !guestPhone || !shippingAddress) {
      return NextResponse.json(
        { error: "Tüm teslimat bilgilerini doldurun." },
        { status: 400 },
      );
    }

    const session = await auth();
    const customerId =
      session?.user?.role === ROLES.CUSTOMER ? session.user.id : null;

    const totals = calcOrderTotals(cart.subtotal);
    let orderNumber = generateOrderNumber();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const order = await prisma.$transaction(async (tx) => {
          for (const line of cart.items) {
            const size = await tx.productSize.findUnique({
              where: { id: line.productSizeId },
              include: { product: true },
            });

            if (!size || !size.product.isPublished) {
              throw new Error(`${line.productName} artık satışta değil.`);
            }

            if (size.currentStock < line.quantity) {
              throw new Error(
                `${line.productName} (${line.size}) için yeterli stok yok.`,
              );
            }
          }

          return tx.order.create({
            data: {
              orderNumber,
              status: ORDER_STATUS.BEKLEMEDE,
              customerId,
              guestName,
              guestEmail,
              guestPhone,
              shippingAddress,
              subtotal: totals.subtotal,
              shippingCost: totals.shippingCost,
              total: totals.total,
              items: {
                create: cart.items.map((line) => ({
                  productSizeId: line.productSizeId,
                  productName: line.productName,
                  size: line.size,
                  quantity: line.quantity,
                  unitPrice: line.unitPrice,
                  lineTotal: line.lineTotal,
                })),
              },
            },
            include: { items: true },
          });
        });

        await clearCartCookie();

        const paymentEnabled = isPaymentEnabled();
        if (!paymentEnabled) {
          await fulfillOrder(order.id);
        }

        return NextResponse.json(
          {
            orderNumber: order.orderNumber,
            total: order.total,
            status: paymentEnabled ? order.status : ORDER_STATUS.ODENDI,
            paymentEnabled,
          },
          { status: 201 },
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          orderNumber = generateOrderNumber();
          continue;
        }
        throw error;
      }
    }

    return NextResponse.json(
      { error: "Sipariş oluşturulamadı." },
      { status: 500 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Sipariş oluşturulamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
