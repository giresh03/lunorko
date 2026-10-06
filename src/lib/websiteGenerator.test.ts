import { describe, expect, it } from "vitest";
import {
  WEBSITE_PRESETS,
  detectWebsiteKind,
  generateWebsite,
  isWebsiteGenerationRequest,
} from "./websiteGenerator";

describe("website generator", () => {
  it("recognizes website build requests and ignores debug questions", () => {
    expect(isWebsiteGenerationRequest("Build a landing page website for Northstar")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a full-stack site for a cafe")).toBe(true);
    expect(isWebsiteGenerationRequest("Explain how a website works")).toBe(false);
    expect(isWebsiteGenerationRequest("Fix the bug in my navbar")).toBe(false);
  });

  it("picks a site kind from the prompt", () => {
    expect(detectWebsiteKind("Build a restaurant website")).toBe("restaurant");
    expect(detectWebsiteKind("Build an online store website")).toBe("shop");
    expect(detectWebsiteKind("Build a blog website")).toBe("blog");
    expect(detectWebsiteKind("Build a portfolio website")).toBe("portfolio");
    expect(detectWebsiteKind("Build a SaaS landing page website")).toBe("landing");
  });

  it("writes a previewable client and an Express API", () => {
    const site = generateWebsite('Build a restaurant website called "Harbor & Rye"');
    const byName = Object.fromEntries(site.files.map((file) => [file.name, file]));

    expect(site.name).toBe("Harbor & Rye");
    expect(site.kind).toBe("restaurant");
    expect(byName["index.html"].content).toContain("<!DOCTYPE html>");
    expect(byName["index.html"].content).toContain('data-themed');
    expect(byName["index.html"].content).toContain('href="styles.css"');
    expect(byName["index.html"].content).toContain('src="script.js"');
    expect(byName["index.html"].content).toContain("Harbor &amp; Rye");
    expect(byName["styles.css"].content).toContain("--accent");
    expect(byName["script.js"].content).toContain("LOCAL_CONTENT");
    expect(byName["script.js"].content).not.toContain("require(");
    expect(byName["server.js"].folder).toBe("server");
    expect(byName["server.js"].content).toContain('require("express")');
    expect(byName["server.js"].content).toContain("/api/health");
    expect(byName["server.js"].content).toContain("/api/content");
    expect(byName["server.js"].content).toContain("/api/messages");
    expect(JSON.parse(byName["package.json"].content).scripts.start).toBe("node server/server.js");
  });

  it("escapes names that could break the preview script", () => {
    const site = generateWebsite('Build a website called "</script><script>alert(1)"');
    const script = site.files.find((file) => file.name === "script.js")?.content ?? "";
    const html = site.files.find((file) => file.name === "index.html")?.content ?? "";
    expect(script).not.toContain("</script>");
    expect(html).not.toContain("<script>alert");
  });

  it("gives every assistant preset a runnable site", () => {
    for (const preset of WEBSITE_PRESETS) {
      expect(isWebsiteGenerationRequest(preset.prompt)).toBe(true);
      const site = generateWebsite(preset.prompt);
      expect(site.kind).toBe(preset.id);
      expect(site.files.map((file) => file.name)).toEqual([
        "index.html",
        "styles.css",
        "script.js",
        "server.js",
        "package.json",
        "README.md",
      ]);
    }
  });
});
