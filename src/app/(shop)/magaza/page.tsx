import { HeroSection } from "@/components/shop/HeroSection";
import { ProductCard } from "@/components/shop/ProductCard";
import { getFeaturedListings, getPublishedListings } from "@/lib/shop";

type PageProps = {
  searchParams: Promise<{ q?: string; kategori?: string }>;
};

export default async function MagazaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const categoryId = params.kategori;
  const showHero = !q && !categoryId;

  const [listings, featured] = await Promise.all([
    getPublishedListings({ q, categoryId }),
    showHero ? getFeaturedListings(8) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-16">
      {showHero && <HeroSection />}

      {showHero && featured.length > 0 && (
        <section id="yeni-sezon" className="scroll-mt-24 space-y-8">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--shop-text-muted)]">
              Öne Çıkanlar
            </p>
            <h2 className="font-display mt-2 text-3xl text-[var(--shop-text-primary)]">
              Yeni Sezon
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      <section id="urunler" className="scroll-mt-24 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--shop-text-muted)]">
              Koleksiyon
            </p>
            <h2 className="font-display mt-2 text-3xl text-[var(--shop-text-primary)]">
              {q ? `"${q}"` : "Tüm Ürünler"}
            </h2>
          </div>
          <form action="/magaza" method="get" className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Ara..."
              className="shop-input w-full min-w-[200px] text-sm sm:w-56"
            />
          </form>
        </div>

        {listings.length === 0 ? (
          <div className="border border-dashed border-[var(--shop-border)] py-16 text-center text-[var(--shop-text-muted)]">
            Ürün bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
