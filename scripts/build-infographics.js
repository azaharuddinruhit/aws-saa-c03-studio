// Builds the infographic pages, docs/cheatsheet/infographic-<key>.html, one per module in
// scripts/infographics/<key>.js. Each page is generated whole: edit the module, then run
//   node scripts/build-infographics.js
// Rebuild after changing questions or tags too, since the pages quote counts and one question from the banks.
// The list and order of pages live in INFOGRAPHICS in docs/cheatsheet/app.js, which builds the menu and the hub;
// this script fails if that list and the modules disagree. Styles are in docs/cheatsheet/infographics.css.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHEETS = path.join(ROOT, 'docs', 'cheatsheet');
const MODULES = path.join(__dirname, 'infographics');

// ---- the banks, for counts and the worked example ----
const BANKS = ['alpha', 'beta', 'gamma', 'delta'];
const bank = Object.fromEntries(BANKS.map(b => [b, JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'sets', b + '.json'), 'utf8'))]));
const questions = BANKS.flatMap(b => bank[b]);
// questions tagged with any of these services (a feature tag counts for its service)
const VOCAB = new Set(require('./tag-vocabulary.json').categories.flatMap(c => c.services.map(s => s.name)));
const tagged = services => {
  for (const s of services) if (!VOCAB.has(s)) throw new Error('not a vocabulary service: "' + s + '"');
  return questions.filter(q => (q.services || []).some(t => services.includes(t.split(' › ')[0]))).length;
};

// the vocabulary's tags, "Service" or "Service › Feature", for the practice links
const TAGS = new Set(require('./tag-vocabulary.json').categories.flatMap(c => c.services.flatMap(s => [s.name, ...(s.features || []).map(f => s.name + ' › ' + f)])));
const tagsOf = q => new Set((q.services || []).flatMap(t => [t, t.split(' › ')[0]]));
// the banks' labels and symbols, read from the quiz app as build-mindmap.js does
const indexHtml = fs.readFileSync(path.join(ROOT, 'docs', 'index.html'), 'utf8');
const BANK_INFO = Object.fromEntries([...indexHtml.matchAll(/(\w+): \{ label: '([^']+)', symbol: '([^']+)'/g)].map(([, key, label, symbol]) => [key, { label, symbol }]));
for (const b of BANKS) if (!BANK_INFO[b]) throw new Error('bank ' + b + ' not found in the BANKS table of docs/index.html');
// a service's icon, from the mind map's cues
const CUES = require('./mindmap-cues.json').services;

// ---- the icon keys the pages may use ----
global.window = {};
require(path.join(SHEETS, 'icons.js'));
const ICON_KEYS = new Set(Object.keys(window.AWS_ICONS));
const used = new Set();
const ico = key => { if (!ICON_KEYS.has(key)) throw new Error('unknown icon "' + key + '"'); used.add(key); return key; };

// ---- helpers for the modules ----
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// SVG text: cls is a space-separated list of drawing classes without their s- prefix (nt, lbl, cap, halo…)
const T = (x, y, s, cls = '', anchor = 'start') =>
  `<text x="${x}" y="${y}"${cls ? ` class="${cls.split(' ').map(c => 's-' + c).join(' ')}"` : ''}${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${s}</text>`;
// an AWS icon centred on (cx, cy); the page fills in its href from icons.js
const I = (key, cx, cy, s = 40) => `<image data-ico="${ico(key)}" x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}"/>`;
// an edge: kind is in, out, data, alt or bad; pts is an SVG points list
const L = (kind, pts, both = false) => `<polyline class="s-e-${kind}" points="${pts}" marker-end="url(#m-${kind})"${both ? ` marker-start="url(#m-${kind})"` : ''}/>`;
const DEFS = `<defs>${['in', 'out', 'data', 'alt', 'bad'].map(k =>
  `<marker id="m-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="s-h-${k}" d="M0 0L10 5L0 10z"/></marker>`).join('')}</defs>`;
const svg = (cls, w, h, label, body) => `<svg class="ig-fig ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${DEFS}${body}</svg>`;
const img = key => `<img class="ig-ico" data-ico="${ico(key)}" alt="">`;
const LEGEND = items => `<div class="ig-legend">${items.map(([kind, label]) => {
  const st = { in: 'stroke="var(--accent)" stroke-width="2"', out: 'stroke="var(--aws)" stroke-width="2" stroke-dasharray="6 4"',
    data: 'stroke="var(--ink)" stroke-width="1.6"', alt: 'stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="3 3"',
    bad: 'stroke="var(--bad)" stroke-width="1.8"' }[kind];
  return `<span><svg viewBox="0 0 30 10" aria-hidden="true"><line x1="1" y1="5" x2="29" y2="5" ${st}/></svg>${label}</span>`;
}).join('')}</div>`;
const traps = list => `<div class="ig-traps">${list.map(([t, f]) =>
  `<div class="ig-trap"><p class="ig-trap-t">${esc(t)}</p><p class="ig-trap-f ig-hide">${esc(f)}</p></div>`).join('')}</div>`;
const section = (title, inner, sub = '') => `
  <section class="ig-sec">
    <h2>${title}</h2>${sub ? `\n    <p class="ig-sub">${sub}</p>` : ''}
    ${inner}
  </section>`;
const panel = (inner, scroll = true) => `<div class="ig-panel">${scroll ? `<div class="ig-scroll">${inner}</div>` : inner}</div>`;
const h = { questions, bank, tagged, esc, T, I, L, svg, img, LEGEND, traps, section, panel };

// "Practise this page": one row per tag, with a link per bank that has questions for it. The Studio
// opens index.html#/practice/<bank>/<tag> as a quiz of those questions, as it does for the mind map.
function practice(key, list) {
  const rows = list.map(tag => {
    if (!TAGS.has(tag)) throw new Error(key + ': practice tag "' + tag + '" is not in the vocabulary');
    const svc = tag.split(' › ')[0], cue = CUES[svc];
    const per = BANKS.map(b => [b, bank[b].filter(q => tagsOf(q).has(tag)).length]).filter(([, n]) => n);
    if (!per.length) throw new Error(key + ': no questions are tagged "' + tag + '"');
    const total = per.reduce((a, [, n]) => a + n, 0);
    return `
      <div class="ig-prac">${cue && cue.icon ? img(cue.icon) : ''}<div class="ig-prac-name"><b>${esc(tag)}</b><span>${total} question${total === 1 ? '' : 's'}</span></div>
        <div class="ig-prac-sets">${per.map(([b, n]) => `<a href="../index.html#/practice/${b}/${encodeURIComponent(tag)}" target="_blank" rel="noopener" title="Opens a quiz in ${BANK_INFO[b].label} in a new tab"><b>${BANK_INFO[b].symbol}</b>${n}</a>`).join('')}</div>
      </div>`;
  }).join('');
  return section('Practise this page', `<div class="ig-pracs">${rows}
    </div>`, 'Each link opens a quiz of those questions in a new tab, one set at a time: unseen and missed questions first.');
}

// ---- the page list in app.js ----
const appJs = fs.readFileSync(path.join(SHEETS, 'app.js'), 'utf8');
const listSrc = /const INFOGRAPHICS = \[([\s\S]*?)\n\];/.exec(appJs);
if (!listSrc) throw new Error('INFOGRAPHICS not found in app.js');
const listed = [...listSrc[1].matchAll(/\['infographic-([a-z0-9-]+)'/g)].map(m => m[1]);
const modules = fs.readdirSync(MODULES).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3));
const missing = listed.filter(k => !modules.includes(k)), extra = modules.filter(k => !listed.includes(k));
if (missing.length || extra.length) throw new Error(`app.js INFOGRAPHICS and scripts/infographics/ disagree: ${[...missing.map(k => 'no module for ' + k), ...extra.map(k => k + ' is not in app.js')].join(', ')}`);

// ---- the page shell ----
const hub = fs.readFileSync(path.join(SHEETS, 'index.html'), 'utf8');
const favicon = /<link rel="icon"[^>]*>/.exec(hub)[0];
const BACK = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const MENU = '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

// The quiz switch: hides every .ig-hide answer until it is tapped. The choice is a view preference,
// kept per browser in saa_infographic_quiz and not synced.
const QUIZ = `(function(){
  var KEY = 'saa_infographic_quiz', btn = document.getElementById('igQuiz'), all = document.getElementById('igReveal'),
    note = document.getElementById('igQuizNote'), hides = document.querySelectorAll('.ig-hide');
  function set(on, save){
    document.body.classList.toggle('ig-quiz', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    all.hidden = !on;
    note.textContent = on ? 'Answers are hidden. Tap one to reveal it.' : 'Hide the answers, then tap each one to check yourself.';
    hides.forEach(function(el){ el.classList.remove('ig-shown');
      if (on) { el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Hidden answer. Reveal it.'); }
      else { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); } });
    if (save) try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
  }
  function reveal(el){ if (!document.body.classList.contains('ig-quiz')) return;
    el.classList.add('ig-shown'); el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); }
  btn.addEventListener('click', function(){ set(!document.body.classList.contains('ig-quiz'), true); });
  all.addEventListener('click', function(){ hides.forEach(reveal); });
  hides.forEach(function(el){
    el.addEventListener('click', function(e){ if (!el.classList.contains('ig-shown') && document.body.classList.contains('ig-quiz')) { e.preventDefault(); e.stopPropagation(); reveal(el); } }, true);
    el.addEventListener('keydown', function(e){ if ((e.key === 'Enter' || e.key === ' ') && el.getAttribute('role') === 'button') { e.preventDefault(); reveal(el); } });
  });
  var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  set(saved === '1', false);
})();
`;

function shell(key, p) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(p.title)} · AWS SAA-C03</title>
${favicon}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap">
<link rel="stylesheet" href="app.css">
<link rel="stylesheet" href="infographics.css">
</head>
<body>
<!-- Generated by scripts/build-infographics.js from scripts/infographics/${key}.js. Edit that module, then rebuild. -->
<header class="topbar nosub">
  <div class="topbar-in">
    <span class="brand"><a class="back-link" href="index.html" aria-label="Back to the cheat sheets" title="Back to the cheat sheets">${BACK}</a><span class="brand-mark">C03</span><span class="brand-name">${esc(p.title)}</span></span>
    <span style="margin-left:auto"></span>
    <button type="button" class="theme-btn menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="menuPanel" title="Menu">${MENU}</button>
  </div>
</header>

<main class="wrap ig">
  <header>
    <div class="eyebrow">${p.eyebrow}</div>
    <h1>${esc(p.title)}</h1>
    <p class="ig-lede">${p.lede}</p>
  </header>
  <p class="ig-rule">${p.rule}</p>
  <div class="ig-tools">
    <button type="button" class="ig-quizbtn" id="igQuiz" aria-pressed="false"><span class="ig-switch" aria-hidden="true"></span>Quiz me</button>
    <span class="ig-tools-note" id="igQuizNote">Hide the answers, then tap each one to check yourself.</span>
    <button type="button" class="ig-linkbtn" id="igReveal" hidden>Show all</button>
  </div>
${p.body}${p.practice ? practice(key, p.practice) : ''}
  <section class="ig-sec">
    <h2>More infographics</h2>
    <nav class="ig-more" id="igMore" aria-label="More infographics"></nav>
  </section>
  <p class="ig-foot">${p.foot}</p>
</main>

<script src="icons.js"></script>
<script src="app.js"></script>
<script>
document.querySelectorAll('[data-ico]').forEach(el => el.setAttribute(el.tagName === 'IMG' ? 'src' : 'href', App.iconURL(el.dataset.ico)));
document.getElementById('igMore').innerHTML = App.INFOGRAPHICS.filter(([file]) => file !== 'infographic-${key}')
  .map(([file, name, icon]) => '<a href="' + file + '.html">' + App.img(icon, '', '') + '<span>' + name + '</span></a>').join('');
${QUIZ}${p.script || ''}</script>
</body>
</html>
`;
}

for (const key of listed) {
  const p = require(path.join(MODULES, key + '.js'))(h);
  for (const f of ['title', 'eyebrow', 'lede', 'rule', 'body', 'foot']) if (!p[f]) throw new Error(key + ': no ' + f);
  const file = path.join(SHEETS, 'infographic-' + key + '.html');
  fs.writeFileSync(file, shell(key, p));
  console.log('wrote', path.relative(ROOT, file));
}
console.log(`${listed.length} infographics, ${used.size} icons`);
