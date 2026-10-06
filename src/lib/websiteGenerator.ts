/**
 * Full-stack website generator used by the Web Development AI assistant.
 * Each blueprint is a runnable site: vanilla HTML/CSS/JS for the in-editor
 * preview, plus a Node HTTP server that serves those files and a JSON API.
 * The browser script always keeps a local fallback so the preview works
 * before the API process is started.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "store";

export interface WebsiteFile {
  name: string;
  language: string;
  content: string;
}

export interface WebsiteBlueprint {
  id: WebsiteKind;
  label: string;
  description: string;
  files: WebsiteFile[];
}

interface SiteTheme {
  bg: string;
  ink: string;
  muted: string;
  primary: string;
  primaryInk: string;
  card: string;
  line: string;
  accent: string;
}

const REQUIRED_FILES = ["index.html", "styles.css", "script.js", "server.js", "package.json"] as const;

export function shouldInjectPreviewScript(name: string, content: string): boolean {
  if (!/\.(js|mjs|cjs|ts)$/i.test(name) || name.includes("/")) return false;
  if (/(^|\/)server\.(js|mjs|cjs)$/i.test(name)) return false;
  if (/\brequire\s*\(\s*['"](?:http|fs|path|url|node:)/.test(content)) return false;
  if (/\bcreateServer\s*\(/.test(content)) return false;
  return true;
}

export function getWebsiteBlueprint(kind: WebsiteKind): WebsiteBlueprint {
  const found = WEBSITE_BLUEPRINTS.find((blueprint) => blueprint.id === kind);
  if (!found) throw new Error(`Unknown website blueprint: ${kind}`);
  return found;
}

export function buildWebsitePrompt(brief: string, kind: WebsiteKind = "landing"): string {
  const blueprint = getWebsiteBlueprint(kind);
  const cleanBrief = brief.trim() || blueprint.description;
  return `Use the full-stack website generator. Build a ${blueprint.label.toLowerCase()} website.

Brief: ${cleanBrief}

Return exactly these sibling files, each with its filename on the line before the fence:
index.html
styles.css
script.js
server.js
package.json

Rules:
- Vanilla HTML, CSS, and JavaScript only. No React, JSX, TypeScript, Vue, or npm UI libraries.
- index.html links styles.css and script.js, loads a Google font, and sets data-themed on body.
- script.js renders the page from embedded fallback data, then tries fetch("/api/...") and uses the fallback if the request fails.
- server.js uses Node's built-in http, fs, and path. ROOT is __dirname. It serves the sibling files and the JSON routes script.js calls.
- package.json start script is "node server.js".
- Include real images (Unsplash or picsum), a responsive layout, and at least one form or interactive control wired to the API.`;
}

function page(title: string, site: WebsiteKind, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed data-site="${site}">
${body}
  <script src="script.js"></script>
</body>
</html>
`;
}

function siteCss(theme: SiteTheme): string {
  return `:root {
  --bg: ${theme.bg};
  --ink: ${theme.ink};
  --muted: ${theme.muted};
  --primary: ${theme.primary};
  --primary-ink: ${theme.primaryInk};
  --card: ${theme.card};
  --line: ${theme.line};
  --accent: ${theme.accent};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Outfit, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
h1, h2, h3 { font-family: Fraunces, serif; line-height: 1.1; margin: 0 0 0.4rem; }
p { margin: 0; }
.wrap { width: min(1120px, calc(100% - 2rem)); margin: 0 auto; }
.nav {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.9rem 0; background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px); border-bottom: 1px solid var(--line);
}
.brand { font-weight: 600; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 1.1rem; align-items: center; }
.nav-toggle { display: none; background: none; border: 1px solid var(--line); color: var(--ink); border-radius: 8px; padding: 0.35rem 0.6rem; }
.btn, button.btn {
  border: 0; cursor: pointer; border-radius: 999px; padding: 0.7rem 1.1rem;
  background: var(--primary); color: var(--primary-ink); font: 600 0.95rem Outfit, sans-serif;
}
.btn.ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; align-items: center; padding: 3.5rem 0 2rem; }
.hero img, .cover { width: 100%; height: 360px; border-radius: 24px; }
.kicker { color: var(--accent); font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; }
.lede { color: var(--muted); font-size: 1.05rem; max-width: 46ch; }
.actions { display: flex; gap: 0.7rem; margin-top: 1.2rem; flex-wrap: wrap; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 1rem; overflow: hidden;
}
.card img { height: 160px; width: 100%; border-radius: 12px; margin-bottom: 0.8rem; }
.muted { color: var(--muted); }
.section { padding: 2.2rem 0; }
.price { font-size: 1.8rem; font-family: Fraunces, serif; }
form { display: grid; gap: 0.7rem; }
input, textarea, select {
  width: 100%; padding: 0.75rem 0.8rem; border-radius: 12px;
  border: 1px solid var(--line); background: transparent; color: var(--ink); font: inherit;
}
.note { min-height: 1.2rem; color: var(--accent); font-size: 0.92rem; }
.footer { border-top: 1px solid var(--line); padding: 1.4rem 0 2rem; color: var(--muted); }
.tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin: 0.7rem 0; }
.tag { border: 1px solid var(--line); border-radius: 999px; padding: 0.25rem 0.7rem; background: transparent; color: var(--ink); cursor: pointer; }
.tag.active { background: var(--primary); color: var(--primary-ink); border-color: transparent; }
.cart { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
@media (max-width: 800px) {
  .hero, .grid { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  .nav-links { display: none; position: absolute; top: 58px; left: 1rem; right: 1rem; flex-direction: column; padding: 0.8rem; background: var(--card); border: 1px solid var(--line); border-radius: 14px; }
  .nav-links.open { display: flex; }
}
`;
}

function serverSource(siteName: string, dataAndRoutes: string): string {
  return `// ${siteName} — static files + JSON API (Node, no extra dependencies)
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

${dataAndRoutes}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (err) { reject(err); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  try {
    const handled = await handleApi(req, res, url);
    if (handled) return;
  } catch (err) {
    sendJson(res, 400, { error: err instanceof Error ? err.message : "Bad request" });
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const rel = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\\//, "");
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
    };
    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log("${siteName} running at http://localhost:" + PORT);
});
`;
}

function packageJson(name: string, description: string): string {
  return JSON.stringify({
    name,
    version: "1.0.0",
    private: true,
    description,
    scripts: { start: "node src/server.js" },
  }, null, 2) + "\n";
}

function readme(title: string, summary: string): string {
  return `# ${title}

${summary}

## Files
- \`index.html\`, \`styles.css\`, \`script.js\` — site the editor can preview immediately
- \`server.js\` — Node HTTP server that serves those files and the JSON API
- \`package.json\` — \`npm start\` runs the server

The in-editor preview uses the sample data inside \`script.js\` when \`/api\` is not reachable.
From the project root, start the API with \`npm start\` or \`node src/server.js\`.
`;
}

const landingFeatures = [
  { title: "Launch in a day", detail: "A complete page, form, and API instead of a blank file." },
  { title: "Preview first", detail: "The browser view runs even before the Node server starts." },
  { title: "Ship the API", detail: "Leads post to /api/leads and features load from /api/features." },
];

const landing = (): WebsiteBlueprint => ({
  id: "landing",
  label: "Landing page",
  description: "Marketing site with a hero, feature grid, pricing, and a lead form.",
  files: [
    {
      name: "index.html",
      language: "html",
      content: page("Lumen — Studio sites", "landing", `  <header class="wrap nav">
    <a class="brand" href="#top">Lumen</a>
    <button class="nav-toggle" data-nav-toggle type="button">Menu</button>
    <nav class="nav-links" data-nav>
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="top">
    <section class="wrap hero">
      <div>
        <p class="kicker">Full-stack starter</p>
        <h1>Websites with a front end and an API.</h1>
        <p class="lede">Lumen is a small studio site: a responsive page, sample content, and a Node server that collects leads.</p>
        <div class="actions">
          <a class="btn" href="#contact">Start a project</a>
          <a class="btn ghost" href="#features">See the stack</a>
        </div>
      </div>
      <img alt="Team working on a product" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80" />
    </section>
    <section class="wrap section" id="features">
      <h2>What you get</h2>
      <div class="grid" id="feature-grid"></div>
    </section>
    <section class="wrap section" id="pricing">
      <h2>Pricing</h2>
      <div class="grid">
        <article class="card"><h3>Launch</h3><p class="price">$0</p><p class="muted">Preview the generated site in the editor.</p></article>
        <article class="card"><h3>Studio</h3><p class="price">$29</p><p class="muted">Run the Node API and store leads locally.</p></article>
        <article class="card"><h3>Studio+</h3><p class="price">$79</p><p class="muted">Customize the brief and regenerate with AI.</p></article>
      </div>
    </section>
    <section class="wrap section" id="contact">
      <div class="grid" style="grid-template-columns: 1fr 1fr;">
        <div>
          <h2>Tell us about the site.</h2>
          <p class="lede">The form posts to <code>/api/leads</code>. In the preview, a failed request still confirms locally.</p>
        </div>
        <form id="lead-form" class="card">
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <textarea name="idea" rows="4" placeholder="What should the site do?"></textarea>
          <button class="btn" type="submit">Send</button>
          <p class="note" id="lead-note"></p>
        </form>
      </div>
    </section>
  </main>
  <footer class="wrap footer">Lumen · HTML, CSS, JS, and a Node API</footer>`),
    },
    {
      name: "styles.css",
      language: "css",
      content: siteCss({
        bg: "#f6f3ec",
        ink: "#1c1915",
        muted: "#5e584e",
        primary: "#1f6f5b",
        primaryInk: "#f6f3ec",
        card: "#fffdf8",
        line: "#e4dccb",
        accent: "#9a4e1c",
      }),
    },
    {
      name: "script.js",
      language: "javascript",
      content: `const FALLBACK_FEATURES = ${JSON.stringify(landingFeatures, null, 2)};

function wireNav() {
  const button = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  button?.addEventListener("click", () => nav?.classList.toggle("open"));
}

function renderFeatures(features) {
  const grid = document.getElementById("feature-grid");
  if (!grid) return;
  grid.innerHTML = features.map((feature) => \`
    <article class="card">
      <h3>\${feature.title}</h3>
      <p class="muted">\${feature.detail}</p>
    </article>\`).join("");
}

async function loadFeatures() {
  let features = FALLBACK_FEATURES;
  try {
    const response = await fetch("/api/features");
    if (response.ok) features = await response.json();
  } catch {
    features = FALLBACK_FEATURES;
  }
  renderFeatures(features);
}

function wireForm() {
  const form = document.getElementById("lead-form");
  const note = document.getElementById("lead-note");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Request failed");
      note.textContent = "Saved through the API.";
    } catch {
      note.textContent = "API offline — saved in this preview only.";
    }
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  loadFeatures();
  wireForm();
});
`,
    },
    {
      name: "server.js",
      language: "javascript",
      content: serverSource("Lumen", `const FEATURES = ${JSON.stringify(landingFeatures, null, 2)};
const leads = [];

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, site: "Lumen" });
    return true;
  }
  if (req.method === "GET" && url.pathname === "/api/features") {
    sendJson(res, 200, FEATURES);
    return true;
  }
  if (req.method === "POST" && url.pathname === "/api/leads") {
    const body = await readBody(req);
    if (!body.email) {
      sendJson(res, 422, { error: "Email is required" });
      return true;
    }
    const lead = { id: leads.length + 1, name: body.name || "", email: body.email, idea: body.idea || "" };
    leads.push(lead);
    sendJson(res, 201, { ok: true, lead });
    return true;
  }
  return false;
}`),
    },
    { name: "package.json", language: "json", content: packageJson("lumen-landing", "Full-stack marketing site with a leads API") },
    { name: "README.md", language: "markdown", content: readme("Lumen", "Marketing landing page with feature content and a lead form.") },
  ],
});

const projects = [
  { id: "atlas", title: "Atlas Transit", tag: "Product", summary: "Route maps and live status for a city transit app.", image: "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=80" },
  { id: "harbor", title: "Harbor Goods", tag: "Shop", summary: "Catalog, cart, and checkout for a coastal store.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" },
  { id: "folio", title: "North Folio", tag: "Brand", summary: "Editorial portfolio with case-study pages.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" },
];

const portfolio = (): WebsiteBlueprint => ({
  id: "portfolio",
  label: "Portfolio",
  description: "Case-study portfolio with tag filters and a projects API.",
  files: [
    {
      name: "index.html",
      language: "html",
      content: page("North Studio — Portfolio", "portfolio", `  <header class="wrap nav">
    <a class="brand" href="#top">North Studio</a>
    <button class="nav-toggle" data-nav-toggle type="button">Menu</button>
    <nav class="nav-links" data-nav>
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="top">
    <section class="wrap hero">
      <div>
        <p class="kicker">Selected work</p>
        <h1>Interfaces for products people use every day.</h1>
        <p class="lede">Three case studies loaded from <code>/api/projects</code>, with a local fallback for the editor preview.</p>
      </div>
      <img alt="Designer desk" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80" />
    </section>
    <section class="wrap section" id="work">
      <h2>Projects</h2>
      <div class="tags" id="filters"></div>
      <div class="grid" id="project-grid"></div>
    </section>
    <section class="wrap section" id="about">
      <div class="card">
        <h2>About</h2>
        <p class="muted">North Studio designs product sites and ships them with a small Node API so the content is not trapped in the HTML.</p>
      </div>
    </section>
    <section class="wrap section" id="contact">
      <form id="contact-form" class="card">
        <h2>Start a brief</h2>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <textarea name="message" rows="4" placeholder="Project notes"></textarea>
        <button class="btn" type="submit">Send brief</button>
        <p class="note" id="contact-note"></p>
      </form>
    </section>
  </main>
  <footer class="wrap footer">North Studio · portfolio generator</footer>`),
    },
    {
      name: "styles.css",
      language: "css",
      content: siteCss({
        bg: "#12151c",
        ink: "#f3efe6",
        muted: "#b7b1a6",
        primary: "#e7ff6a",
        primaryInk: "#17190d",
        card: "#1c212b",
        line: "#2d3442",
        accent: "#8eb6ff",
      }),
    },
    {
      name: "script.js",
      language: "javascript",
      content: `const FALLBACK_PROJECTS = ${JSON.stringify(projects, null, 2)};
let activeTag = "All";
let projects = FALLBACK_PROJECTS;

function wireNav() {
  document.querySelector("[data-nav-toggle]")?.addEventListener("click", () => {
    document.querySelector("[data-nav]")?.classList.toggle("open");
  });
}

function render() {
  const tags = ["All", ...new Set(projects.map((project) => project.tag))];
  const filters = document.getElementById("filters");
  const grid = document.getElementById("project-grid");
  if (!filters || !grid) return;
  filters.innerHTML = tags.map((tag) => \`<button class="tag \${tag === activeTag ? "active" : ""}" data-tag="\${tag}" type="button">\${tag}</button>\`).join("");
  filters.querySelectorAll("[data-tag]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTag = button.getAttribute("data-tag") || "All";
      render();
    });
  });
  const visible = projects.filter((project) => activeTag === "All" || project.tag === activeTag);
  grid.innerHTML = visible.map((project) => \`
    <article class="card">
      <img alt="" src="\${project.image}" />
      <p class="kicker">\${project.tag}</p>
      <h3>\${project.title}</h3>
      <p class="muted">\${project.summary}</p>
    </article>\`).join("");
}

async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    if (response.ok) projects = await response.json();
  } catch {
    projects = FALLBACK_PROJECTS;
  }
  render();
}

function wireForm() {
  const form = document.getElementById("contact-form");
  const note = document.getElementById("contact-note");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Request failed");
      note.textContent = "Inquiry stored by the API.";
    } catch {
      note.textContent = "API offline — noted in the preview only.";
    }
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  loadProjects();
  wireForm();
});
`,
    },
    {
      name: "server.js",
      language: "javascript",
      content: serverSource("North Studio", `const PROJECTS = ${JSON.stringify(projects, null, 2)};
const inquiries = [];

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/projects") {
    sendJson(res, 200, PROJECTS);
    return true;
  }
  if (req.method === "POST" && url.pathname === "/api/inquiries") {
    const body = await readBody(req);
    if (!body.email) {
      sendJson(res, 422, { error: "Email is required" });
      return true;
    }
    const inquiry = { id: inquiries.length + 1, name: body.name || "", email: body.email, message: body.message || "" };
    inquiries.push(inquiry);
    sendJson(res, 201, { ok: true, inquiry });
    return true;
  }
  return false;
}`),
    },
    { name: "package.json", language: "json", content: packageJson("north-portfolio", "Portfolio site with a projects API") },
    { name: "README.md", language: "markdown", content: readme("North Studio", "Portfolio with filterable case studies and a contact API.") },
  ],
});

const posts = [
  { slug: "shipping-a-page", title: "Shipping a page before the backend", excerpt: "Keep sample data in the browser so the layout can be reviewed immediately.", body: "The preview iframe cannot rely on a local Node process. The page renders FALLBACK posts first, then replaces them when /api/posts responds." },
  { slug: "type-and-space", title: "Type and space", excerpt: "A serif headline and a plain body font are enough for a readable blog.", body: "Fraunces carries the titles. Outfit stays out of the way for long text. Spacing comes from one wrap width." },
  { slug: "routes-that-match", title: "Routes that match the page", excerpt: "The server exposes the same paths the script already calls.", body: "GET /api/posts returns the list. GET /api/posts/:slug returns one essay. Missing slugs respond with 404." },
];

const blog = (): WebsiteBlueprint => ({
  id: "blog",
  label: "Blog",
  description: "Essay list and reader backed by /api/posts.",
  files: [
    {
      name: "index.html",
      language: "html",
      content: page("Field Notes", "blog", `  <header class="wrap nav">
    <a class="brand" href="#top">Field Notes</a>
    <button class="nav-toggle" data-nav-toggle type="button">Menu</button>
    <nav class="nav-links" data-nav>
      <a href="#notes">Notes</a>
      <a href="#subscribe">Subscribe</a>
    </nav>
  </header>
  <main id="top" class="wrap section">
    <p class="kicker">Journal</p>
    <h1>Notes on building small websites.</h1>
    <img class="cover" alt="Open notebook" src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80" />
    <section id="notes" class="section grid" style="grid-template-columns: 0.9fr 1.1fr;">
      <div id="post-list"></div>
      <article class="card" id="reader">
        <h2>Select a note</h2>
        <p class="muted">The list comes from the API when the server is running.</p>
      </article>
    </section>
    <form id="subscribe-form" class="card">
      <h2 id="subscribe">Subscribe</h2>
      <input name="email" type="email" placeholder="Email" required />
      <button class="btn" type="submit">Join</button>
      <p class="note" id="subscribe-note"></p>
    </form>
  </main>
  <footer class="wrap footer">Field Notes · posts API</footer>`),
    },
    {
      name: "styles.css",
      language: "css",
      content: siteCss({
        bg: "#f7f1e8",
        ink: "#241c16",
        muted: "#6d5c4e",
        primary: "#8c3d2f",
        primaryInk: "#fff8f2",
        card: "#fffaf3",
        line: "#eadfce",
        accent: "#2f5d50",
      }),
    },
    {
      name: "script.js",
      language: "javascript",
      content: `const FALLBACK_POSTS = ${JSON.stringify(posts, null, 2)};
let posts = FALLBACK_POSTS;

function renderList() {
  const list = document.getElementById("post-list");
  if (!list) return;
  list.innerHTML = posts.map((post) => \`
    <button class="card" data-slug="\${post.slug}" type="button" style="text-align:left; width:100%; margin-bottom:0.7rem;">
      <h3>\${post.title}</h3>
      <p class="muted">\${post.excerpt}</p>
    </button>\`).join("");
  list.querySelectorAll("[data-slug]").forEach((button) => {
    button.addEventListener("click", () => openPost(button.getAttribute("data-slug")));
  });
}

async function openPost(slug) {
  const reader = document.getElementById("reader");
  if (!reader || !slug) return;
  let post = posts.find((item) => item.slug === slug);
  try {
    const response = await fetch("/api/posts/" + slug);
    if (response.ok) post = await response.json();
  } catch {
    /* fallback already assigned */
  }
  if (!post) return;
  reader.innerHTML = \`<p class="kicker">Note</p><h2>\${post.title}</h2><p>\${post.body}</p>\`;
}

async function loadPosts() {
  try {
    const response = await fetch("/api/posts");
    if (response.ok) posts = await response.json();
  } catch {
    posts = FALLBACK_POSTS;
  }
  renderList();
  if (posts[0]) openPost(posts[0].slug);
}

function wireSubscribe() {
  const form = document.getElementById("subscribe-form");
  const note = document.getElementById("subscribe-note");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Request failed");
      note.textContent = "Subscribed through the API.";
    } catch {
      note.textContent = "API offline — subscription kept in the preview only.";
    }
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("[data-nav-toggle]")?.addEventListener("click", () => {
    document.querySelector("[data-nav]")?.classList.toggle("open");
  });
  loadPosts();
  wireSubscribe();
});
`,
    },
    {
      name: "server.js",
      language: "javascript",
      content: serverSource("Field Notes", `const POSTS = ${JSON.stringify(posts, null, 2)};
const subscribers = [];

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/posts") {
    sendJson(res, 200, POSTS.map(({ body, ...post }) => post));
    return true;
  }
  if (req.method === "GET" && url.pathname.startsWith("/api/posts/")) {
    const slug = decodeURIComponent(url.pathname.slice("/api/posts/".length));
    const post = POSTS.find((item) => item.slug === slug);
    if (!post) {
      sendJson(res, 404, { error: "Not found" });
      return true;
    }
    sendJson(res, 200, post);
    return true;
  }
  if (req.method === "POST" && url.pathname === "/api/subscribers") {
    const body = await readBody(req);
    if (!body.email) {
      sendJson(res, 422, { error: "Email is required" });
      return true;
    }
    subscribers.push({ email: body.email });
    sendJson(res, 201, { ok: true });
    return true;
  }
  return false;
}`),
    },
    { name: "package.json", language: "json", content: packageJson("field-notes", "Blog with a posts API") },
    { name: "README.md", language: "markdown", content: readme("Field Notes", "Blog list and reader with subscribe API.") },
  ],
});

const products = [
  { id: "mug", name: "Stoneware mug", price: 28, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80" },
  { id: "bowl", name: "Serving bowl", price: 46, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80" },
  { id: "linen", name: "Linen napkin set", price: 32, image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80" },
];

const store = (): WebsiteBlueprint => ({
  id: "store",
  label: "Store",
  description: "Product catalog, cart, and checkout order API.",
  files: [
    {
      name: "index.html",
      language: "html",
      content: page("Kiln & Co.", "store", `  <header class="wrap nav">
    <a class="brand" href="#top">Kiln &amp; Co.</a>
    <button class="nav-toggle" data-nav-toggle type="button">Menu</button>
    <nav class="nav-links" data-nav>
      <a href="#catalog">Catalog</a>
      <a href="#cart">Cart <span id="cart-count">0</span></a>
    </nav>
  </header>
  <main id="top">
    <section class="wrap hero">
      <div>
        <p class="kicker">Home goods</p>
        <h1>Objects for a quieter table.</h1>
        <p class="lede">Products load from <code>/api/products</code>. Checkout posts the cart to <code>/api/orders</code>.</p>
      </div>
      <img alt="Shop interior" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80" />
    </section>
    <section class="wrap section" id="catalog">
      <h2>Catalog</h2>
      <div class="grid" id="product-grid"></div>
    </section>
    <section class="wrap section" id="cart">
      <form id="checkout-form" class="card">
        <div class="cart">
          <h2>Cart</h2>
          <strong id="cart-total">$0</strong>
        </div>
        <ul id="cart-lines" class="muted"></ul>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button class="btn" type="submit">Place order</button>
        <p class="note" id="order-note"></p>
      </form>
    </section>
  </main>
  <footer class="wrap footer">Kiln &amp; Co. · catalog and orders API</footer>`),
    },
    {
      name: "styles.css",
      language: "css",
      content: siteCss({
        bg: "#f3efe9",
        ink: "#221c18",
        muted: "#655c54",
        primary: "#3f5c4b",
        primaryInk: "#f6f3ee",
        card: "#fffdf9",
        line: "#e3d9cc",
        accent: "#a15c38",
      }),
    },
    {
      name: "script.js",
      language: "javascript",
      content: `const FALLBACK_PRODUCTS = ${JSON.stringify(products, null, 2)};
let products = FALLBACK_PRODUCTS;
const cart = new Map();

function money(cents) {
  return "$" + cents.toFixed(0);
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.innerHTML = products.map((product) => \`
    <article class="card">
      <img alt="" src="\${product.image}" />
      <h3>\${product.name}</h3>
      <p class="price">\${money(product.price)}</p>
      <button class="btn" data-add="\${product.id}" type="button">Add</button>
    </article>\`).join("");
  grid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.getAttribute("data-add")));
  });
}

function renderCart() {
  const lines = document.getElementById("cart-lines");
  const total = document.getElementById("cart-total");
  const count = document.getElementById("cart-count");
  const items = [...cart.values()];
  const sum = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  if (lines) {
    lines.innerHTML = items.length
      ? items.map((item) => \`<li>\${item.name} × \${item.qty}</li>\`).join("")
      : "<li>Cart is empty.</li>";
  }
  if (total) total.textContent = money(sum);
  if (count) count.textContent = String(items.reduce((acc, item) => acc + item.qty, 0));
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const current = cart.get(product.id) || { ...product, qty: 0 };
  current.qty += 1;
  cart.set(product.id, current);
  renderCart();
}

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    if (response.ok) products = await response.json();
  } catch {
    products = FALLBACK_PRODUCTS;
  }
  renderProducts();
  renderCart();
}

function wireCheckout() {
  const form = document.getElementById("checkout-form");
  const note = document.getElementById("order-note");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const items = [...cart.values()].map((item) => ({ id: item.id, qty: item.qty }));
    if (!items.length) {
      note.textContent = "Add something before checkout.";
      return;
    }
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, items }),
      });
      if (!response.ok) throw new Error("Request failed");
      const order = await response.json();
      note.textContent = "Order " + order.order.id + " accepted by the API.";
    } catch {
      note.textContent = "API offline — order kept in this preview only.";
    }
    cart.clear();
    renderCart();
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("[data-nav-toggle]")?.addEventListener("click", () => {
    document.querySelector("[data-nav]")?.classList.toggle("open");
  });
  loadProducts();
  wireCheckout();
});
`,
    },
    {
      name: "server.js",
      language: "javascript",
      content: serverSource("Kiln & Co.", `const PRODUCTS = ${JSON.stringify(products, null, 2)};
const orders = [];

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/products") {
    sendJson(res, 200, PRODUCTS);
    return true;
  }
  if (req.method === "POST" && url.pathname === "/api/orders") {
    const body = await readBody(req);
    if (!body.email || !Array.isArray(body.items) || body.items.length === 0) {
      sendJson(res, 422, { error: "Email and items are required" });
      return true;
    }
    const order = {
      id: "ord_" + (orders.length + 1),
      name: body.name || "",
      email: body.email,
      items: body.items,
    };
    orders.push(order);
    sendJson(res, 201, { ok: true, order });
    return true;
  }
  return false;
}`),
    },
    { name: "package.json", language: "json", content: packageJson("kiln-store", "Storefront with products and orders APIs") },
    { name: "README.md", language: "markdown", content: readme("Kiln & Co.", "Catalog, cart, and checkout backed by a Node API.") },
  ],
});

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [landing(), portfolio(), blog(), store()];

export function assertWebsiteBlueprint(blueprint: WebsiteBlueprint): void {
  const names = new Set(blueprint.files.map((file) => file.name));
  for (const name of REQUIRED_FILES) {
    if (!names.has(name)) throw new Error(`${blueprint.id} is missing ${name}`);
  }
}
