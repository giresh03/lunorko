import type { WebsiteBrief } from "../types";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function buildClientHtml(brief: WebsiteBrief): string {
  const name = escapeHtml(brief.name);
  const features = brief.features
    .map(
      (feature) => `<article class="card">
        <h3>${escapeHtml(feature.title)}</h3>
        <p>${escapeHtml(feature.body)}</p>
      </article>`,
    )
    .join("\n");
  const items = brief.items
    .map(
      (item, index) => `<article class="item">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" width="800" height="600" loading="lazy">
        <div class="item-body">
          <div class="item-top">
            <h3>${escapeHtml(item.title)}</h3>
            ${item.meta ? `<span>${escapeHtml(item.meta)}</span>` : ""}
          </div>
          <p>${escapeHtml(item.body)}</p>
          ${
            brief.kind === "shop"
              ? `<button type="button" class="add" data-sku="${index}" data-title="${escapeHtml(item.title)}" data-price="${escapeHtml(item.meta || "")}">Add to cart</button>`
              : ""
          }
        </div>
      </article>`,
    )
    .join("\n");
  const nav = brief.nav
    .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
    .join("\n");
  const palette = brief.palette;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <meta name="description" content="${escapeHtml(brief.summary)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Outfit:wght@360;480;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    :root {
      --bg: ${palette.bg};
      --surface: ${palette.surface};
      --text: ${palette.text};
      --muted: ${palette.muted};
      --primary: ${palette.primary};
      --accent: ${palette.accent};
    }
  </style>
</head>
<body data-kind="${brief.kind}" data-themed>
  <header class="site-header">
    <a class="brand" href="#top">${name}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav">
      ${nav}
    </nav>
  </header>
  <main id="top">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(brief.kind)}</p>
        <h1>${escapeHtml(brief.tagline)}</h1>
        <p class="lede">${escapeHtml(brief.summary)}</p>
        <div class="actions">
          <a class="button" href="#contact">${escapeHtml(brief.primaryCta)}</a>
          <a class="button ghost" href="#work">${escapeHtml(brief.secondaryCta)}</a>
        </div>
      </div>
      <img class="hero-image" src="${escapeHtml(brief.heroImage)}" alt="" width="1600" height="900">
    </section>
    <section id="features" class="section">
      <div class="section-head">
        <h2>Built as a full stack</h2>
        <p>The page you are reading is the client. The same story is available from the API.</p>
      </div>
      <div class="grid">${features}</div>
    </section>
    <section id="work" class="section">
      <div class="section-head">
        <h2>${escapeHtml(brief.itemsHeading)}</h2>
      </div>
      <div class="items">${items}</div>
      ${brief.kind === "shop" ? `<aside class="cart" id="cart" aria-live="polite"><h3>Cart</h3><p id="cart-lines">Your cart is empty.</p><p id="cart-total"></p></aside>` : ""}
    </section>
    <section id="contact" class="section contact">
      <div>
        <h2>${escapeHtml(brief.contactHeading)}</h2>
        <p>${escapeHtml(brief.contactHint)}</p>
      </div>
      <form id="contact-form">
        <label>Name<input name="name" autocomplete="name" required></label>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Message<textarea name="message" rows="4" required></textarea></label>
        <button class="button" type="submit">Send</button>
        <p id="form-status" role="status"></p>
      </form>
    </section>
  </main>
  <footer>
    <span>${name}</span>
    <span>Client preview · Node API on /api</span>
  </footer>
  <script id="site-data" type="application/json">${jsonForScript({
    name: brief.name,
    kind: brief.kind,
    tagline: brief.tagline,
    summary: brief.summary,
    features: brief.features,
    items: brief.items,
  })}</script>
  <script src="app.js"></script>
</body>
</html>
`;
}

export function buildClientCss(): string {
  return `* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background:
    radial-gradient(900px 420px at 10% -10%, color-mix(in srgb, var(--primary) 35%, transparent), transparent 60%),
    var(--bg);
  color: var(--text);
  font-family: Outfit, "Segoe UI", sans-serif;
  line-height: 1.5;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
.site-header, main, footer { position: relative; z-index: 1; }
.site-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 6vw;
  position: sticky;
  top: 0;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
}
.brand { font-family: Fraunces, Georgia, serif; font-size: 1.25rem; text-decoration: none; }
nav { display: flex; gap: 18px; margin-left: auto; }
nav a { text-decoration: none; color: var(--muted); font-size: 0.95rem; }
nav a:hover { color: var(--text); }
.nav-toggle { display: none; margin-left: auto; background: transparent; color: var(--text); border: 1px solid color-mix(in srgb, var(--text) 25%, transparent); border-radius: 999px; padding: 8px 12px; }
.hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; padding: 48px 6vw 24px; }
.eyebrow { letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); font-size: 0.75rem; margin: 0 0 12px; }
h1, h2, h3 { font-family: Fraunces, Georgia, serif; font-weight: 560; letter-spacing: -0.03em; }
h1 { font-size: clamp(2.4rem, 5vw, 4.6rem); line-height: 1.02; margin: 0 0 16px; }
.lede { font-size: 1.1rem; color: var(--muted); max-width: 38rem; }
.hero-image { width: 100%; height: min(520px, 70vh); object-fit: cover; border-radius: 28px; }
.actions, .grid, .items { display: flex; gap: 12px; flex-wrap: wrap; }
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #0c0c10;
  text-decoration: none;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font: 600 0.95rem Outfit, sans-serif;
  cursor: pointer;
}
.button.ghost { background: transparent; color: var(--text); border: 1px solid color-mix(in srgb, var(--text) 30%, transparent); }
.section { padding: 28px 6vw 10px; }
.section-head { max-width: 40rem; margin-bottom: 18px; }
.section-head p, .card p, .item p, .contact p { color: var(--muted); }
.grid, .items { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.card, .item, form, .cart {
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  border-radius: 22px;
}
.card, .item-body, form, .cart { padding: 18px; }
.item { overflow: hidden; display: flex; flex-direction: column; }
.item img { height: 190px; width: 100%; object-fit: cover; }
.item-top, .cart { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.item-top span { color: var(--accent); font-weight: 600; }
.add { margin-top: 8px; }
.contact { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 24px; align-items: start; }
form { display: grid; gap: 12px; }
label { display: grid; gap: 6px; font-size: 0.85rem; color: var(--muted); }
input, textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  color: var(--text);
  padding: 12px;
  font: inherit;
}
footer { display: flex; justify-content: space-between; gap: 12px; padding: 28px 6vw 40px; color: var(--muted); font-size: 0.9rem; }
@media (max-width: 860px) {
  .hero, .contact, .grid, .items { grid-template-columns: 1fr; }
  .nav-toggle { display: inline-flex; }
  nav { display: none; position: absolute; top: 64px; right: 6vw; flex-direction: column; padding: 12px; background: var(--surface); border-radius: 16px; }
  nav.open { display: flex; }
}
`;
}

export function buildClientJs(): string {
  return `const embedded = JSON.parse(document.getElementById("site-data").textContent || "{}");

async function loadSite() {
  try {
    const response = await fetch("/api/site");
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch {
    return embedded;
  }
}

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function setupCart() {
  if (document.body.dataset.kind !== "shop") return;
  const lines = document.querySelector("#cart-lines");
  const total = document.querySelector("#cart-total");
  const cart = [];
  const render = () => {
    if (!lines || !total) return;
    if (cart.length === 0) {
      lines.textContent = "Your cart is empty.";
      total.textContent = "";
      return;
    }
    lines.textContent = cart.map((item) => item.title + " × " + item.qty).join(", ");
    const sum = cart.reduce((amount, item) => amount + item.qty * item.price, 0);
    total.textContent = "Total $" + sum;
  };
  document.querySelectorAll(".add").forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.getAttribute("data-title") || "Item";
      const price = Number(String(button.getAttribute("data-price") || "").replace(/[^0-9.]/g, "")) || 0;
      const existing = cart.find((item) => item.title === title);
      if (existing) existing.qty += 1;
      else cart.push({ title, price, qty: 1 });
      render();
    });
  });
}

function setupForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form));
    status.textContent = "Sending…";
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        status.textContent = data.error || "The API rejected this note.";
        return;
      }
      status.textContent = "Sent. The API accepted your note.";
      form.reset();
    } catch {
      status.textContent = "The preview saved this locally. Start the server with npm start to deliver it.";
    }
  });
}

loadSite().then((site) => {
  document.title = site.name || document.title;
}).catch(() => {});
setupNav();
setupCart();
setupForm();
`;
}
