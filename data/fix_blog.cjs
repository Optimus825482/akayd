const fs = require('fs');
const path = require('path');

const filePath = 'D:/repos/akayd-n-tar-m/server/index.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix blog PUT endpoint: add summary derivation and use it in params
content = content.replace(
  /(\s+if \(req\.file\) \{\s+imageUrl = `\/uploads\/\$\{req\.file\.filename\}`;\s+\})\s+(await db\.query\(\s+'UPDATE blog_posts SET title = \$1, summary = \$2, content = \$3, excerpt = \$4, author = \$5, image_url = \$6, seo_title = \$7, seo_description = \$8, seo_keywords = \$9, updated_at = NOW\(\) WHERE id = \$10',\s+)\[title, (excerpt \|\| ''), content \|\| '', (excerpt \|\| ''), author/,
  '$1\n    \n    // summary: content\'in HTML etiketlerinden arındırılmış ilk 200 karakterlik özeti\n    const summary = (content || excerpt || \'\').replace(/<[^>]*>/g, \'\').substring(0, 200);\n    \n$2[title, summary, content || \'\', excerpt || null, author'
);

// 2. Also fix the response summary references in blog PUT
content = content.replace(
  /(UPDATE blog_posts SET title.*?WHERE id = \$10',\s+)\[title, excerpt \|\| '', content \|\| '', excerpt \|\| '', author/,
  '$1[title, summary, content || \'\', excerpt || null, author'
);

fs.writeFileSync(filePath, content);
console.log('Blog PUT summary fix applied');
