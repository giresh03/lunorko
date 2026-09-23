import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
  parseWebsiteRequest,
  websiteFilesToTree,
  type WebsiteKind,
} from "./websiteGenerator";

const kinds = WEBSITE_BLUEPRINTS.map((blueprint) => blueprint.id);

describe("full-stack website generator", () => {
  it.each(kinds)("writes a client and a Node API for %s", (kind: WebsiteKind) => {
    const site = generateFullStackWebsite({ name: "Test & Co <lab>", kind });
    const paths = site.files.map((file) => file.path);
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "server/server.js",
      "server/package.json",
      "README.md",
    ]);
    const html = site.files[0].content;
    expect(html).toContain("Test &amp; Co &lt;lab&gt;");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(html).not.toContain("<script>alert");
    const app = site.files[2].content;
    expect(app).toContain("SEED");
    expect(app).toContain("/api/items");
    const server = site.files[3].content;
    expect(server.startsWith("/* @lunor-runtime server */")).toBe(true);
    expect(server).toContain("/api/health");
    expect(server).toContain("/api/contact");
    expect(server).toContain("/api/cart");
    const pkg = JSON.parse(site.files[4].content);
    expect(pkg.scripts.start).toBe("node server.js");
    expect(pkg.name).toBe("test-co-lab");
  });

  it("reads a named restaurant request", () => {
    const prompt = "Generate a full-stack restaurant website for Hearth & Rye";
    expect(isWebsiteGenerationRequest(prompt)).toBe(true);
    expect(parseWebsiteRequest(prompt)).toEqual({ kind: "restaurant", name: "Hearth & Rye" });
    expect(isWebsiteGenerationRequest("Explain how a website works")).toBe(false);
    const site = generateFullStackWebsite({ name: "Hearth & Rye", kind: "restaurant" });
    expect(site.files[0].content).toContain("Menu");
    expect(site.files[0].content).toContain("Request a table");
    expect(site.files[3].content).toContain("Hearth bread");
  });

  it("builds an open client and server tree", () => {
    const site = generateFullStackWebsite({ kind: "portfolio" });
    const tree = websiteFilesToTree(site.files);
    expect(tree.map((node) => node.name)).toEqual(["client", "server", "README.md"]);
    expect(tree[0].isOpen).toBe(true);
    expect(tree[0].children?.map((node) => node.name)).toEqual(["index.html", "styles.css", "app.js"]);
  });

  it("serves the page and the API", async () => {
    const site = generateFullStackWebsite({ name: "Harbor", kind: "store" });
    const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
    for (const file of site.files) {
      const target = join(dir, file.path);
      mkdirSync(join(target, ".."), { recursive: true });
      writeFileSync(target, file.content);
    }
    const child = spawn(process.execPath, ["server/server.js"], {
      cwd: dir,
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const port = await new Promise<number>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("server did not start")), 5000);
      child.stdout?.on("data", (chunk: Buffer) => {
        const match = String(chunk).match(/localhost:(\d+)/);
        if (match) {
          clearTimeout(timer);
          resolve(Number(match[1]));
        }
      });
      child.on("error", reject);
    });
    try {
      const health = await fetch(`http://127.0.0.1:${port}/api/health`);
      expect(await health.json()).toMatchObject({ ok: true, site: "Harbor", kind: "store" });
      const items = await fetch(`http://127.0.0.1:${port}/api/items`);
      const catalog = await items.json();
      expect(catalog.items.length).toBeGreaterThan(0);
      const page = await fetch(`http://127.0.0.1:${port}/`);
      const html = await page.text();
      expect(html).toContain("Harbor");
      expect(page.headers.get("content-type")).toContain("text/html");
    } finally {
      child.kill();
    }
  });

  it("emits JavaScript that Node can parse", () => {
    const site = generateFullStackWebsite({ name: "Harbor", kind: "store" });
    const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
    for (const file of site.files.filter((entry) => entry.language === "javascript")) {
      const target = join(dir, file.path.replace(/\//g, "_"));
      writeFileSync(target, file.content);
      execFileSync(process.execPath, ["--check", target], { stdio: "pipe" });
    }
  });
});
