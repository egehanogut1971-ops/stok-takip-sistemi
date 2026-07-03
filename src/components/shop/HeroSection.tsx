import Link from "next/link";
import { getShopName, getShopTagline } from "@/lib/shopConfig";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 px-6 py-14 text-white shadow-lg sm:px-10 sm:py-20">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-xl" />
      <div className="relative max-w-xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-100">
          Online Alışveriş
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {getShopName()}
        </h1>
        <p className="mt-4 text-base text-emerald-50 sm:text-lg">
          {getShopTagline()}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/magaza#urunler"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow hover:bg-emerald-50"
          >
            Alışverişe Başla
          </Link>
          <Link
            href="/magaza#kategoriler"
            className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Kategoriler
          </Link>
        </div>
      </div>
    </section>
  );
}
