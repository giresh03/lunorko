import type { WebsiteBrief, WebsiteKind } from "../types";

const COLLECTION_PATH: Record<WebsiteKind, string> = {
  landing: "/api/offers",
  portfolio: "/api/projects",
  restaurant: "/api/menu",
  saas: "/api/plans",
  shop: "/api/products",
  blog: "/api/posts",
};

export function collectionPath(kind: WebsiteKind): string {
  return COLLECTION_PATH[kind];
}

function siteRecord(brief: WebsiteBrief) {
  return {
    name: brief.name,
    slug: brief.slug,
    kind: brief.kind,
    tagline: brief.tagline,
    summary: brief.summary,
    features: brief.features,
    items: brief.items.map(({ title, body, meta, image }) => ({ title, body, meta, image })),
  };
}

export function buildServer(brief: WebsiteBrief): string {
  const site = siteRecord(brief);
  const collection = collectionPath(brief.kind);
  const label = JSON.stringify(brief.name);
  return `const http = require("http");
const fs = require("fs");
const path = require("path");

const site = ${JSON.stringify(site, null, 2)};

const clientDir = path.resolve(__dirname, "../src");
const port = Number(process.env.PORT) || 3000;

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) reject(new Error("Body too large"));
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url || "/", "http://localhost");

  if (req.method === "GET" && url.pathname === "/api/health") {
    send(res, 200, JSON.stringify({ ok: true, name: site.name }), "application/json; charset=utf-8");
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/site") {
    send(res, 200, JSON.stringify(site), "application/json; charset=utf-8");
    return;
  }

  if (req.method === "GET" && url.pathname === ${JSON.stringify(collection)}) {
    send(res, 200, JSON.stringify(site.items), "application/json; charset=utf-8");
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim();
      const message = String(body.message || "").trim();
      if (!name || !email || !message) {
        send(res, 400, JSON.stringify({ error: "Name, email, and message are required." }), "application/json; charset=utf-8");
        return;
      }
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        send(res, 400, JSON.stringify({ error: "Enter a valid email address." }), "application/json; charset=utf-8");
        return;
      }
      send(res, 201, JSON.stringify({ ok: true, received: { name, email, message } }), "application/json; charset=utf-8");
    } catch {
      send(res, 400, JSON.stringify({ error: "Invalid JSON." }), "application/json; charset=utf-8");
    }
    return;
  }

  const relative = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\\//, "");
  const filePath = path.resolve(clientDir, relative);
  if (filePath !== clientDir && !filePath.startsWith(clientDir + path.sep)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
    };
    send(res, 200, data, types[path.extname(filePath)] || "application/octet-stream");
  });
});

server.listen(port, () => {
  console.log(${label} + " listening on http://localhost:" + port);
});
`;
}
