import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WEBSITE_BLUEPRINTS, generateWebsite, matchWebsiteRequest } from "@/lib/websiteGenerator";

describe("website generator", () => {
  it("matches a full-stack website request and keeps explanations alone", () => {
    expect(matchWebsiteRequest("Build a restaurant website called Olive & Oak")).toEqual({
      blueprintId: "restaurant",
      siteName: "Olive & Oak",
    });
    expect(matchWebsiteRequest('Create a store website named "North Market"')?.blueprintId).toBe("store");
    expect(matchWebsiteRequest("Generate a landing page website")?.blueprintId).toBe("landing");
    expect(matchWebsiteRequest("Make a portfolio site called Alex Rivera")?.siteName).toBe("Alex Rivera");
    expect(matchWebsiteRequest("How do I build a website?")).toBeNull();
    expect(matchWebsiteRequest("Fix the CSS on this card")).toBeNull();
  });

  it("writes a runnable frontend and Node API for every blueprint", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const site = generateWebsite(blueprint.id, blueprint.defaultName);
      const paths = site.files.map((file) => file.path);
      expect(paths).toEqual(expect.arrayContaining([
        "src/index.html",
        "src/style.css",
        "src/app.js",
        "server/server.cjs",
        "package.json",
        "README.md",
      ]));
      const html = site.files.find((file) => file.path === "src/index.html")!.content;
      const server = site.files.find((file) => file.path === "server/server.cjs")!.content;
      const app = site.files.find((file) => file.path === "src/app.js")!.content;
      const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);
      expect(html).toContain(blueprint.defaultName.replace(/&/g, "&amp;"));
      expect(site.siteName).toBe(blueprint.defaultName);
      expect(html).toContain('href="style.css"');
      expect(html).toContain('src="app.js"');
      expect(server).toContain('require("http")');
      expect(server).toContain("/api/health");
      expect(app).toContain("loadJson");
      expect(pkg.scripts.start).toBe("node server/server.cjs");
      for (const endpoint of blueprint.endpoints) {
        const route = endpoint.split(" ")[1];
        expect(server).toContain(route);
      }
      const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
      writeFileSync(join(dir, "server.cjs"), server);
      writeFileSync(join(dir, "app.js"), app);
      execFileSync(process.execPath, ["--check", join(dir, "server.cjs")]);
      execFileSync(process.execPath, ["--check", join(dir, "app.js")]);
    }
  });

  it("serves the landing page and accepts a lead", async () => {
    const site = generateWebsite("landing", "Lumina");
    const root = mkdtempSync(join(tmpdir(), "lunor-run-"));
    for (const file of site.files) {
      const destination = join(root, file.path);
      mkdirSync(join(destination, ".."), { recursive: true });
      writeFileSync(destination, file.content);
    }
    const port = 4317;
    const child = spawn(process.execPath, ["server/server.cjs"], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      stdio: "ignore",
    });
    try {
      await waitFor(`http://127.0.0.1:${port}/api/health`);
      const health = await fetch(`http://127.0.0.1:${port}/api/health`).then((response) => response.json());
      expect(health).toEqual({ ok: true, site: "Lumina" });
      const plans = await fetch(`http://127.0.0.1:${port}/api/plans`).then((response) => response.json());
      expect(plans.plans.length).toBeGreaterThan(0);
      const page = await fetch(`http://127.0.0.1:${port}/`);
      expect(page.headers.get("content-type")).toContain("text/html");
      expect(await page.text()).toContain("Lumina");
      const lead = await fetch(`http://127.0.0.1:${port}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ada", email: "ada@studio.com", note: "Hello" }),
      });
      expect(lead.status).toBe(201);
      const saved = await lead.json();
      expect(saved.lead.email).toBe("ada@studio.com");
    } finally {
      child.kill();
    }
  });
});

async function waitFor(url: string) {
  const started = Date.now();
  while (Date.now() - started < 4000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}
