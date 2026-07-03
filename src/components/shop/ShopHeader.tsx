import Link from "next/link";
import { auth } from "@/lib/auth";
import { getShopName } from "@/lib/shopConfig";
import { CartLink } from "@/components/shop/CartLink";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ROLES } from "@/lib/roles";
import { ShopAuthNav } from "@/components/shop/ShopAuthNav";

type Category = { id: string; name: string };

export async function ShopHeader({
  categories = [],
  activeCategoryId,
}: {
  categories?: Category[];
  activeCategoryId?: string;
}) {
  const session = await auth();
  const isCustomer = session?.user?.role === ROLES.CUSTOMER;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--shop-border)] bg-[var(--shop-surface)]/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/magaza"
            className="flex shrink-0 items-center gap-2 text-xl font-semibold tracking-tight text-[var(--shop-text-primary)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--shop-accent)] text-sm font-bold text-white">
              {getShopName().charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline">{getShopName()}</span>
          </Link>

          <form
            action="/magaza"
            method="get"
            className="hidden max-w-md flex-1 md:block"
          >
            <input
              name="q"
              placeholder="Ürün ara..."
              className="shop-input w-full rounded-full"
            />
          </form>

          <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ShopAuthNav
              isLoggedIn={!!session?.user}
              isCustomer={isCustomer}
              userName={session?.user?.name}
            />
            <CartLink />
          </nav>
        </div>

        {categories.length > 0 && (
          <div className="border-t border-[var(--shop-border)] py-3">
            <CategoryNav categories={categories} activeId={activeCategoryId} />
          </div>
        )}
      </div>
    </header>
  );
}
