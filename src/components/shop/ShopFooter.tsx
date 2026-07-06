import Link from "next/link";
import { getShopName } from "@/lib/shopConfig";

export function ShopFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--shop-border)] bg-[var(--shop-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:justify-between lg:px-8">
        <div>
          <p className="font-display text-lg text-[var(--shop-text-primary)]">
            {getShopName()}
          </p>
          <p className="mt-2 max-w-xs text-sm text-[var(--shop-text-muted)]">
            Minimal tasarım, kaliteli kumaş, beden bazlı stok takibi.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <ul className="space-y-2 text-[var(--shop-text-muted)]">
            <li>
              <Link href="/magaza" className="hover:text-[var(--shop-text-primary)]">
                Mağaza
              </Link>
            </li>
            <li>
              <Link href="/magaza/mesafeli-satis" className="hover:text-[var(--shop-text-primary)]">
                Mesafeli Satış
              </Link>
            </li>
          </ul>
          <ul className="space-y-2 text-[var(--shop-text-muted)]">
            <li>
              <Link href="/magaza/gizlilik" className="hover:text-[var(--shop-text-primary)]">
                Gizlilik
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--shop-border)] py-4 text-center text-xs text-[var(--shop-text-faint)]">
        © {year} {getShopName()}
      </div>
    </footer>
  );
}
