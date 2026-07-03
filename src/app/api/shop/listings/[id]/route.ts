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

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const listing = await prisma.shopListing.findUnique({
    where: { id },
    include: listingInclude,
  });

  if (!listing) {
    return NextResponse.json({ error: "Vitrin bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
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

    if (!displayName) {
      return NextResponse.json(
        { error: "Mağaza adı gerekli." },
        { status: 400 },
      );
    }

    if (salePrice < 0) {
      return NextResponse.json(
        { error: "Satış fiyatı negatif olamaz." },
        { status: 400 },
      );
    }

    const existing = await prisma.shopListing.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Vitrin bulunamadı." }, { status: 404 });
    }

    const slug = slugInput
      ? await resolveListingSlug(slugInput, id)
      : await resolveListingSlug(displayName, id);

    await prisma.shopListing.update({
      where: { id },
      data: {
        displayName,
        slug,
        salePrice,
        description,
        sizeChart,
        isPublished,
      },
    });

    await syncListingImages(id, imageUrls);
    await syncListingReviews(id, reviews);

    const updated = await prisma.shopListing.findUnique({
      where: { id },
      include: listingInclude,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vitrin güncellenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.shopListing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
