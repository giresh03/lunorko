/**
 * Offline cache service for Lunor.AI Code Editor.
 * Caches domain templates, code snippets, and AI responses in localStorage.
 */

const CACHE_PREFIX = "lunor-offline";
const CACHE_VERSION = 1;
const SNIPPETS_KEY = `${CACHE_PREFIX}-snippets-v${CACHE_VERSION}`;
const TEMPLATES_KEY = `${CACHE_PREFIX}-templates-v${CACHE_VERSION}`;
const AI_CACHE_KEY = `${CACHE_PREFIX}-ai-cache-v${CACHE_VERSION}`;
const STATUS_KEY = `${CACHE_PREFIX}-status-v${CACHE_VERSION}`;

export interface CachedSnippet {
  id: string;
  domain: string;
  title: string;
  language: string;
  code: string;
  description?: string;
  cachedAt: number;
}

export interface CachedTemplate {
  domain: string;
  files: { name: string; language: string; content: string }[];
  starterCode: string;
  primaryLanguage: string;
  cachedAt: number;
}

export interface CachedAIResponse {
  prompt: string;
  domain: string;
  response: string;
  cachedAt: number;
}

export interface OfflineStatus {
  isOfflineMode: boolean;
  lastSynced: number | null;
  cachedDomains: string[];
  snippetCount: number;
  aiCacheCount: number;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("[offline] Storage write failed:", e);
  }
}

// Built-in snippets per domain (no network needed)
const DOMAIN_SNIPPETS: Record<string, CachedSnippet[]> = {
  "web-development": [
    { id: "wd-site-api", domain: "web-development", title: "Website API routes", language: "javascript", cachedAt: 0,
      code: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\napp.get('/api/site', (_req, res) => {\n  res.json({ brand: 'Lumen Atelier', items: [] });\n});\n\napp.post('/api/messages', (req, res) => {\n  const name = String(req.body?.name || '').trim();\n  const email = String(req.body?.email || '').trim();\n  const message = String(req.body?.message || '').trim();\n  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required.' });\n  res.status(201).json({ id: Date.now().toString(36), name, email, message });\n});\n\napp.listen(3000, () => console.log('Website API on http://localhost:3000'));" },
    { id: "wd-site-client", domain: "web-development", title: "Website API client", language: "javascript", cachedAt: 0,
      code: "async function loadSite(fallback) {\n  try {\n    const response = await fetch('/api/site');\n    if (!response.ok) throw new Error('API unavailable');\n    return await response.json();\n  } catch {\n    return fallback;\n  }\n}\n\nasync function sendMessage(payload) {\n  const response = await fetch('/api/messages', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload),\n  });\n  if (!response.ok) throw new Error('Could not store message');\n  return response.json();\n}" },
    { id: "wd-1", domain: "web-development", title: "Express Server", language: "javascript", cachedAt: 0,
      code: "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello World!' });\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));" },
    { id: "wd-2", domain: "web-development", title: "Fetch API Helper", language: "javascript", cachedAt: 0,
      code: "async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error('HTTP ' + response.status);\n    const data = await response.json();\n    console.log('Data:', data);\n    return data;\n  } catch (error) {\n    console.error('Fetch error:', error.message);\n  }\n}" },
    { id: "wd-3", domain: "web-development", title: "CSS Grid Layout", language: "css", cachedAt: 0,
      code: ".container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n  padding: 2rem;\n}\n.card {\n  background: #1e293b;\n  border-radius: 12px;\n  padding: 1.5rem;\n  border: 1px solid #334155;\n  transition: transform 0.2s;\n}\n.card:hover { transform: translateY(-4px); }" },
    { id: "wd-4", domain: "web-development", title: "LocalStorage Wrapper", language: "javascript", cachedAt: 0,
      code: "const storage = {\n  get(key, fallback) {\n    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }\n    catch { return fallback; }\n  },\n  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },\n  remove(key) { localStorage.removeItem(key); }\n};\n\nstorage.set('user', { name: 'Alice' });\nconsole.log(storage.get('user'));" },
  ],
  "app-development": [
    { id: "ad-1", domain: "app-development", title: "React Native FlatList", language: "javascript", cachedAt: 0,
      code: "import React from 'react';\nimport { FlatList, View, Text, StyleSheet } from 'react-native';\n\nconst DATA = [\n  { id: '1', title: 'Item 1' },\n  { id: '2', title: 'Item 2' },\n];\n\nconst App = () => (\n  <FlatList\n    data={DATA}\n    keyExtractor={item => item.id}\n    renderItem={({ item }) => (\n      <View style={styles.item}><Text>{item.title}</Text></View>\n    )}\n  />\n);\n\nconst styles = StyleSheet.create({\n  item: { padding: 20, borderBottomWidth: 1, borderColor: '#ccc' },\n});\n\nexport default App;" },
    { id: "ad-2", domain: "app-development", title: "Navigation Setup", language: "javascript", cachedAt: 0,
      code: "import { NavigationContainer } from '@react-navigation/native';\nimport { createBottomTabNavigator } from '@react-navigation/bottom-tabs';\n\nconst Tab = createBottomTabNavigator();\n\nexport default function App() {\n  return (\n    <NavigationContainer>\n      <Tab.Navigator>\n        <Tab.Screen name=\"Home\" component={HomeScreen} />\n        <Tab.Screen name=\"Settings\" component={SettingsScreen} />\n      </Tab.Navigator>\n    </NavigationContainer>\n  );\n}" },
  ],
  "cybersecurity": [
    { id: "cs-1", domain: "cybersecurity", title: "Password Hasher", language: "python", cachedAt: 0,
      code: "import hashlib\nimport secrets\n\ndef hash_password(password):\n    salt = secrets.token_hex(16)\n    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)\n    return salt, hashed.hex()\n\ndef verify_password(password, salt, stored_hash):\n    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)\n    return hashed.hex() == stored_hash\n\nsalt, pw_hash = hash_password('secure123')\nprint('Salt:', salt)\nprint('Hash:', pw_hash)\nprint('Verify:', verify_password('secure123', salt, pw_hash))" },
    { id: "cs-2", domain: "cybersecurity", title: "Caesar Cipher", language: "python", cachedAt: 0,
      code: "def caesar_encrypt(text, shift):\n    result = []\n    for char in text:\n        if char.isalpha():\n            base = ord('A') if char.isupper() else ord('a')\n            result.append(chr((ord(char) - base + shift) % 26 + base))\n        else:\n            result.append(char)\n    return ''.join(result)\n\nmessage = 'Hello World'\nencrypted = caesar_encrypt(message, 3)\nprint('Original:', message)\nprint('Encrypted:', encrypted)\nprint('Decrypted:', caesar_encrypt(encrypted, -3))" },
  ],
  "data-science": [
    { id: "ds-1", domain: "data-science", title: "Pandas DataFrame", language: "python", cachedAt: 0,
      code: "import pandas as pd\n\ndf = pd.DataFrame({\n    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],\n    'age': [25, 30, 35, 28],\n    'salary': [50000, 60000, 75000, 55000],\n    'dept': ['Eng', 'Mkt', 'Eng', 'HR']\n})\n\nprint(df)\nprint('\\nMean salary:', df['salary'].mean())\nprint('\\nBy department:')\nprint(df.groupby('dept')['salary'].agg(['mean', 'count']))" },
    { id: "ds-2", domain: "data-science", title: "Linear Regression", language: "python", cachedAt: 0,
      code: "import numpy as np\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import r2_score\n\nnp.random.seed(42)\nX = np.random.rand(100, 1) * 10\ny = 2.5 * X.squeeze() + np.random.randn(100) * 2 + 5\n\nmodel = LinearRegression()\nmodel.fit(X, y)\ny_pred = model.predict(X)\n\nprint('Coefficient:', round(model.coef_[0], 4))\nprint('Intercept:', round(model.intercept_, 4))\nprint('R2 Score:', round(r2_score(y, y_pred), 4))" },
  ],
  "cloud-computing": [
    { id: "cc-1", domain: "cloud-computing", title: "Dockerfile", language: "shell", cachedAt: 0,
      code: "FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nEXPOSE 3000\nCMD [\"node\", \"dist/server.js\"]" },
    { id: "cc-2", domain: "cloud-computing", title: "K8s Deployment", language: "yaml", cachedAt: 0,
      code: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web-app\n  template:\n    metadata:\n      labels:\n        app: web-app\n    spec:\n      containers:\n      - name: web-app\n        image: myapp:latest\n        ports:\n        - containerPort: 3000\n        resources:\n          requests:\n            memory: \"128Mi\"\n            cpu: \"100m\"" },
  ],
  "devops": [
    { id: "do-1", domain: "devops", title: "GitHub Actions CI", language: "yaml", cachedAt: 0,
      code: "name: CI Pipeline\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test -- --coverage" },
  ],
  "database": [
    { id: "db-1", domain: "database", title: "Normalized Schema", language: "sql", cachedAt: 0,
      code: "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  name VARCHAR(100) NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  user_id INT REFERENCES users(id),\n  total DECIMAL(10,2) NOT NULL,\n  status VARCHAR(20) DEFAULT 'pending',\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE INDEX idx_orders_user ON orders(user_id);" },
  ],
  "iot": [
    { id: "io-1", domain: "iot", title: "Arduino Sensor", language: "cpp", cachedAt: 0,
      code: "#include <DHT.h>\n\n#define DHTPIN 2\n#define DHTTYPE DHT22\n\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n  Serial.println(\"Sensor ready!\");\n}\n\nvoid loop() {\n  float temp = dht.readTemperature();\n  float humidity = dht.readHumidity();\n  Serial.print(\"Temp: \");\n  Serial.print(temp);\n  Serial.print(\"C | Humidity: \");\n  Serial.print(humidity);\n  Serial.println(\"%\");\n  delay(2000);\n}" },
  ],
  "blockchain": [
    { id: "bc-1", domain: "blockchain", title: "ERC-20 Token", language: "solidity", cachedAt: 0,
      code: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport \"@openzeppelin/contracts/token/ERC20/ERC20.sol\";\nimport \"@openzeppelin/contracts/access/Ownable.sol\";\n\ncontract MyToken is ERC20, Ownable {\n    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;\n\n    constructor() ERC20(\"MyToken\", \"MTK\") Ownable(msg.sender) {\n        _mint(msg.sender, 100_000 * 10**18);\n    }\n\n    function mint(address to, uint256 amount) external onlyOwner {\n        require(totalSupply() + amount <= MAX_SUPPLY, \"Exceeds max supply\");\n        _mint(to, amount);\n    }\n}" },
  ],
  "ui-ux": [
    { id: "ux-1", domain: "ui-ux", title: "Card Component", language: "html", cachedAt: 0,
      code: "<div class=\"card\">\n  <div class=\"card-body\">\n    <span class=\"badge\">Featured</span>\n    <h3>Beautiful Card</h3>\n    <p>A responsive card with hover effects.</p>\n    <button class=\"btn\">Learn More</button>\n  </div>\n</div>\n\n<style>\n.card { background: #1e293b; border-radius: 16px; overflow: hidden; transition: transform 0.3s; max-width: 380px; }\n.card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }\n.card-body { padding: 24px; }\n.badge { background: #6366f1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }\n.btn { background: #6366f1; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; margin-top: 16px; }\n</style>" },
  ],
  "dsa": [
    { id: "dsa-1", domain: "dsa", title: "Binary Search", language: "javascript", cachedAt: 0,
      code: "function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nconst arr = [1, 3, 5, 7, 9, 11, 13, 15];\nconsole.log('Find 7:', binarySearch(arr, 7));\nconsole.log('Find 10:', binarySearch(arr, 10));" },
    { id: "dsa-2", domain: "dsa", title: "Merge Sort", language: "javascript", cachedAt: 0,
      code: "function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] <= right[j]) result.push(left[i++]);\n    else result.push(right[j++]);\n  }\n  return [...result, ...left.slice(i), ...right.slice(j)];\n}\n\nconsole.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));" },
  ],
  "system-design": [
    { id: "sd-1", domain: "system-design", title: "LRU Cache", language: "javascript", cachedAt: 0,
      code: "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    else if (this.cache.size >= this.capacity)\n      this.cache.delete(this.cache.keys().next().value);\n    this.cache.set(key, value);\n  }\n}\n\nconst cache = new LRUCache(3);\ncache.put('a', 1); cache.put('b', 2); cache.put('c', 3);\nconsole.log(cache.get('a'));\ncache.put('d', 4);\nconsole.log(cache.get('b'));" },
  ],
};

// ─── Public API ───────────────────────────────────────────────────────

export function getOfflineStatus(): OfflineStatus {
  const status = readJSON<Partial<OfflineStatus>>(STATUS_KEY, {});
  const templates = readJSON<Record<string, CachedTemplate>>(TEMPLATES_KEY, {});
  const snippets = readJSON<CachedSnippet[]>(SNIPPETS_KEY, []);
  const aiCache = readJSON<CachedAIResponse[]>(AI_CACHE_KEY, []);
  return {
    isOfflineMode: status.isOfflineMode ?? false,
    lastSynced: status.lastSynced ?? null,
    cachedDomains: Object.keys(templates),
    snippetCount: snippets.length,
    aiCacheCount: aiCache.length,
  };
}

export function setOfflineMode(enabled: boolean): void {
  const status = readJSON<Partial<OfflineStatus>>(STATUS_KEY, {});
  writeJSON(STATUS_KEY, { ...status, isOfflineMode: enabled });
}

export function syncTemplatesFromImport(environments: Record<string, { templateFiles: { name: string; language: string; content: string }[]; starterCode: string; primaryLanguage: string }>): { domains: number; snippets: number } {
  const templates: Record<string, CachedTemplate> = {};
  for (const [id, env] of Object.entries(environments)) {
    templates[id] = {
      domain: id,
      files: env.templateFiles,
      starterCode: env.starterCode,
      primaryLanguage: env.primaryLanguage,
      cachedAt: Date.now(),
    };
  }
  writeJSON(TEMPLATES_KEY, templates);

  const allSnippets: CachedSnippet[] = [];
  for (const snippets of Object.values(DOMAIN_SNIPPETS)) {
    snippets.forEach((s) => allSnippets.push({ ...s, cachedAt: Date.now() }));
  }
  writeJSON(SNIPPETS_KEY, allSnippets);

  const status = readJSON<Partial<OfflineStatus>>(STATUS_KEY, {});
  writeJSON(STATUS_KEY, { ...status, lastSynced: Date.now() });
  return { domains: Object.keys(templates).length, snippets: allSnippets.length };
}

export function getCachedTemplate(domain: string): CachedTemplate | null {
  const templates = readJSON<Record<string, CachedTemplate>>(TEMPLATES_KEY, {});
  return templates[domain] || null;
}

export function getSnippetsForDomain(domain: string): CachedSnippet[] {
  const cached = readJSON<CachedSnippet[]>(SNIPPETS_KEY, []);
  const builtIn = DOMAIN_SNIPPETS[domain] || [];
  const cachedForDomain = cached.filter((s) => s.domain === domain);
  // Merge, preferring cached versions
  const ids = new Set(cachedForDomain.map((s) => s.id));
  return [...cachedForDomain, ...builtIn.filter((s) => !ids.has(s.id))];
}

export function getBuiltInSnippets(domain: string): CachedSnippet[] {
  return DOMAIN_SNIPPETS[domain] || [];
}

export function getAllBuiltInSnippets(): CachedSnippet[] {
  return Object.values(DOMAIN_SNIPPETS).flat();
}

export function cacheAIResponse(prompt: string, domain: string, response: string): void {
  const cache = readJSON<CachedAIResponse[]>(AI_CACHE_KEY, []);
  cache.unshift({ prompt, domain, response, cachedAt: Date.now() });
  writeJSON(AI_CACHE_KEY, cache.slice(0, 50));
}

export function findCachedAIResponse(prompt: string, domain: string): CachedAIResponse | null {
  const cache = readJSON<CachedAIResponse[]>(AI_CACHE_KEY, []);
  const normalized = prompt.toLowerCase().trim();
  return cache.find((c) => c.domain === domain && c.prompt.toLowerCase().trim() === normalized) || null;
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function clearOfflineCache(): void {
  localStorage.removeItem(SNIPPETS_KEY);
  localStorage.removeItem(TEMPLATES_KEY);
  localStorage.removeItem(AI_CACHE_KEY);
  writeJSON(STATUS_KEY, { isOfflineMode: false, lastSynced: null });
}
