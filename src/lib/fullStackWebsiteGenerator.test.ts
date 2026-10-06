import { describe, expect, it } from "vitest";
import {
  detectWebsiteRequest,
  filesToProjectTree,
  generateFullStackWebsite,
  insertProjectFile,
} from "./fullStackWebsiteGenerator";

describe("full-stack website generator", () => {
  it("ignores explanations and non-website prompts", () => {
    expect(detectWebsiteRequest("Explain how to build a website")).toBeNull();
    expect(detectWebsiteRequest("Create a todo list in one HTML file")).toBeNull();
    expect(detectWebsiteRequest("How does Express routing work?")).toBeNull();
  });

  it("detects a named restaurant website", () => {
    expect(detectWebsiteRequest('Generate a restaurant website called "Olive Table"')).toEqual({
      kind: "restaurant",
      name: "Olive Table",
    });
  });

  it("builds a client and an Express API that share the catalog", () => {
    const site = generateFullStackWebsite({ prompt: "Build a full-stack shop website" });
    const byPath = Object.fromEntries(site.files.map((file) => [file.path, file.content]));

    expect(site.kind).toBe("shop");
    expect(Object.keys(byPath)).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "server/data.js",
      "server/index.js",
      "package.json",
      "README.md",
      ".env.example",
    ]);
    expect(byPath["client/index.html"]).toContain('href="styles.css"');
    expect(byPath["client/index.html"]).toContain('src="app.js"');
    expect(byPath["client/index.html"]).toContain("Market Lane");
    expect(byPath["client/app.js"]).toContain('"/api/products"');
    expect(byPath["server/index.js"]).toContain('"/api/products"');
    expect(byPath["server/index.js"]).toContain('"/api/orders"');
    expect(byPath["server/data.js"]).toContain("Linen tote");
    expect(byPath["package.json"]).toContain('"type": "module"');
    expect(JSON.parse(byPath["package.json"]).scripts.start).toBe("node server/index.js");
  });

  it("nests client and server files in the project tree", () => {
    const site = generateFullStackWebsite({ kind: "portfolio", name: "Studio North" });
    const tree = filesToProjectTree(site.files);
    const client = tree.find((node) => node.id === "client");
    const server = tree.find((node) => node.id === "server");

    expect(client?.type).toBe("folder");
    expect(client?.children?.map((node) => node.name)).toEqual(["index.html", "styles.css", "app.js"]);
    expect(server?.children?.map((node) => node.id)).toEqual(["server/data.js", "server/index.js"]);
  });

  it("updates an existing nested file instead of duplicating it", () => {
    const created = insertProjectFile([], "server/index.js", "javascript", "first");
    const updated = insertProjectFile(created, "server/index.js", "javascript", "second");
    expect(updated).toHaveLength(1);
    expect(updated[0].children?.[0].content).toBe("second");
  });
});
