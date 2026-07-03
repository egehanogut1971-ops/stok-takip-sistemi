"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type ShopAuthNavProps = {
  isLoggedIn: boolean;
  isCustomer: boolean;
  userName?: string | null;
};

export function ShopAuthNav({ isLoggedIn, isCustomer, userName }: ShopAuthNavProps) {
  if (isLoggedIn && isCustomer) {
    return (
      <div className="hidden items-center gap-3 sm:flex">
        <Link
          href="/magaza/hesabim"
          className="text-sm text-[var(--shop-text-muted)] hover:text-[var(--shop-text-primary)]"
        >
          Hesabım
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/magaza" })}
          className="text-sm text-[var(--shop-text-muted)] hover:text-[var(--shop-text-primary)]"
        >
          Çıkış
        </button>
      </div>
    );
  }

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <Link
        href="/magaza/giris"
        className="text-sm text-[var(--shop-text-muted)] hover:text-[var(--shop-text-primary)]"
      >
        Giriş
      </Link>
      <Link
        href="/magaza/kayit"
        className="text-sm font-medium text-[var(--shop-accent)] hover:underline"
      >
        Kayıt Ol
      </Link>
    </div>
  );
}
