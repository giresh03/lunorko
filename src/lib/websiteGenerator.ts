/**
 * Full-stack website generator for the Web Development AI assistant.
 * Each blueprint is real frontend + Express code the editor can open and preview.
 */

export interface WebsiteItem {
  id: string;
  title: string;
  summary: string;
  image?: string;
  meta?: string;
  tag?: string;
  price?: string;
}

export interface WebsiteField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "number";
  required: boolean;
  placeholder?: string;
}

export interface WebsiteBlueprint {
  id: string;
  label: string;
  description: string;
  icon: string;
  prompt: string;
  defaultName: string;
  tagline: string;
  lede: string;
  heroImage: string;
  ink: string;
  paper: string;
  accent: string;
  accentSoft: string;
  displayFont: string;
  bodyFont: string;
  fontHref: string;
  collections: WebsiteCollection[];
  action: WebsiteAction;
}

export interface WebsiteCollection {
  id: string;
  title: string;
  intro: string;
  path: string;
  items: WebsiteItem[];
}

export interface WebsiteAction {
  path: string;
  title: string;
  intro: string;
  submitLabel: string;
  success: string;
  fields: WebsiteField[];
  cart?: boolean;
}

export interface GeneratedWebsiteFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

export interface ProjectFileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: ProjectFileNode[];
  isOpen?: boolean;
}

export interface GeneratedWebsite {
  blueprintId: string;
  siteName: string;
  prompt: string;
  chatMessage: string;
  previewPath: string;
  files: GeneratedWebsiteFile[];
  tree: ProjectFileNode[];
}

export interface FencedProjectFile {
  path?: string;
  language: string;
  code: string;
}

const photo = (id: string, w = 1400, h = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Selected work, project grid, and a contact API",
    icon: "✦",
    prompt: "Generate a full-stack portfolio website",
    defaultName: "Northline Studio",
    tagline: "Interfaces for teams who ship.",
    lede: "Northline designs and builds product websites. The page reads from /api/projects and sends new notes to /api/contact.",
    heroImage: photo("1498050108023-c5249f4df085"),
    ink: "#1c1917",
    paper: "#f4efe6",
    accent: "#c2410c",
    accentSoft: "#ffedd5",
    displayFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Outfit", sans-serif',
    fontHref: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap",
    collections: [
      {
        id: "work",
        title: "Selected work",
        intro: "Four recent builds. The cards are rendered from the API.",
        path: "/api/projects",
        items: [
          { id: "harbor", title: "Harbor Analytics", summary: "A research dashboard with quiet charts and a public status page.", image: photo("1551288049-bebda4e38f71", 900, 700), tag: "Product", meta: "2026" },
          { id: "kindred", title: "Kindred Market", summary: "A weekend market site with vendor pages and a reservation desk.", image: photo("1441986300917-64674bd600d8", 900, 700), tag: "Commerce", meta: "2025" },
          { id: "field", title: "Field Notes", summary: "An editorial blog with long-form reading and a small comment API.", image: photo("1455390582262-044cdead277a", 900, 700), tag: "Editorial", meta: "2025" },
          { id: "lumen", title: "Lumen Health", summary: "A clinic homepage with appointment requests and staff portraits.", image: photo("1576091160399-112ba8d25d1d", 900, 700), tag: "Health", meta: "2026" },
        ],
      },
    ],
    action: {
      path: "/api/contact",
      title: "Start a project",
      intro: "The form posts JSON to the Express API. In the preview, it confirms locally when the server is off.",
      submitLabel: "Send note",
      success: "Thanks — the studio received your note.",
      fields: [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Ada Lovelace" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "ada@example.com" },
        { name: "message", label: "What should we build?", type: "textarea", required: true, placeholder: "A marketing site with a booking API" },
      ],
    },
  },
  {
    id: "saas",
    label: "SaaS landing",
    description: "Feature list, pricing, and a waitlist API",
    icon: "◈",
    prompt: "Generate a full-stack SaaS landing website",
    defaultName: "Lumenboard",
    tagline: "The weekly plan your team actually opens.",
    lede: "Lumenboard is a planning desk for small product teams. Pricing and features come from the API, and the waitlist is a POST.",
    heroImage: photo("1553877522-43269d4ea984"),
    ink: "#0f172a",
    paper: "#f3f7f6",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
    displayFont: '"Sora", sans-serif',
    bodyFont: '"Source Sans 3", sans-serif',
    fontHref: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Source+Sans+3:wght@400;600&display=swap",
    collections: [
      {
        id: "features",
        title: "What you get",
        intro: "Each feature card is an item from /api/features.",
        path: "/api/features",
        items: [
          { id: "board", title: "Shared board", summary: "One board for the week, with owners and a Friday review.", tag: "Plan" },
          { id: "digest", title: "Monday digest", summary: "A short email that lists what moved and what is stuck.", tag: "Mail" },
          { id: "api", title: "Public API", summary: "Read the board from your own tools with a single JSON route.", tag: "API" },
        ],
      },
      {
        id: "plans",
        title: "Pricing",
        intro: "Plans are served by /api/plans so the page and the API stay in sync.",
        path: "/api/plans",
        items: [
          { id: "starter", title: "Starter", summary: "One board, three members, Monday digest.", price: "$0", meta: "For trying the desk" },
          { id: "team", title: "Team", summary: "Unlimited boards, guests, and the public API.", price: "$18", meta: "per seat / month" },
          { id: "studio", title: "Studio", summary: "SSO, audit log, and a shared success channel.", price: "$42", meta: "per seat / month" },
        ],
      },
    ],
    action: {
      path: "/api/waitlist",
      title: "Join the waitlist",
      intro: "We store the request in memory and return it as JSON.",
      submitLabel: "Request access",
      success: "You are on the list. We will write when a seat opens.",
      fields: [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Grace Hopper" },
        { name: "email", label: "Work email", type: "email", required: true, placeholder: "grace@studio.com" },
      ],
    },
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Menu from the API and a reservation desk",
    icon: "♨",
    prompt: "Generate a full-stack restaurant website",
    defaultName: "Hearth & Rye",
    tagline: "Supper, bread, and a quiet room.",
    lede: "A neighborhood dining room. The menu is /api/menu and reservations post to /api/reservations.",
    heroImage: photo("1414235077428-338989a2e8c0"),
    ink: "#2a2118",
    paper: "#fbf6ef",
    accent: "#9f1239",
    accentSoft: "#ffe4e6",
    displayFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: '"Nunito Sans", sans-serif',
    fontHref: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@560;680&family=Nunito+Sans:wght@400;600;700&display=swap",
    collections: [
      {
        id: "menu",
        title: "Tonight's menu",
        intro: "Dishes are loaded from the server. Prices travel with each item.",
        path: "/api/menu",
        items: [
          { id: "bread", title: "Warm rye", summary: "Cultured butter, sea salt, and honey from the next county.", price: "$8", tag: "Bread", image: photo("1509440159596-0249088772ff", 900, 700) },
          { id: "broth", title: "Roast chicken broth", summary: "Dumplings, herbs, and a lemon oil.", price: "$16", tag: "Soup", image: photo("1547592166-23ac45744acd", 900, 700) },
          { id: "trout", title: "River trout", summary: "Brown butter, almonds, and new potatoes.", price: "$29", tag: "Main", image: photo("1467003909585-2f8a72700288", 900, 700) },
          { id: "tart", title: "Rye apple tart", summary: "Cider caramel and cold cream.", price: "$12", tag: "Sweet", image: photo("1565958011703-44f9829ba187", 900, 700) },
        ],
      },
    ],
    action: {
      path: "/api/reservations",
      title: "Reserve a table",
      intro: "Tell us the size of the party and when you would like to sit.",
      submitLabel: "Request table",
      success: "The room has your request. We confirm by email.",
      fields: [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Mina" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "mina@example.com" },
        { name: "party", label: "Party size", type: "number", required: true, placeholder: "2" },
        { name: "when", label: "When", type: "text", required: true, placeholder: "Friday, 7:30pm" },
      ],
    },
  },
  {
    id: "blog",
    label: "Blog",
    description: "Posts from the API and a comment endpoint",
    icon: "✎",
    prompt: "Generate a full-stack blog website",
    defaultName: "Field Notes",
    tagline: "Short essays on making software in public.",
    lede: "Essays are served from /api/posts. Comments post to /api/comments and stay in memory on the server.",
    heroImage: photo("1455390582262-044cdead277a"),
    ink: "#1e293b",
    paper: "#f8fafc",
    accent: "#1d4ed8",
    accentSoft: "#dbeafe",
    displayFont: '"Newsreader", Georgia, serif',
    bodyFont: '"Figtree", sans-serif',
    fontHref: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;600&family=Newsreader:opsz,wght@6..72,500;6..72,650&display=swap",
    collections: [
      {
        id: "posts",
        title: "Latest notes",
        intro: "The list is the same JSON the API returns.",
        path: "/api/posts",
        items: [
          { id: "seeds", title: "Seed data is a feature", summary: "A preview should still tell the truth when the API is offline. Ship the same records in both places.", meta: "March 2", tag: "Practice" },
          { id: "routes", title: "Name the route after the page", summary: "If the card says projects, the path should be /api/projects. Readers can follow the wire.", meta: "March 9", tag: "API" },
          { id: "forms", title: "Forms are just JSON", summary: "A contact form does not need a framework. Validate fields, store the body, return a sentence.", meta: "March 16", tag: "Forms" },
        ],
      },
    ],
    action: {
      path: "/api/comments",
      title: "Leave a comment",
      intro: "Mention the note you are answering. The API checks that every field is present.",
      submitLabel: "Post comment",
      success: "Comment stored on the server.",
      fields: [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Lin" },
        { name: "post", label: "Note", type: "text", required: true, placeholder: "Seed data is a feature" },
        { name: "message", label: "Comment", type: "textarea", required: true, placeholder: "This helped me wire the preview." },
      ],
    },
  },
  {
    id: "store",
    label: "Store",
    description: "Product catalog, cart, and checkout API",
    icon: "▢",
    prompt: "Generate a full-stack store website",
    defaultName: "Marlow Goods",
    tagline: "Objects for a slower desk.",
    lede: "A small goods shop. Products come from /api/products and checkout posts the cart to /api/checkout.",
    heroImage: photo("1441984904996-e0b6ba687e04"),
    ink: "#1c1917",
    paper: "#faf7f2",
    accent: "#a16207",
    accentSoft: "#fef3c7",
    displayFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Libre Franklin", sans-serif',
    fontHref: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Libre+Franklin:wght@400;600&display=swap",
    collections: [
      {
        id: "products",
        title: "In the shop",
        intro: "Add pieces to the cart, then send the order through the checkout route.",
        path: "/api/products",
        items: [
          { id: "lamp", title: "Brass task lamp", summary: "A low lamp with a linen shade and a weighted base.", price: "$120", tag: "Light", image: photo("1507473885765-e6ed057f782c", 900, 700) },
          { id: "notebook", title: "Cloth notebook", summary: "Plain paper, sewn binding, and a pocket in the back.", price: "$24", tag: "Paper", image: photo("1512820790803-83ca734da794", 900, 700) },
          { id: "cup", title: "Stone cup", summary: "A heavy cup for tea. Speckled glaze, one of a small batch.", price: "$36", tag: "Table", image: photo("1514228742587-6b1558fcca3d", 900, 700) },
          { id: "tray", title: "Oak tray", summary: "A shallow tray for keys, mail, and the morning cup.", price: "$64", tag: "Wood", image: photo("1616628188858-97e099d8e56a", 900, 700) },
        ],
      },
    ],
    action: {
      path: "/api/checkout",
      title: "Checkout",
      intro: "The cart lives in the browser. Checkout sends the chosen products with your email.",
      submitLabel: "Place order",
      success: "Order received. We will write with pickup details.",
      cart: true,
      fields: [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Noah" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "noah@example.com" },
      ],
    },
  },
  {
    id: "agency",
    label: "Agency",
    description: "Services, case studies, and a lead API",
    icon: "◎",
    prompt: "Generate a full-stack agency website",
    defaultName: "Kindred & Co",
    tagline: "A small studio for clear websites.",
    lede: "We design the page and the API together. Services and case studies are collections. New leads post to /api/leads.",
    heroImage: photo("1522202176988-66273c2fd55f"),
    ink: "#111827",
    paper: "#f4f6f8",
    accent: "#0e7490",
    accentSoft: "#cffafe",
    displayFont: '"Syne", sans-serif',
    bodyFont: '"Manrope", sans-serif',
    fontHref: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&family=Syne:wght@600;700&display=swap",
    collections: [
      {
        id: "services",
        title: "Services",
        intro: "Three ways to work together. The list is /api/services.",
        path: "/api/services",
        items: [
          { id: "site", title: "Marketing site", summary: "A single page with a real API behind the forms.", meta: "3 weeks", tag: "Web" },
          { id: "system", title: "Design system", summary: "Type, color, and the components your editors reuse.", meta: "4 weeks", tag: "UI" },
          { id: "care", title: "Care plan", summary: "A monthly pass for copy, fixes, and new sections.", meta: "Ongoing", tag: "Retain" },
        ],
      },
      {
        id: "work",
        title: "Case studies",
        intro: "Recent partnerships, served from /api/work.",
        path: "/api/work",
        items: [
          { id: "atlas", title: "Atlas Transit", summary: "A timetable site that stayed fast on a phone in the station.", image: photo("1469854523086-cc02fe5d8800", 900, 700), tag: "Transit" },
          { id: "oriole", title: "Oriole Books", summary: "A shopfront with a checkout route and a reading list.", image: photo("1481627834876-b7833e8f5570", 900, 700), tag: "Retail" },
        ],
      },
    ],
    action: {
      path: "/api/leads",
      title: "Tell us about the work",
      intro: "A short brief is enough. The API stores it and replies with a confirmation.",
      submitLabel: "Send brief",
      success: "Brief received. A producer will reply within two days.",
      fields: [
        { name: "name", label: "Name", type: "text", required: true, placeholder: "Sam" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "sam@company.com" },
        { name: "brief", label: "Brief", type: "textarea", required: true, placeholder: "We need a site and a booking API." },
      ],
    },
  },
];

const blueprintById = new Map(WEBSITE_BLUEPRINTS.map((blueprint) => [blueprint.id, blueprint]));

export function listWebsiteBlueprints(): WebsiteBlueprint[] {
  return WEBSITE_BLUEPRINTS;
}

export function getWebsiteBlueprint(id: string): WebsiteBlueprint | undefined {
  return blueprintById.get(id);
}

function normalizePrompt(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchWebsiteGeneratorPrompt(text: string): { blueprintId: string; siteName?: string } | null {
  const named = text.trim().match(/^(.*?)\s+named\s+["']([^"']+)["']\s*$/i);
  const body = (named?.[1] ?? text).trim();
  const siteName = named?.[2]?.trim();
  const normalized = normalizePrompt(body);
  for (const blueprint of WEBSITE_BLUEPRINTS) {
    const candidates = [
      normalizePrompt(blueprint.prompt),
      normalizePrompt(`generate a full-stack ${blueprint.label} website`),
      normalizePrompt(`generate a full-stack ${blueprint.id} website`),
    ];
    if (candidates.includes(normalized)) {
      return { blueprintId: blueprint.id, siteName: siteName || undefined };
    }
  }
  return null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] ?? ch
  ));
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

function cleanSiteName(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? "").replace(/\s+/g, " ").trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, 48);
}

function file(id: string, language: string, content: string): GeneratedWebsiteFile {
  const name = id.split("/").pop() || id;
  return { id, name, language, content };
}

function renderClientScript(): string {
  return `(function () {
  var seed = window.__SITE_SEED__ || { collections: [], actions: [] };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] || ch;
    });
  }

  function itemsFor(path) {
    var match = (seed.collections || []).filter(function (collection) {
      return collection.path === path;
    })[0];
    return match && Array.isArray(match.items) ? match.items : [];
  }

  function load(path) {
    if (typeof fetch !== "function") return Promise.resolve(itemsFor(path));
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    }).then(function (data) {
      return Array.isArray(data) ? data : itemsFor(path);
    }).catch(function () {
      return itemsFor(path);
    });
  }

  var cartEnabled = (seed.actions || []).some(function (action) { return action.cart; });

  function card(item) {
    var img = item.image ? '<img src="' + escapeHtml(item.image) + '" alt="">' : "";
    var tag = item.tag ? '<p class="tag">' + escapeHtml(item.tag) + "</p>" : "";
    var meta = item.meta ? '<p class="meta">' + escapeHtml(item.meta) + "</p>" : "";
    var price = item.price ? '<p class="price">' + escapeHtml(item.price) + "</p>" : "";
    var add = item.price && cartEnabled
      ? '<button type="button" class="add" data-id="' + escapeHtml(item.id) + '">Add to cart</button>'
      : "";
    return '<article class="card">' + img + '<div class="card-body">' + tag +
      "<h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.summary) + "</p>" +
      meta + price + add + "</div></article>";
  }

  function renderLists() {
    var nodes = document.querySelectorAll("[data-collection]");
    Array.prototype.forEach.call(nodes, function (node) {
      var path = node.getAttribute("data-collection");
      load(path).then(function (items) {
        node.innerHTML = items.length
          ? items.map(card).join("")
          : '<p class="empty">Nothing here yet.</p>';
      });
    });
  }

  var cart = [];

  document.addEventListener("click", function (event) {
    var btn = event.target.closest ? event.target.closest(".add") : null;
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var all = (seed.collections || []).reduce(function (list, collection) {
      return list.concat(collection.items || []);
    }, []);
    var item = all.filter(function (entry) { return entry.id === id; })[0];
    if (!item) return;
    cart.push({ id: item.id, title: item.title, price: item.price });
    var count = document.querySelector("[data-cart-count]");
    if (count) count.textContent = String(cart.length);
    btn.textContent = "Added";
  });

  Array.prototype.forEach.call(document.querySelectorAll("form[data-action]"), function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var path = form.getAttribute("data-action");
      var status = form.querySelector("[data-status]");
      var body = {};
      Array.prototype.forEach.call(form.elements, function (field) {
        if (!field.name || field.disabled) return;
        body[field.name] = field.value;
      });
      if (form.hasAttribute("data-cart")) {
        if (!cart.length) {
          if (status) status.textContent = "Add a product before checkout.";
          return;
        }
        body.items = cart.map(function (item) {
          return { id: item.id, title: item.title, price: item.price };
        });
      }
      var action = (seed.actions || []).filter(function (entry) { return entry.path === path; })[0];
      var success = action && action.success ? action.success : "Saved.";
      var finish = function (message) {
        if (status) status.textContent = message;
        form.reset();
        if (form.hasAttribute("data-cart")) {
          cart = [];
          var count = document.querySelector("[data-cart-count]");
          if (count) count.textContent = "0";
        }
      };
      if (typeof fetch !== "function") {
        finish(success + " Preview saved this locally.");
        return;
      }
      fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      }).then(function (saved) {
        finish(saved.message || success);
      }).catch(function () {
        finish(success + " The preview stored this locally. Run npm start to save it on the API.");
      });
    });
  });

  renderLists();
})();
`;
}

function renderStyles(blueprint: WebsiteBlueprint): string {
  return `/* ${blueprint.defaultName} — generated styles */
:root {
  --ink: ${blueprint.ink};
  --paper: ${blueprint.paper};
  --accent: ${blueprint.accent};
  --accent-soft: ${blueprint.accentSoft};
  --line: color-mix(in srgb, var(--ink) 12%, transparent);
  --display: ${blueprint.displayFont};
  --body: ${blueprint.bodyFont};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--body);
  font-size: 17px;
  line-height: 1.55;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.nav, .hero, .section, .footer { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 0 8px;
  position: sticky;
  top: 0;
  z-index: 2;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(10px);
}
.brand { font-family: var(--display); font-size: 22px; text-decoration: none; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 16px; align-items: center; }
.nav-links a { text-decoration: none; font-size: 14px; font-weight: 600; }
.cart-pill {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 13px;
}
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px; align-items: end; padding: 28px 0 10px; }
.kicker { letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; font-weight: 700; color: var(--accent); margin: 0 0 10px; }
h1, h2, h3 { font-family: var(--display); letter-spacing: -0.03em; line-height: 1.05; }
h1 { font-size: clamp(46px, 7vw, 84px); margin: 0 0 12px; }
.lede { font-size: 18px; max-width: 38rem; margin: 0 0 20px; }
.hero-link, button, .add {
  background: var(--ink);
  color: var(--paper);
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font: 600 14px var(--body);
  text-decoration: none;
  display: inline-flex;
  cursor: pointer;
}
.hero figure { margin: 0; }
.hero img, .card img { width: 100%; height: 100%; object-fit: cover; border-radius: 18px; }
.hero img { max-height: 460px; }
.section { padding: 42px 0; }
.section h2 { font-size: clamp(32px, 4vw, 48px); margin: 0 0 8px; }
.intro { margin: 0 0 22px; max-width: 40rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; }
.card { background: white; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; }
.card img { height: 180px; border-radius: 0; }
.card-body { padding: 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.card h3 { margin: 0; font-size: 24px; }
.card p { margin: 0; }
.tag, .meta { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.tag { color: var(--accent); }
.price { font-family: var(--display); font-size: 28px; }
.add { margin-top: auto; align-self: flex-start; background: var(--accent); }
.panel {
  background: var(--accent-soft);
  border-radius: 24px;
  padding: 24px;
  display: grid;
  gap: 14px;
}
label { display: grid; gap: 6px; font-size: 14px; font-weight: 700; }
input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: white;
  color: var(--ink);
  border-radius: 12px;
  padding: 12px 14px;
  font: 400 16px var(--body);
}
textarea { min-height: 120px; resize: vertical; }
.status { min-height: 1.2em; margin: 0; font-size: 14px; }
.footer { padding: 10px 0 40px; display: flex; justify-content: space-between; gap: 12px; font-size: 14px; border-top: 1px solid var(--line); }
@media (max-width: 800px) {
  .hero, .footer, .nav { display: block; }
  .nav-links { margin-top: 10px; }
  .hero img { margin-top: 18px; max-height: 280px; }
}
`;
}

function renderField(field: WebsiteField): string {
  const required = field.required ? " required" : "";
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";
  const control = field.type === "textarea"
    ? `<textarea name="${escapeHtml(field.name)}"${placeholder}${required}></textarea>`
    : `<input name="${escapeHtml(field.name)}" type="${field.type}"${placeholder}${required} />`;
  return `<label>${escapeHtml(field.label)}${control}</label>`;
}

function renderPage(blueprint: WebsiteBlueprint, siteName: string, seedJson: string): string {
  const nav = blueprint.collections.map((collection) => (
    `<a href="#${escapeHtml(collection.id)}">${escapeHtml(collection.title)}</a>`
  )).join("");
  const cart = blueprint.action.cart
    ? `<span class="cart-pill">Cart <span data-cart-count>0</span></span>`
    : "";
  const sections = blueprint.collections.map((collection) => `
    <section class="section" id="${escapeHtml(collection.id)}">
      <h2>${escapeHtml(collection.title)}</h2>
      <p class="intro">${escapeHtml(collection.intro)}</p>
      <div class="grid" data-collection="${escapeHtml(collection.path)}"></div>
    </section>`).join("\n");
  const fields = blueprint.action.fields.map(renderField).join("\n");
  const cartAttr = blueprint.action.cart ? " data-cart" : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(siteName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="${escapeHtml(blueprint.fontHref)}" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="true">
  <header class="nav">
    <a class="brand" href="#top">${escapeHtml(siteName)}</a>
    <nav class="nav-links">${nav}<a href="#contact">${escapeHtml(blueprint.action.title)}</a>${cart}</nav>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="kicker">${escapeHtml(blueprint.label)}</p>
        <h1>${escapeHtml(blueprint.tagline)}</h1>
        <p class="lede">${escapeHtml(blueprint.lede)}</p>
        <a class="hero-link" href="#${escapeHtml(blueprint.collections[0]?.id || "contact")}">See the work</a>
      </div>
      <figure>
        <img src="${escapeHtml(blueprint.heroImage)}" alt="" />
      </figure>
    </section>
    ${sections}
    <section class="section" id="contact">
      <h2>${escapeHtml(blueprint.action.title)}</h2>
      <p class="intro">${escapeHtml(blueprint.action.intro)}</p>
      <form class="panel" data-action="${escapeHtml(blueprint.action.path)}"${cartAttr}>
        ${fields}
        <button type="submit">${escapeHtml(blueprint.action.submitLabel)}</button>
        <p class="status" data-status></p>
      </form>
    </section>
  </main>
  <footer class="footer">
    <span>${escapeHtml(siteName)}</span>
    <span>Full-stack site from the Lunor web assistant</span>
  </footer>
  <script>window.__SITE_SEED__ = ${seedJson};</script>
  <script src="script.js"></script>
</body>
</html>
`;
}

function renderServer(): string {
  return `const express = require("express");
const cors = require("cors");
const path = require("path");
const data = require("./data");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "src")));

app.get("/api/health", function (_req, res) {
  res.json({ ok: true, site: data.siteName });
});

data.collections.forEach(function (collection) {
  app.get(collection.path, function (_req, res) {
    res.json(collection.items);
  });
});

data.actions.forEach(function (action) {
  app.post(action.path, function (req, res) {
    const body = req.body || {};
    const missing = action.fields.filter(function (field) {
      const value = body[field];
      return value == null || String(value).trim() === "";
    });
    if (missing.length) {
      res.status(400).json({ error: "Missing fields", fields: missing });
      return;
    }
    const entry = Object.assign({ id: Date.now().toString(36), receivedAt: new Date().toISOString() }, body);
    if (!Array.isArray(data.submissions[action.path])) data.submissions[action.path] = [];
    data.submissions[action.path].push(entry);
    res.status(201).json({ message: action.success, entry: entry });
  });
});

app.listen(port, function () {
  console.log(data.siteName + " API running at http://localhost:" + port);
});
`;
}

function renderReadme(siteName: string, blueprint: WebsiteBlueprint): string {
  const routes = [
    ...blueprint.collections.map((collection) => `- \`GET ${collection.path}\` — ${collection.title}`),
    `- \`POST ${blueprint.action.path}\` — ${blueprint.action.title}`,
    "- `GET /api/health` — service check",
  ].join("\n");
  return `# ${siteName}

Full-stack ${blueprint.label.toLowerCase()} generated by the Lunor web development assistant.

The browser page lives in \`src/\`. The Express API lives in \`server/\` and serves that page plus JSON.

## Run

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000.

## Routes

${routes}

The preview inside Lunor has no Node server, so \`src/script.js\` falls back to \`window.__SITE_SEED__\`. Those records match \`server/data.js\`.

## Files

- \`src/index.html\` — page structure
- \`src/styles.css\` — layout and type
- \`src/script.js\` — lists, cart, and forms
- \`server/data.js\` — shared content
- \`server/index.js\` — Express app
`;
}

function renderChatMessage(siteName: string, blueprint: WebsiteBlueprint): string {
  const gets = blueprint.collections.map((collection) => `\`${collection.path}\``).join(", ");
  return [
    `Built **${siteName}**, a full-stack ${blueprint.label.toLowerCase()} site, and opened it in the editor.`,
    "",
    "**Frontend** — live in the preview",
    "- `src/index.html`",
    "- `src/styles.css`",
    "- `src/script.js` loads " + gets + " and falls back to seed data when the API is offline",
    "",
    "**API** — Node and Express",
    "- `server/index.js`",
    "- `server/data.js`",
    `- \`POST ${blueprint.action.path}\` accepts ${blueprint.action.fields.map((field) => field.name).join(", ")}`,
    "",
    "Run it on your machine with `npm install` and `npm start`, then open http://localhost:3000.",
    "",
    "Ask me to change the copy, colors, or add another route.",
  ].join("\n");
}

export function generateFullStackWebsite(blueprintId: string, siteName?: string): GeneratedWebsite {
  const blueprint = blueprintById.get(blueprintId) ?? WEBSITE_BLUEPRINTS[0];
  const name = cleanSiteName(siteName, blueprint.defaultName);
  const model = {
    siteName: name,
    collections: blueprint.collections.map((collection) => ({
      path: collection.path,
      items: collection.items,
    })),
    actions: [
      {
        path: blueprint.action.path,
        fields: blueprint.action.fields.map((field) => field.name),
        success: blueprint.action.success,
        cart: Boolean(blueprint.action.cart),
      },
    ],
    submissions: { [blueprint.action.path]: [] as unknown[] },
  };
  const seedJson = JSON.stringify({
    siteName: model.siteName,
    collections: model.collections,
    actions: model.actions.map((action) => ({ path: action.path, success: action.success, cart: action.cart })),
  }).replace(/</g, "\\u003c");
  const files = [
    file("src/index.html", "html", renderPage(blueprint, name, seedJson)),
    file("src/styles.css", "css", renderStyles(blueprint)),
    file("src/script.js", "javascript", renderClientScript()),
    file("server/data.js", "javascript", `/** Shared records for the page seed and the API. */\nmodule.exports = ${JSON.stringify(model, null, 2)};\n`),
    file("server/index.js", "javascript", renderServer()),
    file("package.json", "json", `${JSON.stringify({
      name: slugify(name),
      version: "1.0.0",
      private: true,
      description: `${name} — full-stack site generated by Lunor.AI`,
      scripts: { start: "node server/index.js", dev: "node server/index.js" },
      dependencies: { cors: "^2.8.5", express: "^4.21.2" },
    }, null, 2)}\n`),
    file("README.md", "markdown", renderReadme(name, blueprint)),
    file(".env.example", "plaintext", "PORT=3000\n"),
  ];
  return {
    blueprintId: blueprint.id,
    siteName: name,
    prompt: blueprint.prompt,
    chatMessage: renderChatMessage(name, blueprint),
    previewPath: "src/index.html",
    files,
    tree: filesToTree(files),
  };
}

export function resolveGeneratedPath(filename: string): { id: string; name: string } {
  const cleaned = filename.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  const fallback = (cleaned.split("/").pop() || "untitled.txt").replace(/[^a-zA-Z0-9._-]/g, "") || "untitled.txt";
  const parts = cleaned.split("/");
  if (!cleaned || parts.some((part) => part === "" || part === "." || part === "..")) {
    return { id: `src/${fallback}`, name: fallback };
  }
  if (cleaned.includes("/")) {
    return { id: cleaned, name: parts[parts.length - 1] };
  }
  return { id: `src/${cleaned}`, name: cleaned };
}

export function upsertProjectFile<T extends ProjectFileNode>(
  tree: T[],
  fileNode: { id: string; name: string; language: string; content: string },
): T[] {
  const parts = fileNode.id.split("/");
  const folders = parts.slice(0, -1);
  const nextFile: ProjectFileNode = {
    id: fileNode.id,
    name: fileNode.name,
    type: "file",
    language: fileNode.language,
    content: fileNode.content,
  };

  const insert = (nodes: ProjectFileNode[], depth: number): ProjectFileNode[] => {
    if (depth === folders.length) {
      const index = nodes.findIndex((node) => node.id === fileNode.id);
      if (index >= 0) return nodes.map((node, i) => (i === index ? { ...node, ...nextFile } : node));
      return [...nodes, nextFile];
    }
    const folderId = folders.slice(0, depth + 1).join("/");
    const index = nodes.findIndex((node) => node.type === "folder" && node.id === folderId);
    if (index === -1) {
      return [...nodes, {
        id: folderId,
        name: folders[depth],
        type: "folder",
        isOpen: true,
        children: insert([], depth + 1),
      }];
    }
    return nodes.map((node, i) => (
      i === index ? { ...node, isOpen: true, children: insert(node.children || [], depth + 1) } : node
    ));
  };

  return insert(tree, 0) as T[];
}

export function filesToTree(files: GeneratedWebsiteFile[]): ProjectFileNode[] {
  return files.reduce<ProjectFileNode[]>((tree, entry) => upsertProjectFile(tree, {
    id: entry.id,
    name: entry.name,
    language: entry.language,
    content: entry.content,
  }), []);
}

export function extractFencedProjectFiles(markdown: string): FencedProjectFile[] {
  const regex = /(?:(?:^|\n)[ \t]*[`*]*((?:[\w.-]+\/)*[\w.-]+\.\w+)[`*]*[ \t]*:?[ \t]*\n)?```([\w-]*)\n([\s\S]*?)```/g;
  const blocks: FencedProjectFile[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({
      path: match[1] || undefined,
      language: match[2] || "javascript",
      code: match[3].trim(),
    });
  }
  return blocks;
}
