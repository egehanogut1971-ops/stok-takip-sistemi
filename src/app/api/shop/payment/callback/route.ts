import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillOrder, markOrderPaymentFailed } from "@/lib/fulfillOrder";
import {
  getSiteBaseUrl,
  isIyzicoConfigured,
  retrieveCheckoutResult,
} from "@/lib/iyzico";
import { ORDER_STATUS } from "@/lib/orders";

async function handleToken(token: string) {
  if (!isIyzicoConfigured()) {
    return NextResponse.redirect(
      `${getSiteBaseUrl()}/magaza/odeme/hata?reason=config`,
    );
  }

  const result = await retrieveCheckoutResult(token);
  const orderNumber = result.conversationId;

  if (!orderNumber) {
    return NextResponse.redirect(
      `${getSiteBaseUrl()}/magaza/odeme/hata?reason=invalid`,
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
  });

  if (!order) {
    return NextResponse.redirect(
      `${getSiteBaseUrl()}/magaza/odeme/hata?reason=notfound`,
    );
  }

  if (result.paymentStatus === "SUCCESS") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: result.paymentId ?? null },
    });
    await fulfillOrder(order.id);
    return NextResponse.redirect(
      `${getSiteBaseUrl()}/magaza/siparis/${order.orderNumber}`,
    );
  }

  await markOrderPaymentFailed(order.id);
  return NextResponse.redirect(
    `${getSiteBaseUrl()}/magaza/odeme/hata?order=${order.orderNumber}`,
  );
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      const token = String(formData.get("token") ?? "");
      if (!token) {
        return NextResponse.redirect(
          `${getSiteBaseUrl()}/magaza/odeme/hata?reason=token`,
        );
      }
      return handleToken(token);
    }

    const body = await request.json().catch(() => ({}));
    const token = String((body as { token?: string }).token ?? "");
    if (!token) {
      return NextResponse.json({ error: "Token gerekli." }, { status: 400 });
    }

    const result = await retrieveCheckoutResult(token);
    const orderNumber = result.conversationId;

    if (result.paymentStatus === "SUCCESS" && orderNumber) {
      const order = await prisma.order.findUnique({ where: { orderNumber } });
      if (order && order.status === ORDER_STATUS.BEKLEMEDE) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentRef: result.paymentId ?? null },
        });
        await fulfillOrder(order.id);
      }
      return NextResponse.json({ success: true, orderNumber });
    }

    return NextResponse.json({ success: false, orderNumber });
  } catch {
    return NextResponse.redirect(
      `${getSiteBaseUrl()}/magaza/odeme/hata?reason=error`,
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      `${getSiteBaseUrl()}/magaza/odeme/hata?reason=token`,
    );
  }
  return handleToken(token);
}
