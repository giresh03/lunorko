import { describe, expect, it } from "vitest";
import {
  buildFullStackWebsite,
  detectSiteKind,
  extractLabeledCodeFiles,
  extractSiteName,
  isWebsiteGenerationRequest,
  upsertProjectFile,
} from "@/lib/websiteGenerator";

describe("website generator", () => {
  it("recognizes website requests and ignores small widget prompts", () => {
    expect(isWebsiteGenerationRequest("Build a full-stack portfolio website for Nova Studio")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a landing page for a bakery")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a counter with HTML, CSS, and JS")).toBe(false);
  });

  it("names the site from the prompt and picks a kind", () => {
    expect(detectSiteKind("restaurant website with a menu API")).toBe("restaurant");
    expect(extractSiteName("Create a full-stack restaurant website for Ember & Oak with a menu API", "restaurant")).toBe("Ember & Oak");
    expect(extractSiteName("Build a full-stack storefront website for a ceramics shop called Clay & Co", "shop")).toBe("Clay & Co");
  });

  it("writes a client and an Express API", () => {
    const site = buildFullStackWebsite("Generate a full-stack SaaS landing website for a product called Lumen");
    const paths = site.files.map((file) => file.path);
    expect(site.siteName).toBe("Lumen");
    expect(site.kind).toBe("saas");
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/script.js",
      "server/package.json",
      "server/index.js",
      "server/routes/api.js",
      "server/data/content.json",
      "README.md",
    ]);
    const html = site.files[0].content;
    const script = site.files[2].content;
    const api = site.files[5].content;
    expect(html).toContain("Lumen");
    expect(html).toContain('src="script.js"');
    expect(html).toContain("data-themed");
    expect(script).toContain("/api/content");
    expect(script).toContain("FALLBACK");
    expect(api).toContain('router.get("/content"');
    expect(api).toContain('router.post("/messages"');
    const content = JSON.parse(site.files[6].content);
    expect(content.items.length).toBeGreaterThan(0);
  });

  it("reads labeled code fences into project files", () => {
    const markdown = `client/index.html\n\`\`\`html\n<h1>Hi</h1>\n\`\`\`\n\nserver/index.js\n\`\`\`javascript\nconsole.log("ok")\n\`\`\``;
    const files = extractLabeledCodeFiles(markdown);
    expect(files.map((file) => file.path)).toEqual(["client/index.html", "server/index.js"]);
    expect(files[1].language).toBe("javascript");
  });

  it("nests files in the project tree and updates them in place", () => {
    const first = upsertProjectFile([], {
      path: "client/index.html",
      language: "html",
      content: "<h1>One</h1>",
    });
    const client = first.find((node) => node.id === "client");
    expect(client?.type).toBe("folder");
    expect(client?.children?.[0].content).toContain("One");

    const second = upsertProjectFile(first, {
      path: "server/routes/api.js",
      language: "javascript",
      content: "export default router;",
    });
    const routes = second.find((node) => node.id === "server")?.children?.find((node) => node.id === "server/routes");
    expect(routes?.children?.[0].id).toBe("server/routes/api.js");

    const updated = upsertProjectFile(second, {
      path: "client/index.html",
      language: "html",
      content: "<h1>Two</h1>",
    });
    expect(updated.find((node) => node.id === "client")?.children).toHaveLength(1);
    expect(updated.find((node) => node.id === "client")?.children?.[0].content).toContain("Two");
  });
});
