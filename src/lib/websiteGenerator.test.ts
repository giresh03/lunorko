import { describe, expect, it } from "vitest";
import {
  buildWebsiteProject,
  detectWebsiteRequest,
  extractSiteName,
  WEBSITE_BLUEPRINTS,
} from "./websiteGenerator";

const REQUIRED = [
  "client/index.html",
  "client/styles.css",
  "client/script.js",
  "server/server.js",
  "package.json",
  "README.md",
];

describe("website generator", () => {
  it("builds every blueprint with a previewable client and a Node API", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const project = buildWebsiteProject(blueprint.id, "Koi & Co");
      const paths = project.files.map((file) => file.path);
      expect(paths).toEqual(REQUIRED);

      const html = project.files.find((file) => file.path === "client/index.html")!.content;
      const script = project.files.find((file) => file.path === "client/script.js")!.content;
      const server = project.files.find((file) => file.path === "server/server.js")!.content;
      const pkg = JSON.parse(project.files.find((file) => file.path === "package.json")!.content);

      expect(html).toContain("styles.css");
      expect(html).toContain("script.js");
      expect(html).toContain("Koi &amp; Co");
      expect(script).toContain("localhost:3000");
      expect(script).toContain("FALLBACK_");
      expect(server).toContain("createServer");
      expect(server).toContain("/api/");
      expect(server).not.toContain("express");
      expect(pkg.scripts.start).toBe("node server/server.js");
      expect(project.tree.some((node) => node.name === "client" && node.type === "folder")).toBe(true);
      expect(project.summary).toContain("server/server.js");
    }
  });

  it("detects the website the assistant was asked to build", () => {
    expect(detectWebsiteRequest("Build a restaurant website with reservations")).toBe("restaurant");
    expect(detectWebsiteRequest("Generate a full-stack SaaS landing page")).toBe("saas");
    expect(detectWebsiteRequest("Create an online store website")).toBe("store");
    expect(detectWebsiteRequest("Make a blog website")).toBe("blog");
    expect(detectWebsiteRequest("Scaffold a dashboard website")).toBe("dashboard");
    expect(detectWebsiteRequest("How does CSS grid work?")).toBeNull();
  });

  it("reads a quoted site name from the prompt", () => {
    expect(extractSiteName('Build a portfolio website called "Northwind"')).toBe("Northwind");
    expect(extractSiteName("Generate a website named Harbor Ledger")).toBe("Harbor Ledger");
  });
});
