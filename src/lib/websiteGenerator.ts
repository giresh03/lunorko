/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a previewable frontend plus a zero-dependency Node API.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "store" | "blog" | "saas";

export interface GeneratedFile {
  filename: string;
  language: string;
  code: string;
}

export interface GeneratedWebsite {
  title: string;
  kind: WebsiteKind;
  tagline: string;
  files: GeneratedFile[];
}

export interface WebsitePreset {
  id: WebsiteKind;
  label: string;
  prompt: string;
}

export const WEBSITE_GENERATOR_PRESETS: WebsitePreset[] = [
  { id: "landing", label: "Landing", prompt: "Build a full-stack landing website for Northstar Studio" },
  { id: "portfolio", label: "Portfolio", prompt: "Build a full-stack portfolio website for Maya Chen" },
  { id: "store", label: "Store", prompt: "Build a full-stack online store website for Field & Fern" },
  { id: "restaurant", label: "Restaurant", prompt: "Build a full-stack restaurant website for Olive & Oak" },
  { id: "blog", label: "Blog", prompt: "Build a full-stack blog website for Signal Desk" },
  { id: "saas", label: "SaaS", prompt: "Build a full-stack SaaS website for Lumen" },
];

interface CatalogItem {
  name: string;
  detail: string;
  meta: string;
  image: string;
}

interface SiteProfile {
  kind: WebsiteKind;
  fallbackBrand: string;
  kicker: string;
  headline: (brand: string) => string;
  lede: string;
  catalogTitle: string;
  catalogLead: string;
  primaryCta: string;
  secondaryCta: string;
  accent: string;
  accentInk: string;
  heroImage: string;
  features: { title: string; body: string }[];
  items: CatalogItem[];
}

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const PROFILES: Record<WebsiteKind, SiteProfile> = {
  landing: {
    kind: "landing",
    fallbackBrand: "Northstar Studio",
    kicker: "Studio",
    headline: (brand) => `${brand} builds sites people finish reading.`,
    lede: "Strategy, design, and a working full-stack build — shipped as one calm, fast website.",
    catalogTitle: "Selected work",
    catalogLead: "Recent engagements, served by the project API.",
    primaryCta: "Start a project",
    secondaryCta: "See the work",
    accent: "#e7f27a",
    accentInk: "#1a1f0a",
    heroImage: img("1498050108023-c5249f4df085"),
    features: [
      { title: "One codebase", body: "HTML, CSS, and JavaScript on the client. A Node API on the server. No framework install." },
      { title: "Content from the API", body: "The page renders local data instantly, then refreshes from GET /api/content when the server is running." },
      { title: "Inbox included", body: "The contact form posts to /api/contact and the server keeps messages in memory while it runs." },
    ],
    items: [
      { name: "Harbor Market", detail: "A catalog and weekly ordering page for a coastal grocer.", meta: "Commerce", image: img("1441986300917-64674bd600d8", 800) },
      { name: "Kindred Clinic", detail: "Appointment-led marketing site with a calm reading rhythm.", meta: "Health", image: img("1576091160399-112ba8d25d1d", 800) },
      { name: "Atlas Freight", detail: "Route stories and a quote form for a regional carrier.", meta: "Logistics", image: img("1586528116311-ad8dd3c8310d", 800) },
    ],
  },
  portfolio: {
    kind: "portfolio",
    fallbackBrand: "Maya Chen",
    kicker: "Portfolio",
    headline: (brand) => `${brand} — product design and interface engineering.`,
    lede: "A personal site with project notes, a short bio, and a contact API you can run locally.",
    catalogTitle: "Projects",
    catalogLead: "Case notes loaded from the API, with a built-in fallback.",
    primaryCta: "Book a call",
    secondaryCta: "View projects",
    accent: "#9ad7ff",
    accentInk: "#062033",
    heroImage: img("1558618666-fcd25c85cd64"),
    features: [
      { title: "Selected work", body: "Each project card is data, not hardcoded markup, so the API and the page stay in sync." },
      { title: "Plain stack", body: "Open index.html for the preview. Run node server.js when you want the API." },
      { title: "Ready to extend", body: "Add a project in server.js and the grid updates the next time the page fetches /api/content." },
    ],
    items: [
      { name: "Field Notes", detail: "A reading app for long essays, with offline highlights.", meta: "2025", image: img("1512820790803-83ca734da794", 800) },
      { name: "Lumen Pay", detail: "Checkout flow redesigned around a single decision per screen.", meta: "2024", image: img("1556742049-0cfed4f6a45d", 800) },
      { name: "North Trail", detail: "Trail maps and trip logs for a small outdoor club.", meta: "2024", image: img("1469474968028-56623f02e42e", 800) },
    ],
  },
  restaurant: {
    kind: "restaurant",
    fallbackBrand: "Olive & Oak",
    kicker: "Dining room",
    headline: (brand) => `${brand} — supper, wood fire, and a short menu.`,
    lede: "Seasonal plates, a reservation note, and a menu that the API can update without touching the layout.",
    catalogTitle: "Tonight's menu",
    catalogLead: "Dishes come from GET /api/content.",
    primaryCta: "Request a table",
    secondaryCta: "Read the menu",
    accent: "#f0b429",
    accentInk: "#2a1c05",
    heroImage: img("1414235077428-338989a2e8c0"),
    features: [
      { title: "Wood-fired kitchen", body: "A short menu that changes with the market. Prices live in the API payload." },
      { title: "Reservations", body: "The form posts a note to /api/contact so the desk can read it from the server log." },
      { title: "Open late Friday", body: "Hours and the address sit in the footer and in the JSON the server returns." },
    ],
    items: [
      { name: "Charred lemon chicken", detail: "Rosemary, pan jus, and bitter greens.", meta: "$28", image: img("1598103442097-8b74394b95c6", 800) },
      { name: "Tomato and burrata", detail: "Warm bread, basil oil, cracked pepper.", meta: "$16", image: img("1565299624946-b28f40a0ae38", 800) },
      { name: "Olive oil cake", detail: "Citrus zest and brown-butter cream.", meta: "$12", image: img("1464349095431-e9a21285b5f3", 800) },
    ],
  },
  store: {
    kind: "store",
    fallbackBrand: "Field & Fern",
    kicker: "Shop",
    headline: (brand) => `${brand} — goods for a slower kitchen.`,
    lede: "A small catalog with prices, photos, and a cart count that talks to the API when it is available.",
    catalogTitle: "In the shop",
    catalogLead: "Products are served by the API and cached in the page.",
    primaryCta: "Shop the edit",
    secondaryCta: "Ask about an order",
    accent: "#b7e4c7",
    accentInk: "#102117",
    heroImage: img("1441986300917-64674bd600d8"),
    features: [
      { title: "Catalog API", body: "GET /api/content returns products. The page still renders if you only open the HTML preview." },
      { title: "Cart on this device", body: "Adding an item updates a local count and posts the selection with the contact form." },
      { title: "No extra packages", body: "The server is Node's http module. npm install is not required." },
    ],
    items: [
      { name: "Linen apron", detail: "Stonewashed, two pockets, brass hardware.", meta: "$68", image: img("1556909114-f6e7ad7d3136", 800) },
      { name: "Stoneware bowl", detail: "Speckled clay, sized for a weeknight soup.", meta: "$42", image: img("1610701596007-11502861dcfa", 800) },
      { name: "Olive oil, 500ml", detail: "Early harvest, peppery finish.", meta: "$24", image: img("1474979266404-7eaacbcd87c5", 800) },
    ],
  },
  blog: {
    kind: "blog",
    fallbackBrand: "Signal Desk",
    kicker: "Journal",
    headline: (brand) => `${brand} — notes on building for the web.`,
    lede: "Essays with a reading list API, a newsletter form, and a layout that stays readable on a phone.",
    catalogTitle: "Latest notes",
    catalogLead: "Posts are JSON from the server.",
    primaryCta: "Read the latest",
    secondaryCta: "Subscribe",
    accent: "#ffd6a5",
    accentInk: "#2c2116",
    heroImage: img("1455390582262-044cdead277a"),
    features: [
      { title: "Posts as data", body: "Add an entry to the content array in server.js and the index lists it." },
      { title: "Subscribe", body: "The form stores an email through POST /api/contact." },
      { title: "Fast preview", body: "The editor preview inlines CSS and JS, so the journal renders before the API is up." },
    ],
    items: [
      { name: "Ship the API with the page", detail: "Why a contact route belongs in the first commit.", meta: "6 min", image: img("1516321318423-f06f85e504b3", 800) },
      { name: "Type that can be read", detail: "A short argument for fewer sizes and more line-height.", meta: "4 min", image: img("1457369804613-52c61a468e7d", 800) },
      { name: "Preview without a bundler", detail: "Vanilla files the in-browser preview can run immediately.", meta: "5 min", image: img("1461749280684-dccba630e2f6", 800) },
    ],
  },
  saas: {
    kind: "saas",
    fallbackBrand: "Lumen",
    kicker: "Product",
    headline: (brand) => `${brand} keeps the week's work in one quiet board.`,
    lede: "A product site with pricing, a feature grid, and a demo-request API.",
    catalogTitle: "Plans",
    catalogLead: "Pricing rows are content, so the server can change them.",
    primaryCta: "Request a demo",
    secondaryCta: "Compare plans",
    accent: "#c4b5fd",
    accentInk: "#1b1033",
    heroImage: img("1553877522-43269d4ea984"),
    features: [
      { title: "Shared boards", body: "Tasks, owners, and a weekly review that fits on one screen." },
      { title: "Demo requests", body: "POST /api/contact stores the request and returns a confirmation JSON." },
      { title: "Health check", body: "GET /api/health tells you the API process is up." },
    ],
    items: [
      { name: "Starter", detail: "3 seats, one board, email support.", meta: "$0", image: img("1552664730-d307ca884978", 800) },
      { name: "Team", detail: "Unlimited boards and a shared weekly review.", meta: "$18", image: img("1600880292203-757bb62b4baf", 800) },
      { name: "Studio", detail: "SSO-ready workspace and a named contact.", meta: "$42", image: img("1542744173-8e7e91415657", 800) },
    ],
  },
};

const KIND_WORDS: { kind: WebsiteKind; words: string[] }[] = [
  { kind: "restaurant", words: ["restaurant", "cafe", "café", "bakery", "bistro", "diner", "menu"] },
  { kind: "store", words: ["store", "shop", "ecommerce", "e-commerce", "boutique", "catalog"] },
  { kind: "blog", words: ["blog", "magazine", "newsletter", "journal"] },
  { kind: "portfolio", words: ["portfolio", "freelancer", "personal site", "case study"] },
  { kind: "saas", words: ["saas", "dashboard", "startup", "pricing", "software"] },
  { kind: "landing", words: ["landing", "agency", "marketing", "studio", "company"] },
];

export function isWebsiteGenerationRequest(prompt: string): boolean {
  const text = prompt.trim();
  if (!text) return false;
  if (/^\s*(explain|what|why|how|describe|compare|debug|fix|error)\b/i.test(text)) return false;
  if (/\bwebsite generator\b/i.test(text)) return true;
  const action = /\b(build|create|generate|make|scaffold|design|launch)\b/i;
  const noun = /\b(website|web\s*site|landing\s+page|portfolio|online\s+store|e-?commerce|restaurant|blog|saas|full[-\s]?stack(?:\s+(?:site|website|app))?|web\s*app)\b/i;
  return action.test(text) && noun.test(text);
}

export function detectWebsiteKind(prompt: string): WebsiteKind {
  const text = prompt.toLowerCase();
  for (const rule of KIND_WORDS) {
    if (rule.words.some((word) => text.includes(word))) return rule.kind;
  }
  return "landing";
}

function cleanBrand(raw: string): string {
  const trimmed = raw
    .replace(/[<>]/g, "")
    .replace(/\b(full[-\s]?stack|website|web\s*site|landing\s+page|online\s+store|site|app|please)\b.*$/i, "")
    .replace(/^(a|an|the|my)\s+/i, "")
    .trim()
    .replace(/[\s.,]+$/g, "");
  return trimmed.slice(0, 48);
}

export function extractBrand(prompt: string, fallback: string): string {
  const quoted = prompt.match(/["“']([^"”']{2,60})["”']/);
  if (quoted) {
    const name = cleanBrand(quoted[1]);
    if (name) return name;
  }
  const named = prompt.match(/\b(?:called|named|for)\s+([^.,!?\n]{2,60})/i);
  if (named) {
    const name = cleanBrand(named[1]);
    if (name.length >= 2) return name;
  }
  return fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function buildHtml(brand: string, profile: SiteProfile, headline: string): string {
  const safeBrand = escapeHtml(brand);
  const cards = profile.items
    .map(
      (item) => `        <article class="card">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" />
          <div class="card-body">
            <p class="meta">${escapeHtml(item.meta)}</p>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.detail)}</p>
          </div>
        </article>`
    )
    .join("\n");
  const features = profile.features
    .map(
      (feature, index) => `        <article>
          <span>0${index + 1}</span>
          <h3>${escapeHtml(feature.title)}</h3>
          <p>${escapeHtml(feature.body)}</p>
        </article>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeBrand}</title>
  <meta name="description" content="${escapeHtml(profile.lede)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@380;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body data-themed>
  <header class="site-header">
    <a class="brand" href="#top">${safeBrand}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav">
      <a href="#work">${escapeHtml(profile.catalogTitle)}</a>
      <a href="#practice">Practice</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="kicker">${escapeHtml(profile.kicker)}</p>
        <h1>${escapeHtml(headline)}</h1>
        <p class="lede">${escapeHtml(profile.lede)}</p>
        <div class="hero-actions">
          <a class="button" href="#contact">${escapeHtml(profile.primaryCta)}</a>
          <a class="button button-ghost" href="#work">${escapeHtml(profile.secondaryCta)}</a>
        </div>
        <p class="api-status" id="api-status">Preview mode — API not connected yet.</p>
      </div>
      <figure class="hero-figure">
        <img src="${profile.heroImage}" alt="" />
      </figure>
    </section>

    <section class="band" id="practice">
      <div class="section-heading">
        <p class="kicker">How it is built</p>
        <h2>Frontend, API, and a server you can run.</h2>
      </div>
      <div class="feature-grid">
${features}
      </div>
    </section>

    <section class="band" id="work">
      <div class="section-heading">
        <p class="kicker">From the API</p>
        <h2>${escapeHtml(profile.catalogTitle)}</h2>
        <p>${escapeHtml(profile.catalogLead)}</p>
      </div>
      <div class="card-grid" id="catalog">
${cards}
      </div>
    </section>

    <section class="band contact-band" id="contact">
      <div>
        <p class="kicker">Contact</p>
        <h2>Send a note to ${safeBrand}.</h2>
        <p>Posted to <code>/api/contact</code>. In preview, the note stays on this page.</p>
      </div>
      <form id="contact-form">
        <label>Name<input name="name" required maxlength="80" /></label>
        <label>Email<input name="email" type="email" required maxlength="120" /></label>
        <label>Message<textarea name="message" rows="4" required maxlength="600"></textarea></label>
        <button class="button" type="submit">Send</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>

  <footer>
    <span>${safeBrand}</span>
    <span id="year"></span>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function buildCss(profile: SiteProfile): string {
  return `/* ${profile.fallbackBrand} — generated full-stack site */
:root {
  --bg: #14140f;
  --bg-raise: #1d1d16;
  --ink: #f4f1e8;
  --muted: #b7b2a6;
  --line: rgba(244, 241, 232, 0.14);
  --accent: ${profile.accent};
  --accent-ink: ${profile.accentInk};
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  --serif: "Fraunces", Georgia, serif;
  --sans: "Outfit", "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background:
    radial-gradient(900px 420px at 90% -10%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 60%),
    var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.5;
}
img { display: block; width: 100%; height: 100%; object-fit: cover; }
a { color: inherit; }
code { font-size: 0.92em; color: var(--accent); }

.site-header, main, footer { width: min(1120px, calc(100% - 32px)); margin-inline: auto; }
.site-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 0 8px;
}
.brand { font-weight: 600; letter-spacing: -0.03em; text-decoration: none; }
#site-nav { display: flex; gap: 18px; margin-left: auto; }
#site-nav a { color: var(--muted); text-decoration: none; font-size: 0.95rem; }
#site-nav a:hover { color: var(--ink); }
.nav-toggle {
  display: none;
  margin-left: auto;
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 12px;
}

.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px; align-items: end; padding: 42px 0 20px; }
.kicker { margin: 0 0 10px; color: var(--accent); letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.75rem; }
h1, h2, h3 { font-family: var(--serif); font-weight: 560; letter-spacing: -0.03em; }
h1 { margin: 0; font-size: clamp(2.6rem, 5vw, 4.6rem); line-height: 0.96; }
.lede { max-width: 38rem; color: var(--muted); font-size: 1.08rem; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 22px 0; }
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--accent);
  color: var(--accent-ink);
  text-decoration: none;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.button-ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.api-status, #form-status { color: var(--muted); font-size: 0.92rem; min-height: 1.2em; }
.hero-figure {
  margin: 0;
  height: min(520px, 70vw);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.band { padding: 56px 0; }
.section-heading { max-width: 38rem; margin-bottom: 24px; }
.section-heading h2 { margin: 0 0 8px; font-size: clamp(2rem, 3vw, 3rem); }
.section-heading p { color: var(--muted); }
.feature-grid, .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature-grid article, .card {
  background: color-mix(in srgb, var(--bg-raise) 88%, white 0%);
  border: 1px solid var(--line);
  border-radius: 22px;
  overflow: hidden;
}
.feature-grid article { padding: 22px; }
.feature-grid span { color: var(--accent); font-size: 0.8rem; letter-spacing: 0.08em; }
.feature-grid p, .card-body p { color: var(--muted); }
.card img { aspect-ratio: 4 / 3; }
.card-body { padding: 16px 16px 18px; }
.card-body h3 { margin: 4px 0; font-size: 1.35rem; }
.meta { margin: 0; color: var(--accent); font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; }

.contact-band { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 28px; align-items: start; }
form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; color: var(--muted); font-size: 0.92rem; }
input, textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #10110d;
  color: var(--ink);
  font: inherit;
  padding: 12px 14px;
}
footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 0 32px;
  color: var(--muted);
  border-top: 1px solid var(--line);
}

@media (max-width: 800px) {
  .hero, .feature-grid, .card-grid, .contact-band { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  #site-nav {
    display: none;
    position: absolute;
    top: 64px;
    right: 16px;
    left: 16px;
    padding: 12px;
    border-radius: 16px;
    background: var(--bg-raise);
    border: 1px solid var(--line);
  }
  #site-nav.open { display: grid; }
}
`;
}

function buildAppJs(profile: SiteProfile, content: Record<string, unknown>): string {
  return `/* Browser app for the generated site. Falls back to embedded content when the API is offline. */
(function () {
  var CONTENT = ${JSON.stringify(content, null, 2)};

  var catalog = document.getElementById("catalog");
  var status = document.getElementById("api-status");
  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var year = document.getElementById("year");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (year) year.textContent = String(new Date().getFullYear());

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function render(data) {
    if (!catalog || !data.items) return;
    catalog.innerHTML = data.items.map(function (item) {
      return '<article class="card"><img src="' + item.image + '" alt="' + item.name + '" /><div class="card-body"><p class="meta">' + item.meta + '</p><h3>' + item.name + '</h3><p>' + item.detail + '</p></div></article>';
    }).join("");
  }

  render(CONTENT);

  fetch("/api/content")
    .then(function (response) { if (!response.ok) throw new Error("offline"); return response.json(); })
    .then(function (data) {
      render(data);
      if (status) status.textContent = "Live API — content loaded from /api/content.";
    })
    .catch(function () {
      if (status) status.textContent = "Preview mode — showing built-in ${profile.kind} content.";
    });

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var body = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
        site: CONTENT.brand
      };
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
        .then(function (response) { if (!response.ok) throw new Error("offline"); return response.json(); })
        .then(function (data) {
          if (formStatus) formStatus.textContent = data.message || "Sent.";
          form.reset();
        })
        .catch(function () {
          if (formStatus) formStatus.textContent = "Saved on this page. Start the API with node server.js to store it.";
        });
    });
  }
})();
`;
}

function buildServerJs(content: Record<string, unknown>): string {
  return `/**
 * Zero-dependency API for the generated website.
 * Run: node server.js
 * The browser preview skips this file.
 */
(function () {
  if (typeof window !== "undefined") return;

  var http = require("http");
  var fs = require("fs");
  var path = require("path");

  var CONTENT = ${JSON.stringify(content, null, 2)};
  var messages = [];
  var PORT = process.env.PORT || 3000;

  var FILES = {
    "/": "index.html",
    "/index.html": "index.html",
    "/style.css": "style.css",
    "/app.js": "app.js"
  };

  var TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8"
  };

  function send(res, status, payload, type) {
    res.writeHead(status, {
      "Content-Type": type || "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });
    res.end(typeof payload === "string" ? payload : JSON.stringify(payload));
  }

  function readBody(req) {
    return new Promise(function (resolve) {
      var chunks = "";
      req.on("data", function (chunk) {
        chunks += chunk;
        if (chunks.length > 1e6) req.destroy();
      });
      req.on("end", function () { resolve(chunks); });
    });
  }

  var server = http.createServer(function (req, res) {
    var url = (req.url || "/").split("?")[0];
    if (req.method === "OPTIONS") return send(res, 204, "");
    if (req.method === "GET" && url === "/api/health") {
      return send(res, 200, { ok: true, service: CONTENT.brand });
    }
    if (req.method === "GET" && url === "/api/content") {
      return send(res, 200, CONTENT);
    }
    if (req.method === "GET" && url === "/api/contact") {
      return send(res, 200, { messages: messages });
    }
    if (req.method === "POST" && url === "/api/contact") {
      readBody(req).then(function (raw) {
        var note = {};
        try { note = JSON.parse(raw || "{}"); } catch (error) { note = {}; }
        if (!note.name || !note.email || !note.message) {
          return send(res, 400, { error: "Name, email, and message are required." });
        }
        var saved = {
          name: String(note.name).slice(0, 80),
          email: String(note.email).slice(0, 120),
          message: String(note.message).slice(0, 600),
          at: new Date().toISOString()
        };
        messages.push(saved);
        console.log("New message for " + CONTENT.brand + ":", saved.email);
        send(res, 201, { ok: true, message: "Thanks, " + saved.name + ". The note is stored on the server." });
      });
      return;
    }

    var filename = FILES[url];
    if (req.method === "GET" && filename) {
      var filePath = path.join(__dirname, filename);
      fs.readFile(filePath, function (error, data) {
        if (error) return send(res, 404, { error: "Missing " + filename + ". Keep the generated files beside server.js." });
        send(res, 200, data.toString(), TYPES[path.extname(filename)] || "text/plain");
      });
      return;
    }

    send(res, 404, { error: "Not found" });
  });

  server.listen(PORT, function () {
    console.log(CONTENT.brand + " API on http://localhost:" + PORT);
  });
})();
`;
}

function buildPackageJson(brand: string, kind: WebsiteKind): string {
  return JSON.stringify(
    {
      name: slugify(brand),
      version: "1.0.0",
      private: true,
      description: `${brand} — full-stack ${kind} website generated by Lunor.AI`,
      main: "server.js",
      scripts: {
        start: "node server.js",
        dev: "node server.js",
      },
    },
    null,
    2
  ) + "\n";
}

function buildReadme(brand: string, kind: WebsiteKind): string {
  return `# ${brand}

Full-stack ${kind} website generated by the Lunor.AI Web Development assistant.

## Files

- \`index.html\` — page structure
- \`style.css\` — layout and theme
- \`app.js\` — renders API content and submits the contact form
- \`server.js\` — Node API with no npm dependencies
- \`package.json\` — \`npm start\` runs the API

## Run the API

    node server.js

Open http://localhost:3000

## API

- \`GET /api/health\`
- \`GET /api/content\`
- \`POST /api/contact\` with \`{ "name", "email", "message" }\`

The in-editor preview shows the page without the API. \`app.js\` uses built-in content until \`/api/content\` responds.
`;
}

export function generateFullStackWebsite(prompt: string): GeneratedWebsite {
  const kind = detectWebsiteKind(prompt);
  const profile = PROFILES[kind];
  const brand = extractBrand(prompt, profile.fallbackBrand);
  const headline = profile.headline(brand);
  const content = {
    brand,
    kind,
    tagline: headline,
    lede: profile.lede,
    items: profile.items,
  };

  const files: GeneratedFile[] = [
    { filename: "index.html", language: "html", code: buildHtml(brand, profile, headline) },
    { filename: "style.css", language: "css", code: buildCss(profile) },
    { filename: "app.js", language: "javascript", code: buildAppJs(profile, content) },
    { filename: "server.js", language: "javascript", code: buildServerJs(content) },
    { filename: "package.json", language: "json", code: buildPackageJson(brand, kind) },
    { filename: "README.md", language: "markdown", code: buildReadme(brand, kind) },
  ];

  return { title: brand, kind, tagline: headline, files };
}

export function formatWebsiteAsAssistantMessage(site: GeneratedWebsite): string {
  const fileList = site.files.map((file) => `\`${file.filename}\``).join(", ");
  const blocks = site.files
    .map((file) => `${file.filename}\n\`\`\`${file.language}\n${file.code.trim()}\n\`\`\``)
    .join("\n\n");

  return `**${site.title}** is ready — a full-stack **${site.kind}** site.

${site.tagline}

Wrote ${fileList}. The page previews immediately. Start the API with \`node server.js\` for \`/api/health\`, \`/api/content\`, and \`/api/contact\`.

${blocks}`;
}
