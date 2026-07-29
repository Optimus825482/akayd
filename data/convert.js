// MySQL -> PostgreSQL converter: db.execute + ? -> db.query + $1,$2
import { readFileSync, writeFileSync } from 'fs';

const filepath = 'd:/repos/akayd-n-tar-m/server/index.js';
let text = readFileSync(filepath, 'utf-8');

// 1. Import mysql -> pg
text = text.replace("import mysql from 'mysql2/promise';", "import pkg from 'pg';\nconst { Pool } = pkg;");

// 2. let fs -> import fs
text = text.replace("// Only import when needed - lazy loading\nlet fs;", "import fs from 'fs';");

// 3. DB pool
text = text.replace(
`const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'akaydin',
  password: process.env.DB_PASSWORD || '518518',
  database: process.env.DB_NAME || 'akaydin_tarim',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});`,
`const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'akaydin_tarim',
  max: 10,
  idleTimeoutMillis: 30000,
});`
);

// 4. db.execute -> db.query
text = text.replace(/db\.execute\(/g, 'db.query(');

// 5. Replace ? with $1,$2... inside SQL strings
// Strategy: split by db.query(, then for each block find quoted strings and fix ?
const blocks = text.split('db.query(');
const result = [blocks[0]];

for (let i = 1; i < blocks.length; i++) {
  let block = blocks[i];
  
  // Check if this block has a ? that needs fixing
  if (!block.includes('?')) {
    result.push('db.query(' + block);
    continue;
  }
  
  // Find SQL string(s) in this block - single or double quoted
  let counter = 1;
  let fixed = '';
  let inSingle = false, inDouble = false, inBacktick = false;
  let j = 0;
  let parenDepth = 0;
  
  while (j < block.length) {
    const c = block[j];
    
    if (c === '\\') {
      fixed += block[j] + (block[j+1] || '');
      j += 2;
      continue;
    }
    
    // Check if we're inside a string
    if (c === "'" && !inDouble && !inBacktick) {
      inSingle = !inSingle;
      fixed += c;
      j++;
      continue;
    }
    if (c === '"' && !inSingle && !inBacktick) {
      inDouble = !inDouble;
      fixed += c;
      j++;
      continue;
    }
    if (c === '`' && !inSingle && !inDouble) {
      inBacktick = !inBacktick;
      fixed += c;
      j++;
      continue;
    }
    
    // Replace ? only when inside a quoted string (SQL)
    if (c === '?' && (inSingle || inDouble || inBacktick)) {
      fixed += '$' + counter;
      counter++;
    } else {
      fixed += c;
    }
    
    // Track parentheses outside strings
    if (!inSingle && !inDouble && !inBacktick) {
      if (c === '(') parenDepth++;
      if (c === ')') parenDepth--;
    }
    
    j++;
  }
  
  result.push('db.query(' + fixed);
}

text = result.join('');

// 6. Fix destructured variables: const [VAR] = await db.query(
text = text.replace(/const\s+\[(\w+)\]\s*=\s*await\s+db\.query\(/g, (match, name) => {
  return `const ${name} = await db.query(`;
});

// 7. Fix references for known destructured vars
const destructurePattern = /const\s+(\w+)\s*=\s*await\s+db\.query\(/g;
let m;
while ((m = destructurePattern.exec(text)) !== null) {
  const name = m[1];
  // Don't replace inside string literals
  const reIdx = new RegExp(`(?<![.])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[(\\d+)\\]`, 'g');
  text = text.replace(reIdx, `${name}.rows[$1]`);
  const reLen = new RegExp(`(?<![.])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.length`, 'g');
  text = text.replace(reLen, `${name}.rows.length`);
}

// 8. insertId -> rows[0].id
text = text.replace(/\.insertId\b/g, '.rows[0].id');

// 9. Add RETURNING id for INSERT without it
text = text.replace(
  /'(INSERT\s+INTO\s+(?:(?!'|RETURNING).)*?)'(?=\s*,?\s*\)?\s*;?)/gis,
  (match, insertSql) => {
    if (match.includes('RETURNING')) return match;
    return match.slice(0, -1) + ' RETURNING id\'';
  }
);

// 10. Add DB_USER/DB_PASSWORD validation
text = text.replace(
  "const db = new Pool({",
  "if (!process.env.DB_USER || !process.env.DB_PASSWORD) {\n  console.error('HATA: DB_USER ve DB_PASSWORD environment variable zorunludur');\n  process.exit(1);\n}\n\nconst db = new Pool({"
);

// 11. Add admin auth and rate limiting
const authBlock = `
// Admin Auth
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const adminTokens = new Set();

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !adminTokens.has(token)) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
  next();
};

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin şifresi yapılandırılmamış' });
  }
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Hatalı şifre' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  adminTokens.add(token);
  setTimeout(() => adminTokens.delete(token), 24 * 60 * 60 * 1000);
  res.json({ token, message: 'Giriş başarılı' });
});

app.post('/api/admin/logout', adminAuth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  adminTokens.delete(token);
  res.json({ message: 'Çıkış başarılı' });
});

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;
const viewRateLimit = new Map();

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
});
`;

// Insert admin auth after the port definition, before multer config
text = text.replace(
  "const upload = multer({ storage: storage });\n",
  `${authBlock}\nconst upload = multer({ storage: storage });\n`
);

// 12. Make PORT env-aware
text = text.replace("const PORT = 3003;", "const PORT = process.env.PORT || 3003;");

// 13. Make CORS dynamic
text = text.replace(
  "app.use(cors({\n  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],",
  "const allowedOrigins = process.env.CORS_ORIGINS\n  ? process.env.CORS_ORIGINS.split(',')\n  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];\n\napp.use(cors({\n  origin: allowedOrigins,"
);

// 14. Fix rows.rows double access if any
text = text.replace(/\.rows\.rows\[/g, '.rows[');

// 15. Add adminAuth to write endpoints
const protectedEndpoints = [
  "app.post('/api/services'",
  "app.put('/api/services/:id'",
  "app.delete('/api/services/:id'",
  "app.post('/api/products'",
  "app.put('/api/products/:id'",
  "app.delete('/api/products/:id'",
  "app.post('/api/blog-posts'",
  "app.put('/api/blog-posts/:id'",
  "app.delete('/api/blog-posts/:id'",
  "app.put('/api/about'",
  "app.delete('/api/about/image'",
  "app.put('/api/contact'",
  "app.put('/api/contact/messages/:id/read'",
  "app.delete('/api/contact/messages/:id'",
  "app.post('/api/hero'",
  "app.put('/api/hero/:id'",
  "app.delete('/api/hero/:id'",
  "app.put('/api/hero/order'",
  "app.post('/api/hazelnut-prices'",
  "app.put('/api/hazelnut-prices'",
  "app.post('/api/hazelnut-prices/scrape'",
  "app.post('/api/hazelnut-prices/apply-scraped'",
  "app.put('/api/seo/settings'",
  "app.post('/api/seo/pages'",
  "app.put('/api/seo/pages/:id'",
  "app.delete('/api/seo/pages/:id'",
];

for (const ep of protectedEndpoints) {
  const oldStr = `${ep}, async (req, res)`;
  const newStr = `${ep}, adminAuth, async (req, res)`;
  if (text.includes(oldStr)) {
    text = text.replaceAll(oldStr, newStr);
  }
}

// Also handle upload middleware variants
text = text.replace(
  "app.post('/api/blog-posts', upload.single('image'), async",
  "app.post('/api/blog-posts', adminAuth, upload.single('image'), async"
);
text = text.replace(
  "app.put('/api/blog-posts/:id', upload.single('image'), async",
  "app.put('/api/blog-posts/:id', adminAuth, upload.single('image'), async"
);
text = text.replace(
  "app.post('/api/products', upload.array('images', 10), async",
  "app.post('/api/products', adminAuth, upload.array('images', 10), async"
);
text = text.replace(
  "app.put('/api/products/:id', upload.array('images', 10), async",
  "app.put('/api/products/:id', adminAuth, upload.array('images', 10), async"
);
text = text.replace(
  "app.put('/api/about', upload.array('images', 10), async",
  "app.put('/api/about', adminAuth, upload.array('images', 10), async"
);
text = text.replace(
  "app.post('/api/hero', upload.single('background_image'), async",
  "app.post('/api/hero', adminAuth, upload.single('background_image'), async"
);
text = text.replace(
  "app.put('/api/hero/:id', upload.single('background_image'), async",
  "app.put('/api/hero/:id', adminAuth, upload.single('background_image'), async"
);

// 16. Blog view count rate limit
text = text.replace(
  "app.post('/api/blog-posts/:id/view', async (req, res) => {\n  try {\n    const { id } = req.params;\n    await db.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [id]);",
  "app.post('/api/blog-posts/:id/view', async (req, res) => {\n  try {\n    const { id } = req.params;\n    const clientIp = req.ip;\n    const viewKey = `${clientIp}_${id}`;\n    const now = Date.now();\n    const lastView = viewRateLimit.get(viewKey);\n    if (lastView && now - lastView < 60000) {\n      return res.json({ message: 'View already counted' });\n    }\n    viewRateLimit.set(viewKey, now);\n    await db.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [id]);"
);

// 17. Contact message validation
text = text.replace(
  "    if (!name || !email || !message) {\n      return res.status(400).json({ error: 'Ad, email ve mesaj alanları zorunludur' });\n    }\n\n    const [result] = await db.query(",
  "    if (!name || !email || !message) {\n      return res.status(400).json({ error: 'Ad, email ve mesaj alanları zorunludur' });\n    }\n\n    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n    if (!emailRegex.test(email)) {\n      return res.status(400).json({ error: 'Geçerli bir email adresi giriniz' });\n    }\n\n    const sanitizedName = name.replace(/<[^>]*>/g, '');\n    const sanitizedMessage = message.replace(/<[^>]*>/g, '');\n\n    const [result] = await db.query("
);

// Also fix the INSERT values to use sanitized
text = text.replace(
  "[name, email, phone === undefined ? null : phone, subject === undefined ? null : subject, message]",
  "[sanitizedName, email, phone === undefined ? null : phone, subject === undefined ? null : subject, sanitizedMessage]"
);

// 18. Remove duplicate hazelnut-prices route
// Find the first occurrence
const hazelRoute = "app.get('/api/hazelnut-prices', async (req, res) => {";
const firstIdx = text.indexOf(hazelRoute);
const secondIdx = text.indexOf(hazelRoute, firstIdx + 1);

if (secondIdx !== -1) {
  // Find the end of the first route (from firstIdx to just before second one)
  // Find the closing of the first route
  const beforeSecond = text.substring(0, secondIdx);
  const lastRouteEnd = beforeSecond.lastIndexOf("});\n\n// HAZELNUT PRICES API");
  if (lastRouteEnd !== -1) {
    text = text.substring(0, firstIdx - 4) + text.substring(secondIdx);
  }
}

// Write result
writeFileSync(filepath, text, 'utf-8');
console.log('Done. Remaining ? in text:', (text.match(/\?/g) || []).length);
console.log('db.query calls:', (text.match(/db\.query\(/g) || []).length);
console.log('RETURNING id:', (text.match(/RETURNING id/g) || []).length);
