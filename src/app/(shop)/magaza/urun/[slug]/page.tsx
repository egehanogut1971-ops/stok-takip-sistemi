import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ProductGallery,
  ProductPurchasePanel,
} from "@/components/shop/ProductDetailClient";
import { formatCurrency } from "@/lib/profit";
import {
  getPublishedListingBySlug,
  isListingInStock,
} from "@/lib/shop";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getPublishedListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const inStock = isListingInStock(listing.product.sizes);
  const sizes = listing.product.sizes.map((size) => ({
    id: size.id,
    size: size.size,
    currentStock: size.currentStock,
  }));

  return (
    <div className="space-y-10 pb-8">
      <nav className="text-[11px] uppercase tracking-[0.15em] text-[var(--shop-text-muted)]">
        <Link href="/magaza" className="hover:text-[var(--shop-text-primary)]">
          Mağaza
        </Link>
        <span className="mx-2">/</span>
        <span>{listing.displayName}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery
          images={listing.images}
          displayName={listing.displayName}
        />

        <div className="space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--shop-text-muted)]">
              {listing.product.category.name}
            </p>
            <h1 className="font-display mt-2 text-3xl lg:text-4xl">
              {listing.displayName}
            </h1>
            <p className="mt-4 text-xl">{formatCurrency(listing.salePrice)}</p>
            <p className="mt-2 text-sm text-[var(--shop-text-muted)]">
              {inStock ? "Stokta" : "Tükendi"}
            </p>
          </div>

          {listing.description && (
            <div className="border-t border-[var(--shop-border)] pt-6">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--shop-text-muted)]">
                Açıklama
              </h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--shop-text-secondary)]">
                {listing.description}
              </p>
            </div>
          )}

          {listing.sizeChart && (
            <div className="border-t border-[var(--shop-border)] pt-6">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--shop-text-muted)]">
                Beden Tablosu
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--shop-text-secondary)]">
                {listing.sizeChart}
              </p>
            </div>
          )}

          <ProductPurchasePanel
            sizes={sizes}
            inStock={inStock}
            displayName={listing.displayName}
          />
        </div>
      </div>
    </div>
  );
}
