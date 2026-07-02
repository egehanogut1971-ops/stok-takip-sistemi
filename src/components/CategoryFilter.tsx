"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("categoryId") ?? "";

  function updateCategory(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      <label htmlFor="category" className="text-base font-medium text-slate-700">
        Kategori:
      </label>
      <select
        id="category"
        value={selected}
        onChange={(e) => updateCategory(e.target.value)}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-base"
      >
        <option value="">Tüm Kategoriler</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {selected && (
        <button
          onClick={() => updateCategory("")}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
        >
          Filtreyi Temizle
        </button>
      )}
    </div>
  );
}
