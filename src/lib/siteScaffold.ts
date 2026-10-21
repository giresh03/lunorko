/**
 * Multi-page site scaffolding for the Lunor.AI editor preview.
 *
 * Guarantees that a generated site has a consistent structure:
 *  1. every .html page links the shared styles.css / script.js (tag injected when missing)
 *  2. every page carries a site nav that links to EVERY page in the project
 *     (a standard nav is injected when the page has none)
 *  3. the current page's nav link is marked active (class="active" + aria-current="page")
 */

const NAV_MARK = "__site-nav";

/** Account/utility pages the AI links deliberately — never auto-append them to the main nav. */
const UTILITY_PAGE =
  /^(login|signin|sign-in|signup|sign-up|register|logout|verify|admin|dashboard|account|profile|settings|cart|checkout|orders?|bookings?|order-success|booking-success|payment(-success)?|receipt|confirmation|reset-password|forgot-password|404|thank-you|success|learn|course|room|product|post|article|detail|item)\.html$/i;

/** All HTML page names in the project, index.html first, then alphabetical. */
export function listPages(allFiles: Record<string, string>): string[] {
  const names = Object.keys(allFiles)
    .filter((n) => n.toLowerCase().endsWith(".html"))
    .map((n) => n.split("/").pop() || n);
  const unique = Array.from(new Set(names));
  return unique.sort((a, b) => {
    if (a === "index.html") return -1;
    if (b === "index.html") return 1;
    return a.localeCompare(b);
  });
}

/** "about-us.html" -> "About Us" */
function labelFor(page: string): string {
  if (page === "index.html") return "Home";
  return page
    .replace(/\.html$/i, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function findSharedAsset(allFiles: Record<string, string>, name: string): string | null {
  if (allFiles[name] != null) return name;
  const match = Object.keys(allFiles).find((k) => (k.split("/").pop() || k) === name);
  return match ?? null;
}

/** Insert `snippet` right before the closing tag, or append as a fallback. */
function insertBefore(html: string, closingTag: RegExp, snippet: string): string {
  if (closingTag.test(html)) return html.replace(closingTag, (m) => `${snippet}\n${m}`);
  return html + snippet;
}

function ensureSharedAssets(html: string, allFiles: Record<string, string>): string {
  let out = html;

  const cssName = findSharedAsset(allFiles, "styles.css");
  if (cssName && !/<link[^>]+href=["'][^"']*styles\.css["']/i.test(out)) {
    out = insertBefore(out, /<\/head>/i, `<link rel="stylesheet" href="styles.css">`);
  }

  const jsName = findSharedAsset(allFiles, "script.js");
  if (jsName && !/<script[^>]+src=["'][^"']*script\.js["']/i.test(out)) {
    out = insertBefore(out, /<\/body>/i, `<script src="script.js" defer></script>`);
  }

  return out;
}

const NAV_STYLE = `<style id="${NAV_MARK}-style">
.${NAV_MARK}{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;padding:1rem 1.5rem;font-family:inherit;border-bottom:1px solid rgba(127,127,127,.25)}
.${NAV_MARK} a{text-decoration:none;color:inherit;opacity:.7;transition:opacity .2s ease}
.${NAV_MARK} a:hover{opacity:1}
.${NAV_MARK} a.active{opacity:1;font-weight:600}
</style>`;

/**
 * Returns the existing nav/header markup that already contains page links,
 * or null when the page has no navigation.
 */
function findNavBlock(html: string): { block: string; index: number } | null {
  const regex = /<(nav|header)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    if (/<a[^>]+href=["'][^"']*\.html["']/i.test(m[0]) || /<a[^>]+href=["']\.?\/?["']/i.test(m[0])) {
      return { block: m[0], index: m.index };
    }
  }
  return null;
}

function normalizeHref(href: string): string {
  const clean = (href || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  if (!name || name === "." || name === "/") return "index.html";
  return name;
}

/** Add missing page links to an existing nav and mark the active one. */
function reconcileNav(block: string, pages: string[], current: string): string {
  const present = new Set<string>();
  const linkRegex = /<a\b[^>]*href=["']([^"']*)["'][^>]*>[\s\S]*?<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(block)) !== null) {
    const name = normalizeHref(m[1]);
    if (pages.includes(name)) present.add(name);
  }

  let out = block;

  // Reset then apply the active marker on the current page's link.
  out = out.replace(linkRegex, (full, href: string) => {
    const name = normalizeHref(href);
    let link = full
      .replace(/\s+aria-current=["'][^"']*["']/gi, "")
      .replace(/class=["']([^"']*)["']/i, (_c, cls: string) => {
        const kept = String(cls)
          .split(/\s+/)
          .filter((c) => c && c !== "active")
          .join(" ");
        return kept ? `class="${kept}"` : "";
      });
    if (pages.includes(name) && name === current) {
      link = /class=["']/i.test(link)
        ? link.replace(/class=["']([^"']*)["']/i, (_c, cls: string) => `class="${cls} active"`)
        : link.replace(/<a\b/i, `<a class="active"`);
      link = link.replace(/<a\b/i, `<a aria-current="page"`);
    }
    return link;
  });

  const missing = pages.filter((p) => !present.has(p) && !UTILITY_PAGE.test(p));
  if (missing.length) {
    const extra = missing
      .map(
        (p) =>
          `<a href="${p}"${p === current ? ` class="active" aria-current="page"` : ""}>${labelFor(p)}</a>`,
      )
      .join("\n");
    out = out.replace(/<\/(nav|header)>\s*$/i, (m2) => `\n${extra}\n${m2}`);
  }

  return out;
}

function buildNav(pages: string[], current: string): string {
  const links = pages
    .map(
      (p) =>
        `<a href="${p}"${p === current ? ` class="active" aria-current="page"` : ""}>${labelFor(p)}</a>`,
    )
    .join("");
  return `${NAV_STYLE}\n<nav class="${NAV_MARK}" aria-label="Site">${links}</nav>`;
}

function ensureNav(html: string, pages: string[], current: string): string {
  if (pages.length < 2) return html;

  const existing = findNavBlock(html);
  if (existing) {
    const reconciled = reconcileNav(existing.block, pages, current);
    return (
      html.slice(0, existing.index) +
      reconciled +
      html.slice(existing.index + existing.block.length)
    );
  }

  const nav = buildNav(pages, current);
  if (/<body\b[^>]*>/i.test(html)) {
    return html.replace(/<body\b[^>]*>/i, (m) => `${m}\n${nav}`);
  }
  return nav + html;
}

/**
 * Scaffold a single page: shared asset tags + consistent site navigation.
 * Safe to run on already-consistent pages (idempotent).
 */
export function scaffoldPage(
  pageName: string,
  html: string,
  allFiles: Record<string, string>,
): string {
  const pages = listPages(allFiles);
  const current = pageName.split("/").pop() || pageName;
  let out = ensureSharedAssets(html, allFiles);
  out = ensureNav(out, pages, current);
  return out;
}
