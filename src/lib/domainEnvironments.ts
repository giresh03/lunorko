/**
 * Domain-specific environment configurations for the code engine.
 * Maps each domain to its primary language, runtime capabilities,
 * starter templates, and file structures.
 */

export interface DomainEnvironment {
  id: string;
  primaryLanguage: string;
  supportedLanguages: string[];
  runtime: "native" | "ai-simulated"; // native = JS/TS executed in Deno, ai-simulated = AI explains output
  defaultFileName: string;
  starterCode: string;
  templateFiles: { name: string; language: string; content: string }[];
}

export const domainEnvironments: Record<string, DomainEnvironment> = {
  "web-development": {
    id: "web-development",
    primaryLanguage: "javascript",
    supportedLanguages: ["javascript", "typescript", "html", "css", "json"],
    runtime: "native",
    defaultFileName: "app.js",
    starterCode: `// Web Development Workspace\nconst express = require('express');\n\nconst app = { port: 3000 };\nconsole.log(\`Server ready on port \${app.port}\`);\n`,
    templateFiles: [
      { name: "index.html", language: "html", content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Web App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="app"></div>\n  <script src="app.js"></script>\n</body>\n</html>` },
      { name: "style.css", language: "css", content: `/* Styles */\n:root { --primary: #00d4aa; --bg: #0a0a1a; }\nbody { font-family: 'Inter', sans-serif; background: var(--bg); color: #eee; margin: 0; }\n` },
      { name: "app.js", language: "javascript", content: `// App entry point\ndocument.addEventListener('DOMContentLoaded', () => {\n  const app = document.getElementById('app');\n  app.innerHTML = '<h1>Hello World!</h1>';\n  console.log('App loaded!');\n});\n` },
    ],
  },
  "app-development": {
    id: "app-development",
    primaryLanguage: "javascript",
    supportedLanguages: ["javascript", "typescript", "json"],
    runtime: "native",
    defaultFileName: "App.jsx",
    starterCode: `// React Native App\nimport React, { useState } from 'react';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  console.log('App rendered, count:', count);\n  return { type: 'View', children: [{ type: 'Text', value: 'Count: ' + count }] };\n}\n\nconsole.log(JSON.stringify(App(), null, 2));\n`,
    templateFiles: [
      { name: "App.jsx", language: "javascript", content: `import React, { useState } from 'react';\nimport { View, Text, Button } from 'react-native';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <View>\n      <Text>Count: {count}</Text>\n      <Button title="+" onPress={() => setCount(c => c + 1)} />\n    </View>\n  );\n}\n` },
      { name: "app.json", language: "json", content: `{\n  "expo": {\n    "name": "MyApp",\n    "slug": "my-app",\n    "version": "1.0.0"\n  }\n}\n` },
    ],
  },
  "data-science": {
    id: "data-science",
    primaryLanguage: "python",
    supportedLanguages: ["python", "javascript", "json"],
    runtime: "ai-simulated",
    defaultFileName: "analysis.py",
    starterCode: `# Data Science Workspace\nimport pandas as pd\nimport numpy as np\n\n# Sample dataset\ndata = {\n    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],\n    'score': [85, 92, 78, 95],\n    'grade': ['A', 'A+', 'B+', 'A+']\n}\n\ndf = pd.DataFrame(data)\nprint(df)\nprint(f"\\nMean score: {df['score'].mean()}")\nprint(f"Max score: {df['score'].max()}")\n`,
    templateFiles: [
      { name: "analysis.py", language: "python", content: `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Load and analyze data\ndf = pd.read_csv('data.csv')\nprint(df.describe())\n` },
      { name: "model.py", language: "python", content: `from sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score\n\n# Train model\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\nmodel = RandomForestClassifier()\nmodel.fit(X_train, y_train)\nprint(f"Accuracy: {accuracy_score(y_test, model.predict(X_test))}")\n` },
      { name: "requirements.txt", language: "plaintext", content: `pandas>=2.0\nnumpy>=1.24\nscikit-learn>=1.3\nmatplotlib>=3.7\ntensorflow>=2.14\n` },
    ],
  },
  "cybersecurity": {
    id: "cybersecurity",
    primaryLanguage: "python",
    supportedLanguages: ["python", "javascript", "shell"],
    runtime: "ai-simulated",
    defaultFileName: "scanner.py",
    starterCode: `# Cybersecurity Workspace\nimport socket\nimport hashlib\n\ndef scan_port(host, port):\n    try:\n        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n        s.settimeout(1)\n        result = s.connect_ex((host, port))\n        s.close()\n        return result == 0\n    except:\n        return False\n\n# Demo scan\ncommon_ports = [22, 80, 443, 8080]\nfor port in common_ports:\n    status = "OPEN" if scan_port("localhost", port) else "CLOSED"\n    print(f"Port {port}: {status}")\n`,
    templateFiles: [
      { name: "scanner.py", language: "python", content: `import socket\nimport sys\n\ndef port_scan(target, ports):\n    for port in ports:\n        try:\n            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n            s.settimeout(1)\n            result = s.connect_ex((target, port))\n            if result == 0:\n                print(f"[+] Port {port} is open")\n            s.close()\n        except Exception as e:\n            print(f"[-] Error: {e}")\n\nif __name__ == "__main__":\n    port_scan("127.0.0.1", range(1, 1025))\n` },
      { name: "hasher.py", language: "python", content: `import hashlib\n\ndef hash_password(password, salt="lunor"):\n    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()\n\nprint(hash_password("test123"))\n` },
    ],
  },
  "cloud-computing": {
    id: "cloud-computing",
    primaryLanguage: "yaml",
    supportedLanguages: ["yaml", "json", "shell", "javascript", "python"],
    runtime: "ai-simulated",
    defaultFileName: "docker-compose.yml",
    starterCode: `# Cloud Computing Workspace\nversion: '3.8'\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"\n    volumes:\n      - ./html:/usr/share/nginx/html\n  api:\n    build: ./api\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n`,
    templateFiles: [
      { name: "docker-compose.yml", language: "yaml", content: `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - DATABASE_URL=postgres://user:pass@db:5432/app\n  db:\n    image: postgres:15\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:\n` },
      { name: "Dockerfile", language: "shell", content: `FROM node:20-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n` },
      { name: "terraform.tf", language: "plaintext", content: `provider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_instance" "web" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t2.micro"\n  tags = { Name = "web-server" }\n}\n` },
    ],
  },
  "devops": {
    id: "devops",
    primaryLanguage: "yaml",
    supportedLanguages: ["yaml", "shell", "json", "javascript"],
    runtime: "ai-simulated",
    defaultFileName: "pipeline.yml",
    starterCode: `# DevOps Workspace - CI/CD Pipeline\nname: CI/CD Pipeline\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test\n      - run: npm run build\n`,
    templateFiles: [
      { name: "pipeline.yml", language: "yaml", content: `name: Deploy\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm run build\n      - run: echo "Deploying..."\n` },
      { name: "deploy.sh", language: "shell", content: `#!/bin/bash\nset -e\necho "Building..."\nnpm run build\necho "Deploying to production..."\nrsync -avz dist/ user@server:/var/www/app/\necho "Done!"\n` },
      { name: "nginx.conf", language: "plaintext", content: `server {\n    listen 80;\n    server_name example.com;\n    location / {\n        proxy_pass http://localhost:3000;\n        proxy_set_header Host $host;\n    }\n}\n` },
    ],
  },
  "database": {
    id: "database",
    primaryLanguage: "sql",
    supportedLanguages: ["sql", "javascript", "json", "python"],
    runtime: "ai-simulated",
    defaultFileName: "schema.sql",
    starterCode: `-- Database Engineering Workspace\n\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  name VARCHAR(100) NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE posts (\n  id SERIAL PRIMARY KEY,\n  user_id INT REFERENCES users(id),\n  title VARCHAR(200) NOT NULL,\n  content TEXT,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\n-- Sample queries\nSELECT u.name, COUNT(p.id) as post_count\nFROM users u\nLEFT JOIN posts p ON u.id = p.user_id\nGROUP BY u.name\nORDER BY post_count DESC;\n`,
    templateFiles: [
      { name: "schema.sql", language: "sql", content: `-- Schema definition\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n` },
      { name: "queries.sql", language: "sql", content: `-- Common queries\nSELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days';\n` },
      { name: "seed.sql", language: "sql", content: `-- Seed data\nINSERT INTO users (email, name) VALUES\n('alice@example.com', 'Alice'),\n('bob@example.com', 'Bob');\n` },
    ],
  },
  "iot": {
    id: "iot",
    primaryLanguage: "cpp",
    supportedLanguages: ["cpp", "python", "javascript", "json"],
    runtime: "ai-simulated",
    defaultFileName: "sensor.ino",
    starterCode: `// IoT & Embedded Workspace - Arduino\n#include <DHT.h>\n\n#define DHTPIN 2\n#define DHTTYPE DHT22\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n  Serial.println("DHT22 Sensor Ready!");\n}\n\nvoid loop() {\n  float humidity = dht.readHumidity();\n  float temp = dht.readTemperature();\n  \n  if (isnan(humidity) || isnan(temp)) {\n    Serial.println("Failed to read from DHT sensor!");\n    return;\n  }\n  \n  Serial.print("Temp: ");\n  Serial.print(temp);\n  Serial.print("°C  Humidity: ");\n  Serial.print(humidity);\n  Serial.println("%");\n  \n  delay(2000);\n}\n`,
    templateFiles: [
      { name: "sensor.ino", language: "cpp", content: `#include <DHT.h>\n#define DHTPIN 2\nDHT dht(DHTPIN, DHT22);\n\nvoid setup() { Serial.begin(9600); dht.begin(); }\nvoid loop() {\n  Serial.println(dht.readTemperature());\n  delay(2000);\n}\n` },
      { name: "mqtt_client.py", language: "python", content: `import paho.mqtt.client as mqtt\n\nclient = mqtt.Client()\nclient.connect("localhost", 1883, 60)\nclient.publish("sensors/temp", "22.5")\nclient.disconnect()\n` },
    ],
  },
  "blockchain": {
    id: "blockchain",
    primaryLanguage: "solidity",
    supportedLanguages: ["solidity", "javascript", "typescript", "json"],
    runtime: "ai-simulated",
    defaultFileName: "Token.sol",
    starterCode: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n\ncontract LunorToken is ERC20 {\n    constructor(uint256 initialSupply) ERC20("Lunor Token", "LNR") {\n        _mint(msg.sender, initialSupply * 10 ** decimals());\n    }\n}\n`,
    templateFiles: [
      { name: "Token.sol", language: "solidity", content: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n\ncontract MyToken is ERC20 {\n    constructor() ERC20("MyToken", "MTK") {\n        _mint(msg.sender, 1000000 * 10 ** decimals());\n    }\n}\n` },
      { name: "deploy.js", language: "javascript", content: `const { ethers } = require("hardhat");\n\nasync function main() {\n  const Token = await ethers.getContractFactory("MyToken");\n  const token = await Token.deploy();\n  console.log("Token deployed to:", token.address);\n}\n\nmain().catch(console.error);\n` },
      { name: "hardhat.config.js", language: "javascript", content: `require("@nomicfoundation/hardhat-toolbox");\n\nmodule.exports = {\n  solidity: "0.8.20",\n  networks: {\n    sepolia: {\n      url: process.env.RPC_URL,\n      accounts: [process.env.PRIVATE_KEY]\n    }\n  }\n};\n` },
    ],
  },
  "ui-ux": {
    id: "ui-ux",
    primaryLanguage: "html",
    supportedLanguages: ["html", "css", "javascript", "json"],
    runtime: "native",
    defaultFileName: "design.html",
    starterCode: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>UI/UX Design Workspace</title>\n  <style>\n    :root { --primary: #6366f1; --bg: #0f172a; --card: #1e293b; }\n    * { margin: 0; box-sizing: border-box; }\n    body { font-family: 'Inter', sans-serif; background: var(--bg); color: #e2e8f0; }\n    .card { background: var(--card); border-radius: 12px; padding: 24px; margin: 20px; }\n    .btn { background: var(--primary); color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; }\n    .btn:hover { opacity: 0.9; transform: translateY(-1px); transition: all 0.2s; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h2>Design System Preview</h2>\n    <p style="margin: 12px 0; color: #94a3b8;">Interactive component preview</p>\n    <button class="btn">Primary Action</button>\n  </div>\n</body>\n</html>\n`,
    templateFiles: [
      { name: "design.html", language: "html", content: `<!DOCTYPE html>\n<html>\n<head><title>Design System</title></head>\n<body>\n  <h1>Component Library</h1>\n</body>\n</html>` },
      { name: "tokens.css", language: "css", content: `/* Design Tokens */\n:root {\n  --color-primary: #6366f1;\n  --color-secondary: #ec4899;\n  --radius-sm: 4px;\n  --radius-md: 8px;\n  --radius-lg: 16px;\n  --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);\n}\n` },
      { name: "components.css", language: "css", content: `/* Component Styles */\n.btn { padding: 10px 20px; border-radius: var(--radius-md); border: none; cursor: pointer; }\n.btn-primary { background: var(--color-primary); color: white; }\n.card { background: #1e293b; border-radius: var(--radius-lg); padding: 24px; }\n` },
    ],
  },
  "dsa": {
    id: "dsa",
    primaryLanguage: "javascript",
    supportedLanguages: ["javascript", "python", "typescript", "json"],
    runtime: "native",
    defaultFileName: "solution.js",
    starterCode: `// DSA Workspace - Two Sum\n\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\n// Test cases\nconsole.log("Two Sum [2,7,11,15] target=9:", twoSum([2, 7, 11, 15], 9));\nconsole.log("Two Sum [3,2,4] target=6:", twoSum([3, 2, 4], 6));\nconsole.log("Two Sum [3,3] target=6:", twoSum([3, 3], 6));\n`,
    templateFiles: [
      { name: "solution.js", language: "javascript", content: `// Problem: \n// Time: O(n), Space: O(n)\n\nfunction solve(input) {\n  // Your solution here\n}\n\n// Test cases\nconsole.log(solve([1, 2, 3]));\n` },
      { name: "test.js", language: "javascript", content: `// Test runner\nfunction assert(actual, expected, msg) {\n  const pass = JSON.stringify(actual) === JSON.stringify(expected);\n  console.log(pass ? '✅' : '❌', msg, pass ? '' : \`Expected \${JSON.stringify(expected)}, got \${JSON.stringify(actual)}\`);\n}\n\nassert(solve([1,2]), 3, "basic case");\n` },
    ],
  },
  "system-design": {
    id: "system-design",
    primaryLanguage: "javascript",
    supportedLanguages: ["javascript", "json", "yaml", "python"],
    runtime: "native",
    defaultFileName: "design.js",
    starterCode: `// System Design Workspace\n// URL Shortener - Core Logic\n\nclass URLShortener {\n  constructor() {\n    this.urlMap = new Map();\n    this.counter = 0;\n  }\n\n  encode(longUrl) {\n    const id = this.counter++;\n    const shortCode = id.toString(36);\n    this.urlMap.set(shortCode, longUrl);\n    return \`https://short.url/\${shortCode}\`;\n  }\n\n  decode(shortUrl) {\n    const code = shortUrl.split('/').pop();\n    return this.urlMap.get(code) || null;\n  }\n}\n\nconst shortener = new URLShortener();\nconst short = shortener.encode("https://www.example.com/very/long/url");\nconsole.log("Short URL:", short);\nconsole.log("Decoded:", shortener.decode(short));\n`,
    templateFiles: [
      { name: "design.js", language: "javascript", content: `// System component simulation\nclass LoadBalancer {\n  constructor(servers) { this.servers = servers; this.idx = 0; }\n  route() { return this.servers[this.idx++ % this.servers.length]; }\n}\n\nconst lb = new LoadBalancer(['s1', 's2', 's3']);\nfor (let i = 0; i < 6; i++) console.log('Request', i, '->', lb.route());\n` },
      { name: "architecture.json", language: "json", content: `{\n  "system": "URL Shortener",\n  "components": ["API Gateway", "App Server", "Cache (Redis)", "Database (PostgreSQL)", "CDN"],\n  "estimations": {\n    "reads_per_sec": 1000,\n    "writes_per_sec": 100,\n    "storage_per_year_gb": 15\n  }\n}\n` },
    ],
  },
  "vlsi": {
    id: "vlsi",
    primaryLanguage: "verilog",
    supportedLanguages: ["verilog", "vhdl", "python", "shell"],
    runtime: "ai-simulated",
    defaultFileName: "counter.v",
    starterCode: `// VLSI Design Workspace - 4-bit Counter\nmodule counter_4bit (\n  input clk,\n  input reset,\n  output reg [3:0] count\n);\n\nalways @(posedge clk or posedge reset) begin\n  if (reset)\n    count <= 4'b0000;\n  else\n    count <= count + 1;\nend\n\nendmodule\n`,
    templateFiles: [
      { name: "counter.v", language: "verilog", content: `module counter_4bit(input clk, input reset, output reg [3:0] count);\nalways @(posedge clk or posedge reset)\n  if (reset) count <= 0; else count <= count + 1;\nendmodule\n` },
      { name: "testbench.v", language: "verilog", content: `module tb_counter;\nreg clk, reset;\nwire [3:0] count;\ncounter_4bit uut(.clk(clk), .reset(reset), .count(count));\ninitial begin clk = 0; forever #5 clk = ~clk; end\ninitial begin reset = 1; #10 reset = 0; #200 $finish; end\ninitial $monitor("Time=%0t count=%b", $time, count);\nendmodule\n` },
    ],
  },
  "power-systems": {
    id: "power-systems",
    primaryLanguage: "python",
    supportedLanguages: ["python", "matlab", "javascript"],
    runtime: "ai-simulated",
    defaultFileName: "power_analysis.py",
    starterCode: `# Power Systems Workspace\nimport numpy as np\n\nbase_mva = 100\nbase_kv = 220\nbase_impedance = base_kv**2 / base_mva\nprint(f"Base Impedance: {base_impedance} ohms")\nprint("Power Systems Analysis Ready!")\n`,
    templateFiles: [
      { name: "power_analysis.py", language: "python", content: `import numpy as np\nbase_mva = 100\nbase_kv = 220\nprint(f"Base Impedance: {base_kv**2/base_mva} ohms")\n` },
    ],
  },
  "signal-processing": {
    id: "signal-processing",
    primaryLanguage: "python",
    supportedLanguages: ["python", "matlab", "javascript"],
    runtime: "ai-simulated",
    defaultFileName: "signal_analysis.py",
    starterCode: `# Signals & Systems Workspace\nimport numpy as np\n\nt = np.linspace(0, 1, 1000)\nsignal = np.sin(2*np.pi*50*t) + 0.5*np.sin(2*np.pi*120*t)\nprint("Signal with 50Hz and 120Hz components generated")\nprint("Signal Processing Ready!")\n`,
    templateFiles: [
      { name: "signal_analysis.py", language: "python", content: `import numpy as np\nt = np.linspace(0, 1, 1000)\nsignal = np.sin(2*np.pi*50*t)\nprint("Signal generated")\n` },
    ],
  },
  "robotics": {
    id: "robotics",
    primaryLanguage: "python",
    supportedLanguages: ["python", "cpp", "javascript"],
    runtime: "ai-simulated",
    defaultFileName: "robot_control.py",
    starterCode: `# Robotics & Automation Workspace\nimport numpy as np\n\ndef forward_kinematics(theta1, theta2, L1=1.0, L2=0.8):\n    t1, t2 = np.radians(theta1), np.radians(theta2)\n    x = L1*np.cos(t1) + L2*np.cos(t1+t2)\n    y = L1*np.sin(t1) + L2*np.sin(t1+t2)\n    return round(x, 4), round(y, 4)\n\nfor angles in [(0,0), (45,30), (90,-45)]:\n    pos = forward_kinematics(*angles)\n    print(f"Theta={angles} -> X={pos[0]}, Y={pos[1]}")\n`,
    templateFiles: [
      { name: "robot_control.py", language: "python", content: `import numpy as np\n\nclass PIDController:\n    def __init__(self, Kp, Ki, Kd):\n        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd\n        self.integral, self.prev_error = 0, 0\n    def compute(self, sp, pv, dt):\n        e = sp - pv\n        self.integral += e*dt\n        d = (e - self.prev_error)/dt\n        self.prev_error = e\n        return self.Kp*e + self.Ki*self.integral + self.Kd*d\n\npid = PIDController(1.0, 0.1, 0.05)\nprint(f"Output: {pid.compute(100, 80, 0.01)}")\n` },
    ],
  },
};

export function getDomainEnvironment(domainId: string): DomainEnvironment {
  return domainEnvironments[domainId] ?? {
    id: domainId,
    primaryLanguage: "javascript",
    supportedLanguages: ["javascript", "typescript"],
    runtime: "native" as const,
    defaultFileName: "main.js",
    starterCode: `// ${domainId} Workspace\nconsole.log("Hello, World!");\n`,
    templateFiles: [],
  };
}
