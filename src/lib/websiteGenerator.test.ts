import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  WEBSITE_PROJECT_PATHS,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
  mergeWebsiteFiles,
  shouldInlineInPreview,
} from "./websiteGenerator";

function file(project: ReturnType<typeof generateFullStackWebsite>, path: string) {
  const match = project.files.find((entry) => entry.path === path);
  expect(match, path).toBeTruthy();
  return match!.content;
}

describe("website generator", () => {
  it("detects a new website request and ignores edit requests", () => {
    expect(isWebsiteGenerationRequest("build a coffee shop website")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a portfolio website")).toBe(true);
    expect(isWebsiteGenerationRequest("make the website header sticky")).toBe(false);
    expect(isWebsiteGenerationRequest("Build a counter with HTML, CSS, and JS")).toBe(false);
  });

  it("writes the client and Express server for every blueprint", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const project = generateFullStackWebsite(blueprint.prompt);
      expect(project.blueprintId).toBe(blueprint.id);
      expect(project.files.map((entry) => entry.path).sort()).toEqual([...WEBSITE_PROJECT_PATHS].sort());

      const html = file(project, "client/index.html");
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="site.js"');
      expect(html).toContain(`<title>${project.title.replace(/&/g, "&amp;")}</title>`);

      const clientJs = file(project, "client/site.js");
      expect(clientJs).toContain("/api/content");
      expect(clientJs).toContain("SAMPLE");

      const pkg = JSON.parse(file(project, "server/package.json"));
      expect(pkg.type).toBe("module");
      expect(pkg.scripts.start).toBe("node index.mjs");

      expect(file(project, "server/src/routes/api.mjs")).toContain('"/health"');
      expect(file(project, "server/src/config/db.mjs")).toContain("MONGODB_URI");
      expect(file(project, "server/src/app.mjs")).toContain("express.static");
      expect(file(project, "README.md")).toContain("npm start");
    }
  });

  it("builds a coffee shop store from a plain-language request", () => {
    const project = generateFullStackWebsite("build a coffee shop website");
    expect(project.blueprintId).toBe("store");
    expect(project.title).toBe("Harbor Coffee");
    expect(file(project, "server/src/data/seed.mjs")).toContain("Espresso");
    expect(file(project, "server/src/routes/api.mjs")).toContain('"/orders"');
  });

  it("escapes a title that tries to inject markup", () => {
    const project = generateFullStackWebsite('Build a landing page website called <script>alert(1)</script>');
    expect(file(project, "client/index.html")).not.toContain("<script>alert");
  });

  it("keeps server files out of the preview and nests them in the project tree", () => {
    expect(shouldInlineInPreview("client/site.js")).toBe(true);
    expect(shouldInlineInPreview("server/index.mjs")).toBe(false);
    expect(shouldInlineInPreview("server/src/routes/api.mjs")).toBe(false);

    const project = generateFullStackWebsite("Build a dashboard website");
    const tree = mergeWebsiteFiles(
      [{ id: "src", name: "src", type: "folder", isOpen: true, children: [] }],
      project.files
    );
    expect(tree.some((node) => node.id === "src")).toBe(true);
    const server = tree.find((node) => node.id === "server");
    const routes = server?.children?.find((node) => node.id === "server/src")?.children
      ?.find((node) => node.id === "server/src/routes")?.children;
    expect(routes?.some((node) => node.id === "server/src/routes/api.mjs")).toBe(true);
  });

  it("emits JavaScript that Node can parse", () => {
    const project = generateFullStackWebsite("build a coffee shop website");
    const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
    for (const entry of project.files) {
      if (!entry.path.endsWith(".js") && !entry.path.endsWith(".mjs")) continue;
      const target = join(dir, entry.name);
      writeFileSync(target, entry.content);
      execFileSync(process.execPath, ["--check", target], { stdio: "pipe" });
    }
  });
});
