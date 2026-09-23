/**
 * Full-stack website generator for the Web Development AI assistant.
 * Each blueprint writes a previewable HTML/CSS/JS frontend and a
 * dependency-free Node API the student can run with `npm start`.
 */

export interface WebsiteBlueprint {
  id: string;
  label: string;
  description: string;
  icon: string;
  defaultName: string;
  keywords: string[];
  /** Lower numbers win when a prompt matches more than one blueprint. */
  priority: number;
  endpoints: string[];
}

export interface WebsiteFile {
  path: string;
  name: string;
  content: string;
}

export interface GeneratedWebsite {
  blueprint: WebsiteBlueprint;
  siteName: string;
  files: WebsiteFile[];
  summary: string;
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Menu, hours, and table reservations",
    icon: "🍽️",
    defaultName: "Olive & Oak",
    keywords: ["restaurant", "cafe", "dining", "reservation", "menu"],
    priority: 1,
    endpoints: ["GET /api/menu", "POST /api/reservations", "GET /api/health"],
  },
  {
    id: "store",
    label: "Store",
    description: "Product catalog, cart, and checkout",
    icon: "🛍️",
    defaultName: "North Market",
    keywords: ["store", "shop", "ecommerce", "e-commerce", "cart", "checkout"],
    priority: 2,
    endpoints: ["GET /api/products", "POST /api/orders", "GET /api/health"],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Metrics, activity, and a status API",
    icon: "📊",
    defaultName: "Pulse",
    keywords: ["dashboard", "analytics", "admin panel", "metrics"],
    priority: 3,
    endpoints: ["GET /api/overview", "GET /api/health"],
  },
  {
    id: "blog",
    label: "Blog",
    description: "Article list with a posts API",
    icon: "✍️",
    defaultName: "Field Notes",
    keywords: ["blog", "article", "articles", "posts"],
    priority: 4,
    endpoints: ["GET /api/posts", "GET /api/health"],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Projects, skills, and a contact form",
    icon: "🎨",
    defaultName: "Alex Rivera",
    keywords: ["portfolio", "personal site", "case study"],
    priority: 5,
    endpoints: ["GET /api/projects", "POST /api/messages", "GET /api/health"],
  },
  {
    id: "landing",
    label: "Landing",
    description: "Marketing page with pricing and leads",
    icon: "🚀",
    defaultName: "Lumina",
    keywords: ["landing", "saas", "startup", "homepage", "marketing"],
    priority: 6,
    endpoints: ["GET /api/plans", "POST /api/leads", "GET /api/health"],
  },
];

const BLUEPRINT_BY_ID = new Map(WEBSITE_BLUEPRINTS.map((blueprint) => [blueprint.id, blueprint]));

export function matchWebsiteRequest(prompt: string): { blueprintId: string; siteName: string } | null {
  const text = prompt.trim();
  if (!text || /^(what|why|how|explain|describe|compare|difference)\b/i.test(text)) return null;

  const wantsBuild = /\b(build|create|generate|make|scaffold|spin\s*up|automate)\b/i.test(text);
  const wantsSite = /\b(website|web\s*site|landing\s*page|full[\s-]?stack|site)\b/i.test(text);
  if (!wantsBuild || !wantsSite) return null;

  const ranked = [...WEBSITE_BLUEPRINTS].sort((a, b) => a.priority - b.priority);
  const lowered = text.toLowerCase();
  const hit = ranked.find((blueprint) => blueprint.keywords.some((keyword) => lowered.includes(keyword)))
    ?? BLUEPRINT_BY_ID.get("landing");
  if (!hit) return null;

  return { blueprintId: hit.id, siteName: extractSiteName(text, hit.defaultName) };
}

export function generateWebsite(blueprintId: string, siteName?: string): GeneratedWebsite {
  const blueprint = BLUEPRINT_BY_ID.get(blueprintId);
  if (!blueprint) throw new Error(`Unknown website blueprint: ${blueprintId}`);
  const name = (siteName || blueprint.defaultName).trim() || blueprint.defaultName;
  const files = builders[blueprint.id](name);
  return {
    blueprint,
    siteName: name,
    files,
    summary: summaryFor(blueprint, name),
  };
}

function extractSiteName(text: string, fallback: string): string {
  const quoted = text.match(/["“]([^"”]{2,48})["”]/);
  const named = text.match(/\b(?:called|named|titled)\s+["']?([A-Za-z0-9][^.,!?\n]{0,48})/i);
  const raw = (quoted?.[1] || named?.[1] || "")
    .replace(/\b(website|web\s*site|site|page|app|please)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return raw || fallback;
}

function summaryFor(blueprint: WebsiteBlueprint, siteName: string): string {
  const routes = blueprint.endpoints.map((endpoint) => `- \`${endpoint}\``).join("\n");
  return `**${blueprint.label} website ready:** ${siteName}

The Website Generator wrote a full-stack project into your editor and opened the preview.

**Frontend**
- \`src/index.html\`
- \`src/style.css\`
- \`src/app.js\`

**API** — Node.js, no npm packages
- \`server/server.cjs\`
- \`package.json\`

**Run the API and the site together**
\`\`\`bash
npm start
\`\`\`
Then open http://localhost:3000

**Routes**
${routes}

The in-editor preview uses the sample data baked into \`app.js\`. After \`npm start\`, the same page loads live JSON from the API.`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] || char));
}

function slug(value: string): string {
  const next = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return next || "website";
}

function file(path: string, content: string): WebsiteFile {
  const name = path.split("/").pop() || path;
  return { path, name, content };
}

function page(options: {
  siteName: string;
  description: string;
  nav: { href: string; label: string }[];
  body: string;
}): string {
  const safe = escapeHtml(options.siteName);
  const links = options.nav.map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${escapeHtml(options.description)}" />
  <title>${safe}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="nav">
    <a class="brand" href="#top">${safe}</a>
    <nav class="nav-links">${links}</nav>
  </header>
  <main id="top">
${options.body}
  </main>
  <footer class="footer">
    <strong>${safe}</strong>
    <span>© <span id="year"></span> · Built with the Lunor.AI website generator</span>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function shellCss(accent: string): string {
  return `:root {
  --bg: #0b1020;
  --card: #141a2e;
  --line: rgba(255, 255, 255, 0.08);
  --text: #e8eefc;
  --muted: #93a0bd;
  --accent: ${accent};
  --accent-ink: #071018;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
.nav {
  position: sticky; top: 0; z-index: 10;
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  padding: 16px 7vw;
  background: rgba(11, 16, 32, 0.86);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.brand { font-weight: 750; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 18px; color: var(--muted); font-size: 14px; }
.nav-links a:hover { color: var(--text); }
.hero, .section { padding: 72px 7vw; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; }
.eyebrow {
  color: var(--accent); font-size: 12px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
}
h1 { font-size: clamp(40px, 6vw, 68px); line-height: 0.95; letter-spacing: -0.045em; margin: 10px 0 16px; }
h2 { font-size: clamp(28px, 4vw, 40px); letter-spacing: -0.03em; margin: 0 0 8px; }
.lede, .muted { color: var(--muted); }
.hero-media, .card, .panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
}
.hero-media img, .cover { width: 100%; height: 100%; min-height: 280px; }
.actions, .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.btn, button, .nav-links a.btn {
  border: 0; cursor: pointer; border-radius: 999px;
  padding: 12px 18px; font-weight: 700; font: inherit;
  background: var(--accent); color: var(--accent-ink);
}
.btn.ghost, button.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card, .panel { padding: 18px; }
.card h3, .panel h3 { margin: 8px 0; }
.price { font-size: 32px; letter-spacing: -0.04em; margin: 8px 0; }
.tag {
  display: inline-flex; padding: 4px 8px; border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent); font-size: 12px; font-weight: 700;
}
form { display: grid; gap: 10px; }
input, select, textarea {
  width: 100%; border-radius: 12px; border: 1px solid var(--line);
  background: #0d1326; color: var(--text); padding: 12px 14px; font: inherit;
}
textarea { min-height: 110px; resize: vertical; }
[data-status] { min-height: 1.2em; color: var(--accent); font-size: 14px; }
.footer {
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  padding: 28px 7vw 40px; color: var(--muted); border-top: 1px solid var(--line);
}
.stat { font-size: 28px; font-weight: 750; letter-spacing: -0.04em; }
.bars { display: grid; gap: 10px; }
.bar { height: 10px; border-radius: 999px; background: #0d1326; overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--accent); }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 10px 0; border-bottom: 1px solid var(--line); }
.cart {
  position: sticky; bottom: 16px; margin: 0 7vw 24px;
  display: grid; gap: 12px;
}
@media (max-width: 860px) {
  .hero, .grid { grid-template-columns: 1fr; }
  .nav { align-items: flex-start; flex-direction: column; }
}
`;
}

const CLIENT_RUNTIME = `
async function loadJson(url, fallback) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } catch (error) {
    console.info("Using sample data until the API is running.", error && error.message);
    return fallback;
  }
}

function wireForms() {
  document.querySelectorAll("form[data-api]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector("[data-status]");
      const payload = Object.fromEntries(new FormData(form).entries());
      if (status) status.textContent = "Sending...";
      try {
        const response = await fetch(form.getAttribute("data-api"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Request failed");
        if (status) status.textContent = data.message || "Saved.";
        form.reset();
      } catch (error) {
        if (status) status.textContent = "Preview mode: " + (error.message || "API offline") + ". Run npm start to persist this.";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  wireForms();
  if (typeof boot === "function") Promise.resolve(boot()).catch((error) => console.error(error));
});
`;

function browserScript(body: string): string {
  return `// Generated by the Lunor.AI website generator.\n${CLIENT_RUNTIME}\n${body}\n`;
}

function projectMeta(siteName: string, description: string): WebsiteFile[] {
  const pkg = {
    name: slug(siteName),
    version: "1.0.0",
    private: true,
    description,
    scripts: {
      start: "node server/server.cjs",
      dev: "node server/server.cjs",
    },
  };
  const readme = `# ${siteName}

${description}

This project was generated by the Lunor.AI Website Generator in the Web Development assistant.

## What's inside

- \`src/index.html\`, \`src/style.css\`, \`src/app.js\` — the website
- \`server/server.cjs\` — a Node.js API with no npm dependencies

## Run

\`\`\`bash
npm start
\`\`\`

Open http://localhost:3000

The editor preview uses sample data inside \`src/app.js\`. With the server running, the page reads the same data from \`/api\`.
`;
  return [
    file("package.json", JSON.stringify(pkg, null, 2) + "\n"),
    file("README.md", readme),
  ];
}

function renderServer(siteName: string, dataBlock: string, routes: string): string {
  return `/**
 * ${siteName} API
 * Run from the project root: npm start
 * Serves ../src and JSON routes under /api.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.resolve(__dirname, "..", "src");
const SITE_NAME = ${JSON.stringify(siteName)};

${dataBlock}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) return sendJson(res, 404, { error: "Not found" });
    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1:" + PORT);
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    return res.end();
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, site: SITE_NAME });
    }
${routes}
  } catch (error) {
    return sendJson(res, 400, { error: error.message || "Bad request" });
  }

  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const full = path.resolve(PUBLIC_DIR, "." + requested);
  if (full !== PUBLIC_DIR && !full.startsWith(PUBLIC_DIR + path.sep)) {
    return sendJson(res, 403, { error: "Forbidden" });
  }
  return sendFile(res, full);
});

server.listen(PORT, () => {
  console.log(SITE_NAME + " is running at http://localhost:" + PORT);
});
`;
}

const builders: Record<string, (siteName: string) => WebsiteFile[]> = {
  landing: buildLanding,
  portfolio: buildPortfolio,
  blog: buildBlog,
  store: buildStore,
  dashboard: buildDashboard,
  restaurant: buildRestaurant,
};

function buildLanding(siteName: string): WebsiteFile[] {
  const plans = [
    { id: "starter", name: "Starter", price: "$0", detail: "1 site, preview hosting, community support" },
    { id: "studio", name: "Studio", price: "$29", detail: "Custom domain, lead inbox, remove watermark" },
    { id: "scale", name: "Scale", price: "$79", detail: "Teams, analytics export, priority support" },
  ];
  const features = [
    { title: "Publish in an afternoon", body: "Start from a complete page instead of a blank file." },
    { title: "Leads in one place", body: "The contact form posts to your own /api/leads route." },
    { title: "Yours to edit", body: "Plain HTML, CSS, and JavaScript. No framework lock-in." },
  ];
  const html = page({
    siteName,
    description: `${siteName} helps teams launch a marketing site with a working lead API.`,
    nav: [
      { href: "#features", label: "Product" },
      { href: "#pricing", label: "Pricing" },
      { href: "#contact", label: "Contact" },
    ],
    body: `    <section class="hero">
      <div>
        <p class="eyebrow">Website generator</p>
        <h1>${escapeHtml(siteName)} turns an idea into a live page.</h1>
        <p class="lede">A marketing site with pricing from the API and a lead form that posts to Node.</p>
        <div class="actions">
          <a class="btn" href="#contact">Request a walkthrough</a>
          <a class="btn ghost" href="#pricing">See pricing</a>
        </div>
      </div>
      <div class="hero-media">
        <img alt="Team shipping a product" src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80" />
      </div>
    </section>
    <section class="section" id="features">
      <h2>Why teams start here</h2>
      <div class="grid" id="feature-list"></div>
    </section>
    <section class="section" id="pricing">
      <h2>Pricing</h2>
      <p class="muted">Loaded from <code>/api/plans</code> when the server is running.</p>
      <div class="grid" id="plans"></div>
    </section>
    <section class="section" id="contact">
      <div class="panel">
        <h2>Talk to ${escapeHtml(siteName)}</h2>
        <form data-api="/api/leads">
          <input name="name" placeholder="Your name" required />
          <input name="email" type="email" placeholder="you@studio.com" required />
          <textarea name="note" placeholder="What are you launching?"></textarea>
          <button type="submit">Send</button>
          <p data-status></p>
        </form>
      </div>
    </section>`,
  });
  const js = browserScript(`
const FEATURES = ${JSON.stringify(features)};
const FALLBACK = { plans: ${JSON.stringify(plans)} };

function boot() {
  document.getElementById("feature-list").innerHTML = FEATURES.map((feature) =>
    '<article class="card"><h3>' + feature.title + '</h3><p class="muted">' + feature.body + '</p></article>'
  ).join("");
  return loadJson("/api/plans", FALLBACK).then((data) => {
    document.getElementById("plans").innerHTML = data.plans.map((plan) =>
      '<article class="card"><span class="tag">' + plan.name + '</span><p class="price">' + plan.price + '</p><p class="muted">' + plan.detail + '</p></article>'
    ).join("");
  });
}
`);
  const server = renderServer(siteName, `const PLANS = ${JSON.stringify(plans, null, 2)};
const LEADS = [];`, `
    if (req.method === "GET" && url.pathname === "/api/plans") {
      return sendJson(res, 200, { plans: PLANS });
    }
    if (req.method === "POST" && url.pathname === "/api/leads") {
      const body = await readJson(req);
      if (!body.name || !body.email) return sendJson(res, 400, { error: "Name and email are required." });
      const lead = { id: "lead_" + Date.now(), name: String(body.name), email: String(body.email), note: String(body.note || "") };
      LEADS.push(lead);
      return sendJson(res, 201, { message: "Thanks — we saved your note.", lead });
    }
`);
  return [
    file("src/index.html", html),
    file("src/style.css", shellCss("#7aa2ff")),
    file("src/app.js", js),
    file("server/server.cjs", server),
    ...projectMeta(siteName, `${siteName} marketing site with a lead API.`),
  ];
}

function buildPortfolio(siteName: string): WebsiteFile[] {
  const projects = [
    { title: "Harbor Atlas", tag: "Web", summary: "A travel guide with offline maps and a calm reading layout." },
    { title: "Kiln", tag: "Product", summary: "Inventory for a ceramics studio, from clay lot to sold shelf." },
    { title: "Northwind Notes", tag: "Writing", summary: "A publishing system for a three-person research team." },
  ];
  const html = page({
    siteName,
    description: `Selected work by ${siteName}.`,
    nav: [
      { href: "#work", label: "Work" },
      { href: "#contact", label: "Contact" },
    ],
    body: `    <section class="hero">
      <div>
        <p class="eyebrow">Portfolio</p>
        <h1>${escapeHtml(siteName)} designs sites people finish reading.</h1>
        <p class="lede">Case studies load from <code>/api/projects</code>. The contact form posts to <code>/api/messages</code>.</p>
      </div>
      <div class="hero-media">
        <img alt="Designer desk" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" />
      </div>
    </section>
    <section class="section" id="work">
      <h2>Selected work</h2>
      <div class="grid" id="projects"></div>
    </section>
    <section class="section" id="contact">
      <div class="panel">
        <h2>Start a project</h2>
        <form data-api="/api/messages">
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <textarea name="message" placeholder="What should we make?" required></textarea>
          <button type="submit">Send message</button>
          <p data-status></p>
        </form>
      </div>
    </section>`,
  });
  const js = browserScript(`
const FALLBACK = { projects: ${JSON.stringify(projects)} };
function boot() {
  return loadJson("/api/projects", FALLBACK).then((data) => {
    document.getElementById("projects").innerHTML = data.projects.map((project) =>
      '<article class="card"><span class="tag">' + project.tag + '</span><h3>' + project.title + '</h3><p class="muted">' + project.summary + '</p></article>'
    ).join("");
  });
}
`);
  const server = renderServer(siteName, `const PROJECTS = ${JSON.stringify(projects, null, 2)};
const MESSAGES = [];`, `
    if (req.method === "GET" && url.pathname === "/api/projects") {
      return sendJson(res, 200, { projects: PROJECTS });
    }
    if (req.method === "POST" && url.pathname === "/api/messages") {
      const body = await readJson(req);
      if (!body.name || !body.email || !body.message) return sendJson(res, 400, { error: "Name, email, and message are required." });
      const message = { id: "msg_" + Date.now(), name: String(body.name), email: String(body.email), message: String(body.message) };
      MESSAGES.push(message);
      return sendJson(res, 201, { message: "Message received.", entry: message });
    }
`);
  return [
    file("src/index.html", html),
    file("src/style.css", shellCss("#3ddec0")),
    file("src/app.js", js),
    file("server/server.cjs", server),
    ...projectMeta(siteName, `Portfolio site for ${siteName}.`),
  ];
}

function buildBlog(siteName: string): WebsiteFile[] {
  const posts = [
    { id: "shipping-small", title: "Ship the small version", tag: "Process", excerpt: "A public page beats a private draft.", body: "Put one useful page online before you add accounts, themes, or a CMS. Readers tell you what the second page should be." },
    { id: "apis-you-can-read", title: "APIs you can read", tag: "Backend", excerpt: "If the route fits on a screen, you will maintain it.", body: "Start with Node's http module. Return JSON, check the fields you care about, and add a framework only when the file gets hard to scan." },
    { id: "type-on-the-page", title: "Type is the interface", tag: "Design", excerpt: "Most of a blog is a column of text.", body: "Keep the measure near 65 characters, the body at 18px, and the title large enough to recognize from across the room." },
  ];
  const html = page({
    siteName,
    description: `${siteName} — essays on making websites.`,
    nav: [{ href: "#posts", label: "Essays" }],
    body: `    <section class="hero">
      <div>
        <p class="eyebrow">Journal</p>
        <h1>${escapeHtml(siteName)}</h1>
        <p class="lede">Short essays. Click a card to read it. The list comes from <code>/api/posts</code>.</p>
      </div>
      <div class="hero-media">
        <img alt="Open notebook" src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80" />
      </div>
    </section>
    <section class="section" id="posts">
      <div class="grid" id="post-list"></div>
      <article class="panel" id="reader" hidden>
        <p class="eyebrow" id="reader-tag"></p>
        <h2 id="reader-title"></h2>
        <p id="reader-body"></p>
        <button type="button" class="ghost" id="reader-close">Back to essays</button>
      </article>
    </section>`,
  });
  const js = browserScript(`
const FALLBACK = { posts: ${JSON.stringify(posts)} };
function boot() {
  const list = document.getElementById("post-list");
  const reader = document.getElementById("reader");
  document.getElementById("reader-close").addEventListener("click", () => {
    reader.hidden = true;
    list.hidden = false;
  });
  return loadJson("/api/posts", FALLBACK).then((data) => {
    list.innerHTML = data.posts.map((post) =>
      '<button type="button" class="card" data-id="' + post.id + '" style="text-align:left"><span class="tag">' + post.tag + '</span><h3>' + post.title + '</h3><p class="muted">' + post.excerpt + '</p></button>'
    ).join("");
    list.addEventListener("click", (event) => {
      const card = event.target.closest("[data-id]");
      if (!card) return;
      const post = data.posts.find((item) => item.id === card.getAttribute("data-id"));
      if (!post) return;
      document.getElementById("reader-tag").textContent = post.tag;
      document.getElementById("reader-title").textContent = post.title;
      document.getElementById("reader-body").textContent = post.body;
      list.hidden = true;
      reader.hidden = false;
    });
  });
}
`);
  const server = renderServer(siteName, `const POSTS = ${JSON.stringify(posts, null, 2)};`, `
    if (req.method === "GET" && url.pathname === "/api/posts") {
      const id = url.searchParams.get("id");
      if (id) {
        const post = POSTS.find((item) => item.id === id);
        if (!post) return sendJson(res, 404, { error: "Post not found" });
        return sendJson(res, 200, { post });
      }
      return sendJson(res, 200, { posts: POSTS });
    }
`);
  return [
    file("src/index.html", html),
    file("src/style.css", shellCss("#f0a05a")),
    file("src/app.js", js),
    file("server/server.cjs", server),
    ...projectMeta(siteName, `${siteName} blog with a posts API.`),
  ];
}

function buildStore(siteName: string): WebsiteFile[] {
  const products = [
    { id: "mug", name: "Stoneware mug", price: 28, blurb: "12oz, speckled glaze, dishwasher safe." },
    { id: "tote", name: "Market tote", price: 36, blurb: "Heavy canvas with an interior pocket." },
    { id: "candle", name: "Cedar candle", price: 22, blurb: "Soy wax, 45 hour burn." },
    { id: "journal", name: "Linen journal", price: 18, blurb: "192 blank pages, lay-flat binding." },
  ];
  const html = page({
    siteName,
    description: `${siteName} — goods for the table and the desk.`,
    nav: [{ href: "#shop", label: "Shop" }],
    body: `    <section class="hero">
      <div>
        <p class="eyebrow">Shop</p>
        <h1>${escapeHtml(siteName)}</h1>
        <p class="lede">Add pieces to your cart. Checkout posts the order to <code>/api/orders</code>.</p>
      </div>
      <div class="hero-media">
        <img alt="Shop interior" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" />
      </div>
    </section>
    <section class="section" id="shop">
      <div class="grid" id="products"></div>
    </section>
    <aside class="panel cart">
      <div class="row">
        <h2 style="margin:0">Cart</h2>
        <span class="tag" id="cart-count">0</span>
      </div>
      <ul id="cart-items" class="muted"></ul>
      <strong id="cart-total">$0</strong>
      <form id="checkout">
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button type="submit">Place order</button>
        <p data-status id="order-status"></p>
      </form>
    </aside>`,
  });
  const js = browserScript(`
const FALLBACK = { products: ${JSON.stringify(products)} };
const cart = [];

function money(cents) { return "$" + cents; }

function renderCart() {
  const items = document.getElementById("cart-items");
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  document.getElementById("cart-count").textContent = String(count);
  document.getElementById("cart-total").textContent = money(total);
  items.innerHTML = cart.length
    ? cart.map((item) => "<li>" + item.qty + " × " + item.name + " — " + money(item.qty * item.price) + "</li>").join("")
    : "<li>Your cart is empty.</li>";
}

function boot() {
  renderCart();
  document.getElementById("checkout").addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("order-status");
    if (!cart.length) { status.textContent = "Add something first."; return; }
    const form = new FormData(event.target);
    const payload = { name: form.get("name"), email: form.get("email"), items: cart.map((item) => ({ id: item.id, qty: item.qty })) };
    status.textContent = "Sending...";
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order failed");
      status.textContent = data.message;
      cart.length = 0;
      renderCart();
      event.target.reset();
    } catch (error) {
      status.textContent = "Preview mode: " + error.message + ". Run npm start to place a real order.";
    }
  });
  return loadJson("/api/products", FALLBACK).then((data) => {
    const grid = document.getElementById("products");
    grid.innerHTML = data.products.map((product) =>
      '<article class="card"><h3>' + product.name + '</h3><p class="price">' + money(product.price) + '</p><p class="muted">' + product.blurb + '</p><button type="button" data-id="' + product.id + '">Add to cart</button></article>'
    ).join("");
    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-id]");
      if (!button) return;
      const product = data.products.find((item) => item.id === button.getAttribute("data-id"));
      if (!product) return;
      const existing = cart.find((item) => item.id === product.id);
      if (existing) existing.qty += 1;
      else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
      renderCart();
    });
  });
}
`);
  const server = renderServer(siteName, `const PRODUCTS = ${JSON.stringify(products, null, 2)};
const ORDERS = [];`, `
    if (req.method === "GET" && url.pathname === "/api/products") {
      return sendJson(res, 200, { products: PRODUCTS });
    }
    if (req.method === "POST" && url.pathname === "/api/orders") {
      const body = await readJson(req);
      if (!body.email || !Array.isArray(body.items) || body.items.length === 0) {
        return sendJson(res, 400, { error: "Add items and an email." });
      }
      const order = {
        id: "ord_" + Date.now(),
        name: String(body.name || "Guest"),
        email: String(body.email),
        items: body.items.map((item) => ({ id: String(item.id), qty: Number(item.qty) || 1 })),
      };
      ORDERS.push(order);
      return sendJson(res, 201, { message: "Order " + order.id + " received.", order });
    }
`);
  return [
    file("src/index.html", html),
    file("src/style.css", shellCss("#e85d75")),
    file("src/app.js", js),
    file("server/server.cjs", server),
    ...projectMeta(siteName, `${siteName} storefront with cart and checkout.`),
  ];
}

function buildDashboard(siteName: string): WebsiteFile[] {
  const overview = {
    stats: [
      { label: "Visitors", value: "12,480", delta: "+8% this week" },
      { label: "Signups", value: "326", delta: "+21 today" },
      { label: "Revenue", value: "$18.4k", delta: "Last 7 days" },
    ],
    series: [
      { label: "Mon", value: 42 },
      { label: "Tue", value: 55 },
      { label: "Wed", value: 48 },
      { label: "Thu", value: 72 },
      { label: "Fri", value: 64 },
      { label: "Sat", value: 36 },
      { label: "Sun", value: 28 },
    ],
    activity: [
      { when: "2m ago", what: "New signup from Maya Chen" },
      { when: "18m ago", what: "Invoice #1042 paid" },
      { when: "1h ago", what: "Campaign “Spring” published" },
      { when: "3h ago", what: "API error rate back under 0.2%" },
    ],
  };
  const html = page({
    siteName,
    description: `${siteName} operations dashboard.`,
    nav: [{ href: "#overview", label: "Overview" }],
    body: `    <section class="section" id="overview">
      <p class="eyebrow">Dashboard</p>
      <h1>${escapeHtml(siteName)}</h1>
      <p class="lede">Numbers below come from <code>/api/overview</code>.</p>
      <div class="grid" id="stats"></div>
      <div class="panel" style="margin-top:16px">
        <h2>This week</h2>
        <div class="bars" id="series"></div>
      </div>
      <div class="panel" style="margin-top:16px">
        <h2>Activity</h2>
        <table>
          <thead><tr><th>When</th><th>What</th></tr></thead>
          <tbody id="activity"></tbody>
        </table>
      </div>
    </section>`,
  });
  const js = browserScript(`
const FALLBACK = ${JSON.stringify(overview)};
function boot() {
  return loadJson("/api/overview", FALLBACK).then((data) => {
    document.getElementById("stats").innerHTML = data.stats.map((stat) =>
      '<article class="card"><p class="muted">' + stat.label + '</p><p class="stat">' + stat.value + '</p><p class="muted">' + stat.delta + '</p></article>'
    ).join("");
    document.getElementById("series").innerHTML = data.series.map((point) =>
      '<div><div class="row"><span>' + point.label + '</span><span class="muted">' + point.value + '</span></div><div class="bar"><span style="width:' + point.value + '%"></span></div></div>'
    ).join("");
    document.getElementById("activity").innerHTML = data.activity.map((row) =>
      "<tr><td>" + row.when + "</td><td>" + row.what + "</td></tr>"
    ).join("");
  });
}
`);
  const server = renderServer(siteName, `const OVERVIEW = ${JSON.stringify(overview, null, 2)};`, `
    if (req.method === "GET" && url.pathname === "/api/overview") {
      return sendJson(res, 200, OVERVIEW);
    }
`);
  return [
    file("src/index.html", html),
    file("src/style.css", shellCss("#8b7cff")),
    file("src/app.js", js),
    file("server/server.cjs", server),
    ...projectMeta(siteName, `${siteName} dashboard backed by /api/overview.`),
  ];
}

function buildRestaurant(siteName: string): WebsiteFile[] {
  const menu = [
    { course: "Small plates", name: "Citrus olives", price: "$8", note: "Castelvetrano, orange peel, chili" },
    { course: "Small plates", name: "Ricotta toast", price: "$14", note: "Hot honey, thyme, grilled bread" },
    { course: "Mains", name: "Roast chicken", price: "$29", note: "Pan juices, charred lemon, greens" },
    { course: "Mains", name: "Mushroom pappardelle", price: "$24", note: "Brown butter, pecorino, parsley" },
    { course: "Dessert", name: "Olive oil cake", price: "$11", note: "Candied citrus, crème fraîche" },
  ];
  const html = page({
    siteName,
    description: `${siteName} — supper, wine, and a quiet room.`,
    nav: [
      { href: "#menu", label: "Menu" },
      { href: "#reserve", label: "Reserve" },
    ],
    body: `    <section class="hero">
      <div>
        <p class="eyebrow">Dinner nightly</p>
        <h1>${escapeHtml(siteName)}</h1>
        <p class="lede">Wood fire, a short menu, and tables held through <code>/api/reservations</code>.</p>
        <div class="actions">
          <a class="btn" href="#reserve">Reserve a table</a>
          <a class="btn ghost" href="#menu">Read the menu</a>
        </div>
      </div>
      <div class="hero-media">
        <img alt="Plated dinner" src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80" />
      </div>
    </section>
    <section class="section" id="menu">
      <h2>Tonight</h2>
      <div class="grid" id="menu-list"></div>
    </section>
    <section class="section" id="reserve">
      <div class="panel">
        <h2>Reservation</h2>
        <form data-api="/api/reservations">
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="party" type="number" min="1" max="12" value="2" placeholder="Party size" required />
          <input name="when" type="datetime-local" required />
          <button type="submit">Request table</button>
          <p data-status></p>
        </form>
      </div>
    </section>`,
  });
  const js = browserScript(`
const FALLBACK = { menu: ${JSON.stringify(menu)} };
function boot() {
  return loadJson("/api/menu", FALLBACK).then((data) => {
    document.getElementById("menu-list").innerHTML = data.menu.map((item) =>
      '<article class="card"><span class="tag">' + item.course + '</span><h3>' + item.name + '</h3><p class="price">' + item.price + '</p><p class="muted">' + item.note + '</p></article>'
    ).join("");
  });
}
`);
  const server = renderServer(siteName, `const MENU = ${JSON.stringify(menu, null, 2)};
const RESERVATIONS = [];`, `
    if (req.method === "GET" && url.pathname === "/api/menu") {
      return sendJson(res, 200, { menu: MENU });
    }
    if (req.method === "POST" && url.pathname === "/api/reservations") {
      const body = await readJson(req);
      if (!body.name || !body.email || !body.when) return sendJson(res, 400, { error: "Name, email, and time are required." });
      const party = Number(body.party) || 2;
      if (party < 1 || party > 12) return sendJson(res, 400, { error: "Party size must be between 1 and 12." });
      const reservation = { id: "rsv_" + Date.now(), name: String(body.name), email: String(body.email), party, when: String(body.when) };
      RESERVATIONS.push(reservation);
      return sendJson(res, 201, { message: "Table requested for " + reservation.party + ".", reservation });
    }
`);
  return [
    file("src/index.html", html),
    file("src/style.css", shellCss("#e2b657")),
    file("src/app.js", js),
    file("server/server.cjs", server),
    ...projectMeta(siteName, `${siteName} restaurant site with menu and reservations.`),
  ];
}
