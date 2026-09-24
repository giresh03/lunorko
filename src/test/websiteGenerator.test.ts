import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { generateWebsite, matchWebsiteRequest, type WebsiteKind } from "@/lib/websiteGenerator";

function mountSite(kind: WebsiteKind, brief: string) {
  const site = generateWebsite({ brief, kind });
  const html = site.files.find((file) => file.path === "client/index.html")!.content;
  const script = site.files.find((file) => file.path === "client/app.js")!.content;
  const dom = new JSDOM(html, { url: "http://localhost:3000/", runScripts: "outside-only" });
  dom.window.eval(script);
  return dom;
}

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 30));
}

function assertSyntax(filename: string, content: string) {
  const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
  const file = join(dir, filename);
  writeFileSync(file, content);
  execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
}

const kinds: WebsiteKind[] = ["landing", "portfolio", "blog", "shop", "dashboard"];

describe("generateWebsite", () => {
  it("builds a landing site with a client, API, and seed", () => {
    const site = generateWebsite({ brief: "Build a website for Northwind Studio", kind: "landing" });
    expect(site.title).toBe("Northwind Studio");
    expect(site.files.map((file) => file.path).sort()).toEqual([
      ".gitignore",
      "README.md",
      "client/app.js",
      "client/index.html",
      "client/styles.css",
      "data/seed.json",
      "package.json",
      "server/server.js",
    ]);

    const html = site.files.find((file) => file.path === "client/index.html")!.content;
    expect(html).toContain("styles.css");
    expect(html).toContain("app.js");
    expect(html).toContain("data-themed");
    expect(html).toContain("Northwind Studio");

    const client = site.files.find((file) => file.path === "client/app.js")!.content;
    expect(client).not.toContain("require(");
    expect(client).toContain("/api/leads");
    expect(client).toContain("/api/content");

    const server = site.files.find((file) => file.path === "server/server.js")!.content;
    expect(server).toContain("express");
    expect(server).toContain("/api/leads");
    expect(server).toContain("data/seed.json");

    const seed = JSON.parse(site.files.find((file) => file.path === "data/seed.json")!.content);
    expect(seed.kind).toBe("landing");
    expect(seed.title).toBe("Northwind Studio");

    const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);
    expect(pkg.type).toBe("module");
    expect(pkg.scripts.start).toBe("node server/server.js");
    expect(pkg.dependencies.express).toBeTruthy();
  });

  it.each(kinds)("keeps %s client routes aligned with the server", (kind) => {
    const site = generateWebsite({ brief: `Build a ${kind} website for Atlas`, kind });
    const client = site.files.find((file) => file.path === "client/app.js")!.content;
    const server = site.files.find((file) => file.path === "server/server.js")!.content;
    const html = site.files.find((file) => file.path === "client/index.html")!.content;
    expect(server).toContain("/api/health");
    expect(client).toContain("/api/health");
    expect(html).toContain(`data-kind="${kind}"`);
    if (kind === "blog") expect(server).toContain("/api/posts/:id");
    if (kind === "shop") expect(server).toContain("/api/orders");
    if (kind === "dashboard") expect(server).toContain("/api/metrics");
    assertSyntax("app.js", client);
    assertSyntax("server.js", server);
  });

  it("escapes HTML in an explicit title", () => {
    const site = generateWebsite({
      brief: "Build a website",
      title: "<script>alert(1)</script>",
    });
    const html = site.files.find((file) => file.path === "client/index.html")!.content;
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});

describe("generated client behavior", () => {
  it("saves a landing lead from the form when the API is offline", async () => {
    const dom = mountSite("landing", "Build a landing website for Northwind Studio");
    const document = dom.window.document;
    expect(document.querySelector("h1")?.textContent).toBe("Northwind Studio");
    const form = document.querySelector("[data-lead-form]") as HTMLFormElement;
    (form.querySelector("[name=name]") as HTMLInputElement).value = "Ada";
    (form.querySelector("[name=email]") as HTMLInputElement).value = "ada@example.com";
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    expect(form.querySelector("[data-status]")?.textContent).toBe("Saved.");
  });

  it("filters portfolio projects and sends a message", async () => {
    const dom = mountSite("portfolio", "Create a portfolio website for Ada");
    const document = dom.window.document;
    document.querySelector<HTMLButtonElement>("[data-filter='brand']")!.click();
    const cards = [...document.querySelectorAll<HTMLElement>("[data-project]")];
    expect(cards.find((card) => card.dataset.project === "product")?.hidden).toBe(true);
    expect(cards.find((card) => card.dataset.project === "brand")?.hidden).toBe(false);
    const form = document.querySelector("[data-message-form]") as HTMLFormElement;
    (form.querySelector("[name=email]") as HTMLInputElement).value = "ada@example.com";
    (form.querySelector("[name=message]") as HTMLTextAreaElement).value = "Hello";
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    expect(form.querySelector("[data-status]")?.textContent).toBe("Saved.");
  });

  it("opens a blog post from the seed", async () => {
    const dom = mountSite("blog", "Generate a blog website about field notes");
    const document = dom.window.document;
    document.querySelector<HTMLButtonElement>("[data-open-post]")!.click();
    await flush();
    const reader = document.querySelector<HTMLElement>("[data-reader]")!;
    expect(reader.hidden).toBe(false);
    expect(reader.querySelector("[data-reader-title]")?.textContent).toBe("Ship the page before the platform");
  });

  it("adds a shop item and refuses an empty checkout", async () => {
    const dom = mountSite("shop", "Make a shop website for ceramics");
    const document = dom.window.document;
    const form = document.querySelector("[data-order-form]") as HTMLFormElement;
    (form.querySelector("[name=email]") as HTMLInputElement).value = "ada@example.com";
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    expect(form.querySelector("[data-status]")?.textContent).toMatch(/item/i);
    document.querySelector<HTMLButtonElement>("[data-add='mug']")!.click();
    expect(document.querySelector("[data-cart-count]")?.textContent).toBe("1");
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    expect(form.querySelector("[data-status]")?.textContent).toBe("Saved.");
  });

  it("refreshes dashboard metrics from the fallback API", async () => {
    const dom = mountSite("dashboard", "Build a dashboard website");
    const document = dom.window.document;
    expect(document.querySelectorAll("[data-metric]").length).toBe(4);
    document.querySelector<HTMLButtonElement>("[data-refresh]")!.click();
    await flush();
    expect(document.querySelector("[data-metric='Visitors'] [data-value]")?.textContent).toBe("12,480");
  });
});

describe("matchWebsiteRequest", () => {
  it("detects website build requests and their kind", () => {
    expect(matchWebsiteRequest("please build a portfolio website for Ada")).toMatchObject({ kind: "portfolio" });
    expect(matchWebsiteRequest("create a shop for ceramics")).toMatchObject({ kind: "shop" });
    expect(matchWebsiteRequest("generate a dashboard website")).toMatchObject({ kind: "dashboard" });
    expect(matchWebsiteRequest("make a blog about field notes")).toMatchObject({ kind: "blog" });
  });

  it("ignores ordinary coding questions", () => {
    expect(matchWebsiteRequest("explain flexbox")).toBeNull();
    expect(matchWebsiteRequest("fix this bug")).toBeNull();
  });
});
