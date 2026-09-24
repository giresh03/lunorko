import { describe, expect, it } from "vitest";
import {
  detectWebsiteRequest,
  filesToTree,
  formatWebsiteAssistantMessage,
  generateFullStackWebsite,
  WEBSITE_BLUEPRINTS,
  type WebsiteKind,
} from "@/lib/websiteGenerator";

const REQUIRED = [
  "README.md",
  "server/index.js",
  "server/src/store.js",
  "server/src/routes.js",
  "client/src/App.jsx",
  "client/src/api.js",
  "preview.html",
];

describe("website generator", () => {
  it.each(WEBSITE_BLUEPRINTS.map((blueprint) => blueprint.id))("builds a %s site with client and API code", (kind: WebsiteKind) => {
    const site = generateFullStackWebsite(kind, "Atlas & Co");
    const paths = site.files.map((file) => file.path);
    for (const path of REQUIRED) {
      expect(paths).toContain(path);
    }
    const preview = site.files.find((file) => file.path === "preview.html")!;
    const server = site.files.find((file) => file.path === "server/index.js")!;
    const routes = site.files.find((file) => file.path === "server/src/routes.js")!;
    const app = site.files.find((file) => file.path === "client/src/App.jsx")!;
    expect(preview.content.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(preview.content).toContain("Atlas &amp; Co");
    expect(preview.content).not.toContain("<script>alert");
    expect(server.content).toContain('require("express")');
    expect(routes.content).toContain("require(\"./store\")");
    expect(app.content).toContain("export default function App");
    expect(app.content).toContain('"Atlas & Co"');
    for (const endpoint of site.endpoints) {
      const route = endpoint.split(" ").slice(1).join(" ").replace("/api/posts/:slug", "/api/posts/:slug");
      expect(routes.content + server.content).toContain(route.split(" ")[0].startsWith("/") ? route : endpoint.slice(endpoint.indexOf("/")));
    }
    const message = formatWebsiteAssistantMessage(site);
    expect(message).toContain("Atlas & Co");
    expect(message).toContain("preview.html");
    if (kind === "store") expect(app.content).toContain("${product.price}");
  });

  it("escapes a hostile title in the preview page", () => {
    const site = generateFullStackWebsite("landing", '<script>alert("x")</script>');
    const preview = site.files.find((file) => file.path === "preview.html")!;
    expect(preview.content).not.toContain("<script>alert");
    expect(preview.content).toContain("&lt;script&gt;");
  });

  it("nests server and client folders", () => {
    const site = generateFullStackWebsite("blog");
    const tree = filesToTree(site.files);
    const server = tree.find((node) => node.name === "server");
    const client = tree.find((node) => node.name === "client");
    expect(server?.type).toBe("folder");
    expect(client?.type).toBe("folder");
    expect(server?.children?.some((node) => node.name === "index.js")).toBe(true);
    expect(tree.some((node) => node.name === "preview.html" && node.type === "file")).toBe(true);
  });

  it("detects full-stack website requests and ignores edits", () => {
    expect(detectWebsiteRequest("Build a full-stack portfolio website called Harbor Studio")?.kind).toBe("portfolio");
    expect(detectWebsiteRequest("Build a full-stack portfolio website called Harbor Studio")?.title).toBe("Harbor Studio");
    expect(detectWebsiteRequest("Create a blog website")?.kind).toBe("blog");
    expect(detectWebsiteRequest("Scaffold an ecommerce storefront")?.kind).toBe("store");
    expect(detectWebsiteRequest("Generate a dashboard website")?.kind).toBe("dashboard");
    expect(detectWebsiteRequest("Build a counter with HTML")).toBeNull();
    expect(detectWebsiteRequest("Fix the navbar on my website")).toBeNull();
    expect(detectWebsiteRequest("What is a website?")).toBeNull();
  });
});
