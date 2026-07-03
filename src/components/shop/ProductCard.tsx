import Link from "next/link";
import { formatCurrency } from "@/lib/profit";
import {
  getProductCoverImage,
  getTotalStock,
} from "@/lib/shop";

type ProductCardProps = {
  product: {
    name: string;
    slug: string;
    salePrice: number;
    category: { name: string };
    sizes: { currentStock: number }[];
    images: { url: string; sortOrder: number }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const cover = getProductCoverImage(product.images);
  const totalStock = getTotalStock(product.sizes);
  const inStock = totalStock > 0;

  return (
    <Link
      href={`/magaza/urun/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-lg hover:ring-emerald-200"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Görsel yok
          </div>
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white">
            Tükendi
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 backdrop-blur">
          {product.category.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-emerald-700">
          {product.name}
        </h2>
        <div className="mt-auto flex items-end justify-between pt-3">
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(product.salePrice)}
          </p>
          {inStock && (
            <span className="text-xs text-emerald-600">Stokta</span>
          )}
        </div>
      </div>
    </Link>
  );
}
