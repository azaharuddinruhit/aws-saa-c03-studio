# AWS SAA-C03 Practice Questions: Set Delta (108 questions)

---

## DELTA-001: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** easy · **Pillars:** Security, Operational Excellence
**Services:** Config › Rules & remediation, Security Hub

### Question
A company manages customer data workloads across multiple AWS accounts. The company requires all Amazon EC2 instances, Amazon RDS databases, and Amazon Redshift clusters to use encryption at rest. The company must monitor compliance across accounts while reducing management effort. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Use AWS Config managed rules to evaluate encryption configurations and report noncompliant resources automatically.
- **B.** Use AWS Security Hub CSPM with the AWS Foundational Security Best Practices standard. Review the security findings to identify noncompliant resources across accounts.
- **C.** Create scripts that call AWS APIs to check encryption status. Run the scripts periodically on an EC2 instance.
- **D.** Create scripts that call AWS APIs to check encryption status. Configure Amazon EventBridge to regularly invoke an AWS Lambda function that runs the scripts.

### Correct answer: A

**Summary:** Continuous compliance checks on resource settings (such as encryption at rest) = AWS Config managed rules, aggregated across accounts.

### Explanation
- A is correct: AWS Config managed rules such as encrypted-volumes, rds-storage-encrypted and redshift-cluster-configuration-check evaluate each resource as it changes and report noncompliant ones automatically; an aggregator or organization conformance pack covers every account.
- B is wrong: Security Hub CSPM findings would still have to be reviewed by people to pick out the encryption problems, and Security Hub itself relies on AWS Config to run its checks, so this adds a layer and a manual step.
- C is wrong: custom scripts on an EC2 instance must be written, kept up to date for every resource type and account, and patched and run on a server.
- D is wrong: EventBridge and Lambda remove the server, but the company still writes and maintains its own compliance scripts, which managed Config rules already provide.

**Key phrases:** encryption at rest · monitor compliance across accounts · LEAST operational overhead
**Hint:** One service continuously evaluates resource settings against rules and flags noncompliant resources by itself. Which option needs no scripts and no manual review?

---

## DELTA-002: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability, Performance Efficiency
**Services:** EC2 Auto Scaling, Elastic Load Balancing › ALB, Aurora › Replicas & failover

### Question
A software company needs to upgrade a critical web application. The application currently runs on a single Amazon EC2 instance that the company hosts in a public subnet. The EC2 instance runs a MySQL database. The application's DNS records are published in an Amazon Route 53 zone. A solutions architect must reconfigure the application to be scalable and highly available. The solutions architect must also reduce MySQL read latency. Which combination of solutions will meet these requirements? (Select TWO.)

### Options
- **A.** Launch a second EC2 instance in a second AWS Region. Use a Route 53 failover routing policy to redirect the traffic to the second EC2 instance.
- **B.** Create and configure an Auto Scaling group to launch private EC2 instances in multiple Availability Zones. Add the instances to a target group behind a new Application Load Balancer.
- **C.** Migrate the database to an Amazon Aurora MySQL cluster. Create the primary DB instance and reader DB instance in separate Availability Zones.
- **D.** Create and configure an Auto Scaling group to launch private EC2 instances in multiple AWS Regions. Add the instances to a target group behind a new Application Load Balancer.
- **E.** Migrate the database to an Amazon Aurora MySQL cluster with cross-Region read replicas.

### Correct answers: B, C (choose 2)

**Summary:** Scale the web tier with an ALB plus a Multi-AZ Auto Scaling group; move MySQL to Aurora with a reader in another AZ for reads and failover.

### Explanation
- A is wrong: a single standby instance in another Region gives failover but no scaling, and the database would still sit on one EC2 instance.
- B is correct: an Auto Scaling group across several Availability Zones behind an ALB scales the web tier and survives the loss of an AZ, and the instances can stay in private subnets.
- C is correct: Aurora MySQL with a reader in a second AZ takes read traffic off the writer, lowering read latency, and Aurora promotes the reader automatically if the writer fails.
- D is wrong: an Application Load Balancer and an Auto Scaling group are Regional; neither can span several Regions.
- E is wrong: cross-Region read replicas help readers in other Regions, but the application runs in one Region, so they do not lower its read latency and add replication cost.

**Key phrases:** single Amazon EC2 instance · scalable and highly available · reduce MySQL read latency · TWO
**Hint:** An Application Load Balancer and an Auto Scaling group work inside one Region across Availability Zones. Which database option adds a reader close to the app and a standby in another AZ?

---

## DELTA-003: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Operational Excellence
**Services:** DynamoDB › DAX, ElastiCache

### Question
A trucking company is deploying an application that will track the GPS coordinates of all the company's trucks. The company needs a solution that will generate real-time statistics based on metadata lookups with high read throughput and microsecond latency. The database must be fault tolerant and must minimize operational overhead and development effort. Which combination of steps should a solutions architect take to meet these requirements? (Select TWO.)

### Options
- **A.** Use Amazon DynamoDB as the database.
- **B.** Use Amazon Aurora MySQL as the database.
- **C.** Use Amazon RDS for MySQL as the database.
- **D.** Use Amazon ElastiCache as the caching layer.
- **E.** Use Amazon DynamoDB Accelerator (DAX) as the caching layer.

### Correct answers: A, E (choose 2)

**Summary:** Microsecond reads on DynamoDB with little code change = DynamoDB + DAX (a write-through cache that speaks the DynamoDB API).

### Explanation
- A is correct: DynamoDB is a serverless, Multi-AZ key-value database that handles high read throughput with no servers to manage.
- B is wrong: Aurora MySQL is a relational database with millisecond reads, and it still needs instance sizing and a cache to reach microseconds.
- C is wrong: RDS for MySQL has the same millisecond limit and more to manage than Aurora or DynamoDB.
- D is wrong: ElastiCache can reach microseconds, but the application must be written to read from and fill the cache itself, which adds development effort.
- E is correct: DAX is an in-memory cache for DynamoDB that uses the same API, so the application gets microsecond reads with almost no code changes, and a DAX cluster spreads nodes across Availability Zones.

**Key phrases:** high read throughput and microsecond latency · fault tolerant · minimize operational overhead and development effort · TWO
**Hint:** Microsecond reads point to an in-memory cache. Which cache plugs into one database with no changes to the application's caching logic?

---

## DELTA-004: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** medium · **Pillars:** Operational Excellence, Performance Efficiency
**Services:** EventBridge › Scheduler, Fargate, Lambda › Limits

### Question
A company is migrating a legacy application from an on-premises data center to AWS. The application relies on hundreds of cron jobs that run between 1 and 20 minutes on different recurring schedules throughout the day. The company wants a solution to schedule and run the cron jobs on AWS with minimal refactoring. The solution must support running the cron jobs in response to an event in the future. Which solution will meet these requirements?

### Options
- **A.** Create a container image for the cron jobs. Use Amazon EventBridge Scheduler to create a recurring schedule. Run the cron job tasks as AWS Lambda functions.
- **B.** Create a container image for the cron jobs. Use AWS Batch on Amazon ECS with a scheduling policy to run the cron jobs.
- **C.** Create a container image for the cron jobs. Use Amazon EventBridge Scheduler to create a recurring schedule. Run the cron job tasks on AWS Fargate.
- **D.** Create a container image for the cron jobs. Create a workflow in AWS Step Functions that uses a Wait state to run the cron jobs at a specified time. Use the RunTask action to run the cron job tasks on AWS Fargate.

### Correct answer: C

**Summary:** Cron jobs longer than 15 minutes: EventBridge Scheduler (recurring and one-time schedules) starting ECS tasks on Fargate.

### Explanation
- A is wrong: Lambda functions stop at 15 minutes, so the 20-minute cron jobs would fail.
- B is wrong: AWS Batch scheduling policies set fair-share priority between jobs in a queue; they do not run jobs on a time schedule.
- C is correct: EventBridge Scheduler supports cron and rate schedules as well as one-time schedules for a future date, and it can start ECS tasks on Fargate, which run the container images with no time limit and no servers.
- D is wrong: a Step Functions Wait state per job would need hundreds of workflows to recreate recurring cron schedules, which is far more work than a scheduler.

**Key phrases:** hundreds of cron jobs · between 1 and 20 minutes · minimal refactoring · in response to an event in the future
**Hint:** Some jobs run up to 20 minutes. Which compute has no 15-minute limit, and which scheduler handles both recurring and one-time future runs?

---

## DELTA-005: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security
**Services:** VPC › Subnets & routing, Elastic Load Balancing › ALB

### Question
A company operates a system that requires an internet-facing Application Load Balancer (ALB) to distribute traffic to an Auto Scaling group of Amazon EC2 instances. The EC2 instances access an Amazon RDS database. The company needs to ensure that only specific resources are reachable directly from the internet. Which VPC subnet design will meet these requirements?

### Options
- **A.** Place the ALB, EC2 instances, and RDS database in private subnets.
- **B.** Place the EC2 instances in public subnets. Place the ALB and RDS database in private subnets.
- **C.** Place the ALB and EC2 instances in public subnets. Place the RDS database in private subnets.
- **D.** Place the ALB in public subnets. Place the EC2 instances and RDS database in private subnets.

### Correct answer: D

**Summary:** Classic three-tier layout: internet-facing ALB in public subnets; app instances and database in private subnets.

### Explanation
- A is wrong: an internet-facing load balancer must sit in public subnets with a route to an internet gateway; in private subnets it cannot receive internet traffic.
- B is wrong: this reverses the design: an internet-facing ALB cannot work from private subnets, and the instances would be exposed.
- C is wrong: EC2 instances in public subnets can be given public IPs and become directly reachable, which the requirement rules out; the ALB already handles the internet traffic.
- D is correct: the ALB is the only internet-facing component, so it goes in public subnets, while the EC2 instances and the RDS database stay in private subnets and are reached only through the ALB and the app tier.

**Key phrases:** internet-facing Application Load Balancer · only specific resources are reachable directly from the internet
**Hint:** Only the component that receives internet traffic needs a route to an internet gateway. Which tier is that?

---

## DELTA-006: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Operational Excellence
**Services:** MQ, EKS

### Question
A company runs a container application on a Kubernetes cluster in the company's data center. The application uses Advanced Message Queuing Protocol (AMQP) to communicate with a message queue. The data center cannot scale fast enough to meet the company's expanding business needs. The company wants to migrate the workloads to AWS. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Migrate the container application to Amazon ECS. Use Amazon SQS to retrieve the messages.
- **B.** Use AWS Lambda functions to run the application. Use Amazon SQS to retrieve the messages.
- **C.** Use highly available Amazon EC2 instances to run the application. Use Amazon MQ to retrieve the messages.
- **D.** Migrate the container application to Amazon EKS. Use Amazon MQ to retrieve the messages.

### Correct answer: D

**Summary:** Kubernetes workloads → EKS; existing AMQP/MQTT/JMS messaging → Amazon MQ (SQS does not speak AMQP).

### Explanation
- A is wrong: moving from Kubernetes to ECS means rewriting the deployment definitions, and SQS does not support AMQP, so the messaging code would also change.
- B is wrong: Lambda would need the containerized application rewritten as functions, and SQS does not support AMQP.
- C is wrong: running the application directly on EC2 instances means building and running its own orchestration, which is the most overhead.
- D is correct: EKS runs the existing Kubernetes workloads with a managed control plane, and Amazon MQ is a managed broker (ActiveMQ or RabbitMQ) that speaks AMQP, so neither the app nor its messaging has to change.

**Key phrases:** Kubernetes cluster · Advanced Message Queuing Protocol (AMQP) · LEAST operational overhead
**Hint:** Match each existing technology to its managed AWS equivalent: one for Kubernetes and one for AMQP.

---

## DELTA-007: Databases & Caching
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Performance Efficiency
**Services:** RDS › Multi-AZ, RDS › Read replicas

### Question
A company hosts an application on Amazon EC2 instances behind a Network Load Balancer. The application requires a MySQL database. The database must automatically fail over to a standby instance without manual intervention. The company needs additional database capacity to support content indexing queries from a separate analytics team. Which solution will meet these requirements?

### Options
- **A.** Create an Amazon DynamoDB database table configured with global tables.
- **B.** Create an Amazon RDS database that uses Multi-AZ deployments.
- **C.** Create an Amazon RDS database that uses a Multi-AZ DB cluster deployment.
- **D.** Create an Amazon RDS database configured with cross-Region read replicas.

### Correct answer: C

**Summary:** RDS Multi-AZ DB cluster = writer plus two readable standbys in other AZs: automatic failover and extra read capacity in one deployment.

### Explanation
- A is wrong: DynamoDB is not MySQL, so the application would have to be rewritten.
- B is wrong: a Multi-AZ DB instance deployment has one standby that cannot serve reads, so it adds no capacity for the analytics team.
- C is correct: a Multi-AZ DB cluster has a writer and two readable standby instances in different AZs; it fails over automatically, and the analytics team can query the reader endpoint.
- D is wrong: cross-Region read replicas add read capacity but do not fail over automatically; promoting a replica is a manual step.

**Key phrases:** MySQL database · automatically fail over · without manual intervention · additional database capacity
**Hint:** Both Multi-AZ options fail over automatically. Which one also lets other clients read from its standbys?

---

## DELTA-008: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** EC2 › Reserved Instances & Savings Plans, SageMaker

### Question
A company uses multiple compute services including AWS Lambda, AWS Fargate, and Amazon EC2. The company uses persistent Amazon SageMaker AI instances. The company wants to have the flexibility to scale its compute services vertically or horizontally whenever required. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Purchase Standard Reserved Instances for the compute services. Purchase SageMaker AI Savings Plans for the SageMaker AI instances.
- **B.** Purchase EC2 Savings Plans for the compute services. Purchase SageMaker AI Savings Plans for the SageMaker AI instances.
- **C.** Purchase Convertible Reserved Instances for the compute services. Purchase Compute Savings Plans for the SageMaker AI instances.
- **D.** Purchase Compute Savings Plans for the compute services. Purchase SageMaker AI Savings Plans for the SageMaker AI instances.

### Correct answer: D

**Summary:** Compute Savings Plans cover EC2, Fargate and Lambda with any family/size/Region; SageMaker AI usage needs SageMaker AI Savings Plans.

### Explanation
- A is wrong: Reserved Instances apply only to EC2 (not Lambda or Fargate), and Standard RIs are tied to an instance family, which limits vertical scaling.
- B is wrong: EC2 Instance Savings Plans apply only to EC2 in one instance family and Region; they do not cover Lambda or Fargate.
- C is wrong: Convertible RIs still cover only EC2, and Compute Savings Plans do not apply to SageMaker AI instances.
- D is correct: Compute Savings Plans apply to EC2, Fargate and Lambda regardless of instance family, size or Region, so the company can scale any way it likes, and SageMaker AI Savings Plans discount the SageMaker AI instances.

**Key phrases:** AWS Lambda, AWS Fargate, and Amazon EC2 · scale its compute services vertically or horizontally · MOST cost-effectively
**Hint:** Only one commitment covers Lambda, Fargate and EC2 together and still lets you change instance family, size and Region. What covers SageMaker AI instances?

---

## DELTA-009: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Reliability, Performance Efficiency
**Services:** SNS › Fan-out, SQS, Lambda › Event sources

### Question
A development team is creating an event-based application that uses AWS Lambda functions. Events will be generated when files are added to an Amazon S3 bucket. The development team configures an Amazon SNS topic as the event target for the S3 bucket. Events must persist to support Lambda function scaling. The development team needs a scalable solution to process events from the S3 bucket. Which solution will meet this requirement?

### Options
- **A.** Create an SNS subscription that sends the events to Amazon ECS for processing before the Lambda functions process the events.
- **B.** Create an SNS subscription that sends the events to Amazon EKS for processing before the Lambda functions process the events.
- **C.** Create an SNS subscription that sends the events to an Amazon SQS queue. Configure the SQS queue to invoke the Lambda functions to process events.
- **D.** Create an SNS subscription that sends the events to Amazon EventBridge. Configure EventBridge rules to invoke the Lambda functions to process the events.

### Correct answer: C

**Summary:** SNS → SQS → Lambda: the queue holds events durably and Lambda polls it and scales with the backlog.

### Explanation
- A is wrong: Amazon ECS is not an SNS subscription target, and adding a container stage does not make the events persist.
- B is wrong: Amazon EKS is not an SNS subscription target either, and it adds a cluster to run for no benefit.
- C is correct: an SQS queue subscribed to the topic stores each event durably until it is processed, and the Lambda event source mapping polls the queue and scales the number of concurrent functions with the backlog.
- D is wrong: EventBridge is not a standard SNS subscription target, and it invokes Lambda asynchronously without a queue that keeps events for the functions to work through.

**Key phrases:** Events must persist · support Lambda function scaling · scalable solution
**Hint:** Events must survive until Lambda gets to them, and Lambda should scale with how many are waiting.

---

## DELTA-010: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** S3 › Lifecycle rules, S3 › Storage classes

### Question
A company hosts a photo sharing web application on AWS. Users upload and share thousands of photos each hour. The company needs a durable storage solution that provides retrieval mechanisms for the photos. Most uploaded photos are not accessed often after 30 days, but the company does not want to delete older photos. Which solution will meet these requirements in the MOST cost-effective way?

### Options
- **A.** Store the photos in an Amazon EFS file system for immediate use. Use AWS Backup with on-demand backups and point-in-time recovery (PITR) to store photos that are older than 30 days.
- **B.** Store the photos in an Amazon S3 bucket. Use Amazon S3 Lifecycle configurations to move photos that are older than 30 days to S3 Intelligent-Tiering.
- **C.** Store the photos in Amazon DynamoDB for immediate use. Use AWS Backup with on-demand backups and point-in-time recovery (PITR) to store photos that are older than 30 days.
- **D.** Store the photos in Amazon FSx for Lustre for immediate use. Use AWS Backup with continuous backups and point-in-time recovery (PITR) to store photos that are older than 30 days.

### Correct answer: B

**Summary:** Photos that cool after 30 days: store them in S3 and let a Lifecycle rule move them to a cheaper class (here Intelligent-Tiering).

### Explanation
- A is wrong: EFS costs far more per GB than S3, and AWS Backup is for recovery copies, not a way to serve old photos.
- B is correct: S3 is durable, cheap object storage, and a Lifecycle rule moves photos older than 30 days to S3 Intelligent-Tiering, which lowers cost when access drops while keeping the photos available.
- C is wrong: DynamoDB items are limited to 400 KB, so it is not built to store photos, and backups are not an access tier.
- D is wrong: FSx for Lustre is high-performance scratch or HPC storage and far too expensive for a photo archive.

**Key phrases:** durable storage solution · not accessed often after 30 days · does not want to delete older photos · MOST cost-effective
**Hint:** Photos are objects that are rarely read after 30 days but must stay retrievable. Which store and class lower cost without deleting anything?

---

## DELTA-011: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence
**Services:** S3 › Access control, IAM Identity Center

### Question
A company has thousands of developers who use Microsoft Active Directory for authentication and to manage permissions to Amazon S3 objects at scale. The company needs a solution that scales as the company grows without increasing operational overhead. The solution must give the company the ability to audit which users accessed which S3 objects. Which solution will meet these requirements?

### Options
- **A.** Use S3 Access Grants and AWS IAM Identity Center integrated with Active Directory users and groups.
- **B.** Create S3 access points that use access point policies and IAM roles for Active Directory users.
- **C.** Deploy a custom identity broker application that authenticates Active Directory users through AWS IAM Identity Center. Configure the identity broker application to use the AWS STS AssumeRole API call to provide scoped temporary credentials.
- **D.** Configure AWS IAM Identity Center permission sets with resource-level S3 permissions for each Active Directory user group.

### Correct answer: A

**Summary:** Directory users and groups → S3 data at scale with per-user auditing = S3 Access Grants with IAM Identity Center.

### Explanation
- A is correct: S3 Access Grants grant S3 prefixes, buckets or objects directly to Identity Center users and groups synced from Active Directory, scale without a new IAM policy per team, and CloudTrail records the end-user identity for each access.
- B is wrong: access points still need IAM roles mapped to directory users, and their policies have size limits that do not scale to thousands of developers.
- C is wrong: a custom identity broker is code the company must build and run, and calls made through shared assumed roles do not tie each access back to an individual user.
- D is wrong: permission sets map to IAM roles in each account, so per-group S3 resource permissions turn into many large policies, and object access is logged against the role rather than the user.

**Key phrases:** thousands of developers · Microsoft Active Directory · at scale · audit which users accessed which S3 objects
**Hint:** Which S3 feature maps directory users and groups straight to bucket or prefix permissions and records the end user in CloudTrail?

---

## DELTA-012: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence
**Services:** Fargate, ElastiCache, CloudFront, Elastic Load Balancing › ALB

### Question
A company recently migrated its web application to the AWS Cloud. The company uses an Amazon EC2 instance to run multiple processes to host the application. The processes include an Apache web server that serves static content. The Apache web server makes requests to a PHP application that uses a local Redis server for user sessions. The company wants to redesign the architecture to be highly available and to use AWS managed solutions. Which solution will meet these requirements?

### Options
- **A.** Use AWS Elastic Beanstalk to host the static content and the PHP application. Configure Elastic Beanstalk to deploy its EC2 instance into a public subnet. Assign a public IP address.
- **B.** Use AWS Lambda to host the static content and the PHP application. Use an Amazon API Gateway REST API to proxy requests to the Lambda function. Set the API Gateway CORS configuration to respond to the domain name. Configure Amazon ElastiCache (Redis OSS) to handle session information.
- **C.** Keep the backend code on the EC2 instance. Create an Amazon ElastiCache (Redis OSS) cluster that has Multi-AZ enabled. Configure the ElastiCache (Redis OSS) cluster in cluster mode. Copy the frontend resources to Amazon S3. Configure the backend code to reference the EC2 instance.
- **D.** Configure an Amazon CloudFront distribution with an Amazon S3 endpoint to an S3 bucket that is configured to host the static content. Configure an Application Load Balancer that targets an Amazon ECS service that runs AWS Fargate tasks for the PHP application. Configure the PHP application to use an Amazon ElastiCache (Redis OSS) cluster that runs in multiple Availability Zones.

### Correct answer: D

**Summary:** Break up a single web server: static content on S3 + CloudFront, the app on Fargate behind an ALB, and sessions in Multi-AZ ElastiCache.

### Explanation
- A is wrong: a single Elastic Beanstalk instance in a public subnet is still one point of failure, and the sessions would stay on that instance.
- B is wrong: Lambda does not serve static content well and the PHP application would need to be rewritten for Lambda; CORS settings have nothing to do with availability.
- C is wrong: the backend stays on a single EC2 instance, so the application is still not highly available.
- D is correct: S3 behind CloudFront serves the static content, an ALB spreads requests across Fargate tasks running the PHP application, and a Multi-AZ ElastiCache (Redis OSS) cluster keeps sessions outside the tasks, so every tier is managed and survives the loss of an AZ.

**Key phrases:** Apache web server that serves static content · local Redis server for user sessions · highly available · AWS managed solutions
**Hint:** Split the single instance into managed pieces: static files, the PHP tier, and the session store. Which option makes all three highly available?

---

## DELTA-013: Disaster Recovery & Migration
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** easy · **Pillars:** Reliability, Cost Optimization
**Services:** DR strategies › Backup & restore, RDS › Backups & PITR

### Question
An ecommerce company wants a disaster recovery solution for its Amazon RDS DB instances that run Microsoft SQL Server Enterprise Edition. The company's current recovery point objective (RPO) and recovery time objective (RTO) are 24 hours. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Create a cross-Region read replica and promote the read replica to the primary instance.
- **B.** Use AWS DMS to create RDS cross-Region replication.
- **C.** Use cross-Region replication every 24 hours to copy native backups to an Amazon S3 bucket.
- **D.** Copy automatic snapshots to another Region every 24 hours.

### Correct answer: D

**Summary:** A 24-hour RPO/RTO only needs backup and restore: copy RDS snapshots to another Region daily and restore when needed.

### Explanation
- A is wrong: a cross-Region read replica runs a second SQL Server Enterprise instance all the time, which is the most expensive option and far more than a 24-hour RPO/RTO needs.
- B is wrong: continuous DMS replication needs a replication instance and a target database running all the time, again far more than the requirement.
- C is wrong: native backups copied with S3 replication also work, but they need native backup jobs and restore steps to set up and manage, whereas snapshot copies are built in.
- D is correct: copying the automated snapshots to another Region each day meets a 24-hour RPO, a restore fits within 24 hours, and the company pays only for snapshot storage and transfer.

**Key phrases:** Microsoft SQL Server Enterprise Edition · 24 hours · MOST cost-effectively
**Hint:** An RPO and RTO of 24 hours allow the cheapest DR strategy. Which option copies backups without running a second database?

---

## DELTA-014: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Operational Excellence, Security
**Services:** Service Catalog

### Question
A company has multiple AWS accounts. The company needs a self-service solution to standardize infrastructure provisioning across accounts. The company's developers must be able to provision approved resources without writing infrastructure code or templates. The company's administrators must maintain governance and control access to specific configurations. Which solution will meet these requirements?

### Options
- **A.** Use AWS CloudFormation with AWS Organizations to distribute templates automatically across accounts.
- **B.** Use AWS CloudFormation StackSets to deploy templates. Configure IAM roles for cross-account access.
- **C.** Use AWS Organizations with service control policies (SCPs) to manage resource provisioning across accounts.
- **D.** Use AWS Service Catalog to create portfolios that contain approved products. Share portfolios across accounts.

### Correct answer: D

**Summary:** Self-service provisioning of approved resources without writing templates = AWS Service Catalog portfolios shared across accounts.

### Explanation
- A is wrong: CloudFormation still expects developers to work with templates, and Organizations does not distribute templates for self-service.
- B is wrong: StackSets push stacks that administrators deploy centrally; they are not a self-service catalog for developers.
- C is wrong: SCPs only restrict permissions; they give developers nothing to provision.
- D is correct: Service Catalog lets administrators publish approved CloudFormation-based products in portfolios with constraints, share them across accounts, and developers launch them from a catalog without writing any code.

**Key phrases:** self-service solution · without writing infrastructure code or templates · maintain governance
**Hint:** Developers must not write templates, while administrators decide what may be launched and with which settings.

---

## DELTA-015: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** S3 › Storage classes, RDS

### Question
A company is building an ecommerce application that uses a relational database to store customer data and order history. The company also needs a solution to store 100 GB of product images. The company expects the traffic flow for the application to be predictable. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Use Amazon RDS for MySQL for the database. Store the product images in an Amazon S3 bucket.
- **B.** Use Amazon DynamoDB for the database. Store the product images in an Amazon S3 bucket.
- **C.** Use Amazon RDS for MySQL for the database. Store the product images in an Amazon Aurora MySQL database.
- **D.** Create three Amazon EC2 instances. Install MongoDB software on the instances to use as the database. Store the product images in an Amazon RDS for MySQL database with a Multi-AZ deployment.

### Correct answer: A

**Summary:** Relational data → RDS; images and other files → S3. Never store large binaries in a database.

### Explanation
- A is correct: RDS for MySQL fits the relational customer and order data with steady traffic, and S3 is the cheapest durable store for 100 GB of images.
- B is wrong: DynamoDB is not a relational database, so the customer and order schema would have to be redesigned.
- C is wrong: storing images in Aurora costs far more per GB than S3 and slows the database.
- D is wrong: running MongoDB on three EC2 instances is not relational, adds management work, and storing images in a Multi-AZ RDS database is expensive.

**Key phrases:** relational database · 100 GB of product images · predictable · MOST cost-effectively
**Hint:** Relational data goes in a relational database; images are objects. Which option puts each in its cheapest fitting store?

---

## DELTA-016: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** Cost allocation tags, Cost Explorer

### Question
A company runs multiple applications across several accounts in an organization in AWS Organizations. The company wants to be able to identify which specific workloads are driving AWS costs. Which solution will meet these requirements?

### Options
- **A.** Tag the application resources. Enable cost allocation tags in the management account. Group costs by the tag dimension in AWS Cost Explorer.
- **B.** Group costs by the linked account dimension in AWS Cost Explorer.
- **C.** Create an AWS Cost and Usage Report. Query the Cost and Usage Report by using Amazon Athena. Group costs by the resource ID.
- **D.** Enable AWS Cost Anomaly Detection. Create a Linked Account type cost monitor.

### Correct answer: A

**Summary:** Costs per workload across accounts: tag resources, activate the tags as cost allocation tags in the management account, group by tag in Cost Explorer.

### Explanation
- A is correct: tagging resources by workload and activating those tags as cost allocation tags in the management account lets Cost Explorer group costs by workload across every account.
- B is wrong: grouping by linked account shows each account's total, but each account runs several applications, so workloads cannot be told apart.
- C is wrong: resource IDs show individual resources, not which workload they belong to, and building Athena queries is more work than grouping by a tag.
- D is wrong: Cost Anomaly Detection alerts on unusual spending; it does not attribute costs to workloads.

**Key phrases:** several accounts · identify which specific workloads are driving AWS costs
**Hint:** Accounts hold several applications each. What lets Cost Explorer split costs by workload rather than by account?

---

## DELTA-017: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Operational Excellence, Reliability
**Services:** Fargate, ECS

### Question
A company is migrating a microservices-based application to AWS. The application requires a container orchestration solution that provides high availability and automatic scaling. The company wants to reduce the operational overhead of managing the container infrastructure. Which solution will meet these requirements?

### Options
- **A.** Deploy containers on Amazon EC2 instances. Use custom scripts to handle orchestration and scaling.
- **B.** Use AWS Lambda functions to run microservices that are packaged as container images.
- **C.** Use Amazon EKS to run containers and manage the cluster configuration and associated infrastructure.
- **D.** Deploy containers on Amazon ECS with the AWS Fargate launch type.

### Correct answer: D

**Summary:** Container orchestration with the least infrastructure to manage = ECS on Fargate.

### Explanation
- A is wrong: custom scripts for orchestration and scaling on EC2 are the most work and the least reliable.
- B is wrong: Lambda limits run time and needs the microservices adapted to its event model, so it is not a general container orchestration platform.
- C is wrong: EKS where the company manages the cluster configuration and infrastructure itself means more operational overhead than ECS on Fargate.
- D is correct: ECS on Fargate is a managed orchestrator that runs tasks across Availability Zones, scales them with service auto scaling, and leaves no servers to patch or size.

**Key phrases:** container orchestration · high availability and automatic scaling · reduce the operational overhead
**Hint:** Which option gives container orchestration with no servers or cluster to manage?

---

## DELTA-018: Monitoring, Management & Governance
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Operational Excellence
**Services:** Systems Manager › Run Command, EFS

### Question
A company runs an application on Amazon EC2 instances in an Auto Scaling group. The EC2 instances use a shared Amazon EFS file system to access stored code and configuration data. New application updates are pushed to the EFS file system regularly. The company needs to apply each application update as the update becomes ready. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Configure the Auto Scaling group to tag the EC2 instances as the EC2 instances launch. Use an AWS Systems Manager Run Command to restart the application on the EC2 instances that have a specific tag.
- **B.** Create a new Amazon Machine Image (AMI) for each application update. Use instance refresh to update the EC2 instances in the Auto Scaling group from the new AMI.
- **C.** Package the application updates as patches. Schedule and apply the updates to the EC2 instances by using AWS Systems Manager Maintenance Window and Patch Manager.
- **D.** Create a new launch template that uses a new Amazon Machine Image (AMI) to reflect the application changes. Modify the Auto Scaling group to apply the new launch template and terminate the existing EC2 instances.

### Correct answer: A

**Summary:** Code on a shared EFS file system: no new AMIs needed. Restart the app on the tagged instances with Systems Manager Run Command.

### Explanation
- A is correct: the update is already on the shared EFS file system, so the instances only need to restart the application; Run Command can target every instance with the Auto Scaling group's tag at once.
- B is wrong: building a new AMI and running an instance refresh for each update replaces every instance, which is slow and unnecessary when the code lives on EFS.
- C is wrong: Patch Manager applies operating system patches in maintenance windows; it is not a way to deploy application releases as soon as they are ready.
- D is wrong: a new AMI and launch template for each update, then terminating instances, is the most work and causes disruption.

**Key phrases:** shared Amazon EFS file system · pushed to the EFS file system regularly · as the update becomes ready · LEAST operational overhead
**Hint:** The new code is already on the shared EFS file system. What is the least work needed for the running instances to pick it up?

---

## DELTA-019: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** easy · **Pillars:** Security, Cost Optimization
**Services:** VPC › Gateway endpoints

### Question
A company runs an application on Amazon EC2 instances in a private subnet. The application needs to store and retrieve data in Amazon S3 buckets. According to regulatory requirements, the data must not travel across the public internet. What should a solutions architect do to meet these requirements MOST cost-effectively?

### Options
- **A.** Deploy a NAT gateway to access the S3 buckets.
- **B.** Deploy AWS Storage Gateway to access the S3 buckets.
- **C.** Deploy an S3 interface endpoint to access the S3 buckets.
- **D.** Deploy an S3 gateway endpoint to access the S3 buckets.

### Correct answer: D

**Summary:** Private S3 access from inside a VPC at no extra cost = S3 gateway endpoint.

### Explanation
- A is wrong: a NAT gateway sends traffic to S3's public endpoints and charges per hour and per GB.
- B is wrong: Storage Gateway connects on-premises applications to AWS storage; it does not give EC2 instances a private path to S3.
- C is wrong: an S3 interface endpoint also keeps traffic private but charges per hour per AZ and per GB.
- D is correct: an S3 gateway endpoint adds a route that keeps the traffic on the AWS network and has no charge.

**Key phrases:** private subnet · must not travel across the public internet · MOST cost-effectively
**Hint:** Both endpoint types keep the traffic off the internet. Compare what each one costs.

---

## DELTA-020: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** easy · **Pillars:** Performance Efficiency
**Services:** EBS › Volume types

### Question
A company is building an application on Amazon EC2 instances. The application needs to handle a large number of transactions. The application requires an Amazon EBS data volume that has configurable and consistent input/output operations per second (IOPS). Which solution will meet these requirements?

### Options
- **A.** Provision EC2 instances with a Throughput Optimized HDD (st1) EBS root volume and a Cold HDD (sc1) EBS data volume.
- **B.** Provision EC2 instances with a Throughput Optimized HDD (st1) EBS volume that will serve as both a root volume and a data volume.
- **C.** Provision EC2 instances with a General Purpose SSD (gp3) EBS root volume and a Provisioned IOPS SSD (io2) EBS data volume.
- **D.** Provision EC2 instances with a General Purpose SSD (gp3) EBS root volume. Configure the application to store data in an Amazon S3 bucket.

### Correct answer: C

**Summary:** Transactional data needing set, consistent IOPS = Provisioned IOPS SSD (io2); gp3 is fine for the root volume.

### Explanation
- A is wrong: st1 and sc1 are throughput-oriented HDDs that cannot be boot volumes and give low IOPS.
- B is wrong: st1 cannot be a boot volume and is built for large sequential throughput, not transaction IOPS.
- C is correct: gp3 is a sound root volume, and io2 lets the company provision the IOPS it needs and delivers them consistently, which suits a transaction-heavy data volume.
- D is wrong: S3 is object storage, not an EBS data volume with set IOPS.

**Key phrases:** large number of transactions · configurable and consistent input/output operations per second (IOPS)
**Hint:** Which EBS volume type lets you set IOPS and is built for steady IOPS under heavy transaction load?

---

## DELTA-021: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security, Reliability
**Services:** Elastic Load Balancing › ALB, VPC › Subnets & routing

### Question
A solutions architect creates a VPC that includes two public subnets and two private subnets. A corporate security mandate requires the solutions architect to launch all Amazon EC2 instances in a private subnet. However, when the solutions architect launches an EC2 instance that runs a web server on ports 80 and 443 in a private subnet, no external internet traffic can connect to the server. What should the solutions architect do to resolve this issue?

### Options
- **A.** Attach the EC2 instance to an Auto Scaling group in a private subnet. Ensure that the DNS record for the website resolves to the Auto Scaling group identifier.
- **B.** Provision an internet-facing Application Load Balancer (ALB) in a public subnet. Add the EC2 instance to the target group that is associated with the ALB. Ensure that the DNS record for the website resolves to the ALB.
- **C.** Launch a NAT gateway in a private subnet. Update the route table for the private subnets to add a default route to the NAT gateway. Attach a public Elastic IP address to the NAT gateway.
- **D.** Ensure that the security group that is attached to the EC2 instance allows HTTP traffic on port 80 and HTTPS traffic on port 443. Ensure that the DNS record for the website resolves to the public IP address of the EC2 instance.

### Correct answer: B

**Summary:** Inbound web traffic to private instances: an internet-facing ALB in public subnets with the instances as targets.

### Explanation
- A is wrong: an Auto Scaling group has no address that DNS can resolve to, and the instances would still be unreachable from a private subnet.
- B is correct: an internet-facing ALB in a public subnet receives the internet traffic and forwards it to the private instance as a target, so the server stays in a private subnet.
- C is wrong: a NAT gateway only allows connections that the instances start, and it must sit in a public subnet; it never accepts inbound connections.
- D is wrong: an instance in a private subnet has no public IP address or internet route, so security group rules alone do not make it reachable.

**Key phrases:** launch all Amazon EC2 instances in a private subnet · no external internet traffic can connect to the server
**Hint:** A NAT gateway only lets private instances reach out. What lets internet users reach a web server in a private subnet?

---

## DELTA-022: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence
**Services:** Glue › ETL jobs, Redshift

### Question
A company has an Amazon S3 data lake. The company needs a solution that transforms the data from the data lake and loads the data into a data warehouse every day. The data warehouse must have massively parallel processing (MPP) capabilities. Data analysts then need to create and train machine learning (ML) models by using SQL commands on the data. The solution must use serverless AWS services wherever possible. Which solution will meet these requirements?

### Options
- **A.** Run a daily Amazon EMR job to transform the data and load the data into Amazon Redshift. Use Amazon Redshift ML to create and train the ML models.
- **B.** Run a daily Amazon EMR job to transform the data and load the data into Amazon Aurora Serverless. Use Amazon Aurora ML to create and train the ML models.
- **C.** Run a daily AWS Glue job to transform the data and load the data into Amazon Redshift Serverless. Use Amazon Redshift ML to create and train the ML models.
- **D.** Run a daily AWS Glue job to transform the data and load the data into Amazon Athena tables. Use Amazon Athena ML to create and train the ML models.

### Correct answer: C

**Summary:** Serverless ETL into a serverless MPP warehouse with SQL-based ML = Glue → Redshift Serverless → Redshift ML.

### Explanation
- A is wrong: Redshift and Redshift ML fit, but EMR clusters are not serverless, so the solution does not use serverless services wherever possible.
- B is wrong: Aurora Serverless is a relational database, not an MPP data warehouse, and Aurora ML calls models that already exist; it does not create and train them with SQL.
- C is correct: Glue runs serverless ETL jobs, Redshift Serverless is a serverless MPP data warehouse, and Redshift ML creates and trains models with CREATE MODEL SQL statements.
- D is wrong: Athena queries data in place and is not a data warehouse that data is loaded into, and there is no Athena ML feature for training models.

**Key phrases:** massively parallel processing (MPP) · machine learning (ML) models by using SQL commands · serverless AWS services wherever possible
**Hint:** Which warehouse is MPP and has a serverless option, and which ETL service is serverless? Then which one trains models with SQL?

---

## DELTA-023: Analytics & Data Processing
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization, Reliability
**Services:** EMR, EC2 › Spot Instances

### Question
A company has a large data workload that runs for 6 hours each day. The company cannot lose any data while the process is running. A solutions architect is designing an Amazon EMR cluster configuration to support this critical data workload. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Configure a long-running cluster that runs the primary node and core nodes on On-Demand Instances and the task nodes on Spot Instances.
- **B.** Configure a transient cluster that runs the primary node and core nodes on On-Demand Instances and the task nodes on Spot Instances.
- **C.** Configure a transient cluster that runs the primary node on an On-Demand Instance and the core nodes and task nodes on Spot Instances.
- **D.** Configure a long-running cluster that runs the primary node on an On-Demand Instance, the core nodes on Spot Instances, and the task nodes on Spot Instances.

### Correct answer: B

**Summary:** EMR: primary and core nodes On-Demand (they hold state and data), task nodes on Spot; use a transient cluster for a job of a few hours a day.

### Explanation
- A is wrong: the node layout is safe, but a long-running cluster pays for 18 idle hours every day.
- B is correct: a transient cluster runs only for the 6-hour job, On-Demand primary and core nodes protect the cluster and its HDFS data, and Spot task nodes add cheap capacity that can be interrupted without losing data.
- C is wrong: core nodes store HDFS data, so running them on Spot risks losing data when instances are reclaimed.
- D is wrong: Spot core nodes risk data loss, and a long-running cluster pays for idle time.

**Key phrases:** 6 hours each day · cannot lose any data · MOST cost-effectively
**Hint:** Core nodes store HDFS data; task nodes only compute. Which nodes can be interrupted safely, and does the cluster need to run all day?

---

## DELTA-024: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency
**Services:** DynamoDB › Capacity modes

### Question
A startup company has a social media application that produces large volumes of incoming write requests on the company's Amazon DynamoDB tables. The company wants to respond to unpredictable surges in table usage in the shortest possible time. Which solution will meet these requirements?

### Options
- **A.** Use DynamoDB with provisioned capacity mode.
- **B.** Use DynamoDB auto scaling.
- **C.** Use DynamoDB with DynamoDB Accelerator (DAX).
- **D.** Use DynamoDB on-demand capacity mode.

### Correct answer: D

**Summary:** Unpredictable, spiky DynamoDB traffic = on-demand capacity mode; it serves surges without capacity planning.

### Explanation
- A is wrong: provisioned capacity without scaling throttles requests once a surge goes above the set capacity.
- B is wrong: auto scaling adjusts provisioned capacity over minutes using CloudWatch alarms, so sudden surges are throttled before it catches up.
- C is wrong: DAX caches reads; it does nothing for a surge in write requests.
- D is correct: on-demand mode serves requests as they arrive and adapts to the traffic level at once, so surges are handled without capacity planning or scaling delays.

**Key phrases:** large volumes of incoming write requests · unpredictable surges · shortest possible time
**Hint:** The surges cannot be predicted, and any scaling that reacts after the fact leaves a gap.

---

## DELTA-025: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Reliability
**Services:** RDS › Read replicas, RDS › Multi-AZ

### Question
A company has a critical ecommerce application that uses an Amazon RDS for MySQL DB instance with a Multi-AZ deployment. The company's analytics team has increased the number of queries it uses to generate reports. The increase in usage has resulted in application performance degradation. The analytics team requires near real-time data consistency in its reports. The analytics team must be able to generate reports even if the DB instance is offline. Which solution will meet these requirements?

### Options
- **A.** Take a snapshot and restore the snapshot as a separate DB instance to run the queries.
- **B.** Modify the DB instance to use a larger instance size.
- **C.** Direct the queries to the standby DB instance endpoint.
- **D.** Add a read replica. Direct the queries to the read replica endpoint.

### Correct answer: D

**Summary:** Move reporting off the primary with an RDS read replica: near real-time asynchronous copy, separate endpoint, survives a primary outage.

### Explanation
- A is wrong: a restored snapshot is only as current as the snapshot, so the reports would not be near real-time.
- B is wrong: a larger instance still serves both workloads from one database and does not help when that instance is offline.
- C is wrong: the standby of a Multi-AZ DB instance deployment cannot be read; it exists only for failover.
- D is correct: a read replica is updated asynchronously within seconds, takes the report queries off the primary, and is a separate instance the analysts can still query if the primary is offline.

**Key phrases:** Multi-AZ deployment · near real-time data consistency · even if the DB instance is offline
**Hint:** The Multi-AZ standby cannot serve queries. Which option gives the analysts a separate, near real-time copy they can read?

---

## DELTA-026: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** medium · **Pillars:** Performance Efficiency, Operational Excellence
**Services:** Aurora › Replicas & failover, RDS › Read replicas

### Question
A company uses an Amazon RDS for MySQL database and read replicas to host video catalog data. Mobile applications query the read replicas to access the video catalog data. The RDS for MySQL database uses stored procedures for catalog and licensing logic. During peak hours, mobile application users experience delayed video catalog updates because of replica synchronization lag. The company needs to eliminate synchronization delays and preserve stored procedure compatibility. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Migrate the database to Amazon Aurora MySQL. Replace the read replicas with Aurora Replicas. Configure Aurora Auto Scaling. Maintain the stored procedures in Aurora MySQL.
- **B.** Deploy an Amazon ElastiCache (Redis OSS) cluster in front of the database. Modify the mobile applications to query the cache before accessing the database. Replace the stored procedures with AWS Lambda functions.
- **C.** Migrate the database to a MySQL database that runs on Amazon EC2 instances. Use compute optimized EC2 instances for all replica nodes. Maintain the stored procedures on the EC2 instances.
- **D.** Migrate the database to Amazon DynamoDB. Provision read capacity units to support the required throughput. Configure on-demand capacity scaling. Replace the stored procedures with DynamoDB streams and AWS Lambda functions.

### Correct answer: A

**Summary:** Replica lag on RDS MySQL: move to Aurora MySQL, whose replicas share the cluster storage (lag usually well under a second) and keep MySQL features.

### Explanation
- A is correct: Aurora Replicas read the same shared cluster volume as the writer instead of replaying a binary log, so replica lag is typically far below a second; Aurora MySQL runs the existing stored procedures, and Aurora Auto Scaling adds replicas at peak.
- B is wrong: a cache in front of the database adds its own staleness, and rewriting the stored procedures as Lambda functions and changing the mobile apps is a lot of work.
- C is wrong: self-managed MySQL on EC2 still uses binary log replication with the same lag, and adds patching and failover work.
- D is wrong: DynamoDB has no stored procedures, so the catalog and licensing logic would have to be rebuilt, which is the opposite of preserving compatibility.

**Key phrases:** replica synchronization lag · eliminate synchronization delays · preserve stored procedure compatibility · LEAST operational overhead
**Hint:** RDS MySQL replicas replay the binary log, so they can fall behind. Which MySQL-compatible engine has replicas that read the same storage as the writer?

---

## DELTA-027: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Cost Optimization
**Services:** Elastic Load Balancing › ALB, EKS

### Question
A company runs an application by using microservices on Amazon EKS. The application processes HTTP API requests that must be distributed to specific services based on the request path. The company requires a solution that minimizes operational overhead and infrastructure costs. Which solution will meet these requirements?

### Options
- **A.** Use the AWS Load Balancer Controller to provision a Network Load Balancer.
- **B.** Use the AWS Load Balancer Controller to provision an Application Load Balancer.
- **C.** Use an AWS Lambda function to route the requests to Amazon EKS.
- **D.** Use Amazon API Gateway to route the requests to Amazon EKS.

### Correct answer: B

**Summary:** Path-based routing to EKS services = AWS Load Balancer Controller provisioning an ALB from Kubernetes Ingress resources.

### Explanation
- A is wrong: a Network Load Balancer works at layer 4 and cannot route by HTTP request path.
- B is correct: the AWS Load Balancer Controller creates an ALB from Kubernetes Ingress resources, and the ALB routes each request to the right service by its path, with no extra components to run.
- C is wrong: a Lambda function as a router is custom code that adds latency, cost and maintenance.
- D is wrong: API Gateway in front of EKS also needs a VPC link and a load balancer, so it adds cost and parts when an ALB alone can route by path.

**Key phrases:** based on the request path · minimizes operational overhead and infrastructure costs
**Hint:** Routing on the URL path is a layer 7 feature. Which load balancer does it, and how does EKS create one for you?

---

## DELTA-028: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** easy · **Pillars:** Operational Excellence, Performance Efficiency
**Services:** Kinesis Data Streams, Lambda › Event sources, DynamoDB

### Question
A company is building an application that needs to process real-time streaming data. The application must process and transform the data and then store the data for later analysis. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Use Amazon Kinesis Data Streams to ingest streaming data. Configure Amazon EC2 instances to process and transform data records from the data streams. Configure the EC2 instances to store the processed and transformed data in an Amazon RDS for MySQL database.
- **B.** Send streaming data to an Amazon SQS queue. Configure AWS Lambda functions to process the data in the SQS queue. Store the processed data in an Amazon DynamoDB table.
- **C.** Use Amazon Kinesis Data Streams to ingest streaming data. Configure an AWS Lambda function to process and transform data records from the data streams. Configure the Lambda function to store the processed and transformed data in an Amazon DynamoDB table.
- **D.** Send streaming data to an Amazon SNS topic. Create an application to process the data on an Amazon EC2 instance. Store the processed data in an Amazon ElastiCache (Memcached) cache.

### Correct answer: C

**Summary:** Serverless streaming pipeline: Kinesis Data Streams → Lambda (event source mapping) → DynamoDB.

### Explanation
- A is wrong: EC2 instances for processing and an RDS database add servers to scale and patch.
- B is wrong: SQS is a message queue rather than a streaming service: it does not keep records in order for several consumers or allow replay, and this option has no real stream to ingest from.
- C is correct: Kinesis Data Streams ingests the stream, a Lambda event source mapping reads batches from the shards and transforms them, and DynamoDB stores the results, all with no servers to manage.
- D is wrong: an application on EC2 needs to be built and run, and Memcached is an in-memory cache with no durability, so it cannot store data for later analysis.

**Key phrases:** real-time streaming data · process and transform · LEAST operational overhead
**Hint:** Which options are all serverless, and which one ingests streaming data in order?

---

## DELTA-029: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization
**Services:** S3 › Lifecycle rules, S3 › Glacier & retrieval

### Question
A company is aggregating VPC flow logs and AWS CloudTrail logs from all its AWS accounts into one Amazon S3 bucket. All logs must be highly available for 30 days, retained for an additional 60 days for backup purposes, and deleted 90 days after creation. Each of these storage lifecycle requirements must be optimized for cost-efficiency. Which solution will meet these requirements?

### Options
- **A.** Transition objects to the S3 Standard storage class 30 days after creation. Create an expiration action that directs Amazon S3 to delete objects after 90 days.
- **B.** Transition objects to the S3 Glacier Deep Archive storage class 30 days after creation. Move all objects to the S3 Glacier Flexible Retrieval storage class after 90 days. Create an expiration action that directs Amazon S3 to delete objects after 90 days.
- **C.** Transition objects to the S3 Glacier Flexible Retrieval storage class 30 days after creation. Create an expiration action that directs Amazon S3 to delete objects after 90 days.
- **D.** Transition objects to the S3 One Zone-Infrequent Access (S3 One Zone-IA) storage class 30 days after creation. Move all objects to the S3 Glacier Flexible Retrieval storage class after 90 days. Create an expiration action that directs Amazon S3 to delete objects after 90 days.

### Correct answer: C

**Summary:** Hot for 30 days, backup until 90, then delete: Lifecycle rule to Glacier Flexible Retrieval at day 30 and expiration at day 90.

### Explanation
- A is wrong: objects already start in S3 Standard, so this transition does nothing and keeps paying the Standard rate for the backup period.
- B is wrong: objects cannot be moved from Deep Archive back to Glacier Flexible Retrieval, a move at day 90 conflicts with deleting at day 90, and Deep Archive bills a 180-day minimum.
- C is correct: S3 Standard serves the logs during the first 30 days, Glacier Flexible Retrieval stores the backup period at a low rate (even with its 90-day minimum charge, it costs less than keeping them in a warmer class), and expiration deletes them at day 90.
- D is wrong: S3 One Zone-IA costs more than Glacier for backup data, and moving objects at day 90 conflicts with deleting them at day 90.

**Key phrases:** highly available for 30 days · additional 60 days for backup purposes · deleted 90 days after creation · cost-efficiency
**Hint:** The logs need fast access only for 30 days, then they are just a backup until day 90. Which rule moves them once to an archive class and deletes them at day 90?

---

## DELTA-030: Databases & Caching
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** easy · **Pillars:** Security, Operational Excellence
**Services:** DynamoDB › TTL

### Question
A company is creating a mobile financial app that gives users the ability to sign up and store personal information. The app uses an Amazon DynamoDB table to store user details and preferences. The app generates a credit score report by using the data that is stored in DynamoDB. The app sends credit score reports to users once every month. The company needs to provide users with an option to remove their data and preferences. The app must delete customer data within one month of receiving a request to delete the data. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create an AWS Lambda function to delete user information. Create an Amazon EventBridge rule that runs when a specified TTL expires. Configure the EventBridge rule to invoke the Lambda function.
- **B.** Create a DynamoDB stream. Create an AWS Lambda function to delete user information. When a specified TTL expires, write user information to the DynamoDB stream from the DynamoDB table. Configure the DynamoDB stream to invoke the Lambda function to delete user information.
- **C.** Enable TTL in DynamoDB. Set the expiration date as an attribute. Create an AWS Lambda function to set the TTL based on the expiration date value. Invoke the Lambda function when a user requests to delete personal data.
- **D.** Enable TTL in DynamoDB. Create an AWS Lambda function to delete user information. Configure AWS Config to detect the DynamoDB stage change when TTL expires and to invoke the Lambda function.

### Correct answer: C

**Summary:** Delete user data on request with no extra infrastructure: set a TTL attribute on the items; DynamoDB deletes them after the expiry time.

### Explanation
- A is wrong: EventBridge has no event for an item's TTL expiring, so this rule would never fire.
- B is wrong: applications cannot write records to a DynamoDB stream; the stream only records changes the table makes, and the Lambda function would be deleting items TTL already deletes.
- C is correct: once TTL is enabled, a Lambda function sets each requesting user's expiry attribute, and DynamoDB then deletes the expired items itself (usually within a few days), well inside the one-month limit and with no deletion code to run.
- D is wrong: AWS Config records resource configuration, not individual item changes, so it cannot detect TTL expiry, and the deletion Lambda function would be redundant.

**Key phrases:** remove their data and preferences · within one month · LEAST operational overhead
**Hint:** DynamoDB can delete items by itself at no cost once a timestamp passes. What sets that timestamp when a user asks to be deleted?

---

## DELTA-031: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence
**Services:** Cognito › User pools, CloudTrail, EventBridge

### Question
A company is designing a stock trading application that provides trading insights to customers. The company needs a solution to revoke access for inactive users who have not logged in to the application for over 180 days. Which solution will meet this requirement?

### Options
- **A.** Use an OpenID Connect (OIDC) provider to authenticate users. Store user login metadata in Amazon RDS. Create an AWS Glue DataBrew job that checks a user's last login time and disables the user record if the last login date is more than 180 days in the past.
- **B.** Use Amazon Cognito to authenticate users. Store user login date and time from AWS CloudTrail events in Amazon DynamoDB. Schedule an Amazon EventBridge event to invoke an AWS Lambda function every day to deactivate users whose last login date is more than 180 days in the past.
- **C.** Use Amazon Cognito to authenticate users. Store user login metadata in Amazon DocumentDB. Define a TTL of 180 days for the sign-in time attribute. Configure an AWS Glue crawler to check users who have an expired TTL for login date and to invoke an AWS Lambda function to deactivate the users.
- **D.** Use a Kerberos-based identity provider (IdP) to authenticate users. Store user login metadata in an encrypted Amazon S3 bucket. Configure an AWS Glue crawler to catalog the user login metadata. Use Amazon Athena to query the data catalog for last login details. Delete data that is older than 180 days.

### Correct answer: B

**Summary:** Deactivate inactive users: record sign-ins (Cognito + CloudTrail events in DynamoDB) and run a daily scheduled Lambda that disables users idle for 180 days.

### Explanation
- A is wrong: Glue DataBrew is a visual data-preparation tool; it cannot disable users in an identity provider.
- B is correct: Cognito handles sign-in, CloudTrail records the authentication events whose times are stored in DynamoDB, and a daily EventBridge schedule invokes a Lambda function that disables users whose last sign-in is more than 180 days ago.
- C is wrong: DocumentDB TTL simply deletes the documents, and a Glue crawler catalogs schemas; it cannot spot expired records or invoke Lambda.
- D is wrong: querying with Athena and deleting old data only removes records; nothing revokes the users' access.

**Key phrases:** revoke access for inactive users · over 180 days
**Hint:** You need a record of each user's last sign-in and a daily job that acts on it. Which option has a working source for login times and a working schedule?

---

## DELTA-032: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization, Performance Efficiency
**Services:** Storage Gateway › Volume Gateway

### Question
An ecommerce company uses an on-premises Oracle database with iSCSI block storage to process online transactions. The company wants to migrate storage to AWS to eliminate SAN hardware refresh costs. Current transaction data must remain locally accessible with low latency. Historical order data must automatically move to cloud storage while maintaining the iSCSI interface. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create a scheduled cron job to copy historical transaction records to Amazon S3 by using the AWS CLI.
- **B.** Deploy a Volume Gateway in cached volume mode. Map iSCSI volumes to the database servers.
- **C.** Deploy an Amazon S3 File Gateway and move historical data to Amazon S3.
- **D.** Deploy a Volume Gateway in stored volume mode. Map iSCSI volumes to the database servers.

### Correct answer: B

**Summary:** iSCSI with most data in AWS and hot data cached locally = Volume Gateway cached volumes (stored volumes keep everything on premises).

### Explanation
- A is wrong: copying records with a cron job changes nothing about the SAN, and the database would lose its iSCSI access to the copied data.
- B is correct: cached volumes store the full volume in S3 and keep only frequently accessed data in a local cache, so the SAN can be retired while current transactions stay fast over iSCSI.
- C is wrong: S3 File Gateway presents NFS or SMB file shares, not iSCSI block volumes for a database.
- D is wrong: stored volumes keep the entire data set on premises and only send snapshots to AWS, so the company would still need local SAN capacity.

**Key phrases:** iSCSI block storage · eliminate SAN hardware refresh costs · locally accessible with low latency · maintaining the iSCSI interface
**Hint:** Both Volume Gateway modes present iSCSI. Which one keeps the full data set in S3 and only recent data on premises?

---

## DELTA-033: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security
**Services:** IAM › Roles

### Question
A company uses AWS Lambda functions in AWS account A. The company manages an Amazon S3 bucket in AWS account B. The Lambda function in account A needs to read objects from the S3 bucket in account B. A solutions architect needs to design a secure solution for cross-account access and maintain the principle of least privilege. Which solution will meet these requirements?

### Options
- **A.** Create an IAM role in account B that has the necessary S3 permissions and a trust relationship with account A. Configure the Lambda function to assume this IAM role.
- **B.** Create an IAM role in account A that has the necessary S3 permissions and a trust relationship with account B. Create an IAM user in account B that has permission to assume this IAM role. Configure the Lambda function to use this IAM user.
- **C.** Create an IAM user in account B that has the necessary S3 permissions and a trust relationship with account A. Create an IAM user in account A that has permission to assume the account B user. Configure the Lambda function to use the account A user.
- **D.** Create an IAM role in account B that has the necessary S3 permissions and a trust relationship with account A. Create an IAM user in account A that has permission to assume this IAM role. Configure the Lambda function to use this IAM user.

### Correct answer: A

**Summary:** Cross-account access: create a role in the resource account that trusts the other account, and have the Lambda function's execution role assume it.

### Explanation
- A is correct: a role in account B with only the needed S3 permissions and a trust policy for account A lets the Lambda function's execution role assume it and get temporary credentials, with no long-term keys.
- B is wrong: the role is in the wrong account, and an IAM user means long-term access keys stored with the function.
- C is wrong: IAM users cannot be assumed and do not have trust relationships, and long-term keys break least privilege.
- D is wrong: the role in account B is right, but Lambda should use its execution role to assume it, not an IAM user's long-term access keys.

**Key phrases:** cross-account access · principle of least privilege
**Hint:** Lambda functions use roles, never IAM users. Which account should own the role that reads the bucket?

---

## DELTA-034: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** Storage Gateway › File Gateway, S3 › Glacier & retrieval

### Question
A company wants to use Amazon S3 to back up its on-premises file storage solution. The company's on-premises file storage solution supports NFS, and the company wants its new solution to support NFS. The company wants to archive the backup files after 5 days. If the company needs archived files for disaster recovery, the company is willing to wait a few days for the retrieval of those files. Which solution meets these requirements MOST cost-effectively?

### Options
- **A.** Deploy an AWS Storage Gateway file gateway that is associated with an S3 bucket. Move the files from the on-premises file storage solution to the file gateway. Create an S3 Lifecycle rule to move the files to S3 Standard-Infrequent Access (S3 Standard-IA) after 5 days.
- **B.** Deploy an AWS Storage Gateway volume gateway that is associated with an S3 bucket. Move the files from the on-premises file storage solution to the volume gateway. Create an S3 Lifecycle rule to move the files to S3 Glacier Deep Archive after 5 days.
- **C.** Deploy an AWS Storage Gateway tape gateway that is associated with an S3 bucket. Move the files from the on-premises file storage solution to the tape gateway. Create an S3 Lifecycle rule to move the files to S3 Standard-Infrequent Access (S3 Standard-IA) after 5 days.
- **D.** Deploy an AWS Storage Gateway file gateway that is associated with an S3 bucket. Move the files from the on-premises file storage solution to the file gateway. Create an S3 Lifecycle rule to move the files to S3 Glacier Deep Archive after 5 days.

### Correct answer: D

**Summary:** NFS backups to S3 with archive after 5 days and retrieval within days = S3 File Gateway + Lifecycle rule to Glacier Deep Archive.

### Explanation
- A is wrong: Standard-Infrequent Access costs far more than an archive class, and the company is willing to wait days, so it does not need instant retrieval.
- B is wrong: Volume Gateway presents iSCSI block volumes, not NFS, and its data is not stored as objects that a Lifecycle rule could move.
- C is wrong: Tape Gateway presents a virtual tape library for backup software, not an NFS share.
- D is correct: S3 File Gateway exposes an NFS share that stores files as S3 objects, and a Lifecycle rule moves them to Glacier Deep Archive, the cheapest class, whose retrieval within 12 to 48 hours fits a wait of a few days.

**Key phrases:** supports NFS · archive the backup files after 5 days · wait a few days · MOST cost-effectively
**Hint:** NFS points to one gateway type. A wait of a few days for retrieval points to the cheapest archive class.

---

## DELTA-035: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security
**Services:** VPC › Security groups, VPC › Network ACLs

### Question
A company is deploying a new application to a VPC on existing Amazon EC2 instances. The application has a presentation tier that uses an Auto Scaling group of EC2 instances. The application also has a database tier that uses an Amazon RDS Multi-AZ database. The VPC has two public subnets that are split between two Availability Zones. A solutions architect adds one private subnet to each Availability Zone for the RDS database. The solutions architect wants to restrict network access to the RDS database to block access from EC2 instances that do not host the new application. Which solution will meet this requirement?

### Options
- **A.** Modify the RDS database security group to allow traffic from a CIDR range that includes IP addresses of the EC2 instances that host the new application.
- **B.** Associate a new ACL with the private subnets. Deny all incoming traffic from IP addresses that belong to any EC2 instance that does not host the new application.
- **C.** Modify the RDS database security group to allow traffic from the security group that is associated with the EC2 instances that host the new application.
- **D.** Associate a new ACL with the private subnets. Deny all incoming traffic except for traffic from a CIDR range that includes IP addresses of the EC2 instances that host the new application.

### Correct answer: C

**Summary:** Allow only one app tier into the database: reference the app tier's security group in the database security group's inbound rule.

### Explanation
- A is wrong: Auto Scaling instances get changing IP addresses, and a CIDR range would also include other instances in the same subnets.
- B is wrong: network ACLs work on IP ranges at the subnet level and cannot track instances that come and go, so the deny list would always be out of date.
- C is correct: referencing the application's security group as the source allows exactly the instances that carry that group, whatever their IP addresses, and blocks every other instance.
- D is wrong: a subnet-level CIDR allow list cannot single out the application's instances among others in the same range.

**Key phrases:** Auto Scaling group · block access from EC2 instances that do not host the new application
**Hint:** Auto Scaling keeps changing the instances' IP addresses. What can a security group rule reference instead of an IP range?

---

## DELTA-036: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security, Cost Optimization
**Services:** Organizations › SCPs, Cost allocation tags

### Question
A company is running its production and nonproduction environment workloads in multiple AWS accounts. The accounts are in an organization in AWS Organizations. The company needs to design a solution that will prevent the modification of cost usage tags. Which solution will meet these requirements?

### Options
- **A.** Create a custom AWS Config rule to prevent tag modification except by authorized principals.
- **B.** Create a custom trail in AWS CloudTrail to prevent tag modification.
- **C.** Create a service control policy (SCP) to prevent tag modification except by authorized principals.
- **D.** Create custom Amazon CloudWatch logs to prevent tag modification.

### Correct answer: C

**Summary:** Prevent an action across an organization (like changing tags) = an SCP that denies it except for approved principals.

### Explanation
- A is wrong: AWS Config rules detect and report changes after they happen; they do not prevent them.
- B is wrong: CloudTrail records API calls for auditing; it cannot block them.
- C is correct: an SCP that denies the tagging and untagging actions unless the caller is an authorized principal stops every other identity in the member accounts from changing the tags.
- D is wrong: CloudWatch Logs stores log data; it cannot prevent anything.

**Key phrases:** multiple AWS accounts · prevent the modification of cost usage tags
**Hint:** Only one option actually prevents an action across many accounts rather than detecting or logging it.

---

## DELTA-037: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Operational Excellence
**Services:** Systems Manager › State Manager

### Question
A company runs Amazon EC2 instances in a production environment. All instances must maintain the most recent AWS Systems Manager Agent (SSM Agent) version and have the Amazon CloudWatch agent installed. Some instances have outdated configurations. Which solution will automatically detect and remediate configuration drift?

### Options
- **A.** Use AWS Systems Manager Run Command to install the SSM Agent and CloudWatch agent on all instances.
- **B.** Create an AWS Systems Manager State Manager association to apply the required configuration to all instances.
- **C.** Use an AWS Systems Manager Automation runbook to configure the agents on all instances.
- **D.** Configure an Amazon EventBridge rule to invoke an AWS Lambda function when instance configurations change.

### Correct answer: B

**Summary:** Keep instances in a defined configuration and fix drift automatically = Systems Manager State Manager associations.

### Explanation
- A is wrong: Run Command runs a command once; instances that drift later are not corrected.
- B is correct: a State Manager association applies the required configuration (such as updating the SSM Agent and installing the CloudWatch agent) on a schedule and to new instances, so drift is detected and fixed automatically.
- C is wrong: an Automation runbook run on its own also acts only once and does not keep enforcing the state.
- D is wrong: a custom Lambda function triggered by events has to be written and maintained, and it misses drift that no event reports.

**Key phrases:** most recent AWS Systems Manager Agent (SSM Agent) version · automatically detect and remediate configuration drift
**Hint:** Running a fix once does not stop the configuration drifting again later.

---

## DELTA-038: Storage & Backup
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Security
**Services:** FSx › Windows File Server, Backup › Vault Lock, Backup › Cross-account & cross-Region copy

### Question
A company wants to use Amazon FSx for Windows File Server for its Amazon EC2 instances that have an SMB file share mounted as a volume in the us-east-1 Region. The company has a recovery point objective (RPO) of 5 minutes for planned system maintenance or unplanned service disruptions. The company needs to replicate the file system to the us-west-2 Region. The replicated data must not be deleted by any user for 5 years. Which solution will meet these requirements?

### Options
- **A.** Create an FSx for Windows File Server file system in us-east-1 that has a Single-AZ 2 deployment type. Use AWS Backup to create a daily backup plan that includes a backup rule that copies the backup to us-west-2. Configure AWS Backup Vault Lock in compliance mode for a target vault in us-west-2. Configure a minimum duration of 5 years.
- **B.** Create an FSx for Windows File Server file system in us-east-1 that has a Multi-AZ deployment type. Use AWS Backup to create a daily backup plan that includes a backup rule that copies the backup to us-west-2. Configure AWS Backup Vault Lock in governance mode for a target vault in us-west-2. Configure a minimum duration of 5 years.
- **C.** Create an FSx for Windows File Server file system in us-east-1 that has a Multi-AZ deployment type. Use AWS Backup to create a daily backup plan that includes a backup rule that copies the backup to us-west-2. Configure AWS Backup Vault Lock in compliance mode for a target vault in us-west-2. Configure a minimum duration of 5 years.
- **D.** Create an FSx for Windows File Server file system in us-east-1 that has a Single-AZ 2 deployment type. Use AWS Backup to create a daily backup plan that includes a backup rule that copies the backup to us-west-2. Configure AWS Backup Vault Lock in governance mode for a target vault in us-west-2. Configure a minimum duration of 5 years.

### Correct answer: C

**Summary:** FSx for Windows: Multi-AZ for maintenance and AZ failures; AWS Backup copies to another Region into a vault with Vault Lock in compliance mode.

### Explanation
- A is wrong: a Single-AZ file system is unavailable during maintenance and AZ failures, so it cannot meet the 5-minute RPO for those events.
- B is wrong: Multi-AZ is right, but governance mode lets users with special permissions remove the lock or delete backups.
- C is correct: a Multi-AZ file system replicates synchronously to a standby and fails over automatically during maintenance or disruptions, and a compliance-mode Vault Lock in us-west-2 stops anyone, including the root user, from deleting the copied backups for 5 years.
- D is wrong: Single-AZ fails the availability requirement, and governance mode can be bypassed.

**Key phrases:** recovery point objective (RPO) of 5 minutes · planned system maintenance or unplanned service disruptions · must not be deleted by any user for 5 years
**Hint:** Which deployment type keeps the file share running through maintenance or an AZ outage, and which Vault Lock mode stops even administrators from deleting backups?

---

## DELTA-039: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** easy · **Pillars:** Operational Excellence, Reliability
**Services:** Transit Gateway, VPC › Peering

### Question
A company is migrating five on-premises applications to VPCs in the AWS Cloud. Each application is currently deployed in isolated virtual networks on premises and should be deployed similarly in the AWS Cloud. The applications need to reach a shared services VPC. All the applications must be able to communicate with each other. If the migration is successful, the company will repeat the migration process for more than 100 applications. Which solution will meet these requirements with the LEAST administrative overhead?

### Options
- **A.** Deploy software VPN tunnels between the application VPCs and the shared services VPC. Add routes between the application VPCs in their subnets to the shared services VPC.
- **B.** Deploy VPC peering connections between the application VPCs and the shared services VPC. Add routes between the application VPCs in their subnets to the shared services VPC through the peering connection.
- **C.** Deploy an AWS Direct Connect connection between the application VPCs and the shared services VPC. Add routes from the application VPCs in their subnets to the shared services VPC and the applications VPCs. Add routes from the shared services VPC subnets to the applications VPCs.
- **D.** Deploy a transit gateway with associations between the transit gateway and the application VPCs and the shared services VPC. Add routes between the application VPCs in their subnets and the application VPCs to the shared services VPC through the transit gateway.

### Correct answer: D

**Summary:** Many VPCs that all need to talk to each other and to shared services = Transit Gateway hub-and-spoke.

### Explanation
- A is wrong: software VPN tunnels between VPCs are servers to run and patch, and the number of tunnels grows with every pair of VPCs.
- B is wrong: peering is not transitive, so every pair of application VPCs would need its own connection, a full mesh that becomes unmanageable at 100+ VPCs.
- C is wrong: Direct Connect links on-premises networks to AWS; it does not connect VPCs to each other.
- D is correct: a transit gateway is a Regional hub: each VPC attaches once and routes through it to every other attached VPC, so adding more applications only means adding attachments.

**Key phrases:** shared services VPC · communicate with each other · more than 100 applications · LEAST administrative overhead
**Hint:** Peering is not transitive and grows as a full mesh. Which hub connects more than 100 VPCs with one attachment each?

---

## DELTA-040: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization
**Services:** EC2 › Reserved Instances & Savings Plans, EC2 › Spot Instances, EC2 Auto Scaling

### Question
A company is running a stateless web application on Amazon EC2 instances. The EC2 instances are in an Auto Scaling group across two Availability Zones behind an Application Load Balancer. The application requires a minimum of 4 EC2 instances at all times. Traffic increases unpredictably during periodic marketing events. During traffic increases, the Auto Scaling group scales out to 12 EC2 instances for several hours. The company wants to reduce compute costs without changing the application architecture or affecting application availability. Which solution will meet these requirements?

### Options
- **A.** Purchase a Compute Savings Plan for 12 EC2 instances. Use On-Demand Instances in the Auto Scaling group.
- **B.** Purchase a Compute Savings Plan for 4 EC2 instances. Create an Auto Scaling mixed instances group that uses Spot Instances.
- **C.** Replace the Auto Scaling group with a larger EC2 instance. Purchase a Reserved Instance for the larger EC2 instance type.
- **D.** Use scheduled scaling to scale out to 12 EC2 instances during business hours. Use Spot Instances in the Auto Scaling group.

### Correct answer: B

**Summary:** Commit for the steady baseline (Savings Plan for 4) and cover unpredictable bursts with Spot in a mixed instances group.

### Explanation
- A is wrong: a Savings Plan sized for 12 instances pays for 8 instances' worth of commitment that sits unused most of the time.
- B is correct: a Savings Plan sized for the 4 instances that always run discounts the baseline, and a mixed instances policy adds Spot capacity for the stateless burst, so the extra instances cost far less without changing the app.
- C is wrong: one larger instance removes the Auto Scaling group and both Availability Zones, which changes the architecture and lowers availability.
- D is wrong: the traffic increases are unpredictable, so scaling on a business-hours schedule does not match them, and running every instance on Spot puts the baseline at risk of interruption.

**Key phrases:** minimum of 4 EC2 instances at all times · increases unpredictably · reduce compute costs · without changing the application architecture
**Hint:** Split the load: the part that never goes away and the part that comes and goes. Which pricing fits each?

---

## DELTA-041: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** easy · **Pillars:** Performance Efficiency
**Services:** S3 › Performance & Transfer Acceleration

### Question
A solutions architect needs to improve write throughput for an Amazon S3 bucket experiencing high request rates. Which solution will meet these requirements?

### Options
- **A.** Configure S3 Cross-Region Replication to additional buckets.
- **B.** Use S3 Transfer Acceleration.
- **C.** Use an AWS Lambda function to handle write operations asynchronously.
- **D.** Create multiple prefixes within the existing S3 bucket.

### Correct answer: D

**Summary:** More S3 request throughput = spread objects over more prefixes; each prefix scales its request rate on its own.

### Explanation
- A is wrong: Cross-Region Replication copies objects after they are written; it does not raise the write rate of the source bucket.
- B is wrong: Transfer Acceleration speeds long-distance uploads through edge locations; it does not raise the request rate limit.
- C is wrong: writing asynchronously through Lambda adds a layer but the same request limits still apply to the bucket.
- D is correct: S3 supports thousands of write requests per second for each prefix, so spreading objects across several prefixes multiplies the throughput the bucket can take.

**Key phrases:** improve write throughput · high request rates
**Hint:** S3 request-rate limits apply per prefix. How do you get more of them?

---

## DELTA-042: Networking & Content Delivery
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security
**Services:** Elastic Load Balancing › ALB, VPC › NAT gateways, VPN › Site-to-Site VPN

### Question
A company wants to deploy an internal web application on AWS. The web application must be accessible only from the company's office. The company needs to download security patches for the web application from the internet. The company has created a VPC and has configured an AWS Site-to-Site VPN connection to the company's office. A solutions architect must design a secure architecture for the web application. Which solution will meet these requirements?

### Options
- **A.** Deploy the web application on Amazon EC2 instances in public subnets behind a public Application Load Balancer (ALB). Attach an internet gateway to the VPC. Set the inbound source of the ALB's security group to 0.0.0.0/0.
- **B.** Deploy the web application on Amazon EC2 instances in private subnets behind an internal Application Load Balancer (ALB). Deploy NAT gateways in public subnets. Attach an internet gateway to the VPC. Set the inbound source of the ALB's security group to the company's office network CIDR block.
- **C.** Deploy the web application on Amazon EC2 instances in public subnets behind an internal Application Load Balancer (ALB). Deploy NAT gateways in private subnets. Attach an internet gateway to the VPC. Set the outbound destination of the ALB's security group to the company's office network CIDR block.
- **D.** Deploy the web application on Amazon EC2 instances in private subnets behind a public Application Load Balancer (ALB). Attach an internet gateway to the VPC. Set the outbound destination of the ALB's security group to 0.0.0.0/0.

### Correct answer: B

**Summary:** Internal app reached over VPN: private instances behind an internal ALB; NAT gateway in a public subnet for outbound patches.

### Explanation
- A is wrong: a public ALB open to 0.0.0.0/0 exposes the application to the whole internet.
- B is correct: an internal ALB is reachable only from inside the VPC and over the VPN, its security group allows only the office CIDR, and the private instances download patches through NAT gateways in public subnets.
- C is wrong: NAT gateways must be in public subnets to reach the internet, and the instances do not need to be in public subnets; outbound rules on the ALB's security group do not restrict who can connect.
- D is wrong: a public ALB is reachable from the internet, and an outbound security group rule does nothing to limit inbound access.

**Key phrases:** accessible only from the company's office · download security patches for the web application from the internet · Site-to-Site VPN connection
**Hint:** The app is reached only over the VPN, but the instances must reach out to the internet. Which load balancer scheme and which outbound path fit?

---

## DELTA-043: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Operational Excellence
**Services:** Config › Rules & remediation

### Question
A company runs analytics workloads across multiple AWS accounts by using an organization in AWS Organizations. The company needs all Amazon EC2 instances and Amazon RDS databases to have Environment and Owner tags. A solutions architect discovers that multiple resources lack the required tags. The solutions architect needs a solution to identify and remediate missing tags across all accounts with minimal ongoing maintenance. Which solution will meet these requirements?

### Options
- **A.** Use AWS Config to identify all untagged resources. Tag the identified resources programmatically. Apply the Environment and Owner tags across the organization.
- **B.** Configure AWS Systems Manager Inventory to scan resources. Apply tags to resources that lack the required tags.
- **C.** Direct each AWS account owner to identify and tag all critical resources in their account. Document the tagging standards in a central repository.
- **D.** Use Amazon Inspector to scan for resources that lack the required tags. Create a tagging policy based on the scan results. Apply the policy across the organization.

### Correct answer: A

**Summary:** Find and fix missing tags across an organization: AWS Config (required-tags rule, organization-wide) with programmatic tagging as the remediation.

### Explanation
- A is correct: AWS Config's required-tags rule, deployed across the organization, finds every EC2 instance and RDS database without the Environment and Owner tags, and the missing tags can be added programmatically as remediation.
- B is wrong: Systems Manager Inventory collects software and configuration data from managed instances; it does not check AWS resource tags such as those on RDS databases.
- C is wrong: asking each account owner to tag by hand is slow, error-prone and must be repeated forever.
- D is wrong: Amazon Inspector scans workloads for software vulnerabilities and network exposure; it does not check tags.

**Key phrases:** Environment and Owner tags · identify and remediate missing tags across all accounts · minimal ongoing maintenance
**Hint:** Which service evaluates existing resources against a required-tags rule in every account without people checking by hand?

---

## DELTA-044: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security
**Services:** WAF, Elastic Load Balancing › ALB

### Question
A company is building a web application. The company needs a load balancing solution that supports HTTPS header-based routing. The company's security team also requires a rules-based method of blocking specific incoming requests to decrease the effects of malicious activity. Which solution will meet these requirements?

### Options
- **A.** Create an Application Load Balancer (ALB). Configure an HTTPS listener with mutual TLS enabled.
- **B.** Create a Network Load Balancer (NLB). Configure AWS Network Firewall with the security team's required rules.
- **C.** Create an Application Load Balancer (ALB). Integrate the ALB with AWS Config. Apply custom rules to all ALB resources.
- **D.** Create an Application Load Balancer (ALB). Integrate the ALB with AWS WAF. Configure the security team's required rules.

### Correct answer: D

**Summary:** Layer 7 routing plus rule-based request blocking = ALB with AWS WAF attached.

### Explanation
- A is wrong: mutual TLS checks client certificates; it does not give the security team rules to block specific requests.
- B is wrong: a Network Load Balancer works at layer 4 and cannot route on HTTP headers.
- C is wrong: AWS Config checks resource configurations; it never inspects or blocks requests.
- D is correct: an ALB routes on HTTP headers, and AWS WAF attached to the ALB filters requests with managed and custom rules, such as IP sets, rate limits or SQL injection matches.

**Key phrases:** HTTPS header-based routing · rules-based method of blocking specific incoming requests
**Hint:** Header-based routing needs a layer 7 load balancer. Which service adds rules that block specific web requests?

---

## DELTA-045: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence
**Services:** Firewall Manager, VPC › Security groups

### Question
A company merged several independent accounts into a single organization in AWS Organizations. Each division previously created VPC security groups without central oversight, which caused inconsistent configurations and overly permissive rules. The company needs a solution to centralize the enforcement of baseline security group rules across all member accounts and AWS Regions. The solution must automatically identify security groups that are not attached to any resources and detect rules that grant too much access. Which solution will meet the requirements with the LEAST operational overhead?

### Options
- **A.** Use AWS Firewall Manager to create security group policies. Apply common security group rules, content audit policies, and usage audit policies across all accounts and Regions.
- **B.** Use AWS CloudFormation StackSets to deploy VPC security groups that use standardized configurations across accounts and Regions. Configure AWS Network Firewall to inspect traffic and enforce network security policies.
- **C.** Use AWS CloudFormation StackSets to deploy VPC security groups that use standardized configurations across accounts and Regions. Configure AWS Config rules and AWS Lambda functions to evaluate security group compliance and automate remediation.
- **D.** Use AWS Network Firewall to create centralized network security policies. Deploy the Network Firewall policies to all VPCs across accounts.

### Correct answer: A

**Summary:** Organization-wide security group baselines and audits (unused, over-permissive) = AWS Firewall Manager security group policies.

### Explanation
- A is correct: Firewall Manager security group policies apply common baseline groups, content audit policies flag rules that are too permissive, and usage audit policies find unused groups, across all accounts and Regions.
- B is wrong: StackSets deploy new standard groups but do not audit or correct the existing ones, and Network Firewall inspects traffic rather than security group rules.
- C is wrong: StackSets plus custom Config rules and Lambda remediation can work, but the company builds and maintains the checks itself.
- D is wrong: Network Firewall is a separate traffic-inspection service; it does not manage or audit security groups.

**Key phrases:** centralize the enforcement of baseline security group rules · not attached to any resources · detect rules that grant too much access · LEAST operational overhead
**Hint:** Which service manages security groups centrally across an organization, including auditing unused and overly permissive groups?

---

## DELTA-046: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** S3 › Requester Pays

### Question
A national weather agency collects satellite imagery and atmospheric sensor data in an Amazon S3 bucket. The agency wants to make this data available to universities and international research organizations. The agency needs to minimize ongoing costs and allow authorized AWS accounts to access the data. Which solution will meet these requirements?

### Options
- **A.** Create an S3 gateway endpoint for the S3 bucket.
- **B.** Configure S3 Transfer Acceleration to reduce the agency's data transfer costs for downloads.
- **C.** Create an Amazon CloudFront distribution to deliver the data.
- **D.** Configure the S3 bucket as a Requester Pays bucket.

### Correct answer: D

**Summary:** Share large datasets without paying for other people's downloads = S3 Requester Pays.

### Explanation
- A is wrong: a gateway endpoint only gives the agency's own VPC private access to S3; it does nothing for outside organizations.
- B is wrong: Transfer Acceleration adds a per-GB charge on top of normal transfer; it does not lower the agency's costs.
- C is wrong: CloudFront would deliver the data, but the agency would still pay for all the transfer to the researchers.
- D is correct: with Requester Pays, the requesting AWS accounts pay for their requests and data transfer, while the agency pays only for storage, and anonymous access is not allowed.

**Key phrases:** universities and international research organizations · minimize ongoing costs · authorized AWS accounts
**Hint:** Who should pay for the downloads? Which bucket setting makes that happen?

---

## DELTA-047: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** easy · **Pillars:** Cost Optimization, Operational Excellence
**Services:** EC2 Auto Scaling › Scheduled & predictive scaling

### Question
A company runs a web application in an Amazon EC2 Auto Scaling group. The application runs during business hours only. The company cannot allow interruptions to the application during business hours. The company wants to optimize compute costs for the application based on the application's usage pattern. Which solution will meet this requirement with the LEAST operational overhead?

### Options
- **A.** Manually terminate the instances during non-business hours. Manually launch new instances during business hours.
- **B.** Create a scheduled scaling policy for the Auto Scaling group. Configure the policy to scale out during business hours and to scale in during non-business hours.
- **C.** Use Amazon EC2 Spot Instances in the Auto Scaling group.
- **D.** Purchase Amazon EC2 Reserved Instances on a 1-year term to handle the maximum expected load for the Auto Scaling group.

### Correct answer: B

**Summary:** Workload that runs only in business hours: scheduled scaling scales out in the morning and in at night.

### Explanation
- A is wrong: terminating and launching instances by hand every day is the most operational overhead.
- B is correct: scheduled actions scale the group out before business hours and in afterwards automatically, so the company stops paying overnight without interrupting the app.
- C is wrong: Spot Instances can be reclaimed at any time, which would interrupt the application during business hours.
- D is wrong: Reserved Instances for the peak are paid around the clock, including the hours when nothing runs.

**Key phrases:** business hours only · cannot allow interruptions · LEAST operational overhead
**Hint:** The usage follows the clock exactly, and nothing may be interrupted during business hours.

---

## DELTA-048: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Cost Optimization, Performance Efficiency
**Services:** Aurora › Aurora Serverless

### Question
An ecommerce application uses a PostgreSQL database that runs on an Amazon EC2 instance. During a monthly sales event, database usage increases and causes database connection issues for the application. The traffic is unpredictable for subsequent monthly sales events, which impacts the sales forecast. The company needs to maintain performance when there is an unpredictable increase in traffic. Which solution resolves this issue in the MOST cost-effective way?

### Options
- **A.** Migrate the PostgreSQL database to Amazon Aurora Serverless v2.
- **B.** Enable auto scaling for the PostgreSQL database on the EC2 instance to accommodate increased usage.
- **C.** Migrate the PostgreSQL database to Amazon RDS for PostgreSQL with a larger instance type.
- **D.** Migrate the PostgreSQL database to Amazon Redshift to accommodate increased usage.

### Correct answer: A

**Summary:** Unpredictable, spiky PostgreSQL load = Aurora Serverless v2: capacity scales in fine steps in seconds, and you pay for what is used.

### Explanation
- A is correct: Aurora Serverless v2 is PostgreSQL-compatible and scales its capacity in seconds as load changes, so it handles sales-event spikes and costs little the rest of the month.
- B is wrong: a database on a single EC2 instance cannot auto scale; adding instances does not scale one PostgreSQL server.
- C is wrong: a larger fixed instance is paid for all month to cover a few busy days, and it may still be too small for an unexpected spike.
- D is wrong: Redshift is an analytics data warehouse, not a transactional database for an ecommerce application.

**Key phrases:** PostgreSQL database · unpredictable increase in traffic · MOST cost-effective
**Hint:** Spikes are unpredictable and short. Which PostgreSQL-compatible option scales capacity up and down by itself?

---

## DELTA-049: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** hard · **Pillars:** Security
**Services:** KMS › Key policies & grants, IAM › Roles, Batch

### Question
A company uses AWS Batch to run batch processing jobs that analyze manufacturing sensor data. The jobs read input files from an Amazon S3 bucket and write processed results to an Amazon Aurora MySQL database. The S3 bucket and the Aurora database must be encrypted at rest to meet compliance requirements. The company needs to grant the AWS Batch compute environment secure access to read from Amazon S3 and write to the database. Which solution will meet these requirements?

### Options
- **A.** Create an AWS KMS customer managed key to encrypt the S3 bucket and Aurora MySQL database. Allow the kms:Decrypt and kms:GenerateDataKey actions in the key policy. Configure an IAM role that has access to the KMS key, Amazon S3, and Aurora in the AWS Batch job definition.
- **B.** Create an AWS KMS AWS managed key to encrypt the S3 bucket and Aurora MySQL database. Add an S3 bucket policy that uses the AWS Batch job role as principal.
- **C.** Grant S3 access to only the AWS Batch job role by using a bucket policy. Create a VPC endpoint for Aurora that has encrypted access. Configure the Aurora security group to allow inbound traffic only from the AWS Batch compute subnets.
- **D.** Enable SSL/TLS enforcement on the Aurora MySQL cluster. Configure an S3 VPC gateway endpoint to use an endpoint policy that allows access only from the AWS Batch job role. Update the Aurora security group to allow access from only the AWS Batch compute subnets.

### Correct answer: A

**Summary:** Encrypted S3 and Aurora for AWS Batch: a customer managed KMS key whose policy allows the job role to use it, and a job role in the job definition for S3 and Aurora.

### Explanation
- A is correct: a customer managed key encrypts both stores and has an editable key policy that allows kms:Decrypt and kms:GenerateDataKey for the job's role, and the IAM role in the job definition gives the jobs least-privilege access to the key, S3 and Aurora.
- B is wrong: an AWS managed key's policy cannot be edited, and a bucket policy alone does not give the jobs access to the database.
- C is wrong: this controls network paths but never addresses the encryption keys, and Aurora is not reached through a special VPC endpoint for encrypted access.
- D is wrong: TLS and network restrictions protect data in transit, not at rest, and the job still gets no permissions to the encrypted data.

**Key phrases:** encrypted at rest · secure access to read from Amazon S3 and write to the database
**Hint:** The job needs to decrypt and write encrypted data. Which kind of KMS key lets you edit its key policy, and where does a Batch job get its permissions?

---

## DELTA-050: Databases & Caching
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** easy · **Pillars:** Security
**Services:** RDS › Encryption, RDS › Multi-AZ

### Question
A database is running on an Amazon RDS Multi-AZ DB instance. A recent security audit found the database to be out of compliance because it was not encrypted. Which approach will resolve the encryption requirement?

### Options
- **A.** Log in to the RDS console and select the encryption box to encrypt the database.
- **B.** Create a new encrypted Amazon EBS volume and attach it to the instance.
- **C.** Encrypt the standby replica in the secondary Availability Zone and promote it to the primary instance.
- **D.** Take a snapshot of the RDS instance, copy and encrypt the snapshot, and then restore to the new RDS instance.

### Correct answer: D

**Summary:** Encrypt an existing unencrypted RDS instance: snapshot → copy the snapshot with encryption → restore a new instance from it.

### Explanation
- A is wrong: encryption cannot be turned on for an existing unencrypted RDS instance; the console has no such setting.
- B is wrong: RDS manages its own storage, so EBS volumes cannot be attached to an RDS instance.
- C is wrong: the standby is a synchronous copy of the same unencrypted instance and cannot be encrypted on its own.
- D is correct: copying the snapshot with a KMS key produces an encrypted snapshot, and restoring it creates a new encrypted instance to which the application is then pointed.

**Key phrases:** Multi-AZ DB instance · not encrypted · resolve the encryption requirement
**Hint:** RDS encryption can only be chosen when an instance is created. Which path ends with a new, encrypted instance?

---

## DELTA-051: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** easy · **Pillars:** Cost Optimization, Operational Excellence
**Services:** EventBridge, Lambda

### Question
A company runs Amazon EC2 instances in a testing account. All instances use tags to identify the instances as test resources. The instances must operate only during standard office hours Monday through Friday. The company needs a solution that starts and stops the instances. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create an Amazon CloudWatch alarm to monitor EC2 instance state. Create an AWS Lambda function that has IAM permissions to start and stop the tagged EC2 instances.
- **B.** Create an AWS Trusted Advisor check to identify underutilized EC2 instances. Create an AWS Lambda function that has IAM permissions to start and stop the tagged EC2 instances.
- **C.** Create AWS Systems Manager State Manager associations to start and stop the tagged EC2 instances.
- **D.** Create an Amazon EventBridge rule that uses cron expressions. Invoke AWS Lambda functions to start and stop the tagged EC2 instances.

### Correct answer: D

**Summary:** Start and stop instances on a timetable: an EventBridge schedule (cron) invoking Lambda functions that act on the tagged instances.

### Explanation
- A is wrong: a CloudWatch alarm on instance state fires on metric changes, not at set times, so nothing would start the instances in the morning.
- B is wrong: Trusted Advisor reports underutilized instances; it has no schedule and does not start or stop anything.
- C is wrong: State Manager is built to keep instances in a desired configuration; it can run the start and stop Automation runbooks on a schedule, but that is a roundabout fit, while scheduled EventBridge rules are the standard, direct way to act at set times.
- D is correct: EventBridge rules with cron expressions fire at the start and end of office hours on weekdays and invoke Lambda functions that start or stop every instance with the test tag.

**Key phrases:** standard office hours Monday through Friday · starts and stops the instances · LEAST operational overhead
**Hint:** Starting and stopping on office hours is a clock-based task. Which option actually runs on a schedule?

---

## DELTA-052: Compute & Serverless
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** EC2 Auto Scaling

### Question
A company runs an application on Amazon EC2 instances. EC2 instance usage is higher during daytime hours than nighttime hours. A solutions architect wants to automatically optimize Amazon EC2 costs based on this usage pattern. Which AWS service or purchasing option will meet this requirement?

### Options
- **A.** Spot Instances.
- **B.** Reserved Instances.
- **C.** AWS CloudFormation.
- **D.** AWS Auto Scaling.

### Correct answer: D

**Summary:** Usage that changes through the day: Auto Scaling adds and removes instances so you only pay for what the load needs.

### Explanation
- A is wrong: Spot Instances lower the price per hour but do not change how many instances run, and they can be interrupted.
- B is wrong: Reserved Instances discount a fixed amount of capacity that is paid for day and night.
- C is wrong: CloudFormation provisions resources from templates; it does not scale them with usage.
- D is correct: Auto Scaling adds instances during the busy daytime and removes them at night automatically, so capacity follows the usage pattern.

**Key phrases:** higher during daytime hours than nighttime hours · automatically optimize
**Hint:** Which option changes the number of running instances as usage rises and falls?

---

## DELTA-053: Monitoring, Management & Governance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Operational Excellence
**Services:** CloudFormation

### Question
A company uses the AWS CDK to manage infrastructure for multiple applications. The company needs to design a repeatable deployment pipeline for production infrastructure updates. The pipeline must generate AWS CloudFormation templates, show proposed infrastructure changes for review, and require manual approval before applying the changes to production. Which solution will meet these requirements?

### Options
- **A.** Configure a pipeline that generates CloudFormation templates from the CDK application and shows the proposed stack changes. Configure the pipeline to require manual approval and deploy the generated stacks to production.
- **B.** Configure a pipeline that generates CloudFormation templates from the CDK application and requires manual approval of code changes. Configure the pipeline to deploy the generated stacks to production.
- **C.** Configure a pipeline that generates CloudFormation templates from the CDK application and queries AWS CloudTrail for deployment API activity. Configure the pipeline to require manual approval and deploy the generated stacks to production.
- **D.** Configure a pipeline that generates CloudFormation templates from the CDK application and runs AWS CloudFormation drift detection on the production stacks. Configure the pipeline to require manual approval and deploy the generated stacks to production.

### Correct answer: A

**Summary:** Safe IaC deployments: synthesize the templates, show the change set or diff for review, require manual approval, then deploy.

### Explanation
- A is correct: the pipeline synthesizes the CDK app into CloudFormation templates, shows the proposed stack changes (a change set or cdk diff) for reviewers, waits for manual approval, then deploys, which meets every requirement.
- B is wrong: approving the code changes does not show reviewers what will change in the deployed infrastructure.
- C is wrong: CloudTrail records API calls that have already happened; it cannot show proposed changes.
- D is wrong: drift detection compares deployed stacks with their current templates; it does not show what the new deployment will change.

**Key phrases:** generate AWS CloudFormation templates · show proposed infrastructure changes for review · require manual approval
**Hint:** Reviewers must see what the deployment will change in AWS before they approve it. Which option shows that?

---

## DELTA-054: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security, Operational Excellence
**Services:** IAM Identity Center

### Question
A company manages AWS accounts in AWS Organizations. AWS IAM Identity Center and AWS Control Tower are configured for the accounts. The company wants to manage multiple user permissions across all the accounts. The permissions will be used by multiple IAM users and must be split between the developer and administrator teams. Each team requires different permissions. The company wants a solution that includes new users that are hired on both teams. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create individual users in IAM Identity Center for each account. Create separate developer and administrator groups in IAM Identity Center. Assign the users to the appropriate groups. Create a custom IAM policy for each group to set fine-grained permissions.
- **B.** Create individual users in IAM Identity Center for each account. Create separate developer and administrator groups in IAM Identity Center. Assign the users to the appropriate groups. Attach AWS managed IAM policies to each user as needed for fine-grained permissions.
- **C.** Create individual users in IAM Identity Center. Create new developer and administrator groups in IAM Identity Center. Create new permission sets that include the appropriate IAM policies for each group. Assign the new groups to the appropriate accounts. Assign the new permission sets to the new groups. When new users are hired, add them to the appropriate group.
- **D.** Create individual users in IAM Identity Center. Create new permission sets that include the appropriate IAM policies for each user. Assign the users to the appropriate accounts. Grant additional IAM permissions to the users from within specific accounts. When new users are hired, add them to IAM Identity Center and assign them to the accounts.

### Correct answer: C

**Summary:** Multi-account access by team: Identity Center groups + permission sets assigned to accounts; new hires just join a group.

### Explanation
- A is wrong: Identity Center users are created once, not per account, and custom IAM policies attached to groups are not how Identity Center grants account access.
- B is wrong: attaching policies to each user is per-user work that grows with every hire, and users are not created per account.
- C is correct: a permission set per team, assigned with that team's group to the right accounts, gives every member the same access everywhere, and a new hire only needs to be added to the group.
- D is wrong: permission sets per user and extra permissions inside individual accounts mean repeated work for every user and every account.

**Key phrases:** across all the accounts · developer and administrator teams · new users that are hired · LEAST operational overhead
**Hint:** In IAM Identity Center, permissions are given to groups in accounts through permission sets. How do new hires then get access?

---

## DELTA-055: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** medium · **Pillars:** Performance Efficiency
**Services:** DynamoDB › Capacity modes, CloudFront

### Question
A company is creating a new web application. The application includes a single static webpage and a persistent database layer. The company expects millions of users to use the application during the same 4 hours every morning. The company expects that the application will have only a few thousand users during the rest of each day. The company must be able to rapidly evolve the database schema when needed. Which combination of solutions will meet these requirements and provide the MOST scalability? (Select TWO.)

### Options
- **A.** Deploy Amazon DynamoDB as the database layer. Create DynamoDB tables that have provisioned capacity.
- **B.** Deploy Amazon Aurora as the database layer. Choose the serverless database engine mode.
- **C.** Deploy Amazon DynamoDB as the database layer. Create DynamoDB tables that have on-demand capacity.
- **D.** Deploy the static content to an Amazon S3 bucket. Provision an Amazon CloudFront distribution that uses the S3 bucket as the origin.
- **E.** Deploy the static content on an Amazon EC2 instance. Attach an Amazon EBS volume to the EC2 instance.

### Correct answers: C, D (choose 2)

**Summary:** Huge daily spikes and a changing schema: DynamoDB on-demand for the data, S3 + CloudFront for the static page.

### Explanation
- A is wrong: DynamoDB fits the flexible schema, but provisioned capacity has to be set (or auto scaled) ahead of the surge and throttles when traffic jumps faster than the capacity, so it is not the most scalable choice.
- B is wrong: Aurora Serverless scales capacity, but a relational schema needs migrations for every change, so it does not evolve as rapidly as a schemaless table.
- C is correct: DynamoDB is schemaless, so attributes can change at any time, and on-demand capacity serves the morning surge and the quiet hours with no capacity planning.
- D is correct: S3 stores the static page and CloudFront serves it from edge locations worldwide, which scales to millions of users with nothing to manage.
- E is wrong: a single EC2 instance with an EBS volume cannot scale to millions of users and is a single point of failure.

**Key phrases:** single static webpage · millions of users · rapidly evolve the database schema · MOST scalability · TWO
**Hint:** A flexible schema points to one database. Which of its capacity modes absorbs a jump from thousands to millions of users without planning?

---

## DELTA-056: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security
**Services:** IAM › Federation

### Question
A company wants to provide users with access to AWS resources. The company has 1,500 users and manages their access to on-premises resources through Active Directory user groups on the corporate network. However, the company does not want users to have to maintain another identity to access the resources. A solutions architect must manage user access to the AWS resources while preserving access to the on-premises resources. What should the solutions architect do to meet these requirements?

### Options
- **A.** Create an IAM user for each of the 1,500 users. Attach the appropriate policies to each user and to IAM groups that mirror the AD groups.
- **B.** Use Amazon Cognito with an Active Directory user pool. Create roles with the appropriate policies attached and map them to the user pool groups.
- **C.** Define cross-account roles with the appropriate policies attached. Map the roles to the Active Directory groups.
- **D.** Configure SAML 2.0-based federation. Create roles with the appropriate policies attached, and map them to the Active Directory groups.

### Correct answer: D

**Summary:** Use existing AD identities for AWS: SAML 2.0 federation, mapping AD groups to IAM roles.

### Explanation
- A is wrong: an IAM user for each of 1,500 people gives everyone a second identity to maintain.
- B is wrong: Cognito user pools are for customer-facing app sign-in, and there is no Active Directory user pool type.
- C is wrong: cross-account roles let one AWS account access another; they do not connect Active Directory users to AWS.
- D is correct: SAML 2.0 federation (for example through AD FS) lets users sign in with their existing AD credentials, and each AD group is mapped to an IAM role with the right permissions.

**Key phrases:** Active Directory user groups · does not want users to have to maintain another identity
**Hint:** Users must keep their one corporate identity. Which option lets Active Directory vouch for them to AWS?

---

## DELTA-057: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Performance Efficiency, Operational Excellence
**Services:** Fargate, Lambda › Limits, ECS

### Question
A company hosts a web application on an on-premises server that processes incoming requests. Processing time for each request varies from 5 minutes to 20 minutes. The number of requests is growing. The company wants to move the application to AWS. The company wants to update the architecture to scale automatically. Which solution will meet these requirements?

### Options
- **A.** Convert the application to a microservices architecture that uses containers. Use Amazon ECS with the AWS Fargate launch type to run the containerized web application. Configure Service Auto Scaling. Use an Application Load Balancer to distribute incoming requests.
- **B.** Create an Amazon EC2 instance that has sufficient CPU and RAM capacity to run the application. Create metrics to track usage. Create alarms to notify the company when usage exceeds a specified threshold. Replace the EC2 instance with a larger instance size in the same family when usage is too high.
- **C.** Refactor the web application to use multiple AWS Lambda functions. Use an Amazon API Gateway REST API as an entry point to the Lambda functions.
- **D.** Refactor the web application to use a single AWS Lambda function. Use an Amazon API Gateway HTTP API as an entry point to the Lambda function.

### Correct answer: A

**Summary:** Requests longer than 15 minutes rule out Lambda: use containers on ECS Fargate with Service Auto Scaling behind an ALB.

### Explanation
- A is correct: Fargate tasks have no run-time limit, Service Auto Scaling adds and removes tasks with demand, and the ALB spreads requests across them.
- B is wrong: one larger instance resized by hand is vertical scaling and needs manual action, not automatic scaling.
- C is wrong: Lambda functions stop after 15 minutes, so 20-minute requests would fail, and API Gateway also times out integrations far sooner.
- D is wrong: a single Lambda function has the same 15-minute limit.

**Key phrases:** 5 minutes to 20 minutes · scale automatically
**Hint:** Requests take up to 20 minutes. Which compute has no 15-minute limit and still scales automatically?

---

## DELTA-058: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** medium · **Pillars:** Cost Optimization
**Services:** EFS › Storage classes & lifecycle

### Question
A company wants to migrate a visual search application from an on-premises environment to AWS. The application uses NFS storage to cache images. The image cache is currently a few terabytes in size. The company needs to migrate to a cost-effective cloud alternative. Which solution will meet these requirements in the MOST cost-effective way?

### Options
- **A.** Use an Amazon ElastiCache (Memcached) cluster as the image cache. Set the cache TTL according to the required image lifetime in the cache.
- **B.** Use compute-optimized Amazon EC2 instances with instance store volumes as the image cache. Recycle EC2 instances for cache invalidation.
- **C.** Use an Amazon EFS One Zone file system as the image cache. Configure the application to use the EFS mount target.
- **D.** Use Amazon S3 Express One Zone to store the images. Store the S3 object URLs in an Amazon DynamoDB table. Use DynamoDB TTL to invalidate image cache entries.

### Correct answer: C

**Summary:** Migrate an NFS cache cheaply: EFS One Zone keeps NFS semantics at a lower price, fine for cache data that can be rebuilt.

### Explanation
- A is wrong: ElastiCache memory costs far more per GB than file storage for a cache of several terabytes, and the app would need code changes.
- B is wrong: instance store data is lost when instances stop or are recycled, and compute-optimized instances to hold storage are expensive.
- C is correct: EFS One Zone is an NFS file system, so the app mounts it as it does today, and it costs less than Regional EFS; single-AZ durability is acceptable for a cache that can be rebuilt.
- D is wrong: S3 Express One Zone plus a DynamoDB index means rewriting the app to use object storage instead of NFS.

**Key phrases:** NFS storage to cache images · a few terabytes · MOST cost-effective
**Hint:** The app expects NFS. Which option keeps NFS and is the cheapest version of that file system?

---

## DELTA-059: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** easy · **Pillars:** Performance Efficiency
**Services:** Redshift

### Question
A company runs an application that uses Amazon Redshift to serve business intelligence workloads. During business hours, dashboards generate hundreds of concurrent queries as users review real-time metrics. Users experience query queuing and delayed results when dashboard activity peaks. The company needs to maintain consistent query performance without affecting the availability of the Amazon Redshift cluster. Which solution will meet these requirements?

### Options
- **A.** Resize the cluster by using the classic resize capability when dashboard query volume increases. Reduce the cluster to its original size when activity returns to baseline levels.
- **B.** Resize the cluster by using the elastic resize capability when dashboard query volume increases. Reduce the cluster to its original size when activity returns to baseline levels.
- **C.** Enable the concurrency scaling feature for the cluster for specific workload management queues.
- **D.** Enable Amazon Redshift Spectrum on the cluster when dashboard query volume increases.

### Correct answer: C

**Summary:** Redshift queries queuing at peak = enable concurrency scaling; extra clusters take the overflow automatically.

### Explanation
- A is wrong: classic resize can make the cluster read-only or unavailable for a long time, and it is done by hand.
- B is wrong: elastic resize is faster but still briefly interrupts connections and must be timed by hand for each peak.
- C is correct: concurrency scaling adds transient clusters automatically when queries start queuing in the chosen WLM queues, then removes them, with no change to the main cluster's availability.
- D is wrong: Redshift Spectrum queries data in S3; it does not add capacity for queries that are queuing on the cluster.

**Key phrases:** hundreds of concurrent queries · query queuing · without affecting the availability
**Hint:** Queries queue only at peak, and the cluster must stay available. Can extra capacity appear just while the queue is long?

---

## DELTA-060: Monitoring, Management & Governance
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Operational Excellence
**Services:** VPC › Flow Logs, Data Firehose, OpenSearch Service

### Question
A company's application uses Network Load Balancers, Auto Scaling groups, Amazon EC2 instances, and databases that are deployed in an Amazon VPC. The company wants to capture information about traffic to and from the network interfaces in near real time in its Amazon VPC. The company wants to send the information to Amazon OpenSearch Service for analysis. Which solution will meet these requirements?

### Options
- **A.** Create a log group in Amazon CloudWatch Logs. Configure VPC Flow Logs to send the log data to the log group. Use Amazon Kinesis Data Streams to stream the logs from the log group to OpenSearch Service.
- **B.** Create a log group in Amazon CloudWatch Logs. Configure VPC Flow Logs to send the log data to the log group. Use Amazon Data Firehose to stream the logs from the log group to OpenSearch Service.
- **C.** Create a trail in AWS CloudTrail. Configure VPC Flow Logs to send the log data to the trail. Use Amazon Kinesis Data Streams to stream the logs from the trail to OpenSearch Service.
- **D.** Create a trail in AWS CloudTrail. Configure VPC Flow Logs to send the log data to the trail. Use Amazon Data Firehose to stream the logs from the trail to OpenSearch Service.

### Correct answer: B

**Summary:** VPC Flow Logs → CloudWatch Logs → subscription filter → Data Firehose → OpenSearch Service.

### Explanation
- A is wrong: Kinesis Data Streams has no built-in delivery to OpenSearch Service, so consumers would have to be written to load the data.
- B is correct: VPC Flow Logs captures the network interface traffic, publishes it to a CloudWatch Logs log group, and a subscription filter sends it to Data Firehose, which delivers it to OpenSearch Service in near real time with no code. (VPC Flow Logs can now also publish straight to Data Firehose, which removes the log group step.)
- C is wrong: VPC Flow Logs cannot publish to a CloudTrail trail; CloudTrail records API calls, not network traffic.
- D is wrong: VPC Flow Logs cannot publish to CloudTrail, so there would be no flow log data to stream.

**Key phrases:** traffic to and from the network interfaces · near real time · Amazon OpenSearch Service
**Hint:** Flow logs can be published to CloudWatch Logs but not to CloudTrail. Which streaming service delivers straight to OpenSearch Service?

---

## DELTA-061: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Operational Excellence
**Services:** DynamoDB › TTL, DynamoDB › Streams

### Question
A solutions architect supports an application that accesses data in an Amazon DynamoDB table. One of the item attributes is expirationDate in the timestamp format. The application uses this attribute to find items, archive them, and remove them from the table based on the timestamp value. The application will be decommissioned soon, and the solutions architect must find another way to implement this functionality. The solutions architect needs a solution that will require the least amount of code to write. Which solution will meet these requirements?

### Options
- **A.** Enable TTL on the expirationDate attribute in the table. Create a DynamoDB stream. Create an AWS Lambda function to process the deleted items. Create a DynamoDB trigger for the Lambda function.
- **B.** Create two AWS Lambda functions: one to delete the items and one to process the items. Create a DynamoDB stream. Use the DeleteItem API operation to delete the items based on the expirationDate attribute. Use the GetRecords API operation to get the items from the DynamoDB stream and process them.
- **C.** Create two AWS Lambda functions one to delete the items and one to process the items. Create an Amazon EventBridge scheduled rule to invoke the Lambda functions. Use the DeleteItem API operation to delete the items based on the expirationDate attribute. Use the GetRecords API operation to get the items from the DynamoDB table and process them.
- **D.** Enable TTL on the expirationDate attribute in the table. Specify an Amazon SQS dead-letter queue as the target to delete the items. Create an AWS Lambda function to process the items.

### Correct answer: A

**Summary:** Expire and archive DynamoDB items: TTL deletes them, and a stream sends each deleted item to a Lambda function that archives it.

### Explanation
- A is correct: TTL deletes expired items with no code, the deletions appear in the DynamoDB stream with the old item image, and a Lambda trigger archives them, so only the archive function needs writing.
- B is wrong: writing a Lambda function to find and delete items repeats what TTL does for free, which means more code.
- C is wrong: two functions run on a schedule must scan for expired items and delete them, which is the most code.
- D is wrong: TTL has no target setting and cannot send items to an SQS dead-letter queue.

**Key phrases:** find items, archive them, and remove them · least amount of code
**Hint:** DynamoDB can delete expired items itself. How can the deleted items still be archived?

---

## DELTA-062: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** hard · **Pillars:** Performance Efficiency, Reliability
**Services:** Elastic Load Balancing › ALB, CloudWatch

### Question
A company runs a highly available web application on Amazon EC2 instances behind an Application Load Balancer. The company uses Amazon CloudWatch metrics. As the traffic to the web application increases, some EC2 instances become overloaded with many outstanding requests. The CloudWatch metrics show that the number of requests processed and the time to receive the responses from some EC2 instances are both higher compared to other EC2 instances. The company does not want new requests to be forwarded to the EC2 instances that are already overloaded. Which solution will meet these requirements?

### Options
- **A.** Use the round robin routing algorithm based on the RequestCountPerTarget and ActiveConnectionCount CloudWatch metrics.
- **B.** Use the least outstanding requests algorithm based on the RequestCountPerTarget and ActiveConnectionCount CloudWatch metrics.
- **C.** Use the round robin routing algorithm based on the RequestCount and TargetResponseTime CloudWatch metrics.
- **D.** Use the least outstanding requests algorithm based on the RequestCount and TargetResponseTime CloudWatch metrics.

### Correct answer: B

**Summary:** ALB targets overloaded with outstanding requests: switch the target group to least outstanding requests, and watch per-target load with RequestCountPerTarget and ActiveConnectionCount.

### Explanation
- A is wrong: round robin sends requests evenly regardless of how busy each target is, so overloaded instances keep receiving new requests.
- B is correct: least outstanding requests sends each new request to the target with the fewest requests in progress, so overloaded instances get fewer, and RequestCountPerTarget and ActiveConnectionCount track the requests and concurrent connections that build up on the targets.
- C is wrong: round robin keeps sending requests to the overloaded instances.
- D is wrong: least outstanding requests is the right algorithm, but RequestCount is a total for the whole load balancer and TargetResponseTime only shows the slowness after it happens; neither tracks how the outstanding work is spread across the targets.

**Key phrases:** overloaded with many outstanding requests · number of requests processed and the time to receive the responses · does not want new requests to be forwarded
**Hint:** Round robin ignores how busy a target is. Then pick the metrics that track how much work each target is holding, not totals for the whole load balancer.

---

## DELTA-063: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** easy · **Pillars:** Reliability, Performance Efficiency
**Services:** SQS, Lambda › Event sources

### Question
An ecommerce company is building an order processing application. The order processing application receives orders in bursts from a web application. The processing layer must handle variable workloads and provide order durability to ensure that no customer orders are lost. The company needs a solution that is scalable and loosely coupled. Which solution will meet these requirements?

### Options
- **A.** Deploy the order processing application to Amazon EC2 instances in an Auto Scaling group. Deploy an Application Load Balancer (ALB) in front of the Auto Scaling group. Store orders in instance memory until processing is finished.
- **B.** Use AWS Step Functions to orchestrate order processing. Configure an Amazon API Gateway REST API to invoke the Step Functions state machine through the StartExecution API.
- **C.** Deploy an Amazon SQS queue to store incoming orders. Create an AWS Lambda function to process orders. Configure an SQS event source mapping that allows the function to consume the queue.
- **D.** Deploy an Amazon RDS for MySQL Single-AZ database instance. Insert incoming orders into the database. Deploy Amazon EC2 instances. Configure the EC2 instances to query the database once every minute to fetch and then delete new orders.

### Correct answer: C

**Summary:** Bursty orders that must not be lost: buffer them in SQS and process with Lambda through an event source mapping.

### Explanation
- A is wrong: orders held in instance memory are lost if an instance fails or scales in, and the ALB couples the web app directly to the processors.
- B is wrong: Step Functions orchestrates steps but gives no buffer for bursts, and a synchronous API call couples the web app to processing.
- C is correct: SQS stores each order durably until it is processed and absorbs bursts, and the Lambda event source mapping scales the number of functions with the queue's backlog.
- D is wrong: a Single-AZ database polled every minute adds delay and a single point of failure, and it is not loosely coupled.

**Key phrases:** bursts · order durability · scalable and loosely coupled
**Hint:** Bursts, durability and loose coupling all point to a buffer between the web app and the processor.

---

## DELTA-064: Storage & Backup
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Reliability, Security
**Services:** S3 › Replication, KMS

### Question
A company uses server-side encryption with AWS KMS keys (SSE-KMS) to encrypt objects that the company stores in an Amazon S3 bucket. The company requires all objects in the S3 bucket to be replicated to a secondary AWS account in the same AWS Region. All objects in the source account S3 bucket must be available in the secondary account within several minutes. All replicated objects must be immediately accessible. The company has already modified the key policy for the KMS key that encrypts the bucket in the source account to allow access from the secondary account. Which solution will meet these requirements?

### Options
- **A.** Create a new S3 bucket in the secondary account. Configure an AWS PrivateLink connection between the new S3 bucket and the existing S3 bucket. Grant PrivateLink permission to access the KMS keys that encrypt the data.
- **B.** Create an AWS Backup job for the source S3 bucket. Create a backup vault in the secondary AWS account. Configure the backup plan to copy the backup jobs to the new backup vault.
- **C.** Create a new S3 bucket in the secondary account. Configure an S3 replication rule on the source bucket to replicate objects to the secondary account. Enable S3 Replication Time Control (S3 RTC).
- **D.** Configure an AWS Lambda function in the source account to automatically invoke an Amazon S3 Batch Operations job to copy the objects to the secondary account S3 bucket every five minutes.

### Correct answer: C

**Summary:** Copy SSE-KMS objects to another account within minutes: S3 Same-Region Replication with Replication Time Control.

### Explanation
- A is wrong: PrivateLink gives private access to services; it does not copy objects between buckets.
- B is wrong: AWS Backup copies on a backup schedule, and backups must be restored before the objects can be used, so they are not immediately accessible.
- C is correct: a replication rule copies each new object, including SSE-KMS objects once the rule specifies the KMS key, to the bucket in the other account, and S3 Replication Time Control replicates most objects within seconds and 99.99% within 15 minutes.
- D is wrong: a Lambda function starting Batch Operations jobs every five minutes is custom work that S3 replication already does.

**Key phrases:** SSE-KMS · secondary AWS account in the same AWS Region · within several minutes · immediately accessible
**Hint:** Which S3 feature copies new objects to another account automatically, and which add-on gives a time guarantee?

---

## DELTA-065: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence
**Services:** Secrets Manager › Rotation, RDS

### Question
A company has workloads that run on AWS. Each workload has a separate Amazon RDS database. A security audit finds that the company does not meet a requirement to rotate the RDS master user credentials every 30 days. Each RDS DB instance must also have a different set of credentials that are accessible only by the relevant application layer and by the team that supports the workload. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Use AWS Secrets Manager to set up RDS password management. Use a combination of IAM policies and RDS policies to restrict access to the credentials.
- **B.** Use AWS Secrets Manager to set up RDS password management. Use a combination of IAM policies and Secrets Manager policies to restrict access to the credentials.
- **C.** Create an Amazon SNS topic for each workload. Create a scheduled AWS Lambda function that rotates the RDS master user credentials every 30 days. Configure the Lambda function to publish the new credentials to the SNS topic for each application and team.
- **D.** Create an Amazon S3 bucket that uses AWS KMS for encryption. Create a scheduled AWS Lambda function that rotates the RDS master user credentials every 30 days. Configure the Lambda function to push the new credentials to the S3 bucket. Use KMS key policies to restrict access to the credentials.

### Correct answer: B

**Summary:** Rotating RDS master passwords per workload: RDS-managed passwords in Secrets Manager; restrict each secret with IAM and secret resource policies.

### Explanation
- A is wrong: RDS has no resource policies that control access to the secret; access to secrets is governed by IAM and Secrets Manager policies.
- B is correct: RDS password management stores each instance's master password in its own Secrets Manager secret and rotates it on a schedule you set, and IAM policies plus resource policies on each secret limit it to the right application and team.
- C is wrong: a custom rotation function that sends credentials over SNS is code to maintain and spreads passwords in messages.
- D is wrong: copying credentials to S3 with a custom function is more code and a less controlled way to share secrets.

**Key phrases:** rotate the RDS master user credentials every 30 days · different set of credentials · LEAST operational overhead
**Hint:** RDS can hand its master password to Secrets Manager. Which kinds of policy control who can read a secret?

---

## DELTA-066: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security
**Services:** IAM › Roles

### Question
A company is designing a microservice-based architecture for a new application on AWS. Each microservice will run on its own set of Amazon EC2 instances. Each microservice will need to interact with multiple AWS services. The company wants to manage permissions for each EC2 instance according to the principle of least privilege. Which solution will meet this requirement with the LEAST administrative overhead?

### Options
- **A.** Assign an IAM user to each microservice. Use access keys that are stored within the application code to authenticate AWS service requests.
- **B.** Create a single IAM role that has permission to access all AWS services. Add the IAM role to an instance profile that is associated with the EC2 instances.
- **C.** Use AWS Organizations to create a separate account for each microservice. Manage permissions at the account level.
- **D.** Create individual IAM roles based on the specific needs of each microservice. Add each IAM role to an instance profile that is associated with the appropriate EC2 instance.

### Correct answer: D

**Summary:** Per-workload permissions on EC2: a separate IAM role per microservice, delivered through its instance profile (no access keys).

### Explanation
- A is wrong: access keys stored in code are long-term secrets that can leak and must be rotated by hand.
- B is wrong: one role with access to every service gives each microservice far more than it needs.
- C is wrong: a separate account per microservice is far more administration than per-service roles.
- D is correct: a role per microservice holds only the permissions that service needs, and the instance profile delivers temporary credentials to its instances automatically.

**Key phrases:** Each microservice will need to interact with multiple AWS services · principle of least privilege · LEAST administrative overhead
**Hint:** Least privilege means each microservice gets only what it needs. How do EC2 instances get permissions without stored keys?

---

## DELTA-067: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Performance Efficiency
**Services:** RDS › Read replicas, ElastiCache

### Question
A company runs a web application that uses Amazon RDS for MySQL to store relational data. Data in the database does not change frequently. A solutions architect notices that during peak usage times, the database has performance issues when it serves the data. The company wants to improve the performance of the database. Which combination of steps will meet these requirements? (Select TWO.)

### Options
- **A.** Integrate AWS WAF with the application.
- **B.** Create a read replica for the database. Redirect read traffic to the read replica.
- **C.** Create an Amazon ElastiCache (Memcached) cluster. Configure the application and the database to integrate with the cluster.
- **D.** Use the Amazon S3 One Zone-Infrequent Access (S3 One Zone-IA) storage class to store the data that changes infrequently.
- **E.** Migrate the database to Amazon DynamoDB Configure the application to use the DynamoDB database.

### Correct answers: B, C (choose 2)

**Summary:** Read-heavy RDS with slowly changing data: add read replicas and cache results in ElastiCache.

### Explanation
- A is wrong: AWS WAF filters malicious web requests; it does not make the database faster.
- B is correct: a read replica serves read queries on its own instance, so the primary has less work at peak.
- C is correct: an ElastiCache cache serves data that rarely changes from memory, so most reads never reach the database.
- D is wrong: S3 is object storage; the relational data cannot be queried there by the application.
- E is wrong: moving to DynamoDB means redesigning the relational data and rewriting the application.

**Key phrases:** does not change frequently · during peak usage times · improve the performance of the database · TWO
**Hint:** The load is reads of data that rarely changes. Which two options take reads off the primary database?

---

## DELTA-068: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency
**Services:** FSx › Windows File Server

### Question
A media company needs to migrate its Windows-based video editing environment to AWS. The company's current environment processes 4K video files that require sustained throughput of 2 GB per second across multiple concurrent users. The company's storage needs increase by 1 TB each week. The company needs a shared file system that supports SMB protocol and whose storage capacity can grow with demand without downtime. Which solution will meet these requirements?

### Options
- **A.** Deploy an Amazon FSx for Windows File Server Multi-AZ file system with SSD storage.
- **B.** Deploy an Amazon EFS file system in Max I/O mode. Provision mount targets in multiple Availability Zones.
- **C.** Deploy an Amazon FSx for Lustre file system with a Persistent 2 deployment type. Provision the file system with 2 TB of storage.
- **D.** Deploy Amazon S3 File Gateway by using multiple cached gateway instances. Configure S3 Transfer Acceleration.

### Correct answer: A

**Summary:** Shared SMB storage for Windows with high throughput = Amazon FSx for Windows File Server (SSD).

### Explanation
- A is correct: FSx for Windows File Server is a managed SMB file system with SSD storage and throughput capacity that reaches several GB/s, Multi-AZ adds availability, and storage capacity can be increased as the data grows without downtime.
- B is wrong: EFS supports only NFS, not SMB, so Windows editing tools cannot use it as an SMB share.
- C is wrong: FSx for Lustre is accessed with the Lustre client from Linux, not over SMB.
- D is wrong: S3 File Gateway is limited by gateway appliances and the network link, so it cannot sustain 2 GB per second for editing.

**Key phrases:** Windows-based video editing · sustained throughput of 2 GB per second · supports SMB protocol
**Hint:** SMB from Windows clients rules out most options. Which file system speaks SMB natively and can deliver GB/s throughput?

---

## DELTA-069: Storage & Backup
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** medium · **Pillars:** Security
**Services:** S3 › Access control

### Question
A research company needs to share research data with three partner companies. An existing shared VPC connects the partner companies to the research company. The research company creates an Amazon S3 bucket and configures the S3 bucket to store the shared research data. The research company must be the owner of all the objects in the bucket. The research company needs to ensure that each partner company has access to only its own prefix in the S3 bucket. The partner companies must be able to upload and download objects securely and privately. Which solution will meet these requirements?

### Options
- **A.** Enable ACLs and create one ACL for each partner company. In each ACL, specify the partner company's AWS account and grant write permission to a specific prefix in the S3 bucket.
- **B.** Create an S3 bucket policy. Define one statement for each partner company in the policy. In each statement, specify the partner company's AWS account as the principal and the S3 bucket as a resource. Restrict partner company access based on tags and the subnet within the shared VPC that is specified in the condition section of the S3 bucket policy resource statement.
- **C.** Create an S3 access point for each partner company. Specify the shared VPC in each access point. Create an S3 bucket policy that specifies the partner company's AWS account as the principal and the partner company's prefix as part of the resource section of the S3 bucket policy in each access point.
- **D.** Create an S3 gateway endpoint in the shared VPC. Attach an S3 bucket policy to the gateway endpoint. Define one statement for each partner company in the bucket policy. In each statement, specify the partner company's AWS account as a principal and the S3 bucket as a resource. Restrict partner company access based on tags in the condition section of the S3 bucket policy resource statement.

### Correct answer: C

**Summary:** One bucket, many partners, each limited to a prefix and to a VPC: an S3 access point per partner with a VPC network origin.

### Explanation
- A is wrong: ACLs are disabled by default and leave uploaded objects owned by the uploader, and ACLs cannot be scoped to a prefix.
- B is wrong: one bucket policy that tries to filter by tags and subnets is fragile, and a bucket policy cannot use a subnet as a condition.
- C is correct: an access point per partner, restricted to the shared VPC, with a policy that lets that partner's account reach only its own prefix, keeps each partner separated and traffic private, while the bucket owner keeps ownership of all objects.
- D is wrong: a gateway endpoint makes the traffic private, but tag conditions do not limit each partner to its own prefix.

**Key phrases:** owner of all the objects · access to only its own prefix · securely and privately
**Hint:** Each partner needs its own entry point to the bucket, limited to its prefix and reachable only from the shared VPC.

---

## DELTA-070: Compute & Serverless
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security
**Services:** ECS, IAM › Roles

### Question
A company runs multiple applications on Amazon ECS with the Amazon EC2 launch type. Each application requires access to specific Amazon S3 buckets and Amazon DynamoDB tables. The company needs to isolate resource access between applications and block access to container instance role credentials. Which solution will meet these requirements?

### Options
- **A.** Configure interface VPC endpoints for Amazon S3 and Amazon DynamoDB. Configure the applications to use the interface VPC endpoints to access AWS resources.
- **B.** Create task IAM roles that have specific permissions for each application. Configure each ECS task definition to use the appropriate task IAM role.
- **C.** Create an EC2 IAM instance profile that has permissions for all tenants. Use security groups to restrict each container's access to tenant-specific resources.
- **D.** Create an ECS task execution role that has permissions for all resources. Configure all task definitions to use the same task execution role.

### Correct answer: B

**Summary:** Per-application permissions on ECS = task IAM roles in each task definition; block tasks from the instance role's credentials.

### Explanation
- A is wrong: VPC endpoints change the network path; they do not give each application different permissions.
- B is correct: a task role per application gives each task only its own permissions, and with the ECS agent setting that blocks the instance metadata, tasks cannot use the container instance role.
- C is wrong: an instance profile shared by every task gives all applications all permissions, and security groups cannot control access to S3 or DynamoDB.
- D is wrong: the task execution role is what ECS uses to pull images and write logs, not what the application uses, and one role for all applications provides no isolation.

**Key phrases:** isolate resource access between applications · block access to container instance role credentials
**Hint:** Which role gives one ECS task its own permissions instead of sharing the host's?

---

## DELTA-071: Databases & Caching
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** medium · **Pillars:** Cost Optimization, Reliability
**Services:** RDS › Multi-AZ, EBS › Volume types

### Question
A company hosts a three-tier web application on Amazon EC2 instances in a single Availability Zone. The web application uses a self-managed MySQL database that is hosted on an EC2 instance to store data in an Amazon EBS volume. The MySQL database currently uses a 1 TB Provisioned IOPS SSD (io2) EBS volume. The company expects traffic of 1,000 IOPS for both reads and writes at peak traffic. The company wants to minimize any disruptions, stabilize performance, and reduce costs while retaining the capacity for double the IOPS. The company wants to move the database tier to a fully managed solution that is highly available and fault tolerant. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Use a Multi-AZ deployment of an Amazon RDS for MySQL DB instance with an io2 Block Express EBS volume.
- **B.** Use a Multi-AZ deployment of an Amazon RDS for MySQL DB instance with General Purpose SSD (gp3) storage.
- **C.** Use Amazon S3 Intelligent-Tiering access tiers.
- **D.** Use two large EC2 instances to host the database in active-passive mode.

### Correct answer: B

**Summary:** Low IOPS needs don't justify io2: RDS Multi-AZ with General Purpose SSD (gp3 includes 12,000 baseline IOPS at 400 GiB and above for MySQL) is managed, highly available and cheaper.

### Explanation
- A is wrong: io2 Block Express provisioned IOPS cost far more than the workload needs for 1,000 to 2,000 IOPS.
- B is correct: RDS Multi-AZ is managed and fails over automatically, and General Purpose SSD (gp3) storage of 400 GiB or more includes a baseline of 12,000 IOPS for MySQL at no extra charge, far more than double the peak, at a much lower cost than io2.
- C is wrong: S3 Intelligent-Tiering is object storage and cannot host a MySQL database.
- D is wrong: two EC2 instances in active-passive mode are still self-managed, which the company wants to move away from.

**Key phrases:** 1,000 IOPS · double the IOPS · fully managed solution that is highly available · MOST cost-effectively
**Hint:** 2,000 IOPS is modest. Does General Purpose SSD storage already include that much without paying for provisioned IOPS?

---

## DELTA-072: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Operational Excellence, Reliability
**Services:** EC2 Auto Scaling › Instance refresh, EC2 Auto Scaling › Launch templates

### Question
A company runs an application on a fleet of Amazon EC2 instances in an Auto Scaling group behind an Application Load Balancer (ALB). The instances use m5.large instance types. The company needs to migrate the fleet to m6i.large instances to reduce costs and improve performance without any service interruptions. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create a new Auto Scaling group that uses m6i.large instances. Use weighted target groups in the ALB to shift traffic from the old Auto Scaling group to the new group.
- **B.** Update the launch template to specify m6i.large instances. Start an instance refresh on the Auto Scaling group.
- **C.** Create a patch baseline in AWS Systems Manager Patch Manager. Schedule a maintenance window to apply operating system and software patches across the fleet.
- **D.** Modify the user data script to change the instance type at instance launch. Manually terminate instances so that the Auto Scaling group launches replacements that use the new instance type.

### Correct answer: B

**Summary:** Change an Auto Scaling group's instance type without downtime: new launch template version, then an instance refresh.

### Explanation
- A is wrong: a second Auto Scaling group with weighted target groups works but means building and then tearing down a parallel setup.
- B is correct: a new launch template version with m6i.large plus an instance refresh replaces instances in batches while keeping a minimum healthy percentage serving traffic.
- C is wrong: Patch Manager applies operating system patches; it cannot change the instance type.
- D is wrong: user data runs inside an instance that already has a type, so it cannot change it, and terminating instances by hand risks interruptions.

**Key phrases:** m6i.large instances · without any service interruptions · LEAST operational overhead
**Hint:** Change the instance type in one place, then let Auto Scaling replace the instances gradually.

---

## DELTA-073: Monitoring, Management & Governance
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Operational Excellence
**Services:** CloudWatch › Alarms

### Question
A company is migrating an application from on-premises servers to Amazon EC2 instances. As part of the migration design requirements, a solutions architect must implement infrastructure metric alarms. The company does not need to take action if CPU utilization increases to more than 50% for a short burst of time. However, if the CPU utilization increases to more than 50% and read IOPS on the disk are high at the same time, the company needs to act as soon as possible. The solutions architect also must reduce false alarms. What should the solutions architect do to meet these requirements?

### Options
- **A.** Create Amazon CloudWatch composite alarms where possible.
- **B.** Create Amazon CloudWatch dashboards to visualize the metrics and react to issues quickly.
- **C.** Create Amazon CloudWatch Synthetics canaries to monitor the application and raise an alarm.
- **D.** Create single Amazon CloudWatch metric alarms with multiple metric thresholds where possible.

### Correct answer: A

**Summary:** Alert only when several conditions coincide (high CPU AND high read IOPS) = CloudWatch composite alarms.

### Explanation
- A is correct: a composite alarm goes into alarm only when its rule over other alarms is true, such as CPU above 50% AND high read IOPS, so short CPU bursts alone do not alert.
- B is wrong: dashboards show metrics but need someone watching; they raise no alarms.
- C is wrong: Synthetics canaries test endpoints from the outside; they do not combine infrastructure metrics.
- D is wrong: a metric alarm watches one metric (or one math expression) against one threshold; it cannot hold separate thresholds for several metrics.

**Key phrases:** short burst of time · at the same time · reduce false alarms
**Hint:** Neither condition alone should raise an alert, only both together.

---

## DELTA-074: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability
**Services:** SQS › Visibility timeout & polling

### Question
A bank runs an application on Amazon EC2 instances. The EC2 instances process payment requests from an Amazon SQS queue and retrieve payment messages. The EC2 instances then write transaction records to an Amazon RDS database and delete messages from the queue. Processing time varies based on verification requirements. Bank employees report duplicate transaction entries in the RDS database. However, the SQS queue shows no duplicate messages. Which solution will prevent duplicate transaction entries?

### Options
- **A.** Create a new queue by using the CreateQueue API operation.
- **B.** Add appropriate permissions by using the AddPermission API operation.
- **C.** Configure long polling by using the ReceiveMessage API operation.
- **D.** Extend the timeout by using the ChangeMessageVisibility API operation.

### Correct answer: D

**Summary:** Duplicates from slow SQS consumers = visibility timeout too short; extend it (ChangeMessageVisibility) to cover processing time.

### Explanation
- A is wrong: a new queue would have the same visibility timeout problem.
- B is wrong: permissions control who can use the queue; they do not stop a message from being processed twice.
- C is wrong: long polling reduces empty receives; it does not stop a message becoming visible again during long processing.
- D is correct: when processing takes longer than the visibility timeout, the message reappears and another instance processes it too; extending the timeout with ChangeMessageVisibility keeps it hidden until it is deleted.

**Key phrases:** Processing time varies · duplicate transaction entries · no duplicate messages
**Hint:** If processing takes longer than the time a message stays hidden, another consumer receives it again. What controls that time?

---

## DELTA-075: Networking & Content Delivery
**Exam domain:** 3 · **Task:** 3.4 · **Difficulty:** medium · **Pillars:** Performance Efficiency
**Services:** API Gateway › API & endpoint types, Lambda

### Question
A company is building a mobile gaming app. The company wants to serve users from around the world with low latency. The company needs a scalable solution to host the application and to route user requests to the location that is nearest to each user. Which solution will meet these requirements?

### Options
- **A.** Use an Application Load Balancer to route requests to Amazon EC2 instances that are deployed across multiple Availability Zones.
- **B.** Use a Regional Amazon API Gateway REST API to route requests to AWS Lambda functions.
- **C.** Use an edge-optimized Amazon API Gateway REST API to route requests to AWS Lambda functions.
- **D.** Use an Application Load Balancer to route requests to containers in an Amazon ECS cluster.

### Correct answer: C

**Summary:** Global clients of one API = edge-optimized API Gateway endpoint (requests enter at the nearest CloudFront edge) in front of Lambda.

### Explanation
- A is wrong: an ALB is Regional; users far from that Region connect over the public internet the whole way.
- B is wrong: a Regional endpoint is meant for clients in the same Region; distant users get no edge entry point.
- C is correct: an edge-optimized endpoint sends each request into the AWS network at the nearest CloudFront edge location, and Lambda scales automatically behind it.
- D is wrong: an ALB with ECS is still a single-Region entry point with no edge routing.

**Key phrases:** around the world with low latency · nearest to each user
**Hint:** Users are worldwide, so the entry point should be close to each of them rather than in one Region.

---

## DELTA-076: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** Data transfer pricing

### Question
A company deploys an application that consists of an Amazon EC2 instance and an Amazon RDS instance in a Single-AZ configuration. The company deploys both instances without public IP addresses. The company wants to minimize the overall data transfer costs for communication between the EC2 instance and the RDS instance. Which solution will meet this requirement?

### Options
- **A.** Deploy the EC2 instance in the same Availability Zone as the RDS instance.
- **B.** Deploy the EC2 instance and the RDS instance in separate Availability Zones within the same AWS Region.
- **C.** Configure UDP connectivity between the EC2 instance and the RDS instance.
- **D.** Configure IPv6 connectivity between the EC2 instance and the RDS instance.

### Correct answer: A

**Summary:** EC2 ↔ RDS traffic over private IPs is free within one AZ and billed across AZs: put them in the same AZ.

### Explanation
- A is correct: data transfer between an EC2 instance and an RDS instance in the same Availability Zone over private IP addresses has no charge.
- B is wrong: traffic between Availability Zones is charged in each direction, so this raises the cost.
- C is wrong: the protocol does not change data transfer pricing, and RDS database engines use TCP connections.
- D is wrong: IPv6 does not change data transfer pricing; cross-AZ traffic is billed the same.

**Key phrases:** Single-AZ configuration · minimize the overall data transfer costs
**Hint:** Traffic between Availability Zones is billed; traffic inside one AZ over private IPs is not.

---

## DELTA-077: Application Integration
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence
**Services:** SNS › Fan-out, SQS › Dead-letter queues, S3 › Event notifications, Lambda › Event sources

### Question
A company is building a new application to process documents that users upload. The application must send processed documents back to users in email messages. The application must store uploaded documents durably for up to 18 months. The application must process documents as soon as users upload them. The application must include a mechanism to store any documents that fail to process. The company wants to use Amazon SQS queues and Amazon SNS topics. Which combination of actions will meet these requirements with the LEAST management overhead? (Select THREE.)

### Options
- **A.** Configure an SQS dead-letter queue to store any messages that the Amazon EC2 Auto Scaling group does not process.
- **B.** Store the uploaded documents in an Amazon S3 bucket. Configure an S3 event notification to publish a message to an SNS topic for each new document.
- **C.** Subscribe an SQS queue to an SNS topic. Configure the topic to insert messages into the queue. Configure an AWS Lambda function to consume the queue.
- **D.** Configure an SQS dead-letter queue to store any messages that the AWS Lambda function does not process.
- **E.** Subscribe an SQS queue to an SNS topic. Configure the topic to insert messages into the queue. Configure an Amazon EC2 Auto Scaling group to consume the queue.
- **F.** Store the uploaded documents in an Amazon Kinesis data stream. Use an AWS Lambda function to read data from the stream and to send messages to an SNS topic.

### Correct answers: B, C, D (choose 3)

**Summary:** Upload pipeline: S3 (durable store) → event notification → SNS → SQS → Lambda, with an SQS dead-letter queue for failed messages.

### Explanation
- A is wrong: a dead-letter queue is right, but an EC2 Auto Scaling group as the consumer means servers to manage.
- B is correct: S3 stores the documents durably for 18 months, and an event notification publishes a message to the SNS topic as soon as each document arrives.
- C is correct: an SQS queue subscribed to the topic buffers each message, and a Lambda function consumes the queue with no servers to manage.
- D is correct: a dead-letter queue keeps the messages for documents that the Lambda function fails to process, so they can be examined and retried.
- E is wrong: EC2 instances as consumers add patching and scaling work that Lambda avoids.
- F is wrong: Kinesis Data Streams keeps records for at most 365 days, so it cannot store documents for 18 months, and it is not a document store.

**Key phrases:** store uploaded documents durably for up to 18 months · as soon as users upload them · store any documents that fail to process · LEAST management overhead · THREE
**Hint:** Store the documents durably, start processing on upload, and keep failures. Which compute choice has the least to manage?

---

## DELTA-078: Cost Management & Optimization
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** medium · **Pillars:** Cost Optimization, Reliability
**Services:** EC2 › Spot Instances, EC2 Auto Scaling

### Question
A company runs a fleet of Amazon EC2 On-Demand Instances to support a document processing application that has variable usage patterns. The company wants to optimize compute costs for the application. The company needs a solution that can tolerate occasional disruptions to document processing jobs. Which solution will meet these requirements?

### Options
- **A.** Replace the EC2 instances with an Amazon EKS cluster that uses AWS Fargate Spot capacity.
- **B.** Use the EC2 Spot Instance placement score feature to identify which instance type to use. Deploy the application on Spot Instances.
- **C.** Create a single EC2 Auto Scaling group. Set a mixed configuration of EC2 On-Demand Instances and EC2 Spot Instances.
- **D.** Continue to use EC2 On-Demand Instances. Purchase Convertible Reserved Instances.

### Correct answer: C

**Summary:** Variable, interruption-tolerant workload: one Auto Scaling group with mixed instances (an On-Demand base plus Spot for the rest) to scale with demand at lower cost.

### Explanation
- A is wrong: Amazon EKS does not support Fargate Spot (it is available only for ECS), and moving to Kubernetes is a large change.
- B is wrong: the placement score only suggests where Spot capacity is likely; a fixed Spot fleet does not scale with the variable usage, and with no On-Demand base an interruption can stop all processing.
- C is correct: an Auto Scaling group adds and removes instances as usage changes, and a mixed configuration runs most of the fleet on discounted Spot Instances while an On-Demand base keeps jobs running when Spot capacity is reclaimed.
- D is wrong: Convertible Reserved Instances commit to a fixed amount of capacity for 1 or 3 years, which does not suit variable usage.

**Key phrases:** variable usage patterns · optimize compute costs · tolerate occasional disruptions
**Hint:** Two needs: the fleet has to follow variable usage, and occasional interruptions are acceptable but a total outage is not. Which option covers both?

---

## DELTA-079: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** easy · **Pillars:** Security, Reliability
**Services:** Shield › Shield Advanced, CloudFront

### Question
A retail company runs its application on AWS. The application uses Amazon EC2 for web servers, Amazon RDS for database services, and Amazon CloudFront for global content distribution. The company needs a solution to mitigate DDoS attacks. Which solution will meet this requirement?

### Options
- **A.** Implement AWS WAF custom rules to limit the length of query requests. Configure CloudFront to work with AWS WAF.
- **B.** Enable Amazon Macie. Configure CloudFront Origin Shield.
- **C.** Use Amazon Inspector to scan the EC2 instances. Enable Amazon GuardDuty.
- **D.** Enable AWS Shield Advanced. Configure CloudFront to work with Shield Advanced.

### Correct answer: D

**Summary:** DDoS protection for CloudFront-fronted apps = AWS Shield Advanced on the distribution (Shield Standard is always on).

### Explanation
- A is wrong: WAF rules help against application-layer floods but are not a DDoS mitigation service on their own, and limiting query length does not stop volumetric attacks.
- B is wrong: Macie finds sensitive data in S3, and Origin Shield is a caching layer, not DDoS protection.
- C is wrong: Inspector scans for software vulnerabilities and GuardDuty detects threats; neither mitigates DDoS traffic.
- D is correct: Shield Advanced protects CloudFront distributions against large network and application-layer DDoS attacks, adds automatic application-layer mitigation and access to the Shield Response Team, and covers scaling charges caused by an attack.

**Key phrases:** mitigate DDoS attacks
**Hint:** Several options are security services, but only one is built to absorb and mitigate attacks that flood the application.

---

## DELTA-080: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** medium · **Pillars:** Security, Cost Optimization
**Services:** VPC › PrivateLink & interface endpoints, ECR

### Question
A company runs containerized applications on Amazon ECS tasks in private subnets. The ECS tasks must retrieve container images from Amazon ECR and write application logs to Amazon CloudWatch Logs. The company needs all traffic between the ECS tasks and Amazon ECR and CloudWatch Logs to remain on the AWS network without using public IP addresses. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Create interface VPC endpoints for Amazon ECR and CloudWatch Logs. Route traffic from the ECS tasks through the VPC endpoints.
- **B.** Deploy a NAT gateway in each private subnet. Route traffic from the ECS tasks through the NAT gateways.
- **C.** Configure an internet gateway for the VPC. Attach the internet gateway to the private subnets to provide ECS task connectivity.
- **D.** Establish an AWS Direct Connect connection from the VPC to AWS services. Route traffic from the ECS tasks through the Direct Connect connection.

### Correct answer: A

**Summary:** Private ECS tasks pulling from ECR and logging to CloudWatch: interface endpoints (ecr.api, ecr.dkr, logs) plus an S3 gateway endpoint for image layers.

### Explanation
- A is correct: interface endpoints for ECR (api and dkr) and CloudWatch Logs give the tasks private IP addresses for those services inside the VPC, so no traffic uses public IP addresses; an S3 gateway endpoint, which is free, carries the image layers that ECR stores in S3.
- B is wrong: NAT gateways send the traffic to the services' public endpoints using public IP addresses, and they charge per hour and per GB.
- C is wrong: an internet gateway is attached to a VPC, not to subnets, and using it means public IP addresses.
- D is wrong: Direct Connect links on-premises networks to AWS; it does not connect a VPC to AWS services.

**Key phrases:** private subnets · remain on the AWS network without using public IP addresses · MOST cost-effectively
**Hint:** Private subnets, no public IPs, and traffic must stay on AWS. Which option reaches the services privately without a NAT gateway?

---

## DELTA-081: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Performance Efficiency
**Services:** Redshift, Glue › ETL jobs

### Question
A company has an application that scans millions of connected devices for security threats and pushes the scan logs to an Amazon S3 bucket. A total of 70 GB of data is generated each week, and the company needs to store 3 years of data for historical reporting. The company must process, aggregate, and enrich the data from Amazon S3 by performing complex analytical queries and joins in the least amount of time. The aggregated dataset is visualized on an Amazon QuickSight dashboard. What should a solutions architect recommend to meet these requirements?

### Options
- **A.** Create and run an ETL job in AWS Glue to process the data from Amazon S3 and load it into Amazon Redshift. Perform the aggregation queries on Amazon Redshift.
- **B.** Use AWS Lambda functions based on S3 PutObject event triggers to copy the incremental changes to Amazon DynamoDB. Perform the aggregation queries on DynamoDB.
- **C.** Use AWS Lambda functions based on S3 PutObject event triggers to copy the incremental changes to Amazon Aurora MySQL. Perform the aggregation queries on Aurora MySQL.
- **D.** Use AWS Glue to catalog the data in Amazon S3. Perform the aggregation queries on the cataloged tables by using Amazon Athena. Query the data directly from Amazon S3.

### Correct answer: A

**Summary:** Fastest complex joins and aggregations over years of S3 data: Glue ETL into Redshift, then QuickSight on Redshift.

### Explanation
- A is correct: Glue transforms and enriches the S3 data and loads it into Redshift, whose columnar, massively parallel engine runs complex joins and aggregations over years of data fastest, and QuickSight connects to Redshift directly.
- B is wrong: DynamoDB is a key-value store with no joins or complex analytical queries.
- C is wrong: Aurora MySQL is a transactional database; complex analytical joins over 3 years of data are slow on it.
- D is wrong: Athena works well for ad hoc queries, but it scans raw files in S3 for every query, so repeated complex joins and enrichment run slower than in a data warehouse.

**Key phrases:** complex analytical queries and joins · least amount of time · 3 years of data
**Hint:** Complex joins over years of data in the least time point to a purpose-built analytics engine. Which option loads the data into one?

---

## DELTA-082: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security, Operational Excellence
**Services:** Macie, EventBridge

### Question
A company temporarily stages transactional datasets in an Amazon S3 bucket before the company moves the datasets to their final destinations. Some datasets include personally identifiable information (PII). The company must remove PII data during staging before the company moves the datasets to their destinations. A solutions architect needs to configure Amazon Macie to continuously monitor the datasets. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Create an AWS Lambda function to launch an Amazon Macie discovery job when a new dataset is stored in the target S3 bucket if a Macie discovery job is not already running. Create a second Lambda function to remove the PII data that the Macie discovery job finds.
- **B.** Set up Amazon Macie automated sensitive data discovery. Create an AWS Lambda function to remove the PII data that Macie finds. Configure an Amazon EventBridge rule to invoke the Lambda function when Macie discovers PII data.
- **C.** Schedule a daily Amazon Macie discovery job. Create an AWS Lambda function to run once every day to remove the PII data that the daily Macie job finds.
- **D.** Create an AWS Lambda function that runs once each day to list all datasets that are saved to the S3 bucket every day. Call Amazon Macie on the list of datasets. Create a second Lambda function to remove the PII data that Macie finds. Configure an Amazon EventBridge rule to invoke the PII removal Lambda function every day.

### Correct answer: B

**Summary:** Continuous PII scanning in S3 = Macie automated sensitive data discovery; route its findings through EventBridge to a remediation Lambda.

### Explanation
- A is wrong: starting discovery jobs from a Lambda function on every upload means custom orchestration that automated discovery already does.
- B is correct: automated sensitive data discovery evaluates the bucket continuously, Macie publishes each finding to EventBridge, and a rule invokes the Lambda function that removes the PII.
- C is wrong: a daily job only checks once a day, so the monitoring is not continuous and datasets may move on before they are cleaned.
- D is wrong: listing datasets and calling Macie from a daily function is custom code, and it is still not continuous.

**Key phrases:** personally identifiable information (PII) · continuously monitor · LEAST operational overhead
**Hint:** Which Macie mode keeps evaluating the bucket by itself, and how can its findings start a clean-up automatically?

---

## DELTA-083: Databases & Caching
**Exam domain:** 1 · **Task:** 1.3 · **Difficulty:** medium · **Pillars:** Security
**Services:** RDS › Encryption, Certificate Manager

### Question
A research company stores trial data in an Amazon RDS for Oracle database. Researcher applications connect to the RDS for Oracle database to access the trial data. The company requires that trial data be encrypted in transit. Which solution will meet these requirements?

### Options
- **A.** Configure IAM database authentication for researcher application connections. Use AWS provided root certificates.
- **B.** Use AWS KMS with a customer managed key to encrypt the database storage layer.
- **C.** Create a snapshot of the RDS for Oracle database. Restore the snapshot to a new database with encryption enabled by using AWS KMS.
- **D.** Turn on SSL through the DB instance's option group, and configure the applications with the AWS-provided root certificates.

### Correct answer: D

**Summary:** Encryption in transit to RDS = SSL/TLS connections using the AWS-provided RDS root CA certificates in the clients; KMS covers data at rest.

### Explanation
- A is wrong: RDS for Oracle does not support IAM database authentication, and authentication alone does not encrypt the connection.
- B is wrong: a KMS key encrypts storage at rest; it does nothing for data moving over the network.
- C is wrong: restoring a snapshot with KMS encryption encrypts the data at rest, not the connections.
- D is correct: RDS for Oracle turns on SSL through the SSL option in the DB instance's option group, and applications configured with the AWS-provided root certificates open TLS connections and verify the server, which encrypts the trial data in transit.

**Key phrases:** encrypted in transit
**Hint:** In transit means the connection, not the storage. What must the clients have to verify a TLS connection to RDS?

---

## DELTA-084: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** easy · **Pillars:** Cost Optimization, Performance Efficiency
**Services:** CloudFront › Caching, Data transfer pricing

### Question
A company runs a public website. The website has static content stored in Amazon S3 and an application backend on Amazon EC2 instances that serves dynamic content. The company has noticed high monthly data transfer costs because of many repeated downloads of the same static content. The static content is updated every 3 months. The company wants to reduce the overall cost of the website without increasing latency for end users. Which solution will meet these requirements?

### Options
- **A.** Create an accelerator in AWS Global Accelerator. Create an S3 access point for the static content prefix. Route user traffic through the accelerator to the S3 access point endpoint.
- **B.** Create an Amazon CloudFront distribution that uses Amazon S3 as the origin for static content. Add the EC2 application as a second origin for dynamic content. Configure cache behaviors for static paths.
- **C.** Create an internet-facing Application Load Balancer (ALB) in front of the EC2 instances. Add an S3 gateway VPC endpoint for the VPC. Configure the application to retrieve static content from Amazon S3 by using the endpoint and to serve all requests from Amazon EC2.
- **D.** Create an accelerator in AWS Global Accelerator. Configure a listener and endpoint group that points to an internet-facing Application Load Balancer (ALB). Move the static content from Amazon S3 to the EC2 instances behind the ALB.

### Correct answer: B

**Summary:** Repeated downloads of static content = CloudFront with S3 as origin (plus the app as a second origin for dynamic paths).

### Explanation
- A is wrong: Global Accelerator speeds up the network path but does not cache content, so every download still comes from S3 and the transfer costs stay the same.
- B is correct: CloudFront caches the static files at edge locations, so repeated downloads are served from the cache instead of S3, data transfer from S3 to CloudFront is free, and dynamic requests still go to the EC2 origin through separate cache behaviors.
- C is wrong: serving everything from EC2 behind an ALB removes no transfer costs and adds load on the instances.
- D is wrong: moving static content onto EC2 and putting Global Accelerator in front still has no cache, so costs do not fall.

**Key phrases:** many repeated downloads of the same static content · updated every 3 months · without increasing latency
**Hint:** The same files are downloaded again and again and change only every 3 months. Which service keeps copies close to users?

---

## DELTA-085: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability
**Services:** Aurora › Global Database, Aurora › Replicas & failover

### Question
A company runs a database on Amazon Aurora in the us-east-1 Region. The company has a disaster recovery requirement that the database be available in another Region. Which solution meets this requirement with minimal disruption to the database operations?

### Options
- **A.** Perform an Aurora Multi-AZ deployment.
- **B.** Deploy Aurora cross-Region read replicas.
- **C.** Create Amazon EBS volume snapshots for Aurora and copy them to another Region.
- **D.** Deploy Aurora Replicas.

### Correct answer: B

**Summary:** Aurora copy in another Region without disruption = a cross-Region replica (today usually an Aurora Global Database secondary).

### Explanation
- A is wrong: Multi-AZ keeps copies in Availability Zones of the same Region only.
- B is correct: a cross-Region replica is created from the running cluster and replicates continuously to the other Region, where it can be promoted if us-east-1 fails; Aurora Global Database is the newer way to do the same with lower lag.
- C is wrong: Aurora does not use EBS volumes, so there are no EBS snapshots to copy.
- D is wrong: Aurora Replicas stay in the same Region as the primary.

**Key phrases:** available in another Region · minimal disruption
**Hint:** Only one option puts a copy of the database in another Region while the primary keeps running.

---

## DELTA-086: Storage & Backup
**Exam domain:** 4 · **Task:** 4.1 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** S3 › Storage Lens

### Question
A global company runs its applications in multiple AWS accounts in AWS Organizations. The company's applications use multipart uploads to upload data to multiple Amazon S3 buckets across AWS Regions. The company wants to report on incomplete multipart uploads for cost compliance purposes. Which solution will meet these requirements with the LEAST operational overhead?

### Options
- **A.** Configure AWS Config with a rule to report the incomplete multipart upload object count.
- **B.** Create a service control policy (SCP) to report the incomplete multipart upload object count.
- **C.** Configure S3 Storage Lens to report the incomplete multipart upload object count.
- **D.** Create an S3 Multi-Region Access Point to report the incomplete multipart upload object count.

### Correct answer: C

**Summary:** Organization-wide S3 usage metrics, including incomplete multipart upload bytes = S3 Storage Lens.

### Explanation
- A is wrong: AWS Config evaluates resource configurations; it does not count incomplete multipart uploads.
- B is wrong: SCPs restrict permissions; they report nothing.
- C is correct: S3 Storage Lens gives organization-wide metrics across all accounts and Regions, including incomplete multipart upload bytes and object counts, with no setup per bucket.
- D is wrong: Multi-Region Access Points route requests to buckets in several Regions; they do not report storage metrics.

**Key phrases:** multiple AWS accounts · incomplete multipart uploads · LEAST operational overhead
**Hint:** Which S3 feature reports storage metrics across accounts and Regions from one dashboard?

---

## DELTA-087: Compute & Serverless
**Exam domain:** 4 · **Task:** 4.2 · **Difficulty:** easy · **Pillars:** Cost Optimization, Performance Efficiency
**Services:** Lambda › Event sources, S3 › Event notifications

### Question
A company stores images that users upload in an Amazon S3 bucket. Upload volume varies from no files for several hours to hundreds of files within a few minutes. The company needs a solution that processes each image independently as the image arrives in the S3 bucket. Image processing will take fewer than 2 minutes to complete. The company does not want to pay for idle capacity. The solution must scale automatically based on demand. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Configure an AWS Lambda function that processes the images when S3 new object created events occur.
- **B.** Configure Amazon EventBridge to detect new images in the S3 bucket and start an Amazon ECS task on AWS Fargate for each image.
- **C.** Configure an Auto Scaling group of Amazon EC2 instances to poll the S3 bucket for new images and process the images as they are found.
- **D.** Configure AWS Batch to run every 15 minutes on Spot Instances and process any new images that have been uploaded to the S3 bucket.

### Correct answer: A

**Summary:** Short per-object processing on S3 upload with bursty traffic = S3 event notification → Lambda.

### Explanation
- A is correct: S3 invokes the Lambda function for each new object, Lambda scales with the number of uploads and runs each 2-minute job well within its 15-minute limit, and it costs nothing while no files arrive.
- B is wrong: a Fargate task per image works, but each task takes much longer to start and has a higher minimum charge than a Lambda invocation, so it costs more for short jobs.
- C is wrong: an Auto Scaling group polling the bucket keeps instances running during idle hours and adds scaling delays.
- D is wrong: running every 15 minutes does not process images as they arrive.

**Key phrases:** processes each image independently · fewer than 2 minutes · does not want to pay for idle capacity · MOST cost-effectively
**Hint:** Short jobs, bursty arrivals, no idle cost. Which compute is billed only while each image is processed and starts directly from an S3 event?

---

## DELTA-088: Analytics & Data Processing
**Exam domain:** 3 · **Task:** 3.5 · **Difficulty:** medium · **Pillars:** Cost Optimization
**Services:** Athena › Partitioning & formats

### Question
A weather forecasting company collects temperature readings from various sensors on a continuous basis. An existing data ingestion process collects the readings and aggregates the readings into larger Apache Parquet files. Then the process encrypts the files by using client-side encryption with KMS managed keys (CSE-KMS). Finally, the process writes the files to an Amazon S3 bucket with separate prefixes for each calendar day. The company wants to run occasional SQL queries on the data to take sample moving averages for a specific calendar day. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Configure Amazon Athena to read the encrypted files. Run SQL queries on the data directly in Amazon S3.
- **B.** Use Amazon S3 Storage Lens to run SQL queries on the data directly in Amazon S3.
- **C.** Configure Amazon Redshift to read the encrypted files. Use Redshift Spectrum and Redshift query editor v2 to run SQL queries on the data directly in Amazon S3.
- **D.** Configure Amazon EMR Serverless to read the encrypted files. Use Apache SparkSQL to run SQL queries on the data directly in Amazon S3.

### Correct answer: A

**Summary:** Occasional SQL on partitioned Parquet in S3 (even CSE-KMS encrypted) = Athena: serverless and billed per data scanned.

### Explanation
- A is correct: Athena supports CSE-KMS encrypted data through its table properties, queries the Parquet files in place, reads only the day's prefix when the table is partitioned by day, and bills only for the data scanned by these occasional queries.
- B is wrong: S3 Storage Lens reports storage metrics; it cannot run SQL queries on object data.
- C is wrong: Redshift Spectrum cannot read client-side encrypted objects, and keeping a Redshift cluster for occasional queries adds cost.
- D is wrong: EMR Serverless with Spark SQL can read the data, but starting Spark applications for occasional sample queries costs more and takes more setup than Athena.

**Key phrases:** Apache Parquet · client-side encryption with KMS managed keys (CSE-KMS) · occasional SQL queries · MOST cost-effectively
**Hint:** Occasional SQL on Parquet files already split by day. Which serverless engine bills per query and can decrypt CSE-KMS objects?

---

## DELTA-089: Databases & Caching
**Exam domain:** 3 · **Task:** 3.3 · **Difficulty:** easy · **Pillars:** Reliability, Performance Efficiency
**Services:** RDS › RDS Proxy, Lambda

### Question
A company has a web application that uses Amazon API Gateway to route HTTPS requests to AWS Lambda functions. The application uses an Amazon Aurora MySQL database for its data storage. The application has experienced unpredictable surges in traffic that overwhelm the database with too many connection requests. The company wants to implement a scalable solution that is more resilient to database failures. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Create an Amazon RDS proxy for the database. Replace the database endpoint with the proxy endpoint in the Lambda functions.
- **B.** Migrate the database to Amazon DynamoDB tables by using AWS DMS.
- **C.** Review the existing connections. Call MySQL queries to end any connections in the sleep state.
- **D.** Increase the instance class of the database with more memory. Set a larger value for the max_connections parameter.

### Correct answer: A

**Summary:** Lambda bursts exhausting database connections = RDS Proxy: pools connections and speeds up failover.

### Explanation
- A is correct: RDS Proxy pools and shares connections so Lambda bursts do not overwhelm Aurora, and during a failover it keeps client connections open and routes to the new writer, which makes the app more resilient.
- B is wrong: moving to DynamoDB is a full redesign of a relational application.
- C is wrong: ending idle connections by hand is a temporary fix that does nothing for the next surge.
- D is wrong: a larger instance with a higher connection limit costs more and still fails when surges exceed the new limit.

**Key phrases:** too many connection requests · more resilient to database failures · MOST cost-effectively
**Hint:** Many short-lived Lambda invocations open many connections. What pools and reuses them in front of Aurora?

---

## DELTA-090: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability
**Services:** Aurora › Global Database, DR strategies › RPO & RTO

### Question
A company uses an Amazon Aurora PostgreSQL DB cluster to store its critical data in the us-east-1 Region. The company wants to develop a disaster recovery plan to recover the database in the us-west-1 Region. The company has a recovery time objective (RTO) of 5 minutes and has a recovery point objective (RPO) of 1 minute. What should a solutions architect do to meet these requirements?

### Options
- **A.** Create a read replica in us-west-1. Set the DB cluster to automatically fail over to the read replica if the primary instance is not responding.
- **B.** Create an Aurora global database. Set us-west-1 as the secondary Region. Update connections to use the writer and reader endpoints as appropriate.
- **C.** Set up a second Aurora DB cluster in us-west-1. Use logical replication to keep the databases synchronized. Create an Amazon EventBridge rule to change the database endpoint if the primary DB cluster does not respond.
- **D.** Use Aurora automated snapshots to store data in an Amazon S3 bucket. Enable S3 Versioning. Configure S3 Cross-Region Replication to us-west-1. Create a second Aurora DB cluster in us-west-1. Create an Amazon EventBridge rule to restore the snapshot if the primary DB cluster does not respond.

### Correct answer: B

**Summary:** Cross-Region Aurora DR with RPO in seconds and RTO in minutes = Aurora Global Database.

### Explanation
- A is wrong: an Aurora cluster does not fail over to a cross-Region read replica automatically; promoting it is a manual step.
- B is correct: an Aurora global database replicates to us-west-1 at the storage layer with lag usually under a second, and the secondary can be promoted through a managed failover within minutes, meeting both the RPO and the RTO.
- C is wrong: logical replication between two separate clusters plus a custom EventBridge switch is complex to run, can fall behind, and needs custom failure detection.
- D is wrong: restoring a snapshot takes far longer than 5 minutes and loses everything since the last snapshot, and Aurora snapshots are not stored in a bucket the customer can replicate.

**Key phrases:** recovery time objective (RTO) of 5 minutes · recovery point objective (RPO) of 1 minute · us-west-1
**Hint:** An RPO of 1 minute and RTO of 5 minutes across Regions. Which Aurora feature replicates at the storage layer with sub-second lag and supports managed failover?

---

## DELTA-091: Compute & Serverless
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Operational Excellence, Reliability
**Services:** EC2 Auto Scaling › Instance refresh, EC2 › AMIs, Systems Manager › Parameter Store

### Question
A company runs a fleet of Amazon EC2 instances in an Auto Scaling group behind an Application Load Balancer. The company needs all instances to run Amazon Machine Images (AMIs) patched with the most recent operating system updates within 30 days of patch release. The updates must occur automatically and with zero downtime during rollout. Which combination of steps will meet these requirements? (Select TWO.)

### Options
- **A.** Use EC2 Image Builder on a monthly schedule to patch, validate, and output a new AMI. Store the AMI ID in AWS Systems Manager Parameter Store to update the launch template.
- **B.** Use AWS Systems Manager Patch Manager to patch all running instances simultaneously during a maintenance window scheduled for off-peak hours.
- **C.** Configure an Auto Scaling group instance refresh that sets the minimum healthy percentage to 100%. Configure the Auto Scaling group to reference the updated launch template that has the new AMI ID.
- **D.** Configure an Auto Scaling instance refresh that sets the minimum healthy percentage to 0% to replace all instances as quickly as possible.
- **E.** Create a new launch template version that uses the patched AMI. Manually terminate one instance at a time. Wait for the Auto Scaling group to replace the instances.

### Correct answers: A, C (choose 2)

**Summary:** Monthly golden AMIs with zero downtime: EC2 Image Builder builds the patched AMI, then an instance refresh with 100% minimum healthy rolls it out.

### Explanation
- A is correct: an EC2 Image Builder pipeline on a monthly schedule patches, tests and outputs a new AMI automatically, and storing its ID in Parameter Store lets the launch template pick up the latest image.
- B is wrong: patching every running instance at the same time can take them all down together, so there is no zero-downtime guarantee, and new instances still launch from the old AMI.
- C is correct: an instance refresh with a minimum healthy percentage of 100% launches new instances from the updated launch template before terminating old ones, so capacity never drops during the rollout.
- D is wrong: a minimum healthy percentage of 0% lets every instance be replaced at once, which causes downtime.
- E is wrong: terminating instances by hand is not automatic and briefly lowers capacity.

**Key phrases:** within 30 days of patch release · automatically and with zero downtime · TWO
**Hint:** Two steps: build a patched image automatically, then replace the instances without ever dropping capacity.

---

## DELTA-092: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.2 · **Difficulty:** medium · **Pillars:** Security
**Services:** Cognito › User pools, WAF, API Gateway › Authorizers

### Question
A solutions architect needs to secure an Amazon API Gateway REST API. Users need to be able to log in to the API by using common external social identity providers (IdPs). The social IdPs must use standard authentication protocols such as SAML or OpenID Connect (OIDC). The solutions architect needs to protect the API against attempts to exploit application vulnerabilities. Which combination of steps will meet these security requirements? (Select TWO.)

### Options
- **A.** Create an AWS WAF web ACL that is associated with the REST API. Add the appropriate managed rules to the ACL.
- **B.** Subscribe to AWS Shield Advanced. Enable DDoS protection. Associate Shield Advanced with the REST API.
- **C.** Create an Amazon Cognito user pool with a federation to the social IdPs. Integrate the user pool with the REST API.
- **D.** Create an API key in API Gateway. Associate the API key with the REST API.
- **E.** Create an IP address filter in AWS WAF that allows only the social IdPs. Associate the filter with the web ACL and the API.

### Correct answers: A, C (choose 2)

**Summary:** Secure an API Gateway REST API: Cognito user pool (federated social/SAML/OIDC sign-in) as the authorizer + AWS WAF managed rules against exploits.

### Explanation
- A is correct: an AWS WAF web ACL on the REST API with managed rule groups (such as the core rule set and SQL injection rules) blocks attempts to exploit common application vulnerabilities.
- B is wrong: Shield Advanced protects against DDoS attacks, not against requests that exploit application vulnerabilities, and it has nothing to do with sign-in.
- C is correct: a Cognito user pool federates with social IdPs over OIDC or SAML, and a Cognito authorizer on the REST API accepts only users who have signed in.
- D is wrong: API keys identify clients for usage plans; they do not authenticate users.
- E is wrong: allowing only the IdPs' IP addresses would block the users themselves, because users call the API from their own addresses.

**Key phrases:** social identity providers (IdPs) · SAML or OpenID Connect (OIDC) · exploit application vulnerabilities · TWO
**Hint:** One requirement is login through social providers; the other is blocking exploit attempts such as SQL injection. Which two services cover these?

---

## DELTA-093: Databases & Caching
**Exam domain:** 4 · **Task:** 4.3 · **Difficulty:** medium · **Pillars:** Cost Optimization
**Services:** RDS › Backups & PITR

### Question
A company conducts disaster recovery (DR) drills that require a dedicated Amazon RDS for MySQL DB instance that has Performance Insights enabled. Each drill runs for 72 hours one time each quarter. The drill is the only process that uses the database. The company wants to reduce the cost of running the drills without reducing the compute and memory attributes of the DB instance. Which solution will meet these requirements MOST cost-effectively?

### Options
- **A.** Stop the DB instance when the drills are completed. Restart the DB instance when required.
- **B.** Use an Auto Scaling policy on the DB instance to automatically scale when drills are completed.
- **C.** Create a snapshot when drills are completed. Delete the DB instance and restore the snapshot when required.
- **D.** Modify the DB instance to a low-capacity instance when drills are completed. Modify the DB instance back to the original capacity when required.

### Correct answer: C

**Summary:** An RDS database used a few days a quarter: snapshot and delete it after each use, restore it (same class) when needed.

### Explanation
- A is wrong: RDS starts a stopped instance automatically after 7 days, so it would run, and be billed, for most of the quarter unless someone keeps stopping it.
- B is wrong: RDS has no Auto Scaling policy that changes the compute of a DB instance; storage autoscaling only grows storage.
- C is correct: after each drill, a final snapshot keeps the data and deleting the instance stops all instance charges; before the next drill, restoring the snapshot recreates the instance with the same class, and Performance Insights is turned on again.
- D is wrong: a smaller instance still runs and is billed all quarter, and resizing twice per drill causes downtime.

**Key phrases:** 72 hours one time each quarter · without reducing the compute and memory attributes · MOST cost-effectively
**Hint:** The database is idle about 87 days a quarter. A stopped RDS instance restarts by itself after 7 days. What leaves only cheap storage to pay for?

---

## DELTA-094: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** easy · **Pillars:** Performance Efficiency
**Services:** FSx › Lustre

### Question
A solutions architect for a media company needs to design a storage solution for a video editing application. The application runs on Amazon Linux based Amazon EC2 instances. The application requires sub-millisecond latency and must have access to 500 TB of video data. The data must also be available from multiple EC2 instances simultaneously. Which solution will meet these requirements?

### Options
- **A.** Deploy an Amazon S3 bucket. Use S3 access points to provide access to the EC2 instances.
- **B.** Configure an Amazon FSx for Lustre file system with SSD storage.
- **C.** Deploy a Provisioned IOPS SSD (io2) Amazon EBS volume.
- **D.** Configure an Amazon EFS file system in Max I/O performance mode.

### Correct answer: B

**Summary:** High-performance shared storage for Linux at sub-millisecond latency and large scale = FSx for Lustre (SSD).

### Explanation
- A is wrong: S3 is object storage with latency well above a millisecond, and access points only control access.
- B is correct: FSx for Lustre on SSD storage gives Linux clients a shared POSIX file system with sub-millisecond latency and scales to hundreds of TB and beyond.
- C is wrong: an io2 volume normally attaches to one instance (Multi-Attach works only for instances in the same Availability Zone and needs a cluster-aware file system), and a single volume is far smaller than 500 TB.
- D is wrong: EFS Max I/O mode trades higher latency for more parallelism, so it does not give sub-millisecond latency.

**Key phrases:** Amazon Linux based · sub-millisecond latency · 500 TB · multiple EC2 instances simultaneously
**Hint:** Linux clients, a shared file system, sub-millisecond latency, and hundreds of TB. Which file system is built for that?

---

## DELTA-095: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** hard · **Pillars:** Reliability
**Services:** Route 53 › Failover & health checks, CloudWatch › Alarms

### Question
A company hosts internal microservices on private Application Load Balancers (ALBs) in a VPC. The company requires automated failover when the registered targets of the internal ALBs become unhealthy. The ALBs do not have public endpoints. Which solution will meet these requirements?

### Options
- **A.** Create Amazon Route 53 health checks that monitor each ALB's private IP address.
- **B.** Create Amazon Route 53 health checks that monitor Amazon CloudWatch alarms for target group health.
- **C.** Configure the ALBs as internet-facing to enable Amazon Route 53 endpoint health checks.
- **D.** Create Amazon Route 53 health checks that monitor the ALB DNS names directly.

### Correct answer: B

**Summary:** Health checks for private resources: create a CloudWatch alarm (e.g. on healthy host count) and point a Route 53 health check at the alarm.

### Explanation
- A is wrong: Route 53 health checkers run on the internet and cannot reach private IP addresses.
- B is correct: a CloudWatch alarm on the target group's health (such as HealthyHostCount) reflects the internal ALB's state, and a Route 53 health check based on that alarm drives failover without the health checkers needing to reach the ALB.
- C is wrong: making internal microservices internet-facing exposes them and breaks the requirement that the ALBs have no public endpoints.
- D is wrong: an internal ALB's DNS name resolves to private IP addresses, which Route 53 health checkers cannot reach, so the check would always fail.

**Key phrases:** private Application Load Balancers (ALBs) · automated failover · do not have public endpoints
**Hint:** Route 53 health checkers run on the public internet. How can a health check judge a resource it cannot reach?

---

## DELTA-096: Security, Identity & Compliance
**Exam domain:** 1 · **Task:** 1.1 · **Difficulty:** easy · **Pillars:** Security
**Services:** Secrets Manager, IAM › Roles

### Question
A company runs an application on Amazon EC2 instances. The instances need to access an Amazon RDS database by using specific credentials. The company uses AWS Secrets Manager to contain the credentials the EC2 instances must use. Which solution will meet this requirement?

### Options
- **A.** Create an IAM role, and attach the role to each EC2 instance profile. Use an identity-based policy to grant the new IAM role access to the secret that contains the database credentials.
- **B.** Create an IAM user, and attach the user to each EC2 instance profile. Use a resource-based policy to grant the new IAM user access to the secret that contains the database credentials.
- **C.** Create a resource-based policy for the secret that contains the database credentials. Use EC2 Instance Connect to access the secret.
- **D.** Create an identity-based policy for the secret that contains the database credentials. Grant direct access to the EC2 instances.

### Correct answer: A

**Summary:** EC2 reading a Secrets Manager secret: an IAM role in the instance profile with a policy allowing GetSecretValue on that secret.

### Explanation
- A is correct: an IAM role attached through the instance profile gives the applications temporary credentials, and an identity-based policy that allows reading this secret lets them retrieve the database credentials.
- B is wrong: IAM users cannot be attached to an instance profile; only roles can.
- C is wrong: EC2 Instance Connect opens SSH sessions to instances; it cannot retrieve secrets, and the instances would still have no identity to match a resource policy.
- D is wrong: identity-based policies attach to IAM identities, not to secrets or directly to EC2 instances.

**Key phrases:** specific credentials · AWS Secrets Manager
**Hint:** How do applications on EC2 get AWS permissions without stored keys, and what grants access to one secret?

---

## DELTA-097: Databases & Caching
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** hard · **Pillars:** Reliability, Performance Efficiency
**Services:** RDS › Multi-AZ, RDS › Read replicas

### Question
A company needs to deploy a highly available PostgreSQL database that has failover capabilities. The company wants to offload read traffic to replica instances. The company wants to use a burstable instance class in a development environment. Which solution will meet these requirements?

### Options
- **A.** Create an Amazon RDS for PostgreSQL Multi-AZ instance. When the instance is available, add a replica instance to the instance.
- **B.** Create an Amazon RDS for PostgreSQL Multi-AZ instance. Use a reader endpoint in the standby instance.
- **C.** Create an Amazon RDS for PostgreSQL Multi-AZ cluster deployment.
- **D.** Create an Amazon RDS for PostgreSQL Single-AZ instance. Add a read replica to the instance in a different Availability Zone.

### Correct answer: A

**Summary:** Multi-AZ DB clusters don't support burstable classes; with db.t classes, use a Multi-AZ DB instance plus read replicas.

### Explanation
- A is correct: a Multi-AZ DB instance deployment fails over automatically to its standby, a read replica takes the read traffic, and both support burstable db.t instance classes.
- B is wrong: the standby of a Multi-AZ DB instance deployment cannot serve reads and has no reader endpoint.
- C is wrong: a Multi-AZ DB cluster has readable standbys, but it supports only specific instance classes with local NVMe storage and no burstable classes.
- D is wrong: a Single-AZ primary has no automatic failover; promoting the read replica is a manual step.

**Key phrases:** failover capabilities · offload read traffic to replica instances · burstable instance class
**Hint:** All options are PostgreSQL. Which one gives automatic failover AND readable replicas, and still lets you choose a burstable db.t class?

---

## DELTA-098: Storage & Backup
**Exam domain:** 3 · **Task:** 3.1 · **Difficulty:** medium · **Pillars:** Performance Efficiency
**Services:** EBS › Volume types

### Question
A financial services company needs to migrate an on-premises MySQL database workload to AWS. The database requires consistent low-latency performance with a baseline of 32,000 IOPS to process transactions. Which solution will meet these requirements?

### Options
- **A.** Migrate the database to an Amazon S3 bucket. Enable S3 Transfer Acceleration.
- **B.** Migrate the data to a Provisioned IOPS SSD (io2) Block Express Amazon EBS volume.
- **C.** Migrate the data to an Amazon EFS Standard file system.
- **D.** Migrate the data to a General Purpose SSD (gp3) Amazon EBS volume.

### Correct answer: B

**Summary:** Critical database needing high, consistent IOPS at low latency = Provisioned IOPS SSD io2 Block Express.

### Explanation
- A is wrong: S3 is object storage and cannot host a MySQL database's data files.
- B is correct: io2 Block Express volumes are built for critical transactional databases: they deliver the provisioned IOPS consistently with sub-millisecond latency and high durability.
- C is wrong: EFS is network file storage with higher, more variable latency, which does not suit a database needing consistent low latency.
- D is wrong: gp3 volumes can now be provisioned with up to 80,000 IOPS, so IOPS alone is not the problem, but gp3 is designed for single-digit millisecond latency, while io2 Block Express delivers the consistent sub-millisecond latency a critical transactional database needs.

**Key phrases:** consistent low-latency performance · baseline of 32,000 IOPS
**Hint:** Which EBS volume type is built for consistent low latency at a high IOPS baseline for critical databases?

---

## DELTA-099: Compute & Serverless
**Exam domain:** 3 · **Task:** 3.2 · **Difficulty:** easy · **Pillars:** Performance Efficiency
**Services:** EC2 Auto Scaling › Target tracking

### Question
A company runs multiple web applications on Amazon EC2 instances behind a single Application Load Balancer (ALB). The application experiences unpredictable traffic spikes throughout each day. The traffic spikes cause high latency. The unpredictable spikes last less than 3 hours. The company needs a solution to resolve the latency issue caused by traffic spikes. Which solution will meet this requirement?

### Options
- **A.** Use EC2 instances in an Auto Scaling group. Configure the ALB and Auto Scaling group to use a target tracking scaling policy.
- **B.** Use EC2 Reserved Instances in an Auto Scaling group. Configure the Auto Scaling group to use a scheduled scaling policy based on peak traffic hours.
- **C.** Use EC2 Spot Instances in an Auto Scaling group. Configure the Auto Scaling group to use a scheduled scaling policy based on peak traffic hours.
- **D.** Use EC2 Reserved Instances in an Auto Scaling group. Replace the ALB with a Network Load Balancer (NLB).

### Correct answer: A

**Summary:** Unpredictable spikes = dynamic scaling (target tracking on a load metric), not scheduled scaling.

### Explanation
- A is correct: a target tracking policy (for example on CPU or ALB requests per target) adds instances as soon as load rises and removes them afterwards, whenever the spikes happen.
- B is wrong: scheduled scaling cannot follow spikes that happen at unpredictable times, and Reserved Instances do not change capacity.
- C is wrong: scheduled scaling cannot follow unpredictable spikes, and Spot Instances can be interrupted during a spike.
- D is wrong: a Network Load Balancer does not add capacity, and the web applications may depend on ALB features.

**Key phrases:** unpredictable traffic spikes · less than 3 hours · resolve the latency issue
**Hint:** A schedule only works when you know when the spikes come. These are unpredictable.

---

## DELTA-100: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** hard · **Pillars:** Reliability, Operational Excellence
**Services:** EC2 Auto Scaling, Elastic Load Balancing › ALB, Elastic Load Balancing › NLB

### Question
A company runs an application on Amazon EC2 instances in an Auto Scaling group behind a Network Load Balancer (NLB). The application returns HTTP 503 errors when internal service dependencies fail. The application maintains TCP connections to the NLB during these failures. The company terminates affected EC2 instances daily. The company needs to automatically detect application failures and instance replacement without building custom monitoring solutions. Which solution will meet these requirements?

### Options
- **A.** Configure HTTP health checks on the NLB that target the application endpoint URL.
- **B.** Create an AWS Lambda function that queries application logs every minute. Configure the Lambda function to terminate EC2 instances that return HTTP errors.
- **C.** Replace the NLB with an Application Load Balancer (ALB). Configure HTTP health checks that target the application endpoint URL. Configure the Auto Scaling group to use ELB health checks to replace unhealthy instances.
- **D.** Create an Amazon CloudWatch alarm that monitors the UnHealthyHostCount metric for the NLB target group. Configure an Auto Scaling policy to terminate instances when the alarm triggers.

### Correct answer: C

**Summary:** Replace instances whose app fails while TCP stays up: HTTP health checks on the load balancer + ELB health checks on the Auto Scaling group.

### Explanation
- A is wrong: HTTP health checks on the NLB would detect the 503s, but on their own they only stop traffic to the instance; without ELB health checks on the Auto Scaling group, nothing replaces it.
- B is wrong: a Lambda function that reads logs and terminates instances is the custom monitoring the company wants to avoid.
- C is correct: ALB HTTP health checks mark an instance unhealthy when the endpoint returns 503, and with ELB health checks turned on, the Auto Scaling group terminates and replaces that instance automatically.
- D is wrong: with TCP health checks the targets still look healthy, and a scaling policy changes the group's capacity without targeting the failing instances.

**Key phrases:** HTTP 503 errors · maintains TCP connections · without building custom monitoring solutions
**Hint:** TCP stays up while the app returns 503s. What kind of health check sees that, and what makes Auto Scaling replace the instance?

---

## DELTA-101: Networking & Content Delivery
**Exam domain:** 4 · **Task:** 4.4 · **Difficulty:** easy · **Pillars:** Cost Optimization
**Services:** VPC › Gateway endpoints, VPC › NAT gateways

### Question
A company has an image processing workload running on Amazon ECS in two private subnets. Each private subnet uses a NAT instance for internet access. All images are stored in Amazon S3 buckets. The company is concerned about the data transfer costs between Amazon ECS and Amazon S3. What should a solutions architect do to reduce costs?

### Options
- **A.** Configure a NAT gateway to replace the NAT instances.
- **B.** Configure a gateway endpoint for traffic destined to Amazon S3.
- **C.** Configure an interface endpoint for traffic destined to Amazon S3.
- **D.** Configure Amazon CloudFront for the S3 bucket storing the images.

### Correct answer: B

**Summary:** Cut NAT costs for S3 traffic from private subnets = S3 gateway endpoint (free).

### Explanation
- A is wrong: a NAT gateway adds hourly and per-GB processing charges, so S3 traffic would cost more, not less.
- B is correct: an S3 gateway endpoint routes S3 traffic straight from the private subnets to S3 with no endpoint charge, bypassing the NAT instances.
- C is wrong: an interface endpoint also bypasses NAT but charges per hour per AZ and per GB.
- D is wrong: CloudFront delivers content to users; it does not change how the ECS tasks reach S3.

**Key phrases:** NAT instance · data transfer costs between Amazon ECS and Amazon S3 · reduce costs
**Hint:** Both endpoint types would bypass the NAT instances. Which one adds no charge of its own?

---

## DELTA-102: Disaster Recovery & Migration
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Cost Optimization
**Services:** Elastic Disaster Recovery, DR strategies › RPO & RTO

### Question
A company runs 120 Windows and Linux servers on VMware in its only data center. It wants to use AWS as its disaster recovery site with an RPO of seconds and an RTO of under an hour, and it does not want to pay for full-size servers in AWS until a disaster happens. It also wants to run recovery drills without disrupting the source servers. Which solution meets these requirements MOST cost-effectively?

### Options
- **A.** Replicate every server with AWS Application Migration Service and complete the cutover to Amazon EC2 so that a copy of each server is already running in AWS.
- **B.** Export nightly VM snapshots to Amazon S3 with VM Import/Export, and import them as AMIs to launch instances when a disaster is declared.
- **C.** Install the AWS Elastic Disaster Recovery agent on each server to replicate continuously to low-cost staging, and launch recovery instances only when needed.
- **D.** Run a matching set of right-sized EC2 instances in AWS around the clock and keep them in sync with rsync jobs that run every 5 minutes.

### Correct answer: C

**Summary:** On-premises servers with AWS as the DR site: AWS Elastic Disaster Recovery replicates continuously to low-cost staging (RPO in seconds) and launches full instances only for drills or a disaster.

### Explanation
- A is wrong: Application Migration Service is built to move servers to AWS for good; completing the cutover runs the whole fleet in AWS all the time, which is a migration, not a low-cost recovery site.
- B is wrong: nightly exports allow up to a day of data loss, and importing 120 images during a disaster takes far longer than an hour.
- C is correct: Elastic Disaster Recovery replicates block-level changes continuously, which gives an RPO of seconds, keeps only lightweight staging resources and low-cost storage running, launches full recovery instances within minutes, and supports drills that leave the source servers untouched.
- D is wrong: running every server all the time is the most expensive option, rsync gives an RPO of minutes rather than seconds, and the scripts are custom work to maintain.

**Key phrases:** 120 Windows and Linux servers on VMware · RPO of seconds · RTO of under an hour · does not want to pay for full-size servers · without disrupting the source servers · MOST cost-effectively
**Hint:** The recovery site should cost little until it is needed, yet hold data that is only seconds old.

---

## DELTA-103: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence
**Services:** Route 53 › Routing policies

### Question
A company runs version 1 of its web application behind an Application Load Balancer and has deployed version 2 behind a second Application Load Balancer in the same Region. It wants to send 10% of users to version 2, raise that share gradually over a week, and roll back to version 1 within minutes if errors rise, without changing the application or the clients. The domain is hosted in Amazon Route 53. What should a solutions architect do?

### Options
- **A.** Create failover records with the version 1 load balancer as primary and the version 2 load balancer as secondary, and attach a health check to version 1.
- **B.** Create latency-based records for the two load balancers so that each user is sent to whichever version answers faster.
- **C.** Create weighted alias records for the two load balancers with weights of 90 and 10, and change the weights to shift traffic or to roll back.
- **D.** Create multivalue answer records that return the IP addresses of both load balancers so that clients pick one at random.

### Correct answer: C

**Summary:** Canary or blue/green between two endpoints through DNS: Route 53 weighted records; change the weights to shift traffic and set the new version to 0 to roll back.

### Explanation
- A is wrong: failover routing sends every user to the primary while it is healthy, so it cannot send a chosen share of users to version 2.
- B is wrong: both versions run in the same Region, so latency routing gives no control over the share of users, and the split would follow network conditions rather than the plan.
- C is correct: weighted routing answers with each record in proportion to its weight, so the split is set and changed in Route 53 alone, and a weight of 0 for version 2 sends everyone back to version 1 once cached answers expire, about a minute for load balancer alias records.
- D is wrong: multivalue answers are returned at random with no weighting, and a load balancer's IP addresses change, so the records would need constant updates.

**Key phrases:** 10% of users to version 2 · raise that share gradually · roll back to version 1 within minutes · without changing the application or the clients
**Hint:** The rollout needs a share of traffic that you set and change yourself, not a decision based on health or location.

---

## DELTA-104: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.1 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence
**Services:** EC2 Auto Scaling › Warm pools & lifecycle hooks

### Question
An Auto Scaling group behind an Application Load Balancer launches instances that must download a 5 GB model file and register with a third-party license server before they can serve requests, which takes up to 8 minutes. Today new instances join the target group and fail requests until that setup finishes. What should a solutions architect do so that instances receive traffic only after setup has completed?

### Options
- **A.** Increase the Auto Scaling group's health check grace period to 10 minutes so that new instances are not judged during setup.
- **B.** Set the Auto Scaling group's default instance warmup to 8 minutes so that new instances finish their setup before they count.
- **C.** Increase the target group's deregistration delay to 8 minutes so that instances get more time before traffic reaches them.
- **D.** Add a launch lifecycle hook so new instances wait in Pending:Wait until the setup script calls CompleteLifecycleAction.

### Correct answer: D

**Summary:** Instances that need setup before serving: a launch lifecycle hook holds them in Pending:Wait until CompleteLifecycleAction, so they join the load balancer only when ready.

### Explanation
- A is wrong: the grace period only delays health-check-based replacement; the new instance is still registered and receives requests while its setup runs.
- B is wrong: instance warmup only decides when a new instance's metrics count toward scaling decisions; it does not keep the instance out of the target group.
- C is wrong: the deregistration delay controls how long instances that are being removed finish in-flight requests; it does nothing for new instances.
- D is correct: an instance waiting in Pending:Wait is not yet InService, so the group registers it with the target group only after the setup script completes the lifecycle action, and an instance whose setup fails can be abandoned instead.

**Key phrases:** 5 GB model file · register with a third-party license server · up to 8 minutes · fail requests until that setup finishes · only after setup has completed
**Hint:** The fix has to keep a new instance from being put into service until its own setup reports success.

---

## DELTA-105: Compute & Serverless
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability
**Services:** EC2 › Placement groups & EFA

### Question
A company runs a seven-node distributed coordination service on Amazon EC2. The vendor requires all nodes to run in one Availability Zone. The service loses quorum if more than three nodes fail at the same time, and a recent failure of the underlying hardware took down several nodes together. What should a solutions architect do to reduce the chance that one hardware failure affects several nodes?

### Options
- **A.** Launch the nodes in a cluster placement group so that they share a low-latency network segment.
- **B.** Launch the nodes in a spread placement group so that each one runs on distinct underlying hardware.
- **C.** Launch the nodes in a partition placement group that has a single partition.
- **D.** Run all seven nodes on one Dedicated Host so that no other customer shares the hardware.

### Correct answer: B

**Summary:** Keep a few critical instances on separate hardware: a spread placement group (up to 7 instances per AZ on distinct racks); a cluster placement group packs them together.

### Explanation
- A is wrong: a cluster placement group packs instances close together for low latency, which raises the chance that one failure hits several nodes.
- B is correct: a spread placement group puts each instance on a separate rack with its own network and power source, up to seven instances per Availability Zone, so one hardware failure affects at most one node.
- C is wrong: with only one partition every node shares the same set of racks, so the group gives no hardware separation.
- D is wrong: a Dedicated Host is a single physical server, so one hardware failure would take down every node at once.

**Key phrases:** seven-node · all nodes to run in one Availability Zone · loses quorum · took down several nodes together
**Hint:** Placement groups can either pack instances together or keep them apart. Which arrangement limits what one hardware failure can take down?

---

## DELTA-106: Storage & Backup
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability, Operational Excellence
**Services:** EBS › Snapshots

### Question
A company runs a self-managed database on Amazon EC2 with its data on Amazon EBS volumes in us-east-1. For disaster recovery it needs a snapshot of each tagged volume every 4 hours, kept for 7 days in us-east-1 and copied automatically to us-west-2, where the copies are kept for 30 days. The team wants a native EBS solution with no scripts to maintain. Which solution meets these requirements?

### Options
- **A.** Enable fast snapshot restore in us-west-2 for the volumes' snapshots so that a recovery there is quick.
- **B.** Write an AWS Lambda function on an Amazon EventBridge schedule that creates the snapshots, copies them to us-west-2, and deletes old ones.
- **C.** Create a Data Lifecycle Manager policy for the tag: snapshots every 4 hours kept 7 days, copied to us-west-2 and kept 30 days.
- **D.** Turn on EBS Multi-Attach and attach the volumes to a standby EC2 instance in us-west-2.

### Correct answer: C

**Summary:** Scheduled EBS snapshots with retention and automatic cross-Region copies: one Amazon Data Lifecycle Manager policy, with no code.

### Explanation
- A is wrong: fast snapshot restore speeds up volumes created from existing snapshots; it does not take, copy or expire any snapshots.
- B is wrong: this is the custom script the team wants to avoid, with its own error handling and retention logic to maintain.
- C is correct: a Data Lifecycle Manager snapshot policy targets volumes by tag, creates and expires snapshots on its schedule, and its cross-Region copy rule copies each snapshot to another Region with a retention period of its own, all without code.
- D is wrong: Multi-Attach works only for io1 and io2 volumes and instances in the same Availability Zone; a volume cannot be attached in another Region.

**Key phrases:** every 4 hours · kept for 7 days · copied automatically to us-west-2 · kept for 30 days · native EBS solution with no scripts
**Hint:** A schedule, retention in two Regions, and no scripts. Which option covers all three on its own?

---

## DELTA-107: Networking & Content Delivery
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** easy · **Pillars:** Reliability, Cost Optimization
**Services:** Route 53 › Failover & health checks, S3 › Static website hosting

### Question
A company's website runs on Amazon EC2 instances behind an Application Load Balancer in one Region, and its DNS is hosted in Amazon Route 53. If the whole application becomes unavailable, visitors must automatically see a static "back soon" page instead of an error, at the lowest possible cost. What should a solutions architect do?

### Options
- **A.** Run a second, smaller Auto Scaling group that serves the page behind its own load balancer, and split traffic between the two with Route 53 weighted records.
- **B.** Add a fixed-response rule to the existing Application Load Balancer that returns the maintenance page when the targets fail.
- **C.** Create a CloudWatch alarm that notifies the operations team, who then point the DNS record at a maintenance server.
- **D.** Host the page as an S3 static website, and create Route 53 failover records: the load balancer as a health-checked primary, the bucket as secondary.

### Correct answer: D

**Summary:** Automatic maintenance page: Route 53 failover with the application as a health-checked primary and an S3 static website as the secondary.

### Explanation
- A is wrong: weighted routing sends a share of visitors to the maintenance page all the time, and a second running stack costs far more than a page in S3.
- B is wrong: the load balancer is part of the application that may be unavailable, so a fixed response cannot help when the load balancer or its Region is down.
- C is wrong: a manual DNS change is not automatic, and visitors see errors until someone acts.
- D is correct: failover routing answers with the primary while its health check passes and switches to the S3 website automatically when it fails, and a static page in S3 costs almost nothing to keep ready.

**Key phrases:** whole application becomes unavailable · automatically see a static · lowest possible cost
**Hint:** The fallback must switch on by itself and cost almost nothing while it waits.

---

## DELTA-108: Storage & Backup
**Exam domain:** 2 · **Task:** 2.2 · **Difficulty:** medium · **Pillars:** Reliability
**Services:** EFS

### Question
A content management system on Amazon EC2 stores shared files on an Amazon EFS file system in eu-west-1. The disaster recovery plan requires a copy of the file system in eu-central-1 that is at most about 15 minutes behind, that can be made writable quickly during a Regional outage, and that needs no custom code. Which solution meets these requirements?

### Options
- **A.** Turn on EFS replication to a file system in eu-central-1, and in an outage delete the replication to make the copy writable.
- **B.** Back up the file system every day with AWS Backup and copy each backup to a vault in eu-central-1 for restores.
- **C.** Create a second EFS file system in eu-central-1 and run rsync from an EC2 instance every 15 minutes to keep it current.
- **D.** Move the data to an EFS One Zone file system in eu-central-1 and mount it from the instances that run in eu-west-1.

### Correct answer: A

**Summary:** Cross-Region DR for EFS: EFS replication keeps a read-only copy about 15 minutes behind; delete the replication configuration to fail over to a writable file system.

### Explanation
- A is correct: EFS replication keeps a read-only copy in the other Region that is typically no more than 15 minutes behind, and deleting the replication configuration turns the destination into a writable file system for failover.
- B is wrong: daily backups allow up to a day of data loss, and restoring a large file system takes far longer than making a replica writable.
- C is wrong: rsync jobs are custom code and a server to maintain, and a run that overruns its interval falls further behind.
- D is wrong: One Zone storage keeps data in a single Availability Zone, and mounting it from another Region adds latency without creating a second copy.

**Key phrases:** Amazon EFS file system in eu-west-1 · at most about 15 minutes behind · made writable quickly · no custom code
**Hint:** The copy should be maintained by EFS itself and become writable only when you fail over.
