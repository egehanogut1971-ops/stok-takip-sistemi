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
      className="relative rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:border-emerald-600 hover:text-emerald-700"
    >
      Sepet
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
