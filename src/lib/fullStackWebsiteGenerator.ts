/**
 * Local full-stack website automation for the Web Development assistant.
 * Scaffolds a static client plus an Express API. The preview uses
 * window.__SITE_SEED__ when the API is not running.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "shop" | "blog";

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
  children?: WebsiteTreeNode[];
  isOpen?: boolean;
}

export interface SiteHighlight {
  title: string;
  text: string;
}

export interface SiteItem {
  title: string;
  text: string;
  meta?: string;
  image: string;
}

export interface SiteSeed {
  kind: WebsiteKind;
  title: string;
  tagline: string;
  kicker: string;
  heroImage: string;
  highlightsTitle: string;
  itemsTitle: string;
  contactTitle: string;
  highlights: SiteHighlight[];
  items: SiteItem[];
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  summary: string;
  files: WebsiteFile[];
  seed: SiteSeed;
}

export interface WebsiteBlueprint {
  id: WebsiteKind;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  samplePrompt: string;
}

export const WEBSITE_FILE_PATHS = [
  "index.html",
  "styles.css",
  "app.js",
  "server/server.js",
  "server/routes.js",
  "server/store.js",
  "package.json",
  "README.md",
] as const;

export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return CONTACT_EMAIL_PATTERN.test(value.trim());
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "landing",
    name: "Landing",
    description: "SaaS page with features and a contact API",
    icon: "✦",
    keywords: ["landing", "saas", "startup", "product"],
    samplePrompt: "Generate a full-stack landing page for a SaaS product",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Selected work plus a contact form",
    icon: "◈",
    keywords: ["portfolio", "personal site", "case study", "designer"],
    samplePrompt: "Generate a full-stack portfolio website",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Menu, story, and reservations message API",
    icon: "☕",
    keywords: ["restaurant", "cafe", "coffee", "bakery", "menu", "food"],
    samplePrompt: "Generate a full-stack website for a coffee shop",
  },
  {
    id: "shop",
    name: "Shop",
    description: "Product grid with an inquiry API",
    icon: "◻",
    keywords: ["shop", "store", "storefront", "ecommerce", "e-commerce", "boutique"],
    samplePrompt: "Generate a full-stack online store",
  },
  {
    id: "blog",
    name: "Blog",
    description: "Stories list and a note-to-editor form",
    icon: "✎",
    keywords: ["blog", "magazine", "journal", "articles", "writing"],
    samplePrompt: "Generate a full-stack blog",
  },
];

const DEFAULT_TITLES: Record<WebsiteKind, string> = {
  landing: "Lumenboard",
  portfolio: "Northstar Studio",
  restaurant: "Harbor & Rye",
  shop: "Atelier Goods",
  blog: "Field Notes",
};

const GENERIC_TITLE = /^(a |an |the |my )?(coffee shop|cafe|cafes|restaurant|bakery|website|web site|landing page|portfolio|blog|store|online store|shop|saas|startup|product|magazine|journal)$/i;

const SITE_NOUN = /\b(website|web\s*site|landing\s+page|full[-\s]?stack(?:\s+(?:site|website|app))?|portfolio|online\s+store|storefront|web\s+app)\b/i;
const BUILD_VERB = /\b(build|create|make|generate|scaffold|design|spin\s+up)\b/i;

export function isFullStackWebsitePrompt(text: string): boolean {
  const value = text.trim();
  if (!value || !BUILD_VERB.test(value)) return false;
  if (/\b(debug|fix|error|explain|what is|how does|why)\b/i.test(value) && !SITE_NOUN.test(value)) return false;
  if (SITE_NOUN.test(value)) return true;
  const lower = value.toLowerCase();
  return WEBSITE_BLUEPRINTS.some((blueprint) => blueprint.keywords.some((keyword) => lower.includes(keyword)));
}

export function detectWebsiteKind(brief: string): WebsiteKind {
  const lower = brief.toLowerCase();
  let best: WebsiteKind = "landing";
  let bestScore = 0;
  for (const blueprint of WEBSITE_BLUEPRINTS) {
    const score = blueprint.keywords.reduce((total, keyword) => total + (lower.includes(keyword) ? keyword.length : 0), 0);
    if (score > bestScore) {
      best = blueprint.id;
      bestScore = score;
    }
  }
  return best;
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function extractSiteTitle(brief: string, fallback: string): string {
  const quoted = brief.match(/["“]([^"”]{2,60})["”]/);
  if (quoted) return quoted[1].trim();

  const named = brief.match(/\b(?:called|named)\s+([A-Za-z0-9][\w&.'’-]*(?:\s+[A-Za-z0-9][\w&.'’-]*){0,4})/);
  if (named) return named[1].replace(/[.,]$/, "").trim();

  const forMatch = brief.match(/\bfor\s+(?:a|an|my|the)?\s*([A-Za-z0-9][\w&.'’-]*(?:\s+[A-Za-z0-9][\w&.'’-]*){0,5})/i);
  if (forMatch) {
    const raw = forMatch[1].replace(/\b(with|using|that|featuring)\b[\s\S]*$/i, "").trim();
    if (raw && !GENERIC_TITLE.test(raw)) return titleCase(raw);
  }

  return fallback;
}

function defaultTitle(kind: WebsiteKind, brief: string): string {
  if (kind === "restaurant" && /coffee|cafe|bakery/.test(brief.toLowerCase())) return "Northbean Coffee";
  return DEFAULT_TITLES[kind];
}

function photo(id: string, width = 1200): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

function buildSeed(kind: WebsiteKind, title: string, brief: string): SiteSeed {
  const coffee = kind === "restaurant" && /coffee|cafe|bakery/.test(brief.toLowerCase());
  if (coffee) {
    return {
      kind,
      title,
      tagline: "Small-batch coffee, baked in the morning, served at a counter worth lingering at.",
      kicker: "Neighborhood roaster",
      heroImage: photo("photo-1495474472287-4d71bcdd2085"),
      highlightsTitle: "Why people stay",
      itemsTitle: "On the counter",
      contactTitle: "Reserve a table or ask about catering",
      highlights: [
        { title: "Roasted weekly", text: "Three single origins and one seasonal blend, posted on the board every Monday." },
        { title: "Baked here", text: "Cardamom buns and olive oil cake come out of the oven before the first pour-over." },
        { title: "Slow counter", text: "Twelve seats, no laptop rush before noon, and water that is already on the table." },
      ],
      items: [
        { title: "Single Origin Flight", text: "Three 4oz pours with tasting notes from this week's roaster.", meta: "$9", image: photo("photo-1447933601403-0c6688de566e", 800) },
        { title: "Oat Cortado", text: "Equal parts espresso and steamed oat milk. Short glass, no foam art contest.", meta: "$4.50", image: photo("photo-1511920170033-f8396924c348", 800) },
        { title: "Cardamom Bun", text: "Laminated dough, brown sugar, and enough cardamom to smell from the door.", meta: "$4", image: photo("photo-1509440159596-0249088772ff", 800) },
        { title: "Cold Brew", text: "Steeped overnight and served over one large ice cube.", meta: "$5", image: photo("photo-1461023058943-07fcbe16d735", 800) },
      ],
    };
  }

  const catalogs: Record<WebsiteKind, Omit<SiteSeed, "kind" | "title">> = {
    landing: {
      tagline: "A shared board for product teams who are tired of status meetings.",
      kicker: "Product workspace",
      heroImage: photo("photo-1553877522-43269d4ea984"),
      highlightsTitle: "What ships with it",
      itemsTitle: "How teams use it",
      contactTitle: "Ask for a walkthrough",
      highlights: [
        { title: "One board", text: "Notes, decisions, and owners live on the same surface instead of three tools." },
        { title: "Guest links", text: "Share a read-only view with a client without creating another account." },
        { title: "Quiet history", text: "Every change is recorded. Nothing pings you unless you ask it to." },
      ],
      items: [
        { title: "Weekly planning", text: "Drop goals on Monday and drag them as the week actually happens.", meta: "Teams", image: photo("photo-1552664730-d307ca884978", 800) },
        { title: "Launch checklist", text: "A single column for the work that has to be true before release.", meta: "Product", image: photo("photo-1460925895917-afdab827c52f", 800) },
        { title: "Client review", text: "Send a link. Comments stay next to the decision they refer to.", meta: "Agencies", image: photo("photo-1522071820081-009f0129c71c", 800) },
        { title: "Incident notes", text: "A short log that does not try to become a ticketing system.", meta: "Ops", image: photo("photo-1518770660439-4636190af475", 800) },
      ],
    },
    portfolio: {
      tagline: "Interface design and front-end builds for teams who care how the work feels.",
      kicker: "Selected work",
      heroImage: photo("photo-1498050108023-c5249f4df085"),
      highlightsTitle: "Studio notes",
      itemsTitle: "Projects",
      contactTitle: "Start a project",
      highlights: [
        { title: "Product UI", text: "Flows, empty states, and the screens people actually repeat." },
        { title: "Design systems", text: "Tokens and components that engineers can ship without a translation layer." },
        { title: "Front-end", text: "Responsive pages with accessible type, motion, and real content." },
      ],
      items: [
        { title: "Atlas Transit", text: "A rider app redesign focused on delays, transfers, and night mode.", meta: "Product", image: photo("photo-1480714378408-67cf0d13bc1b", 800) },
        { title: "Kinfolk Market", text: "Editorial shop pages for a grocer that changes the menu weekly.", meta: "Commerce", image: photo("photo-1542838132-92c53300491e", 800) },
        { title: "Paper Lantern", text: "A publishing site with long-form reading and a quiet homepage.", meta: "Media", image: photo("photo-1455390582262-044cdead277a", 800) },
        { title: "Northline", text: "Dashboard for a logistics team that works from a warehouse floor.", meta: "B2B", image: photo("photo-1586528116311-ad8dd3c8310d", 800) },
      ],
    },
    restaurant: {
      tagline: "Wood fire, a short menu, and a table if you write to us before six.",
      kicker: "Supper",
      heroImage: photo("photo-1414235077428-338989a2e8c0"),
      highlightsTitle: "The room",
      itemsTitle: "Tonight's menu",
      contactTitle: "Request a table",
      highlights: [
        { title: "Short menu", text: "Four mains. They change when the market does, not when a template says so." },
        { title: "Wood fire", text: "Bread, fish, and one vegetable, cooked on the same hearth." },
        { title: "Early hours", text: "Doors at five. Last seating at nine. The kitchen closes when the bread is gone." },
      ],
      items: [
        { title: "Harbor Bisque", text: "Shellfish stock, cream, and fennel pollen.", meta: "$14", image: photo("photo-1476224203421-9ac39bcb3327", 800) },
        { title: "Rye Crusted Cod", text: "Charred lemon, brown butter, and winter greens.", meta: "$29", image: photo("photo-1559339352-11d035aa65de", 800) },
        { title: "Brown Butter Gnocchi", text: "Sage, toasted hazelnut, and pecorino.", meta: "$22", image: photo("photo-1621996346565-e3dbc646d9a9", 800) },
        { title: "Olive Oil Cake", text: "Citrus, a spoon of cream, and flaky salt.", meta: "$11", image: photo("photo-1464349095431-e9a21285b5f3", 800) },
      ],
    },
    shop: {
      tagline: "Home goods made in small runs. Ships twice a week from the studio.",
      kicker: "Objects",
      heroImage: photo("photo-1441986300917-64674bd600d8"),
      highlightsTitle: "How it works",
      itemsTitle: "In the studio",
      contactTitle: "Ask about a piece",
      highlights: [
        { title: "Small runs", text: "When a form sells through, it is gone until the next firing or cutting." },
        { title: "Materials", text: "Linen, oak, stoneware, and wool. No seasonal plastic drop." },
        { title: "Studio pickup", text: "Local orders can be collected on Thursday afternoons." },
      ],
      items: [
        { title: "Linen Throw", text: "Stonewashed flax in oat, charcoal, or clay.", meta: "$120", image: photo("photo-1616486338812-3dadae4b4ace", 800) },
        { title: "Stoneware Bowl", text: "Speckled clay, a wide lip, and a foot that sits flat.", meta: "$48", image: photo("photo-1610701596007-11502861dcfa", 800) },
        { title: "Oak Bench", text: "A three-seat bench in white oak with exposed joinery.", meta: "$640", image: photo("photo-1538688525198-9b88f6f53126", 800) },
        { title: "Wool Scarf", text: "Undyed wool, hand-fringed, one size.", meta: "$78", image: photo("photo-1520903920243-00d872a2d1c9", 800) },
      ],
    },
    blog: {
      tagline: "Essays on making software, cities, and the tools we keep.",
      kicker: "Journal",
      heroImage: photo("photo-1455390582262-044cdead277a"),
      highlightsTitle: "About the journal",
      itemsTitle: "Latest notes",
      contactTitle: "Write to the editor",
      highlights: [
        { title: "One essay a week", text: "Published Friday morning. No growth hacks, no newsletter popover." },
        { title: "Primary sources", text: "Links go to the docs, the paper, or the repo. Not to a recap of a recap." },
        { title: "Reader notes", text: "Replies are read. The good ones become a follow-up post." },
      ],
      items: [
        { title: "Notes from a wet city", text: "What a week of walking changed about a mapping prototype.", meta: "Cities", image: photo("photo-1477959858617-67f85cf4f1df", 800) },
        { title: "The small server", text: "A case for one Express process and a JSON file, on purpose.", meta: "Engineering", image: photo("photo-1555066931-4365d14bab8c", 800) },
        { title: "Color, twice", text: "Choosing a palette that still works when the hero photo changes.", meta: "Design", image: photo("photo-1541701494587-cb58502866ab", 800) },
        { title: "Shipping on Friday", text: "A release habit that keeps the week from collapsing into Sunday.", meta: "Process", image: photo("photo-1484480974693-6ca0a78fb36b", 800) },
      ],
    },
  };

  return { kind, title, ...catalogs[kind] };
}

interface Palette {
  bg: string;
  text: string;
  muted: string;
  accent: string;
  card: string;
  line: string;
  font: string;
  display: string;
}

const PALETTES: Record<WebsiteKind, Palette> = {
  landing: { bg: "#070b14", text: "#e8eefc", muted: "#93a0bd", accent: "#7c5cff", card: "#10182a", line: "#243049", font: "Manrope", display: "Fraunces" },
  portfolio: { bg: "#0c1222", text: "#e7eef8", muted: "#93a4c3", accent: "#38bdf8", card: "#131c30", line: "#24344e", font: "Outfit", display: "Fraunces" },
  restaurant: { bg: "#1a120e", text: "#f6efe6", muted: "#d6c4b0", accent: "#e2b15a", card: "#261910", line: "#3d2b22", font: "Manrope", display: "Fraunces" },
  shop: { bg: "#111111", text: "#f5f1ea", muted: "#c8c2b8", accent: "#d6b48a", card: "#1b1b1b", line: "#2e2e2e", font: "Manrope", display: "Fraunces" },
  blog: { bg: "#f6f1e8", text: "#1c1915", muted: "#5c564e", accent: "#1f6b4a", card: "#fffaf3", line: "#e4d9c8", font: "Source Sans 3", display: "Fraunces" },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

function renderItems(items: SiteItem[]): string {
  return items.map((item) => `<article class="item">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            ${item.meta ? `<p class="meta">${escapeHtml(item.meta)}</p>` : ""}
            <p>${escapeHtml(item.text)}</p>
          </div>
        </article>`).join("\n");
}

function renderHighlights(highlights: SiteHighlight[]): string {
  return highlights.map((item) => `<article class="card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join("\n");
}

function buildHtml(seed: SiteSeed): string {
  const fontHref = `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=${encodeURIComponent(PALETTES[seed.kind].font).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(seed.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontHref}" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
  <header class="nav">
    <a class="brand" href="#top" id="site-title">${escapeHtml(seed.title)}</a>
    <button id="nav-toggle" type="button" aria-label="Open menu">Menu</button>
    <nav id="nav-links">
      <a href="#highlights">Highlights</a>
      <a id="nav-work" href="#work">${escapeHtml(seed.itemsTitle)}</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero" id="hero">
      <p class="kicker" id="hero-kicker">${escapeHtml(seed.kicker)}</p>
      <h1 id="hero-title">${escapeHtml(seed.title)}</h1>
      <p class="tagline" id="hero-tagline">${escapeHtml(seed.tagline)}</p>
      <a class="button" href="#work">Explore</a>
    </section>
    <section id="highlights">
      <h2 id="highlights-title">${escapeHtml(seed.highlightsTitle)}</h2>
      <div class="grid" id="highlights-list">
        ${renderHighlights(seed.highlights)}
      </div>
    </section>
    <section id="work">
      <h2 id="items-title">${escapeHtml(seed.itemsTitle)}</h2>
      <div class="items" id="items">
        ${renderItems(seed.items)}
      </div>
    </section>
    <section id="contact">
      <h2 id="contact-title">${escapeHtml(seed.contactTitle)}</h2>
      <form id="contact-form">
        <label>Name<input name="name" type="text" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Message<textarea name="message" rows="5" required></textarea></label>
        <button class="button" type="submit">Send</button>
        <p id="contact-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <p id="footer-title">${escapeHtml(seed.title)}</p>
    <p>Full-stack starter. The page works from saved content, and <code>npm start</code> turns on the API.</p>
  </footer>
  <script>window.__SITE_SEED__ = ${jsonForScript(seed)};</script>
  <script src="app.js"></script>
</body>
</html>
`;
}

function buildCss(kind: WebsiteKind, heroImage: string): string {
  const palette = PALETTES[kind];
  return `:root {
  --bg: ${palette.bg};
  --text: ${palette.text};
  --muted: ${palette.muted};
  --accent: ${palette.accent};
  --card: ${palette.card};
  --line: ${palette.line};
  --font: "${palette.font}", sans-serif;
  --display: "${palette.display}", serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.nav {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 6vw;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.brand { font-family: var(--display); font-size: 1.25rem; text-decoration: none; }
#nav-toggle { display: none; margin-left: auto; background: transparent; color: var(--text); border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; }
#nav-links { display: flex; gap: 18px; margin-left: auto; }
#nav-links a { text-decoration: none; color: var(--muted); font-size: 0.92rem; }
.hero {
  min-height: 78vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  padding: 12vh 6vw 8vh;
  background-image: linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.62)), url("${heroImage}");
  background-size: cover;
  background-position: center;
}
.kicker { letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.75rem; color: var(--accent); margin: 0; }
h1, h2, h3 { font-family: var(--display); font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(3rem, 8vw, 6.5rem); line-height: 0.95; margin: 0; max-width: 12ch; }
.tagline { max-width: 38rem; font-size: 1.15rem; color: var(--muted); margin: 0; }
.button {
  display: inline-flex;
  width: fit-content;
  margin-top: 8px;
  padding: 12px 18px;
  border-radius: 999px;
  background: var(--accent);
  color: #111;
  text-decoration: none;
  border: 0;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
section { padding: 72px 6vw; }
h2 { font-size: clamp(2rem, 4vw, 3rem); margin: 0 0 24px; }
.grid, .items { display: grid; gap: 16px; }
.grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.items { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.card, .item, form {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
}
.card, form { padding: 20px; }
.card p, .item p { color: var(--muted); margin: 8px 0 0; }
.item { overflow: hidden; }
.item img { height: 220px; width: 100%; object-fit: cover; }
.item div { padding: 16px 18px 20px; }
.meta { color: var(--accent) !important; font-size: 0.85rem; letter-spacing: 0.04em; text-transform: uppercase; }
form { display: grid; gap: 14px; max-width: 640px; }
label { display: grid; gap: 6px; font-size: 0.85rem; color: var(--muted); }
input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
}
footer { padding: 28px 6vw 48px; color: var(--muted); border-top: 1px solid var(--line); }
#contact-status { min-height: 1.2em; color: var(--accent); margin: 0; }
@media (max-width: 800px) {
  #nav-toggle { display: inline-flex; }
  #nav-links { display: none; position: absolute; top: 64px; left: 0; right: 0; flex-direction: column; padding: 16px 6vw 20px; background: var(--bg); border-bottom: 1px solid var(--line); }
  #nav-links.open { display: flex; }
  .grid, .items { grid-template-columns: 1fr; }
}
`;
}

const APP_JS = `(function () {
  var seed = window.__SITE_SEED__;
  if (!seed) return;

  function emailOk(value) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(value || "").trim());
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  function render(site) {
    document.title = site.title;
    setText("site-title", site.title);
    setText("hero-kicker", site.kicker);
    setText("hero-title", site.title);
    setText("hero-tagline", site.tagline);
    setText("highlights-title", site.highlightsTitle);
    setText("items-title", site.itemsTitle);
    setText("nav-work", site.itemsTitle);
    setText("contact-title", site.contactTitle);
    setText("footer-title", site.title);
    var hero = document.getElementById("hero");
    if (hero && site.heroImage) {
      hero.style.backgroundImage = "linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,.62)), url(\\"" + site.heroImage + "\\")";
    }
    var highlights = document.getElementById("highlights-list");
    if (highlights) {
      highlights.innerHTML = (site.highlights || []).map(function (item) {
        return "<article class=\\"card\\"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.text) + "</p></article>";
      }).join("");
    }
    var items = document.getElementById("items");
    if (items) {
      items.innerHTML = (site.items || []).map(function (item) {
        return "<article class=\\"item\\"><img src=\\"" + escapeHtml(item.image) + "\\" alt=\\"" + escapeHtml(item.title) + "\\" /><div><h3>" + escapeHtml(item.title) + "</h3>" + (item.meta ? "<p class=\\"meta\\">" + escapeHtml(item.meta) + "</p>" : "") + "<p>" + escapeHtml(item.text) + "</p></div></article>";
      }).join("");
    }
  }

  function loadContent() {
    return fetch("/api/content").then(function (res) {
      if (!res.ok) throw new Error("offline");
      return res.json();
    }).catch(function () {
      return seed;
    });
  }

  function boot() {
    loadContent().then(render);
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("nav-links");
    if (toggle && nav) {
      toggle.addEventListener("click", function () { nav.classList.toggle("open"); });
    }
    var form = document.getElementById("contact-form");
    var status = document.getElementById("contact-status");
    if (!form || !status) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      if (!String(data.name || "").trim() || !emailOk(data.email) || String(data.message || "").trim().length < 2) {
        status.textContent = "Enter a name, a valid email, and a message.";
        return;
      }
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("request failed");
        status.textContent = "Message sent. The API stored it.";
        form.reset();
      }).catch(function () {
        status.textContent = "Offline — message kept in this browser. Run npm start to store it on the server.";
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
`;

function buildServer(seed: SiteSeed): { server: string; routes: string; store: string } {
  const store = `export const site = ${JSON.stringify(seed, null, 2)};

export const messages = [];

export function addMessage(entry) {
  messages.unshift(entry);
  return entry;
}
`;

  const routes = `import { Router } from "express";
import { site, messages, addMessage } from "./store.js";

const emailOk = (value) => ${CONTACT_EMAIL_PATTERN.toString()}.test(String(value || "").trim());

export function createRouter() {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, service: site.title });
  });

  router.get("/content", (_req, res) => {
    res.json(site);
  });

  router.get("/messages", (_req, res) => {
    res.json(messages);
  });

  router.post("/contact", (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const message = String(req.body?.message || "").trim();
    if (!name || !emailOk(email) || message.length < 2) {
      return res.status(400).json({ error: "Enter a name, a valid email, and a message." });
    }
    const entry = addMessage({
      id: Date.now().toString(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json(entry);
  });

  return router;
}
`;

  const server = `import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createRouter } from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use("/api", createRouter());
app.use(express.static(path.join(__dirname, "..")));

app.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});
`;

  return { server, routes, store };
}

function buildReadme(seed: SiteSeed): string {
  return `# ${seed.title}

Full-stack website generated by the Lunor.AI Web Development assistant.

## Files

- \`index.html\`, \`styles.css\`, \`app.js\` — client. The page includes \`window.__SITE_SEED__\` so it renders before the API is running.
- \`server/server.js\` — Express app on port 3000. It serves this folder and the JSON API.
- \`server/routes.js\` — \`GET /api/health\`, \`GET /api/content\`, \`GET /api/messages\`, \`POST /api/contact\`.
- \`server/store.js\` — in-memory site content and contact messages.

## Run

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000.

The contact form posts to \`/api/contact\`. If you open \`index.html\` as a file, or from a static server without the API, the form reports that it is offline and the page keeps using the embedded content.
`;
}

function buildPackageJson(title: string): string {
  return `${JSON.stringify({
    name: slugify(title),
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: { start: "node server/server.js" },
    dependencies: { express: "^4.21.2" },
  }, null, 2)}\n`;
}

export function generateFullStackWebsite(options?: {
  brief?: string;
  kind?: WebsiteKind;
  title?: string;
}): GeneratedWebsite {
  const brief = options?.brief?.trim() || "";
  const kind = options?.kind || detectWebsiteKind(brief);
  const title = (options?.title?.trim() || extractSiteTitle(brief, defaultTitle(kind, brief))).slice(0, 80);
  const seed = buildSeed(kind, title, brief);
  const api = buildServer(seed);
  const files: WebsiteFile[] = [
    { path: "index.html", language: "html", content: buildHtml(seed) },
    { path: "styles.css", language: "css", content: buildCss(kind, seed.heroImage) },
    { path: "app.js", language: "javascript", content: APP_JS },
    { path: "server/server.js", language: "javascript", content: api.server },
    { path: "server/routes.js", language: "javascript", content: api.routes },
    { path: "server/store.js", language: "javascript", content: api.store },
    { path: "package.json", language: "json", content: buildPackageJson(title) },
    { path: "README.md", language: "markdown", content: buildReadme(seed) },
  ];
  const blueprint = WEBSITE_BLUEPRINTS.find((item) => item.id === kind);
  return {
    kind,
    title,
    seed,
    files,
    summary: `${blueprint?.name || "Website"} for ${title}. Client files preview immediately. Express serves the same pages and a contact API.`,
  };
}

export function websiteFilesToTree(files: WebsiteFile[]): WebsiteTreeNode[] {
  const root: WebsiteTreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/");
    let level = root;
    let accumulated = "";
    parts.forEach((part, index) => {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const isFile = index === parts.length - 1;
      if (isFile) {
        level.push({
          id: accumulated,
          name: part,
          type: "file",
          language: file.language,
          content: file.content,
        });
        return;
      }
      let folder = level.find((node) => node.type === "folder" && node.name === part);
      if (!folder) {
        folder = { id: accumulated, name: part, type: "folder", isOpen: true, children: [] };
        level.push(folder);
      }
      level = folder.children || [];
    });
  }
  return root;
}

export function formatWebsiteAssistantMessage(site: GeneratedWebsite): string {
  const files = site.files.map((file) => `- \`${file.path}\``).join("\n");
  return `**Website Generator** built **${site.title}** (${site.kind}).

${site.summary}

**Project files**
${files}

The preview uses the content embedded in \`index.html\`. From the project root, install dependencies and start the API:

    npm install
    npm start

Then open http://localhost:3000. \`GET /api/content\` returns the page data. \`POST /api/contact\` stores a message in memory. A name, valid email, and message are required.`;
}
