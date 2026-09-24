import { describe, expect, it } from "vitest";
import {
  detectWebsiteKind,
  formatWebsiteAssistantMessage,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
  shouldInlineInBrowserPreview,
} from "@/lib/websiteGenerator";

describe("website generator", () => {
  it("detects a site kind from the prompt", () => {
    expect(detectWebsiteKind("Build a restaurant website with a menu")).toBe("restaurant");
    expect(detectWebsiteKind("Generate a store website with a cart")).toBe("store");
    expect(detectWebsiteKind("Create a portfolio website")).toBe("portfolio");
    expect(detectWebsiteKind("Build a blog website")).toBe("blog");
    expect(detectWebsiteKind("Create a SaaS pricing website")).toBe("saas");
    expect(detectWebsiteKind("Build a landing page")).toBe("landing");
  });

  it("treats full-stack website prompts as generator requests", () => {
    expect(isWebsiteGenerationRequest("Build a full-stack landing website for a studio")).toBe(true);
    expect(isWebsiteGenerationRequest("Fix the button color")).toBe(false);
    expect(isWebsiteGenerationRequest("Explain CSS grid")).toBe(false);
  });

  it("writes a previewable client and an Express API", () => {
    const site = generateFullStackWebsite('Create a restaurant website called "Oak & Pine"');
    expect(site.name).toBe("Oak & Pine");
    expect(site.kind).toBe("restaurant");
    const byPath = Object.fromEntries(site.files.map((file) => [file.path, file]));
    expect(byPath["index.html"].content).toContain("Oak &amp; Pine");
    expect(byPath["index.html"].content).toContain('src="app.js"');
    expect(byPath["index.html"].content).toContain('href="styles.css"');
    expect(byPath["app.js"].content).toContain("SEED");
    expect(byPath["app.js"].content).toContain("/api/menu");
    expect(byPath["server.js"].content).toContain('require("express")');
    expect(byPath["server.js"].content).toContain('app.post("/api/reservations"');
    expect(byPath["package.json"].content).toContain('"start": "node src/server.js"');
    expect(byPath["README.md"].content).toContain("npm start");
    expect(site.files.find((file) => file.path === "server.js")?.location).toBe("src");
    expect(site.files.find((file) => file.path === "package.json")?.location).toBe("root");
  });

  it("escapes names that could break the page", () => {
    const site = generateFullStackWebsite('Build a website called "<img src=x onerror=alert(1)>"');
    const html = site.files.find((file) => file.path === "index.html")?.content || "";
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });

  it("keeps the Node server out of the browser preview", () => {
    const server = generateFullStackWebsite("Build a store website").files.find((file) => file.path === "server.js");
    expect(server).toBeTruthy();
    expect(shouldInlineInBrowserPreview("server.js", server!.content)).toBe(false);
    expect(shouldInlineInBrowserPreview("app.js", "document.getElementById('catalog')")).toBe(true);
  });

  it("summarizes the generated project for the assistant", () => {
    const site = generateFullStackWebsite("Build a full-stack website for Lumen Goods");
    const message = formatWebsiteAssistantMessage(site);
    expect(message).toContain("src/index.html");
    expect(message).toContain("npm start");
    expect(message).toContain("GET /api/");
  });
});
