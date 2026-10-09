// Database Chooser: failover vs read scaling vs global, a problem → fix matrix, an engine picker and traps.
module.exports = ({ questions, tagged, esc, T, I, L, svg, img, LEGEND, traps, section }) => {
  const mini = (label, body) => svg('ig-mini', 360, 230, label, body);
  const app = `<rect class="s-node" x="135" y="14" width="90" height="32" rx="8"/>${T(180, 35, 'App', 'nt', 'middle')}`;

  const multiAZ = mini('RDS Multi-AZ: a synchronous standby in a second AZ', `${app}
  <rect class="s-zdash" x="15" y="76" width="160" height="140" rx="10"/>${T(27, 93, 'AZ A', 'cap')}
  <rect class="s-zdash" x="185" y="76" width="160" height="140" rx="10"/>${T(197, 93, 'AZ B', 'cap')}
  ${L('in', '160,46 160,62 95,62 95,116')}${L('alt', '200,46 200,62 265,62 265,116')}
  ${L('data', '117,140 243,140')}${T(180, 132, 'sync', 'lbl strong', 'middle')}
  ${I('rds', 95, 140)}${I('rds', 265, 140)}
  ${T(95, 180, 'Primary', 'nt', 'middle')}${T(95, 196, 'reads and writes', 'lbl', 'middle')}
  ${T(265, 180, 'Standby', 'nt', 'middle')}${T(265, 196, 'no reads', 'lbl', 'middle')}`);

  const replicas = mini('RDS read replicas: asynchronous, readable copies', `${app}
  <rect class="s-zdash" x="236" y="76" width="112" height="140" rx="10"/>${T(246, 93, 'REGION 2', 'cap')}
  ${L('in', '150,46 150,62 70,62 70,116')}${T(98, 58, 'writes', 'lbl strong')}
  ${L('in', '200,46 200,62 180,62 180,116')}${L('in', '210,46 210,62 292,62 292,116')}${T(222, 58, 'reads', 'lbl strong')}
  ${L('data', '92,140 156,140')}${T(124, 132, 'async', 'lbl strong', 'middle')}
  ${L('data', '70,162 70,206 292,206 292,164')}${T(181, 200, 'async, cross-Region', 'lbl strong halo', 'middle')}
  ${I('rds', 70, 140)}${I('rds', 180, 140)}${I('rds', 292, 140)}
  ${T(70, 180, 'Primary', 'nt', 'middle')}${T(180, 180, 'Replica', 'nt', 'middle')}${T(292, 180, 'Replica', 'nt', 'middle')}`);

  const aurora = mini('Aurora: a writer and readers share one cluster volume', `${app}
  ${L('in', '160,46 160,62 70,62 70,98')}${T(80, 58, 'writer endpoint', 'lbl strong')}
  ${L('in', '200,46 200,62 290,62 290,98')}${L('in', '200,62 180,62 180,98')}${T(212, 58, 'reader endpoint', 'lbl strong')}
  ${L('data', '70,142 70,168', true)}${L('data', '180,142 180,168', true)}${L('data', '290,142 290,168', true)}
  ${I('aurora', 70, 120)}${I('aurora', 180, 120)}${I('aurora', 290, 120)}
  ${T(92, 124, 'W', 'cap acc')}${T(202, 124, 'R', 'cap')}${T(312, 124, 'R', 'cap')}
  <rect class="s-zsoft" x="20" y="170" width="320" height="46" rx="10"/>
  ${T(180, 190, 'Shared cluster volume', 'nt', 'middle')}${T(180, 206, '6 copies across 3 AZs', 'lbl', 'middle')}`);

  const global = mini('Global: Aurora Global Database and DynamoDB global tables', `
  <rect class="s-zplain" x="15" y="14" width="160" height="202" rx="10"/>${T(27, 32, 'REGION 1', 'cap')}
  <rect class="s-zplain" x="185" y="14" width="160" height="202" rx="10"/>${T(197, 32, 'REGION 2', 'cap')}
  ${L('data', '117,72 243,72')}${T(180, 64, 'storage-level', 'lbl strong', 'middle')}
  ${I('aurora', 95, 72)}${I('aurora', 265, 72)}
  ${T(95, 112, 'Primary cluster', 'nt', 'middle')}${T(95, 127, 'reads and writes', 'lbl', 'middle')}
  ${T(265, 112, 'Secondary', 'nt', 'middle')}${T(265, 127, 'reads only', 'lbl', 'middle')}
  ${L('data', '117,166 243,166', true)}${T(180, 158, 'two-way', 'lbl strong', 'middle')}
  ${I('dynamodb', 95, 166)}${I('dynamodb', 265, 166)}
  ${T(95, 206, 'Global table', 'nt', 'middle')}${T(265, 206, 'Global table', 'nt', 'middle')}`);

  const minis = [
    ['RDS Multi-AZ', 'Fixes: an AZ failure', multiAZ, ['A synchronous standby in another AZ takes over automatically, behind the same endpoint.', 'The standby of a Multi-AZ instance serves no reads. A Multi-AZ DB cluster (MySQL, PostgreSQL) has two readable standbys.']],
    ['RDS read replicas', 'Fixes: too many reads', replicas, ['Asynchronous copies with their own endpoints, in the same or another Region.', 'Promotion is manual and the replica becomes a standalone database. A cross-Region replica doubles as a simple DR copy.']],
    ['Aurora cluster', 'Fixes: both, in one design', aurora, ['Aurora Replicas read the same storage, so replica lag is low, and Aurora Auto Scaling adds replicas.', 'On failure Aurora promotes a replica to writer automatically. The writer endpoint follows it.']],
    ['Global', 'Fixes: a Region failure, and distant users', global, ['Aurora Global Database copies at the storage layer, usually under a second behind, and a secondary Region can be promoted.', 'DynamoDB global tables are multi-active: every Region accepts writes.']],
  ];
  const miniHTML = minis.map(([name, tag, fig, pts]) => `
      <article class="ig-card">
        <header><div style="flex:1;min-width:0"><h3>${esc(name)}</h3><p class="ig-tag">${esc(tag)}</p></div></header>
        ${fig}
        <ul>${pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      </article>`).join('');

  const matrix = [
    ['Survive an AZ failure', 'Multi-AZ deployment', 'Built-in storage across 3 AZs. Add a replica in another AZ for fast failover.', 'Built in. Tables span 3 AZs.'],
    ['Scale reads', 'Read replicas, or ElastiCache in front', 'Aurora Replicas behind the reader endpoint, with Auto Scaling', 'DAX for microsecond reads'],
    ['Survive a Region failure', 'Cross-Region read replica, promoted by you', 'Aurora Global Database', 'Global tables'],
    ['Unpredictable load', 'Storage autoscaling only', 'Aurora Serverless v2', 'On-demand capacity mode'],
    ['Too many connections from Lambda', 'RDS Proxy', 'RDS Proxy', 'Not an issue. It is an HTTP API.'],
    ['Undo a bad change', 'Point-in-time restore to a new instance', 'Backtrack (MySQL-compatible) or point-in-time restore', 'Point-in-time recovery'],
    ['Encrypt existing data', 'Snapshot, copy it encrypted, restore', 'Snapshot, copy it encrypted, restore', 'Always encrypted at rest'],
  ];
  const matrixHTML = matrix.map(([p, a, b, c]) => `
        <tr><th scope="row">${esc(p)}</th>${[a, b, c].map(x => `<td class="ig-hide">${esc(x)}</td>`).join('')}</tr>`).join('');

  const engines = [
    ['rds', 'Relational, joins, transactions', 'RDS or Aurora'],
    ['dynamodb', 'Key-value at any scale, single-digit ms', 'DynamoDB'],
    ['elasticache', 'Cache or session store', 'ElastiCache'],
    ['memorydb', 'Durable in-memory primary database', 'MemoryDB'],
    ['redshift', 'Analytics and data warehouse (OLAP)', 'Redshift'],
    ['documentdb', 'MongoDB-compatible documents', 'DocumentDB'],
    ['keyspaces', 'Cassandra (CQL) workloads', 'Keyspaces'],
    ['neptune', 'Graph relationships', 'Neptune'],
    ['timestream', 'Time series and IoT readings', 'Timestream'],
    ['opensearch', 'Full-text search and log analytics', 'OpenSearch Service'],
  ];
  const engineHTML = engines.map(([icon, need, name]) => `
      <div class="ig-eng">${img(icon)}<div><p class="ig-eng-need">${esc(need)}</p><p class="ig-eng-svc ig-hide">${esc(name)}</p></div></div>`).join('');

  return {
    title: 'Database Chooser',
    eyebrow: 'Databases',
    lede: 'Multi-AZ, read replicas, Aurora and global tables each fix a different problem. Name the problem in the question first, and the database feature follows.',
    rule: 'Multi-AZ is for availability, read replicas are for read scale, and global designs are for another Region. Mixing them up is the most common database trap.',
    body: `${section('Four designs, four problems', `<div class="ig-minis">${miniHTML}
    </div>
    ${LEGEND([['in', 'App request'], ['data', 'Replication or storage'], ['alt', 'Automatic failover']])}`)}
${section('Problem → fix', `<div class="ig-panel ig-scroll"><table class="ig-tbl ig-matrix">
      <thead><tr><th>Problem</th><th><span>${img('rds')}RDS</span></th><th><span>${img('aurora')}Aurora</span></th><th><span>${img('dynamodb')}DynamoDB</span></th></tr></thead>
      <tbody>${matrixHTML}
      </tbody></table></div>`)}
${section('Pick the engine from the data', `<div class="ig-engines">${engineHTML}\n    </div>`)}
${section('Traps the exam sets', traps([
      ['A read replica gives automatic failover.', 'RDS read replicas are promoted by hand. Multi-AZ fails over automatically.'],
      ['Send reports to the Multi-AZ standby.', 'A Multi-AZ instance standby serves no reads. Add a read replica.'],
      ['Multi-AZ protects against a Region outage.', 'It stays in one Region. Use a cross-Region replica, Aurora Global Database or global tables.'],
      ['Aurora Global Database accepts writes in every Region.', 'One primary Region takes writes. Write forwarding only passes a secondary’s writes on to it. DynamoDB global tables are the multi-active choice.'],
      ['Put ElastiCache in front of a write-heavy workload.', 'A cache helps repeated reads. Writes still reach the database.'],
      ['Move complex joins and ad hoc SQL to DynamoDB.', 'DynamoDB is key-value. Keep relational queries on RDS or Aurora.'],
      ['Lambda exhausts connections, so scale the instance up.', 'Put RDS Proxy in front to pool and share connections.'],
      ['Turn on encryption for the running RDS instance.', 'It cannot be enabled in place. Snapshot, copy the snapshot encrypted, and restore it.'],
    ]))}`,
    practice: ['RDS', 'RDS › Multi-AZ', 'RDS › Read replicas', 'Aurora', 'Aurora › Global Database', 'DynamoDB', 'ElastiCache'],
    foot: `RDS, Aurora and DynamoDB are tagged on ${tagged(['RDS', 'Aurora', 'DynamoDB'])} of the ${questions.length} questions in your banks. RDS Multi-AZ and read replicas are among the most-tagged features.`,
  };
};
