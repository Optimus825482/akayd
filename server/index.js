import 'dotenv/config';
// Memory-optimized imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Import multer immediately
import multer from 'multer';
import cron from 'node-cron';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { imageOptimizer } from './imageProcessor.js';
import { checkAllRankings, checkSingleKeyword } from './serpChecker.js';

import fs from 'fs';

// --- Lightweight cookie parser (no dependency) ---
const parseCookies = (req) => {
  const raw = req.headers.cookie;
  if (!raw) return {};
  const c = {};
  raw.split(';').forEach(pair => {
    const i = pair.indexOf('=');
    if (i < 0) return;
    c[pair.substring(0, i).trim()] = pair.substring(i + 1).trim();
  });
  return c;
};
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kalıcı uploads klasörü — deploy'da silinmeyen bir konum
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`Uploads klasörü oluşturuldu: ${UPLOADS_DIR}`);
}
// Bind mount için yazma izni kontrolü
try {
  fs.accessSync(UPLOADS_DIR, fs.constants.W_OK);
} catch {
  console.warn(`UYARI: ${UPLOADS_DIR} yazılabilir değil! chmod 777 veya chown node yapın.`);
}

const app = express();
const PORT = process.env.PORT || 3003;

// Trust proxy — Traefik/Nginx arkasında doğru IP tespiti için zorunlu
app.set('trust proxy', 1);

// Admin Auth — şifre eksikse fail-fast (DB kontrolü gibi)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SALT_ROUNDS = 10;
if (!ADMIN_PASSWORD) {
  console.error('HATA: ADMIN_PASSWORD environment variable zorunludur');
  process.exit(1);
}
// Startup race önleme: hash'i dinleme başlamadan önce await et
const ADMIN_PASSWORD_HASH = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
console.log('Admin şifresi hash\'lendi.');

const adminTokens = new Map(); // token → {role: "admin"|"editor"|"viewer"}

// Yardımcı: boolean/string değerleri PostgreSQL smallint için 0/1 integer'a çevir
const toSmallInt = (val) => {
  if (val === true || val === 1 || val === 'true' || val === '1') return 1;
  return 0;
};
// P3-1: tek tanım (iki kopyası vardı)
const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || parseCookies(req).admin_token;
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
  next();
};

// İnput validasyon yardımcıları (express-validator) — admin CRUD için
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};
const textField = (field, label, { required = true, max = 5000, min } = {}) => {
  let chain = body(field)
    .optional(required ? { values: 'null' } : true)
    .isString().withMessage(`${label} metin olmalıdır`)
    .trim();
  if (required) chain = chain.notEmpty().withMessage(`${label} zorunludur`);
  if (min) chain = chain.isLength({ min }).withMessage(`${label} en az ${min} karakter olmalıdır`);
  return chain.isLength({ max }).withMessage(`${label} en fazla ${max} karakter olabilir`);
};

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: '1mb' }));

// /akaydin-tarim prefix temizleyici
app.use('/uploads', (req, res, next) => {
  // Dosya istekleri için CORS header'ları ekle
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  // URL temizleme: çift slash'ları tek slash yap, /akaydin-tarim prefix'ini kaldır
  req.url = req.url.replace(/\/akaydin-tarim\//g, '/').replace(/\/+/g, '/');
  next();
}, express.static(UPLOADS_DIR, {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Cache middleware
// P1-8: admin korumalı route'lar asla public cache'lenmez (s-maxage 86400 = CDN'de 24h sızıntı).
// Admin verisi: private, no-store. Public içerik: kısa public cache.
const ADMIN_CACHE_PATHS = [
  '/api/serp-rankings', '/api/contact/messages', '/api/blog-posts/stats',
  '/api/seo/sitemap', '/api/seo/robots', '/api/seo/analyze', '/api/seo/pages',
];
app.use((req, res, next) => {
  if (req.method === 'GET') {
    const isAdminPath = ADMIN_CACHE_PATHS.some(p => req.path.startsWith(p));
    if (isAdminPath) {
      res.setHeader('Cache-Control', 'private, no-store');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    }
  }
  next();
});

// Multer hata handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Dosya boyutu çok büyük. Maksimum 10MB yüklenebilir.' });
    }
    return res.status(400).json({ error: `Dosya yükleme hatası: ${err.message}` });
  }
  if (err.message && err.message.includes('Desteklenmeyen dosya türü')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// Rate limiting — express-rate-limit (restart'ta sıfırlanmaz, per-proxy-IP güvenilir)

// Genel API limiti
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Çok fazla istek, lütfen bekleyin' },
});

// Login için sıkı limiter — brute-force koruması
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Çok fazla giriş denemesi. 1 dakika bekleyin.' },
  skipSuccessfulRequests: true, // başarılı giriş sayılmaz
});

app.use('/api/', generalLimiter);
app.use('/api/admin/login', loginLimiter);

// PostgreSQL bağlantısı (retry ile)
if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error('HATA: DB_USER ve DB_PASSWORD environment variable zorunludur');
  process.exit(1);
}

async function createPool(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'akaydin_tarim',
        max: 10,
        idleTimeoutMillis: 30000,
      });
      // Test bağlantısı
      const client = await pool.connect();
      client.release();
      console.log('Veritabanı bağlantısı başarılı.');
      return pool;
    } catch (err) {
      console.error(`DB bağlantı hatası (deneme ${i + 1}/${retries}):`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

const db = await createPool();

function formatError(err) {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}${err.code ? ` (code: ${err.code})` : ''}`;
  }
  return typeof err === 'string' ? err : JSON.stringify(err) || 'Bilinmeyen hata';
}

checkAllRankings(db).catch(err => console.error('[SERP] Başlangıç kontrol hatası:', formatError(err)));

// Günde 2 kez: 00:00 ve 12:00
cron.schedule('0 0 * * *', () => {
  console.log('[CRON] 00:00 — SERP kontrolü başlatılıyor...');
  checkAllRankings(db).catch(err => console.error('[CRON] 00:00 hatası:', formatError(err)));
});

cron.schedule('0 12 * * *', () => {
  console.log('[CRON] 12:00 — SERP kontrolü başlatılıyor...');
  checkAllRankings(db).catch(err => console.error('[CRON] 12:00 hatası:', formatError(err)));
});

// DB hata event handler
db.on('error', (err) => {
  console.error('Veritabanı havuz hatası:', err.message);
});

// Multer configuration
// Not: SVG bilinçli olarak çıkarıldı — script gömülebilir (stored XSS). SVG gerekiyorsa whitelist sanitizer ile eklenmeli.
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/x-png',
  'image/gif', 'image/webp',
  'image/avif', 'image/bmp'
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  // Önce MIME tipine bak, başarısız olursa uzantıya göre karar ver (bazı tarayıcılar PNG'yi yanlış MIME ile gönderir)
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Desteklenmeyen dosya türü: ${file.mimetype} (${ext}). JPEG, PNG, GIF, WebP, SVG, AVIF ve BMP kabul edilir.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

// Admin login/logout
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  try {
    const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!match) return res.status(401).json({ error: 'Hatalı şifre' });
  } catch {
    // bcrypt hatası → DENY (plaintext fallback yok, security)
    console.error('bcrypt karşılaştırma hatası');
    return res.status(500).json({ error: 'Giriş işlenirken hata oluştu' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  adminTokens.set(token, { role: 'admin' });
  setTimeout(() => adminTokens.delete(token), 24 * 60 * 60 * 1000);
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  res.json({ message: 'Giriş başarılı', role: 'admin' });
});

app.post('/api/admin/logout', adminAuth, (req, res) => {
  const logoutToken = req.headers.authorization?.replace('Bearer ', '') || parseCookies(req).admin_token;
  adminTokens.delete(logoutToken);
  res.clearCookie('admin_token', { path: '/' });
  res.json({ message: 'Çıkış başarılı' });
});

// Admin token doğrulama
app.get('/api/admin/verify', adminAuth, (req, res) => {
  res.json({ valid: true });
});

// SERVICES API
app.get('/api/services', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM services ORDER BY id DESC');
    res.json(rows.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hizmetler alınırken hata oluştu' });
  }
});

app.post('/api/services', adminAuth, textField('title', 'Hizmet başlığı', { max: 255 }), textField('description', 'Hizmet açıklaması', { required: false }), validate, async (req, res) => {
  try {
    const { title, description, iconName } = req.body;
    const result = await db.query(
      'INSERT INTO services (title, description, icon_name) VALUES ($1, $2, $3) RETURNING id',
      [title, description, iconName]
    );
    // İçerik değişti, sitemap'i arka planda yenile
    generateSitemap().catch(() => {});
    res.json({ id: result.rows[0].id, title, description, iconName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hizmet eklenirken hata oluştu' });
  }
});

app.put('/api/services/:id', adminAuth, textField('title', 'Hizmet başlığı', { max: 255 }), textField('description', 'Hizmet açıklaması', { required: false }), validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, iconName } = req.body;
    await db.query(
      'UPDATE services SET title = $1, description = $2, icon_name = $3 WHERE id = $4',
      [title, description, iconName, id]
    );
    generateSitemap().catch(() => {});
    res.json({ id, title, description, iconName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hizmet güncellenirken hata oluştu' });
  }
});

app.delete('/api/services/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM services WHERE id = $1', [id]);
    generateSitemap().catch(() => {});
    res.json({ message: 'Hizmet başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hizmet silinirken hata oluştu' });
  }
});

// PRODUCTS API
app.get('/api/products', async (req, res) => {
  try {
    // P1-9: LIMIT — tüm ürünleri sonsuz yükleme (büyüyen tablo = büyüyen payload)
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const rows = await db.query('SELECT * FROM products ORDER BY id DESC LIMIT $1', [limit]);

    // Images alanını parse et ve is_featured'ı boolean'a çevir (JSONB → object, eski TEXT → string)
    const processedRows = rows.rows.map(row => ({
      ...row,
      images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : [],
      isFeatured: Boolean(row.is_featured)
    }));
    
    res.json(processedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürünler alınırken hata oluştu' });
  }
});

app.post('/api/products', adminAuth, upload.array('images', 10), imageOptimizer, async (req, res) => {
  try {
    const { name, description, category, is_featured } = req.body;
    const uploadedFiles = req.files || [];
    
    // Ana resim (ilk yüklenen resim)
    const imageUrl = uploadedFiles.length > 0 ? `/uploads/${uploadedFiles[0].filename}` : '';
    
    // Tüm resimlerin yollarını JSON olarak sakla
    const images = uploadedFiles.map(file => `/uploads/${file.filename}`);
    const imagesJson = JSON.stringify(images);
    
    const isFeatured = toSmallInt(is_featured);

    const result = await db.query(
      'INSERT INTO products (name, description, category, image_url, images, is_featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, description, category, imageUrl, imagesJson, isFeatured]
    );
    // Yeni ürün eklendi, sitemap'i arka planda yenile
    generateSitemap().catch(() => {});
    res.json({ 
      id: result.rows[0].id, 
      name, 
      description, 
      category, 
      image_url: imageUrl,
      images: images,
      isFeatured: isFeatured
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürün eklenirken hata oluştu' });
  }
});

app.put('/api/products/:id', adminAuth, upload.array('images', 10), imageOptimizer, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, is_featured, deletedImages, keepExistingImages, imageOrder } = req.body;
    const uploadedFiles = req.files || [];

    // Mevcut images'ları al
    const existing = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    let currentImages = [];

    if (existing.rows.length > 0 && existing.rows[0].images) {
      try {
        currentImages = JSON.parse(existing.rows[0].images);
      } catch {
        currentImages = [];
      }
    }

    let allImages = [];

    // Silinen görselleri işle (her durumda çalışır)
    const normalizePath = (img) => {
      const match = img.match(/\/uploads\/.+$/);
      return match ? match[0] : img;
    };

    let updatedImages = currentImages;
    if (deletedImages) {
      let toDeleteRaw;
      try { toDeleteRaw = JSON.parse(deletedImages); }
      catch { toDeleteRaw = []; }
      const toDelete = toDeleteRaw.map(normalizePath);
      updatedImages = currentImages.filter(img => !toDelete.includes(normalizePath(img)));

      // Fiziksel dosyaları sil — yalnızca uploads sandbox'ı içinde, basename ile (path traversal koruması)
      toDelete.forEach(imagePath => {
        const safePath = path.basename(imagePath.replace(/\/akaydin-tarim\//g, '/'));
        if (!safePath || safePath === '.' || safePath === '..') return;
        const fullPath = path.join(UPLOADS_DIR, safePath);
        try {
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        } catch (e) {
          console.warn(`Dosya silinemedi: ${fullPath} — ${e.message}`);
        }
      });
    }

    // Ana görsel sıralaması: frontend imageOrder gönderdiyse (yalnızca mevcut, silinmemiş görsellerden) uygula
    if (imageOrder) {
      let orderRaw;
      try { orderRaw = JSON.parse(imageOrder); }
      catch { orderRaw = null; }
      if (Array.isArray(orderRaw) && orderRaw.length > 0) {
        const orderNormalized = orderRaw.map(normalizePath);
        const kept = updatedImages.map(normalizePath);
        // Sadece updatedImages içinde geçerlileri sıraya koy, listede olmayanları sona ekle
        const ordered = orderNormalized.filter(p => kept.includes(p)).map(p => updatedImages[kept.indexOf(p)]);
        const rest = updatedImages.filter(img => !ordered.includes(img));
        updatedImages = [...ordered, ...rest];
      }
    }

    // Yeni yüklenen görselleri ekle
    const newImages = uploadedFiles.map(file => `/uploads/${file.filename}`);
    allImages = [...updatedImages, ...newImages];
    
    // Ana resim (ilk resim)
    const imageUrl = allImages.length > 0 ? allImages[0] : existing.rows[0]?.image_url || '';
    const imagesJson = JSON.stringify(allImages);
    
    const isFeatured = toSmallInt(is_featured);
    
    await db.query(
      'UPDATE products SET name = $1, description = $2, category = $3, image_url = $4, images = $5, is_featured = $6 WHERE id = $7',
      [name, description, category, imageUrl, imagesJson, isFeatured, id]
    );
    // Ürün güncellendi, sitemap'i arka planda yenile
    generateSitemap().catch(() => {});
    res.json({ 
      id, 
      name, 
      description, 
      category, 
      image_url: imageUrl,
      images: allImages,
      isFeatured: isFeatured
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürün güncellenirken hata oluştu' });
  }
});

app.delete('/api/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    // Ürün silindi, sitemap'i arka planda yenile
    generateSitemap().catch(() => {});
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürün silinirken hata oluştu' });
  }
});

// BLOG POSTS API
app.get('/api/blog-posts', async (req, res) => {
  try {
    // P1-9: LIMIT — tüm blog'ları sonsuz yükleme (content multi-KB HTML). Modal content'i de bu listeden gelir.
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const rows = await db.query('SELECT * FROM blog_posts ORDER BY id DESC LIMIT $1', [limit]);
    res.json(rows.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog yazıları alınırken hata oluştu' });
  }
});

app.post('/api/blog-posts', adminAuth, upload.single('image'), imageOptimizer, async (req, res) => {
  try {
    const { title, content, excerpt, author, seo_title, seo_description, seo_keywords } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // -- SEO otomatik doldurma: bos alanlari title/content'ten turet --
    var finalSeoTitle = seo_title || stripHtml(title);
    var finalSeoDescription = seo_description || (excerpt || '').substring(0, 160);
    var finalSeoKeywords = seo_keywords;
    if (!seo_keywords && title) {
      var stops = new Set(['ve','veya','ile','icin','bir','bu','da','de','ki','ise','ama','fakat','cok','daha','olarak','gibi','kadar','sonra','once','her','su','o','ne','nasil','nerede','hangi','kim','neden']);
      finalSeoKeywords = title.toLowerCase().split(/[\s,.;:!?()]+/).filter(function(w) { return w.length > 2 && !stops.has(w); }).slice(0, 5).join(', ');
    }

    const result = await db.query(
      'INSERT INTO blog_posts (title, summary, content, excerpt, author, date, image_url, views, seo_title, seo_description, seo_keywords, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, $10, NOW()) RETURNING id',
      [title, excerpt || '', content || '', excerpt || '', author || 'Akaydın Tarım', currentDate, imageUrl, finalSeoTitle || null, finalSeoDescription || null, finalSeoKeywords || null]
    );
    // Blog yazısı eklendi, sitemap'i arka planda yenile
    generateSitemap().catch(() => {});
    res.json({ 
      id: result.rows[0].id, 
      title, 
      summary: excerpt || '',
      content: content || '', 
      excerpt: excerpt || '',
      author: author || 'Akaydın Tarım',
      date: currentDate,
      image_url: imageUrl,
      image: req.file ? req.file.filename : null,
      views: 0,
      seo_title: finalSeoTitle || null,
      seo_description: finalSeoDescription || null,
      seo_keywords: finalSeoKeywords || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog yazısı eklenirken hata oluştu' });
  }
});

app.put('/api/blog-posts/:id', adminAuth, upload.single('image'), imageOptimizer, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, author, seo_title, seo_description, seo_keywords } = req.body;
    
    // Mevcut kayıt bilgilerini al
    const existing = await db.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Blog yazısı bulunamadı' });
    }
    
    let imageUrl = existing.rows[0].image_url || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // -- SEO otomatik doldurma: bos alanlari title/content'ten turet --
    var fSeoTitle = seo_title || stripHtml(title);
    var fSeoDesc = seo_description || (excerpt || '').substring(0, 160);
    var fSeoKeys = seo_keywords;
    if (!seo_keywords && title) {
      var stops2 = new Set(['ve','veya','ile','icin','bir','bu','da','de','ki','ise','ama','fakat','cok','daha','olarak','gibi','kadar','sonra','once','her','su','o','ne','nasil','nerede','hangi','kim','neden']);
      fSeoKeys = title.toLowerCase().split(/[\s,.;:!?()]+/).filter(function(w) { return w.length > 2 && !stops2.has(w); }).slice(0, 5).join(', ');
    }

await db.query(
      'UPDATE blog_posts SET title = $1, summary = $2, content = $3, excerpt = $4, author = $5, image_url = $6, seo_title = $7, seo_description = $8, seo_keywords = $9, updated_at = NOW() WHERE id = $10',
      [title, excerpt || '', content || '', excerpt || '', author || 'Akaydın Tarım', imageUrl, fSeoTitle || null, fSeoDesc || null, fSeoKeys || null, id]
    );

    // Blog yazısı güncellendi, sitemap'i arka planda yenile
    generateSitemap().catch(() => {});
    res.json({ 
      id: parseInt(id), 
      title, 
      summary: excerpt || '',
      content: content || '', 
      excerpt: excerpt || '',
      author: author || 'Akaydın Tarım',
      date: existing.rows[0].date,
      image_url: imageUrl,
      image: req.file ? req.file.filename : null,
      views: existing.rows[0].views || 0,
      seo_title: fSeoTitle || null,
      seo_description: fSeoDesc || null,
      seo_keywords: fSeoKeys || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog yazısı güncellenirken hata oluştu' });
  }
});

app.delete('/api/blog-posts/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    // Blog yazısı silindi, sitemap'i arka planda yenile
    generateSitemap().catch(() => {});
    res.json({ message: 'Blog yazısı başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog yazısı silinirken hata oluştu' });
  }
});

// Blog okuma sayacını artır
app.post('/api/blog-posts/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [id]);
    res.json({ message: 'View count updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'View count güncellenirken hata oluştu' });
  }
});

// Blog istatistikleri için endpoint
app.get('/api/blog-posts/stats', adminAuth, async (req, res) => {
  try {
    const totalRows = await db.query('SELECT COUNT(*) as total FROM blog_posts');
    const viewsRows = await db.query('SELECT SUM(views) as totalViews FROM blog_posts');
    const topRows = await db.query('SELECT title, views FROM blog_posts ORDER BY views DESC LIMIT 5');
    
    res.json({
      totalPosts: totalRows.rows[0].total,
      totalViews: viewsRows.rows[0].totalViews || 0,
      topPosts: topRows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog istatistikleri alınırken hata oluştu' });
  }
});

// ABOUT PAGE API
app.get('/api/about', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM about_page LIMIT 1');
    const aboutData = rows.rows[0] || { mission: '', vision: '', title: '', content: '', images: null };
    
    // JSON string'i parse et
    if (aboutData.images) {
      try {
        aboutData.images = JSON.parse(aboutData.images);
      } catch {
        aboutData.images = [];
      }
    } else {
      aboutData.images = [];
    }
    
    res.json(aboutData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hakkımızda bilgileri alınırken hata oluştu' });
  }
});

app.put('/api/about', adminAuth, upload.array('images', 10), imageOptimizer, async (req, res) => {
  try {
    const { title, content, mission, vision, deletedImages } = req.body;
    const uploadedFiles = req.files || [];
    
    // Mevcut images'ları al
    const existing = await db.query('SELECT * FROM about_page LIMIT 1');
    let currentImages = [];
    
    if (existing.rows.length > 0 && existing.rows[0].images) {
      try {
        currentImages = JSON.parse(existing.rows[0].images);
      } catch {
        currentImages = [];
      }
    }
    
    // Silinen görselleri çıkar
    let updatedImages = currentImages;
    if (deletedImages && deletedImages !== '[]' && deletedImages !== 'null') {
      let toDelete = [];
      try {
        toDelete = JSON.parse(deletedImages);
      } catch {
        toDelete = [];
      }
      // Path'leri normalize et: sadece dosya adıyla eşleştir (farklı prefix'lere karşı)
      const toDeleteBasenames = toDelete.map(p => {
        try { return path.basename(new URL(p).pathname); } catch { return path.basename(p); }
      });
      console.log(`About silinecek: ${toDelete.length} görsel (basenames: ${JSON.stringify(toDeleteBasenames.slice(0,3))}...), mevcut: ${currentImages.length}`);
      updatedImages = currentImages.filter(img => {
        try { return !toDeleteBasenames.includes(path.basename(new URL(img).pathname)); } catch { return !toDeleteBasenames.includes(path.basename(img)); }
      });
      console.log(`About kalan: ${updatedImages.length} görsel`);
      
      // Fiziksel dosyaları sil (hata olsa bile devam et)
      toDelete.forEach(imagePath => {
        if (imagePath.startsWith('/uploads/')) {
          const fullPath = path.join(UPLOADS_DIR, path.basename(imagePath));
          try {
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
          } catch (e) {
            console.warn(`Dosya silinemedi: ${fullPath} — ${e.message}`);
          }
        }
      });
    }
    
    // Yeni yüklenen görselleri ekle
    const newImages = uploadedFiles.map(file => `/uploads/${file.filename}`);
    const allImages = [...updatedImages, ...newImages];
    
    const imagesJson = JSON.stringify(allImages);
    
    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE about_page SET title = $1, content = $2, mission = $3, vision = $4, images = $5 WHERE id = $6',
        [title || null, content || null, mission, vision, imagesJson, existing.rows[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO about_page (title, content, mission, vision, images) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [title || null, content || null, mission, vision, imagesJson]
      );
    }

    res.json({ 
      title: title || '', 
      content: content || '', 
      mission, 
      vision, 
      images: allImages 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hakkımızda bilgileri güncellenirken hata oluştu' });
  }
});

// About resim silme API
app.delete('/api/about/image', adminAuth, async (req, res) => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Resim yolu gerekli' });
    }
    
    // Mevcut images'ları al
    const existing = await db.query('SELECT * FROM about_page LIMIT 1');
    let currentImages = [];
    
    if (existing.rows.length > 0 && existing.rows[0].images) {
      try {
        currentImages = JSON.parse(existing.rows[0].images);
      } catch {
        currentImages = [];
      }
    }
    
    // Resmi listeden çıkar
    const updatedImages = currentImages.filter(img => img !== imagePath);
    
    // Fiziksel dosyayı sil
    if (imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(UPLOADS_DIR, path.basename(imagePath));
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          // File deletion failed
        }
      }
    }
    
    // Veritabanını güncelle
    const imagesJson = JSON.stringify(updatedImages);
    
    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE about_page SET images = $1 WHERE id = $2',
        [imagesJson, existing.rows[0].id]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Resim başarıyla silindi',
      images: updatedImages 
    });
  } catch (error) {
    console.error('Resim silme hatası:', error);
    res.status(500).json({ error: 'Resim silinirken hata oluştu' });
  }
});

// CONTACT PAGE API
app.get('/api/contact', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM contact_page LIMIT 1');
    res.json(rows.rows[0] || { 
      company_name: 'Akaydın Tarım',
      address: '', 
      phone: '', 
      whatsapp_phone: '', 
      email: '',
      facebook_url: '',
      instagram_url: '',
      twitter_url: '',
      linkedin_url: '',
      youtube_url: '',
      website: '',
      working_hours: '',
      map_embed: ''
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'İletişim bilgileri alınırken hata oluştu' });
  }
});

app.put('/api/contact', adminAuth, async (req, res) => {
  try {
    const { 
      company_name,
      address, 
      phone, 
      whatsapp_phone, 
      email, 
      facebook_url,
      instagram_url,
      twitter_url,
      linkedin_url,
      youtube_url,
      website,
      working_hours,
      map_embed
    } = req.body;
    
    const existing = await db.query('SELECT id FROM contact_page LIMIT 1');
    
    if (existing.rows.length > 0) {
      await db.query(
        `UPDATE contact_page SET 
         company_name = $1,
         address = $2, 
         phone = $3, 
         whatsapp_phone = $4, 
         email = $5, 
         facebook_url = $6, 
         instagram_url = $7, 
         twitter_url = $8, 
         linkedin_url = $9, 
         youtube_url = $10,
         website = $11,
         working_hours = $12,
         map_embed = $13
         WHERE id = $14`,
        [
          company_name || 'Akaydın Tarım', 
          address || '', 
          phone || '', 
          whatsapp_phone || '', 
          email || '', 
          facebook_url || '', 
          instagram_url || '', 
          twitter_url || '', 
          linkedin_url || '', 
          youtube_url || '',
          website || '',
          working_hours || '',
          map_embed || '',
          existing.rows[0].id
        ]
      );
    } else {
      await db.query(
        `INSERT INTO contact_page 
         (company_name, address, phone, whatsapp_phone, email, facebook_url, instagram_url, twitter_url, linkedin_url, youtube_url, website, working_hours, map_embed) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          company_name || 'Akaydın Tarım', 
          address || '', 
          phone || '', 
          whatsapp_phone || '', 
          email || '', 
          facebook_url || '', 
          instagram_url || '', 
          twitter_url || '', 
          linkedin_url || '', 
          youtube_url || '',
          website || '',
          working_hours || '',
          map_embed || ''
        ]
      );
    }
    
    res.json({ 
      company_name: company_name || 'Akaydın Tarım',
      address: address || '', 
      phone: phone || '', 
      whatsapp_phone: whatsapp_phone || '', 
      email: email || '', 
      facebook_url: facebook_url || '', 
      instagram_url: instagram_url || '', 
      twitter_url: twitter_url || '', 
      linkedin_url: linkedin_url || '', 
      youtube_url: youtube_url || '',
      website: website || '',
      working_hours: working_hours || '',
      map_embed: map_embed || ''
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'İletişim bilgileri güncellenirken hata oluştu' });
  }
});

// CONTACT MESSAGES API
app.post('/api/contact/messages', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Input validasyonu
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Ad alanı zorunludur ve en az 2 karakter olmalıdır' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi gereklidir' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Mesaj alanı zorunludur ve en az 10 karakter olmalıdır' });
    }

    const result = await db.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name.trim(), email.trim(), phone || null, subject || null, message.trim()]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Mesajınız başarıyla gönderildi',
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ error: 'Mesaj gönderilirken hata oluştu' });
  }
});

app.get('/api/contact/messages', adminAuth, async (req, res) => {
  try {
    const rows = await db.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(rows.rows);
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Mesajlar alınırken hata oluştu' });
  }
});

app.put('/api/contact/messages/:id/read', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE contact_messages SET is_read = 1 WHERE id = $1',
      [id]
    );
    res.json({ success: true, message: 'Mesaj okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Mesaj güncellenirken hata oluştu' });
  }
});

app.delete('/api/contact/messages/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM contact_messages WHERE id = $1', [id]);
    res.json({ success: true, message: 'Mesaj silindi' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Mesaj silinirken hata oluştu' });
  }
});

// HERO API
app.get('/api/hero', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM hero_content ORDER BY order_index ASC');
    res.json(rows.rows);
  } catch (error) {
    console.error('Hero içeriği alınırken hata:', error);
    res.status(500).json({ error: 'Hero içeriği alınırken hata oluştu' });
  }
});

app.post('/api/hero', adminAuth, upload.single('background_image'), imageOptimizer, async (req, res) => {
  try {
	    const { title, subtitle, description, cta, background_gradient, is_active, order_index } = req.body;
    const backgroundImage = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await db.query(
      'INSERT INTO hero_content (title, subtitle, description, cta, background_gradient, background_image, is_active, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [title, subtitle, description, cta, background_gradient, backgroundImage, toSmallInt(is_active), parseInt(order_index) || 1]
    );

    res.json({ 
      id: result.rows[0].id, 
      title, 
      subtitle, 
      description, 
      cta, 
      background_gradient: background_gradient,
      background_image: backgroundImage,
      is_active: is_active === 'true',
      order_index: parseInt(order_index) || 1
    });
  } catch (error) {
    console.error('Hero içeriği eklenirken hata:', error);
    res.status(500).json({ error: 'Hero içeriği eklenirken hata oluştu' });
  }
});

app.put('/api/hero/:id', adminAuth, upload.single('background_image'), imageOptimizer, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, cta, background_gradient, is_active, order_index } = req.body;
    const newBackgroundImage = req.file ? `/uploads/${req.file.filename}` : null;
    
    let query = 'UPDATE hero_content SET title = $1, subtitle = $2, description = $3, cta = $4, background_gradient = $5, is_active = $6, order_index = $7';
    let values = [title, subtitle, description, cta, background_gradient, toSmallInt(is_active), parseInt(order_index) || 1];
    
    if (newBackgroundImage) {
      query += ', background_image = $8';
      values.push(newBackgroundImage);
    }

    query += ' WHERE id = $' + (values.length + 1);
    values.push(id);

    await db.query(query, values);

    // Güncellenmiş kaydı tekrar oku ki mevcut background_image'ı da dönebilelim
    const updated = await db.query('SELECT * FROM hero_content WHERE id = $1', [id]);

    res.json({ 
      id: parseInt(id), 
      title, 
      subtitle, 
      description, 
      cta, 
      background_gradient: background_gradient,
      background_image: updated.rows[0]?.background_image || null,
      is_active: is_active === 'true',
      order_index: parseInt(order_index) || 1
    });
  } catch (error) {
    console.error('Hero içeriği güncellenirken hata:', error);
    res.status(500).json({ error: 'Hero içeriği güncellenirken hata oluştu' });
  }
});

app.delete('/api/hero/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM hero_content WHERE id = $1', [id]);
    res.json({ message: 'Hero içeriği silindi' });
  } catch (error) {
    console.error('Hero içeriği silinirken hata:', error);
    res.status(500).json({ error: 'Hero içeriği silinirken hata oluştu' });
  }
});

app.put('/api/hero/order', adminAuth, async (req, res) => {
  try {
    const { items } = req.body;
    
    for (const item of items) {
      await db.query('UPDATE hero_content SET order_index = $1 WHERE id = $2', [item.order, item.id]);
    }
    
    res.json({ message: 'Sıralama güncellendi' });
  } catch (error) {
    console.error('Hero sıralaması güncellenirken hata:', error);
    res.status(500).json({ error: 'Sıralama güncellenirken hata oluştu' });
  }
});

// SEO API ENDPOINTS
// =================

// SEO Settings
app.get('/api/seo/settings', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM seo_settings LIMIT 1');
    res.json(rows.rows[0] || {
      site_title: 'Akaydın Tarım - Fındık Üretimi ve Satışı',
      site_description: 'Hendek/Sakarya\'da kaliteli fındık üretimi ve satışı. Organik tarım ürünleri.',
      site_keywords: 'fındık, tarım, hendek, sakarya, organik',
      site_author: 'Akaydın Tarım',
      og_title: 'Akaydın Tarım - Premium Fındık Üreticisi',
      og_description: 'Hendek/Sakarya\'da kaliteli fındık üretimi',
      og_image: '',
      og_url: 'https://www.akaydintarim.com.tr',
      twitter_card: 'summary_large_image',
      twitter_site: '@akaydintarim',
      twitter_creator: '@akaydintarim',
      canonical_url: 'https://www.akaydintarim.com.tr',
      robots_txt: 'User-agent: *\\nAllow: /\\nDisallow: /api/\\nDisallow: /admin\\nSitemap: https://www.akaydintarim.com.tr/sitemap.xml',
      google_analytics_id: '',
      google_search_console: '',
      facebook_pixel_id: '',
      schema_organization: '',
      sitemap_enabled: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SEO ayarları alınırken hata oluştu' });
  }
});

app.put('/api/seo/settings', adminAuth, async (req, res) => {
  try {
    const {
      site_title, site_description, site_keywords, site_author,
      og_title, og_description, og_image, og_url,
      twitter_card, twitter_site, twitter_creator,
      canonical_url, robots_txt,
      google_analytics_id, google_search_console, facebook_pixel_id,
      schema_organization, sitemap_enabled
    } = req.body;

    const existing = await db.query('SELECT id FROM seo_settings LIMIT 1');
    
    if (existing.rows.length > 0) {
      await db.query(
        `UPDATE seo_settings SET 
         site_title = $1, site_description = $2, site_keywords = $3, site_author = $4,
         og_title = $5, og_description = $6, og_image = $7, og_url = $8,
         twitter_card = $9, twitter_site = $10, twitter_creator = $11,
         canonical_url = $12, robots_txt = $13,
         google_analytics_id = $14, google_search_console = $15, facebook_pixel_id = $16,
         schema_organization = $17, sitemap_enabled = $18
         WHERE id = $19`,
        [
          site_title, site_description, site_keywords, site_author,
          og_title, og_description, og_image, og_url,
          twitter_card, twitter_site, twitter_creator,
          canonical_url, robots_txt,
          google_analytics_id, google_search_console, facebook_pixel_id,
          schema_organization, toSmallInt(sitemap_enabled),
          existing.rows[0].id
        ]
      );
    } else {
      await db.query(
        `INSERT INTO seo_settings 
         (site_title, site_description, site_keywords, site_author,
          og_title, og_description, og_image, og_url,
          twitter_card, twitter_site, twitter_creator,
          canonical_url, robots_txt,
          google_analytics_id, google_search_console, facebook_pixel_id,
          schema_organization, sitemap_enabled) 
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        `,
        [
          site_title, site_description, site_keywords, site_author,
          og_title, og_description, og_image, og_url,
          twitter_card, twitter_site, twitter_creator,
          canonical_url, robots_txt,
          google_analytics_id, google_search_console, facebook_pixel_id,
          schema_organization, toSmallInt(sitemap_enabled)
        ]
      );
    }
    
    res.json({ message: 'SEO ayarları güncellendi' });
    // Canonical URL değiştiyse sitemap'i yenile
    generateSitemap().catch(() => {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SEO ayarları güncellenirken hata oluştu' });
  }
});

// Page SEO
// Page SEO - Public read with query, admin-only listing
app.get('/api/seo/pages', async (req, res) => {
  try {
    const { path } = req.query;
    if (path) {
      // Public access: sayfa SEO verisi (admin token gerekmez)
      const rows = await db.query('SELECT * FROM page_seo WHERE page_path = $1', [path]);
      res.json(rows.rows[0] || null);
    } else {
      // Admin-only: tüm sayfa SEO listesi (token kontrolü)
      const token = req.headers.authorization?.replace('Bearer ', '') || parseCookies(req).admin_token;
      if (!token || !adminTokens.has(token)) {
        return res.status(401).json({ error: 'Yetkisiz erişim' });
      }
      const rows = await db.query('SELECT * FROM page_seo ORDER BY page_path');
      res.json(rows.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sayfa SEO verileri alınırken hata oluştu' });
  }
});

app.post('/api/seo/pages', adminAuth, async (req, res) => {
  try {
    const {
      page_path, page_title, meta_description, meta_keywords,
      og_title, og_description, og_image, canonical_url,
      noindex, nofollow
    } = req.body;

    await db.query(
      `INSERT INTO page_seo 
       (page_path, page_title, meta_description, meta_keywords,
        og_title, og_description, og_image, canonical_url,
        noindex, nofollow) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        page_path, page_title, meta_description, meta_keywords,
        og_title, og_description, og_image, canonical_url,
        toSmallInt(noindex), toSmallInt(nofollow)
      ]
    );
    
    res.json({ message: 'Sayfa SEO ayarı eklendi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sayfa SEO ayarı eklenirken hata oluştu' });
  }
});

app.put('/api/seo/pages/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page_path, page_title, meta_description, meta_keywords,
      og_title, og_description, og_image, canonical_url,
      noindex, nofollow
    } = req.body;

    await db.query(
      `UPDATE page_seo SET 
       page_path = $1, page_title = $2, meta_description = $3, meta_keywords = $4,
       og_title = $5, og_description = $6, og_image = $7, canonical_url = $8,
       noindex = $9, nofollow = $10
       WHERE id = $11`,
      [
        page_path, page_title, meta_description, meta_keywords,
        og_title, og_description, og_image, canonical_url,
        toSmallInt(noindex), toSmallInt(nofollow), id
      ]
    );
    
    res.json({ message: 'Sayfa SEO ayarı güncellendi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sayfa SEO ayarı güncellenirken hata oluştu' });
  }
});

app.delete('/api/seo/pages/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM page_seo WHERE id = $1', [id]);
    res.json({ message: 'Sayfa SEO ayarı silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sayfa SEO ayarı silinirken hata oluştu' });
  }
});

// SEO Analysis - Gerçek sayfa analizi
app.get('/api/seo/analyze', adminAuth, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parametresi gerekli' });
    }

    // Veritabanından SEO ayarlarını ve sayfa verilerini topla
    const [seoSettings, pageSEO, products, blogPosts, services] = await Promise.all([
      db.query('SELECT * FROM seo_settings LIMIT 1'),
      db.query('SELECT * FROM page_seo WHERE page_path = $1', [url]),
      db.query('SELECT COUNT(*) as cnt FROM products'),
      db.query('SELECT COUNT(*) as cnt FROM blog_posts'),
      db.query('SELECT COUNT(*) as cnt FROM services'),
    ]);

    const settings = seoSettings.rows[0] || {};
    const pageData = pageSEO.rows[0] || {};

    const recommendations = [];

    // Title analizi
    const pageTitle = pageData.page_title || settings.site_title || '';
    const titleLength = pageTitle.length;
    if (!pageTitle) {
      recommendations.push('Sayfa başlığı (title) ayarlanmamış. SEO için her sayfaya özel başlık ekleyin.');
    } else if (titleLength < 30) {
      recommendations.push(`Başlık çok kısa (${titleLength} karakter). 50-60 karakter aralığında olmalıdır.`);
    } else if (titleLength > 60) {
      recommendations.push(`Başlık çok uzun (${titleLength} karakter). Google ilk 60 karakteri gösterir.`);
    }

    // Meta description analizi
    const description = pageData.meta_description || settings.site_description || '';
    const descriptionLength = description.length;
    if (!description) {
      recommendations.push('Meta açıklaması ayarlanmamış. Her sayfa için 150-160 karakterlik açıklama ekleyin.');
    } else if (descriptionLength > 160) {
      recommendations.push(`Meta açıklaması ${descriptionLength} karakter — 160 karakteri geçmemeli.`);
    }

    // OG tag kontrolü
    const hasOgTags = !!(settings.og_title || pageData.og_title);
    if (!hasOgTags) {
      recommendations.push('Open Graph etiketleri eksik. Sosyal medya paylaşımları için OG tags ekleyin.');
    }

    // Canonical kontrolü
    const hasCanonical = !!(settings.canonical_url || pageData.canonical_url);
    if (!hasCanonical) {
      recommendations.push('Canonical URL ayarlanmamış. Yinelenen içerik sorunlarını önlemek için ekleyin.');
    }

    // Site genel öneriler
    if (!settings.schema_organization) {
      recommendations.push('Schema markup (Organization) eklenmemiş. Yapılandırılmış veri ekleyin.');
    }
    if (!settings.sitemap_enabled) {
      recommendations.push('Sitemap devre dışı. Arama motorlarının sayfalarınızı keşfetmesi için etkinleştirin.');
    }

    if (recommendations.length === 0) {
      recommendations.push('SEO ayarlarınız iyi durumda! Düzenli içerik güncellemeleriyle sıralamanızı artırabilirsiniz.');
    }

    // İçerik istatistikleri
    const totalProducts = parseInt(products.rows[0]?.cnt) || 0;
    const totalBlogPosts = parseInt(blogPosts.rows[0]?.cnt) || 0;
    const totalServices = parseInt(services.rows[0]?.cnt) || 0;

    const analysis = {
      page_url: url,
      title: pageTitle,
      title_length: titleLength,
      description: description,
      description_length: descriptionLength,
      has_meta_description: !!description,
      has_og_tags: hasOgTags,
      has_canonical: hasCanonical,
      content_stats: {
        total_products: totalProducts,
        total_blog_posts: totalBlogPosts,
        total_services: totalServices,
      },
      site_health: {
        has_schema: !!settings.schema_organization,
        sitemap_enabled: !!settings.sitemap_enabled,
        has_analytics: !!settings.google_analytics_id,
      },
      recommendations
    };

    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SEO analizi yapılırken hata oluştu' });
  }
});

// Sitemap — bellek içi önbellek, diske yazma gerektirmez
let sitemapCache = null;

// Sitemap oluşturma yardımcı fonksiyonu — CRUD işlemlerinden sonra da çağrılabilir
async function generateSitemap() {
  const [products, blogPosts, seoSettings] = await Promise.all([
    db.query('SELECT id, updated_at FROM products'),
    db.query('SELECT id, updated_at FROM blog_posts'),
    db.query('SELECT * FROM seo_settings LIMIT 1'),
  ]);

  const baseUrl = (seoSettings.rows[0]?.canonical_url || 'https://www.akaydintarim.com.tr').replace(/\/$/, '');
  const now = new Date().toISOString().split('T')[0];

  const latestProductDate = products.rows.reduce((max, p) => {
    const d = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : max;
    return d > max ? d : max;
  }, '2026-01-01');
  const latestBlogDate = blogPosts.rows.reduce((max, p) => {
    const d = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : max;
    return d > max ? d : max;
  }, '2026-01-01');

  const urls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily', lastmod: latestProductDate > latestBlogDate ? latestProductDate : latestBlogDate },
    { loc: `${baseUrl}/hakkimizda`, priority: '0.8', changefreq: 'monthly', lastmod: now },
    { loc: `${baseUrl}/findik-isleme`, priority: '1.0', changefreq: 'daily', lastmod: now },
    { loc: `${baseUrl}/hizmetlerimiz`, priority: '0.9', changefreq: 'weekly', lastmod: now },
    { loc: `${baseUrl}/urunler`, priority: '0.8', changefreq: 'weekly', lastmod: latestProductDate },
    { loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'weekly', lastmod: latestBlogDate },
    { loc: `${baseUrl}/iletisim`, priority: '0.7', changefreq: 'monthly', lastmod: now },
  ];

  for (const p of products.rows) {
    urls.push({ loc: `${baseUrl}/urun/${p.id}`, priority: '0.6', changefreq: 'monthly', lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : now });
  }
  // P1-2: Blog yazıları URL'siz (modal-based, /blog/:id route'u yok) — 404 sitemap URL üretme.
  // Blog yazıları indexlenecekse önce App.tsx'e /blog/:id route'u eklenmeli.
  // (blogPosts.rows yalnızca lastmod hesabı için kullanılıyor)

  sitemapCache = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return { url_count: urls.length };
}

// Sitemap oluşturma — Admin panelinden POST ile tetiklenir
app.post('/api/seo/sitemap', adminAuth, async (req, res) => {
  try {
    const result = await generateSitemap();
    res.json({
      url: '/sitemap.xml',
      last_generated: new Date().toISOString(),
      url_count: result.url_count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sitemap oluşturulurken hata oluştu' });
  }
});

// Sitemap durumunu görüntüleme — Admin panelinden bilgi almak için GET
app.get('/api/seo/sitemap', adminAuth, async (req, res) => {
  try {
    const exists = sitemapCache !== null;
    const size = exists ? Buffer.byteLength(sitemapCache) : 0;

    res.json({
      exists,
      url: '/sitemap.xml',
      last_modified: exists ? new Date().toISOString() : null,
      size_bytes: size,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sitemap bilgisi alınırken hata oluştu' });
  }
});

// Public sitemap.xml — arama motorları için herkese açık (bellekten serve)
app.get('/sitemap.xml', async (req, res) => {
  if (!sitemapCache) {
    try { await generateSitemap(); } catch {}
  }
  if (sitemapCache) {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.send(sitemapCache);
  } else {
    res.status(404).json({ error: 'Sitemap henüz oluşturulamadı' });
  }
});

// Robots.txt - Gerçek dosya yazma
app.put('/api/seo/robots', adminAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Robots.txt içeriği gerekli' });
    }

    const robotsPath = path.join(__dirname, '../public/robots.txt');
    fs.mkdirSync(path.dirname(robotsPath), { recursive: true });
    fs.writeFileSync(robotsPath, content);

    res.json({ message: 'Robots.txt güncellendi ve kaydedildi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Robots.txt güncellenirken hata oluştu' });
  }
});

app.get('/api/seo/robots', adminAuth, async (req, res) => {
  try {
    const robotsPath = path.join(__dirname, '../public/robots.txt');
    let content = 'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nSitemap: https://www.akaydintarim.com.tr/sitemap.xml';
    if (fs.existsSync(robotsPath)) {
      content = fs.readFileSync(robotsPath, 'utf-8');
    }
    res.json({ content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Robots.txt alınırken hata oluştu' });
  }
});

// ===== SERP RANK TRACKER API =====

// Anahtar kelime listesi
app.get('/api/serp-rankings/keywords', adminAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM serp_keywords ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "SERP verileri al�n�rken hata olu�tu" });
  }
});

// Yeni keyword ekle
app.post('/api/serp-rankings/keywords', adminAuth, async (req, res) => {
  try {
    const { keyword, domain } = req.body;
    const { rows } = await db.query(
      'INSERT INTO serp_keywords (keyword, domain) VALUES ($1, $2) ON CONFLICT (keyword) DO UPDATE SET is_active = true RETURNING *',
      [keyword, domain || 'akaydintarim.com.tr']
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Keyword eklenirken hata olu�tu" });
  }
});

// Keyword sil
app.delete('/api/serp-rankings/keywords/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM serp_keywords WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Keyword silinirken hata olu�tu" });
  }
});

// Tüm keyword'lerin son durumu (domain ile birlikte)
app.get('/api/serp-rankings/current', adminAuth, async (req, res) => {
  try {
    const { domain } = req.query;
    let query = `
      SELECT DISTINCT ON (r.keyword, r.engine, COALESCE(r.domain, 'akaydintarim.com.tr'))
        r.keyword, r.engine, r.position, r.url, r.checked_at,
        COALESCE(r.domain, 'akaydintarim.com.tr') as domain
      FROM serp_rankings r
    `;
    const params = [];
    if (domain) {
      query += ' WHERE COALESCE(r.domain, \'akaydintarim.com.tr\') = $1';
      params.push(domain);
    }
    query += ' ORDER BY r.keyword, r.engine, COALESCE(r.domain, \'akaydintarim.com.tr\'), r.checked_at DESC';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "S�ralama verileri al�n�rken hata olu�tu" });
  }
});

// Geçmiş veriler
app.get('/api/serp-rankings/history', adminAuth, async (req, res) => {
  try {
    const { keyword, engine, days, domain } = req.query;
    const sinceDays = Math.max(1, Math.min(365, parseInt(days) || 30));
    const params = [sinceDays];
    let query = `SELECT * FROM serp_rankings WHERE checked_at >= NOW() - INTERVAL '1 DAY' * $1`;

    if (keyword) { params.push(keyword); query += ` AND keyword = $${params.length}`; }
    if (engine) { params.push(engine); query += ` AND engine = $${params.length}`; }
    if (domain) { params.push(domain); query += ` AND COALESCE(domain, 'akaydintarim.com.tr') = $${params.length}`; }
    query += ' ORDER BY checked_at ASC';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "S�ralama ge�mi�i al�n�rken hata olu�tu" });
  }
});

// Manuel kontrol tetikle (tüm keyword'ler)
app.post('/api/serp-rankings/check', adminAuth, async (req, res) => {
  res.json({ message: 'SERP kontrolü başlatıldı' });
  checkAllRankings(db).catch(err => console.error('[SERP] Manuel kontrol hatası:', formatError(err)));
});

// Manuel kontrol tetikle (tek keyword)
app.post('/api/serp-rankings/check/:keywordId', adminAuth, async (req, res) => {
  res.json({ message: 'SERP kontrolü başlatıldı' });
  checkSingleKeyword(db, req.params.keywordId).catch(err => console.error('[SERP] Tekli kontrol hatası:', formatError(err)));
});

// Health check — container healthcheck + traefik için (rate limit / auth / cache dışı)
app.get('/healthz', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Favicon ve robots.txt (public/) — SPA artık nginx container'ından serve ediliyor (P2-6)
app.use(express.static(path.join(__dirname, '../public'), { maxAge: '7d' }));

app.listen(PORT, async () => {
  console.log(`Akaydın Tarım sunucusu port ${PORT} üzerinde çalışıyor.`);
  console.log(`Admin paneli: http://localhost:${PORT}/admin`);

  // Sunucu başlangıcında sitemap'i otomatik oluştur
  try {
    const result = await generateSitemap();
    console.log(`Sitemap oluşturuldu: ${result.url_count} URL`);
  } catch (err) {
    console.error('Sitemap başlangıçta oluşturulamadı:', err.message);
  }
});
