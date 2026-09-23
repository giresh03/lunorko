import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import {
  WEBSITE_BLUEPRINTS,
  applyProjectFiles,
  generateWebsiteProject,
  normalizeSiteName,
  type ProjectFile,
  type ProjectNode,
  type WebsiteKind,
} from "@/lib/websiteGenerator";

const REQUIRED = [
  "client/index.html",
  "client/styles.css",
  "client/site.js",
  "server/package.json",
  "server/index.mjs",
  "server/src/app.mjs",
  "server/src/config/db.mjs",
  "server/src/data/seed.mjs",
  "server/src/routes/api.mjs",
  "README.md",
];

describe("website generator", () => {
  it("normalizes blank names", () => {
    expect(normalizeSiteName("   ")).toBe("My Website");
    expect(normalizeSiteName("  Ada   Studio  ")).toBe("Ada Studio");
  });

  it.each(WEBSITE_BLUEPRINTS.map((blueprint) => blueprint.id))("builds a %s full-stack project", (kind) => {
    const files = generateWebsiteProject(kind, "Lunor Studio");
    const byPath = Object.fromEntries(files.map((file) => [file.path, file.content]));
    for (const path of REQUIRED) expect(byPath[path], path).toBeTruthy();

    expect(byPath["client/index.html"]).toContain("Lunor Studio");
    expect(byPath["client/index.html"]).toContain(`data-site-kind="${kind}"`);
    expect(byPath["client/index.html"]).toContain('href="styles.css"');
    expect(byPath["client/index.html"]).toContain('src="site.js"');
    expect(byPath["client/index.html"]).not.toMatch(/from ["']react["']/);
    expect(byPath["server/src/routes/api.mjs"]).toMatch(/router\.(get|post)\(/);
    expect(byPath["server/src/app.mjs"]).toContain('app.use("/api", api)');
    expect(byPath["server/index.mjs"]).toContain("app.listen");
    expect(byPath["README.md"]).toContain("npm start");
  });

  it("nests files into the editor tree and updates an existing path", () => {
    const files = generateWebsiteProject("store", "Field & Co");
    const tree = applyProjectFiles<ProjectNode>([
      { id: "src", name: "src", type: "folder", children: [] },
    ], files);
    const client = tree.find((node) => node.id === "client");
    const html = client?.children?.find((node) => node.id === "client/index.html");
    expect(html?.content).toContain("Field &amp; Co");
    expect(html?.content).toContain("add-to-cart");

    const updated = applyProjectFiles(tree, [
      { path: "client/index.html", language: "html", content: "<p>replaced</p>" },
    ]);
    const nextHtml = updated.find((node) => node.id === "client")?.children?.find((node) => node.name === "index.html");
    expect(nextHtml?.content).toBe("<p>replaced</p>");
    expect(tree.find((node) => node.id === "src")).toBeTruthy();
  });
});

function previewDom(kind: WebsiteKind, name = "Lunor Studio") {
  const files = generateWebsiteProject(kind, name);
  const html = inlinePreview(files);
  return new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/" });
}

function inlinePreview(files: ProjectFile[]) {
  const html = files.find((file) => file.path === "client/index.html")?.content ?? "";
  const css = files.find((file) => file.path === "client/styles.css")?.content ?? "";
  const js = files.find((file) => file.path === "client/site.js")?.content ?? "";
  return html
    .replace(/<link[^>]+href="styles\.css"[^>]*>/, `<style>${css}</style>`)
    .replace(/<script src="site\.js"><\/script>/, `<script>${js}</script>`);
}

describe("generated website behavior", () => {
  it("keeps a lead in the page when the API is offline", async () => {
    const dom = previewDom("landing");
    const document = dom.window.document;
    const form = document.querySelector<HTMLFormElement>("#lead-form");
    expect(form).toBeTruthy();
    (document.querySelector("[name=name]") as HTMLInputElement).value = "Ada";
    (document.querySelector("[name=email]") as HTMLInputElement).value = "ada@example.com";
    form?.requestSubmit();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(document.querySelector("#form-status")?.textContent).toMatch(/Saved locally/i);
  });

  it("updates the cart from the store page", async () => {
    const dom = previewDom("store");
    const document = dom.window.document;
    document.querySelector<HTMLButtonElement>(".add-to-cart")?.click();
    document.querySelector<HTMLButtonElement>(".add-to-cart")?.click();
    expect(document.querySelector("#cart-count")?.textContent).toBe("2");
    expect(document.querySelector("#cart-total")?.textContent).toBe("48.00");
    document.querySelector<HTMLButtonElement>("#checkout")?.click();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(document.querySelector("#form-status")?.textContent).toMatch(/Order kept in the browser/i);
  });

  it("opens a blog story in the reader", () => {
    const dom = previewDom("blog");
    const document = dom.window.document;
    const reader = document.querySelector<HTMLElement>("#reader");
    expect(reader?.hidden).toBe(true);
    document.querySelector<HTMLButtonElement>(".read-post")?.click();
    expect(reader?.hidden).toBe(false);
    expect(document.querySelector("#reader-title")?.textContent).toBe("Shipping the first API");
  });
});
