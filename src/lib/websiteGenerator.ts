/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a previewable HTML/CSS/JS frontend plus an Express API and seed data.
 * The browser preview uses the frontend files directly. `npm start` serves the same
 * files and the JSON API together.
 */

export type WebsiteKind =
  | "landing"
  | "portfolio"
  | "restaurant"
  | "blog"
  | "shop"
  | "saas"
  | "dashboard";

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  tagline: string;
  files: GeneratedFile[];
  assistantSummary: string;
}

export interface WebsitePreset {
  kind: WebsiteKind;
  label: string;
  prompt: string;
}

export const WEBSITE_GENERATOR_PRESETS: WebsitePreset[] = [
  { kind: "landing", label: "Landing", prompt: "Generate a full-stack landing page website" },
  { kind: "portfolio", label: "Portfolio", prompt: "Create a full-stack portfolio website" },
  { kind: "restaurant", label: "Restaurant", prompt: "Build a full-stack restaurant website with a menu and reservations" },
  { kind: "blog", label: "Blog", prompt: "Generate a full-stack blog website" },
  { kind: "shop", label: "Shop", prompt: "Make a full-stack online shop website with a cart" },
  { kind: "saas", label: "SaaS", prompt: "Generate a full-stack SaaS website with pricing" },
  { kind: "dashboard", label: "Dashboard", prompt: "Build a full-stack analytics dashboard website" },
];

interface Palette {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
  onPrimary: string;
}

interface SiteItem {
  title: string;
  text: string;
  price?: string;
  tag?: string;
  image: string;
}

interface SiteSpec {
  kind: WebsiteKind;
  title: string;
  tagline: string;
  description: string;
  palette: Palette;
  nav: { label: string; href: string }[];
  heroImage: string;
  items: SiteItem[];
  features: { title: string; text: string }[];
  formTitle: string;
  formFields: { name: string; label: string; type: string; placeholder: string }[];
}

const BUILD_VERB = /\b(build|create|make|generate|design|scaffold|code)\b/i;
const SITE_NOUN = /\b(website|web\s*site|landing\s*page|web\s*app|online\s+(shop|store)|full[\s-]?stack\s+(site|app|website|project))\b/i;
const EDIT_INTENT = /\b(fix|change|update|edit|debug|refactor|sticky|colou?r|font|padding|margin|header|footer|navbar|bug|error|typo)\b/i;

const KIND_RULES: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "restaurant", pattern: /\b(restaurant|cafe|café|bistro|diner|menu)\b/i },
  { kind: "portfolio", pattern: /\b(portfolio|freelancer)\b/i },
  { kind: "blog", pattern: /\b(blog|magazine|newsletter)\b/i },
  { kind: "shop", pattern: /\b(shop|store|e-?commerce|cart)\b/i },
  { kind: "dashboard", pattern: /\b(dashboard|analytics|admin panel)\b/i },
  { kind: "saas", pattern: /\b(saas|software as a service|startup)\b/i },
  { kind: "landing", pattern: /\b(landing|marketing|homepage)\b/i },
];

const GENERIC_TITLE = /^(a|an|the|my|our|this|me|us|beginners|business|company|startup|website|site|page|app)$/i;

export function detectWebsiteKind(prompt: string): WebsiteKind {
  for (const rule of KIND_RULES) {
    if (rule.pattern.test(prompt)) return rule.kind;
  }
  return "landing";
}

export function isWebsiteGenerationRequest(prompt: string): boolean {
  if (!BUILD_VERB.test(prompt)) return false;
  if (EDIT_INTENT.test(prompt) && !/\b(full[\s-]?stack|from scratch)\b/i.test(prompt)) return false;
  if (SITE_NOUN.test(prompt)) return true;
  return /\b(portfolio|restaurant|cafe|bistro|blog|shop|store|saas|dashboard)\b/i.test(prompt)
    && /\b(site|page|website|app)\b/i.test(prompt);
}

export function isNodeOnlyScript(name: string, content: string): boolean {
  if (/(^|\/)backend\//.test(name)) return true;
  const base = name.split("/").pop() || name;
  if (/^(server|api)\.(js|mjs|cjs)$/.test(base) && /\b(express|http\.createServer|require\s*\()\b/.test(content)) {
    return true;
  }
  return /\bfrom\s+["']express["']|\brequire\(\s*["']express["']\s*\)|\bimport\s+express\b/.test(content);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch
  ));
}

function cleanTitle(value: string): string {
  return value
    .replace(/\b(full[\s-]?stack|website|web\s*site|landing\s*page|web\s*app|online)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.:;]+$/, "");
}

export function extractSiteTitle(prompt: string, fallback: string): string {
  const quoted = prompt.match(/["“]([^"”]{2,60})["”]/);
  if (quoted) {
    const title = cleanTitle(quoted[1]);
    if (title) return title;
  }
  const named = prompt.match(/\b(?:called|named)\s+([A-Za-z0-9][^.,\n]{1,48})/i);
  if (named) {
    const title = cleanTitle(named[1]);
    if (title) return title;
  }
  const forMatch = prompt.match(/\bfor\s+([A-Za-z0-9][^.,\n]{1,48})/i);
  if (forMatch) {
    const title = cleanTitle(forMatch[1]);
    const first = title.split(/\s+/)[0] || "";
    if (title && !GENERIC_TITLE.test(first)) return title;
  }
  return fallback;
}

function photo(id: string, w = 1200, h = 800): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function paletteFor(kind: WebsiteKind): Palette {
  const palettes: Record<WebsiteKind, Palette> = {
    landing: { bg: "#f4f7fb", surface: "#ffffff", text: "#122033", muted: "#5c6b80", primary: "#0f766e", accent: "#f59e0b", onPrimary: "#f8fffe" },
    portfolio: { bg: "#14110e", surface: "#211c17", text: "#f6f1ea", muted: "#c3b6a6", primary: "#e8a15a", accent: "#f3d7b5", onPrimary: "#1a140f" },
    restaurant: { bg: "#fbf6ef", surface: "#fffdf9", text: "#2a2118", muted: "#6f5c4b", primary: "#8f3d3d", accent: "#d4a054", onPrimary: "#fff8f4" },
    blog: { bg: "#f7f5f2", surface: "#ffffff", text: "#1c1917", muted: "#57534e", primary: "#1d4ed8", accent: "#0f172a", onPrimary: "#f8fafc" },
    shop: { bg: "#f8fafc", surface: "#ffffff", text: "#0f172a", muted: "#64748b", primary: "#4f46e5", accent: "#06b6d4", onPrimary: "#f8fafc" },
    saas: { bg: "#0b1020", surface: "#141a2e", text: "#e7ecf8", muted: "#a5b0c9", primary: "#7c3aed", accent: "#22d3ee", onPrimary: "#f8f7ff" },
    dashboard: { bg: "#0e141b", surface: "#16202b", text: "#e6eef6", muted: "#93a4b8", primary: "#22c3c9", accent: "#f5b942", onPrimary: "#062326" },
  };
  return palettes[kind];
}

function defaultTitle(kind: WebsiteKind): string {
  const titles: Record<WebsiteKind, string> = {
    landing: "Northstar",
    portfolio: "Alex Rivera",
    restaurant: "Luna Bistro",
    blog: "Field Notes",
    shop: "Harbor Goods",
    saas: "Pulseboard",
    dashboard: "Ops Deck",
  };
  return titles[kind];
}

function buildSpec(kind: WebsiteKind, prompt: string): SiteSpec {
  const title = extractSiteTitle(prompt, defaultTitle(kind));
  const palette = paletteFor(kind);
  const catalogs: Record<WebsiteKind, Omit<SiteSpec, "kind" | "title" | "palette">> = {
    landing: {
      tagline: "Launch a clear story, a fast page, and a working API.",
      description: `${title} helps teams explain the product, collect leads, and ship a site that already has a backend.`,
      nav: [
        { label: "Product", href: "#features" },
        { label: "Plans", href: "#collection" },
        { label: "Contact", href: "#contact" },
      ],
      heroImage: photo("1553877522-43269d4ea984"),
      features: [
        { title: "One brief, one site", text: "Hero, proof, pricing, and a contact form are generated together." },
        { title: "API included", text: "Leads post to /api/messages and fall back to local storage in the preview." },
        { title: "Ready to run", text: "npm start serves the page and the JSON API on one port." },
      ],
      items: [
        { title: "Starter", text: "Landing page, contact form, and the Express API.", price: "$0", tag: "Draft", image: photo("1460925895917-afdab827c52f", 800, 600) },
        { title: "Studio", text: "Custom sections, lead routing, and a branded theme.", price: "$49", tag: "Popular", image: photo("1552664730-d307ca884978", 800, 600) },
        { title: "Scale", text: "Multi-page content, analytics hooks, and priority support.", price: "$149", tag: "Team", image: photo("1542744173-8e7e91415657", 800, 600) },
      ],
      formTitle: "Request a walkthrough",
      formFields: [
        { name: "name", label: "Name", type: "text", placeholder: "Your name" },
        { name: "email", label: "Email", type: "email", placeholder: "you@company.com" },
        { name: "message", label: "What are you launching?", type: "text", placeholder: "A short note" },
      ],
    },
    portfolio: {
      tagline: "Selected work, a short story, and a way to get in touch.",
      description: `${title} designs and builds websites with a calm visual system and a contact API behind the form.`,
      nav: [
        { label: "Work", href: "#collection" },
        { label: "Approach", href: "#features" },
        { label: "Contact", href: "#contact" },
      ],
      heroImage: photo("1558618666-fcd25c85f1d7"),
      features: [
        { title: "Product sites", text: "Marketing pages with a clear offer and a measured layout." },
        { title: "Brand systems", text: "Type, color, and imagery that stay consistent across sections." },
        { title: "Working backends", text: "Every inquiry is stored by the Express API, not a dead form." },
      ],
      items: [
        { title: "Atlas Archive", text: "A research studio site with a quiet grid and large photography.", tag: "Brand", image: photo("1513364776144-60967b0f800f", 900, 700) },
        { title: "Kindred Market", text: "An independent grocer with seasonal menus and online ordering.", tag: "Commerce", image: photo("1483985988355-763728e1935b", 900, 700) },
        { title: "Harbor Line", text: "A travel journal with long-form stories and a reading list.", tag: "Editorial", image: photo("1469854523086-cc02fe5d8800", 900, 700) },
      ],
      formTitle: "Start a project",
      formFields: [
        { name: "name", label: "Name", type: "text", placeholder: "Your name" },
        { name: "email", label: "Email", type: "email", placeholder: "you@studio.com" },
        { name: "message", label: "Project", type: "text", placeholder: "What should we build?" },
      ],
    },
    restaurant: {
      tagline: "Seasonal plates, a short menu, and a table when you want one.",
      description: `${title} serves a neighborhood menu. Reservations go to the API and stay on this device if the server is offline.`,
      nav: [
        { label: "Menu", href: "#collection" },
        { label: "Visit", href: "#features" },
        { label: "Reserve", href: "#contact" },
      ],
      heroImage: photo("1414235077428-338989a2e8c0"),
      features: [
        { title: "Dinner", text: "Tuesday to Sunday, from 5:30pm. The kitchen closes at 10." },
        { title: "Location", text: "18 Orchard Lane. Walk-ins are welcome at the bar." },
        { title: "Private table", text: "Ask about the side room for groups of eight or more." },
      ],
      items: [
        { title: "Citrus fennel salad", text: "Orange, olive oil, and toasted seeds.", price: "$14", tag: "Starters", image: photo("1540189549336-e6e99c3679fe", 800, 600) },
        { title: "Roasted market fish", text: "Charred lemon, herbs, and a warm grain salad.", price: "$32", tag: "Mains", image: photo("1467003909585-2f8a72700288", 800, 600) },
        { title: "Dark chocolate tart", text: "Sea salt, olive oil, and crème fraîche.", price: "$12", tag: "Dessert", image: photo("1551024601-bec78aea704b", 800, 600) },
        { title: "House spritz", text: "Bitter orange, sparkling wine, and a citrus peel.", price: "$13", tag: "Drinks", image: photo("1514362545857-3bc16c4c7d1b", 800, 600) },
      ],
      formTitle: "Reserve a table",
      formFields: [
        { name: "name", label: "Name", type: "text", placeholder: "Name for the booking" },
        { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
        { name: "party", label: "Party size", type: "text", placeholder: "2" },
        { name: "message", label: "Notes", type: "text", placeholder: "Date, time, allergies" },
      ],
    },
    blog: {
      tagline: "Notes on making useful things, published with a small API.",
      description: `${title} is a reading room for essays, shipping logs, and field reports.`,
      nav: [
        { label: "Stories", href: "#collection" },
        { label: "About", href: "#features" },
        { label: "Subscribe", href: "#contact" },
      ],
      heroImage: photo("1456513080510-7bf3a84b82f8"),
      features: [
        { title: "Essays", text: "Longer pieces on craft, tools, and how a product gets made." },
        { title: "Field reports", text: "Short notes from launches, interviews, and site visits." },
        { title: "Archive", text: "Every story is also available from GET /api/content." },
      ],
      items: [
        { title: "The page is the product", text: "Why a fast first screen still beats a pile of sections.", tag: "Design", image: photo("1499750310107-5fef28a66643", 900, 640) },
        { title: "Shipping a form that works", text: "A contact box is only useful when something stores the message.", tag: "Backend", image: photo("1516321318423-f06f85e504b3", 900, 640) },
        { title: "A quieter homepage", text: "Cut the carousel. Keep one sentence and one action.", tag: "Writing", image: photo("1432821596592-e2c18b78144f", 900, 640) },
      ],
      formTitle: "Get the next note",
      formFields: [
        { name: "name", label: "Name", type: "text", placeholder: "Your name" },
        { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
      ],
    },
    shop: {
      tagline: "Objects for the desk, the kitchen, and the weekend bag.",
      description: `${title} lists a small catalog. The cart runs in the browser, and checkout posts the order to the API.`,
      nav: [
        { label: "Catalog", href: "#collection" },
        { label: "Why us", href: "#features" },
        { label: "Checkout", href: "#contact" },
      ],
      heroImage: photo("1441986300917-64674bd600d8"),
      features: [
        { title: "Ships in two days", text: "In-stock goods leave the studio within 48 hours." },
        { title: "Easy returns", text: "30 days, no note required, prepaid label included." },
        { title: "Real inventory", text: "The catalog is the same JSON the API returns." },
      ],
      items: [
        { title: "Linen weekender", text: "Sand-colored canvas with a leather handle.", price: "128", tag: "Bags", image: photo("1547949003-9792a18a2601", 800, 800) },
        { title: "Stoneware mug", text: "Speckled clay, holds 300ml, dishwasher safe.", price: "32", tag: "Home", image: photo("1514228742587-6b1558fcca3d", 800, 800) },
        { title: "Brass desk lamp", text: "Warm light, adjustable arm, linen shade.", price: "186", tag: "Desk", image: photo("1507473885765-e6ed057f782c", 800, 800) },
        { title: "Notebook set", text: "Three plain books, lay-flat binding.", price: "24", tag: "Paper", image: photo("1516414447565-b14be0adf13e", 800, 800) },
      ],
      formTitle: "Checkout",
      formFields: [
        { name: "name", label: "Name", type: "text", placeholder: "Recipient" },
        { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
        { name: "message", label: "Address", type: "text", placeholder: "Street, city, postal code" },
      ],
    },
    saas: {
      tagline: "See the work, assign the owner, and ship the week.",
      description: `${title} is a lightweight planning tool for small product teams. This marketing site and its lead API are generated together.`,
      nav: [
        { label: "Product", href: "#features" },
        { label: "Pricing", href: "#collection" },
        { label: "Demo", href: "#contact" },
      ],
      heroImage: photo("1551434678-e076c223a692"),
      features: [
        { title: "Shared board", text: "One list of work, owners, and due dates. No extra ceremony." },
        { title: "Weekly review", text: "A short summary of what moved and what is stuck." },
        { title: "Lead capture", text: "Demo requests hit POST /api/messages on the included server." },
      ],
      items: [
        { title: "Free", text: "Up to 3 people and one board.", price: "$0", tag: "Start", image: photo("1460925895917-afdab827c52f", 800, 500) },
        { title: "Pro", text: "Unlimited boards, guests, and exports.", price: "$12", tag: "Per person", image: photo("1553877522-43269d4ea984", 800, 500) },
        { title: "Business", text: "SSO, audit log, and a shared workspace.", price: "$24", tag: "Per person", image: photo("1600880292203-757bb62b4baf", 800, 500) },
      ],
      formTitle: "Book a demo",
      formFields: [
        { name: "name", label: "Name", type: "text", placeholder: "Your name" },
        { name: "email", label: "Work email", type: "email", placeholder: "you@company.com" },
        { name: "message", label: "Team size", type: "text", placeholder: "How many people?" },
      ],
    },
    dashboard: {
      tagline: "Live counts for traffic, orders, and the queue.",
      description: `${title} reads the same JSON file the API serves, so the preview and the server stay in agreement.`,
      nav: [
        { label: "Overview", href: "#main" },
        { label: "Activity", href: "#collection" },
        { label: "Notes", href: "#contact" },
      ],
      heroImage: photo("1551288049-bebda4e38f71"),
      features: [
        { title: "Visitors", text: "Unique sessions in the last 7 days." },
        { title: "Orders", text: "Paid checkouts, excluding refunds." },
        { title: "Queue", text: "Open support threads waiting on a reply." },
      ],
      items: [
        { title: "Visitors", text: "12.4k this week", price: "12.4k", tag: "+8%", image: photo("1460925895917-afdab827c52f", 800, 500) },
        { title: "Orders", text: "386 paid", price: "386", tag: "+3%", image: photo("1556742049-0cfed4f6a45d", 800, 500) },
        { title: "Revenue", text: "Collected this week", price: "18420", tag: "+11%", image: photo("1579621970563-ebec7560ff3e", 800, 500) },
        { title: "Open tickets", text: "Waiting on a reply", price: "17", tag: "-2", image: photo("1553877522-43269d4ea984", 800, 500) },
      ],
      formTitle: "Leave an ops note",
      formFields: [
        { name: "name", label: "Name", type: "text", placeholder: "Your name" },
        { name: "message", label: "Note", type: "text", placeholder: "What should the next shift know?" },
      ],
    },
  };

  const catalog = catalogs[kind];
  return { kind, title, palette, ...catalog };
}

function contentPayload(spec: SiteSpec) {
  return {
    site: {
      title: spec.title,
      tagline: spec.tagline,
      description: spec.description,
      kind: spec.kind,
    },
    items: spec.items.map((item) => ({
      title: item.title,
      text: item.text,
      price: item.price || "",
      tag: item.tag || "",
      image: item.image,
    })),
    messages: [] as { name?: string; email?: string; message?: string; at?: string }[],
  };
}

function buildHtml(spec: SiteSpec): string {
  const title = escapeHtml(spec.title);
  const tagline = escapeHtml(spec.tagline);
  const description = escapeHtml(spec.description);
  const nav = spec.nav.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("");
  const cartButton = spec.kind === "shop"
    ? `<button class="cart-button" type="button" data-cart-toggle>Cart <span data-cart-count>0</span></button>`
    : "";
  const features = spec.features.map((feature) => `
        <article class="card">
          <h3>${escapeHtml(feature.title)}</h3>
          <p>${escapeHtml(feature.text)}</p>
        </article>`).join("");
  const items = spec.items.map((item) => `
        <article class="card item-card">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
          <div class="card-body">
            ${item.tag ? `<p class="eyebrow">${escapeHtml(item.tag)}</p>` : ""}
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
            ${item.price ? `<p class="price">${spec.kind === "shop" ? "$" : ""}${escapeHtml(item.price)}</p>` : ""}
            ${spec.kind === "shop" ? `<button type="button" data-add data-title="${escapeHtml(item.title)}" data-price="${escapeHtml(item.price || "0")}">Add to cart</button>` : ""}
          </div>
        </article>`).join("");
  const fields = spec.formFields.map((field) => `
          <label>${escapeHtml(field.label)}
            <input name="${escapeHtml(field.name)}" type="${escapeHtml(field.type)}" placeholder="${escapeHtml(field.placeholder)}" required>
          </label>`).join("");
  const collectionLabel = spec.kind === "restaurant" ? "Menu" : spec.kind === "shop" ? "Catalog" : spec.kind === "blog" ? "Latest stories" : spec.kind === "dashboard" ? "Activity" : spec.kind === "portfolio" ? "Selected work" : "Plans";

  const marketing = `
  <header class="site-header">
    <a class="brand" href="#top">${title}</a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open menu">Menu</button>
    <nav data-nav>${nav}</nav>
    ${cartButton}
  </header>
  <main id="main">
    <section class="hero" id="top">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(spec.kind)}</p>
        <h1>${title}</h1>
        <p class="lede">${tagline}</p>
        <p>${description}</p>
        <div class="hero-actions">
          <a class="button" href="#collection">View ${escapeHtml(collectionLabel.toLowerCase())}</a>
          <a class="button button-ghost" href="#contact">${escapeHtml(spec.formTitle)}</a>
        </div>
      </div>
      <img class="hero-image" src="${escapeHtml(spec.heroImage)}" alt="">
    </section>
    <section id="features" class="section">
      <h2>How it works</h2>
      <div class="grid grid-3">${features}</div>
    </section>
    <section id="collection" class="section">
      <h2>${escapeHtml(collectionLabel)}</h2>
      <div class="grid ${spec.kind === "shop" ? "grid-4" : "grid-3"}">${items}</div>
    </section>
    <section id="contact" class="section contact">
      <div>
        <h2>${escapeHtml(spec.formTitle)}</h2>
        <p>The form posts to <code>/api/messages</code>. In the editor preview it saves on this device when the API is offline.</p>
      </div>
      <form data-contact-form>
        ${fields}
        <button class="button" type="submit">Send</button>
        <p class="form-status" data-form-status role="status"></p>
      </form>
    </section>
  </main>`;

  const stats = spec.items.map((item) => `
        <article class="stat">
          <p class="eyebrow">${escapeHtml(item.title)}</p>
          <p class="stat-value">${escapeHtml(item.price || "")}</p>
          <p>${escapeHtml(item.tag || "")} · ${escapeHtml(item.text)}</p>
        </article>`).join("");
  const rows = spec.items.map((item) => `
          <tr>
            <td>${escapeHtml(item.title)}</td>
            <td>${escapeHtml(item.text)}</td>
            <td>${escapeHtml(item.tag || "")}</td>
          </tr>`).join("");
  const bars = spec.items.map((item) => {
    const numeric = Number(String(item.price || "0").replace(/[^0-9.]/g, "")) || 1;
    return { label: item.title, numeric };
  });
  const max = Math.max(...bars.map((bar) => bar.numeric));
  const chart = bars.map((bar) => `
        <div class="bar-row">
          <span>${escapeHtml(bar.label)}</span>
          <div class="bar"><span style="width:${Math.max(8, Math.round((bar.numeric / max) * 100))}%"></span></div>
        </div>`).join("");

  const dashboard = `
  <div class="dashboard">
    <aside>
      <a class="brand" href="#top">${title}</a>
      <nav data-nav>${nav}</nav>
      <p class="aside-note">${tagline}</p>
    </aside>
    <main id="main">
      <header class="dash-header">
        <div>
          <p class="eyebrow">Overview</p>
          <h1>${title}</h1>
        </div>
        <p>${description}</p>
      </header>
      <section class="stat-grid">${stats}</section>
      <section class="section panel" id="collection">
        <h2>This week</h2>
        <div class="chart">${chart}</div>
        <table>
          <thead><tr><th>Metric</th><th>Detail</th><th>Change</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
      <section id="contact" class="section contact">
        <h2>${escapeHtml(spec.formTitle)}</h2>
        <form data-contact-form>
          ${fields}
          <button class="button" type="submit">Save note</button>
          <p class="form-status" data-form-status role="status"></p>
        </form>
      </section>
    </main>
  </div>`;

  const cart = spec.kind === "shop" ? `
  <aside class="cart-drawer" data-cart hidden>
    <div class="cart-head">
      <h2>Cart</h2>
      <button type="button" data-cart-toggle>Close</button>
    </div>
    <ul data-cart-items><li>Your cart is empty.</li></ul>
    <p>Total <strong data-cart-total>$0</strong></p>
    <a class="button" href="#contact">Checkout</a>
  </aside>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="theme-${spec.kind}">
  <a class="skip" href="#main">Skip to content</a>
  ${spec.kind === "dashboard" ? dashboard : marketing}
  ${cart}
  <footer class="site-footer">
    <p>${title} · generated by the Lunor web development assistant</p>
    <p>Frontend preview plus <code>GET /api/content</code></p>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function buildCss(spec: SiteSpec): string {
  const p = spec.palette;
  return `/* ${spec.title} — generated full-stack website styles */
:root {
  --bg: ${p.bg};
  --surface: ${p.surface};
  --text: ${p.text};
  --muted: ${p.muted};
  --primary: ${p.primary};
  --accent: ${p.accent};
  --on-primary: ${p.onPrimary};
  --radius: 18px;
  --shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Outfit, system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}
img { max-width: 100%; display: block; }
h1, h2, h3 { font-family: Fraunces, Georgia, serif; line-height: 1.15; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.6rem, 5vw, 4.6rem); margin: 0 0 0.4rem; }
h2 { font-size: clamp(1.7rem, 3vw, 2.4rem); margin: 0 0 1rem; }
p { margin: 0 0 0.8rem; }
a { color: inherit; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.92em; }
.skip {
  position: absolute; left: 1rem; top: -4rem; background: var(--primary); color: var(--on-primary);
  padding: 0.5rem 0.8rem; border-radius: 8px;
}
.skip:focus { top: 1rem; }
.site-header, .dash-header {
  display: flex; align-items: center; gap: 1rem; padding: 1rem 6vw;
}
.site-header {
  position: sticky; top: 0; z-index: 5;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
}
.brand { font-weight: 600; text-decoration: none; margin-right: auto; }
nav { display: flex; gap: 1.1rem; }
nav a { text-decoration: none; color: var(--muted); }
nav a:hover { color: var(--text); }
.nav-toggle, .cart-button, .button, button {
  font: inherit; cursor: pointer;
}
.nav-toggle { display: none; background: transparent; color: var(--text); border: 1px solid color-mix(in srgb, var(--text) 20%, transparent); border-radius: 999px; padding: 0.35rem 0.8rem; }
.button, button[data-add], .cart-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  border: 0; border-radius: 999px; padding: 0.75rem 1.1rem;
  background: var(--primary); color: var(--on-primary); text-decoration: none; font-weight: 600;
}
.button-ghost { background: transparent; color: var(--text); border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); }
.hero, .section { padding: 3.5rem 6vw; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: center; min-height: 78vh; }
.hero-image { width: 100%; height: min(68vh, 560px); object-fit: cover; border-radius: calc(var(--radius) + 8px); box-shadow: var(--shadow); }
.lede { font-size: 1.25rem; color: var(--text); }
.eyebrow { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.75rem; color: var(--accent); font-family: Outfit, sans-serif; font-weight: 600; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 1.2rem; }
.grid { display: grid; gap: 1rem; }
.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.card, .stat, .panel, form {
  background: var(--surface); border-radius: var(--radius);
  border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  box-shadow: var(--shadow);
}
.card { overflow: hidden; }
.card-body, .card, .stat { padding: 1.1rem 1.15rem 1.25rem; }
.item-card .card-body { padding: 1rem 1rem 1.2rem; }
.item-card img { width: 100%; height: 190px; object-fit: cover; }
.price { font-weight: 600; color: var(--primary); }
.contact { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 1.5rem; align-items: start; }
form { display: grid; gap: 0.8rem; padding: 1.2rem; }
label { display: grid; gap: 0.35rem; font-size: 0.92rem; color: var(--muted); }
input {
  width: 100%; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
  background: var(--bg); color: var(--text); padding: 0.75rem 0.85rem; font: inherit;
}
.form-status { min-height: 1.2rem; color: var(--primary); }
.site-footer { padding: 2rem 6vw 3rem; color: var(--muted); display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.cart-drawer {
  position: fixed; right: 1rem; bottom: 1rem; width: min(360px, calc(100% - 2rem));
  background: var(--surface); color: var(--text); border-radius: var(--radius); padding: 1rem;
  box-shadow: var(--shadow); z-index: 6;
}
.cart-drawer[hidden] { display: none; }
.cart-head { display: flex; justify-content: space-between; align-items: center; }
.cart-drawer ul { padding-left: 1.1rem; }
.dashboard { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
.dashboard aside { padding: 1.4rem 1.1rem; background: var(--surface); border-right: 1px solid color-mix(in srgb, var(--text) 10%, transparent); }
.dashboard nav { flex-direction: column; margin-top: 1.5rem; }
.aside-note { color: var(--muted); margin-top: 2rem; }
.dash-header { align-items: end; justify-content: space-between; }
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; padding: 0 2rem; }
.stat-value { font-size: 1.8rem; font-family: Fraunces, Georgia, serif; margin: 0.2rem 0; }
.panel { margin: 1.5rem 2rem; padding: 1.2rem; }
.chart { display: grid; gap: 0.7rem; margin-bottom: 1.2rem; }
.bar-row { display: grid; grid-template-columns: 120px 1fr; gap: 0.7rem; align-items: center; }
.bar { height: 10px; background: color-mix(in srgb, var(--text) 10%, transparent); border-radius: 999px; overflow: hidden; }
.bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.7rem 0.4rem; border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent); }
@media (max-width: 960px) {
  .hero, .grid-3, .grid-4, .contact, .dashboard, .stat-grid { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  nav { display: none; position: absolute; top: 64px; left: 0; right: 0; flex-direction: column; padding: 1rem 6vw; background: var(--surface); }
  nav.open { display: flex; }
  .hero { min-height: auto; padding-top: 2rem; }
  .stat-grid, .panel { padding-left: 1rem; padding-right: 1rem; margin-left: 1rem; margin-right: 1rem; }
}
`;
}

function buildScript(spec: SiteSpec): string {
  const seed = JSON.stringify(contentPayload(spec), null, 2);
  return `/* ${spec.title} — browser UI. Uses /api when the Express server is running. */
const SEED = ${seed};

async function loadContent() {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch (error) {
    return SEED;
  }
}

const cart = [];

function money(amount) {
  return "$" + amount.toFixed(0);
}

function renderCart() {
  const list = document.querySelector("[data-cart-items]");
  const count = document.querySelector("[data-cart-count]");
  const total = document.querySelector("[data-cart-total]");
  const quantity = cart.reduce((sum, item) => sum + item.qty, 0);
  const amount = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  if (count) count.textContent = String(quantity);
  if (total) total.textContent = money(amount);
  if (!list) return;
  list.replaceChildren();
  if (!cart.length) {
    const empty = document.createElement("li");
    empty.textContent = "Your cart is empty.";
    list.appendChild(empty);
    return;
  }
  cart.forEach((item) => {
    const row = document.createElement("li");
    row.textContent = item.title + " × " + item.qty + " — " + money(item.price * item.qty);
    list.appendChild(row);
  });
}

async function saveMessage(payload) {
  try {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("API unavailable");
    return "Sent to the API.";
  } catch (error) {
    const key = "lunor-site-messages";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(payload);
    localStorage.setItem(key, JSON.stringify(existing));
    return "Saved in this browser. Start the API with npm start to store it on the server.";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadContent();
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  document.querySelectorAll("[data-cart-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const drawer = document.querySelector("[data-cart]");
      if (!drawer) return;
      drawer.hidden = !drawer.hidden;
    });
  });

  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.getAttribute("data-title") || "Item";
      const price = Number(button.getAttribute("data-price") || "0");
      const found = cart.find((item) => item.title === title);
      if (found) found.qty += 1;
      else cart.push({ title, price, qty: 1 });
      renderCart();
      const drawer = document.querySelector("[data-cart]");
      if (drawer) drawer.hidden = false;
    });
  });

  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.at = new Date().toISOString();
      if (cart.length) payload.cart = cart.map((item) => item.title + " x" + item.qty).join(", ");
      if (status) status.textContent = "Sending…";
      const message = await saveMessage(payload);
      if (status) status.textContent = message;
      form.reset();
    });
  }
  renderCart();
});
`;
}

function buildServer(spec: SiteSpec): string {
  return `import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import api from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const siteRoot = path.join(__dirname, "..");

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/api", api);
app.use(express.static(siteRoot));
app.get("*", (_req, res) => {
  res.sendFile(path.join(siteRoot, "index.html"));
});

app.listen(port, () => {
  console.log(${JSON.stringify(spec.title + " running at http://localhost:")} + port);
});
`;
}

function buildApi(): string {
  return `import { Router } from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "db.json");
const db = JSON.parse(readFileSync(dbPath, "utf8"));
const messages = Array.isArray(db.messages) ? db.messages : [];

const api = Router();

api.get("/health", (_req, res) => {
  res.json({ ok: true, service: db.site?.title || "website" });
});

api.get("/content", (_req, res) => {
  res.json({ ...db, messages });
});

api.get("/items", (_req, res) => {
  res.json(db.items || []);
});

api.post("/messages", (req, res) => {
  const body = req.body || {};
  const message = {
    name: String(body.name || "").slice(0, 120),
    email: String(body.email || "").slice(0, 180),
    message: String(body.message || body.party || "").slice(0, 2000),
    cart: String(body.cart || "").slice(0, 500),
    at: new Date().toISOString(),
  };
  if (!message.name && !message.email && !message.message) {
    return res.status(400).json({ error: "Add a name, email, or message." });
  }
  messages.push(message);
  res.status(201).json({ ok: true, message });
});

export default api;
`;
}

function buildPackage(spec: SiteSpec): string {
  return JSON.stringify({
    name: slugify(spec.title),
    version: "1.0.0",
    private: true,
    description: `${spec.title} — full-stack website generated in Lunor`,
    type: "module",
    scripts: {
      start: "node backend/server.js",
      dev: "node backend/server.js",
    },
    dependencies: {
      express: "^4.21.2",
    },
  }, null, 2) + "\n";
}

function buildReadme(spec: SiteSpec): string {
  return `# ${spec.title}

${spec.tagline}

This project was generated by the Lunor **Web Development** AI assistant.

## Stack

- **Frontend:** \`index.html\`, \`styles.css\`, \`script.js\` — runs in the editor preview
- **API:** Express in \`backend/server.js\`
- **Data:** \`backend/data/db.json\`

## Run the site and API

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

The page posts forms to \`POST /api/messages\`. Catalog and page copy are available at \`GET /api/content\`.

In the editor preview there is no Node server, so the page uses the copy already in the HTML and stores form submissions in \`localStorage\`.
`;
}

function summaryFor(spec: SiteSpec): string {
  return [
    `**Full-stack website ready — ${spec.title}**`,
    "",
    spec.tagline,
    "",
    "I generated a previewable frontend and an Express API, then applied the files in the editor.",
    "",
    "- `index.html` — page structure",
    "- `styles.css` — theme and layout",
    "- `script.js` — menu, cart, and forms, with an API fallback",
    "- `backend/server.js` — serves the site and `/api`",
    "- `backend/routes/api.js` — content, items, and messages",
    "- `backend/data/db.json` — seed content",
    "- `package.json` — `npm start`",
    "- `README.md` — how to run it",
    "",
    "The preview is open. To run the API locally, use `npm install` and `npm start`.",
  ].join("\n");
}

export function generateFullStackWebsite(prompt: string, kind?: WebsiteKind): GeneratedWebsite {
  const resolvedKind = kind || detectWebsiteKind(prompt);
  const spec = buildSpec(resolvedKind, prompt);
  const db = JSON.stringify(contentPayload(spec), null, 2) + "\n";
  const files: GeneratedFile[] = [
    { path: "index.html", language: "html", content: buildHtml(spec) },
    { path: "styles.css", language: "css", content: buildCss(spec) },
    { path: "script.js", language: "javascript", content: buildScript(spec) },
    { path: "backend/server.js", language: "javascript", content: buildServer(spec) },
    { path: "backend/routes/api.js", language: "javascript", content: buildApi() },
    { path: "backend/data/db.json", language: "json", content: db },
    { path: "package.json", language: "json", content: buildPackage(spec) },
    { path: "README.md", language: "markdown", content: buildReadme(spec) },
  ];
  return {
    kind: spec.kind,
    title: spec.title,
    tagline: spec.tagline,
    files,
    assistantSummary: summaryFor(spec),
  };
}
