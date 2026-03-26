/**
 * Rich roadmap + documentation copy per domain (Guidance tab).
 * Images: Unsplash (stable URLs) + domain card image from assets where noted.
 */

export interface GuidanceStep {
  title: string;
  detail: string;
}

export interface GuidancePhase {
  phase: number;
  title: string;
  summary: string;
  duration: string;
  image: string;
  steps: GuidanceStep[];
}

export interface DomainGuidance {
  headline: string;
  subhead: string;
  startHere: { title: string; body: string; accent: "install" | "path" | "build" }[];
  phases: GuidancePhase[];
  docTips: string[];
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const guidanceMap: Record<string, DomainGuidance> = {
  "web-development": {
    headline: "From zero to full-stack web developer",
    subhead:
      "A practical path: foundations → frontend framework → backend & APIs → shipping real projects. Pair this roadmap with the topic checklist and curated videos.",
    startHere: [
      {
        title: "What to install first",
        body: "VS Code, Node.js LTS, Git, and a modern browser. Optional: pnpm or npm. Create a GitHub account on day one — every exercise becomes a portfolio piece.",
        accent: "install",
      },
      {
        title: "What to learn first",
        body: "HTML structure → CSS layout (Flexbox/Grid) → JavaScript fundamentals (functions, DOM, async). Only then move to React. Skipping fundamentals makes frameworks feel magical in a bad way.",
        accent: "path",
      },
      {
        title: "Your first real goal",
        body: "Build a small static site, then a todo app with React, then add a JSON API or serverless function. Deploy each step to Vercel or Netlify so you practice shipping, not only coding.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Foundations & layout",
        summary: "Semantics, accessibility basics, responsive CSS, and JavaScript before any framework.",
        duration: "4–8 weeks",
        image: img("photo-1498050108023-c5249f4df085"),
        steps: [
          { title: "HTML & semantics", detail: "Forms, landmarks, SEO-friendly structure. Build 2–3 static pages from Figma or reference sites." },
          { title: "CSS that scales", detail: "Flexbox, Grid, custom properties, mobile-first breakpoints. Recreate a landing section pixel-close." },
          { title: "JavaScript core", detail: "Types, functions, arrays/objects, DOM APIs, fetch + promises. Mini projects: quiz app, weather widget." },
        ],
      },
      {
        phase: 2,
        title: "React & modern frontend",
        summary: "Components, state, routing, and data fetching — the stack most teams use.",
        duration: "6–10 weeks",
        image: img("photo-1633356122544-f134324a6cee"),
        steps: [
          { title: "React mental model", detail: "JSX, props vs state, hooks (useState, useEffect), lists & keys. Official docs + one guided course." },
          { title: "Routing & data", detail: "React Router, loading/error states, talking to REST APIs. Clone a small part of a real product UI." },
          { title: "TypeScript & tooling", detail: "Gradual TS in React, ESLint/Prettier, Vite or CRA successor. Read error messages until they feel normal." },
        ],
      },
      {
        phase: 3,
        title: "Backend, APIs & full-stack",
        summary: "Node/Express or serverless, auth basics, databases at a beginner level.",
        duration: "6–12 weeks",
        image: img("photo-1555066931-4365d14bab8c"),
        steps: [
          { title: "HTTP & APIs", detail: "REST verbs, status codes, JSON. Build CRUD with Express or Next.js Route Handlers." },
          { title: "Auth & sessions", detail: "Cookies vs JWT, OAuth concepts, never roll crypto alone — use Supabase Auth or Auth.js for practice." },
          { title: "Database touch", detail: "SQL basics or Prisma + Postgres. One deployed app with real persistence." },
        ],
      },
      {
        phase: 4,
        title: "Ship & specialize",
        summary: "Performance, testing, Next.js or SSR, and interview-ready projects.",
        duration: "Ongoing",
        image: img("photo-1460925895917-afdab827c52f"),
        steps: [
          { title: "Production habits", detail: "Env vars, logging, basic monitoring, Lighthouse budgets. Fix accessibility and keyboard flows." },
          { title: "Testing", detail: "Vitest/Jest for logic, React Testing Library for UI. Start with one critical path per project." },
          { title: "Portfolio", detail: "3 strong repos with READMEs, live demos, and one blog post or video explaining trade-offs you made." },
        ],
      },
    ],
    docTips: [
      "MDN Web Docs is the source of truth for browser APIs.",
      "Read React’s new docs (react.dev) — short, interactive, and current.",
      "When stuck, reduce the problem: reproduce in a CodeSandbox minimal example.",
    ],
  },
  "app-development": {
    headline: "Build apps users hold in their hands",
    subhead: "Choose one primary track (Flutter or React Native), learn platform basics, then ship to TestFlight / Play Internal.",
    startHere: [
      {
        title: "Tooling",
        body: "Install Flutter SDK + Android Studio / Xcode CLI tools, or Node + Expo for React Native. Use a real device early — simulators hide performance and gestures.",
        accent: "install",
      },
      {
        title: "Order of topics",
        body: "Language fundamentals (Dart or JS/TS) → UI widgets/components → navigation → state management → native modules & builds.",
        accent: "path",
      },
      {
        title: "First milestone",
        body: "One CRUD app with list + detail + form, offline-friendly where possible, and a build on device. Polish beats feature count.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Platform & language",
        summary: "Dart or TypeScript fluency, IDE, emulators, and project structure.",
        duration: "3–6 weeks",
        image: img("photo-1512941937669-90a1b58e7e9c"),
        steps: [
          { title: "Environment", detail: "SDKs, licenses, signing basics for iOS/Android. Run the default counter app on hardware." },
          { title: "UI building blocks", detail: "Layouts, lists, forms, images. Match a simple Dribbble screen without backend." },
          { title: "Navigation", detail: "Stacks, tabs, deep links. Understand how back stack differs on Android vs iOS." },
        ],
      },
      {
        phase: 2,
        title: "State & data",
        summary: "Local state, async data, caching, and error UX.",
        duration: "4–8 weeks",
        image: img("photo-1551650975-87deedd944c3"),
        steps: [
          { title: "State patterns", detail: "Provider / Riverpod / Bloc or Zustand / Redux — pick one course and stay consistent." },
          { title: "Networking", detail: "REST clients, interceptors, loading & retry UI. Connect to a public API then your own backend." },
          { title: "Persistence", detail: "SQLite / Hive / MMKV for offline caches; sync strategies at a high level." },
        ],
      },
      {
        phase: 3,
        title: "Native & release",
        summary: "Push, permissions, store listings, and CI builds.",
        duration: "6+ weeks",
        image: img("photo-1555774698-0b77e0d5fac6"),
        steps: [
          { title: "Device capabilities", detail: "Camera, location, notifications — request permissions clearly and handle denial." },
          { title: "Build pipelines", detail: "Fastlane or EAS Build, versioning, environment configs for staging vs prod." },
          { title: "Store readiness", detail: "Icons, screenshots, privacy policy URL, and crash reporting (Sentry/Firebase Crashlytics)." },
        ],
      },
    ],
    docTips: ["Official Flutter docs codelabs are excellent starters.", "Expo docs if you chose RN + Expo — stay on supported SDK versions."],
  },
  cybersecurity: {
    headline: "Ethical hacking with a legal, structured mindset",
    subhead: "Linux + networking first, then web/app security, then labs and responsible disclosure — never test without permission.",
    startHere: [
      {
        title: "Lab setup",
        body: "VM with Kali or Parrot, vulnerable apps (DVWA, WebGoat), and a dedicated notes system (Obsidian/Notion). Separate learning from daily driver OS.",
        accent: "install",
      },
      {
        title: "Order of study",
        body: "Networking (TCP/IP, DNS, HTTP) → Linux shell fluency → OWASP Top 10 → burp basics → privilege escalation on practice boxes.",
        accent: "path",
      },
      {
        title: "First win",
        body: "Solve a few guided rooms on TryHackMe or HTB Academy. Document every flag: tools used, failed attempts, lessons.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Foundations",
        summary: "How computers talk, how the web works, and comfortable Linux.",
        duration: "6–10 weeks",
        image: img("photo-1563986768609-322da13575f3"),
        steps: [
          { title: "Networking", detail: "OSI model practically: ping, traceroute, curl, TLS handshake at a high level." },
          { title: "Linux CLI", detail: "Users, permissions, processes, services, bash scripting for automation." },
          { title: "Threat model", detail: "CIA triad, STRIDE lightly, and why scope matters in pentests." },
        ],
      },
      {
        phase: 2,
        title: "Web & app security",
        summary: "Mapping attack surface and common vuln classes.",
        duration: "8–14 weeks",
        image: img("photo-1614064641938-3bbee52942c7"),
        steps: [
          { title: "OWASP Top 10", detail: "For each item: example, detection, mitigation. Practice in legal labs only." },
          { title: "Tools", detail: "Burp Suite basics, nmap, ffuf — depth over collecting 50 tools." },
          { title: "Reporting", detail: "Write clear repro steps and impact — employers care as much as exploitation." },
        ],
      },
      {
        phase: 3,
        title: "Specialize",
        summary: "Bug bounty vs red team vs SOC — pick a lane and go deep.",
        duration: "Ongoing",
        image: img("photo-1555949963-aa79dcee981c"),
        steps: [
          { title: "CTF & boxes", detail: "Timed challenges to build pattern recognition; journal payloads that worked." },
          { title: "Certs (optional)", detail: "Security+, CEH, OSCP — align cert with role you want, not vanity." },
          { title: "Community", detail: "Read HackerOne/disclosure reports; ethics and reputation are the career moat." },
        ],
      },
    ],
    docTips: ["OWASP Testing Guide is long — use it as reference, not cover-to-cover.", "Follow hackerone.com/hacktivity for real fixed reports (sanitized)."],
  },
  "data-science": {
    headline: "Data → models → decisions",
    subhead: "Python first, then math intuition, then ML workflow: explore, train, evaluate, deploy responsibly.",
    startHere: [
      {
        title: "Stack",
        body: "Python 3.11+, Jupyter or VS Code, conda or venv. Install numpy, pandas, matplotlib early — you’ll live in them.",
        accent: "install",
      },
      {
        title: "Learning order",
        body: "Python fluency → pandas → visualization → probability/stats intuition → scikit-learn → deep learning last.",
        accent: "path",
      },
      {
        title: "First portfolio piece",
        body: "End-to-end notebook: question → dataset → cleaning → model → metrics → plain-English conclusions. Reproducible `requirements.txt`.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Python & data wrangling",
        summary: "Load, clean, aggregate, and plot real messy data.",
        duration: "4–8 weeks",
        image: img("photo-1555949963-ff9fe0c870eb"),
        steps: [
          { title: "Pandas", detail: "Indexes, merges, groupby, missing data strategies. Recreate a few FiveThirtyEight charts." },
          { title: "Visualization", detail: "Matplotlib/Seaborn/Plotly — prioritize readability over chart junk." },
          { title: "SQL touch", detail: "Basic joins and aggregations; most ML roles still query warehouses daily." },
        ],
      },
      {
        phase: 2,
        title: "ML fundamentals",
        summary: "Supervised learning, metrics, and honest evaluation.",
        duration: "8–12 weeks",
        image: img("photo-1620712943543-bcc4688e7485"),
        steps: [
          { title: "Scikit-learn", detail: "Train/test split, cross-val, pipelines, preprocessing. Classic datasets first." },
          { title: "Metrics", detail: "Precision/recall, ROC, calibration, class imbalance — know when accuracy lies." },
          { title: "Feature work", detail: "Domain features beat fancy models; document leakage risks." },
        ],
      },
      {
        phase: 3,
        title: "Deep learning & MLOps lite",
        summary: "PyTorch or TensorFlow, transfer learning, and packaging models.",
        duration: "10+ weeks",
        image: img("photo-1677442136019-21780ecad995"),
        steps: [
          { title: "Neural nets", detail: "Autograd intuition, CNNs for vision, RNN/Transformer intro for sequences." },
          { title: "Transfer learning", detail: "Fine-tune a pretrained model on a small dataset — the practical default." },
          { title: "Shipping", detail: "FastAPI + Docker or a notebook → batch job; track experiments (MLflow optional)." },
        ],
      },
    ],
    docTips: ["Kaggle Learn for short modules; avoid jumping to Kaggle competitions before basics.", "Read model cards and datasheets for ethics awareness."],
  },
  "cloud-computing": {
    headline: "Cloud-native skills employers actually test",
    subhead: "Pick one hyperscaler (AWS most common), learn IAM and networking, then compute, storage, and IaC.",
    startHere: [
      {
        title: "Accounts & safety",
        body: "Create a dedicated learning AWS org/account, enable MFA, set billing alerts. Never put access keys in Git.",
        accent: "install",
      },
      {
        title: "Study sequence",
        body: "IAM → VPC basics → EC2 + load balancing → S3 → databases → serverless (Lambda) → containers (ECS/EKS intro) → Terraform.",
        accent: "path",
      },
      {
        title: "Proof project",
        body: "Three-tier app diagram implemented minimally in cloud: static front, API, DB, with Terraform modules and README architecture diagram.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Core services",
        summary: "Identity, networking, compute, object storage.",
        duration: "4–8 weeks",
        image: img("photo-1451187580459-43490279c0fa"),
        steps: [
          { title: "IAM", detail: "Users, roles, policies, least privilege. Fix a too-open policy as an exercise." },
          { title: "Networking", detail: "Subnets, routes, security groups, NAT vs VPC endpoints conceptually." },
          { title: "EC2 & S3", detail: "Launch instance, attach role, host static site or API behind ALB when ready." },
        ],
      },
      {
        phase: 2,
        title: "Containers & orchestration",
        summary: "Docker fundamentals then Kubernetes concepts.",
        duration: "6–10 weeks",
        image: img("photo-1605745341112-85968b19335b"),
        steps: [
          { title: "Docker", detail: "Dockerfile best practices, multi-stage builds, compose for local stacks." },
          { title: "Kubernetes", detail: "Pods, deployments, services, ingress — minikube or EKS sandbox." },
          { title: "CI to cluster", detail: "GitHub Actions builds image, pushes to registry, deploys with rollout checks." },
        ],
      },
      {
        phase: 3,
        title: "IaC & reliability",
        summary: "Terraform, observability, cost, and cert alignment.",
        duration: "Ongoing",
        image: img("photo-1544197150-b99a580bb7a8"),
        steps: [
          { title: "Terraform", detail: "Modules, remote state, workspaces; destroy and recreate to prove repeatability." },
          { title: "Observability", detail: "CloudWatch basics, structured logs, alerts on error rate / latency SLOs." },
          { title: "Certs", detail: "Cloud Practitioner → Solutions Architect Associate path if job hunting." },
        ],
      },
    ],
    docTips: ["AWS Well-Architected Framework — skim the pillars; interviewers reference them.", "Cloudcraft.co for drawing diagrams you can explain out loud."],
  },
  devops: {
    headline: "Automate everything repeatable",
    subhead: "Git fluency, Linux, CI/CD, then config management and observability — DevOps is breadth with depth in automation.",
    startHere: [
      {
        title: "Baseline tools",
        body: "Git, SSH keys, Docker Desktop, WSL2 if on Windows, and a homelab or cloud free tier for experiments.",
        accent: "install",
      },
      {
        title: "Skill order",
        body: "Shell + Linux admin → Git branching strategies → CI (GitHub Actions) → containers → K8s intro → monitoring.",
        accent: "path",
      },
      {
        title: "Showcase",
        body: "Repo with pipeline: test → build image → deploy to staging with rollback story documented.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Linux & shell",
        summary: "You live in terminals — get fast and safe.",
        duration: "3–6 weeks",
        image: img("photo-1629654297291-c8456e4ca616"),
        steps: [
          { title: "Daily CLI", detail: "Navigation, pipes, grep/sed/awk basics, process management, systemd units." },
          { title: "Scripting", detail: "Bash or Python for glue; parameterize scripts; never hardcode secrets." },
          { title: "SSH hardening", detail: "Key-based auth, fail2ban awareness, firewall rules mentally mapped." },
        ],
      },
      {
        phase: 2,
        title: "CI/CD",
        summary: "Pipelines as code, artifacts, environments.",
        duration: "4–8 weeks",
        image: img("photo-1618401471353-b98afee0b2eb"),
        steps: [
          { title: "Git workflows", detail: "Trunk-based vs GitFlow; PR checks; semantic versioning." },
          { title: "GitHub Actions / Jenkins", detail: "Matrix builds, caches, secrets from vault/store, deployment gates." },
          { title: "Blue/green or canary", detail: "Understand rollout risk; implement simplest strategy on a sample app." },
        ],
      },
      {
        phase: 3,
        title: "Ops maturity",
        summary: "Infra as code, monitoring, incident response.",
        duration: "Ongoing",
        image: img("photo-1558494949-ef010cbdcc31"),
        steps: [
          { title: "IaC", detail: "Terraform or Ansible for repeatable environments; review plans before apply." },
          { title: "Observability", detail: "Metrics, logs, traces — pick stack (Prometheus/Grafana or cloud native)." },
          { title: "Incidents", detail: "Runbooks, blameless postmortems, on-call hygiene." },
        ],
      },
    ],
    docTips: ["Google SRE book — skim chapters on toil and error budgets.", "The Phoenix Project — narrative on why DevOps exists."],
  },
  database: {
    headline: "Data modeling & performance under load",
    subhead: "SQL depth first, then transactions, indexes, and scaling patterns — NoSQL when the access pattern demands it.",
    startHere: [
      {
        title: "Setup",
        body: "Local Postgres via Docker, pgAdmin or DBeaver, and a sample dataset (e.g. pagila). Turn on slow query log in practice.",
        accent: "install",
      },
      {
        title: "Sequence",
        body: "Relational theory → SQL joins & aggregates → indexes & EXPLAIN → normalization → transactions & isolation → replication basics.",
        accent: "path",
      },
      {
        title: "Project",
        body: "Design schema for a real domain (events + tickets + users), seed data, write reports as SQL views.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "SQL mastery",
        summary: "Readable queries beat clever queries.",
        duration: "4–8 weeks",
        image: img("photo-1544383835-bda2bc66a55d"),
        steps: [
          { title: "Core SQL", detail: "SELECT, JOINs, GROUP BY, window functions — LeetCode database problems for drill." },
          { title: "Modeling", detail: "PK/FK, constraints, 1NF–3NF trade-offs, when to denormalize." },
          { title: "Indexes", detail: "B-tree intuition, covering indexes, when indexes hurt writes." },
        ],
      },
      {
        phase: 2,
        title: "Postgres / MySQL in production",
        summary: "Migrations, backups, and performance.",
        duration: "6–10 weeks",
        image: img("photo-1544197150-b99a580bb7a8"),
        steps: [
          { title: "Migrations", detail: "Flyway/Liquibase/Prisma migrate — backward-compatible deploys." },
          { title: "Transactions", detail: "Isolation levels, deadlocks, optimistic locking patterns." },
          { title: "Ops basics", detail: "Replication lag, PITR, connection pooling (PgBouncer)." },
        ],
      },
      {
        phase: 3,
        title: "NoSQL & distributed",
        summary: "When document, key-value, or wide-column fits.",
        duration: "Ongoing",
        image: img("photo-1558494949-ef010cbdcc31"),
        steps: [
          { title: "MongoDB", detail: "Embedding vs referencing, aggregation pipeline, indexes on arrays." },
          { title: "Redis", detail: "Caching patterns, TTLs, eviction, pub/sub vs streams at high level." },
          { title: "CAP intuition", detail: "Why global scale forces trade-offs; read Dynamo/Cassandra primers." },
        ],
      },
    ],
    docTips: ["Use EXPLAIN (ANALYZE, BUFFERS) on every slow query you care about.", "PostgreSQL official docs → Performance Tips chapter."],
  },
  iot: {
    headline: "Sense, connect, act",
    subhead: "Electronics basics + microcontroller + networking protocols — safety first (power, soldering, isolation).",
    startHere: [
      {
        title: "Bench",
        body: "Arduino or ESP32 starter kit, USB cable, breadboard, multimeter, and a safe workspace. Read chip voltage limits twice.",
        accent: "install",
      },
      {
        title: "Progression",
        body: "Blink → sensors → serial protocols → Wi-Fi/MQTT → simple cloud dashboard → OTA updates conceptually.",
        accent: "path",
      },
      {
        title: "Deliverable",
        body: "One sensor → MQTT → Node-RED or cloud function → phone notification. Document wiring with Fritzing or photos.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Embedded basics",
        summary: "C/C++ on microcontrollers, GPIO, timing.",
        duration: "4–8 weeks",
        image: img("photo-1518770660439-4636190af475"),
        steps: [
          { title: "Arduino path", detail: "Sketches, libraries, PWM, interrupts. Build a small weather station." },
          { title: "Reading datasheets", detail: "Voltage, current draw, I²C/SPI wiring — skill that separates hobby from reliable builds." },
          { title: "Debugging", detail: "Serial logs, oscilloscope intro if available, systematic divide-and-conquer." },
        ],
      },
      {
        phase: 2,
        title: "Connectivity",
        summary: "Wireless stacks and brokers.",
        duration: "6–10 weeks",
        image: img("photo-1558346499-a692698bc5bd"),
        steps: [
          { title: "Wi-Fi / BLE", detail: "Provisioning flows, security (TLS to broker), power management on battery." },
          { title: "MQTT", detail: "Topics, QoS, retained messages; Mosquitto local then cloud IoT core." },
          { title: "Edge vs cloud", detail: "When to preprocess on device vs stream raw data." },
        ],
      },
      {
        phase: 3,
        title: "Systems",
        summary: "OTA, security, and product thinking.",
        duration: "Ongoing",
        image: img("photo-1581092160562-40aa08e78837"),
        steps: [
          { title: "Security", detail: "Secure boot concepts, key storage, no default passwords in firmware." },
          { title: "OTA updates", detail: "Signed images, rollback, staged rollout." },
          { title: "Integration", detail: "Grafana dashboards, alerts, fleet management services at high level." },
        ],
      },
    ],
    docTips: ["Arduino Reference for quick API lookup.", "MQTT specification — skim QoS and session sections once."],
  },
  blockchain: {
    headline: "Smart contracts & trust-minimized apps",
    subhead: "Solidity + security mindset first; wallets, testnets, and tooling — speculative trading is optional, engineering is not.",
    startHere: [
      {
        title: "Dev environment",
        body: "Node.js, Hardhat or Foundry, MetaMask, testnet ETH from faucet. Never use mainnet keys in tutorials.",
        accent: "install",
      },
      {
        title: "Sequence",
        body: "Blockchain concepts → Ethereum accounts & gas → Solidity syntax → testing → Hardhat deploy → frontend read/write via ethers/viem.",
        accent: "path",
      },
      {
        title: "Portfolio",
        body: "ERC-20 or NFT contract with tests, deployed to testnet, verified on Etherscan, tiny React dApp reading contract state.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Foundations",
        summary: "How chains agree, what a contract is, security stakes.",
        duration: "3–6 weeks",
        image: img("photo-1639762681485-074b7f938ba0"),
        steps: [
          { title: "Concepts", detail: "Consensus lightly, immutability, finality, MEV awareness as advanced topic." },
          { title: "Solidity basics", detail: "Types, mappings, modifiers, events, access control patterns (Ownable vs roles)." },
          { title: "Testing", detail: "Hardhat tests with chai; aim for edge cases and reverts." },
        ],
      },
      {
        phase: 2,
        title: "dApp stack",
        summary: "Wallets, RPCs, indexing, gas UX.",
        duration: "6–10 weeks",
        image: img("photo-1639322537504-6427a16b0a28"),
        steps: [
          { title: "Frontend integration", detail: "Connect wallet, chain switching, read balances, send txs with clear pending states." },
          { title: "Upgrade patterns", detail: "Proxies at high level; why upgrades are dangerous if misused." },
          { title: "Common vulns", detail: "Reentrancy, overflow (pre-0.8), access control — OWASP for contracts (SWC registry)." },
        ],
      },
      {
        phase: 3,
        title: "Depth",
        summary: "DeFi primitives, audits, L2s.",
        duration: "Ongoing",
        image: img("photo-1642104704074-907c0698cbd9"),
        steps: [
          { title: "Standards", detail: "ERC-20/721/1155 — read EIP documents, not only tutorials." },
          { title: "Audits", detail: "Read public audit reports; learn vocabulary (invariants, assumptions)." },
          { title: "L2 & bridges", detail: "Rollup intuition, bridge risks — stay honest about what you understand." },
        ],
      },
    ],
    docTips: ["Solidity docs + CryptoZombies for interactive start.", "Ethereum.org developers section for conceptual maps."],
  },
  "ui-ux": {
    headline: "Design with evidence, not only taste",
    subhead: "Research → structure → visual design → prototypes → test — Figma is the pencil, not the craft.",
    startHere: [
      {
        title: "Tools",
        body: "Figma (free tier), FigJam for flows, a place for screenshots (Eagle, Pinterest boards). Optional: pen and paper first.",
        accent: "install",
      },
      {
        title: "Sequence",
        body: "Heuristics & accessibility basics → user flows → low-fi wireframes → design system tokens → high-fi UI → usability tests.",
        accent: "path",
      },
      {
        title: "Portfolio piece",
        body: "One case study: problem, users interviewed, iterations with thumbnails, final prototype link, metrics or qualitative outcomes.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Foundations",
        summary: "Visual hierarchy, typography, color, spacing systems.",
        duration: "4–8 weeks",
        image: img("photo-1561070791-2526d30994b5"),
        steps: [
          { title: "Principles", detail: "Alignment, contrast, repetition, proximity — redesign a bad screen and explain changes." },
          { title: "Accessibility", detail: "WCAG contrast, focus states, keyboard paths, semantic structure." },
          { title: "Components", detail: "Buttons, inputs, tables — build a small design system in Figma with variants." },
        ],
      },
      {
        phase: 2,
        title: "UX process",
        summary: "Discovery and validation beat pixel polish early.",
        duration: "6–10 weeks",
        image: img("photo-1586717791821-3f44a563fa4c"),
        steps: [
          { title: "Research", detail: "Interviews, surveys, competitive analysis — synthesize into personas only if honest." },
          { title: "IA & flows", detail: "Sitemaps, user flows, edge cases, empty states, error states." },
          { title: "Testing", detail: "Moderated usability tests, note quotes, prioritize fixes by severity." },
        ],
      },
      {
        phase: 3,
        title: "Handoff & systems",
        summary: "Developers should love your files.",
        duration: "Ongoing",
        image: img("photo-1558655146-d09347e92766"),
        steps: [
          { title: "Specs", detail: "Auto-layout, constraints, redlines or dev mode; document motion sparingly." },
          { title: "Design ops", detail: "Versioning, naming, libraries for teams; align with engineering component library when possible." },
          { title: "Brand", detail: "Voice, illustration style, photography direction — consistency builds trust." },
        ],
      },
    ],
    docTips: ["Laws of UX — short reference for cognitive biases in design.", "Nielsen heuristics — memorize the 10 headlines."],
  },
  dsa: {
    headline: "Patterns beat memorizing solutions",
    subhead: "Language fluency → complexity intuition → topic-wise drills → timed practice → interview storytelling.",
    startHere: [
      {
        title: "Setup",
        body: "Pick one language (C++/Java/Python). Install IDE with debugger. Create accounts on LeetCode, Codeforces (optional), and a spreadsheet tracker.",
        accent: "install",
      },
      {
        title: "Order",
        body: "Arrays & hashing → two pointers/sliding window → stacks/queues → trees/graphs → DP (last, hardest). Mix theory + daily problems.",
        accent: "path",
      },
      {
        title: "Milestone",
        body: "50–100 problems with tagged patterns, upsolve failures next day. Speed comes after recognition accuracy.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Core structures",
        summary: "Arrays, strings, hashing, linked lists, stacks.",
        duration: "4–8 weeks",
        image: img("photo-1516116216624-53e697fedbea"),
        steps: [
          { title: "Big-O", detail: "Count loops, recursion depth, space for auxiliary structures — predict before submit." },
          { title: "Hashing", detail: "Frequency maps, prefix sums, sliding window classics." },
          { title: "Linked structures", detail: "Reverse, cycle detection, merge — draw before code." },
        ],
      },
      {
        phase: 2,
        title: "Trees & graphs",
        summary: "Recursion → DFS/BFS → shortest path families.",
        duration: "6–12 weeks",
        image: img("photo-1504639725590-34d0984388bd"),
        steps: [
          { title: "Trees", detail: "Traversals, BST operations, lowest common ancestor, path sums." },
          { title: "Graphs", detail: "Adjacency list/matrix, BFS/DFS, topo sort, union-find." },
          { title: "Heaps", detail: "K-th largest, merging lists, scheduling patterns." },
        ],
      },
      {
        phase: 3,
        title: "DP & contests",
        summary: "States, transitions, optimization; timed rounds for speed.",
        duration: "12+ weeks",
        image: img("photo-1517694712202-14dd9538aa97"),
        steps: [
          { title: "DP patterns", detail: "1D/2D DP, knapsack variants, grid paths — derive recurrence on paper." },
          { title: "Greedy proofs", detail: "Exchange arguments; know when greedy fails." },
          { title: "Timed practice", detail: "Weekly contests; upsolve upsolve upsolve." },
        ],
      },
    ],
    docTips: ["CLRS for theory — use as reference, not front-to-back.", "Print debugging templates for recursion to avoid blind trust."],
  },
  "system-design": {
    headline: "Trade-offs under constraints",
    subhead: "Clarify requirements → estimate capacity → sketch components → deep dive on data & hot paths → failure modes.",
    startHere: [
      {
        title: "Prereqs",
        body: "Comfortable networking (DNS, TCP, HTTP), basic SQL, and one cloud provider overview. No need to be senior in all — honesty wins interviews.",
        accent: "install",
      },
      {
        title: "Study flow",
        body: "Read engineering blogs (Netflix, Uber) → map features to services → practice 45-min mock interviews with peers → record yourself explaining diagrams.",
        accent: "path",
      },
      {
        title: "Deliverable",
        body: "Notebook of 15 classic designs (URL shortener, chat, feed) with your own diagrams and numbers, not copied estimates.",
        accent: "build",
      },
    ],
    phases: [
      {
        phase: 1,
        title: "Building blocks",
        summary: "Load balancers, caches, CDNs, databases, queues.",
        duration: "4–8 weeks",
        image: img("photo-1558494949-ef010cbdcc31"),
        steps: [
          { title: "Primitives", detail: "Horizontal vs vertical scale, stateless services, sticky sessions when needed." },
          { title: "Caching", detail: "Client, CDN, app, DB caches; invalidation strategies; cache stampede awareness." },
          { title: "Data stores", detail: "SQL vs NoSQL choice by access pattern; replication; sharding when necessary." },
        ],
      },
      {
        phase: 2,
        title: "Patterns",
        summary: "Microservices, event-driven, idempotency.",
        duration: "6–12 weeks",
        image: img("photo-1454165205744-3b78555e5572"),
        steps: [
          { title: "Decomposition", detail: "Bounded contexts; avoid distributed monolith early." },
          { title: "Messaging", detail: "Queues vs pub/sub, at-least-once delivery, consumer idempotency." },
          { title: "Consistency", detail: "Strong vs eventual; saga/outbox at high level." },
        ],
      },
      {
        phase: 3,
        title: "Interview execution",
        summary: "Communication beats perfect architecture.",
        duration: "Ongoing",
        image: img("photo-1551434678-e076c223a692"),
        steps: [
          { title: "Clarify", detail: "Functional + non-functional requirements; traffic, latency, consistency expectations." },
          { title: "Math", detail: "Back-of-envelope QPS, storage, bandwidth — round confidently." },
          { title: "Deep dives", detail: "Pick 2 areas to go deep: e.g. feed ranking + fanout on write vs read." },
        ],
      },
    ],
    docTips: ["Designing Data-Intensive Applications — chapters 1–5 are gold.", "ByteByteGo newsletter for diagram vocabulary."],
  },
};

export function getDomainGuidance(domainId: string): DomainGuidance | undefined {
  return guidanceMap[domainId];
}
