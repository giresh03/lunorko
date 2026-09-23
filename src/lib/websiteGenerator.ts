/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a previewable client (HTML/CSS/JS) plus an Express API the same
 * page can call when the project is run locally.
 */

export type WebsiteKind = "portfolio" | "restaurant" | "shop" | "blog" | "saas" | "studio";

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface ProjectNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: ProjectNode[];
  isOpen?: boolean;
}

export interface SiteItem {
  id: string;
  title: string;
  summary: string;
  tag: string;
  price?: string;
  image: string;
}

export interface WebsiteProject {
  brand: string;
  kind: WebsiteKind;
  tagline: string;
  files: GeneratedFile[];
}

export interface WebsiteAutomation {
  id: WebsiteKind;
  label: string;
  prompt: string;
}

export const WEBSITE_AUTOMATIONS: WebsiteAutomation[] = [
  { id: "portfolio", label: "Portfolio", prompt: "Build a full-stack portfolio website named Mira Chen" },
  { id: "restaurant", label: "Restaurant", prompt: "Build a full-stack restaurant website for Luna Bistro" },
  { id: "shop", label: "Shop", prompt: "Build a full-stack online shop website for Northwind Goods" },
  { id: "blog", label: "Blog", prompt: "Build a full-stack blog website called Field Notes" },
  { id: "saas", label: "SaaS", prompt: "Build a full-stack SaaS landing website for Lumen Analytics" },
  { id: "studio", label: "Studio", prompt: "Build a full-stack studio website for Harbor & Co" },
];

const KIND_PATTERNS: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "restaurant", pattern: /\b(restaurant|cafe|café|bistro|menu|bakery|diner|food)\b/i },
  { kind: "shop", pattern: /\b(shop|store|ecommerce|e-commerce|boutique|products?)\b/i },
  { kind: "blog", pattern: /\b(blog|magazine|articles?|journal|newsletter)\b/i },
  { kind: "portfolio", pattern: /\b(portfolio|freelancer|photographer|designer|personal site)\b/i },
  { kind: "saas", pattern: /\b(saas|startup|landing page|software|analytics|platform)\b/i },
  { kind: "studio", pattern: /\b(studio|agency|consult)/i },
];

interface KindProfile {
  fallbackBrand: string;
  eyebrow: string;
  tagline: string;
  accent: string;
  accentSoft: string;
  heroImage: string;
  catalogTitle: string;
  catalogLead: string;
  cta: string;
  about: string;
  items: SiteItem[];
  highlights: { title: string; text: string }[];
}

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const PROFILES: Record<WebsiteKind, KindProfile> = {
  portfolio: {
    fallbackBrand: "Mira Chen",
    eyebrow: "Product design",
    tagline: "Interfaces, brands, and products with a clear point of view.",
    accent: "#7c5cff",
    accentSoft: "#d9d0ff",
    heroImage: img("photo-1558655146-d09347e92766", 1600, 900),
    catalogTitle: "Selected work",
    catalogLead: "Recent projects, pulled from the API.",
    cta: "Start a project",
    about: "Independent designer helping teams turn rough ideas into products people finish using.",
    highlights: [
      { title: "Research", text: "Interviews and prototypes before a single polished screen." },
      { title: "Systems", text: "Type, color, and components that stay consistent as the product grows." },
      { title: "Delivery", text: "Handoff notes and a working front end, not a folder of mockups." },
    ],
    items: [
      { id: "atlas", title: "Atlas Bank", summary: "A calmer home for everyday banking.", tag: "Fintech", image: img("photo-1551288049-bebda4e38f71") },
      { id: "north", title: "North Trail", summary: "Booking flow for a small outdoor guide.", tag: "Travel", image: img("photo-1469854523086-cc02fe5d8800") },
      { id: "lumen", title: "Lumen Notes", summary: "A writing app that stays out of the way.", tag: "SaaS", image: img("photo-1517694712202-14dd9538aa97") },
      { id: "field", title: "Field Market", summary: "Catalog and checkout for a weekend market.", tag: "Commerce", image: img("photo-1441986300917-64674bd600d8") },
    ],
  },
  restaurant: {
    fallbackBrand: "Luna Bistro",
    eyebrow: "Seasonal kitchen",
    tagline: "Wood fire, a short menu, and a room that stays full on weeknights.",
    accent: "#e07a3d",
    accentSoft: "#ffd7bf",
    heroImage: img("photo-1414235077428-338989a2e8c0", 1600, 900),
    catalogTitle: "Tonight's menu",
    catalogLead: "Dishes served from the kitchen API.",
    cta: "Reserve a table",
    about: "A neighborhood bistro. Twelve seats at the bar, a garden in summer, and a menu that changes with the market.",
    highlights: [
      { title: "Fire", text: "Most of the menu meets the wood oven." },
      { title: "Market", text: "The board is written after the morning delivery." },
      { title: "Room", text: "Low light, linen, and a playlist that never shouts." },
    ],
    items: [
      { id: "roast", title: "Fire-roasted carrots", summary: "Chili honey, yogurt, sesame.", tag: "Starter", price: "$14", image: img("photo-1512621776951-a57141f2eefd") },
      { id: "pasta", title: "Brown-butter pasta", summary: "Sage, lemon, and pecorino.", tag: "Main", price: "$24", image: img("photo-1473093295043-cdd812d0e601") },
      { id: "fish", title: "Catch of the day", summary: "Charred lemon and herb oil.", tag: "Main", price: "$32", image: img("photo-1467003909585-2f8a72700288") },
      { id: "tart", title: "Olive oil tart", summary: "Citrus, cream, and sea salt.", tag: "Dessert", price: "$12", image: img("photo-1488477181946-6428a0291777") },
    ],
  },
  shop: {
    fallbackBrand: "Northwind Goods",
    eyebrow: "Objects for the house",
    tagline: "Useful things, made slowly, shipped in plain boxes.",
    accent: "#0f8f7a",
    accentSoft: "#c9f3ea",
    heroImage: img("photo-1441986300917-64674bd600d8", 1600, 900),
    catalogTitle: "In the shop",
    catalogLead: "Products from the store API. Add a note and we'll reply.",
    cta: "Ask about an order",
    about: "A small shop for ceramics, textiles, and tools that earn a place on the counter.",
    highlights: [
      { title: "Made to keep", text: "We stock pieces people replace only when they want to." },
      { title: "Plain shipping", text: "Paper, not plastic, and a note with the maker's name." },
      { title: "Easy returns", text: "Thirty days. No form longer than the checkout." },
    ],
    items: [
      { id: "bowl", title: "Stoneware bowl", summary: "Speckled clay, everyday size.", tag: "Ceramic", price: "$48", image: img("photo-1610701596007-11502861dcfa") },
      { id: "throw", title: "Wool throw", summary: "Undyed gray, washed soft.", tag: "Textile", price: "$120", image: img("photo-1616486338812-3dadae4b4ace") },
      { id: "lamp", title: "Desk lamp", summary: "Brass arm, linen shade.", tag: "Light", price: "$180", image: img("photo-1507473885765-e6ed057f782c") },
      { id: "cup", title: "Travel cup", summary: "Double wall, no logo.", tag: "Kitchen", price: "$32", image: img("photo-1514228742587-6b1558fcca3d") },
    ],
  },
  blog: {
    fallbackBrand: "Field Notes",
    eyebrow: "A weekly journal",
    tagline: "Short essays on making software, cities, and dinner.",
    accent: "#c45c26",
    accentSoft: "#ffe0cc",
    heroImage: img("photo-1455390582262-044cdead277a", 1600, 900),
    catalogTitle: "Latest notes",
    catalogLead: "Posts served by the journal API.",
    cta: "Send a letter",
    about: "Field Notes is a small journal. One essay a week, no growth hacks, and an archive that stays readable.",
    highlights: [
      { title: "Weekly", text: "One piece, edited, then left alone." },
      { title: "Sources", text: "Links and the books that started the thought." },
      { title: "Letters", text: "Readers write back. The good ones get a reply." },
    ],
    items: [
      { id: "cities", title: "Cities that walk", summary: "What a ten-minute errand says about a street.", tag: "Places", image: img("photo-1449824913935-59a10b8d2000") },
      { id: "tools", title: "Fewer tools", summary: "The stack got smaller and the work got clearer.", tag: "Software", image: img("photo-1498050108023-c5249f4df085") },
      { id: "tables", title: "Setting the table", summary: "A dinner that starts before anyone sits down.", tag: "Kitchen", image: img("photo-1414235077428-338989a2e8c0") },
      { id: "type", title: "Type on screens", summary: "Why the body text is larger than you think.", tag: "Design", image: img("photo-1467232004584-a241de8bcf5d") },
    ],
  },
  saas: {
    fallbackBrand: "Lumen Analytics",
    eyebrow: "Product analytics",
    tagline: "See which features people finish, not just which pages they open.",
    accent: "#3b6cff",
    accentSoft: "#d6e2ff",
    heroImage: img("photo-1551288049-bebda4e38f71", 1600, 900),
    catalogTitle: "What teams measure",
    catalogLead: "Plans and reports from the product API.",
    cta: "Book a walkthrough",
    about: "Lumen sits beside the product you already ship. It answers one question: did someone complete the job?",
    highlights: [
      { title: "Funnels", text: "Steps, drop-off, and the screen that needs another pass." },
      { title: "Cohorts", text: "Week-one retention without a spreadsheet." },
      { title: "Privacy", text: "No third-party ads. Your events stay in your project." },
    ],
    items: [
      { id: "funnels", title: "Funnels", summary: "From signup to the moment of value.", tag: "Product", price: "Included", image: img("photo-1460925895917-afdab827c52f") },
      { id: "replay", title: "Session notes", summary: "A short clip of where people hesitate.", tag: "Research", price: "Pro", image: img("photo-1551434678-e076c223a692") },
      { id: "alerts", title: "Quiet alerts", summary: "A message when a key step breaks.", tag: "Ops", price: "Included", image: img("photo-1518186285589-2f7649de83e0") },
      { id: "export", title: "Warehouse export", summary: "Nightly sync to the warehouse you already have.", tag: "Data", price: "Scale", image: img("photo-1504868584819-f8e8b4b6d7e3") },
    ],
  },
  studio: {
    fallbackBrand: "Harbor & Co",
    eyebrow: "Design studio",
    tagline: "Websites and product work for companies that still answer the phone.",
    accent: "#1f6f8b",
    accentSoft: "#d3eef6",
    heroImage: img("photo-1497366216548-37526070297c", 1600, 900),
    catalogTitle: "Recent work",
    catalogLead: "Engagements listed by the studio API.",
    cta: "Start a conversation",
    about: "Harbor & Co builds marketing sites and the small product tools behind them. A senior team, a short contract, a site you can edit.",
    highlights: [
      { title: "Sites", text: "A clear homepage and the pages that sell the work." },
      { title: "Product", text: "The logged-in tools your customers actually touch." },
      { title: "Care", text: "A monthly hour for the changes that show up after launch." },
    ],
    items: [
      { id: "harbor", title: "Harbor Freight site", summary: "A quieter homepage for a logistics firm.", tag: "Web", image: img("photo-1497366811353-6870744d04b2") },
      { id: "clinic", title: "Clinic booking", summary: "Patients pick a time without calling.", tag: "Product", image: img("photo-1576091160399-112ba8d25d1d") },
      { id: "press", title: "Press room", summary: "Stories, logos, and a contact that reaches a person.", tag: "Content", image: img("photo-1454165804606-c3d57bc86b40") },
      { id: "shop", title: "Wholesale desk", summary: "Buyers reorder without a PDF.", tag: "Commerce", image: img("photo-1556742049-0cfed4f6a45d") },
    ],
  },
};

export function isWebsiteGenerationRequest(text: string): boolean {
  const value = text.trim();
  if (!value) return false;
  if (/\b(fix|debug|explain|why|error|bug|refactor|optimize)\b/i.test(value)) return false;
  const asksToBuild =
    /\b(build|create|generate|scaffold|spin up)\b/i.test(value) ||
    /\bmake\s+(me\s+)?(a|an)\b/i.test(value);
  const wantsSite = /\b(full[-\s]?stack(\s+(website|site|web\s*app))?|website|web\s*site|landing\s+page|online\s+shop)\b/i.test(value);
  return asksToBuild && wantsSite;
}

export function detectWebsiteKind(text: string): WebsiteKind {
  for (const rule of KIND_PATTERNS) {
    if (rule.pattern.test(text)) return rule.kind;
  }
  return "studio";
}

export function extractBrand(text: string, fallback: string): string {
  const title = "([A-Za-z0-9][\\w'&.-]*(?:\\s+(?:&|[A-Za-z0-9][\\w'&.-]*)){0,4})";
  const named = text.match(new RegExp(`\\b(?:called|named)\\s+${title}`));
  const branded = text.match(new RegExp(`\\bfor\\s+${title}`));
  const raw = (named?.[1] || branded?.[1] || fallback).replace(/\s+(website|site|app)$/i, "").trim();
  return raw.slice(0, 48) || fallback;
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "website";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildStyles(accent: string, accentSoft: string): string {
  return `/* Generated by the Lunor website automation */
:root {
  --bg: #f6f3ee;
  --ink: #1c1915;
  --muted: #5e584f;
  --line: #e4ddd2;
  --card: #fffdf9;
  --accent: ${accent};
  --accent-soft: ${accentSoft};
  --shadow: 0 18px 50px rgba(28, 25, 21, 0.08);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Source Serif 4", Georgia, serif;
  color: var(--ink);
  background:
    radial-gradient(900px 420px at 100% -10%, var(--accent-soft), transparent 60%),
    var(--bg);
}
img { max-width: 100%; display: block; }
a { color: inherit; }
button, input, textarea { font: inherit; }
.wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0;
}
.brand { font-weight: 650; letter-spacing: -0.03em; text-decoration: none; font-size: 1.15rem; }
.nav-links { display: flex; gap: 18px; align-items: center; }
.nav-links a { text-decoration: none; color: var(--muted); font-family: Inter, sans-serif; font-size: 0.92rem; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--ink);
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  font-family: Inter, sans-serif;
  font-size: 0.92rem;
}
.btn.light { background: #fff; color: var(--ink); }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 36px;
  align-items: center;
  padding: 18px 0 56px;
}
.eyebrow {
  font-family: Inter, sans-serif;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--accent);
  margin: 0 0 12px;
}
h1 { font-size: clamp(2.6rem, 5vw, 4.6rem); line-height: 0.95; letter-spacing: -0.04em; margin: 0 0 16px; }
.lead { font-size: 1.25rem; color: var(--muted); max-width: 36rem; }
.hero-photo {
  min-height: 420px;
  border-radius: 28px;
  background-color: var(--accent-soft);
  background-size: cover;
  background-position: center;
  box-shadow: var(--shadow);
}
.band { padding: 28px 0 10px; }
.grid-3, .catalog { display: grid; gap: 16px; }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.catalog { grid-template-columns: repeat(2, 1fr); }
.card, .item {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  overflow: hidden;
}
.card { padding: 22px; }
.card h3, .item h3 { margin: 0 0 8px; font-size: 1.25rem; }
.card p, .item p, .about p, .form p { color: var(--muted); line-height: 1.55; }
.item img { height: 220px; width: 100%; object-fit: cover; }
.item-body { padding: 18px 18px 20px; }
.meta { display: flex; justify-content: space-between; gap: 12px; font-family: Inter, sans-serif; font-size: 0.82rem; color: var(--accent); margin-bottom: 8px; }
.split { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 28px; padding: 48px 0 64px; }
.form {
  background: var(--ink);
  color: #f6f3ee;
  border-radius: 28px;
  padding: 28px;
}
.form p { color: #d9d2c8; }
label { display: block; font-family: Inter, sans-serif; font-size: 0.8rem; margin: 12px 0 6px; }
input, textarea {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.04);
  color: #fff;
  border-radius: 12px;
  padding: 12px 14px;
}
textarea { min-height: 110px; resize: vertical; }
.status { min-height: 1.2rem; font-family: Inter, sans-serif; font-size: 0.85rem; }
footer { border-top: 1px solid var(--line); padding: 22px 0 36px; color: var(--muted); font-family: Inter, sans-serif; font-size: 0.85rem; }
@media (max-width: 800px) {
  .hero, .split, .grid-3, .catalog { grid-template-columns: 1fr; }
  .nav-links a:not(.btn) { display: none; }
  .hero-photo { min-height: 240px; }
}
`;
}

function buildHtml(brand: string, profile: KindProfile): string {
  const safeBrand = escapeHtml(brand);
  const highlights = profile.highlights
    .map((item) => `<article class="card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrand}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,500;8..60,650&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed>
  <header class="wrap nav">
    <a class="brand" href="#top">${safeBrand}</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="#work">${escapeHtml(profile.catalogTitle)}</a>
      <a href="#about">About</a>
      <a class="btn" href="#contact">${escapeHtml(profile.cta)}</a>
    </nav>
  </header>
  <main id="top">
    <section class="wrap hero">
      <div>
        <p class="eyebrow">${escapeHtml(profile.eyebrow)}</p>
        <h1>${safeBrand}</h1>
        <p class="lead">${escapeHtml(profile.tagline)}</p>
      </div>
      <div class="hero-photo" role="img" aria-label="${safeBrand}" style="background-image:url('${profile.heroImage}')"></div>
    </section>
    <section class="wrap band">
      <div class="grid-3">
        ${highlights}
      </div>
    </section>
    <section class="wrap band" id="work">
      <p class="eyebrow">From the API</p>
      <h2>${escapeHtml(profile.catalogTitle)}</h2>
      <p class="lead">${escapeHtml(profile.catalogLead)}</p>
      <div id="catalog" class="catalog" aria-live="polite"></div>
    </section>
    <section class="wrap split" id="about">
      <div class="about">
        <p class="eyebrow">About</p>
        <h2>A site with a real API behind it.</h2>
        <p>${escapeHtml(profile.about)}</p>
      </div>
      <form id="inquiry-form" class="form">
        <p class="eyebrow" style="color:var(--accent-soft)">Contact</p>
        <h2 id="contact">Say hello</h2>
        <p>The form posts to <code>/api/inquiries</code>. In the editor preview it saves locally when the server is not running.</p>
        <label for="name">Name</label>
        <input id="name" name="name" required autocomplete="name">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required autocomplete="email">
        <label for="message">Message</label>
        <textarea id="message" name="message" required></textarea>
        <p class="status" id="form-status" role="status"></p>
        <button class="btn light" type="submit">${escapeHtml(profile.cta)}</button>
      </form>
    </section>
  </main>
  <footer class="wrap">© ${new Date().getFullYear()} ${safeBrand}. Generated by the Lunor website automation.</footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function buildClientApp(items: SiteItem[]): string {
  return `// Client for the generated website.
// Loads /api/items when the Express server is running, and falls back to
// the same seed data so the editor preview still renders.
const SEED = ${JSON.stringify(items, null, 2)};

async function loadItems() {
  try {
    const response = await fetch("/api/items");
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Empty catalog");
    return data;
  } catch {
    return SEED;
  }
}

function renderItems(items) {
  const catalog = document.getElementById("catalog");
  if (!catalog) return;
  catalog.innerHTML = items.map((item) => \`
    <article class="item">
      <img src="\${item.image}" alt="\${item.title}">
      <div class="item-body">
        <div class="meta"><span>\${item.tag}</span><span>\${item.price || ""}</span></div>
        <h3>\${item.title}</h3>
        <p>\${item.summary}</p>
      </div>
    </article>
  \`).join("");
}

async function sendInquiry(payload) {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  renderItems(await loadItems());

  const form = document.getElementById("inquiry-form");
  const status = document.getElementById("form-status");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (status) status.textContent = "Sending…";
    try {
      await sendInquiry(data);
      if (status) status.textContent = "Sent to the API.";
      form.reset();
    } catch {
      const saved = JSON.parse(localStorage.getItem("inquiries") || "[]");
      saved.push({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem("inquiries", JSON.stringify(saved));
      if (status) status.textContent = "Saved in this browser. Start the server to post to /api/inquiries.";
      form.reset();
    }
  });
});
`;
}

function buildServer(brand: string): { index: string; routes: string; data: string; pkg: string; readme: string } {
  const slug = slugify(brand);
  const index = `import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { items } from "./data.js";
import { createApiRouter } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", createApiRouter(items));
app.use(express.static(path.join(__dirname, "../client")));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(\`${brand} running at http://localhost:\${port}\`);
});
`;

  const routes = `import { Router } from "express";

export function createApiRouter(seedItems) {
  const router = Router();
  const items = seedItems.map((item) => ({ ...item }));
  const inquiries = [];

  router.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  router.get("/items", (_req, res) => {
    res.json(items);
  });

  router.get("/items/:id", (req, res) => {
    const item = items.find((entry) => entry.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(item);
  });

  router.post("/inquiries", (req, res) => {
    const { name, email, message } = req.body ?? {};
    if (!name || !email || !message) {
      res.status(400).json({ error: "name, email, and message are required" });
      return;
    }
    const inquiry = {
      id: String(inquiries.length + 1),
      name: String(name).slice(0, 120),
      email: String(email).slice(0, 180),
      message: String(message).slice(0, 2000),
      createdAt: new Date().toISOString(),
    };
    inquiries.push(inquiry);
    res.status(201).json(inquiry);
  });

  return router;
}
`;

  const pkg = `{
  "name": "${slug}",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Full-stack website generated by the Lunor web development assistant",
  "scripts": {
    "start": "node server/index.js",
    "dev": "node --watch server/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2"
  }
}
`;

  const readme = `# ${brand}

Full-stack website generated by the Lunor web development assistant.

## Run it

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## Files

- \`client/index.html\` — page
- \`client/styles.css\` — theme
- \`client/app.js\` — loads the catalog and contact form
- \`server/index.js\` — Express app
- \`server/routes.js\` — \`/api/items\` and \`/api/inquiries\`
- \`server/data.js\` — starter content

The editor preview uses the seed data inside \`client/app.js\` when the API is not running.
`;

  return { index, routes, data: "", pkg, readme };
}

export function generateFullStackWebsite(prompt: string): WebsiteProject {
  const kind = detectWebsiteKind(prompt);
  const profile = PROFILES[kind];
  const brand = extractBrand(prompt, profile.fallbackBrand);
  const server = buildServer(brand);
  const data = `export const items = ${JSON.stringify(profile.items, null, 2)};\n`;

  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: buildHtml(brand, profile) },
    { path: "client/styles.css", language: "css", content: buildStyles(profile.accent, profile.accentSoft) },
    { path: "client/app.js", language: "javascript", content: buildClientApp(profile.items) },
    { path: "server/index.js", language: "javascript", content: server.index },
    { path: "server/routes.js", language: "javascript", content: server.routes },
    { path: "server/data.js", language: "javascript", content: data },
    { path: "package.json", language: "json", content: server.pkg },
    { path: "README.md", language: "markdown", content: server.readme },
  ];

  return { brand, kind, tagline: profile.tagline, files };
}

export function filesToProjectTree(files: GeneratedFile[]): ProjectNode[] {
  const root: ProjectNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let level = root;
    let acc = "";
    parts.forEach((part, index) => {
      acc = acc ? `${acc}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = level.find((entry) => entry.name === part && entry.type === (isFile ? "file" : "folder"));
      if (!node) {
        node = isFile
          ? { id: acc, name: part, type: "file", language: file.language, content: file.content }
          : { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        level.push(node);
      } else if (isFile) {
        node.content = file.content;
        node.language = file.language;
      }
      if (!isFile) level = node.children ?? [];
    });
  }
  return root;
}

export function websiteAssistantIntro(domainName: string): string {
  return `👋 I'm your **${domainName}** AI assistant.

**Website generator** is built in. Ask me to build a full-stack website and I'll add the page, styles, client script, and an Express API to this project.

Try a preset under the chat, or say: "Build a restaurant website for Luna Bistro".

I can still explain code, debug a file, or generate a smaller HTML demo.`;
}

export function describeWebsiteProject(project: WebsiteProject): string {
  const files = project.files.map((file) => `- \`${file.path}\``).join("\n");
  return `**Full-stack website ready: ${project.brand}**

I generated a ${project.kind} site and applied the files to this project. The preview uses the page in \`client/index.html\`. The Express API is in \`server/\` for when you run it locally.

${files}

**Run locally**

\`\`\`bash
npm install
npm start
\`\`\`

\`GET /api/items\` returns the catalog. \`POST /api/inquiries\` stores a contact message. In this preview the page falls back to the same seed data, and the form saves in the browser if the server is not running.`;
}

/** Inline linked client CSS/JS the way the editor preview does, skipping the API. */
export function assembleClientPreview(files: GeneratedFile[]): string {
  const byName = new Map(files.map((file) => [file.path.split("/").pop() || file.path, file]));
  const html = byName.get("index.html")?.content || "";
  return html
    .replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi, (_match, href: string) => {
      const name = href.split("/").pop() || "";
      const file = byName.get(name);
      return file ? `<style>${file.content}</style>` : "";
    })
    .replace(/<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi, (_match, src: string) => {
      const name = src.split("/").pop() || "";
      const file = byName.get(name);
      if (!file || file.path.startsWith("server/")) return "";
      return `<script>${file.content}</script>`;
    });
}
