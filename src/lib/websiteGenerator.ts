/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a previewable vanilla client plus an Express API the user can run locally.
 */

export type SiteKind = "portfolio" | "restaurant" | "saas" | "shop" | "blog";

export interface ProjectFile {
  path: string;
  language: string;
  content: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: TreeNode[];
  isOpen?: boolean;
}

export interface GeneratedWebsite {
  siteName: string;
  kind: SiteKind;
  slug: string;
  files: ProjectFile[];
}

export interface WebsitePrompt {
  id: string;
  label: string;
  prompt: string;
}

export const WEBSITE_GENERATOR_PROMPTS: WebsitePrompt[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    prompt: "Build a full-stack portfolio website for a product designer named Nova Studio",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    prompt: "Create a full-stack restaurant website for Ember & Oak with a menu API",
  },
  {
    id: "saas",
    label: "SaaS",
    prompt: "Generate a full-stack SaaS landing website for a product called Lumen",
  },
  {
    id: "shop",
    label: "Shop",
    prompt: "Build a full-stack storefront website for a ceramics shop called Clay & Co",
  },
];

const DEFAULT_NAMES: Record<SiteKind, string> = {
  portfolio: "Nova Studio",
  restaurant: "Ember & Oak",
  saas: "Lumen",
  shop: "Clay & Co",
  blog: "Field Notes",
};

const LANG_BY_EXT: Record<string, string> = {
  html: "html",
  css: "css",
  js: "javascript",
  json: "json",
  md: "markdown",
  ts: "typescript",
};

interface Palette {
  primary: string;
  accent: string;
  bg: string;
  text: string;
  muted: string;
  card: string;
}

const PALETTES: Record<SiteKind, Palette> = {
  portfolio: { primary: "#c4b5fd", accent: "#8b5cf6", bg: "#0c0a12", text: "#f5f3ff", muted: "#a89cc4", card: "#171322" },
  restaurant: { primary: "#fdba74", accent: "#ea580c", bg: "#140e0b", text: "#fff7ed", muted: "#d6b49a", card: "#241710" },
  saas: { primary: "#5eead4", accent: "#0d9488", bg: "#071311", text: "#ecfdf5", muted: "#99b8b2", card: "#10221f" },
  shop: { primary: "#f9a8d4", accent: "#db2777", bg: "#140910", text: "#fdf2f8", muted: "#d4a8bc", card: "#241018" },
  blog: { primary: "#fde68a", accent: "#d97706", bg: "#12100b", text: "#fffbeb", muted: "#cbbd98", card: "#1e1a12" },
};

interface CatalogItem {
  title: string;
  summary: string;
  tag: string;
  price?: string;
}

interface SiteCopy {
  eyebrow: string;
  headline: string;
  subhead: string;
  cta: string;
  secondary: string;
  features: { title: string; body: string }[];
  catalogTitle: string;
  catalogLead: string;
  items: CatalogItem[];
  hero: string;
  photos: string[];
}

function unsplash(id: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

function copyFor(kind: SiteKind, siteName: string): SiteCopy {
  if (kind === "restaurant") {
    return {
      eyebrow: "Seasonal kitchen",
      headline: `Dinner at ${siteName}`,
      subhead: "Wood fire, a short menu, and a table that stays yours for the evening. Reserve online — the kitchen API keeps covers and the menu in sync.",
      cta: "Reserve a table",
      secondary: "See the menu",
      features: [
        { title: "Fire-led plates", body: "A tight menu that changes with the market, written up each morning." },
        { title: "Open kitchen", body: "Watch the pass from the counter, or take the quieter room in the back." },
        { title: "Live covers", body: "The API tracks seatings so the floor never double-books a night." },
      ],
      catalogTitle: "Tonight's menu",
      catalogLead: "Pulled from /api/content. If the server is offline, the page still shows this menu.",
      items: [
        { title: "Charred citrus salad", summary: "Fennel, olive oil, and toasted seeds.", tag: "Start", price: "14" },
        { title: "Ember chicken", summary: "Brown butter, charred lemon, pan juices.", tag: "Main", price: "32" },
        { title: "Dark chocolate tart", summary: "Sea salt and olive oil.", tag: "Sweet", price: "12" },
      ],
      hero: unsplash("1414235077428-338989a2e8c0", 1600, 1000),
      photos: [
        unsplash("1504674900247-0877df9cc836", 900, 700),
        unsplash("1476224203421-9ac39bcb3327", 900, 700),
        unsplash("1555396273-367ea4eb4db5", 900, 700),
      ],
    };
  }
  if (kind === "saas") {
    return {
      eyebrow: "Product",
      headline: `${siteName} keeps the work in one place`,
      subhead: "A calm workspace for teams who ship. This landing page talks to a small Express API for plans, proof points, and early-access notes.",
      cta: "Start free",
      secondary: "View plans",
      features: [
        { title: "Shared boards", body: "Tasks, owners, and due dates without another tool to check." },
        { title: "Quiet notifications", body: "A daily digest instead of a stream of pings." },
        { title: "API-backed plans", body: "Pricing on this page is served from /api/content." },
      ],
      catalogTitle: "Plans",
      catalogLead: "Served by the API. The browser falls back to these plans when the server is not running.",
      items: [
        { title: "Starter", summary: "Up to 3 people, unlimited boards.", tag: "Free", price: "0" },
        { title: "Team", summary: "Shared views, guest access, and exports.", tag: "Popular", price: "12" },
        { title: "Studio", summary: "SSO, audit log, and a shared workspace.", tag: "Scale", price: "29" },
      ],
      hero: unsplash("1498050108023-c5249f4df085", 1600, 1000),
      photos: [
        unsplash("1461749280684-dccba630e2f6", 900, 700),
        unsplash("1553877522-43269d4ea984", 900, 700),
        unsplash("1522202176988-66273c2fd55f", 900, 700),
      ],
    };
  }
  if (kind === "shop") {
    return {
      eyebrow: "Shop",
      headline: `${siteName}, made by hand`,
      subhead: "Small-batch pieces, listed with stock from the store API. Add a note at checkout — messages land in the server inbox.",
      cta: "Shop the shelf",
      secondary: "Visit the studio",
      features: [
        { title: "Small batches", body: "Each piece is numbered. When a run sells out, the API marks it gone." },
        { title: "Studio pickup", body: "Local orders can skip shipping and come straight from the bench." },
        { title: "Honest prices", body: "Catalog prices are data, not hardcoded into the layout." },
      ],
      catalogTitle: "On the shelf",
      catalogLead: "Loaded from /api/content so the same catalog feeds the page and any future client.",
      items: [
        { title: "Everyday bowl", summary: "Speckled clay, food safe, 6 inches.", tag: "Bowl", price: "48" },
        { title: "Pouring jug", summary: "A short spout and a handle that fits one hand.", tag: "Jug", price: "72" },
        { title: "Pair of cups", summary: "Thin walls, satin glaze.", tag: "Cups", price: "54" },
      ],
      hero: unsplash("1483985988355-763728e1935b", 1600, 1000),
      photos: [
        unsplash("1472851294608-062f824d29cc", 900, 700),
        unsplash("1441986300917-64674bd600d8", 900, 700),
        unsplash("1556742049-0cfed4f6a45d", 900, 700),
      ],
    };
  }
  if (kind === "blog") {
    return {
      eyebrow: "Journal",
      headline: `${siteName}`,
      subhead: "Essays and field reports. The index is an API resource, so new posts show up without rewriting the page.",
      cta: "Read the latest",
      secondary: "Subscribe",
      features: [
        { title: "Long reads", body: "One essay a week, edited slowly and posted when it is finished." },
        { title: "Field notes", body: "Shorter dispatches from studios, kitchens, and workshops." },
        { title: "An index you can query", body: "GET /api/content returns the posts rendered below." },
      ],
      catalogTitle: "Latest writing",
      catalogLead: "The list below is the API payload. Offline, the page uses the same data baked into the script.",
      items: [
        { title: "On making fewer things", summary: "Why a short menu beats a long one.", tag: "Essay" },
        { title: "A week in the workshop", summary: "Notes from a clay studio that ships on Fridays.", tag: "Field note" },
        { title: "The quiet launch", summary: "Shipping a product without a countdown clock.", tag: "Product" },
      ],
      hero: unsplash("1456513080510-7bf3a84b82f8", 1600, 1000),
      photos: [
        unsplash("1481627834876-b7833e8f5570", 900, 700),
        unsplash("1503676260728-1c00da094a0b", 900, 700),
        unsplash("1524178232363-1fb2b075b655", 900, 700),
      ],
    };
  }
  return {
    eyebrow: "Studio",
    headline: `${siteName} designs work you can hold`,
    subhead: "Product, brand, and the websites that carry them. This page is the front door — projects and inquiries come from the API behind it.",
    cta: "Start a project",
    secondary: "See selected work",
    features: [
      { title: "Product design", body: "Flows, interfaces, and the words on the screen." },
      { title: "Brand systems", body: "A palette, a type ramp, and rules a team can keep." },
      { title: "Sites that ship", body: "A static client plus an API, the same shape as this project." },
    ],
    catalogTitle: "Selected work",
    catalogLead: "Case studies are records in server/data/content.json.",
    items: [
      { title: "Harbor", summary: "A booking flow for a coastal inn.", tag: "Product" },
      { title: "Kiln", summary: "Identity and catalog for a ceramics studio.", tag: "Brand" },
      { title: "Lumen", summary: "Marketing site and plan picker for a SaaS tool.", tag: "Web" },
    ],
    hero: unsplash("1558618666-fcd25c85f1d7", 1600, 1000),
    photos: [
      unsplash("1513364776144-60967b0f800f", 900, 700),
      unsplash("1561070791-2526d30994b5", 900, 700),
      unsplash("1542621334-a254cf47733d", 900, 700),
    ],
  };
}

export function detectSiteKind(prompt: string): SiteKind {
  const text = prompt.toLowerCase();
  if (/restaurant|cafe|café|bakery|menu|diner|bistro|kitchen/.test(text)) return "restaurant";
  if (/shop|storefront|store|ecommerce|e-commerce|boutique|ceramics|catalog/.test(text)) return "shop";
  if (/saas|startup|software|pricing|product called|landing/.test(text)) return "saas";
  if (/blog|magazine|journal|newsletter|essay/.test(text)) return "blog";
  return "portfolio";
}

function cleanName(name: string): string {
  return name
    .replace(/\b(with|that|using|featuring|including)\b[\s\S]*$/i, "")
    .replace(/[.,!]+$/g, "")
    .trim();
}

export function extractSiteName(prompt: string, kind: SiteKind): string {
  const named = prompt.match(/\b(?:called|named)\s+([^,.!\n]{2,60})/i);
  if (named) {
    const value = cleanName(named[1]);
    if (value) return value;
  }
  const proper = prompt.match(/\bfor\s+(?:an?\s+|the\s+)?([A-Z][\w&'.-]*(?:\s+[A-Z&][\w&'.-]*){0,4})/);
  if (proper) {
    const value = cleanName(proper[1]);
    if (value && !/^(A|An|The)$/.test(value)) return value;
  }
  const stripped = prompt
    .replace(/\b(build|create|make|generate|write|design|a|an|the|full-stack|fullstack|full|stack|website|site|landing|page|web|app|with|for|my|me|and|api)\b/gi, " ")
    .replace(/[^a-z0-9\s]/gi, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word && !/^(portfolio|restaurant|saas|shop|store|blog|website)$/i.test(word))
    .slice(0, 3);
  if (stripped.length) {
    return stripped.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  }
  return DEFAULT_NAMES[kind];
}

export function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

export function isWebsiteGenerationRequest(text: string): boolean {
  const value = text.trim();
  if (value.length < 8) return false;
  const asks = /\b(build|create|make|generate|design|scaffold|write)\b/i.test(value);
  const target = /\b(website|web\s*site|landing\s*page|storefront|full[-\s]?stack\s+(site|website|app))\b/i.test(value);
  return asks && target;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char
  ));
}

function renderStyles(palette: Palette): string {
  return `:root {
  --primary: ${palette.primary};
  --accent: ${palette.accent};
  --bg: ${palette.bg};
  --text: ${palette.text};
  --muted: ${palette.muted};
  --card: ${palette.card};
  --line: color-mix(in srgb, var(--text) 14%, transparent);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Outfit", "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
.nav, .hero, .section, .footer { position: relative; z-index: 1; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 7vw;
}
.brand { font-weight: 650; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 18px; color: var(--muted); font-size: 0.92rem; }
.nav a { text-decoration: none; }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
  padding: 24px 7vw 72px;
}
.eyebrow {
  color: var(--primary);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 12px;
}
h1 {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 560;
  font-size: clamp(2.6rem, 5vw, 4.6rem);
  line-height: 0.98;
  letter-spacing: -0.03em;
  margin: 0 0 16px;
}
.subhead { color: var(--muted); font-size: 1.08rem; max-width: 38rem; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.button, button {
  border: 0;
  cursor: pointer;
  border-radius: 999px;
  padding: 12px 18px;
  font: inherit;
  text-decoration: none;
}
.button.primary, button.primary { background: var(--primary); color: #1a120c; }
.button.ghost { border: 1px solid var(--line); color: var(--text); }
.hero-frame {
  border-radius: 28px;
  overflow: hidden;
  min-height: 420px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}
.hero-frame img { width: 100%; height: 520px; }
.section { padding: 28px 7vw 72px; }
.section h2 {
  font-family: "Fraunces", Georgia, serif;
  font-size: clamp(2rem, 3vw, 3rem);
  margin: 0 0 8px;
}
.lead { color: var(--muted); max-width: 40rem; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }
.card, .feature {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
}
.feature { padding: 22px; }
.feature h3, .card h3 { margin: 0 0 8px; font-size: 1.15rem; }
.feature p, .card p { margin: 0; color: var(--muted); }
.card img { height: 190px; width: 100%; }
.card-body { padding: 16px 18px 20px; }
.tag {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--primary);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.price { margin-top: 10px; font-weight: 650; }
.contact {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 28px;
  align-items: start;
}
form { display: grid; gap: 12px; }
input, textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  padding: 12px 14px;
  font: inherit;
}
.note { min-height: 1.2em; color: var(--primary); }
.footer {
  padding: 28px 7vw 40px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--line);
}
@media (max-width: 860px) {
  .hero, .grid, .contact { grid-template-columns: 1fr; }
  .nav-links { display: none; }
  .hero-frame img { height: 280px; }
}
`;
}

function renderHtml(siteName: string, copy: SiteCopy): string {
  const name = escapeHtml(siteName);
  const features = copy.features.map((feature) => (
    `<article class="feature"><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.body)}</p></article>`
  )).join("\n");
  const photos = copy.photos.map((src) => `<img src="${src}" alt="" loading="lazy">`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Outfit:wght@400;560;650&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed>
  <header class="nav">
    <a class="brand" href="#top">${name}</a>
    <nav class="nav-links">
      <a href="#work">Work</a>
      <a href="#catalog">${escapeHtml(copy.catalogTitle)}</a>
      <a href="#contact">Contact</a>
    </nav>
    <a class="button primary" href="#contact">${escapeHtml(copy.cta)}</a>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
        <h1>${escapeHtml(copy.headline)}</h1>
        <p class="subhead">${escapeHtml(copy.subhead)}</p>
        <div class="actions">
          <a class="button primary" href="#contact">${escapeHtml(copy.cta)}</a>
          <a class="button ghost" href="#catalog">${escapeHtml(copy.secondary)}</a>
        </div>
      </div>
      <div class="hero-frame">
        <img src="${copy.hero}" alt="">
      </div>
    </section>
    <section class="section" id="work">
      <h2>What you get</h2>
      <p class="lead">Three reasons people stay. The rest of the page is filled from the API.</p>
      <div class="grid">
        ${features}
      </div>
      <div class="grid" style="margin-top:16px">
        ${photos}
      </div>
    </section>
    <section class="section" id="catalog">
      <h2>${escapeHtml(copy.catalogTitle)}</h2>
      <p class="lead">${escapeHtml(copy.catalogLead)}</p>
      <div class="grid" id="catalog-grid"></div>
    </section>
    <section class="section" id="contact">
      <div class="contact">
        <div>
          <h2>Say hello</h2>
          <p class="lead">Notes post to <code>/api/messages</code>. If the API is offline, you still get a confirmation here.</p>
        </div>
        <form id="contact-form">
          <input name="name" placeholder="Name" required>
          <input name="email" type="email" placeholder="Email" required>
          <textarea name="message" rows="4" placeholder="What do you want to make?" required></textarea>
          <button class="primary" type="submit">Send note</button>
          <p class="note" id="form-note"></p>
        </form>
      </div>
    </section>
  </main>
  <footer class="footer">
    <span>${name}</span>
    <span>Client + Express API</span>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function renderScript(copy: SiteCopy): string {
  const payload = {
    catalogTitle: copy.catalogTitle,
    items: copy.items,
  };
  return `const FALLBACK = ${JSON.stringify(payload, null, 2)};

function renderCatalog(data) {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;
  const items = Array.isArray(data.items) ? data.items : [];
  grid.innerHTML = items.map((item) => \`
    <article class="card">
      <div class="card-body">
        <span class="tag">\${item.tag || ""}</span>
        <h3>\${item.title || ""}</h3>
        <p>\${item.summary || ""}</p>
        \${item.price ? \`<div class="price">$\${item.price}</div>\` : ""}
      </div>
    </article>
  \`).join("");
}

async function loadContent() {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch {
    return FALLBACK;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  renderCatalog(await loadContent());
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Request failed");
      if (note) note.textContent = "Saved on the server.";
    } catch {
      if (note) note.textContent = "Server is offline — your note stays in this browser for now.";
    }
    form.reset();
  });
});
`;
}

function renderServer(siteName: string, slug: string): { index: string; api: string; pkg: string } {
  const index = `import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import api from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", api);
app.use(express.static(path.join(__dirname, "../client")));

app.listen(port, () => {
  console.log(${JSON.stringify(siteName)} + " running at http://localhost:" + port);
});
`;
  const api = `import { Router } from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentPath = path.join(__dirname, "../data/content.json");
const messages = [];

function readContent() {
  return JSON.parse(readFileSync(contentPath, "utf8"));
}

const router = Router();

router.get("/content", (_req, res) => {
  res.json(readContent());
});

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "${slug}" });
});

router.post("/messages", (req, res) => {
  const name = String(req.body?.name || "").slice(0, 80);
  const email = String(req.body?.email || "").slice(0, 120);
  const message = String(req.body?.message || "").slice(0, 1000);
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required." });
    return;
  }
  const entry = { id: messages.length + 1, name, email, message, createdAt: new Date().toISOString() };
  messages.push(entry);
  res.status(201).json(entry);
});

router.get("/messages", (_req, res) => {
  res.json({ messages });
});

export default router;
`;
  const pkg = JSON.stringify({
    name: slug,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: { start: "node index.js", dev: "node --watch index.js" },
    dependencies: { express: "^4.21.2" },
  }, null, 2) + "\n";
  return { index, api, pkg };
}

function renderReadme(siteName: string, kind: SiteKind): string {
  return `# ${siteName}

Full-stack website generated in the Lunor Web Development assistant.

- \`client/\` — HTML, CSS, and JavaScript. The in-editor preview runs this without a server.
- \`server/\` — Express API. \`GET /api/content\` feeds the catalog. \`POST /api/messages\` stores notes in memory.
- \`server/data/content.json\` — the content the page renders.

Kind: ${kind}

## Run the API

\`\`\`bash
cd server
npm install
npm start
\`\`\`

Open http://localhost:3000. The server also serves the client, so the page and the API share one origin.

The preview inside Lunor injects the client files directly. \`script.js\` uses the JSON baked into the file when \`/api/content\` cannot be reached.
`;
}

export function buildFullStackWebsite(prompt: string): GeneratedWebsite {
  const brief = prompt.trim() || "Build a full-stack portfolio website";
  const kind = detectSiteKind(brief);
  const siteName = extractSiteName(brief, kind);
  const slug = slugify(siteName);
  const copy = copyFor(kind, siteName);
  const server = renderServer(siteName, slug);
  const content = {
    site: siteName,
    catalogTitle: copy.catalogTitle,
    items: copy.items,
  };
  const files: ProjectFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(siteName, copy) },
    { path: "client/styles.css", language: "css", content: renderStyles(PALETTES[kind]) },
    { path: "client/script.js", language: "javascript", content: renderScript(copy) },
    { path: "server/package.json", language: "json", content: server.pkg },
    { path: "server/index.js", language: "javascript", content: server.index },
    { path: "server/routes/api.js", language: "javascript", content: server.api },
    { path: "server/data/content.json", language: "json", content: JSON.stringify(content, null, 2) + "\n" },
    { path: "README.md", language: "markdown", content: renderReadme(siteName, kind) },
  ];
  return { siteName, kind, slug, files };
}

export function extractLabeledCodeFiles(markdown: string): ProjectFile[] {
  const files: ProjectFile[] = [];
  const regex = /(?:^|\n)[ \t]*[`*]*([A-Za-z0-9_./-]+\.[A-Za-z0-9]+)[`*]*[ \t]*:?[ \t]*\n```([^\n`]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const path = match[1].replace(/^\.?\//, "");
    if (!path || path.includes("..")) continue;
    const fence = (match[2] || "").trim().toLowerCase();
    const ext = path.split(".").pop()?.toLowerCase() || "";
    files.push({
      path,
      language: LANG_BY_EXT[fence] || LANG_BY_EXT[ext] || "plaintext",
      content: match[3].replace(/\s+$/g, ""),
    });
  }
  return files;
}

export function upsertProjectFile<T extends TreeNode>(tree: T[], file: ProjectFile): T[] {
  const parts = file.path.split("/").filter(Boolean);
  if (parts.some((part) => part === "." || part === "..")) return tree;
  const fileName = parts[parts.length - 1];
  const folders = parts.slice(0, -1);

  const place = (nodes: T[], parentPath: string, remaining: string[]): T[] => {
    if (remaining.length === 0) {
      const id = parentPath ? `${parentPath}/${fileName}` : fileName;
      const next = {
        id,
        name: fileName,
        type: "file" as const,
        language: file.language,
        content: file.content,
      } as unknown as T;
      const index = nodes.findIndex((node) => node.id === id);
      if (index === -1) return [...nodes, next];
      const copy = nodes.slice();
      copy[index] = { ...nodes[index], ...next, type: "file" };
      return copy;
    }
    const folderName = remaining[0];
    const folderId = parentPath ? `${parentPath}/${folderName}` : folderName;
    const index = nodes.findIndex((node) => node.type === "folder" && node.id === folderId);
    if (index === -1) {
      const folder = {
        id: folderId,
        name: folderName,
        type: "folder" as const,
        isOpen: true,
        children: place([], folderId, remaining.slice(1)),
      } as unknown as T;
      return [...nodes, folder];
    }
    const current = nodes[index];
    const copy = nodes.slice();
    copy[index] = {
      ...current,
      isOpen: true,
      children: place((current.children || []) as T[], folderId, remaining.slice(1)),
    };
    return copy;
  };

  return place(tree, "", folders);
}
