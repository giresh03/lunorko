import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  generateFullStackWebsite,
  isFullStackWebsiteRequest,
  listRequiredWebsitePaths,
  matchWebsiteBlueprint,
  parseFencedFiles,
  placeFileInTree,
  type ProjectNode,
} from "./websiteGenerator";

describe("website generator", () => {
  it("matches a restaurant brief and ignores a plain coding question", () => {
    expect(matchWebsiteBlueprint("Build a full-stack restaurant website")).toBe("restaurant");
    expect(matchWebsiteBlueprint("saas pricing page")).toBe("saas");
    expect(isFullStackWebsiteRequest("Build a full-stack restaurant website")).toBe(true);
    expect(isFullStackWebsiteRequest("Create a website with an Express API")).toBe(true);
    expect(isFullStackWebsiteRequest("Build a counter with HTML")).toBe(false);
  });

  it("writes a runnable client and server for every blueprint", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "lunor-site-"));
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const site = generateFullStackWebsite(blueprint.id, { brief: `Build "Cedar & Co" ${blueprint.label}` });
      expect(site.siteName).toBe("Cedar & Co");
      const paths = site.files.map((file) => file.path);
      for (const required of listRequiredWebsitePaths()) expect(paths).toContain(required);

      const html = site.files.find((file) => file.path === "client/index.html")!;
      const client = site.files.find((file) => file.path === "client/app.js")!;
      const server = site.files.find((file) => file.path === "server/server.js")!;
      const routes = site.files.find((file) => file.path === "server/routes.js")!;
      expect(html.content).toContain("Cedar &amp; Co");
      expect(html.content).toContain('href="styles.css"');
      expect(html.content).toContain('src="app.js"');
      expect(client.content).toContain("API_BASE");
      expect(client.content).toContain("escapeHtml");
      expect(server.content).toContain("express");
      expect(routes.content).toContain("mongoose");

      const htmlNode = findNode(site.tree, "client/index.html");
      expect(htmlNode?.type).toBe("file");
      expect(htmlNode?.content).toContain("Cedar &amp; Co");

      for (const file of site.files.filter((item) => item.path.endsWith(".js"))) {
        const target = path.join(directory, `${blueprint.id}-${file.name}`);
        writeFileSync(target, file.content);
        execFileSync(process.execPath, ["--check", target], { stdio: "pipe" });
      }
    }
  });

  it("reads fenced paths and places them in nested folders", () => {
    const blocks = parseFencedFiles("client/index.html\n```html\n<h1>Hi</h1>\n```\n\nserver/server.js\n```javascript\nconsole.log(1)\n```");
    expect(blocks.map((block) => block.path)).toEqual(["client/index.html", "server/server.js"]);

    const tree = placeFileInTree([], "server/routes.js", "export {}", "javascript");
    expect(findNode(tree, "server/routes.js")?.content).toBe("export {}");
  });
});

function findNode(nodes: ProjectNode[], id: string): ProjectNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = node.children ? findNode(node.children, id) : undefined;
    if (nested) return nested;
  }
  return undefined;
}
