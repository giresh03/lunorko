/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a vanilla client preview and an Express API under server/src/modules/site.
 */

export type WebsiteKind = "portfolio" | "saas" | "restaurant" | "blog" | "store" | "dashboard";

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface WebsiteRequest {
  kind: WebsiteKind;
  name?: string;
  brief?: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  name: string;
  slug: string;
  listKey: string;
  formKey: string;
  files: GeneratedFile[];
  summary: string;
  previewPath: string;
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

export interface WebsiteAutomation {
  id: WebsiteKind;
  label: string;
  description: string;
  icon: string;
  defaultName: string;
}

interface SeedItem {
  id: string;
  title: string;
  detail: string;
  meta: string;
}

interface SiteSpec {
  kicker: string;
  tagline: string;
  defaultBrief: string;
  accent: string;
  accent2: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  heroImage: string;
  nav: string[];
  features: { title: string; detail: string }[];
  items: SeedItem[];
  listKey: string;
  formKey: string;
  listTitle: string;
  formTitle: string;
  formFields: { name: string; label: string; type: string }[];
  cta: string;
}

export const WEBSITE_AUTOMATIONS: WebsiteAutomation[] = [
  { id: "portfolio", label: "Portfolio", description: "Projects, about, and contact", icon: "✦", defaultName: "Northstar Studio" },
  { id: "saas", label: "SaaS", description: "Product landing and lead capture", icon: "◈", defaultName: "Lumen" },
  { id: "restaurant", label: "Restaurant", description: "Menu, story, and reservations", icon: "🍴", defaultName: "Harbor & Rye" },
  { id: "blog", label: "Blog", description: "Articles and a subscribe form", icon: "✎", defaultName: "Field Notes" },
  { id: "store", label: "Store", description: "Product catalog and inquiries", icon: "◻", defaultName: "Atelier Goods" },
  { id: "dashboard", label: "Dashboard", description: "Metrics overview and invites", icon: "▣", defaultName: "Pulseboard" },
];

const SPECS: Record<WebsiteKind, SiteSpec> = {
  portfolio: {
    kicker: "Selected work",
    tagline: "Design and engineering for teams who care how the product feels.",
    defaultBrief: "A studio portfolio with featured projects, services, and a contact form.",
    accent: "#7ee0c6",
    accent2: "#8ab4ff",
    bg: "#0c1222",
    surface: "#151d33",
    text: "#f4f7fb",
    muted: "#a9b4c9",
    heroImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&h=900&fit=crop&q=80",
    nav: ["Work", "Services", "Contact"],
    features: [
      { title: "Product design", detail: "Interfaces, design systems, and prototypes that ship." },
      { title: "Web engineering", detail: "HTML frontends and Node APIs with a clear boundary." },
      { title: "Launch support", detail: "Performance, accessibility, and a handoff your team can own." },
    ],
    items: [
      { id: "p1", title: "Atlas Analytics", detail: "A research dashboard for a climate lab.", meta: "Product · 2026" },
      { id: "p2", title: "Kindred", detail: "Membership site for an independent bookstore.", meta: "Brand · 2025" },
      { id: "p3", title: "Relay", detail: "On-call status page for a developer platform.", meta: "Engineering · 2025" },
    ],
    listKey: "projects",
    formKey: "inquiries",
    listTitle: "Projects",
    formTitle: "Start a project",
    formFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "note", label: "What are you building?", type: "text" },
    ],
    cta: "View the work",
  },
  saas: {
    kicker: "Product",
    tagline: "Ship a calmer workflow. One place for plans, updates, and the people who need them.",
    defaultBrief: "A SaaS landing page with features, plans, and a lead form.",
    accent: "#8ab4ff",
    accent2: "#c4b5fd",
    bg: "#0b1020",
    surface: "#141a2e",
    text: "#f5f7ff",
    muted: "#aeb6d4",
    heroImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&h=900&fit=crop&q=80",
    nav: ["Product", "Features", "Early access"],
    features: [
      { title: "Shared plans", detail: "Everyone sees the same status, owners, and due dates." },
      { title: "Quiet updates", detail: "A weekly digest instead of another noisy channel." },
      { title: "API included", detail: "The marketing page and the product read the same records." },
    ],
    items: [
      { id: "s1", title: "Starter", detail: "For a founding team trying the workflow.", meta: "Free" },
      { id: "s2", title: "Team", detail: "Shared workspaces, roles, and email digests.", meta: "$18 / seat" },
      { id: "s3", title: "Scale", detail: "SSO, audit log, and a dedicated success partner.", meta: "Talk to us" },
    ],
    listKey: "plans",
    formKey: "leads",
    listTitle: "Plans",
    formTitle: "Request early access",
    formFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Work email", type: "email" },
      { name: "company", label: "Company", type: "text" },
    ],
    cta: "Get early access",
  },
  restaurant: {
    kicker: "Dinner",
    tagline: "Seasonal plates, a short wine list, and a room that stays lively past nine.",
    defaultBrief: "A restaurant site with the menu, the story, and a reservation form.",
    accent: "#f0b429",
    accent2: "#f97316",
    bg: "#140e0c",
    surface: "#241814",
    text: "#fff7ed",
    muted: "#d6c4b8",
    heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop&q=80",
    nav: ["Menu", "Visit", "Reserve"],
    features: [
      { title: "Evening service", detail: "Tuesday to Sunday, from 5pm. The kitchen closes at 10." },
      { title: "The room", detail: "Forty seats, a six-seat counter, and no televisions." },
      { title: "Private dinners", detail: "The cellar holds twelve. Ask when you reserve." },
    ],
    items: [
      { id: "r1", title: "Charred leeks", detail: "Brown butter, hazelnut, and lemon.", meta: "12" },
      { id: "r2", title: "Market fish", detail: "Whatever came in this morning, simply grilled.", meta: "29" },
      { id: "r3", title: "Rye olive oil cake", detail: "Citrus cream and sea salt.", meta: "11" },
    ],
    listKey: "menu",
    formKey: "reservations",
    listTitle: "Menu",
    formTitle: "Reserve a table",
    formFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "guests", label: "Party size", type: "text" },
    ],
    cta: "See the menu",
  },
  blog: {
    kicker: "Journal",
    tagline: "Notes on building software, written like a letter to a teammate.",
    defaultBrief: "A blog with featured essays and an email subscribe form.",
    accent: "#86efac",
    accent2: "#67e8f9",
    bg: "#0d1612",
    surface: "#15211c",
    text: "#f3faf6",
    muted: "#b7c9c0",
    heroImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&h=900&fit=crop&q=80",
    nav: ["Essays", "About", "Subscribe"],
    features: [
      { title: "One essay a week", detail: "Long enough to be useful. Short enough to finish." },
      { title: "Source included", detail: "Every technical note links the repo that produced it." },
      { title: "No comments", detail: "Reply by email. The archive stays readable." },
    ],
    items: [
      { id: "b1", title: "Name the boundary", detail: "Where the page should stop and the API should start.", meta: "12 min" },
      { id: "b2", title: "A smaller preview", detail: "Why the marketing page and the product share one data shape.", meta: "8 min" },
      { id: "b3", title: "Ship the README", detail: "The setup notes are part of the product.", meta: "6 min" },
    ],
    listKey: "posts",
    formKey: "subscribers",
    listTitle: "Essays",
    formTitle: "Get the next essay",
    formFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
    ],
    cta: "Read the journal",
  },
  store: {
    kicker: "Shop",
    tagline: "Objects for a desk you actually like sitting at.",
    defaultBrief: "A small storefront with a catalog and an inquiry form.",
    accent: "#f9a8d4",
    accent2: "#fda4af",
    bg: "#160f16",
    surface: "#241824",
    text: "#fff5fb",
    muted: "#d4c0ce",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop&q=80",
    nav: ["Catalog", "Materials", "Inquire"],
    features: [
      { title: "Small batches", detail: "Each piece is numbered. When a run ends, it ends." },
      { title: "Ships in a week", detail: "Packed by hand from the studio, not a warehouse." },
      { title: "Repairs", detail: "Write us. We would rather mend a piece than replace it." },
    ],
    items: [
      { id: "g1", title: "Desk lamp", detail: "Brass arm, linen shade, warm bulb included.", meta: "$180" },
      { id: "g2", title: "Notebook set", detail: "Three cloth-bound books, blank pages.", meta: "$42" },
      { id: "g3", title: "Ceramic cup", detail: "Speckled glaze, sized for coffee.", meta: "$36" },
    ],
    listKey: "products",
    formKey: "orders",
    listTitle: "Catalog",
    formTitle: "Ask about a piece",
    formFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "note", label: "Which piece?", type: "text" },
    ],
    cta: "Browse the catalog",
  },
  dashboard: {
    kicker: "Overview",
    tagline: "The numbers your team checks before the standup, without the spreadsheet.",
    defaultBrief: "An analytics dashboard with metric cards and a teammate invite.",
    accent: "#5eead4",
    accent2: "#38bdf8",
    bg: "#071318",
    surface: "#102027",
    text: "#f0fdfa",
    muted: "#9fb8c0",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop&q=80",
    nav: ["Metrics", "Notes", "Invite"],
    features: [
      { title: "One screen", detail: "Traffic, signups, and active work. Nothing else." },
      { title: "Shared source", detail: "The cards are records from the API, not a picture of a chart." },
      { title: "Invite a teammate", detail: "The form posts to the same service the page reads." },
    ],
    items: [
      { id: "m1", title: "Visitors", detail: "Unique sessions in the last seven days.", meta: "12.4k" },
      { id: "m2", title: "Signups", detail: "Accounts created since Monday.", meta: "186" },
      { id: "m3", title: "Active", detail: "People who did something today.", meta: "640" },
    ],
    listKey: "metrics",
    formKey: "invites",
    listTitle: "Metrics",
    formTitle: "Invite a teammate",
    formFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
    ],
    cta: "Open the overview",
  },
};

const KIND_PATTERNS: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "portfolio", pattern: /\b(portfolio|personal site|resume site|freelancer)\b/i },
  { kind: "restaurant", pattern: /\b(restaurant|cafe|café|diner|bistro|menu)\b/i },
  { kind: "blog", pattern: /\b(blog|magazine|journal|newsletter|essay)\b/i },
  { kind: "store", pattern: /\b(store|shop|e-?commerce|boutique|catalog|storefront)\b/i },
  { kind: "dashboard", pattern: /\b(dashboard|admin panel|analytics)\b/i },
  { kind: "saas", pattern: /\b(saas|startup|landing page|product site)\b/i },
];

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "website";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function cleanName(value: string | undefined, fallback: string): string {
  const trimmed = (value || "").replace(/\s+/g, " ").trim().slice(0, 60);
  return trimmed || fallback;
}

function cleanBrief(value: string | undefined, fallback: string): string {
  const trimmed = (value || "").replace(/\s+/g, " ").trim().slice(0, 280);
  return trimmed || fallback;
}

/** Turns "build/create/generate a website" chat prompts into a generator request. */
export function parseWebsiteRequest(prompt: string): WebsiteRequest | null {
  const text = prompt.trim();
  if (text.length < 8) return null;
  const wantsSite = /\b(website|web\s*site|landing page|full[-\s]?stack)\b/i.test(text);
  const wantsBuild = /\b(build|create|generate|make|scaffold|design|launch)\b/i.test(text);
  if (!wantsSite || !wantsBuild) return null;

  const kind = KIND_PATTERNS.find((entry) => entry.pattern.test(text))?.kind ?? "saas";
  const named = text.match(
    /\b(?:called|named|titled)\s+["“]?([A-Za-z0-9][^"\n]{1,60}?)["”]?(?:\s+with|\s+for|\s+that|\s*[.!]|$)/i,
  );
  const quoted = text.match(/["“]([^"”]{2,60})["”]/);
  const name = (named?.[1] || quoted?.[1])?.trim().replace(/[.,]$/, "");
  return { kind, name, brief: text.slice(0, 280) };
}

function clientHtml(name: string, brief: string, spec: SiteSpec): string {
  const features = spec.features
    .map(
      (feature) => `<article class="card">
        <h3>${escapeHtml(feature.title)}</h3>
        <p>${escapeHtml(feature.detail)}</p>
      </article>`,
    )
    .join("\n");
  const nav = spec.nav
    .map((label, index) => {
      const href = ["#work", "#services", "#contact"][index] || "#work";
      return `<a href="${href}">${escapeHtml(label)}</a>`;
    })
    .join("\n");
  const fields = spec.formFields
    .map(
      (field) => `<label>
        <span>${escapeHtml(field.label)}</span>
        <input name="${escapeHtml(field.name)}" type="${escapeHtml(field.type)}" required />
      </label>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
  <header class="nav">
    <a class="brand" href="#top">${escapeHtml(name)}</a>
    <button class="menu-btn" type="button" aria-label="Open menu">Menu</button>
    <nav class="nav-links">${nav}</nav>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="kicker">${escapeHtml(spec.kicker)}</p>
        <h1>${escapeHtml(name)}</h1>
        <p class="lede">${escapeHtml(spec.tagline)}</p>
        <p class="lede" id="site-brief">${escapeHtml(brief)}</p>
        <a class="cta" href="#work">${escapeHtml(spec.cta)}</a>
      </div>
    </section>
    <section id="work">
      <h2>${escapeHtml(spec.listTitle)}</h2>
      <div class="list" id="item-list"></div>
    </section>
    <section id="services">
      <h2>${escapeHtml(spec.nav[1] || "Details")}</h2>
      <div class="grid">${features}</div>
    </section>
    <section id="contact">
      <h2>${escapeHtml(spec.formTitle)}</h2>
      <form id="site-form">
        ${fields}
        <button type="submit">Send</button>
        <p class="status" id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>Built with the Lunor.AI website generator · <code>GET /api/${escapeHtml(spec.listKey)}</code> · <code>POST /api/${escapeHtml(spec.formKey)}</code></footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function clientCss(spec: SiteSpec): string {
  return `:root {
  --accent: ${spec.accent};
  --accent-2: ${spec.accent2};
  --bg: ${spec.bg};
  --surface: ${spec.surface};
  --text: ${spec.text};
  --muted: ${spec.muted};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Source Sans 3", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}
a { color: inherit; text-decoration: none; }
.nav {
  position: sticky; top: 0; z-index: 2;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 7vw;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
}
.brand { font-family: Fraunces, serif; font-size: 1.25rem; }
.nav-links { display: flex; gap: 22px; color: var(--muted); }
.menu-btn { display: none; background: transparent; color: var(--text); border: 1px solid var(--muted); border-radius: 999px; padding: 6px 12px; }
.hero {
  min-height: 78vh;
  display: grid;
  align-items: end;
  padding: 12vh 7vw 8vh;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--bg) 20%, transparent), var(--bg)),
    url("${spec.heroImage}") center/cover no-repeat;
}
.kicker { letter-spacing: 0.16em; text-transform: uppercase; font-size: 0.75rem; color: var(--accent); }
h1 { font-family: Fraunces, serif; font-size: clamp(3rem, 7vw, 6rem); line-height: 0.95; margin: 10px 0 16px; max-width: 12ch; }
h2 { font-family: Fraunces, serif; font-size: 2.4rem; margin: 0 0 20px; }
.lede { max-width: 38rem; font-size: 1.2rem; color: var(--muted); }
.cta { display: inline-block; margin-top: 24px; padding: 12px 18px; border-radius: 999px; background: var(--accent); color: #111; font-weight: 600; }
section { padding: 72px 7vw; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card, .item, form {
  background: var(--surface);
  border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: 18px;
  padding: 20px;
}
.card h3, .item h3 { margin: 0 0 8px; }
.card p, .item p { margin: 0; color: var(--muted); }
.list { display: grid; gap: 12px; }
.item { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
.item span { color: var(--accent-2); font-weight: 600; white-space: nowrap; }
form { display: grid; gap: 12px; max-width: 520px; }
label { display: grid; gap: 6px; font-size: 0.9rem; color: var(--muted); }
input {
  border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
  background: transparent; color: var(--text); border-radius: 10px; padding: 12px; font: inherit;
}
button[type="submit"] {
  justify-self: start; border: 0; border-radius: 999px; padding: 12px 18px;
  background: var(--accent); color: #111; font-weight: 600; cursor: pointer;
}
.status { min-height: 1.2em; color: var(--accent); }
footer { padding: 28px 7vw 40px; color: var(--muted); border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent); }
@media (max-width: 800px) {
  .grid { grid-template-columns: 1fr; }
  .nav-links { display: none; }
  .nav-links.open { display: flex; flex-direction: column; position: absolute; top: 58px; right: 7vw; background: var(--surface); padding: 16px; border-radius: 12px; }
  .menu-btn { display: inline-block; }
  .item { align-items: flex-start; flex-direction: column; }
}
`;
}

function clientScript(spec: SiteSpec): string {
  return `const LIST_KEY = ${safeJson(spec.listKey)};
const FORM_KEY = ${safeJson(spec.formKey)};
const SEED = ${safeJson(spec.items)};

function paint(items) {
  const list = document.getElementById("item-list");
  list.replaceChildren();
  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "item";
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled";
    const detail = document.createElement("p");
    detail.textContent = item.detail || "";
    copy.append(title, detail);
    const meta = document.createElement("span");
    meta.textContent = item.meta || "";
    article.append(copy, meta);
    list.append(article);
  });
}

paint(SEED);

fetch("/api/" + LIST_KEY)
  .then((response) => (response.ok ? response.json() : null))
  .then((records) => {
    if (Array.isArray(records) && records.length) paint(records);
  })
  .catch(() => {});

document.querySelector(".menu-btn").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("open");
});

document.getElementById("site-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const status = document.getElementById("form-status");
  const optimistic = {
    id: "local-" + Date.now(),
    title: data.name || data.email || "New record",
    detail: data.note || data.company || data.guests || data.email || "Saved in this preview.",
    meta: "New",
  };
  paint([optimistic, ...SEED]);
  status.textContent = "Saved in the preview. POST /api/" + FORM_KEY + " accepts the same fields.";
  event.currentTarget.reset();
  fetch("/api/" + FORM_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).catch(() => {});
});
`;
}

function serverFiles(name: string, slug: string, spec: SiteSpec): GeneratedFile[] {
  const seed = spec.items.map((item) => ({
    id: item.id,
    title: item.title,
    detail: item.detail,
    meta: item.meta,
  }));

  return [
    {
      path: "server/package.json",
      language: "json",
      content: `${JSON.stringify(
        {
          name: `${slug}-server`,
          private: true,
          type: "module",
          scripts: { start: "node index.js", dev: "node --watch index.js" },
          dependencies: { cors: "^2.8.5", dotenv: "^16.4.5", express: "^4.21.2", mongodb: "^6.10.0" },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "server/index.js",
      language: "javascript",
      content: `import { createApp } from "./src/app.js";
import { env } from "./src/config/env.js";

const app = createApp();
app.listen(env.port, () => {
  console.log(${safeJson(`${name} API`)} + " listening on " + env.port);
});
`,
    },
    {
      path: "server/src/config/env.js",
      language: "javascript",
      content: `import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || "",
  dbName: process.env.MONGODB_DB || ${safeJson(slug)},
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
`,
    },
    {
      path: "server/src/config/db.js",
      language: "javascript",
      content: `import { MongoClient } from "mongodb";
import { env } from "./env.js";

let database;

export async function getCollection(name) {
  const mongoUri = process.env.MONGODB_URI || env.mongoUri;
  if (!mongoUri) return null;
  try {
    if (!database) {
      const client = new MongoClient(mongoUri);
      await client.connect();
      database = client.db(env.dbName);
    }
    return database.collection(name);
  } catch (error) {
    console.warn("MongoDB unavailable, using in-memory data.", error.message);
    return null;
  }
}
`,
    },
    {
      path: "server/src/modules/site/site.service.js",
      language: "javascript",
      content: `import { getCollection } from "../../config/db.js";

export const LIST_KEY = ${safeJson(spec.listKey)};
export const FORM_KEY = ${safeJson(spec.formKey)};

const records = ${safeJson(seed)};
const submissions = [];

function requireText(value, field) {
  const text = String(value || "").trim();
  if (!text) {
    const error = new Error(field + " is required");
    error.status = 400;
    throw error;
  }
  return text.slice(0, 240);
}

export async function listRecords() {
  const collection = await getCollection(LIST_KEY);
  if (!collection) return records;
  const stored = await collection.find({}).toArray();
  return stored.length ? stored : records;
}

export async function createSubmission(input) {
  const submission = {
    id: crypto.randomUUID(),
    title: requireText(input.title || input.name, "name"),
    detail: requireText(input.detail || input.note || input.email || input.company || input.guests, "detail"),
    meta: String(input.meta || "New").slice(0, 80),
    email: String(input.email || "").slice(0, 160),
    createdAt: new Date().toISOString(),
  };
  const collection = await getCollection(FORM_KEY);
  if (collection) await collection.insertOne(submission);
  else submissions.unshift(submission);
  return submission;
}
`,
    },
    {
      path: "server/src/modules/site/site.controller.js",
      language: "javascript",
      content: `import { createSubmission, listRecords } from "./site.service.js";

export async function list(_req, res, next) {
  try {
    res.json(await listRecords());
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await createSubmission(req.body || {}));
  } catch (error) {
    next(error);
  }
}
`,
    },
    {
      path: "server/src/modules/site/site.routes.js",
      language: "javascript",
      content: `import { Router } from "express";
import { create, list } from "./site.controller.js";
import { FORM_KEY, LIST_KEY } from "./site.service.js";

export const siteRouter = Router();

siteRouter.get("/" + LIST_KEY, list);
siteRouter.post("/" + FORM_KEY, create);
`,
    },
    {
      path: "server/src/app.js",
      language: "javascript",
      content: `import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { siteRouter } from "./modules/site/site.routes.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: ${safeJson(name)} });
  });
  app.use("/api", siteRouter);
  app.use((error, _req, res, _next) => {
    res.status(error.status || 500).json({ error: error.message || "Server error" });
  });
  return app;
}
`,
    },
  ];
}

export function generateFullStackWebsite(request: WebsiteRequest): GeneratedWebsite {
  const automation = WEBSITE_AUTOMATIONS.find((entry) => entry.id === request.kind) ?? WEBSITE_AUTOMATIONS[1];
  const spec = SPECS[automation.id];
  const name = cleanName(request.name, automation.defaultName);
  const brief = cleanBrief(request.brief, spec.defaultBrief);
  const slug = slugify(name);
  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: clientHtml(name, brief, spec) },
    { path: "client/styles.css", language: "css", content: clientCss(spec) },
    { path: "client/script.js", language: "javascript", content: clientScript(spec) },
    {
      path: "package.json",
      language: "json",
      content: `${JSON.stringify({ name: slug, private: true, scripts: { server: "npm --prefix server run dev" } }, null, 2)}\n`,
    },
    {
      path: ".env.example",
      language: "plaintext",
      content: `PORT=4000
MONGODB_URI=
MONGODB_DB=${slug}
CLIENT_ORIGIN=http://localhost:5173
`,
    },
    {
      path: "README.md",
      language: "markdown",
      content: `# ${name}

${brief}

Generated by the Lunor.AI website automation for a **${automation.label.toLowerCase()}** site.

## Files

- \`client/index.html\`, \`client/styles.css\`, \`client/script.js\` — live preview
- \`server/\` — Express API. MongoDB is optional.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | \`/api/health\` | Service check |
| GET | \`/api/${spec.listKey}\` | List records |
| POST | \`/api/${spec.formKey}\` | Save a form submission |

## Run the API

\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

Copy \`.env.example\` to \`server/.env\`. Leave \`MONGODB_URI\` empty to keep data in memory.
`,
    },
    ...serverFiles(name, slug, spec),
  ];

  const summary = [
    `**${name}** is in the editor. I generated a full-stack **${automation.label.toLowerCase()}** website and opened the live preview.`,
    "",
    "- **Preview:** `client/index.html`, `client/styles.css`, `client/script.js`",
    `- **API:** Express in \`server/src/modules/site/\` — \`GET /api/${spec.listKey}\`, \`POST /api/${spec.formKey}\`, \`GET /api/health\``,
    "",
    "The page paints its sample records immediately. With the API running (`cd server && npm install && npm run dev`), the same page reads and submits those routes. MongoDB is optional via `MONGODB_URI`.",
  ].join("\n");

  return {
    kind: automation.id,
    name,
    slug,
    listKey: spec.listKey,
    formKey: spec.formKey,
    files,
    summary,
    previewPath: "client/index.html",
  };
}

export function filesToFileTree(files: GeneratedFile[]): ProjectNode[] {
  const root: ProjectNode[] = [];
  const folders = new Map<string, ProjectNode>();

  const ensureFolder = (folderPath: string): ProjectNode => {
    const existing = folders.get(folderPath);
    if (existing) return existing;
    const name = folderPath.split("/").pop() || folderPath;
    const node: ProjectNode = { id: folderPath, name, type: "folder", isOpen: true, children: [] };
    folders.set(folderPath, node);
    const parentPath = folderPath.includes("/") ? folderPath.slice(0, folderPath.lastIndexOf("/")) : "";
    if (parentPath) ensureFolder(parentPath).children?.push(node);
    else root.push(node);
    return node;
  };

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    const name = parts.pop() || file.path;
    const node: ProjectNode = {
      id: file.path,
      name,
      type: "file",
      language: file.language,
      content: file.content,
    };
    if (parts.length === 0) root.push(node);
    else ensureFolder(parts.join("/")).children?.push(node);
  }

  return root;
}
