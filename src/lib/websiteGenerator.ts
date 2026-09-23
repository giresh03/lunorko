/**
 * Full-stack website generator for the Web Development assistant.
 * Each blueprint writes a previewable client and an Express API.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "store" | "dashboard";

export interface WebsiteBlueprint {
  id: WebsiteKind;
  label: string;
  description: string;
  icon: string;
  prompt: string;
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "landing",
    label: "Landing",
    description: "Hero, pricing, contact API",
    icon: "✦",
    prompt: "Build a full-stack landing website",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Projects, skills, contact API",
    icon: "◈",
    prompt: "Build a portfolio website with an API",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Posts API and subscribe form",
    icon: "✎",
    prompt: "Build a blog website with a posts API",
  },
  {
    id: "store",
    label: "Store",
    description: "Catalog, cart, orders API",
    icon: "▢",
    prompt: "Build an online store website",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Stats, activity, notes API",
    icon: "▣",
    prompt: "Build a dashboard website with a stats API",
  },
];

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  files: GeneratedFile[];
  summary: string;
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

interface Feature {
  title: string;
  text: string;
}

interface Card {
  id: string;
  title: string;
  text: string;
  image: string;
  price?: number;
  tag?: string;
}

interface Plan {
  name: string;
  price: string;
  points: string[];
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
}

interface Stat {
  label: string;
  value: string;
  delta: string;
}

interface Activity {
  id: string;
  name: string;
  action: string;
  time: string;
}

interface Profile {
  role: string;
  bio: string;
  skills: string[];
}

interface SiteSeed {
  kind: WebsiteKind;
  title: string;
  tagline: string;
  accent: string;
  features: Feature[];
  plans: Plan[];
  profile: Profile;
  projects: Card[];
  posts: Post[];
  products: Card[];
  stats: Stat[];
  activity: Activity[];
  messages: [];
  subscribers: [];
  orders: [];
  notes: [];
}

const DEFAULT_TITLES: Record<WebsiteKind, string> = {
  landing: "Northwind",
  portfolio: "Avery Lane",
  blog: "Field Notes",
  store: "Harbor Goods",
  dashboard: "Pulse",
};

const ACCENTS: Record<WebsiteKind, string> = {
  landing: "#2dd4bf",
  portfolio: "#a78bfa",
  blog: "#fbbf24",
  store: "#fb7185",
  dashboard: "#38bdf8",
};

const TAGLINES: Record<WebsiteKind, string> = {
  landing: "A marketing site with a clear offer, pricing, and a contact API.",
  portfolio: "Selected work, a short bio, and a contact endpoint.",
  blog: "Essays served by a posts API, with a subscribe form.",
  store: "A small catalog, a cart, and an orders API.",
  dashboard: "Operational stats, a live activity list, and notes.",
};

const STOP_WORDS = new Set([
  "please", "build", "create", "generate", "make", "scaffold", "design", "spin", "up", "start",
  "a", "an", "the", "full", "stack", "fullstack", "full-stack", "website", "web", "site", "page",
  "for", "me", "with", "using", "html", "css", "javascript", "node", "express", "api", "online",
  "my", "and", "of", "to", "landing", "portfolio", "blog", "store", "dashboard", "stats", "posts",
]);

export function inferSiteTitle(prompt: string, fallback = "Lunor"): string {
  const words = prompt
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word && !STOP_WORDS.has(word.toLowerCase()));
  if (words.length === 0) return fallback;
  return words
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .slice(0, 48);
}

export function detectWebsiteRequest(input: string): WebsiteKind | null {
  const text = input.trim();
  if (!text) return null;
  const asksToBuild = /\b(build|create|generate|make|scaffold|design|spin up|start)\b/i.test(text)
    || /\bwebsite generator\b/i.test(text)
    || /\bfull[- ]stack\b/i.test(text);
  if (!asksToBuild) return null;
  if (/\b(fix|debug|error|bug|why|explain|refactor)\b/i.test(text) && !/\b(build|create|generate|scaffold)\b/i.test(text)) {
    return null;
  }
  const rules: { kind: WebsiteKind; pattern: RegExp }[] = [
    { kind: "store", pattern: /\b(store|shop|ecommerce|e-commerce|catalog|cart)\b/i },
    { kind: "blog", pattern: /\b(blog|articles?|magazine)\b/i },
    { kind: "dashboard", pattern: /\b(dashboard|admin panel|analytics)\b/i },
    { kind: "portfolio", pattern: /\b(portfolio|personal site|case stud(?:y|ies))\b/i },
    { kind: "landing", pattern: /\b(landing|marketing|homepage|full[- ]stack|website|web site)\b/i },
  ];
  for (const rule of rules) {
    if (rule.pattern.test(text)) return rule.kind;
  }
  return null;
}

function photo(seed: string): string {
  return `https://picsum.photos/seed/${seed}/960/640`;
}

function generalSeed(kind: WebsiteKind, title: string, tagline: string): SiteSeed {
  return {
    kind,
    title,
    tagline,
    accent: ACCENTS[kind],
    features: [
      { title: "A clear first screen", text: "The hero states who it is for and what to do next." },
      { title: "Proof close to the offer", text: "Features, work, or products sit above the fold on a wide screen." },
      { title: "An API behind the form", text: "Submissions post to Express and fall back to sample data in the preview." },
    ],
    plans: [
      { name: "Starter", price: "$0", points: ["One page", "Preview in the editor", "Sample content"] },
      { name: "Studio", price: "$29", points: ["Custom sections", "Contact API", "Your own copy"] },
      { name: "Scale", price: "$79", points: ["MongoDB optional", "Multiple records", "Deploy the server"] },
    ],
    profile: {
      role: "Product designer and frontend engineer",
      bio: "I design calm interfaces and ship the HTML, CSS, and API that hold them up.",
      skills: ["HTML", "CSS", "JavaScript", "Express", "Accessibility"],
    },
    projects: [
      { id: "atlas", title: "Atlas Archive", text: "A research library with quiet type and a fast index.", image: photo("atlas-archive"), tag: "Web" },
      { id: "harbor", title: "Harbor Notes", text: "Editorial layout for a coastal magazine.", image: photo("harbor-notes"), tag: "Editorial" },
      { id: "lumen", title: "Lumen Kit", text: "Component kit for a hardware startup.", image: photo("lumen-kit"), tag: "Product" },
    ],
    posts: [
      { id: "type", title: "Type that can be read at arm's length", excerpt: "Pick a serif for headlines, keep body copy near 18px, and let sections breathe.", tag: "Design", date: "Mar 2" },
      { id: "api", title: "Put the form on a real route", excerpt: "A contact form should POST JSON, validate it, and say what happened.", tag: "API", date: "Mar 18" },
      { id: "preview", title: "Preview first, server second", excerpt: "The page has sample data so it renders before Node is running.", tag: "Workflow", date: "Apr 4" },
    ],
    products: [
      { id: "mug", title: "Stoneware Mug", text: "Speckled clay, holds 300ml.", image: photo("stoneware-mug"), price: 28, tag: "Home" },
      { id: "throw", title: "Wool Throw", text: "Undyed wool, charcoal edge.", image: photo("wool-throw"), price: 96, tag: "Home" },
      { id: "lamp", title: "Desk Lamp", text: "Brass stem, linen shade.", image: photo("desk-lamp"), price: 140, tag: "Light" },
      { id: "bowl", title: "Serving Bowl", text: "Wide rim for the table.", image: photo("serving-bowl"), price: 54, tag: "Table" },
    ],
    stats: [
      { label: "Open orders", value: "18", delta: "+3 today" },
      { label: "Response time", value: "240ms", delta: "p95" },
      { label: "Active sessions", value: "126", delta: "last hour" },
      { label: "Notes filed", value: "9", delta: "this week" },
    ],
    activity: [
      { id: "a1", name: "Mina Cole", action: "Published the spring menu", time: "2m ago" },
      { id: "a2", name: "Jon Park", action: "Updated shipping rates", time: "18m ago" },
      { id: "a3", name: "Leah Ortiz", action: "Replied to a contact message", time: "1h ago" },
      { id: "a4", name: "System", action: "Health check passed", time: "1h ago" },
    ],
    messages: [],
    subscribers: [],
    orders: [],
    notes: [],
  };
}

function applyTitlePack(seed: SiteSeed): SiteSeed {
  const title = seed.title.toLowerCase();
  if (/coffee|cafe|tea|bakery/.test(title)) {
    return {
      ...seed,
      tagline: seed.kind === "store"
        ? `${seed.title} — drinks, a cart, and an orders API.`
        : `${seed.title} — a warm offer, a short menu, and a contact API.`,
      features: [
        { title: "Today's roast", text: "Lead with the drink people came for." },
        { title: "A short menu", text: "A few items with prices, not a catalog dump." },
        { title: "Orders that land", text: "The cart posts to /api/orders when the server is up." },
      ],
      products: [
        { id: "espresso", title: "House Espresso", text: "Short, sweet, pulled to order.", image: photo("house-espresso"), price: 3.5, tag: "Drink" },
        { id: "latte", title: "Cardamom Latte", text: "Oat or dairy, dusted to finish.", image: photo("cardamom-latte"), price: 5, tag: "Drink" },
        { id: "bun", title: "Morning Bun", text: "Orange sugar, still warm.", image: photo("morning-bun"), price: 4, tag: "Bake" },
        { id: "cup", title: "Ceramic Cup", text: "Take the house cup home.", image: photo("ceramic-cup"), price: 22, tag: "Home" },
      ],
    };
  }
  if (/fit|gym|yoga|health/.test(title)) {
    return {
      ...seed,
      tagline: `${seed.title} — sessions, plans, and a booking API.`,
      products: [
        { id: "intro", title: "Intro Session", text: "Forty minutes with a coach.", image: photo("intro-session"), price: 30, tag: "Train" },
        { id: "block", title: "Strength Block", text: "Four weeks, three days.", image: photo("strength-block"), price: 80, tag: "Train" },
        { id: "recover", title: "Recovery Hour", text: "Mobility and quiet.", image: photo("recovery-hour"), price: 40, tag: "Recover" },
      ],
    };
  }
  if (seed.title !== DEFAULT_TITLES[seed.kind]) {
    const custom: Record<WebsiteKind, string> = {
      landing: `${seed.title} — a landing page with pricing and a contact API.`,
      portfolio: `${seed.title} — projects, skills, and a contact API.`,
      blog: `${seed.title} — posts from the API and a subscribe form.`,
      store: `${seed.title} — a catalog, cart, and orders API.`,
      dashboard: `${seed.title} — stats, activity, and notes from the API.`,
    };
    return { ...seed, tagline: custom[seed.kind] };
  }
  return seed;
}

function buildSeed(kind: WebsiteKind, title: string): SiteSeed {
  const resolved = title.trim() || DEFAULT_TITLES[kind];
  return applyTitlePack(generalSeed(kind, resolved, TAGLINES[kind]));
}

function embedJson(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch
  ));
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lunor-site";
}

function languageFor(path: string): string {
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  return "javascript";
}

function file(path: string, content: string): GeneratedFile {
  return { path, language: languageFor(path), content };
}

const CLIENT_CSS = `/* Lunor website client. Accent comes from --accent, set by site.js. */
:root {
  --accent: #2dd4bf;
  --bg: #0b1020;
  --bg-raise: #141a2e;
  --line: rgba(231, 236, 245, 0.12);
  --text: #e7ecf5;
  --muted: #93a0b8;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
  font-family: Outfit, "Segoe UI", sans-serif;
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
button, input, textarea { font: inherit; color: inherit; }
.wrap { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
}
.brand { font-weight: 600; letter-spacing: -0.03em; text-decoration: none; }
.nav-links { display: flex; gap: 18px; align-items: center; }
.nav-links a { color: var(--muted); text-decoration: none; font-size: 0.95rem; }
.nav-links a:hover { color: var(--text); }
.nav-toggle { display: none; background: transparent; border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; }
.hero { padding: 48px 0 24px; }
.eyebrow { color: var(--accent); letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.75rem; margin: 0 0 12px; }
h1, h2, h3 { font-family: Fraunces, Georgia, serif; font-weight: 560; letter-spacing: -0.03em; margin: 0; }
h1 { font-size: clamp(2.6rem, 6vw, 5rem); line-height: 0.95; max-width: 12ch; }
h2 { font-size: clamp(1.8rem, 3vw, 2.4rem); margin-bottom: 18px; }
.lede { max-width: 42rem; color: var(--muted); font-size: 1.1rem; }
.btn, .btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  text-decoration: none;
  border: 0;
  cursor: pointer;
}
.btn { background: var(--accent); color: #081018; font-weight: 600; }
.btn-ghost { background: transparent; border: 1px solid var(--line); }
.section { padding: 28px 0 10px; }
.grid { display: grid; gap: 16px; }
.cards-3 { grid-template-columns: repeat(3, 1fr); }
.cards-4 { grid-template-columns: repeat(4, 1fr); }
.card, .plan, .post, .stat, .table-wrap, form, .cart {
  background: color-mix(in srgb, var(--bg-raise) 88%, transparent);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
}
.card, .plan, .post { overflow: hidden; }
.card img { height: 180px; width: 100%; object-fit: cover; }
.card div, .plan, .post, .stat { padding: 16px; }
.card p, .post p, .muted { color: var(--muted); }
.tag {
  display: inline-flex;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.plan strong { display: block; font-size: 1.6rem; margin: 8px 0; }
.plan li { margin: 6px 0; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
form { padding: 16px; display: grid; gap: 10px; }
label { display: grid; gap: 6px; font-size: 0.9rem; color: var(--muted); }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(8, 12, 24, 0.45);
  padding: 12px 14px;
}
textarea { min-height: 110px; resize: vertical; }
.status { min-height: 1.2em; color: var(--accent); }
.footer { padding: 28px 0 40px; color: var(--muted); font-size: 0.9rem; }
.shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
.side { padding: 22px 18px; border-right: 1px solid var(--line); }
.side p { color: var(--muted); }
.main { padding: 22px; }
.stats { grid-template-columns: repeat(4, 1fr); }
.stat span { color: var(--muted); font-size: 0.85rem; }
.stat strong { display: block; font-size: 1.8rem; margin-top: 6px; }
.table-wrap { overflow: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--line); }
th { color: var(--muted); font-weight: 500; font-size: 0.8rem; }
.cart { margin-top: 16px; padding: 16px; }
.price { color: var(--accent); font-weight: 600; }
@media (max-width: 900px) {
  .cards-3, .cards-4, .stats { grid-template-columns: 1fr 1fr; }
  .shell { grid-template-columns: 1fr; }
  .side { border-right: 0; border-bottom: 1px solid var(--line); }
}
@media (max-width: 640px) {
  .cards-3, .cards-4, .stats { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  .nav-links {
    display: none;
    position: absolute;
    top: 64px;
    right: 16px;
    left: 16px;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    background: var(--bg-raise);
    border: 1px solid var(--line);
    border-radius: 16px;
  }
  .nav-links.open { display: flex; }
  header.nav { position: relative; }
}
`;

const CLIENT_RUNTIME = `function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
  });
}

function money(value) {
  return "$" + Number(value || 0).toFixed(2);
}

async function loadJson(path) {
  try {
    var response = await fetch(path);
    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    return null;
  }
}

function nav(links) {
  return '<header class="nav wrap"><a class="brand" href="#top">' + esc(SITE.title) + '</a>'
    + '<button class="nav-toggle" type="button" data-nav-toggle>Menu</button><nav class="nav-links">'
    + links.map(function (link) {
      return '<a href="#' + esc(link.href) + '">' + esc(link.label) + '</a>';
    }).join("")
    + '</nav></header>';
}

function hero(label, href) {
  return '<section class="hero" id="top"><div class="wrap"><p class="eyebrow">Full-stack site</p><h1>'
    + esc(SITE.title) + '</h1><p class="lede">' + esc(SITE.tagline) + '</p><p><a class="btn" href="#'
    + esc(href) + '">' + esc(label) + '</a></p></div></section>';
}

function cards(list) {
  return '<div class="grid cards-3">' + list.map(function (item) {
    return '<article class="card">' + (item.image ? '<img alt="" src="' + esc(item.image) + '">' : '')
      + '<div>' + (item.tag ? '<span class="tag">' + esc(item.tag) + '</span>' : '')
      + '<h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p>'
      + (item.price != null ? '<p class="price">' + money(item.price) + '</p>' : '')
      + (item.price != null ? '<button class="btn" type="button" data-add="' + esc(item.id) + '">Add to cart</button>' : '')
      + '</div></article>';
  }).join("") + '</div>';
}

function form(endpoint, fields, submitLabel) {
  return '<form data-endpoint="' + esc(endpoint) + '">' + fields.map(function (field) {
    var control = field.kind === "textarea"
      ? '<textarea name="' + esc(field.name) + '" required></textarea>'
      : '<input name="' + esc(field.name) + '" type="' + esc(field.kind) + '" required>';
    return '<label>' + esc(field.label) + control + '</label>';
  }).join("") + '<button class="btn" type="submit">' + esc(submitLabel) + '</button><p class="status" data-status></p></form>';
}

function renderLanding(data) {
  return nav([{ href: "features", label: "Features" }, { href: "pricing", label: "Pricing" }, { href: "contact", label: "Contact" }])
    + hero("Talk to us", "contact")
    + '<section class="section" id="features"><div class="wrap"><h2>What you get</h2>' + cards(data.features.map(function (feature) {
      return { id: feature.title, title: feature.title, text: feature.text };
    })) + '</div></section>'
    + '<section class="section" id="pricing"><div class="wrap"><h2>Pricing</h2><div class="grid cards-3">'
    + data.plans.map(function (plan) {
      return '<article class="plan"><h3>' + esc(plan.name) + '</h3><strong>' + esc(plan.price) + '</strong><ul>'
        + plan.points.map(function (point) { return '<li>' + esc(point) + '</li>'; }).join("")
        + '</ul></article>';
    }).join("") + '</div></div></section>'
    + '<section class="section" id="contact"><div class="wrap"><h2>Contact</h2>'
    + form("/api/messages", [
      { name: "name", label: "Name", kind: "text" },
      { name: "email", label: "Email", kind: "email" },
      { name: "message", label: "Message", kind: "textarea" },
    ], "Send message") + '</div></section>';
}

function renderPortfolio(data) {
  return nav([{ href: "work", label: "Work" }, { href: "about", label: "About" }, { href: "contact", label: "Contact" }])
    + hero("See the work", "work")
    + '<section class="section" id="work"><div class="wrap"><h2>Selected work</h2>' + cards(data.projects) + '</div></section>'
    + '<section class="section" id="about"><div class="wrap"><h2>About</h2><p class="lede">' + esc(data.profile.bio) + '</p><p class="tag">'
    + esc(data.profile.role) + '</p><div class="filters">' + data.profile.skills.map(function (skill) {
      return '<span class="btn-ghost">' + esc(skill) + '</span>';
    }).join("") + '</div></div></section>'
    + '<section class="section" id="contact"><div class="wrap"><h2>Contact</h2>'
    + form("/api/messages", [
      { name: "name", label: "Name", kind: "text" },
      { name: "email", label: "Email", kind: "email" },
      { name: "message", label: "Project note", kind: "textarea" },
    ], "Send note") + '</div></section>';
}

function renderBlog(data) {
  var tags = ["All"].concat(data.posts.map(function (post) { return post.tag; }).filter(function (tag, index, list) {
    return list.indexOf(tag) === index;
  }));
  return nav([{ href: "posts", label: "Posts" }, { href: "subscribe", label: "Subscribe" }])
    + hero("Read the notes", "posts")
    + '<section class="section" id="posts"><div class="wrap"><h2>Posts</h2><div class="filters" data-filters>'
    + tags.map(function (tag) {
      return '<button class="btn-ghost" type="button" data-tag="' + esc(tag) + '">' + esc(tag) + '</button>';
    }).join("") + '</div><div class="grid cards-3" id="post-list">' + data.posts.map(function (post) {
      return '<article class="post" data-post-tag="' + esc(post.tag) + '"><div><span class="tag">' + esc(post.tag) + '</span><h3>'
        + esc(post.title) + '</h3><p>' + esc(post.excerpt) + '</p><p class="muted">' + esc(post.date) + '</p></div></article>';
    }).join("") + '</div></div></section>'
    + '<section class="section" id="subscribe"><div class="wrap"><h2>Subscribe</h2>'
    + form("/api/subscribers", [{ name: "email", label: "Email", kind: "email" }], "Subscribe") + '</div></section>';
}

function renderStore(data) {
  return nav([{ href: "catalog", label: "Catalog" }, { href: "cart", label: "Cart" }])
    + hero("Shop the edit", "catalog")
    + '<section class="section" id="catalog"><div class="wrap"><h2>Catalog</h2><div id="product-list">'
    + cards(data.products) + '</div><div class="cart" id="cart"><h3>Cart <span id="cart-count">0</span></h3><div id="cart-lines"></div><p class="price" id="cart-total">$0.00</p>'
    + form("/api/orders", [
      { name: "name", label: "Name", kind: "text" },
      { name: "email", label: "Email", kind: "email" },
    ], "Place order") + '</div></div></section>';
}

function renderDashboard(data) {
  return '<div class="shell"><aside class="side"><a class="brand" href="#top">' + esc(data.title) + '</a><p>'
    + esc(data.tagline) + '</p></aside><main class="main" id="top"><h1>' + esc(data.title) + '</h1>'
    + '<section class="section" id="stats"><h2>Stats</h2><div class="grid stats">' + data.stats.map(function (stat) {
      return '<article class="stat"><span>' + esc(stat.label) + '</span><strong>' + esc(stat.value) + '</strong><p class="muted">'
        + esc(stat.delta) + '</p></article>';
    }).join("") + '</div></section><section class="section" id="activity"><h2>Activity</h2><div class="table-wrap"><table><thead><tr><th>Who</th><th>What</th><th>When</th></tr></thead><tbody>'
    + data.activity.map(function (row) {
      return '<tr><td>' + esc(row.name) + '</td><td>' + esc(row.action) + '</td><td>' + esc(row.time) + '</td></tr>';
    }).join("") + '</tbody></table></div></section><section class="section" id="notes"><h2>Note</h2>'
    + form("/api/notes", [{ name: "text", label: "What happened", kind: "textarea" }], "Save note")
    + '</section></main></div>';
}

var current = SITE;
var bound = false;

function render(data) {
  var root = document.getElementById("app");
  if (!root) return;
  current = data;
  var page = "";
  if (data.kind === "dashboard") page = renderDashboard(data);
  else if (data.kind === "store") page = renderStore(data);
  else if (data.kind === "blog") page = renderBlog(data);
  else if (data.kind === "portfolio") page = renderPortfolio(data);
  else page = renderLanding(data);
  root.innerHTML = page + '<footer class="footer wrap">Client preview uses sample data. Start the Express server to serve /api/health and this page together.</footer>';
  document.title = data.title;
  document.documentElement.style.setProperty("--accent", data.accent || "#2dd4bf");
  if (!bound) {
    bindPage();
    bound = true;
  } else if (data.kind === "store") {
    paintCart(data.products || []);
  }
}

var CART_KEY = "lunor-website-cart";

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch (error) { return []; }
}

function writeCart(lines) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); }
  catch (error) { /* preview storage can be blocked */ }
}

function paintCart(products) {
  var lines = readCart();
  var count = document.getElementById("cart-count");
  var host = document.getElementById("cart-lines");
  var total = document.getElementById("cart-total");
  if (!host || !count || !total) return;
  count.textContent = String(lines.reduce(function (sum, line) { return sum + line.qty; }, 0));
  host.innerHTML = lines.map(function (line) {
    var product = products.find(function (item) { return item.id === line.id; });
    var name = product ? product.title : line.id;
    var price = product ? product.price : 0;
    return '<p>' + esc(name) + ' × ' + line.qty + ' <span class="price">' + money(price * line.qty) + '</span></p>';
  }).join("") || '<p class="muted">Your cart is empty.</p>';
  var amount = lines.reduce(function (sum, line) {
    var product = products.find(function (item) { return item.id === line.id; });
    return sum + (product ? product.price : 0) * line.qty;
  }, 0);
  total.textContent = money(amount);
}

function bindPage() {
  document.body.addEventListener("click", function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-nav-toggle]")) {
      var links = document.querySelector(".nav-links");
      if (links) links.classList.toggle("open");
    }
    var add = target.closest("[data-add]");
    if (add) {
      var id = add.getAttribute("data-add");
      var lines = readCart();
      var existing = lines.find(function (line) { return line.id === id; });
      if (existing) existing.qty += 1;
      else lines.push({ id: id, qty: 1 });
      writeCart(lines);
      paintCart(current.products || []);
    }
    var tagButton = target.closest("[data-tag]");
    if (tagButton) {
      var tag = tagButton.getAttribute("data-tag");
      document.querySelectorAll("[data-post-tag]").forEach(function (post) {
        post.hidden = tag !== "All" && post.getAttribute("data-post-tag") !== tag;
      });
    }
  });

  document.body.addEventListener("submit", async function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.dataset.endpoint) return;
    event.preventDefault();
    var status = form.querySelector("[data-status]");
    var payload = Object.fromEntries(new FormData(form).entries());
    if (form.dataset.endpoint === "/api/orders") payload.items = readCart();
    try {
      var response = await fetch(form.dataset.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Request failed");
      var body = await response.json();
      if (status) status.textContent = body.message || "Saved on the server.";
      if (form.dataset.endpoint === "/api/orders") {
        writeCart([]);
        paintCart(current.products || []);
      }
    } catch (error) {
      if (status) status.textContent = "Preview mode saved this locally. Start the API to persist it.";
    }
    form.reset();
  });

  if (current.kind === "store") paintCart(current.products || []);
}

async function boot() {
  render(SITE);
  var extra = null;
  if (SITE.kind === "landing") {
    extra = await loadJson("/api/content");
  } else if (SITE.kind === "portfolio") {
    var projects = await loadJson("/api/projects");
    var profile = await loadJson("/api/profile");
    if (projects || profile) extra = Object.assign({}, projects || {}, profile || {});
  } else if (SITE.kind === "blog") {
    extra = await loadJson("/api/posts");
  } else if (SITE.kind === "store") {
    extra = await loadJson("/api/products");
  } else if (SITE.kind === "dashboard") {
    var stats = await loadJson("/api/stats");
    var activity = await loadJson("/api/activity");
    if (stats || activity) extra = Object.assign({}, stats || {}, activity || {});
  }
  if (extra) render(Object.assign({}, current, extra));
}

if (document.getElementById("app")) boot();
else document.addEventListener("DOMContentLoaded", boot);
`;

function clientHtml(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed>
  <div id="app"></div>
  <script src="site.js"></script>
</body>
</html>
`;
}

function clientJs(seed: SiteSeed): string {
  return "// Lunor website client. The preview renders SITE immediately.\n"
    + "// When the Express server is running, boot() replaces lists from /api/*.\n"
    + "const SITE = " + embedJson(seed) + ";\n\n"
    + CLIENT_RUNTIME;
}

function apiModule(): string {
  return `// @lunor-backend
import express from "express";

function text(value, max) {
  return String(value || "").trim().slice(0, max);
}

export function createApiRouter(db) {
  const router = express.Router();

  router.get("/health", async (_req, res) => {
    const site = await db.readSite();
    res.json({ ok: true, mode: db.mode, kind: site.kind, title: site.title });
  });

  router.get("/content", async (_req, res) => {
    const site = await db.readSite();
    res.json({ title: site.title, tagline: site.tagline, features: site.features, plans: site.plans });
  });

  router.get("/profile", async (_req, res) => {
    const site = await db.readSite();
    res.json({ profile: site.profile });
  });

  router.get("/projects", async (_req, res) => {
    const site = await db.readSite();
    res.json({ projects: site.projects });
  });

  router.get("/posts", async (_req, res) => {
    const site = await db.readSite();
    res.json({ posts: site.posts });
  });

  router.get("/posts/:id", async (req, res) => {
    const site = await db.readSite();
    const post = (site.posts || []).find((item) => item.id === req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json({ post });
  });

  router.get("/products", async (_req, res) => {
    const site = await db.readSite();
    res.json({ products: site.products });
  });

  router.get("/stats", async (_req, res) => {
    const site = await db.readSite();
    res.json({ stats: site.stats });
  });

  router.get("/activity", async (_req, res) => {
    const site = await db.readSite();
    res.json({ activity: site.activity });
  });

  router.post("/messages", async (req, res) => {
    const record = {
      id: Date.now().toString(36),
      name: text(req.body?.name, 80),
      email: text(req.body?.email, 120),
      message: text(req.body?.message, 1000),
      createdAt: new Date().toISOString(),
    };
    if (!record.name || !record.email || !record.message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }
    await db.push("messages", record);
    res.status(201).json({ ok: true, message: "Message received.", record });
  });

  router.post("/subscribers", async (req, res) => {
    const record = {
      id: Date.now().toString(36),
      email: text(req.body?.email, 120),
      createdAt: new Date().toISOString(),
    };
    if (!record.email) return res.status(400).json({ error: "Email is required." });
    await db.push("subscribers", record);
    res.status(201).json({ ok: true, message: "Subscribed.", record });
  });

  router.post("/orders", async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items.slice(0, 30) : [];
    const record = {
      id: Date.now().toString(36),
      name: text(req.body?.name, 80),
      email: text(req.body?.email, 120),
      items: items.map((item) => ({ id: text(item?.id, 40), qty: Math.max(1, Math.min(20, Number(item?.qty) || 1)) })),
      createdAt: new Date().toISOString(),
    };
    if (!record.name || !record.email || record.items.length === 0) {
      return res.status(400).json({ error: "Name, email, and at least one item are required." });
    }
    await db.push("orders", record);
    res.status(201).json({ ok: true, message: "Order placed.", record });
  });

  router.post("/notes", async (req, res) => {
    const record = {
      id: Date.now().toString(36),
      text: text(req.body?.text, 500),
      createdAt: new Date().toISOString(),
    };
    if (!record.text) return res.status(400).json({ error: "Note text is required." });
    await db.push("notes", record);
    res.status(201).json({ ok: true, message: "Note saved.", record });
  });

  return router;
}
`;
}

function dbModule(): string {
  return `// @lunor-backend
export function createDb() {
  let memory = null;
  let mode = "memory";
  let collection = null;

  return {
    get mode() {
      return mode;
    },
    async connect(seed) {
      memory = structuredClone(seed);
      const uri = process.env.MONGODB_URI;
      if (!uri) return { mode };
      try {
        const { MongoClient } = await import("mongodb");
        const client = new MongoClient(uri);
        await client.connect();
        const database = client.db(process.env.MONGODB_DB || "lunor_sites");
        collection = database.collection("site_data");
        const existing = await collection.findOne({ _id: "site" });
        if (!existing) await collection.insertOne({ _id: "site", ...structuredClone(seed) });
        mode = "mongodb";
      } catch (error) {
        console.warn("MongoDB unavailable, using in-memory data.");
        collection = null;
        mode = "memory";
      }
      return { mode };
    },
    async readSite() {
      if (collection) {
        const doc = await collection.findOne({ _id: "site" });
        if (doc) {
          const { _id, ...site } = doc;
          return site;
        }
      }
      return structuredClone(memory);
    },
    async push(key, record) {
      if (!Array.isArray(memory[key])) memory[key] = [];
      memory[key].push(record);
      if (collection) await collection.updateOne({ _id: "site" }, { $push: { [key]: record } });
      return record;
    },
  };
}
`;
}

function appModule(): string {
  return `// @lunor-backend
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApiRouter } from "./routes/api.mjs";

export function createApp(db) {
  const app = express();
  const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client");
  app.use(express.json({ limit: "32kb" }));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use("/api", createApiRouter(db));
  app.use(express.static(clientDir));
  return app;
}
`;
}

function serverEntry(): string {
  return `// @lunor-backend
import { createApp } from "./src/app.mjs";
import { createDb } from "./src/config/db.mjs";
import { seed } from "./src/data/seed.mjs";

const db = createDb();
await db.connect(seed);
const app = createApp(db);
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log("Site and API listening on http://localhost:" + port);
});
`;
}

function packageJson(title: string): string {
  return JSON.stringify({
    name: slugify(title),
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: { start: "node index.mjs" },
    dependencies: {
      express: "^4.21.2",
      mongodb: "^6.12.0",
    },
  }, null, 2) + "\n";
}

function readme(seed: SiteSeed, blueprint: WebsiteBlueprint): string {
  return `# ${seed.title}

${seed.tagline}

Generated by the Lunor Web Development assistant (${blueprint.label} blueprint).

## Preview

Open \`client/index.html\` in the editor preview. The page renders sample data from \`client/site.js\` when the API is not running.

## Run the API

\`\`\`bash
cd server
npm install
npm start
\`\`\`

The server serves the client and the API at http://localhost:3000.

## Routes

- \`GET /api/health\`
- \`GET /api/content\`
- \`GET /api/projects\`
- \`GET /api/profile\`
- \`GET /api/posts\` and \`GET /api/posts/:id\`
- \`GET /api/products\`
- \`GET /api/stats\`
- \`GET /api/activity\`
- \`POST /api/messages\`
- \`POST /api/subscribers\`
- \`POST /api/orders\`
- \`POST /api/notes\`

## MongoDB

Data stays in memory unless you set \`MONGODB_URI\`. Optional database name: \`MONGODB_DB\` (default \`lunor_sites\`).
`;
}

function summaryFor(seed: SiteSeed, blueprint: WebsiteBlueprint): string {
  return [
    `Generated **${seed.title}**, a full-stack ${blueprint.label.toLowerCase()} site.`,
    "",
    "Client",
    "- client/index.html",
    "- client/styles.css",
    "- client/site.js",
    "",
    "API",
    "- server/index.mjs",
    "- server/src/app.mjs",
    "- server/src/routes/api.mjs",
    "- server/src/data/seed.mjs",
    "- server/src/config/db.mjs",
    "- server/package.json",
    "",
    "The preview uses the sample data in site.js. To run the API: cd server, npm install, npm start, then open http://localhost:3000.",
    "GET /api/health reports the site. Set MONGODB_URI only if you want MongoDB instead of the in-memory store.",
  ].join("\n");
}

function cleanTitle(title: string, fallback: string): string {
  const cleaned = title.replace(/[`$<>]/g, "").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

export function generateWebsite(options: { kind: WebsiteKind; title?: string; prompt?: string }): GeneratedWebsite {
  const blueprint = WEBSITE_BLUEPRINTS.find((item) => item.id === options.kind) ?? WEBSITE_BLUEPRINTS[0];
  const rawTitle = options.title || inferSiteTitle(options.prompt || "", DEFAULT_TITLES[options.kind]);
  const title = cleanTitle(rawTitle, DEFAULT_TITLES[options.kind]);
  const seed = buildSeed(options.kind, title);
  const files = [
    file("client/index.html", clientHtml(seed.title)),
    file("client/styles.css", CLIENT_CSS),
    file("client/site.js", clientJs(seed)),
    file("server/package.json", packageJson(seed.title)),
    file("server/index.mjs", serverEntry()),
    file("server/src/app.mjs", appModule()),
    file("server/src/routes/api.mjs", apiModule()),
    file("server/src/data/seed.mjs", "// @lunor-backend\nexport const seed = " + embedJson(seed) + ";\n"),
    file("server/src/config/db.mjs", dbModule()),
    file("README.md", readme(seed, blueprint)),
  ];
  return { kind: options.kind, title: seed.title, files, summary: summaryFor(seed, blueprint) };
}

export function toProjectTree(files: GeneratedFile[]): ProjectNode[] {
  const root: ProjectNode[] = [];
  for (const entry of files) {
    const parts = entry.path.split("/").filter(Boolean);
    let siblings = root;
    let accumulated = "";
    parts.forEach((part, index) => {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const isFile = index === parts.length - 1;
      if (isFile) {
        siblings.push({
          id: entry.path,
          name: part,
          type: "file",
          language: entry.language,
          content: entry.content,
        });
        return;
      }
      let folder = siblings.find((node) => node.type === "folder" && node.name === part);
      if (!folder) {
        folder = { id: accumulated, name: part, type: "folder", isOpen: true, children: [] };
        siblings.push(folder);
      }
      siblings = folder.children || [];
    });
  }
  return root;
}
