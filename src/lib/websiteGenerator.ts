/**
 * Full-stack website generator for the Web Development assistant.
 * Produces a static client plus a dependency-free Node API:
 *   GET /api/health, GET /api/site, GET /api/records, POST /api/records
 */

export const WEBSITE_KINDS = ["landing", "portfolio", "blog", "restaurant", "store", "dashboard"] as const;
export type WebsiteKind = (typeof WEBSITE_KINDS)[number];

export interface GeneratorFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export interface GeneratorNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: GeneratorNode[];
  isOpen?: boolean;
}

export interface WebsiteRequest {
  kind: WebsiteKind;
  title: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  files: GeneratorFile[];
  tree: GeneratorNode[];
  summary: string;
}

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date";
}

interface Palette {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  card: string;
  line: string;
}

interface Blueprint {
  kind: WebsiteKind;
  defaultTitle: string;
  kicker: string;
  tagline: string;
  heading: (title: string) => string;
  lede: string;
  heroImage: string;
  heroAlt: string;
  nav: { label: string; href: string }[];
  features: { title: string; text: string }[];
  highlightsTitle: string;
  highlights: { title: string; meta: string; text: string; image: string; alt: string }[];
  stats?: { label: string; value: string }[];
  recordLabel: string;
  recordHint: string;
  recordFields: Field[];
  records: Record<string, string>[];
  palette: Palette;
}

const BLUEPRINTS: Record<WebsiteKind, Blueprint> = {
  landing: {
    kind: "landing",
    defaultTitle: "Northstar",
    kicker: "Product site",
    tagline: "A launch page with a real API behind the form.",
    heading: (title) => `${title} ships the page and the server together.`,
    lede: "Tell the product story up front, then capture interest through a small JSON API you can run with Node.",
    heroImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    heroAlt: "Laptop on a desk with code on the screen",
    nav: [
      { label: "Product", href: "#top" },
      { label: "Features", href: "#features" },
      { label: "Contact", href: "#records" },
    ],
    features: [
      { title: "One client folder", text: "HTML, CSS, and JavaScript the preview can run without a build step." },
      { title: "Four API routes", text: "Health, site content, and a records collection for form submissions." },
      { title: "Run with Node", text: "node server/server.mjs serves the page and the API on one port." },
    ],
    highlightsTitle: "Where it fits",
    highlights: [
      { title: "Launch week", meta: "Marketing", text: "A single page for the offer, proof, and a working contact form.", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80", alt: "Team working around a table" },
      { title: "Demo day", meta: "Product", text: "Show the interface and the JSON the form writes.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80", alt: "People reviewing a plan" },
      { title: "Handoff", meta: "Engineering", text: "The same routes stay in place when you add a database later.", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80", alt: "Code on a monitor" },
    ],
    recordLabel: "Request a walkthrough",
    recordHint: "Saved through POST /api/records.",
    recordFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "company", label: "Company", type: "text" },
    ],
    records: [
      { name: "Amina Shah", email: "amina@northwind.dev", company: "Northwind" },
      { name: "Leo Park", email: "leo@fieldkit.io", company: "Fieldkit" },
    ],
    palette: { bg: "#f3f0e8", ink: "#1c2430", muted: "#5c6570", accent: "#0f6e56", accentInk: "#f4fbf7", card: "#fffdf8", line: "#e4ddd0" },
  },
  portfolio: {
    kind: "portfolio",
    defaultTitle: "Studio Hale",
    kicker: "Selected work",
    tagline: "A portfolio with a hire form backed by the API.",
    heading: (title) => `${title} shows the work, then takes the brief.`,
    lede: "Case studies stay in the client. Inquiries land in the records API so the preview and the Node server share one contract.",
    heroImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=80",
    heroAlt: "Hands arranging color swatches",
    nav: [
      { label: "Work", href: "#top" },
      { label: "Selected", href: "#highlights" },
      { label: "Hire", href: "#records" },
    ],
    features: [
      { title: "Case studies", text: "Three projects with photos, a short note, and a discipline label." },
      { title: "Inquiry form", text: "Name, email, and a project note posted as JSON." },
      { title: "Preview or server", text: "The editor preview keeps records locally. Node stores them in memory." },
    ],
    highlightsTitle: "Selected projects",
    highlights: [
      { title: "Cedar Market", meta: "Brand", text: "Identity and a stall map for a weekend food market.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80", alt: "Painted wall in a studio" },
      { title: "Kindred Type", meta: "Editorial", text: "A magazine cover system with a tight serif and wide margins.", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80", alt: "Open book on a table" },
      { title: "Low Tide", meta: "Digital", text: "A booking site for a ceramics studio, built as a quiet catalog.", image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=80", alt: "Ceramic vessels on a shelf" },
    ],
    recordLabel: "Send a brief",
    recordHint: "Posted to /api/records.",
    recordFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "note", label: "Project note", type: "text" },
    ],
    records: [
      { name: "Mara Ellison", email: "mara@kindred.co", note: "Rebrand for a small press" },
      { name: "Jonah Adeyemi", email: "jonah@lowtide.studio", note: "Catalog for a spring drop" },
    ],
    palette: { bg: "#f6f1ea", ink: "#231c16", muted: "#6b5e53", accent: "#b4482d", accentInk: "#fff8f4", card: "#fffaf4", line: "#eadfd2" },
  },
  blog: {
    kind: "blog",
    defaultTitle: "Field Notes",
    kicker: "Journal",
    tagline: "Essays on the page, notes through the API.",
    heading: (title) => `${title} is a journal with a comment box that persists.`,
    lede: "Stories are content. Replies are records. Both are described by GET /api/site and GET /api/records.",
    heroImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1600&q=80",
    heroAlt: "Stack of books",
    nav: [
      { label: "Journal", href: "#top" },
      { label: "Stories", href: "#highlights" },
      { label: "Note", href: "#records" },
    ],
    features: [
      { title: "Readable type", text: "A serif headline and a plain body column, sized for long reading." },
      { title: "Three stories", text: "Seeded essays the client renders without a framework." },
      { title: "Notes API", text: "Readers leave a name and a comment. POST /api/records stores it." },
    ],
    highlightsTitle: "Latest stories",
    highlights: [
      { title: "Maps that leave room", meta: "Essay", text: "Why a good legend is shorter than the territory it names.", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80", alt: "Library shelves" },
      { title: "Kitchen at 6am", meta: "Dispatch", text: "A short report from a bakery that opens before the street does.", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80", alt: "Plated food" },
      { title: "The second draft", meta: "Craft", text: "What to cut when the first version explains too much.", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80", alt: "Typewriter on a desk" },
    ],
    recordLabel: "Leave a note",
    recordHint: "Stored as a record.",
    recordFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "comment", label: "Comment", type: "text" },
    ],
    records: [
      { name: "Priya Nair", comment: "The bakery piece made me want a second cup." },
      { name: "Evan Cole", comment: "Cutting the second paragraph was the right call." },
    ],
    palette: { bg: "#f7f3ea", ink: "#221e19", muted: "#6d645b", accent: "#6e4b2a", accentInk: "#fffaf3", card: "#fffdf8", line: "#e7dfd2" },
  },
  restaurant: {
    kind: "restaurant",
    defaultTitle: "Harbor Table",
    kicker: "Dinner",
    tagline: "Menu, hours, and reservations on one API.",
    heading: (title) => `${title} takes the table, not just the picture.`,
    lede: "The menu is site content. A reservation is a record: name, party size, and a date.",
    heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    heroAlt: "A set dining table",
    nav: [
      { label: "Menu", href: "#highlights" },
      { label: "Dining", href: "#features" },
      { label: "Reserve", href: "#records" },
    ],
    features: [
      { title: "Evening service", text: "Wednesday to Sunday, from 5 until the kitchen closes at 10." },
      { title: "Small room", text: "Thirty seats, a window on the harbor, and a counter for four." },
      { title: "Reservations", text: "The form posts to /api/records and the list reloads from the API." },
    ],
    highlightsTitle: "From the menu",
    highlights: [
      { title: "Charred leek", meta: "First", text: "Brown butter, hazelnut, and a spoon of whey.", image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=900&q=80", alt: "A plated dish" },
      { title: "Line-caught hake", meta: "Main", text: "Fennel, mussel broth, and grilled bread.", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80", alt: "Seafood on a plate" },
      { title: "Olive oil cake", meta: "Last", text: "Citrus, cracked pepper, and cream.", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80", alt: "A slice of cake" },
    ],
    recordLabel: "Request a table",
    recordHint: "Party size and date go to the records API.",
    recordFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "party", label: "Party size", type: "number" },
      { name: "date", label: "Date", type: "date" },
    ],
    records: [
      { name: "Helen Cho", party: "2", date: "2026-09-26" },
      { name: "Samir Haddad", party: "4", date: "2026-09-27" },
    ],
    palette: { bg: "#f8f1e7", ink: "#2a1b14", muted: "#6f584c", accent: "#8f2d2d", accentInk: "#fff7f4", card: "#fff9f2", line: "#ead9c8" },
  },
  store: {
    kind: "store",
    defaultTitle: "Lumen Goods",
    kicker: "Shop",
    tagline: "A catalog and an order API, no framework.",
    heading: (title) => `${title} lists the goods and takes the order.`,
    lede: "Products live on the page. An order is a record with a name, an item, and a quantity.",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    heroAlt: "Clothing racks in a shop",
    nav: [
      { label: "Shop", href: "#top" },
      { label: "Pieces", href: "#highlights" },
      { label: "Order", href: "#records" },
    ],
    features: [
      { title: "Three pieces", text: "A lamp, a wool throw, and a stoneware cup, each with a photo." },
      { title: "Plain checkout", text: "No cart library. The form is the order." },
      { title: "JSON orders", text: "GET /api/records returns what has been placed." },
    ],
    highlightsTitle: "In the shop",
    highlights: [
      { title: "Arc lamp", meta: "$240", text: "Brass stem, linen shade, a warm pool of light.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80", alt: "A table lamp" },
      { title: "Harbor throw", meta: "$96", text: "Undyed wool, wide enough for two chairs.", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80", alt: "A styled living room" },
      { title: "Day cup", meta: "$32", text: "Speckled stoneware that stacks in a cupboard.", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80", alt: "Ceramic cups" },
    ],
    recordLabel: "Place an order",
    recordHint: "Item and quantity are stored as a record.",
    recordFields: [
      { name: "name", label: "Name", type: "text" },
      { name: "item", label: "Item", type: "text" },
      { name: "quantity", label: "Quantity", type: "number" },
    ],
    records: [
      { name: "Nora Blake", item: "Arc lamp", quantity: "1" },
      { name: "Chris Adelayo", item: "Day cup", quantity: "2" },
    ],
    palette: { bg: "#f4f2ec", ink: "#1b1a17", muted: "#5f5b54", accent: "#1e4d3a", accentInk: "#f3faf6", card: "#fffcf7", line: "#e3ddd2" },
  },
  dashboard: {
    kind: "dashboard",
    defaultTitle: "Pulse",
    kicker: "Operations",
    tagline: "A status board with tasks stored in the API.",
    heading: (title) => `${title} keeps today's work in one list.`,
    lede: "Numbers on the page, tasks in the records collection. Add a task and the list reads it back.",
    heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    heroAlt: "Analytics on a laptop",
    nav: [
      { label: "Overview", href: "#top" },
      { label: "Activity", href: "#highlights" },
      { label: "Tasks", href: "#records" },
    ],
    features: [
      { title: "Open tasks", text: "Twelve items waiting on a person, a review, or a deploy." },
      { title: "On-call", text: "The evening rotation is staffed. The morning handoff is at 9." },
      { title: "API health", text: "The status chip calls GET /api/health and shows live or preview." },
    ],
    highlightsTitle: "Recent activity",
    highlights: [
      { title: "Billing export", meta: "Shipped", text: "Nightly export finished in four minutes.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80", alt: "Charts on a screen" },
      { title: "Search index", meta: "Watching", text: "Lag is under a second after the morning rebuild.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80", alt: "Circuit board" },
      { title: "Inbox zero", meta: "Support", text: "The queue cleared before lunch.", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80", alt: "People in a meeting" },
    ],
    stats: [
      { label: "Open tasks", value: "12" },
      { label: "Deploys today", value: "3" },
      { label: "Uptime", value: "99.9%" },
    ],
    recordLabel: "Add a task",
    recordHint: "Title, owner, and status. POST /api/records.",
    recordFields: [
      { name: "title", label: "Title", type: "text" },
      { name: "owner", label: "Owner", type: "text" },
      { name: "status", label: "Status", type: "text" },
    ],
    records: [
      { title: "Review signup copy", owner: "Maya", status: "Doing" },
      { title: "Rotate the API key", owner: "Ibrahim", status: "Ready" },
    ],
    palette: { bg: "#eef3f6", ink: "#12202b", muted: "#526272", accent: "#0f5f78", accentInk: "#f3fbff", card: "#ffffff", line: "#d5e1e8" },
  },
};

const KIND_RULES: [RegExp, WebsiteKind][] = [
  [/\bportfolio\b/i, "portfolio"],
  [/\b(restaurant|cafe|café|bistro)\b/i, "restaurant"],
  [/\b(blog|magazine|journal)\b/i, "blog"],
  [/\b(e-?commerce|online store|store|shop)\b/i, "store"],
  [/\b(dashboard|admin panel|admin)\b/i, "dashboard"],
  [/\blanding\b/i, "landing"],
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function embedJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function slugify(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "full-stack-site";
}

function cleanTitle(raw: string, fallback: string): string {
  const title = raw.replace(/\s+/g, " ").trim().slice(0, 60);
  return title || fallback;
}

function extractTitle(text: string, fallback: string): string {
  const quoted = text.match(/["“']([^"”']{2,60})["”']/);
  if (quoted?.[1]) return cleanTitle(quoted[1], fallback);
  const named = text.match(/\b(?:called|named|titled)\s+([A-Za-z0-9][^.,!?\n]{1,48})/i);
  if (named?.[1]) {
    const candidate = named[1].replace(/\b(full[\s-]?stack|website|web\s*site|site|page|web app)\b/gi, "").trim();
    if (candidate.length > 1) return cleanTitle(candidate, fallback);
  }
  return fallback;
}

export function detectWebsiteRequest(text: string): WebsiteRequest | null {
  const source = text.trim();
  if (!source) return null;
  if (/^\s*(how|what|why|explain|debug|fix|teach)\b/i.test(source)) return null;
  if (/\bhow (do|can|to|would)\b/i.test(source)) return null;

  const action = /\b(generate|build|create|make|scaffold|design)\b/i.test(source);
  const wantsSite = /\b(full[\s-]?stack|website|web\s*site|\bsite\b|landing page|web app)\b/i.test(source);
  if (!action || !wantsSite) return null;

  const kind = KIND_RULES.find(([pattern]) => pattern.test(source))?.[1] ?? "landing";
  const blueprint = BLUEPRINTS[kind];
  return { kind, title: extractTitle(source, blueprint.defaultTitle) };
}

function sitePayload(blueprint: Blueprint, title: string) {
  return {
    title,
    kind: blueprint.kind,
    tagline: blueprint.tagline,
    kicker: blueprint.kicker,
    heading: blueprint.heading(title),
    lede: blueprint.lede,
    recordLabel: blueprint.recordLabel,
    recordHint: blueprint.recordHint,
    recordFields: blueprint.recordFields,
  };
}

function seededRecords(blueprint: Blueprint): Record<string, string>[] {
  return blueprint.records.map((row, index) => ({
    id: `seed-${index + 1}`,
    createdAt: `2026-09-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
    ...row,
  }));
}

function css(palette: Palette): string {
  return `:root {
  --bg: ${palette.bg};
  --ink: ${palette.ink};
  --muted: ${palette.muted};
  --accent: ${palette.accent};
  --accent-ink: ${palette.accentInk};
  --card: ${palette.card};
  --line: ${palette.line};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Outfit, "Segoe UI", sans-serif;
  line-height: 1.5;
}
img { max-width: 100%; }
h1, h2 { font-family: Fraunces, Georgia, serif; font-weight: 500; letter-spacing: -0.03em; margin: 0; }
body[data-kind="dashboard"] h1,
body[data-kind="dashboard"] h2 { font-family: Outfit, "Segoe UI", sans-serif; letter-spacing: -0.04em; }
a { color: inherit; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 7vw;
  position: sticky;
  top: 0;
  background: var(--card);
  border-bottom: 1px solid var(--line);
  z-index: 2;
}
.brand { font-weight: 600; text-decoration: none; }
.nav-links { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
.nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; }
.api-status { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
  padding: 72px 7vw 36px;
}
.kicker { text-transform: uppercase; letter-spacing: 0.16em; font-size: 12px; color: var(--accent); font-weight: 600; margin: 0 0 12px; }
.hero h1 { font-size: clamp(40px, 6vw, 72px); line-height: 0.96; }
.lede { font-size: 18px; color: var(--muted); max-width: 46ch; }
.hero-media { border-radius: 28px; overflow: hidden; background: var(--line); min-height: 320px; }
.hero-media img { width: 100%; height: 100%; object-fit: cover; min-height: 320px; display: block; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 28px; }
.stat { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; }
.stat strong { display: block; font-size: 28px; line-height: 1.1; }
.stat span { color: var(--muted); font-size: 13px; }
.band { padding: 12px 7vw 56px; }
.section-title { font-size: clamp(28px, 4vw, 40px); margin-bottom: 18px; }
.features, .highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature, .card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 18px;
}
.feature h3, .card h3 { margin: 8px 0; font-size: 20px; font-family: Fraunces, Georgia, serif; }
.feature p, .card p { margin: 0; color: var(--muted); }
.card img { width: 100%; height: 180px; object-fit: cover; border-radius: 14px; display: block; }
.meta { color: var(--accent); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
.record-layout { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 20px; align-items: start; }
.record-form, .record-panel { background: var(--card); border: 1px solid var(--line); border-radius: 20px; padding: 18px; }
.record-form p, .record-panel p { color: var(--muted); margin-top: 0; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
input {
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink);
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  font-weight: 450;
}
button {
  background: var(--accent);
  color: var(--accent-ink);
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.record-list { list-style: none; margin: 0; padding: 0; }
.record-list li { padding: 12px 0; border-bottom: 1px solid var(--line); }
.record-list strong { display: block; }
.record-list span { color: var(--muted); font-size: 13px; }
footer { padding: 8px 7vw 48px; color: var(--muted); font-size: 13px; }
body[data-kind="dashboard"] .hero-media { min-height: 220px; }
@media (max-width: 860px) {
  .hero, .features, .highlights, .record-layout, .stats { grid-template-columns: 1fr; }
  .nav, .hero, .band, footer { padding-left: 20px; padding-right: 20px; }
  .hero { padding-top: 36px; }
}
`;
}

function htmlDocument(blueprint: Blueprint, title: string): string {
  const safeTitle = escapeHtml(title);
  const nav = blueprint.nav
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join("");
  const features = blueprint.features
    .map((feature) => `<article class="feature"><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.text)}</p></article>`)
    .join("");
  const highlights = blueprint.highlights
    .map(
      (item) => `<article class="card">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" />
        <p class="meta">${escapeHtml(item.meta)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </article>`,
    )
    .join("");
  const stats = blueprint.stats
    ? `<div class="stats">${blueprint.stats
        .map((stat) => `<div class="stat"><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(stat.label)}</span></div>`)
        .join("")}</div>`
    : "";
  const fields = blueprint.recordFields
    .map(
      (field) =>
        `<label>${escapeHtml(field.label)}<input name="${escapeHtml(field.name)}" type="${field.type}" required /></label>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed data-kind="${blueprint.kind}">
  <header class="nav">
    <a class="brand" href="#top">${safeTitle}</a>
    <nav class="nav-links" aria-label="Primary">
      ${nav}
      <span id="api-status" class="api-status">Checking API</span>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="kicker">${escapeHtml(blueprint.kicker)}</p>
        <h1>${escapeHtml(blueprint.heading(title))}</h1>
        <p class="lede">${escapeHtml(blueprint.lede)}</p>
        ${stats}
      </div>
      <div class="hero-media">
        <img src="${escapeHtml(blueprint.heroImage)}" alt="${escapeHtml(blueprint.heroAlt)}" />
      </div>
    </section>
    <section class="band" id="features">
      <h2 class="section-title">How it is built</h2>
      <div class="features">${features}</div>
    </section>
    <section class="band" id="highlights">
      <h2 class="section-title">${escapeHtml(blueprint.highlightsTitle)}</h2>
      <div class="highlights">${highlights}</div>
    </section>
    <section class="band" id="records">
      <h2 class="section-title">${escapeHtml(blueprint.recordLabel)}</h2>
      <div class="record-layout">
        <form id="record-form" class="record-form">
          <p>${escapeHtml(blueprint.recordHint)}</p>
          ${fields}
          <button type="submit">${escapeHtml(blueprint.recordLabel)}</button>
        </form>
        <div class="record-panel">
          <p>Latest records</p>
          <ul id="record-list" class="record-list"></ul>
        </div>
      </div>
    </section>
  </main>
  <footer>
    <p>${safeTitle} · ${escapeHtml(blueprint.tagline)} · GET /api/health · GET /api/site · GET /api/records · POST /api/records</p>
  </footer>
  <script src="site.js"></script>
</body>
</html>
`;
}

function clientScript(blueprint: Blueprint, title: string): string {
  const site = sitePayload(blueprint, title);
  const records = seededRecords(blueprint);
  const fieldNames = blueprint.recordFields.map((field) => field.name);
  return `const SEED = ${embedJson({ ...site, records })};
const FIELDS = ${embedJson(fieldNames)};
const STORAGE_KEY = "lunor-site-records:" + SEED.title;

function escapeText(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function readLocalRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {}
  return SEED.records.slice();
}

function writeLocalRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {}
}

function request(path, options) {
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, 1200);
  return fetch(path, {
    method: options && options.method ? options.method : "GET",
    headers: { "Content-Type": "application/json" },
    body: options && options.body ? options.body : undefined,
    signal: controller.signal
  }).then(function (response) {
    clearTimeout(timer);
    if (!response.ok) throw new Error("Request failed");
    return response.json().then(function (data) { return { ok: true, data: data }; });
  }).catch(function () {
    clearTimeout(timer);
    return { ok: false, data: null };
  });
}

function renderRecords(records) {
  const list = document.getElementById("record-list");
  if (!list) return;
  if (!records.length) {
    list.innerHTML = "<li><span>No records yet.</span></li>";
    return;
  }
  list.innerHTML = records.map(function (record) {
    const bits = FIELDS.map(function (field) {
      return "<span>" + escapeText(field) + ": " + escapeText(record[field]) + "</span>";
    }).join(" · ");
    const label = record[FIELDS[0]] || record.id;
    return "<li><strong>" + escapeText(label) + "</strong><span>" + bits + "</span></li>";
  }).join("");
}

function setStatus(live) {
  const status = document.getElementById("api-status");
  if (!status) return;
  status.textContent = live ? "API live" : "Preview mode";
}

function load() {
  return Promise.all([
    request("/api/health"),
    request("/api/records")
  ]).then(function (results) {
    const live = results[0].ok === true;
    const records = results[1].ok ? results[1].data : readLocalRecords();
    setStatus(live);
    renderRecords(Array.isArray(records) ? records : []);
    return live;
  });
}

const form = document.getElementById("record-form");
if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const body = {};
    FIELDS.forEach(function (field) {
      const input = form.elements[field];
      body[field] = input ? String(input.value).slice(0, 240) : "";
    });
    request("/api/records", { method: "POST", body: JSON.stringify(body) }).then(function (result) {
      if (result.ok) {
        form.reset();
        return load();
      }
      const records = readLocalRecords();
      const record = { id: "local-" + Date.now(), createdAt: new Date().toISOString() };
      FIELDS.forEach(function (field) { record[field] = body[field]; });
      records.unshift(record);
      writeLocalRecords(records);
      setStatus(false);
      renderRecords(records);
      form.reset();
    });
  });
}

load();
`;
}

function serverSource(title: string): string {
  return `import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addRecord, getSite, listRecords } from "./store.mjs";

const SITE_TITLE = ${JSON.stringify(title)};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, "../client");
const port = Number(process.env.PORT ?? 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 10_000) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }

  let url;
  try {
    url = new URL(req.url || "/", "http://localhost");
  } catch {
    send(res, 400, { error: "Bad request" });
    return;
  }

  if (url.pathname === "/api/health" && req.method === "GET") {
    send(res, 200, { ok: true, service: SITE_TITLE });
    return;
  }
  if (url.pathname === "/api/site" && req.method === "GET") {
    send(res, 200, getSite());
    return;
  }
  if (url.pathname === "/api/records" && req.method === "GET") {
    send(res, 200, listRecords());
    return;
  }
  if (url.pathname === "/api/records" && req.method === "POST") {
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const record = addRecord(body);
      if (!record) {
        send(res, 400, { error: "A record needs at least one field." });
        return;
      }
      send(res, 201, record);
    } catch {
      send(res, 400, { error: "Invalid JSON body." });
    }
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, { error: "Method not allowed" });
    return;
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.resolve(clientDir, "." + requestedPath);
  if (filePath !== clientDir && !filePath.startsWith(clientDir + path.sep)) {
    send(res, 403, { error: "Forbidden" });
    return;
  }

  try {
    const file = await readFile(filePath);
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    send(res, 200, file, type);
  } catch {
    send(res, 404, { error: "Not found" });
  }
});

server.listen(port, () => {
  const address = server.address();
  const actual = address && typeof address === "object" ? address.port : port;
  console.log("LISTENING " + actual);
  console.log(${JSON.stringify(title)} + " running at http://localhost:" + actual);
});
`;
}

function storeSource(blueprint: Blueprint, title: string): string {
  const site = sitePayload(blueprint, title);
  const records = seededRecords(blueprint);
  const fields = blueprint.recordFields.map((field) => field.name);
  return `import { randomUUID } from "node:crypto";

const site = ${embedJson(site)};
const fields = ${embedJson(fields)};
let records = ${embedJson(records)};

export function getSite() {
  return { ...site };
}

export function listRecords() {
  return records.map((record) => ({ ...record }));
}

export function addRecord(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const record = { id: randomUUID(), createdAt: new Date().toISOString() };
  let filled = 0;
  for (const field of fields) {
    if (input[field] == null) continue;
    const value = String(input[field]).trim().slice(0, 240);
    if (!value) continue;
    record[field] = value;
    filled += 1;
  }
  if (!filled) return null;
  records = [record, ...records];
  return { ...record };
}
`;
}

function packageJson(title: string, kind: WebsiteKind): string {
  return JSON.stringify(
    {
      name: slugify(title),
      version: "1.0.0",
      private: true,
      description: `${title} — full-stack ${kind} website`,
      type: "module",
      scripts: {
        start: "node server/server.mjs",
        dev: "node server/server.mjs",
      },
    },
    null,
    2,
  ) + "\n";
}

function readme(title: string, kind: WebsiteKind): string {
  return [
    `# ${title}`,
    "",
    `Full-stack ${kind} website generated by the Lunor.AI Web Development assistant.`,
    "",
    "## Files",
    "",
    "- `client/index.html` — page",
    "- `client/styles.css` — styles",
    "- `client/site.js` — form, records, and API status",
    "- `server/server.mjs` — static files and API",
    "- `server/store.mjs` — site content and records",
    "",
    "## API",
    "",
    "- `GET /api/health`",
    "- `GET /api/site`",
    "- `GET /api/records`",
    "- `POST /api/records`",
    "",
    "## Run locally",
    "",
    "```bash",
    "node server/server.mjs",
    "```",
    "",
    "Open http://localhost:3000",
    "",
    "The editor preview renders the client immediately. Submissions stay in the browser until this server is running.",
    "",
  ].join("\n");
}

function fileTree(files: GeneratorFile[]): GeneratorNode[] {
  const byPath = Object.fromEntries(files.map((file) => [file.path, file]));
  const fileNode = (filePath: string): GeneratorNode => {
    const file = byPath[filePath];
    return {
      id: file.path,
      name: file.name,
      type: "file",
      language: file.language,
      content: file.content,
    };
  };
  return [
    {
      id: "client",
      name: "client",
      type: "folder",
      isOpen: true,
      children: [fileNode("client/index.html"), fileNode("client/styles.css"), fileNode("client/site.js")],
    },
    {
      id: "server",
      name: "server",
      type: "folder",
      isOpen: true,
      children: [fileNode("server/server.mjs"), fileNode("server/store.mjs")],
    },
    fileNode("package.json"),
    fileNode("README.md"),
  ];
}

export function generateWebsite(input: { kind?: WebsiteKind; title?: string; prompt?: string } = {}): GeneratedWebsite {
  const fromPrompt = input.prompt ? detectWebsiteRequest(input.prompt) : null;
  const kind = input.kind || fromPrompt?.kind || "landing";
  const blueprint = BLUEPRINTS[kind];
  const title = cleanTitle(input.title || fromPrompt?.title || blueprint.defaultTitle, blueprint.defaultTitle);
  const files: GeneratorFile[] = [
    { path: "client/index.html", name: "index.html", language: "html", content: htmlDocument(blueprint, title) },
    { path: "client/styles.css", name: "styles.css", language: "css", content: css(blueprint.palette) },
    { path: "client/site.js", name: "site.js", language: "javascript", content: clientScript(blueprint, title) },
    { path: "server/server.mjs", name: "server.mjs", language: "javascript", content: serverSource(title) },
    { path: "server/store.mjs", name: "store.mjs", language: "javascript", content: storeSource(blueprint, title) },
    { path: "package.json", name: "package.json", language: "json", content: packageJson(title, kind) },
    { path: "README.md", name: "README.md", language: "markdown", content: readme(title, kind) },
  ];
  const summary = [
    `Built a full-stack **${kind}** website called **${title}**.`,
    "",
    "The project is in the editor and the preview is open.",
    "",
    "- `client/index.html`, `client/styles.css`, `client/site.js`",
    "- `server/server.mjs`, `server/store.mjs`",
    "- `package.json`, `README.md`",
    "",
    "API: `GET /api/health`, `GET /api/site`, `GET /api/records`, `POST /api/records`.",
    "",
    "Run it locally with `node server/server.mjs`. In the preview, records stay in the browser until that server is running.",
  ].join("\n");

  return { kind, title, files, tree: fileTree(files), summary };
}

export const FULL_STACK_SITE_TEMPLATE = {
  id: "full-stack-site",
  name: "Full-Stack Website",
  description: "Client plus a Node API",
  icon: "🏗️",
};
