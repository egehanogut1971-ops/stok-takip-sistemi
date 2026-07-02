"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfitPreview } from "@/components/ProfitPreview";
import { UNITS } from "@/lib/constants";
import { formatCurrency, formatPercent, calcProfit } from "@/lib/profit";

type Category = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  currentStock: number;
  category: Category;
};

const emptyForm = {
  name: "",
  sku: "",
  categoryId: "",
  costPrice: "",
  salePrice: "",
  minStock: "0",
  initialStock: "0",
  unit: "adet",
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [csvText, setCsvText] = useState("");

  function loadData() {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([p, c]) => {
      setProducts(p);
      setCategories(c);
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  function startEdit(product: Product) {
    setEditId(product.id);
    setForm({
      name: product.name,
      sku: product.sku ?? "",
      categoryId: product.category.id,
      costPrice: String(product.costPrice),
      salePrice: String(product.salePrice),
      minStock: String(product.minStock),
      initialStock: "0",
      unit: product.unit,
    });
  }

  function resetForm() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: form.name,
      sku: form.sku || null,
      categoryId: form.categoryId,
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
      minStock: Number(form.minStock),
      initialStock: editId ? 0 : Number(form.initialStock),
      unit: form.unit,
    };

    const res = await fetch(editId ? `/api/products/${editId}` : "/api/products", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "İşlem başarısız.");
      return;
    }

    setSuccess(editId ? "Ürün güncellendi." : "Ürün eklendi.");
    resetForm();
    loadData();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadData();
    router.refresh();
  }

  async function handleImport() {
    setError("");
    setSuccess("");
    const lines = csvText.trim().split("\n").slice(1);
    const rows = lines.map((line) => {
      const [name, category, quantity, costPrice, salePrice, minStock] =
        line.split(",").map((s) => s.trim());
      return {
        name,
        category,
        quantity: Number(quantity ?? 0),
        costPrice: Number(costPrice ?? 0),
        salePrice: Number(salePrice ?? 0),
        minStock: Number(minStock ?? 0),
      };
    });

    const res = await fetch("/api/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "İçe aktarma başarısız.");
      return;
    }
    setSuccess(`${data.imported} ürün içe aktarıldı.`);
    setCsvText("");
    loadData();
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Ürünler</h1>
        <p className="mt-1 text-lg text-slate-600">Ürün ekle, düzenle veya CSV ile içe aktar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{editId ? "Ürün Düzenle" : "Yeni Ürün"}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            placeholder="Ürün adı"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border px-4 py-3 text-lg"
            required
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="rounded-lg border px-4 py-3 text-lg"
            required
          >
            <option value="">Kategori seçin</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            placeholder="SKU (isteğe bağlı)"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="rounded-lg border px-4 py-3 text-lg"
          />
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="rounded-lg border px-4 py-3 text-lg"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Alış fiyatı"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            className="rounded-lg border px-4 py-3 text-lg"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Satış fiyatı"
            value={form.salePrice}
            onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            className="rounded-lg border px-4 py-3 text-lg"
            required
          />
          <input
            type="number"
            placeholder="Minimum stok"
            value={form.minStock}
            onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            className="rounded-lg border px-4 py-3 text-lg"
          />
          {!editId && (
            <input
              type="number"
              placeholder="Başlangıç stoku"
              value={form.initialStock}
              onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
              className="rounded-lg border px-4 py-3 text-lg"
            />
          )}
        </div>

        <ProfitPreview
          costPrice={Number(form.costPrice) || 0}
          salePrice={Number(form.salePrice) || 0}
        />

        {error && <p className="text-red-700">{error}</p>}
        {success && <p className="text-green-700">{success}</p>}

        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white">
            {editId ? "Güncelle" : "Ekle"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="rounded-lg border px-6 py-3">
              İptal
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">CSV ile Toplu İçe Aktarma</h2>
        <p className="mb-3 text-sm text-slate-600">
          Format: ad,kategori,adet,alış,satış,minStok (ilk satır başlık)
        </p>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={5}
          className="w-full rounded-lg border px-4 py-3 font-mono text-sm"
          placeholder="ad,kategori,adet,alis,satis,minStok&#10;Ürün A,Elektronik,10,100,150,2"
        />
        <button
          onClick={handleImport}
          className="mt-3 rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white"
        >
          CSV İçe Aktar
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-base">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Ürün</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-left">Stok</th>
              <th className="px-4 py-3 text-left">Kar</th>
              <th className="px-4 py-3 text-left">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const { unitProfit, margin } = calcProfit(p.salePrice, p.costPrice);
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.category.name}</td>
                  <td className="px-4 py-3">{p.currentStock} {p.unit}</td>
                  <td className="px-4 py-3">{formatCurrency(unitProfit)} ({formatPercent(margin)})</td>
                  <td className="px-4 py-3">
                    <button onClick={() => startEdit(p)} className="mr-2 text-emerald-700 hover:underline">Düzenle</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Sil</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
