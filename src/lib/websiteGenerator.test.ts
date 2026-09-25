import { describe, expect, it } from "vitest";
import {
  WEBSITE_AUTOMATIONS,
  buildWebsiteProject,
  generateWebsiteFiles,
  isWebsiteKind,
  type WebsiteKind,
} from "./websiteGenerator";

const kinds = WEBSITE_AUTOMATIONS.map((item) => item.id);

describe("full-stack website generator", () => {
  it("lists a generator for each web assistant automation", () => {
    expect(kinds).toEqual(["landing", "portfolio", "blog", "store", "dashboard"]);
    expect(isWebsiteKind("landing")).toBe(true);
    expect(isWebsiteKind("native-app")).toBe(false);
  });

  it.each(kinds)("writes a client and an Express API for %s", (kind: WebsiteKind) => {
    const files = generateWebsiteFiles(kind);
    const byPath = Object.fromEntries(files.map((file) => [file.path, file.content]));

    expect(Object.keys(byPath).sort()).toEqual([
      "README.md",
      "client/index.html",
      "client/script.js",
      "client/styles.css",
      "server/package.json",
      "server/server.js",
    ]);

    expect(byPath["client/index.html"]).toContain('href="styles.css"');
    expect(byPath["client/index.html"]).toContain('src="script.js"');
    expect(byPath["client/index.html"]).toContain('data-themed');
    expect(byPath["client/script.js"]).toContain("SITE.records");
    expect(byPath["client/script.js"]).toContain("fetch(SITE.apiPath)");
    expect(byPath["server/server.js"]).toContain('require("express")');
    expect(byPath["server/server.js"]).toContain('app.get("/api/health"');
    expect(byPath["server/server.js"]).toContain('app.post("/api/messages"');
    expect(byPath["server/package.json"]).toContain('"express"');
    expect(JSON.parse(byPath["server/package.json"]).scripts.start).toBe("node server.js");

    const project = buildWebsiteProject(kind);
    expect(project.activeFileId).toBe("client/index.html");
    expect(project.tree.map((node) => node.name).sort()).toEqual(["README.md", "client", "server"]);
    expect(project.openTabs.map((tab) => tab.id)).toEqual([
      "client/index.html",
      "client/script.js",
      "server/server.js",
    ]);
  });

  it("rejects an unknown automation", () => {
    expect(() => generateWebsiteFiles("native-app" as WebsiteKind)).toThrow(/Unknown website automation/);
  });
});
