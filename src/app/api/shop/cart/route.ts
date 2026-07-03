import { NextResponse } from "next/server";
import {
  getResolvedCart,
  mergeCartItem,
  removeCartItem,
  syncCartWithStock,
  updateCartItemQuantity,
} from "@/lib/cart";
import { getShippingCost } from "@/lib/orders";

function cartResponse(cart: Awaited<ReturnType<typeof getResolvedCart>>) {
  const shippingCost = getShippingCost();
  return NextResponse.json({
    ...cart,
    shippingCost,
    estimatedTotal: cart.subtotal + shippingCost,
  });
}

export async function GET() {
  await syncCartWithStock();
  const cart = await getResolvedCart();
  return cartResponse(cart);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productSizeId = String(body.productSizeId ?? "");
    const quantity = Math.max(1, Math.floor(Number(body.quantity ?? 1)));

    if (!productSizeId) {
      return NextResponse.json(
        { error: "Beden seçimi gerekli." },
        { status: 400 },
      );
    }

    const result = await mergeCartItem(productSizeId, quantity);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const cart = await getResolvedCart();
    return cartResponse(cart);
  } catch {
    return NextResponse.json(
      { error: "Sepete eklenemedi." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const productSizeId = String(body.productSizeId ?? "");
    const quantity = Math.floor(Number(body.quantity ?? 0));

    if (!productSizeId) {
      return NextResponse.json({ error: "Ürün gerekli." }, { status: 400 });
    }

    const result = await updateCartItemQuantity(productSizeId, quantity);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const cart = await getResolvedCart();
    return cartResponse(cart);
  } catch {
    return NextResponse.json(
      { error: "Sepet güncellenemedi." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const productSizeId = String(body.productSizeId ?? "");

    if (!productSizeId) {
      return NextResponse.json({ error: "Ürün gerekli." }, { status: 400 });
    }

    await removeCartItem(productSizeId);
    const cart = await getResolvedCart();
    return cartResponse(cart);
  } catch {
    return NextResponse.json(
      { error: "Ürün sepetten kaldırılamadı." },
      { status: 500 },
    );
  }
}
