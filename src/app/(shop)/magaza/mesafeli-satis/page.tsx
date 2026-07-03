import Link from "next/link";
import { getShopName } from "@/lib/shopConfig";

export default function MesafeliSatisPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl rounded-2xl bg-white p-8 ring-1 ring-slate-200">
      <h1>Mesafeli Satış Sözleşmesi</h1>
      <p>
        Bu sözleşme, {getShopName()} üzerinden yapılan online alışverişler için
        geçerlidir.
      </p>
      <h2>Satıcı Bilgileri</h2>
      <p>
        Satıcı: {getShopName()}
        <br />
        İletişim: Sipariş sırasında belirttiğiniz e-posta ve telefon
      </p>
      <h2>Ürün ve Fiyat</h2>
      <p>
        Ürün özellikleri ve fiyatlar mağaza sayfasında gösterildiği gibidir.
        Kargo ücreti ödeme özetinde ayrıca belirtilir.
      </p>
      <h2>Ödeme</h2>
      <p>
        Ödemeler iyzico altyapısı ile güvenli kart ödemesi yoluyla alınır.
      </p>
      <h2>Cayma Hakkı</h2>
      <p>
        Tüketici, ürünü teslim aldığı tarihten itibaren 14 gün içinde cayma
        hakkını kullanabilir. Detaylı bilgi için satıcı ile iletişime geçiniz.
      </p>
      <Link href="/magaza" className="text-emerald-700 no-underline hover:underline">
        ← Mağazaya dön
      </Link>
    </article>
  );
}
