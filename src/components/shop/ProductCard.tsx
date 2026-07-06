"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/profit";
import { isListingInStock } from "@/lib/stockUtils";

type ListingCardProps = {
  listing: {
    displayName: string;
    slug: string;
    salePrice: number;
    images: { url: string; sortOrder: number }[];
    product: {
      category: { name: string };
      sizes: { currentStock: number }[];
    };
  };
};

function getCoverImage(images: { url: string; sortOrder: number }[]) {
  if (images.length === 0) return null;
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted[0]?.url ?? null;
}

export function ProductCard({ listing }: ListingCardProps) {
  const cover = getCoverImage(listing.images);
  const hoverImage =
    listing.images.length > 1
      ? listing.images[1]?.url ?? cover
      : cover;
  const inStock = isListingInStock(listing.product.sizes);

  return (
    <Link
      href={`/magaza/urun/${listing.slug}`}
      className="group flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--shop-surface-muted)]">
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={listing.displayName}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
            {hoverImage && hoverImage !== cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hoverImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--shop-text-faint)]">
            Görsel yok
          </div>
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 bg-white/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--shop-text-muted)]">
            Tükendi
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--shop-text-muted)]">
          {listing.product.category.name}
        </p>
        <h3 className="text-sm font-medium text-[var(--shop-text-primary)]">
          {listing.displayName}
        </h3>
        <p className="text-sm text-[var(--shop-text-secondary)]">
          {formatCurrency(listing.salePrice)}
        </p>
      </div>
    </Link>
  );
}
