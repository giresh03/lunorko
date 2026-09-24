import { describe, expect, it } from "vitest";
import {
  WEBSITE_GENERATOR_PRESETS,
  detectSiteKind,
  generateWebsite,
  isWebsiteGenerationRequest,
} from "@/lib/websiteGenerator";

describe("website generator", () => {
  it("recognizes website build requests and ignores ordinary coding prompts", () => {
    expect(isWebsiteGenerationRequest("Generate a full-stack landing page website for a studio called Northstar")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a restaurant site for a cafe called Luna")).toBe(true);
    expect(isWebsiteGenerationRequest("Create an online store website called Marlowe")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a counter with HTML, CSS, and JS")).toBe(false);
    expect(isWebsiteGenerationRequest("Create a todo list in one HTML file")).toBe(false);
    expect(isWebsiteGenerationRequest("What is a website?")).toBe(false);
    expect(isWebsiteGenerationRequest("Explain how CSS grid works")).toBe(false);
  });

  it("picks a site kind and brand from the prompt", () => {
    expect(detectSiteKind("coffee shop website")).toBe("restaurant");
    expect(detectSiteKind("online store website")).toBe("store");
    expect(detectSiteKind("portfolio website")).toBe("portfolio");
    expect(detectSiteKind("saas landing page website")).toBe("saas");

    const site = generateWebsite('Generate a restaurant website called "Luna Cafe"');
    expect(site.kind).toBe("restaurant");
    expect(site.brand).toBe("Luna Cafe");
  });

  it("returns a runnable full-stack project for every preset", () => {
    for (const preset of WEBSITE_GENERATOR_PRESETS) {
      const site = generateWebsite(preset.prompt);
      const names = site.files.map((file) => file.filename);
      expect(names).toEqual(["index.html", "style.css", "app.js", "server.js", "package.json", "README.md"]);
      expect(site.files.every((file) => !file.content.includes("```"))).toBe(true);

      const html = site.files.find((file) => file.filename === "index.html")!.content;
      const css = site.files.find((file) => file.filename === "style.css")!.content;
      const client = site.files.find((file) => file.filename === "app.js")!.content;
      const server = site.files.find((file) => file.filename === "server.js")!.content;
      const pkg = JSON.parse(site.files.find((file) => file.filename === "package.json")!.content);

      expect(html).toContain(site.brand);
      expect(html).toContain('data-themed');
      expect(html).toContain('href="style.css"');
      expect(html).toContain('src="app.js"');
      expect(css).toContain("--accent");
      expect(client).toContain("/api/messages");
      expect(client).toContain("/api/site");
      expect(server.indexOf('typeof window !== "undefined"')).toBeLessThan(server.indexOf('require("express")'));
      expect(server).toContain('app.get("/api/health"');
      expect(server).toContain('app.post("/api/messages"');
      expect(pkg.dependencies.express).toBeTruthy();
      expect(pkg.scripts.start).toBe("node server.js");
      expect(site.markdown).toContain("index.html\n```html");
      expect(site.markdown).toContain("server.js\n```javascript");
    }
  });
});
