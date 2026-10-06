// Builds diagrams 3-32 of docs/cheatsheet/architectures.html, its contents list and its jump panel.
// Each diagram is described with a few drawing helpers (zones, boxes, arrows, labels) and rendered to
// static inline SVG that uses the page's own drawing classes, so the published page needs no drawing
// code. Diagrams 1 and 2 are hand-drawn in the page itself. The output replaces what sits between the
// GENERATED markers in the page, so edit this script, then run:  node scripts/build-architectures.js
const fs = require('fs');
const path = require('path');

const PAGE = path.join(__dirname, '..', 'docs', 'cheatsheet', 'architectures.html');

// ---------------------------------------------------------------- drawing helpers
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// rough text widths for Inter, enough to size boxes around their labels
const titleWidth = s => s.length * 7.1;
const labelWidth = s => s.length * 6.1;

const KINDS = {   // arrow styles: the class on the line and the arrowhead's fill class
  in: ['d-in', 'd-head-in'],
  out: ['d-out', 'd-head-out'],
  data: ['d-data', 'd-head-data'],
  alt: ['d-alt', 'd-head-alt']
};

function diagram(id, width, height, ariaLabel) {
  const layers = { zones: [], edges: [], nodes: [], labels: [] };
  const used = new Set();

  const api = {
    // a grouping box: Region, VPC, AZ, subnet, account, data center...
    zone(x, y, w, h, { kind = 'plain', label, at = 'tl', icon } = {}) {
      layers.zones.push(`<rect class="d-z-${kind}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${kind === 'pub' || kind === 'priv' ? 8 : 12}"/>`);
      if (label) {
        const cap = kind === 'region' || kind === 'onprem' || kind === 'account' || kind === 'group';
        const cls = cap ? 'd-cap' : kind === 'vpc' ? 'd-title' : 'd-lbl';
        const text = cap ? label.toUpperCase() : label;
        const right = at.endsWith('r'), bottom = at.startsWith('b');
        let tx = right ? x + w - 12 : x + 14;
        const ty = bottom ? y + h - 10 : y + (cap ? 20 : 19);
        if (icon && !right) {
          layers.zones.push(`<image data-ico="${icon}" x="${tx}" y="${ty - 14}" width="18" height="18"/>`);
          tx += 24;
        }
        layers.zones.push(`<text class="${cls}" x="${tx}" y="${ty}"${right ? ' text-anchor="end"' : ''}>${esc(text)}</text>`);
      }
      return { x, y, w, h };
    },
    // a component box with an optional icon and a second line underneath its name
    node(x, y, title, { icon, w, sub, h } = {}) {
      const inner = Math.max(titleWidth(title), sub ? labelWidth(sub) : 0);
      w = w || Math.round((icon ? 40 : 16) + inner + 14);
      h = h || (sub ? 50 : 40);
      const tx = x + (icon ? 38 : w / 2);
      const anchor = icon ? '' : ' text-anchor="middle"';
      const ty = sub ? y + 21 : y + h / 2 + 5;
      let out = `<rect class="d-node" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;
      if (icon) out += `<image data-ico="${icon}" x="${x + 8}" y="${y + (h - 24) / 2}" width="24" height="24"/>`;
      out += `<text class="d-title" x="${tx}" y="${ty}"${anchor}>${esc(title)}</text>`;
      if (sub) out += `<text class="d-lbl" x="${tx}" y="${ty + 16}"${anchor}>${esc(sub)}</text>`;
      layers.nodes.push(out);
      return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, r: x + w, b: y + h };
    },
    // an arrow along the given points; the last segment stops 2px short so the head touches the box
    edge(points, kind = 'in', { label, lx, ly, anchor = 'middle', both = false, head = true } = {}) {
      const [cls, headCls] = KINDS[kind];
      used.add(kind);
      const pts = points.map(p => [...p]);
      if (head) {
        const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        b[0] -= (b[0] - a[0]) / len * 2;
        b[1] -= (b[1] - a[1]) / len * 2;
      }
      const marker = head ? ` marker-end="url(#${id}-${kind})"` : '';
      const start = both ? ` marker-start="url(#${id}-${kind})"` : '';
      layers.edges.push(`<polyline class="${cls}" points="${pts.map(p => p.map(n => Math.round(n * 10) / 10).join(',')).join(' ')}"${marker}${start}/>`);
      if (label) api.label(lx, ly, label, { anchor });
      return api;
    },
    // a short label with a halo, so it stays readable where it crosses a line
    label(x, y, text, { anchor = 'middle', cls = 'd-lbl d-halo' } = {}) {
      layers.labels.push(`<text class="${cls}" x="${x}" y="${y}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${esc(text)}</text>`);
      return api;
    },
    raw(svg, layer = 'nodes') { layers[layer].push(svg); return api; },
    render() {
      const markers = [...used].map(k => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="${KINDS[k][1]}" d="M0 0L10 5L0 10z"/></marker>`).join('');
      return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(ariaLabel)}"><defs>${markers}</defs>\n`
        + [...layers.zones, ...layers.edges, ...layers.nodes, ...layers.labels].join('\n') + '\n</svg>';
    }
  };
  return api;
}

// side anchors of a node: left/right at a given y, top/bottom at a given x (defaults to the middle)
const L = (n, y = n.cy) => [n.x, y];
const R = (n, y = n.cy) => [n.r, y];
const T = (n, x = n.cx) => [x, n.y];
const B = (n, x = n.cx) => [x, n.b];

const LEGEND_LINES = {
  in: '<line x1="1" y1="5" x2="25" y2="5" stroke="var(--accent)" stroke-width="2"/>',
  out: '<line x1="1" y1="5" x2="25" y2="5" stroke="var(--aws)" stroke-width="2" stroke-dasharray="6 4"/>',
  data: '<line x1="1" y1="5" x2="25" y2="5" stroke="var(--ink)" stroke-width="1.6"/>',
  alt: '<line x1="1" y1="5" x2="25" y2="5" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="3 3"/>'
};

// a self-test closing each diagram: an exam-style question with its answer folded away
function checkCard({ q, opts, answer, why }) {
  return `<div class="card check"><h3>Check yourself</h3><p>${q}</p><ol class="opts">${opts.map(o => `<li>${o}</li>`).join('')}</ol><details><summary>Show answer</summary><p><b>${'ABCD'[answer]}.</b> ${why}</p></details></div>`;
}

// one diagram's section: heading, the rule to remember, figure, legend, cards (each card is a title
// and its HTML), then the self-test
function section({ n, id, title, takeaway, svg, caption, legend = [], cards = [], pair = [], check }) {
  const legendHtml = legend.length
    ? `<div class="legend" aria-hidden="true">${legend.map(([k, t]) => `<span><svg viewBox="0 0 26 10">${LEGEND_LINES[k]}</svg>${t}</span>`).join('')}</div>`
    : '';
  const card = ([t, html]) => `<div class="card"><h3>${t}</h3>${html}</div>`;
  return `
  <section class="arch-sec" id="${id}">
    <h2>${n}. ${title}</h2>
    <p class="rule">${takeaway}</p>
    <figure class="fig">
      <p class="fig-hint">Swipe sideways to see the whole diagram.</p>
      <div class="fig-scroll">
${svg}
      </div>
      <figcaption>${caption}</figcaption>
      ${legendHtml}
    </figure>
    ${pair.length ? `<div class="arch-cols">${pair.map(card).join('')}</div>` : ''}
    ${cards.map(card).join('\n    ')}
    ${checkCard(check)}
  </section>`;
}

const ol = items => `<ol>${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
const ul = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const table = (head, rows) => `<div class="tbl-wrap"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

// ---------------------------------------------------------------- the diagrams
const GROUPS = [
  { id: 'g-network', title: 'Networking foundations', items: [] },
  { id: 'g-ha', title: 'Highly available web applications', items: [] },
  { id: 'g-decouple', title: 'Decoupling and event-driven design', items: [] },
  { id: 'g-data', title: 'Data and analytics', items: [] },
  { id: 'g-db', title: 'Databases', items: [] },
  { id: 'g-dr', title: 'Disaster recovery and migration', items: [] },
  { id: 'g-storage', title: 'Storage', items: [] },
  { id: 'g-security', title: 'Security and multiple accounts', items: [] },
  { id: 'g-ops', title: 'Monitoring and operations', items: [] },
  { id: 'g-cost', title: 'Cost optimization', items: [] }
];
const group = id => GROUPS.find(g => g.id === id);
// diagrams 1 and 2 are hand-drawn in the page (their headings carry their numbers); they are listed
// here for the contents and the numbering, and must stay first
group('g-network').items.push({ id: 'vpc-layout', title: 'Classic multi-AZ VPC' }, { id: 'vpc-endpoints', title: 'Private access to AWS services' });

// Diagrams are numbered in page order (group by group) when the page is written, so a new diagram
// can go into any group and everything after it renumbers itself.
const DIAGRAMS = [];
function add(groupId, spec) {
  const entry = { groupId, ...spec };
  group(groupId).items.push(entry);
  DIAGRAMS.push(entry);
}

// ---- 3. Hybrid connectivity
{
  const d = diagram('d3', 960, 450, 'An on-premises data center connected to AWS. Two Direct Connect connections at different Direct Connect locations reach a Direct Connect gateway, which is associated with a Transit Gateway attached to three VPCs. A Site-to-Site VPN over the internet to the same Transit Gateway is the backup path.');
  d.zone(20, 40, 230, 380, { kind: 'onprem', label: 'Corporate data center' });
  d.zone(300, 50, 210, 100, { kind: 'group', label: 'DX location 1' });
  d.zone(300, 180, 210, 100, { kind: 'group', label: 'DX location 2' });
  d.zone(560, 20, 380, 410, { kind: 'region', label: 'AWS Region' });
  const servers = d.node(50, 110, 'Servers', { w: 170 });
  const router = d.node(50, 250, 'Customer router', { icon: 'cgw', w: 170 });
  const dx1 = d.node(320, 88, 'Direct Connect', { icon: 'dx', w: 170 });
  const dx2 = d.node(320, 218, 'Direct Connect', { icon: 'dx', w: 170 });
  const inet = d.node(320, 340, 'Internet', { w: 170 });
  const dxgw = d.node(585, 120, 'Direct Connect gateway', { icon: 'dx', w: 215, sub: 'global resource' });
  const tgw = d.node(600, 270, 'Transit Gateway', { icon: 'tgw', w: 175 });
  const vpcA = d.node(830, 80, 'VPC A', { icon: 'vpc', w: 95 });
  const vpcB = d.node(830, 200, 'VPC B', { icon: 'vpc', w: 95 });
  const vpcC = d.node(830, 320, 'VPC C', { icon: 'vpc', w: 95 });
  d.edge([B(servers), T(router)], 'data');
  d.edge([R(router, 258), [262, 258], [262, dx1.cy], L(dx1)], 'in');
  d.edge([R(router, 282), [278, 282], [278, dx2.cy], L(dx2)], 'in');
  d.edge([R(dx1), [540, dx1.cy], [540, dxgw.cy - 8], L(dxgw, dxgw.cy - 8)], 'in', { label: 'transit VIFs', lx: 548, ly: 205, anchor: 'start' });
  d.edge([R(dx2), [540, dx2.cy], [540, dxgw.cy + 8], L(dxgw, dxgw.cy + 8)], 'in');
  d.edge([B(dxgw, tgw.cx), T(tgw)], 'in', { label: 'association', lx: 722, ly: 225, anchor: 'start' });
  const bus = 805;
  d.edge([R(tgw), [bus, tgw.cy]], 'data', { head: false });
  d.edge([[bus, vpcA.cy], [bus, vpcC.cy]], 'data', { head: false });
  for (const v of [vpcA, vpcB, vpcC]) d.edge([[bus, v.cy], L(v)], 'data');
  d.label(878, 382, 'VPC attachments', { cls: 'd-lbl' });
  d.edge([B(router), [router.cx, inet.cy], L(inet)], 'out', { label: 'IPsec VPN', lx: 210, ly: 352 });
  d.edge([R(inet), [575, inet.cy], [575, tgw.cy + 12], L(tgw, tgw.cy + 12)], 'out', { label: 'VPN attachment · backup', lx: 492, ly: 398 });
  add('g-network', {
    id: 'hybrid', title: 'Hybrid connectivity',
    takeaway: 'Consistent private bandwidth → Direct Connect; quick or cheap → Site-to-Site VPN; maximum resiliency → Direct Connect at two locations.',
    check: {
      q: 'A company needs dedicated, consistent bandwidth to AWS, and the same performance must continue if an entire Direct Connect location goes down. What should it set up?',
      opts: [
        'Two Direct Connect connections at the same Direct Connect location.',
        'One Direct Connect connection with a Site-to-Site VPN as backup.',
        'Direct Connect connections at two different Direct Connect locations.',
        'Two Site-to-Site VPN connections over different internet providers.'
      ],
      answer: 2,
      why: 'Only a second location survives a location outage. Two links at one location share its fate, and a VPN backup keeps connectivity but not the consistent performance the question demands.'
    },
    svg: d.render(),
    caption: 'Two Direct Connect connections at different locations carry hybrid traffic over private links to one Direct Connect gateway, which a Transit Gateway shares with every VPC. A Site-to-Site VPN over the internet takes over if both links fail.',
    legend: [['in', 'Direct Connect (primary)'], ['out', 'Site-to-Site VPN over the internet (backup)'], ['data', 'Inside AWS or the data center']],
    pair: [
      ['VPN or Direct Connect?', table(['', 'Site-to-Site VPN', 'Direct Connect'], [
        ['Ready in', 'Minutes', 'Weeks (a physical cross-connect)'],
        ['Path', 'Encrypted IPsec over the internet', 'Private dedicated link, not encrypted by default'],
        ['Bandwidth', 'Up to 1.25 Gbps per tunnel, varies', '50 Mbps to 100 Gbps, consistent'],
        ['Use it for', 'Quick start, low volume, backup', 'Steady large transfers, predictable latency']
      ])],
      ['Exam points', ul([
        '"Consistent bandwidth" or "predictable latency" → Direct Connect; "quickly" or "cheaply" → Site-to-Site VPN.',
        'Maximum resiliency: two Direct Connect connections at <b>two different locations</b>. Two links at one location do not survive a location outage.',
        'Direct Connect plus a VPN as backup is the cost-effective middle ground. Encryption over Direct Connect: run an IPsec VPN over it, or MACsec on dedicated links.',
        'One Direct Connect gateway reaches VPCs in any Region; with a Transit Gateway it scales to many VPCs through a single transit VIF.'
      ])]
    ]
  });
}

// ---- 4. Transit Gateway hub and spoke
{
  const d = diagram('d4', 960, 410, 'On the left, four VPCs joined by a full mesh of six peering connections, which do not route transitively. On the right, the same four VPCs and an on-premises VPN each attached once to a Transit Gateway hub, whose route tables decide which attachments can talk.');
  d.zone(20, 20, 430, 370, { kind: 'group', label: 'Before: VPC peering mesh' });
  d.zone(490, 20, 450, 370, { kind: 'group', label: 'After: Transit Gateway hub' });
  const a = d.node(55, 80, 'VPC A', { icon: 'vpc', w: 100 });
  const b = d.node(315, 80, 'VPC B', { icon: 'vpc', w: 100 });
  const c = d.node(55, 270, 'VPC C', { icon: 'vpc', w: 100 });
  const e = d.node(315, 270, 'VPC D', { icon: 'vpc', w: 100 });
  for (const [p, q] of [[R(a), L(b)], [R(c), L(e)], [B(a), T(c)], [B(b), T(e)], [[a.r, a.b], [e.x, e.y]], [[b.x, b.b], [c.r, c.y]]]) d.edge([p, q], 'alt', { head: false });
  d.label(235, 186, '6 peering connections', { cls: 'd-lbl d-halo' });
  d.label(235, 360, 'n(n−1)/2 links · no transitive routing', { cls: 'd-lbl' });
  const tgw = d.node(630, 185, 'Transit Gateway', { icon: 'tgw', w: 175 });
  const a2 = d.node(520, 70, 'VPC A', { icon: 'vpc', w: 100 });
  const b2 = d.node(810, 70, 'VPC B', { icon: 'vpc', w: 100 });
  const c2 = d.node(520, 300, 'VPC C', { icon: 'vpc', w: 100 });
  const e2 = d.node(810, 300, 'VPC D', { icon: 'vpc', w: 100 });
  const vpn = d.node(645, 300, 'VPN / DX', { icon: 's2svpn', w: 145 });
  d.edge([B(a2), [a2.cx, tgw.cy - 8], L(tgw, tgw.cy - 8)], 'data', { both: true });
  d.edge([T(c2), [c2.cx, tgw.cy + 8], L(tgw, tgw.cy + 8)], 'data', { both: true });
  d.edge([B(b2), [b2.cx, tgw.cy - 8], R(tgw, tgw.cy - 8)], 'data', { both: true });
  d.edge([T(e2), [e2.cx, tgw.cy + 8], R(tgw, tgw.cy + 8)], 'data', { both: true });
  d.edge([B(tgw), T(vpn)], 'data', { both: true });
  d.label(717, 150, 'one attachment per spoke', { cls: 'd-lbl d-halo' });
  d.label(717, 360, 'TGW route tables decide who talks · share with RAM', { cls: 'd-lbl' });
  add('g-network', {
    id: 'tgw', title: 'Transit Gateway hub and spoke',
    takeaway: 'Peering joins two VPCs and is never transitive; many VPCs plus on-premises → one Transit Gateway.',
    check: {
      q: 'A company has 60 VPCs across several accounts and one VPN to its data center. Every VPC must reach the data center, and some VPCs must reach each other, with the least management effort. What should it use?',
      opts: [
        'A full mesh of VPC peering connections.',
        'A separate Site-to-Site VPN from the data center to each VPC.',
        'A Transit Gateway shared through AWS RAM, with VPC attachments, a VPN attachment and route tables.',
        'Peer every VPC to one shared VPC that holds the VPN connection.'
      ],
      answer: 2,
      why: 'Peering is not transitive, so traffic cannot pass through a shared VPC to the VPN, and a full mesh of 60 VPCs is 1,770 connections. A Transit Gateway needs one attachment per VPC and routes between them.'
    },
    svg: d.render(),
    caption: 'Peering joins two VPCs at a time and never forwards traffic onward, so a full mesh grows as n(n−1)/2. A Transit Gateway needs one attachment per VPC or on-premises link, and its route tables decide which ones can reach each other.',
    legend: [['alt', 'VPC peering connection'], ['data', 'Transit Gateway attachment']],
    cards: [
      ['Exam points', ul([
        '"Hundreds of VPCs", "simplify the mesh" or "transitive routing" → Transit Gateway. Two or three VPCs that only talk to each other → peering is cheaper (no hourly attachment charge).',
        'Peering is not transitive: A↔B and B↔C does not give A↔C, and peered VPCs cannot have overlapping CIDRs.',
        'Share one Transit Gateway with other accounts through AWS Resource Access Manager; separate route tables keep, for example, dev and prod apart.',
        'Connect Regions with Transit Gateway peering; connect on-premises with a VPN attachment or a Direct Connect gateway.'
      ])]
    ]
  });
}

// ---- 5. PrivateLink for a SaaS provider
{
  const d = diagram('d5', 960, 420, 'Two consumer VPCs, both using 10.0.0.0/16, each with an interface endpoint. The endpoints connect over AWS PrivateLink to a VPC endpoint service in the provider VPC, which also uses 10.0.0.0/16. The service sits behind a Network Load Balancer in front of the provider instances.');
  d.zone(20, 30, 370, 160, { kind: 'vpc', label: 'Consumer VPC 1 · 10.0.0.0/16' });
  d.zone(20, 230, 370, 160, { kind: 'vpc', label: 'Consumer VPC 2 · 10.0.0.0/16' });
  d.zone(560, 30, 380, 360, { kind: 'vpc', label: 'Provider VPC · 10.0.0.0/16' });
  const app1 = d.node(40, 95, 'App', { icon: 'ec2', w: 95 });
  const ep1 = d.node(170, 95, 'Interface endpoint', { icon: 'vpce', w: 195 });
  const app2 = d.node(40, 295, 'App', { icon: 'ec2', w: 95 });
  const ep2 = d.node(170, 295, 'Interface endpoint', { icon: 'vpce', w: 195 });
  const nlb = d.node(585, 185, 'Network Load Balancer', { icon: 'nlb', w: 215, sub: 'VPC endpoint service' });
  const s1 = d.node(840, 110, 'Service', { icon: 'ec2', w: 90 });
  const s2 = d.node(840, 280, 'Service', { icon: 'ec2', w: 90 });
  d.edge([R(app1), L(ep1)], 'in');
  d.edge([R(app2), L(ep2)], 'in');
  d.edge([R(ep1), [470, ep1.cy], [470, nlb.cy - 8], L(nlb, nlb.cy - 8)], 'in');
  d.edge([R(ep2), [470, ep2.cy], [470, nlb.cy + 8], L(nlb, nlb.cy + 8)], 'in');
  d.label(470, 215, 'AWS PrivateLink', { cls: 'd-lbl d-halo' });
  d.edge([R(nlb, nlb.cy - 8), [818, nlb.cy - 8], [818, s1.cy], L(s1)], 'data');
  d.edge([R(nlb, nlb.cy + 8), [818, nlb.cy + 8], [818, s2.cy], L(s2)], 'data');
  d.label(205, 408, 'consumers start every connection; no peering, no route tables', { cls: 'd-lbl' });
  add('g-network', {
    id: 'privatelink', title: 'PrivateLink for a SaaS service',
    takeaway: 'Expose one service, not a whole network: an NLB behind a VPC endpoint service, reached through interface endpoints. Overlapping CIDRs don\'t matter.',
    check: {
      q: 'A SaaS provider must offer an API to hundreds of customer VPCs. Many customers use the same CIDR range as the provider, and the traffic must not cross the internet. What should the provider do?',
      opts: [
        'Create a VPC peering connection with each customer VPC.',
        'Put the API behind a Network Load Balancer, create a VPC endpoint service, and let customers create interface endpoints.',
        'Share a Transit Gateway with every customer account.',
        'Expose a public ALB with AWS WAF allowing only customer IP addresses.'
      ],
      answer: 1,
      why: 'PrivateLink exposes a single service one way, so identical CIDRs are fine. Peering and Transit Gateway join whole networks and fail with overlapping ranges; a public ALB crosses the internet.'
    },
    svg: d.render(),
    caption: 'Each consumer reaches the provider through an interface endpoint in its own VPC, so identical CIDR ranges do not matter and nothing crosses the internet. Only the service behind the Network Load Balancer is exposed, not the provider\'s whole VPC.',
    legend: [['in', 'Consumer requests over PrivateLink'], ['data', 'Inside the provider VPC']],
    cards: [
      ['Exam points', ul([
        '"Expose one service to many VPCs or accounts", "overlapping CIDRs", "no internet" → a VPC endpoint service (NLB, or GWLB for appliances) consumed through interface endpoints.',
        'Peering or a Transit Gateway would join whole networks and fails with overlapping ranges; PrivateLink exposes a single service, one way.',
        'The provider can require acceptance of each endpoint connection; consumers can add endpoint policies and security groups.',
        'Third-party SaaS on AWS (and AWS services themselves) are reached the same way: an interface endpoint with private DNS.'
      ])]
    ]
  });
}

// ---- 6. Hybrid DNS with Route 53 Resolver
{
  const d = diagram('d6', 960, 440, 'An on-premises network and a VPC resolving each other\'s names. On-premises clients ask their DNS server, which forwards queries for aws.example.internal to a Route 53 Resolver inbound endpoint; the Resolver answers from a private hosted zone. Instances in the VPC ask the Resolver, whose forwarding rule sends queries for corp.example.com through an outbound endpoint to the on-premises DNS server.');
  d.zone(20, 30, 300, 380, { kind: 'onprem', label: 'Corporate network' });
  d.zone(400, 30, 540, 380, { kind: 'vpc', label: 'VPC', icon: 'vpc' });
  const client = d.node(45, 90, 'Laptop or server', { w: 250 });
  const dns = d.node(45, 230, 'DNS server', { w: 250, sub: 'authoritative for corp.example.com' });
  const inb = d.node(425, 120, 'Inbound endpoint', { icon: 'route53', w: 200, sub: 'ENIs with private IPs' });
  const outb = d.node(425, 300, 'Outbound endpoint', { icon: 'route53', w: 200, sub: 'rule: corp.example.com' });
  const resolver = d.node(670, 205, 'Route 53 Resolver', { icon: 'route53', w: 220, sub: 'the VPC\'s .2 address' });
  const phz = d.node(670, 70, 'Private hosted zone', { w: 220, sub: 'aws.example.internal' });
  const ec2 = d.node(700, 330, 'EC2 instance', { icon: 'ec2', w: 160 });
  d.edge([B(client), T(dns)], 'in', { label: 'query aws.example.internal', lx: 170, ly: 190 });
  d.edge([R(dns, dns.cy - 10), [350, dns.cy - 10], [350, inb.cy], L(inb)], 'in', { label: 'conditional forwarder', lx: 360, ly: 205, anchor: 'start' });
  d.edge([R(inb), [645, inb.cy], [645, resolver.cy - 8], L(resolver, resolver.cy - 8)], 'in');
  d.edge([T(resolver), B(phz)], 'in', { label: 'answers', lx: 790, ly: 160, anchor: 'start' });
  d.edge([T(ec2), B(resolver, ec2.cx)], 'data', { label: 'query corp.example.com', lx: 790, ly: 285, anchor: 'start' });
  d.edge([L(resolver, resolver.cy + 12), [655, resolver.cy + 12], [655, outb.cy], R(outb)], 'data', { label: 'forwarding rule', lx: 655, ly: 285 });
  d.edge([L(outb), [360, outb.cy], [360, dns.cy + 12], R(dns, dns.cy + 12)], 'data');
  add('g-network', {
    id: 'hybrid-dns', title: 'Hybrid DNS with Route 53 Resolver',
    takeaway: 'Queries coming into AWS → a Resolver inbound endpoint; queries going out to on-premises → an outbound endpoint plus a forwarding rule.',
    check: {
      q: 'EC2 instances must resolve names in corp.example.com, which only the on-premises DNS servers can answer over Direct Connect. What should be configured?',
      opts: [
        'A Route 53 Resolver outbound endpoint with a forwarding rule for corp.example.com.',
        'A Route 53 Resolver inbound endpoint.',
        'A private hosted zone named corp.example.com associated with the VPC.',
        'A public hosted zone for corp.example.com.'
      ],
      answer: 0,
      why: 'The queries leave the VPC, so they need an outbound endpoint and a rule that forwards the domain. An inbound endpoint serves the opposite direction, and a hosted zone would answer itself instead of asking on-premises DNS.'
    },
    svg: d.render(),
    caption: 'Inbound endpoints let on-premises DNS forward queries into the VPC; outbound endpoints with forwarding rules let the VPC send queries for on-premises domains back out. Both travel over the VPN or Direct Connect link.',
    legend: [['in', 'On-premises resolving AWS names'], ['data', 'The VPC resolving on-premises names']],
    cards: [
      ['Exam points', ul([
        'On-premises servers must resolve a <b>private hosted zone</b> → Resolver <b>inbound</b> endpoint, and a conditional forwarder on the corporate DNS server pointing at its IPs.',
        'Instances must resolve <b>on-premises</b> names → Resolver <b>outbound</b> endpoint plus a forwarding rule for that domain; share the rule with other VPCs and accounts through RAM.',
        'Both endpoints are ENIs in your subnets; put them in at least two AZs.',
        'A private hosted zone answers only inside the VPCs associated with it; a public hosted zone answers everyone.'
      ])]
    ]
  });
}

// ---- 7. Three-tier web application
{
  const d = diagram('d7', 960, 470, 'Users look up the site in Route 53, which aliases to CloudFront. CloudFront serves static files from S3 and sends API paths to an Application Load Balancer, which spreads requests over EC2 instances in an Auto Scaling group across two Availability Zones. The instances read hot data from ElastiCache, write to the RDS primary, which replicates synchronously to a Multi-AZ standby and asynchronously to a read replica used for reports.');
  d.zone(355, 25, 590, 430, { kind: 'region', label: 'AWS Region' });
  d.zone(375, 185, 290, 110, { kind: 'asg' });
  d.label(673, 292, 'Auto Scaling group, 2 AZs', { anchor: 'start', cls: 'd-lbl' });
  const users = d.node(20, 205, 'Users', { w: 95 });
  const r53 = d.node(20, 50, 'Route 53', { icon: 'route53', w: 160, sub: 'alias record' });
  const cf = d.node(150, 200, 'CloudFront', { icon: 'cloudfront', w: 165, sub: 'WAF web ACL' });
  const s3 = d.node(410, 50, 'S3 static assets', { icon: 's3', w: 200, sub: 'private, via OAC' });
  const alb = d.node(390, 120, 'Application Load Balancer', { icon: 'alb', w: 255 });
  const ec2a = d.node(395, 205, 'EC2 · AZ A', { icon: 'ec2', w: 125 });
  const ec2b = d.node(530, 205, 'EC2 · AZ B', { icon: 'ec2', w: 125 });
  const cache = d.node(720, 200, 'ElastiCache', { icon: 'elasticache', w: 200, sub: 'sessions, hot reads' });
  const primary = d.node(390, 365, 'RDS primary', { icon: 'rds', w: 170, sub: 'all writes' });
  const standby = d.node(590, 365, 'Standby', { icon: 'rds', w: 150, sub: 'Multi-AZ, other AZ' });
  const replica = d.node(770, 365, 'Read replica', { icon: 'rds', w: 155, sub: 'reports' });
  d.edge([T(users), [users.cx, r53.b]], 'alt', { label: 'DNS lookup', lx: 76, ly: 155, anchor: 'start' });
  d.edge([R(users), L(cf, users.cy)], 'in', { label: 'HTTPS', lx: 132, ly: 216 });
  d.edge([T(cf, 200), [200, s3.cy], L(s3)], 'in', { label: '/static/* (cached)', lx: 300, ly: 68 });
  d.edge([R(cf, cf.cy - 5), [355, cf.cy - 5], [355, alb.cy], L(alb)], 'in', { label: '/api/*', lx: 334, ly: 180 });
  d.edge([B(alb, ec2a.cx), T(ec2a)], 'in');
  d.edge([B(alb, ec2b.cx), T(ec2b)], 'in');
  d.edge([R(ec2b), [cache.x, ec2b.cy]], 'data', { label: 'get / set', lx: 688, ly: 218 });
  d.edge([B(ec2a), [ec2a.cx, primary.y]], 'data', { label: 'writes', lx: 470, ly: 330, anchor: 'start' });
  d.edge([R(primary), L(standby, primary.cy)], 'data', { label: 'sync', lx: 575, ly: 359 });
  d.edge([B(primary, 420), [420, 440], [replica.cx, 440], B(replica)], 'data', { label: 'async replication', lx: 650, ly: 436 });
  d.edge([B(ec2b), [ec2b.cx, 330], [replica.cx, 330], T(replica)], 'data', { label: 'report queries', lx: 760, ly: 326 });
  add('g-ha', {
    id: 'three-tier', title: 'Three-tier web application',
    takeaway: 'Spread every tier over two or more AZs, keep the web tier stateless, cache hot reads, and send reports to a read replica.',
    check: {
      q: 'Users of a web application behind an ALB are logged out whenever the Auto Scaling group scales in. What is the best fix?',
      opts: [
        'Turn on sticky sessions on the ALB.',
        'Store session data in ElastiCache or DynamoDB.',
        'Disable scale-in for the Auto Scaling group.',
        'Keep sessions on an EBS volume attached to each instance.'
      ],
      answer: 1,
      why: 'A stateless web tier keeps sessions outside the instances, so terminating one loses nothing. Sticky sessions still lose the session when their instance is terminated, and disabling scale-in wastes money.'
    },
    svg: d.render(),
    caption: 'The backbone of most scenario questions. Every tier is spread over two or more Availability Zones, static content never reaches the servers, hot reads stop at the cache, and reports run on a replica instead of the primary.',
    legend: [['in', 'Request path'], ['data', 'Data and replication'], ['alt', 'DNS']],
    pair: [
      ['How a request flows', ol([
        'Route 53 answers with an <b>alias</b> to the CloudFront distribution (an alias, not a CNAME, works at the zone apex and is free).',
        'CloudFront serves <code>/static/*</code> from its cache or S3, and forwards <code>/api/*</code> to the ALB; WAF filters both.',
        'The ALB picks a healthy instance in any AZ; the Auto Scaling group keeps enough instances running.',
        'Instances read from ElastiCache first, write to the RDS primary, and send heavy reports to the read replica.'
      ])],
      ['Exam points', ul([
        'Keep the web tier <b>stateless</b>: sessions in ElastiCache or DynamoDB, not on the instance, so scaling in loses nothing.',
        'Multi-AZ instance standby = availability (automatic failover, no reads); a Multi-AZ DB cluster\'s two standbys can also serve reads. Read replica = read scaling (asynchronous, can be promoted, can be cross-Region).',
        'Lock the bucket to CloudFront with Origin Access Control; lock the ALB to CloudFront with its managed prefix list or a secret header.',
        'Scale on ALB request count per target or CPU with target tracking; use scheduled or predictive scaling for known daily peaks.'
      ])]
    ]
  });
}

// ---- 8. Serverless web application
{
  const d = diagram('d8', 960, 400, 'A browser loads the single-page app from S3 through CloudFront, signs in with a Cognito user pool to get a token, and calls API Gateway with it. API Gateway checks the token with a Cognito authorizer, applies throttling, and invokes Lambda, which reads and writes DynamoDB and hands slow work to an SQS queue.');
  const user = d.node(20, 175, 'Browser or app', { w: 150 });
  const cf = d.node(240, 40, 'CloudFront', { icon: 'cloudfront', w: 175, sub: 'HTTPS, caching' });
  const s3 = d.node(490, 40, 'S3 bucket', { icon: 's3', w: 175, sub: 'static site, OAC' });
  const api = d.node(240, 170, 'API Gateway', { icon: 'apigw', w: 175, sub: 'authorizer, throttling' });
  const cog = d.node(240, 310, 'Cognito user pool', { icon: 'cognito', w: 205, sub: 'sign-in, issues JWT' });
  const fn = d.node(490, 170, 'Lambda', { icon: 'lambda', w: 175, sub: 'business logic' });
  const ddb = d.node(740, 170, 'DynamoDB', { icon: 'dynamodb', w: 185, sub: 'on-demand capacity' });
  const sqs = d.node(740, 300, 'SQS queue', { icon: 'sqs', w: 185, sub: 'slow work, retries' });
  d.edge([T(user), [user.cx, cf.cy], L(cf)], 'in', { label: '1 load the app', lx: 95, ly: 120 });
  d.edge([R(cf), L(s3)], 'in');
  d.edge([B(user), [user.cx, cog.cy], L(cog)], 'alt', { label: '2 sign in → token', lx: 95, ly: 290 });
  d.edge([R(user), L(api, user.cy)], 'in', { label: '3 call + JWT', lx: 205, ly: 186 });
  d.edge([B(api, 330), T(cog, 330)], 'alt', { label: 'verify token', lx: 340, ly: 270, anchor: 'start' });
  d.edge([R(api), L(fn)], 'in');
  d.edge([R(fn), L(ddb)], 'data', { label: 'read / write', lx: 702, ly: 186 });
  d.edge([B(fn), [fn.cx, sqs.cy], L(sqs)], 'data', { label: 'enqueue', lx: 640, ly: 316 });
  add('g-ha', {
    id: 'serverless', title: 'Serverless web application',
    takeaway: 'Least operations for spiky traffic → S3 and CloudFront for the front end, API Gateway, Lambda and DynamoDB behind it, Cognito for sign-in.',
    check: {
      q: 'After signing in, a mobile app\'s users must upload photos straight to S3 with temporary, per-user AWS credentials. Which service issues those credentials?',
      opts: [
        'A Cognito user pool.',
        'An IAM user for each customer.',
        'A Cognito identity pool.',
        'API Gateway API keys.'
      ],
      answer: 2,
      why: 'A user pool signs users in and issues tokens; an identity pool exchanges a token for temporary AWS credentials scoped by an IAM role. IAM users do not scale to customers, and API keys are not AWS credentials.'
    },
    svg: d.render(),
    caption: 'No servers to patch or scale: the static front end comes from S3 through CloudFront, Cognito handles sign-in, and every API call passes API Gateway\'s token check and throttling before Lambda runs.',
    legend: [['in', 'Request path'], ['data', 'Data'], ['alt', 'Sign-in and token checks']],
    cards: [
      ['Exam points', ul([
        '"Least operational overhead" with a spiky or unpredictable load → this stack. Lambda runs at most <b>15 minutes</b>; longer jobs go to Fargate or Step Functions.',
        'API Gateway <b>usage plans and API keys</b> give per-client throttling and quotas; a Cognito authorizer rejects calls without a valid token before Lambda runs.',
        'Cognito <b>user pools</b> sign users in (tokens); <b>identity pools</b> exchange a token for temporary AWS credentials, for example to upload straight to S3.',
        'Absorb bursts without losing requests: API Gateway → SQS → Lambda. Cold starts: provisioned concurrency (or SnapStart for Java, Python and .NET).'
      ])]
    ]
  });
}

// ---- 9. CloudFront or Global Accelerator
{
  const d = diagram('d9', 960, 410, 'Left: CloudFront. Users reach the nearest edge location, which serves cached HTTP content and goes to the origin only on a cache miss, failing over to a secondary origin on errors. Right: Global Accelerator. Users reach two static anycast IP addresses at the nearest edge, and traffic of any TCP or UDP kind rides the AWS backbone to an endpoint group in the closest healthy Region, failing over to another Region.');
  d.zone(20, 20, 440, 370, { kind: 'group', label: 'CloudFront: content cached at the edge' });
  d.zone(500, 20, 440, 370, { kind: 'group', label: 'Global Accelerator: a fast path to your endpoints' });
  const u1 = d.node(150, 60, 'Users far away', { w: 180 });
  const edge = d.node(130, 160, 'Edge location', { icon: 'cloudfront', w: 220, sub: 'cache hit: served from here' });
  const o1 = d.node(40, 290, 'Primary origin', { icon: 'alb', w: 185, sub: 'ALB, S3 or HTTP server' });
  const o2 = d.node(255, 290, 'Secondary origin', { icon: 's3', w: 185, sub: 'origin group' });
  d.edge([B(u1), T(edge)], 'in', { label: 'HTTP / HTTPS', lx: 252, ly: 133, anchor: 'start' });
  d.edge([B(edge, o1.cx), T(o1)], 'data', { label: 'cache miss only', lx: 70, ly: 258, anchor: 'start' });
  d.edge([B(edge, o2.cx), T(o2)], 'alt', { label: 'on 5xx', lx: 358, ly: 258, anchor: 'start' });
  const u2 = d.node(630, 60, 'Users far away', { w: 180 });
  const ga = d.node(610, 160, 'Anycast static IPs', { icon: 'globalacc', w: 220, sub: '2 fixed IPs at the edge' });
  const ra = d.node(520, 290, 'us-east-1', { icon: 'nlb', w: 185, sub: 'endpoint group' });
  const rb = d.node(735, 290, 'eu-west-1', { icon: 'nlb', w: 185, sub: 'endpoint group' });
  d.edge([B(u2), T(ga)], 'in', { label: 'any TCP / UDP', lx: 732, ly: 133, anchor: 'start' });
  d.edge([B(ga, ra.cx), T(ra)], 'in', { label: 'AWS backbone', lx: 550, ly: 258, anchor: 'start' });
  d.edge([B(ga, rb.cx), T(rb)], 'alt', { label: 'failover', lx: 838, ly: 258, anchor: 'start' });
  add('g-ha', {
    id: 'edge', title: 'CloudFront or Global Accelerator',
    takeaway: 'Cache HTTP content → CloudFront; static IPs, UDP or other non-HTTP traffic, or fast Regional failover → Global Accelerator.',
    check: {
      q: 'A multiplayer game runs UDP servers in two Regions. Players need low latency, and many corporate firewalls only allow a fixed list of IP addresses. What should be used?',
      opts: [
        'A CloudFront distribution with an origin group.',
        'AWS Global Accelerator in front of both Regions.',
        'Route 53 latency-based routing to each Region.',
        'S3 Transfer Acceleration.'
      ],
      answer: 1,
      why: 'Global Accelerator gives two static anycast IPs, carries UDP over the AWS backbone and fails over between Regions in seconds. CloudFront serves HTTP only, and Route 53 gives no fixed IPs.'
    },
    svg: d.render(),
    caption: 'Both start at the AWS edge. CloudFront caches HTTP content there, so most requests never reach the origin. Global Accelerator caches nothing; it gives two fixed IP addresses and carries any TCP or UDP traffic over the AWS network to the nearest healthy Region.',
    legend: [['in', 'Request path'], ['data', 'Cache miss'], ['alt', 'Failover']],
    cards: [
      ['Which one?', table(['', 'CloudFront', 'Global Accelerator'], [
        ['Protocols', 'HTTP and HTTPS (and WebSocket)', 'Any TCP or UDP: games, VoIP, IoT, MQTT'],
        ['Caching', 'Yes, that is the point', 'No'],
        ['Addresses', 'A DNS name; IPs change', 'Two static anycast IPs to allowlist'],
        ['Failover', 'Origin groups on error codes', 'Between Regions in seconds, no DNS caching'],
        ['Extras', 'Signed URLs and cookies, Lambda@Edge, CloudFront Functions, geo restriction', 'Client IP preservation, traffic dials per Region']
      ])],
      ['Exam points', ul([
        '"Static IP addresses", "UDP", "non-HTTP" or "fast regional failover" → Global Accelerator. "Cache", "static content", "reduce origin load" → CloudFront.',
        'Both use the AWS backbone and come with Shield Standard; both work in front of an ALB or NLB.',
        'Slow <b>uploads</b> from far away to S3 → S3 Transfer Acceleration (it uses CloudFront edges), not a CloudFront distribution.'
      ])]
    ]
  });
}

// ---- 10. Queue-based load leveling
{
  const d = diagram('d10', 960, 400, 'A web tier sends each order to an SQS queue and answers immediately. Worker instances in an Auto Scaling group poll the queue and write to the database at their own pace. A CloudWatch metric of backlog per instance drives target tracking on the worker group, and messages that fail repeatedly move to a dead-letter queue.');
  const web = d.node(20, 170, 'Web tier', { icon: 'ec2', w: 175, sub: 'answers right away' });
  const q = d.node(275, 170, 'SQS queue', { icon: 'sqs', w: 230, sub: 'buffers the burst' });
  const cw = d.node(275, 30, 'CloudWatch', { icon: 'cloudwatch', w: 230, sub: 'backlog per instance' });
  const dlq = d.node(275, 310, 'Dead-letter queue', { icon: 'sqs', w: 230, sub: 'after maxReceiveCount' });
  d.zone(585, 110, 185, 200, { kind: 'asg' });
  d.label(677, 330, 'Auto Scaling group', { cls: 'd-lbl' });
  const w1 = d.node(610, 135, 'Worker', { icon: 'ec2', w: 135 });
  const w2 = d.node(610, 240, 'Worker', { icon: 'ec2', w: 135 });
  const db = d.node(825, 185, 'Database', { icon: 'rds', w: 115 });
  d.edge([R(web), L(q)], 'in', { label: 'SendMessage', lx: 235, ly: 182 });
  d.edge([R(q, q.cy - 8), [560, q.cy - 8], [560, w1.cy], L(w1)], 'in', { label: 'poll', lx: 568, ly: 165, anchor: 'start' });
  d.edge([R(q, q.cy + 8), [560, q.cy + 8], [560, w2.cy], L(w2)], 'in');
  d.edge([R(w1), [790, w1.cy], [790, db.cy - 8], L(db, db.cy - 8)], 'data');
  d.edge([R(w2), [790, w2.cy], [790, db.cy + 8], L(db, db.cy + 8)], 'data', { label: 'writes', lx: 800, ly: 290, anchor: 'start' });
  d.edge([B(q), T(dlq)], 'alt', { label: 'fails 3 times', lx: 400, ly: 285, anchor: 'start' });
  d.edge([T(q), B(cw)], 'alt', { label: 'queue depth', lx: 400, ly: 145, anchor: 'start' });
  d.edge([R(cw), [677, cw.cy], T(w1, 677)], 'alt', { label: 'target tracking adds workers', lx: 680, ly: 48 });
  add('g-decouple', {
    id: 'queue', title: 'Queue-based load leveling',
    takeaway: 'A queue between tiers absorbs bursts; scale the workers on backlog per instance, and add a dead-letter queue for poison messages.',
    check: {
      q: 'Workers sometimes process the same SQS message twice. Processing a message takes up to 3 minutes. What should be changed?',
      opts: [
        'Turn on long polling.',
        'Set the visibility timeout above the longest processing time.',
        'Add a dead-letter queue.',
        'Increase the message retention period.'
      ],
      answer: 1,
      why: 'If processing outlasts the visibility timeout, the message reappears and a second worker takes it. Long polling cuts empty receives, a DLQ catches repeated failures, and retention does not affect visibility.'
    },
    svg: d.render(),
    caption: 'The queue sits between a front end that must stay fast and a back end that can only go so fast. Orders are accepted at any rate, workers drain them at a rate the database can take, and the backlog per instance tells Auto Scaling how many workers to run.',
    legend: [['in', 'Messages'], ['data', 'Writes'], ['alt', 'Scaling and failures']],
    pair: [
      ['How it behaves', ol([
        'A burst arrives: the web tier keeps answering because it only writes to the queue.',
        'A worker receives a message; it stays invisible for the <b>visibility timeout</b>. The worker deletes it once done.',
        'If a worker dies, the message reappears and another worker takes it. After <code>maxReceiveCount</code> failed attempts it moves to the dead-letter queue.',
        'Backlog per instance (messages ÷ workers) above the target adds workers; an empty queue scales them back in.'
      ])],
      ['Exam points', ul([
        'Orders processed twice → raise the <b>visibility timeout</b> above the longest processing time. Poison messages retried forever → add a <b>DLQ</b>.',
        'Strict order or exactly-once → <b>FIFO</b> queue (message group ID for parallel ordered streams); standard queues are at-least-once with best-effort order.',
        'Long polling (WaitTimeSeconds up to 20) cuts empty receives and cost.',
        'Scale on <b>backlog per instance</b>, not CPU: target = acceptable latency ÷ seconds per message.'
      ])]
    ]
  });
}

// ---- 11. Fan-out with SNS and SQS
{
  const d = diagram('d11', 960, 380, 'An order service publishes each event once to an SNS topic. The topic delivers a copy to three SQS queues, one per consumer: inventory, billing and analytics, where the analytics subscription has a filter policy. Each service polls its own queue at its own pace.');
  const prod = d.node(20, 175, 'Order service', { icon: 'ecs', w: 175 });
  const topic = d.node(255, 175, 'SNS topic', { icon: 'sns', w: 165, sub: 'orders' });
  const rows = [70, 180, 290];
  const names = [['Inventory queue', 'Inventory service', 'lambda'], ['Billing queue', 'Billing service', 'ecs'], ['Analytics queue', 'Analytics', 'lambda']];
  d.edge([R(prod), L(topic, prod.cy)], 'in', { label: 'publish once', lx: 225, ly: 182 });
  rows.forEach((y, i) => {
    const qn = d.node(500, y, names[i][0], { icon: 'sqs', w: 190 });
    const cn = d.node(760, y, names[i][1], { icon: names[i][2], w: 180 });
    d.edge([R(topic, topic.cy + (i - 1) * 10), [460, topic.cy + (i - 1) * 10], [460, qn.cy], L(qn)], 'in');
    d.edge([R(qn), L(cn)], 'data');
  });
  d.label(470, 278, 'filter policy: only EU orders', { anchor: 'start', cls: 'd-lbl d-halo' });
  d.label(940, 365, 'each service polls its own copy, at its own pace', { anchor: 'end', cls: 'd-lbl' });
  add('g-decouple', {
    id: 'fanout', title: 'Fan-out with SNS and SQS',
    takeaway: 'One event, many independent consumers → an SNS topic that fans out to one SQS queue per consumer.',
    check: {
      q: 'Every order must be processed by the inventory, billing and analytics services independently, and any of them can be offline for hours without missing an order. What design fits?',
      opts: [
        'One SQS queue that all three services poll.',
        'An SNS topic that fans out to a separate SQS queue for each service.',
        'An SNS topic with each service\'s HTTPS endpoint subscribed.',
        'Amazon Data Firehose delivering the orders to S3.'
      ],
      answer: 1,
      why: 'Each queue keeps its own copy until its service is back. A shared queue gives each message to only one consumer, and an SNS HTTPS subscription retries only for a limited time.'
    },
    svg: d.render(),
    caption: 'The producer publishes once and knows nothing about its consumers. SNS pushes a copy into a queue per consumer, so each one keeps every message even while it is down, retries on its own, and scales independently.',
    legend: [['in', 'Publish and deliver'], ['data', 'Each consumer polls its queue']],
    cards: [
      ['Exam points', ul([
        '"Several independent systems must each process every event" and "a consumer may be offline for hours" → SNS → SQS per consumer. SNS alone retries an unreachable endpoint only for a limited time; a queue keeps messages for up to 14 days.',
        'A <b>subscription filter policy</b> sends only matching messages to a queue, so consumers do not filter in code.',
        'Ordered fan-out → SNS FIFO topic to SQS FIFO queues.',
        'The queue\'s access policy must allow the topic to send; with SSE-KMS, the key policy must let SNS use the key.'
      ])]
    ]
  });
}

// ---- 12. Event routing with EventBridge
{
  const d = diagram('d12', 960, 420, 'Events from AWS services, a SaaS partner and the company\'s own application arrive on an EventBridge event bus. Rules match event content and route high-priority tickets to Lambda, other tickets to SQS and EC2 state changes to a Step Functions workflow, and send updates to an external HTTPS API through an API destination. The bus archives events so they can be replayed.');
  const aws = d.node(20, 60, 'AWS services', { w: 200, sub: 'EC2, S3, CloudTrail…' });
  const saas = d.node(20, 175, 'SaaS partner', { w: 200, sub: 'e.g. a support desk' });
  const app = d.node(20, 290, 'Your application', { w: 200, sub: 'PutEvents' });
  const bus = d.node(320, 175, 'Event bus', { icon: 'eventbridge', w: 200, sub: 'rules match content' });
  const arch = d.node(320, 330, 'Archive', { icon: 'eventbridge', w: 200, sub: 'replay later' });
  const lam = d.node(720, 20, 'Lambda', { icon: 'lambda', w: 220, sub: 'high-priority tickets' });
  const sqs = d.node(720, 120, 'SQS queue', { icon: 'sqs', w: 220, sub: 'all other tickets' });
  const sfn = d.node(720, 220, 'Step Functions', { icon: 'stepfn', w: 220, sub: 'EC2 state changes' });
  const apid = d.node(720, 320, 'API destination', { icon: 'eventbridge', w: 220, sub: 'external HTTPS, OAuth' });
  for (const src of [aws, saas, app]) d.edge([R(src), [270, src.cy]], 'in', { head: false });
  d.edge([[270, aws.cy], [270, app.cy]], 'in', { head: false });
  d.edge([[270, bus.cy], L(bus)], 'in');
  const targets = [[lam, 'priority = high'], [sqs, 'priority ≠ high'], [sfn, 'source = aws.ec2'], [apid, 'detail-type = Updated']];
  d.edge([R(bus), [600, bus.cy]], 'in', { head: false });
  d.edge([[600, lam.cy], [600, apid.cy]], 'in', { head: false });
  for (const [t, rule] of targets) {
    d.edge([[600, t.cy], L(t)], 'in');
    d.label(660, t.cy - 6, rule, { cls: 'd-lbl d-halo' });
  }
  d.edge([B(bus), T(arch)], 'alt', { label: 'archive', lx: 430, ly: 290, anchor: 'start' });
  add('g-decouple', {
    id: 'eventbridge', title: 'Event routing with EventBridge',
    takeaway: 'Route events by their content, from AWS services, SaaS apps or your own code → EventBridge rules; replay after a fix → archive.',
    check: {
      q: 'A Lambda function must run whenever any EC2 instance in the account changes state, with no polling code. What should be used?',
      opts: [
        'A scheduled Lambda function that calls DescribeInstances every minute.',
        'A CloudWatch Logs subscription filter on the EC2 log group.',
        'An S3 event notification on the CloudTrail bucket.',
        'An EventBridge rule matching EC2 instance state-change events, with the function as the target.'
      ],
      answer: 3,
      why: 'AWS services publish their events to the default bus, and a rule can match them and invoke the function directly. The other options poll or work from delayed log files.'
    },
    svg: d.render(),
    caption: 'Sources publish to one bus and know nothing about the targets. Each rule matches on the event\'s content and forwards matching events to its targets, so adding a consumer means adding a rule, not changing a producer.',
    legend: [['in', 'Events'], ['alt', 'Archive']],
    cards: [
      ['Exam points', ul([
        '"Route by content", "SaaS events with no polling" or "react to AWS service events" → EventBridge rules. Plain fan-out of identical messages → SNS.',
        '<b>Archive and replay</b> keeps events for a set time and re-sends them after a bug fix; SQS has no replay, and SNS can replay only on FIFO topics.',
        '<b>API destinations</b> call external HTTPS APIs with built-in auth (OAuth, API key) and rate limits; <b>EventBridge Scheduler</b> runs cron or one-off schedules at scale.',
        'Cross-account: a rule on one bus targets another account\'s bus; the receiving bus needs a resource policy.'
      ])]
    ]
  });
}

// ---- 13. Workflow orchestration with Step Functions
{
  const d = diagram('d13', 960, 400, 'A Step Functions Standard workflow for a loan. It validates the application in Lambda, calls a credit-scoring API with retries and exponential backoff, then pauses on a task token until a human underwriter approves or rejects. A choice state disburses the funds on approval or sends a rejection notice. Any failure in the credit check is caught and handled.');
  const v = d.node(20, 150, 'Validate', { icon: 'lambda', w: 145, sub: 'Lambda task' });
  const cc = d.node(200, 150, 'Credit check', { icon: 'stepfn', w: 185, sub: 'Retry 3×, backoff' });
  const wait = d.node(420, 150, 'Wait for approval', { icon: 'stepfn', w: 210, sub: '.waitForTaskToken' });
  // a choice state drawn as a diamond
  const cx = 700, cy = 175;
  d.raw(`<polygon class="d-node" points="${cx},${cy - 38} ${cx + 48},${cy} ${cx},${cy + 38} ${cx - 48},${cy}"/><text class="d-title" x="${cx}" y="${cy + 4}" text-anchor="middle">Approved?</text>`);
  const pay = d.node(790, 150, 'Disburse', { icon: 'lambda', w: 150, sub: 'Lambda task' });
  const rej = d.node(625, 290, 'Send rejection', { icon: 'sns', w: 150, sub: 'SNS email' });
  const human = d.node(420, 30, 'Underwriter', { w: 210, sub: 'approves in an internal app' });
  const fail = d.node(200, 290, 'Handle failure', { icon: 'sns', w: 185, sub: 'Catch → alert, refund' });
  d.edge([R(v), L(cc)], 'in');
  d.edge([R(cc), L(wait)], 'in');
  d.edge([R(wait), [cx - 48, cy]], 'in');
  d.edge([[cx + 48, cy], L(pay, cy)], 'in', { label: 'yes', lx: 769, ly: 168 });
  d.edge([[cx, cy + 38], T(rej, cx)], 'in', { label: 'no', lx: 710, ly: 250, anchor: 'start' });
  d.edge([B(human), T(wait)], 'alt', { label: 'SendTaskSuccess (token)', lx: 535, ly: 122, anchor: 'start' });
  d.edge([B(cc), T(fail)], 'alt', { label: 'Catch', lx: 302, ly: 250, anchor: 'start' });
  d.label(480, 380, 'Standard workflow: runs up to a year, exactly-once, full visual history', { cls: 'd-lbl' });
  add('g-decouple', {
    id: 'stepfunctions', title: 'Workflow orchestration with Step Functions',
    takeaway: 'Multi-step workflows with retries, branches and human approval → Step Functions, not Lambdas calling each other.',
    check: {
      q: 'An order process has five steps, needs retries with backoff, includes a human approval that can take days, and must keep a visual history of each run. What is the most operationally efficient choice?',
      opts: [
        'A Step Functions Express workflow.',
        'A Step Functions Standard workflow, using a task token for the approval step.',
        'Lambda functions that invoke each other in sequence.',
        'SQS queues between EC2 worker fleets.'
      ],
      answer: 1,
      why: 'Standard workflows run up to a year and pause on a task token at no cost. Express workflows stop after 5 minutes, and chained Lambdas hit the 15-minute limit with no built-in state or history.'
    },
    svg: d.render(),
    caption: 'The state machine holds the workflow\'s state, so no code waits or loops. Retries and catches are declared on each step, and the human step pauses at no cost until the underwriter\'s app returns the task token.',
    legend: [['in', 'State transitions'], ['alt', 'Callbacks and error handling']],
    cards: [
      ['Exam points', ul([
        '"Multi-step process", "retries with backoff", "human approval", "visual audit trail", "no custom state code" → Step Functions. Chaining Lambdas or sleeping in code is the wrong answer.',
        '<b>Standard</b>: up to 1 year, exactly-once, priced per transition, for business workflows. <b>Express</b>: up to 5 minutes, high volume, at-least-once, for streaming and IoT.',
        'Callback pattern <code>.waitForTaskToken</code> pauses for a person or an external system; <b>Distributed Map</b> fans a big S3 dataset out to thousands of parallel runs.',
        'Direct service integrations (DynamoDB, SQS, SNS, ECS, Glue…) let a step call a service with no Lambda in between.'
      ])]
    ]
  });
}

// ---- 14. Streaming pipeline
{
  const d = diagram('d14', 980, 460, 'Producers put records into Kinesis Data Streams with a partition key. Several consumers read the same stream independently: Lambda through an event source mapping, Managed Service for Apache Flink for real-time windows, a custom application with enhanced fan-out, and Data Firehose, which buffers and delivers the data to S3, Redshift or OpenSearch. Producers can also write to Firehose directly.');
  const prod = d.node(20, 180, 'Producers', { w: 190, sub: 'apps, IoT, clickstream' });
  const kds = d.node(270, 180, 'Kinesis Data Streams', { icon: 'kinesis', w: 245, sub: 'shards, 1 to 365 days kept' });
  const lam = d.node(610, 30, 'Lambda', { icon: 'lambda', w: 210, sub: 'event source mapping' });
  const flink = d.node(610, 120, 'Managed Flink', { icon: 'flink', w: 210, sub: 'real-time windows' });
  const kcl = d.node(610, 210, 'Custom app', { icon: 'ec2', w: 210, sub: 'enhanced fan-out' });
  const fh = d.node(610, 330, 'Data Firehose', { icon: 'firehose', w: 210, sub: 'buffers, converts, no code' });
  const s3 = d.node(850, 290, 'S3', { icon: 's3', w: 120 });
  const rs = d.node(850, 340, 'Redshift', { icon: 'redshift', w: 120 });
  const os = d.node(850, 390, 'OpenSearch', { icon: 'opensearch', w: 120 });
  d.edge([R(prod), L(kds)], 'in', { label: 'partition key', lx: 240, ly: 176 });
  d.edge([R(kds), [565, kds.cy]], 'in', { head: false });
  d.edge([[565, lam.cy], [565, fh.cy]], 'in', { head: false });
  for (const c of [lam, flink, kcl, fh]) d.edge([[565, c.cy], L(c)], 'in');
  d.edge([R(fh), [835, fh.cy]], 'data', { head: false });
  d.edge([[835, s3.cy], [835, os.cy]], 'data', { head: false });
  for (const t of [s3, rs, os]) d.edge([[835, t.cy], L(t)], 'data');
  d.edge([B(prod), [prod.cx, 430], [590, 430], [590, fh.b - 8], L(fh, fh.b - 8)], 'alt', { label: 'or straight into Firehose, no replay', lx: 350, ly: 425 });
  add('g-data', {
    id: 'streaming', title: 'Streaming pipeline',
    takeaway: 'Real time, replay or several consumers → Kinesis Data Streams; load into S3, Redshift or OpenSearch with no code → Firehose.',
    check: {
      q: 'Clickstream events must land in S3 as Parquet files in near real time, with the least development effort. What should be used?',
      opts: [
        'Kinesis Data Streams with a custom KCL consumer that writes Parquet.',
        'An SQS queue with a Lambda function writing to S3.',
        'Amazon Data Firehose with record format conversion to Parquet.',
        'Amazon MSK with a self-managed Kafka Connect cluster.'
      ],
      answer: 2,
      why: 'Firehose buffers, converts to Parquet and delivers to S3 with no code to run. The other options all mean writing or operating a consumer.'
    },
    svg: d.render(),
    caption: 'Kinesis Data Streams keeps every record for the retention period, so many consumers read the same data independently and any of them can replay it. Firehose is the no-code delivery pipe from a stream, or straight from producers, into storage and analytics services.',
    legend: [['in', 'Records'], ['data', 'Delivery'], ['alt', 'Direct to Firehose']],
    pair: [
      ['Data Streams or Firehose?', table(['', 'Kinesis Data Streams', 'Data Firehose'], [
        ['You manage', 'Shards (or on-demand mode), consumers', 'Nothing, fully managed'],
        ['Latency', 'Real time (~70 ms to 200 ms)', 'Near real time (buffers 0 to 900 s)'],
        ['Replay', 'Yes, within retention', 'No'],
        ['Consumers', 'Your code: Lambda, Flink, KCL apps', 'Delivers to S3, Redshift, OpenSearch, HTTP endpoints'],
        ['Transforms', 'In your consumer', 'Lambda transform, Parquet conversion']
      ])],
      ['Exam points', ul([
        '"Replay", "several consumers", "ordering per key", "real time" → Data Streams. "Load into S3/Redshift/OpenSearch with no code" → Firehose.',
        'Shard limits: 1 MB/s or 1,000 records/s in, 2 MB/s out shared; <b>enhanced fan-out</b> gives each consumer its own 2 MB/s per shard.',
        'Order is kept per <b>partition key</b> (per shard); a hot key overloads one shard.',
        'Real-time SQL or windowed aggregations on a stream → Managed Service for Apache Flink. Kafka compatibility → Amazon MSK.'
      ])]
    ]
  });
}

// ---- 15. Data lake
{
  const d = diagram('d15', 960, 430, 'Data lands as-is in an S3 raw zone. A Glue crawler infers the schemas into the Glue Data Catalog, and a Glue ETL job cleans the data and writes partitioned Parquet to a curated zone. Athena queries the curated data in place using the catalog, Lake Formation enforces column and row permissions, and QuickSight builds dashboards on Athena.');
  const src = d.node(20, 60, 'Sources', { w: 170, sub: 'apps, DMS, Firehose' });
  const raw = d.node(240, 60, 'S3 raw zone', { icon: 's3', w: 200, sub: 'as landed: JSON, CSV' });
  const crawler = d.node(240, 200, 'Glue crawler', { icon: 'glue', w: 200, sub: 'infers schemas' });
  const cat = d.node(240, 330, 'Glue Data Catalog', { icon: 'glue', w: 200, sub: 'tables, partitions' });
  const etl = d.node(500, 60, 'Glue ETL job', { icon: 'glue', w: 190, sub: 'clean, convert' });
  const cur = d.node(745, 60, 'S3 curated zone', { icon: 's3', w: 195, sub: 'Parquet, partitioned' });
  const lf = d.node(500, 230, 'Lake Formation', { icon: 'lakeformation', w: 190, sub: 'column, row grants' });
  const ath = d.node(745, 200, 'Athena', { icon: 'athena', w: 195, sub: 'SQL in place' });
  const qs = d.node(745, 330, 'QuickSight', { icon: 'quicksight', w: 195, sub: 'dashboards' });
  d.edge([R(src), L(raw)], 'in');
  d.edge([R(raw), L(etl)], 'in');
  d.edge([R(etl), L(cur)], 'in', { label: 'writes', lx: 717, ly: 79 });
  d.edge([B(raw), T(crawler)], 'data', { label: 'scans', lx: 350, ly: 160, anchor: 'start' });
  d.edge([B(crawler), T(cat)], 'data', { label: 'writes tables', lx: 350, ly: 295, anchor: 'start' });
  d.edge([B(cur), T(ath)], 'data', { label: 'reads', lx: 852, ly: 160, anchor: 'start' });
  d.edge([R(cat), [470, cat.cy], [470, 395], [ath.x - 25, 395], [ath.x - 25, ath.cy + 8], L(ath, ath.cy + 8)], 'alt', { label: 'schemas', lx: 600, ly: 390 });
  d.edge([R(lf), [ath.x - 40, lf.cy], [ath.x - 40, ath.cy - 8], L(ath, ath.cy - 8)], 'alt', { label: 'enforces grants', lx: 712, ly: 282, anchor: 'start' });
  d.edge([B(ath), T(qs)], 'in', { label: 'queries', lx: 852, ly: 315, anchor: 'start' });
  add('g-data', {
    id: 'datalake', title: 'Data lake on S3',
    takeaway: 'S3 stores the data, Glue catalogs it, and Athena queries it in place; Parquet plus partitions cut the bytes scanned.',
    check: {
      q: 'Athena queries on daily JSON logs in S3 are slow and expensive. Most queries filter on the date and read only a few columns. What reduces cost the most?',
      opts: [
        'Move the objects to S3 Standard-IA.',
        'Load the logs into an RDS database.',
        'Raise the Athena workgroup\'s query concurrency.',
        'Convert the data to Parquet, partitioned by date.'
      ],
      answer: 3,
      why: 'Athena bills per byte scanned. Partitions skip the dates a query does not need, and a columnar format reads only the needed columns. Standard-IA raises read costs.'
    },
    svg: d.render(),
    caption: 'Storage and compute stay separate: S3 holds the data in zones, the Glue Data Catalog holds the schemas, and serverless engines query in place. Partitioned Parquet makes Athena read only the columns and dates a query needs.',
    legend: [['in', 'Data flow'], ['data', 'Reads and writes'], ['alt', 'Metadata and permissions']],
    cards: [
      ['Exam points', ul([
        'Athena is slow and expensive on raw JSON → convert to <b>Parquet or ORC</b>, compress, and <b>partition</b> by date; you pay per TB scanned.',
        '"Schemas unknown", "catalog the data" → Glue crawler + Data Catalog. Serverless ETL → Glue jobs; big Spark/Hadoop clusters you tune → EMR.',
        'Different teams may see different columns or rows of one table → <b>Lake Formation</b> grants, not separate copies or bucket policies.',
        'Join warehouse tables with S3 data without loading it → Redshift Spectrum. Fast dashboards for many users → QuickSight with SPICE.'
      ])]
    ]
  });
}

// ---- 16. Event-driven S3 processing
{
  const d = diagram('d16', 960, 340, 'A client uploads a file to an S3 upload bucket with a presigned URL. The ObjectCreated event invokes a Lambda function, which writes its result to a separate results bucket. Heavy jobs instead go from the event to an SQS queue, where AWS Batch or ECS workers process them and write to the results bucket.');
  const app = d.node(20, 60, 'Client', { w: 165, sub: 'presigned URL' });
  const up = d.node(250, 60, 'Upload bucket', { icon: 's3', w: 200, sub: 'uploads/' });
  const fn = d.node(550, 60, 'Lambda', { icon: 'lambda', w: 180, sub: 'thumbnails, metadata' });
  const res = d.node(790, 60, 'Results bucket', { icon: 's3', w: 150, sub: 'a different bucket' });
  const q = d.node(550, 220, 'SQS queue', { icon: 'sqs', w: 180, sub: 'buffers heavy jobs' });
  const batch = d.node(790, 220, 'AWS Batch or ECS', { icon: 'batch', w: 150, sub: 'long video jobs' });
  d.edge([R(app), L(up)], 'in', { label: 'PUT', lx: 217, ly: 76 });
  d.edge([R(up), L(fn)], 'in', { label: 'ObjectCreated', lx: 500, ly: 76 });
  d.edge([R(fn), L(res)], 'data', { label: 'writes', lx: 760, ly: 76 });
  d.edge([B(up), [up.cx, q.cy], L(q)], 'in', { label: 'or event → queue', lx: 360, ly: 236 });
  d.edge([R(q), L(batch)], 'in', { label: 'poll', lx: 760, ly: 236 });
  d.edge([T(batch), B(res, batch.cx)], 'data');
  d.label(480, 318, 'writing back to the same bucket and prefix would trigger the function again, forever', { cls: 'd-lbl' });
  add('g-data', {
    id: 's3events', title: 'Event-driven S3 processing',
    takeaway: 'React to each upload → an S3 event notification to Lambda (or to SQS for heavy jobs); clients upload directly with presigned URLs.',
    check: {
      q: 'Each image uploaded to S3 needs a thumbnail within seconds. Upload volume is unpredictable, and operations must be minimal. What design fits?',
      opts: [
        'A cron job on EC2 that lists the bucket every minute.',
        'An AWS Batch job scheduled every hour.',
        'S3 replication to a thumbnails bucket.',
        'An S3 event notification that invokes Lambda, which writes the thumbnail to a different bucket.'
      ],
      answer: 3,
      why: 'Event notifications react to each object with no polling, and Lambda scales with the uploads. Writing to a different bucket stops the function from triggering itself; replication only copies objects.'
    },
    svg: d.render(),
    caption: 'Uploads go straight to S3, never through your servers, and each new object triggers its own processing. Short work runs in Lambda; anything longer or heavier is queued for Batch or ECS.',
    legend: [['in', 'Upload and trigger'], ['data', 'Results']],
    cards: [
      ['Exam points', ul([
        '"Process each upload as it arrives" with variable volume → S3 event notification → Lambda. Polling the bucket on a schedule is the wrong answer.',
        'Lambda stops at 15 minutes and 10 GB of memory; longer jobs → SQS + Batch, ECS on Fargate, or Step Functions.',
        'Let clients upload directly with <b>presigned URLs</b> (or Cognito identity pool credentials); large files use multipart upload.',
        'Fan the same event out to several targets or filter by content → send S3 events to EventBridge instead.'
      ])]
    ]
  });
}

// ---- 17. Read scaling and caching
{
  const d = diagram('d17', 960, 420, 'App servers read from ElastiCache first and, on a miss, from RDS read replicas through the reader endpoint, then put the result in the cache with a time to live. All writes go to the RDS primary, which replicates asynchronously to the replicas. Thousands of Lambda functions reach the primary through RDS Proxy, which pools their connections.');
  const app = d.node(20, 120, 'App servers', { icon: 'ec2', w: 190, sub: 'EC2 or containers' });
  const fns = d.node(20, 310, 'Lambda functions', { icon: 'lambda', w: 190, sub: 'thousands at once' });
  const cache = d.node(330, 20, 'ElastiCache', { icon: 'elasticache', w: 210, sub: 'cache-aside, TTL' });
  const proxy = d.node(330, 310, 'RDS Proxy', { icon: 'rdsproxy', w: 210, sub: 'pools connections' });
  const primary = d.node(680, 120, 'RDS primary', { icon: 'rds', w: 240, sub: 'writer endpoint' });
  const reps = d.node(680, 230, 'Read replicas', { icon: 'rds', w: 240, sub: 'reader endpoint' });
  d.edge([T(app, 115), [115, cache.cy], L(cache)], 'in', { both: true, label: '1 get · 3 set with TTL', lx: 220, ly: 37 });
  d.edge([R(app, app.cy + 10), [620, app.cy + 10], [620, reps.cy], L(reps)], 'data', { label: '2 on a miss: read', lx: 420, ly: 156 });
  d.edge([R(app, app.cy - 10), L(primary, app.cy - 10)], 'data', { label: 'writes', lx: 420, ly: 126 });
  d.edge([R(fns), L(proxy, fns.cy)], 'in');
  d.edge([R(proxy), [650, proxy.cy], [650, primary.b - 10], L(primary, primary.b - 10)], 'data', { label: 'a few pooled connections', lx: 600, ly: 350 });
  d.edge([B(primary, 880), T(reps, 880)], 'alt', { label: 'async', lx: 890, ly: 205, anchor: 'start' });
  add('g-db', {
    id: 'readscale', title: 'Read scaling and caching',
    takeaway: 'Repeated reads → a cache; heavy reports → read replicas; too many connections from Lambda → RDS Proxy.',
    check: {
      q: 'Thousands of concurrent Lambda functions exhaust the connection limit of an RDS for MySQL database. What fixes this with the least code change?',
      opts: [
        'Put RDS Proxy between the functions and the database.',
        'Move to a larger DB instance class.',
        'Add read replicas.',
        'Turn on Multi-AZ.'
      ],
      answer: 0,
      why: 'RDS Proxy pools and reuses connections, so thousands of functions share a few. A bigger instance only raises the limit; replicas help reads, not connection counts; Multi-AZ is for availability.'
    },
    svg: d.render(),
    caption: 'Hot reads stop at the cache, the rest spread over read replicas, and the primary only takes writes. Short-lived Lambda functions share a small pool of connections through RDS Proxy instead of opening one each.',
    legend: [['in', 'Requests'], ['data', 'Database traffic'], ['alt', 'Replication']],
    cards: [
      ['Exam points', ul([
        '"Same queries thousands of times", "can tolerate slightly stale data" → ElastiCache (lazy loading / cache-aside with a TTL). Always-fresh cache → write-through.',
        '"Reports slow down the database" → a read replica (asynchronous; the Multi-AZ standby of an instance deployment cannot serve reads).',
        '"Too many connections" from Lambda, or faster failover with no app change → <b>RDS Proxy</b>.',
        'DynamoDB with microsecond reads and no code rewrite → <b>DAX</b>, not ElastiCache. Redis vs Memcached: Redis for persistence, replication, sorted sets; Memcached for simple multi-threaded caching.'
      ])]
    ]
  });
}

// ---- 18. Multi-Region data
{
  const d = diagram('d18', 960, 420, 'Left: Aurora Global Database. The primary Region has the writer and readers; storage replicates to a read-only secondary cluster in another Region in under a second, and the secondary can be promoted during a Regional outage. Right: DynamoDB global tables. Applications in two Regions read and write their local replica, and changes replicate both ways in about a second, with the last writer winning.');
  d.zone(20, 20, 450, 380, { kind: 'group', label: 'Aurora Global Database' });
  d.zone(500, 20, 440, 380, { kind: 'group', label: 'DynamoDB global tables' });
  d.zone(35, 50, 200, 330, { kind: 'region', label: 'Primary Region' });
  d.zone(255, 50, 200, 330, { kind: 'region', label: 'Secondary Region' });
  const w = d.node(55, 90, 'Writer', { icon: 'aurora', w: 160 });
  const r1 = d.node(55, 160, 'Readers', { icon: 'aurora', w: 160 });
  const s1 = d.node(55, 290, 'Cluster storage', { w: 160 });
  const r2 = d.node(275, 90, 'Read-only cluster', { icon: 'aurora', w: 160, sub: 'promote on outage' });
  const s2 = d.node(275, 290, 'Cluster storage', { w: 160 });
  d.edge([B(w), T(r1)], 'data', { head: false });
  d.edge([B(r1), T(s1)], 'data', { both: true });
  d.edge([R(s1), L(s2)], 'in', { label: '< 1 s', lx: 245, ly: 302 });
  d.edge([T(s2), B(r2)], 'data');
  d.edge([L(r2, r2.cy - 10), [245, r2.cy - 10], [245, w.cy - 6], R(w, w.cy - 6)], 'alt');
  d.label(245, 368, 'RPO ~1 s · RTO ~1 min', { cls: 'd-lbl' });
  const aA = d.node(530, 70, 'App · us-east-1', { icon: 'ec2', w: 185 });
  const aB = d.node(740, 70, 'App · eu-west-1', { icon: 'ec2', w: 185 });
  const tA = d.node(530, 230, 'Table replica', { icon: 'dynamodb', w: 185, sub: 'reads and writes' });
  const tB = d.node(740, 230, 'Table replica', { icon: 'dynamodb', w: 185, sub: 'reads and writes' });
  d.edge([B(aA), T(tA)], 'data', { both: true });
  d.edge([B(aB), T(tB)], 'data', { both: true });
  d.edge([R(tA), L(tB)], 'in', { both: true });
  d.label(727, 225, '~1 s', { cls: 'd-lbl d-halo' });
  d.label(720, 340, 'active-active · last writer wins', { cls: 'd-lbl' });
  add('g-db', {
    id: 'multiregion', title: 'Multi-Region data',
    takeaway: 'Relational data with a recovery point of seconds across Regions → Aurora Global Database; writes in every Region → DynamoDB global tables.',
    check: {
      q: 'Users in three Regions must write to the same data locally with single-digit millisecond latency. Which database fits?',
      opts: [
        'Aurora Global Database.',
        'RDS with cross-Region read replicas.',
        'A single DynamoDB table with DAX in each Region.',
        'DynamoDB global tables.'
      ],
      answer: 3,
      why: 'Global tables accept writes in every replica Region. Aurora Global Database and RDS read replicas have one writer Region, so remote writes travel there, and DAX caches reads only.'
    },
    svg: d.render(),
    caption: 'Aurora Global Database keeps one writer and copies storage to other Regions in about a second, ready to promote. DynamoDB global tables let every Region write, replicating changes to the others.',
    legend: [['in', 'Cross-Region replication'], ['data', 'Local reads and writes'], ['alt', 'Writes forwarded to the primary']],
    cards: [
      ['Exam points', ul([
        'Relational, "RPO of seconds, RTO of a minute", "low-latency reads in another Region" → <b>Aurora Global Database</b> (managed failover, or switchover with no data loss).',
        'Key-value, "users in several Regions must write locally", "active-active" → <b>DynamoDB global tables</b>.',
        'Cheaper but slower: RDS cross-Region read replica (promote manually) or cross-Region snapshot and backup copies.',
        'Data residency: global tables replicate everything to every replica Region, so check where data is allowed to live.'
      ])]
    ]
  });
}

// ---- 19. Disaster recovery strategies
{
  const d = diagram('d19', 980, 495, 'Four disaster recovery strategies side by side, each with a live primary Region and a DR Region. Backup and restore keeps only backups in the DR Region. Pilot light keeps a replicated database and templates, with no servers running. Warm standby runs a small but complete copy. Multi-site active-active runs full capacity in both Regions. From left to right, recovery gets faster and the cost grows.');
  const cols = [
    ['Backup and restore', [['Backups, snapshots', 'backup', 'copied by AWS Backup'], ['Nothing running', null, 'rebuilt from templates']], 'backup copy', 'RPO hours · RTO hours', '$'],
    ['Pilot light', [['Database replica', 'rds', 'running'], ['AMIs + IaC', 'cfn', 'servers off']], 'replication', 'RPO minutes · RTO tens of minutes', '$$'],
    ['Warm standby', [['Database replica', 'rds', 'running'], ['Small app fleet', 'ec2', 'running, scales up']], 'replication', 'RPO seconds · RTO minutes', '$$$'],
    ['Multi-site active-active', [['Database', 'dynamodb', 'writes in both'], ['Full app fleet', 'ec2', 'serving traffic']], 'two-way', 'RPO near 0 · RTO near 0', '$$$$']
  ];
  cols.forEach(([title, dr, link, metrics, cost], i) => {
    const x0 = 20 + i * 240;
    d.zone(x0, 20, 220, 430, { kind: 'group', label: title });
    const prim = d.node(x0 + 15, 55, 'Primary Region', { w: 190, sub: 'full stack, live' });
    d.zone(x0 + 10, 175, 200, 195, { kind: 'region', label: 'DR Region' });
    dr.forEach(([name, icon, sub], k) => d.node(x0 + 22, 205 + k * 78, name, { icon: icon || undefined, w: 176, sub }));
    d.edge([B(prim), [prim.cx, 173]], i === 3 ? 'in' : 'data', { label: link, lx: prim.cx + 8, ly: 148, anchor: 'start', both: i === 3 });
    d.label(x0 + 110, 398, metrics, { cls: 'd-lbl' });
    d.label(x0 + 110, 425, 'cost ' + cost, { cls: 'd-title' });
  });
  d.edge([[40, 480], [940, 480]], 'alt');
  d.label(490, 474, 'faster recovery, higher cost', { cls: 'd-lbl d-halo' });
  add('g-dr', {
    id: 'dr', title: 'Disaster recovery strategies',
    takeaway: 'Read the RPO and RTO, then pick the cheapest strategy that meets both: backup and restore → pilot light → warm standby → active-active.',
    check: {
      q: 'A database-backed application needs a recovery point of 5 minutes and a recovery time of 1 hour in another Region, at the lowest cost. Which strategy?',
      opts: [
        'Backup and restore from cross-Region snapshots.',
        'Warm standby with a scaled-down copy of the full stack running.',
        'Pilot light: replicate the database continuously and start the application tier from AMIs and templates during a disaster.',
        'Multi-site active-active.'
      ],
      answer: 2,
      why: 'Continuous replication meets a 5-minute RPO, and launching the app tier fits in an hour. Snapshots give an RPO of hours; warm standby and active-active also work but cost more.'
    },
    svg: d.render(),
    caption: 'The strategies differ in how much of the DR Region is already running. Pick the cheapest one whose recovery point and recovery time meet the requirement.',
    legend: [['data', 'One-way copy or replication'], ['in', 'Two-way, both Regions live']],
    pair: [
      ['Choosing one', table(['Strategy', 'Already in the DR Region', 'Recovery'], [
        ['Backup and restore', 'Backups only', 'Restore data, deploy everything (hours)'],
        ['Pilot light', 'Replicated data, AMIs, IaC', 'Launch the app tier, promote the DB (tens of minutes)'],
        ['Warm standby', 'A small working copy', 'Scale it up, fail over DNS (minutes)'],
        ['Multi-site active-active', 'Full production', 'DNS already spreads traffic (near zero)']
      ])],
      ['Exam points', ul([
        'Read the RPO and RTO in the question, then choose the <b>cheapest</b> strategy that meets both.',
        'RPO is how much data you can lose (replication frequency); RTO is how long you can be down (what must start).',
        'Route 53 failover routing with health checks moves traffic; multi-site uses weighted or latency routing in both Regions.',
        'Backups for ransomware: AWS Backup copies to <b>another account</b> with Vault Lock. Server replication for DR: AWS Elastic Disaster Recovery.'
      ])]
    ]
  });
}

// ---- 20. Hybrid storage
{
  const d = diagram('d20', 960, 450, 'On-premises systems reach AWS storage through three Storage Gateway types and a DataSync agent. File clients use NFS or SMB shares on a File Gateway, which stores files as S3 objects. App servers mount iSCSI volumes on a Volume Gateway, backed by S3 with EBS snapshots. Backup software writes to a Tape Gateway virtual tape library, archived to S3 Glacier Deep Archive. A DataSync agent copies a NAS to S3, EFS or FSx on a schedule.');
  d.zone(20, 20, 555, 395, { kind: 'onprem', label: 'Corporate data center' });
  d.zone(625, 20, 315, 395, { kind: 'region', label: 'AWS Region' });
  const rows = [
    ['File clients', 'NFS or SMB', 'File Gateway', 'storagegw', 'local cache', 'S3 bucket', 's3', 'one object per file', 'NFS / SMB'],
    ['App servers', 'iSCSI block storage', 'Volume Gateway', 'storagegw', 'cached or stored', 'S3 + EBS snapshots', 'ebs', 'restore as EBS volumes', 'iSCSI'],
    ['Backup software', 'expects a tape library', 'Tape Gateway', 'storagegw', 'virtual tape library', 'Glacier Deep Archive', 'glacier', 'archived tapes', 'iSCSI VTL'],
    ['NAS or file server', 'data to migrate', 'DataSync agent', 'datasync', 'scheduled, verified', 'S3, EFS or FSx', 'efs', 'migration target', 'NFS / SMB']
  ];
  rows.forEach(([src, srcSub, gw, gwIcon, gwSub, dst, dstIcon, dstSub, proto], i) => {
    const y = 60 + i * 88;
    const a = d.node(40, y, src, { w: 205, sub: srcSub });
    const g = d.node(330, y, gw, { icon: gwIcon, w: 225, sub: gwSub });
    const t = d.node(645, y, dst, { icon: dstIcon, w: 275, sub: dstSub });
    d.edge([R(a), L(g)], 'data', { label: proto, lx: 288, ly: y + 20 });
    d.edge([R(g), L(t)], 'in', { label: i === 3 ? 'TLS' : 'HTTPS to AWS', lx: 600, ly: y + 20 });
  });
  d.label(480, 437, 'a huge one-time move over a slow link → AWS Snowball: ship the data instead', { cls: 'd-lbl' });
  add('g-storage', {
    id: 'hybridstorage', title: 'Hybrid storage and data transfer',
    takeaway: 'Keep the on-premises protocol and store the data in AWS → Storage Gateway (File, Volume, Tape); move data → DataSync.',
    check: {
      q: 'A company\'s backup software writes to a physical tape library. It wants to stop handling tapes and archive to AWS without changing the backup software. What should it use?',
      opts: [
        'S3 File Gateway.',
        'AWS DataSync to S3 Glacier.',
        'Volume Gateway in stored mode.',
        'Tape Gateway, archiving virtual tapes to S3 Glacier Deep Archive.'
      ],
      answer: 3,
      why: 'Tape Gateway presents a virtual tape library over iSCSI, so the backup software sees tapes. File and Volume Gateway present shares and disks, and DataSync is for copying files.'
    },
    svg: d.render(),
    caption: 'Each Storage Gateway type keeps the protocol your servers already speak and puts the data in AWS behind it, with a local cache for speed. DataSync is for moving data, once or on a schedule, not for serving it.',
    legend: [['data', 'Local protocol'], ['in', 'To AWS']],
    pair: [
      ['Which one?', table(['Need', 'Service'], [
        ['Keep an NFS/SMB share, store files in S3 (lifecycle rules apply)', 'S3 File Gateway'],
        ['Windows SMB share with AD, low latency, in FSx', 'FSx File Gateway'],
        ['iSCSI volumes, all data in AWS, hot data cached locally', 'Volume Gateway, <b>cached</b> mode'],
        ['iSCSI volumes, all data local, backed up to AWS', 'Volume Gateway, <b>stored</b> mode'],
        ['Replace physical tapes, keep the backup software', 'Tape Gateway'],
        ['Copy or sync file data to S3/EFS/FSx', 'DataSync'],
        ['Tens of TB or more, too slow over the network', 'Snowball Edge']
      ])],
      ['Exam points', ul([
        'Work out transfer time: 1 Gbps moves about 10 TB a day. If the network cannot finish in time, ship it with Snowball.',
        'DataSync handles scheduling, encryption in transit, integrity checks and only-changed-files; it beats scripting rsync or the CLI.',
        'SFTP clients that must land files in S3 → AWS Transfer Family, not a gateway.',
        'Online database migration → DMS (with SCT for a different engine), not DataSync.'
      ])]
    ]
  });
}

// ---- 21. Shared file systems
{
  const d = diagram('d21', 960, 400, 'Three shared file systems side by side. Amazon EFS serves NFS to Linux instances in several Availability Zones through a mount target in each. FSx for Windows File Server serves SMB to Windows instances, joined to Active Directory, in a Multi-AZ deployment. FSx for Lustre serves a high-performance computing cluster and is linked to an S3 bucket for import and export.');
  const cols = [
    ['Amazon EFS', 'Linux, NFS', [['EC2 · AZ A', 'ec2'], ['EC2 · AZ B', 'ec2']], ['Amazon EFS', 'efs', 'mount target per AZ'], ['Lifecycle to EFS IA', null, 'cheaper for cold files'], 'NFS'],
    ['FSx for Windows File Server', 'Windows, SMB', [['Windows EC2', 'ec2'], ['Managed AD', 'dirsvc']], ['FSx for Windows', 'fsxwin', 'Multi-AZ, ACLs'], ['DFS, shadow copies', null, 'Windows features'], 'SMB'],
    ['FSx for Lustre', 'HPC, ML training', [['HPC cluster', 'ec2'], ['ML training', 'sagemaker']], ['FSx for Lustre', 'fsxlustre', 'scratch or persistent'], ['S3 bucket', 's3', 'linked: import / export'], 'Lustre']
  ];
  cols.forEach(([title, sub, clients, fsys, extra, proto], i) => {
    const x0 = 20 + i * 315;
    d.zone(x0, 20, 295, 360, { kind: 'group', label: title });
    d.label(x0 + 14, 60, sub, { anchor: 'start', cls: 'd-lbl' });
    const cs = clients.map(([n, ic], k) => d.node(x0 + 15 + k * 137, 80, n, { icon: ic, w: 128 }));
    const f = d.node(x0 + 35, 200, fsys[0], { icon: fsys[1], w: 225, sub: fsys[2] });
    const e = d.node(x0 + 35, 300, extra[0], { icon: extra[1] || undefined, w: 225, sub: extra[2] });
    if (i === 1) {
      d.edge([B(cs[0]), [cs[0].cx, f.y]], 'in', { label: proto, lx: cs[0].cx + 8, ly: 165, anchor: 'start' });
      d.edge([B(cs[1]), [cs[1].cx, f.y]], 'alt', { label: 'joins domain', lx: cs[1].cx + 8, ly: 165, anchor: 'start' });
    } else {
      cs.forEach((c, k) => d.edge([B(c), [c.cx, f.y]], 'in', k === 0 ? { label: proto, lx: c.cx + 8, ly: 165, anchor: 'start' } : {}));
    }
    d.edge([B(f), T(e)], i === 2 ? 'data' : 'alt', { both: i === 2 });
  });
  add('g-storage', {
    id: 'filesystems', title: 'Shared file systems',
    takeaway: 'Linux and NFS → EFS; Windows, SMB and Active Directory → FSx for Windows; HPC on data in S3 → FSx for Lustre.',
    check: {
      q: 'A Windows application on EC2 in two AZs needs a shared file system with SMB, NTFS permissions and Active Directory integration. What should be used?',
      opts: [
        'Amazon FSx for Windows File Server, Multi-AZ.',
        'Amazon EFS.',
        'Amazon FSx for Lustre.',
        'An EBS io2 volume with Multi-Attach.'
      ],
      answer: 0,
      why: 'FSx for Windows speaks SMB and joins the domain. EFS is NFS for Linux, Lustre is for HPC, and Multi-Attach works only within one AZ and needs a cluster-aware file system.'
    },
    svg: d.render(),
    caption: 'Pick the shared file system by the clients\' operating system and protocol first, then by performance. Block storage (EBS) is not shared, apart from io1/io2 Multi-Attach within one AZ.',
    legend: [['in', 'Clients mount'], ['data', 'Linked to S3'], ['alt', 'Supporting feature']],
    cards: [
      ['Which one?', table(['Need', 'Choose'], [
        ['Linux, NFS, many instances across AZs, grows on its own', 'Amazon EFS (Standard, or One Zone to save cost)'],
        ['Windows, SMB, NTFS permissions, Active Directory', 'FSx for Windows File Server'],
        ['HPC or ML, hundreds of GB/s, sub-millisecond, data in S3', 'FSx for Lustre'],
        ['NFS + SMB + iSCSI together, NetApp features, migrate from ONTAP', 'FSx for NetApp ONTAP'],
        ['ZFS features, NFS, very low latency', 'FSx for OpenZFS']
      ])],
      ['Exam points', ul([
        'EFS works only with Linux (NFS); Windows file shares → FSx for Windows. EFS lifecycle to <b>Infrequent Access</b> cuts cost for files no one opens.',
        'FSx for Lustre <b>scratch</b> is temporary and cheapest; <b>persistent</b> replicates within an AZ for long-running work.',
        'Containers on Fargate or ECS that need shared persistent files → mount EFS.'
      ])]
    ]
  });
}

// ---- 22. S3 lifecycle and protection
{
  const d = diagram('d22', 960, 450, 'Top: an object\'s lifecycle in S3. It starts in S3 Standard, moves to Standard-IA after 30 days, to Glacier Flexible Retrieval after 90 days and to Glacier Deep Archive after 180 days, and expires after 7 years. Bottom: protection. Versioning turns deletes into delete markers, Object Lock blocks deletes and overwrites for a retention period, MFA Delete needs a second factor, and Cross-Region Replication copies new objects to a bucket in another Region and account.');
  d.zone(20, 20, 920, 120, { kind: 'group', label: 'Lifecycle rules: cheaper storage as data cools' });
  const tiers = [['S3 Standard', 'frequent access'], ['Standard-IA', 'monthly, ms access'], ['Glacier Flexible', 'minutes to hours'], ['Deep Archive', 'within 12 hours'], ['Expire', 'deleted']];
  const gaps = ['30 days', '90 days', '180 days', '7 years'];
  let prev = null;
  tiers.forEach(([t, s], i) => {
    const n = d.node(35 + i * 182, 60, t, { icon: i < 4 ? (i < 2 ? 's3' : 'glacier') : undefined, w: 158, sub: s });
    if (prev) d.edge([R(prev), L(n)], 'in', { label: gaps[i - 1], lx: (prev.r + n.x) / 2, ly: 55 });
    prev = n;
  });
  d.zone(20, 170, 920, 260, { kind: 'group', label: 'Protection' });
  const ver = d.node(40, 210, 'Versioning', { w: 300, sub: 'a delete only adds a delete marker' });
  const lock = d.node(40, 285, 'Object Lock', { w: 300, sub: 'WORM: compliance or governance mode' });
  const mfa = d.node(40, 360, 'MFA Delete', { w: 300, sub: 'second factor to delete a version' });
  const src = d.node(420, 250, 'Source bucket', { icon: 's3', w: 200, sub: 'versioning on' });
  const dst = d.node(720, 250, 'Replica bucket', { icon: 's3', w: 200, sub: 'other Region, other account' });
  d.edge([R(ver), [380, ver.cy], [380, src.cy], L(src)], 'alt', { head: false });
  d.edge([R(lock), [380, lock.cy]], 'alt', { head: false });
  d.edge([R(mfa), [380, mfa.cy], [380, src.cy]], 'alt', { head: false });
  d.edge([R(src), L(dst)], 'data', { label: 'Cross-Region Replication', lx: 670, ly: 245 });
  d.label(670, 330, 'new objects only · Batch Replication for existing ones', { cls: 'd-lbl' });
  d.label(670, 350, 'Replication Time Control: 99.99% within 15 minutes', { cls: 'd-lbl' });
  add('g-storage', {
    id: 's3protect', title: 'S3 lifecycle and protection',
    takeaway: 'Lifecycle rules move data to cheaper classes as it ages; versioning and Object Lock stop deletion; replication keeps a copy elsewhere.',
    check: {
      q: 'Audit records in S3 must not be deleted or overwritten by anyone, including the root user, for 7 years. What should be used?',
      opts: [
        'S3 Object Lock in governance mode.',
        'Versioning with MFA Delete.',
        'A bucket policy that denies s3:DeleteObject.',
        'S3 Object Lock in compliance mode with a 7-year retention period.'
      ],
      answer: 3,
      why: 'Compliance mode cannot be shortened or removed by any user, root included. Governance mode can be bypassed with a permission, the root user can still delete with MFA Delete, and a bucket policy can be edited.'
    },
    svg: d.render(),
    caption: 'Lifecycle rules move each object to cheaper storage as it ages and delete it at the end. Versioning, Object Lock and MFA Delete stop accidental or malicious loss, and replication keeps a copy in another Region or account.',
    legend: [['in', 'Lifecycle transition'], ['data', 'Replication'], ['alt', 'Bucket settings']],
    pair: [
      ['Storage classes', table(['Class', 'Retrieval', 'Use it for'], [
        ['Standard', 'Milliseconds', 'Frequently read data'],
        ['Intelligent-Tiering', 'Milliseconds (archive tiers optional)', 'Unknown or changing access, no retrieval fees'],
        ['Standard-IA / One Zone-IA', 'Milliseconds, per-GB retrieval fee', 'Read about monthly; One Zone for re-creatable data'],
        ['Glacier Instant Retrieval', 'Milliseconds', 'Read about quarterly'],
        ['Glacier Flexible Retrieval', 'Minutes to hours', 'Archives, backups'],
        ['Glacier Deep Archive', 'Within 12 hours (48 for bulk)', 'Compliance records kept for years']
      ])],
      ['Exam points', ul([
        'IA classes bill at least <b>30 days</b> and <b>128 KB</b> per object; Glacier tiers have 90 and 180-day minimums. Tiny or short-lived objects can cost more there.',
        '"No one, not even root, can delete for 7 years" → Object Lock <b>compliance</b> mode. Governance mode can be bypassed with a special permission. A legal hold has no end date.',
        'Replication requires versioning on both buckets and does not copy existing objects unless you run Batch Replication.',
        'Clean up failed multipart uploads with an <code>AbortIncompleteMultipartUpload</code> lifecycle rule.'
      ])]
    ]
  });
}

// ---- 23. Multi-account landing zone
{
  const d = diagram('d23', 980, 470, 'An AWS Organizations management account with Control Tower governs three organizational units. The Security OU holds a log archive account, which receives the organization CloudTrail trail and Config logs, and an audit account that administers GuardDuty and Security Hub. The Workloads OU holds production and development accounts and the Sandbox OU holds experiment accounts, each OU with its own service control policies. Staff sign in once through IAM Identity Center, federated with the corporate identity provider, and get permission sets in each account.');
  const mgmt = d.node(355, 15, 'Management account', { icon: 'orgs', w: 270, sub: 'Organizations, Control Tower, billing' });
  const ous = [
    ['Security OU', 20, [['Log archive', 's3', 'org CloudTrail, Config logs'], ['Audit', 'securityhub', 'GuardDuty, Security Hub admin']], 'SCP: no disabling CloudTrail'],
    ['Workloads OU', 340, [['Production', 'ec2', 'per app or team'], ['Development', 'ec2', 'per app or team']], 'SCP: approved Regions only'],
    ['Sandbox OU', 660, [['Sandbox', 'lambda', 'experiments'], ['Sandbox', 'lambda', 'budget alert + action']], 'SCP: deny costly services']
  ];
  const accts = [];
  ous.forEach(([name, x0, items, scp]) => {
    d.zone(x0, 115, 300, 230, { kind: 'group', label: name });
    d.label(x0 + 286, 135, scp, { anchor: 'end', cls: 'd-lbl' });
    items.forEach(([t, ic, sub], k) => accts.push(d.node(x0 + 20, 155 + k * 90, t, { icon: ic, w: 260, sub })));
    d.edge([[mgmt.cx, mgmt.b], [mgmt.cx, 95], [x0 + 150, 95], [x0 + 150, 113]], 'data');
  });
  const idp = d.node(20, 395, 'Corporate IdP', { w: 190, sub: 'Entra ID, Okta…' });
  const idc = d.node(300, 395, 'IAM Identity Center', { icon: 'idc', w: 250, sub: 'one sign-in, permission sets' });
  d.edge([R(idp), L(idc)], 'in', { label: 'SAML / SCIM', lx: 255, ly: 412 });
  d.edge([T(idc), [idc.cx, 372]], 'in', { head: false });
  d.edge([[170, 372], [810, 372]], 'in', { head: false });
  for (const x of [170, 490, 810]) d.edge([[x, 372], [x, 347]], 'in');
  d.label(650, 389, 'roles in every account', { cls: 'd-lbl' });
  add('g-security', {
    id: 'landingzone', title: 'Multi-account landing zone',
    takeaway: 'Many accounts with guardrails → Organizations and Control Tower; SCPs cap permissions but grant none; people sign in through IAM Identity Center.',
    check: {
      q: 'No one in the development accounts, administrators included, may use any Region except two approved ones. What enforces this?',
      opts: [
        'An IAM policy attached to every user and role.',
        'An SCP on the development OU that denies actions outside the approved Regions.',
        'An AWS Config rule that flags resources in other Regions.',
        'A permissions boundary on each administrator.'
      ],
      answer: 1,
      why: 'An SCP limits every principal in the member accounts, including the root user, and covers accounts added later. IAM policies and boundaries can be changed by administrators, and Config only detects.'
    },
    svg: d.render(),
    caption: 'Accounts are the strongest isolation boundary, so workloads, security tooling and logs each get their own. Policies attach to OUs and apply to every account in them, including accounts created later, and people sign in once to reach whichever accounts they are allowed into.',
    legend: [['data', 'Organization hierarchy'], ['in', 'Sign-in and access']],
    cards: [
      ['Exam points', ul([
        '"Set up many accounts with guardrails and a dashboard, with the least effort" → <b>Control Tower</b> (landing zone, Account Factory, preventive and detective controls).',
        '<b>SCPs</b> cap what any principal in an account can do, root included; they grant nothing on their own and never restrict the management account.',
        'Logs no one can tamper with → organization trail to a bucket in the <b>log archive</b> account, with Object Lock and log file validation.',
        'Workforce access to many accounts → <b>IAM Identity Center</b> with permission sets, not IAM users per account. Customers of your app → Cognito.',
        'Consolidated billing shares volume discounts, Reserved Instances and Savings Plans across the organization.'
      ])]
    ]
  });
}

// ---- 24. Cross-account access
{
  const d = diagram('d24', 960, 420, 'An application in Account A reaches an S3 bucket in Account B in two ways. With a role: it calls STS AssumeRole for a role in Account B whose trust policy names Account A and an external ID, receives temporary credentials and reads the bucket as that role. With a resource policy: the bucket policy grants Account A\'s role directly, so the application reads with its own identity. If the objects use SSE-KMS, the KMS key policy in Account B must also allow the caller to decrypt.');
  d.zone(20, 20, 300, 380, { kind: 'account', label: 'Account A · 1111 1111 1111' });
  d.zone(560, 20, 380, 380, { kind: 'account', label: 'Account B · 2222 2222 2222' });
  const app = d.node(45, 170, 'App role', { icon: 'iamrole', w: 250, sub: 'the caller' });
  const sts = d.node(345, 50, 'AWS STS', { icon: 'iam', w: 190, sub: 'temporary credentials' });
  const role = d.node(590, 50, 'Role: ReadReports', { icon: 'iamrole', w: 320, sub: 'trust policy: Account A + external ID' });
  const bucket = d.node(590, 190, 'Reports bucket', { icon: 's3', w: 320, sub: 'bucket policy' });
  const key = d.node(590, 315, 'KMS key', { icon: 'kms', w: 320, sub: 'key policy allows kms:Decrypt' });
  d.edge([T(app, 120), [120, sts.cy], L(sts)], 'in', { label: '1 AssumeRole', lx: 200, ly: 66 });
  d.edge([R(sts), L(role)], 'in', { label: 'trust', lx: 562, ly: 66 });
  d.edge([B(role, 680), T(bucket, 680)], 'in', { label: '2 read as the role', lx: 690, ly: 160, anchor: 'start' });
  d.edge([R(app, 205), L(bucket, 205)], 'data', { label: 'or: the bucket policy names Account A', lx: 445, ly: 225 });
  d.edge([B(bucket), T(key)], 'alt', { label: 'SSE-KMS objects', lx: 760, ly: 293, anchor: 'start' });
  add('g-security', {
    id: 'crossaccount', title: 'Cross-account access',
    takeaway: 'Cross-account access is either a role to assume (its trust policy decides who) or a resource policy; with SSE-KMS the key policy must allow it too.',
    check: {
      q: 'A third-party vendor needs read access to an S3 bucket in your account. What is the most secure approach?',
      opts: [
        'An IAM user whose access keys are given to the vendor.',
        'Presigned URLs regenerated and sent every week.',
        'A public bucket with an obscure name.',
        'An IAM role that trusts the vendor\'s account and requires an external ID.'
      ],
      answer: 3,
      why: 'The vendor assumes the role and gets temporary credentials; the external ID protects against the confused-deputy problem. Long-lived keys can leak, and presigned URLs do not suit ongoing access.'
    },
    svg: d.render(),
    caption: 'Either the caller becomes a role in the other account (its trust policy decides who may), or the resource\'s own policy lets the caller in as itself. Encrypted data adds a third gate: the KMS key policy.',
    legend: [['in', 'Assume a role'], ['data', 'Resource-based policy'], ['alt', 'Decryption check']],
    pair: [
      ['Role or resource policy?', table(['', 'Assume a role', 'Resource-based policy'], [
        ['Caller identity', 'Becomes the role; gives up its own permissions meanwhile', 'Keeps its own identity and permissions'],
        ['Works for', 'Any service', 'Services with resource policies: S3, SQS, SNS, KMS, Lambda, ECR…'],
        ['Third parties', 'Require an <b>external ID</b> in the trust policy', 'Name their account or role in the policy']
      ])],
      ['Exam points', ul([
        'A vendor needs access to your account → a role whose trust policy names the vendor\'s account and an <b>external ID</b> (confused-deputy protection). Never share access keys.',
        'Cross-account S3 downloads fail with AccessDenied though the bucket policy allows them → the objects use SSE-KMS and the <b>key policy</b> is missing the caller.',
        'Applications on EC2, Lambda or ECS get credentials from their own role (instance profile, execution role, task role), never stored keys.',
        'Find resources shared outside your organization → IAM Access Analyzer.'
      ])]
    ]
  });
}

// ---- 25. Edge security and threat detection
{
  const d = diagram('d25', 980, 450, 'Top row, protect: users and bots reach CloudFront, protected by an AWS WAF web ACL and Shield Advanced, and CloudFront forwards to an Application Load Balancer whose security group admits only CloudFront, in front of the application. Bottom row, detect and respond: CloudTrail, VPC Flow Logs and DNS logs feed GuardDuty, whose findings join Inspector and Macie findings in Security Hub; an EventBridge rule sends them to Lambda for remediation and SNS for alerts.');
  d.zone(20, 15, 940, 195, { kind: 'group', label: 'Protect' });
  d.zone(20, 235, 940, 200, { kind: 'group', label: 'Detect and respond' });
  const users = d.node(40, 125, 'Users and bots', { w: 160 });
  const cf = d.node(260, 125, 'CloudFront', { icon: 'cloudfront', w: 190, sub: 'Shield Standard included' });
  const waf = d.node(260, 45, 'AWS WAF', { icon: 'waf', w: 190, sub: 'managed rules, rate limit' });
  const shield = d.node(500, 45, 'Shield Advanced', { icon: 'shield', w: 210, sub: 'DDoS response team' });
  const alb = d.node(500, 125, 'ALB', { icon: 'alb', w: 210, sub: 'SG: CloudFront prefix list' });
  const app = d.node(765, 125, 'Application', { icon: 'ec2', w: 175, sub: 'private subnets' });
  d.edge([R(users), L(cf, users.cy)], 'in', { label: 'HTTPS', lx: 230, ly: 141 });
  d.edge([R(cf), L(alb)], 'in');
  d.edge([R(alb), L(app)], 'in');
  d.edge([B(waf), T(cf)], 'alt', { label: 'web ACL', lx: 362, ly: 111, anchor: 'start' });
  d.edge([L(shield), [470, shield.cy], [470, cf.y + 10], R(cf, cf.y + 10)], 'alt', { label: 'protects', lx: 474, ly: 105, anchor: 'start' });
  const logs = d.node(40, 300, 'Logs', { icon: 'cloudtrail', w: 210, sub: 'CloudTrail, Flow Logs, DNS' });
  const gd = d.node(305, 300, 'GuardDuty', { icon: 'guardduty', w: 170, sub: 'threat findings' });
  const hub = d.node(500, 300, 'Security Hub', { icon: 'securityhub', w: 210, sub: '+ Inspector, Macie findings' });
  const eb = d.node(765, 270, 'EventBridge rule', { icon: 'eventbridge', w: 175 });
  const fix = d.node(765, 355, 'Lambda, SNS', { icon: 'lambda', w: 175, sub: 'remediate, alert' });
  d.edge([R(logs), L(gd)], 'data', { label: 'analyzes', lx: 278, ly: 316 });
  d.edge([R(gd), L(hub)], 'data');
  d.edge([R(hub, hub.cy - 10), [740, hub.cy - 10], [740, eb.cy], L(eb)], 'data', { label: 'findings', lx: 737, ly: 330 });
  d.edge([B(eb), T(fix)], 'data');
  add('g-security', {
    id: 'edgesecurity', title: 'Edge security and threat detection',
    takeaway: 'Block at the edge (WAF and Shield on CloudFront), detect with GuardDuty, gather findings in Security Hub, and respond through EventBridge.',
    check: {
      q: 'An application behind CloudFront and an ALB suffers an HTTP request flood from thousands of changing IP addresses. What is the most effective mitigation?',
      opts: [
        'Network ACL rules that deny the attacking IP addresses.',
        'A rate-based rule in an AWS WAF web ACL on the CloudFront distribution.',
        'Amazon GuardDuty.',
        'Security group rules on the ALB.'
      ],
      answer: 1,
      why: 'A rate-based rule blocks any IP that exceeds the limit, at the edge. Network ACLs hold few rules and cannot keep up with changing IPs, security groups cannot deny, and GuardDuty detects but does not block.'
    },
    svg: d.render(),
    caption: 'Attacks are stopped as far out as possible: WAF and Shield at the CloudFront edge, and an ALB that only CloudFront can reach. Behind them, managed detectors read the logs, Security Hub gathers every finding in one place, and EventBridge turns findings into automatic responses.',
    legend: [['in', 'Request path'], ['alt', 'Protection attached'], ['data', 'Findings and responses']],
    cards: [
      ['Which service finds what?', table(['Service', 'Looks at', 'Finds'], [
        ['GuardDuty', 'CloudTrail, VPC Flow Logs, DNS logs (agentless)', 'Compromised instances, crypto mining, odd API calls'],
        ['Inspector', 'EC2, container images, Lambda', 'Software vulnerabilities (CVEs), network exposure'],
        ['Macie', 'S3 objects', 'Sensitive data such as PII and card numbers'],
        ['Detective', 'GuardDuty findings and logs', 'Root-cause investigation'],
        ['Security Hub', 'All of the above, across accounts', 'One prioritized view, best-practice checks']
      ])],
      ['Exam points', ul([
        'SQL injection and bad bots → <b>WAF</b> managed rules; HTTP floods from many IPs → WAF <b>rate-based</b> rule; large DDoS with expert help and cost protection → <b>Shield Advanced</b>.',
        'Apply the same WAF rules to every account automatically → <b>Firewall Manager</b> (needs Organizations and Config).',
        'Keep users from bypassing CloudFront → ALB security group allows only the CloudFront managed prefix list; S3 origins use Origin Access Control.',
        'Automatic response to a finding → EventBridge rule → Lambda or a Systems Manager Automation runbook.'
      ])]
    ]
  });
}

// ---- Containers on ECS with Fargate (after CloudFront or Global Accelerator)
{
  const d = diagram('d-ecs', 960, 405, 'A CI pipeline pushes images to ECR. Users reach an Application Load Balancer, which routes to an ECS service running Fargate tasks in two Availability Zones. Tasks pull their image from ECR using the task execution role, call DynamoDB with the permissions of their task role, and share files on an EFS file system. Service auto scaling adds or removes tasks.');
  const ci = d.node(20, 40, 'CI pipeline', { w: 175, sub: 'docker build, push' });
  const ecr = d.node(250, 40, 'ECR', { icon: 'ecr', w: 175, sub: 'images, scanning' });
  const users = d.node(20, 200, 'Users', { w: 175 });
  const alb = d.node(250, 195, 'ALB', { icon: 'alb', w: 175, sub: 'target group: IP' });
  d.zone(480, 110, 240, 230, { kind: 'asg' });
  d.label(600, 360, 'ECS service on Fargate · 2 AZs', { cls: 'd-lbl' });
  const t1 = d.node(505, 140, 'Task · AZ A', { icon: 'fargate', w: 190 });
  const t2 = d.node(505, 270, 'Task · AZ B', { icon: 'fargate', w: 190 });
  const ddb = d.node(775, 130, 'DynamoDB', { icon: 'dynamodb', w: 165, sub: 'via the task role' });
  const efs = d.node(775, 260, 'EFS', { icon: 'efs', w: 165, sub: 'shared files (NFS)' });
  d.edge([R(ci), L(ecr)], 'data', { label: 'push', lx: 222, ly: 56 });
  d.edge([R(ecr), [600, ecr.cy], T(t1)], 'alt', { label: 'pull (execution role)', lx: 520, ly: 56 });
  d.edge([R(users), L(alb, users.cy)], 'in', { label: 'HTTPS', lx: 222, ly: 216 });
  d.edge([R(alb, alb.cy - 8), [455, alb.cy - 8], [455, t1.cy], L(t1)], 'in');
  d.edge([R(alb, alb.cy + 8), [455, alb.cy + 8], [455, t2.cy], L(t2)], 'in');
  d.edge([R(t1), [748, t1.cy]], 'data', { head: false });
  d.edge([R(t2), [748, t2.cy]], 'data', { head: false });
  d.edge([[748, t1.cy], [748, t2.cy]], 'data', { head: false });
  d.edge([[748, ddb.cy], L(ddb)], 'data');
  d.edge([[748, efs.cy], L(efs)], 'data');
  d.label(480, 392, 'service auto scaling: target tracking on CPU or ALB requests per target', { cls: 'd-lbl' });
  add('g-ha', {
    id: 'containers', title: 'Containers on ECS with Fargate',
    takeaway: 'Containers with the least operations → ECS or EKS on Fargate; the task role gives the app its AWS permissions.',
    check: {
      q: 'An ECS task running on Fargate must write to a DynamoDB table. How should it get permissions?',
      opts: [
        'Add the DynamoDB permissions to the task execution role.',
        'Pass access keys to the container in environment variables.',
        'Attach a policy for the table to the task\'s IAM task role.',
        'Attach an instance profile to the container instances.'
      ],
      answer: 2,
      why: 'The task role is what the application\'s code uses. The execution role is only for ECS itself (pulling images, writing logs), Fargate has no instances to profile, and stored keys are never the answer.'
    },
    svg: d.render(),
    caption: 'Fargate runs each task with no servers to patch or scale, the ALB spreads requests across tasks in two AZs, and each task gets AWS permissions from its own task role. ECR holds the images; EFS gives tasks shared persistent storage.',
    legend: [['in', 'Request path'], ['data', 'Calls and storage'], ['alt', 'Image pull']],
    cards: [
      ['Exam points', ul([
        '"Containers with the least operational overhead" → ECS (or EKS) on <b>Fargate</b>. Need GPUs, special instance types or the lowest cost at steady scale → the EC2 launch type.',
        '<b>Task role</b> = what the application can call (S3, DynamoDB). <b>Task execution role</b> = what ECS needs to pull images and write logs.',
        'Already on Kubernetes → EKS; on-premises too → ECS Anywhere or EKS Anywhere. Persistent shared files → EFS volumes; Fargate local storage is temporary.',
        'Interruptible, stateless tasks → Fargate Spot for up to 70% off.'
      ])]
    ]
  });
}

// ---- Migrating to AWS (after disaster recovery strategies)
{
  const d = diagram('d-mig', 960, 432, 'On-premises servers, an Oracle database, file shares and a large archive move to AWS with four tools. Application Migration Service replicates whole servers continuously and launches them as EC2 instances. DMS, with the Schema Conversion Tool, copies the database to Aurora PostgreSQL and keeps it in sync until cutover. DataSync copies file shares to S3, EFS or FSx. Snowball Edge devices ship the archive to S3 offline. Migration Hub tracks progress.');
  d.zone(20, 20, 270, 380, { kind: 'onprem', label: 'Data center' });
  d.zone(670, 20, 270, 380, { kind: 'region', label: 'AWS Region' });
  const rows = [
    ['Servers', 'VMware, Hyper-V, physical', 'App Migration Service', 'mgn', 'block-level replication', 'EC2 instances', 'ec2', 'rehost, cutover in minutes'],
    ['Oracle database', 'stays live until cutover', 'DMS', 'dms', 'full load + CDC, SCT', 'Aurora PostgreSQL', 'aurora', 'replatform'],
    ['File shares, NAS', 'NFS or SMB', 'DataSync', 'datasync', 'scheduled, verified', 'S3, EFS or FSx', 's3', 'files kept as files'],
    ['500 TB archive', 'slow internet link', 'Snowball Edge', 'snowball', 'shipped, offline', 'S3', 's3', 'imported by AWS']
  ];
  rows.forEach(([src, srcSub, tool, icon, toolSub, dst, dstIcon, dstSub], i) => {
    const y = 55 + i * 85;
    const a = d.node(40, y, src, { w: 230, sub: srcSub });
    const t = d.node(355, y, tool, { icon, w: 250, sub: toolSub });
    const z = d.node(690, y, dst, { icon: dstIcon, w: 230, sub: dstSub });
    d.edge([R(a), L(t)], 'data');
    d.edge([R(t), L(z)], i === 3 ? 'alt' : 'in', i === 3 ? { label: 'by courier', lx: 638, ly: y + 20 } : {});
  });
  d.label(480, 422, 'Migration Hub tracks every server and database through the move', { cls: 'd-lbl' });
  add('g-dr', {
    id: 'migration', title: 'Migrating to AWS',
    takeaway: 'Servers → Application Migration Service; databases → DMS (with SCT for a new engine); files → DataSync; more than the link can carry → Snowball.',
    check: {
      q: 'An on-premises Oracle database must move to Aurora PostgreSQL with minimal downtime. What should be used?',
      opts: [
        'AWS DataSync to copy the database files.',
        'An export dump shipped on a Snowball Edge device.',
        'AWS SCT to convert the schema, then AWS DMS with a full load and ongoing change data capture.',
        'AWS Application Migration Service.'
      ],
      answer: 2,
      why: 'A different engine needs SCT for the schema and code, and DMS with CDC keeps the target in sync until a short cutover. DataSync moves files, and a dump means downtime for the whole transfer.'
    },
    svg: d.render(),
    caption: 'Each kind of workload has its own tool. Servers and databases keep replicating while the old ones stay in use, so the final cutover takes minutes; files sync on a schedule; data too big for the network travels on a device.',
    legend: [['data', 'Read from the source'], ['in', 'Over the network'], ['alt', 'Shipped offline']],
    cards: [
      ['Which tool?', table(['Moving', 'Tool', 'Note'], [
        ['Whole servers, unchanged (rehost)', 'Application Migration Service', 'Continuous replication, test launches, minutes of downtime'],
        ['A database, same engine', 'DMS', 'Full load plus change data capture until cutover'],
        ['A database, different engine', 'SCT + DMS', 'SCT converts schema and code; DMS moves the data'],
        ['SQL Server apps onto Aurora PostgreSQL with few code changes', 'Babelfish for Aurora PostgreSQL', 'Understands T-SQL'],
        ['Files, online, once or on a schedule', 'DataSync', 'To S3, EFS or FSx, with verification'],
        ['Tens of TB to PB, network too slow', 'Snowball Edge', 'Order several devices in parallel'],
        ['Discover servers and plan', 'Application Discovery Service, Migration Hub', 'Inventory, dependencies, tracking']
      ])],
      ['Exam points', ul([
        'Do the bandwidth sum: about 10 TB a day on 1 Gbps. If the deadline beats the network, use Snowball; if the link is fine, DataSync over it.',
        '"Minimal downtime" for a database → DMS with <b>CDC</b>, not a dump and restore. "Different engine" → add SCT.',
        '"Lift and shift hundreds of servers with minimal effort" → Application Migration Service (it replaced Server Migration Service).'
      ])]
    ]
  });
}

// ---- Encryption and secrets (after cross-account access)
{
  const d = diagram('d-enc', 960, 440, 'Top: envelope encryption. A service such as S3 asks KMS for a data key, encrypts the data locally with the plaintext key, discards it and stores the encrypted data key next to the data; the KMS key itself never leaves KMS. Middle: an application reads database credentials from Secrets Manager at runtime, and a rotation Lambda function changes the RDS password on a schedule. Bottom: ACM provides auto-renewing TLS certificates for the load balancer and for CloudFront, which needs them in us-east-1.');
  d.zone(20, 15, 920, 130, { kind: 'group', label: 'At rest: envelope encryption' });
  const svc = d.node(40, 60, 'S3, EBS, RDS…', { w: 200, sub: 'encrypts locally' });
  const kms = d.node(370, 60, 'KMS key', { icon: 'kms', w: 220, sub: 'never leaves KMS' });
  const obj = d.node(720, 60, 'Stored together', { w: 200, sub: 'data + encrypted data key' });
  d.edge([R(svc, svc.cy - 8), L(kms, svc.cy - 8)], 'in', { label: 'GenerateDataKey', lx: 305, ly: 79 });
  d.edge([L(kms, kms.cy + 8), R(svc, kms.cy + 8)], 'alt', { label: 'data key, 2 copies', lx: 305, ly: 112 });
  d.edge([R(kms), L(obj)], 'data', { label: 'encrypted key kept', lx: 655, ly: 79 });
  d.zone(20, 165, 920, 140, { kind: 'group', label: 'Secrets: no passwords in code' });
  const app = d.node(40, 215, 'App', { icon: 'ec2', w: 200, sub: 'EC2, Lambda, ECS' });
  const sm = d.node(370, 215, 'Secrets Manager', { icon: 'secrets', w: 220, sub: 'encrypted with KMS' });
  const rot = d.node(590, 245, 'Rotation Lambda', { icon: 'lambda', w: 150, sub: 'every 30 days' });
  const rds = d.node(770, 215, 'RDS', { icon: 'rds', w: 150, sub: 'password changes' });
  d.edge([R(app), L(sm, app.cy)], 'in', { label: 'GetSecretValue', lx: 305, ly: 232 });
  d.edge([B(sm, 500), [500, rot.cy], L(rot)], 'alt');
  d.edge([R(rot), [755, rot.cy], [755, rds.cy], L(rds)], 'alt', { label: 'set new password', lx: 690, ly: 230 });
  d.zone(20, 325, 920, 100, { kind: 'group', label: 'In transit: TLS everywhere' });
  const acm = d.node(40, 365, 'ACM certificate', { icon: 'acm', w: 200, sub: 'free, auto-renewed' });
  const alb = d.node(370, 365, 'ALB', { icon: 'alb', w: 220, sub: 'certificate in its Region' });
  const cf = d.node(720, 365, 'CloudFront', { icon: 'cloudfront', w: 200, sub: 'certificate in us-east-1' });
  d.edge([R(acm), L(alb)], 'data');
  d.edge([R(alb), L(cf)], 'in', { label: 'HTTPS to the origin', lx: 655, ly: 382 });
  add('g-security', {
    id: 'encryption', title: 'Encryption and secrets',
    takeaway: 'Audit key use → SSE-KMS; rotate database passwords → Secrets Manager; TLS certificates → ACM (in us-east-1 for CloudFront).',
    check: {
      q: 'The password of an RDS database must rotate automatically every 30 days with no change to the application\'s code path. What should be used?',
      opts: [
        'A Systems Manager Parameter Store SecureString.',
        'Automatic rotation of the KMS key.',
        'An encrypted object in S3, updated by a cron job.',
        'Secrets Manager with automatic rotation.'
      ],
      answer: 3,
      why: 'Secrets Manager rotates RDS credentials with a managed rotation function. Parameter Store has no built-in RDS rotation, and KMS key rotation changes key material, not passwords.'
    },
    svg: d.render(),
    caption: 'KMS keys never leave KMS; services encrypt with short-lived data keys and keep only an encrypted copy of each. Secrets Manager keeps credentials out of code and rotates them, and ACM keeps TLS certificates renewed.',
    legend: [['in', 'Requests'], ['alt', 'Returned key, rotation'], ['data', 'Stored or attached']],
    pair: [
      ['S3 encryption options', table(['Option', 'Who holds the key', 'Choose it when'], [
        ['SSE-S3', 'AWS, fully managed', 'The default; no extra cost or audit needed'],
        ['SSE-KMS', 'Your KMS key', 'Audit every use in CloudTrail, control with key policies'],
        ['DSSE-KMS', 'Your KMS key, two layers', 'A rule demands dual-layer encryption'],
        ['SSE-C', 'You, sent with each request', 'You must keep the key material outside AWS'],
        ['Client-side', 'You, before upload', 'Data must be encrypted before it reaches AWS']
      ])],
      ['Exam points', ul([
        '"Audit who used the key" → SSE-KMS. Lots of KMS calls costing money or throttling → enable <b>S3 Bucket Keys</b>.',
        'You can\'t encrypt an existing unencrypted RDS instance in place: snapshot → copy with encryption → restore.',
        '"Rotate database credentials automatically" → Secrets Manager. Plain configuration values → Systems Manager Parameter Store (cheaper, no built-in rotation for RDS).',
        'Dedicated, single-tenant HSMs that you alone control (KMS is FIPS-validated too, but AWS runs it) → CloudHSM. Your own key material in KMS → imported keys.',
        'Other accounts or Regions need the key → key policy grants, or multi-Region keys.'
      ])]
    ]
  });
}

// ---- Operations and auto-remediation
{
  const d = diagram('d-ops', 960, 440, 'Three operational loops. Monitoring: the CloudWatch agent on EC2 sends memory, disk and log data to CloudWatch, where a metric filter and an alarm notify the on-call team through SNS or trigger Auto Scaling. Compliance: AWS Config evaluates resources against rules and runs a Systems Manager Automation runbook to fix noncompliant ones. Fleet operations: administrators reach instances through Session Manager without SSH or a bastion, and Patch Manager patches them in a maintenance window.');
  d.zone(20, 15, 920, 120, { kind: 'group', label: 'Monitor and alert' });
  const agent = d.node(40, 60, 'EC2 + CloudWatch agent', { icon: 'ec2', w: 230, sub: 'memory, disk, app logs' });
  const cw = d.node(320, 60, 'CloudWatch', { icon: 'cloudwatch', w: 210, sub: 'metrics, log metric filters' });
  const alarm = d.node(580, 60, 'Alarm', { icon: 'cloudwatch', w: 150, sub: '2 of 3 datapoints' });
  const act = d.node(780, 60, 'SNS · Auto Scaling', { w: 145, sub: 'page, or scale' });
  d.edge([R(agent), L(cw)], 'data');
  d.edge([R(cw), L(alarm)], 'data');
  d.edge([R(alarm), L(act)], 'in', { label: 'ALARM', lx: 755, ly: 76 });
  d.zone(20, 160, 920, 120, { kind: 'group', label: 'Detect drift and fix it' });
  const res = d.node(40, 205, 'Resources', { w: 230, sub: 'buckets, security groups, EBS' });
  const cfg = d.node(320, 205, 'AWS Config', { icon: 'config', w: 210, sub: 'rule: no public buckets' });
  const runbook = d.node(580, 205, 'SSM Automation', { icon: 'ssm', w: 230, sub: 'remediation runbook' });
  d.edge([R(res), L(cfg)], 'data', { label: 'records changes', lx: 295, ly: 200 });
  d.edge([R(cfg), L(runbook)], 'in', { label: 'noncompliant', lx: 555, ly: 200 });
  d.edge([B(runbook), [runbook.cx, 268], [res.cx, 268], B(res)], 'alt', { label: 'fixes it automatically', lx: 440, ly: 264 });
  d.zone(20, 305, 920, 120, { kind: 'group', label: 'Operate the fleet' });
  const admin = d.node(40, 350, 'Administrator', { w: 230, sub: 'IAM permissions, MFA' });
  const ssm = d.node(320, 350, 'Session Manager', { icon: 'ssm', w: 210, sub: 'no SSH keys, no bastion' });
  const fleet = d.node(580, 350, 'EC2 fleet', { icon: 'ec2', w: 150, sub: 'SSM agent' });
  const patch = d.node(770, 350, 'Patch Manager', { icon: 'ssm', w: 165, sub: 'maintenance window' });
  d.edge([R(admin), L(ssm)], 'in');
  d.edge([R(ssm), L(fleet)], 'in', { label: 'logged session', lx: 555, ly: 345 });
  d.edge([L(patch), R(fleet)], 'alt');
  add('g-ops', {
    id: 'operations', title: 'Operations and auto-remediation',
    takeaway: 'Memory and disk metrics need the CloudWatch agent; Config with SSM Automation fixes drift; Session Manager replaces SSH and bastions.',
    check: {
      q: 'A company needs an alarm when memory use on its EC2 instances goes above 80%. What must it do first?',
      opts: [
        'Install the CloudWatch agent so the instances publish memory metrics.',
        'Turn on detailed monitoring for the instances.',
        'Turn on VPC Flow Logs.',
        'Create an AWS Config rule.'
      ],
      answer: 0,
      why: 'EC2 reports CPU, network and disk I/O from the hypervisor, but not memory. Detailed monitoring only makes the default metrics more frequent.'
    },
    svg: d.render(),
    caption: 'Three loops keep a workload healthy with little manual work: alarms on the right metrics, Config rules that repair drift on their own, and Systems Manager for access and patching without SSH or bastion hosts.',
    legend: [['data', 'Data and evaluation'], ['in', 'Actions'], ['alt', 'Automatic fixes and patching']],
    cards: [
      ['Exam points', ul([
        'Memory and disk usage are <b>not</b> default EC2 metrics → install the CloudWatch agent. Alert on a log pattern → metric filter + alarm.',
        'Ignore brief spikes → alarm on M out of N datapoints. Replace an instance on a custom health signal → mark it unhealthy for Auto Scaling.',
        '"Detect and automatically fix" misconfigurations → AWS Config rule with an SSM Automation remediation. "Who changed it?" → CloudTrail.',
        'No inbound SSH, no keys, audited shell access → <b>Session Manager</b> (instance profile with AmazonSSMManagedInstanceCore). Patching on a schedule with compliance reports → Patch Manager; run one command fleet-wide now → Run Command.',
        'Trace slow requests across services → X-Ray. Account-level health events → AWS Health.'
      ])]
    ]
  });
}

// ---- Cost-optimized compute
{
  const d = diagram('d-costcompute', 960, 470, 'Left: matching the workload to a purchasing option. A steady baseline for one to three years goes on Savings Plans or Reserved Instances; fault-tolerant flexible work on Spot; spiky or unpredictable load on On-Demand with Auto Scaling; office-hours-only systems stop or scale to zero; per-core licences need Dedicated Hosts. Right: one Auto Scaling group mixing them, with an On-Demand base covered by a Savings Plan and Spot capacity across several instance types above it, right-sized with Compute Optimizer.');
  const rows = [
    ['Steady 24/7 baseline', '1 to 3 years ahead', 'Savings Plans or RIs', 'savings', 'up to ~72% off'],
    ['Fault-tolerant, flexible', 'batch, CI, stateless web', 'Spot Instances', 'spot', 'up to 90% off, 2-min notice'],
    ['Spiky or unknown', 'new apps, traffic bursts', 'On-Demand + scaling', 'asg', 'pay per second, scale in'],
    ['Office hours only', 'dev, test, reports', 'Stop or scale to zero', 'ec2', 'scheduled actions'],
    ['Per-core licences', 'BYOL, compliance', 'Dedicated Hosts', 'ec2', 'bring your own licence']
  ];
  rows.forEach(([need, needSub, opt, icon, optSub], i) => {
    const y = 20 + i * 84;
    const a = d.node(20, y, need, { w: 200, sub: needSub });
    const o = d.node(270, y, opt, { icon, w: 245, sub: optSub });
    d.edge([R(a), L(o)], 'in');
  });
  d.zone(580, 20, 360, 420, { kind: 'group', label: 'One Auto Scaling group, mixed' });
  const spot = d.node(605, 70, 'Spot above the base', { icon: 'spot', w: 310, sub: '6 instance types, several AZs' });
  const od = d.node(605, 165, 'On-Demand base: 4', { icon: 'ec2', w: 310, sub: 'covered by a Compute Savings Plan' });
  const grav = d.node(605, 260, 'Graviton where possible', { icon: 'ec2', w: 310, sub: 'arm64: up to 40% better price/performance' });
  const opt = d.node(605, 360, 'Compute Optimizer', { icon: 'computeopt', w: 310, sub: 'right-size before you commit' });
  d.edge([T(od), B(spot)], 'alt', { label: 'demand above the base', lx: 770, ly: 150, anchor: 'start' });
  d.edge([T(opt), B(grav)], 'alt', { label: 'recommends sizes', lx: 770, ly: 345, anchor: 'start' });
  add('g-cost', {
    id: 'costcompute', title: 'Cost-optimized compute',
    takeaway: 'Commit for the steady baseline (Savings Plans or RIs), put interruptible work on Spot, and scale the rest On-Demand.',
    check: {
      q: 'A company runs steady EC2 workloads today and will move parts of them to Fargate and Lambda within a year. Which purchase saves the most while staying flexible?',
      opts: [
        'Standard Reserved Instances.',
        'An EC2 Instance Savings Plan.',
        'A Compute Savings Plan.',
        'Spot Instances.'
      ],
      answer: 2,
      why: 'A Compute Savings Plan applies across instance families, Regions, Fargate and Lambda. Standard RIs and EC2 Instance Savings Plans are tied to EC2 families, and Spot can be interrupted.'
    },
    svg: d.render(),
    caption: 'Price follows commitment and flexibility: commit to the steady part, put interruptible work on Spot, scale everything else, and switch off what nobody uses. One Auto Scaling group can combine all of it.',
    legend: [['in', 'Best fit'], ['alt', 'How the group uses them']],
    pair: [
      ['Commitments compared', table(['', 'Compute Savings Plan', 'EC2 Instance Savings Plan', 'Standard RI', 'Convertible RI'], [
        ['Discount', 'Up to ~66%', 'Up to ~72%', 'Up to ~72%', 'Up to ~66%'],
        ['Covers', 'Any EC2 family, Region, OS, plus Fargate and Lambda', 'One family in one Region', 'One instance type', 'Exchangeable for other types'],
        ['Capacity reservation', 'No', 'No', 'Only zonal RIs', 'Only zonal RIs']
      ])],
      ['Exam points', ul([
        '"Workload will move to Fargate or Lambda" or "change instance families" → <b>Compute Savings Plan</b>. Fixed type forever → Standard RI or EC2 Instance Savings Plan.',
        'Guarantee capacity in one AZ for a short event with no long commitment → <b>On-Demand Capacity Reservation</b>.',
        'Spot: diversify instance types and AZs, use capacity-optimized allocation, design for the 2-minute notice. Never for a stateful job that can\'t restart.',
        'Right-size first (Compute Optimizer), then commit, or you lock in the waste. A server busy 30% of the week is cheaper On-Demand on a schedule.'
      ])]
    ]
  });
}

// ---- Data transfer costs
{
  const d = diagram('d-transfer', 960, 450, 'Where data transfer costs money and where it is free. Inbound traffic from the internet is free. An instance serving users through CloudFront pays nothing for the origin fetch, and CloudFront\'s delivery to users is charged at a lower rate than going direct. Traffic between instances in the same Availability Zone over private IPs is free, but between Availability Zones it is charged in each direction. An instance reaching S3 through a gateway endpoint pays nothing, while one going through a NAT gateway pays NAT processing per GB. Traffic to another Region is charged, and traffic to the data center over Direct Connect is charged at a lower rate than the internet.');
  const users = d.node(20, 20, 'Internet users', { w: 150 });
  const cf = d.node(240, 20, 'CloudFront', { icon: 'cloudfront', w: 175, sub: 'edge egress, cached' });
  d.zone(20, 100, 640, 335, { kind: 'region', label: 'Region A' });
  d.zone(40, 130, 290, 170, { kind: 'az', label: 'AZ A' });
  d.zone(350, 130, 290, 170, { kind: 'az', label: 'AZ B' });
  const a1 = d.node(60, 180, 'EC2', { icon: 'ec2', w: 110 });
  const a2 = d.node(200, 180, 'EC2', { icon: 'ec2', w: 110 });
  const b1 = d.node(370, 180, 'EC2', { icon: 'ec2', w: 110 });
  const nat = d.node(515, 180, 'NAT', { icon: 'nat', w: 105 });
  const gw = d.node(60, 370, 'Gateway endpoint', { icon: 'vpce', w: 195 });
  const s3 = d.node(330, 370, 'S3 bucket', { icon: 's3', w: 170 });
  const rb = d.node(720, 110, 'Region B', { icon: 'vpc', w: 220, sub: 'replicas, DR copies' });
  const dc = d.node(720, 250, 'Data center', { w: 220, sub: 'over Direct Connect' });
  d.edge([B(users, 95), T(a1, 95)], 'in', { label: 'inbound: free', lx: 105, ly: 96, anchor: 'start' });
  d.edge([T(a2, 280), B(cf, 280)], 'in', { label: 'origin fetch: free', lx: 290, ly: 96, anchor: 'start' });
  d.edge([L(cf, users.cy), R(users)], 'out', { label: '$', lx: 205, ly: 35 });
  d.edge([R(a1), L(a2)], 'in', { both: true });
  d.label(225, 250, 'same AZ, private IP: free', { cls: 'd-lbl' });
  d.edge([R(a2), L(b1)], 'out', { both: true });
  d.label(340, 275, 'cross-AZ: $ each way', { cls: 'd-lbl d-halo' });
  d.edge([B(a1, 115), T(gw, 115)], 'in', { label: 'to S3: free', lx: 125, ly: 340, anchor: 'start' });
  d.edge([R(gw), L(s3)], 'in');
  d.edge([R(b1), L(nat)], 'out');
  d.edge([B(nat, 568), [568, 345], [470, 345], T(s3, 470)], 'out', { label: 'via NAT: processing $/GB', lx: 580, ly: 340, anchor: 'start' });
  d.edge([T(b1, 455), [455, 135], L(rb, 135)], 'out', { label: 'inter-Region $', lx: 600, ly: 129 });
  d.edge([R(b1, b1.cy + 12), [498, b1.cy + 12], [498, dc.cy], L(dc)], 'out', { label: 'DX out: lower rate', lx: 655, ly: 292 });
  add('g-cost', {
    id: 'datatransfer', title: 'Data transfer costs',
    takeaway: 'Inbound, same-AZ private and origin-to-CloudFront traffic is free; NAT, cross-AZ, inter-Region and internet egress are billed per GB.',
    check: {
      q: 'A company serves large files from an S3 bucket to users around the world, and its data transfer bill is high. What lowers it?',
      opts: [
        'Turn on S3 Transfer Acceleration.',
        'Replicate the bucket to more Regions.',
        'Route downloads through a NAT gateway.',
        'Put a CloudFront distribution in front of the bucket.'
      ],
      answer: 3,
      why: 'Fetches from S3 into CloudFront are free, edge delivery costs less than S3 internet egress, and cached files are not fetched again. Transfer Acceleration adds a charge, and replication adds inter-Region charges.'
    },
    svg: d.render(),
    caption: 'Data coming in is free, data staying inside one AZ is free, and fetches from AWS origins into CloudFront are free; almost everything else is billed per GB. Many "most cost-effective" answers just move traffic onto a free or cheaper path.',
    legend: [['in', 'Free'], ['out', 'Charged per GB']],
    cards: [
      ['Exam points', ul([
        'High NAT gateway charges from S3 or DynamoDB traffic → <b>gateway endpoint</b> (free). Other services → interface endpoints cost less than NAT at volume.',
        'Big download bill from S3 or EC2 → serve through <b>CloudFront</b>: origin fetches are free, edge delivery is cheaper and cached. Make downloaders pay → S3 <b>Requester Pays</b>.',
        'Chatty tiers across AZs pay in both directions; keep tightly coupled components in one AZ where resilience allows, but never give up Multi-AZ for the database to save this.',
        'Regular large transfers to on-premises → Direct Connect, cheaper per GB out than the internet. Cross-Region replication and DR copies add inter-Region charges.'
      ])]
    ]
  });
}

// ---- Cost governance
{
  const d = diagram('d-costgov', 960, 430, 'Member accounts for production, development and a sandbox roll up to the management account through consolidated billing, which shares volume discounts, Reserved Instances and Savings Plans. Resources carry cost allocation tags for team and project. From the management account\'s bill, four tools: Cost Explorer for trends, forecasts and recommendations; Budgets for alerts and automatic actions such as applying a service control policy to the sandbox; Cost Anomaly Detection for unusual spikes; and the Cost and Usage Report delivered to S3 and queried with Athena.');
  const mgmt = d.node(440, 15, 'Management account', { icon: 'orgs', w: 300, sub: 'consolidated billing, shared discounts' });
  const accts = [['Production', 20], ['Development', 255], ['Sandbox', 720]].map(([t, x]) => d.node(x, 125, t, { icon: 'ec2', w: 220, sub: 'tags: team, project' }));
  d.edge([[accts[0].cx, accts[0].y], [accts[0].cx, 98], [accts[2].cx, 98], [accts[2].cx, accts[2].y]], 'data', { head: false });
  d.edge([[accts[1].cx, accts[1].y], [accts[1].cx, 98]], 'data', { head: false });
  d.edge([[520, 98], [520, mgmt.b]], 'data');
  d.label(300, 92, 'one bill; discounts and commitments shared', { cls: 'd-lbl d-halo' });
  const tools = [
    ['Cost Explorer', 'costexplorer', 'trends, forecasts, RI/SP advice'],
    ['Budgets', 'budgets', 'alerts and automatic actions'],
    ['Anomaly Detection', 'costexplorer', 'flags unusual spikes'],
    ['Cost and Usage Report', 'cur', 'line items in S3 + Athena']
  ].map(([t, ic, sub], i) => d.node(20 + i * 237, 290, t, { icon: ic, w: 220, sub }));
  d.edge([[650, mgmt.b], [650, 245]], 'data', { head: false });
  d.edge([[tools[0].cx, 245], [tools[3].cx, 245]], 'data', { head: false });
  for (const t of tools) d.edge([[t.cx, 245], T(t)], 'data');
  d.label(640, 228, 'cost data for every account, by tag', { anchor: 'end', cls: 'd-lbl d-halo' });
  d.edge([B(tools[1]), [tools[1].cx, 375], [955, 375], [955, 200], [925, 200], B(accts[2], 925)], 'alt');
  d.label(640, 370, 'over budget: apply an SCP, stop instances', { cls: 'd-lbl d-halo' });
  add('g-cost', {
    id: 'costgovernance', title: 'Cost governance',
    takeaway: 'See spend → Cost Explorer; alert or act at a threshold → Budgets; unexpected spikes → Anomaly Detection; every line item → CUR and Athena.',
    check: {
      q: 'Finance wants costs by department across all accounts. Resources already carry a Department tag. What else must be done?',
      opts: [
        'Turn on Cost Explorer in each member account.',
        'Activate Department as a cost allocation tag in the management account.',
        'Create one budget per department.',
        'Turn on AWS Config in every account.'
      ],
      answer: 1,
      why: 'Tags appear in billing data only after they are activated as cost allocation tags, and only from then on. Budgets and Config do not break costs down by tag.'
    },
    svg: d.render(),
    caption: 'One organization gives one bill with shared discounts, tags say who spent what, and four tools turn that bill into reports, alerts and automatic guardrails.',
    legend: [['data', 'Billing data'], ['alt', 'Automatic action']],
    cards: [
      ['Which tool?', table(['Need', 'Tool'], [
        ['See spend by service, account or tag; forecast; RI/SP recommendations', 'Cost Explorer'],
        ['Alert at a threshold, or stop spending automatically', 'Budgets (with budget actions)'],
        ['Be told about an unusual spike without setting thresholds', 'Cost Anomaly Detection'],
        ['Every line item, queried with SQL, loaded into BI', 'Cost and Usage Report (Data Exports) + Athena'],
        ['Idle or oversized resources, best-practice checks', 'Trusted Advisor, Compute Optimizer']
      ])],
      ['Exam points', ul([
        'Cost by department → apply a tag, then <b>activate it as a cost allocation tag</b> in the management account; only then does it appear in billing data.',
        '"Stop a sandbox overspending without custom code" → Budgets with a <b>budget action</b> (apply an SCP or IAM policy, or stop instances).',
        'Share Savings Plans and RIs across accounts → put them in one organization with discount sharing on.'
      ])]
    ]
  });
}

// the main service of each diagram, shown beside it in the jump panel
const JUMP_ICONS = {
  'vpc-layout': 'vpc', 'vpc-endpoints': 'vpce', hybrid: 'dx', tgw: 'tgw', privatelink: 'privatelink', 'hybrid-dns': 'route53',
  'three-tier': 'alb', serverless: 'lambda', edge: 'cloudfront', containers: 'fargate',
  queue: 'sqs', fanout: 'sns', eventbridge: 'eventbridge', stepfunctions: 'stepfn',
  streaming: 'kinesis', datalake: 'glue', s3events: 's3',
  readscale: 'elasticache', multiregion: 'aurora',
  dr: 'drs', migration: 'mgn',
  hybridstorage: 'storagegw', filesystems: 'efs', s3protect: 'glacier',
  landingzone: 'orgs', crossaccount: 'iamrole', edgesecurity: 'waf', encryption: 'kms',
  operations: 'ssm',
  costcompute: 'savings', datatransfer: 'nat', costgovernance: 'budgets'
};

// ---------------------------------------------------------------- write the page
function build() {
  let n = 0;
  for (const g of GROUPS) for (const item of g.items) item.n = ++n;
  let page = fs.readFileSync(PAGE, 'utf8');
  const eol = page.includes('\r\n') ? '\r\n' : '\n';
  const toc = `<nav class="toc card" aria-label="Contents">${GROUPS.filter(g => g.items.length).map(g => `
      <div><a class="toc-group" href="#${g.id}">${g.title}</a><ol>${g.items.map(i => `<li value="${i.n}"><a href="#${i.id}">${esc(i.title)}</a></li>`).join('')}</ol></div>`).join('')}
    </nav>`;
  // diagrams 1 and 2 already open the networking group, so it continues straight after them
  const body = GROUPS.map(g => {
    const own = DIAGRAMS.filter(dg => dg.groupId === g.id);
    if (!own.length) return '';
    const heading = g.id === 'g-network' ? '' : `\n  <h2 class="arch-group" id="${g.id}">${g.title}</h2>`;
    return heading + own.map(section).join('\n');
  }).join('\n');
  const swap = (name, html) => {
    const re = new RegExp(`(<!-- GENERATED:${name} START[^>]*-->)[\\s\\S]*?(<!-- GENERATED:${name} END -->)`);
    if (!re.test(page)) throw new Error('missing GENERATED:' + name + ' markers in ' + PAGE);
    page = page.replace(re, (m, a, b) => a + '\n    ' + html + '\n  ' + b);
  };
  // the top bar's jump panel lists the same diagrams, grouped the same way, each with its main service's icon
  const missing = GROUPS.flatMap(g => g.items).filter(i => !JUMP_ICONS[i.id]).map(i => i.id);
  if (missing.length) throw new Error('no jump icon for: ' + missing.join(', '));
  const jumpRows = GROUPS.filter(g => g.items.length).map(g => `<div class="jump-group">${esc(g.title)}</div>`
    + g.items.map(i => `<button type="button" class="jump-row" data-id="${i.id}" data-n="${i.n}" data-title="${esc(i.title)}"><img data-ico="${JUMP_ICONS[i.id]}" alt=""><span class="n">${i.n}</span><span>${esc(i.title)}</span></button>`).join('')).join('\n  ');
  swap('CONTENTS', toc);
  swap('JUMP', jumpRows);
  swap('DIAGRAMS', body);
  page = page.replace(/\r?\n/g, eol);
  fs.writeFileSync(PAGE, page);
  console.log('wrote ' + DIAGRAMS.length + ' diagrams to ' + path.relative(process.cwd(), PAGE));
}

build();
