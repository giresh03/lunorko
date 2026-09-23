/**
 * Full-stack website generator for the Web Development AI assistant.
 * Produces a previewable vanilla client plus a zero-dependency Node API.
 */

export type WebsiteKind = "portfolio" | "landing" | "blog" | "store" | "restaurant" | "saas";

export interface WebsiteRequest {
  kind: WebsiteKind;
  name?: string;
  brief?: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface WebsiteProject {
  kind: WebsiteKind;
  name: string;
  slug: string;
  tagline: string;
  files: GeneratedFile[];
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

export interface WebsitePreset {
  kind: WebsiteKind;
  label: string;
  brief: string;
}

export const WEBSITE_PRESETS: WebsitePreset[] = [
  { kind: "portfolio", label: "Portfolio", brief: "Build a portfolio website" },
  { kind: "landing", label: "Landing", brief: "Build a landing page website" },
  { kind: "blog", label: "Blog", brief: "Build a blog website" },
  { kind: "store", label: "Shop", brief: "Build a store website" },
  { kind: "restaurant", label: "Cafe", brief: "Build a restaurant website" },
  { kind: "saas", label: "SaaS", brief: "Build a SaaS website" },
];

interface SiteItem {
  title: string;
  text: string;
  meta: string;
  image: string;
}

interface SiteFeature {
  title: string;
  text: string;
}

interface SiteModel {
  kind: WebsiteKind;
  name: string;
  slug: string;
  tagline: string;
  accent: string;
  heroImage: string;
  cta: string;
  features: SiteFeature[];
  items: SiteItem[];
}

const CATALOG: Record<WebsiteKind, Omit<SiteModel, "name" | "slug" | "tagline"> & { defaultName: string; tagline: string }> = {
  portfolio: {
    kind: "portfolio",
    defaultName: "Nova Studio",
    tagline: "Design and engineering for brands that want a sharper web presence.",
    accent: "#7c5cff",
    heroImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&h=900&fit=crop&q=80",
    cta: "View selected work",
    features: [
      { title: "Product design", text: "Interfaces with a clear hierarchy, readable type, and motion that stays quiet." },
      { title: "Frontend build", text: "Responsive pages in HTML, CSS, and JavaScript that preview in the editor." },
      { title: "API-backed content", text: "The same site data is served by a Node API when you run it locally." },
    ],
    items: [
      { title: "Atlas rebrand", text: "A marketing site with a content API and a contact inbox.", meta: "Brand", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80" },
      { title: "Field notes", text: "Editorial layout for a photography series.", meta: "Editorial", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop&q=80" },
      { title: "Northwind", text: "Dashboard marketing page for an analytics product.", meta: "SaaS", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80" },
    ],
  },
  landing: {
    kind: "landing",
    defaultName: "Lumen",
    tagline: "Ship a polished marketing site with a working contact API in one pass.",
    accent: "#00d4aa",
    heroImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop&q=80",
    cta: "Start the project",
    features: [
      { title: "Clear story", text: "Hero, proof points, and a single call to action." },
      { title: "Live preview", text: "The client renders in the assistant preview without a build step." },
      { title: "Local server", text: "npm start serves the site and the JSON API on port 3000." },
    ],
    items: [
      { title: "Launch week", text: "Announce a product with a focused landing page.", meta: "Campaign", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&q=80" },
      { title: "Waitlist", text: "Collect messages through POST /api/contact.", meta: "Growth", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop&q=80" },
      { title: "Proof", text: "Feature cards fed by GET /api/site.", meta: "Content", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80" },
    ],
  },
  blog: {
    kind: "blog",
    defaultName: "Margin Journal",
    tagline: "Essays on building for the web, served from a small content API.",
    accent: "#f0a05a",
    heroImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&h=900&fit=crop&q=80",
    cta: "Read the latest",
    features: [
      { title: "Posts as data", text: "Articles live in server/data/site.js and render on the client." },
      { title: "Readable type", text: "A quiet layout with a strong headline and short excerpts." },
      { title: "Reader notes", text: "The contact form posts feedback to the API." },
    ],
    items: [
      { title: "Why static pages still win", text: "A case for HTML that previews instantly.", meta: "Craft", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop&q=80" },
      { title: "APIs for small sites", text: "Three routes are enough for a personal journal.", meta: "Backend", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop&q=80" },
      { title: "Editing in public", text: "Ship the page, then change the content file.", meta: "Process", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&q=80" },
    ],
  },
  store: {
    kind: "store",
    defaultName: "Kindling Goods",
    tagline: "A small shopfront with a product API and a note to the maker.",
    accent: "#3d8bfd",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop&q=80",
    cta: "Browse the shelf",
    features: [
      { title: "Catalog", text: "Products are JSON items with a price in the meta field." },
      { title: "No checkout trap", text: "This starter shows the shelf and a contact order note." },
      { title: "Same origin API", text: "The Node server serves both the page and /api/items." },
    ],
    items: [
      { title: "Ceramic pour-over", text: "Stoneware dripper, speckled glaze.", meta: "$42", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=600&fit=crop&q=80" },
      { title: "Linen tote", text: "Undyed canvas, one outside pocket.", meta: "$28", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=600&fit=crop&q=80" },
      { title: "Desk lamp", text: "Warm LED, brass stem, cloth cord.", meta: "$86", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=600&fit=crop&q=80" },
    ],
  },
  restaurant: {
    kind: "restaurant",
    defaultName: "Harbor & Rye",
    tagline: "Seasonal plates, a short menu, and a table request that hits the API.",
    accent: "#e85d4c",
    heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop&q=80",
    cta: "See the menu",
    features: [
      { title: "Tonight's menu", text: "Dishes are items returned by the site API." },
      { title: "Reservations", text: "The contact form is the reservation note." },
      { title: "Evening palette", text: "Warm accent, dark ground, full-bleed food photography." },
    ],
    items: [
      { title: "Citrus crudo", text: "Market fish, fennel, chili oil.", meta: "Starter", image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop&q=80" },
      { title: "Rye pappardelle", text: "Slow pork, sage, brown butter.", meta: "Main", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=600&fit=crop&q=80" },
      { title: "Olive oil cake", text: "Citrus zest, crème fraîche.", meta: "Sweet", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop&q=80" },
    ],
  },
  saas: {
    kind: "saas",
    defaultName: "Northwind",
    tagline: "Analytics for teams who want the number, the reason, and the next step.",
    accent: "#22d3ee",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop&q=80",
    cta: "Open the product",
    features: [
      { title: "Live metrics", text: "Feature cards explain the product without a framework." },
      { title: "Demo request", text: "POST /api/contact stores a lead in memory while the server runs." },
      { title: "Deploy-ready", text: "One Node process serves the client and the JSON routes." },
    ],
    items: [
      { title: "Pipeline view", text: "See which accounts moved this week.", meta: "Product", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80" },
      { title: "Shared boards", text: "Comment on a chart without leaving the page.", meta: "Collab", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80" },
      { title: "Alerts", text: "A quiet note when a metric leaves its band.", meta: "Signals", image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&q=80" },
    ],
  },
};

const WEBSITE_INTENT = /(?:generate|build|create|make|scaffold|design)\b/i;
const WEBSITE_TARGET = /(?:website|web\s*site|landing\s*page|web\s*app|full[-\s]?stack)/i;

export function inferWebsiteRequest(input: string): WebsiteRequest | null {
  const text = input.trim();
  if (!text || text.length > 500) return null;
  if (!WEBSITE_INTENT.test(text) || !WEBSITE_TARGET.test(text)) return null;
  return {
    kind: detectKind(text),
    name: detectName(text),
    brief: text,
  };
}

export function generateFullStackWebsite(request: WebsiteRequest): WebsiteProject {
  const catalog = CATALOG[request.kind] ?? CATALOG.landing;
  const detected = request.name?.trim() || (request.brief ? detectName(request.brief) : undefined);
  const name = sanitizeName(detected || catalog.defaultName);
  const slug = slugify(name);
  const tagline = taglineFromBrief(request.brief, catalog.tagline);
  const site: SiteModel = {
    kind: request.kind,
    name,
    slug,
    tagline,
    accent: catalog.accent,
    heroImage: catalog.heroImage,
    cta: catalog.cta,
    features: catalog.features,
    items: catalog.items,
  };
  const siteJson = JSON.stringify(site, null, 2);

  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(site) },
    { path: "client/styles.css", language: "css", content: renderCss(site.accent) },
    { path: "client/app.js", language: "javascript", content: renderClient(siteJson) },
    { path: "server/data/site.js", language: "javascript", content: renderSiteModule(siteJson) },
    { path: "server/server.js", language: "javascript", content: renderServer() },
    { path: "package.json", language: "json", content: renderPackageJson(site) },
    { path: "README.md", language: "markdown", content: renderReadme(site) },
  ];

  return { kind: site.kind, name, slug, tagline, files };
}

export function formatWebsiteSummary(project: WebsiteProject): string {
  const files = project.files.map((file) => `- \`${file.path}\``).join("\n");
  return [
    `**${project.name}** is in the editor — a ${project.kind} site with a client and a Node API.`,
    "",
    files,
    "",
    "The preview renders `client/index.html`. `app.js` reads embedded site data, and switches to `GET /api/site` when the server is running.",
    "",
    "Run it locally:",
    "```bash",
    "npm start",
    "```",
    "Then open http://localhost:3000. `GET /api/health`, `GET /api/site`, and `POST /api/contact` are live on that process.",
  ].join("\n");
}

export function filesToTree(files: GeneratedFile[]): ProjectNode[] {
  return files.reduce<ProjectNode[]>(
    (tree, file) => upsertProjectFile(tree, file.path, file.language, file.content),
    [],
  );
}

export function upsertProjectFile(
  nodes: ProjectNode[],
  path: string,
  language: string,
  content: string,
): ProjectNode[] {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return nodes;
  return upsert(nodes, parts, parts, language, content);
}

function upsert(
  nodes: ProjectNode[],
  parts: string[],
  fullParts: string[],
  language: string,
  content: string,
): ProjectNode[] {
  const [head, ...rest] = parts;
  const id = fullParts.slice(0, fullParts.length - rest.length).join("/");
  if (rest.length === 0) {
    const file: ProjectNode = { id, name: head, type: "file", language, content };
    const index = nodes.findIndex((node) => node.id === id);
    if (index === -1) return [...nodes, file];
    return nodes.map((node, i) => (i === index ? { ...node, ...file, type: "file" } : node));
  }
  const index = nodes.findIndex((node) => node.type === "folder" && node.id === id);
  const children = index === -1 ? [] : nodes[index].children ?? [];
  const folder: ProjectNode = {
    id,
    name: head,
    type: "folder",
    isOpen: true,
    children: upsert(children, rest, fullParts, language, content),
  };
  if (index === -1) return [...nodes, folder];
  return nodes.map((node, i) => (i === index ? folder : node));
}

function detectKind(text: string): WebsiteKind {
  const value = text.toLowerCase();
  if (/restaurant|cafe|café|menu|diner|bistro/.test(value)) return "restaurant";
  if (/store|shop|e-?commerce|product catalog|boutique/.test(value)) return "store";
  if (/\bblog\b|journal|article|newsletter/.test(value)) return "blog";
  if (/portfolio|photographer|resume|personal site|studio/.test(value)) return "portfolio";
  if (/saas|startup|dashboard|analytics|product hunt/.test(value)) return "saas";
  return "landing";
}

function detectName(text: string): string | undefined {
  const quoted = text.match(/\b(?:called|named|for)\s+["']([^"']{2,48})["']/i);
  const plain = text.match(/\b(?:called|named|for)\s+(?:a\s+|an\s+|the\s+)?([A-Z][A-Za-z0-9&'.-]*(?:\s+(?:&|[A-Z][A-Za-z0-9&'.-]*)){0,5})/);
  const raw = (quoted?.[1] || plain?.[1] || "").trim();
  if (!raw) return undefined;
  return raw.replace(/\s+(website|site|web app|landing page)$/i, "").trim();
}

function sanitizeName(name: string): string {
  const cleaned = name.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 48) || "Lunor Site";
}

function slugify(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "lunor-site";
}

function taglineFromBrief(brief: string | undefined, fallback: string): string {
  if (!brief) return fallback;
  const extra = brief
    .replace(/^(?:please\s+)?(?:generate|build|create|make|scaffold|design)\b[\s\S]{0,80}?(?:website|web\s*site|landing\s*page|web\s*app|full[-\s]?stack)\b[:,\s-]*/i, "")
    .replace(/^(?:called|named|for)\s+\S+(?:\s+\S+){0,4}\s*/i, "")
    .trim();
  if (extra.length < 24) return fallback;
  return extra.slice(0, 160);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(site: SiteModel): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(site.name)}</title>
  <meta name="description" content="${escapeHtml(site.tagline)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div id="app" aria-live="polite">Loading ${escapeHtml(site.name)}…</div>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderCss(accent: string): string {
  return `/* Generated by the Lunor.AI full-stack website generator */
:root {
  --accent: ${accent};
  --bg: #0c1020;
  --ink: #f4f1ea;
  --muted: #b7b3c7;
  --card: rgba(255, 255, 255, 0.05);
  --line: rgba(255, 255, 255, 0.12);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  font-family: Outfit, system-ui, sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    var(--bg);
  color: var(--ink);
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.wrap { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
.nav, .hero, .section, .footer { position: relative; z-index: 1; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 8px;
}
.brand { font-family: Fraunces, Georgia, serif; font-size: 1.25rem; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 18px; color: var(--muted); font-size: 0.92rem; }
.nav-links a { text-decoration: none; }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 36px;
  align-items: center;
  padding: 42px 0 20px;
}
.kicker {
  color: var(--accent);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 600;
}
h1 {
  font-family: Fraunces, Georgia, serif;
  font-size: clamp(2.6rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  margin: 10px 0 14px;
}
.tagline { color: var(--muted); font-size: 1.08rem; max-width: 38rem; }
.cta, button {
  border: 0;
  cursor: pointer;
  background: var(--accent);
  color: #081018;
  font: inherit;
  font-weight: 600;
  border-radius: 999px;
  padding: 12px 18px;
}
.cta { display: inline-block; text-decoration: none; margin-top: 22px; }
.hero-photo {
  min-height: 320px;
  border-radius: 28px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}
.section { padding: 28px 0 10px; }
.section h2 {
  font-family: Fraunces, Georgia, serif;
  font-size: 2rem;
  margin: 0 0 16px;
}
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
}
.card img { height: 160px; width: 100%; object-fit: cover; }
.card div, .feature { padding: 16px; }
.feature { background: var(--card); border: 1px solid var(--line); border-radius: 18px; }
.meta { color: var(--accent); font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; }
.card h3, .feature h3 { margin: 8px 0; }
.card p, .feature p { margin: 0; color: var(--muted); }
form {
  display: grid;
  gap: 10px;
  max-width: 460px;
}
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.25);
  color: var(--ink);
  font: inherit;
  padding: 12px 14px;
}
.footer { padding: 28px 0 40px; color: var(--muted); font-size: 0.85rem; }
@media (max-width: 800px) {
  .hero, .grid { grid-template-columns: 1fr; }
  .nav-links { display: none; }
}
`;
}

function renderClient(siteJson: string): string {
  return `// Generated by the Lunor.AI full-stack website generator.
// Preview uses SITE. The page switches to GET /api/site when the Node server is running.
const SITE = ${siteJson};

const app = document.getElementById("app");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function render(site) {
  app.replaceChildren();

  const nav = el("header", "nav wrap");
  nav.append(el("div", "brand", site.name));
  const links = el("nav", "nav-links");
  [["#features", "Approach"], ["#work", "Work"], ["#contact", "Contact"]].forEach(([href, label]) => {
    const a = el("a", "", label);
    a.href = href;
    links.append(a);
  });
  nav.append(links);

  const hero = el("section", "hero wrap");
  const copy = el("div");
  copy.append(el("div", "kicker", site.kind));
  copy.append(el("h1", "", site.name));
  copy.append(el("p", "tagline", site.tagline));
  const cta = el("a", "cta", site.cta);
  cta.href = "#work";
  copy.append(cta);
  const photo = el("div", "hero-photo");
  photo.style.backgroundImage = "url(" + site.heroImage + ")";
  hero.append(copy, photo);

  const features = el("section", "section wrap");
  features.id = "features";
  features.append(el("h2", "", "What this site includes"));
  const featureGrid = el("div", "grid");
  site.features.forEach((feature) => {
    const card = el("article", "feature");
    card.append(el("h3", "", feature.title), el("p", "", feature.text));
    featureGrid.append(card);
  });
  features.append(featureGrid);

  const work = el("section", "section wrap");
  work.id = "work";
  work.append(el("h2", "", "Selected"));
  const workGrid = el("div", "grid");
  site.items.forEach((item) => {
    const card = el("article", "card");
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.title;
    const body = el("div");
    body.append(el("div", "meta", item.meta), el("h3", "", item.title), el("p", "", item.text));
    card.append(image, body);
    workGrid.append(card);
  });
  work.append(workGrid);

  const contact = el("section", "section wrap");
  contact.id = "contact";
  contact.append(el("h2", "", "Contact"));
  const form = document.createElement("form");
  const name = field("text", "name", "Your name");
  const email = field("email", "email", "Email");
  const message = document.createElement("textarea");
  message.name = "message";
  message.required = true;
  message.rows = 4;
  message.placeholder = "How can we help?";
  const button = el("button", "", "Send");
  button.type = "submit";
  const status = el("p", "tagline", "");
  form.append(name, email, message, button, status);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      message: message.value.trim(),
    };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Request failed");
      status.textContent = "Sent to the API.";
      form.reset();
    } catch {
      status.textContent = "Preview mode keeps this note on the page. Run npm start to post it to /api/contact.";
    }
  });
  contact.append(form);

  const footer = el("footer", "footer wrap", site.name + " · full-stack starter from Lunor.AI");
  app.append(nav, hero, features, work, contact, footer);
}

function field(type, name, placeholder) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.required = true;
  input.placeholder = placeholder;
  return input;
}

async function loadSite() {
  try {
    const response = await fetch("/api/site");
    if (!response.ok) throw new Error("offline");
    return await response.json();
  } catch {
    return SITE;
  }
}

loadSite().then(render);
`;
}

function renderSiteModule(siteJson: string): string {
  return `// Site content shared with the API. Edit this file, then refresh http://localhost:3000.
export const site = ${siteJson};
`;
}

function renderServer(): string {
  return `// Generated by the Lunor.AI full-stack website generator.
// Zero-dependency Node server: static client + JSON API.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "./data/site.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDir = normalize(join(__dirname, "..", "client"));
const port = Number(process.env.PORT) || 3000;
const messages = [];

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function clientFile(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\\/+/, "");
  if (!relative || relative.includes("..")) return null;
  const full = normalize(join(clientDir, relative));
  const root = clientDir.endsWith(sep) ? clientDir : clientDir + sep;
  if (full !== clientDir && !full.startsWith(root)) return null;
  return full;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 20_000) throw new Error("Body too large");
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: site.slug });
    return;
  }
  if (req.method === "GET" && (url.pathname === "/api/site" || url.pathname === "/api/items")) {
    sendJson(res, 200, url.pathname === "/api/items" ? site.items : site);
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/contact") {
    try {
      const body = await readBody(req);
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim();
      const message = String(body.message || "").trim();
      if (!name || !email || !message) {
        sendJson(res, 400, { ok: false, error: "Name, email, and message are required." });
        return;
      }
      const entry = { name, email, message, at: new Date().toISOString() };
      messages.push(entry);
      if (messages.length > 100) messages.shift();
      sendJson(res, 201, { ok: true, entry });
    } catch {
      sendJson(res, 400, { ok: false, error: "Send valid JSON." });
    }
    return;
  }
  if (req.method === "GET") {
    const filePath = clientFile(url.pathname);
    if (!filePath) {
      sendJson(res, 400, { ok: false, error: "Invalid path." });
      return;
    }
    try {
      const data = await readFile(filePath);
      const type = types[extname(filePath)] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    } catch {
      sendJson(res, 404, { ok: false, error: "Not found." });
    }
    return;
  }
  sendJson(res, 405, { ok: false, error: "Method not allowed." });
});

server.listen(port, () => {
  console.log(site.name + " running at http://localhost:" + port);
});
`;
}

function renderPackageJson(site: SiteModel): string {
  return JSON.stringify({
    name: site.slug,
    version: "1.0.0",
    private: true,
    type: "module",
    description: site.tagline,
    scripts: {
      start: "node server/server.js",
      dev: "node server/server.js",
    },
  }, null, 2) + "\n";
}

function renderReadme(site: SiteModel): string {
  return `# ${site.name}

${site.tagline}

Generated by the Lunor.AI full-stack website generator for the Web Development assistant.

## Run

\`\`\`bash
npm start
\`\`\`

Open http://localhost:3000.

## API

- \`GET /api/health\` — process check
- \`GET /api/site\` — page content
- \`GET /api/items\` — the selected cards
- \`POST /api/contact\` — \`{ "name", "email", "message" }\`

The editor preview uses \`client/app.js\` with embedded content. Edit \`server/data/site.js\` when you are serving the site with Node.

## Files

- \`client/index.html\` — page shell
- \`client/styles.css\` — layout
- \`client/app.js\` — rendering and the contact form
- \`server/server.js\` — static files and JSON routes
- \`server/data/site.js\` — content
`;
}
