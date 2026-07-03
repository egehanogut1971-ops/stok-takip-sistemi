import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/orders";
import {
  buildCheckoutRequest,
  getSiteBaseUrl,
  initializeCheckout,
  isIyzicoConfigured,
} from "@/lib/iyzico";

function splitName(fullName: string): { name: string; surname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { name: parts[0], surname: "." };
  }
  return {
    name: parts.slice(0, -1).join(" "),
    surname: parts[parts.length - 1],
  };
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+90${digits.slice(1)}`;
  return `+90${digits}`;
}

export async function POST(request: Request) {
  try {
    if (!isIyzicoConfigured()) {
      return NextResponse.json(
        {
          error:
            "Ödeme sistemi yapılandırılmamış. IYZICO_API_KEY, IYZICO_SECRET_KEY ve IYZICO_BASE_URL ayarlayın.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const orderNumber = String(body.orderNumber ?? "").trim();

    if (!orderNumber) {
      return NextResponse.json({ error: "Sipariş numarası gerekli." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    if (order.status !== ORDER_STATUS.BEKLEMEDE) {
      return NextResponse.json(
        { error: "Bu sipariş için ödeme alınamaz." },
        { status: 400 },
      );
    }

    const address = order.shippingAddress as {
      city?: string;
      district?: string;
      line?: string;
    };

    const fullAddress = [address.line, address.district, address.city]
      .filter(Boolean)
      .join(", ");

    const { name, surname } = splitName(order.guestName);
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "85.34.78.112";

    const basketItems = order.items.map((item, index) => ({
      id: `BI-${index + 1}`,
      name: `${item.productName} (${item.size})`,
      category: "Ürün",
      price: item.lineTotal.toFixed(2),
    }));

    if (order.shippingCost > 0) {
      basketItems.push({
        id: "BI-shipping",
        name: "Kargo",
        category: "Kargo",
        price: order.shippingCost.toFixed(2),
      });
    }

    const checkoutRequest = buildCheckoutRequest({
      orderNumber: order.orderNumber,
      total: order.total,
      buyer: {
        id: order.id.slice(0, 20),
        name,
        surname,
        email: order.guestEmail,
        gsmNumber: formatPhone(order.guestPhone),
        identityNumber: "11111111111",
        registrationAddress: fullAddress || "Türkiye",
        city: address.city || "Istanbul",
        country: "Turkey",
        ip,
      },
      basketItems,
      shippingAddress: {
        contactName: order.guestName,
        city: address.city || "Istanbul",
        country: "Turkey",
        address: fullAddress || "Türkiye",
      },
    });

    const result = await initializeCheckout(checkoutRequest);

    if (result.errorMessage || !result.checkoutFormContent) {
      return NextResponse.json(
        { error: result.errorMessage || "Ödeme formu oluşturulamadı." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      checkoutFormContent: result.checkoutFormContent,
      paymentPageUrl: `${getSiteBaseUrl()}/magaza/odeme/${order.orderNumber}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ödeme başlatılamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
