/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a React (Vite) client, an Express API, and a self-contained preview page.
 */

export type WebsiteKind = "landing" | "portfolio" | "blog" | "store" | "dashboard";

export interface WebsiteBlueprint {
  id: WebsiteKind;
  label: string;
  description: string;
  prompt: string;
}

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  kindLabel: string;
  title: string;
  tagline: string;
  endpoints: string[];
  files: GeneratedFile[];
}

interface Feature { title: string; detail: string }
interface Plan { name: string; price: string; detail: string }
interface Project { name: string; detail: string; image: string }
interface Post { slug: string; title: string; excerpt: string; body: string }
interface Product { id: string; name: string; price: number; detail: string; image: string }
interface Metric { label: string; value: string }
interface Activity { when: string; text: string }

interface SiteModel {
  kind: WebsiteKind;
  kindLabel: string;
  title: string;
  tagline: string;
  endpoints: string[];
  features: Feature[];
  plans: Plan[];
  projects: Project[];
  posts: Post[];
  products: Product[];
  metrics: Metric[];
  activity: Activity[];
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    id: "landing",
    label: "Landing",
    description: "Marketing page, pricing, and a lead API",
    prompt: "Build a full-stack marketing landing website",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Project gallery plus a contact API",
    prompt: "Build a full-stack portfolio website",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Articles with comments stored by the API",
    prompt: "Build a full-stack blog website",
  },
  {
    id: "store",
    label: "Store",
    description: "Product grid, cart, and an order API",
    prompt: "Build a full-stack storefront website",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Metrics, activity, and a notes API",
    prompt: "Build a full-stack dashboard website",
  },
];

const PHOTOS = {
  desk: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  team: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  travel: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  nature: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
};

export function detectWebsiteRequest(text: string): { kind: WebsiteKind; title: string } | null {
  const raw = text.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();

  const mentionsSite = /\b(website|web site|landing page|portfolio|storefront|e-?commerce|blog|dashboard)\b/.test(lower);
  const mentionsStack = /\b(full[\s-]?stack|mern)\b/.test(lower);
  const createVerb = /\b(generate|build|create|scaffold)\b/.test(lower);
  const generator = /\bwebsite generator\b/.test(lower);
  if (!(generator || (createVerb && (mentionsSite || mentionsStack)))) return null;

  const editIntent = /\b(navbar|button|color|css|bug|fix|debug|refactor|header|footer|font|margin|padding|section)\b/.test(lower);
  if (editIntent && !mentionsStack && !generator) return null;

  let kind: WebsiteKind = "landing";
  if (/\b(portfolio|personal site)\b/.test(lower)) kind = "portfolio";
  else if (/\bblog\b/.test(lower)) kind = "blog";
  else if (/\b(store|shop|storefront|e-?commerce)\b/.test(lower)) kind = "store";
  else if (/\b(dashboard|saas|analytics)\b/.test(lower)) kind = "dashboard";
  else if (/\b(landing|marketing|homepage)\b/.test(lower)) kind = "landing";

  return { kind, title: extractTitle(raw, kind) };
}

export function generateFullStackWebsite(kind: WebsiteKind, title?: string): GeneratedWebsite {
  const site = buildModel(kind, title?.trim() || defaultTitle(kind));
  return {
    kind: site.kind,
    kindLabel: site.kindLabel,
    title: site.title,
    tagline: site.tagline,
    endpoints: site.endpoints,
    files: [
      file("README.md", "markdown", readme(site)),
      file(".env.example", "plaintext", envExample()),
      file("package.json", "json", rootPackage(site)),
      file("server/package.json", "json", serverPackage(site)),
      file("server/index.js", "javascript", serverIndex(site)),
      file("server/src/store.js", "javascript", storeSource()),
      file("server/src/routes.js", "javascript", routesSource(site)),
      file("client/package.json", "json", clientPackage(site)),
      file("client/vite.config.js", "javascript", viteConfig()),
      file("client/index.html", "html", viteIndex(site)),
      file("client/src/main.jsx", "javascript", mainJsx()),
      file("client/src/api.js", "javascript", apiClient()),
      file("client/src/styles.css", "css", siteCss()),
      file("client/src/App.jsx", "javascript", reactApp(site)),
      file("preview.html", "html", previewHtml(site)),
    ],
  };
}

export function formatWebsiteAssistantMessage(site: GeneratedWebsite): string {
  const files = site.files.map((f) => `- \`${f.path}\``).join("\n");
  const endpoints = site.endpoints.map((e) => `- \`${e}\``).join("\n");
  return `**Full-stack website generator** loaded **${site.title}** (${site.kindLabel}) into the editor.

${site.tagline}

**preview.html** is open in the preview. The same site is a React client plus an Express API.

### Run it locally
\`\`\`bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
\`\`\`

The client calls \`VITE_API_URL\` (default \`http://localhost:4000\`). With no \`MONGODB_URI\`, the API keeps data in memory.

### API
${endpoints}

### Files
${files}`;
}

export interface GeneratorTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: GeneratorTreeNode[];
  isOpen?: boolean;
}

export function filesToTree(files: GeneratedFile[]): GeneratorTreeNode[] {
  const root: GeneratorTreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let level = root;
    let acc = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      acc = acc ? `${acc}/${part}` : part;
      const isFile = i === parts.length - 1;
      let node = level.find((n) => n.name === part);
      if (!node) {
        node = isFile
          ? { id: acc, name: part, type: "file", language: file.language, content: file.content }
          : { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        level.push(node);
      }
      if (!isFile) level = node.children ?? [];
    }
  }
  return root;
}

function file(path: string, language: string, content: string): GeneratedFile {
  return { path, language, content };
}

function buildModel(kind: WebsiteKind, title: string): SiteModel {
  const safeTitle = title.replace(/\s+/g, " ").trim().slice(0, 48) || defaultTitle(kind);
  const shared = {
    kind,
    kindLabel: WEBSITE_BLUEPRINTS.find((b) => b.id === kind)?.label ?? "Website",
    title: safeTitle,
    features: [] as Feature[],
    plans: [] as Plan[],
    projects: [] as Project[],
    posts: [] as Post[],
    products: [] as Product[],
    metrics: [] as Metric[],
    activity: [] as Activity[],
  };

  if (kind === "portfolio") {
    return {
      ...shared,
      tagline: "Selected work, a short bio, and a contact form backed by POST /api/messages.",
      endpoints: ["GET /api/health", "GET /api/projects", "POST /api/messages"],
      projects: [
        { name: "Harbor Atlas", detail: "A travel guide with saved routes and offline notes.", image: PHOTOS.travel },
        { name: "North Kitchen", detail: "Menu, reservations, and a kitchen ticket view.", image: PHOTOS.food },
        { name: "Field Study", detail: "Photo essays with long-form captions.", image: PHOTOS.nature },
      ],
    };
  }

  if (kind === "blog") {
    return {
      ...shared,
      tagline: "Three starter essays and a comment API keyed by post slug.",
      endpoints: ["GET /api/health", "GET /api/posts", "GET /api/posts/:slug", "POST /api/comments"],
      posts: [
        {
          slug: "ship-the-api-first",
          title: "Ship the API first",
          excerpt: "A small JSON API makes the UI honest about loading and errors.",
          body: "Start with one resource and one write endpoint. Return JSON errors your form can show. The React page in this project already falls back to starter posts when the API is offline.",
        },
        {
          slug: "pages-that-explain-themselves",
          title: "Pages that explain themselves",
          excerpt: "Headlines, one action, and type you can scan.",
          body: "Each section should answer what this is and what to do next. The preview page and the React client share that structure so you can compare static markup with component state.",
        },
        {
          slug: "memory-before-mongo",
          title: "Memory before Mongo",
          excerpt: "In-memory storage lets you run the server with only Node installed.",
          body: "server/src/store.js uses an array when MONGODB_URI is empty and the official MongoDB driver when it is set. The route handlers stay the same either way.",
        },
      ],
    };
  }

  if (kind === "store") {
    return {
      ...shared,
      tagline: "A small catalog, a cart in the browser, and POST /api/orders.",
      endpoints: ["GET /api/health", "GET /api/products", "POST /api/orders"],
      products: [
        { id: "mug", name: "Studio mug", price: 24, detail: "Speckled ceramic, 12oz.", image: PHOTOS.food },
        { id: "tote", name: "Field tote", price: 36, detail: "Heavy canvas with an interior pocket.", image: PHOTOS.shop },
        { id: "print", name: "Coast print", price: 48, detail: "Unframed photograph, edition of 50.", image: PHOTOS.nature },
        { id: "notebook", name: "Grid notebook", price: 18, detail: "96 pages, lay-flat binding.", image: PHOTOS.desk },
      ],
    };
  }

  if (kind === "dashboard") {
    return {
      ...shared,
      tagline: "Live-looking metrics, an activity table, and a notes API.",
      endpoints: ["GET /api/health", "GET /api/metrics", "GET /api/activity", "POST /api/notes"],
      metrics: [
        { label: "Visitors", value: "12,480" },
        { label: "Signups", value: "326" },
        { label: "Revenue", value: "$8,240" },
        { label: "Uptime", value: "99.9%" },
      ],
      activity: [
        { when: "2m ago", text: "New signup from Maya Chen" },
        { when: "18m ago", text: "Order #1042 paid" },
        { when: "1h ago", text: "Deploy finished on main" },
        { when: "3h ago", text: "Alert cleared: API latency" },
      ],
    };
  }

  return {
    ...shared,
    kindLabel: "Landing",
    tagline: "A marketing page with pricing and a lead form that posts to the API.",
    endpoints: ["GET /api/health", "GET /api/plans", "POST /api/leads"],
    features: [
      { title: "One page, real API", detail: "The form posts JSON to Express instead of disappearing into the browser." },
      { title: "Preview and source", detail: "preview.html renders immediately. client/src is the same site in React." },
      { title: "Optional MongoDB", detail: "Leave MONGODB_URI empty for an in-memory store, or point it at a database." },
    ],
    plans: [
      { name: "Starter", price: "$0", detail: "Preview, one page, in-memory leads." },
      { name: "Studio", price: "$29", detail: "Custom domain and saved leads." },
      { name: "Scale", price: "$79", detail: "Teams, roles, and a higher API limit." },
    ],
  };
}

function defaultTitle(kind: WebsiteKind): string {
  switch (kind) {
    case "portfolio": return "Studio North";
    case "blog": return "Field Notes";
    case "store": return "Harbor Goods";
    case "dashboard": return "Pulseboard";
    default: return "Northstar";
  }
}

function extractTitle(text: string, kind: WebsiteKind): string {
  const quoted = text.match(/["“]([^"”]{2,48})["”]/);
  if (quoted) return cleanTitle(quoted[1]);
  const named = text.match(/\b(?:called|named|titled)\s+([A-Za-z0-9][^,\n]{1,48})/i);
  if (named) {
    const trimmed = named[1].replace(/\b(website|site|app|using|with|mern|react|fullstack|full-stack)\b[\s\S]*$/i, "").trim();
    if (trimmed.length >= 2) return cleanTitle(trimmed);
  }
  return defaultTitle(kind);
}

function cleanTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 48);
}

function slug(title: string): string {
  const value = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return value || "lunor-site";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteCss(): string {
  return `:root {
  --bg: #0b1020;
  --card: #141a2e;
  --text: #e8eefc;
  --muted: #93a0bd;
  --line: #243049;
  --accent: #5eead4;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: radial-gradient(1000px 420px at 8% -10%, #1e293b, transparent), var(--bg); color: var(--text); }
a { color: inherit; text-decoration: none; }
.top { display: flex; justify-content: space-between; align-items: center; padding: 18px 7vw; position: sticky; top: 0; backdrop-filter: blur(12px); background: rgba(11, 16, 32, 0.8); border-bottom: 1px solid var(--line); }
.brand { font-weight: 700; letter-spacing: -0.03em; }
.brand span, .accent { color: var(--accent); }
nav { display: flex; gap: 18px; color: var(--muted); font-size: 14px; }
.hero, .wrap { padding: 56px 7vw 12px; max-width: 1100px; }
.hero h1, .wrap h1 { font-size: clamp(40px, 6vw, 64px); line-height: 0.95; margin: 0 0 12px; letter-spacing: -0.04em; }
.hero p, .lede { color: var(--muted); font-size: 18px; max-width: 640px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; padding: 24px 7vw 48px; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 18px; }
.card h3 { margin: 8px 0; }
.card p, .muted { color: var(--muted); }
.price { font-size: 28px; margin: 8px 0; }
.cover { width: 100%; height: 150px; object-fit: cover; border-radius: 12px; background: #1e293b; }
.form { display: grid; gap: 10px; max-width: 520px; }
input, textarea { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line); background: #0c1224; color: var(--text); font: inherit; }
button, .btn { background: var(--accent); color: #04221d; border: 0; border-radius: 999px; padding: 12px 18px; font-weight: 700; cursor: pointer; }
.note { color: var(--accent); min-height: 1.2em; padding: 0 7vw 24px; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); font-size: 14px; }
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 24px 7vw; }
.metric strong { display: block; font-size: 28px; margin-top: 6px; }
.layout { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
.side { border-right: 1px solid var(--line); padding: 24px 18px; }
footer { padding: 28px 7vw 48px; color: var(--muted); border-top: 1px solid var(--line); }
@media (max-width: 800px) {
  nav { display: none; }
  .layout { grid-template-columns: 1fr; }
  .side { border-right: 0; border-bottom: 1px solid var(--line); }
}
`;
}

function previewHtml(site: SiteModel): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(site.title)}</title>
  <style>${siteCss()}</style>
</head>
<body>
${previewBody(site)}
<script>
(function () {
  var note = document.querySelector("[data-note]");
  var form = document.querySelector("[data-form]");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      if (data.email && String(data.email).indexOf("@") === -1) {
        note.textContent = "Enter a valid email.";
        return;
      }
      note.textContent = "Saved in this preview. Run the API and submit the same form in the React app to store it at " + form.getAttribute("data-action") + ".";
      form.reset();
    });
  }
  var posts = document.getElementById("post-data");
  document.querySelectorAll("[data-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      var slug = button.getAttribute("data-open");
      var list = posts ? JSON.parse(posts.textContent) : [];
      var post = list.find(function (item) { return item.slug === slug; });
      var reader = document.querySelector("[data-reader]");
      if (reader && post) {
        reader.innerHTML = "<h2>" + post.title + "</h2><p>" + post.body + "</p>";
      }
    });
  });
  var cart = document.querySelector("[data-cart]");
  document.querySelectorAll("[data-add]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!cart) return;
      var row = document.createElement("li");
      row.textContent = button.getAttribute("data-add") + " — $" + button.getAttribute("data-price");
      cart.appendChild(row);
    });
  });
})();
</script>
</body>
</html>
`;
}

function previewBody(site: SiteModel): string {
  const brand = `<header class="top"><div class="brand">${escapeHtml(site.title)} <span>·</span></div><nav><a href="#work">Work</a><a href="#contact">Contact</a></nav></header>`;
  if (site.kind === "portfolio") {
    const cards = site.projects.map((project) => `<article class="card"><img class="cover" alt="" src="${project.image}" /><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.detail)}</p></article>`).join("");
    return `${brand}
<main>
  <section class="hero"><p class="accent">Portfolio</p><h1>${escapeHtml(site.title)}</h1><p>${escapeHtml(site.tagline)}</p></section>
  <section id="work" class="grid">${cards}</section>
  ${contactForm("POST /api/messages", "Tell me about the project")}
</main>
<footer>React source: client/src/App.jsx · API: server/src/routes.js</footer>`;
  }
  if (site.kind === "blog") {
    const cards = site.posts.map((post) => `<article class="card"><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p><button type="button" data-open="${escapeHtml(post.slug)}">Read</button></article>`).join("");
    return `${brand}
<main>
  <section class="hero"><p class="accent">Blog</p><h1>${escapeHtml(site.title)}</h1><p>${escapeHtml(site.tagline)}</p></section>
  <section id="work" class="grid">${cards}</section>
  <section class="wrap"><div class="card" data-reader><p class="muted">Choose an essay to read it here.</p></div></section>
  ${contactForm("POST /api/comments", "Leave a comment")}
  <script type="application/json" id="post-data">${JSON.stringify(site.posts).replace(/</g, "\\u003c")}</script>
</main>
<footer>Comments persist when the Express API is running.</footer>`;
  }
  if (site.kind === "store") {
    const cards = site.products.map((product) => `<article class="card"><img class="cover" alt="" src="${product.image}" /><h3>${escapeHtml(product.name)}</h3><p class="price">$${product.price}</p><p>${escapeHtml(product.detail)}</p><button type="button" data-add="${escapeHtml(product.name)}" data-price="${product.price}">Add to cart</button></article>`).join("");
    return `${brand}
<main>
  <section class="hero"><p class="accent">Store</p><h1>${escapeHtml(site.title)}</h1><p>${escapeHtml(site.tagline)}</p></section>
  <section id="work" class="grid">${cards}</section>
  <section class="wrap"><div class="card"><h3>Cart</h3><ul data-cart></ul></div></section>
  ${contactForm("POST /api/orders", "Checkout details")}
</main>
<footer>The React cart submits line items to POST /api/orders.</footer>`;
  }
  if (site.kind === "dashboard") {
    const metrics = site.metrics.map((metric) => `<article class="card metric"><span class="muted">${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong></article>`).join("");
    const rows = site.activity.map((item) => `<tr><td>${escapeHtml(item.when)}</td><td>${escapeHtml(item.text)}</td></tr>`).join("");
    return `<div class="layout">
  <aside class="side"><div class="brand">${escapeHtml(site.title)}</div><p class="muted">Overview</p><p class="muted">Activity</p><p class="muted">Notes</p></aside>
  <div>
    <section class="hero"><p class="accent">Dashboard</p><h1>Today</h1><p>${escapeHtml(site.tagline)}</p></section>
    <section class="metrics">${metrics}</section>
    <section class="wrap"><table><thead><tr><th>When</th><th>Activity</th></tr></thead><tbody>${rows}</tbody></table></section>
    ${contactForm("POST /api/notes", "Add a note")}
  </div>
</div>`;
  }
  const features = site.features.map((feature) => `<article class="card"><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.detail)}</p></article>`).join("");
  const plans = site.plans.map((plan) => `<article class="card"><h3>${escapeHtml(plan.name)}</h3><p class="price">${escapeHtml(plan.price)}</p><p>${escapeHtml(plan.detail)}</p></article>`).join("");
  return `${brand}
<main>
  <section class="hero"><p class="accent">Landing</p><h1>${escapeHtml(site.title)}</h1><p>${escapeHtml(site.tagline)}</p></section>
  <section id="work" class="grid">${features}</section>
  <section class="grid">${plans}</section>
  ${contactForm("POST /api/leads", "Request a walkthrough")}
</main>
<footer><img class="cover" alt="" src="${PHOTOS.team}" style="height:180px;margin-bottom:16px" /> Generated by the Lunor.AI website automation.</footer>`;
}

function contactForm(action: string, label: string): string {
  return `<section id="contact" class="wrap">
  <h2>${escapeHtml(label)}</h2>
  <form class="form card" data-form data-action="${escapeHtml(action)}">
    <input name="name" placeholder="Name" required />
    <input name="email" type="email" placeholder="Email" required />
    <textarea name="message" rows="4" placeholder="Message"></textarea>
    <button type="submit">Send</button>
  </form>
  <p class="note" data-note></p>
</section>`;
}

function reactApp(site: SiteModel): string {
  const seed = JSON.stringify(clientSeed(site), null, 2);
  return `import { useEffect, useState } from "react";
import { api } from "./api";
import "./styles.css";

const TITLE = ${JSON.stringify(site.title)};
const KIND = ${JSON.stringify(site.kind)};
const SEED = ${seed};

export default function App() {
  const [data, setData] = useState(SEED);
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState({ name: "", email: "", message: "" });
  const [cart, setCart] = useState([]);
  const [activePost, setActivePost] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.load(KIND)
      .then((next) => {
        if (!cancelled && next) setData((current) => ({ ...current, ...next }));
      })
      .catch(() => {
        if (!cancelled) setNote("API offline — showing starter data from this project.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const payload = KIND === "store" ? { ...draft, items: cart } : draft;
      await api.submit(KIND, payload);
      setNote("Saved by the API.");
      setDraft({ name: "", email: "", message: "" });
      if (KIND === "store") setCart([]);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not reach the API.");
    }
  }

  return (
    <div className="site">
      ${reactMarkup(site)}
      {note ? <p className="note">{note}</p> : null}
    </div>
  );
}
`;
}

function clientSeed(site: SiteModel) {
  return {
    features: site.features,
    plans: site.plans,
    projects: site.projects,
    posts: site.posts,
    products: site.products,
    metrics: site.metrics,
    activity: site.activity,
  };
}

function reactMarkup(site: SiteModel): string {
  const header = `<header className="top"><div className="brand">{TITLE}</div><nav><a href="#work">Work</a><a href="#contact">Contact</a></nav></header>`;
  const form = `<section id="contact" className="wrap">
        <form className="form card" onSubmit={onSubmit}>
          <input placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
          <input type="email" placeholder="Email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} required />
          <textarea rows={4} placeholder="Message" value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} />
          <button type="submit">Send</button>
        </form>
      </section>`;

  if (site.kind === "portfolio") {
    return `${header}
      <section className="hero"><p className="accent">Portfolio</p><h1>{TITLE}</h1><p>{${JSON.stringify(site.tagline)}}</p></section>
      <section id="work" className="grid">
        {data.projects.map((project) => (
          <article className="card" key={project.name}>
            <img className="cover" alt="" src={project.image} />
            <h3>{project.name}</h3>
            <p>{project.detail}</p>
          </article>
        ))}
      </section>
      ${form}`;
  }
  if (site.kind === "blog") {
    return `${header}
      <section className="hero"><p className="accent">Blog</p><h1>{TITLE}</h1><p>{${JSON.stringify(site.tagline)}}</p></section>
      <section id="work" className="grid">
        {data.posts.map((post) => (
          <article className="card" key={post.slug}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <button type="button" onClick={() => setActivePost(post)}>Read</button>
          </article>
        ))}
      </section>
      <section className="wrap"><article className="card">{activePost ? (<><h2>{activePost.title}</h2><p>{activePost.body}</p></>) : <p className="muted">Choose an essay.</p>}</article></section>
      ${form}`;
  }
  if (site.kind === "store") {
    return `${header}
      <section className="hero"><p className="accent">Store</p><h1>{TITLE}</h1><p>{${JSON.stringify(site.tagline)}}</p></section>
      <section id="work" className="grid">
        {data.products.map((product) => (
          <article className="card" key={product.id}>
            <img className="cover" alt="" src={product.image} />
            <h3>{product.name}</h3>
            <p className="price">\${product.price}</p>
            <p>{product.detail}</p>
            <button type="button" onClick={() => setCart((current) => [...current, { id: product.id, name: product.name, price: product.price, qty: 1 }])}>Add to cart</button>
          </article>
        ))}
      </section>
      <section className="wrap"><article className="card"><h3>Cart</h3><ul>{cart.map((item, index) => <li key={index}>{item.name} — \${item.price}</li>)}</ul></article></section>
      ${form}`;
  }
  if (site.kind === "dashboard") {
    return `<div className="layout">
        <aside className="side"><div className="brand">{TITLE}</div><p className="muted">Overview</p></aside>
        <div>
          <section className="hero"><p className="accent">Dashboard</p><h1>Today</h1><p>{${JSON.stringify(site.tagline)}}</p></section>
          <section className="metrics">
            {data.metrics.map((metric) => (
              <article className="card metric" key={metric.label}><span className="muted">{metric.label}</span><strong>{metric.value}</strong></article>
            ))}
          </section>
          <section className="wrap">
            <table><thead><tr><th>When</th><th>Activity</th></tr></thead><tbody>
              {data.activity.map((item) => <tr key={item.text}><td>{item.when}</td><td>{item.text}</td></tr>)}
            </tbody></table>
          </section>
          ${form}
        </div>
      </div>`;
  }
  return `${header}
      <section className="hero"><p className="accent">Landing</p><h1>{TITLE}</h1><p>{${JSON.stringify(site.tagline)}}</p></section>
      <section id="work" className="grid">
        {data.features.map((feature) => (
          <article className="card" key={feature.title}><h3>{feature.title}</h3><p>{feature.detail}</p></article>
        ))}
      </section>
      <section className="grid">
        {data.plans.map((plan) => (
          <article className="card" key={plan.name}><h3>{plan.name}</h3><p className="price">{plan.price}</p><p>{plan.detail}</p></article>
        ))}
      </section>
      ${form}`;
}

function apiClient(): string {
  return `const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "API " + response.status);
  return body;
}

const LOAD = {
  landing: async () => {
    const body = await readJson(await fetch(BASE + "/api/plans"));
    return { plans: body.plans };
  },
  portfolio: async () => {
    const body = await readJson(await fetch(BASE + "/api/projects"));
    return { projects: body.projects };
  },
  blog: async () => {
    const body = await readJson(await fetch(BASE + "/api/posts"));
    return { posts: body.posts };
  },
  store: async () => {
    const body = await readJson(await fetch(BASE + "/api/products"));
    return { products: body.products };
  },
  dashboard: async () => {
    const metrics = await readJson(await fetch(BASE + "/api/metrics"));
    const activity = await readJson(await fetch(BASE + "/api/activity"));
    return { metrics: metrics.metrics, activity: activity.activity };
  },
};

const WRITE = {
  landing: "/api/leads",
  portfolio: "/api/messages",
  blog: "/api/comments",
  store: "/api/orders",
  dashboard: "/api/notes",
};

export const api = {
  load(kind) {
    return LOAD[kind]();
  },
  async submit(kind, payload) {
    if (payload.email && !String(payload.email).includes("@")) {
      throw new Error("Enter a valid email.");
    }
    return readJson(await fetch(BASE + WRITE[kind], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }));
  },
};
`;
}

function serverIndex(site: SiteModel): string {
  return `const express = require("express");
const cors = require("cors");
const { register } = require("./src/routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", function (_req, res) {
  res.json({ ok: true, service: ${JSON.stringify(site.title)} });
});

register(app);

app.use(function (error, _req, res, _next) {
  console.error(error);
  res.status(500).json({ error: "Server error" });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, function () {
  console.log("API listening on http://localhost:" + port);
});
`;
}

function storeSource(): string {
  return `const memory = {};
let databasePromise;

function database() {
  if (!databasePromise) {
    databasePromise = connect().catch(function (error) {
      console.warn("MongoDB unavailable, using in-memory store.", error.message);
      return null;
    });
  }
  return databasePromise;
}

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  const { MongoClient } = require("mongodb");
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(process.env.MONGODB_DB || "lunor_sites");
}

async function getCollection(name) {
  const db = await database();
  if (!db) {
    if (!memory[name]) memory[name] = [];
    return {
      async find() {
        return memory[name].slice();
      },
      async insert(doc) {
        memory[name].push(doc);
        return doc;
      },
    };
  }
  const collection = db.collection(name);
  return {
    async find() {
      return collection.find({}).toArray();
    },
    async insert(doc) {
      await collection.insertOne(doc);
      return doc;
    },
  };
}

module.exports = { getCollection };
`;
}

function routesSource(site: SiteModel): string {
  const data = JSON.stringify({
    plans: site.plans,
    projects: site.projects,
    posts: site.posts,
    products: site.products,
    metrics: site.metrics,
    activity: site.activity,
  }, null, 2);

  return `const { getCollection } = require("./store");

const DATA = ${data};

function bad(res, message) {
  res.status(400).json({ error: message });
}

function requireEmail(body, res) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  if (!name || email.indexOf("@") === -1) {
    bad(res, "Name and a valid email are required.");
    return null;
  }
  return { name: name, email: email, message: message };
}

function register(app) {
  app.get("/api/plans", function (_req, res) {
    res.json({ plans: DATA.plans });
  });

  app.get("/api/projects", function (_req, res) {
    res.json({ projects: DATA.projects });
  });

  app.get("/api/posts", function (_req, res) {
    res.json({ posts: DATA.posts });
  });

  app.get("/api/posts/:slug", function (req, res) {
    const post = DATA.posts.find(function (item) { return item.slug === req.params.slug; });
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json({ post: post });
  });

  app.get("/api/products", function (_req, res) {
    res.json({ products: DATA.products });
  });

  app.get("/api/metrics", function (_req, res) {
    res.json({ metrics: DATA.metrics });
  });

  app.get("/api/activity", function (_req, res) {
    res.json({ activity: DATA.activity });
  });

  app.post("/api/leads", async function (req, res) {
    const fields = requireEmail(req.body || {}, res);
    if (!fields) return;
    const leads = await getCollection("leads");
    const lead = Object.assign({ id: Date.now().toString(36), createdAt: new Date().toISOString() }, fields);
    await leads.insert(lead);
    res.status(201).json({ lead: lead });
  });

  app.post("/api/messages", async function (req, res) {
    const fields = requireEmail(req.body || {}, res);
    if (!fields) return;
    const messages = await getCollection("messages");
    const message = Object.assign({ id: Date.now().toString(36), createdAt: new Date().toISOString() }, fields);
    await messages.insert(message);
    res.status(201).json({ message: message });
  });

  app.post("/api/comments", async function (req, res) {
    const fields = requireEmail(req.body || {}, res);
    if (!fields) return;
    const comments = await getCollection("comments");
    const comment = Object.assign({ id: Date.now().toString(36), postSlug: String((req.body || {}).postSlug || ""), createdAt: new Date().toISOString() }, fields);
    await comments.insert(comment);
    res.status(201).json({ comment: comment });
  });

  app.post("/api/orders", async function (req, res) {
    const fields = requireEmail(req.body || {}, res);
    if (!fields) return;
    const items = Array.isArray((req.body || {}).items) ? req.body.items : [];
    const orders = await getCollection("orders");
    const order = Object.assign({ id: Date.now().toString(36), items: items, createdAt: new Date().toISOString() }, fields);
    await orders.insert(order);
    res.status(201).json({ order: order });
  });

  app.post("/api/notes", async function (req, res) {
    const fields = requireEmail(req.body || {}, res);
    if (!fields) return;
    const notes = await getCollection("notes");
    const note = Object.assign({ id: Date.now().toString(36), createdAt: new Date().toISOString() }, fields);
    await notes.insert(note);
    res.status(201).json({ note: note });
  });
}

module.exports = { register };
`;
}

function readme(site: SiteModel): string {
  return `# ${site.title}

${site.tagline}

This project was generated by the Lunor.AI full-stack website automation in the Web Development assistant.

## Stack

- \`client/\` — React 18 + Vite
- \`server/\` — Express API
- \`preview.html\` — the same page with no build step
- MongoDB is optional. Without \`MONGODB_URI\` the API stores documents in memory.

## Run

\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

In a second terminal:

\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

Open the Vite URL. The client reads \`VITE_API_URL\` and defaults to \`http://localhost:4000\`.

## API

${site.endpoints.map((endpoint) => `- \`${endpoint}\``).join("\n")}
`;
}

function envExample(): string {
  return `PORT=4000
MONGODB_URI=
MONGODB_DB=lunor_sites
VITE_API_URL=http://localhost:4000
`;
}

function rootPackage(site: SiteModel): string {
  return JSON.stringify({
    name: slug(site.title),
    private: true,
    scripts: {
      "dev:server": "npm --prefix server run dev",
      "dev:client": "npm --prefix client run dev",
    },
  }, null, 2) + "\n";
}

function serverPackage(site: SiteModel): string {
  return JSON.stringify({
    name: `${slug(site.title)}-server`,
    private: true,
    main: "index.js",
    scripts: {
      start: "node index.js",
      dev: "node index.js",
    },
    dependencies: {
      cors: "^2.8.5",
      express: "^4.21.2",
      mongodb: "^6.12.0",
    },
  }, null, 2) + "\n";
}

function clientPackage(site: SiteModel): string {
  return JSON.stringify({
    name: `${slug(site.title)}-client`,
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.3.4",
      vite: "^5.4.19",
    },
  }, null, 2) + "\n";
}

function viteConfig(): string {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
`;
}

function viteIndex(site: SiteModel): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(site.title)}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`;
}

function mainJsx(): string {
  return `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}
