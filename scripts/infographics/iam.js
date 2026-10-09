// Will IAM Allow It?: the policy evaluation flow, cross-account access two ways, policy types, cues and traps.
module.exports = ({ questions, tagged, esc, T, I, L, svg, img, LEGEND, traps, section }) => {
  // ---- the evaluation flow ----
  const rows = [
    [120, 'Explicit Deny in any policy?', 'identity, resource, SCP, RCP, boundary or session', 'Yes', 'No'],
    [200, 'Do the SCPs and RCPs allow it?', 'only for accounts in AWS Organizations', 'No', 'Yes'],
    [280, 'Does a resource-based policy allow it?', 'e.g. an S3 bucket policy or SQS queue policy', null, 'No'],
    [360, 'Does an identity-based policy allow it?', 'attached to the user, group or role', 'No', 'Yes'],
    [440, 'Does the permissions boundary allow it?', 'checked only when one is set', 'No', 'Yes'],
    [520, 'Does the session policy allow it?', 'checked only when one was passed', 'No', 'Yes'],
  ];
  let flow = `<rect class="s-node" x="200" y="18" width="320" height="44" rx="22"/>
  ${T(360, 37, 'A request arrives', 'nt', 'middle')}${T(360, 53, 'principal · action · resource', 'lbl mono', 'middle')}
  ${L('data', '360,62 360,94')}`;
  rows.forEach(([y, q, note, right, down], i) => {
    flow += `<rect class="s-node" x="200" y="${y - 24}" width="320" height="48" rx="8"/>${T(360, y - 3, q, 'nt', 'middle')}${T(360, y + 14, note, 'lbl', 'middle')}`;
    if (right) flow += `${L('bad', `520,${y} 598,${y}`)}${T(559, y - 7, right, 'lbl strong', 'middle')}`;
    const next = i < rows.length - 1 ? rows[i + 1][0] - 26 : 578;
    flow += `${L('data', `360,${y + 24} 360,${next}`)}${T(368, y + 41, down, 'lbl strong')}`;
  });
  flow += `
  ${L('in', '200,280 172,280')}${T(186, 273, 'Yes', 'lbl strong', 'middle')}
  <rect class="s-node-acc" x="20" y="252" width="150" height="56" rx="10"/>${T(95, 276, 'ALLOW', 'big acc', 'middle')}${T(95, 294, 'same-account request', 'lbl', 'middle')}
  <rect class="s-node-bad" x="600" y="96" width="140" height="448" rx="12"/>${T(670, 276, 'DENY', 'big red', 'middle')}${T(670, 294, 'explicit or implicit', 'lbl', 'middle')}
  <rect class="s-node-acc" x="280" y="580" width="160" height="44" rx="22"/>${T(360, 607, 'ALLOW', 'big acc', 'middle')}`;
  const flowSVG = svg('ig-flow', 760, 640, 'IAM policy evaluation flowchart', flow);

  // ---- cross-account access ----
  const box = (x, y, icon, title, sub) => `<rect class="s-node" x="${x}" y="${y}" width="300" height="52" rx="8"/>${I(icon, x + 26, y + 26, 32)}${T(x + 52, y + 22, title, 'nt')}${T(x + 52, y + 39, sub, 'lbl')}`;
  const xa = svg('ig-xa', 1000, 340, 'Two ways to grant cross-account access', `
  <rect class="s-zplain" x="20" y="20" width="340" height="300" rx="12"/>${T(36, 42, 'ACCOUNT A · THE CALLER', 'cap')}
  <rect class="s-zplain" x="640" y="20" width="340" height="300" rx="12"/>${T(656, 42, 'ACCOUNT B · THE RESOURCE', 'cap')}
  ${T(500, 52, 'WAY 1 · ASSUME A ROLE', 'cap acc', 'middle')}${T(500, 222, 'WAY 2 · RESOURCE-BASED POLICY', 'cap acc', 'middle')}
  ${box(40, 70, 'iam', 'Developer or app', 'may call sts:AssumeRole on the role')}
  ${box(660, 70, 'iamrole', 'Role: Auditor', 'trust policy trusts account A')}
  ${L('alt', '340,96 658,96')}${T(500, 88, '1 · sts:AssumeRole', 'lbl strong mono', 'middle')}${T(500, 114, 'returns temporary credentials', 'lbl', 'middle')}
  ${L('in', '880,122 880,246')}${T(872, 172, '2 · the role’s permissions', 'lbl strong halo', 'end')}${T(872, 188, 'policy allows s3:GetObject', 'lbl halo', 'end')}
  ${box(40, 248, 'iam', 'Developer or app', 'identity policy allows s3:GetObject')}
  ${box(660, 248, 's3', 'S3 bucket', 'bucket policy allows account A')}
  ${L('in', '340,274 658,274')}${T(500, 266, 'both policies must allow', 'lbl strong', 'middle')}${T(500, 292, 'the caller keeps its own identity', 'lbl', 'middle')}`);

  const types = [
    ['iam', 'Identity-based policy', true, 'Users, groups and roles', 'The everyday allow. Use managed policies for reuse, inline only for a strict one-to-one link.'],
    ['s3', 'Resource-based policy', true, 'S3 buckets, SQS queues, SNS topics, KMS keys, Lambda functions, Secrets Manager secrets', 'Names a Principal, so it grants cross-account access without switching roles.'],
    ['iamrole', 'Role trust policy', true, 'Every IAM role', 'Says who may assume the role: an account, a service such as ec2.amazonaws.com, or a federated identity.'],
    ['kms', 'KMS key policy', true, 'Every KMS key', 'Required. IAM policies count only when the key policy lets them. The default key policy does, through the account principal.'],
    ['orgs', 'Service control policy (SCP)', false, 'Organization root, OUs and member accounts', 'Sets the most that principals in member accounts can do, the root user included. It never affects the management account or service-linked roles.'],
    ['orgs', 'Resource control policy (RCP)', false, 'Organization root, OUs and member accounts', 'Sets the most that anyone can do to resources in member accounts, e.g. block access from outside the organization.'],
    ['iam', 'Permissions boundary', false, 'One user or role', 'Caps what that identity can ever get. Use it to let developers create roles without escalating their own access.'],
    ['iamrole', 'Session policy', false, 'One assumed-role or federated session', 'Passed with AssumeRole or federation to narrow that session below the role’s own permissions.'],
  ];
  const typeHTML = types.map(([icon, name, grants, where, use]) => `
      <article class="ig-card">
        <header>${img(icon)}<h3>${esc(name)}</h3><span class="ig-pill ${grants ? 'ig-yes' : 'ig-no'}">${grants ? 'Can grant' : 'Only limits'}</span></header>
        <p class="ig-kv"><b>Attaches to</b>${esc(where)}</p>
        <p style="font-size:14px">${esc(use)}</p>
      </article>`).join('');

  const cues = [
    ['An app on EC2, ECS or Lambda needs S3 access', 'iamrole', 'An IAM role: instance profile, task role or execution role. Never access keys.'],
    ['No account in an OU may use Regions outside the EU', 'orgs', 'An SCP that denies actions when aws:RequestedRegion is outside the allowed list.'],
    ['Developers create roles but must not escalate', 'iam', 'A permissions boundary, required by policy on every role they create.'],
    ['A third party needs access to your account', 'iamrole', 'A cross-account role that requires an external ID, which prevents the confused deputy problem.'],
    ['Staff sign in once to many accounts', 'idc', 'IAM Identity Center, connected to the corporate identity provider.'],
    ['Mobile app users upload to S3', 'cognito', 'A Cognito identity pool that hands out temporary credentials, or presigned URLs.'],
    ['Access rules must scale with new projects', 'iam', 'ABAC: compare principal tags with resource tags instead of listing ARNs.'],
    ['Find resources shared outside the account', 'iam', 'IAM Access Analyzer.'],
  ];
  const cueHTML = cues.map(([q, icon, a]) => `
        <tr><th scope="row">${esc(q)}</th><td class="ig-hide"><div class="ig-ans">${img(icon)}<span>${esc(a)}</span></div></td></tr>`).join('');

  return {
    title: 'Will IAM Allow It?',
    eyebrow: 'Security',
    lede: 'One flowchart decides every IAM question: which policies AWS checks, in what order, and which of them can grant access instead of only limiting it.',
    rule: 'An explicit Deny always wins. With no Deny, a request needs an Allow, and every guardrail on the way must leave room for it.',
    body: `${section('The evaluation order', `<div class="ig-two">
      <div class="ig-panel"><div class="ig-scroll">${flowSVG}</div>
        ${LEGEND([['data', 'Next check'], ['bad', 'Denied'], ['in', 'Allowed']])}</div>
      <div class="ig-notes">
        <div class="ig-note"><b>Explicit deny always wins</b><p>No allow anywhere can override a Deny statement, whether it is in an SCP, a bucket policy or an identity policy.</p></div>
        <div class="ig-note"><b>Same account: one allow is enough</b><p>Either the identity-based policy or the resource-based policy can grant access, as long as nothing denies it.</p></div>
        <div class="ig-note"><b>Cross-account: both sides must allow</b><p>The caller’s identity policy in its own account and the resource-based policy in the other account must both allow the action.</p></div>
        <div class="ig-note"><b>Guardrails never grant</b><p>SCPs, RCPs, permissions boundaries and session policies only set a maximum. Something else must still allow the action.</p></div>
      </div>
    </div>`, 'AWS checks every request in this order. Anything not explicitly allowed is denied.')}
${section('Cross-account access, two ways', `<div class="ig-panel"><div class="ig-scroll">${xa}</div>
      ${LEGEND([['alt', 'Control call'], ['in', 'Request to the resource']])}</div>
    <div class="ig-notes">
      <div class="ig-note"><b>Way 1 · Assume a role</b><p>Works with every service. While using the role, the caller has only the role’s permissions, not its own.</p></div>
      <div class="ig-note"><b>Way 2 · Resource-based policy</b><p>Only for services with resource-based policies. The caller keeps its own permissions, which helps when copying between its own bucket and the other account’s bucket.</p></div>
    </div>`)}
${section('Policy types', `<div class="ig-cards">${typeHTML}\n    </div>`)}
${section('If the question says…', `<div class="ig-panel ig-scroll"><table class="ig-tbl">
      <thead><tr><th>Scenario</th><th>Answer</th></tr></thead>
      <tbody>${cueHTML}
      </tbody></table></div>`)}
${section('Traps the exam sets', traps([
      ['Attach an SCP that allows S3 so the account can use S3.', 'SCPs never grant. An identity or resource policy must still allow it.'],
      ['The SCP stops the management account from deleting trails.', 'SCPs do not apply to the management account. Keep workloads out of it.'],
      ['The member account’s root user is exempt from SCPs.', 'SCPs restrict every principal in a member account, the root user included.'],
      ['An Allow in the identity policy overrides the SCP’s Deny.', 'An explicit Deny wins everywhere.'],
      ['A bucket policy alone gives another account’s users access.', 'Their own identity policy must also allow the action.'],
      ['An IAM policy lets another account use our KMS key.', 'The key policy must also allow that account.'],
      ['Store access keys on the instance for the CLI.', 'Attach an instance profile role. The SDK and CLI pick up its temporary credentials.'],
      ['Share the root user’s credentials with administrators.', 'Give admins their own identities, lock the root user away with MFA, and use it only for root-only tasks.'],
    ]))}`,
    practice: ['IAM', 'IAM › Policy evaluation', 'IAM › Roles', 'Organizations', 'Organizations › SCPs', 'IAM Identity Center'],
    foot: `IAM, IAM Identity Center and Organizations are tagged on ${tagged(['IAM', 'IAM Identity Center', 'Organizations'])} of the ${questions.length} questions in your banks. Secure architectures is the largest exam domain.`,
  };
};
