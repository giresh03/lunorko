import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  blueprintAssistantMessage,
  filesToTree,
  upsertProjectFiles,
} from "./websiteGenerator";

function checkJavaScript(code: string) {
  const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
  const file = join(dir, "file.js");
  writeFileSync(file, code);
  execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
}

describe("website generator", () => {
  it("ships four full-stack blueprints with a previewable client and an Express API", () => {
    expect(WEBSITE_BLUEPRINTS.map((blueprint) => blueprint.id)).toEqual([
      "saas-landing",
      "portfolio",
      "blog",
      "shop",
    ]);

    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const paths = blueprint.files.map((file) => file.path);
      expect(paths).toEqual(expect.arrayContaining([
        "client/index.html",
        "client/styles.css",
        "client/app.js",
        "server/index.js",
        "server/routes.js",
        "server/package.json",
        "README.md",
      ]));

      const html = blueprint.files.find((file) => file.path === "client/index.html")!.content;
      expect(html).toContain('data-themed');
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="app.js"');

      const clientJs = blueprint.files.find((file) => file.path === "client/app.js")!.content;
      const serverIndex = blueprint.files.find((file) => file.path === "server/index.js")!.content;
      const routes = blueprint.files.find((file) => file.path === "server/routes.js")!.content;
      checkJavaScript(clientJs);
      checkJavaScript(serverIndex);
      checkJavaScript(routes);
      expect(serverIndex).toContain('express.static');
      expect(serverIndex).toContain('"/api"');
      expect(routes).toContain("module.exports");
      expect(blueprintAssistantMessage(blueprint)).toContain("npm start");

      const tree = filesToTree(blueprint.files);
      const client = tree.find((node) => node.id === "client");
      const server = tree.find((node) => node.id === "server");
      expect(client?.type).toBe("folder");
      expect(server?.children?.some((file) => file.name === "index.js")).toBe(true);
      expect(client?.children?.some((file) => file.name === "index.html")).toBe(true);
    }
  });

  it("updates an existing nested file instead of duplicating it", () => {
    const created = filesToTree([
      { path: "client/app.js", language: "javascript", content: "const a = 1;\n" },
    ]);
    const updated = upsertProjectFiles(created, [
      { path: "client/app.js", language: "javascript", content: "const a = 2;\n" },
    ]);
    const client = updated.find((node) => node.id === "client");
    const files = client?.children?.filter((node) => node.name === "app.js") || [];
    expect(files).toHaveLength(1);
    expect(files[0].content).toBe("const a = 2;\n");
  });
});
