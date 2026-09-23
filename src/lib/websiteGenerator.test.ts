import { describe, expect, it } from "vitest";
import {
  assembleClientPreview,
  detectWebsiteKind,
  extractBrand,
  filesToProjectTree,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
  WEBSITE_AUTOMATIONS,
} from "./websiteGenerator";

describe("website generation intent", () => {
  it("accepts requests to build a site", () => {
    expect(isWebsiteGenerationRequest("Build a restaurant website for Luna Bistro")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a landing page for Lumen")).toBe(true);
    expect(isWebsiteGenerationRequest("Generate a full-stack web app for notes")).toBe(true);
    expect(isWebsiteGenerationRequest("make me a website called Field Notes")).toBe(true);
  });

  it("leaves debugging and explanations alone", () => {
    expect(isWebsiteGenerationRequest("explain how websites work")).toBe(false);
    expect(isWebsiteGenerationRequest("debug this website error")).toBe(false);
    expect(isWebsiteGenerationRequest("make the hero bigger")).toBe(false);
    expect(isWebsiteGenerationRequest("fix the contact form")).toBe(false);
  });
});

describe("generateFullStackWebsite", () => {
  it("builds a restaurant project from the prompt", () => {
    const project = generateFullStackWebsite("Build a full-stack restaurant website for Luna Bistro");
    expect(project.kind).toBe("restaurant");
    expect(project.brand).toBe("Luna Bistro");
    const paths = project.files.map((file) => file.path);
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "server/index.js",
      "server/routes.js",
      "server/data.js",
      "package.json",
      "README.md",
    ]);
    const html = project.files[0].content;
    expect(html).toContain("Luna Bistro");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(html).toContain('data-themed');
    expect(project.files.find((file) => file.path === "server/index.js")?.content).toContain("express");
    expect(project.files.find((file) => file.path === "server/routes.js")?.content).toContain("/inquiries");
    const pkg = JSON.parse(project.files.find((file) => file.path === "package.json")!.content);
    expect(pkg.name).toBe("luna-bistro");
    expect(pkg.scripts.start).toBe("node server/index.js");
    expect(pkg.dependencies.express).toBeTruthy();
  });

  it("picks a kind and keeps the client preview free of the server", () => {
    for (const automation of WEBSITE_AUTOMATIONS) {
      const project = generateFullStackWebsite(automation.prompt);
      expect(project.kind).toBe(automation.id);
      const preview = assembleClientPreview(project.files);
      expect(preview).toContain("<style>");
      expect(preview).toContain("const SEED");
      expect(preview).not.toContain("createApiRouter");
      expect(preview).not.toContain('from "express"');
    }
  });

  it("escapes a brand before placing it in HTML", () => {
    const project = generateFullStackWebsite('Build a website named Tom & Jerry');
    expect(project.brand).toBe("Tom & Jerry");
    expect(project.files[0].content).toContain("Tom &amp; Jerry");
    expect(project.files[0].content).not.toContain("Tom & Jerry");
  });

  it("nests files into client and server folders", () => {
    const project = generateFullStackWebsite("Build a portfolio website named Mira Chen");
    expect(project.kind).toBe("portfolio");
    expect(detectWebsiteKind("Build a portfolio website named Mira Chen")).toBe("portfolio");
    expect(extractBrand("named Mira Chen", "Fallback")).toBe("Mira Chen");
    const tree = filesToProjectTree(project.files);
    const client = tree.find((node) => node.name === "client");
    const server = tree.find((node) => node.name === "server");
    expect(client?.type).toBe("folder");
    expect(client?.children?.map((child) => child.name).sort()).toEqual(["app.js", "index.html", "styles.css"]);
    expect(server?.children?.map((child) => child.name).sort()).toEqual(["data.js", "index.js", "routes.js"]);
    expect(tree.find((node) => node.name === "package.json")?.type).toBe("file");
  });
});
