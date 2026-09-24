import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import {
  WEBSITE_TEMPLATES,
  filesToProjectTree,
  generateWebsite,
  inferWebsiteRequest,
  upsertProjectFiles,
  type WebsiteKind,
} from "@/lib/websiteGenerator";

const REQUIRED = [
  "client/index.html",
  "client/styles.css",
  "client/app.js",
  "server/server.mjs",
  "package.json",
  "README.md",
];

describe("website generator", () => {
  it("ships a full-stack file set for every template", () => {
    expect(WEBSITE_TEMPLATES.map((template) => template.id)).toEqual([
      "landing", "portfolio", "restaurant", "store", "blog", "dashboard",
    ]);
    for (const template of WEBSITE_TEMPLATES) {
      const site = generateWebsite({ kind: template.id, name: template.defaultName });
      const paths = site.files.map((file) => file.path);
      expect(paths).toEqual(REQUIRED);
      const html = site.files.find((file) => file.path === "client/index.html")!.content;
      const app = site.files.find((file) => file.path === "client/app.js")!.content;
      const server = site.files.find((file) => file.path === "server/server.mjs")!.content;
      const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="app.js"');
      expect(html).toContain("data-themed");
      expect(html).toContain(template.defaultName);
      expect(app).toContain("fetch(");
      expect(app).toContain("catch");
      expect(server).toContain('from "express"');
      expect(server).toContain("3000");
      expect(server).toContain("../client");
      expect(server).not.toMatch(/\brequire\s*\(/);
      expect(pkg.type).toBe("module");
      expect(pkg.scripts.start).toBe("node server/server.mjs");
    }
  });

  it("escapes the site name in HTML", () => {
    const site = generateWebsite({ kind: "landing", name: '<img alt="x">' });
    const html = site.files.find((file) => file.path === "client/index.html")!.content;
    expect(html).not.toContain("<img alt");
    expect(html).toContain("&lt;img alt");
  });

  it("infers website requests and ignores ordinary coding questions", () => {
    expect(inferWebsiteRequest("Build a portfolio website called Northline")).toEqual({
      kind: "portfolio",
      name: "Northline",
    });
    expect(inferWebsiteRequest("Create a restaurant site")?.kind).toBe("restaurant");
    expect(inferWebsiteRequest("Generate a full-stack website")?.kind).toBe("landing");
    expect(inferWebsiteRequest("Make a store for Atelier")?.kind).toBe("store");
    expect(inferWebsiteRequest("Design a blog website")?.kind).toBe("blog");
    expect(inferWebsiteRequest("Build an analytics dashboard")?.kind).toBe("dashboard");
    expect(inferWebsiteRequest("Explain how flexbox works")).toBeNull();
    expect(inferWebsiteRequest("debug this function")).toBeNull();
    expect(inferWebsiteRequest("Create a nav menu")).toBeNull();
    expect(inferWebsiteRequest("Build a counter with HTML")).toBeNull();
  });

  it("renders seed data in the browser when the API is down", async () => {
    const dom = await runClient("landing", "Lumen");
    expect(dom.window.document.querySelectorAll("#features article").length).toBe(3);
    const form = dom.window.document.querySelector("#waitlist") as HTMLFormElement;
    const email = dom.window.document.querySelector("input[name=email]") as HTMLInputElement;
    email.value = "ada@studio.com";
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(dom.window.document.querySelector("#status")?.textContent).toMatch(/Saved in this browser/);

    const shop = await runClient("store", "Atelier");
    expect(shop.window.document.querySelectorAll("#products article").length).toBe(3);
    shop.window.document.querySelector("#products button")?.dispatchEvent(new shop.window.Event("click", { bubbles: true }));
    expect(shop.window.document.querySelector("#cart")?.textContent).toBe("Cart · 1");

    const board = await runClient("dashboard", "Pulse");
    expect(board.window.document.querySelectorAll("#stats article").length).toBe(4);
    expect(board.window.document.querySelector("#activity")?.textContent).toMatch(/Waitlist signup/);
  });

  it("shows the website generator inside the web development assistant", async () => {
    const { createRoot } = await import("react-dom/client");
    const { act } = await import("react");
    const { default: CodeEditor } = await import("@/components/CodeEditor");
    const el = document.createElement("div");
    document.body.appendChild(el);
    Element.prototype.scrollIntoView = () => {};
    const root = createRoot(el);
    await act(async () => {
      root.render(<CodeEditor domainName="Web Development" />);
    });
    expect(el.textContent).toContain("Websites");
    expect(el.textContent).toContain("Landing");
    expect(el.textContent).toContain("Portfolio");
    expect(el.textContent).toContain("Generate");
    const button = Array.from(el.querySelectorAll("button")).find((node) => node.textContent === "Generate");
    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(el.textContent).toContain("client/index.html");
    expect(el.textContent).toContain("server/server.mjs");
    root.unmount();
  });

  it("builds a nested project tree and updates an existing file", () => {
    const site = generateWebsite({ kind: "blog", name: "Folio" });
    const tree = filesToProjectTree(site.files);
    const client = tree.find((node) => node.name === "client");
    const server = tree.find((node) => node.name === "server");
    expect(client?.type).toBe("folder");
    expect(client?.children?.map((node) => node.name).sort()).toEqual(["app.js", "index.html", "styles.css"]);
    expect(server?.children?.[0].name).toBe("server.mjs");
    const updated = upsertProjectFiles(tree, [{ path: "client/app.js", content: "console.log('next');" }]);
    const app = updated.find((node) => node.name === "client")!.children!.find((node) => node.name === "app.js");
    expect(app?.content).toBe("console.log('next');");
  });
});

async function runClient(kind: WebsiteKind, name: string) {
  const site = generateWebsite({ kind, name });
  const html = site.files.find((file) => file.path === "client/index.html")!.content;
  const js = site.files.find((file) => file.path === "client/app.js")!.content;
  const dom = new JSDOM(html, { url: "http://localhost:3000/", runScripts: "outside-only" });
  dom.window.fetch = async () => {
    throw new Error("offline");
  };
  dom.window.eval(js);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return dom;
}
