import { Code2, Smartphone, Shield, Database, Brain, Cloud, Cpu, Globe, Palette, Terminal, Wifi, BarChart3 } from "lucide-react";

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: typeof Code2;
  color: string;
  topics: string[];
  resources: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: "video" | "article" | "course";
  source: string;
  url: string;
  duration?: string;
}

export const domains: Domain[] = [
  {
    id: "web-development",
    name: "Web Development",
    description: "Master HTML, CSS, JavaScript, React, Node.js, and modern web frameworks to build full-stack applications.",
    icon: Globe,
    color: "168 80% 50%",
    topics: ["HTML/CSS", "JavaScript", "React", "Node.js", "TypeScript", "Next.js", "REST APIs", "GraphQL"],
    resources: [
      { id: "wd1", title: "Complete Web Development Bootcamp", type: "course", source: "Udemy", url: "#", duration: "65h" },
      { id: "wd2", title: "React Full Course 2026", type: "video", source: "YouTube", url: "#", duration: "12h" },
      { id: "wd3", title: "Modern JavaScript Deep Dive", type: "article", source: "MDN", url: "#" },
    ],
  },
  {
    id: "app-development",
    name: "App Development",
    description: "Build native and cross-platform mobile apps with React Native, Flutter, Swift, and Kotlin.",
    icon: Smartphone,
    color: "260 60% 55%",
    topics: ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Expo", "Firebase"],
    resources: [
      { id: "ad1", title: "Flutter Complete Guide", type: "course", source: "Udemy", url: "#", duration: "42h" },
      { id: "ad2", title: "React Native Crash Course", type: "video", source: "YouTube", url: "#", duration: "4h" },
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Learn ethical hacking, penetration testing, network security, and protect digital infrastructure.",
    icon: Shield,
    color: "0 72% 50%",
    topics: ["Ethical Hacking", "Penetration Testing", "Network Security", "Cryptography", "OWASP", "SOC", "Forensics"],
    resources: [
      { id: "cs1", title: "Ethical Hacking Masterclass", type: "course", source: "Udemy", url: "#", duration: "50h" },
      { id: "cs2", title: "Bug Bounty Hunting Guide", type: "video", source: "YouTube", url: "#", duration: "8h" },
    ],
  },
  {
    id: "data-science",
    name: "Data Science & ML",
    description: "Explore machine learning, deep learning, data analysis, and AI with Python and TensorFlow.",
    icon: Brain,
    color: "45 80% 55%",
    topics: ["Python", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "NLP", "Computer Vision"],
    resources: [
      { id: "ds1", title: "Machine Learning A-Z", type: "course", source: "Udemy", url: "#", duration: "44h" },
      { id: "ds2", title: "Deep Learning Specialization", type: "course", source: "Coursera", url: "#", duration: "80h" },
    ],
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing",
    description: "Master AWS, Azure, GCP, Docker, Kubernetes, and cloud-native architecture.",
    icon: Cloud,
    color: "200 70% 50%",
    topics: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Serverless"],
    resources: [
      { id: "cc1", title: "AWS Solutions Architect", type: "course", source: "Udemy", url: "#", duration: "35h" },
    ],
  },
  {
    id: "devops",
    name: "DevOps",
    description: "Learn CI/CD pipelines, infrastructure as code, monitoring, and deployment automation.",
    icon: Terminal,
    color: "340 65% 55%",
    topics: ["Jenkins", "GitHub Actions", "Ansible", "Prometheus", "Grafana", "Linux", "Bash", "Nginx"],
    resources: [
      { id: "do1", title: "DevOps Bootcamp", type: "course", source: "Udemy", url: "#", duration: "30h" },
    ],
  },
  {
    id: "database",
    name: "Database Engineering",
    description: "Master SQL, NoSQL, database design, optimization, and distributed systems.",
    icon: Database,
    color: "168 50% 40%",
    topics: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Cassandra", "Database Design", "Query Optimization"],
    resources: [
      { id: "db1", title: "SQL Masterclass", type: "course", source: "Udemy", url: "#", duration: "20h" },
    ],
  },
  {
    id: "iot",
    name: "IoT & Embedded",
    description: "Build connected devices with Arduino, Raspberry Pi, MQTT, and edge computing.",
    icon: Wifi,
    color: "120 50% 45%",
    topics: ["Arduino", "Raspberry Pi", "MQTT", "Edge Computing", "Sensors", "ESP32", "Embedded C"],
    resources: [
      { id: "io1", title: "IoT with Arduino & Pi", type: "course", source: "Udemy", url: "#", duration: "25h" },
    ],
  },
  {
    id: "blockchain",
    name: "Blockchain & Web3",
    description: "Develop smart contracts, dApps, and understand blockchain architecture with Solidity.",
    icon: Cpu,
    color: "280 60% 50%",
    topics: ["Solidity", "Ethereum", "Smart Contracts", "DeFi", "NFTs", "Web3.js", "Hardhat"],
    resources: [
      { id: "bc1", title: "Blockchain Developer Course", type: "course", source: "Udemy", url: "#", duration: "38h" },
    ],
  },
  {
    id: "ui-ux",
    name: "UI/UX Design",
    description: "Create stunning user interfaces and experiences with Figma, design systems, and prototyping.",
    icon: Palette,
    color: "320 70% 55%",
    topics: ["Figma", "Design Systems", "Wireframing", "Prototyping", "User Research", "Accessibility"],
    resources: [
      { id: "ux1", title: "UI/UX Design Bootcamp", type: "course", source: "Udemy", url: "#", duration: "28h" },
    ],
  },
  {
    id: "dsa",
    name: "DSA & Competitive",
    description: "Master data structures, algorithms, and competitive programming for placements.",
    icon: BarChart3,
    color: "30 80% 50%",
    topics: ["Arrays", "Trees", "Graphs", "Dynamic Programming", "Sorting", "Searching", "LeetCode"],
    resources: [
      { id: "dsa1", title: "DSA Complete Course", type: "course", source: "YouTube", url: "#", duration: "60h" },
    ],
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Learn to architect scalable, distributed systems used by top tech companies.",
    icon: Code2,
    color: "190 60% 45%",
    topics: ["Load Balancing", "Caching", "Microservices", "Message Queues", "CAP Theorem", "Sharding"],
    resources: [
      { id: "sd1", title: "System Design Interview Prep", type: "course", source: "Udemy", url: "#", duration: "20h" },
    ],
  },
];
