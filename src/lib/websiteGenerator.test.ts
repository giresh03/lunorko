import { describe, expect, it } from "vitest";
import {
  filesToTree,
  formatWebsiteSummary,
  generateFullStackWebsite,
  inferWebsiteRequest,
  upsertProjectFile,
} from "./websiteGenerator";

describe("full-stack website generator", () => {
  it("writes a client, a Node API, and package scripts", () => {
    const project = generateFullStackWebsite({ kind: "portfolio", name: "Luna Studio" });
    const paths = project.files.map((file) => file.path);

    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "server/data/site.js",
      "server/server.js",
      "package.json",
      "README.md",
    ]);

    const html = project.files[0].content;
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(html).toContain("Luna Studio");

    const app = project.files.find((file) => file.path === "client/app.js")!.content;
    expect(app).toContain('fetch("/api/site")');
    expect(app).toContain('fetch("/api/contact"');

    const server = project.files.find((file) => file.path === "server/server.js")!.content;
    expect(server).toContain("/api/health");
    expect(server).toContain("/api/site");
    expect(server).toContain("/api/contact");
    expect(server).toContain('relative.includes("..")');

    const pkg = JSON.parse(project.files.find((file) => file.path === "package.json")!.content);
    expect(pkg.type).toBe("module");
    expect(pkg.scripts.start).toBe("node server/server.js");
    expect(pkg.name).toBe("luna-studio");
  });

  it("escapes a name that contains markup", () => {
    const project = generateFullStackWebsite({ kind: "landing", name: '<script>alert("x")</script>' });
    const html = project.files[0].content;
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("scriptalert(&quot;x&quot;)/script");
  });

  it("detects a website request and ignores ordinary questions", () => {
    expect(inferWebsiteRequest("explain css grid")).toBeNull();
    expect(inferWebsiteRequest("Build a restaurant website called Harbor & Rye")).toMatchObject({
      kind: "restaurant",
      name: "Harbor & Rye",
    });
    expect(inferWebsiteRequest("Create a SaaS website for Northwind Analytics")).toMatchObject({
      kind: "saas",
      name: "Northwind Analytics",
    });
  });

  it("keeps the catalog tagline when the prompt is only a command", () => {
    const project = generateFullStackWebsite({
      kind: "restaurant",
      brief: "Build a restaurant website called Harbor & Rye",
    });
    expect(project.name).toBe("Harbor & Rye");
    expect(project.tagline).toMatch(/Seasonal plates/);
  });

  it("builds nested folders and updates an existing file", () => {
    const project = generateFullStackWebsite({ kind: "blog" });
    const tree = filesToTree(project.files);
    const client = tree.find((node) => node.id === "client");
    expect(client?.type).toBe("folder");
    expect(client?.children?.some((node) => node.id === "client/index.html")).toBe(true);

    const updated = upsertProjectFile(tree, "client/styles.css", "css", "body{margin:0}");
    const styles = updated.find((node) => node.id === "client")?.children?.find((node) => node.id === "client/styles.css");
    expect(styles?.content).toBe("body{margin:0}");
  });

  it("summarizes how to run the generated site", () => {
    const project = generateFullStackWebsite({ kind: "store", name: "Kindling" });
    const summary = formatWebsiteSummary(project);
    expect(summary).toContain("npm start");
    expect(summary).toContain("client/index.html");
    expect(summary).toContain("/api/contact");
  });
});
