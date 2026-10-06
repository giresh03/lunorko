import { describe, expect, it } from "vitest";
import {
  detectWebsiteKind,
  extractBrand,
  formatWebsiteAssistantMessage,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
} from "./websiteGenerator";

const FILE_BLOCK = /(?:(?:[\*`]*(\w+\.\w+)[\*`]*\s*:?\s*\n))?```(\w*)\n([\s\S]*?)```/g;

function filesFromMessage(markdown: string) {
  const found: { filename?: string; language: string; code: string }[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(FILE_BLOCK.source, "g");
  while ((match = regex.exec(markdown)) !== null) {
    found.push({ filename: match[1], language: match[2], code: match[3].trim() });
  }
  return found;
}

describe("website generation requests", () => {
  it("accepts full-stack website briefs", () => {
    expect(isWebsiteGenerationRequest("Generate a full-stack portfolio website")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a restaurant website with a menu API")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a SaaS landing page website")).toBe(true);
    expect(isWebsiteGenerationRequest("Make an online shop website with products")).toBe(true);
  });

  it("leaves ordinary coding prompts to the tutor", () => {
    expect(isWebsiteGenerationRequest("Build a counter with HTML, CSS, and JS")).toBe(false);
    expect(isWebsiteGenerationRequest("Create a todo list in one HTML file")).toBe(false);
    expect(isWebsiteGenerationRequest("Fix the error in my website header")).toBe(false);
    expect(isWebsiteGenerationRequest("Explain how a landing page works")).toBe(false);
  });
});

describe("generateFullStackWebsite", () => {
  it("picks a kind and brand from the brief", () => {
    expect(detectWebsiteKind("Build a restaurant website for Oak & Oven")).toBe("restaurant");
    expect(extractBrand("Build a restaurant website for Oak & Oven", "Harbor & Rye")).toBe("Oak & Oven");
    const site = generateFullStackWebsite("Build a restaurant website for Oak & Oven");
    expect(site.kind).toBe("restaurant");
    expect(site.brand).toBe("Oak & Oven");
    expect(site.slug).toBe("oak-and-oven");
  });

  it("writes the page, client, and Express API", () => {
    const site = generateFullStackWebsite("Generate a full-stack portfolio website");
    const names = site.files.map((file) => file.filename);
    expect(names).toEqual(["index.html", "styles.css", "script.js", "server.js", "package.json", "README.md"]);

    const html = site.files[0].content;
    const script = site.files[2].content;
    const server = site.files[3].content;
    const pkg = JSON.parse(site.files[4].content);

    expect(html).toContain("<title>Lumen Atelier</title>");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="script.js"');
    expect(html).toContain('data-themed="site"');
    expect(script).toContain('fetch("/api/site")');
    expect(script).toContain('fetch("/api/messages"');
    expect(script).toContain("FALLBACK_SITE");
    expect(server).toContain('app.get("/api/site"');
    expect(server).toContain('app.get("/api/items"');
    expect(server).toContain('app.post("/api/messages"');
    expect(server).toContain('typeof window === "undefined"');
    expect(pkg.scripts.start).toBe("node server.js");
    expect(pkg.dependencies.express).toBeTruthy();
  });

  it("escapes a brand that tries to break out of the page", () => {
    const site = generateFullStackWebsite('Create a website called "</script>"');
    const html = site.files.find((file) => file.filename === "index.html")!.content;
    const script = site.files.find((file) => file.filename === "script.js")!.content;
    const server = site.files.find((file) => file.filename === "server.js")!.content;
    expect(html).not.toContain("</script><img");
    expect(html).toContain("&lt;/script&gt;");
    expect(script.toLowerCase()).not.toContain("</script>");
    expect(server.toLowerCase()).not.toContain("</script>");
  });

  it("formats files so the editor can apply them", () => {
    const message = formatWebsiteAssistantMessage(
      generateFullStackWebsite("Create a SaaS landing page website"),
    );
    const blocks = filesFromMessage(message);
    expect(blocks.map((block) => block.filename)).toEqual([
      "index.html",
      "styles.css",
      "script.js",
      "server.js",
      "package.json",
      "README.md",
    ]);
    expect(blocks.every((block) => block.code.length > 20)).toBe(true);
    expect(message).toContain("Northbeam");
  });
});
