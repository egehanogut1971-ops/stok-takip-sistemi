import Link from "next/link";
import { HeroSection } from "@/components/shop/HeroSection";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryNav } from "@/components/shop/CategoryNav";
import {
  getPublishedListings,
  getShopCategories,
} from "@/lib/shop";

type PageProps = {
  searchParams: Promise<{ q?: string; kategori?: string }>;
};

export default async function MagazaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const categoryId = params.kategori;
  const showHero = !q && !categoryId;

  const [listings, categories] = await Promise.all([
    getPublishedListings({ q, categoryId }),
    getShopCategories(),
  ]);

  return (
    <div className="space-y-10">
      {showHero && <HeroSection />}

      <section id="kategoriler" className="scroll-mt-24">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Kategoriler</h2>
        <CategoryNav categories={categories} activeId={categoryId} />
      </section>

      <section id="urunler" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {q ? `"${q}" arama sonuçları` : "Tüm Ürünler"}
            </h2>
            <p className="mt-1 text-[var(--shop-text-muted)]">
              {listings.length} ürün listeleniyor
            </p>
          </div>
          <form action="/magaza" method="get" className="flex gap-2 md:hidden">
            <input
              name="q"
              defaultValue={q}
              placeholder="Ara..."
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            >
              Ara
            </button>
          </form>
        </div>

        {listings.length === 0 ? (
          <div className="shop-card border border-dashed border-[var(--shop-border)] p-16 text-center">
            <p className="text-lg text-[var(--shop-text-muted)]">Henüz yayında ürün yok.</p>
            <p className="mt-2 text-sm text-[var(--shop-text-faint)]">
              Stok panelinden ürün ekleyin, ardından Mağaza Yönetimi&apos;nden vitrine çıkarın.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {(q || categoryId) && (
          <div className="text-center">
            <Link
              href="/magaza"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Tüm ürünleri göster
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
