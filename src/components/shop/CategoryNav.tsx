import Link from "next/link";

type Category = { id: string; name: string };

export function CategoryNav({
  categories,
  activeId,
}: {
  categories: Category[];
  activeId?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href="/magaza"
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
          !activeId
            ? "bg-emerald-600 text-white"
            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-emerald-300"
        }`}
      >
        Tümü
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/magaza?kategori=${cat.id}`}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
            activeId === cat.id
              ? "bg-emerald-600 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-emerald-300"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
