/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a previewable HTML/CSS/JS frontend and an Express API that
 * serves the same content. The page works in the in-editor preview
 * without the server, and talks to /api when `node server.js` is running.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "store" | "blog" | "dashboard";

export interface WebsiteFile {
  filename: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  tagline: string;
  files: WebsiteFile[];
}

export interface WebsiteTemplate {
  id: WebsiteKind;
  label: string;
  description: string;
  prompt: string;
}

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "landing",
    label: "Landing",
    description: "Startup page + leads API",
    prompt: "Generate a full-stack landing page website",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Case studies + contact API",
    prompt: "Generate a full-stack portfolio website",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Menu + reservations API",
    prompt: "Generate a full-stack restaurant website",
  },
  {
    id: "store",
    label: "Store",
    description: "Products + orders API",
    prompt: "Generate a full-stack online store website",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Articles + comments API",
    prompt: "Generate a full-stack blog website",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Metrics + analytics API",
    prompt: "Generate a full-stack analytics dashboard website",
  },
];

interface SiteItem {
  name: string;
  detail: string;
  meta: string;
  image: string;
}

interface SiteFeature {
  title: string;
  text: string;
}

interface SiteSpec {
  kind: WebsiteKind;
  title: string;
  tagline: string;
  summary: string;
  accent: string;
  accentSoft: string;
  ink: string;
  heroImage: string;
  nav: string[];
  sectionTitle: string;
  sectionLead: string;
  features: SiteFeature[];
  items: SiteItem[];
  about: string;
  contactLabel: string;
  apiResource: string;
}

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isWebsiteGenerationRequest(text: string): boolean {
  const raw = text.trim();
  if (!raw || raw.length > 600) return false;
  const asksToBuild = /\b(build|create|make|generate|scaffold|design)\b/i.test(raw);
  const namesASite = /\b(full[-\s]?stack|website|web\s*site|landing\s+page|portfolio|online\s+store|restaurant|blog|dashboard)\b/i.test(raw);
  const isQuestion = /\b(explain|what is|how does|why|debug|fix|error)\b/i.test(raw);
  if (isQuestion && !asksToBuild) return false;
  return asksToBuild && namesASite;
}

function inferKind(prompt: string): WebsiteKind {
  const p = prompt.toLowerCase();
  if (/restaurant|cafe|café|bakery|\bmenu\b|\bfood\b/.test(p)) return "restaurant";
  if (/online store|e-?commerce|\bstore\b|\bshop\b|boutique|product/.test(p)) return "store";
  if (/\bblog\b|magazine|newsletter|\barticle/.test(p)) return "blog";
  if (/portfolio|freelancer|case stud|personal site/.test(p)) return "portfolio";
  if (/dashboard|analytics|admin/.test(p)) return "dashboard";
  return "landing";
}

function cleanTitle(raw: string): string {
  const trimmed = raw
    .replace(/\b(full[-\s]?stack|website|web site|landing page|with|using|and a|api)\b.*$/i, "")
    .replace(/[^\w&' .-]/g, "")
    .trim();
  return trimmed.slice(0, 42);
}

function inferTitle(prompt: string, kind: WebsiteKind): string {
  const defaults: Record<WebsiteKind, string> = {
    landing: "Northstar",
    portfolio: "Studio Hale",
    restaurant: "Hearth & Rye",
    store: "Fieldnote Goods",
    blog: "The Lantern",
    dashboard: "Pulseboard",
  };
  const quoted = prompt.match(/["“]([^"”]{2,48})["”]/);
  if (quoted) {
    const title = cleanTitle(quoted[1]);
    if (title.length >= 2) return title;
  }
  const named = prompt.match(/\b(?:called|named|for)\s+([A-Z][\w&' .-]{1,48})/);
  if (named) {
    const title = cleanTitle(named[1]);
    if (title.length >= 2) return title;
  }
  return defaults[kind];
}

function buildSpec(prompt: string): SiteSpec {
  const kind = inferKind(prompt);
  const title = inferTitle(prompt, kind);

  const catalogs: Record<WebsiteKind, Omit<SiteSpec, "title">> = {
    landing: {
      kind,
      tagline: "Ship a product people remember.",
      summary: "A marketing site with a working leads API. The preview runs in the browser; the same data is served by Express.",
      accent: "#2ee6a6",
      accentSoft: "rgba(46, 230, 166, 0.16)",
      ink: "#07130f",
      heroImage: img("1498050108023-c5249f4df085", 1800, 1100),
      nav: ["Product", "Stories", "About", "Contact"],
      sectionTitle: "Why teams switch",
      sectionLead: "Three promises, backed by an API your frontend already calls.",
      features: [
        { title: "Live in one file set", text: "HTML, CSS, and JS preview immediately. No build step." },
        { title: "API included", text: "Express serves the same stories and stores contact leads." },
        { title: "Ready to extend", text: "Swap copy, images, and routes without restructuring the app." },
      ],
      items: [
        { name: "Launch week", detail: "A guided release checklist with status your team can share.", meta: "Product", image: img("1555066931-4365d14bab8c") },
        { name: "Customer desk", detail: "Inbound notes land in the leads collection on the server.", meta: "Workflow", image: img("1552664730-d307ca884978") },
        { name: "Signal review", detail: "Weekly highlights pulled from GET /api/items.", meta: "Insights", image: img("1461749280684-dccba630e2f6") },
      ],
      about: `${title} is a small product studio. This generated site is the front door: a fast page plus a JSON API for leads and stories.`,
      contactLabel: "Request a walkthrough",
      apiResource: "leads",
    },
    portfolio: {
      kind,
      tagline: "Selected work, clearly told.",
      summary: "A portfolio with project data from the API and a contact endpoint for new inquiries.",
      accent: "#c4b5fd",
      accentSoft: "rgba(196, 181, 253, 0.16)",
      ink: "#120c1c",
      heroImage: img("1561070791-2526d30994b5", 1800, 1100),
      nav: ["Work", "Studio", "About", "Contact"],
      sectionTitle: "Selected work",
      sectionLead: "Projects load from the API, with a local copy so the preview never goes blank.",
      features: [
        { title: "Case studies", text: "Each project has a title, note, and image served as JSON." },
        { title: "Direct inquiries", text: "The contact form posts to /api/contact." },
        { title: "Quiet layout", text: "Type, space, and one accent color. Nothing extra." },
      ],
      items: [
        { name: "Atlas Archive", detail: "A research library with a calmer reading layout.", meta: "2025", image: img("1481627834876-b7833e8f5570") },
        { name: "Harbor Notes", detail: "Identity and site for an independent publisher.", meta: "2024", image: img("1513364776144-60967b0f800f") },
        { name: "Kindling", detail: "A booking flow for a neighborhood workshop.", meta: "2024", image: img("1498050108023-c5249f4df085") },
      ],
      about: `${title} designs digital places for small teams. The work below is sample data you can replace in server.js.`,
      contactLabel: "Start a project",
      apiResource: "inquiries",
    },
    restaurant: {
      kind,
      tagline: "Seasonal plates. A table when you want one.",
      summary: "A restaurant site with a menu API and a reservation request endpoint.",
      accent: "#f5b942",
      accentSoft: "rgba(245, 185, 66, 0.16)",
      ink: "#1a1208",
      heroImage: img("1414235077428-338989a2e8c0", 1800, 1100),
      nav: ["Menu", "Visit", "About", "Reserve"],
      sectionTitle: "Tonight's menu",
      sectionLead: "Dishes come from GET /api/items. Reservations post to /api/contact.",
      features: [
        { title: "Evening service", text: "Wednesday to Sunday, from 5pm. The bar opens at 4." },
        { title: "Market kitchen", text: "The menu changes with what arrived that morning." },
        { title: "Private corner", text: "A six-seat room. Ask when you reserve." },
      ],
      items: [
        { name: "Rye & honey loaf", detail: "Brown butter, cultured cream, sea salt.", meta: "$9", image: img("1504674900247-0877df9cc836") },
        { name: "Charred greens", detail: "Lemon, chili, toasted seeds.", meta: "$16", image: img("1476224203421-9ac39bcb3327") },
        { name: "Hearth chicken", detail: "Pan juices, herbs, roasted alliums.", meta: "$29", image: img("1555396273-367ea4eb4db5") },
        { name: "Dark chocolate tart", detail: "Olive oil, flake salt.", meta: "$12", image: img("1565299624946-b28f40a0ae38") },
      ],
      about: `${title} cooks over wood in a room that stays a little dim. Use the form to request a table — the API stores the note in memory.`,
      contactLabel: "Request a table",
      apiResource: "reservations",
    },
    store: {
      kind,
      tagline: "Objects for a slower desk.",
      summary: "A storefront with a product API and an order-note endpoint.",
      accent: "#7dd3fc",
      accentSoft: "rgba(125, 211, 252, 0.16)",
      ink: "#071018",
      heroImage: img("1441986300917-64674bd600d8", 1800, 1100),
      nav: ["Goods", "Studio", "About", "Order"],
      sectionTitle: "In the shop",
      sectionLead: "Products load from the API. The form records an order note.",
      features: [
        { title: "Small batches", text: "Each object is numbered. When it's gone, it's gone." },
        { title: "Plain shipping", text: "Packed by hand. Ships within two days." },
        { title: "Order notes", text: "POST /api/contact keeps a message with the request." },
      ],
      items: [
        { name: "Brass ruler", detail: "15cm, engraved on one edge.", meta: "$28", image: img("1472851294608-062f824d29cc") },
        { name: "Ink notebook", detail: "96 pages, lay-flat binding.", meta: "$18", image: img("1483985988355-763728e1935b") },
        { name: "Desk lamp", detail: "Warm LED, linen shade.", meta: "$86", image: img("1556742049-0cfed4f6a45d") },
        { name: "Wool sleeve", detail: "Fits a 13 inch laptop.", meta: "$42", image: img("1607082348824-0a96f2a4b9da") },
      ],
      about: `${title} makes a short list of things meant to stay on a desk for years. Edit the catalog in server.js.`,
      contactLabel: "Send an order note",
      apiResource: "orders",
    },
    blog: {
      kind,
      tagline: "Field notes on making things.",
      summary: "A blog with articles from the API and a note endpoint for readers.",
      accent: "#fb7185",
      accentSoft: "rgba(251, 113, 133, 0.16)",
      ink: "#1a0b10",
      heroImage: img("1456513080510-7bf3a84b82f8", 1800, 1100),
      nav: ["Notes", "Index", "About", "Write"],
      sectionTitle: "Latest notes",
      sectionLead: "Articles are JSON. The preview falls back to the copy bundled in script.js.",
      features: [
        { title: "Short essays", text: "One idea per note. No slideshows." },
        { title: "Reader notes", text: "The form posts a comment payload to the API." },
        { title: "Same source", text: "Frontend and server share one catalog." },
      ],
      items: [
        { name: "Margins first", detail: "Why spacing does more than a new typeface.", meta: "Essay", image: img("1481627834876-b7833e8f5570") },
        { name: "A smaller API", detail: "Three routes are enough for a first site.", meta: "Build", image: img("1517694712202-14dd9538aa97") },
        { name: "Evening edit", detail: "A routine for cutting a draft in half.", meta: "Practice", image: img("1524995997946-a1c2e315a42f") },
      ],
      about: `${title} publishes notes on design and small software. Replace the sample essays in the catalog when you have your own.`,
      contactLabel: "Leave a note",
      apiResource: "notes",
    },
    dashboard: {
      kind,
      tagline: "The numbers, without the noise.",
      summary: "An analytics dashboard. Metrics come from the API and refresh in the page.",
      accent: "#4ade80",
      accentSoft: "rgba(74, 222, 128, 0.16)",
      ink: "#07140c",
      heroImage: img("1553877522-43269d4ea984", 1800, 1100),
      nav: ["Overview", "Reports", "About", "Share"],
      sectionTitle: "This week",
      sectionLead: "Metrics are served by GET /api/items and rendered into the board.",
      features: [
        { title: "One board", text: "Visitors, signups, and replies in a single view." },
        { title: "Share a snapshot", text: "The form sends a summary request to the API." },
        { title: "Local first", text: "If the server is off, the bundled numbers still render." },
      ],
      items: [
        { name: "Visitors", detail: "Unique sessions across the marketing site.", meta: "12.4k", image: img("1460925895917-afdab827c52f") },
        { name: "Signups", detail: "New accounts created since Monday.", meta: "318", image: img("1551288049-bebda4e38f71") },
        { name: "Replies", detail: "Support threads closed under one hour.", meta: "94%", image: img("1552664730-d307ca884978") },
        { name: "Uptime", detail: "API availability over the last 7 days.", meta: "99.9%", image: img("1518770660439-4636190af475") },
      ],
      about: `${title} is a sample analytics home. Point the catalog at your own numbers in server.js when you connect a database.`,
      contactLabel: "Email this snapshot",
      apiResource: "snapshots",
    },
  };

  return { title, ...catalogs[kind] };
}

function renderHtml(spec: SiteSpec): string {
  const features = spec.features
    .map(
      (feature) => `<article class="feature">
        <h3>${esc(feature.title)}</h3>
        <p>${esc(feature.text)}</p>
      </article>`
    )
    .join("\n");

  const links = spec.nav
    .map((label, index) => {
      const href = ["#work", "#work", "#about", "#contact"][index] || "#top";
      return `<a href="${href}">${esc(label)}</a>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(spec.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
  <header class="site-header">
    <a class="logo" href="#top">${esc(spec.title)}</a>
    <button id="nav-toggle" type="button" aria-label="Open menu">Menu</button>
    <nav id="site-nav">${links}</nav>
  </header>
  <main>
    <section class="hero" id="top">
      <div class="hero-copy">
        <p class="eyebrow">${esc(spec.kind)}</p>
        <h1>${esc(spec.tagline)}</h1>
        <p class="lede">${esc(spec.summary)}</p>
        <div class="hero-actions">
          <a class="button" href="#work">${esc(spec.sectionTitle)}</a>
          <a class="button button-ghost" href="#contact">${esc(spec.contactLabel)}</a>
        </div>
      </div>
      <figure class="hero-media">
        <img src="${spec.heroImage}" alt="${esc(spec.title)} cover" />
      </figure>
    </section>
    <section class="band" id="highlights">
      <div class="feature-grid">
        ${features}
      </div>
    </section>
    <section class="section" id="work">
      <div class="section-head">
        <h2>${esc(spec.sectionTitle)}</h2>
        <p>${esc(spec.sectionLead)}</p>
      </div>
      <div id="catalog" class="catalog" aria-live="polite"></div>
    </section>
    <section class="section split" id="about">
      <div>
        <h2>About</h2>
        <p>${esc(spec.about)}</p>
      </div>
      <dl class="facts">
        <div><dt>API</dt><dd>GET /api/site</dd></div>
        <div><dt>Catalog</dt><dd>GET /api/items</dd></div>
        <div><dt>Messages</dt><dd>POST /api/contact</dd></div>
      </dl>
    </section>
    <section class="section" id="contact">
      <div class="section-head">
        <h2>${esc(spec.contactLabel)}</h2>
        <p>Posts to the API. If the server is offline, the form still confirms locally.</p>
      </div>
      <form id="contact-form" class="contact-form">
        <label>Name<input name="name" required maxlength="80" /></label>
        <label>Email<input name="email" type="email" required maxlength="120" /></label>
        <label>Message<textarea name="message" required maxlength="500" rows="4"></textarea></label>
        <button class="button" type="submit">Send</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer class="site-footer">
    <span>${esc(spec.title)}</span>
    <span id="year"></span>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function renderCss(spec: SiteSpec): string {
  return `:root {
  --accent: ${spec.accent};
  --accent-soft: ${spec.accentSoft};
  --ink: ${spec.ink};
  --bg: #0c1014;
  --card: #151b22;
  --line: rgba(255, 255, 255, 0.08);
  --text: #edf2f4;
  --muted: #9aa6b2;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Outfit, sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, var(--accent-soft), transparent 60%),
    var(--bg);
  color: var(--text);
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
.site-header, .section, .band, .site-footer { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.site-header {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 72px;
}
.logo { font-family: Fraunces, serif; font-size: 1.25rem; letter-spacing: -0.03em; }
#nav-toggle {
  margin-left: auto;
  display: none;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 12px;
}
#site-nav { margin-left: auto; display: flex; gap: 18px; color: var(--muted); font-size: 0.92rem; }
#site-nav a:hover { color: var(--text); }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: center;
  padding: 24px 0 12px;
}
.eyebrow {
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  font-size: 0.72rem;
  margin: 0 0 12px;
}
h1, h2, h3 { font-family: Fraunces, serif; font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.6rem, 5vw, 4.6rem); line-height: 0.98; margin: 0 0 16px; }
.lede, .section-head p, .feature p, .facts { color: var(--muted); line-height: 1.6; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--ink);
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 600;
  cursor: pointer;
}
.button-ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
.hero-media img { width: 100%; height: 420px; border-radius: 28px; }
.band { padding: 12px 0 8px; }
.feature-grid, .catalog { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.feature, .card, .contact-form, .facts {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
}
.feature { padding: 18px; }
.feature h3, .card h3 { margin: 0 0 8px; }
.section { padding: 42px 0; }
.section-head { max-width: 640px; margin-bottom: 18px; }
.section-head h2, .split h2 { font-size: clamp(1.8rem, 3vw, 2.6rem); margin: 0 0 8px; }
.card img { height: 180px; width: 100%; border-radius: 16px 16px 0 0; }
.card-body { padding: 14px 16px 16px; }
.meta { color: var(--accent); font-size: 0.85rem; }
.split { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 18px; align-items: start; }
.facts { padding: 8px 18px; }
.facts div { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
.facts div:last-child { border-bottom: 0; }
.facts dt { color: var(--muted); }
.facts dd { margin: 0; }
.contact-form { display: grid; gap: 12px; padding: 18px; max-width: 640px; }
label { display: grid; gap: 6px; font-size: 0.85rem; color: var(--muted); }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #0e141b;
  color: var(--text);
  padding: 12px;
  font: inherit;
}
#form-status { min-height: 1.2em; margin: 0; color: var(--accent); }
.site-footer {
  display: flex;
  justify-content: space-between;
  padding: 28px 0 40px;
  color: var(--muted);
  border-top: 1px solid var(--line);
}
@media (max-width: 800px) {
  #nav-toggle { display: inline-flex; }
  #site-nav {
    display: none;
    position: absolute;
    top: 64px;
    right: 16px;
    padding: 12px;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 16px;
    flex-direction: column;
  }
  #site-nav.open { display: flex; }
  .hero, .split, .feature-grid, .catalog { grid-template-columns: 1fr; }
  .hero-media img { height: 240px; }
}
`;
}

function renderClient(spec: SiteSpec): string {
  const data = {
    title: spec.title,
    items: spec.items,
  };
  return `const FALLBACK = ${JSON.stringify(data, null, 2)};

const catalogEl = document.getElementById("catalog");
const yearEl = document.getElementById("year");
const nav = document.getElementById("site-nav");
const navToggle = document.getElementById("nav-toggle");
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

if (yearEl) yearEl.textContent = String(new Date().getFullYear());

navToggle?.addEventListener("click", () => {
  nav?.classList.toggle("open");
});

function renderItems(items) {
  if (!catalogEl) return;
  catalogEl.innerHTML = items.map((item) => \`
    <article class="card">
      <img src="\${item.image}" alt="\${item.name}" loading="lazy" />
      <div class="card-body">
        <p class="meta">\${item.meta}</p>
        <h3>\${item.name}</h3>
        <p>\${item.detail}</p>
      </div>
    </article>\`).join("");
}

async function loadSite() {
  try {
    const response = await fetch("/api/items");
    if (!response.ok) throw new Error("API unavailable");
    const payload = await response.json();
    renderItems(payload.items || []);
  } catch {
    renderItems(FALLBACK.items);
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(form).entries());
  if (statusEl) statusEl.textContent = "Sending...";
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Request failed");
    if (statusEl) statusEl.textContent = payload.message;
    form.reset();
  } catch (error) {
    if (body.name && body.email && body.message) {
      if (statusEl) statusEl.textContent = "Saved on this page. Start server.js to store it in the API.";
      form.reset();
      return;
    }
    if (statusEl) statusEl.textContent = error.message || "Could not send.";
  }
});

loadSite();
`;
}

function renderServer(spec: SiteSpec): string {
  const site = {
    title: spec.title,
    tagline: spec.tagline,
    summary: spec.summary,
    kind: spec.kind,
  };
  return `import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const site = ${JSON.stringify(site, null, 2)};

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

app.get("/api/site", (_req, res) => {
  res.json(site);
});

app.get("/api/items", (_req, res) => {
  res.json({ items });
});

app.get("/api/contact", (_req, res) => {
  res.json({ ${spec.apiResource}: messages });
});

app.post("/api/contact", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email." });
  }
  const entry = { id: messages.length + 1, name, email, message, createdAt: new Date().toISOString() };
  messages.push(entry);
  res.status(201).json({ message: "Received. We will reply by email.", entry });
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(\`\${site.title} API running at http://localhost:\${PORT}\`);
});
`;
}

function renderPackage(spec: SiteSpec): string {
  const name = spec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "website";
  return JSON.stringify(
    {
      name,
      private: true,
      version: "1.0.0",
      type: "module",
      description: spec.summary,
      scripts: {
        start: "node server.js",
      },
      dependencies: {
        express: "^4.21.2",
      },
    },
    null,
    2
  ) + "\n";
}

function renderReadme(spec: SiteSpec): string {
  return `# ${spec.title}

${spec.tagline}

Generated by the Lunor.AI full-stack website automation for Web Development.

## Files

- \`index.html\`, \`styles.css\`, \`script.js\` — previewable site
- \`server.js\` — Express API (\`GET /api/site\`, \`GET /api/items\`, \`POST /api/contact\`)
- \`package.json\` — start script

## Run the API

\`npm install\`

\`node server.js\`

Open http://localhost:3000. The in-editor preview works without the server because \`script.js\` keeps a local copy of the catalog.
`;
}

export function generateFullStackWebsite(prompt: string): GeneratedWebsite {
  const spec = buildSpec(prompt);
  const files: WebsiteFile[] = [
    { filename: "index.html", language: "html", content: renderHtml(spec) },
    { filename: "styles.css", language: "css", content: renderCss(spec) },
    { filename: "script.js", language: "javascript", content: renderClient(spec) },
    { filename: "server.js", language: "javascript", content: renderServer(spec) },
    { filename: "package.json", language: "json", content: renderPackage(spec) },
    { filename: "README.md", language: "markdown", content: renderReadme(spec) },
  ];
  return {
    kind: spec.kind,
    title: spec.title,
    tagline: spec.tagline,
    files,
  };
}

export function formatWebsiteAssistantMessage(site: GeneratedWebsite): string {
  const files = site.files
    .map((file) => `${file.filename}\n\`\`\`${file.language}\n${file.content.trim()}\n\`\`\``)
    .join("\n\n");
  return `Built **${site.title}** — a full-stack ${site.kind} website. The page is in the editor and the live preview. \`server.js\` is the API.

Run it locally with \`npm install\` then \`node server.js\`.

Included files: index.html, styles.css, script.js, server.js, package.json, README.md.

${files}`;
}
