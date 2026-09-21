/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a vanilla client plus a dependency-free Node API.
 */

export const SITE_KINDS = ["landing", "portfolio", "blog", "restaurant", "store", "dashboard"] as const;
export type SiteKind = (typeof SITE_KINDS)[number];

export const SITE_KIND_LABELS: Record<SiteKind, string> = {
  landing: "Landing",
  portfolio: "Portfolio",
  blog: "Blog",
  restaurant: "Restaurant",
  store: "Store",
  dashboard: "Dashboard",
};

export const WEBSITE_API_ROUTES = [
  { method: "GET", path: "/api/health" },
  { method: "GET", path: "/api/site" },
  { method: "GET", path: "/api/records" },
  { method: "POST", path: "/api/records" },
] as const;

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: SiteKind;
  name: string;
  files: GeneratedFile[];
  assistantMessage: string;
}

export interface GeneratorFileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: GeneratorFileNode[];
  isOpen?: boolean;
}

interface Theme {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  line: string;
  display: string;
  body: string;
  fontHref: string;
}

interface Card {
  title: string;
  text: string;
  meta?: string;
  image?: string;
}

interface SeedRecord {
  id: string;
  title: string;
  detail: string;
}

interface Blueprint {
  tagline: string;
  eyebrow: string;
  heroImage: string;
  theme: Theme;
  cards: Card[];
  formHeading: string;
  formSubmit: string;
  recordsHeading: string;
  seeds: SeedRecord[];
}

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const BLUEPRINTS: Record<SiteKind, Blueprint> = {
  landing: {
    tagline: "Ship a polished product story with a working API behind the page.",
    eyebrow: "Product studio",
    heroImage: img("1498050108023-c5249f4df085", 1600, 1000),
    theme: {
      bg: "#0b1020",
      surface: "#141b31",
      text: "#eef2ff",
      muted: "#a9b4d0",
      accent: "#8b7cff",
      accentText: "#1a1333",
      line: "rgba(255,255,255,0.08)",
      display: "'Fraunces', Georgia, serif",
      body: "'Outfit', sans-serif",
      fontHref: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,520;9..144,680&family=Outfit:wght@380;560&display=swap",
    },
    cards: [
      { title: "Guided onboarding", text: "A three-step path that turns a blank brief into a published page.", meta: "01" },
      { title: "Live content API", text: "Leads land in /api/records so the page and the server share one list.", meta: "02" },
      { title: "Preview first", text: "The client renders from seed data when the API is offline.", meta: "03" },
    ],
    formHeading: "Request a walkthrough",
    formSubmit: "Save lead",
    recordsHeading: "Recent leads",
    seeds: [
      { id: "seed-1", title: "Northwind trial", detail: "Asked for a Friday product tour." },
      { id: "seed-2", title: "Harbor team", detail: "Wants the API wired to their form." },
    ],
  },
  portfolio: {
    tagline: "Selected work, a short studio note, and a contact book that persists.",
    eyebrow: "Independent studio",
    heroImage: img("1558618666-fcd25c85f1d7", 1600, 1000),
    theme: {
      bg: "#f6f1ea",
      surface: "#fffaf4",
      text: "#1c1917",
      muted: "#57534e",
      accent: "#c2410c",
      accentText: "#fff7ed",
      line: "rgba(28,25,23,0.1)",
      display: "'Newsreader', Georgia, serif",
      body: "'Sora', sans-serif",
      fontHref: "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,520;6..72,650&family=Sora:wght@380;560&display=swap",
    },
    cards: [
      { title: "Atlas identity", text: "A wordmark and print system for a field-research lab.", meta: "Brand", image: img("1561070791-2526d30994b5", 800, 600) },
      { title: "Keel editorial", text: "A magazine grid with oversized type and quiet photography.", meta: "Editorial", image: img("1513364776144-60967b0f800f", 800, 600) },
      { title: "Lumen storefront", text: "Product pages with a restrained palette and fast checkout.", meta: "Web", image: img("1542621334-a254cf47733d", 800, 600) },
    ],
    formHeading: "Start a project",
    formSubmit: "Send note",
    recordsHeading: "Studio notes",
    seeds: [
      { id: "seed-1", title: "Spring lookbook", detail: "Photography direction approved." },
      { id: "seed-2", title: "Museum microsite", detail: "Waiting on the archive stills." },
    ],
  },
  blog: {
    tagline: "A reading room for field notes, with comments stored by the API.",
    eyebrow: "Journal",
    heroImage: img("1481627834876-b7833e8f5570", 1600, 1000),
    theme: {
      bg: "#f7f6f2",
      surface: "#ffffff",
      text: "#1f2933",
      muted: "#52606d",
      accent: "#0f766e",
      accentText: "#f0fdfa",
      line: "rgba(31,41,51,0.1)",
      display: "'Source Serif 4', Georgia, serif",
      body: "'Source Sans 3', sans-serif",
      fontHref: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@380;560&family=Source+Serif+4:opsz,wght@8..60,520;8..60,650&display=swap",
    },
    cards: [
      { title: "Maps that remember", text: "Why a small legend beats a dashboard of pins.", meta: "Essay" },
      { title: "Ink and indexes", text: "A week spent rebuilding a research notebook.", meta: "Process" },
      { title: "Quiet launches", text: "Shipping a journal without a countdown clock.", meta: "Notes" },
    ],
    formHeading: "Leave a comment",
    formSubmit: "Post comment",
    recordsHeading: "Comments",
    seeds: [
      { id: "seed-1", title: "On the second essay", detail: "The index idea is the piece." },
      { id: "seed-2", title: "Print edition", detail: "Could this issue stay black and white?" },
    ],
  },
  restaurant: {
    tagline: "Tonight's menu, a reservation book, and the kitchen's hours.",
    eyebrow: "Supper club",
    heroImage: img("1414235077428-338989a2e8c0", 1600, 1000),
    theme: {
      bg: "#1a120b",
      surface: "#271b12",
      text: "#f6efe6",
      muted: "#d6c4ae",
      accent: "#e7b35a",
      accentText: "#2a1c0b",
      line: "rgba(246,239,230,0.12)",
      display: "'Cormorant Garamond', Georgia, serif",
      body: "'Nunito Sans', sans-serif",
      fontHref: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@560;680&family=Nunito+Sans:wght@380;650&display=swap",
    },
    cards: [
      { title: "Rye bread & brown butter", text: "Warm loaf, cultured butter, flaky salt.", meta: "8" },
      { title: "Charred leeks", text: "Hazelnut, lemon, and a soft egg.", meta: "16" },
      { title: "Dayboat fish", text: "Fennel, capers, and a pan sauce.", meta: "32" },
    ],
    formHeading: "Reserve a table",
    formSubmit: "Save reservation",
    recordsHeading: "Reservation book",
    seeds: [
      { id: "seed-1", title: "Table for two", detail: "Saturday, 7:30, window if possible." },
      { id: "seed-2", title: "Chef's counter", detail: "Four guests, anniversary note." },
    ],
  },
  store: {
    tagline: "A small catalog with orders posted straight to the API.",
    eyebrow: "Goods",
    heroImage: img("1441986300917-64674bd600d8", 1600, 1000),
    theme: {
      bg: "#f3f7f4",
      surface: "#ffffff",
      text: "#14221c",
      muted: "#3f5348",
      accent: "#1f7a4d",
      accentText: "#f3fff7",
      line: "rgba(20,34,28,0.1)",
      display: "'Libre Franklin', sans-serif",
      body: "'Libre Franklin', sans-serif",
      fontHref: "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@420;620;760&display=swap",
    },
    cards: [
      { title: "Wool throw", text: "Undyed, 140cm, woven in small runs.", meta: "$120", image: img("1483985988355-763728e1935b", 800, 600) },
      { title: "Cedar tray", text: "A desk tray with a single brass pin.", meta: "$48", image: img("1556742049-0cfed4f6a45d", 800, 600) },
      { title: "Field notebook", text: "Plain paper, stitched, pocket sized.", meta: "$18", image: img("1607082348824-0a96f2a4b9da", 800, 600) },
    ],
    formHeading: "Place an order",
    formSubmit: "Add order",
    recordsHeading: "Orders",
    seeds: [
      { id: "seed-1", title: "Wool throw × 1", detail: "Ship to the studio address." },
      { id: "seed-2", title: "Field notebook × 3", detail: "Gift wrap, no receipt." },
    ],
  },
  dashboard: {
    tagline: "A calm operations board backed by the same records API.",
    eyebrow: "Operations",
    heroImage: img("1552664730-d307ca884978", 1600, 900),
    theme: {
      bg: "#0e141b",
      surface: "#16202a",
      text: "#e6eef5",
      muted: "#93a4b5",
      accent: "#38bdf8",
      accentText: "#082032",
      line: "rgba(230,238,245,0.1)",
      display: "'IBM Plex Sans', sans-serif",
      body: "'IBM Plex Sans', sans-serif",
      fontHref: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@420;580;680&display=swap",
    },
    cards: [
      { title: "Open records", text: "Items waiting in the shared list.", meta: "18" },
      { title: "Response time", text: "Median API time this morning.", meta: "42ms" },
      { title: "Published pages", text: "Sites generated from this workspace.", meta: "6" },
    ],
    formHeading: "Add activity",
    formSubmit: "Record it",
    recordsHeading: "Activity",
    seeds: [
      { id: "seed-1", title: "Preview refreshed", detail: "Client fell back to seed data, then reconnected." },
      { id: "seed-2", title: "New reservation", detail: "POST /api/records stored the table request." },
    ],
  },
};

const DEFAULT_NAMES: Record<SiteKind, string> = {
  landing: "Lumen",
  portfolio: "Northline Studio",
  blog: "Field Notes",
  restaurant: "Harbor & Rye",
  store: "Atelier Goods",
  dashboard: "Pulse Board",
};

export function detectWebsiteRequest(text: string): { kind: SiteKind } | null {
  const trimmed = text.trim();
  if (!trimmed || /^\s*(how|what|why|when|explain)\b/i.test(trimmed)) return null;
  if (!/\b(generate|build|create|make|scaffold)\b/i.test(trimmed)) return null;
  if (!/\bfull[\s-]?stack\b/i.test(trimmed)) return null;
  if (!/\b(website|web\s*site|site|web\s*app|landing|portfolio|blog|restaurant|cafe|store|shop|dashboard)\b/i.test(trimmed)) {
    return null;
  }
  return { kind: kindFromText(trimmed) };
}

function kindFromText(text: string): SiteKind {
  if (/\bportfolio\b/i.test(text)) return "portfolio";
  if (/\bblog\b/i.test(text)) return "blog";
  if (/\b(restaurant|cafe|café)\b/i.test(text)) return "restaurant";
  if (/\b(store|shop|e-?commerce)\b/i.test(text)) return "store";
  if (/\bdashboard\b/i.test(text)) return "dashboard";
  if (/\blanding\b/i.test(text)) return "landing";
  return "landing";
}

export function generateWebsite(options: { kind: SiteKind; name?: string }): GeneratedWebsite {
  const kind = options.kind;
  const name = (options.name || "").trim() || DEFAULT_NAMES[kind];
  const blueprint = BLUEPRINTS[kind];
  const site = {
    name,
    kind,
    tagline: blueprint.tagline,
    eyebrow: blueprint.eyebrow,
    heroImage: blueprint.heroImage,
    cards: blueprint.cards,
    formHeading: blueprint.formHeading,
    formSubmit: blueprint.formSubmit,
    recordsHeading: blueprint.recordsHeading,
    seedRecords: blueprint.seeds,
  };

  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(name, blueprint, site) },
    { path: "client/styles.css", language: "css", content: CLIENT_CSS },
    { path: "client/site.js", language: "javascript", content: CLIENT_JS },
    { path: "server/server.mjs", language: "javascript", content: SERVER_JS },
    { path: "server/store.mjs", language: "javascript", content: renderStore(site) },
    { path: "package.json", language: "json", content: renderPackage(name) },
    { path: "README.md", language: "markdown", content: renderReadme(name, kind) },
  ];

  return {
    kind,
    name,
    files,
    assistantMessage: [
      `Generated **${name}**, a full-stack ${kind} website, and opened the live preview.`,
      "",
      "**Client**",
      "- `client/index.html`",
      "- `client/styles.css`",
      "- `client/site.js`",
      "",
      "**API** — run `npm start` from the project folder",
      "- `GET /api/health`",
      "- `GET /api/site`",
      "- `GET /api/records`",
      "- `POST /api/records`",
      "",
      "The preview uses seed content when the server is offline. With `npm start`, the form writes to the API.",
    ].join("\n"),
  };
}

export function websiteFilesToTree(files: GeneratedFile[]): GeneratorFileNode[] {
  const root: GeneratorFileNode[] = [];
  const folders = new Map<string, GeneratorFileNode>();

  for (const file of files) {
    const parts = file.path.split("/");
    let siblings = root;
    let acc = "";
    for (let i = 0; i < parts.length - 1; i += 1) {
      acc = acc ? `${acc}/${parts[i]}` : parts[i];
      let folder = folders.get(acc);
      if (!folder) {
        folder = { id: acc, name: parts[i], type: "folder", isOpen: true, children: [] };
        folders.set(acc, folder);
        siblings.push(folder);
      }
      siblings = folder.children || [];
    }
    siblings.push({
      id: file.path,
      name: parts[parts.length - 1],
      type: "file",
      language: file.language,
      content: file.content,
    });
  }

  return root;
}

function renderHtml(name: string, blueprint: Blueprint, site: object): string {
  const theme = blueprint.theme;
  const payload = JSON.stringify(site).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${theme.fontHref}" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <style>
    :root {
      --bg: ${theme.bg};
      --surface: ${theme.surface};
      --text: ${theme.text};
      --muted: ${theme.muted};
      --accent: ${theme.accent};
      --accent-text: ${theme.accentText};
      --line: ${theme.line};
      --display: ${theme.display};
      --body: ${theme.body};
    }
  </style>
</head>
<body data-themed="true">
  <div id="app">Loading ${escapeHtml(name)}…</div>
  <script id="site-data" type="application/json">${payload}</script>
  <script src="site.js"></script>
</body>
</html>
`;
}

function renderStore(site: object): string {
  return `const site = ${JSON.stringify(site, null, 2)};

const records = site.seedRecords.map((record) => ({ ...record }));

export function getSite() {
  return {
    name: site.name,
    kind: site.kind,
    tagline: site.tagline,
    eyebrow: site.eyebrow,
  };
}

export function listRecords() {
  return records;
}

export function addRecord(input) {
  const title = String((input && input.title) || "").trim();
  if (!title) {
    const error = new Error("Title is required");
    error.status = 400;
    throw error;
  }
  const record = {
    id: "rec-" + Date.now().toString(36) + "-" + (records.length + 1),
    title: title.slice(0, 140),
    detail: String((input && (input.detail || input.body)) || "").trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  records.unshift(record);
  return record;
}
`;
}

function renderPackage(name: string): string {
  const pkg = {
    name: slug(name),
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      start: "node server/server.mjs",
    },
  };
  return JSON.stringify(pkg, null, 2) + "\n";
}

function renderReadme(name: string, kind: SiteKind): string {
  return `# ${name}

Full-stack ${kind} website generated by the Lunor.AI Web Development assistant.

## Run

\`\`\`bash
npm start
\`\`\`

Open http://localhost:3000

## API

- \`GET /api/health\`
- \`GET /api/site\`
- \`GET /api/records\`
- \`POST /api/records\` with \`{ "title": "Hello", "detail": "A note" }\`

## Files

- \`client/index.html\`, \`client/styles.css\`, \`client/site.js\`
- \`server/server.mjs\`, \`server/store.mjs\`
`;
}

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

const CLIENT_CSS = `* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--body);
}
img { max-width: 100%; display: block; }
button, input, textarea { font: inherit; }
a { color: inherit; }

.shell { max-width: 1080px; margin: 0 auto; padding: 28px 22px 64px; }
.nav, .hero, .section, .footer { position: relative; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 22px;
}
.brand { font-family: var(--display); font-size: 1.35rem; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 16px; color: var(--muted); font-size: 0.92rem; text-decoration: none; }
.nav a { text-decoration: none; }

.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: center;
  padding: 12px 0 36px;
}
.eyebrow {
  color: var(--accent);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 650;
}
h1 {
  font-family: var(--display);
  font-size: clamp(2.6rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  margin: 10px 0 14px;
}
.tagline { color: var(--muted); font-size: 1.08rem; max-width: 38rem; line-height: 1.55; }
.hero-photo {
  min-height: 280px;
  border-radius: 22px;
  background-size: cover;
  background-position: center;
  border: 1px solid var(--line);
  box-shadow: 0 24px 60px rgba(0,0,0,0.18);
}
.hero-actions { display: flex; gap: 10px; margin-top: 22px; }
.btn, button[type="submit"] {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--accent);
  color: var(--accent-text);
  text-decoration: none;
  cursor: pointer;
  font-weight: 650;
}
.btn.ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--line);
}

.section { padding: 10px 0 28px; }
.section h2 {
  font-family: var(--display);
  font-size: 2rem;
  margin: 0 0 16px;
}
.cards, .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.card, .record, form, .stat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 16px;
}
.card img { height: 140px; width: 100%; object-fit: cover; border-radius: 12px; margin-bottom: 12px; }
.meta { color: var(--accent); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.card h3, .record h3, .stat strong { margin: 6px 0; }
.card p, .record p, .stat span { color: var(--muted); margin: 0; line-height: 1.5; }
.stat strong { display: block; font-size: 1.8rem; font-family: var(--display); }

.split { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; align-items: start; }
.records { display: grid; gap: 10px; }
label { display: grid; gap: 6px; margin-bottom: 12px; color: var(--muted); font-size: 0.85rem; }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  padding: 11px 12px;
}
textarea { min-height: 96px; resize: vertical; }
.status { min-height: 1.2em; color: var(--accent); font-size: 0.85rem; }
.footer { color: var(--muted); font-size: 0.85rem; padding-top: 12px; }
.dash .hero { grid-template-columns: 1fr; }
.dash .hero-photo { display: none; }

@media (max-width: 800px) {
  .hero, .cards, .stats, .split { grid-template-columns: 1fr; }
  .nav { align-items: flex-start; flex-direction: column; }
}
`;

const CLIENT_JS = `(function () {
  var dataNode = document.getElementById("site-data");
  var app = document.getElementById("app");
  var data = JSON.parse(dataNode.textContent || "{}");
  var records = (data.seedRecords || []).slice();
  var status = "Preview is using seed content until the API is running.";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function cardsHtml() {
    return (data.cards || []).map(function (card) {
      var image = card.image ? '<img src="' + esc(card.image) + '" alt="">' : "";
      return '<article class="card">' + image +
        '<div class="meta">' + esc(card.meta || "") + '</div>' +
        '<h3>' + esc(card.title) + '</h3>' +
        '<p>' + esc(card.text) + '</p></article>';
    }).join("");
  }

  function recordsHtml() {
    if (!records.length) return '<p class="tagline">No records yet.</p>';
    return records.map(function (record) {
      return '<article class="record"><h3>' + esc(record.title) + '</h3><p>' + esc(record.detail || "") + '</p></article>';
    }).join("");
  }

  function formHtml() {
    return '<form id="record-form"><h2>' + esc(data.formHeading) + '</h2>' +
      '<label>Title<input name="title" required maxlength="140" placeholder="Short title"></label>' +
      '<label>Detail<textarea name="detail" maxlength="500" placeholder="What should we remember?"></textarea></label>' +
      '<button type="submit">' + esc(data.formSubmit || "Save") + '</button>' +
      '<p class="status">' + esc(status) + '</p></form>';
  }

  function render() {
    var stats = data.kind === "dashboard"
      ? '<section class="section"><div class="stats">' + (data.cards || []).map(function (card) {
          return '<article class="stat"><span>' + esc(card.title) + '</span><strong>' + esc(card.meta || "") + '</strong><span>' + esc(card.text) + '</span></article>';
        }).join("") + '</div></section>'
      : '<section class="section" id="work"><h2>' + (data.kind === "restaurant" ? "Tonight" : data.kind === "store" ? "Catalog" : "Selected") + '</h2><div class="cards">' + cardsHtml() + '</div></section>';

    app.innerHTML =
      '<div class="shell' + (data.kind === "dashboard" ? " dash" : "") + '">' +
        '<header class="nav"><div class="brand">' + esc(data.name) + '</div>' +
          '<nav class="nav-links"><a href="#work">Work</a><a href="#records">Records</a><a href="#contact">Contact</a></nav></header>' +
        '<section class="hero"><div><p class="eyebrow">' + esc(data.eyebrow || "") + '</p><h1>' + esc(data.name) + '</h1><p class="tagline">' + esc(data.tagline || "") + '</p>' +
          '<div class="hero-actions"><a class="btn" href="#contact">' + esc(data.formSubmit || "Start") + '</a><a class="btn ghost" href="#records">View records</a></div></div>' +
          '<div class="hero-photo" style="background-image:url(' + esc(data.heroImage || "") + ')"></div></section>' +
        stats +
        '<section class="section split" id="records"><div><h2>' + esc(data.recordsHeading || "Records") + '</h2><div class="records">' + recordsHtml() + '</div></div>' +
          '<div id="contact">' + formHtml() + '</div></section>' +
        '<footer class="footer">Full-stack ' + esc(data.kind) + ' site · GET /api/health · GET /api/site · GET /api/records · POST /api/records</footer>' +
      '</div>';
  }

  app.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || form.id !== "record-form") return;
    event.preventDefault();
    var body = {
      title: String(new FormData(form).get("title") || ""),
      detail: String(new FormData(form).get("detail") || ""),
    };
    fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (res) {
      if (!res.ok) throw new Error("save failed");
      return res.json();
    }).then(function (payload) {
      records = [payload.record].concat(records.filter(function (item) { return item.id !== payload.record.id; }));
      status = "Saved to the API.";
      render();
    }).catch(function () {
      records = [{ id: "local-" + Date.now(), title: body.title, detail: body.detail }].concat(records);
      status = "Saved in the preview. Run npm start to persist it.";
      render();
    });
  });

  function refresh() {
    return Promise.all([fetch("/api/site"), fetch("/api/records")]).then(function (responses) {
      if (!responses[0].ok || !responses[1].ok) throw new Error("offline");
      return Promise.all([responses[0].json(), responses[1].json()]);
    }).then(function (payloads) {
      data.name = payloads[0].name || data.name;
      data.tagline = payloads[0].tagline || data.tagline;
      data.kind = payloads[0].kind || data.kind;
      if (Array.isArray(payloads[1].records)) records = payloads[1].records;
      status = "Connected to the API.";
    }).catch(function () {
      status = "Preview is using seed content until the API is running.";
    }).then(render);
  }

  refresh();
})();
`;

const SERVER_JS = `import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { addRecord, getSite, listRecords } from "./store.mjs";

const clientRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..", "client");
const port = Number(process.env.PORT) || 3000;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
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

function clientFile(urlPath) {
  const relative = urlPath === "/" ? "index.html" : urlPath.replace(/^\\/+/, "");
  const full = normalize(join(clientRoot, relative));
  if (full !== clientRoot && !full.startsWith(clientRoot + sep)) return null;
  return full;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://" + (req.headers.host || "localhost"));
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true, service: "lunor-website" });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/site") {
      sendJson(res, 200, getSite());
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/records") {
      sendJson(res, 200, { records: listRecords() });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/records") {
      const record = addRecord(await readBody(req));
      sendJson(res, 201, { record });
      return;
    }
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "Server error" });
    return;
  }

  if (req.method === "GET") {
    const filePath = clientFile(url.pathname);
    if (filePath) {
      try {
        const body = await readFile(filePath);
        res.writeHead(200, { "Content-Type": types[extname(filePath)] || "application/octet-stream" });
        res.end(body);
        return;
      } catch {
        /* fall through */
      }
    }
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.log("listening on " + port);
});
`;
