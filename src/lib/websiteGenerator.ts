/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a vanilla HTML/CSS/JS client (live preview) and an Express API.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "store" | "dashboard";

export interface WebsiteSpec {
  name: string;
  kind: WebsiteKind;
  tagline?: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  spec: Required<WebsiteSpec>;
  files: GeneratedFile[];
}

export interface GeneratorFileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: GeneratorFileNode[];
  isOpen?: boolean;
}

export const WEBSITE_KINDS: { id: WebsiteKind; label: string; hint: string }[] = [
  { id: "landing", label: "Landing", hint: "Hero, pricing, contact" },
  { id: "portfolio", label: "Portfolio", hint: "Projects and skills" },
  { id: "blog", label: "Blog", hint: "Posts and newsletter" },
  { id: "store", label: "Store", hint: "Catalog and orders" },
  { id: "dashboard", label: "Dashboard", hint: "Stats and activity" },
];

interface Feature { title: string; body: string }
interface Plan { name: string; price: string; detail: string }
interface Project { title: string; body: string; tag: string }
interface Post { title: string; excerpt: string; tag: string }
interface Product { name: string; price: number; blurb: string }
interface Stat { label: string; value: string }
interface Activity { who: string; action: string; when: string }

interface SiteContent {
  features: Feature[];
  plans: Plan[];
  projects: Project[];
  skills: string[];
  posts: Post[];
  products: Product[];
  stats: Stat[];
  activity: Activity[];
}

const DEFAULT_NAMES: Record<WebsiteKind, string> = {
  landing: "Harbor",
  portfolio: "Studio North",
  blog: "Field Notes",
  store: "Corner Market",
  dashboard: "Pulse",
};

const DEFAULT_TAGLINES: Record<WebsiteKind, string> = {
  landing: "A clear story, a fast page, and an API that accepts real leads.",
  portfolio: "Selected work, the skills behind it, and a way to get in touch.",
  blog: "Short essays with an API for every post and subscriber.",
  store: "A small catalog, a cart, and an order endpoint.",
  dashboard: "Stats and activity served by the Express API.",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

export function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

function contentFor(kind: WebsiteKind, name: string): SiteContent {
  return {
    features: [
      { title: "Fast pages", body: `${name} ships a static client you can preview in the editor.` },
      { title: "Real API", body: "Express routes accept JSON and answer with the same seed data." },
      { title: "Ready to extend", body: "Add a page or a route without replacing the project." },
    ],
    plans: [
      { name: "Starter", price: "$0", detail: "Preview, one page, and the health check." },
      { name: "Studio", price: "$19", detail: "Custom sections and the lead form." },
      { name: "Launch", price: "$49", detail: "API, static hosting, and a README to run it." },
    ],
    projects: [
      { title: "Atlas Map", body: "Interactive map of neighborhood studios.", tag: "Frontend" },
      { title: "Ledger", body: "Invoice list backed by a JSON API.", tag: "Full stack" },
      { title: "Signal", body: "Status page with live health checks.", tag: "API" },
    ],
    skills: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "REST"],
    posts: [
      { title: `Why ${name} ships small`, excerpt: "A short site with one API is easier to finish than a framework demo.", tag: "Process" },
      { title: "Designing the first fold", excerpt: "Headline, proof, and a single action beat a long menu.", tag: "Design" },
      { title: "What the API should return", excerpt: "Health, content, and one write endpoint cover the first version.", tag: "Backend" },
    ],
    products: [
      { name: "Ceramic Cup", price: 24, blurb: "Speckled glaze, 8 oz." },
      { name: "Linen Tote", price: 32, blurb: "Natural canvas, one pocket." },
      { name: "Notebook", price: 16, blurb: "Plain pages, thread bound." },
      { name: "Desk Lamp", price: 68, blurb: "Warm LED, brass arm." },
    ],
    stats: [
      { label: "Visitors", value: "1,284" },
      { label: "Signups", value: "96" },
      { label: "Orders", value: kind === "store" ? "18" : "42" },
      { label: "Uptime", value: "99.9%" },
    ],
    activity: [
      { who: "Amina", action: "published a page", when: "2m ago" },
      { who: "Leo", action: "submitted the contact form", when: "18m ago" },
      { who: "API", action: "answered /api/health", when: "1h ago" },
    ],
  };
}

function jsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function layout(spec: Required<WebsiteSpec>, main: string, endpoint: string): string {
  const safeName = escapeHtml(spec.name);
  const safeTagline = escapeHtml(spec.tagline);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed data-kind="${spec.kind}">
  <header class="site-header">
    <a class="logo" href="#top">${safeName}</a>
    <button class="nav-toggle" type="button" aria-label="Open menu">Menu</button>
    <nav class="nav-links">
      <a href="#story">Story</a>
      <a href="#work">Work</a>
      <a href="#contact">Contact</a>
    </nav>
    <span id="api-status" class="status">Preview data</span>
  </header>
  <main id="top">
    <section class="hero" id="story">
      <p class="eyebrow">${escapeHtml(spec.kind)}</p>
      <h1>${safeName}</h1>
      <p class="lede">${safeTagline}</p>
      <div class="hero-actions">
        <a class="button" href="#work">See the work</a>
        <a class="button button-quiet" href="#contact">Talk to us</a>
      </div>
    </section>
    ${main}
    <section class="panel" id="contact">
      <h2>Start a conversation</h2>
      <p class="muted">This form posts to <code>${endpoint}</code>. In the editor preview it falls back to the embedded seed.</p>
      <form id="site-form" data-endpoint="${endpoint}">
        <label>Name<input name="name" required placeholder="Your name" /></label>
        <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
        <label>Message<textarea name="message" rows="4" placeholder="What should we build?"></textarea></label>
        <button class="button" type="submit">Send</button>
        <p id="form-status" class="muted" role="status"></p>
      </form>
    </section>
  </main>
  <footer class="site-footer">
    <span>${safeName}</span>
    <span>Client in <code>client/</code> · API in <code>server/</code></span>
  </footer>
  <script id="site-seed" type="application/json">${jsonForHtml({ site: spec, content: contentFor(spec.kind, spec.name) })}</script>
  <script src="site.js"></script>
</body>
</html>
`;
}

function sectionHtml(spec: Required<WebsiteSpec>, content: SiteContent): { html: string; endpoint: string } {
  if (spec.kind === "portfolio") {
    const projects = content.projects.map((project) => `
      <article class="card">
        <p class="tag">${escapeHtml(project.tag)}</p>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.body)}</p>
      </article>`).join("");
    const skills = content.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("");
    return {
      endpoint: "/api/leads",
      html: `<section class="panel" id="work">
        <h2>Selected work</h2>
        <div class="grid">${projects}</div>
        <h2>Skills</h2>
        <ul class="chips">${skills}</ul>
      </section>`,
    };
  }

  if (spec.kind === "blog") {
    const posts = content.posts.map((post) => `
      <article class="card">
        <p class="tag">${escapeHtml(post.tag)}</p>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
      </article>`).join("");
    return {
      endpoint: "/api/subscribe",
      html: `<section class="panel" id="work">
        <h2>Latest notes</h2>
        <div class="grid">${posts}</div>
      </section>`,
    };
  }

  if (spec.kind === "store") {
    const products = content.products.map((product) => `
      <article class="card">
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.blurb)}</p>
        <div class="card-row">
          <strong>$${product.price}</strong>
          <button type="button" class="button button-quiet" data-product="${escapeHtml(product.name)}" data-price="${product.price}">Add</button>
        </div>
      </article>`).join("");
    return {
      endpoint: "/api/orders",
      html: `<section class="panel" id="work">
        <div class="section-head">
          <h2>Catalog</h2>
          <p class="muted">Cart <strong id="cart-count">0</strong></p>
        </div>
        <div class="grid">${products}</div>
        <ul id="cart-list" class="cart-list"></ul>
      </section>`,
    };
  }

  if (spec.kind === "dashboard") {
    const stats = content.stats.map((stat) => `
      <article class="card stat">
        <p class="muted">${escapeHtml(stat.label)}</p>
        <strong>${escapeHtml(stat.value)}</strong>
      </article>`).join("");
    const rows = content.activity.map((item) => `
      <tr>
        <td>${escapeHtml(item.who)}</td>
        <td>${escapeHtml(item.action)}</td>
        <td>${escapeHtml(item.when)}</td>
      </tr>`).join("");
    return {
      endpoint: "/api/leads",
      html: `<section class="panel" id="work">
        <div class="section-head">
          <h2>Overview</h2>
          <div class="view-switch">
            <button type="button" class="button button-quiet" data-panel="overview">Overview</button>
            <button type="button" class="button button-quiet" data-panel="activity">Activity</button>
          </div>
        </div>
        <div class="grid" data-panel-view="overview">${stats}</div>
        <div data-panel-view="activity" hidden>
          <table class="activity">
            <thead><tr><th>Who</th><th>Action</th><th>When</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>`,
    };
  }

  const features = content.features.map((feature) => `
    <article class="card">
      <h3>${escapeHtml(feature.title)}</h3>
      <p>${escapeHtml(feature.body)}</p>
    </article>`).join("");
  const plans = content.plans.map((plan) => `
    <article class="card">
      <p class="tag">${escapeHtml(plan.name)}</p>
      <h3>${escapeHtml(plan.price)}</h3>
      <p>${escapeHtml(plan.detail)}</p>
    </article>`).join("");
  return {
    endpoint: "/api/leads",
    html: `<section class="panel" id="work">
      <h2>What you get</h2>
      <div class="grid">${features}</div>
      <h2>Plans</h2>
      <div class="grid">${plans}</div>
    </section>`,
  };
}

const STYLES = `* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #0b1020;
  color: #e8eefc;
  line-height: 1.5;
}
a { color: inherit; text-decoration: none; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85em; color: #9af6d8; }
.site-header, .site-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 7vw;
}
.site-header { position: sticky; top: 0; background: rgba(11, 16, 32, 0.92); border-bottom: 1px solid #243049; }
.logo { font-weight: 700; letter-spacing: 0.02em; }
.nav-links { display: flex; gap: 16px; margin-left: auto; color: #b7c3de; }
.nav-toggle { display: none; margin-left: auto; background: transparent; color: inherit; border: 1px solid #243049; border-radius: 999px; padding: 6px 12px; }
.status { font-size: 12px; color: #8ea0c5; border: 1px solid #243049; border-radius: 999px; padding: 4px 10px; }
.status.live { color: #3ee0b0; border-color: #1d6b56; }
main { padding: 0 7vw 64px; }
.hero { padding: 72px 0 32px; max-width: 720px; }
.eyebrow { text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: #3ee0b0; margin: 0 0 12px; }
h1 { font-size: clamp(40px, 6vw, 68px); line-height: 0.95; margin: 0 0 16px; }
h2 { margin: 28px 0 12px; font-size: 22px; }
.lede, .muted { color: #b7c3de; }
.hero-actions, .card-row, .section-head, .view-switch { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.section-head { justify-content: space-between; }
.button {
  display: inline-flex;
  align-items: center;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: #3ee0b0;
  color: #06281f;
  font-weight: 600;
  cursor: pointer;
}
.button-quiet { background: transparent; color: #e8eefc; border: 1px solid #243049; }
.panel { margin-top: 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
.card, form, .activity {
  background: #141a2e;
  border: 1px solid #243049;
  border-radius: 16px;
  padding: 16px;
}
.card h3, .stat strong { margin: 4px 0; font-size: 22px; }
.tag { color: #3ee0b0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }
.chips li { border: 1px solid #243049; border-radius: 999px; padding: 6px 12px; }
form { display: grid; gap: 12px; max-width: 560px; }
label { display: grid; gap: 6px; font-size: 14px; color: #b7c3de; }
input, textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #243049;
  background: #0b1020;
  color: #e8eefc;
  padding: 10px 12px;
  font: inherit;
}
.activity { width: 100%; border-collapse: collapse; }
.activity th, .activity td { text-align: left; padding: 8px; border-bottom: 1px solid #243049; }
.cart-list { padding-left: 18px; color: #b7c3de; }
.site-footer { border-top: 1px solid #243049; color: #8ea0c5; justify-content: space-between; }
@media (max-width: 720px) {
  .nav-toggle { display: inline-flex; }
  .nav-links { display: none; width: 100%; flex-direction: column; margin: 8px 0 0; }
  .nav-links.open { display: flex; }
  .site-header { flex-wrap: wrap; }
}
`;

const CLIENT_SCRIPT = `const seedNode = document.getElementById("site-seed");
const seed = seedNode ? JSON.parse(seedNode.textContent || "{}") : { site: {}, content: {} };
const status = document.getElementById("api-status");
const formStatus = document.getElementById("form-status");
const cart = [];

document.querySelector(".nav-toggle")?.addEventListener("click", () => {
  document.querySelector(".nav-links")?.classList.toggle("open");
});

document.querySelectorAll("[data-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.getAttribute("data-panel");
    document.querySelectorAll("[data-panel-view]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-panel-view") !== name;
    });
  });
});

function renderCart() {
  const count = document.getElementById("cart-count");
  const list = document.getElementById("cart-list");
  if (count) count.textContent = String(cart.length);
  if (list) {
    list.innerHTML = cart.map((item) => "<li>" + item.name + " — $" + item.price + "</li>").join("");
  }
}

document.querySelectorAll("[data-product]").forEach((button) => {
  button.addEventListener("click", () => {
    cart.push({
      name: button.getAttribute("data-product"),
      price: Number(button.getAttribute("data-price") || 0),
    });
    renderCart();
  });
});

async function api(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

api("/api/health")
  .then(() => {
    if (status) {
      status.textContent = "API connected";
      status.classList.add("live");
    }
  })
  .catch(() => {
    if (status) status.textContent = "Preview data";
  });

document.getElementById("site-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  if (cart.length) data.items = cart.map((item) => item.name + " ($" + item.price + ")");
  const endpoint = form.getAttribute("data-endpoint") || "/api/leads";
  try {
    await api(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (formStatus) formStatus.textContent = "Saved by the API.";
  } catch {
    if (formStatus) formStatus.textContent = "Saved in this preview for " + (seed.site?.name || "the site") + ". Start the server to persist it.";
  }
  form.reset();
});
`;

function serverPackage(name: string): string {
  return JSON.stringify({
    name: `${slugify(name)}-api`,
    private: true,
    type: "module",
    scripts: {
      start: "node index.js",
      dev: "node --watch index.js",
    },
    dependencies: {
      cors: "^2.8.5",
      express: "^4.21.2",
    },
  }, null, 2) + "\n";
}

function rootPackage(name: string): string {
  return JSON.stringify({
    name: slugify(name),
    private: true,
    description: `${name} full-stack website generated by Lunor.AI`,
    scripts: {
      start: "npm start --prefix server",
      "install:api": "npm install --prefix server",
    },
  }, null, 2) + "\n";
}

function serverApp(): string {
  return `import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { router } from "./routes.js";

const app = express();
const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client");

app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(express.static(clientDir));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

export default app;
`;
}

function serverIndex(): string {
  return `import app from "./src/app.js";

const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log("Site and API on http://localhost:" + port);
});
`;
}

function serverData(spec: Required<WebsiteSpec>): string {
  const payload = {
    site: spec,
    content: contentFor(spec.kind, spec.name),
  };
  return `export const site = ${JSON.stringify(payload.site, null, 2)};

export const content = ${JSON.stringify(payload.content, null, 2)};
`;
}

function serverRoutes(kind: WebsiteKind): string {
  const writeRoute = kind === "store"
    ? `router.post("/orders", (req, res) => {
  const { name, email, message, items } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "Email is required" });
  res.status(201).json({
    ok: true,
    order: { name, email, message, items: items ?? [], receivedAt: new Date().toISOString() },
  });
});`
    : kind === "blog"
      ? `router.post("/subscribe", (req, res) => {
  const { email, name, message } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "Email is required" });
  res.status(201).json({
    ok: true,
    subscriber: { email, name, message, receivedAt: new Date().toISOString() },
  });
});`
      : `router.post("/leads", (req, res) => {
  const { name, email, message } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "Email is required" });
  res.status(201).json({
    ok: true,
    lead: { name, email, message, receivedAt: new Date().toISOString() },
  });
});`;

  return `import { Router } from "express";
import { site, content } from "./data.js";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: site.name, kind: site.kind });
});

router.get("/site", (_req, res) => {
  res.json(site);
});

router.get("/content", (_req, res) => {
  res.json(content);
});

${writeRoute}
`;
}

function readme(spec: Required<WebsiteSpec>): string {
  return `# ${spec.name}

${spec.tagline}

Full-stack website generated for the Web Development assistant.

## Files

- \`client/index.html\`, \`client/styles.css\`, \`client/site.js\` — the site
- \`server/index.js\` — starts Express
- \`server/src/app.js\` — static client plus \`/api\`
- \`server/src/routes.js\` — health, content, and the write endpoint
- \`server/src/data.js\` — seed content shared with the page

## Run the API and the site

\`\`\`bash
npm run install:api
npm start
\`\`\`

Open http://localhost:5000. The page calls \`/api/health\`. When the server is up, the header switches to **API connected**.
`;
}

export function normalizeWebsiteSpec(spec: WebsiteSpec): Required<WebsiteSpec> {
  const kind = WEBSITE_KINDS.some((item) => item.id === spec.kind) ? spec.kind : "landing";
  const name = spec.name.trim() || DEFAULT_NAMES[kind];
  const tagline = spec.tagline?.trim() || DEFAULT_TAGLINES[kind];
  return { name, kind, tagline };
}

export function generateFullStackWebsite(input: WebsiteSpec): GeneratedWebsite {
  const spec = normalizeWebsiteSpec(input);
  const content = contentFor(spec.kind, spec.name);
  const section = sectionHtml(spec, content);

  const files: GeneratedFile[] = [
    { path: "README.md", language: "markdown", content: readme(spec) },
    { path: "package.json", language: "json", content: rootPackage(spec.name) },
    { path: ".env.example", language: "plaintext", content: "PORT=5000\n" },
    { path: "client/index.html", language: "html", content: layout(spec, section.html, section.endpoint) },
    { path: "client/styles.css", language: "css", content: STYLES },
    { path: "client/site.js", language: "javascript", content: CLIENT_SCRIPT },
    { path: "server/package.json", language: "json", content: serverPackage(spec.name) },
    { path: "server/index.js", language: "javascript", content: serverIndex() },
    { path: "server/src/app.js", language: "javascript", content: serverApp() },
    { path: "server/src/data.js", language: "javascript", content: serverData(spec) },
    { path: "server/src/routes.js", language: "javascript", content: serverRoutes(spec.kind) },
  ];

  return { spec, files };
}

export function filesToTree(files: GeneratedFile[]): GeneratorFileNode[] {
  const root: GeneratorFileNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let level = root;
    let accumulated = "";
    parts.forEach((part, index) => {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const isFile = index === parts.length - 1;
      if (isFile) {
        level.push({
          id: accumulated,
          name: part,
          type: "file",
          language: file.language,
          content: file.content,
        });
        return;
      }
      let folder = level.find((node) => node.type === "folder" && node.name === part);
      if (!folder) {
        folder = { id: accumulated, name: part, type: "folder", isOpen: true, children: [] };
        level.push(folder);
      }
      level = folder.children ?? [];
    });
  }

  return root;
}

export function formatWebsiteSummary(site: GeneratedWebsite): string {
  const files = site.files.map((file) => `- \`${file.path}\``).join("\n");
  return `Generated the **${site.spec.kind}** website **${site.spec.name}** and loaded it into the editor.

${site.spec.tagline}

The preview opens \`client/index.html\`. The Express API lives in \`server/\` and serves that client plus \`/api/health\`, \`/api/content\`, and the form endpoint.

\`\`\`bash
npm run install:api
npm start
\`\`\`

${files}`;
}

export function formatWebsiteBundle(prompt: string): string | null {
  const spec = detectWebsiteRequest(prompt);
  if (!spec) return null;
  const site = generateFullStackWebsite(spec);
  const sources = site.files
    .filter((file) => /\.(html|css|js|md)$/.test(file.path))
    .map((file) => {
      const lang = file.language === "javascript" ? "js" : file.language === "markdown" ? "md" : file.language;
      return `**${file.path}**\n\`\`\`${lang}\n${file.content.trim()}\n\`\`\``;
    })
    .join("\n\n");
  return `${formatWebsiteSummary(site)}\n\n${sources}`;
}

export function detectWebsiteRequest(prompt: string): WebsiteSpec | null {
  const text = prompt.trim();
  if (!text) return null;
  const asksToBuild = /\b(build|create|generate|make|scaffold|design)\b/i.test(text);
  const asksForSite = /\b(full[\s-]?stack|mern|website|web\s*site|landing page|portfolio|online store|e-?commerce|blog|dashboard)\b/i.test(text);
  if (!asksToBuild || !asksForSite) return null;
  if (/\b(debug|fix|error|bug|explain|refactor)\b/i.test(text) && !/\b(build|create|generate|scaffold)\b/i.test(text)) {
    return null;
  }

  let kind: WebsiteKind = "landing";
  if (/\bportfolio\b/i.test(text)) kind = "portfolio";
  else if (/\bblog\b/i.test(text)) kind = "blog";
  else if (/\b(store|shop|e-?commerce|catalog)\b/i.test(text)) kind = "store";
  else if (/\bdashboard\b/i.test(text)) kind = "dashboard";

  const quoted = text.match(/["“]([^"”]{2,60})["”]/);
  const named = text.match(/\b(?:called|named|for)\s+["']?([A-Za-z0-9][^"'\n]{1,48}?)["']?(?=\s+(?:website|site|app|page)\b|$)/i);
  const rawName = (quoted?.[1] || named?.[1] || "").replace(/\b(website|site|app|page)\b/gi, "").trim();
  const name = rawName || DEFAULT_NAMES[kind];
  return { name, kind, tagline: DEFAULT_TAGLINES[kind] };
}
