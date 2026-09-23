/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a previewable HTML/CSS/JS client plus an Express + MongoDB API.
 */

export interface WebsiteFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export interface ProjectNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: ProjectNode[];
  isOpen?: boolean;
}

export interface WebsiteBlueprint {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultName: string;
  accent: string;
  keywords: string[];
}

export interface GeneratedWebsite {
  id: string;
  label: string;
  siteName: string;
  files: WebsiteFile[];
  tree: ProjectNode[];
  summary: string;
  previewPath: string;
}

interface FieldSpec {
  key: string;
  type: "String" | "Number";
  required?: boolean;
}

interface RouteSpec {
  path: string;
  model: string;
  fields: FieldSpec[];
  seed: Record<string, string | number>[];
  methods: Array<"GET" | "POST">;
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    icon: "✦",
    description: "Projects grid and contact API",
    defaultName: "Northwind Studio",
    accent: "#3ee0b0",
    keywords: ["portfolio", "freelancer", "personal", "resume", "designer"],
  },
  {
    id: "saas",
    label: "SaaS landing",
    icon: "◆",
    description: "Features, pricing, waitlist API",
    defaultName: "Lumenboard",
    accent: "#7aa2ff",
    keywords: ["saas", "startup", "landing", "pricing", "waitlist"],
  },
  {
    id: "blog",
    label: "Blog",
    icon: "✎",
    description: "Posts from an Express API",
    defaultName: "Field Notes",
    accent: "#f0b429",
    keywords: ["blog", "article", "posts", "journal", "magazine"],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽",
    description: "Menu and reservation API",
    defaultName: "Harbor Table",
    accent: "#ff8a5b",
    keywords: ["restaurant", "menu", "cafe", "food", "reservation", "dining"],
  },
  {
    id: "store",
    label: "Store",
    icon: "◻",
    description: "Catalog and checkout API",
    defaultName: "Atelier Goods",
    accent: "#d4a0ff",
    keywords: ["store", "shop", "ecommerce", "e-commerce", "product", "cart", "checkout"],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "▦",
    description: "Stats and task API",
    defaultName: "Pulse Desk",
    accent: "#5eead4",
    keywords: ["dashboard", "admin", "analytics", "tasks", "metrics"],
  },
];

const REQUIRED_PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/app.js",
  "server/server.js",
  "server/db.js",
  "server/model.js",
  "server/routes.js",
  "package.json",
  ".env.example",
  "README.md",
];

export function matchWebsiteBlueprint(text: string): string {
  const lower = text.toLowerCase();
  let best = "portfolio";
  let score = 0;
  for (const blueprint of WEBSITE_BLUEPRINTS) {
    const next = blueprint.keywords.reduce((sum, keyword) => sum + (lower.includes(keyword) ? keyword.length : 0), 0);
    if (next > score) {
      score = next;
      best = blueprint.id;
    }
  }
  return best;
}

export function isFullStackWebsiteRequest(text: string): boolean {
  const normalized = text.toLowerCase();
  if (/full[-\s]?stack|mern\b|website generator/.test(normalized)) return true;
  const mentionsSite = /website|web\s*site|web\s*app|landing page/.test(normalized);
  const mentionsBackend = /express|mongodb|mongo\b|node\.?js|backend|\bapi\b/.test(normalized);
  return mentionsSite && mentionsBackend;
}

export function parseFencedFiles(markdown: string): { language: string; code: string; path?: string }[] {
  const blocks: { language: string; code: string; path?: string }[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const before = markdown.slice(0, match.index);
    const previousLine = before.split("\n").map((line) => line.trim()).filter(Boolean).pop() || "";
    const cleaned = previousLine.replace(/[`*]/g, "").trim();
    const pathMatch = cleaned.match(/^([A-Za-z0-9_./-]+\.[A-Za-z0-9]+)\s*:?$/);
    blocks.push({
      language: match[1] || "javascript",
      code: match[2].trim(),
      path: pathMatch?.[1],
    });
  }
  return blocks;
}

export function placeFileInTree(tree: ProjectNode[], filePath: string, content: string, language: string): ProjectNode[] {
  const parts = filePath.split("/").filter(Boolean);
  if (parts.length === 0) return tree;
  const next = JSON.parse(JSON.stringify(tree)) as ProjectNode[];
  let level = next;
  let prefix = "";
  const fileName = parts[parts.length - 1];
  for (const folder of parts.slice(0, -1)) {
    prefix = prefix ? `${prefix}/${folder}` : folder;
    let node = level.find((item) => item.type === "folder" && item.name === folder);
    if (!node) {
      node = { id: prefix, name: folder, type: "folder", isOpen: true, children: [] };
      level.push(node);
    }
    node.isOpen = true;
    node.children = node.children || [];
    level = node.children;
  }
  const fileId = prefix ? `${prefix}/${fileName}` : fileName;
  const existing = level.find((item) => item.type === "file" && (item.id === fileId || item.name === fileName));
  if (existing) {
    existing.id = fileId;
    existing.name = fileName;
    existing.content = content;
    existing.language = language;
  } else {
    level.push({ id: fileId, name: fileName, type: "file", language, content });
  }
  return next;
}

export function projectTreeFromFiles(files: WebsiteFile[]): ProjectNode[] {
  return files.reduce((tree, file) => placeFileInTree(tree, file.path, file.content, file.language), [] as ProjectNode[]);
}

export function generateFullStackWebsite(blueprintId: string, options?: { brief?: string; siteName?: string }): GeneratedWebsite {
  const blueprint = WEBSITE_BLUEPRINTS.find((item) => item.id === blueprintId) ?? WEBSITE_BLUEPRINTS[0];
  const siteName = sanitizeSiteName(options?.siteName?.trim() || deriveSiteName(options?.brief, blueprint.defaultName));
  const files = buildFiles(blueprint, siteName);
  const summary = [
    `**${siteName}** is ready. I wrote a full-stack **${blueprint.label.toLowerCase()}** into this project.`,
    "",
    "Stack: HTML, CSS, and JavaScript client · Express API · MongoDB (in-memory fallback when no database URI is set).",
    "",
    "Files:",
    ...files.map((file) => `- \`${file.path}\``),
    "",
    "The preview uses sample data. Run the API locally when you want the forms to persist:",
    "",
    "```bash",
    "cp .env.example .env",
    "npm install",
    "npm start",
    "```",
    "",
    "Open http://localhost:4000 — the server also serves the client.",
  ].join("\n");

  return {
    id: blueprint.id,
    label: blueprint.label,
    siteName,
    files,
    tree: projectTreeFromFiles(files),
    summary,
    previewPath: "client/index.html",
  };
}

export function listRequiredWebsitePaths(): string[] {
  return [...REQUIRED_PATHS];
}

function sanitizeSiteName(name: string): string {
  const cleaned = name.replace(/\s+/g, " ").trim().slice(0, 48);
  return cleaned || "Lunor Site";
}

function deriveSiteName(brief: string | undefined, fallback: string): string {
  const quoted = brief?.match(/["“]([^"”]{2,40})["”]/);
  if (quoted?.[1]) return quoted[1].trim();
  if (!brief?.trim()) return fallback;
  const cleaned = brief
    .replace(/^(please\s+)?(build|create|make|generate|scaffold|write)\s+(me\s+)?(a|an|the)?\s*/i, "")
    .replace(/\b(full[-\s]?stack|website generator|website|web\s*site|web\s*app|landing page|with|using|mern|express|mongodb|mongo|node\.?js|backend|api)\b/gi, " ")
    .replace(/[^a-z0-9\s'-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 3 || cleaned.length > 32) return fallback;
  const keywords = new Set(WEBSITE_BLUEPRINTS.flatMap((item) => item.keywords));
  if (keywords.has(cleaned.toLowerCase())) return fallback;
  return cleaned.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lunor-website";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char));
}

function file(path: string, language: string, content: string): WebsiteFile {
  return { path, name: path.split("/").pop() || path, language, content };
}

function buildFiles(blueprint: WebsiteBlueprint, siteName: string): WebsiteFile[] {
  const page = pages[blueprint.id] ?? pages.portfolio;
  const routes = page.routes(siteName);
  const safeName = escapeHtml(siteName);
  return [
    file("client/index.html", "html", htmlPage(siteName, page.body(safeName))),
    file("client/styles.css", "css", siteCss(blueprint.accent)),
    file("client/app.js", "javascript", page.client(siteName)),
    file("server/server.js", "javascript", serverEntry()),
    file("server/db.js", "javascript", dbModule()),
    file("server/model.js", "javascript", modelModule(routes)),
    file("server/routes.js", "javascript", routesModule(routes)),
    file("package.json", "json", packageJson(siteName)),
    file(".env.example", "plaintext", "PORT=4000\nMONGODB_URI=mongodb://127.0.0.1:27017/lunor_website\n"),
    file("README.md", "markdown", readme(blueprint, siteName)),
  ];
}

function htmlPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@360;500;640&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
${body}
  <script src="app.js"></script>
</body>
</html>
`;
}

function siteCss(accent: string): string {
  return `:root {
  --accent: ${accent};
  --bg: #0c1222;
  --card: rgba(20, 28, 47, 0.88);
  --line: rgba(232, 238, 252, 0.12);
  --text: #e8eefc;
  --muted: #9aa8c7;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Outfit, sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
.nav, .hero, .section, .footer { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
.nav { display: flex; justify-content: space-between; align-items: center; padding: 22px 0; }
.brand { font-weight: 640; letter-spacing: 0.04em; }
.nav a { color: var(--muted); margin-left: 16px; font-size: 14px; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center; padding: 18px 0 48px; }
.hero h1, .section h2 { font-family: Fraunces, serif; font-weight: 560; letter-spacing: -0.03em; margin: 0 0 12px; }
.hero h1 { font-size: clamp(40px, 6vw, 72px); line-height: 0.95; }
.lede, .muted { color: var(--muted); line-height: 1.6; }
.hero-photo, .card img { border-radius: 18px; }
.hero-photo { width: 100%; height: 360px; }
.btn, button, .price {
  border: 0; border-radius: 999px; background: var(--accent); color: #08111a;
  font-weight: 640; padding: 12px 18px; cursor: pointer;
}
.section { padding: 10px 0 42px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card, .panel, form {
  background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px;
  backdrop-filter: blur(10px);
}
.card h3, .panel h3 { margin: 10px 0 6px; }
.card p, .panel p { color: var(--muted); margin: 0; }
.card img { height: 160px; width: 100%; }
form { display: grid; gap: 10px; }
input, textarea {
  width: 100%; border-radius: 12px; border: 1px solid var(--line);
  background: rgba(8, 12, 22, 0.55); color: var(--text); padding: 12px 14px; font: inherit;
}
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.stat strong { display: block; font-family: Fraunces, serif; font-size: 32px; }
.footer { padding: 10px 0 40px; color: var(--muted); font-size: 13px; }
.status { min-height: 1.2em; color: var(--accent); font-size: 14px; }
@media (max-width: 800px) {
  .hero, .grid, .stats { grid-template-columns: 1fr; }
  .hero-photo { height: 220px; }
}
`;
}

function serverEntry(): string {
  return `import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDb } from "./db.js";
import { router } from "./routes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(express.static(path.join(__dirname, "../client")));

connectDb()
  .catch((error) => {
    console.error("Database connection failed, continuing with in-memory data.", error.message);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(\`Website running at http://localhost:\${port}\`);
    });
  });
`;
}

function dbModule(): string {
  return `import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MONGODB_URI is not set. The API will keep data in memory.");
    return;
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
`;
}

function modelModule(routes: RouteSpec[]): string {
  const blocks = routes.map((route) => {
    const fields = route.fields
      .map((field) => `    ${field.key}: { type: ${field.type}${field.required ? ", required: true" : ""} }`)
      .join(",\n");
    return `const ${route.model}Schema = new mongoose.Schema({\n${fields}\n}, { timestamps: true });\n\nexport const ${route.model} = mongoose.models.${route.model} || mongoose.model("${route.model}", ${route.model}Schema);`;
  });
  return `import mongoose from "mongoose";\n\n${blocks.join("\n\n")}\n`;
}

function routesModule(routes: RouteSpec[]): string {
  const imports = routes.map((route) => route.model).join(", ");
  const memory = routes
    .map((route) => `  ${route.path}: ${JSON.stringify(route.seed, null, 2).replace(/\n/g, "\n  ")}`)
    .join(",\n");
  const handlers = routes.map((route) => {
    const chunks: string[] = [];
    if (route.methods.includes("GET")) {
      chunks.push(`router.get("/${route.path}", async (_req, res) => {
  if (mongoose.connection.readyState === 1) {
    const rows = await ${route.model}.find().sort({ createdAt: -1 }).lean();
    return res.json(rows);
  }
  res.json(memory.${route.path});
});`);
    }
    if (route.methods.includes("POST")) {
      const assignments = route.fields.map((field) => {
        if (field.type === "Number") return `${field.key}: Number(req.body.${field.key} ?? 0)`;
        return `${field.key}: String(req.body.${field.key} || "").trim().slice(0, 500)`;
      });
      const required = route.fields.filter((field) => field.required).map((field) => `doc.${field.key}`);
      const guard = required.length
        ? `  if (${required.map((key) => `!${key}`).join(" || ")}) {\n    return res.status(400).json({ error: "Missing required fields." });\n  }\n`
        : "";
      chunks.push(`router.post("/${route.path}", async (req, res) => {
  const doc = { ${assignments.join(", ")}, id: Date.now().toString() };
${guard}  if (mongoose.connection.readyState === 1) {
    const saved = await ${route.model}.create(doc);
    return res.status(201).json(saved);
  }
  memory.${route.path}.unshift(doc);
  res.status(201).json(doc);
});`);
    }
    return chunks.join("\n\n");
  });

  return `import { Router } from "express";
import mongoose from "mongoose";
import { ${imports} } from "./model.js";

const memory = {
${memory}
};

export const router = Router();

${handlers.join("\n\n")}
`;
}

function packageJson(siteName: string): string {
  return JSON.stringify({
    name: slugify(siteName),
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      start: "node server/server.js",
      dev: "node --watch server/server.js",
    },
    dependencies: {
      cors: "^2.8.5",
      dotenv: "^16.4.5",
      express: "^4.21.2",
      mongoose: "^8.9.5",
    },
  }, null, 2) + "\n";
}

function readme(blueprint: WebsiteBlueprint, siteName: string): string {
  return `# ${siteName}

Full-stack ${blueprint.label.toLowerCase()} generated by the Lunor.AI Web Development assistant.

## Stack

- Client: \`client/index.html\`, \`client/styles.css\`, \`client/app.js\`
- API: Express in \`server/\`
- Database: MongoDB through Mongoose, with an in-memory fallback

## Run

\`\`\`bash
cp .env.example .env
npm install
npm start
\`\`\`

The site and API are both served at http://localhost:4000.
Leave \`MONGODB_URI\` empty to use the in-memory data that ships with the routes.
`;
}

function apiBase(): string {
  return `const API_BASE = location.port === "4000" ? "/api" : "http://localhost:4000/api";

async function readJson(path, fallback) {
  try {
    const response = await fetch(API_BASE + path);
    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch {
    return fallback;
  }
}

async function postJson(path, payload) {
  const response = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}
`;
}

const pages: Record<string, {
  body: (siteName: string) => string;
  client: (siteName: string) => string;
  routes: (siteName: string) => RouteSpec[];
}> = {
  portfolio: {
    body: (siteName) => `  <header class="nav"><span class="brand">${siteName}</span><nav><a href="#work">Work</a><a href="#contact">Contact</a></nav></header>
  <section class="hero">
    <div>
      <p class="lede">Product design and web engineering</p>
      <h1>${siteName}</h1>
      <p class="lede">Selected work, loaded from the projects API. Send a note and the contact route stores it.</p>
    </div>
    <img class="hero-photo" alt="Studio desk" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&h=900&fit=crop&q=80" />
  </section>
  <section class="section" id="work"><h2>Selected work</h2><div class="grid" id="project-grid"></div></section>
  <section class="section" id="contact">
    <h2>Start a project</h2>
    <form id="contact-form">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" rows="4" placeholder="What should we build?" required></textarea>
      <button type="submit">Send message</button>
      <p class="status" id="form-status"></p>
    </form>
  </section>
  <footer class="footer">Client talks to /api/projects and /api/messages.</footer>`,
    client: (siteName) => `${apiBase()}
const fallbackProjects = [
  { title: "Atlas Archive", summary: "Research library with a quiet reading layout.", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop&q=80" },
  { title: "Harbor Notes", summary: "Editorial site for a coastal journal.", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop&q=80" },
  { title: "Kindred", summary: "Membership dashboard for a design studio.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80" }
];

function paintProjects(projects) {
  document.getElementById("project-grid").innerHTML = projects.map((project) => \`
    <article class="card">
      <img src="\${escapeHtml(project.image)}" alt="\${escapeHtml(project.title)}" />
      <h3>\${escapeHtml(project.title)}</h3>
      <p>\${escapeHtml(project.summary)}</p>
    </article>\`).join("");
}

readJson("/projects", fallbackProjects).then(paintProjects);

document.getElementById("contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("form-status");
  const payload = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await postJson("/messages", payload);
    status.textContent = "Message saved.";
    event.currentTarget.reset();
  } catch {
    status.textContent = ${JSON.stringify(`${siteName} preview: start the API with npm start to store messages.`)};
  }
});
`,
    routes: () => [
      {
        path: "projects",
        model: "Project",
        methods: ["GET"],
        fields: [
          { key: "title", type: "String", required: true },
          { key: "summary", type: "String", required: true },
          { key: "image", type: "String" },
        ],
        seed: [
          { title: "Atlas Archive", summary: "Research library with a quiet reading layout.", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop&q=80" },
          { title: "Harbor Notes", summary: "Editorial site for a coastal journal.", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop&q=80" },
          { title: "Kindred", summary: "Membership dashboard for a design studio.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80" },
        ],
      },
      {
        path: "messages",
        model: "Message",
        methods: ["POST"],
        fields: [
          { key: "name", type: "String", required: true },
          { key: "email", type: "String", required: true },
          { key: "message", type: "String", required: true },
        ],
        seed: [],
      },
    ],
  },
  saas: {
    body: (siteName) => `  <header class="nav"><span class="brand">${siteName}</span><nav><a href="#product">Product</a><a href="#pricing">Pricing</a></nav></header>
  <section class="hero">
    <div>
      <p class="lede">Operations software for small teams</p>
      <h1>Ship the week without the scramble.</h1>
      <p class="lede">${siteName} keeps plans, owners, and status in one board. Join the waitlist and the API stores your email.</p>
    </div>
    <img class="hero-photo" alt="Team planning" src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&h=900&fit=crop&q=80" />
  </section>
  <section class="section" id="product"><h2>What you get</h2><div class="grid" id="feature-grid"></div></section>
  <section class="section" id="pricing">
    <h2>Waitlist</h2>
    <form id="waitlist-form">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Work email" required />
      <input name="company" placeholder="Company" />
      <button type="submit">Request access</button>
      <p class="status" id="form-status"></p>
    </form>
  </section>`,
    client: () => `${apiBase()}
const fallbackFeatures = [
  { title: "Shared board", summary: "One view for work in flight." },
  { title: "Owner trails", summary: "See who moved a task and when." },
  { title: "Friday digest", summary: "A short recap instead of another meeting." }
];

readJson("/features", fallbackFeatures).then((features) => {
  document.getElementById("feature-grid").innerHTML = features.map((feature) => \`
    <article class="card"><h3>\${escapeHtml(feature.title)}</h3><p>\${escapeHtml(feature.summary)}</p></article>\`).join("");
});

document.getElementById("waitlist-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("form-status");
  try {
    await postJson("/waitlist", Object.fromEntries(new FormData(event.currentTarget)));
    status.textContent = "You are on the list.";
    event.currentTarget.reset();
  } catch {
    status.textContent = "Preview mode. Run npm start to save waitlist entries.";
  }
});
`,
    routes: () => [
      {
        path: "features",
        model: "Feature",
        methods: ["GET"],
        fields: [
          { key: "title", type: "String", required: true },
          { key: "summary", type: "String", required: true },
        ],
        seed: [
          { title: "Shared board", summary: "One view for work in flight." },
          { title: "Owner trails", summary: "See who moved a task and when." },
          { title: "Friday digest", summary: "A short recap instead of another meeting." },
        ],
      },
      {
        path: "waitlist",
        model: "WaitlistEntry",
        methods: ["POST"],
        fields: [
          { key: "name", type: "String", required: true },
          { key: "email", type: "String", required: true },
          { key: "company", type: "String" },
        ],
        seed: [],
      },
    ],
  },
  blog: {
    body: (siteName) => `  <header class="nav"><span class="brand">${siteName}</span><nav><a href="#posts">Stories</a></nav></header>
  <section class="hero">
    <div>
      <p class="lede">Essays from the workshop</p>
      <h1>${siteName}</h1>
      <p class="lede">Posts are served by the Express API. The preview falls back to the same seed data.</p>
    </div>
    <img class="hero-photo" alt="Writing desk" src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&h=900&fit=crop&q=80" />
  </section>
  <section class="section" id="posts"><h2>Latest</h2><div class="grid" id="post-grid"></div></section>`,
    client: () => `${apiBase()}
const fallbackPosts = [
  { title: "Margins and rhythm", excerpt: "Why spacing does more work than color.", tag: "Design" },
  { title: "A smaller API", excerpt: "Three routes that cover a whole reading list.", tag: "Backend" },
  { title: "Notes after shipping", excerpt: "What the first week of readers changed.", tag: "Process" }
];

readJson("/posts", fallbackPosts).then((posts) => {
  document.getElementById("post-grid").innerHTML = posts.map((post) => \`
    <article class="card"><p class="muted">\${escapeHtml(post.tag)}</p><h3>\${escapeHtml(post.title)}</h3><p>\${escapeHtml(post.excerpt)}</p></article>\`).join("");
});
`,
    routes: () => [
      {
        path: "posts",
        model: "Post",
        methods: ["GET"],
        fields: [
          { key: "title", type: "String", required: true },
          { key: "excerpt", type: "String", required: true },
          { key: "tag", type: "String" },
        ],
        seed: [
          { title: "Margins and rhythm", excerpt: "Why spacing does more work than color.", tag: "Design" },
          { title: "A smaller API", excerpt: "Three routes that cover a whole reading list.", tag: "Backend" },
          { title: "Notes after shipping", excerpt: "What the first week of readers changed.", tag: "Process" },
        ],
      },
    ],
  },
  restaurant: {
    body: (siteName) => `  <header class="nav"><span class="brand">${siteName}</span><nav><a href="#menu">Menu</a><a href="#reserve">Reserve</a></nav></header>
  <section class="hero">
    <div>
      <p class="lede">Dinner from five o'clock</p>
      <h1>${siteName}</h1>
      <p class="lede">The menu is loaded from the API. Reservations post to the bookings route.</p>
    </div>
    <img class="hero-photo" alt="Restaurant table" src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=900&fit=crop&q=80" />
  </section>
  <section class="section" id="menu"><h2>Tonight</h2><div class="grid" id="menu-grid"></div></section>
  <section class="section" id="reserve">
    <h2>Reserve a table</h2>
    <form id="reserve-form">
      <input name="name" placeholder="Name" required />
      <input name="partySize" type="number" min="1" placeholder="Party size" required />
      <input name="when" placeholder="Friday, 7:30pm" required />
      <button type="submit">Request table</button>
      <p class="status" id="form-status"></p>
    </form>
  </section>`,
    client: () => `${apiBase()}
const fallbackMenu = [
  { name: "Citrus fennel salad", detail: "Orange, almond, and mint.", price: 14 },
  { name: "Wood-fired bass", detail: "Charred lemon and herb butter.", price: 32 },
  { name: "Olive oil cake", detail: "Rosemary cream.", price: 12 }
];

readJson("/menu", fallbackMenu).then((items) => {
  document.getElementById("menu-grid").innerHTML = items.map((item) => \`
    <article class="card"><h3>\${escapeHtml(item.name)}</h3><p>\${escapeHtml(item.detail)}</p><p class="muted">$\${escapeHtml(item.price)}</p></article>\`).join("");
});

document.getElementById("reserve-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("form-status");
  try {
    await postJson("/reservations", Object.fromEntries(new FormData(event.currentTarget)));
    status.textContent = "Reservation requested.";
    event.currentTarget.reset();
  } catch {
    status.textContent = "Preview mode. Run npm start to save reservations.";
  }
});
`,
    routes: () => [
      {
        path: "menu",
        model: "MenuItem",
        methods: ["GET"],
        fields: [
          { key: "name", type: "String", required: true },
          { key: "detail", type: "String", required: true },
          { key: "price", type: "Number", required: true },
        ],
        seed: [
          { name: "Citrus fennel salad", detail: "Orange, almond, and mint.", price: 14 },
          { name: "Wood-fired bass", detail: "Charred lemon and herb butter.", price: 32 },
          { name: "Olive oil cake", detail: "Rosemary cream.", price: 12 },
        ],
      },
      {
        path: "reservations",
        model: "Reservation",
        methods: ["POST"],
        fields: [
          { key: "name", type: "String", required: true },
          { key: "partySize", type: "Number", required: true },
          { key: "when", type: "String", required: true },
        ],
        seed: [],
      },
    ],
  },
  store: {
    body: (siteName) => `  <header class="nav"><span class="brand">${siteName}</span><nav><a href="#catalog">Catalog</a><a href="#checkout">Checkout</a></nav></header>
  <section class="hero">
    <div>
      <p class="lede">Objects for the desk and the table</p>
      <h1>${siteName}</h1>
      <p class="lede">Products come from the catalog API. Checkout posts an order with the items in your cart.</p>
    </div>
    <img class="hero-photo" alt="Shop interior" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=900&fit=crop&q=80" />
  </section>
  <section class="section" id="catalog"><h2>Catalog</h2><div class="grid" id="product-grid"></div></section>
  <section class="section" id="checkout">
    <h2>Checkout</h2>
    <form id="checkout-form">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <p class="muted" id="cart-summary">Cart is empty.</p>
      <button type="submit">Place order</button>
      <p class="status" id="form-status"></p>
    </form>
  </section>`,
    client: () => `${apiBase()}
const fallbackProducts = [
  { name: "Ceramic pour-over", price: 42, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=600&fit=crop&q=80" },
  { name: "Linen notebook", price: 18, image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop&q=80" },
  { name: "Oak tray", price: 64, image: "https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?w=800&h=600&fit=crop&q=80" }
];
const cart = [];

function renderProducts(products) {
  document.getElementById("product-grid").innerHTML = products.map((product, index) => \`
    <article class="card">
      <img src="\${escapeHtml(product.image)}" alt="\${escapeHtml(product.name)}" />
      <h3>\${escapeHtml(product.name)}</h3>
      <p>$\${escapeHtml(product.price)}</p>
      <button type="button" data-index="\${index}">Add</button>
    </article>\`).join("");
  document.querySelectorAll("#product-grid button").forEach((button) => {
    button.addEventListener("click", () => {
      cart.push(products[Number(button.dataset.index)].name);
      document.getElementById("cart-summary").textContent = cart.join(", ");
    });
  });
}

readJson("/products", fallbackProducts).then(renderProducts);

document.getElementById("checkout-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("form-status");
  const payload = Object.fromEntries(new FormData(event.currentTarget));
  payload.items = cart.join(", ");
  try {
    await postJson("/orders", payload);
    status.textContent = "Order placed.";
    cart.length = 0;
    document.getElementById("cart-summary").textContent = "Cart is empty.";
    event.currentTarget.reset();
  } catch {
    status.textContent = "Preview mode. Run npm start to save orders.";
  }
});
`,
    routes: () => [
      {
        path: "products",
        model: "Product",
        methods: ["GET"],
        fields: [
          { key: "name", type: "String", required: true },
          { key: "price", type: "Number", required: true },
          { key: "image", type: "String" },
        ],
        seed: [
          { name: "Ceramic pour-over", price: 42, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=600&fit=crop&q=80" },
          { name: "Linen notebook", price: 18, image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop&q=80" },
          { name: "Oak tray", price: 64, image: "https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?w=800&h=600&fit=crop&q=80" },
        ],
      },
      {
        path: "orders",
        model: "Order",
        methods: ["POST"],
        fields: [
          { key: "name", type: "String", required: true },
          { key: "email", type: "String", required: true },
          { key: "items", type: "String", required: true },
        ],
        seed: [],
      },
    ],
  },
  dashboard: {
    body: (siteName) => `  <header class="nav"><span class="brand">${siteName}</span><nav><a href="#board">Board</a></nav></header>
  <section class="hero">
    <div>
      <p class="lede">Today at a glance</p>
      <h1>${siteName}</h1>
      <p class="lede">Stats and tasks are loaded from the API. New tasks post back to the same route.</p>
    </div>
    <img class="hero-photo" alt="Analytics" src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=900&fit=crop&q=80" />
  </section>
  <section class="section" id="board">
    <div class="stats" id="stat-row"></div>
    <div class="grid" id="task-grid"></div>
    <form id="task-form">
      <input name="title" placeholder="New task" required />
      <input name="owner" placeholder="Owner" required />
      <button type="submit">Add task</button>
      <p class="status" id="form-status"></p>
    </form>
  </section>`,
    client: () => `${apiBase()}
const fallbackStats = [
  { label: "Open", value: "12" },
  { label: "Shipped", value: "7" },
  { label: "Waiting", value: "3" }
];
let tasks = [
  { title: "Review onboarding copy", owner: "Amina" },
  { title: "Ship invoice export", owner: "Leo" },
  { title: "Check failed webhooks", owner: "Noah" }
];

function paint() {
  readJson("/stats", fallbackStats).then((stats) => {
    document.getElementById("stat-row").innerHTML = stats.map((stat) => \`
      <article class="panel"><strong>\${escapeHtml(stat.value)}</strong><p>\${escapeHtml(stat.label)}</p></article>\`).join("");
  });
  document.getElementById("task-grid").innerHTML = tasks.map((task) => \`
    <article class="card"><h3>\${escapeHtml(task.title)}</h3><p>\${escapeHtml(task.owner)}</p></article>\`).join("");
}

readJson("/tasks", tasks).then((rows) => { tasks = rows; paint(); });

document.getElementById("task-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("form-status");
  const payload = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const saved = await postJson("/tasks", payload);
    tasks = [saved, ...tasks];
    paint();
    status.textContent = "Task added.";
    event.currentTarget.reset();
  } catch {
    tasks = [payload, ...tasks];
    paint();
    status.textContent = "Added in the preview. Run npm start to persist it.";
  }
});
`,
    routes: () => [
      {
        path: "stats",
        model: "Stat",
        methods: ["GET"],
        fields: [
          { key: "label", type: "String", required: true },
          { key: "value", type: "String", required: true },
        ],
        seed: [
          { label: "Open", value: "12" },
          { label: "Shipped", value: "7" },
          { label: "Waiting", value: "3" },
        ],
      },
      {
        path: "tasks",
        model: "Task",
        methods: ["GET", "POST"],
        fields: [
          { key: "title", type: "String", required: true },
          { key: "owner", type: "String", required: true },
        ],
        seed: [
          { title: "Review onboarding copy", owner: "Amina" },
          { title: "Ship invoice export", owner: "Leo" },
          { title: "Check failed webhooks", owner: "Noah" },
        ],
      },
    ],
  },
};
