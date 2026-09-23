import { describe, expect, it } from "vitest";
import {
  detectWebsiteRequest,
  filesToTree,
  generateFullStackWebsite,
} from "./websiteGenerator";

describe("website generator", () => {
  it("builds a full-stack landing site with a client and an Express API", () => {
    const site = generateFullStackWebsite({ name: "Harbor & Co", kind: "landing" });
    const paths = site.files.map((file) => file.path);

    expect(paths).toEqual(expect.arrayContaining([
      "client/index.html",
      "client/styles.css",
      "client/site.js",
      "server/index.js",
      "server/src/app.js",
      "server/src/routes.js",
      "server/src/data.js",
      "server/package.json",
      "package.json",
      "README.md",
    ]));

    const html = site.files.find((file) => file.path === "client/index.html")?.content ?? "";
    expect(html).toContain("Harbor &amp; Co");
    expect(html).toContain('data-themed');
    expect(html).toContain('data-endpoint="/api/leads"');
    expect(html).not.toContain("<script type=\"module\"");

    const routes = site.files.find((file) => file.path === "server/src/routes.js")?.content ?? "";
    const data = site.files.find((file) => file.path === "server/src/data.js")?.content ?? "";
    expect(routes).toContain('router.get("/health"');
    expect(routes).toContain('router.post("/leads"');
    expect(data).toContain("Harbor & Co");
  });

  it("switches the write endpoint for a store", () => {
    const site = generateFullStackWebsite({ name: "Corner Market", kind: "store" });
    const html = site.files.find((file) => file.path === "client/index.html")?.content ?? "";
    const routes = site.files.find((file) => file.path === "server/src/routes.js")?.content ?? "";
    expect(html).toContain('data-endpoint="/api/orders"');
    expect(html).toContain("Ceramic Cup");
    expect(routes).toContain('router.post("/orders"');
  });

  it("nests client and server folders in the editor tree", () => {
    const site = generateFullStackWebsite({ name: "Pulse", kind: "dashboard" });
    const tree = filesToTree(site.files);
    const client = tree.find((node) => node.name === "client");
    const server = tree.find((node) => node.name === "server");
    expect(client?.type).toBe("folder");
    expect(client?.children?.some((node) => node.name === "index.html")).toBe(true);
    expect(server?.children?.some((node) => node.id === "server/src")).toBe(true);
  });

  it("detects website requests for the assistant and ignores other coding asks", () => {
    expect(detectWebsiteRequest('Build a portfolio website called "Atlas Studio"')).toMatchObject({
      kind: "portfolio",
      name: "Atlas Studio",
    });
    expect(detectWebsiteRequest("Create an ecommerce website for Northwind")).toMatchObject({
      kind: "store",
      name: "Northwind",
    });
    expect(detectWebsiteRequest("Generate a MERN blog")).toMatchObject({ kind: "blog" });
    expect(detectWebsiteRequest("Build a counter with HTML")).toBeNull();
    expect(detectWebsiteRequest("Explain how a website loads")).toBeNull();
    expect(detectWebsiteRequest("Fix the bug in my portfolio website")).toBeNull();
  });
});
