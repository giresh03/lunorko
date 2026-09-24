/**
 * Full-stack website generator for the Web Development assistant.
 * Produces a previewable frontend plus a dependency-free Node API.
 */

export type WebsiteKind = "landing" | "portfolio" | "saas" | "shop" | "blog";

export interface WebsiteBrief {
  kind: WebsiteKind;
  name: string;
  tagline: string;
  prompt: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: GeneratedTreeNode[];
  isOpen?: boolean;
}

export interface GeneratedWebsite {
  brief: WebsiteBrief;
  files: GeneratedFile[];
  apiResource: string;
  summary: string;
}

export interface WebsiteGeneratorAction {
  id: WebsiteKind;
  label: string;
  prompt: string;
}

export const WEBSITE_GENERATOR_ACTIONS: WebsiteGeneratorAction[] = [
  { id: "landing", label: "Landing site", prompt: "Generate a full-stack landing page website" },
  { id: "portfolio", label: "Portfolio", prompt: "Generate a full-stack portfolio website" },
  { id: "saas", label: "SaaS", prompt: "Generate a full-stack SaaS website" },
  { id: "shop", label: "Shop", prompt: "Generate a full-stack online store website" },
  { id: "blog", label: "Blog", prompt: "Generate a full-stack blog website" },
];

interface SiteItem {
  title: string;
  summary: string;
  tag: string;
  meta: string;
  image: string;
}

interface SitePreset {
  name: string;
  tagline: string;
  kicker: string;
  accent: string;
  accentSoft: string;
  resource: string;
  resourceLabel: string;
  heroImage: string;
  features: { title: string; body: string }[];
  items: SiteItem[];
}

const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

const PRESETS: Record<WebsiteKind, SitePreset> = {
  landing: {
    name: "Lumen",
    tagline: "A clearer way to launch what you are building.",
    kicker: "Product studio",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
    resource: "highlights",
    resourceLabel: "Highlights",
    heroImage: "1556761175-5973dc0f32e7",
    features: [
      { title: "One brief, one build", body: "Turn a product idea into a page, an API, and a content model you can run locally." },
      { title: "Preview and API stay in sync", body: "The browser falls back to seed data. The Node server serves the same records." },
      { title: "Ready to extend", body: "Add a field in server/data.js and the cards on the page pick it up." },
    ],
    items: [
      { title: "Launch sprint", summary: "A two-week plan for shipping a first public page and a working API.", tag: "Process", meta: "2 weeks", image: photo("1552664730-d307ca884978", 800) },
      { title: "Brand system", summary: "Type, color, and spacing rules so every section feels like the same product.", tag: "Design", meta: "Guide", image: photo("1542744173-8e7e91415657", 800) },
      { title: "Content model", summary: "Highlights live in one data file and are returned by GET /api/highlights.", tag: "Backend", meta: "JSON", image: photo("1460925895917-afdab827c52f", 800) },
      { title: "Launch day", summary: "A checklist for DNS, analytics, and the first customer conversation.", tag: "Go-to-market", meta: "Checklist", image: photo("1553877522-43269d4ea984", 800) },
    ],
  },
  portfolio: {
    name: "Northstar Studio",
    tagline: "Selected work from a small team that ships careful interfaces.",
    kicker: "Portfolio",
    accent: "#1d4ed8",
    accentSoft: "#dbeafe",
    resource: "projects",
    resourceLabel: "Projects",
    heroImage: "1498050108023-c5249f4df085",
    features: [
      { title: "Case studies, not mockups", body: "Each project card is a record from the API, with a tag, a summary, and a still." },
      { title: "Readable on a phone", body: "The grid collapses to a single column and the navigation stays usable." },
      { title: "Contact that hits the server", body: "The form posts to /api/messages when the Node process is running." },
    ],
    items: [
      { title: "Harbor analytics", summary: "A dashboard for a logistics team, rebuilt around the three numbers they check daily.", tag: "Product", meta: "2025", image: photo("1551288049-bebda4e38f71", 800) },
      { title: "Field notes", summary: "An editorial site for a research lab, with a quiet type system and fast pages.", tag: "Editorial", meta: "2024", image: photo("1517694712202-14dd9538aa97", 800) },
      { title: "Kiln ceramics", summary: "A catalog and inquiry flow for a studio that sells small-batch tableware.", tag: "Commerce", meta: "2024", image: photo("1493106641515-6b5631de4bb9", 800) },
      { title: "North line", summary: "Identity and marketing site for a regional rail feasibility study.", tag: "Brand", meta: "2023", image: photo("1461749280684-dccba630e2f6", 800) },
    ],
  },
  saas: {
    name: "Harbor",
    tagline: "Shared inboxes, clear owners, and a trail of what changed.",
    kicker: "SaaS",
    accent: "#6d28d9",
    accentSoft: "#ede9fe",
    resource: "plans",
    resourceLabel: "Plans",
    heroImage: "1553877522-43269d4ea984",
    features: [
      { title: "Plans from the API", body: "Pricing cards render from GET /api/plans so copy changes do not require a redesign." },
      { title: "A real request path", body: "The contact form posts JSON to /api/messages and surfaces validation errors." },
      { title: "Works before the server starts", body: "The preview embeds the same seed data the API module exports." },
    ],
    items: [
      { title: "Starter", summary: "One workspace, three seats, and email support for a team finding its process.", tag: "Plan", meta: "$19 / mo", image: photo("1600880292203-757bb62b4baf", 800) },
      { title: "Team", summary: "Shared views, assignment, and a weekly digest of unresolved threads.", tag: "Plan", meta: "$49 / mo", image: photo("1552664730-d307ca884978", 800) },
      { title: "Scale", summary: "Audit log, SSO-ready hooks, and a named contact for rollout.", tag: "Plan", meta: "$99 / mo", image: photo("1542744173-8e7e91415657", 800) },
      { title: "Onboarding", summary: "A guided import so the first week is about the queue, not the settings.", tag: "Service", meta: "Included", image: photo("1522071820081-009f0129c71c", 800) },
    ],
  },
  shop: {
    name: "Field & Form",
    tagline: "Objects for the table, made in short runs.",
    kicker: "Shop",
    accent: "#b45309",
    accentSoft: "#ffedd5",
    resource: "products",
    resourceLabel: "Products",
    heroImage: "1441986300917-64674bd600d8",
    features: [
      { title: "Catalog as data", body: "Products are records with a price, a tag, and a photo. The API returns them as JSON." },
      { title: "Search on the page", body: "The storefront filters the current catalog without a reload." },
      { title: "Inquiry instead of a fake cart", body: "Shoppers send a note through POST /api/messages." },
    ],
    items: [
      { title: "Stoneware bowl", summary: "A wide bowl for serving, glazed in a warm sand tone.", tag: "Table", meta: "$48", image: photo("1610701596007-11502861dcfa", 800) },
      { title: "Linen runner", summary: "Heavy linen, cut long enough for a six-seat table.", tag: "Textile", meta: "$62", image: photo("1616486338812-3dadae4b4ace", 800) },
      { title: "Oak board", summary: "A serving board with a shallow juice groove and a leather tie.", tag: "Wood", meta: "$74", image: photo("1556909114-f6e7ad7d3136", 800) },
      { title: "Glass carafe", summary: "Hand-blown glass sized for a morning pot of coffee.", tag: "Glass", meta: "$56", image: photo("1514228744773-60f0a4a5a5e3", 800) },
    ],
  },
  blog: {
    name: "The Margin",
    tagline: "Notes on making software that people can finish reading.",
    kicker: "Journal",
    accent: "#be123c",
    accentSoft: "#ffe4e6",
    resource: "posts",
    resourceLabel: "Posts",
    heroImage: "1456513080510-7bf3a84b82f8",
    features: [
      { title: "Posts are API records", body: "The index renders whatever GET /api/posts returns, including the read time." },
      { title: "Search the archive", body: "A single field filters titles and summaries in the browser." },
      { title: "Write to the editor", body: "Change server/data.js, restart the server, and the list updates." },
    ],
    items: [
      { title: "Ship the page first", summary: "Why a static-looking homepage with a real API teaches more than a blank repo.", tag: "Practice", meta: "6 min", image: photo("1481627834876-b7833e8f5570", 800) },
      { title: "Name the data", summary: "A short argument for one content file shared by the preview and the server.", tag: "Backend", meta: "8 min", image: photo("1434030216411-0b793f4b4173", 800) },
      { title: "Forms that fail clearly", summary: "Validation messages for a contact endpoint that stores nothing yet.", tag: "API", meta: "5 min", image: photo("1455390582262-044cdead277a", 800) },
      { title: "Type that can rest", summary: "Picking a small set of sizes so a long article does not shout.", tag: "Design", meta: "7 min", image: photo("1457369804613-52c61a468e7d", 800) },
    ],
  },
};

const BUILD_VERB = /\b(build|create|make|generate|scaffold|design|automate)\b/i;
const SITE_TARGET = /\b(full[\s-]?stack|website|web site|landing page|online store|storefront|portfolio|saas|blog|shop|e-?commerce)\b/i;
const EXPLICIT_SITE = /\b(full[\s-]?stack|website|web site|landing page|online store|storefront)\b/i;
const SMALL_WIDGET = /\b(component|function|snippet|counter|button|navbar|widget|calculator)\b/i;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[ch] || ch;
  });
}

function cleanName(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 48);
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

function inferKind(prompt: string): WebsiteKind {
  const lower = prompt.toLowerCase();
  if (/\bportfolio\b/.test(lower)) return "portfolio";
  if (/\bsaas\b/.test(lower)) return "saas";
  if (/\b(shop|store|storefront|e-?commerce)\b/.test(lower)) return "shop";
  if (/\bblog\b/.test(lower)) return "blog";
  return "landing";
}

function inferName(prompt: string, fallback: string): string {
  const quoted = prompt.match(/["“]([^"”]{2,48})["”]/);
  if (quoted) return cleanName(quoted[1]);
  const called = prompt.match(/\b(?:called|named)\s+([A-Za-z0-9][\w'&.-]*(?:\s+[A-Za-z0-9][\w'&.-]*){0,3})/i);
  if (called) return cleanName(called[1]);
  const branded = prompt.match(/\bfor\s+([A-Z][\w'&.-]*(?:\s+[A-Z][\w'&.-]*){0,3})/);
  if (branded) return cleanName(branded[1]);
  return fallback;
}

export function detectWebsiteRequest(prompt: string): WebsiteBrief | null {
  const text = prompt.trim();
  if (!text || text.length > 500) return null;
  const starter = WEBSITE_GENERATOR_ACTIONS.find((action) => action.prompt.toLowerCase() === text.toLowerCase());
  const isSiteRequest = Boolean(starter) || (BUILD_VERB.test(text) && SITE_TARGET.test(text));
  if (!isSiteRequest) return null;
  if (SMALL_WIDGET.test(text) && !EXPLICIT_SITE.test(text)) return null;

  const kind = starter?.id ?? inferKind(text);
  const preset = PRESETS[kind];
  return {
    kind,
    name: inferName(text, preset.name),
    tagline: preset.tagline,
    prompt: text,
  };
}

function buildStyles(preset: SitePreset): string {
  return `/* Generated by the Lunor.AI website generator */
:root {
  --bg: #f6f3ee;
  --ink: #1c1917;
  --muted: #57534e;
  --line: #e7e0d6;
  --card: #ffffff;
  --accent: ${preset.accent};
  --accent-soft: ${preset.accentSoft};
  --shadow: 0 18px 40px rgba(28, 25, 23, 0.08);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", Helvetica, Arial, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.site-header {
  position: sticky; top: 0; z-index: 10;
  background: rgba(246, 243, 238, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.nav { display: flex; align-items: center; justify-content: space-between; min-height: 72px; gap: 16px; }
.brand { font-weight: 700; letter-spacing: -0.03em; text-decoration: none; }
.nav-links { display: flex; gap: 18px; align-items: center; }
.nav-links a { text-decoration: none; color: var(--muted); font-size: 14px; }
.nav-links a:hover { color: var(--ink); }
.button, button {
  font: inherit; cursor: pointer; border: 0; border-radius: 999px;
  background: var(--accent); color: white; padding: 10px 16px; text-decoration: none;
}
.button.ghost, button.ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; padding: 64px 0 32px; }
.kicker { color: var(--accent); font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
h1 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(40px, 6vw, 68px); line-height: 0.95; letter-spacing: -0.04em; margin: 12px 0; }
.lede { font-size: 18px; color: var(--muted); max-width: 46ch; }
.hero-actions { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
.hero-photo { border-radius: 28px; overflow: hidden; box-shadow: var(--shadow); min-height: 320px; }
.hero-photo img { width: 100%; height: 420px; object-fit: cover; }
.features, .catalog, .contact { padding: 28px 0 12px; }
.section-head { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 18px; }
h2 { font-family: Georgia, "Times New Roman", serif; font-size: 32px; margin: 0; letter-spacing: -0.03em; }
.feature-grid, .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card-grid { grid-template-columns: repeat(2, 1fr); }
.feature, .card { background: var(--card); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; }
.feature { padding: 20px; }
.feature h3, .card h3 { margin: 0 0 8px; }
.feature p, .card p { margin: 0; color: var(--muted); }
.card img { width: 100%; height: 220px; object-fit: cover; }
.card-body { padding: 16px 18px 18px; }
.meta { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--accent); font-weight: 700; margin-bottom: 8px; }
.toolbar { display: flex; gap: 12px; align-items: center; }
input, textarea {
  width: 100%; font: inherit; color: var(--ink); background: white;
  border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px;
}
.toolbar input { max-width: 260px; }
.contact-form { display: grid; gap: 12px; max-width: 640px; }
.status { min-height: 1.2em; color: var(--muted); font-size: 14px; }
.site-footer { border-top: 1px solid var(--line); margin-top: 48px; padding: 24px 0 40px; color: var(--muted); font-size: 14px; }
@media (max-width: 800px) {
  .hero, .feature-grid, .card-grid { grid-template-columns: 1fr; }
  .nav-links a:not(.button) { display: none; }
  .hero-photo img, .card img { height: 240px; }
}
`;
}

function buildHtml(brief: WebsiteBrief, preset: SitePreset): string {
  const name = escapeHtml(brief.name);
  const tagline = escapeHtml(brief.tagline);
  const features = preset.features.map((feature) => (
    `<article class="feature"><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.body)}</p></article>`
  )).join("\n          ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="true">
  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="#top">${name}</a>
      <nav class="nav-links">
        <a href="#work">${escapeHtml(preset.resourceLabel)}</a>
        <a href="#approach">Approach</a>
        <a class="button" href="#contact">Contact</a>
      </nav>
    </div>
  </header>
  <main id="top">
    <section class="wrap hero">
      <div>
        <p class="kicker">${escapeHtml(preset.kicker)}</p>
        <h1>${tagline}</h1>
        <p class="lede">${name} is a full-stack website: this page reads <code>/api/${escapeHtml(preset.resource)}</code> and falls back to seed data in the preview.</p>
        <div class="hero-actions">
          <a class="button" href="#work">View ${escapeHtml(preset.resourceLabel.toLowerCase())}</a>
          <a class="button ghost" href="#contact">Start a conversation</a>
        </div>
      </div>
      <div class="hero-photo">
        <img src="${photo(preset.heroImage, 1600)}" alt="${name}">
      </div>
    </section>
    <section class="wrap features" id="approach">
      <div class="section-head"><h2>How it is built</h2></div>
      <div class="feature-grid">
          ${features}
      </div>
    </section>
    <section class="wrap catalog" id="work">
      <div class="section-head">
        <h2>${escapeHtml(preset.resourceLabel)}</h2>
        <div class="toolbar">
          <input id="search" type="search" placeholder="Search ${escapeHtml(preset.resourceLabel.toLowerCase())}" aria-label="Search">
        </div>
      </div>
      <p class="status" id="api-status" role="status">Loading ${escapeHtml(preset.resourceLabel.toLowerCase())}…</p>
      <div class="card-grid" id="catalog"></div>
    </section>
    <section class="wrap contact" id="contact">
      <div class="section-head"><h2>Contact</h2></div>
      <form class="contact-form" id="contact-form">
        <input name="name" required maxlength="80" placeholder="Your name" aria-label="Your name">
        <textarea name="message" required maxlength="500" rows="5" placeholder="What should we make?" aria-label="Message"></textarea>
        <button type="submit">Send message</button>
        <p class="status" id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer class="site-footer">
    <div class="wrap">${name} · generated full-stack site · <span id="year"></span></div>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function buildClientScript(preset: SitePreset, items: SiteItem[]): string {
  const seed = JSON.stringify({ resource: preset.resource, resourceLabel: preset.resourceLabel, items }, null, 2);
  return `/* Generated by the Lunor.AI website generator */
(function () {
  var SEED = ${seed};
  var catalog = document.getElementById("catalog");
  var search = document.getElementById("search");
  var apiStatus = document.getElementById("api-status");
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var year = document.getElementById("year");
  var items = SEED.items.slice();

  if (year) year.textContent = String(new Date().getFullYear());

  function addText(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    return el;
  }

  function render(list) {
    if (!catalog) return;
    catalog.replaceChildren();
    if (!list.length) {
      catalog.appendChild(addText("p", "", "Nothing matches that search."));
      return;
    }
    list.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "card";
      var image = document.createElement("img");
      image.src = item.image;
      image.alt = item.title;
      var body = document.createElement("div");
      body.className = "card-body";
      var meta = document.createElement("div");
      meta.className = "meta";
      meta.appendChild(addText("span", "", item.tag));
      meta.appendChild(addText("span", "", item.meta));
      body.appendChild(meta);
      body.appendChild(addText("h3", "", item.title));
      body.appendChild(addText("p", "", item.summary));
      card.appendChild(image);
      card.appendChild(body);
      catalog.appendChild(card);
    });
  }

  function applySearch() {
    var query = (search && search.value ? search.value : "").trim().toLowerCase();
    var visible = items.filter(function (item) {
      return !query || (item.title + " " + item.summary + " " + item.tag).toLowerCase().indexOf(query) !== -1;
    });
    render(visible);
  }

  render(items);
  if (search) search.addEventListener("input", applySearch);

  fetch("/api/" + SEED.resource)
    .then(function (response) {
      if (!response.ok) throw new Error("Request failed");
      return response.json();
    })
    .then(function (payload) {
      if (!payload || !Array.isArray(payload.items)) throw new Error("Unexpected payload");
      items = payload.items;
      if (apiStatus) apiStatus.textContent = "Loaded " + items.length + " " + SEED.resourceLabel.toLowerCase() + " from the API.";
      applySearch();
    })
    .catch(function () {
      if (apiStatus) apiStatus.textContent = "Showing seed data. Run node server/server.js to load /api/" + SEED.resource + ".";
    });

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var body = {
        name: String(data.get("name") || "").trim(),
        message: String(data.get("message") || "").trim()
      };
      if (!body.name || !body.message) {
        if (formStatus) formStatus.textContent = "Name and message are required.";
        return;
      }
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      }).then(function () {
        form.reset();
        if (formStatus) formStatus.textContent = "Message received by the API.";
      }).catch(function () {
        if (formStatus) formStatus.textContent = "Saved in this preview only. Start the server to POST /api/messages.";
      });
    });
  }
})();
`;
}

function buildServer(brief: WebsiteBrief, preset: SitePreset): string {
  const siteName = JSON.stringify(brief.name);
  return `/* Generated by the Lunor.AI website generator */
const http = require("http");
const fs = require("fs");
const path = require("path");
const data = require("./data");

const PORT = Number(process.env.PORT) || 3000;
const clientDir = path.resolve(__dirname, "..", "client");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(body));
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
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url || "/", "http://" + (req.headers.host || "localhost"));

  if (url.pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, site: ${siteName}, resource: data.site.resource });
    return;
  }

  if (url.pathname === "/api/" + data.site.resource && req.method === "GET") {
    sendJson(res, 200, { items: data.items });
    return;
  }

  if (url.pathname === "/api/messages" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const name = String(body.name || "").trim();
      const message = String(body.message || "").trim();
      if (!name || !message) {
        sendJson(res, 400, { error: "Name and message are required." });
        return;
      }
      sendJson(res, 201, { ok: true, received: { name: name.slice(0, 80), message: message.slice(0, 500) } });
    } catch (error) {
      sendJson(res, 400, { error: error.message || "Invalid request" });
    }
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  let relative = decodeURIComponent(url.pathname);
  if (relative === "/") relative = "/index.html";
  const filePath = path.resolve(clientDir, "." + relative);
  if (filePath !== clientDir && !filePath.startsWith(clientDir + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, buffer) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const type = MIME[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(buffer);
  });
});

server.listen(PORT, () => {
  console.log(${siteName} + " running at http://localhost:" + PORT);
  console.log("GET /api/" + data.site.resource);
});
`;
}

function buildDataModule(brief: WebsiteBrief, preset: SitePreset, items: SiteItem[]): string {
  const payload = {
    site: {
      name: brief.name,
      tagline: brief.tagline,
      resource: preset.resource,
      resourceLabel: preset.resourceLabel,
    },
    items,
  };
  return `/* Generated by the Lunor.AI website generator */
module.exports = ${JSON.stringify(payload, null, 2)};
`;
}

function buildPackageJson(brief: WebsiteBrief): string {
  return JSON.stringify({
    name: slugify(brief.name),
    version: "1.0.0",
    private: true,
    description: `${brief.name} full-stack website generated by Lunor.AI`,
    scripts: { start: "node server/server.js" },
  }, null, 2) + "\n";
}

function buildReadme(brief: WebsiteBrief, preset: SitePreset): string {
  return `# ${brief.name}

Full-stack ${brief.kind} website generated by the Lunor.AI Web Development assistant.

${brief.tagline}

## Run

\`\`\`bash
node server/server.js
\`\`\`

Open http://localhost:3000.

## Layout

- \`client/index.html\` — page structure
- \`client/styles.css\` — layout and theme
- \`client/app.js\` — renders the catalog and posts the contact form
- \`server/data.js\` — seed content
- \`server/server.js\` — static files plus JSON API

## API

- \`GET /api/health\`
- \`GET /api/${preset.resource}\`
- \`POST /api/messages\` with \`{ "name": "...", "message": "..." }\`

The preview in Lunor uses the seed data inside \`client/app.js\` when the API is not running. Edit \`server/data.js\` and the matching seed in \`client/app.js\` together, or point the page only at the API once you are serving it with Node.
`;
}

function buildSummary(brief: WebsiteBrief, preset: SitePreset, files: GeneratedFile[]): string {
  const listing = files.map((file) => `- \`${file.path}\``).join("\n");
  return [
    `Generated **${brief.name}**, a full-stack ${brief.kind} website, and applied it to this workspace.`,
    "",
    brief.tagline,
    "",
    "### Project files",
    listing,
    "",
    "### API",
    "- `GET /api/health`",
    `- \`GET /api/${preset.resource}\``,
    "- `POST /api/messages`",
    "",
    "The preview uses seed data in `client/app.js`. Start the API from the project root:",
    "",
    "```bash",
    "node server/server.js",
    "```",
    "",
    "Then open http://localhost:3000. The page and the API share the records in `server/data.js`.",
  ].join("\n");
}

export function generateFullStackWebsite(brief: WebsiteBrief): GeneratedWebsite {
  const preset = PRESETS[brief.kind];
  const items = preset.items;
  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: buildHtml(brief, preset) },
    { path: "client/styles.css", language: "css", content: buildStyles(preset) },
    { path: "client/app.js", language: "javascript", content: buildClientScript(preset, items) },
    { path: "server/server.js", language: "javascript", content: buildServer(brief, preset) },
    { path: "server/data.js", language: "javascript", content: buildDataModule(brief, preset, items) },
    { path: "package.json", language: "json", content: buildPackageJson(brief) },
    { path: "README.md", language: "markdown", content: buildReadme(brief, preset) },
  ];
  return {
    brief,
    files,
    apiResource: preset.resource,
    summary: buildSummary(brief, preset, files),
  };
}

export function filesToTree(files: GeneratedFile[]): GeneratedTreeNode[] {
  const root: GeneratedTreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let siblings = root;
    let accumulated = "";
    parts.forEach((part, index) => {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = siblings.find((entry) => entry.name === part && entry.type === (isFile ? "file" : "folder"));
      if (!node) {
        node = isFile
          ? { id: accumulated, name: part, type: "file", language: file.language, content: file.content }
          : { id: accumulated, name: part, type: "folder", isOpen: true, children: [] };
        siblings.push(node);
      } else if (isFile) {
        node.content = file.content;
        node.language = file.language;
      }
      if (!isFile) siblings = node.children || (node.children = []);
    });
  }
  return root;
}

export function mergeGeneratedFiles(tree: GeneratedTreeNode[], files: GeneratedFile[]): GeneratedTreeNode[] {
  const cloned = JSON.parse(JSON.stringify(tree)) as GeneratedTreeNode[];
  return upsertAll(cloned, files);
}

function upsertAll(tree: GeneratedTreeNode[], files: GeneratedFile[]): GeneratedTreeNode[] {
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let siblings = tree;
    let accumulated = "";
    parts.forEach((part, index) => {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = siblings.find((entry) => entry.id === accumulated || (entry.name === part && entry.type === (isFile ? "file" : "folder")));
      if (!node) {
        node = isFile
          ? { id: accumulated, name: part, type: "file", language: file.language, content: file.content }
          : { id: accumulated, name: part, type: "folder", isOpen: true, children: [] };
        siblings.push(node);
      } else if (isFile) {
        node.type = "file";
        node.content = file.content;
        node.language = file.language;
        node.name = part;
        node.id = accumulated;
      } else {
        node.isOpen = true;
        node.children = node.children || [];
      }
      if (!isFile) siblings = node.children || [];
    });
  }
  return tree;
}

export function assistantIntro(domainName: string, cleared = false): string | null {
  const domainId = domainName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (domainId !== "web-development") return null;
  const lead = cleared
    ? "Chat cleared. I am your **Web Development** assistant."
    : "I am your **Web Development** assistant.";
  return `${lead}\n\nUse **Website generator** to scaffold a full-stack site: a previewable page plus a Node API. You can also ask me to build a landing page, portfolio, shop, blog, or SaaS site in your own words.\n\nGenerated files are **applied to this workspace** automatically.`;
}

export function projectPathForBlock(filename: string): string {
  const normalized = filename.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) return `src/${filename.split("/").pop() || "untitled.js"}`;
  return normalized.includes("/") ? normalized : `src/${normalized}`;
}
