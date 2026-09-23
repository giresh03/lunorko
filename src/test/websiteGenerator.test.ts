import { describe, expect, it } from "vitest";
import {
  detectWebsiteKind,
  extractBrand,
  formatWebsiteAsAssistantMessage,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
} from "@/lib/websiteGenerator";

const FILE_BLOCK = /(?:(?:[\\*`]*(\w+\.\w+)[\\*`]*\s*:?\s*\n))?```(\w*)\n([\s\S]*?)```/g;

function extractBlocks(markdown: string) {
  const blocks: { filename?: string; language: string; code: string }[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(FILE_BLOCK.source, "g");
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({ filename: match[1], language: match[2], code: match[3].trim() });
  }
  return blocks;
}

describe("website generator", () => {
  it("recognizes full-stack website requests and ignores explanations", () => {
    expect(isWebsiteGenerationRequest("Build a restaurant website for Olive & Oak")).toBe(true);
    expect(isWebsiteGenerationRequest("Generate a SaaS landing page")).toBe(true);
    expect(isWebsiteGenerationRequest("website generator")).toBe(true);
    expect(isWebsiteGenerationRequest("Explain how a website works")).toBe(false);
    expect(isWebsiteGenerationRequest("Fix the CSS on my homepage")).toBe(false);
    expect(isWebsiteGenerationRequest("Create a todo list in one HTML file")).toBe(false);
  });

  it("picks a site kind and a brand from the prompt", () => {
    expect(detectWebsiteKind("Build a restaurant website for Olive & Oak")).toBe("restaurant");
    expect(detectWebsiteKind("Build a portfolio website")).toBe("portfolio");
    expect(extractBrand("Build a restaurant website for Olive & Oak", "Fallback")).toBe("Olive & Oak");
    expect(extractBrand('Build a site called "Northstar Studio"', "Fallback")).toBe("Northstar Studio");
  });

  it("writes a previewable frontend and a Node API", () => {
    const site = generateFullStackWebsite("Build a full-stack online store website for Field & Fern");
    const byName = Object.fromEntries(site.files.map((file) => [file.filename, file.code]));

    expect(site.kind).toBe("store");
    expect(site.title).toBe("Field & Fern");
    expect(Object.keys(byName).sort()).toEqual([
      "README.md",
      "app.js",
      "index.html",
      "package.json",
      "server.js",
      "style.css",
    ]);
    expect(byName["index.html"]).toContain('href="style.css"');
    expect(byName["index.html"]).toContain('src="app.js"');
    expect(byName["index.html"]).toContain("data-themed");
    expect(byName["index.html"]).toContain("Field &amp; Fern");
    expect(byName["server.js"]).toContain("/api/health");
    expect(byName["server.js"]).toContain("/api/content");
    expect(byName["server.js"]).toContain("/api/contact");
    expect(byName["server.js"]).toContain('typeof window !== "undefined"');
    expect(byName["app.js"]).toContain("/api/content");
    expect(byName["package.json"]).toContain('"start": "node server.js"');

    const blocks = extractBlocks(formatWebsiteAsAssistantMessage(site));
    expect(blocks.map((block) => block.filename)).toEqual([
      "index.html",
      "style.css",
      "app.js",
      "server.js",
      "package.json",
      "README.md",
    ]);
    expect(blocks.every((block) => block.code.length > 20)).toBe(true);
  });
});
