import axios from 'axios';
import * as cheerio from 'cheerio';
import { checkGSC, isGSCAvailable } from './gscClient.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function formatError(err) {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}${err.code ? ` (code: ${err.code})` : ''}`;
  }
  return typeof err === 'string' ? err : JSON.stringify(err) || 'Bilinmeyen hata';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeGoogle(query, domain) {
  // Google Search Console API mevcutsa onu kullan (daha güvenilir, ücretsiz)
  if (isGSCAvailable()) {
    try {
      // Domain'i GSC site URL'ine çevir
      let siteUrl;
      if (domain.includes('://')) {
        siteUrl = domain;
      } else if (domain === 'hendekfindikkirma.com') {
        siteUrl = 'https://hendekfindikkirma.com'; // www yok!
      } else {
        siteUrl = `https://www.${domain}`;
      }
      const result = await checkGSC(query, siteUrl);
      if (result !== null) return result;
    } catch (err) {
      console.warn(`[SERP] GSC hatası, scraping fallback kullanılıyor:`, err.message);
    }
  }

  // Fallback: HTML scraping
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=tr&gl=TR&num=50`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });
    const $ = cheerio.load(data);
    const results = [];
    $('a[href^="http"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.includes('google.com') && !href.includes('googleadservices')) {
        results.push(href);
      }
    });

    // Dedupe and find domain match
    const unique = [...new Set(results)];
    for (let i = 0; i < Math.min(unique.length, 50); i++) {
      if (unique[i].includes(domain)) {
        return { position: i + 1, url: unique[i] };
      }
    }
    return { position: 0, url: null };
  } catch (err) {
    console.error(`[SERP] Google scrape error for "${query}":`, formatError(err));
    return null;
  }
}

async function scrapeYandex(query, domain) {
  const url = `https://yandex.com.tr/search/?text=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept-Language': 'tr-TR,tr;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });
    const $ = cheerio.load(data);
    const results = [];
    $('a[href^="http"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.includes('yandex.com.tr') && !href.includes('yastatic.net')) {
        results.push(href);
      }
    });

    const unique = [...new Set(results)];
    for (let i = 0; i < Math.min(unique.length, 50); i++) {
      if (unique[i].includes(domain)) {
        return { position: i + 1, url: unique[i] };
      }
    }
    return { position: 0, url: null };
  } catch (err) {
    console.error(`[SERP] Yandex scrape error for "${query}":`, formatError(err));
    return null;
  }
}

async function scrapeBing(query, domain) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=tr&count=50`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept-Language': 'tr-TR,tr;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });
    const $ = cheerio.load(data);
    const results = [];
    $('a[href^="http"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.includes('bing.com') && !href.includes('microsoft.com')) {
        results.push(href);
      }
    });

    const unique = [...new Set(results)];
    for (let i = 0; i < Math.min(unique.length, 50); i++) {
      if (unique[i].includes(domain)) {
        return { position: i + 1, url: unique[i] };
      }
    }
    return { position: 0, url: null };
  } catch (err) {
    console.error(`[SERP] Bing scrape error for "${query}":`, formatError(err));
    return null;
  }
}

async function checkKeyword(db, keyword, engine, domain) {
  let result;
  switch (engine) {
    case 'google': result = await scrapeGoogle(keyword, domain); break;
    case 'yandex': result = await scrapeYandex(keyword, domain); break;
    case 'bing': result = await scrapeBing(keyword, domain); break;
    default: return null;
  }

  if (result) {
    try {
      await db.query(
        'INSERT INTO serp_rankings (keyword, engine, position, url, domain) VALUES ($1, $2, $3, $4, $5)',
        [keyword, engine, result.position, result.url, domain]
      );
      console.log(`[SERP:${domain}] ${engine}: "${keyword}" → #${result.position || 'sıralama dışı'}`);
    } catch (dbErr) {
      console.error(`[SERP] DB insert error for "${keyword}" ${engine}:`, formatError(dbErr));
    }
  }
  return result;
}

// Hendek Fındık Kırma mikro sitesi için ek domain
const EXTRA_DOMAINS = process.env.SERP_EXTRA_DOMAINS 
  ? process.env.SERP_EXTRA_DOMAINS.split(',').map(d => d.trim())
  : ['hendekfindikkirma.com'];

export async function checkAllRankings(db) {
  console.log('[SERP] Kontrol başladı...');
  try {
    const { rows: keywords } = await db.query(
      'SELECT id, keyword, domain FROM serp_keywords WHERE is_active = true ORDER BY id'
    );
    const engines = ['google', 'yandex', 'bing'];
    let checked = 0;

    for (const kw of keywords) {
      for (const engine of engines) {
        // 1. Keyword'ün kendi domain'i için kontrol
        await checkKeyword(db, kw.keyword, engine, kw.domain);
        await sleep(3000 + Math.random() * 2000);
        checked++;
        
        // 2. Ek domain'ler için de aynı keyword'ü kontrol et
        for (const extraDomain of EXTRA_DOMAINS) {
          if (extraDomain !== kw.domain) {
            await checkKeyword(db, kw.keyword, engine, extraDomain);
            await sleep(2000 + Math.random() * 1000);
            checked++;
          }
        }
      }
    }
    console.log(`[SERP] Kontrol tamamlandı. ${checked} sorgu yapıldı.`);
  } catch (err) {
    console.error('[SERP] Kontrol hatası:', formatError(err));
    throw err;
  }
}

export async function checkSingleKeyword(db, keywordId) {
  try {
    const { rows } = await db.query('SELECT id, keyword, domain FROM serp_keywords WHERE id = $1', [keywordId]);
    if (rows.length === 0) return;

    const kw = rows[0];
    for (const engine of ['google', 'yandex', 'bing']) {
      await checkKeyword(db, kw.keyword, engine, kw.domain);
      await sleep(3000 + Math.random() * 2000);
    }
  } catch (err) {
    console.error('[SERP] Tekli kontrol hatası:', formatError(err));
    throw err;
  }
}
