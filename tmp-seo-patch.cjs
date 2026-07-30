const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'index.js');
let c = fs.readFileSync(filePath, 'utf8');

// POST: Insert SEO auto-fill block after the summary line
c = c.replace(
  '    const summary = (content || excerpt || \'\').replace(/<[^>]*>/g, \'\').substring(0, 200);\n\n'
  + '    const result = await db.query(\n'
  + '      \'INSERT INTO blog_posts',
  function(match) {
    return '    const summary = (content || excerpt || \'\').replace(/<[^>]*>/g, \'\').substring(0, 200);\n\n'
      + '    // -- SEO otomatik doldurma --\n'
      + '    var stripHtml = function(html) { return (html || \'\').replace(/<[^>]*>/g, \'\').replace(/\\s+/g, \' \').trim(); };\n'
      + '    var finalSeoTitle = seo_title || stripHtml(title);\n'
      + '    var finalSeoDescription = seo_description || summary.substring(0, 160);\n'
      + '    var finalSeoKeywords = seo_keywords;\n'
      + '    if (!seo_keywords && title) {\n'
      + '      var stops = [\'ve\',\'veya\',\'ile\',\'i\u00e7in\',\'bir\',\'bu\',\'da\',\'de\',\'ki\',\'ise\',\'ama\',\'fakat\',\'\\u00e7ok\',\'daha\',\'olarak\',\'gibi\',\'kadar\',\'sonra\',\'\\u00f6nce\',\'her\',\'\\u015fu\',\'o\',\'ne\',\'nas\\u0131l\',\'nerede\',\'hangi\',\'kim\',\'neden\'];\n'
      + '      finalSeoKeywords = title.toLowerCase().split(/[\\s,.;:!?()]+/).filter(function(w) { return w.length > 2 && stops.indexOf(w) === -1; }).slice(0, 5).join(\', \');\n'
      + '    }\n\n'
      + '    const result = await db.query(\n'
      + '      \'INSERT INTO blog_posts';
  }
);

// POST: Replace seo_title/seo_description/seo_keywords with final values in db.query params
c = c.replace(
  'imageUrl, seo_title || null, seo_description || null, seo_keywords || null]',
  'imageUrl, finalSeoTitle || null, finalSeoDescription || null, finalSeoKeywords || null]'
);

// POST: Replace in response JSON
c = c.replace(
  '      seo_title: seo_title || null,\n      seo_description: seo_description || null,\n      seo_keywords: seo_keywords || null,\n      created_at: new Date()',
  '      seo_title: finalSeoTitle || null,\n      seo_description: finalSeoDescription || null,\n      seo_keywords: finalSeoKeywords || null,\n      created_at: new Date()'
);

// PUT: Insert SEO auto-fill block
c = c.replace(
  '    const summary = (content || excerpt || \'\').replace(/<[^>]*>/g, \'\').substring(0, 200);\n\nawait db.query(',
  '    const summary = (content || excerpt || \'\').replace(/<[^>]*>/g, \'\').substring(0, 200);\n\n'
  + '    // -- SEO otomatik doldurma --\n'
  + '    var stripHtml2 = function(html) { return (html || \'\').replace(/<[^>]*>/g, \'\').replace(/\\s+/g, \' \').trim(); };\n'
  + '    var fSeoTitle = seo_title || stripHtml2(title);\n'
  + '    var fSeoDesc = seo_description || summary.substring(0, 160);\n'
  + '    var fSeoKeys = seo_keywords;\n'
  + '    if (!seo_keywords && title) {\n'
  + '      var stops2 = [\'ve\',\'veya\',\'ile\',\'i\u00e7in\',\'bir\',\'bu\',\'da\',\'de\',\'ki\',\'ise\',\'ama\',\'fakat\',\'\\u00e7ok\',\'daha\',\'olarak\',\'gibi\',\'kadar\',\'sonra\',\'\\u00f6nce\',\'her\',\'\\u015fu\',\'o\',\'ne\',\'nas\\u0131l\',\'nerede\',\'hangi\',\'kim\',\'neden\'];\n'
  + '      fSeoKeys = title.toLowerCase().split(/[\\s,.;:!?()]+/).filter(function(w) { return w.length > 2 && stops2.indexOf(w) === -1; }).slice(0, 5).join(\', \');\n'
  + '    }\n\nawait db.query('
);

// PUT: Replace in db.query params
// Need to find the unique PUT db.query line
c = c.replace(
  'imageUrl, seo_title || null, seo_description || null, seo_keywords || null, id]',
  function(m) {
    // Only replace the second occurrence (PUT)
    const parts = c.split(m);
    if (parts.length >= 2) {
      // This replaces the LAST one (which should be the PUT after the POST was fixed)
      return parts.slice(0, -1).join(m + 'FOUND_FIRST') + m;
    }
    return m;
  }
);

// PUT: Replace in response JSON
c = c.replace(
  '      seo_title: seo_title || null,\n      seo_description: seo_description || null,\n      seo_keywords: seo_keywords || null\n    });',
  '      seo_title: fSeoTitle || null,\n      seo_description: fSeoDesc || null,\n      seo_keywords: fSeoKeys || null\n    });'
);

fs.writeFileSync(filePath, c, 'utf8');
// Clean up: remove FOUND_FIRST markers
c = fs.readFileSync(filePath, 'utf8');
c = c.replace('FOUND_FIRST', '');
fs.writeFileSync(filePath, c, 'utf8');
console.log('OK');
