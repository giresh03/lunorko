/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a previewable client (HTML/CSS/JS) and a Node API that serves it.
 * The client falls back to the same sample data when the API is offline,
 * so the in-editor preview works before `node server/server.js`.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "store" | "blog" | "dashboard";

export interface WebsiteBlueprint {
  id: WebsiteKind;
  name: string;
  description: string;
  icon: string;
}

export interface WebsiteFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  files: WebsiteFile[];
  summary: string;
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

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  { id: "landing", name: "Landing page", description: "Hero, features, pricing, contact API", icon: "🚀" },
  { id: "portfolio", name: "Portfolio", description: "Project grid from the API", icon: "🎨" },
  { id: "restaurant", name: "Restaurant", description: "Menu and reservation note", icon: "🍽️" },
  { id: "store", name: "Storefront", description: "Catalog and cart API", icon: "🛍️" },
  { id: "blog", name: "Blog", description: "Posts from the API", icon: "✍️" },
  { id: "dashboard", name: "Dashboard", description: "Stats cards from the API", icon: "📊" },
];

const PHOTO = {
  desk: "1461749280684-dccba630e2f6",
  laptop: "1498050108023-c5249f4df085",
  code: "1517694712202-14dd9538aa97",
  team: "1522202176988-66273c2fd55f",
  startup: "1553877522-43269d4ea984",
  shop: "1441986300917-64674bd600d8",
  creative: "1558618666-fcd25c85f1d7",
  books: "1481627834876-b7833e8f5570",
  bread: "1504674900247-0877df9cc836",
  plate: "1414235077428-338989a2e8c0",
  dining: "1476224203421-9ac39bcb3327",
  pizza: "1565299624946-b28f40a0ae38",
} as const;

interface CatalogItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  tag: string;
  price?: number;
  body?: string;
}

interface SiteModel {
  kind: WebsiteKind;
  title: string;
  tagline: string;
  items: CatalogItem[];
  plans: { name: string; price: string; detail: string }[];
}

function photo(id: string, w = 1200, h = 800) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slug(value: string) {
  const out = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return out || "lunor-site";
}

export function defaultWebsiteTitle(kind: WebsiteKind) {
  switch (kind) {
    case "landing": return "Northstar";
    case "portfolio": return "Atelier";
    case "restaurant": return "Hearth & Rye";
    case "store": return "Harbor Goods";
    case "blog": return "Fieldnotes";
    case "dashboard": return "Northstar Ops";
  }
}

const KIND_RULES: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "restaurant", pattern: /\b(restaurant|cafe|café|bistro|menu)\b/i },
  { kind: "dashboard", pattern: /\b(dashboard|analytics|admin panel)\b/i },
  { kind: "portfolio", pattern: /\bportfolio\b/i },
  { kind: "store", pattern: /\b(store|storefront|shop|e-?commerce|cart)\b/i },
  { kind: "blog", pattern: /\b(blog|articles?)\b/i },
  { kind: "landing", pattern: /\b(landing|marketing|homepage|saas)\b/i },
];

/** True when the assistant should run the local website automation instead of the model. */
export function isWebsiteGenerationRequest(text: string) {
  const value = text.trim();
  if (value.length < 8 || value.length > 500) return false;
  const asks = /\b(generat\w*|build|create|make|scaffold|design)\b/i.test(value);
  const site = /\b(full[-\s]?stack|websites?|web\s?sites?|landing pages?|portfolios?|storefronts?|blogs?|restaurants?|dashboards?)\b/i.test(value);
  return asks && site;
}

export function parseWebsiteRequest(text: string): { kind: WebsiteKind; name?: string } {
  const kind = KIND_RULES.find((rule) => rule.pattern.test(text))?.kind ?? "landing";
  const quoted = text.match(/["“]([^"”]{2,48})["”]/);
  const forMatch = text.match(/\bfor\s+(.+?)(?:\s+with\b|[.!]|$)/i);
  let name = quoted?.[1] || forMatch?.[1] || "";
  name = name
    .replace(/\b(a|an|the|full-stack|fullstack|website|site|landing page|restaurant|portfolio|store|blog|dashboard)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (name.length < 2) return { kind };
  return { kind, name };
}

function buildModel(kind: WebsiteKind, title: string): SiteModel {
  const sharedPlans = [
    { name: "Starter", price: "$0", detail: "Preview, one project, community support" },
    { name: "Studio", price: "$19", detail: "Custom domain, API access, email capture" },
    { name: "Scale", price: "$49", detail: "Team seats, analytics, priority deploys" },
  ];

  if (kind === "restaurant") {
    return {
      kind, title,
      tagline: "A short menu, a wood oven, and tables that turn over slowly.",
      plans: sharedPlans,
      items: [
        { id: "bread", title: "Hearth bread", summary: "Warm loaf, cultured butter, flaky salt.", image: photo(PHOTO.bread), tag: "Bake", price: 9 },
        { id: "plate", title: "Market plate", summary: "Greens, citrus, and whatever came in this morning.", image: photo(PHOTO.plate), tag: "Plate", price: 16 },
        { id: "pasta", title: "Rye pasta", summary: "Brown butter, sage, and a soft egg.", image: photo(PHOTO.dining), tag: "Pasta", price: 22 },
        { id: "pie", title: "Tomato pie", summary: "Slow sauce, basil, and a blistered crust.", image: photo(PHOTO.pizza), tag: "Oven", price: 18 },
      ],
    };
  }

  if (kind === "dashboard") {
    return {
      kind, title,
      tagline: "Live counts from the API, with sample numbers when the server is off.",
      plans: sharedPlans,
      items: [
        { id: "visitors", title: "Visitors", summary: "1,284 people opened the site this week.", image: photo(PHOTO.desk), tag: "Traffic" },
        { id: "signups", title: "Signups", summary: "86 new accounts since Monday.", image: photo(PHOTO.team), tag: "Growth" },
        { id: "revenue", title: "Revenue", summary: "Paid plans collected this month.", image: photo(PHOTO.startup), tag: "Billing", price: 12400 },
        { id: "tickets", title: "Open tickets", summary: "12 waiting on a reply.", image: photo(PHOTO.laptop), tag: "Support" },
      ],
    };
  }

  if (kind === "portfolio") {
    return {
      kind, title,
      tagline: "Selected work in product, brand, and interface design.",
      plans: sharedPlans,
      items: [
        { id: "lumen", title: "Lumen Analytics", summary: "Dashboard for a climate lab. Dark UI, live charts, keyboard shortcuts.", image: photo(PHOTO.laptop), tag: "Product" },
        { id: "folio", title: "Folio Press", summary: "Editorial site with a reading progress bar and print styles.", image: photo(PHOTO.books), tag: "Editorial" },
        { id: "harbor", title: "Harbor Market", summary: "Storefront grid, filters, and a cart that survives refresh.", image: photo(PHOTO.shop), tag: "Commerce" },
        { id: "signal", title: "Signal Studio", summary: "Marketing page with a particle field and case-study layout.", image: photo(PHOTO.creative), tag: "Brand" },
      ],
    };
  }

  if (kind === "store") {
    return {
      kind, title,
      tagline: "Objects for a quieter desk. Ships in two days.",
      plans: sharedPlans,
      items: [
        { id: "lamp", title: "Arc lamp", summary: "Brass arm, warm LED, dimmer in the base.", image: photo(PHOTO.creative), tag: "Lighting", price: 84 },
        { id: "notebook", title: "Field notebook", summary: "120 pages, lay-flat binding, dot grid.", image: photo(PHOTO.books), tag: "Paper", price: 18 },
        { id: "mug", title: "Stone mug", summary: "Speckled ceramic. Holds 12 oz.", image: photo(PHOTO.startup), tag: "Home", price: 26 },
        { id: "tote", title: "Canvas tote", summary: "Heavy cotton, one pocket, natural dye.", image: photo(PHOTO.shop), tag: "Carry", price: 32 },
      ],
    };
  }

  if (kind === "blog") {
    return {
      kind, title,
      tagline: "Notes on building small websites that stay fast.",
      plans: sharedPlans,
      items: [
        { id: "preview-first", title: "Preview first, API second", summary: "Ship the page so it renders with sample data, then point it at the server.", image: photo(PHOTO.desk), tag: "Practice", body: "A page that only works after the API boots is hard to demo. Seed the client with the same records the server returns. Fetch, and if the network fails, render the seed." },
        { id: "one-folder", title: "One folder for the client", summary: "HTML, CSS, and JS that the editor can preview without a build step.", image: photo(PHOTO.code), tag: "Structure", body: "Keep the browser files in client/. The server reads that folder and sends index.html for every non-API route. No bundler required." },
        { id: "routes", title: "Routes that match the page", summary: "If the page asks for /api/posts, the server should answer with posts.", image: photo(PHOTO.team), tag: "API", body: "Name the endpoints after what the screen shows. Health, the collection, and one write route are enough for a first version." },
      ],
    };
  }

  return {
    kind: "landing",
    title,
    tagline: "A full-stack starter: marketing page in the browser, JSON API in Node.",
    plans: sharedPlans,
    items: [
      { id: "preview", title: "Live preview", summary: "The page renders in the editor with sample data before you start the server.", image: photo(PHOTO.desk), tag: "Client" },
      { id: "api", title: "JSON API", summary: "Node serves /api/health, features, and a contact inbox. No extra packages.", image: photo(PHOTO.laptop), tag: "Server" },
      { id: "files", title: "Real files", summary: "client/ and server/ land in the project so you can edit and run them locally.", image: photo(PHOTO.code), tag: "Project" },
    ],
  };
}

function styles(): string {
  return `/* Generated by the Web Development website automation */
:root {
  --bg: #0b1020;
  --card: #141a2e;
  --text: #eef2ff;
  --muted: #a3acc4;
  --line: rgba(255, 255, 255, 0.08);
  --accent: #3ee0b0;
  --accent-ink: #06281f;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, rgba(62, 224, 176, 0.18), transparent 55%),
    var(--bg);
  color: var(--text);
  line-height: 1.5;
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; object-fit: cover; }
.wrap { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0;
}
.brand { font-weight: 700; letter-spacing: -0.03em; }
nav { display: flex; gap: 16px; color: var(--muted); font-size: 14px; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center; padding: 28px 0 12px; }
.hero h1 { font-size: clamp(36px, 5vw, 58px); line-height: 1.05; margin: 0 0 12px; letter-spacing: -0.04em; }
.lede { color: var(--muted); font-size: 18px; max-width: 46ch; }
.actions { display: flex; gap: 10px; margin-top: 18px; }
button, .btn {
  border: 0; border-radius: 999px; padding: 10px 16px; font: inherit; cursor: pointer;
  background: var(--accent); color: var(--accent-ink); font-weight: 650;
}
.btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
.hero-card { border-radius: 18px; overflow: hidden; border: 1px solid var(--line); min-height: 280px; background: #000; }
.hero-card img { width: 100%; height: 340px; }
section { padding: 28px 0; }
h2 { margin: 0 0 6px; letter-spacing: -0.03em; }
.sub { color: var(--muted); margin: 0 0 16px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.grid.two { grid-template-columns: repeat(2, 1fr); }
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: 16px; overflow: hidden;
}
.card img { width: 100%; height: 160px; }
.card .pad, .plan { padding: 14px 16px 16px; }
.tag { color: var(--accent); font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
.price { font-size: 28px; margin: 8px 0; }
.plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.plan { background: var(--card); border: 1px solid var(--line); border-radius: 16px; }
form, .reader { display: grid; gap: 10px; max-width: 560px; }
input, textarea {
  width: 100%; border-radius: 12px; border: 1px solid var(--line);
  background: #0e1426; color: var(--text); padding: 12px 14px; font: inherit;
}
.note { min-height: 1.2em; color: var(--accent); font-size: 14px; }
footer { border-top: 1px solid var(--line); color: var(--muted); padding: 22px 0 36px; font-size: 13px; }
@media (max-width: 800px) {
  .hero, .grid, .grid.two, .plans { grid-template-columns: 1fr; }
  nav { display: none; }
}
`;
}

function pageHtml(model: SiteModel) {
  const nav = model.kind === "store"
    ? `<a href="#catalog">Shop</a><a href="#cart">Cart</a>`
    : model.kind === "blog"
      ? `<a href="#catalog">Notes</a><a href="#reader">Read</a>`
      : model.kind === "portfolio"
        ? `<a href="#catalog">Work</a><a href="#contact">Contact</a>`
        : model.kind === "restaurant"
          ? `<a href="#catalog">Menu</a><a href="#contact">Reserve</a>`
          : model.kind === "dashboard"
            ? `<a href="#catalog">Metrics</a>`
            : `<a href="#catalog">Features</a><a href="#pricing">Pricing</a><a href="#contact">Contact</a>`;

  const contactTitle = model.kind === "restaurant" ? "Request a table" : model.kind === "portfolio" ? "Start a project" : "Talk to us";
  const contactPlaceholder = model.kind === "restaurant" ? "Party size and time" : "What should we build?";
  const contactBlock = `
    <section id="contact">
      <div class="wrap">
        <h2>${contactTitle}</h2>
        <p class="sub">Posts to <code>/api/contact</code>. Saved in memory on the server.</p>
        <form id="contact-form">
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <textarea name="message" rows="4" placeholder="${contactPlaceholder}" required></textarea>
          <button type="submit">Send</button>
          <p class="note" id="form-note"></p>
        </form>
      </div>
    </section>`;
  const extra = model.kind === "landing"
    ? `
    <section id="pricing">
      <div class="wrap">
        <h2>Pricing</h2>
        <p class="sub">Start free. Upgrade when the API needs a real inbox.</p>
        <div class="plans" id="plans"></div>
      </div>
    </section>${contactBlock}`
    : model.kind === "portfolio" || model.kind === "restaurant"
      ? contactBlock
      : model.kind === "store"
        ? `
    <section id="cart">
      <div class="wrap">
        <h2>Cart</h2>
        <p class="sub">Adds post to <code>/api/cart</code>.</p>
        <div id="cart-list" class="grid"></div>
        <p class="note" id="form-note"></p>
      </div>
    </section>`
        : model.kind === "blog"
          ? `
    <section id="reader">
      <div class="wrap">
        <h2>Reader</h2>
        <article class="reader card pad" id="reader-body"><p class="sub">Choose a note.</p></article>
      </div>
    </section>`
          : "";

  const catalogTitle = model.kind === "store"
    ? "Catalog"
    : model.kind === "blog"
      ? "Latest notes"
      : model.kind === "portfolio"
        ? "Selected work"
        : model.kind === "restaurant"
          ? "Menu"
          : model.kind === "dashboard"
            ? "This week"
            : "What you get";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(model.title)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="1">
  <div class="wrap">
    <header>
      <a class="brand" href="#top">${esc(model.title)}</a>
      <nav>${nav}</nav>
    </header>
  </div>
  <main id="top">
    <section class="hero wrap">
      <div>
        <p class="tag">${esc(model.kind)}</p>
        <h1>${esc(model.title)}</h1>
        <p class="lede">${esc(model.tagline)}</p>
        <div class="actions">
          <a class="btn" href="#catalog">Explore</a>
          <a class="btn ghost" href="#catalog">View data</a>
        </div>
      </div>
      <div class="hero-card">
        <img src="${esc(model.items[0]?.image || photo(PHOTO.desk))}" alt="${esc(model.title)} hero" />
      </div>
    </section>
    <section id="catalog">
      <div class="wrap">
        <h2>${catalogTitle}</h2>
        <p class="sub">Loaded from the API when the server is running. Sample data otherwise.</p>
        <div id="catalog-grid" class="grid"></div>
      </div>
    </section>
    ${extra}
  </main>
  <footer><div class="wrap">${esc(model.title)} · client in <code>client/</code> · API in <code>server/server.js</code></div></footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function clientScript(model: SiteModel) {
  const payload = {
    kind: model.kind,
    title: model.title,
    items: model.items,
    plans: model.plans,
  };
  return `/* Browser client. Falls back to SEED when /api is unreachable (editor preview). */
const SEED = ${JSON.stringify(payload, null, 2)};

async function loadJson(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch {
    return fallback;
  }
}

function card(item) {
  const price = typeof item.price === "number" ? "<p class=\\"price\\">$" + item.price + "</p>" : "";
  const action = SEED.kind === "store"
    ? '<button type="button" data-add="' + item.id + '">Add to cart</button>'
    : SEED.kind === "blog"
      ? '<button type="button" data-read="' + item.id + '">Read</button>'
      : "";
  return '<article class="card"><img src="' + item.image + '" alt="" loading="lazy" /><div class="pad"><p class="tag">' +
    item.tag + "</p><h3>" + item.title + "</h3><p>" + item.summary + "</p>" + price + action + "</div></article>";
}

async function renderCatalog() {
  const data = await loadJson("/api/items", { items: SEED.items });
  const items = data.items || SEED.items;
  const grid = document.getElementById("catalog-grid");
  if (grid) grid.innerHTML = items.map(card).join("");
  const plans = document.getElementById("plans");
  if (plans) {
    plans.innerHTML = SEED.plans.map((plan) =>
      '<article class="plan"><p class="tag">Plan</p><h3>' + plan.name + '</h3><p class="price">' + plan.price + "</p><p>" + plan.detail + "</p></article>"
    ).join("");
  }
}

async function renderCart() {
  const box = document.getElementById("cart-list");
  if (!box) return;
  const data = await loadJson("/api/cart", { items: [] });
  const items = data.items || [];
  box.innerHTML = items.length
    ? items.map((item) => "<article class=\\"card pad\\"><h3>" + item.title + "</h3><p>Qty " + item.qty + "</p></article>").join("")
    : "<p class=\\"sub\\">Cart is empty. Add something from the catalog.</p>";
}

function wire() {
  document.body.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const addId = target.getAttribute("data-add");
    const readId = target.getAttribute("data-read");
    if (addId) {
      const item = SEED.items.find((entry) => entry.id === addId);
      const note = document.getElementById("form-note");
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: addId }),
        });
        if (!res.ok) throw new Error("offline");
        if (note) note.textContent = "Added " + (item ? item.title : addId) + ".";
        renderCart();
      } catch {
        if (note) note.textContent = "API offline. Run node server/server.js to save the cart.";
      }
    }
    if (readId) {
      const item = SEED.items.find((entry) => entry.id === readId);
      const reader = document.getElementById("reader-body");
      if (reader && item) {
        reader.innerHTML = "<p class=\\"tag\\">" + item.tag + "</p><h3>" + item.title + "</h3><p>" + (item.body || item.summary) + "</p>";
        reader.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = document.getElementById("form-note");
      const body = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("offline");
        form.reset();
        if (note) note.textContent = "Message stored on the server.";
      } catch {
        if (note) note.textContent = "API offline. Your message stayed in the browser. Start the server to save it.";
      }
    });
  }
}

renderCatalog().then(renderCart);
wire();
`;
}

function serverScript(model: SiteModel) {
  const db = {
    title: model.title,
    kind: model.kind,
    tagline: model.tagline,
    items: model.items,
    plans: model.plans,
  };
  return `/* @lunor-runtime server */
const http = require("http");
const fs = require("fs");
const path = require("path");

const parsedPort = Number(process.env.PORT);
const PORT = Number.isFinite(parsedPort) ? parsedPort : 3000;
const CLIENT_DIR = path.join(__dirname, "..", "client");
const db = ${JSON.stringify(db, null, 2)};
const inbox = [];
const cart = [];

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function send(res, status, body, type) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": type || "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { resolve({}); }
    });
  });
}

function serveStatic(res, urlPath) {
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(CLIENT_DIR, requested));
  if (!filePath.startsWith(CLIENT_DIR)) {
    send(res, 403, { error: "Forbidden" });
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(CLIENT_DIR, "index.html"), (indexErr, index) => {
        if (indexErr) send(res, 404, { error: "Not found" });
        else send(res, 200, index.toString(), TYPES[".html"]);
      });
      return;
    }
    const ext = path.extname(filePath);
    send(res, 200, data.toString(), TYPES[ext] || "application/octet-stream");
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }
  if (url.pathname === "/api/health") {
    send(res, 200, { ok: true, site: db.title, kind: db.kind });
    return;
  }
  if (url.pathname === "/api/items" && req.method === "GET") {
    send(res, 200, { items: db.items });
    return;
  }
  if (url.pathname === "/api/plans" && req.method === "GET") {
    send(res, 200, { plans: db.plans });
    return;
  }
  if (url.pathname === "/api/contact" && req.method === "POST") {
    const body = await readBody(req);
    if (!body.name || !body.email || !body.message) {
      send(res, 400, { error: "name, email, and message are required" });
      return;
    }
    const entry = { id: String(Date.now()), name: String(body.name), email: String(body.email), message: String(body.message) };
    inbox.push(entry);
    send(res, 201, { saved: entry, count: inbox.length });
    return;
  }
  if (url.pathname === "/api/contact" && req.method === "GET") {
    send(res, 200, { messages: inbox });
    return;
  }
  if (url.pathname === "/api/cart" && req.method === "GET") {
    send(res, 200, { items: cart });
    return;
  }
  if (url.pathname === "/api/cart" && req.method === "POST") {
    const body = await readBody(req);
    const item = db.items.find((entry) => entry.id === body.id);
    if (!item) {
      send(res, 404, { error: "Unknown item" });
      return;
    }
    const existing = cart.find((entry) => entry.id === item.id);
    if (existing) existing.qty += 1;
    else cart.push({ id: item.id, title: item.title, price: item.price || 0, qty: 1 });
    send(res, 201, { items: cart });
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    send(res, 404, { error: "No such route" });
    return;
  }
  serveStatic(res, url.pathname);
});

server.listen(PORT, () => {
  const address = server.address();
  const actual = address && typeof address === "object" ? address.port : PORT;
  console.log(db.title + " listening on http://localhost:" + actual);
});
`;
}

function readme(model: SiteModel) {
  return `# ${model.title}

Full-stack ${model.kind} site generated by the Lunor.AI Web Development assistant.

## Preview

Open \`client/index.html\` in the editor preview. The page uses sample data until the API is running.

## Run the API

\`\`\`bash
node server/server.js
\`\`\`

Open http://localhost:3000

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/health | Site name and kind |
| GET | /api/items | Catalog, projects, features, or posts |
| GET | /api/plans | Pricing plans |
| POST | /api/contact | Save a message (\`name\`, \`email\`, \`message\`) |
| GET | /api/cart | Current cart |
| POST | /api/cart | Add an item by \`id\` |

The client and server share the same records. Edit the arrays in \`server/server.js\` and the \`SEED\` object in \`client/app.js\` together.
`;
}

function packageJson(model: SiteModel) {
  return JSON.stringify({
    name: slug(model.title),
    version: "1.0.0",
    private: true,
    description: `${model.title} — full-stack ${model.kind} site`,
    scripts: { start: "node server.js" },
  }, null, 2) + "\n";
}

function summary(model: SiteModel) {
  return `**Full-stack ${model.kind} generated** for **${model.title}**.

The website automation wrote these files:

- \`client/index.html\` — page structure
- \`client/styles.css\` — layout and theme
- \`client/app.js\` — loads \`/api/items\` and falls back to sample data in preview
- \`server/server.js\` — Node API plus static files from \`client/\`
- \`server/package.json\`
- \`README.md\`

Preview is using the client. To save contact messages and cart items, run:

\`\`\`bash
node server/server.js
\`\`\`

Then open http://localhost:3000. Routes: \`GET /api/health\`, \`GET /api/items\`, \`POST /api/contact\`, \`POST /api/cart\`.`;
}

export function generateFullStackWebsite(options: { name?: string; kind: WebsiteKind }): GeneratedWebsite {
  const title = (options.name || "").trim() || defaultWebsiteTitle(options.kind);
  const model = buildModel(options.kind, title);
  const files: WebsiteFile[] = [
    { path: "client/index.html", language: "html", content: pageHtml(model) },
    { path: "client/styles.css", language: "css", content: styles() },
    { path: "client/app.js", language: "javascript", content: clientScript(model) },
    { path: "server/server.js", language: "javascript", content: serverScript(model) },
    { path: "server/package.json", language: "json", content: packageJson(model) },
    { path: "README.md", language: "markdown", content: readme(model) },
  ];
  return { kind: model.kind, title, files, summary: summary(model) };
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
      let node = level.find((entry) => entry.name === part);
      if (!node) {
        node = isFile
          ? { id: file.path, name: part, type: "file", language: file.language, content: file.content }
          : { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        level.push(node);
      }
      if (!isFile) level = node.children || [];
    });
  }
  return root;
}
