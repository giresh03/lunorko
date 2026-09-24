import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { shouldInjectBrowserScript } from "@/lib/previewAssets";
import {
  WEBSITE_AUTOMATIONS,
  describeWebsite,
  detectWebsiteKind,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
  toProjectTree,
} from "@/lib/websiteGenerator";

describe("website generation requests", () => {
  it("accepts build requests and skips explanations", () => {
    expect(isWebsiteGenerationRequest("Build a full-stack website")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a landing page for a bakery")).toBe(true);
    expect(isWebsiteGenerationRequest("Explain how to build a website")).toBe(false);
    expect(isWebsiteGenerationRequest("Create a CSS grid layout")).toBe(false);
  });

  it("maps each assistant preset to the right kind and title", () => {
    const expected = {
      landing: "Northstar",
      portfolio: "Mira Chen",
      blog: "Field Notes",
      restaurant: "Hearth & Rye",
      store: "Loom Goods",
      dashboard: "Harbor",
    };
    for (const automation of WEBSITE_AUTOMATIONS) {
      expect(detectWebsiteKind(automation.brief)).toBe(automation.id);
      const site = generateFullStackWebsite(automation.brief);
      expect(site.kind).toBe(automation.id);
      expect(site.title).toBe(expected[automation.id]);
    }
  });
});

describe("generateFullStackWebsite", () => {
  it("scaffolds a client and an Express API", () => {
    const site = generateFullStackWebsite("Build a full-stack website called Northwind");
    const paths = site.files.map((file) => file.path);
    expect(site.title).toBe("Northwind");
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "server/index.js",
      "server/routes/api.js",
      "server/data/seed.js",
      "package.json",
      "README.md",
      ".env.example",
    ]);

    const html = file(site, "client/index.html");
    expect(html).toContain("Northwind");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(html).toContain("window.__LUNOR_SEED__");
    expect(html).toContain('data-themed="1"');
    expect(html).not.toContain("<script>alert");

    const server = file(site, "server/index.js");
    expect(server).toContain('from "express"');
    expect(server).toContain("http://localhost:${port}");
    expect(file(site, "server/routes/api.js")).toContain('endpoint.replace(/^\\/api/, "")');
    expect(JSON.parse(file(site, "package.json")).scripts.start).toBe("node server/index.js");
    expect(describeWebsite(site)).toContain("POST /api/waitlist");

    const tree = toProjectTree(site.files);
    const serverFolder = tree.find((node) => node.name === "server");
    const routes = serverFolder?.children?.find((node) => node.name === "routes");
    expect(routes?.children?.[0]?.id).toBe("server/routes/api.js");
  });

  it("escapes titles that try to break out of the page", () => {
    const site = generateFullStackWebsite('Build a website called <script>alert(1)</script>');
    const html = file(site, "client/index.html");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("\\u003c");
  });

  it("uses a dashboard layout and a restaurant menu API", () => {
    const dashboard = generateFullStackWebsite("Generate an analytics dashboard called Harbor");
    expect(file(dashboard, "client/index.html")).toContain('data-layout="dashboard"');
    expect(file(dashboard, "client/index.html")).toContain('class="shell"');

    const restaurant = generateFullStackWebsite("Build a restaurant website for Hearth & Rye with a menu");
    expect(restaurant.seed.form.endpoint).toBe("/api/reservations");
    expect(file(restaurant, "server/data/seed.js")).toContain("Hearth & Rye");
  });

  it("parses as JavaScript", () => {
    const site = generateFullStackWebsite("Create a full-stack online store called Loom Goods");
    const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
    for (const name of ["client/app.js", "server/index.js", "server/routes/api.js", "server/data/seed.js"]) {
      const contents = file(site, name);
      const target = join(dir, name.replace(/\//g, "-").replace(/\.js$/, ".mjs"));
      writeFileSync(target, contents);
      execFileSync(process.execPath, ["--check", target], { stdio: "pipe" });
    }
  });
});

describe("preview script injection", () => {
  it("keeps Express files out of the browser preview", () => {
    const files = {
      "client/app.js": "document.body.dataset.ready = '1';",
      "app.js": "document.body.dataset.ready = '1';",
      "server/index.js": "import express from 'express';",
      "index.js": "import express from 'express';",
      "server/routes/api.js": "export {}",
      "api.js": "export {}",
      "src/app.js": "console.log('legacy')",
    };
    expect(shouldInjectBrowserScript("app.js", files)).toBe(true);
    expect(shouldInjectBrowserScript("index.js", files)).toBe(false);
    expect(shouldInjectBrowserScript("api.js", files)).toBe(false);
    expect(shouldInjectBrowserScript("src/app.js", files)).toBe(true);
    expect(shouldInjectBrowserScript("server/index.js", files)).toBe(false);
  });
});

function file(site: { files: { path: string; content: string }[] }, path: string): string {
  const match = site.files.find((entry) => entry.path === path);
  if (!match) throw new Error(`Missing ${path}`);
  return match.content;
}
