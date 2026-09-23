import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  generateFullStackWebsite,
  generatedFilesToTree,
  isWebsiteGeneratorRequest,
  parseWebsiteBrief,
} from "./index";

describe("website generator automation", () => {
  it("recognizes website build requests and leaves ordinary questions alone", () => {
    expect(isWebsiteGeneratorRequest("Generate a full-stack website called Lumen")).toBe(true);
    expect(isWebsiteGeneratorRequest("Build a landing page for Northwind")).toBe(true);
    expect(isWebsiteGeneratorRequest("website generator")).toBe(true);
    expect(isWebsiteGeneratorRequest("How does CSS grid work?")).toBe(false);
    expect(isWebsiteGeneratorRequest("How do I build a website?")).toBe(false);
    expect(isWebsiteGeneratorRequest("Create a login form")).toBe(false);
  });

  it("picks the site kind and name from the prompt", () => {
    const restaurant = parseWebsiteBrief("Generate a full-stack restaurant website called Harbor & Rye");
    expect(restaurant.kind).toBe("restaurant");
    expect(restaurant.name).toBe("Harbor & Rye");
    expect(restaurant.slug).toBe("harbor-and-rye");

    const shop = parseWebsiteBrief('Make an online shop called "Field Goods"');
    expect(shop.kind).toBe("shop");
    expect(shop.name).toBe("Field Goods");
  });

  it("writes a previewable client and a Node HTTP API", () => {
    const site = generateFullStackWebsite("Generate a full-stack SaaS website called Nimbus");
    const byPath = Object.fromEntries(site.files.map((file) => [file.path, file.content]));

    expect(byPath["src/index.html"]).toContain('href="style.css"');
    expect(byPath["src/index.html"]).toContain('src="app.js"');
    expect(byPath["src/index.html"]).toContain("Nimbus");
    expect(byPath["src/app.js"]).toContain("/api/site");
    expect(byPath["src/app.js"]).toContain("/api/contact");
    expect(byPath["src/app.js"]).toContain("The preview saved this locally.");
    expect(byPath["src/app.js"]).not.toContain("express");
    expect(byPath["server/server.cjs"]).toContain('require("http")');
    expect(byPath["server/server.cjs"]).toContain('url.pathname === "/api/health"');
    expect(byPath["server/server.cjs"]).toContain('url.pathname === "/api/plans"');
    expect(byPath["server/server.cjs"]).toContain('"name": "Nimbus"');
    expect(byPath["package.json"]).toContain('"start": "node server/server.cjs"');
    expect(byPath["package.json"]).not.toContain("express");
  });

  it("escapes names that could break the page", () => {
    const site = generateFullStackWebsite('Build a website called "<script>alert(1)</script>"');
    const html = site.files.find((file) => file.path === "src/index.html")?.content || "";
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("emits JavaScript the runtime can parse", () => {
    const site = generateFullStackWebsite("Generate a full-stack restaurant website called Harbor & Rye");
    const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
    for (const file of site.files) {
      if (!/\.(cjs|js)$/.test(file.path)) continue;
      const target = join(dir, file.path.replaceAll("/", "_"));
      writeFileSync(target, file.content);
      execFileSync(process.execPath, ["--check", target], { stdio: "pipe" });
    }
  });

  it("nests generated files into client and server folders", () => {
    const site = generateFullStackWebsite("Generate a full-stack blog website called Field Notes");
    const tree = generatedFilesToTree(site.files);
    const client = tree.find((node) => node.name === "src");
    const server = tree.find((node) => node.name === "server");
    expect(client?.children?.map((node) => node.name)).toEqual(["index.html", "style.css", "app.js"]);
    expect(server?.children?.map((node) => node.name)).toEqual(["server.cjs"]);
  });
});
