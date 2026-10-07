const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, 'dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs');
for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (/^(?:https?:|data:)/.test(url)) continue;
  if (url.startsWith('#')) {
    assert.ok(url === '#' || ids.includes(url.slice(1)), `Missing anchor: ${url}`);
  } else {
    assert.ok(fs.existsSync(path.join(root, url)), `Missing asset: ${url}`);
  }
}
for (const file of ['editorial.css', 'forms.css']) {
  const css = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, `Unbalanced CSS: ${file}`);
}
assert.ok(fs.readFileSync(path.join(root, 'assets/ukazka-pohadky.pdf')).subarray(0,5).toString() === '%PDF-');
console.log('All local assets, section links, CSS blocks and sample PDF checked.');
