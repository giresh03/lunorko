/**
 * Full-stack website generator for the Web Development AI assistant.
 * Each blueprint is real client + Express code. The browser preview uses the
 * client files directly; `npm start` serves the same client from the API.
 */

export interface WebsiteFile {
  path: string;
  language: string;
  content: string;
}

export interface WebsiteBlueprintInfo {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  defaultName: string;
  keywords: string[];
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

export interface GeneratedWebsite {
  id: string;
  name: string;
  siteName: string;
  summary: string;
  previewFile: string;
  files: WebsiteFile[];
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprintInfo[] = [
  {
    id: "saas",
    label: "SaaS landing",
    icon: "✦",
    blurb: "Marketing site + lead API",
    defaultName: "Lumen",
    keywords: ["saas", "landing", "startup", "pricing", "waitlist", "software"],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: "◈",
    blurb: "Projects API + contact form",
    defaultName: "Ada Moreau",
    keywords: ["portfolio", "personal", "freelancer", "resume", "designer", "developer"],
  },
  {
    id: "blog",
    label: "Blog",
    icon: "✎",
    blurb: "Posts API + article view",
    defaultName: "Field Notes",
    keywords: ["blog", "article", "magazine", "newsletter", "journal", "posts"],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    blurb: "Menu API + reservations",
    defaultName: "Hearth & Rye",
    keywords: ["restaurant", "cafe", "café", "coffee", "menu", "food", "reservation", "bakery"],
  },
  {
    id: "store",
    label: "Online store",
    icon: "🛍️",
    blurb: "Catalog API + checkout",
    defaultName: "Northwind",
    keywords: ["store", "shop", "ecommerce", "e-commerce", "product", "cart", "checkout", "boutique"],
  },
];

const BUILD_VERBS = /\b(build|create|make|generate|design|scaffold|code|spin|start)\b/i;
const SITE_WORDS = /\b(website|web\s*site|landing\s*page|full[\s-]?stack)\b/i;
const NICHE_SITE = /\b(portfolio|blog|restaurant|cafe|café|coffee\s*shop|online\s*store|e-?commerce|saas)\b/i;

export function isWebsiteGenerationRequest(prompt: string): boolean {
  const text = prompt.trim();
  if (!text || !BUILD_VERBS.test(text)) return false;
  if (SITE_WORDS.test(text)) return true;
  return NICHE_SITE.test(text) && /\b(site|page|website|app)\b/i.test(text);
}

export function matchBlueprint(prompt: string): WebsiteBlueprintInfo {
  const text = prompt.toLowerCase();
  let best = WEBSITE_BLUEPRINTS[0];
  let bestScore = 0;
  for (const blueprint of WEBSITE_BLUEPRINTS) {
    const score = blueprint.keywords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
    if (score > bestScore) {
      best = blueprint;
      bestScore = score;
    }
  }
  return best;
}

export function extractSiteName(prompt: string, fallback: string): string {
  const quoted = prompt.match(/["“']([^"”']{2,48})["”']/);
  if (quoted) return quoted[1].trim();

  const named = prompt.match(/\b(?:called|named)\s+([A-Za-z0-9][\w&'.-]*(?:\s+[A-Za-z0-9][\w&'.-]*){0,4})/i);
  if (named) return titleCase(named[1]);

  const forBrand = prompt.match(/\bfor\s+([A-Z][\w&'.-]*(?:\s+[A-Z][\w&'.-]*){0,3})/);
  if (forBrand) return forBrand[1].replace(/[,.]$/, "").trim();

  return fallback;
}

export function generateWebsite(options: { blueprintId?: string; prompt?: string } = {}): GeneratedWebsite {
  const prompt = options.prompt?.trim() || "";
  const blueprint = options.blueprintId
    ? WEBSITE_BLUEPRINTS.find((item) => item.id === options.blueprintId) ?? matchBlueprint(prompt)
    : matchBlueprint(prompt);
  const siteName = prompt ? extractSiteName(prompt, blueprint.defaultName) : blueprint.defaultName;
  const slug = slugify(siteName);
  const year = new Date().getFullYear();
  const files = buildBlueprint(blueprint.id, { siteName, slug, year });
  return {
    id: blueprint.id,
    name: blueprint.label,
    siteName,
    previewFile: "client/index.html",
    summary: summaryFor(blueprint, siteName, files),
    files,
  };
}

export function filesToPreviewMap(files: WebsiteFile[]): Record<string, string> {
  const all: Record<string, string> = {};
  for (const file of files) {
    all[file.path] = file.content;
    const base = file.path.split("/").pop() || file.path;
    if (!all[base]) all[base] = file.content;
  }
  return all;
}

export function toProjectTree(files: WebsiteFile[]): ProjectNode[] {
  const root: ProjectNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let level = root;
    let acc = "";
    parts.forEach((part, index) => {
      acc = acc ? `${acc}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = level.find((item) => item.name === part);
      if (!node) {
        node = isFile
          ? { id: acc, name: part, type: "file", language: file.language, content: file.content }
          : { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        level.push(node);
      } else if (isFile) {
        node.content = file.content;
        node.language = file.language;
        node.type = "file";
      }
      if (!isFile) level = node.children || (node.children = []);
    });
  }
  return root;
}

interface SiteContext {
  siteName: string;
  slug: string;
  year: number;
}

function buildBlueprint(id: string, ctx: SiteContext): WebsiteFile[] {
  switch (id) {
    case "portfolio":
      return portfolioSite(ctx);
    case "blog":
      return blogSite(ctx);
    case "restaurant":
      return restaurantSite(ctx);
    case "store":
      return storeSite(ctx);
    default:
      return saasSite(ctx);
  }
}

function summaryFor(blueprint: WebsiteBlueprintInfo, siteName: string, files: WebsiteFile[]): string {
  const list = files.map((file) => `- \`${file.path}\``).join("\n");
  return `**${siteName}** is in the editor — a full-stack ${blueprint.label.toLowerCase()} (${blueprint.blurb}).

The live preview runs the client on its own. The same pages call the Express API when you start the server, and fall back to local data inside this editor.

**Files**
${list}

**Run the API**
\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000. \`GET /api/health\` confirms the server is up.`;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "website";
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function packageJson(ctx: SiteContext, description: string): string {
  return JSON.stringify(
    {
      name: ctx.slug,
      private: true,
      version: "1.0.0",
      description,
      type: "module",
      scripts: {
        start: "node server/server.mjs",
        dev: "node --watch server/server.mjs",
      },
      dependencies: {
        express: "^4.21.2",
      },
    },
    null,
    2,
  ) + "\n";
}

function readme(ctx: SiteContext, description: string, endpoints: string[]): string {
  const routes = endpoints.map((line) => `- \`${line}\``).join("\n");
  return `# ${ctx.siteName}

${description}

## Stack

- **Client:** \`client/index.html\`, \`client/styles.css\`, \`client/script.js\`
- **API:** Express in \`server/server.mjs\` (ESM)
- The editor preview uses data baked into \`script.js\`. With the server running, the page reads the same data from the API.

## Run

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## API

${routes}
`;
}

function serverFile(ctx: SiteContext, routes: string): string {
  return `import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, site: ${JSON.stringify(ctx.siteName)} });
});

${routes}

app.listen(PORT, () => {
  console.log(${JSON.stringify(ctx.siteName)} + " running at http://localhost:" + PORT);
});
`;
}

function layoutCss(tokens: Record<string, string>, extra = ""): string {
  const vars = Object.entries(tokens)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join("\n");
  return `:root {
${vars}
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; color: inherit; }
.wrap { width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
.site-header {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0; background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px); border-bottom: 1px solid var(--line);
}
.brand { font-family: var(--display); font-size: 1.25rem; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 22px; align-items: center; font-size: 0.92rem; }
.nav-toggle { display: none; background: none; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  border: 0; border-radius: 999px; padding: 12px 18px; cursor: pointer;
  background: var(--accent); color: var(--accent-text); font-weight: 600;
}
.btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; padding: 72px 0 40px; }
.kicker { color: var(--accent); font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; }
h1, h2, h3 { font-family: var(--display); line-height: 1.05; letter-spacing: -0.04em; margin: 0 0 12px; }
h1 { font-size: clamp(3rem, 6vw, 5.4rem); }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
.lede { font-size: 1.12rem; color: var(--muted); max-width: 38rem; }
.hero-media { min-height: 420px; border-radius: 28px; background-size: cover; background-position: center; box-shadow: 0 30px 80px rgba(0,0,0,.18); }
.section { padding: 72px 0; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.grid-2 { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; }
.card, .panel {
  background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: 22px;
}
.card h3 { font-size: 1.35rem; }
.muted { color: var(--muted); }
.price { font-family: var(--display); font-size: 2.4rem; }
.form { display: grid; gap: 12px; }
.field { display: grid; gap: 6px; font-size: 0.92rem; }
.field input, .field textarea, .field select {
  width: 100%; border: 1px solid var(--line); background: var(--bg); border-radius: 12px; padding: 12px 14px;
}
.note { min-height: 1.2em; color: var(--accent); font-size: 0.92rem; }
.site-footer { border-top: 1px solid var(--line); padding: 28px 0 40px; color: var(--muted); display: flex; justify-content: space-between; gap: 12px; }
.pills { display: flex; flex-wrap: wrap; gap: 8px; }
.pill { border: 1px solid var(--line); border-radius: 999px; padding: 6px 10px; font-size: 0.82rem; }
@media (max-width: 800px) {
  .hero, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  .nav-links { display: none; position: absolute; top: 64px; right: 20px; flex-direction: column; align-items: flex-start; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 14px; }
  .nav-links.open { display: flex; }
  .hero-media { min-height: 240px; }
}
${extra}
`;
}

function clientScript(boot: string): string {
  return `const $ = (sel) => document.querySelector(sel);

document.querySelector("[data-nav-toggle]")?.addEventListener("click", () => {
  document.querySelector("[data-nav]")?.classList.toggle("open");
});

async function api(path, options) {
  try {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error("Request failed");
    return await res.json();
  } catch {
    return null;
  }
}

${boot}
`;
}

function saasSite(ctx: SiteContext): WebsiteFile[] {
  const description = `${ctx.siteName} helps teams ship a calmer product workflow.`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(ctx.siteName)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="wrap site-header">
    <a class="brand" href="#top">${escapeHtml(ctx.siteName)}</a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open menu">Menu</button>
    <nav class="nav-links" data-nav>
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a class="btn" href="#contact">Request access</a>
    </nav>
  </header>
  <main id="top">
    <section class="wrap hero">
      <div>
        <p class="kicker">Product operations</p>
        <h1>Ship the week without the scramble.</h1>
        <p class="lede">${escapeHtml(description)} Plans, handoffs, and launch notes live in one quiet workspace.</p>
        <p style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">
          <a class="btn" href="#contact">Join the list</a>
          <a class="btn ghost" href="#pricing">See pricing</a>
        </p>
      </div>
      <div class="hero-media" style="background-image:url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80')"></div>
    </section>
    <section class="wrap section" id="features">
      <h2>Built for the handoff</h2>
      <div class="grid-3" id="feature-grid"></div>
    </section>
    <section class="wrap section" id="pricing">
      <h2>Simple pricing</h2>
      <div class="grid-3" id="plan-grid"></div>
    </section>
    <section class="wrap section" id="contact">
      <div class="grid-2">
        <div>
          <p class="kicker">Early access</p>
          <h2>Tell us who you ship with.</h2>
          <p class="lede">The form posts to <code>POST /api/leads</code>. In the editor preview it confirms locally.</p>
        </div>
        <form class="panel form" id="lead-form">
          <label class="field">Name<input name="name" required placeholder="Jordan Lee" /></label>
          <label class="field">Work email<input name="email" type="email" required placeholder="you@company.com" /></label>
          <label class="field">Team size
            <select name="team">
              <option>1–10</option>
              <option>11–50</option>
              <option>51–200</option>
            </select>
          </label>
          <button class="btn" type="submit">Request access</button>
          <p class="note" id="lead-note"></p>
        </form>
      </div>
    </section>
  </main>
  <footer class="wrap site-footer"><span>${escapeHtml(ctx.siteName)}</span><span>© ${ctx.year}</span></footer>
  <script src="script.js"></script>
</body>
</html>
`;
  const css = layoutCss({
    bg: "#f4f1ea",
    text: "#1c1915",
    muted: "#5c564c",
    card: "#fffdf8",
    line: "#e4ddd0",
    accent: "#0f6e56",
    "accent-text": "#f4f1ea",
    font: '"Outfit", sans-serif',
    display: '"Fraunces", serif',
  });
  const features = [
    { title: "Launch board", copy: "A single board for the decisions that actually unblock a release." },
    { title: "Handoff notes", copy: "Design, engineering, and support read the same context." },
    { title: "Quiet alerts", copy: "Only the changes that missed a deadline reach your inbox." },
  ];
  const plans = [
    { name: "Studio", price: "$0", detail: "For a single crew finding its rhythm." },
    { name: "Team", price: "$24", detail: "Shared boards, guests, and launch history." },
    { name: "Org", price: "$64", detail: "SSO, audit log, and a shared workspace admin." },
  ];
  const js = clientScript(`const FALLBACK_FEATURES = ${JSON.stringify(features, null, 2)};
const FALLBACK_PLANS = ${JSON.stringify(plans, null, 2)};

function renderFeatures(items) {
  const root = $("#feature-grid");
  if (!root) return;
  root.innerHTML = items.map((item) => \`<article class="card"><h3>\${item.title}</h3><p class="muted">\${item.copy}</p></article>\`).join("");
}

function renderPlans(items) {
  const root = $("#plan-grid");
  if (!root) return;
  root.innerHTML = items.map((item) => \`<article class="card"><p class="kicker">\${item.name}</p><p class="price">\${item.price}</p><p class="muted">\${item.detail}</p></article>\`).join("");
}

$("#lead-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(event.currentTarget));
  const saved = await api("/api/leads", { method: "POST", body: JSON.stringify(body) });
  const note = $("#lead-note");
  if (note) note.textContent = saved?.message || "Saved in this preview. Start the API to store the lead.";
  event.currentTarget.reset();
});

(async () => {
  const features = await api("/api/features");
  const plans = await api("/api/plans");
  renderFeatures(features?.items || FALLBACK_FEATURES);
  renderPlans(plans?.items || FALLBACK_PLANS);
})();
`);
  const routes = `const features = ${JSON.stringify(features)};
const plans = ${JSON.stringify(plans)};
const leads = [];

app.get("/api/features", (_req, res) => res.json({ items: features }));
app.get("/api/plans", (_req, res) => res.json({ items: plans }));
app.post("/api/leads", (req, res) => {
  const lead = { id: leads.length + 1, ...req.body, createdAt: new Date().toISOString() };
  if (!lead.email) return res.status(400).json({ error: "Email is required" });
  leads.push(lead);
  res.status(201).json({ message: "You're on the list.", lead });
});`;
  return pack(ctx, description, html, css, js, routes, [
    "GET /api/health",
    "GET /api/features",
    "GET /api/plans",
    "POST /api/leads",
  ]);
}

function portfolioSite(ctx: SiteContext): WebsiteFile[] {
  const description = `${ctx.siteName} designs digital products with a bias for clear type and quiet interfaces.`;
  const projects = [
    { title: "Harbor Atlas", year: "2025", role: "Product design", copy: "A map for independent bookstores, from shelf to neighborhood." },
    { title: "Kiln", year: "2024", role: "Brand + web", copy: "Identity and site for a ceramics studio that sells out every firing." },
    { title: "Northline", year: "2024", role: "Design systems", copy: "A component library for a transit agency's rider tools." },
  ];
  const html = page({
    ctx,
    description,
    nav: `<a href="#work">Selected work</a><a href="#story">About</a><a class="btn" href="#contact">Start a project</a>`,
    main: `
    <section class="wrap hero">
      <div>
        <p class="kicker">Portfolio</p>
        <h1>${escapeHtml(ctx.siteName)}</h1>
        <p class="lede">${escapeHtml(description)}</p>
      </div>
      <div class="hero-media" style="background-image:url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80')"></div>
    </section>
    <section class="wrap section" id="work">
      <h2>Selected work</h2>
      <div class="grid-3" id="project-grid"></div>
    </section>
    <section class="wrap section" id="story">
      <div class="panel">
        <h2>About</h2>
        <p class="lede">I partner with founders and public teams on the first version that feels finished. Projects load from <code>GET /api/projects</code>.</p>
      </div>
    </section>
    <section class="wrap section" id="contact">
      <form class="panel form" id="contact-form">
        <h2>Start a project</h2>
        <label class="field">Name<input name="name" required /></label>
        <label class="field">Email<input name="email" type="email" required /></label>
        <label class="field">What are you making?<textarea name="message" rows="4" required></textarea></label>
        <button class="btn" type="submit">Send</button>
        <p class="note" id="contact-note"></p>
      </form>
    </section>`,
  });
  const css = layoutCss({
    bg: "#14120f",
    text: "#f3ecdf",
    muted: "#b7ad9e",
    card: "#1e1b16",
    line: "#3a342c",
    accent: "#e2b15a",
    "accent-text": "#1a140c",
    font: '"Outfit", sans-serif',
    display: '"Fraunces", serif',
  });
  const js = clientScript(`const FALLBACK_PROJECTS = ${JSON.stringify(projects, null, 2)};

function renderProjects(items) {
  const root = $("#project-grid");
  if (!root) return;
  root.innerHTML = items.map((item) => \`<article class="card"><p class="kicker">\${item.year} · \${item.role}</p><h3>\${item.title}</h3><p class="muted">\${item.copy}</p></article>\`).join("");
}

$("#contact-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(event.currentTarget));
  const saved = await api("/api/contact", { method: "POST", body: JSON.stringify(body) });
  const note = $("#contact-note");
  if (note) note.textContent = saved?.message || "Noted in this preview. Start the API to deliver the message.";
  event.currentTarget.reset();
});

(async () => {
  const data = await api("/api/projects");
  renderProjects(data?.items || FALLBACK_PROJECTS);
})();
`);
  const routes = `const projects = ${JSON.stringify(projects)};
const messages = [];
app.get("/api/projects", (_req, res) => res.json({ items: projects }));
app.post("/api/contact", (req, res) => {
  const message = { id: messages.length + 1, ...req.body, createdAt: new Date().toISOString() };
  if (!message.email || !message.message) return res.status(400).json({ error: "Email and message are required" });
  messages.push(message);
  res.status(201).json({ message: "Message received. I'll reply within two days.", item: message });
});`;
  return pack(ctx, description, html, css, js, routes, ["GET /api/health", "GET /api/projects", "POST /api/contact"]);
}

function blogSite(ctx: SiteContext): WebsiteFile[] {
  const description = `${ctx.siteName} publishes short essays on making things in public.`;
  const posts = [
    { slug: "slow-tools", title: "Slow tools, faster weeks", date: "Mar 12", excerpt: "The tools that stay are the ones that refuse to hurry you.", body: "A good tool has a pace. It lets you see the work before it lets you publish it. This essay is the case for software that waits." },
    { slug: "kitchen-notes", title: "Notes from a small kitchen", date: "Feb 2", excerpt: "What a dinner service teaches about queues, mistakes, and recovery.", body: "The pass is a queue with opinions. Orders arrive faster than plates, and the only reliable system is a person who can see both." },
    { slug: "field-guide", title: "A field guide to first drafts", date: "Jan 18", excerpt: "Write the ugly version where you can find it again.", body: "First drafts are maps, not monuments. Keep them in one place, name them honestly, and resist polishing the sentence that is still a guess." },
  ];
  const html = page({
    ctx,
    description,
    nav: `<a href="#work">Essays</a><a class="btn" href="#contact">Subscribe</a>`,
    main: `
    <section class="wrap hero">
      <div>
        <p class="kicker">Journal</p>
        <h1>${escapeHtml(ctx.siteName)}</h1>
        <p class="lede">${escapeHtml(description)}</p>
      </div>
      <div class="hero-media" style="background-image:url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1400&q=80')"></div>
    </section>
    <section class="wrap section grid-2" id="work">
      <div id="post-list"></div>
      <article class="panel" id="post-view">
        <p class="kicker">Select an essay</p>
        <h2>Reading room</h2>
        <p class="muted">Posts come from <code>GET /api/posts</code>.</p>
      </article>
    </section>
    <section class="wrap section" id="contact">
      <form class="panel form" id="subscribe-form">
        <h2>Get the next note</h2>
        <label class="field">Email<input name="email" type="email" required placeholder="you@domain.com" /></label>
        <button class="btn" type="submit">Subscribe</button>
        <p class="note" id="subscribe-note"></p>
      </form>
    </section>`,
  });
  const css = layoutCss({
    bg: "#f7f3ea",
    text: "#221c16",
    muted: "#6b5e52",
    card: "#fffaf3",
    line: "#e6dccb",
    accent: "#8c3a2f",
    "accent-text": "#fff7f2",
    font: '"Outfit", sans-serif',
    display: '"Fraunces", serif',
  }, `.post-link { display: block; text-align: left; width: 100%; background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; margin-bottom: 12px; cursor: pointer; }
.post-link.active { border-color: var(--accent); }`);
  const js = clientScript(`const FALLBACK_POSTS = ${JSON.stringify(posts, null, 2)};
let posts = FALLBACK_POSTS;

function renderList() {
  const root = $("#post-list");
  if (!root) return;
  root.innerHTML = posts.map((post, index) => \`<button class="post-link\${index === 0 ? " active" : ""}" data-slug="\${post.slug}"><p class="kicker">\${post.date}</p><h3>\${post.title}</h3><p class="muted">\${post.excerpt}</p></button>\`).join("");
  root.querySelectorAll("[data-slug]").forEach((button) => {
    button.addEventListener("click", () => openPost(button.dataset.slug));
  });
}

function openPost(slug) {
  const post = posts.find((item) => item.slug === slug) || posts[0];
  const view = $("#post-view");
  if (!post || !view) return;
  view.innerHTML = \`<p class="kicker">\${post.date}</p><h2>\${post.title}</h2><p>\${post.body}</p>\`;
  document.querySelectorAll("[data-slug]").forEach((button) => button.classList.toggle("active", button.dataset.slug === post.slug));
}

$("#subscribe-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(event.currentTarget));
  const saved = await api("/api/subscribers", { method: "POST", body: JSON.stringify(body) });
  const note = $("#subscribe-note");
  if (note) note.textContent = saved?.message || "Saved in this preview. Start the API to keep the subscription.";
  event.currentTarget.reset();
});

(async () => {
  const data = await api("/api/posts");
  posts = data?.items || FALLBACK_POSTS;
  renderList();
  openPost(posts[0]?.slug);
})();
`);
  const routes = `const posts = ${JSON.stringify(posts)};
const subscribers = [];
app.get("/api/posts", (_req, res) => res.json({ items: posts }));
app.get("/api/posts/:slug", (req, res) => {
  const post = posts.find((item) => item.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});
app.post("/api/subscribers", (req, res) => {
  if (!req.body?.email) return res.status(400).json({ error: "Email is required" });
  subscribers.push({ email: req.body.email, createdAt: new Date().toISOString() });
  res.status(201).json({ message: "Subscribed. The next essay will land in your inbox." });
});`;
  return pack(ctx, description, html, css, js, routes, ["GET /api/health", "GET /api/posts", "GET /api/posts/:slug", "POST /api/subscribers"]);
}

function restaurantSite(ctx: SiteContext): WebsiteFile[] {
  const description = `${ctx.siteName} is a neighborhood dining room with a wood oven and a short menu.`;
  const items = [
    { name: "Rye sourdough", course: "Bread", price: 8, detail: "Cultured butter, smoked salt." },
    { name: "Roasted carrots", course: "Garden", price: 16, detail: "Chili honey, hazelnut, yogurt." },
    { name: "Half chicken", course: "Fire", price: 32, detail: "Wood oven, charred lemon, jus." },
    { name: "Olive oil cake", course: "After", price: 12, detail: "Citrus, crème fraîche." },
  ];
  const html = page({
    ctx,
    description,
    nav: `<a href="#work">Menu</a><a href="#story">Visit</a><a class="btn" href="#contact">Reserve</a>`,
    main: `
    <section class="wrap hero">
      <div>
        <p class="kicker">Dinner nightly</p>
        <h1>${escapeHtml(ctx.siteName)}</h1>
        <p class="lede">${escapeHtml(description)}</p>
      </div>
      <div class="hero-media" style="background-image:url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80')"></div>
    </section>
    <section class="wrap section" id="work">
      <h2>Tonight's menu</h2>
      <div id="menu"></div>
    </section>
    <section class="wrap section grid-2" id="story">
      <div class="hero-media" style="min-height:280px;background-image:url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80')"></div>
      <div>
        <h2>The room</h2>
        <p class="lede">Open Wednesday to Sunday, 5–10. The menu is served from <code>GET /api/menu</code>.</p>
      </div>
    </section>
    <section class="wrap section" id="contact">
      <form class="panel form" id="reserve-form">
        <h2>Reserve a table</h2>
        <label class="field">Name<input name="name" required /></label>
        <label class="field">Party size<input name="party" type="number" min="1" max="8" value="2" required /></label>
        <label class="field">Date<input name="date" type="date" required /></label>
        <button class="btn" type="submit">Request reservation</button>
        <p class="note" id="reserve-note"></p>
      </form>
    </section>`,
  });
  const css = layoutCss({
    bg: "#1b2118",
    text: "#f3efe4",
    muted: "#c9c1ae",
    card: "#242b20",
    line: "#3d4636",
    accent: "#d6a15a",
    "accent-text": "#1b140c",
    font: '"Outfit", sans-serif',
    display: '"Fraunces", serif',
  }, `.menu-row { display: flex; justify-content: space-between; gap: 18px; padding: 16px 0; border-bottom: 1px solid var(--line); }
.menu-row strong { font-family: var(--display); font-size: 1.3rem; }`);
  const js = clientScript(`const FALLBACK_MENU = ${JSON.stringify(items, null, 2)};

function money(cents) { return "$" + Number(cents).toFixed(0); }

function renderMenu(items) {
  const root = $("#menu");
  if (!root) return;
  root.innerHTML = items.map((item) => \`<div class="menu-row"><div><p class="kicker">\${item.course}</p><strong>\${item.name}</strong><p class="muted">\${item.detail}</p></div><span class="price" style="font-size:1.6rem">\${money(item.price)}</span></div>\`).join("");
}

$("#reserve-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(event.currentTarget));
  const saved = await api("/api/reservations", { method: "POST", body: JSON.stringify(body) });
  const note = $("#reserve-note");
  if (note) note.textContent = saved?.message || "Held in this preview. Start the API to record the reservation.";
  event.currentTarget.reset();
});

(async () => {
  const data = await api("/api/menu");
  renderMenu(data?.items || FALLBACK_MENU);
})();
`);
  const routes = `const menu = ${JSON.stringify(items)};
const reservations = [];
app.get("/api/menu", (_req, res) => res.json({ items: menu }));
app.post("/api/reservations", (req, res) => {
  const reservation = { id: reservations.length + 1, ...req.body, status: "requested" };
  if (!reservation.name || !reservation.date) return res.status(400).json({ error: "Name and date are required" });
  reservations.push(reservation);
  res.status(201).json({ message: "Request received. We'll confirm by email.", reservation });
});`;
  return pack(ctx, description, html, css, js, routes, ["GET /api/health", "GET /api/menu", "POST /api/reservations"]);
}

function storeSite(ctx: SiteContext): WebsiteFile[] {
  const description = `${ctx.siteName} sells everyday goods with a short, well-made catalog.`;
  const products = [
    { id: "tote", name: "Canvas tote", price: 48, detail: "Heavy cotton, natural dye.", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80" },
    { id: "cup", name: "Stoneware cup", price: 32, detail: "Thrown in small batches.", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80" },
    { id: "lamp", name: "Desk lamp", price: 120, detail: "Warm light, linen shade.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
  ];
  const html = page({
    ctx,
    description,
    nav: `<a href="#work">Catalog</a><a class="btn" href="#contact">Cart&nbsp;<span id="cart-count">0</span></a>`,
    main: `
    <section class="wrap hero">
      <div>
        <p class="kicker">Shop</p>
        <h1>${escapeHtml(ctx.siteName)}</h1>
        <p class="lede">${escapeHtml(description)} The catalog loads from <code>GET /api/products</code>.</p>
      </div>
      <div class="hero-media" style="background-image:url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80')"></div>
    </section>
    <section class="wrap section" id="work">
      <div class="grid-3" id="catalog"></div>
    </section>
    <section class="wrap section" id="contact">
      <form class="panel form" id="checkout-form">
        <h2>Checkout</h2>
        <p class="muted" id="cart-summary">Your cart is empty.</p>
        <label class="field">Email<input name="email" type="email" required /></label>
        <button class="btn" type="submit">Place order</button>
        <p class="note" id="order-note"></p>
      </form>
    </section>`,
  });
  const css = layoutCss({
    bg: "#f3f6f4",
    text: "#14211c",
    muted: "#5d6b64",
    card: "#ffffff",
    line: "#d7e0db",
    accent: "#0e7c66",
    "accent-text": "#f3f6f4",
    font: '"Outfit", sans-serif',
    display: '"Fraunces", serif',
  }, `.product img { height: 180px; width: 100%; border-radius: 14px; margin-bottom: 12px; }`);
  const js = clientScript(`const FALLBACK_PRODUCTS = ${JSON.stringify(products, null, 2)};
let products = FALLBACK_PRODUCTS;
let cart = [];

function money(value) { return "$" + Number(value).toFixed(2); }

function renderCatalog() {
  const root = $("#catalog");
  if (!root) return;
  root.innerHTML = products.map((item) => \`<article class="card product"><img src="\${item.image}" alt="\${item.name}" /><h3>\${item.name}</h3><p class="muted">\${item.detail}</p><p class="price" style="font-size:1.8rem">\${money(item.price)}</p><button class="btn" data-add="\${item.id}" type="button">Add to cart</button></article>\`).join("");
  root.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  cart.push(product);
  const count = $("#cart-count");
  const summary = $("#cart-summary");
  if (count) count.textContent = String(cart.length);
  if (summary) {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    summary.textContent = cart.map((item) => item.name).join(", ") + " — " + money(total);
  }
}

$("#checkout-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const note = $("#order-note");
  if (!cart.length) {
    if (note) note.textContent = "Add something before checking out.";
    return;
  }
  const email = new FormData(event.currentTarget).get("email");
  const saved = await api("/api/orders", {
    method: "POST",
    body: JSON.stringify({ email, items: cart.map((item) => item.id) }),
  });
  if (note) note.textContent = saved?.message || "Order kept in this preview. Start the API to record it.";
  cart = [];
  if ($("#cart-count")) $("#cart-count").textContent = "0";
  if ($("#cart-summary")) $("#cart-summary").textContent = "Your cart is empty.";
  event.currentTarget.reset();
});

(async () => {
  const data = await api("/api/products");
  products = data?.items || FALLBACK_PRODUCTS;
  renderCatalog();
})();
`);
  const routes = `const products = ${JSON.stringify(products)};
const orders = [];
app.get("/api/products", (_req, res) => res.json({ items: products }));
app.post("/api/orders", (req, res) => {
  const ids = Array.isArray(req.body?.items) ? req.body.items : [];
  const items = ids.map((id) => products.find((item) => item.id === id)).filter(Boolean);
  if (!req.body?.email || !items.length) return res.status(400).json({ error: "Email and items are required" });
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const order = { id: orders.length + 1, email: req.body.email, items: items.map((item) => item.id), total, status: "received" };
  orders.push(order);
  res.status(201).json({ message: "Order " + order.id + " received. Total " + total.toFixed(2) + ".", order });
});`;
  return pack(ctx, description, html, css, js, routes, ["GET /api/health", "GET /api/products", "POST /api/orders"]);
}

function page(opts: { ctx: SiteContext; description: string; nav: string; main: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(opts.ctx.siteName)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="wrap site-header">
    <a class="brand" href="#top">${escapeHtml(opts.ctx.siteName)}</a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open menu">Menu</button>
    <nav class="nav-links" data-nav>${opts.nav}</nav>
  </header>
  <main id="top">${opts.main}</main>
  <footer class="wrap site-footer"><span>${escapeHtml(opts.ctx.siteName)}</span><span>© ${opts.ctx.year}</span></footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function pack(
  ctx: SiteContext,
  description: string,
  html: string,
  css: string,
  js: string,
  routes: string,
  endpoints: string[],
): WebsiteFile[] {
  return [
    { path: "client/index.html", language: "html", content: html },
    { path: "client/styles.css", language: "css", content: css },
    { path: "client/script.js", language: "javascript", content: js },
    { path: "server/server.mjs", language: "javascript", content: serverFile(ctx, routes) },
    { path: "package.json", language: "json", content: packageJson(ctx, description) },
    { path: "README.md", language: "markdown", content: readme(ctx, description, endpoints) },
  ];
}
