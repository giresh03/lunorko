import { afterEach, describe, expect, it } from "vitest";
import {
  generateWebsite,
  isWebsiteGenerationRequest,
  matchWebsiteBlueprint,
  websiteToFileTree,
} from "./websiteGenerator";

function file(path: string, brief = "Build a full-stack portfolio website", blueprintId?: string) {
  const site = generateWebsite({ brief, blueprintId });
  const match = site.files.find((item) => item.path === path);
  if (!match) throw new Error(`Missing ${path}`);
  return match.content;
}

describe("website generation request detection", () => {
  it("accepts requests to build a website", () => {
    expect(isWebsiteGenerationRequest("Build a full-stack portfolio website")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a restaurant website called Olive & Rye")).toBe(true);
    expect(isWebsiteGenerationRequest("design a landing page")).toBe(true);
  });

  it("leaves ordinary coding questions alone", () => {
    expect(isWebsiteGenerationRequest("build a counter")).toBe(false);
    expect(isWebsiteGenerationRequest("fix my website layout")).toBe(false);
    expect(isWebsiteGenerationRequest("explain this API")).toBe(false);
  });

  it("picks a blueprint from the description", () => {
    expect(matchWebsiteBlueprint("Create a restaurant website called Olive & Rye")).toBe("restaurant");
    expect(matchWebsiteBlueprint("Build an online store website")).toBe("store");
    expect(matchWebsiteBlueprint("Make a blog website with a posts API")).toBe("blog");
    expect(matchWebsiteBlueprint("Build a full-stack portfolio website")).toBe("portfolio");
    expect(matchWebsiteBlueprint("Generate a full-stack landing page")).toBe("landing");
  });
});

describe("generateWebsite", () => {
  const originalFetch = window.fetch;

  afterEach(() => {
    window.fetch = originalFetch;
    delete (window as unknown as { __LUNOR_PREVIEW__?: boolean }).__LUNOR_PREVIEW__;
  });

  it("writes a client, an Express API, and the preview shim", () => {
    const site = generateWebsite({
      brief: "Create a restaurant website called Olive & Rye",
      blueprintId: "restaurant",
    });
    const paths = site.files.map((item) => item.path);
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "client/api-shim.js",
      "server/data.js",
      "server/server.js",
      "package.json",
      "README.md",
      ".gitignore",
    ]);
    expect(site.title).toBe("Olive & Rye");
    expect(file("client/index.html", site.title && "Create a restaurant website called Olive & Rye", "restaurant")).toContain("Olive &amp; Rye");
    expect(file("server/server.js", "Create a restaurant website called Olive & Rye", "restaurant")).toContain('app.get("/api/menu"');
    expect(file("server/server.js", "Create a restaurant website called Olive & Rye", "restaurant")).toContain('app.post("/api/reservations"');
    expect(file("server/data.js", "Create a restaurant website called Olive & Rye", "restaurant")).toContain("Citrus fennel salad");
    expect(file("client/api-shim.js", "Create a restaurant website called Olive & Rye", "restaurant")).toContain("Citrus fennel salad");
    const pkg = JSON.parse(file("package.json", "Create a restaurant website called Olive & Rye", "restaurant"));
    expect(pkg.type).toBe("module");
    expect(pkg.scripts.start).toBe("node server/server.js");
    expect(pkg.dependencies.express).toBeTruthy();
  });

  it("nests files into client and server folders", () => {
    const site = generateWebsite({ brief: "Build an online store website", blueprintId: "store" });
    const tree = websiteToFileTree(site.files);
    expect(tree.find((node) => node.name === "client")?.type).toBe("folder");
    expect(tree.find((node) => node.name === "server")?.type).toBe("folder");
    const client = tree.find((node) => node.name === "client");
    expect(client?.children?.some((node) => node.name === "index.html")).toBe(true);
  });

  it("answers the same API routes in the preview shim", async () => {
    const site = generateWebsite({ brief: "Build an online store website", blueprintId: "store" });
    (window as unknown as { __LUNOR_PREVIEW__?: boolean }).__LUNOR_PREVIEW__ = true;
    window.eval(site.files.find((item) => item.path === "client/api-shim.js")!.content);

    const listed = await (await window.fetch("/api/products")).json();
    expect(listed).toHaveLength(3);
    expect(listed[0].title).toBe("Canvas tote");

    const created = await (await window.fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Linen apron", detail: "Washed flax.", meta: "$54" }),
    })).json();
    expect(created.id).toBe(4);

    const rejected = await window.fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "  " }),
    });
    expect(rejected.status).toBe(400);

    const removed = await window.fetch("/api/products/4", { method: "DELETE" });
    expect(removed.status).toBe(204);
    const after = await (await window.fetch("/api/products")).json();
    expect(after.map((item: { title: string }) => item.title)).not.toContain("Linen apron");
  });

  it("renders menu items and saves a reservation", async () => {
    const site = generateWebsite({
      brief: "Create a restaurant website called Olive & Rye",
      blueprintId: "restaurant",
    });
    const html = site.files.find((item) => item.path === "client/index.html")!.content;
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || "";
    document.body.innerHTML = body.replace(/<script[\s\S]*$/i, "");
    (window as unknown as { __LUNOR_PREVIEW__?: boolean }).__LUNOR_PREVIEW__ = true;
    window.eval(site.files.find((item) => item.path === "client/api-shim.js")!.content);
    window.eval(site.files.find((item) => item.path === "client/app.js")!.content);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const cards = document.querySelectorAll("#catalog-list article");
    expect(cards).toHaveLength(3);
    expect(cards[0].textContent).toContain("Citrus fennel salad");

    const form = document.getElementById("composer-form") as HTMLFormElement;
    (form.elements.namedItem("title") as HTMLInputElement).value = "Sam";
    (form.elements.namedItem("meta") as HTMLInputElement).value = "8:00 PM";
    (form.elements.namedItem("detail") as HTMLInputElement).value = "Party of 2";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.getElementById("intake-list")?.textContent).toContain("Sam");
    expect(document.getElementById("status")?.textContent).toBe("Saved.");
    document.body.innerHTML = "";
  });

  it("escapes a title that tries to break out of the page", () => {
    const brief = 'Build a website called "</script><img src=x onerror=alert(1)>"';
    const html = file("client/index.html", brief, "landing");
    const app = file("client/app.js", brief, "landing");
    expect(html).not.toContain("</script><img");
    expect(html).toContain("&lt;/script&gt;");
    expect(app).not.toContain("</script>");
  });
});
