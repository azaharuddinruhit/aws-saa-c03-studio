// Combines the four question banks into one file, numbered 1 to N in bank order (alpha, beta,
// gamma, delta). Every field is kept; only `id` is renumbered, and the source bank isn't recorded.
// The output sits at the repo root, outside docs/, so it isn't deployed or read by check-tags.js.
// Usage: node scripts/combine-banks.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SETS = path.join(ROOT, 'docs', 'sets');
const BANKS = ['alpha', 'beta', 'gamma', 'delta'];
const OUTPUT = path.join(ROOT, 'all-questions.json');

const combined = [];
for (const bank of BANKS) {
  const questions = JSON.parse(fs.readFileSync(path.join(SETS, bank + '.json'), 'utf8'));
  for (const q of questions) combined.push({ ...q, id: combined.length + 1 });
}

// Same formatting as the banks: two-space indent, CRLF line endings.
fs.writeFileSync(OUTPUT, JSON.stringify(combined, null, 2).replace(/\n/g, '\r\n') + '\r\n');
console.log('Wrote ' + combined.length + ' questions to ' + path.relative(ROOT, OUTPUT));
