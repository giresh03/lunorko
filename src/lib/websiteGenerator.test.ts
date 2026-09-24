import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  WEBSITE_FILE_PATHS,
  clientPreviewMap,
  generateWebsite,
  matchWebsiteRequest,
  toFileTree,
} from "./websiteGenerator";

describe("website generator", () => {
  it("lists the full-stack blueprints", () => {
    expect(WEBSITE_BLUEPRINTS.map((item) => item.id)).toEqual([
      "landing",
      "portfolio",
      "blog",
      "store",
      "dashboard",
    ]);
  });

  it("writes a client, an Express API, and a readme", () => {
    const project = generateWebsite({ blueprint: "landing" });
    expect(project.files.map((file) => file.path).sort()).toEqual([...WEBSITE_FILE_PATHS].sort());
    const pkg = JSON.parse(project.files.find((file) => file.path === "server/package.json")!.content);
    expect(pkg.type).toBe("module");
    expect(pkg.scripts.start).toBe("node index.mjs");
    const app = project.files.find((file) => file.path === "server/src/app.mjs")!.content;
    expect(app).toContain("/api/health");
    const db = project.files.find((file) => file.path === "server/src/config/db.mjs")!.content;
    expect(db).toContain("MONGODB_URI");
    const index = project.files.find((file) => file.path === "server/index.mjs")!.content;
    expect(index).toContain('path.join(__dirname, "..", "client")');
  });

  it("renders sample data in the client before the API is available", () => {
    const project = generateWebsite({ blueprint: "portfolio" });
    const html = project.files.find((file) => file.path === "client/index.html")!.content;
    const js = project.files.find((file) => file.path === "client/site.js")!.content;
    expect(html).toContain("styles.css");
    expect(html).toContain("site.js");
    expect(html).not.toMatch(/react/i);
    expect(js).toContain("SAMPLE");
    expect(js).toContain("draw(SAMPLE.projects)");
    expect(js).toContain("/api/projects");
  });

  it("maps a coffee shop website to Harbor Coffee", () => {
    const brief = matchWebsiteRequest("build a coffee shop website");
    expect(brief).toMatchObject({ blueprint: "store", brand: "Harbor Coffee", catalog: "coffee" });
    const seed = generateWebsite(brief!).files.find((file) => file.path === "server/src/data/seed.mjs")!.content;
    const client = generateWebsite(brief!).files.find((file) => file.path === "client/site.js")!.content;
    expect(seed).toContain("Harbor Coffee");
    expect(seed).toContain("Espresso");
    expect(client).toContain("Espresso");
  });

  it("maps a restaurant website to a supper menu", () => {
    const brief = matchWebsiteRequest("create a restaurant website");
    expect(brief?.blueprint).toBe("store");
    expect(brief?.catalog).toBe("supper");
    const seed = generateWebsite(brief!).files.find((file) => file.path === "server/src/data/seed.mjs")!.content;
    expect(seed).toContain("supper");
    expect(seed).toContain("Herb Roast Chicken");
  });

  it("leaves small widgets for the coding assistant", () => {
    expect(matchWebsiteRequest("build a counter with HTML, CSS, and JS")).toBeNull();
    expect(matchWebsiteRequest("create a login form")).toBeNull();
    expect(matchWebsiteRequest("explain what a landing page is")).toBeNull();
  });

  it("emits client scripts that parse", () => {
    for (const id of ["landing", "portfolio", "blog", "store", "dashboard"] as const) {
      const js = generateWebsite({ blueprint: id }).files.find((file) => file.path === "client/site.js")!.content;
      expect(() => new Function(js)).not.toThrow();
    }
    const coffee = generateWebsite(matchWebsiteRequest("build a coffee shop website")!).files.find((file) => file.path === "client/site.js")!.content;
    expect(coffee).toContain("$${(item.price / 100).toFixed(2)}");
  });

  it("keeps server code out of the browser preview map", () => {
    const project = generateWebsite({ blueprint: "blog" });
    const preview = clientPreviewMap(project.files);
    expect(Object.keys(preview).some((key) => key.startsWith("server/"))).toBe(false);
    expect(preview["styles.css"]).toContain("--bg");
    expect(preview["client/index.html"]).toContain("Field Notes");
    const tree = toFileTree(project.files);
    const server = tree.find((node) => node.name === "server");
    expect(server?.type).toBe("folder");
    expect(server?.children?.some((node) => node.name === "src")).toBe(true);
  });
});
