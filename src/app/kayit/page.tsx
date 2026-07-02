"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, confirmPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Kayıt başarısız.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-emerald-700">Kayıt Ol</h1>
        <p className="mt-2 text-lg text-slate-600">Yeni hesap oluşturun</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-base font-medium">Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-base font-medium">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-base font-medium">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg"
              minLength={4}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-base font-medium">Şifre Tekrar</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg"
              minLength={4}
              required
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-3 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="mt-6 text-center text-base text-slate-600">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
