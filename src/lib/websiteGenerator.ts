/**
 * Full-stack website generator for the web-development AI assistant.
 * Turns a short prompt into a previewable site plus an Express API.
 */

export type SiteKind = "landing" | "portfolio" | "blog" | "restaurant" | "saas" | "store";

export interface WebsiteFile {
  filename: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: SiteKind;
  brand: string;
  files: WebsiteFile[];
  markdown: string;
}

export interface WebsitePreset {
  id: SiteKind;
  label: string;
  prompt: string;
}

export const WEBSITE_GENERATOR_PRESETS: WebsitePreset[] = [
  { id: "landing", label: "Landing", prompt: "Generate a full-stack landing page website for a studio called Northstar" },
  { id: "portfolio", label: "Portfolio", prompt: "Create a portfolio website for a designer called Atelier" },
  { id: "blog", label: "Blog", prompt: "Build a blog website called Field Notes" },
  { id: "restaurant", label: "Restaurant", prompt: "Generate a restaurant website for a cafe called Luna" },
  { id: "saas", label: "SaaS", prompt: "Create a full-stack SaaS landing page website called Harbor" },
  { id: "store", label: "Store", prompt: "Build an online store website called Marlowe" },
];

interface Palette {
  bg: string;
  ink: string;
  muted: string;
  surface: string;
  line: string;
  accent: string;
  accentInk: string;
  display: string;
  body: string;
}

interface SiteItem {
  title: string;
  text: string;
  image: string;
  meta: string;
}

interface SiteFeature {
  title: string;
  text: string;
}

interface SiteContent {
  kind: SiteKind;
  brand: string;
  kicker: string;
  tagline: string;
  description: string;
  cta: string;
  itemsTitle: string;
  features: SiteFeature[];
  items: SiteItem[];
  cart: boolean;
  palette: Palette;
  heroImage: string;
}

const SITE_TARGET = /\b(website|web\s*site|landing\s+page|full[\s-]?stack|online\s+store|web\s*shop)\b/i;
const KIND_SITE = /\b(portfolio|blog|restaurant|cafe|café|saas|store|shop)\s+(website|site|page)\b/i;
const BUILD_VERB = /\b(build|create|make|generate|scaffold|design|code|prototype)\b/i;

export function isWebsiteGenerationRequest(prompt: string): boolean {
  const text = prompt.trim();
  if (!text) return false;
  if (!SITE_TARGET.test(text) && !KIND_SITE.test(text)) return false;
  return BUILD_VERB.test(text) || /\bwebsite generator\b/i.test(text);
}

export function detectSiteKind(prompt: string): SiteKind {
  const text = prompt.toLowerCase();
  if (/\b(restaurant|cafe|café|coffee|bakery|bistro|eatery|menu)\b/.test(text)) return "restaurant";
  if (/\b(online\s+store|e-?commerce|boutique|catalog|shop|store)\b/.test(text)) return "store";
  if (/\b(blog|magazine|journal|articles)\b/.test(text)) return "blog";
  if (/\b(portfolio|photographer|case study|designer)\b/.test(text)) return "portfolio";
  if (/\b(saas|software|startup)\b/.test(text)) return "saas";
  return "landing";
}

export function generateWebsite(prompt: string): GeneratedWebsite {
  const site = buildSite(prompt);
  const files: WebsiteFile[] = [
    { filename: "index.html", language: "html", content: renderHtml(site) },
    { filename: "style.css", language: "css", content: renderCss(site) },
    { filename: "app.js", language: "javascript", content: renderClientJs() },
    { filename: "server.js", language: "javascript", content: renderServerJs(site) },
    { filename: "package.json", language: "json", content: renderPackageJson(site) },
    { filename: "README.md", language: "markdown", content: renderReadme(site) },
  ];

  return {
    kind: site.kind,
    brand: site.brand,
    files,
    markdown: renderMarkdown(site, files),
  };
}

function buildSite(prompt: string): SiteContent {
  const kind = detectSiteKind(prompt);
  const preset = KIND_PRESETS[kind];
  const brand = extractBrand(prompt, preset.brand);
  return { ...preset, kind, brand, cart: kind === "store" };
}

function extractBrand(prompt: string, fallback: string): string {
  const quoted = prompt.match(/["“']([^"”']{2,48})["”']/);
  if (quoted) return titleCase(quoted[1]);
  const called = prompt.match(/\b(?:called|named)\s+([a-zA-Z][\w'’-]*(?:\s+[a-zA-Z][\w'’-]*){0,3})/i);
  if (!called) return fallback;
  const raw = called[1].replace(/\b(website|site|page|store|blog|with|using)\b.*$/i, "").trim();
  return raw.length >= 2 ? titleCase(raw) : fallback;
}

function titleCase(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function photo(id: string, width = 1200, height = 800): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "website";
}

function publicPayload(site: SiteContent) {
  return {
    brand: site.brand,
    kind: site.kind,
    tagline: site.tagline,
    description: site.description,
    itemsTitle: site.itemsTitle,
    cart: site.cart,
    items: site.items,
  };
}

function renderMarkdown(site: SiteContent, files: WebsiteFile[]): string {
  const intro = [
    `Built a full-stack **${site.brand}** ${site.kind} website and applied the files to the editor.`,
    "",
    "The live preview uses `index.html`, `style.css`, and `app.js`. `server.js` is the Express API (`GET /api/health`, `GET /api/site`, `POST /api/messages`).",
    "",
    "From the `src` folder:",
    "",
    "    npm install",
    "    node server.js",
    "",
    "Open http://localhost:3000. The page still renders when the API is offline, and the contact form keeps a copy in the browser.",
    "",
  ].join("\n");

  const blocks = files
    .map((file) => `${file.filename}\n\`\`\`${file.language}\n${file.content.trimEnd()}\n\`\`\``)
    .join("\n\n");

  return `${intro}\n${blocks}`;
}

function cardHtml(item: SiteItem, showAdd: boolean): string {
  return `<article class="card">
        <img src="${esc(item.image)}" alt="${esc(item.title)}" />
        <div class="card-body">
          ${item.meta ? `<p class="meta">${esc(item.meta)}</p>` : ""}
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
          ${showAdd ? `<button type="button" data-add="${esc(item.title)}">Add to cart</button>` : ""}
        </div>
      </article>`;
}

function renderHtml(site: SiteContent): string {
  const features = site.features
    .map((feature) => `<article class="feature"><h3>${esc(feature.title)}</h3><p>${esc(feature.text)}</p></article>`)
    .join("\n        ");
  const cards = site.items.map((item) => cardHtml(item, site.cart)).join("\n      ");
  const cart = site.cart ? `<span class="cart" aria-live="polite">Cart <strong id="cart-count">0</strong></span>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(site.brand)}</title>
  <meta name="description" content="${esc(site.tagline)}" />
  <link rel="stylesheet" href="style.css" />
</head>
<body data-themed>
  <header class="site-header">
    <a class="brand" href="#top">${esc(site.brand)}</a>
    <button id="nav-toggle" class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
    <nav id="nav-links" class="nav-links">
      <a href="#work">${esc(site.itemsTitle)}</a>
      <a href="#contact">Contact</a>
    </nav>
    ${cart}
    <span id="api-status" class="status">Checking API…</span>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="kicker">${esc(site.kicker)}</p>
        <h1>${esc(site.brand)}</h1>
        <p class="tagline" data-bind="tagline">${esc(site.tagline)}</p>
        <p data-bind="description">${esc(site.description)}</p>
        <div class="hero-actions">
          <a class="button" href="#work">${esc(site.cta)}</a>
          <a class="button button-quiet" href="#contact">Talk to us</a>
        </div>
      </div>
      <img class="hero-image" src="${esc(site.heroImage)}" alt="${esc(site.brand)} highlight" />
    </section>

    <section class="features" aria-label="Highlights">
      <div class="feature-grid">
        ${features}
      </div>
    </section>

    <section id="work" class="work">
      <div class="section-heading">
        <h2>${esc(site.itemsTitle)}</h2>
      </div>
      <div id="item-grid" class="card-grid">
      ${cards}
      </div>
    </section>

    <section id="contact" class="contact">
      <div>
        <h2>Contact ${esc(site.brand)}</h2>
        <p>Send a note. The form posts to <code>POST /api/messages</code> when the API is running.</p>
      </div>
      <form id="contact-form">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" autocomplete="name" required />
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required />
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="4" required></textarea>
        <button type="submit">Send message</button>
        <p id="form-note" class="form-note" role="status"></p>
      </form>
    </section>
  </main>

  <footer class="site-footer">
    <p>${esc(site.brand)} · generated by the Lunor.AI website generator</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderCss(site: SiteContent): string {
  const palette = site.palette;
  return `:root {
  --bg: ${palette.bg};
  --ink: ${palette.ink};
  --muted: ${palette.muted};
  --surface: ${palette.surface};
  --line: ${palette.line};
  --accent: ${palette.accent};
  --accent-ink: ${palette.accentInk};
  --display: ${palette.display};
  --body: ${palette.body};
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--body);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
button, .button, input, textarea { font: inherit; }
code { font-family: "SFMono-Regular", ui-monospace, monospace; font-size: 0.92em; }

.site-header, .hero, .features, .work, .contact, .site-footer {
  width: min(1120px, calc(100% - 2rem));
  margin-inline: auto;
}
.site-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 0;
}
.brand {
  font-family: var(--display);
  font-size: 1.35rem;
  text-decoration: none;
  letter-spacing: -0.03em;
}
.nav-links { display: flex; gap: 1rem; margin-left: auto; }
.nav-links a { text-decoration: none; color: var(--muted); }
.nav-links a:hover { color: var(--ink); }
.nav-toggle { display: none; }
.status, .cart {
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  font-size: 0.75rem;
  color: var(--muted);
}
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2.5rem;
  align-items: center;
  padding: 1rem 0 3rem;
}
.kicker {
  margin: 0 0 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--accent);
}
h1, h2, h3 { font-family: var(--display); letter-spacing: -0.03em; }
h1 { font-size: clamp(3rem, 7vw, 5.4rem); line-height: 0.92; margin: 0 0 0.8rem; }
.tagline { font-size: 1.25rem; margin: 0 0 0.6rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 1.4rem; }
.button, button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  text-decoration: none;
  padding: 0.75rem 1.1rem;
  cursor: pointer;
}
.button-quiet, .card button {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
}
.hero-image {
  width: 100%;
  height: min(520px, 70vw);
  object-fit: cover;
  border-radius: 1.4rem;
  border: 1px solid var(--line);
}
.feature-grid, .card-grid {
  display: grid;
  gap: 1rem;
}
.feature-grid { grid-template-columns: repeat(3, 1fr); }
.card-grid { grid-template-columns: repeat(2, 1fr); }
.feature, .card, .contact form {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 1rem;
}
.feature { padding: 1.1rem 1.2rem; }
.feature p, .card p, .contact p { color: var(--muted); }
.work { padding: 2.5rem 0; }
.section-heading h2 { font-size: clamp(2rem, 4vw, 3rem); margin: 0 0 1rem; }
.card img { height: 220px; width: 100%; object-fit: cover; border-radius: 1rem 1rem 0 0; }
.card-body { padding: 1rem 1.1rem 1.2rem; }
.meta { margin: 0 0 0.3rem; color: var(--accent); font-size: 0.85rem; }
.contact {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 1.5rem;
  padding-bottom: 3rem;
}
form { display: grid; gap: 0.45rem; padding: 1.1rem; }
input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink);
  border-radius: 0.7rem;
  padding: 0.7rem 0.8rem;
}
.form-note { min-height: 1.2rem; }
.site-footer { padding: 1rem 0 2rem; color: var(--muted); }

@media (max-width: 800px) {
  .hero, .feature-grid, .card-grid, .contact { grid-template-columns: 1fr; }
  .site-header { position: relative; flex-wrap: wrap; }
  .nav-toggle { display: inline-flex; margin-left: auto; }
  .status, .cart { flex-basis: 100%; margin-left: 0; }
  .nav-links {
    display: none;
    position: absolute;
    top: 4.5rem;
    left: 1rem;
    right: 1rem;
    z-index: 2;
    padding: 0.8rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 0.8rem;
    flex-direction: column;
  }
  .nav-links.open { display: flex; }
}
`;
}

function renderClientJs(): string {
  return `document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("api-status");
  const setStatus = (text) => {
    if (status) status.textContent = text;
  };

  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  navToggle?.addEventListener("click", () => {
    const open = navLinks?.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  let cart = 0;
  document.body.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-add]") : null;
    if (!target) return;
    cart += 1;
    const count = document.getElementById("cart-count");
    if (count) count.textContent = String(cart);
  });

  const form = document.getElementById("contact-form");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const note = document.getElementById("form-note");
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };
    if (!data.name || !data.email || !data.message) {
      if (note) note.textContent = "Please fill in every field.";
      return;
    }
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Request failed");
      if (note) note.textContent = "Message saved on the server.";
      form.reset();
    } catch {
      const key = "lunor-site-messages";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing));
      if (note) note.textContent = "Saved in this browser. Start the API with npm start to store messages on the server.";
    }
  });

  hydrate(setStatus);
});

async function hydrate(setStatus) {
  try {
    const response = await fetch("/api/site");
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    applySite(data);
    setStatus("API connected");
  } catch {
    setStatus("Preview mode");
  }
}

function applySite(data) {
  const tagline = document.querySelector("[data-bind='tagline']");
  if (tagline && data.tagline) tagline.textContent = data.tagline;
  const description = document.querySelector("[data-bind='description']");
  if (description && data.description) description.textContent = data.description;
  const grid = document.getElementById("item-grid");
  if (!grid || !Array.isArray(data.items)) return;
  grid.innerHTML = data.items.map((item) => cardHtml(item, Boolean(data.cart))).join("");
}

function cardHtml(item, showAdd) {
  const meta = item.meta ? '<p class="meta">' + escapeHtml(item.meta) + "</p>" : "";
  const button = showAdd ? '<button type="button" data-add="' + escapeHtml(item.title) + '">Add to cart</button>' : "";
  return '<article class="card"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" /><div class="card-body">' + meta + "<h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.text) + "</p>" + button + "</div></article>";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
`;
}

function renderServerJs(site: SiteContent): string {
  const payload = JSON.stringify(publicPayload(site), null, 2);
  return `/**
 * Express API for the ${site.brand} website.
 * The editor preview skips this file in the browser.
 * Run it with Node from this folder:
 *   npm install
 *   node server.js
 */
const site = ${payload};

if (typeof window !== "undefined") {
  console.info("server.js runs in Node. From this folder: npm install && node server.js");
} else {
  const express = require("express");
  const path = require("path");
  const app = express();
  const messages = [];

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: site.brand });
  });

  app.get("/api/site", (_req, res) => {
    res.json(site);
  });

  app.get("/api/messages", (_req, res) => {
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const message = String(req.body?.message || "").trim();
    if (!name || !email || !message) {
      res.status(400).json({ error: "name, email, and message are required" });
      return;
    }
    const entry = {
      id: messages.length + 1,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };
    messages.push(entry);
    res.status(201).json(entry);
  });

  app.use(express.static(path.join(__dirname)));

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(site.brand + " website listening on http://localhost:" + port);
  });
}
`;
}

function renderPackageJson(site: SiteContent): string {
  return JSON.stringify(
    {
      name: slug(site.brand),
      version: "1.0.0",
      private: true,
      description: `${site.brand} website generated by Lunor.AI`,
      main: "server.js",
      scripts: {
        start: "node server.js",
      },
      dependencies: {
        express: "^4.21.2",
      },
    },
    null,
    2,
  ) + "\n";
}

function renderReadme(site: SiteContent): string {
  return `# ${site.brand}

Full-stack ${site.kind} website generated by the Lunor.AI web development assistant.

## Files

- index.html — page structure
- style.css — layout and theme
- app.js — navigation, cart, contact form, and API hydration
- server.js — Express API
- package.json — Node dependencies

## Run the API

    npm install
    npm start

Open http://localhost:3000

## API

- GET /api/health
- GET /api/site
- GET /api/messages
- POST /api/messages with JSON name, email, and message

The page still works in the editor preview when this server is not running.
`;
}

const KIND_PRESETS: Record<SiteKind, Omit<SiteContent, "kind" | "cart">> = {
  landing: {
    brand: "Northstar",
    kicker: "Studio",
    tagline: "Websites and product launches with a clear point of view.",
    description: "Northstar pairs a public site with a small API so the page you preview is the same one the server can update.",
    cta: "See the work",
    itemsTitle: "Selected work",
    heroImage: photo("1553877522-43269d4ea984"),
    palette: {
      bg: "#f4f0e6",
      ink: "#1c1915",
      muted: "#5c564c",
      surface: "#fffdf8",
      line: "#e4dccb",
      accent: "#c45c26",
      accentInk: "#fffaf3",
      display: '"Iowan Old Style", Palatino, Georgia, serif',
      body: '"Avenir Next", "Segoe UI", sans-serif',
    },
    features: [
      { title: "Positioning", text: "A homepage that says what the studio does in one glance." },
      { title: "Proof", text: "Case studies with real photography instead of empty placeholders." },
      { title: "Inbox", text: "Contact messages land in the API when the server is running." },
    ],
    items: [
      { title: "Harbor launch", text: "A product site with a quiet palette and a fast first screen.", image: photo("1498050108023-c5249f4df085"), meta: "Product" },
      { title: "Field office", text: "Editorial layout for a research team that publishes weekly.", image: photo("1522202176988-66273c2fd55f"), meta: "Brand" },
      { title: "Market day", text: "A catalog page that still reads well on a phone.", image: photo("1441986300917-64674bd600d8"), meta: "Commerce" },
      { title: "Night shift", text: "Dashboard marketing page for an on-call operations tool.", image: photo("1461749280684-dccba630e2f6"), meta: "Software" },
    ],
  },
  portfolio: {
    brand: "Atelier",
    kicker: "Portfolio",
    tagline: "Selected design work, written like a studio visit.",
    description: "Projects stay in the page for preview and are also served from GET /api/site.",
    cta: "View projects",
    itemsTitle: "Projects",
    heroImage: photo("1542621334-a254cf47733d"),
    palette: {
      bg: "#141210",
      ink: "#f3efe7",
      muted: "#b7b0a4",
      surface: "#1e1b18",
      line: "#3a342c",
      accent: "#e27d60",
      accentInk: "#1a120f",
      display: '"Iowan Old Style", Palatino, Georgia, serif',
      body: '"Avenir Next", "Segoe UI", sans-serif',
    },
    features: [
      { title: "Identity", text: "Type, color, and photography chosen per client." },
      { title: "Interfaces", text: "Screens that stay readable after the first scroll." },
      { title: "Handoff", text: "A contact form the API can store." },
    ],
    items: [
      { title: "Print room", text: "A gallery site for a letterpress shop.", image: photo("1513364776144-60967b0f800f"), meta: "2024" },
      { title: "Coastal notes", text: "Art direction for a travel journal.", image: photo("1476514525535-07fb3b4a6e29"), meta: "2025" },
      { title: "Studio desk", text: "Portfolio system with a dark reading theme.", image: photo("1498050108023-c5249f4df085"), meta: "2025" },
      { title: "Object study", text: "Product photography layout for a ceramics line.", image: photo("1561070791-2526d30994b5"), meta: "2026" },
    ],
  },
  blog: {
    brand: "Field Notes",
    kicker: "Journal",
    tagline: "Essays on making software, cities, and food.",
    description: "Posts render in the page immediately. The API can replace them when the server is up.",
    cta: "Read the journal",
    itemsTitle: "Latest essays",
    heroImage: photo("1481627834876-b7833e8f5570"),
    palette: {
      bg: "#f7f3ea",
      ink: "#1f2a24",
      muted: "#5d6b63",
      surface: "#fffdf8",
      line: "#ddd4c4",
      accent: "#2f6f4e",
      accentInk: "#f4fff8",
      display: "Georgia, 'Iowan Old Style', serif",
      body: '"Avenir Next", "Segoe UI", sans-serif',
    },
    features: [
      { title: "Long reads", text: "Comfortable measure and a paper background." },
      { title: "Topics", text: "Each card carries a short kicker and a photo." },
      { title: "Letters", text: "Readers can write in through the contact form." },
    ],
    items: [
      { title: "A smaller homepage", text: "Why the first screen should do one job.", image: photo("1456513080510-7bf3a84b82f8"), meta: "Design" },
      { title: "Servers you can read", text: "A short API is easier to trust than a hidden one.", image: photo("1461749280684-dccba630e2f6"), meta: "Engineering" },
      { title: "Kitchen light", text: "Notes from a week of cooking for friends.", image: photo("1504674900247-0877df9cc836"), meta: "Food" },
      { title: "Walking maps", text: "How a city guide can stay useful offline.", image: photo("1476514525535-07fb3b4a6e29"), meta: "Places" },
    ],
  },
  restaurant: {
    brand: "Luna",
    kicker: "Cafe",
    tagline: "Seasonal plates, late coffee, and a short menu that changes weekly.",
    description: "The menu is baked into the page for preview and served again from the API.",
    cta: "See the menu",
    itemsTitle: "This week",
    heroImage: photo("1414235077428-338989a2e8c0"),
    palette: {
      bg: "#1a120e",
      ink: "#f6efe4",
      muted: "#d9cbb8",
      surface: "#261910",
      line: "#4a382c",
      accent: "#e6b15c",
      accentInk: "#1a120e",
      display: "Palatino, 'Iowan Old Style', Georgia, serif",
      body: '"Avenir Next", "Segoe UI", sans-serif',
    },
    features: [
      { title: "Dinner", text: "Four plates, written the way the kitchen says them." },
      { title: "Coffee", text: "Open early, with a counter you can reserve by message." },
      { title: "Reservations", text: "The form posts to the API when Node is running." },
    ],
    items: [
      { title: "Citrus fennel salad", text: "Olive oil, toasted almond, and a sharp dressing.", image: photo("1504674900247-0877df9cc836"), meta: "12" },
      { title: "Roasted squash", text: "Chili honey and browned butter.", image: photo("1476224203421-9ac39bcb3327"), meta: "18" },
      { title: "Market fish", text: "Charred lemon and herbs from the patio.", image: photo("1565299624946-b28f40a0ae38"), meta: "26" },
      { title: "Olive oil cake", text: "Served warm with cream.", image: photo("1555396273-367ea4eb4db5"), meta: "9" },
    ],
  },
  saas: {
    brand: "Harbor",
    kicker: "Software",
    tagline: "A calm home for the work your team keeps losing in chat.",
    description: "Marketing page up front, JSON API behind it, so the same copy can be edited on the server.",
    cta: "Explore Harbor",
    itemsTitle: "What it keeps",
    heroImage: photo("1552664730-d307ca884978"),
    palette: {
      bg: "#f3f6f8",
      ink: "#102027",
      muted: "#4d616b",
      surface: "#ffffff",
      line: "#d5e0e6",
      accent: "#0f766e",
      accentInk: "#f0fdfa",
      display: '"Avenir Next", "Segoe UI", sans-serif',
      body: '"Avenir Next", "Segoe UI", sans-serif',
    },
    features: [
      { title: "Shared notes", text: "Decisions stay next to the work they changed." },
      { title: "Quiet alerts", text: "Only the updates someone asked to see." },
      { title: "Simple API", text: "Health check, site content, and a message inbox." },
    ],
    items: [
      { title: "Briefs", text: "One page for the goal, the owner, and the date.", image: photo("1553877522-43269d4ea984"), meta: "Plan" },
      { title: "Handoffs", text: "What shipped, what is stuck, and who is next.", image: photo("1522202176988-66273c2fd55f"), meta: "Team" },
      { title: "Status", text: "A health endpoint you can curl before a demo.", image: photo("1461749280684-dccba630e2f6"), meta: "API" },
      { title: "Inbox", text: "Trial requests stored by the Express server.", image: photo("1600880292203-757bb62b4baf"), meta: "Leads" },
    ],
  },
  store: {
    brand: "Marlowe",
    kicker: "Shop",
    tagline: "Objects for the desk, the kitchen, and the walk to work.",
    description: "Add items to a cart in the preview. Product copy also comes from GET /api/site.",
    cta: "Browse the shop",
    itemsTitle: "In stock",
    heroImage: photo("1441986300917-64674bd600d8"),
    palette: {
      bg: "#f6f1eb",
      ink: "#2a211b",
      muted: "#6b5c52",
      surface: "#fffaf6",
      line: "#eadfd4",
      accent: "#7a2f3b",
      accentInk: "#fff7f5",
      display: '"Iowan Old Style", Palatino, Georgia, serif',
      body: '"Avenir Next", "Segoe UI", sans-serif',
    },
    features: [
      { title: "Small batch", text: "A short catalog instead of an endless grid." },
      { title: "Cart", text: "Add buttons update the count in the header." },
      { title: "Orders", text: "Questions go through the contact API." },
    ],
    items: [
      { title: "Linen notebook", text: "Plain paper, sewn binding, pocket in the back.", image: photo("1481627834876-b7833e8f5570"), meta: "$24" },
      { title: "Stoneware cup", text: "Holds a large coffee and stacks in a cupboard.", image: photo("1504674900247-0877df9cc836"), meta: "$32" },
      { title: "Wool scarf", text: "Undyed, long enough to wrap twice.", image: photo("1483985988355-763728e1935b"), meta: "$68" },
      { title: "Desk lamp", text: "Warm light, small base, brass joint.", image: photo("1513364776144-60967b0f800f"), meta: "$120" },
    ],
  },
};
