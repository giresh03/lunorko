/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a previewable HTML/CSS/JS client plus an Express API that
 * serves the same data. The browser falls back to seed data when the
 * API is not running, so the in-editor preview works immediately.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "store" | "blog" | "saas";

export interface WebsiteKindOption {
  id: WebsiteKind;
  label: string;
  description: string;
  example: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
  location: "src" | "root";
}

export interface GeneratedWebsite {
  name: string;
  slug: string;
  kind: WebsiteKind;
  tagline: string;
  summary: string;
  files: GeneratedFile[];
  routes: string[];
}

export const WEBSITE_KINDS: WebsiteKindOption[] = [
  { id: "landing", label: "Landing", description: "Hero, features, and a lead form", example: "Build a full-stack landing website for a design studio" },
  { id: "portfolio", label: "Portfolio", description: "Project grid and a contact form", example: "Build a portfolio website for a photographer" },
  { id: "restaurant", label: "Restaurant", description: "Menu and table reservations", example: "Create a restaurant website called Hearth & Rye" },
  { id: "store", label: "Store", description: "Product catalog and checkout", example: "Generate a full-stack store website" },
  { id: "blog", label: "Blog", description: "Articles with search", example: "Build a blog website called Field Notes" },
  { id: "saas", label: "SaaS", description: "Pricing, stats, and signup", example: "Create a SaaS landing website called Orbit" },
];

const KIND_KEYWORDS: Record<WebsiteKind, string[]> = {
  restaurant: ["restaurant", "cafe", "café", "menu", "reservation", "bistro", "diner", "bakery"],
  store: ["store", "shop", "ecommerce", "e-commerce", "product", "cart", "boutique", "checkout"],
  blog: ["blog", "magazine", "journal", "articles", "newsletter"],
  portfolio: ["portfolio", "photographer", "designer", "agency", "freelance", "studio"],
  saas: ["saas", "pricing", "startup", "subscription", "dashboard", "waitlist"],
  landing: ["landing", "marketing", "company", "business"],
};

const DEFAULT_NAMES: Record<WebsiteKind, string> = {
  landing: "Northstar",
  portfolio: "Studio North",
  restaurant: "Hearth & Rye",
  store: "Lumen Goods",
  blog: "Field Notes",
  saas: "Orbit",
};

const DEFAULT_TAGLINES: Record<WebsiteKind, string> = {
  landing: "A clear product story, with a form that actually saves leads.",
  portfolio: "Selected work, told simply, with a way to get in touch.",
  restaurant: "Seasonal plates, a short menu, and a table when you want one.",
  store: "A small catalog with a cart and an order API behind it.",
  blog: "Essays and notes, searchable, served from the same API as the page.",
  saas: "Pricing, product stats, and a signup that lands in your API.",
};

interface Theme {
  primary: string;
  accent: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
}

const THEMES: Record<WebsiteKind, Theme> = {
  landing: { primary: "#2dd4bf", accent: "#38bdf8", bg: "#07111a", card: "#10202c", text: "#e7f4f1", muted: "#93a8b3" },
  portfolio: { primary: "#c4b5fd", accent: "#f0abfc", bg: "#100c18", card: "#1b1528", text: "#f4efff", muted: "#b3a8c4" },
  restaurant: { primary: "#f5b942", accent: "#fb7185", bg: "#140e0a", card: "#241812", text: "#f8efe4", muted: "#cbb8a4" },
  store: { primary: "#fb7185", accent: "#fdba74", bg: "#140910", card: "#26141c", text: "#ffe8ee", muted: "#d4a8b4" },
  blog: { primary: "#7dd3fc", accent: "#a5b4fc", bg: "#081018", card: "#12202c", text: "#e8f3fb", muted: "#9eb4c6" },
  saas: { primary: "#818cf8", accent: "#34d399", bg: "#0b1020", card: "#151b33", text: "#eef0ff", muted: "#a8b0d4" },
};

interface CatalogItem {
  id: string;
  title: string;
  body: string;
  price?: string;
  tag?: string;
  image: string;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

interface FieldSpec {
  name: string;
  label: string;
  type: "text" | "email" | "date" | "number" | "textarea";
}

interface SiteModel {
  kind: WebsiteKind;
  name: string;
  slug: string;
  tagline: string;
  summary: string;
  theme: Theme;
  heroImage: string;
  listPath: string;
  listKey: string;
  createPath: string;
  createLabel: string;
  catalogTitle: string;
  formTitle: string;
  items: CatalogItem[];
  testimonials: Testimonial[];
  fields: FieldSpec[];
  commerce: boolean;
}

export function detectWebsiteKind(prompt: string): WebsiteKind {
  const text = prompt.toLowerCase();
  let best: WebsiteKind = "landing";
  let bestScore = 0;
  (Object.keys(KIND_KEYWORDS) as WebsiteKind[]).forEach((kind) => {
    const score = KIND_KEYWORDS[kind].reduce((n, word) => n + (text.includes(word) ? 1 : 0), 0);
    if (score > bestScore) {
      best = kind;
      bestScore = score;
    }
  });
  return best;
}

export function isWebsiteGenerationRequest(prompt: string): boolean {
  const text = prompt.trim().toLowerCase();
  if (!text || text.length > 400) return false;
  const wantsBuild = /\b(build|create|generate|make|scaffold)\b/.test(text);
  const wantsSite = /\b(website|web site|landing page|full[ -]?stack)\b/.test(text);
  return wantsBuild && wantsSite;
}

/** Node entry files must not be inlined into the browser preview. */
export function shouldInlineInBrowserPreview(filename: string, content: string): boolean {
  const base = filename.split("/").pop() || filename;
  if (!/\.(js|mjs|cjs|ts)$/i.test(base)) return false;
  if (/server\.(js|mjs|cjs)$/i.test(base)) return false;
  if (/\b(require\s*\(|module\.exports|express\s*\(|process\.env)\b/.test(content)) return false;
  return true;
}

export function generateFullStackWebsite(prompt: string, kindOverride?: WebsiteKind): GeneratedWebsite {
  const kind = kindOverride ?? detectWebsiteKind(prompt);
  const model = buildModel(prompt, kind);
  const files: GeneratedFile[] = [
    { path: "index.html", language: "html", location: "src", content: renderHtml(model) },
    { path: "styles.css", language: "css", location: "src", content: renderCss(model) },
    { path: "app.js", language: "javascript", location: "src", content: renderClient(model) },
    { path: "server.js", language: "javascript", location: "src", content: renderServer(model) },
    { path: "package.json", language: "json", location: "root", content: renderPackageJson(model) },
    { path: "README.md", language: "markdown", location: "root", content: renderReadme(model) },
  ];
  return {
    name: model.name,
    slug: model.slug,
    kind: model.kind,
    tagline: model.tagline,
    summary: model.summary,
    files,
    routes: [`GET ${model.listPath}`, `POST ${model.createPath}`, "GET /api/health"],
  };
}

export function formatWebsiteAssistantMessage(site: GeneratedWebsite): string {
  const files = site.files.map((file) => `- \`${file.location === "src" ? "src/" : ""}${file.path}\``).join("\n");
  const routes = site.routes.map((route) => `- \`${route}\``).join("\n");
  return [
    `Generated **${site.name}**, a full-stack ${site.kind} website.`,
    "",
    site.tagline,
    "",
    "Files applied to the editor:",
    files,
    "",
    "The preview uses sample data inside `app.js`. When you run the API, the page reads the same records from Express.",
    "",
    "Run it locally from the project root:",
    "```bash",
    "npm install",
    "npm start",
    "```",
    "Then open http://localhost:3000",
    "",
    "API routes:",
    routes,
  ].join("\n");
}

function buildModel(prompt: string, kind: WebsiteKind): SiteModel {
  const name = inferName(prompt, kind);
  const slug = slugify(name);
  const tagline = inferTagline(prompt, name, kind);
  const theme = THEMES[kind];
  const heroImage = `https://picsum.photos/seed/${slug}-hero/1600/900`;
  const items = catalogFor(kind, name, slug);
  const testimonials = [
    { name: "Ava Shah", role: "Early customer", quote: `${name} made the first visit feel obvious. I knew what to do in a minute.` },
    { name: "Leo Martins", role: "Repeat visitor", quote: "Fast, clear, and the details match what the team actually delivers." },
    { name: "Mina Cho", role: "Collaborator", quote: "The page and the API stay in sync, which is the part that usually breaks." },
  ];
  const spec = endpointSpec(kind);
  return {
    kind,
    name,
    slug,
    tagline,
    summary: `${name} is a ${kind} site with a static client and an Express API.`,
    theme,
    heroImage,
    items,
    testimonials,
    ...spec,
  };
}

function endpointSpec(kind: WebsiteKind): Pick<SiteModel, "listPath" | "listKey" | "createPath" | "createLabel" | "catalogTitle" | "formTitle" | "fields" | "commerce"> {
  switch (kind) {
    case "restaurant":
      return {
        listPath: "/api/menu",
        listKey: "menu",
        createPath: "/api/reservations",
        createLabel: "Request a table",
        catalogTitle: "Tonight's menu",
        formTitle: "Reserve a table",
        commerce: false,
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "date", label: "Date", type: "date" },
          { name: "guests", label: "Guests", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
        ],
      };
    case "store":
      return {
        listPath: "/api/products",
        listKey: "products",
        createPath: "/api/orders",
        createLabel: "Place order",
        catalogTitle: "Catalog",
        formTitle: "Checkout",
        commerce: true,
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "address", label: "Address", type: "textarea" },
        ],
      };
    case "blog":
      return {
        listPath: "/api/posts",
        listKey: "posts",
        createPath: "/api/comments",
        createLabel: "Leave a note",
        catalogTitle: "Latest writing",
        formTitle: "Write to the editor",
        commerce: false,
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "message", label: "Note", type: "textarea" },
        ],
      };
    case "portfolio":
      return {
        listPath: "/api/projects",
        listKey: "projects",
        createPath: "/api/messages",
        createLabel: "Send message",
        catalogTitle: "Selected work",
        formTitle: "Start a project",
        commerce: false,
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "message", label: "What do you need?", type: "textarea" },
        ],
      };
    case "saas":
      return {
        listPath: "/api/plans",
        listKey: "plans",
        createPath: "/api/signups",
        createLabel: "Create account",
        catalogTitle: "Plans",
        formTitle: "Start free",
        commerce: false,
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Work email", type: "email" },
          { name: "company", label: "Company", type: "text" },
        ],
      };
    default:
      return {
        listPath: "/api/features",
        listKey: "features",
        createPath: "/api/leads",
        createLabel: "Request a demo",
        catalogTitle: "What you get",
        formTitle: "Talk to the team",
        commerce: false,
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "message", label: "What are you building?", type: "textarea" },
        ],
      };
  }
}

function catalogFor(kind: WebsiteKind, name: string, slug: string): CatalogItem[] {
  const img = (n: number) => `https://picsum.photos/seed/${slug}-${n}/800/600`;
  if (kind === "restaurant") {
    return [
      { id: "rye", title: "Brown butter rye", body: "Cultured butter, sea salt, and warm bread for the table.", price: "$9", tag: "Start", image: img(1) },
      { id: "trout", title: "Citrus trout", body: "Grilled trout, fennel, and a sharp citrus dressing.", price: "$28", tag: "Main", image: img(2) },
      { id: "tart", title: "Honey custard tart", body: "A short crust with honey custard and roasted fruit.", price: "$12", tag: "Sweet", image: img(3) },
    ];
  }
  if (kind === "store") {
    return [
      { id: "lamp", title: "Arc lamp", body: "A brass arc lamp with a linen shade.", price: "$180", tag: "Home", image: img(1) },
      { id: "mug", title: "Stone mug", body: "Speckled clay, sized for a long coffee.", price: "$32", tag: "Kitchen", image: img(2) },
      { id: "throw", title: "Wool throw", body: "Heavy wool in a charcoal stripe.", price: "$96", tag: "Textile", image: img(3) },
    ];
  }
  if (kind === "blog") {
    return [
      { id: "maps", title: "Drawing the map first", body: `How ${name} plans a piece before the first sentence.`, tag: "Process", image: img(1) },
      { id: "notes", title: "Field notes from March", body: "Three small observations that changed the draft.", tag: "Notes", image: img(2) },
      { id: "edit", title: "What editing is for", body: "Cutting until the point is the only thing left.", tag: "Craft", image: img(3) },
    ];
  }
  if (kind === "portfolio") {
    return [
      { id: "atlas", title: "Atlas identity", body: "A wordmark, a grid, and a quiet color system.", tag: "Identity", image: img(1) },
      { id: "harbor", title: "Harbor editorial", body: "A magazine layout built around one photograph.", tag: "Print", image: img(2) },
      { id: "kite", title: "Kite product site", body: "A launch page with a short film and a waitlist.", tag: "Web", image: img(3) },
    ];
  }
  if (kind === "saas") {
    return [
      { id: "starter", title: "Starter", body: "For a single product and one workspace.", price: "$0", tag: "Free", image: img(1) },
      { id: "team", title: "Team", body: "Shared projects, roles, and a 30-day history.", price: "$29", tag: "Popular", image: img(2) },
      { id: "scale", title: "Scale", body: "SSO, audit log, and a dedicated region.", price: "$99", tag: "Business", image: img(3) },
    ];
  }
  return [
    { id: "brief", title: "A brief that holds", body: `${name} starts from the job the page has to do.`, tag: "Clarity", image: img(1) },
    { id: "build", title: "Ship the real path", body: "The form writes to an API, not a dead button.", tag: "Build", image: img(2) },
    { id: "care", title: "Leave it maintainable", body: "One client, one server, and data you can read.", tag: "Care", image: img(3) },
  ];
}

function inferName(prompt: string, kind: WebsiteKind): string {
  const quoted = prompt.match(/["“]([^"”]{2,48})["”]/);
  if (quoted) return cleanName(quoted[1]);
  const named = prompt.match(/\b(?:called|named)\s+([A-Za-z0-9][A-Za-z0-9&'’\-\s]{1,40})/i);
  if (named) return cleanName(named[1]);
  const forName = prompt.match(/\bfor\s+(?:an?\s+|the\s+)?([A-Za-z0-9][A-Za-z0-9&'’\-\s]{1,40})/i);
  if (forName) {
    const candidate = cleanName(forName[1].replace(/\b(website|web site|landing page|full[- ]stack site|full[- ]stack app|site|app)\b/gi, ""));
    if (candidate && !/^(a|an|the|my|our)$/i.test(candidate) && candidate.split(/\s+/).length <= 4) {
      const generic = /^(restaurant|cafe|store|shop|blog|portfolio|saas|startup|business|company|photographer|designer)$/i.test(candidate);
      if (!generic) return candidate;
    }
  }
  return DEFAULT_NAMES[kind];
}

function inferTagline(prompt: string, name: string, kind: WebsiteKind): string {
  const stripped = prompt
    .replace(/["“”]/g, "")
    .replace(/\b(build|create|generate|make|scaffold)\b/gi, "")
    .replace(/\b(a|an|the|full[- ]stack|website|web site|landing page|called|named|for)\b/gi, "")
    .replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), "")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length >= 18 && stripped.length <= 110) {
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
  }
  return DEFAULT_TAGLINES[kind];
}

function cleanName(value: string): string {
  return value.replace(/[\u0000-\u001F]/g, "").replace(/\s+/g, " ").trim().slice(0, 48);
}

function slugify(name: string): string {
  const slug = name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "site";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(model: SiteModel): string {
  const t = model.testimonials[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(model.name)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed>
  <header class="nav">
    <a class="brand" href="#top">${escapeHtml(model.name)}</a>
    <nav>
      <a href="#work">${escapeHtml(model.catalogTitle)}</a>
      <a href="#stories">Stories</a>
      <a href="#contact">${escapeHtml(model.formTitle)}</a>
    </nav>
    <span id="cart-count" class="cart${model.commerce ? "" : " hidden"}">Cart 0</span>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(model.kind)}</p>
        <h1>${escapeHtml(model.name)}</h1>
        <p class="lede">${escapeHtml(model.tagline)}</p>
        <div class="hero-actions">
          <a class="btn" href="#work">See the work</a>
          <a class="btn btn-ghost" href="#contact">${escapeHtml(model.createLabel)}</a>
        </div>
      </div>
      <img src="${model.heroImage}" alt="${escapeHtml(model.name)}">
    </section>
    <section id="work">
      <div class="section-head">
        <h2>${escapeHtml(model.catalogTitle)}</h2>
        ${model.kind === "blog" ? '<input id="search" type="search" placeholder="Search writing" aria-label="Search writing">' : ""}
      </div>
      <div id="catalog" class="grid"></div>
    </section>
    <section id="stories">
      <h2>Stories</h2>
      <blockquote>
        <p>${escapeHtml(t.quote)}</p>
        <footer>${escapeHtml(t.name)} · ${escapeHtml(t.role)}</footer>
      </blockquote>
      <div id="testimonials" class="quotes"></div>
    </section>
    <section id="contact">
      <h2>${escapeHtml(model.formTitle)}</h2>
      <form id="site-form">
        ${model.fields.map((field) => field.type === "textarea"
          ? `<label>${escapeHtml(field.label)}<textarea name="${field.name}" required></textarea></label>`
          : `<label>${escapeHtml(field.label)}<input name="${field.name}" type="${field.type}" required></label>`
        ).join("\n        ")}
        <button class="btn" type="submit">${escapeHtml(model.createLabel)}</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <span>${escapeHtml(model.name)}</span>
    <span>Full-stack preview · API on <code>${escapeHtml(model.listPath)}</code></span>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderCss(model: SiteModel): string {
  const theme = model.theme;
  return `:root {
  --primary: ${theme.primary};
  --accent: ${theme.accent};
  --bg: ${theme.bg};
  --card: ${theme.card};
  --text: ${theme.text};
  --muted: ${theme.muted};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", "Avenir Next", sans-serif;
  background: radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--primary) 25%, transparent), transparent 50%), var(--bg);
  color: var(--text);
}
a { color: inherit; text-decoration: none; }
.nav, main, footer { width: min(1100px, calc(100% - 32px)); margin: 0 auto; }
.nav {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 18px 0;
  position: sticky;
  top: 0;
  z-index: 2;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
}
.brand { font-weight: 700; letter-spacing: -0.03em; }
.nav nav { display: flex; gap: 16px; color: var(--muted); margin-left: auto; }
.cart { font-size: 13px; border: 1px solid var(--primary); color: var(--primary); border-radius: 999px; padding: 4px 10px; }
.hidden { display: none; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px; align-items: center; padding: 28px 0 10px; }
.hero img, .card img { width: 100%; height: 100%; object-fit: cover; border-radius: 18px; }
.hero img { min-height: 320px; max-height: 460px; }
.eyebrow { text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--primary); }
h1 { font-size: clamp(40px, 6vw, 72px); line-height: 0.95; margin: 8px 0 12px; letter-spacing: -0.045em; }
h2 { font-size: 28px; margin: 0 0 16px; letter-spacing: -0.03em; }
.lede { color: var(--muted); font-size: 18px; max-width: 46ch; }
.hero-actions, .section-head { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #081018;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}
.btn-ghost { background: transparent; color: var(--text); border: 1px solid color-mix(in srgb, var(--text) 30%, transparent); }
section { padding: 42px 0; }
.grid, .quotes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card, blockquote, form, .quote {
  background: var(--card);
  border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
  border-radius: 18px;
}
.card { overflow: hidden; display: flex; flex-direction: column; }
.card img { height: 180px; border-radius: 0; }
.card div, .quote, blockquote, form { padding: 16px; }
.card h3, .quote strong { margin: 0 0 6px; }
.card p, .quote p, blockquote p { margin: 0; color: var(--muted); }
.meta { display: flex; justify-content: space-between; color: var(--primary); font-size: 13px; margin-bottom: 8px; }
blockquote { margin: 0 0 16px; }
blockquote footer { margin-top: 10px; color: var(--text); }
form { display: grid; gap: 12px; max-width: 640px; }
label { display: grid; gap: 6px; font-size: 14px; }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  color: var(--text);
  padding: 12px;
  font: inherit;
}
textarea { min-height: 96px; resize: vertical; }
#form-status { min-height: 1.2em; color: var(--accent); }
footer { display: flex; justify-content: space-between; gap: 12px; padding: 28px 0 40px; color: var(--muted); font-size: 14px; }
@media (max-width: 800px) {
  .hero, .grid, .quotes { grid-template-columns: 1fr; }
  .nav nav { display: none; }
}
`;
}

function renderClient(model: SiteModel): string {
  const seed = {
    items: model.items,
    testimonials: model.testimonials.slice(1),
  };
  return `// ${model.name} — browser client.
// Uses the Express API when it is running, and this seed when previewed in the editor.
const SEED = ${JSON.stringify(seed, null, 2)};

const catalogEl = document.getElementById("catalog");
const quotesEl = document.getElementById("testimonials");
const formEl = document.getElementById("site-form");
const statusEl = document.getElementById("form-status");
const cartEl = document.getElementById("cart-count");
const searchEl = document.getElementById("search");
const commerce = ${model.commerce ? "true" : "false"};
let items = SEED.items.slice();
let cart = [];

function money(item) {
  return item.price ? item.price : "";
}

function renderItems(list) {
  catalogEl.innerHTML = list.map((item) => \`
    <article class="card">
      <img src="\${item.image}" alt="\${item.title}">
      <div>
        <div class="meta"><span>\${item.tag || ""}</span><span>\${money(item)}</span></div>
        <h3>\${item.title}</h3>
        <p>\${item.body}</p>
        \${commerce ? \`<button class="btn" data-add="\${item.id}" type="button">Add to cart</button>\` : ""}
      </div>
    </article>\`).join("");
}

function renderQuotes(list) {
  quotesEl.innerHTML = list.map((quote) => \`
    <article class="quote">
      <p>\${quote.quote}</p>
      <strong>\${quote.name}</strong>
      <p>\${quote.role}</p>
    </article>\`).join("");
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(String(response.status));
    return await response.json();
  } catch {
    return fallback;
  }
}

async function boot() {
  const payload = await loadJson(${JSON.stringify(model.listPath)}, { ${JSON.stringify(model.listKey)}: SEED.items });
  items = payload[${JSON.stringify(model.listKey)}] || SEED.items;
  renderItems(items);
  const stories = await loadJson("/api/testimonials", { testimonials: SEED.testimonials });
  renderQuotes(stories.testimonials || SEED.testimonials);
}

if (searchEl) {
  searchEl.addEventListener("input", () => {
    const query = searchEl.value.trim().toLowerCase();
    renderItems(items.filter((item) => (item.title + " " + item.body).toLowerCase().includes(query)));
  });
}

catalogEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  cart.push(button.getAttribute("data-add"));
  cartEl.textContent = "Cart " + cart.length;
});

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(formEl).entries());
  if (commerce) body.items = cart.slice();
  statusEl.textContent = "Sending…";
  try {
    const response = await fetch(${JSON.stringify(model.createPath)}, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Request failed");
    const saved = await response.json();
    statusEl.textContent = "Saved #" + saved.id + ". The API accepted it.";
    formEl.reset();
    cart = [];
    if (commerce) cartEl.textContent = "Cart 0";
  } catch {
    statusEl.textContent = "Preview mode: the API is offline, so this stayed in the browser. Run npm start to persist it.";
  }
});

boot();
`;
}

function renderServer(model: SiteModel): string {
  const records = {
    [model.listKey]: model.items,
    testimonials: model.testimonials.slice(1),
  };
  return `// ${model.name} — Express API. Run from the project root: npm install && npm start
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const db = ${JSON.stringify(records, null, 2)};
const submissions = [];

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: ${JSON.stringify(model.name)} });
});

app.get(${JSON.stringify(model.listPath)}, (_req, res) => {
  res.json({ ${JSON.stringify(model.listKey)}: db[${JSON.stringify(model.listKey)}] });
});

app.get("/api/testimonials", (_req, res) => {
  res.json({ testimonials: db.testimonials });
});

app.post(${JSON.stringify(model.createPath)}, (req, res) => {
  const required = ${JSON.stringify(model.fields.filter((field) => field.type !== "textarea").map((field) => field.name))};
  const missing = required.filter((key) => !String(req.body?.[key] || "").trim());
  if (missing.length) {
    return res.status(400).json({ error: "Missing " + missing.join(", ") });
  }
  const record = {
    id: submissions.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  submissions.push(record);
  res.status(201).json(record);
});

app.listen(PORT, () => {
  console.log(${JSON.stringify(model.name)} + " API on http://localhost:" + PORT);
});
`;
}

function renderPackageJson(model: SiteModel): string {
  return JSON.stringify({
    name: model.slug,
    version: "1.0.0",
    private: true,
    description: model.summary,
    scripts: { start: "node src/server.js" },
    dependencies: { express: "^4.21.2", cors: "^2.8.5" },
  }, null, 2) + "\n";
}

function renderReadme(model: SiteModel): string {
  return `# ${model.name}

${model.tagline}

This project was generated by the Web Development AI assistant.

## Files

- \`src/index.html\` — page
- \`src/styles.css\` — theme
- \`src/app.js\` — client. Uses seed data when the API is offline
- \`src/server.js\` — Express API
- \`package.json\` — start script

## Run the API

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## API

${[`GET ${model.listPath}`, "GET /api/testimonials", `POST ${model.createPath}`, "GET /api/health"].map((route) => `- \`${route}\``).join("\n")}
`;
}
