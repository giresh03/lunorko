import { spawn } from "node:child_process";
import http from "node:http";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  generateWebsite,
  matchWebsiteRequest,
  websitePreviewFiles,
  websiteToMarkdown,
  websiteToProjectTree,
  WEBSITE_BLUEPRINTS,
} from "./websiteGenerator";

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

describe("website generator", () => {
  it("writes a client and a Node API for every blueprint", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const site = generateWebsite({ kind: blueprint.id, name: blueprint.defaultName });
      const paths = site.files.map((file) => file.path);
      expect(paths).toEqual([
        "client/index.html",
        "client/styles.css",
        "client/script.js",
        "server/server.js",
        "server/package.json",
        "README.md",
      ]);
      const html = site.files[0].content;
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="script.js"');
      expect(html).toContain(blueprint.defaultName);
      expect(site.files[3].content).toContain('"/api/health"');
      expect(site.files[3].content).toContain('"/api/items"');
      expect(site.files[3].content).toContain('"/api/leads"');
      expect(site.files[4].content).toContain('"start": "node server.js"');
    }
  });

  it("uses the requested name in the page and the API", () => {
    const site = generateWebsite({ kind: "restaurant", name: "Olive & Oak", tagline: "Supper on Pine Street." });
    expect(site.slug).toBe("olive-oak");
    expect(site.files[0].content).toContain("Olive &amp; Oak");
    expect(site.files[0].content).toContain("Supper on Pine Street.");
    expect(site.files[2].content).toContain("Olive & Oak");
    expect(site.files[3].content).toContain("Olive & Oak");
    expect(site.summary).toContain("node server/server.js");
  });

  it("escapes markup in the site name", () => {
    const site = generateWebsite({ kind: "landing", name: '<img src=x onerror=alert(1)>' });
    expect(site.files[0].content).not.toContain("<img src=x");
    expect(site.files[0].content).toContain("&lt;img");
    expect(site.files[2].content).not.toContain("</script>");
  });

  it("builds a folder tree the editor can open", () => {
    const site = generateWebsite({ kind: "store", name: "Atelier Goods" });
    const tree = websiteToProjectTree(site);
    const client = tree.find((node) => node.id === "client");
    const server = tree.find((node) => node.id === "server");
    expect(client?.children?.map((node) => node.name)).toEqual(["index.html", "styles.css", "script.js"]);
    expect(server?.children?.map((node) => node.name)).toEqual(["server.js", "package.json"]);
    expect(tree.some((node) => node.id === "README.md")).toBe(true);
    expect(site.files[2].content).toContain('kind":"store"');
    expect(site.files[2].content).toContain("Add to cart");
    const preview = websitePreviewFiles(site);
    expect(preview["styles.css"]).toContain("--accent");
    expect(preview["script.js"]).toContain("Add to cart");
    expect(preview["server.js"]).toBeUndefined();
    expect(Object.keys(preview).some((name) => name.startsWith("server/"))).toBe(false);
  });

  it("turns a web-development assistant prompt into a brief", () => {
    expect(matchWebsiteRequest("Build a restaurant website called Harbor Table")).toEqual({
      kind: "restaurant",
      name: "Harbor Table",
      tagline: expect.any(String),
    });
    expect(matchWebsiteRequest("Generate a portfolio website")).toMatchObject({ kind: "portfolio" });
    expect(matchWebsiteRequest("Create a store website")).toMatchObject({ kind: "store" });
    expect(matchWebsiteRequest("Make a booking website")).toMatchObject({ kind: "booking" });
    expect(matchWebsiteRequest("Build a todo list")).toBeNull();
    expect(matchWebsiteRequest("Explain how CSS grid works")).toBeNull();
  });

  it("runs the generated Node API and serves the page", async () => {
    const site = generateWebsite({ kind: "restaurant", name: "Harbor Table" });
    const dir = await mkdtemp(path.join(tmpdir(), "lunor-site-"));
    const port = await freePort();
    let child: ReturnType<typeof spawn> | undefined;
    try {
      for (const file of site.files) {
        const fullPath = path.join(dir, file.path);
        await mkdir(path.dirname(fullPath), { recursive: true });
        await writeFile(fullPath, file.content);
      }
      child = spawn("node", ["server/server.js"], {
        cwd: dir,
        env: { ...process.env, PORT: String(port) },
        stdio: ["ignore", "pipe", "pipe"],
      });
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("server did not start")), 5000);
        child.stdout.on("data", (chunk) => {
          if (String(chunk).includes("running at")) {
            clearTimeout(timer);
            resolve();
          }
        });
        child.once("exit", (code) => {
          clearTimeout(timer);
          reject(new Error(`server exited ${code}`));
        });
      });

      const page = await fetch(`http://127.0.0.1:${port}/`);
      expect(page.status).toBe(200);
      expect(await page.text()).toContain("Harbor Table");

      const items = await fetch(`http://127.0.0.1:${port}/api/items`);
      const menu = await items.json();
      expect(menu[0].title).toBe("Chilled oysters");

      const lead = await fetch(`http://127.0.0.1:${port}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ada", email: "ada@example.com", message: "Table for two" }),
      });
      expect(lead.status).toBe(201);
      expect(await lead.json()).toMatchObject({ id: "lead_1", name: "Ada" });

      const blocked = await fetch(`http://127.0.0.1:${port}/../server/server.js`);
      expect(blocked.status).not.toBe(200);
      const rawStatus = await new Promise<number>((resolve, reject) => {
        const req = http.request(
          { hostname: "127.0.0.1", port, path: "/%2e%2e/server/server.js", method: "GET" },
          (res) => {
            res.resume();
            resolve(res.statusCode || 0);
          },
        );
        req.on("error", reject);
        req.end();
      });
      expect(rawStatus).not.toBe(200);
    } finally {
      child?.kill();
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("includes the source files in assistant markdown", () => {
    const site = generateWebsite({ kind: "blog", name: "Field Notes" });
    const markdown = websiteToMarkdown(site);
    expect(markdown).toContain("client/index.html");
    expect(markdown).toContain("```javascript");
    expect(markdown).toContain("GET /api/items");
  });
});
