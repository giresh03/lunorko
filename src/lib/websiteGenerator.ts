/**
 * Full-stack website generator for the Web Development assistant.
 * Emits a previewable HTML/CSS/JS client plus an Express API.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "store" | "blog" | "dashboard";

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface WebsiteRequest {
  kind: WebsiteKind;
  brief?: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  name: string;
  tagline: string;
  files: GeneratedFile[];
  summary: string;
  routes: string[];
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
  meta: string;
  image?: string;
}

interface FieldSpec {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "number" | "date" | "select";
  required?: boolean;
  options?: string[];
}

interface CollectionSpec {
  route: string;
  title: string;
  noun: string;
  fields: FieldSpec[];
  items: Record<string, string>[];
}

interface Blueprint {
  kind: WebsiteKind;
  label: string;
  description: string;
  defaultName: string;
  defaultTagline: string;
  accent: string;
  ink: string;
  heroImage: string;
  kicker: string;
  catalogTitle: string;
  catalogStyle: "cards" | "stats";
  catalogRoute?: string;
  catalog: CatalogItem[];
  collection: CollectionSpec;
}

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

export const WEBSITE_TEMPLATES: { id: WebsiteKind; label: string; description: string }[] = [
  { id: "landing", label: "Landing", description: "Marketing page and lead API" },
  { id: "portfolio", label: "Portfolio", description: "Projects and contact API" },
  { id: "restaurant", label: "Restaurant", description: "Menu and reservations API" },
  { id: "store", label: "Store", description: "Products and orders API" },
  { id: "blog", label: "Blog", description: "Posts and comments API" },
  { id: "dashboard", label: "Dashboard", description: "Metrics and tasks API" },
];

const blueprints: Record<WebsiteKind, Blueprint> = {
  landing: {
    kind: "landing",
    label: "Landing",
    description: "Marketing page and lead API",
    defaultName: "Northwind",
    defaultTagline: "Ship a clearer product story, with a lead inbox your team can actually use.",
    accent: "#5b4dff",
    ink: "#1c1917",
    heroImage: img("1553877522-43269d4ea984", 1800, 1000),
    kicker: "Product studio",
    catalogTitle: "What you get",
    catalogStyle: "cards",
    catalogRoute: "/api/plans",
    catalog: [
      { id: "launch", title: "Launch site", detail: "A single page with a hero, proof, and a working lead form.", meta: "1 week", image: img("1460925895917-afdab827c52f") },
      { id: "inbox", title: "Lead inbox", detail: "Every signup is stored by the API and listed back on the page.", meta: "Express", image: img("1552664730-d307ca884978") },
      { id: "preview", title: "Live preview", detail: "The page still renders from seed data when the API is offline.", meta: "HTML + JS", image: img("1498050108023-c5249f4df085") },
    ],
    collection: {
      route: "/api/leads",
      title: "Request a walkthrough",
      noun: "lead",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "company", label: "Company", type: "text", required: true },
        { name: "message", label: "What are you building?", type: "textarea", required: true },
      ],
      items: [
        { id: "1", name: "Ava Shah", email: "ava@example.com", company: "Fieldnote", message: "Need a demo for the sales team." },
        { id: "2", name: "Leo Martins", email: "leo@example.com", company: "Harbor", message: "Looking for a launch page next month." },
      ],
    },
  },
  portfolio: {
    kind: "portfolio",
    label: "Portfolio",
    description: "Projects and contact API",
    defaultName: "Mira Chen",
    defaultTagline: "Product design and front-end engineering for teams who care how it feels.",
    accent: "#0f766e",
    ink: "#14221f",
    heroImage: img("1558618666-fcd25c85cd64", 1800, 1000),
    kicker: "Selected work",
    catalogTitle: "Projects",
    catalogStyle: "cards",
    catalogRoute: "/api/projects",
    catalog: [
      { id: "atlas", title: "Atlas Transit", detail: "A trip planner with quieter maps and faster fare lookup.", meta: "2025", image: img("1488646953014-85cb44e25828") },
      { id: "lumen", title: "Lumen Studio", detail: "Brand site and case-study layout for a photography collective.", meta: "2024", image: img("1513364776144-60967b0f800f") },
      { id: "keel", title: "Keel Analytics", detail: "Dashboard language, empty states, and a calmer chart palette.", meta: "2024", image: img("1551288049-bebda4e38f71") },
    ],
    collection: {
      route: "/api/messages",
      title: "Start a project",
      noun: "message",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "message", label: "Project notes", type: "textarea", required: true },
      ],
      items: [
        { id: "1", name: "Jonah Hale", email: "jonah@example.com", message: "We need a marketing site for a seed round." },
      ],
    },
  },
  restaurant: {
    kind: "restaurant",
    label: "Restaurant",
    description: "Menu and reservations API",
    defaultName: "Olive & Oak",
    defaultTagline: "Wood-fired plates, a short wine list, and a table when you want one.",
    accent: "#c2410c",
    ink: "#2a160f",
    heroImage: img("1414235077428-338989a2e8c0", 1800, 1000),
    kicker: "Dinner nightly",
    catalogTitle: "Tonight's menu",
    catalogStyle: "cards",
    catalogRoute: "/api/menu",
    catalog: [
      { id: "margherita", title: "Margherita", detail: "San Marzano, fior di latte, basil, olive oil.", meta: "$16", image: img("1565299624946-b28f40a0ae38") },
      { id: "orchard", title: "Orchard salad", detail: "Bitter greens, pear, toasted walnut, pecorino.", meta: "$13", image: img("1512621776951-a57141f2eefd") },
      { id: "citrus", title: "Citrus olive cake", detail: "Almond, orange zest, a spoon of crème fraîche.", meta: "$11", image: img("1488477181946-6428a0291777") },
    ],
    collection: {
      route: "/api/reservations",
      title: "Reserve a table",
      noun: "reservation",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "guests", label: "Guests", type: "number", required: true },
        { name: "notes", label: "Notes", type: "textarea" },
      ],
      items: [
        { id: "1", name: "Priya Nair", email: "priya@example.com", date: "2026-10-02", guests: "2", notes: "Window seat if you have one." },
      ],
    },
  },
  store: {
    kind: "store",
    label: "Store",
    description: "Products and orders API",
    defaultName: "Harbor Supply",
    defaultTagline: "Small-batch goods for the desk, the kitchen, and the weekend bag.",
    accent: "#0369a1",
    ink: "#0f172a",
    heroImage: img("1441986300917-64674bd600d8", 1800, 1000),
    kicker: "In stock",
    catalogTitle: "The shelf",
    catalogStyle: "cards",
    catalogRoute: "/api/products",
    catalog: [
      { id: "notebook", title: "Field notebook", detail: "Plain paper, lay-flat binding, charcoal cover.", meta: "$18", image: img("1516414447565-b14be0adf13e") },
      { id: "mug", title: "Stoneware mug", detail: "Speckled glaze, 12 oz, dishwasher safe.", meta: "$32", image: img("1514228742587-6b1558fcca3d") },
      { id: "tote", title: "Canvas tote", detail: "Heavy canvas, one pocket, natural dye.", meta: "$42", image: img("1544816155-12df9643f363") },
    ],
    collection: {
      route: "/api/orders",
      title: "Place an order",
      noun: "order",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "item", label: "Item", type: "select", required: true, options: ["Field notebook", "Stoneware mug", "Canvas tote"] },
        { name: "quantity", label: "Quantity", type: "number", required: true },
      ],
      items: [
        { id: "1", name: "Sam Okonkwo", email: "sam@example.com", item: "Stoneware mug", quantity: "1" },
      ],
    },
  },
  blog: {
    kind: "blog",
    label: "Blog",
    description: "Posts and comments API",
    defaultName: "Field Notes",
    defaultTagline: "Short essays on shipping, craft, and the tools we keep.",
    accent: "#be123c",
    ink: "#1f1214",
    heroImage: img("1456513080510-7bf3a84b82f8", 1800, 1000),
    kicker: "Journal",
    catalogTitle: "Latest notes",
    catalogStyle: "cards",
    catalogRoute: "/api/posts",
    catalog: [
      { id: "seed-data", title: "Ship the seed data", detail: "A page should still make sense before the API is running.", meta: "Mar 12", image: img("1481627834876-b7833e8f5570") },
      { id: "forms", title: "Forms that fail kindly", detail: "Tell people what was saved, and what is still local.", meta: "Feb 2", image: img("1455390582262-044cdead277a") },
      { id: "type", title: "Type as the layout", detail: "One display face, one text face, and then stop.", meta: "Jan 18", image: img("1457369804613-52c61a468e7d") },
    ],
    collection: {
      route: "/api/comments",
      title: "Leave a comment",
      noun: "comment",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "post", label: "Note", type: "select", required: true, options: ["Ship the seed data", "Forms that fail kindly", "Type as the layout"] },
        { name: "body", label: "Comment", type: "textarea", required: true },
      ],
      items: [
        { id: "1", name: "Elena Voss", post: "Ship the seed data", body: "This is the part most demos skip." },
      ],
    },
  },
  dashboard: {
    kind: "dashboard",
    label: "Dashboard",
    description: "Metrics and tasks API",
    defaultName: "Studio Desk",
    defaultTagline: "Today's numbers, and the short list of work still open.",
    accent: "#15803d",
    ink: "#142117",
    heroImage: img("1551288049-bebda4e38f71", 1800, 1000),
    kicker: "Operations",
    catalogTitle: "This week",
    catalogStyle: "stats",
    catalogRoute: "/api/metrics",
    catalog: [
      { id: "signups", title: "Signups", detail: "New accounts since Monday.", meta: "128" },
      { id: "active", title: "Active", detail: "People who opened the app today.", meta: "86" },
      { id: "open", title: "Open tasks", detail: "Still assigned and not done.", meta: "7" },
    ],
    collection: {
      route: "/api/tasks",
      title: "Add a task",
      noun: "task",
      fields: [
        { name: "title", label: "Task", type: "text", required: true },
        { name: "owner", label: "Owner", type: "text", required: true },
        { name: "status", label: "Status", type: "select", required: true, options: ["Open", "Doing", "Done"] },
      ],
      items: [
        { id: "1", title: "Review launch copy", owner: "Mira", status: "Doing" },
        { id: "2", title: "Confirm Friday deploy", owner: "Leo", status: "Open" },
      ],
    },
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[ch] || ch;
  });
}

function cleanName(value: string): string {
  return value
    .replace(/\b(website|web site|landing page|full[-\s]?stack|site|app|with|that|using|please)\b.*$/i, "")
    .replace(/[^\w&.'’\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function detectKind(text: string): WebsiteKind {
  const t = text.toLowerCase();
  if (/\b(restaurant|cafe|café|bistro|dinner)\b/.test(t)) return "restaurant";
  if (/\b(e-?commerce|online store|\bstore\b|\bshop\b)\b/.test(t)) return "store";
  if (/\bblog\b/.test(t)) return "blog";
  if (/\b(dashboard|admin panel)\b/.test(t)) return "dashboard";
  if (/\bportfolio\b/.test(t)) return "portfolio";
  return "landing";
}

function hasExplicitKind(text: string): boolean {
  return /\b(restaurant|cafe|café|bistro|e-?commerce|online store|store|shop|blog|dashboard|admin panel|portfolio|landing page)\b/i.test(text);
}

export function inferWebsiteRequest(prompt: string): WebsiteRequest | null {
  const text = prompt.trim();
  if (!text || text.length > 400 || text.includes("```")) return null;
  if (/\b(fix|debug|update|change|edit|explain|why|how|refactor|bug|error)\b/i.test(text)) return null;
  const creates = /\b(build|create|make|generate|scaffold|design|start)\b/i.test(text);
  const site = /\b(website|web site|landing page|full[-\s]?stack|fullstack)\b/i.test(text);
  if (!creates || (!site && !hasExplicitKind(text))) return null;
  return { kind: detectKind(text), brief: text };
}

function resolveCopy(blueprint: Blueprint, brief?: string): { name: string; tagline: string } {
  const text = (brief || "").trim();
  if (!text) return { name: blueprint.defaultName, tagline: blueprint.defaultTagline };

  const quoted = text.match(/["“]([^"”]{2,60})["”]/);
  const named = text.match(/\b(?:called|named)\s+([A-Za-z0-9][\w&.'’\- ]{1,48})/i);
  const forName = text.match(/\bfor\s+(?:an?\s+|my\s+|the\s+)?([A-Z][\w&.'’-]*(?:(?:\s+(?:&|and)\s+|\s+)[A-Z][\w&.'’-]*){0,4})/);
  const extracted = cleanName(quoted?.[1] || named?.[1] || forName?.[1] || "");

  const short = text.length <= 40 && !/[.!?]/.test(text) && text.split(/\s+/).length <= 5;
  const name = extracted || (short ? cleanName(text) : "") || blueprint.defaultName;
  return { name: name || blueprint.defaultName, tagline: blueprint.defaultTagline };
}

function fieldInput(field: FieldSpec): string {
  const required = field.required ? " required" : "";
  const label = escapeHtml(field.label);
  if (field.type === "textarea") {
    return `<label>${label}<textarea name="${field.name}" rows="4"${required}></textarea></label>`;
  }
  if (field.type === "select") {
    const options = (field.options || []).map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("");
    return `<label>${label}<select name="${field.name}"${required}>${options}</select></label>`;
  }
  const type = field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : "text";
  const extra = field.type === "number" ? ' min="1" value="1"' : "";
  return `<label>${label}<input name="${field.name}" type="${type}"${extra}${required} /></label>`;
}

function catalogMarkup(blueprint: Blueprint): string {
  if (blueprint.catalogStyle === "stats") {
    return blueprint.catalog.map((item) => (
      `<article class="stat" data-id="${escapeHtml(item.id)}">
        <p class="stat-value">${escapeHtml(item.meta)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.detail)}</p>
      </article>`
    )).join("\n");
  }
  return blueprint.catalog.map((item) => (
    `<article class="card">
      <img src="${item.image || ""}" alt="${escapeHtml(item.title)}" />
      <div class="card-body">
        <div class="card-top"><h3>${escapeHtml(item.title)}</h3><span>${escapeHtml(item.meta)}</span></div>
        <p>${escapeHtml(item.detail)}</p>
      </div>
    </article>`
  )).join("\n");
}

function entryMarkup(item: Record<string, string>, fields: FieldSpec[]): string {
  const bits = fields
    .map((field) => item[field.name])
    .filter(Boolean)
    .map((value) => escapeHtml(value));
  return `<li>${bits.join(" · ")}</li>`;
}

function clientHtml(blueprint: Blueprint, name: string, tagline: string): string {
  const safeName = escapeHtml(name);
  const safeTagline = escapeHtml(tagline);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="site">
  <header class="nav">
    <a class="brand" href="#top">${safeName}</a>
    <nav>
      <a href="#catalog">${escapeHtml(blueprint.catalogTitle)}</a>
      <a href="#desk">${escapeHtml(blueprint.collection.title)}</a>
    </nav>
  </header>

  <section class="hero" id="top">
    <img class="hero-photo" src="${blueprint.heroImage}" alt="" />
    <div class="hero-copy">
      <p class="kicker">${escapeHtml(blueprint.kicker)}</p>
      <h1>${safeName}</h1>
      <p class="tagline">${safeTagline}</p>
      <a class="button" href="#desk">${escapeHtml(blueprint.collection.title)}</a>
    </div>
  </section>

  <main>
    <section id="catalog">
      <div class="section-head">
        <h2>${escapeHtml(blueprint.catalogTitle)}</h2>
        <p>Loaded from the API when it is running. These cards are the seed data.</p>
      </div>
      <div id="catalog-list" class="${blueprint.catalogStyle === "stats" ? "stats" : "grid"}">
        ${catalogMarkup(blueprint)}
      </div>
    </section>

    <section id="desk" class="desk">
      <div>
        <h2>${escapeHtml(blueprint.collection.title)}</h2>
        <form id="entry-form">
          ${blueprint.collection.fields.map(fieldInput).join("\n")}
          <button class="button" type="submit">Save ${escapeHtml(blueprint.collection.noun)}</button>
        </form>
        <p id="form-status" role="status"></p>
      </div>
      <div>
        <h3>Latest</h3>
        <ul id="entries">
          ${blueprint.collection.items.map((item) => entryMarkup(item, blueprint.collection.fields)).join("\n")}
        </ul>
      </div>
    </section>
  </main>

  <footer>
    <span>${safeName}</span>
    <span>API on http://localhost:3000</span>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function clientCss(blueprint: Blueprint): string {
  return `:root {
  --accent: ${blueprint.accent};
  --ink: ${blueprint.ink};
  --paper: #f6f3ee;
  --card: #fffdf9;
  --line: rgba(28, 25, 23, 0.12);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: Outfit, sans-serif;
  line-height: 1.5;
}

img { max-width: 100%; display: block; }

a { color: inherit; }

.nav, main, footer {
  width: min(1080px, calc(100% - 32px));
  margin-inline: auto;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 0;
}

.brand { font-weight: 600; text-decoration: none; letter-spacing: -0.02em; }

.nav nav { display: flex; gap: 18px; }

.nav a { text-decoration: none; font-size: 0.92rem; }

.hero {
  position: relative;
  min-height: 520px;
  display: grid;
  align-items: end;
  color: white;
  overflow: hidden;
}

.hero-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.9);
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 16, 12, 0.15), rgba(20, 16, 12, 0.72));
}

.hero-copy {
  position: relative;
  z-index: 1;
  width: min(760px, calc(100% - 48px));
  margin: 0 auto 56px;
}

.kicker {
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 10px;
}

h1, h2, h3 { font-family: Fraunces, serif; font-weight: 560; letter-spacing: -0.03em; }

h1 { font-size: clamp(3rem, 7vw, 5.6rem); line-height: 0.92; margin: 0 0 14px; }

.tagline { max-width: 38rem; font-size: 1.15rem; margin: 0 0 22px; }

.button {
  display: inline-flex;
  align-items: center;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: white;
  text-decoration: none;
  padding: 12px 18px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

main { padding: 64px 0 32px; }

.section-head { max-width: 38rem; margin-bottom: 22px; }

.section-head p, .card p, .stat p { color: rgba(28, 25, 23, 0.72); }

.grid, .stats { display: grid; gap: 16px; }

.grid { grid-template-columns: repeat(3, 1fr); }

.stats { grid-template-columns: repeat(3, 1fr); }

.card, .stat, .desk {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
}

.card { overflow: hidden; transition: transform 180ms ease; }

.card:hover { transform: translateY(-3px); }

.card img { height: 180px; width: 100%; object-fit: cover; }

.card-body, .stat { padding: 16px 16px 18px; }

.card-top, .desk { display: flex; justify-content: space-between; gap: 12px; }

.card h3, .stat h3 { margin: 0 0 6px; font-size: 1.25rem; }

.card-top span, .stat-value { color: var(--accent); font-weight: 600; }

.stat-value { font-family: Fraunces, serif; font-size: 2.4rem; margin: 0; }

.desk {
  margin-top: 28px;
  padding: 22px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: start;
}

form { display: grid; gap: 12px; }

label { display: grid; gap: 6px; font-size: 0.85rem; font-weight: 600; }

input, textarea, select {
  width: 100%;
  border: 1px solid var(--line);
  background: white;
  border-radius: 12px;
  padding: 11px 12px;
  font: inherit;
  color: inherit;
}

ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }

li {
  padding: 12px;
  border-radius: 12px;
  background: rgba(28, 25, 23, 0.04);
}

#form-status { min-height: 1.2em; font-size: 0.92rem; }

footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 28px 0 40px;
  color: rgba(28, 25, 23, 0.62);
  font-size: 0.9rem;
}

@media (max-width: 800px) {
  .grid, .stats, .desk { grid-template-columns: 1fr; }
  .hero { min-height: 440px; }
  .nav nav { gap: 12px; }
}
`;
}

function clientJs(blueprint: Blueprint): string {
  const displayFields = blueprint.collection.fields.map((field) => field.name);
  return `// Browser client for the generated site.
// The Express API lives in server/server.mjs. Seed data keeps the preview useful offline.

const API = "http://localhost:3000";
const catalogRoute = ${JSON.stringify(blueprint.catalogRoute || "")};
const collectionRoute = ${JSON.stringify(blueprint.collection.route)};
const catalogStyle = ${JSON.stringify(blueprint.catalogStyle)};
const displayFields = ${JSON.stringify(displayFields)};

const catalogSeed = ${JSON.stringify(blueprint.catalog, null, 2)};
const entrySeed = ${JSON.stringify(blueprint.collection.items, null, 2)};

const catalogEl = document.querySelector("#catalog-list");
const entriesEl = document.querySelector("#entries");
const form = document.querySelector("#entry-form");
const statusEl = document.querySelector("#form-status");

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function catalogCard(item) {
  if (catalogStyle === "stats") {
    return \`<article class="stat"><p class="stat-value">\${esc(item.meta)}</p><h3>\${esc(item.title)}</h3><p>\${esc(item.detail)}</p></article>\`;
  }
  return \`<article class="card"><img src="\${esc(item.image)}" alt="\${esc(item.title)}" /><div class="card-body"><div class="card-top"><h3>\${esc(item.title)}</h3><span>\${esc(item.meta)}</span></div><p>\${esc(item.detail)}</p></div></article>\`;
}

function entryRow(item) {
  const bits = displayFields.map((key) => item[key]).filter(Boolean).map(esc);
  return \`<li>\${bits.join(" · ")}</li>\`;
}

async function loadJson(route, seed) {
  try {
    const response = await fetch(API + route);
    if (!response.ok) throw new Error(route + " failed");
    return await response.json();
  } catch (error) {
    console.warn(error);
    return seed;
  }
}

async function renderCatalog() {
  if (!catalogEl || !catalogRoute) return;
  const items = await loadJson(catalogRoute, catalogSeed);
  catalogEl.innerHTML = items.map(catalogCard).join("");
}

async function renderEntries() {
  if (!entriesEl) return;
  const items = await loadJson(collectionRoute, entrySeed);
  entriesEl.innerHTML = items.map(entryRow).join("");
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch(API + collectionRoute, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Could not save");
    statusEl.textContent = "Saved to the API.";
    form.reset();
    await renderEntries();
  } catch (error) {
    entrySeed.unshift({ id: String(Date.now()), ...body });
    entriesEl.innerHTML = entrySeed.map(entryRow).join("");
    statusEl.textContent = "Saved in the browser. Run npm start to persist it.";
    console.warn(error);
  }
});

renderCatalog();
renderEntries();
`;
}

function serverJs(blueprint: Blueprint, name: string): string {
  const required = blueprint.collection.fields.filter((field) => field.required).map((field) => field.name);
  const writable = blueprint.collection.fields.map((field) => field.name);
  const catalogRoute = blueprint.catalogRoute;
  return `import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const catalog = ${JSON.stringify(blueprint.catalog, null, 2)};
const entries = ${JSON.stringify(blueprint.collection.items, null, 2)};
const requiredFields = ${JSON.stringify(required)};
const writableFields = ${JSON.stringify(writable)};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: ${JSON.stringify(name)} });
});

${catalogRoute ? `app.get(${JSON.stringify(catalogRoute)}, (_req, res) => {
  res.json(catalog);
});
` : ""}
app.get(${JSON.stringify(blueprint.collection.route)}, (_req, res) => {
  res.json(entries);
});

app.post(${JSON.stringify(blueprint.collection.route)}, (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  for (const field of requiredFields) {
    if (!String(body[field] ?? "").trim()) {
      res.status(400).json({ error: "Missing " + field });
      return;
    }
  }
  if (body.email && !String(body.email).includes("@")) {
    res.status(400).json({ error: "Enter a valid email" });
    return;
  }
  const entry = { id: String(Date.now()) };
  for (const field of writableFields) {
    entry[field] = String(body[field] ?? "").trim();
  }
  entries.unshift(entry);
  res.status(201).json(entry);
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(${JSON.stringify(name + " API")} + " listening on http://localhost:" + port);
});
`;
}

function packageJson(name: string): string {
  return JSON.stringify({
    name: slugify(name),
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      start: "node server/server.mjs",
      dev: "node server/server.mjs",
    },
    dependencies: {
      cors: "^2.8.5",
      express: "^4.21.2",
    },
  }, null, 2) + "\n";
}

function readme(blueprint: Blueprint, name: string, tagline: string): string {
  const routes = [
    blueprint.catalogRoute ? `GET ${blueprint.catalogRoute}` : "",
    `GET ${blueprint.collection.route}`,
    `POST ${blueprint.collection.route}`,
    "GET /api/health",
  ].filter(Boolean);
  return `# ${name}

${tagline}

Generated by the Lunor web development assistant as a full-stack website.

## Files

- \`client/index.html\` — page structure
- \`client/styles.css\` — layout and theme
- \`client/app.js\` — loads the API and falls back to seed data
- \`server/server.mjs\` — Express API
- \`package.json\` — start script and dependencies

## Run the API

\`\`\`bash
npm install
npm start
\`\`\`

The API listens on http://localhost:3000.

## Routes

${routes.map((route) => `- \`${route}\``).join("\n")}

Open \`client/index.html\` in the Lunor preview, or with a static file server. The page keeps working from seed data when the API is not running.
`;
}

export function generateWebsite(request: WebsiteRequest): GeneratedWebsite {
  const blueprint = blueprints[request.kind] || blueprints.landing;
  const { name, tagline } = resolveCopy(blueprint, request.brief);
  const routes = [
    blueprint.catalogRoute ? `GET ${blueprint.catalogRoute}` : "",
    `GET ${blueprint.collection.route}`,
    `POST ${blueprint.collection.route}`,
  ].filter(Boolean);

  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: clientHtml(blueprint, name, tagline) },
    { path: "client/styles.css", language: "css", content: clientCss(blueprint) },
    { path: "client/app.js", language: "javascript", content: clientJs(blueprint) },
    { path: "server/server.mjs", language: "javascript", content: serverJs(blueprint, name) },
    { path: "package.json", language: "json", content: packageJson(name) },
    { path: "README.md", language: "markdown", content: readme(blueprint, name, tagline) },
  ];

  const summary = [
    `Generated **${name}**, a full-stack ${blueprint.label.toLowerCase()} website.`,
    "",
    tagline,
    "",
    "**Client** — open in the preview",
    "- `client/index.html`",
    "- `client/styles.css`",
    "- `client/app.js`",
    "",
    "**API** — `server/server.mjs`",
    ...routes.map((route) => `- \`${route}\``),
    "",
    "Run it locally with `npm install` and `npm start`. The preview uses seed data until the API is up.",
  ].join("\n");

  return { kind: blueprint.kind, name, tagline, files, summary, routes };
}

function cloneNode(node: ProjectNode): ProjectNode {
  return {
    ...node,
    children: node.children?.map(cloneNode),
  };
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^\.\//, "").replace(/\/+/g, "/");
}

function insertFile(nodes: ProjectNode[], parts: string[], file: GeneratedFile, parentPath: string): ProjectNode[] {
  const [head, ...rest] = parts;
  if (!head || head === "." || head === "..") return nodes;
  const id = parentPath ? `${parentPath}/${head}` : head;

  if (rest.length === 0) {
    const fileNode: ProjectNode = {
      id,
      name: head,
      type: "file",
      language: file.language,
      content: file.content,
    };
    const index = nodes.findIndex((node) => node.type === "file" && (node.id === id || node.name === head && node.id === id));
    if (index === -1) {
      const samePath = nodes.findIndex((node) => node.id === id);
      if (samePath === -1) return [...nodes, fileNode];
      return nodes.map((node, i) => i === samePath ? { ...node, ...fileNode, id: node.id } : node);
    }
    return nodes.map((node, i) => i === index ? { ...node, ...fileNode, id: node.id } : node);
  }

  const folderIndex = nodes.findIndex((node) => node.type === "folder" && (node.id === id || node.name === head));
  if (folderIndex === -1) {
    return [...nodes, {
      id,
      name: head,
      type: "folder",
      isOpen: true,
      children: insertFile([], rest, file, id),
    }];
  }

  return nodes.map((node, i) => {
    if (i !== folderIndex) return node;
    return { ...node, isOpen: true, children: insertFile(node.children || [], rest, file, node.id) };
  });
}

export function upsertProjectFiles(tree: ProjectNode[], files: GeneratedFile[]): ProjectNode[] {
  let next = tree.map(cloneNode);
  for (const file of files) {
    const parts = normalizePath(file.path).split("/").filter(Boolean);
    if (parts.length === 0 || parts.some((part) => part === "." || part === "..")) continue;
    next = insertFile(next, parts, file, "");
  }
  return next;
}

export function filesToProjectTree(files: GeneratedFile[]): ProjectNode[] {
  return upsertProjectFiles([], files);
}
