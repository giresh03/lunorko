import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import {
  WEBSITE_AUTOMATIONS,
  WEBSITE_FILE_NAMES,
  WEBSITE_GENERATOR_TAG,
  applyWebsiteToTree,
  buildStandalonePreview,
  buildWebsiteGeneratorPrompt,
  extractClientApiPaths,
  extractServerApiPaths,
  isBackendScript,
  type ProjectFileNode,
} from "@/lib/websiteGenerator";

const starterTree: ProjectFileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    isOpen: true,
    children: [
      { id: "src/app.js", name: "app.js", type: "file", language: "javascript", content: "console.log('starter');" },
      { id: "src/style.css", name: "style.css", type: "file", language: "css", content: "body{}" },
      { id: "src/index.html", name: "index.html", type: "file", language: "html", content: "<p>starter</p>" },
    ],
  },
];

describe("website generator automations", () => {
  it("offers four full-stack sites", () => {
    expect(WEBSITE_AUTOMATIONS.map((site) => site.id)).toEqual([
      "saas-landing",
      "portfolio",
      "storefront",
      "task-board",
    ]);
  });

  it("gives every site the same runnable file set", () => {
    for (const site of WEBSITE_AUTOMATIONS) {
      expect(site.files.map((file) => file.name)).toEqual([...WEBSITE_FILE_NAMES]);
      const html = site.files.find((file) => file.name === "index.html")!.content;
      expect(html).toContain('data-themed');
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="script.js"');
      expect(html).not.toContain('src="server.js"');
      expect(html).not.toMatch(/\breact\b/i);

      const client = site.files.find((file) => file.name === "script.js")!.content;
      expect(client).not.toMatch(/\brequire\s*\(/);
      expect(client).not.toMatch(/\bimport\s+/);

      const server = site.files.find((file) => file.name === "server.js")!.content;
      expect(server).toContain('require("express")');
      expect(server).toContain("express.static");

      const pkg = JSON.parse(site.files.find((file) => file.name === "package.json")!.content);
      expect(pkg.dependencies.express).toBeTruthy();
      expect(pkg.dependencies.cors).toBeTruthy();
      expect(pkg.scripts.start).toBe("node server.js");

      const clientPaths = extractClientApiPaths(client);
      const serverPaths = extractServerApiPaths(server);
      expect(clientPaths.length).toBeGreaterThan(0);
      for (const path of clientPaths) {
        expect(serverPaths).toContain(path);
      }
    }
  });

  it("builds an AI prompt the code engine can recognize", () => {
    const prompt = buildWebsiteGeneratorPrompt("a bakery in Lisbon");
    expect(prompt.startsWith(WEBSITE_GENERATOR_TAG)).toBe(true);
    expect(prompt).toContain("a bakery in Lisbon");
    for (const name of WEBSITE_FILE_NAMES) expect(prompt).toContain(name);
  });

  it("keeps the Express server out of the browser preview", () => {
    const site = WEBSITE_AUTOMATIONS[0];
    const preview = buildStandalonePreview(site);
    expect(preview).toContain("<style>");
    expect(preview).toContain("<script>");
    expect(preview).not.toContain('require("express")');
    expect(isBackendScript("server.js", site.files.find((file) => file.name === "server.js")!.content)).toBe(true);
    expect(isBackendScript("script.js", site.files.find((file) => file.name === "script.js")!.content)).toBe(false);
  });

  it("replaces the starter page with the generated site", () => {
    const next = applyWebsiteToTree(starterTree, WEBSITE_AUTOMATIONS[2]);
    const src = next.find((node) => node.id === "src");
    const names = src?.children?.map((file) => file.name) ?? [];
    expect(names).not.toContain("app.js");
    expect(names).not.toContain("style.css");
    expect(names).toEqual(expect.arrayContaining([...WEBSITE_FILE_NAMES]));
    const html = src?.children?.find((file) => file.name === "index.html")?.content ?? "";
    expect(html).toContain("Harbor Market");
    expect(starterTree[0].children?.some((file) => file.name === "app.js")).toBe(true);
  });

  it("renders each site when the API is offline", async () => {
    for (const site of WEBSITE_AUTOMATIONS) {
      const dom = new JSDOM(buildStandalonePreview(site), {
        url: "https://preview.local/",
        runScripts: "dangerously",
        beforeParse(window) {
          window.fetch = () => Promise.reject(new Error("offline"));
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
      const text = dom.window.document.body.textContent || "";
      expect(text.length).toBeGreaterThan(40);
      expect(dom.window.document.querySelector("script")?.textContent || "").not.toContain('require("express")');
      if (site.id === "saas-landing") {
        expect(dom.window.document.querySelectorAll("#plans article").length).toBe(3);
        const yearly = dom.window.document.getElementById("bill-yearly") as HTMLButtonElement;
        yearly.click();
        expect(dom.window.document.getElementById("plans")?.textContent).toContain("$15");
      }
      if (site.id === "portfolio") {
        expect(dom.window.document.querySelectorAll("#projects article").length).toBe(6);
        const brand = dom.window.document.querySelector('#filters button[data-filter="brand"]') as HTMLButtonElement;
        brand.click();
        expect(dom.window.document.querySelectorAll("#projects article").length).toBe(2);
      }
      if (site.id === "storefront") {
        expect(dom.window.document.querySelectorAll("#products article").length).toBe(6);
        const add = dom.window.document.querySelector("[data-add]") as HTMLButtonElement;
        add.click();
        expect(dom.window.document.getElementById("cart-count")?.textContent).toBe("1");
      }
      if (site.id === "task-board") {
        expect(dom.window.document.querySelectorAll("#tasks li").length).toBe(3);
        const form = dom.window.document.getElementById("task-form") as HTMLFormElement;
        const input = form.querySelector("input") as HTMLInputElement;
        input.value = "Publish the homepage";
        form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
        expect(dom.window.document.querySelectorAll("#tasks li").length).toBe(4);
      }
      dom.window.close();
    }
  });
});
