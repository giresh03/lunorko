import { describe, expect, it } from "vitest";
import {
  generateFullStackWebsite,
  parseWebsiteRequest,
  websiteFilesToTree,
  WEBSITE_KINDS,
  type WebsiteKind,
} from "./websiteGenerator";

const PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/app.js",
  "server/index.js",
  "server/package.json",
  "README.md",
];

describe("website generator", () => {
  it.each(WEBSITE_KINDS.map((kind) => kind.id))("scaffolds a %s site", (kind: WebsiteKind) => {
    const site = generateFullStackWebsite({ kind, name: "Harbor & Co" });
    expect(site.files.map((file) => file.path)).toEqual(PATHS);
    expect(site.name).toBe("Harbor & Co");

    const html = site.files.find((file) => file.path === "client/index.html")!.content;
    const app = site.files.find((file) => file.path === "client/app.js")!.content;
    const server = site.files.find((file) => file.path === "server/index.js")!.content;
    const pkg = site.files.find((file) => file.path === "server/package.json")!.content;

    expect(html).toContain("Harbor &amp; Co");
    expect(html).toContain('data-themed="website"');
    expect(html).not.toContain("<script>");
    expect(app).toContain("Harbor & Co");
    expect(app).toContain("http://localhost:4000");
    expect(server).toContain('require("express")');
    expect(server).toContain("/api/health");
    expect(server).toContain("typeof window");
    expect(() => JSON.parse(pkg)).not.toThrow();
    expect(JSON.parse(pkg).scripts.start).toBe("node index.js");

    expect(() => new Function(app)).not.toThrow();
    expect(() => new Function(server)).not.toThrow();
  });

  it("escapes a name that contains markup", () => {
    const site = generateFullStackWebsite({ kind: "landing", name: '<script>alert("x")</script>' });
    const html = site.files[0].content;
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("builds a nested file tree", () => {
    const site = generateFullStackWebsite({ kind: "store", name: "Northwind" });
    const tree = websiteFilesToTree(site.files);
    const client = tree.find((node) => node.name === "client");
    const server = tree.find((node) => node.name === "server");
    expect(client?.type).toBe("folder");
    expect(client?.children?.map((node) => node.name).sort()).toEqual(["app.js", "index.html", "styles.css"]);
    expect(server?.children?.map((node) => node.name).sort()).toEqual(["index.js", "package.json"]);
    expect(tree.some((node) => node.name === "README.md")).toBe(true);
  });

  it("parses assistant requests for a named site", () => {
    expect(parseWebsiteRequest("Generate a full-stack landing website called Northwind")).toEqual({
      kind: "landing",
      name: "Northwind",
    });
    expect(parseWebsiteRequest("Build a portfolio website called Atlas")).toMatchObject({
      kind: "portfolio",
      name: "Atlas",
    });
    expect(parseWebsiteRequest("make an e-commerce website named Harbor Goods")).toMatchObject({
      kind: "store",
      name: "Harbor Goods",
    });
    expect(parseWebsiteRequest("create the blog site")).toMatchObject({ kind: "blog", name: "Lunor Studio" });
    expect(parseWebsiteRequest("scaffold a dashboard website")).toMatchObject({ kind: "dashboard" });
  });

  it("leaves ordinary coding questions alone", () => {
    expect(parseWebsiteRequest("generate a javascript function for my website")).toBeNull();
    expect(parseWebsiteRequest("Build a counter with HTML, CSS, and JS")).toBeNull();
    expect(parseWebsiteRequest("what is the website generator")).toBeNull();
    expect(parseWebsiteRequest("debug this fetch call")).toBeNull();
  });

  it("accepts the short website generator command", () => {
    expect(parseWebsiteRequest("website generator")).toMatchObject({ kind: "landing", name: "Lunor Studio" });
  });
});
