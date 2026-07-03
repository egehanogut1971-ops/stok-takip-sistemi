"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/profit";
import { getTotalStock } from "@/lib/stockUtils";

type Category = { id: string; name: string };
type ProductSize = { id: string; size: string; currentStock: number };
type PendingProduct = {
  id: string;
  name: string;
  category: Category;
  sizes: ProductSize[];
};

type Review = {
  authorName: string;
  rating: number;
  text: string;
};

type Listing = {
  id: string;
  displayName: string;
  slug: string;
  salePrice: number;
  description: string | null;
  sizeChart: string | null;
  isPublished: boolean;
  images: { url: string; sortOrder: number }[];
  reviews: { authorName: string; rating: number; text: string }[];
  product: PendingProduct;
};

type ReviewRow = {
  authorName: string;
  rating: string;
  text: string;
};

const emptyForm = {
  displayName: "",
  salePrice: "",
  description: "",
  sizeChart: "",
  slug: "",
  isPublished: true,
  imageUrls: "",
};

function emptyReview(): ReviewRow {
  return { authorName: "", rating: "5", text: "" };
}

export function ShopListingManager() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingProduct[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editListingId, setEditListingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  function loadData() {
    setLoading(true);
    fetch("/api/shop/listings")
      .then((r) => r.json())
      .then((data) => {
        setPending(data.pending ?? []);
        setListings(data.listings ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setSelectedProductId(null);
    setEditListingId(null);
    setForm(emptyForm);
    setReviewRows([]);
    setError("");
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/shop/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Fotoğraf yüklenemedi.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls
          ? `${prev.imageUrls.trim()}\n${data.url}`
          : data.url,
      }));
      setSuccess("Fotoğraf yüklendi.");
    } catch {
      setError("Fotoğraf yüklenemedi.");
    } finally {
      setUploadingImage(false);
    }
  }

  function startCreate(product: PendingProduct) {
    setSelectedProductId(product.id);
    setEditListingId(null);
    setForm({
      ...emptyForm,
      displayName: product.name,
      isPublished: true,
    });
    setReviewRows([]);
  }

  function startEdit(listing: Listing) {
    setSelectedProductId(listing.product.id);
    setEditListingId(listing.id);
    setForm({
      displayName: listing.displayName,
      salePrice: String(listing.salePrice),
      description: listing.description ?? "",
      sizeChart: listing.sizeChart ?? "",
      slug: listing.slug,
      isPublished: listing.isPublished,
      imageUrls: listing.images.map((img) => img.url).join("\n"),
    });
    setReviewRows(
      listing.reviews.length > 0
        ? listing.reviews.map((r) => ({
            authorName: r.authorName,
            rating: String(r.rating),
            text: r.text,
          }))
        : [],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const reviews: Review[] = reviewRows
      .filter((r) => r.authorName.trim() && r.text.trim())
      .map((r) => ({
        authorName: r.authorName.trim(),
        rating: Number(r.rating),
        text: r.text.trim(),
      }));

    const payload = {
      ...(editListingId ? {} : { productId: selectedProductId }),
      displayName: form.displayName,
      salePrice: Number(form.salePrice),
      description: form.description || null,
      sizeChart: form.sizeChart || null,
      slug: form.slug || undefined,
      isPublished: form.isPublished,
      images: form.imageUrls
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      reviews,
    };

    const res = await fetch(
      editListingId
        ? `/api/shop/listings/${editListingId}`
        : "/api/shop/listings",
      {
        method: editListingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Kaydedilemedi.");
      return;
    }

    setSuccess(editListingId ? "Vitrin güncellendi." : "Ürün mağazaya eklendi.");
    resetForm();
    loadData();
    router.refresh();
  }

  async function handleUnpublish(id: string) {
    if (!confirm("Bu ürünü mağazadan kaldırmak istiyor musunuz?")) return;
    await fetch(`/api/shop/listings/${id}`, { method: "DELETE" });
    loadData();
    router.refresh();
  }

  const selectedProduct = pending.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--shop-text-primary)]">
            Mağaza Yönetimi
          </h1>
          <p className="mt-1 text-[var(--shop-text-muted)]">
            Stoktaki ürünleri vitrine çıkarın — fiyat, foto ve açıklama burada.
          </p>
        </div>
        <Link
          href="/magaza"
          className="shop-btn-secondary inline-flex items-center justify-center px-4 py-2 text-sm"
        >
          Mağazaya git →
        </Link>
      </div>

      {(selectedProductId || editListingId) && (
        <form
          onSubmit={handleSubmit}
          className="shop-card space-y-4 p-6"
        >
          <h2 className="text-lg font-semibold text-[var(--shop-text-primary)]">
            {editListingId ? "Vitrini Düzenle" : "Mağazaya Ekle"}
          </h2>
          {selectedProduct && !editListingId && (
            <p className="text-sm text-[var(--shop-text-muted)]">
              Stok kaydı: <strong>{selectedProduct.name}</strong> (
              {getTotalStock(selectedProduct.sizes)} adet)
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Mağaza adı (müşterinin gördüğü)"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="shop-input md:col-span-2"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Satış fiyatı"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              className="shop-input"
              required
            />
            <input
              placeholder="URL slug (boş = otomatik)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="shop-input"
            />
          </div>

          <textarea
            placeholder="Ürün açıklaması"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="shop-input w-full"
          />

          <textarea
            placeholder="Beden tablosu (örn. M: göğüs 96 cm, boy 68 cm)"
            value={form.sizeChart}
            onChange={(e) => setForm({ ...form, sizeChart: e.target.value })}
            rows={4}
            className="shop-input w-full"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--shop-text-secondary)]">
              Fotoğraflar (her satıra bir URL veya dosya yükle)
            </label>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <label className="shop-btn-secondary inline-flex cursor-pointer px-4 py-2 text-sm">
                {uploadingImage ? "Yükleniyor..." : "Dosya yükle"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="text-xs text-[var(--shop-text-muted)]">
                Max 5MB · JPEG, PNG, WebP, GIF
              </span>
            </div>
            <textarea
              value={form.imageUrls}
              onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
              rows={3}
              className="shop-input w-full font-mono text-sm"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[var(--shop-text-primary)]">Yorumlar</h3>
              <button
                type="button"
                onClick={() => setReviewRows([...reviewRows, emptyReview()])}
                className="shop-btn-secondary px-3 py-1.5 text-sm"
              >
                + Yorum ekle
              </button>
            </div>
            {reviewRows.map((row, index) => (
              <div key={index} className="grid gap-2 rounded-xl bg-[var(--shop-surface-muted)] p-4 md:grid-cols-[1fr_80px_2fr_auto]">
                <input
                  placeholder="İsim"
                  value={row.authorName}
                  onChange={(e) => {
                    const next = [...reviewRows];
                    next[index] = { ...row, authorName: e.target.value };
                    setReviewRows(next);
                  }}
                  className="shop-input"
                />
                <select
                  value={row.rating}
                  onChange={(e) => {
                    const next = [...reviewRows];
                    next[index] = { ...row, rating: e.target.value };
                    setReviewRows(next);
                  }}
                  className="shop-input"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} yıldız</option>
                  ))}
                </select>
                <input
                  placeholder="Yorum metni"
                  value={row.text}
                  onChange={(e) => {
                    const next = [...reviewRows];
                    next[index] = { ...row, text: e.target.value };
                    setReviewRows(next);
                  }}
                  className="shop-input"
                />
                <button
                  type="button"
                  onClick={() =>
                    setReviewRows(reviewRows.filter((_, i) => i !== index))
                  }
                  className="text-sm text-[var(--shop-error)]"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              className="h-4 w-4"
            />
            <span className="text-sm text-[var(--shop-text-secondary)]">
              Mağazada yayınla
            </span>
          </label>

          {error && <p className="text-sm text-[var(--shop-error)]">{error}</p>}
          {success && <p className="text-sm text-[var(--shop-success)]">{success}</p>}

          <div className="flex gap-3">
            <button type="submit" className="shop-btn-primary px-6 py-2.5">
              {editListingId ? "Kaydet" : "Mağazaya Ekle"}
            </button>
            <button type="button" onClick={resetForm} className="shop-btn-secondary px-6 py-2.5">
              İptal
            </button>
          </div>
        </form>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--shop-text-primary)]">
          Stokta var, mağazada yok
        </h2>
        {loading ? (
          <p className="text-[var(--shop-text-muted)]">Yükleniyor...</p>
        ) : pending.length === 0 ? (
          <p className="shop-card p-6 text-[var(--shop-text-muted)]">
            Tüm stok ürünleri mağazaya eklenmiş veya henüz stok ürünü yok.
          </p>
        ) : (
          <div className="overflow-x-auto shop-card">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--shop-border)] text-left text-[var(--shop-text-muted)]">
                  <th className="px-4 py-3">Stok adı</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((product) => (
                  <tr key={product.id} className="border-b border-[var(--shop-border)]">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{product.category.name}</td>
                    <td className="px-4 py-3">{getTotalStock(product.sizes)} adet</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => startCreate(product)}
                        className="shop-btn-primary px-3 py-1.5 text-sm"
                      >
                        Mağazaya ekle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--shop-text-primary)]">
          Mağazada (vitrin)
        </h2>
        {listings.length === 0 ? (
          <p className="shop-card p-6 text-[var(--shop-text-muted)]">
            Henüz vitrin ürünü yok.
          </p>
        ) : (
          <div className="overflow-x-auto shop-card">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--shop-border)] text-left text-[var(--shop-text-muted)]">
                  <th className="px-4 py-3">Mağaza adı</th>
                  <th className="px-4 py-3">Stok adı</th>
                  <th className="px-4 py-3">Fiyat</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-[var(--shop-border)]">
                    <td className="px-4 py-3 font-medium">{listing.displayName}</td>
                    <td className="px-4 py-3 text-[var(--shop-text-muted)]">
                      {listing.product.name}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(listing.salePrice)}</td>
                    <td className="px-4 py-3">
                      {listing.isPublished ? (
                        <a
                          href={`/magaza/urun/${listing.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--shop-success)] hover:underline"
                        >
                          Yayında
                        </a>
                      ) : (
                        <span className="text-[var(--shop-warning)]">Taslak</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => startEdit(listing)}
                        className="mr-3 text-[var(--shop-accent)] hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnpublish(listing.id)}
                        className="text-[var(--shop-error)] hover:underline"
                      >
                        Kaldır
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
