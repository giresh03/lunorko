/**
 * Full-stack website generator used by the Web Development AI assistant.
 * Produces a previewable client plus an Express API from a short brief.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "restaurant" | "store" | "dashboard";

export interface SiteItem {
  id: string;
  title: string;
  body: string;
  meta: string;
  image: string;
  tag: string;
}

export interface SiteFormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "number";
  required: boolean;
}

export interface SiteSeed {
  site: {
    kind: WebsiteKind;
    title: string;
    tagline: string;
    description: string;
    eyebrow: string;
    primaryCta: string;
    secondaryCta: string;
    itemsHeading: string;
    featuresHeading: string;
  };
  theme: {
    bg: string;
    ink: string;
    muted: string;
    surface: string;
    accent: string;
    accentInk: string;
    display: string;
    body: string;
    fontHref: string;
  };
  nav: { label: string; href: string }[];
  heroImage: string;
  stats: { label: string; value: string }[];
  features: { title: string; body: string }[];
  items: SiteItem[];
  form: {
    endpoint: string;
    title: string;
    blurb: string;
    submit: string;
    fields: SiteFormField[];
  };
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  title: string;
  slug: string;
  summary: string;
  previewFile: string;
  files: GeneratedFile[];
  seed: SiteSeed;
}

export interface WebsiteAutomation {
  id: WebsiteKind;
  label: string;
  brief: string;
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

export const WEBSITE_AUTOMATIONS: WebsiteAutomation[] = [
  {
    id: "landing",
    label: "SaaS landing",
    brief: "Build a full-stack SaaS landing page called Northstar with features, pricing, and a waitlist API",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    brief: "Create a full-stack portfolio website for Mira Chen with projects and a contact API",
  },
  {
    id: "blog",
    label: "Blog",
    brief: "Generate a full-stack blog website called Field Notes with articles and a subscribe API",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    brief: "Build a restaurant website for Hearth & Rye with a menu and a reservations API",
  },
  {
    id: "store",
    label: "Store",
    brief: "Create a full-stack online store called Loom Goods with products and an orders API",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    brief: "Generate a full-stack analytics dashboard called Harbor with metrics and a notes API",
  },
];

const PHOTO = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export function isWebsiteGenerationRequest(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/^(explain|what|why|how|describe|compare|define)\b/i.test(trimmed)) return false;
  const verb = /\b(build|create|generate|make|scaffold|design|automate)\b/i.test(trimmed);
  const target = /\b(website|web\s*site|landing\s*page|portfolio|blog|restaurant|online\s*store|e-?commerce|dashboard|full[\s-]?stack)\b/i.test(trimmed);
  return verb && target;
}

export function detectWebsiteKind(brief: string): WebsiteKind {
  const text = brief.toLowerCase();
  if (/restaurant|cafe|bakery|bistro|diner|menu\b/.test(text)) return "restaurant";
  if (/store|shop|e-?commerce|product catalog|products\b/.test(text)) return "store";
  if (/dashboard|analytics|admin panel|metrics/.test(text)) return "dashboard";
  if (/blog|magazine|journal|articles/.test(text)) return "blog";
  if (/portfolio|case stud|personal site/.test(text)) return "portfolio";
  return "landing";
}

export function generateFullStackWebsite(brief: string): GeneratedWebsite {
  const kind = detectWebsiteKind(brief);
  const fallback = KIND_DEFAULTS[kind].title;
  const title = extractTitle(brief, fallback);
  const seed = buildSeed(kind, title);
  const files = buildFiles(seed);
  return {
    kind,
    title: seed.site.title,
    slug: slugify(seed.site.title),
    summary: `${seed.site.title} is a ${kindLabel(kind)} with a static client and an Express API at ${seed.form.endpoint}.`,
    previewFile: "client/index.html",
    files,
    seed,
  };
}

export function describeWebsite(site: GeneratedWebsite): string {
  const fileList = site.files.map((file) => `- \`${file.path}\``).join("\n");
  const endpoint = site.seed.form.endpoint;
  return [
    `**Full-stack website ready: ${site.title}**`,
    "",
    site.summary,
    "The client is open in the preview. Form submissions stay in memory on the Express server.",
    "",
    "**Run it locally**",
    "```bash",
    "npm install",
    "npm start",
    "```",
    "Then open http://localhost:5000",
    "",
    "**Project files**",
    fileList,
    "",
    "**API**",
    "- `GET /api/health`",
    "- `GET /api/site`",
    "- `GET /api/items`",
    `- \`POST ${endpoint}\``,
    "",
    "Preview mode uses the seed data baked into `client/index.html`. Start the server when you want the form to persist.",
  ].join("\n");
}

export function toProjectTree(files: GeneratedFile[]): ProjectNode[] {
  const root: ProjectNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let level = root;
    let accumulated = "";
    parts.forEach((part, index) => {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = level.find((entry) => entry.name === part && entry.type === (isFile ? "file" : "folder"));
      if (!node) {
        node = isFile
          ? { id: accumulated, name: part, type: "file", language: file.language, content: file.content }
          : { id: accumulated, name: part, type: "folder", isOpen: true, children: [] };
        level.push(node);
      }
      if (!isFile) level = node.children ?? [];
    });
  }
  return root;
}

function extractTitle(brief: string, fallback: string): string {
  const quoted = brief.match(/["“](.+?)["”]/);
  if (quoted?.[1]) return cleanTitle(quoted[1]);
  const named = brief.match(/\b(?:called|named)\s+(.+?)(?:\s+with\b|$)/i);
  if (named?.[1]) return cleanTitle(named[1]);
  const dedicated = brief.match(/\bfor\s+(.+?)(?:\s+with\b|$)/i);
  if (dedicated?.[1] && !/^(a|an|the|my)\b/i.test(dedicated[1].trim())) return cleanTitle(dedicated[1]);
  return fallback;
}

function cleanTitle(value: string): string {
  return value.replace(/[.?!]+$/, "").replace(/\s+/g, " ").trim().slice(0, 60);
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "website";
}

function kindLabel(kind: WebsiteKind): string {
  switch (kind) {
    case "landing": return "SaaS landing page";
    case "portfolio": return "portfolio site";
    case "blog": return "blog";
    case "restaurant": return "restaurant site";
    case "store": return "online store";
    case "dashboard": return "analytics dashboard";
  }
}

interface KindDefault {
  title: string;
  tagline: string;
  description: string;
  eyebrow: string;
  primaryCta: string;
  secondaryCta: string;
  itemsHeading: string;
  featuresHeading: string;
  endpoint: string;
  formTitle: string;
  formBlurb: string;
  submit: string;
  fields: SiteFormField[];
  theme: SiteSeed["theme"];
  heroImage: string;
  stats: { label: string; value: string }[];
  features: { title: string; body: string }[];
  items: SiteItem[];
  nav: { label: string; href: string }[];
}

const textField = (name: string, label: string, type: SiteFormField["type"], required = true): SiteFormField => ({
  name, label, type, required,
});

const KIND_DEFAULTS: Record<WebsiteKind, KindDefault> = {
  landing: {
    title: "Northstar",
    tagline: "Ship the roadmap your team can actually finish.",
    description: "Northstar turns scattered product ideas into a weekly plan, with owners, dates, and a public changelog.",
    eyebrow: "Product planning",
    primaryCta: "Join the waitlist",
    secondaryCta: "See the product",
    itemsHeading: "Plans teams start on",
    featuresHeading: "What the API already serves",
    endpoint: "/api/waitlist",
    formTitle: "Request early access",
    formBlurb: "The waitlist posts to the Express API and stays in server memory.",
    submit: "Request access",
    fields: [textField("name", "Name", "text"), textField("email", "Work email", "email"), textField("company", "Company", "text", false)],
    theme: theme("#10140f", "#f4f7ef", "#b7c3ad", "#1a2218", "#d6ff4a", "#142006", "Syne", "Outfit", "Syne:wght@600;700&family=Outfit:wght@400;500;600"),
    heroImage: PHOTO("1552664730-d307ca884978"),
    stats: [
      { value: "12 min", label: "to a first plan" },
      { value: "48", label: "teams on the list" },
      { value: "1 API", label: "for the whole page" },
    ],
    features: [
      { title: "Seeded content", body: "Plans, stats, and copy live in server/data/seed.js and ship with the page." },
      { title: "Waitlist route", body: "POST /api/waitlist validates name and email, then stores the entry." },
      { title: "Preview fallback", body: "The browser preview reads the embedded seed when the API is offline." },
    ],
    items: [
      item("focus", "Focus", "One outcome, three tasks, a Friday review.", "Starter", "1498050108023-c5249f4df085", "Free"),
      item("squad", "Squad", "Shared owners, dependencies, and a changelog.", "Team", "1522071820081-009f0129c71c", "$18"),
      item("studio", "Studio", "Multiple products, guest reviewers, export to CSV.", "Studio", "1553877522-43269d4ea984", "$42"),
    ],
    nav: [
      { label: "Product", href: "#features" },
      { label: "Plans", href: "#items" },
      { label: "Waitlist", href: "#form" },
    ],
  },
  portfolio: {
    title: "Mira Chen",
    tagline: "Brand and product design for teams who still care about type.",
    description: "Selected work from independent studios, with a contact route that stores messages on the server.",
    eyebrow: "Designer · Oakland",
    primaryCta: "Start a project",
    secondaryCta: "Selected work",
    itemsHeading: "Selected work",
    featuresHeading: "How this site is built",
    endpoint: "/api/contact",
    formTitle: "Tell me about the work",
    formBlurb: "Messages post to /api/contact. Restarting the server clears them.",
    submit: "Send note",
    fields: [textField("name", "Name", "text"), textField("email", "Email", "email"), textField("message", "Project note", "textarea")],
    theme: theme("#f3eee6", "#1c1915", "#6d645b", "#fffaf3", "#c2410c", "#fff7ed", "Fraunces", "Outfit", "Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600"),
    heroImage: PHOTO("1522202176988-66273c2fd55f"),
    stats: [
      { value: "9 yrs", label: "independent" },
      { value: "30+", label: "launched brands" },
      { value: "4 wks", label: "typical sprint" },
    ],
    features: [
      { title: "Case studies", body: "Projects are JSON records returned by GET /api/items." },
      { title: "Contact API", body: "The form requires a name, email, and a short note." },
      { title: "One stylesheet", body: "client/styles.css is plain CSS with theme variables." },
    ],
    items: [
      item("kiln", "Kiln Ceramics", "Identity, packaging, and a shop homepage for a four-person studio.", "2025", "1565193569-8a7b3294f1c6", "Identity"),
      item("paper", "Paper Route", "Editorial site and subscription flow for a weekend newspaper.", "2024", "1455390582262-044cdead277a", "Editorial"),
      item("lumen", "Lumen Health", "Patient portal screens focused on large type and calm color.", "2024", "1576091160399-112ba8d25d1d", "Product"),
    ],
    nav: [
      { label: "Practice", href: "#features" },
      { label: "Work", href: "#items" },
      { label: "Contact", href: "#form" },
    ],
  },
  blog: {
    title: "Field Notes",
    tagline: "Reporting on small software teams, written like a letter.",
    description: "Essays and interviews, plus an email subscribe route backed by Express.",
    eyebrow: "Journal",
    primaryCta: "Subscribe",
    secondaryCta: "Latest essays",
    itemsHeading: "Latest essays",
    featuresHeading: "On the stack",
    endpoint: "/api/subscribe",
    formTitle: "Get the Sunday letter",
    formBlurb: "Subscriptions are stored by POST /api/subscribe.",
    submit: "Subscribe",
    fields: [textField("name", "Name", "text"), textField("email", "Email", "email")],
    theme: theme("#f7f3ea", "#1e2a22", "#5d6b60", "#fffdf8", "#1f6b4a", "#f3fff6", "Newsreader", "Source Sans 3", "Newsreader:opsz,wght@6..72,500;6..72,650&family=Source+Sans+3:wght@400;600"),
    heroImage: PHOTO("1456513080510-7bf3a84b82f8"),
    stats: [
      { value: "128", label: "essays" },
      { value: "2×", label: "a week" },
      { value: "11k", label: "readers" },
    ],
    features: [
      { title: "Article records", body: "Each essay is an item with a tag, a dek, and a cover image." },
      { title: "Subscribe route", body: "The API rejects a request that arrives without an email." },
      { title: "Readable type", body: "Newsreader for headlines, Source Sans for the body copy." },
    ],
    items: [
      item("deploy", "The deploy that waited", "Why a five-person team stopped shipping on Fridays.", "Mar 12", "1461749280684-dccba630e2f6", "Process"),
      item("names", "Naming the hard part", "A week inside a startup that could not name its product.", "Mar 4", "1516321318423-f06f85e504b3", "Language"),
      item("oncall", "Quiet on-call", "A support rotation designed around sleep, not heroics.", "Feb 21", "1517245386807-bb43f82c33c4", "Ops"),
    ],
    nav: [
      { label: "About", href: "#features" },
      { label: "Essays", href: "#items" },
      { label: "Subscribe", href: "#form" },
    ],
  },
  restaurant: {
    title: "Hearth & Rye",
    tagline: "Wood fire, a short menu, and a table if you ask before Thursday.",
    description: "Neighborhood restaurant site with tonight's menu and a reservation request API.",
    eyebrow: "Dinner · Tue–Sun",
    primaryCta: "Request a table",
    secondaryCta: "Tonight's menu",
    itemsHeading: "Tonight's menu",
    featuresHeading: "From the kitchen",
    endpoint: "/api/reservations",
    formTitle: "Request a reservation",
    formBlurb: "Requests post to /api/reservations. The kitchen confirms by phone.",
    submit: "Request table",
    fields: [
      textField("name", "Name", "text"),
      textField("email", "Email", "email"),
      textField("party", "Party size", "number"),
      textField("note", "Notes", "textarea", false),
    ],
    theme: theme("#1a1410", "#f6efe4", "#cbbba6", "#261c16", "#e7c27d", "#2a2114", "Cormorant Garamond", "Nunito Sans", "Cormorant+Garamond:wght@560;700&family=Nunito+Sans:wght@400;600;700"),
    heroImage: PHOTO("1414235077428-338989a2e8c0"),
    stats: [
      { value: "32", label: "seats" },
      { value: "5", label: "dishes tonight" },
      { value: "7 pm", label: "first seating" },
    ],
    features: [
      { title: "Menu data", body: "Dishes are seed records, so the page and GET /api/items stay in sync." },
      { title: "Reservations", body: "Party size is required. Notes are optional." },
      { title: "Evening palette", body: "Charcoal ground, cream type, and a brass accent." },
    ],
    items: [
      item("rye", "Rye sour", "Lemon, honey, and a rye from the next county.", "12", "1514362545857-3bc16c4c7d1b", "Glass"),
      item("beet", "Roasted beets", "Hazelnut, goat cheese, and rye croutons.", "16", "1512621776951-a57141f2eefd", "Small"),
      item("hen", "Fire hen", "Half chicken, charred onion, and pan juices.", "29", "1504674900247-0877df9cc836", "Main"),
    ],
    nav: [
      { label: "Kitchen", href: "#features" },
      { label: "Menu", href: "#items" },
      { label: "Reserve", href: "#form" },
    ],
  },
  store: {
    title: "Loom Goods",
    tagline: "Home objects milled, thrown, and sewn in small batches.",
    description: "A catalog with prices served by the API and an order note endpoint.",
    eyebrow: "Objects · Batch 14",
    primaryCta: "Place an order note",
    secondaryCta: "Shop the batch",
    itemsHeading: "In this batch",
    featuresHeading: "Shop details",
    endpoint: "/api/orders",
    formTitle: "Order note",
    formBlurb: "This demo stores the order in memory via POST /api/orders. It does not charge a card.",
    submit: "Save order",
    fields: [
      textField("name", "Name", "text"),
      textField("email", "Email", "email"),
      textField("item", "Item", "text"),
      textField("quantity", "Quantity", "number"),
    ],
    theme: theme("#f6f3ee", "#161616", "#5c5854", "#fffcf8", "#1d4ed8", "#eff6ff", "Familjen Grotesk", "Newsreader", "Familjen+Grotesk:wght@500;700&family=Newsreader:opsz,wght@6..72,450"),
    heroImage: PHOTO("1441986300917-64674bd600d8"),
    stats: [
      { value: "14", label: "current batch" },
      { value: "3", label: "makers" },
      { value: "Ships Fri", label: "from Oakland" },
    ],
    features: [
      { title: "Catalog API", body: "Product cards render from the same records GET /api/items returns." },
      { title: "Order notes", body: "Quantity and item name are required. No payment is collected." },
      { title: "Static client", body: "The storefront is HTML, CSS, and one small script." },
    ],
    items: [
      item("bowl", "Stone bowl", "Speckled clay, about eight inches across.", "$64", "1610701596007-11502861dcfa", "Clay"),
      item("throw", "Wool throw", "Undyed wool, charcoal stripe on one end.", "$148", "1616486338812-3dadae4b4ace", "Textile"),
      item("lamp", "Desk lamp", "Turned oak stem and a linen shade.", "$210", "1507473885765-e6ed057f782c", "Light"),
    ],
    nav: [
      { label: "Makers", href: "#features" },
      { label: "Batch", href: "#items" },
      { label: "Order", href: "#form" },
    ],
  },
  dashboard: {
    title: "Harbor",
    tagline: "A calm view of signups, revenue, and the notes your team leaves behind.",
    description: "Operations dashboard with metric cards and a notes API.",
    eyebrow: "Operations",
    primaryCta: "Leave a note",
    secondaryCta: "Open records",
    itemsHeading: "Recent records",
    featuresHeading: "What you are looking at",
    endpoint: "/api/notes",
    formTitle: "Add an ops note",
    formBlurb: "Notes post to /api/notes and show up in GET /api/notes.",
    submit: "Save note",
    fields: [textField("name", "Author", "text"), textField("email", "Email", "email"), textField("message", "Note", "textarea")],
    theme: theme("#0e1626", "#e7eefc", "#9aabc4", "#17233a", "#5eead4", "#042f2e", "IBM Plex Sans", "IBM Plex Sans", "IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500"),
    heroImage: PHOTO("1551288049-bebda4e38f71"),
    stats: [
      { value: "1,284", label: "signups" },
      { value: "$18.4k", label: "this week" },
      { value: "99.2%", label: "uptime" },
    ],
    features: [
      { title: "Live badge", body: "client/app.js calls /api/health and labels the preview when the server is down." },
      { title: "Records", body: "The table is rendered from seed items, then refreshed from GET /api/items." },
      { title: "Notes", body: "The form is a real POST, validated by the route before it is stored." },
    ],
    items: [
      item("signup", "Signup spike", "Launch email landed. Most new accounts are on the free plan.", "Today", "1460925895917-afdab827c52f", "Growth"),
      item("invoice", "Invoice batch", "42 invoices sent. Three are waiting on a tax id.", "Today", "1554224155-6726b3ff858f", "Billing"),
      item("latency", "API latency", "p95 climbed to 240ms after the image resize job.", "Yesterday", "1551288049-bebda4e38f71", "Platform"),
    ],
    nav: [
      { label: "Overview", href: "#metrics" },
      { label: "Records", href: "#items" },
      { label: "Notes", href: "#form" },
    ],
  },
};

function theme(
  bg: string,
  ink: string,
  muted: string,
  surface: string,
  accent: string,
  accentInk: string,
  display: string,
  body: string,
  fontHref: string,
): SiteSeed["theme"] {
  return { bg, ink, muted, surface, accent, accentInk, display, body, fontHref };
}

function item(id: string, title: string, body: string, meta: string, photoId: string, tag: string): SiteItem {
  return { id, title, body, meta, image: PHOTO(photoId, 900), tag };
}

function buildSeed(kind: WebsiteKind, title: string): SiteSeed {
  const base = KIND_DEFAULTS[kind];
  const renamed = title !== base.title;
  return {
    site: {
      kind,
      title,
      tagline: renamed ? `${title}. ${base.tagline}` : base.tagline,
      description: renamed ? base.description.split(base.title).join(title) : base.description,
      eyebrow: base.eyebrow,
      primaryCta: base.primaryCta,
      secondaryCta: base.secondaryCta,
      itemsHeading: base.itemsHeading,
      featuresHeading: base.featuresHeading,
    },
    theme: base.theme,
    nav: base.nav,
    heroImage: base.heroImage,
    stats: base.stats,
    features: base.features,
    items: base.items,
    form: {
      endpoint: base.endpoint,
      title: base.formTitle,
      blurb: base.formBlurb,
      submit: base.submit,
      fields: base.fields,
    },
  };
}

function buildFiles(seed: SiteSeed): GeneratedFile[] {
  const slug = slugify(seed.site.title);
  return [
    { path: "client/index.html", language: "html", content: renderHtml(seed) },
    { path: "client/styles.css", language: "css", content: renderCss(seed) },
    { path: "client/app.js", language: "javascript", content: CLIENT_APP },
    { path: "server/index.js", language: "javascript", content: SERVER_INDEX },
    { path: "server/routes/api.js", language: "javascript", content: SERVER_API },
    { path: "server/data/seed.js", language: "javascript", content: "export const seed = " + JSON.stringify(seed, null, 2) + ";\n" },
    { path: "package.json", language: "json", content: renderPackageJson(slug, seed.site.title) },
    { path: "README.md", language: "markdown", content: renderReadme(seed) },
    { path: ".env.example", language: "plaintext", content: "PORT=5000\n" },
  ];
}

function renderPackageJson(slug: string, title: string): string {
  return JSON.stringify({
    name: slug,
    version: "1.0.0",
    private: true,
    type: "module",
    description: title + " — full-stack site generated by Lunor.AI",
    scripts: { start: "node server/index.js", dev: "node server/index.js" },
    dependencies: { express: "^4.21.2" },
  }, null, 2) + "\n";
}

function renderReadme(seed: SiteSeed): string {
  return [
    `# ${seed.site.title}`,
    "",
    seed.site.description,
    "",
    "Generated by the Lunor.AI Web Development website generator.",
    "",
    "## Run",
    "",
    "```bash",
    "npm install",
    "npm start",
    "```",
    "",
    "Open http://localhost:5000",
    "",
    "## Layout",
    "",
    "- `client/` — HTML, CSS, and the browser script",
    "- `server/index.js` — Express app and static hosting",
    "- `server/routes/api.js` — JSON API",
    "- `server/data/seed.js` — starter content",
    "",
    "## API",
    "",
    "- `GET /api/health`",
    "- `GET /api/site`",
    "- `GET /api/items`",
    `- \`POST ${seed.form.endpoint}\``,
    "",
    "```bash",
    `curl -X POST http://localhost:5000${seed.form.endpoint} \\`,
    "  -H 'Content-Type: application/json' \\",
    `  -d '${samplePayload(seed)}'`,
    "```",
    "",
  ].join("\n");
}

function samplePayload(seed: SiteSeed): string {
  const payload: Record<string, string> = {};
  for (const field of seed.form.fields) {
    payload[field.name] = field.type === "email" ? "ada@example.com" : field.type === "number" ? "2" : "Sample";
  }
  return JSON.stringify(payload);
}

function renderHtml(seed: SiteSeed): string {
  const dashboard = seed.site.kind === "dashboard";
  const body = dashboard ? renderDashboard(seed) : renderMarketing(seed);
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `  <title>${escapeHtml(seed.site.title)}</title>`,
    `  <meta name="description" content="${escapeHtml(seed.site.description)}" />`,
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${seed.theme.fontHref}&display=swap" />`,
    '  <link rel="stylesheet" href="styles.css" />',
    "</head>",
    `<body data-themed="1" data-layout="${seed.site.kind}">`,
    body,
    `  <script>window.__LUNOR_SEED__ = ${safeJson(seed)};</script>`,
    '  <script src="app.js"></script>',
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

function renderMarketing(seed: SiteSeed): string {
  const nav = seed.nav.map((link) => `        <a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("\n");
  const stats = seed.stats.map((stat) => `        <div><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(stat.label)}</span></div>`).join("\n");
  const features = seed.features.map((feature) => `        <article><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.body)}</p></article>`).join("\n");
  const cards = seed.items.map(renderCard).join("\n");
  return [
    '  <header class="nav">',
    `    <a class="logo" href="#top">${escapeHtml(seed.site.title)}</a>`,
    "    <nav>",
    nav,
    "    </nav>",
    `    <a class="btn" href="#form">${escapeHtml(seed.site.primaryCta)}</a>`,
    "  </header>",
    '  <main id="top">',
    '    <section class="hero">',
    "      <div>",
    `        <p class="eyebrow">${escapeHtml(seed.site.eyebrow)}</p>`,
    `        <h1>${escapeHtml(seed.site.title)}</h1>`,
    `        <p class="lede">${escapeHtml(seed.site.tagline)}</p>`,
    '        <div class="hero-actions">',
    `          <a class="btn" href="#form">${escapeHtml(seed.site.primaryCta)}</a>`,
    `          <a class="btn ghost" href="#items">${escapeHtml(seed.site.secondaryCta)}</a>`,
    "        </div>",
    '        <p class="api-status" data-api-status>Preview mode · local data</p>',
    "      </div>",
    `      <img src="${escapeHtml(seed.heroImage)}" alt="${escapeHtml(seed.site.title)} cover" />`,
    "    </section>",
    '    <section class="stats" aria-label="Highlights">',
    stats,
    "    </section>",
    '    <section class="features" id="features">',
    `      <h2>${escapeHtml(seed.site.featuresHeading)}</h2>`,
    '      <div class="feature-grid">',
    features,
    "      </div>",
    "    </section>",
    '    <section class="items" id="items">',
    `      <h2>${escapeHtml(seed.site.itemsHeading)}</h2>`,
    '      <div class="grid" data-items>',
    cards,
    "      </div>",
    "    </section>",
    renderForm(seed),
    "  </main>",
    renderFooter(seed),
  ].join("\n");
}

function renderDashboard(seed: SiteSeed): string {
  const nav = seed.nav.map((link) => `        <a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("\n");
  const metrics = seed.stats.map((stat) => `          <article class="metric"><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(stat.label)}</span></article>`).join("\n");
  const rows = seed.items.map(renderRow).join("\n");
  return [
    '  <div class="shell">',
    "    <aside>",
    `      <a class="logo" href="#top">${escapeHtml(seed.site.title)}</a>`,
    `      <p class="eyebrow">${escapeHtml(seed.site.eyebrow)}</p>`,
    "      <nav>",
    nav,
    "      </nav>",
    "    </aside>",
    "    <div>",
    '      <header class="dash-head" id="top">',
    "        <div>",
    `          <h1>${escapeHtml(seed.site.title)}</h1>`,
    `          <p class="lede">${escapeHtml(seed.site.tagline)}</p>`,
    "        </div>",
    '        <p class="api-status" data-api-status>Preview mode · local data</p>',
    "      </header>",
    '      <section class="metrics" id="metrics">',
    metrics,
    "      </section>",
    '      <section class="items" id="items">',
    `        <h2>${escapeHtml(seed.site.itemsHeading)}</h2>`,
    '        <div data-items>',
    rows,
    "        </div>",
    "      </section>",
    renderForm(seed),
    "    </div>",
    "  </div>",
  ].join("\n");
}

function renderCard(entry: SiteItem): string {
  return [
    "        <article class=\"card\">",
    `          <img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.title)}" />`,
    "          <div>",
    `            <p class="tag">${escapeHtml(entry.tag)} · ${escapeHtml(entry.meta)}</p>`,
    `            <h3>${escapeHtml(entry.title)}</h3>`,
    `            <p>${escapeHtml(entry.body)}</p>`,
    "          </div>",
    "        </article>",
  ].join("\n");
}

function renderRow(entry: SiteItem): string {
  return [
    "          <article class=\"row\">",
    `            <img src="${escapeHtml(entry.image)}" alt="" />`,
    "            <div>",
    `              <h3>${escapeHtml(entry.title)}</h3>`,
    `              <p>${escapeHtml(entry.body)}</p>`,
    "            </div>",
    `            <span class="tag">${escapeHtml(entry.tag)} · ${escapeHtml(entry.meta)}</span>`,
    "          </article>",
  ].join("\n");
}

function renderForm(seed: SiteSeed): string {
  const fields = seed.form.fields.map((field) => {
    const required = field.required ? " required" : "";
    const control = field.type === "textarea"
      ? `<textarea name="${escapeHtml(field.name)}" rows="4"${required}></textarea>`
      : `<input name="${escapeHtml(field.name)}" type="${escapeHtml(field.type)}"${required} />`;
    return `        <label><span>${escapeHtml(field.label)}</span>${control}</label>`;
  }).join("\n");
  return [
    '    <section class="form-section" id="form">',
    `      <h2>${escapeHtml(seed.form.title)}</h2>`,
    `      <p>${escapeHtml(seed.form.blurb)}</p>`,
    '      <form data-site-form>',
    fields,
    `        <button class="btn" type="submit">${escapeHtml(seed.form.submit)}</button>`,
    '        <p data-form-note></p>',
    "      </form>",
    "    </section>",
  ].join("\n");
}

function renderFooter(seed: SiteSeed): string {
  return [
    "  <footer>",
    `    <strong>${escapeHtml(seed.site.title)}</strong>`,
    `    <p>GET /api/health · GET /api/site · GET /api/items · POST ${escapeHtml(seed.form.endpoint)}</p>`,
    "  </footer>",
  ].join("\n");
}

function renderCss(seed: SiteSeed): string {
  const themeVars = seed.theme;
  return `:root {
  --bg: ${themeVars.bg};
  --ink: ${themeVars.ink};
  --muted: ${themeVars.muted};
  --surface: ${themeVars.surface};
  --accent: ${themeVars.accent};
  --accent-ink: ${themeVars.accentInk};
  --display: "${themeVars.display}", Georgia, serif;
  --body: "${themeVars.body}", "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--body);
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
h1, h2, h3 { font-family: var(--display); letter-spacing: -0.03em; }
.nav, .dash-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 7vw;
}
.nav { position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(10px); }
.logo { font-family: var(--display); font-size: 22px; font-weight: 680; }
.nav nav, .shell aside nav { display: flex; gap: 18px; }
.eyebrow, .api-status, .tag {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
  padding: 36px 7vw 12px;
}
.hero h1, .dash-head h1 { font-size: clamp(44px, 7vw, 84px); line-height: 0.92; margin: 8px 0 14px; }
.lede { font-size: 18px; max-width: 38rem; color: var(--muted); }
.hero img { width: 100%; height: 460px; border-radius: 28px; }
.hero-actions, .stats { display: flex; gap: 12px; flex-wrap: wrap; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: 999px;
  padding: 12px 18px;
  font: 600 14px var(--body);
}
.btn.ghost { background: transparent; color: var(--ink); border: 1px solid color-mix(in srgb, var(--ink) 28%, transparent); }
.stats { margin: 28px 7vw 0; display: grid; grid-template-columns: repeat(3, 1fr); }
.stats div, .metric, .card, .form-section form, .shell aside {
  background: var(--surface);
  border-radius: 20px;
}
.stats div { padding: 18px 20px; }
.stats strong, .metric strong { display: block; font-family: var(--display); font-size: 32px; }
.features, .items, .form-section { padding: 56px 7vw; }
.feature-grid, .grid, .metrics { display: grid; gap: 16px; }
.feature-grid, .grid, .metrics { grid-template-columns: repeat(3, 1fr); }
.feature-grid article, .card div { padding: 18px; }
.card { overflow: hidden; }
.card img { height: 190px; width: 100%; }
.form-section form { display: grid; gap: 12px; max-width: 520px; padding: 18px; }
label { display: grid; gap: 6px; font-size: 14px; }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
  background: var(--bg);
  color: var(--ink);
  padding: 10px 12px;
  font: inherit;
}
footer { padding: 28px 7vw 40px; color: var(--muted); }
.shell { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
.shell aside { margin: 16px; padding: 20px; display: flex; flex-direction: column; gap: 18px; }
.shell aside nav { flex-direction: column; }
.dash-head, .metrics, .shell .items, .shell .form-section { padding-left: 28px; padding-right: 28px; }
.metrics { padding-top: 8px; }
.metric { padding: 16px 18px; }
.row {
  display: grid;
  grid-template-columns: 84px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
}
.row img { width: 84px; height: 64px; border-radius: 12px; }
.row h3, .card h3, .feature-grid h3 { margin: 4px 0; }
@media (max-width: 860px) {
  .nav nav { display: none; }
  .hero, .feature-grid, .grid, .metrics, .stats, .shell, .row { grid-template-columns: 1fr; }
  .hero img { height: 240px; }
  .shell aside nav { flex-direction: row; flex-wrap: wrap; }
}
`;
}

const CLIENT_APP = `const seed = window.__LUNOR_SEED__ || { site: { kind: "landing" }, items: [], form: { endpoint: "/api/submit" } };
const statusEl = document.querySelector("[data-api-status]");
const form = document.querySelector("[data-site-form]");

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function renderItems(items) {
  const host = document.querySelector("[data-items]");
  if (!host || !Array.isArray(items)) return;
  host.replaceChildren();
  const dashboard = document.body.dataset.layout === "dashboard";
  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = dashboard ? "row" : "card";
    const image = document.createElement("img");
    image.src = item.image || "";
    image.alt = dashboard ? "" : item.title || "";
    const copy = document.createElement("div");
    const tag = document.createElement("p");
    tag.className = "tag";
    tag.textContent = [item.tag, item.meta].filter(Boolean).join(" · ");
    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled";
    const body = document.createElement("p");
    body.textContent = item.body || "";
    if (dashboard) {
      const meta = document.createElement("span");
      meta.className = "tag";
      meta.textContent = tag.textContent;
      copy.append(title, body);
      article.append(image, copy, meta);
    } else {
      copy.append(tag, title, body);
      article.append(image, copy);
    }
    host.append(article);
  });
}

async function refreshFromApi() {
  try {
    const health = await fetch("/api/health");
    if (!health.ok) throw new Error("offline");
    setStatus("API connected");
    const items = await fetch("/api/items");
    if (items.ok) renderItems(await items.json());
  } catch {
    setStatus("Preview mode · local data");
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const note = form.querySelector("[data-form-note]");
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch(seed.form.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Request failed");
    if (note) note.textContent = "Saved on the server.";
    form.reset();
  } catch (error) {
    if (note) note.textContent = "API offline. Start the server, then submit to " + seed.form.endpoint + ".";
  }
});

refreshFromApi();
`;

const SERVER_INDEX = `import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createApiRouter } from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 5000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());
app.use("/api", createApiRouter());
app.use(express.static(path.join(__dirname, "../client")));

app.listen(port, () => {
  console.log(\`Website running at http://localhost:\${port}\`);
});
`;

const SERVER_API = `import { Router } from "express";
import { seed } from "../data/seed.js";

const submissions = [];

function routePath() {
  const endpoint = seed.form?.endpoint || "/api/submit";
  const trimmed = endpoint.replace(/^\\/api/, "");
  return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
}

export function createApiRouter() {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true, service: seed.site.title });
  });

  router.get("/site", (_req, res) => {
    res.json(seed.site);
  });

  router.get("/items", (_req, res) => {
    res.json(seed.items);
  });

  router.get(routePath(), (_req, res) => {
    res.json(submissions);
  });

  router.post(routePath(), (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const missing = (seed.form.fields || [])
      .filter((field) => field.required && !String(body[field.name] || "").trim())
      .map((field) => field.name);

    if (missing.length) {
      res.status(400).json({ error: "Missing required fields", fields: missing });
      return;
    }

    const entry = {
      id: Date.now().toString(36),
      ...body,
      createdAt: new Date().toISOString(),
    };
    submissions.push(entry);
    res.status(201).json({ ok: true, entry });
  });

  return router;
}
`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
