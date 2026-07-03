import Link from "next/link";
import { HeroSection } from "@/components/shop/HeroSection";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryNav } from "@/components/shop/CategoryNav";
import {
  getPublishedProducts,
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

  const [products, categories] = await Promise.all([
    getPublishedProducts({ q, categoryId }),
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
            <p className="mt-1 text-slate-600">
              {products.length} ürün listeleniyor
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

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <p className="text-lg text-slate-600">Henüz yayında ürün yok.</p>
            <p className="mt-2 text-sm text-slate-500">
              Yönetim panelinden ürün ekleyip &quot;Mağazada yayınla&quot;
              işaretleyin.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
