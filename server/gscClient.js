/**
 * Google Search Console API Entegrasyonu
 *
 * Kurulum:
 * 1. https://console.cloud.google.com → Search Console API'yi etkinleştir
 * 2. Service Account oluştur → JSON key indir
 * 3. JSON içeriğini Coolify Environment: GSC_KEY_JSON='{...}' olarak ekle (tek satır)
 *    Veya sunucuda dosya olarak: /data/akaydin/gsc-key.json
 * 4. Google Search Console'da siteni ekle → Kullanıcılar → service account email'ini ekle
 *
 * Ücretsiz. Günlük 2000 sorgu limiti.
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Service account key: önce env, sonra dosya yolu
const KEY_FILE = process.env.GSC_KEY_FILE || path.join(__dirname, '..', 'gsc-key.json');

// Varsayılan site URL'leri (virgülle ayrılmış)
const GSC_SITES = (process.env.GSC_SITES || 'https://www.akaydintarim.com.tr,https://www.hendekfindikkirma.com').split(',').map(s => s.trim());

let auth = null;

/**
 * Google Search Console auth client'ı oluşturur.
 * gsc-key.json dosyası yoksa null döner → scraping fallback kullanılır.
 */
function getAuth() {
  if (auth) return auth;

  try {
    let keyData = null;

    // 1. GSC_KEY_JSON env değişkeninden (önerilen)
    if (process.env.GSC_KEY_JSON) {
      keyData = JSON.parse(process.env.GSC_KEY_JSON);
      console.log('[GSC] Env değişkeninden auth başarılı (GSC_KEY_JSON).');
    }
    // 2. Dosyadan (fallback)
    else if (fs.existsSync(KEY_FILE)) {
      keyData = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
      console.log('[GSC] Dosyadan auth başarılı (' + KEY_FILE + ').');
    }
    // 3. Hiçbiri yok → scrape fallback
    else {
      console.warn('[GSC] GSC_KEY_JSON env veya gsc-key.json bulunamadı — Google scraping fallback kullanılacak.');
      return null;
    }
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
 * @param {string} keyword - Aranacak anahtar kelime
 * @param {string} [siteUrl] - Site URL (boşsa GSC_SITES'teki ilk site)
 * @returns {{ position: number, url: string | null, site: string }} veya null
 */
export async function checkGSC(keyword, siteUrl) {
  const client = getAuth();
  if (!client) return null;

  const site = siteUrl || GSC_SITES[0];

  try {
    const searchconsole = google.searchconsole({ version: 'v1', auth: client });

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await searchconsole.searchanalytics.query({
      siteUrl: site,
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
      console.log(`[GSC:${new URL(site).hostname}] "${keyword}" → #${position > 0 ? position : 'sıralama dışı'}`);
      return { position: position > 0 ? position : 0, url: position > 0 ? site : null, site };
    }

    console.log(`[GSC:${new URL(site).hostname}] "${keyword}" → veri yok`);
    return { position: 0, url: null, site };
  } catch (err) {
    console.error(`[GSC:${site}] "${keyword}" sorgu hatası:`, err.message);
    return null;
  }
}

/**
 * Search Console API'nin kullanılabilir olup olmadığını kontrol eder.
 */
export function isGSCAvailable() {
  return getAuth() !== null;
}
