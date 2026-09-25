# AWS SAA-C03 Practice Questions: Set Alpha (160 questions)

---

## ALPHA-001: Compute & Serverless
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization, Sustainability

### Question
A media company runs an image-processing pipeline. Uploaded images are placed in an Amazon SQS queue, and a fleet of Amazon EC2 workers pulls messages, processes each image, and writes the result to Amazon S3. Processing is idempotent, each job takes under 3 minutes, and the queue depth varies from 0 to 200,000 messages during the day. The company wants to minimize cost while still finishing all jobs. Which solution meets these requirements MOST cost-effectively?

### Options
- **A.** Create an Auto Scaling group of Standard Reserved Instances sized for the average queue depth and add a step scaling policy on CPU utilization to add On-Demand instances at peak.
- **B.** Create an Auto Scaling group with a mixed instances policy that uses several instance types across multiple Availability Zones, a small On-Demand base capacity, and Spot Instances for the remainder. Use a target tracking policy on a custom 'backlog per instance' metric derived from the SQS queue depth.
- **C.** Create an EC2 Fleet request for Spot Instances of a single instance type in a single Availability Zone with the lowestPrice allocation strategy. Scale manually when the queue grows.
- **D.** Create an Auto Scaling group of On-Demand instances of a single type and purchase a 3-year Compute Savings Plan sized for peak capacity. Use scheduled scaling to add capacity during business hours.

### Correct answer: B

**Summary:** Spot Instances with mixed instance types/AZs and an On-Demand base, scaled on SQS backlog, suit short interruptible jobs cheaply.

### Explanation
- A is wrong: Reserved Instances sized for the average pay for idle capacity when the queue is empty, and CPU utilization is a poor proxy for queue backlog.
- B is correct: the jobs are short, idempotent and safe to interrupt, so Spot fits; several instance types across Availability Zones lower interruption risk, a small On-Demand base keeps work flowing, and a backlog-per-instance metric scales the fleet on the queue's real workload.
- C is wrong: a single instance type in a single Availability Zone concentrates Spot interruption risk, and manual scaling cannot follow a queue that swings between 0 and 200,000 messages.
- D is wrong: a 3-year Savings Plan sized for peak pays for capacity the queue rarely needs, and scheduled scaling ignores the actual backlog.

**Key phrases:** idempotent · under 3 minutes · varies from 0 to 200,000 messages · minimize cost · MOST cost-effectively
**Hint:** Interruptible, idempotent jobs behind a queue. Which purchase option fits, and which scaling metric reflects queue work rather than CPU?

---

## ALPHA-002: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** hard · **Pillars:** Reliability, Security

### Question
A payments API uses AWS Lambda functions behind Amazon API Gateway. The functions must read from an Amazon RDS for MySQL database in private subnets and also call a third-party fraud-scoring API on the public internet. During traffic spikes, the database reports 'too many connections' errors. The solution must be highly available and require the LEAST change to the database. Which combination of steps should the solutions architect take?

### Options
- **A.** Attach the Lambda functions to private subnets and create an interface VPC endpoint for the third-party API. Set reserved concurrency to 1,000 so that the database gets a steady load.
- **B.** Remove the Lambda functions from the VPC and make the RDS instance publicly accessible with a security group allowing all Lambda IP ranges. Increase max_connections on the database.
- **C.** Attach the Lambda functions to private subnets in at least two Availability Zones. Deploy a NAT gateway in a public subnet in each AZ and route the private subnets' default route to it. Place an Amazon RDS Proxy in front of the database and have the functions connect through the proxy.
- **D.** Attach the Lambda functions to public subnets of the VPC, enable auto-assign public IPv4, and route 0.0.0.0/0 to an internet gateway. Increase the DB instance size.

### Correct answer: C

**Summary:** A VPC-attached Lambda reaches the internet via a NAT gateway per AZ; RDS Proxy pools connections so spikes don't exhaust the database.

### Explanation
- A is wrong: an interface VPC endpoint reaches AWS services and PrivateLink endpoint services, not an arbitrary third-party API on the internet, and reserved concurrency of 1,000 still allows up to 1,000 concurrent database connections.
- B is wrong: a publicly accessible database is exposed to the internet, and raising max_connections trades memory for connections without addressing the churn.
- C is correct: a VPC-attached Lambda function reaches the internet through a NAT gateway in a public subnet, one per Availability Zone for high availability, and RDS Proxy pools and reuses connections so traffic spikes stop exhausting the database without changing it.
- D is wrong: a Lambda function attached to a VPC never receives a public IP address, even in a public subnet, so it cannot reach the internet this way, and a larger DB instance does not stop connection exhaustion.

**Key phrases:** private subnets · third-party · public internet · too many connections · highly available · LEAST change to the database
**Hint:** A VPC-attached Lambda never gets a public IP. What gives private subnets outbound internet access, and what protects the database from hundreds of concurrent connections?

---

## ALPHA-003: Compute & Serverless
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security

### Question
A team is moving a containerized order-processing service to Amazon ECS on AWS Fargate. The tasks run in private subnets, pull images from Amazon ECR, write logs to Amazon CloudWatch Logs, and read objects from a single Amazon S3 bucket. The security team requires least-privilege permissions and forbids long-lived credentials. Which IAM configuration should the architect implement?

### Options
- **A.** Create one IAM role with S3 read access, ECR pull, and CloudWatch Logs permissions, and specify it only as the task execution role.
- **B.** Create an IAM user with S3 read access, generate an access key, and store it as an environment variable in the task definition.
- **C.** Attach an IAM instance profile with S3 read access to the Fargate infrastructure so all tasks inherit it.
- **D.** Define a task role that grants read-only access to the specific S3 bucket for the application code, and a separate task execution role (with the AmazonECSTaskExecutionRolePolicy) that allows the ECS agent to pull from ECR and write to CloudWatch Logs.

### Correct answer: D

**Summary:** Give application code its own task role and let the ECS agent use a separate task execution role -- least privilege for each.

### Explanation
- A is wrong: the task execution role is used by the ECS agent to pull images and write logs, not by the application code, so S3 access placed there never reaches the application.
- B is wrong: an IAM user access key is a long-lived credential, and an environment variable in a task definition is readable by anyone who can view the definition.
- C is wrong: Fargate has no EC2 instance profile to attach, and a shared role would give every task the same permissions.
- D is correct: the task role gives the application code temporary credentials scoped to the one bucket, while the separate task execution role lets the ECS agent pull from ECR and write to CloudWatch Logs, which is least privilege for each.

**Key phrases:** AWS Fargate · private subnets · least-privilege · long-lived credentials
**Hint:** ECS uses two different IAM roles: one for your application code and one for the ECS agent's housekeeping. Which one does S3 access belong to?

---

## ALPHA-004: Storage & Backup
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Cost Optimization

### Question
A financial services company must retain trade confirmations in Amazon S3 for 7 years. Regulators require that the records cannot be overwritten or deleted by any user, including the AWS account root user, for the duration of the retention period. The records are rarely accessed after the first month. Which solution meets the compliance requirement at the LOWEST cost?

### Options
- **A.** Attach a bucket policy that denies s3:DeleteObject to all principals and enable MFA Delete on the bucket.
- **B.** Enable S3 Object Lock in governance mode with a 7-year retention period and grant s3:BypassGovernanceRetention only to a break-glass administrator role.
- **C.** Store the records in S3 Standard with cross-Region replication to a second bucket and enable S3 Versioning on both buckets.
- **D.** Enable versioning and S3 Object Lock in compliance mode with a 7-year default retention on the bucket, and add a lifecycle rule to transition objects to S3 Glacier Deep Archive after 30 days.

### Correct answer: D

**Summary:** S3 Object Lock in compliance mode is immutable even to root; pair it with Glacier Deep Archive for cheap long-term storage.

### Explanation
- A is wrong: bucket policies can be edited by admins.
- B is wrong: governance mode can be bypassed with s3:BypassGovernanceRetention.
- C is wrong: versioning and replication don't prevent deletion.
- D is correct: Object Lock in compliance mode (requires versioning) can't be shortened or bypassed by anyone, including root, and a lifecycle rule to Glacier Deep Archive cuts cost.

**Key phrases:** for 7 years · cannot be overwritten or deleted · including the AWS account root user · rarely accessed · LOWEST cost
**Hint:** Which retention mode cannot be bypassed even by the root user? Also consider which storage class is cheapest for rarely read archives.

---

## ALPHA-005: Storage & Backup
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability, Operational Excellence

### Question
A company is lifting and shifting a Windows-based file server to AWS. Users access SMB shares from Windows EC2 instances and on-premises desktops. The share relies on NTFS access control lists and authenticates users against the company's Microsoft Active Directory. The service must remain available if an Availability Zone fails and require minimal administration. Which solution should the solutions architect choose?

### Options
- **A.** Create an Amazon EFS file system with mount targets in two Availability Zones and mount it on the Windows instances.
- **B.** Create an Amazon S3 bucket and mount it on the Windows instances with a third-party S3 file driver, using bucket policies to emulate NTFS permissions.
- **C.** Create an Amazon FSx for Windows File Server file system with a Multi-AZ deployment and join it to the company's Active Directory (AWS Managed Microsoft AD or self-managed).
- **D.** Launch two Windows EC2 instances in different Availability Zones, attach a shared Amazon EBS volume using Multi-Attach, and configure Windows Server Failover Clustering manually.

### Correct answer: C

**Summary:** FSx for Windows File Server natively serves SMB/NTFS/AD, with Multi-AZ for automatic failover.

### Explanation
- A is wrong: Amazon EFS is an NFS file system that is not supported on Windows, and it has no NTFS ACLs or Active Directory integration.
- B is wrong: S3 is object storage and cannot provide SMB access or NTFS permission semantics, even through third-party drivers.
- C is correct: FSx for Windows File Server natively serves SMB shares with NTFS ACLs and joins Active Directory, and a Multi-AZ deployment fails over automatically to a standby file server in another zone.
- D is wrong: EBS Multi-Attach works only within a single Availability Zone, and building Windows failover clustering by hand is the opposite of minimal administration.

**Key phrases:** Windows-based file server · SMB · NTFS access control lists · Microsoft Active Directory · if an Availability Zone fails · minimal administration
**Hint:** Think protocol and OS: SMB, NTFS ACLs and Active Directory. Which managed file service speaks that natively, across AZs?

---

## ALPHA-006: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization, Sustainability

### Question
A data analytics team stores 800 TB of Parquet files (each larger than 1 MB) in Amazon S3 Standard. Some datasets are queried heavily for weeks and then not touched for months, but the team cannot predict which datasets will be accessed again. Queries require millisecond first-byte latency whenever a dataset is needed, and the company wants to reduce storage costs without adding operational overhead or unexpected retrieval fees. Which solution is MOST appropriate?

### Options
- **A.** Create a lifecycle rule to move all objects to S3 Glacier Flexible Retrieval after 30 days and restore datasets on demand with expedited retrievals.
- **B.** Move the objects to the S3 Intelligent-Tiering storage class.
- **C.** Create a lifecycle rule to move all objects to S3 Standard-IA after 30 days.
- **D.** Move all objects to S3 One Zone-IA and enable cross-Region replication for durability.

### Correct answer: B

**Summary:** S3 Intelligent-Tiering auto-moves objects between tiers by access pattern with no retrieval fees, ideal for unpredictable access.

### Explanation
- A is wrong: Glacier Flexible Retrieval needs a restore before data can be read, and even expedited retrievals take minutes and add per-GB charges, which breaks the millisecond requirement.
- B is correct: Intelligent-Tiering moves each object between access tiers automatically based on its own access, keeps millisecond access in its default tiers, and charges no retrieval fees, so unpredictable datasets cost less without any lifecycle tuning.
- C is wrong: Standard-IA charges a retrieval fee on every read, and a lifecycle rule never moves a dataset back when it becomes busy again.
- D is wrong: One Zone-IA keeps data in a single Availability Zone and still charges retrieval fees, and adding cross-Region replication brings back the storage cost it was meant to save.

**Key phrases:** cannot predict which datasets will be accessed again · millisecond first-byte latency · reduce storage costs · without adding operational overhead · unexpected retrieval fees
**Hint:** Access is unpredictable and you want no retrieval fees and no lifecycle tuning. Which storage class moves objects between tiers for you?

---

## ALPHA-007: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Reliability

### Question
An e-commerce platform runs on Amazon Aurora MySQL. Long-running reporting queries from a BI tool are slowing the OLTP workload on the writer instance. The company also needs automatic failover in under a minute if the writer's Availability Zone fails. Which solution addresses both requirements with the LEAST operational effort?

### Options
- **A.** Scale the writer instance up to a larger instance class and enable Performance Insights.
- **B.** Take a nightly snapshot of the cluster, restore it into a separate cluster, and point the BI tool at the restored cluster.
- **C.** Convert to an RDS for MySQL Multi-AZ DB instance deployment and direct the BI tool to the standby instance endpoint.
- **D.** Add Aurora Replicas in at least two Availability Zones. Point the BI tool at the cluster's reader endpoint and keep the application on the cluster endpoint.

### Correct answer: D

**Summary:** Aurora Replicas share storage with the writer, offload reads via the reader endpoint, and double as fast failover targets.

### Explanation
- A is wrong: a larger writer still runs the reporting queries alongside the OLTP workload and adds no failover target.
- B is wrong: a nightly restored copy gives the BI tool data up to a day old, adds a second cluster to operate, and does nothing for failover.
- C is wrong: the standby of an RDS Multi-AZ DB instance deployment cannot serve reads, and leaving Aurora gives up its shared-storage replicas.
- D is correct: Aurora Replicas share the cluster's storage, serve the BI tool through the load-balanced reader endpoint so reporting stops competing with the writer, and act as automatic failover targets that typically take over in about 30 seconds.

**Key phrases:** slowing the OLTP workload · automatic failover in under a minute · LEAST operational effort
**Hint:** Which Aurora feature shares storage with the writer, exposes a load-balanced endpoint for reads, and doubles as a failover target?

---

## ALPHA-008: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A retail application reads product catalog items from an Amazon DynamoDB table at a 100:1 read-to-write ratio. During flash sales, read latency rises and the team is paying for very high provisioned read capacity. The team wants microsecond read latency for repeated reads, tolerates eventual consistency, and wants to change as little application code as possible. What should the solutions architect recommend?

### Options
- **A.** Convert the table to a DynamoDB global table and read from the nearest replica Region.
- **B.** Deploy Amazon ElastiCache for Redis and rewrite the application to implement cache-aside logic with manual invalidation.
- **C.** Increase the table's provisioned read capacity units and enable auto scaling with a higher maximum.
- **D.** Deploy an Amazon DynamoDB Accelerator (DAX) cluster in front of the table and update the application to use the DAX client endpoint.

### Correct answer: D

**Summary:** DAX is a drop-in, API-compatible cache in front of DynamoDB for microsecond reads without touching table capacity.

### Explanation
- A is wrong: global tables replicate data to other Regions for multi-Region access; they add no cache and no microsecond reads.
- B is wrong: ElastiCache would work only after the team rewrites its data access layer with cache-aside and invalidation logic, which is the code change it wants to avoid.
- C is wrong: more read capacity raises cost and throughput, but DynamoDB still answers in single-digit milliseconds, not microseconds.
- D is correct: DAX is an in-memory cache that is API-compatible with DynamoDB, so the application changes only its client and endpoint, repeated reads return in microseconds, and cache hits stop consuming the table's read capacity.

**Key phrases:** 100:1 read-to-write ratio · microsecond read latency · tolerates eventual consistency · as little application code as possible
**Hint:** You need microsecond reads with minimal code change. Which cache is API-compatible with DynamoDB?

---

## ALPHA-009: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Reliability

### Question
A gaming company needs a session store and real-time leaderboard for a multiplayer game. Requirements: sub-millisecond latency, sorted-set operations for ranking players, and the data must survive the loss of a cache node or an Availability Zone with automatic failover and no manual rebuild of the dataset. Which solution meets these requirements?

### Options
- **A.** Amazon DynamoDB with on-demand capacity and a nightly export to Amazon S3.
- **B.** Amazon ElastiCache for Memcached with multiple nodes across Availability Zones.
- **C.** Amazon ElastiCache for Redis with a replication group, Multi-AZ enabled, and automatic failover.
- **D.** Amazon RDS for PostgreSQL Multi-AZ with a read replica used for leaderboard queries.

### Correct answer: C

**Summary:** ElastiCache for Redis gives sorted sets for leaderboards plus Multi-AZ replication with automatic failover.

### Explanation
- A is wrong: DynamoDB answers in single-digit milliseconds rather than sub-millisecond, and it has no built-in ranking structure like a sorted set.
- B is wrong: Memcached has no replication, persistence or sorted sets, so losing a node loses its data and ranking would need custom code.
- C is correct: Redis provides sorted sets for leaderboards with sub-millisecond latency, and a replication group with Multi-AZ and automatic failover promotes a replica in another zone with the data intact.
- D is wrong: a disk-based relational database cannot deliver sub-millisecond reads for this access pattern, and ranking queries get more expensive as the table grows.

**Key phrases:** sub-millisecond latency · sorted-set operations · automatic failover · no manual rebuild
**Hint:** Sorted sets, replication and automatic failover. Which ElastiCache engine supports all three?

---

## ALPHA-010: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** medium · **Pillars:** Cost Optimization, Security

### Question
Amazon EC2 instances in private subnets of a VPC upload roughly 20 TB per month of processed data to an Amazon S3 bucket in the same Region. The instances have no other need for internet access. The current design routes this traffic through NAT gateways, and the NAT data-processing charges are very high. The security team also wants to ensure the instances can only reach approved buckets. Which change is MOST cost-effective and secure?

### Options
- **A.** Create an S3 interface VPC endpoint in each Availability Zone and use security groups to restrict access to specific buckets.
- **B.** Replace the NAT gateways with NAT instances on larger EC2 instance types and use security groups to restrict destinations.
- **C.** Move the instances to public subnets with Elastic IP addresses and restrict outbound traffic with network ACLs.
- **D.** Create an S3 gateway VPC endpoint, add it to the private subnets' route tables, and attach an endpoint policy that allows access only to the approved buckets.

### Correct answer: D

**Summary:** An S3 gateway endpoint is free, keeps traffic on the AWS network, and its policy can restrict which buckets are reachable.

### Explanation
- A is wrong: interface endpoints for S3 charge per hour in each Availability Zone plus per GB processed, and security groups cannot restrict which buckets are reached; only an endpoint policy can.
- B is wrong: NAT instances avoid the NAT gateway's per-GB processing charge but add instance cost, patching, scaling and a single point of failure, and security groups cannot restrict access to particular S3 buckets.
- C is wrong: public subnets with Elastic IP addresses expose the instances to the internet, and network ACLs work on IP ranges, not buckets.
- D is correct: an S3 gateway endpoint has no hourly or data processing charge, keeps the traffic on the AWS network through route table entries, and an endpoint policy limits the instances to the approved buckets.

**Key phrases:** 20 TB per month · same Region · no other need for internet access · NAT data-processing charges are very high · only reach approved buckets · MOST cost-effective and secure
**Hint:** Traffic to S3 doesn't have to cross the internet or a NAT gateway. Which endpoint type has no hourly or data-processing charge?

---

## ALPHA-011: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A company hosts a web application behind an Application Load Balancer in us-east-1 (primary) and a warm standby stack behind another ALB in eu-west-1. All users should be sent to us-east-1 during normal operation, and traffic must automatically shift to eu-west-1 if the primary ALB becomes unhealthy. The company uses the domain app.example.com in Amazon Route 53. Which configuration meets these requirements?

### Options
- **A.** Create two weighted records with weights 100 and 0 and no health checks, then change the weights manually during an outage.
- **B.** Create two records using geolocation routing with the default location set to eu-west-1.
- **C.** Create two alias records for app.example.com using the failover routing policy: a PRIMARY record pointing to the us-east-1 ALB with 'Evaluate Target Health' or an associated health check, and a SECONDARY record pointing to the eu-west-1 ALB.
- **D.** Create two alias records using latency-based routing, one for each Region's ALB, and associate a health check with each.

### Correct answer: C

**Summary:** Route 53 failover routing with health checks is the active/passive pattern: primary until unhealthy, then secondary.

### Explanation
- A is wrong: weights without health checks need manual changes.
- B is wrong: geolocation routes by location, not health.
- C is correct: failover routing with alias records and health checks (or Evaluate Target Health) is Route 53's active-passive pattern.
- D is wrong: latency routing is active-active.

**Key phrases:** warm standby · All users should be sent to us-east-1 during normal operation · automatically shift to eu-west-1 · primary ALB becomes unhealthy
**Hint:** Everyone goes to the primary until it is unhealthy. Which Route 53 routing policy models active-passive?

---

## ALPHA-012: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** hard · **Pillars:** Security, Performance Efficiency

### Question
An online learning company serves HLS video (a manifest plus thousands of segment files) stored in a private Amazon S3 bucket to paying subscribers worldwide. Only authenticated subscribers may watch, users must not be able to bypass the CDN by using S3 URLs, and viewers need low latency. The company does not want to generate a separate signed URL for each segment. Which solution meets these requirements?

### Options
- **A.** Use Amazon CloudFront with origin access control (OAC) so that only CloudFront can read the private bucket, and configure the distribution to require signed cookies that the application issues to authenticated subscribers.
- **B.** Place Amazon CloudFront in front of the bucket with the bucket open to any principal, and use AWS WAF rate-based rules to deter abuse.
- **C.** Generate S3 presigned URLs for the manifest and every segment file and return them to the authenticated user.
- **D.** Make the S3 bucket public, place Amazon CloudFront in front of it, and require CloudFront signed URLs for the manifest only.

### Correct answer: A

**Summary:** CloudFront OAC blocks direct S3 access, and signed cookies authorize many files at once instead of one signed URL per file.

### Explanation
- A is correct: origin access control lets only CloudFront read the private bucket, so direct S3 URLs stop working, and signed cookies authorize a subscriber for many files at once, which suits a manifest plus thousands of segments without changing their URLs.
- B is wrong: a bucket open to any principal can be read directly from S3, and rate-based WAF rules slow abuse but do not authenticate subscribers.
- C is wrong: presigned URLs send viewers straight to S3, bypassing the CDN and its caching, and generating one per segment is exactly the per-file work the company wants to avoid.
- D is wrong: a public bucket lets anyone skip CloudFront and download segments directly from S3, and signing only the manifest leaves every segment unprotected.

**Key phrases:** thousands of segment files · private Amazon S3 bucket · Only authenticated subscribers · must not be able to bypass the CDN · low latency · separate signed URL for each segment
**Hint:** Many files behind one login, and S3 must not be reachable directly. Compare signed URLs with signed cookies, and how the bucket trusts CloudFront.

---

## ALPHA-013: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security

### Question
A company uses AWS Organizations with 40 member accounts grouped into OUs. The security team must guarantee that no principal in any member account, including account administrators, can stop or delete the organization's AWS CloudTrail trails or use any Region other than us-east-1 and eu-west-1 (except for global services). The control must also apply automatically to new accounts. What should the solutions architect do?

### Options
- **A.** Create an IAM policy with the required denies and attach it to every IAM user in each account using AWS CloudFormation StackSets.
- **B.** Attach service control policies (SCPs) to the root or relevant OUs that deny cloudtrail:StopLogging and cloudtrail:DeleteTrail and deny actions when aws:RequestedRegion is not in the approved list (excluding global services with NotAction).
- **C.** Apply IAM permissions boundaries to all roles and users in each member account and require developers to attach them at creation time.
- **D.** Enable AWS Config rules with automatic remediation that re-enable CloudTrail and terminate resources launched in disallowed Regions.

### Correct answer: B

**Summary:** SCPs cap permissions for every principal, including admins, across member accounts, but never apply to the management account itself.

### Explanation
- A is wrong: IAM policies deployed with StackSets can be detached or overridden by account administrators, and they do not apply automatically to new accounts or new principals.
- B is correct: SCPs cap the permissions of every principal in member accounts, including administrators, and are inherited by new accounts, so denying cloudtrail:StopLogging and cloudtrail:DeleteTrail and denying requests outside the approved Regions, with NotAction exempting global services, is preventive, although SCPs never apply to the management account itself.
- C is wrong: permissions boundaries must be attached principal by principal, so an administrator can create a new role without one, and nothing enforces them in new accounts.
- D is wrong: AWS Config detects and remediates after the fact, so a trail can be stopped or a resource launched before the rule reacts.

**Key phrases:** 40 member accounts · including account administrators · stop or delete · any Region other than us-east-1 and eu-west-1 · apply automatically to new accounts
**Hint:** You need a preventive guardrail that account admins cannot override and that covers new accounts automatically. Where in AWS Organizations is that set?

---

## ALPHA-014: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security

### Question
Account A owns an encrypted Amazon EBS volume snapshot that was created with the AWS managed key (aws/ebs). A partner in Account B needs to create volumes from this snapshot. The security team insists that the data remain encrypted at all times and that the snapshot never be made public. What is the correct approach?

### Options
- **A.** Copy the snapshot in Account A, re-encrypting it with a customer managed KMS key whose key policy allows Account B to use the key, then share the copied snapshot with Account B.
- **B.** Make the snapshot public so that Account B can copy it, then delete the public permission afterwards.
- **C.** Export the snapshot data to an unencrypted S3 bucket and grant Account B access with a bucket policy.
- **D.** Modify the snapshot permissions to add Account B's ID and share it directly; Account B can then use the aws/ebs key to decrypt it.

### Correct answer: A

**Summary:** Sharing an EBS snapshot across accounts needs a customer managed KMS key, since an account can't use another account's AWS managed key.

### Explanation
- A is correct: copying the snapshot re-encrypts it with a customer managed key whose key policy can grant Account B use of the key, so the copy can be shared privately and stays encrypted throughout.
- B is wrong: encrypted snapshots cannot be made public at all, and exposing the data publicly, even briefly, violates the requirement.
- C is wrong: exporting to an unencrypted bucket breaks the rule that the data stay encrypted at all times.
- D is wrong: a snapshot encrypted with the AWS managed key aws/ebs cannot be shared with another account, because that key's policy cannot be changed to let Account B use it.

**Key phrases:** AWS managed key (aws/ebs) · Account B · remain encrypted at all times · never be made public
**Hint:** AWS managed keys cannot have their key policy edited. What must the snapshot be re-encrypted with before it can be shared?

---

## ALPHA-015: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security, Operational Excellence

### Question
A microservices application on Amazon ECS connects to an Amazon RDS for PostgreSQL database. Security policy requires the database credentials to be rotated every 30 days without application downtime, encrypted with a customer managed key, and every access to the secret must be auditable. Which solution meets these requirements with the LEAST custom development?

### Options
- **A.** Store the credentials in an S3 object encrypted with SSE-KMS and have the application download it at startup; use S3 Object Lambda to rotate the value.
- **B.** Store the credentials in AWS Secrets Manager encrypted with a customer managed KMS key, enable automatic rotation every 30 days using the managed RDS rotation function, and grant the ECS task role secretsmanager:GetSecretValue. Use AWS CloudTrail to audit access.
- **C.** Store the credentials in environment variables in the ECS task definition, encrypted at rest by the ECS service, and redeploy the tasks with new values every 30 days.
- **D.** Store the credentials as a SecureString in AWS Systems Manager Parameter Store (standard tier) and write a cron job on an EC2 instance to change the password every 30 days.

### Correct answer: B

**Summary:** Secrets Manager auto-rotates RDS credentials on a schedule with zero app downtime, encrypted and access-controlled.

### Explanation
- A is wrong: S3 has no rotation feature, and S3 Object Lambda transforms objects as they are read rather than changing a database password.
- B is correct: Secrets Manager rotates RDS credentials on a schedule with AWS-provided rotation functions, encrypts the secret with a customer managed KMS key, controls access through the task role, and records every retrieval in CloudTrail.
- C is wrong: plain environment variables in a task definition are visible to anyone who can read it, and redeploying to rotate risks downtime.
- D is wrong: Parameter Store has no built-in rotation, so the cron job on EC2 is custom development and a single point of failure.

**Key phrases:** rotated every 30 days · without application downtime · customer managed key · must be auditable · LEAST custom development
**Hint:** Which service offers built-in scheduled rotation for RDS credentials, with KMS encryption and CloudTrail auditing?

---

## ALPHA-016: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Reliability, Performance Efficiency

### Question
An order service publishes an event each time an order is placed. Three independent downstream services (inventory, billing, and analytics) must each process every event. Each consumer can be offline for several hours during maintenance and must not lose events, and each must scale its processing independently. Which architecture is the MOST appropriate?

### Options
- **A.** Publish the events to a single Amazon SQS FIFO queue with three message group IDs, one per service.
- **B.** Publish the events to a single Amazon SQS standard queue and have the three services poll the same queue.
- **C.** Publish the events to an Amazon SNS topic and subscribe each service's HTTPS endpoint directly to the topic.
- **D.** Publish the events to an Amazon SNS topic and subscribe a separate Amazon SQS queue for each service, with each service polling its own queue.

### Correct answer: D

**Summary:** SNS fan-out to per-consumer SQS queues gives each subscriber its own durable, independently scaled copy of every event.

### Explanation
- A is wrong: message groups control ordering within one queue, and each message is still consumed once, so every service does not get its own copy.
- B is wrong: consumers on one queue compete for messages, so each event reaches only one of the three services.
- C is wrong: SNS retries HTTPS deliveries only for a limited time, so a subscriber that is offline for hours loses events.
- D is correct: SNS delivers a copy of every event to each subscribed SQS queue, each queue holds messages for up to 14 days while its service is offline, and each service scales its own consumers independently.

**Key phrases:** must each process every event · offline for several hours · must not lose events · scale its processing independently
**Hint:** Each consumer needs its own copy of every event and a durable buffer. Combine a pub/sub service with a queue per consumer.

---

## ALPHA-017: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Operational Excellence, Reliability

### Question
A lending company is building a loan-processing workflow: validate the application (Lambda), call a credit-scoring API with retries and exponential backoff, wait for a human underwriter to approve or reject (which can take up to 3 days), and then disburse funds. The company needs a visual audit trail of every execution and wants to avoid writing custom state-management code. Which solution should the architect choose?

### Options
- **A.** Chain AWS Lambda functions directly and use a sleep loop inside the approval function until the underwriter responds.
- **B.** Use Amazon SQS queues between the steps and an Amazon EventBridge scheduled rule to poll for approvals every minute.
- **C.** Use AWS Step Functions Express workflows so that the workflow scales to high volume at lower cost.
- **D.** Use AWS Step Functions Standard workflows with built-in Retry/Catch on the task states and the .waitForTaskToken callback pattern for the human approval step.

### Correct answer: D

**Summary:** Step Functions Standard workflows run for up to a year and use .waitForTaskToken to pause for a human step.

### Explanation
- A is wrong: a Lambda function runs for at most 15 minutes, so it cannot wait through a three-day approval, and chaining functions means writing the state handling yourself.
- B is wrong: queues plus a polling schedule need custom code to track each application's state and give no visual audit trail.
- C is wrong: Express workflows run for at most five minutes and do not support the .waitForTaskToken callback pattern, so they cannot wait days for a human.
- D is correct: Standard workflows can run for up to a year, provide built-in Retry and Catch with exponential backoff and a visual execution history, and the .waitForTaskToken pattern pauses the workflow until the underwriter's decision is sent back.

**Key phrases:** retries and exponential backoff · human underwriter · up to 3 days · visual audit trail · custom state-management code
**Hint:** The workflow waits days for a human. Which Step Functions workflow type allows long durations, and which integration pattern pauses for a callback?

---

## ALPHA-018: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Performance Efficiency

### Question
A trading platform sends account transactions (deposits, withdrawals) to a processing tier. For each account, transactions must be processed exactly once and in the order they were submitted, but different accounts may be processed in parallel. Messages that repeatedly fail must be set aside for investigation without blocking the other accounts. Which solution meets these requirements?

### Options
- **A.** Use an Amazon SNS standard topic with an Amazon SQS standard queue subscribed for each account.
- **B.** Use a single Amazon SQS FIFO queue with the same MessageGroupId for all messages so that global ordering is guaranteed.
- **C.** Use an Amazon SQS FIFO queue with the account ID as the MessageGroupId and a deduplication ID (or content-based deduplication), and configure a dead-letter queue with a maxReceiveCount.
- **D.** Use an Amazon SQS standard queue and have the consumers sort messages by timestamp before processing.

### Correct answer: C

**Summary:** SQS FIFO orders messages per MessageGroupId (e.g. per account), so groups run in parallel while staying ordered within themselves.

### Explanation
- A is wrong: standard SNS topics and SQS queues guarantee neither order nor exactly-once delivery, and a queue per account does not scale.
- B is wrong: one message group for every message serializes the whole queue, so accounts can no longer be processed in parallel and one failing message holds up everyone.
- C is correct: a FIFO queue orders messages within each message group, so using the account ID as the MessageGroupId keeps each account in order while different accounts run in parallel, deduplication gives exactly-once processing, and a dead-letter queue sets aside messages that keep failing.
- D is wrong: standard queues deliver at least once in best-effort order, so sorting by timestamp in the consumer cannot guarantee exactly-once, in-order processing.

**Key phrases:** exactly once · in the order they were submitted · different accounts may be processed in parallel · set aside for investigation · without blocking the other accounts
**Hint:** Ordering per account but parallelism across accounts. Which SQS FIFO attribute defines the scope of ordering?

---

## ALPHA-019: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Operational Excellence, Reliability

### Question
A SaaS company wants to react to events from several AWS services and from a third-party SaaS partner (for example, a new customer support ticket). Events must be filtered by content (such as priority equal to 'high') and routed to different targets: a Lambda function for high-priority tickets and an SQS queue for the rest. The company wants minimal custom integration code and no polling of the partner's API. Which solution is the MOST appropriate?

### Options
- **A.** Use Amazon SQS long polling to read partner events and an EC2 instance to route them to the correct target.
- **B.** Configure an Amazon EventBridge partner event source, associate it with an event bus, and create rules with event patterns that route matching events to the Lambda function and the SQS queue.
- **C.** Send the partner's webhooks to an Amazon Kinesis Data Streams stream and write a consumer that inspects the payloads and forwards them.
- **D.** Write a Lambda function that polls the partner's API every minute, and publish the results to an Amazon SNS topic with filter policies.

### Correct answer: B

**Summary:** EventBridge natively ingests SaaS partner events and routes them by content with no polling or custom code.

### Explanation
- A is wrong: SQS cannot receive partner events on its own, and an EC2 routing instance is custom code and a single point of failure.
- B is correct: EventBridge receives events from supported SaaS partners natively through a partner event source, and rules with content-based event patterns route high-priority tickets to Lambda and everything else to SQS with no integration code.
- C is wrong: Kinesis needs stream capacity planning and custom consumer code to inspect and forward each event.
- D is wrong: polling the partner API is custom code to run and adds up to a minute of latency.

**Key phrases:** third-party SaaS partner · filtered by content · routed to different targets · minimal custom integration code · no polling
**Hint:** One service can ingest third-party SaaS partner events and route them by content patterns. Which is it?

---

## ALPHA-020: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability

### Question
A company runs its customer-facing application on Amazon Aurora PostgreSQL in us-east-1. Its disaster recovery plan requires an RPO of about 1 second and an RTO of less than 1 minute for a Regional outage, and users in the DR Region (ap-southeast-1) should also get low-latency local reads during normal operations. Which solution meets these requirements with the LEAST operational overhead?

### Options
- **A.** Use AWS Backup with a cross-Region copy rule that runs every 15 minutes.
- **B.** Copy automated snapshots to ap-southeast-1 every hour and restore the snapshot during a disaster.
- **C.** Convert the deployment to an Aurora Global Database with a secondary cluster in ap-southeast-1; serve local reads from the secondary cluster and promote it (managed failover) during a Regional outage.
- **D.** Use AWS DMS to continuously replicate from the Aurora cluster to a new Aurora cluster in ap-southeast-1 and promote it during a disaster.

### Correct answer: C

**Summary:** Aurora Global Database replicates cross-Region in under a second and fails over in about a minute.

### Explanation
- A is wrong: backups every 15 minutes still lose up to 15 minutes of data, and a restore cannot finish within a minute.
- B is wrong: hourly snapshot copies mean up to an hour of data loss, and restoring a cluster takes far longer than a minute.
- C is correct: Aurora Global Database replicates at the storage layer with typical lag under a second, a managed failover promotes the secondary Region in about a minute, and the secondary cluster serves local reads during normal operation.
- D is wrong: DMS logical replication adds lag and provides no managed failover, so the company would own the cutover procedure.

**Key phrases:** RPO of about 1 second · RTO of less than 1 minute · Regional outage · low-latency local reads · LEAST operational overhead
**Hint:** Sub-second RPO and sub-minute RTO across Regions for Aurora. Think storage-level replication rather than snapshots or logical replication.

---

## ALPHA-021: Disaster Recovery & Migration
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A research institution must migrate 400 TB of data from its on-premises data center to Amazon S3 within 6 weeks. The site has a 200 Mbps internet connection that is shared with other business traffic, and provisioning a new dedicated circuit would take more than 3 months. Which solution meets the deadline?

### Options
- **A.** Deploy an AWS DataSync agent on premises and transfer the data over the existing connection.
- **B.** Order multiple AWS Snowball Edge Storage Optimized devices, load the data locally, and ship the devices back to AWS to be imported into Amazon S3.
- **C.** Order an AWS Snowmobile to transfer the data.
- **D.** Use Amazon S3 Transfer Acceleration to upload the data over the existing internet connection.

### Correct answer: B

**Summary:** Multiple Snowball Edge devices loaded in parallel beat a slow link for large one-time data migrations.

### Explanation
- A is wrong: DataSync is limited by the same 200 Mbps connection, so the transfer would take months.
- B is correct: several Snowball Edge Storage Optimized devices can be loaded in parallel on site and shipped, so the whole 400 TB moves within weeks without touching the slow link.
- C is wrong: Snowmobile was designed for moves of tens of petabytes or more, far beyond 400 TB.
- D is wrong: Transfer Acceleration speeds long-distance transfers but still runs over the same shared 200 Mbps link, which needs about 185 days to move 400 TB.

**Key phrases:** 400 TB · within 6 weeks · 200 Mbps internet connection · more than 3 months
**Hint:** Do the math: 400 TB over 200 Mbps. Which option avoids the network, and which one is sized for exabytes rather than terabytes?

---

## ALPHA-022: Disaster Recovery & Migration
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** medium · **Pillars:** Operational Excellence, Reliability

### Question
A company is migrating a 5 TB on-premises Oracle database to Amazon Aurora PostgreSQL. The schema includes PL/SQL stored procedures and Oracle-specific data types. The business can tolerate at most 5 minutes of downtime during cutover, and the on-premises database stays online during the migration. Which approach should the solutions architect recommend?

### Options
- **A.** Use the AWS Schema Conversion Tool (SCT) to convert the schema and code, then use AWS DMS with a full load plus ongoing change data capture (CDC) to keep the target in sync, and cut over when replication lag is near zero.
- **B.** Order an AWS Snowball Edge device, copy the Oracle data files to it, and restore them directly as an Aurora PostgreSQL cluster.
- **C.** Use AWS DMS alone with a full-load-only task, and rely on DMS to automatically convert all stored procedures and data types.
- **D.** Export the database using Oracle Data Pump, upload the dump files to Amazon S3, and import them into Aurora PostgreSQL after taking the source offline.

### Correct answer: A

**Summary:** SCT converts the schema/code and DMS keeps replicating until cutover, so the source stays live during a database migration.

### Explanation
- A is correct: SCT converts the Oracle schema and PL/SQL into PostgreSQL-compatible code, and DMS full load plus change data capture keeps the target in sync while the source stays online, so cutover takes only minutes.
- B is wrong: Oracle data files cannot be restored as an Aurora PostgreSQL cluster because the engines are not compatible.
- C is wrong: DMS moves data but does not convert stored procedures or complex Oracle code, and a full-load-only task leaves the target stale while the source stays online.
- D is wrong: Oracle Data Pump files cannot be imported into PostgreSQL, and taking the source offline for the transfer breaks the 5-minute downtime limit.

**Key phrases:** Oracle database · Amazon Aurora PostgreSQL · PL/SQL stored procedures · at most 5 minutes of downtime · stays online
**Hint:** Different engines means schema and code must be converted first. Which two AWS tools work together, and how do you keep the source online?

---

## ALPHA-023: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Cost Optimization

### Question
A three-tier web application (ALB, EC2 Auto Scaling group, Amazon RDS for MySQL) runs in us-east-1. Management wants a disaster recovery strategy in another Region with an RTO of 1 hour and an RPO of 5 minutes, while keeping DR costs as low as possible. Which strategy should the architect implement?

### Options
- **A.** Warm standby: run a scaled-down but fully functional copy of the whole stack in the DR Region with a cross-Region read replica, ready to scale up.
- **B.** Backup and restore: copy nightly RDS snapshots and AMIs to the DR Region and restore everything when a disaster occurs.
- **C.** Multi-site active-active: run full-capacity stacks in both Regions with a multi-master database and Route 53 weighted routing.
- **D.** Pilot light: create a cross-Region RDS read replica, copy AMIs to the DR Region, keep the Auto Scaling group and ALB defined by infrastructure as code with the minimum capacity at zero, and promote the replica and scale out during a disaster.

### Correct answer: D

**Summary:** Pilot light keeps only data replication and templates running, so DR compute costs stay near zero until failover.

### Explanation
- A is wrong: a warm standby meets the targets but keeps a scaled-down stack running all the time, which costs more than a pilot light.
- B is wrong: nightly snapshots mean up to a day of lost data, far beyond a 5-minute RPO.
- C is wrong: active-active at full capacity in both Regions is the most expensive strategy and far exceeds what a 1-hour RTO needs.
- D is correct: a pilot light keeps data replicating continuously through a cross-Region read replica, which meets the 5-minute RPO, and keeps AMIs and templates ready so compute costs almost nothing until failover, when promoting the replica and scaling out fits within an hour.

**Key phrases:** another Region · RTO of 1 hour · RPO of 5 minutes · as low as possible
**Hint:** RTO of an hour and RPO of minutes at the lowest cost. Which DR strategy keeps only data replication and templates running?

---

## ALPHA-024: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** hard · **Pillars:** Performance Efficiency

### Question
A serverless API built with Amazon API Gateway and AWS Lambda (Node.js) is attached to a VPC so that it can reach an Amazon RDS database. Every weekday at 08:00, traffic ramps from near zero to 3,000 requests per minute and p99 latency spikes to several seconds, although average latency stays acceptable. Most requests are writes. The team must reduce p99 latency during the ramp. Which TWO actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Increase the function timeout from 10 seconds to 60 seconds so that slow invocations have time to complete.
- **B.** Configure provisioned concurrency on the function's alias and use Application Auto Scaling to raise it on a schedule shortly before 08:00.
- **C.** Enable response caching in Amazon API Gateway for the endpoint.
- **D.** Increase the function's memory allocation, which proportionally increases the CPU available to the function's initialization code.
- **E.** Set reserved concurrency on the function to the expected peak so that capacity is guaranteed during the ramp.

### Correct answers: B, D (choose 2)

**Summary:** Provisioned concurrency scheduled ahead of a known ramp, plus more memory (so more CPU), fixes predictable cold-start latency spikes.

### Explanation
- A is wrong: the timeout only caps how long an invocation may run and does nothing for latency, and the VPC attachment is not the cause either, since Lambda's shared VPC network interfaces removed the old VPC cold-start penalty.
- B is correct: provisioned concurrency keeps initialized execution environments ready, and raising it on a schedule shortly before 08:00 covers the predictable ramp.
- C is wrong: the traffic is mostly writes, and API Gateway caches responses to reads, not writes.
- D is correct: Lambda allocates CPU in proportion to memory, so more memory shortens both initialization and execution for the environments that still start cold.
- E is wrong: reserved concurrency guarantees and caps a share of the account's concurrency, but it does not pre-initialize execution environments, so cold starts remain.

**Key phrases:** p99 latency spikes · every weekday at 08:00 · ramps from near zero · average latency stays acceptable · Most requests are writes · TWO
**Hint:** The spike is initialization cost paid on new execution environments, at a predictable time of day. One action pre-initializes environments; the other changes how much CPU the initialization code gets.

---

## ALPHA-025: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Reliability

### Question
A self-managed PostgreSQL database runs on a single Amazon EC2 instance. The workload needs a sustained 40,000 IOPS with consistent sub-millisecond latency from one volume, and the data must survive an instance stop or an instance failure. On the current gp3 volume, latency is too high and too variable at peak. Which TWO actions should the solutions architect take? (Select TWO.)

### Options
- **A.** Provision an io2 Block Express volume with 40,000 IOPS.
- **B.** Keep the gp3 volume and raise its provisioned IOPS to 40,000.
- **C.** Move the database files to the instance store volumes of a storage-optimized instance type.
- **D.** Enable fast snapshot restore on the volume's snapshots.
- **E.** Run the database on an instance type whose dedicated EBS bandwidth and IOPS limits exceed the volume's provisioned performance.

### Correct answers: A, E (choose 2)

**Summary:** Storage IOPS needs are capped by both the volume type and the instance's own EBS bandwidth ceiling -- size both together.

### Explanation
- A is correct: io2 Block Express is built for consistent sub-millisecond latency and supports up to 256,000 IOPS per volume, comfortably above the 40,000 needed from one volume.
- B is wrong: gp3 volumes can now be provisioned with up to 80,000 IOPS, so IOPS is not the limit, but gp3 is designed for single-digit millisecond latency rather than the consistent sub-millisecond latency this workload needs.
- C is wrong: instance store data is lost when the instance stops or fails, which the requirement rules out.
- D is wrong: fast snapshot restore removes first-read latency on volumes created from snapshots and does nothing for steady-state latency or IOPS.
- E is correct: every instance type has its own EBS bandwidth and IOPS ceiling, so the instance must be able to carry 40,000 IOPS or it silently caps the volume.

**Key phrases:** sustained 40,000 IOPS · consistent sub-millisecond latency · survive an instance stop or an instance failure · latency is too high and too variable
**Hint:** IOPS alone no longer separates gp3 from io2; latency does. Then consider what else sits between the instance and the volume and has its own limit.

---

## ALPHA-026: Databases & Caching
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** hard · **Pillars:** Reliability, Performance Efficiency

### Question
Thousands of concurrent AWS Lambda invocations open connections to an Amazon RDS for PostgreSQL Multi-AZ DB instance, and the database regularly exhausts its connection limit. The business also requires that failover complete in under 40 seconds, and it wants heavy reporting queries served by a standby instance rather than the writer. Which TWO actions should the solutions architect take? (Select TWO.)

### Options
- **A.** Raise the max_connections parameter in a custom DB parameter group to the maximum the instance class allows.
- **B.** Put an Amazon RDS Proxy in front of the database and have the Lambda functions connect to the proxy endpoint.
- **C.** Convert the deployment to a Multi-AZ DB cluster with two readable standby instances.
- **D.** Direct the reporting queries to the standby of the existing Multi-AZ DB instance deployment.
- **E.** Create a cross-Region read replica and promote it manually if the primary fails.

### Correct answers: B, C (choose 2)

**Summary:** RDS Proxy absorbs connection churn from many short-lived Lambda calls, and a Multi-AZ DB cluster's standbys are readable for fast failover.

### Explanation
- A is wrong: raising max_connections trades memory for more connections and does not address the churn of thousands of short-lived clients.
- B is correct: RDS Proxy pools and reuses database connections, so thousands of short-lived Lambda invocations share a small number of connections instead of exhausting the limit.
- C is correct: a Multi-AZ DB cluster typically fails over in under 35 seconds, and its two standby instances are readable, so reporting queries can run on a standby instead of the writer.
- D is wrong: the standby of a Multi-AZ DB instance deployment cannot serve reads, and that deployment type typically takes 60 to 120 seconds to fail over.
- E is wrong: a cross-Region read replica must be promoted manually, which cannot meet a 40-second failover target, and it does nothing for connection exhaustion.

**Key phrases:** thousands of concurrent · exhausts its connection limit · under 40 seconds · served by a standby instance · TWO
**Hint:** One action absorbs connection churn from short-lived compute. For the other, compare the two RDS Multi-AZ deployment options on failover time and on whether their standbys can serve reads.

---

## ALPHA-027: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence

### Question
A company connects 50 VPCs spread across three AWS accounts to its on-premises data center. The VPCs are joined by a full mesh of VPC peering connections that the network team can no longer manage, and hybrid traffic depends on a single AWS Direct Connect connection: a recent outage at that Direct Connect location took down all connectivity to on premises. The company requires consistent, predictable bandwidth for hybrid traffic. Which TWO actions should the solutions architect take? (Select TWO.)

### Options
- **A.** Replace the peering mesh with an AWS Transit Gateway and share it with the other accounts using AWS Resource Access Manager.
- **B.** Replace Direct Connect with several AWS Site-to-Site VPN tunnels over the internet.
- **C.** Provision a second Direct Connect connection at a different Direct Connect location and associate both with a Direct Connect gateway.
- **D.** Keep the VPC peering mesh and enable transitive routing between the peering connections.
- **E.** Provision a second Direct Connect connection on a separate device at the same Direct Connect location.

### Correct answers: A, C (choose 2)

**Summary:** A Transit Gateway replaces a peering mesh at scale, and two Direct Connect locations (not two devices at one) survive a location outage.

### Explanation
- A is correct: a Transit Gateway replaces the 1,225-connection peering mesh with a single hub, and AWS Resource Access Manager shares it with the other accounts.
- B is wrong: VPN tunnels over the internet cannot offer the consistent, predictable bandwidth the company requires.
- C is correct: connections at two different Direct Connect locations survive the loss of either location, and a Direct Connect gateway lets both reach the Transit Gateway while keeping dedicated, predictable bandwidth.
- D is wrong: VPC peering is never transitive, and no setting makes it so.
- E is wrong: a second connection at the same Direct Connect location still fails when that location fails, which is exactly the outage that happened.

**Key phrases:** 50 VPCs · three AWS accounts · full mesh of VPC peering · single AWS Direct Connect connection · outage at that Direct Connect location · consistent, predictable bandwidth · TWO
**Hint:** One action replaces the mesh with a hub that can be shared across accounts. For the other, look closely at which component actually failed and at what must be different about the second one.

---

## ALPHA-028: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security

### Question
A company with 30 AWS accounts in AWS Organizations wants employees to sign in to the AWS Management Console for any account using their existing corporate Active Directory credentials, with access assigned and audited centrally. Separately, its public mobile application must let end users upload files directly to Amazon S3 under their own identity after they sign in with Google or Apple. No long-lived AWS credentials may be issued. Which TWO actions meet these requirements? (Select TWO.)

### Options
- **A.** Embed an IAM access key in the mobile application and rotate it every quarter.
- **B.** Configure a SAML identity provider and a set of roles separately in each of the 30 accounts and have employees assume roles account by account.
- **C.** Create an IAM user for each employee in every account and enforce MFA on each one.
- **D.** Enable AWS IAM Identity Center, connect it to Active Directory as the identity source, and assign permission sets to groups across the member accounts.
- **E.** Configure an Amazon Cognito identity pool with Google and Apple as identity providers so that the application exchanges provider tokens for temporary AWS credentials from an IAM role.

### Correct answers: D, E (choose 2)

**Summary:** Cognito federates end-user sign-in to temporary credentials, while IAM Identity Center centralizes workforce access -- different tools for different users.

### Explanation
- A is wrong: an access key embedded in an app is a long-lived credential that anyone can extract from the device.
- B is wrong: it works technically but repeats identity provider and role setup in all 30 accounts, which is neither central nor maintainable.
- C is wrong: IAM users in every account are long-lived credentials to manage 30 times over, with no central assignment or audit.
- D is correct: IAM Identity Center connects to Active Directory once and assigns permission sets to groups across every member account from one place, with sign-in and access audited centrally.
- E is correct: a Cognito identity pool exchanges a Google or Apple token for temporary, role-scoped AWS credentials, so each app user uploads to S3 under their own identity without any long-lived key.

**Key phrases:** existing corporate Active Directory · any account · assigned and audited centrally · public mobile application · Google or Apple · No long-lived AWS credentials · TWO
**Hint:** Workforce identities and application end users are solved by two different services. Do not reach for the same one twice.

---

## ALPHA-029: Application Integration
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Reliability

### Question
A clickstream platform ingests 10,000 events per second. Four independent teams consume the same stream, each at its own pace, and one team's slow consumer currently adds read latency for the other three. A newly onboarded consumer must be able to reprocess the last 7 days of events from the beginning, and events for any given user must be processed in the order they arrived. Which TWO actions should the solutions architect take? (Select TWO.)

### Options
- **A.** Publish the events to an Amazon SNS topic with a separate Amazon SQS queue subscribed for each team.
- **B.** Use an Amazon SQS FIFO queue with the user ID as the MessageGroupId and give each team its own consumer fleet on that queue.
- **C.** Publish the events to Amazon Kinesis Data Streams using the user ID as the partition key, and set the stream's retention period to 7 days.
- **D.** Register each team's application as an enhanced fan-out consumer so that each one receives its own dedicated read throughput per shard.
- **E.** Increase the number of shards so that each team's consumer can read from its own shard.

### Correct answers: C, D (choose 2)

**Summary:** Kinesis retains records for replay, and enhanced fan-out gives each consumer its own throughput so one slow reader can't affect the rest.

### Explanation
- A is wrong: SQS deletes messages once they are processed, so a new consumer cannot replay past events.
- B is wrong: consumers on one queue compete for messages instead of each seeing every event, and a FIFO queue cannot replay consumed messages either.
- C is correct: Kinesis Data Streams keeps records for the configured retention period so a new consumer can replay 7 days from the start, and using the user ID as the partition key keeps each user's events in order within a shard.
- D is correct: enhanced fan-out gives each registered consumer its own 2 MB/s per shard read throughput, so a slow consumer no longer slows the others.
- E is wrong: shards partition the data, not the consumers, so every consumer still reads every shard and more shards do not isolate a slow team.

**Key phrases:** four independent teams · each at its own pace · adds read latency for the other three · reprocess the last 7 days · in the order they arrived · TWO
**Hint:** The buffer has to let a consumer re-read history instead of deleting on acknowledgement. Then find the feature that gives each consumer its own read throughput rather than a shared pipe.

---

## ALPHA-030: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** hard · **Pillars:** Reliability, Cost Optimization

### Question
A company must cut the RTO of its Amazon EC2 disaster recovery plan from hours to under 30 minutes with an RPO of about 15 minutes, while keeping DR cost low. Which TWO actions should the solutions architect take? (Select TWO.)

### Options
- **A.** Ship data monthly with AWS Snowball Edge.
- **B.** Use AWS Elastic Disaster Recovery to replicate servers continuously to a low-cost staging area in the DR Region.
- **C.** Copy nightly AMIs to the DR Region.
- **D.** Move boot volumes to Amazon S3 Glacier Deep Archive.
- **E.** Keep the VPC and infrastructure templates (AWS CloudFormation) ready in the DR Region.

### Correct answers: B, E (choose 2)

**Summary:** Pre-built DR networking plus continuous replication both cut recovery time without paying for always-on compute.

### Explanation
- A is wrong: Snowball Edge is for bulk offline data transfer, and monthly shipments give an RPO measured in weeks.
- B is correct: Elastic Disaster Recovery replicates servers continuously to low-cost staging resources, giving an RPO of seconds and launching recovery instances within minutes when needed.
- C is wrong: nightly AMIs mean up to a day of lost data, far beyond a 15-minute RPO.
- D is wrong: restores from Glacier Deep Archive take hours, which breaks a 30-minute RTO.
- E is correct: keeping the VPC and CloudFormation templates ready in the DR Region takes network build-out off the recovery path, so recovery instances can launch within the RTO.

**Key phrases:** RTO · hours to under 30 minutes · RPO of about 15 minutes · keeping DR cost low · TWO
**Hint:** One answer replicates continuously; the other prepares the environment so recovery can launch quickly.

---

## ALPHA-031: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security

### Question
Account A stores reports in an Amazon S3 bucket. The objects are encrypted with SSE-KMS using a customer managed key in Account A, and company policy requires that they stay encrypted with that key. A role in Account B has been granted s3:GetObject in both the bucket policy and its own IAM policy, but every download fails with an AccessDenied error. What should the solutions architect do to allow the downloads?

### Options
- **A.** Change the bucket's default encryption to SSE-S3 so that a KMS key is not involved in the download.
- **B.** Enable S3 Bucket Keys on the bucket so that requests no longer call AWS KMS for every object.
- **C.** Add a statement to the KMS key policy that allows the Account B role to call kms:Decrypt, and allow kms:Decrypt on that key in the role's IAM policy.
- **D.** Set the bucket's Object Ownership to bucket owner enforced so that ACLs no longer affect access.

### Correct answer: C

**Summary:** Cross-account SSE-KMS access needs kms:Decrypt granted explicitly in the key policy -- S3 permissions alone aren't enough.

### Explanation
- A is wrong: it abandons the required customer managed key.
- B is wrong: Bucket Keys cut KMS request costs and change nothing about authorization.
- C is correct: decrypting an SSE-KMS object requires kms:Decrypt in addition to the S3 permission, and for a cross-account principal the key policy must grant it explicitly, because a customer managed key's permissions are not inherited from the bucket policy.
- D is wrong: Object Ownership governs ACLs, and ACLs are not what is failing here.

**Key phrases:** SSE-KMS · customer managed key · stay encrypted with that key · granted s3:GetObject in both · AccessDenied
**Hint:** Two separate authorization checks happen on this request, and only one of them involves S3. Ask which resource the second check consults.

---

## ALPHA-032: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security

### Question
A public web application runs on Amazon EC2 instances behind an Application Load Balancer. The company is seeing SQL injection attempts and bursts of HTTP floods from rotating IP addresses, and its own security staff is not available around the clock. The company wants managed protection at the application layer and access to AWS experts during an attack. Which solution meets these requirements?

### Options
- **A.** Enable Amazon GuardDuty and create an Amazon EventBridge rule that notifies the security team when findings appear.
- **B.** Add network ACL entries that deny the attacking source IP addresses as the security team identifies them.
- **C.** Serve the application through Amazon CloudFront, attach an AWS WAF web ACL that uses AWS managed rule groups plus a rate-based rule, and subscribe to AWS Shield Advanced.
- **D.** Restrict the load balancer's security group to the corporate IP range and require a VPN for all users.

### Correct answer: C

**Summary:** Layered defenses (WAF managed rules, rate limiting, CloudFront, Shield Advanced) cover both app-layer attacks and volumetric floods.

### Explanation
- A is wrong: GuardDuty detects threats and raises findings, but it does not block requests.
- B is wrong: network ACLs hold only a small number of rules and cannot keep up with rotating addresses, and adding entries by hand needs staff around the clock.
- C is correct: AWS WAF managed rule groups block SQL injection, a rate-based rule throttles floods from rotating addresses, CloudFront absorbs the traffic at the edge, and Shield Advanced adds the Shield Response Team and DDoS cost protection.
- D is wrong: limiting the load balancer to the corporate range behind a VPN would lock out the public users the application serves.

**Key phrases:** SQL injection · HTTP floods from rotating IP addresses · not available around the clock · application layer · AWS experts during an attack
**Hint:** One service filters and rate-limits HTTP requests using rules AWS maintains; a second subscription adds expert support and billing protection during a large attack.

---

## ALPHA-033: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** hard · **Pillars:** Security, Reliability

### Question
A SaaS provider must expose a single internal service to hundreds of customer VPCs that belong to other AWS accounts. Some customers use CIDR ranges that overlap with the provider's VPC and with each other. Connections must be initiated only from the customer side to the provider, and traffic must not traverse the public internet. Which solution meets these requirements?

### Options
- **A.** Attach the provider VPC and all customer VPCs to an AWS Transit Gateway shared through AWS Resource Access Manager.
- **B.** Create a VPC peering connection between the provider VPC and each customer VPC.
- **C.** Place the service behind a Network Load Balancer, create a VPC endpoint service (AWS PrivateLink), and have each customer create an interface VPC endpoint in their own VPC.
- **D.** Publish the service on a public Application Load Balancer and restrict access with a security group that lists each customer's public IP addresses.

### Correct answer: C

**Summary:** PrivateLink exposes a service via an interface endpoint inside each consumer's VPC, sidestepping overlapping CIDRs and peering's scale limits.

### Explanation
- A is wrong: a transit gateway also needs non-overlapping CIDR ranges to route, and it joins customer networks to the provider's network instead of exposing a single service.
- B is wrong: VPC peering is not possible between VPCs with overlapping CIDR ranges, it connects whole networks in both directions, and it does not scale to hundreds of customer VPCs.
- C is correct: PrivateLink exposes the service as an interface endpoint with an elastic network interface inside each consumer VPC, so overlapping CIDRs do not matter, connections can only be initiated from the consumer side, and traffic stays on the AWS network.
- D is wrong: a public load balancer sends the traffic over the internet, which the requirement forbids.

**Key phrases:** hundreds of customer VPCs · other AWS accounts · CIDR ranges that overlap · initiated only from the customer side · must not traverse the public internet
**Hint:** The overlapping address ranges rule out anything that merges routing domains. Which connectivity option presents the service as an endpoint inside the consumer's own VPC?

---

## ALPHA-034: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** hard · **Pillars:** Security, Reliability

### Question
Amazon EC2 instances in a private subnet must download operating system patches from the internet through a NAT gateway. A custom network ACL on the private subnet allows outbound TCP traffic on ports 80 and 443 and allows inbound TCP traffic on ports 80 and 443. The instances' security group allows all outbound traffic. Patch downloads consistently time out. What is the cause, and how should it be fixed?

### Options
- **A.** The NAT gateway needs an inbound rule. Attach a security group to the NAT gateway that allows ports 80 and 443.
- **B.** The private subnet needs a route to an internet gateway in addition to the NAT gateway route.
- **C.** Network ACLs are stateless, so the response traffic is blocked. Add an inbound network ACL rule allowing TCP ports 1024 through 65535 from 0.0.0.0/0.
- **D.** The security group is stateless, so the response traffic is blocked. Add an inbound security group rule allowing TCP ports 1024 through 65535.

### Correct answer: C

**Summary:** Network ACLs are stateless, so return traffic needs its own inbound rule for the ephemeral port range.

### Explanation
- A is wrong: NAT gateways do not use security groups.
- B is wrong: the subnet already routes through the NAT gateway, and a route to an internet gateway would not fix blocked responses and would defeat the private design.
- C is correct: network ACLs are stateless and evaluate each direction separately, and replies from web servers return to an ephemeral port on the instance rather than to port 80 or 443, so an inbound rule for TCP 1024 to 65535 lets the responses through.
- D is wrong: security groups are stateful, so return traffic for an allowed outbound connection is permitted automatically.

**Key phrases:** custom network ACL · allows inbound TCP traffic on ports 80 and 443 · security group allows all outbound · consistently time out
**Hint:** One of the two controls in this subnet evaluates each direction independently. Work out which ports the returning packets actually arrive on.

---

## ALPHA-035: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security

### Question
A company hires a third-party monitoring vendor that needs read-only access to resources in the company's AWS account. The vendor operates its own AWS account and serves many customers from it. The company must not issue long-lived credentials and must ensure that the vendor cannot be tricked by another of its customers into accessing this company's account. What should the solutions architect do?

### Options
- **A.** Create an IAM user with a read-only policy, generate an access key, and send it to the vendor over an encrypted channel.
- **B.** Create an IAM role whose trust policy allows any AWS principal, and rely on the read-only permissions policy to limit what the vendor can do.
- **C.** Add the vendor's AWS account to the company's organization in AWS Organizations and apply a read-only service control policy.
- **D.** Create an IAM role with a read-only policy whose trust policy names the vendor's AWS account as principal and requires a unique sts:ExternalId supplied by the vendor.

### Correct answer: D

**Summary:** sts:ExternalId is the standard defense against the confused-deputy problem when a third party assumes a cross-account role.

### Explanation
- A is wrong: an access key for an IAM user is a long-lived credential, which the company must not issue, and it could leak from the vendor's systems.
- B is wrong: a trust policy that allows any AWS principal lets anyone assume the role.
- C is wrong: a vendor's multi-tenant account cannot sensibly join the company's organization, and SCPs restrict permissions rather than granting access.
- D is correct: a cross-account role gives the vendor temporary credentials, and the sts:ExternalId condition is the documented defense against the confused deputy problem, because the vendor must present a value unique to this customer.

**Key phrases:** must not issue long-lived credentials · cannot be tricked by another of its customers
**Hint:** The vendor is a deputy acting for many principals. What extra value must the vendor present when assuming the role so it cannot be confused about whose account it is entering?

---

## ALPHA-036: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company must continuously discover whether personally identifiable information, such as credit card numbers, has been stored in any of its 400 Amazon S3 buckets, and it must alert the security team automatically when new findings appear. The company wants a managed service and minimal custom code. Which solution meets these requirements?

### Options
- **A.** Write an AWS Lambda function triggered by S3 event notifications that applies regular expressions to every uploaded object.
- **B.** Enable Amazon Inspector on the buckets and subscribe the security team to its findings.
- **C.** Enable Amazon Macie on the buckets and create an Amazon EventBridge rule that routes findings to an Amazon SNS topic.
- **D.** Enable Amazon GuardDuty and create an Amazon EventBridge rule for its S3 findings.

### Correct answer: C

**Summary:** Macie uses ML to find sensitive data across S3 and publishes findings to EventBridge automatically.

### Explanation
- A is wrong: a regex function on each upload is custom code to build and maintain, and it checks only new objects rather than discovering data already stored in 400 buckets.
- B is wrong: Inspector assesses workloads such as EC2, container images and Lambda for vulnerabilities, not the contents of S3 objects.
- C is correct: Macie is the managed service that uses machine learning and pattern matching to discover sensitive data in S3, and its findings publish to EventBridge for automatic notification.
- D is wrong: GuardDuty detects suspicious activity and threats, not sensitive data at rest.

**Key phrases:** personally identifiable information · 400 Amazon S3 buckets · alert the security team automatically · managed service · minimal custom code
**Hint:** Match the service to the target: one scans S3 content for sensitive data, others scan workloads for vulnerabilities or accounts for threats.

---

## ALPHA-037: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company serves www.example.com through an Amazon CloudFront distribution whose origin is an Application Load Balancer in eu-central-1. Traffic must be encrypted with the company's own certificate both from viewers to CloudFront and from CloudFront to the load balancer, and certificate renewal must be automatic. The team requested an AWS Certificate Manager certificate in eu-central-1, but it cannot be selected on the CloudFront distribution. What should the solutions architect do?

### Options
- **A.** Set the CloudFront origin protocol policy to HTTP only so that no certificate is needed at the origin.
- **B.** Move the Application Load Balancer to us-east-1 so that one certificate can serve both the distribution and the load balancer.
- **C.** Export the eu-central-1 ACM certificate and import it into the CloudFront distribution.
- **D.** Request a second ACM certificate for the domain in us-east-1 and associate it with the CloudFront distribution, keeping the eu-central-1 certificate on the Application Load Balancer.

### Correct answer: D

**Summary:** CloudFront certificates must live in us-east-1, separate from the origin's own regional ACM certificate.

### Explanation
- A is wrong: HTTP to the origin leaves the CloudFront-to-load-balancer leg unencrypted, which the requirements forbid.
- B is wrong: moving the load balancer relocates the workload and adds latency for no benefit, since each service can simply use its own certificate.
- C is wrong: public certificates issued by ACM cannot be exported and imported elsewhere.
- D is correct: CloudFront can use only ACM certificates issued in us-east-1, while an Application Load Balancer uses a certificate from its own Region, so the domain needs one certificate in each Region and ACM renews both automatically.

**Key phrases:** viewers to CloudFront · CloudFront to the load balancer · renewal must be automatic · cannot be selected on the CloudFront distribution
**Hint:** One of these two services only reads certificates from a single specific Region. The other reads them from its own Region.

---

## ALPHA-038: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Reliability

### Question
A multiplayer game server tier communicates with clients over UDP. The company runs the tier in three Regions and needs the lowest possible latency for players worldwide, failover between Regions within seconds, and a small set of static IP addresses that corporate and console firewalls can allow. Which solution meets these requirements?

### Options
- **A.** Put a Network Load Balancer in each Region and place AWS Global Accelerator in front of them.
- **B.** Put an Application Load Balancer in each Region and use Amazon Route 53 latency-based routing with health checks.
- **C.** Put a Network Load Balancer in each Region and use Amazon Route 53 weighted routing with health checks.
- **D.** Create an Amazon CloudFront distribution with the Regional game servers as origins.

### Correct answer: A

**Summary:** Global Accelerator gives static anycast IPs, carries UDP, and reroutes at the edge in seconds with no DNS wait.

### Explanation
- A is correct: Global Accelerator provides two static anycast IP addresses for firewalls to allow, carries UDP traffic onto the AWS global network at the edge location nearest each player, and shifts traffic away from an unhealthy Regional endpoint within seconds without waiting for DNS caches to expire.
- B is wrong: an Application Load Balancer handles only HTTP and HTTPS, and DNS caching by clients delays failover.
- C is wrong: Route 53 weighted routing still waits on DNS caching for failover and gives players no static IP addresses to allow.
- D is wrong: CloudFront does not proxy UDP game traffic.

**Key phrases:** over UDP · three Regions · lowest possible latency · failover between Regions within seconds · static IP addresses
**Hint:** UDP rules out the HTTP-oriented options. Of what remains, which one gives fixed anycast addresses and reroutes at the edge rather than through DNS?

---

## ALPHA-039: Storage & Backup
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization

### Question
Analysts run ad hoc SQL queries with Amazon Athena over five years of application logs stored in Amazon S3 as uncompressed JSON, organized in a single flat prefix. Most queries filter on a date range and read only four of the roughly sixty fields. Queries take many minutes and scan far more data than expected. Which TWO changes will most improve query performance? (Select TWO.)

### Options
- **A.** Partition the data in S3 by year, month and day, and register the partitions in the AWS Glue Data Catalog.
- **B.** Convert the data to a columnar format such as Apache Parquet with compression.
- **C.** Move the log data to the S3 Standard-IA storage class.
- **D.** Increase the number of concurrent Athena queries the workgroup allows.
- **E.** Enable S3 Transfer Acceleration on the bucket.

### Correct answers: A, B (choose 2)

**Summary:** Partitioning skips whole files and columnar Parquet skips unneeded columns -- both cut the bytes Athena scans.

### Explanation
- A is correct: partitioning by date lets Athena skip every file outside the requested range, so it scans far less data.
- B is correct: Parquet is columnar and compressed, so Athena reads only the four requested columns instead of all sixty fields of every record.
- C is wrong: Standard-IA only changes the storage price, adds a retrieval charge to every scan, and does nothing for query speed.
- D is wrong: more concurrent queries does not make any single query scan less data or finish sooner.
- E is wrong: Transfer Acceleration speeds uploads into the bucket and has no effect on queries.

**Key phrases:** uncompressed JSON · single flat prefix · filter on a date range · four of the roughly sixty fields · scan far more data than expected · TWO
**Hint:** Athena bills and waits on bytes scanned. One change lets it skip whole files; the other lets it skip the columns nobody asked for.

---

## ALPHA-040: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency

### Question
A research team runs a tightly coupled HPC simulation across 40 Amazon EC2 instances that exchange messages with MPI throughout every run. The job finishes only when all nodes finish, and the team needs the lowest possible node-to-node latency and the highest network throughput between the instances. Which combination should the solutions architect recommend?

### Options
- **A.** Launch the instances in a spread placement group across three Availability Zones and enable enhanced networking.
- **B.** Launch the instances across three Availability Zones behind a Network Load Balancer and enable cross-zone load balancing.
- **C.** Launch the instances in a cluster placement group within a single Availability Zone and attach an Elastic Fabric Adapter to each instance.
- **D.** Launch the instances in a partition placement group across two Availability Zones and attach additional elastic network interfaces.

### Correct answer: C

**Summary:** A cluster placement group plus EFA minimizes node-to-node latency for tightly coupled HPC/MPI workloads.

### Explanation
- A is wrong: spread placement groups deliberately separate instances onto distinct hardware, which raises latency.
- B is wrong: a load balancer spreads independent requests across servers and adds a hop; it does nothing for node-to-node MPI traffic, and spreading nodes across zones raises latency.
- C is correct: a cluster placement group packs instances onto closely connected hardware in one Availability Zone for the lowest latency and highest throughput, and an Elastic Fabric Adapter lets MPI traffic bypass the operating system kernel.
- D is wrong: partition placement groups isolate failures for distributed data stores, and extra network interfaces do not lower latency.

**Key phrases:** tightly coupled · exchange messages with MPI · lowest possible node-to-node latency · highest network throughput
**Hint:** Tightly coupled means the nodes should be physically near one another, and the network interface itself can bypass the operating system.

---

## ALPHA-041: Compute & Serverless
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
A company's steady baseline of compute runs on Amazon EC2, but over the next year it plans to move parts of that workload to AWS Fargate and AWS Lambda, and it expects to change EC2 instance families as it does. The finance team wants the largest possible commitment discount without locking the company into today's instance families or even today's services. Which purchase option should the solutions architect recommend?

### Options
- **A.** Purchase Standard Reserved Instances for the current instance families.
- **B.** Purchase EC2 Instance Savings Plans for the current instance families.
- **C.** Run the baseline on Spot Instances with a capacity-optimized allocation strategy.
- **D.** Purchase Compute Savings Plans for the baseline hourly spend.

### Correct answer: D

**Summary:** Compute Savings Plans apply across EC2 families/Regions, Fargate and Lambda -- the flexible commitment for a changing workload.

### Explanation
- A is wrong: Standard Reserved Instances are the least flexible and cannot cover Fargate or Lambda.
- B is wrong: EC2 Instance Savings Plans lock to an instance family in a Region and also exclude Fargate and Lambda.
- C is wrong: Spot is unsuitable for a steady baseline and offers no commitment discount.
- D is correct: Compute Savings Plans commit to an hourly spend and apply automatically across EC2 of any family or Region, Fargate and Lambda, which is exactly the flexibility described.

**Key phrases:** move parts of that workload to AWS Fargate and AWS Lambda · change EC2 instance families · largest possible commitment discount · without locking
**Hint:** Compare what each commitment is locked to: an instance family, a Region, or simply an hourly spend across several compute services.

---

## ALPHA-042: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** hard · **Pillars:** Cost Optimization, Operational Excellence, Sustainability

### Question
A company notices that the storage charges for an Amazon S3 bucket are far higher than the total size of the objects it can list in the console. The bucket receives large files through multipart uploads from an unreliable network link, and many uploads fail partway through. S3 Versioning has never been enabled on the bucket. Which TWO actions should the solutions architect take? (Select TWO.)

### Options
- **A.** Use Amazon S3 Storage Lens to report on incomplete multipart upload bytes across the bucket.
- **B.** Transition all objects to S3 Glacier Deep Archive immediately on upload.
- **C.** Enable S3 Versioning so that failed uploads become noncurrent versions that can be expired.
- **D.** Add a lifecycle rule that uses AbortIncompleteMultipartUpload to delete incomplete multipart uploads after 7 days.
- **E.** Add a lifecycle rule that expires noncurrent object versions after 30 days.

### Correct answers: A, D (choose 2)

**Summary:** Failed multipart upload parts are billed but invisible in listings; a lifecycle rule with AbortIncompleteMultipartUpload cleans them up automatically.

### Explanation
- A is correct: Storage Lens reports incomplete multipart upload bytes, so the team can confirm where the unexplained storage comes from and watch that it stays down.
- B is wrong: moving good data to Deep Archive leaves the orphaned parts in place and makes the real objects slow and costly to read.
- C is wrong: incomplete multipart uploads are not objects, so versioning does not capture them, and it would add storage for noncurrent versions.
- D is correct: the parts of failed multipart uploads stay in the bucket and are billed even though they are not listed as objects, and a lifecycle rule with AbortIncompleteMultipartUpload deletes them automatically after the set number of days.
- E is wrong: the bucket has never had versioning, so there are no noncurrent versions to expire.

**Key phrases:** higher than the total size of the objects it can list · multipart uploads · uploads fail partway through · Versioning has never been enabled · TWO
**Hint:** Failed multipart uploads leave something behind that billing counts but listing does not show. One action finds it, the other removes it on a schedule.

---

## ALPHA-043: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** medium · **Pillars:** Cost Optimization, Performance Efficiency

### Question
A company distributes large software installers and product images to customers worldwide directly from an Amazon S3 bucket over public HTTPS URLs. Data transfer out to the internet has become the single largest line item on the bill, and customers far from the bucket's Region report slow downloads. Which change reduces cost and improves download speed?

### Options
- **A.** Create an Amazon CloudFront distribution with the bucket as its origin and publish the CloudFront URLs to customers.
- **B.** Replicate the bucket to five Regions with S3 Cross-Region Replication and ask customers to choose the nearest bucket.
- **C.** Enable Requester Pays on the bucket so that customers are billed for their own downloads.
- **D.** Enable S3 Transfer Acceleration on the bucket and publish the accelerated endpoint to customers.

### Correct answer: A

**Summary:** CloudFront caches popular downloads at the edge, cutting both cost and latency versus serving repeat requests from S3 directly.

### Explanation
- A is correct: CloudFront caches the installers at edge locations so repeat downloads never reach S3, transfer from S3 to CloudFront is free, CloudFront's data transfer out costs less per GB than S3's, and edge delivery is faster.
- B is wrong: replicating to five Regions multiplies storage and replication costs and leaves customers to pick the right bucket themselves.
- C is wrong: Requester Pays only moves the charge to authenticated AWS requesters, so it does not work for anonymous public downloads and does nothing for speed.
- D is wrong: Transfer Acceleration is aimed at faster long-distance transfers to and from the bucket and adds a surcharge on top of normal transfer pricing.

**Key phrases:** directly from an Amazon S3 bucket · data transfer out to the internet · largest line item · customers far from the bucket's Region · slow downloads
**Hint:** Serving the same popular files repeatedly from the origin is the expensive part. What sits in front and serves repeat requests from closer to the user?

---

## ALPHA-044: Compute & Serverless
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** hard · **Pillars:** Cost Optimization, Sustainability

### Question
A company runs 600 Amazon EC2 instances of the current generation on Linux for a Java application that the team can rebuild from source. CloudWatch shows that most instances sit below 15 percent CPU utilization and well under half of their memory. Management wants the largest sustainable cost reduction. In which way should the solutions architect proceed?

### Options
- **A.** Purchase 3-year Standard Reserved Instances for the 600 instances immediately to lock in the deepest discount, then right-size afterwards.
- **B.** Move the fleet to Dedicated Hosts and consolidate the workloads onto fewer physical servers.
- **C.** Enable detailed CloudWatch monitoring and EC2 Auto Scaling on the existing instance sizes.
- **D.** Use AWS Compute Optimizer to right-size the fleet and rebuild the application for AWS Graviton instances, then purchase Savings Plans for the reduced steady-state usage.

### Correct answer: D

**Summary:** Right-size and modernize (e.g. Graviton) before committing to a Savings Plan, or you lock in the waste for years.

### Explanation
- A is wrong: a 3-year commitment on oversized instances locks the waste in for three years, which is the classic mistake of committing before right-sizing.
- B is wrong: Dedicated Hosts exist for licensing and compliance needs and cost more than shared tenancy.
- C is wrong: detailed monitoring and Auto Scaling change how many instances run, not how big they are, so the oversized instance types remain.
- D is correct: right-sizing with Compute Optimizer removes the waste first, Graviton gives better price performance for a Java application that can be rebuilt, and committing only after those two steps means the Savings Plan matches real usage.

**Key phrases:** below 15 percent CPU utilization · rebuild from source · largest sustainable cost reduction
**Hint:** Order of operations matters. Consider what happens to a multi-year commitment if you buy it before correcting the sizes.

---

## ALPHA-045: Databases & Caching
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** hard · **Pillars:** Cost Optimization, Operational Excellence, Sustainability

### Question
A company runs 40 Amazon RDS for PostgreSQL development and test databases. They are idle overnight and at weekends, but developers occasionally need them at unpredictable times, and each database must be reachable whenever someone connects. The company wants to pay as little as possible for the idle periods with minimal ongoing administration. Which solution should the solutions architect recommend?

### Options
- **A.** Migrate the databases to Amazon Aurora Serverless v2 and set a low minimum Aurora capacity unit value so capacity scales down when the databases are idle.
- **B.** Move each database to the smallest available instance class and enable storage autoscaling.
- **C.** Schedule an AWS Lambda function to stop the DB instances each evening and start them each morning.
- **D.** Purchase 1-year Reserved Instances for all 40 databases to reduce the hourly rate.

### Correct answer: A

**Summary:** Aurora Serverless v2 scales down to near-zero automatically, unlike a stopped RDS instance, which isn't reachable and auto-restarts after 7 days.

### Explanation
- A is correct: Aurora Serverless v2 scales capacity with demand down to a low minimum, or to zero with automatic pause, and back up when a connection arrives, so idle databases cost little while staying reachable with no scheduling to maintain.
- B is wrong: the smallest instance class still bills every hour whether used or not, and it may be too small when developers do use it.
- C is wrong: a stopped RDS instance starts again automatically after 7 days, and a stopped database is not reachable when a developer connects at an unpredictable time.
- D is wrong: Reserved Instances lower the hourly rate but commit to paying for all 40 databases around the clock for a year, idle hours included.

**Key phrases:** development and test databases · idle overnight and at weekends · unpredictable times · reachable whenever someone connects · pay as little as possible · minimal ongoing administration
**Hint:** Stopping an RDS instance is not permanent. Look for the option whose capacity itself scales down toward zero while the endpoint stays available.

---

## ALPHA-046: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Sustainability

### Question
A cost review of an AWS account finds several thousand gp2 Amazon EBS volumes attached to running instances, roughly 300 unattached volumes left behind by terminated instances, and years of manually created EBS snapshots that nobody removes. The workloads' current IOPS needs are well within what gp3 provides. Which TWO actions should the solutions architect take? (Select TWO.)

### Options
- **A.** Copy all existing snapshots to a second Region for durability.
- **B.** Convert the gp2 volumes to io2 volumes to gain a better price for the same performance.
- **C.** Modify the gp2 volumes to gp3, which costs less per GB and provisions IOPS independently of volume size.
- **D.** Increase the size of each gp2 volume so that it earns a higher baseline IOPS rate.
- **E.** Use Amazon Data Lifecycle Manager to create and expire snapshots on a retention schedule, and delete the unattached volumes after snapshotting them.

### Correct answers: C, E (choose 2)

**Summary:** gp3 is cheaper than gp2 and decouples IOPS from size; Data Lifecycle Manager auto-expires snapshots so they stop piling up.

### Explanation
- A is wrong: copying every snapshot to a second Region doubles snapshot storage and adds transfer charges, the opposite of the goal.
- B is wrong: io2 is a premium volume type that costs more than gp3 for the same performance these workloads need.
- C is correct: gp3 costs about 20% less per GB than gp2 and provisions IOPS independently of size, and gp2 volumes can be modified to gp3 in place without detaching them.
- D is wrong: oversizing volumes to buy IOPS is the gp2 workaround that gp3 exists to replace, and it increases cost.
- E is correct: Data Lifecycle Manager creates and expires snapshots on a retention schedule so they stop accumulating, and the unattached volumes can be snapshotted once and deleted so the company stops paying for storage nobody uses.

**Key phrases:** gp2 · unattached volumes · years of manually created EBS snapshots · within what gp3 provides · TWO
**Hint:** One action lowers the per-GB rate of storage that is genuinely in use; the other stops paying indefinitely for copies nobody deletes.

---

## ALPHA-047: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization, Operational Excellence

### Question
A company gives each development team its own sandbox account in AWS Organizations. Several teams have left large instances and GPU clusters running over weekends. Finance wants an alert when a sandbox account's forecast monthly spend passes $2,000, and wants further provisioning stopped automatically once actual spend reaches $2,500, without writing custom code. What should a solutions architect do?

### Options
- **A.** Create an AWS Budgets cost budget for each sandbox account with an alert on forecasted spend at $2,000, and a budget action at $2,500 that applies a restrictive service control policy to the account and notifies the team.
- **B.** Review AWS Cost Explorer every Monday and ask teams to delete resources in accounts that went over the limit.
- **C.** Enable AWS Cost Anomaly Detection for each sandbox account and have it terminate resources when it finds an anomaly.
- **D.** Lower the EC2 vCPU service quotas in each sandbox account.

### Correct answer: A

**Summary:** AWS Budgets can trigger an automated action (policy or stop) the moment spend crosses a threshold, with no custom code.

### Explanation
- A is correct: AWS Budgets alerts on both actual and forecasted spend, and a budget action can automatically apply an IAM policy or a service control policy, or stop specific EC2 and RDS instances, when a threshold is crossed, with no code to write.
- B is wrong: a weekly manual review reacts days after the money is spent and depends on people following up.
- C is wrong: Cost Anomaly Detection alerts on unusual spending patterns, but it does not act on resources and does not enforce a fixed dollar limit.
- D is wrong: quotas cap capacity rather than spend, so they block legitimate experiments while smaller resources can still run up cost indefinitely.

**Key phrases:** forecast monthly spend passes $2,000 · stopped automatically once actual spend reaches $2,500 · without writing custom code
**Hint:** One service both forecasts spend against a dollar limit and can act on its own when the limit is crossed.

---

## ALPHA-048: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization, Operational Excellence

### Question
A company runs workloads for eight business units in a shared set of AWS accounts. Finance must report each business unit's monthly AWS cost and wants the underlying data in a form it can query with SQL and load into its own reporting tools. Resources are already tagged with a BusinessUnit tag, but the tag does not appear anywhere in the billing data. What should a solutions architect do?

### Options
- **A.** Create an AWS Budgets budget for each business unit without activating any tags.
- **B.** Move each business unit's resources into its own VPC so that costs are reported per VPC.
- **C.** Rely on AWS Cost Explorer, which groups costs by every resource tag as soon as the tag is applied.
- **D.** Activate BusinessUnit as a user-defined cost allocation tag in the management account, and deliver the AWS Cost and Usage Report through Data Exports to Amazon S3 for querying with Amazon Athena.

### Correct answer: D

**Summary:** Activated cost allocation tags plus the Cost and Usage Report in S3 give queryable, per-business-unit billing data via Athena.

### Explanation
- A is wrong: budgets track spend against thresholds, and without an activated tag they have nothing to split business-unit costs by.
- B is wrong: AWS billing does not break costs down by VPC, and moving resources between VPCs would be disruptive while still missing shared services.
- C is wrong: Cost Explorer can group by a tag only after it has been activated as a cost allocation tag, and it is a console tool rather than a data feed that finance can query with SQL.
- D is correct: resource tags appear in billing data only after they are activated as cost allocation tags, and the Cost and Usage Report, delivered through Data Exports, writes detailed line items with those tag columns to S3, where Athena can query them with SQL.

**Key phrases:** each business unit's monthly AWS cost · query with SQL · does not appear anywhere in the billing data
**Hint:** Tags live on resources, but billing data ignores them until one switch is flipped in the management account.

---

## ALPHA-049: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** hard · **Pillars:** Cost Optimization, Sustainability

### Question
A company stores 900 TB in an Amazon S3 bucket. Access patterns are unknown and shift from month to month, and the company cannot accept retrieval delays for data that turns out to be active. An earlier S3 Lifecycle rule that moved every object to S3 Standard-IA after 30 days increased the bill instead of reducing it, because a large share of the objects are smaller than 128 KB. Which combination of actions reduces storage cost while keeping millisecond access? (Select TWO.)

### Options
- **A.** Add an S3 Lifecycle rule that transitions all objects to S3 Glacier Flexible Retrieval after 60 days.
- **B.** Move the data to S3 One Zone-IA to halve the per-GB storage rate.
- **C.** Activate the S3 Intelligent-Tiering Deep Archive Access tier for all objects so the coldest data moves automatically.
- **D.** Use Amazon S3 Storage Lens to identify the prefixes dominated by objects smaller than 128 KB, and aggregate those objects before upload.
- **E.** Store the objects in the S3 Intelligent-Tiering storage class and leave the automatic Frequent Access and Infrequent Access tiers enabled.

### Correct answers: D, E (choose 2)

**Summary:** Intelligent-Tiering handles unpredictable access with no retrieval fee, but its 128 KB minimum means very small objects need separate handling.

### Explanation
- A is wrong: Glacier Flexible Retrieval restores take minutes to hours, which breaks the millisecond requirement.
- B is wrong: One Zone-IA keeps only one Availability Zone's copy, reducing durability against zone loss, and it carries the same per-object minimum that caused the problem.
- C is wrong: the Deep Archive Access tier is opt-in precisely because retrieval can take up to 12 hours.
- D is correct: Standard-IA bills a 128 KB minimum per object and Intelligent-Tiering never moves objects below 128 KB out of the Frequent Access tier, so the small objects are why the earlier rule backfired, and Storage Lens shows where they are concentrated so aggregation is aimed where it pays.
- E is correct: Intelligent-Tiering moves each object between the Frequent Access and Infrequent Access tiers based on observed access, both of which serve millisecond retrievals, and it charges no retrieval fee when an object turns out to be active again, which is exactly the unknown-pattern case.

**Key phrases:** access patterns are unknown · smaller than 128 KB · millisecond access · Select TWO
**Hint:** Two facts collide here: a 128 KB per-object minimum, and a hard requirement for millisecond reads.

---

## ALPHA-050: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** easy · **Pillars:** Performance Efficiency

### Question
A mobile app lets users around the world upload videos of up to 2 GB directly to an Amazon S3 bucket in us-east-1. Users in Asia and South America report slow, frequently interrupted uploads, while users in the United States do not. The company wants faster uploads with minimal changes to the app. Which solution meets these requirements?

### Options
- **A.** Create an Amazon CloudFront distribution with the bucket as its origin so that uploaded videos are cached at edge locations.
- **B.** Enable S3 Transfer Acceleration on the bucket, have the app upload to the accelerate endpoint, and use multipart upload for large files.
- **C.** Move the data to an S3 Express One Zone directory bucket in us-east-1.
- **D.** Route uploads through a fleet of EC2 instances behind an Application Load Balancer in us-east-1 that writes to S3.

### Correct answer: B

**Summary:** S3 Transfer Acceleration routes uploads through the nearest edge location, fixing slow long-distance uploads with just an endpoint change.

### Explanation
- A is wrong: CloudFront caching speeds up repeated downloads of popular objects, not one-time uploads of new files.
- B is correct: Transfer Acceleration receives each upload at the nearest edge location and carries it to the bucket over the AWS global network, which speeds long-distance transfers, and multipart upload lets an interrupted part be retried instead of restarting a 2 GB file, while the app only changes its endpoint.
- C is wrong: S3 Express One Zone is designed for very low-latency access from compute in the same Availability Zone, not for faster uploads from distant users.
- D is wrong: a proxy fleet in us-east-1 still leaves the long-distance hop on the public internet and adds servers to run and scale.

**Key phrases:** around the world upload · up to 2 GB · slow, frequently interrupted uploads · minimal changes to the app
**Hint:** Distance to us-east-1 is the problem. Which S3 feature lets a user hand the upload to AWS's network close to where they are?

---

## ALPHA-051: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A genomics company runs short-lived batch analyses on hundreds of Amazon EC2 instances. Each run reads a 200 TB reference dataset stored in Amazon S3 and needs a shared POSIX file system with sub-millisecond latency and hundreds of GB/s of aggregate throughput. Results must end up back in S3, and the file system is not needed between runs. Which storage solution BEST meets these requirements?

### Options
- **A.** Create an Amazon EFS file system with Elastic throughput and copy the 200 TB dataset into it before each run.
- **B.** Mount the S3 bucket on every instance with Mountpoint for Amazon S3 and write results directly to the bucket.
- **C.** Attach a single io2 Block Express volume with Multi-Attach to all of the instances.
- **D.** Create an Amazon FSx for Lustre scratch file system linked to the S3 bucket, run the analysis against it, export the results to S3, and delete the file system after each run.

### Correct answer: D

**Summary:** FSx for Lustre is a parallel, S3-linked, HPC-grade file system; use scratch for cheap, disposable processing storage.

### Explanation
- A is wrong: EFS is built for general shared file workloads and cannot reach hundreds of GB/s, and copying 200 TB into it before every run is slow and expensive.
- B is wrong: Mountpoint for Amazon S3 gives high-throughput access to objects but is not a full POSIX file system and does not provide sub-millisecond latency.
- C is wrong: Multi-Attach supports at most 16 instances in one Availability Zone and needs a cluster-aware file system, so it cannot serve hundreds of instances.
- D is correct: FSx for Lustre is a parallel file system built for HPC that delivers sub-millisecond latency and hundreds of GB/s of throughput, an S3 link loads the dataset and exports results back, and a scratch file system is the low-cost choice for temporary processing that can be deleted after each run.

**Key phrases:** shared POSIX file system · sub-millisecond latency · hundreds of GB/s · not needed between runs
**Hint:** An HPC-grade parallel file system that can sit in front of S3 and be thrown away after the run.

---

## ALPHA-052: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security

### Question
A company with 120 accounts in AWS Organizations wants continuous detection of threats such as EC2 instances communicating with known malicious IP addresses, cryptocurrency mining, and unusual API calls made with stolen credentials. Findings from every account, including accounts created in the future, must be visible in one security account. The company does not want to deploy agents or analyze logs itself. What should a solutions architect do?

### Options
- **A.** Create an organization trail in AWS CloudTrail and have analysts query it with Amazon Athena every day for suspicious patterns.
- **B.** Enable Amazon Inspector in every account and aggregate its findings in the security account.
- **C.** Enable Amazon Macie in every account with the security account as its delegated administrator.
- **D.** Enable Amazon GuardDuty, designate the security account as the GuardDuty delegated administrator for the organization, and turn on auto-enable so that every existing and new member account is covered.

### Correct answer: D

**Summary:** GuardDuty is agentless threat detection across an organization, correlating CloudTrail, VPC Flow Logs and DNS logs automatically.

### Explanation
- A is wrong: this is the do-it-yourself log analysis the company wants to avoid, and a daily query finds threats up to a day late.
- B is wrong: Inspector scans EC2 instances, container images and Lambda functions for software vulnerabilities and network exposure, not for active threats such as malicious traffic or stolen credentials.
- C is wrong: Macie discovers sensitive data in S3 buckets and does not detect compromised instances or credential misuse.
- D is correct: GuardDuty analyzes CloudTrail events, VPC Flow Logs and DNS logs without agents, using threat intelligence and machine learning to find compromised instances, cryptomining and credential misuse, and a delegated administrator with auto-enable brings findings from every current and future account into one place.

**Key phrases:** continuous detection of threats · including accounts created in the future · does not want to deploy agents or analyze logs itself
**Hint:** Managed threat detection from logs AWS already collects, rolled up to one account for the whole organization.

---

## ALPHA-053: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** easy · **Pillars:** Security

### Question
An auditor requires that API activity from every account in a company's organization be captured in a single, tamper-evident location that account administrators cannot alter or delete for seven years. What should a solutions architect implement?

### Options
- **A.** Forward CloudWatch Logs from each account into a central log group with a seven-year retention setting.
- **B.** Create an AWS CloudTrail organization trail that delivers to a central S3 bucket in a dedicated log archive account, enable log file validation, and apply S3 Object Lock in compliance mode with a seven-year retention period.
- **C.** Enable a separate CloudTrail trail in each account that delivers to a bucket in that same account, and turn on S3 Versioning for each bucket.
- **D.** Enable AWS Config in every account and deliver configuration snapshots to a central S3 bucket.

### Correct answer: B

**Summary:** An organization trail plus log file validation plus Object Lock in compliance mode makes an audit trail tamper-evident, even to root.

### Explanation
- A is wrong: nothing here makes the central log group tamper-evident, and it does not guarantee organization-wide capture.
- B is correct: an organization trail is created once in the management account and captures every current and future member account, delivery into a dedicated log archive account puts the logs outside the control of the accounts being audited, log file validation produces signed digest files that prove nothing was altered, and Object Lock in compliance mode blocks deletion by anyone, including the root user, until retention expires.
- C is wrong: logs kept in the audited account remain under that administrator's control, and versioning alone does not prevent deletion.
- D is wrong: AWS Config records resource configuration state, not the API activity the auditor asked for.

**Key phrases:** every account · tamper-evident · cannot alter or delete · seven years
**Hint:** Three separate requirements: every account, provably unaltered, and undeletable for a fixed term.

---

## ALPHA-054: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security, Operational Excellence

### Question
A security team wants any Amazon S3 bucket in a production account that becomes publicly accessible to be detected and corrected automatically within minutes, and it wants a durable record of every such occurrence for later review. Which combination of actions meets these requirements? (Select TWO.)

### Options
- **A.** Create an Amazon EventBridge rule that matches AWS Config compliance change events for the rule and sends them to an Amazon SNS topic the security team subscribes to.
- **B.** Enable Amazon Macie on the account to classify the contents of every bucket.
- **C.** Enable the AWS Config managed rule s3-bucket-public-read-prohibited and attach an automatic remediation action that runs an AWS Systems Manager Automation runbook to reapply the block public access settings.
- **D.** Enable S3 Block Public Access at the account level and rely on AWS CloudTrail to record the change.
- **E.** Schedule an AWS Lambda function to list every bucket once each day and report the public ones.

### Correct answers: A, C (choose 2)

**Summary:** AWS Config can auto-remediate drift via an SSM Automation runbook, and its compliance events flow to EventBridge for notification.

### Explanation
- A is correct: AWS Config publishes compliance change events to EventBridge, so a rule matching them delivers the notification and leaves a record of each occurrence.
- B is wrong: Macie discovers sensitive data inside objects, which is a different question from whether the bucket is public.
- C is correct: the managed Config rule re-evaluates a bucket whenever its configuration changes, and an attached remediation action runs a Systems Manager Automation runbook that restores the block public access settings, which is the automatic correction the team asked for.
- D is wrong: Block Public Access is sound hardening, but on its own it neither corrects a bucket automatically nor produces a record of each occurrence for review, and anyone with sufficient permissions can switch it off.
- E is wrong: a once-daily sweep cannot meet a within-minutes requirement.

**Key phrases:** becomes publicly accessible · corrected automatically within minutes · durable record of every such occurrence · Select TWO
**Hint:** Detect on change, fix without a human, and leave a trail. That is more than one service.

---

## ALPHA-055: Monitoring, Management & Governance
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence

### Question
An application runs on Amazon EC2 instances in an Auto Scaling group. The application leaks memory slowly, and instances become unresponsive after several days even though CPU utilization stays low. The operations team wants the Auto Scaling group to replace an instance automatically once its memory utilization crosses 85%, with no change to the application code. What should a solutions architect do?

### Options
- **A.** Enable EC2 detailed monitoring at a one-minute period, which adds memory metrics, and configure a target tracking policy on memory utilization.
- **B.** Create a CloudWatch alarm on the default EC2 MemoryUtilization metric and attach an EC2 Auto Scaling simple scaling policy to it.
- **C.** Set the Auto Scaling group health check type to ELB with a 60-second grace period.
- **D.** Install the CloudWatch agent on the instances to publish a memory utilization metric, create a CloudWatch alarm on that metric, and use an Amazon EventBridge rule on the alarm's state change to invoke an AWS Lambda function that sets the instance's health to Unhealthy so that the Auto Scaling group replaces it.

### Correct answer: D

**Summary:** CloudWatch can't see guest-OS memory on its own -- the CloudWatch agent must publish it, and only a custom action can force an unhealthy instance's replacement.

### Explanation
- A is wrong: detailed monitoring only publishes the existing hypervisor-level metrics more often and adds no memory metric.
- B is wrong: there is no default EC2 MemoryUtilization metric, and a scaling policy adds or removes capacity rather than replacing the leaking instance.
- C is wrong: an ELB health check reacts only once the instance has already stopped serving requests, which is the outage the team wants to prevent, and it never looks at memory.
- D is correct: memory utilization is a guest operating system metric that the hypervisor cannot see, so the CloudWatch agent must publish it, and because an alarm cannot change an instance's health by itself, the EventBridge rule invokes a Lambda function that calls SetInstanceHealth, after which the Auto Scaling group terminates and replaces the instance.

**Key phrases:** leaks memory slowly · CPU utilization stays low · memory utilization crosses 85% · no change to the application code
**Hint:** Which metrics can the hypervisor see, and which ones need an agent running inside the instance?

---

## ALPHA-056: Monitoring, Management & Governance
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Operational Excellence

### Question
A company's application writes its logs to Amazon CloudWatch Logs. Operations wants to be paged automatically whenever the string OutOfMemoryError appears more than five times in five minutes. What is the simplest way to meet this requirement?

### Options
- **A.** Enable CloudWatch Container Insights on the log group and create an anomaly detection alarm.
- **B.** Create a CloudWatch Logs subscription filter that streams every log event to Amazon Kinesis Data Streams and have an AWS Lambda consumer count the occurrences.
- **C.** Create a CloudWatch Logs metric filter that matches the pattern, then create a CloudWatch alarm on the resulting metric that notifies an Amazon SNS topic when the sum exceeds five over a five-minute period.
- **D.** Export the log group to Amazon S3 every five minutes and run a scheduled Amazon Athena query against it.

### Correct answer: C

**Summary:** A CloudWatch Logs metric filter turns a log pattern into an alarm-able metric, with no custom log-processing code needed.

### Explanation
- A is wrong: Container Insights collects infrastructure metrics for container workloads and does not match strings in log text.
- B is wrong: it would work, but it adds a stream and a function to run and pay for, to do what a metric filter already does natively.
- C is correct: a metric filter turns a matching log pattern into a CloudWatch metric as events arrive, and an ordinary alarm on that metric with a five-minute period and a threshold of five sends the notification, with no code to write or operate.
- D is wrong: log export to S3 is a batch job and exported data can take up to 12 hours to become available, so it cannot drive timely paging.

**Key phrases:** writes its logs to Amazon CloudWatch Logs · paged automatically · more than five times in five minutes · simplest
**Hint:** Turning a matching log pattern into a metric is a built-in CloudWatch Logs feature.

---

## ALPHA-057: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence

### Question
An application produces about 5,000 log events per second. The operations team wants the events searchable in an Amazon OpenSearch Service domain within about a minute of being produced, with a copy of every raw event kept in Amazon S3. The team does not want to write, run or scale any consumer code. Which solution meets these requirements?

### Options
- **A.** Send the events to Amazon Kinesis Data Streams and run a consumer application on EC2 instances that indexes them into OpenSearch and writes them to S3.
- **B.** Send the events to an Amazon Data Firehose stream with the OpenSearch Service domain as its destination and S3 backup enabled for all records.
- **C.** Send the events to an Amazon SQS queue and have an AWS Lambda function index each message into OpenSearch.
- **D.** Write the events to Amazon S3 and run an hourly AWS Glue job that loads new objects into OpenSearch.

### Correct answer: B

**Summary:** Kinesis Data Firehose is the fully managed, near-real-time, no-code path from a stream into OpenSearch with an S3 backup copy.

### Explanation
- A is wrong: a consumer application on EC2 is exactly the code the team does not want to write, run or scale.
- B is correct: Firehose is a fully managed delivery service that buffers incoming records for a configurable number of seconds, delivers them to OpenSearch Service, backs up every source record to S3, and scales automatically with no consumer code.
- C is wrong: the Lambda function is consumer code to write and maintain, and it provides no raw copy in S3.
- D is wrong: an hourly batch job leaves events unsearchable for up to an hour.

**Key phrases:** 5,000 log events per second · within about a minute · copy of every raw event · does not want to write, run or scale any consumer code
**Hint:** Managed delivery into OpenSearch with a built-in S3 copy, and no consumers to run.

---

## ALPHA-058: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** hard · **Pillars:** Performance Efficiency

### Question
An online store runs on Amazon RDS for MySQL. Product pages issue the same catalog queries thousands of times per minute and can tolerate data that is a few seconds stale, while heavy nightly and ad hoc reporting queries also run against the primary instance. CPU on the primary is saturated and page latency is rising. The company wants to improve read performance without moving to a different database engine. Which combination of actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Create one or more RDS read replicas and point the reporting queries at them.
- **B.** Add an Amazon ElastiCache cluster and have the application cache the results of the repeated catalog queries with a short time to live (TTL).
- **C.** Enable RDS Performance Insights on the primary instance.
- **D.** Convert the instance to a Multi-AZ DB instance deployment and send the reporting queries to the standby.
- **E.** Change the database storage from gp3 to io2 Block Express.

### Correct answers: A, B (choose 2)

**Summary:** Cache hot, slightly-stale reads in ElastiCache and offload heavier reporting queries to a read replica -- different tools for different access patterns.

### Explanation
- A is correct: read replicas take the reporting queries off the primary, and their asynchronous replication lag of a few seconds is acceptable for reports.
- B is correct: the catalog queries repeat constantly and tolerate a few seconds of staleness, so caching their results in ElastiCache with a short TTL serves them from memory and removes most of that load from the database.
- C is wrong: Performance Insights shows which queries consume resources, but on its own it does not reduce the load.
- D is wrong: the standby in a Multi-AZ DB instance deployment cannot serve reads; it exists only for failover.
- E is wrong: the bottleneck is CPU spent on repeated queries, not storage I/O, so faster storage does not relieve it.

**Key phrases:** same catalog queries thousands of times per minute · a few seconds stale · heavy nightly and ad hoc reporting queries · without moving to a different database engine · Select TWO
**Hint:** Two different read workloads: one repeated and tolerant of staleness, one heavy and separable. Each has its own way off the primary.

---

## ALPHA-059: Analytics & Data Processing
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence

### Question
A company ingests payment events into Amazon S3 for analytics using Amazon Data Firehose with a transformation step. Last week a bug in the transformation corrupted six hours of delivered records, and the team discovered it could not reprocess the original events because they no longer existed anywhere. The team wants to be able to replay at least the last three days of raw events after a future bug. What should a solutions architect recommend?

### Options
- **A.** Enable Firehose error record delivery to a separate S3 prefix.
- **B.** Enable S3 Versioning on the destination bucket so previous versions of the delivered objects can be restored.
- **C.** Publish events to an Amazon Kinesis data stream with a 72-hour retention period and have Firehose consume from that stream to deliver to S3.
- **D.** Increase the Firehose buffer interval to its maximum so records are held longer before delivery.

### Correct answer: C

**Summary:** A Kinesis stream retains raw records so a fixed consumer can replay a past window, even after a downstream delivery bug.

### Explanation
- A is wrong: error record delivery captures records whose transformation failed, not records that were transformed incorrectly and reported success.
- B is wrong: versioning preserves the corrupted objects that were written, not the raw events that the transformation consumed.
- C is correct: a Kinesis data stream durably retains records for a configurable window, 24 hours by default and up to 365 days, so the raw events remain readable after delivery and a new consumer can replay the affected window once the bug is fixed, while Firehose still handles delivery to S3.
- D is wrong: the buffer is a batching window measured in minutes and retains nothing once the batch is delivered.

**Key phrases:** could not reprocess the original events · replay at least the last three days · raw events
**Hint:** Firehose delivers and forgets. Which ingestion service keeps the raw record readable after delivery?

---

## ALPHA-060: Analytics & Data Processing
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability

### Question
A company runs a single-node Amazon OpenSearch Service domain that powers the search bar on its storefront. During a recent Availability Zone impairment the search bar was unavailable for two hours, and during a later indexing spike the cluster became unstable and stopped answering queries. Which configuration change best addresses both problems?

### Options
- **A.** Put an Application Load Balancer with health checks in front of the domain across two Availability Zones.
- **B.** Create a second single-node domain in another Availability Zone and switch the application endpoint manually when the first one fails.
- **C.** Redeploy the domain as a Multi-AZ with Standby configuration across three Availability Zones, with three dedicated master nodes and two replicas of every shard.
- **D.** Increase the instance size of the single data node and enable Auto-Tune.

### Correct answer: C

**Summary:** OpenSearch Multi-AZ with Standby keeps a full replica in each zone and isolates cluster management on dedicated master nodes.

### Explanation
- A is wrong: a load balancer cannot spread traffic across nodes that do not exist, and OpenSearch Service already fronts the domain with a managed endpoint.
- B is wrong: a manual endpoint switch means another multi-hour outage, and the second domain holds none of the data.
- C is correct: Multi-AZ with Standby keeps a full copy of the data in each of three Availability Zones, which is why it requires two replicas of every shard, so the domain keeps serving when one zone is impaired, and its dedicated master nodes handle cluster management apart from indexing and query traffic, which keeps the cluster stable during indexing spikes.
- D is wrong: a larger single node is still one node in one Availability Zone, so the same outage recurs.

**Key phrases:** single-node · Availability Zone impairment · indexing spike · cluster became unstable
**Hint:** Two failures here: losing a zone, and the cluster's management work competing with its data work.

---

## ALPHA-061: Analytics & Data Processing
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security

### Question
A company keeps a data lake in Amazon S3 catalogued in the AWS Glue Data Catalog, and analysts query it with Amazon Athena. A new requirement states that the marketing team may read only the non-sensitive columns of the customer table, while the finance team may read all columns but only rows where the region is EMEA. The company does not want to duplicate the data into filtered copies. What should a solutions architect do?

### Options
- **A.** Create a separate Amazon Athena workgroup for each team and set a distinct query result location per workgroup.
- **B.** Write S3 bucket policies that allow each team's role access only to the objects holding the rows and columns it may read.
- **C.** Create two AWS Glue jobs that write a column-filtered copy and a row-filtered copy to separate S3 prefixes, and grant each team access to its own prefix.
- **D.** Register the data lake location with AWS Lake Formation, then grant column-level permissions to the marketing team's role and a row-level data filter on region to the finance team's role.

### Correct answer: D

**Summary:** Lake Formation enforces column- and row-level permissions on the catalog itself, so Athena serves different views from one copy of the data.

### Explanation
- A is wrong: workgroups control query settings, cost limits and result locations, not which data a principal is allowed to see.
- B is wrong: S3 policies grant access to objects and prefixes and cannot express which rows or columns inside a file a principal may read.
- C is wrong: it produces exactly the duplicated filtered copies the company ruled out, and both copies then have to be kept in sync.
- D is correct: Lake Formation applies column-level permissions and row-level data filters to the catalogued table itself, and Athena enforces them at query time against the calling role, so one copy of the data serves both teams with different views.

**Key phrases:** non-sensitive columns · only rows where the region is EMEA · does not want to duplicate the data
**Hint:** Column-level and row-level rules on a catalogued table, enforced at query time, over one copy of the data.

---

## ALPHA-062: Disaster Recovery & Migration
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Reliability

### Question
A company uses AWS Backup to protect Amazon EBS volumes, Amazon RDS databases and Amazon DynamoDB tables in its production account. After a ransomware incident at a peer company, the security team requires that backups cannot be deleted or have their retention shortened by anyone, including administrators of the production account, for 35 days. A usable copy must also survive even if the production account is fully compromised. Which solution meets these requirements?

### Options
- **A.** Create a backup vault in a separate, dedicated backup account in the same organization, enable AWS Backup Vault Lock in compliance mode on it, and add a copy rule to the backup plan that copies every recovery point to that vault.
- **B.** Enable S3 Object Lock on the production account's backup vault with a 35-day retention period.
- **C.** Enable AWS Backup Vault Lock in governance mode on the production account's backup vault.
- **D.** Attach an IAM policy in the production account that denies backup:DeleteRecoveryPoint to every user and role.

### Correct answer: A

**Summary:** AWS Backup Vault Lock in compliance mode is immutable even to root, and a separate backup account keeps a copy safe from compromised production.

### Explanation
- A is correct: Vault Lock in compliance mode makes recovery points immutable for their retention period, and once its grace time ends nobody, including the root user and AWS, can remove the lock, while copying to a vault in a separate backup account keeps a recoverable copy outside the blast radius of a compromised production account.
- B is wrong: a backup vault is not an S3 bucket that you configure, so S3 Object Lock does not apply to it, and the backups would still live only in the account being protected against.
- C is wrong: governance mode can be removed by principals with sufficient IAM permissions, and keeping the only copy in the production account leaves it inside the blast radius the requirement rules out.
- D is wrong: anyone with administrator rights in the production account can edit or detach that policy, and IAM policies never restrict the root user.

**Key phrases:** cannot be deleted or have their retention shortened · including administrators · 35 days · production account is fully compromised
**Hint:** Two requirements: immutable even against administrators, and stored outside the account that might be compromised.

---

## ALPHA-063: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** hard · **Pillars:** Reliability, Operational Excellence

### Question
An order-processing fleet of Amazon EC2 instances polls an Amazon SQS standard queue. Processing a message takes up to 4 minutes, and the queue uses the default 30-second visibility timeout. The team finds many orders processed two or three times. Separately, a few malformed messages fail on every attempt, are retried indefinitely, and flood the logs with errors. Which combination of changes resolves both problems? (Select TWO.)

### Options
- **A.** Increase the queue's message retention period to 14 days.
- **B.** Increase the queue's visibility timeout to longer than the maximum processing time, for example 5 minutes.
- **C.** Configure a dead-letter queue with a redrive policy that moves a message there after a maxReceiveCount of 3.
- **D.** Replace the queue with an SQS FIFO queue so that each message is processed exactly once.
- **E.** Enable long polling by setting the receive message wait time to 20 seconds.

### Correct answers: B, C (choose 2)

**Summary:** Set the visibility timeout above worst-case processing time, and use a redrive policy to quarantine messages that keep failing.

### Explanation
- A is wrong: a longer retention period keeps the malformed messages cycling for longer instead of removing them.
- B is correct: while a worker is still processing, the 30-second visibility timeout expires and the message becomes visible to another worker, which causes the repeat processing, so a timeout longer than the 4-minute worst case keeps it hidden until the first worker deletes it.
- C is correct: a redrive policy moves a message to the dead-letter queue once it has been received the configured number of times, so malformed messages stop cycling and are kept aside for inspection.
- D is wrong: FIFO deduplication stops duplicate sends, but a message whose visibility timeout expires mid-processing is still delivered again, and in a FIFO queue a repeatedly failing message also holds up every message behind it in its message group.
- E is wrong: long polling reduces empty responses and request cost but has no effect on how long a received message stays hidden.

**Key phrases:** takes up to 4 minutes · default 30-second visibility timeout · processed two or three times · retried indefinitely · Select TWO
**Hint:** One problem is about how long a received message stays hidden; the other is about what happens to a message that has failed too many times.

---

## ALPHA-064: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Security

### Question
A financial data provider runs a TCP-based market data service on Amazon EC2 instances in three Availability Zones in one Region. Clients' firewalls only allow outbound connections to a fixed list of IP addresses, the service must handle millions of long-lived connections with very low latency, and client source IP addresses must be preserved for auditing. Which load balancing solution meets these requirements?

### Options
- **A.** An Application Load Balancer, with clients allowlisting the IP addresses that its DNS name currently resolves to.
- **B.** A Network Load Balancer with an Elastic IP address assigned in each Availability Zone and client IP preservation enabled on its target group.
- **C.** A Gateway Load Balancer in front of the instances.
- **D.** A Classic Load Balancer with sticky sessions enabled.

### Correct answer: B

**Summary:** A Network Load Balancer gives static per-AZ IPs, preserves client source IP, and handles massive throughput at layer 4.

### Explanation
- A is wrong: an Application Load Balancer's IP addresses change over time and cannot be fixed, and it terminates connections at layer 7, adding latency for a raw TCP protocol.
- B is correct: a Network Load Balancer works at layer 4, handles millions of requests per second at very low latency, accepts one static Elastic IP address per Availability Zone that clients can allowlist, and can preserve the client source IP address for the targets.
- C is wrong: a Gateway Load Balancer inserts virtual appliances such as third-party firewalls into the traffic path; it is not used to front an application.
- D is wrong: a Classic Load Balancer is a previous-generation service without static IP addresses, and sticky sessions address none of the requirements.

**Key phrases:** TCP-based · fixed list of IP addresses · millions of long-lived connections · client source IP addresses must be preserved
**Hint:** Layer 4, a static address per Availability Zone, and the client's IP address passed straight through.

---

## ALPHA-065: Databases & Caching
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** easy · **Pillars:** Cost Optimization, Performance Efficiency, Sustainability

### Question
A new mobile game stores player data in an Amazon DynamoDB table that uses provisioned capacity mode, sized for the peak. Traffic is unpredictable: the table is nearly idle most of the day, then receives short bursts of several thousand requests per second whenever a promotion goes out, at times the company cannot schedule in advance. Which change will MOST reduce cost without throttling during the bursts?

### Options
- **A.** Switch the table to on-demand capacity mode.
- **B.** Add a DynamoDB Accelerator (DAX) cluster in front of the table.
- **C.** Keep provisioned mode, lower the base capacity, and enable DynamoDB auto scaling.
- **D.** Keep provisioned mode and purchase DynamoDB reserved capacity for the peak throughput.

### Correct answer: A

**Summary:** DynamoDB on-demand mode bills per request and absorbs unpredictable bursts without pre-provisioning for the peak.

### Explanation
- A is correct: on-demand mode bills per request and adapts instantly to traffic up to double its previous peak, so the company stops paying for idle provisioned capacity without having to predict the bursts.
- B is wrong: DAX adds a cluster to pay for and only caches reads, so it neither covers the writes nor removes the cost of idle provisioned capacity.
- C is wrong: auto scaling adjusts provisioned capacity over several minutes in response to CloudWatch alarms, so short, unscheduled bursts are throttled before capacity catches up.
- D is wrong: reserved capacity commits to paying for the peak throughput around the clock, which locks in the waste instead of removing it.

**Key phrases:** provisioned capacity mode, sized for the peak · nearly idle most of the day · cannot schedule in advance · MOST reduce cost without throttling
**Hint:** Idle most of the time, bursty at moments nobody can predict. Which billing model charges only for the requests actually made?

---

## ALPHA-066: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security

### Question
A company is launching a mobile app and a single-page web app for consumers. Users must be able to sign up with an email address or sign in with their existing Google or Apple accounts. The backend is a REST API built on Amazon API Gateway and AWS Lambda. The company does not want to build or operate its own user directory or token handling, and only signed-in users may call the API. Which combination of steps meets these requirements? (Select TWO.)

### Options
- **A.** Deploy AWS Directory Service for Microsoft Active Directory to hold the customer accounts.
- **B.** Configure a Cognito user pool authorizer on the API Gateway methods so that requests without a valid token from the user pool are rejected.
- **C.** Use AWS IAM Identity Center to create the customer accounts and assign them permission sets.
- **D.** Create an Amazon Cognito user pool with Google and Apple configured as social identity providers, and use it for sign-up and sign-in.
- **E.** Create an IAM user for each customer and embed that user's access keys in the app after sign-up.

### Correct answers: B, D (choose 2)

**Summary:** A Cognito user pool handles sign-up/social sign-in, and its API Gateway authorizer validates tokens before Lambda ever runs.

### Explanation
- A is wrong: Managed Microsoft AD is a workforce directory the company would have to size and operate, and it provides neither consumer sign-up nor social sign-in.
- B is correct: a Cognito user pool authorizer makes API Gateway validate the token on every request before Lambda runs, so only signed-in users reach the backend with no custom authorization code.
- C is wrong: IAM Identity Center manages workforce access to AWS accounts and business applications, not consumer identities for a public app.
- D is correct: a Cognito user pool is a managed user directory that handles sign-up, sign-in and token issuance, and it federates Google and Apple sign-in so social users land in the same pool.
- E is wrong: IAM users are meant for a limited number of people and workloads, not a consumer user base, and long-term access keys embedded in an app can be extracted and abused.

**Key phrases:** sign up with an email address · existing Google or Apple accounts · does not want to build or operate its own user directory · only signed-in users may call the API · Select TWO
**Hint:** One service to own the users and their tokens, and one setting so the API checks those tokens.

---

## ALPHA-067: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security, Operational Excellence

### Question
Administrators connect to Linux Amazon EC2 instances in private subnets through a bastion host that allows SSH from the corporate IP range. The security team wants to close all inbound ports, stop managing SSH keys, and keep a record of every command run in each session. What should a solutions architect do?

### Options
- **A.** Use EC2 Instance Connect to push a temporary SSH key for each session, keeping port 22 open to the corporate IP range.
- **B.** Replace the bastion host with a NAT gateway so administrators can reach the instances without public IP addresses.
- **C.** Move the bastion host into a private subnet and allow SSH to it only through an AWS Site-to-Site VPN connection.
- **D.** Attach an instance profile with the AmazonSSMManagedInstanceCore policy to the instances, remove the bastion host and the inbound SSH rules, and have administrators connect through AWS Systems Manager Session Manager with session logging enabled.

### Correct answer: D

**Summary:** Session Manager needs no inbound ports or SSH keys, and it logs every session's commands for audit.

### Explanation
- A is wrong: Instance Connect removes long-lived keys but still needs port 22 open, and it does not record the commands run in a session.
- B is wrong: a NAT gateway only lets instances start outbound connections, so it gives administrators no way in at all.
- C is wrong: it still depends on inbound SSH and on distributing and rotating SSH keys, and it records nothing about what is typed in each session.
- D is correct: Session Manager opens sessions over the Systems Manager agent's outbound connection, reached through a NAT gateway or interface VPC endpoints, so the instances need no inbound ports and no SSH keys, and session logging records every session's commands to Amazon S3 or CloudWatch Logs.

**Key phrases:** close all inbound ports · stop managing SSH keys · record of every command
**Hint:** Which service lets an agent on the instance dial out, so that nothing ever has to be opened inbound?

---

## ALPHA-068: Databases & Caching
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security

### Question
A company runs an Amazon RDS for MySQL DB instance that was created without encryption. A new compliance requirement states that the database and its automated backups must be encrypted at rest with a customer managed AWS KMS key. Some downtime during a maintenance window is acceptable. What should a solutions architect do?

### Options
- **A.** Create an encrypted read replica of the unencrypted DB instance with the customer managed key, then promote the replica to a standalone DB instance.
- **B.** Turn on EBS encryption by default in the account and reboot the DB instance so that its storage is re-encrypted.
- **C.** Take a snapshot of the DB instance, copy the snapshot with encryption enabled using the customer managed key, restore a new DB instance from the encrypted copy, and point the application at the new instance.
- **D.** Modify the DB instance to enable encryption with the customer managed key, and apply the change during the next maintenance window.

### Correct answer: C

**Summary:** Encryption can only be set at RDS instance creation -- encrypt via a snapshot copy and restore to change it after the fact.

### Explanation
- A is wrong: RDS does not allow an encrypted read replica of an unencrypted DB instance, which is exactly why this shortcut is tempting and unavailable.
- B is wrong: the account-level EBS encryption default applies to new EC2 volumes and has no effect on the storage of an existing RDS DB instance.
- C is correct: encryption can only be chosen when an RDS DB instance is created, but copying an unencrypted snapshot lets you encrypt the copy with a KMS key, and a DB instance restored from it is encrypted together with all of its future automated backups and snapshots.
- D is wrong: RDS does not let you turn on encryption for an existing unencrypted DB instance by modifying it.

**Key phrases:** created without encryption · customer managed AWS KMS key · Some downtime during a maintenance window is acceptable
**Hint:** Encryption is a creation-time choice for an RDS instance. Which artifact can you encrypt on the way through?

---

## ALPHA-069: Storage & Backup
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security

### Question
An application on Amazon EC2 instances in private subnets reads and writes objects in an Amazon S3 bucket through an S3 gateway VPC endpoint. The security team requires that the bucket reject every request that does not arrive through that specific endpoint, and every request that is not sent over TLS, even if the caller's IAM policy allows the action. Which combination of bucket policy statements meets these requirements? (Select TWO.)

### Options
- **A.** A Deny statement for all principals and all S3 actions with a Bool condition on aws:SecureTransport set to false.
- **B.** A Deny statement for s3:PutObject requests that do not include the x-amz-server-side-encryption header.
- **C.** A Deny statement for all principals and all S3 actions with a NotIpAddress condition on aws:SourceIp set to the private subnets' CIDR ranges.
- **D.** An Allow statement that grants all S3 actions to the instance role only when aws:SecureTransport is true.
- **E.** A Deny statement for all principals and all S3 actions with a StringNotEquals condition on aws:SourceVpce set to the gateway endpoint's ID.

### Correct answers: A, E (choose 2)

**Summary:** Deny policies keyed on aws:SourceVpce and aws:SecureTransport together lock S3 access to one VPC endpoint over TLS only.

### Explanation
- A is correct: aws:SecureTransport is false for requests made over plain HTTP, so an explicit Deny on that condition rejects anything not sent over TLS.
- B is wrong: that header controls encryption at rest for new objects, not whether a request used TLS or came through the endpoint.
- C is wrong: aws:SourceIp does not carry the private address of a request that arrives through a VPC endpoint, so this Deny would block the application's own traffic.
- D is wrong: an Allow cannot take away an Allow the caller already has in an IAM policy in the same account, so plain-HTTP requests would still succeed; only an explicit Deny enforces the rule.
- E is correct: requests through a gateway endpoint carry the endpoint ID in aws:SourceVpce, so an explicit Deny whenever it does not match blocks every other path to the bucket, and an explicit Deny overrides any Allow in the caller's IAM policy.

**Key phrases:** reject every request that does not arrive through that specific endpoint · not sent over TLS · even if the caller's IAM policy allows the action · Select TWO
**Hint:** Only an explicit Deny beats an Allow the caller already has. Which condition keys identify the endpoint and the transport?

---

## ALPHA-070: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
Workloads in several VPCs send outbound traffic to the internet through a central egress VPC with NAT gateways, connected by AWS Transit Gateway. The security team now requires that outbound HTTPS be allowed only to an approved list of domain names, such as the operating system vendor's update servers and a payment provider, and that all other outbound traffic be blocked and logged. Which solution meets these requirements with the LEAST operational overhead?

### Options
- **A.** Add network ACL rules in the egress VPC that allow HTTPS only to the IP addresses the approved domains resolve to today.
- **B.** Deploy AWS Network Firewall in the egress VPC, route traffic from the transit gateway through the firewall endpoints before the NAT gateways, and use a stateful domain list rule group that allows only the approved domains.
- **C.** Add outbound rules to every workload security group that allow HTTPS only to the approved domain names.
- **D.** Run a fleet of self-managed proxy servers on Amazon EC2 in the egress VPC and maintain the allowlist in their configuration.

### Correct answer: B

**Summary:** A centralized Network Firewall in the egress path enforces and logs domain-based outbound rules for every VPC at once.

### Explanation
- A is wrong: network ACLs also work on IP addresses only, and the addresses behind these domains change over time, so the allowlist would silently drift out of date.
- B is correct: Network Firewall is a managed, stateful firewall whose domain list rule groups match the TLS SNI and HTTP Host header against allowed domain names, and placing it in the central egress path enforces and logs the policy for every VPC at once.
- C is wrong: security group rules accept IP addresses, CIDR blocks, prefix lists or other security groups, not domain names.
- D is wrong: a proxy fleet can filter by domain, but the company would have to patch, scale and keep highly available the infrastructure that Network Firewall provides as a managed service.

**Key phrases:** central egress VPC · approved list of domain names · blocked and logged · LEAST operational overhead
**Hint:** Security groups and network ACLs only understand IP addresses. What can inspect the domain name in outbound HTTPS?

---

## ALPHA-071: Storage & Backup
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A content management system runs on Linux Amazon EC2 instances in an Auto Scaling group across three Availability Zones. Every instance must read and write the same set of uploaded media files, and the files must remain available if one Availability Zone fails. Which storage option meets these requirements?

### Options
- **A.** An Amazon EFS file system using a Regional storage class, mounted on every instance through a mount target in each Availability Zone.
- **B.** An instance store volume on each instance, kept in sync between instances by a cron job.
- **C.** An Amazon EBS io2 volume with Multi-Attach enabled, attached to every instance.
- **D.** An Amazon FSx for Windows File Server file system in a Single-AZ deployment.

### Correct answer: A

**Summary:** EFS gives a shared, Multi-AZ NFS file system that every instance in an Auto Scaling group can mount concurrently.

### Explanation
- A is correct: EFS Regional storage classes store data redundantly across multiple Availability Zones and provide a shared NFS file system that instances in every zone can mount at the same time, so the media survives the loss of a zone.
- B is wrong: instance store data is lost when an instance stops or fails, and a cron job leaves the copies inconsistent between runs.
- C is wrong: Multi-Attach works only for instances in the same Availability Zone as the volume and needs a cluster-aware file system, so it cannot serve three zones.
- D is wrong: FSx for Windows File Server serves SMB shares for Windows workloads, and a Single-AZ deployment does not survive the loss of its Availability Zone.

**Key phrases:** Linux · across three Availability Zones · read and write the same set · remain available if one Availability Zone fails
**Hint:** Shared by many Linux instances at once, and still there after losing a zone.

---

## ALPHA-072: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Cost Optimization

### Question
During flash sales, an order service on Amazon EC2 writes each order directly to an Amazon RDS for PostgreSQL database. Write bursts exceed what the database can absorb, requests time out, and some orders are lost. Outside sales the load is modest, and the business accepts that orders are confirmed to customers a few seconds after they are placed. Which change prevents lost orders MOST cost-effectively?

### Options
- **A.** Put an Amazon ElastiCache cluster in front of the database to hold the orders.
- **B.** Have the order service send each order to an Amazon SQS queue, and have a group of workers consume the queue and write to the database at a rate it can sustain.
- **C.** Scale the database up permanently to the largest instance class so that it can absorb the peak.
- **D.** Add RDS read replicas and spread the order writes across them.

### Correct answer: B

**Summary:** A queue between app and database decouples burst write rate from the database's absorb rate, so nothing is lost or timed out.

### Explanation
- A is wrong: a cache speeds up repeated reads but is not a durable buffer for writes, so orders held in it can still be lost.
- B is correct: the queue durably stores every order during a burst and lets the workers drain it at the database's pace, which decouples the write rate from the arrival rate and stops orders being lost without paying for peak database capacity.
- C is wrong: paying for peak capacity all year to cover a few hours of sales is the costly option, and a larger burst can still overwhelm it.
- D is wrong: read replicas are read-only, so they cannot accept the order writes.

**Key phrases:** Write bursts exceed what the database can absorb · some orders are lost · a few seconds after they are placed · MOST cost-effectively
**Hint:** Customers can wait a few seconds for confirmation. What can hold the burst while the database catches up?

---

## ALPHA-073: Databases & Caching
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Performance Efficiency

### Question
A global social app stores user profiles in an Amazon DynamoDB table in us-east-1. Users in Europe and Asia see high write latency, and the business now requires that the app keep accepting reads and writes in the remaining Regions if an entire AWS Region becomes unavailable, with each Region serving its local users. Which solution meets these requirements?

### Options
- **A.** Add a DynamoDB Accelerator (DAX) cluster in eu-west-1 and in ap-southeast-1 in front of the us-east-1 table.
- **B.** Convert the table to a DynamoDB global table with replicas in us-east-1, eu-west-1 and ap-southeast-1, and have the app in each Region read and write its local replica.
- **C.** Enable DynamoDB point-in-time recovery and restore the table into another Region if us-east-1 fails.
- **D.** Use DynamoDB Streams and an AWS Lambda function to copy every change into read-only tables in the other two Regions.

### Correct answer: B

**Summary:** DynamoDB global tables replicate to every Region with local read/write latency and automatic multi-Region resilience.

### Explanation
- A is wrong: a DAX cluster must run in the same Region as its table and only caches reads, so writes would still go to us-east-1 and fail with it.
- B is correct: a global table keeps a replica in each chosen Region, every replica accepts reads and writes locally, and changes replicate asynchronously between Regions, so users write with local latency and the remaining Regions keep serving if one Region fails.
- C is wrong: a restore takes time and loses writes made after the restore point, and it does nothing for everyday write latency.
- D is wrong: this rebuilds replication by hand, and read-only copies cannot accept writes while us-east-1 is unavailable.

**Key phrases:** high write latency · keep accepting reads and writes in the remaining Regions · each Region serving its local users
**Hint:** Every Region must take writes on its own. Which DynamoDB feature makes each replica writable?

---

## ALPHA-074: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Performance Efficiency

### Question
A web application keeps user session data in memory on each Amazon EC2 instance behind an Application Load Balancer. When the Auto Scaling group scales in or an instance fails, the affected users are logged out and lose their shopping carts. Sticky sessions are enabled. Which change makes sessions survive the loss of an instance while keeping the fleet elastic?

### Options
- **A.** Disable scale-in on the Auto Scaling group so that instances holding sessions are never terminated.
- **B.** Move the session data to an Amazon DynamoDB table keyed by session ID, use Time to Live (TTL) to remove expired sessions, and make the web instances stateless.
- **C.** Increase the sticky session duration so that users stay on one instance for longer.
- **D.** Store session data on an EBS volume attached to each instance and take snapshots of the volumes every hour.

### Correct answer: B

**Summary:** Externalizing session state (with TTL) frees instances to scale freely without users losing their session.

### Explanation
- A is wrong: it gives up elasticity and its cost savings and still loses sessions when an instance fails.
- B is correct: an external session store keeps session data independent of any single instance, so the load balancer can send a user to any instance and the Auto Scaling group can add or remove instances freely, while TTL clears out old sessions at no extra cost.
- C is wrong: stickiness only routes a user back to the same instance, so the session is still lost whenever that instance is terminated or fails, and longer stickiness spreads load less evenly.
- D is wrong: the data is still tied to one instance, other instances cannot read it, and hourly snapshots lose up to an hour of carts.

**Key phrases:** in memory on each Amazon EC2 instance · scales in or an instance fails · Sticky sessions are enabled · keeping the fleet elastic
**Hint:** Stickiness keeps a user on one instance; it does not keep the data when that instance goes away.

---

## ALPHA-075: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Reliability

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

---

## ALPHA-076: Disaster Recovery & Migration
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence

### Question
A company keeps 60 TB of research data on an on-premises NFS file server and adds about 200 GB of new and changed files every day. It wants to copy the existing data to Amazon EFS over its 10 Gbps AWS Direct Connect connection, then keep EFS in sync with the daily changes until cutover in three months, with scheduling, encryption in transit and data integrity checks built in. Which solution meets these requirements with the LEAST operational effort?

### Options
- **A.** Deploy Amazon S3 File Gateway, copy the files into its share, and use AWS Lambda to move them from Amazon S3 into EFS.
- **B.** Order AWS Snowball Edge devices for the initial copy, and ship a new device each week for the changes.
- **C.** Deploy an AWS DataSync agent on premises, create a task from the NFS share to the EFS file system, and schedule it to run daily.
- **D.** Mount the EFS file system on an on-premises server over Direct Connect and run rsync from a cron job.

### Correct answer: C

**Summary:** DataSync automates incremental, verified, bandwidth-efficient transfer of only new or changed files on a schedule.

### Explanation
- A is wrong: it adds two services and custom code to reach a destination that DataSync writes to directly.
- B is wrong: 60 TB crosses a 10 Gbps link in roughly half a day at full line rate, so shipping devices adds days of transit for no benefit, and weekly shipments cannot keep up with daily changes.
- C is correct: DataSync transfers only new and changed files on each scheduled run, encrypts data in transit, verifies integrity, and parallelizes transfers to use the available bandwidth, all as a managed service.
- D is wrong: rsync copies with limited parallelism, and the company would have to build its own scheduling, retries, monitoring and verification around it.

**Key phrases:** 60 TB · 200 GB of new and changed files every day · keep EFS in sync · LEAST operational effort
**Hint:** An ongoing, scheduled, online copy from NFS into an AWS file system. Which managed service is built for exactly that?

---

## ALPHA-077: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** hard · **Pillars:** Performance Efficiency

### Question
A retailer's analysts run complex SQL with multi-table joins and aggregations over 30 TB of recent sales data, and 200 business users open dashboards that must return in a few seconds throughout the day. The analysts also need to join that data occasionally with 400 TB of older, rarely queried history kept in Amazon S3 as Parquet, without loading that history into the warehouse. Which solution BEST meets these requirements?

### Options
- **A.** Store the data in Amazon DynamoDB and use DynamoDB Streams to precompute the dashboard results.
- **B.** Query all of the data directly in S3 with Amazon Athena and point the dashboards at Athena.
- **C.** Store the 30 TB in Amazon Redshift, enable concurrency scaling for the dashboard peaks, and query the history in S3 through Redshift Spectrum external tables.
- **D.** Load all 430 TB into Amazon RDS for PostgreSQL and add read replicas for the dashboards.

### Correct answer: C

**Summary:** Redshift's MPP engine handles heavy joins, concurrency scaling absorbs dashboard spikes, and Spectrum queries S3 data in place.

### Explanation
- A is wrong: DynamoDB is a key-value store that cannot run SQL joins or ad hoc aggregations, so every analytic question would need custom precomputation.
- B is wrong: Athena suits ad hoc queries, but 200 users running complex dashboards all day run into account-level limits on concurrent queries, and every refresh pays for another scan.
- C is correct: Redshift is a columnar, massively parallel data warehouse built for complex joins and aggregations, concurrency scaling adds capacity automatically when many dashboard queries arrive at once, and Spectrum queries the Parquet history in place in S3 and joins it with warehouse tables.
- D is wrong: a row-oriented transactional database is not built for analytic scans and joins across hundreds of terabytes, and 430 TB exceeds the maximum storage of an RDS DB instance.

**Key phrases:** complex SQL with multi-table joins · 200 business users · return in a few seconds · without loading that history into the warehouse
**Hint:** Warehouse-grade joins for the hot data, and a way to reach the S3 history without loading it.

---

## ALPHA-078: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Security

### Question
A data platform writes hundreds of millions of small objects per day to an Amazon S3 bucket that uses SSE-KMS with a customer managed key. The AWS KMS charges on the bill now exceed the S3 storage cost, and the security team requires that SSE-KMS with the same key remain in use. Which change reduces the KMS cost the MOST?

### Options
- **A.** Enable S3 Bucket Keys for the bucket's SSE-KMS encryption.
- **B.** Replace the customer managed key with the AWS managed key for S3 (aws/s3).
- **C.** Create a separate customer managed key for each day's data so that requests are spread across more keys.
- **D.** Change the bucket's default encryption to SSE-S3.

### Correct answer: A

**Summary:** An S3 Bucket Key drastically cuts KMS request costs by reusing a short-lived derived key instead of calling KMS per object.

### Explanation
- A is correct: an S3 Bucket Key is a short-lived, bucket-level key derived from the KMS key that S3 uses to generate data keys itself, so S3 makes far fewer requests to KMS, cutting request costs by up to 99% while the same customer managed key still protects the data.
- B is wrong: it replaces the customer managed key the security team requires, and S3 would still call KMS for every object.
- C is wrong: every extra key adds a monthly charge and S3 still calls KMS once per object, so this raises the cost instead of lowering it.
- D is wrong: SSE-S3 removes the KMS charges but breaks the requirement to keep SSE-KMS with the same key.

**Key phrases:** hundreds of millions of small objects per day · SSE-KMS with a customer managed key · exceed the S3 storage cost · same key remain in use
**Hint:** Keep the key, cut the calls. Which S3 setting stops S3 calling KMS for every single object?

---

## ALPHA-079: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
A company is migrating a Windows Server application with Microsoft SQL Server to Amazon EC2. It already owns SQL Server licenses that are licensed per physical core and are not eligible for License Mobility, so they may be used only on hardware dedicated to the company where it can see the sockets and cores. The company wants to use these existing licenses instead of paying for license-included instances. Which EC2 option meets these requirements MOST cost-effectively?

### Options
- **A.** Launch the instances on Amazon EC2 Dedicated Hosts and use AWS License Manager to track the core-based license usage.
- **B.** Launch Spot Instances and apply the existing licenses to them.
- **C.** Launch license-included Windows Server and SQL Server On-Demand Instances and cover them with a Compute Savings Plan.
- **D.** Launch the instances as Dedicated Instances.

### Correct answer: A

**Summary:** A Dedicated Host exposes physical sockets/cores for per-core BYOL licensing, tracked for compliance by License Manager.

### Explanation
- A is correct: a Dedicated Host is a physical server allocated to the company that exposes its sockets and physical cores, which is what bring-your-own-license terms bound to physical cores require, and License Manager tracks usage against the licenses so the company stays compliant.
- B is wrong: Spot Instances run on shared hardware and can be interrupted, so they neither satisfy dedicated-hardware licensing nor suit a production database.
- C is wrong: license-included instances pay again for SQL Server licenses the company already owns, which is exactly the cost it wants to avoid.
- D is wrong: Dedicated Instances run on single-tenant hardware but do not expose sockets and cores or give host-level placement control, so they cannot satisfy licenses bound to physical cores.

**Key phrases:** licensed per physical core · not eligible for License Mobility · see the sockets and cores · use these existing licenses · MOST cost-effectively
**Hint:** Licenses tied to physical cores need hardware where the company can see those cores. Which EC2 option exposes them?

---

## ALPHA-080: Monitoring, Management & Governance
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization, Operational Excellence, Sustainability

### Question
An application sends about 3 TB of logs per month to Amazon CloudWatch Logs, and its log groups use the default retention setting. Engineers query only the last 30 days, but compliance requires keeping every log for 7 years, with retrieval within 48 hours when an auditor asks. The CloudWatch Logs storage bill grows every month. Which solution is MOST cost-effective?

### Options
- **A.** Set the log groups' retention to 30 days and rely on CloudWatch Logs to archive expired logs to Amazon S3 automatically.
- **B.** Set the log groups' retention to 30 days, and add a subscription filter that streams the logs through Amazon Data Firehose to an S3 bucket with a lifecycle rule that transitions objects to S3 Glacier Deep Archive.
- **C.** Keep the default retention and create an Amazon OpenSearch Service domain to hold the older logs.
- **D.** Set the log groups' retention to 7 years so that older logs expire automatically.

### Correct answer: B

**Summary:** Keep recent logs in CloudWatch, ship everything to S3 via subscription, and archive to Deep Archive for cheap long-term retention.

### Explanation
- A is wrong: logs that reach the end of their retention period are deleted, not archived, so everything older than 30 days would be lost.
- B is correct: 30-day retention keeps recent logs queryable in CloudWatch, the subscription delivers every event to S3 as it arrives, and Deep Archive is the lowest-cost storage class, with standard retrievals completing within 12 hours, well inside the 48-hour audit window.
- C is wrong: the default retention keeps logs in CloudWatch forever, and an OpenSearch domain adds an always-running cluster that costs far more than archival storage.
- D is wrong: CloudWatch Logs storage costs far more per GB than S3 Glacier Deep Archive, so keeping 7 years of logs there is the expensive way to meet the requirement.

**Key phrases:** default retention setting · query only the last 30 days · 7 years · retrieval within 48 hours · MOST cost-effective
**Hint:** Keep the recent month where engineers query it, and move the 7-year copy to the cheapest storage that still meets a 48-hour retrieval.

---

## ALPHA-081: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
After a security incident, a company must be able to answer which source IP addresses connected to a particular Amazon EC2 instance, which connections were rejected by security groups or network ACLs, and how many bytes were transferred, for any time in the last 90 days. The instances run a mix of operating systems, and the company does not want to install or maintain agents. What should a solutions architect do?

### Options
- **A.** Enable AWS CloudTrail data events for Amazon EC2 in every Region.
- **B.** Enable Traffic Mirroring on every elastic network interface and store the packet captures in Amazon S3.
- **C.** Install the CloudWatch agent on every instance to publish network connection metrics.
- **D.** Enable VPC Flow Logs for the VPC, publish them to an Amazon S3 bucket with a 90-day lifecycle, and query them with Amazon Athena.

### Correct answer: D

**Summary:** VPC Flow Logs capture accepted/rejected traffic with no agent, queryable via Athena for incident investigation.

### Explanation
- A is wrong: CloudTrail records AWS API calls, not the network connections between hosts.
- B is wrong: Traffic Mirroring captures whole packets, which costs far more to store than the connection metadata needed here, and it must be configured per interface with mirror targets.
- C is wrong: this needs an agent on every instance, which the company rules out, and it cannot show traffic that a security group or network ACL rejected before it reached the instance.
- D is correct: flow logs record accepted and rejected IP traffic at the VPC, subnet or interface level, including source and destination addresses and ports, packet and byte counts and the ACCEPT or REJECT action, with no agent on the instances, and in S3 they can be queried with Athena for as long as the lifecycle keeps them.

**Key phrases:** which connections were rejected · last 90 days · does not want to install or maintain agents
**Hint:** Which VPC feature records connection metadata, including whether traffic was accepted or rejected, without touching the instances?

---

## ALPHA-082: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company is migrating a .NET application to Amazon EC2 Windows instances. The instances must be domain-joined so that employees sign in with their existing corporate Active Directory accounts, and the application relies on integrated Windows authentication. The company wants a managed directory in AWS that trusts its on-premises Active Directory, and it wants minimal ongoing administration. Which solution meets these requirements?

### Options
- **A.** Create an Amazon Cognito user pool federated with the corporate directory through SAML.
- **B.** Run a pair of self-managed Active Directory domain controllers on Amazon EC2 and replicate the corporate domain to them.
- **C.** Deploy AWS Directory Service for Microsoft Active Directory (AWS Managed Microsoft AD) in the VPC and create a forest trust with the on-premises Active Directory.
- **D.** Deploy AD Connector and use it as the directory that the instances and application authenticate against.

### Correct answer: C

**Summary:** AWS Managed Microsoft AD plus a forest trust lets EC2 domain-join using existing on-premises AD accounts without duplicating them.

### Explanation
- A is wrong: Cognito federates sign-in for web and mobile applications; it cannot domain-join Windows instances or provide integrated Windows authentication.
- B is wrong: self-managed domain controllers mean patching, backups, monitoring and replication design, which is the ongoing administration the company wants to avoid.
- C is correct: AWS Managed Microsoft AD is a managed, highly available Microsoft Active Directory running in AWS that supports domain joins, Group Policy and Kerberos-based integrated Windows authentication, and a forest trust lets it accept the company's existing on-premises accounts without duplicating them.
- D is wrong: AD Connector is a proxy that redirects requests to the on-premises directory rather than a directory in AWS, so every authentication depends on the on-premises link and it cannot hold a trust of its own.

**Key phrases:** domain-joined · existing corporate Active Directory accounts · managed directory in AWS that trusts · minimal ongoing administration
**Hint:** Domain join, Group Policy and Kerberos inside AWS, while the user accounts stay on premises.

---

## ALPHA-083: Storage & Backup
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Reliability

### Question
A company stores critical design files in an Amazon S3 bucket. Last month an engineer deleted a prefix by mistake and the objects could not be recovered. The company wants deletions to be recoverable, wants permanently removing a version to require a second factor, and wants to keep storage cost in check. Which combination of actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Enable S3 Versioning on the bucket and add a lifecycle rule that expires noncurrent versions after 90 days.
- **B.** Enable S3 Cross-Region Replication to a bucket in a second Region.
- **C.** Enable S3 Transfer Acceleration on the bucket.
- **D.** Enable MFA Delete on the bucket, so that permanently deleting a version or suspending versioning requires an MFA code.
- **E.** Enable S3 Object Lock in compliance mode with a 10-year retention period on every object.

### Correct answers: A, D (choose 2)

**Summary:** S3 Versioning (with lifecycle expiry) makes deletes recoverable, and MFA Delete adds a second factor before a version can be destroyed.

### Explanation
- A is correct: with versioning on, a delete only writes a delete marker and the previous version can be restored, while a lifecycle rule that expires noncurrent versions after 90 days stops those older copies accumulating forever.
- B is wrong: replication copies objects to another Region for durability but does not by itself let you recover an object deleted by mistake, and it roughly doubles storage cost.
- C is wrong: Transfer Acceleration speeds up long-distance transfers and has nothing to do with recovering deleted objects.
- D is correct: MFA Delete requires an MFA code from the bucket owner's root credentials before a specific version can be permanently deleted or versioning suspended, which is the second factor the company asked for.
- E is wrong: compliance mode would block every deletion for 10 years, including intentional cleanup, and force the company to store data it no longer needs.

**Key phrases:** deleted a prefix by mistake · deletions to be recoverable · require a second factor · keep storage cost in check · Select TWO
**Hint:** One setting keeps the previous copies, another makes permanent removal require a second factor, and a lifecycle rule stops the copies piling up.

---

## ALPHA-084: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** hard · **Pillars:** Security

### Question
An internal REST API built with Amazon API Gateway must be reachable only from applications inside the company's VPCs and from its data center over AWS Direct Connect. It must not be reachable from the public internet, even by a caller with valid credentials. Which solution meets these requirements?

### Options
- **A.** Create a VPC link so that the API integrates with private resources in the VPC.
- **B.** Keep a regional API and attach a resource policy that denies requests from source IP addresses outside the corporate range.
- **C.** Create the API as a private REST API, expose it through an interface VPC endpoint for API Gateway, and attach a resource policy that allows only requests arriving through that endpoint (aws:SourceVpce).
- **D.** Keep a regional API and require IAM (SigV4) authentication on every method.

### Correct answer: C

**Summary:** A private API Gateway endpoint plus a VPC-endpoint-scoped resource policy keeps an API reachable only from approved VPCs, never the internet.

### Explanation
- A is wrong: a VPC link governs how API Gateway reaches private backends; it does nothing about who can reach the API's own endpoint.
- B is wrong: a regional API keeps a public endpoint that anyone on the internet can reach and attempt to attack, even if a policy rejects most callers.
- C is correct: a private API has no public endpoint at all and can be called only through interface VPC endpoints, which the data center can reach over Direct Connect, and a resource policy keyed on the endpoint ID limits it to the approved VPCs.
- D is wrong: authentication controls who may call the API, but the endpoint itself is still publicly reachable, which the requirement forbids.

**Key phrases:** only from applications inside the company's VPCs · over AWS Direct Connect · must not be reachable from the public internet
**Hint:** Which API Gateway endpoint type has no public DNS at all, and which condition key pins it to your own endpoints?

---

## ALPHA-085: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security

### Question
Amazon EC2 instances in a private subnet are configured with IPv6 addresses only. They must download software updates from IPv6 endpoints on the internet, but nothing on the internet may initiate a connection to them. Which solution meets these requirements?

### Options
- **A.** Add an egress-only internet gateway to the VPC and route the subnet's ::/0 traffic to it.
- **B.** Launch a NAT instance with an IPv6 address in a public subnet and route ::/0 to it.
- **C.** Attach an internet gateway and route ::/0 to it, relying on security groups to block inbound connections.
- **D.** Add a NAT gateway in a public subnet and route the subnet's ::/0 traffic to it.

### Correct answer: A

**Summary:** An egress-only internet gateway is the IPv6 equivalent of a NAT gateway: outbound-only, nothing can initiate inbound.

### Explanation
- A is correct: an egress-only internet gateway is the IPv6 equivalent of a NAT gateway for outbound-only traffic, because it is stateful, lets instances start outbound IPv6 connections, and refuses connections initiated from the internet.
- B is wrong: a NAT instance is a self-managed IPv4 device and adds an instance to patch and scale.
- C is wrong: IPv6 addresses are publicly routable, so an internet gateway makes the instances reachable from the internet and the design depends entirely on every security group and network ACL staying correct.
- D is wrong: a NAT gateway handles IPv4 translation, and although it can provide NAT64 so IPv6 hosts reach IPv4-only services, it is not the outbound path for IPv6 traffic to IPv6 destinations.

**Key phrases:** IPv6 addresses only · download software updates · nothing on the internet may initiate a connection
**Hint:** IPv6 addresses are globally routable. Which gateway is the IPv6 counterpart of a NAT gateway?

---

## ALPHA-086: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company must patch several hundred Amazon EC2 instances running Amazon Linux and Windows across three accounts on a monthly schedule, apply patches only inside an approved maintenance window, and produce a report showing which instances are missing patches. The company wants to avoid building its own tooling. What should a solutions architect recommend?

### Options
- **A.** Use AWS Systems Manager Patch Manager with patch baselines and patch groups, run it from a Systems Manager maintenance window, and review its patch compliance reporting.
- **B.** Write an AWS Lambda function that runs the operating system update commands through Systems Manager Run Command on a schedule and records results in Amazon DynamoDB.
- **C.** Enable Amazon Inspector and let it install missing patches automatically.
- **D.** Build a new AMI every month and replace all instances using an Auto Scaling instance refresh.

### Correct answer: A

**Summary:** Systems Manager Patch Manager applies approved patches on schedule within maintenance windows and reports compliance across accounts.

### Explanation
- A is correct: Patch Manager defines which patches are approved for each operating system in a baseline, targets instances by patch group or tag, applies them only during a maintenance window, and reports per-instance patch compliance across accounts with nothing custom to build.
- B is wrong: this rebuilds Patch Manager by hand, including scheduling, error handling and compliance reporting.
- C is wrong: Inspector finds and reports vulnerabilities but does not install patches.
- D is wrong: replacing instances from a fresh AMI is a sound pattern but requires an image pipeline, only covers instances managed by an Auto Scaling group, and produces no missing-patch report.

**Key phrases:** monthly schedule · approved maintenance window · report showing which instances are missing patches · avoid building its own tooling
**Hint:** One Systems Manager capability owns patch baselines, scheduling and compliance reporting.

---

## ALPHA-087: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence

### Question
A company is migrating a legacy order-processing application to AWS. Its components communicate through an on-premises message broker using JMS and the AMQP 1.0 protocol, and the team cannot change the application code before the migration deadline. The broker must stay available if an Availability Zone fails. Which solution requires the LEAST application change?

### Options
- **A.** Replace the broker with Amazon SNS topics and HTTPS subscriptions.
- **B.** Migrate the queues to Amazon MQ for ActiveMQ in an active/standby deployment across two Availability Zones and repoint the application at the broker endpoints.
- **C.** Run the existing broker software on a single Amazon EC2 instance in one Availability Zone.
- **D.** Replace the broker with Amazon SQS queues and rewrite the messaging layer to use the SQS API.

### Correct answer: B

**Summary:** Amazon MQ speaks JMS/AMQP/MQTT/STOMP natively, so a legacy broker migrates without changing application code.

### Explanation
- A is wrong: SNS is push-based publish/subscribe with no broker protocol support, so it changes the application's interaction model entirely.
- B is correct: Amazon MQ is a managed broker that speaks industry-standard protocols including JMS, AMQP, MQTT and STOMP, so the application keeps its existing messaging code, and an active/standby deployment fails over automatically to a second Availability Zone.
- C is wrong: a single self-managed broker fails with its Availability Zone and leaves the company patching and operating the broker.
- D is wrong: SQS has its own API and does not support AMQP, so the messaging layer would have to be reworked, which the deadline rules out.

**Key phrases:** JMS and the AMQP 1.0 protocol · cannot change the application code · available if an Availability Zone fails · LEAST application change
**Hint:** Keep the protocol, drop the servers. Which AWS service speaks the broker protocols the application already uses?

---

## ALPHA-088: Storage & Backup
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Security

### Question
A regulator requires that a company keep a copy of certain Amazon S3 objects in a second AWS Region, that the copy exist within 15 minutes of the object being written, and that the company be able to demonstrate it met that window. Objects already in the bucket are in scope as well as new ones. What should a solutions architect do?

### Options
- **A.** Enable S3 Same-Region Replication and copy the destination bucket to another Region nightly.
- **B.** Enable S3 Cross-Region Replication with S3 Replication Time Control, turn on replication metrics and events, and run S3 Batch Replication for the existing objects.
- **C.** Enable S3 Cross-Region Replication without Replication Time Control and rely on its best-effort replication.
- **D.** Schedule an AWS DataSync task between the two buckets every 15 minutes.

### Correct answer: B

**Summary:** S3 Replication Time Control SLA-guarantees 15-minute cross-Region replication, with Batch Replication covering pre-existing objects.

### Explanation
- A is wrong: Same-Region Replication keeps the copy in the same Region, and a nightly copy is far outside the required window.
- B is correct: Replication Time Control commits to replicating 99.99% of new objects within 15 minutes and is backed by a service level agreement, replication metrics and events provide the evidence, and Batch Replication copies the objects that existed before replication was turned on.
- C is wrong: standard replication is best effort with no time commitment and no metrics that prove the window was met.
- D is wrong: a task that starts every 15 minutes leaves an object written just after a run waiting far longer than 15 minutes.

**Key phrases:** second AWS Region · within 15 minutes · demonstrate it met that window · Objects already in the bucket
**Hint:** Replication on its own promises no time limit. Which option adds one, and what covers the objects already in the bucket?

---

## ALPHA-089: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** hard · **Pillars:** Reliability, Operational Excellence

### Question
A company has connected its data center to a VPC with AWS Direct Connect. Applications in the VPC must resolve names in the on-premises domain corp.internal, and on-premises servers must resolve records held in an Amazon Route 53 private hosted zone that is associated with the VPC. Which combination of actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Associate the private hosted zone with the data center by adding the data center's CIDR range to the hosted zone.
- **B.** Create a Route 53 Resolver outbound endpoint in the VPC with a forwarding rule that sends queries for corp.internal to the on-premises DNS servers.
- **C.** Enable DNS hostnames on the VPC and have on-premises servers query the Amazon-provided DNS server at the VPC's base address plus two.
- **D.** Create a second private hosted zone for corp.internal in Route 53 and copy the on-premises records into it by hand.
- **E.** Create a Route 53 Resolver inbound endpoint in the VPC and point the on-premises DNS servers at its IP addresses for the private hosted zone's domain.

### Correct answers: B, E (choose 2)

**Summary:** Route 53 Resolver endpoints (outbound plus inbound) bridge DNS resolution between a VPC and on-premises in both directions.

### Explanation
- A is wrong: a private hosted zone is associated with VPCs, not with on-premises CIDR ranges.
- B is correct: an outbound endpoint with a forwarding rule sends queries that match corp.internal from the VPC to the company's own DNS servers, so applications in the VPC resolve on-premises names.
- C is wrong: the Amazon-provided DNS server at the VPC base address plus two cannot be queried from outside the VPC, which is precisely why inbound endpoints exist.
- D is wrong: hand-copied records drift away from the authoritative on-premises zone and create a second source of truth.
- E is correct: an inbound endpoint provides Resolver IP addresses inside the VPC that on-premises resolvers can forward to, which is how the data center resolves private hosted zone records.

**Key phrases:** resolve names in the on-premises domain · on-premises servers must resolve records · private hosted zone · Select TWO
**Hint:** DNS has to flow in two directions here, and Route 53 Resolver has a different endpoint type for each.

---

## ALPHA-090: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Operational Excellence, Cost Optimization

### Question
A media company's on-premises editing workstations write finished projects to an NFS share on an aging appliance that is nearly full. The company wants the archive to live in Amazon S3 so that lifecycle rules apply, while editors keep using an NFS mount and recently used files stay fast to read locally. Which solution meets these requirements?

### Options
- **A.** Deploy an Amazon S3 File Gateway on premises, present its NFS share to the workstations, and let it store files as objects in Amazon S3 with a local cache.
- **B.** Copy files to Amazon S3 with the AWS CLI and mount the bucket on each workstation with a third-party S3 file system driver.
- **C.** Mount an Amazon EFS file system on the workstations across the public internet.
- **D.** Run AWS DataSync nightly from the appliance to Amazon S3 and have editors keep writing to the appliance.

### Correct answer: A

**Summary:** S3 File Gateway presents on-prem NFS/SMB while storing data as S3 objects underneath, so lifecycle rules apply automatically.

### Explanation
- A is correct: S3 File Gateway presents an NFS or SMB share on premises and stores each file as an object in S3 where lifecycle rules apply, while its local cache keeps recently used files fast to read.
- B is wrong: a third-party driver over a WAN gives poor performance with no local cache, and the company would have to operate it itself.
- C is wrong: EFS is meant to be mounted from within a VPC or from on premises over Direct Connect or VPN, and it leaves the archive outside S3 where the lifecycle rules were wanted.
- D is wrong: a nightly copy leaves the appliance as the primary store, so it stays full.

**Key phrases:** NFS share · nearly full · archive to live in Amazon S3 · recently used files stay fast to read locally
**Hint:** Keep the NFS mount on premises, move the data into S3, and keep a local cache of what was used recently.

---

## ALPHA-091: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** hard · **Pillars:** Reliability, Operational Excellence

### Question
An Auto Scaling group runs worker instances that process long jobs and upload results to Amazon S3. During scale-in, instances are terminated while jobs are still running and partly written results are lost. The team wants each instance to finish its current job, for up to 15 minutes, before termination, without disabling scale-in. What should a solutions architect do?

### Options
- **A.** Set the Auto Scaling group's default cooldown to 900 seconds.
- **B.** Add an Auto Scaling lifecycle hook for instance termination with a 15-minute heartbeat timeout, and have the worker finish its job, upload the result, and then call CompleteLifecycleAction.
- **C.** Enable instance scale-in protection on every instance in the group.
- **D.** Increase the Auto Scaling group's health check grace period to 15 minutes.

### Correct answer: B

**Summary:** A termination lifecycle hook holds an instance in Terminating:Wait so in-flight work can finish before it's actually removed.

### Explanation
- A is wrong: cooldown controls how long Auto Scaling waits before the next scaling activity, not how long a terminating instance keeps running.
- B is correct: a termination lifecycle hook holds the instance in the Terminating:Wait state for up to the heartbeat timeout, giving the worker time to finish and upload before it signals CompleteLifecycleAction and termination proceeds.
- C is wrong: scale-in protection stops those instances being chosen for scale-in at all, which is effectively disabling scale-in.
- D is wrong: the health check grace period only delays health checks after an instance launches and has nothing to do with termination.

**Key phrases:** terminated while jobs are still running · finish its current job · up to 15 minutes · without disabling scale-in
**Hint:** Which Auto Scaling feature pauses an instance in a wait state so that your own code can finish first?

---

## ALPHA-092: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency

### Question
A social application must answer questions such as which friends of a user's friends also follow a given topic, over hundreds of millions of relationships, with millisecond latency, using a graph query language such as Gremlin or openCypher. Which AWS database service is the BEST fit?

### Options
- **A.** Amazon DynamoDB with a global secondary index for each relationship type
- **B.** Amazon Timestream
- **C.** Amazon Neptune
- **D.** Amazon RDS for PostgreSQL using recursive common table expressions

### Correct answer: C

**Summary:** Neptune is a purpose-built graph database for millisecond traversal of highly connected relationship data.

### Explanation
- A is wrong: DynamoDB can store relationships but has no graph traversal, so each additional hop means another round trip and application-side joins.
- B is wrong: Timestream is built for time series measurements, not for relationships between entities.
- C is correct: Neptune is a managed graph database built for highly connected data, it supports Gremlin, openCypher and SPARQL, and it traverses relationships in milliseconds at this scale.
- D is wrong: recursive SQL across hundreds of millions of edges becomes slow and hard to tune, because a relational engine is not optimized for deep traversals.

**Key phrases:** friends of a user's friends · hundreds of millions of relationships · Gremlin or openCypher
**Hint:** Match the data shape to the engine: relationships and multi-hop traversals point at one purpose-built database.

---

## ALPHA-093: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Cost Optimization

### Question
An Amazon DynamoDB table stores orders with a partition key of customerId and a sort key of orderDate. A new dashboard must list every order with a given status, such as PENDING, across all customers, ordered by date, and it must not slow down the existing customer queries. Only a small fraction of orders are PENDING at any time. Which solution meets these requirements MOST efficiently?

### Options
- **A.** Create a global secondary index with status as the partition key and orderDate as the sort key, and have the dashboard query that index.
- **B.** Write every order into a second table keyed by status, and have the application write to both tables.
- **C.** Have the dashboard run a Scan with a filter expression on status at each refresh.
- **D.** Create a local secondary index with status as its sort key.

### Correct answer: A

**Summary:** A DynamoDB GSI with a different partition key serves a new access pattern without disturbing the base table's capacity or queries.

### Explanation
- A is correct: a global secondary index can use a different partition key from the table, so querying status returns only matching orders already sorted by date, and the index stays small because few orders are PENDING and it has its own capacity, so table queries are unaffected.
- B is wrong: a duplicate table makes the application responsible for keeping two copies consistent, which a global secondary index does automatically.
- C is wrong: a Scan reads every item before the filter is applied, so it consumes capacity in proportion to the whole table and gets slower as the table grows.
- D is wrong: a local secondary index must keep the table's partition key, so it can only ever query within one customer.

**Key phrases:** partition key of customerId · given status · across all customers · must not slow down the existing customer queries
**Hint:** Which index type may use a different partition key from the table, and what does that mean for querying across all customers?

---

## ALPHA-094: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A monolithic application is being split into three containerized services that will run on Amazon ECS with AWS Fargate behind a single hostname, serving the paths /api, /admin and /static. Traffic to /api is spiky and carries most of the load, while /admin is lightly used. The team wants one entry point and wants each service to scale on its own. Which combination of actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Put a Network Load Balancer in front of the services and route requests by path.
- **B.** Run all three services in a single ECS task definition so that they scale together.
- **C.** Configure ECS service auto scaling for each service with target tracking on a metric such as ALB request count per target or CPU utilization.
- **D.** Put an Application Load Balancer in front of the services and create listener rules that route each path pattern to that service's target group.
- **E.** Give each service its own hostname and load balancer and let clients choose the right one.

### Correct answers: C, D (choose 2)

**Summary:** An ALB routes by path to independent target groups, and ECS service auto scaling scales each service independently behind one hostname.

### Explanation
- A is wrong: a Network Load Balancer operates at layer 4 and cannot see URL paths.
- B is wrong: packing all three services into one task means they scale together, which is exactly what the team wants to avoid.
- C is correct: ECS service auto scaling adjusts each service's task count independently, so target tracking lets the spiky /api service grow without changing the others.
- D is correct: an Application Load Balancer understands HTTP, so listener rules can send each path pattern to a different target group behind one hostname.
- E is wrong: several hostnames and load balancers break the single entry point and push routing decisions onto clients.

**Key phrases:** /api, /admin and /static · one entry point · each service to scale on its own · Select TWO
**Hint:** Only one load balancer type can see the URL path, and each service needs a scaling policy of its own.

---

## ALPHA-095: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A company serves a website through Amazon CloudFront. On every viewer request it must normalize the URL and add a few HTTP headers. The work takes well under a millisecond, needs no network access, and runs on millions of requests per second, so it must add as little latency and cost as possible. Which solution meets these requirements?

### Options
- **A.** Write a Lambda@Edge function and associate it with the origin request event.
- **B.** Add an AWS WAF rule that rewrites the URL and headers before requests reach CloudFront.
- **C.** Write a Lambda@Edge function and associate it with the viewer request event.
- **D.** Write a CloudFront function and associate it with the distribution's viewer request event.

### Correct answer: D

**Summary:** CloudFront Functions handle simple, sub-millisecond edge logic far cheaper than Lambda@Edge.

### Explanation
- A is wrong: origin request events run only on cache misses, so requests served from the cache would never be normalized.
- B is wrong: AWS WAF inspects requests and allows or blocks them; it is not a general request-rewriting engine.
- C is wrong: Lambda@Edge suits heavier work that needs a full runtime or network access, and it adds more latency and cost than a CloudFront function for simple rewrites.
- D is correct: CloudFront Functions run in a lightweight JavaScript runtime at the edge location itself, are designed for sub-millisecond header and URL manipulation at very high request rates, and cost a fraction of Lambda@Edge.

**Key phrases:** normalize the URL and add a few HTTP headers · needs no network access · millions of requests per second · as little latency and cost as possible
**Hint:** There are two ways to run code at the edge. Which one is built for tiny, CPU-only work at the very highest request rates?

---

## ALPHA-096: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency

### Question
A media production company in a large city runs latency-sensitive editing workstations that must reach their compute and storage in AWS with single-digit millisecond latency. The nearest AWS Region adds about 30 milliseconds of round-trip latency, which is too much. The company does not want to run hardware in its own facility. Which solution meets these requirements?

### Options
- **A.** Run the workloads on Amazon EC2 instances in an AWS Local Zone near the city, connected to the parent Region's VPC.
- **B.** Deploy the workloads to an AWS Wavelength Zone in a telecom carrier's 5G network.
- **C.** Install AWS Outposts racks in the company's own facility.
- **D.** Put an Amazon CloudFront distribution in front of the editing applications.

### Correct answer: A

**Summary:** An AWS Local Zone extends a Region's VPC into a metro area for single-digit-millisecond latency with no on-prem hardware.

### Explanation
- A is correct: a Local Zone places AWS compute and storage inside a metropolitan area as an extension of a Region's VPC, which delivers single-digit millisecond latency to nearby users without any hardware on the company's premises.
- B is wrong: Wavelength Zones serve applications reaching mobile devices over a carrier's 5G network, not wired workstations in a studio.
- C is wrong: Outposts would meet the latency target but places AWS-managed racks in the company's facility, which it explicitly does not want.
- D is wrong: CloudFront caches and accelerates content delivery; it does not move the editing workload's compute and storage closer.

**Key phrases:** single-digit millisecond latency · about 30 milliseconds · does not want to run hardware in its own facility
**Hint:** Compute inside the same metropolitan area, still part of your VPC, and no racks of your own to manage.

---

## ALPHA-097: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization, Sustainability

### Question
A company runs nightly data-transformation jobs as Amazon ECS tasks on AWS Fargate. The jobs are stateless, checkpoint their progress and can be restarted safely, and they must finish by morning but have no other deadline. The company wants to cut the cost of these runs. What should a solutions architect recommend?

### Options
- **A.** Keep the tasks on standard Fargate and buy a 3-year Compute Savings Plan sized for the nightly peak.
- **B.** Increase each task's CPU and memory so that the jobs finish sooner.
- **C.** Run the tasks on the Fargate Spot capacity provider and let the scheduler restart any task that receives a termination notice.
- **D.** Move the tasks to Amazon EC2 On-Demand Instances and stop the instances during the day.

### Correct answer: C

**Summary:** Fargate Spot is safe for stateless, checkpointed, restartable batch jobs and cuts compute cost sharply.

### Explanation
- A is wrong: a three-year commitment sized for a nightly peak pays for capacity that is used only a few hours each night, and Spot is cheaper still for interruption-tolerant work.
- B is wrong: more CPU and memory raises the per-second price, so finishing sooner does not necessarily cost less.
- C is correct: Fargate Spot runs tasks on spare capacity at a steep discount, and because these jobs are stateless, checkpointed and restartable, the two-minute termination notice is enough to stop cleanly and retry.
- D is wrong: this reintroduces instances to manage, and stopping them by day only returns to ordinary on-demand economics.

**Key phrases:** stateless, checkpoint their progress · restarted safely · finish by morning · cut the cost
**Hint:** Stateless, checkpointed and safe to restart is the exact workload profile one purchase option was designed for.

---

## ALPHA-098: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization, Sustainability

### Question
An Amazon EFS file system stores 40 TB of engineering data. Files are read heavily for about a week after they are created and then almost never read again, but they must stay instantly available if someone does open one. The company wants to cut EFS storage cost with no application changes. What should a solutions architect do?

### Options
- **A.** Enable EFS lifecycle management so that files not accessed for 30 days move to the Infrequent Access storage class, and enable the policy that moves a file back when it is read again.
- **B.** Recreate the file system as EFS One Zone and copy all of the data into it.
- **C.** Copy files older than 30 days to S3 Glacier Deep Archive and delete them from EFS.
- **D.** Run a nightly job on the clients that compresses files older than 30 days.

### Correct answer: A

**Summary:** EFS lifecycle management auto-moves untouched files to Infrequent Access and back on read, with no app change.

### Explanation
- A is correct: lifecycle management moves files that have not been touched for the configured period into Infrequent Access, which costs far less per GB while keeping them instantly accessible, and moving them back on access means the application never changes.
- B is wrong: One Zone lowers the price but keeps the data in a single Availability Zone, reducing durability against a zone failure, and copying 40 TB is disruptive.
- C is wrong: Deep Archive retrievals take hours, so the files would no longer be instantly available, and the application would have to be changed to read from S3.
- D is wrong: compression needs client-side changes, adds CPU cost, and leaves the data in the expensive storage class.

**Key phrases:** read heavily for about a week · almost never read again · instantly available · no application changes
**Hint:** One file system, two storage classes, with files moved between them automatically.

---

## ALPHA-099: Disaster Recovery & Migration
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Operational Excellence

### Question
A company backs up its on-premises servers to physical tapes with a commercial backup application and ships the tapes to an off-site vault. It wants to keep the same backup software and workflows, stop buying and shipping tapes, and store long-term backups at the lowest possible cost. Which solution meets these requirements?

### Options
- **A.** Deploy an AWS Storage Gateway Tape Gateway on premises, present it to the backup software as a virtual tape library, and archive virtual tapes to S3 Glacier Deep Archive.
- **B.** Use AWS DataSync to copy the backup application's disk staging area to S3 Standard every night.
- **C.** Replace the backup software with AWS Backup and protect the on-premises servers with it.
- **D.** Deploy an Amazon S3 File Gateway and point the backup software at its NFS share instead of the tape library.

### Correct answer: A

**Summary:** A Tape Gateway is a drop-in virtual tape library, so backup software keeps working while data lands in cheap cloud archive storage.

### Explanation
- A is correct: a Tape Gateway presents a virtual tape library over iSCSI, so the existing backup software keeps using its tape workflow unchanged, and archived virtual tapes land in the lowest-cost archive storage instead of being shipped off site.
- B is wrong: copying a staging area nightly leaves the physical tape process in place and stores long-term backups in S3 Standard, which is far from the cheapest option.
- C is wrong: replacing the backup software is the change the company explicitly wants to avoid.
- D is wrong: writing to a file share abandons the tape workflow the backup software is built around, so its catalog and retention handling would have to be reconfigured.

**Key phrases:** physical tapes · keep the same backup software · stop buying and shipping tapes · lowest possible cost
**Hint:** Keep the backup software and its tape workflow; change only what the tapes physically are.

---

## ALPHA-100: Analytics & Data Processing
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** hard · **Pillars:** Cost Optimization, Reliability, Sustainability

### Question
A company runs a permanent 60-node Amazon EMR cluster that is busy for about four hours each night running Apache Spark jobs and idle for the rest of the day. All input and output data is read from and written to Amazon S3. The company wants to cut the cost of this pipeline without materially extending the jobs' runtime. Which combination of actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Store the working data in HDFS on larger core nodes instead of reading from Amazon S3.
- **B.** Use Spot Instances for the task nodes and keep the primary and core nodes On-Demand.
- **C.** Purchase 3-year Standard Reserved Instances for all 60 nodes.
- **D.** Run the pipeline on transient EMR clusters that are created for each nightly run and terminated when the jobs finish.
- **E.** Use Spot Instances for the primary node and the core nodes to maximize the discount.

### Correct answers: B, D (choose 2)

**Summary:** A disposable EMR cluster (data lives in S3) plus Spot task nodes turns a mostly-idle cluster into pay-for-use with low Spot risk.

### Explanation
- A is wrong: moving the working data into HDFS ties it to a running cluster, which prevents the cluster from being transient and adds storage cost.
- B is correct: task nodes hold no HDFS data, so losing one to a Spot interruption costs only the work in flight, which makes them the safe place to take the Spot discount.
- C is wrong: a three-year commitment for a cluster needed four hours a day pays for the 20 idle hours as well.
- D is correct: because the data lives in S3 rather than on the cluster, the cluster itself is disposable, so creating it for each nightly run and terminating it afterwards stops paying for about 20 idle hours every day.
- E is wrong: losing the primary node ends the cluster and losing core nodes loses HDFS data, so Spot interruptions there can fail the whole run.

**Key phrases:** busy for about four hours each night · idle for the rest of the day · read from and written to Amazon S3 · cut the cost · Select TWO
**Hint:** The data already lives in S3, so ask what the cluster is really for, and which node type can be lost without losing data.

---

## ALPHA-101: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company plans to grow from 5 to about 60 AWS accounts over the next year. It wants each new account created from a standard template with a preconfigured VPC and centralized logging, wants guardrails that prevent common misconfigurations, and wants a dashboard showing which accounts drift from the standard. The company wants to avoid building this itself. What should a solutions architect recommend?

### Options
- **A.** Set up AWS Control Tower to create a landing zone, provision accounts through Account Factory, apply its mandatory and optional controls, and use its dashboard for drift and compliance.
- **B.** Deploy AWS Config aggregators in a central account and ask teams to fix the findings.
- **C.** Write AWS CloudFormation StackSets that each team runs by hand after creating an account.
- **D.** Create the accounts manually in AWS Organizations and attach a service control policy to each one.

### Correct answer: A

**Summary:** Control Tower automates a multi-account landing zone: standard account provisioning, guardrails, and drift reporting in one place.

### Explanation
- A is correct: Control Tower builds a multi-account landing zone on AWS Organizations, provisions new accounts from a standard blueprint through Account Factory, applies preventive and detective controls automatically, and reports drift and non-compliant accounts in one dashboard.
- B is wrong: Config aggregators report configuration compliance after the fact and do nothing to provision accounts or prevent misconfiguration.
- C is wrong: StackSets deploy resources but leave account creation, guardrails and drift reporting to be designed and operated by hand.
- D is wrong: Organizations with SCPs provides preventive guardrails but neither standardized account provisioning nor drift reporting.

**Key phrases:** 5 to about 60 AWS accounts · standard template · guardrails · drift from the standard · avoid building this itself
**Hint:** One service builds the landing zone, vends accounts from a template, and reports drift.

---

## ALPHA-102: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security

### Question
A security review of a company's AWS Organizations management account finds that the root user has an access key, has no multi-factor authentication, and its password is shared by three administrators. The company wants to follow AWS best practice while keeping a way to perform the few tasks that require root. Which combination of actions should a solutions architect recommend? (Select TWO.)

### Options
- **A.** Give each administrator an identity in AWS IAM Identity Center and have them work through permission sets instead of sharing root.
- **B.** Attach an IAM policy to the root user that allows only read-only actions.
- **C.** Create one shared IAM user with administrator access for the three administrators to use instead of root.
- **D.** Delete the root user of the management account.
- **E.** Delete the root user's access keys and enable MFA on the root user, storing the device securely for break-glass use.

### Correct answers: A, E (choose 2)

**Summary:** Remove the root user's access keys and add MFA, and give day-to-day admin work to named identities instead of root.

### Explanation
- A is correct: day-to-day administration belongs to individual identities with permission sets, so every action is attributable to a person and root is reserved for exceptional tasks.
- B is wrong: IAM policies cannot be attached to the root user, which is exactly why root is controlled by protecting its credentials instead.
- C is wrong: sharing any credential destroys attribution and recreates the problem the review found.
- D is wrong: the root user cannot be deleted; every AWS account keeps one for its lifetime.
- E is correct: root access keys grant unrestricted programmatic access and cannot be scoped, so they should not exist, and MFA protects the credentials that remain for the few tasks only root can perform.

**Key phrases:** root user has an access key · no multi-factor authentication · password is shared · few tasks that require root · Select TWO
**Hint:** Root cannot be deleted or restricted by an IAM policy, so the answer is about its credentials and about what people use day to day.

---

## ALPHA-103: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security

### Question
A compliance team must know continuously, across 40 accounts, which Amazon S3 buckets, IAM roles, AWS KMS keys and Amazon SQS queues can be accessed by principals outside the organization, and must review each finding. The team does not want to read every resource policy by hand. What should a solutions architect recommend?

### Options
- **A.** Enable the AWS Config required-tags managed rule across the organization.
- **B.** Create an IAM Access Analyzer external access analyzer with the organization as its zone of trust in a delegated administrator account, and review its findings.
- **C.** Schedule an AWS Lambda function that reads every resource policy and flags wildcard principals.
- **D.** Enable Amazon GuardDuty in every account and review its findings.

### Correct answer: B

**Summary:** IAM Access Analyzer continuously reports which resources are reachable from outside a trusted zone, across an entire organization.

### Explanation
- A is wrong: the required-tags rule checks tagging, not who is able to access a resource.
- B is correct: IAM Access Analyzer applies automated reasoning to resource policies and reports which resources can be reached from outside the chosen zone of trust, covering bucket, role, key and queue policies among others, and an organization analyzer in a delegated administrator account covers every account continuously.
- C is wrong: evaluating policies correctly is the hard part that Access Analyzer solves with formal reasoning, and a wildcard search misses conditions and explicit cross-account grants.
- D is wrong: GuardDuty detects active threats from log analysis; it does not evaluate resource policies for external access.

**Key phrases:** across 40 accounts · principals outside the organization · does not want to read every resource policy by hand
**Hint:** Which service reasons over resource policies to report what is reachable from outside your organization?

---

## ALPHA-104: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security

### Question
A company encrypts objects in Amazon S3 with a customer managed AWS KMS key in eu-west-1. A new policy requires that the key material be rotated every year with no re-encryption of existing objects, and that a disaster recovery copy of the bucket in eu-central-1 be readable without cross-Region KMS calls on every request. What should a solutions architect do?

### Options
- **A.** Export the key material from the existing key and import it into a new key in eu-central-1.
- **B.** Change the bucket to SSE-S3 so that AWS manages rotation and Regional availability.
- **C.** Create a multi-Region customer managed key with a replica in eu-central-1, enable automatic annual key rotation, and configure S3 Cross-Region Replication to encrypt the destination objects with the replica key.
- **D.** Create an independent customer managed key in eu-central-1 and rotate both keys by hand each year.

### Correct answer: C

**Summary:** KMS automatic annual rotation keeps the key ID stable so nothing needs re-encrypting, and multi-Region keys let replicas decrypt locally.

### Explanation
- A is wrong: key material generated by AWS KMS cannot be exported, and imported material would not stay in step with rotation.
- B is wrong: SSE-S3 gives up the customer managed key the company requires, along with its key policy and rotation control.
- C is correct: automatic rotation creates new key material each year while the key ID stays the same and old backing keys are retained, so existing objects remain readable with no re-encryption, and a multi-Region replica holds the same key material in the second Region so replicated objects are decrypted locally.
- D is wrong: an independent key has different key material, so every replicated object would have to be re-encrypted, and manual rotation is the operational burden the policy is trying to remove.

**Key phrases:** rotated every year · no re-encryption of existing objects · without cross-Region KMS calls
**Hint:** Two distinct KMS features: one changes key material without touching existing ciphertext, the other puts the same key material in another Region.

---

## ALPHA-105: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security

### Question
A payments company must run its own certificate authority and perform signing operations in hardware that is single-tenant and under the company's exclusive control, so that AWS operators cannot access the key material. The application performs cryptographic operations through the PKCS #11 interface. Which solution meets these requirements?

### Options
- **A.** Store the private keys in AWS Secrets Manager encrypted with a customer managed key.
- **B.** Use AWS KMS with a customer managed key and enable automatic key rotation.
- **C.** Deploy an AWS CloudHSM cluster in the VPC and have the application use its PKCS #11 library.
- **D.** Use AWS KMS with imported key material and set an expiration date.

### Correct answer: C

**Summary:** CloudHSM gives single-tenant hardware key storage with standard interfaces, for workloads that can't allow any AWS access to key material.

### Explanation
- A is wrong: Secrets Manager stores and rotates secrets; it performs no signing operations on behalf of an application.
- B is wrong: KMS is a managed multi-tenant service, so even with a customer managed key the company does not have exclusive control of the hardware, and KMS does not offer a PKCS #11 interface.
- C is correct: CloudHSM provides single-tenant hardware security modules that only the company can access, with no AWS access to the key material, and it exposes standard interfaces including PKCS #11, which is what a private certificate authority and signing application need.
- D is wrong: importing key material changes where the material originates, not the multi-tenant nature of the service or the interfaces it exposes.

**Key phrases:** single-tenant · exclusive control · AWS operators cannot access the key material · PKCS #11
**Hint:** Single-tenant hardware, your exclusive control, and a standard cryptographic interface the application already speaks.

---

## ALPHA-106: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security

### Question
Two hundred remote employees must reach internal applications running on private subnets in a VPC, with no public endpoints exposed. Access must be authenticated against the company's existing identity provider and scoped by group, so that contractors reach fewer applications than staff, and it must work from laptops anywhere on the internet. Which solution meets these requirements?

### Options
- **A.** Deploy AWS Client VPN with federated authentication to the identity provider, and use authorization rules to grant each group access to only its own subnets.
- **B.** Give each employee a bastion host in a public subnet to connect through.
- **C.** Put the applications behind an internet-facing Application Load Balancer whose security group allows only employees' home IP addresses.
- **D.** Create an AWS Site-to-Site VPN connection between each employee's home router and the VPC.

### Correct answer: A

**Summary:** AWS Client VPN federates to an existing IdP via SAML and applies per-group authorization, with no public endpoints exposed.

### Explanation
- A is correct: Client VPN is a managed remote-access VPN that authenticates users through SAML federation with the company's identity provider and applies authorization rules per group, so contractors reach only their subset and nothing is published on the internet.
- B is wrong: a bastion per employee multiplies cost and public attack surface and still needs its own access control.
- C is wrong: this publishes the applications on the internet and depends on home IP addresses that change.
- D is wrong: Site-to-Site VPN joins networks rather than individual roaming laptops, and managing 200 home routers is impractical.

**Key phrases:** Two hundred remote employees · no public endpoints exposed · scoped by group · from laptops anywhere on the internet
**Hint:** A managed remote-access VPN whose users are authenticated by your own identity provider.

---

## ALPHA-107: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Operational Excellence, Reliability

### Question
Fifty partner companies upload nightly files to a company's on-premises SFTP server using their existing SFTP clients and SSH keys. The company wants the files to land directly in Amazon S3, wants the partners' clients and keys to stay unchanged, and does not want to run any servers. Which solution meets these requirements?

### Options
- **A.** Use AWS DataSync to pull files from each partner's server every night.
- **B.** Create an AWS Transfer Family SFTP-enabled server backed by the S3 bucket and import each partner's SSH public key.
- **C.** Ask the partners to switch to the AWS CLI and upload with the s3 cp command.
- **D.** Run an SFTP server on Amazon EC2 in an Auto Scaling group and copy uploads into S3 with a cron job.

### Correct answer: B

**Summary:** AWS Transfer Family is a managed SFTP endpoint that writes straight into S3 using clients' existing credentials, with no servers to run.

### Explanation
- A is wrong: DataSync moves data through an agent between file systems and AWS storage; it is not an inbound SFTP service that partners can push to.
- B is correct: AWS Transfer Family provides a fully managed SFTP endpoint that writes straight into S3, supports the partners' existing clients and SSH keys, and requires no servers to patch or scale.
- C is wrong: asking 50 partners to change how they integrate is exactly what the company wants to avoid.
- D is wrong: this keeps a fleet of SFTP servers to operate and adds a copy step that can lag or fail.

**Key phrases:** existing SFTP clients and SSH keys · land directly in Amazon S3 · does not want to run any servers
**Hint:** Managed SFTP in front of S3, with the partners' existing keys imported as they are.

---

## ALPHA-108: Monitoring, Management & Governance
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** hard · **Pillars:** Reliability, Operational Excellence

### Question
A company's disaster recovery plan fails over to a second Region where it normally runs almost nothing. A game day showed that failover could not launch enough Amazon EC2 instances and hit an Elastic IP address limit, because the account's quotas in that Region were still at their defaults. The company wants failover to succeed and wants warning before quotas become a problem again. Which combination of actions should a solutions architect take? (Select TWO.)

### Options
- **A.** Run the disaster recovery stack at full capacity at all times so that the quota is already in use.
- **B.** Rely on AWS Support to raise the quotas automatically during an incident.
- **C.** Create CloudWatch alarms on the Service Quotas usage metrics for the relevant quotas so the team is warned as usage approaches the limit.
- **D.** Move the disaster recovery workloads into the primary Region's account so that they share its quotas.
- **E.** Request quota increases in the disaster recovery Region in advance, sized for the full failover capacity.

### Correct answers: C, E (choose 2)

**Summary:** Service quotas are per account/Region -- raise DR-Region limits proactively and alarm on usage before a real failover hits them.

### Explanation
- A is wrong: running at full capacity permanently defeats the point of a low-cost standby and costs far more than raising a quota.
- B is wrong: quota increase requests are reviewed and are not guaranteed to be immediate, so a recovery plan cannot depend on one.
- C is correct: Service Quotas publishes usage metrics to CloudWatch, so an alarm at a percentage of the applied quota warns the team before a limit is reached again.
- D is wrong: quotas are per Region within an account, so consolidating does not pool limits and it removes the second Region the plan depends on.
- E is correct: quotas apply per account and per Region, so the disaster recovery Region needs its limits raised beforehand; requesting an increase during an outage adds delay exactly when there is none to spare.

**Key phrases:** quotas in that Region were still at their defaults · failover to succeed · warning before quotas become a problem · Select TWO
**Hint:** Quotas are counted per account and per Region. One action fixes the failure, the other gives early warning.

---

## ALPHA-109: Monitoring, Management & Governance
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Operational Excellence, Reliability

### Question
A company runs a serverless API built from Amazon API Gateway, eight AWS Lambda functions and Amazon DynamoDB. Some requests take several seconds, but CloudWatch metrics show that every function's average duration is low. The team needs to see, for an individual slow request, how much time each component and downstream call consumed. What should a solutions architect recommend?

### Options
- **A.** Enable CloudWatch detailed monitoring on every Lambda function.
- **B.** Enable AWS X-Ray tracing on API Gateway and the Lambda functions and use its service map and individual traces.
- **C.** Build a CloudWatch dashboard that combines each function's duration metric.
- **D.** Send each function's logs to CloudWatch Logs and search them for slow entries.

### Correct answer: B

**Summary:** X-Ray traces a single request across every service hop, revealing where latency actually happens when averages hide it.

### Explanation
- A is wrong: detailed monitoring changes how often metrics are published, not the ability to follow one request across components.
- B is correct: X-Ray follows a single request end to end, recording a segment for each service and downstream call, so the service map and individual traces show exactly which component contributed the latency, which averaged metrics cannot.
- C is wrong: a dashboard of averages hides the individual slow requests, which is the problem being investigated.
- D is wrong: logs are per function and carry no shared request identifier by default, so reconstructing one request by hand is slow and unreliable.

**Key phrases:** several seconds · average duration is low · for an individual slow request · each component and downstream call
**Hint:** Averages hide a slow request. You need the path of one request across every hop.

---

## ALPHA-110: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence

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

## ALPHA-111: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Cost Optimization

### Question
A company exposes a public REST API through Amazon API Gateway to hundreds of third-party developers on free and paid tiers. It must cap each developer's request rate and monthly quota according to their tier, identify each caller, and protect the backend from a single client's traffic spike. Which solution meets these requirements with the LEAST custom code?

### Options
- **A.** Ask developers to limit themselves and watch the API's CloudWatch metrics.
- **B.** Issue an API key to each developer and associate the keys with API Gateway usage plans that set throttling rates and monthly quotas per tier.
- **C.** Add a Lambda authorizer that counts each caller's requests in Amazon DynamoDB and rejects those over the limit.
- **D.** Put AWS WAF in front of the API with a rate-based rule that applies to all callers.

### Correct answer: B

**Summary:** API Gateway usage plans attach per-API-key throttling and quotas, enforced before requests ever reach the backend.

### Explanation
- A is wrong: self-limiting is not enforcement, and a dashboard shows the spike only after the backend has been affected.
- B is correct: usage plans attach throttling rates and monthly quotas to API keys, so each developer is identified and limited according to their tier and API Gateway enforces it before requests reach the backend, with nothing to build.
- C is wrong: this rebuilds metering and throttling as custom code, which the requirement rules out, and it adds latency and a datastore to every call.
- D is wrong: a rate-based WAF rule limits by IP address rather than by developer, so it cannot express per-customer tiers or monthly quotas.

**Key phrases:** free and paid tiers · cap each developer's request rate and monthly quota · identify each caller · LEAST custom code
**Hint:** API Gateway has a built-in metering construct that ties a caller's key to a rate and a quota.

---

## ALPHA-112: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization, Sustainability

### Question
A research team submits thousands of independent containerized jobs each night. The jobs need different amounts of CPU and memory, some cannot start until others finish, and the team wants compute capacity to appear when jobs are queued and disappear when the queue drains, without managing clusters or scaling logic. Which solution meets these requirements?

### Options
- **A.** Keep a permanent Amazon ECS cluster on Amazon EC2 sized for the nightly peak and schedule tasks on it.
- **B.** Launch one EC2 instance per job with user data that runs the container and then shuts the instance down.
- **C.** Run each job as an AWS Lambda function triggered from an Amazon SQS queue.
- **D.** Submit the work to AWS Batch job queues backed by a managed compute environment, using job definitions for resources and job dependencies for ordering.

### Correct answer: D

**Summary:** AWS Batch queues, sizes, schedules and scales compute for large numbers of independent jobs with dependencies, with nothing to manage.

### Explanation
- A is wrong: a cluster sized for the nightly peak sits idle the rest of the day and still leaves the team managing capacity.
- B is wrong: one instance per job means thousands of launches to orchestrate, retry and track by hand.
- C is wrong: Lambda caps each invocation at 15 minutes with a fixed resource profile, which does not fit long or varied research jobs, and it has no built-in dependency handling.
- D is correct: AWS Batch queues the jobs, provisions and scales a compute environment to match what is queued, places each job according to the vCPU and memory in its job definition, honours dependencies between jobs, and scales back down when the queue empties.

**Key phrases:** thousands of independent containerized jobs · some cannot start until others finish · without managing clusters or scaling logic
**Hint:** Which managed service takes a queue of container jobs and creates exactly the compute they need?

---

## ALPHA-113: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence

### Question
A company receives daily CSV exports from 30 suppliers into Amazon S3. The files have inconsistent column names and there is no catalog, and analysts want to query the data with Amazon Athena in a columnar format. The company wants a serverless pipeline that discovers the schema, applies the column mapping and writes partitioned Parquet, without managing servers. Which solution meets these requirements?

### Options
- **A.** Run a nightly Amazon EMR cluster with a custom Spark job to convert the files.
- **B.** Load the CSV files into an Amazon Redshift cluster and let the analysts query them there.
- **C.** Have each analyst run Athena CREATE TABLE AS SELECT statements over the raw CSV files.
- **D.** Run an AWS Glue crawler to catalog the incoming files, then an AWS Glue ETL job that applies the mapping and writes partitioned Parquet for Athena.

### Correct answer: D

**Summary:** A Glue crawler infers schema into the Data Catalog, and a Glue ETL job normalizes and writes partitioned Parquet for fast Athena queries.

### Explanation
- A is wrong: EMR can do the transformation but means running and tuning clusters, which the serverless requirement excludes.
- B is wrong: loading into Redshift adds a warehouse to size and pay for when the requirement is to query files that stay in S3.
- C is wrong: querying raw CSV keeps every scan slow and expensive, and ad hoc statements by each analyst create inconsistent copies instead of a pipeline.
- D is correct: a Glue crawler infers each supplier's schema into the Data Catalog, and a serverless Glue ETL job applies the mapping and writes partitioned Parquet, which is the format that makes Athena queries fast and cheap, with no servers to manage.

**Key phrases:** inconsistent column names · columnar format · discovers the schema · without managing servers
**Hint:** One service both discovers the schema into a catalog and runs the serverless transformation job.

---

## ALPHA-114: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A company keeps curated sales data in Amazon S3 and queries it with Amazon Athena. Two hundred business users need interactive dashboards with filters, and the dashboards must stay responsive at month-end when many users open them at once. The company does not want to run BI servers. Which solution meets these requirements?

### Options
- **A.** Export query results to spreadsheets each morning and email them to the users.
- **B.** Build the dashboards in Amazon QuickSight and import the data into SPICE so that queries are served from its in-memory engine.
- **C.** Give every business user access to the Athena console with a set of saved queries.
- **D.** Run a self-managed BI server on Amazon EC2 behind an Application Load Balancer.

### Correct answer: B

**Summary:** QuickSight SPICE caches data in memory so dashboards stay fast for many concurrent users without re-querying the source each time.

### Explanation
- A is wrong: emailed spreadsheets are static, so users cannot filter or explore, and the data is stale as soon as it is sent.
- B is correct: QuickSight is a serverless BI service, and importing a dataset into SPICE serves dashboard interactions from memory, so hundreds of concurrent readers stay fast without every filter change running a fresh Athena scan.
- C is wrong: the console is a query tool rather than a dashboard, and each filter change would run another billed scan.
- D is wrong: a BI server on EC2 is infrastructure to size, patch and scale, which the company does not want.

**Key phrases:** interactive dashboards · Two hundred business users · responsive at month-end · does not want to run BI servers
**Hint:** Serverless dashboards, with an in-memory layer that absorbs many concurrent readers.

---

## ALPHA-115: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Security

### Question
A 300 TB data lake in a single Amazon S3 bucket is shared by a dozen teams in different AWS accounts, each needing access to its own prefix, and one team's application must reach the data only from its own VPC. The bucket policy has grown close to the 20 KB policy size limit and is hard to review. What should a solutions architect do?

### Options
- **A.** Enable S3 Object Lock and tag each prefix with the owning team.
- **B.** Split the data lake into a dozen buckets, one per team.
- **C.** Create an S3 access point for each team with its own access point policy, make the restricted team's access point VPC-only, and have applications use the access points instead of the bucket name.
- **D.** Move the team-specific rules into IAM policies in each team's account and delete the bucket policy.

### Correct answer: C

**Summary:** S3 Access Points give each team its own scoped endpoint and policy, optionally restricted to a single VPC.

### Explanation
- A is wrong: Object Lock governs retention and immutability, and tags do not create per-team access boundaries on a shared bucket.
- B is wrong: splitting means moving 300 TB, breaking every existing path, and losing the single data lake that the analytics tools expect.
- C is correct: access points give each team its own endpoint and policy for the prefix it uses, which keeps the bucket policy small and reviewable, and an access point can be restricted to a VPC so that one team's traffic must arrive privately.
- D is wrong: the teams are in other accounts, and cross-account access to S3 requires a resource policy, so IAM policies alone cannot grant it.

**Key phrases:** dozen teams in different AWS accounts · only from its own VPC · 20 KB policy size limit
**Hint:** Give each consumer its own named endpoint and policy instead of growing one bucket policy.

---

## ALPHA-116: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Reliability

### Question
A company runs the same web application in eu-west-1, us-east-1 and ap-southeast-1. For data residency, requests from users in Germany must always be served from eu-west-1 regardless of latency. All other users should reach whichever Region answers fastest for them, and traffic must move away from an unhealthy Region automatically. Which Amazon Route 53 configuration meets these requirements?

### Options
- **A.** Use geoproximity routing with a bias toward eu-west-1 for all users.
- **B.** Use latency-based routing for all users with health checks, relying on eu-west-1 usually being fastest for German users.
- **C.** Use weighted routing with a higher weight on eu-west-1 and health checks on each record.
- **D.** Create a geolocation record for Germany that points to eu-west-1, add latency records for the three Regions as the default location, and associate a health check with every record.

### Correct answer: D

**Summary:** Route 53 geolocation routing pins one country to a required Region, with latency routing and health checks handling everyone else.

### Explanation
- A is wrong: geoproximity shifts traffic by distance and bias for every user, so it neither guarantees Germany stays in eu-west-1 nor gives the fastest Region to everyone else.
- B is wrong: latency routing can send German users to another Region whenever it measures faster, which breaks the residency requirement.
- C is wrong: weighted routing distributes a share of traffic regardless of where the user is or which Region responds fastest.
- D is correct: geolocation routing matches the user's country and takes precedence for Germany whatever the latency, a default set of latency records serves everyone else from the fastest Region, and health checks let Route 53 stop returning an unhealthy endpoint.

**Key phrases:** users in Germany must always be served · regardless of latency · whichever Region answers fastest · move away from an unhealthy Region
**Hint:** One requirement is about where the user is, the other about which Region is fastest. Route 53 has a policy for each, and records can be combined.

---

## ALPHA-117: Compute & Serverless
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
Developers use large memory-optimized Amazon EC2 instances for an application that takes about 20 minutes to load a large in-memory dataset at start-up. The instances are unused overnight and at weekends, but developers want to resume work within a couple of minutes with the dataset already loaded. Which approach reduces cost while meeting that expectation?

### Options
- **A.** Enable hibernation on the instances and hibernate them when idle, so that memory is saved to the encrypted root EBS volume and restored on start.
- **B.** Move the workload to Spot Instances and accept interruptions overnight.
- **C.** Terminate the instances each night and launch replacements from an AMI in the morning.
- **D.** Stop the instances when they are idle and start them again each morning.

### Correct answer: A

**Summary:** EC2 hibernation persists RAM to disk and stops billing, so a slow-loading dataset survives without paying for idle instance time.

### Explanation
- A is correct: hibernation writes the instance's memory to its encrypted root volume and stops the instance, so no instance hours are billed while it is hibernated, and starting it restores the operating system and the loaded dataset instead of rebuilding them.
- B is wrong: Spot suits interruption-tolerant batch work rather than interactive developer sessions, and it does nothing about start-up time.
- C is wrong: launching from an AMI still reloads the dataset and discards any local state.
- D is wrong: stopping also ends instance charges, but a normal start boots the operating system and reloads the dataset, which is the 20-minute wait the developers want to avoid.

**Key phrases:** 20 minutes to load a large in-memory dataset · unused overnight · resume work within a couple of minutes
**Hint:** Stopping an instance saves money but throws away memory. Which EC2 feature preserves the memory too?

---

## ALPHA-118: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization

### Question
A genomics institute publishes 500 TB of reference datasets in Amazon S3 to thousands of authenticated researchers at other institutions. The institute is willing to pay to store the data but not for the data transfer and request charges that downloads generate. Which solution meets this requirement?

### Options
- **A.** Move the datasets to S3 Glacier Deep Archive to lower the transfer cost.
- **B.** Serve the datasets through Amazon CloudFront with compression enabled.
- **C.** Give researchers presigned URLs with a short expiry for each download.
- **D.** Enable Requester Pays on the bucket so that requesters are billed for the requests and data transfer of their own downloads.

### Correct answer: D

**Summary:** S3 Requester Pays shifts request/transfer costs to authenticated requesters while the owner only pays for storage.

### Explanation
- A is wrong: a colder storage class lowers storage price and adds retrieval fees; it does not move transfer charges to the downloader.
- B is wrong: CloudFront can reduce the per-GB rate, but the publisher still pays for delivery.
- C is wrong: presigned URLs control who may download and for how long, while the bucket owner is still billed.
- D is correct: with Requester Pays the requester's AWS account is billed for requests and data transfer while the bucket owner keeps paying only for storage, and requesters must be authenticated so that the charges can be attributed.

**Key phrases:** 500 TB of reference datasets · pay to store the data but not for the data transfer · authenticated researchers
**Hint:** There is a bucket setting that moves request and transfer charges to the account doing the downloading.

---

## ALPHA-119: Databases & Caching
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** medium · **Pillars:** Cost Optimization, Performance Efficiency

### Question
A manufacturing company ingests 2 million sensor readings per minute and queries them almost entirely as time-windowed aggregates over the last 7 days, while keeping 5 years of history for occasional trend analysis. Storing everything in Amazon RDS has become expensive. The team wants a cost-effective purpose-built option that tiers old data automatically. Which solution should a solutions architect recommend?

### Options
- **A.** Load the readings into Amazon Redshift and run the 7-day queries there.
- **B.** Store each reading as an item in Amazon DynamoDB with a 5-year TTL.
- **C.** Store the readings in Amazon Timestream, which keeps recent data in a fast in-memory store and moves older data to cheaper storage automatically.
- **D.** Keep Amazon RDS for MySQL and add read replicas for the analytical queries.

### Correct answer: C

**Summary:** Amazon Timestream automatically tiers time-series data by age, keeping recent data fast and older data cheap.

### Explanation
- A is wrong: Redshift is a warehouse built for large analytical scans and would run continuously for what is mostly recent-window querying.
- B is wrong: DynamoDB can absorb the writes but offers no time series aggregation, so 7-day windows would need scans or a separate aggregation pipeline, and 5 years of items is costly.
- C is correct: Timestream is a purpose-built time series database with built-in tiering, keeping recent data in a fast tier for windowed queries, ageing older data into low-cost storage automatically, and providing time series functions for aggregation.
- D is wrong: a relational engine stores time series inefficiently at this ingest rate, and read replicas multiply cost without changing the storage model.
- Note: AWS closed Amazon Timestream for LiveAnalytics to new customers on June 20, 2025; existing customers can keep using it, and AWS recommends Amazon Timestream for InfluxDB for new time-series workloads. C remains the intended answer to this question.

**Key phrases:** 2 million sensor readings per minute · time-windowed aggregates · 5 years of history · tiers old data automatically
**Hint:** Match the data shape to a purpose-built engine that tiers hot and cold data for you.

---

## ALPHA-120: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** hard · **Pillars:** Cost Optimization, Reliability

### Question
A company runs a high-throughput internal service on Amazon EC2 instances spread across three Availability Zones behind an internal Network Load Balancer, with client applications in the same VPC and the same Availability Zones. The service moves petabytes per month, and the bill shows large inter-Availability Zone data transfer charges. Which combination of changes will reduce those charges? (Select TWO.)

### Options
- **A.** Turn off cross-zone load balancing on the Network Load Balancer so that each zonal node forwards only to targets in its own Availability Zone.
- **B.** Have clients connect to the load balancer's zonal DNS name for their own Availability Zone, keeping healthy targets registered in every zone.
- **C.** Enable sticky sessions so that each client keeps talking to the same target.
- **D.** Move all of the instances into a single Availability Zone.
- **E.** Turn on cross-zone load balancing so that requests are spread evenly across all targets.

### Correct answers: A, B (choose 2)

**Summary:** Disabling NLB cross-zone load balancing plus zone-aware DNS keeps traffic, and its cost, inside each Availability Zone.

### Explanation
- A is correct: with cross-zone load balancing disabled, a Network Load Balancer node forwards only to targets in its own Availability Zone, so requests stop crossing zones and the per-GB inter-zone charge for that traffic disappears.
- B is correct: resolving the zone-specific DNS name keeps each client's request inside its own Availability Zone from the start, as long as that zone has healthy targets to serve it.
- C is wrong: stickiness pins a client to one target that may well be in another Availability Zone, so it does not prevent cross-zone traffic.
- D is wrong: a single Availability Zone removes the charge but also removes the service's ability to survive the loss of a zone.
- E is wrong: cross-zone load balancing distributes requests to targets in every zone, which is precisely what generates the inter-zone traffic being billed.

**Key phrases:** inter-Availability Zone data transfer charges · petabytes per month · Select TWO
**Hint:** Inter-zone charges come from requests crossing zones. Two settings decide whether they do.

---

## ALPHA-121: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** hard · **Pillars:** Security, Operational Excellence

### Question
A company uses AWS Organizations with all features enabled and has 60 member accounts, with new accounts created every week. The security team must ensure that every Application Load Balancer and Amazon API Gateway stage in every account, including accounts and resources created in the future, is protected by a standard set of AWS WAF rules. Any resource that is not protected must be fixed automatically. Which combination of steps will meet these requirements with the LEAST operational overhead? (Select TWO.)

### Options
- **A.** Designate a delegated administrator account for AWS Firewall Manager and create an AWS WAF policy scoped to the organization that applies the standard rule groups, with automatic remediation turned on.
- **B.** Deploy an AWS Config custom rule in each account that detects load balancers without a web ACL and emails the resource owner through Amazon SNS.
- **C.** Use AWS CloudFormation StackSets to deploy a web ACL with the standard rules into every account, and ask each application team to associate it with their load balancers and API stages.
- **D.** Make sure AWS Config is enabled and recording in every account and Region that Firewall Manager policies cover.
- **E.** Attach a service control policy that denies elasticloadbalancing:CreateLoadBalancer unless the request includes a web ACL.

### Correct answers: A, D (choose 2)

**Summary:** AWS Firewall Manager applies WAF policies across an organization, including new accounts, and fixes gaps automatically; it needs AWS Config recording to work.

### Explanation
- A is correct: a Firewall Manager WAF policy scoped to the organization is applied to existing and newly created accounts and in-scope resources, and automatic remediation associates the standard web ACL with any resource that is missing it.
- B is wrong: it only detects and notifies; nothing is fixed automatically, and a rule per account is extra work to maintain.
- C is wrong: deploying the web ACL does not associate it with anything, relies on every team to act, and does nothing for resources created later.
- D is correct: Firewall Manager depends on AWS Config to discover resources and evaluate compliance, so Config must be recording in each covered account and Region for the policy to find and remediate resources.
- E is wrong: the CreateLoadBalancer request has no web ACL parameter or condition key to check, and an SCP cannot associate WAF rules with resources.

**Key phrases:** every account · created in the future · fixed automatically · LEAST operational overhead · Select TWO
**Hint:** One service enforces WAF rules across an organization and fixes resources that are out of line. What does it rely on to discover those resources?

---

## ALPHA-122: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company runs 40 AWS accounts in AWS Organizations and uses Amazon GuardDuty, Amazon Inspector and Amazon Macie in every account and in three Regions. The security team wants a single place to view and prioritize findings from all of these services across every account and Region. The team also wants accounts checked continuously against AWS best-practice security controls, with minimal custom code. Which solution meets these requirements?

### Options
- **A.** Use AWS Trusted Advisor from the management account with the organizational view to review security checks for all accounts.
- **B.** Send findings from each service to Amazon EventBridge, deliver them through Amazon Data Firehose to a central S3 bucket, query them with Amazon Athena, and write custom AWS Config rules for the best-practice checks.
- **C.** Enable Amazon Detective in a central account and invite all member accounts so that investigators can explore findings.
- **D.** Enable AWS Security Hub with a delegated administrator account, turn it on automatically for new accounts, configure cross-Region aggregation, and enable the AWS Foundational Security Best Practices standard.

### Correct answer: D

**Summary:** Security Hub gathers security findings across accounts and Regions and continuously checks each account against best-practice standards.

### Explanation
- A is wrong: Trusted Advisor offers a limited set of checks and does not collect GuardDuty, Inspector or Macie findings.
- B is wrong: it can work, but it is a custom pipeline, and every best-practice check would have to be written and maintained by hand.
- C is wrong: Detective helps investigate the root cause of a finding through behavior graphs; it is not the central findings dashboard and does not run best-practice security standards.
- D is correct: Security Hub automatically collects findings from GuardDuty, Inspector and Macie into one standard format, aggregates them across accounts and Regions into the administrator account, and its security standards continuously score each account against best-practice controls.

**Key phrases:** single place · all of these services · every account and Region · best-practice security controls · minimal custom code
**Hint:** You need one service that both gathers findings from other security services and scores accounts against a standard.

---

## ALPHA-123: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability

### Question
A company serves static website assets through an Amazon CloudFront distribution with an S3 bucket in us-east-1 as the origin. S3 Cross-Region Replication keeps a copy of every object in a second bucket in us-west-2. The company wants CloudFront to keep serving viewer GET requests automatically if the primary bucket returns server errors or cannot be reached, without any DNS changes and without custom code. Which solution meets these requirements?

### Options
- **A.** Attach a Lambda@Edge origin-request function that checks the health of the primary bucket and rewrites the origin to the us-west-2 bucket when it is unhealthy.
- **B.** Add the us-west-2 bucket as a second origin, create an origin group with the us-east-1 bucket as primary and the us-west-2 bucket as secondary, set failover on 500, 502, 503 and 504 status codes, and use the origin group in the cache behavior.
- **C.** Create a second CloudFront distribution that uses the us-west-2 bucket, and put Amazon Route 53 failover records with health checks in front of both distributions.
- **D.** Enable CloudFront Origin Shield in us-east-1 so that fewer requests reach the primary bucket.

### Correct answer: B

**Summary:** A CloudFront origin group fails over from the primary origin to the secondary on chosen error codes, with no DNS change or code.

### Explanation
- A is wrong: it is custom code that runs on every request, adding latency and cost for something CloudFront already does.
- B is correct: an origin group makes CloudFront send the request to the secondary origin whenever the primary returns one of the chosen status codes or times out, with no DNS change and no code. Origin failover applies to GET, HEAD and OPTIONS requests, which fits static content.
- C is wrong: this relies on a DNS change, and viewers wait for record TTLs to expire, when the requirement is to avoid DNS changes.
- D is wrong: Origin Shield adds a caching layer that reduces load on the origin, but it gives no failover when the origin fails.

**Key phrases:** keep serving · automatically · without any DNS changes · without custom code
**Hint:** CloudFront can retry a request against a second origin by itself. What is that feature called?

---

## ALPHA-124: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** hard · **Pillars:** Reliability, Performance Efficiency

### Question
An AWS Lambda function processes messages from an Amazon SQS standard queue through an event source mapping with a batch size of 10. Sometimes one message in a batch contains bad data and the function throws an error. The whole batch then becomes visible again, so messages that were already processed successfully are processed again. The company wants only the failed messages to be retried, while still processing messages in batches for efficiency. Which solution meets these requirements?

### Options
- **A.** Turn on ReportBatchItemFailures for the event source mapping and have the function catch errors per message and return the IDs of the failed messages in a batchItemFailures list.
- **B.** Set the queue visibility timeout to six times the function timeout.
- **C.** Set the batch size to 1 so that each message is processed and retried on its own.
- **D.** Configure an on-failure destination on the Lambda function that sends failed events to another SQS queue.

### Correct answer: A

**Summary:** ReportBatchItemFailures lets a Lambda SQS consumer return only the failed message IDs, so successful messages in the batch are not retried.

### Explanation
- A is correct: with partial batch responses, Lambda deletes the messages that succeeded and returns only the reported message IDs to the queue, so good messages are not processed again and batching is kept.
- B is wrong: this is the recommended setting to avoid duplicate processing while a batch is still running, but it does not change the fact that one error returns the whole batch to the queue.
- C is wrong: this stops good messages from being reprocessed, but it gives up batching, which multiplies invocations and cost and lowers throughput.
- D is wrong: on-failure destinations apply to asynchronous invocations; an SQS event source mapping invokes the function synchronously, so the whole batch is still retried.

**Key phrases:** one message in a batch · whole batch · only the failed messages · in batches for efficiency
**Hint:** The function can tell the event source mapping which messages in the batch failed.

---

## ALPHA-125: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Cost Optimization

### Question
A retailer is preparing for a 3-week sales event that starts in one month. The application needs 400 m6i.2xlarge instances in a specific Availability Zone for the whole event, and the company cannot risk InsufficientInstanceCapacity errors when it scales out. The company does not want any commitment that lasts beyond the event. Which solution meets these requirements?

### Options
- **A.** Create an On-Demand Capacity Reservation for 400 m6i.2xlarge instances in that Availability Zone that starts before the event and has an end date set for when the event finishes.
- **B.** Purchase 1-year zonal Standard Reserved Instances for 400 m6i.2xlarge instances in that Availability Zone.
- **C.** Launch the instances with an EC2 Fleet of Spot Instances that uses the capacity-optimized allocation strategy.
- **D.** Purchase a Compute Savings Plan that covers the expected hourly spend of 400 m6i.2xlarge instances.

### Correct answer: A

**Summary:** On-Demand Capacity Reservations guarantee instances in a specific AZ for a set period with no long-term commitment.

### Explanation
- A is correct: an On-Demand Capacity Reservation holds the exact instance type and count in the chosen Availability Zone, can be created ahead of time and set to end automatically, and involves no 1-year or 3-year term.
- B is wrong: zonal Reserved Instances do reserve capacity, but they require a 1-year commitment that lasts well past a 3-week event.
- C is wrong: Spot capacity can be reclaimed at any time and is never guaranteed, which is the opposite of what the event needs.
- D is wrong: Savings Plans give a discount only; they do not reserve any capacity, and they also need a 1-year or 3-year commitment.

**Key phrases:** specific Availability Zone · cannot risk InsufficientInstanceCapacity · not want any commitment that lasts beyond the event
**Hint:** Discounts and guaranteed capacity are separate things. Which option reserves capacity in a zone with no long-term commitment?

---

## ALPHA-126: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A company runs application servers on premises that use iSCSI block storage from a SAN that is almost full. The total dataset is 60 TB, but only about 5 TB of it is accessed often, and that part needs low-latency access. The company wants to keep the full dataset in AWS, keep only the frequently used data on premises, and take point-in-time snapshots that can be restored as Amazon EBS volumes. Which solution meets these requirements?

### Options
- **A.** Deploy AWS Storage Gateway Volume Gateway in cached mode and attach the volumes to the servers over iSCSI.
- **B.** Deploy AWS Storage Gateway Volume Gateway in stored mode and attach the volumes to the servers over iSCSI.
- **C.** Deploy Amazon S3 File Gateway and move the data to NFS file shares backed by Amazon S3.
- **D.** Deploy AWS Storage Gateway Tape Gateway and move the data to virtual tapes.

### Correct answer: A

**Summary:** Volume Gateway cached mode keeps primary block data in AWS with only hot data cached on premises; stored mode keeps everything local.

### Explanation
- A is correct: cached volumes store the primary data in AWS and keep only frequently accessed data in a local cache, so the SAN is freed while hot data stays low latency, and volume snapshots can be restored as EBS volumes.
- B is wrong: stored volumes keep the entire dataset on premises and only back it up to AWS asynchronously, so the full SAN problem remains.
- C is wrong: File Gateway presents NFS or SMB file shares, not iSCSI block volumes, so the servers would have to change how they use storage.
- D is wrong: Tape Gateway is a virtual tape library for backup software, not live block storage for application servers.

**Key phrases:** iSCSI block storage · almost full · only about 5 TB of it is accessed often · full dataset in AWS · EBS volumes
**Hint:** The servers need block storage over iSCSI, and most of the data should live in AWS rather than on premises.

---

## ALPHA-127: Disaster Recovery & Migration
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** easy · **Pillars:** Operational Excellence, Reliability

### Question
A company plans to move 300 Windows and Linux servers, running on VMware and on physical hardware, to Amazon EC2 without changing the applications. The company wants to launch test instances before the final move and keep the downtime during the cutover to a few minutes. Which solution meets these requirements with the LEAST operational effort?

### Options
- **A.** Export each virtual machine image and import it with VM Import/Export, then launch EC2 instances from the resulting AMIs.
- **B.** Use AWS DataSync to copy each server's file systems to Amazon EFS and mount them on new EC2 instances.
- **C.** Use AWS Database Migration Service to replicate each server to Amazon EC2.
- **D.** Use AWS Application Migration Service: install the replication agent on each server, launch test instances to check them, and then perform the cutover.

### Correct answer: D

**Summary:** AWS Application Migration Service (MGN) rehosts servers with continuous block-level replication, test launches, and a cutover of minutes.

### Explanation
- A is wrong: VM Import/Export is a one-time, per-image process with no continuous replication, so changes made after the export are lost or the downtime is long, and it does not cover physical servers.
- B is wrong: DataSync copies files, not bootable servers, so the applications would have to be reinstalled and configured again.
- C is wrong: DMS migrates databases, not whole servers with their operating systems and applications.
- D is correct: Application Migration Service continuously replicates whole servers at the block level, whether they run on VMware or physical hardware, supports non-disruptive test launches, and cuts over in minutes with no application changes.

**Key phrases:** 300 Windows and Linux servers · without changing the applications · launch test instances · few minutes · LEAST operational effort
**Hint:** This is a lift-and-shift of whole servers, with continuous replication until the cutover.

---

## ALPHA-128: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** hard · **Pillars:** Operational Excellence

### Question
A company is moving a vendor application to AWS. The vendor supports the application only on Oracle Database, and the vendor's monitoring agent must be installed on the database host operating system, which also needs a custom OS configuration. The company wants AWS to automate as much of the database management as possible, including backups and point-in-time recovery. Which solution meets these requirements?

### Options
- **A.** Migrate the database to Amazon Aurora PostgreSQL and use Babelfish so the application can keep running unchanged.
- **B.** Deploy Amazon RDS Custom for Oracle, connect to the host to install the agent and apply the OS configuration, and use its automated backups.
- **C.** Install Oracle Database on Amazon EC2 and write scripts to schedule backups with Amazon EBS snapshots.
- **D.** Deploy Amazon RDS for Oracle and install the agent by using an option group.

### Correct answer: B

**Summary:** RDS Custom provides a managed database that still allows OS-level access for vendor agents and custom configuration.

### Explanation
- A is wrong: Babelfish makes Aurora PostgreSQL understand SQL Server T-SQL, not Oracle, and the vendor supports only Oracle anyway.
- B is correct: RDS Custom gives access to the operating system and database of the host for agents and custom configuration, while still automating backups, point-in-time recovery and monitoring, which fits vendor apps that need privileged access.
- C is wrong: EC2 gives full access, but backups, recovery and patching all become the company's own work, the opposite of automating as much as possible.
- D is wrong: standard RDS for Oracle gives no operating system access, and option groups only support the features AWS ships, not an arbitrary vendor agent.

**Key phrases:** only on Oracle Database · installed on the database host operating system · custom OS configuration · automate as much
**Hint:** You need OS access to the database host and managed automation at the same time.

---

## ALPHA-129: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** medium · **Pillars:** Cost Optimization, Performance Efficiency

### Question
A company has a 20 TB Amazon Aurora MySQL production cluster. The QA team needs a fresh, writable copy of the production database every morning for destructive tests, and deletes it at the end of the day. Restoring from a snapshot currently takes hours, and each copy is billed for the full 20 TB of storage. Which solution provides the copy MOST quickly and cost-effectively?

### Options
- **A.** Create an Aurora clone of the production cluster each morning, and delete the clone each evening.
- **B.** Restore a new cluster from the latest automated snapshot each morning, and delete it each evening.
- **C.** Add an Aurora Replica to the production cluster for the QA team to use.
- **D.** Export the database to Amazon S3 each night with mysqldump, and import it into a new Aurora cluster each morning.

### Correct answer: A

**Summary:** Aurora fast cloning uses copy-on-write to create quick, cheap, writable copies of a database for testing.

### Explanation
- A is correct: Aurora cloning uses copy-on-write, so the clone is ready in minutes regardless of database size, and new storage is billed only for pages that the tests change.
- B is wrong: this is the current slow process, and each restored cluster pays for its own full copy of the storage.
- C is wrong: Aurora Replicas are read-only and share the production cluster, so destructive tests are impossible and would put production at risk.
- D is wrong: a logical dump and import of 20 TB is even slower than restoring a snapshot, and the new cluster still stores a full copy.

**Key phrases:** 20 TB · fresh, writable copy · destructive tests · takes hours · full 20 TB · MOST quickly and cost-effectively
**Hint:** Aurora can create a new cluster that shares the source storage and copies only the pages that change.

---

## ALPHA-130: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization

### Question
A hospital stores medical images in Amazon S3. After 90 days, each image is accessed about once per quarter, but when a doctor requests an image it must be returned within milliseconds. The images must be kept for 10 years. Which solution is MOST cost-effective for images older than 90 days?

### Options
- **A.** Use a lifecycle rule to move the images to S3 Glacier Deep Archive after 90 days.
- **B.** Use a lifecycle rule to move the images to S3 Glacier Instant Retrieval after 90 days.
- **C.** Use a lifecycle rule to move the images to S3 Glacier Flexible Retrieval after 90 days.
- **D.** Use a lifecycle rule to move the images to S3 Standard-Infrequent Access after 90 days.

### Correct answer: B

**Summary:** S3 Glacier Instant Retrieval is the cheapest class for rarely accessed data that still needs millisecond retrieval.

### Explanation
- A is wrong: Deep Archive takes up to 12 hours or more to restore, far too slow for a doctor waiting on an image.
- B is correct: Glacier Instant Retrieval returns data in milliseconds, like Standard-IA, but with much lower storage cost for data accessed about once a quarter, which is what it is designed for.
- C is wrong: Glacier Flexible Retrieval takes minutes to hours to restore objects, which misses the millisecond requirement.
- D is wrong: Standard-IA returns data in milliseconds but costs noticeably more to store than Glacier Instant Retrieval for data that is read only once a quarter.

**Key phrases:** about once per quarter · within milliseconds · 10 years · MOST cost-effective
**Hint:** The access pattern is known and rare, but retrieval must still be instant.

---

## ALPHA-131: Disaster Recovery & Migration
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence

### Question
A company must migrate 150 TB of file data from its on-premises NAS to Amazon S3 within 30 days. The data center already has a 1 Gbps AWS Direct Connect connection, and about 80% of its capacity is available for the migration around the clock. The company wants the simplest solution that meets the deadline. Which solution should a solutions architect recommend?

### Options
- **A.** Deploy an AWS DataSync agent on premises and transfer the data to Amazon S3 over the existing Direct Connect connection.
- **B.** Order several AWS Snowball Edge devices, copy the data locally, and ship the devices back to AWS.
- **C.** Order an additional 10 Gbps Direct Connect connection dedicated to the migration.
- **D.** Enable Amazon S3 Transfer Acceleration and upload the data over the public internet.

### Correct answer: A

**Summary:** 1 Gbps moves about 10.8 TB/day; at 80% that is 150 TB in about 18 days, so an online transfer over the existing link beats shipping devices.

### Explanation
- A is correct: 800 Mbps is about 100 MB/s, or about 8.6 TB per day, so 150 TB takes about 18 days, well inside 30 days, and DataSync handles scheduling, verification and incremental copies.
- B is wrong: Snowball also meets the deadline, but ordering, loading and shipping devices adds work when the existing link can already move the data in about 18 days.
- C is wrong: a new dedicated connection often takes weeks or months to provision and adds cost, and the existing 1 Gbps link is already fast enough.
- D is wrong: Transfer Acceleration routes through edge locations over the internet, not the Direct Connect link, and adds a per-GB charge without being needed.

**Key phrases:** 150 TB · within 30 days · 1 Gbps AWS Direct Connect · about 80% · simplest solution
**Hint:** Convert the link to TB per day: 1 Gbps is 125 MB/s, or about 10.8 TB per day at full speed.

---

## ALPHA-132: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A company replicates on-premises backup data to Amazon S3 every night. About 3 TB of data changes each day, and the replication must finish inside an 8-hour overnight window. The company will use AWS Direct Connect for the transfer. What is the MINIMUM connection speed that lets the nightly replication finish within the window?

### Options
- **A.** A 200 Mbps hosted connection
- **B.** A 500 Mbps hosted connection
- **C.** A 1 Gbps connection
- **D.** A 10 Gbps connection

### Correct answer: C

**Summary:** Required bandwidth = data / window x 8: 3 TB in 8 hours needs about 833 Mbps, so a 1 Gbps link.

### Explanation
- A is wrong: 200 Mbps moves about 0.72 TB in 8 hours, far short of 3 TB.
- B is wrong: 500 Mbps moves about 1.8 TB in 8 hours, still short of 3 TB.
- C is correct: 3 TB in 28,800 seconds is about 104 MB/s, or about 833 Mbps, so 1 Gbps is the smallest listed speed that fits.
- D is wrong: 10 Gbps also works, but it is ten times the needed capacity and costs far more than the minimum.

**Key phrases:** 3 TB · 8-hour overnight window · MINIMUM
**Hint:** Divide the bytes by the seconds in the window, then multiply by 8 to get bits per second.

---

## ALPHA-133: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Performance Efficiency

### Question
A MySQL database runs on an Amazon EC2 instance with a 500 GiB gp2 Amazon EBS volume. The data set will not grow, but the workload now needs a sustained 6,000 IOPS, and the volume is running out of burst credits every afternoon. Which solution provides the required performance MOST cost-effectively?

### Options
- **A.** Increase the gp2 volume to 2,000 GiB so that its baseline reaches 6,000 IOPS.
- **B.** Modify the volume to gp3, keep it at 500 GiB, and provision 6,000 IOPS.
- **C.** Modify the volume to io2 at 500 GiB with 6,000 provisioned IOPS.
- **D.** Modify the volume to st1 at 500 GiB.

### Correct answer: B

**Summary:** gp2 ties IOPS to size (3 IOPS/GiB); gp3 decouples them, so buying IOPS on gp3 beats buying unused GiB on gp2.

### Explanation
- A is wrong: 2,000 GiB x 3 IOPS/GiB does reach 6,000 IOPS, but the company pays for 1,500 GiB of storage it does not need.
- B is correct: gp3 includes 3,000 IOPS at any size and sells additional IOPS separately, so 500 GiB with 6,000 IOPS is the cheapest fit, and Elastic Volumes makes the change without downtime.
- C is wrong: io2 meets the requirement, but its per-GiB and per-IOPS prices are much higher than gp3 for a workload that does not need io2 durability or latency.
- D is wrong: st1 is an HDD volume built for large sequential throughput and cannot deliver 6,000 small random IOPS, and AWS does not support it as a database boot or transactional volume.

**Key phrases:** 500 GiB gp2 · sustained 6,000 IOPS · running out of burst credits · MOST cost-effectively
**Hint:** gp2 gives 3 IOPS per GiB. gp3 gives 3,000 IOPS at any size and lets you buy extra IOPS separately.

---

## ALPHA-134: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency

### Question
A team needs a Provisioned IOPS SSD (io1) Amazon EBS volume that delivers 32,000 IOPS for a database whose data files occupy only 200 GiB. What is the SMALLEST io1 volume size the team can create that supports 32,000 provisioned IOPS?

### Options
- **A.** 200 GiB
- **B.** 320 GiB
- **C.** 640 GiB
- **D.** 1,600 GiB

### Correct answer: C

**Summary:** io1 caps provisioned IOPS at 50 per GiB, so size = IOPS / 50; the volume may need to be bigger than the data.

### Explanation
- A is wrong: 200 GiB x 50 allows at most 10,000 IOPS.
- B is wrong: 320 GiB x 50 allows at most 16,000 IOPS.
- C is correct: 32,000 IOPS / 50 IOPS per GiB = 640 GiB, the smallest size that allows 32,000 IOPS.
- D is wrong: 1,600 GiB works, but it is larger than needed; it comes from wrongly using a 20:1 ratio.

**Key phrases:** io1 · 32,000 IOPS · 200 GiB · SMALLEST
**Hint:** io1 allows at most 50 provisioned IOPS per GiB of volume size.

---

## ALPHA-135: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency

### Question
A company stores 200 GiB of shared data on an Amazon EFS file system that uses the Bursting throughput mode. Each night a batch job reads the data set continuously for 6 hours and needs a sustained 100 MiB/s. After the first hour, throughput drops sharply. Which TWO changes will each let the job sustain 100 MiB/s? (Select TWO.)

### Options
- **A.** Switch the file system to Elastic throughput mode.
- **B.** Change the performance mode to Max I/O.
- **C.** Add 500 GiB of padding files to raise the baseline throughput.
- **D.** Switch the file system to Provisioned throughput mode set to 100 MiB/s.
- **E.** Move the files to the EFS Infrequent Access storage class.

### Correct answers: A, D (choose 2)

**Summary:** EFS Bursting baseline is 50 MiB/s per TiB (200 GiB gives about 10 MiB/s); small file systems need Elastic or Provisioned throughput for sustained load.

### Explanation
- A is correct: Elastic throughput scales with the workload and is not tied to the amount of data stored, so the job can sustain 100 MiB/s.
- B is wrong: performance mode affects how many operations the file system can handle and their latency, not the throughput limit.
- C is wrong: 700 GiB x 50 KiB/s is only about 35 MiB/s; reaching 100 MiB/s this way would take about 2 TiB of stored data.
- D is correct: Provisioned throughput guarantees the configured 100 MiB/s regardless of how much data is stored.
- E is wrong: Bursting baseline is based on data in the Standard class, so moving files to IA lowers it further and adds per-GB access charges.

**Key phrases:** 200 GiB · Bursting throughput mode · sustained 100 MiB/s · 6 hours · TWO
**Hint:** In Bursting mode, baseline throughput is 50 KiB/s per GiB stored in the Standard storage class. What does 200 GiB give you?

---

## ALPHA-136: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency

### Question
An application serves thumbnails from a single Amazon S3 bucket, with all objects stored under one prefix. During peak hours the application issues about 20,000 GET requests per second and receives HTTP 503 Slow Down errors. The team does not want to add a caching layer. Which change will remove the errors?

### Options
- **A.** Enable S3 Transfer Acceleration on the bucket.
- **B.** Download each thumbnail with byte-range GET requests in parallel.
- **C.** Split the objects across two prefixes.
- **D.** Spread the objects across at least four prefixes, for example by adding a short hash to each key.

### Correct answer: D

**Summary:** S3 scales per prefix: 5,500 GET/s and 3,500 PUT/s each, so divide the peak by that to count the prefixes you need.

### Explanation
- A is wrong: Transfer Acceleration speeds long-distance transfers through edge locations; it does not raise the per-prefix request rate.
- B is wrong: byte-range requests split each download into more GET requests, which makes the throttling worse.
- C is wrong: two prefixes support about 11,000 GET requests per second, still below 20,000.
- D is correct: 4 prefixes x 5,500 GET/s = 22,000 GET/s, which covers the 20,000 GET/s peak.

**Key phrases:** single Amazon S3 bucket · one prefix · 20,000 GET requests per second · 503 Slow Down
**Hint:** S3 supports at least 5,500 GET/HEAD requests per second for each prefix.

---

## ALPHA-137: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** hard · **Pillars:** Cost Optimization

### Question
A company is launching an application that will store 50 million objects in Amazon S3. The average object size is 32 KB, and each object is read a few times per month. The team must choose whether to store the objects in S3 Standard or S3 Standard-IA. Assume S3 Standard costs $0.023 per GB-month, S3 Standard-IA costs $0.0125 per GB-month, and 1 GB = 1,000,000 KB. Which statement about the monthly storage cost is correct?

### Options
- **A.** Standard-IA would cost about $80 per month against about $37 for Standard, because Standard-IA bills each object as at least 128 KB, so Standard is cheaper.
- **B.** Standard-IA would cost about $20 per month against about $37 for Standard, a saving of roughly 46%.
- **C.** Both classes cost the same, because S3 bills small objects per request rather than per GB.
- **D.** Standard-IA would cost about $80 per month, but it is still cheaper overall once Standard's retrieval fees are counted.

### Correct answer: A

**Summary:** Standard-IA bills objects under 128 KB as 128 KB, so small objects can cost more in IA than in Standard; lifecycle rules skip them by default for this reason.

### Explanation
- A is correct: 50 million x 32 KB = 1,600 GB, or about $37 in Standard; Standard-IA bills 50 million x 128 KB = 6,400 GB, or $80, before its retrieval fees.
- B is wrong: this bills the objects at their real size and ignores Standard-IA's 128 KB minimum billable object size.
- C is wrong: storage is billed per GB-month in both classes; request charges come on top and are higher for Standard-IA.
- D is wrong: S3 Standard has no retrieval fee; Standard-IA charges per GB retrieved, which widens the gap.

**Key phrases:** 50 million objects · 32 KB · a few times per month · $0.023 · $0.0125
**Hint:** Standard-IA has a minimum billable object size. Bill each 32 KB object at that size and redo the math.

---

## ALPHA-138: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** hard · **Pillars:** Cost Optimization

### Question
An application writes 50 MB log files to Amazon S3 Standard. Each file is read frequently for the first 7 days, rarely after that but must then be retrievable within milliseconds, and must be deleted 45 days after creation. Assume these prices per GB-month: S3 Standard $0.023, S3 Standard-IA $0.0125, S3 Glacier Instant Retrieval $0.004, and a 30-day month. Which lifecycle policy is the MOST cost-effective?

### Options
- **A.** Keep the files in S3 Standard and expire them after 45 days.
- **B.** Transition the files to S3 Glacier Instant Retrieval after 7 days and expire them after 45 days.
- **C.** Transition the files to S3 Standard-IA after 7 days and expire them after 45 days.
- **D.** Transition the files to S3 Standard-IA after 30 days and expire them after 45 days.

### Correct answer: B

**Summary:** A minimum-duration charge does not always cancel the savings: price each option over the object's whole life, including the billed minimum.

### Explanation
- A is wrong: 1.5 months x $0.023 = about $0.0345 per GB, the second most expensive option.
- B is correct: 7 days of Standard (about $0.0054) plus the 90-day minimum in Glacier Instant Retrieval (3 x $0.004 = $0.012) is about $0.0174 per GB, half the cost of Standard, with millisecond access.
- C is wrong: a lifecycle rule cannot move objects to Standard-IA until they have been stored for at least 30 days.
- D is wrong: 30 days of Standard ($0.023) plus Standard-IA's billed 30-day minimum ($0.0125) is about $0.0355 per GB, more than keeping the files in Standard.

**Key phrases:** 50 MB · first 7 days · within milliseconds · deleted 45 days after creation · MOST cost-effective
**Hint:** Price each option per GB for the file's whole life, and remember each class's minimum storage duration: 30 days for Standard-IA, 90 days for Glacier Instant Retrieval.

---

## ALPHA-139: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Reliability

### Question
A company must keep 500 TB of compliance records for 10 years. The records are almost never accessed, but when an auditor requests a record the company must provide it within 24 hours. Which storage option meets these requirements at the LOWEST storage cost?

### Options
- **A.** Store the records in S3 Glacier Instant Retrieval.
- **B.** Store the records in S3 Glacier Flexible Retrieval and use Bulk retrievals.
- **C.** Store the records in S3 Glacier Deep Archive and use Standard retrievals when an auditor asks.
- **D.** Store the records in S3 Glacier Deep Archive and allow only Bulk retrievals to minimize cost.

### Correct answer: C

**Summary:** Match retrieval time to the recovery window: Deep Archive Standard retrieval (within 12 hours) fits 24 hours at the lowest storage price.

### Explanation
- A is wrong: it returns data in milliseconds, but its storage price is several times higher than Deep Archive, and the 24-hour window does not need that speed.
- B is wrong: Bulk retrievals finish in 5-12 hours and meet the window, but Glacier Flexible Retrieval storage costs more than Deep Archive.
- C is correct: Deep Archive has the lowest storage price, and Standard retrievals complete within 12 hours, inside the 24-hour window.
- D is wrong: Deep Archive Bulk retrievals can take up to 48 hours, which misses the 24-hour requirement.

**Key phrases:** 500 TB · 10 years · almost never accessed · within 24 hours · LOWEST storage cost
**Hint:** Deep Archive Standard retrievals complete within 12 hours; Bulk retrievals complete within 48 hours.

---

## ALPHA-140: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization

### Question
An Amazon DynamoDB table in provisioned capacity mode stores 6 KB order items and 2.5 KB event items. At peak the application performs 80 strongly consistent reads per second of order items and 100 standard (non-transactional) writes per second of event items. Which TWO settings are the MINIMUM that handle the peak without throttling? (Select TWO.)

### Options
- **A.** 160 read capacity units
- **B.** 120 read capacity units
- **C.** 80 read capacity units
- **D.** 250 write capacity units
- **E.** 300 write capacity units

### Correct answers: A, E (choose 2)

**Summary:** Round item sizes up (4 KB for reads, 1 KB for writes), then multiply by the request rate.

### Explanation
- A is correct: a 6 KB item rounds up to 8 KB, which is 2 RCU per strongly consistent read, and 80 x 2 = 160 RCU.
- B is wrong: this uses 6 / 4 = 1.5 RCU per read without rounding up to whole 4 KB units.
- C is wrong: this is the eventually consistent figure; strongly consistent reads need the full 2 RCU per 6 KB item.
- D is wrong: this uses 2.5 WCU per write without rounding up to whole 1 KB units.
- E is correct: a 2.5 KB item rounds up to 3 KB, which is 3 WCU per write, and 100 x 3 = 300 WCU.

**Key phrases:** 6 KB · 2.5 KB · 80 strongly consistent reads per second · 100 standard · MINIMUM · TWO
**Hint:** 1 RCU = one strongly consistent read per second of up to 4 KB; 1 WCU = one write per second of up to 1 KB. Round each item size up first.

---

## ALPHA-141: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A retail application uses an Amazon DynamoDB table in provisioned capacity mode. Product items are 10 KB. The catalog page performs 600 eventually consistent reads per second. Checkout uses TransactWriteItems to update 3 KB inventory items at 50 items per second. How much capacity must be provisioned for this traffic?

### Options
- **A.** 900 RCU and 300 WCU
- **B.** 1,800 RCU and 300 WCU
- **C.** 750 RCU and 150 WCU
- **D.** 900 RCU and 150 WCU

### Correct answer: A

**Summary:** Round up, then halve for eventually consistent reads and double for transactional reads or writes.

### Explanation
- A is correct: 10 KB rounds up to 12 KB = 3 RCU strongly consistent, half for eventually consistent: 600 x 1.5 = 900 RCU; 3 KB = 3 WCU, doubled for transactions: 50 x 6 = 300 WCU.
- B is wrong: 1,800 RCU is the strongly consistent figure; eventually consistent reads cost half as much.
- C is wrong: this skips rounding 10 KB up to 12 KB and forgets that transactional writes consume twice the capacity.
- D is wrong: the reads are right, but transactional writes consume 2 WCU per KB, so 50 x 3 KB needs 300 WCU.

**Key phrases:** 10 KB · 600 eventually consistent reads per second · TransactWriteItems · 3 KB · 50 items per second
**Hint:** Round each item up to 4 KB (reads) or 1 KB (writes) first. Eventually consistent reads cost half; transactional writes cost double.

---

## ALPHA-142: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** hard · **Pillars:** Performance Efficiency

### Question
A company ingests clickstream events into Amazon Kinesis Data Streams in provisioned mode. Producers send 5,000 records per second, and each record is 3 KB (assume 1 MB = 1,000 KB). Three separate consumer applications each read the full stream using the standard (shared-throughput) GetRecords API. The stream has 15 shards, and the consumers are falling behind. Which TWO changes will each give every consumer enough read throughput? (Select TWO.)

### Options
- **A.** Increase the data retention period to 7 days.
- **B.** Register the three consumers for enhanced fan-out.
- **C.** Increase the stream to 20 shards.
- **D.** Reduce the stream to 5 shards, because 5,000 records per second needs only 5 shards.
- **E.** Increase the stream to 23 shards.

### Correct answers: B, E (choose 2)

**Summary:** Size shards for writes (1 MB/s or 1,000 records/s) and for reads (2 MB/s shared); with several consumers, enhanced fan-out removes the shared read limit.

### Explanation
- A is wrong: retention controls how long records are kept, not how fast consumers can read them.
- B is correct: each consumer gets a dedicated 2 MB/s per shard, or 30 MB/s across 15 shards, twice the 15 MB/s it needs.
- C is wrong: 20 shards x 2 MB/s = 40 MB/s of shared read throughput, less than the 45 MB/s the three consumers need.
- D is wrong: the records limit allows 5 shards, but 5,000 x 3 KB = 15 MB/s of writes needs 15 shards at 1 MB/s each.
- E is correct: three consumers each reading 15 MB/s need 45 MB/s, and 23 shards x 2 MB/s = 46 MB/s covers it.

**Key phrases:** 5,000 records per second · 3 KB · Three separate consumer applications · standard (shared-throughput) · 15 shards · TWO
**Hint:** Each shard accepts 1 MB/s or 1,000 records/s in and serves 2 MB/s out, shared by all standard consumers. Enhanced fan-out gives each consumer its own 2 MB/s per shard.

---

## ALPHA-143: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Reliability

### Question
An AWS Lambda function behind Amazon API Gateway takes an average of 3 seconds per invocation because it waits on a slow third-party API. A marketing campaign will raise traffic to a steady 400 requests per second. The account uses the default Regional concurrency quota of 1,000, and no other functions run in the Region. Which TWO actions will prevent throttling during the campaign? (Select TWO.)

### Options
- **A.** Increase the function timeout from 10 seconds to 30 seconds.
- **B.** Set reserved concurrency on the function to 1,000.
- **C.** Request a Service Quotas increase for concurrent executions to at least 1,500.
- **D.** Increase the function's memory to 3,008 MB.
- **E.** Cache the third-party API responses so that the average duration falls to about 1 second.

### Correct answers: C, E (choose 2)

**Summary:** Lambda concurrency = request rate x duration; fix throttling by raising the quota or by shortening the duration.

### Explanation
- A is wrong: the timeout only limits how long an invocation may run; it does not reduce concurrency.
- B is wrong: reserved concurrency cannot exceed the account quota minus 100 unreserved, and even 1,000 would be short of the 1,200 needed.
- C is correct: 400 requests/s x 3 s = 1,200 concurrent executions, which exceeds 1,000; a higher quota absorbs it with headroom.
- D is wrong: the function is waiting on network I/O to a third party, so more memory and CPU barely shorten it.
- E is correct: 400 requests/s x 1 s = 400 concurrent executions, well under the 1,000 quota.

**Key phrases:** average of 3 seconds · slow third-party API · 400 requests per second · concurrency quota of 1,000 · TWO
**Hint:** Concurrency = requests per second x average duration in seconds.

---

## ALPHA-144: Compute & Serverless
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization, Performance Efficiency

### Question
An AWS Lambda function processes images and runs 10 million times per month. Load testing gives these average durations: 1,700 ms at 512 MB, 800 ms at 1,024 MB, 350 ms at 2,048 MB, and 300 ms at 4,096 MB. Lambda compute is billed per GB-second. Which memory setting has the LOWEST compute cost?

### Options
- **A.** 512 MB
- **B.** 1,024 MB
- **C.** 4,096 MB
- **D.** 2,048 MB

### Correct answer: D

**Summary:** Lambda cost follows memory x duration; for CPU-bound code more memory can be both faster and cheaper, up to the point where duration stops falling.

### Explanation
- A is wrong: 0.5 GB x 1.7 s = 0.85 GB-seconds per invocation, the second most expensive.
- B is wrong: 1 GB x 0.8 s = 0.8 GB-seconds per invocation.
- C is wrong: 4 GB x 0.3 s = 1.2 GB-seconds per invocation; the function has stopped getting much faster, so the extra memory is wasted.
- D is correct: 2 GB x 0.35 s = 0.7 GB-seconds per invocation, the lowest, and also much faster than the smaller settings (7 million GB-seconds per month against 8 million at 1,024 MB).

**Key phrases:** 10 million times per month · GB-second · LOWEST compute cost
**Hint:** Multiply memory in GB by duration in seconds for each setting. More memory also means more CPU, so duration can fall faster than memory rises.

---

## ALPHA-145: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Cost Optimization

### Question
A web application runs on Amazon EC2 instances in an Auto Scaling group. Load testing shows it needs at least 6 instances to serve peak traffic. The application must keep serving peak traffic even if an entire Availability Zone fails, without waiting for Auto Scaling to launch replacements. The Region has three Availability Zones. Which TWO Auto Scaling group configurations meet these requirements? (Select TWO.)

### Options
- **A.** 2 Availability Zones with 3 instances in each (6 total)
- **B.** 3 Availability Zones with 3 instances in each (9 total)
- **C.** 3 Availability Zones with 2 instances in each (6 total)
- **D.** 2 Availability Zones with 6 instances in each (12 total)
- **E.** 1 Availability Zone with 12 instances in a cluster placement group

### Correct answers: B, D (choose 2)

**Summary:** To survive losing one of n zones, run N x n / (n - 1) instances: for N = 6, 3 zones need 9 and 2 zones need 12.

### Explanation
- A is wrong: losing one zone leaves only 3 instances.
- B is correct: losing one zone leaves 6 instances, and this is the cheapest layout that does.
- C is wrong: losing one zone leaves only 4 instances.
- D is correct: losing one zone leaves 6 instances, although it needs 3 more instances than spreading across 3 zones.
- E is wrong: losing that zone leaves no instances at all.

**Key phrases:** at least 6 instances · entire Availability Zone fails · without waiting · three Availability Zones · TWO
**Hint:** After one Availability Zone is lost, the remaining zones alone must still hold 6 instances.

---

## ALPHA-146: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Cost Optimization

### Question
An Auto Scaling group runs 10 instances at an average CPU utilization of 84%. The team adds a target tracking policy with a target of 60% average CPU utilization. Assuming the load stays the same and spreads evenly, how many instances will the group run after it scales out?

### Options
- **A.** 12
- **B.** 14
- **C.** 16
- **D.** 18

### Correct answer: B

**Summary:** Target tracking capacity = current instances x current metric / target metric.

### Explanation
- A is wrong: 840 / 12 = 70% CPU, still above the 60% target.
- B is correct: 10 x 84% = 840 percentage points of load, and 840 / 60 = 14 instances.
- C is wrong: 840 / 16 = 52.5% CPU, more capacity than the target needs.
- D is wrong: 840 / 18 = about 47% CPU, well below the target, so target tracking would not scale that far.

**Key phrases:** 10 instances · 84% · target of 60%
**Hint:** Total load = instances x utilization. Divide that total by the target.

---

## ALPHA-147: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A company is creating a subnet for Amazon EC2 instances and interface endpoints that need 25 private IP addresses in total, with no room required for growth. What is the SMALLEST subnet CIDR block that fits?

### Options
- **A.** /27
- **B.** /28
- **C.** /26
- **D.** /29

### Correct answer: A

**Summary:** Usable IPs = 2^(32 - prefix) - 5; AWS subnets range from /16 to /28.

### Explanation
- A is correct: a /27 has 32 addresses, and 32 - 5 reserved = 27 usable, enough for 25.
- B is wrong: a /28 has 16 addresses and only 11 usable.
- C is wrong: a /26 has 59 usable addresses, which fits but is not the smallest.
- D is wrong: the smallest subnet AWS allows is /28, and a /29 would have only 3 usable addresses anyway.

**Key phrases:** 25 private IP addresses · SMALLEST
**Hint:** AWS reserves 5 addresses in every subnet: the network address, the VPC router, DNS, one for future use, and the broadcast address.

---

## ALPHA-148: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** hard · **Pillars:** Reliability, Operational Excellence

### Question
A company is designing a new VPC across three Availability Zones. Each Availability Zone needs one private subnet that can hold 400 IP addresses and one public subnet that can hold 200 IP addresses. The company wants the smallest VPC CIDR block that fits all six subnets so that it keeps as much of its address plan free as possible. Which VPC CIDR block should the team choose?

### Options
- **A.** /22
- **B.** /21
- **C.** /20
- **D.** /16

### Correct answer: C

**Summary:** Size subnets with the 5 reserved IPs in mind, sum them, then round up: 3 x /23 + 3 x /24 = 2,304 addresses needs a /20.

### Explanation
- A is wrong: a /22 has 1,024 addresses, not even enough for the three private subnets.
- B is wrong: a /21 has 2,048 addresses, but the subnets need 2,304.
- C is correct: each private subnet needs a /23 (512, 507 usable) and each public subnet a /24 (256, 251 usable); 3 x 512 + 3 x 256 = 2,304 addresses, which needs a /20 (4,096).
- D is wrong: a /16 fits, but it takes 65,536 addresses from the company's plan and makes overlaps with other networks more likely.

**Key phrases:** three Availability Zones · 400 IP addresses · 200 IP addresses · smallest VPC CIDR block
**Hint:** Size each subnet first (remember the 5 reserved addresses), add up the address space, then round up to the next CIDR block.

---

## ALPHA-149: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** hard · **Pillars:** Performance Efficiency

### Question
A live-voting application stores vote totals in an Amazon DynamoDB table that uses on-demand capacity mode, with one item per candidate and candidate_id as the partition key. Each vote is an UpdateItem call that adds 1 to the candidate's item, which is smaller than 1 KB. During a televised final, the leading candidate receives 4,500 votes per second, and writes to that item are throttled even though the table as a whole is far below its limits. Which solution removes the throttling?

### Options
- **A.** Switch the table to provisioned capacity mode with 5,000 WCU.
- **B.** Put a DynamoDB Accelerator (DAX) cluster in front of the table.
- **C.** Split each candidate's total across 3 items (candidate_id#0 to candidate_id#2) and add them together when reading.
- **D.** Split each candidate's total across 10 items with a random suffix (candidate_id#0 to candidate_id#9) and add them together when reading.

### Correct answer: D

**Summary:** A partition caps at 1,000 WCU and 3,000 RCU, so a hot key needs write sharding: shards >= hot write rate / 1,000, summed on read.

### Explanation
- A is wrong: table-level capacity does not lift the per-partition limit; the single hot item is still capped at 1,000 WCU.
- B is wrong: DAX caches reads; every write still goes through to the same item in DynamoDB.
- C is wrong: 3 shards x 1,000 WCU = 3,000 writes per second, still below the 4,500 needed.
- D is correct: 4,500 / 1,000 WCU per partition means at least 5 shards; 10 shards take about 450 writes per second each, well under the limit with headroom for growth.

**Key phrases:** on-demand capacity mode · one item per candidate · 4,500 votes per second · throttled · far below its limits
**Hint:** A single partition, and therefore any single item, supports at most 1,000 WCU and 3,000 RCU per second, whatever the table's capacity mode.

---

## ALPHA-150: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability, Operational Excellence

### Question
A company is running a canary release. Amazon Route 53 has two weighted records for app.example.com: the current version has weight 200 and the new version has weight 50. What percentage of DNS responses will point to the new version?

### Options
- **A.** 20%
- **B.** 25%
- **C.** 50%
- **D.** 80%

### Correct answer: A

**Summary:** Weighted routing share = record weight / sum of weights; a weight of 0 sends no traffic.

### Explanation
- A is correct: 50 / (200 + 50) = 20% of responses go to the new version.
- B is wrong: this divides 50 by 200 instead of by the total weight of 250.
- C is wrong: Route 53 splits by weight, not evenly between records.
- D is wrong: 80% is the share of the current version, not the new one.

**Key phrases:** canary release · weight 200 · weight 50 · percentage
**Hint:** Each record receives its weight divided by the sum of all weights in the group.

---

## ALPHA-151: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Reliability

### Question
A news website uses Amazon CloudFront in front of an origin fleet that can handle at most 1,500 requests per second. During breaking news, viewers send 30,000 requests per second, the cache hit ratio is 90%, and the origin is overloaded. What cache hit ratio must CloudFront reach to keep the origin within its capacity, and which change is MOST likely to achieve it?

### Options
- **A.** At least 92%; enable Origin Shield.
- **B.** At least 95%; change the distribution to price class All to use more edge locations.
- **C.** At least 95%; remove unneeded query strings, cookies and headers from the cache key and enable Origin Shield.
- **D.** At least 95%; lower the TTLs so that content stays fresh.

### Correct answer: C

**Summary:** Origin load = requests x (1 - hit ratio); going from 90% to 95% halves origin traffic.

### Explanation
- A is wrong: at 92% the origin would still receive 30,000 x 8% = 2,400 requests per second.
- B is wrong: the number is right, but more edge locations spread requests across more caches, which does not raise the hit ratio.
- C is correct: 30,000 x (1 - 0.95) = 1,500 requests per second, and a smaller cache key plus Origin Shield's extra caching layer are the standard ways to raise the hit ratio.
- D is wrong: the number is right, but shorter TTLs make objects expire sooner and lower the hit ratio.

**Key phrases:** at most 1,500 requests per second · 30,000 requests per second · cache hit ratio is 90% · MOST likely
**Hint:** Origin requests = total requests x (1 - cache hit ratio).

---

## ALPHA-152: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
Applications in private subnets move about 60 TB per month to and from Amazon S3 in the same Region through a NAT gateway. Assume NAT gateway data processing costs $0.045 per GB and 1 TB = 1,000 GB. The company wants to cut this cost without changing application code. Which solution saves the most, and roughly how much per month?

### Options
- **A.** Create an S3 interface endpoint, saving about $2,700 per month.
- **B.** Create an S3 gateway endpoint and add it to the private subnets' route tables, saving about $2,700 per month.
- **C.** Replace the NAT gateway with a NAT instance, saving about $2,700 per month.
- **D.** Enable S3 Transfer Acceleration, saving about $270 per month.

### Correct answer: B

**Summary:** Traffic from private subnets to S3 through a NAT gateway pays per GB; an S3 gateway endpoint is free and needs only a route-table change.

### Explanation
- A is wrong: interface endpoints charge per hour and per GB processed, so they save less than $2,700.
- B is correct: 60,000 GB x $0.045 = $2,700 per month of NAT processing, and gateway endpoints for S3 have no hourly or data processing charge.
- C is wrong: a NAT instance still costs money to run, has limited bandwidth, and must be managed and made highly available.
- D is wrong: Transfer Acceleration adds a per-GB charge and does not bypass the NAT gateway.

**Key phrases:** 60 TB per month · same Region · NAT gateway · $0.045 per GB · without changing application code
**Hint:** Multiply 60 TB by $0.045 per GB. Which S3 endpoint type has no hourly or per-GB charge?

---

## ALPHA-153: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** hard · **Pillars:** Cost Optimization

### Question
A reporting server runs on one Amazon EC2 instance only during business hours: 10 hours per day, 5 days per week. It must not be interrupted while it runs. Assume the On-Demand price is $0.20 per hour and a 1-year No Upfront Standard Reserved Instance costs an effective $0.126 per hour, billed for every hour of the term whether or not the instance runs. Which purchasing option is the MOST cost-effective?

### Options
- **A.** Use On-Demand and stop the instance outside business hours on a schedule.
- **B.** Purchase a 1-year No Upfront Standard Reserved Instance.
- **C.** Purchase a 1-year Compute Savings Plan with a commitment of $0.126 per hour.
- **D.** Run the server on Spot Instances during business hours.

### Correct answer: A

**Summary:** A reservation pays off only above its break-even usage (here $0.126 / $0.20 = 63%); a server running 30% of the week is cheaper On-Demand on a schedule.

### Explanation
- A is correct: 50 hours x $0.20 = $10 per week; the instance runs only 50 / 168 = 30% of the time, below the 63% break-even point ($0.126 / $0.20).
- B is wrong: 168 hours x $0.126 = about $21 per week, more than double the scheduled On-Demand cost.
- C is wrong: the commitment is also billed every hour, used or not, so it costs about the same as the Reserved Instance.
- D is wrong: Spot is cheap but can be interrupted with a 2-minute warning, which the requirement rules out.

**Key phrases:** 10 hours per day, 5 days per week · must not be interrupted · $0.20 per hour · $0.126 per hour · every hour of the term · MOST cost-effective
**Hint:** A reservation is paid for all 168 hours in a week. Compare that with paying On-Demand only for the hours the instance runs.

---

## ALPHA-154: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability

### Question
An Amazon RDS for PostgreSQL database stores order data, and automated backups are enabled with one daily snapshot. The business must be able to recover from accidental data deletion or corruption with a recovery point objective (RPO) of 15 minutes. Which approach meets the RPO?

### Options
- **A.** Convert the instance to a Multi-AZ deployment.
- **B.** Schedule a manual snapshot every hour with Amazon EventBridge.
- **C.** Use point-in-time restore from the automated backups to a time just before the incident.
- **D.** Create a cross-Region read replica.

### Correct answer: C

**Summary:** RPO = worst-case gap since the last recoverable point: daily snapshots give 24 hours, RDS point-in-time restore about 5 minutes; replicas copy mistakes.

### Explanation
- A is wrong: the standby is updated synchronously, so it receives the deletion at the same moment and offers no earlier copy.
- B is wrong: hourly snapshots can lose up to 60 minutes of data, four times the 15-minute RPO.
- C is correct: RDS uploads transaction logs about every 5 minutes, so point-in-time restore can recover to within about 5 minutes, inside the 15-minute RPO.
- D is wrong: the replica applies the deletion within seconds, so it protects against a Regional outage, not against bad writes.

**Key phrases:** one daily snapshot · accidental data deletion or corruption · recovery point objective (RPO) of 15 minutes
**Hint:** Worst-case data loss = time since the last recoverable point. A replica copies a bad DELETE within seconds.

---

## ALPHA-155: Monitoring, Management & Governance
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Operational Excellence, Reliability

### Question
An Amazon CloudWatch alarm watches an application's error rate with a 1-minute period. Short one-minute spikes are normal and must not trigger the alarm, but a real problem must page the on-call engineer within 3 minutes of starting. Which alarm configuration meets both requirements?

### Options
- **A.** Alarm when 1 out of 1 datapoints breaches the threshold.
- **B.** Alarm when 5 out of 5 datapoints breach the threshold.
- **C.** Change the period to 5 minutes and alarm when 1 out of 1 datapoints breaches.
- **D.** Alarm when 2 out of 3 datapoints breach the threshold.

### Correct answer: D

**Summary:** M out of N alarms filter out single spikes; time to alarm is about M x period.

### Explanation
- A is wrong: every one-minute spike would trigger the alarm.
- B is wrong: a real problem needs 5 minutes of breaching data before the alarm fires, missing the 3-minute requirement.
- C is wrong: a 5-minute period cannot alarm within 3 minutes, and averaging over 5 minutes can hide a real problem.
- D is correct: a single spike is only 1 breaching datapoint and is ignored, while a sustained problem fires after 2 minutes.

**Key phrases:** 1-minute period · one-minute spikes · within 3 minutes
**Hint:** Time to alarm is roughly the number of breaching datapoints needed x the period.

---

## ALPHA-156: Application Integration
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization

### Question
Workers on Amazon EC2 instances consume messages from an Amazon SQS queue. Each instance processes 10 messages per second, and a message may wait at most 60 seconds in the queue. At peak the queue holds 18,000 visible messages. The team uses target tracking on a custom backlog-per-instance metric. What target value should the team set, and how many instances will the group run at peak?

### Options
- **A.** A target of 10 messages per instance; 1,800 instances at peak.
- **B.** A target of 600 messages per instance; 30 instances at peak.
- **C.** A target of 60 messages per instance; 300 instances at peak.
- **D.** A target of 70% average CPU utilization; about 30 instances at peak.

### Correct answer: B

**Summary:** Backlog-per-instance target = processing rate x acceptable latency; instances = queue depth / target.

### Explanation
- A is wrong: 10 is the processing rate per second, not the backlog an instance can clear in 60 seconds.
- B is correct: 10 messages/s x 60 s = 600 messages per instance, and 18,000 / 600 = 30 instances.
- C is wrong: 60 is the wait time in seconds, not a backlog; this would run 10 times more instances than needed.
- D is wrong: CPU utilization does not reflect how many messages are waiting, so it cannot guarantee the 60-second wait.

**Key phrases:** 10 messages per second · at most 60 seconds · 18,000 visible messages · backlog-per-instance
**Hint:** Acceptable backlog per instance = messages an instance processes per second x the longest acceptable wait.

---

## ALPHA-157: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Reliability

### Question
A company uploads a 2 TB database export file to Amazon S3 each week using multipart upload. The upload tool is configured with a 100 MB part size, and the upload fails before completing. Assume 1 TB = 1,000,000 MB. Which change will allow the upload to succeed?

### Options
- **A.** Upload the file with a single PUT request instead of multipart upload.
- **B.** Reduce the part size to 50 MB so that each part uploads faster.
- **C.** Enable S3 Transfer Acceleration on the bucket.
- **D.** Increase the part size to at least 200 MB, for example 256 MB.

### Correct answer: D

**Summary:** Multipart upload allows at most 10,000 parts (5 MB to 5 GB each), so minimum part size = file size / 10,000; a single PUT tops out at 5 GB.

### Explanation
- A is wrong: a single PUT can upload at most 5 GB, far less than 2 TB.
- B is wrong: 50 MB parts would need 40,000 parts, even further over the 10,000-part limit.
- C is wrong: Transfer Acceleration speeds up the network path but does not change the 10,000-part limit.
- D is correct: 2,000,000 MB / 100 MB = 20,000 parts, over the 10,000-part limit; the minimum part size is 2,000,000 / 10,000 = 200 MB, and 256 MB needs about 7,813 parts.

**Key phrases:** 2 TB · multipart upload · 100 MB part size · fails before completing
**Hint:** A multipart upload can have at most 10,000 parts. How many 100 MB parts does 2 TB need?

---

## ALPHA-158: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence

### Question
A nightly AWS Lambda function reads a manifest of 50,000 records and calls an external API once per record. Each call takes about 40 ms and the records are independent of each other. The function processes the records in a loop and now times out every night. Which solution will complete the job with the LEAST operational overhead?

### Options
- **A.** Increase the function timeout to 60 minutes.
- **B.** Use an AWS Step Functions Distributed Map state to process the manifest in batches of 5,000 records, each handled by its own Lambda invocation.
- **C.** Increase the function's memory to 10,240 MB so that each record is processed faster.
- **D.** Configure provisioned concurrency for the function.

### Correct answer: B

**Summary:** Lambda runs at most 15 minutes per invocation; if records x time per record exceeds that, split the work (for example with a Step Functions Distributed Map).

### Explanation
- A is wrong: the maximum Lambda timeout is 15 minutes (900 seconds), and the loop needs about 2,000 seconds.
- B is correct: 50,000 x 40 ms = 2,000 seconds, more than the 900-second limit; batches of 5,000 records take about 200 seconds each and run in parallel, with retries handled by Step Functions.
- C is wrong: the time is spent waiting on the external API, so more memory and CPU barely shorten it.
- D is wrong: provisioned concurrency removes cold starts but does not raise the 15-minute limit on a single invocation.

**Key phrases:** 50,000 records · 40 ms · independent of each other · times out · LEAST operational overhead
**Hint:** How long does 50,000 x 40 ms take, and what is the maximum Lambda timeout?

---

## ALPHA-159: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Reliability

### Question
An order system publishes events to an Amazon SQS FIFO queue, using the order ID as the message group ID so that events for each order stay in sequence. The queue does not use high throughput mode. Producers call SendMessage once per event, and at peak they must send 2,500 messages per second, but calls are being throttled. Which TWO changes will each let the producers reach 2,500 messages per second while keeping per-order ordering? (Select TWO.)

### Options
- **A.** Send the messages with SendMessageBatch in batches of 5.
- **B.** Send the messages with SendMessageBatch in batches of 10.
- **C.** Replace the FIFO queue with a standard queue.
- **D.** Enable high throughput mode for the FIFO queue.
- **E.** Add more consumer instances to read from the queue.

### Correct answers: B, D (choose 2)

**Summary:** A FIFO queue without high throughput mode allows 300 calls/s per action, or 3,000 messages/s with batches of 10; high throughput mode goes further while keeping per-group order.

### Explanation
- A is wrong: 300 calls per second x 5 messages = 1,500 messages per second, still below 2,500.
- B is correct: 300 calls per second x 10 messages = 3,000 messages per second, which covers 2,500 (consumers should also receive and delete in batches).
- C is wrong: a standard queue has nearly unlimited throughput but does not guarantee order, which breaks the per-order sequence.
- D is correct: high throughput mode raises the limit per message group ID, and with many distinct order IDs the queue can far exceed 2,500 messages per second.
- E is wrong: the throttling happens on the send side, so more consumers do not help the producers.

**Key phrases:** SQS FIFO queue · message group ID · does not use high throughput mode · SendMessage once per event · 2,500 messages per second · TWO
**Hint:** Without high throughput mode, a FIFO queue supports 300 API calls per second per action, and a batch call can carry up to 10 messages.

---

## ALPHA-160: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Cost Optimization, Performance Efficiency

### Question
A data lake bucket in Amazon S3 uses SSE-KMS with a customer managed key. Applications perform 6,000 GET and 5,000 PUT requests per second, and each request causes a call to AWS KMS. The account's KMS quota for cryptographic operations in the Region is 10,000 requests per second, shared by all keys, and requests are failing with ThrottlingException. The security team requires that the customer managed key remain in use. Which solution is the MOST cost-effective?

### Options
- **A.** Switch the bucket's default encryption to SSE-S3.
- **B.** Add exponential backoff and retries to the applications.
- **C.** Create a second customer managed key and encrypt half of the objects with it.
- **D.** Enable S3 Bucket Keys for SSE-KMS on the bucket.

### Correct answer: D

**Summary:** SSE-KMS makes one KMS call per S3 request against an account-wide quota; S3 Bucket Keys cut those calls (and their cost) by up to 99% while keeping the customer managed key.

### Explanation
- A is wrong: SSE-S3 avoids KMS calls but stops using the customer managed key, which the security team requires.
- B is wrong: retries smooth short bursts, but the sustained 11,000 calls per second stays above the 10,000 quota, so requests keep failing or queue up.
- C is wrong: the quota is shared by all keys in the account and Region, so two keys still share the same 10,000 requests per second.
- D is correct: 6,000 + 5,000 = 11,000 KMS calls per second exceeds the 10,000 quota; a bucket key lets S3 generate data keys from a bucket-level key, cutting KMS calls and KMS costs by up to 99% (existing objects can be re-encrypted with a copy to benefit).

**Key phrases:** SSE-KMS with a customer managed key · 6,000 GET and 5,000 PUT requests per second · 10,000 requests per second · shared by all keys · ThrottlingException · MOST cost-effective
**Hint:** Add up the KMS calls per second and compare with the quota. Which S3 feature cuts the number of KMS calls instead of spreading them out?
