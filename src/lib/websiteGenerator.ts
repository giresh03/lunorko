/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a previewable HTML/CSS/JS site plus an Express API the page can call.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "restaurant" | "saas" | "store";

export interface WebsiteBlueprint {
  id: WebsiteKind;
  label: string;
  icon: string;
  description: string;
}

export interface WebsiteFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  brand: string;
  files: WebsiteFile[];
  summary: string;
  prompt: string;
}

export interface EditorTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: EditorTreeNode[];
  isOpen?: boolean;
}

interface SiteItem {
  title: string;
  detail: string;
  tag: string;
  price?: string;
  image: string;
}

interface SiteSpec {
  id: WebsiteKind;
  label: string;
  icon: string;
  description: string;
  defaultBrand: string;
  accent: string;
  accent2: string;
  eyebrow: string;
  headline: (brand: string) => string;
  subhead: string;
  sectionTitle: string;
  cta: string;
  heroImage: string;
  items: SiteItem[];
}

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const SPECS: Record<WebsiteKind, SiteSpec> = {
  landing: {
    id: "landing",
    label: "Landing page",
    icon: "🚀",
    description: "Hero, features, and a contact API",
    defaultBrand: "Northstar",
    accent: "#38bdf8",
    accent2: "#6366f1",
    eyebrow: "Product studio",
    headline: (brand) => `${brand} helps teams launch with confidence`,
    subhead: "A marketing site with a live preview and an Express API for inquiries.",
    sectionTitle: "What you get",
    cta: "See the offer",
    heroImage: photo("1553877522-43269d4ea984"),
    items: [
      { title: "Guided launch", detail: "A complete page structure you can restyle in the editor.", tag: "Frontend", image: photo("1460925895917-afdab827c52f") },
      { title: "Live preview", detail: "The site renders before the API is running, using local data.", tag: "Preview", image: photo("1498050108023-c5249f4df085") },
      { title: "Inquiry API", detail: "Contact messages are stored by a small Express server.", tag: "Backend", image: photo("1552664730-d307ca884978") },
    ],
  },
  portfolio: {
    id: "portfolio",
    label: "Portfolio",
    icon: "🎨",
    description: "Projects grid backed by /api/items",
    defaultBrand: "Studio Maren",
    accent: "#f59e0b",
    accent2: "#fb7185",
    eyebrow: "Selected work",
    headline: (brand) => `${brand} designs products people remember`,
    subhead: "A portfolio with project cards served by the API, with a local fallback.",
    sectionTitle: "Projects",
    cta: "View projects",
    heroImage: photo("1558618666-fcd25c85cd64"),
    items: [
      { title: "Harbor Atlas", detail: "Wayfinding system for a waterfront museum.", tag: "Identity", image: photo("1513364776144-60967b0f800f") },
      { title: "Lumen Notes", detail: "A writing app with a calm, editorial interface.", tag: "Product", image: photo("1517694712202-14dd9538aa97") },
      { title: "Field Kitchen", detail: "Seasonal menu site with reservations.", tag: "Web", image: photo("1414235077428-338989a2e8c0") },
    ],
  },
  blog: {
    id: "blog",
    label: "Blog",
    icon: "✍️",
    description: "Articles loaded from the API",
    defaultBrand: "Field Notes",
    accent: "#34d399",
    accent2: "#22d3ee",
    eyebrow: "Journal",
    headline: (brand) => `Stories from ${brand}`,
    subhead: "An editorial homepage. Posts come from Express, or from the file if the server is off.",
    sectionTitle: "Latest posts",
    cta: "Read posts",
    heroImage: photo("1455390582262-044cdead277a"),
    items: [
      { title: "Start with the reader", detail: "Why the first screen should answer one question.", tag: "Craft", image: photo("1481627834876-b7833e8f5570") },
      { title: "APIs for content", detail: "Keep copy in one place and let the page request it.", tag: "Backend", image: photo("1515879218367-8466d910aaa4") },
      { title: "Shipping on a Sunday", detail: "A short checklist before you publish.", tag: "Process", image: photo("1434030216411-0b793f4b4173") },
    ],
  },
  restaurant: {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    description: "Menu, hours, and reservations",
    defaultBrand: "Olive & Rye",
    accent: "#fb7185",
    accent2: "#f97316",
    eyebrow: "Dinner nightly",
    headline: (brand) => `${brand} — wood fire, seasonal plates`,
    subhead: "A restaurant site with a menu API and a reservation form.",
    sectionTitle: "Tonight's menu",
    cta: "See the menu",
    heroImage: photo("1414235077428-338989a2e8c0"),
    items: [
      { title: "Charred citrus salad", detail: "Fennel, pistachio, and sheep's milk cheese.", tag: "Starter", price: "$16", image: photo("1540189549336-e6e99c3679fe") },
      { title: "Ember roast chicken", detail: "Herb jus, potatoes, and lemon.", tag: "Main", price: "$32", image: photo("1504674900247-0877df9cc836") },
      { title: "Olive oil cake", detail: "Orange blossom and crème fraîche.", tag: "Dessert", price: "$12", image: photo("1551024601-bec78aea704b") },
    ],
  },
  saas: {
    id: "saas",
    label: "SaaS",
    icon: "⚡",
    description: "Product page with plan cards",
    defaultBrand: "Relay",
    accent: "#818cf8",
    accent2: "#22d3ee",
    eyebrow: "For growing teams",
    headline: (brand) => `${brand} keeps every handoff in one place`,
    subhead: "A product site with pricing cards and a demo-request API.",
    sectionTitle: "Plans",
    cta: "Compare plans",
    heroImage: photo("1551434678-e076c223a692"),
    items: [
      { title: "Starter", detail: "3 projects, shared inbox, email support.", tag: "Plan", price: "$19/mo", image: photo("1460925895917-afdab827c52f") },
      { title: "Team", detail: "Unlimited projects, roles, and audit history.", tag: "Plan", price: "$49/mo", image: photo("1552664730-d307ca884978") },
      { title: "Scale", detail: "SSO, priority support, and custom limits.", tag: "Plan", price: "Talk to us", image: photo("1553877522-43269d4ea984") },
    ],
  },
  store: {
    id: "store",
    label: "Store",
    icon: "🛍️",
    description: "Catalog, cart, and product API",
    defaultBrand: "Kindred Goods",
    accent: "#2dd4bf",
    accent2: "#a3e635",
    eyebrow: "Objects for the desk",
    headline: (brand) => `${brand} — made to be used every day`,
    subhead: "A small catalog. Products load from the API, and Add updates a local cart.",
    sectionTitle: "Catalog",
    cta: "Shop the catalog",
    heroImage: photo("1441986300917-64674bd600d8"),
    items: [
      { title: "Stoneware mug", detail: "Speckled clay, 12 oz.", tag: "Kitchen", price: "$28", image: photo("1514228742587-6b1558fcca3d") },
      { title: "Linen notebook", detail: "192 pages, lay-flat binding.", tag: "Desk", price: "$22", image: photo("1515879218367-8466d910aaa4") },
      { title: "Brass lamp", detail: "Warm light, weighted base.", tag: "Home", price: "$86", image: photo("1507473885765-e6ed057f782c") },
    ],
  },
};

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = (Object.keys(SPECS) as WebsiteKind[]).map((id) => {
  const spec = SPECS[id];
  return { id, label: spec.label, icon: spec.icon, description: spec.description };
});

export function resolveBrand(input: string, fallback: string): string {
  const cleaned = Array.from(input)
    .filter((char) => char.charCodeAt(0) >= 32 && char !== "`")
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
  return cleaned || fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hexColor(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#38bdf8";
}

function styles(accent: string, accent2: string): string {
  return `:root {
  --accent: ${hexColor(accent)};
  --accent-2: ${hexColor(accent2)};
  --bg: #0b1020;
  --ink: #eef2ff;
  --muted: #9aa3b8;
  --card: rgba(15, 23, 42, 0.72);
  --line: rgba(255, 255, 255, 0.08);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Outfit, "Segoe UI", sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    radial-gradient(700px 380px at 100% 0%, color-mix(in srgb, var(--accent-2) 28%, transparent), transparent 55%),
    var(--bg);
  color: var(--ink);
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
.nav, .hero, .section, footer {
  width: min(1080px, calc(100% - 32px));
  margin-inline: auto;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0;
  position: sticky;
  top: 0;
  z-index: 2;
}
.logo { font-weight: 600; letter-spacing: -0.03em; }
.nav nav { display: flex; gap: 18px; color: var(--muted); font-size: 14px; }
.cart { margin-left: 12px; color: var(--accent); font-size: 13px; }
.hero { padding: 28px 0 10px; display: grid; gap: 28px; }
.hero-copy h1 {
  font-family: Fraunces, Georgia, serif;
  font-size: clamp(40px, 6vw, 72px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  margin: 10px 0 14px;
}
.eyebrow { color: var(--accent); text-transform: uppercase; letter-spacing: 0.16em; font-size: 12px; margin: 0; }
.lede { color: var(--muted); font-size: 18px; max-width: 46ch; }
.hero-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
.hero-photo { border-radius: 22px; min-height: 280px; object-fit: cover; width: 100%; border: 1px solid var(--line); }
.btn {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #041018;
  font-weight: 600;
  cursor: pointer;
}
.btn-ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.btn-small { padding: 8px 12px; font-size: 13px; }
.section { padding: 28px 0 10px; }
.section-head h2, .contact h2, .card h3 {
  font-family: Fraunces, Georgia, serif;
  letter-spacing: -0.03em;
}
.section-head p { color: var(--muted); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
}
.card img { height: 160px; width: 100%; object-fit: cover; }
.card-body { padding: 16px; }
.tag { color: var(--accent); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 6px; }
.price { font-weight: 600; }
.contact form, .card-body p { color: var(--muted); }
form { display: grid; gap: 12px; max-width: 520px; }
label { display: grid; gap: 6px; font-size: 13px; color: var(--ink); }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(2, 6, 23, 0.45);
  color: var(--ink);
  padding: 12px 14px;
  font: inherit;
}
textarea { min-height: 110px; resize: vertical; }
#form-status { min-height: 1.2em; }
footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 28px 0 40px;
  color: var(--muted);
  font-size: 13px;
}
@media (max-width: 800px) {
  .hero { grid-template-columns: 1fr; }
  .grid { grid-template-columns: 1fr; }
  .nav nav { display: none; }
}
@media (min-width: 801px) {
  .hero { grid-template-columns: 1.1fr 0.9fr; align-items: center; }
}
`;
}

function pageHtml(spec: SiteSpec, brand: string): string {
  const safeBrand = escapeHtml(brand);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeBrand}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
  <header class="nav">
    <a class="logo" href="#top">${safeBrand}</a>
    <div>
      <nav>
        <a href="#work">${escapeHtml(spec.sectionTitle)}</a>
        <a href="#contact">Contact</a>
      </nav>
      <span id="cart" class="cart" hidden></span>
    </div>
  </header>
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(spec.eyebrow)}</p>
        <h1>${escapeHtml(spec.headline(brand))}</h1>
        <p class="lede">${escapeHtml(spec.subhead)}</p>
        <div class="hero-actions">
          <a class="btn" href="#work">${escapeHtml(spec.cta)}</a>
          <a class="btn btn-ghost" href="#contact">Contact</a>
        </div>
      </div>
      <img class="hero-photo" src="${spec.heroImage}" alt="" />
    </section>
    <section id="work" class="section">
      <div class="section-head">
        <h2>${escapeHtml(spec.sectionTitle)}</h2>
        <p>Loaded from the Express API on port 3000, or from local data if the server is off.</p>
      </div>
      <div id="items" class="grid" aria-live="polite"></div>
    </section>
    <section id="contact" class="section contact">
      <h2>Say hello</h2>
      <form id="contact-form">
        <label>Name<input name="name" required maxlength="80" /></label>
        <label>Email<input name="email" type="email" required maxlength="120" /></label>
        <label>Message<textarea name="message" required maxlength="1000"></textarea></label>
        <button class="btn" type="submit">Send</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <span>${safeBrand}</span>
    <span>Full-stack starter from the Web Development assistant</span>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function clientScript(spec: SiteSpec): string {
  return `const API = "http://localhost:3000";
const KIND = ${JSON.stringify(spec.id)};
const FALLBACK = ${JSON.stringify(spec.items, null, 2)};

const itemsEl = document.getElementById("items");
const cartEl = document.getElementById("cart");
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
let cartCount = 0;

function escapeText(value) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  }[char]));
}

function card(item) {
  const price = item.price ? \`<p class="price">\${escapeText(item.price)}</p>\` : "";
  const action = KIND === "store"
    ? \`<button type="button" class="btn btn-small" data-add="\${escapeText(item.title)}">Add</button>\`
    : "";
  return \`<article class="card">
    <img src="\${escapeText(item.image)}" alt="" />
    <div class="card-body">
      <p class="tag">\${escapeText(item.tag)}</p>
      <h3>\${escapeText(item.title)}</h3>
      <p>\${escapeText(item.detail)}</p>
      \${price}
      \${action}
    </div>
  </article>\`;
}

async function loadItems() {
  try {
    const response = await fetch(API + "/api/items");
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch {
    return FALLBACK;
  }
}

loadItems().then((items) => {
  itemsEl.innerHTML = items.map(card).join("");
});

itemsEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  cartCount += 1;
  cartEl.hidden = false;
  cartEl.textContent = "Cart " + cartCount;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  statusEl.textContent = "Sending...";
  try {
    const response = await fetch(API + "/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Request failed");
    form.reset();
    statusEl.textContent = "Sent. The API stored your message.";
  } catch {
    statusEl.textContent = "Saved in the browser only. Start the API with: cd server && npm install && npm start";
  }
});
`;
}

function serverSource(spec: SiteSpec, brand: string): string {
  return `import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const items = ${JSON.stringify(spec.items, null, 2)};
const messages = [];

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, site: ${JSON.stringify(brand)}, kind: ${JSON.stringify(spec.id)} });
});

app.get("/api/items", (_req, res) => {
  res.json(items);
});

app.post("/api/messages", (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 80);
  const email = String(req.body?.email || "").trim().slice(0, 120);
  const message = String(req.body?.message || "").trim().slice(0, 1000);
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  messages.unshift({ name, email, message, at: new Date().toISOString() });
  res.status(201).json({ ok: true });
});

app.get("/api/messages", (_req, res) => {
  res.json(messages);
});

app.listen(PORT, () => {
  console.log(${JSON.stringify(brand)} + " API listening on http://localhost:" + PORT);
});
`;
}

function serverPackage(brand: string): string {
  const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "website-api";
  return JSON.stringify(
    {
      name: `${slug}-api`,
      private: true,
      type: "module",
      scripts: { start: "node index.js" },
      dependencies: { express: "^4.21.2" },
    },
    null,
    2,
  ) + "\n";
}

const KIND_MATCHERS: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "restaurant", pattern: /\b(restaurant|cafe|café|menu)\b/i },
  { kind: "portfolio", pattern: /\bportfolio\b/i },
  { kind: "blog", pattern: /\b(blog|journal)\b/i },
  { kind: "store", pattern: /\b(store|shop|catalog|e-?commerce)\b/i },
  { kind: "saas", pattern: /\b(saas|pricing)\b/i },
  { kind: "landing", pattern: /\b(landing|marketing site|full-?stack|website)\b/i },
];

/** Detect a short "build a website" request so the assistant can run the generator directly. */
export function inferWebsiteRequest(text: string): { kind: WebsiteKind; brand: string } | null {
  const trimmed = text.trim();
  if (trimmed.length > 240) return null;
  if (!/^(?:please\s+)?(?:build|create|generate|make|scaffold)\b/i.test(trimmed)) return null;
  const kind = KIND_MATCHERS.find((item) => item.pattern.test(trimmed))?.kind;
  if (!kind) return null;
  const brandMatch = trimmed.match(/\b(?:for|called|named)\s+["']?([^"'\n]{1,48})/i);
  const brand = brandMatch ? brandMatch[1].replace(/[.?!].*$/, "").trim() : "";
  return { kind, brand };
}

export function generateWebsite(kind: WebsiteKind, brandInput = ""): GeneratedWebsite {
  const spec = SPECS[kind] ?? SPECS.landing;
  const brand = resolveBrand(brandInput, spec.defaultBrand);
  const files: WebsiteFile[] = [
    { path: "index.html", language: "html", content: pageHtml(spec, brand) },
    { path: "styles.css", language: "css", content: styles(spec.accent, spec.accent2) },
    { path: "script.js", language: "javascript", content: clientScript(spec) },
    { path: "server/index.js", language: "javascript", content: serverSource(spec, brand) },
    { path: "server/package.json", language: "json", content: serverPackage(brand) },
  ];
  const summary = [
    `**${spec.label} generated for ${brand}.**`,
    "",
    "The website generator wrote a previewable frontend and an Express API:",
    "",
    "- `index.html`, `styles.css`, `script.js` — shown in the preview",
    "- `server/index.js`, `server/package.json` — items and contact API",
    "",
    "Run the API from the project folder:",
    "",
    "```bash",
    "cd server && npm install && npm start",
    "```",
    "",
    "The preview uses local data until that API is running on port 3000. Ask me to change the copy, colors, or sections.",
  ].join("\n");

  return {
    kind: spec.id,
    brand,
    files,
    summary,
    prompt: `Generate a full-stack ${spec.label.toLowerCase()} for ${brand}`,
  };
}

/** File map for the in-editor preview. Server files stay off the page. */
export function previewFileMap(files: WebsiteFile[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const file of files) {
    if (!file.path.includes("/")) map[file.path] = file.content;
  }
  return map;
}

export function safeRelativePath(input: string): string | null {
  const normalized = input.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.split("/").some((part) => part === ".." || part === "")) return null;
  if (!/^[A-Za-z0-9._/-]+$/.test(normalized)) return null;
  const base = normalized.split("/").pop() || "";
  if (!/^[A-Za-z0-9._-]+\.[A-Za-z0-9]+$/.test(base)) return null;
  return normalized;
}

export function editorPathFor(filename: string): { id: string; name: string } | null {
  const safe = safeRelativePath(filename);
  if (!safe) return null;
  const id = safe.includes("/") ? safe : `src/${safe}`;
  const name = id.split("/").pop() || safe;
  return { id, name };
}

function cloneNode(node: EditorTreeNode): EditorTreeNode {
  return { ...node, children: node.children?.map(cloneNode) };
}

/** Insert or replace a generated file, creating folders for paths like server/index.js. */
export function insertGeneratedFile(
  tree: EditorTreeNode[],
  file: { path: string; language: string; content: string },
): EditorTreeNode[] {
  const located = editorPathFor(file.path);
  if (!located) return tree.map(cloneNode);
  const parts = located.id.split("/");

  const upsert = (nodes: EditorTreeNode[], depth: number): EditorTreeNode[] => {
    const part = parts[depth];
    const currentId = parts.slice(0, depth + 1).join("/");
    const index = nodes.findIndex((node) => node.id === currentId);
    const isFile = depth === parts.length - 1;

    if (isFile) {
      const fileNode: EditorTreeNode = {
        id: located.id,
        name: located.name,
        type: "file",
        language: file.language,
        content: file.content,
      };
      if (index >= 0 && nodes[index].type === "file") {
        const copy = nodes.slice();
        copy[index] = { ...nodes[index], ...fileNode };
        return copy;
      }
      return [...nodes, fileNode];
    }

    const existing = index >= 0 && nodes[index].type === "folder" ? nodes[index] : null;
    const folder: EditorTreeNode = {
      id: currentId,
      name: part,
      type: "folder",
      isOpen: true,
      children: upsert(existing?.children ? existing.children.map(cloneNode) : [], depth + 1),
    };
    if (index >= 0 && existing) {
      const copy = nodes.slice();
      copy[index] = folder;
      return copy;
    }
    return [...nodes, folder];
  };

  return upsert(tree.map(cloneNode), 0);
}
