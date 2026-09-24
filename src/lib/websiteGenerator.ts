/**
 * Full-stack website generator for the Web Development assistant.
 * Produces a static client, an Express API, and seed data that stay in sync.
 * The client calls the API and falls back to the embedded seed when the server is offline,
 * so the in-editor preview still runs.
 */

export const WEBSITE_KINDS = [
  { id: "landing", label: "Landing", description: "Hero, features, pricing, and a lead form" },
  { id: "portfolio", label: "Portfolio", description: "Projects, filters, and a contact form" },
  { id: "blog", label: "Blog", description: "Post list plus a reader backed by the API" },
  { id: "shop", label: "Shop", description: "Product grid, cart, and checkout orders" },
  { id: "dashboard", label: "Dashboard", description: "Metrics and an activity feed" },
] as const;

export type WebsiteKind = (typeof WEBSITE_KINDS)[number]["id"];

export interface WebsiteRequest {
  brief: string;
  kind?: WebsiteKind;
  title?: string;
}

export interface GeneratedFile {
  path: string;
  name: string;
  language: string;
  folder: "client" | "server" | "data" | "root";
  content: string;
}

export interface GeneratedWebsite {
  title: string;
  slug: string;
  kind: WebsiteKind;
  brief: string;
  tagline: string;
  files: GeneratedFile[];
  summary: string;
}

interface Feature {
  title: string;
  body: string;
}

interface PriceTier {
  name: string;
  price: string;
  points: string[];
}

interface ProjectItem {
  title: string;
  tag: string;
  summary: string;
  image: string;
}

interface PostItem {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  blurb: string;
}

interface MetricItem {
  label: string;
  value: string;
  delta: string;
}

interface ActivityItem {
  time: string;
  text: string;
}

interface SiteSeed {
  kind: WebsiteKind;
  title: string;
  tagline: string;
  heroImage: string;
  features: Feature[];
  pricing: PriceTier[];
  faqs: { q: string; a: string }[];
  projects: ProjectItem[];
  posts: PostItem[];
  products: ProductItem[];
  metrics: MetricItem[];
  activity: ActivityItem[];
}

const DEFAULT_TITLES: Record<WebsiteKind, string> = {
  landing: "Northstar Studio",
  portfolio: "Ada Okonkwo",
  blog: "Field Notes",
  shop: "Harbor Goods",
  dashboard: "Atlas Ops",
};

const DEFAULT_TAGLINES: Record<WebsiteKind, string> = {
  landing: "A clear product story, with a form that saves leads to the API.",
  portfolio: "Selected work, filterable by discipline, with a working contact form.",
  blog: "Essays loaded from the posts API, readable without leaving the page.",
  shop: "A small catalog with a cart that checks out through the orders API.",
  dashboard: "Live-looking metrics and activity, refreshed from the API.",
};

const ACCENTS: Record<WebsiteKind, string> = {
  landing: "#2dd4bf",
  portfolio: "#818cf8",
  blog: "#fb923c",
  shop: "#f472b6",
  dashboard: "#38bdf8",
};

const HEROES: Record<WebsiteKind, string> = {
  landing: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
  portfolio: "https://images.unsplash.com/photo-1558618666-fcd25c85f1d7?auto=format&fit=crop&w=1600&q=80",
  blog: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80",
  shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
  dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
};

const KIND_ROUTES: Record<WebsiteKind, { list: string; create: string | null }> = {
  landing: { list: "/api/content", create: "/api/leads" },
  portfolio: { list: "/api/projects", create: "/api/messages" },
  blog: { list: "/api/posts", create: null },
  shop: { list: "/api/products", create: "/api/orders" },
  dashboard: { list: "/api/metrics", create: null },
};

export function isWebsiteKind(value: string): value is WebsiteKind {
  return WEBSITE_KINDS.some((kind) => kind.id === value);
}

export function matchWebsiteRequest(text: string): WebsiteRequest | null {
  const brief = text.trim();
  if (brief.length < 8 || brief.length > 500) return null;
  const lower = brief.toLowerCase();
  const verb = /\b(build|create|make|generate|design|scaffold)\b/.test(lower);
  const noun = /\b(website|web site|landing page|portfolio|blog|shop|store|dashboard|full[- ]?stack)\b/.test(lower);
  if (!verb || !noun) return null;

  let kind: WebsiteKind = "landing";
  if (/\bportfolio\b/.test(lower)) kind = "portfolio";
  else if (/\bblog\b/.test(lower)) kind = "blog";
  else if (/\b(shop|store|e-?commerce)\b/.test(lower)) kind = "shop";
  else if (/\bdashboard\b/.test(lower)) kind = "dashboard";
  else if (/\blanding\b/.test(lower)) kind = "landing";

  return { brief, kind };
}

export function generateWebsite(request: WebsiteRequest): GeneratedWebsite {
  const kind = request.kind && isWebsiteKind(request.kind) ? request.kind : "landing";
  const brief = (request.brief || "").trim();
  const title = deriveTitle(brief, request.title, kind);
  const tagline = deriveTagline(brief, kind);
  const seed = buildSeed(kind, title, tagline);
  const accent = ACCENTS[kind];

  const files: GeneratedFile[] = [
    file("client", "index.html", "html", renderHtml(seed, accent)),
    file("client", "styles.css", "css", renderCss(accent)),
    file("client", "app.js", "javascript", renderClient(seed)),
    file("server", "server.js", "javascript", renderServer(seed)),
    file("data", "seed.json", "json", JSON.stringify(seed, null, 2) + "\n"),
    file("root", "package.json", "json", renderPackage(title, seed.kind)),
    file("root", "README.md", "markdown", renderReadme(seed)),
    file("root", ".gitignore", "plaintext", "node_modules/\n.env\n.DS_Store\n"),
  ];

  return {
    title,
    slug: slugify(title),
    kind,
    brief,
    tagline,
    files,
    summary: `${title} is a ${kind} site with a vanilla client, an Express API, and seed data in data/seed.json. The preview uses the client and falls back to that seed when the API is offline.`,
  };
}

function file(folder: GeneratedFile["folder"], name: string, language: string, content: string): GeneratedFile {
  const path = folder === "root" ? name : `${folder}/${name}`;
  return { path, name, language, folder, content };
}

function deriveTitle(brief: string, explicit: string | undefined, kind: WebsiteKind): string {
  const given = (explicit || "").trim();
  if (given) return given.slice(0, 60);
  const stripped = brief
    .replace(/^(please\s+)?(build|create|make|generate|design|scaffold)\s+(me\s+)?(a|an|the)?\s*/i, "")
    .replace(/\b(full[- ]?stack)\b/gi, "")
    .replace(/\b(website|web site|landing page|landing|portfolio site|portfolio|blog|shop|store|dashboard)\b/gi, "")
    .replace(/\b(for|about|called|named)\b/gi, "")
    .replace(/[^a-z0-9\s'-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length < 2) return DEFAULT_TITLES[kind];
  return stripped
    .split(" ")
    .slice(0, 6)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function deriveTagline(brief: string, kind: WebsiteKind): string {
  const cleaned = brief
    .replace(/^(please\s+)?(build|create|make|generate|design|scaffold)\s+(me\s+)?(a|an|the)?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 8) return DEFAULT_TAGLINES[kind];
  return cleaned.slice(0, 160);
}

function slugify(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSeed(kind: WebsiteKind, title: string, tagline: string): SiteSeed {
  return {
    kind,
    title,
    tagline,
    heroImage: HEROES[kind],
    features: [
      { title: "Client", body: "Semantic HTML, responsive CSS, and vanilla JavaScript with no build step." },
      { title: "API", body: "Express routes for reads and writes, with JSON validation on every POST." },
      { title: "Data", body: "data/seed.json is the starter database. The server loads it on boot." },
    ],
    pricing: [
      { name: "Starter", price: "$0", points: ["One page", "Preview in the editor", "Seed data included"] },
      { name: "Studio", price: "$29", points: ["Custom sections", "Lead capture API", "README run steps"] },
      { name: "Ship", price: "$79", points: ["Express server", "Static hosting path", "Order or message routes"] },
    ],
    faqs: [
      { q: "Does the preview need the server?", a: "No. The client falls back to the embedded seed when fetch fails." },
      { q: "How do I run the API?", a: "From the project root, run npm install and then npm start." },
      { q: "Where is the data?", a: "data/seed.json. The server reads it and the client keeps a copy for offline preview." },
    ],
    projects: [
      { title: "Harbor Atlas", tag: "Product", summary: "A mapping tool for small shipping teams.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" },
      { title: "Lumen Notes", tag: "Brand", summary: "Identity and site for an independent journal.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80" },
      { title: "Kiln", tag: "Web", summary: "Checkout flow for a ceramics studio.", image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=800&q=80" },
    ],
    posts: [
      { id: "shipping-pages", title: "Ship the page before the platform", excerpt: "A working page teaches more than a perfect stack diagram.", body: "Start with one HTML document that states the offer, then add a route that stores a single record. The rest of the stack is easier to judge once that loop exists.", date: "2026-03-12" },
      { id: "seed-data", title: "Seed data is a design tool", excerpt: "Realistic records expose empty states you would otherwise miss.", body: "Write three honest records before you write the schema essay. Names, prices, and dates force the layout to wrap, truncate, and align.", date: "2026-04-02" },
      { id: "offline-preview", title: "Preview without a running API", excerpt: "Fallbacks keep the interface honest while the server is still on your laptop.", body: "Catch failed fetches and render the same JSON the server would have returned. When the API comes online, the page does not need a second design.", date: "2026-05-18" },
    ],
    products: [
      { id: "mug", name: "Stoneware mug", price: 28, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80", blurb: "Speckled glaze, 12oz, made in small batches." },
      { id: "bowl", name: "Serving bowl", price: 46, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80", blurb: "Wide rim for salads and weekday noodles." },
      { id: "vase", name: "Bud vase", price: 34, image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=80", blurb: "Short neck, matte white, one stem is enough." },
    ],
    metrics: [
      { label: "Visitors", value: "12,480", delta: "+8.2%" },
      { label: "Signups", value: "326", delta: "+3.1%" },
      { label: "Orders", value: "91", delta: "+12%" },
      { label: "Uptime", value: "99.9%", delta: "30 days" },
    ],
    activity: [
      { time: "09:14", text: "New lead saved from the landing form." },
      { time: "10:02", text: "Order #1042 checked out from the shop." },
      { time: "11:40", text: "Seed data reloaded on server start." },
      { time: "13:05", text: "Dashboard refresh returned four metrics." },
    ],
  };
}

function renderHtml(seed: SiteSeed, accent: string): string {
  const title = escapeHtml(seed.title);
  const tagline = escapeHtml(seed.tagline);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${tagline}">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed data-kind="${seed.kind}" style="--accent: ${accent}">
  <header class="nav">
    <a class="brand" href="#top">${title}</a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open menu">Menu</button>
    <nav class="nav-links" data-nav>
      ${navLinks(seed.kind)}
    </nav>
  </header>
  <main id="top">
    ${renderMain(seed)}
  </main>
  <footer class="footer">
    <p>${title}</p>
    <p>Client + Express API + data/seed.json</p>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function navLinks(kind: WebsiteKind): string {
  const links: Record<WebsiteKind, [string, string][]> = {
    landing: [["#features", "Features"], ["#pricing", "Pricing"], ["#faq", "FAQ"], ["#contact", "Contact"]],
    portfolio: [["#work", "Work"], ["#about", "About"], ["#contact", "Contact"]],
    blog: [["#posts", "Posts"], ["#about", "About"]],
    shop: [["#catalog", "Catalog"], ["#cart", "Cart"]],
    dashboard: [["#metrics", "Metrics"], ["#activity", "Activity"]],
  };
  return links[kind].map(([href, label]) => `<a href="${href}">${label}</a>`).join("\n      ");
}

function renderMain(seed: SiteSeed): string {
  const title = escapeHtml(seed.title);
  const tagline = escapeHtml(seed.tagline);
  const hero = `<section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(seed.kind)}</p>
        <h1>${title}</h1>
        <p class="lede">${tagline}</p>
        <a class="button" href="${seed.kind === "shop" ? "#catalog" : seed.kind === "dashboard" ? "#metrics" : "#contact"}">Open the ${seed.kind === "dashboard" ? "board" : "page"}</a>
      </div>
      <img src="${seed.heroImage}" alt="" width="960" height="640">
    </section>`;

  if (seed.kind === "landing") {
    return `${hero}
    <section id="features" class="section">
      <h2>What this build includes</h2>
      <div class="grid">
        ${seed.features.map((item) => `<article class="card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join("\n        ")}
      </div>
    </section>
    <section id="pricing" class="section">
      <h2>Pricing</h2>
      <div class="grid">
        ${seed.pricing.map((tier) => `<article class="card"><h3>${escapeHtml(tier.name)}</h3><p class="price">${escapeHtml(tier.price)}</p><ul>${tier.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul></article>`).join("\n        ")}
      </div>
    </section>
    <section id="faq" class="section">
      <h2>Questions</h2>
      ${seed.faqs.map((item) => `<details class="card"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join("\n      ")}
    </section>
    <section id="contact" class="section">
      <h2>Request a walkthrough</h2>
      <form class="stack" data-lead-form>
        <label>Name<input name="name" required maxlength="80"></label>
        <label>Email<input name="email" type="email" required maxlength="120"></label>
        <label>Note<textarea name="note" rows="4" maxlength="400"></textarea></label>
        <button class="button" type="submit">Save lead</button>
        <p data-status role="status"></p>
      </form>
    </section>`;
  }

  if (seed.kind === "portfolio") {
    const tags = ["all", ...new Set(seed.projects.map((project) => project.tag))];
    return `${hero}
    <section id="work" class="section">
      <h2>Selected work</h2>
      <div class="filters">
        ${tags.map((tag) => `<button type="button" data-filter="${escapeHtml(tag.toLowerCase())}">${escapeHtml(tag)}</button>`).join("\n        ")}
      </div>
      <div class="grid">
        ${seed.projects.map((project) => `<article class="card" data-project="${escapeHtml(project.tag.toLowerCase())}"><img src="${project.image}" alt=""><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p></article>`).join("\n        ")}
      </div>
    </section>
    <section id="about" class="section">
      <h2>About</h2>
      <p class="lede">${tagline}</p>
    </section>
    <section id="contact" class="section">
      <h2>Start a project</h2>
      <form class="stack" data-message-form>
        <label>Name<input name="name" required maxlength="80"></label>
        <label>Email<input name="email" type="email" required maxlength="120"></label>
        <label>Project<textarea name="message" required rows="4" maxlength="400"></textarea></label>
        <button class="button" type="submit">Send message</button>
        <p data-status role="status"></p>
      </form>
    </section>`;
  }

  if (seed.kind === "blog") {
    return `${hero}
    <section id="posts" class="section">
      <h2>Posts</h2>
      <div class="grid">
        ${seed.posts.map((post) => `<article class="card"><p class="eyebrow">${escapeHtml(post.date)}</p><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p><button type="button" data-open-post="${escapeHtml(post.id)}">Read</button></article>`).join("\n        ")}
      </div>
      <article class="card reader" data-reader hidden>
        <p class="eyebrow" data-reader-date></p>
        <h2 data-reader-title></h2>
        <p data-reader-body></p>
      </article>
    </section>
    <section id="about" class="section">
      <h2>About ${title}</h2>
      <p class="lede">${tagline}</p>
    </section>`;
  }

  if (seed.kind === "shop") {
    return `${hero}
    <section id="catalog" class="section">
      <h2>Catalog</h2>
      <div class="grid">
        ${seed.products.map((product) => `<article class="card"><img src="${product.image}" alt=""><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.blurb)}</p><p class="price">$${product.price.toFixed(2)}</p><button type="button" data-add="${escapeHtml(product.id)}">Add to cart</button></article>`).join("\n        ")}
      </div>
    </section>
    <section id="cart" class="section">
      <h2>Cart <span data-cart-count>0</span></h2>
      <ul data-cart-lines></ul>
      <form class="stack" data-order-form>
        <label>Name<input name="name" required maxlength="80"></label>
        <label>Email<input name="email" type="email" required maxlength="120"></label>
        <button class="button" type="submit">Place order</button>
        <p data-status role="status"></p>
      </form>
    </section>`;
  }

  return `${hero}
    <section id="metrics" class="section">
      <div class="section-head">
        <h2>Metrics</h2>
        <button type="button" data-refresh>Refresh</button>
      </div>
      <div class="grid">
        ${seed.metrics.map((metric) => `<article class="card" data-metric="${escapeHtml(metric.label)}"><p class="eyebrow">${escapeHtml(metric.label)}</p><p class="price" data-value>${escapeHtml(metric.value)}</p><p data-delta>${escapeHtml(metric.delta)}</p></article>`).join("\n        ")}
      </div>
    </section>
    <section id="activity" class="section">
      <h2>Activity</h2>
      <ul data-activity>
        ${seed.activity.map((item) => `<li><strong>${escapeHtml(item.time)}</strong> ${escapeHtml(item.text)}</li>`).join("\n        ")}
      </ul>
    </section>`;
}

function renderCss(accent: string): string {
  return `:root { color-scheme: dark; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Segoe UI", sans-serif;
  background: #0b1020;
  color: #e8eefc;
  line-height: 1.5;
}
img { max-width: 100%; height: auto; display: block; border-radius: 12px; object-fit: cover; }
a { color: inherit; }
.nav, .footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 16px 7vw;
}
.nav { position: sticky; top: 0; background: rgba(11, 16, 32, 0.92); backdrop-filter: blur(8px); z-index: 2; }
.brand { font-weight: 700; text-decoration: none; }
.nav-links { display: flex; gap: 16px; }
.nav-links a { text-decoration: none; color: #93a0bd; }
.nav-toggle { display: none; background: transparent; color: inherit; border: 1px solid #24304d; border-radius: 8px; padding: 8px 12px; }
.hero, .section { padding: 48px 7vw; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 32px; align-items: center; }
.eyebrow { letter-spacing: 0.08em; text-transform: uppercase; color: ${accent}; font-size: 12px; }
h1 { font-size: clamp(2.2rem, 4vw, 4rem); line-height: 1.05; margin: 8px 0; }
h2 { margin-top: 0; }
.lede { color: #93a0bd; font-size: 1.05rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.card, .stack, .reader {
  background: #12182b;
  border: 1px solid #24304d;
  border-radius: 16px;
  padding: 16px;
}
.price { font-size: 1.6rem; margin: 8px 0; }
.button, button, .filters button {
  background: ${accent};
  color: #08111a;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}
.button { display: inline-block; text-decoration: none; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.stack { display: grid; gap: 12px; max-width: 520px; }
label { display: grid; gap: 6px; font-size: 0.9rem; }
input, textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #24304d;
  background: #0b1020;
  color: inherit;
  padding: 10px 12px;
}
.section-head, .footer { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.footer { color: #93a0bd; border-top: 1px solid #24304d; }
[hidden] { display: none !important; }
@media (max-width: 800px) {
  .hero { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-block; }
  .nav-links { display: none; }
  .nav-links.open { display: flex; flex-direction: column; position: absolute; top: 64px; left: 7vw; right: 7vw; background: #12182b; padding: 12px; border-radius: 12px; }
}
`;
}

function renderClient(seed: SiteSeed): string {
  const routes = KIND_ROUTES[seed.kind];
  return [
    "(() => {",
    "  const seed = " + JSON.stringify(seed) + ";",
    "  const routes = " + JSON.stringify(routes) + ";",
    "",
    "  async function api(path, options) {",
    "    try {",
    "      const response = await fetch(path, {",
    "        headers: { 'Content-Type': 'application/json' },",
    "        ...options,",
    "      });",
    "      if (!response.ok) throw new Error('HTTP ' + response.status);",
    "      return await response.json();",
    "    } catch (error) {",
    "      console.warn('API offline, using seed data', error);",
    "      return localApi(path, options || {});",
    "    }",
    "  }",
    "",
    "  function readBody(options) {",
    "    if (!options.body) return {};",
    "    try { return JSON.parse(options.body); } catch (error) { return {}; }",
    "  }",
    "",
    "  function localApi(path, options) {",
    "    const method = (options.method || 'GET').toUpperCase();",
    "    const body = readBody(options);",
    "    if (path === '/api/health') return { ok: true, title: seed.title };",
    "    if (method === 'GET' && path === routes.list) {",
    "      if (seed.kind === 'landing') return seed;",
    "      if (seed.kind === 'portfolio') return { projects: seed.projects };",
    "      if (seed.kind === 'blog') return { posts: seed.posts };",
    "      if (seed.kind === 'shop') return { products: seed.products };",
    "      return { metrics: seed.metrics, activity: seed.activity };",
    "    }",
    "    if (seed.kind === 'blog' && method === 'GET' && path.indexOf('/api/posts/') === 0) {",
    "      const id = decodeURIComponent(path.slice('/api/posts/'.length));",
    "      const post = seed.posts.find((item) => item.id === id);",
    "      return post || { error: 'Post not found' };",
    "    }",
    "    if (method === 'POST' && path === routes.create) {",
    "      if (path === '/api/leads' || path === '/api/messages') {",
    "        if (!body.email) return { error: 'Email is required' };",
    "        return { ok: true, record: Object.assign({ id: 'local-' + Date.now() }, body) };",
    "      }",
    "      if (path === '/api/orders') {",
    "        if (!body.email || !Array.isArray(body.items) || body.items.length === 0) {",
    "          return { error: 'Add at least one item and an email' };",
    "        }",
    "        return { ok: true, order: { id: 'local-' + Date.now(), items: body.items, total: body.total } };",
    "      }",
    "    }",
    "    return { error: 'Not found' };",
    "  }",
    "",
    "  const navToggle = document.querySelector('[data-nav-toggle]');",
    "  const nav = document.querySelector('[data-nav]');",
    "  if (navToggle && nav) {",
    "    navToggle.addEventListener('click', () => nav.classList.toggle('open'));",
    "  }",
    "",
    "  function bindForm(selector, path, onSuccess) {",
    "    const form = document.querySelector(selector);",
    "    if (!form) return;",
    "    form.addEventListener('submit', async (event) => {",
    "      event.preventDefault();",
    "      const status = form.querySelector('[data-status]');",
    "      const payload = Object.fromEntries(new FormData(form).entries());",
    "      if (onSuccess) Object.assign(payload, onSuccess());",
    "      const result = await api(path, { method: 'POST', body: JSON.stringify(payload) });",
    "      if (result.error) status.textContent = result.error;",
    "      else {",
    "        status.textContent = 'Saved.';",
    "        form.reset();",
    "      }",
    "    });",
    "  }",
    "",
    "  bindForm('[data-lead-form]', '/api/leads');",
    "  bindForm('[data-message-form]', '/api/messages');",
    "",
    "  document.querySelectorAll('[data-filter]').forEach((button) => {",
    "    button.addEventListener('click', () => {",
    "      const tag = button.getAttribute('data-filter');",
    "      document.querySelectorAll('[data-project]').forEach((card) => {",
    "        card.hidden = tag !== 'all' && card.getAttribute('data-project') !== tag;",
    "      });",
    "    });",
    "  });",
    "",
    "  document.querySelectorAll('[data-open-post]').forEach((button) => {",
    "    button.addEventListener('click', async () => {",
    "      const id = button.getAttribute('data-open-post');",
    "      const post = await api('/api/posts/' + encodeURIComponent(id));",
    "      const reader = document.querySelector('[data-reader]');",
    "      if (!reader || post.error) return;",
    "      reader.hidden = false;",
    "      reader.querySelector('[data-reader-title]').textContent = post.title;",
    "      reader.querySelector('[data-reader-body]').textContent = post.body;",
    "      reader.querySelector('[data-reader-date]').textContent = post.date;",
    "    });",
    "  });",
    "",
    "  const cart = [];",
    "  const count = document.querySelector('[data-cart-count]');",
    "  const lines = document.querySelector('[data-cart-lines]');",
    "  function paintCart() {",
    "    if (!count || !lines) return;",
    "    count.textContent = String(cart.reduce((sum, item) => sum + item.qty, 0));",
    "    lines.innerHTML = cart.map((item) => '<li>' + item.qty + ' × ' + item.name + '</li>').join('') || '<li>Your cart is empty.</li>';",
    "  }",
    "  document.querySelectorAll('[data-add]').forEach((button) => {",
    "    button.addEventListener('click', () => {",
    "      const id = button.getAttribute('data-add');",
    "      const product = seed.products.find((item) => item.id === id);",
    "      if (!product) return;",
    "      const existing = cart.find((item) => item.id === id);",
    "      if (existing) existing.qty += 1;",
    "      else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });",
    "      paintCart();",
    "    });",
    "  });",
    "  paintCart();",
    "  bindForm('[data-order-form]', '/api/orders', () => ({",
    "    items: cart.map((item) => ({ id: item.id, qty: item.qty }) ),",
    "    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),",
    "  }));",
    "",
    "  async function refreshBoard() {",
    "    const data = await api('/api/metrics');",
    "    if (!data.metrics) return;",
    "    data.metrics.forEach((metric) => {",
    "      const card = document.querySelector('[data-metric=\"' + metric.label + '\"]');",
    "      if (!card) return;",
    "      card.querySelector('[data-value]').textContent = metric.value;",
    "      card.querySelector('[data-delta]').textContent = metric.delta;",
    "    });",
    "    const list = document.querySelector('[data-activity]');",
    "    if (list && data.activity) {",
    "      list.innerHTML = data.activity.map((item) => '<li><strong>' + item.time + '</strong> ' + item.text + '</li>').join('');",
    "    }",
    "  }",
    "  const refresh = document.querySelector('[data-refresh]');",
    "  if (refresh) refresh.addEventListener('click', refreshBoard);",
    "})();",
    "",
  ].join("\n");
}

function renderServer(seed: SiteSeed): string {
  const routes = KIND_ROUTES[seed.kind];
  return [
    "import express from 'express';",
    "import cors from 'cors';",
    "import { readFileSync } from 'node:fs';",
    "import { dirname, join } from 'node:path';",
    "import { fileURLToPath } from 'node:url';",
    "",
    "const __dirname = dirname(fileURLToPath(import.meta.url));",
    "const seed = JSON.parse(readFileSync(join(__dirname, '../data/seed.json'), 'utf8'));",
    "const leads = [];",
    "const messages = [];",
    "const orders = [];",
    "",
    "const app = express();",
    "app.use(cors());",
    "app.use(express.json());",
    "",
    "app.get('/api/health', (_req, res) => {",
    "  res.json({ ok: true, title: seed.title, kind: seed.kind });",
    "});",
    "",
    routes.list === "/api/content"
      ? "app.get('/api/content', (_req, res) => res.json(seed));"
      : "",
    routes.list === "/api/projects"
      ? "app.get('/api/projects', (_req, res) => res.json({ projects: seed.projects }));"
      : "",
    routes.list === "/api/posts"
      ? [
          "app.get('/api/posts', (_req, res) => res.json({ posts: seed.posts }));",
          "app.get('/api/posts/:id', (req, res) => {",
          "  const post = seed.posts.find((item) => item.id === req.params.id);",
          "  if (!post) return res.status(404).json({ error: 'Post not found' });",
          "  res.json(post);",
          "});",
        ].join("\n")
      : "",
    routes.list === "/api/products"
      ? "app.get('/api/products', (_req, res) => res.json({ products: seed.products }));"
      : "",
    routes.list === "/api/metrics"
      ? "app.get('/api/metrics', (_req, res) => res.json({ metrics: seed.metrics, activity: seed.activity }));"
      : "",
    routes.create === "/api/leads"
      ? [
          "app.post('/api/leads', (req, res) => {",
          "  const name = String(req.body?.name || '').trim();",
          "  const email = String(req.body?.email || '').trim();",
          "  const note = String(req.body?.note || '').trim();",
          "  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email is required' });",
          "  const lead = { id: String(leads.length + 1), name, email, note };",
          "  leads.push(lead);",
          "  res.status(201).json({ ok: true, record: lead });",
          "});",
        ].join("\n")
      : "",
    routes.create === "/api/messages"
      ? [
          "app.post('/api/messages', (req, res) => {",
          "  const name = String(req.body?.name || '').trim();",
          "  const email = String(req.body?.email || '').trim();",
          "  const message = String(req.body?.message || '').trim();",
          "  if (!email || !message) return res.status(400).json({ error: 'Email and message are required' });",
          "  const record = { id: String(messages.length + 1), name, email, message };",
          "  messages.push(record);",
          "  res.status(201).json({ ok: true, record });",
          "});",
        ].join("\n")
      : "",
    routes.create === "/api/orders"
      ? [
          "app.post('/api/orders', (req, res) => {",
          "  const name = String(req.body?.name || '').trim();",
          "  const email = String(req.body?.email || '').trim();",
          "  const items = Array.isArray(req.body?.items) ? req.body.items : [];",
          "  if (!email || items.length === 0) return res.status(400).json({ error: 'Add at least one item and an email' });",
          "  const order = { id: String(orders.length + 1), name, email, items, total: Number(req.body?.total) || 0 };",
          "  orders.push(order);",
          "  res.status(201).json({ ok: true, order });",
          "});",
        ].join("\n")
      : "",
    "",
    "const clientDir = join(__dirname, '../client');",
    "app.use(express.static(clientDir));",
    "app.get('*', (_req, res) => res.sendFile(join(clientDir, 'index.html')));",
    "",
    "const port = Number(process.env.PORT) || 3000;",
    "app.listen(port, () => {",
    "  console.log(seed.title + ' listening on http://localhost:' + port);",
    "});",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function renderPackage(title: string, kind: WebsiteKind): string {
  return JSON.stringify(
    {
      name: slugify(title),
      version: "1.0.0",
      private: true,
      description: `${title} — generated ${kind} website`,
      type: "module",
      scripts: {
        start: "node server/server.js",
        dev: "node --watch server/server.js",
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

function renderReadme(seed: SiteSeed): string {
  const routes = KIND_ROUTES[seed.kind];
  const writes = routes.create ? `\n- \`POST ${routes.create}\`` : "";
  return `# ${seed.title}

${seed.tagline}

Generated full-stack website (${seed.kind}).

## Layout

- \`client/\` — HTML, CSS, and vanilla JavaScript. This is what the editor preview runs.
- \`server/server.js\` — Express API and static file host.
- \`data/seed.json\` — starter records loaded by the server.

## Run locally

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## API

- \`GET /api/health\`
- \`GET ${routes.list}\`${writes}

The client uses these routes. If the server is not running, \`client/app.js\` answers from the embedded copy of the seed so the preview still works.
`;
}
