/**
 * Full-stack website blueprints for the Web Development AI assistant.
 * Each blueprint is a browser-previewable client plus an Express API.
 */

export interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

export interface ProjectTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: ProjectTreeNode[];
  isOpen?: boolean;
}

export interface WebsiteBlueprint {
  id: string;
  icon: string;
  label: string;
  description: string;
  stack: string;
  routes: string[];
  files: GeneratedFile[];
}

interface Palette {
  font: string;
  bg: string;
  text: string;
  muted: string;
  card: string;
  accent: string;
  accentText: string;
  border: string;
}

function upsertProjectFile(
  tree: ProjectTreeNode[],
  filePath: string,
  file: { language: string; content: string },
): ProjectTreeNode[] {
  const parts = filePath.split("/").filter(Boolean);
  const fileName = parts[parts.length - 1];
  const folders = parts.slice(0, -1);

  const walk = (nodes: ProjectTreeNode[], depth: number, prefix: string): ProjectTreeNode[] => {
    if (depth === folders.length) {
      const id = prefix ? `${prefix}/${fileName}` : fileName;
      const next: ProjectTreeNode = {
        id,
        name: fileName,
        type: "file",
        language: file.language,
        content: file.content,
      };
      const index = nodes.findIndex((node) => node.type === "file" && node.id === id);
      if (index >= 0) {
        return nodes.map((node, i) => (i === index ? { ...node, ...next } : node));
      }
      return [...nodes, next];
    }

    const folderName = folders[depth];
    const folderId = prefix ? `${prefix}/${folderName}` : folderName;
    const index = nodes.findIndex((node) => node.type === "folder" && node.id === folderId);
    if (index === -1) {
      return [
        ...nodes,
        {
          id: folderId,
          name: folderName,
          type: "folder",
          isOpen: true,
          children: walk([], depth + 1, folderId),
        },
      ];
    }

    return nodes.map((node, i) => {
      if (i !== index) return node;
      return {
        ...node,
        isOpen: true,
        children: walk(node.children || [], depth + 1, node.id),
      };
    });
  };

  return walk(tree, 0, "");
}

export function filesToTree(files: GeneratedFile[]): ProjectTreeNode[] {
  return files.reduce(
    (tree, file) => upsertProjectFile(tree, file.path, { language: file.language, content: file.content }),
    [] as ProjectTreeNode[],
  );
}

export function upsertProjectFiles(
  tree: ProjectTreeNode[],
  files: { path: string; language: string; content: string }[],
): ProjectTreeNode[] {
  return files.reduce(
    (next, file) => upsertProjectFile(next, file.path, { language: file.language, content: file.content }),
    tree,
  );
}

function packageJson(name: string): string {
  return `{
  "name": "${name}",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.2"
  }
}
`;
}

function serverIndex(siteName: string): string {
  return `const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));
app.use("/api", routes);

app.listen(PORT, () => {
  console.log("${siteName} is running at http://localhost:" + PORT);
});
`;
}

function readme(title: string, summary: string, routes: string[]): string {
  const routeLines = routes.map((route) => `- \`${route}\``).join("\n");
  return `# ${title}

${summary}

## Run the full stack

\`\`\`bash
cd server
npm install
npm start
\`\`\`

Open http://localhost:3000. The Express server serves \`client/\` and the JSON API.

## API

${routeLines}

The in-editor preview loads \`client/\` by itself. \`client/app.js\` uses sample data when the API is offline, then switches to live JSON after you start the server.
`;
}

function envExample(): GeneratedFile {
  return {
    path: ".env.example",
    language: "plaintext",
    content: "PORT=3000\n",
  };
}

function layoutCss(palette: Palette): string {
  return `:root {
  --bg: ${palette.bg};
  --text: ${palette.text};
  --muted: ${palette.muted};
  --card: ${palette.card};
  --accent: ${palette.accent};
  --accent-text: ${palette.accentText};
  --border: ${palette.border};
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: ${palette.font};
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}
img { max-width: 100%; display: block; object-fit: cover; }
a { color: inherit; text-decoration: none; }
button, input, textarea {
  font: inherit;
}
.wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
}
.brand { font-weight: 700; letter-spacing: -0.03em; }
.nav-links { display: flex; gap: 18px; color: var(--muted); font-size: 0.95rem; }
.btn {
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-text);
  padding: 12px 18px;
  cursor: pointer;
}
.btn.ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}
.hero, .section { padding: 28px 0 64px; }
.grid { display: grid; gap: 18px; }
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
}
.card-body { padding: 18px; }
.muted { color: var(--muted); }
label { display: block; font-size: 0.85rem; margin-bottom: 6px; }
input, textarea {
  width: 100%;
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
}
.status { min-height: 1.2em; font-size: 0.9rem; }
@media (max-width: 800px) {
  .nav-links { display: none; }
  .split, .cols-3, .cols-2 { grid-template-columns: 1fr !important; }
}
`;
}

function shell(title: string, fontHref: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="${fontHref}">
  <link rel="stylesheet" href="styles.css">
</head>
<body data-themed>
  ${body}
  <script src="app.js"></script>
</body>
</html>
`;
}

const northwindPalette: Palette = {
  font: '"DM Sans", sans-serif',
  bg: "#07111f",
  text: "#eef6f4",
  muted: "#93a4b5",
  card: "#102033",
  accent: "#2dd4bf",
  accentText: "#042f2e",
  border: "#1e3348",
};

const portfolioPalette: Palette = {
  font: '"Outfit", sans-serif',
  bg: "#12100e",
  text: "#f6f1ea",
  muted: "#b6aa9d",
  card: "#1c1916",
  accent: "#e7a06a",
  accentText: "#2a1608",
  border: "#3a3128",
};

const blogPalette: Palette = {
  font: '"Source Serif 4", Georgia, serif',
  bg: "#f6f1e7",
  text: "#1c1917",
  muted: "#57534e",
  card: "#fffaf3",
  accent: "#3f6212",
  accentText: "#f7fee7",
  border: "#e7e0d4",
};

const shopPalette: Palette = {
  font: '"Manrope", sans-serif',
  bg: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  card: "#ffffff",
  accent: "#4f46e5",
  accentText: "#ffffff",
  border: "#e2e8f0",
};

function northwind(): WebsiteBlueprint {
  const routes = ["GET /api/health", "GET /api/plans", "POST /api/contact"];
  return {
    id: "saas-landing",
    icon: "🚀",
    label: "SaaS landing",
    description: "Marketing page, pricing, and a contact API",
    stack: "HTML · CSS · JS · Express",
    routes,
    files: [
      {
        path: "client/index.html",
        language: "html",
        content: shell(
          "Northwind — Ship calmer software",
          "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap",
          `<header class="wrap nav">
      <div class="brand">Northwind</div>
      <nav class="nav-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#contact">Contact</a>
      </nav>
      <a class="btn" href="#contact">Book a demo</a>
    </header>
    <main>
      <section class="wrap hero split">
        <div>
          <p class="muted">Operations platform for small teams</p>
          <h1>Ship the week without another status meeting.</h1>
          <p class="muted">Northwind keeps requests, owners, and launch notes in one calm workspace. This page is the client. The plans and contact form talk to an Express API.</p>
          <a class="btn" href="#pricing">See plans</a>
        </div>
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" alt="Team working on a laptop" width="640" height="420">
      </section>
      <section id="features" class="wrap section">
        <h2>What the product covers</h2>
        <div class="grid cols-3" id="features-grid"></div>
      </section>
      <section id="pricing" class="wrap section">
        <h2>Plans from the API</h2>
        <div class="grid cols-3" id="plans"></div>
      </section>
      <section id="contact" class="wrap section">
        <h2>Talk to the team</h2>
        <form id="contact-form" class="card card-body">
          <label for="name">Name</label>
          <input id="name" name="name" required>
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required>
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="4" required></textarea>
          <button class="btn" type="submit">Send</button>
          <p id="contact-status" class="status"></p>
        </form>
      </section>
    </main>`,
        ),
      },
      {
        path: "client/styles.css",
        language: "css",
        content: `${layoutCss(northwindPalette)}
h1 { font-size: clamp(2.4rem, 5vw, 4.4rem); line-height: 1.05; letter-spacing: -0.045em; margin: 8px 0 16px; }
.split { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 36px; align-items: center; }
.split img { width: 100%; height: 420px; border-radius: 24px; }
.cols-3 { grid-template-columns: repeat(3, 1fr); }
.plan { padding: 22px; }
.plan strong { font-size: 1.8rem; }
`,
      },
      {
        path: "client/app.js",
        language: "javascript",
        content: `const features = [
  { title: "Shared queue", copy: "Every request has an owner, a due date, and a short note." },
  { title: "Launch log", copy: "A timeline the whole team can read without opening a slide deck." },
  { title: "Quiet alerts", copy: "One digest a day instead of a channel that never sleeps." },
];

const samplePlans = [
  { name: "Starter", price: 19, detail: "Up to 5 teammates and the shared queue." },
  { name: "Team", price: 49, detail: "Unlimited projects, launch log, and guest access." },
  { name: "Studio", price: 99, detail: "Priority support and a private onboarding call." },
];

function renderFeatures() {
  document.getElementById("features-grid").innerHTML = features.map((item) =>
    \`<article class="card card-body"><h3>\${item.title}</h3><p class="muted">\${item.copy}</p></article>\`
  ).join("");
}

function renderPlans(plans) {
  document.getElementById("plans").innerHTML = plans.map((plan) =>
    \`<article class="card plan"><h3>\${plan.name}</h3><strong>$\${plan.price}</strong><p class="muted">\${plan.detail}</p></article>\`
  ).join("");
}

async function loadPlans() {
  try {
    const response = await fetch("/api/plans");
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch {
    return samplePlans;
  }
}

document.getElementById("contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("contact-status");
  const payload = Object.fromEntries(new FormData(event.currentTarget));
  status.textContent = "Sending…";
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    status.textContent = data.message;
    event.currentTarget.reset();
  } catch {
    status.textContent = "Preview mode: start the server with npm start inside server/ to store this message.";
  }
});

renderFeatures();
loadPlans().then(renderPlans);
`,
      },
      { path: "server/package.json", language: "json", content: packageJson("northwind-api") },
      { path: "server/index.js", language: "javascript", content: serverIndex("Northwind") },
      {
        path: "server/routes.js",
        language: "javascript",
        content: `const express = require("express");
const router = express.Router();

const plans = [
  { name: "Starter", price: 19, detail: "Up to 5 teammates and the shared queue." },
  { name: "Team", price: 49, detail: "Unlimited projects, launch log, and guest access." },
  { name: "Studio", price: 99, detail: "Priority support and a private onboarding call." },
];

const messages = [];

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "northwind" });
});

router.get("/plans", (_req, res) => {
  res.json(plans);
});

router.post("/contact", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  messages.push({ name, email, message, createdAt: new Date().toISOString() });
  res.status(201).json({ message: "Thanks, " + name + ". We saved your note.", count: messages.length });
});

module.exports = router;
`,
      },
      envExample(),
      {
        path: "README.md",
        language: "markdown",
        content: readme(
          "Northwind",
          "A SaaS marketing site with pricing loaded from Express and a contact form that posts to the API.",
          routes,
        ),
      },
    ],
  };
}

function portfolio(): WebsiteBlueprint {
  const routes = ["GET /api/projects", "POST /api/inquiries"];
  return {
    id: "portfolio",
    icon: "🎨",
    label: "Portfolio",
    description: "Selected work grid plus an inquiry API",
    stack: "HTML · CSS · JS · Express",
    routes,
    files: [
      {
        path: "client/index.html",
        language: "html",
        content: shell(
          "Atelier — Mira Chen",
          "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap",
          `<header class="wrap nav">
      <div class="brand">Atelier</div>
      <nav class="nav-links"><a href="#work">Work</a><a href="#about">About</a><a href="#inquiry">Inquiry</a></nav>
    </header>
    <main>
      <section class="wrap hero">
        <p class="muted">Product designer · 2016—now</p>
        <h1>Interfaces with a little warmth left in them.</h1>
      </section>
      <section id="work" class="wrap section">
        <h2>Selected work</h2>
        <div class="grid cols-2" id="projects"></div>
      </section>
      <section id="about" class="wrap section split">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Designers collaborating" width="640" height="420">
        <div>
          <h2>About</h2>
          <p class="muted">Mira designs product marketing sites and small web apps for studios. The project list on this page is served by <code>GET /api/projects</code>.</p>
        </div>
      </section>
      <section id="inquiry" class="wrap section">
        <h2>Start a project</h2>
        <form id="inquiry-form" class="card card-body">
          <label for="name">Name</label>
          <input id="name" name="name" required>
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required>
          <label for="brief">Brief</label>
          <textarea id="brief" name="brief" rows="4" required></textarea>
          <button class="btn" type="submit">Send inquiry</button>
          <p id="inquiry-status" class="status"></p>
        </form>
      </section>
    </main>`,
        ),
      },
      {
        path: "client/styles.css",
        language: "css",
        content: `${layoutCss(portfolioPalette)}
h1 { font-size: clamp(2.8rem, 6vw, 5rem); line-height: 0.98; letter-spacing: -0.05em; max-width: 14ch; }
.cols-2 { grid-template-columns: 1.2fr 0.8fr; }
.project img { width: 100%; height: 240px; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: center; }
.split img { height: 320px; border-radius: 20px; }
`,
      },
      {
        path: "client/app.js",
        language: "javascript",
        content: `const sampleProjects = [
  { title: "Harbor Market", year: "2025", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80", summary: "A shop front for a weekend grocer." },
  { title: "Field Notes", year: "2024", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80", summary: "An editorial blog with a quiet reading view." },
  { title: "Northwind", year: "2024", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80", summary: "Marketing site and pricing for a SaaS team." },
  { title: "Lumen", year: "2023", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", summary: "Product catalog with a small checkout API." },
];

function renderProjects(projects) {
  document.getElementById("projects").innerHTML = projects.map((project) =>
    \`<article class="card project"><img src="\${project.image}" alt="\${project.title}"><div class="card-body"><p class="muted">\${project.year}</p><h3>\${project.title}</h3><p>\${project.summary}</p></div></article>\`
  ).join("");
}

async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch {
    return sampleProjects;
  }
}

document.getElementById("inquiry-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("inquiry-status");
  const payload = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    status.textContent = data.message;
    event.currentTarget.reset();
  } catch {
    status.textContent = "Preview mode: run npm start in server/ to save inquiries.";
  }
});

loadProjects().then(renderProjects);
`,
      },
      { path: "server/package.json", language: "json", content: packageJson("atelier-api") },
      { path: "server/index.js", language: "javascript", content: serverIndex("Atelier") },
      {
        path: "server/routes.js",
        language: "javascript",
        content: `const express = require("express");
const router = express.Router();

const projects = [
  { title: "Harbor Market", year: "2025", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80", summary: "A shop front for a weekend grocer." },
  { title: "Field Notes", year: "2024", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80", summary: "An editorial blog with a quiet reading view." },
  { title: "Northwind", year: "2024", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80", summary: "Marketing site and pricing for a SaaS team." },
  { title: "Lumen", year: "2023", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", summary: "Product catalog with a small checkout API." },
];

const inquiries = [];

router.get("/projects", (_req, res) => {
  res.json(projects);
});

router.post("/inquiries", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const brief = String(req.body.brief || "").trim();
  if (!name || !email || !brief) {
    return res.status(400).json({ error: "Name, email, and brief are required." });
  }
  inquiries.push({ name, email, brief, createdAt: new Date().toISOString() });
  res.status(201).json({ message: "Inquiry saved. Mira will reply to " + email + ".", count: inquiries.length });
});

module.exports = router;
`,
      },
      envExample(),
      {
        path: "README.md",
        language: "markdown",
        content: readme(
          "Atelier",
          "A portfolio site. The work grid reads from the API and the inquiry form posts a brief.",
          routes,
        ),
      },
    ],
  };
}

function blog(): WebsiteBlueprint {
  const routes = ["GET /api/posts", "GET /api/posts/:slug", "POST /api/posts"];
  return {
    id: "blog",
    icon: "✍️",
    label: "Blog",
    description: "Article list, reader, and a posts API",
    stack: "HTML · CSS · JS · Express",
    routes,
    files: [
      {
        path: "client/index.html",
        language: "html",
        content: shell(
          "Field Notes",
          "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,700&display=swap",
          `<header class="wrap nav">
      <div class="brand">Field Notes</div>
      <button class="btn ghost" id="new-post" type="button">New note</button>
    </header>
    <main class="wrap split section">
      <section>
        <h1>Notes on building small websites.</h1>
        <div id="posts" class="grid"></div>
      </section>
      <article id="reader" class="card card-body">
        <p class="muted">Select a note.</p>
      </article>
    </main>
    <form id="post-form" class="wrap card card-body" hidden>
      <h2>Write a note</h2>
      <label for="title">Title</label>
      <input id="title" name="title" required>
      <label for="excerpt">Excerpt</label>
      <input id="excerpt" name="excerpt" required>
      <label for="body">Body</label>
      <textarea id="body" name="body" rows="5" required></textarea>
      <button class="btn" type="submit">Publish</button>
      <p id="post-status" class="status"></p>
    </form>`,
        ),
      },
      {
        path: "client/styles.css",
        language: "css",
        content: `${layoutCss(blogPalette)}
h1 { font-size: clamp(2.2rem, 4vw, 3.4rem); letter-spacing: -0.03em; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.post-btn { width: 100%; text-align: left; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; cursor: pointer; }
#post-form { margin: 0 auto 64px; }
`,
      },
      {
        path: "client/app.js",
        language: "javascript",
        content: `const samplePosts = [
  { slug: "preview-first", title: "Build the page so it works before the server does", excerpt: "Sample data keeps the preview honest.", body: "The client tries GET /api/posts. If that fails, these notes still render. Start the Express server and the same screen reads from JSON." },
  { slug: "one-folder-each", title: "Keep the client and the API in separate folders", excerpt: "client/ is static. server/ is Express.", body: "Express serves the client folder and mounts routes at /api. That is the whole full-stack loop for this site." },
  { slug: "forms-that-fail-softly", title: "Let forms explain the offline case", excerpt: "A failed fetch is a teaching moment.", body: "Publishing posts to POST /api/posts. In the editor preview the request fails on purpose, and the status line tells you how to run the API." },
];

let posts = samplePosts;

function renderList() {
  document.getElementById("posts").innerHTML = posts.map((post) =>
    \`<button class="post-btn" type="button" data-slug="\${post.slug}"><strong>\${post.title}</strong><p class="muted">\${post.excerpt}</p></button>\`
  ).join("");
}

function renderPost(post) {
  document.getElementById("reader").innerHTML = \`<p class="muted">\${post.slug}</p><h2>\${post.title}</h2><p>\${post.body}</p>\`;
}

async function loadPosts() {
  try {
    const response = await fetch("/api/posts");
    if (!response.ok) throw new Error("API unavailable");
    posts = await response.json();
  } catch {
    posts = samplePosts;
  }
  renderList();
  if (posts[0]) renderPost(posts[0]);
}

document.getElementById("posts").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-slug]");
  if (!button) return;
  const slug = button.dataset.slug;
  try {
    const response = await fetch("/api/posts/" + slug);
    if (!response.ok) throw new Error("API unavailable");
    renderPost(await response.json());
  } catch {
    const local = posts.find((post) => post.slug === slug);
    if (local) renderPost(local);
  }
});

document.getElementById("new-post").addEventListener("click", () => {
  document.getElementById("post-form").hidden = false;
});

document.getElementById("post-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.getElementById("post-status");
  const payload = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Request failed");
    status.textContent = "Published.";
    event.currentTarget.reset();
    await loadPosts();
  } catch {
    status.textContent = "Preview mode: run npm start in server/ to publish.";
  }
});

loadPosts();
`,
      },
      { path: "server/package.json", language: "json", content: packageJson("field-notes-api") },
      { path: "server/index.js", language: "javascript", content: serverIndex("Field Notes") },
      {
        path: "server/routes.js",
        language: "javascript",
        content: `const express = require("express");
const router = express.Router();

const posts = [
  { slug: "preview-first", title: "Build the page so it works before the server does", excerpt: "Sample data keeps the preview honest.", body: "The client tries GET /api/posts. If that fails, these notes still render. Start the Express server and the same screen reads from JSON." },
  { slug: "one-folder-each", title: "Keep the client and the API in separate folders", excerpt: "client/ is static. server/ is Express.", body: "Express serves the client folder and mounts routes at /api. That is the whole full-stack loop for this site." },
  { slug: "forms-that-fail-softly", title: "Let forms explain the offline case", excerpt: "A failed fetch is a teaching moment.", body: "Publishing posts to POST /api/posts. In the editor preview the request fails on purpose, and the status line tells you how to run the API." },
];

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "note";
}

router.get("/posts", (_req, res) => {
  res.json(posts);
});

router.get("/posts/:slug", (req, res) => {
  const post = posts.find((item) => item.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: "Post not found." });
  res.json(post);
});

router.post("/posts", (req, res) => {
  const title = String(req.body.title || "").trim();
  const excerpt = String(req.body.excerpt || "").trim();
  const body = String(req.body.body || "").trim();
  if (!title || !excerpt || !body) {
    return res.status(400).json({ error: "Title, excerpt, and body are required." });
  }
  const post = { slug: slugify(title), title, excerpt, body };
  posts.unshift(post);
  res.status(201).json(post);
});

module.exports = router;
`,
      },
      envExample(),
      {
        path: "README.md",
        language: "markdown",
        content: readme(
          "Field Notes",
          "A small blog. The list and reader use the posts API, and the form creates a note.",
          routes,
        ),
      },
    ],
  };
}

function shop(): WebsiteBlueprint {
  const routes = ["GET /api/products", "POST /api/orders"];
  return {
    id: "shop",
    icon: "🛍️",
    label: "Shop",
    description: "Product catalog, cart, and an orders API",
    stack: "HTML · CSS · JS · Express",
    routes,
    files: [
      {
        path: "client/index.html",
        language: "html",
        content: shell(
          "Lumen Market",
          "https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap",
          `<header class="wrap nav">
      <div class="brand">Lumen Market</div>
      <button class="btn ghost" id="cart-toggle" type="button">Cart (0)</button>
    </header>
    <main class="wrap split section">
      <section>
        <h1>Objects for a quieter desk.</h1>
        <div class="grid cols-2" id="products"></div>
      </section>
      <aside id="cart" class="card card-body">
        <h2>Cart</h2>
        <div id="cart-lines"></div>
        <p id="cart-total" class="muted">Total $0</p>
        <button class="btn" id="checkout" type="button">Place order</button>
        <p id="order-status" class="status"></p>
      </aside>
    </main>`,
        ),
      },
      {
        path: "client/styles.css",
        language: "css",
        content: `${layoutCss(shopPalette)}
h1 { font-size: clamp(2.2rem, 4vw, 3.6rem); letter-spacing: -0.04em; }
.split { display: grid; grid-template-columns: 1.5fr 0.7fr; gap: 24px; align-items: start; }
.cols-2 { grid-template-columns: 1fr 1fr; }
.product img { width: 100%; height: 180px; }
.line { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); }
`,
      },
      {
        path: "client/app.js",
        language: "javascript",
        content: `const sampleProducts = [
  { id: "lamp", name: "Arc lamp", price: 84, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
  { id: "notebook", name: "Cloth notebook", price: 18, image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80" },
  { id: "cup", name: "Stoneware cup", price: 26, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80" },
  { id: "speaker", name: "Desk speaker", price: 120, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80" },
];

const cart = new Map();

function money(cents) {
  return "$" + cents;
}

function renderProducts(products) {
  document.getElementById("products").innerHTML = products.map((product) =>
    \`<article class="card product"><img src="\${product.image}" alt="\${product.name}"><div class="card-body"><h3>\${product.name}</h3><p class="muted">\${money(product.price)}</p><button class="btn" type="button" data-id="\${product.id}">Add</button></div></article>\`
  ).join("");
  document.getElementById("products").onclick = (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    const product = products.find((item) => item.id === button.dataset.id);
    if (!product) return;
    const current = cart.get(product.id) || { ...product, qty: 0 };
    current.qty += 1;
    cart.set(product.id, current);
    renderCart();
  };
}

function renderCart() {
  const lines = [...cart.values()];
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  document.getElementById("cart-toggle").textContent = "Cart (" + lines.reduce((sum, line) => sum + line.qty, 0) + ")";
  document.getElementById("cart-lines").innerHTML = lines.length
    ? lines.map((line) => \`<div class="line"><span>\${line.name} × \${line.qty}</span><span>\${money(line.price * line.qty)}</span></div>\`).join("")
    : "<p class=\\"muted\\">Your cart is empty.</p>";
  document.getElementById("cart-total").textContent = "Total " + money(total);
}

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch {
    return sampleProducts;
  }
}

document.getElementById("checkout").addEventListener("click", async () => {
  const status = document.getElementById("order-status");
  const items = [...cart.values()].map((line) => ({ id: line.id, qty: line.qty }));
  if (!items.length) {
    status.textContent = "Add something first.";
    return;
  }
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) throw new Error("Request failed");
    const order = await response.json();
    status.textContent = "Order " + order.id + " placed. Total " + money(order.total) + ".";
    cart.clear();
    renderCart();
  } catch {
    status.textContent = "Preview mode: run npm start in server/ to place the order.";
  }
});

loadProducts().then((products) => {
  renderProducts(products);
  renderCart();
});
`,
      },
      { path: "server/package.json", language: "json", content: packageJson("lumen-market-api") },
      { path: "server/index.js", language: "javascript", content: serverIndex("Lumen Market") },
      {
        path: "server/routes.js",
        language: "javascript",
        content: `const express = require("express");
const router = express.Router();

const products = [
  { id: "lamp", name: "Arc lamp", price: 84, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80" },
  { id: "notebook", name: "Cloth notebook", price: 18, image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80" },
  { id: "cup", name: "Stoneware cup", price: 26, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80" },
  { id: "speaker", name: "Desk speaker", price: 120, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80" },
];

const orders = [];

router.get("/products", (_req, res) => {
  res.json(products);
});

router.post("/orders", (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: "Cart is empty." });
  const detailed = items.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    const qty = Number(item.qty) || 0;
    if (!product || qty < 1) return null;
    return { id: product.id, name: product.name, qty, lineTotal: product.price * qty };
  }).filter(Boolean);
  if (!detailed.length) return res.status(400).json({ error: "No valid items." });
  const order = {
    id: "ord_" + (orders.length + 1),
    items: detailed,
    total: detailed.reduce((sum, line) => sum + line.lineTotal, 0),
  };
  orders.push(order);
  res.status(201).json(order);
});

module.exports = router;
`,
      },
      envExample(),
      {
        path: "README.md",
        language: "markdown",
        content: readme(
          "Lumen Market",
          "A small shop. Products come from the API, the cart stays in the browser, and checkout posts an order.",
          routes,
        ),
      },
    ],
  };
}

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [northwind(), portfolio(), blog(), shop()];

export function getWebsiteBlueprint(id: string): WebsiteBlueprint | undefined {
  return WEBSITE_BLUEPRINTS.find((blueprint) => blueprint.id === id);
}

export function blueprintAssistantMessage(blueprint: WebsiteBlueprint): string {
  const routeList = blueprint.routes.map((route) => `- \`${route}\``).join("\n");
  return `**${blueprint.label}** is in the editor and the preview is open.

**Client** (\`client/\`) is vanilla HTML, CSS, and JavaScript. It renders with sample data when the API is offline, so you can see the site immediately.

**API** (\`server/\`) is Express. It serves the client folder and these routes:

${routeList}

Run it on your machine:

\`\`\`bash
cd server
npm install
npm start
\`\`\`

Then open http://localhost:3000. Ask me to change the copy, colors, sections, or API fields.`;
}

export const CUSTOM_WEBSITE_PROMPT = "Build a full-stack website with client/index.html, client/styles.css, client/app.js, and an Express API in server/. The page should work in preview with sample data if the API is offline. Site idea: ";
