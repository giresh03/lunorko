import { Code2, Smartphone, Shield, Database, Brain, Cloud, Cpu, Globe, Palette, Terminal, Wifi, BarChart3, CircuitBoard, Zap, Radio, Bot } from "lucide-react";

import webDevImg from "@/assets/domains/web-development.jpg";
import appDevImg from "@/assets/domains/app-development.jpg";
import cybersecurityImg from "@/assets/domains/cybersecurity.jpg";
import dataScienceImg from "@/assets/domains/data-science.jpg";
import cloudImg from "@/assets/domains/cloud-computing.jpg";
import devopsImg from "@/assets/domains/devops.jpg";
import databaseImg from "@/assets/domains/database.jpg";
import iotImg from "@/assets/domains/iot.jpg";
import blockchainImg from "@/assets/domains/blockchain.jpg";
import uiuxImg from "@/assets/domains/ui-ux.jpg";
import dsaImg from "@/assets/domains/dsa.jpg";
import systemDesignImg from "@/assets/domains/system-design.jpg";
import vlsiImg from "@/assets/domains/vlsi.jpg";
import powerSystemsImg from "@/assets/domains/power-systems.jpg";
import signalProcessingImg from "@/assets/domains/signal-processing.jpg";
import roboticsImg from "@/assets/domains/robotics.jpg";

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: typeof Code2;
  color: string;
  image: string;
  topics: string[];
  resources: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: "video" | "article" | "course" | "pdf";
  source: string;
  url: string;
  duration?: string;
  thumbnail?: string;
  description?: string;
}

export const domains: Domain[] = [
  {
    id: "web-development",
    name: "Web Development",
    description: "Master HTML, CSS, JavaScript, React, Node.js, and modern web frameworks to build full-stack applications.",
    icon: Globe,
    color: "168 80% 50%",
    image: webDevImg,
    topics: ["HTML/CSS", "JavaScript", "React", "Node.js", "TypeScript", "Next.js", "REST APIs", "GraphQL"],
    resources: [
      { id: "wd1", title: "The Complete 2024 Web Development Bootcamp", type: "course", source: "Udemy", url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/", duration: "65h", description: "By Dr. Angela Yu — #1 bestselling web dev course covering HTML, CSS, JS, React, Node.js, MongoDB and more." },
      { id: "wd2", title: "HTML & CSS Full Course for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=mU6anWqZJcc", duration: "6h 31m", thumbnail: "https://img.youtube.com/vi/mU6anWqZJcc/maxresdefault.jpg", description: "Dave Gray's complete HTML & CSS tutorial for absolute beginners." },
      { id: "wd3", title: "JavaScript Full Course for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=EfAl9bwzVZk", duration: "8h", thumbnail: "https://img.youtube.com/vi/EfAl9bwzVZk/maxresdefault.jpg", description: "Complete JavaScript tutorial from scratch by Dave Gray." },
      { id: "wd4", title: "React Full Course 2024", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=CgkZ7MvWUAA", duration: "11h", thumbnail: "https://img.youtube.com/vi/CgkZ7MvWUAA/maxresdefault.jpg", description: "Learn React 18 from scratch with projects — by JavaScript Mastery." },
      { id: "wd5", title: "Node.js Full Course for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=f2EqECiTBL8", duration: "7h", thumbnail: "https://img.youtube.com/vi/f2EqECiTBL8/maxresdefault.jpg", description: "Complete Node.js backend course by Dave Gray." },
      { id: "wd6", title: "MERN Stack Tutorial", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=O3BUHwfHf84", duration: "4h 30m", thumbnail: "https://img.youtube.com/vi/O3BUHwfHf84/maxresdefault.jpg", description: "Build a full-stack MERN project from scratch by JavaScript Mastery." },
      { id: "wd7", title: "HTML Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/html-tutorial/", description: "Comprehensive HTML reference with examples and practice problems." },
      { id: "wd8", title: "JavaScript Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/javascript/", description: "Complete JavaScript guide from basics to advanced concepts." },
      { id: "wd9", title: "Modern JavaScript Deep Dive — MDN", type: "article", source: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", description: "Official Mozilla documentation for JavaScript." },
      { id: "wd10", title: "The Complete JavaScript Course 2024", type: "course", source: "Udemy", url: "https://www.udemy.com/course/the-complete-javascript-course/", duration: "69h", description: "By Jonas Schmedtmann — Master JS with projects, challenges, and theory." },
      { id: "wd11", title: "Next.js Full Course — Build & Deploy", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=wm5gMKuwSYk", duration: "5h", thumbnail: "https://img.youtube.com/vi/wm5gMKuwSYk/maxresdefault.jpg", description: "Build and deploy a modern Next.js 14 application from scratch." },
      { id: "wd12", title: "TypeScript Full Course for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=30LWjhZzg50", duration: "8h", thumbnail: "https://img.youtube.com/vi/30LWjhZzg50/maxresdefault.jpg", description: "Learn TypeScript from zero to hero by Dave Gray." },
    ],
  },
  {
    id: "app-development",
    name: "App Development",
    description: "Build native and cross-platform mobile apps with React Native, Flutter, Swift, and Kotlin.",
    icon: Smartphone,
    color: "260 60% 55%",
    image: appDevImg,
    topics: ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Expo", "Firebase"],
    resources: [
      { id: "ad1", title: "Flutter & Dart — The Complete Guide", type: "course", source: "Udemy", url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/", duration: "42h", description: "By Maximilian Schwarzmüller — Build iOS & Android apps with Flutter." },
      { id: "ad2", title: "React Native Tutorial for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=obH0Po_RdWk", duration: "2h 30m", thumbnail: "https://img.youtube.com/vi/obH0Po_RdWk/maxresdefault.jpg", description: "Programming with Mosh — React Native crash course." },
      { id: "ad3", title: "Flutter Full Course — Build 4 Apps", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=VPvVD8t02U8", duration: "37h", thumbnail: "https://img.youtube.com/vi/VPvVD8t02U8/maxresdefault.jpg", description: "Vandad Nahavandipoor's complete Flutter course with 4 real projects." },
      { id: "ad4", title: "Kotlin Full Course for Android", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=EExSSotojVI", duration: "4h", thumbnail: "https://img.youtube.com/vi/EExSSotojVI/maxresdefault.jpg", description: "FreeCodeCamp's Kotlin course for Android development." },
      { id: "ad5", title: "React Native Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/react-native-tutorial/", description: "Step-by-step React Native guide with code examples." },
      { id: "ad6", title: "Flutter Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/flutter-tutorial/", description: "Comprehensive Flutter guide from installation to advanced widgets." },
      { id: "ad7", title: "The Complete React Native + Hooks Course", type: "course", source: "Udemy", url: "https://www.udemy.com/course/the-complete-react-native-and-redux-course/", duration: "38h", description: "By Stephen Grider — Build full mobile apps with React Native." },
    ],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Learn ethical hacking, penetration testing, network security, and protect digital infrastructure.",
    icon: Shield,
    color: "0 72% 50%",
    image: cybersecurityImg,
    topics: ["Ethical Hacking", "Penetration Testing", "Network Security", "Cryptography", "OWASP", "SOC", "Forensics"],
    resources: [
      { id: "cs1", title: "The Complete Ethical Hacking Course", type: "course", source: "Udemy", url: "https://www.udemy.com/course/penetration-testing/", duration: "50h", description: "By Ermin Kreponic — Learn ethical hacking from scratch to advanced." },
      { id: "cs2", title: "Full Ethical Hacking Course — Beginner", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", duration: "15h", thumbnail: "https://img.youtube.com/vi/3Kq1MIfTWCE/maxresdefault.jpg", description: "FreeCodeCamp's complete ethical hacking course for beginners." },
      { id: "cs3", title: "Bug Bounty Hunting Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=Rp69edBmFFo", duration: "3h", thumbnail: "https://img.youtube.com/vi/Rp69edBmFFo/maxresdefault.jpg", description: "Learn bug bounty hunting techniques and methodology." },
      { id: "cs4", title: "Cybersecurity Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/cyber-security-tutorial/", description: "Complete cybersecurity guide covering threats, tools, and defense." },
      { id: "cs5", title: "OWASP Top 10 Explained", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=rWHvp7rUka8", duration: "1h 30m", thumbnail: "https://img.youtube.com/vi/rWHvp7rUka8/maxresdefault.jpg", description: "Understanding the top 10 web application security risks." },
      { id: "cs6", title: "Network Security Fundamentals", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/network-security/", description: "Network security concepts, protocols, and best practices." },
    ],
  },
  {
    id: "data-science",
    name: "Data Science & ML",
    description: "Explore machine learning, deep learning, data analysis, and AI with Python and TensorFlow.",
    icon: Brain,
    color: "45 80% 55%",
    image: dataScienceImg,
    topics: ["Python", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "NLP", "Computer Vision"],
    resources: [
      { id: "ds1", title: "Machine Learning A-Z: AI, Python & R", type: "course", source: "Udemy", url: "https://www.udemy.com/course/machinelearning/", duration: "44h", description: "By Kirill Eremenko — Hands-on ML with Python & R." },
      { id: "ds2", title: "Machine Learning Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=7eh4d6sabA0", duration: "12h", thumbnail: "https://img.youtube.com/vi/7eh4d6sabA0/maxresdefault.jpg", description: "Edureka's complete machine learning course with projects." },
      { id: "ds3", title: "Python for Data Science — FreeCodeCamp", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI", duration: "12h", thumbnail: "https://img.youtube.com/vi/LHBE6Q9XlzI/maxresdefault.jpg", description: "Complete Python for data science and ML course." },
      { id: "ds4", title: "Deep Learning Specialization", type: "course", source: "Coursera", url: "https://www.coursera.org/specializations/deep-learning", duration: "80h", description: "By Andrew Ng — The definitive deep learning course." },
      { id: "ds5", title: "TensorFlow Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=tPYj3fFJGjk", duration: "7h", thumbnail: "https://img.youtube.com/vi/tPYj3fFJGjk/maxresdefault.jpg", description: "FreeCodeCamp's TensorFlow 2.0 complete course." },
      { id: "ds6", title: "Machine Learning Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/machine-learning/", description: "End-to-end ML tutorial with theory and implementations." },
      { id: "ds7", title: "Data Science Handbook — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/data-science-tutorial/", description: "Complete data science roadmap with Python examples." },
    ],
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing",
    description: "Master AWS, Azure, GCP, Docker, Kubernetes, and cloud-native architecture.",
    icon: Cloud,
    color: "200 70% 50%",
    image: cloudImg,
    topics: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Serverless"],
    resources: [
      { id: "cc1", title: "AWS Certified Solutions Architect", type: "course", source: "Udemy", url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/", duration: "35h", description: "By Stephane Maarek — Best-selling AWS certification course." },
      { id: "cc2", title: "AWS Full Course for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=ulprqHHWlng", duration: "10h", thumbnail: "https://img.youtube.com/vi/ulprqHHWlng/maxresdefault.jpg", description: "FreeCodeCamp's complete AWS cloud practitioner course." },
      { id: "cc3", title: "Docker Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", duration: "3h 30m", thumbnail: "https://img.youtube.com/vi/fqMOX6JJhGo/maxresdefault.jpg", description: "Docker tutorial for beginners — TechWorld with Nana." },
      { id: "cc4", title: "Kubernetes Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=X48VuDVv0do", duration: "4h", thumbnail: "https://img.youtube.com/vi/X48VuDVv0do/maxresdefault.jpg", description: "Kubernetes tutorial for beginners — TechWorld with Nana." },
      { id: "cc5", title: "Cloud Computing — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/cloud-computing/", description: "Cloud computing concepts, services, and architecture explained." },
      { id: "cc6", title: "Terraform Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=7xngnjfIlK4", duration: "2h 30m", thumbnail: "https://img.youtube.com/vi/7xngnjfIlK4/maxresdefault.jpg", description: "Complete Terraform tutorial for infrastructure as code." },
    ],
  },
  {
    id: "devops",
    name: "DevOps",
    description: "Learn CI/CD pipelines, infrastructure as code, monitoring, and deployment automation.",
    icon: Terminal,
    color: "340 65% 55%",
    image: devopsImg,
    topics: ["Jenkins", "GitHub Actions", "Ansible", "Prometheus", "Grafana", "Linux", "Bash", "Nginx"],
    resources: [
      { id: "do1", title: "DevOps Beginners to Advanced", type: "course", source: "Udemy", url: "https://www.udemy.com/course/decodingdevops/", duration: "30h", description: "Complete DevOps roadmap course — tools, practices, and projects." },
      { id: "do2", title: "DevOps Full Course — Simplilearn", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=lpk7VpGqkKw", duration: "11h", thumbnail: "https://img.youtube.com/vi/lpk7VpGqkKw/maxresdefault.jpg", description: "Complete DevOps training covering all essential tools." },
      { id: "do3", title: "Linux Full Course for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=sWbUDq4S6Y8", duration: "5h", thumbnail: "https://img.youtube.com/vi/sWbUDq4S6Y8/maxresdefault.jpg", description: "Complete Linux tutorial from zero to sysadmin." },
      { id: "do4", title: "GitHub Actions Tutorial", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=R8_veQiYBjI", duration: "2h", thumbnail: "https://img.youtube.com/vi/R8_veQiYBjI/maxresdefault.jpg", description: "TechWorld with Nana — Complete GitHub Actions CI/CD course." },
      { id: "do5", title: "DevOps Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/devops-tutorial/", description: "DevOps lifecycle, tools, and best practices guide." },
    ],
  },
  {
    id: "database",
    name: "Database Engineering",
    description: "Master SQL, NoSQL, database design, optimization, and distributed systems.",
    icon: Database,
    color: "168 50% 40%",
    image: databaseImg,
    topics: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Cassandra", "Database Design", "Query Optimization"],
    resources: [
      { id: "db1", title: "The Ultimate MySQL Bootcamp", type: "course", source: "Udemy", url: "https://www.udemy.com/course/the-ultimate-mysql-bootcamp-go-from-sql-beginner-to-expert/", duration: "20h", description: "By Colt Steele — MySQL from beginner to expert." },
      { id: "db2", title: "SQL Full Course — FreeCodeCamp", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", duration: "4h 20m", thumbnail: "https://img.youtube.com/vi/HXV3zeQKqGY/maxresdefault.jpg", description: "Complete SQL tutorial for beginners by FreeCodeCamp." },
      { id: "db3", title: "MongoDB Full Tutorial", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=ofme2o29ngU", duration: "1h 30m", thumbnail: "https://img.youtube.com/vi/ofme2o29ngU/maxresdefault.jpg", description: "MongoDB crash course — Web Dev Simplified." },
      { id: "db4", title: "PostgreSQL Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=qw--VYLpxG4", duration: "4h 19m", thumbnail: "https://img.youtube.com/vi/qw--VYLpxG4/maxresdefault.jpg", description: "FreeCodeCamp's complete PostgreSQL tutorial." },
      { id: "db5", title: "DBMS Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/dbms/", description: "Complete DBMS concepts, normalization, and SQL reference." },
    ],
  },
  {
    id: "iot",
    name: "IoT & Embedded",
    description: "Build connected devices with Arduino, Raspberry Pi, MQTT, and edge computing.",
    icon: Wifi,
    color: "120 50% 45%",
    image: iotImg,
    topics: ["Arduino", "Raspberry Pi", "MQTT", "Edge Computing", "Sensors", "ESP32", "Embedded C"],
    resources: [
      { id: "io1", title: "Arduino Step by Step Getting Started", type: "course", source: "Udemy", url: "https://www.udemy.com/course/arduino-sbs-17gs/", duration: "25h", description: "By Peter Dalmaris — Comprehensive Arduino course with 90+ lectures." },
      { id: "io2", title: "Arduino Full Course for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=zJ-LqeX_fLU", duration: "4h", thumbnail: "https://img.youtube.com/vi/zJ-LqeX_fLU/maxresdefault.jpg", description: "FreeCodeCamp's complete Arduino programming tutorial." },
      { id: "io3", title: "Raspberry Pi Tutorial for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=eZ74x6dVYes", duration: "1h 30m", thumbnail: "https://img.youtube.com/vi/eZ74x6dVYes/maxresdefault.jpg", description: "Getting started with Raspberry Pi — projects and setup." },
      { id: "io4", title: "IoT Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/internet-of-things-iot-set-1/", description: "IoT fundamentals, architecture, and protocols." },
      { id: "io5", title: "ESP32 IoT Projects", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=tc3Qnf79Ny8", duration: "3h", thumbnail: "https://img.youtube.com/vi/tc3Qnf79Ny8/maxresdefault.jpg", description: "Build IoT projects with ESP32 and sensors." },
    ],
  },
  {
    id: "blockchain",
    name: "Blockchain & Web3",
    description: "Develop smart contracts, dApps, and understand blockchain architecture with Solidity.",
    icon: Cpu,
    color: "280 60% 50%",
    image: blockchainImg,
    topics: ["Solidity", "Ethereum", "Smart Contracts", "DeFi", "NFTs", "Web3.js", "Hardhat"],
    resources: [
      { id: "bc1", title: "Ethereum & Solidity — The Complete Guide", type: "course", source: "Udemy", url: "https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/", duration: "38h", description: "By Stephen Grider — Build production-ready dApps with Solidity." },
      { id: "bc2", title: "Solidity Full Course — 32h", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=gyMwXuJrbJQ", duration: "32h", thumbnail: "https://img.youtube.com/vi/gyMwXuJrbJQ/maxresdefault.jpg", description: "FreeCodeCamp's ultimate Solidity, blockchain & Web3 course." },
      { id: "bc3", title: "Web3 Full Course — Build 3 dApps", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=jYEqoIeAoBg", duration: "5h", thumbnail: "https://img.youtube.com/vi/jYEqoIeAoBg/maxresdefault.jpg", description: "JavaScript Mastery — Build 3 Web3 decentralized applications." },
      { id: "bc4", title: "Blockchain Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/blockchain-tutorial/", description: "Blockchain concepts, consensus, and smart contract basics." },
    ],
  },
  {
    id: "ui-ux",
    name: "UI/UX Design",
    description: "Create stunning user interfaces and experiences with Figma, design systems, and prototyping.",
    icon: Palette,
    color: "320 70% 55%",
    image: uiuxImg,
    topics: ["Figma", "Design Systems", "Wireframing", "Prototyping", "User Research", "Accessibility"],
    resources: [
      { id: "ux1", title: "Complete UI/UX Design Bootcamp", type: "course", source: "Udemy", url: "https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/", duration: "28h", description: "Zero to Mastery — UI/UX from wireframe to high-fidelity prototypes." },
      { id: "ux2", title: "Figma Full Course — UI Design", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=jwCmIBJ8Jtc", duration: "11h", thumbnail: "https://img.youtube.com/vi/jwCmIBJ8Jtc/maxresdefault.jpg", description: "FreeCodeCamp's complete Figma tutorial for UI/UX designers." },
      { id: "ux3", title: "UX Design Full Course for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=uL2ZB7XXIgg", duration: "2h", thumbnail: "https://img.youtube.com/vi/uL2ZB7XXIgg/maxresdefault.jpg", description: "Google UX design fundamentals crash course." },
      { id: "ux4", title: "UI/UX Design — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/ui-ux-design-introduction/", description: "UI/UX principles, heuristics, and design thinking." },
      { id: "ux5", title: "Design Systems with Figma", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=EK-pHkc5EL4", duration: "1h 30m", thumbnail: "https://img.youtube.com/vi/EK-pHkc5EL4/maxresdefault.jpg", description: "Build scalable design systems in Figma from scratch." },
    ],
  },
  {
    id: "dsa",
    name: "DSA & Competitive",
    description: "Master data structures, algorithms, and competitive programming for placements.",
    icon: BarChart3,
    color: "30 80% 50%",
    image: dsaImg,
    topics: ["Arrays", "Trees", "Graphs", "Dynamic Programming", "Sorting", "Searching", "LeetCode"],
    resources: [
      { id: "dsa1", title: "Strivers A2Z DSA Sheet Complete Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=0bHoB32fuj0", duration: "60h+", thumbnail: "https://img.youtube.com/vi/0bHoB32fuj0/maxresdefault.jpg", description: "Take U Forward's complete DSA course — the most popular DSA playlist in India." },
      { id: "dsa2", title: "Data Structures Full Course — FreeCodeCamp", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=RBSGKlAvoiM", duration: "8h", thumbnail: "https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg", description: "Complete data structures course in Java by FreeCodeCamp." },
      { id: "dsa3", title: "Dynamic Programming Full Playlist", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=nqowUJzG-iM", duration: "15h+", thumbnail: "https://img.youtube.com/vi/nqowUJzG-iM/maxresdefault.jpg", description: "Aditya Verma's DP playlist — best DP resource for placements." },
      { id: "dsa4", title: "Master the Coding Interview: DSA + Algorithms", type: "course", source: "Udemy", url: "https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/", duration: "20h", description: "By Andrei Neagoie — Ace the FAANG coding interview." },
      { id: "dsa5", title: "DSA Tutorial — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/data-structures/", description: "The most comprehensive DSA reference with 1000+ problems." },
      { id: "dsa6", title: "LeetCode Patterns — 14 Patterns", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/top-algorithms-and-data-structures-for-competitive-programming/", description: "Essential algorithm patterns for competitive programming." },
    ],
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Learn to architect scalable, distributed systems used by top tech companies.",
    icon: Code2,
    color: "190 60% 45%",
    image: systemDesignImg,
    topics: ["Load Balancing", "Caching", "Microservices", "Message Queues", "CAP Theorem", "Sharding"],
    resources: [
      { id: "sd1", title: "System Design Interview — An Insider's Guide", type: "course", source: "Udemy", url: "https://www.udemy.com/course/system-design-interview-prep/", duration: "20h", description: "Prepare for system design interviews at FAANG companies." },
      { id: "sd2", title: "System Design Full Course — Gaurav Sen", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=xpDnVSmNFX0", duration: "5h+", thumbnail: "https://img.youtube.com/vi/xpDnVSmNFX0/maxresdefault.jpg", description: "Gaurav Sen's system design playlist — most popular in India." },
      { id: "sd3", title: "System Design Primer", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=FSR1s2b-l_I", duration: "3h", thumbnail: "https://img.youtube.com/vi/FSR1s2b-l_I/maxresdefault.jpg", description: "Basics of system design for beginners — ByteByteGo." },
      { id: "sd4", title: "Microservices Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=lTAcCNbJ7KE", duration: "6h", thumbnail: "https://img.youtube.com/vi/lTAcCNbJ7KE/maxresdefault.jpg", description: "Complete microservices architecture tutorial." },
      { id: "sd5", title: "System Design — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/system-design-tutorial/", description: "System design concepts, case studies, and interview questions." },
    ],
  },
  {
    id: "vlsi",
    name: "VLSI Design",
    description: "Master VLSI chip design, Verilog, VHDL, FPGA programming, and semiconductor fabrication processes.",
    icon: CircuitBoard,
    color: "250 65% 55%",
    image: vlsiImg,
    topics: ["Verilog", "VHDL", "FPGA", "ASIC Design", "Digital Logic", "Semiconductor Physics", "RTL Design", "Cadence/Synopsys"],
    resources: [
      { id: "vl1", title: "Digital VLSI Design with Verilog", type: "course", source: "Udemy", url: "https://www.udemy.com/course/vlsi-academy-digital-design/", duration: "25h", description: "Complete VLSI design course covering RTL to GDSII flow." },
      { id: "vl2", title: "Verilog HDL Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=PJGvZSlsLKs", duration: "8h", thumbnail: "https://img.youtube.com/vi/PJGvZSlsLKs/maxresdefault.jpg", description: "Complete Verilog hardware description language tutorial." },
      { id: "vl3", title: "FPGA Design for Beginners", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=lLg1AgA2Xoo", duration: "3h", thumbnail: "https://img.youtube.com/vi/lLg1AgA2Xoo/maxresdefault.jpg", description: "Getting started with FPGA design and development." },
      { id: "vl4", title: "VLSI Design — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/vlsi-design-introduction/", description: "VLSI fundamentals, design flow, and fabrication process." },
      { id: "vl5", title: "Digital Electronics — Neso Academy", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=M0mx8S05v60", duration: "12h+", thumbnail: "https://img.youtube.com/vi/M0mx8S05v60/maxresdefault.jpg", description: "Complete digital electronics and logic design course." },
    ],
  },
  {
    id: "power-systems",
    name: "Power Systems",
    description: "Learn electrical power generation, transmission, distribution, and renewable energy systems.",
    icon: Zap,
    color: "35 85% 50%",
    image: powerSystemsImg,
    topics: ["Power Generation", "Transmission Lines", "Transformers", "Switchgear", "Renewable Energy", "Smart Grid", "Power Electronics", "Protection Systems"],
    resources: [
      { id: "ps1", title: "Electrical Engineering Fundamentals", type: "course", source: "Udemy", url: "https://www.udemy.com/course/electrical-engineering-fundamentals/", duration: "20h", description: "Complete electrical engineering course from basics to advanced." },
      { id: "ps2", title: "Power Systems Full Course — Neso Academy", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=JY_Q5X2ND84", duration: "15h+", thumbnail: "https://img.youtube.com/vi/JY_Q5X2ND84/maxresdefault.jpg", description: "Complete power systems analysis course." },
      { id: "ps3", title: "Power Electronics Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=YJjJ5lrwzTg", duration: "10h", thumbnail: "https://img.youtube.com/vi/YJjJ5lrwzTg/maxresdefault.jpg", description: "Power electronics converters and applications." },
      { id: "ps4", title: "Power Systems — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/power-systems/", description: "Power systems concepts, load flow, and fault analysis." },
      { id: "ps5", title: "Renewable Energy Systems", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=1kUE0BZtTRc", duration: "5h", thumbnail: "https://img.youtube.com/vi/1kUE0BZtTRc/maxresdefault.jpg", description: "Solar, wind, and renewable energy engineering course." },
    ],
  },
  {
    id: "signal-processing",
    name: "Signals & Systems",
    description: "Master signal processing, communication systems, DSP, and control systems engineering.",
    icon: Radio,
    color: "170 65% 45%",
    image: signalProcessingImg,
    topics: ["DSP", "Fourier Transform", "Laplace Transform", "Z-Transform", "Filters", "Communication Systems", "Control Systems", "MATLAB"],
    resources: [
      { id: "sp1", title: "Signals and Systems — Neso Academy", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=s8rsR_TStaA", duration: "20h+", thumbnail: "https://img.youtube.com/vi/s8rsR_TStaA/maxresdefault.jpg", description: "Complete signals and systems course — most popular EE playlist." },
      { id: "sp2", title: "Digital Signal Processing Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=rkvEM5Y3N60", duration: "10h", thumbnail: "https://img.youtube.com/vi/rkvEM5Y3N60/maxresdefault.jpg", description: "DSP fundamentals and MATLAB implementations." },
      { id: "sp3", title: "Control Systems Engineering", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=O-OqgFE9SD4", duration: "12h", thumbnail: "https://img.youtube.com/vi/O-OqgFE9SD4/maxresdefault.jpg", description: "Neso Academy's complete control systems course." },
      { id: "sp4", title: "Signals & Systems — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/signals-and-systems/", description: "Signals, transforms, and system analysis fundamentals." },
      { id: "sp5", title: "Communication Systems Course", type: "course", source: "Udemy", url: "https://www.udemy.com/course/communication-systems/", duration: "15h", description: "Analog and digital communication systems engineering." },
    ],
  },
  {
    id: "robotics",
    name: "Robotics & Automation",
    description: "Build intelligent robots with mechatronics, ROS, PLC programming, and industrial automation.",
    icon: Bot,
    color: "355 70% 50%",
    image: roboticsImg,
    topics: ["ROS", "PLC Programming", "Mechatronics", "Kinematics", "Servo Motors", "Computer Vision", "Industrial Automation", "SCADA"],
    resources: [
      { id: "rb1", title: "Robotics Full Course — FreeCodeCamp", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=1oFpfDAQXfs", duration: "6h", thumbnail: "https://img.youtube.com/vi/1oFpfDAQXfs/maxresdefault.jpg", description: "Complete robotics course from fundamentals to advanced." },
      { id: "rb2", title: "ROS (Robot Operating System) Tutorial", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=Qk4vLFhvfbI", duration: "4h", thumbnail: "https://img.youtube.com/vi/Qk4vLFhvfbI/maxresdefault.jpg", description: "Getting started with ROS2 for robotics development." },
      { id: "rb3", title: "PLC Programming Full Course", type: "video", source: "YouTube", url: "https://www.youtube.com/watch?v=JKleq2dCz7c", duration: "8h", thumbnail: "https://img.youtube.com/vi/JKleq2dCz7c/maxresdefault.jpg", description: "Complete PLC ladder logic programming course." },
      { id: "rb4", title: "Robotics — GeeksforGeeks", type: "article", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/robotics-introduction/", description: "Robotics fundamentals, kinematics, and automation concepts." },
      { id: "rb5", title: "Industrial Automation & SCADA", type: "course", source: "Udemy", url: "https://www.udemy.com/course/plc-programming-from-scratch/", duration: "20h", description: "PLC, SCADA, and industrial automation from scratch." },
    ],
  },
];
