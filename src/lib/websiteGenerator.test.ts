import { describe, expect, it } from "vitest";
import {
  formatWebsiteForChat,
  generateFullStackWebsite,
  isBackendPreviewScript,
  isWebsiteGenerationRequest,
} from "./websiteGenerator";

describe("website generator", () => {
  it("detects website build requests", () => {
    expect(isWebsiteGenerationRequest("Build a restaurant website for Harbor & Rye")).toBe(true);
    expect(isWebsiteGenerationRequest("Generate a full-stack shop website")).toBe(true);
    expect(isWebsiteGenerationRequest("Fix the bug in app.js")).toBe(false);
    expect(isWebsiteGenerationRequest("Explain CSS grid")).toBe(false);
  });

  it("builds a named full-stack project", () => {
    const project = generateFullStackWebsite("Build a restaurant website for Harbor & Rye");
    expect(project.name).toBe("Harbor & Rye");
    expect(project.kind).toBe("restaurant");
    expect(project.slug).toBe("harbor-and-rye");
    expect(project.files.map((file) => file.name)).toEqual([
      "index.html",
      "style.css",
      "app.js",
      "server.js",
      "package.json",
      "README.md",
    ]);

    const html = project.files.find((file) => file.name === "index.html")!.content;
    const client = project.files.find((file) => file.name === "app.js")!.content;
    const server = project.files.find((file) => file.name === "server.js")!.content;
    const pkg = JSON.parse(project.files.find((file) => file.name === "package.json")!.content);

    expect(html).toContain("Harbor &amp; Rye");
    expect(html).toContain('href="style.css"');
    expect(html).toContain('src="app.js"');
    expect(html).not.toContain("react");
    expect(client).toContain('fetch("/api/items")');
    expect(client).toContain("FALLBACK_ITEMS");
    expect(client).not.toContain("require(");
    expect(() => new Function(client)).not.toThrow();
    expect(() => new Function(server)).not.toThrow();
    expect(server).toContain('require("express")');
    expect(server).toContain('"/api/contact"');
    expect(pkg.scripts.start).toBe("node src/server.js");
    expect(pkg.dependencies.express).toBeTruthy();
    expect(isBackendPreviewScript("server.js", server)).toBe(true);
    expect(isBackendPreviewScript("app.js", client)).toBe(false);
  });

  it("escapes markup in the site name", () => {
    const project = generateFullStackWebsite('Create a portfolio website called "<script>alert(1)</script>"');
    const html = project.files.find((file) => file.name === "index.html")!.content;
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("formats chat output with filenames the editor can apply", () => {
    const project = generateFullStackWebsite("Make a SaaS landing page website");
    const markdown = formatWebsiteForChat(project);
    expect(markdown).toContain("index.html\n```html");
    expect(markdown).toContain("server.js\n```javascript");
    expect(project.kind).toBe("saas");
  });
});
