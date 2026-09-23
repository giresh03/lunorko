import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import {
  extractFencedProjectFiles,
  filesToTree,
  generateFullStackWebsite,
  listWebsiteBlueprints,
  matchWebsiteGeneratorPrompt,
  resolveGeneratedPath,
  upsertProjectFile,
} from "./websiteGenerator";

describe("website generator", () => {
  it("offers a blueprint for each full-stack site", () => {
    const ids = listWebsiteBlueprints().map((blueprint) => blueprint.id);
    expect(ids).toEqual(["portfolio", "saas", "restaurant", "blog", "store", "agency"]);
  });

  it("matches assistant prompts, including a custom name", () => {
    expect(matchWebsiteGeneratorPrompt("Generate a full-stack portfolio website")).toEqual({
      blueprintId: "portfolio",
      siteName: undefined,
    });
    expect(matchWebsiteGeneratorPrompt('Generate a full-stack store website named "Oak & Co"')).toEqual({
      blueprintId: "store",
      siteName: "Oak & Co",
    });
    expect(matchWebsiteGeneratorPrompt("Build a counter")).toBeNull();
  });

  it("writes the page, the API, and a tree the editor can open", () => {
    for (const blueprint of listWebsiteBlueprints()) {
      const site = generateFullStackWebsite(blueprint.id, "  Test Site  ");
      const byId = Object.fromEntries(site.files.map((entry) => [entry.id, entry.content]));
      expect(site.siteName).toBe("Test Site");
      expect(byId["src/index.html"]).toContain('href="styles.css"');
      expect(byId["src/index.html"]).toContain('src="script.js"');
      expect(byId["src/index.html"]).toContain("window.__SITE_SEED__");
      expect(byId["server/index.js"]).toContain('require("express")');
      expect(byId["server/index.js"]).toContain("data.collections.forEach");
      expect(byId["package.json"]).toContain('"start": "node server/index.js"');

      const data = vm.runInNewContext(`${byId["server/data.js"]}; module.exports`, { module: { exports: {} }, exports: {} });
      expect(data.siteName).toBe("Test Site");
      for (const collection of data.collections) {
        expect(byId["src/index.html"]).toContain(`data-collection="${collection.path}"`);
        expect(collection.items.length).toBeGreaterThan(0);
      }
      for (const action of data.actions) {
        expect(byId["src/index.html"]).toContain(`data-action="${action.path}"`);
      }

      const src = site.tree.find((node) => node.id === "src");
      const server = site.tree.find((node) => node.id === "server");
      expect(src?.children?.map((child) => child.name).sort()).toEqual(["index.html", "script.js", "styles.css"]);
      expect(server?.children?.map((child) => child.name).sort()).toEqual(["data.js", "index.js"]);
    }
  });

  it("keeps a hostile site name inside the page", () => {
    const site = generateFullStackWebsite("blog", '</script><img src=x onerror="alert(1)">');
    const html = site.files.find((entry) => entry.id === "src/index.html")!.content;
    expect(html).not.toContain("</script><img");
    expect(html).toContain("\\u003c/script>");
    expect(html).toContain("&lt;/script&gt;");
  });

  it("renders catalog cards from seed data without an API", async () => {
    const site = generateFullStackWebsite("portfolio");
    const html = site.files.find((entry) => entry.id === "src/index.html")!.content;
    const script = site.files.find((entry) => entry.id === "src/script.js")!.content;
    const page = html.replace('<script src="script.js"></script>', `<script>${script}</script>`);
    const dom = new JSDOM(page, { runScripts: "dangerously", url: "https://preview.local/" });
    await new Promise((resolve) => setTimeout(resolve, 30));
    const titles = [...dom.window.document.querySelectorAll(".card h3")].map((node) => node.textContent);
    expect(titles).toContain("Harbor Analytics");
    expect(dom.window.document.querySelector("form[data-action='/api/contact']")).toBeTruthy();
  });

  it("places generated paths and refuses to climb out of the project", () => {
    expect(resolveGeneratedPath("server/index.js")).toEqual({ id: "server/index.js", name: "index.js" });
    expect(resolveGeneratedPath("app.js")).toEqual({ id: "src/app.js", name: "app.js" });
    expect(resolveGeneratedPath("../secret.js").id.startsWith("src/")).toBe(true);

    const tree = [
      { id: "src/index.html", name: "index.html", language: "html", content: "one" },
      { id: "src/styles.css", name: "styles.css", language: "css", content: "two" },
      { id: "server/index.js", name: "index.js", language: "javascript", content: "three" },
    ].reduce((current, entry) => upsertProjectFile(current, entry), filesToTree([]));
    const html = tree.find((node) => node.id === "src")?.children?.find((node) => node.name === "index.html");
    expect(html?.content).toBe("one");
    expect(tree.find((node) => node.id === "server")?.children?.[0].content).toBe("three");
  });

  it("reads fenced files that include their path", () => {
    const markdown = [
      "src/index.html",
      "```html",
      "<h1>Hi</h1>",
      "```",
      "",
      "server/index.js",
      "```javascript",
      "console.log(1)",
      "```",
    ].join("\n");
    expect(extractFencedProjectFiles(markdown)).toEqual([
      { path: "src/index.html", language: "html", code: "<h1>Hi</h1>" },
      { path: "server/index.js", language: "javascript", code: "console.log(1)" },
    ]);
  });
});
