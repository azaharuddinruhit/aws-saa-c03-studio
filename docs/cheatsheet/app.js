/* SAA-C03 cheat sheet engine, shared by every domain page.
   A page loads icons.js and app.js, optionally adds its own hand-built topic
   sections inside <main id="main">, then calls App.start(config). */
(function(){
'use strict';

/* ---------- helpers ---------- */
const ICONS = window.AWS_ICONS || {};
const iconURL = k => ICONS[k] ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ICONS[k]) : '';
const img = (k, cls='ico', alt='') => `<img class="${cls}" src="${iconURL(k)}" alt="${alt}">`;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; };
let prefix = 'saa-';
const store = {
  get(k, d){ try{ const v = localStorage.getItem(prefix+k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(prefix+k, JSON.stringify(v)); }catch(e){} }
};
const shared = {
  get(k, d){ try{ const v = localStorage.getItem('saa-'+k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('saa-'+k, JSON.stringify(v)); }catch(e){} }
};

/* theme: applied before first paint; shared by all pages */
(function(){
  let t = shared.get('theme', null);
  if (t==null){ try{ t = JSON.parse(localStorage.getItem('saa-compute-theme')); }catch(e){} }
  if (t) document.documentElement.dataset.theme = t;
})();

const ICON_SVG = {
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  learn:'<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
  practice:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
  revise:'<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>'
};

/* ---------- generic explainers (for data-driven topics) ---------- */
const INITS = {};
let initSeq = 0;
function deferInit(fn){ const k = 'i' + (++initSeq); INITS[k] = fn; return k; }

function renderPane(p){
  switch (p.type){
    case 'compare': {
      const n = p.cols.length;
      return `<div class="cmp" style="--n:${n}">
        <div class="cmp-row"><span></span>${p.cols.map(c=>`<span class="cmp-head">${c[0]?img(c[0]):''}${c[1]}</span>`).join('')}</div>
        ${p.rows.map(r=>`<div class="cmp-row"><span>${r[0]}</span>${r.slice(1).map(c=>`<span>${c}</span>`).join('')}</div>`).join('')}</div>`;
    }
    case 'picker': {
      const k = deferInit(el=>{
        let sel = 0;
        const scen = el.querySelector('[data-role="scen"]'), out = el.querySelector('[data-role="out"]');
        const render = ()=>{
          const [, hit, why] = p.scen[sel];
          scen.innerHTML = p.scen.map((s,i)=>`<button aria-pressed="${i===sel}" data-s="${i}">${s[0]}</button>`).join('');
          out.innerHTML = `<div class="grid" style="gap:12px"><div class="lb-why"><span class="pill acc">${p.opts[hit].short||p.opts[hit].n}</span> ${why}</div>
            <div class="lb3">${Object.entries(p.opts).map(([key,x])=>`<div class="lb ${key===hit?'hit':'dim'}"><h4>${x.ico?img(x.ico,'',''):''}${x.n}</h4>
            ${x.tag?`<span class="pill">${x.tag}</span>`:''}<ul>${x.pts.map(t=>`<li>${t}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
        };
        scen.addEventListener('click', e=>{ const b=e.target.closest('[data-s]'); if(b){ sel=+b.dataset.s; render(); } });
        render();
      });
      return `<div class="grid" style="gap:12px" data-init="${k}"><div class="seg" data-role="scen"></div><div data-role="out"></div></div>`;
    }
    case 'spectrum': {
      const k = deferInit(el=>{
        let sel = p.start||0;
        const stops = el.querySelector('[data-role="stops"]'), out = el.querySelector('[data-role="out"]');
        const render = ()=>{
          stops.innerHTML = p.stops.map((x,i)=>`<button class="stop" aria-pressed="${i===sel}" data-i="${i}">${x.ico?img(x.ico,'',''):`<span class="rg">${x.badge||''}</span>`}${x.n}<small>${x.sub}</small></button>`).join('');
          const x = p.stops[sel];
          out.innerHTML = `<div class="lb-why"><b>${x.n}</b>${x.head?` · ${x.head}`:''}<div class="muted" style="margin-top:4px">${x.text}</div></div>`;
        };
        stops.addEventListener('click', e=>{ const b=e.target.closest('[data-i]'); if(b){ sel=+b.dataset.i; render(); } });
        render();
      });
      return `<div class="grid" style="gap:12px" data-init="${k}"><div class="spectrum-axis"><span>${p.axis[0]}</span><span>${p.axis[1]}</span></div>
        <div class="spectrum" style="--n:${p.stops.length}" data-role="stops"></div><div data-role="out"></div></div>`;
    }
    case 'cards':
      return `<div class="svcs">${p.items.map(s=>`<div class="svc"><h4>${s[0]?img(s[0],'',''):''}${s[1]}</h4><p>${s[2]}</p>${s[3]?`<span class="clue-line">Clue: ${s[3]}</span>`:''}</div>`).join('')}</div>`;
    case 'tiles':
      return `<div class="limits">${p.items.map(l=>`<div class="limit ${l[2]?'key':''}"><div class="n">${l[0]}</div><div class="k">${l[1]}</div></div>`).join('')}</div>${p.note?`<p class="keys">${p.note}</p>`:''}`;
    case 'vs':
      return `<div class="vs">${p.items.map(c=>`<div class="card"><h4>${c.ico?img(c.ico,'',''):''}${c.t}${c.pill?` <span class="pill ${c.pill[0]}">${c.pill[1]}</span>`:''}</h4><ul>${c.pts.map(t=>`<li>${t}</li>`).join('')}</ul></div>`).join('')}</div>`;
    case 'list':
      return `<div class="facts">${p.items.map(f=>`<div class="fact"><b>${f[0]}</b>${f[1]}</div>`).join('')}</div>`;
    case 'steps':
      return `<ol class="steps">${p.items.map(t=>`<li>${t}</li>`).join('')}</ol>`;
    default:
      return p.html || '';
  }
}

function renderExplainer(panes, aid){
  const multi = panes.length > 1;
  const tabs = multi
    ? `<div class="seg" role="group">${panes.map((p,i)=>`<button data-pane="p${i}" aria-pressed="${i===0}">${p.tab}</button>`).join('')}</div>`
    : (panes[0].label ? `<span class="label" style="margin:0">${panes[0].label}</span>` : '');
  const body = panes.map((p,i)=>`<div class="pane" data-pane="p${i}"${i?' hidden':''}><div class="grid" style="gap:12px">${multi&&p.label?`<span class="label" style="margin:0">${p.label}</span>`:''}${renderPane(p)}${p.aid?`<div class="aid"><span>${p.aid}</span></div>`:''}</div></div>`).join('');
  return `<div class="card xcard">${tabs}${body}${aid?`<div class="aid"><span>${aid}</span></div>`:''}</div>`;
}

function renderTopic(id, t){
  const head = t.icon
    ? `<div class="head">${img(t.icon,'',t.title+' icon')}<div><div class="eyebrow">${t.eyebrow}</div><h2>${t.title}</h2></div></div>`
    : `<div><div class="eyebrow">${t.eyebrow}</div><h2>${t.title}</h2></div>`;
  const picks = t.picks ? `<div><span class="label">${t.picksLabel||'Exam picks it when'}</span><div class="picks">${t.picks.map(p=>`<div class="pick">${p[0]?img(p[0],'',''):''}<span>${p[1]}</span></div>`).join('')}</div></div>` : '';
  const tree = t.tree ? `<div class="card picker-card" data-dt aria-live="polite"></div>
    <div><span class="label">The whole tree · Yes goes right, No goes down · tap a box to jump there</span><div class="card tree-card"><div class="tree"></div></div></div>` : '';
  const ex = t.explain ? renderExplainer(t.explain, t.aid) : '';
  const traps = t.traps ? `<div class="traps"><span class="label">Top traps</span><ol>${t.traps.map(x=>`<li><span>${x}</span></li>`).join('')}</ol></div>` : '';
  const d = t.details;
  const more = d ? `<details class="more"><summary>More details <small>${d.sum}</small></summary><div class="more-body">
    ${d.facts?`<div class="facts">${d.facts.map(f=>`<div class="fact"><b>${f[0]}</b>${f[1]}</div>`).join('')}</div>`:''}${d.html||''}</div></details>` : '';
  return `<section class="panel" data-view="${id}" hidden>${head}<p class="oneliner">${t.one}</p>${picks}${tree}${ex}${traps}${more}
    <div class="test" data-test="${t.test||'All'}"></div><div class="pager" data-pager="${id}"></div></section>`;
}

/* ---------- decision tree: flowchart, "No" runs down a spine, "Yes" branches right ---------- */
let treeSeq = 0;
function makeTree(panel, T){
  const card = panel.querySelector('[data-dt]'), treeEl = panel.querySelector('.tree');
  const tid = 't' + (++treeSeq);
  let path = [];
  let edges = [];                 // [questionPath, choice, label]
  const key = p => p.join(',');

  function box(id, p, on, cur){
    const cls = (on.has(key(p))?' on':'') + (key(p)===cur?' cur':'');
    if (id.startsWith('R:')){
      const r = T.results[id.slice(2)];
      return `<button class="tn res${cls}" data-tp="${key(p)}">${img(r.ico,'','')}<span>${r.t}</span></button>`;
    }
    return `<button class="tn q${cls}" data-tp="${key(p)}">${T.nodes[id].s}</button>`;
  }
  // a spine is a question followed by its chain of "No" answers; each question's "Yes" branches right
  function spine(id, p, on, cur){
    let h = '<div class="ft-spine">';
    while (!id.startsWith('R:')){
      const [yes, no] = T.nodes[id].o;
      edges.push([p, 0, yes[0]], [p, 1, no[0]]);
      const yp = [...p, 0];
      const child = yes[1].startsWith('R:') ? box(yes[1], yp, on, cur) : spine(yes[1], yp, on, cur);
      h += `<div class="ft-row">${box(id, p, on, cur)}<div class="ft-yes">${child}</div></div>`;
      p = [...p, 1]; id = no[1];
    }
    return h + `<div class="ft-row">${box(id, p, on, cur)}</div></div>`;
  }

  function draw(){
    const ft = treeEl.querySelector('.ft'); if (!ft) return;
    const base = ft.getBoundingClientRect(); if (!base.width) return;
    const at = k => { const el = ft.querySelector(`[data-tp="${k}"]`); if(!el) return null;
      const r = el.getBoundingClientRect(); return {l:r.left-base.left, t:r.top-base.top, r:r.right-base.left, b:r.bottom-base.top, cy:(r.top+r.bottom)/2-base.top}; };
    const on = new Set(ft.dataset.on ? ft.dataset.on.split('|') : []);
    let lines = '', labels = '';
    edges.forEach(([p, c, text])=>{
      const from = at(key(p)), to = at(key([...p, c])); if (!from || !to) return;
      const isOn = on.has(key(p)) && on.has(key([...p, c]));
      const kind = c===0 ? 'y' : 'n', cls = `ft-l ${kind}${isOn?' on':''}`, mk = `url(#${tid}-${isOn?'on':kind})`;
      let d, lx, ly;
      if (c===1){                                   // No: straight down the spine
        const x = from.l + 16;
        d = `M${x} ${from.b} V${to.t - 1}`; lx = x + 7; ly = to.t - 9;
      } else if (to.t >= from.b - 2){               // Yes, stacked below (narrow screens): elbow down then right
        const x = from.l + 38;
        d = `M${x} ${from.b} V${to.cy} H${to.l - 1}`; lx = x + 7; ly = from.b + 15;
      } else {                                      // Yes, beside: out the right edge, elbow if heights differ
        const y = Math.min(Math.max(to.cy, from.t + 10), from.b - 10);   // one straight horizontal run
        d = `M${from.r} ${y} H${to.l - 1}`; lx = from.r + 6; ly = y - 7;
      }
      lines += `<path class="${cls}" d="${d}" marker-end="${mk}"/>`;
      labels += `<text class="ft-t ${kind}${isOn?' on':''}" x="${lx}" y="${ly}">${text}</text>`;
    });
    const mark = (n, v) => `<marker id="${tid}-${n}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(${v})"/></marker>`;
    ft.querySelector('.ft-lines').innerHTML = `<defs>${mark('n','--tree-no')}${mark('y','--good')}${mark('on','--accent')}</defs>${lines}${labels}`;
  }

  function render(){
    let node = 'start';
    const steps = [];
    for (const c of path){ const n = T.nodes[node]; steps.push([n.q, n.o[c][0]]); node = n.o[c][1]; }
    const pathHTML = steps.length ? `<div class="dt-path">${steps.map(s=>`<div>${s[0]} → <b>${s[1]}</b></div>`).join('')}</div>` : '';
    if (node.startsWith('R:')){
      const r = T.results[node.slice(2)];
      card.innerHTML = `<div class="eyebrow">Answer</div>
        <div class="dt-result" style="margin-top:10px">${img(r.ico,'','')}<div><h3>${r.t}</h3><p>${r.w}</p>${r.alt?`<p class="muted" style="margin-top:6px">${r.alt}</p>`:''}</div></div>
        ${pathHTML}<div style="margin-top:16px;display:flex;gap:8px"><button class="btn" data-dt="back">Back</button><button class="btn primary" data-dt="reset">Start over</button></div>`;
    } else {
      const n = T.nodes[node];
      card.innerHTML = `<div class="eyebrow">Question ${steps.length+1}</div><div class="dt-q">${n.q}</div>
        <div class="dt-opts">${n.o.map((o,i)=>`<button class="btn ${i===0?'primary':''}" data-dt="${i}">${o[0]}</button>`).join('')}
        ${steps.length?'<button class="btn" data-dt="back">Back</button>':''}</div>${pathHTML}`;
    }
    const on = new Set(path.map((_,i)=>key(path.slice(0,i+1)))); on.add('');
    edges = [];
    treeEl.innerHTML = `<div class="ft" data-on="${[...on].join('|')}"><svg class="ft-lines" aria-hidden="true"></svg>${spine('start', [], on, key(path))}</div>`;
    treeEl.classList.toggle('done', node.startsWith('R:'));
    draw();
  }
  card.addEventListener('click', e=>{
    const b = e.target.closest('[data-dt]'); if(!b || b===card) return;
    const v = b.dataset.dt;
    if (v==='back') path.pop(); else if (v==='reset') path=[]; else path.push(+v);
    render();
  });
  treeEl.addEventListener('click', e=>{
    const b = e.target.closest('[data-tp]'); if(!b) return;
    path = b.dataset.tp ? b.dataset.tp.split(',').map(Number) : [];
    render();
  });
  if (window.ResizeObserver) new ResizeObserver(()=>draw()).observe(treeEl);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  render();
}

/* ---------- shell: header, bottom bar, practice + revise panels ---------- */
function shellHTML(cfg){
  const modes = cls => `<div class="modes ${cls}" role="group" aria-label="Mode">
      <button data-mode="learn">${cls?'':ICON_SVG.learn}Learn</button>
      <button data-mode="practice">${cls?'':ICON_SVG.practice}Practice</button>
      <button data-mode="revise" class="rev">${cls?'':ICON_SVG.revise}Revise</button></div>`;
  return {
    header: `<header class="topbar"><div class="topbar-in">
      <a class="brand" href="index.html" title="All domains"><span class="brand-mark">C03</span><span class="brand-name">${cfg.title}</span></a>
      ${modes('top-modes')}
      <button class="theme-btn" id="themeBtn" aria-label="Toggle light or dark theme" title="Toggle theme">${ICON_SVG.sun}</button>
      <nav class="subtabs" id="subLearn" aria-label="Topics"></nav>
      <nav class="subtabs" id="subPractice" aria-label="Practice type" hidden></nav>
    </div></header>
    <nav class="bottombar" aria-label="Mode">${modes('')}</nav>`,
    practice: `
    <section class="panel" data-view="quiz" hidden>
      <div><div class="eyebrow">Practice</div><h2>Scenario quiz</h2></div>
      <p class="oneliner">Exam-style clues. Pick an answer to see why.<span class="kbd-hint"> Keys <code>1</code>–<code>4</code> answer, <code>Enter</code> moves on.</span></p>
      <div class="stats" id="stats"></div>
      <div class="card quiz-card" id="mainQuiz"></div>
    </section>
    <section class="panel" data-view="cards" hidden>
      <div><div class="eyebrow">Practice</div><h2>Flashcards</h2></div>
      <p class="oneliner">Tap to flip, then mark whether you knew it. Marks are saved in this browser, so you can drill only the cards to review.</p>
      <div class="fc-area">
        <div>
          <button class="flip" id="flip" aria-label="Flip card"><div class="flip-in">
            <div class="face front"><span class="hint" id="fcHintF"></span><div class="t" id="fcFront"></div><span class="hint">Tap to flip</span></div>
            <div class="face back"><span class="hint">Answer</span><div class="t" id="fcBack"></div><span class="hint" id="fcHintB"></span></div>
          </div></button>
          <div class="fc-ctrl">
            <button class="btn" id="fcPrev">◀ Prev</button>
            <button class="btn" id="fcReview">Review again</button>
            <button class="btn primary" id="fcKnow">I knew it</button>
            <button class="btn" id="fcNext">Next ▶</button>
          </div>
          <p class="keys swipe-hint">Tap the card to flip · swipe ← → to move</p>
          <p class="keys kbd-hint">Keys: <kbd>Space</kbd> flip · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>K</kbd> knew it · <kbd>R</kbd> review again</p>
        </div>
        <div class="card">
          <h4 style="justify-content:space-between">Progress <span class="pill" id="fcCount"></span></h4>
          <div class="meter" style="margin-top:6px"><i id="fcMeter" style="width:0"></i></div>
          <div class="seg" style="margin-top:14px" id="fcFilter"></div>
          <button class="btn" id="fcReset" style="margin-top:14px">Reset progress</button>
        </div>
      </div>
    </section>`,
    revise: `
    <section class="panel" data-view="revision" hidden>
      <div><div class="eyebrow" style="color:var(--aws)">The night before</div><h2>Last-minute revision</h2></div>
      <p class="oneliner">Three blocks: the numbers to know, the pairs people mix up, and trap phrases with their answers.</p>
      <div class="seg rev-jump" aria-label="Jump to">
        <button data-jump="rv-nums">Numbers</button><button data-jump="rv-pairs">Mix-ups</button><button data-jump="rv-traps">Trap phrases</button>
      </div>
      <div class="rev">
        <div class="rev-grid">
          <div class="rev-sec" id="rv-nums"><h3>Numbers</h3><div class="nums" id="revNums"></div></div>
          <div class="rev-sec" id="rv-pairs"><h3>Don't mix these up</h3><div class="pairs" id="revPairs"></div></div>
        </div>
        <h3 class="rev-sec" id="rv-traps" style="margin-top:26px">Trap phrase → answer <button class="btn" id="hideAns" style="font-size:12px;padding:5px 10px;text-transform:none;letter-spacing:0">Hide answers</button></h3>
        <div class="tbl-wrap"><table class="traps-tbl" id="trapsTbl"><thead><tr><th>If the question says…</th><th>Answer</th></tr></thead><tbody></tbody></table></div>
      </div>
    </section>`
  };
}

/* ---------- start ---------- */
function start(cfg){
  prefix = 'saa-' + cfg.id + '-';
  const LEARN = cfg.learn;                       // [id, label, icon, minutes]
  const PRACTICE = [['quiz','Scenario quiz'],['cards','Flashcards']];
  const Q = cfg.questions, FC = cfg.cards;
  const MODE_OF = v => LEARN.some(l=>l[0]===v) ? 'learn' : PRACTICE.some(p=>p[0]===v) ? 'practice' : 'revise';
  const topicNames = [...new Set(Q.map(q=>q[0]))];
  const cardNames = [...new Set(FC.map(c=>c[0]))];

  /* build the page */
  const shell = shellHTML(cfg);
  document.body.insertAdjacentHTML('afterbegin', shell.header);
  const main = $('#main');
  const custom = {};
  $$('#main > [data-view]').forEach(el=>{ custom[el.dataset.view] = el; el.remove(); });
  LEARN.forEach(([id])=>{
    if (custom[id]) main.appendChild(custom[id]);
    else if (cfg.topics && cfg.topics[id]) main.insertAdjacentHTML('beforeend', renderTopic(id, cfg.topics[id]));
  });
  main.insertAdjacentHTML('beforeend', shell.practice + shell.revise);
  $$('img[data-ico]').forEach(el => { el.src = iconURL(el.dataset.ico); });
  $$('[data-init]').forEach(el => { INITS[el.dataset.init](el); });
  LEARN.forEach(([id])=>{ const t = cfg.topics && cfg.topics[id]; if (t && t.tree) makeTree(document.querySelector(`[data-view="${id}"]`), t.tree); });
  LEARN.forEach(([id,, , m])=>{
    const eb = m && document.querySelector(`[data-view="${id}"] .eyebrow`);
    if (eb) eb.textContent += ` · ~${m} min`;
  });

  /* theme toggle */
  $('#themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    shared.set('theme', next);
  });

  /* navigation */
  let curView = null;
  let lastIn = store.get('last', {learn:LEARN[0][0], practice:'quiz'});
  function renderSubtabs(){
    const sec = store.get('sec', {});
    $('#subLearn').innerHTML = LEARN.map(l=>{
      const b = sec[l[0]];
      const badge = b==null ? '' : `<span class="badge ${b>=4?'':'mid'}" title="Best section test score">${b>=4?'✓ ':''}${b}/5</span>`;
      return `<button data-go="${l[0]}" aria-pressed="${l[0]===curView}" class="${l[2]?'':'noico'}">${l[2]?img(l[2],'',''):''}${l[1]}${badge}</button>`;
    }).join('');
  }
  $('#subPractice').innerHTML = PRACTICE.map(p=>`<button data-go="${p[0]}" class="noico">${p[1]}</button>`).join('');
  $$('[data-pager]').forEach(el=>{
    const i = LEARN.findIndex(l=>l[0]===el.dataset.pager);
    const prev = LEARN[i-1], next = LEARN[i+1];
    el.innerHTML = (prev?`<button class="btn" data-go="${prev[0]}">← ${prev[1]}</button>`:'') +
      (next?`<button class="btn primary" data-go="${next[0]}">Next: ${next[1]} →</button>`:`<button class="btn primary" data-go="quiz">Go to practice →</button>`);
  });
  function show(v, scroll=true){
    if (!document.querySelector(`[data-view="${v}"]`)) v = LEARN[0][0];
    const mode = MODE_OF(v);
    curView = v;
    renderSubtabs();
    $$('[data-view]').forEach(p => p.hidden = p.dataset.view !== v);
    $$('.modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode===mode));
    $('#subLearn').hidden = mode!=='learn'; $('#subPractice').hidden = mode!=='practice';
    $$('.subtabs [data-go]').forEach(b => b.setAttribute('aria-pressed', b.dataset.go===v));
    $('.topbar').classList.toggle('nosub', mode==='revise');
    const nav = mode==='learn' ? $('#subLearn') : mode==='practice' ? $('#subPractice') : null;
    const act = nav && nav.querySelector('[aria-pressed="true"]');
    if (act) nav.scrollLeft = act.offsetLeft - (nav.clientWidth - act.offsetWidth)/2;
    if (mode!=='revise'){ lastIn[mode]=v; store.set('last', lastIn); }
    try{ history.replaceState(null,'','#'+v); }catch(e){}
    if (v==='quiz'){ updateStats(); if (mainQuiz.s.idx===0 && mainQuiz.s.ans===null) mainQuiz.render(); }
    if (cfg.onShow) cfg.onShow(v);
    if (scroll) window.scrollTo(0,0);
  }
  document.addEventListener('click', e=>{
    const g = e.target.closest('[data-go]'); if (g){ show(g.dataset.go); return; }
    const m = e.target.closest('[data-mode]');
    if (m){ const md=m.dataset.mode; show(md==='revise'?'revision':lastIn[md]); return; }
    const j = e.target.closest('[data-jump]');
    if (j){ document.getElementById(j.dataset.jump).scrollIntoView({behavior:'smooth', block:'start'}); return; }
    const b = e.target.closest('.xcard > .seg [data-pane]');
    if (b){
      const card = b.closest('.xcard');
      card.querySelectorAll(':scope > .seg [data-pane]').forEach(x=>x.setAttribute('aria-pressed', x===b));
      card.querySelectorAll(':scope > .pane').forEach(p=>p.hidden = p.dataset.pane!==b.dataset.pane);
    }
  });
  window.addEventListener('hashchange', ()=>{ const h=location.hash.slice(1); if(h && h!==curView) show(h); });

  /* quiz engine: one instance per container */
  const missed = () => store.get('miss', []);
  function setMiss(text, add){ const m = new Set(missed()); add ? m.add(text) : m.delete(text); store.set('miss', [...m]); }
  function makeQuiz(root, opts){
    const s = {topic:opts.topic||'All', order:[], idx:0, score:0, done:0, ans:null, sh:[], wrong:[]};
    const TOPICS = ['All', ...topicNames, 'Mistakes'];
    function begin(){
      let ids = Q.map((q,i)=>i);
      if (s.topic==='Mistakes'){ const m = new Set(missed()); ids = ids.filter(i=>m.has(Q[i][1])); }
      else ids = ids.filter(i=>s.topic==='All'||Q[i][0]===s.topic);
      ids = shuffle(ids); if (opts.count) ids = ids.slice(0, opts.count);
      Object.assign(s, {order:ids, idx:0, score:0, done:0, ans:null, wrong:[]}); prep(); render();
    }
    function prep(){ if(s.idx<s.order.length) s.sh = shuffle(Q[s.order[s.idx]][2].map((_,i)=>i)); }
    function render(){
      const topics = opts.full ? `<div class="seg" style="margin-bottom:14px">${TOPICS.map(t=>`<button aria-pressed="${t===s.topic}" data-qt="${t}">${t==='Mistakes'?`My mistakes (${missed().length})`:t}</button>`).join('')}</div>` : '';
      if (!s.order.length){
        root.innerHTML = `${topics}<p class="muted">No saved mistakes yet. Every question you get wrong, in any quiz, lands here so you can retry only those.</p>`;
        return;
      }
      if (s.idx>=s.order.length){
        const pct = Math.round(s.score/s.order.length*100);
        if (opts.full && s.topic!=='Mistakes'){ const best = store.get('best-'+s.topic,0); if(pct>best) store.set('best-'+s.topic,pct); }
        if (opts.key){ const sec = store.get('sec',{}); if(!(sec[opts.key]>=s.score)){ sec[opts.key]=s.score; store.set('sec',sec); } renderSubtabs(); }
        if (opts.full) updateStats();
        const msg = pct>=80 ? 'Solid. You know this topic.' : pct>=60 ? 'Close. Review the misses below, then try again.' : 'Reread the traps above, then try again.';
        const review = s.wrong.length ? `<div class="missed"><span class="label" style="margin:0">Review what you missed</span>${s.wrong.map(i=>`<div><b>${Q[i][1]}</b><div><span class="ok">✓ ${Q[i][2][Q[i][3]]}</span> <span class="muted">${Q[i][4]}</span></div></div>`).join('')}</div>` : '';
        root.innerHTML = `${topics}<div class="eyebrow">Finished</div><div class="q-clue">You scored ${s.score} / ${s.order.length} (${pct}%)</div>
          <p class="muted">${opts.full?(s.wrong.length?'Missed questions are saved under "My mistakes".':'No misses this round.'):msg}</p>
          ${review}
          <div class="q-nav"><button class="btn primary" data-qa="restart">${opts.full?'Start again':'Try 5 more'}</button>${opts.full?'':'<button class="btn" data-go="quiz">Full practice quiz →</button>'}</div>`;
        return;
      }
      const q = Q[s.order[s.idx]];
      root.innerHTML = `${topics}<div class="quiz-top"><span class="pill acc">${q[0]}</span><span class="muted" style="font-size:13px">Question ${s.idx+1} of ${s.order.length} · Score ${s.score}/${s.done}</span></div>
        <div class="meter"><i style="width:${s.idx/s.order.length*100}%"></i></div>
        <div class="q-clue">${q[1]}</div>
        <div class="q-opts">${s.sh.map((o,i)=>{
          let cls=''; if(s.ans!==null){ if(o===q[3]) cls='right'; else if(o===s.ans) cls='wrong'; }
          return `<button class="q-opt ${cls}" data-o="${o}" ${s.ans!==null?'disabled':''}><span class="k">${i+1}</span>${q[2][o]}</button>`;}).join('')}</div>
        ${s.ans!==null?`<div class="q-why"><b>${s.ans===q[3]?'Correct.':'Not quite.'}</b> ${q[4]}</div>`:''}
        <div class="q-nav">${s.ans===null?'<button class="btn" data-qa="next">Skip</button>':'<span></span>'}<button class="btn primary" data-qa="next" ${s.ans===null?'disabled':''}>Next question</button></div>`;
    }
    function answer(o){
      if(s.ans!==null || s.idx>=s.order.length) return;
      const qi = s.order[s.idx], q = Q[qi];
      s.ans=o; s.done++;
      if(o===q[3]){ s.score++; setMiss(q[1], false); } else { s.wrong.push(qi); setMiss(q[1], true); }
      render();
      const nav = root.querySelector('.q-nav');
      if (nav && nav.getBoundingClientRect().bottom > innerHeight - 90) nav.scrollIntoView({behavior:'smooth', block:'end'});
    }
    function next(){
      if(s.idx>=s.order.length) return; s.idx++; s.ans=null; prep(); render();
      const hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head-h')) || 0;
      if (root.getBoundingClientRect().top < hh) root.scrollIntoView({behavior:'smooth', block:'start'});
    }
    root.addEventListener('click', e=>{
      const o=e.target.closest('[data-o]'); if(o){ answer(+o.dataset.o); return; }
      const a=e.target.closest('[data-qa]'); if(a){ a.dataset.qa==='restart' ? begin() : next(); return; }
      const t=e.target.closest('[data-qt]'); if(t){ s.topic=t.dataset.qt; begin(); }
    });
    root._quiz = {s, answer, next, render};
    begin();
    return root._quiz;
  }
  const mainQuiz = makeQuiz($('#mainQuiz'), {full:true});

  $$('[data-test]').forEach(el=>{
    const topic = el.dataset.test;
    const label = '✓ Test this section · 5 questions';
    el.innerHTML = `<button class="btn test-open">${label}</button><div class="card quiz-card" hidden></div>`;
    const btn = el.querySelector('.test-open'), box = el.querySelector('.quiz-card');
    btn.addEventListener('click', ()=>{
      if (box.hidden){ box.hidden=false; btn.textContent='Hide test'; if(!box._quiz) makeQuiz(box,{topic,count:5,key:el.closest('[data-view]').dataset.view}); box.scrollIntoView({behavior:'smooth',block:'nearest'}); }
      else { box.hidden=true; btn.textContent=label; }
    });
  });

  /* flashcards */
  let fcState = store.get('fc', {});
  let fcFilter='All', fcIdx=0;
  const fcVisible = () => FC.map((c,i)=>i).filter(i=> fcFilter==='All' || (fcFilter==='To review' ? fcState[i]!=='known' : FC[i][0]===fcFilter));
  function renderFC(){
    let vis = fcVisible();
    if (!vis.length){ fcFilter='All'; vis=fcVisible(); }
    if (!vis.includes(fcIdx)) fcIdx = vis[0];
    const c = FC[fcIdx];
    $('#flip').classList.remove('on');
    $('#fcFront').textContent=c[1]; $('#fcBack').textContent=c[2];
    $('#fcHintF').textContent = c[0] + ' · card ' + (vis.indexOf(fcIdx)+1) + ' of ' + vis.length;
    $('#fcHintB').textContent = c[0];
    const known = FC.filter((_,i)=>fcState[i]==='known').length;
    $('#fcCount').textContent = known + ' / ' + FC.length + ' known';
    $('#fcMeter').style.width = (known/FC.length*100)+'%';
    $('#fcFilter').innerHTML = ['All','To review',...cardNames].map(f=>`<button aria-pressed="${f===fcFilter}" data-ff="${f}">${f}</button>`).join('');
  }
  function fcMove(d){ const vis=fcVisible(); const p=vis.indexOf(fcIdx); fcIdx = vis[(p+d+vis.length)%vis.length]; renderFC(); }
  function fcMark(v){ fcState[fcIdx]=v; store.set('fc',fcState); fcMove(1); }
  let fcTouch = null, fcSwiped = false;
  $('#flip').addEventListener('touchstart', e=>{ const t=e.touches[0]; fcTouch={x:t.clientX,y:t.clientY}; fcSwiped=false; }, {passive:true});
  $('#flip').addEventListener('touchend', e=>{
    if(!fcTouch) return;
    const t=e.changedTouches[0], dx=t.clientX-fcTouch.x, dy=t.clientY-fcTouch.y;
    fcTouch=null;
    if (Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5){ fcSwiped=true; fcMove(dx<0?1:-1); }
  });
  $('#flip').onclick=()=>{ if(fcSwiped){ fcSwiped=false; return; } $('#flip').classList.toggle('on'); };
  $('#fcPrev').onclick=()=>fcMove(-1); $('#fcNext').onclick=()=>fcMove(1);
  $('#fcKnow').onclick=()=>fcMark('known'); $('#fcReview').onclick=()=>fcMark('review');
  $('#fcReset').onclick=()=>{ fcState={}; store.set('fc',fcState); renderFC(); };
  $('#fcFilter').addEventListener('click',e=>{const b=e.target.closest('[data-ff]'); if(b){fcFilter=b.dataset.ff; renderFC();}});
  renderFC();

  function updateStats(){
    const known = FC.filter((_,i)=>fcState[i]==='known').length;
    const best = store.get('best-All', null);
    $('#stats').innerHTML = `<span class="pill acc">${Q.length} questions</span><span class="pill ${known?'good':''}">${known} / ${FC.length} flashcards known</span><span class="pill ${missed().length?'warn':''}">${missed().length} saved mistakes</span>${best!=null?`<span class="pill good">Best full quiz: ${best}%</span>`:''}`;
  }

  /* revise sheet */
  $('#revNums').innerHTML = cfg.nums.map(n=>`<span class="n">${n[0]}</span><span>${n[1]}</span>`).join('');
  $('#revPairs').innerHTML = cfg.pairs.map(p=>`<div class="pair"><div><b>${p[0]}</b><span class="muted">${p[1]}</span></div><div><b>${p[2]}</b><span class="muted">${p[3]}</span></div></div>`).join('');
  $('#trapsTbl tbody').innerHTML = cfg.traps.map(t=>`<tr><td>${t[0]}</td><td>${t[1]}${t[2]?`<span class="not">✕ ${t[2]}</span>`:''}</td></tr>`).join('');
  $('#hideAns').onclick=()=>{
    const t=$('#trapsTbl'); t.classList.toggle('hide'); t.querySelectorAll('td.shown').forEach(td=>td.classList.remove('shown'));
    $('#hideAns').textContent = t.classList.contains('hide') ? 'Show answers' : 'Hide answers';
  };
  $('#trapsTbl').addEventListener('click',e=>{ const td=e.target.closest('td:last-child'); if(td && $('#trapsTbl').classList.contains('hide')) td.classList.toggle('shown'); });

  /* keyboard: quiz answers, flashcards, ← → between Learn topics */
  document.addEventListener('keydown',e=>{
    const tag = document.activeElement.tagName;
    if(['INPUT','TEXTAREA','SELECT'].includes(tag) || e.altKey || e.ctrlKey || e.metaKey) return;
    const panel = document.querySelector(`[data-view="${curView}"]`); if(!panel) return;
    if (curView==='cards'){
      if (e.key===' ' && tag!=='BUTTON'){ e.preventDefault(); $('#flip').classList.toggle('on'); }
      else if (e.key==='ArrowRight') fcMove(1);
      else if (e.key==='ArrowLeft') fcMove(-1);
      else if (e.key==='k' || e.key==='K') fcMark('known');
      else if (e.key==='r' || e.key==='R') fcMark('review');
      return;
    }
    const box = [...panel.querySelectorAll('.quiz-card')].find(b=>!b.hidden && b._quiz);
    if (box){
      const qz = box._quiz, s = qz.s;
      if(/^[1-4]$/.test(e.key) && s.ans===null && s.sh[+e.key-1]!=null){ qz.answer(s.sh[+e.key-1]); return; }
      if(e.key==='Enter' && s.ans!==null && tag!=='BUTTON'){ e.preventDefault(); qz.next(); return; }
    }
    if (MODE_OF(curView)==='learn' && (e.key==='ArrowRight' || e.key==='ArrowLeft')){
      const i = LEARN.findIndex(l=>l[0]===curView) + (e.key==='ArrowRight' ? 1 : -1);
      if (LEARN[i]) show(LEARN[i][0]);
    }
  });

  show(location.hash.slice(1) || lastIn.learn || LEARN[0][0], false);
}

window.App = {start, img, iconURL, $, $$, shuffle};
})();
