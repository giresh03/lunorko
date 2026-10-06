/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a previewable HTML/CSS/JS frontend and an Express API the student can run locally.
 */

export const WEBSITE_KINDS = [
  { id: "landing", label: "Landing", hint: "Product launch page" },
  { id: "portfolio", label: "Portfolio", hint: "Personal work showcase" },
  { id: "restaurant", label: "Restaurant", hint: "Menu and reservations" },
  { id: "saas", label: "SaaS", hint: "Product marketing site" },
  { id: "blog", label: "Blog", hint: "Articles and newsletter" },
  { id: "store", label: "Store", hint: "Catalog and cart" },
] as const;

export type WebsiteKind = (typeof WEBSITE_KINDS)[number]["id"];

export interface WebsiteBrief {
  name: string;
  kind: WebsiteKind;
  tagline?: string;
}

export interface GeneratedWebsiteFile {
  path: string;
  language: string;
  content: string;
}

export const WEBSITE_FILE_PATHS = [
  "src/index.html",
  "src/styles.css",
  "src/script.js",
  "server/package.json",
  "server/index.js",
  "server/src/app.js",
  "server/src/routes/api.js",
  "server/src/data/store.js",
  "README.md",
] as const;

interface Palette {
  bg: string;
  text: string;
  muted: string;
  card: string;
  accent: string;
  accentText: string;
  line: string;
}

interface SiteItem {
  id: string;
  title: string;
  text: string;
  tag: string;
  price?: string;
  image: string;
}

interface SiteFeature {
  title: string;
  text: string;
}

interface SiteForm {
  title: string;
  submit: string;
  success: string;
}

interface SiteCatalog {
  name: string;
  slug: string;
  kind: WebsiteKind;
  kindLabel: string;
  tagline: string;
  palette: Palette;
  nav: string[];
  heroTitle: string;
  heroText: string;
  heroImage: string;
  features: SiteFeature[];
  itemsTitle: string;
  items: SiteItem[];
  form: SiteForm;
  cart: boolean;
}

const KIND_SET = new Set<string>(WEBSITE_KINDS.map((k) => k.id));

const DEFAULT_NAMES: Record<WebsiteKind, string> = {
  landing: "Northstar",
  portfolio: "Studio Hale",
  restaurant: "Olive & Oak",
  saas: "Lumen",
  blog: "Field Notes",
  store: "Harbor Goods",
};

const DEFAULT_TAGLINES: Record<WebsiteKind, string> = {
  landing: "A clear story, a fast page, and a form that actually reaches your API.",
  portfolio: "Selected work, a short bio, and a way for clients to get in touch.",
  restaurant: "Tonight's menu, a reservation form, and a kitchen-side API.",
  saas: "Explain the product, show the proof, and collect demo requests.",
  blog: "Essays worth reading, plus a newsletter signup stored by the server.",
  store: "A small catalog with a cart in the browser and orders on the server.",
};

export function isWebsiteKind(value: string): value is WebsiteKind {
  return KIND_SET.has(value);
}

export function defaultWebsiteName(kind: WebsiteKind): string {
  return DEFAULT_NAMES[kind];
}

export function generateFullStackWebsite(brief: WebsiteBrief): GeneratedWebsiteFile[] {
  const catalog = buildCatalog(brief);
  return [
    { path: "src/index.html", language: "html", content: renderHtml(catalog) },
    { path: "src/styles.css", language: "css", content: renderCss(catalog) },
    { path: "src/script.js", language: "javascript", content: renderClient(catalog) },
    { path: "server/package.json", language: "json", content: renderPackageJson(catalog) },
    { path: "server/index.js", language: "javascript", content: renderServerEntry() },
    { path: "server/src/app.js", language: "javascript", content: renderApp() },
    { path: "server/src/routes/api.js", language: "javascript", content: renderRoutes() },
    { path: "server/src/data/store.js", language: "javascript", content: renderStore(catalog) },
    { path: "README.md", language: "markdown", content: renderReadme(catalog) },
  ];
}

export function summarizeWebsite(brief: WebsiteBrief, files: GeneratedWebsiteFile[]): string {
  const catalog = buildCatalog(brief);
  const list = files.map((f) => `- \`${f.path}\``).join("\n");
  return [
    `**${catalog.name}** is in the editor — a ${catalog.kindLabel.toLowerCase()} site plus an Express API.`,
    "",
    "The preview is the static frontend. The browser saves form submissions locally until the API is running.",
    "",
    "**Files**",
    list,
    "",
    "**Run the API**",
    "```bash",
    "cd server",
    "npm install",
    "npm start",
    "```",
    "",
    "Then open `http://localhost:4000/api/health`. The page will post to `http://localhost:4000/api/messages`.",
  ].join("\n");
}

/**
 * Detect a request to build a whole website. Edits to an existing page
 * ("add a button on the website") stay with the normal assistant.
 */
export function detectWebsiteRequest(prompt: string): WebsiteBrief | null {
  const text = prompt.trim();
  if (!text || text.length > 500) return null;

  if (!isWholeSiteRequest(text)) return null;

  const kind = inferKind(text);
  const name = inferName(text, kind);
  const tagline = inferTagline(text);
  return { name, kind, tagline };
}

function isWholeSiteRequest(text: string): boolean {
  if (/\bwebsite generator\b/i.test(text)) return true;
  const match = text.match(
    /\b(?:build|create|make|generate|scaffold|design)\b([\s\S]{0,80}?)(?:website|web\s*site|landing\s+page|fullstack\s+site)\b/i,
  );
  if (!match) return false;
  const between = match[1];
  if (/\b(button|form|component|section|nav|navbar|footer|header|modal|card|function|api|endpoint|style|css|color|bug|error|fix)\b/i.test(between)) {
    return false;
  }
  const words = between.trim().split(/\s+/).filter(Boolean);
  return words.length <= 8;
}

function inferKind(text: string): WebsiteKind {
  const t = text.toLowerCase();
  if (/\b(restaurant|cafe|café|bistro|diner|menu)\b/.test(t)) return "restaurant";
  if (/\b(portfolio|photographer|case stud(?:y|ies)|personal site)\b/.test(t)) return "portfolio";
  if (/\b(saas|software|startup|dashboard)\b/.test(t)) return "saas";
  if (/\b(blog|magazine|newsletter|essay)\b/.test(t)) return "blog";
  if (/\b(store|shop|e-?commerce|boutique|catalog)\b/.test(t)) return "store";
  if (/\blanding\b/.test(t)) return "landing";
  return "landing";
}

function inferName(text: string, kind: WebsiteKind): string {
  const quoted = text.match(/["“]([^"”]{2,48})["”]/);
  if (quoted) return tidyName(quoted[1]) || defaultWebsiteName(kind);

  const called = text.match(/\b(?:called|named|titled)\s+([A-Za-z0-9][\w'.-]*(?:\s+[&+]?\s*[A-Za-z0-9][\w'.-]*){0,4})/i);
  if (called) {
    const name = tidyName(called[1]);
    if (name && !isFillerName(name)) return name;
  }

  const branded = text.match(/\bfor\s+(?:a|an|the|my)?\s*([A-Z][\w&'.-]*(?:\s+[A-Z][\w&'.-]*){0,3})/);
  if (branded) {
    const name = tidyName(branded[1]);
    if (name && !isFillerName(name)) return name;
  }

  return defaultWebsiteName(kind);
}

function inferTagline(text: string): string | undefined {
  const match = text.match(/\btagline\s*[:=]\s*["“]?([^"”\n]{4,120})/i);
  return match ? match[1].trim() : undefined;
}

function tidyName(raw: string): string {
  return raw
    .replace(/\b(website|web site|landing page|full[-\s]?stack|fullstack|site)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

function isFillerName(name: string): boolean {
  return /^(a|an|the|my|new|website|site|landing|page|restaurant|portfolio|blog|store|shop|saas)$/i.test(name);
}

function buildCatalog(brief: WebsiteBrief): SiteCatalog {
  const kind = isWebsiteKind(brief.kind) ? brief.kind : "landing";
  const name = tidyName(brief.name) || defaultWebsiteName(kind);
  const preset = PRESETS[kind];
  return {
    name,
    slug: slugify(name),
    kind,
    kindLabel: WEBSITE_KINDS.find((k) => k.id === kind)!.label,
    tagline: brief.tagline?.trim() || DEFAULT_TAGLINES[kind],
    palette: preset.palette,
    nav: preset.nav,
    heroTitle: preset.heroTitle(name),
    heroText: preset.heroText,
    heroImage: preset.heroImage,
    features: preset.features,
    itemsTitle: preset.itemsTitle,
    items: preset.items,
    form: preset.form,
    cart: kind === "store",
  };
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "lunor-site";
}

function photo(id: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface KindPreset {
  palette: Palette;
  nav: string[];
  heroTitle: (name: string) => string;
  heroText: string;
  heroImage: string;
  features: SiteFeature[];
  itemsTitle: string;
  items: SiteItem[];
  form: SiteForm;
}

const PRESETS: Record<WebsiteKind, KindPreset> = {
  landing: {
    palette: { bg: "#0b1220", text: "#e8eef9", muted: "#93a4c3", card: "#141c2e", accent: "#38bdf8", accentText: "#082033", line: "#243049" },
    nav: ["Product", "Proof", "Pricing", "Contact"],
    heroTitle: (name) => `${name} makes the first version obvious`,
    heroText: "A launch page with a proof section, three offers, and a demo form wired to an Express API.",
    heroImage: photo("1553877522-43269d4ea984", 1600, 1000),
    features: [
      { title: "One clear offer", text: "The hero says what it is, who it is for, and what to do next." },
      { title: "Proof above the fold", text: "Three outcomes a visitor can scan without a pitch deck." },
      { title: "A form that lands somewhere", text: "Submissions post to /api/messages and stay in memory on the server." },
    ],
    itemsTitle: "Plans",
    items: [
      { id: "start", title: "Start", text: "Single page, contact form, and the API health check.", tag: "Free", price: "$0", image: photo("1461749280684-dccba630e2f6", 800, 600) },
      { id: "build", title: "Build", text: "Custom sections, analytics events, and saved leads.", tag: "Popular", price: "$29", image: photo("1498050108023-c5249f4df085", 800, 600) },
      { id: "scale", title: "Scale", text: "Team inbox, export, and a staging environment.", tag: "Teams", price: "$99", image: photo("1552664730-d307ca884978", 800, 600) },
    ],
    form: { title: "Book a demo", submit: "Request a demo", success: "Request received." },
  },
  portfolio: {
    palette: { bg: "#111111", text: "#f5f5f0", muted: "#a3a39a", card: "#1c1c1c", accent: "#e2f07a", accentText: "#1a1c0c", line: "#2c2c2c" },
    nav: ["Work", "About", "Services", "Contact"],
    heroTitle: (name) => `${name}`,
    heroText: "Design and front-end for teams who want the work to speak before the bio does.",
    heroImage: photo("1558618666-fcd25c85f1d7", 1600, 1000),
    features: [
      { title: "Selected work", text: "Three case studies with the constraint, the move, and the result." },
      { title: "A short about", text: "Enough context for a hiring manager, not a memoir." },
      { title: "Project inquiries", text: "The contact form posts to the API with the project name attached." },
    ],
    itemsTitle: "Selected work",
    items: [
      { id: "atlas", title: "Atlas Supply", text: "Rebuilt a wholesale catalog so buyers finish an order on a phone.", tag: "Commerce", image: photo("1441986300917-64674bd600d8", 800, 600) },
      { id: "kepler", title: "Kepler Notes", text: "A reading app with a quieter type scale and faster search.", tag: "Product", image: photo("1513364776144-60967b0f800f", 800, 600) },
      { id: "marina", title: "Marina Studio", text: "Portfolio and booking flow for a four-person photo studio.", tag: "Brand", image: photo("1498050108023-c5249f4df085", 800, 600) },
    ],
    form: { title: "Start a project", submit: "Send inquiry", success: "Inquiry received." },
  },
  restaurant: {
    palette: { bg: "#1c1410", text: "#f6efe6", muted: "#cbbba8", card: "#2a1e18", accent: "#e8b86d", accentText: "#2a1a0c", line: "#3d2c24" },
    nav: ["Menu", "Story", "Visit", "Reserve"],
    heroTitle: (name) => `${name}`,
    heroText: "Wood fire, a short menu, and a reservation form the host stand can actually read.",
    heroImage: photo("1414235077428-338989a2e8c0", 1600, 1000),
    features: [
      { title: "Tonight's menu", text: "A few dishes with prices, not a PDF from 2019." },
      { title: "Hours and the room", text: "Where to sit, when the kitchen closes, and how to get there." },
      { title: "Reservations", text: "Guests post a party size and a time. The API keeps the list." },
    ],
    itemsTitle: "Menu",
    items: [
      { id: "hearth", title: "Hearth bread", text: "Cultured butter, smoked salt, olive oil.", tag: "To start", price: "$9", image: photo("1504674900247-0877df9cc836", 800, 600) },
      { id: "trout", title: "River trout", text: "Brown butter, lemon, bitter greens.", tag: "Main", price: "$28", image: photo("1476224203421-9ac39bcb3327", 800, 600) },
      { id: "olive", title: "Olive oil cake", text: "Citrus, crème fraîche, pistachio.", tag: "Sweet", price: "$12", image: photo("1565299624946-b28f40a0ae38", 800, 600) },
    ],
    form: { title: "Reserve a table", submit: "Request a table", success: "Reservation request received." },
  },
  saas: {
    palette: { bg: "#0b1020", text: "#eef0ff", muted: "#a5abc9", card: "#14182b", accent: "#8b7cff", accentText: "#140f2e", line: "#2a3150" },
    nav: ["Product", "Workflow", "Pricing", "Demo"],
    heroTitle: (name) => `${name} keeps the week in one queue`,
    heroText: "A product site for a small SaaS: the job it does, the workflow, and a demo request.",
    heroImage: photo("1551434678-e076c223a692", 1600, 1000),
    features: [
      { title: "Shared queue", text: "Every request lands in one list instead of five inboxes." },
      { title: "Status people trust", text: "Customers see what moved, what is waiting, and who owns it." },
      { title: "Demo requests", text: "The form posts to the API so sales is not copy-pasting email." },
    ],
    itemsTitle: "Pricing",
    items: [
      { id: "solo", title: "Solo", text: "One workspace, three teammates, email support.", tag: "Starter", price: "$19", image: photo("1460925895917-afdab827c52f", 800, 600) },
      { id: "team", title: "Team", text: "Shared inbox, roles, and a weekly export.", tag: "Most teams", price: "$49", image: photo("1552664730-d307ca884978", 800, 600) },
      { id: "org", title: "Org", text: "SSO-ready structure, audit notes, and a success manager.", tag: "Company", price: "$149", image: photo("1553877522-43269d4ea984", 800, 600) },
    ],
    form: { title: "Get a demo", submit: "Request demo", success: "Demo request received." },
  },
  blog: {
    palette: { bg: "#f6f1e8", text: "#1c1915", muted: "#5e584f", card: "#fffdf8", accent: "#1f6b4a", accentText: "#f4fff8", line: "#e4dccf" },
    nav: ["Essays", "Notes", "About", "Subscribe"],
    heroTitle: (name) => `${name}`,
    heroText: "Slow writing about tools, cities, and the work of making software understandable.",
    heroImage: photo("1457369804613-52c61a468e7d", 1600, 1000),
    features: [
      { title: "Longer pieces", text: "Essays with a dek, a topic, and enough room to finish a thought." },
      { title: "Field notes", text: "Shorter posts for links, quotes, and things noticed on a walk." },
      { title: "Newsletter", text: "Signups post to the API. Nothing is sold to a third party in this demo." },
    ],
    itemsTitle: "Latest",
    items: [
      { id: "maps", title: "Maps that leave the road in", text: "Why the useful diagram is the one that admits what it left out.", tag: "Essay", image: photo("1524661135-423995f22d0b", 800, 600) },
      { id: "queues", title: "A queue is a product", text: "Status, ownership, and the sentence a customer should read.", tag: "Product", image: photo("1454165804606-c3d57bc86b40", 800, 600) },
      { id: "type", title: "Type for people who read", text: "Measure, line length, and the quiet luxury of a margin.", tag: "Craft", image: photo("1455390582262-044cdead277a", 800, 600) },
    ],
    form: { title: "Get the next essay", submit: "Subscribe", success: "You are on the list." },
  },
  store: {
    palette: { bg: "#101114", text: "#f4f1ea", muted: "#b7b1a6", card: "#1b1c21", accent: "#ff5a36", accentText: "#2a0c06", line: "#2c2d33" },
    nav: ["Shop", "About", "Shipping", "Cart"],
    heroTitle: (name) => `${name}`,
    heroText: "Objects for the desk and the kitchen. Add them to a cart, then send the order to the API.",
    heroImage: photo("1441986300917-64674bd600d8", 1600, 1000),
    features: [
      { title: "A short catalog", text: "Three products with a price, a note, and a photo." },
      { title: "Cart in the browser", text: "The cart lives in localStorage so the preview works with no server." },
      { title: "Orders on the server", text: "Checkout posts the cart to /api/messages as an order." },
    ],
    itemsTitle: "In the shop",
    items: [
      { id: "lamp", title: "Desk lamp", text: "Brass arm, linen shade, warm bulb included.", tag: "Light", price: "$84", image: photo("1507473885765-e6ed057f782c", 800, 600) },
      { id: "mug", title: "Stoneware mug", text: "Speckled clay, holds a real cup of coffee.", tag: "Kitchen", price: "$28", image: photo("1514228742587-6b1558fcca3d", 800, 600) },
      { id: "notebook", title: "Cloth notebook", text: "Plain pages, sewn binding, fits in a jacket.", tag: "Paper", price: "$18", image: photo("1516414447565-b14be0adf13e", 800, 600) },
    ],
    form: { title: "Checkout", submit: "Place order", success: "Order sent." },
  },
};

function renderHtml(site: SiteCatalog): string {
  const name = escapeHtml(site.name);
  const cards = site.items
    .map((item) => {
      const price = item.price ? `<p class="price">${escapeHtml(item.price)}</p>` : "";
      const action = site.cart
        ? `<button class="btn btn-small" type="button" data-add="${escapeHtml(item.id)}">Add to cart</button>`
        : "";
      return `<article class="card">
        <img src="${item.image}" alt="${escapeHtml(item.title)}" width="800" height="600" loading="lazy">
        <div class="card-body">
          <p class="tag">${escapeHtml(item.tag)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
          ${price}
          ${action}
        </div>
      </article>`;
    })
    .join("\n");

  const features = site.features
    .map(
      (feature, index) => `<article class="feature">
        <span class="index">0${index + 1}</span>
        <h3>${escapeHtml(feature.title)}</h3>
        <p>${escapeHtml(feature.text)}</p>
      </article>`,
    )
    .join("\n");

  const nav = site.nav
    .map((label) => {
      const href = hrefFor(label);
      return `<a href="${href}">${escapeHtml(label)}</a>`;
    })
    .join("\n");

  const cartChip = site.cart ? `<a class="cart-chip" href="#contact">Cart <span id="cart-count">0</span></a>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-kind="${site.kind}">
  <header class="site-header">
    <a class="logo" href="#top">${name}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav">${nav}</nav>
    ${cartChip}
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(site.kindLabel)}</p>
        <h1>${escapeHtml(site.heroTitle)}</h1>
        <p class="lede">${escapeHtml(site.heroText)}</p>
        <div class="hero-actions">
          <a class="btn" href="#items">${escapeHtml(site.itemsTitle)}</a>
          <a class="btn btn-ghost" href="#contact">${escapeHtml(site.form.submit)}</a>
        </div>
      </div>
      <img class="hero-photo" src="${site.heroImage}" alt="" width="1600" height="1000">
    </section>

    <section id="features" class="section">
      <div class="section-head">
        <h2>How it works</h2>
        <p>${escapeHtml(site.tagline)}</p>
      </div>
      <div class="feature-grid">${features}</div>
    </section>

    <section id="items" class="section">
      <div class="section-head">
        <h2>${escapeHtml(site.itemsTitle)}</h2>
      </div>
      <div class="card-grid">${cards}</div>
    </section>

    <section id="contact" class="section contact">
      <div>
        <h2>${escapeHtml(site.form.title)}</h2>
        <p class="api-note" id="api-note">Preview mode saves this in the browser. Start the Express server to store it in the API.</p>
      </div>
      <form id="site-form">
        <label>Name<input name="name" type="text" required autocomplete="name"></label>
        <label>Email<input name="email" type="email" required autocomplete="email"></label>
        <label>Note<textarea name="message" rows="4" required></textarea></label>
        <button class="btn" type="submit">${escapeHtml(site.form.submit)}</button>
        <p class="form-status" id="form-status" role="status"></p>
      </form>
    </section>
  </main>

  <footer class="site-footer">
    <p>${name}</p>
    <p>Frontend in this preview. API in <code>server/</code>.</p>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function hrefFor(label: string): string {
  const key = label.toLowerCase();
  if (/(menu|shop|work|essay|product|pricing|plan)/.test(key)) return "#items";
  if (/(contact|reserve|demo|subscribe|cart)/.test(key)) return "#contact";
  return "#features";
}

function renderCss(site: SiteCatalog): string {
  const p = site.palette;
  return `:root {
  --bg: ${p.bg};
  --text: ${p.text};
  --muted: ${p.muted};
  --card: ${p.card};
  --accent: ${p.accent};
  --accent-text: ${p.accentText};
  --line: ${p.line};
  --serif: "Fraunces", Georgia, serif;
  --sans: "Outfit", "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.site-header, .section, .site-footer { width: min(1120px, calc(100% - 32px)); margin-inline: auto; }
.site-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 5;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
}
.logo { font-family: var(--serif); font-size: 1.25rem; text-decoration: none; }
#site-nav { display: flex; gap: 18px; margin-left: auto; }
#site-nav a { text-decoration: none; color: var(--muted); font-size: 0.92rem; }
#site-nav a:hover { color: var(--text); }
.nav-toggle, .cart-chip { display: none; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center; padding: 24px 0 12px; width: min(1120px, calc(100% - 32px)); margin-inline: auto; }
.eyebrow { letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.75rem; color: var(--accent); margin: 0 0 8px; }
h1, h2, h3 { font-family: var(--serif); font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.6rem, 6vw, 5rem); line-height: 0.95; margin: 0 0 16px; }
.lede, .section-head p { color: var(--muted); font-size: 1.05rem; }
.hero-actions, .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
.hero-photo { width: 100%; height: 460px; object-fit: cover; border-radius: 18px; }
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--accent); color: var(--accent-text);
  border: 0; border-radius: 999px; padding: 12px 18px;
  font: 600 0.95rem var(--sans); text-decoration: none; cursor: pointer;
}
.btn-ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
.btn-small { padding: 8px 12px; font-size: 0.85rem; }
.section { padding: 56px 0; }
.section-head { display: flex; justify-content: space-between; gap: 24px; align-items: end; margin-bottom: 22px; }
.section-head h2, .contact h2 { margin: 0; font-size: clamp(1.8rem, 3vw, 2.6rem); }
.feature-grid, .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature, .card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; }
.feature { padding: 20px; }
.index { color: var(--accent); font-size: 0.8rem; }
.card img { height: 190px; width: 100%; object-fit: cover; }
.card-body, .contact form { padding: 16px 18px 18px; }
.tag { color: var(--accent); font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 6px; }
.price { font-family: var(--serif); font-size: 1.4rem; margin: 8px 0; }
.contact { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 28px; align-items: start; }
form { display: grid; gap: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; }
label { display: grid; gap: 6px; font-size: 0.85rem; color: var(--muted); }
input, textarea {
  width: 100%; border: 1px solid var(--line); background: var(--bg); color: var(--text);
  border-radius: 10px; padding: 12px; font: 400 1rem var(--sans);
}
.form-status, .api-note { color: var(--muted); min-height: 1.2em; }
.site-footer { display: flex; justify-content: space-between; gap: 12px; padding: 28px 0 40px; color: var(--muted); border-top: 1px solid var(--line); }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--text); }
@media (max-width: 800px) {
  .hero, .feature-grid, .card-grid, .contact, .section-head, .site-footer { grid-template-columns: 1fr; display: grid; }
  .hero-photo { height: 240px; }
  .nav-toggle, .cart-chip { display: inline-flex; }
  .cart-chip { margin-left: auto; text-decoration: none; border: 1px solid var(--line); border-radius: 999px; padding: 6px 10px; }
  #site-nav { display: none; position: absolute; top: 64px; left: 16px; right: 16px; padding: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 12px; }
  #site-nav.open { display: grid; }
  .site-header { position: sticky; }
}
`;
}

function renderClient(site: SiteCatalog): string {
  const embedded = JSON.stringify({
    name: site.name,
    kind: site.kind,
    cart: site.cart,
    success: site.form.success,
    items: site.items.map((item) => ({ id: item.id, title: item.title, price: item.price || "" })),
  });

  return `/* ${site.name} — browser client. Talks to the Express API when it is running. */
const SITE = ${embedded};
const API = "http://localhost:4000";
const form = document.querySelector("#site-form");
const statusEl = document.querySelector("#form-status");
const noteEl = document.querySelector("#api-note");
const nav = document.querySelector("#site-nav");
const toggle = document.querySelector(".nav-toggle");
const countEl = document.querySelector("#cart-count");

toggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
});

const cartKey = "lunor-cart-" + SITE.kind;
function readCart() {
  try { return JSON.parse(localStorage.getItem(cartKey) || "[]"); }
  catch { return []; }
}
function writeCart(items) {
  localStorage.setItem(cartKey, JSON.stringify(items));
  if (countEl) countEl.textContent = String(items.reduce((sum, item) => sum + item.qty, 0));
}
writeCart(readCart());

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-add");
    const product = SITE.items.find((item) => item.id === id);
    if (!product) return;
    const cart = readCart();
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
    writeCart(cart);
    if (statusEl) statusEl.textContent = product.title + " added to the cart.";
  });
});

async function postMessage(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1200);
  try {
    const response = await fetch(API + "/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") || ""),
    email: String(data.get("email") || ""),
    message: String(data.get("message") || ""),
    cart: SITE.cart ? readCart() : [],
    site: SITE.name,
  };
  try {
    await postMessage(payload);
    if (noteEl) noteEl.textContent = "Saved on the API at " + API + "/api/messages.";
    if (statusEl) statusEl.textContent = SITE.success;
    form.reset();
    if (SITE.cart) writeCart([]);
  } catch {
    const localKey = "lunor-messages-" + SITE.kind;
    const saved = JSON.parse(localStorage.getItem(localKey) || "[]");
    saved.push({ ...payload, savedAt: new Date().toISOString() });
    localStorage.setItem(localKey, JSON.stringify(saved));
    if (noteEl) noteEl.textContent = "API is not running. Saved in this browser instead.";
    if (statusEl) statusEl.textContent = SITE.success + " (saved locally)";
    form.reset();
  }
});
`;
}

function renderPackageJson(site: SiteCatalog): string {
  return JSON.stringify(
    {
      name: `${site.slug}-server`,
      version: "1.0.0",
      private: true,
      type: "module",
      main: "index.js",
      scripts: {
        start: "node index.js",
        dev: "node --watch index.js",
      },
      dependencies: {
        cors: "^2.8.5",
        express: "^4.21.2",
      },
    },
    null,
    2,
  ) + "\n";
}

function renderServerEntry(): string {
  return `import app from "./src/app.js";

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(\`API listening on http://localhost:\${port}\`);
});
`;
}

function renderApp(): string {
  return `import express from "express";
import cors from "cors";
import api from "./routes/api.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", api);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

export default app;
`;
}

function renderRoutes(): string {
  return `import { Router } from "express";
import { addMessage, getSite, listMessages } from "../data/store.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "lunor-website-api" });
});

router.get("/content", (_req, res) => {
  res.json(getSite());
});

router.get("/messages", (_req, res) => {
  res.json({ messages: listMessages() });
});

router.post("/messages", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and note are required" });
    return;
  }
  const saved = addMessage({
    name,
    email,
    message,
    cart: Array.isArray(req.body?.cart) ? req.body.cart : [],
    site: String(req.body?.site || ""),
  });
  res.status(201).json({ message: saved });
});

export default router;
`;
}

function renderStore(site: SiteCatalog): string {
  const data = {
    name: site.name,
    kind: site.kind,
    tagline: site.tagline,
    items: site.items.map((item) => ({
      id: item.id,
      title: item.title,
      text: item.text,
      tag: item.tag,
      price: item.price || null,
    })),
  };

  return `const site = ${JSON.stringify(data, null, 2)};

const messages = [];

export function getSite() {
  return site;
}

export function listMessages() {
  return messages;
}

export function addMessage(entry) {
  const saved = {
    id: messages.length + 1,
    ...entry,
    createdAt: new Date().toISOString(),
  };
  messages.push(saved);
  return saved;
}
`;
}

function renderReadme(site: SiteCatalog): string {
  return `# ${site.name}

Full-stack ${site.kindLabel.toLowerCase()} site generated in the Lunor Web Development assistant.

## Preview

Open \`src/index.html\` in the editor preview. The page is HTML, CSS, and JavaScript. If the API is offline, the form saves in \`localStorage\`.

## API

\`\`\`bash
cd server
npm install
npm start
\`\`\`

- \`GET http://localhost:4000/api/health\`
- \`GET http://localhost:4000/api/content\`
- \`POST http://localhost:4000/api/messages\` with \`{ "name", "email", "message" }\`
- \`GET http://localhost:4000/api/messages\`

The server is Express with ES modules. Messages stay in memory until the process restarts.
`;
}
