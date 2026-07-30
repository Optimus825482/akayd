import fs from 'fs';

const f = 'D:/repos/akayd-n-tar-m/server/index.js';
let c = fs.readFileSync(f, 'utf8');

// Replace adminAuth with JWT version
c = c.replace(
  /const adminAuth = \(req, res, next\) => \{\s+const token = req\.headers\.authorization\?\.replace\('Bearer ', ''\);\s+if \(!token \|\| !false\) \{\s+return res\.status\(401\)\.json\(\{ error: 'Yetkisiz erişim' \}\);\s+\}\s+next\(\);\s+\};/,
  `const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
};`
);

// Replace login endpoint to use JWT
c = c.replace(
  /const token = crypto\.randomBytes\(32\)\.toString\('hex'\);\s+adminTokens\.add\(token\);\s+setTimeout\(\(\) => adminTokens\.delete\(token\), 24 \* 60 \* 60 \* 1000\);\s+res\.json\(\{ token, message: 'Giriş başarılı' \}\);/,
  `const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, message: 'Giriş başarılı' });`
);

// Replace logout endpoint  
c = c.replace(
  /adminTokens\.delete\(req\.headers\.authorization\?\.replace\('Bearer ', ''\)\);\s+res\.json\(\{ message: 'Çıkış başarılı' \}\);/,
  `// JWT stateless — client token'ı siler
  res.json({ message: 'Çıkış başarılı' });`
);

// Replace page SEO manual token check with adminAuth
c = c.replace(
  /\/\/ Admin-only: tüm sayfa SEO listesi \(token kontrolü\)\s+const token = req\.headers\.authorization\?\.replace\('Bearer ', ''\);\s+if \(!token \|\| !adminTokens\.has\(token\)\) \{\s+return res\.status\(401\)\.json\(\{ error: 'Yetkisiz erişim' \}\);\s+\}/,
  `// Admin-only: tüm sayfa SEO listesi (adminAuth kontrolü)
      try {
        jwt.verify(req.headers.authorization?.replace('Bearer ', ''), JWT_SECRET);
      } catch {
        return res.status(401).json({ error: 'Yetkisiz erişim' });
      }`
);

fs.writeFileSync(f, c);
console.log('JWT migration complete');
