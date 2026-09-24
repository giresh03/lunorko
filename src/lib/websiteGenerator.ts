/**
 * Full-stack website blueprints for the Web Development assistant.
 * Each site is vanilla HTML/CSS/JS under client/ plus an Express API under server/.
 * The client renders seed data immediately and uses the API when it is running.
 */

export type WebsiteBlueprintId = "landing" | "portfolio" | "blog" | "store" | "dashboard";

export type CatalogKind = "products" | "coffee" | "supper";

export interface WebsiteBlueprint {
  id: WebsiteBlueprintId;
  label: string;
  description: string;
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  { id: "landing", label: "SaaS landing", description: "Hero, features, and pricing" },
  { id: "portfolio", label: "Portfolio", description: "Selected work and about" },
  { id: "blog", label: "Blog", description: "Essays from a seed API" },
  { id: "store", label: "Shop", description: "Catalog with a client cart" },
  { id: "dashboard", label: "Dashboard", description: "Metrics and activity" },
];

export interface WebsiteBrief {
  blueprint: WebsiteBlueprintId;
  brand?: string;
  catalog?: CatalogKind;
}

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

export interface WebsiteProject {
  blueprint: WebsiteBlueprintId;
  brand: string;
  title: string;
  summary: string;
  routes: string[];
  files: GeneratedFile[];
}

interface Palette {
  bg: string;
  ink: string;
  accent: string;
  accentInk: string;
  muted: string;
  card: string;
  line: string;
}

interface SeedRecord {
  id: string;
  name?: string;
  title?: string;
  detail?: string;
  excerpt?: string;
  price?: number;
  image?: string;
  value?: string;
  delta?: string;
  time?: string;
  text?: string;
  tag?: string;
}

interface Seed {
  brand: string;
  tagline: string;
  menu?: CatalogKind;
  features?: SeedRecord[];
  plans?: SeedRecord[];
  projects?: SeedRecord[];
  posts?: SeedRecord[];
  products?: SeedRecord[];
  metrics?: SeedRecord[];
  activity?: SeedRecord[];
}

const PALETTES: Record<WebsiteBlueprintId, Palette> = {
  landing: { bg: "#07111a", ink: "#e8f4f1", accent: "#2ee6a6", accentInk: "#04281c", muted: "#93a8b4", card: "#10202c", line: "#1d3342" },
  portfolio: { bg: "#14110e", ink: "#f6f1e8", accent: "#e7a15a", accentInk: "#2a1606", muted: "#b7aa9b", card: "#221c17", line: "#3a3128" },
  blog: { bg: "#f6f1e7", ink: "#1c1915", accent: "#0f6e56", accentInk: "#f4fff9", muted: "#5e584e", card: "#fffdf8", line: "#e4dccf" },
  store: { bg: "#1a1210", ink: "#f8efe6", accent: "#e07a5f", accentInk: "#2a100c", muted: "#cbb8ac", card: "#2a1c18", line: "#4a332c" },
  dashboard: { bg: "#0c1220", ink: "#e7eef8", accent: "#7aa2ff", accentInk: "#081226", muted: "#93a0b8", card: "#151d2e", line: "#26324a" },
};

const COFFEE_PRODUCTS: SeedRecord[] = [
  { id: "esp", name: "Espresso", detail: "Short, sweet, and pulled to order.", price: 350, image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop&q=80", tag: "Coffee" },
  { id: "cor", name: "Cortado", detail: "Equal parts espresso and warm milk.", price: 425, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop&q=80", tag: "Coffee" },
  { id: "oat", name: "Oat Latte", detail: "Silky oat milk over a double shot.", price: 525, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop&q=80", tag: "Coffee" },
  { id: "cold", name: "Cold Brew", detail: "Steeped overnight, served over ice.", price: 475, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop&q=80", tag: "Coffee" },
  { id: "bun", name: "Honey Bun", detail: "Warm pastry with a citrus glaze.", price: 395, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&q=80", tag: "Bakery" },
  { id: "alm", name: "Almond Croissant", detail: "Flaky, toasted, and filled.", price: 450, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop&q=80", tag: "Bakery" },
];

const SUPPER_PRODUCTS: SeedRecord[] = [
  { id: "roast", name: "Herb Roast Chicken", detail: "Supper plate with pan juices and greens.", price: 2400, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop&q=80", tag: "Supper" },
  { id: "risotto", name: "Mushroom Risotto", detail: "Slow-stirred rice, thyme, and parmesan.", price: 2100, image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop&q=80", tag: "Supper" },
  { id: "chowder", name: "Harbor Chowder", detail: "Creamy cup with dill oil.", price: 1200, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop&q=80", tag: "Supper" },
  { id: "salad", name: "Citrus Salad", detail: "Fennel, orange, and olive oil.", price: 1400, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&q=80", tag: "Supper" },
  { id: "pot", name: "Chocolate Pot", detail: "Dark chocolate, finished with salt.", price: 1100, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop&q=80", tag: "Supper" },
  { id: "tart", name: "Seasonal Tart", detail: "Fruit tart for the late seating.", price: 1150, image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800&h=600&fit=crop&q=80", tag: "Supper" },
];

const GOODS: SeedRecord[] = [
  { id: "lamp", name: "Arc Lamp", detail: "Brass arm, linen shade, warm bulb.", price: 8900, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=600&fit=crop&q=80", tag: "Home" },
  { id: "mug", name: "Stoneware Mug", detail: "Speckled clay, holds twelve ounces.", price: 2800, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=600&fit=crop&q=80", tag: "Home" },
  { id: "tote", name: "Canvas Tote", detail: "Heavy weave with an interior pocket.", price: 4200, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=600&fit=crop&q=80", tag: "Carry" },
  { id: "note", name: "Field Notebook", detail: "Plain pages, lay-flat binding.", price: 1800, image: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800&h=600&fit=crop&q=80", tag: "Paper" },
];

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "site";
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
}

const BUILD_VERB = /\b(build|create|make|generate|design|scaffold)\b/i;
const SITE_WORD = /\b(websites?|web\s*sites?|landing\s+pages?|full[\s-]?stack(?:\s+site)?)\b/i;

export function matchWebsiteRequest(prompt: string): WebsiteBrief | null {
  const text = prompt.trim();
  if (!text || !BUILD_VERB.test(text)) return null;
  const site = SITE_WORD.test(text);

  let blueprint: WebsiteBlueprintId | null = null;
  let catalog: CatalogKind | undefined;

  if (/\b(coffee|caf[eé])\b/i.test(text)) {
    blueprint = "store";
    catalog = "coffee";
  } else if (/\b(restaurant|supper|diner)\b/i.test(text)) {
    blueprint = "store";
    catalog = "supper";
  } else if (/\b(portfolio)\b/i.test(text)) {
    blueprint = "portfolio";
  } else if (/\b(blog)\b/i.test(text)) {
    blueprint = "blog";
  } else if (/\b(dashboard)\b/i.test(text)) {
    blueprint = "dashboard";
  } else if (/\b(saas|startup|landing)\b/i.test(text)) {
    blueprint = "landing";
  } else if (/\b(store|shop|e-?commerce)\b/i.test(text)) {
    blueprint = "store";
    catalog = "products";
  } else if (site) {
    blueprint = "landing";
  }

  if (!blueprint) return null;
  if (!site && !blueprint) return null;

  const named = text.match(/\b(?:for|called|named)\s+([A-Za-z][\w'’.-]*(?:\s+[A-Za-z][\w'’.-]*){0,3})/);
  let brand = named?.[1]?.replace(/\b(website|site|shop|store|page|landing)\b/gi, "").trim();
  if (brand) brand = titleCase(brand);
  if (!brand) {
    if (catalog === "coffee") brand = "Harbor Coffee";
    else if (catalog === "supper") brand = "Harbor Supper";
    else if (blueprint === "store") brand = "Harbor Goods";
    else if (blueprint === "landing") brand = "Northstar";
    else if (blueprint === "portfolio") brand = "Avery Cole";
    else if (blueprint === "blog") brand = "Field Notes";
    else brand = "Pulse";
  }

  return { blueprint, brand, catalog };
}

function buildSeed(brief: Required<Pick<WebsiteBrief, "blueprint" | "brand">> & { catalog?: CatalogKind }): Seed {
  const { blueprint, brand, catalog } = brief;
  if (blueprint === "landing") {
    return {
      brand,
      tagline: "Ship a calmer product week, with one place for the work that matters.",
      features: [
        { id: "plan", name: "Shared plans", detail: "Turn a brief into owners, dates, and a visible next step." },
        { id: "review", name: "Review rooms", detail: "Comment on the work itself instead of a side thread." },
        { id: "ship", name: "Release notes", detail: "Publish what changed without writing it twice." },
      ],
      plans: [
        { id: "solo", name: "Solo", detail: "For a founder shipping the first version.", price: 0 },
        { id: "team", name: "Team", detail: "Shared rooms for up to twenty people.", price: 1800 },
        { id: "studio", name: "Studio", detail: "Audit log, SSO, and a named success partner.", price: 4200 },
      ],
    };
  }
  if (blueprint === "portfolio") {
    return {
      brand,
      tagline: "Product design and front-end engineering for teams who care how it feels.",
      projects: [
        { id: "atlas", name: "Atlas Library", detail: "A reading room for a city archive. Quiet type, long pages.", tag: "Web", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&h=600&fit=crop&q=80" },
        { id: "ferry", name: "Ferry Tickets", detail: "Mobile booking that stays readable on a sunny deck.", tag: "Product", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=600&fit=crop&q=80" },
        { id: "kiln", name: "Kiln Studio", detail: "Catalog and wholesale orders for a ceramics workshop.", tag: "Shop", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&h=600&fit=crop&q=80" },
      ],
    };
  }
  if (blueprint === "blog") {
    return {
      brand,
      tagline: "Notes on making software that people can finish reading.",
      posts: [
        { id: "type", title: "Type that survives a long article", excerpt: "Line length, contrast, and why the second paragraph matters more than the hero.", tag: "Writing" },
        { id: "api", title: "Seed data before the database", excerpt: "Let the page render when the API is down, then swap in live records.", tag: "Backend" },
        { id: "review", title: "A smaller design review", excerpt: "Three questions that catch a layout before it ships.", tag: "Design" },
      ],
    };
  }
  if (blueprint === "dashboard") {
    return {
      brand,
      tagline: "What changed since yesterday morning.",
      metrics: [
        { id: "signups", name: "Signups", value: "128", delta: "+12%" },
        { id: "active", name: "Active teams", value: "46", delta: "+4" },
        { id: "latency", name: "p95 latency", value: "180ms", delta: "-22ms" },
        { id: "errors", name: "Error rate", value: "0.4%", delta: "-0.1%" },
      ],
      activity: [
        { id: "a1", time: "08:10", text: "North region cache warmed." },
        { id: "a2", time: "09:40", text: "Billing export finished for March." },
        { id: "a3", time: "11:05", text: "Two new workspaces invited their first editor." },
        { id: "a4", time: "13:20", text: "Deploy 1.8.4 is serving traffic." },
      ],
    };
  }
  const menu = catalog || "products";
  const products = menu === "coffee" ? COFFEE_PRODUCTS : menu === "supper" ? SUPPER_PRODUCTS : GOODS;
  const tagline = menu === "coffee"
    ? "A small counter for coffee, pastry, and a seat by the window."
    : menu === "supper"
      ? "A supper menu for the late seating. Order at the table or take a course home."
      : "Objects for a desk, a kitchen, and the walk between them.";
  return { brand, tagline, menu, products };
}

function stylesheet(palette: Palette): string {
  return `:root {
  --bg: ${palette.bg};
  --ink: ${palette.ink};
  --accent: ${palette.accent};
  --accent-ink: ${palette.accentInk};
  --muted: ${palette.muted};
  --card: ${palette.card};
  --line: ${palette.line};
  --sans: "Outfit", "Avenir Next", sans-serif;
  --serif: "Fraunces", Georgia, serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
button, .btn {
  font: inherit;
  border: 0;
  cursor: pointer;
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  font-weight: 650;
}
.wrap { width: min(1080px, calc(100% - 2rem)); margin: 0 auto; }
header.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
}
.brand { font-weight: 700; letter-spacing: -0.03em; text-decoration: none; }
nav { display: flex; gap: 1rem; color: var(--muted); font-size: 0.92rem; }
nav a { text-decoration: none; }
.hero {
  display: grid;
  gap: 1.5rem;
  padding: 2rem 0 3rem;
}
.hero h1 {
  font-family: var(--serif);
  font-weight: 560;
  font-size: clamp(2.4rem, 6vw, 4.6rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  margin: 0 0 0.8rem;
}
.lede { color: var(--muted); font-size: 1.1rem; max-width: 38rem; }
.hero-photo {
  min-height: 280px;
  border-radius: 1.25rem;
  background-size: cover;
  background-position: center;
  border: 1px solid var(--line);
}
.section { padding: 1rem 0 3rem; }
.section h2 { font-family: var(--serif); font-size: 2rem; margin: 0 0 1rem; }
.grid { display: grid; gap: 1rem; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 1rem;
  padding: 1rem;
}
.card h3, .card h2 { margin: 0.4rem 0; }
.card p, .muted { color: var(--muted); }
.tag {
  display: inline-block;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--accent);
}
.row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
.metric { font-family: var(--serif); font-size: 2rem; margin: 0.2rem 0; }
.delta { color: var(--accent); font-size: 0.85rem; }
.activity { display: grid; grid-template-columns: 4.5rem 1fr; gap: 0.75rem; padding: 0.7rem 0; border-bottom: 1px solid var(--line); }
footer { color: var(--muted); padding: 2rem 0 3rem; font-size: 0.9rem; }
.cart {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  color: var(--ink);
}
@media (min-width: 800px) {
  .hero { grid-template-columns: 1.1fr 0.9fr; align-items: center; }
  .grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .dash { display: grid; grid-template-columns: 220px 1fr; gap: 1.5rem; }
}
`;
}

function page(brand: string, blueprint: WebsiteBlueprintId, tagline: string, seed: Seed): string {
  const safeBrand = esc(brand);
  const safeTag = esc(tagline);
  if (blueprint === "landing") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrand}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Outfit:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="true">
  <div class="wrap">
    <header class="bar">
      <a class="brand" href="#top">${safeBrand}</a>
      <nav><a href="#features">Features</a><a href="#plans">Pricing</a></nav>
    </header>
    <section class="hero" id="top">
      <div>
        <h1>Work that stays in one room.</h1>
        <p class="lede">${safeTag}</p>
        <p><a class="btn" href="#plans">See plans</a></p>
      </div>
      <div class="hero-photo" style="background-image:url('https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&h=900&fit=crop&q=80')"></div>
    </section>
    <section class="section" id="features">
      <h2>What you get</h2>
      <div id="feature-grid" class="grid cols-3"></div>
    </section>
    <section class="section" id="plans">
      <h2>Pricing</h2>
      <div id="plan-grid" class="grid cols-3"></div>
    </section>
    <footer>${safeBrand} · sample data renders before the API is running.</footer>
  </div>
  <script src="site.js"></script>
</body>
</html>
`;
  }
  if (blueprint === "portfolio") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrand}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Outfit:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="true">
  <div class="wrap">
    <header class="bar">
      <a class="brand" href="#top">${safeBrand}</a>
      <nav><a href="#work">Work</a><a href="#about">About</a></nav>
    </header>
    <section class="hero" id="top">
      <div>
        <p class="tag">Portfolio</p>
        <h1>${safeBrand}</h1>
        <p class="lede">${safeTag}</p>
      </div>
      <div class="hero-photo" style="background-image:url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&h=900&fit=crop&q=80')"></div>
    </section>
    <section class="section" id="work">
      <h2>Selected work</h2>
      <div id="project-grid" class="grid cols-3"></div>
    </section>
    <section class="section" id="about">
      <h2>About</h2>
      <p class="lede">Available for product partnerships. The projects below load from <code>/api/projects</code> and fall back to the copy bundled in the page.</p>
    </section>
    <footer>${safeBrand} · sample data renders before the API is running.</footer>
  </div>
  <script src="site.js"></script>
</body>
</html>
`;
  }
  if (blueprint === "blog") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrand}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Outfit:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="true">
  <div class="wrap">
    <header class="bar">
      <a class="brand" href="#top">${safeBrand}</a>
      <nav><a href="#posts">Notes</a></nav>
    </header>
    <section class="hero" id="top">
      <div>
        <p class="tag">Journal</p>
        <h1>${safeBrand}</h1>
        <p class="lede">${safeTag}</p>
      </div>
    </section>
    <section class="section" id="posts">
      <div id="post-list" class="grid"></div>
    </section>
    <footer>${safeBrand} · sample data renders before the API is running.</footer>
  </div>
  <script src="site.js"></script>
</body>
</html>
`;
  }
  if (blueprint === "dashboard") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrand}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Outfit:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="true">
  <div class="wrap dash">
    <aside>
      <a class="brand" href="#top">${safeBrand}</a>
      <p class="muted">${safeTag}</p>
    </aside>
    <main id="top">
      <section class="section">
        <h2>Today</h2>
        <div id="metric-grid" class="grid cols-2"></div>
      </section>
      <section class="section">
        <h2>Activity</h2>
        <div id="activity-list"></div>
      </section>
    </main>
  </div>
  <script src="site.js"></script>
</body>
</html>
`;
  }
  const menuLabel = seed.menu === "coffee" ? "Menu" : seed.menu === "supper" ? "Supper menu" : "Catalog";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrand}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560&family=Outfit:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed="true">
  <div class="wrap">
    <header class="bar">
      <a class="brand" href="#top">${safeBrand}</a>
      <div class="row">
        <nav><a href="#catalog">${menuLabel}</a></nav>
        <span class="cart">Cart <strong id="cart-count">0</strong></span>
      </div>
    </header>
    <section class="hero" id="top">
      <div>
        <p class="tag">${esc(menuLabel)}</p>
        <h1>${safeBrand}</h1>
        <p class="lede">${safeTag}</p>
      </div>
      <div class="hero-photo" style="background-image:url('${seed.menu === "supper" ? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=900&fit=crop&q=80" : seed.menu === "coffee" ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&h=900&fit=crop&q=80" : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=900&fit=crop&q=80"}')"></div>
    </section>
    <section class="section" id="catalog">
      <h2>${esc(menuLabel)}</h2>
      <div id="product-grid" class="grid cols-3"></div>
    </section>
    <footer>${safeBrand} · sample data renders before the API is running.</footer>
  </div>
  <script src="site.js"></script>
</body>
</html>
`;
}

function clientScript(blueprint: WebsiteBlueprintId, seed: Seed): string {
  const sample = JSON.stringify(seed, null, 2);
  const loader = `
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
async function loadList(path, fallback) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
    return data;
  } catch {
    return fallback;
  }
}
`;
  if (blueprint === "landing") {
    return `const SAMPLE = ${sample};
${loader}
function drawFeatures(items) {
  const mount = document.getElementById("feature-grid");
  if (!mount) return;
  mount.innerHTML = items.map((item) => \`<article class="card"><h3>\${esc(item.name)}</h3><p>\${esc(item.detail)}</p></article>\`).join("");
}
function drawPlans(items) {
  const mount = document.getElementById("plan-grid");
  if (!mount) return;
  mount.innerHTML = items.map((item) => \`<article class="card"><h3>\${esc(item.name)}</h3><p class="metric">\${item.price ? "$" + (item.price / 100).toFixed(0) : "Free"}</p><p>\${esc(item.detail)}</p></article>\`).join("");
}
drawFeatures(SAMPLE.features);
drawPlans(SAMPLE.plans);
loadList("/api/features", SAMPLE.features).then(drawFeatures);
loadList("/api/plans", SAMPLE.plans).then(drawPlans);
`;
  }
  if (blueprint === "portfolio") {
    return `const SAMPLE = ${sample};
${loader}
function draw(items) {
  const mount = document.getElementById("project-grid");
  if (!mount) return;
  mount.innerHTML = items.map((item) => \`<article class="card"><img src="\${esc(item.image)}" alt=""><p class="tag">\${esc(item.tag)}</p><h3>\${esc(item.name)}</h3><p>\${esc(item.detail)}</p></article>\`).join("");
}
draw(SAMPLE.projects);
loadList("/api/projects", SAMPLE.projects).then(draw);
`;
  }
  if (blueprint === "blog") {
    return `const SAMPLE = ${sample};
${loader}
function draw(items) {
  const mount = document.getElementById("post-list");
  if (!mount) return;
  mount.innerHTML = items.map((item) => \`<article class="card"><p class="tag">\${esc(item.tag)}</p><h2>\${esc(item.title)}</h2><p>\${esc(item.excerpt)}</p></article>\`).join("");
}
draw(SAMPLE.posts);
loadList("/api/posts", SAMPLE.posts).then(draw);
`;
  }
  if (blueprint === "dashboard") {
    return `const SAMPLE = ${sample};
${loader}
function drawMetrics(items) {
  const mount = document.getElementById("metric-grid");
  if (!mount) return;
  mount.innerHTML = items.map((item) => \`<article class="card"><p class="muted">\${esc(item.name)}</p><p class="metric">\${esc(item.value)}</p><p class="delta">\${esc(item.delta)}</p></article>\`).join("");
}
function drawActivity(items) {
  const mount = document.getElementById("activity-list");
  if (!mount) return;
  mount.innerHTML = items.map((item) => \`<div class="activity"><strong>\${esc(item.time)}</strong><span>\${esc(item.text)}</span></div>\`).join("");
}
drawMetrics(SAMPLE.metrics);
drawActivity(SAMPLE.activity);
loadList("/api/metrics", SAMPLE.metrics).then(drawMetrics);
loadList("/api/activity", SAMPLE.activity).then(drawActivity);
`;
  }
  return `const SAMPLE = ${sample};
${loader}
let cart = 0;
function draw(items) {
  const mount = document.getElementById("product-grid");
  if (!mount) return;
  mount.innerHTML = items.map((item) => \`<article class="card"><img src="\${esc(item.image)}" alt=""><p class="tag">\${esc(item.tag)}</p><h3>\${esc(item.name)}</h3><p>\${esc(item.detail)}</p><div class="row"><strong>$\${(item.price / 100).toFixed(2)}</strong><button type="button" data-add="\${esc(item.id)}">Add</button></div></article>\`).join("");
  mount.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cart += 1;
      const badge = document.getElementById("cart-count");
      if (badge) badge.textContent = String(cart);
    });
  });
}
draw(SAMPLE.products);
loadList("/api/products", SAMPLE.products).then(draw);
`;
}

function serverFiles(seed: Seed, brand: string): GeneratedFile[] {
  const pkg = {
    name: `${slug(brand)}-api`,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: { start: "node index.mjs" },
    dependencies: { express: "^4.21.2", mongodb: "^6.12.0" },
  };
  const index = `import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./src/app.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = createApp();
app.use(express.static(path.join(__dirname, "..", "client")));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(\`Site ready at http://localhost:\${port}\`);
});
`;
  const app = `import express from "express";
import { api } from "./routes/api.mjs";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, mongo: Boolean(process.env.MONGODB_URI) });
  });
  app.use("/api", api);
  return app;
}
`;
  const db = `import { MongoClient } from "mongodb";

let client;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(process.env.MONGODB_DB || "lunor");
}

export async function readOrSeed(collection, fallback) {
  try {
    const db = await getDb();
    if (!db) return fallback;
    const docs = await db.collection(collection).find({}).toArray();
    return docs.length ? docs : fallback;
  } catch (err) {
    console.error("MongoDB unavailable, using seed data:", err.message);
    return fallback;
  }
}
`;
  const routes = `import { Router } from "express";
import { seed } from "../data/seed.mjs";
import { readOrSeed } from "../config/db.mjs";

export const api = Router();

for (const [key, value] of Object.entries(seed)) {
  if (!Array.isArray(value)) continue;
  api.get("/" + key, async (_req, res) => {
    res.json(await readOrSeed(key, value));
  });
}
`;
  const seedFile = `export const seed = ${JSON.stringify(seed, null, 2)};
`;
  return [
    { path: "server/package.json", language: "json", content: JSON.stringify(pkg, null, 2) + "\n" },
    { path: "server/index.mjs", language: "javascript", content: index },
    { path: "server/src/app.mjs", language: "javascript", content: app },
    { path: "server/src/routes/api.mjs", language: "javascript", content: routes },
    { path: "server/src/data/seed.mjs", language: "javascript", content: seedFile },
    { path: "server/src/config/db.mjs", language: "javascript", content: db },
  ];
}

function readme(project: { brand: string; blueprint: WebsiteBlueprintId; routes: string[] }): string {
  return `# ${project.brand}

Full-stack ${project.blueprint} site generated in the Web Development assistant.

## Preview

\`client/\` is vanilla HTML, CSS, and JavaScript. The page draws its sample data immediately, then replaces it when \`/api\` responds.

## API

\`\`\`bash
cd server
npm install
npm start
\`\`\`

The server serves \`client/\` and these routes:

${project.routes.map((route) => `- \`${route}\``).join("\n")}

MongoDB is optional. Without \`MONGODB_URI\`, every route returns the seed in \`server/src/data/seed.mjs\`. With a URI, empty collections still fall back to that seed.
`;
}

function collectionRoutes(seed: Seed): string[] {
  const routes = ["/api/health"];
  for (const [key, value] of Object.entries(seed)) {
    if (Array.isArray(value)) routes.push(`/api/${key}`);
  }
  return routes;
}

export function generateWebsite(brief: WebsiteBrief): WebsiteProject {
  const blueprint = brief.blueprint;
  const catalog = brief.catalog ?? (blueprint === "store" ? "products" : undefined);
  const resolvedBrand = brief.brand?.trim()
    ? brief.brand.trim()
    : catalog === "coffee"
      ? "Harbor Coffee"
      : catalog === "supper"
        ? "Harbor Supper"
        : blueprint === "store"
          ? "Harbor Goods"
          : blueprint === "landing"
            ? "Northstar"
            : blueprint === "portfolio"
              ? "Avery Cole"
              : blueprint === "blog"
                ? "Field Notes"
                : "Pulse";
  const seed = buildSeed({ blueprint, brand: resolvedBrand, catalog });
  const routes = collectionRoutes(seed);
  const palette = PALETTES[blueprint];
  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: page(resolvedBrand, blueprint, seed.tagline, seed) },
    { path: "client/styles.css", language: "css", content: stylesheet(palette) },
    { path: "client/site.js", language: "javascript", content: clientScript(blueprint, seed) },
    ...serverFiles(seed, resolvedBrand),
    {
      path: "README.md",
      language: "markdown",
      content: readme({ brand: resolvedBrand, blueprint, routes }),
    },
  ];
  const summary = catalog === "coffee"
    ? `${resolvedBrand} uses the shop blueprint and a coffee menu.`
    : catalog === "supper"
      ? `${resolvedBrand} uses the shop blueprint and a supper menu.`
      : `${resolvedBrand} is a ${blueprint} site with a browser client and an Express API.`;
  return {
    blueprint,
    brand: resolvedBrand,
    title: resolvedBrand,
    summary,
    routes,
    files,
  };
}

export function describeWebsite(project: WebsiteProject): string {
  return [
    `Built **${project.brand}** as a full-stack ${project.blueprint} site.`,
    "",
    project.summary,
    "",
    "Wrote `client/index.html`, `client/styles.css`, and `client/site.js`. The preview shows the sample data immediately.",
    "Wrote an Express API under `server/`. From that folder run `npm install` and `npm start`.",
    "",
    `Routes: ${project.routes.map((route) => `\`${route}\``).join(", ")}.`,
    "MongoDB is optional via `MONGODB_URI`. Without it, the API serves the seed data.",
  ].join("\n");
}

export function clientPreviewMap(files: GeneratedFile[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const file of files) {
    if (file.path.startsWith("server/")) continue;
    map[file.path] = file.content;
    const base = file.path.split("/").pop() || file.path;
    if (!map[base]) map[base] = file.content;
  }
  return map;
}

export function toFileTree(files: GeneratedFile[]): ProjectNode[] {
  const root: ProjectNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/");
    let level = root;
    let acc = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      acc = acc ? `${acc}/${part}` : part;
      const isFile = i === parts.length - 1;
      if (isFile) {
        level.push({
          id: file.path,
          name: part,
          type: "file",
          language: file.language,
          content: file.content,
        });
      } else {
        let folder = level.find((node) => node.type === "folder" && node.name === part);
        if (!folder) {
          folder = { id: acc, name: part, type: "folder", isOpen: true, children: [] };
          level.push(folder);
        }
        level = folder.children || [];
      }
    }
  }
  return root;
}

export const WEBSITE_FILE_PATHS = [
  "README.md",
  "client/index.html",
  "client/styles.css",
  "client/site.js",
  "server/index.mjs",
  "server/package.json",
  "server/src/app.mjs",
  "server/src/routes/api.mjs",
  "server/src/data/seed.mjs",
  "server/src/config/db.mjs",
];
