/**
 * Full-stack website generator for the Web Development assistant.
 * Builds a previewable vanilla client plus an Express API from one prompt.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "shop" | "dashboard" | "restaurant";

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  name: string;
  summary: string;
  files: GeneratedFile[];
}

export interface WebsiteAutomation {
  id: WebsiteKind;
  label: string;
  prompt: string;
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

interface CatalogItem {
  title: string;
  detail: string;
  meta: string;
  image: string;
}

interface SiteSpec {
  kind: WebsiteKind;
  name: string;
  tagline: string;
  kicker: string;
  accent: string;
  accentInk: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  heroImage: string;
  catalogTitle: string;
  catalogCopy: string;
  apiPath: string;
  items: CatalogItem[];
  stats: { label: string; value: string }[];
  form: {
    title: string;
    endpoint: string;
    submit: string;
    fields: { name: string; label: string; type: string }[];
  };
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

export const WEBSITE_AUTOMATIONS: WebsiteAutomation[] = [
  { id: "landing", label: "Landing", prompt: "Generate a full-stack landing website" },
  { id: "portfolio", label: "Portfolio", prompt: "Generate a full-stack portfolio website" },
  { id: "blog", label: "Blog", prompt: "Generate a full-stack blog website" },
  { id: "shop", label: "Shop", prompt: "Generate a full-stack shop website" },
  { id: "dashboard", label: "Dashboard", prompt: "Generate a full-stack dashboard website" },
  { id: "restaurant", label: "Restaurant", prompt: "Generate a full-stack restaurant website" },
];

const KIND_DEFAULTS: Record<WebsiteKind, { name: string; tagline: string }> = {
  landing: { name: "Northstar", tagline: "Ship a product people can understand in one scroll." },
  portfolio: { name: "Studio North", tagline: "Selected work, process, and a way to start a project." },
  blog: { name: "Field Notes", tagline: "Short essays on building software that stays understandable." },
  shop: { name: "Market Lane", tagline: "Small-batch goods, tracked from shelf to doorstep." },
  dashboard: { name: "Pulseboard", tagline: "The numbers your team checks before the stand-up." },
  restaurant: { name: "Olive & Rye", tagline: "Seasonal plates, a short wine list, and a table by the window." },
};

export function detectWebsiteRequest(prompt: string): { kind: WebsiteKind; name: string } | null {
  const text = prompt.trim();
  if (!text) return null;
  if (/^(explain|what|why|how|debug|fix|review|compare|describe)\b/i.test(text)) return null;

  const build = /\b(build|create|make|generate|scaffold|design|launch|automate)\b/i.test(text);
  const site = /\b(website|web\s*site|landing\s*page|full[\s-]*stack)\b/i.test(text);
  if (!build || !site) return null;

  const kind = detectKind(text);
  return { kind, name: extractName(text, KIND_DEFAULTS[kind].name) };
}

export function generateFullStackWebsite(input: { prompt?: string; kind?: WebsiteKind; name?: string } = {}): GeneratedWebsite {
  const detected = input.prompt ? detectWebsiteRequest(input.prompt) : null;
  const kind = input.kind || detected?.kind || "landing";
  const name = (input.name || detected?.name || KIND_DEFAULTS[kind].name).trim() || KIND_DEFAULTS[kind].name;
  const spec = buildSpec(kind, name);
  const files = renderFiles(spec);
  return {
    kind,
    name: spec.name,
    summary: renderSummary(spec, files),
    files,
  };
}

export function filesToProjectTree(files: GeneratedFile[]): ProjectNode[] {
  return files.reduce<ProjectNode[]>((tree, file) => insertProjectFile(tree, file.path, file.language, file.content), []);
}

export function insertProjectFile(nodes: ProjectNode[], filePath: string, language: string, content: string): ProjectNode[] {
  const parts = filePath.split("/").filter(Boolean);
  if (parts.length === 0) return nodes;
  const fileName = parts[parts.length - 1];
  const folders = parts.slice(0, -1);

  const walk = (list: ProjectNode[], folderParts: string[], prefix: string): ProjectNode[] => {
    if (folderParts.length === 0) {
      const id = prefix ? `${prefix}/${fileName}` : fileName;
      if (list.some((node) => node.id === id)) {
        return list.map((node) => (node.id === id ? { ...node, name: fileName, type: "file", language, content } : node));
      }
      return [...list, { id, name: fileName, type: "file", language, content }];
    }

    const folderName = folderParts[0];
    const folderId = prefix ? `${prefix}/${folderName}` : folderName;
    const index = list.findIndex((node) => node.id === folderId && node.type === "folder");
    if (index === -1) {
      return [
        ...list,
        {
          id: folderId,
          name: folderName,
          type: "folder",
          isOpen: true,
          children: walk([], folderParts.slice(1), folderId),
        },
      ];
    }
    return list.map((node, i) =>
      i === index ? { ...node, isOpen: true, children: walk(node.children || [], folderParts.slice(1), folderId) } : node,
    );
  };

  return walk(nodes, folders, "");
}

function detectKind(text: string): WebsiteKind {
  const lower = text.toLowerCase();
  if (/\b(restaurant|cafe|café|menu|dining)\b/.test(lower)) return "restaurant";
  if (/\b(shop|store|e-?commerce|storefront|product)\b/.test(lower)) return "shop";
  if (/\b(dashboard|analytics|admin)\b/.test(lower)) return "dashboard";
  if (/\b(blog|magazine|article)\b/.test(lower)) return "blog";
  if (/\b(portfolio|personal site|case stud(?:y|ies))\b/.test(lower)) return "portfolio";
  return "landing";
}

function extractName(prompt: string, fallback: string): string {
  const called = prompt.match(/\b(?:called|named)\s+["“']?([^"”'\n.]{2,48})/i);
  const quoted = prompt.match(/["“']([^"”']{2,48})["”']/);
  const raw = (called?.[1] || quoted?.[1] || "").replace(/\b(website|web\s*site|app|full[\s-]*stack)\b/gi, " ");
  const cleaned = raw.replace(/\s+/g, " ").replace(/^[\s,:-]+|[\s,:-]+$/g, "");
  return cleaned || fallback;
}

function buildSpec(kind: WebsiteKind, name: string): SiteSpec {
  const base = KIND_DEFAULTS[kind];
  const shared = {
    kind,
    name,
    tagline: base.tagline,
  };

  if (kind === "portfolio") {
    return {
      ...shared,
      kicker: "Selected work",
      accent: "#67e8f9",
      accentInk: "#042f2e",
      bg: "#07111a",
      surface: "#10202c",
      text: "#e7f6f8",
      muted: "#93a8b3",
      heroImage: unsplash("1498050108023-c5249f4df085"),
      catalogTitle: "Projects",
      catalogCopy: "Three recent builds. Each one ships with a short case note and a live API record.",
      apiPath: "/api/projects",
      items: [
        { title: "Harbor Atlas", detail: "A map-first travel guide with offline city notes.", meta: "Product design", image: unsplash("1469854523086-cc02fe5d8800") },
        { title: "Ledger Light", detail: "Invoice tool for studios that still send PDFs.", meta: "Web app", image: unsplash("1554224155-6726b3ff858f") },
        { title: "Night School", detail: "Course pages with a reading list that stays short.", meta: "Education", image: unsplash("1524178232363-1fb2b075b655") },
      ],
      stats: [
        { label: "Years shipping", value: "8" },
        { label: "Launched products", value: "24" },
        { label: "Avg. reply", value: "1 day" },
      ],
      form: {
        title: "Start a project",
        endpoint: "/api/contact",
        submit: "Send brief",
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "message", label: "What should we build?", type: "text" },
        ],
      },
    };
  }

  if (kind === "blog") {
    return {
      ...shared,
      kicker: "Journal",
      accent: "#fbbf24",
      accentInk: "#1c1404",
      bg: "#14110c",
      surface: "#221c14",
      text: "#f6f0e6",
      muted: "#c4b6a2",
      heroImage: unsplash("1481627834876-b7833e8f5570"),
      catalogTitle: "Latest notes",
      catalogCopy: "Posts come from the API. The page still reads if the server is offline.",
      apiPath: "/api/posts",
      items: [
        { title: "Name the hard part", detail: "A naming pass before the first component keeps the rest of the build honest.", meta: "Craft", image: unsplash("1455390582262-044cdead277a") },
        { title: "Preview before polish", detail: "Ship a page that renders with no network, then attach the API.", meta: "Practice", image: unsplash("1432821596592-e2c18b78144f") },
        { title: "Small servers", detail: "One Express file is enough until a second person needs the data.", meta: "Backend", image: unsplash("1515879218367-8466d910aaa4") },
      ],
      stats: [
        { label: "Essays", value: "36" },
        { label: "Readers", value: "12k" },
        { label: "Issues / month", value: "4" },
      ],
      form: {
        title: "Leave a note",
        endpoint: "/api/comments",
        submit: "Post comment",
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "message", label: "Comment", type: "text" },
        ],
      },
    };
  }

  if (kind === "shop") {
    return {
      ...shared,
      kicker: "In season",
      accent: "#fb7185",
      accentInk: "#3f0514",
      bg: "#160910",
      surface: "#2a121a",
      text: "#fff1f4",
      muted: "#e4b8c2",
      heroImage: unsplash("1441986300917-64674bd600d8"),
      catalogTitle: "The shelf",
      catalogCopy: "Products are served by the API. Checkout stores an order in memory.",
      apiPath: "/api/products",
      items: [
        { title: "Linen tote", detail: "Undyed canvas, one pocket, made to be refilled.", meta: "$42", image: unsplash("1544816155-12df9643f363") },
        { title: "Ceramic cup", detail: "Speckled stoneware that stacks without rattling.", meta: "$28", image: unsplash("1514228742587-6b1558fcca3d") },
        { title: "Olive oil", detail: "Early harvest, 500ml, pressed two weeks ago.", meta: "$24", image: unsplash("1474979266404-7eaacbcd87c5") },
      ],
      stats: [
        { label: "Makers", value: "18" },
        { label: "Ships in", value: "2 days" },
        { label: "Returns", value: "30 days" },
      ],
      form: {
        title: "Place an order",
        endpoint: "/api/orders",
        submit: "Checkout",
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "message", label: "What would you like?", type: "text" },
        ],
      },
    };
  }

  if (kind === "dashboard") {
    return {
      ...shared,
      kicker: "Today",
      accent: "#34d399",
      accentInk: "#022c22",
      bg: "#071410",
      surface: "#10241c",
      text: "#e8fff6",
      muted: "#9dccb8",
      heroImage: unsplash("1551288049-bebda4e38f71"),
      catalogTitle: "Live metrics",
      catalogCopy: "Each card is a record from /api/metrics. Refresh the API and the grid follows.",
      apiPath: "/api/metrics",
      items: [
        { title: "Active sessions", detail: "People currently inside the product.", meta: "1,284", image: unsplash("1460925895917-afdab827c52f") },
        { title: "Signup rate", detail: "Visitors who created an account today.", meta: "4.8%", image: unsplash("1551288049-bebda4e38f71") },
        { title: "Open tickets", detail: "Support items waiting on a first reply.", meta: "17", image: unsplash("1454165804606-c3d57bc86b40") },
      ],
      stats: [
        { label: "Uptime", value: "99.9%" },
        { label: "p95 API", value: "180ms" },
        { label: "Deploys", value: "6" },
      ],
      form: {
        title: "Log a note",
        endpoint: "/api/notes",
        submit: "Save note",
        fields: [
          { name: "name", label: "Author", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "message", label: "Note", type: "text" },
        ],
      },
    };
  }

  if (kind === "restaurant") {
    return {
      ...shared,
      kicker: "Tonight's menu",
      accent: "#fb923c",
      accentInk: "#2a1204",
      bg: "#140d09",
      surface: "#26180f",
      text: "#fff6ee",
      muted: "#e6cbb6",
      heroImage: unsplash("1414235077428-338989a2e8c0"),
      catalogTitle: "Plates",
      catalogCopy: "The menu is an API. Reservations are stored on the server until it restarts.",
      apiPath: "/api/menu",
      items: [
        { title: "Charred leek", detail: "Brown butter, hazelnut, and a lemon rind.", meta: "$16", image: unsplash("1473093295043-cdd812d0e601") },
        { title: "Rye pasta", detail: "Mushroom ragu, thyme, and a soft egg.", meta: "$24", image: unsplash("1473093226795-af9932fe5856") },
        { title: "Olive oil cake", detail: "Citrus, pistachio, and whipped cream.", meta: "$12", image: unsplash("1464349095431-e9a21285b5f3") },
      ],
      stats: [
        { label: "Seatings", value: "5–10" },
        { label: "Kitchen", value: "Open" },
        { label: "Walk-ins", value: "Bar only" },
      ],
      form: {
        title: "Reserve a table",
        endpoint: "/api/reservations",
        submit: "Request table",
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "message", label: "Party size and time", type: "text" },
        ],
      },
    };
  }

  return {
    ...shared,
    kicker: "Product",
    accent: "#a78bfa",
    accentInk: "#1e1033",
    bg: "#0c1020",
    surface: "#17182b",
    text: "#f3f1ff",
    muted: "#b7b3d4",
    heroImage: unsplash("1553877522-43269d4ea984"),
    catalogTitle: "What you get",
    catalogCopy: "Features are loaded from the API, with this same copy baked in for the live preview.",
    apiPath: "/api/features",
    items: [
      { title: "Guided setup", detail: "A project structure you can run with two commands.", meta: "Start", image: unsplash("1519389950473-47ba0277781c") },
      { title: "Live preview", detail: "The page renders in the editor before the server is running.", meta: "Preview", image: unsplash("1461749280684-dccba630e2f6") },
      { title: "A real API", detail: "Express routes for the catalog and the form on this page.", meta: "Backend", image: unsplash("1555066931-4365d14bab8c") },
    ],
    stats: [
      { label: "Setup", value: "2 cmds" },
      { label: "Files", value: "8" },
      { label: "Stack", value: "HTML + API" },
    ],
    form: {
      title: "Request a walkthrough",
      endpoint: "/api/leads",
      submit: "Join the list",
      fields: [
        { name: "name", label: "Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "message", label: "What are you building?", type: "text" },
      ],
    },
  };
}

function renderFiles(spec: SiteSpec): GeneratedFile[] {
  const slug = slugify(spec.name);
  return [
    { path: "client/index.html", language: "html", content: renderHtml(spec) },
    { path: "client/styles.css", language: "css", content: renderCss(spec) },
    { path: "client/app.js", language: "javascript", content: renderClientJs(spec) },
    { path: "server/data.js", language: "javascript", content: renderData(spec) },
    { path: "server/index.js", language: "javascript", content: renderServer(spec) },
    { path: "package.json", language: "json", content: renderPackageJson(slug, spec.name) },
    { path: "README.md", language: "markdown", content: renderReadme(spec) },
    { path: ".env.example", language: "plaintext", content: "PORT=3000\n" },
  ];
}

function renderHtml(spec: SiteSpec): string {
  const cards = spec.items.map((item) => `
        <article class="card">
          <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.title)}" />
          <div class="card-body">
            <p class="meta">${escapeHtml(item.meta)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.detail)}</p>
          </div>
        </article>`).join("");

  const stats = spec.stats.map((stat) => `
        <div class="stat">
          <strong>${escapeHtml(stat.value)}</strong>
          <span>${escapeHtml(stat.label)}</span>
        </div>`).join("");

  const fields = spec.form.fields.map((field) => `
          <label>
            <span>${escapeHtml(field.label)}</span>
            <input name="${escapeAttr(field.name)}" type="${escapeAttr(field.type)}" required />
          </label>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(spec.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="true">
  <header class="nav">
    <a class="brand" href="#top">${escapeHtml(spec.name)}</a>
    <nav>
      <a href="#catalog">Work</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="kicker">${escapeHtml(spec.kicker)}</p>
        <h1>${escapeHtml(spec.name)}</h1>
        <p class="tagline">${escapeHtml(spec.tagline)}</p>
        <div class="hero-actions">
          <a class="button" href="#contact">${escapeHtml(spec.form.submit)}</a>
          <a class="button ghost" href="#catalog">${escapeHtml(spec.catalogTitle)}</a>
        </div>
      </div>
      <img class="hero-image" src="${escapeAttr(spec.heroImage)}" alt="" />
    </section>
    <section class="stats" aria-label="Highlights">${stats}
    </section>
    <section id="catalog" class="catalog">
      <div class="section-head">
        <h2>${escapeHtml(spec.catalogTitle)}</h2>
        <p>${escapeHtml(spec.catalogCopy)}</p>
      </div>
      <div id="catalog-grid" class="grid">${cards}
      </div>
    </section>
    <section id="contact" class="contact">
      <div>
        <h2>${escapeHtml(spec.form.title)}</h2>
        <p>This form posts to <code>${escapeHtml(spec.form.endpoint)}</code>. In the editor preview it confirms locally when the API is not running.</p>
      </div>
      <form id="site-form">
        ${fields}
        <button type="submit">${escapeHtml(spec.form.submit)}</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <span>${escapeHtml(spec.name)}</span>
    <span>Full-stack preview · HTML, CSS, JS + Express</span>
  </footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderCss(spec: SiteSpec): string {
  return `:root {
  --accent: ${spec.accent};
  --accent-ink: ${spec.accentInk};
  --bg: ${spec.bg};
  --surface: ${spec.surface};
  --text: ${spec.text};
  --muted: ${spec.muted};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Outfit, sans-serif;
  background: var(--bg);
  background-image: radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%);
  color: var(--text);
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.nav, .hero, .stats, .catalog, .contact, footer {
  width: min(1080px, calc(100% - 32px));
  margin-inline: auto;
}
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 0 8px;
}
.brand { font-family: Fraunces, serif; font-size: 1.25rem; text-decoration: none; }
.nav nav { display: flex; gap: 18px; }
.nav nav a { color: var(--muted); text-decoration: none; }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: center;
  padding: 28px 0 10px;
}
h1, h2, h3 { font-family: Fraunces, serif; font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(3rem, 7vw, 5.4rem); line-height: 0.92; margin: 8px 0 12px; }
.kicker, .meta { color: var(--accent); text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.75rem; }
.tagline, .section-head p, .contact p { color: var(--muted); line-height: 1.6; }
.hero-actions, .stats { display: flex; gap: 12px; flex-wrap: wrap; }
.button, button {
  display: inline-flex;
  align-items: center;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.button.ghost { background: transparent; color: var(--text); border: 1px solid color-mix(in srgb, var(--text) 24%, transparent); }
.hero-image, .card img { border-radius: 22px; height: 100%; object-fit: cover; min-height: 240px; }
.stats { padding: 10px 0 24px; }
.stat {
  flex: 1;
  min-width: 140px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: 18px;
  padding: 16px 18px;
}
.stat strong { display: block; font-family: Fraunces, serif; font-size: 1.7rem; }
.stat span, .card p { color: var(--muted); }
.catalog, .contact { padding: 18px 0 36px; }
.section-head { max-width: 640px; margin-bottom: 18px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card {
  background: var(--surface);
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
}
.card img { width: 100%; height: 180px; min-height: 180px; }
.card-body, .contact form { padding: 16px; }
.card h3 { margin: 6px 0; }
.contact {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 24px;
  align-items: start;
}
form {
  display: grid;
  gap: 12px;
  background: var(--surface);
  border-radius: 22px;
}
label { display: grid; gap: 6px; font-size: 0.85rem; color: var(--muted); }
input {
  border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
  background: color-mix(in srgb, var(--bg) 65%, transparent);
  color: var(--text);
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
}
#form-status { min-height: 1.2em; margin: 0; color: var(--accent); }
footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 0 32px;
  color: var(--muted);
  font-size: 0.9rem;
}
code { color: var(--accent); }
@media (max-width: 800px) {
  .hero, .contact, .grid { grid-template-columns: 1fr; }
  .nav nav { display: none; }
  footer { flex-direction: column; }
}
`;
}

function renderClientJs(spec: SiteSpec): string {
  return `const API_PATH = ${JSON.stringify(spec.apiPath)};
const FORM_ENDPOINT = ${JSON.stringify(spec.form.endpoint)};

function card(item) {
  const article = document.createElement("article");
  article.className = "card";
  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.title;
  const body = document.createElement("div");
  body.className = "card-body";
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = item.meta;
  const title = document.createElement("h3");
  title.textContent = item.title;
  const detail = document.createElement("p");
  detail.textContent = item.detail;
  body.append(meta, title, detail);
  article.append(img, body);
  return article;
}

async function refreshCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;
  try {
    const response = await fetch(API_PATH);
    if (!response.ok) return;
    const items = await response.json();
    if (!Array.isArray(items) || items.length === 0) return;
    grid.replaceChildren(...items.map(card));
  } catch {
    // The static HTML already shows the catalog for in-editor preview.
  }
}

function bindForm() {
  const form = document.getElementById("site-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    let savedOnServer = false;
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      savedOnServer = response.ok;
    } catch {
      savedOnServer = false;
    }
    form.reset();
    status.textContent = savedOnServer
      ? "Saved on the API."
      : "Saved in this preview. Start the server to persist it.";
  });
}

refreshCatalog();
bindForm();
`;
}

function renderData(spec: SiteSpec): string {
  return `export const site = ${JSON.stringify({ name: spec.name, tagline: spec.tagline, kind: spec.kind }, null, 2)};

export const items = ${JSON.stringify(spec.items, null, 2)};

export const submissions = [];
`;
}

function renderServer(spec: SiteSpec): string {
  return `import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { site, items, submissions } from "./data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: site.name, kind: site.kind });
});

app.get("/api/site", (_req, res) => {
  res.json(site);
});

app.get(${JSON.stringify(spec.apiPath)}, (_req, res) => {
  res.json(items);
});

app.get("/api/submissions", (_req, res) => {
  res.json(submissions);
});

app.post(${JSON.stringify(spec.form.endpoint)}, (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required." });
    return;
  }
  const entry = { id: submissions.length + 1, name, email, message, createdAt: new Date().toISOString() };
  submissions.push(entry);
  res.status(201).json(entry);
});

app.listen(port, () => {
  console.log(\`\${site.name} is running at http://localhost:\${port}\`);
});
`;
}

function renderPackageJson(slug: string, name: string): string {
  return JSON.stringify(
    {
      name: slug,
      version: "1.0.0",
      private: true,
      type: "module",
      description: `${name} — full-stack website generated in Lunor.AI`,
      scripts: {
        start: "node server/index.js",
        dev: "node --watch server/index.js",
      },
      dependencies: {
        cors: "^2.8.5",
        express: "^4.21.2",
      },
    },
    null,
    2,
  ) + "\n";
}

function renderReadme(spec: SiteSpec): string {
  return `# ${spec.name}

Full-stack ${spec.kind} website generated by the Lunor.AI Web Development assistant.

The browser page in \`client/\` renders on its own. \`server/index.js\` serves that page and a small JSON API.

## Run

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

## API

- \`GET /api/health\`
- \`GET /api/site\`
- \`GET ${spec.apiPath}\`
- \`POST ${spec.form.endpoint}\` with \`{ "name", "email", "message" }\`
- \`GET /api/submissions\`
`;
}

function renderSummary(spec: SiteSpec, files: GeneratedFile[]): string {
  const listing = files.map((file) => `- \`${file.path}\``).join("\n");
  return `Generated **${spec.name}**, a full-stack ${spec.kind} website. The preview is the static client. The Express API serves the same page when you run it locally.

${listing}

**Run it**

\`\`\`bash
npm install
npm start
\`\`\`

Then open http://localhost:3000. Catalog data is \`GET ${spec.apiPath}\`. The form posts to \`${spec.form.endpoint}\`.

Ask me to change the copy, colors, or add another API route.`;
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-website";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[char] || char);
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
