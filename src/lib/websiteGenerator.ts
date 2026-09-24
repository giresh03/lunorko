/**
 * Full-stack website generator used by the Web Development AI assistant.
 * Writes a static client, an Express API, and an in-browser API shim that
 * mirrors the same routes so the editor preview can run without Node.
 */

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
  isOpen?: boolean;
  children?: WebsiteTreeNode[];
}

export interface WebsiteBlueprint {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export interface GeneratedWebsite {
  blueprintId: string;
  title: string;
  tagline: string;
  files: WebsiteFile[];
  summary: string;
}

interface SeedItem {
  title: string;
  detail: string;
  meta: string;
}

interface FieldSpec {
  key: "title" | "detail" | "meta";
  label: string;
  placeholder: string;
}

interface CollectionSpec {
  name: string;
  heading: string;
  writable: boolean;
  empty: string;
  seed: SeedItem[];
}

interface IntakeSpec {
  name: string;
  heading: string;
  empty: string;
  formTitle: string;
  submit: string;
  fields: FieldSpec[];
}

interface BlueprintSpec extends WebsiteBlueprint {
  defaultTitle: string;
  tagline: string;
  accent: string;
  heroImage: string;
  kicker: string;
  collection: CollectionSpec;
  intake: IntakeSpec | null;
}

interface StoredItem extends SeedItem {
  id: number;
}

const BLUEPRINTS: BlueprintSpec[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Projects API plus a contact form",
    prompt: "Build a full-stack portfolio website",
    defaultTitle: "Studio North",
    tagline: "Selected work, served from a small Express API.",
    accent: "#8b7cff",
    heroImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    kicker: "Independent studio",
    collection: {
      name: "projects",
      heading: "Selected work",
      writable: false,
      empty: "No projects yet.",
      seed: [
        { title: "Lumen Dashboard", detail: "Analytics UI for a climate nonprofit, with live charts and saved views.", meta: "2025" },
        { title: "Harbor API", detail: "Node service that syncs warehouse inventory every hour.", meta: "2024" },
        { title: "Field Notes", detail: "A writing app with offline drafts and a calm reading layout.", meta: "2024" },
      ],
    },
    intake: {
      name: "messages",
      heading: "Messages",
      empty: "No messages yet. Say hello.",
      formTitle: "Start a project",
      submit: "Send message",
      fields: [
        { key: "title", label: "Name", placeholder: "Your name" },
        { key: "meta", label: "Email", placeholder: "you@example.com" },
        { key: "detail", label: "Message", placeholder: "What should we build?" },
      ],
    },
  },
  {
    id: "landing",
    label: "Landing",
    description: "Feature list plus a signup API",
    prompt: "Generate a full-stack landing page",
    defaultTitle: "Northwind",
    tagline: "Ship a marketing site with a real signup API behind it.",
    accent: "#2dd4bf",
    heroImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
    kicker: "Product",
    collection: {
      name: "features",
      heading: "What you get",
      writable: false,
      empty: "No features published.",
      seed: [
        { title: "One command to run", detail: "The same routes work in the preview and on localhost:3000.", meta: "Setup" },
        { title: "Typed JSON API", detail: "Signups are validated before they are stored in memory.", meta: "API" },
        { title: "Responsive layout", detail: "The page is readable from a phone width up to a wide desktop.", meta: "UI" },
      ],
    },
    intake: {
      name: "signups",
      heading: "Waitlist",
      empty: "Be the first to join.",
      formTitle: "Join the waitlist",
      submit: "Request access",
      fields: [
        { key: "title", label: "Name", placeholder: "Ada Lovelace" },
        { key: "detail", label: "Email", placeholder: "ada@example.com" },
        { key: "meta", label: "Plan", placeholder: "Team" },
      ],
    },
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Menu API plus table reservations",
    prompt: "Create a restaurant website called Olive & Rye",
    defaultTitle: "Olive & Rye",
    tagline: "Tonight's menu, loaded from the API.",
    accent: "#f0b429",
    heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    kicker: "Dinner service",
    collection: {
      name: "menu",
      heading: "Menu",
      writable: false,
      empty: "The kitchen is still writing the menu.",
      seed: [
        { title: "Citrus fennel salad", detail: "Orange, olives, and toasted rye crumbs.", meta: "$14" },
        { title: "Coal-roasted squash", detail: "Brown butter, chili, and a spoon of ricotta.", meta: "$22" },
        { title: "Olive oil cake", detail: "Rosemary, citrus glaze, and sea salt.", meta: "$12" },
      ],
    },
    intake: {
      name: "reservations",
      heading: "Reservations",
      empty: "No tables requested yet.",
      formTitle: "Request a table",
      submit: "Request table",
      fields: [
        { key: "title", label: "Name", placeholder: "Name for the booking" },
        { key: "meta", label: "Time", placeholder: "7:30 PM" },
        { key: "detail", label: "Notes", placeholder: "Party of 2, window if you can" },
      ],
    },
  },
  {
    id: "blog",
    label: "Blog",
    description: "Posts API plus comments",
    prompt: "Make a blog website with a posts API",
    defaultTitle: "Field Notes",
    tagline: "Essays stored on the server, comments posted back to it.",
    accent: "#34d399",
    heroImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80",
    kicker: "Journal",
    collection: {
      name: "posts",
      heading: "Latest notes",
      writable: false,
      empty: "No posts published.",
      seed: [
        { title: "Start with the API", detail: "Decide the JSON shape before the pixels. The page is only a client of that contract.", meta: "March 2" },
        { title: "Preview without a server", detail: "The editor shim answers the same paths Express will answer later.", meta: "March 9" },
        { title: "Keep the reset obvious", detail: "Memory storage is perfect for a lesson: restart the process and the data returns to the seed.", meta: "March 16" },
      ],
    },
    intake: {
      name: "comments",
      heading: "Comments",
      empty: "No comments yet.",
      formTitle: "Leave a comment",
      submit: "Post comment",
      fields: [
        { key: "title", label: "Name", placeholder: "Your name" },
        { key: "meta", label: "On post", placeholder: "Start with the API" },
        { key: "detail", label: "Comment", placeholder: "What did you notice?" },
      ],
    },
  },
  {
    id: "store",
    label: "Store",
    description: "Product catalog with create and delete",
    prompt: "Build an online store website",
    defaultTitle: "Harbor Goods",
    tagline: "A catalog you can add to and remove from through the API.",
    accent: "#fb7185",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    kicker: "Shop",
    collection: {
      name: "products",
      heading: "Catalog",
      writable: true,
      empty: "The catalog is empty. Add the first product.",
      seed: [
        { title: "Canvas tote", detail: "Heavy natural canvas with an interior pocket.", meta: "$42" },
        { title: "Stoneware mug", detail: "Speckled glaze, holds twelve ounces.", meta: "$28" },
        { title: "Wool throw", detail: "Charcoal herringbone, washed for softness.", meta: "$96" },
      ],
    },
    intake: null,
  },
];

const STORE_FORM: IntakeSpec = {
  name: "products",
  heading: "Catalog",
  empty: "The catalog is empty.",
  formTitle: "Add a product",
  submit: "Add product",
  fields: [
    { key: "title", label: "Name", placeholder: "Product name" },
    { key: "meta", label: "Price", placeholder: "$24" },
    { key: "detail", label: "Description", placeholder: "What is it?" },
  ],
};

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = BLUEPRINTS.map(({ id, label, description, prompt }) => ({
  id,
  label,
  description,
  prompt,
}));

export function isWebsiteGenerationRequest(text: string): boolean {
  const value = text.trim();
  if (value.length < 8 || value.length > 800) return false;
  const verb = /\b(build|create|make|generate|design|scaffold)\b/i.test(value);
  const site = /\b(websites?|web\s*sites?|landing\s*pages?|full[\s-]*stack\s+sites?|online\s+stores?)\b/i.test(value);
  return verb && site;
}

export function matchWebsiteBlueprint(text: string): string {
  if (/\b(restaurant|cafe|café|bakery|diner|menu)\b/i.test(text)) return "restaurant";
  if (/\b(store|shop|e-?commerce|catalog|products?)\b/i.test(text)) return "store";
  if (/\b(blog|magazine|articles?|posts?)\b/i.test(text)) return "blog";
  if (/\b(portfolio|personal|resume)\b/i.test(text)) return "portfolio";
  return "landing";
}

export function generateWebsite(options: { brief: string; blueprintId?: string }): GeneratedWebsite {
  const requested = options.blueprintId || matchWebsiteBlueprint(options.brief);
  const blueprint = BLUEPRINTS.find((item) => item.id === requested) ?? BLUEPRINTS[1];
  const title = extractTitle(options.brief, blueprint.defaultTitle);
  const tagline = title === blueprint.defaultTitle
    ? blueprint.tagline
    : `A full-stack ${blueprint.label.toLowerCase()} site for ${title}.`;
  const form = blueprint.intake ?? { ...STORE_FORM, name: blueprint.collection.name, empty: blueprint.collection.empty };
  const intakeName = blueprint.intake?.name ?? blueprint.collection.name;
  const sameResource = intakeName === blueprint.collection.name;

  const db: Record<string, StoredItem[]> = {
    [blueprint.collection.name]: withIds(blueprint.collection.seed),
  };
  if (!sameResource) {
    db[intakeName] = [];
  }

  const writable = new Set<string>();
  if (blueprint.collection.writable) writable.add(blueprint.collection.name);
  if (!sameResource) writable.add(intakeName);

  const files: WebsiteFile[] = [
    { path: "client/index.html", language: "html", content: renderHtml(blueprint, form, title, tagline, sameResource) },
    { path: "client/styles.css", language: "css", content: renderCss(blueprint) },
    { path: "client/app.js", language: "javascript", content: renderApp(blueprint, form, title, sameResource, intakeName) },
    { path: "client/api-shim.js", language: "javascript", content: renderShim(db, writable) },
    { path: "server/data.js", language: "javascript", content: renderData(db, writable) },
    { path: "server/server.js", language: "javascript", content: renderServer(db, writable) },
    { path: "package.json", language: "json", content: renderPackage(title) },
    { path: "README.md", language: "markdown", content: renderReadme(title, tagline, blueprint, db, writable) },
    { path: ".gitignore", language: "plaintext", content: "node_modules\n.env\n" },
  ];

  return {
    blueprintId: blueprint.id,
    title,
    tagline,
    files,
    summary: renderSummary(title, tagline, files, db, writable),
  };
}

export function websiteToFileTree(files: WebsiteFile[]): WebsiteTreeNode[] {
  const roots: WebsiteTreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let level = roots;
    let prefix = "";
    parts.forEach((part, index) => {
      const id = prefix ? `${prefix}/${part}` : part;
      const isFile = index === parts.length - 1;
      if (isFile) {
        level.push({ id, name: part, type: "file", language: file.language, content: file.content });
        return;
      }
      let folder = level.find((node) => node.type === "folder" && node.name === part);
      if (!folder) {
        folder = { id, name: part, type: "folder", isOpen: true, children: [] };
        level.push(folder);
      }
      prefix = id;
      level = folder.children ?? [];
    });
  }
  return roots;
}

function extractTitle(brief: string, fallback: string): string {
  const quoted = brief.match(/["“']([^"”']{2,60})["”']/);
  const named = brief.match(/\b(?:called|named|titled)\s+([^.,!?\n]{2,60})/i);
  const raw = (quoted?.[1] || named?.[1] || fallback).replace(/\s+/g, " ").trim();
  const cut = raw.replace(/\b(with|using|that|and)\b[\s\S]*$/i, "").trim();
  return (cut || fallback).slice(0, 48);
}

function withIds(seed: SeedItem[]): StoredItem[] {
  return seed.map((item, index) => ({ id: index + 1, ...item }));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char
  ));
}

function jsonForScript(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

function renderHtml(
  blueprint: BlueprintSpec,
  form: IntakeSpec,
  title: string,
  tagline: string,
  sameResource: boolean,
): string {
  const safeTitle = escapeHtml(title);
  const fields = form.fields.map((field) => `        <label>
          <span>${escapeHtml(field.label)}</span>
          <input name="${field.key}" required placeholder="${escapeHtml(field.placeholder)}" />
        </label>`).join("\n");
  const intakeSection = sameResource ? "" : `
    <section class="band" id="intake">
      <div class="section-head">
        <h2>${escapeHtml(form.heading)}</h2>
      </div>
      <div id="intake-list" class="stack" data-empty="${escapeHtml(form.empty)}"></div>
    </section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed="site">
  <header class="top">
    <a class="brand" href="#top">${safeTitle}</a>
    <nav>
      <a href="#catalog">${escapeHtml(blueprint.collection.heading)}</a>
      <a href="#composer">${escapeHtml(form.formTitle)}</a>
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <p class="kicker">${escapeHtml(blueprint.kicker)}</p>
      <h1>${safeTitle}</h1>
      <p class="lede">${escapeHtml(tagline)}</p>
      <a class="button" href="#composer">${escapeHtml(form.submit)}</a>
    </section>
    <section class="band" id="catalog">
      <div class="section-head">
        <h2>${escapeHtml(blueprint.collection.heading)}</h2>
        <p>Loaded with <code>GET /api/${escapeHtml(blueprint.collection.name)}</code></p>
      </div>
      <div id="catalog-list" class="grid" data-empty="${escapeHtml(blueprint.collection.empty)}"></div>
    </section>${intakeSection}
    <section class="band composer" id="composer">
      <div class="section-head">
        <h2>${escapeHtml(form.formTitle)}</h2>
        <p>Saved with <code>POST /api/${escapeHtml(form.name)}</code></p>
      </div>
      <form id="composer-form">
${fields}
        <button class="button" type="submit">${escapeHtml(form.submit)}</button>
      </form>
      <p id="status" role="status"></p>
    </section>
  </main>
  <footer>
    <span>${safeTitle}</span>
    <span>Express on port 3000 · preview uses the in-browser API</span>
  </footer>
  <script src="api-shim.js"></script>
  <script src="app.js"></script>
</body>
</html>
`;
}

function renderCss(blueprint: BlueprintSpec): string {
  return `:root {
  --bg: #10141c;
  --bg-raise: #1a2130;
  --ink: #f4f1ea;
  --muted: #b7c0ce;
  --line: rgba(255, 255, 255, 0.12);
  --accent: ${blueprint.accent};
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  font-family: "Iowan Old Style", Palatino, Georgia, serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
}
a { color: inherit; }
.top, .band, footer {
  width: min(1080px, calc(100% - 32px));
  margin-inline: auto;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 0;
}
.brand { font-weight: 700; text-decoration: none; letter-spacing: -0.03em; }
nav { display: flex; gap: 16px; }
nav a { color: var(--muted); text-decoration: none; font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 0.92rem; }
.hero {
  min-height: 460px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  padding: 48px 7vw 42px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(8, 10, 16, 0.15), rgba(8, 10, 16, 0.86)),
    url("${blueprint.heroImage}") center/cover no-repeat;
  box-shadow: var(--shadow);
}
.kicker, .section-head p, .meta, footer, label span, #status {
  font-family: "Avenir Next", "Segoe UI", sans-serif;
}
.kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.75rem;
  color: var(--accent);
}
h1 { margin: 0; font-size: clamp(3rem, 7vw, 6rem); line-height: 0.92; letter-spacing: -0.045em; }
.lede { max-width: 38rem; margin: 0; color: #efe8dc; font-size: 1.2rem; }
.button {
  width: fit-content;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--accent);
  color: #141820;
  font: 600 0.95rem/1 "Avenir Next", "Segoe UI", sans-serif;
  text-decoration: none;
  cursor: pointer;
}
.band { padding: 56px 0 8px; }
.section-head { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; }
.section-head h2 { margin: 0 0 18px; font-size: 2rem; letter-spacing: -0.04em; }
.section-head p, #status, .empty { color: var(--muted); }
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.84em;
  color: var(--accent);
}
.grid, .stack { display: grid; gap: 14px; }
.grid { grid-template-columns: repeat(3, 1fr); }
.card {
  background: var(--bg-raise);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
  display: grid;
  gap: 8px;
}
.card h3 { margin: 0; font-size: 1.25rem; }
.card p { margin: 0; color: var(--muted); font-family: "Avenir Next", "Segoe UI", sans-serif; line-height: 1.45; }
.meta { color: var(--accent); font-size: 0.85rem; }
.ghost {
  justify-self: start;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  border-radius: 999px;
  padding: 6px 10px;
  cursor: pointer;
}
.composer form, .card { box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset; }
form {
  display: grid;
  gap: 12px;
  max-width: 560px;
}
label { display: grid; gap: 6px; }
label span { font-size: 0.82rem; color: var(--muted); }
input {
  border: 1px solid var(--line);
  background: #0d1118;
  color: var(--ink);
  border-radius: 12px;
  padding: 12px 14px;
  font: 1rem/1.3 "Avenir Next", "Segoe UI", sans-serif;
}
input:focus { outline: 2px solid var(--accent); border-color: transparent; }
#status { min-height: 1.2em; }
footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 28px 0 36px;
  color: var(--muted);
  font-size: 0.85rem;
}
@media (max-width: 800px) {
  .grid { grid-template-columns: 1fr; }
  .top, .section-head, footer { flex-direction: column; align-items: flex-start; }
  .hero { min-height: 380px; border-radius: 20px; }
}
`;
}

function renderApp(
  blueprint: BlueprintSpec,
  form: IntakeSpec,
  title: string,
  sameResource: boolean,
  intakeName: string,
): string {
  const site = {
    title,
    collection: blueprint.collection.name,
    collectionWritable: blueprint.collection.writable,
    intake: intakeName,
    sameResource,
  };
  return `// Client for ${title.replace(/[<>]/g, "")}. Talks only to /api — the shim or Express answers.
const SITE = ${jsonForScript(site)};

const catalogEl = document.getElementById("catalog-list");
const intakeEl = document.getElementById("intake-list");
const formEl = document.getElementById("composer-form");
const statusEl = document.getElementById("status");

function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#fb7185" : "";
}

async function readJson(response) {
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function renderCards(container, items, writable, collectionName) {
  if (!container) return;
  container.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = container.dataset.empty || "Nothing yet.";
    container.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    const heading = document.createElement("h3");
    heading.textContent = item.title;
    const copy = document.createElement("p");
    copy.textContent = item.detail;
    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = item.meta;
    card.append(heading, copy, meta);
    if (writable) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "ghost";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => deleteItem(collectionName, item.id));
      card.append(remove);
    }
    container.append(card);
  });
}

async function load() {
  try {
    const catalog = await readJson(await fetch("/api/" + SITE.collection));
    renderCards(catalogEl, catalog, SITE.collectionWritable, SITE.collection);
    if (!SITE.sameResource && intakeEl) {
      const intake = await readJson(await fetch("/api/" + SITE.intake));
      renderCards(intakeEl, intake, true, SITE.intake);
    }
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function deleteItem(collectionName, id) {
  try {
    await readJson(await fetch("/api/" + collectionName + "/" + id, { method: "DELETE" }));
    setStatus("Removed.");
    await load();
  } catch (error) {
    setStatus(error.message, true);
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(formEl);
  const payload = {
    title: String(formData.get("title") || "").trim(),
    detail: String(formData.get("detail") || "").trim(),
    meta: String(formData.get("meta") || "").trim(),
  };
  try {
    await readJson(await fetch("/api/" + SITE.intake, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }));
    formEl.reset();
    setStatus("Saved.");
    await load();
  } catch (error) {
    setStatus(error.message, true);
  }
});

load();
`;
}

function renderShim(db: Record<string, StoredItem[]>, writable: Set<string>): string {
  return `// In-browser stand-in for server/server.js. Active only inside the editor preview.
(function () {
  if (!window.__LUNOR_PREVIEW__) return;
  const nativeFetch = window.fetch.bind(window);
  const writable = new Set(${jsonForScript([...writable])});
  const db = ${jsonForScript(db)};

  function json(status, body) {
    return new Response(body == null ? null : JSON.stringify(body), {
      status: status,
      headers: { "Content-Type": "application/json" },
    });
  }

  function createItem(list, body) {
    const title = String(body.title || "").trim();
    if (!title) return { error: json(400, { error: "Title is required" }) };
    const item = {
      id: list.reduce((max, entry) => Math.max(max, entry.id), 0) + 1,
      title: title,
      detail: String(body.detail || "").trim(),
      meta: String(body.meta || "").trim(),
    };
    list.push(item);
    return { item: item };
  }

  window.fetch = function (input, init) {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const path = raw.replace(/^https?:\\/\\/[^/]+/, "");
    const match = path.match(/^\\/api\\/([a-z0-9-]+)(?:\\/(\\d+))?$/);
    if (!match || !Object.prototype.hasOwnProperty.call(db, match[1])) return nativeFetch(input, init);

    const name = match[1];
    const id = match[2];
    const method = ((init && init.method) || "GET").toUpperCase();
    const list = db[name];

    if (method === "GET" && !id) return Promise.resolve(json(200, list));
    if (method === "GET" && id) {
      const found = list.find((item) => String(item.id) === id);
      return Promise.resolve(found ? json(200, found) : json(404, { error: "Not found" }));
    }
    if (!writable.has(name)) return Promise.resolve(json(405, { error: "Method not allowed" }));
    if (method === "POST" && !id) {
      let body = {};
      try { body = JSON.parse((init && init.body) || "{}"); } catch (error) { body = {}; }
      const created = createItem(list, body);
      if (created.error) return Promise.resolve(created.error);
      return Promise.resolve(json(201, created.item));
    }
    if (method === "DELETE" && id) {
      const next = list.filter((item) => String(item.id) !== id);
      if (next.length === list.length) return Promise.resolve(json(404, { error: "Not found" }));
      db[name] = next;
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return Promise.resolve(json(405, { error: "Method not allowed" }));
  };
})();
`;
}

function renderData(db: Record<string, StoredItem[]>, writable: Set<string>): string {
  return `// Seed data shared by the Express server. Restarting the process restores it.
export const writable = ${jsonForScript([...writable])};

export const db = ${jsonForScript(db)};
`;
}

function renderServer(db: Record<string, StoredItem[]>, writable: Set<string>): string {
  const names = Object.keys(db);
  const routes = names.map((name) => {
    const read = `
app.get("/api/${name}", (_req, res) => {
  res.json(db.${name});
});`;
    if (!writable.has(name)) return read;
    return `${read}
app.post("/api/${name}", (req, res) => {
  const title = String(req.body?.title || "").trim();
  if (!title) return res.status(400).json({ error: "Title is required" });
  const item = {
    id: db.${name}.reduce((max, entry) => Math.max(max, entry.id), 0) + 1,
    title,
    detail: String(req.body?.detail || "").trim(),
    meta: String(req.body?.meta || "").trim(),
  };
  db.${name}.push(item);
  res.status(201).json(item);
});
app.delete("/api/${name}/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = db.${name}.length;
  db.${name} = db.${name}.filter((item) => item.id !== id);
  if (db.${name}.length === before) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});`;
  }).join("\n");

  return `import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db as seed } from "./data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const db = structuredClone(seed);

app.use(express.json());
${routes}

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
  next();
});
app.use(express.static(path.join(__dirname, "../client")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log("Site running at http://localhost:" + port);
});
`;
}

function renderPackage(title: string): string {
  const name = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "website";
  return JSON.stringify({
    name,
    private: true,
    type: "module",
    scripts: { start: "node server/server.js" },
    dependencies: { express: "^4.21.2" },
  }, null, 2) + "\n";
}

function renderReadme(
  title: string,
  tagline: string,
  blueprint: BlueprintSpec,
  db: Record<string, StoredItem[]>,
  writable: Set<string>,
): string {
  const routes = Object.keys(db).flatMap((name) => {
    const lines = [`- \`GET /api/${name}\``];
    if (writable.has(name)) {
      lines.push(`- \`POST /api/${name}\` with \`{ "title", "detail", "meta" }\``);
      lines.push(`- \`DELETE /api/${name}/:id\``);
    }
    return lines;
  });
  return `# ${title}

${tagline}

Generated by the Lunor.AI full-stack website automation in the Web Development assistant.

## Run the API

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000. The page is \`client/index.html\`. Data lives in memory and returns to the seed when the process restarts.

## Routes

${routes.join("\n")}

## Preview

Inside the Lunor editor, \`client/api-shim.js\` answers those same paths when \`window.__LUNOR_PREVIEW__\` is set. The blueprint is **${blueprint.label}**.
`;
}

function renderSummary(
  title: string,
  tagline: string,
  files: WebsiteFile[],
  db: Record<string, StoredItem[]>,
  writable: Set<string>,
): string {
  const fileList = files.map((file) => `- \`${file.path}\``).join("\n");
  const routes = Object.keys(db).map((name) => {
    const verbs = writable.has(name) ? "GET, POST, DELETE" : "GET";
    return `- \`/api/${name}\` — ${verbs}`;
  }).join("\n");
  return `**${title}** is in the editor. ${tagline}

The preview is using the in-browser API. To run Express locally: \`npm install && npm start\`, then open http://localhost:3000.

### Files
${fileList}

### API
${routes}

Records need a title. Restarting the server restores the seed data.`;
}
