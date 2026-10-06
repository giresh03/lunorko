/**
 * Full-stack website generator for the Web Development assistant.
 * Produces a previewable HTML/CSS/JS client and an Express API that share one content model.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "shop" | "blog";

export interface WebsiteFile {
  name: string;
  language: "html" | "css" | "javascript" | "json" | "markdown";
  content: string;
  folder: "src" | "server" | "root";
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  name: string;
  tagline: string;
  files: WebsiteFile[];
  summary: string;
}

export interface WebsitePreset {
  id: WebsiteKind;
  label: string;
  prompt: string;
}

interface SiteItem {
  title: string;
  text: string;
  meta: string;
  image: string;
  tag: string;
}

interface SiteContent {
  kind: WebsiteKind;
  name: string;
  tagline: string;
  lede: string;
  accent: string;
  accent2: string;
  bg: string;
  font: string;
  heroImage: string;
  features: { title: string; text: string }[];
  items: SiteItem[];
  filters: string[];
  faqs: { q: string; a: string }[];
  cta: string;
  formLabel: string;
}

export const WEBSITE_PRESETS: WebsitePreset[] = [
  { id: "landing", label: "SaaS landing", prompt: "Build a full-stack landing page website for Northstar" },
  { id: "portfolio", label: "Portfolio", prompt: "Build a portfolio website for Ada Lane" },
  { id: "restaurant", label: "Restaurant", prompt: "Build a restaurant website for Harbor & Rye" },
  { id: "shop", label: "Shop", prompt: "Build an online store website for Field Goods" },
  { id: "blog", label: "Blog", prompt: "Build a blog website for Field Notes" },
];

const FALLBACK_NAMES: Record<WebsiteKind, string> = {
  landing: "Northstar",
  portfolio: "Ada Lane",
  restaurant: "Harbor & Rye",
  shop: "Field Goods",
  blog: "Field Notes",
};

export function isWebsiteGenerationRequest(input: string): boolean {
  const text = input.toLowerCase().trim();
  if (!text) return false;
  if (/\b(fix|debug|explain|why|error|bug|refactor)\b/.test(text)) return false;
  const site = /\b(website|web site|landing page|homepage|portfolio|storefront|online store|restaurant site|blog site)\b/.test(text);
  const build = /\b(build|create|generate|make|scaffold|design|spin up)\b/.test(text);
  const stack = /\bfull[-\s]?stack\b/.test(text);
  if (stack && (site || build || /\b(website|site|page)\b/.test(text))) return true;
  return site && build;
}

export function detectWebsiteKind(prompt: string): WebsiteKind {
  const text = prompt.toLowerCase();
  if (/\b(restaurant|cafe|café|bistro|diner|menu)\b/.test(text)) return "restaurant";
  if (/\b(blog|magazine|journal|articles?)\b/.test(text)) return "blog";
  if (/\b(portfolio|freelancer|personal site)\b/.test(text)) return "portfolio";
  if (/\b(shop|store|e-?commerce|storefront|boutique)\b/.test(text) && !/\b(saas|landing|startup)\b/.test(text)) {
    return "shop";
  }
  return "landing";
}

export function generateWebsite(prompt: string): GeneratedWebsite {
  const kind = detectWebsiteKind(prompt);
  const name = extractName(prompt, FALLBACK_NAMES[kind]);
  const content = buildContent(kind, name);
  const payload = safeJson(toApiContent(content));
  const files: WebsiteFile[] = [
    { folder: "src", name: "index.html", language: "html", content: buildHtml(content) },
    { folder: "src", name: "styles.css", language: "css", content: buildCss(content) },
    { folder: "src", name: "script.js", language: "javascript", content: buildClientScript(payload) },
    { folder: "server", name: "server.js", language: "javascript", content: buildServer(content.name, payload) },
    { folder: "root", name: "package.json", language: "json", content: buildPackageJson(content) },
    { folder: "root", name: "README.md", language: "markdown", content: buildReadme(content) },
  ];

  return {
    kind,
    name: content.name,
    tagline: content.tagline,
    files,
    summary: buildSummary(content),
  };
}

function extractName(prompt: string, fallback: string): string {
  const quoted = prompt.match(/["“]([^"”]{2,48})["”]/);
  if (quoted) return cleanName(quoted[1]) || fallback;

  const called = prompt.match(/\b(?:called|named)\s+([^.,\n]{2,48})/i);
  if (called) {
    const cleaned = cleanName(called[1]);
    if (cleaned) return toTitle(cleaned);
  }

  const forMatch = prompt.match(/\bfor\s+([^.,\n]{2,48})/i);
  if (forMatch) {
    const cleaned = cleanName(forMatch[1]);
    if (cleaned && !/^(a|an|the|my|our)$/i.test(cleaned)) return toTitle(cleaned);
  }

  return fallback;
}

function cleanName(raw: string): string {
  const cut = raw.split(/\b(?:website|web site|site|page|landing page|with|using|that|featuring)\b/i)[0];
  const trimmed = cut.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  if (trimmed.length < 2 || trimmed.length > 40) return "";
  return trimmed;
}

function toTitle(value: string): string {
  if (/[A-Z]/.test(value)) return value;
  return value.replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
}

function slugify(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function photo(id: string, width: number, height: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

function buildContent(kind: WebsiteKind, name: string): SiteContent {
  const year = new Date().getFullYear();
  const sharedFaq = [
    { q: "Can I edit this site?", a: "Yes. The assistant wrote real files in this project. Change the copy in index.html or ask the assistant to revise a section." },
    { q: "Does the form work without a server?", a: "The preview stores nothing. Run npm start and the Express API accepts POST /api/messages." },
  ];

  if (kind === "restaurant") {
    return {
      kind,
      name,
      tagline: "Seasonal plates, a short wine list, and a room that stays busy.",
      lede: `${name} serves a tight menu that changes with the market. Reserve a table or look through tonight's plates.`,
      accent: "#f0a06a",
      accent2: "#f6e7d4",
      bg: "#140e0c",
      font: "Fraunces",
      heroImage: photo("1414235077428-338989a2e8c0", 1600, 1000),
      features: [
        { title: "Market menu", text: "A short card written the morning of service, not a novel of dishes." },
        { title: "Open kitchen", text: "The pass faces the room. You can hear the pans and still hold a conversation." },
        { title: "Late seating", text: "Two turns on Fridays. Walk-ins welcome at the bar after 9." },
      ],
      filters: ["all", "plates", "drinks"],
      items: [
        { title: "Charred leeks", text: "Brown butter, hazelnut, lemon.", meta: "$16", image: photo("1504674900247-0877df9cc836", 800, 600), tag: "plates" },
        { title: "Dry-aged steak", text: "Peppercorn jus, bitter greens.", meta: "$42", image: photo("1555396273-367ea4eb4db5", 800, 600), tag: "plates" },
        { title: "Olive oil cake", text: "Citrus, crème fraîche.", meta: "$12", image: photo("1565299624946-b28f40a0ae38", 800, 600), tag: "plates" },
        { title: "House spritz", text: "Bitter orange, sparkling wine.", meta: "$14", image: photo("1476224203421-9ac39bcb3327", 800, 600), tag: "drinks" },
      ],
      faqs: [
        { q: "Do you take reservations?", a: "Yes. Use the form and the API records the request. The dining room holds 42." },
        ...sharedFaq,
      ],
      cta: "Reserve a table",
      formLabel: `Reservation for ${name}`,
    };
  }

  if (kind === "shop") {
    return {
      kind,
      name,
      tagline: "A short rack of coats, totes, and things you will actually wear.",
      lede: `${name} is a small shop with a short catalog. Add a piece to your cart, then leave a note for the studio.`,
      accent: "#86efac",
      accent2: "#d9f99d",
      bg: "#07110d",
      font: "Outfit",
      heroImage: photo("1441986300917-64674bd600d8", 1600, 1000),
      features: [
        { title: "Small batches", text: "We restock slowly. If it is on the page, it is in the studio." },
        { title: "Packed by hand", text: "Orders leave twice a week. You get a note when the parcel is sealed." },
        { title: "Easy returns", text: "Fourteen days. Write us from the contact form." },
      ],
      filters: ["all", "apparel", "carry"],
      items: [
        { title: "Market coat", text: "Wool blend, unlined, true to size.", meta: "$180", image: photo("1483985988355-763728e1935b", 800, 600), tag: "apparel" },
        { title: "Weekender", text: "Soft leather, fits a change of clothes.", meta: "$240", image: photo("1607082348824-0a96f2a4b9da", 800, 600), tag: "carry" },
        { title: "Canvas tote", text: "Waxed canvas, brass hardware.", meta: "$78", image: photo("1556742049-0cfed4f6a45d", 800, 600), tag: "carry" },
        { title: "Studio tee", text: "Heavy cotton, washed once.", meta: "$42", image: photo("1523381210434-271e8be1f52b", 800, 600), tag: "apparel" },
      ],
      faqs: sharedFaq,
      cta: "Ask about an order",
      formLabel: `Note to ${name}`,
    };
  }

  if (kind === "blog") {
    return {
      kind,
      name,
      tagline: "Reporting on how people actually build things.",
      lede: `${name} publishes one careful piece a week: tools, towns, and the work in between.`,
      accent: "#93c5fd",
      accent2: "#c4b5fd",
      bg: "#0b1020",
      font: "Newsreader",
      heroImage: photo("1488646953014-85cb44e25828", 1600, 1000),
      features: [
        { title: "One essay a week", text: "No content calendar stuffed with filler. If it is here, someone reported it." },
        { title: "Sources in the open", text: "Every piece lists who was interviewed and what was measured." },
        { title: "A working archive", text: `Issues from ${year - 1} stay online. Nothing is quietly unpublished.` },
      ],
      filters: ["all", "craft", "places"],
      items: [
        { title: "The night shift compiler", text: "How a two-person team ships before breakfast.", meta: "12 min", image: photo("1461749280684-dccba630e2f6", 800, 600), tag: "craft" },
        { title: "Ports and packet boats", text: "A week on a harbor that still moves freight by hand.", meta: "9 min", image: photo("1507525428034-b723cf961d3e", 800, 600), tag: "places" },
        { title: "Type that survives the bus", text: "Choosing body text people can read at arm's length.", meta: "7 min", image: photo("1455390582262-044cdead277a", 800, 600), tag: "craft" },
        { title: "A town of repair shops", text: "What lasts when the high street refuses to specialize.", meta: "11 min", image: photo("1441974231531-c6227db76b6e", 800, 600), tag: "places" },
      ],
      faqs: sharedFaq,
      cta: "Send a tip",
      formLabel: `Write to ${name}`,
    };
  }

  if (kind === "portfolio") {
    return {
      kind,
      name,
      tagline: "Product design and front-end engineering for teams who ship.",
      lede: `${name} designs interfaces, then builds them. Selected work from the last three years is below.`,
      accent: "#f5c16c",
      accent2: "#fb7185",
      bg: "#101014",
      font: "Fraunces",
      heroImage: photo("1498050108023-c5249f4df085", 1600, 1000),
      features: [
        { title: "Research first", text: "A week with the people who use the product before any visual direction." },
        { title: "Built, not mocked", text: "Prototypes are HTML. Stakeholders click the real thing." },
        { title: "Handoff that sticks", text: "Tokens, states, and empty cases documented in the repo." },
      ],
      filters: ["all", "product", "web"],
      items: [
        { title: "Ledger", text: "A billing desk for a 40-person studio.", meta: "Product", image: photo("1551288049-bebda4e38f71", 800, 600), tag: "product" },
        { title: "Kindling", text: "Marketing site with a working signup API.", meta: "Web", image: photo("1460925895917-afdab827c52f", 800, 600), tag: "web" },
        { title: "Northline", text: "Scheduling tool for field crews.", meta: "Product", image: photo("1517694712202-14dd9538aa97", 800, 600), tag: "product" },
        { title: "Atlas Press", text: "Editorial homepage and archive.", meta: "Web", image: photo("1432821596592-e2c18b78144f", 800, 600), tag: "web" },
      ],
      faqs: sharedFaq,
      cta: "Start a project",
      formLabel: `Project inquiry for ${name}`,
    };
  }

  return {
    kind: "landing",
    name,
    tagline: "Ship the page, the API, and the first customer note in one project.",
    lede: `${name} helps small teams publish a site and collect real messages without standing up a second stack.`,
    accent: "#5eead4",
    accent2: "#38bdf8",
    bg: "#070b14",
    font: "Sora",
    heroImage: photo("1553877522-43269d4ea984", 1600, 1000),
    features: [
      { title: "One repo", text: "The page and the API live together. Preview the UI here, run Express when you want persistence." },
      { title: "Messages that land", text: "The contact form posts to /api/messages. Invalid payloads get a 400, not a silent drop." },
      { title: "Ready to restyle", text: "Colors are CSS variables. Ask the assistant to change a section instead of rewriting the stack." },
    ],
    filters: ["all", "studio", "team"],
    items: [
      { title: "Starter", text: "Landing page, contact API, and a single project.", meta: "$0", image: photo("1522202176988-66273c2fd55f", 800, 600), tag: "studio" },
      { title: "Team", text: "Shared inbox, custom domain notes, and priority replies.", meta: "$29", image: photo("1600880292203-757bb62b4baf", 800, 600), tag: "team" },
      { title: "Studio", text: "White-label pages and a webhook when a message arrives.", meta: "$79", image: photo("1552664730-d307ca884978", 800, 600), tag: "studio" },
    ],
    faqs: [
      { q: `What is included with ${name}?`, a: "A responsive page, an Express server, and seed content the browser can render even when the API is offline." },
      ...sharedFaq,
    ],
    cta: "Request a walkthrough",
    formLabel: `Talk to ${name}`,
  };
}

function toApiContent(content: SiteContent) {
  return {
    name: content.name,
    kind: content.kind,
    tagline: content.tagline,
    lede: content.lede,
    features: content.features,
    items: content.items.map(({ title, text, meta, tag }) => ({ title, text, meta, tag })),
  };
}

function buildHtml(content: SiteContent): string {
  const nav = ["Work", "Details", "Questions", "Contact"]
    .map((label) => `<a href="#${label.toLowerCase()}">${label}</a>`)
    .join("");
  const features = content.features
    .map((feature) => `<article class="feature"><h3>${esc(feature.title)}</h3><p>${esc(feature.text)}</p></article>`)
    .join("");
  const filters = content.filters
    .map((filter, index) => `<button type="button" data-filter="${esc(filter)}" class="${index === 0 ? "active" : ""}">${esc(filter)}</button>`)
    .join("");
  const cards = content.items
    .map((item) => {
      const action = content.kind === "shop"
        ? `<button type="button" data-add data-title="${esc(item.title)}" data-price="${esc(item.meta)}">Add to cart</button>`
        : `<span class="meta">${esc(item.meta)}</span>`;
      return `<article class="card" data-tag="${esc(item.tag)}">
        <img src="${esc(item.image)}" alt="${esc(item.title)}" width="800" height="600" loading="lazy" />
        <div class="card-body">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
          ${action}
        </div>
      </article>`;
    })
    .join("");
  const faqs = content.faqs
    .map((faq) => `<details><summary>${esc(faq.q)}</summary><p>${esc(faq.a)}</p></details>`)
    .join("");
  const cartButton = content.kind === "shop";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(content.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(content.font)}:wght@500;700&family=Source+Sans+3:wght@400;600&display=swap" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
  <header class="site-header">
    <a class="logo" href="#top">${esc(content.name)}</a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-label="Open menu">Menu</button>
    <nav class="site-nav">${nav}</nav>
    ${cartButton ? `<button type="button" class="cart-toggle">Cart <span id="cart-count">0</span></button>` : ""}
  </header>
  ${content.kind === "shop" ? `<aside id="cart" hidden><h2>Cart</h2><ul id="cart-lines"></ul></aside>` : ""}
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${esc(content.kind)}</p>
        <h1>${esc(content.tagline)}</h1>
        <p class="lede">${esc(content.lede)}</p>
        <a class="button" href="#contact">${esc(content.cta)}</a>
        <p id="api-status" class="status">Loading API status…</p>
      </div>
      <img class="hero-image" src="${esc(content.heroImage)}" alt="" width="1600" height="1000" />
    </section>
    <section id="details" class="band">
      <h2>Why ${esc(content.name)}</h2>
      <div class="feature-grid">${features}</div>
    </section>
    <section id="work" class="catalog">
      <div class="section-head">
        <h2>${content.kind === "blog" ? "Latest" : content.kind === "restaurant" ? "Tonight" : "Selected"}</h2>
        <div class="filters">${filters}</div>
      </div>
      <div class="card-grid">${cards}</div>
    </section>
    <section id="questions" class="faq">
      <h2>Questions</h2>
      ${faqs}
    </section>
    <section id="contact" class="contact">
      <div>
        <h2>${esc(content.formLabel)}</h2>
        <p>Posts to <code>/api/messages</code>. The preview still confirms the form when the server is off.</p>
      </div>
      <form id="contact-form">
        <label>Name<input name="name" autocomplete="name" required /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <label>Message<textarea name="message" rows="4" required></textarea></label>
        <button type="submit">${esc(content.cta)}</button>
        <p id="form-status" class="status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <span>${esc(content.name)}</span>
    <span>Full-stack starter · ${new Date().getFullYear()}</span>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function buildCss(content: SiteContent): string {
  return `:root {
  --bg: ${content.bg};
  --ink: #f4f1ea;
  --muted: #b7b1a6;
  --accent: ${content.accent};
  --accent-2: ${content.accent2};
  --card: rgba(255, 255, 255, 0.04);
  --line: rgba(255, 255, 255, 0.12);
  --font: "${content.font}", Georgia, serif;
  --sans: "Source Sans 3", "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 50%), var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.site-header, .hero, .band, .catalog, .faq, .contact, footer {
  width: min(1100px, calc(100% - 2rem));
  margin-inline: auto;
}
.site-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 2;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
}
.logo { font-family: var(--font); font-weight: 700; text-decoration: none; font-size: 1.2rem; white-space: nowrap; }
.site-nav { display: flex; gap: 1rem; margin-left: auto; }
.site-nav a { text-decoration: none; color: var(--muted); }
.site-nav a:hover { color: var(--ink); }
.nav-toggle, .cart-toggle, button, .button {
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: #102016;
  font-weight: 600;
  padding: 0.7rem 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.nav-toggle { display: none; background: transparent; color: var(--ink); border: 1px solid var(--line); }
.cart-toggle { gap: 0.35rem; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; align-items: center; padding: 2rem 0 3rem; }
.hero h1, .band h2, .catalog h2, .faq h2, .contact h2 { font-family: var(--font); line-height: 1.1; letter-spacing: -0.03em; }
.hero h1 { font-size: clamp(2.4rem, 5vw, 4.4rem); margin: 0.2rem 0 0.8rem; }
.eyebrow { text-transform: uppercase; letter-spacing: 0.16em; color: var(--accent); font-size: 0.75rem; }
.lede { color: var(--muted); font-size: 1.1rem; max-width: 38rem; }
.hero-image { width: 100%; height: 420px; object-fit: cover; border-radius: 1.4rem; border: 1px solid var(--line); }
.band, .catalog, .faq, .contact { padding: 1rem 0 3rem; }
.feature-grid, .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.card-grid { grid-template-columns: repeat(2, 1fr); }
.feature, .card, details, form { background: var(--card); border: 1px solid var(--line); border-radius: 1rem; }
.feature, .card-body, details, form { padding: 1rem 1.1rem; }
.feature h3, .card h3 { margin: 0 0 0.35rem; }
.feature p, .card p, details p { margin: 0; color: var(--muted); }
.card img { height: 190px; width: 100%; object-fit: cover; border-radius: 1rem 1rem 0 0; }
.section-head, .contact { display: flex; justify-content: space-between; gap: 1rem; align-items: center; flex-wrap: wrap; }
.section-head { margin-bottom: 1rem; }
.contact { align-items: start; }
.filters { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.filters button { background: transparent; color: var(--ink); border: 1px solid var(--line); text-transform: capitalize; }
.filters button.active { background: var(--accent); color: #102016; }
.meta { color: var(--accent-2); font-weight: 600; }
#cart { width: min(1100px, calc(100% - 2rem)); margin: 0.25rem auto 0; padding: 0.8rem 1rem; border: 1px solid var(--line); border-radius: 1rem; background: var(--card); }
#cart-lines { margin: 0; padding-left: 1rem; }
form { display: grid; gap: 0.7rem; min-width: min(100%, 360px); }
label { display: grid; gap: 0.3rem; font-size: 0.9rem; }
input, textarea {
  width: 100%;
  border-radius: 0.7rem;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.25);
  color: var(--ink);
  padding: 0.7rem 0.8rem;
  font: inherit;
}
.status { color: var(--muted); min-height: 1.2rem; font-size: 0.9rem; }
footer { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 0 2rem; color: var(--muted); }
@media (max-width: 800px) {
  .hero, .feature-grid, .card-grid, .contact, .section-head, footer { grid-template-columns: 1fr; display: grid; }
  .site-nav { display: none; }
  .site-nav.open { display: flex; flex-direction: column; position: absolute; top: 64px; left: 0; right: 0; background: var(--bg); padding: 1rem; border-bottom: 1px solid var(--line); }
  .nav-toggle { display: inline-flex; margin-left: auto; }
  .logo { font-size: 1.05rem; }
  .site-nav.open { z-index: 3; }
  .hero-image { height: 240px; }
}
`;
}

function buildClientScript(payload: string): string {
  return `const LOCAL_CONTENT = ${payload};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  const toggle = $(".nav-toggle");
  const nav = $(".site-nav");
  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(Boolean(open)));
  });

  $$("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const tag = button.getAttribute("data-filter");
      $$("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
      $$("[data-tag]").forEach((card) => {
        const itemTag = card.getAttribute("data-tag");
        card.hidden = tag !== "all" && itemTag !== tag;
      });
    });
  });

  const form = $("#contact-form");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = $("#form-status");
    const data = Object.fromEntries(new FormData(form));
    if (!data.name || !data.email || !data.message) {
      if (status) status.textContent = "Name, email, and message are required.";
      return;
    }
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      if (status) status.textContent = "Sent. The API stored your message.";
    } catch {
      if (status) status.textContent = "Preview mode: message checked locally. Run npm start to store it.";
    }
  });

  const count = $("#cart-count");
  const cart = $("#cart");
  const lines = $("#cart-lines");
  const bag = [];
  const renderCart = () => {
    if (!count || !lines) return;
    count.textContent = String(bag.reduce((total, item) => total + item.qty, 0));
    lines.replaceChildren();
    if (!bag.length) {
      const empty = document.createElement("li");
      empty.textContent = "Your cart is empty.";
      lines.append(empty);
      return;
    }
    bag.forEach((item) => {
      const row = document.createElement("li");
      row.textContent = item.qty + " × " + item.title + " — " + item.price;
      lines.append(row);
    });
  };
  $$("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.getAttribute("data-title") || "Item";
      const price = button.getAttribute("data-price") || "";
      const found = bag.find((item) => item.title === title);
      if (found) found.qty += 1;
      else bag.push({ title, price, qty: 1 });
      renderCart();
      if (cart) cart.hidden = false;
    });
  });
  $(".cart-toggle")?.addEventListener("click", () => {
    if (cart) cart.hidden = !cart.hidden;
  });
  renderCart();

  const badge = $("#api-status");
  fetch("/api/content")
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((remote) => {
      if (badge) badge.textContent = remote?.name ? "API connected · " + remote.name : "API connected";
    })
    .catch(() => {
      if (badge) badge.textContent = "Preview data · " + LOCAL_CONTENT.name + " · run npm start for the API";
    });
});
`;
}

function buildServer(name: string, payload: string): string {
  const label = JSON.stringify(name.split("`").join("").replace(/["\\]/g, "") + " running at http://localhost:");
  return `const express = require("express");
const cors = require("cors");
const path = require("path");

const CONTENT = ${payload};
const messages = [];
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../src")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, site: CONTENT.name });
});

app.get("/api/content", (_req, res) => {
  res.json(CONTENT);
});

app.get("/api/messages", (_req, res) => {
  res.json({ messages });
});

app.post("/api/messages", (req, res) => {
  const nameValue = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!nameValue || !email || !message || !email.includes("@")) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  const entry = { name: nameValue, email, message, receivedAt: new Date().toISOString() };
  messages.push(entry);
  return res.status(201).json({ ok: true, entry });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(${label} + port);
});
`;
}

function buildPackageJson(content: SiteContent): string {
  return JSON.stringify(
    {
      name: slugify(content.name),
      version: "1.0.0",
      private: true,
      description: `${content.name} — ${content.tagline}`,
      main: "server/server.js",
      scripts: {
        start: "node server/server.js",
        dev: "node server/server.js",
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

function buildReadme(content: SiteContent): string {
  return `# ${content.name}

${content.tagline}

Generated by the Lunor.AI full-stack website generator for the Web Development assistant.

## Files

- \`src/index.html\`, \`src/styles.css\`, \`src/script.js\` — the site. It previews in the editor and uses local content if the API is offline.
- \`server/server.js\` — Express API

## API

- \`GET /api/health\`
- \`GET /api/content\`
- \`GET /api/messages\`
- \`POST /api/messages\` with \`{ "name", "email", "message" }\`

## Run locally

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000
`;
}

function buildSummary(content: SiteContent): string {
  return `Built **${content.name}**, a full-stack ${content.kind} website, and applied the files to this project.

**Frontend** — live in the preview
- \`src/index.html\`
- \`src/styles.css\`
- \`src/script.js\` renders the page and keeps working if \`/api\` is offline

**Backend**
- \`server/server.js\` serves the site and these routes:
  - \`GET /api/health\`
  - \`GET /api/content\`
  - \`POST /api/messages\`

Run it locally with \`npm install\` then \`npm start\`, and open http://localhost:3000.

Ask me to change the copy, colors, or a section and I will edit these files.`;
}
