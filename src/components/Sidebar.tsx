"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Mevcut Stok" },
  { href: "/stok-gir", label: "Stok Giriş" },
  { href: "/stok-cik", label: "Stok Çıkış" },
  { href: "/urunler", label: "Ürünler" },
  { href: "/siparisler", label: "Siparişler" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/hareketler", label: "Hareketler" },
  { href: "/uyarilar", label: "Uyarılar" },
  { href: "/magaza", label: "Mağaza", external: true },
  { href: "/magaza/yonetim", label: "Mağaza Yönetimi", external: true },
  { href: "/profil", label: "Profil" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="no-print flex w-full flex-col border-r border-slate-200 bg-white lg:fixed lg:h-screen lg:w-64">
      <div className="border-b border-slate-200 px-6 py-5">
        <h1 className="text-xl font-bold text-emerald-700">Stok Takip</h1>
        <p className="mt-1 text-sm text-slate-500">Hoş geldin, {userName}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map((link) => {
          const active = pathname === link.href;
          const className = `rounded-lg px-4 py-3 text-base font-medium transition ${
            active
              ? "bg-emerald-600 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`;

          if ("external" in link && link.external) {
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {link.label}
              </a>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={className}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
