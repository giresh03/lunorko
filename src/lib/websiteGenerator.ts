/**
 * Full-stack website generator for the Web Development AI assistant.
 * Each template is a previewable HTML/CSS/JS site plus an Express API.
 * The browser preview uses fallback data when the API is not running.
 */

export interface WebsiteFile {
  path: string;
  content: string;
}

export interface WebsiteTemplate {
  id: string;
  label: string;
  description: string;
  prompt: string;
  files: WebsiteFile[];
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

const LANG_BY_EXT: Record<string, string> = {
  html: "html",
  css: "css",
  js: "javascript",
  json: "json",
  md: "markdown",
};

export function languageForPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  return LANG_BY_EXT[ext] || "plaintext";
}

/** User text only — ignore editor file context appended after this marker. */
export function userIntentText(content: string): string {
  const marker = "\n\n[Current file:";
  const idx = content.indexOf(marker);
  return (idx === -1 ? content : content.slice(0, idx)).trim();
}

export function isFullStackWebsiteRequest(content: string): boolean {
  const text = userIntentText(content);
  const intent = /\b(website|web\s*site|landing\s*page|full[\s-]*stack|portfolio|online\s*store|e-?commerce|blog|dashboard)\b/i.test(text);
  const action = /\b(build|create|make|generate|design|scaffold|automate)\b/i.test(text);
  return intent && action;
}

export function canonicalizeWebsitePath(filename: string, code: string): string {
  const clean = filename.replace(/\\/g, "/").replace(/^\.?\//, "");
  if (clean.includes("/")) return clean;
  const base = clean.split("/").pop() || clean;
  const isServer = /\brequire\s*\(|\bmodule\.exports\b|\bexpress\s*\(/.test(code);
  if (base.toLowerCase() === "readme.md") return "README.md";
  if (base === "package.json") return isServer || /"express"/.test(code) ? "server/package.json" : "package.json";
  if (isServer) return `server/${base === "index.js" ? "server.js" : base}`;
  if (/\.html?$/i.test(base) || base.endsWith(".css") || base.endsWith(".js")) return `public/${base}`;
  return clean;
}

export function insertGeneratedFile<T extends ProjectFileNode>(
  tree: T[],
  filePath: string,
  content: string,
  language?: string,
): T[] {
  const parts = filePath.split("/").filter(Boolean);
  const fileName = parts.pop();
  if (!fileName) return tree;
  const lang = language || languageForPath(fileName);

  const place = (nodes: T[], folders: string[], parentPath: string): T[] => {
    if (folders.length === 0) {
      const id = parentPath ? `${parentPath}/${fileName}` : fileName;
      const file = { id, name: fileName, type: "file" as const, language: lang, content } as T;
      const idx = nodes.findIndex((n) => n.id === id);
      if (idx >= 0) {
        const next = nodes.slice();
        next[idx] = { ...nodes[idx], ...file, type: "file" };
        return next;
      }
      return [...nodes, file];
    }
    const folderName = folders[0];
    const id = parentPath ? `${parentPath}/${folderName}` : folderName;
    const idx = nodes.findIndex((n) => n.type === "folder" && n.id === id);
    if (idx === -1) {
      const folder = {
        id,
        name: folderName,
        type: "folder" as const,
        isOpen: true,
        children: place([], folders.slice(1), id),
      } as T;
      return [...nodes, folder];
    }
    const next = nodes.slice();
    const existing = nodes[idx];
    next[idx] = {
      ...existing,
      isOpen: true,
      children: place((existing.children || []) as T[], folders.slice(1), id),
    };
    return next;
  };

  return place(tree, parts, "");
}

export function filesToTree(files: WebsiteFile[]): ProjectFileNode[] {
  return files.reduce<ProjectFileNode[]>(
    (tree, file) => insertGeneratedFile(tree, file.path, file.content, languageForPath(file.path)),
    [],
  );
}

function css(accent: string): string {
  return `:root {
  --accent: ${accent};
  --bg: #0b1020;
  --card: #151b2e;
  --text: #e8eefc;
  --muted: #9aa6c3;
  --line: rgba(255,255,255,0.08);
}
* { box-sizing: border-box; }
body[data-themed] {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  background: radial-gradient(1200px 500px at 10% -10%, color-mix(in srgb, var(--accent) 28%, transparent), transparent), var(--bg);
  color: var(--text);
}
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; object-fit: cover; }
.nav, .wrap, footer { width: min(1080px, calc(100% - 32px)); margin: 0 auto; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 0; }
.brand { font-weight: 700; letter-spacing: -0.03em; }
.nav nav { display: flex; gap: 18px; color: var(--muted); font-size: 14px; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center; padding: 18px 0 36px; }
.hero h1 { font-size: clamp(36px, 5vw, 60px); line-height: 0.98; margin: 0 0 12px; letter-spacing: -0.04em; }
.lede { color: var(--muted); font-size: 17px; line-height: 1.6; }
.btn, button, .chip {
  border: 0; border-radius: 999px; padding: 12px 16px; font-weight: 650; cursor: pointer;
  background: var(--accent); color: #081018;
}
.chip { background: transparent; color: var(--text); border: 1px solid var(--line); }
.chip.active { background: var(--accent); color: #081018; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card, form, .panel {
  background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px; overflow: hidden;
}
.card h3, .panel h3 { margin: 10px 0 6px; }
.card p, .muted { color: var(--muted); line-height: 1.5; }
.hero-shot, .card img { width: 100%; height: 220px; border-radius: 16px; }
.card img { height: 140px; border-radius: 12px; }
form { display: grid; gap: 10px; }
input, textarea {
  width: 100%; border-radius: 12px; border: 1px solid var(--line); background: #0d1324; color: var(--text); padding: 12px;
}
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat strong { display: block; font-size: 28px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); }
footer { padding: 28px 0 40px; color: var(--muted); font-size: 13px; }
.status { min-height: 1.2em; color: var(--accent); font-size: 13px; }
@media (max-width: 800px) {
  .hero, .grid, .stats { grid-template-columns: 1fr; }
  .nav nav { display: none; }
}
`;
}

function page(title: string, accent: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed>
${body}
  <footer><span id="year"></span> · ${title} · API preview falls back to local data</footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function serverPackage(name: string): string {
  return `{
  "name": "${name}",
  "version": "1.0.0",
  "private": true,
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": { "express": "^4.21.2" }
}
`;
}

function readme(title: string, routes: string[]): string {
  return `# ${title}

Full-stack website generated by the Lunor.AI Web Development assistant.

## Preview
Open \`public/index.html\` in the editor preview. The page uses local fallback data when the API is offline.

## Run the API
\`\`\`bash
cd server
npm install
npm start
\`\`\`

Then open http://localhost:3000

## Routes
${routes.map((r) => `- \`${r}\``).join("\n")}
`;
}

function expressServer(name: string, seedConst: string, routes: string): string {
  return `const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

${seedConst}

${routes}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("${name} API on http://localhost:" + port);
});
`;
}

function bootScript(body: string): string {
  return `async function api(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error("API " + res.status);
  return res.json();
}

function stampYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

${body}

function start() {
  stampYear();
  init().catch((err) => {
    const status = document.getElementById("status");
    if (status) status.textContent = err.message || "Something went wrong";
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
`;
}

const landingFiles = (): WebsiteFile[] => {
  const html = page("Northwind Studio", "#7CFFCB", `
  <header class="nav">
    <div class="brand">Northwind</div>
    <nav><a href="#work">Work</a><a href="#pricing">Pricing</a><a href="#contact">Contact</a></nav>
  </header>
  <main class="wrap">
    <section class="hero">
      <div>
        <h1>Websites that ship with a real API.</h1>
        <p class="lede">Northwind designs product sites, then wires the contact form to an Express endpoint you can run locally.</p>
        <p><a class="btn" href="#contact">Start a project</a></p>
      </div>
      <img class="hero-shot" alt="Team collaborating on a product" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&h=800&q=80">
    </section>
    <section id="work" class="grid">
      <article class="card"><img alt="Analytics desk" src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&h=500&q=80"><h3>Launch kits</h3><p>Hero, proof, and pricing in one responsive page.</p></article>
      <article class="card"><img alt="Design review" src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=800&h=500&q=80"><h3>Brand systems</h3><p>Type, color, and cards that stay consistent.</p></article>
      <article class="card"><img alt="Workshop" src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&h=500&q=80"><h3>API-backed forms</h3><p>Messages post to /api/messages with preview fallback.</p></article>
    </section>
    <section id="pricing" class="grid" style="margin-top:16px">
      <article class="card"><h3>Starter</h3><p class="stat"><strong>$490</strong></p><p>One landing page and a contact API.</p></article>
      <article class="card"><h3>Studio</h3><p class="stat"><strong>$1,200</strong></p><p>Multi-section site plus content endpoints.</p></article>
      <article class="card"><h3>Scale</h3><p class="stat"><strong>$2,400</strong></p><p>Store or dashboard with orders and stats.</p></article>
    </section>
    <section id="contact" style="margin-top:16px">
      <form id="contact-form">
        <h3>Tell us about the site</h3>
        <input name="name" placeholder="Name" required>
        <input name="email" type="email" placeholder="Email" required>
        <textarea name="message" rows="4" placeholder="What should we build?" required></textarea>
        <button type="submit">Send message</button>
        <p id="status" class="status"></p>
      </form>
    </section>
  </main>`);
  const js = bootScript(`async function init() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      await api("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      status.textContent = "Message stored by the API.";
    } catch {
      const inbox = JSON.parse(localStorage.getItem("nw-messages") || "[]");
      inbox.push(payload);
      localStorage.setItem("nw-messages", JSON.stringify(inbox));
      status.textContent = "Preview mode saved this locally. Run the API to store it on the server.";
    }
    form.reset();
  });
}`);
  const seed = `const messages = [];`;
  const routes = `app.get("/api/health", (_req, res) => res.json({ ok: true, service: "northwind" }));

app.get("/api/messages", (_req, res) => res.json(messages));

app.post("/api/messages", (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  const saved = { id: messages.length + 1, name, email, message };
  messages.push(saved);
  res.status(201).json(saved);
});`;
  return [
    { path: "public/index.html", content: html },
    { path: "public/styles.css", content: css("#7CFFCB") },
    { path: "public/script.js", content: js },
    { path: "server/server.js", content: expressServer("Northwind", seed, routes) },
    { path: "server/package.json", content: serverPackage("northwind-studio") },
    { path: "README.md", content: readme("Northwind Studio", ["GET /api/health", "GET /api/messages", "POST /api/messages"]) },
  ];
};

const portfolioFiles = (): WebsiteFile[] => {
  const html = page("Avery Lane", "#9DB4FF", `
  <header class="nav">
    <div class="brand">Avery Lane</div>
    <nav><a href="#projects">Projects</a><a href="#about">About</a></nav>
  </header>
  <main class="wrap">
    <section class="hero">
      <div>
        <h1>Product designer who also ships the API.</h1>
        <p class="lede">Selected work in brand, product, and editorial sites. Filter the grid — data comes from <code>/api/projects</code>.</p>
        <p id="status" class="status"></p>
        <div id="filters" style="display:flex;gap:8px;flex-wrap:wrap"></div>
      </div>
      <img class="hero-shot" alt="Designer desk" src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=800&q=80">
    </section>
    <section id="projects" class="grid"></section>
    <section id="about" class="panel" style="margin-top:16px">
      <h3>About</h3>
      <p class="muted">I pair interface design with a small Express API so case studies stay editable without rebuilding the page.</p>
    </section>
  </main>`);
  const js = bootScript(`const FALLBACK = [
  { title: "Harbor Bank", tag: "Product", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&h=500&q=80", summary: "Account opening flow and marketing site." },
  { title: "Field Notes", tag: "Editorial", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&h=500&q=80", summary: "Magazine layout with a stories API." },
  { title: "Lumen Shop", tag: "Commerce", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&h=500&q=80", summary: "Catalog, cart, and order endpoint." }
];

function render(projects) {
  const root = document.getElementById("projects");
  root.innerHTML = "";
  projects.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    const img = document.createElement("img");
    img.alt = p.title;
    img.src = p.image;
    const title = document.createElement("h3");
    title.textContent = p.title;
    const summary = document.createElement("p");
    summary.textContent = p.summary;
    const tag = document.createElement("span");
    tag.className = "muted";
    tag.textContent = p.tag;
    card.append(img, title, summary, tag);
    root.append(card);
  });
}

async function init() {
  const status = document.getElementById("status");
  let projects = FALLBACK;
  try {
    projects = await api("/api/projects");
    status.textContent = "Loaded from the API.";
  } catch {
    status.textContent = "Preview mode is using local projects. Start the API for live data.";
  }
  const tags = ["All", ...new Set(projects.map((p) => p.tag))];
  const filters = document.getElementById("filters");
  tags.forEach((tag, i) => {
    const btn = document.createElement("button");
    btn.className = "chip" + (i === 0 ? " active" : "");
    btn.textContent = tag;
    btn.addEventListener("click", () => {
      filters.querySelectorAll("button").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      render(tag === "All" ? projects : projects.filter((p) => p.tag === tag));
    });
    filters.appendChild(btn);
  });
  render(projects);
}`);
  const seed = `const projects = [
  { title: "Harbor Bank", tag: "Product", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&h=500&q=80", summary: "Account opening flow and marketing site." },
  { title: "Field Notes", tag: "Editorial", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&h=500&q=80", summary: "Magazine layout with a stories API." },
  { title: "Lumen Shop", tag: "Commerce", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&h=500&q=80", summary: "Catalog, cart, and order endpoint." }
];`;
  return [
    { path: "public/index.html", content: html },
    { path: "public/styles.css", content: css("#9DB4FF") },
    { path: "public/script.js", content: js },
    { path: "server/server.js", content: expressServer("Avery Lane", seed, `app.get("/api/projects", (_req, res) => res.json(projects));`) },
    { path: "server/package.json", content: serverPackage("avery-lane") },
    { path: "README.md", content: readme("Avery Lane Portfolio", ["GET /api/projects"]) },
  ];
};

const blogFiles = (): WebsiteFile[] => {
  const html = page("Kiln Journal", "#FFC46B", `
  <header class="nav"><div class="brand">Kiln Journal</div><nav><a href="#posts">Stories</a></nav></header>
  <main class="wrap">
    <section class="hero">
      <div>
        <h1>Notes on making software in public.</h1>
        <p class="lede">Stories load from <code>/api/posts</code>. Open one to read it.</p>
        <p id="status" class="status"></p>
      </div>
      <img class="hero-shot" alt="Notebook and coffee" src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&h=800&q=80">
    </section>
    <section id="posts" class="grid"></section>
    <article id="reader" class="panel" style="margin-top:16px" hidden>
      <h3 id="reader-title"></h3>
      <p id="reader-body" class="muted"></p>
      <button id="reader-close" class="chip" type="button">Back to stories</button>
    </article>
  </main>`);
  const js = bootScript(`const FALLBACK = [
  { id: 1, title: "Ship the page first", minutes: 4, body: "A static preview with fallback data lets you design the site before the database exists." },
  { id: 2, title: "One endpoint is enough", minutes: 6, body: "GET /api/posts returns the list the homepage renders. Add fields without rewriting the layout." },
  { id: 3, title: "Write for the next reader", minutes: 5, body: "Keep titles short, show reading time, and open the full note without leaving the page." }
];

function render(posts) {
  const root = document.getElementById("posts");
  const reader = document.getElementById("reader");
  root.innerHTML = "";
  posts.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    const title = document.createElement("h3");
    title.textContent = p.title;
    const meta = document.createElement("p");
    meta.textContent = p.minutes + " min read";
    const button = document.createElement("button");
    button.className = "chip";
    button.type = "button";
    button.textContent = "Read";
    button.addEventListener("click", () => {
      document.getElementById("reader-title").textContent = p.title;
      document.getElementById("reader-body").textContent = p.body;
      reader.hidden = false;
    });
    card.append(title, meta, button);
    root.append(card);
  });
}

async function init() {
  const status = document.getElementById("status");
  let posts = FALLBACK;
  try {
    posts = await api("/api/posts");
    status.textContent = "Loaded from the API.";
  } catch {
    status.textContent = "Preview mode is using local stories. Start the API for live posts.";
  }
  render(posts);
  document.getElementById("reader-close").addEventListener("click", () => {
    document.getElementById("reader").hidden = true;
  });
}`);
  const seed = `const posts = [
  { id: 1, title: "Ship the page first", minutes: 4, body: "A static preview with fallback data lets you design the site before the database exists." },
  { id: 2, title: "One endpoint is enough", minutes: 6, body: "GET /api/posts returns the list the homepage renders. Add fields without rewriting the layout." },
  { id: 3, title: "Write for the next reader", minutes: 5, body: "Keep titles short, show reading time, and open the full note without leaving the page." }
];`;
  return [
    { path: "public/index.html", content: html },
    { path: "public/styles.css", content: css("#FFC46B") },
    { path: "public/script.js", content: js },
    { path: "server/server.js", content: expressServer("Kiln Journal", seed, `app.get("/api/posts", (_req, res) => res.json(posts));
app.get("/api/posts/:id", (req, res) => {
  const post = posts.find((item) => String(item.id) === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});`) },
    { path: "server/package.json", content: serverPackage("kiln-journal") },
    { path: "README.md", content: readme("Kiln Journal", ["GET /api/posts", "GET /api/posts/:id"]) },
  ];
};

const storeFiles = (): WebsiteFile[] => {
  const html = page("Lumen Market", "#FF8B6A", `
  <header class="nav">
    <div class="brand">Lumen Market</div>
    <nav><a href="#catalog">Catalog</a><span>Cart <strong id="cart-count">0</strong></span></nav>
  </header>
  <main class="wrap">
    <section class="hero">
      <div>
        <h1>Objects for a quieter desk.</h1>
        <p class="lede">Products come from <code>/api/products</code>. Checkout posts an order to <code>/api/orders</code>.</p>
        <p id="status" class="status"></p>
        <button id="checkout" type="button">Checkout</button>
      </div>
      <img class="hero-shot" alt="Retail interior" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=800&q=80">
    </section>
    <section id="products" class="grid"></section>
  </main>`);
  const js = bootScript(`const FALLBACK = [
  { id: "lamp", name: "Arc lamp", price: 84, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&h=500&q=80" },
  { id: "notebook", name: "Cloth notebook", price: 18, image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&h=500&q=80" },
  { id: "cup", name: "Stone cup", price: 26, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&h=500&q=80" }
];

function cart() { return JSON.parse(localStorage.getItem("lumen-cart") || "[]"); }
function saveCart(items) {
  localStorage.setItem("lumen-cart", JSON.stringify(items));
  document.getElementById("cart-count").textContent = String(items.reduce((sum, item) => sum + item.qty, 0));
}

function render(products) {
  const root = document.getElementById("products");
  root.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "card";
    const img = document.createElement("img");
    img.alt = product.name;
    img.src = product.image;
    const title = document.createElement("h3");
    title.textContent = product.name;
    const price = document.createElement("p");
    price.textContent = "$" + product.price;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Add to cart";
    button.addEventListener("click", () => {
      const items = cart();
      const found = items.find((item) => item.id === product.id);
      if (found) found.qty += 1;
      else items.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
      saveCart(items);
    });
    card.append(img, title, price, button);
    root.append(card);
  });
}

async function init() {
  const status = document.getElementById("status");
  saveCart(cart());
  let products = FALLBACK;
  try {
    products = await api("/api/products");
    status.textContent = "Catalog loaded from the API.";
  } catch {
    status.textContent = "Preview mode is using the local catalog.";
  }
  render(products);
  document.getElementById("checkout").addEventListener("click", async () => {
    const items = cart();
    if (!items.length) { status.textContent = "Your cart is empty."; return; }
    try {
      const order = await api("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      saveCart([]);
      status.textContent = "Order " + order.id + " created.";
    } catch {
      saveCart([]);
      status.textContent = "Preview checkout cleared the cart. Start the API to record orders.";
    }
  });
}`);
  const seed = `const products = [
  { id: "lamp", name: "Arc lamp", price: 84, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&h=500&q=80" },
  { id: "notebook", name: "Cloth notebook", price: 18, image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&h=500&q=80" },
  { id: "cup", name: "Stone cup", price: 26, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&h=500&q=80" }
];
const orders = [];`;
  const routes = `app.get("/api/products", (_req, res) => res.json(products));

app.post("/api/orders", (req, res) => {
  const items = req.body && Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: "Cart is empty" });
  const order = {
    id: "ord_" + (orders.length + 1),
    items,
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
  };
  orders.push(order);
  res.status(201).json(order);
});`;
  return [
    { path: "public/index.html", content: html },
    { path: "public/styles.css", content: css("#FF8B6A") },
    { path: "public/script.js", content: js },
    { path: "server/server.js", content: expressServer("Lumen Market", seed, routes) },
    { path: "server/package.json", content: serverPackage("lumen-market") },
    { path: "README.md", content: readme("Lumen Market", ["GET /api/products", "POST /api/orders"]) },
  ];
};

const dashboardFiles = (): WebsiteFile[] => {
  const html = page("Relay Ops", "#6AE4FF", `
  <header class="nav"><div class="brand">Relay Ops</div><nav><a href="#stats">Overview</a><a href="#activity">Activity</a></nav></header>
  <main class="wrap">
    <section class="hero">
      <div>
        <h1>Operations at a glance.</h1>
        <p class="lede">Metrics come from <code>/api/stats</code> and the latest events from <code>/api/activity</code>.</p>
        <p id="status" class="status"></p>
      </div>
      <img class="hero-shot" alt="Operations dashboard on a laptop" src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=800&q=80">
    </section>
    <section id="stats" class="stats"></section>
    <section id="activity" class="panel" style="margin-top:16px">
      <h3>Recent activity</h3>
      <table><thead><tr><th>When</th><th>Event</th><th>Owner</th></tr></thead><tbody id="activity-rows"></tbody></table>
    </section>
  </main>`);
  const js = bootScript(`const FALLBACK_STATS = [
  { label: "Open deploys", value: "12" },
  { label: "Error rate", value: "0.4%" },
  { label: "Active users", value: "1,284" },
  { label: "Median response", value: "180ms" }
];
const FALLBACK_ACTIVITY = [
  { when: "2m ago", event: "Preview build passed", owner: "Ava" },
  { when: "18m ago", event: "API key rotated", owner: "Noah" },
  { when: "1h ago", event: "Landing page published", owner: "Mia" }
];

async function init() {
  const status = document.getElementById("status");
  let stats = FALLBACK_STATS;
  let activity = FALLBACK_ACTIVITY;
  try {
    [stats, activity] = await Promise.all([api("/api/stats"), api("/api/activity")]);
    status.textContent = "Loaded from the API.";
  } catch {
    status.textContent = "Preview mode is using local metrics. Start the API for live numbers.";
  }
  const statsRoot = document.getElementById("stats");
  statsRoot.innerHTML = "";
  stats.forEach((s) => {
    const card = document.createElement("article");
    card.className = "card";
    const label = document.createElement("span");
    label.className = "muted";
    label.textContent = s.label;
    const value = document.createElement("strong");
    value.textContent = s.value;
    card.append(label, value);
    statsRoot.append(card);
  });
  const rows = document.getElementById("activity-rows");
  rows.innerHTML = "";
  activity.forEach((row) => {
    const tr = document.createElement("tr");
    [row.when, row.event, row.owner].forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      tr.append(td);
    });
    rows.append(tr);
  });
}`);
  const seed = `const stats = [
  { label: "Open deploys", value: "12" },
  { label: "Error rate", value: "0.4%" },
  { label: "Active users", value: "1,284" },
  { label: "Median response", value: "180ms" }
];
const activity = [
  { when: "2m ago", event: "Preview build passed", owner: "Ava" },
  { when: "18m ago", event: "API key rotated", owner: "Noah" },
  { when: "1h ago", event: "Landing page published", owner: "Mia" }
];`;
  return [
    { path: "public/index.html", content: html },
    { path: "public/styles.css", content: css("#6AE4FF") },
    { path: "public/script.js", content: js },
    { path: "server/server.js", content: expressServer("Relay Ops", seed, `app.get("/api/stats", (_req, res) => res.json(stats));
app.get("/api/activity", (_req, res) => res.json(activity));`) },
    { path: "server/package.json", content: serverPackage("relay-ops") },
    { path: "README.md", content: readme("Relay Ops", ["GET /api/stats", "GET /api/activity"]) },
  ];
};

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "landing",
    label: "Landing page",
    description: "Marketing site + contact API",
    prompt: "Build a full-stack landing page website for a studio named Northwind. Include public/index.html, public/styles.css, public/script.js, an Express API in server/server.js, server/package.json, and README.md. The contact form posts to /api/messages and must keep working in the live preview with a local fallback when the API is offline. No React.",
    files: landingFiles(),
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Filterable projects API",
    prompt: "Build a full-stack portfolio website for Avery Lane. Projects load from GET /api/projects, with tag filters and local fallback data for the live preview. Return public/index.html, public/styles.css, public/script.js, server/server.js, server/package.json, and README.md. No React.",
    files: portfolioFiles(),
  },
  {
    id: "blog",
    label: "Blog",
    description: "Stories list + reader",
    prompt: "Build a full-stack blog website called Kiln Journal. Posts come from GET /api/posts and a reader opens on the same page. Include fallback stories so the preview works offline. Return public/index.html, public/styles.css, public/script.js, server/server.js, server/package.json, and README.md. No React.",
    files: blogFiles(),
  },
  {
    id: "store",
    label: "Online store",
    description: "Catalog, cart, orders",
    prompt: "Build a full-stack online store website called Lumen Market. Products come from GET /api/products, the cart is stored in the browser, and checkout posts to /api/orders. Include local fallback products for preview. Return public/index.html, public/styles.css, public/script.js, server/server.js, server/package.json, and README.md. No React.",
    files: storeFiles(),
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Stats and activity API",
    prompt: "Build a full-stack operations dashboard website called Relay Ops. Stats come from GET /api/stats and activity from GET /api/activity, with local fallback data for the live preview. Return public/index.html, public/styles.css, public/script.js, server/server.js, server/package.json, and README.md. No React.",
    files: dashboardFiles(),
  },
];

export function getWebsiteTemplate(id: string): WebsiteTemplate | undefined {
  return WEBSITE_TEMPLATES.find((template) => template.id === id);
}

export const WEBSITE_GENERATOR_SYSTEM_PROMPT = `You are Lunor.AI's full-stack website generator for the Web Development assistant.

Generate a complete small website the student can preview in the browser and run locally.

FILES (use these paths exactly):
- public/index.html
- public/styles.css
- public/script.js
- server/server.js
- server/package.json
- README.md

RULES:
- Frontend is vanilla HTML, CSS, and JavaScript only. No React, JSX, TypeScript, Vue, or imports in the browser files.
- public/index.html links styles.css and script.js, sets data-themed on body, and is responsive.
- Include real images with https://images.unsplash.com URLs (auto=format&fit=crop&w=1200&q=80).
- server/server.js is Express (require), serves ../public, and exposes JSON routes that match what script.js calls.
- public/script.js fetches those routes and ALWAYS includes fallback data so the page still renders when the API is offline.
- server/package.json depends on express and has "start": "node server.js".
- README.md explains preview vs npm start.
- Do not invent secrets, API keys, or private credentials.

Output contract:
- Return ONLY file blocks. No intro or outro.
- Put the path on the line immediately before each fence:
public/index.html
\`\`\`html
...
\`\`\``;
