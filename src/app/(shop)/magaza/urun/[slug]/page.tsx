import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { formatCurrency } from "@/lib/profit";
import {
  getPublishedListingBySlug,
  getListingCoverImage,
  isListingInStock,
} from "@/lib/shop";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} yıldız`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= rating
              ? "text-[var(--shop-text-primary)]"
              : "text-[var(--shop-border)]"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getPublishedListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const cover = getListingCoverImage(listing.images);
  const inStock = isListingInStock(listing.product.sizes);

  return (
    <div className="space-y-8">
      <nav className="text-sm text-[var(--shop-text-muted)]">
        <Link href="/magaza" className="hover:text-[var(--shop-accent)]">
          Mağaza
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--shop-text-primary)]">
          {listing.displayName}
        </span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden shop-card">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={listing.displayName}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-[var(--shop-surface-muted)] text-[var(--shop-text-faint)]">
                Görsel yok
              </div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-[var(--shop-border)]"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--shop-text-muted)]">
              {listing.product.category.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--shop-text-primary)] lg:text-4xl">
              {listing.displayName}
            </h1>
          </div>

          <p className="text-3xl font-semibold text-[var(--shop-text-primary)]">
            {formatCurrency(listing.salePrice)}
          </p>

          <p
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              inStock
                ? "bg-[var(--shop-accent-soft)] text-[var(--shop-success)]"
                : "bg-[var(--shop-surface-muted)] text-[var(--shop-text-muted)]"
            }`}
          >
            {inStock ? "Stokta var" : "Tükendi"}
          </p>

          {listing.description && (
            <div className="shop-card p-5">
              <h2 className="mb-2 font-semibold text-[var(--shop-text-primary)]">
                Açıklama
              </h2>
              <p className="whitespace-pre-wrap leading-relaxed text-[var(--shop-text-muted)]">
                {listing.description}
              </p>
            </div>
          )}

          {listing.sizeChart && (
            <div className="shop-card p-5">
              <h2 className="mb-2 font-semibold text-[var(--shop-text-primary)]">
                Beden Tablosu
              </h2>
              <p className="whitespace-pre-wrap leading-relaxed text-[var(--shop-text-muted)]">
                {listing.sizeChart}
              </p>
            </div>
          )}

          <AddToCartForm
            sizes={listing.product.sizes.map((size) => ({
              id: size.id,
              size: size.size,
              currentStock: size.currentStock,
            }))}
            disabled={!inStock}
          />

          {listing.reviews.length > 0 && (
            <div className="shop-card p-5">
              <h2 className="mb-4 font-semibold text-[var(--shop-text-primary)]">
                Yorumlar
              </h2>
              <div className="space-y-4">
                {listing.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-[var(--shop-border)] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-[var(--shop-text-primary)]">
                        {review.authorName}
                      </p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--shop-text-muted)]">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
