import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  listingInclude,
  parseImageUrls,
  parseReviews,
  resolveListingSlug,
  syncListingImages,
  syncListingReviews,
} from "@/lib/listingHelpers";
import { isStaff } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const [pending, listings] = await Promise.all([
    prisma.product.findMany({
      where: { shopListing: null },
      include: {
        category: true,
        sizes: { orderBy: { size: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.shopListing.findMany({
      include: listingInclude,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ pending, listings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productId = String(body.productId ?? "").trim();
    const displayName = String(body.displayName ?? "").trim();
    const salePrice = Number(body.salePrice ?? 0);
    const description = body.description
      ? String(body.description).trim()
      : null;
    const sizeChart = body.sizeChart ? String(body.sizeChart).trim() : null;
    const isPublished = Boolean(body.isPublished);
    const slugInput = body.slug ? String(body.slug).trim() : "";
    const imageUrls = parseImageUrls(body.images);
    const reviews = parseReviews(body.reviews);

    if (!productId || !displayName) {
      return NextResponse.json(
        { error: "Ürün ve mağaza adı gerekli." },
        { status: 400 },
      );
    }

    if (salePrice < 0) {
      return NextResponse.json(
        { error: "Satış fiyatı negatif olamaz." },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shopListing: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Stok ürünü bulunamadı." }, { status: 404 });
    }

    if (product.shopListing) {
      return NextResponse.json(
        { error: "Bu ürün zaten mağazaya eklenmiş." },
        { status: 400 },
      );
    }

    const slug = slugInput
      ? await resolveListingSlug(slugInput)
      : await resolveListingSlug(displayName);

    const listing = await prisma.shopListing.create({
      data: {
        productId,
        displayName,
        slug,
        salePrice,
        description,
        sizeChart,
        isPublished,
      },
    });

    await syncListingImages(listing.id, imageUrls);
    await syncListingReviews(listing.id, reviews);

    const created = await prisma.shopListing.findUnique({
      where: { id: listing.id },
      include: listingInclude,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vitrin oluşturulamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
