import Link from "next/link";
import { getShopName, getShopTagline } from "@/lib/shopConfig";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden shop-card bg-[var(--shop-text-primary)] px-6 py-14 text-white sm:px-10 sm:py-20">
      <div className="relative max-w-xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-white/60">
          Online Alışveriş
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {getShopName()}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
          {getShopTagline()}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/magaza#urunler"
            className="shop-btn-primary rounded-full bg-white px-6 py-3 text-sm text-[var(--shop-text-primary)] hover:bg-white/90"
          >
            Alışverişe Başla
          </Link>
          <Link
            href="/magaza#kategoriler"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Kategoriler
          </Link>
        </div>
      </div>
    </section>
  );
}
