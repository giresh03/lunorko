/**
 * Full-stack website generator for the Web Development AI assistant.
 * Builds a previewable HTML/CSS/JS client plus an Express API that serves
 * the same content and stores contact messages.
 */

export type WebsiteKind = "landing" | "portfolio" | "restaurant" | "shop" | "blog";

export interface WebsiteBrief {
  name: string;
  tagline?: string;
  kind?: WebsiteKind;
  accent?: string;
}

export interface GeneratedWebsiteFile {
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
  isOpen?: boolean;
  children?: GeneratedTreeNode[];
}

export interface WebsiteSectionItem {
  title: string;
  body: string;
  meta?: string;
  image: string;
}

export interface WebsiteContent {
  name: string;
  tagline: string;
  kind: WebsiteKind;
  accent: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  cta: string;
  heroImage: string;
  nav: { href: string; label: string }[];
  sections: {
    id: string;
    kicker: string;
    title: string;
    items: WebsiteSectionItem[];
  }[];
}

export interface GeneratedWebsite {
  name: string;
  slug: string;
  kind: WebsiteKind;
  content: WebsiteContent;
  files: GeneratedWebsiteFile[];
}

export const WEBSITE_KINDS: { id: WebsiteKind; label: string; hint: string }[] = [
  { id: "landing", label: "Landing", hint: "Features, pricing, contact" },
  { id: "portfolio", label: "Portfolio", hint: "Projects and services" },
  { id: "restaurant", label: "Restaurant", hint: "Menu and reservations" },
  { id: "shop", label: "Shop", hint: "Products and policies" },
  { id: "blog", label: "Blog", hint: "Posts and topics" },
];

const ACCENTS: Record<WebsiteKind, string> = {
  landing: "#0f766e",
  portfolio: "#4f46e5",
  restaurant: "#b45309",
  shop: "#be123c",
  blog: "#0369a1",
};

const LANG_BY_EXT: Record<string, string> = {
  html: "html",
  css: "css",
  js: "javascript",
  json: "json",
  md: "markdown",
};

export function isFullStackWebsitePrompt(prompt: string): boolean {
  const text = prompt.trim();
  if (!text) return false;
  if (/\b(full[\s-]?stack|website generator|express\s+(api|backend|server))\b/i.test(text)) return true;
  return /\b(generate|build|create|scaffold|make)\s+(?:me\s+)?(?:a|an|the)?\s*(?:full[\s-]?stack\s+)?(?:website|web\s*site)\b/i.test(text);
}

export function briefFromPrompt(prompt: string): WebsiteBrief {
  return {
    name: extractName(prompt),
    tagline: extractTagline(prompt),
    kind: detectKind(prompt),
  };
}

export function generateFullStackWebsite(brief: WebsiteBrief): GeneratedWebsite {
  const content = buildContent(brief);
  const slug = slugify(content.name);
  const files: GeneratedWebsiteFile[] = [
    { path: "index.html", language: "html", content: renderIndexHtml(content) },
    { path: "styles.css", language: "css", content: CLIENT_CSS },
    { path: "app.js", language: "javascript", content: CLIENT_APP_JS },
    { path: "server/server.js", language: "javascript", content: renderServerJs() },
    { path: "server/routes.js", language: "javascript", content: renderRoutesJs() },
    { path: "server/store.js", language: "javascript", content: renderStoreJs(content) },
    { path: "package.json", language: "json", content: renderPackageJson(slug) },
    { path: "README.md", language: "markdown", content: renderReadme(content, slug) },
  ];
  return { name: content.name, slug, kind: content.kind, content, files };
}

export function formatWebsiteChatSummary(site: GeneratedWebsite): string {
  const files = site.files.map((file) => `- \`${file.path}\``).join("\n");
  return [
    `**${site.name}** is in the editor as a full-stack ${site.kind} website.`,
    "",
    files,
    "",
    "The preview runs in the browser from the embedded seed. The Express API in `server/` serves the same content at `GET /api/content` and stores contact messages at `POST /api/contact`.",
    "",
    "Download the project with **Run Locally**, then:",
    "",
    "```bash",
    "npm install",
    "npm start",
    "```",
  ].join("\n");
}

export function generatedFilesToTree(files: GeneratedWebsiteFile[]): GeneratedTreeNode[] {
  const tree: GeneratedTreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/");
    let nodes = tree;
    let prefix = "";
    for (let i = 0; i < parts.length - 1; i += 1) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
      let folder = nodes.find((node) => node.id === prefix && node.type === "folder");
      if (!folder) {
        folder = { id: prefix, name: parts[i], type: "folder", isOpen: true, children: [] };
        nodes.push(folder);
      }
      nodes = folder.children ?? [];
    }
    const name = parts[parts.length - 1];
    nodes.push({
      id: file.path,
      name,
      type: "file",
      language: file.language || LANG_BY_EXT[name.split(".").pop() || ""] || "plaintext",
      content: file.content,
    });
  }
  return tree;
}

function buildContent(brief: WebsiteBrief): WebsiteContent {
  const kind = brief.kind && WEBSITE_KINDS.some((entry) => entry.id === brief.kind) ? brief.kind : "landing";
  const name = cleanText(brief.name) || "Northstar";
  const accent = normalizeAccent(brief.accent, ACCENTS[kind]);
  const tagline = cleanText(brief.tagline || "") || defaultTagline(kind, name);
  const seed = slugify(name) || kind;
  const image = (slot: string) => `https://picsum.photos/seed/${seed}-${slot}/1200/800`;

  const shared = {
    name,
    tagline,
    kind,
    accent,
    heroImage: image("hero"),
  };

  if (kind === "portfolio") {
    return {
      ...shared,
      eyebrow: "Selected work",
      heroTitle: `${name} designs products people remember.`,
      heroBody: tagline,
      cta: "Start a project",
      nav: [
        { href: "#work", label: "Work" },
        { href: "#services", label: "Services" },
        { href: "#contact", label: "Contact" },
      ],
      sections: [
        {
          id: "work",
          kicker: "Projects",
          title: "Recent work",
          items: [
            item("Harbor Analytics", "A dashboard for a logistics team that cut weekly reporting from hours to minutes.", "Product", image("work-1")),
            item("Lumen Studio", "Brand site and booking flow for a photography collective.", "Brand", image("work-2")),
            item("Field Notes", "Editorial magazine layout with a reading experience built for mobile.", "Editorial", image("work-3")),
            item("Northwind", "Marketing site and lead form for a climate startup.", "Web", image("work-4")),
          ],
        },
        {
          id: "services",
          kicker: "Services",
          title: "How we work",
          items: [
            item("Product design", "Interfaces, prototypes, and a design system your team can extend.", undefined, image("svc-1")),
            item("Web builds", "Fast marketing sites wired to a small API for forms and content.", undefined, image("svc-2")),
            item("Launch support", "Copy, analytics, and a handoff doc so the site stays easy to change.", undefined, image("svc-3")),
          ],
        },
      ],
    };
  }

  if (kind === "restaurant") {
    return {
      ...shared,
      eyebrow: "Seasonal kitchen",
      heroTitle: `Dinner at ${name}.`,
      heroBody: tagline,
      cta: "Reserve a table",
      nav: [
        { href: "#menu", label: "Menu" },
        { href: "#visit", label: "Visit" },
        { href: "#contact", label: "Reserve" },
      ],
      sections: [
        {
          id: "menu",
          kicker: "Menu",
          title: "Tonight's plates",
          items: [
            item("Citrus greens", "Fennel, orange, and toasted almond.", "$14", image("menu-1")),
            item("Roasted squash", "Brown butter, chili, and ricotta.", "$18", image("menu-2")),
            item("Market fish", "Charred lemon and herb oil.", "$32", image("menu-3")),
            item("Wood-fired chicken", "Garlic pan sauce and greens.", "$28", image("menu-4")),
            item("Chocolate tart", "Olive oil and sea salt.", "$12", image("menu-5")),
            item("House spritz", "Citrus, bitter, and soda.", "$11", image("menu-6")),
          ],
        },
        {
          id: "visit",
          kicker: "Visit",
          title: "Find us",
          items: [
            item("Hours", "Tue–Thu 5–10pm, Fri–Sat 5–11pm. Closed Sunday and Monday.", undefined, image("visit-1")),
            item("Neighborhood", "A short walk from the station, with street parking after 6pm.", undefined, image("visit-2")),
            item("Private dining", "The back room seats 12. Ask when you write to us.", undefined, image("visit-3")),
          ],
        },
      ],
    };
  }

  if (kind === "shop") {
    return {
      ...shared,
      eyebrow: "Online shop",
      heroTitle: `${name} — made to be used every day.`,
      heroBody: tagline,
      cta: "Shop the edit",
      nav: [
        { href: "#products", label: "Products" },
        { href: "#policies", label: "Policies" },
        { href: "#contact", label: "Contact" },
      ],
      sections: [
        {
          id: "products",
          kicker: "Catalog",
          title: "This week's edit",
          items: [
            item("Canvas tote", "Heavy cotton, one outside pocket.", "$48", image("prod-1")),
            item("Stoneware mug", "Speckled glaze, dishwasher safe.", "$32", image("prod-2")),
            item("Wool throw", "Charcoal and cream stripe.", "$120", image("prod-3")),
            item("Desk lamp", "Warm dimmer and a linen shade.", "$96", image("prod-4")),
            item("Notebook set", "Three ruled books, lay-flat binding.", "$24", image("prod-5")),
            item("Cedar candle", "Eight-hour burn, hand-poured.", "$28", image("prod-6")),
          ],
        },
        {
          id: "policies",
          kicker: "Good to know",
          title: "Shipping and care",
          items: [
            item("Shipping", "Orders leave in two business days. Free over $75.", undefined, image("pol-1")),
            item("Returns", "30 days, unused, in original packaging.", undefined, image("pol-2")),
            item("Care", "Each product page in the API includes a short care note.", undefined, image("pol-3")),
          ],
        },
      ],
    };
  }

  if (kind === "blog") {
    return {
      ...shared,
      eyebrow: "Journal",
      heroTitle: `Notes from ${name}.`,
      heroBody: tagline,
      cta: "Read the latest",
      nav: [
        { href: "#posts", label: "Posts" },
        { href: "#topics", label: "Topics" },
        { href: "#contact", label: "Write in" },
      ],
      sections: [
        {
          id: "posts",
          kicker: "Latest",
          title: "From the journal",
          items: [
            item("Shipping a small API", "What we kept in the first version, and what we left out.", "Engineering", image("post-1")),
            item("A quieter homepage", "Type, spacing, and one image that does the work.", "Design", image("post-2")),
            item("Forms that fail kindly", "Validation messages people can actually use.", "Product", image("post-3")),
            item("Preview without a server", "Why the page carries its own seed data.", "Web", image("post-4")),
          ],
        },
        {
          id: "topics",
          kicker: "Topics",
          title: "What we write about",
          items: [
            item("Interfaces", "Layout, type, and the details that make a page feel finished.", undefined, image("topic-1")),
            item("APIs", "Small Express services that a static page can call.", undefined, image("topic-2")),
            item("Practice", "How to learn a stack by building one complete site.", undefined, image("topic-3")),
          ],
        },
      ],
    };
  }

  return {
    ...shared,
    eyebrow: "Web studio",
    heroTitle: `${name} helps teams launch clearer websites.`,
    heroBody: tagline,
    cta: "Book a walkthrough",
    nav: [
      { href: "#features", label: "Features" },
      { href: "#pricing", label: "Pricing" },
      { href: "#contact", label: "Contact" },
    ],
    sections: [
      {
        id: "features",
        kicker: "Product",
        title: "Everything in one project",
        items: [
          item("Live preview", "The page renders in the editor before you install anything.", undefined, image("feat-1")),
          item("Content API", "The same copy is served by Express at /api/content.", undefined, image("feat-2")),
          item("Contact inbox", "Messages post to /api/contact and stay in memory while the server runs.", undefined, image("feat-3")),
          item("Ready to extend", "Add a route in server/routes.js and a section in the seed.", undefined, image("feat-4")),
        ],
      },
      {
        id: "pricing",
        kicker: "Pricing",
        title: "Simple plans",
        items: [
          item("Starter", "One site, the generated API, and email support.", "$0", image("price-1")),
          item("Studio", "Custom sections, a shared content model, and a launch checklist.", "$49", image("price-2")),
          item("Team", "Workshops, code review, and a deployment walkthrough.", "$149", image("price-3")),
        ],
      },
    ],
  };
}

function item(title: string, body: string, meta: string | undefined, image: string): WebsiteSectionItem {
  return { title, body, meta, image };
}

function defaultTagline(kind: WebsiteKind, name: string): string {
  switch (kind) {
    case "portfolio":
      return `${name} is a studio for product design and web builds.`;
    case "restaurant":
      return `Seasonal plates, a short wine list, and a room that stays unhurried.`;
    case "shop":
      return `Useful objects, small batches, shipped from the ${name} studio.`;
    case "blog":
      return `Practical writing on design, APIs, and shipping websites.`;
    default:
      return `${name} pairs a polished front end with a small API you can run locally.`;
  }
}

function renderIndexHtml(content: WebsiteContent): string {
  const json = JSON.stringify(content).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(content.name)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
  <div id="app">Loading ${escapeHtml(content.name)}…</div>
  <script>window.__SITE_SEED__ = ${json};</script>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderStoreJs(content: WebsiteContent): string {
  const json = JSON.stringify(content, null, 2);
  return `const content = ${json};

const messages = [];

function getContent() {
  return content;
}

function listMessages() {
  return messages.slice();
}

function addMessage(entry) {
  const saved = { id: messages.length + 1, ...entry };
  messages.unshift(saved);
  return saved;
}

module.exports = { getContent, listMessages, addMessage };
`;
}

function renderRoutesJs(): string {
  return `const express = require("express");
const { getContent, listMessages, addMessage } = require("./store");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.get("/content", (_req, res) => {
  res.json(getContent());
});

router.get("/messages", (_req, res) => {
  res.json({ messages: listMessages() });
});

router.post("/contact", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email." });
  }
  if (name.length > 80 || email.length > 120 || message.length > 2000) {
    return res.status(400).json({ error: "One of the fields is too long." });
  }

  const saved = addMessage({
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  });
  return res.status(201).json({ ok: true, message: saved });
});

module.exports = router;
`;
}

function renderServerJs(): string {
  return `const path = require("path");
const express = require("express");
const routes = require("./routes");

const app = express();
const port = Number(process.env.PORT) || 3000;
const root = path.join(__dirname, "..");

app.use(express.json());
app.use("/api", routes);
app.use(express.static(root));

app.listen(port, () => {
  console.log("Website running at http://localhost:" + port);
});
`;
}

function renderPackageJson(slug: string): string {
  return JSON.stringify(
    {
      name: slug,
      version: "1.0.0",
      private: true,
      description: "Full-stack website generated by Lunor.AI",
      main: "server/server.js",
      scripts: {
        start: "node server/server.js",
      },
      dependencies: {
        express: "^4.21.2",
      },
    },
    null,
    2,
  ) + "\n";
}

function renderReadme(content: WebsiteContent, slug: string): string {
  return `# ${content.name}

${content.tagline}

Generated by the Lunor.AI full-stack website automation (${content.kind}).

## Run the API

\`\`\`bash
cd ${slug}
npm install
npm start
\`\`\`

Open http://localhost:3000

## What you get

- \`index.html\`, \`styles.css\`, and \`app.js\` — the site. The preview works without a server because the page embeds \`window.__SITE_SEED__\`.
- \`server/server.js\` — Express static server.
- \`server/routes.js\` — \`GET /api/health\`, \`GET /api/content\`, \`GET /api/messages\`, \`POST /api/contact\`.
- \`server/store.js\` — the content seed and an in-memory message list.

## Try the API

\`\`\`bash
curl http://localhost:3000/api/content
curl -X POST http://localhost:3000/api/contact \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Ada","email":"ada@example.com","message":"Hello"}'
\`\`\`
`;
}

function extractName(prompt: string): string {
  const quoted = prompt.match(/["“]([^"”]{2,60})["”]/);
  if (quoted) return quoted[1].trim();
  const named = prompt.match(/\b(?:for|called|named)\s+(?:a|an|my|the)?\s*([A-Za-z0-9][^.\n]{1,48})/i);
  if (named) {
    return named[1].replace(/\b(with|using|that|and|featuring|including)\b.*$/i, "").trim();
  }
  return "Northstar";
}

function extractTagline(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (cleaned.length > 40 && cleaned.length < 180 && !isFullStackWebsitePrompt(cleaned)) return cleaned;
  return "";
}

function detectKind(prompt: string): WebsiteKind {
  const text = prompt.toLowerCase();
  if (/restaurant|cafe|café|coffee|menu|bistro|diner/.test(text)) return "restaurant";
  if (/shop|store|ecommerce|e-commerce|product catalog|boutique/.test(text)) return "shop";
  if (/blog|journal|magazine|newsletter/.test(text)) return "blog";
  if (/portfolio|freelance|photographer|designer|agency|studio site/.test(text)) return "portfolio";
  return "landing";
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 80);
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

function normalizeAccent(value: string | undefined, fallback: string): string {
  if (value && /^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CLIENT_CSS = `/* Generated full-stack website */
:root {
  --accent: #0f766e;
  --bg: #0b1020;
  --card: #141a2e;
  --text: #e8eefc;
  --muted: #9aa6c2;
  --line: rgba(232, 238, 252, 0.12);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Segoe UI", "Helvetica Neue", sans-serif;
  background: radial-gradient(1200px 500px at 80% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%), var(--bg);
  color: var(--text);
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; object-fit: cover; }
.wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 8px;
}
.brand { font-weight: 700; letter-spacing: -0.03em; }
.nav { display: flex; gap: 18px; color: var(--muted); font-size: 14px; }
.nav a:hover { color: var(--text); }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 36px;
  align-items: center;
  padding: 36px 0 20px;
}
.eyebrow {
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 700;
}
h1 { font-size: clamp(40px, 6vw, 68px); line-height: 0.95; letter-spacing: -0.045em; margin: 12px 0; }
.lede { color: var(--muted); font-size: 18px; max-width: 46ch; }
.cta {
  display: inline-flex;
  margin-top: 22px;
  background: var(--accent);
  color: white;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 650;
}
.hero-photo {
  min-height: 360px;
  border-radius: 28px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}
section { padding: 28px 0 8px; }
.section-head { margin-bottom: 18px; }
.section-head h2 { margin: 6px 0 0; font-size: 32px; letter-spacing: -0.03em; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
}
.card img { height: 160px; width: 100%; }
.card div { padding: 14px 16px 18px; }
.card h3 { margin: 0 0 6px; font-size: 18px; }
.card p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }
.meta { color: var(--accent); font-weight: 700; font-size: 13px; margin-bottom: 6px; }
.contact {
  margin: 28px 0 48px;
  padding: 28px;
  border-radius: 28px;
  background: var(--card);
  border: 1px solid var(--line);
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 24px;
}
form { display: grid; gap: 10px; }
input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: #0d1326;
  color: var(--text);
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
}
button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: white;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}
#form-status { min-height: 1.2em; color: var(--muted); font-size: 14px; }
@media (max-width: 800px) {
  .hero, .contact { grid-template-columns: 1fr; }
  .hero-photo { min-height: 220px; }
  .nav { display: none; }
}
`;

const CLIENT_APP_JS = `(function () {
  var root = document.getElementById("app");
  var seed = window.__SITE_SEED__;
  if (!root || !seed) return;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(site) {
    document.documentElement.style.setProperty("--accent", site.accent || "#0f766e");
    var nav = (site.nav || []).map(function (item) {
      return '<a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.label) + "</a>";
    }).join("");
    var sections = (site.sections || []).map(function (section) {
      var cards = (section.items || []).map(function (item) {
        var meta = item.meta ? '<div class="meta">' + escapeHtml(item.meta) + "</div>" : "";
        return '<article class="card"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" /><div>' +
          meta + "<h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.body) + "</p></div></article>";
      }).join("");
      return '<section id="' + escapeHtml(section.id) + '"><div class="section-head"><div class="eyebrow">' +
        escapeHtml(section.kicker) + "</div><h2>" + escapeHtml(section.title) + '</h2></div><div class="grid">' + cards + "</div></section>";
    }).join("");

    root.innerHTML =
      '<header class="wrap site-header"><div class="brand">' + escapeHtml(site.name) + '</div><nav class="nav">' + nav + "</nav></header>" +
      '<main class="wrap"><section class="hero"><div><div class="eyebrow">' + escapeHtml(site.eyebrow) + "</div><h1>" +
      escapeHtml(site.heroTitle) + '</h1><p class="lede">' + escapeHtml(site.heroBody) + '</p><a class="cta" href="#contact">' +
      escapeHtml(site.cta) + '</a></div><div class="hero-photo" style="background-image:url(' + "'" + escapeHtml(site.heroImage) + "'" + ')"></div></section>' +
      sections +
      '<section class="contact" id="contact"><div><div class="eyebrow">Contact</div><h2>Write to ' + escapeHtml(site.name) +
      '</h2><p class="lede">' + escapeHtml(site.tagline) + '</p></div><form id="contact-form"><input name="name" placeholder="Name" required />' +
      '<input name="email" type="email" placeholder="Email" required /><textarea name="message" rows="4" placeholder="Message" required></textarea>' +
      '<button type="submit">Send</button><p id="form-status"></p></form></section></main>';
  }

  async function refreshFromApi() {
    try {
      var response = await fetch("/api/content");
      if (!response.ok) return;
      var data = await response.json();
      if (data && data.name) render(data);
    } catch (error) {
      /* Preview has no API. The seed already rendered. */
    }
  }

  document.addEventListener("submit", async function (event) {
    var form = event.target;
    if (!form || form.id !== "contact-form") return;
    event.preventDefault();
    var status = document.getElementById("form-status");
    var data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };
    try {
      var response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      var body = await response.json();
      if (!response.ok) throw new Error(body.error || "Request failed");
      if (status) status.textContent = "Sent. The API stored your message.";
      form.reset();
    } catch (error) {
      if (status) status.textContent = "Saved in this preview. Run npm start to store messages on the server.";
    }
  });

  render(seed);
  refreshFromApi();
})();
`;
