const fs = require('fs');
const f = 'components/admin/BlogManagement.tsx';
let c = fs.readFileSync(f, 'utf8');

// The file has CRLF - we need to match the exact indentation (8 spaces)
const old = '        e.preventDefault();\r\n        setLoading(true);\r\n        try {';

const newBlock = '        e.preventDefault();\r\n\r\n'
    + '        // -- SEO alanlari bossa oneri toast\'i goster --\r\n'
    + '        var missingSeo = [];\r\n'
    + '        if (!blogForm.seo_title.trim()) missingSeo.push("SEO Basligi");\r\n'
    + '        if (!blogForm.seo_description.trim()) missingSeo.push("SEO Aciklamasi");\r\n'
    + '        if (!blogForm.seo_keywords.trim()) missingSeo.push("SEO Anahtar Kelimeleri");\r\n'
    + '        if (missingSeo.length > 0) {\r\n'
    + '            addNotification("warning", "SEO Onerisi", missingSeo.join(", ") + " alanlari bos. Sunucu otomatik dolduracak, ancak manuel girmeniz onerilir.");\r\n'
    + '        }\r\n\r\n'
    + '        setLoading(true);\r\n        try {';

const before = c.substring(0, c.indexOf(old));
const after = c.substring(c.indexOf(old) + old.length);
c = before + newBlock + after;

fs.writeFileSync(f, c, 'utf8');
console.log('OK');
