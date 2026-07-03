import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
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

  const [products, categories] = await Promise.all([
    getPublishedProducts({ q, categoryId }),
    getShopCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ürünler</h1>
        <p className="mt-2 text-slate-600">
          Yayında olan ürünlerimizi inceleyin.
        </p>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Ürün ara..."
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3"
        />
        <select
          name="kategori"
          defaultValue={categoryId ?? ""}
          className="rounded-lg border border-slate-300 px-4 py-3"
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Filtrele
        </button>
      </form>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-lg text-slate-600">
            Henüz yayında ürün bulunmuyor.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Yönetim panelinden ürün ekleyip &quot;Mağazada yayınla&quot;
            seçeneğini işaretleyin.
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
          <Link href="/magaza" className="text-emerald-700 hover:underline">
            Filtreleri temizle
          </Link>
        </div>
      )}
    </div>
  );
}
