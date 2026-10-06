// Builds the data behind docs/cheatsheet/mindmap.html: every service in the tag vocabulary with its exam
// cue (scripts/mindmap-cues.json), the exam domain most of its questions belong to, the questions tagged
// with it in each bank, and the architecture diagrams that draw it. The result is one JSON block written
// between the GENERATED markers in the page, so edit the cues or the vocabulary, then run:
//   node scripts/build-mindmap.js
// It fails when a service has no cue, or a cue names a service, icon, cheat-sheet topic or diagram that
// doesn't exist, so the map can't drift from the tags.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const SHEETS = path.join(DOCS, 'cheatsheet');
const PAGE = path.join(SHEETS, 'mindmap.html');
const vocab = require('./tag-vocabulary.json');
const cues = require('./mindmap-cues.json').services;
const SEP = vocab.separator;

const DOMAINS = [
  { n: 1, short: 'Secure', name: 'Design Secure Architectures', weight: 30 },
  { n: 2, short: 'Resilient', name: 'Design Resilient Architectures', weight: 26 },
  { n: 3, short: 'High-performing', name: 'Design High-Performing Architectures', weight: 24 },
  { n: 4, short: 'Cost-optimized', name: 'Design Cost-Optimized Architectures', weight: 20 }
];

const problems = [];
const fail = msg => problems.push(msg);

// the banks, read from the quiz app so their storage prefixes can't drift from it
const indexHtml = fs.readFileSync(path.join(DOCS, 'index.html'), 'utf8');
const BANKS = [...indexHtml.matchAll(/(\w+): \{ label: '([^']+)', symbol: '([^']+)', slug: '[^']+', file: '([^']+)', prefix: '([^']+)' \}/g)]
  .map(([, key, label, symbol, file, prefix]) => ({ key, label, symbol, file, prefix }));
if (!BANKS.length) throw new Error('could not read the BANKS table from docs/index.html');

// icons.js defines window.AWS_ICONS
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(SHEETS, 'icons.js'), 'utf8'), sandbox);
const ICON_KEYS = new Set(Object.keys(sandbox.window.AWS_ICONS));

// each cheat-sheet page's topics, from its learn list: ['id', 'Label', 'icon', minutes]
const sheetTopics = {};
for (const f of fs.readdirSync(SHEETS).filter(f => /^\d\d-.*\.html$/.test(f))) {
  const s = fs.readFileSync(path.join(SHEETS, f), 'utf8');
  sheetTopics[f] = new Map([...s.matchAll(/\['([a-z0-9]+)','([^']*)','[a-z0-9]*',\d+\]/g)].map(m => [m[1], m[2]]));
}
const sheetTitle = f => {
  const s = fs.readFileSync(path.join(SHEETS, f), 'utf8');
  return (/<title>AWS SAA-C03 (.*?) Cheat Sheet<\/title>/.exec(s) || [, f])[1];
};

// the architecture diagrams: number, title and the icons each one draws
const archHtml = fs.readFileSync(path.join(SHEETS, 'architectures.html'), 'utf8');
const DIAGRAMS = [...archHtml.matchAll(/<section class="arch-sec" id="([^"]+)">\s*<h2>(\d+)\. ([^<]+)<\/h2>([\s\S]*?)<\/figure>/g)]
  .map(([, id, n, title, body]) => ({ id, n: +n, title: title.replace(/&amp;/g, '&'), icons: new Set([...body.matchAll(/data-ico="([^"]+)"/g)].map(m => m[1])) }));
if (DIAGRAMS.length < 30) throw new Error('read only ' + DIAGRAMS.length + ' diagrams from architectures.html');
const diagramIds = new Set(DIAGRAMS.map(d => d.id));

// ---------------------------------------------------------------- services, checked against their cues
const services = {};
const order = [];
for (const cat of vocab.categories) {
  for (const sv of cat.services) {
    const cue = cues[sv.name];
    if (!cue) { fail(`no cue for "${sv.name}" in mindmap-cues.json`); continue; }
    if (![1, 2, 3, 4].includes(cue.domain)) fail(`"${sv.name}": domain must be 1 to 4`);
    if (!cue.cue) fail(`"${sv.name}": empty cue`);
    for (const k of [cue.icon, ...(cue.icons || [])].filter(Boolean)) if (!ICON_KEYS.has(k)) fail(`"${sv.name}": no icon "${k}" in icons.js`);
    for (const t of cue.twins || []) if (!cues[t] || t === sv.name) fail(`"${sv.name}": twin "${t}" is not another vocabulary service`);
    for (const d of cue.diagrams || []) if (!diagramIds.has(d)) fail(`"${sv.name}": no diagram "${d}"`);
    let sheet = null;
    if (cue.sheet) {
      const [file, topic] = cue.sheet.split('#');
      const topics = sheetTopics[file];
      if (!topics) fail(`"${sv.name}": no cheat sheet ${file}`);
      else if (!topics.has(topic)) fail(`"${sv.name}": ${file} has no topic "${topic}"`);
      else sheet = { href: cue.sheet, label: `${sheetTitle(file)} · ${topics.get(topic)}` };
    }
    const iconSet = new Set([cue.icon, ...(cue.icons || [])].filter(Boolean));
    const diagrams = DIAGRAMS.filter(d => (cue.diagrams || []).includes(d.id) || [...iconSet].some(k => d.icons.has(k)))
      .map(d => [d.id, d.n, d.title]);
    services[sv.name] = {
      cat: cat.name, icon: cue.icon || null, cue: cue.cue, traps: cue.traps || [], twins: cue.twins || [],
      sheet, diagrams, features: sv.features, fallback: cue.domain, domain: 0, perDomain: [0, 0, 0, 0], q: [], fq: {}
    };
    order.push(sv.name);
  }
}
for (const name of Object.keys(cues)) if (!services[name] && !vocab.categories.some(c => c.services.some(s => s.name === name))) fail(`cue "${name}" is not in tag-vocabulary.json`);

// ---------------------------------------------------------------- questions, indexed by tag
const questions = [];   // [bank index, id, short stem, exam domain]
BANKS.forEach((bank, bi) => {
  const list = JSON.parse(fs.readFileSync(path.join(DOCS, bank.file), 'utf8'));
  for (const q of list) {
    const qi = questions.length;
    const stem = q.question.replace(/\s+/g, ' ').trim();
    questions.push([bi, q.id, stem.length > 150 ? stem.slice(0, 147).replace(/\s+\S*$/, '') + '…' : stem, q.exam_domain]);
    const seen = new Set();
    for (const tag of q.services || []) {
      const [name, feature] = tag.split(SEP);
      const sv = services[name];
      if (!sv) continue;   // check-tags.js reports unknown tags
      if (feature) (sv.fq[feature] = sv.fq[feature] || []).push(qi);
      if (seen.has(name)) continue;
      seen.add(name);
      sv.q.push(qi);
      if (q.exam_domain >= 1 && q.exam_domain <= 4) sv.perDomain[q.exam_domain - 1]++;
    }
  }
});

// a service sits under the domain most of its questions belong to; a tie or no questions uses the cue's domain
for (const name of order) {
  const sv = services[name];
  const top = Math.max(...sv.perDomain);
  const leaders = sv.perDomain.map((c, i) => (c === top ? i + 1 : 0)).filter(Boolean);
  sv.domain = top > 0 && leaders.length === 1 ? leaders[0] : sv.fallback;
  delete sv.fallback;
}

if (problems.length) {
  console.error(problems.map(p => '  ' + p).join('\n'));
  console.error(`build-mindmap: ${problems.length} problem(s), page not written`);
  process.exit(1);
}

// ---------------------------------------------------------------- write the page
const data = {
  domains: DOMAINS,
  categories: vocab.categories.map(c => c.name),
  banks: BANKS.map(({ key, label, symbol, prefix }) => ({ key, label, symbol, prefix })),
  order,
  services,
  questions
};
const json = JSON.stringify(data).replace(/</g, '\\u003c');
let page = fs.readFileSync(PAGE, 'utf8');
const eol = page.includes('\r\n') ? '\r\n' : '\n';
const re = /(<!-- GENERATED:DATA START[^>]*-->)[\s\S]*?(<!-- GENERATED:DATA END -->)/;
if (!re.test(page)) throw new Error('missing GENERATED:DATA markers in ' + PAGE);
page = page.replace(re, (m, a, b) => a + '\n<script type="application/json" id="mmData">' + json + '</script>\n' + b);
page = page.replace(/\r?\n/g, eol);
fs.writeFileSync(PAGE, page);
const placed = DOMAINS.map(d => `${d.short} ${order.filter(n => services[n].domain === d.n).length}`).join(', ');
console.log(`wrote ${order.length} services and ${questions.length} questions to ${path.relative(process.cwd(), PAGE)} (${placed})`);
