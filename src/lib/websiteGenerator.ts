/**
 * Full-stack website generator for the Web Development assistant.
 * Produces a previewable browser client plus an Express + MongoDB API.
 */

export type WebsiteKind = "portfolio" | "saas" | "restaurant" | "blog" | "store";

export interface WebsiteBrief {
  kind: WebsiteKind;
  name: string;
  tagline: string;
}

export interface WebsiteFile {
  path: string;
  language: string;
  content: string;
}

export interface WebsiteTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: WebsiteTreeNode[];
  isOpen?: boolean;
}

export interface GeneratedWebsite {
  brief: WebsiteBrief;
  files: WebsiteFile[];
  tree: WebsiteTreeNode[];
  previewFileId: string;
  summary: string;
}

export interface WebsiteKindMeta {
  id: WebsiteKind;
  label: string;
  blurb: string;
  defaultName: string;
  defaultTagline: string;
}

export const WEBSITE_KINDS: WebsiteKindMeta[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    blurb: "Projects, about, and a contact API",
    defaultName: "Atelier North",
    defaultTagline: "Selected work and a direct line for new projects.",
  },
  {
    id: "saas",
    label: "SaaS",
    blurb: "Landing page, pricing, and a leads API",
    defaultName: "Northstar",
    defaultTagline: "The calm way for small teams to ship weekly.",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    blurb: "Menu, hours, and reservations",
    defaultName: "Hearth & Rye",
    defaultTagline: "Wood-fired plates, a short menu, and a neighborhood table.",
  },
  {
    id: "blog",
    label: "Blog",
    blurb: "Essays plus a subscriber API",
    defaultName: "Field Notes",
    defaultTagline: "Short essays on making software that people can finish.",
  },
  {
    id: "store",
    label: "Store",
    blurb: "Catalog, cart, and an orders API",
    defaultName: "Harbor Goods",
    defaultTagline: "Everyday objects, packed by hand and shipped twice a week.",
  },
];

interface FieldSpec {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "textarea";
  required: boolean;
}

interface ItemSpec {
  id: string;
  title: string;
  text: string;
  meta: string;
  price?: number;
}

interface SiteSpec {
  kind: WebsiteKind;
  name: string;
  tagline: string;
  accent: string;
  accentSoft: string;
  eyebrow: string;
  heroTitle: string;
  sectionTitle: string;
  sectionText: string;
  items: ItemSpec[];
  features: { title: string; text: string }[];
  collection: string;
  listPath: string;
  createPath: string;
  listLabel: string;
  formTitle: string;
  formText: string;
  submitLabel: string;
  fields: FieldSpec[];
}

const KIND_META = Object.fromEntries(WEBSITE_KINDS.map((kind) => [kind.id, kind])) as Record<WebsiteKind, WebsiteKindMeta>;

export function kindMeta(kind: WebsiteKind): WebsiteKindMeta {
  return KIND_META[kind];
}

/** Skip Node modules when the HTML preview inlines loose .js files. */
export function isNodeModuleSource(content: string): boolean {
  return (
    /\brequire\s*\(/.test(content) ||
    /\bmodule\.exports\b/.test(content) ||
    /\bprocess\.env\b/.test(content) ||
    /^\s*import\s/m.test(content) ||
    /^\s*export\s/m.test(content)
  );
}

export function interpretWebsitePrompt(text: string): WebsiteBrief | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 500) return null;
  if (/^\s*(explain|how|what|why|debug|fix|review)\b/i.test(trimmed)) return null;
  if (!/\b(build|create|generate|make|scaffold|design)\b/i.test(trimmed)) return null;
  if (!/\b(website|web\s*site|landing\s+page|full[\s-]?stack(?:\s+site)?|online\s+store)\b/i.test(trimmed)) return null;

  const kind = detectKind(trimmed);
  const meta = kindMeta(kind);
  const name = detectName(trimmed) || meta.defaultName;
  const tagline = meta.defaultTagline;
  return { kind, name, tagline };
}

export function generateWebsiteProject(input: WebsiteBrief): GeneratedWebsite {
  const meta = kindMeta(input.kind);
  const brief: WebsiteBrief = {
    kind: input.kind,
    name: clamp(input.name.trim() || meta.defaultName, 48),
    tagline: clamp(input.tagline.trim() || meta.defaultTagline, 140),
  };
  const spec = buildSpec(brief);
  const files = buildFiles(spec);
  return {
    brief,
    files,
    tree: buildFileTree(files),
    previewFileId: "client/index.html",
    summary: buildSummary(spec, files.length),
  };
}

function detectKind(text: string): WebsiteKind {
  const value = text.toLowerCase();
  if (/\b(store|shop|e-?commerce|catalog|product)\b/.test(value)) return "store";
  if (/\b(restaurant|cafe|café|menu|reservation|bistro)\b/.test(value)) return "restaurant";
  if (/\b(blog|magazine|newsletter|essay|journal)\b/.test(value)) return "blog";
  if (/\b(portfolio|personal site|case stud|freelance)\b/.test(value)) return "portfolio";
  if (/\b(saas|startup|pricing|landing)\b/.test(value)) return "saas";
  return "saas";
}

function detectName(text: string): string | null {
  const quoted = text.match(/["“]([^"”]{2,48})["”]/);
  if (quoted) return cleanName(quoted[1]);
  const called = text.match(/\b(?:called|named|titled)\s+([A-Za-z0-9][\w'&.\- ]{1,48})/i);
  if (called) return cleanName(called[1]);
  return null;
}

function cleanName(raw: string): string {
  const cut = raw.replace(/\b(with|using|that|featuring|and a|website|site)\b[\s\S]*$/i, "").trim();
  return clamp(cut, 48);
}

function clamp(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max).trim();
}

function slugify(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

function buildSpec(brief: WebsiteBrief): SiteSpec {
  const shared = {
    kind: brief.kind,
    name: brief.name,
    tagline: brief.tagline,
  };

  if (brief.kind === "portfolio") {
    return {
      ...shared,
      accent: "#2dd4bf",
      accentSoft: "rgba(45, 212, 191, 0.14)",
      eyebrow: "Studio",
      heroTitle: `${brief.name} designs products people finish.`,
      sectionTitle: "Selected work",
      sectionText: "Three recent engagements. Ask the API for the live list.",
      listLabel: "Projects",
      collection: "projects",
      listPath: "/projects",
      createPath: "/messages",
      formTitle: "Start a project",
      formText: "Messages are stored by the API. The preview keeps a local copy if the server is off.",
      submitLabel: "Send message",
      features: [
        { title: "Research first", text: "Every engagement starts with the job to be done, not a component library." },
        { title: "Small releases", text: "Ship a usable slice in the first week and tighten it with real users." },
        { title: "Handoff included", text: "You leave with the repo, the API, and notes your team can run." },
      ],
      items: [
        { id: "p1", title: "Harbor ledger", text: "A billing workspace for a 12-person studio. Cut invoice time in half.", meta: "Product · 2026" },
        { id: "p2", title: "North trail", text: "A booking site for guided walks, with a waitlist that actually closes.", meta: "Web · 2025" },
        { id: "p3", title: "Kindred notes", text: "Shared research notes for a clinical team. Offline first, sync later.", meta: "App · 2025" },
      ],
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "message", label: "Project notes", type: "textarea", required: true },
      ],
    };
  }

  if (brief.kind === "restaurant") {
    return {
      ...shared,
      accent: "#f59e0b",
      accentSoft: "rgba(245, 158, 11, 0.16)",
      eyebrow: "Dinner",
      heroTitle: `A table at ${brief.name}.`,
      sectionTitle: "Tonight's menu",
      sectionText: "The menu is served by the API. Reservations land in the same database.",
      listLabel: "Menu",
      collection: "menu",
      listPath: "/menu",
      createPath: "/reservations",
      formTitle: "Reserve a table",
      formText: "Tell us the night and the size of your party.",
      submitLabel: "Request reservation",
      features: [
        { title: "Wood oven", text: "Bread and vegetables come off the same fire, plated in the room." },
        { title: "Short list", text: "Eight dishes. The kitchen changes two of them when the market does." },
        { title: "Late seating", text: "Last reservation at 9:00. The bar stays open for a quiet hour after." },
      ],
      items: [
        { id: "m1", title: "Rye loaf & cultured butter", text: "Warm from the oven, salted butter, flaky salt.", meta: "To start · $9" },
        { id: "m2", title: "Ember carrots", text: "Charred carrots, hazelnut, whey, and herbs from the alley garden.", meta: "Plate · $16" },
        { id: "m3", title: "Market fish", text: "Today's catch, brown butter, lemon, and a bitter green.", meta: "Main · $32" },
      ],
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "guests", label: "Guests", type: "number", required: true },
        { name: "notes", label: "Notes", type: "textarea", required: false },
      ],
    };
  }

  if (brief.kind === "blog") {
    return {
      ...shared,
      accent: "#38bdf8",
      accentSoft: "rgba(56, 189, 248, 0.14)",
      eyebrow: "Journal",
      heroTitle: `${brief.name}`,
      sectionTitle: "Latest notes",
      sectionText: "Posts come from the API. New subscribers are saved beside them.",
      listLabel: "Notes",
      collection: "posts",
      listPath: "/posts",
      createPath: "/subscribers",
      formTitle: "Get the next note",
      formText: "One email when a new essay is published. No digest, no drip.",
      submitLabel: "Subscribe",
      features: [
        { title: "One idea", text: "Each note argues a single point and shows the code that proved it." },
        { title: "Sources linked", text: "Claims point at the doc, the commit, or the measurement." },
        { title: "Short on purpose", text: "If it needs a chapter, it is not ready for the journal." },
      ],
      items: [
        { id: "b1", title: "Ship the seam", text: "The interesting bugs live where the page meets the API. Test that line first.", meta: "Mar 12" },
        { id: "b2", title: "Names are the design", text: "A route called /messages is a product decision, not a folder name.", meta: "Feb 2" },
        { id: "b3", title: "Preview is a promise", text: "If the sample data lies, the empty state will lie in production too.", meta: "Jan 18" },
      ],
      fields: [
        { name: "name", label: "Name", type: "text", required: false },
        { name: "email", label: "Email", type: "email", required: true },
      ],
    };
  }

  if (brief.kind === "store") {
    return {
      ...shared,
      accent: "#fb7185",
      accentSoft: "rgba(251, 113, 133, 0.14)",
      eyebrow: "Goods",
      heroTitle: `${brief.name} — objects for a smaller shelf.`,
      sectionTitle: "In the shop",
      sectionText: "The catalog is the API. The cart lives in the browser until you place an order.",
      listLabel: "Catalog",
      collection: "products",
      listPath: "/products",
      createPath: "/orders",
      formTitle: "Place an order",
      formText: "Uses the items currently in your cart.",
      submitLabel: "Place order",
      features: [
        { title: "Small batches", text: "We restock when a run sells through, not when a warehouse says so." },
        { title: "Plain materials", text: "Linen, glass, wood, and paper. Labels tell you what it is." },
        { title: "Two ship days", text: "Orders placed by Tuesday or Friday leave the same afternoon." },
      ],
      items: [
        { id: "s1", title: "Linen carryall", text: "Undyed linen, one pocket, a strap that sits on the shoulder.", meta: "$68", price: 68 },
        { id: "s2", title: "Glass pourer", text: "A 500ml bottle for oil. Wide mouth, so you can actually clean it.", meta: "$24", price: 24 },
        { id: "s3", title: "Desk lamp", text: "Brass arm, paper shade, warm bulb included.", meta: "$120", price: 120 },
      ],
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "notes", label: "Delivery notes", type: "textarea", required: false },
      ],
    };
  }

  return {
    ...shared,
    accent: "#818cf8",
    accentSoft: "rgba(129, 140, 248, 0.16)",
    eyebrow: "Product",
    heroTitle: `${brief.name} keeps the week in one place.`,
    sectionTitle: "Plans",
    sectionText: "Pricing is data. Leads from the form are stored by the API.",
    listLabel: "Plans",
    collection: "plans",
    listPath: "/plans",
    createPath: "/leads",
    formTitle: "Request a walkthrough",
    formText: "We reply with a time. The lead is saved even when you are previewing offline.",
    submitLabel: "Request access",
    features: [
      { title: "Shared board", text: "One list for the work that is actually due this week." },
      { title: "Quiet alerts", text: "A single morning note. Nothing else pings you." },
      { title: "Export anytime", text: "CSV out, API in. Your notes are not stuck in the product." },
    ],
    items: [
      { id: "a1", title: "Starter", text: "Up to 5 people, the board, and email notes.", meta: "$0" },
      { id: "a2", title: "Team", text: "Shared views, guest links, and a 30-day history.", meta: "$12 / seat" },
      { id: "a3", title: "Studio", text: "SSO-ready login, audit log, and a named support channel.", meta: "$29 / seat" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Work email", type: "email", required: true },
      { name: "plan", label: "Plan", type: "text", required: true },
      { name: "message", label: "What should we look at?", type: "textarea", required: false },
    ],
  };
}

function buildFiles(spec: SiteSpec): WebsiteFile[] {
  const slug = slugify(spec.name);
  const publicItems = spec.items.map(({ id, title, text, meta, price }) => ({ id, title, text, meta, price }));
  const submissionsSeed: unknown[] = [];

  return [
    { path: "README.md", language: "markdown", content: readme(spec, slug) },
    { path: "package.json", language: "json", content: rootPackage(slug) },
    { path: "client/index.html", language: "html", content: clientHtml(spec) },
    { path: "client/styles.css", language: "css", content: clientCss(spec) },
    { path: "client/app.js", language: "javascript", content: clientJs(spec, publicItems) },
    { path: "server/package.json", language: "json", content: serverPackage(slug) },
    { path: "server/.env.example", language: "plaintext", content: envExample(slug) },
    { path: "server/index.js", language: "javascript", content: serverIndex() },
    { path: "server/src/app.js", language: "javascript", content: serverApp(spec) },
    { path: "server/src/config/db.js", language: "javascript", content: serverDb() },
    {
      path: "server/src/data/seed.js",
      language: "javascript",
      content: `export const seed = ${JSON.stringify({ [spec.collection]: publicItems, submissions: submissionsSeed }, null, 2)};\n`,
    },
    { path: "server/src/middlewares/errorHandler.js", language: "javascript", content: errorHandlerSource() },
    { path: "server/src/modules/site/site.validation.js", language: "javascript", content: validationSource(spec) },
    { path: "server/src/modules/site/site.service.js", language: "javascript", content: serviceSource(spec) },
    { path: "server/src/modules/site/site.routes.js", language: "javascript", content: routesSource(spec) },
  ];
}

function readme(spec: SiteSpec, slug: string): string {
  return `# ${spec.name}

${spec.tagline}

Generated by the Lunor.AI full-stack website automation for the Web Development assistant.

## What you get

- \`client/\` — the website (HTML, CSS, and JavaScript). The editor preview runs this immediately.
- \`server/\` — an Express API with a MongoDB store and an in-memory fallback.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/health | Service check |
| GET | /api${spec.listPath} | ${spec.listLabel} |
| POST | /api${spec.createPath} | Save a submission |

## Run the API

\`\`\`bash
cd server
npm install
cp .env.example .env
npm start
\`\`\`

The API listens on port 5000. Leave \`MONGODB_URI\` empty to use the in-memory store, or point it at a local database:

\`\`\`
MONGODB_URI=mongodb://127.0.0.1:27017/${slug}
\`\`\`

The website calls \`http://localhost:5000\`. If that request fails, the preview keeps showing the sample ${spec.listLabel.toLowerCase()} and saves form submissions in the browser.
`;
}

function rootPackage(slug: string): string {
  return `${JSON.stringify({
    name: slug,
    private: true,
    description: "Full-stack website generated by Lunor.AI",
    scripts: {
      start: "npm start --prefix server",
      server: "npm start --prefix server",
    },
  }, null, 2)}\n`;
}

function serverPackage(slug: string): string {
  return `${JSON.stringify({
    name: `${slug}-api`,
    private: true,
    type: "module",
    main: "index.js",
    scripts: {
      start: "node index.js",
      dev: "node --watch index.js",
    },
    dependencies: {
      cors: "^2.8.5",
      express: "^4.21.2",
      mongodb: "^6.12.0",
    },
  }, null, 2)}\n`;
}

function envExample(slug: string): string {
  return `PORT=5000
# Leave blank to use the in-memory store.
MONGODB_URI=mongodb://127.0.0.1:27017/${slug}
`;
}

function clientHtml(spec: SiteSpec): string {
  const nav = [
    ["#work", spec.listLabel],
    ["#features", "Approach"],
    ["#contact", "Contact"],
  ];
  const fields = spec.fields.map((field) => {
    const required = field.required ? " required" : "";
    if (field.type === "textarea") {
      return `          <label>${escapeHtml(field.label)}<textarea name="${field.name}" rows="4"${required}></textarea></label>`;
    }
    const extra = field.type === "number" ? ' min="1" max="20"' : "";
    return `          <label>${escapeHtml(field.label)}<input name="${field.name}" type="${field.type}"${extra}${required} /></label>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(spec.name)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="site">
  <header class="site-header">
    <a class="brand" href="#top">${escapeHtml(spec.name)}</a>
    <nav>
      ${nav.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join("\n      ")}
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <p class="eyebrow">${escapeHtml(spec.eyebrow)}</p>
      <h1>${escapeHtml(spec.heroTitle)}</h1>
      <p class="lede">${escapeHtml(spec.tagline)}</p>
      <div class="hero-actions">
        <a class="button" href="#contact">${escapeHtml(spec.submitLabel)}</a>
        <a class="text-link" href="#work">View ${escapeHtml(spec.listLabel.toLowerCase())}</a>
      </div>
    </section>
    <section id="features" class="band">
      <div class="feature-grid">
        ${spec.features.map((feature) => `<article><h2>${escapeHtml(feature.title)}</h2><p>${escapeHtml(feature.text)}</p></article>`).join("\n        ")}
      </div>
    </section>
    <section id="work" class="section">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(spec.listLabel)}</p>
          <h2>${escapeHtml(spec.sectionTitle)}</h2>
          <p>${escapeHtml(spec.sectionText)}</p>
        </div>
        <p id="api-status" class="status">Loading sample data…</p>
      </div>
      <div id="items" class="cards"></div>
      ${spec.kind === "store" ? `<div class="cart-bar"><span id="cart-count">Cart · 0</span><span id="cart-total">$0</span></div>` : ""}
    </section>
    <section id="contact" class="section contact">
      <div>
        <p class="eyebrow">API</p>
        <h2>${escapeHtml(spec.formTitle)}</h2>
        <p>${escapeHtml(spec.formText)}</p>
      </div>
      <form id="site-form">
${fields}
        <button class="button" type="submit">${escapeHtml(spec.submitLabel)}</button>
        <p id="form-status" class="status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <span>${escapeHtml(spec.name)}</span>
    <span>Client + Express API + MongoDB</span>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function clientCss(spec: SiteSpec): string {
  return `:root {
  --bg: #0c0f14;
  --bg-raise: #151a22;
  --ink: #f4f1ea;
  --muted: #b7b1a6;
  --line: rgba(244, 241, 234, 0.12);
  --accent: ${spec.accent};
  --accent-soft: ${spec.accentSoft};
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  color-scheme: dark;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif;
  background:
    radial-gradient(900px 420px at 10% -10%, var(--accent-soft), transparent 60%),
    var(--bg);
  color: var(--ink);
  line-height: 1.5;
}
a { color: inherit; }
.site-header, .section, .band, footer { width: min(1080px, calc(100% - 32px)); margin-inline: auto; }
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 8px;
}
.brand { font-weight: 700; text-decoration: none; letter-spacing: -0.03em; }
nav { display: flex; gap: 18px; font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 0.92rem; }
nav a { color: var(--muted); text-decoration: none; }
nav a:hover { color: var(--ink); }
.hero { width: min(1080px, calc(100% - 32px)); margin: 48px auto 28px; }
.eyebrow {
  margin: 0 0 10px;
  font-family: "Avenir Next", "Segoe UI", sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
}
h1 { margin: 0; max-width: 16ch; font-size: clamp(2.6rem, 6vw, 5rem); line-height: 0.96; letter-spacing: -0.045em; }
.lede { max-width: 42rem; color: var(--muted); font-size: 1.15rem; }
.hero-actions { display: flex; gap: 18px; align-items: center; margin-top: 22px; }
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--accent);
  color: #111;
  font-family: "Avenir Next", "Segoe UI", sans-serif;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.text-link { color: var(--ink); }
.band { padding: 8px 0 12px; }
.feature-grid, .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.feature-grid article, .card, form, .cart-bar {
  background: var(--bg-raise);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
}
.feature-grid h2, .card h3 { margin: 0 0 8px; font-size: 1.25rem; letter-spacing: -0.03em; }
.feature-grid p, .card p { margin: 0; color: var(--muted); }
.section { padding: 28px 0; }
.section-head, .contact { display: grid; grid-template-columns: 1.4fr 0.8fr; gap: 24px; align-items: end; }
.section-head h2, .contact h2 { margin: 0 0 8px; font-size: clamp(1.8rem, 3vw, 2.6rem); letter-spacing: -0.04em; }
.status { margin: 0; color: var(--muted); font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 0.85rem; }
.meta { margin: 0 0 8px; color: var(--accent); font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; }
.card button.add {
  margin-top: 14px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
}
.cart-bar { display: flex; justify-content: space-between; margin-top: 14px; font-family: "Avenir Next", "Segoe UI", sans-serif; }
form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 0.85rem; color: var(--muted); }
input, textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  background: #0e1218;
  color: var(--ink);
  font: inherit;
}
footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 28px 0 40px;
  color: var(--muted);
  font-family: "Avenir Next", "Segoe UI", sans-serif;
  font-size: 0.85rem;
}
@media (max-width: 800px) {
  .feature-grid, .cards, .section-head, .contact { grid-template-columns: 1fr; }
  .site-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  nav { flex-wrap: wrap; gap: 12px; }
  h1 { max-width: none; }
}
`;
}

function clientJs(spec: SiteSpec, items: ItemSpec[]): string {
  return `const API_BASE = "http://localhost:5000";
const LIST_PATH = ${JSON.stringify(`/api${spec.listPath}`)};
const CREATE_PATH = ${JSON.stringify(`/api${spec.createPath}`)};
const KIND = ${JSON.stringify(spec.kind)};
const SEED_ITEMS = ${JSON.stringify(items, null, 2)};

const itemsRoot = document.querySelector("#items");
const apiStatus = document.querySelector("#api-status");
const form = document.querySelector("#site-form");
const formStatus = document.querySelector("#form-status");
const cart = [];
let currentItems = SEED_ITEMS;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function renderItems(list) {
  currentItems = list;
  itemsRoot.innerHTML = list.map((item) => \`
    <article class="card">
      <p class="meta">\${escapeHtml(item.meta)}</p>
      <h3>\${escapeHtml(item.title)}</h3>
      <p>\${escapeHtml(item.text)}</p>
      \${KIND === "store" ? \`<button class="add" type="button" data-id="\${escapeHtml(item.id)}">Add to cart</button>\` : ""}
    </article>
  \`).join("");
}

function renderCart() {
  const count = document.querySelector("#cart-count");
  const total = document.querySelector("#cart-total");
  if (!count || !total) return;
  const sum = cart.reduce((acc, item) => acc + (item.price || 0), 0);
  count.textContent = "Cart · " + cart.length;
  total.textContent = "$" + sum;
}

async function loadItems() {
  try {
    const response = await fetch(API_BASE + LIST_PATH);
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    renderItems(data.items || []);
    apiStatus.textContent = "Live API";
  } catch {
    renderItems(SEED_ITEMS);
    apiStatus.textContent = "Preview data — start the API with npm start in server/";
  }
}

itemsRoot.addEventListener("click", (event) => {
  const button = event.target.closest("button.add");
  if (!button) return;
  const item = currentItems.find((entry) => entry.id === button.dataset.id);
  if (!item) return;
  cart.push(item);
  renderCart();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  if (KIND === "store") {
    payload.items = cart.map((item) => ({ id: item.id, title: item.title, price: item.price || 0 }));
    if (!payload.items.length) {
      formStatus.textContent = "Add something to the cart first.";
      return;
    }
  }
  formStatus.textContent = "Saving…";
  try {
    const response = await fetch(API_BASE + CREATE_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Request failed");
    form.reset();
    cart.length = 0;
    renderCart();
    formStatus.textContent = "Saved by the API.";
  } catch {
    const key = "lunor-website-outbox";
    const previous = JSON.parse(localStorage.getItem(key) || "[]");
    previous.push({ path: CREATE_PATH, payload, savedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(previous));
    form.reset();
    formStatus.textContent = "Server is offline. Saved in this browser until the API is running.";
  }
});

loadItems();
renderCart();
`;
}

function serverIndex(): string {
  return `import { createApp } from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function loadEnv() {
  try {
    const file = resolve(dirname(fileURLToPath(import.meta.url)), ".env");
    const text = readFileSync(file, "utf8");
    for (const line of text.split("\\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional
  }
}

loadEnv();
const store = await connectDB();
const app = createApp(store);
const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(\`API listening on http://localhost:\${port}\`);
});
`;
}

function serverApp(spec: SiteSpec): string {
  return `import express from "express";
import cors from "cors";
import { siteRouter } from "./modules/site/site.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export function createApp(store) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, name: ${JSON.stringify(spec.name)} });
  });
  app.use("/api", siteRouter(store));
  app.use(errorHandler);
  return app;
}
`;
}

function serverDb(): string {
  return `import { MongoClient } from "mongodb";
import { seed } from "../data/seed.js";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MONGODB_URI is empty — using the in-memory store");
    return createMemoryStore(seed);
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");
    return createMongoStore(client.db(), seed);
  } catch (error) {
    console.error("MongoDB connection failed, using memory:", error.message);
    return createMemoryStore(seed);
  }
}

export function createMemoryStore(seedData) {
  const tables = new Map(
    Object.entries(seedData).map(([name, rows]) => [name, rows.map((row) => ({ ...row }))])
  );
  return {
    async list(name) {
      return [...(tables.get(name) || [])];
    },
    async insert(name, doc) {
      const rows = tables.get(name) || [];
      const record = { id: String(Date.now()), createdAt: new Date().toISOString(), ...doc };
      rows.unshift(record);
      tables.set(name, rows);
      return record;
    },
  };
}

export function createMongoStore(db, seedData) {
  return {
    async list(name) {
      await ensureSeed(db, name, seedData[name]);
      const rows = await db.collection(name).find({}).sort({ createdAt: -1 }).limit(50).toArray();
      return rows.map((row) => ({ ...row, id: row.id || String(row._id) }));
    },
    async insert(name, doc) {
      const record = { ...doc, createdAt: new Date().toISOString() };
      const result = await db.collection(name).insertOne(record);
      return { ...record, id: String(result.insertedId) };
    },
  };
}

async function ensureSeed(db, name, rows) {
  if (!rows?.length) return;
  const count = await db.collection(name).countDocuments();
  if (count === 0) await db.collection(name).insertMany(rows);
}
`;
}

function errorHandlerSource(): string {
  return `export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
}
`;
}

function validationSource(spec: SiteSpec): string {
  return `const FIELDS = ${JSON.stringify(spec.fields, null, 2)};

export function validateSubmission(body) {
  const errors = [];
  const value = body && typeof body === "object" ? body : {};
  for (const field of FIELDS) {
    const raw = value[field.name];
    const missing = raw == null || String(raw).trim() === "";
    if (field.required && missing) errors.push(\`\${field.label} is required\`);
    if (!missing && field.type === "email" && !String(raw).includes("@")) {
      errors.push(\`\${field.label} must be an email\`);
    }
  }
  if (${spec.kind === "store" ? "true" : "false"}) {
    if (!Array.isArray(value.items) || value.items.length === 0) errors.push("Add at least one item");
  }
  if (errors.length) {
    const error = new Error(errors.join(", "));
    error.status = 400;
    throw error;
  }
  const clean = {};
  for (const field of FIELDS) {
    if (value[field.name] != null) clean[field.name] = String(value[field.name]).trim();
  }
  if (Array.isArray(value.items)) {
    clean.items = value.items.slice(0, 20).map((item) => ({
      id: String(item.id || ""),
      title: String(item.title || ""),
      price: Number(item.price) || 0,
    }));
  }
  return clean;
}
`;
}

function serviceSource(spec: SiteSpec): string {
  return `import { validateSubmission } from "./site.validation.js";

const COLLECTION = ${JSON.stringify(spec.collection)};

export async function listItems(store) {
  const items = await store.list(COLLECTION);
  return { items };
}

export async function createSubmission(store, body) {
  const clean = validateSubmission(body);
  const item = await store.insert("submissions", { kind: ${JSON.stringify(spec.kind)}, ...clean });
  return { item };
}
`;
}

function routesSource(spec: SiteSpec): string {
  return `import { Router } from "express";
import { createSubmission, listItems } from "./site.service.js";

export function siteRouter(store) {
  const router = Router();
  router.get(${JSON.stringify(spec.listPath)}, async (_req, res, next) => {
    try {
      res.json(await listItems(store));
    } catch (error) {
      next(error);
    }
  });
  router.post(${JSON.stringify(spec.createPath)}, async (req, res, next) => {
    try {
      res.status(201).json(await createSubmission(store, req.body));
    } catch (error) {
      next(error);
    }
  });
  return router;
}
`;
}

function buildSummary(spec: SiteSpec, fileCount: number): string {
  return `**${spec.name}** is in the editor. I generated a ${kindMeta(spec.kind).label.toLowerCase()} site: a browser client plus an Express and MongoDB API (${fileCount} files).

The preview is showing sample ${spec.listLabel.toLowerCase()}. Submissions go to \`POST /api${spec.createPath}\`. The list is served from \`GET /api${spec.listPath}\`.

To run the API:

\`\`\`bash
cd server
npm install
cp .env.example .env
npm start
\`\`\`

Leave \`MONGODB_URI\` blank for the in-memory store, or point it at MongoDB. If the API is stopped, the page keeps the sample data and saves the form in this browser.`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch));
}

export function buildFileTree(files: WebsiteFile[]): WebsiteTreeNode[] {
  const root: WebsiteTreeNode[] = [];
  const folders = new Map<string, WebsiteTreeNode>();

  const ensureFolder = (folderPath: string): WebsiteTreeNode[] => {
    if (!folderPath) return root;
    const parts = folderPath.split("/");
    let children = root;
    let acc = "";
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      let folder = folders.get(acc);
      if (!folder) {
        folder = { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        folders.set(acc, folder);
        children.push(folder);
      }
      children = folder.children || [];
    }
    return children;
  };

  for (const file of files) {
    const parts = file.path.split("/");
    const name = parts.pop() || file.path;
    const parent = ensureFolder(parts.join("/"));
    parent.push({
      id: file.path,
      name,
      type: "file",
      language: file.language,
      content: file.content,
    });
  }
  return root;
}
