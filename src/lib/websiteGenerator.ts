/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a vanilla client (HTML, CSS, JS) and a Node HTTP API.
 */

export type WebsiteKind = "portfolio" | "landing" | "restaurant" | "blog" | "store" | "booking";

export interface WebsiteBrief {
  kind: WebsiteKind;
  name: string;
  tagline?: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  name: string;
  slug: string;
  tagline: string;
  summary: string;
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

interface CatalogItem {
  id: string;
  title: string;
  detail: string;
  price?: string;
  tag?: string;
  image: string;
}

interface Blueprint {
  id: WebsiteKind;
  label: string;
  description: string;
  defaultName: string;
  defaultTagline: string;
  accent: string;
  catalogTitle: string;
  about: string;
  formTitle: string;
  items: Omit<CatalogItem, "image">[];
}

export const WEBSITE_BLUEPRINTS: Blueprint[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Projects, about, and contact",
    defaultName: "Northstar Studio",
    defaultTagline: "Product design and engineering for ambitious teams.",
    accent: "#8eb6ff",
    catalogTitle: "Selected work",
    about: "A small studio that designs interfaces, ships the front end, and leaves the API documented.",
    formTitle: "Start a project",
    items: [
      { id: "atlas", title: "Atlas", detail: "Marketing site and content API for a climate lab.", tag: "Web" },
      { id: "keel", title: "Keel", detail: "Booking flow with a small Node service behind it.", tag: "Product" },
      { id: "linen", title: "Linen", detail: "Editorial portfolio with a readable type system.", tag: "Brand" },
      { id: "harbor", title: "Harbor", detail: "Dashboard shell that talks to a JSON API.", tag: "App" },
    ],
  },
  {
    id: "landing",
    label: "Landing",
    description: "Hero, features, and pricing",
    defaultName: "Lumen",
    defaultTagline: "Publish a full-stack site without waiting on a framework.",
    accent: "#3ee0b0",
    catalogTitle: "What you get",
    about: "Lumen is a starter for teams who want a public page and an API in the same project.",
    formTitle: "Request a walkthrough",
    items: [
      { id: "client", title: "Client", detail: "Responsive HTML, CSS, and JavaScript with a live preview.", tag: "Front end" },
      { id: "api", title: "API", detail: "Node server with health, content, and lead routes.", tag: "Back end" },
      { id: "preview", title: "Preview", detail: "The page still renders if the API is offline.", tag: "Resilient" },
      { id: "docs", title: "Runbook", detail: "README with the one command that starts the server.", tag: "Docs" },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Menu, hours, and reservations",
    defaultName: "Harbor Table",
    defaultTagline: "Seasonal plates, a short walk from the water.",
    accent: "#e7b15a",
    catalogTitle: "Tonight's menu",
    about: "Dinner service Wednesday through Sunday. The menu is served by the API and cached in the page.",
    formTitle: "Request a table",
    items: [
      { id: "oysters", title: "Chilled oysters", detail: "Citrus, fennel, and brown bread.", price: "$18", tag: "Start" },
      { id: "greens", title: "Charred greens", detail: "Lemon, chili, and toasted seeds.", price: "$14", tag: "Start" },
      { id: "fish", title: "Line-caught fish", detail: "Brown butter, capers, and new potatoes.", price: "$32", tag: "Main" },
      { id: "tart", title: "Citrus tart", detail: "Short crust and crème fraîche.", price: "$12", tag: "Sweet" },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    description: "Articles backed by an API",
    defaultName: "Field Notes",
    defaultTagline: "Short essays on building for the web.",
    accent: "#f0a3c2",
    catalogTitle: "Latest notes",
    about: "Each note is a record from the API. The page keeps a local copy so reading still works offline.",
    formTitle: "Send a note",
    items: [
      { id: "html", title: "HTML still ships", detail: "Why a full-stack site can start as three client files.", tag: "Craft" },
      { id: "api", title: "A small API", detail: "Health checks, JSON content, and a place to store messages.", tag: "Backend" },
      { id: "type", title: "Type and rhythm", detail: "A page should be readable before it is clever.", tag: "Design" },
      { id: "preview", title: "Preview first", detail: "Look at the page in the editor before you deploy it.", tag: "Workflow" },
    ],
  },
  {
    id: "store",
    label: "Store",
    description: "Catalog, cart, and orders",
    defaultName: "Atelier Goods",
    defaultTagline: "Objects made to be used every day.",
    accent: "#8fd18a",
    catalogTitle: "In the shop",
    about: "The catalog comes from the API. The cart lives in the browser until checkout posts an order.",
    formTitle: "Ask about an order",
    items: [
      { id: "mug", title: "Stoneware mug", detail: "Speckled clay, holds 300ml.", price: "$28", tag: "Home" },
      { id: "tote", title: "Canvas tote", detail: "Heavy cotton with an interior pocket.", price: "$42", tag: "Carry" },
      { id: "lamp", title: "Desk lamp", detail: "Warm bulb and a brass stem.", price: "$96", tag: "Light" },
      { id: "notebook", title: "Cloth notebook", detail: "Plain pages, lay-flat binding.", price: "$18", tag: "Paper" },
    ],
  },
  {
    id: "booking",
    label: "Booking",
    description: "Services and appointment requests",
    defaultName: "Cedar Clinic",
    defaultTagline: "Care you can schedule in a few clicks.",
    accent: "#7fd0e0",
    catalogTitle: "Services",
    about: "Pick a service, then send a request. The API stores it until a coordinator confirms the time.",
    formTitle: "Request a time",
    items: [
      { id: "consult", title: "New patient visit", detail: "45 minutes with a clinician.", price: "$120", tag: "45 min" },
      { id: "follow", title: "Follow-up", detail: "20 minutes to review progress.", price: "$70", tag: "20 min" },
      { id: "lab", title: "Lab review", detail: "Walk through results and next steps.", price: "$55", tag: "15 min" },
      { id: "virtual", title: "Virtual check-in", detail: "Video visit from home.", price: "$60", tag: "20 min" },
    ],
  },
];

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "website";
}

export function generateWebsite(brief: WebsiteBrief): GeneratedWebsite {
  const blueprint = WEBSITE_BLUEPRINTS.find((entry) => entry.id === brief.kind) ?? WEBSITE_BLUEPRINTS[1];
  const name = brief.name.trim().slice(0, 60) || blueprint.defaultName;
  const tagline = (brief.tagline ?? blueprint.defaultTagline).trim().slice(0, 140);
  const slug = slugify(name);
  const items = blueprint.items.map((item, index) => ({
    ...item,
    image: `https://picsum.photos/seed/${slug}-${index + 1}/960/640`,
  }));
  const site = { name, tagline, kind: blueprint.id, slug };
  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(blueprint, site) },
    { path: "client/styles.css", language: "css", content: renderCss(blueprint.accent) },
    { path: "client/script.js", language: "javascript", content: renderClientScript(site, items) },
    { path: "server/server.js", language: "javascript", content: renderServer(site, items) },
    { path: "server/package.json", language: "json", content: renderPackageJson(site, tagline) },
    { path: "README.md", language: "markdown", content: renderReadme(blueprint, site, tagline) },
  ];

  return {
    kind: blueprint.id,
    name,
    slug,
    tagline,
    summary: summarizeWebsite({ kind: blueprint.id, name, slug, tagline, summary: "", files }),
    files,
  };
}

export function summarizeWebsite(site: Pick<GeneratedWebsite, "kind" | "name" | "files">): string {
  const fileList = site.files.map((file) => `- \`${file.path}\``).join("\n");
  return [
    `Built **${site.name}**, a full-stack ${site.kind} website. The client and API are in the editor, and the preview is open.`,
    "",
    fileList,
    "",
    "The page reads `GET /api/items` and posts messages to `POST /api/leads`. If the API is offline, the page uses the copy bundled in `client/script.js`.",
    "",
    "Run it locally with `node server/server.js`, then open http://localhost:3000.",
  ].join("\n");
}

export function websiteToMarkdown(site: GeneratedWebsite): string {
  const blocks = site.files
    .map((file) => `${file.path}\n\`\`\`${file.language}\n${file.content.trim()}\n\`\`\``)
    .join("\n\n");
  return `${site.summary}\n\n${blocks}`;
}

export function websiteToProjectTree(site: GeneratedWebsite): ProjectNode[] {
  return site.files.reduce<ProjectNode[]>((tree, file) => insertFile(tree, file), []);
}

/** Client files only, keyed by path and filename, for the in-editor preview. */
export function websitePreviewFiles(site: GeneratedWebsite): Record<string, string> {
  const files: Record<string, string> = {};
  for (const file of site.files) {
    if (!file.path.startsWith("client/")) continue;
    files[file.path] = file.content;
    const base = file.path.split("/").pop() || file.path;
    if (!files[base]) files[base] = file.content;
  }
  return files;
}

export function matchWebsiteRequest(text: string): WebsiteBrief | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  const asksToBuild = /\b(build|create|generate|make|scaffold|spin up)\b/.test(normalized);
  const mentionsSite = /\b(website|web site|landing page|full-stack site|fullstack site)\b/.test(normalized);
  if (!asksToBuild || !mentionsSite) return null;
  if (/\b(todo|counter|calculator|button)\b/.test(normalized) && !/\bwebsite\b/.test(normalized)) return null;

  let kind: WebsiteKind = "landing";
  const kindMatchers: Array<[RegExp, WebsiteKind]> = [
    [/portfolio/, "portfolio"],
    [/\b(restaurant|cafe)\b/, "restaurant"],
    [/\b(blog|journal)\b/, "blog"],
    [/\b(store|shop|ecommerce|e-commerce|catalog)\b/, "store"],
    [/\b(booking|appointment|clinic|salon)\b/, "booking"],
    [/landing|saas|startup|marketing/, "landing"],
  ];
  for (const [pattern, matched] of kindMatchers) {
    if (pattern.test(normalized)) {
      kind = matched;
      break;
    }
  }

  const blueprint = WEBSITE_BLUEPRINTS.find((entry) => entry.id === kind)!;
  const nameMatch = text.match(/\b(?:called|named|titled|for)\s+["']?([^"'\n]+)/i);
  const name = cleanCapturedName(nameMatch?.[1], blueprint.defaultName);
  return { kind, name, tagline: blueprint.defaultTagline };
}

function cleanCapturedName(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const trimmed = raw
    .replace(/\s+(with|using|that|and)\b[\s\S]*$/i, "")
    .replace(/[.?!,]+$/g, "")
    .trim();
  const withoutArticle = trimmed.replace(/^(a|an|the)\s+/i, "");
  if (!withoutArticle || /^(website|site|page|clinic|restaurant|store|blog|portfolio|landing)$/i.test(withoutArticle)) {
    return fallback;
  }
  return withoutArticle.slice(0, 60);
}

function insertFile(nodes: ProjectNode[], file: GeneratedFile): ProjectNode[] {
  const parts = file.path.split("/").filter(Boolean);
  const fileName = parts[parts.length - 1];
  const folders = parts.slice(0, -1);

  const ensure = (list: ProjectNode[], folderParts: string[], prefix: string): ProjectNode[] => {
    if (folderParts.length === 0) {
      const id = prefix ? `${prefix}/${fileName}` : fileName;
      const next = list.filter((node) => node.id !== id);
      next.push({ id, name: fileName, type: "file", language: file.language, content: file.content });
      return next;
    }
    const [head, ...rest] = folderParts;
    const id = prefix ? `${prefix}/${head}` : head;
    const existing = list.find((node) => node.id === id && node.type === "folder");
    if (!existing) {
      return [
        ...list,
        { id, name: head, type: "folder", isOpen: true, children: ensure([], rest, id) },
      ];
    }
    return list.map((node) =>
      node.id === id ? { ...node, isOpen: true, children: ensure(node.children ?? [], rest, id) } : node,
    );
  };

  return ensure(nodes, folders, "");
}

function renderHtml(blueprint: Blueprint, site: { name: string; tagline: string; kind: WebsiteKind }): string {
  const name = escapeHtml(site.name);
  const tagline = escapeHtml(site.tagline);
  const pricing = blueprint.id === "landing" ? pricingSection() : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name}</title>
  <meta name="description" content="${tagline}">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="dark">
  <header class="nav">
    <a class="brand" href="#top">${name}</a>
    <nav>
      <a href="#catalog">${escapeHtml(blueprint.catalogTitle)}</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <p class="eyebrow">${escapeHtml(blueprint.label)} website</p>
      <h1>${name}</h1>
      <p class="lede">${tagline}</p>
      <a class="button" href="#catalog">${escapeHtml(blueprint.catalogTitle)}</a>
    </section>
    <section class="section" id="work">
      <div class="section-head">
        <h2>${escapeHtml(blueprint.catalogTitle)}</h2>
      </div>
      <div id="catalog" class="grid"></div>
      <aside id="cart" hidden></aside>
    </section>
    ${pricing}
    <section class="section split" id="about">
      <h2>About</h2>
      <p>${escapeHtml(blueprint.about)}</p>
    </section>
    <section class="section" id="contact">
      <h2>${escapeHtml(blueprint.formTitle)}</h2>
      <form id="lead-form">
        <label>Name<input name="name" required autocomplete="name"></label>
        <label>Email<input name="email" type="email" required autocomplete="email"></label>
        <label>Message<textarea name="message" rows="4" required></textarea></label>
        <button class="button" type="submit">Send</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <span>${name}</span>
    <span>© <span id="year"></span></span>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function pricingSection(): string {
  return `<section class="section" id="pricing">
      <div class="section-head"><h2>Pricing</h2></div>
      <div class="grid plans">
        <article class="card"><div><p class="tag">Start</p><h3>Studio</h3><p>One site, the API, and the README.</p><p class="price">$0</p></div></article>
        <article class="card"><div><p class="tag">Team</p><h3>Practice</h3><p>Custom name, menu or catalog, and lead capture.</p><p class="price">$29</p></div></article>
        <article class="card"><div><p class="tag">Launch</p><h3>Production</h3><p>Run the Node server and point a domain at it.</p><p class="price">$79</p></div></article>
      </div>
    </section>`;
}

function renderCss(accent: string): string {
  return `:root {
  --bg: #10140f;
  --ink: #f4f1ea;
  --muted: #b7b1a6;
  --line: rgba(244, 241, 234, 0.14);
  --accent: ${accent};
  --card: #191e18;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
  background: radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 50%), var(--bg);
  color: var(--ink);
}
a { color: inherit; }
img { width: 100%; height: 180px; object-fit: cover; display: block; background: #222; }
.nav, footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px 7vw;
}
.nav { position: sticky; top: 0; backdrop-filter: blur(10px); background: rgba(16, 20, 15, 0.8); border-bottom: 1px solid var(--line); }
.brand { font-weight: 700; text-decoration: none; letter-spacing: -0.03em; }
nav { display: flex; gap: 16px; font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 14px; }
nav a { text-decoration: none; color: var(--muted); }
.hero, .section { padding: 64px 7vw; }
.hero h1 { font-size: clamp(42px, 7vw, 84px); line-height: 0.95; margin: 8px 0 16px; letter-spacing: -0.04em; }
.lede, .section p { color: var(--muted); font-family: "Avenir Next", "Segoe UI", sans-serif; line-height: 1.6; }
.eyebrow, .tag { color: var(--accent); font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; }
.button {
  display: inline-flex;
  align-items: center;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--accent);
  color: #122018;
  font-family: "Avenir Next", "Segoe UI", sans-serif;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.section-head h2, .section h2 { margin-top: 0; font-size: 32px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
}
.card div, form, #cart { padding: 16px; }
.price { color: var(--ink); font-family: "Avenir Next", "Segoe UI", sans-serif; }
.split { display: grid; grid-template-columns: minmax(160px, 240px) 1fr; gap: 24px; align-items: start; }
form { display: grid; gap: 12px; max-width: 520px; padding: 0; }
label { display: grid; gap: 6px; font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 14px; }
input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  background: #0d110c;
  color: var(--ink);
  font: inherit;
}
#cart { margin-top: 16px; border: 1px solid var(--line); border-radius: 18px; }
footer { border-top: 1px solid var(--line); color: var(--muted); font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 14px; }
@media (max-width: 720px) {
  .split { grid-template-columns: 1fr; }
  nav { display: none; }
}
`;
}

function renderClientScript(site: { name: string; tagline: string; kind: string; slug: string }, items: CatalogItem[]): string {
  const payload = embedJson({ site, items });
  return `/* Generated by the Lunor.AI website generator. */
(function () {
  var FALLBACK = ${payload};

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(list) {
    var root = document.getElementById("catalog");
    if (!root) return;
    root.innerHTML = list.map(function (item) {
      var price = item.price ? '<p class="price">' + esc(item.price) + "</p>" : "";
      var add = FALLBACK.site.kind === "store"
        ? '<button type="button" data-add="' + esc(item.id) + '">Add to cart</button>'
        : "";
      return '<article class="card"><img src="' + esc(item.image) + '" alt="' + esc(item.title) + '"><div><p class="tag">' + esc(item.tag || "") + "</p><h3>" + esc(item.title) + "</h3><p>" + esc(item.detail) + "</p>" + price + add + "</div></article>";
    }).join("");
  }

  function load(path, fallback) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error("offline");
      return res.json();
    }).catch(function () {
      return fallback;
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  load("/api/items", FALLBACK.items).then(render);

  var form = document.getElementById("lead-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = document.getElementById("form-status");
      var body = {};
      new FormData(form).forEach(function (value, key) { body[key] = String(value); });
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function (res) {
        if (!res.ok) throw new Error("failed");
        if (status) status.textContent = "Saved on the server.";
        form.reset();
      }).catch(function () {
        if (status) status.textContent = "API is offline. Start it with node server/server.js.";
      });
    });
  }

  if (FALLBACK.site.kind === "store") {
    var cart = [];
    var cartEl = document.getElementById("cart");
    var catalog = document.getElementById("catalog");
    if (cartEl) cartEl.hidden = false;
    function paintCart() {
      if (!cartEl) return;
      var count = cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
      cartEl.innerHTML = "<h2>Cart</h2><p>" + count + " item(s)</p>" + cart.map(function (line) {
        return "<p>" + esc(line.title) + " × " + line.qty + "</p>";
      }).join("") + '<button type="button" id="checkout">Checkout</button>';
      var checkout = document.getElementById("checkout");
      if (checkout) {
        checkout.addEventListener("click", function () {
          fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "order", items: cart })
          }).then(function (res) {
            if (!res.ok) throw new Error("failed");
            cart = [];
            paintCart();
          }).catch(function () {
            var status = document.getElementById("form-status");
            if (status) status.textContent = "API is offline. The cart stayed in this browser.";
          });
        });
      }
    }
    if (catalog) {
      catalog.addEventListener("click", function (event) {
        var button = event.target.closest("[data-add]");
        if (!button) return;
        var id = button.getAttribute("data-add");
        var item = FALLBACK.items.find(function (entry) { return entry.id === id; });
        if (!item) return;
        var line = cart.find(function (entry) { return entry.id === id; });
        if (line) line.qty += 1;
        else cart.push({ id: item.id, title: item.title, qty: 1 });
        paintCart();
      });
    }
    paintCart();
  }
})();
`;
}

function renderServer(site: { name: string; tagline: string; kind: string; slug: string }, items: CatalogItem[]): string {
  return `/**
 * ${site.name} API
 * Generated by the Lunor.AI website generator.
 * Run: node server/server.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, "..", "client");
const SITE = ${embedJson(site)};
const ITEMS = ${embedJson(items)};
const leads = [];

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch (error) { reject(error); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 400, JSON.stringify({ error: "Missing URL" }));
  if (req.method === "OPTIONS") return send(res, 204, "");

  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/health" && req.method === "GET") {
    return send(res, 200, JSON.stringify({ ok: true, site: SITE.slug }));
  }
  if (url.pathname === "/api/site" && req.method === "GET") {
    return send(res, 200, JSON.stringify(SITE));
  }
  if (url.pathname === "/api/items" && req.method === "GET") {
    return send(res, 200, JSON.stringify(ITEMS));
  }
  if (url.pathname === "/api/leads" && req.method === "POST") {
    try {
      const lead = await readBody(req);
      const saved = { id: "lead_" + (leads.length + 1), ...lead };
      leads.push(saved);
      return send(res, 201, JSON.stringify(saved));
    } catch {
      return send(res, 400, JSON.stringify({ error: "Expected JSON" }));
    }
  }
  if (url.pathname.startsWith("/api/")) {
    return send(res, 404, JSON.stringify({ error: "Not found" }));
  }

  let requested = "/index.html";
  try {
    requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  } catch {
    return send(res, 400, "Bad path", "text/plain; charset=utf-8");
  }
  const filePath = path.resolve(ROOT, "." + requested);
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (filePath !== ROOT && !filePath.startsWith(rootWithSep)) {
    return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) return send(res, 404, "Not found", "text/plain; charset=utf-8");
    send(res, 200, data, TYPES[path.extname(filePath)] || "application/octet-stream");
  });
});

server.listen(PORT, () => {
  console.log(SITE.name + " running at http://localhost:" + PORT);
});
`;
}

function renderPackageJson(site: { name: string; slug: string }, tagline: string): string {
  return JSON.stringify(
    {
      name: site.slug,
      private: true,
      version: "1.0.0",
      description: tagline,
      scripts: { start: "node server.js" },
    },
    null,
    2,
  ) + "\n";
}

function renderReadme(
  blueprint: Blueprint,
  site: { name: string; kind: string },
  tagline: string,
): string {
  return `# ${site.name}

${tagline}

Full-stack ${blueprint.label.toLowerCase()} website generated by the Lunor.AI Web Development assistant.

## Stack

- \`client/index.html\`, \`client/styles.css\`, \`client/script.js\` — the public site
- \`server/server.js\` — Node HTTP API and static file server

## Run

\`\`\`bash
node server/server.js
\`\`\`

Open http://localhost:3000

## API

- \`GET /api/health\`
- \`GET /api/site\`
- \`GET /api/items\`
- \`POST /api/leads\` with a JSON body such as \`{"name":"Ada","email":"ada@example.com","message":"Hello"}\`

The page still renders its catalog if the API is not running. Submitting the form needs the server.
`;
}

function embedJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
