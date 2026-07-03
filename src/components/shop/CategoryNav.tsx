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
            ? "bg-[var(--shop-accent)] text-white"
            : "bg-[var(--shop-surface)] text-[var(--shop-text-secondary)] ring-1 ring-[var(--shop-border)] hover:ring-[var(--shop-accent)]"
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
              ? "bg-[var(--shop-accent)] text-white"
              : "bg-[var(--shop-surface)] text-[var(--shop-text-secondary)] ring-1 ring-[var(--shop-border)] hover:ring-[var(--shop-accent)]"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
