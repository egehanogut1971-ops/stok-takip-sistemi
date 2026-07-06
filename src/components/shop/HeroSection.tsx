import Link from "next/link";
import { getShopName, getShopTagline } from "@/lib/shopConfig";

export function HeroSection() {
  return (
    <section className="relative -mx-4 min-h-[70vh] overflow-hidden lg:-mx-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.15)), url('/resim/hero.jpg'), linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%)",
        }}
      />
      <div className="relative flex min-h-[70vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-32 lg:px-8 lg:pb-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/70">
          Yeni Sezon
        </p>
        <h1 className="font-display mt-3 max-w-xl text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
          {getShopName()}
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
          {getShopTagline()}
        </p>
        <div className="mt-8">
          <Link
            href="/magaza#yeni-sezon"
            className="inline-block border border-white bg-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--shop-text-primary)] transition hover:bg-transparent hover:text-white"
          >
            Koleksiyonu Keşfet
          </Link>
        </div>
      </div>
    </section>
  );
}
