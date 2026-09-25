# AWS SAA-C03 Practice Questions: Set Beta (101 questions)

---

## BETA-001: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** easy · **Pillars:** Security, Operational Excellence

### Question
A company is developing a web application that requires secure storage for database credentials and API tokens. The application runs on Amazon EC2 instances. The company must ensure that the secrets are securely stored. The company must be able to rotate the secrets without updating the application code. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Store the secrets in AWS Systems Manager Parameter Store by using secure string parameters. Configure an AWS Systems Manager Automation workflow to rotate the secrets on a regular schedule. Update the application to retrieve the parameters at startup and to cache the parameters in memory.
- **B.** Use environment variables on each EC2 instance to store the secrets. Apply an IAM policy that allows only the application role to access the environment variables.
- **C.** Store the secrets in AWS Secrets Manager. Configure automatic rotation of the credentials. Update the application to retrieve the secrets at runtime through the AWS SDK.
- **D.** Place the secrets in a local configuration file on each EC2 instance. Encrypt the files by using an AWS KMS key. Apply file system permissions to restrict user access. Regularly rotate the KMS key.

### Correct answer: C

**Summary:** Secrets Manager stores secrets and rotates them automatically; apps fetch the current value at runtime, so rotation needs no code change.

### Explanation
- A is wrong: Parameter Store has no built-in rotation, so the team must build and maintain its own Automation workflow, and caching values at startup means the app keeps stale secrets after a rotation.
- B is wrong: environment variables are plain text on the instance, IAM policies cannot control access to them, and they cannot be rotated without redeploying.
- C is correct: Secrets Manager encrypts secrets with KMS and has built-in automatic rotation; because the app reads the secret at runtime, a rotated value is picked up with no code change.
- D is wrong: local files must be copied to every instance and rotated by hand, and rotating the KMS key does not change the secrets themselves.

**Key phrases:** database credentials and API tokens · rotate the secrets without updating the application code · LEAST operational overhead
**Hint:** One service stores secrets and rotates them on a schedule by itself. Which option needs no rotation workflow that you build?

---

## BETA-002: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization, Operational Excellence

### Question
A company is building a new web application on AWS. The application needs to consume files from a legacy on-premises application that runs a batch process and outputs approximately 1 GB of data every night to an NFS file mount. A solutions architect needs to design a storage solution that requires minimal changes to the legacy application and keeps costs low. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Deploy an Outpost in AWS Outposts to the on-premises location where the legacy application is stored. Configure the legacy application and the web application to store and retrieve the files in Amazon S3 on the Outpost.
- **B.** Deploy an AWS Storage Gateway Volume Gateway on premises. Point the legacy application to the Volume Gateway. Configure the web application to use the Amazon S3 bucket that the Volume Gateway uses.
- **C.** Deploy an Amazon S3 interface endpoint on AWS. Reconfigure the legacy application to store the files directly on an Amazon S3 endpoint. Configure the web application to retrieve the files from Amazon S3.
- **D.** Deploy an Amazon S3 File Gateway on premises. Point the legacy application to the File Gateway. Configure the web application to retrieve the files from the S3 bucket that the File Gateway uses.

### Correct answer: D

**Summary:** S3 File Gateway exposes an on-premises NFS/SMB share whose files land as objects in S3, so cloud apps can read them directly.

### Explanation
- A is wrong: an Outpost is a rack of AWS hardware on premises, far too expensive for 1 GB a night.
- B is wrong: Volume Gateway presents iSCSI block volumes, not an NFS share, and its data is stored as EBS snapshots that the web application cannot read as S3 objects.
- C is wrong: the legacy application would have to be rewritten to call the S3 API instead of writing to an NFS mount.
- D is correct: S3 File Gateway presents an NFS share on premises and writes each file as an S3 object, so the legacy app is unchanged and the web app reads from the bucket.

**Key phrases:** NFS file mount · minimal changes to the legacy application · MOST cost-effectively
**Hint:** The legacy app writes to NFS. Which gateway presents an NFS share on premises and stores the files as S3 objects?

---

## BETA-003: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence

### Question
An analytics company wants to deploy a custom extract, transform, and load (ETL) solution as a containerized application on AWS. The application requires high-performance access to files that are in a centralized repository. File processing can take up to 1 hour to finish. Which solution will meet these requirements?

### Options
- **A.** Deploy an AWS Lambda function from a container image. Create and attach an Amazon EFS file system to the function.
- **B.** Deploy containers on Amazon ECS with the Amazon EC2 launch type. Configure the EC2 instances to use instance store volumes.
- **C.** Deploy containers on Amazon ECS with the AWS Fargate launch type. Mount an Amazon EFS file system to the containers.
- **D.** Create an Amazon S3 Express One Zone bucket to store the files. Deploy an AWS Lambda function from a container image. Process files from the S3 Express One Zone bucket.

### Correct answer: C

**Summary:** Long-running containers that share files: ECS on Fargate with an EFS mount; Lambda is out once a job can exceed 15 minutes.

### Explanation
- A is wrong: Lambda functions time out after 15 minutes, but processing can take up to an hour.
- B is wrong: instance store volumes are local to each instance, so they are not a centralized repository, and their data is lost when an instance stops.
- C is correct: Fargate runs the containers for as long as needed without managing servers, and EFS gives every task shared, scalable file access.
- D is wrong: the Lambda 15-minute limit still applies, however fast S3 Express One Zone is.

**Key phrases:** containerized application · high-performance access to files · centralized repository · up to 1 hour
**Hint:** Lambda stops at 15 minutes. Which container platform runs for an hour without servers to manage and can mount a shared file system?

---

## BETA-004: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Operational Excellence

### Question
A media company stores customer-uploaded videos in an Amazon S3 bucket with the Standard storage class. The company wants to create an S3 Lifecycle configuration. The company will set the maximum retention time to 7 days. However, the configuration must delete any video that is more than 1 TB in size after 48 hours. Which solution will meet these requirements?

### Options
- **A.** Create a single S3 Lifecycle configuration that has two rules. Configure the first rule to expire objects after 48 hours with a filter of ObjectSizeGreaterThan and a value of 1 TB. Configure the second rule to expire objects after 7 days.
- **B.** Create two S3 Lifecycle configurations. Include a rule in the first configuration to expire objects after 48 hours by using a Prefix filter of LargeFiles, Include a rule in the second configuration to expire objects after 7 days.
- **C.** Create a single S3 Lifecycle configuration that has two rules. Configure the first rule to expire objects after 48 hours. Configure the second rule to expire objects after 7 days.
- **D.** Create two S3 Lifecycle configurations. Include a rule in the first configuration to expire objects after 48 hours. Include a rule in the second configuration to expire objects after 7 days by using a filter of ObjectSizeLessThan and a value of 1 TB.

### Correct answer: A

**Summary:** One lifecycle configuration per bucket; use an ObjectSizeGreaterThan filter to give large objects a shorter expiration.

### Explanation
- A is correct: a single configuration can hold several rules; the size filter expires videos over 1 TB after 2 days, and the second rule expires everything else after 7 days.
- B is wrong: a bucket can have only one lifecycle configuration, and a prefix filter does not identify large files.
- C is wrong: without a size filter the 48-hour rule would delete every video after 2 days.
- D is wrong: a bucket can have only one lifecycle configuration, and the 48-hour rule has no filter, so it would delete every video after 2 days.

**Key phrases:** maximum retention time to 7 days · more than 1 TB in size after 48 hours
**Hint:** A bucket has only one lifecycle configuration, and a rule can filter on object size.

---

## BETA-005: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Operational Excellence, Reliability

### Question
A company uses AWS Backup to create weekly backups of Amazon EC2 instances. The company needs to confirm that restored instances function correctly by running automated tests after each restore completes. The company needs an event-driven solution that minimizes operational overhead. Which solution will meet these requirements?

### Options
- **A.** Use Amazon EventBridge to detect AWS Backup restore completion events. Configure an EventBridge rule to invoke AWS Lambda that uses AWS Systems Manager Run Command to run validation tests on the restored instance.
- **B.** Configure an Amazon EventBridge scheduled rule to check the AWS Backup restore status hourly. Use AWS Lambda to identify completed restores and run validation tests on the restored instances.
- **C.** Configure AWS Systems Manager State Manager to run validation scripts on restored instances at scheduled intervals. Use Amazon SNS to send completion notifications.
- **D.** Create an AWS Lambda function to poll AWS Backup every 15 minutes for completed restore jobs. Run validation scripts on restored instances and log the results to Amazon CloudWatch Logs.

### Correct answer: A

**Summary:** React to AWS Backup restore-completed events with EventBridge, and run tests on the instance with Systems Manager Run Command.

### Explanation
- A is correct: EventBridge receives the restore-completed event as it happens and invokes Lambda, which uses Run Command to run tests on the new instance without SSH.
- B is wrong: an hourly schedule is polling, not event-driven, and it delays testing by up to an hour.
- C is wrong: State Manager runs on a schedule, so it is not triggered by restores and may test at the wrong time.
- D is wrong: polling every 15 minutes is not event-driven and adds custom code to maintain.

**Key phrases:** after each restore completes · event-driven · minimizes operational overhead
**Hint:** AWS Backup emits an event when a restore job finishes. What reacts to events, and what runs commands on instances?

---

## BETA-006: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security

### Question
A company is using an Amazon RDS for MySQL DB instance for its internal applications. A security audit shows that the DB instance is not encrypted at rest. The company's solutions architect needs to encrypt the DB instance. What should the solutions architect do to meet this requirement?

### Options
- **A.** Stop the DB instance and modify it to enable encryption. Apply this setting immediately without waiting for the next scheduled RDS maintenance window.
- **B.** Stop the DB instance and create an encrypted snapshot. Restore the encrypted snapshot to a new encrypted DB instance. Delete the original DB instance, and update the applications to point to the new encrypted DB instance.
- **C.** Stop the DB instance and create a snapshot. Copy the snapshot into another encrypted snapshot. Restore the encrypted snapshot to a new encrypted DB instance. Delete the original DB instance, and update the applications to point to the new encrypted DB instance.
- **D.** Create an encrypted read replica of the DB instance. Promote the read replica to primary. Delete the original DB instance, and update the applications to point to the new encrypted DB instance.

### Correct answer: C

**Summary:** To encrypt an unencrypted RDS instance: snapshot, copy the snapshot with encryption, restore from the encrypted copy, then cut over.

### Explanation
- A is wrong: RDS cannot enable encryption on an existing unencrypted DB instance.
- B is wrong: a snapshot of an unencrypted instance is itself unencrypted; encryption is only added when the snapshot is copied.
- C is correct: copying the snapshot is the step that can add encryption, and restoring the encrypted copy creates an encrypted instance for the applications to use.
- D is wrong: RDS for MySQL cannot create an encrypted read replica from an unencrypted source.

**Key phrases:** not encrypted at rest · encrypt the DB instance
**Hint:** You cannot turn on encryption for an existing RDS instance or its snapshot directly. Which step creates an encrypted copy?

---

## BETA-007: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence

### Question
A financial company wants to automate the failover of a multi-Region application that spans three AWS accounts. The company wants to orchestrate recovery across the three accounts from a central account. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Use Region switch in Amazon Application Recovery Controller to orchestrate failover across the three accounts.
- **B.** Define multi-Region failover procedure runbooks by using AWS Systems Manager Automation in the secondary Region.
- **C.** Create Amazon EventBridge rules that invoke an AWS Lambda function in the secondary Region in each account to run the failover steps.
- **D.** Run the failover procedure on an Amazon EC2 instance in the secondary Region that monitors Amazon Route 53 health checks in each account.

### Correct answer: A

**Summary:** Application Recovery Controller Region switch runs managed, cross-account multi-Region failover plans from a central account.

### Explanation
- A is correct: Region switch in Application Recovery Controller orchestrates multi-Region failover plans across accounts from a central account, with no custom tooling to maintain.
- B is wrong: Automation runbooks defined per Region still need cross-account orchestration and upkeep that the team would build.
- C is wrong: a Lambda function in each account is custom code with no central orchestration.
- D is wrong: a self-managed EC2 instance is a single point of failure and entirely custom logic.

**Key phrases:** multi-Region application · three AWS accounts · from a central account · LEAST operational overhead
**Hint:** Look for the managed feature that runs a multi-Region recovery plan across accounts from one place.

---

## BETA-008: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A company is building a gaming application that needs to send unique events to multiple leaderboards, player matchmaking systems, and authentication services concurrently. The company requires an AWS-based event-driven system that delivers events in order and supports a publish-subscribe model. The gaming application must be the publisher, and the leaderboards, matchmaking systems, and authentication services must be the subscribers. Which solution will meet these requirements?

### Options
- **A.** Amazon EventBridge event buses.
- **B.** Amazon SNS FIFO topics.
- **C.** Amazon SNS standard topics.
- **D.** Amazon SQS FIFO queues.

### Correct answer: B

**Summary:** SNS FIFO topics combine pub/sub fan-out with strict ordering and deduplication.

### Explanation
- A is wrong: EventBridge routes events to many targets but does not guarantee ordered delivery.
- B is correct: SNS FIFO topics fan each event out to every subscriber and preserve order within a message group.
- C is wrong: standard SNS topics are pub/sub but do not guarantee order.
- D is wrong: an SQS FIFO queue is ordered but point-to-point; each message is consumed once, not delivered to every subscriber.

**Key phrases:** delivers events in order · publish-subscribe model · must be the subscribers
**Hint:** You need both publish-subscribe fan-out and ordering. Which service offers both?

---

## BETA-009: Disaster Recovery & Migration
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** medium · **Pillars:** Operational Excellence

### Question
A company uses a Microsoft SQL Server database. The company's applications are connected to the database. The company wants to migrate to an Amazon Aurora PostgreSQL database with minimal changes to the application code. Which combination of steps will meet these requirements? (Select TWO.)

### Options
- **A.** Use the AWS SCT to rewrite the SQL queries in the applications.
- **B.** Enable Babelfish on Aurora PostgreSQL to run the SQL queries from the applications.
- **C.** Migrate the database schema and data by using the AWS SCT and AWS DMS.
- **D.** Use Amazon RDS Proxy to connect the applications to Aurora PostgreSQL.
- **E.** Use AWS DMS to rewrite the SQL queries in the applications.

### Correct answers: B, C (choose 2)

**Summary:** SQL Server to Aurora PostgreSQL with little code change: Babelfish runs T-SQL, and SCT plus DMS move the schema and data.

### Explanation
- A is wrong: rewriting the application queries is exactly the code change the company wants to avoid.
- B is correct: Babelfish lets Aurora PostgreSQL accept SQL Server (T-SQL) queries and the TDS protocol, so the applications keep their existing SQL.
- C is correct: SCT converts the schema and DMS migrates the data from SQL Server to Aurora PostgreSQL.
- D is wrong: RDS Proxy pools connections but does not translate SQL Server queries.
- E is wrong: DMS migrates data; it does not rewrite application code.

**Key phrases:** Microsoft SQL Server · Aurora PostgreSQL · minimal changes to the application code · TWO
**Hint:** One feature lets Aurora PostgreSQL understand SQL Server queries; another pair of tools moves the schema and data.

---

## BETA-010: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A healthcare analytics company runs an Amazon Redshift cluster that contains patient outcome data and clinical research records. Regulations require the company to have the ability to restore the data warehouse to a separate AWS Region in the event of an emergency. Which solution will meet these requirements?

### Options
- **A.** Enable concurrency scaling.
- **B.** Configure cross-Region snapshots.
- **C.** Extend the snapshot retention period.
- **D.** Deploy the cluster to multiple Availability Zones.

### Correct answer: B

**Summary:** Redshift cross-Region snapshot copy lets you restore the warehouse in another Region.

### Explanation
- A is wrong: concurrency scaling adds query capacity; it does not protect against a Regional failure.
- B is correct: cross-Region snapshot copy automatically copies snapshots to another Region, where the cluster can be restored.
- C is wrong: longer retention keeps more snapshots, but still in the same Region.
- D is wrong: Multi-AZ protects against an Availability Zone failure, not a Regional one.

**Key phrases:** restore the data warehouse to a separate AWS Region
**Hint:** Which option puts a restorable copy of the cluster in another Region?

---

## BETA-011: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** easy · **Pillars:** Operational Excellence, Performance Efficiency

### Question
A company wants to launch a website based on a serverless architecture on AWS. Each day, the website will feature one product on sale for a period of 24 hours. The website content will consist of static HTML and JavaScript files. The backend will handle API requests for product information and order processing. The company wants to handle millions of requests each hour with millisecond latency during peak hours. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Host the website in multiple Amazon S3 buckets. Configure Amazon CloudFront distributions. Set the S3 buckets as origins for the distributions. Store the order data in a separate S3 bucket.
- **B.** Deploy the website on Amazon EC2 instances that run in Auto Scaling groups across multiple Availability Zones. Deploy an Application Load Balancer (ALB), and set the EC2 instances as targets. Deploy a second ALB in front of the backend APIs. Store the order data in Amazon RDS for MySQL.
- **C.** Deploy the website on containers. Host the containers in Amazon EKS. Use the Kubernetes Cluster Autoscaler to scale the pods based on traffic. Store the order data in Amazon RDS for MySQL.
- **D.** Host the website's static content in an Amazon S3 bucket. Configure an Amazon CloudFront distribution. Set the S3 bucket as the origin for the distribution. Use an Amazon API Gateway REST API and AWS Lambda functions to handle the backend APIs. Store the order data in Amazon DynamoDB.

### Correct answer: D

**Summary:** Serverless web stack: S3 + CloudFront for static content, API Gateway + Lambda for the API, DynamoDB for data.

### Explanation
- A is wrong: S3 cannot run the backend API logic, and storing orders as S3 objects is not a transactional data store.
- B is wrong: EC2, ALBs and RDS are servers to patch and scale, not a serverless design.
- C is wrong: EKS clusters and RDS need significant operations work and are not serverless.
- D is correct: S3 and CloudFront serve static content at the edge, API Gateway and Lambda scale the API automatically, and DynamoDB handles millions of requests with single-digit millisecond latency.

**Key phrases:** serverless architecture · static HTML and JavaScript · millions of requests each hour · LEAST operational overhead
**Hint:** Static files, an API, and order data, all serverless and able to absorb huge bursts.

---

## BETA-012: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
A company hosts its applications in multiple private and public subnets in a VPC. The applications in the private subnets need to access an API. The API is available on the internet and is hosted in the company's on-premises data center. A solutions architect needs to establish connectivity for applications in the private subnets. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Create a transit gateway to connect the VPC to the on-premises network. Use the transit gateway to route API calls from the private subnets to the on-premises data center.
- **B.** Create a NAT gateway in the public subnet of the VPC. Use the NAT gateway to allow the private subnets to access the API over the internet.
- **C.** Establish an AWS PrivateLink connection to connect the VPC to the on-premises network. Use PrivateLink to make API calls from the private subnets to the on-premises data center.
- **D.** Implement an AWS Site-to-Site VPN connection between the VPC and the on-premises data center. Use the VPN connection to make API calls from the private subnets to the on-premises data center.

### Correct answer: B

**Summary:** When a target is already on the internet, a NAT gateway is the cheapest way for private subnets to reach it.

### Explanation
- A is wrong: a transit gateway also needs a VPN or Direct Connect attachment and costs more, when the API is already public.
- B is correct: the API is on the internet, so a NAT gateway lets private instances reach it without new private connectivity.
- C is wrong: PrivateLink connects to services behind a Network Load Balancer on AWS, not to an on-premises network.
- D is wrong: a VPN would work but adds cost and setup for an API that is already reachable over the internet.

**Key phrases:** private subnets · available on the internet · MOST cost-effectively
**Hint:** The API is already reachable over the internet. What is the simplest way out of a private subnet?

---

## BETA-013: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Cost Optimization

### Question
A company has a serverless web application that is comprised of AWS Lambda functions. The application experiences spikes in traffic that cause increased latency because of cold starts. The company wants to improve the application's ability to handle traffic spikes and to minimize latency. The solution must optimize costs during periods when traffic is low. Which solution will meet these requirements?

### Options
- **A.** Configure provisioned concurrency for the Lambda functions. Use AWS Application Auto Scaling to adjust the provisioned concurrency.
- **B.** Launch Amazon EC2 instances in an Auto Scaling group. Add a scheduled scaling policy to launch additional EC2 instances during peak traffic periods.
- **C.** Configure provisioned concurrency for the Lambda functions. Set a fixed concurrency level to handle the maximum expected traffic.
- **D.** Create a recurring schedule in Amazon EventBridge Scheduler. Use the schedule to invoke the Lambda functions periodically to warm the functions.

### Correct answer: A

**Summary:** Provisioned concurrency removes cold starts; Application Auto Scaling adjusts it so you do not pay for peak capacity when idle.

### Explanation
- A is correct: provisioned concurrency keeps environments initialized, and Application Auto Scaling raises and lowers it with demand so quiet periods cost less.
- B is wrong: moving to EC2 abandons the serverless design and adds servers to manage.
- C is wrong: a fixed level sized for peak traffic is paid for all the time, including when traffic is low.
- D is wrong: warming pings keep only a few environments warm and do not help a sudden spike that needs many new ones.

**Key phrases:** cold starts · traffic spikes · optimize costs during periods when traffic is low
**Hint:** Pre-warmed environments remove cold starts. How do you avoid paying for peak capacity all day?

---

## BETA-014: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Reliability, Performance Efficiency

### Question
A solutions architect is designing the cloud architecture for a new stateless application that will be deployed on AWS. The solutions architect created an Amazon Machine Image (AMI) and launch template for the application. Based on the number of jobs that need to be processed, the processing must run in parallel while adding and removing application Amazon EC2 instances as needed. The application must be loosely coupled. The job items must be durably stored. Which solution will meet these requirements?

### Options
- **A.** Create an Amazon SNS topic to send the jobs that need to be processed. Create an Auto Scaling group by using the launch template with the scaling policy set to add and remove EC2 instances based on CPU usage.
- **B.** Create an Amazon SQS queue to hold the jobs that need to be processed. Create an Auto Scaling group by using the launch template with the scaling policy set to add and remove EC2 instances based on network usage.
- **C.** Create an Amazon SQS queue to hold the jobs that need to be processed. Create an Auto Scaling group by using the launch template with the scaling policy set to add and remove EC2 instances based on the number of items in the SQS queue.
- **D.** Create an Amazon SNS topic to send the jobs that need to be processed. Create an Auto Scaling group by using the launch template with the scaling policy set to add and remove EC2 instances based on the number of messages published to the SNS topic.

### Correct answer: C

**Summary:** Queue the jobs in SQS and scale the Auto Scaling group on queue depth.

### Explanation
- A is wrong: SNS pushes messages and does not store them for workers to pull later, and CPU usage does not reflect the job backlog.
- B is wrong: SQS is right, but network usage does not reflect how many jobs are waiting.
- C is correct: SQS stores jobs durably and decouples producers from workers, and scaling on the number of messages in the queue matches capacity to the backlog.
- D is wrong: SNS does not store jobs, and the number of messages published is not the backlog.

**Key phrases:** loosely coupled · durably stored · adding and removing application Amazon EC2 instances
**Hint:** Jobs must wait durably until a worker takes them, and the fleet should grow with the backlog.

---

## BETA-015: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability

### Question
A company recently launched a new product that is highly available in one AWS Region. The product consists of an application that runs on Amazon ECS, a public Application Load Balancer (ALB), and an Amazon DynamoDB table. The company wants a solution that will make the application highly available across Regions. Which combination of steps will meet these requirements? (Select THREE.)

### Options
- **A.** In a different Region, deploy the application to a new ECS cluster that is accessible through a new ALB.
- **B.** Create an Amazon Route 53 failover record.
- **C.** Modify the DynamoDB table to create a DynamoDB global table.
- **D.** In the same Region, deploy the application to an Amazon EKS cluster that is accessible through a new ALB.
- **E.** Modify the DynamoDB table to create global secondary indexes (GSIs).
- **F.** Create an AWS PrivateLink endpoint for the application.

### Correct answers: A, B, C (choose 3)

**Summary:** Multi-Region HA: a second copy of the app stack, DynamoDB global tables for data, and Route 53 failover for traffic.

### Explanation
- A is correct: a second ECS cluster and ALB in another Region gives the application somewhere to run if the first Region fails.
- B is correct: a Route 53 failover record with health checks sends users to the healthy Region.
- C is correct: a DynamoDB global table replicates the data to the other Region automatically.
- D is wrong: another cluster in the same Region does not survive a Regional outage.
- E is wrong: global secondary indexes add query patterns; they do not replicate data across Regions.
- F is wrong: PrivateLink exposes a service privately inside AWS; it does not provide cross-Region failover.

**Key phrases:** highly available across Regions · Amazon ECS · DynamoDB table · THREE
**Hint:** For each tier ask: what runs in the second Region, how does data get there, and how does traffic shift?

---

## BETA-016: Storage & Backup
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A media company is migrating a Microsoft Windows-based application to the AWS Cloud. The company uses the application to analyze media files. The company requires a resilient shared storage solution that the company can access by using the SMB protocol. Which storage solution will meet these requirements?

### Options
- **A.** Use an Amazon S3 bucket to store the media files. Connect the application servers to the bucket.
- **B.** Use Amazon FSx for Windows File Server in a Multi-AZ deployment as shared storage for the application servers.
- **C.** Use an Amazon EBS volume as shared storage for the application servers.
- **D.** Use an Amazon FSx File Gateway as shared storage for the application servers.

### Correct answer: B

**Summary:** Windows shared storage over SMB: FSx for Windows File Server, Multi-AZ for resilience.

### Explanation
- A is wrong: S3 is object storage and cannot be mounted over SMB.
- B is correct: FSx for Windows File Server serves SMB shares, and Multi-AZ keeps a standby in a second Availability Zone with automatic failover.
- C is wrong: a standard EBS volume attaches to a single instance and does not speak SMB.
- D is wrong: FSx File Gateway is an on-premises cache for FSx, not storage for servers running in AWS.

**Key phrases:** Microsoft Windows-based · resilient shared storage · SMB protocol
**Hint:** Windows plus SMB plus resilient shared storage points to one managed file system.

---

## BETA-017: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Reliability

### Question
A company runs a stateless application that is hosted on an Amazon EC2 instance. Users are reporting performance issues. A solutions architect reviews the Amazon CloudWatch metrics for the application and notices that the instance's CPU utilization frequently reaches 90% during business hours. What is the MOST operationally efficient solution that will improve the application's responsiveness?

### Options
- **A.** Configure CloudWatch logging on the EC2 instance. Configure a CloudWatch alarm for CPU utilization to alert the solutions architect when CPU utilization goes above 90%.
- **B.** Configure an AWS Client VPN connection to allow the application users to connect directly to the EC2 instance private IP address to reduce latency.
- **C.** Create an Auto Scaling group, and assign it to an Application Load Balancer. Configure a target tracking scaling policy that is based on the average CPU utilization of the Auto Scaling group.
- **D.** Create a CloudWatch alarm that activates when the EC2 instance's CPU utilization goes above 80%. Configure the alarm to invoke an AWS Lambda function that vertically scales the instance.

### Correct answer: C

**Summary:** Stateless and CPU-bound: put it in an Auto Scaling group behind an ALB with target tracking on CPU.

### Explanation
- A is wrong: an alarm only reports the problem; it adds no capacity.
- B is wrong: a VPN does not reduce CPU load, and exposing the instance directly is poor practice.
- C is correct: an Auto Scaling group behind an ALB adds and removes instances automatically to hold CPU at the target, and removes the single point of failure.
- D is wrong: resizing the instance needs a stop and start, has an upper limit, and keeps one point of failure.

**Key phrases:** stateless application · CPU utilization frequently reaches 90% · MOST operationally efficient
**Hint:** A stateless app on one busy instance. How do you add capacity automatically?

---

## BETA-018: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** easy · **Pillars:** Performance Efficiency

### Question
A company is migrating a Linux-based web server group to AWS. The web servers must access shared files by using the NFS protocol. The company must not make any changes to the web server application. Which solution will meet these requirements?

### Options
- **A.** Create an Amazon S3 bucket to store the shared files in S3 Standard. Grant the S3 bucket access to the web servers.
- **B.** Configure an Amazon CloudFront distribution. Set an Amazon S3 bucket as the origin. Store the shared files in the S3 bucket.
- **C.** Create an Amazon EFS file system. Mount the EFS file system on the web servers.
- **D.** Create an Amazon FSx for Windows File Server file system. Configure SMB protocol access for the web servers.

### Correct answer: C

**Summary:** Shared NFS storage for Linux servers: Amazon EFS.

### Explanation
- A is wrong: S3 is not an NFS file system, so the application would have to change.
- B is wrong: CloudFront delivers content to viewers; it is not a mountable file system.
- C is correct: EFS is a managed NFS file system that many Linux servers can mount at once with no code change.
- D is wrong: FSx for Windows File Server uses SMB, which the NFS-based application does not use.

**Key phrases:** Linux-based · NFS protocol · must not make any changes
**Hint:** Linux servers sharing files over NFS.

---

## BETA-019: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Operational Excellence, Reliability

### Question
A company needs a backup strategy for a Multi-AZ deployment for Amazon RDS for SQL Server. The company must keep data available for 1 year to maintain compliance. The company must be able to restore the database from the backup. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create an RDS automated snapshot backup daily. Save the backup to an Amazon S3 bucket. Configure the retention of the backup to be 1 year.
- **B.** Manually take an RDS full database backup daily. Save the backup to an Amazon S3 bucket. Configure the retention of the backup to be 1 year.
- **C.** Take a SQL Server transaction backup daily. Save the backup to an Amazon S3 bucket. Configure the retention of the backup to be 1 year.
- **D.** Take an RDS backup by using AWS Backup daily. Configure the retention of the backup to be 1 year.

### Correct answer: D

**Summary:** For RDS retention beyond 35 days, use an AWS Backup plan with a 1-year retention rule.

### Explanation
- A is wrong: RDS automated backups are kept for at most 35 days, and you do not save them to your own S3 bucket.
- B is wrong: daily manual backups are ongoing work that someone must run and clean up.
- C is wrong: managing native SQL Server transaction backups by hand is the most operational work.
- D is correct: an AWS Backup plan takes daily RDS backups and keeps each one for 1 year automatically.

**Key phrases:** Multi-AZ deployment for Amazon RDS for SQL Server · data available for 1 year · LEAST operational overhead
**Hint:** RDS automated backups are kept for at most 35 days. Which service schedules backups and keeps them for a year?

---

## BETA-020: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
An application team uses an organization in AWS Organizations to manage multiple AWS accounts in a dedicated organizational unit (OU). The accounts do not host production workloads. The application team is implementing an e-commerce solution by using Amazon EC2 instances. A solutions architect needs to implement controls to prevent the application team from exceeding the project budget for the application. Which solution will meet this requirement?

### Options
- **A.** Create a usage report in AWS Cost Explorer. Set up automated alerts to notify the application team when usage exceeds the budget so the application team can take immediate actions to reduce costs.
- **B.** Create a fixed monthly budget in AWS Budgets. Create a budget action to apply a service control policy (SCP) to the OU to deny additional usage when the application team reaches the monthly budget. Configure a budget action to send a notification to an Amazon SNS topic that invokes an AWS Lambda function to stop all running EC2 instances.
- **C.** Create an Amazon CloudWatch metric and a CloudWatch alarm for when the application team reaches the monthly budget. Configure the CloudWatch alarm to send a notification to an Amazon SNS topic that invokes an AWS Lambda function to stop all running EC2 instances.
- **D.** Use AWS Cost Anomaly Detection to monitor the application team's usage and to alert the application team about unexpected spending patterns.

### Correct answer: B

**Summary:** AWS Budgets actions can apply an SCP or stop instances when a budget threshold is reached, turning alerts into controls.

### Explanation
- A is wrong: Cost Explorer alerts only notify; nothing stops the spending.
- B is correct: a budget action applies an SCP that blocks new usage for the OU and triggers automation that stops running instances, so the budget is enforced.
- C is wrong: CloudWatch has no built-in metric for a team budget; AWS Budgets tracks spending against a budget.
- D is wrong: Cost Anomaly Detection flags unusual spending but does not enforce a budget.

**Key phrases:** exceeding the project budget · organizational unit (OU)
**Hint:** You need to stop spending, not just report it. Which service can take an action when a budget is reached?

---

## BETA-021: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company must ensure that all Amazon EBS volumes are encrypted. A recent security audit found multiple EBS volumes that were unencrypted. The company has over 100,000 EBS volumes. The company wants to minimize the cost and operational effort required to check encryption on all existing and future EBS volumes. Which solution will meet these requirements?

### Options
- **A.** Call APIs to describe the EBS volumes and to confirm that the EBS volumes are encrypted. Use Amazon EventBridge to schedule an AWS Lambda function to run the API calls on a schedule.
- **B.** Create an Amazon EventBridge rule to monitor Amazon EBS createVolume events. Configure the rule to alert administrators if a volume is not encrypted.
- **C.** Create an IAM policy that requires the use of tags on EBS volumes. Use AWS Cost Explorer to display resources that are not properly tagged. Encrypt the untagged resources.
- **D.** Create an AWS Config rule for Amazon EBS to evaluate whether a volume is encrypted and to flag the volume if it is not encrypted. Set the AWS Config rule's trigger type to be periodic. Set the trigger frequency.

### Correct answer: D

**Summary:** AWS Config rules continuously evaluate every resource against a policy, such as "EBS volumes must be encrypted", with no custom code.

### Explanation
- A is wrong: a scheduled Lambda function that calls describe APIs for 100,000 volumes is custom code that must be maintained, paged through and kept under API limits.
- B is wrong: a rule on CreateVolume events catches only new volumes and misses the existing unencrypted ones.
- C is wrong: tags say nothing about encryption, and Cost Explorer does not report encryption status.
- D is correct: an AWS Config rule evaluates every existing and new volume and flags unencrypted ones, with no code to maintain.

**Key phrases:** over 100,000 EBS volumes · existing and future EBS volumes · minimize the cost and operational effort
**Hint:** You need one managed check that evaluates every volume, old and new, and records which ones fail.

---

## BETA-022: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** easy · **Pillars:** Performance Efficiency

### Question
A company wants to store and perform analytics on structured data in a data warehouse on AWS. The solution must ingest unstructured data from Amazon S3. Which solution will meet these requirements?

### Options
- **A.** Use Amazon Redshift to store structured data and to run analytics. Use AWS Glue to ingest data from Amazon S3 into Amazon Redshift.
- **B.** Use Amazon DynamoDB to store structured data. Use DynamoDB streams and AWS Lambda functions to run analytics. Use a Lambda function to ingest data from Amazon S3 into DynamoDB.
- **C.** Use Amazon Aurora to store structured data. Use Aurora parallel query to run analytics. Use Amazon Athena to ingest data from Amazon S3 into Aurora.
- **D.** Use AWS Lake Formation to store structured data and to run analytics. Use AWS Lambda@Edge functions to ingest data from Amazon S3 into Lake Formation.

### Correct answer: A

**Summary:** Data warehouse = Redshift; AWS Glue is the managed ETL service that loads and transforms S3 data into it.

### Explanation
- A is correct: Redshift is the AWS data warehouse for analytics, and AWS Glue ETL jobs transform S3 data and load it into Redshift.
- B is wrong: DynamoDB is a key-value database, not a data warehouse, and Lambda is not an analytics engine.
- C is wrong: Aurora is a transactional database, and Athena queries S3 in place; it does not load data into Aurora.
- D is wrong: Lake Formation governs a data lake rather than acting as a warehouse, and Lambda@Edge runs at CloudFront edge locations, not for data ingestion.

**Key phrases:** data warehouse · structured data · ingest unstructured data from Amazon S3
**Hint:** Which service is the data warehouse, and which service extracts, transforms and loads data from S3 into it?

---

## BETA-023: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency

### Question
A company has a transaction-processing application that is backed by an Amazon RDS MySQL database. When the load on the application increases, a large number of database connections are opened and closed frequently, which causes latency for the database transactions. A solutions architect determines that the root cause of the latency is poor connection handling by the application. The solutions architect cannot modify the application code. The solutions architect needs to manage database connections to improve the database performance during periods of high load. Which solution will meet these requirements?

### Options
- **A.** Upgrade the database instance to a larger instance type to handle a large number of database connections.
- **B.** Configure Amazon RDS storage autoscaling to dynamically increase the provisioned IOPS.
- **C.** Use Amazon RDS Proxy to pool and share database connections.
- **D.** Convert the database instance to a Multi-AZ deployment.

### Correct answer: C

**Summary:** RDS Proxy pools and reuses database connections without application changes, smoothing connection storms.

### Explanation
- A is wrong: a larger instance can hold more connections, but opening and closing them still costs time and CPU.
- B is wrong: storage autoscaling grows storage; it does nothing about connection handling.
- C is correct: RDS Proxy keeps a pool of open connections and shares them among application requests, removing the open/close overhead with only an endpoint change.
- D is wrong: Multi-AZ adds a standby for failover; the standby does not serve connections.

**Key phrases:** opened and closed frequently · cannot modify the application code · manage database connections
**Hint:** Connection churn, and you cannot change the code. What sits between the app and the database and reuses connections?

---

## BETA-024: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** easy · **Pillars:** Cost Optimization, Security

### Question
A company recently launched a new service that processes medical images. The company scans the images and sends the images from the company's on-premises data center to Amazon EC2 instances through an AWS Direct Connect connection. After processing is complete, the company stores the images in an Amazon S3 bucket. The EC2 instances run in a private subnet. The private subnet has a default route back to the on-premises data center for outbound internet access. The number of images that the company processes is increasing rapidly. The company wants a solution to allow the EC2 instances to save the scanned images to the S3 bucket directly. The solution must not use the public internet. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Configure a gateway VPC endpoint for Amazon S3. Add an entry to the route table of the private subnet for the Amazon S3 endpoint.
- **B.** Configure a NAT gateway in a public subnet. Configure the route table of the private subnet to use the NAT gateway.
- **C.** Configure an interface VPC endpoint for Amazon S3. Modify the image processing application to use the Amazon S3 interface endpoint name.
- **D.** Migrate the EC2 instances into a public subnet. Configure the route table of the public subnet to point to an internet gateway.

### Correct answer: A

**Summary:** A gateway VPC endpoint for S3 gives private subnets private, free access to S3 through a route table entry.

### Explanation
- A is correct: a gateway endpoint keeps S3 traffic on the AWS network through a route table entry and has no hourly or per-GB charge.
- B is wrong: a NAT gateway sends the traffic toward public S3 endpoints and charges per GB processed.
- C is wrong: an interface endpoint also works privately, but it has hourly and per-GB charges and requires the application to use the endpoint name.
- D is wrong: moving the instances into a public subnet sends traffic over the internet, which the requirement forbids.

**Key phrases:** save the scanned images to the S3 bucket directly · must not use the public internet · MOST cost-effectively
**Hint:** Two endpoint types reach S3 privately. One of them is free.

---

## BETA-025: Application Integration
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security, Cost Optimization

### Question
A solutions architect is designing an asynchronous application to process credit card data validation requests for a bank. The application must be secure and be able to process each request at least once. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Use AWS Lambda event source mapping. Set Amazon SQS standard queues as the event source. Use AWS KMS (SSE-KMS) for encryption. Add the kms:Decrypt permission for the Lambda execution role.
- **B.** Use AWS Lambda event source mapping. Use Amazon SQS FIFO queues as the event source. Use SQS managed encryption keys (SSE-SQS) for encryption. Add the encryption key invocation permission for the Lambda function.
- **C.** Use the AWS Lambda event source mapping. Set Amazon SQS FIFO queues as the event source. Use AWS KMS keys (SSE-KMS). Add the kms:Decrypt permission for the Lambda execution role.
- **D.** Use the AWS Lambda event source mapping. Set Amazon SQS standard queues as the event source. Use AWS KMS keys (SSE-KMS) for encryption. Add the encryption key invocation permission for the Lambda function.

### Correct answer: A

**Summary:** SQS standard delivers at least once at the lowest cost; with SSE-KMS, the Lambda execution role needs kms:Decrypt.

### Explanation
- A is correct: a standard queue already delivers each message at least once and costs less than FIFO, and with SSE-KMS the Lambda execution role needs kms:Decrypt to read the messages.
- B is wrong: FIFO adds cost for exactly-once ordering that is not required, and "encryption key invocation permission" is not a real IAM permission.
- C is wrong: the permissions are right, but a FIFO queue costs more and is not needed for at-least-once processing.
- D is wrong: the queue type is right, but the permission is wrong: the execution role needs kms:Decrypt, and there is no "encryption key invocation" permission.

**Key phrases:** at least once · must be secure · MOST cost-effectively
**Hint:** At-least-once delivery is what a standard queue already gives you. Then ask which permission Lambda actually needs to read messages from a KMS-encrypted queue.

---

## BETA-026: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** medium · **Pillars:** Performance Efficiency

### Question
An online gaming company hosts its platform on Amazon EC2 instances behind Network Load Balancers (NLBs) across multiple AWS Regions. The NLBs can route requests to targets over the internet. The company wants to improve the customer playing experience by reducing end-to-end load time for its global customer base. Which solution will meet these requirements?

### Options
- **A.** Create Application Load Balancers (ALBs) in each Region to replace the existing NLBs. Register the existing EC2 instances as targets for the ALBs in each Region.
- **B.** Configure Amazon Route 53 to route equally weighted traffic to the NLBs in each Region.
- **C.** Create additional NLBs and EC2 instances in other Regions where the company has large customer bases.
- **D.** Create a standard accelerator in AWS Global Accelerator. Configure the existing NLBs as target endpoints.

### Correct answer: D

**Summary:** Global Accelerator gives fixed anycast IPs and routes TCP/UDP traffic over the AWS backbone to the nearest healthy Regional endpoint, such as an NLB.

### Explanation
- A is wrong: swapping NLBs for ALBs changes the load balancer type but does nothing to shorten the path between distant users and a Region.
- B is wrong: equal weights send users to Regions at random, often not the closest one.
- C is wrong: adding Regions can help, but it means building and running more infrastructure and still sends traffic over the public internet.
- D is correct: Global Accelerator brings users onto the AWS network at the nearest edge location and routes them to the closest healthy NLB, which reduces latency and jitter worldwide.

**Key phrases:** Network Load Balancers (NLBs) across multiple AWS Regions · reducing end-to-end load time · global customer base
**Hint:** Which service carries user traffic over the AWS global network from the nearest edge location to the best Regional endpoint?

---

## BETA-027: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence

### Question
A video streaming service runs on Amazon EC2 instances behind an Application Load Balancer (ALB). The ALB serves as the origin for an Amazon CloudFront distribution. Video thumbnails are stored in an Amazon S3 bucket. The service needs to deliver device-appropriate thumbnail dimensions. The service must serve WebP format to supported browsers and JPEG format to unsupported browsers based on the Accept header. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Use a Lambda@Edge function that uses an image processing library associated with CloudFront cache behavior for thumbnails.
- **B.** Deploy an image processing library on an EC2 instance to resize thumbnails and convert formats based on incoming requests.
- **C.** Create a CloudFront origin request policy to resize thumbnails and serve the appropriate format based on the Accept header.
- **D.** Create a CloudFront response headers policy to resize thumbnails and serve the appropriate format based on the Accept header.

### Correct answer: A

**Summary:** Transforming content (resizing, format conversion) at CloudFront needs code: Lambda@Edge. Policies only manage headers.

### Explanation
- A is correct: Lambda@Edge can read the Accept header and device hints and resize or convert the image with an image library, and CloudFront caches each variant.
- B is wrong: an EC2 image server is infrastructure to scale and patch, and it duplicates what the edge can do.
- C is wrong: an origin request policy only controls which headers, cookies and query strings go to the origin; it cannot transform images.
- D is wrong: a response headers policy adds or removes headers; it cannot resize or convert images.

**Key phrases:** device-appropriate thumbnail dimensions · WebP format · Accept header · LEAST operational overhead
**Hint:** Resizing and converting images needs code. Policies only manage headers; which option runs code at the edge?

---

## BETA-028: Databases & Caching
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
A company wants to develop a database tool that is compatible with PostgreSQL. The company will run the tool only during business hours. The company wants to deploy the tool to AWS. The company needs to set up a development environment to support development efforts. The development environment must optimize database compute costs during the frequent and prolonged periods of inactivity. Which solution will meet these requirements?

### Options
- **A.** Deploy an Amazon EC2 instance. Install a PostgreSQL database on the instance. Implement custom scripts to monitor database connections and to shut down the EC2 instance if no connections are detected for a specified period of time.
- **B.** Deploy an Amazon Aurora provisioned DB cluster that has PostgreSQL compatibility on a db.t3.small instance. Use scheduled scripts to stop the cluster outside of business hours and start it again during business hours.
- **C.** Deploy an Amazon Aurora Serverless v2 DB cluster that has PostgreSQL compatibility. Set the minimum capacity of the DB cluster to 0 Aurora capacity units (ACUs). Set the auto-pause interval to 30 minutes.
- **D.** Store all development data as Apache Parquet files in Amazon S3. Use Amazon Athena to run SQL queries directly against the data in Amazon S3. Configure Athena to write the results of INSERT/UPDATE operations back to Amazon S3.

### Correct answer: C

**Summary:** Aurora Serverless v2 can scale to 0 ACUs and auto-pause, so you pay almost nothing for compute while a dev database is idle.

### Explanation
- A is wrong: a self-managed database on EC2 with custom shutdown scripts is fragile and needs patching and maintenance.
- B is wrong: a provisioned cluster bills while it runs, scheduled scripts miss idle periods during business hours, and stopped clusters restart by themselves after 7 days.
- C is correct: with a minimum of 0 ACUs and auto-pause, Aurora Serverless v2 stops charging for compute after 30 idle minutes and resumes on the next connection.
- D is wrong: Athena over Parquet is not a PostgreSQL-compatible database and cannot handle transactional updates.

**Key phrases:** PostgreSQL · only during business hours · frequent and prolonged periods of inactivity
**Hint:** Which PostgreSQL-compatible option can scale compute all the way to zero when idle, by itself?

---

## BETA-029: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security

### Question
A company runs an application on premises. The application needs to periodically upload large files to an Amazon S3 bucket. A solutions architect needs a solution to provide the application with short-lived authenticated access to the S3 bucket. The solution must not use long-term credentials. The solution needs to be secure and scalable. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create an IAM user that has an access key and a secret key. Store the keys on the on-premises server in an environment variable. Attach a policy to the IAM user that restricts access to only the S3 bucket.
- **B.** Configure an AWS Site-to-Site VPN connection from on-premises environment to the company's VPC. Launch an Amazon EC2 instance with an instance profile. Route all file uploads from the on-premises application through the EC2 instance to the S3 bucket.
- **C.** Configure an S3 bucket policy to allow access for the on-premises server's public IP address. Configure the policy to allow PUT operations only from the server's IP address.
- **D.** Configure a trust relationship between the on-premises server and AWS STS. Generate credentials by assuming an IAM role for each upload operation.

### Correct answer: D

**Summary:** Servers outside AWS should assume IAM roles for temporary STS credentials (for example with IAM Roles Anywhere), never store access keys.

### Explanation
- A is wrong: IAM user access keys are exactly the long-term credentials the company must avoid.
- B is wrong: routing every upload through an EC2 proxy over VPN adds infrastructure, cost and a bottleneck.
- C is wrong: an IP-based bucket policy grants access without authenticating the caller, and IP addresses can change or be shared.
- D is correct: assuming an IAM role through STS returns short-lived credentials for each upload, so nothing long-lived is stored on the server.

**Key phrases:** on premises · short-lived authenticated access · must not use long-term credentials
**Hint:** You need temporary credentials for a server outside AWS. Which service issues them when a role is assumed?

---

## BETA-030: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** hard · **Pillars:** Cost Optimization

### Question
A solutions architect reviews AWS Cost Explorer for an application. The solutions architect observes that Amazon EC2 amortized costs decreased by 15% this month. However, EC2 unblended costs increased by 20% compared to last month. The solutions architect purchased EC2 Reserved Instances 3 months ago to cover baseline workloads. What should the solutions architect do to reduce the EC2 costs?

### Options
- **A.** Purchase additional Reserved Instances to cover the on-demand usage that exceeds current Reserved Instance coverage.
- **B.** Contact AWS Support to investigate the discrepancy in the Cost Explorer data.
- **C.** Sell the existing Reserved Instances in the Reserved Instance Marketplace. Migrate all workloads to Savings Plans.
- **D.** Configure instance scheduling to stop instances during off-peak hours to reduce the Reserved Instance monthly recurring charges.

### Correct answer: A

**Summary:** When unblended EC2 cost rises while Reserved Instances are in place, extra On-Demand usage is running outside RI coverage; extend coverage.

### Explanation
- A is correct: the extra unblended cost comes from On-Demand usage that the existing Reserved Instances do not cover, so buying more coverage for that steady usage lowers it.
- B is wrong: the two metrics measure different things, so the difference is expected, not a billing error.
- C is wrong: selling the Reserved Instances throws away discounts that already apply to the baseline.
- D is wrong: Reserved Instances are billed every hour whether or not instances run, so stopping instances does not reduce their charges.

**Key phrases:** amortized costs decreased by 15% · unblended costs increased by 20% · Reserved Instances 3 months ago
**Hint:** Amortized cost spreads Reserved Instance fees over the term; unblended cost shows charges when they are billed. Rising unblended cost with lower amortized cost points to usage beyond the reservations.

---

## BETA-031: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** hard · **Pillars:** Performance Efficiency

### Question
An e-commerce company is building a near real-time bidding platform on AWS. The company deploys the application as a target of an Application Load Balancer (ALB). The application stores bidding and catalog information in an Amazon DynamoDB table. The DynamoDB table receives heavy read loads. The company wants to add a feature to the application that allows customers to view the items that have received the most bids in the previous 24 hours. The company needs a solution to ensure that the bid prices are updated in near real time. The solution must not affect the performance of the DynamoDB table. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Configure an Amazon Kinesis data stream to replicate changes in item bid prices from the Amazon DynamoDB table to Amazon Managed Service for Apache Flink. Write the bid prices back into the DynamoDB table.
- **B.** Configure the DynamoDB table to perform a zero-ETL data transfer to an Amazon Redshift table every hour. Configure the application to query the Redshift table to retrieve the latest bid prices.
- **C.** Configure an AWS Glue connector to export the data from a DynamoDB snapshot to an Amazon S3 bucket. Invoke an AWS Lambda function to calculate the latest bid price and to send the latest price to the application.
- **D.** Configure an Amazon DynamoDB Accelerator (DAX) cluster with eventual consistency. Update the application configuration to access the DAX endpoint to retrieve the latest price information.

### Correct answer: A

**Summary:** Compute rolling aggregates such as 'most bids in 24 hours' from DynamoDB change data (Kinesis Data Streams) with Managed Service for Apache Flink, without extra reads on the table.

### Explanation
- A is correct: Kinesis Data Streams for DynamoDB captures every bid change without using the table's read capacity, Flink computes the most-bid items over a sliding 24-hour window in near real time, and only the small results are written back for the application to read.
- B is wrong: an hourly transfer is not near real time, and the application would need a second database to query.
- C is wrong: exporting snapshots is a batch process, far from near real time.
- D is wrong: DAX only caches items; it cannot work out which items received the most bids in 24 hours, and computing that in the application would mean scanning the busy table.

**Key phrases:** heavy read loads · the most bids in the previous 24 hours · near real time · must not affect the performance of the DynamoDB table
**Hint:** Ranking items by bids over a rolling 24 hours is a streaming aggregation. Which option computes it from the table's change data instead of reading the table?

---

## BETA-032: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** easy · **Pillars:** Cost Optimization, Operational Excellence

### Question
A company is planning to migrate multiple workloads to Amazon EC2 instances and needs to determine an appropriate AWS account structure. The workloads must be isolated from one another and belong to separate business units. The company needs to be able to perform chargeback to the business units by using a consolidated monthly view. Which solution will meet these requirements with the LEAST administrative overhead?

### Options
- **A.** Create a separate standalone AWS account for each business unit. Create a script to call AWS Cost Explorer APIs from each account to perform chargeback.
- **B.** Create a single organization in AWS Organizations. Create a member account for each business unit. Use the bill from the organization management account to perform chargeback.
- **C.** Create a single AWS account for all the business units. Assign tags to the EC2 instances that correspond with the business units. Activate the tags for cost allocation to perform chargeback by using AWS Cost Explorer.
- **D.** Create a separate organization in AWS Organizations for each business unit. Use the bill in each organization management account to perform chargeback.

### Correct answer: B

**Summary:** One organization with an account per business unit gives isolation plus consolidated billing that breaks costs down by account.

### Explanation
- A is wrong: standalone accounts have no consolidated bill, and scripts across accounts add work.
- B is correct: separate member accounts isolate the workloads, and consolidated billing in the management account shows costs per account for chargeback.
- C is wrong: a single account does not isolate the workloads, and tags depend on every resource being tagged correctly.
- D is wrong: separate organizations mean separate bills, with no consolidated view.

**Key phrases:** isolated from one another · separate business units · consolidated monthly view · LEAST administrative overhead
**Hint:** Accounts give isolation. What gives one combined bill across accounts?

---

## BETA-033: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A company operates a citizen services portal on Amazon EC2 instances in an EC2 Auto Scaling group behind Amazon Route 53. Users report timeout errors when submitting applications. A network team identifies that Route 53 returns all configured IP addresses regardless of instance status. The statuses include instances that are undergoing maintenance. The company needs a solution that automatically manages traffic distribution to healthy instances. Which solution will meet these requirements?

### Options
- **A.** Implement a Route 53 multivalue answer routing policy. Configure health checks for each EC2 instance IP address.
- **B.** Configure a Route 53 failover routing policy with primary and secondary records. Associate health checks with each record.
- **C.** Deploy an Amazon CloudFront distribution. Configure the EC2 instances as origin servers. Enable origin health monitoring.
- **D.** Deploy an Application Load Balancer (ALB) with target health checks in front of the EC2 instances. Update Route 53 to route traffic to the ALB.

### Correct answer: D

**Summary:** Put an ALB in front of an Auto Scaling group: its target health checks send traffic only to healthy, registered instances.

### Explanation
- A is wrong: multivalue answers with health checks help, but each changing instance IP needs its own record and health check, and DNS caching still sends users to failed instances.
- B is wrong: failover routing is active-passive for two endpoints; it does not spread traffic across a changing fleet.
- C is wrong: CloudFront caches content; it is not the way to balance dynamic form submissions across instances.
- D is correct: an ALB registers Auto Scaling instances automatically, health-checks them and sends requests only to healthy targets, while Route 53 points at the ALB.

**Key phrases:** returns all configured IP addresses regardless of instance status · automatically manages traffic distribution to healthy instances
**Hint:** Instances in an Auto Scaling group come and go. What tracks their health and sends traffic only to healthy ones?

---

## BETA-034: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security

### Question
A company is designing an application to run in a VPC on AWS. The application consists of Amazon EC2 instances that run in private subnets as part of an Auto Scaling group. The application stores data in an Amazon RDS DB instance. The company attaches a security group named web-servers to the EC2 instances. The company attaches a security group named database to the DB instance. The company needs a solution to establish communication between the EC2 instances and the DB instance. Which solution will meet this requirement?

### Options
- **A.** Configure the inbound rule for the database security group to allow access from the current set of IP addresses that the EC2 instances use.
- **B.** Configure the inbound rule of the database security group to allow access from the web-servers security group. Configure an outbound rule for the web-servers security group to allow access to the database security group.
- **C.** Configure the inbound rule of the database security group to allow access by specifying the Auto Scaling group ID.
- **D.** Configure the outbound rule of the database security group to allow access to the web-servers security group. Configure an inbound rule for the web-servers security group to allow access from the database security group.

### Correct answer: B

**Summary:** Reference security groups instead of IP addresses: allow the database group inbound from the web-servers group.

### Explanation
- A is wrong: Auto Scaling replaces instances and their IP addresses change, so the rule would break.
- B is correct: referencing the web-servers group in the database group's inbound rule allows any current or future web instance, and the outbound rule lets that traffic leave.
- C is wrong: security group rules cannot reference an Auto Scaling group ID.
- D is wrong: this reverses the direction; the web servers start the connections to the database.

**Key phrases:** security group named web-servers · security group named database · establish communication
**Hint:** Instance IPs change as the group scales. What can a security group rule reference instead of IP addresses?

---

## BETA-035: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
A company has several backend services that produce a large amount of data every hour. The company stores the data in an Amazon S3 bucket in JSON format. The company must process the data constantly by using a custom Python script. The data processing job is not time sensitive and can tolerate failure. The data processing job usually finishes within 10 to 20 minutes. After the data is processed, it must immediately be deleted from the S3 bucket. Which solution will meet these requirements in the MOST cost-effective way?

### Options
- **A.** Use Amazon EC2 Reserved Instances to run the Python script to process the data. Create an S3 Lifecycle configuration rule to delete the data after it is processed.
- **B.** Use AWS Lambda to run the Python script to process the data. Create an S3 Lifecycle configuration rule to delete the data after it is processed.
- **C.** Use AWS Lambda to run the Python script to process the data. After the data is processed, call the Amazon S3 API to delete the data.
- **D.** Use Amazon EC2 Spot instances to run the Python script to process the data. After the data is processed, call the Amazon S3 API to delete the data.

### Correct answer: D

**Summary:** Interruptible, failure-tolerant batch jobs belong on Spot; deleting right after processing needs an explicit DeleteObject call.

### Explanation
- A is wrong: Reserved Instances commit to capacity for a job that tolerates interruption, and lifecycle rules act after days, not immediately.
- B is wrong: the job fits in Lambda's time limit, but lifecycle rules still cannot delete data immediately after processing.
- C is wrong: Lambda works, but running it constantly on large hourly data costs more than Spot for a job that tolerates failure.
- D is correct: Spot Instances are the cheapest compute for work that can be interrupted, and calling DeleteObject right after processing meets the immediate-deletion rule.

**Key phrases:** can tolerate failure · 10 to 20 minutes · immediately be deleted · MOST cost-effective
**Hint:** Failure-tolerant batch work is the textbook Spot use case. And a lifecycle rule acts on days, not "immediately".

---

## BETA-036: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** easy · **Pillars:** Operational Excellence

### Question
A marketing team wants to build a campaign for an upcoming multi-sport event. The team has news reports from the past five years in PDF format. The team needs a solution to extract insights about the content and the sentiment of the news reports. The solution must use Amazon Textract to process the news reports. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Provide the extracted insights to Amazon Athena for analysis. Store the extracted insights and analysis in an Amazon S3 bucket.
- **B.** Store the extracted insights in an Amazon DynamoDB table. Use Amazon SageMaker to build a sentiment model.
- **C.** Provide the extracted insights to Amazon Comprehend for analysis. Save the analysis to an Amazon S3 bucket.
- **D.** Store the extracted insights in an Amazon S3 bucket. Use Amazon QuickSight to visualize and analyze the data.

### Correct answer: C

**Summary:** Textract extracts text; Comprehend analyzes it for sentiment, entities and key phrases, with no model building.

### Explanation
- A is wrong: Athena runs SQL; it cannot detect sentiment in free text.
- B is wrong: building a custom SageMaker model is far more work than a managed NLP service.
- C is correct: Amazon Comprehend detects sentiment, entities and key phrases in the extracted text with no model training.
- D is wrong: QuickSight visualizes data; it does not analyze sentiment.

**Key phrases:** sentiment · Amazon Textract · LEAST operational overhead
**Hint:** Textract pulls the text out. Which managed service finds sentiment and key phrases in text?

---

## BETA-037: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company runs several custom applications on Amazon EC2 instances. Each team within the company manages its own set of applications and backups. To comply with regulations, the company must be able to report on the status of backups and ensure that backups are encrypted. Which solution will meet these requirements with the LEAST effort?

### Options
- **A.** Create an AWS Lambda function that processes AWS Config events. Configure the Lambda function to query AWS Config for backup-related data and to generate daily reports.
- **B.** Check the backup status of the EC2 instances daily by reviewing the backup configurations in AWS Backup and Amazon EBS snapshots.
- **C.** Use an AWS Lambda function to query Amazon EBS snapshots, Amazon RDS snapshots, and AWS Backup jobs. Configure the Lambda function to process and report on the data. Schedule the function to run daily.
- **D.** Use AWS Config and AWS Backup Audit Manager to ensure compliance. Review generated reports daily.

### Correct answer: D

**Summary:** AWS Backup Audit Manager checks backups against controls (frequency, encryption, retention) and generates compliance reports.

### Explanation
- A is wrong: a custom Lambda function that parses Config data is code to build and maintain.
- B is wrong: reviewing configurations by hand every day is the most effort and error-prone.
- C is wrong: a custom Lambda reporting job must be built and maintained, unlike a built-in feature.
- D is correct: AWS Backup Audit Manager, built on AWS Config, checks that backups exist and are encrypted and generates compliance reports automatically.

**Key phrases:** report on the status of backups · backups are encrypted · LEAST effort
**Hint:** Which AWS Backup feature audits backups against controls such as "encrypted" and produces reports?

---

## BETA-038: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency

### Question
An advertising company stores terabytes of data in an Amazon S3 data lake. The company wants to build its own foundation model (FM) and has deployed a training cluster on AWS. The company loads file-based data from Amazon S3 to the training cluster to train the FM. The company wants to reduce data loading time to optimize the overall deployment cycle. The company needs a storage solution that is natively integrated with Amazon S3. The solution must be scalable and provide high throughput. Which storage solution will meet these requirements?

### Options
- **A.** Mount an Amazon EFS file system to the training cluster. Use AWS DataSync to migrate data from Amazon S3 to the EFS file system to train the FM.
- **B.** Use an Amazon FSx for Lustre file system and Amazon S3 with Data Repository Association (DRA). Preload the data from Amazon S3 to the Lustre file system to train the FM.
- **C.** Attach Amazon EBS volumes to the training cluster. Load the data from Amazon S3 to the EBS volumes to train the FM.
- **D.** Use AWS DataSync to migrate the data from Amazon S3 to the training cluster as files. Train the FM on the local file-based data.

### Correct answer: B

**Summary:** FSx for Lustre links to S3 through a data repository association and serves the data at very high throughput for ML and HPC.

### Explanation
- A is wrong: EFS has no native S3 link, so DataSync copies would have to be run and kept in sync.
- B is correct: FSx for Lustre is built for high-throughput ML training, and a data repository association links it natively to the S3 data lake.
- C is wrong: EBS volumes attach to single instances and must be loaded manually; they do not scale across a training cluster.
- D is wrong: copying files to each node with DataSync is slow and duplicates the data on every node.

**Key phrases:** foundation model · natively integrated with Amazon S3 · high throughput
**Hint:** Which high-performance file system can link directly to an S3 bucket?

---

## BETA-039: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** easy · **Pillars:** Operational Excellence

### Question
A company sends AWS CloudTrail logs from multiple AWS accounts to an Amazon S3 bucket in a centralized account. The company must store the CloudTrail logs and must be able to query the logs at any time. Which solution will meet these requirements?

### Options
- **A.** Store the CloudTrail logs in an Amazon S3 bucket. Create an Amazon Athena table that includes the CloudTrail logs. Query the CloudTrail logs from Athena.
- **B.** Configure an Amazon Neptune instance to manage the CloudTrail logs. Use Neptune to query the CloudTrail logs.
- **C.** Configure CloudTrail to send the logs to an Amazon DynamoDB table. Create a dashboard in Amazon QuickSight to query the logs in the table.
- **D.** Use Amazon Athena to create an Athena notebook. Configure CloudTrail to send the logs to the notebook. Use Athena to query the logs.

### Correct answer: A

**Summary:** Query CloudTrail logs in S3 with Athena; there is nothing to load or run.

### Explanation
- A is correct: Athena queries the CloudTrail files where they sit in S3, with no servers and pay-per-query pricing.
- B is wrong: Neptune is a graph database and is not a place to store or query CloudTrail logs.
- C is wrong: CloudTrail cannot deliver logs to DynamoDB, and QuickSight is for dashboards, not log queries.
- D is wrong: CloudTrail cannot send logs to an Athena notebook.

**Key phrases:** CloudTrail logs · query the logs at any time
**Hint:** The logs are already in S3. Which service runs SQL directly against files in S3?

---

## BETA-040: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A financial services company is building a data lake solution on Amazon S3. The company plans to use analytics offerings from AWS to meet user needs for one-time querying and business intelligence reports. A portion of the columns will contain personally identifiable information (PII). Only authorized users should be able to see plaintext PII data. What is the MOST operationally efficient solution that meets these requirements?

### Options
- **A.** Define a bucket policy for each S3 bucket of the data lake to allow access to users who have authorization to see PII data. Catalog the data by using AWS Glue. Create two IAM roles. Attach a permissions policy with access to PII columns to one role. Attach a policy without these permissions to the other role.
- **B.** Register the S3 locations with AWS Lake Formation. Create two IAM roles. Use Lake Formation data permissions to grant Select permissions to all of the columns for one role. Grant Select permissions to only columns that contain non-PII data for the other role.
- **C.** Register the S3 locations with AWS Lake Formation. Create an AWS Glue job to create an ETL workflow that removes the PII columns from the data and creates a separate copy of the data in another data lake S3 bucket. Register the new S3 locations with Lake Formation. Grant users the permissions to each data lake data based on whether the users are authorized to see PII data.
- **D.** Register the S3 locations with AWS Lake Formation. Create two IAM roles. Attach a permissions policy with access to PII columns to one role. Attach a policy without these permissions to the other role. For each downstream analytics service, use its native security functionality and the IAM roles to secure the PII data.

### Correct answer: B

**Summary:** Lake Formation grants column-level permissions once, and Athena, Redshift Spectrum and other engines enforce them.

### Explanation
- A is wrong: bucket policies and IAM policies work at object level; they cannot hide individual columns inside files.
- B is correct: Lake Formation column-level permissions let one role select every column and the other only non-PII columns, enforced for every integrated service.
- C is wrong: keeping a second, redacted copy of the data doubles storage and adds an ETL pipeline to maintain.
- D is wrong: configuring each analytics service separately is exactly the effort Lake Formation removes.

**Key phrases:** personally identifiable information (PII) · plaintext PII data · MOST operationally efficient
**Hint:** Which service can grant access to specific columns of a data lake table, enforced for every analytics service that reads it?

---

## BETA-041: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** hard · **Pillars:** Operational Excellence

### Question
A company uses on-premises virtual machines (VMs) to run a Kubernetes cluster. The company must operate network connectivity for the cluster on premises. The company wants to simplify overall management for the Kubernetes cluster while maintaining control over the underlying infrastructure. Which solution will meet these requirements?

### Options
- **A.** Deploy an Amazon EKS Anywhere cluster on the existing VMs.
- **B.** Deploy Amazon EKS Hybrid Nodes on the existing VMs.
- **C.** Deploy a self-hosted Kubernetes cluster on Amazon EC2 instances. Run the EC2 instances on AWS Outposts.
- **D.** Deploy a self-hosted Kubernetes cluster on Amazon EC2 instances. Host the EC2 instances in a VPC that does not have internet access.

### Correct answer: A

**Summary:** EKS Anywhere runs complete EKS clusters on your own infrastructure; EKS Hybrid Nodes keep the control plane in an AWS Region.

### Explanation
- A is correct: EKS Anywhere runs the whole cluster on the existing on-premises VMs with EKS tooling, so the company keeps its networking and infrastructure while management gets simpler.
- B is wrong: with Hybrid Nodes the control plane runs in an AWS Region and the nodes depend on a connection to it, so the cluster is no longer fully on premises.
- C is wrong: Outposts puts AWS-owned hardware on premises, and self-hosted Kubernetes on it does not simplify management.
- D is wrong: moving to EC2 leaves the on-premises VMs, and self-hosting Kubernetes adds management work.

**Key phrases:** on-premises virtual machines (VMs) · operate network connectivity for the cluster on premises · maintaining control over the underlying infrastructure
**Hint:** Two EKS options run workloads on your own machines. Which one keeps the whole cluster, control plane included, on premises?

---

## BETA-042: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company runs a web application in an AWS account. The company also runs a development environment and a production environment in the same account. A solutions architect needs to isolate the application environment and the application resources. The environments must not communicate with each other. The solutions architect must isolate the administration of each environment. Which solution will meet these requirements?

### Options
- **A.** Tag all production resources with an Environment Production tag. Tag all development resources with an Environment Development tag. Create IAM policies that include conditions based on resource tags. Assign the IAM policies to engineers to restrict access based on tags.
- **B.** Define resource groups for the development environment and the production environment. Create IAM policies that grant or deny access to resources based on these resource groups. Assign these policies to engineers to restrict access to production resources.
- **C.** Create a new AWS account. Move the development environment resources to the new account. Restrict access to the current production account to intended users. Grant permissions in the development account to the intended users.
- **D.** Create a VPC for production resources and a second VPC for development resources within the same AWS account. Use network ACLs to prevent access to subnets in the production VPC from the development VPC. Use IAM policies to control access to resources within each VPC.

### Correct answer: C

**Summary:** The AWS account is the strongest isolation boundary: separate accounts for dev and prod isolate resources, networks and administration.

### Explanation
- A is wrong: tag-based IAM conditions are easy to get wrong and do not isolate networks or account-wide settings.
- B is wrong: resource groups only organize resources; they are not a security boundary.
- C is correct: a separate account isolates resources, networking and permissions by default, so each environment is administered on its own.
- D is wrong: separate VPCs isolate networks, but both environments still share one account and its administrators.

**Key phrases:** same account · must not communicate with each other · isolate the administration of each environment
**Hint:** What is the strongest isolation boundary AWS offers for both network and administration?

---

## BETA-043: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Performance Efficiency

### Question
A global e-commerce company is designing a three-tier application on AWS. The application includes a web tier that serves static content. An application tier handles business logic. A database tier stores product information and user data. The application interacts with a relational database. The company needs a highly available application architecture to serve global users with low latency. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Deploy Amazon EC2 instances in an Auto Scaling group for the application tier and web tier in a single AWS Region. Use an Application Load Balancer to distribute web traffic. Use an Amazon RDS database and Multi-AZ deployments for the database tier.
- **B.** Set up an Amazon CloudFront distribution that uses an Amazon S3 bucket as the origin. Use Amazon ECS containers on AWS Fargate to deploy the application tier to each AWS Region where the company operates. Use an Amazon Aurora global database for the database tier.
- **C.** Use an Amazon S3 bucket to store the static web content. Use Amazon EC2 Auto Scaling and EC2 Spot Instances for the application tier. Use Amazon RDS for MySQL with read replicas for the database tier. Use AWS DMS to replicate data to secondary AWS Regions.
- **D.** Use an Amazon S3 bucket to store static web content. Use AWS Lambda functions to handle serverless backend logic in the application tier. Use Amazon API Gateway to invoke the Lambda functions for web requests. Use an Amazon DynamoDB database for the database tier. Deploy the DynamoDB data base across multiple AWS Regions.

### Correct answer: B

**Summary:** Global three-tier with low overhead: CloudFront + S3, Fargate in each Region, Aurora Global Database for relational data.

### Explanation
- A is wrong: a single Region cannot give low latency to users worldwide.
- B is correct: CloudFront serves static content from the edge, Fargate runs containers in each Region without servers to manage, and Aurora Global Database replicates relational data across Regions with fast failover.
- C is wrong: Spot Instances can be interrupted, and replicating across Regions with DMS is extra work compared with a global database.
- D is wrong: DynamoDB is not a relational database, which the application requires.

**Key phrases:** relational database · highly available · global users with low latency · LEAST operational overhead
**Hint:** Serve static content from the edge, run the app tier in several Regions, and choose a relational database that spans Regions.

---

## BETA-044: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Cost Optimization

### Question
A company deployed a three-tier web application in a single Availability Zone in the us-east-1 Region on a single Amazon EC2 instance. Usage of the application is growing. A solutions architect needs to ensure that the application can handle the growing amount of traffic. The solutions architect also needs to ensure the application is resilient. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Create two additional EC2 instance spread across two separate Availability Zones. Create an Application Load Balancer (ALB). Configure the ALB to route traffic to a target group that contains all three instances. Create an Amazon CloudWatch alarm to scale the EC2 instances vertically to handle the application traffic.
- **B.** Create eight additional EC2 instances spread across in three separate Availability Zones. Create an Application Load Balancer (ALB). Configure the ALB to route traffic to a target group that contains all nine instances. Create an Amazon CloudWatch alarm to scale the EC2 instances horizontally to handle the application traffic.
- **C.** Create an EC2 Auto Scaling group that contains a minimum of three EC2 instances in the same Availability Zone. Create an Application Load Balancer (ALB). Configure the ALB to route traffic to a target group that contains all the instances. Configure scheduled scaling for the Auto Scaling group.
- **D.** Create an EC2 Auto Scaling group that contains a minimum of three EC2 instances spread across Availability Zones. Create an Application Load Balancer (ALB). Configure the ALB to route traffic to a target group that contains all the instances. Create an Amazon CloudWatch alarm to scale the EC2 instances horizontally to handle the application traffic.

### Correct answer: D

**Summary:** Scale horizontally with an Auto Scaling group across AZs behind an ALB; it handles growth and survives an AZ failure.

### Explanation
- A is wrong: vertical scaling has limits and needs downtime, and fixed instances do not scale in when traffic drops.
- B is wrong: nine fixed instances pay for capacity that is not needed, and a CloudWatch alarm cannot add instances without an Auto Scaling group.
- C is wrong: every instance in one Availability Zone fails together, so it is not resilient.
- D is correct: an Auto Scaling group across Availability Zones survives an AZ failure and grows or shrinks with traffic, so the company pays only for what it needs.

**Key phrases:** single Availability Zone · growing amount of traffic · resilient · MOST cost-effectively
**Hint:** Resilience needs several Availability Zones; handling growth needs horizontal scaling that adds and removes instances.

---

## BETA-045: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence

### Question
A company runs a stock trading platform where services process trades, validate pricing, and synchronize inventory across geographic regions. The services must route transaction events and filter events based on transaction type. The company must retain all transaction events for 30 days and needs the ability to replay past events for audit investigations. Which solution will meet these requirements with the LEAST development effort?

### Options
- **A.** Use an Amazon EventBridge event bus to route transaction events between the services. Configure message filtering to deliver only relevant transaction events to each service. Create an archive in Amazon EventBridge to retain the transaction events for 30 days.
- **B.** Use an Amazon SNS topic to distribute the transaction events. Subscribe each service to the topic. Configure message filtering to deliver only relevant transaction events to each service. Use an Amazon SQS queue to retain the transaction events for 30 days.
- **C.** Use an Amazon SNS topic to distribute the transaction events. Subscribe each service to the topic. Configure message filtering to deliver only relevant transaction events to each service. Store transaction events in an Amazon S3 bucket for 30 days.
- **D.** Create a private Amazon API Gateway HTTP API to receive transaction events. Use an AWS Lambda function to route the transaction events to the appropriate services based on query parameters. Store transaction events in Amazon S3 for 30 days.

### Correct answer: A

**Summary:** EventBridge rules filter and route events, and EventBridge archives keep events for replay, with no code.

### Explanation
- A is correct: EventBridge rules filter and route by transaction type, and an archive with 30-day retention can replay past events for audits.
- B is wrong: an SQS queue is not an archive; consumed messages are deleted, and there is no replay.
- C is wrong: storing events in S3 works, but replaying them means writing custom code.
- D is wrong: a custom API and Lambda router is a lot of code to build and run.

**Key phrases:** filter events based on transaction type · retain all transaction events for 30 days · replay past events · LEAST development effort
**Hint:** Which event service has routing rules, content filtering and a built-in archive with replay?

---

## BETA-046: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security

### Question
A company uses two AWS accounts named Account A and Account B. Account A hosts a data analytics application. Account B hosts a data lake in an Amazon S3 bucket. Data analysts in Account A need to access the data lake in Account B. The access solution must be secure, use temporary credentials, enforce the principle of least privilege, and avoid long-term access keys. Which solution will meet these requirements?

### Options
- **A.** Create IAM users in Account B and share the access keys for the users with analysts in Account A.
- **B.** Use an S3 bucket policy to configure the S3 bucket in Account B to be publicly accessible.
- **C.** Configure a resource-based policy for the S3 bucket in Account B to allow access from an IAM role in Account A.
- **D.** Use a bastion host in Account B to proxy analyst requests from Account A through an Amazon EC2 instance.

### Correct answer: C

**Summary:** Cross-account S3 access: a bucket policy grants an IAM role in the other account, which users assume for temporary credentials.

### Explanation
- A is wrong: sharing IAM user access keys is exactly the long-term credential the company must avoid.
- B is wrong: making the bucket public exposes the data to everyone.
- C is correct: a bucket policy that grants a specific role in Account A lets analysts assume that role for temporary credentials, with only the permissions it needs.
- D is wrong: a proxy bastion host adds infrastructure and still needs credentials to be managed.

**Key phrases:** Account A · Account B · temporary credentials · least privilege
**Hint:** Cross-account S3 access without keys: a role on one side, a policy that trusts it on the other.

---

## BETA-047: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security

### Question
A company hosts an application on Amazon EC2 instances behind an Application Load Balancer (ALB). The company wants the application be accessible only from inside the VPC that hosts the ALB. The company creates an alias record of example.com in Amazon Route 53. The DNS record for the application must be resolvable only in the VPC where the application runs. Which solution will meet these requirements?

### Options
- **A.** Use an internet-facing ALB. Create a Route 53 public hosted zone for the application DNS name.
- **B.** Use an internal ALB. Create a Route 53 public hosted zone for the application DNS name.
- **C.** Use an internet-facing ALB. Create a Route 53 private hosted zone for the application DNS name.
- **D.** Use an internal ALB. Create a Route 53 private hosted zone for the application DNS name.

### Correct answer: D

**Summary:** Internal-only app: an internal ALB for reachability and a Route 53 private hosted zone for DNS that resolves only inside the VPC.

### Explanation
- A is wrong: both the load balancer and the DNS name would be reachable from the internet.
- B is wrong: a public hosted zone makes the name resolvable from anywhere.
- C is wrong: an internet-facing ALB can be reached from outside the VPC.
- D is correct: an internal ALB has only private IP addresses, and a private hosted zone associated with the VPC resolves the name only inside it.

**Key phrases:** accessible only from inside the VPC · resolvable only in the VPC
**Hint:** Two choices: whether the load balancer is internal or internet-facing, and whether the hosted zone is public or private.

---

## BETA-048: Security, Identity & Compliance
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Security

### Question
A company needs a data encryption solution for a machine learning (ML) process. The solution must use an AWS managed service. The ML process currently reads a large number of objects in Amazon S3 that are encrypted by a customer managed AWS KMS key. The current process incurs significant costs because of excessive calls to AWS KMS to decrypt S3 objects. The company wants to reduce the costs of API calls to decrypt S3 objects. Which solution will meet these requirements?

### Options
- **A.** Switch from a customer managed KMS key to an AWS managed KMS key.
- **B.** Remove the AWS KMS encryption from the S3 bucket. Use a bucket policy to encrypt the data instead.
- **C.** Recreate the KMS key in AWS CloudHSM.
- **D.** Use S3 Bucket Keys to perform server-side encryption with AWS KMS keys (SSE-KMS) to encrypt and decrypt objects from Amazon S3.

### Correct answer: D

**Summary:** S3 Bucket Keys cut SSE-KMS request volume (and cost) by up to 99% while keeping KMS encryption.

### Explanation
- A is wrong: an AWS managed key still makes one KMS call per object, so request costs remain.
- B is wrong: a bucket policy cannot encrypt data, and removing KMS encryption weakens security.
- C is wrong: CloudHSM does not reduce the number of calls and adds far more cost and management.
- D is correct: an S3 Bucket Key lets S3 create data keys from a bucket-level key, cutting KMS requests and their cost by up to 99%.

**Key phrases:** customer managed AWS KMS key · excessive calls to AWS KMS · reduce the costs
**Hint:** Which S3 feature reduces the number of KMS requests that SSE-KMS makes?

---

## BETA-049: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability

### Question
A solutions architect is building a payment processing application based on AWS Lambda functions. The application runs in private subnets across multiple Availability Zones. The application processes millions of transactions each day. The solutions architect must ensure that the application does not process duplicate payments. Which solution will meet these requirements?

### Options
- **A.** Publish new payment records to an Amazon S3 bucket. Store each payment record in a unique S3 prefix. Configure S3 Event Notifications to invoke a Lambda function to process the payments when new payment records are uploaded.
- **B.** Publish new payment records to an Amazon SQS standard queue. Configure a Lambda function to poll the SQS standard queue and to process the payments.
- **C.** Publish new payment records to an Amazon SQS FIFO queue. Deduplicate payment record IDs, and implement idempotency checks in the processing Lambda function. Configure the Lambda function to poll the FIFO queue and process the payments.
- **D.** Publish new payment records to an Amazon DynamoDB table. Configure streams on the DynamoDB table to invoke a Lambda function to deduplicate and process the payments.

### Correct answer: C

**Summary:** Prevent duplicate processing with SQS FIFO deduplication plus idempotent consumers.

### Explanation
- A is wrong: S3 event notifications can be delivered more than once, so payments could be processed twice.
- B is wrong: a standard queue delivers at least once, so the same payment can arrive twice.
- C is correct: a FIFO queue drops duplicates using the deduplication ID, and an idempotency check in the function covers any retries.
- D is wrong: DynamoDB Streams alone does not stop the same payment from being written, and so processed, twice.

**Key phrases:** duplicate payments · millions of transactions each day
**Hint:** Which queue type deduplicates messages, and what protects you if processing is retried anyway?

---

## BETA-050: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company runs a large fleet of Amazon EC2 instances. The company's security team has discovered a code vulnerability in the software that runs on the EC2 instances. The company must apply an update to the EC2 instances immediately to fix the vulnerability. Which solution will meet these requirements?

### Options
- **A.** Use AWS Lambda to connect to each EC2 instance and apply the update.
- **B.** Configure AWS Systems Manager Patch Manager to deploy the update to all EC2 instances.
- **C.** Create an AWS Systems Manager maintenance window to deploy the update to all EC2 instances.
- **D.** Use AWS Systems Manager Run Command to deploy the update to all EC2 instances.

### Correct answer: D

**Summary:** Systems Manager Run Command executes a command across a whole fleet at once; Patch Manager and maintenance windows follow schedules.

### Explanation
- A is wrong: Lambda has no built-in way to run commands on instances, so you would have to build SSH connections, credentials and error handling for the whole fleet.
- B is wrong: Patch Manager installs patches that match a patch baseline from OS and vendor repositories; it is not designed to push a fix for the company's own software.
- C is wrong: a maintenance window runs at a scheduled time, not immediately.
- D is correct: Run Command runs the update on the whole fleet right away, with rate controls and per-instance results.

**Key phrases:** large fleet · code vulnerability · immediately
**Hint:** You need to run a one-off command on every instance right now, not wait for a patch schedule.

---

## BETA-051: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company is developing a highly sensitive application on AWS. The application uses SSH to access Amazon EC2 instances. A security team needs to centrally manage all user access to the application. User management must be fully automated. The team needs to eliminate manual distribution of SSH keys. Which solution will meet these requirements?

### Options
- **A.** Use EC2 Instance Connect. Do not require SSH keys.
- **B.** Use AWS Systems Manager Session Manager to manage instance access and to disable SSH on the instances.
- **C.** Use security groups to allow access only from specific IP addresses. Use AWS KMS to manage SSH keys.
- **D.** Use an EC2 key pair to provide SSH access. Distribute the private key securely to all users.

### Correct answer: B

**Summary:** Session Manager gives IAM-controlled, logged shell access with no SSH keys, bastions or open inbound ports.

### Explanation
- A is wrong: EC2 Instance Connect still uses SSH and needs port 22 open; it only pushes a short-lived key.
- B is correct: Session Manager controls access through IAM, logs every session and needs no SSH keys or open inbound ports, so SSH can be disabled.
- C is wrong: KMS is not an SSH key manager, and IP rules do not remove key distribution.
- D is wrong: distributing a private key is exactly the manual key handling the team must eliminate.

**Key phrases:** centrally manage all user access · fully automated · eliminate manual distribution of SSH keys
**Hint:** Which option removes SSH keys and open inbound ports completely, with access controlled by IAM?

---

## BETA-052: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security

### Question
A company has a multi-tier web application. The application's internal service components are deployed on Amazon EC2 instances. The internal service components need to access third-party software as a service (SaaS) APIs that are hosted on AWS. The company needs to provide secure and private connectivity from the application's internal services to the third-party SaaS application. The company needs to ensure that there is minimal public internet exposure. Which solution will meet these requirements?

### Options
- **A.** Implement an AWS Site-to-Site VPN to establish a secure connection with the third-party SaaS provider.
- **B.** Deploy AWS Transit Gateway to manage and route traffic between the application's VPC and the third-party SaaS provider.
- **C.** Configure AWS PrivateLink to allow only outbound traffic from the VPC without enabling the third-party SaaS provider to establish a return path to the network.
- **D.** Use AWS PrivateLink to create a private connection between the application's VPC and the third-party SaaS provider.

### Correct answer: D

**Summary:** PrivateLink connects to a SaaS provider's service on AWS through an interface endpoint, keeping traffic off the internet.

### Explanation
- A is wrong: a Site-to-Site VPN connects on-premises networks; it is not how you privately reach a SaaS service on AWS.
- B is wrong: a transit gateway joins networks you control and would expose far more than one service.
- C is wrong: PrivateLink traffic always starts from the consumer, and responses return on the same connection; this describes a setting that does not exist.
- D is correct: an interface endpoint for the provider's endpoint service gives private, one-way access to that service over the AWS network.

**Key phrases:** SaaS · hosted on AWS · secure and private connectivity · minimal public internet exposure
**Hint:** The SaaS runs on AWS. How do you reach a service in another VPC privately without peering?

---

## BETA-053: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** medium · **Pillars:** Cost Optimization, Performance Efficiency

### Question
A company distributes digital content by using an Amazon S3 bucket that is configured as the origin for an Amazon CloudFront distribution. The company plans to launch a promotion that requires all objects under the /promotions/* path to include a custom HTTP response header named X-Promo-Code. The solution must support millions of daily viewer requests and provide low latency. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Associate a CloudFront function with the viewer response event for the /promotions/* path to insert the X-Promo-Code header.
- **B.** Attach a CloudFront response headers policy to the cache behavior for the /promotions/* path that adds the X-Promo-Code header.
- **C.** Use a Lambda@Edge function on the origin response event for the /promotions/* path to add the X-Promo-Code header.
- **D.** Enable S3 static website hosting. Configure object metadata so responses include the X-Promo-Code header for the /promotions/* path.

### Correct answer: B

**Summary:** Static headers at CloudFront: use a response headers policy, which needs no code and has no extra charge.

### Explanation
- A is wrong: CloudFront Functions work, but they are charged per invocation, which adds cost at millions of requests a day.
- B is correct: a response headers policy on the /promotions/* cache behavior adds the header with no code and no additional charge.
- C is wrong: Lambda@Edge is the most expensive way to add a static header.
- D is wrong: S3 metadata only supports certain headers, and the website endpoint cannot be used with OAC and a private bucket.

**Key phrases:** custom HTTP response header · millions of daily viewer requests · MOST cost-effectively
**Hint:** Adding a fixed header needs no code. Which CloudFront feature adds headers by configuration?

---

## BETA-054: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Operational Excellence

### Question
A company wants to use AWS Direct Connect to connect the company's on-premises networks to the AWS Cloud. The company runs several VPCs in a single AWS Region. The company plans to expand its VPC fleet to include hundreds of VPCs. A solutions architect needs to simplify and scale the company's network infrastructure to accommodate future VPCs. Which service or resource will meet these requirements?

### Options
- **A.** VPC endpoints.
- **B.** AWS Transit Gateway.
- **C.** Amazon Route 53.
- **D.** AWS Secrets Manager.

### Correct answer: B

**Summary:** Transit Gateway is the hub for hundreds of VPCs and on-premises connections (Direct Connect gateway or VPN).

### Explanation
- A is wrong: VPC endpoints give private access to AWS services, not connections between networks.
- B is correct: a transit gateway attached to a Direct Connect gateway connects hundreds of VPCs to on premises through one hub.
- C is wrong: Route 53 is DNS; it does not route network traffic.
- D is wrong: Secrets Manager stores secrets and has nothing to do with networking.

**Key phrases:** AWS Direct Connect · hundreds of VPCs · simplify and scale
**Hint:** What single hub connects many VPCs and on-premises links together?

---

## BETA-055: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Operational Excellence

### Question
A company wants to use Amazon ECS to run its on-premises application in a hybrid environment. The application currently runs on containers on premises. The company needs a single container solution that can scale in an on-premises, hybrid, or cloud environment. The company must run new application containers in the AWS Cloud and must use a load balancer for HTTP traffic. Which combination of actions will meet these requirements? (Select TWO.)

### Options
- **A.** Set up an ECS cluster that uses the AWS Fargate launch type for the cloud application containers. Use an Amazon ECS Anywhere external launch type for the on-premises application containers.
- **B.** Set up an Application Load Balancer for cloud ECS services.
- **C.** Set up a Network Load Balancer for cloud ECS services.
- **D.** Set up an ECS cluster that uses the AWS Fargate launch type. Use Fargate for the cloud application containers and the on-premises application containers.
- **E.** Set up an ECS cluster that uses the Amazon EC2 launch type for the cloud application containers. Use Amazon ECS Anywhere with an AWS Fargate launch type for the on-premises application containers.

### Correct answers: A, B (choose 2)

**Summary:** ECS Anywhere runs tasks on on-premises servers; Fargate runs them in the cloud; HTTP traffic goes through an ALB.

### Explanation
- A is correct: one ECS control plane runs cloud tasks on Fargate and on-premises tasks with the ECS Anywhere external launch type.
- B is correct: an Application Load Balancer is the layer 7 load balancer for HTTP traffic to the cloud services.
- C is wrong: a Network Load Balancer works at layer 4 and is not the HTTP choice.
- D is wrong: Fargate runs only in AWS; it cannot run containers on premises.
- E is wrong: ECS Anywhere uses the external launch type; Fargate cannot run on premises.

**Key phrases:** on-premises, hybrid, or cloud environment · load balancer for HTTP traffic · TWO
**Hint:** One ECS feature runs tasks on your own servers. Which load balancer handles HTTP?

---

## BETA-056: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency

### Question
A company operates an application that analyzes customer purchase history and product relationships to generate personalized recommendations. The application needs to query connections between customers, products, categories, and purchase patterns to identify recommendation opportunities. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Use Amazon RDS to store the data. Use SQL to query the data to identify recommendation opportunities.
- **B.** Use Amazon Neptune to store the data. Use SPARQL to query the data to identify recommendation opportunities.
- **C.** Use Amazon Redshift to store the data. Use SQL to query the data to identify recommendation opportunities.
- **D.** Use Amazon DynamoDB to store the data. Use PartiQL to query the data to identify recommendation opportunities.

### Correct answer: B

**Summary:** Highly connected data (recommendations, social, fraud rings) belongs in a graph database: Amazon Neptune.

### Explanation
- A is wrong: relational databases need many costly joins to walk relationships several levels deep.
- B is correct: Neptune is a managed graph database built to traverse relationships between customers, products and categories.
- C is wrong: Redshift is for large aggregate analytics, not for walking relationships.
- D is wrong: DynamoDB is a key-value store with no efficient way to traverse relationships.

**Key phrases:** query connections between customers, products, categories · LEAST operational overhead
**Hint:** Relationships and connections are the key words. Which database is built for them?

---

## BETA-057: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security

### Question
A company is planning to migrate its on-premises data center to AWS. Each of the company's business units will migrate to a separate AWS account under one organization in AWS Organizations. To comply with local regulations, one of the accounts must use the ap-northeast-3 Region only. The company must not connect VPCs in this account to the internet. Users in this account must not be able to remove the restrictions. Which combination of solutions will meet these requirements? (Select TWO.)

### Options
- **A.** Use AWS Control Tower to implement data residency controls (guardrails) to deny internet access from the specified account. Configure controls (guardrails) to prevent access to all AWS Regions except ap-northeast-3.
- **B.** Use AWS WAF rules to prevent internet access from the specified account. Deny access to all AWS Regions except ap-northeast-3 in the settings of the account.
- **C.** Use Organizations to configure a service control policy (SCP) that prevents VPCs from accessing the internet. Attach the SCP to the specified account. Use Organizations to deny the specified account access to all AWS Regions except ap-northeast-3.
- **D.** Use AWS WAF rules to prevent internet access for the specified account. For each VPC in the account, create an outbound rule for the network ACL to deny all traffic to.
- **E.** Use AWS Config to activate managed rules in the specified account to detect when an internet gateway is attached to a VPC. Configure the managed rules to detect when new resources are deployed outside of ap-northeast-3.

### Correct answers: A, C (choose 2)

**Summary:** Preventive guardrails that account users cannot bypass: SCPs, applied directly or through Control Tower controls.

### Explanation
- A is correct: Control Tower data residency controls deny internet access and all Regions except ap-northeast-3, and account users cannot remove them.
- B is wrong: AWS WAF filters web requests; it cannot block VPC internet access or restrict Regions.
- C is correct: SCPs attached from Organizations deny internet-related actions and every Region except ap-northeast-3, and users in the account cannot change them.
- D is wrong: WAF does not control VPC egress, and network ACLs can be changed by users in the account.
- E is wrong: Config rules only detect problems after they happen; they do not prevent them.

**Key phrases:** ap-northeast-3 Region only · must not connect VPCs in this account to the internet · must not be able to remove the restrictions · TWO
**Hint:** Restrictions that account users cannot remove must come from outside the account: the organization.

---

## BETA-058: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** easy · **Pillars:** Operational Excellence

### Question
A company operates a video transcoding service that processes video uploads. The service uses containers and runs on self-managed servers that use cron-based batch processing. Processing volume varies based on upload patterns. The company wants to migrate to AWS. The company needs a solution that runs containers without managing servers and automatically adjusts capacity across multiple Availability Zones. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Store container images in a repository that runs on an Amazon EC2 instance. Run the containers on EC2 instances across multiple Availability Zones. Use Amazon CloudWatch to monitor the average CPU utilization. Launch new EC2 instances as needed.
- **B.** Store container images in an Amazon ECR repository. Use an Amazon ECS cluster that uses the Amazon EC2 launch type to run the containers. Use target tracking to scale automatically based on demand.
- **C.** Store container images in an Amazon ECR repository. Use an Amazon ECS cluster that uses the AWS Fargate launch type to run the containers. Use target tracking to scale automatically based on demand.
- **D.** Create an Amazon Machine Image (AMI) that contains the container image. Launch Amazon EC2 instances in an Auto Scaling group across multiple Availability Zones. Use an Amazon CloudWatch alarm to scale out EC2 instances when CPU utilization exceeds a specific threshold.

### Correct answer: C

**Summary:** Containers with no server management: ECR for images, ECS on Fargate with target tracking auto scaling.

### Explanation
- A is wrong: a self-hosted registry and EC2 fleet mean servers to manage and scale by hand.
- B is wrong: the EC2 launch type still needs a cluster of instances to manage.
- C is correct: ECR stores the images, and Fargate runs containers across Availability Zones without servers while target tracking scales the service.
- D is wrong: baking containers into AMIs gives up container orchestration and means managing EC2 instances.

**Key phrases:** without managing servers · automatically adjusts capacity across multiple Availability Zones · LEAST operational overhead
**Hint:** Containers and no servers to manage.

---

## BETA-059: Storage & Backup
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Performance Efficiency

### Question
A company runs its critical storage application in the AWS Cloud. The application uses Amazon S3 in two AWS Regions. The company wants the application to send remote user data to the nearest S3 bucket with no public network congestion. The company also wants the application to fail over with the least amount of management of Amazon S3. Which solution will meet these requirements?

### Options
- **A.** Implement an active-active design between the two Regions. Configure the application to use the regional S3 endpoints closest to the user.
- **B.** Use an active-passive configuration with S3 Multi-Region Access Points. Create a global endpoint for each of the Regions.
- **C.** Send user data to the regional S3 endpoints closest to the user. Configure an S3 crossaccount replication rule to keep the S3 buckets synchronized.
- **D.** Set up Amazon S3 to use Multi-Region Access Points in an active-active configuration with a single global endpoint. Configure S3 Cross-Region Replication.

### Correct answer: D

**Summary:** S3 Multi-Region Access Points give one global endpoint that routes to the nearest bucket over the AWS network and fails over automatically.

### Explanation
- A is wrong: the application would have to choose endpoints and handle failover itself.
- B is wrong: active-passive does not send users to the nearest bucket, and a Multi-Region Access Point has one global endpoint, not one per Region.
- C is wrong: regional endpoints use the public internet path, and cross-account replication does not handle routing or failover.
- D is correct: an active-active Multi-Region Access Point routes each request to the nearest bucket over the AWS network, and Cross-Region Replication keeps the buckets in sync for failover.

**Key phrases:** nearest S3 bucket · no public network congestion · fail over with the least amount of management
**Hint:** Which S3 feature gives one global endpoint that routes to the closest bucket over the AWS network?

---

## BETA-060: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Performance Efficiency

### Question
A company runs a database in which application servers write transaction logs and application data to on-premises iSCSI-based SAN storage. The company wants to avoid costs associated with hardware refresh and on-premises infrastructure expansion. The company needs an automated solution to migrate older log data to AWS. The solution must maintain the iSCSI storage interface and keep frequently accessed logs available locally with minimal latency. Which solution will meet these requirements?

### Options
- **A.** Deploy an Amazon S3 File Gateway to tier historical log data to Amazon S3. Use the Amazon S3 Glacier Instant Retrieval storage class.
- **B.** Use the AWS CLI to create a scheduled cron job to copy older log data to Amazon S3.
- **C.** Deploy a Volume Gateway in stored volume mode. Map the iSCSI volumes to the on-premises servers.
- **D.** Deploy a Volume Gateway in cached volume mode. Map the iSCSI volumes to the on-premises servers.

### Correct answer: D

**Summary:** Volume Gateway cached mode stores data in AWS and keeps recently used data cached locally over iSCSI.

### Explanation
- A is wrong: File Gateway presents NFS/SMB file shares, not iSCSI volumes.
- B is wrong: a cron job with the CLI is manual and does not keep an iSCSI interface.
- C is wrong: stored mode keeps the entire data set on premises, so it does not reduce on-premises storage.
- D is correct: cached mode keeps the primary data in AWS and caches frequently used data locally behind the same iSCSI interface.

**Key phrases:** iSCSI · migrate older log data to AWS · frequently accessed logs available locally
**Hint:** Volume Gateway has two modes. Which keeps only the hot data on premises and the full data set in AWS?

---

## BETA-061: Databases & Caching
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
A company uses Amazon DynamoDB as the data store for an e-commerce application. Inventory management tables have very predictable workloads. Workloads for order placement tables vary significantly and can be unpredictable. All tables use provisioned mode and are read-heavy. The company wants to optimize DynamoDB costs for the application. Which solution will meet this requirement?

### Options
- **A.** Purchase reserved capacity to cover the baseline provisioned read throughput for all tables.
- **B.** Configure the inventory management and order placement tables to use on-demand mode.
- **C.** Configure the inventory management tables to use on-demand mode. Purchase reserved capacity to cover the baseline provisioned read throughput for the order placement tables.
- **D.** Configure the order placement tables to use on-demand mode. Purchase reserved capacity to cover the baseline provisioned read throughput for the inventory management tables.

### Correct answer: D

**Summary:** DynamoDB: reserved capacity for steady provisioned tables, on-demand mode for spiky and unpredictable ones.

### Explanation
- A is wrong: reserving capacity for the unpredictable order tables commits to throughput they may not use.
- B is wrong: on-demand costs more per request than reserved provisioned capacity for the steady inventory tables.
- C is wrong: this reverses the match: the steady tables get on-demand and the unpredictable ones get a commitment.
- D is correct: on-demand fits the unpredictable order tables, and reserved capacity discounts the steady inventory tables.

**Key phrases:** very predictable workloads · vary significantly and can be unpredictable · optimize DynamoDB costs
**Hint:** Match each table to a billing model: steady traffic suits a commitment, spiky traffic suits pay-per-request.

---

## BETA-062: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Reliability

### Question
A solutions architect needs to design a high-traffic static website. The website must be highly available and must provide the lowest possible latency to users across the globe. Which solution will meet these requirements?

### Options
- **A.** Create an Amazon S3 bucket, and upload the website content to the S3 bucket. Create an Amazon CloudFront distribution in each AWS Region, and set the S3 bucket as the origin. Use Amazon Route 53 to create a DNS record that uses a geolocation routing policy to route traffic to the correct CloudFront distribution based on where the request originates.
- **B.** Create an Amazon S3 bucket, and upload the website content to the S3 bucket. Create an Amazon CloudFront distribution, and set the S3 bucket as the origin. Use Amazon Route 53 to create an alias record that points to the CloudFront distribution.
- **C.** Create an Application Load Balancer (ALB) and a target group. Create an Amazon EC2 Auto Scaling group with at least two EC2 instances in the associated target group. Store the website content on the EC2 instances. Use Amazon Route 53 to create an alias record that points to the ALB.
- **D.** Create an Application Load Balancer (ALB) and a target group in two Regions. Create an Amazon EC2 Auto Scaling group in each Region with at least two EC2 instances in each target group. Store the website content on the EC2 instances. Use Amazon Route 53 to create a DNS record that uses a geolocation routing policy to route traffic to the correct ALB based on where the request originates.

### Correct answer: B

**Summary:** Global static site: S3 origin, one CloudFront distribution, and a Route 53 alias record to it.

### Explanation
- A is wrong: CloudFront is already global; distributions per Region with geolocation routing add cost and complexity for nothing.
- B is correct: one CloudFront distribution caches the S3 content at edge locations worldwide, and a Route 53 alias record points the domain at it.
- C is wrong: EC2 in one Region serves distant users with high latency and needs servers to manage.
- D is wrong: two Regions of EC2 still do not match edge-location latency and cost far more.

**Key phrases:** high-traffic static website · highly available · lowest possible latency to users across the globe
**Hint:** Static content for a global audience: an origin, a CDN in front of it, and a DNS alias to the CDN.

---

## BETA-063: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security

### Question
A company is building a new application. The application runs on Amazon EC2 instances and uses an Amazon S3 bucket for document storage. The company needs to ensure that the EC2 instances can access the S3 bucket. Which solution will meet these requirements?

### Options
- **A.** Create an IAM role that grants access to the S3 bucket. Update the trust policy to allow Amazon EC2 to assume the role. Associate the instance profile with the EC2 instances.
- **B.** Create an IAM policy that grants access to the S3 bucket. Update the trust policy to allow Amazon EC2 to assume the role. Attach the policy to the EC2 instances.
- **C.** Create an IAM group that grants access to the S3 bucket. Attach the group to the EC2 instances.
- **D.** Create an IAM user that grants access to the S3 bucket. Attach the user account to the EC2 instances.

### Correct answer: A

**Summary:** EC2 gets AWS permissions from an IAM role attached through an instance profile; never put user keys on instances.

### Explanation
- A is correct: an IAM role that EC2 is trusted to assume, attached through an instance profile, gives the instances temporary credentials for the bucket.
- B is wrong: policies are attached to identities such as roles; they cannot be attached to instances directly, and a policy has no trust policy.
- C is wrong: IAM groups contain users; they cannot be attached to instances.
- D is wrong: IAM users cannot be attached to instances, and storing their keys on instances is insecure.

**Key phrases:** EC2 instances can access the S3 bucket
**Hint:** How does an EC2 instance get AWS credentials without storing keys?

---

## BETA-064: Databases & Caching
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability

### Question
A logistics company uses Amazon DocumentDB global clusters to run a package tracking system. The system replicates shipping records across three AWS Regions to provide real-time tracking visibility to customers worldwide. The company needs to perform planned maintenance to upgrade the primary Region's underlying infrastructure. The company needs to maintain application availability during the planned maintenance. Which solution will meet these requirements?

### Options
- **A.** Create manual snapshots of the DocumentDB cluster.
- **B.** Initiate a managed switchover to a secondary Region.
- **C.** Promote a replica instance to primary within the current Region's cluster.
- **D.** Increase cross-Region replication frequency during the migration.

### Correct answer: B

**Summary:** For planned Regional maintenance, a global cluster managed switchover moves the primary to a secondary Region with no data loss.

### Explanation
- A is wrong: snapshots are backups; they do not keep the application running.
- B is correct: a managed switchover promotes a secondary Region to primary with no data loss, so the application stays available while the old primary is maintained.
- C is wrong: failing over inside the same Region does not avoid maintenance of that Region's infrastructure.
- D is wrong: replication frequency is not configurable, and changing it would not move the primary.

**Key phrases:** DocumentDB global clusters · planned maintenance · maintain application availability
**Hint:** Planned maintenance on the primary Region: move the primary role to another Region without losing data.

---

## BETA-065: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security

### Question
A media company hosts a video streaming platform on AWS. The company uses Amazon EC2, Amazon S3, and Amazon CloudFront. The company wants to protect its AWS workloads from DDoS attacks and filter malicious web traffic. The solution must provide detailed insights about threats and automatically mitigate threats in real time. Which solution will meet these requirements?

### Options
- **A.** Deploy AWS Shield Advanced for CloudFront.
- **B.** Integrate AWS WAF with CloudFront.
- **C.** Use AWS Shield Advanced with AWS WAF. Integrate Shield Advanced with CloudFront.
- **D.** Use Amazon GuardDuty to detect and mitigate threats.

### Correct answer: C

**Summary:** Shield Advanced gives enhanced DDoS detection, insights and automatic layer 7 mitigation (using WAF); WAF filters malicious requests.

### Explanation
- A is wrong: Shield Advanced alone does not filter malicious web requests; that is WAF's job.
- B is wrong: WAF alone filters requests but lacks advanced DDoS detection, insights and response.
- C is correct: Shield Advanced on CloudFront gives advanced DDoS detection, visibility and automatic application layer mitigation, and WAF filters malicious traffic.
- D is wrong: GuardDuty detects threats in logs but does not mitigate DDoS attacks or filter web traffic.

**Key phrases:** DDoS attacks · filter malicious web traffic · detailed insights about threats · automatically mitigate threats in real time
**Hint:** DDoS protection with detailed insights and automatic mitigation, plus web request filtering. That takes two services.

---

## BETA-066: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security, Performance Efficiency

### Question
A company is planning to use an Amazon CloudFront distribution to deploy an application. The CloudFront distribution uses an Amazon S3 bucket as the origin. Only authorized users should be able to access the application. Files that the company caches at edge locations must be accessible only after a user is authenticated. A solutions architect needs to design a secure and low-latency solution to meet these requirements. Which solution will meet these requirements?

### Options
- **A.** Create an Application Load Balancer (ALB) as a second origin in CloudFront. Direct users to authenticate at the ALB first.
- **B.** Use the origin response Lambda@Edge function in CloudFront to handle authentication and authorization.
- **C.** Create a Network Load Balancer (NLB) as a second origin in CloudFront. Direct users to authenticate at the NLB first.
- **D.** Use the viewer request Lambda@Edge function in CloudFront to handle authentication and authorization.

### Correct answer: D

**Summary:** Authenticate at the edge with a viewer request trigger, which runs before the cache lookup, so even cached content is protected.

### Explanation
- A is wrong: an ALB origin only sees cache misses, so cached files would be served without authentication.
- B is wrong: origin response triggers run only when CloudFront goes to the origin, so cache hits skip authentication.
- C is wrong: an NLB origin has the same problem as an ALB and cannot authenticate HTTP requests.
- D is correct: a viewer request function runs on every request before the cache is checked, so only authenticated users receive cached content.

**Key phrases:** Only authorized users · accessible only after a user is authenticated · low-latency
**Hint:** Authentication must run on every request before CloudFront serves anything, including cached content.

---

## BETA-067: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security

### Question
A company has a web application that retrieves customer financial information. The application runs on Amazon EC2 instances. The application uses an Amazon RDS for PostgreSQL database to store the confidential information. The company needs to encrypt network traffic between the application and the database. Which solution will meet these requirements?

### Options
- **A.** Configure the RDS for PostgreSQL instances to encrypt traffic by using an option group. Restart the RDS for PostgreSQL instances after the configuration update.
- **B.** Configure the RDS for PostgreSQL instances to encrypt traffic by using a parameter group. Restart the RDS for PostgreSQL instances after the configuration update.
- **C.** Configure the RDS for PostgreSQL instances to encrypt traffic by using a parameter group. Wait for the next maintenance window for the database to be restarted.
- **D.** Terminate the existing RDS for PostgreSQL instances. Recreate the instances with the necessary security configuration to encrypt traffic by using an option group.

### Correct answer: B

**Summary:** Force TLS on RDS for PostgreSQL by setting rds.force_ssl in a DB parameter group, then reboot so it takes effect now.

### Explanation
- A is wrong: option groups add engine features; RDS for PostgreSQL enforces SSL through a parameter, not an option.
- B is correct: setting rds.force_ssl to 1 in a custom parameter group (the default group cannot be edited) makes every connection use TLS; on engine versions where the parameter is static, the reboot applies it right away instead of at the next maintenance window.
- C is wrong: on engine versions where rds.force_ssl is static, the change waits for a reboot, so traffic can stay unencrypted until the next maintenance window.
- D is wrong: recreating the instance is unnecessary, and the setting is a parameter, not an option.

**Key phrases:** encrypt network traffic between the application and the database · RDS for PostgreSQL
**Hint:** RDS for PostgreSQL enforces SSL with a database parameter. Where do parameters live, and when does the change apply?

---

## BETA-068: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability

### Question
A company has a stateless public web application that is based on AWS Lambda functions that are invoked by an Amazon API Gateway REST API. To achieve high availability, the company deploys the application to multiple AWS Regions. The company needs a solution to route application traffic to multiple Regions. Which solution will meet this requirement?

### Options
- **A.** Configure an Amazon Route 53 DNS record that uses a failover routing policy. Create health checks for each application endpoint. Use an active-active failover configuration.
- **B.** Create an Amazon Route 53 Resolver outbound endpoint. Configure clients to use the Resolver endpoint to resolve the local REST API DNS name.
- **C.** Create a transit gateway. Attach the transit gateway to the REST API endpoint in each Region. Configure the transit gateway to route requests.
- **D.** Create an Application Load Balancer in the primary Region. Create a target group that includes the REST API endpoint hostnames for each Region.

### Correct answer: A

**Summary:** Multi-Region routing to Regional endpoints is done with Route 53 records plus health checks.

### Explanation
- A is correct: Route 53 records with health checks send traffic to every healthy Regional API endpoint and stop sending to a failed Region.
- B is wrong: a Resolver outbound endpoint forwards DNS queries from a VPC to other resolvers; it does not route client traffic.
- C is wrong: transit gateways connect VPCs and networks; they cannot attach to API Gateway endpoints.
- D is wrong: an ALB in one Region is a single-Region point of failure and cannot target API endpoints in other Regions.

**Key phrases:** multiple AWS Regions · route application traffic to multiple Regions
**Hint:** Which service routes users between Regions and can check each endpoint's health?

---

## BETA-069: Storage & Backup
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Operational Excellence

### Question
A company operates a multi-account AWS environment in the us-west-2 Region. The environment has separate accounts for development, staging, and production workloads. Each account delivers application logs to an Amazon S3 bucket in each account. The company needs to consolidate all application logs into one S3 bucket in a security account. All source buckets and the destination bucket have object versioning enabled. The solution must continuously capture new logs as the logs are generated. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Configure S3 Same-Region Replication rules in each source bucket to replicate objects to the destination S3 bucket. Update the destination bucket policy to accept objects from the source buckets.
- **B.** Create a scheduled AWS Fargate task in the security account. Configure the task to run the aws s3 sync command to copy objects from the source buckets to the destination bucket. Create an execution role that has S3 GET permissions for source buckets and S3 PUT permissions for the destination bucket.
- **C.** Configure S3 Inventory reports for each source S3 bucket. Use S3 Batch Operations to copy objects to the destination S3 bucket in the security account.
- **D.** Deploy an AWS Lambda function in the security account. Configure S3 event notifications in each source bucket to invoke the function when new objects are created. Grant the function S3 GetObject permissions for source buckets and S3 PutObject permissions for the destination bucket.

### Correct answer: A

**Summary:** S3 Same-Region Replication continuously copies new objects to a bucket in another account; both buckets need versioning.

### Explanation
- A is correct: Same-Region Replication copies each new object to the security account's bucket automatically, using the versioning that is already enabled.
- B is wrong: a scheduled sync task runs periodically, not continuously, and is extra infrastructure.
- C is wrong: Inventory and Batch Operations are for one-off or periodic bulk copies, not continuous capture.
- D is wrong: a custom Lambda copier is code to maintain and needs error handling that replication already provides.

**Key phrases:** one S3 bucket in a security account · object versioning enabled · continuously capture new logs · LEAST operational overhead
**Hint:** Versioning is already on everywhere, and everything is in one Region. Which built-in S3 feature copies new objects automatically?

---

## BETA-070: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** easy · **Pillars:** Performance Efficiency

### Question
A company wants to use Amazon EC2 instances to provide a static website to users all over the world. The company needs to minimize latency for the users. Which solution meets these requirements?

### Options
- **A.** Use EC2 instances in a single Availability Zone.
- **B.** Use EC2 instances across multiple Availability Zones in the same AWS Region.
- **C.** Use Amazon CloudFront with the EC2 instances configured as the source.
- **D.** Use EC2 instances in the same edge location and the same AWS Region.

### Correct answer: C

**Summary:** CloudFront caches content at edge locations close to users, with EC2 (or S3) as the origin.

### Explanation
- A is wrong: one Availability Zone is far from most users and is a single point of failure.
- B is wrong: several Availability Zones improve availability, but users far from the Region still see high latency.
- C is correct: CloudFront caches the static content at edge locations near users, with the EC2 instances as the origin.
- D is wrong: EC2 instances do not run in edge locations.

**Key phrases:** static website · users all over the world · minimize latency
**Hint:** Users worldwide and static content point to a CDN.

---

## BETA-071: Monitoring, Management & Governance
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** easy · **Pillars:** Operational Excellence

### Question
A company runs a critical public application on Amazon EKS clusters. The application has a microservices architecture. The company needs to implement a solution that collects, aggregates, and summarizes metrics and logs from the application in a centralized location. Which solution will meet these requirements in the MOST operationally efficient way?

### Options
- **A.** Run the Amazon CloudWatch agent in the existing EKS cluster. Use a CloudWatch dashboard to view the metrics and logs.
- **B.** Configure a data stream in Amazon Kinesis Data Streams. Use Amazon Data Firehose to read events and to deliver the events to an Amazon S3 bucket. Use Amazon Athena to view the events.
- **C.** Configure AWS CloudTrail to capture data events. Use Amazon OpenSearch Service to query CloudTrail.
- **D.** Configure Amazon CloudWatch Container Insights in the existing EKS cluster. Use a CloudWatch dashboard to view the metrics and logs.

### Correct answer: D

**Summary:** CloudWatch Container Insights collects, aggregates and summarizes EKS/ECS metrics and logs with built-in dashboards.

### Explanation
- A is wrong: the plain CloudWatch agent collects data, but you would build the container-level aggregation yourself.
- B is wrong: a Kinesis, Firehose and Athena pipeline is a lot to build for standard container monitoring.
- C is wrong: CloudTrail records API calls, not application metrics or logs.
- D is correct: Container Insights collects, aggregates and summarizes metrics and logs from the EKS cluster and its microservices, with ready-made dashboards.

**Key phrases:** Amazon EKS · collects, aggregates, and summarizes metrics and logs · MOST operationally efficient
**Hint:** Which CloudWatch feature is built to collect and summarize container metrics and logs?

---

## BETA-072: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security

### Question
The lead member of a DevOps team creates an AWS account. A DevOps engineer shares the account credentials with a solutions architect through a password manager application. The solutions architect needs to secure the root user for the new account. Which actions will meet this requirement? (Select TWO.)

### Options
- **A.** Update the root user password to a new, strong password.
- **B.** Secure the root user account by using a virtual multi-factor authentication (MFA) device.
- **C.** Create an IAM user for each member of the DevOps team. Assign the AdministratorAccess AWS managed policy to each IAM user.
- **D.** Create root user access keys. Save the keys as a new parameter in AWS Systems Manager Parameter Store.
- **E.** Update the IAM role for the root user to ensure the root user can use only approved services.

### Correct answers: A, B (choose 2)

**Summary:** Secure the root user: set a new strong password and enable MFA; never create root access keys.

### Explanation
- A is correct: the root password was shared, so replacing it with a new strong password is the first step.
- B is correct: MFA on the root user means a password alone is not enough to sign in.
- C is wrong: giving everyone AdministratorAccess does not secure the root user and breaks least privilege.
- D is wrong: root access keys should never be created; they are powerful long-term credentials.
- E is wrong: the root user has no IAM role, and IAM policies cannot restrict it.

**Key phrases:** secure the root user · shares the account credentials · TWO
**Hint:** The root password has been shared. Change it, then add a second factor.

---

## BETA-073: Compute & Serverless
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization

### Question
A company hosts a multi-tier inventory reporting application on AWS. The company needs a cost-effective solution to generate inventory reports on demand. Admin users need to have the ability to generate new reports. Reports take approximately 5-10 minutes to finish. The application must send reports to the email address of the admin user who generates each report. Which solution will meet these requirements?

### Options
- **A.** Use Amazon ECS to host the report generation code. Use an Amazon API Gateway HTTP API to invoke the code. Use Amazon SES to send the reports to admin users.
- **B.** Use Amazon EventBridge to invoke a scheduled AWS Lambda function to generate the reports. Use Amazon SNS to send the reports to admin users.
- **C.** Use Amazon EKS to host the report generation code. Use an Amazon API Gateway REST API to invoke the code. Use Amazon SNS to send the reports to admin users.
- **D.** Create an AWS Lambda function to generate the reports. Use a function URL to invoke the function. Use Amazon SES to send the reports to admin users.

### Correct answer: D

**Summary:** Short, on-demand jobs suit Lambda (a function URL is a simple trigger); SES sends email to a specific address.

### Explanation
- A is wrong: an always-on ECS service costs money even when no reports are generated.
- B is wrong: a schedule does not generate reports on demand, and SNS sends to topic subscribers rather than the one admin who asked.
- C is wrong: an EKS cluster is expensive and complex for an occasional job, and SNS is not for emailing an individual.
- D is correct: Lambda (up to 15 minutes) covers a 5-10 minute job and costs nothing when idle, a function URL invokes it on demand, and SES emails the report to the requesting admin.

**Key phrases:** on demand · 5-10 minutes · email address of the admin user
**Hint:** A short job run on request, with an email to one specific person. Pick the cheapest compute and the right email service.

---

## BETA-074: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security

### Question
A solutions architect is designing a scalable web application that runs on Amazon EC2. The application users must stay on the same server after login. The application must be protected from common exploits. Which solution will meet these requirements?

### Options
- **A.** Create an Application Load Balancer (ALB) with a target group. Attach the target group to an Auto Scaling group. Enable duration-based stickiness on the target group. Associate the ALB with an AWS Network Firewall firewall.
- **B.** Create a Network Load Balancer (NLB) with a target group. Attach the target group to an Auto Scaling group. Associate the NLB with an AWS WAF web ACL.
- **C.** Create an Application Load Balancer (ALB) with a target group. Attach the target group to an Auto Scaling group. Enable application-based stickiness on the target group. Associate the ALB with an AWS WAF web ACL.
- **D.** Create a Network Load Balancer (NLB) with a target group. Attach the target group to an Auto Scaling group. Enable target group stickiness on the NLB. Associate the NLB with an AWS Network Firewall firewall.

### Correct answer: C

**Summary:** Session affinity plus exploit protection: ALB with application-based stickiness and an AWS WAF web ACL.

### Explanation
- A is wrong: Network Firewall filters network traffic for VPCs; it is not associated with an ALB to block web exploits.
- B is wrong: WAF cannot be associated with a Network Load Balancer.
- C is correct: an ALB supports application-based stickiness tied to the login session, and an AWS WAF web ACL on the ALB blocks common exploits such as SQL injection and XSS.
- D is wrong: NLBs cannot use WAF, and Network Firewall does not protect against application-level exploits.

**Key phrases:** stay on the same server after login · protected from common exploits
**Hint:** Sticky sessions need a layer 7 load balancer, and common web exploits are blocked by a web application firewall.

---

## BETA-075: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability

### Question
A company has an e-commerce application that users access through multiple mobile apps and web applications. The company needs a solution that will receive requests from the mobile apps and web applications through an API Request traffic volume varies significantly throughout each day. Traffic spikes during sales events. The solution must be loosely coupled and ensure that no requests are lost. Which solution will meet these requirements?

### Options
- **A.** Create an Application Load Balancer (ALB). Create an AWS Elastic Beanstalk endpoint to process the requests. Add the Elastic Beanstalk endpoint to the target group of the ALB.
- **B.** Set up an Amazon API Gateway REST API with an integration to an Amazon SQS queue. Configure a dead-letter queue. Create an AWS Lambda function to poll the queue to process the requests.
- **C.** Create an Application Load Balancer (ALB). Create an AWS Lambda function to process the requests. Add the Lambda function as a target of the ALB.
- **D.** Set up an Amazon API Gateway HTTP API with an integration to an Amazon SNS topic. Create an AWS Lambda function to process the requests. Subscribe the function to the SNS topic to process the requests.

### Correct answer: B

**Summary:** API Gateway integrated directly with SQS buffers spikes durably; a dead-letter queue catches messages that keep failing.

### Explanation
- A is wrong: the ALB and Elastic Beanstalk are called directly, so requests can be lost when the backend is overwhelmed.
- B is correct: API Gateway writes each request to SQS, which holds it durably until Lambda processes it, and a dead-letter queue keeps messages that fail repeatedly.
- C is wrong: invoking Lambda directly from an ALB has no buffer, so throttled requests fail.
- D is wrong: SNS pushes to subscribers and retries only for a limited time; it does not durably queue requests.

**Key phrases:** loosely coupled · ensure that no requests are lost · Traffic spikes during sales events
**Hint:** Put a durable buffer between the API and the processing so spikes wait in line instead of being dropped.

---

## BETA-076: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security

### Question
A company runs an application that generates sensitive archival files and stores them in an Amazon S3 bucket. Partner companies consume the archival files from the S3 bucket. The company wants to rearchitect the application's data storage. The company must ensure that the partner companies do not have access to the data before the company encrypts the data and sends it to the S3 bucket. Which solution will meet these requirements?

### Options
- **A.** Configure the S3 bucket to use client-side encryption with an Amazon S3 managed encryption key.
- **B.** Configure the S3 bucket to use server-side encryption with AWS KMS keys (SSE-KMS)
- **C.** Configure the S3 bucket to use dual-layer server-side encryption with AWS KMS keys (DSSE-KMS)
- **D.** Configure the application to use client-side encryption with a key that is stored in AWS KMS.

### Correct answer: D

**Summary:** When data must be encrypted before it reaches S3, use client-side encryption, for example with a KMS key.

### Explanation
- A is wrong: client-side encryption is done by the application; it is not a bucket setting, and S3 managed keys are for server-side encryption.
- B is wrong: SSE-KMS encrypts only after S3 receives the data.
- C is wrong: DSSE-KMS is still server-side, so data arrives at S3 unencrypted.
- D is correct: the application encrypts the data with a KMS key before uploading, so the data is never in S3 unencrypted.

**Key phrases:** do not have access to the data before the company encrypts the data · sends it to the S3 bucket
**Hint:** The data must already be encrypted before it reaches S3. Is that server-side or client-side encryption?

---

## BETA-077: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Cost Optimization

### Question
A company needs a disaster recovery (DR) solution for its Amazon Aurora MySQL database. The solution must have a recovery time objective (RTO) of 20 minutes and a recovery point objective (RPO) of 10 minutes. The solution must minimize costs and ensure data consistency. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Take daily snapshots of the Aurora database. Store the snapshots in an Amazon S3 bucket.
- **B.** Deploy a single Aurora read replica in a second AWS Region.
- **C.** Deploy a multi-Region Aurora DB cluster with read and write endpoints.
- **D.** Deploy an Aurora DB cluster in a second AWS Region.

### Correct answer: B

**Summary:** For minute-level RPO and RTO at low cost, a cross-Region Aurora read replica can be promoted during a disaster.

### Explanation
- A is wrong: daily snapshots could lose up to 24 hours of data, and restoring takes longer than 20 minutes.
- B is correct: a single cross-Region read replica is continuously replicated (seconds of lag) and can be promoted in minutes, the lowest-cost option that meets both targets.
- C is wrong: a multi-Region cluster with write endpoints costs more than a single replica needs to.
- D is wrong: a separate cluster in another Region has no replication, so it has no current data.

**Key phrases:** recovery time objective (RTO) of 20 minutes · recovery point objective (RPO) of 10 minutes · MOST cost-effectively
**Hint:** An RPO of minutes rules out daily snapshots. What is the cheapest continuously replicated copy in another Region?

---

## BETA-078: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** easy · **Pillars:** Cost Optimization, Security

### Question
A company wants to run a serverless application in a VPC for a short-term project. The application uses AWS Lambda functions. The application needs to interact with an on-premises database. The company wants to establish secure and cost-effective network connectivity between the Lambda functions and the on-premises database. Which solution will meet these requirements?

### Options
- **A.** Create an AWS Site-to-Site VPN connection between the on-premises network and the VPC.
- **B.** Use AWS Direct Connect to establish a dedicated network connection between the on-premises network and the VPC.
- **C.** Use a Gateway Load Balancer to establish a private connection between the Lambda functions and the on-premises network.
- **D.** Use AWS Transit Gateway to establish a hub-and-spoke network architecture that connects the on-premises network and the VPC.

### Correct answer: A

**Summary:** Site-to-Site VPN is the fast, cheap, encrypted link for short-term or low-bandwidth hybrid connectivity.

### Explanation
- A is correct: a Site-to-Site VPN is encrypted, set up in minutes, billed by the hour, and can be removed when the project ends.
- B is wrong: Direct Connect takes weeks to provision and costs more, which does not fit a short-term project.
- C is wrong: a Gateway Load Balancer puts third-party appliances in the traffic path; it does not connect to on premises.
- D is wrong: a transit gateway still needs a VPN or Direct Connect behind it and adds cost for a single VPC.

**Key phrases:** short-term project · on-premises database · secure and cost-effective network connectivity
**Hint:** Short-term and cheap, but encrypted. Which connection can be set up in minutes with no long commitment?

---

## BETA-079: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company uses Amazon RDS for MySQL as a database engine for its applications. A recent security audit revealed an RDS instance that is not compliant with company policy for encrypting data at rest. A solutions architect at the company needs to ensure that all existing RDS databases are encrypted using server-side encryption and that any future deviations from the policy are detected. Which combination of steps should the solutions architect take to accomplish this? (Select TWO.)

### Options
- **A.** Create an AWS Config rule to detect the creation of unencrypted RDS databases. Create an Amazon EventBridge rule to trigger on the AWS Config rules compliance state change and use Amazon SNS to notify the security operations team.
- **B.** Use AWS Systems Manager State Manager to detect RDS database encryption configuration drift. Create an Amazon EventBridge rule to track state changes and use Amazon SNS to notify the security operations team.
- **C.** Create a read replica for the existing unencrypted RDS database and enable replica encryption in the process. Once the replica becomes active, promote it into a standalone database instance and terminate the unencrypted database instance.
- **D.** Take a snapshot of the unencrypted RDS database. Copy the snapshot and enable snapshot encryption in the process. Restore the database instance from the newly created encrypted snapshot. Terminate the unencrypted database instance.
- **E.** Enable encryption for the identified unencrypted RDS instance by changing the configurations of the existing database.

### Correct answers: A, D (choose 2)

**Summary:** Encrypt an existing RDS instance by copying a snapshot with encryption and restoring it; detect future drift with an AWS Config rule.

### Explanation
- A is correct: an AWS Config rule flags unencrypted RDS instances, and EventBridge plus SNS alert the security team whenever compliance changes.
- B is wrong: State Manager manages configuration inside instances; it does not evaluate RDS encryption settings.
- C is wrong: RDS for MySQL cannot create an encrypted read replica from an unencrypted instance.
- D is correct: copying the snapshot with encryption enabled, then restoring from the copy, produces an encrypted instance to replace the old one.
- E is wrong: encryption cannot be turned on for an existing unencrypted RDS instance.

**Key phrases:** encrypted using server-side encryption · future deviations from the policy are detected · TWO
**Hint:** One step fixes the existing database, the other watches for new problems. Existing RDS instances cannot be encrypted in place.

---

## BETA-080: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization, Operational Excellence

### Question
A company wants to optimize Amazon S3 storage costs for the company's video content. The company needs to archive the video content 6 months after the company creates the content. The company must delete the content after 24 months. Which solution will meet these requirements with the LEAST operational effort?

### Options
- **A.** Use S3 Intelligent-Tiering to transition the content to S3 Glacier Flexible Retrieval after 6 months. Configure an Object Lock retention period of 24 months.
- **B.** Create an Amazon EFS lifecycle configuration to transition the content to S3 Glacier Flexible Retrieval after 6 months. Configure a lifecycle rule to expire the objects after 24 months.
- **C.** Use AWS DataSync to transition the content to S3 Glacier Deep Archive after 6 months and to expire the objects after 24 months.
- **D.** Create an S3 Lifecycle configuration to transition the content to S3 Glacier Flexible Retrieval after 6 months and to expire objects after 24 months.

### Correct answer: D

**Summary:** One S3 Lifecycle configuration handles both transitions (archive at 6 months) and expiration (delete at 24 months).

### Explanation
- A is wrong: Intelligent-Tiering moves objects between its own tiers based on access, not to Glacier Flexible Retrieval on a fixed date, and Object Lock prevents deletion rather than performing it.
- B is wrong: EFS lifecycle policies manage EFS storage classes; they cannot move data to S3 Glacier.
- C is wrong: DataSync copies data between storage systems; it does not transition or expire S3 objects.
- D is correct: one lifecycle configuration moves objects to Glacier Flexible Retrieval after 6 months and deletes them after 24 months, with no further effort.

**Key phrases:** archive the video content 6 months · delete the content after 24 months · LEAST operational effort
**Hint:** Moving objects to another storage class and deleting them later are both jobs for one S3 feature.

---

## BETA-081: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** hard · **Pillars:** Cost Optimization, Security

### Question
A company must save all the email messages that its employees send to customers for a period of 12 months. The messages are stored in a binary format and vary in size from 1 KB to 20 KB. The company has selected Amazon S3 as the storage service for the messages. Which combination of steps will meet these requirements MOST cost-effectively? (Select TWO.)

### Options
- **A.** Create an S3 bucket policy that denies the s3:DeleteObject action.
- **B.** Create an S3 Lifecycle configuration that deletes the messages after 12 months.
- **C.** Upload the messages to Amazon S3. Use S3 Object Lock in governance mode.
- **D.** Upload the messages to Amazon S3. Use S3 Object Lock in compliance mode.
- **E.** Use S3 Inventory. Create an AWS Batch job that periodically scans the inventory and deletes the messages after 12 months.

### Correct answers: A, B (choose 2)

**Summary:** When retention need not be irreversible, a bucket policy that denies DeleteObject plus a lifecycle expiration rule is the cheapest way to keep data for a fixed period.

### Explanation
- A is correct: a bucket policy that denies s3:DeleteObject stops users deleting messages early, costs nothing and needs no versioning.
- B is correct: a lifecycle rule deletes the messages automatically after 12 months; lifecycle expiration is not blocked by the bucket policy.
- C is wrong: governance mode requires versioning and a retention setting on every object, and users with the bypass permission can still delete, so it adds cost and effort without a stronger guarantee.
- D is wrong: compliance mode also works, but it requires versioning and cannot be undone, so even messages uploaded by mistake must be kept and paid for until the 12 months end; the question asks for no immutable retention.
- E is wrong: a custom Inventory and Batch deletion job is far more effort than a lifecycle rule, and it does not protect the messages.

**Key phrases:** must save all the email messages · 12 months · MOST cost-effectively · TWO
**Hint:** You must stop messages being deleted early and delete them automatically at 12 months, as cheaply as possible. Nothing asks for retention that can never be undone.

---

## BETA-082: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security, Operational Excellence

### Question
A company performs a security review of its AWS workloads and finds that all the company's IAM users have the AdministratorAccess IAM managed policy directly attached. The company's IAM users belong to either an engineering department or an operations department. Engineering users require full read and write access to all resources. Operations users require only read access to all resources. The company must apply the principle of least privilege to user access. Which solution will meet this requirement in the MOST operationally efficient way?

### Options
- **A.** Create an IAM group for each department. Add either the AdministratorAccess or ReadOnlyAccess IAM managed policy to each group as appropriate. Add each department user to the appropriate IAM group. Remove existing IAM permissions from the users.
- **B.** Create an IAM group named Staff. Apply both the AdministratorAccess and ReadOnlyAccess IAM managed policy to the Staff IAM group. Add all IAM users to the Staff group. Remove existing IAM permissions from the users.
- **C.** Add the ReadOnlyAccess IAM managed policy to IAM users that belong to the operations department users. Remove existing AdministratorAccess IAM permissions from the operations department users. Add a tag of Operations to the operations department IAM users.
- **D.** Add the ReadOnlyAccess inline policy statement to IAM users that belong to the operations department. Remove the existing AdministratorAccess IAM permissions from operations department users. Add a tag of Operations to the operations department IAM users.

### Correct answer: A

**Summary:** Grant permissions to IAM groups by role and add users to the right group; avoid attaching policies to individual users.

### Explanation
- A is correct: one group per department with the right managed policy gives each user only what their department needs, and new users just join a group.
- B is wrong: putting both policies on one group gives everyone AdministratorAccess, so nothing changes.
- C is wrong: attaching policies to each user one by one is harder to manage, and the tag does nothing.
- D is wrong: inline policies per user are the hardest to manage, and the tag does nothing.

**Key phrases:** AdministratorAccess IAM managed policy directly attached · engineering department or an operations department · principle of least privilege · MOST operationally efficient
**Hint:** Manage permissions per department, not per user.

---

## BETA-083: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence

### Question
An online marketplace uses an Application Load Balancer (ALB) as the origin for an Amazon CloudFront distribution. Amazon EC2 instances behind the ALB serve the application. Sellers upload product images to an Amazon S3 bucket. The company recently expanded internationally and needs to dynamically add AWS Region-specific compliance watermarks to images based on the location of the viewer. The solution must not store separate copies for each Region. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Deploy image processing software on the EC2 instances to add watermarks based on the viewer's location.
- **B.** Create a CloudFront origin request policy to add watermarks based on the CloudFront-Viewer-Country header.
- **C.** Use a Lambda@Edge function that uses an image processing library associated with the CloudFront cache behavior for images.
- **D.** Create a CloudFront response headers policy to add watermarks based on the CloudFront-Viewer-Country header.

### Correct answer: C

**Summary:** Changing content per viewer at the edge (watermarks, resizing) needs Lambda@Edge; CloudFront policies only handle headers.

### Explanation
- A is wrong: processing on the EC2 fleet adds load and work to the origin for every image.
- B is wrong: an origin request policy only chooses which headers reach the origin; it cannot change images.
- C is correct: Lambda@Edge can read the viewer's country and add the right watermark as the image is served, so no per-Region copies are stored.
- D is wrong: a response headers policy only adds or removes headers; it cannot change image content.

**Key phrases:** Region-specific compliance watermarks · location of the viewer · must not store separate copies · LEAST operational overhead
**Hint:** Changing image content at request time needs code at the edge. Policies only manage headers.

---

## BETA-084: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** hard · **Pillars:** Security

### Question
A company uses an organization in AWS Organizations to manage multiple AWS accounts. Multiple teams access each AWS account by assuming IAM roles. Each team has a unique IAM role. Each IAM role has a unique set of permissions. A security team wants to automate some security tasks by deploying AWS Lambda functions within each AWS account. The security team wants to ensure that only members of the security team can modify the Lambda functions directly. Which solution will meet these requirements?

### Options
- **A.** Create a service control policy (SCP) that prevents any entity from making changes to Lambda functions except for the IAM role of the security team that is specified in the Principal key. Attach the SCP to the root of the organization.
- **B.** Create an IAM policy that denies all changes to the Amazon Resource Names (ARNs) of the Lambda functions. Attach the IAM policy to the root user of each AWS account.
- **C.** Create a service control policy (SCP) that denies all changes to Lambda functions. Attach the SCP to the root of the organization.
- **D.** Create a service control policy (SCP) that prevents any entity from making changes to Lambda functions except for the IAM role of the security team that is specified in the Condition clause. Attach the SCP to the root of the organization.

### Correct answer: D

**Summary:** To exempt a role from an SCP deny, use a Condition such as aws:PrincipalArn; SCPs do not support naming principals.

### Explanation
- A is wrong: SCPs do not support a Principal element for choosing who is affected.
- B is wrong: IAM policies cannot be attached to the root user, and this would not allow the security team either.
- C is wrong: denying all changes also blocks the security team.
- D is correct: an SCP that denies Lambda changes unless aws:PrincipalArn matches the security team's role lets only that team modify the functions in every account.

**Key phrases:** only members of the security team can modify the Lambda functions · unique IAM role
**Hint:** SCPs have no Principal element for naming who is exempt. How do you exclude one role from a deny statement?

---

## BETA-085: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Reliability, Operational Excellence

### Question
A company wants to build a serverless application in which multiple microservices need to exchange messages. The company needs to ensure that messages that the microservices send to one another are processed exactly once in the exact order the messages are sent. Which solution will meet these requirements in the MOST operationally efficient way?

### Options
- **A.** Create an Amazon SQS FIFO queue. Configure the microservices to use the SQS queue to exchange messages.
- **B.** Use Amazon SNS topics to connect the microservices to one another. Subscribe the microservices to the SNS topics. Use the Amazon SNS API to send and receive notifications between microservices.
- **C.** Create an Amazon SQS standard queue. Connect the microservices to one another by using Amazon EventBridge events that the microservices exchange through the SQS queue.
- **D.** Use Amazon Managed Streaming for Apache Kafka (Amazon MSK) on Amazon EC2 instances to deploy the application.

### Correct answer: A

**Summary:** SQS FIFO queues give ordered, exactly-once processing with no servers to run.

### Explanation
- A is correct: a FIFO queue keeps messages in the order they were sent and removes duplicates, so each is processed exactly once, and it is fully managed.
- B is wrong: SNS standard topics do not guarantee order or exactly-once delivery, and SNS is not used to receive messages.
- C is wrong: a standard queue can deliver out of order and more than once, and adding EventBridge makes it more complex.
- D is wrong: self-managing Kafka on EC2 is heavy operational work.

**Key phrases:** processed exactly once · exact order · MOST operationally efficient
**Hint:** Exactly once and in order: which queue type guarantees both?

---

## BETA-086: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** hard · **Pillars:** Cost Optimization, Operational Excellence

### Question
A company stores data across 200 Amazon S3 buckets that multiple departments use. Each department has prefix-based tenant isolation for each team in the department. The finance team needs to identify which specific buckets and prefixes are driving the highest S3 costs. The finance team needs bucket-level and prefix-level storage usage and request patterns and the dollar costs attributed to each bucket. Which combination of steps will meet these requirements? (Select TWO.)

### Options
- **A.** Enable S3 Storage Lens advanced metrics. Activate prefix-level aggregation to view storage usage and request activity for each bucket and each prefix.
- **B.** Use the S3 Storage Lens free tier to view storage usage. Configure S3 server access logging to view request patterns.
- **C.** Configure AWS Cost and Usage Reports to use resource-level granularity to identify costs for each bucket by usage type.
- **D.** Use AWS Cost Explorer. Apply cost allocation tags to view S3 costs grouped by bucket and usage type.
- **E.** Enable S3 server access logging on all buckets. Query the logs by using Amazon Athena to calculate costs for each prefix.

### Correct answers: A, C (choose 2)

**Summary:** S3 Storage Lens advanced metrics show usage and requests per bucket and prefix; CUR with resource IDs shows the dollar cost per bucket.

### Explanation
- A is correct: Storage Lens advanced metrics with prefix aggregation show storage and request activity for every bucket and prefix.
- B is wrong: the free tier has no prefix-level or activity metrics, and access logs must be processed before they are useful.
- C is correct: the Cost and Usage Report with resource IDs lists the cost of each bucket by usage type.
- D is wrong: cost allocation tags would have to be applied to all 200 buckets first, and they still do not show prefixes.
- E is wrong: access logs show requests, not dollar costs, and turning them into costs is custom work.

**Key phrases:** 200 Amazon S3 buckets · bucket-level and prefix-level storage usage and request patterns · dollar costs attributed to each bucket · TWO
**Hint:** One tool shows usage and activity down to the prefix; another shows the dollar cost of each bucket.

---

## BETA-087: Disaster Recovery & Migration
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Operational Excellence

### Question
A company is migrating an application to the AWS Cloud. The application runs in an on-premises data center and writes thousands of images into a mounted NFS file system each night. After the company migrates the application, the company will host the application on an Amazon EC2 instance with a mounted Amazon EFS file system. The company has established an AWS Direct Connect connection to AWS. Before the migration cutover, a solutions architect must build a process that will replicate the newly created on-premises images to the EFS file system. What is the MOST operationally efficient way to replicate the images?

### Options
- **A.** Configure a periodic process to run the aws s3 sync command from the on-premises file system to Amazon S3. Configure an AWS Lambda function to process event notifications from Amazon S3 and copy the images from Amazon S3 to the EFS file system.
- **B.** Deploy an AWS Storage Gateway file gateway with an NFS mount point. Mount the file gateway file system on the on-premises server. Configure a process to periodically copy the images to the mount point.
- **C.** Deploy an AWS DataSync agent to an on-premises server that has access to the NFS file system. Send data over the Direct Connect connection to an S3 bucket by using a public VIF. Configure an AWS Lambda function to process event notifications from Amazon S3 and copy the images from Amazon S3 to the EFS file system.
- **D.** Deploy an AWS DataSync agent to an on-premises server that has access to the NFS file system. Send data over the Direct Connect connection to an AWS PrivateLink interface VPC endpoint for Amazon EFS by using a private VIF. Configure a DataSync scheduled task to send the images to the EFS file system every 24 hours.

### Correct answer: D

**Summary:** DataSync copies from on-premises NFS straight to EFS on a schedule, privately over Direct Connect.

### Explanation
- A is wrong: going through S3 and a Lambda copier adds extra steps and code.
- B is wrong: File Gateway writes to S3, not EFS, and the copy process is still manual.
- C is wrong: staging in S3 and copying with Lambda adds steps, and a public VIF uses public endpoints.
- D is correct: a DataSync agent copies new images directly into EFS on a schedule, privately over Direct Connect, and handles verification and retries.

**Key phrases:** mounted NFS file system · Amazon EFS file system · AWS Direct Connect connection · MOST operationally efficient
**Hint:** Which service copies directly from on-premises NFS to EFS on a schedule, without S3 in the middle?

---

## BETA-088: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A company is building an e-commerce platform that will allow customers to place orders online. Customer traffic varies significantly. An order-processing microservice is running on a group of Amazon EC2 instances. A solutions architect must ensure that the application remains responsive and decoupled from the frontend. The application must also be able to reprocess orders that the application fails to process on the first attempt. Which solution will meet these requirements?

### Options
- **A.** Deploy an Application Load Balancer in front of the order processing microservice. Configure the Amazon EC2 instances to scale out automatically based on CPU utilization metrics as traffic increases.
- **B.** Deploy an Amazon SQS queue to integrate the frontend and the order-processing microservice. Configure the frontend to send messages to the queue. Configure the EC2 instances to process messages from the queue.
- **C.** Establish direct HTTPS connections from the frontend to the microservice. Use a dynamically expanding thread pool to handle concurrency at the microservice layer.
- **D.** Use Amazon Kinesis Data Streams to ingest all order requests from the frontend. Configure the Amazon EC2 instances to continuously poll the stream and process orders in near real time.

### Correct answer: B

**Summary:** An SQS queue decouples the frontend from workers; failed messages become visible again and are retried.

### Explanation
- A is wrong: an ALB calls the service directly, so it is not decoupled, and failed requests are lost.
- B is correct: SQS buffers orders between the frontend and workers, and a message that fails becomes visible again to be reprocessed.
- C is wrong: direct HTTPS calls tightly couple the tiers and lose orders that fail.
- D is wrong: Kinesis handles ordered streams, but it is more complex, and per-message retry is not built in the way it is with SQS.

**Key phrases:** decoupled from the frontend · reprocess orders that the application fails to process
**Hint:** What sits between the frontend and the workers, and redelivers a message if processing fails?

---

## BETA-089: Databases & Caching
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A company is running a critical workload on an Amazon RDS DB instance. The company needs the DB instance to be highly available. The company requires a recovery time of less than 5 minutes. Which solution will meet these requirements?

### Options
- **A.** Create a read replica of the DB instance.
- **B.** Use AWS CloudFormation to create a template of the DB instance.
- **C.** Take periodic snapshots of the DB instance. Store the snapshots in Amazon S3.
- **D.** Modify the DB instance to use a Multi-AZ deployment.

### Correct answer: D

**Summary:** RDS Multi-AZ keeps a synchronous standby and fails over automatically, typically within 1-2 minutes.

### Explanation
- A is wrong: a read replica must be promoted by hand, and replication is asynchronous.
- B is wrong: a CloudFormation template recreates infrastructure, not the data, and takes far longer than 5 minutes.
- C is wrong: restoring from a snapshot takes too long and loses recent data.
- D is correct: Multi-AZ keeps a synchronous standby in another Availability Zone and fails over automatically, usually in 1-2 minutes.

**Key phrases:** highly available · less than 5 minutes
**Hint:** Which RDS feature keeps a synchronous standby and fails over automatically?

---

## BETA-090: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence

### Question
A company runs a multi-tenant software as a service (SaaS) application that stores customer analytics data across two AWS Regions. The company encrypts data at rest and does not want to manage key material directly. The company needs encryption keys that work in both Regions and needs to control key access based on customer tenant identifiers. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Use AWS KMS to create multi-Region keys. Apply tags to identify tenant associations for each key. Use attribute-based access control (ABAC) condition keys to control access to the keys.
- **B.** Generate key material externally and import the material into separate AWS KMS keys in each Region. Apply tags to identify tenant associations. Use attribute-based access control (ABAC) condition keys to control access.
- **C.** Use AWS CloudHSM to create an HSM cluster in the first Region. Copy cluster backups to the second Region and create a new cluster from the backup. Synchronize keys manually by using the CloudHSM CLI.
- **D.** Use AWS CloudHSM to provision HSM clusters in both Regions. Create HSM users for each tenant. Use the CloudHSM Management Utility to replicate keys and share them with users in each Region.

### Correct answer: A

**Summary:** KMS multi-Region keys share key material across Regions; tag the keys and use ABAC conditions to control access per tenant.

### Explanation
- A is correct: multi-Region keys work interchangeably in both Regions with AWS-managed key material, and ABAC on tenant tags controls who can use each key.
- B is wrong: importing external key material means generating and protecting it yourself, which the company wants to avoid.
- C is wrong: CloudHSM clusters and manual key synchronization are a lot of operational work.
- D is wrong: CloudHSM users per tenant and manual key replication are complex to run.

**Key phrases:** two AWS Regions · does not want to manage key material · tenant identifiers · LEAST operational overhead
**Hint:** You need the same key usable in two Regions, and access based on tags.

---

## BETA-091: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** easy · **Pillars:** Security

### Question
A company uses Amazon EC2 instances behind an Application Load Balancer (ALB) to serve content to users. The company uses Amazon EBS volumes to store data. The company needs to encrypt data in transit and at rest. Which combination of services will meet these requirements? (Select TWO.)

### Options
- **A.** Amazon GuardDuty.
- **B.** AWS Shield.
- **C.** AWS Certificate Manager (ACM)
- **D.** AWS Secrets Manager.
- **E.** AWS KMS.

### Correct answers: C, E (choose 2)

**Summary:** In transit: ACM certificates on the ALB (HTTPS). At rest: KMS keys for EBS encryption.

### Explanation
- A is wrong: GuardDuty detects threats; it does not encrypt anything.
- B is wrong: Shield protects against DDoS attacks; it does not encrypt anything.
- C is correct: ACM provides the TLS certificates that let the ALB serve HTTPS, which encrypts data in transit.
- D is wrong: Secrets Manager stores credentials; it does not encrypt traffic or volumes.
- E is correct: KMS manages the keys used to encrypt EBS volumes at rest.

**Key phrases:** encrypt data in transit and at rest · TWO
**Hint:** One service issues TLS certificates for the ALB; the other manages the keys that encrypt EBS volumes.

---

## BETA-092: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Performance Efficiency

### Question
A company is building a serverless application to process large volumes of sensor data. The application uses an AWS Lambda function and stores data in an Amazon DynamoDB table. The application needs to handle unpredictable traffic patterns with occasional spikes in data ingestion. The company wants to optimize application performance to respond to spikes in demand. Which solution will meet these requirements?

### Options
- **A.** Configure provisioned concurrency for the Lambda function. Use on-demand capacity mode for the DynamoDB table.
- **B.** Configure provisioned concurrency for the Lambda function. Use provisioned capacity mode for the DynamoDB table.
- **C.** Configure reserved concurrency for the Lambda function. Use on-demand capacity mode for the DynamoDB table.
- **D.** Configure reserved concurrency for the Lambda function. Use provisioned capacity mode for the DynamoDB table.

### Correct answer: A

**Summary:** Spiky serverless ingestion: Lambda provisioned concurrency for ready capacity, DynamoDB on-demand for unpredictable throughput.

### Explanation
- A is correct: provisioned concurrency keeps environments warm for bursts, and on-demand mode lets DynamoDB absorb unpredictable spikes without throttling.
- B is wrong: provisioned capacity mode must be planned in advance and can throttle during sudden spikes.
- C is wrong: reserved concurrency caps and reserves capacity; it does not pre-warm environments.
- D is wrong: reserved concurrency does not remove cold starts, and provisioned capacity can throttle during spikes.

**Key phrases:** unpredictable traffic patterns · occasional spikes · respond to spikes in demand
**Hint:** One setting keeps Lambda ready for bursts, and one DynamoDB mode absorbs unpredictable traffic without planning capacity.

---

## BETA-093: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Reliability

### Question
A social media company is expanding its Amazon DynamoDB backed infrastructure to accommodate increasing user activity. The company manages three data types: user profiles, posts, and comments. The company wants to ensure high performance for write-heavy queries. The new solution must ensure high availability. The new solution needs to provide low latency between the database layer and the application layer. The new solution must be able to handle dynamic traffic patterns for global users. The company must also track changes to items in the DynamoDB tables. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create a single DynamoDB table to store all the data types. Use global secondary indexes (GSIs) for queries. Use DynamoDB auto scaling to ensure adaptive capacity. Use Amazon Kinesis Data Streams to provide low latency and to track changes.
- **B.** Use a separate DynamoDB table for each data type. Use on-demand capacity mode for all tables. Use DynamoDB Accelerator (DAX) to provide low latency. Use Amazon Kinesis Data Streams to track changes.
- **C.** Use DynamoDB global tables to distribute data across AWS Regions and to provide low latency. Use a separate DynamoDB table for each data type. Use Amazon DynamoDB Streams to track changes.
- **D.** Create a single DynamoDB table to store all data types. Use provisioned capacity mode to provide low latency. Use composite sort keys for queries. Use Amazon Data Firehose to track changes.

### Correct answer: C

**Summary:** Global, write-heavy DynamoDB: global tables for multi-Region low latency and availability; DynamoDB Streams to track item changes.

### Explanation
- A is wrong: Kinesis Data Streams does not reduce latency, and a single-Region table does not serve global users well.
- B is wrong: DAX speeds up reads, not a write-heavy workload, and a single Region does not serve global users.
- C is correct: global tables replicate tables across Regions for low latency and high availability, and DynamoDB Streams records every item change with no extra service.
- D is wrong: provisioned capacity does not lower latency, and Firehose delivers data; it does not capture item changes.

**Key phrases:** write-heavy · global users · track changes to items · LEAST operational overhead
**Hint:** Global users and low latency point to multi-Region tables; tracking item changes has a built-in DynamoDB feature.

---

## BETA-094: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Operational Excellence

### Question
A company uses AWS CloudFormation to provision AWS infrastructure. Multiple application teams create similar networking resources for their workloads. The teams currently copy and modify sections of CloudFormation templates, which causes inconsistent resource configurations across applications. The company needs to provide a reusable standard pattern that the teams can consume. Updates to the pattern must be managed from a central location. Which solution will meet these requirements?

### Options
- **A.** Create reusable CloudFormation modules that define the approved networking patterns. Instruct the teams to use the modules in their templates.
- **B.** Create a central repository that contains approved CloudFormation template snippets. Require the teams to copy the relevant snippets into their templates.
- **C.** Store a shared CloudFormation template in an Amazon S3 bucket. Instruct each team to copy the most recent version before provisioning resources.
- **D.** Create an AWS Systems Manager Automation runbook that provisions the approved networking resources for each team.

### Correct answer: A

**Summary:** CloudFormation modules package standard resource configurations for reuse across templates, managed centrally.

### Explanation
- A is correct: modules package the approved networking resources as a reusable building block that templates include, and updates are made in one place.
- B is wrong: copying snippets is what caused the inconsistency in the first place.
- C is wrong: teams copying a shared template still end up with diverging copies.
- D is wrong: an Automation runbook bypasses the teams' CloudFormation stacks, so the resources are not part of their templates.

**Key phrases:** reusable standard pattern · managed from a central location
**Hint:** Which CloudFormation feature packages resources so templates can reuse them, updated in one place?

---

## BETA-095: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** easy · **Pillars:** Operational Excellence, Performance Efficiency

### Question
A company wants to design a microservices architecture for an application. Each microservice must perform operations that can be completed within 30 seconds. The microservices need to expose RESTful APIs and must automatically scale in response to varying loads. The APIs must also provide client access control and rate limiting to maintain equitable usage and service availability. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Use Amazon ECS on Amazon EC2 to host each microservice. Use Amazon API Gateway to manage the RESTful API requests.
- **B.** Deploy each microservice as a set of AWS Lambda functions. Use Amazon API Gateway to manage the RESTful API requests.
- **C.** Host each microservice on Amazon EC2 instances in Auto Scaling groups behind an Elastic Load Balancing (ELB) load balancer. Use the ELB to manage the RESTful API requests.
- **D.** Deploy each microservice on Amazon Elastic Beanstalk. Use Amazon CloudFront to manage the RESTful API requests.

### Correct answer: B

**Summary:** Lambda behind API Gateway gives auto-scaling REST APIs with built-in authorization, throttling and usage plans.

### Explanation
- A is wrong: ECS on EC2 means managing and scaling a cluster of instances.
- B is correct: Lambda scales automatically and fits 30-second operations, and API Gateway provides authorization, throttling and usage plans.
- C is wrong: EC2 fleets need management, and a load balancer has no API keys or per-client rate limiting.
- D is wrong: CloudFront is a CDN; it does not provide API access control or usage plans.

**Key phrases:** within 30 seconds · RESTful APIs · client access control and rate limiting · LEAST operational overhead
**Hint:** Short operations, automatic scaling, and an API front door with throttling and API keys.

---

## BETA-096: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security

### Question
A healthcare company receives de-identified medical records from hospital partners that upload data to a centralized Amazon S3 bucket. A regulatory agency requires encryption of all stored health information. Which solution will meet these requirements?

### Options
- **A.** Configure a bucket policy that denies PutObject requests when the s3:x-amz-acl condition key is not present in the request headers.
- **B.** Configure a bucket policy that denies PutObject requests when the s3:x-amz-acl condition key is not set to bucket-owner-full-control in the request.
- **C.** Configure a bucket policy that denies PutObject requests when the aws:SecureTransport condition key is not set to true in the request.
- **D.** Configure a bucket policy that denies PutObject requests when the s3:x-amz-server-side-encryption header is not present in the request.

### Correct answer: D

**Summary:** A bucket policy can deny PutObject requests without the x-amz-server-side-encryption header (S3 also encrypts new objects with SSE-S3 by default).

### Explanation
- A is wrong: x-amz-acl sets object ACLs; it has nothing to do with encryption.
- B is wrong: bucket-owner-full-control is about object ownership, not encryption.
- C is wrong: aws:SecureTransport enforces encryption in transit, not at rest.
- D is correct: denying any PutObject without the server-side encryption header ensures every stored object is encrypted at rest.

**Key phrases:** encryption of all stored health information
**Hint:** Encryption at rest is requested with a specific header on each PUT. Which condition checks for it?

---

## BETA-097: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security

### Question
A company provides a three-tier web application to its customers. Each customer has an AWS account in which the application is deployed, and These accounts are members of the company's organization in AWS Organizations. To protect its customers' AWS accounts and applications, the company wants to monitor them for unusual and unexpected behavior. The company needs to analyze and monitor customer VPC Flow Logs, AWS CloudTrail logs, and DNS logs. What should a solutions architect do to meet these requirements?

### Options
- **A.** Designate an account in the organization as the AWS Shield administrator account. Enable Shield and Shield logs in every account, and invite the accounts to join the Shield administrator account. Analyze Shield findings in the Shield administrator account.
- **B.** Designate an account in the organization as the Amazon GuardDuty administrator account. Enable GuardDuty in every account, and invite the accounts to join the GuardDuty administrator account. Analyze GuardDuty findings in the GuardDuty administrator account.
- **C.** Designate an account in the organization as the AWS WAF administrator account. Enable AWS WAF and AWS WAF logs in every account, and invite the accounts to join the AWS WAF administrator account. Analyze AWS WAF logs in the AWS WAF administrator account.
- **D.** Designate an account in the organization as the AWS Resource Access Manager (AWS RAM) administrator account. Enable AWS RAM in every account, and invite the accounts to join the AWS RAM administrator account. Analyze AWS RAM logs in the AWS RAM administrator account.

### Correct answer: B

**Summary:** GuardDuty analyzes VPC Flow Logs, CloudTrail and DNS logs for threats; a delegated administrator account centralizes findings.

### Explanation
- A is wrong: Shield protects against DDoS attacks; it does not analyze these logs for unusual behavior.
- B is correct: GuardDuty analyzes VPC Flow Logs, CloudTrail and DNS logs for threats, and an administrator account collects findings from every member account.
- C is wrong: WAF filters web requests; it does not analyze flow, CloudTrail or DNS logs.
- D is wrong: Resource Access Manager shares resources between accounts; it does not monitor anything.

**Key phrases:** unusual and unexpected behavior · VPC Flow Logs, AWS CloudTrail logs, and DNS logs
**Hint:** Which service analyzes exactly these three log sources for threats, with a delegated administrator for the organization?

---

## BETA-098: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security

### Question
A company needs to use container images for a new project. A development team requires full access to a new Amazon ECR repository. A solutions architect creates a new IAM role that has the AmazonEC2ContainerRegistryFullAccess policy attached. The solutions architect creates a second ECR repository by using an existing repository as a template. When a developer tries to push a docker image to the second repository by using the new IAM role, the command fails with an authorization error. What is the likely cause of the error?

### Options
- **A.** The token that the developer retrieved to log in to the docker repository by using the aws ecr get-login-password command is older than 2 hours.
- **B.** The IAM role that is assigned to the development team does not have permission to pull images from the repository.
- **C.** The developer does not have multi-factor authentication (MFA) enabled.
- **D.** The new repository was created from an ECR repository policy that denies pushing images.

### Correct answer: D

**Summary:** An explicit Deny in a resource policy overrides IAM Allows; a repository created from a template can inherit a repository policy that denies pushes.

### Explanation
- A is wrong: the token from get-login-password is valid for 12 hours, so a 2-hour-old token is still valid.
- B is wrong: pulling is not what failed, and the full-access policy includes pull permissions anyway.
- C is wrong: the ECR full-access policy does not require MFA.
- D is correct: the new repository copied a repository policy that denies pushes, and an explicit Deny overrides the role's IAM Allow.

**Key phrases:** AmazonEC2ContainerRegistryFullAccess · using an existing repository as a template · authorization error
**Hint:** The role has full ECR permissions. What could still deny the push, and what did the template copy?

---

## BETA-099: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** hard · **Pillars:** Cost Optimization, Performance Efficiency

### Question
A company stores image files in an Amazon S3 bucket. Development teams from multiple AWS accounts need to pull the image files for their application deployments. The company wants to provide access to the image files while reducing costs. Which solution will meet these requirements?

### Options
- **A.** Configure an interface VPC endpoint for the bucket.
- **B.** Use the Requester Pays configuration on the bucket.
- **C.** Deploy an Amazon CloudFront distribution to deliver the image files.
- **D.** Configure the bucket to allow access only through AWS PrivateLink endpoints.

### Correct answer: C

**Summary:** CloudFront caches frequently downloaded S3 objects, reducing S3 requests, and transfer from S3 to CloudFront is free.

### Explanation
- A is wrong: an interface endpoint adds hourly and per-GB charges, and it only gives private network access; it does not reduce the number of downloads or their cost.
- B is wrong: Requester Pays only shifts the cost to the other teams; it does not reduce the total.
- C is correct: CloudFront serves repeated pulls from its cache, which cuts S3 requests; transfer from S3 to CloudFront is free, and CloudFront data transfer out costs less than transfer out directly from S3.
- D is wrong: PrivateLink-only access adds endpoint charges and does not reduce the cost of repeated downloads.

**Key phrases:** multiple AWS accounts · pull the image files · reducing costs
**Hint:** Many teams pull the same files again and again. What serves repeated downloads from a cache instead of from S3 each time?

---

## BETA-100: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability

### Question
A solutions architect is managing an application in the us-west-1 Region and wants to set up disaster recovery in the us-east-1 Region. The Amazon Aurora MySQL DB cluster needs RPO of 1 minute and an RTO of 2 minutes. Which approach meets these requirements with no negative performance impact?

### Options
- **A.** Enable synchronous replication.
- **B.** Enable asynchronous binlog replication.
- **C.** Create an Aurora Global Database.
- **D.** Copy Aurora incremental snapshots to the us-east-1 Region.

### Correct answer: C

**Summary:** Aurora Global Database replicates across Regions in about a second (RPO) and promotes a secondary in about a minute (RTO).

### Explanation
- A is wrong: synchronous replication across Regions would add latency to every write.
- B is wrong: binlog replication adds load on the primary and is slower to fail over.
- C is correct: Aurora Global Database replicates at the storage layer with typically under 1 second of lag and can promote the secondary in about a minute, without slowing the primary.
- D is wrong: copying snapshots gives an RPO of hours and a long restore.

**Key phrases:** us-west-1 · us-east-1 · RPO of 1 minute and an RTO of 2 minutes · no negative performance impact
**Hint:** Which Aurora feature replicates to another Region at the storage layer, usually in under a second?

---

## BETA-101: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** hard · **Pillars:** Security

### Question
A company runs several Amazon EC2 instances in private subnets. The company needs to be able to copy files directly to the EC2 instances. The company wants to use standard Linux tools such as secure copy protocol (SCP) or SFTP. Security controls prohibit inbound SSH access or public IP address assignment to any EC2 instances. Which solution will meet these requirements while following AWS security best practices?

### Options
- **A.** Use an Amazon S3 bucket for file transfer. Configure the EC2 instances to download files from Amazon S3 on demand.
- **B.** Create an EC2 Instance Connect Endpoint. Use the EC2 Instance Connect Endpoint to establish a session for file transfer.
- **C.** Use AWS Systems Manager Session Manager with an instance profile and the local plugin.
- **D.** Use AWS Transfer Family with an SFTP endpoint connected to the private VPC for managed file transfers.

### Correct answer: C

**Summary:** SSH over Session Manager lets SCP and SFTP work with no inbound ports or public IPs; the SSM agent makes an outbound connection.

### Explanation
- A is wrong: downloading from S3 is not copying directly to the instances with SCP or SFTP.
- B is wrong: an EC2 Instance Connect Endpoint still needs the instances' security groups to allow inbound SSH from the endpoint, which the controls prohibit.
- C is correct: Session Manager, with the local plugin and an SSH ProxyCommand, carries SCP and SFTP through the agent's outbound connection, so no inbound port or public IP is needed.
- D is wrong: Transfer Family stores files in S3 or EFS, not directly on the EC2 instances.

**Key phrases:** secure copy protocol (SCP) or SFTP · prohibit inbound SSH access or public IP address
**Hint:** Which option needs no inbound port at all, yet can carry an SSH session for SCP?
