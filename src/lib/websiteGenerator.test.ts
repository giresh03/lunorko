import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import {
  WEBSITE_TEMPLATES,
  canonicalizeWebsitePath,
  filesToTree,
  insertGeneratedFile,
  isFullStackWebsiteRequest,
} from "./websiteGenerator";

const REQUIRED = [
  "public/index.html",
  "public/styles.css",
  "public/script.js",
  "server/server.js",
  "server/package.json",
  "README.md",
];

describe("website generator intent", () => {
  it("detects full-stack website requests", () => {
    expect(isFullStackWebsiteRequest("Build a portfolio website")).toBe(true);
    expect(isFullStackWebsiteRequest("Generate a landing page for a bakery")).toBe(true);
    expect(isFullStackWebsiteRequest("Create an online store with checkout")).toBe(true);
  });

  it("ignores tutoring questions and editor file context", () => {
    expect(isFullStackWebsiteRequest("Explain CSS grid")).toBe(false);
    expect(isFullStackWebsiteRequest("Fix the button color")).toBe(false);
    const withContext = `change the hero color\n\n[Current file: index.html (html)]\n\`\`\`html\n<!-- build a website -->\n\`\`\``;
    expect(isFullStackWebsiteRequest(withContext)).toBe(false);
  });
});

describe("website generator files", () => {
  it("canonicalizes generated paths into the full-stack layout", () => {
    expect(canonicalizeWebsitePath("index.html", "<html></html>")).toBe("public/index.html");
    expect(canonicalizeWebsitePath("server.js", `const express = require("express");\nexpress()`)).toBe("server/server.js");
    expect(canonicalizeWebsitePath("public/styles.css", "body{}")).toBe("public/styles.css");
  });

  it("nests public and server folders", () => {
    const tree = filesToTree(WEBSITE_TEMPLATES[0].files);
    const publicFolder = tree.find((node) => node.id === "public");
    const serverFolder = tree.find((node) => node.id === "server");
    expect(publicFolder?.children?.map((file) => file.name).sort()).toEqual(["index.html", "script.js", "styles.css"]);
    expect(serverFolder?.children?.map((file) => file.name).sort()).toEqual(["package.json", "server.js"]);
    const updated = insertGeneratedFile(tree, "public/styles.css", "body{color:red}", "css");
    const css = updated.find((node) => node.id === "public")?.children?.find((file) => file.name === "styles.css");
    expect(css?.content).toBe("body{color:red}");
  });

  it.each(WEBSITE_TEMPLATES.map((template) => [template.id, template] as const))(
    "%s page renders with fallback data",
    async (_id, template) => {
      const html = template.files.find((file) => file.path === "public/index.html")!.content;
      const css = template.files.find((file) => file.path === "public/styles.css")!.content;
      const js = template.files.find((file) => file.path === "public/script.js")!.content;
      const server = template.files.find((file) => file.path === "server/server.js")!.content;
      expect(template.files.map((file) => file.path).sort()).toEqual([...REQUIRED].sort());
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="script.js"');
      expect(html).toContain("data-themed");
      expect(server).toContain('require("express")');
      expect(server).toContain("app.get(");
      expect(/FALLBACK|localStorage/.test(js)).toBe(true);

      const page = html
        .replace('<link rel="stylesheet" href="styles.css">', `<style>${css}</style>`)
        .replace('<script src="script.js"></script>', `<script>${js}</script>`);
      const dom = new JSDOM(page, {
        runScripts: "dangerously",
        url: "https://preview.local/",
        beforeParse(window) {
          window.fetch = () => Promise.reject(new Error("offline"));
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 30));
      const doc = dom.window.document;
      expect(doc.body.getAttribute("data-themed")).toBe("");
      expect(doc.getElementById("year")?.textContent).toMatch(/^\d{4}$/);

      if (template.id === "portfolio") expect(doc.querySelectorAll("#projects .card").length).toBeGreaterThan(0);
      if (template.id === "blog") expect(doc.querySelectorAll("#posts .card").length).toBeGreaterThan(0);
      if (template.id === "store") expect(doc.querySelectorAll("#products .card").length).toBeGreaterThan(0);
      if (template.id === "dashboard") {
        expect(doc.querySelectorAll("#stats .card").length).toBeGreaterThan(0);
        expect(doc.querySelectorAll("#activity-rows tr").length).toBeGreaterThan(0);
      }
      if (template.id === "landing") expect(doc.querySelectorAll("#work .card").length).toBe(3);
      dom.window.close();
    },
  );
});
