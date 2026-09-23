# AWS SAA-C03 Cheat Sheet — Domain: Compute

> Scope: EC2 families, EC2 purchasing & placement, Auto Scaling, Lambda, Elastic Beanstalk, ECS/EKS (Fargate vs EC2).
> Format per section: (1) Core Purpose & SAA-C03 angle → (2) Comparison matrix → (3) Gotchas & trap keywords → (4) Well-Architected pillar.
> Limits/numbers are current to my knowledge but can change — verify soft limits against AWS docs before relying on them for anything other than exam recall.

---

## 0. Compute Decision Cheat Table (memorize this first)

| Scenario clue | Answer |
|---|---|
| Full OS control, lift-and-shift, licensing, custom kernel | **EC2** |
| Event-driven, short (<15 min), no servers, pay per ms | **Lambda** |
| Upload code, don't manage infra, but still want EC2/ALB/ASG underneath | **Elastic Beanstalk** |
| Docker containers, AWS-native orchestration, simple | **ECS** |
| Docker containers, need Kubernetes API / portability / existing K8s tooling | **EKS** |
| Containers, no cluster/server management | **Fargate** (ECS or EKS) |
| Containerized web app/API from source or image, *zero* infra/ALB config | **App Runner** |
| Batch jobs, queue-based, thousands of jobs, Spot | **AWS Batch** |
| Simple VPS, predictable flat price, small workloads | **Lightsail** |
| AWS infra on-premises, low-latency to on-prem | **Outposts** |
| Long-running (>15 min) job, no servers | **Fargate / Batch** (not Lambda) |

---

## 1. EC2 Instance Families

### 1.1 Core Purpose & SAA-C03 Angle
EC2 is the IaaS baseline. The exam tests **matching workload profile → instance family** (Performance Efficiency) and **matching workload steadiness → purchasing model** (Cost Optimization). You are almost never asked for a specific size, but you *are* asked for the family/category.

### 1.2 Head-to-Head Matrix — Instance Categories

| Category (families) | Best suited for | Pricing / cost note | Performance / limits | Trade-offs |
|---|---|---|---|---|
| **General purpose** (M, T, Mac) | Web/app servers, small DBs, dev/test, balanced CPU:RAM | **T = burstable** (CPU credits; *unlimited mode* can incur surplus charges). M = steady baseline | M: 1:4 vCPU:GiB. T: baseline % + credits | T instances throttle when credits deplete — wrong choice for sustained high CPU |
| **Compute optimized** (C) | Batch, HPC, media transcoding, scientific modeling, gaming servers, ML inference (CPU), high-perf web | Cheaper per vCPU than M | 1:2 vCPU:GiB, high clock/network | Little RAM — bad for in-memory workloads |
| **Memory optimized** (R, X, U, z1d) | In-memory DBs/caches (Redis, Memcached self-managed), SAP HANA, big data analytics, real-time processing of large unstructured data | Premium per vCPU | R: 1:8. **X**: up to several TiB RAM (1:32). **U**: highest memory (up to 24 TiB, bare-metal, SAP HANA). **z1d**: high single-thread clock + memory (per-core licensing) | Expensive; don't use for CPU-bound |
| **Accelerated computing** (P, G, Inf, Trn, F, DL) | **P** = GPU ML training/HPC; **G** = graphics/GPU rendering, streaming, ML inference; **Inf (Inferentia)** = cheapest, high-throughput ML **inference**; **Trn (Trainium)** = cost-effective ML **training**; **F** = FPGA custom hardware | GPUs are the priciest; Inf/Trn cheaper per inference/training than GPU | Elastic Fabric Adapter (EFA) on many for HPC | Custom silicon (Inf/Trn) requires Neuron SDK; GPU flexibility vs cost |
| **Storage optimized** (I, D, H) | **I** = high **IOPS**, low-latency NVMe instance store (NoSQL, OLTP, data warehouse, Cassandra, Elasticsearch); **D** = dense HDD, high sequential throughput (MapReduce/HDFS, Hadoop, log processing, distributed file systems); **H** = HDD, high disk throughput | Instance store included in price | Instance store: millions of IOPS, **ephemeral** | Data lost on stop/terminate/host failure → must replicate |

### 1.3 Instance Store vs EBS (frequently paired with storage-optimized questions)

| | Instance Store | EBS |
|---|---|---|
| Persistence | **Ephemeral** (lost on stop, terminate, hardware failure; survives reboot) | Persistent (survives stop; `DeleteOnTermination` default **true for root**, false for additional volumes) |
| Performance | Highest IOPS/throughput (physically attached NVMe) | Network-attached; io2 Block Express up to 256K IOPS |
| Use | Buffers, caches, scratch, replicated data | Boot volumes, DBs, durable data |
| Backup | You must replicate | Snapshots (incremental, in S3 managed by AWS) |

### 1.4 EC2 Purchasing Options (cost-optimization staple)

| Option | Discount | Commitment | Best for | Gotcha |
|---|---|---|---|---|
| **On-Demand** | 0 | None | Unpredictable, short-term, first-time | Per-second billing (Linux, 60s min) |
| **Reserved Instances (Standard)** | up to ~72% | 1 or 3 yr | Steady-state, specific family/region/OS | Can be sold on RI Marketplace; Standard RI can't change family |
| **Convertible RI** | up to ~66% | 1 or 3 yr | Steady but may change family/OS/tenancy | Lower discount, can't be sold on marketplace |
| **Savings Plans — Compute** | up to ~66% | 1 or 3 yr $/hr | Flexible across family/region/OS **and Fargate + Lambda** | Most flexible |
| **Savings Plans — EC2 Instance** | up to ~72% | 1 or 3 yr $/hr | One family in one region | Less flexible than Compute SP |
| **Spot** | up to ~90% | None | **Fault-tolerant, stateless, flexible, interruptible** (batch, CI, big data, containers) | **2-minute interruption notice**; not for DBs/critical stateful jobs |
| **Dedicated Host** | — | On-Demand or reserved | **BYOL per-socket/per-core/per-VM software licensing**, compliance, host visibility | Most expensive; you see sockets/cores |
| **Dedicated Instance** | — | — | Hardware isolated to your account (compliance) | No host-level control/visibility |
| **Capacity Reservation** | 0 (unless combined with RI/SP) | None (cancel any time) | **Guarantee capacity in a specific AZ** | Billed whether used or not; *Regional RI gives discount but no capacity*, **Zonal RI gives both** |

**Spot details:** Spot Fleet / EC2 Fleet strategies: `lowestPrice`, `diversified`, `capacityOptimized`, `priceCapacityOptimized` (recommended). **Spot Block** (defined duration) is discontinued. Persistent Spot requests re-launch after interruption; one-time do not. To cancel a persistent request you must cancel the request **then** terminate instances.

### 1.5 Placement Groups

| Type | Purpose | Limits / trade-off |
|---|---|---|
| **Cluster** | Low-latency, high throughput (10 Gbps+ between nodes), HPC, tightly coupled | Single AZ; a single hardware failure can impact many; capacity errors — launch all at once |
| **Spread** | Critical instances isolated on distinct hardware | **Max 7 running instances per AZ per group**; can span AZs |
| **Partition** | Large distributed/replicated workloads (Hadoop, Cassandra, Kafka, HDFS/HBase) | Up to **7 partitions per AZ**; partitions don't share racks; visible partition metadata |

### 1.6 Other EC2 items the exam loves
- **Hibernate**: RAM written to encrypted EBS root; fast boot; requires encrypted root, supported families, RAM < 150 GB; max 60 days.
- **AMI**: region-scoped; copy across regions (and encrypt on copy). Golden AMIs speed ASG launches vs. user-data bootstrapping.
- **User data** runs once at first boot as root by default. **Instance metadata**: `http://169.254.169.254` (use **IMDSv2**, session-token based, to mitigate SSRF).
- **Elastic IP**: 5 per region soft limit; charged when **not** attached to a running instance (and now for all public IPv4 addresses).
- **ENI** is AZ-bound; **ENA** = up to 100+ Gbps enhanced networking; **EFA** = OS-bypass for HPC/MPI.
- **Nitro** system: hardware offload, near bare-metal performance, EBS optimized by default.
- **Recovery**: CloudWatch alarm `StatusCheckFailed_System` → **EC2 auto-recovery** action (keeps ID, IP, metadata, EIP). Instance-level failure → reboot action.

### 1.7 Exam Gotchas & Trap Keywords
| Clue | Think |
|---|---|
| "batch processing", "media encoding", "high-performance web server", "scientific modeling" | **C** family |
| "in-memory database", "real-time big-data analytics", "SAP HANA" | **R / X / U** |
| "machine learning **training**" | **P / Trn**; "ML **inference** lowest cost" | **Inf** |
| "high **IOPS**", "NoSQL", "OLTP", "low-latency local storage" | **I** (instance store) |
| "Hadoop/HDFS", "sequential throughput", "data warehouse dense storage" | **D / H** |
| "spiky, occasional burst, low baseline" | **T** (burstable) |
| "BYOL", "per-socket licence", "compliance host-level" | **Dedicated Host** |
| "Interruptible, fault-tolerant, cheapest" | **Spot** |
| "Steady 24/7 for 1-3 yrs" | **RI / Savings Plan** |
| "Guaranteed capacity in one AZ, short-term event" | **On-Demand Capacity Reservation** |
| "Sub-ms latency between nodes, HPC" | **Cluster placement group + EFA** |
| "Hardware failure must not affect >1 instance" | **Spread placement group** |
| Data must survive stop/terminate | **EBS**, not instance store |

### 1.8 Well-Architected Pillar
**Performance Efficiency** (right instance family, placement groups, Nitro/EFA) and **Cost Optimization** (purchasing model, Graviton — ~20% cheaper / better price-performance — right-sizing). Reliability via auto-recovery & multi-AZ.

---

## 2. EC2 Auto Scaling (ASG)

### 2.1 Core Purpose & SAA-C03 Angle
ASG maintains instance count and scales horizontally by policy across AZs, replacing unhealthy instances. Tested for **elasticity, high availability, and cost** — especially *which scaling policy fits the scenario* and *ASG + ELB integration*.

### 2.2 Head-to-Head Matrix — Scaling Policies

| Policy | Use case / best for | Pricing / cost | Performance / scaling behavior | Trade-offs |
|---|---|---|---|---|
| **Target Tracking** | "Keep average CPU at 50%", "ALB `RequestCountPerTarget` = 1000". Set-and-forget, like a thermostat | Free (pay for alarms it creates automatically — managed by ASG, you can't edit them) | Auto-creates scale-out and scale-in CloudWatch alarms; proportional response; scale-in is conservative | Less granular control; needs a metric that **scales proportionally** with capacity (CPU, `ALBRequestCountPerTarget`, network I/O; *not* e.g. raw ALB request count total) |
| **Step Scaling** | Different responses for different alarm breach sizes (e.g., +2 at CPU 60–70%, +4 at 70–85%, +8 at >85%) | You create/manage CloudWatch alarms | Adjusts by step based on **breach magnitude**; can continue responding during scaling activity (no cooldown; uses **instance warm-up**) | You must define alarms & steps; more config |
| **Simple Scaling** (legacy) | Single alarm → single adjustment | Same | **Waits for cooldown** (default 300 s) after each activity before responding again | Slow to respond; largely superseded by step scaling |
| **Scheduled** | **Known**, predictable events (Monday 9 AM, Black Friday, monthly close) | Free | Sets min/max/desired at time/recurrence | Doesn't react to unexpected load |
| **Predictive** | Cyclical traffic patterns; ML forecasts load 48 h ahead using ≥24 h history (best with 14 days) | Free (policy) | **Pre-provisions** capacity before demand; can run in forecast-only mode | Needs history; not for random spikes; combine with dynamic |
| **Manual** | Change min/max/desired directly | — | — | — |

**Target Tracking vs Step Scaling — the rule of thumb:**
- Want **simplicity & a steady utilization target** → **Target Tracking** (AWS best practice default).
- Need **custom, tiered responses** or scaling on a metric that isn't proportional → **Step Scaling**.
- Known schedule → **Scheduled**; recurring patterns → **Predictive**.

### 2.3 Key Mechanics
- **Min / Desired / Max** capacity. Scale-out is bounded by max; ASG never goes below min.
- **Launch Template** (current; supports versioning, mixed purchase options, T-unlimited, multiple instance types). **Launch Configurations are deprecated/legacy & immutable** — new features need launch templates.
- **Mixed Instances Policy**: On-Demand base + Spot above base; multiple instance types → cost + capacity resilience.
- **Health checks**: EC2 status (default) + **ELB health checks** (enable to replace instances failing app-level checks) + custom health checks. Health check **grace period** default 300 s.
- **Cooldown** default **300 s** (applies to simple scaling; step/target tracking use warm-up).
- **Default termination policy**: (1) AZ with the most instances → (2) instance with oldest launch template/config → (3) closest to next billing hour (largely moot per-second billing). Rebalances across AZs; may briefly exceed max.
- **Scale-in protection** protects specific instances; **Standby** state for maintenance (won't be terminated/health-checked).
- **Lifecycle hooks**: pause at `Pending:Wait` / `Terminating:Wait` → run scripts, drain, collect logs; integrate with EventBridge/SNS/SQS/Lambda.
- **Warm pools**: pre-initialized stopped/running/hibernated instances → faster scale-out for slow-booting apps.
- **Instance refresh**: rolling replacement to roll out a new AMI/launch template (with min healthy %).
- **ASG spans multiple AZs in one Region** (not multiple Regions). Integrates with ALB/NLB/GWLB **target groups** (not Classic-only concepts).
- **ASG + ELB**: ALB distributes; ASG registers/deregisters automatically. **Connection draining / deregistration delay** default 300 s.
- **Metrics**: CPU, network, ALB request count per target are native. **Memory & disk usage are NOT native** → install CloudWatch Agent for custom metrics.
- **SQS-driven scaling**: scale on **backlog per instance** (queue depth ÷ instances) custom metric — classic decoupling answer.

### 2.4 Exam Gotchas & Trap Keywords
| Clue | Think |
|---|---|
| "Maintain average CPU at X%" / "keep metric at target" | **Target Tracking** |
| "Scale by different amounts depending on how high CPU goes" | **Step Scaling** |
| "Traffic spike every day at 9 AM / known marketing event" | **Scheduled** |
| "Recurring daily/weekly pattern, provision *ahead* of demand" | **Predictive** |
| "Instances launched too slowly / long boot-up initialization" | **Warm pool**, golden AMI |
| "Run custom script before instance terminates / on launch" | **Lifecycle hook** |
| "App healthy per EC2 but returns 500s; instance not replaced" | Enable **ELB health checks** on ASG |
| "Scale based on memory" | CloudWatch Agent custom metric |
| "Process queue messages; scale on backlog" | Custom metric (queue length / instances) or target-tracking on it |
| "Save cost on ASG w/ interruption tolerance" | **Mixed instances policy w/ Spot** |
| "Prevent scale-in flapping" | Cooldown / warm-up / scale-in protection |
| "Multi-Region scaling" | ASG can't — use Route 53 + per-region ASGs |

### 2.5 Well-Architected Pillar
**Reliability** (self-healing, multi-AZ) and **Performance Efficiency** (elasticity), with **Cost Optimization** (scale-in, Spot mix).

---

## 3. AWS Lambda

### 3.1 Core Purpose & SAA-C03 Angle
Serverless, event-driven compute billed by requests + GB-seconds (duration × memory, ms granularity). Tested for **decoupled/event-driven architecture, operational overhead reduction, and limits** (knowing when Lambda is *not* the answer — >15 min, huge payloads, persistent connections).

### 3.2 Key Limits (know cold)

| Item | Limit |
|---|---|
| **Max timeout** | **15 minutes** (900 s); default 3 s |
| **Memory** | 128 MB – **10,240 MB (10 GB)**; CPU scales proportionally with memory (~1 vCPU at 1,769 MB; up to 6 vCPUs) |
| **Ephemeral `/tmp`** | 512 MB default, configurable up to **10 GB** |
| **Sync invoke payload** (request/response) | **6 MB** each; **Async payload: 256 KB** |
| **Deployment package** | 50 MB zipped (direct upload), **250 MB unzipped** (incl. layers); **container image up to 10 GB** |
| **Layers** | Max 5 per function |
| **Environment variables** | 4 KB total |
| **Concurrency** | **1,000 default per Region** (soft limit, account-wide across functions); burst scaling then +1,000 concurrent executions every 10 s per function |
| **Reserved concurrency** | Guarantees *and caps* a function's concurrency (free); also protects downstream (e.g., RDS). Setting to **0** = throttle/disable |
| **Provisioned concurrency** | Pre-initialized environments → **eliminates cold starts** (billed) — pair with Application Auto Scaling schedule |
| **Async retries** | 2 retries by default (0–2 configurable); use **DLQ (SQS/SNS) or On-failure destination** |
| **Runtimes** | Node, Python, Java, .NET, Ruby, Go/custom (`provided.al2023`), plus container images |
| **Stateless** | No persistent local state; use S3/DynamoDB/EFS |

### 3.3 Invocation Models & Triggers

| Model | Triggers | Retry behavior | Notes |
|---|---|---|---|
| **Synchronous** | API Gateway, ALB, Function URL, Cognito, CloudFront (Lambda@Edge), Step Functions (request-response), SDK `RequestResponse` | Client handles retries/errors | Caller waits |
| **Asynchronous** | **S3 events, SNS, EventBridge**, SES, CloudWatch Logs, CodeCommit | Lambda retries 2× → **DLQ/destinations** | Event queue internally |
| **Poll-based (event source mapping)** | **SQS** (standard/FIFO), **Kinesis Data Streams**, **DynamoDB Streams**, MSK, self-managed Kafka, MQ | Lambda polls & batches; failure behavior differs | Stream: **ordering per shard, blocked shard until success/expiry** → use `BisectBatchOnError`, on-failure destination, max retry, max record age. SQS: **visibility timeout ≥ 6× function timeout**; failed messages return to queue → **DLQ on the queue** (not Lambda's DLQ) |

**Function URL**: built-in HTTPS endpoint (auth: IAM or NONE) — no API Gateway needed.
**Lambda@Edge / CloudFront Functions**: edge customization (CloudFront Functions = lightweight JS, sub-ms, viewer req/resp only, cheaper; Lambda@Edge = more powerful, origin & viewer events, up to 5 s viewer/30 s origin).

### 3.4 VPC Integration
- By default Lambda runs in an **AWS-managed VPC**, with internet access but **no access to your private VPC resources**.
- To reach **RDS, ElastiCache, private EC2**, configure the function with **VPC subnets + security groups** → Lambda creates **Hyperplane ENIs** (shared, created at config time, not per invocation — no per-invoke cold start penalty for ENI anymore).
- **A VPC-attached Lambda loses default internet access.** To reach the internet/AWS public APIs: put it in a **private subnet with route to a NAT Gateway (in a public subnet)**. Placing it in a public subnet does **not** give it internet (no public IP is assigned) — a classic trap.
- Alternatively access AWS services privately via **VPC endpoints** (Gateway endpoints: S3, DynamoDB; Interface endpoints/PrivateLink: most others).
- Assign multiple subnets in ≥2 AZs for HA. Execution role needs `AWSLambdaVPCAccessExecutionRole` (ENI permissions).
- **RDS Proxy** pools connections to prevent Lambda from exhausting DB connections (a top-tier scenario). RDS Proxy is in-VPC; Lambda must be VPC-attached to use it.
- **EFS** can be mounted to Lambda (requires VPC) for shared/persistent storage > 10 GB.

### 3.5 Other must-know Lambda features
- **Execution role** (what Lambda can call) vs **resource-based policy** (who can invoke Lambda: S3, SNS, API GW...).
- **Versions & aliases**: immutable versions; aliases with **weighted traffic shifting** (canary); integrates with **CodeDeploy** (`Canary`, `Linear`, `AllAtOnce`).
- **SnapStart** (Java, also Python/.NET): snapshot init → fast cold starts, no extra cost for Java (vs provisioned concurrency cost).
- **Destinations**: success/failure to SQS, SNS, Lambda, EventBridge (preferred over DLQ for async; DLQ only failures).
- **Pricing**: $/1M requests + GB-s; free tier 1M req + 400,000 GB-s/month; **Compute Savings Plans** apply. **ARM/Graviton2 (arm64)** ~20% cheaper and ~34% better price-performance.
- **Secrets**: use Secrets Manager/Parameter Store; env vars can be encrypted with KMS.
- **Lambda in front of SQS for decoupling**, **Step Functions** to orchestrate >15 min workflows.
- **Not suited for**: >15 min runs, large binaries/GPU (use Fargate/EC2), constant high-throughput steady load (EC2/Fargate may be cheaper), WebSocket server (use API Gateway WebSocket + Lambda).

### 3.5b Head-to-Head: Lambda vs Fargate vs EC2

| Axis | Lambda | Fargate | EC2 |
|---|---|---|---|
| Best for | Event-driven, short, spiky | Long-running containers, no server mgmt | Full control, steady heavy, special HW |
| Pricing | Per request + GB-s (ms) | Per vCPU-s + GB-s (1 min min) | Per-second instance |
| Limit | 15 min, 10 GB, 6 MB sync payload | Up to 16 vCPU / 120 GB (Linux), 200 GB ephemeral | Instance limits |
| Scale to zero | **Yes** | Yes (service can be 0 tasks) | No (ASG min may be 0 but slow) |
| Trade-off | Cold starts, limits | Slower start than Lambda; costlier at steady load | You patch, scale, secure |

### 3.6 Exam Gotchas & Trap Keywords
| Clue | Think |
|---|---|
| "Run code without provisioning servers; pay only for compute time" | Lambda |
| "Job takes 20–60 minutes" | **Not Lambda** → Fargate/Batch/Step Functions chunking |
| "Cold start latency sensitive" | **Provisioned concurrency** (or SnapStart for Java) |
| "Lambda must connect to RDS in private subnet" | VPC config + **RDS Proxy** |
| "Lambda in VPC can't call external API/S3" | **NAT Gateway** (or VPC endpoint) |
| "Too many concurrent executions overwhelming DB / one function starving others" | **Reserved concurrency** |
| "Process S3 uploads (thumbnail)" | S3 event → Lambda (async) |
| "Ordered processing of stream records" | Kinesis/DynamoDB Streams → Lambda (per shard) |
| "Failed async invocations must be captured" | DLQ / on-failure destination |
| "Unpredictable traffic, minimize ops" | Lambda + API Gateway |
| "Payload > 6 MB via API" | S3 presigned URL upload instead |
| "Need to share libraries across functions" | **Lambda layers** |
| "Shared file storage/state across invocations" | **EFS** (VPC) / S3 / DynamoDB |

### 3.7 Well-Architected Pillar
**Operational Excellence** (no servers), **Cost Optimization** (pay per use), **Performance Efficiency** (auto-scale), **Reliability** (multi-AZ by default), **Security** (least-privilege execution role per function).

---

## 4. AWS Elastic Beanstalk

### 4.1 Core Purpose & SAA-C03 Angle
PaaS: upload code (Java, .NET, PHP, Node, Python, Ruby, Go, Docker) and Beanstalk provisions EC2, ASG, ELB, RDS (optional), CloudWatch. Tested as **"developer wants to deploy without learning infrastructure but retain control"** and for **deployment strategies**.

### 4.2 Head-to-Head Matrix — Beanstalk vs Neighbors

| Axis | **Elastic Beanstalk** | **Lambda** | **ECS/Fargate** | **CloudFormation** | **App Runner** |
|---|---|---|---|---|---|
| Best for | Traditional web apps/APIs & workers, quick deployment | Event-driven functions | Containers | IaC for any resource | Simplest container/web app deploy |
| Pricing | **No extra charge**, pay only for underlying resources | Per invoke | Per task resources | Free (pay resources) | Per vCPU/GB active + provisioned |
| Control | Full access to underlying EC2 | None | Task-level | Total | Minimal |
| Scaling | ASG (config'd) | Automatic | Service auto scaling | Via ASG resource | Automatic |
| Trade-off | Less flexible than raw IaC; opinionated | Limits | Container knowledge needed | Steeper authoring | Less control |

### 4.3 Key Concepts
- **Application → Version → Environment**. Environment tiers: **Web server tier** (ELB + ASG + EC2) and **Worker tier** (SQS queue + daemon `sqsd` polls and POSTs to your app; cron via `cron.yaml`).
- **Environment types**: single instance (dev; Elastic IP) vs **load-balanced/auto-scaled** (prod).
- Customize via **`.ebextensions/*.config`** (YAML/JSON in app root), **`Procfile`, `Buildfile`, platform hooks**, saved configurations.
- Managed platform updates (patching) with maintenance window.
- **Docker**: single-container, or multi-container via **ECS-managed** platform.
- **Underlying = CloudFormation** stack.
- **RDS inside the Beanstalk environment is deleted when the environment is terminated** → for prod, **create RDS outside** Beanstalk & connect (decoupled) — classic trap. Also a Beanstalk environment's *ALB type* can't be changed after creation (need to re-create).
- Roles: **service role** (Beanstalk managing resources) and **instance profile** (EC2 instances to access S3/DynamoDB...).

### 4.4 Deployment Policies (heavily tested)

| Policy | How | Downtime | Capacity during deploy | Rollback | Extra cost | Best for |
|---|---|---|---|---|---|---|
| **All at once** | Deploy to all instances simultaneously | **Yes (brief outage)** | 0% at points | Manual redeploy (slow) | None | Fastest; dev/test |
| **Rolling** | Batches; each batch out of service during update | No full outage, but **reduced capacity** | Reduced by batch size | Manual redeploy | None | Tolerating reduced capacity |
| **Rolling with additional batch** | Launch new batch first, then roll | No downtime | **Full capacity maintained** | Manual | Small (extra batch) | Prod needing full capacity |
| **Immutable** | Launch **new ASG** of instances w/ new version, swap on healthy, terminate old | No downtime | Full (double temporarily) | **Fast & safe — just terminate new ASG** | Higher (2× temporarily) | Prod, safest in-place; preferable for config/platform changes |
| **Traffic splitting** (canary) | New ASG gets X% of traffic for eval period | No downtime | Full | Fast (reroute) | Higher | **Canary testing** |
| **Blue/Green** (not a native policy; done by creating a **new environment** and **swapping CNAMEs/URLs**) | Clone environment, deploy, swap | **Zero downtime** | Full | **Swap back instantly** | Highest | Zero downtime, major changes, testing; DB stays external |

Mnemonic ladder — speed ↓ / safety ↑: All-at-once → Rolling → Rolling+batch → Immutable / Traffic-split → Blue/Green.

### 4.5 Exam Gotchas & Trap Keywords
| Clue | Think |
|---|---|
| "Developers want to deploy code, AWS handles capacity provisioning, LB, scaling, monitoring" | Beanstalk |
| "Web app… **don't want to manage infrastructure** but need EC2 access" | Beanstalk |
| "Zero downtime, quick rollback, swap URL" | Blue/Green (CNAME swap) |
| "Canary test with a % of traffic" | Traffic splitting |
| "Deployment must keep full capacity, no extra instances" | (trick) — none; *rolling with additional batch* adds instances but keeps capacity |
| "Long-running background tasks via queue" | **Worker tier** |
| "DB lost after environment deletion" | RDS coupled to environment |
| "Lowest cost dev deployment, downtime acceptable" | All at once / single instance |
| "Infrastructure as code for arbitrary AWS resources" | CloudFormation, **not** Beanstalk |

### 4.6 Well-Architected Pillar
**Operational Excellence** (managed deployment/monitoring), with Reliability (deployment policies, multi-AZ). Nominal Cost Optimization (free service).

---

## 5. Amazon ECS / EKS / Fargate

### 5.1 Core Purpose & SAA-C03 Angle
Container orchestration. Exam tests **ECS vs EKS (proprietary vs Kubernetes)**, **Fargate vs EC2 launch type (operational overhead vs control/cost)**, **IAM roles for tasks**, **storage options**, **networking**, and **scaling**.

### 5.2 Head-to-Head Matrix — ECS vs EKS

| Axis | **Amazon ECS** | **Amazon EKS** |
|---|---|---|
| Best for | AWS-native, simple, deep AWS integration | **Kubernetes** workloads, hybrid/multi-cloud portability, existing K8s tooling (Helm, kubectl, CRDs) |
| Pricing | **No control-plane charge**; pay for EC2/Fargate | **~$0.10/hr per cluster control plane** + EC2/Fargate (extended-support versions cost more) |
| Scalability | Very high; simple service scaling (Application Auto Scaling — target tracking on CPU/mem/ALB requests; step; scheduled) | High; HPA/VPA, **Cluster Autoscaler / Karpenter** |
| Trade-offs | AWS lock-in, not K8s API-compatible | Steeper learning curve, more components, higher control-plane cost |
| Hybrid | **ECS Anywhere** | **EKS Anywhere / EKS Distro / Outposts** |
| Images | **ECR** for both (or Docker Hub) | ECR |
| Load balancing | ALB (dynamic port mapping), NLB | ALB via **AWS Load Balancer Controller** (Ingress/Service) |
| Task/Pod IAM | **Task role** | **IRSA / EKS Pod Identity** |

### 5.3 Head-to-Head Matrix — Fargate vs EC2 Launch Type

| Axis | **Fargate** (serverless) | **EC2 launch type** (self-managed cluster) |
|---|---|---|
| Best for | Least operational overhead; variable/intermittent workloads; small teams; per-task isolation | Steady-state large-scale, cost-optimized workloads; **GPU**, specific instance types; custom AMI/daemon/privileged; compliance needing host access |
| Pricing | Per vCPU-second + GB-second (1-min minimum, per-second after); **Fargate Spot** (up to ~70%, ECS) ; covered by **Compute Savings Plans** | Pay for EC2 (On-Demand, RI, **Spot**, Savings Plans) — cheaper at high, well-packed utilization |
| Scaling | Scale tasks only — no capacity to manage | Scale **both tasks and container instances** (ASG + **ECS Capacity Providers**) |
| Performance/limits | Task sizes up to **16 vCPU / 120 GB**; ephemeral storage default 20 GiB up to **200 GiB**; no GPU; no privileged mode; no host access | Any instance type, GPU, large sizes, full host control (SSH), **Bin-packing** |
| Networking | `awsvpc` **only** — each task gets its own ENI/IP & SG | `awsvpc`, `bridge`, `host` |
| Storage | Ephemeral, **EFS**, (EBS volumes now supported for ECS Fargate tasks) | EBS, EFS, instance store, FSx for Windows/Lustre |
| Trade-offs | Less control, can cost more at 24/7 high utilization, slower start than warm EC2 | You patch AMIs/agents, right-size the fleet, pay for idle capacity |

### 5.4 ECS Concepts & IAM (frequent exam material)
- **Task definition** (container image, CPU/mem, ports, roles) → **Task** (run once/batch) or **Service** (long-running, desired count, ELB integration, rolling or blue/green via **CodeDeploy**).
- **ECS Task Role** = permissions for **application code** in the task (e.g., read S3, write DynamoDB). **Task Execution Role** = permissions for **ECS agent/Fargate** to **pull from ECR, write to CloudWatch Logs, fetch Secrets Manager/SSM params**. (Classic swap trap.)
- **EC2 Instance Profile** (EC2 launch type only) = for ECS agent on the host. **Never** put app permissions there when task roles are available (least privilege).
- **Secrets**: inject from **Secrets Manager / SSM Parameter Store** as env vars. **Logging**: `awslogs` driver → CloudWatch Logs; **FireLens** (Fluent Bit) for other destinations.
- **Auto scaling**: **Service Auto Scaling** (tasks) via Application Auto Scaling; **Cluster capacity via Capacity Providers** (ASG-backed or Fargate/Fargate Spot). Common exam question: "tasks pending because no capacity" → capacity provider w/ managed scaling.
- **Event-driven tasks**: EventBridge rule → run ECS task (e.g., S3 upload triggers container job; scheduled tasks as cron).
- **Service Connect / Cloud Map** for service discovery; **App Mesh** (deprecated path).
- **Persistent shared storage**: **EFS** (works with both Fargate and EC2 launch types, multi-AZ). **Bind mounts** for ephemeral shared between containers in a task.

### 5.5 EKS Notes
- Node options: **Managed node groups**, **self-managed nodes**, **Fargate profiles** (serverless pods; **no DaemonSets, no privileged, no GPU, no EBS PVs → use EFS**; Fargate for EKS has no Spot), **EKS Auto Mode** (AWS manages nodes/scaling).
- Control plane **multi-AZ, managed by AWS**; you manage worker nodes (unless Fargate/Auto Mode).
- **Storage**: EBS CSI (RWO), **EFS CSI (RWX, multi-AZ, works on Fargate)**, FSx for Lustre CSI.
- **Networking**: VPC CNI gives pods VPC IPs (watch **IP exhaustion**—use prefix delegation/secondary CIDRs).
- **Security**: IRSA / Pod Identity, Security Groups for Pods, KMS secrets encryption, Kubernetes RBAC via `aws-auth`/access entries.
- Choose EKS **when the scenario says "Kubernetes", "already using K8s", "portability", "open-source"**.

### 5.6 ECR (adjacent)
Managed Docker/OCI registry; private/public; **image scanning** (basic/enhanced with Inspector), lifecycle policies, **cross-Region/cross-account replication**, encryption at rest, IAM/resource policies.

### 5.7 Exam Gotchas & Trap Keywords
| Clue | Think |
|---|---|
| "Run containers **without managing servers/EC2**" | **Fargate** |
| "Kubernetes", "K8s", "portable across clouds/on-prem" | **EKS** |
| "AWS-native, simplest orchestration, no K8s knowledge" | **ECS** |
| "Container needs to read S3/DynamoDB" | **Task role** (not instance role, not access keys) |
| "Can't pull image from ECR / can't write logs" | **Task execution role** |
| "GPU containers / custom AMI / privileged / host-level daemon" | **EC2 launch type** |
| "Steady large container fleet, minimize cost" | EC2 launch type + **Spot/RI/Savings Plans** |
| "Interruption-tolerant containers cheapest" | **Fargate Spot** / EC2 Spot capacity provider |
| "Shared persistent storage across containers/AZs" | **EFS** |
| "Scale container tasks by queue depth" | Application Auto Scaling on SQS backlog custom metric |
| "Simple container web app, no VPC/ALB/cluster config" | **App Runner** |
| "Each container needs own security group" | `awsvpc` network mode (Fargate default) |
| "Many small batch jobs in containers with queues, priority, Spot" | **AWS Batch** (on Fargate/EC2) |
| "Hybrid: run ECS/EKS on-prem" | **ECS Anywhere / EKS Anywhere / Outposts** |

### 5.8 Well-Architected Pillar
**Operational Excellence** (Fargate removes host mgmt), **Security** (task-level IAM roles, per-task ENI/SG, image scanning), **Performance Efficiency** (right-sized tasks, Graviton), **Cost Optimization** (EC2/Spot vs Fargate choice, Fargate Spot), **Reliability** (multi-AZ services, health checks, rolling/blue-green).

---

## 6. Cross-Cutting Compute Comparison (one-glance)

| Requirement | Best fit | Why not the others |
|---|---|---|
| Lowest ops overhead, sporadic events | Lambda | EC2/ECS require capacity mgmt |
| Long-running container, no servers | Fargate | Lambda 15-min cap |
| Max control/cheapest at steady scale | EC2 (+RI/SP/Spot) | Serverless costs more at constant load |
| Quick web app deploy w/ managed scaling | Beanstalk | ECS/EKS need more setup |
| Kubernetes required | EKS | ECS isn't K8s |
| Windows workloads & containers | EC2 (Windows) / ECS on EC2 (Windows AMIs); Fargate supports Windows containers (limited) | — |
| Spiky, unpredictable, HTTP API | API Gateway + Lambda | Fixed EC2 = over-provision |
| Predictable growth, cost-optimize | ASG + Savings Plans + scheduled scaling | On-Demand only = expensive |
| Fault-tolerant big batch, cost minimal | Spot Fleet / Batch on Spot | On-Demand pricing |
| Legacy licensed software, host-bound | Dedicated Host | Shared tenancy breaks licence terms |

---

## 7. Rapid-Fire "Instant Answer" List

1. **"Serverless" + "event" + "short"** → Lambda.
2. **Lambda 15 min / 10 GB RAM / 6 MB sync payload / 256 KB async / 1,000 concurrency / 250 MB unzipped / 10 GB image.**
3. **Lambda in VPC → needs NAT for internet** (public subnet ≠ internet).
4. **Reserved concurrency** = guarantee + cap; **Provisioned** = no cold starts.
5. **Target tracking** = thermostat; **Step** = tiered alarms; **Scheduled** = known; **Predictive** = ML forecast.
6. **ASG default cooldown 300 s**; grace period 300 s.
7. **Spot = 2-min warning**; only for interruptible.
8. **Dedicated Host = BYOL/socket-core licensing.**
9. **Cluster PG = low latency (one AZ); Spread PG = ≤7/AZ; Partition PG = big data, ≤7 partitions/AZ.**
10. **Instance store = ephemeral, highest IOPS.**
11. **Beanstalk = free, PaaS; blue/green = swap CNAME; immutable = new ASG; keep RDS outside env.**
12. **ECS task role ≠ execution role ≠ instance profile.**
13. **Fargate = `awsvpc`, no GPU, no host access; EC2 launch = control + GPU + cheaper at scale.**
14. **EKS = Kubernetes, $0.10/hr control plane; ECS = no control-plane fee.**
15. **EFS for shared persistent container storage** (works on Fargate and EC2 nodes).
16. **Graviton (ARM)** = ~20% cheaper / better price-perf across EC2, Lambda, Fargate.
17. **Compute Savings Plans cover EC2 + Fargate + Lambda**; EC2 Instance SP covers only EC2 family/region.
18. **Memory metrics need CloudWatch agent.**
19. **Zonal RI = capacity reservation + discount; Regional RI = discount only (+ AZ flexibility).**
20. **SQS visibility timeout ≥ Lambda timeout** (AWS recommends ≥ 6×).

---

## 8. Well-Architected Pillar Quick Map

| Pillar | Compute levers |
|---|---|
| **Operational Excellence** | Lambda, Fargate, Beanstalk, managed node groups, IaC, lifecycle hooks |
| **Security** | IAM instance profiles/task roles/execution roles, IMDSv2, Nitro, per-function roles, VPC/SG per task, ECR scanning |
| **Reliability** | Multi-AZ ASG, ELB health checks, auto-recovery, spread/partition PGs, deployment policies, DLQs |
| **Performance Efficiency** | Right instance family, Graviton, placement groups, EFA, provisioned concurrency, Predictive scaling |
| **Cost Optimization** | Spot, Savings Plans/RI, right-sizing, Lambda pay-per-use, Fargate Spot, scale-in, Graviton |
| **Sustainability** | Graviton, serverless (higher utilization), right-sizing |
