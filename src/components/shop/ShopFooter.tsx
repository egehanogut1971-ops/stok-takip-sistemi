import Link from "next/link";
import { getShopName } from "@/lib/shopConfig";

export function ShopFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-bold text-white">{getShopName()}</p>
          <p className="mt-2 text-sm leading-relaxed">
            Güvenli ödeme ve hızlı kargo ile online alışveriş.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Alışveriş</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/magaza" className="hover:text-white">
                Tüm Ürünler
              </Link>
            </li>
            <li>
              <Link href="/magaza/sepet" className="hover:text-white">
                Sepetim
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Yasal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/magaza/mesafeli-satis" className="hover:text-white">
                Mesafeli Satış Sözleşmesi
              </Link>
            </li>
            <li>
              <Link href="/magaza/gizlilik" className="hover:text-white">
                Gizlilik Politikası
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {year} {getShopName()}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
