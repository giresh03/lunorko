/**
 * Local full-stack website generator for the Web Development AI assistant.
 * A generate request is applied in the editor and does not wait on a model.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "store" | "blog" | "dashboard";

export interface WebsiteBlueprint {
  kind: WebsiteKind;
  label: string;
  description: string;
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

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  files: WebsiteFile[];
}

interface CatalogItem {
  id: string;
  title: string;
  detail: string;
  price: string;
}

interface Plan {
  id: string;
  name: string;
  detail: string;
  price: string;
}

interface CartLine {
  id: string;
  title: string;
  qty: number;
}

interface KindSpec {
  kind: WebsiteKind;
  label: string;
  description: string;
  defaultTitle: string;
  accent: string;
  eyebrow: string;
  tagline: string;
  itemsHeading: string;
  plansHeading: string;
  cartHeading: string;
  contactHeading: string;
  highlights: { title: string; body: string }[];
  items: CatalogItem[];
  plans: Plan[];
  cart: CartLine[];
}

const KINDS: KindSpec[] = [
  {
    kind: "landing",
    label: "Landing",
    description: "Product page and waitlist",
    defaultTitle: "Northstar",
    accent: "#2ee6a6",
    eyebrow: "Full-stack landing",
    tagline: "A product page with plans, a saved list, and a contact form backed by a Node API.",
    itemsHeading: "What ships",
    plansHeading: "Plans",
    cartHeading: "Saved list",
    contactHeading: "Request a walkthrough",
    highlights: [
      { title: "Client and API", body: "HTML, CSS, and app.js live in client/. Node serves them from server/server.js." },
      { title: "Preview first", body: "The editor opens the page immediately. app.js uses SEED when the API is offline." },
      { title: "Same routes", body: "Health, items, plans, contact, and cart are ready as soon as the server starts." },
    ],
    items: [
      { id: "item-1", title: "Guided onboarding", detail: "A three-step start that writes the first project for a new team.", price: "Included" },
      { id: "item-2", title: "Shared workspace", detail: "Comments stay next to the page they refer to.", price: "Team" },
      { id: "item-3", title: "Status API", detail: "GET /api/health answers before the rest of the page trusts the server.", price: "Live" },
    ],
    plans: [
      { id: "plan-1", name: "Starter", detail: "One site, the contact form, and the saved list.", price: "$0" },
      { id: "plan-2", name: "Studio", detail: "Plans, cart updates, and a custom name on the hero.", price: "$29" },
    ],
    cart: [{ id: "line-1", title: "Studio plan notes", qty: 1 }],
  },
  {
    kind: "portfolio",
    label: "Portfolio",
    description: "Selected work and contact",
    defaultTitle: "Studio North",
    accent: "#8b7cff",
    eyebrow: "Full-stack portfolio",
    tagline: "Selected work, packages, and a shortlist stored by the API.",
    itemsHeading: "Selected work",
    plansHeading: "Engagements",
    cartHeading: "Shortlist",
    contactHeading: "Start a project",
    highlights: [
      { title: "Case studies", body: "Each piece is an item with a title, a note, and a fee." },
      { title: "Shortlist", body: "POST /api/cart adds a piece without editing the HTML." },
      { title: "Contact", body: "The form posts to /api/contact and the server keeps the message in memory." },
    ],
    items: [
      { id: "item-1", title: "Harbor Atlas", detail: "A mapping site for small harbors, set in a quiet dark interface.", price: "2025" },
      { id: "item-2", title: "Lumen Notes", detail: "A writing app for long drafts and a clean export.", price: "2026" },
      { id: "item-3", title: "Field Kitchen", detail: "A reservation page with a menu that reads from JSON.", price: "2026" },
    ],
    plans: [
      { id: "plan-1", name: "Audit", detail: "A written review of an existing site and the first fix list.", price: "$900" },
      { id: "plan-2", name: "Build", detail: "A new marketing site with this client and API layout.", price: "$4,800" },
    ],
    cart: [{ id: "line-1", title: "Harbor Atlas", qty: 1 }],
  },
  {
    kind: "restaurant",
    label: "Restaurant",
    description: "Menu, seatings, and orders",
    defaultTitle: "Hearth & Rye",
    accent: "#f97316",
    eyebrow: "Full-stack restaurant",
    tagline: "Tonight's menu, seating plans, and a table order saved by the API.",
    itemsHeading: "Tonight's menu",
    plansHeading: "Seatings",
    cartHeading: "Table order",
    contactHeading: "Reserve a table",
    highlights: [
      { title: "Seasonal plates", body: "Dishes come from GET /api/items so the menu can change without editing HTML." },
      { title: "Service", body: "Dinner from 5–10. The page is the public menu. The API is the pad." },
      { title: "Walk-ins", body: "The order form is the same POST /api/cart the server accepts from any client." },
    ],
    items: [
      { id: "item-1", title: "Rye cavatelli", detail: "Brown butter, sage, and toasted seeds.", price: "$24" },
      { id: "item-2", title: "Citrus crudo", detail: "Market fish, fennel, and a cold herb oil.", price: "$21" },
      { id: "item-3", title: "Dark rye loaf", detail: "Warm, with cultured butter and salt.", price: "$9" },
    ],
    plans: [
      { id: "plan-1", name: "Kitchen counter", detail: "Five seats. First pour at 5:30.", price: "$68" },
      { id: "plan-2", name: "Dining room", detail: "A full seating with the bread course included.", price: "$92" },
    ],
    cart: [{ id: "line-1", title: "Rye cavatelli", qty: 2 }],
  },
  {
    kind: "store",
    label: "Store",
    description: "Catalog and cart",
    defaultTitle: "Market Lane",
    accent: "#38bdf8",
    eyebrow: "Full-stack store",
    tagline: "A small catalog with delivery plans and a cart the API can update.",
    itemsHeading: "Catalog",
    plansHeading: "Delivery",
    cartHeading: "Cart",
    contactHeading: "Ask about an item",
    highlights: [
      { title: "Catalog API", body: "Products come from GET /api/items. New cart lines come from POST /api/cart." },
      { title: "Plain checkout", body: "This starter lists products. Payment stays out of the sample on purpose." },
      { title: "Shared data", body: "The preview uses SEED. The server returns the same records once it is running." },
    ],
    items: [
      { id: "item-1", title: "Linen tote", detail: "Natural canvas, one pocket, made in a short run.", price: "$42" },
      { id: "item-2", title: "Ceramic pourer", detail: "Speckled glaze, about 500ml.", price: "$36" },
      { id: "item-3", title: "Wool throw", detail: "Undyed, light enough for a desk chair.", price: "$88" },
    ],
    plans: [
      { id: "plan-1", name: "Local drop", detail: "Same-week delivery inside the city.", price: "$6" },
      { id: "plan-2", name: "Parcel", detail: "Ships in a paper mailer within three days.", price: "$9" },
    ],
    cart: [{ id: "line-1", title: "Ceramic pourer", qty: 1 }],
  },
  {
    kind: "blog",
    label: "Blog",
    description: "Notes and a reading list",
    defaultTitle: "Field Notes",
    accent: "#f5b942",
    eyebrow: "Full-stack blog",
    tagline: "Notes published as items, with memberships and a reading list on the API.",
    itemsHeading: "Latest notes",
    plansHeading: "Memberships",
    cartHeading: "Reading list",
    contactHeading: "Send a note",
    highlights: [
      { title: "Posts as data", body: "The feed is GET /api/items. The page renders whatever the server returns." },
      { title: "No build step", body: "Vanilla JavaScript talks to the API and falls back to SEED in the preview." },
      { title: "One column", body: "Notes stay readable. Plans and the reading list sit beside them on wide screens." },
    ],
    items: [
      { id: "item-1", title: "Shipping the first API", detail: "Five routes are enough to start: health, items, plans, contact, and cart.", price: "Sep 2" },
      { id: "item-2", title: "Preview without a server", detail: "The client keeps SEED so the editor still shows notes.", price: "Sep 6" },
      { id: "item-3", title: "A shorter hero", detail: "The title is the name you asked for. The rest of the page follows it.", price: "Sep 8" },
    ],
    plans: [
      { id: "plan-1", name: "Reader", detail: "The public notes and the reading list.", price: "Free" },
      { id: "plan-2", name: "Member", detail: "A monthly note and the contact form marked as a member.", price: "$5" },
    ],
    cart: [{ id: "line-1", title: "Shipping the first API", qty: 1 }],
  },
  {
    kind: "dashboard",
    label: "Dashboard",
    description: "Signals and a queue",
    defaultTitle: "Harbor Ops",
    accent: "#34d399",
    eyebrow: "Full-stack dashboard",
    tagline: "A status board whose signals, plans, and queue come from the API.",
    itemsHeading: "Signals",
    plansHeading: "Coverage",
    cartHeading: "Queue",
    contactHeading: "File a note",
    highlights: [
      { title: "Health", body: "GET /api/health answers before you trust the rest of the board." },
      { title: "Signals", body: "GET /api/items is the activity list shown in the first grid." },
      { title: "Queue", body: "GET /api/cart reads the queue. POST /api/cart appends a line." },
    ],
    items: [
      { id: "item-1", title: "API healthy", detail: "Health check returned ok from the local Node process.", price: "Live" },
      { id: "item-2", title: "Preview opened", detail: "The editor rendered client/index.html with injected CSS and JS.", price: "Now" },
      { id: "item-3", title: "Queue depth", detail: "One line is waiting. Add another from the form.", price: "1" },
    ],
    plans: [
      { id: "plan-1", name: "Day watch", detail: "Health and the signal list, checked each hour.", price: "On" },
      { id: "plan-2", name: "Night watch", detail: "The same routes, with the contact form for handoff notes.", price: "On" },
    ],
    cart: [{ id: "line-1", title: "Confirm backup", qty: 1 }],
  },
];

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = KINDS.map(({ kind, label, description }) => ({
  kind,
  label,
  description,
}));

const GENERATE_VERB = /\b(generate|build|create|make|scaffold)\b/i;
const SITE_WORD = /\b(website|web\s*site|site|page)\b/i;
const FULL_STACK = /\bfull[\s-]?stack\b/i;

const KIND_PATTERNS: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "restaurant", pattern: /\b(restaurant|cafe|café|menu)\b/i },
  { kind: "portfolio", pattern: /\bportfolio\b/i },
  { kind: "store", pattern: /\b(store|shop|e-?commerce|catalog)\b/i },
  { kind: "blog", pattern: /\bblog\b/i },
  { kind: "dashboard", pattern: /\bdashboard\b/i },
  { kind: "landing", pattern: /\blanding\b/i },
];

export function defaultWebsiteTitle(kind: WebsiteKind): string {
  return KINDS.find((spec) => spec.kind === kind)?.defaultTitle ?? "Northstar";
}

export function isWebsiteGenerationRequest(text: string): boolean {
  if (!GENERATE_VERB.test(text)) return false;
  const namedKind = KIND_PATTERNS.some(({ pattern }) => pattern.test(text));
  if (FULL_STACK.test(text) && (SITE_WORD.test(text) || namedKind)) return true;
  return SITE_WORD.test(text) && namedKind;
}

export function parseWebsiteRequest(text: string): { kind: WebsiteKind; name: string } | null {
  if (!isWebsiteGenerationRequest(text)) return null;
  const kind = KIND_PATTERNS.find(({ pattern }) => pattern.test(text))?.kind ?? "landing";
  return { kind, name: extractName(text) || defaultWebsiteTitle(kind) };
}

export function isServerRuntimeSource(content: string): boolean {
  return content.trimStart().startsWith("/* @lunor-runtime server */");
}

export function generateFullStackWebsite(input: { name?: string; kind: WebsiteKind }): GeneratedWebsite {
  const spec = KINDS.find((item) => item.kind === input.kind) ?? KINDS[0];
  const title = input.name?.trim() || spec.defaultTitle;
  const files: WebsiteFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(spec, title) },
    { path: "client/styles.css", language: "css", content: renderCss() },
    { path: "client/app.js", language: "javascript", content: renderApp(spec) },
    { path: "server/server.js", language: "javascript", content: renderServer(spec, title) },
    { path: "server/package.json", language: "json", content: renderPackage(title) },
    { path: "README.md", language: "markdown", content: renderReadme(spec, title) },
  ];
  return { kind: spec.kind, title, files };
}

export function websiteFilesToTree(files: WebsiteFile[]): WebsiteTreeNode[] {
  const root: WebsiteTreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/");
    let level = root;
    let acc = "";
    parts.forEach((part, index) => {
      acc = acc ? `${acc}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = level.find((entry) => entry.name === part && entry.type === (isFile ? "file" : "folder"));
      if (!node) {
        node = isFile
          ? { id: file.path, name: part, type: "file", language: file.language, content: file.content }
          : { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        level.push(node);
      }
      if (!isFile) {
        if (!node.children) node.children = [];
        level = node.children;
      }
    });
  }
  return root;
}

function extractName(text: string): string | undefined {
  const match = text.match(/\b(?:for|called|named)\s+["“']?(.+?)["”']?\s*$/i);
  if (!match) return undefined;
  const name = match[1].replace(/^["']|["']$/g, "").replace(/[.?!]+$/, "").trim();
  if (name.length < 2) return undefined;
  if (/^(me|us|my site|a website|the site)$/i.test(name)) return undefined;
  return name;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slug(title: string): string {
  const value = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return value || "website";
}

function renderHtml(spec: KindSpec, title: string): string {
  const highlights = spec.highlights
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
<body data-themed style="--accent: ${spec.accent}">
  <header class="top">
    <a class="brand" href="#top">${escapeHtml(title)}</a>
    <nav>
      <a href="#work">${escapeHtml(spec.itemsHeading)}</a>
      <a href="#plans">${escapeHtml(spec.plansHeading)}</a>
      <a href="#cart">${escapeHtml(spec.cartHeading)}</a>
      <a href="#contact">${escapeHtml(spec.contactHeading)}</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <p class="eyebrow">${escapeHtml(spec.eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(spec.tagline)}</p>
    </section>
    <section class="grid" aria-label="Highlights">
${highlights}
    </section>
    <section id="work">
      <h2>${escapeHtml(spec.itemsHeading)}</h2>
      <div id="items" class="grid"></div>
    </section>
    <section id="plans">
      <h2>${escapeHtml(spec.plansHeading)}</h2>
      <div id="plans" class="grid"></div>
    </section>
    <section id="cart" class="split">
      <div>
        <h2>${escapeHtml(spec.cartHeading)}</h2>
        <ul id="cart-list"></ul>
      </div>
      <form id="cart-form">
        <label>Title <input name="title" required placeholder="Add a line"></label>
        <label>Qty <input name="qty" type="number" min="1" value="1"></label>
        <button type="submit">Add</button>
      </form>
    </section>
    <section id="contact">
      <h2>${escapeHtml(spec.contactHeading)}</h2>
      <form id="contact-form">
        <label>Name <input name="name" required></label>
        <label>Email <input name="email" type="email" placeholder="you@example.com"></label>
        <label>Message <textarea name="message" required rows="4"></textarea></label>
        <button type="submit">Send</button>
      </form>
      <p id="contact-status" role="status"></p>
    </section>
  </main>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderCss(): string {
  return `* { box-sizing: border-box; }
body[data-themed] {
  margin: 0;
  min-height: 100vh;
  font-family: "Segoe UI", system-ui, sans-serif;
  background:
    radial-gradient(900px 420px at 8% -10%, color-mix(in srgb, var(--accent) 42%, transparent), transparent 62%),
    #0c1222;
  color: #e8eef9;
}
a { color: inherit; text-decoration: none; }
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 7vw;
}
.brand { font-weight: 700; letter-spacing: 0.02em; }
nav { display: flex; flex-wrap: wrap; gap: 14px; color: #b7c3d6; font-size: 14px; }
main { padding: 12px 7vw 72px; }
.hero { max-width: 720px; padding: 28px 0 12px; }
.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
h1 { margin: 0; font-size: clamp(40px, 6vw, 72px); line-height: 0.95; }
.lede { color: #c5d0e0; font-size: 18px; line-height: 1.5; }
h2 { margin: 28px 0 12px; font-size: 22px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.card, form, #cart-list {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
}
.card h3 { margin: 0 0 8px; }
.card p, .card span, #cart-list { color: #c5d0e0; }
.card span { display: block; margin-top: 12px; color: var(--accent); font-weight: 650; }
.split { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; }
form { display: grid; gap: 10px; }
label { display: grid; gap: 6px; font-size: 13px; color: #b7c3d6; }
input, textarea {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: #0b1020;
  color: #e8eef9;
  padding: 10px 12px;
  font: inherit;
}
button {
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: #081018;
  font-weight: 700;
  padding: 10px 16px;
  cursor: pointer;
}
#cart-list { margin: 0; }
#contact-status { min-height: 1.2em; color: var(--accent); }
@media (max-width: 800px) {
  .split { grid-template-columns: 1fr; }
  .top { align-items: flex-start; flex-direction: column; }
}
`;
}

function renderApp(spec: KindSpec): string {
  const seed = { items: spec.items, plans: spec.plans, cart: spec.cart };
  return `const SEED = ${JSON.stringify(seed, null, 2)};

async function load(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return await res.json();
  } catch (error) {
    return fallback;
  }
}

function card(title, detail, extra) {
  const el = document.createElement("article");
  el.className = "card";
  const heading = document.createElement("h3");
  const body = document.createElement("p");
  const meta = document.createElement("span");
  heading.textContent = title;
  body.textContent = detail;
  meta.textContent = extra || "";
  el.append(heading, body, meta);
  return el;
}

function paintCart(lines) {
  const list = document.getElementById("cart-list");
  list.textContent = "";
  lines.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line.qty + " × " + line.title;
    list.appendChild(item);
  });
}

async function render() {
  const itemsData = await load("/api/items", { items: SEED.items });
  const plansData = await load("/api/plans", { plans: SEED.plans });
  const cartData = await load("/api/cart", { cart: SEED.cart });
  const itemsRoot = document.getElementById("items");
  const plansRoot = document.getElementById("plans");
  itemsRoot.textContent = "";
  (itemsData.items || SEED.items).forEach((item) => {
    itemsRoot.appendChild(card(item.title, item.detail, item.price));
  });
  plansRoot.textContent = "";
  (plansData.plans || SEED.plans).forEach((plan) => {
    plansRoot.appendChild(card(plan.name, plan.detail, plan.price));
  });
  paintCart(cartData.cart || SEED.cart);
}

document.getElementById("contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = { name: form.name.value, email: form.email.value, message: form.message.value };
  const status = document.getElementById("contact-status");
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Request failed");
    status.textContent = "Saved. The API stored your message.";
    form.reset();
  } catch (error) {
    status.textContent = "Preview mode: run node server/server.js to store this message.";
  }
});

document.getElementById("cart-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = { title: form.title.value, qty: Number(form.qty.value) || 1 };
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Request failed");
    const data = await res.json();
    paintCart(data.cart);
    form.reset();
  } catch (error) {
    const list = document.getElementById("cart-list");
    const item = document.createElement("li");
    item.textContent = payload.qty + " × " + payload.title + " (preview)";
    list.appendChild(item);
    form.reset();
  }
});

render();
`;
}

function renderServer(spec: KindSpec, title: string): string {
  return `/* @lunor-runtime server */
const http = require("http");
const fs = require("fs");
const path = require("path");

const TITLE = ${JSON.stringify(title)};
const ITEMS = ${JSON.stringify(spec.items, null, 2)};
const PLANS = ${JSON.stringify(spec.plans, null, 2)};
let cart = ${JSON.stringify(spec.cart, null, 2)};
const contacts = [];

const clientDir = path.resolve(__dirname, "..", "client");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) return resolve({});
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (url.pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, service: TITLE });
    return;
  }
  if (url.pathname === "/api/items" && req.method === "GET") {
    sendJson(res, 200, { items: ITEMS });
    return;
  }
  if (url.pathname === "/api/plans" && req.method === "GET") {
    sendJson(res, 200, { plans: PLANS });
    return;
  }
  if (url.pathname === "/api/contact" && req.method === "POST") {
    try {
      const body = await readJson(req);
      if (!body.name || !body.message) {
        sendJson(res, 400, { error: "Name and message are required" });
        return;
      }
      const contact = {
        id: "contact-" + (contacts.length + 1),
        name: String(body.name),
        email: String(body.email || ""),
        message: String(body.message),
      };
      contacts.push(contact);
      sendJson(res, 201, { ok: true, contact });
    } catch (error) {
      sendJson(res, 400, { error: "Invalid JSON" });
    }
    return;
  }
  if (url.pathname === "/api/cart" && req.method === "GET") {
    sendJson(res, 200, { cart });
    return;
  }
  if (url.pathname === "/api/cart" && req.method === "POST") {
    try {
      const body = await readJson(req);
      if (!body.title) {
        sendJson(res, 400, { error: "Title is required" });
        return;
      }
      const line = {
        id: "line-" + (cart.length + 1),
        title: String(body.title),
        qty: Number(body.qty) || 1,
      };
      cart = cart.concat([line]);
      sendJson(res, 201, { ok: true, cart });
    } catch (error) {
      sendJson(res, 400, { error: "Invalid JSON" });
    }
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const relative = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\\/+/, "");
  const filePath = path.resolve(clientDir, relative);
  if (filePath !== clientDir && !filePath.startsWith(clientDir + path.sep)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    const type = MIME[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Content-Length": data.length });
    res.end(req.method === "HEAD" ? undefined : data);
  });
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  const address = server.address();
  const actual = address && typeof address === "object" ? address.port : port;
  console.log("listening " + actual);
});
`;
}

function renderPackage(title: string): string {
  return `${JSON.stringify(
    {
      name: slug(title),
      private: true,
      scripts: { start: "node server.js" },
    },
    null,
    2,
  )}
`;
}

function renderReadme(spec: KindSpec, title: string): string {
  return `# ${title}

${spec.tagline}

## Run

From the project root:

\`\`\`bash
node server/server.js
\`\`\`

Or from \`server/\`:

\`\`\`bash
npm start
\`\`\`

The server serves \`client/\` and these routes:

- \`GET /api/health\`
- \`GET /api/items\`
- \`GET /api/plans\`
- \`POST /api/contact\`
- \`GET /api/cart\`
- \`POST /api/cart\`

In the editor preview, \`client/app.js\` uses \`SEED\` when those fetches fail.
`;
}
