import { describe, expect, it } from "vitest";
import {
  WEBSITE_FILE_PATHS,
  detectWebsiteRequest,
  generateFullStackWebsite,
  summarizeWebsite,
} from "./websiteGenerator";

describe("website generator", () => {
  it("writes the frontend and the Express API", () => {
    const files = generateFullStackWebsite({ name: "Olive & Oak", kind: "restaurant" });
    expect(files.map((file) => file.path)).toEqual([...WEBSITE_FILE_PATHS]);

    const html = files.find((file) => file.path === "src/index.html")!.content;
    const client = files.find((file) => file.path === "src/script.js")!.content;
    const routes = files.find((file) => file.path === "server/src/routes/api.js")!.content;
    const store = files.find((file) => file.path === "server/src/data/store.js")!.content;
    const pkg = files.find((file) => file.path === "server/package.json")!.content;

    expect(html).toContain("Olive &amp; Oak");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="script.js"');
    expect(html).toContain("Reserve a table");
    expect(client).toContain("/api/messages");
    expect(client).toContain("localStorage");
    expect(routes).toContain('router.post("/messages"');
    expect(routes).toContain('router.get("/health"');
    expect(store).toContain("Hearth bread");
    expect(pkg).toContain('"type": "module"');
    expect(pkg).toContain('"express"');
  });

  it("changes the page with the site kind", () => {
    const store = generateFullStackWebsite({ name: "Harbor Goods", kind: "store" });
    const blog = generateFullStackWebsite({ name: "Field Notes", kind: "blog" });
    const storeHtml = store.find((file) => file.path === "src/index.html")!.content;
    const blogHtml = blog.find((file) => file.path === "src/index.html")!.content;

    expect(storeHtml).toContain("Add to cart");
    expect(storeHtml).toContain("Harbor Goods");
    expect(blogHtml).not.toContain("Add to cart");
    expect(blogHtml).toContain("Get the next essay");
  });

  it("escapes a name that includes markup", () => {
    const files = generateFullStackWebsite({ name: "<script>alert(1)</script>", kind: "landing" });
    const html = files.find((file) => file.path === "src/index.html")!.content;
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("detects a full website request and ignores page edits", () => {
    expect(detectWebsiteRequest("Build a restaurant website called Olive & Oak")).toEqual({
      name: "Olive & Oak",
      kind: "restaurant",
      tagline: undefined,
    });
    expect(detectWebsiteRequest('Generate a store website for "Harbor Goods"')?.kind).toBe("store");
    expect(detectWebsiteRequest("make a landing page")?.name).toBe("Northstar");
    expect(detectWebsiteRequest("Build me a website")?.name).toBe("Northstar");
    expect(detectWebsiteRequest("create a button on the website")).toBeNull();
    expect(detectWebsiteRequest("create a form for the website")).toBeNull();
    expect(detectWebsiteRequest("explain how CSS grid works")).toBeNull();
    expect(detectWebsiteRequest("add an API endpoint")).toBeNull();
  });

  it("summarizes how to run the API", () => {
    const brief = { name: "Lumen", kind: "saas" as const };
    const files = generateFullStackWebsite(brief);
    const summary = summarizeWebsite(brief, files);
    expect(summary).toContain("cd server");
    expect(summary).toContain("npm start");
    expect(summary).toContain("src/index.html");
  });
});
