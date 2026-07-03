"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ShopRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/shop/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Kayıt sırasında bir hata oluştu.");
      return;
    }

    const result = await signIn("credentials", {
      username: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/magaza/giris");
      return;
    }

    router.push("/magaza");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-[var(--shop-text-primary)]">Kayıt Ol</h1>
      <p className="mt-2 text-[var(--shop-text-muted)]">
        Alışveriş için hesap oluşturun.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--shop-text-secondary)]">
            Ad Soyad
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shop-input w-full"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--shop-text-secondary)]">
            E-posta
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shop-input w-full"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--shop-text-secondary)]">
            Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shop-input w-full"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--shop-text-secondary)]">
            Şifre Tekrar
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shop-input w-full"
            minLength={6}
            required
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <button type="submit" disabled={loading} className="shop-btn-primary w-full">
          {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--shop-text-muted)]">
        Zaten hesabınız var mı?{" "}
        <Link href="/magaza/giris" className="font-medium text-[var(--shop-accent)] hover:underline">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
