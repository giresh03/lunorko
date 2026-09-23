import { describe, expect, it } from "vitest";
import {
  briefFromPrompt,
  generateFullStackWebsite,
  generatedFilesToTree,
  isFullStackWebsitePrompt,
} from "@/lib/fullStackWebsiteGenerator";

describe("full-stack website generator", () => {
  it("recognizes website generation prompts and ignores small widgets", () => {
    expect(isFullStackWebsitePrompt("Generate a full-stack website for a coffee shop")).toBe(true);
    expect(isFullStackWebsitePrompt("Build a website called Harbor")).toBe(true);
    expect(isFullStackWebsitePrompt("Create a todo list in one HTML file")).toBe(false);
  });

  it("reads the site name and kind from a prompt", () => {
    const brief = briefFromPrompt('Generate a full-stack website for "Cedar & Rye" restaurant');
    expect(brief.name).toBe("Cedar & Rye");
    expect(brief.kind).toBe("restaurant");
  });

  it("writes a previewable client and an Express API", () => {
    const site = generateFullStackWebsite({
      name: "Cedar & Rye",
      kind: "restaurant",
      tagline: "Wood fire and a short menu.",
      accent: "#b45309",
    });

    const byPath = Object.fromEntries(site.files.map((file) => [file.path, file.content]));
    expect(Object.keys(byPath)).toEqual([
      "index.html",
      "styles.css",
      "app.js",
      "server/server.js",
      "server/routes.js",
      "server/store.js",
      "package.json",
      "README.md",
    ]);
    expect(byPath["index.html"]).toContain('href="styles.css"');
    expect(byPath["index.html"]).toContain('src="app.js"');
    expect(byPath["index.html"]).toContain("window.__SITE_SEED__");
    expect(byPath["index.html"]).toContain("Cedar &amp; Rye");
    expect(byPath["app.js"]).toContain("/api/content");
    expect(byPath["app.js"]).toContain("/api/contact");
    expect(byPath["server/server.js"]).toContain('require("express")');
    expect(byPath["server/routes.js"]).toContain('router.post("/contact"');
    expect(byPath["index.html"]).toContain("<body data-themed>");
    expect(() => new Function(byPath["app.js"])).not.toThrow();
    expect(() => new Function(byPath["server/server.js"])).not.toThrow();
    expect(() => new Function(byPath["server/routes.js"])).not.toThrow();
    expect(() => new Function(byPath["server/store.js"])).not.toThrow();
    expect(byPath["server/store.js"]).toContain("Wood fire and a short menu.");
    expect(byPath["server/store.js"]).toContain("Tonight's plates");

    const pkg = JSON.parse(byPath["package.json"]);
    expect(pkg.scripts.start).toBe("node server/server.js");
    expect(pkg.dependencies.express).toBeTruthy();

    const tree = generatedFilesToTree(site.files);
    expect(tree.find((node) => node.id === "server")?.type).toBe("folder");
    expect(tree.find((node) => node.id === "index.html")?.type).toBe("file");
  });

  it("escapes a hostile site name inside the html seed", () => {
    const site = generateFullStackWebsite({ name: '</script><script>alert(1)</script>' });
    const html = site.files.find((file) => file.path === "index.html")?.content || "";
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("\\u003c");
  });
});
