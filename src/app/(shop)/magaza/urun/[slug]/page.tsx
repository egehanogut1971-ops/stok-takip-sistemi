import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { formatCurrency } from "@/lib/profit";
import { getPublishedProductBySlug, getTotalStock } from "@/lib/shop";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const totalStock = getTotalStock(product.sizes);
  const cover = product.images[0]?.url;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link href="/magaza" className="hover:text-emerald-700">
          Mağaza
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-400">
                Görsel yok
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl border-2 border-transparent object-cover ring-slate-200 hover:border-emerald-500"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
              {product.category.name}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">
              {product.name}
            </h1>
          </div>

          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(product.salePrice)}
          </p>

          <p
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              totalStock > 0
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {totalStock > 0
              ? `${totalStock} adet stokta`
              : "Bu ürün şu an tükendi"}
          </p>

          {product.description && (
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="mb-2 font-semibold text-slate-900">Açıklama</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                {product.description}
              </p>
            </div>
          )}

          <AddToCartForm
            sizes={product.sizes.map((size) => ({
              id: size.id,
              size: size.size,
              currentStock: size.currentStock,
            }))}
            disabled={totalStock <= 0}
          />
        </div>
      </div>
    </div>
  );
}
