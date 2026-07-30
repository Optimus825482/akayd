import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeGoogle(query, domain) {
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
        'INSERT INTO serp_rankings (keyword, engine, position, url) VALUES ($1, $2, $3, $4)',
        [keyword, engine, result.position, result.url]
      );
      console.log(`[SERP] ${engine}: "${keyword}" → #${result.position || 'sıralama dışı'}`);
    } catch (dbErr) {
      console.error(`[SERP] DB insert error for "${keyword}" ${engine}:`, formatError(dbErr));
    }
  }
  return result;
}

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
        await checkKeyword(db, kw.keyword, engine, kw.domain);
        await sleep(3000 + Math.random() * 2000); // 3-5 saniye bekleme
        checked++;
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
