/**
 * Full-stack website generator for the Web Development AI assistant.
 * Scaffolds a browser page plus a Node API from built-in site codes.
 * The page renders without the API (in-editor preview) and calls the API when `node src/server.js` is running.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "store" | "restaurant" | "dashboard";

export interface WebsiteTemplate {
  id: WebsiteKind;
  label: string;
  description: string;
  icon: string;
}

export interface WebsiteItem {
  id: string;
  title: string;
  text: string;
  price?: string;
  image: string;
  tag?: string;
}

export interface WebsiteFormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea";
  required?: boolean;
}

export interface WebsiteContent {
  kind: WebsiteKind;
  name: string;
  tagline: string;
  focus: string;
  nav: { href: string; label: string }[];
  hero: { eyebrow: string; title: string; subtitle: string; cta: string; image: string };
  features: { title: string; text: string }[];
  collectionLabel: string;
  collectionIntro: string;
  items: WebsiteItem[];
  form: { title: string; submit: string; endpoint: string; fields: WebsiteFormField[] };
  theme: { bg: string; surface: string; text: string; muted: string; accent: string; accentText: string };
}

export interface GeneratedWebsiteFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  name: string;
  files: GeneratedWebsiteFile[];
  content: WebsiteContent;
}

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  { id: "landing", label: "Landing", description: "Hero, features, contact API", icon: "🚀" },
  { id: "portfolio", label: "Portfolio", description: "Projects and a contact API", icon: "🎨" },
  { id: "blog", label: "Blog", description: "Posts plus a message API", icon: "✍️" },
  { id: "store", label: "Store", description: "Products and an orders API", icon: "🛍️" },
  { id: "restaurant", label: "Restaurant", description: "Menu and reservations", icon: "🍽️" },
  { id: "dashboard", label: "Dashboard", description: "Metrics and a tasks API", icon: "📊" },
];

const PHOTO = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

function slug(name: string): string {
  const value = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return value || "lunor-site";
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

function cleanText(value: string, fallback: string, max = 140): string {
  const trimmed = value.replace(/\s+/g, " ").trim().slice(0, max);
  return trimmed || fallback;
}

const contactFields: WebsiteFormField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "message", label: "Message", type: "textarea", required: true },
];

function contentFor(kind: WebsiteKind, name: string, focus: string): WebsiteContent {
  const shared = {
    kind,
    name,
    focus,
    nav: [
      { href: "#features", label: "Features" },
      { href: "#work", label: "Work" },
      { href: "#contact", label: "Contact" },
    ],
  };

  if (kind === "portfolio") {
    return {
      ...shared,
      tagline: focus || "Selected work, case studies, and a way to start a project.",
      hero: {
        eyebrow: "Portfolio",
        title: `${name} designs products people remember.`,
        subtitle: focus || "A full-stack portfolio: the page is static HTML, and the contact form posts to a Node API.",
        cta: "View projects",
        image: PHOTO("photo-1558618666-fcd25c85f1d7"),
      },
      features: [
        { title: "Case studies", text: "Each project card explains the problem, the interface, and the outcome." },
        { title: "Contact API", text: "Messages persist in data.json when the Node server is running." },
        { title: "Preview first", text: "The page still works in the editor if the API is offline." },
      ],
      collectionLabel: "Selected projects",
      collectionIntro: "Three recent builds you can extend.",
      items: [
        { id: "atlas", title: "Atlas Analytics", text: "A dashboard for weekly product metrics.", image: PHOTO("photo-1551288049-bebda4e38f71", 800), tag: "Product" },
        { id: "harbor", title: "Harbor Studio", text: "A marketing site with a booking flow.", image: PHOTO("photo-1498050108023-c5249f4df085", 800), tag: "Web" },
        { id: "lumen", title: "Lumen Notes", text: "A writing app with a calm reading layout.", image: PHOTO("photo-1517694712202-14dd9538aa97", 800), tag: "App" },
      ],
      form: { title: "Start a project", submit: "Send message", endpoint: "/api/messages", fields: contactFields },
      theme: { bg: "#0c1020", surface: "#161b2e", text: "#f4f6fb", muted: "#a7b0c5", accent: "#8b7cff", accentText: "#140f2a" },
    };
  }

  if (kind === "blog") {
    return {
      ...shared,
      tagline: focus || "Notes on building for the web, published as a small full-stack site.",
      hero: {
        eyebrow: "Journal",
        title: `Writing from ${name}.`,
        subtitle: focus || "Posts live in data.json. The API serves them, and the page falls back to the copy baked into the HTML.",
        cta: "Read the latest",
        image: PHOTO("photo-1481627834876-b7833e8f5570"),
      },
      features: [
        { title: "Readable type", text: "A narrow measure, clear headings, and images that do not shout." },
        { title: "Post API", text: "GET /api/content returns the same posts the page renders." },
        { title: "Reader notes", text: "The form stores a note locally, or on the server when it is up." },
      ],
      collectionLabel: "Latest posts",
      collectionIntro: "Start here, then add your own entries in data.json.",
      items: [
        { id: "css-grid", title: "Layout without the struggle", text: "How a single grid template replaced three media-query rewrites.", image: PHOTO("photo-1504639725590-34d0984388bd", 800), tag: "CSS" },
        { id: "fetch", title: "Fetch, then fall back", text: "Call the API, and keep the page useful when the network is absent.", image: PHOTO("photo-1515879218367-8466d910aaa4", 800), tag: "JavaScript" },
        { id: "ship", title: "Ship the small version", text: "A Node server and one JSON file are enough for a first backend.", image: PHOTO("photo-1461749280684-dccba630e2f6", 800), tag: "Backend" },
      ],
      form: { title: "Leave a note", submit: "Save note", endpoint: "/api/messages", fields: contactFields },
      theme: { bg: "#14110e", surface: "#211c18", text: "#f7f1ea", muted: "#cbbbaa", accent: "#e2a15a", accentText: "#2a1c0c" },
    };
  }

  if (kind === "store") {
    return {
      ...shared,
      nav: [
        { href: "#features", label: "Why us" },
        { href: "#work", label: "Shop" },
        { href: "#contact", label: "Checkout" },
      ],
      tagline: focus || "A small catalog with an orders API.",
      hero: {
        eyebrow: "Shop",
        title: `${name} — goods worth keeping.`,
        subtitle: focus || "Browse products in the browser. Checkout posts an order to /api/orders.",
        cta: "Browse the shop",
        image: PHOTO("photo-1441986300917-64674bd600d8"),
      },
      features: [
        { title: "Clear catalog", text: "Each product has a price, a photo, and an add button." },
        { title: "Orders API", text: "POST /api/orders appends the cart to data.json." },
        { title: "Offline cart", text: "If the server is down, the order is kept in this browser." },
      ],
      collectionLabel: "In the shop",
      collectionIntro: "Add a product, then send the order.",
      items: [
        { id: "field-note", title: "Field Notebook", text: "Hardcover, 192 pages, lays flat.", price: "$24", image: PHOTO("photo-1512820790803-83ca734da794", 800), tag: "Stationery" },
        { id: "ceramic", title: "Studio Mug", text: "Speckled clay, dishwasher safe.", price: "$32", image: PHOTO("photo-1514228742587-6b1558fcca3d", 800), tag: "Home" },
        { id: "tote", title: "Day Tote", text: "Heavy canvas with an inner pocket.", price: "$48", image: PHOTO("photo-1544816155-12df9643f363", 800), tag: "Carry" },
      ],
      form: {
        title: "Checkout",
        submit: "Place order",
        endpoint: "/api/orders",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "message", label: "Delivery note", type: "textarea" },
        ],
      },
      theme: { bg: "#071410", surface: "#10211b", text: "#f3fbf7", muted: "#b7d0c4", accent: "#3ddc97", accentText: "#062117" },
    };
  }

  if (kind === "restaurant") {
    return {
      ...shared,
      nav: [
        { href: "#features", label: "Visit" },
        { href: "#work", label: "Menu" },
        { href: "#contact", label: "Reserve" },
      ],
      tagline: focus || "Seasonal plates and a reservation API.",
      hero: {
        eyebrow: "Dining room",
        title: `Welcome to ${name}.`,
        subtitle: focus || "The menu renders in the page. Reservations post to /api/reservations.",
        cta: "See the menu",
        image: PHOTO("photo-1414235077428-338989a2e8c0"),
      },
      features: [
        { title: "Tonight's menu", text: "A short list with prices, ready to edit in data.json." },
        { title: "Reservations", text: "The API stores name, email, and party details." },
        { title: "Walk-in friendly", text: "The form still confirms locally when the server is offline." },
      ],
      collectionLabel: "Menu",
      collectionIntro: "A few plates to start the service.",
      items: [
        { id: "citrus", title: "Citrus salad", text: "Fennel, olive oil, and toasted seeds.", price: "$14", image: PHOTO("photo-1540189549336-e6e99c3679fe", 800), tag: "Starter" },
        { id: "hearth", title: "Hearth chicken", text: "Charred lemon and pan juices.", price: "$28", image: PHOTO("photo-1504674900247-0877df9cc836", 800), tag: "Main" },
        { id: "cocoa", title: "Cocoa tart", text: "Olive oil crust, sea salt.", price: "$12", image: PHOTO("photo-1551024601-bec78aea704b", 800), tag: "Sweet" },
      ],
      form: {
        title: "Reserve a table",
        submit: "Request reservation",
        endpoint: "/api/reservations",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "message", label: "Party size and time", type: "textarea", required: true },
        ],
      },
      theme: { bg: "#160c0c", surface: "#261416", text: "#fff6f4", muted: "#e2c4bc", accent: "#ff8b6a", accentText: "#2b100c" },
    };
  }

  if (kind === "dashboard") {
    return {
      ...shared,
      nav: [
        { href: "#features", label: "Overview" },
        { href: "#work", label: "Metrics" },
        { href: "#contact", label: "Tasks" },
      ],
      tagline: focus || "A compact operations view with a tasks API.",
      hero: {
        eyebrow: "Operations",
        title: `${name} at a glance.`,
        subtitle: focus || "Metrics are seeded in data.json. New tasks post to /api/tasks.",
        cta: "Review metrics",
        image: PHOTO("photo-1551288049-bebda4e38f71"),
      },
      features: [
        { title: "Three signals", text: "Visitors, conversion, and open tasks — enough to learn the shape of a dashboard." },
        { title: "Task API", text: "POST /api/tasks appends a task without a database server." },
        { title: "Safe preview", text: "Adding a task still updates the page when the API cannot be reached." },
      ],
      collectionLabel: "This week",
      collectionIntro: "Sample metrics. Replace them with your own numbers.",
      items: [
        { id: "visitors", title: "1,284 visitors", text: "Up 12% from last week.", image: PHOTO("photo-1460925895917-afdab827c52f", 800), tag: "Traffic" },
        { id: "conversion", title: "4.8% conversion", text: "Checkout completed without errors.", image: PHOTO("photo-1551288049-bebda4e38f71", 800), tag: "Sales" },
        { id: "tasks", title: "6 open tasks", text: "Two are waiting on review.", image: PHOTO("photo-1504639725590-34d0984388bd", 800), tag: "Work" },
      ],
      form: {
        title: "Add a task",
        submit: "Save task",
        endpoint: "/api/tasks",
        fields: [
          { name: "name", label: "Owner", type: "text", required: true },
          { name: "message", label: "Task", type: "textarea", required: true },
        ],
      },
      theme: { bg: "#0b1220", surface: "#121c30", text: "#eef4ff", muted: "#b5c4de", accent: "#67b7ff", accentText: "#041424" },
    };
  }

  return {
    ...shared,
    tagline: focus || "A landing page with a lead API behind the form.",
    hero: {
      eyebrow: "Product",
      title: `${name} helps you ship the first version.`,
      subtitle: focus || "One page for the story, one Node server for the leads, and JSON for the data.",
      cta: "See how it works",
      image: PHOTO("photo-1553877522-43269d4ea984"),
    },
    features: [
      { title: "A clear story", text: "Hero, three reasons, and a form — the smallest useful landing page." },
      { title: "Lead capture", text: "The form posts to /api/messages and stores the body in data.json." },
      { title: "Runs in preview", text: "No build step. The editor shows the page immediately." },
    ],
    collectionLabel: "What you get",
    collectionIntro: "Three pieces of the stack, already wired.",
    items: [
      { id: "page", title: "The page", text: "HTML, CSS, and browser JavaScript with a responsive layout.", image: PHOTO("photo-1498050108023-c5249f4df085", 800), tag: "Client" },
      { id: "api", title: "The API", text: "A Node HTTP server with JSON routes and static files.", image: PHOTO("photo-1555066931-4365d14bab8c", 800), tag: "Server" },
      { id: "data", title: "The data", text: "Seed content in data.json that both sides share.", image: PHOTO("photo-1543286386-713bdd548da4", 800), tag: "JSON" },
    ],
    form: { title: "Request a walkthrough", submit: "Send", endpoint: "/api/messages", fields: contactFields },
    theme: { bg: "#071018", surface: "#10202b", text: "#f3fbff", muted: "#b7c9d6", accent: "#2ee6c7", accentText: "#04221c" },
  };
}

const CLIENT_SCRIPT = `// Browser client for the generated site.
// Talks to the Node API when it is running, and keeps working in the editor preview when it is not.
(function () {
  var dataNode = document.getElementById("site-data");
  var data = {};
  try { data = JSON.parse(dataNode ? dataNode.textContent || "{}" : "{}"); } catch (err) { data = {}; }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () { nav.classList.toggle("open"); });
  }

  var search = document.getElementById("item-search");
  if (search) {
    search.addEventListener("input", function () {
      var query = search.value.trim().toLowerCase();
      document.querySelectorAll("[data-item]").forEach(function (card) {
        var hay = (card.getAttribute("data-item") || "").toLowerCase();
        card.hidden = query.length > 0 && hay.indexOf(query) === -1;
      });
    });
  }

  var cart = [];
  var cartCount = document.getElementById("cart-count");
  function renderCart() {
    if (!cartCount) return;
    cartCount.hidden = cart.length === 0;
    cartCount.textContent = String(cart.length);
  }
  document.querySelectorAll("[data-add]").forEach(function (button) {
    button.addEventListener("click", function () {
      var id = button.getAttribute("data-add");
      var items = data.items || [];
      var item = null;
      for (var i = 0; i < items.length; i++) if (items[i].id === id) item = items[i];
      if (!item) return;
      cart.push({ id: item.id, title: item.title, price: item.price || "" });
      renderCart();
      var status = document.getElementById("form-status");
      if (status) status.textContent = "Added " + item.title + ". Submit the form to place the order.";
    });
  });

  var form = document.getElementById("site-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var status = document.getElementById("form-status");
    var endpoint = (data.form && data.form.endpoint) || "/api/messages";
    var body = { kind: data.kind || "landing", cart: cart };
    var fields = form.querySelectorAll("[name]");
    fields.forEach(function (field) {
      if (field.name) body[field.name] = field.value;
    });

    function savedLocally(reason) {
      var key = "lunor-website-" + endpoint;
      var previous = [];
      try { previous = JSON.parse(localStorage.getItem(key) || "[]"); } catch (err) { previous = []; }
      previous.push(body);
      localStorage.setItem(key, JSON.stringify(previous));
      if (status) status.textContent = reason;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (response) {
      if (!response.ok) throw new Error("request failed");
      return response.json();
    }).then(function () {
      form.reset();
      cart = [];
      renderCart();
      if (status) status.textContent = "Saved by the API.";
    }).catch(function () {
      savedLocally("API offline — saved in this browser. Run node src/server.js to persist it.");
    });
  });
})();
`;

const SERVER_SCRIPT = `// Node API for the generated website. No dependencies.
// Run from the project root: node src/server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_PATH = path.join(ROOT, "data.json");
const STATIC = {
  "/": "index.html",
  "/index.html": "index.html",
  "/styles.css": "styles.css",
  "/script.js": "script.js",
  "/data.json": "data.json",
};
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 100000) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch (err) { reject(err); }
    });
    req.on("error", reject);
  });
}

function appendRecord(listName, record) {
  const data = readData();
  if (!Array.isArray(data[listName])) data[listName] = [];
  data[listName].push(Object.assign({ id: Date.now().toString(36) }, record));
  writeData(data);
  return data[listName];
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && (url.pathname === "/api/content" || url.pathname === "/api/items")) {
    const data = readData();
    sendJson(res, 200, url.pathname === "/api/items" ? data.items || [] : data);
    return;
  }

  if (req.method === "POST" && ["/api/messages", "/api/orders", "/api/reservations", "/api/tasks"].includes(url.pathname)) {
    try {
      const body = await readBody(req);
      const listName = url.pathname.slice("/api/".length);
      const saved = appendRecord(listName, {
        name: String(body.name || "").slice(0, 120),
        email: String(body.email || "").slice(0, 160),
        message: String(body.message || "").slice(0, 2000),
        cart: Array.isArray(body.cart) ? body.cart.slice(0, 20) : [],
        createdAt: new Date().toISOString(),
      });
      sendJson(res, 201, { ok: true, count: saved.length });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message || "Bad request" });
    }
    return;
  }

  const fileName = STATIC[url.pathname];
  if (req.method === "GET" && fileName) {
    const filePath = path.join(ROOT, fileName);
    if (!filePath.startsWith(ROOT)) {
      sendJson(res, 403, { ok: false, error: "Forbidden" });
      return;
    }
    fs.readFile(filePath, (err, buf) => {
      if (err) {
        sendJson(res, 404, { ok: false, error: "Not found" });
        return;
      }
      const ext = path.extname(fileName);
      res.writeHead(200, { "Content-Type": TYPES[ext] || "text/plain; charset=utf-8" });
      res.end(buf);
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, () => {
  const address = server.address();
  const actual = address && typeof address === "object" ? address.port : PORT;
  console.log("Website running at http://localhost:" + actual);
});
`;

const SITE_STYLES = `/* Generated site styles. Colors come from :root in index.html. */
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", "Avenir Next", "Trebuchet MS", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.wrap { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
.site-header {
  position: sticky; top: 0; z-index: 5;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 0;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
}
.brand { font-weight: 750; letter-spacing: -0.03em; text-decoration: none; }
.nav { display: flex; gap: 16px; align-items: center; }
.nav a { text-decoration: none; color: var(--muted); font-size: 0.92rem; }
.nav a:hover { color: var(--text); }
.nav-toggle, .cart-count {
  border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
  background: var(--surface);
  color: var(--text);
  border-radius: 999px;
  padding: 6px 10px;
}
.nav-toggle { display: none; }
.hero {
  display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center;
  padding: 28px 0 10px;
}
.eyebrow {
  color: var(--accent); font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; margin: 0 0 8px;
}
h1, h2, h3 { line-height: 1.15; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.2rem, 4vw, 4rem); margin: 0 0 12px; }
.lede { color: var(--muted); font-size: 1.05rem; max-width: 42rem; }
.button, button[type="submit"], .add {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--accent); color: var(--accent-text); text-decoration: none;
  border: 0; border-radius: 999px; padding: 10px 16px; font-weight: 700; cursor: pointer;
}
.hero-media { border-radius: 22px; min-height: 280px; object-fit: cover; width: 100%; height: 100%; }
.features, .collection, .contact { padding: 28px 0; }
.feature-grid, .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.feature, .card, .contact form {
  background: var(--surface);
  border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: 18px;
  padding: 16px;
}
.feature h3, .card h3 { margin: 8px 0; }
.feature p, .card p, .section-intro { color: var(--muted); }
.section-head { display: flex; justify-content: space-between; gap: 12px; align-items: end; margin-bottom: 14px; }
.section-head input, .contact input, .contact textarea {
  width: 100%; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
  background: var(--bg); color: var(--text); padding: 10px 12px; font: inherit;
}
.card img { border-radius: 12px; height: 160px; width: 100%; object-fit: cover; }
.tag { color: var(--accent); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; }
.price { font-weight: 750; }
.contact { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 18px; align-items: start; }
label { display: grid; gap: 6px; font-size: 0.85rem; color: var(--muted); margin-bottom: 10px; }
#form-status { min-height: 1.2em; color: var(--accent); }
.site-footer { padding: 22px 0 36px; color: var(--muted); display: flex; justify-content: space-between; gap: 12px; }
@media (max-width: 800px) {
  .hero, .feature-grid, .cards, .contact { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  .nav { display: none; position: absolute; top: 58px; right: 16px; flex-direction: column; background: var(--surface); padding: 12px; border-radius: 14px; }
  .nav.open { display: flex; }
  .site-header { position: relative; }
}
`;

function renderFields(fields: WebsiteFormField[]): string {
  return fields.map((field) => {
    const required = field.required ? " required" : "";
    const control = field.type === "textarea"
      ? `<textarea name="${field.name}" rows="4"${required}></textarea>`
      : `<input name="${field.name}" type="${field.type}"${required} />`;
    return `<label>${escapeHtml(field.label)}${control}</label>`;
  }).join("\n");
}

function renderPage(content: WebsiteContent): string {
  const cards = content.items.map((item) => {
    const add = content.kind === "store"
      ? `<button class="add" type="button" data-add="${escapeHtml(item.id)}">Add</button>`
      : "";
    return `<article class="card" data-item="${escapeHtml(`${item.title} ${item.text} ${item.tag || ""}`)}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
      <p class="tag">${escapeHtml(item.tag || content.kind)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
      ${item.price ? `<p class="price">${escapeHtml(item.price)}</p>` : ""}
      ${add}
    </article>`;
  }).join("\n");

  const cart = content.kind === "store" ? `<span id="cart-count" class="cart-count" hidden>0</span>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(content.name)}</title>
  <link rel="stylesheet" href="styles.css" />
  <style>
    :root {
      --bg: ${content.theme.bg};
      --surface: ${content.theme.surface};
      --text: ${content.theme.text};
      --muted: ${content.theme.muted};
      --accent: ${content.theme.accent};
      --accent-text: ${content.theme.accentText};
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="site-header">
      <a class="brand" href="#top">${escapeHtml(content.name)}</a>
      <button id="nav-toggle" class="nav-toggle" type="button">Menu</button>
      <nav id="site-nav" class="nav">
        ${content.nav.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
        ${cart}
      </nav>
    </header>
    <main>
      <section class="hero" id="top">
        <div>
          <p class="eyebrow">${escapeHtml(content.hero.eyebrow)}</p>
          <h1>${escapeHtml(content.hero.title)}</h1>
          <p class="lede">${escapeHtml(content.hero.subtitle)}</p>
          <p><a class="button" href="#work">${escapeHtml(content.hero.cta)}</a></p>
        </div>
        <img class="hero-media" src="${escapeHtml(content.hero.image)}" alt="" />
      </section>
      <section class="features" id="features">
        <div class="feature-grid">
          ${content.features.map((feature) => `<article class="feature"><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.text)}</p></article>`).join("\n")}
        </div>
      </section>
      <section class="collection" id="work">
        <div class="section-head">
          <div>
            <h2>${escapeHtml(content.collectionLabel)}</h2>
            <p class="section-intro">${escapeHtml(content.collectionIntro)}</p>
          </div>
          <input id="item-search" type="search" placeholder="Search" aria-label="Search" />
        </div>
        <div class="cards" id="item-grid">
          ${cards}
        </div>
      </section>
      <section class="contact" id="contact">
        <div>
          <h2>${escapeHtml(content.form.title)}</h2>
          <p class="section-intro">${escapeHtml(content.tagline)}</p>
        </div>
        <form id="site-form">
          ${renderFields(content.form.fields)}
          <button type="submit">${escapeHtml(content.form.submit)}</button>
          <p id="form-status" role="status"></p>
        </form>
      </section>
    </main>
    <footer class="site-footer">
      <span>${escapeHtml(content.name)}</span>
      <span>© <span id="year"></span> · API ${escapeHtml(content.form.endpoint)}</span>
    </footer>
  </div>
  <script id="site-data" type="application/json">${jsonForHtml(content)}</script>
  <script src="script.js"></script>
</body>
</html>
`;
}

function renderReadme(content: WebsiteContent): string {
  return `# ${content.name}

${content.tagline}

Generated by the Lunor.AI Web Development website automation.

## Files

- \`src/index.html\` — page
- \`src/styles.css\` — layout
- \`src/script.js\` — browser behavior and API calls
- \`src/server.js\` — Node API and static server
- \`src/data.json\` — seed content and saved form posts

## Run the API

\`\`\`bash
node src/server.js
\`\`\`

Open http://localhost:3000. The editor preview shows the page without the API. Form posts are stored in this browser until the server is running, then they are written to \`src/data.json\`.

Form endpoint: \`${content.form.endpoint}\`
`;
}

export function buildWebsiteProject(input: { kind: WebsiteKind; name?: string; focus?: string }): GeneratedWebsite {
  const template = WEBSITE_TEMPLATES.find((item) => item.id === input.kind) ?? WEBSITE_TEMPLATES[0];
  const name = cleanText(input.name || "", template.label === "Landing" ? "Northwind" : template.label);
  const focus = cleanText(input.focus || "", "", 180);
  const content = contentFor(template.id, name, focus);
  const packageJson = {
    name: slug(name),
    version: "1.0.0",
    private: true,
    scripts: { start: "node src/server.js" },
  };

  const files: GeneratedWebsiteFile[] = [
    { path: "src/index.html", name: "index.html", language: "html", content: renderPage(content) },
    { path: "src/styles.css", name: "styles.css", language: "css", content: SITE_STYLES },
    { path: "src/script.js", name: "script.js", language: "javascript", content: CLIENT_SCRIPT },
    { path: "src/server.js", name: "server.js", language: "javascript", content: SERVER_SCRIPT },
    { path: "src/data.json", name: "data.json", language: "json", content: `${JSON.stringify(content, null, 2)}\n` },
    { path: "package.json", name: "package.json", language: "json", content: `${JSON.stringify(packageJson, null, 2)}\n` },
    { path: "README.md", name: "README.md", language: "markdown", content: renderReadme(content) },
  ];

  return { kind: template.id, name, files, content };
}

export function describeGeneratedWebsite(site: GeneratedWebsite): string {
  const files = site.files.map((file) => `- \`${file.path}\``).join("\n");
  return `**${site.name}** is in the editor — a ${site.kind} site from the website automation.

The page (\`index.html\`, \`styles.css\`, \`script.js\`) is ready to preview. The API is \`src/server.js\`. It serves the page and these routes:

- \`GET /api/content\`
- \`POST ${site.content.form.endpoint}\`

Run it from the project root with \`node src/server.js\`, then open http://localhost:3000. In this preview the form saves in the browser when that server is not running.

Files:
${files}`;
}
