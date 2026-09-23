/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a previewable HTML/CSS/JS frontend plus an Express API the learner can run locally.
 */

export type WebsiteKind = "landing" | "saas" | "portfolio" | "restaurant" | "blog" | "store";

export interface WebsiteBrief {
  kind?: WebsiteKind;
  name?: string;
  tagline?: string;
}

export interface GeneratedFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export interface GeneratedTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: GeneratedTreeNode[];
  isOpen?: boolean;
}

export interface GeneratedWebsite {
  name: string;
  kind: WebsiteKind;
  slug: string;
  files: GeneratedFile[];
  assistantMessage: string;
}

export const WEBSITE_KINDS: { id: WebsiteKind; label: string; hint: string }[] = [
  { id: "landing", label: "Landing", hint: "Marketing page" },
  { id: "saas", label: "SaaS", hint: "Product site" },
  { id: "portfolio", label: "Portfolio", hint: "Personal work" },
  { id: "restaurant", label: "Restaurant", hint: "Menu & booking" },
  { id: "blog", label: "Blog", hint: "Articles" },
  { id: "store", label: "Store", hint: "Products & orders" },
];

interface SiteItem {
  title: string;
  text: string;
  price?: string;
  image: string;
  tag?: string;
}

interface SiteFeature {
  title: string;
  text: string;
}

interface SiteBlueprint {
  kind: WebsiteKind;
  defaultName: string;
  defaultTagline: string;
  description: string;
  cta: string;
  itemsTitle: string;
  accent: string;
  accent2: string;
  bg: string;
  ink: string;
  heroImage: string;
  commerce: boolean;
  features: SiteFeature[];
  items: SiteItem[];
}

const photo = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const BLUEPRINTS: Record<WebsiteKind, SiteBlueprint> = {
  landing: {
    kind: "landing",
    defaultName: "Northstar",
    defaultTagline: "A clearer way to launch what you make",
    description: "Northstar helps small teams ship a public site, collect leads, and see what visitors actually want — without a pile of tools.",
    cta: "Start a project",
    itemsTitle: "What teams ship with us",
    accent: "#7c6af7",
    accent2: "#3ee0c5",
    bg: "#0b0d14",
    ink: "#f4f1ea",
    heroImage: photo("1553877522-43269d4ea984", 1800, 1100),
    commerce: false,
    features: [
      { title: "One brief, one site", text: "Describe the offer. The page, the form, and the API land in the same project." },
      { title: "Leads you can read", text: "Every inquiry is stored by the API and echoed back so you can see the round trip." },
      { title: "Runs locally first", text: "Preview in the editor, then start the Express server when you want live data." },
    ],
    items: [
      { title: "Studio launch", text: "A one-page story for a design studio opening in the spring.", tag: "Launch", image: photo("1497366216548-37526070297c") },
      { title: "Workshop series", text: "Dates, teachers, and a waitlist for a weekend course.", tag: "Events", image: photo("1524178232363-1fb2b075b655") },
      { title: "Field notes", text: "A quiet product update page with a signup for the next release.", tag: "Product", image: photo("1498050108023-c5249f4df085") },
    ],
  },
  saas: {
    kind: "saas",
    defaultName: "Lumen",
    defaultTagline: "See the work. Skip the status meeting.",
    description: "Lumen is a lightweight workspace for teams who want a shared board, a public changelog, and an API their own tools can call.",
    cta: "Open the app",
    itemsTitle: "Included with every workspace",
    accent: "#6d8bff",
    accent2: "#f0c24b",
    bg: "#090b12",
    ink: "#eef2ff",
    heroImage: photo("1551434678-e076c223a692", 1800, 1100),
    commerce: false,
    features: [
      { title: "Boards that stay small", text: "Three columns. A name. A note. Enough structure to ship, not enough to hide in." },
      { title: "A public changelog", text: "Visitors read what changed. The same records come from GET /api/items." },
      { title: "Your own API", text: "Express routes for content, inquiries, and health — ready for a real database." },
    ],
    items: [
      { title: "Shared board", text: "Now, next, and later — visible to the whole team.", tag: "Plan", price: "Free", image: photo("1531403009284-440f080d1e12") },
      { title: "Changelog", text: "Publish a release without writing a second tool.", tag: "Ship", price: "Pro", image: photo("1460925895917-afdab827c52f") },
      { title: "Inbound notes", text: "Questions from the site land in POST /api/inquiries.", tag: "Listen", price: "Pro", image: photo("1552664730-d307ca884978") },
    ],
  },
  portfolio: {
    kind: "portfolio",
    defaultName: "Avery Lane",
    defaultTagline: "Product design for teams who still like making things",
    description: "Selected work across branding, product, and small sites. Each project is a record the API can serve, so the page and the data stay in step.",
    cta: "View selected work",
    itemsTitle: "Selected work",
    accent: "#e7b15a",
    accent2: "#f3efe6",
    bg: "#12110e",
    ink: "#f6f1e7",
    heroImage: photo("1500530855697-b586d89ba3ee", 1800, 1100),
    commerce: false,
    features: [
      { title: "Case studies", text: "A title, a short note, and a photograph — enough to start a conversation." },
      { title: "A real contact form", text: "Messages post to the API. If the server is off, the preview still confirms locally." },
      { title: "Plain files", text: "HTML, CSS, and JavaScript up front. Express behind them when you are ready." },
    ],
    items: [
      { title: "Harbor Hotel", text: "Identity and a booking page for a 24-room inn.", tag: "Brand", image: photo("1566073771259-6a8506099945") },
      { title: "Paper Route", text: "A reading app for people who annotate in the margins.", tag: "Product", image: photo("1456513080510-7bf3a84b82f8") },
      { title: "Kiln Studio", text: "A catalog site for a ceramics workshop.", tag: "Web", image: photo("1493106641515-6b5631de4bb9") },
    ],
  },
  restaurant: {
    kind: "restaurant",
    defaultName: "Olive & Ember",
    defaultTagline: "Wood fire, late tables, a short menu",
    description: "Seasonal plates cooked over wood, a wine list that fits on one page, and a table you can ask for from the site.",
    cta: "Reserve a table",
    itemsTitle: "Tonight's menu",
    accent: "#e07a4a",
    accent2: "#f2d3a2",
    bg: "#140e0c",
    ink: "#f8efe6",
    heroImage: photo("1414235077428-338989a2e8c0", 1800, 1100),
    commerce: false,
    features: [
      { title: "A short menu", text: "Dishes come from the API, with prices, so the kitchen and the site share one list." },
      { title: "Reservations", text: "The form posts a party size and a note to POST /api/inquiries." },
      { title: "Walk-in friendly", text: "The preview still shows the menu if the server is not running." },
    ],
    items: [
      { title: "Charred leeks", text: "Brown butter, hazelnut, lemon zest.", tag: "Start", price: "$16", image: photo("1476224203421-9ac39bcb3327") },
      { title: "Wood-fired trout", text: "Herb oil, new potatoes, dill.", tag: "Main", price: "$32", image: photo("1504674900247-0877df9cc836") },
      { title: "Olive oil cake", text: "Citrus, crème fraîche, sea salt.", tag: "Sweet", price: "$12", image: photo("1565958011703-44f9829ba187") },
    ],
  },
  blog: {
    kind: "blog",
    defaultName: "Field Notes",
    defaultTagline: "Essays on making software in public",
    description: "Short essays on shipping, teaching, and the unglamorous parts of building a product. New notes are just records on the API.",
    cta: "Read the latest",
    itemsTitle: "Latest notes",
    accent: "#7dcea0",
    accent2: "#f4f0e6",
    bg: "#101410",
    ink: "#f3f6f1",
    heroImage: photo("1457369804613-52c61a468e7d", 1800, 1100),
    commerce: false,
    features: [
      { title: "Posts as data", text: "Each note is an item. Add one with POST /api/items and the page can show it." },
      { title: "Quiet layout", text: "Type first. Photographs second. No framework required to read it." },
      { title: "Replies welcome", text: "The contact form stores a note next to the post you were reading." },
    ],
    items: [
      { title: "Ship the small version", text: "What we cut from the first release, and why the page got better.", tag: "Process", image: photo("1432821596592-e2c18b78144f") },
      { title: "Teach with a running example", text: "A tour of an API that does three things and does them in the open.", tag: "Teaching", image: photo("1516321318423-f06f85e504b3") },
      { title: "Names for buttons", text: "Why the primary action should say what happens next.", tag: "Writing", image: photo("1455390582262-044cdead277a") },
    ],
  },
  store: {
    kind: "store",
    defaultName: "Atelier",
    defaultTagline: "Objects for a smaller room",
    description: "A short shop of home objects. Add a piece to the bag in the browser, then place the order through the API.",
    cta: "Browse the shop",
    itemsTitle: "In the shop",
    accent: "#d98b6a",
    accent2: "#f6efe4",
    bg: "#161311",
    ink: "#f7f1ea",
    heroImage: photo("1441986300917-64674bd600d8", 1800, 1100),
    commerce: true,
    features: [
      { title: "A bag in the browser", text: "Add pieces without an account. The bag lives in the page until you check out." },
      { title: "Orders on the API", text: "Checkout posts line items to POST /api/orders and returns an order id." },
      { title: "Catalog you can edit", text: "Products are seed data in server/data.js. Change a price, restart, refresh." },
    ],
    items: [
      { title: "Stoneware cup", text: "Speckled clay, holds 250ml.", tag: "Table", price: "$38", image: photo("1514228742587-6b1558fcca3d") },
      { title: "Linen throw", text: "Undyed flax, 140 × 200 cm.", tag: "Textile", price: "$120", image: photo("1616628188859-4e0a98c0d0f5") },
      { title: "Oak stool", text: "Three legs, oil finish, made in small batches.", tag: "Furniture", price: "$240", image: photo("1555041469-a586c61ea9bc") },
    ],
  },
};

const KIND_WORDS: Record<WebsiteKind, RegExp> = {
  restaurant: /\b(restaurant|cafe|café|menu|bistro|diner|food)\b/i,
  portfolio: /\b(portfolio|photographer|designer|case\s*stud)/i,
  store: /\b(store|shop|e-?commerce|product catalog|online shop)\b/i,
  blog: /\b(blog|magazine|article|newsletter|journal)\b/i,
  saas: /\b(saas|startup|dashboard|workspace|product site)\b/i,
  landing: /\b(landing|marketing|company site|homepage)\b/i,
};

export function slugify(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

export function detectWebsiteKind(prompt: string): WebsiteKind | null {
  const order: WebsiteKind[] = ["restaurant", "portfolio", "store", "blog", "saas", "landing"];
  return order.find((kind) => KIND_WORDS[kind].test(prompt)) ?? null;
}

export function isWebsiteGenerationRequest(prompt: string): boolean {
  const text = prompt.trim();
  if (!text) return false;
  if (/\bwebsite generator\b/i.test(text)) return true;
  const verb = /\b(build|create|generate|make|scaffold|design|spin\s*up|automate)\b/i.test(text);
  const target = /\b(website|web\s*site|landing\s*page|full[-\s]?stack(?:\s+(?:site|website|app|project))?|online\s+(?:store|shop))\b/i.test(text);
  return verb && target;
}

export function briefFromPrompt(prompt: string): WebsiteBrief | null {
  if (!isWebsiteGenerationRequest(prompt)) return null;
  return {
    kind: detectWebsiteKind(prompt) ?? "landing",
    name: extractName(prompt),
    tagline: extractTagline(prompt),
  };
}

function extractName(prompt: string): string | undefined {
  const match = prompt.match(/\b(?:called|named|titled|for)\s+["“']?([^"“”'\n]+)/i);
  if (!match) return undefined;
  let name = match[1].split(/\b(?:website|site|landing|page|using|with|full[-\s]?stack|that|which)\b/i)[0] ?? "";
  name = name.replace(/[.,;:]+$/g, "").trim();
  if (name.length < 2 || name.length > 48) return undefined;
  if (/^(a|an|the|my|our)$/i.test(name)) return undefined;
  if (detectWebsiteKind(name) && name.split(/\s+/).length < 2 && KIND_WORDS[detectWebsiteKind(name)!].test(name)) {
    return undefined;
  }
  return name;
}

function extractTagline(prompt: string): string | undefined {
  const match = prompt.match(/\btagline\s*[:-]\s*["“']?([^"“”'\n]+)/i);
  if (!match) return undefined;
  const tagline = match[1].trim();
  return tagline.length >= 2 && tagline.length <= 90 ? tagline : undefined;
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
}

function jsonForScript(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

function resolveBrief(brief: WebsiteBrief = {}): { blueprint: SiteBlueprint; name: string; tagline: string } {
  const kind = brief.kind && BLUEPRINTS[brief.kind] ? brief.kind : "landing";
  const blueprint = BLUEPRINTS[kind];
  const name = brief.name?.trim() || blueprint.defaultName;
  const tagline = brief.tagline?.trim() || blueprint.defaultTagline;
  return { blueprint, name, tagline };
}

function buildPayload(blueprint: SiteBlueprint, name: string, tagline: string) {
  return {
    name,
    tagline,
    description: blueprint.description.split(blueprint.defaultName).join(name),
    kind: blueprint.kind,
    cta: blueprint.cta,
    itemsTitle: blueprint.itemsTitle,
    accent: blueprint.accent,
    accent2: blueprint.accent2,
    commerce: blueprint.commerce,
    apiBase: "http://localhost:4000",
    features: blueprint.features,
    items: blueprint.items.map((item) => ({ ...item })),
  };
}

function buildHtml(name: string, tagline: string, blueprint: SiteBlueprint, payload: ReturnType<typeof buildPayload>): string {
  const features = payload.features
    .map(
      (feature) => `<article class="feature">
        <h3>${esc(feature.title)}</h3>
        <p>${esc(feature.text)}</p>
      </article>`,
    )
    .join("\n");

  const items = payload.items
    .map(
      (item) => `<article class="card" data-title="${esc(item.title)}" data-price="${esc(item.price || "")}">
        <img src="${esc(item.image)}" alt="${esc(item.title)}" />
        <div class="card-body">
          <div class="meta"><span>${esc(item.tag || blueprint.kind)}</span>${item.price ? `<strong>${esc(item.price)}</strong>` : ""}</div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
          ${blueprint.commerce ? `<button class="add" type="button">Add to bag</button>` : ""}
        </div>
      </article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(name)} — ${esc(tagline)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,520;9..144,650&family=Outfit:wght@360;500;640&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed style="--accent:${blueprint.accent};--accent-2:${blueprint.accent2};--bg:${blueprint.bg};--ink:${blueprint.ink}">
  <header class="nav">
    <a class="brand" href="#top">${esc(name)}</a>
    <button class="menu" type="button" aria-label="Open menu">Menu</button>
    <nav>
      <a href="#features">Approach</a>
      <a href="#work">${esc(payload.itemsTitle)}</a>
      <a href="#contact">Contact</a>
      ${blueprint.commerce ? `<button class="bag" type="button">Bag <span id="bag-count">0</span></button>` : ""}
    </nav>
  </header>

  <main id="top">
    <section class="hero" style="background-image:linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.72)), url('${blueprint.heroImage}')">
      <p class="eyebrow">${esc(blueprint.kind)}</p>
      <h1>${esc(tagline)}</h1>
      <p class="lede">${esc(payload.description)}</p>
      <a class="cta" href="#work">${esc(payload.cta)}</a>
    </section>

    <section class="features" id="features">
      ${features}
    </section>

    <section class="work" id="work">
      <div class="section-head">
        <h2>${esc(payload.itemsTitle)}</h2>
        <p id="source-note">Loading catalog…</p>
      </div>
      <div id="items" class="grid">
        ${items}
      </div>
    </section>

    <section class="contact" id="contact">
      <div>
        <h2>Write to ${esc(name)}</h2>
        <p>The form posts to <code>/api/inquiries</code>. If the API is offline, the preview still keeps your note on the page.</p>
      </div>
      <form id="inquiry-form">
        <label>Name<input name="name" required placeholder="Your name" /></label>
        <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
        <label>Note<textarea name="message" required rows="4" placeholder="What should we know?"></textarea></label>
        <button type="submit">Send note</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>

  <footer>
    <span>${esc(name)}</span>
    <span id="api-status">Checking API…</span>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function buildCss(): string {
  return `/* Generated by the Lunor website automation. Theme tokens are set on body. */
:root { color-scheme: dark; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Outfit, "Segoe UI", sans-serif;
  font-weight: 360;
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
button, input, textarea { font: inherit; color: inherit; }
code { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.92em; }

.nav {
  position: sticky; top: 0; z-index: 5;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 7vw;
  background: color-mix(in srgb, var(--bg) 84%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
}
.brand { font-family: Fraunces, Georgia, serif; font-size: 1.25rem; text-decoration: none; }
.nav nav { display: flex; gap: 18px; align-items: center; }
.nav a { text-decoration: none; font-size: 0.92rem; opacity: 0.8; }
.nav a:hover { opacity: 1; }
.menu, .bag, .add, form button, .cta {
  border: 0; cursor: pointer; border-radius: 999px;
}
.menu { display: none; background: transparent; border: 1px solid color-mix(in srgb, var(--ink) 25%, transparent); padding: 6px 12px; }
.bag, .add, form button {
  background: var(--accent); color: #14120f; font-weight: 640; padding: 8px 14px;
}
.cta {
  display: inline-block; margin-top: 18px; text-decoration: none;
  background: var(--accent-2); color: #16130f; font-weight: 640; padding: 12px 18px;
}

.hero {
  min-height: 78vh; display: flex; flex-direction: column; justify-content: flex-end;
  padding: 12vh 7vw 64px; background-size: cover; background-position: center;
}
.eyebrow { letter-spacing: 0.16em; text-transform: uppercase; font-size: 0.75rem; margin: 0 0 10px; }
.hero h1 {
  font-family: Fraunces, Georgia, serif; font-weight: 520; font-size: clamp(2.6rem, 6vw, 5.4rem);
  line-height: 0.95; max-width: 14ch; margin: 0;
}
.lede { max-width: 42rem; font-size: 1.08rem; opacity: 0.9; }

.features, .work, .contact { padding: 72px 7vw; }
.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.feature, .card, form {
  background: color-mix(in srgb, var(--ink) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
  border-radius: 18px;
}
.feature { padding: 22px; }
.feature h3, .card h3, .section-head h2, .contact h2 {
  font-family: Fraunces, Georgia, serif; font-weight: 520; margin: 0 0 8px;
}
.section-head { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 22px; }
.section-head p, .feature p, .card p, .contact p { margin: 0; opacity: 0.78; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.card img { height: 210px; width: 100%; border-radius: 18px 18px 0 0; }
.card-body { padding: 16px 16px 18px; display: grid; gap: 8px; }
.meta { display: flex; justify-content: space-between; font-size: 0.82rem; letter-spacing: 0.04em; text-transform: uppercase; }
.contact { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
form { padding: 18px; display: grid; gap: 12px; }
label { display: grid; gap: 6px; font-size: 0.86rem; }
input, textarea {
  background: color-mix(in srgb, var(--bg) 70%, black); border: 1px solid color-mix(in srgb, var(--ink) 16%, transparent);
  border-radius: 12px; padding: 10px 12px;
}
footer {
  display: flex; justify-content: space-between; gap: 12px; padding: 22px 7vw 32px;
  border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent); font-size: 0.88rem; opacity: 0.75;
}
#form-status:empty { display: none; }
.nav.open nav { display: flex; }

@media (max-width: 860px) {
  .features, .grid, .contact { grid-template-columns: 1fr; }
  .menu { display: inline-flex; }
  .nav nav { display: none; position: absolute; top: 58px; left: 0; right: 0; padding: 12px 7vw 16px; background: var(--bg); flex-direction: column; align-items: flex-start; }
  .hero { min-height: 70vh; }
}
`;
}

function buildScript(payload: ReturnType<typeof buildPayload>): string {
  return `/* Frontend for the generated site. Uses the API when it is up, otherwise the copy baked in below. */
const SITE = ${jsonForScript(payload)};

const itemsEl = document.getElementById("items");
const noteEl = document.getElementById("source-note");
const statusEl = document.getElementById("api-status");
const form = document.getElementById("inquiry-form");
const formStatus = document.getElementById("form-status");
const bag = [];

function card(item) {
  const article = document.createElement("article");
  article.className = "card";
  article.innerHTML =
    '<img alt="" />' +
    '<div class="card-body"><div class="meta"><span></span><strong></strong></div><h3></h3><p></p></div>';
  article.querySelector("img").src = item.image;
  article.querySelector("img").alt = item.title;
  article.querySelector(".meta span").textContent = item.tag || SITE.kind;
  article.querySelector(".meta strong").textContent = item.price || "";
  article.querySelector("h3").textContent = item.title;
  article.querySelector("p").textContent = item.text;
  if (SITE.commerce) {
    const button = document.createElement("button");
    button.className = "add";
    button.type = "button";
    button.textContent = "Add to bag";
    button.addEventListener("click", () => addToBag(item));
    article.querySelector(".card-body").appendChild(button);
  }
  return article;
}

function renderItems(items, sourceLabel) {
  itemsEl.replaceChildren(...items.map(card));
  noteEl.textContent = sourceLabel;
}

function addToBag(item) {
  bag.push({ title: item.title, price: item.price || "" });
  const count = document.getElementById("bag-count");
  if (count) count.textContent = String(bag.length);
  statusEl.textContent = bag.length + " in the bag";
}

async function loadCatalog() {
  try {
    const response = await fetch(SITE.apiBase + "/api/items");
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    renderItems(data.items || [], "Live catalog from the API");
    statusEl.textContent = "API connected";
  } catch {
    renderItems(SITE.items, "Preview catalog — start the API to go live");
    statusEl.textContent = "Preview data";
  }
}

document.querySelector(".menu")?.addEventListener("click", () => {
  document.querySelector(".nav")?.classList.toggle("open");
});

document.querySelector(".bag")?.addEventListener("click", async () => {
  if (!bag.length) {
    statusEl.textContent = "Your bag is empty";
    return;
  }
  try {
    const response = await fetch(SITE.apiBase + "/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: bag }),
    });
    if (!response.ok) throw new Error("order failed");
    const order = await response.json();
    bag.length = 0;
    const count = document.getElementById("bag-count");
    if (count) count.textContent = "0";
    statusEl.textContent = "Order " + order.id + " received";
  } catch {
    statusEl.textContent = "API offline — order kept in the preview only";
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(form).entries());
  formStatus.textContent = "Sending…";
  try {
    const response = await fetch(SITE.apiBase + "/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("request failed");
    const saved = await response.json();
    formStatus.textContent = "Saved as " + saved.id + ".";
    form.reset();
  } catch {
    formStatus.textContent = "Saved in the preview. Start the API to store it.";
  }
});

loadCatalog();
`;
}

function buildServer(payload: ReturnType<typeof buildPayload>): { data: string; routes: string; model: string; server: string } {
  const data = `/** Seed content for ${payload.name}. The API serves this until MongoDB is configured. */
export const site = ${JSON.stringify(
    {
      name: payload.name,
      tagline: payload.tagline,
      description: payload.description,
      kind: payload.kind,
      cta: payload.cta,
      itemsTitle: payload.itemsTitle,
    },
    null,
    2,
  )};

export const features = ${JSON.stringify(payload.features, null, 2)};

export const items = ${JSON.stringify(payload.items, null, 2)};
`;

  const routes = `import { Router } from "express";
import { features, items as seedItems, site } from "../data.js";
import { Item, usingDatabase } from "../models/Item.js";

export const api = Router();

const inquiries = [];
const orders = [];
let catalog = seedItems.map((item, index) => ({ id: "item-" + (index + 1), ...item }));

api.get("/health", (_req, res) => {
  res.json({ ok: true, service: site.name, database: usingDatabase() ? "mongodb" : "memory" });
});

api.get("/content", (_req, res) => {
  res.json({ site, features });
});

api.get("/items", async (_req, res) => {
  if (usingDatabase()) {
    const docs = await Item.find().sort({ createdAt: -1 }).lean();
    return res.json({ items: docs });
  }
  res.json({ items: catalog });
});

api.post("/items", async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const text = String(req.body?.text || "").trim();
  if (!title || !text) return res.status(400).json({ error: "title and text are required" });
  const item = {
    title,
    text,
    price: req.body?.price ? String(req.body.price) : "",
    tag: req.body?.tag ? String(req.body.tag) : site.kind,
    image: req.body?.image ? String(req.body.image) : seedItems[0]?.image || "",
  };
  if (usingDatabase()) {
    const doc = await Item.create(item);
    return res.status(201).json(doc);
  }
  const saved = { id: "item-" + Date.now().toString(36), ...item };
  catalog = [saved, ...catalog];
  res.status(201).json(saved);
});

api.post("/inquiries", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!name || !email || !message) return res.status(400).json({ error: "name, email, and message are required" });
  const saved = { id: "inq-" + Date.now().toString(36), name, email, message, createdAt: new Date().toISOString() };
  inquiries.push(saved);
  res.status(201).json(saved);
});

api.get("/inquiries", (_req, res) => {
  res.json({ inquiries });
});

api.post("/orders", (req, res) => {
  const lines = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!lines.length) return res.status(400).json({ error: "items are required" });
  const saved = {
    id: "ord-" + Date.now().toString(36),
    items: lines.map((line) => ({ title: String(line.title || "Item"), price: String(line.price || "") })),
    createdAt: new Date().toISOString(),
  };
  orders.push(saved);
  res.status(201).json(saved);
});
`;

  const model = `import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    text: String,
    price: String,
    image: String,
    tag: String,
  },
  { timestamps: true },
);

export const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

let connected = false;

export function usingDatabase() {
  return connected;
}

export async function connectDb(uri) {
  if (!uri) return false;
  await mongoose.connect(uri);
  connected = true;
  return true;
}
`;

  const server = `import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { api } from "./routes/api.js";
import { connectDb } from "./models/Item.js";

const app = express();
const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
app.use(cors());
app.use(express.json());
app.use("/api", api);
app.use(express.static(clientDir, { index: "index.html" }));

const port = Number(process.env.PORT || 4000);

connectDb(process.env.MONGODB_URI || "")
  .then((connected) => {
    app.listen(port, () => {
      console.log("API http://localhost:" + port);
      console.log(connected ? "MongoDB connected" : "Using in-memory data. Set MONGODB_URI to persist.");
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

  return { data, routes, model, server };
}

function buildReadme(name: string, kind: WebsiteKind, slug: string): string {
  return `# ${name}

Full-stack ${kind} website generated by the Lunor Web Development assistant.

## Files

- \`src/index.html\`, \`src/styles.css\`, \`src/script.js\` — the site. The editor preview runs this without a server.
- \`server/server.js\` — Express API on port 4000.
- \`server/routes/api.js\` — health, content, items, inquiries, and orders.
- \`server/data.js\` — seed copy. Edit this to change the catalog.
- \`server/models/Item.js\` — Mongoose model, used only when \`MONGODB_URI\` is set.

## Run the API

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:4000 for the site and the API together. The editor preview calls \`http://localhost:4000/api/items\` and falls back to the built-in catalog if that request fails.

## Try the API

\`\`\`bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/items
curl -X POST http://localhost:4000/api/inquiries \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Ada","email":"ada@example.com","message":"Hello"}'
\`\`\`

Project slug: \`${slug}\`.
`;
}

function file(path: string, language: string, content: string): GeneratedFile {
  const name = path.split("/").pop() || path;
  return { path, name, language, content };
}

export function generateFullStackWebsite(brief: WebsiteBrief = {}): GeneratedWebsite {
  const { blueprint, name, tagline } = resolveBrief(brief);
  const payload = buildPayload(blueprint, name, tagline);
  const server = buildServer(payload);
  const slug = slugify(name);
  const files: GeneratedFile[] = [
    file("src/index.html", "html", buildHtml(name, tagline, blueprint, payload)),
    file("src/styles.css", "css", buildCss()),
    file("src/script.js", "javascript", buildScript(payload)),
    file("server/data.js", "javascript", server.data),
    file("server/routes/api.js", "javascript", server.routes),
    file("server/models/Item.js", "javascript", server.model),
    file("server/server.js", "javascript", server.server),
    file(
      "package.json",
      "json",
      JSON.stringify(
        {
          name: slug,
          version: "1.0.0",
          private: true,
          type: "module",
          description: `${name} — full-stack ${blueprint.kind} website`,
          scripts: { start: "node server/server.js", dev: "node --watch server/server.js" },
          dependencies: {
            cors: "^2.8.5",
            dotenv: "^16.4.5",
            express: "^4.21.2",
            mongoose: "^8.9.5",
          },
        },
        null,
        2,
      ) + "\n",
    ),
    file(
      ".env.example",
      "plaintext",
      `PORT=4000\n# Optional. Leave empty to keep catalog, inquiries, and orders in memory.\nMONGODB_URI=\n`,
    ),
    file("README.md", "markdown", buildReadme(name, blueprint.kind, slug)),
  ];

  const assistantMessage = [
    `Built a full-stack **${blueprint.kind}** website for **${name}** and applied the files to this project.`,
    "",
    "Frontend (open in the preview):",
    "- `src/index.html`",
    "- `src/styles.css`",
    "- `src/script.js` — loads `/api/items`, and uses the built-in catalog if the API is offline",
    "",
    "API:",
    "- `server/server.js` — Express on port 4000",
    "- `server/routes/api.js` — `/api/health`, `/api/content`, `/api/items`, `/api/inquiries`, `/api/orders`",
    "- `server/data.js` — seed copy",
    "- `server/models/Item.js` — MongoDB model, used when `MONGODB_URI` is set",
    "- `package.json`, `.env.example`, `README.md`",
    "",
    "Run it locally with `npm install` then `npm start`. The preview already shows the site.",
  ].join("\n");

  return { name, kind: blueprint.kind, slug, files, assistantMessage };
}

export function filesToFileTree(files: GeneratedFile[]): GeneratedTreeNode[] {
  const tree: GeneratedTreeNode[] = [];
  for (const entry of files) {
    const parts = entry.path.split("/").filter(Boolean);
    let siblings = tree;
    let acc = "";
    parts.forEach((part, index) => {
      acc = acc ? `${acc}/${part}` : part;
      const isFile = index === parts.length - 1;
      if (isFile) {
        siblings.push({
          id: acc,
          name: part,
          type: "file",
          language: entry.language,
          content: entry.content,
        });
        return;
      }
      let folder = siblings.find((node) => node.type === "folder" && node.name === part);
      if (!folder) {
        folder = { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        siblings.push(folder);
      }
      siblings = folder.children || [];
    });
  }
  return tree;
}
