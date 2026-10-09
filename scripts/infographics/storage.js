// Storage Chooser: object, block or file; the S3 classes from hot to cold with a decision tree and lifecycle
// transitions; then EBS, instance store, EFS and FSx side by side, the EBS volume types, and traps.
module.exports = ({ questions, tagged, esc, T, I, L, svg, img, traps, section }) => {
  // ---- the ladder ----
  const classes = [
    ['S3 Standard', 'frequent access', 'ms', 'none', '≥ 3', 'none'],
    ['Standard-IA', 'about monthly', 'ms', '30 days', '≥ 3', 'per GB'],
    ['One Zone-IA', 're-creatable data', 'ms', '30 days', '1', 'per GB'],
    ['Glacier Instant', 'about quarterly', 'ms', '90 days', '≥ 3', 'per GB'],
    ['Glacier Flexible', 'archive', '1 min – 12 h', '90 days', '≥ 3', 'by tier'],
    ['Glacier Deep Archive', 'kept for years', '12 – 48 h', '180 days', '≥ 3', 'by tier'],
  ];
  const X0 = 140, W = 158, G = 6, rowsY = [292, 314, 336, 358];
  let stairs = `${L('data', `${X0},40 1112,40`)}${T(X0, 28, 'COLDER: CHEAPER TO STORE, SLOWER OR COSTLIER TO READ', 'cap')}`;
  ['FIRST BYTE', 'MINIMUM STAY', 'AZS', 'RETRIEVAL FEE'].forEach((t, i) => { stairs += T(20, rowsY[i], t, 'cap'); });
  classes.forEach(([name, use, firstByte, minStay, azs, fee], i) => {
    const x = X0 + i * (W + G), top = 60 + i * 30, mix = 100 - i * 19;
    const twoLine = name === 'Glacier Deep Archive';
    stairs += `<rect x="${x}" y="${top}" width="${W}" height="${372 - top}" rx="8" style="fill:color-mix(in srgb,var(--aws-soft) ${mix}%,var(--surface-2))"/>
  <rect x="${x}" y="${top}" width="${W}" height="4" rx="2" style="fill:color-mix(in srgb,var(--aws) ${mix}%,var(--muted))"/>
  ${I(i < 3 ? 's3' : 'glacier', x + 22, top + 30, 26)}
  ${twoLine ? `${T(x + 42, top + 28, 'Glacier', 'nt')}${T(x + 42, top + 44, 'Deep Archive', 'nt')}${T(x + 42, top + 60, use, 'lbl')}`
    : `${T(x + 42, top + 28, name, 'nt')}${T(x + 42, top + 44, use, 'lbl')}`}
  ${[firstByte, minStay, azs, fee].map((v, r) => T(x + W / 2, rowsY[r], v, 'mono strong', 'middle')).join('')}`;
  });
  // Intelligent-Tiering, with each of its tiers under the class it resembles
  stairs += `<rect class="s-zsoft" x="${X0}" y="388" width="${6 * W + 5 * G}" height="74" rx="10"/>
  ${I('s3', X0 + 22, 410, 24)}${T(X0 + 40, 414, 'S3 Intelligent-Tiering', 'nt')}${T(X0 + 190, 414, 'moves each object between tiers by its own access, with no retrieval fees', 'lbl')}`;
  [[0, 'Frequent', 'default'], [1, 'Infrequent', '30 days'], [3, 'Archive Instant', '90 days'], [4, 'Archive', 'opt-in'], [5, 'Deep Archive', 'opt-in']].forEach(([i, t, s]) => {
    const x = X0 + i * (W + G) + 4;
    stairs += `<rect class="s-node" x="${x}" y="426" width="${W - 8}" height="28" rx="14"/>${T(x + (W - 8) / 2, 444, `${t} · ${s}`, 'lbl strong', 'middle')}`;
  });
  const stairSVG = svg('ig-stairs', 1120, 472, 'S3 storage classes from hot to cold', stairs);

  // ---- decision tree ----
  const q = (cx, cy, w, t) => `<rect class="s-node" x="${cx - w / 2}" y="${cy - 22}" width="${w}" height="44" rx="8"/>${T(cx, cy + 4, t, 'nt', 'middle')}`;
  const leaf = (cx, cy, w, t, s) => `<rect class="s-node-acc" x="${cx - w / 2}" y="${cy - 24}" width="${w}" height="48" rx="10"/>${T(cx, cy - 3, t, 'nt', 'middle')}${T(cx, cy + 13, s, 'lbl', 'middle')}`;
  const treeSVG = svg('ig-tree', 1000, 400, 'Decision tree for choosing an S3 storage class', `
  ${L('data', '360,40 262,40')}${T(311, 32, 'No', 'lbl strong', 'middle')}
  ${L('data', '500,62 500,98')}${T(508, 84, 'Yes', 'lbl strong')}
  ${L('data', '650,120 738,120')}${T(694, 112, 'Yes', 'lbl strong', 'middle')}
  ${L('data', '500,142 500,178')}${T(508, 164, 'No', 'lbl strong')}
  ${L('data', '440,222 440,248 260,248 260,256')}${T(350, 242, 'Yes', 'lbl strong', 'middle')}
  ${L('data', '560,222 560,248 740,248 740,256')}${T(650, 242, 'No', 'lbl strong', 'middle')}
  ${L('data', '200,302 200,326 140,326 140,344')}${T(170, 320, 'monthly', 'lbl strong', 'middle')}
  ${L('data', '320,302 320,326 390,326 390,344')}${T(355, 320, 'quarterly', 'lbl strong', 'middle')}
  ${L('data', '680,302 680,326 630,326 630,344')}${T(655, 320, 'No', 'lbl strong', 'middle')}
  ${L('data', '800,302 800,326 870,326 870,344')}${T(835, 320, 'Yes', 'lbl strong', 'middle')}
  ${q(500, 40, 280, 'Is the access pattern known?')}
  ${q(500, 120, 300, 'Read more than about once a month?')}
  ${q(500, 200, 300, 'Needed in milliseconds when read?')}
  ${q(260, 280, 260, 'Read about monthly or quarterly?')}
  ${q(740, 280, 280, 'Kept for years, and 12 h is fine?')}
  ${leaf(160, 40, 200, 'Intelligent-Tiering', 'no retrieval fees')}
  ${leaf(840, 120, 200, 'S3 Standard', 'frequent access')}
  ${leaf(140, 368, 220, 'Standard-IA', 'One Zone-IA if re-creatable')}
  ${leaf(390, 368, 200, 'Glacier Instant Retrieval', 'ms reads, rare access')}
  ${leaf(630, 368, 200, 'Glacier Flexible Retrieval', 'minutes to hours')}
  ${leaf(870, 368, 200, 'Glacier Deep Archive', 'within 12 h, bulk 48 h')}`);

  // ---- lifecycle transitions: 1 = supported, s = same class, 0 = not supported ----
  const to = ['Standard-IA', 'Intelligent-Tiering', 'One Zone-IA', 'Glacier Instant', 'Glacier Flexible', 'Deep Archive'];
  const from = [
    ['S3 Standard', '111111'], ['Standard-IA', 's11111'], ['Intelligent-Tiering', '0s1111'], ['One Zone-IA', '00s011'],
    ['Glacier Instant', '000s11'], ['Glacier Flexible', '0000s1'], ['Deep Archive', '00000s'],
  ];
  const cell = c => c === '1' ? '<td class="ig-yes">●</td>' : c === 's' ? '<td title="Same class">·</td>' : '<td>–</td>';
  const tx = `<table class="ig-tbl ig-tx">
      <thead><tr><th>From ↓ · To →</th>${to.map(t => `<th>${t}</th>`).join('')}</tr></thead>
      <tbody>${from.map(([f, cs]) => `<tr><th scope="row">${f}</th>${[...cs].map(cell).join('')}</tr>`).join('')}</tbody></table>`;

  // ---- block and file storage ----
  const storeCols = [['ebs', 'EBS'], ['ec2', 'Instance store'], ['efs', 'EFS'], ['fsxwin', 'FSx for Windows'], ['fsxlustre', 'FSx for Lustre'], ['fsxontap', 'FSx for ONTAP']];
  const store = [
    ['Type', 'Block', 'Block, temporary', 'File (NFS)', 'File (SMB)', 'File (Lustre)', 'File (NFS, SMB) and block (iSCSI)'],
    ['Used by', 'One instance. io1 and io2 can Multi-Attach in one AZ.', 'Only its own host', 'Thousands of Linux instances, containers and Lambda functions', 'Windows instances and on-premises clients', 'Linux compute clusters', 'Linux, Windows and macOS clients'],
    ['Scope', 'One AZ', 'One host', 'Regional, or One Zone', 'Single-AZ or Multi-AZ', 'One AZ', 'Single-AZ or Multi-AZ'],
    ['Survives a stop', 'Yes', 'No. The data is lost.', 'Yes', 'Yes', 'Persistent: yes. Scratch: no copies kept.', 'Yes'],
    ['Exam cue', 'boot volume · database on one instance', 'highest IOPS · cache or scratch data', 'shared Linux files across AZs', 'Windows shares · Active Directory', 'HPC · ML training · linked to S3', 'NetApp migration · multi-protocol'],
  ];
  const storeHTML = store.map(([k, ...v]) => `
        <tr><th scope="row">${k}</th>${v.map(x => `<td>${k === 'Exam cue' ? `<span class="ig-cue ig-hide" style="display:block">${esc(x)}</span>` : esc(x)}</td>`).join('')}</tr>`).join('');

  const volumes = [
    ['gp3', 'General purpose SSD', true, 'The default. Set IOPS and throughput separately from size.'],
    ['io2 Block Express', 'Provisioned IOPS SSD', true, 'The highest IOPS and durability, sub-millisecond latency, Multi-Attach. For critical databases.'],
    ['st1', 'Throughput-optimized HDD', false, 'Large sequential reads and writes: logs, data warehouses, streaming.'],
    ['sc1', 'Cold HDD', false, 'The lowest-cost block storage, for large data read rarely and in sequence.'],
  ];
  const volumeHTML = volumes.map(([name, kind, boot, text]) => `
      <article class="ig-card">
        <header>${img('ebs')}<div style="flex:1;min-width:0"><h3>${esc(name)}</h3><p class="ig-tag">${esc(kind)}</p></div><span class="ig-pill ${boot ? 'ig-yes' : 'ig-no'}">${boot ? 'Can boot' : 'Cannot boot'}</span></header>
        <p style="font-size:14px">${esc(text)}</p>
      </article>`).join('');

  const kinds = [
    ['s3', 'Object', 'S3', 'Whole objects over HTTPS, from anywhere, at any scale. Not a mounted disk.'],
    ['ebs', 'Block', 'EBS · instance store', 'A disk for one instance in one AZ: boot volumes and databases.'],
    ['efs', 'File', 'EFS · FSx', 'A shared file system that many instances mount at once.'],
  ];
  const kindHTML = kinds.map(([icon, kind, names, text]) => `
      <article class="ig-card">
        <header>${img(icon)}<div style="flex:1;min-width:0"><h3>${kind}</h3><p class="ig-tag">${names}</p></div></header>
        <p style="font-size:14px">${text}</p>
      </article>`).join('');

  const note = (t, p) => `<div class="ig-note"><b>${t}</b><p>${p}</p></div>`;
  return {
    title: 'Storage Chooser',
    eyebrow: 'Storage',
    lede: 'First decide between object, block and file storage. Then pick the S3 class from how the data is read, or the volume or file system from who mounts it.',
    rule: 'Objects go in S3, a disk for one instance is EBS in one AZ, and files shared by many instances are EFS on Linux or FSx on Windows. Within S3, pick the class from how often data is read and how fast it must come back.',
    body: `${section('Object, block or file?', `<div class="ig-cards">${kindHTML}\n    </div>`)}
${section('The S3 ladder', `<div class="ig-panel"><div class="ig-scroll">${stairSVG}</div></div>`,
      'Each step down is cheaper to store and slower or costlier to read. Every class except One Zone-IA keeps data in at least three AZs.')}
${section('Pick an S3 class in five questions', `<div class="ig-panel"><div class="ig-scroll">${treeSVG}</div></div>`)}
${section('Lifecycle transitions', `<div class="ig-panel ig-scroll">${tx}</div>
    <div class="ig-notes">
      ${note('Nothing moves back up', 'To make an archived object hot again, restore it and copy it. Only Intelligent-Tiering moves objects back on its own.')}
      ${note('30 days before IA', 'Objects must be at least 30 days old before a rule moves them to Standard-IA or One Zone-IA.')}
      ${note('Small objects stay put', 'By default, lifecycle rules do not transition objects smaller than 128 KB. The IA classes bill each object as at least 128 KB.')}
      ${note('Leaving early still costs', 'Deleting or moving an object before its minimum stay bills the remaining days.')}
      ${note('Rules can also delete', 'Expire current versions, transition or expire noncurrent versions, and abort incomplete multipart uploads.')}
      ${note('S3 Express One Zone', 'Off the ladder. One AZ, directory buckets and single-digit millisecond access, for hot data next to compute.')}
    </div>`, 'A lifecycle rule can only move objects down the ladder. ● marks a supported transition.')}
${section('Block or file storage?', `<div class="ig-panel ig-scroll"><table class="ig-tbl ig-matrix ig-store">
      <thead><tr><th></th>${storeCols.map(([icon, name]) => `<th><span>${img(icon)}${name}</span></th>`).join('')}</tr></thead>
      <tbody>${storeHTML}
      </tbody></table></div>`)}
${section('EBS volume types', `<div class="ig-cards ig-cards2">${volumeHTML}\n    </div>
    <div class="ig-notes">
      ${note('Snapshots', 'Incremental copies stored in S3. Copy them to another Region, or share them, to move a volume.')}
      ${note('Encryption', 'Turn on encryption by default per Region. An unencrypted volume is encrypted by copying its snapshot with encryption.')}
      ${note('EFS storage classes', 'Lifecycle rules move cold files to Infrequent Access and Archive to cut cost.')}
    </div>`)}
${section('Traps the exam sets', traps([
      ['Mount EFS on Windows instances.', 'EFS is NFS for Linux. Windows file shares need FSx for Windows File Server.'],
      ['Attach one EBS volume to instances in two AZs.', 'An EBS volume lives in one AZ. Share files across AZs with EFS.'],
      ['Keep the database on instance store.', 'Instance store data is lost when the instance stops or fails. Use EBS.'],
      ['Use st1 as the boot volume.', 'HDD volumes cannot boot. Use gp3 or io2.'],
      ['Keep the only copy of critical data in One Zone-IA.', 'One AZ can be lost. Use it only for data you can re-create, or for secondary copies.'],
      ['Glacier Flexible Retrieval for data needed immediately.', 'Use Glacier Instant Retrieval for millisecond reads of rarely used data.'],
      ['Expedited retrieval from Deep Archive.', 'Deep Archive offers only Standard (within 12 hours) and Bulk (within 48 hours).'],
      ['A lifecycle rule moves objects back to Standard when they are read.', 'Lifecycle rules only move down. Intelligent-Tiering moves objects back automatically.'],
      ['Write lifecycle rules for an unknown, changing access pattern.', 'Use Intelligent-Tiering. It has no retrieval fees and needs no rules.'],
      ['Standard-IA for millions of tiny objects.', 'Each object bills as at least 128 KB, so small objects cost more there.'],
      ['Delete Standard-IA data after 10 days to save money.', 'The 30-day minimum is still billed.'],
      ['Make backups immutable with versioning.', 'Use S3 Object Lock in compliance mode for write-once retention.'],
    ]))}`,
    practice: ['S3', 'S3 › Storage classes', 'S3 › Lifecycle rules', 'S3 › Glacier & retrieval', 'EBS', 'EFS', 'FSx'],
    foot: `S3 is tagged on ${tagged(['S3'])} of the ${questions.length} questions in your banks, more than any other service, and EBS, EFS and FSx on ${tagged(['EBS', 'EFS', 'FSx'])}.`,
  };
};
