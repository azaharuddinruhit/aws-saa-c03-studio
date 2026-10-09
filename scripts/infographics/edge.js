// Edge and DNS: CloudFront vs Global Accelerator, the Route 53 routing policies and DNS features, and traps.
module.exports = ({ questions, tagged, esc, T, I, L, svg, img, LEGEND, traps, section }) => {
  const users = x => `<rect class="s-node" x="${x}" y="110" width="88" height="36" rx="8"/>${T(x + 44, 133, 'Users', 'nt', 'middle')}`;
  const edge = svg('ig-edge', 1000, 270, 'CloudFront caches at the edge; Global Accelerator routes over the AWS network to Regional endpoints', `
  <rect class="s-zplain" x="10" y="10" width="480" height="250" rx="12"/>${T(26, 32, 'CLOUDFRONT', 'cap acc')}
  ${users(22)}
  ${L('in', '110,128 196,128')}
  ${I('cloudfront', 220, 128)}${T(220, 168, 'Edge location', 'nt', 'middle')}${T(220, 184, 'serves cached copies', 'lbl', 'middle')}
  ${L('in', '242,120 300,120 300,80 396,80')}${L('in', '242,136 300,136 300,190 396,190')}${T(308, 140, 'only on a cache miss', 'lbl halo')}
  ${I('s3', 420, 80, 36)}${T(420, 116, 'S3, private via OAC', 'lbl strong', 'middle')}
  ${I('alb', 420, 190, 36)}${T(420, 226, 'ALB or custom origin', 'lbl strong', 'middle')}

  <rect class="s-zplain" x="510" y="10" width="480" height="250" rx="12"/>${T(526, 32, 'GLOBAL ACCELERATOR', 'cap acc')}
  ${users(522)}
  ${L('in', '610,128 696,128')}
  ${I('globalacc', 720, 128)}${T(720, 168, 'Two static anycast IPs', 'nt', 'middle')}${T(720, 184, 'enter at the nearest edge', 'lbl', 'middle')}
  ${L('in', '742,120 800,120 800,80 896,80')}${T(808, 72, 'AWS network', 'lbl halo')}
  ${L('alt', '742,136 800,136 800,190 896,190')}${T(794, 206, 'health-check failover', 'lbl halo', 'end')}
  ${I('alb', 920, 80, 36)}${T(920, 116, 'Region A · ALB', 'lbl strong', 'middle')}
  ${I('nlb', 920, 190, 36)}${T(920, 226, 'Region B · NLB', 'lbl strong', 'middle')}`);

  const cmp = [
    ['Traffic', 'HTTP, HTTPS, WebSocket, gRPC', 'Any TCP or UDP application'],
    ['Caching', 'Yes, at edge locations', 'No. Every request reaches an endpoint.'],
    ['IP addresses', 'Many shared edge IPs that change, unless you opt in to an anycast static IP list', 'Two static anycast IPv4 addresses, built in'],
    ['Failover', 'Origin groups switch to a second origin', 'Health checks shift traffic between Regional endpoints'],
    ['Also does', 'Signed URLs and cookies, origin access control for S3, AWS WAF, geo restriction, CloudFront Functions and Lambda@Edge', 'Traffic dials and endpoint weights, client affinity'],
    ['Exam cue', 'static content · global users · cache · private S3 behind a CDN', 'static IP allow list · UDP gaming or VoIP · fast Regional failover'],
  ];
  const cmpHTML = cmp.map(([k, a, b]) => `
        <tr><th scope="row">${k}</th>${[a, b].map(x => `<td>${k === 'Exam cue' ? `<span class="ig-cue ig-hide" style="display:block">${esc(x)}</span>` : esc(x)}</td>`).join('')}</tr>`).join('');

  const policies = [
    ['Simple', 'One record with one or more values, and no health checks.', 'a single resource'],
    ['Weighted', 'Splits traffic between records by weight.', 'blue/green · send 10% to the new version'],
    ['Latency', 'Answers with the Region that gives the user the lowest measured latency.', 'fastest Region for each user'],
    ['Failover', 'Sends traffic to the primary while its health check passes, else to the secondary.', 'active-passive · DR site'],
    ['Geolocation', 'Answers by the user’s continent, country or US state. Add a default record for everyone else.', 'content by country · data must stay in a country'],
    ['Geoproximity', 'Answers by distance between user and resource, and a bias grows or shrinks each resource’s area.', 'shift traffic between Regions by distance'],
    ['Multivalue answer', 'Returns several healthy records at random, so clients spread their load.', 'simple load spreading with health checks'],
    ['IP-based', 'Answers by the client’s IP range (CIDR block).', 'route by ISP or known network'],
  ];
  const policyHTML = policies.map(([name, text, cue]) => `
      <article class="ig-card">
        <header>${img('route53')}<h3>${esc(name)}</h3></header>
        <p style="font-size:14px">${esc(text)}</p>
        <p class="ig-cue ig-hide"><span>Exam cue</span>${esc(cue)}</p>
      </article>`).join('');

  const note = (t, p) => `<div class="ig-note"><b>${t}</b><p>${p}</p></div>`;
  return {
    title: 'Edge and DNS',
    eyebrow: 'Networking',
    lede: 'How users reach your application: CloudFront or Global Accelerator at the edge, and the Route 53 routing policy that decides where each user goes.',
    rule: 'Cache HTTP with CloudFront, and give TCP or UDP static IPs with Global Accelerator. In Route 53, pick the routing policy from what the question optimizes: speed, location, weight or failover.',
    body: `${section('CloudFront or Global Accelerator?', `<div class="ig-panel"><div class="ig-scroll">${edge}</div>
      ${LEGEND([['in', 'Request'], ['alt', 'Failover']])}</div>
    <div class="ig-panel ig-scroll"><table class="ig-tbl ig-matrix">
      <thead><tr><th></th><th><span>${img('cloudfront')}CloudFront</span></th><th><span>${img('globalacc')}Global Accelerator</span></th></tr></thead>
      <tbody>${cmpHTML}
      </tbody></table></div>`)}
${section('Route 53 routing policies', `<div class="ig-cards">${policyHTML}\n    </div>
    <div class="ig-notes">
      ${note('Alias records', 'Point a name, even the zone apex, at CloudFront, a load balancer, an S3 website or API Gateway. A CNAME cannot sit at the apex.')}
      ${note('Health checks', 'Check an endpoint, combine other checks, or follow a CloudWatch alarm for resources Route 53 cannot reach.')}
      ${note('Private hosted zones', 'Names that resolve only inside the VPCs you associate.')}
      ${note('Resolver endpoints', 'Inbound endpoints let on-premises DNS resolve AWS names. Outbound endpoints forward AWS queries to on-premises DNS.')}
      ${note('Resolver DNS Firewall', 'Blocks or allows the domains that resources in your VPCs may look up.')}
      ${note('TTL', 'Lower the TTL before a migration or failover test, so clients pick up a changed record quickly.')}
    </div>`)}
${section('Traps the exam sets', traps([
      ['Put CloudFront in front of a UDP game server.', 'CloudFront handles HTTP. Use Global Accelerator.'],
      ['Use Global Accelerator to cache images.', 'It caches nothing. Use CloudFront.'],
      ['Make the bucket public so CloudFront can read it.', 'Keep the bucket private and let CloudFront in with origin access control (OAC).'],
      ['Block users in some countries with Route 53 geolocation.', 'Geolocation chooses an answer, it does not block anyone. Use CloudFront geo restriction or AWS WAF.'],
      ['Speed up uploads to S3 from around the world with Global Accelerator.', 'Use S3 Transfer Acceleration, which enters AWS at the nearest edge location.'],
      ['Latency routing keeps EU users’ data in the EU.', 'Latency routing picks the fastest Region. Geolocation routing decides by where users are.'],
      ['Add health checks to simple routing.', 'Simple routing has none. Use failover, weighted or multivalue answer routing with health checks.'],
      ['Create a CNAME record at the zone apex.', 'The apex cannot hold a CNAME. Use an alias record.'],
    ]))}`,
    practice: ['CloudFront', 'Global Accelerator', 'Route 53', 'Route 53 › Routing policies', 'Route 53 › Failover & health checks'],
    foot: `CloudFront, Global Accelerator and Route 53 are tagged on ${tagged(['CloudFront', 'Global Accelerator', 'Route 53'])} of the ${questions.length} questions in your banks.`,
  };
};
