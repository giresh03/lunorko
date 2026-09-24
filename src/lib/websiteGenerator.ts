/**
 * Full-stack website generator for the Web Development AI assistant.
 * Blueprints write a previewable client and an Express API under server/.
 */

export type WebsiteBlueprintId = "landing" | "portfolio" | "blog" | "store" | "dashboard";

export interface WebsiteBlueprint {
  id: WebsiteBlueprintId;
  label: string;
  description: string;
  prompt: string;
}

export interface GeneratedFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export interface ProjectTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: ProjectTreeNode[];
  isOpen?: boolean;
}

export interface SiteFeature {
  title: string;
  text: string;
}

export interface SiteItem {
  id: string;
  title: string;
  text: string;
  meta: string;
  image: string;
}

export interface SiteFormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
}

export interface SiteSeed {
  site: {
    blueprint: WebsiteBlueprintId;
    title: string;
    tagline: string;
    description: string;
    accent: string;
    bg: string;
    ink: string;
    heroImage: string;
    featureLabel: string;
    itemLabel: string;
    formTitle: string;
    formAction: string;
    formFields: SiteFormField[];
  };
  features: SiteFeature[];
  items: SiteItem[];
}

export interface GeneratedWebsite {
  blueprintId: WebsiteBlueprintId;
  title: string;
  files: GeneratedFile[];
  assistantMessage: string;
}

export const WEBSITE_PROJECT_PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/site.js",
  "server/index.mjs",
  "server/package.json",
  "server/src/app.mjs",
  "server/src/routes/api.mjs",
  "server/src/data/seed.mjs",
  "server/src/config/db.mjs",
  "README.md",
] as const;

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "landing",
    label: "Landing",
    description: "SaaS marketing page with a lead form",
    prompt: "Build a SaaS landing page website",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Project showcase and contact form",
    prompt: "Build a portfolio website",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Article list backed by an API",
    prompt: "Build a blog website",
  },
  {
    id: "store",
    label: "Store",
    description: "Product catalog and order API",
    prompt: "Build an online store website",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Metrics and activity from the API",
    prompt: "Build a dashboard website",
  },
];

const photo = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export function isWebsiteGenerationRequest(text: string): boolean {
  const value = text.trim().toLowerCase();
  if (!value) return false;

  const isEdit = /\b(fix|debug|change|update|edit|tweak|sticky|bug|header|footer|color|colour)\b/.test(value);
  const isFreshBuild = /\b(build|create|generate|scaffold)\b/.test(value);
  if (isEdit && !isFreshBuild) return false;

  const asksToMake = /\b(build|create|generate|scaffold|make)\b/.test(value);
  if (!asksToMake) return false;

  if (/\b(website|web site|landing page|storefront|homepage)\b/.test(value)) return true;
  if (isFreshBuild && /\b(portfolio|blog|online store|online shop|dashboard|saas)\b/.test(value)) return true;
  return false;
}

export function shouldInlineInPreview(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.startsWith("server/") || normalized.includes("/server/")) return false;
  if (normalized.endsWith(".mjs")) return false;
  return true;
}

export function generateFullStackWebsite(brief: string): GeneratedWebsite {
  const blueprintId = inferBlueprint(brief);
  const seed = buildSeed(blueprintId, brief);
  const files = buildFiles(seed);
  return {
    blueprintId,
    title: seed.site.title,
    files,
    assistantMessage: assistantMessage(seed),
  };
}

export function mergeWebsiteFiles<T extends ProjectTreeNode>(tree: T[], files: GeneratedFile[]): ProjectTreeNode[] {
  const clone = (nodes: ProjectTreeNode[]): ProjectTreeNode[] =>
    nodes.map((node) => ({
      ...node,
      children: node.children ? clone(node.children) : undefined,
    }));

  const next = clone(tree);
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) continue;

    let parentNodes = next;
    let parentId = "";
    for (const folder of parts) {
      const folderId = parentId ? `${parentId}/${folder}` : folder;
      let folderNode = parentNodes.find((node) => node.id === folderId && node.type === "folder");
      if (!folderNode) {
        folderNode = { id: folderId, name: folder, type: "folder", isOpen: true, children: [] };
        parentNodes.push(folderNode);
      } else {
        folderNode.isOpen = true;
        folderNode.children = folderNode.children || [];
      }
      parentNodes = folderNode.children;
      parentId = folderId;
    }

    const existing = parentNodes.find((node) => node.id === file.path);
    if (existing && existing.type === "file") {
      existing.name = fileName;
      existing.language = file.language;
      existing.content = file.content;
    } else if (!existing) {
      parentNodes.push({
        id: file.path,
        name: fileName,
        type: "file",
        language: file.language,
        content: file.content,
      });
    }
  }
  return next;
}

function inferBlueprint(brief: string): WebsiteBlueprintId {
  const value = brief.toLowerCase();
  if (/\b(dashboard|analytics|admin panel|metrics)\b/.test(value)) return "dashboard";
  if (/\b(blog|article|journal|newsletter)\b/.test(value)) return "blog";
  if (/\b(portfolio|case study|photographer|designer)\b/.test(value)) return "portfolio";
  if (/\b(store|shop|product|cart|coffee|cafe|café|restaurant|bakery|menu)\b/.test(value)) return "store";
  return "landing";
}

function buildSeed(blueprintId: WebsiteBlueprintId, brief: string): SiteSeed {
  const base = catalogs(blueprintId);
  const custom = customize(blueprintId, brief);
  const title = siteTitle(brief, custom.site?.title || base.site.title);
  return {
    site: {
      ...base.site,
      ...custom.site,
      blueprint: blueprintId,
      title,
    },
    features: custom.features || base.features,
    items: custom.items || base.items,
  };
}

function siteTitle(brief: string, fallback: string): string {
  const named = brief.match(/\b(?:called|named)\s+["']?([^."'\n]+)/i);
  if (named) {
    const cleaned = cleanTitle(named[1]);
    if (cleaned) return cleaned;
  }
  return fallback;
}

function cleanTitle(value: string): string {
  return value
    .replace(/\b(website|web site|landing page|site|page|app)\b/gi, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function customize(blueprintId: WebsiteBlueprintId, brief: string): Partial<SiteSeed> {
  const value = brief.toLowerCase();
  if (blueprintId === "store" && /\b(coffee|cafe|café)\b/.test(value)) {
    return {
      site: coffeeShop().site,
      features: coffeeShop().features,
      items: coffeeShop().items,
    };
  }
  if (blueprintId === "store" && /\b(restaurant|bakery|menu)\b/.test(value)) {
    return {
      site: restaurant().site,
      features: restaurant().features,
      items: restaurant().items,
    };
  }
  return {};
}

function assistantMessage(seed: SiteSeed): string {
  const files = WEBSITE_PROJECT_PATHS.map((path) => `- \`${path}\``).join("\n");
  return [
    `Generated a full-stack **${seed.site.title}** site (${seed.site.blueprint}).`,
    "",
    "The preview runs `client/` with sample data. The Express API lives in `server/`.",
    "",
    files,
    "",
    "Run the API from the project root:",
    "",
    "`cd server && npm install && npm start`",
    "",
    "Then open http://localhost:3000. `GET /api/health` and `GET /api/content` are live. MongoDB is used only when `MONGODB_URI` is set.",
  ].join("\n");
}

function buildFiles(seed: SiteSeed): GeneratedFile[] {
  const specs: { path: string; language: string; content: string }[] = [
    { path: "client/index.html", language: "html", content: buildHtml(seed) },
    { path: "client/styles.css", language: "css", content: buildCss() },
    { path: "client/site.js", language: "javascript", content: buildClientJs(seed) },
    { path: "server/index.mjs", language: "javascript", content: buildServerEntry() },
    { path: "server/package.json", language: "json", content: buildServerPackage(seed) },
    { path: "server/src/app.mjs", language: "javascript", content: buildApp() },
    { path: "server/src/routes/api.mjs", language: "javascript", content: buildApi(seed) },
    { path: "server/src/data/seed.mjs", language: "javascript", content: buildSeedModule(seed) },
    { path: "server/src/config/db.mjs", language: "javascript", content: buildDb() },
    { path: "README.md", language: "markdown", content: buildReadme(seed) },
  ];

  return specs.map((spec) => ({
    path: spec.path,
    name: spec.path.split("/").pop() || spec.path,
    language: spec.language,
    content: spec.content,
  }));
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJson(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

function slug(value: string): string {
  const next = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return next || "website";
}

function buildHtml(seed: SiteSeed): string {
  const { site, features, items } = seed;
  const featureCards = features
    .map(
      (feature) => `<article class="feature">
        <h3>${esc(feature.title)}</h3>
        <p>${esc(feature.text)}</p>
      </article>`
    )
    .join("\n");
  const itemCards = items
    .map(
      (item) => `<article class="card">
        <img src="${esc(item.image)}" alt="${esc(item.title)}">
        <div class="card-body">
          <p class="meta">${esc(item.meta)}</p>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
          ${
            site.blueprint === "store"
              ? `<button type="button" data-add="${esc(item.id)}">Add to cart</button>`
              : ""
          }
        </div>
      </article>`
    )
    .join("\n");
  const fields = site.formFields
    .map((field) => {
      if (field.type === "textarea") {
        return `<label>${esc(field.label)}<textarea name="${esc(field.name)}" required></textarea></label>`;
      }
      if (field.type === "select") {
        const options = items
          .map((item) => `<option value="${esc(item.id)}">${esc(item.title)}</option>`)
          .join("");
        return `<label>${esc(field.label)}<select name="${esc(field.name)}" required><option value="">Choose</option>${options}</select></label>`;
      }
      return `<label>${esc(field.label)}<input name="${esc(field.name)}" type="${esc(field.type)}" required></label>`;
    })
    .join("\n");
  const cart = site.blueprint === "store" ? `<span class="cart" data-cart-count>0</span>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(site.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-blueprint="${esc(site.blueprint)}" style="--accent:${esc(site.accent)};--bg:${esc(site.bg)};--ink:${esc(site.ink)}">
  <header class="topbar">
    <a class="logo" href="#top">${esc(site.title)}</a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open menu">Menu</button>
    <nav data-nav>
      <a href="#features">${esc(site.featureLabel)}</a>
      <a href="#work">${esc(site.itemLabel)}</a>
      <a href="#contact">Contact</a>
    </nav>
    ${cart}
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="eyebrow" data-api-status>Preview mode · sample data</p>
        <h1>${esc(site.tagline)}</h1>
        <p class="lede">${esc(site.description)}</p>
        <a class="button" href="#contact">${esc(site.formTitle)}</a>
      </div>
      <img src="${esc(site.heroImage)}" alt="">
    </section>
    <section id="features">
      <h2>${esc(site.featureLabel)}</h2>
      <div class="feature-grid">${featureCards}</div>
    </section>
    <section id="work">
      <h2>${esc(site.itemLabel)}</h2>
      <div class="card-grid" data-item-grid>${itemCards}</div>
    </section>
    <section id="contact" class="contact">
      <div>
        <h2>${esc(site.formTitle)}</h2>
        <p>This form posts to <code>${esc(site.formAction)}</code>. In preview it confirms locally when the API is offline.</p>
      </div>
      <form data-contact-form>
        ${fields}
        <button type="submit">Send</button>
        <p class="form-status" data-form-status role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <span>${esc(site.title)}</span>
    <span>© <span data-year>2026</span></span>
  </footer>
  <script src="site.js"></script>
</body>
</html>
`;
}

function buildCss(): string {
  return `* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Outfit, sans-serif;
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
.topbar, .hero, section, footer { width: min(1120px, calc(100% - 32px)); margin-inline: auto; }
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 72px;
  position: sticky;
  top: 0;
  z-index: 2;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
}
.logo { font-family: Fraunces, serif; font-size: 1.25rem; text-decoration: none; }
nav { display: flex; gap: 16px; margin-left: auto; }
nav a { text-decoration: none; font-size: 0.92rem; }
.nav-toggle { display: none; }
.cart {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: white;
  font-size: 0.8rem;
}
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 32px;
  align-items: center;
  padding: 32px 0 16px;
}
.hero img { height: 420px; width: 100%; border-radius: 24px; }
h1, h2, h3 { font-family: Fraunces, serif; line-height: 1.1; margin: 0 0 12px; }
h1 { font-size: clamp(2.4rem, 5vw, 4.6rem); }
h2 { font-size: 2rem; margin-bottom: 18px; }
.eyebrow { letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.75rem; color: var(--accent); }
.lede { font-size: 1.1rem; max-width: 38rem; }
.button, button, .card button {
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: white;
  padding: 12px 18px;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}
section { padding: 28px 0; }
.feature-grid, .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature, .card, form {
  background: color-mix(in srgb, var(--ink) 5%, var(--bg));
  border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
  border-radius: 20px;
}
.feature, .card-body, form { padding: 18px; }
.card img { height: 180px; width: 100%; border-radius: 20px 20px 0 0; }
.meta { color: var(--accent); font-size: 0.85rem; margin: 0 0 6px; }
.contact { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 24px; align-items: start; }
form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; font-size: 0.9rem; }
input, textarea, select {
  width: 100%;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
  background: var(--bg);
  color: var(--ink);
  padding: 10px 12px;
  font: inherit;
}
textarea { min-height: 110px; resize: vertical; }
.form-status { min-height: 1.2em; margin: 0; }
footer { display: flex; justify-content: space-between; padding: 28px 0 40px; opacity: 0.75; }
[data-api-status][data-state="live"] { color: #0f9f6e; }
@media (max-width: 800px) {
  .hero, .feature-grid, .card-grid, .contact { grid-template-columns: 1fr; }
  .hero img { height: 240px; }
  .nav-toggle { display: inline-flex; margin-left: auto; background: transparent; color: var(--ink); border: 1px solid color-mix(in srgb, var(--ink) 20%, transparent); }
  nav { display: none; position: absolute; top: 72px; left: 16px; right: 16px; padding: 12px; flex-direction: column; background: var(--bg); border-radius: 16px; }
  nav.open { display: flex; }
}
`;
}

function buildClientJs(seed: SiteSeed): string {
  return `const SAMPLE = ${safeJson(seed)};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const statusEl = document.querySelector("[data-api-status]");
const yearEl = document.querySelector("[data-year]");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

document.querySelector("[data-nav-toggle]")?.addEventListener("click", () => {
  document.querySelector("[data-nav]")?.classList.toggle("open");
});

async function loadContent() {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) throw new Error("API offline");
    const data = await response.json();
    if (statusEl) {
      statusEl.textContent = "API connected";
      statusEl.dataset.state = "live";
    }
    return data.site ? data : SAMPLE;
  } catch {
    if (statusEl) {
      statusEl.textContent = "Preview mode · sample data";
      statusEl.dataset.state = "preview";
    }
    return SAMPLE;
  }
}

function renderItems(content) {
  const grid = document.querySelector("[data-item-grid]");
  if (!grid || !Array.isArray(content.items)) return;
  const isStore = content.site?.blueprint === "store";
  grid.innerHTML = content.items.map((item) => \`
    <article class="card">
      <img src="\${escapeHtml(item.image)}" alt="\${escapeHtml(item.title)}">
      <div class="card-body">
        <p class="meta">\${escapeHtml(item.meta)}</p>
        <h3>\${escapeHtml(item.title)}</h3>
        <p>\${escapeHtml(item.text)}</p>
        \${isStore ? \`<button type="button" data-add="\${escapeHtml(item.id)}">Add to cart</button>\` : ""}
      </div>
    </article>\`).join("");
}

let cartCount = 0;
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  cartCount += 1;
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = String(cartCount);
});

const form = document.querySelector("[data-contact-form]");
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.querySelector("[data-form-status]");
  const payload = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch(SAMPLE.site.formAction, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Request failed");
    if (status) status.textContent = body.stored ? "Saved to the database." : "Accepted by the API.";
    form.reset();
  } catch {
    if (status) status.textContent = "Saved in preview. Start the server to reach the API.";
  }
});

loadContent().then(renderItems);
`;
}

function buildServerEntry(): string {
  return `import { createApp } from "./src/app.mjs";

const port = Number(process.env.PORT || 3000);
const app = await createApp();

app.listen(port, () => {
  console.log(\`Website server listening on http://localhost:\${port}\`);
});
`;
}

function buildServerPackage(seed: SiteSeed): string {
  return JSON.stringify(
    {
      name: `${slug(seed.site.title)}-server`,
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: {
        start: "node index.mjs",
      },
      dependencies: {
        express: "^4.21.2",
        mongodb: "^6.10.0",
      },
    },
    null,
    2
  ) + "\n";
}

function buildApp(): string {
  return `import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes/api.mjs";
import { connectOptionalDb } from "./config/db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp() {
  const app = express();
  app.use(express.json());
  const db = await connectOptionalDb();
  app.use("/api", apiRouter(db));
  app.use(express.static(path.resolve(__dirname, "../../client")));
  return app;
}
`;
}

function buildDb(): string {
  return `export async function connectOptionalDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  try {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(uri);
    await client.connect();
    return client.db(process.env.MONGODB_DB || "website");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(\`MongoDB skipped: \${message}\`);
    return null;
  }
}
`;
}

function buildSeedModule(seed: SiteSeed): string {
  return `export const seed = ${safeJson(seed)};
`;
}

function buildApi(seed: SiteSeed): string {
  const routes = apiRoutes(seed.site.blueprint);
  return `import express from "express";
import { seed } from "../data/seed.mjs";

export function apiRouter(db) {
  const router = express.Router();

  router.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: seed.site.title,
      blueprint: seed.site.blueprint,
      database: Boolean(db),
    });
  });

  router.get("/content", async (_req, res) => {
    if (db) {
      const doc = await db.collection("content").findOne({ id: "site" });
      if (doc) return res.json(doc);
    }
    res.json(seed);
  });

${routes}
  return router;
}
`;
}

function apiRoutes(blueprint: WebsiteBlueprintId): string {
  if (blueprint === "landing") {
    return `  router.get("/features", (_req, res) => {
    res.json(seed.features);
  });

  router.post("/leads", async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const company = String(req.body?.company || "").trim();
    if (!name || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Name and a valid email are required." });
    }
    if (db) await db.collection("leads").insertOne({ name, email, company, createdAt: new Date() });
    return res.status(201).json({ ok: true, stored: Boolean(db), lead: { name, email, company } });
  });`;
  }
  if (blueprint === "portfolio") {
    return `  router.get("/projects", (_req, res) => {
    res.json(seed.items);
  });

  router.post("/contact", async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const message = String(req.body?.message || "").trim();
    if (!name || !message || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }
    if (db) await db.collection("messages").insertOne({ name, email, message, createdAt: new Date() });
    return res.status(201).json({ ok: true, stored: Boolean(db) });
  });`;
  }
  if (blueprint === "blog") {
    return `  router.get("/posts", (_req, res) => {
    res.json(seed.items);
  });

  router.get("/posts/:slug", (req, res) => {
    const post = seed.items.find((item) => item.id === req.params.slug);
    if (!post) return res.status(404).json({ error: "Post not found." });
    return res.json(post);
  });

  router.post("/posts", async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const message = String(req.body?.message || "").trim();
    if (!name || !message || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }
    if (db) await db.collection("pitches").insertOne({ name, email, message, createdAt: new Date() });
    return res.status(201).json({ ok: true, stored: Boolean(db) });
  });`;
  }
  if (blueprint === "store") {
    return `  router.get("/products", (_req, res) => {
    res.json(seed.items);
  });

  router.post("/orders", async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const itemId = String(req.body?.itemId || "").trim();
    const item = seed.items.find((entry) => entry.id === itemId);
    if (!name || !item || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Name, email, and a known item are required." });
    }
    if (db) await db.collection("orders").insertOne({ name, email, itemId, createdAt: new Date() });
    return res.status(201).json({ ok: true, stored: Boolean(db), order: { name, email, itemId } });
  });`;
  }
  return `  router.get("/metrics", (_req, res) => {
    res.json(seed.features);
  });

  router.get("/activity", (_req, res) => {
    res.json(seed.items);
  });

  router.post("/notes", async (req, res) => {
    const note = String(req.body?.note || "").trim();
    if (!note) return res.status(400).json({ error: "A note is required." });
    if (db) await db.collection("notes").insertOne({ note, createdAt: new Date() });
    return res.status(201).json({ ok: true, stored: Boolean(db), note });
  });`;
}

function buildReadme(seed: SiteSeed): string {
  return `# ${seed.site.title}

Full-stack ${seed.site.blueprint} site generated by the Web Development assistant.

## Preview

Open \`client/index.html\` in the editor preview. The page renders sample data immediately. \`client/site.js\` calls \`/api/content\` and keeps the sample data if the API is offline.

## API

\`\`\`bash
cd server
npm install
npm start
\`\`\`

The server listens on http://localhost:3000 and serves the client plus:

- \`GET /api/health\`
- \`GET /api/content\`
- \`${seed.site.formAction}\`

MongoDB is optional. Set \`MONGODB_URI\` (and optionally \`MONGODB_DB\`) before \`npm start\` to store form submissions. Without it, the API still responds from \`server/src/data/seed.mjs\`.
`;
}

const contactFields: SiteFormField[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "message", label: "Message", type: "textarea" },
];

function catalogs(id: WebsiteBlueprintId): SiteSeed {
  if (id === "portfolio") return portfolio();
  if (id === "blog") return blog();
  if (id === "store") return shop();
  if (id === "dashboard") return dashboard();
  return landing();
}

function landing(): SiteSeed {
  return {
    site: {
      blueprint: "landing",
      title: "Northstar",
      tagline: "Ship the work that matters this week.",
      description: "Northstar is a planning studio for small product teams. Capture goals, assign owners, and review progress without another noisy workspace.",
      accent: "#0f6e56",
      bg: "#f4f7f5",
      ink: "#14211c",
      heroImage: photo("photo-1553877522-43269d4ea984", 1400, 1000),
      featureLabel: "Product",
      itemLabel: "Plans",
      formTitle: "Request a walkthrough",
      formAction: "/api/leads",
      formFields: [
        { name: "name", label: "Name", type: "text" },
        { name: "email", label: "Work email", type: "email" },
        { name: "company", label: "Company", type: "text" },
      ],
    },
    features: [
      { title: "Weekly plan", text: "Turn a messy backlog into three outcomes the team can finish." },
      { title: "Shared owners", text: "Every outcome has one person and a visible due date." },
      { title: "Friday review", text: "Close the week with what shipped, what slipped, and why." },
    ],
    items: [
      { id: "starter", title: "Starter", text: "For a single squad finding a calmer rhythm.", meta: "$0", image: photo("photo-1552664730-d307ca884978") },
      { id: "team", title: "Team", text: "Shared boards, reviews, and guest stakeholders.", meta: "$18 / seat", image: photo("photo-1600880292203-757bb62b4baf") },
      { id: "studio", title: "Studio", text: "SSO, audit history, and a private workspace.", meta: "$42 / seat", image: photo("photo-1553877522-43269d4ea984") },
    ],
  };
}

function portfolio(): SiteSeed {
  return {
    site: {
      blueprint: "portfolio",
      title: "Mira Chen Studio",
      tagline: "Product design for tools people keep open.",
      description: "I design calm interfaces for operational software. Selected work covers research, interface systems, and the handoff that engineers can build.",
      accent: "#9a3412",
      bg: "#fbf7f2",
      ink: "#2a211c",
      heroImage: photo("photo-1498050108023-c5249f4df085", 1400, 1000),
      featureLabel: "Focus",
      itemLabel: "Selected work",
      formTitle: "Start a project",
      formAction: "/api/contact",
      formFields: contactFields,
    },
    features: [
      { title: "Research", text: "Field interviews and task maps before a single screen." },
      { title: "Interface", text: "Systems that stay readable at 8am and after a long incident." },
      { title: "Handoff", text: "Specs, states, and empty views written for the people building them." },
    ],
    items: [
      { id: "ledger", title: "Ledger", text: "A billing console that made failed payments obvious.", meta: "Fintech", image: photo("photo-1555066931-4365d14bab8c") },
      { id: "field", title: "Field Notes", text: "A mobile log for technicians who work offline.", meta: "Operations", image: photo("photo-1517694712202-14dd9538aa97") },
      { id: "atlas", title: "Atlas", text: "A map of classroom programs for a city nonprofit.", meta: "Education", image: photo("photo-1503676260728-1c00da094a0b") },
    ],
  };
}

function blog(): SiteSeed {
  return {
    site: {
      blueprint: "blog",
      title: "Field Notes",
      tagline: "Notes on growing food in small city spaces.",
      description: "Essays and practical logs about balconies, courtyards, and the containers that actually survive a hot week.",
      accent: "#3f6212",
      bg: "#f7f8f2",
      ink: "#1c2414",
      heroImage: photo("photo-1469474968028-56623f02e42e", 1400, 1000),
      featureLabel: "Topics",
      itemLabel: "Latest posts",
      formTitle: "Pitch a note",
      formAction: "/api/posts",
      formFields: contactFields,
    },
    features: [
      { title: "Balconies", text: "Light, wind, and what to skip above the third floor." },
      { title: "Soil", text: "Mixes that drain fast and still hold water through lunch." },
      { title: "Harvest", text: "What to pick early so the plant keeps producing." },
    ],
    items: [
      { id: "shade-herbs", title: "Herbs that tolerate shade", text: "Mint, parsley, and chives for a north-facing rail.", meta: "12 min", image: photo("photo-1441974231531-c6227db76b6e") },
      { id: "watering", title: "A watering log that sticks", text: "One column for the plant, one for the day, nothing else.", meta: "7 min", image: photo("photo-1470071459604-3b5ec3a7fe05") },
      { id: "tomatoes", title: "Tomatoes in a 12-inch pot", text: "Support, pruning, and the week the fruit finally colors.", meta: "9 min", image: photo("photo-1501854140801-50d01698950b") },
    ],
  };
}

function shop(): SiteSeed {
  return {
    site: {
      blueprint: "store",
      title: "Kiln & Co",
      tagline: "Handmade ceramics for slow mornings.",
      description: "Small-batch cups, bowls, and sets fired in a neighborhood kiln. Orders are confirmed by the shop API.",
      accent: "#9f1239",
      bg: "#fbf6f4",
      ink: "#2b1618",
      heroImage: photo("photo-1441986300917-64674bd600d8", 1400, 1000),
      featureLabel: "The shop",
      itemLabel: "Featured pieces",
      formTitle: "Place an order",
      formAction: "/api/orders",
      formFields: [
        { name: "name", label: "Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "itemId", label: "Piece", type: "select" },
      ],
    },
    features: [
      { title: "Small batches", text: "Each firing is numbered. When a glaze runs out, it is gone." },
      { title: "Food safe", text: "Glazes are tested for daily coffee, tea, and soup." },
      { title: "Local pickup", text: "Orders can be collected from the studio on Saturdays." },
    ],
    items: [
      { id: "mug", title: "Stoneware mug", text: "A 10oz cup with a satin white glaze.", meta: "$32", image: photo("photo-1556742049-0cfed4f6a45d") },
      { id: "bowl", title: "Breakfast bowl", text: "Wide enough for oats, fruit, and a spoon.", meta: "$48", image: photo("photo-1483985988355-763728e1935b") },
      { id: "set", title: "Pour-over set", text: "Dripper and server, sold as a pair.", meta: "$86", image: photo("photo-1607082348824-0a96f2a4b9da") },
    ],
  };
}

function coffeeShop(): SiteSeed {
  const base = shop();
  return {
    ...base,
    site: {
      ...base.site,
      title: "Harbor Coffee",
      tagline: "A neighborhood counter for unhurried cups.",
      description: "Espresso, seasonal drinks, and a short pastry list. The menu is served by the shop API and still readable in preview.",
      heroImage: photo("photo-1504674900247-0877df9cc836", 1400, 1000),
      featureLabel: "The counter",
      itemLabel: "Menu",
      formTitle: "Order ahead",
    },
    features: [
      { title: "Single origin", text: "One espresso this month, labeled with the farm and roast date." },
      { title: "House milk", text: "Oat and dairy, steamed the same way for every drink." },
      { title: "Window seats", text: "Six seats, no laptops before noon on weekends." },
    ],
    items: [
      { id: "espresso", title: "Espresso", text: "A short shot pulled for the morning rush.", meta: "$4", image: photo("photo-1504674900247-0877df9cc836") },
      { id: "latte", title: "Cardamom latte", text: "Espresso, steamed milk, and cracked cardamom.", meta: "$6", image: photo("photo-1414235077428-338989a2e8c0") },
      { id: "mocha", title: "Oat mocha", text: "Cocoa and oat milk, finished with a pinch of salt.", meta: "$6", image: photo("photo-1565299624946-b28f40a0ae38") },
    ],
  };
}

function restaurant(): SiteSeed {
  const base = shop();
  return {
    ...base,
    site: {
      ...base.site,
      title: "Harbor & Rye",
      tagline: "Supper, bread, and a short wine list.",
      description: "A neighborhood dining room. The menu on this page is the same data the API returns.",
      heroImage: photo("photo-1414235077428-338989a2e8c0", 1400, 1000),
      featureLabel: "The room",
      itemLabel: "Tonight",
      formTitle: "Request a table",
      formAction: "/api/orders",
    },
    features: [
      { title: "Wood fire", text: "Vegetables and bread come off the same oven." },
      { title: "Short menu", text: "Three plates at dinner so the kitchen can cook them well." },
      { title: "Walk-ins", text: "The counter is held for guests without a booking." },
    ],
    items: [
      { id: "bread", title: "Rye loaf", text: "Warm, with cultured butter.", meta: "$9", image: photo("photo-1476224203421-9ac39bcb3327") },
      { id: "greens", title: "Charred greens", text: "Lemon, chili, and toasted seeds.", meta: "$16", image: photo("photo-1555396273-367ea4eb4db5") },
      { id: "fish", title: "Market fish", text: "The catch, browned butter, and fennel.", meta: "$32", image: photo("photo-1414235077428-338989a2e8c0") },
    ],
  };
}

function dashboard(): SiteSeed {
  return {
    site: {
      blueprint: "dashboard",
      title: "Ops Board",
      tagline: "What the service is doing right now.",
      description: "A compact board for signups, conversion, uptime, and the latest operational notes.",
      accent: "#1d4ed8",
      bg: "#f5f7fb",
      ink: "#0f172a",
      heroImage: photo("photo-1461749280684-dccba630e2f6", 1400, 1000),
      featureLabel: "Metrics",
      itemLabel: "Activity",
      formTitle: "Add a note",
      formAction: "/api/notes",
      formFields: [{ name: "note", label: "Note", type: "textarea" }],
    },
    features: [
      { title: "Active users", text: "1,284 people used the product in the last day." },
      { title: "Conversion", text: "4.8% of trials started a paid workspace." },
      { title: "Uptime", text: "99.95% over the last 30 days." },
    ],
    items: [
      { id: "deploy", title: "Deploy finished", text: "Release 2.4 reached production.", meta: "2m ago", image: photo("photo-1461749280684-dccba630e2f6") },
      { id: "ticket", title: "Ticket opened", text: "Checkout latency crossed 800ms.", meta: "18m ago", image: photo("photo-1555066931-4365d14bab8c") },
      { id: "note", title: "On-call note", text: "Database failover was rehearsed.", meta: "1h ago", image: photo("photo-1518770660439-4636190af475") },
    ],
  };
}
