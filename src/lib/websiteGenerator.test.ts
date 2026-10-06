import { describe, expect, it } from "vitest";
import {
  extractSiteName,
  filesToPreviewMap,
  generateWebsite,
  isWebsiteGenerationRequest,
  matchBlueprint,
  toProjectTree,
  WEBSITE_BLUEPRINTS,
} from "./websiteGenerator";

describe("website generator", () => {
  it("recognizes website requests and ignores ordinary coding questions", () => {
    expect(isWebsiteGenerationRequest("Build a restaurant website")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a full-stack landing page for Harbor Co")).toBe(true);
    expect(isWebsiteGenerationRequest("Explain CSS grid")).toBe(false);
    expect(isWebsiteGenerationRequest("Debug this fetch call")).toBe(false);
  });

  it("picks a blueprint from the prompt", () => {
    expect(matchBlueprint("Make an online store with a cart").id).toBe("store");
    expect(matchBlueprint("Build a cafe website").id).toBe("restaurant");
    expect(matchBlueprint("Generate a portfolio site").id).toBe("portfolio");
    expect(matchBlueprint("Create a blog website").id).toBe("blog");
    expect(matchBlueprint("Build a SaaS landing page").id).toBe("saas");
  });

  it("keeps a named brand and falls back otherwise", () => {
    expect(extractSiteName('Build a website called "Luna Cafe"', "Hearth & Rye")).toBe("Luna Cafe");
    expect(extractSiteName("Build a website for Northwind Goods", "Northwind")).toBe("Northwind Goods");
    expect(extractSiteName("Build a restaurant website", "Hearth & Rye")).toBe("Hearth & Rye");
  });

  it.each(WEBSITE_BLUEPRINTS.map((item) => item.id))("scaffolds a runnable %s project", (id) => {
    const site = generateWebsite({ blueprintId: id, prompt: "called Harbor Studio" });
    const paths = site.files.map((file) => file.path);
    expect(site.siteName).toBe("Harbor Studio");
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/script.js",
      "server/server.mjs",
      "package.json",
      "README.md",
    ]);

    const html = site.files.find((file) => file.path === "client/index.html")!.content;
    const script = site.files.find((file) => file.path === "client/script.js")!.content;
    const server = site.files.find((file) => file.path === "server/server.mjs")!.content;
    const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);

    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="script.js"');
    expect(html).toContain("Harbor Studio");
    expect(script).toContain("FALLBACK_");
    expect(script).toContain("fetch(path");
    expect(() => new Function(script)).not.toThrow();
    expect(server).toContain('from "express"');
    expect(server).toContain("/api/health");
    expect(server).not.toContain("script.js");
    expect(pkg.scripts.start).toBe("node server/server.mjs");
    expect(pkg.type).toBe("module");

    const tree = toProjectTree(site.files);
    expect(tree.map((node) => node.name).sort()).toEqual(["README.md", "client", "package.json", "server"]);
    const preview = filesToPreviewMap(site.files);
    expect(preview["styles.css"]).toContain(":root");
    expect(preview["script.js"]).toContain("async function api");
    expect(preview["server.mjs"]).toContain("express");
    expect(Object.keys(preview).filter((name) => name.endsWith(".js"))).toEqual(["client/script.js", "script.js"]);
  });
});
