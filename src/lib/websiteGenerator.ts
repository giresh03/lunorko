/**
 * Local full-stack website generator for the Web Development AI assistant.
 * Builds a vanilla client plus an Express API without calling a model.
 */

export type WebsitePreset = "portfolio" | "restaurant" | "shop" | "blog" | "saas" | "studio";

export interface WebsiteFile {
  path: string;
  language: string;
  content: string;
}

export interface WebsiteTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  isOpen?: boolean;
  children?: WebsiteTreeNode[];
}

export interface GeneratedWebsite {
  preset: WebsitePreset;
  name: string;
  tagline: string;
  files: WebsiteFile[];
  assistantMessage: string;
}

export interface WebsitePresetOption {
  id: WebsitePreset;
  label: string;
  prompt: string;
}

interface SiteItem {
  id: string;
  title: string;
  summary: string;
  meta: string;
  tag: string;
  image: string;
}

interface PresetBlueprint {
  id: WebsitePreset;
  label: string;
  defaultName: string;
  prompt: string;
  eyebrow: string;
  tagline: string;
  aboutTitle: string;
  about: string;
  sectionTitle: string;
  inquiryHeading: string;
  inquiryHint: string;
  accent: string;
  accentInk: string;
  bg: string;
  bgElevated: string;
  ink: string;
  muted: string;
  line: string;
  heroImage: string;
  items: SiteItem[];
}

const unsplash = (id: string, width: number, height: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;

const PRESETS: Record<WebsitePreset, PresetBlueprint> = {
  portfolio: {
    id: "portfolio",
    label: "Portfolio",
    defaultName: "Alex Rivera",
    prompt: "Build a portfolio website for Alex Rivera",
    eyebrow: "Product designer",
    tagline: "Interfaces for teams who ship careful software.",
    aboutTitle: "Selected work",
    about: "Independent designer partnering with product teams on brand, web, and the first version of tools people use every day.",
    sectionTitle: "Projects",
    inquiryHeading: "Start a project",
    inquiryHint: "Share a short brief. The API stores it when the server is running.",
    accent: "#d6ff4a",
    accentInk: "#142000",
    bg: "#10140c",
    bgElevated: "#1a2114",
    ink: "#f4f7ea",
    muted: "#b7c2a4",
    line: "#2c3822",
    heroImage: unsplash("1558618666-fcd25c85cd64", 1800, 1100),
    items: [
      {
        id: "harbor",
        title: "Harbor Analytics",
        summary: "A calmer dashboard for a logistics team that watches shipments across three coasts.",
        meta: "2025 · Product",
        tag: "Dashboard",
        image: unsplash("1551288049-bebda4e38f71", 900, 700),
      },
      {
        id: "northline",
        title: "Northline Transit",
        summary: "Wayfinding and a mobile site for a city rail line, built around real arrival times.",
        meta: "2024 · Brand + web",
        tag: "Transit",
        image: unsplash("1474487548417-781cb71495f3", 900, 700),
      },
      {
        id: "field",
        title: "Field Museum Guide",
        summary: "A visitor guide that works on a phone in low light, with rooms you can actually find.",
        meta: "2024 · Mobile web",
        tag: "Culture",
        image: unsplash("1513364776144-60967b0f800f", 900, 700),
      },
    ],
  },
  restaurant: {
    id: "restaurant",
    label: "Restaurant",
    defaultName: "Luna Bistro",
    prompt: "Build a restaurant website for Luna Bistro",
    eyebrow: "Dinner · Thursday to Sunday",
    tagline: "Wood fire, citrus, and a short menu that changes with the market.",
    aboutTitle: "The room",
    about: "A 42-seat bistro. Reservations are held for two hours, and the kitchen closes when the last loaf is gone.",
    sectionTitle: "Tonight's menu",
    inquiryHeading: "Request a table",
    inquiryHint: "Tell us the date, the size of your party, and any notes for the kitchen.",
    accent: "#e7a06a",
    accentInk: "#2a1408",
    bg: "#1a120c",
    bgElevated: "#2a1c13",
    ink: "#f8efe6",
    muted: "#d3bfae",
    line: "#433024",
    heroImage: unsplash("1414235077428-338989a2e8c0", 1800, 1100),
    items: [
      {
        id: "burrata",
        title: "Citrus Burrata",
        summary: "Cream, blood orange, fennel pollen, and olive oil from a single grove.",
        meta: "12",
        tag: "First",
        image: unsplash("1504674900247-0877df9cc836", 900, 700),
      },
      {
        id: "branzino",
        title: "Wood-Fired Branzino",
        summary: "Whole fish, charred lemon, and herbs from the pots by the back door.",
        meta: "29",
        tag: "Main",
        image: unsplash("1476224203421-9ac39bcb3327", 900, 700),
      },
      {
        id: "cake",
        title: "Olive Oil Cake",
        summary: "Warm cake, whipped cream, and a spoon of citrus marmalade.",
        meta: "11",
        tag: "Sweet",
        image: unsplash("1565958011703-44f9829ba187", 900, 700),
      },
    ],
  },
  shop: {
    id: "shop",
    label: "Shop",
    defaultName: "North & Pine",
    prompt: "Build a shop website for North & Pine",
    eyebrow: "Goods for slow mornings",
    tagline: "Objects we use ourselves, shipped in paper and twine.",
    aboutTitle: "The shop",
    about: "A small store of clothing and kitchen tools. Each piece is made in short runs and restocked when it is ready.",
    sectionTitle: "In stock",
    inquiryHeading: "Ask about an order",
    inquiryHint: "Questions about sizing, shipping, or a gift note land in the inquiries API.",
    accent: "#c4b5fd",
    accentInk: "#1b1030",
    bg: "#121018",
    bgElevated: "#1d1928",
    ink: "#f5f3ff",
    muted: "#c9c2dc",
    line: "#332b44",
    heroImage: unsplash("1441986300917-64674bd600d8", 1800, 1100),
    items: [
      {
        id: "overshirt",
        title: "Wool Overshirt",
        summary: "Heavy wool, horn buttons, and a cut that layers over a tee or a knit.",
        meta: "$168",
        tag: "Apparel",
        image: unsplash("1489987707025-afc232f7ea0f", 900, 700),
      },
      {
        id: "pourover",
        title: "Ceramic Pour-Over",
        summary: "Speckled stoneware sized for two cups. The glaze is matte and easy to hold.",
        meta: "$64",
        tag: "Kitchen",
        image: unsplash("1495474472287-4d71bcdd2085", 900, 700),
      },
      {
        id: "weekender",
        title: "Leather Weekender",
        summary: "Vegetable-tanned leather that darkens where your hand rests on the handle.",
        meta: "$240",
        tag: "Carry",
        image: unsplash("1547949003-9792a18a2601", 900, 700),
      },
    ],
  },
  blog: {
    id: "blog",
    label: "Blog",
    defaultName: "Field Notes",
    prompt: "Build a blog website for Field Notes",
    eyebrow: "Essays and dispatches",
    tagline: "Writing about cities, tools, and the time between projects.",
    aboutTitle: "About the desk",
    about: "Field Notes is a one-person journal. New pieces land on Sundays. The archive stays readable on a phone.",
    sectionTitle: "Latest",
    inquiryHeading: "Write in",
    inquiryHint: "Pitch a note or send a correction. Messages post to /api/inquiries.",
    accent: "#7dd3fc",
    accentInk: "#042433",
    bg: "#0c121c",
    bgElevated: "#152033",
    ink: "#e8f1fb",
    muted: "#b7c6d8",
    line: "#24344a",
    heroImage: unsplash("1455390582262-044cdead277a", 1800, 1100),
    items: [
      {
        id: "rain",
        title: "Cities After Rain",
        summary: "What a street sounds like when the traffic waits and the pavement is still shining.",
        meta: "8 min",
        tag: "Places",
        image: unsplash("1506744038136-46273834b3fb", 900, 700),
      },
      {
        id: "desk",
        title: "A Desk by the Window",
        summary: "A record of the tools that stayed after a year of trying too many apps.",
        meta: "6 min",
        tag: "Work",
        image: unsplash("1486312338219-ce68d2c6f44d", 900, 700),
      },
      {
        id: "slow",
        title: "Notes on Slow Software",
        summary: "Why a page that loads with the document, and not after it, still feels like a luxury.",
        meta: "11 min",
        tag: "Software",
        image: unsplash("1517694712202-14dd9538aa97", 900, 700),
      },
    ],
  },
  saas: {
    id: "saas",
    label: "SaaS",
    defaultName: "Nimbus",
    prompt: "Build a SaaS website for Nimbus",
    eyebrow: "Shared inbox for support teams",
    tagline: "Every customer note in one queue, with owners and a record of what was promised.",
    aboutTitle: "Why teams switch",
    about: "Nimbus replaces the shared mailbox and the side spreadsheet. Assignments stay on the thread, and the status is visible to the whole team.",
    sectionTitle: "What you get",
    inquiryHeading: "Request a walkthrough",
    inquiryHint: "Leave a work email. The inquiry is stored by the API on your machine.",
    accent: "#22d3ee",
    accentInk: "#04282e",
    bg: "#071016",
    bgElevated: "#10202b",
    ink: "#e7f7fb",
    muted: "#b5cdd6",
    line: "#1d3948",
    heroImage: unsplash("1553877522-43269d4ea984", 1800, 1100),
    items: [
      {
        id: "inbox",
        title: "Shared inbox",
        summary: "Mail, chat, and the form on your site arrive as one kind of conversation.",
        meta: "Core",
        tag: "Inbox",
        image: unsplash("1551434678-e076c223a692", 900, 700),
      },
      {
        id: "pipeline",
        title: "Pipeline view",
        summary: "See which notes are waiting, which are promised for today, and which slipped.",
        meta: "Workflow",
        tag: "Board",
        image: unsplash("1460925895917-afdab827c52f", 900, 700),
      },
      {
        id: "alerts",
        title: "Usage alerts",
        summary: "A quiet ping when a queue grows past the line your team agreed on.",
        meta: "Signals",
        tag: "Alerts",
        image: unsplash("1551288049-bebda4e38f71", 900, 700),
      },
    ],
  },
  studio: {
    id: "studio",
    label: "Studio",
    defaultName: "Atelier North",
    prompt: "Build a studio website for Atelier North",
    eyebrow: "Brand and digital studio",
    tagline: "Names, sites, and campaigns for companies that are ready to look like themselves.",
    aboutTitle: "How we work",
    about: "Three partners, a small bench of collaborators, and projects that run from a naming sprint to a launched site.",
    sectionTitle: "Services",
    inquiryHeading: "Book a studio call",
    inquiryHint: "Send the project, the timing, and where you are in the work.",
    accent: "#fb7185",
    accentInk: "#3a0610",
    bg: "#16090d",
    bgElevated: "#261016",
    ink: "#ffe8ec",
    muted: "#e2c1c8",
    line: "#45202a",
    heroImage: unsplash("1529333166437-7750a6dd5a70", 1800, 1100),
    items: [
      {
        id: "brand",
        title: "Brand systems",
        summary: "A name, a voice, and a small kit your team can actually keep using.",
        meta: "6 weeks",
        tag: "Identity",
        image: unsplash("1561070791-2526d30994b5", 900, 700),
      },
      {
        id: "sites",
        title: "Campaign sites",
        summary: "A single sharp page for a launch, with type and motion that match the film.",
        meta: "4 weeks",
        tag: "Web",
        image: unsplash("1467232004584-a241de8bcf5d", 900, 700),
      },
      {
        id: "films",
        title: "Product films",
        summary: "Short pieces shot around the real object, not a render that pretends to be one.",
        meta: "3 weeks",
        tag: "Film",
        image: unsplash("1492691527719-9d1e07e534b4", 900, 700),
      },
    ],
  },
};

export const WEBSITE_PRESETS: WebsitePresetOption[] = (
  Object.keys(PRESETS) as WebsitePreset[]
).map((id) => ({
  id,
  label: PRESETS[id].label,
  prompt: PRESETS[id].prompt,
}));

export const WEBSITE_FILE_PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/app.js",
  "server/index.js",
  "server/routes.js",
  "server/data.js",
  "package.json",
  "README.md",
] as const;

const DEBUG_OR_EXPLAIN =
  /\b(debug|explain|why|how does|how do i|how do you|what is|what are|error|fix|bug|not working|broken|refactor)\b/i;
const BUILD_INTENT = /\b(build|create|make|generate|design|scaffold)\b/i;
const SITE_INTENT = /\b(website|web\s*site|landing\s*page|full[\s-]?stack|site)\b/i;

const PRESET_PATTERNS: { id: WebsitePreset; pattern: RegExp }[] = [
  { id: "restaurant", pattern: /\b(restaurants?|cafes?|café|bistros?|diners?)\b/i },
  { id: "shop", pattern: /\b(shops?|stores?|e-?commerce|boutiques?)\b/i },
  { id: "blog", pattern: /\b(blogs?|magazines?|journals?)\b/i },
  { id: "saas", pattern: /\b(saas|startups?)\b/i },
  { id: "studio", pattern: /\b(studios?|agenc(?:y|ies))\b/i },
  { id: "portfolio", pattern: /\b(portfolios?|freelancers?)\b/i },
];

export function detectWebsitePreset(prompt: string): WebsitePreset | null {
  for (const entry of PRESET_PATTERNS) {
    if (entry.pattern.test(prompt)) return entry.id;
  }
  return null;
}

export function shouldGenerateWebsite(prompt: string): boolean {
  const text = prompt.trim();
  if (!text || DEBUG_OR_EXPLAIN.test(text)) return false;
  const preset = detectWebsitePreset(text);
  if (BUILD_INTENT.test(text) && (SITE_INTENT.test(text) || preset)) return true;
  if (SITE_INTENT.test(text) && preset) return true;
  return false;
}

export function isServerModulePath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").replace(/^\//, "");
  if (normalized === "server" || normalized.startsWith("server/")) return true;
  if (normalized.startsWith("client/")) return false;
  const base = normalized.split("/").pop() || normalized;
  return base === "routes.js" || base === "data.js" || base === "server.js";
}

export function toPreviewFileMap(files: WebsiteFile[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const file of files) {
    if (isServerModulePath(file.path)) continue;
    map[file.path] = file.content;
    const base = file.path.split("/").pop() || file.path;
    if (!map[base]) map[base] = file.content;
  }
  return map;
}

function extractSiteName(prompt: string): string | null {
  const quoted = prompt.match(/\b(?:for|called|named)\s+["']([^"']+)["']/i);
  if (quoted?.[1]) return cleanName(quoted[1]);
  const titled = prompt.match(/\b(?:for|called|named)\s+([A-Z][\w']*(?:\s+(?:&|[A-Z0-9][\w']*)){0,5})/);
  if (titled?.[1]) return cleanName(titled[1]);
  return null;
}

function cleanName(value: string): string {
  return value.replace(/[.?!,]+$/g, "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function renderClientHtml(site: PresetBlueprint, name: string): string {
  const safeName = escapeHtml(name);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeName}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="#top">${safeName}</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="#work">${escapeHtml(site.sectionTitle)}</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="content">
    <section class="hero" id="top">
      <p class="eyebrow">${escapeHtml(site.eyebrow)}</p>
      <h1 id="site-name">${safeName}</h1>
      <p class="tagline">${escapeHtml(site.tagline)}</p>
      <div class="hero-actions">
        <a class="button" href="#work">${escapeHtml(site.sectionTitle)}</a>
        <a class="button button-quiet" href="#contact">${escapeHtml(site.inquiryHeading)}</a>
      </div>
    </section>
    <section class="section" id="work">
      <div class="section-head">
        <h2>${escapeHtml(site.sectionTitle)}</h2>
        <p>Loaded from <code>/api/items</code>. The editor preview uses the seed list in <code>client/app.js</code>.</p>
      </div>
      <div id="items" class="card-grid" aria-live="polite"></div>
    </section>
    <section class="section about" id="about">
      <h2>${escapeHtml(site.aboutTitle)}</h2>
      <p>${escapeHtml(site.about)}</p>
    </section>
    <section class="section" id="contact">
      <div class="section-head">
        <h2>${escapeHtml(site.inquiryHeading)}</h2>
        <p>${escapeHtml(site.inquiryHint)}</p>
      </div>
      <form id="inquiry-form" class="inquiry-form">
        <label>
          Name
          <input id="inquiry-name" name="name" type="text" autocomplete="name" required />
        </label>
        <label>
          Email
          <input id="inquiry-email" name="email" type="email" autocomplete="email" required />
        </label>
        <label>
          Message
          <textarea id="inquiry-message" name="message" rows="4" required></textarea>
        </label>
        <button class="button" type="submit">Send</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer class="site-footer">
    <span>${safeName}</span>
    <span>Full-stack starter · Express API</span>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderStyles(site: PresetBlueprint): string {
  return `:root {
  --accent: ${site.accent};
  --accent-ink: ${site.accentInk};
  --bg: ${site.bg};
  --bg-elevated: ${site.bgElevated};
  --ink: ${site.ink};
  --muted: ${site.muted};
  --line: ${site.line};
  --hero-image: url("${site.heroImage}");
  color-scheme: dark;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.5;
}

a { color: inherit; }

.skip {
  position: absolute;
  left: 1rem;
  top: -4rem;
  background: var(--accent);
  color: var(--accent-ink);
  padding: 0.4rem 0.7rem;
}

.skip:focus { top: 1rem; }

.site-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 6vw;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(10px);
}

.brand {
  font-weight: 700;
  letter-spacing: -0.03em;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
  font-family: "Segoe UI", sans-serif;
  font-size: 0.92rem;
}

.nav-links a { text-decoration: none; color: var(--muted); }
.nav-links a:hover { color: var(--ink); }

.hero {
  min-height: 78vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 8rem 6vw 4rem;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.72)),
    var(--hero-image) center/cover no-repeat;
}

.eyebrow {
  margin: 0;
  font-family: "Segoe UI", sans-serif;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--accent);
}

h1 {
  margin: 0;
  max-width: 12ch;
  font-size: clamp(3.2rem, 8vw, 6.5rem);
  line-height: 0.92;
  letter-spacing: -0.045em;
}

.tagline {
  max-width: 36rem;
  margin: 0;
  font-size: 1.25rem;
  color: var(--ink);
}

.hero-actions, .section-head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 0.75rem 1.1rem;
  background: var(--accent);
  color: var(--accent-ink);
  font-family: "Segoe UI", sans-serif;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
}

.button-quiet {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
}

.section {
  padding: 4rem 6vw;
}

.section-head {
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-head p, .about p {
  max-width: 38rem;
  color: var(--muted);
  font-family: "Segoe UI", sans-serif;
}

h2 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  letter-spacing: -0.03em;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.card {
  display: flex;
  flex-direction: column;
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  border-radius: 1.1rem;
  overflow: hidden;
  min-height: 100%;
}

.card img {
  width: 100%;
  height: 190px;
  object-fit: cover;
  background: var(--line);
}

.card-body { padding: 1rem 1rem 1.15rem; display: grid; gap: 0.45rem; }

.card-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-family: "Segoe UI", sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--accent);
}

.card h3 { margin: 0; font-size: 1.35rem; letter-spacing: -0.03em; }
.card p { margin: 0; color: var(--muted); font-family: "Segoe UI", sans-serif; }

.about {
  display: grid;
  gap: 0.8rem;
  border-top: 1px solid var(--line);
}

.inquiry-form {
  display: grid;
  gap: 0.85rem;
  max-width: 34rem;
}

.inquiry-form label {
  display: grid;
  gap: 0.35rem;
  font-family: "Segoe UI", sans-serif;
  font-size: 0.85rem;
  color: var(--muted);
}

input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  padding: 0.75rem 0.8rem;
  background: var(--bg-elevated);
  color: var(--ink);
  font: inherit;
}

#form-status {
  min-height: 1.2rem;
  margin: 0;
  font-family: "Segoe UI", sans-serif;
  color: var(--accent);
}

.site-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.2rem 6vw 2rem;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-family: "Segoe UI", sans-serif;
  font-size: 0.85rem;
}

code {
  font-family: "SFMono-Regular", ui-monospace, monospace;
  font-size: 0.85em;
}

@media (max-width: 900px) {
  .card-grid { grid-template-columns: 1fr; }
  .site-header, .hero, .section, .site-footer { padding-left: 1.25rem; padding-right: 1.25rem; }
  .nav-links { gap: 0.7rem; }
}
`;
}

function renderClientApp(items: SiteItem[]): string {
  return `const SEED_ITEMS = ${JSON.stringify(items, null, 2)};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderItems(items) {
  const root = document.getElementById("items");
  if (!root) return;
  root.innerHTML = items.map((item) => \`
    <article class="card">
      <img src="\${escapeHtml(item.image)}" alt="" />
      <div class="card-body">
        <div class="card-meta"><span>\${escapeHtml(item.tag)}</span><span>\${escapeHtml(item.meta)}</span></div>
        <h3>\${escapeHtml(item.title)}</h3>
        <p>\${escapeHtml(item.summary)}</p>
      </div>
    </article>
  \`).join("");
}

async function loadItems() {
  try {
    const response = await fetch("/api/items");
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    if (!Array.isArray(data.items)) throw new Error("Unexpected payload");
    renderItems(data.items);
  } catch {
    renderItems(SEED_ITEMS);
  }
}

function setupForm() {
  const form = document.getElementById("inquiry-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: document.getElementById("inquiry-name").value.trim(),
      email: document.getElementById("inquiry-email").value.trim(),
      message: document.getElementById("inquiry-message").value.trim(),
    };
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Request failed");
      status.textContent = "Inquiry sent. We will reply soon.";
      form.reset();
    } catch {
      status.textContent = "Saved in preview. Run npm start to store inquiries on the server.";
    }
  });
}

function boot() {
  loadItems();
  setupForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
`;
}

function renderServerIndex(name: string): string {
  const safe = JSON.stringify(name);
  return `import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { router } from "./routes.js";

const siteName = ${safe};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api", router);
app.use(express.static(path.join(__dirname, "../client")));

app.listen(port, () => {
  console.log(siteName + " listening on http://localhost:" + port);
});
`;
}

function renderRoutes(): string {
  return `import { Router } from "express";
import { items, site } from "./data.js";

export const router = Router();
const inquiries = [];

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: site.name });
});

router.get("/items", (_req, res) => {
  res.json({ items });
});

router.get("/items/:id", (req, res) => {
  const item = items.find((entry) => entry.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ item });
});

router.post("/inquiries", (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    res.status(400).json({ error: "name, email, and message are required" });
    return;
  }
  const inquiry = {
    id: String(inquiries.length + 1),
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  };
  inquiries.push(inquiry);
  res.status(201).json({ inquiry });
});
`;
}

function renderData(name: string, preset: WebsitePreset, items: SiteItem[]): string {
  return `export const site = ${JSON.stringify({ name, preset }, null, 2)};

export const items = ${JSON.stringify(items, null, 2)};
`;
}

function renderPackageJson(name: string): string {
  return JSON.stringify(
    {
      name: slugify(name),
      version: "1.0.0",
      private: true,
      type: "module",
      description: `Full-stack website for ${name}`,
      scripts: {
        start: "node server/index.js",
      },
      dependencies: {
        express: "^4.21.2",
      },
    },
    null,
    2,
  ) + "\n";
}

function renderReadme(name: string, preset: PresetBlueprint): string {
  return `# ${name}

${preset.tagline}

This project was generated by the Lunor.AI Web Development assistant.

## Files

- \`client/index.html\`, \`client/styles.css\`, \`client/app.js\` — the site visitors see
- \`server/index.js\` — Express app. \`npm start\` runs this file
- \`server/routes.js\` — \`GET /api/health\`, \`GET /api/items\`, \`GET /api/items/:id\`, \`POST /api/inquiries\`
- \`server/data.js\` — seed content shared with the API

## Run

1. \`npm install\`
2. \`npm start\`
3. Open http://localhost:3000

The editor preview does not start Node. \`client/app.js\` falls back to its seed list when \`/api/items\` is unavailable.
`;
}

function assistantMessageFor(name: string, preset: PresetBlueprint): string {
  return `Built **${name}**, a ${preset.label.toLowerCase()} site with a browser client and an Express API.

**Client**
- client/index.html
- client/styles.css
- client/app.js renders the page and uses its seed data when the API is offline

**Server**
- server/index.js — \`npm start\` runs \`node server/index.js\`
- server/routes.js — GET /api/health, GET /api/items, GET /api/items/:id, POST /api/inquiries
- server/data.js

**Run locally**
1. \`npm install\`
2. \`npm start\`
3. Open http://localhost:3000

The preview in this editor uses the seed data in client/app.js.`;
}

export function generateFullStackWebsite(input: {
  prompt?: string;
  preset?: WebsitePreset;
  name?: string;
} = {}): GeneratedWebsite {
  const prompt = input.prompt?.trim() || "";
  const preset = input.preset || detectWebsitePreset(prompt) || "portfolio";
  const blueprint = PRESETS[preset];
  const name = input.name?.trim() || extractSiteName(prompt) || blueprint.defaultName;
  const files: WebsiteFile[] = [
    { path: "client/index.html", language: "html", content: renderClientHtml(blueprint, name) },
    { path: "client/styles.css", language: "css", content: renderStyles(blueprint) },
    { path: "client/app.js", language: "javascript", content: renderClientApp(blueprint.items) },
    { path: "server/index.js", language: "javascript", content: renderServerIndex(name) },
    { path: "server/routes.js", language: "javascript", content: renderRoutes() },
    { path: "server/data.js", language: "javascript", content: renderData(name, preset, blueprint.items) },
    { path: "package.json", language: "json", content: renderPackageJson(name) },
    { path: "README.md", language: "markdown", content: renderReadme(name, blueprint) },
  ];

  return {
    preset,
    name,
    tagline: blueprint.tagline,
    files,
    assistantMessage: assistantMessageFor(name, blueprint),
  };
}

export function buildWebsiteFileTree(site: GeneratedWebsite): WebsiteTreeNode[] {
  const folders = new Map<string, WebsiteTreeNode>();
  const rootFiles: WebsiteTreeNode[] = [];

  for (const file of site.files) {
    const [folderName, ...rest] = file.path.split("/");
    if (rest.length === 0) {
      rootFiles.push({
        id: file.path,
        name: file.path,
        type: "file",
        language: file.language,
        content: file.content,
      });
      continue;
    }
    let folder = folders.get(folderName);
    if (!folder) {
      folder = { id: folderName, name: folderName, type: "folder", isOpen: true, children: [] };
      folders.set(folderName, folder);
    }
    folder.children!.push({
      id: file.path,
      name: rest.join("/"),
      type: "file",
      language: file.language,
      content: file.content,
    });
  }

  const orderedFolders = ["client", "server"]
    .map((id) => folders.get(id))
    .filter((node): node is WebsiteTreeNode => Boolean(node));

  return [...orderedFolders, ...rootFiles];
}
