/**
 * Full-stack website generator for the Web Development AI assistant.
 * Each blueprint is a previewable HTML/CSS/JS site plus an Express API
 * and a Mongoose model the editor can open immediately.
 */

export const FULLSTACK_WEBSITE_AUTOMATION = "fullstack-website";
export const FULLSTACK_WEBSITE_MARKER = "[automation:fullstack-website]";

export const WEBSITE_GENERATOR_FILES = [
  "client/index.html",
  "client/styles.css",
  "client/script.js",
  "server/index.js",
  "server/routes/api.js",
  "server/models/Item.js",
  "package.json",
  ".env.example",
  "README.md",
] as const;

export interface WebsiteFile {
  path: string;
  language: string;
  content: string;
}

export interface WebsiteBlueprint {
  id: string;
  label: string;
  description: string;
  summary: string;
  resource: string;
  files: WebsiteFile[];
}

export function requestsFullStackWebsite(text: string, automation?: string): boolean {
  if (automation === FULLSTACK_WEBSITE_AUTOMATION) return true;
  return /\[automation:fullstack-website\]|full-?stack website|website generator/i.test(text || "");
}

export function buildWebsiteGeneratorPrompt(blueprint: WebsiteBlueprint, brief?: string): string {
  const note = brief?.trim() || blueprint.summary;
  return `${FULLSTACK_WEBSITE_MARKER}
Generate a full-stack ${blueprint.label.toLowerCase()} website.

Brief: ${note}

Write every file: client/index.html, client/styles.css, client/script.js, server/index.js, server/routes/api.js, server/models/Item.js, package.json, .env.example, and README.md.
Keep the page as vanilla HTML, CSS, and JavaScript so it previews in the editor. Keep the Express API and Mongoose model, with an in-memory fallback when MONGODB_URI is empty.`;
}

const CLIENT_CSS = `/* Lunor full-stack website — shared client styles */
:root {
  --bg: #0c1222;
  --bg-raise: #151d33;
  --ink: #eef3ff;
  --muted: #a9b4d0;
  --line: rgba(255, 255, 255, 0.08);
  --accent: #7c9cff;
  --accent-2: #3ee0b0;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Outfit, "Segoe UI", sans-serif;
  background:
    radial-gradient(900px 420px at 10% -10%, rgba(124, 156, 255, 0.28), transparent 60%),
    radial-gradient(700px 380px at 100% 0%, rgba(62, 224, 176, 0.16), transparent 55%),
    var(--bg);
  color: var(--ink);
  line-height: 1.6;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
button, input, textarea { font: inherit; }
.nav, .footer, .section { width: min(1120px, calc(100% - 32px)); margin-inline: auto; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0 8px;
  position: relative;
}
.brand { font-weight: 600; letter-spacing: -0.03em; }
.brand span { color: var(--accent-2); }
.nav-links { display: flex; gap: 22px; align-items: center; color: var(--muted); }
.nav-links a:hover { color: var(--ink); }
.nav-toggle {
  display: none;
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 12px;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: linear-gradient(135deg, var(--accent), #9b7bff);
  color: white;
  cursor: pointer;
  font-weight: 600;
}
.btn.ghost { background: transparent; border: 1px solid var(--line); color: var(--ink); }
.hero { padding: 42px 0 12px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px; align-items: center; }
.kicker { color: var(--accent-2); letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; font-weight: 600; }
h1, h2, h3 { font-family: Fraunces, Georgia, serif; letter-spacing: -0.03em; line-height: 1.05; margin: 0 0 12px; }
h1 { font-size: clamp(42px, 6vw, 76px); }
h2 { font-size: clamp(30px, 4vw, 46px); }
.lede { color: var(--muted); font-size: 18px; max-width: 52ch; }
.hero-actions { display: flex; gap: 12px; margin-top: 22px; flex-wrap: wrap; }
.hero-visual { position: relative; min-height: 360px; }
.hero-visual img { width: 100%; height: 420px; border-radius: 28px; box-shadow: var(--shadow); }
.float-card {
  position: absolute;
  left: -18px;
  bottom: 24px;
  background: rgba(12, 18, 34, 0.86);
  border: 1px solid var(--line);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 14px 16px;
  width: min(240px, 80%);
}
.section { padding: 64px 0; }
.section-head { display: flex; justify-content: space-between; gap: 18px; align-items: end; margin-bottom: 24px; }
.grid { display: grid; gap: 16px; }
.grid.three { grid-template-columns: repeat(3, 1fr); }
.grid.two { grid-template-columns: 1.1fr 0.9fr; }
.card {
  background: var(--bg-raise);
  border: 1px solid var(--line);
  border-radius: 22px;
  overflow: hidden;
  padding: 18px;
}
.card img { width: 100%; height: 180px; border-radius: 16px; margin-bottom: 14px; }
.card p, .muted { color: var(--muted); }
.price { font-family: Fraunces, Georgia, serif; font-size: 28px; }
.form { display: grid; gap: 12px; }
input, textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #0e162b;
  color: var(--ink);
  padding: 12px 14px;
}
.cart-bar {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(62, 224, 176, 0.08);
  border: 1px solid rgba(62, 224, 176, 0.25);
}
.footer { padding: 28px 0 48px; color: var(--muted); border-top: 1px solid var(--line); }
@media (max-width: 860px) {
  .hero, .grid.three, .grid.two { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  .nav-links { display: none; position: absolute; top: 68px; right: 0; flex-direction: column; align-items: flex-start; background: var(--bg-raise); border: 1px solid var(--line); border-radius: 16px; padding: 14px; min-width: 180px; }
  .nav-links.open { display: flex; }
  .hero-visual img { height: 280px; }
}
`;

function page(options: {
  title: string;
  description: string;
  brand: string;
  links: { href: string; label: string }[];
  main: string;
}): string {
  const links = options.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("\n        ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.title}</title>
  <meta name="description" content="${options.description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body data-themed>
  <header class="nav">
    <a class="brand" href="#top">${options.brand}</a>
    <button class="nav-toggle" type="button" aria-label="Open menu">Menu</button>
    <nav class="nav-links">
        ${links}
    </nav>
  </header>
  <main id="top">
    ${options.main}
  </main>
  <footer class="footer">
    <p>${options.brand} · generated by the Lunor Web Development assistant. API data lives in MongoDB when MONGODB_URI is set.</p>
  </footer>
  <script src="script.js"></script>
</body>
</html>
`;
}

function clientScript(resource: string, mode: "lead" | "catalog" | "cart"): string {
  return `/* Client script for the ${resource} website.
   The preview keeps the HTML if the API is offline.
   npm start serves this folder and the JSON API together. */
const resource = ${JSON.stringify(resource)};

document.querySelector(".nav-toggle")?.addEventListener("click", () => {
  document.querySelector(".nav-links")?.classList.toggle("open");
});

async function loadCollection() {
  const mount = document.querySelector("#catalog");
  if (!mount) return;
  try {
    const response = await fetch("/api/" + resource);
    if (!response.ok) return;
    const items = await response.json();
    if (!Array.isArray(items) || items.length === 0) return;
    mount.innerHTML = items.map((item) => {
      const title = item.title || item.name || "Untitled";
      const summary = item.summary || item.message || "";
      const image = item.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80";
      const price = Number(item.price) > 0 ? "$" + Number(item.price) : (item.tag || "");
      return \`<article class="card product" data-name="\${title}" data-price="\${Number(item.price) || 0}">
        <img src="\${image}" alt="\${title}" />
        <h3>\${title}</h3>
        <p>\${summary}</p>
        <strong>\${price}</strong>
        ${mode === "cart" ? '<button class="btn" type="button" data-add>Add to cart</button>' : ""}
      </article>\`;
    }).join("");
  } catch {
    /* Static cards stay in place for the in-editor preview. */
  }
}

${mode === "lead" ? "/* Lead sites keep the static work grid and only post the form. */" : "loadCollection();"}

const form = document.querySelector("[data-lead-form]");
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = form.querySelector("[data-status]");
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch("/api/" + resource, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Request failed");
    if (status) status.textContent = "Saved. The API stored this record.";
    form.reset();
  } catch {
    if (status) status.textContent = "Preview mode: start the API with npm start to store this in MongoDB.";
  }
});

${mode === "cart" ? `const cart = [];
const cartBar = document.querySelector("[data-cart]");
function renderCart() {
  if (!cartBar) return;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartBar.textContent = cart.length
    ? cart.map((item) => item.name + " × " + item.qty).join(", ") + " — $" + total
    : "Your cart is empty.";
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const card = button.closest(".product");
  const name = card?.dataset.name || "Item";
  const price = Number(card?.dataset.price) || 0;
  const found = cart.find((item) => item.name === name);
  if (found) found.qty += 1;
  else cart.push({ name, price, qty: 1 });
  renderCart();
});
document.querySelector("[data-checkout]")?.addEventListener("click", async () => {
  if (!cart.length) return;
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Order", summary: cart.map((item) => item.name + " x" + item.qty).join(", "), price: cart.reduce((sum, item) => sum + item.price * item.qty, 0) }),
    });
    cart.length = 0;
    renderCart();
    if (cartBar) cartBar.textContent = "Order sent to the API.";
  } catch {
    if (cartBar) cartBar.textContent = "Cart kept in the browser. Start npm start to place the order.";
  }
});
renderCart();
` : ""}
`;
}

function serverIndex(): string {
  return `require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const api = require("./routes/api");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: Boolean(process.env.MONGODB_URI) });
});
app.use("/api", api);
app.use(express.static(path.join(__dirname, "../client")));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log("Website running at http://localhost:" + port);
});
`;
}

function itemModel(): string {
  return `const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    image: { type: String, default: "" },
    price: { type: Number, default: 0 },
    tag: { type: String, default: "" },
  },
  { timestamps: true }
);

let cached = null;

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (mongoose.connection.readyState === 1) {
    return cached || mongoose.model("Item", ItemSchema);
  }
  await mongoose.connect(uri);
  cached = mongoose.models.Item || mongoose.model("Item", ItemSchema);
  return cached;
}

module.exports = { ItemSchema, connect };
`;
}

function apiRouter(resource: string, seed: object[], extraOrderRoute: boolean): string {
  const seedLiteral = JSON.stringify(seed, null, 2);
  const orderRoute = extraOrderRoute
    ? `
router.post("/orders", async (req, res) => {
  const order = {
    title: req.body?.title || "Order",
    summary: req.body?.summary || "",
    price: Number(req.body?.price) || 0,
    tag: "order",
  };
  try {
    const Model = await connect();
    if (Model) {
      const saved = await Model.create(order);
      return res.status(201).json(saved);
    }
  } catch (error) {
    console.error(error);
  }
  memory.unshift({ ...order, id: String(Date.now()) });
  res.status(201).json(order);
});
`
    : "";

  return `const express = require("express");
const { connect } = require("../models/Item");

const seed = ${seedLiteral};
const memory = seed.map((item) => ({ ...item }));
const router = express.Router();

router.get("/${resource}", async (_req, res) => {
  try {
    const Model = await connect();
    if (Model) {
      const docs = await Model.find().sort({ createdAt: -1 }).lean();
      if (docs.length) return res.json(docs);
    }
  } catch (error) {
    console.error(error);
  }
  res.json(memory);
});

router.post("/${resource}", async (req, res) => {
  const body = req.body || {};
  const record = {
    title: body.title || body.name || "New entry",
    summary: body.summary || body.message || "",
    image: body.image || "",
    price: Number(body.price) || 0,
    tag: body.tag || body.email || "",
  };
  if (!record.title && !record.summary && !record.tag) {
    return res.status(400).json({ error: "Send a title, message, or email." });
  }
  try {
    const Model = await connect();
    if (Model) {
      const saved = await Model.create(record);
      return res.status(201).json(saved);
    }
  } catch (error) {
    console.error(error);
  }
  memory.unshift({ ...record, id: String(Date.now()) });
  res.status(201).json(record);
});
${orderRoute}
module.exports = router;
`;
}

function packageJson(name: string): string {
  return JSON.stringify({
    name,
    version: "1.0.0",
    private: true,
    description: "Full-stack website generated by the Lunor Web Development assistant",
    scripts: {
      start: "node server/index.js",
      dev: "node server/index.js",
    },
    dependencies: {
      cors: "^2.8.5",
      dotenv: "^16.4.5",
      express: "^4.21.2",
      mongoose: "^8.9.5",
    },
  }, null, 2) + "\n";
}

const ENV_EXAMPLE = `PORT=3000
# Leave blank to run the API with the in-memory seed data.
MONGODB_URI=mongodb://127.0.0.1:27017/lunor_website
`;

function readme(blueprint: WebsiteBlueprint): string {
  return `# ${blueprint.label}

${blueprint.summary}

This project was generated by the **Website Generator** automation in the Lunor Web Development AI assistant.

## What's included

- \`client/index.html\`, \`client/styles.css\`, \`client/script.js\` — the website the editor previews
- \`server/index.js\` — Express server that serves the site and the JSON API
- \`server/routes/api.js\` — \`GET\` and \`POST /api/${blueprint.resource}\`
- \`server/models/Item.js\` — Mongoose model used when \`MONGODB_URI\` is set
- In-memory seed data so the API still responds with no database

## Run it

\`\`\`bash
npm install
npm start
\`\`\`

Open http://localhost:3000

Copy \`.env.example\` to \`.env\` and set \`MONGODB_URI\` when you want records stored in MongoDB.
`;
}

function bundle(blueprint: Omit<WebsiteBlueprint, "files"> & { html: string; mode: "lead" | "catalog" | "cart"; seed: object[]; orders?: boolean }): WebsiteBlueprint {
  return {
    id: blueprint.id,
    label: blueprint.label,
    description: blueprint.description,
    summary: blueprint.summary,
    resource: blueprint.resource,
    files: [
      { path: "client/index.html", language: "html", content: blueprint.html },
      { path: "client/styles.css", language: "css", content: CLIENT_CSS },
      { path: "client/script.js", language: "javascript", content: clientScript(blueprint.resource, blueprint.mode) },
      { path: "server/index.js", language: "javascript", content: serverIndex() },
      { path: "server/routes/api.js", language: "javascript", content: apiRouter(blueprint.resource, blueprint.seed, Boolean(blueprint.orders)) },
      { path: "server/models/Item.js", language: "javascript", content: itemModel() },
      { path: "package.json", language: "json", content: packageJson(`lunor-${blueprint.id}`) },
      { path: ".env.example", language: "plaintext", content: ENV_EXAMPLE },
      { path: "README.md", language: "markdown", content: readme({ ...blueprint, files: [] }) },
    ],
  };
}

const landingHtml = page({
  title: "Northwind Studio",
  description: "A product studio that designs and ships websites, brands, and web apps.",
  brand: "Northwind <span>Studio</span>",
  links: [
    { href: "#work", label: "Work" },
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ],
  main: `
    <section class="hero">
      <div>
        <p class="kicker">Product studio</p>
        <h1>Websites with a backend from the first draft.</h1>
        <p class="lede">Northwind designs marketing sites that already talk to an API — leads, projects, and content saved through Express and MongoDB.</p>
        <div class="hero-actions">
          <a class="btn" href="#contact">Start a project</a>
          <a class="btn ghost" href="#work">See the work</a>
        </div>
      </div>
      <div class="hero-visual">
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80" alt="Designer working on a laptop in a bright studio" />
        <div class="float-card"><strong>12 launches</strong><p class="muted">this year, each with a live API.</p></div>
      </div>
    </section>
    <section class="section" id="services">
      <div class="section-head"><h2>What we ship</h2><p class="muted">Strategy, interface, and the server behind it.</p></div>
      <div class="grid three">
        <article class="card"><h3>Brand sites</h3><p>Landing pages with a lead form wired to POST /api/leads.</p></article>
        <article class="card"><h3>Content</h3><p>Collections served from MongoDB, with seed data when you are offline.</p></article>
        <article class="card"><h3>Care</h3><p>Readable type, real photography, and a layout that holds on a phone.</p></article>
      </div>
    </section>
    <section class="section" id="work">
      <div class="section-head"><h2>Selected work</h2></div>
      <div class="grid three" id="catalog">
        <article class="card"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" alt="Analytics dashboard on a desk" /><h3>Harbor Analytics</h3><p>Marketing site and lead capture for a data studio.</p></article>
        <article class="card"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Team collaborating around a table" /><h3>Field School</h3><p>Course catalog with a small content API.</p></article>
        <article class="card"><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80" alt="Person paying at a shop counter" /><h3>Lumen Goods</h3><p>Storefront with cart checkout posted to the API.</p></article>
      </div>
    </section>
    <section class="section" id="contact">
      <div class="grid two">
        <div>
          <h2>Tell us about the site.</h2>
          <p class="lede">The form posts to the Express API. Without MongoDB it stays in memory so you can try it immediately.</p>
        </div>
        <form class="card form" data-lead-form>
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <textarea name="message" rows="4" placeholder="What should we build?" required></textarea>
          <button class="btn" type="submit">Send</button>
          <p class="muted" data-status></p>
        </form>
      </div>
    </section>`,
});

const portfolioHtml = page({
  title: "Mira Chen — Product Designer",
  description: "Portfolio of interface work, case studies, and selected client projects.",
  brand: "Mira <span>Chen</span>",
  links: [
    { href: "#projects", label: "Projects" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ],
  main: `
    <section class="hero">
      <div>
        <p class="kicker">Product designer</p>
        <h1>Interfaces for teams who ship.</h1>
        <p class="lede">Case studies pulled from /api/projects. The page still reads when you are only previewing the HTML.</p>
        <div class="hero-actions"><a class="btn" href="#projects">View projects</a></div>
      </div>
      <div class="hero-visual">
        <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=80" alt="Colorful design explorations pinned on a wall" />
      </div>
    </section>
    <section class="section" id="projects">
      <div class="section-head"><h2>Projects</h2><p class="muted">Replace the seed list in server/routes/api.js.</p></div>
      <div class="grid three" id="catalog">
        <article class="card"><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80" alt="Code on a laptop screen" /><h3>Ledger</h3><p>Finance dashboard with a calmer information hierarchy.</p><strong>2025</strong></article>
        <article class="card"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" alt="Mountain road at dusk" /><h3>Atlas Travel</h3><p>Booking flow reduced from nine steps to four.</p><strong>2024</strong></article>
        <article class="card"><img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80" alt="Audio mixing desk" /><h3>Signal Audio</h3><p>Creator tools for a podcast network.</p><strong>2024</strong></article>
      </div>
    </section>
    <section class="section" id="about">
      <div class="grid two">
        <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80" alt="Portrait of a designer in a studio" style="border-radius:28px;height:360px;width:100%;object-fit:cover;" />
        <div>
          <h2>About</h2>
          <p class="lede">I design product surfaces and the small APIs that keep them honest. Previously at two startups, now independent.</p>
        </div>
      </div>
    </section>
    <section class="section" id="contact">
      <form class="card form" data-lead-form>
        <h2>Project inquiry</h2>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <textarea name="message" rows="4" placeholder="Timeline and goals" required></textarea>
        <button class="btn" type="submit">Send inquiry</button>
        <p class="muted" data-status></p>
      </form>
    </section>`,
});

const blogHtml = page({
  title: "Field Notes",
  description: "A journal about building websites, APIs, and calm interfaces.",
  brand: "Field <span>Notes</span>",
  links: [
    { href: "#journal", label: "Journal" },
    { href: "#about", label: "About" },
  ],
  main: `
    <section class="hero">
      <div>
        <p class="kicker">Journal</p>
        <h1>Notes from shipping the web.</h1>
        <p class="lede">Posts come from GET /api/posts. Write new ones with POST, or edit the seed array in the route file.</p>
      </div>
      <div class="hero-visual">
        <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80" alt="Typewriter and notebook on a wooden desk" />
      </div>
    </section>
    <section class="section" id="journal">
      <div class="section-head"><h2>Latest</h2></div>
      <div class="grid three" id="catalog">
        <article class="card"><img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80" alt="Person typing on a laptop" /><h3>Preview before the database</h3><p>Ship the HTML first. The API can catch up when MongoDB is ready.</p><strong>Essay</strong></article>
        <article class="card"><img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80" alt="Code editor on a monitor" /><h3>One page, one server</h3><p>Express serves both the static site and the JSON collection.</p><strong>Build</strong></article>
        <article class="card"><img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80" alt="Coffee and a notebook by a window" /><h3>Write the seed data</h3><p>Good sample posts make the empty state feel like a magazine.</p><strong>Practice</strong></article>
      </div>
    </section>
    <section class="section" id="about">
      <h2>About the journal</h2>
      <p class="lede">Field Notes is a starter blog: three essays in memory, a Mongoose model for when you connect a database, and a page you can restyle.</p>
    </section>`,
});

const storeHtml = page({
  title: "Lumen Goods",
  description: "A small shop for lamps, ceramics, and desk objects.",
  brand: "Lumen <span>Goods</span>",
  links: [
    { href: "#shop", label: "Shop" },
    { href: "#story", label: "Story" },
  ],
  main: `
    <section class="hero">
      <div>
        <p class="kicker">Shop</p>
        <h1>Objects for a quieter desk.</h1>
        <p class="lede">Products load from /api/products. Add them to a cart, then post the order to /api/orders.</p>
        <div class="hero-actions"><a class="btn" href="#shop">Browse the shelf</a></div>
      </div>
      <div class="hero-visual">
        <img src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=80" alt="Warm desk lamp beside a notebook" />
      </div>
    </section>
    <section class="section" id="shop">
      <div class="section-head"><h2>The shelf</h2></div>
      <div class="grid three" id="catalog">
        <article class="card product" data-name="Arc Lamp" data-price="128"><img src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80" alt="Brass arc lamp" /><h3>Arc Lamp</h3><p>Brass arm, linen shade, warm bulb included.</p><strong>$128</strong><button class="btn" type="button" data-add>Add to cart</button></article>
        <article class="card product" data-name="Stone Cup" data-price="36"><img src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80" alt="Ceramic cup on a table" /><h3>Stone Cup</h3><p>Speckled ceramic, sized for coffee.</p><strong>$36</strong><button class="btn" type="button" data-add>Add to cart</button></article>
        <article class="card product" data-name="Oak Tray" data-price="54"><img src="https://images.unsplash.com/photo-1616628188506-3430c90e9d0d?auto=format&fit=crop&w=1200&q=80" alt="Wooden tray with small objects" /><h3>Oak Tray</h3><p>Shallow tray for keys, cards, and a pen.</p><strong>$54</strong><button class="btn" type="button" data-add>Add to cart</button></article>
      </div>
      <div class="cart-bar" data-cart>Your cart is empty.</div>
      <div class="hero-actions"><button class="btn" type="button" data-checkout>Place order</button></div>
    </section>
    <section class="section" id="story">
      <h2>Made in small batches</h2>
      <p class="lede">Lumen Goods is a starter storefront. Swap the photos and prices, then persist orders with MongoDB.</p>
    </section>`,
});

export const websiteBlueprints: WebsiteBlueprint[] = [
  bundle({
    id: "landing",
    label: "Landing page",
    description: "Studio site with services, work, and a lead form",
    summary: "A product-studio landing page with a hero, services, project cards, and a contact form that posts leads to Express.",
    resource: "leads",
    mode: "lead",
    html: landingHtml,
    seed: [
      { title: "Harbor Analytics", summary: "Marketing site and lead capture for a data studio.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", tag: "Case study", price: 0 },
      { title: "Field School", summary: "Course catalog with a small content API.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80", tag: "Case study", price: 0 },
      { title: "Lumen Goods", summary: "Storefront with cart checkout posted to the API.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80", tag: "Case study", price: 0 },
    ],
  }),
  bundle({
    id: "portfolio",
    label: "Portfolio",
    description: "Case-study grid plus a project inquiry form",
    summary: "A designer portfolio whose projects load from GET /api/projects and whose inquiry form posts to the same API.",
    resource: "projects",
    mode: "catalog",
    html: portfolioHtml,
    seed: [
      { title: "Ledger", summary: "Finance dashboard with a calmer information hierarchy.", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80", tag: "2025", price: 0 },
      { title: "Atlas Travel", summary: "Booking flow reduced from nine steps to four.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", tag: "2024", price: 0 },
      { title: "Signal Audio", summary: "Creator tools for a podcast network.", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80", tag: "2024", price: 0 },
    ],
  }),
  bundle({
    id: "blog",
    label: "Blog",
    description: "Journal layout backed by a posts collection",
    summary: "A journal with essays served by GET /api/posts and a Mongoose model ready for new posts.",
    resource: "posts",
    mode: "catalog",
    html: blogHtml,
    seed: [
      { title: "Preview before the database", summary: "Ship the HTML first. The API can catch up when MongoDB is ready.", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80", tag: "Essay", price: 0 },
      { title: "One page, one server", summary: "Express serves both the static site and the JSON collection.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80", tag: "Build", price: 0 },
      { title: "Write the seed data", summary: "Good sample posts make the empty state feel like a magazine.", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80", tag: "Practice", price: 0 },
    ],
  }),
  bundle({
    id: "store",
    label: "Store",
    description: "Product grid, cart, and order API",
    summary: "A small shop. Products come from GET /api/products and checkout posts an order to /api/orders.",
    resource: "products",
    mode: "cart",
    orders: true,
    html: storeHtml,
    seed: [
      { title: "Arc Lamp", summary: "Brass arm, linen shade, warm bulb included.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80", price: 128, tag: "Lighting" },
      { title: "Stone Cup", summary: "Speckled ceramic, sized for coffee.", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80", price: 36, tag: "Ceramic" },
      { title: "Oak Tray", summary: "Shallow tray for keys, cards, and a pen.", image: "https://images.unsplash.com/photo-1616628188506-3430c90e9d0d?auto=format&fit=crop&w=1200&q=80", price: 54, tag: "Desk" },
    ],
  }),
];

export function getWebsiteBlueprint(id: string): WebsiteBlueprint | undefined {
  return websiteBlueprints.find((blueprint) => blueprint.id === id);
}

export const FULLSTACK_WEBSITE_INSTRUCTIONS = `
OVERRIDE for the Website Generator automation:
Ignore the three-file limit. This request is a full-stack website. Still keep the browser page as vanilla HTML, CSS, and JavaScript — no React, JSX, or TypeScript.
Return every one of these paths, each on its own line immediately before its code fence:
- client/index.html
- client/styles.css
- client/script.js
- server/index.js
- server/routes/api.js
- server/models/Item.js
- package.json
- .env.example
- README.md

Frontend:
- client/index.html sets data-themed on body, links href="styles.css", and loads src="script.js".
- Build a complete multi-section site for the user's brief: navigation, hero with an Unsplash image, a content section, and a footer.
- Include at least 3 real images from images.unsplash.com.
- client/script.js fetches the JSON API and leaves the static HTML in place if the request fails, so the editor preview still renders.

Backend:
- CommonJS Express in server/index.js with cors, express.json, GET /api/health, the router mounted at /api, and express.static for ../client.
- server/routes/api.js implements GET and POST for the site's main resource and uses an in-memory seed when MongoDB is not connected.
- server/models/Item.js exports a Mongoose schema (title, summary, image, price, tag) and a connect() that returns null when MONGODB_URI is empty.
- package.json has start script "node server/index.js" and dependencies express, cors, dotenv, mongoose.
- .env.example contains PORT and MONGODB_URI.
Customize the copy, palette, and seed records to the brief. Do not drop the server files.`;
