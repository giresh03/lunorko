/**
 * Full-stack website generator for the Web Development AI assistant.
 * Builds a browser client (HTML/CSS/JS) plus an Express API the student can run locally.
 * The live preview uses the static page; `npm start` connects the same UI to the API.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "restaurant" | "shop" | "dashboard";

export interface GeneratedFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export interface WebsiteEndpoint {
  method: "GET" | "POST";
  path: string;
  purpose: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  slug: string;
  tagline: string;
  summary: string;
  files: GeneratedFile[];
  endpoints: WebsiteEndpoint[];
}

export interface WebsitePreset {
  id: WebsiteKind;
  label: string;
  prompt: string;
}

export const WEBSITE_GENERATOR_PRESETS: WebsitePreset[] = [
  { id: "landing", label: "Landing", prompt: "Generate a full-stack landing page website for a product called Lumen" },
  { id: "portfolio", label: "Portfolio", prompt: "Build a full-stack portfolio website for a designer named Studio North" },
  { id: "blog", label: "Blog", prompt: "Create a full-stack blog website called Field Notes" },
  { id: "restaurant", label: "Restaurant", prompt: "Build a full-stack restaurant website called Hearth and Oak" },
  { id: "shop", label: "Shop", prompt: "Generate a full-stack shop website called Atelier" },
  { id: "dashboard", label: "Dashboard", prompt: "Create a full-stack analytics dashboard website called Pulse" },
];

interface Palette {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
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
  type: "text" | "email" | "number" | "date" | "textarea";
  required: boolean;
}

interface SiteSpec {
  kind: WebsiteKind;
  title: string;
  slug: string;
  kicker: string;
  tagline: string;
  summary: string;
  heroImage: string;
  sectionTitle: string;
  sectionLead: string;
  layout: "cards" | "stats";
  listPath: string;
  createPath: string;
  listPurpose: string;
  createPurpose: string;
  submitLabel: string;
  items: CatalogItem[];
  fields: FieldSpec[];
  palette: Palette;
  nav: { href: string; label: string }[];
}

const KIND_PATTERNS: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "dashboard", pattern: /\b(dashboard|analytics|admin panel|metrics)\b/i },
  { kind: "shop", pattern: /\b(shop|store|e-?commerce|products|catalog|checkout|boutique)\b/i },
  { kind: "restaurant", pattern: /\b(restaurant|cafe|café|menu|bakery|diner|bistro|food)\b/i },
  { kind: "blog", pattern: /\b(blog|magazine|articles?|journal|newsletter)\b/i },
  { kind: "portfolio", pattern: /\b(portfolio|personal site|personal website|case studies)\b/i },
  { kind: "landing", pattern: /\b(landing\s*page|saas|startup|marketing site|homepage|product)\b/i },
];

const BUILD_INTENT = /\b(build|create|make|generate|scaffold|design|code|spin\s*up)\b/i;
const SITE_INTENT = /\b(full[\s-]?stack|website|web\s*site|landing\s*page|homepage|portfolio|blog|restaurant|online\s+store|e-?commerce|dashboard)\b/i;
const WIDGET_ONLY = /\b(counter|calculator|todo|to-do|login form|accordion|snippet)\b/i;

function photo(id: string, width = 1400): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCase(value: string): string {
  const small = new Set(["and", "or", "of", "the", "a", "an"]);
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && small.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

function inferKind(prompt: string): WebsiteKind {
  for (const rule of KIND_PATTERNS) {
    if (rule.pattern.test(prompt)) return rule.kind;
  }
  return "landing";
}

/** True when the Web Development assistant should scaffold a full-stack site instead of a small widget. */
export function isWebsiteGenerationRequest(prompt: string): boolean {
  const text = prompt.trim();
  if (text.length < 8 || text.length > 600) return false;
  if (WIDGET_ONLY.test(text) && !/\bwebsite\b/i.test(text)) return false;
  const mentionsSite = SITE_INTENT.test(text);
  const mentionsBuild = BUILD_INTENT.test(text) || /\bfull[\s-]?stack\b/i.test(text);
  return mentionsSite && mentionsBuild;
}

function cleanCapturedName(raw: string): string {
  return raw
    .replace(/\b(full[\s-]?stack|website|web\s*site|landing\s*page|homepage|please|with an? api)\b/gi, " ")
    .replace(/[^A-Za-z0-9 &'.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(prompt: string, fallback: string): string {
  const named = prompt.match(/\b(?:called|named)\s+["']?([A-Za-z0-9][A-Za-z0-9 &'.-]{1,48})/i);
  if (named) {
    const title = cleanCapturedName(named[1]).replace(/\s+\b(for|with|using)\b[\s\S]*$/i, "").trim();
    if (title.length >= 2) return titleCase(title);
  }
  return fallback;
}

function specFor(kind: WebsiteKind, title: string): SiteSpec {
  const slug = slugify(title);
  const sharedNav = [
    { href: "#work", label: "Work" },
    { href: "#contact", label: "Contact" },
  ];

  if (kind === "portfolio") {
    return {
      kind,
      title,
      slug,
      kicker: "Selected work",
      tagline: "Product design and brand sites, built as a client you can preview and an API you can run.",
      summary: `${title} is a portfolio with a project API and a contact route.`,
      heroImage: photo("1558618666-fcd25c85f1d7", 1800),
      sectionTitle: "Projects",
      sectionLead: "Each card is rendered in HTML and can be refreshed from GET /api/projects.",
      layout: "cards",
      listPath: "/api/projects",
      createPath: "/api/contact",
      listPurpose: "List portfolio projects",
      createPurpose: "Save a contact message",
      submitLabel: "Send message",
      palette: { bg: "#14110e", surface: "#1e1a16", text: "#f6f1ea", muted: "#cbbfb2", line: "#3a332c", accent: "#e4b15a", accentInk: "#1a140c" },
      nav: sharedNav,
      items: [
        { id: "atlas", title: "Atlas Archive", detail: "A research library with quiet typography and a searchable collection.", meta: "Brand · 2025", image: photo("1513364776144-60967b0f800f", 900) },
        { id: "harbor", title: "Harbor Goods", detail: "Packaging and a storefront for a small ceramic studio.", meta: "Commerce · 2024", image: photo("1441986300917-64674bd600d8", 900) },
        { id: "north", title: "Northline", detail: "Marketing site for a field-recording label, with a dark listening room.", meta: "Web · 2024", image: photo("1511379938547-c1f69419868d", 900) },
        { id: "folio", title: "Folio Press", detail: "Editorial layout system for a quarterly print magazine.", meta: "Print · 2023", image: photo("1481627834876-b7833e8f5570", 900) },
      ],
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "message", label: "Project notes", type: "textarea", required: true },
      ],
    };
  }

  if (kind === "blog") {
    return {
      kind,
      title,
      slug,
      kicker: "Journal",
      tagline: "Essays on making software, cities, and slow tools.",
      summary: `${title} is a blog with a posts API and a comment route.`,
      heroImage: photo("1481627834876-b7833e8f5570", 1800),
      sectionTitle: "Latest essays",
      sectionLead: "Posts ship in the page and again from GET /api/posts.",
      layout: "cards",
      listPath: "/api/posts",
      createPath: "/api/comments",
      listPurpose: "List essays",
      createPurpose: "Save a comment",
      submitLabel: "Post comment",
      palette: { bg: "#f4efe6", surface: "#fffaf3", text: "#1c1915", muted: "#5e564c", line: "#e4d9c8", accent: "#9a3412", accentInk: "#fff7ed" },
      nav: sharedNav,
      items: [
        { id: "margins", title: "Margins and main ideas", detail: "Why the first version of a page should say one thing clearly.", meta: "Craft · 6 min", image: photo("1481627834876-b7833e8f5570", 900) },
        { id: "apis", title: "A small API is enough", detail: "Start with two routes: one to read, one to write. Grow them when the UI asks.", meta: "Backend · 8 min", image: photo("1461749280684-dccba630e2f6", 900) },
        { id: "type", title: "Type you can read", detail: "A serif for stories and a sans for interface labels keeps a journal calm.", meta: "Design · 5 min", image: photo("1503676260728-1c00da094a0b", 900) },
        { id: "ship", title: "Ship the reading view first", detail: "A list, a title, and a paragraph beat a theme toggle on day one.", meta: "Process · 4 min", image: photo("1517694712202-14dd9538aa97", 900) },
      ],
      fields: [
        { name: "author", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "body", label: "Comment", type: "textarea", required: true },
      ],
    };
  }

  if (kind === "restaurant") {
    return {
      kind,
      title,
      slug,
      kicker: "Supper",
      tagline: "Wood fire, seasonal plates, and a table if you ask early.",
      summary: `${title} is a restaurant site with a menu API and reservations.`,
      heroImage: photo("1414235077428-338989a2e8c0", 1800),
      sectionTitle: "Tonight's menu",
      sectionLead: "The menu is in the page and served again by GET /api/menu.",
      layout: "cards",
      listPath: "/api/menu",
      createPath: "/api/reservations",
      listPurpose: "List menu dishes",
      createPurpose: "Save a reservation",
      submitLabel: "Request a table",
      palette: { bg: "#10211a", surface: "#173028", text: "#f3f7f2", muted: "#c5d5cb", line: "#2c4a3d", accent: "#d7a15f", accentInk: "#1a140c" },
      nav: [
        { href: "#work", label: "Menu" },
        { href: "#contact", label: "Reserve" },
      ],
      items: [
        { id: "broth", title: "Roasted onion broth", detail: "Brown butter, thyme, and a soft egg.", meta: "Starter · 14", image: photo("1504674900247-0877df9cc836", 900) },
        { id: "trout", title: "River trout", detail: "Charred lemon, fennel, and green oil.", meta: "Main · 32", image: photo("1565299624946-b28f40a0ae38", 900) },
        { id: "greens", title: "Market greens", detail: "Hazelnut, pecorino, and cider vinegar.", meta: "Side · 12", image: photo("1512621776951-a57141f2eefd", 900) },
        { id: "tart", title: "Rye tart", detail: "Dark chocolate, olive oil, and salt.", meta: "Sweet · 13", image: photo("1476224203421-9ac39bcb3327", 900) },
      ],
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "guests", label: "Guests", type: "number", required: true },
        { name: "notes", label: "Notes", type: "textarea", required: false },
      ],
    };
  }

  if (kind === "shop") {
    return {
      kind,
      title,
      slug,
      kicker: "Objects",
      tagline: "A small catalog of goods you can browse now and order through the API.",
      summary: `${title} is a shop with a product API and an order route.`,
      heroImage: photo("1441986300917-64674bd600d8", 1800),
      sectionTitle: "In the shop",
      sectionLead: "Products render here and from GET /api/products.",
      layout: "cards",
      listPath: "/api/products",
      createPath: "/api/orders",
      listPurpose: "List products",
      createPurpose: "Place an order",
      submitLabel: "Place order",
      palette: { bg: "#161417", surface: "#221f24", text: "#f7f4f2", muted: "#cfc6c2", line: "#3a3438", accent: "#e7a3b0", accentInk: "#2a1218" },
      nav: [
        { href: "#work", label: "Catalog" },
        { href: "#contact", label: "Order" },
      ],
      items: [
        { id: "lamp", title: "Arc lamp", detail: "Brass stem, linen shade, warm bulb included.", meta: "$180", image: photo("1555041469-a586c61ea9bc", 900) },
        { id: "bowl", title: "Stone bowl", detail: "Speckled clay, food safe, made in small batches.", meta: "$48", image: photo("1472851294608-062f824d29cc", 900) },
        { id: "throw", title: "Wool throw", detail: "Undyed wool, charcoal stripe, 140 × 200 cm.", meta: "$120", image: photo("1483985988355-763728e1935b", 900) },
        { id: "cup", title: "Daily cup", detail: "Matte porcelain, holds 250 ml, stackable.", meta: "$28", image: photo("1514228742587-6b1558fcca3d", 900) },
      ],
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "productId", label: "Product id", type: "text", required: true },
        { name: "quantity", label: "Quantity", type: "number", required: true },
      ],
    };
  }

  if (kind === "dashboard") {
    return {
      kind,
      title,
      slug,
      kicker: "Overview",
      tagline: "Live numbers for a product team, with a notes API when you want to write one down.",
      summary: `${title} is an analytics dashboard with a stats API and a notes route.`,
      heroImage: photo("1551288049-bebda4e38f71", 1800),
      sectionTitle: "This week",
      sectionLead: "Stats are painted in the page and served by GET /api/stats.",
      layout: "stats",
      listPath: "/api/stats",
      createPath: "/api/notes",
      listPurpose: "List dashboard stats",
      createPurpose: "Save a team note",
      submitLabel: "Save note",
      palette: { bg: "#0d141c", surface: "#15202b", text: "#e7eef6", muted: "#9eb0c3", line: "#243444", accent: "#3ddc97", accentInk: "#062117" },
      nav: [
        { href: "#work", label: "Stats" },
        { href: "#contact", label: "Note" },
      ],
      items: [
        { id: "visitors", title: "12,480", detail: "Unique visitors, up 8% from last week.", meta: "Audience" },
        { id: "activation", title: "36%", detail: "New accounts that finished setup.", meta: "Activation" },
        { id: "latency", title: "142 ms", detail: "Median API response time.", meta: "Latency" },
        { id: "errors", title: "0.4%", detail: "Requests that returned a 5xx status.", meta: "Errors" },
      ],
      fields: [
        { name: "author", label: "Author", type: "text", required: true },
        { name: "body", label: "Note", type: "textarea", required: true },
      ],
    };
  }

  return {
    kind: "landing",
    title,
    slug,
    kicker: "Product",
    tagline: "A calm workspace for teams who want the brief, the files, and the next step in one place.",
    summary: `${title} is a landing page with a features API and a lead route.`,
    heroImage: photo("1498050108023-c5249f4df085", 1800),
    sectionTitle: "What you get",
    sectionLead: "Features are in the HTML and available from GET /api/features.",
    layout: "cards",
    listPath: "/api/features",
    createPath: "/api/leads",
    listPurpose: "List product features",
    createPurpose: "Save a lead",
    submitLabel: "Request access",
    palette: { bg: "#0c1222", surface: "#141b2e", text: "#eef3ff", muted: "#b7c3dc", line: "#2a3550", accent: "#7c9cff", accentInk: "#0c1222" },
    nav: [
      { href: "#work", label: "Features" },
      { href: "#contact", label: "Access" },
    ],
    items: [
      { id: "brief", title: "One brief", detail: "Keep the goal, the audience, and the deadline on a single page.", meta: "Plan", image: photo("1454165804606-c3d57bc86b40", 900) },
      { id: "files", title: "Shared files", detail: "The client page and the API live in the same project.", meta: "Build", image: photo("1461749280684-dccba630e2f6", 900) },
      { id: "preview", title: "Instant preview", detail: "Read the page before you install anything. Connect the API when you are ready.", meta: "Ship", image: photo("1555066931-4365d14bab8c", 900) },
      { id: "notes", title: "A human inbox", detail: "Leads land in POST /api/leads instead of a spreadsheet.", meta: "Talk", image: photo("1552664730-d307ca884978", 900) },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "message", label: "What do you want to build?", type: "textarea", required: true },
    ],
  };
}

function renderFields(fields: FieldSpec[]): string {
  return fields.map((field) => {
    const required = field.required ? " required" : "";
    const control = field.type === "textarea"
      ? `<textarea id="${field.name}" name="${field.name}" rows="4"${required}></textarea>`
      : `<input id="${field.name}" name="${field.name}" type="${field.type}"${required} />`;
    return `        <label for="${field.name}">${escapeHtml(field.label)}${control}</label>`;
  }).join("\n");
}

function renderStaticItems(items: CatalogItem[], layout: "cards" | "stats"): string {
  if (layout === "stats") {
    return items.map((item) => `        <article class="stat">
          <p class="stat-kicker">${escapeHtml(item.meta)}</p>
          <p class="stat-value">${escapeHtml(item.title)}</p>
          <p class="stat-detail">${escapeHtml(item.detail)}</p>
        </article>`).join("\n");
  }
  return items.map((item) => `        <article class="card">
          <img src="${item.image}" alt="${escapeHtml(item.title)}" />
          <div class="card-body">
            <p class="card-meta">${escapeHtml(item.meta)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.detail)}</p>
          </div>
        </article>`).join("\n");
}

function renderStyles(palette: Palette): string {
  return `:root {
  --bg: ${palette.bg};
  --surface: ${palette.surface};
  --text: ${palette.text};
  --muted: ${palette.muted};
  --line: ${palette.line};
  --accent: ${palette.accent};
  --accent-ink: ${palette.accentInk};
  --font: "Outfit", "Segoe UI", sans-serif;
  --display: "Fraunces", Georgia, serif;
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
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 7vw;
  position: sticky;
  top: 0;
  z-index: 5;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.brand { font-family: var(--display); font-size: 1.25rem; text-decoration: none; }
.nav-links { display: flex; gap: 18px; }
.nav-links a { text-decoration: none; color: var(--muted); font-size: 0.92rem; }
.nav-toggle { display: none; background: transparent; color: var(--text); border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; }
.hero {
  min-height: 72vh;
  display: grid;
  align-items: end;
  padding: 12vh 7vw 8vh;
  background-image: linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.72)), var(--hero);
  background-size: cover;
  background-position: center;
}
.kicker { letter-spacing: .16em; text-transform: uppercase; font-size: .75rem; color: var(--accent); margin: 0 0 12px; }
h1 { font-family: var(--display); font-weight: 560; font-size: clamp(2.6rem, 6vw, 5.4rem); line-height: .95; margin: 0; max-width: 12ch; }
.tagline { max-width: 38rem; font-size: 1.15rem; color: #f4f4f4; }
.section { padding: 72px 7vw; }
.section h2 { font-family: var(--display); font-size: clamp(2rem, 4vw, 3rem); margin: 0 0 8px; }
.lead { color: var(--muted); max-width: 40rem; margin-top: 0; }
.catalog { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; }
.card, .stat, .panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
}
.card img { height: 180px; width: 100%; }
.card-body, .stat, .panel { padding: 18px; }
.card-meta, .stat-kicker { color: var(--accent); font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 8px; }
.card h3, .stat-value { margin: 0 0 8px; font-size: 1.35rem; }
.card p, .stat-detail { margin: 0; color: var(--muted); }
.stat-value { font-family: var(--display); font-size: 2.4rem; }
.contact { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; font-size: .85rem; color: var(--muted); }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--text);
  padding: 12px 14px;
  font: inherit;
}
button[type="submit"], .refresh {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  background: var(--accent);
  color: var(--accent-ink);
}
.refresh { margin: 8px 0 18px; background: transparent; color: var(--text); border: 1px solid var(--line); }
#api-status, #form-note { min-height: 1.25rem; color: var(--muted); font-size: .9rem; }
footer { padding: 28px 7vw 40px; color: var(--muted); border-top: 1px solid var(--line); }
@media (max-width: 800px) {
  .contact { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  .nav-links { display: none; }
  .nav-links.open { display: flex; flex-direction: column; position: absolute; top: 64px; right: 7vw; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 12px 16px; }
}
`;
}

function renderHtml(spec: SiteSpec): string {
  const nav = spec.nav.map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(spec.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="nav">
    <a class="brand" href="#top">${escapeHtml(spec.title)}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="nav-links">${nav}</nav>
  </header>
  <main id="top">
    <section class="hero" style="--hero: url('${spec.heroImage}')">
      <div>
        <p class="kicker">${escapeHtml(spec.kicker)}</p>
        <h1>${escapeHtml(spec.title)}</h1>
        <p class="tagline">${escapeHtml(spec.tagline)}</p>
      </div>
    </section>
    <section class="section" id="work">
      <h2>${escapeHtml(spec.sectionTitle)}</h2>
      <p class="lead">${escapeHtml(spec.sectionLead)}</p>
      <button class="refresh" id="refresh" type="button">Refresh from API</button>
      <p id="api-status" role="status"></p>
      <div id="catalog" class="catalog" data-layout="${spec.layout}">
${renderStaticItems(spec.items, spec.layout)}
      </div>
    </section>
    <section class="section" id="contact">
      <div class="contact">
        <div class="panel">
          <p class="kicker">API</p>
          <h2>Write to the server</h2>
          <p class="lead">This form posts JSON to <code>${escapeHtml(spec.createPath)}</code>. In the preview, a failed request still confirms locally.</p>
        </div>
        <form id="lead-form">
${renderFields(spec.fields)}
          <button type="submit">${escapeHtml(spec.submitLabel)}</button>
          <p id="form-note" role="status"></p>
        </form>
      </div>
    </section>
  </main>
  <footer>
    <p>${escapeHtml(spec.title)} · static client + Express API · Lunor.AI</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderClientJs(spec: SiteSpec): string {
  return `// Browser client for ${spec.title}. No imports — the preview can run this file directly.
const LIST_PATH = ${JSON.stringify(spec.listPath)};
const CREATE_PATH = ${JSON.stringify(spec.createPath)};

function renderItems(items) {
  const root = document.getElementById("catalog");
  const layout = root.dataset.layout || "cards";
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const article = document.createElement("article");
    if (layout === "stats") {
      article.className = "stat";
      const kicker = document.createElement("p");
      kicker.className = "stat-kicker";
      kicker.textContent = item.meta || "";
      const value = document.createElement("p");
      value.className = "stat-value";
      value.textContent = item.title;
      const detail = document.createElement("p");
      detail.className = "stat-detail";
      detail.textContent = item.detail;
      article.append(kicker, value, detail);
    } else {
      article.className = "card";
      if (item.image) {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.title;
        article.appendChild(image);
      }
      const body = document.createElement("div");
      body.className = "card-body";
      const meta = document.createElement("p");
      meta.className = "card-meta";
      meta.textContent = item.meta || "";
      const heading = document.createElement("h3");
      heading.textContent = item.title;
      const detail = document.createElement("p");
      detail.textContent = item.detail;
      body.append(meta, heading, detail);
      article.appendChild(body);
    }
    fragment.appendChild(article);
  });
  root.replaceChildren(fragment);
}

function setStatus(id, message) {
  const node = document.getElementById(id);
  if (node) node.textContent = message;
}

async function refreshFromApi() {
  try {
    const response = await fetch(LIST_PATH);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : payload.items;
    if (!Array.isArray(items)) throw new Error("Unexpected payload");
    renderItems(items);
    setStatus("api-status", "Connected to the Express API (" + items.length + " records).");
  } catch (error) {
    setStatus("api-status", "Preview mode — showing the generated page. Run npm start to connect " + LIST_PATH + ".");
  }
}

async function onSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const body = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch(CREATE_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Request failed");
    setStatus("form-note", payload.message || "Saved.");
    form.reset();
  } catch (error) {
    setStatus("form-note", "Saved in this preview. " + CREATE_PATH + " stores it when the server is running.");
    form.reset();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.getElementById("refresh")?.addEventListener("click", refreshFromApi);
  document.getElementById("lead-form")?.addEventListener("submit", onSubmit);
  refreshFromApi();
});
`;
}

function renderServerJs(spec: SiteSpec): string {
  const required = spec.fields.filter((field) => field.required).map((field) => field.name);
  return `/* lunor-node-server */
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const items = ${JSON.stringify(spec.items, null, 2)};
const records = [];
const requiredFields = ${JSON.stringify(required)};

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: ${JSON.stringify(spec.slug)} });
});

app.get(${JSON.stringify(spec.listPath)}, (_req, res) => {
  res.json({ items });
});

app.post(${JSON.stringify(spec.createPath)}, (req, res) => {
  const body = req.body || {};
  const missing = requiredFields.find((field) => {
    const value = body[field];
    const empty = value === undefined || value === null || String(value).trim() === "";
    return empty;
  });
  if (missing) {
    res.status(400).json({ error: "Missing " + missing });
    return;
  }
  if (body.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(body.email))) {
    res.status(400).json({ error: "Enter a valid email" });
    return;
  }
  const record = { id: Date.now().toString(36), ...body };
  records.push(record);
  res.status(201).json({ message: "Saved.", record });
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(${JSON.stringify(spec.title)} + " running at http://localhost:" + PORT);
});
`;
}

function renderPackageJson(spec: SiteSpec): string {
  return JSON.stringify({
    name: spec.slug,
    version: "1.0.0",
    private: true,
    description: spec.summary,
    main: "src/server.js",
    scripts: {
      start: "node src/server.js",
      dev: "node src/server.js",
    },
    dependencies: {
      express: "^4.21.2",
    },
  }, null, 2) + "\n";
}

function renderReadme(spec: SiteSpec): string {
  const routes = [
    `- \`GET /api/health\` — service check`,
    `- \`GET ${spec.listPath}\` — ${spec.listPurpose}`,
    `- \`POST ${spec.createPath}\` — ${spec.createPurpose}`,
  ].join("\n");
  return `# ${spec.title}

${spec.summary}

The browser page is \`src/index.html\`, \`src/styles.css\`, and \`src/app.js\`.
The API is \`src/server.js\` (Express, in-memory data).

## Run the API

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000. The page calls the API on load. If you only use the Lunor preview, the same page still renders from the generated HTML.

## Routes

${routes}
`;
}

const FALLBACK_TITLES: Record<WebsiteKind, string> = {
  landing: "Lumen",
  portfolio: "Studio North",
  blog: "Field Notes",
  restaurant: "Hearth and Oak",
  shop: "Atelier",
  dashboard: "Pulse",
};

export function generateFullStackWebsite(prompt: string): GeneratedWebsite {
  const kind = inferKind(prompt);
  const title = extractTitle(prompt, FALLBACK_TITLES[kind]);
  const spec = specFor(kind, title);
  const files: GeneratedFile[] = [
    { path: "src/index.html", name: "index.html", language: "html", content: renderHtml(spec) },
    { path: "src/styles.css", name: "styles.css", language: "css", content: renderStyles(spec.palette) },
    { path: "src/app.js", name: "app.js", language: "javascript", content: renderClientJs(spec) },
    { path: "src/server.js", name: "server.js", language: "javascript", content: renderServerJs(spec) },
    { path: "package.json", name: "package.json", language: "json", content: renderPackageJson(spec) },
    { path: "README.md", name: "README.md", language: "markdown", content: renderReadme(spec) },
  ];
  return {
    kind: spec.kind,
    title: spec.title,
    slug: spec.slug,
    tagline: spec.tagline,
    summary: spec.summary,
    files,
    endpoints: [
      { method: "GET", path: "/api/health", purpose: "Service check" },
      { method: "GET", path: spec.listPath, purpose: spec.listPurpose },
      { method: "POST", path: spec.createPath, purpose: spec.createPurpose },
    ],
  };
}

/** Chat reply for the assistant. Avoids fenced code blocks so the editor does not duplicate files. */
export function formatWebsiteAssistantMessage(site: GeneratedWebsite): string {
  const files = site.files.map((file) => `- \`${file.path}\``).join("\n");
  const routes = site.endpoints.map((endpoint) => `- \`${endpoint.method} ${endpoint.path}\` — ${endpoint.purpose}`).join("\n");
  return `**Full-stack website ready: ${site.title}**

${site.summary} I wrote the client and the Express API into your project. The preview shows the page immediately. \`npm start\` serves that same page and connects the buttons to the API.

**Files**
${files}

**API**
${routes}

Open \`src/index.html\` for the preview. From the project folder, run \`npm install\` and then \`npm start\`.`;
}
