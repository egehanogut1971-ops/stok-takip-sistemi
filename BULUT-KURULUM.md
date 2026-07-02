# Buluta Taşıma Kılavuzu (Vercel + Neon)

Anne ve teyze **PC kapalıyken bile**, **dışarıdayken bile** telefondan veya başka bilgisayardan girebilsin diye sistemi internete açıyoruz.

**Maliyet:** Ücretsiz planlarla başlayabilirsiniz (Neon + Vercel free tier).

**Süre:** Yaklaşık 20–30 dakika.

---

## Genel resim

```
Anne / Teyze (her yerden)
        ↓
   https://sizin-site.vercel.app  ← Vercel (uygulama)
        ↓
   Neon PostgreSQL                 ← Veritabanı (bulutta)
```

---

## Adım 1: GitHub hesabı ve proje yükleme

1. [https://github.com](https://github.com) adresinden ücretsiz hesap açın
2. Sağ üst **+** → **New repository**
3. Repository adı: `stok-takip-sistemi` (Public veya Private)
4. **Create repository** tıklayın

Bilgisayarınızda proje klasöründe terminal açın:

```powershell
cd "C:\Users\Egehan\Desktop\stok takip sistemi"
git init
git add .
git commit -m "Stok takip sistemi - bulut deploy hazir"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/stok-takip-sistemi.git
git push -u origin main
```

`KULLANICI_ADINIZ` yerine kendi GitHub kullanıcı adınızı yazın. Push sırasında GitHub girişi istenebilir.

---

## Adım 2: Neon veritabanı (ücretsiz)

1. [https://neon.tech](https://neon.tech) → **Sign up** (GitHub ile giriş yapabilirsiniz)
2. **New Project** → proje adı: `stok-takip`
3. Region: **Europe (Frankfurt)** — Türkiye'ye yakın
4. Proje oluşunca **Connection string** kopyalayın

Şuna benzer bir metin olacak:

```
postgresql://neondb_owner:xxxxx@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Bu metni bir yere kaydedin — **DATABASE_URL** olarak kullanacağız.

---

## Adım 3: Vercel'e deploy

1. [https://vercel.com](https://vercel.com) → **Sign up** (GitHub ile giriş)
2. **Add New…** → **Project**
3. GitHub'daki `stok-takip-sistemi` reposunu seçin → **Import**
4. **Environment Variables** bölümüne şunları ekleyin:

| Ad | Değer |
|----|-------|
| `DATABASE_URL` | Neon'dan kopyaladığınız connection string |
| `AUTH_SECRET` | Rastgele uzun bir metin (ör. `openssl rand -base64 32` veya kendi uydurduğunuz 32+ karakter) |

5. **Deploy** tıklayın
6. 2–3 dakika bekleyin — yeşil **Congratulations** görünecek
7. Site adresiniz: `https://stok-takip-sistemi-xxx.vercel.app` gibi bir URL

---

## Adım 4: AUTH_URL ayarı (önemli)

Deploy bittikten sonra Vercel'de:

1. Projenize girin → **Settings** → **Environment Variables**
2. Yeni değişken ekleyin:

| Ad | Değer |
|----|-------|
| `AUTH_URL` | `https://SIZIN-SITE-ADRESINIZ.vercel.app` |

3. **Deployments** → son deployment'ın yanındaki **⋯** → **Redeploy** (giriş düzgün çalışsın diye)

---

## Adım 5: İlk kullanım (bulutta)

1. Vercel'den aldığınız site adresini tarayıcıda açın
2. **Kayıt Ol** → anne hesabı oluştursun
3. **Kayıt Ol** → teyze hesabı oluştursun (çıkış yapıp tekrar kayıt)
4. Kategori ve ürünleri girin

**Not:** Bilgisayarınızdaki eski (yerel) veriler buluta otomatik taşınmaz. Bulutta sıfırdan kayıt ve ürün girişi yapılır.

---

## Anne ve teyze nasıl kullanır?

1. Telefona veya tablete site adresini kaydedin (ana ekrana kısayol ekleyin)
2. Her açılışta kendi kullanıcı adı + şifre ile **Giriş Yap**
3. PC kapalı olsa bile çalışır — internet yeterli

Örnek adres paylaşımı (WhatsApp):

> Stok sistemimiz: https://stok-takip-xxx.vercel.app  
> Kayıt olup giriş yapabilirsiniz.

---

## Yerel bilgisayarda geliştirme (isteğe bağlı)

Bulut veritabanını yerelde de kullanmak için `.env` dosyanızı güncelleyin:

```env
DATABASE_URL="postgresql://...(Neon connection string)..."
AUTH_SECRET="aynı-gizli-anahtar"
AUTH_URL="http://localhost:3000"
```

Sonra:

```powershell
npm run dev
```

---

## Sorun giderme

| Sorun | Çözüm |
|-------|-------|
| Giriş yapamıyorum | `AUTH_URL` doğru mu? Redeploy yaptınız mı? |
| Build hatası | Vercel loglarına bakın; `DATABASE_URL` Neon'da doğru mu? |
| Veritabanı hatası | Neon projesi aktif mi? Connection string'de `sslmode=require` var mı? |
| Site açılmıyor | Vercel dashboard'da deployment başarılı mı? |

---

## Özet checklist

- [ ] GitHub'a proje yüklendi
- [ ] Neon'da veritabanı oluşturuldu, `DATABASE_URL` alındı
- [ ] Vercel'de proje deploy edildi
- [ ] `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` ayarlandı
- [ ] Redeploy yapıldı
- [ ] Anne ve teyze kayıt oldu
- [ ] Site adresi paylaşıldı

Tamamlandığında sistem **7/24 internetten** erişilebilir olur.
