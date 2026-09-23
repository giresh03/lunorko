/**
 * Full-stack website generator for the Web Development AI assistant.
 * Emits a browser-previewable client (HTML/CSS/JS) and an Express + MongoDB API
 * that serves the same routes the page calls.
 */

export type WebsiteKind = "portfolio" | "saas" | "restaurant" | "store";

export interface ProjectFile {
  path: string;
  language: string;
  content: string;
}

export interface EditorFileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: EditorFileNode[];
  isOpen?: boolean;
}

export interface WebsiteKindInfo {
  id: WebsiteKind;
  label: string;
  description: string;
  icon: string;
  defaultName: string;
}

export interface GeneratedWebsite {
  kind: WebsiteKind;
  name: string;
  slug: string;
  summary: string;
  runCommands: string;
  files: ProjectFile[];
}

interface SeedItem {
  title: string;
  detail: string;
  meta: string;
  image: string;
}

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "number" | "date";
  placeholder: string;
  required: boolean;
}

interface Blueprint {
  info: WebsiteKindInfo;
  accent: string;
  accent2: string;
  kicker: string;
  headline: string;
  lede: string;
  heroImage: string;
  listTitle: string;
  listKey: string;
  formTitle: string;
  formKey: string;
  formNote: string;
  points: { title: string; detail: string }[];
  items: SeedItem[];
  fields: FormField[];
}

const unsplash = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

const BLUEPRINTS: Record<WebsiteKind, Blueprint> = {
  portfolio: {
    info: {
      id: "portfolio",
      label: "Portfolio",
      description: "Projects, about, and a contact API",
      icon: "✦",
      defaultName: "Northstar Studio",
    },
    accent: "#8b7cff",
    accent2: "#3ee0b0",
    kicker: "Selected work",
    headline: "Design and engineering for teams who ship.",
    lede: "A studio site with a project catalog and a contact form backed by an Express API.",
    heroImage: unsplash("1498050108023-c5249f4df085", 1600, 900),
    listTitle: "Projects",
    listKey: "projects",
    formTitle: "Start a project",
    formKey: "messages",
    formNote: "Messages are stored by POST /api/messages.",
    points: [
      { title: "Product design", detail: "Interfaces with a clear hierarchy and room to breathe." },
      { title: "Web engineering", detail: "Fast pages, accessible markup, and a small API." },
      { title: "Launch support", detail: "From first sketch to a site you can run locally." },
    ],
    items: [
      { title: "Harbor Analytics", detail: "Dashboard for a logistics team. Dark UI, live filters, weekly digest.", meta: "Product", image: unsplash("1551288049-bebda4e38f71") },
      { title: "Field Notes", detail: "Editorial magazine with long-form reading and a quiet type system.", meta: "Editorial", image: unsplash("1455390582262-044cdead277a") },
      { title: "Lumen Pay", detail: "Marketing site and signup flow for a payments startup.", meta: "Marketing", image: unsplash("1556742049-0cfed4f6a45d") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Ada Lovelace", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "ada@studio.dev", required: true },
      { name: "message", label: "Project", type: "textarea", placeholder: "What are you building?", required: true },
    ],
  },
  saas: {
    info: {
      id: "saas",
      label: "SaaS",
      description: "Landing page, pricing, and a leads API",
      icon: "◈",
      defaultName: "Lumen",
    },
    accent: "#5eead4",
    accent2: "#818cf8",
    kicker: "Product",
    headline: "Ship the weekly update without the status-meeting spiral.",
    lede: "A SaaS landing page with pricing cards loaded from the API and a lead capture form.",
    heroImage: unsplash("1553877522-43269d4ea984", 1600, 900),
    listTitle: "Plans",
    listKey: "plans",
    formTitle: "Request a walkthrough",
    formKey: "leads",
    formNote: "Leads are stored by POST /api/leads.",
    points: [
      { title: "Shared timeline", detail: "One place for what shipped, what slipped, and what is next." },
      { title: "Calm alerts", detail: "Notify the people who can act, not the entire company." },
      { title: "Works offline in preview", detail: "The page renders sample plans until the API is running." },
    ],
    items: [
      { title: "Starter", detail: "3 seats, weekly digest, public roadmap.", meta: "$0", image: unsplash("1460925895917-afdab827c52f") },
      { title: "Team", detail: "Unlimited seats, Slack digest, custom statuses.", meta: "$29", image: unsplash("1552664730-d307ca884978") },
      { title: "Scale", detail: "SSO, audit log, and a shared success manager.", meta: "$99", image: unsplash("1542744173-8e7e91415657") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Grace Hopper", required: true },
      { name: "email", label: "Work email", type: "email", placeholder: "grace@lumen.dev", required: true },
      { name: "company", label: "Company", type: "text", placeholder: "Lumen", required: true },
    ],
  },
  restaurant: {
    info: {
      id: "restaurant",
      label: "Restaurant",
      description: "Menu catalog and reservation API",
      icon: "☾",
      defaultName: "Hearth",
    },
    accent: "#e7b56a",
    accent2: "#f3e6d0",
    kicker: "Dinner",
    headline: "Wood fire, a short menu, and a table when you want one.",
    lede: "A restaurant site whose menu comes from GET /api/menu and whose reservations post to the API.",
    heroImage: unsplash("1414235077428-338989a2e8c0", 1600, 900),
    listTitle: "Menu",
    listKey: "menu",
    formTitle: "Reserve a table",
    formKey: "reservations",
    formNote: "Reservations are stored by POST /api/reservations.",
    points: [
      { title: "Evening service", detail: "Wednesday to Sunday, from five until the fire goes out." },
      { title: "Market menu", detail: "A handful of dishes. The list updates from the API." },
      { title: "Small room", detail: "Twenty-eight seats. Book ahead on weekends." },
    ],
    items: [
      { title: "Charred leeks", detail: "Brown butter, hazelnut, lemon thyme.", meta: "12", image: unsplash("1476224203421-9ac39bcb3327") },
      { title: "Wood-fired trout", detail: "Fennel, orange, and a green sauce.", meta: "28", image: unsplash("1504674900247-0877df9cc836") },
      { title: "Olive oil cake", detail: "Citrus, crème fraîche, sea salt.", meta: "11", image: unsplash("1565299624946-b28f40a0ae38") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Your name", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "you@email.com", required: true },
      { name: "date", label: "Date", type: "date", placeholder: "", required: true },
      { name: "guests", label: "Guests", type: "number", placeholder: "2", required: true },
    ],
  },
  store: {
    info: {
      id: "store",
      label: "Store",
      description: "Product grid and checkout API",
      icon: "▢",
      defaultName: "Field & Co",
    },
    accent: "#34d399",
    accent2: "#a7f3d0",
    kicker: "Shop",
    headline: "Objects for the kitchen, the desk, and the weekend bag.",
    lede: "A storefront that lists products from the API and posts orders to POST /api/orders.",
    heroImage: unsplash("1441986300917-64674bd600d8", 1600, 900),
    listTitle: "Goods",
    listKey: "products",
    formTitle: "Place an order",
    formKey: "orders",
    formNote: "Orders are stored by POST /api/orders. This demo does not charge a card.",
    points: [
      { title: "Made in small runs", detail: "Each piece is listed with a plain description and a price." },
      { title: "Ships in two days", detail: "Orders land in the API and can be reviewed in the server log." },
      { title: "Preview without a server", detail: "The grid uses sample products until MongoDB is connected." },
    ],
    items: [
      { title: "Stoneware mug", detail: "Speckled clay, holds 300ml, dishwasher safe.", meta: "$32", image: unsplash("1514228742587-6b1558fcca3d") },
      { title: "Linen apron", detail: "Undyed flax with a crossed back.", meta: "$68", image: unsplash("1483985988355-763728e1935b") },
      { title: "Brass opener", detail: "A heavy bottle opener that stays on the counter.", meta: "$24", image: unsplash("1472851294608-062f824d29cc") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Your name", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "you@email.com", required: true },
      { name: "item", label: "Item", type: "select", placeholder: "Choose an item", required: true },
      { name: "quantity", label: "Quantity", type: "number", placeholder: "1", required: true },
    ],
  },
  blog: {
    info: {
      id: "blog",
      label: "Blog",
      description: "Article list and a comment API",
      icon: "✎",
      defaultName: "Margin Notes",
    },
    accent: "#f0abfc",
    accent2: "#e9d5ff",
    kicker: "Journal",
    headline: "Short essays on making software that people can finish.",
    lede: "A blog whose articles come from the API and whose comments post back to the server.",
    heroImage: unsplash("1455390582262-044cdead277a", 1600, 900),
    listTitle: "Articles",
    listKey: "posts",
    formTitle: "Leave a comment",
    formKey: "comments",
    formNote: "Comments are stored by POST /api/comments.",
    points: [
      { title: "One idea a week", detail: "Essays stay short enough to read on a commute." },
      { title: "From the API", detail: "The list is GET /api/posts, with sample essays until the server is up." },
      { title: "Quiet comments", detail: "A name, an email, and a note. Nothing else." },
    ],
    items: [
      { title: "Ship the small version", detail: "A page people can use beats a diagram of the page you meant to build.", meta: "Essay", image: unsplash("1498050108023-c5249f4df085") },
      { title: "Name the API after the page", detail: "If the button says Reserve, the route should say reservations.", meta: "API", image: unsplash("1517694712202-14dd9538aa97") },
      { title: "Write the empty state first", detail: "Sample data is how a preview stays honest before the database exists.", meta: "Preview", image: unsplash("1481627834876-b7833e8f5570") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Your name", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "you@email.com", required: true },
      { name: "comment", label: "Comment", type: "textarea", placeholder: "What did you notice?", required: true },
    ],
  },
  dashboard: {
    info: {
      id: "dashboard",
      label: "Dashboard",
      description: "Metrics list and a report API",
      icon: "▦",
      defaultName: "Harbor",
    },
    accent: "#7dd3fc",
    accent2: "#bae6fd",
    kicker: "Overview",
    headline: "The numbers for this week, without a second tool.",
    lede: "A dashboard that loads metrics from the API and accepts a short report.",
    heroImage: unsplash("1551288049-bebda4e38f71", 1600, 900),
    listTitle: "Metrics",
    listKey: "metrics",
    formTitle: "File a report",
    formKey: "reports",
    formNote: "Reports are stored by POST /api/reports.",
    points: [
      { title: "Three numbers", detail: "Signups, active work, and what is waiting. No vanity charts." },
      { title: "Same data in the API", detail: "GET /api/metrics returns the cards you see here." },
      { title: "A place to write it down", detail: "The report form posts to the server, or to this browser if the API is offline." },
    ],
    items: [
      { title: "New signups", detail: "People who finished the form this week.", meta: "128", image: unsplash("1460925895917-afdab827c52f") },
      { title: "Open work", detail: "Items still in progress across the team.", meta: "14", image: unsplash("1552664730-d307ca884978") },
      { title: "Waiting on review", detail: "Reports filed and not yet read.", meta: "6", image: unsplash("1542744173-8e7e91415657") },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Your name", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "you@harbor.dev", required: true },
      { name: "report", label: "Report", type: "textarea", placeholder: "What changed this week?", required: true },
    ],
  },
};

export const WEBSITE_KINDS: WebsiteKindInfo[] = Object.values(BLUEPRINTS).map((b) => b.info);

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function slugify(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "website";
}

export function isBrowserPreviewScript(name: string, content: string): boolean {
  if (/(^|\/)server\//.test(name) || name.startsWith("server")) return false;
  return !/\b(require\s*\(|module\.exports|process\.env|from\s+["']express["']|MongoClient|createServer\s*\()/.test(content);
}

function stylesheet(accent: string, accent2: string): string {
  return `:root {
  --bg: #0c0f14;
  --bg-raise: #151a22;
  --text: #f4f1ea;
  --muted: #b7b1a6;
  --line: rgba(255,255,255,0.08);
  --accent: ${accent};
  --accent-2: ${accent2};
  --shadow: 0 24px 60px rgba(0,0,0,0.35);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Outfit", "Segoe UI", sans-serif;
  background:
    radial-gradient(900px 420px at 80% -10%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; color: inherit; }
.wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.nav {
  position: sticky; top: 0; z-index: 5;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0; backdrop-filter: blur(16px);
}
.brand { font-weight: 700; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 18px; align-items: center; color: var(--muted); }
.nav-toggle { display: none; background: transparent; border: 1px solid var(--line); border-radius: 999px; padding: 8px 12px; }
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  border: 0; border-radius: 999px; padding: 12px 18px; cursor: pointer;
  background: var(--accent); color: #0c0f14; font-weight: 600;
}
.btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--line); }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px; align-items: center; padding: 28px 0 64px; }
.kicker { color: var(--accent); letter-spacing: 0.16em; text-transform: uppercase; font-size: 12px; font-weight: 600; }
h1 { font-size: clamp(40px, 6vw, 68px); line-height: 0.95; letter-spacing: -0.045em; margin: 10px 0 16px; }
.lede { color: var(--muted); font-size: 18px; max-width: 46ch; }
.hero-actions { display: flex; gap: 10px; margin-top: 22px; flex-wrap: wrap; }
.hero-photo { border-radius: 28px; min-height: 360px; background-size: cover; background-position: center; box-shadow: var(--shadow); }
.points, .catalog { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.point, .card {
  background: var(--bg-raise); border: 1px solid var(--line); border-radius: 20px; padding: 18px;
}
.point h3, .card h3 { margin: 8px 0 6px; letter-spacing: -0.03em; }
.point p, .card p { margin: 0; color: var(--muted); }
.meta { color: var(--accent-2); font-size: 13px; font-weight: 600; }
.card img { height: 180px; width: 100%; object-fit: cover; border-radius: 14px; }
section { padding: 28px 0 56px; }
.section-head { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 18px; }
h2 { margin: 0; font-size: 32px; letter-spacing: -0.04em; }
.panel {
  display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 24px;
  background: var(--bg-raise); border: 1px solid var(--line); border-radius: 28px; padding: 24px;
}
label { display: grid; gap: 6px; font-size: 13px; color: var(--muted); }
input, textarea, select {
  width: 100%; border-radius: 12px; border: 1px solid var(--line); background: #0c0f14; padding: 12px 14px;
}
textarea { min-height: 110px; resize: vertical; }
.form-grid { display: grid; gap: 12px; }
.status { min-height: 1.2em; color: var(--accent-2); font-size: 14px; }
footer { border-top: 1px solid var(--line); padding: 22px 0 40px; color: var(--muted); display: flex; justify-content: space-between; gap: 12px; }
@media (max-width: 800px) {
  .hero, .points, .catalog, .panel { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  .nav-links { display: none; position: absolute; top: 64px; right: 16px; flex-direction: column; background: var(--bg-raise); padding: 14px; border-radius: 16px; border: 1px solid var(--line); }
  .nav-links.open { display: flex; }
}
`;
}

function fieldMarkup(field: FormField): string {
  const required = field.required ? " required" : "";
  if (field.type === "textarea") {
    return `<label>${escapeHtml(field.label)}<textarea name="${field.name}" placeholder="${escapeHtml(field.placeholder)}"${required}></textarea></label>`;
  }
  if (field.type === "select") {
    return `<label>${escapeHtml(field.label)}<select name="${field.name}" data-item-select${required}><option value="">${escapeHtml(field.placeholder)}</option></select></label>`;
  }
  return `<label>${escapeHtml(field.label)}<input name="${field.name}" type="${field.type}" placeholder="${escapeHtml(field.placeholder)}"${required} /></label>`;
}

function clientHtml(name: string, blueprint: Blueprint): string {
  const safe = escapeHtml(name);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safe}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="true">
  <header class="wrap">
    <nav class="nav">
      <a class="brand" href="#top">${safe}</a>
      <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
      <div class="nav-links" id="nav-links">
        <a href="#work">${escapeHtml(blueprint.listTitle)}</a>
        <a href="#contact">${escapeHtml(blueprint.formTitle)}</a>
        <a class="btn" href="#contact">Get started</a>
      </div>
    </nav>
    <div class="hero" id="top">
      <div>
        <p class="kicker">${escapeHtml(blueprint.kicker)}</p>
        <h1>${escapeHtml(blueprint.headline)}</h1>
        <p class="lede">${escapeHtml(blueprint.lede)}</p>
        <div class="hero-actions">
          <a class="btn" href="#work">View ${escapeHtml(blueprint.listTitle.toLowerCase())}</a>
          <a class="btn ghost" href="#contact">${escapeHtml(blueprint.formTitle)}</a>
        </div>
      </div>
      <div class="hero-photo" role="img" aria-label="${safe}" style="background-image:url('${blueprint.heroImage}')"></div>
    </div>
  </header>
  <main>
    <section class="wrap">
      <div class="points">
        ${blueprint.points.map((p) => `<article class="point"><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.detail)}</p></article>`).join("\n        ")}
      </div>
    </section>
    <section class="wrap" id="work">
      <div class="section-head">
        <h2>${escapeHtml(blueprint.listTitle)}</h2>
        <p class="status">Loaded from /api/${blueprint.listKey}</p>
      </div>
      <div class="catalog" id="catalog"></div>
    </section>
    <section class="wrap" id="contact">
      <div class="panel">
        <div>
          <p class="kicker">API</p>
          <h2>${escapeHtml(blueprint.formTitle)}</h2>
          <p class="lede">${escapeHtml(blueprint.formNote)}</p>
        </div>
        <form id="site-form" class="form-grid">
          ${blueprint.fields.map(fieldMarkup).join("\n          ")}
          <button class="btn" type="submit">Send</button>
          <p class="status" id="form-status" role="status"></p>
        </form>
      </div>
    </section>
  </main>
  <footer class="wrap">
    <span>${safe}</span>
    <span>Full-stack preview · Express API on port 5000</span>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function clientScript(blueprint: Blueprint): string {
  const config = {
    listUrl: `/api/${blueprint.listKey}`,
    formUrl: `/api/${blueprint.formKey}`,
    formKey: blueprint.formKey,
    items: blueprint.items,
  };
  return `/* Browser client. Uses the API when it is running, otherwise sample data. */
(function () {
  const CONFIG = ${JSON.stringify(config, null, 2)};
  const catalog = document.getElementById("catalog");
  const form = document.getElementById("site-form");
  const status = document.getElementById("form-status");
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav-links");

  navToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  function card(item) {
    const el = document.createElement("article");
    el.className = "card";
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.loading = "lazy";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = item.meta || "";
    const title = document.createElement("h3");
    title.textContent = item.title;
    const detail = document.createElement("p");
    detail.textContent = item.detail;
    el.append(img, meta, title, detail);
    return el;
  }

  function render(items) {
    catalog.replaceChildren(...items.map(card));
    const select = form.querySelector("[data-item-select]");
    if (!select) return;
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = select.querySelector("option")?.textContent || "Choose";
    select.replaceChildren(blank);
    items.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.title;
      opt.textContent = item.meta ? item.title + " · " + item.meta : item.title;
      select.appendChild(opt);
    });
  }

  render(CONFIG.items);

  async function loadItems() {
    try {
      const res = await fetch(CONFIG.listUrl);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length) render(data);
    } catch (_err) {
      /* Preview runs without the API. Sample cards are already on the page. */
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form).entries());
    status.textContent = "Sending…";
    try {
      const res = await fetch(CONFIG.formUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API unavailable");
      const saved = await res.json();
      status.textContent = "Saved on the server" + (saved.id ? " · " + saved.id : "");
      form.reset();
    } catch (_err) {
      const id = "local-" + Date.now().toString(36);
      const key = "lunor-site-" + CONFIG.formKey;
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push(Object.assign({ id: id }, body));
      localStorage.setItem(key, JSON.stringify(prev));
      status.textContent = "Saved in this browser (" + id + "). Start the API to store it on the server.";
      form.reset();
    }
  });

  loadItems();
})();
`;
}

function serverFiles(slug: string, blueprint: Blueprint): ProjectFile[] {
  const collection = blueprint.listKey;
  const submissions = blueprint.formKey;
  const required = blueprint.fields.filter((f) => f.required).map((f) => f.name);
  return [
    {
      path: "server/package.json",
      language: "json",
      content: JSON.stringify({
        name: `${slug}-server`,
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: { start: "node index.js", dev: "node --watch index.js" },
        dependencies: { cors: "^2.8.5", express: "^4.21.2", mongodb: "^6.13.0" },
      }, null, 2) + "\n",
    },
    {
      path: "server/index.js",
      language: "javascript",
      content: `import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`API ready on http://localhost:\${PORT}\`);
});
`,
    },
    {
      path: "server/src/app.js",
      language: "javascript",
      content: `import express from "express";
import cors from "cors";
import { siteRouter } from "./modules/site/site.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: ${JSON.stringify(slug)} });
});

app.use("/api", siteRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

export default app;
`,
    },
    {
      path: "server/src/config/db.js",
      language: "javascript",
      content: `import { MongoClient } from "mongodb";

let db = null;
let tried = false;

/** Returns a Mongo database, or null when MONGODB_URI is unset. */
export async function getDb() {
  if (tried) return db;
  tried = true;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MONGODB_URI not set — using in-memory data");
    return null;
  }
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.MONGODB_DB || ${JSON.stringify(slug)});
  console.log("Connected to MongoDB");
  return db;
}
`,
    },
    {
      path: "server/src/modules/site/site.service.js",
      language: "javascript",
      content: `import { getDb } from "../../config/db.js";

const LIST = ${JSON.stringify(collection)};
const SUBMISSIONS = ${JSON.stringify(submissions)};
const SEED = ${JSON.stringify(blueprint.items, null, 2)};

const memory = { items: SEED.map((item) => ({ ...item })), submissions: [] };

export async function listItems() {
  const db = await getDb();
  if (!db) return memory.items;
  const docs = await db.collection(LIST).find({}).toArray();
  return docs.length ? docs : memory.items;
}

export async function createSubmission(body) {
  const record = {
    ...body,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const db = await getDb();
  if (!db) {
    memory.submissions.push(record);
    return record;
  }
  await db.collection(SUBMISSIONS).insertOne(record);
  return record;
}
`,
    },
    {
      path: "server/src/modules/site/site.controller.js",
      language: "javascript",
      content: `import { createSubmission, listItems } from "./site.service.js";

const REQUIRED = ${JSON.stringify(required)};

export async function getItems(_req, res, next) {
  try {
    res.json(await listItems());
  } catch (err) {
    next(err);
  }
}

export async function postSubmission(req, res, next) {
  try {
    const body = req.body || {};
    const missing = REQUIRED.filter((key) => !String(body[key] || "").trim());
    if (missing.length) {
      res.status(400).json({ error: "Missing fields", fields: missing });
      return;
    }
    const saved = await createSubmission(body);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}
`,
    },
    {
      path: "server/src/modules/site/site.routes.js",
      language: "javascript",
      content: `import { Router } from "express";
import { getItems, postSubmission } from "./site.controller.js";

export const siteRouter = Router();

siteRouter.get(${JSON.stringify("/" + collection)}, getItems);
siteRouter.post(${JSON.stringify("/" + submissions)}, postSubmission);
`,
    },
  ];
}

function readme(name: string, blueprint: Blueprint, slug: string): string {
  return `# ${name}

Full-stack website generated in the Web Development assistant.

## What you get

- \`client/\` — HTML, CSS, and JavaScript. This is what the editor preview runs.
- \`server/\` — Express API with an optional MongoDB connection.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | \`/api/health\` | Liveness check |
| GET | \`/api/${blueprint.listKey}\` | ${blueprint.listTitle} |
| POST | \`/api/${blueprint.formKey}\` | ${blueprint.formTitle} |

Without \`MONGODB_URI\`, the API keeps data in memory so you can try it immediately.

## Run locally

\`\`\`bash
cd ${slug}/server
npm install
npm start
\`\`\`

In a second terminal:

\`\`\`bash
cd ${slug}
npx serve client
\`\`\`

Open the site URL printed by \`serve\`. The page calls \`http://localhost:5000\` only if you point the client at it. In the editor preview, sample data is used when the API is unreachable, and form posts are saved in \`localStorage\`.

Copy \`.env.example\` to \`server/.env\` and export the variables before \`npm start\` if you want MongoDB:

\`\`\`bash
export MONGODB_URI="mongodb://127.0.0.1:27017"
export MONGODB_DB="${slug}"
\`\`\`
`;
}

const KIND_PATTERNS: { kind: WebsiteKind; pattern: RegExp }[] = [
  { kind: "restaurant", pattern: /restaurant|menu|reservation|cafe|bistro|diner/ },
  { kind: "store", pattern: /store|shop|e-?commerce|product|checkout|cart/ },
  { kind: "saas", pattern: /saas|pricing|startup|landing page|leads?/ },
  { kind: "blog", pattern: /blog|journal|article|essay/ },
  { kind: "dashboard", pattern: /dashboard|analytics|metrics|admin panel/ },
  { kind: "portfolio", pattern: /portfolio|studio|agency|freelance/ },
];

/** Local generator trigger for the web development assistant. Other prompts stay with the model. */
export function parseWebsiteRequest(text: string): { kind: WebsiteKind; name?: string } | null {
  const q = text.toLowerCase();
  const build = /\b(build|create|generate|scaffold|make|design)\b/.test(q);
  const explicitSite = /full-?stack|website|web site|landing page|\bmern\b/.test(q);
  const matched = KIND_PATTERNS.find((entry) => entry.pattern.test(q));
  if (!build && !explicitSite) return null;
  if (!explicitSite && !matched) return null;
  if (/\b(debug|error|fix|explain|why)\b/.test(q) && !explicitSite && !build) return null;

  const named = text.match(/\b(?:named|called)\s+["']([^"']+)["']/i)
    || text.match(/\b(?:named|called)\s+([A-Za-z0-9][^.,!?\n]{1,40})/i);
  const name = named?.[1]?.trim().replace(/["']+$/g, "");
  return { kind: matched?.kind ?? "portfolio", name: name || undefined };
}

export function generateFullStackWebsite(options: { kind: WebsiteKind; name?: string }): GeneratedWebsite {
  const blueprint = BLUEPRINTS[options.kind] ?? BLUEPRINTS.portfolio;
  const name = (options.name || blueprint.info.defaultName).trim() || blueprint.info.defaultName;
  const slug = slugify(name);
  const files: ProjectFile[] = [
    { path: "client/index.html", language: "html", content: clientHtml(name, blueprint) },
    { path: "client/styles.css", language: "css", content: stylesheet(blueprint.accent, blueprint.accent2) },
    { path: "client/script.js", language: "javascript", content: clientScript(blueprint) },
    ...serverFiles(slug, blueprint),
    {
      path: "package.json",
      language: "json",
      content: JSON.stringify({
        name: slug,
        private: true,
        version: "1.0.0",
        scripts: {
          start: "npm --prefix server start",
          client: "npx serve client",
        },
      }, null, 2) + "\n",
    },
    {
      path: ".env.example",
      language: "plaintext",
      content: `MONGODB_URI=mongodb://127.0.0.1:27017\nMONGODB_DB=${slug}\nPORT=5000\n`,
    },
    { path: "README.md", language: "markdown", content: readme(name, blueprint, slug) },
  ];

  const runCommands = [
    `cd ${slug}/server`,
    "npm install",
    "npm start",
    "",
    "# second terminal",
    `cd ${slug}`,
    "npx serve client",
  ].join("\n");

  const summary = [
    `Built **${name}**, a full-stack ${blueprint.info.label.toLowerCase()} site.`,
    "",
    "Preview files are in `client/` (`index.html`, `styles.css`, `script.js`). The page works in the editor with sample data.",
    "",
    "The Express API is in `server/`:",
    "",
    `- \`GET /api/${blueprint.listKey}\` returns the ${blueprint.listTitle.toLowerCase()}`,
    `- \`POST /api/${blueprint.formKey}\` stores the form`,
    "- Without `MONGODB_URI` the API uses an in-memory store",
    "",
    "Run it locally with **Run Locally**, or:",
    "",
    "```bash",
    runCommands,
    "```",
  ].join("\n");

  return { kind: blueprint.info.id, name, slug, summary, runCommands, files };
}

export function filesToFileTree(files: ProjectFile[]): EditorFileNode[] {
  return upsertProjectFiles([], files);
}

export function upsertProjectFiles(tree: EditorFileNode[], files: ProjectFile[]): EditorFileNode[] {
  const next = structuredClone(tree);
  for (const file of files) {
    const parts = file.path.replace(/^\.?\//, "").split("/").filter(Boolean);
    if (parts.length === 0) continue;
    let level = next;
    let prefix = "";
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
      let folder = level.find((n) => n.type === "folder" && n.name === parts[i]);
      if (!folder) {
        folder = { id: prefix, name: parts[i], type: "folder", isOpen: true, children: [] };
        level.push(folder);
      }
      folder.isOpen = true;
      if (!folder.children) folder.children = [];
      level = folder.children;
    }
    const name = parts[parts.length - 1];
    const id = parts.join("/");
    const existing = level.find((n) => n.type === "file" && n.name === name);
    if (existing) {
      existing.id = id;
      existing.content = file.content;
      existing.language = file.language;
    } else {
      level.push({ id, name, type: "file", language: file.language, content: file.content });
    }
  }
  return next;
}

/** Map used by the HTML preview. Client files win basename clashes with the server. */
export function previewFileMap(files: ProjectFile[]): Record<string, string> {
  const rank = (path: string) => (path.startsWith("client/") ? 2 : path.startsWith("server/") ? 0 : 1);
  const map: Record<string, string> = {};
  for (const file of [...files].sort((a, b) => rank(a.path) - rank(b.path))) {
    map[file.path] = file.content;
    const base = file.path.split("/").pop();
    if (base) map[base] = file.content;
  }
  return map;
}
