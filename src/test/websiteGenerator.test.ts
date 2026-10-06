import { describe, expect, it } from "vitest";
import {
  detectWebsiteKind,
  extractSiteTitle,
  generateFullStackWebsite,
  isNodeOnlyScript,
  isWebsiteGenerationRequest,
} from "@/lib/websiteGenerator";

const REQUIRED_PATHS = [
  "index.html",
  "styles.css",
  "script.js",
  "backend/server.js",
  "backend/routes/api.js",
  "backend/data/db.json",
  "package.json",
  "README.md",
];

describe("website generator", () => {
  it("detects a new website request and ignores edits", () => {
    expect(isWebsiteGenerationRequest("Generate a full-stack landing page website")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a restaurant website for Luna Bistro")).toBe(true);
    expect(isWebsiteGenerationRequest("Make the website header sticky")).toBe(false);
    expect(isWebsiteGenerationRequest("Explain how a website works")).toBe(false);
    expect(isWebsiteGenerationRequest("Build a counter with HTML")).toBe(false);
  });

  it("picks the site type and a custom title", () => {
    expect(detectWebsiteKind("Build a restaurant website")).toBe("restaurant");
    expect(detectWebsiteKind("Make an online shop website with a cart")).toBe("shop");
    expect(extractSiteTitle("Build a restaurant website for Luna Bistro", "Fallback")).toBe("Luna Bistro");
    expect(extractSiteTitle('Create a portfolio website called "Studio North"', "Fallback")).toBe("Studio North");
  });

  it("writes a previewable frontend and an Express API", () => {
    const site = generateFullStackWebsite("Build a restaurant website for Luna Bistro", "restaurant");
    expect(site.title).toBe("Luna Bistro");
    expect(site.files.map((file) => file.path)).toEqual(REQUIRED_PATHS);

    const html = site.files.find((file) => file.path === "index.html")!.content;
    const css = site.files.find((file) => file.path === "styles.css")!.content;
    const script = site.files.find((file) => file.path === "script.js")!.content;
    const server = site.files.find((file) => file.path === "backend/server.js")!.content;
    const api = site.files.find((file) => file.path === "backend/routes/api.js")!.content;
    const db = site.files.find((file) => file.path === "backend/data/db.json")!.content;
    const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);

    expect(html).toContain("<title>Luna Bistro</title>");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="script.js"');
    expect(html).not.toMatch(/react|jsx|tsx/i);
    expect(css).toContain("--primary");
    expect(script).toContain("SEED");
    expect(script).toContain('fetch("/api/content")');
    expect(script).toContain('fetch("/api/messages"');
    expect(server).toContain('from "express"');
    expect(server).toContain('app.use("/api", api)');
    expect(api).toContain('api.post("/messages"');
    expect(JSON.parse(db).site.title).toBe("Luna Bistro");
    expect(pkg.scripts.start).toBe("node backend/server.js");
    expect(pkg.dependencies.express).toBeTruthy();
    expect(isNodeOnlyScript("backend/server.js", server)).toBe(true);
    expect(isNodeOnlyScript("script.js", script)).toBe(false);
  });
});
