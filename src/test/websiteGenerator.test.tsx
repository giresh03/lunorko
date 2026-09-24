import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CodeEditor from "@/components/CodeEditor";
import {
  filesToProjectTree,
  generateWebsite,
  inferWebsiteRequest,
  upsertProjectFiles,
} from "@/lib/websiteGenerator";

vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco" />,
  loader: { init: () => Promise.resolve({ editor: { defineTheme: () => {} } }) },
}));

describe("website generator", () => {
  it("builds a full-stack restaurant project from a prompt", () => {
    const request = inferWebsiteRequest("Build a restaurant website for Olive & Oak");
    expect(request?.kind).toBe("restaurant");

    const site = generateWebsite(request!);
    expect(site.name).toBe("Olive & Oak");
    expect(site.files.map((file) => file.path)).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "server/server.mjs",
      "package.json",
      "README.md",
    ]);

    const html = site.files[0].content;
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(html).toContain("Olive &amp; Oak");
    expect(html).toContain("data-themed");

    const app = site.files[2].content;
    expect(app).toContain("/api/menu");
    expect(app).toContain("/api/reservations");
    expect(app).toContain("catalogSeed");

    const server = site.files[3].content;
    expect(server).toContain('import express from "express"');
    expect(server).toContain('app.get("/api/menu"');
    expect(server).toContain('app.post("/api/reservations"');

    const pkg = JSON.parse(site.files[4].content);
    expect(pkg.scripts.start).toBe("node server/server.mjs");
    expect(pkg.dependencies.express).toBeTruthy();
  });

  it("does not put raw markup from the brief into the page", () => {
    const site = generateWebsite({ kind: "landing", brief: "called <script>alert(1)</script>" });
    expect(site.name).not.toContain("<");
    expect(site.files[0].content).not.toContain("<script>alert");
  });

  it("recognizes the other site kinds", () => {
    expect(inferWebsiteRequest("Make an online store for Harbor Supply")?.kind).toBe("store");
    expect(inferWebsiteRequest("Generate a portfolio website")?.kind).toBe("portfolio");
    expect(inferWebsiteRequest("Create a landing page for Northwind")?.kind).toBe("landing");
    expect(inferWebsiteRequest("Build a blog")?.kind).toBe("blog");
    expect(inferWebsiteRequest("Design a dashboard")?.kind).toBe("dashboard");
  });

  it("leaves ordinary coding prompts alone", () => {
    expect(inferWebsiteRequest("Build a counter with HTML")).toBeNull();
    expect(inferWebsiteRequest("How do I build a website?")).toBeNull();
    expect(inferWebsiteRequest("Fix the restaurant website layout")).toBeNull();
  });

  it("nests client and server files in the project tree", () => {
    const site = generateWebsite({ kind: "store", brief: "Harbor Supply" });
    const tree = filesToProjectTree(site.files);
    const client = tree.find((node) => node.name === "client");
    const server = tree.find((node) => node.name === "server");
    expect(client?.children?.map((node) => node.name)).toEqual(["index.html", "styles.css", "app.js"]);
    expect(server?.children?.[0].name).toBe("server.mjs");

    const updated = upsertProjectFiles(tree, [{
      path: "client/styles.css",
      language: "css",
      content: "body { color: red; }",
    }]);
    const css = updated.find((node) => node.name === "client")?.children?.find((node) => node.name === "styles.css");
    expect(css?.content).toBe("body { color: red; }");
  });
});

describe("web development assistant", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = () => {};
  });

  it("adds a generated restaurant site from the Websites panel", () => {
    render(<CodeEditor domainName="Web Development" />);
    fireEvent.click(screen.getByRole("button", { name: "Websites" }));
    fireEvent.click(screen.getByRole("button", { name: /Restaurant/ }));
    fireEvent.change(screen.getByPlaceholderText("Site name, e.g. Olive & Oak"), {
      target: { value: "Olive & Oak" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(screen.getByText(/full-stack restaurant website/)).toBeInTheDocument();
    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    expect(screen.getByText("server.mjs")).toBeInTheDocument();
  });
});
