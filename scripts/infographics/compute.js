// Compute and Scaling: EC2 purchase options, Auto Scaling, load balancers, placement groups and traps.
module.exports = ({ questions, tagged, esc, T, I, L, svg, img, LEGEND, traps, section }) => {
  // ---- purchase option tree ----
  const q = (cx, cy, w, t) => `<rect class="s-node" x="${cx - w / 2}" y="${cy - 22}" width="${w}" height="44" rx="8"/>${T(cx, cy + 4, t, 'nt', 'middle')}`;
  const leaf = (cx, cy, w, t, s) => `<rect class="s-node-acc" x="${cx - w / 2}" y="${cy - 24}" width="${w}" height="48" rx="10"/>${T(cx, cy - 3, t, 'nt', 'middle')}${T(cx, cy + 13, s, 'lbl', 'middle')}`;
  const tree = svg('ig-tree', 1000, 330, 'Decision tree for choosing an EC2 purchase option', `
  ${L('data', '360,40 272,40')}${T(316, 32, 'Yes', 'lbl strong', 'middle')}
  ${L('data', '500,62 500,98')}${T(508, 84, 'No', 'lbl strong')}
  ${L('data', '650,120 728,120')}${T(689, 112, 'No', 'lbl strong', 'middle')}
  ${L('data', '500,142 500,178')}${T(508, 164, 'Yes', 'lbl strong')}
  ${L('data', '430,222 430,246 300,246 300,264')}${T(365, 240, 'Yes', 'lbl strong', 'middle')}
  ${L('data', '570,222 570,246 700,246 700,264')}${T(635, 240, 'No', 'lbl strong', 'middle')}
  ${q(500, 40, 280, 'Can the work be interrupted?')}
  ${q(500, 120, 300, 'Steady use for one or three years?')}
  ${q(500, 200, 340, 'Same instance family and Region throughout?')}
  ${leaf(170, 40, 200, 'Spot Instances', 'spare capacity, 2-minute notice')}
  ${leaf(830, 120, 200, 'On-Demand', 'no commitment')}
  ${leaf(300, 288, 260, 'EC2 Instance Savings Plan', 'or a Standard Reserved Instance')}
  ${leaf(700, 288, 260, 'Compute Savings Plan', 'any family or Region, Fargate, Lambda')}`);

  const options = [
    ['ec2', 'On-Demand', 'none', 'Pay for what you use, with no commitment. For short, spiky or unpredictable work, and for anything you are still sizing.'],
    ['spot', 'Spot Instances', 'none', 'Spare capacity at a deep discount that AWS can reclaim with a two-minute notice. For stateless, batch, CI and other fault-tolerant work.'],
    ['savings', 'Savings Plans', '1 or 3 years', 'Commit to a spend per hour. Compute Savings Plans follow you across families, sizes, Regions, Fargate and Lambda. EC2 Instance Savings Plans fix one family in one Region for a bigger discount.'],
    ['savings', 'Reserved Instances', '1 or 3 years', 'Standard RIs give the biggest discount for a fixed type. Convertible RIs can be exchanged. Only a zonal RI also reserves capacity.'],
    ['ec2', 'On-Demand Capacity Reservation', 'none', 'Guarantees capacity in one AZ for as long as you keep it, billed whether used or not. Pair it with a Savings Plan for the discount.'],
    ['ec2', 'Dedicated Host or Instance', 'optional', 'A Dedicated Host is a whole physical server you can see down to its sockets and cores, the answer for licences tied to them. A Dedicated Instance runs on hardware no other account uses, without that visibility, which is enough for single-tenancy compliance.'],
  ];
  const optionHTML = options.map(([icon, name, commit, text]) => `
      <article class="ig-card">
        <header>${img(icon)}<h3>${esc(name)}</h3><span class="ig-pill ${commit === 'none' ? 'ig-n' : 'ig-no'}">${commit === 'none' ? 'No commitment' : commit === 'optional' ? 'On-Demand or reserved' : commit}</span></header>
        <p style="font-size:14px">${esc(text)}</p>
      </article>`).join('');

  // ---- Auto Scaling anatomy ----
  const asg = svg('ig-asg', 1000, 300, 'An Auto Scaling group behind a load balancer, scaled by a policy on a CloudWatch metric', `
  <rect class="s-node" x="20" y="126" width="190" height="52" rx="8"/>${T(36, 148, 'Launch template', 'nt')}${T(36, 165, 'AMI, type, security groups', 'lbl')}
  ${L('data', '210,152 256,152')}
  <rect class="s-zdash" x="260" y="70" width="440" height="210" rx="12"/>${T(276, 275, 'AUTO SCALING GROUP · MIN 2 · DESIRED 4 · MAX 10', 'cap')}
  <rect class="s-zfill" x="280" y="90" width="190" height="162" rx="10"/>${T(292, 108, 'AZ A', 'cap')}
  <rect class="s-zfill" x="490" y="90" width="190" height="162" rx="10"/>${T(502, 108, 'AZ B', 'cap')}
  ${I('alb', 480, 30, 36)}${T(504, 26, 'Load balancer', 'nt')}
  ${L('in', '462,40 375,40 375,150')}${L('in', '498,40 585,40 585,150')}
  ${I('ec2', 340, 180, 34)}${I('ec2', 410, 180, 34)}${I('ec2', 550, 180, 34)}${I('ec2', 620, 180, 34)}
  ${I('cloudwatch', 850, 110, 36)}${T(850, 148, 'CloudWatch metric', 'nt', 'middle')}${T(850, 164, 'CPU, requests per target,', 'lbl', 'middle')}${T(850, 178, 'queue backlog per instance', 'lbl', 'middle')}
  ${L('alt', '850,184 850,210')}
  <rect class="s-node-acc" x="760" y="212" width="180" height="44" rx="10"/>${T(850, 231, 'Scaling policy', 'nt', 'middle')}${T(850, 246, 'adds or removes instances', 'lbl', 'middle')}
  ${L('alt', '760,234 702,234')}`);

  const policies = [
    ['Target tracking', 'Keeps a metric at a target, like a thermostat: CPU at 50%, requests per target, or SQS backlog per instance.', 'the default answer · keep CPU at 50%'],
    ['Step scaling', 'Adds or removes more capacity the further a CloudWatch alarm is breached.', 'scale by how large the breach is'],
    ['Simple scaling', 'One adjustment per alarm, then a cooldown. Older and slower to react than step or target tracking.', 'rarely the best answer'],
    ['Scheduled scaling', 'Changes min, max or desired capacity at set times.', 'known peaks · every weekday at 9 am'],
    ['Predictive scaling', 'Forecasts load from history and adds capacity before a recurring rise.', 'daily or weekly cycles · capacity ready in advance'],
  ];
  const policyHTML = policies.map(([name, text, cue]) => `
      <article class="ig-card">
        <header>${img('asg')}<h3>${esc(name)}</h3></header>
        <p style="font-size:14px">${esc(text)}</p>
        <p class="ig-cue ig-hide"><span>Exam cue</span>${esc(cue)}</p>
      </article>`).join('');

  // ---- load balancers ----
  const lbRows = [
    ['Layer', '7 (application)', '4 (transport)', '3 (network gateway)'],
    ['Traffic', 'HTTP, HTTPS, gRPC, WebSocket', 'TCP, UDP, TLS', 'All IP packets, wrapped in GENEVE'],
    ['Routes on', 'Path, host, header, query string, method, source IP', 'Port and connection', 'Each flow, kept on one appliance'],
    ['Static IP', 'No. Put Global Accelerator or an NLB in front.', 'Yes, one per AZ, and it can use Elastic IPs', 'No'],
    ['Targets', 'Instances, IPs, containers, Lambda functions', 'Instances, IPs, an ALB', 'Firewall and inspection appliances'],
    ['Also does', 'TLS termination, sign-in with Cognito or OIDC, AWS WAF, redirects, sticky sessions', 'Keeps the client IP, very low latency, millions of requests per second, fronts PrivateLink services', 'Inserts third-party firewalls into the traffic path, reached through GWLB endpoints'],
    ['Exam cue', 'path-based routing · microservices · Lambda targets', 'static IP · UDP · extreme performance · PrivateLink', 'third-party firewall appliances · inspect all traffic'],
  ];
  const lbHTML = lbRows.map(([k, ...v]) => `
        <tr><th scope="row">${k}</th>${v.map(x => `<td>${k === 'Exam cue' ? `<span class="ig-cue ig-hide" style="display:block">${esc(x)}</span>` : esc(x)}</td>`).join('')}</tr>`).join('');

  const note = (t, p) => `<div class="ig-note"><b>${t}</b><p>${p}</p></div>`;
  return {
    title: 'Compute and Scaling',
    eyebrow: 'Compute',
    lede: 'How to pay for EC2, how an Auto Scaling group decides how many instances to run, and which load balancer goes in front of them.',
    rule: 'Price by how the work behaves, scale on the metric that measures the work, and pick the load balancer by the layer the question routes on.',
    body: `${section('Pick a purchase option', `<div class="ig-panel"><div class="ig-scroll">${tree}</div></div>
    <div class="ig-cards">${optionHTML}\n    </div>`, 'Answer the three questions, then check the cards for the special cases: capacity guarantees and licensing.')}
${section('How Auto Scaling works', `<div class="ig-panel"><div class="ig-scroll">${asg}</div>
      ${LEGEND([['in', 'Requests'], ['data', 'Launches from'], ['alt', 'Scaling decision']])}</div>
    <div class="ig-cards">${policyHTML}\n    </div>
    <div class="ig-notes">
      ${note('Scale on the right metric', 'For queue workers, divide the queue depth by the number of instances and track that backlog per instance. CPU does not show waiting work.')}
      ${note('Warm pools', 'Keep pre-initialized instances stopped and ready, so scale-out skips a slow boot.')}
      ${note('Lifecycle hooks', 'Pause an instance while launching or terminating to install software or copy off logs.')}
      ${note('ELB health checks', 'Turn them on so the group replaces instances the load balancer marks unhealthy, not only ones that fail EC2 checks.')}
      ${note('Mixed instances policy', 'Combine On-Demand and Spot across several instance types to keep Spot capacity available.')}
    </div>`)}
${section('ALB, NLB or GWLB?', `<div class="ig-panel ig-scroll"><table class="ig-tbl ig-matrix">
      <thead><tr><th></th><th><span>${img('alb')}ALB</span></th><th><span>${img('nlb')}NLB</span></th><th><span>${img('gwlb')}GWLB</span></th></tr></thead>
      <tbody>${lbHTML}
      </tbody></table></div>`)}
${section('Placement groups', `<div class="ig-notes">
      ${note('Cluster', 'Packs instances close together in one AZ for the lowest latency and highest throughput between them. For HPC and tightly coupled jobs.')}
      ${note('Spread', 'Puts each instance on separate hardware. For a few critical instances that must not fail together.')}
      ${note('Partition', 'Splits instances into partitions on separate racks. For large distributed systems such as Hadoop, Cassandra and Kafka.')}
    </div>`)}
${section('Traps the exam sets', traps([
      ['Run the primary database on Spot Instances to save money.', 'Spot can be reclaimed at any time. Keep it for stateless, fault-tolerant work.'],
      ['Buy Reserved Instances for a three-month project.', 'The shortest term is one year. Use On-Demand, or Spot if the work can be interrupted.'],
      ['Scale queue workers on CPU utilization.', 'Track the queue backlog per instance with target tracking.'],
      ['Give partners an ALB IP address for their allow list.', 'An ALB has no static IP. Use an NLB, or Global Accelerator in front of the ALB.'],
      ['Use an NLB to route /api and /images to different services.', 'Path routing is layer 7. Use an ALB.'],
      ['Dedicated Instances satisfy per-core licensing.', 'Licences tied to physical cores need a Dedicated Host.'],
      ['A Savings Plan guarantees capacity in an AZ.', 'Savings Plans only give a discount. Use an On-Demand Capacity Reservation or a zonal RI.'],
      ['Scheduled scaling handles unpredictable spikes.', 'Scheduled scaling is for known times. Target tracking reacts to the load itself.'],
    ]))}`,
    practice: ['EC2', 'EC2 › Spot Instances', 'EC2 › Reserved Instances & Savings Plans', 'EC2 Auto Scaling', 'Elastic Load Balancing', 'Elastic Load Balancing › ALB', 'Elastic Load Balancing › NLB'],
    foot: `EC2, EC2 Auto Scaling and Elastic Load Balancing are tagged on ${tagged(['EC2', 'EC2 Auto Scaling', 'Elastic Load Balancing'])} of the ${questions.length} questions in your banks.`,
  };
};
