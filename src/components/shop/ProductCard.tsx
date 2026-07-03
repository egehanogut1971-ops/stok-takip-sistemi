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
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-slate-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            Görsel yok
          </div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          {product.category.name}
        </p>
        <h2 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
          {product.name}
        </h2>
        <p className="text-lg font-bold text-slate-900">
          {formatCurrency(product.salePrice)}
        </p>
        <p className={`text-sm ${inStock ? "text-slate-500" : "text-red-600"}`}>
          {inStock ? "Stokta var" : "Tükendi"}
        </p>
      </div>
    </Link>
  );
}
