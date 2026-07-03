"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function ShopLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/magaza";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-posta veya şifre hatalı.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-[var(--shop-text-primary)]">Giriş Yap</h1>
      <p className="mt-2 text-[var(--shop-text-muted)]">
        Hesabınıza e-posta ve şifrenizle giriş yapın.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            required
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <button type="submit" disabled={loading} className="shop-btn-primary w-full">
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--shop-text-muted)]">
        Hesabınız yok mu?{" "}
        <Link href="/magaza/kayit" className="font-medium text-[var(--shop-accent)] hover:underline">
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}
