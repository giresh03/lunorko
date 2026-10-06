/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a previewable vanilla frontend plus an Express API the student can run locally.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "store" | "dashboard" | "saas";

export interface WebsiteBlueprint {
  id: WebsiteKind;
  label: string;
  description: string;
  icon: string;
  defaultBrief: string;
  accent: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: GeneratedTreeNode[];
  isOpen?: boolean;
}

export interface WebsiteProject {
  kind: WebsiteKind;
  siteName: string;
  slug: string;
  brief: string;
  files: GeneratedFile[];
  summary: string;
  aiPrompt: string;
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "landing",
    label: "Landing page",
    description: "Hero, features, and a lead form",
    icon: "🚀",
    accent: "#7c5cff",
    defaultBrief: "A product launch page that collects early-access signups",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Projects, about, and a contact form",
    icon: "🎨",
    accent: "#22d3ee",
    defaultBrief: "A personal portfolio for a product designer and frontend developer",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Posts list with comments API",
    icon: "✍️",
    accent: "#f59e0b",
    defaultBrief: "A writing site about learning web development",
  },
  {
    id: "store",
    label: "Store",
    description: "Product catalog and orders API",
    icon: "🛍️",
    accent: "#34d399",
    defaultBrief: "A small shop for handmade ceramics",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Metrics cards and a notes API",
    icon: "📊",
    accent: "#60a5fa",
    defaultBrief: "An analytics dashboard for a student coding club",
  },
  {
    id: "saas",
    label: "SaaS",
    description: "Pricing plans and a signup API",
    icon: "⚡",
    accent: "#f472b6",
    defaultBrief: "A SaaS homepage for an AI study planner",
  },
];

interface CatalogItem {
  title: string;
  text: string;
  image: string;
  meta?: string;
}

interface SiteCatalog {
  kicker: string;
  headline: string;
  subhead: string;
  formTitle: string;
  formNote: string;
  submitLabel: string;
  showItem: boolean;
  items: CatalogItem[];
}

export function slugifySiteName(name: string): string {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blueprintFor(kind: WebsiteKind): WebsiteBlueprint {
  return WEBSITE_BLUEPRINTS.find((item) => item.id === kind) ?? WEBSITE_BLUEPRINTS[0];
}

function catalogFor(kind: WebsiteKind, siteName: string, brief: string): SiteCatalog {
  const seed = slugifySiteName(siteName);
  const photo = (n: number) => `https://picsum.photos/seed/${seed}-${n}/960/640`;
  const shared = { showItem: false as boolean };

  switch (kind) {
    case "portfolio":
      return {
        ...shared,
        kicker: "Selected work",
        headline: `${siteName} designs products people remember`,
        subhead: brief,
        formTitle: "Start a project",
        formNote: "Messages are saved by the Express API at POST /api/submissions.",
        submitLabel: "Send message",
        items: [
          { title: "Northwind Bank", text: "A responsive marketing site and onboarding flow.", image: photo(1), meta: "Web" },
          { title: "Field Notes", text: "Editorial blog with a reading-time API.", image: photo(2), meta: "Content" },
          { title: "Harbor", text: "Dashboard for a logistics team of 40 people.", image: photo(3), meta: "Product" },
        ],
      };
    case "blog":
      return {
        ...shared,
        kicker: "Journal",
        headline: `Notes from ${siteName}`,
        subhead: brief,
        formTitle: "Leave a comment",
        formNote: "Comments post to POST /api/submissions and show after a refresh when the API is running.",
        submitLabel: "Post comment",
        items: [
          { title: "Start with the document, not the framework", text: "HTML, CSS, and the DOM still decide whether a page feels solid.", image: photo(1), meta: "6 min" },
          { title: "What an API is actually for", text: "A small Express server that stores JSON is enough to learn full-stack flow.", image: photo(2), meta: "5 min" },
          { title: "Ship the ugly version", text: "A live preview plus one real endpoint beats a perfect mock.", image: photo(3), meta: "4 min" },
        ],
      };
    case "store":
      return {
        kicker: "In the shop",
        headline: `${siteName} — made slowly, shipped carefully`,
        subhead: brief,
        formTitle: "Place an order",
        formNote: "Orders are stored in memory by POST /api/submissions until the server restarts.",
        submitLabel: "Place order",
        showItem: true,
        items: [
          { title: "Speckled mug", text: "Stoneware mug, 12 oz. Dishwasher safe.", image: photo(1), meta: "$28" },
          { title: "Serving bowl", text: "Wide bowl for salads and fruit.", image: photo(2), meta: "$64" },
          { title: "Pour-over set", text: "Dripper and cup in the same glaze.", image: photo(3), meta: "$48" },
        ],
      };
    case "dashboard":
      return {
        ...shared,
        kicker: "This week",
        headline: `${siteName} at a glance`,
        subhead: brief,
        formTitle: "Add a note",
        formNote: "Notes are saved with POST /api/submissions.",
        submitLabel: "Save note",
        items: [
          { title: "Active members", text: "Students who opened the editor in the last 7 days.", image: photo(1), meta: "128" },
          { title: "Challenges solved", text: "Completed daily challenges across the club.", image: photo(2), meta: "46" },
          { title: "Projects shipped", text: "Repos with a README and a live demo.", image: photo(3), meta: "9" },
        ],
      };
    case "saas":
      return {
        kicker: "Plans",
        headline: `${siteName} keeps the study plan honest`,
        subhead: brief,
        formTitle: "Create an account",
        formNote: "Signups hit POST /api/submissions. No password is stored in this starter.",
        submitLabel: "Create account",
        showItem: true,
        items: [
          { title: "Starter", text: "One workspace, daily plan, and progress email.", image: photo(1), meta: "Free" },
          { title: "Pro", text: "Shared rooms, interview drills, and exports.", image: photo(2), meta: "$12/mo" },
          { title: "Team", text: "Mentor seats and a club dashboard.", image: photo(3), meta: "$39/mo" },
        ],
      };
    default:
      return {
        ...shared,
        kicker: "Now launching",
        headline: `${siteName} is ready for early users`,
        subhead: brief,
        formTitle: "Request access",
        formNote: "Leads are saved by the Express API at POST /api/submissions.",
        submitLabel: "Join the list",
        items: [
          { title: "Live preview", text: "The page runs in the editor before you install anything.", image: photo(1), meta: "Frontend" },
          { title: "Real API", text: "Express serves the site and a JSON API on one port.", image: photo(2), meta: "Backend" },
          { title: "Yours to edit", text: "Change the copy, then ask the assistant to restyle it.", image: photo(3), meta: "Full stack" },
        ],
      };
  }
}

function styles(accent: string): string {
  return `/* Generated by the Lunor website automation */
:root {
  --bg: #070b16;
  --card: #11182b;
  --text: #eef2ff;
  --muted: #9aa6c3;
  --accent: ${accent};
  --line: rgba(255, 255, 255, 0.08);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", Inter, system-ui, sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
.wrap { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 0;
}
.brand { font-weight: 750; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 18px; color: var(--muted); font-size: 14px; text-decoration: none; }
.hero { padding: 28px 0 10px; }
.kicker {
  color: var(--accent); font-size: 12px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
}
h1 { font-size: clamp(36px, 6vw, 64px); line-height: 0.98; letter-spacing: -0.045em; margin: 12px 0; max-width: 16ch; }
.subhead { max-width: 58ch; color: var(--muted); font-size: 18px; line-height: 1.5; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 36px 0; }
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: 18px; overflow: hidden;
}
.card img { height: 170px; width: 100%; }
.card div { padding: 16px; }
.meta { color: var(--accent); font-size: 12px; font-weight: 700; }
.card h2 { font-size: 18px; margin: 8px 0; }
.card p { color: var(--muted); margin: 0; line-height: 1.45; }
.panel {
  display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px;
  padding: 28px; border: 1px solid var(--line); border-radius: 24px; background: rgba(17, 24, 43, 0.8);
  margin-bottom: 48px;
}
form { display: grid; gap: 10px; }
label { font-size: 13px; color: var(--muted); display: grid; gap: 6px; }
input, select, textarea {
  width: 100%; border-radius: 12px; border: 1px solid var(--line);
  background: #0b1020; color: var(--text); padding: 12px 14px; font: inherit;
}
button {
  border: 0; border-radius: 999px; padding: 12px 16px; font-weight: 700; cursor: pointer;
  background: var(--accent); color: #081018;
}
#status { min-height: 1.2em; color: var(--accent); font-size: 14px; }
footer { color: var(--muted); padding: 10px 0 40px; font-size: 13px; }
@media (max-width: 800px) {
  .grid, .panel { grid-template-columns: 1fr; }
  .nav-links { display: none; }
}
`;
}

function clientHtml(siteName: string, catalog: SiteCatalog): string {
  const cards = catalog.items.map((item) => `        <article class="card">
          <img src="${item.image}" alt="${escapeHtml(item.title)}" />
          <div>
            <div class="meta">${escapeHtml(item.meta || "")}</div>
            <h2>${escapeHtml(item.title)}</h2>
            <p>${escapeHtml(item.text)}</p>
          </div>
        </article>`).join("\n");

  const itemField = catalog.showItem
    ? `          <label id="item-field">Choice
            <select name="item" id="item">
              ${catalog.items.map((item) => `<option>${escapeHtml(item.title)}</option>`).join("\n              ")}
            </select>
          </label>`
    : `          <label id="item-field" hidden>Choice
            <input name="item" id="item" />
          </label>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(siteName)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="true" data-show-item="${catalog.showItem ? "true" : "false"}">
  <div class="wrap">
    <nav>
      <div class="brand">${escapeHtml(siteName)}</div>
      <div class="nav-links">
        <a href="#catalog">Work</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
    <header class="hero">
      <div class="kicker">${escapeHtml(catalog.kicker)}</div>
      <h1>${escapeHtml(catalog.headline)}</h1>
      <p class="subhead">${escapeHtml(catalog.subhead)}</p>
    </header>
    <section class="grid" id="catalog">
${cards}
    </section>
    <section class="panel" id="contact">
      <div>
        <div class="kicker">API</div>
        <h2>${escapeHtml(catalog.formTitle)}</h2>
        <p class="subhead">${escapeHtml(catalog.formNote)}</p>
      </div>
      <form id="site-form">
        <label>Name
          <input name="name" id="name" required placeholder="Ada Lovelace" />
        </label>
        <label>Email
          <input name="email" id="email" type="email" required placeholder="ada@example.com" />
        </label>
${itemField}
        <label>Message
          <textarea name="message" id="message" rows="4" placeholder="What should we build?"></textarea>
        </label>
        <button type="submit">${escapeHtml(catalog.submitLabel)}</button>
        <p id="status" role="status"></p>
      </form>
    </section>
    <footer>Frontend is static HTML. The API lives in <code>server/</code> and is optional for the preview.</footer>
  </div>
  <script src="app.js"></script>
</body>
</html>
`;
}

function clientJs(): string {
  return `// Browser client. Uses the Express API when it is running, otherwise keeps the static preview.
const form = document.getElementById("site-form");
const statusEl = document.getElementById("status");
const catalogEl = document.getElementById("catalog");

function card(item) {
  const article = document.createElement("article");
  article.className = "card";
  article.innerHTML =
    '<img alt="" />' +
    '<div><div class="meta"></div><h2></h2><p></p></div>';
  article.querySelector("img").src = item.image;
  article.querySelector("img").alt = item.title;
  article.querySelector(".meta").textContent = item.meta || "";
  article.querySelector("h2").textContent = item.title;
  article.querySelector("p").textContent = item.text;
  return article;
}

async function refreshCatalog() {
  try {
    const response = await fetch("/api/catalog");
    if (!response.ok) return;
    const data = await response.json();
    if (!catalogEl || !Array.isArray(data.items)) return;
    catalogEl.replaceChildren(...data.items.map(card));
    const select = document.getElementById("item");
    if (select && select.tagName === "SELECT") {
      select.replaceChildren(...data.items.map((item) => {
        const option = document.createElement("option");
        option.textContent = item.title;
        return option;
      }));
    }
  } catch {
    // Preview iframe has no API. The HTML already shows the seed content.
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    item: document.getElementById("item")?.value || "",
    message: document.getElementById("message").value.trim(),
  };
  if (statusEl) statusEl.textContent = "Sending...";
  try {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed");
    if (statusEl) statusEl.textContent = "Saved on the API as " + data.id + ".";
    form.reset();
  } catch {
    if (statusEl) {
      statusEl.textContent = "Preview mode: entry kept in the browser only. Run npm start to persist it. " + (payload.name ? "(" + payload.name + ")" : "");
    }
  }
});

refreshCatalog();
`;
}

function serverIndex(): string {
  return `const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api", routes);
app.use(express.static(path.join(__dirname, "..", "client")));

app.listen(port, () => {
  console.log("Website running at http://localhost:" + port);
});
`;
}

function serverRoutes(): string {
  return `const express = require("express");
const store = require("./store");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.get("/catalog", (_req, res) => {
  res.json(store.list());
});

router.get("/submissions", (_req, res) => {
  res.json({ submissions: store.submissions() });
});

router.post("/submissions", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  const item = String(req.body?.item || "").trim();
  if (!name || !email) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }
  const saved = store.add({ name, email, message, item });
  res.status(201).json(saved);
});

module.exports = router;
`;
}

function serverStore(catalog: SiteCatalog): string {
  return `const catalog = ${JSON.stringify({
    kicker: catalog.kicker,
    headline: catalog.headline,
    subhead: catalog.subhead,
    items: catalog.items,
  }, null, 2)};

const submissions = [];

function list() {
  return catalog;
}

function add(entry) {
  const row = {
    id: Date.now().toString(36),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  submissions.push(row);
  return row;
}

function allSubmissions() {
  return submissions.slice();
}

module.exports = { list, add, submissions: allSubmissions };
`;
}

function packageJson(slug: string, siteName: string): string {
  return JSON.stringify({
    name: slug,
    version: "1.0.0",
    private: true,
    description: `${siteName} — full-stack site generated in Lunor.AI`,
    main: "server/index.js",
    scripts: {
      start: "node server/index.js",
      dev: "node server/index.js",
    },
    dependencies: {
      express: "^4.21.2",
    },
  }, null, 2) + "\n";
}

function readme(siteName: string, kind: string, brief: string): string {
  return `# ${siteName}

${brief}

Generated by the Web Development **Website Generator** automation.

## Stack

- \`client/\` — HTML, CSS, and JavaScript. This is what the editor preview runs.
- \`server/\` — Express API that also serves the client.

## Run the API

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/health | Server check |
| GET | /api/catalog | Page content for this ${kind} site |
| POST | /api/submissions | Save a form entry (\`name\` and \`email\` required) |
| GET | /api/submissions | List saved entries |

Entries live in memory and reset when the server stops. The preview still works without the API: the form explains that it is in preview mode.
`;
}

function envExample(): string {
  return "PORT=3000\n";
}

export function buildWebsiteProject(input: {
  kind: WebsiteKind;
  siteName: string;
  brief?: string;
}): WebsiteProject {
  const blueprint = blueprintFor(input.kind);
  const siteName = input.siteName.trim() || "Lunor Site";
  const brief = (input.brief || blueprint.defaultBrief).trim();
  const slug = slugifySiteName(siteName);
  const catalog = catalogFor(input.kind, siteName, brief);

  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: clientHtml(siteName, catalog) },
    { path: "client/styles.css", language: "css", content: styles(blueprint.accent) },
    { path: "client/app.js", language: "javascript", content: clientJs() },
    { path: "server/index.js", language: "javascript", content: serverIndex() },
    { path: "server/routes.js", language: "javascript", content: serverRoutes() },
    { path: "server/store.js", language: "javascript", content: serverStore(catalog) },
    { path: "package.json", language: "json", content: packageJson(slug, siteName) },
    { path: "README.md", language: "markdown", content: readme(siteName, blueprint.label, brief) },
    { path: ".env.example", language: "plaintext", content: envExample() },
  ];

  const summary = [
    `Built **${siteName}**, a full-stack ${blueprint.label.toLowerCase()}.`,
    "",
    "Files written into the editor:",
    "- `client/index.html`, `client/styles.css`, `client/app.js` — the live preview",
    "- `server/index.js`, `server/routes.js`, `server/store.js` — Express API",
    "- `package.json`, `README.md`, `.env.example`",
    "",
    "The preview works immediately. To persist form entries, run `npm install` and `npm start`, then open http://localhost:3000.",
    "",
    "Ask me to change the copy, colors, or sections and I will update these same files.",
  ].join("\n");

  const aiPrompt = [
    "[website-generator]",
    `Customize this full-stack ${blueprint.label.toLowerCase()} named "${siteName}".`,
    `Brief: ${brief}`,
    "The project is already in the editor. Improve the visible copy, section content, and sample catalog so they match the brief.",
    "Keep these exact paths: client/index.html, client/styles.css, client/app.js, server/index.js, server/routes.js, server/store.js, package.json, README.md, .env.example.",
    "Client must stay vanilla HTML, CSS, and JavaScript with a fetch fallback when /api is down.",
    "Server must stay Express and keep GET /api/catalog, GET /api/health, POST /api/submissions, and GET /api/submissions.",
    "Return every file using a path line followed by a fenced code block. Do not use React.",
  ].join("\n");

  return { kind: input.kind, siteName, slug, brief, files, summary, aiPrompt };
}

function upsertOne(nodes: GeneratedTreeNode[], segments: string[], accumulated: string, file: GeneratedFile): GeneratedTreeNode[] {
  const [head, ...rest] = segments;
  const currentId = accumulated ? `${accumulated}/${head}` : head;
  if (rest.length === 0) {
    const nextFile: GeneratedTreeNode = {
      id: currentId,
      name: head,
      type: "file",
      language: file.language,
      content: file.content,
    };
    const index = nodes.findIndex((node) => node.id === currentId);
    if (index >= 0) {
      const copy = nodes.slice();
      copy[index] = { ...nodes[index], ...nextFile };
      return copy;
    }
    return [...nodes, nextFile];
  }

  const index = nodes.findIndex((node) => node.id === currentId && node.type === "folder");
  if (index === -1) {
    return [...nodes, {
      id: currentId,
      name: head,
      type: "folder",
      isOpen: true,
      children: upsertOne([], rest, currentId, file),
    }];
  }

  const copy = nodes.slice();
  const existing = nodes[index];
  copy[index] = {
    ...existing,
    isOpen: true,
    children: upsertOne(existing.children || [], rest, currentId, file),
  };
  return copy;
}

export function upsertGeneratedFiles<T extends GeneratedTreeNode>(nodes: T[], files: GeneratedFile[]): T[] {
  return files.reduce((tree, file) => {
    const segments = file.path.split("/").filter(Boolean);
    return upsertOne(tree, segments, "", file) as T[];
  }, nodes);
}
