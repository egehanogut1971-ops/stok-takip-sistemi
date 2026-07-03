import Link from "next/link";
import { getShopName } from "@/lib/shopConfig";

export default function GizlilikPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl rounded-2xl bg-white p-8 ring-1 ring-slate-200">
      <h1>Gizlilik Politikası</h1>
      <p>
        {getShopName()} olarak kişisel verilerinizi yalnızca sipariş ve teslimat
        süreçlerinde kullanırız.
      </p>
      <h2>Toplanan Veriler</h2>
      <ul>
        <li>Ad, soyad, e-posta, telefon</li>
        <li>Teslimat adresi</li>
        <li>Sipariş geçmişi</li>
      </ul>
      <h2>Kullanım Amacı</h2>
      <p>
        Verileriniz siparişin işlenmesi, kargo süreci ve müşteri desteği için
        kullanılır. Üçüncü taraflarla pazarlama amacıyla paylaşılmaz.
      </p>
      <h2>Ödeme Güvenliği</h2>
      <p>
        Kart bilgileriniz doğrudan iyzico tarafından işlenir; sunucularımızda
        saklanmaz.
      </p>
      <Link href="/magaza" className="text-emerald-700 no-underline hover:underline">
        ← Mağazaya dön
      </Link>
    </article>
  );
}
