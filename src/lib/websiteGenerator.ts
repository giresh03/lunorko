/**
 * Full-stack website generator for the Web Development AI assistant.
 * Each blueprint writes a previewable vanilla site plus an Express API.
 * The browser preview uses seed data when the API is not running.
 */

export interface ProjectFile {
  path: string;
  name: string;
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

export interface WebsiteBlueprint {
  id: string;
  label: string;
  icon: string;
  description: string;
  prompt: string;
}

interface SiteItem {
  id: string;
  title: string;
  summary: string;
  meta: string;
  image: string;
}

interface SiteSpec {
  id: string;
  label: string;
  icon: string;
  description: string;
  prompt: string;
  brand: string;
  kicker: string;
  headline: string;
  lede: string;
  catalogTitle: string;
  catalogNoun: string;
  formTitle: string;
  formHint: string;
  submitLabel: string;
  features: { title: string; body: string }[];
  items: SiteItem[];
  palette: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accentText: string;
  };
  font: string;
  heroImage: string;
}

const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

const SPECS: SiteSpec[] = [
  {
    id: "saas-landing",
    label: "SaaS landing",
    icon: "✦",
    description: "Product site with pricing and a lead form",
    prompt: "Build a full-stack SaaS landing website with a hero, feature grid, pricing catalog, and a lead form backed by an Express API.",
    brand: "Northstar",
    kicker: "Analytics for small teams",
    headline: "See the work that actually moves the number.",
    lede: "Northstar turns product events into a weekly story your whole team can read. No warehouse project required.",
    catalogTitle: "Plans",
    catalogNoun: "plan",
    formTitle: "Book a walkthrough",
    formHint: "The form posts to POST /api/messages. If the API is offline, the browser keeps a local copy.",
    submitLabel: "Request demo",
    features: [
      { title: "Live funnels", body: "Watch signup, activation, and retention without a SQL detour." },
      { title: "Shared notes", body: "Pin a chart to the Monday review and leave the question next to it." },
      { title: "Quiet alerts", body: "Get one message when a metric leaves its normal band." },
    ],
    items: [
      { id: "starter", title: "Starter", summary: "3 seats, 30-day history, email digest.", meta: "$0", image: photo("1460925895917-afdab827c52f", 800) },
      { id: "team", title: "Team", summary: "Unlimited seats, goals, and shared boards.", meta: "$49/mo", image: photo("1551288049-bebda4e38f71", 800) },
      { id: "scale", title: "Scale", summary: "SSO, warehouse export, and priority support.", meta: "$199/mo", image: photo("1553877522-43269d4ea984", 800) },
    ],
    palette: { bg: "#0b1020", surface: "#151b2e", text: "#f4f7fb", muted: "#9aa6bd", accent: "#7c5cff", accentText: "#ffffff" },
    font: "Sora",
    heroImage: photo("1551434678-e076c223a692"),
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: "◻",
    description: "Case-study site with a project catalog",
    prompt: "Build a full-stack portfolio website with a project catalog and a contact form backed by an Express API.",
    brand: "Avery Lane",
    kicker: "Product designer",
    headline: "Interfaces with a point of view.",
    lede: "Selected work for climate, publishing, and tools people open every morning.",
    catalogTitle: "Selected work",
    catalogNoun: "project",
    formTitle: "Start a project",
    formHint: "Messages are stored by the API in memory and returned from GET /api/messages.",
    submitLabel: "Send note",
    features: [
      { title: "Research first", body: "Every case study starts with the constraint, not the mock." },
      { title: "Systems, not screens", body: "Type, color, and components travel with the product." },
      { title: "Shipped with engineers", body: "Specs stay close to the code that implements them." },
    ],
    items: [
      { id: "field", title: "Field Guide", summary: "A reading app for long climate reports.", meta: "2025", image: photo("1506744038136-46273834b3fb", 800) },
      { id: "press", title: "Pressroom", summary: "Editorial CMS for a weekly magazine.", meta: "2024", image: photo("1513364776144-60967b0f800f", 800) },
      { id: "orbit", title: "Orbit", summary: "Scheduling for distributed design teams.", meta: "2024", image: photo("1498050108023-c5249f4df085", 800) },
    ],
    palette: { bg: "#f6f1e8", surface: "#fffdf8", text: "#1c1915", muted: "#6d655c", accent: "#c2410c", accentText: "#fff7ed" },
    font: "Fraunces",
    heroImage: photo("1500530855697-b586d89ba3ee"),
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "♨",
    description: "Menu, hours, and reservation requests",
    prompt: "Build a full-stack restaurant website with a menu catalog and reservation form backed by an Express API.",
    brand: "Harbor & Rye",
    kicker: "Supper by the water",
    headline: "Fire, rye, and a table with a view.",
    lede: "Seasonal plates, a short wine list, and two seatings a night. Walk-ins when the bar is open.",
    catalogTitle: "Tonight's menu",
    catalogNoun: "dish",
    formTitle: "Request a table",
    formHint: "Reservations post to /api/messages. The kitchen still confirms by phone.",
    submitLabel: "Request table",
    features: [
      { title: "Two seatings", body: "5:30 and 8:00. The bar stays open between them." },
      { title: "Market fish", body: "The board changes with the boats that came in that morning." },
      { title: "Private room", body: "Twelve seats, a set menu, and the harbor windows." },
    ],
    items: [
      { id: "oysters", title: "Chilled oysters", summary: "Citrus, rye, and cracked pepper.", meta: "$18", image: photo("1559339352-11d035aa65de", 800) },
      { id: "rye", title: "Rye pasta", summary: "Brown butter, herbs, and smoked salt.", meta: "$24", image: photo("1473093295043-cdd812d0e601", 800) },
      { id: "bass", title: "Charred bass", summary: "Fennel, lemon, and late greens.", meta: "$36", image: photo("1414235077428-338989a2e8c0", 800) },
    ],
    palette: { bg: "#140e0c", surface: "#231814", text: "#f8f1ea", muted: "#cbb8a6", accent: "#e07a3d", accentText: "#1a100c" },
    font: "Libre Baskerville",
    heroImage: photo("1414235077428-338989a2e8c0"),
  },
  {
    id: "store",
    label: "Online store",
    icon: "▢",
    description: "Product grid with an order note API",
    prompt: "Build a full-stack online store with a product catalog and an order note form backed by an Express API.",
    brand: "Lumen Goods",
    kicker: "Objects for a smaller desk",
    headline: "Tools you keep on the table.",
    lede: "Lamps, notebooks, and ceramics made in short runs. Shipping twice a week.",
    catalogTitle: "In the shop",
    catalogNoun: "product",
    formTitle: "Ask about an order",
    formHint: "Order notes hit POST /api/messages. Catalog data comes from GET /api/items.",
    submitLabel: "Send order note",
    features: [
      { title: "Small batches", body: "When a run sells through, it stays sold through." },
      { title: "Repair notes", body: "Every object includes how to fix it, not just how to buy another." },
      { title: "Local pickup", body: "The studio is open Saturday mornings." },
    ],
    items: [
      { id: "lamp", title: "Arc lamp", summary: "Brass arm, linen shade, warm bulb.", meta: "$180", image: photo("1507473885765-e6ed057f782c", 800) },
      { id: "notebook", title: "Field notebook", summary: "Plain paper, lay-flat binding.", meta: "$22", image: photo("1512820790803-83ca734da794", 800) },
      { id: "cup", title: "Studio cup", summary: "Speckled stoneware, 10 oz.", meta: "$38", image: photo("1514228742587-6b1558fcca3d", 800) },
    ],
    palette: { bg: "#f3f4f6", surface: "#ffffff", text: "#111827", muted: "#6b7280", accent: "#0f766e", accentText: "#f0fdfa" },
    font: "Outfit",
    heroImage: photo("1441986300917-64674bd600d8"),
  },
  {
    id: "blog",
    label: "Magazine",
    icon: "☰",
    description: "Article index with a letter signup",
    prompt: "Build a full-stack magazine website with an article catalog and a newsletter signup backed by an Express API.",
    brand: "Field Notes",
    kicker: "A magazine about making",
    headline: "Essays from the workshop floor.",
    lede: "Reporting on tools, materials, and the people who still make things by hand.",
    catalogTitle: "Latest pieces",
    catalogNoun: "story",
    formTitle: "Get the Sunday letter",
    formHint: "Signups are stored by the API. The page still confirms if the server is down.",
    submitLabel: "Subscribe",
    features: [
      { title: "One story a week", body: "Long enough to sit with, short enough to finish." },
      { title: "Original photos", body: "Shot on site, not pulled from a generic library in the essay itself." },
      { title: "Open archive", body: "Every piece stays on the site. Nothing goes behind a countdown." },
    ],
    items: [
      { id: "lathe", title: "The last lathe", summary: "A shop in Maine that still turns chair legs.", meta: "12 min", image: photo("1452860606245-08befc0ff44b", 800) },
      { id: "ink", title: "Ink that stays", summary: "How a printer mixes black that does not fade.", meta: "8 min", image: photo("1455390582262-044cdead277a", 800) },
      { id: "kiln", title: "Night kiln", summary: "Firing stoneware when the grid is quiet.", meta: "10 min", image: photo("1565193566173-7a0ee3dbe261", 800) },
    ],
    palette: { bg: "#f7f5f2", surface: "#ffffff", text: "#1f1a17", muted: "#6b625b", accent: "#9f1239", accentText: "#fff1f2" },
    font: "Newsreader",
    heroImage: photo("1455390582262-044cdead277a"),
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "▦",
    description: "Task board with an items API",
    prompt: "Build a full-stack operations dashboard with a task catalog and a new-task form backed by an Express API.",
    brand: "Pulseboard",
    kicker: "Ops for a ten-person team",
    headline: "What is moving, what is stuck, what is next.",
    lede: "A single board for incidents, launches, and the work that keeps the product up.",
    catalogTitle: "Open work",
    catalogNoun: "task",
    formTitle: "Add a task",
    formHint: "New tasks post to /api/messages and the catalog is served from /api/items.",
    submitLabel: "Add task",
    features: [
      { title: "One owner", body: "Every card names a person, not a channel." },
      { title: "Status in words", body: "Blocked, in progress, or done. No rainbow of states." },
      { title: "End of day", body: "The board writes a short summary you can paste into chat." },
    ],
    items: [
      { id: "billing", title: "Fix billing retry", summary: "Failed charges are not retried after a network blip.", meta: "Blocked", image: photo("1554224155-6726b3ff858f", 800) },
      { id: "onboarding", title: "Shorten onboarding", summary: "Drop two steps before the first chart.", meta: "In progress", image: photo("1460925895917-afdab827c52f", 800) },
      { id: "status", title: "Status page", summary: "Publish incidents without paging the whole company.", meta: "Next", image: photo("1551288049-bebda4e38f71", 800) },
    ],
    palette: { bg: "#0c1210", surface: "#16201c", text: "#e7f5ef", muted: "#93b3a6", accent: "#34d399", accentText: "#052e26" },
    font: "IBM Plex Sans",
    heroImage: photo("1551288049-bebda4e38f71"),
  },
];

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = SPECS.map((spec) => ({
  id: spec.id,
  label: spec.label,
  icon: spec.icon,
  description: spec.description,
  prompt: spec.prompt,
}));

const ROOT_FILES = new Set(["package.json", "README.md", "readme.md"]);

export function getWebsiteBlueprint(id: string): WebsiteBlueprint | undefined {
  return WEBSITE_BLUEPRINTS.find((blueprint) => blueprint.id === id);
}

export function normalizeProjectPath(filename: string): string {
  const clean = filename.trim().replace(/^\.?\//, "").replace(/\\/g, "/");
  if (!clean || clean.includes("..")) return "src/untitled.txt";
  if (clean.startsWith("src/") || clean.startsWith("server/") || ROOT_FILES.has(clean)) return clean;
  const base = clean.split("/").pop() || clean;
  if (base === "server.js") return "server/server.js";
  return `src/${base}`;
}

export function upsertProjectFile(tree: TreeNode[], file: ProjectFile): TreeNode[] {
  const parts = file.path.split("/").filter(Boolean);
  if (parts.length === 0) return tree;

  const walk = (nodes: TreeNode[], depth: number): TreeNode[] => {
    const part = parts[depth];
    const isFile = depth === parts.length - 1;
    const id = parts.slice(0, depth + 1).join("/");
    const index = nodes.findIndex((node) => node.id === id || node.name === part);

    if (isFile) {
      const next: TreeNode = {
        id,
        name: file.name || part,
        type: "file",
        language: file.language,
        content: file.content,
      };
      if (index === -1) return [...nodes, next];
      return nodes.map((node, i) => (i === index ? next : node));
    }

    const existing = index === -1 ? undefined : nodes[index];
    const children = walk(existing?.type === "folder" ? existing.children ?? [] : [], depth + 1);
    const folder: TreeNode = { id, name: part, type: "folder", isOpen: true, children };
    if (index === -1) return [...nodes, folder];
    return nodes.map((node, i) => (i === index ? folder : node));
  };

  return walk(tree, 0);
}

function pluralize(noun: string): string {
  if (/(s|x|z|ch|sh)$/i.test(noun)) return `${noun}es`;
  if (/[^aeiou]y$/i.test(noun)) return `${noun.slice(0, -1)}ies`;
  return `${noun}s`;
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

function renderHtml(spec: SiteSpec, brief: string): string {
  const lede = brief.trim() || spec.lede;
  const title = brief.trim() ? `${spec.brand} — ${brief.trim().slice(0, 72)}` : spec.brand;
  const features = spec.features
    .map(
      (feature) => `<article class="feature">
        <h3>${escapeHtml(feature.title)}</h3>
        <p>${escapeHtml(feature.body)}</p>
      </article>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(spec.font).replace(/%20/g, "+")}:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="true" style="--bg:${spec.palette.bg};--surface:${spec.palette.surface};--text:${spec.palette.text};--muted:${spec.palette.muted};--accent:${spec.palette.accent};--accent-text:${spec.palette.accentText};--font:'${spec.font}', Georgia, sans-serif;">
  <header class="site-header">
    <a class="brand" href="#top">${escapeHtml(spec.brand)}</a>
    <button id="nav-toggle" class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav">
      <a href="#features">Approach</a>
      <a href="#catalog">${escapeHtml(spec.catalogTitle)}</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero" style="background-image: linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url('${spec.heroImage}');">
      <p class="kicker">${escapeHtml(spec.kicker)}</p>
      <h1>${escapeHtml(spec.headline)}</h1>
      <p class="lede">${escapeHtml(lede)}</p>
      <a class="button" href="#catalog">View ${escapeHtml(pluralize(spec.catalogNoun))}</a>
    </section>

    <section id="features" class="section">
      <div class="section-heading">
        <h2>How it works</h2>
        <p>Three parts of the ${escapeHtml(spec.brand)} site, written as real HTML, CSS, and JavaScript.</p>
      </div>
      <div class="feature-grid">
        ${features}
      </div>
    </section>

    <section id="catalog" class="section">
      <div class="section-heading">
        <h2>${escapeHtml(spec.catalogTitle)}</h2>
        <p>Loaded from <code>GET /api/items</code>. The page uses the seed below when the API is offline.</p>
      </div>
      <label class="search-label" for="catalog-search">Search ${escapeHtml(pluralize(spec.catalogNoun))}</label>
      <input id="catalog-search" type="search" placeholder="Search ${escapeHtml(pluralize(spec.catalogNoun))}">
      <div id="catalog-grid" class="catalog-grid" aria-live="polite"></div>
    </section>

    <section id="contact" class="section">
      <div class="section-heading">
        <h2>${escapeHtml(spec.formTitle)}</h2>
        <p>${escapeHtml(spec.formHint)}</p>
      </div>
      <form id="contact-form" class="contact-form">
        <label>Name<input name="name" required maxlength="80" autocomplete="name"></label>
        <label>Email<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
        <label>Note<textarea name="note" required maxlength="500" rows="4"></textarea></label>
        <button class="button" type="submit">${escapeHtml(spec.submitLabel)}</button>
        <p id="form-status" class="form-status" role="status"></p>
      </form>
    </section>
  </main>

  <footer class="site-footer">
    <p>${escapeHtml(spec.brand)} · full-stack starter from Lunor.AI</p>
    <p id="year"></p>
  </footer>

  <script id="site-data" type="application/json">${jsonForHtml(spec.items)}</script>
  <script src="script.js"></script>
</body>
</html>
`;
}

function renderCss(): string {
  return `/* Full-stack website styles. Colors come from CSS variables on <body>. */
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; }

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 6vw;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
  backdrop-filter: blur(10px);
}
.brand { font-weight: 700; text-decoration: none; letter-spacing: -0.03em; }
.site-nav { display: flex; gap: 16px; margin-left: auto; }
.site-nav a { text-decoration: none; color: var(--muted); font-size: 0.95rem; }
.site-nav a:hover { color: var(--text); }
.nav-toggle {
  display: none;
  margin-left: auto;
  background: transparent;
  color: var(--text);
  border: 1px solid color-mix(in srgb, var(--text) 25%, transparent);
  border-radius: 999px;
  padding: 6px 12px;
}

.hero {
  min-height: 72vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  padding: 12vh 6vw 8vh;
  background-size: cover;
  background-position: center;
  color: #f8fafc;
}
.kicker { margin: 0; letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.75rem; }
.hero h1 { margin: 0; max-width: 16ch; font-size: clamp(2.4rem, 6vw, 5rem); line-height: 0.95; letter-spacing: -0.04em; }
.lede { max-width: 42rem; margin: 0; font-size: 1.1rem; }
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin-top: 8px;
  padding: 12px 18px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-text);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.button:hover { transform: translateY(-1px); }

.section { padding: 64px 6vw; }
.section-heading { max-width: 40rem; margin-bottom: 24px; }
.section-heading h2 { margin: 0 0 8px; letter-spacing: -0.03em; }
.section-heading p { margin: 0; color: var(--muted); }
.feature-grid, .catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.feature, .card {
  background: var(--surface);
  border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: 18px;
  padding: 18px;
}
.feature h3, .card h3 { margin: 0 0 8px; }
.feature p, .card p { margin: 0; color: var(--muted); }
.card img { height: 180px; width: 100%; object-fit: cover; border-radius: 12px; margin-bottom: 12px; }
.card .meta { margin-top: 10px; font-weight: 700; color: var(--accent); }

.search-label { display: block; margin-bottom: 8px; color: var(--muted); font-size: 0.9rem; }
#catalog-search, .contact-form input, .contact-form textarea {
  width: min(100%, 720px);
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
  background: var(--surface);
  color: var(--text);
  font: inherit;
}
.catalog-grid { margin-top: 16px; }
.contact-form { display: grid; gap: 12px; max-width: 640px; }
.contact-form label { display: grid; gap: 6px; font-size: 0.92rem; }
.form-status { min-height: 1.2em; margin: 0; color: var(--muted); }
.site-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 28px 6vw 40px;
  color: var(--muted);
  border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
}
.empty { color: var(--muted); }

@media (max-width: 800px) {
  .nav-toggle { display: inline-flex; }
  .site-nav {
    display: none;
    position: absolute;
    top: 58px;
    left: 0;
    right: 0;
    flex-direction: column;
    padding: 12px 6vw 16px;
    background: var(--surface);
  }
  .site-nav.open { display: flex; }
  .feature-grid, .catalog-grid { grid-template-columns: 1fr; }
  .site-footer { flex-direction: column; }
}
`;
}

function renderClientJs(): string {
  return `// Browser client for the generated site.
// Talks to the Express API on localhost:3000 and falls back to #site-data.
const API_ORIGIN = "http://localhost:3000";

const seedNode = document.getElementById("site-data");
const seed = seedNode ? JSON.parse(seedNode.textContent || "[]") : [];
const grid = document.getElementById("catalog-grid");
const search = document.getElementById("catalog-search");
const form = document.getElementById("contact-form");
const statusNode = document.getElementById("form-status");
const nav = document.getElementById("site-nav");
const navToggle = document.getElementById("nav-toggle");
const year = document.getElementById("year");

if (year) year.textContent = String(new Date().getFullYear());

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function renderItems(items) {
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<p class="empty">Nothing matches that search.</p>';
    return;
  }
  grid.innerHTML = items.map((item) => \`
    <article class="card">
      <img src="\${item.image}" alt="\${item.title}">
      <h3>\${item.title}</h3>
      <p>\${item.summary}</p>
      <p class="meta">\${item.meta}</p>
    </article>
  \`).join("");
}

async function loadItems() {
  try {
    const response = await fetch(API_ORIGIN + "/api/items");
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected payload");
    return data;
  } catch (error) {
    console.info("Using seed data because the API is offline.", error);
    return seed;
  }
}

let items = [];
loadItems().then((data) => {
  items = data;
  renderItems(items);
});

if (search) {
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    renderItems(items.filter((item) =>
      (item.title + " " + item.summary + " " + item.meta).toLowerCase().includes(query)
    ));
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch(API_ORIGIN + "/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Request failed");
      if (statusNode) statusNode.textContent = "Saved on the API.";
    } catch (error) {
      const key = "lunor-website-messages";
      const previous = JSON.parse(localStorage.getItem(key) || "[]");
      previous.push({ ...payload, id: Date.now() });
      localStorage.setItem(key, JSON.stringify(previous));
      if (statusNode) statusNode.textContent = "API offline. Saved in this browser. Run npm start in the project to store it on the server.";
      console.info(error);
    }
    form.reset();
  });
}
`;
}

function renderServer(spec: SiteSpec): string {
  const items = JSON.stringify(spec.items, null, 2);
  return `// Express API for the ${spec.brand} site.
// Run from the project root: npm install && npm start
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const items = ${items};
const messages = [];

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "src")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: ${JSON.stringify(spec.brand)} });
});

app.get("/api/items", (_req, res) => {
  res.json(items);
});

app.post("/api/items", (req, res) => {
  const { title, summary, meta, image } = req.body || {};
  if (!title || !summary) {
    return res.status(400).json({ error: "title and summary are required" });
  }
  const item = {
    id: String(Date.now()),
    title: String(title),
    summary: String(summary),
    meta: String(meta || "New"),
    image: String(image || items[0].image),
  };
  items.push(item);
  res.status(201).json(item);
});

app.get("/api/messages", (_req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { name, email, note } = req.body || {};
  if (!name || !email || !note) {
    return res.status(400).json({ error: "name, email, and note are required" });
  }
  const message = {
    id: String(Date.now()),
    name: String(name),
    email: String(email),
    note: String(note),
    createdAt: new Date().toISOString(),
  };
  messages.push(message);
  res.status(201).json(message);
});

app.listen(PORT, () => {
  console.log(${JSON.stringify(spec.brand + " API")} + " listening on http://localhost:" + PORT);
});
`;
}

function renderPackageJson(spec: SiteSpec): string {
  return JSON.stringify(
    {
      name: spec.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      version: "1.0.0",
      private: true,
      description: `${spec.brand} full-stack website generated by Lunor.AI`,
      scripts: { start: "node server/server.js" },
      dependencies: { express: "^4.21.2" },
    },
    null,
    2
  ) + "\n";
}

function renderReadme(spec: SiteSpec, brief: string): string {
  const focus = brief.trim() ? `\n\nCustom brief: ${brief.trim()}\n` : "\n";
  return `# ${spec.brand}

Full-stack website generated by the Lunor.AI Web Development assistant.
${focus}
## What you get

- \`src/index.html\` — page structure
- \`src/styles.css\` — layout and theme
- \`src/script.js\` — catalog, search, and form. Uses seed data when the API is down
- \`server/server.js\` — Express API
- \`package.json\` — start script

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/health | Service check |
| GET | /api/items | Catalog for the page |
| POST | /api/items | Add a catalog item (\`title\`, \`summary\`) |
| GET | /api/messages | List form submissions |
| POST | /api/messages | Save a form submission (\`name\`, \`email\`, \`note\`) |

## Run the API

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000. The in-editor preview also renders the page, and it keeps working before the server is started.
`;
}

export function buildWebsiteProject(blueprintId: string, brief = ""): ProjectFile[] {
  const spec = SPECS.find((entry) => entry.id === blueprintId) ?? SPECS[0];
  const files: ProjectFile[] = [
    { path: "src/index.html", name: "index.html", language: "html", content: renderHtml(spec, brief) },
    { path: "src/styles.css", name: "styles.css", language: "css", content: renderCss() },
    { path: "src/script.js", name: "script.js", language: "javascript", content: renderClientJs() },
    { path: "server/server.js", name: "server.js", language: "javascript", content: renderServer(spec) },
    { path: "package.json", name: "package.json", language: "json", content: renderPackageJson(spec) },
    { path: "README.md", name: "README.md", language: "markdown", content: renderReadme(spec, brief) },
  ];
  return files;
}

export function websiteGeneratorPrompt(blueprintId: string, brief: string): string {
  const blueprint = getWebsiteBlueprint(blueprintId) ?? WEBSITE_BLUEPRINTS[0];
  const direction = brief.trim() || blueprint.description;
  return `${blueprint.prompt}

Brand direction: ${direction}

Return exactly these files and no others:
src/index.html
src/styles.css
src/script.js
server/server.js
package.json
README.md

Rules:
- Frontend is vanilla HTML, CSS, and JavaScript. No React, JSX, or TypeScript.
- src/index.html links styles.css and script.js and includes a <script id="site-data" type="application/json"> seed.
- src/script.js fetches http://localhost:3000/api/items and falls back to that seed. The contact form POSTs to http://localhost:3000/api/messages and saves to localStorage if the request fails.
- server/server.js is Express. It serves ../src, allows CORS, and implements GET/POST /api/items and GET/POST /api/messages.
- Use relevant https://images.unsplash.com photos.
- Keep the page responsive, with a real hero, a catalog, and a working form.`;
}
