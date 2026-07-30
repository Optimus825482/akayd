const fs = require('fs');
let c = fs.readFileSync('server/index.js', 'utf8');

// Fix POST response JSON
c = c.replace(
  '      seo_title: seo_title || null,\n      seo_description: seo_description || null,\n      seo_keywords: seo_keywords || null,\n      created_at: new Date()\n    });\n  } catch (error) {\n    console.error(error);\n    res.status(500).json({ error: \'Blog yazısı eklenirken hata oluştu\' });',
  '      seo_title: finalSeoTitle || null,\n      seo_description: finalSeoDescription || null,\n      seo_keywords: finalSeoKeywords || null,\n      created_at: new Date()\n    });\n  } catch (error) {\n    console.error(error);\n    res.status(500).json({ error: \'Blog yazısı eklenirken hata oluştu\' });'
);

// Fix PUT endpoint: add SEO auto-fill + update params and response
c = c.replace(
  '    // summary: content\'in HTML etiketlerinden arındırılmış ilk 200 karakterlik özeti\n    const summary = (content || excerpt || \'\').replace(/<[^>]*>/g, \'\').substring(0, 200);\n\nawait db.query(\n      \'UPDATE blog_posts SET title = $1, summary = $2, content = $3, excerpt = $4, author = $5, image_url = $6, seo_title = $7, seo_description = $8, seo_keywords = $9, updated_at = NOW() WHERE id = $10\',\n      [title, summary, content || \'\', excerpt || null, author || \'Akaydın Tarım\', imageUrl, seo_title || null, seo_description || null, seo_keywords || null, id]',
  '    // summary: content\'in HTML etiketlerinden arındırılmış ilk 200 karakterlik özeti\n    const summary = (content || excerpt || \'\').replace(/<[^>]*>/g, \'\').substring(0, 200);\n\n    // -- SEO otomatik doldurma --\n    var stripHtml2 = function(html) { return (html || \'\').replace(/<[^>]*>/g, \'\').replace(/\\s+/g, \' \').trim(); };\n    var fSeoTitle = seo_title || stripHtml2(title);\n    var fSeoDesc = seo_description || summary.substring(0, 160);\n    var fSeoKeys = seo_keywords;\n    if (!seo_keywords && title) {\n      var stops2 = [\'ve\',\'veya\',\'ile\',\'i\u00e7in\',\'bir\',\'bu\',\'da\',\'de\',\'ki\',\'ise\',\'ama\',\'fakat\',\'\u00e7ok\',\'daha\',\'olarak\',\'gibi\',\'kadar\',\'sonra\',\'\u00f6nce\',\'her\',\'\u015fu\',\'o\',\'ne\',\'nas\u0131l\',\'nerede\',\'hangi\',\'kim\',\'neden\'];\n      fSeoKeys = title.toLowerCase().split(/[\\s,.;:!?()]+/).filter(function(w) { return w.length > 2 && stops2.indexOf(w) === -1; }).slice(0, 5).join(\', \');\n    }\n\nawait db.query(\n      \'UPDATE blog_posts SET title = $1, summary = $2, content = $3, excerpt = $4, author = $5, image_url = $6, seo_title = $7, seo_description = $8, seo_keywords = $9, updated_at = NOW() WHERE id = $10\',\n      [title, summary, content || \'\', excerpt || null, author || \'Akaydın Tarım\', imageUrl, fSeoTitle || null, fSeoDesc || null, fSeoKeys || null, id]'
);

// Fix PUT response JSON
c = c.replace(
  '      seo_title: seo_title || null,\n      seo_description: seo_description || null,\n      seo_keywords: seo_keywords || null\n    });\n  } catch (error) {\n    console.error(error);\n    res.status(500).json({ error: \'Blog yazısı güncellenirken hata oluştu\' });',
  '      seo_title: fSeoTitle || null,\n      seo_description: fSeoDesc || null,\n      seo_keywords: fSeoKeys || null\n    });\n  } catch (error) {\n    console.error(error);\n    res.status(500).json({ error: \'Blog yazısı güncellenirken hata oluştu\' });'
);

fs.writeFileSync('server/index.js', c, 'utf8');

// Verify
c = fs.readFileSync('server/index.js', 'utf8');
console.log('POST final vars:', c.includes('finalSeoTitle') && c.includes('finalSeoDescription') && c.includes('finalSeoKeywords'));
console.log('PUT f vars:', c.includes('fSeoTitle') && c.includes('fSeoDesc') && c.includes('fSeoKeys'));
console.log('POST resp fixed:', c.includes('seo_title: finalSeoTitle'));
console.log('PUT resp fixed:', c.includes('seo_title: fSeoTitle'));
console.log('OK');
