/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a previewable vanilla client plus an Express API (ESM) the student can run locally.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "store" | "dashboard";

export interface WebsiteBlueprint {
  id: WebsiteKind;
  label: string;
  description: string;
  icon: string;
}

export interface ProjectFile {
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

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "landing",
    label: "SaaS landing",
    description: "Hero, features, pricing, and a lead form saved by POST /api/leads",
    icon: "🚀",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Project gallery and a contact form saved by POST /api/messages",
    icon: "🎨",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Post list with a reader, loaded from GET /api/posts",
    icon: "✍️",
  },
  {
    id: "store",
    label: "Store",
    description: "Product grid, cart, and checkout sent to POST /api/orders",
    icon: "🛍️",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Stats, activity, and tasks backed by GET /api/stats",
    icon: "📊",
  },
];

const ACCENTS: Record<WebsiteKind, string> = {
  landing: "#5b8cff",
  portfolio: "#2dd4bf",
  blog: "#f4a261",
  store: "#fb7185",
  dashboard: "#a78bfa",
};

export function normalizeSiteName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  return (trimmed || "My Website").slice(0, 48);
}

export function slugifySiteName(name: string): string {
  const slug = normalizeSiteName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "website";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateWebsiteProject(kind: WebsiteKind, rawName: string): ProjectFile[] {
  const siteName = normalizeSiteName(rawName);
  const slug = slugifySiteName(siteName);
  const safe = escapeHtml(siteName);
  const accent = ACCENTS[kind];

  return [
    { path: "client/index.html", language: "html", content: clientHtml(kind, safe) },
    { path: "client/styles.css", language: "css", content: clientCss(accent) },
    { path: "client/site.js", language: "javascript", content: clientJs(kind, siteName) },
    { path: "server/package.json", language: "json", content: serverPackage(slug) },
    { path: "server/index.mjs", language: "javascript", content: serverIndex() },
    { path: "server/src/app.mjs", language: "javascript", content: serverApp() },
    { path: "server/src/config/db.mjs", language: "javascript", content: serverDb() },
    { path: "server/src/data/seed.mjs", language: "javascript", content: serverSeed(kind, siteName) },
    { path: "server/src/routes/api.mjs", language: "javascript", content: serverRoutes(kind) },
    { path: "server/.env.example", language: "plaintext", content: "PORT=5000\nMONGODB_URI=\n" },
    { path: "package.json", language: "json", content: rootPackage(slug) },
    { path: "README.md", language: "markdown", content: readme(kind, siteName, slug) },
  ];
}

export function describeGeneratedWebsite(kind: WebsiteKind, rawName: string): string {
  const siteName = normalizeSiteName(rawName);
  const blueprint = WEBSITE_BLUEPRINTS.find((item) => item.id === kind);
  return [
    `Generated **${siteName}** — ${blueprint?.label ?? kind}.`,
    "",
    "The Web Development assistant wrote a full-stack starter into your project:",
    "- `client/index.html`, `client/styles.css`, `client/site.js` — live preview (sample data if the API is offline)",
    "- `server/index.mjs` — Express entry",
    "- `server/src/app.mjs` — CORS, JSON body, `/api` routes",
    "- `server/src/routes/api.mjs` — the website API",
    "- `server/src/data/seed.mjs` — in-memory records",
    "- `server/src/config/db.mjs` — optional MongoDB when `MONGODB_URI` is set",
    "- `README.md` — how to run it",
    "",
    "Run the API from the project root:",
    "```bash",
    "cd server && npm install && npm start",
    "```",
    "The preview already works without the server. Ask me to change copy, colors, or add another API route.",
  ].join("\n");
}

export function applyProjectFiles<T extends ProjectNode>(tree: T[], files: ProjectFile[]): T[] {
  let next = cloneTree(tree);
  for (const file of files) {
    const segments = file.path.split("/").filter(Boolean);
    if (segments.length === 0) continue;
    next = upsert(next, "", segments, file) as T[];
  }
  return next;
}

function cloneTree<T extends ProjectNode>(nodes: T[]): T[] {
  return nodes.map((node) => ({
    ...node,
    children: node.children ? cloneTree(node.children) : undefined,
  })) as T[];
}

function upsert(nodes: ProjectNode[], parentPath: string, segments: string[], file: ProjectFile): ProjectNode[] {
  const [head, ...rest] = segments;
  const id = parentPath ? `${parentPath}/${head}` : head;
  const index = nodes.findIndex((node) => node.id === id);
  if (rest.length === 0) {
    const fileNode: ProjectNode = {
      id,
      name: head,
      type: "file",
      language: file.language,
      content: file.content,
    };
    if (index === -1) return [...nodes, fileNode];
    const next = nodes.slice();
    next[index] = { ...fileNode };
    return next;
  }
  const existing = index === -1 ? undefined : nodes[index];
  const folder: ProjectNode = {
    id,
    name: head,
    type: "folder",
    isOpen: true,
    children: existing?.type === "folder" ? existing.children || [] : [],
  };
  const children = upsert(folder.children || [], id, rest, file);
  const updated = { ...folder, children };
  if (index === -1) return [...nodes, updated];
  const next = nodes.slice();
  next[index] = updated;
  return next;
}

function clientCss(accent: string): string {
  return `:root {
  --accent: ${accent};
  --bg: #0c1222;
  --card: #151c2e;
  --text: #eef2ff;
  --muted: #9aa6c2;
  --line: rgba(255, 255, 255, 0.08);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
.wrap { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0; gap: 16px;
}
.brand { font-weight: 700; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 16px; color: var(--muted); font-size: 14px; }
.btn, button, .add-to-cart {
  border: 0; border-radius: 999px; padding: 10px 16px;
  background: var(--accent); color: #08101f; font-weight: 700; cursor: pointer;
}
.btn.ghost, button.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center; padding: 28px 0 48px; }
.kicker { color: var(--accent); font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1 { font-size: clamp(36px, 5vw, 60px); line-height: 1.05; letter-spacing: -0.04em; margin: 8px 0; }
.lede { color: var(--muted); font-size: 18px; max-width: 46ch; }
.hero-visual, .card, .stat, .post, .product, form, .reader {
  background: var(--card); border: 1px solid var(--line); border-radius: 18px;
}
.hero-visual img, .product img, .post img { width: 100%; height: 220px; border-radius: 18px 18px 0 0; }
.hero-visual { overflow: hidden; }
.hero-visual figcaption, .card, .stat, .product, .post, form, .reader { padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-bottom: 48px; }
.grid.two { grid-template-columns: 1.2fr 0.8fr; }
.price { font-size: 28px; font-weight: 750; margin: 8px 0; }
.muted { color: var(--muted); }
label { display: block; font-size: 13px; margin-bottom: 12px; }
input, textarea {
  width: 100%; margin-top: 6px; padding: 10px 12px; border-radius: 10px;
  border: 1px solid var(--line); background: #0c1222; color: var(--text);
}
#form-status, #cart-bar, #api-status { min-height: 1.2em; }
#cart-bar {
  position: sticky; bottom: 12px; display: flex; justify-content: space-between; align-items: center;
  gap: 12px; padding: 12px 16px; border-radius: 16px; background: #10182b; border: 1px solid var(--line);
}
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); font-size: 14px; }
.stat strong { display: block; font-size: 28px; }
@media (max-width: 800px) {
  .hero, .grid, .grid.two { grid-template-columns: 1fr; }
  .nav-links { display: none; }
}
`;
}

function clientHtml(kind: WebsiteKind, siteName: string): string {
  const pages: Record<WebsiteKind, string> = {
    landing: landingHtml(siteName),
    portfolio: portfolioHtml(siteName),
    blog: blogHtml(siteName),
    store: storeHtml(siteName),
    dashboard: dashboardHtml(siteName),
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${siteName}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="1" data-site-kind="${kind}">
  ${pages[kind]}
  <script src="site.js"></script>
</body>
</html>
`;
}

function landingHtml(siteName: string): string {
  return `<header class="wrap nav">
    <div class="brand">${siteName}</div>
    <nav class="nav-links"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#lead">Start</a></nav>
    <a class="btn" href="#lead">Get started</a>
  </header>
  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">Full-stack starter</p>
        <h1>Ship ${siteName} with a real API behind the page.</h1>
        <p class="lede">Marketing site on the client. Express routes for leads, plans, and features. Preview works even before the server is running.</p>
      </div>
      <figure class="hero-visual">
        <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop&q=80" alt="Developers collaborating on a product" />
        <figcaption class="muted">Client preview talks to <code>/api/features</code>.</figcaption>
      </figure>
    </section>
    <section id="features" class="grid">
      <article class="card"><h2>Live preview</h2><p class="muted">HTML, CSS, and JS render in the editor with no build step.</p></article>
      <article class="card"><h2>Express API</h2><p class="muted">Leads post to <code>/api/leads</code> and stay in memory until you add MongoDB.</p></article>
      <article class="card"><h2>Your brand</h2><p class="muted">Rename the site, then ask the assistant to extend the copy.</p></article>
    </section>
    <section id="pricing" class="grid">
      <article class="card"><h2>Starter</h2><p class="price">$0</p><p class="muted">Preview and local API.</p></article>
      <article class="card"><h2>Pro</h2><p class="price">$19</p><p class="muted">Custom domain and lead export.</p></article>
      <article class="card"><h2>Team</h2><p class="price">$49</p><p class="muted">Shared workspace and roles.</p></article>
    </section>
    <section id="lead" class="grid two">
      <div>
        <h2>Request a walkthrough</h2>
        <p class="muted">This form posts JSON to the API. Offline, it confirms locally so you can still test the UI.</p>
      </div>
      <form id="lead-form">
        <label>Name<input name="name" required placeholder="Ada Lovelace" /></label>
        <label>Email<input name="email" type="email" required placeholder="ada@example.com" /></label>
        <button type="submit">Save lead</button>
        <p id="form-status" class="muted"></p>
      </form>
    </section>
  </main>`;
}

function portfolioHtml(siteName: string): string {
  return `<header class="wrap nav">
    <div class="brand">${siteName}</div>
    <nav class="nav-links"><a href="#work">Work</a><a href="#contact">Contact</a></nav>
  </header>
  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">Portfolio</p>
        <h1>${siteName} designs products people finish.</h1>
        <p class="lede">Selected work is served by <code>GET /api/projects</code>. The contact form posts to <code>/api/messages</code>.</p>
      </div>
      <figure class="hero-visual">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f1d7?w=1200&h=800&fit=crop&q=80" alt="Design studio desk" />
      </figure>
    </section>
    <section id="work" class="grid">
      <article class="card"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop&q=80" alt="Code on a laptop" /><h2>Northwind</h2><p class="muted">Analytics dashboard for a logistics team.</p></article>
      <article class="card"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop&q=80" alt="Team workshop" /><h2>Harbor</h2><p class="muted">Hiring site with a searchable role list.</p></article>
      <article class="card"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80" alt="Product charts" /><h2>Lumen</h2><p class="muted">Marketing page measured against signup goals.</p></article>
    </section>
    <section id="contact" class="grid two">
      <div><h2>Start a project</h2><p class="muted">Tell ${siteName} what you want to build.</p></div>
      <form id="contact-form">
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Message<textarea name="message" rows="4" required></textarea></label>
        <button type="submit">Send message</button>
        <p id="form-status" class="muted"></p>
      </form>
    </section>
  </main>`;
}

function blogHtml(siteName: string): string {
  return `<header class="wrap nav">
    <div class="brand">${siteName}</div>
    <nav class="nav-links"><a href="#posts">Stories</a></nav>
  </header>
  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">Journal</p>
        <h1>Notes from the ${siteName} build log.</h1>
        <p class="lede">Open a story to read it. The list hydrates from <code>GET /api/posts</code> when the server is up.</p>
      </div>
      <figure class="hero-visual">
        <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=800&fit=crop&q=80" alt="Open notebook" />
      </figure>
    </section>
    <section id="posts" class="grid">
      <article class="post card"><img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=500&fit=crop&q=80" alt="Library shelves" /><h2>Shipping the first API</h2><p class="muted">Routes, seed data, and a preview that still works offline.</p><button class="read-post" data-slug="shipping-the-first-api">Read</button></article>
      <article class="post card"><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop&q=80" alt="Laptop and coffee" /><h2>Designing the reading view</h2><p class="muted">One column, large type, and a way back to the index.</p><button class="read-post" data-slug="designing-the-reading-view">Read</button></article>
      <article class="post card"><img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop&q=80" alt="Writing desk" /><h2>What to log each week</h2><p class="muted">Decisions, not diaries. Keep the next reader unblocked.</p><button class="read-post" data-slug="what-to-log-each-week">Read</button></article>
    </section>
    <article id="reader" class="reader" hidden>
      <p class="kicker" id="reader-kicker">Story</p>
      <h2 id="reader-title"></h2>
      <p id="reader-body"></p>
      <button type="button" id="close-reader" class="ghost">Back to stories</button>
    </article>
  </main>`;
}

function storeHtml(siteName: string): string {
  return `<header class="wrap nav">
    <div class="brand">${siteName}</div>
    <nav class="nav-links"><a href="#catalog">Catalog</a></nav>
    <span class="muted">Cart <strong id="cart-count">0</strong></span>
  </header>
  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">Shop</p>
        <h1>Goods from ${siteName}, checked out through your API.</h1>
        <p class="lede">Add items, then place an order. <code>POST /api/orders</code> stores the cart when Express is running.</p>
      </div>
      <figure class="hero-visual">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80" alt="Retail interior" />
      </figure>
    </section>
    <section id="catalog" class="grid">
      <article class="product card"><img src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=500&fit=crop&q=80" alt="Ceramic mug" /><h2>Field mug</h2><p class="price">$24</p><button class="add-to-cart" data-name="Field mug" data-price="24">Add to cart</button></article>
      <article class="product card"><img src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=500&fit=crop&q=80" alt="Notebook" /><h2>Grid notebook</h2><p class="price">$18</p><button class="add-to-cart" data-name="Grid notebook" data-price="18">Add to cart</button></article>
      <article class="product card"><img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=500&fit=crop&q=80" alt="Desk lamp" /><h2>Arc lamp</h2><p class="price">$64</p><button class="add-to-cart" data-name="Arc lamp" data-price="64">Add to cart</button></article>
    </section>
    <div id="cart-bar">
      <span>Total $<strong id="cart-total">0.00</strong></span>
      <button type="button" id="checkout">Place order</button>
    </div>
    <p id="form-status" class="muted"></p>
  </main>`;
}

function dashboardHtml(siteName: string): string {
  return `<header class="wrap nav">
    <div class="brand">${siteName}</div>
    <nav class="nav-links"><a href="#stats">Overview</a><a href="#tasks">Tasks</a></nav>
    <p id="api-status" class="muted">Sample data</p>
  </header>
  <main class="wrap">
    <section>
      <p class="kicker">Overview</p>
      <h1>${siteName} at a glance.</h1>
    </section>
    <section id="stats" class="grid">
      <article class="stat"><span class="muted">Visitors</span><strong id="stat-visitors">1,284</strong></article>
      <article class="stat"><span class="muted">Signups</span><strong id="stat-signups">86</strong></article>
      <article class="stat"><span class="muted">Revenue</span><strong id="stat-revenue">$4,320</strong></article>
    </section>
    <section class="grid two">
      <article class="card">
        <h2>Recent activity</h2>
        <table>
          <thead><tr><th>When</th><th>Event</th></tr></thead>
          <tbody id="activity-body">
            <tr><td>2m</td><td>New signup from Maya</td></tr>
            <tr><td>18m</td><td>Order #1042 paid</td></tr>
            <tr><td>1h</td><td>Deploy finished</td></tr>
          </tbody>
        </table>
      </article>
      <form id="task-form">
        <h2>Add a task</h2>
        <label>Title<input name="title" required placeholder="Review the API logs" /></label>
        <button type="submit">Add task</button>
        <ul id="task-list">
          <li>Confirm seed data</li>
          <li>Wire MongoDB when ready</li>
        </ul>
        <p id="form-status" class="muted"></p>
      </form>
    </section>
  </main>`;
}

function clientJs(kind: WebsiteKind, siteName: string): string {
  const site = JSON.stringify(siteName);
  const readers: Record<string, string> = {
    "shipping-the-first-api": "The client renders immediately. Express answers /api/posts when you start the server. Same records live in seed.mjs.",
    "designing-the-reading-view": "The reader panel stays hidden until a story is opened, then replaces the teaser with the full note.",
    "what-to-log-each-week": "Write the decision, the constraint, and the next check. Skip status that will be stale tomorrow.",
  };
  const common = `const SITE_NAME = ${site};
async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}
function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}
`;
  if (kind === "landing") {
    return `${common}
document.getElementById("lead-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const payload = formData(form);
  try {
    await postJson("/api/leads", payload);
    status.textContent = "Lead saved to the " + SITE_NAME + " API.";
  } catch {
    status.textContent = "Saved locally for " + payload.email + ". Start the Express server to persist it.";
  }
  form.reset();
});
`;
  }
  if (kind === "portfolio") {
    return `${common}
document.getElementById("contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const payload = formData(form);
  try {
    await postJson("/api/messages", payload);
    status.textContent = "Message sent to the " + SITE_NAME + " API.";
  } catch {
    status.textContent = "Saved locally. Start the server to store messages.";
  }
  form.reset();
});
`;
  }
  if (kind === "blog") {
    return `${common}
const STORIES = ${JSON.stringify(readers, null, 2)};
const reader = document.getElementById("reader");
document.querySelectorAll(".read-post").forEach((button) => {
  button.addEventListener("click", () => {
    const slug = button.dataset.slug;
    document.getElementById("reader-title").textContent = button.parentElement.querySelector("h2").textContent;
    document.getElementById("reader-body").textContent = STORIES[slug] || "Story coming soon.";
    reader.hidden = false;
    if (typeof reader.scrollIntoView === "function") reader.scrollIntoView({ behavior: "smooth" });
  });
});
document.getElementById("close-reader").addEventListener("click", () => {
  reader.hidden = true;
});
`;
  }
  if (kind === "store") {
    return `${common}
const cart = [];
function renderCart() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("cart-count").textContent = String(cart.length);
  document.getElementById("cart-total").textContent = total.toFixed(2);
}
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    cart.push({ name: button.dataset.name, price: Number(button.dataset.price) });
    renderCart();
  });
});
document.getElementById("checkout").addEventListener("click", async () => {
  const status = document.getElementById("form-status");
  if (!cart.length) {
    status.textContent = "Add something before checkout.";
    return;
  }
  try {
    const order = await postJson("/api/orders", { email: "guest@example.com", items: cart });
    status.textContent = "Order " + order.id + " placed.";
  } catch {
    status.textContent = "Order kept in the browser. Start the server to save it.";
  }
});
`;
  }
  return `${common}
async function hydrate() {
  const status = document.getElementById("api-status");
  try {
    const response = await fetch("/api/stats");
    if (!response.ok) throw new Error("offline");
    const stats = await response.json();
    document.getElementById("stat-visitors").textContent = stats.visitors;
    document.getElementById("stat-signups").textContent = stats.signups;
    document.getElementById("stat-revenue").textContent = stats.revenue;
    status.textContent = "Live API";
  } catch {
    status.textContent = "Sample data";
  }
}
document.getElementById("task-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const payload = formData(form);
  const item = document.createElement("li");
  item.textContent = payload.title;
  document.getElementById("task-list").appendChild(item);
  try {
    await postJson("/api/tasks", payload);
    status.textContent = "Task saved to the " + SITE_NAME + " API.";
  } catch {
    status.textContent = "Task added locally.";
  }
  form.reset();
});
hydrate();
`;
}

function rootPackage(slug: string): string {
  return JSON.stringify({
    name: slug,
    private: true,
    scripts: {
      start: "npm start --prefix server",
      server: "npm start --prefix server",
    },
  }, null, 2) + "\n";
}

function serverPackage(slug: string): string {
  return JSON.stringify({
    name: `${slug}-server`,
    private: true,
    type: "module",
    scripts: { start: "node index.mjs" },
    dependencies: { cors: "^2.8.5", express: "^4.21.2" },
  }, null, 2) + "\n";
}

function serverIndex(): string {
  return `import app from "./src/app.mjs";
import { connectDB } from "./src/config/db.mjs";

const port = Number(process.env.PORT || 5000);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(\`API ready on http://localhost:\${port}\`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
}

function serverApp(): string {
  return `import express from "express";
import cors from "cors";
import api from "./routes/api.mjs";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api", api);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Server error" });
});

export default app;
`;
}

function serverDb(): string {
  return `/**
 * Uses an in-memory collection unless MONGODB_URI is set.
 * Install mongodb in server/ before pointing this at a real database.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MONGODB_URI not set — API is using in-memory seed data");
    return null;
  }
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB");
  return client.db();
}
`;
}

function serverSeed(kind: WebsiteKind, siteName: string): string {
  const seeds: Record<WebsiteKind, string> = {
    landing: `export const features = [
  { id: "preview", title: "Live preview" },
  { id: "api", title: "Express API" },
  { id: "brand", title: ${JSON.stringify(siteName)} },
];
export const plans = [
  { id: "starter", name: "Starter", price: 0 },
  { id: "pro", name: "Pro", price: 19 },
  { id: "team", name: "Team", price: 49 },
];
export const leads = [];
`,
    portfolio: `export const projects = [
  { slug: "northwind", title: "Northwind" },
  { slug: "harbor", title: "Harbor" },
  { slug: "lumen", title: "Lumen" },
];
export const messages = [];
`,
    blog: `export const posts = [
  { slug: "shipping-the-first-api", title: "Shipping the first API", excerpt: "Routes, seed data, and an offline preview." },
  { slug: "designing-the-reading-view", title: "Designing the reading view", excerpt: "One column and a way back to the index." },
  { slug: "what-to-log-each-week", title: "What to log each week", excerpt: "Decisions, constraints, and the next check." },
];
`,
    store: `export const products = [
  { id: "mug", name: "Field mug", price: 24 },
  { id: "notebook", name: "Grid notebook", price: 18 },
  { id: "lamp", name: "Arc lamp", price: 64 },
];
export const orders = [];
`,
    dashboard: `export const stats = { visitors: "1,284", signups: "86", revenue: "$4,320" };
export const activity = [
  { when: "2m", event: "New signup from Maya" },
  { when: "18m", event: "Order #1042 paid" },
  { when: "1h", event: "Deploy finished" },
];
export const tasks = [
  { title: "Confirm seed data" },
  { title: "Wire MongoDB when ready" },
];
`,
  };
  return `/** Seed data for ${siteName}. Swap these arrays for Mongo collections later. */\n${seeds[kind]}`;
}

function serverRoutes(kind: WebsiteKind): string {
  const routes: Record<WebsiteKind, string> = {
    landing: `import { Router } from "express";
import { features, plans, leads } from "../data/seed.mjs";

const router = Router();

router.get("/features", (_req, res) => res.json(features));
router.get("/plans", (_req, res) => res.json(plans));
router.post("/leads", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  if (!name || !email.includes("@")) {
    return res.status(400).json({ error: "Name and a valid email are required." });
  }
  const lead = { id: Date.now().toString(), name, email, createdAt: new Date().toISOString() };
  leads.push(lead);
  res.status(201).json(lead);
});

export default router;
`,
    portfolio: `import { Router } from "express";
import { projects, messages } from "../data/seed.mjs";

const router = Router();

router.get("/projects", (_req, res) => res.json(projects));
router.post("/messages", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!name || !email.includes("@") || message.length < 2) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  const entry = { id: Date.now().toString(), name, email, message };
  messages.push(entry);
  res.status(201).json(entry);
});

export default router;
`,
    blog: `import { Router } from "express";
import { posts } from "../data/seed.mjs";

const router = Router();

router.get("/posts", (_req, res) => res.json(posts));
router.get("/posts/:slug", (req, res) => {
  const post = posts.find((item) => item.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

export default router;
`,
    store: `import { Router } from "express";
import { products, orders } from "../data/seed.mjs";

const router = Router();

router.get("/products", (_req, res) => res.json(products));
router.post("/orders", (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: "Cart is empty." });
  const order = {
    id: "ord_" + Date.now().toString(),
    email: String(req.body?.email || "guest@example.com"),
    items,
    total: items.reduce((sum, item) => sum + Number(item.price || 0), 0),
  };
  orders.push(order);
  res.status(201).json(order);
});

export default router;
`,
    dashboard: `import { Router } from "express";
import { stats, activity, tasks } from "../data/seed.mjs";

const router = Router();

router.get("/stats", (_req, res) => res.json(stats));
router.get("/activity", (_req, res) => res.json(activity));
router.get("/tasks", (_req, res) => res.json(tasks));
router.post("/tasks", (req, res) => {
  const title = String(req.body?.title || "").trim();
  if (!title) return res.status(400).json({ error: "Title is required." });
  const task = { title };
  tasks.push(task);
  res.status(201).json(task);
});

export default router;
`,
  };
  return routes[kind];
}

function readme(kind: WebsiteKind, siteName: string, slug: string): string {
  const blueprint = WEBSITE_BLUEPRINTS.find((item) => item.id === kind);
  return `# ${siteName}

Full-stack ${blueprint?.label ?? kind} generated in the Lunor.AI Web Development assistant.

${blueprint?.description ?? ""}

## Project layout

\`\`\`
${slug}/
├── client/index.html    # Page the editor previews
├── client/styles.css
├── client/site.js       # Calls /api and falls back to on-page data
├── server/index.mjs     # Express entry
├── server/src/app.mjs
├── server/src/routes/api.mjs
├── server/src/data/seed.mjs
└── server/src/config/db.mjs
\`\`\`

## Run the API

\`\`\`bash
cd server
npm install
npm start
\`\`\`

The API listens on http://localhost:5000. \`GET /api/health\` returns \`{ "ok": true }\`.

Copy \`server/.env.example\` to \`server/.env\` and set \`MONGODB_URI\` when you want a database. Without it, routes use the arrays in \`seed.mjs\`.

## Preview

Open \`client/index.html\` in the editor preview. The page is usable before the API is running.
`;
}
