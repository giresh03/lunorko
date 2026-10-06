import { describe, expect, it } from "vitest";
import { buildWebsiteProject, slugifySiteName, upsertGeneratedFiles, WEBSITE_BLUEPRINTS, type WebsiteKind } from "./websiteGenerator";

describe("website generator", () => {
  it("slugifies site names", () => {
    expect(slugifySiteName("  Harbor & Co! ")).toBe("harbor-co");
    expect(slugifySiteName("***")).toBe("lunor-site");
  });

  it.each(WEBSITE_BLUEPRINTS.map((item) => item.id))("builds a full-stack %s project", (kind: WebsiteKind) => {
    const project = buildWebsiteProject({
      kind,
      siteName: "Harbor Studio",
      brief: "A site for weekend workshops",
    });

    const paths = project.files.map((file) => file.path);
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "server/index.js",
      "server/routes.js",
      "server/store.js",
      "package.json",
      "README.md",
      ".env.example",
    ]);

    const html = project.files[0].content;
    const server = project.files.find((file) => file.path === "server/index.js")!.content;
    const routes = project.files.find((file) => file.path === "server/routes.js")!.content;
    const app = project.files.find((file) => file.path === "client/app.js")!.content;
    const pkg = JSON.parse(project.files.find((file) => file.path === "package.json")!.content);

    expect(html).toContain("Harbor Studio");
    expect(html).toContain("A site for weekend workshops");
    expect(html).toContain('data-themed="true"');
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(app).toContain('fetch("/api/catalog")');
    expect(app).toContain('fetch("/api/submissions"');
    expect(server).toContain('express');
    expect(server).toContain('"/api"');
    expect(routes).toContain('"/catalog"');
    expect(routes).toContain('"/submissions"');
    expect(pkg.name).toBe("harbor-studio");
    expect(pkg.scripts.start).toBe("node server/index.js");
    expect(project.aiPrompt).toContain("[website-generator]");
    for (const file of project.files) {
      if (file.language === "javascript") {
        expect(() => new Function(file.content)).not.toThrow();
      }
    }
  });

  it("nests generated files into folders", () => {
    const project = buildWebsiteProject({ kind: "landing", siteName: "Lunor" });
    const tree = upsertGeneratedFiles([], project.files);
    const client = tree.find((node) => node.id === "client");
    const server = tree.find((node) => node.id === "server");
    expect(client?.type).toBe("folder");
    expect(client?.children?.map((child) => child.id)).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
    ]);
    expect(server?.children?.map((child) => child.name)).toEqual(["index.js", "routes.js", "store.js"]);
    expect(tree.find((node) => node.id === "package.json")?.type).toBe("file");
  });
});
