import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  buildWebsiteProject,
  normalizeProjectPath,
  upsertProjectFile,
  websiteGeneratorPrompt,
} from "./websiteGenerator";

describe("website generator", () => {
  it("offers a blueprint for each full-stack site", () => {
    expect(WEBSITE_BLUEPRINTS.map((blueprint) => blueprint.id)).toEqual([
      "saas-landing",
      "portfolio",
      "restaurant",
      "store",
      "blog",
      "dashboard",
    ]);
  });

  it("writes a previewable site and an Express API", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const files = buildWebsiteProject(blueprint.id, "Evening tasting menu");
      const byPath = Object.fromEntries(files.map((file) => [file.path, file.content]));

      expect(Object.keys(byPath).sort()).toEqual([
        "README.md",
        "package.json",
        "server/server.js",
        "src/index.html",
        "src/script.js",
        "src/styles.css",
      ]);

      expect(byPath["src/index.html"]).toContain('href="styles.css"');
      expect(byPath["src/index.html"]).toContain('src="script.js"');
      expect(byPath["src/index.html"]).toContain('id="site-data"');
      expect(byPath["src/index.html"]).toContain("Evening tasting menu");
      expect(byPath["src/index.html"]).not.toContain("dishs");
      expect(byPath["src/index.html"]).not.toContain("storys");
      expect(byPath["src/index.html"]).not.toContain("server.js");

      expect(byPath["src/script.js"]).toContain("/api/items");
      expect(byPath["src/script.js"]).toContain("/api/messages");
      expect(byPath["src/script.js"]).toContain("localStorage");
      expect(byPath["src/script.js"]).not.toContain("require(");

      expect(byPath["server/server.js"]).toContain('require("express")');
      expect(byPath["server/server.js"]).toContain('app.get("/api/items"');
      expect(byPath["server/server.js"]).toContain('app.post("/api/messages"');
      expect(byPath["server/server.js"]).toContain('app.get("/api/health"');

      const pkg = JSON.parse(byPath["package.json"]);
      expect(pkg.scripts.start).toBe("node server/server.js");
      expect(pkg.dependencies.express).toBeTruthy();
    }
  });

  it("places files on a nested project tree", () => {
    const files = buildWebsiteProject("restaurant");
    const tree = files.reduce((current, file) => upsertProjectFile(current, file), []);
    const src = tree.find((node) => node.id === "src");
    const server = tree.find((node) => node.id === "server");

    expect(src?.children?.map((child) => child.name).sort()).toEqual(["index.html", "script.js", "styles.css"]);
    expect(server?.children?.[0].name).toBe("server.js");
    expect(tree.find((node) => node.name === "package.json")?.type).toBe("file");
  });

  it("normalizes assistant filenames into the full-stack layout", () => {
    expect(normalizeProjectPath("index.html")).toBe("src/index.html");
    expect(normalizeProjectPath("src/styles.css")).toBe("src/styles.css");
    expect(normalizeProjectPath("server.js")).toBe("server/server.js");
    expect(normalizeProjectPath("server/server.js")).toBe("server/server.js");
    expect(normalizeProjectPath("package.json")).toBe("package.json");
    expect(normalizeProjectPath("../secrets.env")).toBe("src/untitled.txt");
  });

  it("asks the model for the same six files", () => {
    const prompt = websiteGeneratorPrompt("store", "Ceramic shop");
    expect(prompt).toContain("src/index.html");
    expect(prompt).toContain("server/server.js");
    expect(prompt).toContain("Ceramic shop");
    expect(prompt).toContain("No React");
  });
});
