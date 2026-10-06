/**
 * Full-stack website automations for the Web Development AI assistant.
 * Each automation is a runnable site: index.html, styles.css, script.js,
 * plus an Express API in server.js and package.json.
 * The browser preview uses the client files. script.js keeps fallback data
 * so the page still works when the API is not running.
 */

export const WEBSITE_GENERATOR_TAG = "[WEBSITE_GENERATOR]";

export const WEBSITE_FILE_NAMES = [
  "index.html",
  "styles.css",
  "script.js",
  "server.js",
  "package.json",
] as const;

export interface WebsiteFile {
  name: (typeof WEBSITE_FILE_NAMES)[number];
  language: "html" | "css" | "javascript" | "json";
  role: "page" | "style" | "client" | "server" | "config";
  content: string;
}

export interface WebsiteAutomation {
  id: string;
  icon: string;
  label: string;
  description: string;
  stack: string;
  prompt: string;
  files: WebsiteFile[];
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

const STARTER_FILES_TO_REPLACE = ["src/app.js", "src/style.css"];

export function isBackendScript(fileName: string, content = ""): boolean {
  const base = fileName.split("/").pop()?.toLowerCase() || "";
  if (base === "server.js" || base === "server.ts" || base === "server.cjs") return true;
  const head = content.slice(0, 400);
  return /^\s*(?:const|let|var)\s+\w+\s*=\s*require\(/.test(head) || /^\s*require\(/.test(head);
}

export function buildWebsiteGeneratorPrompt(description: string): string {
  const brief = description.trim() || "a modern multi-section marketing website";
  return `${WEBSITE_GENERATOR_TAG}
Build a complete full-stack website for: ${brief}

Return exactly these five files, in this order. Put the filename alone on the line before each fence:
index.html
styles.css
script.js
server.js
package.json

Client rules:
- Vanilla HTML, CSS, and JavaScript only. No React, JSX, TSX, TypeScript, Vue, imports, exports, or npm packages in the browser files.
- index.html sets data-themed on body, links styles.css, and loads script.js before </body>.
- script.js calls the Express routes and includes embedded fallback data so the page still renders when fetch fails.
- Include a hero, at least three sections, a responsive layout, and Unsplash images (https://images.unsplash.com/photo-ID?w=1200&h=800&fit=crop&q=80).

Server rules:
- server.js is CommonJS. Require express and cors, then serve static files from __dirname.
- Every fetch() path in script.js must have a matching app.get, app.post, app.patch, or app.delete route.
- package.json depends on express and cors, with a start script of "node server.js".
- Do not reference server.js from index.html.`;
}

export function extractClientApiPaths(source: string): string[] {
  const paths = new Set<string>();
  const pattern = /(?:fetch|api)\(\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    const raw = match[1] || match[2] || match[3];
    const path = raw.replace(/\$\{[^}]+\}/g, ":id").split("?")[0].replace(/\/$/, "/:id");
    if (path.startsWith("/api/")) paths.add(path);
  }
  return [...paths];
}

export function extractServerApiPaths(source: string): string[] {
  const paths = new Set<string>();
  const pattern = /app\.(?:get|post|patch|put|delete)\(\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    if (match[1].startsWith("/api/")) paths.add(match[1]);
  }
  return [...paths];
}

export function describeAutomation(automation: WebsiteAutomation): string {
  const files = automation.files.map((file) => `- \`${file.name}\` — ${file.role}`).join("\n");
  return `Applied **${automation.label}**. Preview uses the HTML, CSS, and JavaScript. \`server.js\` is the Express API.

${files}

**Run the API**
\`\`\`bash
cd src
npm install
npm start
\`\`\`

The preview still works if that server is offline, because \`script.js\` keeps its own fallback data.`;
}

export function buildStandalonePreview(automation: WebsiteAutomation): string {
  const html = fileContent(automation, "index.html");
  const css = fileContent(automation, "styles.css");
  const js = automation.files.filter((file) => file.role === "client").map((file) => file.content).join("\n");
  return html
    .replace(/<link[^>]+href=["'][^"']+\.css["'][^>]*>/i, `<style>\n${css}\n</style>`)
    .replace(/<script[^>]+src=["'][^"']+\.js["'][^>]*><\/script>/i, `<script>\n${js}\n</script>`);
}

export function applyWebsiteToTree<T extends ProjectFileNode>(tree: T[], automation: WebsiteAutomation): T[] {
  const remove = (nodes: T[], id: string): T[] =>
    nodes
      .filter((node) => node.id !== id)
      .map((node) => (node.children ? { ...node, children: remove(node.children as T[], id) } : node));

  let result = JSON.parse(JSON.stringify(tree)) as T[];
  for (const staleId of STARTER_FILES_TO_REPLACE) {
    result = remove(result, staleId);
  }

  let src = result.find((node) => node.id === "src" && node.type === "folder");
  if (!src) {
    src = { id: "src", name: "src", type: "folder", isOpen: true, children: [] } as T;
    result = [src, ...result];
  }
  src.isOpen = true;
  src.children = src.children || [];

  for (const file of automation.files) {
    const id = `src/${file.name}`;
    const existing = src.children.find((child) => child.id === id);
    if (existing && existing.type === "file") {
      existing.content = file.content;
      existing.language = file.language;
      existing.name = file.name;
    } else {
      src.children.push({
        id,
        name: file.name,
        type: "file",
        language: file.language,
        content: file.content,
      } as T);
    }
  }

  return result;
}

function fileContent(automation: WebsiteAutomation, name: WebsiteFile["name"]): string {
  const file = automation.files.find((item) => item.name === name);
  if (!file) throw new Error(`Missing ${name} in ${automation.id}`);
  return file.content;
}

function sitePackage(name: string, description: string): string {
  return JSON.stringify(
    {
      name,
      version: "1.0.0",
      private: true,
      description,
      main: "server.js",
      scripts: { start: "node server.js" },
      dependencies: { express: "^4.21.2", cors: "^2.8.5" },
    },
    null,
    2,
  ) + "\n";
}

function expressServer(routes: string): string {
  return `const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

${routes.trim()}

app.listen(PORT, () => {
  console.log("Website running at http://localhost:" + PORT);
});
`;
}

function page(title: string, body: string, fontHref = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="${fontHref}" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
${body}
  <script src="script.js"></script>
</body>
</html>
`;
}

const launchpadHtml = page(
  "Launchpad — ship a site in an afternoon",
  `  <header class="nav">
    <a class="logo" href="#top">Launchpad</a>
    <button class="nav-toggle" data-nav-toggle type="button" aria-label="Open menu">Menu</button>
    <nav class="nav-links" data-nav-menu>
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact">Contact</a>
    </nav>
    <a class="btn btn-small" href="#contact">Start free</a>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="eyebrow">Full-stack website kit</p>
        <h1>Ship the page and the API together.</h1>
        <p class="lede">Launchpad is a marketing site with a lead inbox. The browser preview runs on its own. Start the Express server when you want the leads saved.</p>
        <div class="hero-actions">
          <a class="btn" href="#pricing">See plans</a>
          <a class="btn btn-ghost" href="#features">How it works</a>
        </div>
      </div>
      <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&q=80" alt="Developer workspace with a laptop" />
    </section>
    <section class="stats">
      <div><strong>3</strong><span>client files</span></div>
      <div><strong>1</strong><span>Express API</span></div>
      <div><strong>0</strong><span>build step for preview</span></div>
    </section>
    <section id="features" class="section">
      <h2>Everything a first website needs</h2>
      <div class="grid cols-3">
        <article class="card"><h3>Live preview</h3><p>HTML, CSS, and JavaScript render in the editor without a bundler.</p></article>
        <article class="card"><h3>Lead API</h3><p>The contact form posts to <code>/api/leads</code> and falls back locally if the server is off.</p></article>
        <article class="card"><h3>Pricing toggle</h3><p>Plans load from <code>/api/plans</code>, with prices stored in the client as a backup.</p></article>
      </div>
    </section>
    <section class="band">
      <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&h=700&fit=crop&q=80" alt="Team collaborating around a table" />
      <div>
        <h2>Built for the web development workspace</h2>
        <p>Keep the page in the preview and the API in <code>server.js</code>. Run <code>npm start</code> inside <code>src</code> when you want both on one port.</p>
      </div>
    </section>
    <section id="pricing" class="section">
      <div class="section-head">
        <h2>Simple pricing</h2>
        <div class="toggle" role="group" aria-label="Billing period">
          <button type="button" id="bill-monthly" class="is-active">Monthly</button>
          <button type="button" id="bill-yearly">Yearly</button>
        </div>
      </div>
      <div id="plans" class="grid cols-3"></div>
    </section>
    <section id="contact" class="section">
      <h2>Tell us what you want to launch</h2>
      <form id="lead-form" class="form">
        <label>Name<input name="name" required placeholder="Ava Shah" /></label>
        <label>Email<input name="email" type="email" required placeholder="ava@studio.dev" /></label>
        <label>Project<input name="note" required placeholder="A site for my studio" /></label>
        <button class="btn" type="submit">Send lead</button>
        <p id="lead-status" class="status" role="status"></p>
      </form>
    </section>
  </main>
  <footer class="footer">Launchpad · HTML, CSS, JavaScript, and Express</footer>`,
);

const launchpadCss = `:root {
  --bg: #070b14; --card: #12182a; --text: #e8eef9; --muted: #93a1b8;
  --primary: #7c5cff; --line: rgba(255,255,255,.08);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: radial-gradient(1200px 500px at 80% -10%, rgba(124,92,255,.35), transparent 50%), var(--bg); color: var(--text); }
img { width: 100%; height: 100%; object-fit: cover; display: block; }
a { color: inherit; text-decoration: none; }
code { font-size: .92em; color: #c4b5fd; }
.nav { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 18px; padding: 14px 6vw; background: rgba(7,11,20,.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.logo { font-weight: 700; margin-right: auto; }
.nav-links { display: flex; gap: 16px; color: var(--muted); }
.nav-toggle { display: none; }
.btn { display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; padding: 12px 18px; background: var(--primary); color: white; font-weight: 600; cursor: pointer; }
.btn-ghost { background: transparent; border: 1px solid var(--line); }
.btn-small { padding: 8px 14px; }
.hero, .section, .band, .stats { padding: 64px 6vw; }
.hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: center; }
.hero img, .band img { border-radius: 20px; min-height: 280px; }
.eyebrow { color: #c4b5fd; letter-spacing: .08em; text-transform: uppercase; font-size: 12px; }
h1 { font-size: clamp(36px, 5vw, 64px); line-height: 1.05; margin: 8px 0 12px; }
h2 { font-size: clamp(28px, 3vw, 40px); margin: 0 0 18px; }
.lede, .card p, .band p, .footer { color: var(--muted); line-height: 1.6; }
.hero-actions, .section-head, .toggle { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.section-head { justify-content: space-between; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-top: 0; }
.stats div, .card, .form { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
.stats strong { display: block; font-size: 28px; }
.grid { display: grid; gap: 16px; }
.cols-3 { grid-template-columns: repeat(3, 1fr); }
.card h3 { margin: 0 0 8px; }
.band { display: grid; grid-template-columns: 1.1fr .9fr; gap: 28px; align-items: center; }
.toggle button { border: 1px solid var(--line); background: transparent; color: var(--text); border-radius: 999px; padding: 8px 12px; cursor: pointer; }
.toggle button.is-active { background: white; color: #111; }
.form { display: grid; gap: 12px; max-width: 560px; }
label { display: grid; gap: 6px; font-size: 14px; color: var(--muted); }
input { border: 1px solid var(--line); background: #0c1220; color: var(--text); border-radius: 10px; padding: 12px; font: inherit; }
.status { min-height: 1.2em; }
.footer { padding: 28px 6vw 40px; }
@media (max-width: 800px) {
  .hero, .band, .cols-3, .stats { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; margin-left: auto; background: transparent; color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
  .nav .btn-small { display: none; }
  .nav-links { display: none; position: absolute; top: 58px; left: 0; right: 0; flex-direction: column; padding: 12px 6vw 16px; background: #0c1220; }
  .nav-links.open { display: flex; }
}
`;

const launchpadJs = `var FALLBACK_PLANS = [
  { name: "Starter", monthly: 0, yearly: 0, points: ["1 published site", "Preview hosting", "Community support"] },
  { name: "Pro", monthly: 19, yearly: 15, points: ["Lead API", "Custom domain", "Remove badge"] },
  { name: "Team", monthly: 49, yearly: 39, points: ["5 teammates", "Shared inbox", "Priority support"] }
];

var yearly = false;
var plans = FALLBACK_PLANS.slice();

function money(value) {
  return value === 0 ? "Free" : "$" + value;
}

function renderPlans() {
  var root = document.getElementById("plans");
  root.innerHTML = plans.map(function (plan) {
    var price = yearly ? plan.yearly : plan.monthly;
    var points = plan.points.map(function (point) { return "<li>" + point + "</li>"; }).join("");
    return '<article class="card"><h3>' + plan.name + '</h3><p class="price">' + money(price) + '<span>/mo</span></p><ul>' + points + '</ul></article>';
  }).join("");
}

function loadPlans() {
  fetch("/api/plans")
    .then(function (res) { if (!res.ok) throw new Error("offline"); return res.json(); })
    .then(function (data) { if (Array.isArray(data) && data.length) plans = data; renderPlans(); })
    .catch(function () { plans = FALLBACK_PLANS.slice(); renderPlans(); });
}

document.getElementById("bill-monthly").addEventListener("click", function () {
  yearly = false;
  document.getElementById("bill-monthly").classList.add("is-active");
  document.getElementById("bill-yearly").classList.remove("is-active");
  renderPlans();
});
document.getElementById("bill-yearly").addEventListener("click", function () {
  yearly = true;
  document.getElementById("bill-yearly").classList.add("is-active");
  document.getElementById("bill-monthly").classList.remove("is-active");
  renderPlans();
});

var navToggle = document.querySelector("[data-nav-toggle]");
var navMenu = document.querySelector("[data-nav-menu]");
if (navToggle && navMenu) {
  navToggle.addEventListener("click", function () { navMenu.classList.toggle("open"); });
}

document.getElementById("lead-form").addEventListener("submit", function (event) {
  event.preventDefault();
  var form = event.currentTarget;
  var data = new FormData(form);
  var payload = {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    note: String(data.get("note") || "").trim()
  };
  var status = document.getElementById("lead-status");
  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(function (res) {
    if (!res.ok) throw new Error("offline");
    return res.json();
  }).then(function () {
    status.textContent = "Saved on the API. Thanks, " + payload.name + ".";
    form.reset();
  }).catch(function () {
    status.textContent = "API offline — kept this lead in the preview: " + payload.email;
    form.reset();
  });
});

loadPlans();
`;

const launchpadServer = expressServer(`
const plans = [
  { name: "Starter", monthly: 0, yearly: 0, points: ["1 published site", "Preview hosting", "Community support"] },
  { name: "Pro", monthly: 19, yearly: 15, points: ["Lead API", "Custom domain", "Remove badge"] },
  { name: "Team", monthly: 49, yearly: 39, points: ["5 teammates", "Shared inbox", "Priority support"] }
];
const leads = [];

app.get("/api/plans", (_req, res) => {
  res.json(plans);
});

app.post("/api/leads", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const note = String(req.body.note || "").trim();
  if (!name || !email) return res.status(400).json({ error: "Name and email are required." });
  const lead = { id: Date.now(), name, email, note };
  leads.push(lead);
  res.status(201).json(lead);
});
`);

const portfolioHtml = page(
  "North Studio — selected work",
  `  <header class="nav">
    <a class="logo" href="#top">North Studio</a>
    <button class="nav-toggle" data-nav-toggle type="button" aria-label="Open menu">Menu</button>
    <nav class="nav-links" data-nav-menu>
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <p class="eyebrow">Product design & web</p>
      <h1>Interfaces with a point of view.</h1>
      <p class="lede">A portfolio that loads projects from <code>/api/projects</code> and still shows the studio's work when you are only using the preview.</p>
    </section>
    <section id="work" class="section">
      <div class="filters" id="filters">
        <button type="button" data-filter="all" class="is-active">All</button>
        <button type="button" data-filter="product">Product</button>
        <button type="button" data-filter="brand">Brand</button>
        <button type="button" data-filter="web">Web</button>
      </div>
      <div id="projects" class="grid"></div>
    </section>
    <section id="about" class="about">
      <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=1100&fit=crop&q=80" alt="Studio collaborators reviewing prints" />
      <div>
        <h2>A small studio for clear digital products.</h2>
        <p>North Studio designs marketing sites, product UI, and the small APIs that keep them honest. This page is the same shape you can hand to a client: a static front end plus a JSON API.</p>
        <ul>
          <li>Filterable project grid</li>
          <li>Messages stored by <code>POST /api/messages</code></li>
          <li>Fallback copy baked into the page</li>
        </ul>
      </div>
    </section>
    <section id="contact" class="section">
      <h2>Start a project</h2>
      <form id="message-form" class="form">
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>What should we make?<textarea name="message" required rows="4"></textarea></label>
        <button class="btn" type="submit">Send message</button>
        <p id="message-status" class="status" role="status"></p>
      </form>
    </section>
  </main>
  <footer class="footer">North Studio · portfolio website</footer>`,
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;600&family=Inter:wght@400;600&display=swap",
);

const portfolioCss = `:root {
  --bg: #14110e; --card: #1e1a16; --text: #f6f1ea; --muted: #cbbba8; --primary: #e7b56a; --line: rgba(246,241,234,.12);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); }
img { width: 100%; height: 220px; object-fit: cover; display: block; border-radius: 14px 14px 0 0; }
h1, h2, .logo { font-family: Fraunces, Georgia, serif; font-weight: 500; }
a { color: inherit; text-decoration: none; }
code { color: var(--primary); }
.nav { display: flex; gap: 18px; align-items: center; padding: 18px 6vw; position: sticky; top: 0; background: rgba(20,17,14,.92); z-index: 4; }
.logo { margin-right: auto; font-size: 22px; }
.nav-links { display: flex; gap: 16px; color: var(--muted); }
.nav-toggle { display: none; }
.hero, .section, .about { padding: 48px 6vw; }
.eyebrow { letter-spacing: .14em; text-transform: uppercase; font-size: 12px; color: var(--primary); }
h1 { font-size: clamp(42px, 7vw, 84px); line-height: .95; max-width: 12ch; margin: 10px 0; }
.lede, .card p, .about p, .footer { color: var(--muted); line-height: 1.6; }
.filters { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.filters button, .btn { border: 1px solid var(--line); background: transparent; color: var(--text); border-radius: 999px; padding: 8px 14px; cursor: pointer; font: inherit; }
.filters button.is-active, .btn { background: var(--primary); color: #1a140d; border-color: transparent; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card { background: var(--card); border-radius: 16px; overflow: hidden; border: 1px solid var(--line); }
.card div { padding: 14px 16px 18px; }
.card h3 { margin: 0 0 6px; }
.tag { color: var(--primary); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.about { display: grid; grid-template-columns: .8fr 1.2fr; gap: 28px; align-items: center; }
.about img { height: 420px; border-radius: 18px; }
.form { display: grid; gap: 12px; max-width: 640px; }
label { display: grid; gap: 6px; color: var(--muted); }
input, textarea { border: 1px solid var(--line); background: #100e0c; color: var(--text); border-radius: 12px; padding: 12px; font: inherit; }
.footer { padding: 10px 6vw 36px; }
@media (max-width: 800px) {
  .grid, .about { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; background: transparent; color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
  .nav-links { display: none; position: absolute; top: 64px; left: 0; right: 0; flex-direction: column; background: #1e1a16; padding: 12px 6vw 16px; }
  .nav-links.open { display: flex; }
}
`;

const portfolioJs = `var FALLBACK_PROJECTS = [
  { title: "Harbor Banking", category: "product", summary: "A calmer home for everyday money.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=700&fit=crop&q=80" },
  { title: "Field & Rye", category: "brand", summary: "Identity for a neighborhood bakery.", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&h=700&fit=crop&q=80" },
  { title: "Atlas Notes", category: "web", summary: "A writing tool with a quiet reading view.", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&h=700&fit=crop&q=80" },
  { title: "Lumen Health", category: "product", summary: "Appointment booking for a small clinic.", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=700&fit=crop&q=80" },
  { title: "Paperplane", category: "web", summary: "Marketing site for a courier collective.", image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&h=700&fit=crop&q=80" },
  { title: "Kinfolk Goods", category: "brand", summary: "Packaging and a shop front for home objects.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=700&fit=crop&q=80" }
];

var projects = FALLBACK_PROJECTS.slice();
var filter = "all";

function renderProjects() {
  var root = document.getElementById("projects");
  var visible = projects.filter(function (project) { return filter === "all" || project.category === filter; });
  root.innerHTML = visible.map(function (project) {
    return '<article class="card"><img src="' + project.image + '" alt="' + project.title + '" /><div><p class="tag">' + project.category + '</p><h3>' + project.title + '</h3><p>' + project.summary + '</p></div></article>';
  }).join("");
}

fetch("/api/projects")
  .then(function (res) { if (!res.ok) throw new Error("offline"); return res.json(); })
  .then(function (data) { if (Array.isArray(data) && data.length) projects = data; renderProjects(); })
  .catch(function () { renderProjects(); });

document.getElementById("filters").addEventListener("click", function (event) {
  var button = event.target.closest("button");
  if (!button) return;
  filter = button.getAttribute("data-filter");
  document.querySelectorAll("#filters button").forEach(function (item) { item.classList.remove("is-active"); });
  button.classList.add("is-active");
  renderProjects();
});

var navToggle = document.querySelector("[data-nav-toggle]");
var navMenu = document.querySelector("[data-nav-menu]");
if (navToggle && navMenu) navToggle.addEventListener("click", function () { navMenu.classList.toggle("open"); });

document.getElementById("message-form").addEventListener("submit", function (event) {
  event.preventDefault();
  var form = event.currentTarget;
  var data = new FormData(form);
  var payload = {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    message: String(data.get("message") || "").trim()
  };
  var status = document.getElementById("message-status");
  fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(function (res) {
    if (!res.ok) throw new Error("offline");
    status.textContent = "Message received by the API.";
    form.reset();
  }).catch(function () {
    status.textContent = "API offline — your note stayed in this preview.";
    form.reset();
  });
});
`;

const portfolioServer = expressServer(`
const projects = [
  { title: "Harbor Banking", category: "product", summary: "A calmer home for everyday money.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=700&fit=crop&q=80" },
  { title: "Field & Rye", category: "brand", summary: "Identity for a neighborhood bakery.", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&h=700&fit=crop&q=80" },
  { title: "Atlas Notes", category: "web", summary: "A writing tool with a quiet reading view.", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&h=700&fit=crop&q=80" },
  { title: "Lumen Health", category: "product", summary: "Appointment booking for a small clinic.", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=700&fit=crop&q=80" },
  { title: "Paperplane", category: "web", summary: "Marketing site for a courier collective.", image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&h=700&fit=crop&q=80" },
  { title: "Kinfolk Goods", category: "brand", summary: "Packaging and a shop front for home objects.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=700&fit=crop&q=80" }
];
const messages = [];

app.get("/api/projects", (_req, res) => {
  res.json(projects);
});

app.post("/api/messages", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();
  if (!name || !email || !message) return res.status(400).json({ error: "All fields are required." });
  const saved = { id: Date.now(), name, email, message };
  messages.push(saved);
  res.status(201).json(saved);
});
`);

const marketHtml = page(
  "Harbor Market — goods for the table",
  `  <header class="nav">
    <a class="logo" href="#top">Harbor Market</a>
    <button class="nav-toggle" data-nav-toggle type="button" aria-label="Open menu">Menu</button>
    <nav class="nav-links" data-nav-menu>
      <a href="#shop">Shop</a>
      <a href="#story">Story</a>
      <a href="#checkout">Checkout</a>
    </nav>
    <button class="btn btn-small" id="open-cart" type="button">Cart <span id="cart-count">0</span></button>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="eyebrow">Weekend provisions</p>
        <h1>Groceries, ceramics, and the good olive oil.</h1>
        <p class="lede">A storefront with a working cart. Products come from <code>/api/products</code>. Checkout posts the order to <code>/api/orders</code>.</p>
        <a class="btn" href="#shop">Browse the stall</a>
      </div>
      <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=900&fit=crop&q=80" alt="Fresh market produce on a wooden table" />
    </section>
    <section id="shop" class="section">
      <h2>This week's stall</h2>
      <div id="products" class="grid"></div>
    </section>
    <section id="story" class="story">
      <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=800&fit=crop&q=80" alt="Outdoor market stalls" />
      <div>
        <h2>From the harbor, twice a week.</h2>
        <p>Harbor Market lists what is actually in the crates. The page keeps a local copy of the catalog so shoppers can still fill a cart in the preview.</p>
      </div>
    </section>
    <section id="checkout" class="section">
      <h2>Checkout</h2>
      <div class="checkout">
        <ul id="cart-lines"></ul>
        <p class="total">Total <strong id="cart-total">$0</strong></p>
        <form id="order-form" class="form">
          <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
          <button class="btn" type="submit">Place order</button>
          <p id="order-status" class="status" role="status"></p>
        </form>
      </div>
    </section>
  </main>
  <footer class="footer">Harbor Market · catalog, cart, and orders API</footer>`,
);

const marketCss = `:root {
  --bg: #f4f7f2; --card: #ffffff; --text: #142116; --muted: #526055; --primary: #1f7a4d; --line: rgba(20,33,22,.12);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); }
a { color: inherit; text-decoration: none; }
img { width: 100%; display: block; object-fit: cover; }
code { color: var(--primary); }
.nav { display: flex; align-items: center; gap: 16px; padding: 14px 6vw; background: rgba(244,247,242,.92); position: sticky; top: 0; z-index: 4; border-bottom: 1px solid var(--line); }
.logo { font-weight: 700; margin-right: auto; }
.nav-links { display: flex; gap: 16px; color: var(--muted); }
.nav-toggle { display: none; }
.btn { border: 0; background: var(--primary); color: white; border-radius: 999px; padding: 12px 16px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; }
.btn-small { padding: 8px 12px; }
.hero, .section, .story { padding: 56px 6vw; }
.hero, .story { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
.hero img, .story img { border-radius: 22px; min-height: 300px; height: 360px; }
.eyebrow { color: var(--primary); letter-spacing: .08em; text-transform: uppercase; font-size: 12px; font-weight: 700; }
h1 { font-size: clamp(36px, 5vw, 60px); line-height: 1.05; margin: 8px 0; }
h2 { font-size: 32px; margin-top: 0; }
.lede, .card p, .story p, .footer, .total { color: var(--muted); line-height: 1.55; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card { background: var(--card); border-radius: 18px; overflow: hidden; border: 1px solid var(--line); }
.card img { height: 180px; }
.card div { padding: 14px; display: grid; gap: 8px; }
.price { font-weight: 700; color: var(--text); }
.checkout, .form { display: grid; gap: 12px; max-width: 560px; }
#cart-lines { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
#cart-lines li, .form { background: white; border: 1px solid var(--line); border-radius: 14px; padding: 12px; }
input { border: 1px solid var(--line); border-radius: 10px; padding: 12px; font: inherit; width: 100%; }
label { display: grid; gap: 6px; }
.footer { padding: 8px 6vw 32px; }
@media (max-width: 800px) {
  .hero, .story, .grid { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; background: white; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
  .nav-links { display: none; position: absolute; top: 58px; left: 0; right: 0; flex-direction: column; background: white; padding: 12px 6vw; }
  .nav-links.open { display: flex; }
}
`;

const marketJs = `var FALLBACK_PRODUCTS = [
  { id: "oil", name: "Coastal olive oil", price: 18, detail: "500ml, peppery finish", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop&q=80" },
  { id: "bowl", name: "Stoneware bowl", price: 32, detail: "Speckled glaze, set of one", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=600&fit=crop&q=80" },
  { id: "melon", name: "Market melon", price: 14, detail: "Seasonal fruit", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop&q=80" },
  { id: "bread", name: "Saturday loaf", price: 8, detail: "Country sourdough", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&q=80" },
  { id: "tea", name: "Harbor breakfast tea", price: 12, detail: "Malty black tea, 40 cups", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop&q=80" },
  { id: "candle", name: "Dock candle", price: 22, detail: "Cedar and salt", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&h=600&fit=crop&q=80" }
];

var products = FALLBACK_PRODUCTS.slice();
var cart = [];

function money(cents) { return "$" + cents; }

function renderProducts() {
  document.getElementById("products").innerHTML = products.map(function (product) {
    return '<article class="card"><img src="' + product.image + '" alt="' + product.name + '" /><div><h3>' + product.name + '</h3><p>' + product.detail + '</p><p class="price">' + money(product.price) + '</p><button class="btn" type="button" data-add="' + product.id + '">Add to cart</button></div></article>';
  }).join("");
}

function renderCart() {
  var lines = document.getElementById("cart-lines");
  var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  var total = cart.reduce(function (sum, item) { return sum + item.qty * item.price; }, 0);
  document.getElementById("cart-count").textContent = String(count);
  document.getElementById("cart-total").textContent = money(total);
  lines.innerHTML = cart.length
    ? cart.map(function (item) { return "<li>" + item.qty + " × " + item.name + " <strong>" + money(item.qty * item.price) + "</strong></li>"; }).join("")
    : "<li>Your cart is empty.</li>";
}

document.getElementById("products").addEventListener("click", function (event) {
  var button = event.target.closest("[data-add]");
  if (!button) return;
  var product = products.find(function (item) { return item.id === button.getAttribute("data-add"); });
  if (!product) return;
  var existing = cart.find(function (item) { return item.id === product.id; });
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  renderCart();
});

document.getElementById("open-cart").addEventListener("click", function () {
  document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
});

var navToggle = document.querySelector("[data-nav-toggle]");
var navMenu = document.querySelector("[data-nav-menu]");
if (navToggle && navMenu) navToggle.addEventListener("click", function () { navMenu.classList.toggle("open"); });

document.getElementById("order-form").addEventListener("submit", function (event) {
  event.preventDefault();
  var status = document.getElementById("order-status");
  if (!cart.length) { status.textContent = "Add something from the stall first."; return; }
  var form = event.currentTarget;
  var payload = { email: String(new FormData(form).get("email") || "").trim(), items: cart };
  fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(function (res) {
    if (!res.ok) throw new Error("offline");
    return res.json();
  }).then(function (order) {
    status.textContent = "Order " + order.id + " saved by the API.";
    cart = [];
    form.reset();
    renderCart();
  }).catch(function () {
    status.textContent = "API offline — cart kept locally so you can still review it.";
  });
});

fetch("/api/products")
  .then(function (res) { if (!res.ok) throw new Error("offline"); return res.json(); })
  .then(function (data) { if (Array.isArray(data) && data.length) products = data; renderProducts(); })
  .catch(function () { renderProducts(); });

renderCart();
`;

const marketServer = expressServer(`
const products = [
  { id: "oil", name: "Coastal olive oil", price: 18, detail: "500ml, peppery finish", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop&q=80" },
  { id: "bowl", name: "Stoneware bowl", price: 32, detail: "Speckled glaze, set of one", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=600&fit=crop&q=80" },
  { id: "melon", name: "Market melon", price: 14, detail: "Seasonal fruit", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop&q=80" },
  { id: "bread", name: "Saturday loaf", price: 8, detail: "Country sourdough", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&q=80" },
  { id: "tea", name: "Harbor breakfast tea", price: 12, detail: "Malty black tea, 40 cups", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop&q=80" },
  { id: "candle", name: "Dock candle", price: 22, detail: "Cedar and salt", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&h=600&fit=crop&q=80" }
];
const orders = [];

app.get("/api/products", (_req, res) => {
  res.json(products);
});

app.post("/api/orders", (req, res) => {
  const email = String(req.body.email || "").trim();
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!email || items.length === 0) return res.status(400).json({ error: "Email and items are required." });
  const order = { id: "HM-" + Date.now(), email, items };
  orders.push(order);
  res.status(201).json(order);
});
`);

const tasksHtml = page(
  "Field Desk — tasks for the build",
  `  <header class="nav">
    <a class="logo" href="#top">Field Desk</a>
    <p class="nav-note">Tasks sync to <code>/api/tasks</code></p>
  </header>
  <main id="top">
    <section class="hero">
      <div>
        <p class="eyebrow">Project board</p>
        <h1>Keep the build list next to the website.</h1>
        <p class="lede">Add, complete, and remove tasks. The board calls a small REST API and keeps working in the preview when Express is not running.</p>
      </div>
      <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=800&fit=crop&q=80" alt="Notebook with a handwritten task list" />
    </section>
    <section class="section board">
      <form id="task-form" class="composer">
        <input name="task" required placeholder="Write the next task" aria-label="Task title" />
        <button class="btn" type="submit">Add task</button>
      </form>
      <p id="task-status" class="status" role="status"></p>
      <ul id="tasks"></ul>
    </section>
    <section class="section notes">
      <h2>What the API does</h2>
      <div class="grid">
        <article><h3>GET /api/tasks</h3><p>Loads the board.</p></article>
        <article><h3>POST /api/tasks</h3><p>Creates a task from the composer.</p></article>
        <article><h3>PATCH /api/tasks/:id</h3><p>Toggles done.</p></article>
        <article><h3>DELETE /api/tasks/:id</h3><p>Removes a card.</p></article>
      </div>
    </section>
  </main>
  <footer class="footer">Field Desk · HTML board with an Express task API</footer>`,
);

const tasksCss = `:root {
  --bg: #0e1412; --card: #17211d; --text: #e7f3ec; --muted: #9bb0a6; --primary: #3ddc97; --line: rgba(231,243,236,.12);
}
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); }
a { color: inherit; text-decoration: none; }
img { width: 100%; height: 280px; object-fit: cover; border-radius: 18px; display: block; }
code { color: var(--primary); }
.nav, .hero, .section { padding: 28px 6vw; }
.nav { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.logo { font-weight: 700; font-size: 20px; }
.nav-note, .lede, .footer, .status, article p { color: var(--muted); }
.hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 28px; align-items: center; padding-top: 10px; }
.eyebrow { color: var(--primary); letter-spacing: .08em; text-transform: uppercase; font-size: 12px; }
h1 { font-size: clamp(34px, 5vw, 56px); line-height: 1.05; margin: 8px 0; }
.board { display: grid; gap: 12px; }
.composer { display: flex; gap: 8px; }
input { flex: 1; border: 1px solid var(--line); background: #101815; color: var(--text); border-radius: 12px; padding: 12px 14px; font: inherit; }
.btn { border: 0; background: var(--primary); color: #062117; font-weight: 700; border-radius: 12px; padding: 12px 16px; cursor: pointer; }
#tasks { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.task { display: flex; align-items: center; gap: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; }
.task.done span { text-decoration: line-through; color: var(--muted); }
.task button { margin-left: auto; background: transparent; color: var(--muted); border: 0; cursor: pointer; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
article { background: var(--card); border-radius: 14px; padding: 14px; border: 1px solid var(--line); }
article h3 { margin: 0 0 6px; font-size: 15px; }
.footer { padding: 8px 6vw 32px; }
@media (max-width: 800px) {
  .hero, .grid, .composer { grid-template-columns: 1fr; display: grid; }
  .nav { flex-direction: column; }
}
`;

const tasksJs = `var FALLBACK_TASKS = [
  { id: 1, title: "Sketch the hero section", done: true },
  { id: 2, title: "Connect the contact form to the API", done: false },
  { id: 3, title: "Check the layout at 390px", done: false }
];

var tasks = FALLBACK_TASKS.slice();
var usingApi = false;

function renderTasks() {
  document.getElementById("tasks").innerHTML = tasks.map(function (task) {
    return '<li class="task' + (task.done ? " done" : "") + '"><input type="checkbox" data-toggle="' + task.id + '"' + (task.done ? " checked" : "") + ' /><span>' + task.title + '</span><button type="button" data-delete="' + task.id + '">Remove</button></li>';
  }).join("");
}

function setStatus(text) {
  document.getElementById("task-status").textContent = text;
}

function loadTasks() {
  fetch("/api/tasks")
    .then(function (res) { if (!res.ok) throw new Error("offline"); return res.json(); })
    .then(function (data) {
      if (Array.isArray(data)) { tasks = data; usingApi = true; setStatus("Loaded from the API."); }
      renderTasks();
    })
    .catch(function () { usingApi = false; setStatus("API offline — editing a local copy."); renderTasks(); });
}

document.getElementById("task-form").addEventListener("submit", function (event) {
  event.preventDefault();
  var form = event.currentTarget;
  var title = String(new FormData(form).get("task") || "").trim();
  if (!title) return;
  var created = { id: Date.now(), title: title, done: false };
  var finish = function () { form.reset(); renderTasks(); };
  if (!usingApi) { tasks.unshift(created); finish(); return; }
  fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title })
  }).then(function (res) { if (!res.ok) throw new Error("offline"); return res.json(); })
    .then(function (task) { tasks.unshift(task); finish(); })
    .catch(function () { usingApi = false; tasks.unshift(created); setStatus("API offline — task kept locally."); finish(); });
});

document.getElementById("tasks").addEventListener("click", function (event) {
  var toggle = event.target.closest("[data-toggle]");
  var remove = event.target.closest("[data-delete]");
  if (toggle) {
    var id = Number(toggle.getAttribute("data-toggle"));
    var task = tasks.find(function (item) { return item.id === id; });
    if (!task) return;
    task.done = toggle.checked;
    renderTasks();
    if (usingApi) {
      fetch("/api/tasks/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: task.done })
      }).catch(function () { setStatus("Could not update the API. Local board still changed."); });
    }
  }
  if (remove) {
    var removeId = Number(remove.getAttribute("data-delete"));
    tasks = tasks.filter(function (item) { return item.id !== removeId; });
    renderTasks();
    if (usingApi) {
      fetch("/api/tasks/" + removeId, { method: "DELETE" })
        .catch(function () { setStatus("Could not delete on the API. Removed locally."); });
    }
  }
});

loadTasks();
`;

const tasksServer = expressServer(`
let tasks = [
  { id: 1, title: "Sketch the hero section", done: true },
  { id: 2, title: "Connect the contact form to the API", done: false },
  { id: 3, title: "Check the layout at 390px", done: false }
];

app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "Title is required." });
  const task = { id: Date.now(), title, done: false };
  tasks.unshift(task);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find((item) => String(item.id) === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found." });
  if (typeof req.body.done === "boolean") task.done = req.body.done;
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const before = tasks.length;
  tasks = tasks.filter((item) => String(item.id) !== req.params.id);
  if (tasks.length === before) return res.status(404).json({ error: "Task not found." });
  res.status(204).end();
});
`);

function automation(config: Omit<WebsiteAutomation, "prompt" | "files"> & { brief: string; files: WebsiteFile[] }): WebsiteAutomation {
  return {
    id: config.id,
    icon: config.icon,
    label: config.label,
    description: config.description,
    stack: config.stack,
    prompt: buildWebsiteGeneratorPrompt(config.brief),
    files: config.files,
  };
}

function browserApi(source: string): string {
  const calls = source.replace(/\bfetch\(/g, "api(");
  return `function api(url, options) {
  if (typeof fetch !== "function") return Promise.reject(new Error("offline"));
  return fetch(url, options);
}
${calls}`;
}

function files(html: string, css: string, js: string, server: string, packageName: string, packageDescription: string): WebsiteFile[] {
  return [
    { name: "index.html", language: "html", role: "page", content: html },
    { name: "styles.css", language: "css", role: "style", content: css },
    { name: "script.js", language: "javascript", role: "client", content: browserApi(js) },
    { name: "server.js", language: "javascript", role: "server", content: server },
    { name: "package.json", language: "json", role: "config", content: sitePackage(packageName, packageDescription) },
  ];
}

export const WEBSITE_AUTOMATIONS: WebsiteAutomation[] = [
  automation({
    id: "saas-landing",
    icon: "🚀",
    label: "Launchpad",
    description: "Marketing site with pricing and a lead form",
    stack: "HTML · CSS · JS · Express",
    brief: "Launchpad, a SaaS marketing site with a hero, three feature cards, monthly/yearly pricing loaded from GET /api/plans, and a contact form that POSTs to /api/leads. Keep fallback plans in the browser.",
    files: files(launchpadHtml, launchpadCss, launchpadJs, launchpadServer, "launchpad-site", "Launchpad marketing site with a lead API"),
  }),
  automation({
    id: "portfolio",
    icon: "🎨",
    label: "North Studio",
    description: "Portfolio with a filterable project grid",
    stack: "HTML · CSS · JS · Express",
    brief: "North Studio, a portfolio with projects from GET /api/projects, category filters, an about section, and a contact form that POSTs to /api/messages.",
    files: files(portfolioHtml, portfolioCss, portfolioJs, portfolioServer, "north-studio", "Portfolio site with a projects API"),
  }),
  automation({
    id: "storefront",
    icon: "🛍️",
    label: "Harbor Market",
    description: "Shop with a cart and checkout",
    stack: "HTML · CSS · JS · Express",
    brief: "Harbor Market, a grocery storefront. Products come from GET /api/products. The cart is client-side. Checkout POSTs to /api/orders.",
    files: files(marketHtml, marketCss, marketJs, marketServer, "harbor-market", "Storefront with a catalog and orders API"),
  }),
  automation({
    id: "task-board",
    icon: "✅",
    label: "Field Desk",
    description: "Task board backed by a REST API",
    stack: "HTML · CSS · JS · Express",
    brief: "Field Desk, a task board. GET and POST /api/tasks, PATCH and DELETE /api/tasks/:id. The page must still add and complete tasks when the API is offline.",
    files: files(tasksHtml, tasksCss, tasksJs, tasksServer, "field-desk", "Task board with a REST API"),
  }),
];

export function getWebsiteAutomation(id: string): WebsiteAutomation | undefined {
  return WEBSITE_AUTOMATIONS.find((item) => item.id === id);
}
