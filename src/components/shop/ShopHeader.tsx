import Link from "next/link";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/roles";
import { CartLink } from "@/components/shop/CartLink";

export async function ShopHeader() {
  const session = await auth();
  const showAdminLink = session?.user && isStaff(session.user.role);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/magaza" className="text-xl font-bold text-emerald-700">
          Mağaza
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/magaza" className="text-slate-700 hover:text-emerald-700">
            Ürünler
          </Link>
          <CartLink />
          {showAdminLink && (
            <Link
              href="/"
              className="rounded-lg bg-slate-800 px-3 py-2 text-white hover:bg-slate-700"
            >
              Yönetim Paneli
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
