/**
 * Full-stack website generator for the Web Development AI assistant.
 * Writes a vanilla client the editor can preview, plus an Express API
 * laid out as a feature module (not a single server file).
 */

export type WebsiteTemplateId = "portfolio" | "restaurant" | "saas" | "shop";

export interface GeneratedFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export interface GeneratedWebsite {
  templateId: WebsiteTemplateId;
  siteName: string;
  tagline: string;
  listKey: string;
  formKey: string;
  previewPath: string;
  files: GeneratedFile[];
  summary: string;
}

export interface GenerateWebsiteInput {
  templateId?: WebsiteTemplateId;
  siteName?: string;
  tagline?: string;
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

interface Field {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  email?: boolean;
}

interface ListItem {
  id: string;
  title: string;
  body: string;
  meta: string;
  image: string;
  price?: number;
}

interface TemplateSpec {
  id: WebsiteTemplateId;
  label: string;
  description: string;
  defaultName: string;
  defaultTagline: string;
  accent: string;
  listKey: string;
  formKey: string;
  listTitle: string;
  formTitle: string;
  cart: boolean;
  fields: Field[];
  items: ListItem[];
}

export const WEBSITE_TEMPLATES: TemplateSpec[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Projects and a contact form",
    defaultName: "Northwind Studio",
    defaultTagline: "Selected work, clearly presented.",
    accent: "#818cf8",
    listKey: "projects",
    formKey: "inquiries",
    listTitle: "Selected work",
    formTitle: "Start a project",
    cart: false,
    fields: [
      { key: "name", label: "Name", placeholder: "Your name", required: true },
      { key: "email", label: "Email", placeholder: "you@studio.com", required: true, email: true },
      { key: "message", label: "Message", placeholder: "What should we make?", required: true },
    ],
    items: [
      { id: "harbor", title: "Harbor identity", body: "A wordmark and site for a coastal architecture studio.", meta: "Design", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=700&fit=crop&q=80" },
      { id: "ledger", title: "Ledger dashboard", body: "A calm reporting view for a four-person finance team.", meta: "Web", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=700&fit=crop&q=80" },
      { id: "field", title: "Field notes", body: "An editorial portfolio for a traveling photographer.", meta: "Brand", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&h=700&fit=crop&q=80" },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Menu and reservations",
    defaultName: "Basil & Rye",
    defaultTagline: "Seasonal plates and a small dining room.",
    accent: "#f59e0b",
    listKey: "menu",
    formKey: "reservations",
    listTitle: "Tonight's menu",
    formTitle: "Reserve a table",
    cart: false,
    fields: [
      { key: "name", label: "Name", placeholder: "Name for the table", required: true },
      { key: "email", label: "Email", placeholder: "you@email.com", required: true, email: true },
      { key: "party", label: "Party size", placeholder: "2", required: true },
      { key: "when", label: "When", placeholder: "Friday, 7:30pm", required: true },
    ],
    items: [
      { id: "sourdough", title: "Rye sourdough", body: "Cultured butter and flaky salt.", meta: "$9", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&h=700&fit=crop&q=80" },
      { id: "greens", title: "Citrus greens", body: "Fennel, orange, and toasted seeds.", meta: "$14", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&h=700&fit=crop&q=80" },
      { id: "lamb", title: "Braised lamb", body: "White beans, rosemary, and pan juices.", meta: "$32", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=700&fit=crop&q=80" },
      { id: "cake", title: "Olive oil cake", body: "Citrus glaze and whipped cream.", meta: "$12", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&h=700&fit=crop&q=80" },
    ],
  },
  {
    id: "saas",
    label: "SaaS",
    description: "Product features and lead capture",
    defaultName: "Lumen",
    defaultTagline: "Ship the work your team can actually see.",
    accent: "#2dd4bf",
    listKey: "features",
    formKey: "leads",
    listTitle: "What teams use",
    formTitle: "Request a walkthrough",
    cart: false,
    fields: [
      { key: "name", label: "Name", placeholder: "Your name", required: true },
      { key: "email", label: "Work email", placeholder: "you@company.com", required: true, email: true },
      { key: "company", label: "Company", placeholder: "Company", required: true },
      { key: "message", label: "What do you need?", placeholder: "A short note", required: true },
    ],
    items: [
      { id: "timeline", title: "Shared timeline", body: "Every launch, review, and owner on one page.", meta: "Plan", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&h=700&fit=crop&q=80" },
      { id: "review", title: "Review links", body: "Send a page, collect comments, ship the change.", meta: "Review", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=700&fit=crop&q=80" },
      { id: "quiet", title: "Quiet notifications", body: "A daily digest instead of another noisy feed.", meta: "Focus", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&h=700&fit=crop&q=80" },
    ],
  },
  {
    id: "shop",
    label: "Shop",
    description: "Catalog and checkout orders",
    defaultName: "Field Supply",
    defaultTagline: "Tools and goods for everyday making.",
    accent: "#fb7185",
    listKey: "products",
    formKey: "orders",
    listTitle: "In the shop",
    formTitle: "Checkout",
    cart: true,
    fields: [
      { key: "name", label: "Name", placeholder: "Name on the order", required: true },
      { key: "email", label: "Email", placeholder: "you@email.com", required: true, email: true },
    ],
    items: [
      { id: "ruler", title: "Brass ruler", body: "15 cm, etched markings, a weight you notice.", meta: "$24", price: 24, image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=900&h=700&fit=crop&q=80" },
      { id: "notebook", title: "Linen notebook", body: "Plain pages, sewn binding, pocket in the back.", meta: "$18", price: 18, image: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=900&h=700&fit=crop&q=80" },
      { id: "ink", title: "Ink set", body: "Three bottles: carbon, pine, and clay.", meta: "$32", price: 32, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&h=700&fit=crop&q=80" },
      { id: "lamp", title: "Desk lamp", body: "Warm light, brass arm, small footprint.", meta: "$64", price: 64, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&h=700&fit=crop&q=80" },
    ],
  },
];

const TEMPLATE_IDS = new Set<WebsiteTemplateId>(WEBSITE_TEMPLATES.map((template) => template.id));

function specFor(templateId: WebsiteTemplateId): TemplateSpec {
  const spec = WEBSITE_TEMPLATES.find((template) => template.id === templateId);
  if (!spec) throw new Error(`Unknown website template: ${templateId}`);
  return spec;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug.slice(0, 40) || "website";
}

function cleanText(value: string | undefined, fallback: string, max: number): string {
  const trimmed = (value ?? "").replace(/\s+/g, " ").trim();
  return (trimmed || fallback).slice(0, max);
}

function embedJs(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function pascal(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function languageFor(filePath: string): string {
  if (filePath.endsWith(".html")) return "html";
  if (filePath.endsWith(".css")) return "css";
  if (filePath.endsWith(".js")) return "javascript";
  if (filePath.endsWith(".json")) return "json";
  if (filePath.endsWith(".md")) return "markdown";
  return "plaintext";
}

function file(filePath: string, content: string): GeneratedFile {
  const name = filePath.split("/").pop() || filePath;
  return { path: filePath, name, language: languageFor(filePath), content };
}

export function parseWebsiteRequest(text: string): { templateId: WebsiteTemplateId; siteName?: string; tagline?: string } | null {
  const raw = text.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const asksBuild = /\b(generate|build|create|make|scaffold|design)\b/.test(lower);
  const siteWord = /\b(website|web site|landing page|full[-\s]?stack)\b/.test(lower);
  const typedSite = /\b(portfolio|restaurant|saas|shop|store|menu)\s+(website|site|page)\b/.test(lower);
  if (!((asksBuild && siteWord) || (asksBuild && typedSite))) return null;

  let templateId: WebsiteTemplateId = "saas";
  if (/\b(restaurant|cafe|reservation|menu)\b/.test(lower)) templateId = "restaurant";
  else if (/\b(shop|store|e-commerce|ecommerce)\b/.test(lower)) templateId = "shop";
  else if (/\bportfolio\b/.test(lower)) templateId = "portfolio";

  const quoted = raw.match(/["“]([^"”]{2,60})["”]/);
  const named = raw.match(/\b(?:called|named)\s+([A-Za-z0-9][\w&.'’ -]{1,40})/);
  const siteName = (quoted?.[1] || named?.[1] || "").trim();
  return { templateId, siteName: siteName || undefined };
}

export function websiteStackPrompt(templateId: WebsiteTemplateId): string {
  const spec = specFor(templateId);
  return `The user asked for a full-stack website. Output every file below as its own fenced code block, with the path on the line directly above the fence.

Client — vanilla HTML, CSS, and JavaScript only. No React, JSX, TSX, or TypeScript:
- client/index.html
- client/styles.css
- client/script.js

Express API as a feature module. Do not collapse this into one server.js file. Do not use /api/records:
- server/package.json
- server/index.js
- server/src/app.js
- server/src/config/db.js
- server/src/modules/site/site.routes.js
- server/src/modules/site/site.controller.js
- server/src/modules/site/site.service.js

Routes on the Express app:
- GET /api/health
- GET /api/${spec.listKey}
- POST /api/${spec.formKey}

client/index.html must link styles.css and script.js, set data-themed on the body, include a checkbox menu (input#nav-check + label) so navigation works with JavaScript off, and tell the reader that preview submissions stay in the browser until the Express server is running.
server/src/config/db.js should keep an in-memory store so the API runs with npm install && npm start and no database.`;
}

function styles(accent: string): string {
  return `:root {
  --bg: #0b1020;
  --card: #141a2e;
  --text: #e7ecf5;
  --muted: #93a0b8;
  --line: rgba(255, 255, 255, 0.08);
  --accent: ${accent};
  --accent-ink: #081018;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Source Sans 3", "Segoe UI", sans-serif;
  background: radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 55%), var(--bg);
  color: var(--text);
  line-height: 1.5;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; }
.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  padding: 18px 7vw;
  position: sticky;
  top: 0;
  background: rgba(11, 16, 32, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
  z-index: 2;
}
.brand { font-weight: 700; letter-spacing: -0.03em; text-decoration: none; font-size: 1.15rem; }
.nav-links { display: flex; gap: 18px; margin-left: auto; }
.nav-links a { text-decoration: none; color: var(--muted); }
.nav-links a:hover { color: var(--text); }
.nav-check { position: absolute; opacity: 0; pointer-events: none; }
.nav-toggle {
  display: none;
  margin-left: auto;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
}
.hero { padding: 72px 7vw 32px; max-width: 820px; }
.eyebrow { color: var(--accent); letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.75rem; margin: 0 0 12px; }
h1 { font-size: clamp(2.4rem, 6vw, 4.6rem); line-height: 0.95; letter-spacing: -0.045em; margin: 0 0 16px; }
.lede { font-size: 1.2rem; color: var(--muted); margin: 0 0 24px; }
.btn, button[type="submit"], button[data-add] {
  background: var(--accent);
  color: var(--accent-ink);
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
}
.section { padding: 28px 7vw 10px; }
.section h2 { letter-spacing: -0.03em; margin: 0 0 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
}
.card img { height: 160px; width: 100%; }
.card div { padding: 14px 16px 16px; }
.card h3 { margin: 0 0 6px; }
.card p { margin: 0; color: var(--muted); }
.meta { color: var(--accent) !important; margin-top: 10px !important; font-weight: 700; }
.form, .note {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
  max-width: 520px;
}
.note { color: var(--muted); margin-bottom: 14px; }
label { display: block; font-size: 0.85rem; margin: 12px 0 6px; }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #0d1324;
  color: var(--text);
  padding: 12px 14px;
  font: inherit;
}
textarea { min-height: 110px; resize: vertical; }
.status { min-height: 1.2em; color: var(--accent); }
.footer { padding: 40px 7vw 56px; color: var(--muted); }
@media (max-width: 720px) {
  .nav-toggle { display: inline-flex; }
  .nav-links { display: none; width: 100%; flex-direction: column; margin-left: 0; padding-bottom: 8px; }
  .nav-check:checked ~ .nav-links { display: flex; }
}
`;
}

function cardHtml(item: ListItem, cart: boolean): string {
  const add = cart ? `<button type="button" data-add="${escapeHtml(item.id)}">Add to cart</button>` : "";
  return `<article class="card">
        <img alt="" src="${escapeHtml(item.image)}" />
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
          <p class="meta">${escapeHtml(item.meta)}</p>
          ${add}
        </div>
      </article>`;
}

function pageHtml(spec: TemplateSpec, siteName: string, tagline: string): string {
  const fields = spec.fields.map((field) => {
    const control = field.key === "message"
      ? `<textarea id="field-${field.key}" name="${field.key}" placeholder="${escapeHtml(field.placeholder)}" ${field.required ? "required" : ""}></textarea>`
      : `<input id="field-${field.key}" name="${field.key}" type="${field.email ? "email" : "text"}" placeholder="${escapeHtml(field.placeholder)}" ${field.required ? "required" : ""} />`;
    return `<label for="field-${field.key}">${escapeHtml(field.label)}</label>\n        ${control}`;
  }).join("\n        ");
  const cartLine = spec.cart ? `<p class="meta">Cart <span id="cart-count">0</span></p>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(siteName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="dark">
  <header class="nav">
    <a class="brand" href="#top">${escapeHtml(siteName)}</a>
    <input id="nav-check" class="nav-check" type="checkbox" />
    <label class="nav-toggle" for="nav-check">Menu</label>
    <nav class="nav-links">
      <a href="#work">${escapeHtml(spec.listTitle)}</a>
      <a href="#contact">${escapeHtml(spec.formTitle)}</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <p class="eyebrow">Full-stack website</p>
      <h1>${escapeHtml(siteName)}</h1>
      <p class="lede">${escapeHtml(tagline)}</p>
      <a class="btn" href="#contact">${escapeHtml(spec.formTitle)}</a>
    </section>
    <section class="section" id="work">
      <h2>${escapeHtml(spec.listTitle)}</h2>
      <div id="item-list" class="grid">
      ${spec.items.map((item) => cardHtml(item, spec.cart)).join("\n      ")}
      </div>
    </section>
    <section class="section" id="contact">
      <h2>${escapeHtml(spec.formTitle)}</h2>
      <p class="note" id="preview-note">This preview keeps form submissions in the browser. Run the Express server when you want them saved through the API.</p>
      <form id="site-form" class="form">
        ${cartLine}
        ${fields}
        <p class="status" id="form-status" role="status"></p>
        <button type="submit">Send</button>
      </form>
    </section>
  </main>
  <footer class="footer"><p>${escapeHtml(siteName)} · generated in the Web Development assistant</p></footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function clientScript(spec: TemplateSpec, siteName: string): string {
  const fieldReads = spec.fields.map((field) => `${field.key}: String(fd.get(${JSON.stringify(field.key)}) || "")`).join(", ");
  return `var SITE_NAME = ${embedJs(siteName)};
var LIST_PATH = ${embedJs("/api/" + spec.listKey)};
var FORM_PATH = ${embedJs("/api/" + spec.formKey)};
var STORAGE_KEY = ${embedJs("lunor-" + spec.formKey)};
var SEED_ITEMS = ${embedJs(spec.items)};
var CART = ${spec.cart ? "[]" : "null"};
var memory = null;

function text(value) {
  return String(value == null ? "" : value).trim();
}

function esc(value) {
  return text(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadMemory() {
  if (memory) return memory;
  memory = { items: JSON.parse(JSON.stringify(SEED_ITEMS)), submissions: [] };
  try {
    var saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) memory.submissions = JSON.parse(saved);
  } catch (err) {}
  return memory;
}

function saveMemory() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory.submissions)); } catch (err) {}
}

function validate(input) {
  ${spec.fields.map((field) => {
    const lines = [`var ${field.key} = text(input.${field.key});`];
    if (field.required) lines.push(`if (!${field.key}) return ${JSON.stringify(field.label + " is required")};`);
    if (field.email) lines.push(`if (${field.key}.indexOf("@") === -1) return "Enter a valid email";`);
    return lines.join("\n  ");
  }).join("\n  ")}
  ${spec.cart ? `if (!Array.isArray(input.items) || !input.items.length) return "Cart is empty";` : ""}
  return "";
}

function localApi(path, options) {
  var store = loadMemory();
  var method = ((options && options.method) || "GET").toUpperCase();
  if (method === "GET" && path === "/api/health") return { ok: true, site: SITE_NAME };
  if (method === "GET" && path === LIST_PATH) return store.items;
  if (method === "POST" && path === FORM_PATH) {
    var body = {};
    try { body = JSON.parse(options.body || "{}"); } catch (err) { body = {}; }
    var problem = validate(body);
    if (problem) {
      var error = new Error(problem);
      error.status = 400;
      throw error;
    }
    store.submissions.unshift(body);
    saveMemory();
    return { ok: true, offline: true };
  }
  var missing = new Error("Not found");
  missing.status = 404;
  throw missing;
}

function api(path, options) {
  return fetch(path, {
    method: (options && options.method) || "GET",
    headers: { "Content-Type": "application/json" },
    body: options && options.body
  }).then(function (res) {
    return res.json().catch(function () { return {}; }).then(function (data) {
      if (!res.ok) {
        if (res.status === 400) {
          var error = new Error(data.error || "Request failed");
          error.status = 400;
          throw error;
        }
        throw new Error("offline");
      }
      return data;
    });
  }).catch(function (err) {
    if (err && err.status) throw err;
    return localApi(path, options || {});
  });
}

function renderItems(items) {
  var list = document.getElementById("item-list");
  if (!list) return;
  list.innerHTML = items.map(function (item) {
    var button = ${spec.cart ? "'<button type=\"button\" data-add=\"' + esc(item.id) + '\">Add to cart</button>'" : '""'};
    return '<article class="card"><img alt="" src="' + esc(item.image) + '" /><div><h3>' + esc(item.title) + '</h3><p>' + esc(item.body) + '</p><p class="meta">' + esc(item.meta) + '</p>' + button + '</div></article>';
  }).join("");
}

function renderCart() {
  var node = document.getElementById("cart-count");
  if (!node || !CART) return;
  var count = CART.reduce(function (sum, item) { return sum + item.qty; }, 0);
  node.textContent = String(count);
}

function boot() {
  api(LIST_PATH).then(function (items) {
    if (Array.isArray(items) && items.length) renderItems(items);
  }).catch(function () {});

  ${spec.cart ? `document.body.addEventListener("click", function (event) {
    var button = event.target.closest("[data-add]");
    if (!button) return;
    var id = button.getAttribute("data-add");
    var product = SEED_ITEMS.filter(function (item) { return item.id === id; })[0];
    if (!product) return;
    var existing = CART.filter(function (item) { return item.id === id; })[0];
    if (existing) existing.qty += 1;
    else CART.push({ id: product.id, title: product.title, qty: 1, price: product.price || 0 });
    renderCart();
  });` : ""}

  var form = document.getElementById("site-form");
  var status = document.getElementById("form-status");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var fd = new FormData(form);
    var payload = { ${fieldReads} };
    ${spec.cart ? "payload.items = CART.map(function (item) { return { id: item.id, title: item.title, qty: item.qty, price: item.price }; });" : ""}
    var problem = validate(payload);
    if (problem) {
      status.textContent = problem;
      return;
    }
    status.textContent = "Sending…";
    api(FORM_PATH, { method: "POST", body: JSON.stringify(payload) }).then(function (result) {
      form.reset();
      ${spec.cart ? "CART.splice(0, CART.length); renderCart();" : ""}
      status.textContent = result && result.offline
        ? "Saved in this browser. Start the Express server to store it in the API."
        : "Sent to the API.";
    }).catch(function (err) {
      status.textContent = err.message || "Could not send.";
    });
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
`;
}

function serverPackage(siteName: string): string {
  return JSON.stringify({
    name: `${slugify(siteName)}-server`,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: { start: "node index.js" },
    dependencies: { express: "^4.21.2", cors: "^2.8.5" },
  }, null, 2) + "\n";
}

function serverIndex(siteName: string): string {
  return `import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(${JSON.stringify(siteName)} + " API on http://localhost:" + PORT);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
`;
}

function serverApp(): string {
  return `import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import siteRoutes from "./modules/site/site.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, "../../client");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", siteRoutes);
app.use(express.static(clientDir));
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendFile(path.join(clientDir, "index.html"));
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

export default app;
`;
}

function serverDb(spec: TemplateSpec): string {
  const memory = {
    [spec.listKey]: spec.items,
    [spec.formKey]: [],
  };
  return `const memory = ${JSON.stringify(memory, null, 2)};

export async function connectDB() {
  return memory;
}

export async function getStore() {
  return memory;
}
`;
}

function serverService(spec: TemplateSpec, siteName: string): string {
  const listName = `list${pascal(spec.listKey)}`;
  const postName = `create${pascal(spec.formKey)}`;
  const fieldLines = spec.fields.map((field) => {
    const lines = [`const ${field.key} = text(input.${field.key});`];
    if (field.required) lines.push(`if (!${field.key}) return { ok: false, status: 400, error: ${JSON.stringify(field.label + " is required")} };`);
    if (field.email) lines.push(`if (${field.key}.indexOf("@") === -1) return { ok: false, status: 400, error: "Enter a valid email" };`);
    return lines.join("\n  ");
  }).join("\n  ");
  const copies = spec.fields.map((field) => `row.${field.key} = ${field.key};`).join("\n  ");
  const cart = spec.cart
    ? `if (!Array.isArray(input.items) || input.items.length === 0) return { ok: false, status: 400, error: "Cart is empty" };
  const items = [];
  for (const item of input.items) {
    const qty = Number(item && item.qty) || 0;
    if (!item || !item.id || qty < 1) return { ok: false, status: 400, error: "Invalid cart item" };
    items.push({ id: String(item.id), title: text(item.title), qty, price: Number(item.price) || 0 });
  }
  `
    : "";
  return `import { getStore } from "../../config/db.js";

function text(value) {
  return String(value == null ? "" : value).trim();
}

export async function health() {
  return { ok: true, site: ${JSON.stringify(siteName)} };
}

export async function ${listName}() {
  const store = await getStore();
  return store[${JSON.stringify(spec.listKey)}];
}

export async function ${postName}(input) {
  input = input || {};
  ${fieldLines}
  ${cart}
  const store = await getStore();
  const row = {
    id: ${JSON.stringify(spec.formKey.slice(0, 3) + "-")} + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  ${copies}
  ${spec.cart ? "row.items = items;" : ""}
  store[${JSON.stringify(spec.formKey)}].unshift(row);
  return { ok: true, status: 201, data: row };
}
`;
}

function serverController(spec: TemplateSpec): string {
  const listFn = `list${pascal(spec.listKey)}`;
  const postFn = `create${pascal(spec.formKey)}`;
  const getName = `get${pascal(spec.listKey)}`;
  const postName = `post${pascal(spec.formKey)}`;
  return `import { health, ${listFn}, ${postFn} } from "./site.service.js";

export async function getHealth(_req, res, next) {
  try {
    res.json(await health());
  } catch (err) {
    next(err);
  }
}

export async function ${getName}(_req, res, next) {
  try {
    res.json(await ${listFn}());
  } catch (err) {
    next(err);
  }
}

export async function ${postName}(req, res, next) {
  try {
    const result = await ${postFn}(req.body);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(result.status).json(result.data);
  } catch (err) {
    next(err);
  }
}
`;
}

function serverRoutes(spec: TemplateSpec): string {
  const getName = `get${pascal(spec.listKey)}`;
  const postName = `post${pascal(spec.formKey)}`;
  return `import { Router } from "express";
import { getHealth, ${getName}, ${postName} } from "./site.controller.js";

const router = Router();
router.get("/health", getHealth);
router.get(${JSON.stringify("/" + spec.listKey)}, ${getName});
router.post(${JSON.stringify("/" + spec.formKey)}, ${postName});

export default router;
`;
}

function readme(spec: TemplateSpec, siteName: string, tagline: string): string {
  return `# ${siteName.replace(/`/g, "")}

${tagline.replace(/`/g, "")}

Generated by the Web Development website assistant.

## Preview

Open \`client/index.html\` in the editor preview. The page calls the API and, if the server is not running, uses the same routes in the browser.

## Run the API

\`\`\`bash
cd server
npm install
npm start
\`\`\`

The server listens on http://localhost:5000 and serves both the site and the API.

| Method | Path |
| --- | --- |
| GET | /api/health |
| GET | /api/${spec.listKey} |
| POST | /api/${spec.formKey} |

## Files

- \`client/index.html\`, \`client/styles.css\`, \`client/script.js\` — the website
- \`server/index.js\` — starts Express
- \`server/src/app.js\` — middleware, API, and static files
- \`server/src/config/db.js\` — in-memory data store
- \`server/src/modules/site/\` — routes, controller, and service
`;
}

export function generateFullStackWebsite(input: GenerateWebsiteInput = {}): GeneratedWebsite {
  const templateId = input.templateId ?? "saas";
  if (!TEMPLATE_IDS.has(templateId)) throw new Error(`Unknown website template: ${templateId}`);
  const spec = specFor(templateId);
  const siteName = cleanText(input.siteName, spec.defaultName, 60);
  const tagline = cleanText(input.tagline, spec.defaultTagline, 140);
  const files = [
    file("client/index.html", pageHtml(spec, siteName, tagline)),
    file("client/styles.css", styles(spec.accent)),
    file("client/script.js", clientScript(spec, siteName)),
    file("server/package.json", serverPackage(siteName)),
    file("server/index.js", serverIndex(siteName)),
    file("server/src/app.js", serverApp()),
    file("server/src/config/db.js", serverDb(spec)),
    file("server/src/modules/site/site.routes.js", serverRoutes(spec)),
    file("server/src/modules/site/site.controller.js", serverController(spec)),
    file("server/src/modules/site/site.service.js", serverService(spec, siteName)),
    file("README.md", readme(spec, siteName, tagline)),
  ];
  const summary = [
    `Built **${siteName}** — a ${spec.label.toLowerCase()} site with a previewable frontend and an Express API.`,
    "",
    `**Frontend:** \`client/index.html\`, \`client/styles.css\`, \`client/script.js\`. The preview is open. If the API is offline, the page uses the same routes in the browser.`,
    "",
    `**API:** \`GET /api/health\`, \`GET /api/${spec.listKey}\`, \`POST /api/${spec.formKey}\`.`,
    "Code lives in `server/index.js`, `server/src/app.js`, `server/src/config/db.js`, and `server/src/modules/site/`.",
    "",
    "Run it locally with `cd server && npm install && npm start` (http://localhost:5000). Use **Run Locally** to download the project.",
  ].join("\n");
  return {
    templateId,
    siteName,
    tagline,
    listKey: spec.listKey,
    formKey: spec.formKey,
    previewPath: "client/index.html",
    files,
    summary,
  };
}

export function applyWebsiteFiles(tree: ProjectNode[], files: GeneratedFile[]): ProjectNode[] {
  const next = structuredClone(tree);
  for (const entry of files) {
    const parts = entry.path.split("/").filter(Boolean);
    let siblings = next;
    let prefix = "";
    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      const id = prefix ? `${prefix}/${part}` : part;
      const leaf = index === parts.length - 1;
      if (leaf) {
        const node: ProjectNode = {
          id,
          name: entry.name,
          type: "file",
          language: entry.language,
          content: entry.content,
        };
        const existing = siblings.findIndex((item) => item.id === id);
        if (existing >= 0) siblings[existing] = { ...siblings[existing], ...node };
        else siblings.push(node);
      } else {
        let folder = siblings.find((item) => item.id === id && item.type === "folder");
        if (!folder) {
          folder = { id, name: part, type: "folder", isOpen: true, children: [] };
          siblings.push(folder);
        }
        folder.isOpen = true;
        folder.children = folder.children || [];
        prefix = id;
        siblings = folder.children;
      }
    }
  }
  return next;
}
