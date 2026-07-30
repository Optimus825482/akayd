const fs = require('fs');
const c = fs.readFileSync('server/index.js','utf8');
if (c.length < 100) {
  // File is corrupted/empty, restore from git object
  const { execSync } = require('child_process');
  const original = execSync('git --no-pager show HEAD:server/index.js', { encoding: 'utf8', maxBuffer: 500*1024 });
  fs.writeFileSync('server/index.js', original, 'utf8');
  console.log('Restored', original.length, 'bytes');
} else {
  console.log('File OK:', c.length, 'bytes');
}
