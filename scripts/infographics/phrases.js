// Exam Phrase Decoder: how to read a question, a worked example from Set Alpha, phrase → answer groups and look-alikes.
module.exports = ({ questions, bank, esc, img, section }) => {
  const count = re => questions.filter(q => re.test(q.question)).length;

  // Worked example: ALPHA-002. The build fails if its wording changes and a marked phrase disappears.
  const ex = bank.alpha.find(q => q.id === 2);
  let qtext = esc(ex.question);
  for (const [p, k] of [
    ['private subnets', 'con'],
    ['call a third-party fraud-scoring API on the public internet', 'con'],
    ["'too many connections' errors", 'sym'],
    ['highly available', 'con'],
    ['LEAST change to the database', 'qual'],
  ]) {
    if (!qtext.includes(esc(p))) throw new Error('phrases: ALPHA-002 no longer contains "' + p + '"');
    qtext = qtext.replace(esc(p), () => `<mark class="ig-${k}">${esc(p)}</mark>`);
  }
  const verdicts = {
    A: 'An interface endpoint reaches AWS services and PrivateLink services, not a third-party API on the internet.',
    B: 'A publicly accessible database breaks the security the private subnets imply.',
    C: 'A NAT gateway per AZ gives highly available internet access, and RDS Proxy fixes the connections without changing the database.',
    D: 'A Lambda function in a VPC never gets a public IP, so a public subnet gives it no internet access.',
  };
  const correct = String(ex.correct_answer);
  if (correct !== 'C' || Object.keys(ex.options).join() !== 'A,B,C,D') throw new Error('phrases: ALPHA-002 options changed, update the verdicts');
  const opts = Object.entries(ex.options).map(([k, v]) => `
        <li class="${k === correct ? 'ig-ok' : 'ig-x'}"><span class="ig-opt-l">${k}</span><div><p class="ig-opt-t">${esc(v)}</p><p class="ig-opt-w ig-hide">${esc(verdicts[k])}</p></div></li>`).join('');

  const groups = [
    { name: 'LEAST operational overhead', re: /least operational overhead|least (amount of )?(management|administrative) overhead|minimal operational|least effort to (manage|maintain)/i,
      phrases: ['LEAST operational overhead', 'fully managed', 'minimal management'], icons: ['lambda', 'fargate', 'dynamodb'],
      pick: 'The managed or serverless option: Lambda, Fargate, DynamoDB, Aurora Serverless, or a built-in feature such as S3 lifecycle rules or RDS automated backups.',
      trap: 'Software on EC2, cron jobs or custom scripts. They work, but someone has to run them.' },
    { name: 'MOST cost-effective', re: /cost-effective|lowest cost|least cost|least expensive|minimi[sz]e (the )?cost|reduce (the )?cost/i,
      phrases: ['MOST cost-effective', 'lowest cost', 'minimize cost'], icons: ['spot', 'savings', 's3'],
      pick: 'Match the price model to the usage: Spot for interruptible work, Savings Plans for steady load, serverless for spiky load, lifecycle or Intelligent-Tiering for cold data.',
      trap: 'Capacity sized for peak, or a more resilient design than the question asks for.' },
    { name: 'Low latency and performance', re: /lowest latency|low latency|reduce latency|improve (the )?performance|high performance|best performance/i,
      phrases: ['global users', 'lowest latency', 'read-heavy'], icons: ['cloudfront', 'globalacc', 'elasticache'],
      pick: 'CloudFront caches HTTP content near users. Global Accelerator gives static anycast IPs for TCP and UDP. ElastiCache, read replicas or DAX take read load off the database.',
      trap: 'A bigger instance in one Region when the users are spread around the world.' },
    { name: 'Highly available', re: /highly available|high availability|fault[- ]toleran|resilien|availability zone (failure|outage)/i,
      phrases: ['highly available', 'fault tolerant', 'survive an AZ failure'], icons: ['asg', 'elb', 'rds'],
      pick: 'Spread across AZs: an Auto Scaling group in several AZs behind a load balancer, RDS Multi-AZ, and a NAT gateway in each AZ.',
      trap: 'A larger single instance, or a read replica treated as automatic failover.' },
    { name: 'Secure and encrypted', re: /encrypt|securely|most secure/i,
      phrases: ['encrypt at rest', 'control and audit key use', 'rotate automatically'], icons: ['kms', 'secrets', 'cloudhsm'],
      pick: 'KMS customer managed keys when you must control or audit key use. Secrets Manager for automatic rotation. CloudHSM when you need a single-tenant HSM you manage.',
      trap: 'Keys or passwords in code, or SSE-S3 when the question asks you to control the key.' },
    { name: 'Region failure and DR', re: /region(al)? (failure|outage)|disaster recovery|another region|second region|\b(rpo|rto)\b/i,
      phrases: ['Region outage', 'RPO / RTO', 'disaster recovery'], icons: ['aurora', 'route53', 'drs'],
      pick: 'Multi-Region: Aurora Global Database, DynamoDB global tables, S3 Cross-Region Replication and Route 53 failover. Choose the DR strategy from the RTO and RPO.',
      trap: 'Multi-AZ, which never leaves the Region. Also active-active when a pilot light meets the RTO for less.' },
    { name: 'Real-time streams', re: /real[- ]time|stream(ing)? data|clickstream/i,
      phrases: ['real-time', 'near real-time', 'clickstream'], icons: ['kinesis', 'firehose', 'msk'],
      pick: 'Kinesis Data Streams for real time with your own consumers and replay. Amazon Data Firehose for near-real-time delivery to S3, Redshift or OpenSearch without code. MSK for Kafka.',
      trap: 'A batch ETL job, or SQS when several consumers must read the same records.' },
    { name: 'Decouple and absorb spikes', re: /decoupl|asynchronous|absorb|buffer|spikes? in (traffic|requests|orders)/i,
      phrases: ['decouple', 'process asynchronously', 'fan out'], icons: ['sqs', 'sns', 'eventbridge'],
      pick: 'SQS buffers work (FIFO for order). SNS to several SQS queues fans out. EventBridge routes events by rule, from AWS, SaaS or schedules.',
      trap: 'Direct synchronous calls between tiers, which fail together.' },
    { name: 'Minimal changes', re: /(minimal|least|fewest|without|no) (application |code )?(changes|code changes|modifications)|lift[- ]and[- ]shift|rehost/i,
      phrases: ['without code changes', 'minimal changes', 'lift and shift'], icons: ['mq', 'fsxwin', 'mgn'],
      pick: 'The managed version of what already runs: RDS for the same engine, Amazon MQ for ActiveMQ or RabbitMQ, FSx for Windows for SMB, Application Migration Service to rehost.',
      trap: 'A rewrite to SQS, DynamoDB or Lambda. It may be better, but it is not minimal.' },
    { name: 'Credentials and access', re: /temporary credentials|long-term|access keys|least privilege|federat|single sign-on/i,
      phrases: ['temporary credentials', 'no long-term keys', 'least privilege'], icons: ['iamrole', 'idc', 'cognito'],
      pick: 'IAM roles everywhere: instance profiles, task roles, Lambda execution roles. IAM Identity Center for staff, and Cognito for app users.',
      trap: 'Access keys stored on an instance, in code or in environment variables.' },
    { name: 'Moving lots of data', re: /petabyte|terabytes|limited bandwidth|migrat/i,
      phrases: ['petabytes', 'limited bandwidth', 'minimal downtime'], icons: ['snowball', 'datasync', 'dms'],
      pick: 'Snowball Edge for offline bulk transfer. DataSync for ongoing online copies. Storage Gateway when on-premises apps keep using files. DMS for databases with minimal downtime.',
      trap: 'Copying hundreds of terabytes over a slow link that would take months.' },
  ];
  for (const g of groups) g.n = count(g.re);
  groups.sort((a, b) => b.n - a.n);
  const cards = groups.map(g => `
      <article class="ig-card">
        <header><div class="ig-icos">${g.icons.map(img).join('')}</div><h3>${esc(g.name)}</h3><span class="ig-pill ig-n" title="Questions in your banks that use this kind of phrase">${g.n} q</span></header>
        <div class="ig-chips">${g.phrases.map(p => `<span class="ig-chip">${esc(p)}</span>`).join('')}</div>
        <p class="ig-kv ig-hide"><b>Pick</b>${esc(g.pick)}</p>
        <p class="ig-kv ig-bad ig-hide"><b>Trap</b>${esc(g.trap)}</p>
      </article>`).join('');

  const pairs = [
    ['real-time', 'Kinesis Data Streams', 'near real-time', 'Amazon Data Firehose'],
    ['an AZ fails', 'Multi-AZ', 'a Region fails', 'Multi-Region'],
    ['cache HTTP content', 'CloudFront', 'static IPs, TCP or UDP', 'Global Accelerator'],
    ['keep message order', 'SQS FIFO', 'highest throughput', 'SQS standard'],
    ['AWS manages the keys', 'SSE-S3', 'control and audit the keys', 'SSE-KMS'],
    ['interruptible jobs', 'Spot Instances', 'steady 24/7 load', 'Savings Plans'],
    ['access in milliseconds', 'Glacier Instant Retrieval', 'hours are fine', 'Glacier Deep Archive'],
    ['one remote employee', 'AWS Client VPN', 'a whole office network', 'Site-to-Site VPN'],
    ['shared Linux file system', 'Amazon EFS', 'Windows SMB shares', 'FSx for Windows File Server'],
  ];
  const pairHTML = pairs.map(([a, x, b, y]) => `
      <div class="ig-pair"><div><span class="ig-pair-p">${esc(a)}</span><span class="ig-pair-a ig-hide">${esc(x)}</span></div><span class="ig-pair-vs">vs</span><div><span class="ig-pair-p">${esc(b)}</span><span class="ig-pair-a ig-hide">${esc(y)}</span></div></div>`).join('');

  return {
    title: 'Exam Phrase Decoder',
    eyebrow: 'Exam technique',
    lede: 'Most options in an SAA-C03 question work. The wording tells you which one the exam wants. Learn the phrases, the answer each one points to, and the trap it hides.',
    rule: 'Constraints remove options. The MOST or LEAST qualifier picks between the ones that are left.',
    body: `${section('Read every question in four passes', `<ol class="ig-steps">
      <li><span class="ig-step-n">1</span><b>Scenario</b><p>Skim what is being built. It sets the domain but rarely decides the answer.</p></li>
      <li><span class="ig-step-n">2</span><b>Constraints</b><p>Mark every must: private, highly available, within minutes, encrypted. Each one removes options.</p></li>
      <li><span class="ig-step-n">3</span><b>Qualifier</b><p>Find the MOST or LEAST phrase. It decides between the options that still work.</p></li>
      <li><span class="ig-step-n">4</span><b>Eliminate</b><p>Strike each option that breaks a constraint, then pick the survivor that best fits the qualifier.</p></li>
    </ol>`)}
${section('Worked example', `<div class="ig-panel ig-example">
      <div class="ig-keys"><span><i style="background:var(--aws)"></i>Constraint</span><span><i style="background:var(--bad)"></i>Symptom to fix</span><span><i style="background:var(--accent)"></i>Qualifier</span></div>
      <p class="ig-qtext">${qtext}</p>
      <ol class="ig-opts">${opts}
      </ol>
    </div>`, 'Question ALPHA-002 from Set Alpha.')}
${section('Phrase → answer pattern', `<div class="ig-cards">${cards}\n    </div>`,
      `The number on each card counts the questions in your four banks whose wording matches that group, out of ${questions.length}.`)}
${section('Look-alike phrases', `<div class="ig-pairs">${pairHTML}\n    </div>`, 'One word changes the answer. Each pair below is a common switch.')}`,
    foot: `Counts come from matching each group’s phrases against the text of all ${questions.length} questions in Sets Alpha, Beta, Gamma and Delta.`,
  };
};
