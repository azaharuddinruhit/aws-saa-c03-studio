// Queues, Streams and DR: SQS vs SNS vs EventBridge vs Kinesis vs Firehose, SQS settings, and the DR ladder.
module.exports = ({ questions, tagged, esc, T, I, L, svg, img, LEGEND, traps, section }) => {
  // ---- five patterns, one small diagram each ----
  const mini = (label, left, icon, name, sub, rights) => {
    const ys = rights.length === 2 ? [50, 120] : [35, 85, 135];
    return svg('ig-mini', 320, 170, label, `
  <rect class="s-node" x="8" y="67" width="86" height="36" rx="8"/>${T(51, 89, left, 'lbl strong', 'middle')}
  ${L('in', '94,85 126,85')}
  ${I(icon, 150, 80)}${T(150, 122, name, 'nt', 'middle')}${T(150, 138, sub, 'lbl', 'middle')}
  ${rights.map((r, i) => `${L('in', `172,80 204,80 204,${ys[i]} 220,${ys[i]}`)}<rect class="s-node" x="222" y="${ys[i] - 16}" width="92" height="32" rx="8"/>${T(268, ys[i] + 4, r, 'lbl strong', 'middle')}`).join('')}`);
  };
  const patterns = [
    ['Queue', 'SQS', mini('SQS: each message goes to one worker', 'Producer', 'sqs', 'SQS queue', 'workers poll', ['Worker', 'Worker']),
      'Each message is processed by one worker, then deleted. The queue absorbs spikes so the workers can run at their own pace.'],
    ['Fan-out', 'SNS', mini('SNS: every subscriber gets a copy', 'Publisher', 'sns', 'SNS topic', 'pushes copies', ['SQS queue', 'Lambda', 'Email · HTTP']),
      'Every subscriber gets its own copy. Put an SQS queue behind each subscriber that must not miss a message.'],
    ['Event routing', 'EventBridge', mini('EventBridge: rules route events to targets', 'Events', 'eventbridge', 'Event bus', 'rules match', ['Lambda', 'Step Functions', 'SQS queue']),
      'Rules match event content and send it to targets. Takes events from AWS services, SaaS partners and schedules.'],
    ['Stream', 'Kinesis Data Streams', mini('Kinesis Data Streams: every consumer reads every record', 'Producers', 'kinesis', 'Data stream', 'kept, in order', ['Analytics', 'Lambda', 'Archive']),
      'Records stay in the stream, in order per shard, and every consumer reads all of them, at its own pace, and can replay.'],
    ['Delivery', 'Amazon Data Firehose', mini('Data Firehose: buffered delivery to storage and analytics', 'Stream source', 'firehose', 'Firehose', 'buffers data', ['S3', 'Redshift', 'OpenSearch']),
      'Buffers incoming data and loads it into a destination with no code to write. Near real time, because it waits to fill a buffer.'],
  ];
  const patternHTML = patterns.map(([kind, name, fig, text]) => `
      <article class="ig-card">
        <header><div style="flex:1;min-width:0"><h3>${esc(name)}</h3><p class="ig-tag">${esc(kind)}</p></div></header>
        ${fig}
        <p style="font-size:14px">${esc(text)}</p>
      </article>`).join('');

  const rows = [
    ['sqs', 'SQS', 'Consumers pull', 'FIFO queues keep order. Standard queues may reorder and repeat.', 'One consumer', 'Days, up to 14', 'buffer work between tiers · absorb spikes'],
    ['sns', 'SNS', 'Pushes to subscribers', 'FIFO topics keep order, delivering to SQS FIFO queues.', 'Every subscriber', 'No. It retries delivery.', 'one event to many receivers'],
    ['eventbridge', 'EventBridge', 'Pushes by rule', 'Not guaranteed', 'Every matching rule’s targets', 'Only in an archive, for replay', 'react to AWS, SaaS or scheduled events'],
    ['kinesis', 'Kinesis Data Streams', 'Consumers pull', 'Per shard, by partition key', 'Every consumer, with replay', '24 hours by default, up to 365 days', 'real-time analytics · several consumers'],
    ['firehose', 'Data Firehose', 'Pushes to a destination', 'Not relevant', 'The destination', 'Only while buffering', 'load streams into S3, Redshift or OpenSearch'],
  ];
  const rowHTML = rows.map(([icon, name, model, order, who, keeps, cue]) => `
        <tr><th scope="row"><div class="ig-ans">${img(icon)}<span>${name}</span></div></th><td>${esc(model)}</td><td>${esc(order)}</td><td>${esc(who)}</td><td>${esc(keeps)}</td><td><span class="ig-cue ig-hide" style="display:block">${esc(cue)}</span></td></tr>`).join('');

  // ---- the DR ladder ----
  const tiers = [
    ['Backup and restore', 'hours', ['Only backups and snapshots', 'Rebuild the rest from code'], ['backup', 's3', 'cfn']],
    ['Pilot light', 'tens of minutes', ['Data replicated live', 'App servers off until failover'], ['aurora', 'drs', 'route53']],
    ['Warm standby', 'minutes', ['A small full copy is running', 'Scale it up on failover'], ['asg', 'aurora', 'route53']],
    ['Multi-site active/active', 'near zero', ['Full capacity in both Regions', 'Both serve traffic all the time'], ['dynamodb', 'globalacc', 'route53']],
  ];
  let dr = `${L('data', '20,36 1080,36')}${T(20, 24, 'LOWER RTO AND RPO · HIGHER COST', 'cap')}`;
  tiers.forEach(([name, rto, lines, icons], i) => {
    const x = 20 + i * 268, top = 200 - i * 45, mix = 30 + i * 22;
    dr += `<rect x="${x}" y="${top}" width="258" height="${360 - top}" rx="10" style="fill:color-mix(in srgb,var(--accent-soft) ${mix}%,var(--surface-2))"/>
  <rect x="${x}" y="${top}" width="258" height="4" rx="2" style="fill:color-mix(in srgb,var(--accent) ${mix}%,var(--muted))"/>
  ${T(x + 16, top + 30, name, 'big')}${T(x + 16, top + 50, 'RTO · RPO: ' + rto, 'mono acc')}
  ${lines.map((l, j) => T(x + 16, top + 76 + j * 18, l)).join('')}
  ${icons.map((k, j) => I(k, x + 32 + j * 40, top + 132, 30)).join('')}`;
  });
  const ladder = svg('ig-dr', 1100, 372, 'Disaster recovery strategies from backup and restore to multi-site', dr);

  const note = (t, p) => `<div class="ig-note"><b>${t}</b><p>${p}</p></div>`;
  return {
    title: 'Queues, Streams and DR',
    eyebrow: 'Integration and recovery',
    lede: 'Five ways to pass messages between services, the SQS settings the exam asks about, and the four disaster recovery strategies from cheapest to fastest.',
    rule: 'Ask who must receive each message: one worker means SQS, every subscriber means SNS, a routed event means EventBridge, and replay for many readers means Kinesis.',
    body: `${section('Five ways to connect services', `<div class="ig-cards">${patternHTML}\n    </div>`)}
${section('Side by side', `<div class="ig-panel ig-scroll"><table class="ig-tbl ig-msg">
      <thead><tr><th>Service</th><th>Delivery</th><th>Order</th><th>Each message reaches</th><th>Keeps data</th><th>Use when</th></tr></thead>
      <tbody>${rowHTML}
      </tbody></table></div>`)}
${section('SQS settings the exam asks about', `<div class="ig-notes">
      ${note('Visibility timeout', 'Hides a message while a worker processes it. Set it longer than the processing time, or another worker picks the message up again.')}
      ${note('Dead-letter queue', 'Receives messages that failed too many times, so one bad message does not block the queue.')}
      ${note('Long polling', 'Waits for messages instead of returning empty, which cuts empty receives and cost.')}
      ${note('Delay queue', 'Holds new messages back for a set time before workers can see them.')}
      ${note('FIFO groups and deduplication', 'Message groups keep order per group, and deduplication drops repeats within a short window, for exactly-once processing.')}
      ${note('Large payloads', 'Store the body in S3 and send a pointer, which the SQS Extended Client Library does for you.')}
    </div>`)}
${section('Also in this space', `<div class="ig-notes">
      ${note('Step Functions', 'Orchestrates steps with retries, branches, waits and human approval. The answer when the workflow itself must be managed.')}
      ${note('Amazon MQ', 'Managed ActiveMQ and RabbitMQ. The answer when existing apps speak JMS, AMQP or MQTT and must not be rewritten.')}
      ${note('Amazon MSK', 'Managed Apache Kafka, for teams already on Kafka.')}
    </div>`)}
${section('The DR ladder', `<div class="ig-panel"><div class="ig-scroll">${ladder}</div></div>
    <div class="ig-notes">
      ${note('RPO', 'How much data you can lose, measured as the time since the last good copy.')}
      ${note('RTO', 'How long the service can be down before it is back.')}
      ${note('Pick the cheapest that fits', 'Choose the lowest rung whose RTO and RPO meet the requirement. Anything higher costs more for no gain.')}
      ${note('AWS Elastic Disaster Recovery', 'Replicates servers block by block into low-cost staging and launches them on failover, from on-premises or another Region.')}
      ${note('AWS Backup', 'Central backup plans, with copies to another Region or account. Vault Lock makes them immutable.')}
      ${note('Route 53 failover', 'Health checks move DNS to the standby Region. Application Recovery Controller adds readiness checks and manual routing switches.')}
    </div>`, 'Each rung keeps more running in the recovery Region, so recovery is faster and the bill is higher.')}
${section('Traps the exam sets', traps([
      ['A standard SQS queue processes orders in sequence.', 'Standard queues can reorder and repeat. Use a FIFO queue.'],
      ['One SQS queue delivers every order to three services.', 'Each message goes to one consumer. Fan out with SNS to a queue per service, or use EventBridge.'],
      ['Use Kinesis Data Streams as a simple job queue.', 'For jobs that each need one worker, SQS is simpler and cheaper.'],
      ['Firehose runs custom code on every record within a second.', 'Firehose buffers before delivery. Use Kinesis Data Streams with your own consumers.'],
      ['Messages are processed twice, so raise the retention period.', 'The visibility timeout is shorter than the processing time. Raise the visibility timeout.'],
      ['A message that always fails blocks the queue.', 'Set a dead-letter queue with a maximum receive count.'],
      ['Pilot light serves full traffic the moment the Region fails.', 'Its app servers must start and scale first. Warm standby is already serving.'],
      ['Multi-site active/active is the cheapest DR that works.', 'Backup and restore is cheapest. Pick the lowest rung that meets the RTO and RPO.'],
    ]))}`,
    practice: ['SQS', 'SQS › FIFO queues', 'SNS', 'EventBridge', 'Kinesis Data Streams', 'Data Firehose', 'DR strategies', 'Backup'],
    foot: `SQS, SNS, EventBridge, Kinesis Data Streams and Data Firehose are tagged on ${tagged(['SQS', 'SNS', 'EventBridge', 'Kinesis Data Streams', 'Data Firehose'])} of the ${questions.length} questions in your banks, and DR strategies, AWS Backup and Elastic Disaster Recovery on ${tagged(['DR strategies', 'Backup', 'Elastic Disaster Recovery'])}.`,
  };
};
