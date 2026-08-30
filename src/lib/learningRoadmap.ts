import { domains } from "@/lib/domains";

export type EditorMode = "web" | "python" | "java" | "sql" | "generic";

export interface LevelDef {
  index: number; // 1-based
  title: string;
  tier: "Beginner" | "Easy" | "Intermediate" | "Advanced" | "Expert";
  concepts: string[];
  objective: string;
  xp: number;
  milestone?: string;
}

const TIERS: LevelDef["tier"][] = ["Beginner", "Easy", "Intermediate", "Advanced", "Expert"];

const tierFor = (i: number): LevelDef["tier"] => TIERS[Math.min(TIERS.length - 1, Math.floor((i - 1) / 6))];

const xpFor = (i: number) => 50 + Math.floor((i - 1) / 6) * 50;

/** Curated 30-level curricula. Domains not listed derive levels from their topic list. */
const CURRICULA: Record<string, string[]> = {
  "web-development": [
    "HTML Fundamentals", "CSS Fundamentals", "Responsive Design", "Flexbox & Grid", "JavaScript Fundamentals",
    "DOM Manipulation", "Events & Forms", "Async JavaScript", "Fetch & REST APIs", "ES6+ Patterns",
    "Git & GitHub", "Tooling & Vite", "React Fundamentals", "React Components & Props", "React State & Hooks",
    "React Router", "Forms & Validation", "State Management", "Tailwind & Design Systems", "Testing Basics",
    "Next.js Fundamentals", "Node.js & Express", "REST API Design", "Databases & SQL", "Authentication & Sessions",
    "File Uploads & Storage", "Realtime & Websockets", "Performance & SEO", "Deployment & CI/CD", "Production Full-Stack Project",
  ],
  "app-development": [
    "Mobile Basics", "React Native Setup", "Core Components", "Styling & Layout", "Lists & ScrollViews",
    "Navigation", "Forms & Input", "State & Hooks", "Async Storage", "Networking & APIs",
    "Native Modules", "Animations", "Gestures", "Camera & Media", "Push Notifications",
    "Maps & Location", "Auth Flows", "Offline First", "Deep Linking", "Theming",
    "Performance Profiling", "Testing", "Expo Build Pipeline", "App Store Assets", "Analytics",
    "Crash Reporting", "In-App Purchases", "Accessibility", "Release Management", "Production App Project",
  ],
  "data-science": [
    "Python Fundamentals", "Control Flow & Functions", "Data Structures", "NumPy Basics", "Pandas Basics",
    "Data Cleaning", "Exploratory Analysis", "Visualization with Matplotlib", "Statistics Essentials", "Probability",
    "Feature Engineering", "Linear Regression", "Logistic Regression", "Decision Trees", "Ensembles",
    "Model Evaluation", "Cross Validation", "Unsupervised Learning", "Dimensionality Reduction", "Time Series",
    "NLP Basics", "Neural Networks", "Deep Learning with PyTorch", "CNNs", "Transformers",
    "MLOps Basics", "Model Deployment", "Experiment Tracking", "Data Pipelines", "Capstone ML Project",
  ],
  cybersecurity: [
    "Security Fundamentals", "Linux Essentials", "Networking Basics", "Reconnaissance", "Scanning with Nmap",
    "Web App Basics", "OWASP Top 10", "SQL Injection", "XSS", "Authentication Attacks",
    "Access Control Flaws", "Cryptography Basics", "Hashing & Passwords", "TLS & PKI", "Burp Suite Workflow",
    "API Security", "Privilege Escalation", "Malware Basics", "Forensics Basics", "Log Analysis",
    "SIEM & Monitoring", "Incident Response", "Cloud Security", "Container Security", "Secure Coding",
    "Threat Modeling", "Red vs Blue", "Reporting & Compliance", "CTF Practice", "Capstone Security Audit",
  ],
  "cloud-computing": [
    "Cloud Concepts", "Linux & CLI", "IAM Basics", "Compute & VMs", "Storage Services",
    "Networking & VPC", "Load Balancing", "Managed Databases", "Serverless Functions", "Containers Intro",
    "Docker Fundamentals", "Docker Compose", "Kubernetes Basics", "Deployments & Services", "Config & Secrets",
    "Helm", "Autoscaling", "Observability", "Cost Optimization", "Infrastructure as Code",
    "Terraform Basics", "CI/CD Pipelines", "Multi-Region Design", "Caching & CDN", "Message Queues",
    "Security Best Practices", "Disaster Recovery", "Well-Architected Review", "Migration Strategy", "Capstone Cloud Deployment",
  ],
  devops: [
    "DevOps Culture", "Linux & Bash", "Git Workflows", "Build Systems", "Docker Fundamentals",
    "Container Registries", "CI Basics", "GitHub Actions", "Testing in CI", "Artifact Management",
    "CD Strategies", "Blue/Green & Canary", "Kubernetes Basics", "Helm Charts", "Secrets Management",
    "Terraform Basics", "Ansible Basics", "Monitoring with Prometheus", "Dashboards with Grafana", "Log Aggregation",
    "Alerting & On-Call", "SLOs & Error Budgets", "Incident Response", "Chaos Testing", "Security in Pipelines",
    "Cost & Capacity", "Platform Engineering", "GitOps", "Scaling Teams", "Capstone Delivery Pipeline",
  ],
  database: [
    "Data Modeling Basics", "SQL SELECT", "Filtering & Sorting", "Joins", "Aggregations",
    "Subqueries", "Views", "Indexes", "Normalization", "Constraints & Keys",
    "Transactions", "Isolation Levels", "Stored Procedures", "Triggers", "Window Functions",
    "CTEs & Recursion", "Query Planning", "Performance Tuning", "Partitioning", "Replication",
    "Backups & Restore", "NoSQL Concepts", "Document Stores", "Key-Value Stores", "Graph Databases",
    "Caching Layers", "Data Warehousing", "ETL Pipelines", "Security & RLS", "Capstone Database Project",
  ],
  blockchain: [
    "Blockchain Basics", "Wallets & Keys", "Ethereum Overview", "Solidity Syntax", "Types & Storage",
    "Functions & Modifiers", "Events", "Mappings & Structs", "Inheritance", "ERC-20 Tokens",
    "ERC-721 NFTs", "Testing with Hardhat", "Deployment Scripts", "Gas Optimization", "Security Pitfalls",
    "Reentrancy & Guards", "Upgradeable Contracts", "Oracles", "DeFi Primitives", "AMMs",
    "Staking Contracts", "DAO Governance", "Web3 Frontends", "Wallet Connect", "Indexing & Subgraphs",
    "Layer 2s", "Auditing Basics", "Tokenomics", "Mainnet Launch", "Capstone dApp",
  ],
};

const EDITOR_MODES: Record<string, EditorMode> = {
  "web-development": "web",
  "app-development": "web",
  "ui-ux": "web",
  "data-science": "python",
  "ai-ml": "python",
  "machine-learning": "python",
  database: "sql",
  blockchain: "web",
};

export const editorModeFor = (domainId: string): EditorMode => EDITOR_MODES[domainId] ?? "generic";

export const MILESTONES: Record<number, string> = {
  6: "Project 1 — Personal Portfolio",
  12: "Project 2 — Interactive App",
  20: "Project 3 — Dashboard / Data App",
  26: "Project 4 — Full Stack Application",
  30: "Final Capstone Project",
};

export const TOTAL_LEVELS = 30;

export function getRoadmap(domainId: string): LevelDef[] {
  const curated = CURRICULA[domainId];
  const domain = domains.find((d) => d.id === domainId);
  const topics = domain?.topics ?? [];

  const titles: string[] = [];
  for (let i = 0; i < TOTAL_LEVELS; i++) {
    if (curated?.[i]) titles.push(curated[i]);
    else if (topics.length) {
      const base = topics[i % topics.length];
      const round = Math.floor(i / topics.length);
      titles.push(round === 0 ? base : `${base} — ${["Deep Dive", "Advanced", "Mastery"][round - 1] ?? `Part ${round + 1}`}`);
    } else titles.push(`Level ${i + 1}`);
  }

  return titles.map((title, idx) => {
    const index = idx + 1;
    return {
      index,
      title,
      tier: tierFor(index),
      concepts: conceptsFor(title),
      objective: `By the end of this level you will be able to confidently apply ${title} in real ${domain?.name ?? "engineering"} projects.`,
      xp: xpFor(index),
      milestone: MILESTONES[index],
    };
  });
}

function conceptsFor(title: string): string[] {
  return [
    `Core ideas behind ${title}`,
    `Syntax & practical patterns`,
    `Common mistakes and how to avoid them`,
    `Hands-on mini exercise`,
  ];
}

export const lessonDuration = (index: number) => {
  const mins = 8 + ((index * 3) % 9);
  const secs = (index * 17) % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

export const starterCodeFor = (mode: EditorMode, level: LevelDef) => {
  switch (mode) {
    case "web":
      return {
        html: `<!-- ${level.title} -->\n<div class="card">\n  <h1>Hello Lunor</h1>\n  <p>Practice ${level.title} here.</p>\n</div>\n`,
        css: `body { font-family: system-ui; background:#0b0b0d; color:#f5f5f5; display:grid; place-items:center; min-height:100vh; }\n.card { border:1px solid #ef44441a; border-radius:16px; padding:32px; background:#141416; }\n`,
        js: `console.log("Level ${level.index}: ${level.title}");\n`,
      };
    case "python":
      return { code: `# ${level.title}\n\ndef main():\n    print("Practice ${level.title}")\n\nmain()\n` };
    case "sql":
      return { code: `-- ${level.title}\nSELECT 'practice' AS lesson;\n` };
    case "java":
      return { code: `// ${level.title}\nclass Main {\n  public static void main(String[] a) {\n    System.out.println("Practice ${level.title}");\n  }\n}\n` };
    default:
      return { code: `// ${level.title}\nconsole.log("Practice ${level.title}");\n` };
  }
};
