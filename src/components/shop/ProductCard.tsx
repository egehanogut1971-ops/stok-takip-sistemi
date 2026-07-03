import Link from "next/link";
import { formatCurrency } from "@/lib/profit";
import {
  getListingCoverImage,
  getTotalStock,
  isListingInStock,
} from "@/lib/shop";

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

export function ProductCard({ listing }: ListingCardProps) {
  const cover = getListingCoverImage(listing.images);
  const inStock = isListingInStock(listing.product.sizes);

  return (
    <Link
      href={`/magaza/urun/${listing.slug}`}
      className="group flex flex-col overflow-hidden shop-card transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shop-shadow-hover)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--shop-surface-muted)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={listing.displayName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--shop-text-faint)]">
            Görsel yok
          </div>
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--shop-text-primary)]/80 px-3 py-1 text-xs font-medium text-white">
            Tükendi
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-[var(--shop-text-muted)] backdrop-blur">
          {listing.product.category.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 font-semibold text-[var(--shop-text-primary)]">
          {listing.displayName}
        </h2>
        <div className="mt-auto flex items-end justify-between pt-3">
          <p className="text-lg font-semibold text-[var(--shop-text-primary)]">
            {formatCurrency(listing.salePrice)}
          </p>
          {inStock && (
            <span className="rounded-full bg-[var(--shop-accent-soft)] px-2 py-0.5 text-xs text-[var(--shop-success)]">
              Stokta
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Backward-compatible export name
export type ProductCardProps = ListingCardProps;
