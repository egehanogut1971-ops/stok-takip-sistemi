import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { getShopCategories } from "@/lib/shop";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function ShopLayout({ children }: LayoutProps) {
  const categories = await getShopCategories();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <ShopHeader categories={categories} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">
        {children}
      </main>
      <ShopFooter />
    </div>
  );
}
