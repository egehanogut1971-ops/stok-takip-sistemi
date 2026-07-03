"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/shop/cart")
      .then((res) => res.json())
      .then((data) => setCount(data.itemCount ?? 0))
      .catch(() => setCount(0));
  }, []);

  return (
    <Link
      href="/magaza/sepet"
      className="relative flex items-center gap-1.5 rounded-full border border-[var(--shop-border)] px-3 py-2 text-sm font-medium text-[var(--shop-text-secondary)] transition hover:border-[var(--shop-accent)] hover:text-[var(--shop-accent)]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <span className="hidden sm:inline">Sepet</span>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--shop-accent)] px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
