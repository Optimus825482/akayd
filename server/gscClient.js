/**
 * Google Search Console API Entegrasyonu
 *
 * Kurulum:
 * 1. https://console.cloud.google.com → Search Console API'yi etkinleştir
 * 2. Service Account oluştur → JSON key indir → proje köküne gsc-key.json olarak kaydet
 * 3. Google Search Console'da siteni ekle → Ayarlar → Kullanıcılar → service account email'ini ekle (Tam yetki)
 *
 * Ücretsiz. Günlük 2000 sorgu limiti.
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Service account key dosyası
const KEY_FILE = process.env.GSC_KEY_FILE || path.join(__dirname, '..', 'gsc-key.json');

// Site URL (Search Console'da kayıtlı property)
const SITE_URL = process.env.GSC_SITE_URL || 'https://www.akaydintarim.com.tr';

let auth = null;

/**
 * Google Search Console auth client'ı oluşturur.
 * gsc-key.json dosyası yoksa null döner → scraping fallback kullanılır.
 */
function getAuth() {
  if (auth) return auth;

  try {
    if (!fs.existsSync(KEY_FILE)) {
      console.warn('[GSC] gsc-key.json bulunamadı — Google scraping fallback kullanılacak.');
      console.warn('[GSC] Kurulum: Google Cloud Console → Service Account → JSON key indir → gsc-key.json olarak kaydet');
      return null;
    }

    const keyData = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
    auth = new google.auth.GoogleAuth({
      credentials: keyData,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    console.log('[GSC] Service account auth başarılı.');
    return auth;
  } catch (err) {
    console.error('[GSC] Kimlik doğrulama hatası:', err.message);
    return null;
  }
}

/**
 * Search Console API ile belirli bir keyword'ün sıralamasını sorgular.
 *
 * @returns {{ position: number, url: string | null }} veya null (hata/sıralama dışı)
 */
export async function checkGSC(keyword) {
  const client = getAuth();
  if (!client) return null;

  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth: client });

    // Son 7 günlük veri
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'query',
            expression: keyword,
            operator: 'equals',
          }],
        }],
        rowLimit: 1,
      },
    });

    const rows = response.data.rows || [];
    if (rows.length > 0) {
      const position = Math.round(rows[0].keys[0] === keyword ? rows[0].position : 0);
      const impressions = rows[0].impressions || 0;
      console.log(`[GSC] "${keyword}" → #${position > 0 ? position : 'sıralama dışı'} (${impressions} görüntülenme)`);
      // GSC pozisyon veriyor ama URL vermiyor — URL için ana sayfayı dön
      return { position: position > 0 ? position : 0, url: position > 0 ? SITE_URL : null };
    }

    console.log(`[GSC] "${keyword}" → veri yok (sıralama dışı)`);
    return { position: 0, url: null };
  } catch (err) {
    console.error(`[GSC] "${keyword}" sorgu hatası:`, err.message);
    return null;
  }
}

/**
 * Search Console API'nin kullanılabilir olup olmadığını kontrol eder.
 */
export function isGSCAvailable() {
  return getAuth() !== null;
}
