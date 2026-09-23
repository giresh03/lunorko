import { describe, expect, it } from "vitest";
import { extractCodeBlocks } from "./extractCodeBlocks";
import {
  filesToFileTree,
  generateFullStackWebsite,
  isBrowserPreviewScript,
  parseWebsiteRequest,
  previewFileMap,
  upsertProjectFiles,
  WEBSITE_KINDS,
} from "./websiteGenerator";

describe("full-stack website generator", () => {
  it("builds a previewable client and an Express API for every site type", () => {
    for (const kind of WEBSITE_KINDS) {
      const site = generateFullStackWebsite({ kind: kind.id, name: "Test & Co <Studio>" });
      const paths = site.files.map((f) => f.path);
      expect(paths).toEqual(expect.arrayContaining([
        "client/index.html",
        "client/styles.css",
        "client/script.js",
        "server/index.js",
        "server/src/app.js",
        "server/src/config/db.js",
        "server/src/modules/site/site.routes.js",
        "server/src/modules/site/site.controller.js",
        "server/src/modules/site/site.service.js",
        "server/package.json",
        "package.json",
        ".env.example",
        "README.md",
      ]));

      const html = site.files.find((f) => f.path === "client/index.html")!.content;
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="script.js"');
      expect(html).toContain("Test &amp; Co &lt;Studio&gt;");
      expect(html).not.toContain("<Studio>");

      const script = site.files.find((f) => f.path === "client/script.js")!.content;
      const routes = site.files.find((f) => f.path === "server/src/modules/site/site.routes.js")!.content;
      const listMatch = script.match(/"listUrl": "(\/api\/[^"]+)"/);
      const formMatch = script.match(/"formUrl": "(\/api\/[^"]+)"/);
      expect(listMatch).toBeTruthy();
      expect(formMatch).toBeTruthy();
      expect(routes).toContain(`get("${listMatch![1].replace("/api", "")}"`);
      expect(routes).toContain(`post("${formMatch![1].replace("/api", "")}"`);
      expect(isBrowserPreviewScript("client/script.js", script)).toBe(true);
      expect(isBrowserPreviewScript("server/index.js", site.files.find((f) => f.path === "server/index.js")!.content)).toBe(false);
    }
  });

  it("nests files and lets the client script win preview basename clashes", () => {
    const site = generateFullStackWebsite({ kind: "store", name: "Field & Co" });
    const tree = filesToFileTree(site.files);
    const client = tree.find((n) => n.name === "client");
    expect(client?.type).toBe("folder");
    expect(client?.children?.some((n) => n.name === "index.html" && n.id === "client/index.html")).toBe(true);
    const server = tree.find((n) => n.name === "server");
    const src = server?.children?.find((n) => n.name === "src");
    expect(src?.children?.some((n) => n.id === "server/src/app.js")).toBe(true);

    const updated = upsertProjectFiles(tree, [{ path: "client/styles.css", language: "css", content: "body{color:red}" }]);
    const css = updated.find((n) => n.name === "client")?.children?.find((n) => n.name === "styles.css");
    expect(css?.content).toBe("body{color:red}");

    const map = previewFileMap([
      { path: "server/script.js", language: "javascript", content: "process.env.PORT" },
      { path: "client/script.js", language: "javascript", content: "console.log('client')" },
    ]);
    expect(map["script.js"]).toContain("client");
  });
});

describe("parseWebsiteRequest", () => {
  it("maps full-stack website prompts onto a blueprint and leaves other questions alone", () => {
    expect(parseWebsiteRequest('Generate a restaurant website named "Evening Room"')).toEqual({
      kind: "restaurant",
      name: "Evening Room",
    });
    expect(parseWebsiteRequest("Build a SaaS landing page")?.kind).toBe("saas");
    expect(parseWebsiteRequest("Create a blog")).toEqual({ kind: "blog", name: undefined });
    expect(parseWebsiteRequest("Scaffold a dashboard for metrics")?.kind).toBe("dashboard");
    expect(parseWebsiteRequest("Explain how flexbox works")).toBeNull();
    expect(parseWebsiteRequest("Fix this bug in my function")).toBeNull();
  });
});

describe("extractCodeBlocks", () => {
  it("keeps nested full-stack paths that sit above a fence", () => {
    const markdown = `server/src/app.js
\`\`\`javascript
export default function app() {}
\`\`\`
client/index.html
\`\`\`html
<h1>Hi</h1>
\`\`\``;
    const blocks = extractCodeBlocks(markdown);
    expect(blocks.map((b) => b.filename)).toEqual(["server/src/app.js", "client/index.html"]);
  });
});
