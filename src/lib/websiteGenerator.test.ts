import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
  detectWebsiteRequest,
  generateWebsite,
  inferSiteTitle,
  toProjectTree,
  WEBSITE_BLUEPRINTS,
  type WebsiteKind,
} from "./websiteGenerator";

const REQUIRED_PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/site.js",
  "server/package.json",
  "server/index.mjs",
  "server/src/app.mjs",
  "server/src/routes/api.mjs",
  "server/src/data/seed.mjs",
  "server/src/config/db.mjs",
  "README.md",
];

describe("website generator", () => {
  it("builds every blueprint with a client and an Express API", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const site = generateWebsite({ kind: blueprint.id });
      const paths = site.files.map((file) => file.path);
      for (const required of REQUIRED_PATHS) {
        expect(paths, blueprint.id).toContain(required);
      }
      const html = site.files.find((file) => file.path === "client/index.html")?.content || "";
      const client = site.files.find((file) => file.path === "client/site.js")?.content || "";
      const api = site.files.find((file) => file.path === "server/src/routes/api.mjs")?.content || "";
      const db = site.files.find((file) => file.path === "server/src/config/db.mjs")?.content || "";
      const pkg = JSON.parse(site.files.find((file) => file.path === "server/package.json")?.content || "{}");
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="site.js"');
      expect(client).toContain("fetch(");
      expect(client).toContain("/api/");
      expect(api).toContain('"/health"');
      expect(db).toContain("MONGODB_URI");
      expect(db).not.toContain("mongodb+srv://");
      expect(pkg.type).toBe("module");
      expect(pkg.scripts.start).toBe("node index.mjs");
      expect(pkg.dependencies.express).toBeTruthy();
      expect(site.summary).not.toContain("```");
      expect(site.summary).toContain("npm start");
    }
  });

  it("parses the generated JavaScript", () => {
    const site = generateWebsite({ kind: "store", title: "Coffee Shop" });
    const dir = mkdtempSync(path.join(tmpdir(), "lunor-site-"));
    for (const file of site.files) {
      if (!/\.(js|mjs)$/.test(file.path)) continue;
      const full = path.join(dir, file.path);
      mkdirSync(path.dirname(full), { recursive: true });
      writeFileSync(full, file.content);
      execFileSync(process.execPath, ["--check", full], { stdio: "pipe" });
    }
    const client = site.files.find((file) => file.path === "client/site.js")?.content || "";
    expect(client).toContain("House Espresso");
    expect(client).toContain("/api/products");
    expect(client).toContain("/api/orders");
  });

  it("keeps markup out of the page title and script payload", () => {
    const site = generateWebsite({ kind: "landing", title: "</script><img src=x onerror=alert(1)>" });
    const html = site.files.find((file) => file.path === "client/index.html")?.content || "";
    const script = site.files.find((file) => file.path === "client/site.js")?.content || "";
    expect(html).not.toContain("</script><");
    expect(script).not.toContain("</script><");
    expect(site.title).not.toContain("<");
  });

  it("detects website requests and ignores explanations", () => {
    const cases: [string, WebsiteKind | null][] = [
      ["Build a full-stack landing website", "landing"],
      ["Create a portfolio website with an API", "portfolio"],
      ["Generate a blog with articles", "blog"],
      ["Make a coffee shop website", "store"],
      ["Build a dashboard for analytics", "dashboard"],
      ["Explain how a website works", null],
      ["Fix the bug in my website layout", null],
    ];
    for (const [prompt, kind] of cases) {
      expect(detectWebsiteRequest(prompt), prompt).toBe(kind);
    }
    expect(inferSiteTitle("Build a coffee shop website", "Harbor Goods")).toBe("Coffee Shop");
  });

  it("renders each blueprint before the API responds", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const site = generateWebsite({ kind: blueprint.id });
      const html = site.files.find((file) => file.path === "client/index.html")?.content || "";
      const script = site.files.find((file) => file.path === "client/site.js")?.content || "";
      const page = html.replace('<script src="site.js"></script>', `<script>${script}</script>`);
      const dom = new JSDOM(page, { runScripts: "dangerously", url: "https://preview.local/" });
      const text = dom.window.document.getElementById("app")?.textContent || "";
      expect(text, blueprint.id).toContain(site.title);
      dom.window.close();
    }
  });

  it("nests client and server folders in the project tree", () => {
    const site = generateWebsite({ kind: "blog" });
    const tree = toProjectTree(site.files);
    expect(tree.some((node) => node.name === "client" && node.type === "folder")).toBe(true);
    expect(tree.some((node) => node.name === "server" && node.type === "folder")).toBe(true);
    const client = tree.find((node) => node.name === "client");
    expect(client?.children?.some((node) => node.name === "index.html")).toBe(true);
  });
});
