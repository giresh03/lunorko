/**
 * Local full-stack website generator for the Web Development assistant.
 * Scaffolds a static client plus a Node API. No second generator should be added.
 */

export const SITE_KINDS = [
  { id: "landing", label: "Landing", blurb: "Product page and leads" },
  { id: "portfolio", label: "Portfolio", blurb: "Projects and contact" },
  { id: "blog", label: "Blog", blurb: "Posts and notes" },
  { id: "restaurant", label: "Restaurant", blurb: "Menu and reservations" },
  { id: "store", label: "Store", blurb: "Products and inquiries" },
  { id: "dashboard", label: "Dashboard", blurb: "Metrics and activity" },
] as const;

export type SiteKind = (typeof SITE_KINDS)[number]["id"];

export const GENERATED_PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/site.js",
  "server/server.mjs",
  "server/store.mjs",
  "package.json",
  "README.md",
] as const;

export const FULL_STACK_GENERATOR_NOTE = `FULL-STACK WEBSITE GENERATOR:
The Web Development assistant can scaffold a full-stack website locally when the user asks to generate, create, build, make, or scaffold a full-stack site. Kinds: landing, portfolio, blog, restaurant, store, dashboard.
Files: client/index.html, client/styles.css, client/site.js, server/server.mjs, server/store.mjs, package.json, README.md.
API: GET /api/health, GET /api/site, GET /api/records, POST /api/records.
Run with npm start (node server/server.mjs). Ordinary single-page requests still use one vanilla HTML file. A request such as "build a todo website" is not a full-stack scaffold.`;

const GENERATE_VERB = /\b(generate|create|build|make|scaffold)\b/i;
const FULL_STACK = /\bfull[\s-]?stack\b/i;

export function isFullStackWebsiteRequest(text: string): boolean {
  return GENERATE_VERB.test(text) && FULL_STACK.test(text);
}

export function detectSiteKind(text: string): SiteKind {
  const value = text.toLowerCase();
  if (/\bportfolio\b/.test(value)) return "portfolio";
  if (/\bblog\b/.test(value)) return "blog";
  if (/\b(restaurant|cafe|bistro|menu)\b/.test(value)) return "restaurant";
  if (/\b(store|shop|ecommerce|e-commerce)\b/.test(value)) return "store";
  if (/\bdashboard\b/.test(value)) return "dashboard";
  return "landing";
}

export interface SiteRecord {
  id: string;
  title: string;
  summary: string;
  meta: string;
}

export interface SiteInfo {
  name: string;
  kind: SiteKind;
  tagline: string;
  description: string;
  accent: string;
}

export interface GeneratedSite {
  kind: SiteKind;
  projectName: string;
  site: SiteInfo;
  records: SiteRecord[];
  files: Record<string, string>;
}

export interface SiteFileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: SiteFileNode[];
  isOpen?: boolean;
}

interface Blueprint {
  kind: SiteKind;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  heroImage: string;
  kicker: string;
  heroTitle: string;
  heroBody: string;
  cta: string;
  sectionTitle: string;
  formTitle: string;
  formHint: string;
  fields: { name: "title" | "summary" | "meta"; label: string; placeholder: string }[];
  highlights: { title: string; body: string }[];
  records: SiteRecord[];
}

const BLUEPRINTS: Record<SiteKind, Blueprint> = {
  landing: {
    kind: "landing",
    name: "Lumen",
    tagline: "Ship a clearer product story",
    description: "A landing page with a lead inbox backed by a small Node API.",
    accent: "#3ee0b0",
    heroImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    kicker: "Product",
    heroTitle: "A landing page that collects real leads",
    heroBody: "Tell the product story, then save every signup through POST /api/records.",
    cta: "Request a walkthrough",
    sectionTitle: "Latest leads",
    formTitle: "Start a conversation",
    formHint: "Saved to the API when the server is running.",
    fields: [
      { name: "title", label: "Name", placeholder: "Ada Lovelace" },
      { name: "meta", label: "Email", placeholder: "ada@example.com" },
      { name: "summary", label: "What do you need?", placeholder: "A launch page for our beta" },
    ],
    highlights: [
      { title: "One client", body: "HTML, CSS, and JavaScript the editor can preview immediately." },
      { title: "One API", body: "Health, site profile, and a record inbox on plain Node." },
      { title: "One command", body: "npm start serves the page and the JSON routes together." },
    ],
    records: [
      { id: "lead-1", title: "Northwind Studio", summary: "Wants a launch page before Friday.", meta: "hello@northwind.studio" },
      { id: "lead-2", title: "Jun Park", summary: "Asked for a demo of the analytics view.", meta: "jun@parkmail.com" },
      { id: "lead-3", title: "Harbor Co-op", summary: "Needs pricing copy for three plans.", meta: "team@harbor.coop" },
    ],
  },
  portfolio: {
    kind: "portfolio",
    name: "Northline",
    tagline: "Selected work, 2019 — 2026",
    description: "A portfolio with project records stored by the local API.",
    accent: "#7aa2ff",
    heroImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1600&q=80",
    kicker: "Portfolio",
    heroTitle: "Design and engineering, shown as shipped work",
    heroBody: "Each project is a record. Add a new one from the form and it lands in the API.",
    cta: "Share a project",
    sectionTitle: "Selected projects",
    formTitle: "Add a project",
    formHint: "Title, role, and a short note.",
    fields: [
      { name: "title", label: "Project", placeholder: "Atlas reading room" },
      { name: "meta", label: "Role", placeholder: "Product design" },
      { name: "summary", label: "Note", placeholder: "A quiet interface for a public archive" },
    ],
    highlights: [
      { title: "Case studies", body: "Projects render from GET /api/records, with sample work included." },
      { title: "Contact path", body: "The form posts a new project record without a database install." },
      { title: "Preview first", body: "The editor shows the same sample data when the API is offline." },
    ],
    records: [
      { id: "work-1", title: "Atlas Reading Room", summary: "A public archive with calmer search and large type.", meta: "Product design" },
      { id: "work-2", title: "Field Kit", summary: "Offline-first notes for a research team in the field.", meta: "Frontend" },
      { id: "work-3", title: "Keel", summary: "Billing dashboard that reduced support tickets by a third.", meta: "Full stack" },
    ],
  },
  blog: {
    kind: "blog",
    name: "Field Notes",
    tagline: "Essays on making software",
    description: "A blog whose posts are records on the local API.",
    accent: "#f0b429",
    heroImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80",
    kicker: "Journal",
    heroTitle: "Short notes, stored as posts",
    heroBody: "Read the sample essays, then publish another through the record API.",
    cta: "Write a note",
    sectionTitle: "Recent posts",
    formTitle: "New note",
    formHint: "Posts are records with a title, topic, and summary.",
    fields: [
      { name: "title", label: "Title", placeholder: "Shipping smaller" },
      { name: "meta", label: "Topic", placeholder: "Craft" },
      { name: "summary", label: "Summary", placeholder: "What changed when the release got smaller" },
    ],
    highlights: [
      { title: "Posts as data", body: "The list is GET /api/records, so the page and the API stay in sync." },
      { title: "No CMS", body: "The store module keeps posts in memory for local demos." },
      { title: "Readable type", body: "A serif headline and a narrow measure for the essays." },
    ],
    records: [
      { id: "post-1", title: "The smallest useful release", summary: "Cut the launch to the path a new visitor actually walks.", meta: "Craft" },
      { id: "post-2", title: "Naming the API", summary: "Health, site, and records were enough for this studio site.", meta: "Backend" },
      { id: "post-3", title: "Preview without a server", summary: "Sample data keeps the editor honest when Node is not running.", meta: "Workflow" },
    ],
  },
  restaurant: {
    kind: "restaurant",
    name: "Harbor & Rye",
    tagline: "Supper from five, Tuesday to Sunday",
    description: "A restaurant site with a menu list and reservation requests.",
    accent: "#e07a5f",
    heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    kicker: "Dining room",
    heroTitle: "A short menu and a table if we have one",
    heroBody: "Browse tonight's plates, then send a reservation request to the API.",
    cta: "Request a table",
    sectionTitle: "Tonight's menu",
    formTitle: "Reservation request",
    formHint: "Name, party, and a note. The kitchen confirms later.",
    fields: [
      { name: "title", label: "Name", placeholder: "Priya Shah" },
      { name: "meta", label: "Party", placeholder: "2 · 7:30pm" },
      { name: "summary", label: "Note", placeholder: "Window seat if you have one" },
    ],
    highlights: [
      { title: "Menu records", body: "Each plate is a record the client renders into the menu grid." },
      { title: "Requests", body: "Reservations post to the same inbox the menu uses." },
      { title: "Evening palette", body: "Warm paper, charcoal type, and a copper accent." },
    ],
    records: [
      { id: "dish-1", title: "Rye sourdough", summary: "Cultured butter and smoked salt.", meta: "To start" },
      { id: "dish-2", title: "Charred leeks", summary: "Hazelnut, brown butter, and lemon.", meta: "Garden" },
      { id: "dish-3", title: "Dayboat fish", summary: "Fennel, mussel broth, and herbs.", meta: "Main" },
    ],
  },
  store: {
    kind: "store",
    name: "Atelier",
    tagline: "Objects for a quieter desk",
    description: "A small storefront with products and inquiries on the local API.",
    accent: "#c4a574",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    kicker: "Shop",
    heroTitle: "A few objects, made in small runs",
    heroBody: "Products load from the API. An inquiry is just another record.",
    cta: "Ask about a piece",
    sectionTitle: "In the shop",
    formTitle: "Product inquiry",
    formHint: "Tell us which piece and how to reply.",
    fields: [
      { name: "title", label: "Piece", placeholder: "Brass desk lamp" },
      { name: "meta", label: "Contact", placeholder: "you@example.com" },
      { name: "summary", label: "Note", placeholder: "Do you have it in black?" },
    ],
    highlights: [
      { title: "Catalog", body: "GET /api/records returns the pieces currently in stock." },
      { title: "Inquiries", body: "The form posts a question without a checkout integration." },
      { title: "Static client", body: "The shop page is plain HTML the preview can open." },
    ],
    records: [
      { id: "sku-1", title: "Brass desk lamp", summary: "Spun shade, linen cord, 12 inch.", meta: "$180" },
      { id: "sku-2", title: "Oak tray", summary: "White oak with a low lip for papers.", meta: "$64" },
      { id: "sku-3", title: "Ink set", summary: "Three colors mixed for everyday notes.", meta: "$28" },
    ],
  },
  dashboard: {
    kind: "dashboard",
    name: "Pulse",
    tagline: "Today, at a glance",
    description: "An operations dashboard whose activity feed is the record API.",
    accent: "#5b8def",
    heroImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80",
    kicker: "Operations",
    heroTitle: "The numbers, then the activity behind them",
    heroBody: "Metrics stay on the page. The feed reads and writes /api/records.",
    cta: "Log an update",
    sectionTitle: "Activity",
    formTitle: "Log an update",
    formHint: "A title, owner, and one sentence.",
    fields: [
      { name: "title", label: "Update", placeholder: "Checkout latency" },
      { name: "meta", label: "Owner", placeholder: "Platform" },
      { name: "summary", label: "Detail", placeholder: "p95 dropped under 400ms after the cache change" },
    ],
    highlights: [
      { title: "Health", body: "GET /api/health confirms the API process is up." },
      { title: "Site profile", body: "GET /api/site returns the dashboard name and tagline." },
      { title: "Feed", body: "Activity items are records you can append from the form." },
    ],
    records: [
      { id: "act-1", title: "Checkout latency", summary: "p95 is 380ms after the cache change.", meta: "Platform" },
      { id: "act-2", title: "Signup copy", summary: "New headline is live on the marketing page.", meta: "Growth" },
      { id: "act-3", title: "Invoice retry", summary: "Failed charges from Tuesday were replayed.", meta: "Billing" },
    ],
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "full-stack-site";
}

function inferProjectName(prompt: string, kind: SiteKind): string {
  const named = prompt.match(/\b(?:called|named|titled)\s+["']?([A-Za-z0-9][\w .&'-]{1,48})/i);
  if (named?.[1]) {
    return named[1].replace(/\s+(website|site|webapp|app)$/i, "").trim();
  }
  return BLUEPRINTS[kind].name;
}

function languageFor(path: string): string {
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  return "javascript";
}

function renderStyles(accent: string): string {
  return `:root {
  --accent: ${accent};
  --bg: #0c1222;
  --bg-2: #121a2e;
  --card: rgba(18, 26, 46, 0.86);
  --line: rgba(232, 237, 247, 0.12);
  --text: #e8edf7;
  --muted: #9aa6bf;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  font-family: "Segoe UI", "Avenir Next", sans-serif;
  color: var(--text);
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    linear-gradient(180deg, var(--bg), #070b16 70%);
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
.wrap { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 8px;
}
.brand { font-weight: 700; letter-spacing: -0.03em; }
.nav a { color: var(--muted); font-size: 14px; margin-left: 18px; }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: center;
  padding: 28px 0 12px;
}
.kicker {
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin: 0 0 10px;
}
h1 { font-size: clamp(40px, 6vw, 68px); line-height: 0.95; letter-spacing: -0.045em; margin: 0 0 16px; }
.lede { color: var(--muted); font-size: 18px; line-height: 1.5; max-width: 38ch; }
.cta {
  display: inline-block;
  margin-top: 22px;
  background: var(--accent);
  color: #081018;
  font-weight: 700;
  border-radius: 999px;
  padding: 12px 18px;
}
.hero-card {
  min-height: 320px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(8, 12, 24, 0.1), rgba(8, 12, 24, 0.72)),
    var(--hero) center/cover no-repeat;
  box-shadow: var(--shadow);
  border: 1px solid var(--line);
}
.highlights, .records, .composer { padding: 28px 0; }
.highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.card, .record, form {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
}
.card h2, .record h3 { margin: 0 0 8px; font-size: 18px; }
.card p, .record p, .hint, .meta { color: var(--muted); line-height: 1.45; }
.section-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.section-head h2 { margin: 0; font-size: 28px; letter-spacing: -0.03em; }
#api-status { font-size: 12px; color: var(--accent); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 16px; }
.meta { font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px; }
form { display: grid; gap: 12px; margin-top: 14px; }
label { display: grid; gap: 6px; font-size: 13px; color: var(--muted); }
input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: rgba(7, 11, 22, 0.65);
  color: var(--text);
  border-radius: 12px;
  padding: 12px 12px;
  font: inherit;
}
textarea { min-height: 90px; resize: vertical; }
button[type="submit"] {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: #081018;
  font-weight: 700;
  padding: 12px 16px;
  cursor: pointer;
}
footer { color: var(--muted); font-size: 13px; padding: 10px 0 36px; }
@media (max-width: 800px) {
  .hero, .highlights, .grid { grid-template-columns: 1fr; }
  .nav a { display: none; }
}
`;
}

function renderHtml(blueprint: Blueprint, projectName: string): string {
  const highlights = blueprint.highlights
    .map((item) => `<article class="card"><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.body)}</p></article>`)
    .join("\n");
  const fields = blueprint.fields
    .map((field) => {
      const control = field.name === "summary"
        ? `<textarea name="summary" placeholder="${escapeHtml(field.placeholder)}" required></textarea>`
        : `<input name="${field.name}" placeholder="${escapeHtml(field.placeholder)}" required />`;
      return `<label>${escapeHtml(field.label)}${control}</label>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(projectName)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="dark">
  <header class="wrap">
    <nav class="nav">
      <div class="brand">${escapeHtml(projectName)}</div>
      <div>
        <a href="#work">${escapeHtml(blueprint.sectionTitle)}</a>
        <a href="#compose">${escapeHtml(blueprint.formTitle)}</a>
      </div>
    </nav>
    <section class="hero">
      <div>
        <p class="kicker">${escapeHtml(blueprint.kicker)}</p>
        <h1>${escapeHtml(blueprint.heroTitle)}</h1>
        <p class="lede">${escapeHtml(blueprint.heroBody)}</p>
        <a class="cta" href="#compose">${escapeHtml(blueprint.cta)}</a>
      </div>
      <div class="hero-card" role="img" aria-label="${escapeHtml(blueprint.tagline)}"></div>
    </section>
  </header>
  <main class="wrap">
    <section class="highlights">${highlights}</section>
    <section class="records" id="work">
      <div class="section-head">
        <h2>${escapeHtml(blueprint.sectionTitle)}</h2>
        <span id="api-status">Loading records…</span>
      </div>
      <div class="grid" id="records"></div>
    </section>
    <section class="composer" id="compose">
      <h2>${escapeHtml(blueprint.formTitle)}</h2>
      <p class="hint">${escapeHtml(blueprint.formHint)}</p>
      <form id="record-form">
        ${fields}
        <button type="submit">${escapeHtml(blueprint.cta)}</button>
      </form>
      <p class="hint" id="form-status"></p>
    </section>
  </main>
  <footer class="wrap">${escapeHtml(projectName)} · full-stack ${escapeHtml(blueprint.kind)} site</footer>
  <script src="site.js"></script>
</body>
</html>
`;
}

function renderClientScript(blueprint: Blueprint, projectName: string, site: SiteInfo, records: SiteRecord[]): string {
  return `const SEED = ${JSON.stringify({ site, records }, null, 2)};

const recordsEl = document.querySelector("#records");
const statusEl = document.querySelector("#api-status");
const formStatus = document.querySelector("#form-status");
const form = document.querySelector("#record-form");
document.documentElement.style.setProperty("--hero", ${JSON.stringify(`url("${blueprint.heroImage}")`)});

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderRecords(items) {
  if (!recordsEl) return;
  recordsEl.innerHTML = items.map((item) => \`
    <article class="record">
      <p class="meta">\${escapeHtml(item.meta)}</p>
      <h3>\${escapeHtml(item.title)}</h3>
      <p>\${escapeHtml(item.summary)}</p>
    </article>\`).join("");
}

async function load() {
  try {
    const [siteRes, recordRes] = await Promise.all([
      fetch("/api/site"),
      fetch("/api/records"),
    ]);
    if (!siteRes.ok || !recordRes.ok) throw new Error("API unavailable");
    const siteJson = await siteRes.json();
    const recordJson = await recordRes.json();
    if (statusEl) statusEl.textContent = "Live API · " + (siteJson.name || ${JSON.stringify(projectName)});
    return Array.isArray(recordJson.records) ? recordJson.records : SEED.records;
  } catch {
    if (statusEl) statusEl.textContent = "Preview data";
    return SEED.records;
  }
}

load().then(renderRecords);

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("POST failed");
    const body = await response.json();
    const next = await load();
    renderRecords(next);
    form.reset();
    if (formStatus) formStatus.textContent = "Saved " + (body.record?.title || "record") + ".";
  } catch {
    const local = {
      id: "local-" + Date.now().toString(36),
      title: String(payload.title || "Untitled"),
      summary: String(payload.summary || ""),
      meta: String(payload.meta || "Preview"),
    };
    renderRecords([local, ...SEED.records]);
    if (formStatus) formStatus.textContent = "Saved in the preview. Start the server to keep it.";
    form.reset();
  }
});
`;
}

const SERVER_SOURCE = `import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site, listRecords, addRecord } from "./store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, "..", "client");
const requested = process.env.PORT === undefined || process.env.PORT === "" ? 3000 : Number(process.env.PORT);

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(body));
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: site.name });
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/site") {
    sendJson(res, 200, site);
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/records") {
    sendJson(res, 200, { records: listRecords() });
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/records") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let body = {};
    try {
      const parsed = JSON.parse(Buffer.concat(chunks).toString() || "{}");
      body = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      body = {};
    }
    sendJson(res, 201, { record: addRecord(body) });
    return;
  }

  const relative = decodeURIComponent(url.pathname).replace(/^\\/+/, "");
  const filePath = path.resolve(clientDir, relative || "index.html");
  if (filePath !== clientDir && !filePath.startsWith(clientDir + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(requested, "127.0.0.1", () => {
  const address = server.address();
  const bound = typeof address === "object" && address ? address.port : requested;
  console.log("listening " + bound);
});
`;

function renderStore(site: SiteInfo, records: SiteRecord[]): string {
  return `export const site = ${JSON.stringify(site, null, 2)};

const records = ${JSON.stringify(records, null, 2)};

export function listRecords() {
  return records.map((record) => ({ ...record }));
}

export function addRecord(input) {
  const source = input && typeof input === "object" ? input : {};
  const record = {
    id: "rec-" + Date.now().toString(36),
    title: String(source.title || source.name || "Untitled").slice(0, 120),
    summary: String(source.summary || source.message || "").slice(0, 500),
    meta: String(source.meta || "").slice(0, 80),
  };
  records.unshift(record);
  return record;
}
`;
}

function renderReadme(projectName: string, kind: SiteKind): string {
  return `# ${projectName}

Full-stack ${kind} website generated by the Lunor Web Development assistant.

## Run

\`\`\`bash
npm start
\`\`\`

The server listens on port 3000 unless \`PORT\` is set.

## Files

- \`client/index.html\`, \`client/styles.css\`, \`client/site.js\` — the website
- \`server/server.mjs\` — static files plus the JSON API
- \`server/store.mjs\` — site profile and in-memory records

## API

- \`GET /api/health\`
- \`GET /api/site\`
- \`GET /api/records\`
- \`POST /api/records\` with \`{ "title", "summary", "meta" }\`
`;
}

export function generateFullStackSite(input: {
  prompt?: string;
  projectName?: string;
  kind?: SiteKind;
} = {}): GeneratedSite {
  const prompt = input.prompt?.trim() || "";
  const kind = input.kind ?? detectSiteKind(prompt);
  const blueprint = BLUEPRINTS[kind];
  const projectName = input.projectName?.trim() || inferProjectName(prompt, kind);
  const site: SiteInfo = {
    name: projectName,
    kind,
    tagline: blueprint.tagline,
    description: blueprint.description,
    accent: blueprint.accent,
  };
  const records = blueprint.records.map((record) => ({ ...record }));
  const packageJson = `${JSON.stringify({
    name: slugify(projectName),
    version: "1.0.0",
    private: true,
    type: "module",
    description: `${projectName} full-stack ${kind} website`,
    scripts: { start: "node server/server.mjs" },
  }, null, 2)}\n`;

  const files: Record<string, string> = {
    "client/index.html": renderHtml(blueprint, projectName),
    "client/styles.css": renderStyles(blueprint.accent),
    "client/site.js": renderClientScript(blueprint, projectName, site, records),
    "server/server.mjs": SERVER_SOURCE,
    "server/store.mjs": renderStore(site, records),
    "package.json": packageJson,
    "README.md": renderReadme(projectName, kind),
  };

  return { kind, projectName, site, records, files };
}

export function describeGeneratedSite(site: GeneratedSite): string {
  return [
    `Generated a full-stack **${site.kind}** website, **${site.projectName}**. The preview is open.`,
    "",
    "Files:",
    ...GENERATED_PATHS.map((filePath) => `- \`${filePath}\``),
    "",
    "API:",
    "- `GET /api/health`",
    "- `GET /api/site`",
    "- `GET /api/records`",
    "- `POST /api/records`",
    "",
    "Run it locally with `npm start`. The page uses the API when the server is up, and shows the same sample data in the editor preview.",
  ].join("\n");
}

export function siteToFileTree(site: GeneratedSite): SiteFileNode[] {
  const root: SiteFileNode[] = [];
  for (const filePath of GENERATED_PATHS) {
    const content = site.files[filePath];
    const parts = filePath.split("/");
    let level = root;
    let currentPath = "";
    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = level.find((item) => item.name === part);
      if (!node) {
        node = isFile
          ? { id: currentPath, name: part, type: "file", language: languageFor(part), content }
          : { id: currentPath, name: part, type: "folder", isOpen: true, children: [] };
        level.push(node);
      }
      if (!isFile) level = node.children || (node.children = []);
    });
  }
  return root;
}

export function previewFileMap(files: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [filePath, content] of Object.entries(files)) {
    map[filePath] = content;
    const base = filePath.split("/").pop() || filePath;
    if (!map[base]) map[base] = content;
  }
  return map;
}
