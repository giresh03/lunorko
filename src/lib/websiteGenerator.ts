/**
 * Full-stack website generator for the Web Development AI assistant.
 * Scaffolds a previewable client plus an Express API. The page renders
 * from seed data until `npm start` serves `/api` on port 3000.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "store" | "blog" | "dashboard";

export interface WebsiteTemplate {
  id: WebsiteKind;
  label: string;
  description: string;
  defaultName: string;
}

export interface WebsiteFile {
  path: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  name: string;
  files: WebsiteFile[];
  summary: string;
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

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  { id: "landing", label: "Landing", description: "SaaS page with a waitlist API", defaultName: "Lumen" },
  { id: "portfolio", label: "Portfolio", description: "Projects grid and contact API", defaultName: "Northline" },
  { id: "restaurant", label: "Restaurant", description: "Menu and reservation API", defaultName: "Hearth" },
  { id: "store", label: "Store", description: "Catalog and checkout API", defaultName: "Atelier" },
  { id: "blog", label: "Blog", description: "Posts and comments API", defaultName: "Folio" },
  { id: "dashboard", label: "Dashboard", description: "Stats and activity API", defaultName: "Pulse" },
];

const KIND_SET = new Set<string>(WEBSITE_TEMPLATES.map((template) => template.id));

const KIND_PATTERNS: [WebsiteKind, RegExp][] = [
  ["dashboard", /\b(dashboard|analytics|admin panel)\b/i],
  ["blog", /\b(blog|journal)\b/i],
  ["store", /\b(store|shop|e-?commerce|online store)\b/i],
  ["restaurant", /\b(restaurant|cafe|café|diner|bistro)\b/i],
  ["portfolio", /\b(portfolio|personal site|case studies)\b/i],
  ["landing", /\b(landing|saas|startup|waitlist|marketing)\b/i],
];

interface Theme {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  card: string;
  line: string;
  display: string;
  font: string;
}

const THEMES: Record<WebsiteKind, Theme> = {
  landing: { bg: "#0b1020", ink: "#f4f7ff", muted: "#a7b0c9", accent: "#7c5cff", accentInk: "#ffffff", card: "#141a2e", line: "#2a3350", display: "Fraunces", font: "Outfit" },
  portfolio: { bg: "#12100e", ink: "#f6f1ea", muted: "#c4b8aa", accent: "#e8a87c", accentInk: "#1a120c", card: "#1c1916", line: "#3a322b", display: "Fraunces", font: "Outfit" },
  restaurant: { bg: "#1a100c", ink: "#fff6ee", muted: "#e2c7b8", accent: "#e85d4c", accentInk: "#fff8f5", card: "#271812", line: "#4a2c24", display: "Fraunces", font: "Outfit" },
  store: { bg: "#101114", ink: "#f7f4ee", muted: "#c9c2b4", accent: "#d6b25e", accentInk: "#1a160d", card: "#1a1c22", line: "#34363f", display: "Fraunces", font: "Outfit" },
  blog: { bg: "#f6f3ee", ink: "#1c1917", muted: "#57534e", accent: "#0f766e", accentInk: "#f8fffe", card: "#fffdf9", line: "#e7e0d6", display: "Fraunces", font: "Outfit" },
  dashboard: { bg: "#0c1222", ink: "#e8eefc", muted: "#93a0bd", accent: "#38bdf8", accentInk: "#04202c", card: "#141b2e", line: "#26314d", display: "Outfit", font: "Outfit" },
};

function escHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slug(name: string): string {
  const value = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return value || "website";
}

function languageForPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    html: "html", css: "css", js: "javascript", mjs: "javascript",
    json: "json", md: "markdown",
  };
  return map[ext] || "plaintext";
}

function styles(theme: Theme): string {
  return `:root {
  --bg: ${theme.bg};
  --ink: ${theme.ink};
  --muted: ${theme.muted};
  --accent: ${theme.accent};
  --accent-ink: ${theme.accentInk};
  --card: ${theme.card};
  --line: ${theme.line};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: "${theme.font}", sans-serif;
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
.nav, .hero, .section, .footer { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 0; }
.brand { font-family: "${theme.display}", serif; font-size: 1.25rem; letter-spacing: -0.03em; }
.nav nav { display: flex; gap: 18px; color: var(--muted); font-size: 0.92rem; }
.hero { padding: 28px 0 10px; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 28px; align-items: center; }
.hero h1, .section h2, .card h3 { font-family: "${theme.display}", serif; letter-spacing: -0.03em; margin: 0 0 10px; }
.hero h1 { font-size: clamp(2.4rem, 5vw, 4.4rem); line-height: 0.98; }
.lede { color: var(--muted); font-size: 1.05rem; max-width: 46ch; }
.section { padding: 34px 0; }
.section h2 { font-size: 2rem; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.split { grid-template-columns: 1.1fr 0.9fr; }
.card, .panel, form {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
}
.card { overflow: hidden; }
.card img { height: 180px; width: 100%; }
.card div, .panel, form { padding: 16px; }
.card p, .panel p, .muted { color: var(--muted); }
button, .btn {
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  padding: 10px 16px;
  font: inherit;
  cursor: pointer;
}
input, select, textarea {
  width: 100%;
  margin: 6px 0 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font: inherit;
}
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat strong { display: block; font-size: 1.6rem; }
.price { font-size: 1.2rem; color: var(--accent); }
.row { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.footer { padding: 28px 0 40px; color: var(--muted); font-size: 0.9rem; }
.status { min-height: 1.2em; color: var(--accent); }
@media (max-width: 800px) {
  .hero, .grid, .stats, .split { grid-template-columns: 1fr; }
  .nav nav { display: none; }
}
`;
}

function clientHtml(name: string, description: string, theme: Theme, body: string): string {
  const safeName = escHtml(name);
  const safeDescription = escHtml(description);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeName}</title>
  <meta name="description" content="${safeDescription}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
  <header class="nav">
    <div class="brand">${safeName}</div>
    <nav>
      <a href="#work">Work</a>
      <a href="#visit">Visit</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  ${body}
  <footer class="footer">${safeName} · full-stack demo · API on port 3000</footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function packageJson(name: string): string {
  return JSON.stringify({
    name: slug(name),
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: { start: "node server/server.mjs" },
    dependencies: { cors: "^2.8.5", express: "^4.21.2" },
  }, null, 2) + "\n";
}

function readme(name: string, kind: WebsiteKind): string {
  return `# ${name}

Full-stack ${kind} website generated by the Lunor.AI Web Development assistant.

## Preview

The editor preview loads \`client/index.html\` with sample data baked into \`client/app.js\`.

## Run the API

\`\`\`bash
npm install
npm start
\`\`\`

Express serves this site at http://localhost:3000 and the page switches from seed data to \`/api\`.
`;
}

function serverModule(routes: string): string {
  return `import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

${routes}
app.use(express.static(path.join(__dirname, "../client")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
`;
}

const ESC_FN = `function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sandboxed preview has no storage */ }
}
async function load(url, seed) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("offline");
    return await res.json();
  } catch {
    return seed;
  }
}
`;

function landingFiles(name: string, brief: string): WebsiteFile[] {
  const theme = THEMES.landing;
  const blurb = brief || "Ship a calmer product story. One page, a real waitlist API, and a preview that works before the server starts.";
  const html = clientHtml(name, blurb, theme, `
  <section class="hero">
    <div>
      <p class="muted">Product site</p>
      <h1>${escHtml(name)} makes the first click feel obvious.</h1>
      <p class="lede">${escHtml(blurb)}</p>
    </div>
    <form id="waitlist">
      <h3>Join the waitlist</h3>
      <input name="email" type="email" placeholder="you@studio.com" required />
      <button type="submit">Request access</button>
      <p id="status" class="status"></p>
    </form>
  </section>
  <section class="section" id="work">
    <h2>What teams get</h2>
    <div id="features" class="grid"></div>
  </section>`);
  const app = `${ESC_FN}
const SEED = [
  { title: "Guided launch", body: "A narrative homepage with pricing, proof, and a single call to action." },
  { title: "Waitlist API", body: "POST /api/waitlist stores emails in memory while you prototype." },
  { title: "Offline preview", body: "This page still renders if the Express server is not running." }
];
const grid = document.querySelector("#features");
const form = document.querySelector("#waitlist");
const statusEl = document.querySelector("#status");
load("/api/features", SEED).then((items) => {
  grid.innerHTML = items.map((item) => '<article class="card"><div><h3>' + esc(item.title) + '</h3><p>' + esc(item.body) + '</p></div></article>').join("");
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = new FormData(form).get("email");
  try {
    const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (!res.ok) throw new Error("offline");
    statusEl.textContent = "You're on the list.";
  } catch {
    const saved = readStore(${JSON.stringify(slug(name) + "-waitlist")}, []);
    saved.push({ email, at: new Date().toISOString() });
    writeStore(${JSON.stringify(slug(name) + "-waitlist")}, saved);
    statusEl.textContent = "Saved in this browser. Run npm start to sync with /api/waitlist.";
  }
  form.reset();
});
`;
  const server = serverModule(`const features = [
  { title: "Guided launch", body: "A narrative homepage with pricing, proof, and a single call to action." },
  { title: "Waitlist API", body: "POST /api/waitlist stores emails in memory while you prototype." },
  { title: "Offline preview", body: "This page still renders if the Express server is not running." }
];
const waitlist = [];
app.get("/api/features", (_req, res) => res.json(features));
app.get("/api/waitlist", (_req, res) => res.json(waitlist));
app.post("/api/waitlist", (req, res) => {
  const email = String(req.body?.email || "").trim();
  if (!email.includes("@")) return res.status(400).json({ error: "A valid email is required." });
  const entry = { id: Date.now(), email, createdAt: new Date().toISOString() };
  waitlist.unshift(entry);
  res.status(201).json(entry);
});
`);
  return pack(name, "landing", html, styles(theme), app, server);
}

function portfolioFiles(name: string, brief: string): WebsiteFile[] {
  const theme = THEMES.portfolio;
  const blurb = brief || "Selected work across product, brand, and interface design.";
  const html = clientHtml(name, blurb, theme, `
  <section class="hero">
    <div>
      <p class="muted">Portfolio</p>
      <h1>${escHtml(name)} designs products people return to.</h1>
      <p class="lede">${escHtml(blurb)}</p>
    </div>
    <img alt="Studio desk" src="https://picsum.photos/id/1015/960/720" style="border-radius:18px;height:280px;width:100%;object-fit:cover" />
  </section>
  <section class="section" id="work">
    <h2>Selected work</h2>
    <div id="projects" class="grid"></div>
  </section>
  <section class="section" id="contact">
    <h2>Start a project</h2>
    <form id="contact-form">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" rows="4" placeholder="What should we build?" required></textarea>
      <button type="submit">Send</button>
      <p id="status" class="status"></p>
    </form>
  </section>`);
  const app = `${ESC_FN}
const SEED = [
  { title: "Harbor", tag: "Fintech", image: "https://picsum.photos/id/1016/800/500" },
  { title: "Kindred", tag: "Health", image: "https://picsum.photos/id/1036/800/500" },
  { title: "Fieldnote", tag: "Editorial", image: "https://picsum.photos/id/106/800/500" }
];
const grid = document.querySelector("#projects");
const form = document.querySelector("#contact-form");
const statusEl = document.querySelector("#status");
load("/api/projects", SEED).then((items) => {
  grid.innerHTML = items.map((item) => '<article class="card"><img alt="" src="' + esc(item.image) + '" /><div><p class="muted">' + esc(item.tag) + '</p><h3>' + esc(item.title) + '</h3></div></article>').join("");
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("offline");
    statusEl.textContent = "Message received.";
  } catch {
    statusEl.textContent = "Saved locally. Start the server to POST /api/contact.";
  }
  form.reset();
});
`;
  const server = serverModule(`const projects = [
  { title: "Harbor", tag: "Fintech", image: "https://picsum.photos/id/1016/800/500" },
  { title: "Kindred", tag: "Health", image: "https://picsum.photos/id/1036/800/500" },
  { title: "Fieldnote", tag: "Editorial", image: "https://picsum.photos/id/106/800/500" }
];
const messages = [];
app.get("/api/projects", (_req, res) => res.json(projects));
app.get("/api/contact", (_req, res) => res.json(messages));
app.post("/api/contact", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!name || !email.includes("@") || !message) return res.status(400).json({ error: "Name, email, and message are required." });
  const entry = { id: Date.now(), name, email, message, createdAt: new Date().toISOString() };
  messages.unshift(entry);
  res.status(201).json(entry);
});
`);
  return pack(name, "portfolio", html, styles(theme), app, server);
}

function restaurantFiles(name: string, brief: string): WebsiteFile[] {
  const theme = THEMES.restaurant;
  const blurb = brief || "Fire, citrus, and a short menu that changes with the week.";
  const html = clientHtml(name, blurb, theme, `
  <section class="hero">
    <div>
      <p class="muted">Dinner nightly</p>
      <h1>${escHtml(name)}</h1>
      <p class="lede">${escHtml(blurb)}</p>
    </div>
    <img alt="Plated dish" src="https://picsum.photos/id/292/960/720" style="border-radius:18px;height:280px;width:100%;object-fit:cover" />
  </section>
  <section class="section" id="work">
    <h2>Tonight's menu</h2>
    <div id="menu" class="grid"></div>
  </section>
  <section class="section" id="visit">
    <h2>Reserve a table</h2>
    <form id="reserve">
      <input name="name" placeholder="Name" required />
      <input name="guests" type="number" min="1" max="12" value="2" required />
      <input name="time" type="time" value="19:00" required />
      <button type="submit">Request reservation</button>
      <p id="status" class="status"></p>
    </form>
  </section>`);
  const app = `${ESC_FN}
const SEED = [
  { name: "Citrus greens", price: "$14", note: "Fennel, orange, chili" },
  { name: "Hearth chicken", price: "$28", note: "Brown butter, charred lemon" },
  { name: "Olive oil cake", price: "$12", note: "Rosemary, sea salt" }
];
const grid = document.querySelector("#menu");
const form = document.querySelector("#reserve");
const statusEl = document.querySelector("#status");
load("/api/menu", SEED).then((items) => {
  grid.innerHTML = items.map((item) => '<article class="card"><div><div class="row"><h3>' + esc(item.name) + '</h3><span class="price">' + esc(item.price) + '</span></div><p>' + esc(item.note) + '</p></div></article>').join("");
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("offline");
    statusEl.textContent = "Request sent. We'll confirm shortly.";
  } catch {
    statusEl.textContent = "Held in this browser. Run npm start to reach /api/reservations.";
  }
});
`;
  const server = serverModule(`const menu = [
  { name: "Citrus greens", price: "$14", note: "Fennel, orange, chili" },
  { name: "Hearth chicken", price: "$28", note: "Brown butter, charred lemon" },
  { name: "Olive oil cake", price: "$12", note: "Rosemary, sea salt" }
];
const reservations = [];
app.get("/api/menu", (_req, res) => res.json(menu));
app.get("/api/reservations", (_req, res) => res.json(reservations));
app.post("/api/reservations", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const guests = Number(req.body?.guests || 0);
  const time = String(req.body?.time || "");
  if (!name || guests < 1 || !time) return res.status(400).json({ error: "Name, guests, and time are required." });
  const entry = { id: Date.now(), name, guests, time, createdAt: new Date().toISOString() };
  reservations.unshift(entry);
  res.status(201).json(entry);
});
`);
  return pack(name, "restaurant", html, styles(theme), app, server);
}

function storeFiles(name: string, brief: string): WebsiteFile[] {
  const theme = THEMES.store;
  const blurb = brief || "Objects for the desk, the table, and the weekend bag.";
  const html = clientHtml(name, blurb, theme, `
  <section class="hero">
    <div>
      <p class="muted">Shop</p>
      <h1>${escHtml(name)}</h1>
      <p class="lede">${escHtml(blurb)}</p>
      <p id="cart">Cart · 0</p>
    </div>
    <img alt="Shop interior" src="https://picsum.photos/id/201/960/720" style="border-radius:18px;height:280px;width:100%;object-fit:cover" />
  </section>
  <section class="section" id="work">
    <h2>In stock</h2>
    <div id="products" class="grid"></div>
  </section>
  <section class="section" id="contact">
    <h2>Checkout</h2>
    <form id="checkout">
      <input name="email" type="email" placeholder="Email for the receipt" required />
      <button type="submit">Place order</button>
      <p id="status" class="status"></p>
    </form>
  </section>`);
  const app = `${ESC_FN}
const SEED = [
  { id: "lamp", name: "Arc lamp", price: 180, image: "https://picsum.photos/id/1060/800/500" },
  { id: "bowl", name: "Stone bowl", price: 48, image: "https://picsum.photos/id/1080/800/500" },
  { id: "tote", name: "Canvas tote", price: 36, image: "https://picsum.photos/id/250/800/500" }
];
const CART_KEY = ${JSON.stringify(slug(name) + "-cart")};
const grid = document.querySelector("#products");
const cartEl = document.querySelector("#cart");
const form = document.querySelector("#checkout");
const statusEl = document.querySelector("#status");
function readCart() { return readStore(CART_KEY, []); }
function writeCart(items) { writeStore(CART_KEY, items); cartEl.textContent = "Cart · " + items.reduce((sum, item) => sum + item.qty, 0); }
writeCart(readCart());
load("/api/products", SEED).then((items) => {
  grid.innerHTML = items.map((item) => '<article class="card"><img alt="" src="' + esc(item.image) + '" /><div><h3>' + esc(item.name) + '</h3><p class="price">$' + esc(item.price) + '</p><button data-id="' + esc(item.id) + '" data-name="' + esc(item.name) + '" data-price="' + esc(item.price) + '">Add</button></div></article>').join("");
  grid.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    const cart = readCart();
    const id = button.getAttribute("data-id");
    const found = cart.find((item) => item.id === id);
    if (found) found.qty += 1;
    else cart.push({ id, name: button.getAttribute("data-name"), price: Number(button.getAttribute("data-price")), qty: 1 });
    writeCart(cart);
  }));
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const items = readCart();
  if (!items.length) { statusEl.textContent = "Add something first."; return; }
  const payload = { email: new FormData(form).get("email"), items };
  try {
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("offline");
    writeCart([]);
    statusEl.textContent = "Order placed.";
  } catch {
    statusEl.textContent = "Cart kept locally. Run npm start to POST /api/orders.";
  }
});
`;
  const server = serverModule(`const products = [
  { id: "lamp", name: "Arc lamp", price: 180, image: "https://picsum.photos/id/1060/800/500" },
  { id: "bowl", name: "Stone bowl", price: 48, image: "https://picsum.photos/id/1080/800/500" },
  { id: "tote", name: "Canvas tote", price: 36, image: "https://picsum.photos/id/250/800/500" }
];
const orders = [];
app.get("/api/products", (_req, res) => res.json(products));
app.get("/api/orders", (_req, res) => res.json(orders));
app.post("/api/orders", (req, res) => {
  const email = String(req.body?.email || "").trim();
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!email.includes("@") || items.length === 0) return res.status(400).json({ error: "Email and at least one item are required." });
  const entry = { id: Date.now(), email, items, createdAt: new Date().toISOString() };
  orders.unshift(entry);
  res.status(201).json(entry);
});
`);
  return pack(name, "store", html, styles(theme), app, server);
}

function blogFiles(name: string, brief: string): WebsiteFile[] {
  const theme = THEMES.blog;
  const blurb = brief || "Notes on making software, kitchens, and slower mornings.";
  const html = clientHtml(name, blurb, theme, `
  <section class="hero">
    <div>
      <p class="muted">Journal</p>
      <h1>${escHtml(name)}</h1>
      <p class="lede">${escHtml(blurb)}</p>
    </div>
    <img alt="Open notebook" src="https://picsum.photos/id/24/960/720" style="border-radius:18px;height:280px;width:100%;object-fit:cover" />
  </section>
  <section class="section" id="work">
    <div class="grid split">
      <div id="posts"></div>
      <form id="comment-form">
        <h3>Leave a note</h3>
        <input name="author" placeholder="Name" required />
        <textarea name="body" rows="4" placeholder="Comment" required></textarea>
        <input type="hidden" name="postId" value="1" />
        <button type="submit">Publish comment</button>
        <p id="status" class="status"></p>
        <div id="comments"></div>
      </form>
    </div>
  </section>`);
  const app = `${ESC_FN}
const SEED = [
  { id: 1, title: "A smaller homepage", excerpt: "Cut the navigation until the offer is the only loud thing." },
  { id: 2, title: "APIs for prototypes", excerpt: "In-memory routes are enough until a second person needs the data." },
  { id: 3, title: "Seed data on purpose", excerpt: "The preview should tell the truth even when the server is off." }
];
const list = document.querySelector("#posts");
const commentsEl = document.querySelector("#comments");
const form = document.querySelector("#comment-form");
const statusEl = document.querySelector("#status");
load("/api/posts", SEED).then((items) => {
  list.innerHTML = items.map((item) => '<article class="panel"><h3>' + esc(item.title) + '</h3><p>' + esc(item.excerpt) + '</p></article>').join("");
});
load("/api/comments?postId=1", []).then(renderComments);
function renderComments(items) {
  commentsEl.innerHTML = items.map((item) => '<p><strong>' + esc(item.author) + '</strong> — ' + esc(item.body) + '</p>').join("");
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("offline");
    const items = await load("/api/comments?postId=1", []);
    renderComments(items);
    statusEl.textContent = "Comment posted.";
  } catch {
    statusEl.textContent = "Server offline. Run npm start, then comment through /api/comments.";
  }
  form.reset();
});
`;
  const server = serverModule(`const posts = [
  { id: 1, title: "A smaller homepage", excerpt: "Cut the navigation until the offer is the only loud thing." },
  { id: 2, title: "APIs for prototypes", excerpt: "In-memory routes are enough until a second person needs the data." },
  { id: 3, title: "Seed data on purpose", excerpt: "The preview should tell the truth even when the server is off." }
];
const comments = [];
app.get("/api/posts", (_req, res) => res.json(posts));
app.get("/api/posts/:id", (req, res) => {
  const post = posts.find((item) => String(item.id) === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  res.json(post);
});
app.get("/api/comments", (req, res) => {
  const postId = String(req.query.postId || "");
  res.json(comments.filter((item) => !postId || String(item.postId) === postId));
});
app.post("/api/comments", (req, res) => {
  const author = String(req.body?.author || "").trim();
  const body = String(req.body?.body || "").trim();
  const postId = String(req.body?.postId || "1");
  if (!author || !body) return res.status(400).json({ error: "Author and comment are required." });
  const entry = { id: Date.now(), postId, author, body, createdAt: new Date().toISOString() };
  comments.unshift(entry);
  res.status(201).json(entry);
});
`);
  return pack(name, "blog", html, styles(theme), app, server);
}

function dashboardFiles(name: string, brief: string): WebsiteFile[] {
  const theme = THEMES.dashboard;
  const blurb = brief || "Live counts for signups, orders, and the work still open.";
  const html = clientHtml(name, blurb, theme, `
  <section class="hero">
    <div>
      <p class="muted">Operations</p>
      <h1>${escHtml(name)}</h1>
      <p class="lede">${escHtml(blurb)}</p>
      <button id="refresh" type="button">Refresh</button>
    </div>
  </section>
  <section class="section" id="work">
    <div id="stats" class="stats"></div>
  </section>
  <section class="section">
    <h2>Activity</h2>
    <div id="activity"></div>
  </section>`);
  const app = `${ESC_FN}
const SEED_STATS = [
  { label: "Signups", value: "128" },
  { label: "Orders", value: "46" },
  { label: "Open tickets", value: "7" },
  { label: "Uptime", value: "99.9%" }
];
const SEED_ACTIVITY = [
  { title: "Waitlist signup", detail: "ava@studio.com" },
  { title: "Order placed", detail: "Arc lamp · $180" },
  { title: "Reservation", detail: "Friday · 2 guests" }
];
const statsEl = document.querySelector("#stats");
const activityEl = document.querySelector("#activity");
function paint(stats, activity) {
  statsEl.innerHTML = stats.map((item) => '<article class="panel stat"><strong>' + esc(item.value) + '</strong><span class="muted">' + esc(item.label) + '</span></article>').join("");
  activityEl.innerHTML = activity.map((item) => '<article class="panel"><div class="row"><h3>' + esc(item.title) + '</h3><span class="muted">' + esc(item.detail) + '</span></div></article>').join("");
}
async function refresh() {
  const stats = await load("/api/stats", SEED_STATS);
  const activity = await load("/api/activity", SEED_ACTIVITY);
  paint(stats, activity);
}
document.querySelector("#refresh").addEventListener("click", refresh);
refresh();
`;
  const server = serverModule(`app.get("/api/stats", (_req, res) => res.json([
  { label: "Signups", value: "128" },
  { label: "Orders", value: "46" },
  { label: "Open tickets", value: "7" },
  { label: "Uptime", value: "99.9%" }
]));
app.get("/api/activity", (_req, res) => res.json([
  { title: "Waitlist signup", detail: "ava@studio.com" },
  { title: "Order placed", detail: "Arc lamp · $180" },
  { title: "Reservation", detail: "Friday · 2 guests" }
]));
`);
  return pack(name, "dashboard", html, styles(theme), app, server);
}

function pack(name: string, kind: WebsiteKind, html: string, css: string, app: string, server: string): WebsiteFile[] {
  return [
    { path: "client/index.html", content: html },
    { path: "client/styles.css", content: css },
    { path: "client/app.js", content: app },
    { path: "server/server.mjs", content: server },
    { path: "package.json", content: packageJson(name) },
    { path: "README.md", content: readme(name, kind) },
  ];
}

const BUILDERS: Record<WebsiteKind, (name: string, brief: string) => WebsiteFile[]> = {
  landing: landingFiles,
  portfolio: portfolioFiles,
  restaurant: restaurantFiles,
  store: storeFiles,
  blog: blogFiles,
  dashboard: dashboardFiles,
};

function cleanName(value: string | undefined, fallback: string): string {
  const cleaned = (value || "").replace(/\s+/g, " ").trim().slice(0, 48);
  return cleaned || fallback;
}

export function generateWebsite(input: { kind?: string; name?: string; brief?: string } = {}): GeneratedWebsite {
  const requested = (input.kind || "landing").toLowerCase();
  const kind: WebsiteKind = KIND_SET.has(requested) ? requested as WebsiteKind : "landing";
  const template = WEBSITE_TEMPLATES.find((item) => item.id === kind)!;
  const name = cleanName(input.name, template.defaultName);
  const brief = (input.brief || "").replace(/\s+/g, " ").trim().slice(0, 180);
  const files = BUILDERS[kind](name, brief);
  const summary = [
    `**${name}** is ready — a full-stack **${template.label.toLowerCase()}** website.`,
    "",
    "Files applied to this project:",
    "- `client/index.html` — page structure",
    "- `client/styles.css` — layout and theme",
    "- `client/app.js` — loads `/api` and falls back to seed data in the preview",
    "- `server/server.mjs` — Express API on port 3000",
    "- `package.json` — `npm start`",
    "- `README.md`",
    "",
    "The preview uses sample data. From the project folder run:",
    "",
    "```bash",
    "npm install",
    "npm start",
    "```",
    "",
    "Then open http://localhost:3000. The same page will read from the API.",
  ].join("\n");
  return { kind, name, files, summary };
}

function extractName(text: string): string | undefined {
  const quoted = text.match(/\b(?:called|named)\s+["']([^"']{1,48})["']/i);
  if (quoted?.[1]) return quoted[1].trim();
  const called = text.match(/\b(?:called|named)\s+([A-Z][\w]{1,40})/);
  if (called?.[1]) return called[1];
  const branded = text.match(/\bfor\s+([A-Z][\w]{1,40})\b/);
  if (branded?.[1]) return branded[1];
  return undefined;
}

export function inferWebsiteRequest(text: string): { kind: WebsiteKind; name?: string } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const build = /\b(build|create|generate|make|scaffold|design)\b/i.test(trimmed);
  const site = /\b(website|web\s*site|landing\s*page|full[\s-]?stack|\bsite\b)\b/i.test(trimmed);
  const kind = KIND_PATTERNS.find(([, pattern]) => pattern.test(trimmed))?.[0];
  if (kind && (build || site)) return { kind, name: extractName(trimmed) };
  if (build && site) return { kind: "landing", name: extractName(trimmed) };
  return null;
}

export function upsertProjectFiles(tree: ProjectNode[], files: WebsiteFile[]): ProjectNode[] {
  const next = structuredClone(tree);
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    if (parts.length === 0 || parts.some((part) => part === "." || part === "..")) continue;
    let nodes = next;
    let acc = "";
    for (let i = 0; i < parts.length - 1; i++) {
      acc = acc ? `${acc}/${parts[i]}` : parts[i];
      let folder = nodes.find((node) => node.type === "folder" && node.name === parts[i]);
      if (!folder) {
        folder = { id: acc, name: parts[i], type: "folder", isOpen: true, children: [] };
        nodes.push(folder);
      }
      folder.isOpen = true;
      if (!folder.children) folder.children = [];
      nodes = folder.children;
    }
    const name = parts[parts.length - 1];
    const id = parts.join("/");
    const existing = nodes.find((node) => node.type === "file" && node.name === name);
    if (existing) {
      existing.id = id;
      existing.content = file.content;
      existing.language = languageForPath(name);
    } else {
      nodes.push({ id, name, type: "file", language: languageForPath(name), content: file.content });
    }
  }
  return next;
}

export function filesToProjectTree(files: WebsiteFile[]): ProjectNode[] {
  return upsertProjectFiles([], files);
}
