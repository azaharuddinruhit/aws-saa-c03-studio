// VPC Traffic Paths: one map of nine ways traffic enters, leaves or crosses a VPC, a card per path, and traps.
module.exports = ({ questions, tagged, esc, T, I, L, svg, img, LEGEND, traps, section }) => {
  const badge = (n, x, y) => `<g class="s-badge" data-go="${n}"><circle cx="${x}" cy="${y}" r="10"/>${T(x, y + 4, String(n), '', 'middle')}</g>`;
  const P = (n, body) => `<g class="s-p" data-p="${n}">${body}</g>`;
  const node = (x, y, w, label) => `<rect class="s-node" x="${x}" y="${y}" width="${w}" height="36" rx="8"/>${T(x + w / 2, y + 23, label, 'nt', 'middle')}`;

  const map = svg('ig-map', 1140, 720, 'Map of nine traffic paths into, out of and between VPCs', `
  <rect class="s-zplain" x="20" y="40" width="200" height="190" rx="12"/>${T(34, 60, 'INTERNET', 'cap')}
  ${node(50, 77, 140, 'Users')}${node(50, 172, 140, 'Third-party API')}
  <rect class="s-zplain" x="20" y="440" width="200" height="250" rx="12"/>${T(34, 460, 'ON-PREMISES', 'cap')}
  ${node(50, 482, 140, 'Servers')}
  ${L('data', '120,518 120,576')}
  ${I('cgw', 120, 600)}${T(120, 642, 'Customer gateway', 'lbl halo', 'middle')}

  <rect class="s-zregion" x="330" y="20" width="790" height="680" rx="14"/>${T(346, 40, 'AWS REGION', 'cap')}
  <rect class="s-zacc" x="350" y="55" width="430" height="420" rx="12"/>${T(366, 76, 'VPC A · 10.0.0.0/16', 'cap acc')}
  <rect class="s-zsoft" x="385" y="88" width="375" height="110" rx="8"/>${T(750, 104, 'PUBLIC SUBNET', 'cap', 'end')}
  <rect class="s-zfill" x="385" y="215" width="375" height="240" rx="8"/>${T(750, 231, 'PRIVATE SUBNET', 'cap', 'end')}
  <rect class="s-zfill" x="848" y="85" width="252" height="70" rx="10"/>
  <rect class="s-zfill" x="848" y="215" width="252" height="70" rx="10"/>
  <rect class="s-zplain" x="848" y="315" width="252" height="70" rx="10"/>
  <rect class="s-zacc2" x="848" y="425" width="252" height="60" rx="10"/>
  <rect class="s-zacc2" x="848" y="582" width="252" height="60" rx="10"/>

  ${P(1, `${L('in', '190,95 270,95 270,142 326,142')}${L('in', '372,150 446,150')}${L('in', '470,172 470,330 536,330')}${badge(1, 230, 95)}`)}
  ${P(2, `${L('out', '582,318 650,318 650,174')}${L('out', '650,128 650,112 350,112 350,126')}${L('out', '328,158 300,158 300,190 194,190')}${badge(2, 500, 112)}`)}
  ${P(3, `${L('in', '582,338 720,338 720,120 756,120')}${L('in', '802,120 856,120')}${badge(3, 720, 268)}`)}
  ${P(4, `${L('in', '560,352 560,400 666,400')}${L('in', '712,392 800,392 800,250 856,250')}${badge(4, 800, 300)}`)}
  ${P(5, `${L('in', '712,408 815,408 815,350 856,350')}${badge(5, 815, 380)}`)}
  ${P(6, `${L('in', '782,455 846,455', true)}${badge(6, 813, 428)}`)}
  ${P(7, `${L('in', '680,477 680,590', true)}${L('in', '702,612 846,612', true)}${badge(7, 680, 535)}`)}
  ${P(8, `${L('out', '142,590 420,590 420,499')}${T(342, 582, 'IPsec over the internet', 'lbl halo')}${badge(8, 250, 590)}`)}
  ${P(9, `<polyline class="s-e-in" points="142,612 245,612"/>
    <rect class="s-node" x="245" y="594" width="80" height="36" rx="8"/>${T(285, 616, 'DX location', 'lbl strong', 'middle')}
    ${L('in', '325,612 476,612')}${L('in', '522,612 656,612')}${T(589, 604, 'transit VIF', 'lbl halo', 'middle')}${badge(9, 395, 612)}`)}

  ${I('igw', 350, 150)}${T(350, 188, 'Internet gateway', 'lbl halo', 'middle')}
  ${I('alb', 470, 150)}${T(496, 155, 'ALB', 'nt')}
  ${I('nat', 650, 150)}${T(624, 155, 'NAT gateway', 'nt', 'end')}
  ${I('ec2', 560, 330)}${T(560, 298, 'App (EC2, ECS, Lambda)', 'nt halo2', 'middle')}
  ${I('vpce', 780, 120)}${T(780, 158, 'Gateway endpoint', 'lbl halo', 'middle')}
  ${I('privatelink', 690, 400)}${T(690, 438, 'Interface endpoint', 'lbl halo2', 'middle')}
  ${I('vgw', 420, 476)}${T(446, 491, 'Virtual private gateway', 'lbl halo')}
  ${I('peering', 813, 455, 28)}
  ${I('tgw', 680, 612)}${T(680, 652, 'Transit Gateway', 'lbl strong', 'middle')}
  ${I('dx', 500, 612)}${T(500, 652, 'Direct Connect gateway', 'lbl strong', 'middle')}
  ${I('s3', 878, 120, 34)}${I('dynamodb', 920, 120, 34)}${T(946, 116, 'S3 · DynamoDB', 'nt')}${T(946, 132, 'gateway endpoint only', 'lbl')}
  ${I('sqs', 878, 250, 34)}${I('kms', 920, 250, 34)}${T(946, 246, 'Most AWS services', 'nt')}${T(946, 262, 'SQS, KMS, ECR, SSM…', 'lbl')}
  ${I('nlb', 878, 350, 34)}${T(904, 346, 'Provider VPC', 'nt')}${T(904, 362, 'endpoint service on an NLB', 'lbl')}
  ${T(866, 451, 'VPC B · 10.1.0.0/16', 'nt')}${T(866, 467, 'any account or Region', 'lbl')}
  ${T(866, 608, 'VPC C · VPC D · …', 'nt')}${T(866, 624, 'hub and spoke, transitive', 'lbl')}`);

  const paths = [
    [1, 'in', 'Internet gateway', 'Inbound from the internet',
      'A public endpoint must be reachable, usually an ALB in front of private instances.',
      ['The public subnet routes 0.0.0.0/0 to the IGW, and the resource needs a public IP or sits behind a public load balancer.',
        'One per VPC. It scales on its own and is not a single point of failure.'],
      'accessible from the internet · public-facing'],
    [2, 'out', 'NAT gateway', 'Outbound only',
      'Private instances must download patches or call a third-party API, and nothing outside may start a connection in.',
      ['It sits in a public subnet in one AZ. Create one per AZ, or an AZ failure cuts outbound access for the others.',
        'Charged per hour and per GB processed. For outbound-only IPv6, use an egress-only internet gateway instead.'],
      'private subnet needs internet access · no inbound connections'],
    [3, 'in', 'Gateway endpoint', 'S3 and DynamoDB, privately',
      'Instances in the VPC read or write S3 or DynamoDB in the same Region without the internet or a NAT gateway.',
      ['It is a route-table entry, not an ENI. It is free, and only S3 and DynamoDB have one.',
        'Only that VPC can use it: on-premises networks, peered VPCs and Transit Gateway attachments cannot.'],
      'reduce NAT gateway charges for S3 · without traversing the internet'],
    [4, 'in', 'Interface endpoint', 'Most AWS services, privately',
      'Private resources call SQS, KMS, Secrets Manager, ECR, Systems Manager and most other services without the internet.',
      ['It is an ENI with a private IP in your subnet, powered by PrivateLink. Security groups apply, and it is charged per hour per AZ and per GB.',
        'Unlike a gateway endpoint, it is reachable from on-premises over VPN or Direct Connect. That makes it the answer for private S3 access from a data center.'],
      'private connectivity to AWS services · from on-premises'],
    [5, 'in', 'PrivateLink endpoint service', 'Share one service, not a network',
      'A provider offers a service to many consumer VPCs or accounts, such as a SaaS product.',
      ['The provider puts the service behind a Network Load Balancer, and each consumer creates an interface endpoint to it.',
        'Traffic is one-way, from consumer to provider, and overlapping CIDR ranges do not matter.'],
      'SaaS provider · many customer VPCs · overlapping CIDRs'],
    [6, 'in', 'VPC peering', 'Two VPCs, directly',
      'A few VPCs need private, full-network routing between them, across accounts or Regions.',
      ['It is not transitive. If A peers with B and B peers with C, A still cannot reach C.',
        'There is no edge-to-edge routing: A cannot use B’s internet gateway, NAT gateway, VPN or Direct Connect. The CIDR ranges must not overlap.'],
      'connect two VPCs · lowest cost for a few VPCs'],
    [7, 'in', 'Transit Gateway', 'The hub for many networks',
      'Dozens or hundreds of VPCs and on-premises networks must all talk through one place.',
      ['VPCs, VPNs and Direct Connect gateways attach once, and routing between them is transitive. Its route tables can separate environments, such as dev and prod.',
        'It is a regional hub. Share it across accounts with AWS RAM, and peer Transit Gateways to reach other Regions.'],
      'hub and spoke · many VPCs · simplify a peering mesh'],
    [8, 'out', 'Site-to-Site VPN', 'Encrypted, over the internet',
      'On-premises must connect quickly and cheaply, or a backup for Direct Connect is needed.',
      ['IPsec runs from a customer gateway to a virtual private gateway or a Transit Gateway. Each connection has two tunnels.',
        'It is encrypted, but performance varies with the internet. On a Transit Gateway, ECMP across several VPNs adds bandwidth.'],
      'set up quickly · encrypted in transit · backup connection'],
    [9, 'in', 'Direct Connect', 'A dedicated private line',
      'Consistent bandwidth and latency are needed for large or steady hybrid traffic, and weeks of setup are acceptable.',
      ['It is not encrypted by default. Add MACsec or run an IPsec VPN over it when encryption is required.',
        'A Direct Connect gateway reaches VPCs in many Regions: through a private VIF to a virtual private gateway, or a transit VIF to a Transit Gateway. For maximum resilience, use connections at two DX locations.'],
      'consistent network performance · dedicated connection · large data transfers'],
  ];
  // ---- security groups and network ACLs: one request in, its reply out ----
  const fw = svg('ig-sgnacl', 1000, 250, 'A request passes the subnet’s network ACL, then the instance’s security group; the reply needs an outbound NACL rule but no security group rule', `
  <rect class="s-node" x="20" y="96" width="140" height="56" rx="8"/>${T(90, 120, 'Client', 'nt', 'middle')}${T(90, 137, 'calls port 443', 'lbl', 'middle')}
  <rect class="s-zplain" x="350" y="14" width="634" height="226" rx="12"/>${T(470, 234, 'SUBNET', 'cap')}
  <rect class="s-node" x="250" y="34" width="200" height="186" rx="10"/>
  ${T(350, 58, 'Network ACL', 'nt', 'middle')}${T(350, 74, 'subnet edge · stateless', 'lbl', 'middle')}
  ${T(350, 108, 'IN · allow TCP 443', 'mono strong', 'middle')}${T(350, 124, 'rules in number order', 'lbl', 'middle')}
  ${T(350, 168, 'OUT · allow 1024–65535', 'mono strong', 'middle')}${T(350, 184, 'the reply needs its own rule', 'lbl', 'middle')}
  <rect class="s-node-acc" x="540" y="34" width="210" height="186" rx="10"/>
  ${T(645, 58, 'Security group', 'nt', 'middle')}${T(645, 74, 'each ENI · stateful', 'lbl', 'middle')}
  ${T(645, 108, 'IN · allow TCP 443', 'mono strong', 'middle')}${T(645, 124, 'source: CIDR or another SG', 'lbl', 'middle')}
  ${T(645, 168, 'no outbound rule needed', 'mono strong', 'middle')}${T(645, 184, 'replies are tracked', 'lbl', 'middle')}
  ${L('in', '160,112 248,112')}${L('in', '452,112 538,112')}${L('in', '752,112 880,112 880,120')}
  ${I('ec2', 880, 142)}${T(880, 184, 'Instance', 'nt', 'middle')}
  ${L('data', '880,162 880,172 754,172')}${L('data', '538,172 454,172')}${L('data', '248,172 162,172')}`);
  const fwRows = [
    ['Applies to', 'Each network interface (instance, endpoint, load balancer)', 'Each subnet, for everything in it'],
    ['Rules', 'Allow only', 'Allow and deny'],
    ['State', 'Stateful: a reply is let out or in automatically', 'Stateless: the reply needs its own rule, usually ephemeral ports 1024–65535'],
    ['Evaluation', 'All rules together', 'Lowest rule number first, and the first match wins'],
    ['Default', 'A new group allows no inbound and all outbound traffic', 'The default NACL allows everything. A custom NACL denies everything until you add rules.'],
    ['Source or destination', 'CIDR, prefix list, or another security group', 'CIDR only'],
    ['Exam cue', 'allow the app tier only from the web tier’s security group', 'block one IP address or range · deny at the subnet'],
  ];
  const fwHTML = fwRows.map(([k, a, b]) => `
        <tr><th scope="row">${k}</th>${[a, b].map(x => `<td>${k === 'Exam cue' ? `<span class="ig-cue ig-hide" style="display:block">${esc(x)}</span>` : esc(x)}</td>`).join('')}</tr>`).join('');

  const cards = paths.map(([n, kind, name, tag, use, know, cue]) => `
      <article class="ig-card ig-path" id="path-${n}" data-p="${n}" tabindex="0">
        <header><span class="ig-num${kind === 'out' ? ' ig-out' : ''}">${n}</span><div style="flex:1;min-width:0"><h3>${esc(name)}</h3><p class="ig-tag">${esc(tag)}</p></div></header>
        <p class="ig-kv"><b>Use when</b>${esc(use)}</p>
        <ul>${know.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
        <p class="ig-cue ig-hide"><span>Exam cue</span>${esc(cue)}</p>
      </article>`).join('');

  return {
    title: 'VPC Traffic Paths',
    eyebrow: 'Networking',
    lede: 'There are nine ways traffic can enter, leave or cross a VPC. Find the path the question describes, then check the trap that comes with it, and the two firewalls every packet passes.',
    rule: 'Peering and gateway endpoints never pass traffic on to a third network. When routing has to be transitive, the answer is a Transit Gateway.',
    body: `
  <figure class="ig-panel ig-mapfig" id="igMap" style="margin:0">
    <div class="ig-scroll">${map}</div>
    ${LEGEND([['in', 'Private path or request'], ['out', 'Through NAT or the internet'], ['data', 'Data']])}
    <p class="ig-hint">Point at a card, or tap a number on the map, to trace that path on its own.</p>
  </figure>
${section('Pick the path', `<div class="ig-cards">${cards}\n    </div>`)}
${section('Security groups or network ACLs?', `<div class="ig-panel"><div class="ig-scroll">${fw}</div>
      ${LEGEND([['in', 'Request'], ['data', 'Reply']])}</div>
    <div class="ig-panel ig-scroll"><table class="ig-tbl ig-matrix">
      <thead><tr><th></th><th><span>${img('ec2')}Security group</span></th><th><span>${img('nacl')}Network ACL</span></th></tr></thead>
      <tbody>${fwHTML}
      </tbody></table></div>`, 'Traffic into an instance passes both: the subnet’s network ACL first, then the security group on the instance.')}
${section('Traps the exam sets', traps([
      ['A peers with B and B peers with C, so A reaches C.', 'Peering is never transitive. Peer A with C directly, or use a Transit Gateway.'],
      ['On-premises servers use the S3 gateway endpoint over Direct Connect.', 'Gateway endpoints only serve their own VPC. Use an S3 interface endpoint.'],
      ['One NAT gateway serves private subnets in every AZ.', 'If its AZ fails, the others lose outbound access. Put one NAT gateway in each AZ.'],
      ['Direct Connect traffic is encrypted.', 'It is private, not encrypted. Add MACsec, or an IPsec VPN over Direct Connect.'],
      ['The company needs hybrid connectivity this week.', 'Direct Connect takes weeks to provision. Start with a Site-to-Site VPN.'],
      ['Two VPCs have overlapping CIDR ranges.', 'Peering and Transit Gateway routing cannot handle that. Expose the service with PrivateLink.'],
      ['IPv6 instances need outbound-only internet access.', 'NAT gateways translate IPv4 addresses. For outbound-only IPv6, use an egress-only internet gateway.'],
      ['Remote employees need access from their laptops.', 'Site-to-Site VPN joins whole networks. Use AWS Client VPN for individual users.'],
      ['Block one attacker’s IP address with a security group.', 'Security groups only allow. Add a deny rule to the network ACL, or use AWS WAF for HTTP traffic.'],
      ['The NACL allows inbound 443, so the website works.', 'NACLs are stateless. Also allow outbound ephemeral ports 1024–65535 for the replies.'],
      ['Allow the database from the app servers by listing their IPs.', 'Reference the app tier’s security group. It follows instances as Auto Scaling replaces them.'],
      ['A new custom NACL lets traffic through until you add deny rules.', 'A custom NACL denies everything until you add allow rules. Only the default NACL allows all.'],
    ]))}`,
    practice: ['VPC', 'VPC › Gateway endpoints', 'VPC › PrivateLink & interface endpoints', 'VPC › NAT gateways', 'VPC › Security groups', 'VPC › Network ACLs', 'Transit Gateway', 'Direct Connect', 'VPN'],
    foot: `VPC is tagged on ${tagged(['VPC'])} of the ${questions.length} questions in your banks.`,
    script: `(function(){
  var fig = document.getElementById('igMap'), cards = document.querySelectorAll('.ig-path'), pinned = null;
  function show(n){ if (n) fig.dataset.active = n; else delete fig.dataset.active;
    cards.forEach(function(c){ c.classList.toggle('ig-on', c.dataset.p === n); }); }
  cards.forEach(function(c){
    c.addEventListener('mouseenter', function(){ show(c.dataset.p); });
    c.addEventListener('mouseleave', function(){ show(pinned); });
    c.addEventListener('focus', function(){ show(c.dataset.p); });
    c.addEventListener('blur', function(){ show(pinned); });
    c.addEventListener('click', function(){ pinned = pinned === c.dataset.p ? null : c.dataset.p; show(pinned); });
  });
  document.querySelectorAll('.s-badge').forEach(function(b){
    b.addEventListener('click', function(){ var n = b.getAttribute('data-go'); pinned = pinned === n ? null : n; show(pinned); });
  });
})();
`,
  };
};
