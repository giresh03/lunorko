/**
 * Local full-stack website generator for the Web Development AI assistant.
 * Writes a vanilla client plus a Node API. The assistant applies this project
 * directly so a generate request does not wait on a model.
 */

export type SiteKind = "landing" | "portfolio" | "blog" | "restaurant" | "store" | "dashboard";

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedSite {
  kind: SiteKind;
  title: string;
  files: GeneratedFile[];
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

export interface SiteBlueprint {
  id: SiteKind;
  label: string;
  description: string;
  defaultTitle: string;
  eyebrow: string;
  tagline: string;
  accent: string;
  recordsHeading: string;
  formHeading: string;
  submitLabel: string;
  highlights: { title: string; body: string }[];
  records: { id: string; title: string; body: string; createdAt: string }[];
}

export const GENERATED_PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/site.js",
  "server/server.mjs",
  "server/store.mjs",
  "package.json",
  "README.md",
] as const;

const BLUEPRINTS: SiteBlueprint[] = [
  {
    id: "landing",
    label: "Landing",
    description: "Product page and waitlist",
    defaultTitle: "Northstar",
    eyebrow: "Full-stack landing",
    tagline: "A product page with a waitlist saved by the Node API.",
    accent: "#00d4aa",
    recordsHeading: "Waitlist",
    formHeading: "Join the waitlist",
    submitLabel: "Request access",
    highlights: [
      { title: "One codebase", body: "Static client files and a small Node server you can run with npm start." },
      { title: "Live records", body: "The page reads GET /api/records and posts new signups to the same route." },
      { title: "Preview first", body: "The editor opens the page immediately. The API takes over once the server is running." },
    ],
    records: [
      { id: "lead-1", title: "Ava Chen", body: "Wants the design-system beta for a three-person studio.", createdAt: "2026-09-01T15:00:00.000Z" },
      { id: "lead-2", title: "Northwind Labs", body: "Asked for a team workspace and SSO notes.", createdAt: "2026-09-04T15:00:00.000Z" },
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Selected work and contact",
    defaultTitle: "Studio North",
    eyebrow: "Full-stack portfolio",
    tagline: "Selected work, with projects stored behind a JSON API.",
    accent: "#8b7cff",
    recordsHeading: "Selected work",
    formHeading: "Add a project",
    submitLabel: "Publish project",
    highlights: [
      { title: "Case studies", body: "Each project is a record with a title and a short write-up." },
      { title: "Editable", body: "Add a piece from the form. POST /api/records stores it in memory." },
      { title: "Client files", body: "HTML, CSS, and site.js stay in client/ so the preview can inject them." },
    ],
    records: [
      { id: "work-1", title: "Harbor Atlas", body: "A mapping site for small harbors, with a quiet dark interface.", createdAt: "2026-08-12T15:00:00.000Z" },
      { id: "work-2", title: "Lumen Notes", body: "A writing app focused on long-form drafts and export.", createdAt: "2026-08-20T15:00:00.000Z" },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    description: "Posts from the API",
    defaultTitle: "Field Notes",
    eyebrow: "Full-stack blog",
    tagline: "Notes published through the records API.",
    accent: "#f5b942",
    recordsHeading: "Latest notes",
    formHeading: "Write a note",
    submitLabel: "Publish note",
    highlights: [
      { title: "Posts as data", body: "The feed is GET /api/records. The page renders whatever the server returns." },
      { title: "No build step", body: "Vanilla JavaScript talks to the API and falls back to the embedded seed." },
      { title: "Readable type", body: "A single column for the notes, with cards for the highlights." },
    ],
    records: [
      { id: "post-1", title: "Shipping the first API", body: "Four routes are enough to start: health, site, and records read/write.", createdAt: "2026-09-02T15:00:00.000Z" },
      { id: "post-2", title: "Preview without a server", body: "The client keeps a seed list so the editor preview still shows posts.", createdAt: "2026-09-06T15:00:00.000Z" },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Menu backed by records",
    defaultTitle: "Hearth & Rye",
    eyebrow: "Full-stack restaurant",
    tagline: "A menu you can extend from the kitchen form.",
    accent: "#f97316",
    recordsHeading: "Tonight's menu",
    formHeading: "Add a dish",
    submitLabel: "Add to menu",
    highlights: [
      { title: "Seasonal plates", body: "Dishes live as records so the menu can change without editing HTML." },
      { title: "Service hours", body: "Dinner from 5–10. The page is the public menu; the API is the pad." },
      { title: "Walk-in friendly", body: "The form is the same POST the server accepts from any client." },
    ],
    records: [
      { id: "dish-1", title: "Rye cavatelli", body: "Brown butter, sage, and toasted seeds.", createdAt: "2026-09-03T15:00:00.000Z" },
      { id: "dish-2", title: "Citrus crudo", body: "Market fish, fennel, and a cold herb oil.", createdAt: "2026-09-03T16:00:00.000Z" },
    ],
  },
  {
    id: "store",
    label: "Store",
    description: "Products and a catalog API",
    defaultTitle: "Market Lane",
    eyebrow: "Full-stack store",
    tagline: "A small catalog with products saved as records.",
    accent: "#38bdf8",
    recordsHeading: "Catalog",
    formHeading: "Add a product",
    submitLabel: "Add product",
    highlights: [
      { title: "Catalog API", body: "Products come from GET /api/records and new ones from POST." },
      { title: "Plain checkout note", body: "This starter lists products. Payment stays out of the sample on purpose." },
      { title: "Shared layout", body: "The same client shell is themed for a shop instead of a landing page." },
    ],
    records: [
      { id: "sku-1", title: "Linen tote", body: "Natural canvas, one pocket, made in a short run.", createdAt: "2026-08-28T15:00:00.000Z" },
      { id: "sku-2", title: "Ceramic pourer", body: "Speckled glaze, about 500ml.", createdAt: "2026-08-30T15:00:00.000Z" },
    ],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Ops summary and activity",
    defaultTitle: "Harbor Ops",
    eyebrow: "Full-stack dashboard",
    tagline: "A status board whose activity feed is the records API.",
    accent: "#34d399",
    recordsHeading: "Activity",
    formHeading: "Log an event",
    submitLabel: "Log event",
    highlights: [
      { title: "Health", body: "GET /api/health answers before you trust the rest of the board." },
      { title: "Site meta", body: "GET /api/site returns the kind, title, and tagline shown in the header." },
      { title: "Activity log", body: "Events are records. The form appends one and the list refreshes." },
    ],
    records: [
      { id: "evt-1", title: "API healthy", body: "Health check returned ok from the local Node process.", createdAt: "2026-09-08T15:00:00.000Z" },
      { id: "evt-2", title: "Preview opened", body: "The editor rendered client/index.html with injected CSS and JS.", createdAt: "2026-09-08T15:05:00.000Z" },
    ],
  },
];

export const SITE_BLUEPRINTS: Pick<SiteBlueprint, "id" | "label" | "description">[] = BLUEPRINTS.map(
  ({ id, label, description }) => ({ id, label, description }),
);

const GENERATE_VERB = /\b(generate|build|create|make|scaffold)\b/i;
const FULL_STACK = /\bfull[\s-]?stack\b/i;

export function detectFullStackRequest(text: string): SiteKind | null {
  if (!GENERATE_VERB.test(text) || !FULL_STACK.test(text)) return null;
  if (/\bportfolio\b/i.test(text)) return "portfolio";
  if (/\bblog\b/i.test(text)) return "blog";
  if (/\b(restaurant|cafe|café|menu)\b/i.test(text)) return "restaurant";
  if (/\b(store|shop|e-?commerce)\b/i.test(text)) return "store";
  if (/\bdashboard\b/i.test(text)) return "dashboard";
  return "landing";
}

export function titleFromPrompt(text: string, kind: SiteKind): string {
  const quoted = text.match(/["“]([^"”]{2,80})["”]/);
  if (quoted?.[1]) return quoted[1].trim();
  return blueprintFor(kind).defaultTitle;
}

export function generateFullStackSite(kind: SiteKind, title?: string): GeneratedSite {
  const blueprint = blueprintFor(kind);
  const siteTitle = (title || blueprint.defaultTitle).trim() || blueprint.defaultTitle;
  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(blueprint, siteTitle) },
    { path: "client/styles.css", language: "css", content: renderCss(blueprint.accent) },
    { path: "client/site.js", language: "javascript", content: SITE_JS },
    { path: "server/server.mjs", language: "javascript", content: SERVER_SOURCE },
    { path: "server/store.mjs", language: "javascript", content: renderStore(blueprint, siteTitle) },
    { path: "package.json", language: "json", content: renderPackageJson(siteTitle) },
    { path: "README.md", language: "markdown", content: renderReadme(blueprint, siteTitle) },
  ];
  return { kind, title: siteTitle, files };
}

export function toProjectTree(files: GeneratedFile[]): ProjectNode[] {
  const root: ProjectNode[] = [];
  const folders = new Map<string, ProjectNode>();

  for (const file of files) {
    const parts = file.path.split("/");
    if (parts.length === 1) {
      root.push({
        id: file.path,
        name: file.path,
        type: "file",
        language: file.language,
        content: file.content,
      });
      continue;
    }
    const folderId = parts[0];
    let folder = folders.get(folderId);
    if (!folder) {
      folder = { id: folderId, name: folderId, type: "folder", isOpen: true, children: [] };
      folders.set(folderId, folder);
      root.push(folder);
    }
    folder.children?.push({
      id: file.path,
      name: parts[parts.length - 1],
      type: "file",
      language: file.language,
      content: file.content,
    });
  }

  return root;
}

function blueprintFor(kind: SiteKind): SiteBlueprint {
  const blueprint = BLUEPRINTS.find((item) => item.id === kind);
  if (!blueprint) return BLUEPRINTS[0];
  return blueprint;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "full-stack-site";
}

function renderHtml(blueprint: SiteBlueprint, title: string): string {
  const highlights = blueprint.highlights
    .map(
      (item) => `        <article class="card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body data-kind="${blueprint.id}">
  <header class="nav">
    <a class="brand" href="#top" data-site-title>${escapeHtml(title)}</a>
    <nav>
      <a href="#highlights">Overview</a>
      <a href="#collection">Records</a>
      <a href="#add">Add</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <p class="eyebrow">${escapeHtml(blueprint.eyebrow)}</p>
      <h1 data-site-title>${escapeHtml(title)}</h1>
      <p class="lede" data-site-tagline>${escapeHtml(blueprint.tagline)}</p>
    </section>
    <section id="highlights" class="section">
      <h2>Overview</h2>
      <div class="grid">
${highlights}
      </div>
    </section>
    <section id="collection" class="section">
      <h2>${escapeHtml(blueprint.recordsHeading)}</h2>
      <div id="records" class="grid"></div>
    </section>
    <section id="add" class="section">
      <h2>${escapeHtml(blueprint.formHeading)}</h2>
      <form id="record-form" class="form">
        <label>Title
          <input name="title" required maxlength="120" placeholder="Title">
        </label>
        <label>Details
          <textarea name="body" rows="4" maxlength="2000" placeholder="Details"></textarea>
        </label>
        <button type="submit">${escapeHtml(blueprint.submitLabel)}</button>
        <p id="form-status" class="status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <p>${escapeHtml(title)} · Node API · GET /api/health · GET /api/site · GET /api/records · POST /api/records</p>
  </footer>
  <script id="seed" type="application/json">${jsonForHtml({ records: blueprint.records })}</script>
  <script src="site.js"></script>
</body>
</html>
`;
}

function renderCss(accent: string): string {
  return `:root {
  --accent: ${accent};
  --bg: #0b1020;
  --card: #151b2e;
  --text: #e8eefc;
  --muted: #9aa6c3;
  --line: rgba(255, 255, 255, 0.08);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  background:
    radial-gradient(900px 420px at 8% -10%, color-mix(in srgb, var(--accent) 32%, transparent), transparent),
    var(--bg);
  color: var(--text);
  line-height: 1.5;
}
a { color: inherit; text-decoration: none; }
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 7vw;
  position: sticky;
  top: 0;
  background: rgba(11, 16, 32, 0.86);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.brand { font-weight: 700; letter-spacing: 0.01em; }
.nav nav { display: flex; gap: 16px; color: var(--muted); font-size: 14px; }
main { padding: 28px 7vw 64px; max-width: 1080px; }
.hero { padding: 36px 0 12px; }
.eyebrow {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 10px;
}
h1 { font-size: clamp(36px, 6vw, 64px); line-height: 1.05; margin: 0 0 12px; }
.lede { max-width: 38rem; color: var(--muted); font-size: 18px; margin: 0; }
.section { margin-top: 36px; }
h2 { font-size: 22px; margin: 0 0 14px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px 16px 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}
.card h3 { margin: 0 0 8px; font-size: 16px; }
.card p, .empty { margin: 0; color: var(--muted); }
.form {
  display: grid;
  gap: 12px;
  max-width: 520px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px;
}
label { display: grid; gap: 6px; font-size: 13px; color: var(--muted); }
input, textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: #0d1324;
  color: var(--text);
  padding: 10px 12px;
  font: inherit;
}
button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: #081018;
  font-weight: 700;
  padding: 10px 16px;
  cursor: pointer;
}
.status { min-height: 1.2em; }
footer {
  padding: 18px 7vw 28px;
  color: var(--muted);
  font-size: 13px;
  border-top: 1px solid var(--line);
}
@media (max-width: 640px) {
  .nav { align-items: flex-start; flex-direction: column; }
}
`;
}

const SITE_JS = `(function () {
  var seedEl = document.getElementById("seed");
  var seed = { records: [] };
  if (seedEl && seedEl.textContent) {
    try { seed = JSON.parse(seedEl.textContent); } catch (error) { seed = { records: [] }; }
  }

  function renderRecords(records) {
    var root = document.getElementById("records");
    if (!root) return;
    root.textContent = "";
    if (!records.length) {
      var empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No records yet.";
      root.appendChild(empty);
      return;
    }
    records.forEach(function (record) {
      var article = document.createElement("article");
      article.className = "card";
      var heading = document.createElement("h3");
      heading.textContent = record.title || "Untitled";
      var copy = document.createElement("p");
      copy.textContent = record.body || "";
      article.appendChild(heading);
      article.appendChild(copy);
      root.appendChild(article);
    });
  }

  function applySite(site) {
    if (!site) return;
    var titles = document.querySelectorAll("[data-site-title]");
    var tagline = document.querySelector("[data-site-tagline]");
    for (var i = 0; i < titles.length; i += 1) {
      if (site.title) titles[i].textContent = site.title;
    }
    if (tagline && site.tagline) tagline.textContent = site.tagline;
  }

  function load() {
    return Promise.all([
      fetch("/api/site").then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; }),
      fetch("/api/records").then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; })
    ]).then(function (results) {
      if (results[0]) applySite(results[0]);
      if (results[1] && Array.isArray(results[1].records)) renderRecords(results[1].records);
      else renderRecords(seed.records || []);
    });
  }

  var form = document.getElementById("record-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var payload = {
        title: String(data.get("title") || "").trim(),
        body: String(data.get("body") || "").trim()
      };
      var status = document.getElementById("form-status");
      if (!payload.title) {
        if (status) status.textContent = "Add a title first.";
        return;
      }
      fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("save failed");
        form.reset();
        if (status) status.textContent = "Saved to the API.";
        return load();
      }).catch(function () {
        seed.records = [{
          id: String(Date.now()),
          title: payload.title,
          body: payload.body,
          createdAt: new Date().toISOString()
        }].concat(seed.records || []);
        renderRecords(seed.records);
        form.reset();
        if (status) status.textContent = "Saved in this preview. Start the Node server to persist it.";
      });
    });
  }

  renderRecords(seed.records || []);
  load();
})();
`;

const SERVER_SOURCE = `import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addRecord, listRecords, siteMeta } from "./store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, "../client");
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  if (url.pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, service: "website-generator" });
    return;
  }
  if (url.pathname === "/api/site" && req.method === "GET") {
    sendJson(res, 200, siteMeta);
    return;
  }
  if (url.pathname === "/api/records" && req.method === "GET") {
    sendJson(res, 200, { records: listRecords() });
    return;
  }
  if (url.pathname === "/api/records" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const record = addRecord(body);
      sendJson(res, 201, { record });
    } catch (error) {
      const status = error && error.statusCode === 400 ? 400 : 400;
      sendJson(res, status, { error: error instanceof Error ? error.message : "Bad request" });
    }
    return;
  }

  const rel = (url.pathname === "/" ? "index.html" : url.pathname).replace(/^\\/+/, "");
  const filePath = path.resolve(clientDir, rel);
  const clientRoot = clientDir.endsWith(path.sep) ? clientDir : clientDir + path.sep;
  if (filePath !== clientDir && !filePath.startsWith(clientRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Site server listening on http://127.0.0.1:" + PORT);
});
`;

function renderStore(blueprint: SiteBlueprint, title: string): string {
  const siteMeta = {
    kind: blueprint.id,
    title,
    tagline: blueprint.tagline,
  };
  return `export const siteMeta = ${JSON.stringify(siteMeta, null, 2)};

const records = ${JSON.stringify(blueprint.records, null, 2)};

export function listRecords() {
  return records.map((record) => ({ ...record }));
}

export function addRecord(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Invalid record");
    error.statusCode = 400;
    throw error;
  }
  const title = String(input.title ?? "").trim();
  if (!title) {
    const error = new Error("Title is required");
    error.statusCode = 400;
    throw error;
  }
  const record = {
    id: String(Date.now()),
    title: title.slice(0, 120),
    body: String(input.body ?? "").trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  records.unshift(record);
  return record;
}
`;
}

function renderPackageJson(title: string): string {
  return `${JSON.stringify(
    {
      name: slugify(title),
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: { start: "node server/server.mjs" },
    },
    null,
    2,
  )}\n`;
}

function renderReadme(blueprint: SiteBlueprint, title: string): string {
  return `# ${title}

Full-stack ${blueprint.label.toLowerCase()} generated by the Lunor.AI Web Development assistant.

## Layout

- \`client/index.html\` — page
- \`client/styles.css\` — styles
- \`client/site.js\` — loads the API and posts new records
- \`server/server.mjs\` — Node HTTP server
- \`server/store.mjs\` — in-memory site metadata and records

## Run

\`\`\`bash
npm start
\`\`\`

Open http://127.0.0.1:3000

## API

- \`GET /api/health\`
- \`GET /api/site\`
- \`GET /api/records\`
- \`POST /api/records\` with JSON \`{ "title": "...", "body": "..." }\`
`;
}
