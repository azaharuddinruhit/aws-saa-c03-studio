// Builds docs/glossary.json, which the quiz's Services button reads: the plain definitions in
// scripts/glossary.json, and for every question in each bank the services its text and options name, in
// the order they first appear. Edit the glossary or the questions, then run:
//   node scripts/build-glossary.js
// It fails when a question names an AWS or Amazon service that has no entry, or when two entries claim the
// same name, so a new question can't bring in a service the drawer can't explain.
//   node scripts/build-glossary.js --check   fails instead of writing when docs/glossary.json is out of date
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(DOCS, 'glossary.json');
const glossary = require('./glossary.json');
const CHECK = process.argv.includes('--check');

const problems = [];
const fail = msg => problems.push(msg);

// the banks, read from the quiz app so the list can't drift from it
const indexHtml = fs.readFileSync(path.join(DOCS, 'index.html'), 'utf8');
const BANKS = [...indexHtml.matchAll(/(\w+): \{ label: '[^']+', symbol: '[^']+', slug: '[^']+', file: '([^']+)', prefix: '[^']+' \}/g)]
  .map(([, key, file]) => ({ key, file }));
if (!BANKS.length) throw new Error('could not read the BANKS table from docs/index.html');

// icons.js defines window.AWS_ICONS; the drawer loads the same file, so an entry's icon must be one of its keys
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DOCS, 'cheatsheet', 'icons.js'), 'utf8'), sandbox);
const ICON_KEYS = new Set(Object.keys(sandbox.window.AWS_ICONS));

// ---------------------------------------------------------------- the names to look for
const PREFIXES = ['Amazon ', 'AWS '];
const names = [];   // { text, entry, prefixed }
const owner = new Map();
glossary.services.forEach((s, entry) => {
  if (!s.name || !s.what || !Array.isArray(s.match) || !s.match.length) fail(`entry ${entry} (${s.name}) needs a name, a definition and at least one name to match`);
  if (!('icon' in s)) fail(`${s.name} has no "icon" (an icons.js key, or null for the plain cube)`);
  else if (s.icon !== null && !ICON_KEYS.has(s.icon)) fail(`${s.name}'s icon "${s.icon}" is not in docs/cheatsheet/icons.js`);
  if (s.what && s.what.split(/\s+/).length > 35) console.warn(`warning: ${s.name}'s definition is over 35 words`);
  for (const text of s.match || []) {
    if (owner.has(text)) fail(`"${text}" is claimed by both ${glossary.services[owner.get(text)].name} and ${s.name}`);
    owner.set(text, entry);
    names.push({ text, entry, prefixed: PREFIXES.some(p => text.startsWith(p)) });
  }
});
const isWordChar = ch => ch !== undefined && /[A-Za-z0-9]/.test(ch);

// Every service named in the text, as [start, end, entry], longest name first at each position. A name
// without its own prefix also matches with "Amazon " or "AWS " in front, and the match then covers the prefix.
function findServices(text) {
  const found = [];
  for (let at = 0; at < text.length;) {
    if (isWordChar(text[at - 1])) { at++; continue; }
    const pre = PREFIXES.find(p => text.startsWith(p, at)) || '';
    let best = null;
    for (const n of names) {
      for (const start of n.prefixed || !pre ? [at] : [at, at + pre.length]) {
        if (!text.startsWith(n.text, start) || isWordChar(text[start + n.text.length])) continue;
        const end = start + n.text.length;
        // on a tie, a name written with its prefix ("AWS Auto Scaling") beats one matched behind it ("Auto Scaling")
        if (!best || end > best.end || (end === best.end && start === at && best.start !== at)) best = { start, end, entry: n.entry };
      }
    }
    if (best) { found.push([at, best.end, best.entry]); at = best.end; } else at++;
  }
  return found;
}

// ---------------------------------------------------------------- every question's services
const used = new Set();
const questions = {};
const missing = new Map();   // unmatched phrase -> first place it appears
for (const { key, file } of BANKS) {
  questions[key] = {};
  for (const q of JSON.parse(fs.readFileSync(path.join(DOCS, file), 'utf8'))) {
    const list = [];
    for (const text of [q.question, ...Object.values(q.options)]) {
      const found = findServices(text);
      for (const [, , entry] of found) if (!list.includes(entry)) list.push(entry);
      // an AWS or Amazon name the glossary doesn't cover
      for (const m of text.matchAll(/(?<![A-Za-z0-9])(?:Amazon|AWS) (?=[A-Z0-9])/g)) {
        if (found.some(([start]) => start === m.index)) continue;
        if (glossary.ignore.some(ig => text.startsWith(ig, m.index) && !isWordChar(text[m.index + ig.length]))) continue;
        const phrase = text.slice(m.index).match(/^\S+(?: [A-Z0-9][\w@&-]*)*/)[0];
        if (!missing.has(phrase)) missing.set(phrase, `${key} ${q.id}`);
      }
    }
    list.forEach(e => used.add(e));
    if (list.length) questions[key][q.id] = list;
  }
}
for (const [phrase, where] of missing) fail(`"${phrase}" (${where}) has no glossary entry; add it, or add the phrase to "ignore" if it isn't a service`);
const unused = glossary.services.filter((s, i) => !used.has(i)).map(s => s.name);
if (unused.length) console.warn(`warning: no question names ${unused.join(', ')}`);

if (problems.length) {
  console.error(problems.map(p => '  ' + p).join('\n'));
  console.error(`${problems.length} problem${problems.length === 1 ? '' : 's'}; docs/glossary.json not written`);
  process.exit(1);
}

// ---------------------------------------------------------------- write the file
// one service and one bank per line, so a change shows as a readable diff
const services = glossary.services.map(({ name, icon, full, formerly, what }) => JSON.stringify({ name, icon: icon || undefined, full, formerly, what }));
const banks = Object.entries(questions).map(([key, map]) => JSON.stringify(key) + ':' + JSON.stringify(map));
const json = '{"services":[\n' + services.join(',\n') + '\n],\n"questions":{\n' + banks.join(',\n') + '\n}}\n';
const rel = path.relative(process.cwd(), OUT);
if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
  if (current !== json) { console.error(`${rel} is out of date: run node scripts/build-glossary.js`); process.exit(1); }
  console.log(`${rel} is up to date`);
} else {
  fs.writeFileSync(OUT, json);
  const counted = Object.values(questions).reduce((n, map) => n + Object.keys(map).length, 0);
  console.log(`wrote ${glossary.services.length} services and the service lists of ${counted} questions to ${rel}`);
}
