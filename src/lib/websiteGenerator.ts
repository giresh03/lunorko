/**
 * Full-stack website generator for the Web Development AI assistant.
 * Builds a vanilla client (previewable immediately) plus a CommonJS Express API.
 */

export interface GeneratedWebsiteFile {
  path: string;
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

export interface WebsiteItem {
  id: string;
  title: string;
  detail: string;
  meta: string;
  image: string;
}

export interface WebsiteField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
}

export interface WebsiteBlueprint {
  id: string;
  name: string;
  icon: string;
  description: string;
  brand: string;
  headline: string;
  subhead: string;
  accent: string;
  accent2: string;
  bg: string;
  ink: string;
  heroImage: string;
  cta: string;
  collectionLabel: string;
  features: { title: string; text: string }[];
  items: WebsiteItem[];
  fields: WebsiteField[];
}

const unsplash = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "portfolio",
    name: "Portfolio",
    icon: "✦",
    description: "Studio site with projects API",
    brand: "Northline Studio",
    headline: "Interfaces with a point of view",
    subhead: "A product design studio shipping websites, design systems, and the APIs behind them.",
    accent: "#7c5cff",
    accent2: "#3ee0b0",
    bg: "#0e0f14",
    ink: "#f4f1ea",
    heroImage: unsplash("1498050108023-c5249f4df085", 1800, 1100),
    cta: "Start a project",
    collectionLabel: "Selected work",
    features: [
      { title: "Research to release", text: "Each engagement starts with the audience and ends with a site you can run." },
      { title: "Design systems", text: "Type, color, and components stay consistent from the hero to the last form." },
      { title: "Full-stack handoff", text: "The preview is HTML, CSS, and JS. The API is a small Express server." },
    ],
    items: [
      { id: "p1", title: "Atlas Analytics", detail: "Marketing site and dashboard shell for a data team.", meta: "Web · 2026", image: unsplash("1461749280684-dccba630e2f6") },
      { id: "p2", title: "Harbor Notes", detail: "Editorial layout with a reading list backed by an API.", meta: "Product · 2025", image: unsplash("1517694712202-14dd9538aa97") },
      { id: "p3", title: "Field Kit", detail: "Mobile-first landing page for a hardware launch.", meta: "Brand · 2025", image: unsplash("1555066931-4365d14bab8c") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Ada Lovelace" },
      { name: "email", label: "Email", type: "email", placeholder: "ada@studio.dev" },
      { name: "message", label: "Project", type: "text", placeholder: "A site for a new product" },
    ],
  },
  {
    id: "saas",
    name: "SaaS landing",
    icon: "◈",
    description: "Product page with waitlist API",
    brand: "Lumenboard",
    headline: "Plan the week without the noise",
    subhead: "A calm task board for small teams. Join the waitlist and the API stores every signup.",
    accent: "#4cc9f0",
    accent2: "#f72585",
    bg: "#07131c",
    ink: "#e8f4f8",
    heroImage: unsplash("1553877522-43269d4ea984", 1800, 1100),
    cta: "Join the waitlist",
    collectionLabel: "What you get",
    features: [
      { title: "Shared boards", text: "One board per project, with owners, due dates, and a quiet activity log." },
      { title: "Keyboard first", text: "Jump between tasks without hunting through menus." },
      { title: "Waitlist API", text: "POST /api/leads saves an email. GET /api/items lists the product highlights." },
    ],
    items: [
      { id: "s1", title: "Focus mode", detail: "Hide everything except the task in front of you.", meta: "Included", image: unsplash("1552664730-d307ca884978") },
      { id: "s2", title: "Team pulse", detail: "A Monday snapshot that fits in one screen.", meta: "Included", image: unsplash("1600880292203-757bb62b4baf") },
      { id: "s3", title: "Guest links", detail: "Share a read-only view with clients.", meta: "Pro", image: unsplash("1542744173-8e7e91415657") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Jordan Lee" },
      { name: "email", label: "Work email", type: "email", placeholder: "you@company.com" },
      { name: "message", label: "Team size", type: "text", placeholder: "6 people" },
    ],
  },
  {
    id: "blog",
    name: "Journal",
    icon: "✎",
    description: "Magazine layout with posts API",
    brand: "Field Notes",
    headline: "Essays from the build log",
    subhead: "Short pieces on craft, shipping, and the tools behind a modern website.",
    accent: "#e0a45a",
    accent2: "#f3e6d0",
    bg: "#16130f",
    ink: "#f7f1e8",
    heroImage: unsplash("1456513080510-7bf3a84b82f8", 1800, 1100),
    cta: "Subscribe",
    collectionLabel: "Latest notes",
    features: [
      { title: "Long-form first", text: "Wide measure, generous type, and images that support the sentence." },
      { title: "Seeded posts", text: "The page renders even when the API is offline, then swaps in live posts." },
      { title: "Newsletter leads", text: "The signup form posts to /api/leads on the Express server." },
    ],
    items: [
      { id: "b1", title: "Ship the preview first", detail: "Why a static client plus a tiny API teaches the whole stack.", meta: "12 min", image: unsplash("1481627834876-b7833e8f5570") },
      { id: "b2", title: "Color is a system", detail: "Three tokens are enough for a site that still feels designed.", meta: "8 min", image: unsplash("1427504350979-f38e36f5ceab") },
      { id: "b3", title: "Forms that fail kindly", detail: "Show seed data, then tell the reader when the server is down.", meta: "6 min", image: unsplash("1434030216411-0b793f4b4173") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Your name" },
      { name: "email", label: "Email", type: "email", placeholder: "you@domain.com" },
      { name: "message", label: "Topic you want next", type: "text", placeholder: "CSS architecture" },
    ],
  },
  {
    id: "shop",
    name: "Storefront",
    icon: "◻",
    description: "Catalog with product API",
    brand: "Oak & Clay",
    headline: "Objects for a quieter room",
    subhead: "Stoneware, linen, and wood — catalog data comes from the API, with a local fallback.",
    accent: "#d4784a",
    accent2: "#f0d7b4",
    bg: "#1a1410",
    ink: "#fbf6ef",
    heroImage: unsplash("1441986300917-64674bd600d8", 1800, 1100),
    cta: "Ask about a piece",
    collectionLabel: "In the shop",
    features: [
      { title: "Real catalog", text: "Products are JSON from GET /api/items, not hardcoded only in the page." },
      { title: "Enquiry form", text: "A note about a piece is stored with POST /api/leads." },
      { title: "Responsive grid", text: "One column on a phone, three on a desk, same markup." },
    ],
    items: [
      { id: "c1", title: "River bowl", detail: "Speckled stoneware, 18cm.", meta: "$48", image: unsplash("1483985988355-763728e1935b") },
      { id: "c2", title: "Linen throw", detail: "Undyed flax, washed soft.", meta: "$120", image: unsplash("1556742049-0cfed4f6a45d") },
      { id: "c3", title: "Ash stool", detail: "Three legs, oiled finish.", meta: "$260", image: unsplash("1607082348824-0a96f2a4b9da") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Sam Rivera" },
      { name: "email", label: "Email", type: "email", placeholder: "sam@email.com" },
      { name: "message", label: "Which piece?", type: "text", placeholder: "River bowl, two of them" },
    ],
  },
  {
    id: "restaurant",
    name: "Restaurant",
    icon: "🍽",
    description: "Menu and reservation API",
    brand: "Harbor & Rye",
    headline: "Dinner by the water",
    subhead: "A seasonal menu and a reservation form backed by a small Express API.",
    accent: "#f2c14e",
    accent2: "#ef6f4a",
    bg: "#101614",
    ink: "#f6f3ea",
    heroImage: unsplash("1414235077428-338989a2e8c0", 1800, 1100),
    cta: "Request a table",
    collectionLabel: "Tonight's menu",
    features: [
      { title: "Seasonal plates", text: "The menu is data. Change the server seed and the page follows." },
      { title: "Reservations", text: "Name, date, and party size post to /api/leads." },
      { title: "Works offline", text: "The preview still shows the menu if localhost:3001 is not running." },
    ],
    items: [
      { id: "r1", title: "Citrus crudo", detail: "Market fish, fennel, chili oil.", meta: "$22", image: unsplash("1504674900247-0877df9cc836") },
      { id: "r2", title: "Rye pappardelle", detail: "Slow beef, sage, pecorino.", meta: "$28", image: unsplash("1476224203421-9ac39bcb3327") },
      { id: "r3", title: "Olive oil cake", detail: "Citrus zest, crème fraîche.", meta: "$12", image: unsplash("1555396273-367ea4eb4db5") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Alex Kim" },
      { name: "email", label: "Email", type: "email", placeholder: "alex@email.com" },
      { name: "message", label: "Date and party size", type: "text", placeholder: "Friday, 4 people" },
    ],
  },
];

const FULL_STACK_REQUEST = /full[\s-]?stack|website generator|mern\b|express\s+api|with (an? )?(api|backend)/i;

export function isFullStackWebsiteRequest(text: string): boolean {
  return FULL_STACK_REQUEST.test(text);
}

export function getWebsiteBlueprint(id: string): WebsiteBlueprint {
  return WEBSITE_BLUEPRINTS.find((blueprint) => blueprint.id === id) ?? WEBSITE_BLUEPRINTS[0];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clientHtml(blueprint: WebsiteBlueprint, subhead: string): string {
  const seed = JSON.stringify({ apiBase: "http://localhost:3001", items: blueprint.items }).replace(/</g, "\\u003c");
  const nav = ["Work", "About", "Contact"].map((label) => {
    const href = label === "Work" ? "#work" : label === "About" ? "#about" : "#contact";
    return `<a href="${href}">${label}</a>`;
  }).join("\n        ");
  const features = blueprint.features.map((feature) => `        <article class="feature">
          <h3>${escapeHtml(feature.title)}</h3>
          <p>${escapeHtml(feature.text)}</p>
        </article>`).join("\n");
  const cards = blueprint.items.map((item) => `        <article class="card">
          <img src="${item.image}" alt="${escapeHtml(item.title)}" />
          <div class="card-body">
            <p class="meta">${escapeHtml(item.meta)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.detail)}</p>
          </div>
        </article>`).join("\n");
  const fields = blueprint.fields.map((field) => `          <label>
            ${escapeHtml(field.label)}
            <input name="${field.name}" type="${field.type}" placeholder="${escapeHtml(field.placeholder)}" required />
          </label>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(blueprint.brand)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@380;520&display=swap" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header">
    <a class="brand" href="#top">${escapeHtml(blueprint.brand)}</a>
    <nav>
        ${nav}
    </nav>
  </header>

  <main id="top">
    <section class="hero" style="background-image: linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.72)), url('${blueprint.heroImage}')">
      <p class="eyebrow">${escapeHtml(blueprint.collectionLabel)}</p>
      <h1>${escapeHtml(blueprint.headline)}</h1>
      <p class="lede">${escapeHtml(subhead)}</p>
      <a class="button" href="#contact">${escapeHtml(blueprint.cta)}</a>
    </section>

    <section id="about" class="section">
      <h2>Why this site</h2>
      <div class="feature-grid">
${features}
      </div>
    </section>

    <section id="work" class="section">
      <div class="section-head">
        <h2>${escapeHtml(blueprint.collectionLabel)}</h2>
        <p id="api-status" class="status">Loading catalog…</p>
      </div>
      <div id="item-list" class="card-grid">
${cards}
      </div>
    </section>

    <section id="contact" class="section contact">
      <div>
        <h2>${escapeHtml(blueprint.cta)}</h2>
        <p>This form posts to the Express API. If the server is offline, the page says so and keeps the preview usable.</p>
      </div>
      <form id="lead-form">
${fields}
        <button type="submit">${escapeHtml(blueprint.cta)}</button>
        <p id="form-note" class="status" role="status"></p>
      </form>
    </section>
  </main>

  <footer>
    <span>${escapeHtml(blueprint.brand)}</span>
    <span>Client + Express API · Lunor.AI</span>
  </footer>
  <script id="site-seed" type="application/json">${seed}</script>
  <script src="app.js"></script>
</body>
</html>
`;
}

function clientCss(blueprint: WebsiteBlueprint): string {
  return `:root {
  --bg: ${blueprint.bg};
  --ink: ${blueprint.ink};
  --accent: ${blueprint.accent};
  --accent-2: ${blueprint.accent2};
  --muted: color-mix(in srgb, var(--ink) 68%, transparent);
  --card: color-mix(in srgb, var(--ink) 6%, var(--bg));
  --line: color-mix(in srgb, var(--ink) 14%, transparent);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Outfit, "Segoe UI", sans-serif;
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }

.site-header, footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 7vw;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.brand { font-family: Fraunces, Georgia, serif; font-size: 1.2rem; text-decoration: none; }
nav { display: flex; gap: 18px; }
nav a { text-decoration: none; color: var(--muted); font-size: 0.92rem; }
nav a:hover { color: var(--ink); }

.hero {
  min-height: 78vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12vh 7vw 8vh;
  background-size: cover;
  background-position: center;
}
.eyebrow, .meta, .status { letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.75rem; color: var(--accent-2); }
h1, h2, h3 { font-family: Fraunces, Georgia, serif; font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.6rem, 6vw, 5.4rem); line-height: 0.95; margin: 8px 0 16px; max-width: 12ch; }
.lede { max-width: 38rem; font-size: 1.15rem; color: var(--ink); }
.button, button {
  display: inline-flex;
  margin-top: 18px;
  background: var(--accent);
  color: #0c0c0c;
  text-decoration: none;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font: inherit;
  font-weight: 520;
  cursor: pointer;
}
.button:hover, button:hover { filter: brightness(1.08); }

.section { padding: 72px 7vw; }
.section-head, .contact { display: flex; justify-content: space-between; gap: 24px; align-items: end; }
.feature-grid, .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature, .card, form {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
}
.feature { padding: 22px; }
.feature p, .card p, .contact p { color: var(--muted); }
.card img { height: 190px; width: 100%; border-radius: 18px 18px 0 0; }
.card-body { padding: 16px 18px 20px; }
.card h3, .feature h3 { margin: 6px 0; }

form { padding: 20px; display: grid; gap: 12px; min-width: min(100%, 360px); }
label { display: grid; gap: 6px; font-size: 0.85rem; color: var(--muted); }
input {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  border-radius: 10px;
  padding: 12px;
  font: inherit;
}
footer { border-top: 1px solid var(--line); color: var(--muted); font-size: 0.85rem; }

@media (max-width: 800px) {
  .feature-grid, .card-grid, .section-head, .contact, .site-header, footer { display: grid; }
  .feature-grid, .card-grid { grid-template-columns: 1fr; }
  nav { gap: 12px; }
}
`;
}

function clientJs(): string {
  return `// Client for the website generator.
// Renders seed data immediately, then replaces it when the Express API is reachable.
(function () {
  var seedNode = document.getElementById("site-seed");
  var seed = { apiBase: "http://localhost:3001", items: [] };
  try {
    seed = JSON.parse(seedNode ? seedNode.textContent || "{}" : "{}");
  } catch (error) {
    console.warn("Seed JSON could not be read", error);
  }

  var list = document.getElementById("item-list");
  var status = document.getElementById("api-status");
  var form = document.getElementById("lead-form");
  var note = document.getElementById("form-note");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(items, source) {
    if (!list) return;
    list.innerHTML = items.map(function (item) {
      return '<article class="card">' +
        '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" />' +
        '<div class="card-body"><p class="meta">' + escapeHtml(item.meta) + '</p>' +
        '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.detail) + '</p></div></article>';
    }).join("");
    if (status) {
      status.textContent = source === "api" ? "Live API" : "Preview data — API offline";
    }
  }

  render(seed.items || [], "seed");

  fetch(seed.apiBase + "/api/items")
    .then(function (response) {
      if (!response.ok) throw new Error("Catalog request failed");
      return response.json();
    })
    .then(function (items) { render(items, "api"); })
    .catch(function () { render(seed.items || [], "seed"); });

  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = Object.fromEntries(new FormData(form).entries());
    fetch(seed.apiBase + "/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Lead request failed");
        if (note) note.textContent = "Saved to the API.";
        form.reset();
      })
      .catch(function () {
        if (note) note.textContent = "API offline. Start the server with npm start inside server/ to store this.";
      });
  });
})();
`;
}

function serverJs(blueprint: WebsiteBlueprint): string {
  const items = JSON.stringify(blueprint.items, null, 2);
  return `/**
 * ${blueprint.brand} API
 * Learning server for the Web Development website generator.
 * Run: npm install && npm start
 */
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

const items = ${items};

const leads = [];

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: ${JSON.stringify(blueprint.brand)} });
});

app.get("/api/items", (_req, res) => {
  res.json(items);
});

app.get("/api/leads", (_req, res) => {
  res.json(leads);
});

app.post("/api/leads", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !email.includes("@")) {
    res.status(400).json({ error: "Name and a valid email are required." });
    return;
  }

  const lead = {
    id: "lead_" + Date.now().toString(36),
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  };
  leads.unshift(lead);
  res.status(201).json(lead);
});

app.listen(port, () => {
  console.log(${JSON.stringify(blueprint.brand + " API")} + " listening on http://localhost:" + port);
});
`;
}

function serverPackage(blueprint: WebsiteBlueprint): string {
  const slug = blueprint.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `{
  "name": "${slug}-api",
  "version": "1.0.0",
  "private": true,
  "description": "Express API for the ${blueprint.brand} website",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2"
  }
}
`;
}

function readme(blueprint: WebsiteBlueprint, subhead: string): string {
  return `# ${blueprint.brand}

${subhead}

Generated by the Lunor.AI full-stack website generator in the Web Development assistant.

## Project layout

- \`client/index.html\` — page structure
- \`client/styles.css\` — theme and layout
- \`client/app.js\` — loads \`GET /api/items\` and posts the form to \`POST /api/leads\`
- \`server/index.js\` — Express API with in-memory data
- \`server/package.json\` — API dependencies

The preview uses seed data baked into the page. When the API is running, the catalog and form talk to it instead.

## Run the API

\`\`\`bash
cd server
npm install
npm start
\`\`\`

The server listens on http://localhost:3001.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/health | Service check |
| GET | /api/items | Catalog for the page |
| GET | /api/leads | Submitted forms |
| POST | /api/leads | Save a form (\`name\`, \`email\`, \`message\`) |

This API keeps data in memory for learning. It is not a production backend.
`;
}

export interface BuiltWebsite {
  blueprint: WebsiteBlueprint;
  subhead: string;
  files: GeneratedWebsiteFile[];
  summary: string;
}

export function buildFullStackWebsite(blueprintId: string, options?: { brief?: string }): BuiltWebsite {
  const blueprint = getWebsiteBlueprint(blueprintId);
  const brief = options?.brief?.trim() || "";
  const subhead = brief || blueprint.subhead;
  const files: GeneratedWebsiteFile[] = [
    { path: "client/index.html", language: "html", content: clientHtml(blueprint, subhead) },
    { path: "client/styles.css", language: "css", content: clientCss(blueprint) },
    { path: "client/app.js", language: "javascript", content: clientJs() },
    { path: "server/index.js", language: "javascript", content: serverJs(blueprint) },
    { path: "server/package.json", language: "json", content: serverPackage(blueprint) },
    { path: "README.md", language: "markdown", content: readme(blueprint, subhead) },
  ];

  const summary = [
    `Built **${blueprint.brand}**, a full-stack ${blueprint.name.toLowerCase()} website.`,
    "",
    brief ? `Brief applied to the hero: ${brief}` : blueprint.description,
    "",
    "**Client** — open the preview. It renders without a server.",
    "- `client/index.html`",
    "- `client/styles.css`",
    "- `client/app.js`",
    "",
    "**API** — in-memory Express server.",
    "- `server/index.js` exposes `GET /api/items` and `POST /api/leads`",
    "- `server/package.json`",
    "",
    "Run it locally:",
    "",
    "```bash",
    "cd server",
    "npm install",
    "npm start",
    "```",
    "",
    "The page shows seed data until http://localhost:3001 answers. Use **Refine with AI** to restyle this same file layout.",
  ].join("\n");

  return { blueprint, subhead, files, summary };
}

function cloneNode(node: ProjectTreeNode): ProjectTreeNode {
  return {
    ...node,
    children: node.children?.map(cloneNode),
  };
}

export function insertGeneratedFile(
  tree: ProjectTreeNode[],
  filePath: string,
  content: string,
  language: string,
): ProjectTreeNode[] {
  const parts = filePath.split("/").filter(Boolean);
  const next = tree.map(cloneNode);
  let siblings = next;
  let prefix = "";

  parts.forEach((part, index) => {
    prefix = prefix ? `${prefix}/${part}` : part;
    const isFile = index === parts.length - 1;
    let node = siblings.find((entry) => entry.name === part && entry.type === (isFile ? "file" : "folder"));
    if (!node) {
      node = isFile
        ? { id: prefix, name: part, type: "file", language, content }
        : { id: prefix, name: part, type: "folder", isOpen: true, children: [] };
      siblings.push(node);
    } else if (isFile) {
      node.content = content;
      node.language = language;
    }
    if (!isFile) {
      node.children = node.children || [];
      node.isOpen = true;
      siblings = node.children;
    }
  });

  return next;
}

export function filesToProjectTree(files: GeneratedWebsiteFile[]): ProjectTreeNode[] {
  return files.reduce<ProjectTreeNode[]>(
    (tree, file) => insertGeneratedFile(tree, file.path, file.content, file.language),
    [],
  );
}
