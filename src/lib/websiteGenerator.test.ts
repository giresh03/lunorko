import { describe, expect, it } from "vitest";
import {
  extractBrand,
  generateFullStackWebsite,
  isWebsiteGeneratorRequest,
  listWebsiteBlueprints,
  matchWebsiteBlueprint,
  websiteFilesToTree,
} from "./websiteGenerator";

describe("website generator", () => {
  it("lists the full-stack website blueprints", () => {
    const ids = listWebsiteBlueprints().map((blueprint) => blueprint.id);
    expect(ids).toEqual(["landing", "portfolio", "blog", "restaurant", "store", "dashboard"]);
  });

  it("matches a restaurant brief to the restaurant blueprint", () => {
    expect(matchWebsiteBlueprint("Build a restaurant website with a menu").id).toBe("restaurant");
    expect(matchWebsiteBlueprint("Generate a portfolio website").id).toBe("portfolio");
    expect(matchWebsiteBlueprint("Generate a full-stack website").id).toBe("landing");
  });

  it("recognizes website generation requests and ignores unrelated coding questions", () => {
    expect(isWebsiteGeneratorRequest("Generate a full-stack landing page website")).toBe(true);
    expect(isWebsiteGeneratorRequest("Build a portfolio website for Northwind Studio")).toBe(true);
    expect(isWebsiteGeneratorRequest("Use the website generator")).toBe(true);
    expect(isWebsiteGeneratorRequest("Build a counter with HTML")).toBe(false);
    expect(isWebsiteGeneratorRequest("Explain how CSS grid works")).toBe(false);
  });

  it("reads a brand from the brief", () => {
    expect(extractBrand('Generate a portfolio website called "Northwind Studio"', "Lumen")).toBe("Northwind Studio");
    expect(extractBrand("Build a restaurant website for Harbor Table", "Lumen")).toBe("Harbor Table");
    expect(extractBrand("Generate a full-stack website", "Lumen")).toBe("Lumen");
  });

  it("writes a previewable client and an Express API", () => {
    const project = generateFullStackWebsite("Build a portfolio website for Northwind Studio");
    const paths = project.files.map((file) => file.path);

    expect(project.brand).toBe("Northwind Studio");
    expect(project.blueprint.id).toBe("portfolio");
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/site.js",
      "server/server.mjs",
      "server/store.mjs",
      "package.json",
      "README.md",
    ]);

    const html = project.files.find((file) => file.path === "client/index.html")?.content ?? "";
    const client = project.files.find((file) => file.path === "client/site.js")?.content ?? "";
    const server = project.files.find((file) => file.path === "server/server.mjs")?.content ?? "";
    const store = project.files.find((file) => file.path === "server/store.mjs")?.content ?? "";
    const pkg = project.files.find((file) => file.path === "package.json")?.content ?? "";

    expect(html).toContain("Northwind Studio");
    expect(html).toContain('data-themed');
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="site.js"');
    expect(html).not.toContain("<script>");
    expect(client).toContain("/api/records");
    expect(client).not.toContain("import ");
    expect(server).toContain('from "express"');
    expect(server).toContain("/api/site");
    expect(store).toContain("Northwind Studio");
    expect(pkg).toContain('"start": "node server/server.mjs"');
    expect(project.summary).not.toContain("```");
  });

  it("escapes brand names before placing them in HTML", () => {
    const project = generateFullStackWebsite('Generate a landing page website called "<script>alert(1)</script>"');
    const html = project.files.find((file) => file.path === "client/index.html")?.content ?? "";
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("nests client and server files in a project tree", () => {
    const project = generateFullStackWebsite("Generate a full-stack online store website");
    const tree = websiteFilesToTree(project.files);
    const client = tree.find((node) => node.name === "client");
    const server = tree.find((node) => node.name === "server");
    expect(client?.type).toBe("folder");
    expect(client?.children?.map((child) => child.name).sort()).toEqual(["index.html", "site.js", "styles.css"]);
    expect(server?.children?.map((child) => child.name).sort()).toEqual(["server.mjs", "store.mjs"]);
  });
});
