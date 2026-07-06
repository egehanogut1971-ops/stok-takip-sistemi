"use client";

import { useCartDrawer } from "@/components/shop/CartDrawerProvider";

export function CartLink() {
  const { cartCount, openCart } = useCartDrawer();

  return (
    <button
      type="button"
      onClick={() => openCart("cart")}
      className="relative flex items-center gap-1.5 px-2 py-2 text-sm text-[var(--shop-text-secondary)] transition hover:text-[var(--shop-text-primary)]"
      aria-label="Sepeti aç"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <span className="hidden text-[11px] uppercase tracking-wider sm:inline">
        Sepet
      </span>
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-[var(--shop-accent)] px-1 text-[10px] font-medium text-white">
          {cartCount}
        </span>
      )}
    </button>
  );
}
