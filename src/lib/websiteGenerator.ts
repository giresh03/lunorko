/**
 * Full-stack website generator for the Web Development AI assistant.
 * Builds a previewable client (HTML/CSS/JS) and an Express API that serves the same data.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "restaurant" | "store" | "dashboard";

export interface WebsiteBlueprint {
  id: WebsiteKind;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  prompt: string;
  defaultBrand: string;
  accent: string;
}

export interface WebsiteFile {
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

export interface SiteFeature {
  title: string;
  text: string;
}

export interface SiteItem {
  title: string;
  text: string;
  meta: string;
  image: string;
}

export interface SitePayload {
  kind: WebsiteKind;
  brand: string;
  tagline: string;
  accent: string;
  nav: string[];
  hero: { eyebrow: string; title: string; text: string; image: string; cta: string };
  features: SiteFeature[];
  items: SiteItem[];
  form: { title: string; submit: string; hint: string };
}

export interface WebsiteProject {
  brand: string;
  blueprint: WebsiteBlueprint;
  site: SitePayload;
  files: WebsiteFile[];
  summary: string;
}

const BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "landing",
    name: "Landing page",
    description: "Marketing site with pricing and a demo request API",
    icon: "🚀",
    keywords: ["landing", "saas", "startup", "marketing"],
    prompt: "Generate a full-stack landing page website",
    defaultBrand: "Lumen",
    accent: "#7c5cff",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Case studies and a project inquiry API",
    icon: "🎨",
    keywords: ["portfolio", "personal site", "resume", "case study", "freelance"],
    prompt: "Generate a full-stack portfolio website",
    defaultBrand: "Northwind Studio",
    accent: "#22d3ee",
  },
  {
    id: "blog",
    name: "Blog",
    description: "Articles plus a topic suggestion API",
    icon: "✍️",
    keywords: ["blog", "article", "magazine", "journal"],
    prompt: "Generate a full-stack blog website",
    defaultBrand: "Field Notes",
    accent: "#f59e0b",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Menu and a table reservation API",
    icon: "🍽️",
    keywords: ["restaurant", "cafe", "menu", "food", "reservation"],
    prompt: "Generate a full-stack restaurant website",
    defaultBrand: "Harbor & Rye",
    accent: "#f97316",
  },
  {
    id: "store",
    name: "Online store",
    description: "Product catalog and an order API",
    icon: "🛍️",
    keywords: ["store", "shop", "ecommerce", "e-commerce", "product", "cart"],
    prompt: "Generate a full-stack online store website",
    defaultBrand: "Market Lane",
    accent: "#34d399",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Metrics, activity, and a notes API",
    icon: "📊",
    keywords: ["dashboard", "admin", "analytics", "metrics"],
    prompt: "Generate a full-stack dashboard website",
    defaultBrand: "Pulseboard",
    accent: "#60a5fa",
  },
];

export function listWebsiteBlueprints(): WebsiteBlueprint[] {
  return BLUEPRINTS.map((blueprint) => ({ ...blueprint, keywords: [...blueprint.keywords] }));
}

export function matchWebsiteBlueprint(brief: string): WebsiteBlueprint {
  const text = brief.toLowerCase();
  let best = BLUEPRINTS[0];
  let bestScore = 0;
  for (const blueprint of BLUEPRINTS) {
    let score = 0;
    for (const keyword of blueprint.keywords) {
      if (text.includes(keyword)) score += keyword.length;
    }
    if (score > bestScore) {
      best = blueprint;
      bestScore = score;
    }
  }
  return best;
}

export function isWebsiteGeneratorRequest(text: string): boolean {
  const brief = text.trim();
  if (!brief) return false;
  if (/\bwebsite generator\b/i.test(brief)) return true;
  if (/\bfull[-\s]?stack\b/i.test(brief) && /\b(website|site|web app)\b/i.test(brief)) return true;
  const verb = /\b(build|create|generate|make|scaffold|design)\b/i;
  const target = /\b(website|web site|landing page|portfolio site|online store|restaurant site|blog site)\b/i;
  return verb.test(brief) && target.test(brief);
}

export function extractBrand(brief: string, fallback: string): string {
  const quoted = brief.match(/["“']([^"”']{2,48})["”']/);
  if (quoted) return cleanBrand(quoted[1]);

  const named = brief.match(/\b(?:called|named)\s+([A-Za-z0-9][\w&.\- ]{1,40})/i);
  if (named) return cleanBrand(named[1]);

  const forBrand = brief.match(/\bfor\s+(?:my\s+|the\s+|a\s+|an\s+)?([A-Za-z0-9][\w&.\- ]{1,40})/i);
  if (forBrand) {
    const cleaned = cleanBrand(forBrand[1]);
    if (cleaned.length >= 2 && !/^(a|an|the|my)$/i.test(cleaned)) return cleaned;
  }

  return fallback;
}

function cleanBrand(value: string): string {
  return value
    .replace(/\b(website|site|web app|fullstack|full-stack|full stack|landing page|portfolio|blog|restaurant|store|dashboard|with|using)\b.*$/i, "")
    .trim();
}

export function generateFullStackWebsite(brief: string, blueprintId?: string): WebsiteProject {
  const blueprint = blueprintId
    ? BLUEPRINTS.find((item) => item.id === blueprintId) ?? matchWebsiteBlueprint(brief)
    : matchWebsiteBlueprint(brief);
  const brand = extractBrand(brief, blueprint.defaultBrand);
  const site = buildSite(blueprint, brand);
  const files = buildFiles(site);
  return {
    brand,
    blueprint,
    site,
    files,
    summary: buildSummary(brand, blueprint),
  };
}

export function websiteFilesToTree(files: WebsiteFile[]): WebsiteTreeNode[] {
  const roots: WebsiteTreeNode[] = [];
  const folders = new Map<string, WebsiteTreeNode>();

  const ensureFolder = (folderPath: string): WebsiteTreeNode => {
    const existing = folders.get(folderPath);
    if (existing) return existing;
    const name = folderPath.split("/").pop() ?? folderPath;
    const node: WebsiteTreeNode = { id: folderPath, name, type: "folder", isOpen: true, children: [] };
    folders.set(folderPath, node);
    const parent = folderPath.includes("/") ? folderPath.slice(0, folderPath.lastIndexOf("/")) : "";
    if (parent) ensureFolder(parent).children?.push(node);
    else roots.push(node);
    return node;
  };

  for (const file of files) {
    const parts = file.path.split("/");
    const name = parts.pop() ?? file.path;
    const parent = parts.join("/");
    const node: WebsiteTreeNode = {
      id: file.path,
      name,
      type: "file",
      language: file.language,
      content: file.content,
    };
    if (parent) ensureFolder(parent).children?.push(node);
    else roots.push(node);
  }

  return roots;
}

function buildSite(blueprint: WebsiteBlueprint, brand: string): SitePayload {
  const copy = SITE_COPY[blueprint.id];
  return {
    kind: blueprint.id,
    brand,
    tagline: copy.tagline,
    accent: blueprint.accent,
    nav: copy.nav,
    hero: { ...copy.hero, title: copy.hero.title.replace(/\{brand\}/g, () => brand) },
    features: copy.features.map((feature) => ({ ...feature })),
    items: copy.items.map((item) => ({ ...item })),
    form: { ...copy.form },
  };
}

function buildFiles(site: SitePayload): WebsiteFile[] {
  const slug = slugify(site.brand);
  const json = safeJson(site);
  return [
    { path: "client/index.html", language: "html", content: renderHtml(site, json) },
    { path: "client/styles.css", language: "css", content: renderCss() },
    { path: "client/site.js", language: "javascript", content: CLIENT_RUNTIME },
    { path: "server/server.mjs", language: "javascript", content: SERVER_RUNTIME },
    { path: "server/store.mjs", language: "javascript", content: renderStore(json) },
    { path: "package.json", language: "json", content: renderPackageJson(slug) },
    { path: "README.md", language: "markdown", content: renderReadme(site) },
  ];
}

function buildSummary(brand: string, blueprint: WebsiteBlueprint): string {
  return [
    `Generated **${brand}** as a full-stack **${blueprint.name}**.`,
    "",
    "The preview is open from `client/index.html`. The same content is served by an Express API when you run the project locally.",
    "",
    "Files:",
    "- `client/index.html` — page structure",
    "- `client/styles.css` — layout and theme",
    "- `client/site.js` — loads `/api/site` and posts the form to `/api/records`",
    "- `server/server.mjs` — static files plus the API",
    "- `server/store.mjs` — in-memory site data",
    "- `package.json` — `npm install` then `npm start`",
    "- `README.md` — how to run it",
    "",
    "In the editor preview the page uses embedded data. With the server running, the form writes through the API and the list reloads from `GET /api/records`.",
  ].join("\n");
}

function renderHtml(site: SitePayload, json: string): string {
  const brand = escapeHtml(site.brand);
  const nav = site.nav
    .map((label) => `<a href="#${anchor(label)}">${escapeHtml(label)}</a>`)
    .join("");
  const features = site.features
    .map(
      (feature) => `<article class="card">
        <h3>${escapeHtml(feature.title)}</h3>
        <p>${escapeHtml(feature.text)}</p>
      </article>`
    )
    .join("");
  const items = site.items
    .map(
      (item) => `<article class="item">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
        <div>
          <p class="meta">${escapeHtml(item.meta)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </div>
      </article>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${brand}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed style="--accent: ${site.accent}">
  <header class="nav">
    <a class="logo" href="#top">${brand}</a>
    <nav>${nav}</nav>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(site.hero.eyebrow)}</p>
        <h1>${escapeHtml(site.hero.title)}</h1>
        <p class="lede">${escapeHtml(site.hero.text)}</p>
        <a class="cta" href="#contact">${escapeHtml(site.hero.cta)}</a>
      </div>
      <img src="${escapeHtml(site.hero.image)}" alt="${brand}" />
    </section>
    <section id="highlights" class="section">
      <h2>Highlights</h2>
      <div class="cards">${features}</div>
    </section>
    <section id="work" class="section">
      <h2>${escapeHtml(sectionTitle(site.kind))}</h2>
      <div class="items">${items}</div>
    </section>
    <section id="contact" class="section panel">
      <div>
        <h2>${escapeHtml(site.form.title)}</h2>
        <p>${escapeHtml(site.form.hint)}</p>
      </div>
      <form id="record-form">
        <label>Name<input name="name" required placeholder="Your name" /></label>
        <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
        <label>Message<textarea name="message" rows="4" placeholder="How can we help?"></textarea></label>
        <button type="submit">${escapeHtml(site.form.submit)}</button>
        <p id="form-status" role="status"></p>
      </form>
      <ul id="record-list" aria-live="polite"></ul>
    </section>
  </main>
  <footer>
    <span>${brand}</span>
    <span>${escapeHtml(site.tagline)}</span>
  </footer>
  <script id="site-data" type="application/json">${json}</script>
  <script src="site.js"></script>
</body>
</html>
`;
}

function sectionTitle(kind: WebsiteKind): string {
  switch (kind) {
    case "portfolio":
      return "Selected work";
    case "blog":
      return "Latest articles";
    case "restaurant":
      return "From the menu";
    case "store":
      return "In the shop";
    case "dashboard":
      return "Recent activity";
    default:
      return "Plans";
  }
}

function anchor(label: string): string {
  const key = label.toLowerCase();
  if (key.includes("contact") || key.includes("reserve") || key.includes("order")) return "contact";
  if (key.includes("work") || key.includes("menu") || key.includes("shop") || key.includes("article") || key.includes("plan") || key.includes("activity")) return "work";
  return "highlights";
}

function renderCss(): string {
  return `* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #0c1222;
  color: #e8eefc;
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
.nav, footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 6vw;
}
.nav { position: sticky; top: 0; background: rgba(12, 18, 34, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.06); z-index: 2; }
.logo { font-weight: 700; letter-spacing: -0.03em; }
nav { display: flex; gap: 1rem; color: #b7c3de; font-size: 0.92rem; }
.hero, .section { padding: 3.5rem 6vw; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: center; }
.hero img, .item img { width: 100%; height: 320px; border-radius: 18px; }
.eyebrow { color: var(--accent); font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase; }
h1 { font-size: clamp(2.2rem, 5vw, 4.4rem); line-height: 0.95; margin: 0.4rem 0 1rem; letter-spacing: -0.04em; }
.lede { color: #b7c3de; font-size: 1.1rem; max-width: 38rem; }
.cta, button {
  display: inline-flex;
  margin-top: 1.2rem;
  background: var(--accent);
  color: #081018;
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
}
.cards, .items { display: grid; gap: 1rem; }
.cards { grid-template-columns: repeat(3, 1fr); }
.items { grid-template-columns: 1fr; }
.card, .item, .panel form, #record-list {
  background: #141c31;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
}
.card, .item { padding: 1rem; }
.item { display: grid; grid-template-columns: 180px 1fr; gap: 1rem; align-items: center; }
.item img { height: 120px; }
.meta { color: var(--accent); font-size: 0.8rem; margin: 0; }
h2, h3 { margin: 0 0 0.4rem; }
.panel { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 1.5rem; align-items: start; }
form { display: grid; gap: 0.75rem; padding: 1rem; }
label { display: grid; gap: 0.35rem; font-size: 0.85rem; color: #b7c3de; }
input, textarea {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.1);
  background: #0c1222;
  color: #e8eefc;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  font: inherit;
}
#record-list { margin: 1rem 0 0; padding: 0.5rem 1rem 0.8rem; list-style: none; }
#record-list li { padding: 0.55rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
#form-status { min-height: 1.2rem; color: var(--accent); }
footer { color: #8ea0c3; border-top: 1px solid rgba(255,255,255,0.06); }
@media (max-width: 800px) {
  .hero, .cards, .panel, .item { grid-template-columns: 1fr; }
  .nav { align-items: flex-start; flex-direction: column; }
  .hero img { height: 220px; }
}
`;
}

const CLIENT_RUNTIME = `const dataEl = document.getElementById("site-data");
const fallback = JSON.parse(dataEl ? dataEl.textContent || "{}" : "{}");
const form = document.getElementById("record-form");
const statusEl = document.getElementById("form-status");
const listEl = document.getElementById("record-list");

async function readJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

function addRecordItem(record) {
  if (!listEl) return;
  const item = document.createElement("li");
  const title = document.createElement("strong");
  title.textContent = record.name || "Guest";
  item.appendChild(title);
  if (record.message) {
    item.appendChild(document.createTextNode(" — " + record.message));
  }
  listEl.prepend(item);
}

async function loadRecords() {
  try {
    const records = await readJson("/api/records");
    records.slice().reverse().forEach(addRecordItem);
  } catch {
    statusEl.textContent = "Preview mode — start the API with npm start to save records.";
  }
}

async function loadSite() {
  try {
    const site = await readJson("/api/site");
    const heading = document.querySelector("h1");
    if (heading && site.hero && site.hero.title) heading.textContent = site.hero.title;
  } catch {
    /* Embedded site data already rendered the page. */
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };
    if (!payload.name) {
      statusEl.textContent = "Add your name to continue.";
      return;
    }
    try {
      const saved = await readJson("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      addRecordItem(saved);
      form.reset();
      statusEl.textContent = "Saved to the API.";
    } catch {
      addRecordItem({ ...payload, id: "local" });
      form.reset();
      statusEl.textContent = "Saved in this preview. Run npm start to persist it on the server.";
    }
  });
}

loadSite();
loadRecords();
void fallback;
`;

const SERVER_RUNTIME = `import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getSite, listRecords, addRecord } from "./store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../client")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/site", (_req, res) => {
  res.json(getSite());
});

app.get("/api/records", (_req, res) => {
  res.json(listRecords());
});

app.post("/api/records", (req, res) => {
  const body = req.body ?? {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const record = addRecord({ name, email, message });
  res.status(201).json(record);
});

app.listen(port, () => {
  console.log("Website running at http://localhost:" + port);
});
`;

function renderStore(json: string): string {
  return `const site = ${json};
const records = [];

export function getSite() {
  return site;
}

export function listRecords() {
  return records;
}

export function addRecord(input) {
  const record = {
    id: records.length + 1,
    createdAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    message: input.message,
  };
  records.push(record);
  return record;
}
`;
}

function renderPackageJson(slug: string): string {
  return JSON.stringify(
    {
      name: slug || "generated-website",
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: {
        start: "node server/server.mjs",
        dev: "node --watch server/server.mjs",
      },
      dependencies: {
        express: "^4.21.2",
      },
    },
    null,
    2
  ) + "\n";
}

function renderReadme(site: SitePayload): string {
  return `# ${site.brand}

${site.tagline}

Generated by the Lunor web development website generator.

## Run

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## Layout

- \`client/\` — HTML, CSS, and browser JavaScript. This is what the editor preview runs.
- \`server/server.mjs\` — Express app. Serves the client and \`/api/site\`, \`/api/records\`.
- \`server/store.mjs\` — in-memory site content and submitted records.

The preview works without the server. Submitting the form talks to the API when \`npm start\` is running.
`;
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "generated-website";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function photo(id: string, width = 1200, height = 800): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

interface SiteCopy {
  tagline: string;
  nav: string[];
  hero: SitePayload["hero"];
  features: SiteFeature[];
  items: SiteItem[];
  form: SitePayload["form"];
}

const SITE_COPY: Record<WebsiteKind, SiteCopy> = {
  landing: {
    tagline: "A product site with a working demo API",
    nav: ["Highlights", "Plans", "Contact"],
    hero: {
      eyebrow: "Full-stack starter",
      title: "{brand} helps teams launch faster",
      text: "A marketing page, pricing, and a demo request endpoint generated together.",
      image: photo("1498050108023-c5249f4df085"),
      cta: "Request a demo",
    },
    features: [
      { title: "Live preview", text: "The client page renders in the editor before you install anything." },
      { title: "Express API", text: "The same site data is available at GET /api/site." },
      { title: "Lead capture", text: "The form posts to POST /api/records and lists what was saved." },
    ],
    items: [
      { title: "Starter", text: "One page, one API, ready to customize.", meta: "$0", image: photo("1553877522-43269d4ea984", 800, 500) },
      { title: "Pro", text: "Add auth, a database, and a custom domain when you outgrow the starter.", meta: "$29", image: photo("1460925895917-afdab827c52f", 800, 500) },
      { title: "Team", text: "Share the repo and extend the store module with real persistence.", meta: "$79", image: photo("1522071820081-009f0129c71c", 800, 500) },
    ],
    form: { title: "Request a demo", submit: "Send request", hint: "This writes a lead through the API." },
  },
  portfolio: {
    tagline: "Selected work and a project inquiry API",
    nav: ["Highlights", "Work", "Contact"],
    hero: {
      eyebrow: "Studio",
      title: "{brand} designs products people return to",
      text: "Case studies up front, with a contact form that stores inquiries on the server.",
      image: photo("1558618666-fcd25c85cd64"),
      cta: "Start a project",
    },
    features: [
      { title: "Product design", text: "Interfaces with a clear type scale and a single accent color." },
      { title: "Front-end build", text: "Semantic HTML and CSS that the preview can run immediately." },
      { title: "API handoff", text: "Inquiries land in the Express store so a teammate can read them." },
    ],
    items: [
      { title: "Atlas Travel", text: "A booking flow rebuilt around fewer steps and clearer prices.", meta: "Case study", image: photo("1488646953014-85cb44e25828", 800, 500) },
      { title: "Kindred Health", text: "A patient portal with calmer screens and faster repeat visits.", meta: "Case study", image: photo("1576091160399-112ba8d25d1d", 800, 500) },
      { title: "Northline", text: "A marketing site that keeps the story and the product shots in sync.", meta: "Case study", image: photo("1498050108023-c5249f4df085", 800, 500) },
    ],
    form: { title: "Start a project", submit: "Send inquiry", hint: "Tell us what you want to build." },
  },
  blog: {
    tagline: "Articles with a suggestion box API",
    nav: ["Highlights", "Articles", "Contact"],
    hero: {
      eyebrow: "Journal",
      title: "Notes from {brand}",
      text: "Three essays on the homepage, and a form that stores topic ideas.",
      image: photo("1455390582262-044cdead277a"),
      cta: "Suggest a topic",
    },
    features: [
      { title: "Readable type", text: "Long-form layout with a sticky header and a single column of stories." },
      { title: "Shared content", text: "Article data lives in the store and in the page, so both stay aligned." },
      { title: "Suggestions", text: "Readers can post an idea without leaving the page." },
    ],
    items: [
      { title: "Ship the boring version", text: "Why a plain form and a JSON API beat a framework on day one.", meta: "Engineering", image: photo("1515879218367-8466d910aaa4", 800, 500) },
      { title: "Color with a job", text: "Use one accent for actions and leave the rest of the page quiet.", meta: "Design", image: photo("1550684848-fac1c5b4e853", 800, 500) },
      { title: "Preview before install", text: "Browser JavaScript lets you see the site before npm install.", meta: "Workflow", image: photo("1461749280684-dccba630e2f6", 800, 500) },
    ],
    form: { title: "Suggest a topic", submit: "Send idea", hint: "Ideas are stored by the API." },
  },
  restaurant: {
    tagline: "Menu, hours, and table reservations",
    nav: ["Highlights", "Menu", "Reserve"],
    hero: {
      eyebrow: "Dinner nightly",
      title: "Welcome to {brand}",
      text: "Seasonal plates, a short menu, and a reservation form backed by the API.",
      image: photo("1414235077428-338989a2e8c0"),
      cta: "Reserve a table",
    },
    features: [
      { title: "Open tonight", text: "Tuesday to Sunday, from 5pm. The kitchen closes at 10." },
      { title: "Neighborhood wine", text: "A short list chosen to match the menu, not a catalog." },
      { title: "Reservations", text: "The form posts a name, email, and note to the server." },
    ],
    items: [
      { title: "Rye old fashioned", text: "Orange peel, demerara, and a large cube.", meta: "$14", image: photo("1470337458703-46ad1756a187", 800, 500) },
      { title: "Charred broccoli", text: "Chili, lemon, and toasted garlic.", meta: "$16", image: photo("1512621776951-a57141f2eefd", 800, 500) },
      { title: "Dry-aged steak", text: "Served with butter potatoes and greens.", meta: "$42", image: photo("1558030006-450675393462", 800, 500) },
    ],
    form: { title: "Reserve a table", submit: "Request reservation", hint: "Include party size and a time in the message." },
  },
  store: {
    tagline: "A small catalog with an order API",
    nav: ["Highlights", "Shop", "Order"],
    hero: {
      eyebrow: "Goods",
      title: "{brand} — objects for everyday use",
      text: "Three products on the page, and an order form that records what the customer asked for.",
      image: photo("1441986300917-64674bd600d8"),
      cta: "Place an order",
    },
    features: [
      { title: "Ships in two days", text: "Orders are acknowledged by the API as soon as the form is posted." },
      { title: "Easy returns", text: "Thirty days, no account required for this starter." },
      { title: "One catalog", text: "Product copy is shared by the page and GET /api/site." },
    ],
    items: [
      { title: "Canvas tote", text: "Natural cotton, reinforced straps.", meta: "$28", image: photo("1544816155-12df9643f363", 800, 500) },
      { title: "Ceramic cup", text: "Speckled glaze, holds 10 ounces.", meta: "$22", image: photo("1514228742587-6b1558fcca3d", 800, 500) },
      { title: "Wool throw", text: "Charcoal, washed, light enough for a sofa.", meta: "$96", image: photo("1616628188859-7a11abb6fcc9", 800, 500) },
    ],
    form: { title: "Place an order", submit: "Send order", hint: "Name the product and quantity in the message." },
  },
  dashboard: {
    tagline: "Metrics and a notes API",
    nav: ["Highlights", "Activity", "Notes"],
    hero: {
      eyebrow: "Overview",
      title: "{brand} at a glance",
      text: "A compact operations view with activity rows and a note form.",
      image: photo("1551288049-bebda4e38f71"),
      cta: "Add a note",
    },
    features: [
      { title: "12.4k visits", text: "Up 8% from last week across the marketing site." },
      { title: "98.9% uptime", text: "The API health route is ready at GET /api/health." },
      { title: "36 open notes", text: "New notes append through POST /api/records." },
    ],
    items: [
      { title: "Deploy finished", text: "Production build completed and the static client was published.", meta: "2m ago", image: photo("1518770660439-4636190af475", 800, 500) },
      { title: "Signup spike", text: "Demo requests doubled after the landing page update.", meta: "1h ago", image: photo("1460925895917-afdab827c52f", 800, 500) },
      { title: "Backup ok", text: "Nightly export of records completed without errors.", meta: "6h ago", image: photo("1558494949-ef010cbdcc31", 800, 500) },
    ],
    form: { title: "Add a note", submit: "Save note", hint: "Notes are stored by the API and listed below the form." },
  },
};
