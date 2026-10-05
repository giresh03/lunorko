import { describe, expect, it } from "vitest";
import {
  describeGeneratedWebsite,
  generateFullStackWebsite,
  mergeGeneratedFiles,
  parseWebsiteRequest,
  type ProjectFileNode,
} from "./websiteGenerator";

const kinds = ["portfolio", "restaurant", "saas", "shop", "blog"] as const;

describe("generateFullStackWebsite", () => {
  it.each(kinds)("writes a previewable client and a Node API for %s", (kind) => {
    const site = generateFullStackWebsite({ kind, name: `<${kind}> & Co` });
    const byPath = Object.fromEntries(site.files.map((file) => [file.path, file.content]));

    expect(byPath["client/index.html"]).toContain("<!DOCTYPE html>");
    expect(byPath["client/index.html"]).toContain('href="styles.css"');
    expect(byPath["client/index.html"]).toContain('src="script.js"');
    expect(byPath["client/index.html"]).toContain("&lt;");
    expect(byPath["client/index.html"]).not.toContain("<script>");
    expect(byPath["client/styles.css"]).toContain("--accent");
    expect(byPath["client/script.js"]).toContain(`/api/" + SITE.resource`);
    expect(byPath["client/script.js"]).not.toContain("react");
    expect(byPath["server/index.js"]).toContain('"/api/health"');
    expect(byPath["server/index.js"]).toContain('"/api/contact"');
    expect(byPath["server/index.js"]).toContain("clientDir + path.sep");
    expect(byPath["server/store.js"]).toContain(`const resource = ${JSON.stringify(site.resource)}`);
    expect(JSON.parse(byPath["package.json"]).scripts.start).toBe("node server/index.js");
    expect(describeGeneratedWebsite(site)).toContain(site.name);
    expect(describeGeneratedWebsite(site)).toContain(`/api/${site.resource}`);
  });
});

describe("parseWebsiteRequest", () => {
  it("detects a named restaurant site", () => {
    expect(parseWebsiteRequest('Build a restaurant website called "Olive & Oak"')).toEqual({
      mode: "generate",
      kind: "restaurant",
      name: "Olive & Oak",
    });
  });

  it("asks for a type when the request is only 'make a website'", () => {
    expect(parseWebsiteRequest("Please generate a full-stack website")).toEqual({
      mode: "choose",
      kind: "portfolio",
    });
  });

  it("ignores questions that are not a build request", () => {
    expect(parseWebsiteRequest("How does a restaurant website API work?")).toBeNull();
  });
});

describe("mergeGeneratedFiles", () => {
  it("creates nested folders and replaces an existing file", () => {
    const tree: ProjectFileNode[] = [
      {
        id: "client",
        name: "client",
        type: "folder",
        children: [{ id: "old", name: "index.html", type: "file", content: "old" }],
      },
    ];
    const next = mergeGeneratedFiles(tree, [
      { path: "client/index.html", language: "html", content: "new" },
      { path: "server/index.js", language: "javascript", content: "server" },
    ]);
    const client = next.find((node) => node.name === "client");
    const server = next.find((node) => node.name === "server");
    expect(client?.children?.find((node) => node.name === "index.html")?.content).toBe("new");
    expect(server?.children?.[0]?.content).toBe("server");
    expect(tree[0].children?.[0].content).toBe("old");
  });
});
