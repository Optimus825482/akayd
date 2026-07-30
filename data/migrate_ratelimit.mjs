import fs from 'fs';

const f = 'D:/repos/akayd-n-tar-m/server/index.js';
let c = fs.readFileSync(f, 'utf8');

// Remove old rate limit code and replace with express-rate-limit
const oldRateLimit = `// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;

// Periyodik temizlik: süresi dolmuş timestamp'leri filtrele, boş kalan IP'leri sil
const RATE_LIMIT_CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 dakika
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimit) {
    const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (valid.length === 0) {
      rateLimit.delete(ip);
    } else {
      rateLimit.set(ip, valid);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL);

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  const timestamps = rateLimit.get(ip).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Çok fazla istek, lütfen bekleyin' });
  }
  timestamps.push(now);
  rateLimit.set(ip, timestamps);
  next();
});`;

const newRateLimit = `// Rate limiting (express-rate-limit ile — bellek tabanlı, tek instance için yeterli)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // her IP için maksimum 100 istek
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek, lütfen 15 dakika sonra tekrar deneyin' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // auth endpoint'leri için daha sıkı limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin' },
});

// Genel rate limit: API rotalarında
app.use('/api', limiter);
// Auth giriş endpoint'ine daha sıkı limit
app.use('/api/admin/login', authLimiter);`;

// Match by the first line pattern - find the start
const startIdx = c.indexOf('// Rate limiting');
if (startIdx === -1) { console.log('Rate limiting section not found!'); process.exit(1); }

// Find the end - look for the "});" after the app.use
const endIdx = c.indexOf('// PostgreSQL', startIdx);
if (endIdx === -1) { console.log('End of rate limit section not found!'); process.exit(1); }

// Replace
c = c.substring(0, startIdx) + newRateLimit + '\n\n' + c.substring(endIdx);

fs.writeFileSync(f, c);
console.log('Rate limit migration complete');
