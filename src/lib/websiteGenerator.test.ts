import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractSiteName,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
  websiteToFileTree,
} from "./websiteGenerator";

describe("website generator", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("recognizes full-stack website prompts and ignores unrelated ones", () => {
    expect(isWebsiteGenerationRequest("Generate a full-stack portfolio website")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a restaurant website called Olive & Oak")).toBe(true);
    expect(isWebsiteGenerationRequest("website generator")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a SaaS landing page website")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a counter with HTML")).toBe(false);
    expect(isWebsiteGenerationRequest("Create a todo list in one HTML file")).toBe(false);
  });

  it("picks the restaurant blueprint and a custom name", () => {
    expect(extractSiteName("Build a restaurant website called Olive & Oak")).toBe("Olive & Oak");
    const site = generateFullStackWebsite("Build a restaurant website called Olive & Oak");
    expect(site.kind).toBe("restaurant");
    expect(site.title).toBe("Olive & Oak");
    const html = site.files.find((file) => file.path === "client/index.html")?.content || "";
    expect(html).toContain("Olive &amp; Oak");
    expect(html).toContain("styles.css");
    expect(html).toContain("app.js");
    expect(html).not.toContain("<script>alert");
  });

  it("writes a client, an Express API, and a runnable package", () => {
    const site = generateFullStackWebsite("Generate a full-stack portfolio website called Harbor Studio");
    const paths = site.files.map((file) => file.path).sort();
    expect(paths).toEqual([
      "README.md",
      "client/app.js",
      "client/index.html",
      "client/styles.css",
      "package.json",
      "server/data.js",
      "server/server.js",
    ]);

    const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);
    expect(pkg.scripts.start).toBe("node server/server.js");
    expect(pkg.dependencies.express).toBeTruthy();

    const server = site.files.find((file) => file.path === "server/server.js")!.content;
    expect(server).toContain('app.get("/api/items"');
    expect(server).toContain('app.post("/api/messages"');
    expect(server).toContain("express.static");

    const clientJs = site.files.find((file) => file.path === "client/app.js")!.content;
    expect(clientJs).not.toContain("require(");
    expect(clientJs).toContain("/api/messages");

    const data = site.files.find((file) => file.path === "server/data.js")!.content;
    expect(data).toContain("Harbor Studio");
    expect(data).toContain("module.exports");

    const tree = websiteToFileTree(site);
    expect(tree.some((node) => node.name === "client" && node.type === "folder")).toBe(true);
    expect(tree.some((node) => node.name === "server" && node.type === "folder")).toBe(true);
  });

  it("filters the menu and validates the contact form in the browser", () => {
    const site = generateFullStackWebsite("Build a restaurant website called Olive & Oak");
    const html = site.files.find((file) => file.path === "client/index.html")!.content;
    const js = site.files.find((file) => file.path === "client/app.js")!.content;
    const parsed = new DOMParser().parseFromString(html, "text/html");
    document.head.innerHTML = parsed.head.innerHTML;
    document.body.innerHTML = parsed.body.innerHTML;

    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    new Function(js)();

    const main = document.querySelector('button[data-filter="Main"]') as HTMLButtonElement;
    main.click();
    const cards = [...document.querySelectorAll("[data-catalog] .card")];
    expect(cards).toHaveLength(1);
    expect(cards[0].textContent).toContain("Hearth fish");

    const form = document.querySelector("[data-contact]") as HTMLFormElement;
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(document.querySelector("[data-form-status]")?.textContent).toContain("Add your name");
  });

  it("strips angle brackets from a custom name", () => {
    const site = generateFullStackWebsite('Build a website called "Hello <b>"');
    const html = site.files.find((file) => file.path === "client/index.html")!.content;
    expect(site.title).toBe("Hello B");
    expect(html).toContain("Hello B");
    expect(html).not.toContain("<b>");
  });
});
