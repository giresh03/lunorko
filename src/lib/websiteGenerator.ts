/**
 * Full-stack website generator for the Web Development AI assistant.
 * Each automation writes a previewable HTML/CSS/JS client and an Express API.
 * The client renders embedded sample data when the API is not running.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "store" | "dashboard";

export interface WebsiteAutomation {
  id: WebsiteKind;
  label: string;
  icon: string;
  description: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface ProjectFileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: ProjectFileNode[];
  isOpen?: boolean;
}

export interface WebsiteProject {
  kind: WebsiteKind;
  name: string;
  tree: ProjectFileNode[];
  openTabs: { id: string; name: string; language: string; content: string; isModified: boolean }[];
  activeFileId: string;
  summary: string;
}

interface SiteRecord {
  title: string;
  body: string;
  meta?: string;
  image?: string;
}

interface SiteBlueprint {
  kind: WebsiteKind;
  name: string;
  tagline: string;
  lede: string;
  eyebrow: string;
  sectionLabel: string;
  formTitle: string;
  cta: string;
  accent: string;
  accent2: string;
  heroImage: string;
  apiPath: string;
  mode: "cards" | "products" | "stats";
  features: { title: string; body: string }[];
  records: SiteRecord[];
}

const unsplash = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

const BLUEPRINTS: Record<WebsiteKind, SiteBlueprint> = {
  landing: {
    kind: "landing",
    name: "Harbor Landing",
    tagline: "Ship a marketing site with a real API behind it.",
    lede: "A full-stack landing page: animated client, lead form, and an Express server that stores demo requests in memory.",
    eyebrow: "Full-stack landing",
    sectionLabel: "What teams say",
    formTitle: "Request a walkthrough",
    cta: "Book a demo",
    accent: "#3ee0b0",
    accent2: "#7aa2ff",
    heroImage: unsplash("1553877522-43269d4ea984", 1800, 1000),
    apiPath: "/api/testimonials",
    mode: "cards",
    features: [
      { title: "Client preview", body: "HTML, CSS, and JavaScript run in the editor even before the server starts." },
      { title: "Express API", body: "GET the collection, POST messages, and check /api/health from one file." },
      { title: "Same data both sides", body: "The browser falls back to the records baked into script.js." },
    ],
    records: [
      { title: "Ava Chen", body: "We replaced a static mock with this scaffold and wired our own copy the same day.", meta: "Founder, Northwind" },
      { title: "Luis Ortega", body: "The preview still looks finished when the API is offline. That saved the demo.", meta: "Design lead, Kite" },
      { title: "Mina Patel", body: "Leads land in POST /api/messages. Swapping the array for a database is the next lesson.", meta: "Engineer, Fieldnote" },
    ],
  },
  portfolio: {
    kind: "portfolio",
    name: "Studio Atelier",
    tagline: "A portfolio that loads projects from your API.",
    lede: "Case studies render from GET /api/projects. Start the Express server and the same page reads live JSON.",
    eyebrow: "Full-stack portfolio",
    sectionLabel: "Selected work",
    formTitle: "Start a project",
    cta: "Get in touch",
    accent: "#f0b429",
    accent2: "#ff7a59",
    heroImage: unsplash("1498050108023-c5249f4df085", 1800, 1000),
    apiPath: "/api/projects",
    mode: "cards",
    features: [
      { title: "Project grid", body: "Each card is data, not a hardcoded section, so new work is a JSON object." },
      { title: "Static client", body: "The browser bundle has no build step. Open index.html and it runs." },
      { title: "Contact endpoint", body: "The form posts to /api/messages and explains when the API is offline." },
    ],
    records: [
      { title: "Northwind", body: "Brand and marketing site for a climate studio.", meta: "2026", image: unsplash("1506744038136-46273834b3fb", 900, 600) },
      { title: "Kite Analytics", body: "Dashboard language, type, and a dark product UI.", meta: "2025", image: unsplash("1551288049-bebda4e38f71", 900, 600) },
      { title: "Fieldnote", body: "Editorial portfolio with long-form case studies.", meta: "2025", image: unsplash("1513364776144-60967b0f800f", 900, 600) },
    ],
  },
  blog: {
    kind: "blog",
    name: "Margin Journal",
    tagline: "Posts from an API, readable without one.",
    lede: "A small magazine layout. Articles come from GET /api/posts, with the same stories embedded for the in-editor preview.",
    eyebrow: "Full-stack blog",
    sectionLabel: "Latest essays",
    formTitle: "Subscribe for new essays",
    cta: "Subscribe",
    accent: "#c4b5fd",
    accent2: "#67e8f9",
    heroImage: unsplash("1481627834876-b7833e8f5570", 1800, 1000),
    apiPath: "/api/posts",
    mode: "cards",
    features: [
      { title: "Readable type", body: "A serif headline and a calm measure so long titles still fit on a phone." },
      { title: "Collection route", body: "server.js returns the essay list as JSON. Add a post by editing the array." },
      { title: "Offline preview", body: "If fetch fails, script.js paints the embedded essays instead of a blank page." },
    ],
    records: [
      { title: "Draw the API before the database", body: "Start with an in-memory array. The route shape is the part students need to see.", meta: "Mar 12" },
      { title: "Why the preview cannot call localhost", body: "The editor iframe has no Node process. Fallback data keeps the lesson visible.", meta: "Feb 2" },
      { title: "A folder is a contract", body: "client/ is what the browser runs. server/ is what Express runs. Keep them apart.", meta: "Jan 18" },
    ],
  },
  store: {
    kind: "store",
    name: "Lumen Goods",
    tagline: "A shopfront with a cart and an order API.",
    lede: "Products load from GET /api/products. Add to cart in the browser, then POST /api/orders when the server is up.",
    eyebrow: "Full-stack store",
    sectionLabel: "In the shop",
    formTitle: "Checkout note",
    cta: "Place order",
    accent: "#fb7185",
    accent2: "#fbbf24",
    heroImage: unsplash("1441986300917-64674bd600d8", 1800, 1000),
    apiPath: "/api/products",
    mode: "products",
    features: [
      { title: "Cart in the browser", body: "The count updates immediately. The order payload includes those items." },
      { title: "Order route", body: "POST /api/orders stores the cart in memory and returns the new id." },
      { title: "Honest offline state", body: "Without the API, checkout explains that the order stayed in the preview." },
    ],
    records: [
      { title: "Linen Tote", body: "Heavy canvas tote for everyday carry.", meta: "$42", image: unsplash("1523381210434-271e8be1f52b", 800, 800) },
      { title: "Ceramic Cup", body: "Speckled stoneware, 10 oz.", meta: "$28", image: unsplash("1514228742587-6b1558fcca3d", 800, 800) },
      { title: "Wool Throw", body: "Undyed wool, woven in small batches.", meta: "$96", image: unsplash("1616486338812-3dadae4b4ace", 800, 800) },
    ],
  },
  dashboard: {
    kind: "dashboard",
    name: "Signal Desk",
    tagline: "Metrics from GET /api/metrics.",
    lede: "An operations desk for a class project. Stat cards render from the API, and the alert form posts to /api/messages.",
    eyebrow: "Full-stack dashboard",
    sectionLabel: "This week",
    formTitle: "Create an alert",
    cta: "Save alert",
    accent: "#38bdf8",
    accent2: "#a3e635",
    heroImage: unsplash("1551288049-bebda4e38f71", 1800, 1000),
    apiPath: "/api/metrics",
    mode: "stats",
    features: [
      { title: "Stat cards", body: "Title, value, and delta are fields. The layout does not care which metric you add." },
      { title: "Health check", body: "GET /api/health tells you the process is up before you debug the client." },
      { title: "Preview first", body: "The four numbers below still appear when Express is not running." },
    ],
    records: [
      { title: "Visitors", body: "12,480", meta: "+8.2% this week" },
      { title: "Signups", body: "326", meta: "+3.1% this week" },
      { title: "Revenue", body: "$18.4k", meta: "+12% this week" },
      { title: "Uptime", body: "99.98%", meta: "Last 30 days" },
    ],
  },
};

export const WEBSITE_AUTOMATIONS: WebsiteAutomation[] = [
  { id: "landing", label: "Landing", icon: "🌐", description: "Hero, quotes, demo form" },
  { id: "portfolio", label: "Portfolio", icon: "🎨", description: "Projects from the API" },
  { id: "blog", label: "Blog", icon: "✍️", description: "Essays and subscribe" },
  { id: "store", label: "Store", icon: "🛍️", description: "Cart and orders" },
  { id: "dashboard", label: "Dashboard", icon: "📊", description: "Metrics and alerts" },
];

export function isWebsiteKind(value: string): value is WebsiteKind {
  return value in BLUEPRINTS;
}

function clientHtml(site: SiteBlueprint): string {
  const features = site.features
    .map((feature) => `<article><h3>${feature.title}</h3><p>${feature.body}</p></article>`)
    .join("\n        ");
  const cart = site.mode === "products" ? `<span class="pill">Cart <b id="cart-count">0</b></span>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed>
  <header class="nav">
    <a class="logo" href="#top">${site.name}</a>
    <nav>
      <a href="#work">${site.sectionLabel}</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
    <div class="nav-meta">
      <span class="pill" id="api-status">Loading</span>
      ${cart}
    </div>
  </header>
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${site.eyebrow}</p>
        <h1>${site.tagline}</h1>
        <p class="lede">${site.lede}</p>
        <a class="btn" href="#contact">${site.cta}</a>
      </div>
      <img src="${site.heroImage}" alt="">
    </section>
    <section id="work">
      <div class="section-head">
        <h2>${site.sectionLabel}</h2>
        <p>Loaded from <code>${site.apiPath}</code></p>
      </div>
      <div id="catalog" class="grid"></div>
    </section>
    <section id="about" class="features">
      <h2>How this stack fits together</h2>
      <div class="feature-grid">
        ${features}
      </div>
    </section>
    <section id="contact" class="contact">
      <div>
        <h2>${site.formTitle}</h2>
        <p>The form posts to the Express API. In the editor preview it keeps your note on the page when that API is not running.</p>
      </div>
      <form id="lead-form">
        <label>Name<input name="name" required autocomplete="name"></label>
        <label>Email<input name="email" type="email" required autocomplete="email"></label>
        <label>Message<textarea name="message" rows="4"></textarea></label>
        <button class="btn" type="submit">${site.cta}</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <p>${site.name} · full-stack scaffold from the Lunor.AI web assistant</p>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function clientCss(site: SiteBlueprint): string {
  return `/* ${site.name} — client styles */
:root {
  --accent: ${site.accent};
  --accent-2: ${site.accent2};
  --bg: #0c0f14;
  --card: #151a22;
  --line: rgba(255, 255, 255, 0.08);
  --text: #f4f1ea;
  --muted: #a7b0be;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Outfit, sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
code { font-size: 0.92em; color: var(--accent); }
.nav, main, footer { width: min(1120px, calc(100% - 32px)); margin-inline: auto; }
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 0;
}
.logo { font-weight: 600; text-decoration: none; letter-spacing: -0.03em; }
.nav nav { display: flex; gap: 16px; }
.nav nav a { color: var(--muted); text-decoration: none; font-size: 0.92rem; }
.nav-meta { margin-left: auto; display: flex; gap: 8px; }
.pill {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.75rem;
  color: var(--muted);
}
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: center;
  padding: 12px 0 48px;
}
.hero img { height: 420px; width: 100%; border-radius: 28px; }
.eyebrow {
  color: var(--accent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.72rem;
  margin: 0 0 12px;
}
h1, h2, h3 { font-family: Fraunces, serif; font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.4rem, 5vw, 4.4rem); line-height: 0.98; margin: 0 0 16px; }
.lede { color: var(--muted); font-size: 1.05rem; max-width: 46ch; }
.btn {
  display: inline-flex;
  margin-top: 8px;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  color: #0c0f14;
  text-decoration: none;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 600;
  cursor: pointer;
}
.section-head, .features h2, .contact h2 { margin-bottom: 8px; }
.section-head p, .contact p, .features p { color: var(--muted); }
.grid, .feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.card, .features article, form {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 16px;
}
.card img { height: 180px; width: 100%; border-radius: 14px; margin-bottom: 12px; }
.card h3, .features h3 { margin: 0 0 8px; }
.card p, .features p { margin: 0; color: var(--muted); line-height: 1.5; }
.meta { display: inline-block; margin-top: 12px; color: var(--accent); font-size: 0.85rem; }
.features, .contact, #work { padding: 28px 0; }
.contact { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 24px; align-items: start; }
form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; font-size: 0.85rem; color: var(--muted); }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #0e131a;
  color: var(--text);
  padding: 12px;
  font: inherit;
}
footer { padding: 28px 0 48px; color: var(--muted); font-size: 0.85rem; }
@media (max-width: 800px) {
  .hero, .contact, .grid, .feature-grid { grid-template-columns: 1fr; }
  .hero img { height: 240px; }
  .nav nav { display: none; }
}
`;
}

function clientJs(site: SiteBlueprint): string {
  const config = {
    name: site.name,
    apiPath: site.apiPath,
    mode: site.mode,
    records: site.records,
  };

  return `/* ${site.name} — browser client. Falls back to SITE.records when the API is offline. */
const SITE = ${JSON.stringify(config, null, 2)};

const catalog = document.getElementById("catalog");
const statusEl = document.getElementById("api-status");
const cartCount = document.getElementById("cart-count");
const cart = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function card(item) {
  const image = item.image ? '<img src="' + escapeHtml(item.image) + '" alt="">' : "";
  const action = SITE.mode === "products"
    ? '<button class="btn" type="button" data-add="' + escapeHtml(item.title) + '" data-price="' + escapeHtml(item.meta) + '">Add to cart</button>'
    : "";
  const meta = item.meta ? '<span class="meta">' + escapeHtml(item.meta) + "</span>" : "";
  return '<article class="card">' + image +
    "<h3>" + escapeHtml(item.title) + "</h3>" +
    "<p>" + escapeHtml(item.body) + "</p>" +
    meta + action + "</article>";
}

async function loadRecords() {
  try {
    const res = await fetch(SITE.apiPath);
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    if (statusEl) statusEl.textContent = "Live API";
    return Array.isArray(data) ? data : SITE.records;
  } catch (err) {
    if (statusEl) statusEl.textContent = "Preview data";
    return SITE.records;
  }
}

async function boot() {
  const records = await loadRecords();
  if (catalog) catalog.innerHTML = records.map(card).join("");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  cart.push({
    title: button.getAttribute("data-add"),
    price: button.getAttribute("data-price"),
  });
  if (cartCount) cartCount.textContent = String(cart.length);
});

const form = document.getElementById("lead-form");
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const note = document.getElementById("form-status");
    const contact = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      site: SITE.name,
    };
    const endpoint = SITE.mode === "products" ? "/api/orders" : "/api/messages";
    const payload = SITE.mode === "products" ? { contact, items: cart } : contact;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("API " + res.status);
      if (note) note.textContent = "Sent to the API.";
      form.reset();
    } catch (err) {
      if (note) note.textContent = "Saved in this preview. Start the API to store it on the server.";
    }
  });
}

boot();
`;
}

function serverJs(site: SiteBlueprint): string {
  return `const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));

const records = ${JSON.stringify(site.records, null, 2)};
const messages = [];
const orders = [];

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: ${JSON.stringify(site.name)} });
});

app.get(${JSON.stringify(site.apiPath)}, (_req, res) => {
  res.json(records);
});

app.post("/api/messages", (req, res) => {
  const message = {
    id: Date.now(),
    name: String(req.body?.name || "").slice(0, 80),
    email: String(req.body?.email || "").slice(0, 120),
    message: String(req.body?.message || "").slice(0, 1000),
    createdAt: new Date().toISOString(),
  };
  messages.push(message);
  res.status(201).json(message);
});

app.post("/api/orders", (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items.slice(0, 50) : [];
  const order = {
    id: Date.now(),
    items,
    contact: req.body?.contact || null,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json(order);
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(${JSON.stringify(site.name + " API")} + " on http://localhost:" + port);
});
`;
}

function serverPackage(site: SiteBlueprint): string {
  const slug = site.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return JSON.stringify(
    {
      name: `${slug}-api`,
      version: "1.0.0",
      private: true,
      main: "server.js",
      scripts: { start: "node server.js" },
      dependencies: { express: "^4.21.2" },
    },
    null,
    2,
  ) + "\n";
}

function readme(site: SiteBlueprint): string {
  return `# ${site.name}

Full-stack website generated by the Lunor.AI Web Development assistant.

## Files

- \`client/index.html\` — page structure
- \`client/styles.css\` — layout and theme
- \`client/script.js\` — loads \`${site.apiPath}\` and falls back to sample data
- \`server/server.js\` — Express API and static file server
- \`server/package.json\` — \`npm start\`

## Preview in Lunor

Open \`client/index.html\`. The page renders sample ${site.sectionLabel.toLowerCase()} immediately. The status pill says **Preview data** until the API is running.

## Run the API locally

\`\`\`bash
cd server
npm install
npm start
\`\`\`

Then open http://localhost:3000. The same page is served by Express, and the pill says **Live API**.

## Routes

- \`GET /api/health\`
- \`GET ${site.apiPath}\`
- \`POST /api/messages\`
- \`POST /api/orders\`
`;
}

export function generateWebsiteFiles(kind: WebsiteKind): GeneratedFile[] {
  const site = BLUEPRINTS[kind];
  if (!site) throw new Error(`Unknown website automation: ${kind}`);

  return [
    { path: "client/index.html", language: "html", content: clientHtml(site) },
    { path: "client/styles.css", language: "css", content: clientCss(site) },
    { path: "client/script.js", language: "javascript", content: clientJs(site) },
    { path: "server/server.js", language: "javascript", content: serverJs(site) },
    { path: "server/package.json", language: "json", content: serverPackage(site) },
    { path: "README.md", language: "markdown", content: readme(site) },
  ];
}

export function buildWebsiteProject(kind: WebsiteKind): WebsiteProject {
  const site = BLUEPRINTS[kind];
  const files = generateWebsiteFiles(kind);
  const folders = new Map<string, ProjectFileNode>();
  const rootFiles: ProjectFileNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    const node: ProjectFileNode = {
      id: file.path,
      name: parts[parts.length - 1],
      type: "file",
      language: file.language,
      content: file.content,
    };
    if (parts.length === 1) {
      rootFiles.push(node);
      continue;
    }
    const folderName = parts[0];
    let folder = folders.get(folderName);
    if (!folder) {
      folder = { id: folderName, name: folderName, type: "folder", isOpen: true, children: [] };
      folders.set(folderName, folder);
    }
    folder.children!.push(node);
  }

  const tabPaths = ["client/index.html", "client/script.js", "server/server.js"];
  return {
    kind,
    name: site.name,
    tree: [...folders.values(), ...rootFiles],
    openTabs: tabPaths.map((path) => {
      const file = files.find((item) => item.path === path)!;
      return {
        id: file.path,
        name: file.path.split("/").pop()!,
        language: file.language,
        content: file.content,
        isModified: true,
      };
    }),
    activeFileId: "client/index.html",
    summary: [
      `**${site.name}** is in the editor.`,
      "",
      "Client",
      "- `client/index.html`",
      "- `client/styles.css`",
      "- `client/script.js`",
      "",
      "API",
      "- `server/server.js`",
      "- `server/package.json`",
      "",
      `The preview reads sample data from the browser. \`GET ${site.apiPath}\` serves the same records when you run \`cd server && npm install && npm start\`.`,
      "",
      "Routes: `GET /api/health`, `POST /api/messages`, `POST /api/orders`.",
    ].join("\n"),
  };
}
