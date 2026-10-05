/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a previewable client (HTML, CSS, JS) and a dependency-free Node API.
 */

export type WebsiteKind = "portfolio" | "restaurant" | "saas" | "shop" | "blog";

export interface CatalogItem {
  id: string;
  title: string;
  summary: string;
  meta: string;
  image: string;
}

export interface WebsitePreset {
  kind: WebsiteKind;
  label: string;
  description: string;
  name: string;
  tagline: string;
  accent: string;
  accentInk: string;
  bg: string;
  ink: string;
  muted: string;
  card: string;
  heroImage: string;
  resource: string;
  resourceLabel: string;
  nav: { href: string; label: string }[];
  cta: string;
  aboutTitle: string;
  aboutBody: string;
  highlights: { title: string; text: string }[];
  items: CatalogItem[];
}

export interface WebsiteGeneratorInput {
  kind: WebsiteKind;
  name?: string;
  tagline?: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  name: string;
  slug: string;
  kind: WebsiteKind;
  resource: string;
  files: GeneratedFile[];
  previewPath: string;
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

export interface WebsiteRequest {
  mode: "generate" | "choose";
  kind: WebsiteKind;
  name?: string;
  tagline?: string;
}

const img = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const WEBSITE_PRESETS: Record<WebsiteKind, WebsitePreset> = {
  portfolio: {
    kind: "portfolio",
    label: "Portfolio",
    description: "Studio site with project work",
    name: "Lumen Studio",
    tagline: "Design and engineering for ambitious brands.",
    accent: "#8b7cff",
    accentInk: "#1a1333",
    bg: "#0c1020",
    ink: "#f6f3ee",
    muted: "#b7b3c9",
    card: "#171c31",
    heroImage: img("1558655146-d09347e92766", 1800, 1100),
    resource: "projects",
    resourceLabel: "Selected work",
    nav: [
      { href: "#work", label: "Work" },
      { href: "#about", label: "About" },
      { href: "#contact", label: "Contact" },
    ],
    cta: "View work",
    aboutTitle: "A small studio for digital products",
    aboutBody: "We pair interface design with the front-end and API code that ships it. Every project on this site is served by the same Node API you can run locally.",
    highlights: [
      { title: "Brand systems", text: "Type, color, and components that stay consistent from the first screen to the last." },
      { title: "Product UI", text: "Marketing pages and app shells built to be readable on a phone and a wide monitor." },
      { title: "Launch support", text: "A contact endpoint collects new project inquiries next to the work catalog." },
    ],
    items: [
      { id: "p1", title: "Northwind Analytics", summary: "A research dashboard with a quiet dark interface and large numerals.", meta: "Product design", image: img("1551288049-bebda4e38f71", 900, 700) },
      { id: "p2", title: "Harbor Goods", summary: "An online shop for a ceramic studio, with large photography and a short checkout story.", meta: "E-commerce", image: img("1441986300917-64674bd600d8", 900, 700) },
      { id: "p3", title: "Field Notes", summary: "A reading layout for long essays, tuned for type size and line length.", meta: "Editorial", image: img("1456513080510-7bf3a84b82f8", 900, 700) },
      { id: "p4", title: "Atlas Transit", summary: "A wayfinding site for a city rail line, built around schedules and maps.", meta: "Public service", image: img("1469854523086-cc02fe5d8800", 900, 700) },
    ],
  },
  restaurant: {
    kind: "restaurant",
    label: "Restaurant",
    description: "Menu, story, and reservations",
    name: "Olive & Oak",
    tagline: "Seasonal plates, an open kitchen, and a short wine list.",
    accent: "#e7a15a",
    accentInk: "#2a1608",
    bg: "#1b130e",
    ink: "#f8f1e8",
    muted: "#d3c3b2",
    card: "#2a1d16",
    heroImage: img("1414235077428-338989a2e8c0", 1800, 1100),
    resource: "menu",
    resourceLabel: "Tonight's menu",
    nav: [
      { href: "#work", label: "Menu" },
      { href: "#about", label: "Story" },
      { href: "#contact", label: "Reserve" },
    ],
    cta: "See the menu",
    aboutTitle: "Supper, cooked in view of the dining room",
    aboutBody: "Olive & Oak serves a short menu that changes with the market. The dishes below come from GET /api/menu, and reservation notes are stored by POST /api/contact.",
    highlights: [
      { title: "Market menu", text: "Four plates, written the morning they are cooked." },
      { title: "Open kitchen", text: "A counter for guests who want to watch the pass." },
      { title: "Weeknight hours", text: "Tuesday to Sunday, from five until the last seating at nine." },
    ],
    items: [
      { id: "m1", title: "Citrus fennel salad", summary: "Shaved fennel, orange, olive oil, and toasted almond.", meta: "12", image: img("1540189549336-e6e99c3679fe", 900, 700) },
      { id: "m2", title: "Wood-roasted chicken", summary: "Half chicken, charred lemon, and pan juices over farro.", meta: "28", image: img("1598103442097-8b74394b95c6", 900, 700) },
      { id: "m3", title: "Handmade pappardelle", summary: "Brown butter, sage, and a soft egg yolk.", meta: "24", image: img("1621996346565-e3dbc646d9a9", 900, 700) },
      { id: "m4", title: "Olive oil cake", summary: "Citrus glaze and whipped cream.", meta: "11", image: img("1464349095431-e9a21285b5f3", 900, 700) },
    ],
  },
  saas: {
    kind: "saas",
    label: "SaaS",
    description: "Product landing page and plans",
    name: "Northstar",
    tagline: "Ship product updates your customers actually see.",
    accent: "#3ee0b7",
    accentInk: "#04241c",
    bg: "#07131b",
    ink: "#e7f3f6",
    muted: "#9eb4c0",
    card: "#10202b",
    heroImage: img("1460925895917-afdab827c52f", 1800, 1100),
    resource: "plans",
    resourceLabel: "Plans",
    nav: [
      { href: "#work", label: "Plans" },
      { href: "#about", label: "Product" },
      { href: "#contact", label: "Demo" },
    ],
    cta: "Compare plans",
    aboutTitle: "A changelog your customers will open",
    aboutBody: "Northstar turns release notes into a public page with plans, status, and a demo request. Plan data is loaded from the API so the same screen works in the editor preview and on the Node server.",
    highlights: [
      { title: "Release pages", text: "One URL per version, with screenshots and a plain-language summary." },
      { title: "Status", text: "A small health check at /api/health for the status badge." },
      { title: "Demo inbox", text: "POST /api/contact stores requests while you prototype." },
    ],
    items: [
      { id: "s1", title: "Starter", summary: "One product, a public changelog, and email notifications.", meta: "$0 / month", image: img("1517245386807-bb43f82c33c4", 900, 700) },
      { id: "s2", title: "Team", summary: "Shared drafts, review comments, and a custom domain.", meta: "$29 / month", image: img("1552664730-d307ca884978", 900, 700) },
      { id: "s3", title: "Scale", summary: "Audience segments, RSS, and a private embed for the app.", meta: "$99 / month", image: img("1553877522-43269d4ea984", 900, 700) },
      { id: "s4", title: "Enterprise", summary: "SSO, audit log, and a shared Slack channel.", meta: "Talk to us", image: img("1522071820081-009f0129c71c", 900, 700) },
    ],
  },
  shop: {
    kind: "shop",
    label: "Shop",
    description: "Catalog with product API",
    name: "Field Goods",
    tagline: "Objects for a slower, better home.",
    accent: "#d4a574",
    accentInk: "#2a1b10",
    bg: "#14110e",
    ink: "#f7f3ee",
    muted: "#cbbbaa",
    card: "#221c17",
    heroImage: img("1441986300917-64674bd600d8", 1800, 1100),
    resource: "products",
    resourceLabel: "In the shop",
    nav: [
      { href: "#work", label: "Shop" },
      { href: "#about", label: "About" },
      { href: "#contact", label: "Visit" },
    ],
    cta: "Browse objects",
    aboutTitle: "Made in small batches",
    aboutBody: "Field Goods lists linen, ceramics, and light. The catalog is GET /api/products. Adding a piece is a POST to the same path, which the server keeps in memory until you connect a database.",
    highlights: [
      { title: "Natural materials", text: "Linen, stoneware, and oak — photographed in daylight." },
      { title: "Small runs", text: "When a piece sells through, it leaves the catalog." },
      { title: "Studio visits", text: "The contact form books a walk-through of the workshop." },
    ],
    items: [
      { id: "g1", title: "Stoneware pourer", summary: "A 600ml pourer with a pulled spout and a sand glaze.", meta: "$48", image: img("1610701596007-11502861dcfa", 900, 700) },
      { id: "g2", title: "Washed linen throw", summary: "Heavy flax, garment washed, in oat.", meta: "$120", image: img("1616486338812-3dadae4b4ace", 900, 700) },
      { id: "g3", title: "Oak stool", summary: "Three-legged stool, oiled, made to be moved.", meta: "$220", image: img("1503602642458-232111445657", 900, 700) },
      { id: "g4", title: "Brass task lamp", summary: "A jointed arm and a linen shade.", meta: "$180", image: img("1507473885765-e6ed057f782c", 900, 700) },
    ],
  },
  blog: {
    kind: "blog",
    label: "Blog",
    description: "Essays loaded from an API",
    name: "Field Notes",
    tagline: "Essays on building things that last.",
    accent: "#f2c14e",
    accentInk: "#241b04",
    bg: "#101418",
    ink: "#f4f5f7",
    muted: "#b7c0c8",
    card: "#1b2229",
    heroImage: img("1456513080510-7bf3a84b82f8", 1800, 1100),
    resource: "posts",
    resourceLabel: "Latest notes",
    nav: [
      { href: "#work", label: "Notes" },
      { href: "#about", label: "About" },
      { href: "#contact", label: "Write" },
    ],
    cta: "Read notes",
    aboutTitle: "A notebook for people who ship",
    aboutBody: "Field Notes publishes short essays. Posts are JSON from GET /api/posts, so the reading list in the preview and the reading list on the server stay in sync.",
    highlights: [
      { title: "Short essays", text: "One idea, a few hundred words, and a clear heading." },
      { title: "Working notes", text: "Drafts can be added with POST /api/posts while you learn the API." },
      { title: "Letters", text: "The contact form is the letter box for readers." },
    ],
    items: [
      { id: "b1", title: "Name the files first", summary: "A project gets easier to teach when the folders match the story you tell about it.", meta: "Craft", image: img("1515879218367-8466d910aaa4", 900, 700) },
      { id: "b2", title: "Preview before the server", summary: "Seed data lets a page render before the API process is running.", meta: "Workflow", image: img("1498050108023-c5249f4df085", 900, 700) },
      { id: "b3", title: "Write the route you mean", summary: "GET for the list, POST for a new record, and a health check you can curl.", meta: "APIs", image: img("1555066931-4365d14bab8c", 900, 700) },
      { id: "b4", title: "Keep the type large", summary: "Body text at 18px and a measure near 65 characters is enough for a long note.", meta: "Reading", image: img("1481627834876-b7833e8f5570", 900, 700) },
    ],
  },
};

const KIND_ORDER: WebsiteKind[] = ["restaurant", "shop", "blog", "saas", "portfolio"];

const KIND_PATTERNS: Record<WebsiteKind, RegExp> = {
  restaurant: /\b(restaurant|cafe|café|bistro|diner|menu|eatery)\b/i,
  shop: /\b(shop|store|ecommerce|e-commerce|boutique|catalog)\b/i,
  blog: /\b(blog|magazine|journal|newsletter|essay)\b/i,
  saas: /\b(saas|startup|software|product launch|landing page)\b/i,
  portfolio: /\b(portfolio|agency|studio|freelance)\b/i,
};

export function getWebsitePreset(kind: WebsiteKind): WebsitePreset {
  return WEBSITE_PRESETS[kind];
}

export function listWebsitePresets(): WebsitePreset[] {
  return (Object.keys(WEBSITE_PRESETS) as WebsiteKind[]).map((kind) => WEBSITE_PRESETS[kind]);
}

function slugify(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function embedJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function cleanCapturedName(raw: string): string | undefined {
  const name = raw
    .replace(/["“”']/g, "")
    .replace(/\b(website|web site|landing page|full[-\s]?stack|please|site)\b/gi, "")
    .replace(/[?.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (name.length < 2 || name.length > 48) return undefined;
  if (/^(a|an|the|my|our|me|this|that)$/i.test(name)) return undefined;
  return name;
}

export function parseWebsiteRequest(text: string): WebsiteRequest | null {
  const verb = /\b(build|create|generate|make|scaffold|design|code)\b/i.test(text);
  const noun = /\b(website|web site|landing page|full[-\s]?stack site|fullstack site)\b/i.test(text);
  if (!verb || !noun) return null;

  let kind: WebsiteKind = "portfolio";
  let explicitKind = false;
  for (const candidate of KIND_ORDER) {
    if (KIND_PATTERNS[candidate].test(text)) {
      kind = candidate;
      explicitKind = true;
      break;
    }
  }

  const called = text.match(/\b(?:called|named)\s+["“']?([^"\n”']{2,60})/i);
  const titled = text.match(/\bfor\s+(?:my\s+|our\s+|a\s+|an\s+|the\s+)?["“']?([A-Z][^,.\n]{1,48})/);
  const name = cleanCapturedName(called?.[1] || titled?.[1] || "");

  if (!explicitKind && !name) {
    return { mode: "choose", kind };
  }
  return { mode: "generate", kind, name };
}

export function generateFullStackWebsite(input: WebsiteGeneratorInput): GeneratedWebsite {
  const preset = WEBSITE_PRESETS[input.kind];
  const name = (input.name || preset.name).trim() || preset.name;
  const tagline = (input.tagline || preset.tagline).trim() || preset.tagline;
  const slug = slugify(name);
  const site = { ...preset, name, tagline };

  const files: GeneratedFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(site) },
    { path: "client/styles.css", language: "css", content: renderCss(site) },
    { path: "client/script.js", language: "javascript", content: renderClientScript(site) },
    { path: "server/store.js", language: "javascript", content: renderStore(site) },
    { path: "server/index.js", language: "javascript", content: renderServer(site) },
    { path: "package.json", language: "json", content: renderPackageJson(site, slug) },
    { path: ".env.example", language: "plaintext", content: "PORT=3000\n" },
    { path: "README.md", language: "markdown", content: renderReadme(site, slug) },
  ];

  return {
    name,
    slug,
    kind: site.kind,
    resource: site.resource,
    files,
    previewPath: "client/index.html",
  };
}

export function describeGeneratedWebsite(site: GeneratedWebsite): string {
  const preset = WEBSITE_PRESETS[site.kind];
  return [
    `**${site.name}** is in the editor — a full-stack ${preset.label.toLowerCase()} site.`,
    "",
    "**Client** (open in the preview)",
    "- `client/index.html`",
    "- `client/styles.css`",
    `- \`client/script.js\` loads \`/api/${site.resource}\` and uses seed data when the API is offline`,
    "",
    "**Server**",
    "- `server/index.js` — Node static server and JSON API",
    `- \`server/store.js\` — in-memory ${site.resource} and contact messages`,
    "",
    "**Run it**",
    "```bash",
    "npm start",
    "```",
    `Then open http://localhost:3000. Routes: \`GET /api/health\`, \`GET /api/${site.resource}\`, \`POST /api/${site.resource}\`, \`POST /api/contact\`.`,
  ].join("\n");
}

export function mergeGeneratedFiles<T extends ProjectFileNode>(tree: T[], files: GeneratedFile[]): T[] {
  const clone = structuredClone(tree) as T[];
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) continue;
    let siblings = clone as ProjectFileNode[];
    let prefix = "";
    for (const folderName of parts) {
      prefix = prefix ? `${prefix}/${folderName}` : folderName;
      let folder = siblings.find((node) => node.type === "folder" && node.name === folderName);
      if (!folder) {
        folder = { id: prefix, name: folderName, type: "folder", isOpen: true, children: [] };
        siblings.unshift(folder);
      }
      folder.isOpen = true;
      if (!folder.children) folder.children = [];
      siblings = folder.children;
    }
    const existing = siblings.find((node) => node.type === "file" && node.name === fileName);
    if (existing) {
      existing.id = file.path;
      existing.language = file.language;
      existing.content = file.content;
    } else {
      siblings.push({
        id: file.path,
        name: fileName,
        type: "file",
        language: file.language,
        content: file.content,
      });
    }
  }
  return clone as T[];
}

function renderHtml(site: WebsitePreset): string {
  const highlights = site.highlights
    .map(
      (item) => `<article class="highlight">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>`
    )
    .join("\n");
  const nav = site.nav
    .map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(site.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="#top">${escapeHtml(site.name)}</a>
    <nav aria-label="Primary">${nav}</nav>
  </header>
  <main id="top">
    <section class="hero" style="--hero: url('${site.heroImage}')">
      <p class="eyebrow">${escapeHtml(site.label)}</p>
      <h1>${escapeHtml(site.name)}</h1>
      <p class="lede">${escapeHtml(site.tagline)}</p>
      <a class="button" href="#work">${escapeHtml(site.cta)}</a>
    </section>
    <section id="work" class="section">
      <div class="section-head">
        <h2>${escapeHtml(site.resourceLabel)}</h2>
        <p id="api-status" class="status">Loading catalog…</p>
      </div>
      <label class="filter">
        <span>Search</span>
        <input id="filter" type="search" placeholder="Filter ${escapeHtml(site.resource)}" autocomplete="off">
      </label>
      <div id="catalog" class="catalog" aria-live="polite"></div>
    </section>
    <section id="about" class="section about">
      <div>
        <h2>${escapeHtml(site.aboutTitle)}</h2>
        <p>${escapeHtml(site.aboutBody)}</p>
      </div>
      <div class="highlights">${highlights}</div>
    </section>
    <section id="contact" class="section contact">
      <h2>Say hello</h2>
      <form id="contact-form">
        <label>Name<input name="name" required maxlength="80"></label>
        <label>Email<input name="email" type="email" required maxlength="120"></label>
        <label>Message<textarea name="message" required maxlength="1000" rows="4"></textarea></label>
        <button class="button" type="submit">Send</button>
        <p id="form-status" class="status" role="status"></p>
      </form>
    </section>
  </main>
  <footer class="site-footer">
    <span>${escapeHtml(site.name)}</span>
    <span>Full-stack preview · client + Node API</span>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function renderCss(site: WebsitePreset): string {
  return `:root {
  --bg: ${site.bg};
  --ink: ${site.ink};
  --muted: ${site.muted};
  --card: ${site.card};
  --accent: ${site.accent};
  --accent-ink: ${site.accentInk};
  --line: color-mix(in srgb, var(--ink) 14%, transparent);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Outfit, sans-serif;
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.site-header, .section, .site-footer {
  width: min(1080px, calc(100% - 2rem));
  margin-inline: auto;
}
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 0;
}
.brand { font-family: Fraunces, serif; font-size: 1.25rem; text-decoration: none; }
nav { display: flex; gap: 1rem; }
nav a { color: var(--muted); text-decoration: none; font-size: 0.95rem; }
nav a:hover { color: var(--ink); }
.hero {
  position: relative;
  min-height: 68vh;
  display: grid;
  align-content: end;
  gap: 0.75rem;
  padding: 3rem;
  border-radius: 1.4rem;
  overflow: hidden;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--bg) 10%, transparent), color-mix(in srgb, var(--bg) 88%, black)),
    var(--hero) center/cover no-repeat;
}
.eyebrow { margin: 0; letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.75rem; color: var(--accent); }
h1, h2, h3 { font-family: Fraunces, serif; font-weight: 560; letter-spacing: -0.03em; }
h1 { margin: 0; font-size: clamp(3rem, 8vw, 6rem); line-height: 0.95; max-width: 10ch; }
.lede { margin: 0; max-width: 36rem; font-size: 1.15rem; color: var(--muted); }
.button {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  margin-top: 0.4rem;
  padding: 0.75rem 1.1rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  font: 600 0.95rem Outfit, sans-serif;
  text-decoration: none;
  cursor: pointer;
}
.section { padding: 4rem 0 1rem; }
.section-head, .filter { display: flex; justify-content: space-between; gap: 1rem; align-items: end; }
h2 { margin: 0 0 0.4rem; font-size: clamp(2rem, 4vw, 3rem); }
.status { margin: 0; color: var(--muted); font-size: 0.9rem; }
.filter { margin: 1rem 0 1.2rem; flex-direction: column; align-items: stretch; max-width: 22rem; }
.filter span { font-size: 0.8rem; color: var(--muted); }
input, textarea {
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.75rem 0.8rem;
  border-radius: 0.7rem;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font: inherit;
}
.catalog { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 1rem;
  overflow: hidden;
}
.card img { height: 180px; width: 100%; object-fit: cover; }
.card div { padding: 0.9rem 1rem 1.1rem; }
.card h3 { margin: 0 0 0.35rem; font-size: 1.3rem; }
.card p { margin: 0; color: var(--muted); }
.meta { margin-top: 0.7rem !important; color: var(--accent) !important; font-weight: 600; }
.about { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
.about p { color: var(--muted); font-size: 1.05rem; }
.highlights { display: grid; gap: 0.8rem; }
.highlight { padding: 1rem; border-radius: 0.9rem; background: var(--card); border: 1px solid var(--line); }
.highlight h3 { margin: 0 0 0.3rem; }
.highlight p { margin: 0; }
.contact form { display: grid; gap: 0.8rem; max-width: 34rem; }
.site-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 2rem 0 3rem;
  color: var(--muted);
  font-size: 0.9rem;
}
@media (max-width: 760px) {
  .site-header, .section-head, .site-footer, .about { display: grid; }
  .hero { padding: 1.5rem; min-height: 78vh; }
  nav { flex-wrap: wrap; }
}
`;
}

function renderClientScript(site: WebsitePreset): string {
  const payload = {
    resource: site.resource,
    items: site.items,
  };
  return `const SITE = ${embedJson(payload)};

const catalog = document.getElementById("catalog");
const filterInput = document.getElementById("filter");
const apiStatus = document.getElementById("api-status");
const form = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

let items = SITE.items.slice();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function moneyLabel(meta) {
  return /^\\d+(\\.\\d+)?$/.test(String(meta)) ? "$" + meta : escapeHtml(meta);
}

function safeImage(url) {
  return /^https:\\/\\//.test(String(url)) ? String(url) : "";
}

function render(list) {
  if (!catalog) return;
  if (!list.length) {
    catalog.innerHTML = "<p class=\\"status\\">Nothing matches that search.</p>";
    return;
  }
  catalog.innerHTML = list.map((item) => \`
    <article class="card">
      <img src="\${safeImage(item.image)}" alt="\${escapeHtml(item.title)}">
      <div>
        <h3>\${escapeHtml(item.title)}</h3>
        <p>\${escapeHtml(item.summary)}</p>
        <p class="meta">\${moneyLabel(item.meta)}</p>
      </div>
    </article>\`).join("");
}

async function loadItems() {
  try {
    const response = await fetch("/api/" + SITE.resource);
    if (!response.ok) throw new Error("API " + response.status);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected payload");
    items = data;
    if (apiStatus) apiStatus.textContent = "Live API · /api/" + SITE.resource;
  } catch {
    items = SITE.items.slice();
    if (apiStatus) apiStatus.textContent = "Preview data · start the server for the live API";
  }
  render(items);
}

filterInput?.addEventListener("input", () => {
  const query = filterInput.value.trim().toLowerCase();
  render(items.filter((item) => (item.title + " " + item.summary).toLowerCase().includes(query)));
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (formStatus) formStatus.textContent = "Sending…";
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Request failed");
    form.reset();
    if (formStatus) formStatus.textContent = "Saved by the API. Thank you.";
  } catch {
    const key = "lunor-website-messages";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ ...data, createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));
    form.reset();
    if (formStatus) formStatus.textContent = "Saved in this browser. Run npm start to store messages on the server.";
  }
});

loadItems();
`;
}

function renderStore(site: WebsitePreset): string {
  return `const resource = ${JSON.stringify(site.resource)};
const items = ${embedJson(site.items)};
const messages = [];

function listItems() {
  return items.map((item) => ({ ...item }));
}

function addItem(input) {
  const title = String(input.title || input.name || "").trim();
  if (!title) {
    const error = new Error("A title is required.");
    error.status = 400;
    throw error;
  }
  const created = {
    id: String(Date.now()),
    title,
    summary: String(input.summary || "Added from the API."),
    meta: String(input.meta || "New"),
    image: String(input.image || ${JSON.stringify(site.items[0]?.image || "")}),
  };
  items.unshift(created);
  return created;
}

function addMessage(input) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim();
  const message = String(input.message || "").trim();
  if (!name || !email || !message) {
    const error = new Error("Name, email, and message are required.");
    error.status = 400;
    throw error;
  }
  const entry = { id: String(Date.now()), name, email, message, createdAt: new Date().toISOString() };
  messages.push(entry);
  return entry;
}

module.exports = { resource, listItems, addItem, addMessage };
`;
}

function renderServer(site: WebsitePreset): string {
  return `const http = require("http");
const fs = require("fs");
const path = require("path");
const store = require("./store");

const PORT = Number(process.env.PORT) || 3000;
const clientDir = path.join(__dirname, "..", "client");
const serviceName = ${JSON.stringify(site.name)};
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url || "/", "http://localhost");
  const resourcePath = "/api/" + store.resource;

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: serviceName });
    return;
  }
  if (req.method === "GET" && url.pathname === resourcePath) {
    sendJson(res, 200, store.listItems());
    return;
  }
  if (req.method === "POST" && (url.pathname === resourcePath || url.pathname === "/api/contact")) {
    const body = await readBody(req);
    try {
      const created = url.pathname === "/api/contact" ? store.addMessage(body) : store.addItem(body);
      sendJson(res, 201, created);
    } catch (error) {
      sendJson(res, error.status || 500, { error: error.message });
    }
    return;
  }

  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.join(clientDir, requested);
  if (filePath !== clientDir && !filePath.startsWith(clientDir + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(serviceName + " running at http://localhost:" + PORT);
});
`;
}

function renderPackageJson(site: WebsitePreset, slug: string): string {
  return JSON.stringify(
    {
      name: slug,
      version: "1.0.0",
      private: true,
      description: `${site.name} — full-stack ${site.label.toLowerCase()} site generated by Lunor.AI`,
      scripts: { start: "node server/index.js" },
    },
    null,
    2
  ) + "\n";
}

function renderReadme(site: WebsitePreset, slug: string): string {
  return `# ${site.name}

Full-stack ${site.label.toLowerCase()} website generated in the Lunor.AI Web Development assistant.

The client is plain HTML, CSS, and JavaScript so it previews in the editor. The server is Node's built-in \`http\` module, so \`npm start\` does not need extra packages.

## Run

\`\`\`bash
npm start
\`\`\`

Open http://localhost:3000.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | \`/api/health\` | Service check |
| GET | \`/api/${site.resource}\` | List ${site.resource} |
| POST | \`/api/${site.resource}\` | Add a record (\`title\` required) |
| POST | \`/api/contact\` | Save a name, email, and message |

Set \`PORT\` in the environment to change the port. See \`.env.example\`.

Package name: \`${slug}\`.
`;
}
