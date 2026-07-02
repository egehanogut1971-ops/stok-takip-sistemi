# Stok Takip Sistemi

Hazır alınan ürünlerin stok durumunu takip etmek, alış/satış fiyatı ve kar marjını görmek için web tabanlı uygulama.

## Özellikler

- Mevcut stok listesi (kategori filtresi + arama)
- Kayıt ol / giriş yap (anne ve teyze kendi hesabını açar)
- Ürün ve kategori yönetimi
- Stok giriş / çıkış kayıtları
- Alış-satış fiyatı, birim kar ve kar marjı
- Düşük stok uyarıları
- Yazdır ve PDF fotokopi
- CSV ile toplu ürün içe aktarma

## Kurulum

### 1. Node.js

[https://nodejs.org](https://nodejs.org) adresinden Node.js LTS sürümünü kurun.

### 2. Bağımlılıklar

```bash
npm install
```

### 3. Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve `AUTH_SECRET` değerini değiştirin:

```bash
copy .env.example .env
```

### 4. Veritabanı

```bash
npx prisma migrate dev
```

### 5. Uygulamayı başlatma

```bash
npm run dev
```

Tarayıcıda açın: **http://localhost:3000**

> **Buluta taşımak (anne/teyze her yerden girsin):** Detaylı adımlar için [BULUT-KURULUM.md](./BULUT-KURULUM.md) dosyasına bakın. Özet: GitHub + Neon (veritabanı) + Vercel (uygulama) — ücretsiz planlarla yapılabilir.

## Bulut vs yerel

| | Yerel PC | Bulut (Vercel + Neon) |
|--|----------|------------------------|
| PC kapalıyken | Çalışmaz | Çalışır |
| Dışarıdan erişim | Hayır | Evet (telefon, tablet) |
| Kurulum | `npm run dev` | [BULUT-KURULUM.md](./BULUT-KURULUM.md) |

**Bulut için** `.env` dosyasında Neon PostgreSQL connection string kullanılmalıdır (`DATABASE_URL=postgresql://...`).

## İlk kullanım

1. **Kayıt Ol** sayfasından hesap oluşturun (anne ve teyze ayrı ayrı kayıt olur)
2. **Kategoriler** sayfasından kategori ekleyin
3. **Ürünler** sayfasından ürünleri ve başlangıç stoklarını girin
4. **Mevcut Stok** ekranından güncel durumu görün

## Ekip kullanımı (aynı ağ)

1. Sunucu bilgisayarda `npm run dev` veya `npm start` çalışsın
2. Sunucu PC'nin yerel IP adresini bulun (ör. `192.168.1.50`)
3. Diğer bilgisayardan `http://192.168.1.50:3000` adresine girin
4. Herkes kendi hesabıyla giriş yapar

## CSV formatı

```
ad,kategori,adet,alis,satis,minStok
Ürün A,Elektronik,10,100,150,2
Ürün B,Giyim,25,50,89,5
```

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm start` | Üretim sunucusu |
| `npx prisma studio` | Veritabanı görüntüleyici |
