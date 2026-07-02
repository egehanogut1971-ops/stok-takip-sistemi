"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  _count?: { products: number };
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setName("");
    load();
    router.refresh();
  }

  async function handleUpdate(id: string) {
    setError("");
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setEditId(null);
    load();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Kategoriyi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    load();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kategoriler</h1>
        <p className="mt-1 text-lg text-slate-600">Ürün kategorilerini yönetin</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 rounded-xl border bg-white p-4 shadow-sm">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yeni kategori adı"
          className="flex-1 rounded-lg border px-4 py-3 text-lg"
          required
        />
        <button type="submit" className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white">
          Ekle
        </button>
      </form>

      {error && <p className="text-red-700">{error}</p>}

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
            {editId === cat.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-2 text-lg"
                />
                <button onClick={() => handleUpdate(cat.id)} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">
                  Kaydet
                </button>
                <button onClick={() => setEditId(null)} className="rounded-lg border px-4 py-2">
                  İptal
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-lg font-medium">{cat.name}</p>
                  <p className="text-sm text-slate-500">{cat._count?.products ?? 0} ürün</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                    className="text-emerald-700 hover:underline"
                  >
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline">
                    Sil
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
