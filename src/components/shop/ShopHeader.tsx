import Link from "next/link";
import { auth } from "@/lib/auth";
import { getShopName } from "@/lib/shopConfig";
import { CartLink } from "@/components/shop/CartLink";
import { ROLES } from "@/lib/roles";
import { ShopAuthNav } from "@/components/shop/ShopAuthNav";

export async function ShopHeader() {
  const session = await auth();
  const isCustomer = session?.user?.role === ROLES.CUSTOMER;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--shop-border)] bg-[var(--shop-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
        <Link
          href="/magaza"
          className="font-display text-xl tracking-wide text-[var(--shop-text-primary)] sm:text-2xl"
        >
          {getShopName()}
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/magaza#urunler"
            className="hidden text-[11px] uppercase tracking-[0.15em] text-[var(--shop-text-muted)] hover:text-[var(--shop-text-primary)] sm:inline"
          >
            Ürünler
          </Link>
          <ShopAuthNav
            isLoggedIn={!!session?.user}
            isCustomer={isCustomer}
            userName={session?.user?.name}
          />
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
