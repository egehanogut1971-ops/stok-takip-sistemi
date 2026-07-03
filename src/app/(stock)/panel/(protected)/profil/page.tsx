"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setMessage("Şifreniz güncellendi.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="mt-1 text-lg text-slate-600">Hesap bilgileriniz</p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-lg"><strong>Ad:</strong> {session?.user?.name}</p>
        <p className="mt-2 text-lg"><strong>Kullanıcı adı:</strong> {session?.user?.username}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Şifre Değiştir</h2>
        <input
          type="password"
          placeholder="Mevcut şifre"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-lg"
          required
        />
        <input
          type="password"
          placeholder="Yeni şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-lg"
          minLength={4}
          required
        />
        <input
          type="password"
          placeholder="Yeni şifre tekrar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-lg"
          minLength={4}
          required
        />
        {error && <p className="text-red-700">{error}</p>}
        {message && <p className="text-green-700">{message}</p>}
        <button type="submit" className="w-full rounded-lg bg-emerald-600 py-3 text-lg font-semibold text-white">
          Şifreyi Güncelle
        </button>
      </form>
    </div>
  );
}
