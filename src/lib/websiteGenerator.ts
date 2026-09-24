/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a browser client (preview-safe) plus an Express API the learner can run locally.
 */

export type WebsiteKind =
  | "restaurant"
  | "portfolio"
  | "shop"
  | "saas"
  | "blog"
  | "fitness"
  | "education"
  | "landing";

export interface WebsiteFile {
  id: string;
  name: string;
  language: string;
  content: string;
  parentId: string | null;
}

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  meta: string;
  tag: string;
  image: string;
}

export interface WebsiteProject {
  name: string;
  slug: string;
  kind: WebsiteKind;
  tagline: string;
  files: WebsiteFile[];
  summary: string;
}

export const WEBSITE_STARTER_PROMPTS = [
  "Build a restaurant website for Harbor & Rye",
  "Create a portfolio website for a photographer",
  "Generate a full-stack shop website",
  "Make a SaaS landing page website",
];

const KIND_KEYWORDS: Record<WebsiteKind, string[]> = {
  restaurant: ["restaurant", "cafe", "coffee", "food", "menu", "bistro", "bakery", "diner"],
  portfolio: ["portfolio", "photographer", "designer", "freelance", "artist", "studio"],
  shop: ["ecommerce", "e-commerce", "boutique", "product", "store", "shop"],
  saas: ["saas", "startup", "software", "platform"],
  blog: ["blog", "magazine", "journal", "newsletter"],
  fitness: ["fitness", "gym", "yoga", "workout"],
  education: ["course", "school", "education", "academy", "classroom"],
  landing: [],
};

const DEFAULT_NAMES: Record<WebsiteKind, string> = {
  restaurant: "Harbor & Rye",
  portfolio: "Atelier North",
  shop: "Northwind Goods",
  saas: "Lumen",
  blog: "Field Notes",
  fitness: "Pulse Studio",
  education: "Northstar Academy",
  landing: "Lunor Studio",
};

const TAGLINES: Record<WebsiteKind, string> = {
  restaurant: "Seasonal plates, a short wine list, and a room that stays busy.",
  portfolio: "Selected work, case studies, and a straightforward way to start a project.",
  shop: "A small catalog with live inventory from the API.",
  saas: "One workspace for the team that ships the product.",
  blog: "Essays and notes, loaded from the content API.",
  fitness: "Classes, coaches, and a schedule you can actually keep.",
  education: "Courses, instructors, and a catalog backed by the API.",
  landing: "A full-stack site: a live page in the preview, and an Express API when you run it locally.",
};

const CATALOG_LABEL: Record<WebsiteKind, string> = {
  restaurant: "Menu",
  portfolio: "Selected work",
  shop: "Catalog",
  saas: "Product",
  blog: "Latest",
  fitness: "Classes",
  education: "Courses",
  landing: "Highlights",
};

interface Theme {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
  hero: string;
}

const THEMES: Record<WebsiteKind, Theme> = {
  restaurant: {
    bg: "#14110e", surface: "#1e1914", text: "#f6f1ea", muted: "#cbbba8",
    primary: "#e07a3d", accent: "#f3d5b5", hero: "1504674900247-0877df9cc836",
  },
  portfolio: {
    bg: "#0e1016", surface: "#171b24", text: "#f4f6fb", muted: "#b7c0d1",
    primary: "#8b7cff", accent: "#d9d4ff", hero: "1558618666-fcd25c85f1d7",
  },
  shop: {
    bg: "#101614", surface: "#18211e", text: "#f3f7f5", muted: "#b7c9c2",
    primary: "#2fbf9b", accent: "#d5f5ec", hero: "1441986300917-64674bd600d8",
  },
  saas: {
    bg: "#0c1220", surface: "#141c2e", text: "#eef3ff", muted: "#b5c2de",
    primary: "#4c8dff", accent: "#d6e4ff", hero: "1461749280684-dccba630e2f6",
  },
  blog: {
    bg: "#14120f", surface: "#201c17", text: "#f7f3ee", muted: "#d0c4b4",
    primary: "#d97706", accent: "#fde7c7", hero: "1481627834876-b7833e8f5570",
  },
  fitness: {
    bg: "#0d1410", surface: "#152019", text: "#f2f7f3", muted: "#b7cabb",
    primary: "#3ddc84", accent: "#d9ffe8", hero: "1517836357463-d25dfeac3438",
  },
  education: {
    bg: "#10131a", surface: "#181d29", text: "#f4f6fb", muted: "#c0c6d6",
    primary: "#6366f1", accent: "#e0e1ff", hero: "1524178232363-1fb2b075b655",
  },
  landing: {
    bg: "#0b1220", surface: "#141c2b", text: "#f4f7fb", muted: "#b7c3d4",
    primary: "#2dd4bf", accent: "#d5fff6", hero: "1556761175-5973dc0f32e7",
  },
};

const CATALOGS: Record<WebsiteKind, Array<Omit<CatalogItem, "id" | "image"> & { photo: string }>> = {
  restaurant: [
    { title: "Charred citrus salmon", description: "Dill oil, fennel, and a brown-butter crumb.", meta: "$28", tag: "Mains", photo: "1414235077428-338989a2e8c0" },
    { title: "Rye gnocchi", description: "Mushroom stock, sage, and aged cheese.", meta: "$22", tag: "Mains", photo: "1476224203421-9ac39bcb3327" },
    { title: "Market plate", description: "Bitter greens, pear, and toasted seeds.", meta: "$14", tag: "Small", photo: "1565299624946-b28f40a0ae38" },
    { title: "Olive oil cake", description: "Citrus zest and crème fraîche.", meta: "$12", tag: "Sweet", photo: "1555396273-367ea4eb4db5" },
  ],
  portfolio: [
    { title: "Coastal editorial", description: "A three-day shoot for a travel magazine.", meta: "Photography", tag: "2025", photo: "1476514525535-07fb3b4a6e29" },
    { title: "Type foundry site", description: "Catalog, specimens, and a licensing flow.", meta: "Web", tag: "2024", photo: "1513364776144-60967b0f800f" },
    { title: "Studio identity", description: "Mark, palette, and a short brand system.", meta: "Identity", tag: "2024", photo: "1561070791-2526d30994b5" },
    { title: "Night market film", description: "Handheld frames and a quiet color grade.", meta: "Film", tag: "2023", photo: "1542621334-a254cf47733d" },
  ],
  shop: [
    { title: "Wool throw", description: "Undyed merino, washed once, shipped folded.", meta: "$120", tag: "Home", photo: "1483985988355-763728e1935b" },
    { title: "Ceramic pourer", description: "Speckled glaze, holds about 400ml.", meta: "$48", tag: "Table", photo: "1472851294608-062f824d29cc" },
    { title: "Field notebook", description: "Plain paper, thread-bound, pocket size.", meta: "$18", tag: "Paper", photo: "1556742049-0cfed4f6a45d" },
    { title: "Oak stool", description: "Three legs, oil finish, made in small batches.", meta: "$210", tag: "Furniture", photo: "1607082348824-0a96f2a4b9da" },
  ],
  saas: [
    { title: "Shared inbox", description: "Assign threads without leaving the board.", meta: "Core", tag: "Team", photo: "1553877522-43269d4ea984" },
    { title: "Release notes", description: "Draft, review, and publish from one doc.", meta: "Core", tag: "Ship", photo: "1552664730-d307ca884978" },
    { title: "Status page", description: "Incidents update the public page automatically.", meta: "Add-on", tag: "Trust", photo: "1542744173-8e7e91415657" },
    { title: "Audit log", description: "Every change, with the person who made it.", meta: "Add-on", tag: "Admin", photo: "1504639725590-34d0984388bd" },
  ],
  blog: [
    { title: "A shorter deploy", description: "What we cut from the pipeline and why it held.", meta: "Engineering", tag: "12 min", photo: "1517694712202-14dd9538aa97" },
    { title: "Kitchen light", description: "Notes from a week of shooting at dusk.", meta: "Photo", tag: "6 min", photo: "1506744038136-46273834b3fb" },
    { title: "Maps on paper", description: "Why the field notebook still beats the app.", meta: "Essay", tag: "9 min", photo: "1441974231531-c6227db76b6e" },
    { title: "Quiet APIs", description: "Designing endpoints people can read aloud.", meta: "Engineering", tag: "8 min", photo: "1498050108023-c5249f4df085" },
  ],
  fitness: [
    { title: "Dawn strength", description: "Barbell basics, 45 minutes, capped at 12.", meta: "6:15", tag: "Strength", photo: "1571019614242-c5c5dee9f50a" },
    { title: "Midday mobility", description: "Hips, shoulders, and a short walk out.", meta: "12:10", tag: "Recover", photo: "1518611012118-696072aa579a" },
    { title: "Evening ride", description: "Intervals on the bike, then a cooldown.", meta: "18:00", tag: "Condition", photo: "1549060279-7aa00f60c6fe" },
    { title: "Weekend hike", description: "Easy pace, local trail, optional pack.", meta: "Sat", tag: "Outdoor", photo: "1576678927484-cc907957088c" },
  ],
  education: [
    { title: "HTML to API", description: "Pages, forms, and the server that answers them.", meta: "6 weeks", tag: "Web", photo: "1503676260728-1c00da094a0b" },
    { title: "Query clinic", description: "Indexes, plans, and the slow query you actually have.", meta: "4 weeks", tag: "Data", photo: "1456513080510-7bf3a84b82f8" },
    { title: "Interface studio", description: "Type, space, and components that stay consistent.", meta: "5 weeks", tag: "Design", photo: "1427504350979-f38e36f5ceab" },
    { title: "Deploy week", description: "A small app, a pipeline, and a public URL.", meta: "1 week", tag: "Ops", photo: "1524178232363-1fb2b075b655" },
  ],
  landing: [
    { title: "Client preview", description: "The page renders in the editor without a build step.", meta: "Browser", tag: "Preview", photo: "1498050108023-c5249f4df085" },
    { title: "Express API", description: "Catalog and contact routes, ready for npm start.", meta: "Node", tag: "API", photo: "1555066931-4365d14bab8c" },
    { title: "Shared catalog", description: "The same items power the page and the server.", meta: "JSON", tag: "Data", photo: "1517694712202-14dd9538aa97" },
    { title: "Local run", description: "Install express and cors, then open localhost:3000.", meta: "npm", tag: "Run", photo: "1461749280684-dccba630e2f6" },
  ],
};

const GENERIC_NAMES = new Set([
  "restaurant", "cafe", "coffee", "portfolio", "photographer", "shop", "store",
  "blog", "saas", "startup", "website", "landing page", "web app", "fitness",
  "gym", "school", "education", "designer", "a website", "my website",
]);

export function isWebsiteGenerationRequest(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const asksToBuild = /\b(build|create|make|generate|design|scaffold|code)\b/.test(text);
  const isSite = /\b(website|web\s*site|landing\s*page|full[-\s]?stack\s+(site|website|app)|web\s*app)\b/.test(text);
  return asksToBuild && isSite;
}

export function isBackendPreviewScript(filename: string, content?: string): boolean {
  const base = filename.split("/").pop() || filename;
  if (base === "server.js" || base === "routes.js") return true;
  if (content && /require\s*\(\s*['"]express['"]\s*\)/.test(content)) return true;
  return false;
}

function detectKind(prompt: string): WebsiteKind {
  const text = prompt.toLowerCase();
  let best: WebsiteKind = "landing";
  let score = 0;
  (Object.keys(KIND_KEYWORDS) as WebsiteKind[]).forEach((kind) => {
    const next = KIND_KEYWORDS[kind].reduce((total, word) => {
      return total + (text.includes(word) ? 1 : 0);
    }, 0);
    if (next > score) {
      score = next;
      best = kind;
    }
  });
  return best;
}

function cleanName(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/[.?!:]+$/g, "")
    .replace(/\b(website|web\s*site|site|web\s*app|landing\s*page|full[-\s]?stack|fullstack)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function presentName(raw: string, fallback: string): string {
  const cleaned = cleanName(raw);
  if (!cleaned || cleaned.length > 48 || GENERIC_NAMES.has(cleaned.toLowerCase())) return fallback;
  if (/[<>]/.test(cleaned)) return cleaned;
  if (cleaned === cleaned.toLowerCase()) {
    return cleaned.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }
  return cleaned;
}

function extractName(prompt: string, kind: WebsiteKind): string {
  const fallback = DEFAULT_NAMES[kind];
  const quoted = prompt.match(/["“']([^"”']{2,48})["”']/);
  if (quoted) return presentName(quoted[1], fallback);
  const called = prompt.match(/\b(?:called|named|titled)\s+([A-Za-z0-9][\w\s'&-]{1,48})/i);
  if (called) return presentName(called[1], fallback);
  const forMatch = prompt.match(/\bfor\s+(?:a|an|my|the|our)?\s*([^.,\n]{2,60})/i);
  if (forMatch) return presentName(forMatch[1], fallback);
  return fallback;
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function embedJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function photo(id: string, width = 1200, height = 800): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

function buildCatalog(kind: WebsiteKind): CatalogItem[] {
  return CATALOGS[kind].map((item, index) => ({
    id: `${kind}-${index + 1}`,
    title: item.title,
    description: item.description,
    meta: item.meta,
    tag: item.tag,
    image: photo(item.photo, 900, 700),
  }));
}

function buildHtml(project: { name: string; tagline: string; kind: WebsiteKind }): string {
  const name = escapeHtml(project.name);
  const tagline = escapeHtml(project.tagline);
  const catalog = escapeHtml(CATALOG_LABEL[project.kind]);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a class="logo" href="#top">${name}</a>
    <button id="nav-toggle" class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
    <nav id="nav-links" class="nav-links">
      <a href="#catalog">${catalog}</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${catalog}</p>
        <h1>${name}</h1>
        <p class="lede">${tagline}</p>
        <div class="hero-actions">
          <a class="button" href="#catalog">View ${catalog.toLowerCase()}</a>
          <a class="button button-ghost" href="#contact">Start a conversation</a>
        </div>
      </div>
      <div class="hero-frame" role="img" aria-label="${name}"></div>
    </section>

    <section id="catalog" class="section">
      <div class="section-head">
        <h2>${catalog}</h2>
        <p id="catalog-status">Loading from the API…</p>
      </div>
      <div id="catalog-grid" class="card-grid"></div>
    </section>

    <section id="about" class="section about">
      <div>
        <h2>How this site is built</h2>
        <p>The page you are looking at is plain HTML, CSS, and JavaScript. The catalog tries <code>GET /api/items</code> first. In the editor preview that request fails, so the page uses the same seed data the Express server ships with.</p>
      </div>
      <ul class="about-list">
        <li><strong>Client</strong><span>index.html, style.css, and app.js</span></li>
        <li><strong>API</strong><span>server.js — health, items, and contact</span></li>
        <li><strong>Run</strong><span>npm install && npm start</span></li>
      </ul>
    </section>

    <section id="contact" class="section">
      <div class="section-head">
        <h2>Contact</h2>
        <p>Messages post to <code>/api/contact</code>. Offline, they stay in this browser.</p>
      </div>
      <form id="contact-form" class="contact-form">
        <label>Name<input name="name" required maxlength="80" autocomplete="name"></label>
        <label>Email<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
        <label>Message<textarea name="message" required maxlength="1000" rows="4"></textarea></label>
        <button class="button" type="submit">Send</button>
        <p id="contact-status" class="form-status" role="status"></p>
      </form>
    </section>
  </main>

  <footer class="site-footer">
    <span>${name}</span>
    <span id="year"></span>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function buildCss(theme: Theme): string {
  return `:root {
  --bg: ${theme.bg};
  --surface: ${theme.surface};
  --text: ${theme.text};
  --muted: ${theme.muted};
  --primary: ${theme.primary};
  --accent: ${theme.accent};
  --hero: url("${photo(theme.hero, 1600, 1200)}");
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: Outfit, sans-serif;
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.92em;
  color: var(--accent);
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 6vw;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
}
.logo {
  font-family: Fraunces, serif;
  font-size: 1.25rem;
  text-decoration: none;
  margin-right: auto;
}
.nav-toggle {
  display: none;
  background: transparent;
  color: var(--text);
  border: 1px solid color-mix(in srgb, var(--text) 25%, transparent);
  border-radius: 999px;
  padding: 8px 14px;
}
.nav-links { display: flex; gap: 18px; }
.nav-links a { text-decoration: none; color: var(--muted); }
.nav-links a:hover { color: var(--text); }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
  padding: 64px 6vw 32px;
}
.eyebrow {
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--primary);
  margin: 0 0 12px;
}
h1, h2 { font-family: Fraunces, serif; font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(3rem, 6vw, 5.4rem); line-height: 0.95; margin: 0 0 16px; }
.lede { font-size: 1.15rem; color: var(--muted); max-width: 38rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--primary);
  color: #102018;
  text-decoration: none;
  border: 0;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.button-ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid color-mix(in srgb, var(--text) 28%, transparent);
}
.hero-frame {
  min-height: 420px;
  border-radius: 28px;
  background: var(--hero) center/cover no-repeat;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
}
.section { padding: 28px 6vw 64px; }
.section-head { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; }
.section-head p { color: var(--muted); }
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.card {
  background: var(--surface);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
}
.card img { height: 160px; width: 100%; object-fit: cover; }
.card-body { padding: 14px 14px 16px; }
.card-body h3 { margin: 0 0 6px; font-size: 1.05rem; }
.card-body p { margin: 0; color: var(--muted); font-size: 0.92rem; }
.card-meta { display: flex; justify-content: space-between; margin-top: 12px; color: var(--accent); font-size: 0.85rem; }
.about {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 28px;
  align-items: start;
}
.about p { color: var(--muted); }
.about-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.about-list li {
  background: var(--surface);
  border-radius: 14px;
  padding: 12px 14px;
  display: grid;
  gap: 2px;
}
.about-list span { color: var(--muted); font-size: 0.9rem; }
.contact-form {
  display: grid;
  gap: 12px;
  max-width: 640px;
}
.contact-form label { display: grid; gap: 6px; font-size: 0.9rem; }
.contact-form input, .contact-form textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  padding: 12px 14px;
}
.form-status { min-height: 1.2em; color: var(--accent); }
.site-footer {
  display: flex;
  justify-content: space-between;
  padding: 22px 6vw 32px;
  color: var(--muted);
  border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
}
@media (max-width: 980px) {
  .hero, .about, .card-grid { grid-template-columns: 1fr 1fr; }
  .hero-frame { min-height: 280px; }
}
@media (max-width: 720px) {
  .nav-toggle { display: inline-flex; }
  .nav-links {
    display: none;
    position: absolute;
    top: 64px;
    right: 6vw;
    flex-direction: column;
    padding: 12px;
    background: var(--surface);
    border-radius: 14px;
  }
  .nav-links.open { display: flex; }
  .hero, .about, .card-grid, .section-head { grid-template-columns: 1fr; display: grid; }
  .section-head { display: grid; }
}
`;
}

function buildClientJs(items: CatalogItem[]): string {
  return `const FALLBACK_ITEMS = ${embedJson(items)};

const grid = document.getElementById("catalog-grid");
const status = document.getElementById("catalog-status");
const year = document.getElementById("year");
const toggle = document.getElementById("nav-toggle");
const links = document.getElementById("nav-links");
const form = document.getElementById("contact-form");
const formStatus = document.getElementById("contact-status");

if (year) year.textContent = String(new Date().getFullYear());

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function escapeText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderItems(items) {
  if (!grid) return;
  grid.innerHTML = items.map((item) => \`
    <article class="card">
      <img src="\${escapeText(item.image)}" alt="\${escapeText(item.title)}" loading="lazy">
      <div class="card-body">
        <h3>\${escapeText(item.title)}</h3>
        <p>\${escapeText(item.description)}</p>
        <div class="card-meta"><span>\${escapeText(item.tag)}</span><span>\${escapeText(item.meta)}</span></div>
      </div>
    </article>\`).join("");
}

async function loadItems() {
  try {
    const response = await fetch("/api/items");
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) throw new Error("Empty catalog");
    if (status) status.textContent = "Loaded from the API.";
    renderItems(items);
  } catch {
    if (status) status.textContent = "Preview mode — showing the seed catalog.";
    renderItems(FALLBACK_ITEMS);
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Request failed");
      const payload = await response.json();
      if (formStatus) formStatus.textContent = payload.message || "Sent.";
      form.reset();
    } catch {
      try {
        const saved = JSON.parse(localStorage.getItem("lunor-contact") || "[]");
        saved.push({ ...data, savedAt: new Date().toISOString() });
        localStorage.setItem("lunor-contact", JSON.stringify(saved));
      } catch {
        /* The editor preview blocks storage. The message still confirms locally. */
      }
      if (formStatus) formStatus.textContent = "Saved in this browser when storage is available. Start the API to store it on the server.";
      form.reset();
    }
  });
}

loadItems();
`;
}

function buildServer(name: string, items: CatalogItem[]): string {
  return `const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const items = ${embedJson(items)};
const messages = [];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: ${JSON.stringify(name)} });
});

app.get("/api/items", (_req, res) => {
  res.json({ items });
});

app.post("/api/items", (req, res) => {
  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }
  const item = {
    id: "item-" + Date.now(),
    title,
    description,
    meta: String(req.body?.meta || "New"),
    tag: String(req.body?.tag || "Custom"),
    image: items[0] ? items[0].image : "",
  };
  items.push(item);
  res.status(201).json({ item });
});

app.post("/api/contact", (req, res) => {
  const nameValue = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!nameValue || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  const entry = { id: "msg-" + Date.now(), name: nameValue, email, message };
  messages.push(entry);
  res.status(201).json({ message: "Thanks, " + nameValue + ". We received your note.", entry });
});

app.listen(PORT, () => {
  console.log(${JSON.stringify(name)} + " API on http://localhost:" + PORT);
});
`;
}

function buildPackageJson(name: string, slug: string): string {
  return JSON.stringify({
    name: slug,
    version: "1.0.0",
    private: true,
    description: `${name} — full-stack website generated in Lunor.AI`,
    main: "src/server.js",
    scripts: {
      start: "node src/server.js",
      dev: "node src/server.js",
    },
    dependencies: {
      cors: "^2.8.5",
      express: "^4.21.2",
    },
  }, null, 2) + "\n";
}

function buildReadme(project: { name: string; kind: WebsiteKind; tagline: string }): string {
  return `# ${project.name}

${project.tagline}

Generated by the Web Development full-stack website automation.

## Files

- \`src/index.html\` — page structure
- \`src/style.css\` — layout and theme
- \`src/app.js\` — catalog and contact form (falls back if the API is offline)
- \`src/server.js\` — Express API
- \`package.json\` — start script and dependencies

## Run the API

From the project root:

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## API

- \`GET /api/health\`
- \`GET /api/items\`
- \`POST /api/items\` with \`{ "title", "description" }\`
- \`POST /api/contact\` with \`{ "name", "email", "message" }\`

The editor preview cannot reach this server, so the page shows the seed catalog until you run it locally.

Kind: \`${project.kind}\`
`;
}

function summaryFor(project: { name: string; kind: WebsiteKind }): string {
  return `Built **${project.name}** as a full-stack website and applied the files.

**Client** (live in the preview): \`index.html\`, \`style.css\`, \`app.js\`
**API**: \`server.js\` with \`GET /api/items\` and \`POST /api/contact\`
**Project**: \`package.json\`, \`README.md\`

The preview uses the seed catalog because the editor cannot call Express. Locally, run \`npm install\` and \`npm start\`, then open http://localhost:3000.

Kind: \`${project.kind}\`. Ask for another site, or tell me what to change on this one.`;
}

export function generateFullStackWebsite(prompt: string): WebsiteProject {
  const kind = detectKind(prompt);
  const name = extractName(prompt, kind);
  const slug = slugify(name);
  const tagline = TAGLINES[kind];
  const items = buildCatalog(kind);
  const theme = THEMES[kind];

  const files: WebsiteFile[] = [
    { id: "src/index.html", parentId: "src", name: "index.html", language: "html", content: buildHtml({ name, tagline, kind }) },
    { id: "src/style.css", parentId: "src", name: "style.css", language: "css", content: buildCss(theme) },
    { id: "src/app.js", parentId: "src", name: "app.js", language: "javascript", content: buildClientJs(items) },
    { id: "src/server.js", parentId: "src", name: "server.js", language: "javascript", content: buildServer(name, items) },
    { id: "package.json", parentId: null, name: "package.json", language: "json", content: buildPackageJson(name, slug) },
    { id: "README.md", parentId: null, name: "README.md", language: "markdown", content: buildReadme({ name, kind, tagline }) },
  ];

  return { name, slug, kind, tagline, files, summary: summaryFor({ name, kind }) };
}

export function formatWebsiteForChat(project: WebsiteProject): string {
  const blocks = project.files.map((file) => {
    const fence = file.language === "html" ? "html"
      : file.language === "css" ? "css"
      : file.language === "json" ? "json"
      : file.language === "markdown" ? "markdown"
      : "javascript";
    return `${file.name}\n\`\`\`${fence}\n${file.content.trim()}\n\`\`\``;
  }).join("\n\n");
  return `${project.summary}\n\n${blocks}`;
}
