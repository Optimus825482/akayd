# 🚀 Akaydın Tarım — SEO Hızlandırma Planı

> **Hedef:** "fındık kırma", "fındık kırma kavurma", "hendek fındık kırma", "fındık işleme sakarya" anahtar kelimelerinde ilk 3'e girmek.

**Hazırlanma:** 29.07.2026 | **Mevcut durum:** `hendekfindikkirma.com` mikro sitesi zaten "hendek fındık kırma" aramasında #1'de. Ana site `akaydintarim.com.tr` SEO eksik.

---

## 🏆 1. RAKİP ANALİZİ

| Rakip | Domain | Sıralama | Güçlü Yönü |
|---|---|---|---|
| **Biz** | `hendekfindikkirma.com` | 🥇 #1 "hendek fındık kırma" | Domain tam eşleşme, hızlı site |
| Şifa Fındık | `sifafindik.com.tr` | 🥈 Kırma + Kavurma | Çok sayfalı SEO yapısı, schema |
| İçöz Fındık | (Yandex/Maps) | 🥉 | Google Maps + yorumlar |
| Durak Fındık | `bulurum.com` | 4. sıra | Kurumsal rehber kaydı |

**Rakiplerin yaptığı, bizim yapmadığımız:**
- ❌ Ana sitede (akaydintarim.com.tr) fındık işleme için optimize edilmiş ayrı bir sayfa YOK → `/findik-isleme` var ama meta etiketler zayıf
- ❌ Google My Business profili optimize edilmemiş
- ❌ Schema markup (FAQ, HowTo, LocalBusiness) eksik
- ❌ Backlink profili zayıf (sadece microsite var)
- ❌ Blog içerikleri SEO odaklı değil
- ❌ Sayfa hızı / Core Web Vitals ölçülmemiş

---

## 📋 2. ANAHTAR KELİME STRATEJİSİ

### 🔴 PRİMER (Hemen optimize edilecek)

| Anahtar Kelime | Hedef Sayfa | Tahmini Aylık Arama |
|---|---|---|
| `hendek fındık kırma` | `/findik-isleme` + microsite | ~500-1000 |
| `fındık kırma hendek` | `/findik-isleme` | ~300-500 |
| `hendek fındık işleme` | `/findik-isleme` | ~200-400 |
| `fındık kırma kavurma` | `/findik-isleme` | ~300-500 |
| `fındık işleme sakarya` | `/findik-isleme` | ~200-300 |

### 🟡 SEKONDER (İçerik stratejisi ile)

| Anahtar Kelime | Hedef Sayfa |
|---|---|
| `ev tipi fındık kırma` | Blog yazısı |
| `fındık kırma makinesi` | Blog yazısı |
| `fındık kavurma hizmeti` | Blog yazısı |
| `vakumlu fındık paketleme` | Blog yazısı |
| `fındık randıman hesaplama` | Blog yazısı |
| `hendek fındık fiyatları` | Blog / Ana sayfa |

### 🟢 LSI / SEMANTİK (İçeriğe serpiştirilecek)

```
fındık işleme tesisi, kabuklu fındık kırma, fındık ayıklama, 
fındık temizleme, profesyonel fındık kırma makinası, fındık boyutlandırma,
50 randıman fındık, tombul fındık, levant fındık, fındık fire oranı,
hasarsız fındık kırma, hijyenik fındık işleme, fındık bahçesi hendek,
sakarya fındık üreticisi, organomineral gübre fındık
```

---

## 🔧 3. TEKNİK SEO — YAPILACAKLAR

### 3.1 — Schema Markup (JSON-LD)

| Sayfa | Schema Tipi | Öncelik |
|---|---|---|
| `/findik-isleme` | `LocalBusiness` + `FAQPage` | 🔴 ACİL |
| `/` | `Organization` + `LocalBusiness` | 🔴 ACİL |
| `/blog` | `BlogPosting` (her yazıda) | 🟡 |
| `/iletisim` | `LocalBusiness` | 🟡 |
| Tüm sayfalar | `BreadcrumbList` | 🟢 |

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Akaydın Tarım - Fındık Kırma & İşleme",
  "description": "Hendek, Sakarya'da profesyonel fındık kırma, kavurma ve vakumlu paketleme hizmeti",
  "address": { "@type": "PostalAddress", "streetAddress": "Remzi Efendi Cd. No:24 D:b", "addressLocality": "Hendek", "addressRegion": "Sakarya" },
  "telephone": "+902641234567",
  "priceRange": "₺₺"
}
```

### 3.2 — Meta Tag Optimizasyonu

**Mevcut `/findik-isleme`:**
```html
<title>Fındık İşleme Hizmeti</title>
<meta name="description" content="Hendek'te ev tipi fındık kırma, kavurma ve vakumlu paketleme...">
```

**Önerilen (ACİL DEĞİŞİKLİK):**
```html
<title>Hendek Fındık Kırma & Kavurma | Profesyonel Fındık İşleme | Akaydın Tarım</title>
<meta name="description" content="Hendek, Sakarya'da ev tipi fındık kırma, kavurma ve vakumlu paketleme hizmeti ✓ Saatte 5-10 kg kapasite ✓ %98 hasarsız iç fındık ✓ Hemen WhatsApp: +90 264 123 45 67">
```

**Ana sayfa:**
```html
<title>Akaydın Tarım | Fındık Kırma, İşleme & Organomineral Gübre | Hendek/Sakarya</title>
```

### 3.3 — URL Yapısı

| Mevcut | Önerilen (301 yönlendirmesi ile) | Neden |
|---|---|---|
| `/findik-isleme` | ✅ Mevcut hali yeterli | - |
| `/urunler` | ✅ İyi | - |
| `/blog` | ✅ İyi | - |
| `/hakkimizda` | ✅ İyi | - |

### 3.4 — Sayfa Hızı (Core Web Vitals)

- [ ] Google PageSpeed Insights testi yap
- [ ] Resimleri WebP formatına çevir (zaten Sharp ile optimize ediliyor)
- [ ] `loading="lazy"` tüm görsellere ekle (kısmen var)
- [ ] CSS/JS bundle boyutunu küçült (Tailwind purgeCSS)
- [ ] Cloudflare CDN önüne al

---

## 📝 4. İÇERİK STRATEJİSİ

### 4.1 — Mevcut Sayfa İyileştirmeleri

#### `/findik-isleme` sayfası

**Eksikler:**
- ❌ H1'de anahtar kelime yok → "Hendek'te Profesyonel Fındık Kırma Hizmeti" olmalı
- ❌ H2'ler SEO odaklı değil
- ❌ FAQ schema markup yok
- ❌ HowTo schema yok (6 aşamalı işlem için)
- ❌ İçerikte anahtar kelime yoğunluğu düşük
- ❌ Internal link yok (blog yazılarına, iletişim sayfasına)

**Yapılacak:**
- [ ] H1 → "Hendek Fındık Kırma & İşleme Hizmeti | Akaydın Tarım"
- [ ] İçeriğe 3-5 yerde "Hendek fındık kırma" geçsin
- [ ] FAQ bölümüne FAQPage schema ekle
- [ ] İşlem adımlarına HowTo schema ekle
- [ ] "fındık kırma makinesi", "kabuklu fındık" gibi LSI terimleri serpiştir
- [ ] İletişim CTA'sını güçlendir

#### Ana sayfa (`/`)

- [ ] Hero altında "Hendek'te fındık kırma hizmeti" linki belirgin olsun
- [ ] Neden Biz bölümüne fındık işleme ile ilgili bir avantaj kartı ekle
- [ ] Fındık işleme bölümünü daha SEO odaklı hale getir

### 4.2 — Yeni Blog İçerikleri (Hemen yazılacak)

| # | Başlık | Hedef Anahtar Kelime |
|---|---|---|
| 1 | **"Hendek'te Fındık Kırma Hizmeti: Evde Kırma vs Profesyonel Kırma"** | hendek fındık kırma, ev tipi fındık kırma |
| 2 | **"Fındık Kırma Makinesi Nasıl Çalışır? Teknik Rehber 2026"** | fındık kırma makinesi, profesyonel fındık kırma |
| 3 | **"Fındık Kavurma: Evde Doğru Kavurma Teknikleri ve Püf Noktaları"** | fındık kavurma, fındık kavurma hizmeti |
| 4 | **"Vakumlu Fındık Paketleme: Fındıklarınız 2 Yıl Nasıl Taze Kalır?"** | vakumlu fındık paketleme |
| 5 | **"Fındık Randıman Hesaplama: 50 Randıman Ne Demek?"** | fındık randıman hesaplama, 50 randıman fındık |
| 6 | **"Sakarya Hendek'te Fındık İşleme: En Kapsamlı Rehber"** | sakarya fındık işleme, hendek fındık işleme |

**Her blog yazısı için yapılacaklar:**
- SEO başlığı ve meta açıklaması optimize edilsin (BlogManagement'te zaten var)
- H2 ve H3'lerde hedef anahtar kelimeler geçsin
- İçerik 1500+ kelime olsun
- En az 1 internal link (→ /findik-isleme veya → /iletisim)
- BlogPosting schema eklensin
- Görsellere ALT metni eklensin

---

## 🔗 5. BACKLINK & OFF-PAGE SEO

| Kaynak | Aksiyon | Öncelik |
|---|---|---|
| **Google My Business** | Profili optimize et, fındık kırma hizmeti olarak kaydet | 🔴 ACİL |
| **hendekfindikkirma.com** | Ana siteye canonical veya 301 yönlendir | 🔴 ACİL |
| **Sakarya/Hendek rehber siteleri** | İşletme kaydı oluştur | 🟡 |
| **Fındık forumları / Facebook grupları** | Uzman yanıtları ver, imzada link | 🟡 |
| **Google Maps** | İşletme kaydı, fotoğraflar, yorum toplama | 🔴 ACİL |
| **Yerel haber siteleri** | "Hendek'te fındık kırma hizmeti" basın bülteni | 🟢 |

### Mikro site stratejisi

`hendekfindikkirma.com` şu an **exact-match domain** olarak #1'de. İki seçenek:

**Seçenek A:** Mikro siteyi ana siteye **301 yönlendir** → Tüm link gücü ana siteye akar
**Seçenek B:** Mikro siteyi **canonical** ile ana siteye bağla, ikisini de canlı tut

**Önerilen:** Seçenek A. Uzun vadede tek domain'de otorite toplamak daha iyi.

---

## 📊 6. PERFORMANS TAKİP

| Metrik | Araç | Frekans |
|---|---|---|
| Sıralama değişimi | Google Search Console | Haftalık |
| Organik trafik | Google Analytics | Günlük |
| Core Web Vitals | PageSpeed Insights | Aylık |
| Backlink profili | Ahrefs ücretsiz | Aylık |
| Tıklama oranı (CTR) | Search Console | Haftalık |

---

## ⏱️ 7. UYGULAMA TAKVİMİ

### HAFTA 1 — Teknik SEO (hemen başla)
- [ ] Tüm sayfalara Schema Markup ekle
- [ ] Tüm meta tag'leri optimize et
- [ ] `/findik-isleme` H1-H2 yapısını SEO'ya uygun hale getir
- [ ] Google My Business profilini oluştur/güncelle
- [ ] XML sitemap oluştur ve Search Console'a gönder

### HAFTA 2 — İçerik (blog yazıları)
- [ ] 6 yeni blog yazısı yaz ve yayınla (günde 1)
- [ ] Blog yazılarına BlogPosting schema ekle
- [ ] Blog yazılarından `/findik-isleme` sayfasına internal link ver

### HAFTA 3 — Off-Page
- [ ] Hendek/Sakarya işletme rehberlerine kayıt
- [ ] Sosyal medya profillerini SEO uyumlu hale getir
- [ ] Müşteri yorumları toplamaya başla (Google'da)

### HAFTA 4 — Analiz & İyileştirme
- [ ] Search Console verilerini analiz et
- [ ] En çok tıklanan sayfaları güçlendir
- [ ] Yeni anahtar kelime fırsatlarını tespit et
- [ ] Sayfa hızı optimizasyonu yap

---

## 🎯 BAŞARI KRİTERLERİ

| Hedef | Zaman |
|---|---|
| "hendek fındık kırma" → ilk 3 | 4 hafta |
| "fındık kırma kavurma" → ilk 5 | 6 hafta |
| "fındık işleme sakarya" → ilk 3 | 4 hafta |
| "fındık kırma makinesi" → ilk 10 | 8 hafta |
| Organik trafikte %200 artış | 3 ay |

---

> **Not:** Bu plan yaşayan bir dokümandır. Her hafta Search Console verilerine göre güncellenmelidir. SEO sabır işidir — hemen sonuç beklemeyin, 4-12 hafta arası etkiler görülmeye başlar.

---

## ✅ 30.07.2026 — SEO İyileştirme Güncellemesi

### Teknik Altyapı İyileştirmeleri:
- ✅ Blog yazılarında `summary` alanı content'ten otomatik türetiliyor (HTML etiketleri temizlenmiş ilk 200 karakter)
- ✅ Blog SEO: `seo_title` boşsa title kullanılıyor, `seo_description` boşsa summary kullanılıyor
- ✅ SERP rank tracker endpoint'i SQL injection'a karşı korumalı
- ✅ Sitemap hataları loglanıyor (sessizce yutulmuyor)
- ✅ Nginx: `client_max_body_size 20M` + uploads için `proxy_buffering off`
- ✅ Rate limiting: express-rate-limit ile IP bazlı (genel 100/15dk, auth 10/15dk)
- ✅ Blog kartlarında Article schema markup eklendi
- ✅ Blog sayfasında breadcrumb schema eklendi
- ✅ Blog yönetim panelinde boş SEO alanları için uyarı toast'ı eklendi

### Tamamlanan SEO Planı Maddeleri:
- [x] Blog içeriklerinde SEO alanları otomatik doldurma
- [x] Schema markup (Article, BreadcrumbList)
- [x] Blog yönetim SEO iyileştirmeleri
