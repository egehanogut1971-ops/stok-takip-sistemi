"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfitPreview } from "@/components/ProfitPreview";
import { SIZES } from "@/lib/constants";
import { formatCurrency, formatPercent, calcProfit } from "@/lib/profit";

type Category = { id: string; name: string };

type ProductSize = {
  id: string;
  size: string;
  currentStock: number;
  minStock: number;
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
  costPrice: number;
  salePrice: number;
  category: Category;
  sizes: ProductSize[];
};

type SizeFormRow = {
  id?: string;
  size: string;
  customSize: string;
  initialStock: string;
  minStock: string;
};

const emptyForm = {
  name: "",
  sku: "",
  categoryId: "",
  costPrice: "",
  salePrice: "",
};

function defaultSizeRow(): SizeFormRow {
  return {
    size: "M",
    customSize: "",
    initialStock: "0",
    minStock: "0",
  };
}

function sizeValue(row: SizeFormRow): string {
  return row.size === "__custom__" ? row.customSize.trim() : row.size;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [sizeRows, setSizeRows] = useState<SizeFormRow[]>([defaultSizeRow()]);
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
    });
    setSizeRows(
      product.sizes.map((s) => {
        const isPreset = (SIZES as readonly string[]).includes(s.size);
        return {
          id: s.id,
          size: isPreset ? s.size : "__custom__",
          customSize: isPreset ? "" : s.size,
          initialStock: "0",
          minStock: String(s.minStock),
        };
      }),
    );
  }

  function resetForm() {
    setEditId(null);
    setForm(emptyForm);
    setSizeRows([defaultSizeRow()]);
  }

  function addSizeRow() {
    setSizeRows([...sizeRows, defaultSizeRow()]);
  }

  function removeSizeRow(index: number) {
    if (sizeRows.length <= 1) return;
    setSizeRows(sizeRows.filter((_, i) => i !== index));
  }

  function updateSizeRow(index: number, patch: Partial<SizeFormRow>) {
    setSizeRows(
      sizeRows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const sizes = sizeRows.map((row) => ({
      id: row.id,
      size: sizeValue(row),
      initialStock: editId ? 0 : Number(row.initialStock),
      minStock: Number(row.minStock),
    }));

    const emptySize = sizes.find((s) => !s.size);
    if (emptySize) {
      setError("Tüm beden alanları doldurulmalıdır.");
      return;
    }

    const sizeNames = sizes.map((s) => s.size);
    if (new Set(sizeNames).size !== sizeNames.length) {
      setError("Aynı beden iki kez eklenemez.");
      return;
    }

    const payload = {
      name: form.name,
      sku: form.sku || null,
      categoryId: form.categoryId,
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
      sizes,
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
      const [name, category, size, quantity, costPrice, salePrice, minStock] =
        line.split(",").map((s) => s.trim());
      return {
        name,
        category,
        size: size || "Tek Beden",
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
    setSuccess(`${data.imported} satır içe aktarıldı.`);
    if (data.errors?.length) {
      setError(data.errors.join(" "));
    }
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
        </div>

        <ProfitPreview
          costPrice={Number(form.costPrice) || 0}
          salePrice={Number(form.salePrice) || 0}
        />

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Bedenler</h3>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-base">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Beden</th>
                  {!editId && (
                    <th className="px-3 py-2 text-left">Başlangıç stoku</th>
                  )}
                  <th className="px-3 py-2 text-left">Min. stok</th>
                  <th className="px-3 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map((row, index) => (
                  <tr key={row.id ?? index} className="border-t">
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <select
                          value={row.size}
                          onChange={(e) =>
                            updateSizeRow(index, { size: e.target.value })
                          }
                          className="rounded border px-2 py-2"
                        >
                          {SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          <option value="__custom__">Özel...</option>
                        </select>
                        {row.size === "__custom__" && (
                          <input
                            placeholder="Beden yazın"
                            value={row.customSize}
                            onChange={(e) =>
                              updateSizeRow(index, { customSize: e.target.value })
                            }
                            className="rounded border px-2 py-2"
                          />
                        )}
                      </div>
                    </td>
                    {!editId && (
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={row.initialStock}
                          onChange={(e) =>
                            updateSizeRow(index, { initialStock: e.target.value })
                          }
                          className="w-24 rounded border px-2 py-2"
                        />
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={row.minStock}
                        onChange={(e) =>
                          updateSizeRow(index, { minStock: e.target.value })
                        }
                        className="w-24 rounded border px-2 py-2"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeSizeRow(index)}
                        disabled={sizeRows.length <= 1}
                        className="text-red-600 hover:underline disabled:text-slate-400"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addSizeRow}
            className="rounded-lg border border-dashed border-emerald-600 px-4 py-2 text-emerald-700 hover:bg-emerald-50"
          >
            + Beden ekle
          </button>
        </div>

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
          Format: ad,kategori,beden,adet,alış,satış,minStok (ilk satır başlık)
        </p>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={5}
          className="w-full rounded-lg border px-4 py-3 font-mono text-sm"
          placeholder="ad,kategori,beden,adet,alis,satis,minStok&#10;Tişört,Giyim,S,5,100,150,2&#10;Tişört,Giyim,M,10,100,150,2"
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
              <th className="px-4 py-3 text-left">Bedenler</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-left">Toplam Stok</th>
              <th className="px-4 py-3 text-left">Kar</th>
              <th className="px-4 py-3 text-left">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const { unitProfit, margin } = calcProfit(p.salePrice, p.costPrice);
              const totalStock = p.sizes.reduce((s, sz) => s + sz.currentStock, 0);
              const sizeSummary = p.sizes
                .map((s) => `${s.size}: ${s.currentStock}`)
                .join(", ");
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-sm">{sizeSummary}</td>
                  <td className="px-4 py-3">{p.category.name}</td>
                  <td className="px-4 py-3">{totalStock} adet</td>
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
