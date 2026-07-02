"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ürün ara..."
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base lg:w-72"
      />
      <button
        type="submit"
        className="rounded-lg bg-slate-800 px-4 py-2.5 text-base font-medium text-white hover:bg-slate-900"
      >
        Ara
      </button>
    </form>
  );
}
