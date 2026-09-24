/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a browser-previewable client plus a Node built-in HTTP API.
 * The client falls back to embedded sample data when the API is offline.
 */

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface WebsiteTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: WebsiteTreeNode[];
  isOpen?: boolean;
}

export interface WebsiteBlueprintMeta {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface WebsiteProject {
  id: string;
  label: string;
  siteName: string;
  files: GeneratedFile[];
  tree: WebsiteTreeNode[];
  summary: string;
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprintMeta[] = [
  { id: "portfolio", label: "Portfolio", description: "Projects, about, and a contact API", icon: "✦" },
  { id: "saas", label: "SaaS landing", description: "Features, pricing, and a waitlist API", icon: "◆" },
  { id: "blog", label: "Blog", description: "Articles served by a posts API", icon: "✎" },
  { id: "restaurant", label: "Restaurant", description: "Menu API and table reservations", icon: "◎" },
  { id: "store", label: "Store", description: "Product catalog and checkout API", icon: "▣" },
  { id: "dashboard", label: "Dashboard", description: "Live stats API and a task list", icon: "▤" },
];

const BLUEPRINT_IDS = new Set(WEBSITE_BLUEPRINTS.map((b) => b.id));

export function slugifySiteName(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[ch];
  });
}

function jsString(value: string): string {
  return JSON.stringify(value);
}

export function detectWebsiteRequest(text: string): string | null {
  const t = text.toLowerCase();
  const mentionsBuild = /\b(build|create|generate|make|scaffold|spin up)\b/.test(t);
  const mentionsSite = /(website|web site|landing page|full[-\s]?stack|web app|online store|storefront)/.test(t);
  const mentionsKind = /(portfolio|restaurant|saas|blog|dashboard|\bstore\b|\bshop\b)/.test(t);
  if (!mentionsBuild || (!mentionsSite && !mentionsKind)) return null;

  if (/restaurant|cafe|bistro|reservation/.test(t)) return "restaurant";
  if (/\b(store|shop|e-?commerce|checkout)\b/.test(t)) return "store";
  if (/\b(blog|journal)\b/.test(t)) return "blog";
  if (/dashboard|admin panel|analytics/.test(t)) return "dashboard";
  if (/saas|startup|pricing|waitlist|landing/.test(t)) return "saas";
  if (/portfolio|personal site|freelance/.test(t)) return "portfolio";
  if (mentionsSite) return "portfolio";
  return null;
}

export function extractSiteName(text: string): string | null {
  const quoted = text.match(/["“]([^"”]{2,48})["”]/);
  if (quoted?.[1]) return quoted[1].trim();
  const named = text.match(/\b(?:called|named)\s+([A-Za-z0-9][\w&'. -]{1,40})/);
  if (named?.[1]) return named[1].trim().replace(/[.?!]$/, "");
  return null;
}

interface Theme {
  accent: string;
  accent2: string;
  bg: string;
  ink: string;
  card: string;
}

const THEMES: Record<string, Theme> = {
  portfolio: { accent: "#7c5cff", accent2: "#22d3ee", bg: "#0b1020", ink: "#eef2ff", card: "#141a2e" },
  saas: { accent: "#6366f1", accent2: "#34d399", bg: "#070b16", ink: "#f8fafc", card: "#111827" },
  blog: { accent: "#f59e0b", accent2: "#fb7185", bg: "#14110d", ink: "#faf6ef", card: "#1e1914" },
  restaurant: { accent: "#e11d48", accent2: "#fbbf24", bg: "#140c0e", ink: "#fff7f5", card: "#241216" },
  store: { accent: "#0ea5e9", accent2: "#a3e635", bg: "#071018", ink: "#f0f9ff", card: "#10202c" },
  dashboard: { accent: "#38bdf8", accent2: "#a78bfa", bg: "#0b1220", ink: "#e2e8f0", card: "#121a2b" },
};

function css(theme: Theme): string {
  return `:root {
  --accent: ${theme.accent};
  --accent-2: ${theme.accent2};
  --bg: ${theme.bg};
  --ink: ${theme.ink};
  --card: ${theme.card};
  --muted: color-mix(in srgb, var(--ink) 68%, transparent);
  --line: color-mix(in srgb, var(--ink) 14%, transparent);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Sora", "Segoe UI", sans-serif;
  background: radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%), var(--bg);
  color: var(--ink);
  min-height: 100vh;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; object-fit: cover; }
.wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
header {
  position: sticky; top: 0; z-index: 20;
  backdrop-filter: blur(16px);
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  border-bottom: 1px solid var(--line);
}
.nav { display: flex; align-items: center; justify-content: space-between; min-height: 68px; gap: 16px; }
.brand { font-weight: 700; letter-spacing: -0.03em; }
.brand span { color: var(--accent-2); }
.links { display: flex; gap: 18px; align-items: center; }
.links a { color: var(--muted); font-size: 14px; }
.links a:hover { color: var(--ink); }
.btn, button.btn {
  border: 0; cursor: pointer; border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #081018; font-weight: 700; padding: 12px 18px; font: inherit;
}
.btn.ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; padding: 72px 0 36px; }
.kicker { color: var(--accent-2); letter-spacing: 0.16em; text-transform: uppercase; font-size: 12px; font-weight: 700; }
h1 { font-size: clamp(40px, 6vw, 68px); line-height: 0.95; letter-spacing: -0.045em; margin: 12px 0; }
.lede { color: var(--muted); font-size: 18px; max-width: 46ch; }
.hero-card, .card, form, .stat, article, .item {
  background: color-mix(in srgb, var(--card) 92%, white 4%);
  border: 1px solid var(--line);
  border-radius: 22px;
}
.hero-card { overflow: hidden; min-height: 320px; position: relative; }
.hero-card img { width: 100%; height: 360px; }
.hero-card figcaption { position: absolute; left: 16px; bottom: 16px; background: #0008; padding: 8px 12px; border-radius: 999px; font-size: 13px; }
section { padding: 28px 0; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid.two { grid-template-columns: 1.2fr 0.8fr; }
.card, article, .item, .stat { padding: 18px; }
.card h3, article h3, .item h3 { margin: 8px 0; }
.muted { color: var(--muted); }
.price { font-size: 28px; font-weight: 700; }
form { padding: 18px; display: grid; gap: 10px; }
input, textarea, select {
  width: 100%; border-radius: 12px; border: 1px solid var(--line);
  background: #0004; color: var(--ink); padding: 12px 14px; font: inherit;
}
.row { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.tag { font-size: 12px; border: 1px solid var(--line); border-radius: 999px; padding: 4px 8px; color: var(--muted); }
footer { border-top: 1px solid var(--line); margin-top: 40px; padding: 28px 0 40px; color: var(--muted); }
.toast { min-height: 1.2em; color: var(--accent-2); font-size: 14px; }
.menu-btn { display: none; background: transparent; color: var(--ink); border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; }
@media (max-width: 860px) {
  .hero, .grid, .grid.two { grid-template-columns: 1fr; }
  .menu-btn { display: inline-flex; }
  .links { display: none; position: absolute; top: 68px; left: 0; right: 0; flex-direction: column; padding: 16px; background: var(--bg); border-bottom: 1px solid var(--line); }
  .links.open { display: flex; }
}
`;
}

function page(opts: {
  siteName: string;
  title: string;
  kicker: string;
  lede: string;
  image: string;
  imageAlt: string;
  nav: string;
  main: string;
}): string {
  const name = esc(opts.siteName);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(opts.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header>
    <div class="wrap nav">
      <a class="brand" href="#top">${name}<span>.</span></a>
      <button class="menu-btn" type="button" id="menuBtn" aria-label="Open menu">Menu</button>
      <nav class="links" id="navLinks">${opts.nav}</nav>
    </div>
  </header>
  <main id="top" class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">${esc(opts.kicker)}</p>
        <h1>${name}</h1>
        <p class="lede">${esc(opts.lede)}</p>
      </div>
      <figure class="hero-card">
        <img src="${opts.image}" alt="${esc(opts.imageAlt)}" />
        <figcaption>Live preview · API optional</figcaption>
      </figure>
    </section>
    ${opts.main}
  </main>
  <footer>
    <div class="wrap row">
      <span>© <span id="year"></span> ${name}</span>
      <span>Full-stack starter · Lunor.AI</span>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function clientScript(siteName: string, fallbackConst: string, boot: string): string {
  return `// ${siteName} — talks to the Node API, then falls back to local data for the in-editor preview.
const API = "http://localhost:3000";
const SITE_NAME = ${jsString(siteName)};

${fallbackConst}

async function api(path, options) {
  try {
    const response = await fetch(API + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.info("API offline, using embedded data:", error.message);
    return null;
  }
}

document.getElementById("year").textContent = String(new Date().getFullYear());
document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});

${boot}
`;
}

function serverSource(siteName: string, dataBlock: string, routes: string): string {
  return `// ${siteName} API — Node built-ins only. Run: node server/server.js
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 3000);
const clientDir = fileURLToPath(new URL("../client/", import.meta.url));
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

${dataBlock}

function send(res, status, body, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

async function handleApi(req, res, path) {
${routes}
  return send(res, 404, { error: "Not found" });
}

async function serveStatic(res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(clientDir, requested));
  if (!filePath.startsWith(clientDir)) return send(res, 403, { error: "Forbidden" });
  try {
    const file = await readFile(filePath);
    return send(res, 200, file, MIME[extname(filePath)] || "application/octet-stream");
  } catch {
    const home = await readFile(join(clientDir, "index.html"));
    return send(res, 200, home, MIME[".html"]);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, "");
  const url = new URL(req.url || "/", "http://localhost");
  if (url.pathname.startsWith("/api/")) return handleApi(req, res, url.pathname);
  return serveStatic(res, decodeURIComponent(url.pathname));
});

server.listen(PORT, () => {
  console.log(${jsString(siteName)} + " running at http://localhost:" + PORT);
});
`;
}

function readme(siteName: string, kind: string, endpoints: string[]): string {
  const slug = slugifySiteName(siteName);
  return `# ${siteName}

Full-stack ${kind} generated by the Lunor.AI Web Development assistant.

## Preview in the editor

Open \`client/index.html\` and press Run. The page renders immediately and uses embedded sample data when the API is offline.

## Run the API locally

\`\`\`bash
cd ${slug}
node server/server.js
\`\`\`

Then open http://localhost:3000. The same Node process serves the client and the JSON API.

## API

${endpoints.map((line) => `- \`${line}\``).join("\n")}

No npm install is required. The server uses only Node.js built-in modules.
`;
}

function packageJson(siteName: string): string {
  return JSON.stringify({
    name: slugifySiteName(siteName),
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      start: "node server/server.js",
      dev: "node server/server.js",
    },
  }, null, 2) + "\n";
}

function filesFor(parts: {
  siteName: string;
  kind: string;
  html: string;
  script: string;
  server: string;
  readmeBody: string;
}): GeneratedFile[] {
  return [
    { path: "client/index.html", language: "html", content: parts.html },
    { path: "client/styles.css", language: "css", content: css(THEMES[parts.kind] || THEMES.portfolio) },
    { path: "client/script.js", language: "javascript", content: parts.script },
    { path: "server/server.js", language: "javascript", content: parts.server },
    { path: "package.json", language: "json", content: packageJson(parts.siteName) },
    { path: "README.md", language: "markdown", content: parts.readmeBody },
  ];
}

function portfolio(siteName: string): GeneratedFile[] {
  const html = page({
    siteName,
    title: `${siteName} — Portfolio`,
    kicker: "Selected work",
    lede: "A full-stack portfolio: the page renders on its own, and the contact form posts to a Node API when you run the server.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&h=900&fit=crop&q=80",
    imageAlt: "Developer workspace",
    nav: `<a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a>`,
    main: `
    <section id="work"><h2>Work</h2><div class="grid" id="projectGrid"></div></section>
    <section id="about" class="grid two">
      <article><h2>About</h2><p class="muted">I design and ship calm, fast interfaces. This starter includes a real API route so you can practice the full request path.</p></article>
      <article><h3>Now</h3><p class="muted">Open to product collaborations. Messages land in the API memory store at <code>/api/messages</code>.</p></article>
    </section>
    <section id="contact" class="grid two">
      <form id="contactForm">
        <h2>Start a project</h2>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <textarea name="note" rows="4" placeholder="What should we build?" required></textarea>
        <button class="btn" type="submit">Send</button>
        <p class="toast" id="toast"></p>
      </form>
      <article><h3>How this works</h3><p class="muted">The browser calls <code>POST /api/contact</code>. If the server is not running, the form still confirms locally so the preview stays useful.</p></article>
    </section>`,
  });
  const script = clientScript(siteName, `const FALLBACK_PROJECTS = [
  { title: "Northwind Atlas", tag: "Product", summary: "A map-first travel planner with saved routes." },
  { title: "Harbor Ledger", tag: "Finance", summary: "Invoice workspace for a small maritime co-op." },
  { title: "Lumen Notes", tag: "Writing", summary: "A quiet editor with shared comments." },
];`, `async function renderProjects() {
  const data = await api("/api/projects");
  const projects = data?.projects || FALLBACK_PROJECTS;
  document.getElementById("projectGrid").innerHTML = projects.map((project) => \`
    <article class="card">
      <span class="tag">\${project.tag}</span>
      <h3>\${project.title}</h3>
      <p class="muted">\${project.summary}</p>
    </article>\`).join("");
}

document.getElementById("contactForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const saved = await api("/api/contact", { method: "POST", body: JSON.stringify(payload) });
  document.getElementById("toast").textContent = saved
    ? "Sent to the API."
    : "Saved in the preview. Start the server to persist it.";
  form.reset();
});

renderProjects();
`);
  const server = serverSource(siteName, `const PROJECTS = [
  { title: "Northwind Atlas", tag: "Product", summary: "A map-first travel planner with saved routes." },
  { title: "Harbor Ledger", tag: "Finance", summary: "Invoice workspace for a small maritime co-op." },
  { title: "Lumen Notes", tag: "Writing", summary: "A quiet editor with shared comments." },
];
const messages = [];`, `  if (req.method === "GET" && path === "/api/projects") return send(res, 200, { projects: PROJECTS });
  if (req.method === "GET" && path === "/api/messages") return send(res, 200, { messages });
  if (req.method === "POST" && path === "/api/contact") {
    const body = await readBody(req);
    const message = { id: Date.now(), name: String(body.name || "Guest"), email: String(body.email || ""), note: String(body.note || ""), at: new Date().toISOString() };
    messages.unshift(message);
    return send(res, 201, { ok: true, message });
  }`);
  return filesFor({
    siteName, kind: "portfolio", html, script, server,
    readmeBody: readme(siteName, "portfolio", ["GET /api/projects", "POST /api/contact", "GET /api/messages"]),
  });
}

function saas(siteName: string): GeneratedFile[] {
  const html = page({
    siteName,
    title: `${siteName} — Product`,
    kicker: "Product launch",
    lede: "A landing page with pricing and a waitlist. Signups post to the Node API and stay visible in the preview if the server is offline.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&h=900&fit=crop&q=80",
    imageAlt: "Team planning a product launch",
    nav: `<a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#waitlist">Waitlist</a>`,
    main: `
    <section id="features"><h2>Features</h2><div class="grid" id="featureGrid"></div></section>
    <section id="pricing"><h2>Pricing</h2><div class="grid" id="pricingGrid"></div></section>
    <section id="waitlist" class="grid two">
      <form id="waitlistForm">
        <h2>Join the waitlist</h2>
        <input name="email" type="email" placeholder="Work email" required />
        <input name="company" placeholder="Company" />
        <button class="btn" type="submit">Request access</button>
        <p class="toast" id="toast"></p>
      </form>
      <article><h3>Recent signups</h3><div id="signupList" class="muted"></div></article>
    </section>`,
  });
  const script = clientScript(siteName, `const FALLBACK_FEATURES = [
  { title: "Shared inbox", summary: "One queue for every customer conversation." },
  { title: "Release notes", summary: "Publish what changed without leaving the app." },
  { title: "Usage alerts", summary: "Know when a workspace is about to hit a limit." },
];
const FALLBACK_PLANS = [
  { name: "Starter", price: "$0", detail: "For a single builder trying the product." },
  { name: "Team", price: "$29", detail: "Shared projects, roles, and priority email." },
  { name: "Scale", price: "Talk", detail: "SSO, audit log, and a shared Slack channel." },
];
const localSignups = [];`, `function paint(features, plans, signups) {
  document.getElementById("featureGrid").innerHTML = features.map((item) => \`<article class="card"><h3>\${item.title}</h3><p class="muted">\${item.summary}</p></article>\`).join("");
  document.getElementById("pricingGrid").innerHTML = plans.map((plan) => \`<article class="card"><h3>\${plan.name}</h3><p class="price">\${plan.price}</p><p class="muted">\${plan.detail}</p></article>\`).join("");
  document.getElementById("signupList").innerHTML = signups.length
    ? signups.map((row) => \`<p>\${row.email} · \${row.company || "Independent"}</p>\`).join("")
    : "<p>No signups yet.</p>";
}

async function refresh() {
  const data = await api("/api/site");
  paint(data?.features || FALLBACK_FEATURES, data?.plans || FALLBACK_PLANS, data?.signups || localSignups);
}

document.getElementById("waitlistForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  const saved = await api("/api/waitlist", { method: "POST", body: JSON.stringify(payload) });
  if (!saved) localSignups.unshift({ email: payload.email, company: payload.company });
  document.getElementById("toast").textContent = saved ? "You're on the API waitlist." : "Saved locally until the server is running.";
  event.currentTarget.reset();
  refresh();
});

refresh();
`);
  const server = serverSource(siteName, `const FEATURES = [
  { title: "Shared inbox", summary: "One queue for every customer conversation." },
  { title: "Release notes", summary: "Publish what changed without leaving the app." },
  { title: "Usage alerts", summary: "Know when a workspace is about to hit a limit." },
];
const PLANS = [
  { name: "Starter", price: "$0", detail: "For a single builder trying the product." },
  { name: "Team", price: "$29", detail: "Shared projects, roles, and priority email." },
  { name: "Scale", price: "Talk", detail: "SSO, audit log, and a shared Slack channel." },
];
const signups = [];`, `  if (req.method === "GET" && path === "/api/site") return send(res, 200, { features: FEATURES, plans: PLANS, signups });
  if (req.method === "POST" && path === "/api/waitlist") {
    const body = await readBody(req);
    const signup = { id: Date.now(), email: String(body.email || ""), company: String(body.company || ""), at: new Date().toISOString() };
    if (!signup.email) return send(res, 400, { error: "Email is required" });
    signups.unshift(signup);
    return send(res, 201, { ok: true, signup });
  }`);
  return filesFor({
    siteName, kind: "saas", html, script, server,
    readmeBody: readme(siteName, "SaaS landing page", ["GET /api/site", "POST /api/waitlist"]),
  });
}

function blog(siteName: string): GeneratedFile[] {
  const html = page({
    siteName,
    title: `${siteName} — Journal`,
    kicker: "Field notes",
    lede: "A small journal. Posts come from the API, with three essays bundled in the page so the preview never looks empty.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&h=900&fit=crop&q=80",
    imageAlt: "Notebook and pen",
    nav: `<a href="#posts">Posts</a><a href="#write">Write</a>`,
    main: `
    <section id="posts"><h2>Latest</h2><div class="grid" id="postGrid"></div></section>
    <section id="write">
      <form id="postForm">
        <h2>New note</h2>
        <input name="title" placeholder="Title" required />
        <textarea name="excerpt" rows="4" placeholder="Opening paragraph" required></textarea>
        <button class="btn" type="submit">Publish</button>
        <p class="toast" id="toast"></p>
      </form>
    </section>`,
  });
  const script = clientScript(siteName, `const FALLBACK_POSTS = [
  { title: "Shipping on a Tuesday", excerpt: "A short checklist I use before a release leaves the branch." },
  { title: "Tables that breathe", excerpt: "Spacing, type, and why most dashboards feel cramped." },
  { title: "APIs for humans", excerpt: "Name routes after the job the screen is doing." },
];
const localPosts = [];`, `async function renderPosts() {
  const data = await api("/api/posts");
  const posts = data?.posts || [...localPosts, ...FALLBACK_POSTS];
  document.getElementById("postGrid").innerHTML = posts.map((post) => \`<article><h3>\${post.title}</h3><p class="muted">\${post.excerpt}</p></article>\`).join("");
}

document.getElementById("postForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  const saved = await api("/api/posts", { method: "POST", body: JSON.stringify(payload) });
  if (!saved) localPosts.unshift(payload);
  document.getElementById("toast").textContent = saved ? "Published to the API." : "Shown locally. Start the server to keep it.";
  event.currentTarget.reset();
  renderPosts();
});

renderPosts();
`);
  const server = serverSource(siteName, `const posts = [
  { title: "Shipping on a Tuesday", excerpt: "A short checklist I use before a release leaves the branch." },
  { title: "Tables that breathe", excerpt: "Spacing, type, and why most dashboards feel cramped." },
  { title: "APIs for humans", excerpt: "Name routes after the job the screen is doing." },
];`, `  if (req.method === "GET" && path === "/api/posts") return send(res, 200, { posts });
  if (req.method === "POST" && path === "/api/posts") {
    const body = await readBody(req);
    const post = { id: Date.now(), title: String(body.title || "Untitled"), excerpt: String(body.excerpt || "") };
    posts.unshift(post);
    return send(res, 201, { ok: true, post });
  }`);
  return filesFor({
    siteName, kind: "blog", html, script, server,
    readmeBody: readme(siteName, "blog", ["GET /api/posts", "POST /api/posts"]),
  });
}

function restaurant(siteName: string): GeneratedFile[] {
  const html = page({
    siteName,
    title: `${siteName} — Restaurant`,
    kicker: "Dinner service",
    lede: "Tonight's menu is loaded from the API. Reservations post to the server, and the preview still takes a booking if Node is not running.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=900&fit=crop&q=80",
    imageAlt: "Plated dinner in a restaurant",
    nav: `<a href="#menu">Menu</a><a href="#reserve">Reserve</a>`,
    main: `
    <section id="menu"><h2>Menu</h2><div class="grid" id="menuGrid"></div></section>
    <section id="reserve" class="grid two">
      <form id="reserveForm">
        <h2>Reserve a table</h2>
        <input name="name" placeholder="Name" required />
        <input name="party" type="number" min="1" max="12" value="2" />
        <input name="when" type="datetime-local" required />
        <button class="btn" type="submit">Request table</button>
        <p class="toast" id="toast"></p>
      </form>
      <article><h3>Booked tonight</h3><div id="bookingList" class="muted"></div></article>
    </section>`,
  });
  const script = clientScript(siteName, `const FALLBACK_MENU = [
  { name: "Citrus crudo", price: "$18", detail: "Market fish, chili oil, fennel." },
  { name: "Coal flatbread", price: "$14", detail: "Brown butter, honey, rosemary." },
  { name: "Dark chocolate budino", price: "$12", detail: "Olive oil, sea salt, crème fraîche." },
];
const localBookings = [];`, `async function render() {
  const data = await api("/api/menu");
  const menu = data?.menu || FALLBACK_MENU;
  const bookings = data?.reservations || localBookings;
  document.getElementById("menuGrid").innerHTML = menu.map((item) => \`<article class="item"><div class="row"><h3>\${item.name}</h3><strong>\${item.price}</strong></div><p class="muted">\${item.detail}</p></article>\`).join("");
  document.getElementById("bookingList").innerHTML = bookings.length
    ? bookings.map((row) => \`<p>\${row.name} · party of \${row.party}</p>\`).join("")
    : "<p>No reservations yet.</p>";
}

document.getElementById("reserveForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  const saved = await api("/api/reservations", { method: "POST", body: JSON.stringify(payload) });
  if (!saved) localBookings.unshift(payload);
  document.getElementById("toast").textContent = saved ? "Table requested." : "Held in the preview until the API is up.";
  event.currentTarget.reset();
  render();
});

render();
`);
  const server = serverSource(siteName, `const MENU = [
  { name: "Citrus crudo", price: "$18", detail: "Market fish, chili oil, fennel." },
  { name: "Coal flatbread", price: "$14", detail: "Brown butter, honey, rosemary." },
  { name: "Dark chocolate budino", price: "$12", detail: "Olive oil, sea salt, crème fraîche." },
];
const reservations = [];`, `  if (req.method === "GET" && path === "/api/menu") return send(res, 200, { menu: MENU, reservations });
  if (req.method === "POST" && path === "/api/reservations") {
    const body = await readBody(req);
    const reservation = { id: Date.now(), name: String(body.name || "Guest"), party: Number(body.party || 2), when: String(body.when || "") };
    reservations.unshift(reservation);
    return send(res, 201, { ok: true, reservation });
  }`);
  return filesFor({
    siteName, kind: "restaurant", html, script, server,
    readmeBody: readme(siteName, "restaurant", ["GET /api/menu", "POST /api/reservations"]),
  });
}

function store(siteName: string): GeneratedFile[] {
  const html = page({
    siteName,
    title: `${siteName} — Store`,
    kicker: "Shop",
    lede: "A catalog backed by a products API, with a cart that checks out to the Node server.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=900&fit=crop&q=80",
    imageAlt: "Retail interior",
    nav: `<a href="#catalog">Catalog</a><a href="#cart">Cart</a>`,
    main: `
    <section id="catalog"><h2>Catalog</h2><div class="grid" id="catalogGrid"></div></section>
    <section id="cart" class="grid two">
      <article><h2>Cart</h2><div id="cartList"></div><p class="price" id="cartTotal">$0</p></article>
      <form id="checkoutForm">
        <h2>Checkout</h2>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button class="btn" type="submit">Place order</button>
        <p class="toast" id="toast"></p>
      </form>
    </section>`,
  });
  const script = clientScript(siteName, `const FALLBACK_PRODUCTS = [
  { id: "tote", name: "Canvas tote", price: 42, detail: "Heavy cotton, natural dye." },
  { id: "mug", name: "Stone mug", price: 28, detail: "Matte glaze, 12 oz." },
  { id: "lamp", name: "Desk lamp", price: 120, detail: "Brass arm, warm bulb." },
];
const cart = [];`, `function money(cents) { return "$" + cents; }

async function render() {
  const data = await api("/api/products");
  const products = data?.products || FALLBACK_PRODUCTS;
  document.getElementById("catalogGrid").innerHTML = products.map((item) => \`
    <article class="card">
      <h3>\${item.name}</h3>
      <p class="muted">\${item.detail}</p>
      <div class="row"><strong>\${money(item.price)}</strong><button class="btn" type="button" data-id="\${item.id}">Add</button></div>
    </article>\`).join("");
  document.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((item) => item.id === button.dataset.id);
      if (product) cart.push(product);
      paintCart();
    });
  });
  paintCart();
}

function paintCart() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("cartList").innerHTML = cart.length
    ? cart.map((item) => \`<p class="row"><span>\${item.name}</span><span>\${money(item.price)}</span></p>\`).join("")
    : "<p class=\\"muted\\">Your cart is empty.</p>";
  document.getElementById("cartTotal").textContent = money(total);
}

document.getElementById("checkoutForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!cart.length) {
    document.getElementById("toast").textContent = "Add something first.";
    return;
  }
  const customer = Object.fromEntries(new FormData(event.currentTarget).entries());
  const saved = await api("/api/orders", { method: "POST", body: JSON.stringify({ customer, items: cart }) });
  document.getElementById("toast").textContent = saved ? "Order #" + saved.order.id + " created." : "Checked out in the preview. Start the API to record it.";
  cart.length = 0;
  event.currentTarget.reset();
  paintCart();
});

render();
`);
  const server = serverSource(siteName, `const PRODUCTS = [
  { id: "tote", name: "Canvas tote", price: 42, detail: "Heavy cotton, natural dye." },
  { id: "mug", name: "Stone mug", price: 28, detail: "Matte glaze, 12 oz." },
  { id: "lamp", name: "Desk lamp", price: 120, detail: "Brass arm, warm bulb." },
];
const orders = [];`, `  if (req.method === "GET" && path === "/api/products") return send(res, 200, { products: PRODUCTS });
  if (req.method === "POST" && path === "/api/orders") {
    const body = await readBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const order = { id: orders.length + 1001, customer: body.customer || {}, items, total, at: new Date().toISOString() };
    orders.unshift(order);
    return send(res, 201, { ok: true, order });
  }`);
  return filesFor({
    siteName, kind: "store", html, script, server,
    readmeBody: readme(siteName, "store", ["GET /api/products", "POST /api/orders"]),
  });
}

function dashboard(siteName: string): GeneratedFile[] {
  const html = page({
    siteName,
    title: `${siteName} — Dashboard`,
    kicker: "Operations",
    lede: "A compact dashboard. Stats and tasks load from the API, and you can add a task even when the preview is offline.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=900&fit=crop&q=80",
    imageAlt: "Analytics dashboard on a laptop",
    nav: `<a href="#stats">Stats</a><a href="#tasks">Tasks</a>`,
    main: `
    <section id="stats"><h2>This week</h2><div class="grid" id="statGrid"></div></section>
    <section id="tasks" class="grid two">
      <article><h2>Open tasks</h2><div id="taskList"></div></article>
      <form id="taskForm">
        <h2>Add a task</h2>
        <input name="title" placeholder="What needs doing?" required />
        <button class="btn" type="submit">Add task</button>
        <p class="toast" id="toast"></p>
      </form>
    </section>`,
  });
  const script = clientScript(siteName, `const FALLBACK_STATS = [
  { label: "Active users", value: "1,284" },
  { label: "Open tasks", value: "18" },
  { label: "Deploys", value: "6" },
];
const localTasks = [
  { title: "Review the signup copy", done: false },
  { title: "Check failed payments", done: false },
];`, `async function render() {
  const data = await api("/api/dashboard");
  const stats = data?.stats || FALLBACK_STATS;
  const tasks = data?.tasks || localTasks;
  document.getElementById("statGrid").innerHTML = stats.map((stat) => \`<article class="stat"><p class="muted">\${stat.label}</p><p class="price">\${stat.value}</p></article>\`).join("");
  document.getElementById("taskList").innerHTML = tasks.map((task) => \`<p class="row"><span>\${task.title}</span><span class="tag">\${task.done ? "Done" : "Open"}</span></p>\`).join("");
}

document.getElementById("taskForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  const saved = await api("/api/tasks", { method: "POST", body: JSON.stringify(payload) });
  if (!saved) localTasks.unshift({ title: payload.title, done: false });
  document.getElementById("toast").textContent = saved ? "Task stored in the API." : "Task kept in the preview.";
  event.currentTarget.reset();
  render();
});

render();
`);
  const server = serverSource(siteName, `const STATS = [
  { label: "Active users", value: "1,284" },
  { label: "Open tasks", value: "18" },
  { label: "Deploys", value: "6" },
];
const tasks = [
  { title: "Review the signup copy", done: false },
  { title: "Check failed payments", done: false },
];`, `  if (req.method === "GET" && path === "/api/dashboard") return send(res, 200, { stats: STATS, tasks });
  if (req.method === "POST" && path === "/api/tasks") {
    const body = await readBody(req);
    const task = { id: Date.now(), title: String(body.title || "Untitled"), done: false };
    tasks.unshift(task);
    return send(res, 201, { ok: true, task });
  }`);
  return filesFor({
    siteName, kind: "dashboard", html, script, server,
    readmeBody: readme(siteName, "dashboard", ["GET /api/dashboard", "POST /api/tasks"]),
  });
}

const BUILDERS: Record<string, (siteName: string) => GeneratedFile[]> = {
  portfolio,
  saas,
  blog,
  restaurant,
  store,
  dashboard,
};

export function buildWebsiteTree(files: GeneratedFile[]): WebsiteTreeNode[] {
  const root: WebsiteTreeNode[] = [];
  const folders = new Map<string, WebsiteTreeNode>();

  const ensureFolder = (path: string): WebsiteTreeNode[] => {
    if (!path) return root;
    const existing = folders.get(path);
    if (existing?.children) return existing.children;
    const parentPath = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    const parentChildren = ensureFolder(parentPath);
    const node: WebsiteTreeNode = {
      id: path,
      name: path.split("/").pop() || path,
      type: "folder",
      isOpen: true,
      children: [],
    };
    parentChildren.push(node);
    folders.set(path, node);
    return node.children || [];
  };

  for (const file of files) {
    const parentPath = file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : "";
    const siblings = ensureFolder(parentPath);
    siblings.push({
      id: file.path,
      name: file.path.split("/").pop() || file.path,
      type: "file",
      language: file.language,
      content: file.content,
    });
  }
  return root;
}

export function buildWebsiteProject(kind: string, siteName: string): WebsiteProject {
  const id = BLUEPRINT_IDS.has(kind) ? kind : "portfolio";
  const safeName = siteName.trim() || "Lunor Studio";
  const meta = WEBSITE_BLUEPRINTS.find((item) => item.id === id)!;
  const files = BUILDERS[id](safeName);
  const endpoints = (files.find((file) => file.path === "README.md")?.content.match(/`(GET|POST|PATCH|DELETE) [^`]+`/g) || [])
    .map((token) => token.replace(/`/g, ""));
  const summary = [
    `**${safeName}** is in the editor as a full-stack **${meta.label.toLowerCase()}**.`,
    "",
    "Files written:",
    ...files.map((file) => `- \`${file.path}\``),
    "",
    "The page previews on its own. Embedded sample data fills in when the API is offline.",
    "",
    "Run the API locally with `node server/server.js`, then open http://localhost:3000.",
    "",
    "Routes:",
    ...endpoints.map((route) => `- \`${route}\``),
  ].join("\n");

  return { id, label: meta.label, siteName: safeName, files, tree: buildWebsiteTree(files), summary };
}
