"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StaffAdminBar() {
  const pathname = usePathname();
  const onShopAdmin = pathname.startsWith("/magaza/yonetim");

  return (
    <div className="border-b border-[var(--shop-border)] bg-[var(--shop-surface-muted)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[13px] lg:px-8">
        <span className="text-[var(--shop-text-muted)]">Yönetici modu</span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3 py-1.5 font-medium text-[var(--shop-text-secondary)] transition hover:-translate-y-px"
          >
            Stok Paneli
          </Link>
          <Link
            href="/magaza/yonetim"
            className={`rounded-lg px-3 py-1.5 font-medium transition hover:-translate-y-px ${
              onShopAdmin
                ? "bg-[var(--shop-text-primary)] text-white"
                : "border border-[var(--shop-border)] bg-[var(--shop-surface)] text-[var(--shop-text-secondary)]"
            }`}
          >
            Mağaza Yönetimi
          </Link>
        </div>
      </div>
    </div>
  );
}
