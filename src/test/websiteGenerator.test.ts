import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  briefFromPrompt,
  filesToFileTree,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
} from "@/lib/websiteGenerator";

describe("website generator automation", () => {
  it("recognizes a full-stack website request and reads the name", () => {
    const brief = briefFromPrompt("Build a restaurant website called Olive & Ember");
    expect(brief).toEqual({ kind: "restaurant", name: "Olive & Ember", tagline: undefined });
    expect(isWebsiteGenerationRequest("explain how CSS works")).toBe(false);
    expect(briefFromPrompt("debug this website")).toBeNull();
  });

  it("picks the more specific site kind", () => {
    expect(briefFromPrompt("Create a SaaS landing page named Lumen")?.kind).toBe("saas");
    expect(briefFromPrompt("Make an online store website called Atelier")?.kind).toBe("store");
    expect(briefFromPrompt("Generate a full-stack portfolio site for Avery Lane")?.name).toBe("Avery Lane");
  });

  it("writes a previewable frontend and an Express API", () => {
    const site = generateFullStackWebsite({ kind: "restaurant", name: "Olive & Ember" });
    const paths = site.files.map((file) => file.path);
    expect(paths).toEqual(expect.arrayContaining([
      "src/index.html",
      "src/styles.css",
      "src/script.js",
      "server/server.js",
      "server/routes/api.js",
      "server/data.js",
      "server/models/Item.js",
      "package.json",
      ".env.example",
      "README.md",
    ]));

    const html = site.files.find((file) => file.path === "src/index.html")!.content;
    const script = site.files.find((file) => file.path === "src/script.js")!.content;
    const routes = site.files.find((file) => file.path === "server/routes/api.js")!.content;
    const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);

    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="script.js"');
    expect(html).toContain("Olive &amp; Ember");
    expect(html).toContain("data-themed");
    expect(script).toContain("/api/items");
    expect(script).toContain("Preview catalog");
    expect(routes).toContain('api.get("/health"');
    expect(routes).toContain('api.post("/inquiries"');
    expect(routes).toContain('api.post("/orders"');
    expect(pkg.scripts.start).toBe("node server/server.js");
    expect(site.files.find((file) => file.path === "server/server.js")!.content).toContain("express.static");
    expect(pkg.dependencies.express).toBeTruthy();
    expect(site.assistantMessage).toContain("Olive & Ember");

    const tree = filesToFileTree(site.files);
    expect(tree.find((node) => node.name === "src")?.type).toBe("folder");
    expect(tree.find((node) => node.name === "server")?.type).toBe("folder");
  });

  it("parses the generated JavaScript", () => {
    const site = generateFullStackWebsite({ kind: "store", name: 'Shop <script>' });
    const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
    for (const file of site.files.filter((entry) => entry.path.endsWith(".js"))) {
      const filename = file.path.split("/").join("__");
      const full = join(dir, filename);
      writeFileSync(full, file.content);
      execFileSync(process.execPath, ["--check", full], { stdio: "pipe" });
    }
    const html = site.files.find((file) => file.path === "src/index.html")!.content;
    expect(html).not.toContain("<script>");
    expect(html).toContain("Shop &lt;script&gt;");
  });
});
