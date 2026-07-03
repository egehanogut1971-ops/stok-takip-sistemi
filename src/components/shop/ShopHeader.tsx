import Link from "next/link";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { getShopName } from "@/lib/shopConfig";
import { CartLink } from "@/components/shop/CartLink";
import { CategoryNav } from "@/components/shop/CategoryNav";

type Category = { id: string; name: string };

export async function ShopHeader({
  categories = [],
  activeCategoryId,
}: {
  categories?: Category[];
  activeCategoryId?: string;
}) {
  const session = await auth();
  const showAdminLink = session?.user && isStaff(session.user.role);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/magaza"
            className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              {getShopName().charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline">{getShopName()}</span>
          </Link>

          <form
            action="/magaza"
            method="get"
            className="hidden flex-1 max-w-md md:block"
          >
            <input
              name="q"
              placeholder="Ürün ara..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
            />
          </form>

          <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
            <CartLink />
            {showAdminLink && (
              <Link
                href="/"
                className="hidden rounded-full bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 sm:inline-block sm:text-sm"
              >
                Yönetim
              </Link>
            )}
          </nav>
        </div>

        {categories.length > 0 && (
          <div className="border-t border-slate-100 py-3">
            <CategoryNav categories={categories} activeId={activeCategoryId} />
          </div>
        )}
      </div>
    </header>
  );
}
