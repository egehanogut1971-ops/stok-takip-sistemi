import { ShopHeader } from "@/components/shop/ShopHeader";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</main>
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        Stok Takip Mağazası
      </footer>
    </div>
  );
}
