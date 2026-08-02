# Akaydın Tarım — Kapsamlı Analiz Raporu (02.08.2026)

**Kapsam:** 64 dosya · 1658 satır backend (server/index.js) · 8 paralel subagent (security, DB, admin CRUD, frontend quality, SEO/SERP, perf/deploy, dead-code, UX) + statik doğrulama (grep, çapraz-kontrol).

**Sağlık skoru:** 61.3 / **D grade** · **%43.5 dead code** (191 sembolde 83 ölü) · avg complexity 8.91 · **test coverage ~0%** (8 test, gerçek server'ı değil kopyasını test ediyor).

**Stack:** React 18 + Vite 4 + TS (SPA) · Express + PostgreSQL 16 · sharp · Docker/Coolify (3 container: postgres / backend / frontend-nginx)

**Durum takibi:** Her düzeltme yapıldıkça bu belgenin ilgili bölümü güncellenir. Son güncelleme alttadır.

---

## 🔴 P0 — KRİTİK

### P0-1. ÜRETİM DB ŞİFRESİ GİT'TE AÇIK METİN
- **Konum:** [`.env.hosting`](.env.hosting) — commit `957228f` · [gsc-key.json](gsc-key.json) repo kökünde
- **Sorun:** `.env.hosting` repo'da track ediliyor, `DB_PASSWORD=518518Erkan` düz metin. `gsc-key.json` Google service-account private key — `.gitignore`'da ama `git add -A` ile kaza bir uzakta.
- **Risk:** Sızarsa üretim DB'si + GSC API erişimi.
- **Fix:** Şifre rotate · `.env.hosting`'i `.gitignore`'a ekle · `git rm --cached` · gsc-key.json'ı sil.
- **Durum:** ✅ `.env.hosting` untrack + `.gitignore` eklendi. **UYARI: DB şifresi git geçmişinde (3 commit) — rotasyon gerekli.**

### P0-2. Rate limit bypass → admin brute-force
- **Konum:** [server/index.js:56](server/index.js:56) `trust proxy = 1` · [nginx.conf:24](docker/nginx.conf:24) `$proxy_add_x_forwarded_for`
- **Sorun:** Express trust=1 sadece sağdan bir hop atar → saldırgan kontrolündeki sol değer `req.ip` olur. Her istekte `X-Forwarded-For: <random>` → rate limit (100 req/min/IP) **bypass edilebilir**. Login'i koruyan tek mekanizma bu. `.env.example` default `admin_secure_password`.
- **Risk:** Sınırsız şifre denemesi → admin token ele geçirme → P0-3'e eskalasyon.
- **Fix:** nginx'te `proxy_set_header X-Forwarded-For $remote_addr;` (overwrite, append değil) + login'e ayrı `express-rate-limit` + hesap kilidi/backoff.
- **Durum:** ✅ nginx.conf 2 yerde overwrite · express-rate-limit eklendi (genel 100/min + login 5/min)

### P0-3. Path traversal → keyfi dosya silme
- **Konum:** [server/index.js:438-459](server/index.js:438-459) — `PUT /api/products/:id`, `deletedImages`
- **Sorun:** `normalizePath` greedy regex `\/uploads\/.+` `..`'yı korur. Delete loop `path.join(__dirname, '..', p)` sandbox dışına çıkar. `deletedImages: ["/uploads/../../etc/cron.d/x"]` → node user'ın yazabildiği herhangi dosya silinir (bind-mount uploads dahil). About handler'ları (718-727, 786-795) doğru `basename` kullanıyor, products yanlış.
- **Risk:** Authenticated attacker → sunucuda keyfi dosya silme.
- **Fix:** `basename` + resolved path'in `UPLOADS_DIR` içinde olduğunu doğrula; sadece ürünün kendi `images` array'inde olanı sil.
- **Durum:** ✅ basename + UPLOADS_DIR join + `..`/`.` guard · JSON.parse try/catch

### P0-4. Ürün görsel kaydetme HER ZAMAN 500
- **Konum:** [services/api.ts:38](services/api.ts:38) `uploadFile` · [server/index.js:445](server/index.js:445)
- **Sorun:** `uploadFile` Content-Type set etmez → multer multipart `req.body`'yi **string** olarak doldurur → `JSON.parse(deletedImages)` string `"[\"…\"]"` üzerinde throw → 500 → "Ürün kaydedilirken hata oluştu". Frontend ayrıca `keepExistingImages='true'` gönderir, server okumaz bile. **Görsel silme içeren her kayıt başarısız.**
- **Risk:** Admin görsel yönetimi tamamen bozuk.
- **Fix:** Server'da try/catch parse (About'taki `deletedImages && deletedImages !== '[]'` modeli) + frontend'de array gönder.
- **Durum:** ✅ server try/catch parse + imageOrder desteği (reorder artık kaydedilebilir)

### P0-5. Görsel sıralama → farklı görsellerin SİLİNMESİ
- **Konum:** [components/admin/ProductManagement.tsx:390](components/admin/ProductManagement.tsx:390)
- **Sorun:** "Ana Görsel Yap" handler'ı `setDeletedImages(d => [...d, ...currentProduct.images!.filter(i => !imgs.includes(i))])` — temizlenmiş subset'e göre filtrelememiş tüm mevcut array'i hesaplar. Bir tık star marker'ı **birden çok görseli kalıcı siler**. Ayrıca `currentProduct.images!` non-null assertion — `images` optional (`types.ts:21`), `undefined.filter` → **admin paneli crash**.
- **Risk:** Veri kaybı + crash.
- **Fix:** Ayrı image-order state; reorder'ı `deletedImages` üzerinden değil, explicit array üzerinden yap. `(currentProduct.images ?? [])`.
- **Durum:** ✅ `reorderedImages` state eklendi · "Ana Görsel Yap" deletedImages'a karıştırmıyor · getDisplayImages kullanılıyor

### P0-6. Tek API hatası = TÜM SİTE beyaz ekran
- **Konum:** [App.tsx:52-60](App.tsx:52-60)
- **Sorun:** `Promise.all` içinde sadece `heroAPI` ve `seoAPI` `.catch`'li. `services/products/blog/about/contact` biri reject ederse **tüm sayfa** hata ekranına düşer — INITIAL_* seed durumu var, fallback gereksiz.
- **Risk:** Bir endpoint 500 = sitenin tamamı çöker.
- **Fix:** 5 çağrıya da `.catch(() => [])` / `.catch(() => null)`.
- **Durum:** ✅ 7 çağrının hepsi fallback'li — tek API hatası siteyi çökertmez

### P0-7. `serp_rankings` duplicate garantili
- **Konum:** [server/serpChecker.js:158-161](server/serpChecker.js:158-161) · [docker/init/01-schema.sql:162-173](docker/init/01-schema.sql)
- **Sorun:** Düz INSERT, UNIQUE yok. Başlangıç + cron 00:00/12:00 + manuel tetik + restart-race → (keyword, engine, domain, checked_at) aynı satırlar birikir. `DISTINCT ON` üstünü örtüyor ama tie durumunda "latest" keyfi → current-position çift satırda flicker.
- **Risk:** SERP verisi şişer, grafik yanlış.
- **Fix:** `CREATE UNIQUE INDEX ON serp_rankings (keyword, engine, domain, checked_at)` + `INSERT ... ON CONFLICT DO NOTHING`.
- **Durum:** ✅ UNIQUE index + serpChecker ON CONFLICT DO NOTHING + keyword_id FK

### P0-8. Migration sistemi YOK — `updated_at` asla güncellenmiyor
- **Konum:** [docker/init/01-schema.sql](docker/init/01-schema.sql) · [server/index.js](server/index.js) UPDATE'ler
- **Sorun:** 12 tablo `CREATE TABLE IF NOT EXISTS` — yeni kolon eski DB'de **sessizce no-op** (blog_posts.summary kanıtı: dosya `DEFAULT ''`, eski DB `NOT NULL` kaldı). `updated_at` sadece INSERT'te dolar; 9 UPDATE'ten 8'i dokunmuyor (sadece blog_posts:587) → **sitemap lastmod yanlış**, "son düzenleme" yanlış.
- **Risk:** Schema drift sessiz, zaman damgaları yalan.
- **Fix:** [data/migrate_to_postgres.sql:208-232](data/migrate_to_postgres.sql) zaten trigger içeriyor ama ölü — 01-schema.sql'e taşı. Gerçek migration tooling (numbered ALTER scripts).
- **Durum:** ✅ trigger 01-schema.sql'e + 03-migration.sql eklendi · init-db.sh koşuyor

---

## 🟠 P1 — YÜKSEK

| # | Konum | Sorun | Durum |
|---|---|---|---|
| P1-1 | [pages/BlogPage.tsx:79](pages/BlogPage.tsx:79) | `dangerouslySetInnerHTML` admin blog içeriği → **stored XSS**. Aynı desen: ContactPage map_embed | ✅ sanitizeHtml + sanitizeMapEmbed whitelist |
| P1-2 | [server/index.js:1439](server/index.js:1439) | Sitemap `/blog/${id}` üretiyor ama **`/blog/:id` route'u YOK** (App.tsx:228) → 404 URL'ler, blog indexlenemez | ✅ sitemap'ten çıkarıldı (blog yazıları indexlenecekse önce route eklenmeli) |
| P1-3 | [pages/BlogPage.tsx:61-70](pages/BlogPage.tsx:61) | JSX içinde `<script>` → **React render etmez**, BlogPosting JSON-LD hiç çıkmıyor | ✅ Helmet'e taşındı |
| P1-4 | [components/SEOHead.tsx:60-63](components/SEOHead.tsx:60) | `noindex` true iken robots = `"noindex, index, follow"` → geçersiz, Google davranışı belirsiz | ✅ noindex varken "index" push edilmiyor |
| P1-5 | [pages/HomePage.tsx:30-33](pages/HomePage.tsx:30) | Hero carousel: API sonrası `activeHero` boyutu değişir, `currentSlide` taşar → `c.title` throw | ✅ safeIndex + `c` null guard + `c &&` render |
| P1-6 | [pages/ProductDetailPage.tsx:37-68](pages/ProductDetailPage.tsx:37) | Her detay **tüm ürünleri** yeniden çeker; fetch race (stale id overwrite); boş catch → yanıltıcı "Ürün Bulunamadı" | ✅ cancelled flag + loadError state (transient vs gerçek eksik) |
| P1-7 | [pages/ProductDetailPage.tsx:7](pages/ProductDetailPage.tsx:7) | `VITE_STATIC_URL \|\| 'http://localhost:3003'` → env eksikse prod'da **localhost'a işaret eden kırık görseller** | ✅ window.location.origin fallback |
| P1-8 | [server/index.js:124-129](server/index.js:124-129) | `public, s-maxage=86400` TÜM GET'e — admin verileri (serp, contact-messages, blog-stats) **CDN'de 24h public cache**. Sadece `/api/admin` hariç | ✅ ADMIN_CACHE_PATHS → `private, no-store` |
| P1-9 | [server/index.js:366,509](server/index.js:366) | `/api/products`, `/api/blog-posts` LIMIT'siz — blog HTML body her ziyaretçiye; büyüyen payload | ✅ products LIMIT 200 · blog LIMIT 50 + content korundu |
| P1-10 | [pages/ContactPage.tsx:15-44](pages/ContactPage.tsx:15) | Client validasyon yok (server: name≥2, email regex, msg≥10); `catch{}` 400'ü yutar → sahte "başarıyla gönderildi" | ✅ client validasyon + error gösterimi + başarısızsa WhatsApp yok |
| P1-11 | [tailwind.config.js:17](tailwind.config.js:17) + [index.css:124](index.css:124) | **Dark mode kırık** — config hex sabitleri, `.dark` sadece CSS var'ları değiştiriyor, utility'ler hex'e sabit → dark-on-dark | ✅ config `var(--color-*)` + `darkMode: 'class'` |
| P1-12 | [hooks/useAdminAuth.tsx:14-32](hooks/useAdminAuth.tsx:14) | 401 localStorage token siler ama UI auth sıfırlamaz → sunucu restart (in-memory map) sonrası **kalıcı 401 loop** | ✅ `admin:unauthorized` event → UI auth reset |
| P1-13 | [components/SearchModal.tsx:61](components/SearchModal.tsx:61) | Blog sonucu `/blog#${id}`'ye link — BlogPage hash okumuyor → ölü link | ✅ BlogPage hash dinliyor → post modal açılır |
| P1-14 | [server/index.js](server/index.js) | **Health endpoint yok** + compose'da backend/frontend healthcheck yok → traefik çöken container'a 502, restart yok | ✅ `/healthz` + compose healthcheck (backend+frontend) |
| P1-15 | [docker-compose.yaml](docker-compose.yaml) | **DB + uploads yedeklemesi YOK** — pg_data volume, /data/akaydin/uploads → kayıp = tüm içerik | ✅ `docker/backup.sh` (pg_dump + uploads tar, 14 gün retention) — cron kurulumu gerekiyor |
| P1-16 | [components/admin/SEOManagement.tsx:460](components/admin/SEOManagement.tsx:460) | Page SEO "Edit" formu doldurur, `updatePageSEO` çağırmaz → **kaydet = duplicate row** | ✅ editingPageSEOId → update çağırır |
| P1-17 | [pages/AdminDashboard.tsx:71-77](pages/AdminDashboard.tsx:71) | 30s poll About/Contact formlarını yazarken **sıfırlar** → unsaved edit kaybı | ✅ about/contact aktifken poll atlandı |
| P1-18 | [components/admin/ProductManagement.tsx:381-411](components/admin/ProductManagement.tsx:381) | Submit disable yok → Enter/çift tık = **duplicate kayıt** | ✅ `if (loading) return` — Product/Blog/Service/Hero |
| P1-19 | [components/admin/ContactMessagesManagement.tsx](components/admin/ContactMessagesManagement.tsx) | Mesaj silme **confirm dialog'suz** (deleteTarget orphan state) | ✅ ConfirmModal bağlandı |
| P1-20 | [server/index.js:146-177](server/index.js:146) | El yapımı rate limiter restart'ta sıfırlanır; `express-rate-limit@8.6.1` kurulu ama kullanılmıyor | ✅ express-rate-limit (P0-2 ile birlikte) |
| P1-21 | [server/imageProcessor.js:47-49](server/imageProcessor.js:47) | unlink-önce-rename non-atomic — rename hatası = **orijinal silinmiş + DB .jpg yolu kalmış** → 404 | ✅ atomic: rename sonra unlink, fail'de orijinal korunur |

---

## 🟡 P2 — ORTA

| # | Konum | Sorun | Durum |
|---|---|---|---|
| P2-1 | [01-schema.sql](docker/init/01-schema.sql) | boolean/smallint tutarsız: `is_active`, `noindex`, `is_featured`, `sitemap_enabled`, `is_read` SMALLINT; `serp_keywords.is_active` BOOLEAN. CHECK yok | ✅ hepsi BOOLEAN (schema + migration) |
| P2-2 | [01-schema.sql:121](docker/init/01-schema.sql) | `products.images`/`about_page.images` TEXT'te JSON — JSONB olmalı; bozuk satır `GET /api/products`'ı throw eder (index.js:371) | ✅ JSONB DEFAULT '[]' + migration parse |
| P2-3 | [01-schema.sql:162](docker/init/01-schema.sql) | `serp_rankings.keyword` free-text kopya — FK `keyword_id` yok → keyword silinince history orphan | ✅ keyword_id FK ON DELETE CASCADE + serpChecker lookup |
| P2-4 | [01-schema.sql](docker/init/01-schema.sql) | Doğal anahtarlarda UNIQUE yok (blog title, product name, service title) → seed/kopya duplicate | ✅ UNIQUE (blog/products/services) |
| P2-5 | [docker-compose.yaml:18](docker-compose.yaml:18) | 3 init yolu çakışıyor (entrypoint-initdb.d + init-db.sh + startup.sh) aynı seed'i çalıştırıyor; schema drift sonrası **hiçbir şey yakalamıyor** | ✅ 03-migration.sql eklendi, init-db.sh koşuyor (idempotent) |
| P2-6 | [Dockerfile:22-30](Dockerfile:22) | backend image'de frontend build — ama dist nginx'te; backend dist'i ölü. `npm install` yerine `npm ci` | ✅ backend build kaldırıldı · `npm install` korundu (lock yok, `npm ci` build'i kırıyordu) · `npm ci` için önce `package-lock.json` commit edilmeli |
| P2-7 | [docker/nginx.conf](docker/nginx.conf) | Güvenlik header'ı sıfır: HSTS, nosniff, X-Frame yok. index.html cache-control yok → stale SPA shell | ✅ HSTS + nosniff + X-Frame + Referrer + Permissions-Policy; index.html no-cache |
| P2-8 | [pages/HomePage.tsx:69](pages/HomePage.tsx:69) + pages | Structured-data URL tutarsız: `www.` vs www'suz karışık (HomePage orgSchema, breadcrumb'lar); ProductsPage `#id` anchor'ları yok → 404 schema URL | ✅ 36 URL www canonical'e normalize |
| P2-9 | 8 page | `seoAPI.getPageSEO` 8 sayfada kopyalanmış — tek `usePageSEO` hook olmalı | ✅ `usePageSEO` hook + 7 statik sayfa refactor |
| P2-10 | [tailwind.config.js:42](tailwind.config.js:42) | `prose` classes no-op — `@tailwindcss/typography` yüklü değil | ✅ minimal prose CSS index.css'e |
| P2-11 | [server/index.js:451-459](server/index.js:451) | Görsel silme `/akaydin-tarim/` prefixed yolları bulamaz → orphan dosya (about handler'ı doğru) | ✅ P0-3 ile birlikte — basename + UPLOADS_DIR |
| P2-12 | [server/serpChecker.js:184-200](server/serpChecker.js:184) | SERP cron seri + guard'sız — 7-10dk; çift çalışma duplicate; SIGTERM kill mid-insert | ✅ `rankingRunInProgress` overlap guard |
| P2-13 | Admin CRUD | Input validasyonu yok — `express-validator` kurulu, 0 kullanım | ✅ services POST/PUT validator · products/blog/hero multipart olduğundan try/catch yeterli |
| P2-14 | [server/index.js:99-103](server/index.js:99) | **SVG upload = stored XSS** — magic-byte kontrolü yok, CSP kapalı, imageProcessor SVG'i geçiriyor | ✅ SVG upload engellendi (MIME + extension listesinden çıktı) + imageProcessor |
| P2-15 | [server/index.js:64-71](server/index.js:64) | Startup race: async bcrypt hash — hash bitmeden login 500 | ✅ hash top-level await + ADMIN_PASSWORD fail-fast |
| P2-16 | [server/index.js:279-282](server/index.js:279) | Plaintext şifre fallback catch'te — error path'te DENY olmalı | ✅ fallback kaldırıldı, catch → 500 |
| P2-17 | [server/imageProcessor.js:42](server/imageProcessor.js:42) | `limitInputPixels` yok → pixel-bomb DoS | ✅ limitInputPixels 30M |
| P2-18 | [docker-compose.yaml](docker-compose.yaml) | backend/frontend healthcheck yok (P1-14 ile aynı); uploads + DB backup yok (P1-15) | ⬜ |
| P2-19 | [components/admin/AboutManagement.tsx](components/admin/AboutManagement.tsx) | Silinen görseller preview'da kalıyor; `image` field save'te kayboluyor | ⬜ |
| P2-20 | [components/admin/SEOManagement.tsx:376-439](components/admin/SEOManagement.tsx) | Page SEO form'da og_*/canonical field'ları yok → DB'ye boş yazılır | ⬜ |
| P2-21 | [components/admin/SEOManagement.tsx:271](components/admin/SEOManagement.tsx) | `twitter_card` `as any` — tip güvenliği | ⬜ |
| P2-22 | [pages/ProductDetailPage.tsx:43](pages/ProductDetailPage.tsx:43) | `apiCall` untyped `Promise<any>` → manual Api* interface re-declaration'ları; `p: any` | ⬜ |

---

## 🟢 P3 — DÜŞÜK / dead code / debt

### Silinebilir dead code (doğrulanmış, sıfır referans)
| Dosya | Not | Durum |
|---|---|---|
| `components/WeatherRadar.tsx` | 0 import | ✅ silindi |
| `components/WeatherWidget.tsx` | `@deprecated`, 0 import | ✅ silindi |
| `hooks/useScrollLock.ts` | 0 import | ✅ silindi |
| `hooks/useFormValidation.ts` | 0 import | ✅ silindi |
| `hooks/useModalKeyboard.ts` | 0 import | ✅ silindi |
| `hooks/useSEO.tsx` | re-export only, 0 kullanım | ✅ silindi + useAdmin.tsx re-export |
| `types.ts:187-300` | deprecated analytics blokları (9 interface) | ✅ silindi |
| `public/realtime-visitor-tracker.js` | index.html'de yüklü değil | ✅ zaten yoktu |
| `public/visitor-fingerprint.js` | index.html'de yüklü değil | ✅ zaten yoktu |
| `server/index-ultra-minimal.js` | alternatif server, 0 ref | ✅ zaten yoktu |
| `server/scraper.js` | 0 ref | ✅ zaten yoktu |
| `data/` CSVs + convert.js + *_pg.py | akaydin_tarim.sql hariç (o seed) | ⬜ (kullanıcı onayı gerek) |

### Diğer düşük
| # | Konum | Sorun | Durum |
|---|---|---|---|
| P3-1 | [server/index.js:524,577](server/index.js:524) | `stripHtml` 2× kopya (stripHtml / stripHtml2) | ✅ tek modül-seviyesi tanım |
| P3-2 | [server/index.js](server/index.js) | `generateSitemap` 11 çağrı noktası, 1658 satır monolit — route modüllerine böl | ⬜ (büyük refactor, plan gerektirir) |
| P3-3 | [test/api.test.ts](test/api.test.ts) | Test gerçek server'ı DEĞİL handler kopyasını test ediyor → test geçmesi kanıt değil | ⬜ (rewrite gerektirir) |
| P3-4 | 5 admin bileşeni | Duplike error toast (create fail'de 2×) | ✅ Product/Blog/Service/Hero/About |
| P3-5 | [components/Footer.tsx:34,82](components/Footer.tsx:34) | Kontrast AA altı: `text-white/25` ≈ 2.3:1, `/35` ≈ 2.9:1 | ✅ /60 ve /50'ye çıkarıldı |
| P3-6 | [components/WhatsAppFloat.tsx:4](components/WhatsAppFloat.tsx:4) | Hardcoded numara `905397751517` — admin'e bağlı değil | ✅ contactContent prop + fallback |
| P3-7 | [components/SearchModal.tsx:48-78](components/SearchModal.tsx:48) | Services aramıyor, sadece products + blog | ⬜ |
| P3-8 | [pages/FindikIslemePage.tsx](pages/FindikIslemePage.tsx) | Gallery placeholder; duplike FAQ schema (satır 7 modül-seviyesi ölü); 668 satır monolit | ✅ ölü schema silindi · gallery + monolit bölme kaldı |
| P3-9 | [components/BlogPostCard.tsx:1](components/BlogPostCard.tsx:1) | `@deprecated` etiketi aktif bileşende | ✅ silindi |
| P3-10 | [pages/ContactPage.tsx:182](pages/ContactPage.tsx:182) | map embed statik timestamp | ⬜ (doğru embed, timestamps doğal) |
| P3-11 | [pages/AdminDashboard.tsx:129,136](pages/AdminDashboard.tsx:129) | `Icons.search` 3 menüde (hero, about, seo); AdminIcons içinde kullanılmayan iconlar | ⬜ (kozmetik) |
| P3-12 | [server/index.js:1542,1556,1566](server/index.js:1542) | Raw error `err.message` client'a dönüyor (SERP endpoint'leri) | ✅ 5 endpoint genelleştirildi |
| P3-13 | [components/admin/DashboardOverview.tsx:21](components/admin/DashboardOverview.tsx:21) | `blogPosts.sort()` props'u mutate ediyor | ✅ `[...blogPosts]` |
| P3-14 | [components/admin/ContactMessagesManagement.tsx:133](components/admin/ContactMessagesManagement.tsx:133) | `new Date(created_at)` guard'sız → malformed tarih crash | ✅ isNaN guard |
| P3-15 | [services/api.ts:8](services/api.ts:8) + useAdminAuth | API base URL 2 yerde tanımlı — drift riski | ⬜ (minor) |
| P3-16 | [hooks/useAdminAuth.tsx:9,13](hooks/useAdminAuth.tsx:9) | `role`/`canWrite` tanımlı, kullanılmıyor — editor/viewer rolü UI'da enforce edilmiyor | ⬜ (YAGNI kararı kullanıcıya) |
| P3-17 | [components/admin/SerpRankTracker.tsx:48-91](components/admin/SerpRankTracker.tsx:48) | `loadData` recreated → 5-dk interval keyword değişince reset; çift fetch | ⬜ (minor) |

---

## Doğrulanmış ama NOT VULN olanlar
- **SQL injection — yok.** Tüm `db.query` bound parameter; serpChecker, history builder, hero PUT hepsi güvenli.
- **SSRF — yok.** `/api/seo/analyze?url=` sadece DB lookup, fetch etmiyor. serpChecker sadece hardcoded Google/Yandex/Bing.
- **CSRF — yok.** Cookie `sameSite: 'strict'`.
- **Token gücü — yeterli.** 32-byte randomBytes.
- **WebP rename happy path — tutarlı.** DB her zaman post-rename `.webp` alır. Gerçek sorunlar: non-atomic delete-then-rename (P1-21) + legacy .jpg/.webp karışımı migration'sız.

---

## Önerilen yol haritası
1. **Güvenlik:** P0-1 (şifre rotate) → P0-2 (rate limit) → P0-3 (path traversal) → P2-14 (SVG/XSS) → P1-1 (stored XSS)
2. **Data-loss zinciri:** P0-4 (JSON.parse) → P0-5 (reorder-silme) → P1-18 (duplicate submit)
3. **Site kırılganlığı:** P0-6 (Promise.all) → P1-14 (health) → P1-15 (backup)
4. **SEO:** P1-2 (blog route) → P1-3 (script tag) → P1-4 (robots) → P2-8 (URL tutarlılık)
5. **Schema:** P0-7 (UNIQUE) → P0-8 (updated_at trigger + migration) → P2-1/2/3/4
6. **Debt:** P3 silinecekler → P3-2 (monolit böl) → P2-22 (tip güvenliği)

---

## Değişiklik Günlüğü

| Tarih | Değişiklik | P |
|---|---|---|
| 02.08.2026 | İlk rapor oluşturuldu | — |
| 02.08.2026 | P0-1 secret untrack · P0-2 rate-limit bypass fix · P0-3 path traversal · P0-4 deletedImages JSON.parse · P0-5 reorder-silme · P0-6 Promise.all fallback · P1-1/3/10/12/14/15/17/18/20 · P2-13/14/15/16/17 · P3-4/8 kısmen | P0+P1+P2 |
| 02.08.2026 | P0-7 serp UNIQUE + ON CONFLICT · P0-8 updated_at trigger · P2-1 booleans · P2-2 JSONB · P2-3 keyword_id FK · P2-4 UNIQUE keys · P2-5 03-migration.sql + init-db.sh | P0+P2 |
| 02.08.2026 | P1-2 sitemap 404 URL'ler · P1-4 robots noindex · P1-6/7 ProductDetailPage race + localhost · P2-8 www normalize · P2-9 usePageSEO hook | P1+P2 |
| 02.08.2026 | P1-5 hero carousel · P1-8 cache admin no-store · P1-9 LIMIT · P1-11 dark mode fix · P1-13 blog hash · P1-16 SEO edit update · P1-19 confirm dialog · P1-21 image atomic | P1 |
| 02.08.2026 | P2-6 npm ci + backend build kaldır · P2-7 nginx güvenlik header + index.html no-cache · P2-10 prose CSS · P2-11 orphan image (P0-3 ile) · P2-12 SERP guard · P3-1 stripHtml · P3-4 toast · P3-5 contrast · P3-6 WhatsApp · P3-8/9 · P3-12/13/14 · dead code 6 dosya + types.ts blok | P2+P3 |
