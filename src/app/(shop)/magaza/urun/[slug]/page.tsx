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
      <Link href="/magaza" className="text-emerald-700 hover:underline">
        ← Ürünlere dön
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-slate-200 p-3">
              {product.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt=""
                  className="h-16 w-16 rounded-lg border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              {product.category.name}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {product.name}
            </h1>
          </div>

          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(product.salePrice)}
          </p>

          <p className={totalStock > 0 ? "text-slate-600" : "text-red-600"}>
            {totalStock > 0
              ? `${totalStock} adet stokta`
              : "Bu ürün şu an tükendi"}
          </p>

          {product.description && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-2 font-semibold">Açıklama</h2>
              <p className="whitespace-pre-wrap text-slate-700">
                {product.description}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-semibold">Bedenler</h2>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => {
                const available = size.currentStock > 0;
                return (
                  <span
                    key={size.id}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                      available
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-100 text-slate-400 line-through"
                    }`}
                  >
                    {size.size}
                    {available && (
                      <span className="ml-1 text-xs">({size.currentStock})</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

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
