import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  buildFullStackWebsite,
  filesToProjectTree,
  insertGeneratedFile,
  isFullStackWebsiteRequest,
} from "@/lib/websiteGenerator";

describe("full-stack website generator", () => {
  it("recognizes full-stack assistant requests and leaves single-page prompts alone", () => {
    expect(isFullStackWebsiteRequest("Build a full-stack portfolio website with an API")).toBe(true);
    expect(isFullStackWebsiteRequest("Use the website generator for a MERN-style Express API")).toBe(true);
    expect(isFullStackWebsiteRequest("Build a counter with HTML, CSS, and JS")).toBe(false);
  });

  it("scaffolds a client and an Express API for every blueprint", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const site = buildFullStackWebsite(blueprint.id, { brief: "A calm site for evening visitors" });
      const paths = site.files.map((file) => file.path);
      expect(paths).toEqual([
        "client/index.html",
        "client/styles.css",
        "client/app.js",
        "server/index.js",
        "server/package.json",
        "README.md",
      ]);

      const html = site.files[0].content;
      const client = site.files[2].content;
      const server = site.files[3].content;
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="app.js"');
      expect(html).toContain("A calm site for evening visitors");
      expect(client).toContain("/api/items");
      expect(client).toContain("/api/leads");
      expect(client).not.toContain("require(");
      expect(server).toContain('require("express")');
      expect(server).toContain('app.get("/api/items"');
      expect(server).toContain('app.post("/api/leads"');
      expect(site.summary).toContain(blueprint.brand);
    }
  });

  it("places generated files in client and server folders", () => {
    const site = buildFullStackWebsite("restaurant");
    const tree = filesToProjectTree(site.files);
    const client = tree.find((node) => node.name === "client");
    const server = tree.find((node) => node.name === "server");
    expect(client?.type).toBe("folder");
    expect(server?.children?.map((node) => node.name)).toEqual(["index.js", "package.json"]);
    expect(client?.children?.some((node) => node.id === "client/index.html")).toBe(true);

    const updated = insertGeneratedFile(tree, "client/styles.css", "body{margin:0}", "css");
    const css = updated.find((node) => node.name === "client")?.children?.find((node) => node.name === "styles.css");
    expect(css?.content).toBe("body{margin:0}");
  });
});
