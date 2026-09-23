import { describe, expect, it } from "vitest";
import {
  formatWebsiteAssistantMessage,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
  WEBSITE_TEMPLATES,
} from "./websiteGenerator";

describe("website generator", () => {
  it("recognizes website build requests and ignores explanations", () => {
    expect(isWebsiteGenerationRequest("Generate a full-stack restaurant website")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a landing page for Northwind")).toBe(true);
    expect(isWebsiteGenerationRequest("explain how a website works")).toBe(false);
    expect(isWebsiteGenerationRequest("fix the error in my website css")).toBe(false);
  });

  it("builds a previewable frontend and an express API", () => {
    const site = generateFullStackWebsite("Generate a full-stack restaurant website for Hearth & Rye");
    const names = site.files.map((file) => file.filename);
    expect(names).toEqual(["index.html", "styles.css", "script.js", "server.js", "package.json", "README.md"]);
    expect(site.kind).toBe("restaurant");
    expect(site.title).toBe("Hearth & Rye");

    const html = site.files[0].content;
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="script.js"');
    expect(html).toContain("data-themed");

    const client = site.files.find((file) => file.filename === "script.js")!.content;
    expect(client).toContain("FALLBACK");
    expect(client).toContain("/api/items");
    expect(client).toContain("/api/contact");

    const server = site.files.find((file) => file.filename === "server.js")!.content;
    expect(server).toContain('app.get("/api/site"');
    expect(server).toContain('app.post("/api/contact"');
    expect(server).toContain("express.static");
    expect(server).not.toContain("```");
  });

  it("changes the catalog with the website kind", () => {
    const store = generateFullStackWebsite("Create an online store website");
    const blog = generateFullStackWebsite("Make a blog website");
    expect(store.kind).toBe("store");
    expect(blog.kind).toBe("blog");
    expect(store.files.find((file) => file.filename === "server.js")!.content).not.toEqual(
      blog.files.find((file) => file.filename === "server.js")!.content
    );
  });

  it("formats assistant output the editor can apply", () => {
    const site = generateFullStackWebsite(WEBSITE_TEMPLATES[0].prompt);
    const message = formatWebsiteAssistantMessage(site);
    expect(message).toContain("index.html\n```html");
    expect(message).toContain("server.js\n```javascript");
    expect(message).toContain("package.json\n```json");

    const regex = /(?:(?:[`*]*(\w+\.\w+)[`*]*\s*:?\s*\n))?```(\w*)\n([\s\S]*?)```/g;
    const found: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(message)) !== null) found.push(match[1]);
    expect(found).toEqual(["index.html", "styles.css", "script.js", "server.js", "package.json", "README.md"]);
  });
});
