import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  editorPathFor,
  generateWebsite,
  inferWebsiteRequest,
  insertGeneratedFile,
  previewFileMap,
  resolveBrand,
  safeRelativePath,
  type EditorTreeNode,
} from "./websiteGenerator";

describe("website generator", () => {
  it("offers a blueprint for each full-stack site", () => {
    expect(WEBSITE_BLUEPRINTS.map((item) => item.id)).toEqual([
      "landing",
      "portfolio",
      "blog",
      "restaurant",
      "saas",
      "store",
    ]);
  });

  it("writes a previewable frontend and an Express API", () => {
    const site = generateWebsite("portfolio", "Maya Chen");
    const paths = site.files.map((file) => file.path);
    expect(paths).toEqual([
      "index.html",
      "styles.css",
      "script.js",
      "server/index.js",
      "server/package.json",
    ]);
    const html = site.files[0].content;
    expect(html).toContain("Maya Chen");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="script.js"');
    expect(html).toContain("data-themed");
    expect(site.files[2].content).toContain("/api/items");
    expect(site.files[2].content).toContain("FALLBACK");
    expect(site.files[3].content).toContain('app.get("/api/items"');
    expect(site.files[3].content).toContain("Maya Chen");
    expect(site.summary).toContain("npm start");
  });

  it("escapes a brand name in the page", () => {
    const site = generateWebsite("landing", '<img src=x onerror="alert(1)"> North');
    expect(site.files[0].content).not.toContain("<img src=x");
    expect(site.files[0].content).toContain("&lt;img");
    expect(site.brand.startsWith("<img")).toBe(true);
  });

  it("recognizes a short build request for the assistant", () => {
    expect(inferWebsiteRequest("Build a portfolio for Harbor Studio")).toEqual({
      kind: "portfolio",
      brand: "Harbor Studio",
    });
    expect(inferWebsiteRequest("Create a restaurant called Olive & Rye")).toMatchObject({
      kind: "restaurant",
    });
    expect(inferWebsiteRequest("How does a landing page work?")).toBeNull();
    expect(inferWebsiteRequest("Build a counter with HTML")).toBeNull();
  });

  it("uses the blueprint name when the brand is blank", () => {
    expect(resolveBrand("   ", "Relay")).toBe("Relay");
    expect(generateWebsite("saas", "").brand).toBe("Relay");
  });

  it("keeps the server out of the preview bundle", () => {
    const site = generateWebsite("store", "Kindred");
    const preview = previewFileMap(site.files);
    expect(Object.keys(preview).sort()).toEqual(["index.html", "script.js", "styles.css"]);
    expect(preview["script.js"]).toContain('KIND === "store"');
  });

  it("places nested API files without leaving the project tree", () => {
    expect(safeRelativePath("../server/index.js")).toBeNull();
    expect(safeRelativePath("server/index.js")).toBe("server/index.js");
    expect(editorPathFor("index.html")).toEqual({ id: "src/index.html", name: "index.html" });
    expect(editorPathFor("server/index.js")).toEqual({ id: "server/index.js", name: "index.js" });

    const tree: EditorTreeNode[] = [
      { id: "src", name: "src", type: "folder", isOpen: true, children: [
        { id: "src/index.html", name: "index.html", type: "file", language: "html", content: "old" },
      ] },
    ];
    const site = generateWebsite("blog", "Field Notes");
    const next = site.files.reduce(
      (nodes, file) => insertGeneratedFile(nodes, file),
      tree,
    );
    const src = next.find((node) => node.id === "src");
    const server = next.find((node) => node.id === "server");
    expect(src?.children?.find((node) => node.name === "index.html")?.content).toContain("Field Notes");
    expect(server?.type).toBe("folder");
    expect(server?.children?.map((node) => node.name).sort()).toEqual(["index.js", "package.json"]);
    expect(tree[0].children?.[0].content).toBe("old");
  });
});
