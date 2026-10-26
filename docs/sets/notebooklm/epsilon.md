# AWS SAA-C03 Practice Questions: Set Epsilon (3 questions)

---

## EPSILON-001: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** hard · **Pillars:** Security
**Services:** IAM › Permissions boundaries, IAM › Policy evaluation

### Question
A platform team lets application developers create IAM roles for their own AWS Lambda functions without waiting for a security review. The security team requires that no role a developer creates can ever have more permissions than a defined maximum, for example no IAM or AWS Organizations actions, and that developers cannot get around this by creating a role without the limit or by editing the limit itself. Which TWO actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Attach a service control policy to the account that allows only the maximum set of permissions for every principal in the account.
- **B.** Write a managed policy that defines the maximum permissions, and allow developers iam:CreateRole only when iam:PermissionsBoundary equals that policy's ARN.
- **C.** Require developers to attach the AWS managed ReadOnlyAccess policy to every role they create for their Lambda functions.
- **D.** Deny developers the actions that change the boundary policy or remove a role's boundary, such as iam:CreatePolicyVersion and iam:DeleteRolePermissionsBoundary.
- **E.** Turn on IAM Access Analyzer policy validation so that developers see a warning whenever a role's policy grants IAM actions.

### Correct answers: B, D (choose 2)

**Summary:** Safe delegated role creation: require a permissions boundary on every new role (iam:PermissionsBoundary condition) and deny edits to the boundary, so roles can never exceed the maximum.

### Explanation
- A is wrong: an SCP caps every principal in the account, including the platform and security teams, instead of only the roles that developers create.
- B is correct: a permissions boundary limits a role's effective permissions to what both its identity policies and the boundary allow, and the condition makes every role a developer creates carry the boundary.
- C is wrong: the functions need write permissions too, and a rule that nothing enforces does not stop a developer creating a role with broader policies.
- D is correct: without these denies a developer could publish a broader version of the boundary policy or strip the boundary from a role, which would remove the cap.
- E is wrong: policy validation reports findings and warnings; it does not prevent a role from being created or used with those permissions.

**Key phrases:** create IAM roles for their own AWS Lambda functions · more permissions than a defined maximum · cannot get around this · editing the limit itself · TWO
**Hint:** One IAM feature caps what a role can ever do, whatever policies are attached to it. Then ask how a developer could escape that cap.

---

## EPSILON-002: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence
**Services:** EC2 › AMIs, EC2 Auto Scaling › Instance refresh

### Question
A company patches its Amazon EC2 web fleet by running configuration scripts on the running instances. The instances have drifted apart over time, and a failed patch once left half the fleet broken. The company wants every instance to come from an identical, pre-patched image, and wants changes rolled out gradually with automatic rollback if health checks fail. Which combination of actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Raise the Auto Scaling group's desired capacity while patching so that more instances are available.
- **B.** Keep patching in place, but run the scripts through AWS Systems Manager Run Command so that they are logged.
- **C.** Roll the change out with an Auto Scaling group instance refresh that uses a minimum healthy percentage and automatic rollback.
- **D.** Build a new AMI for each release with EC2 Image Builder and reference it from the Auto Scaling group's launch template.
- **E.** Replace the Auto Scaling group with a fixed set of instances managed by configuration management software.

### Correct answers: C, D (choose 2)

**Summary:** Baking a patched AMI removes fleet drift, and a rolling instance refresh with automatic rollback prevents a bad release taking down everything.

### Explanation
- A is wrong: extra capacity does not stop a bad patch from reaching every instance.
- B is wrong: this logs the same in-place changes and leaves both the drift and the all-at-once failure mode in place.
- C is correct: an instance refresh replaces instances in batches while keeping a minimum healthy percentage in service, and it can roll back automatically when health checks fail, so a bad release never takes the whole fleet.
- D is correct: baking a pre-patched AMI for each release makes every instance identical from the moment it launches, which removes the drift that in-place patching causes, and Image Builder automates and versions that build.
- E is wrong: a fixed fleet gives up elasticity and self-healing, and configuration management still mutates running servers.

**Key phrases:** drifted apart · identical, pre-patched image · rolled out gradually · automatic rollback · Select TWO
**Hint:** Identical instances come from the image; the safety comes from how the fleet is replaced.

---

## EPSILON-003: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Reliability
**Services:** EC2 Auto Scaling › Scheduled & predictive scaling, EC2 Auto Scaling › Warm pools & lifecycle hooks

### Question
An internal reporting application runs on Amazon EC2 instances in an Auto Scaling group with a target tracking policy on CPU utilization. Every weekday, traffic rises from almost nothing to its daily peak between 08:45 and 09:00. New instances take about 10 minutes to boot and load their data caches, so users see slow responses every morning until the group catches up. Which combination of changes will BEST remove the morning slowdown? (Select TWO.)

### Options
- **A.** Replace the target tracking policy with a step scaling policy that adds more instances per alarm breach.
- **B.** Change the group's health check type from EC2 to ELB.
- **C.** Add a predictive scaling policy so that the group launches capacity ahead of the forecast daily ramp.
- **D.** Lower the target tracking CPU target from 50% to 20%.
- **E.** Configure a warm pool of pre-initialized instances so that scale-out skips the long boot and cache-loading step.

### Correct answers: C, E (choose 2)

**Summary:** Predictive scaling pre-launches for a known daily pattern, and a warm pool skips the cold-start wait entirely.

### Explanation
- A is wrong: bigger steps still start only after the alarm fires, so every new instance still needs its 10-minute warm-up while users wait.
- B is wrong: ELB health checks decide when to replace unhealthy instances, not when to add capacity.
- C is correct: predictive scaling learns the recurring weekday pattern from CloudWatch history and launches instances before the ramp begins, instead of reacting after CPU has already risen.
- D is wrong: a lower target keeps more idle capacity all day and still reacts only after the traffic arrives, so the 10-minute warm-up still hits users.
- E is correct: a warm pool holds instances that have already booted and loaded their caches in a stopped or running state, so when the group scales out they enter service far faster than a 10-minute cold start.

**Key phrases:** Every weekday · between 08:45 and 09:00 · about 10 minutes to boot and load their data caches · BEST remove the morning slowdown · Select TWO
**Hint:** Two separate delays: noticing the ramp too late, and each new instance taking 10 minutes to become useful.
