import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  detectWebsiteRequest,
  filesToTree,
  generateFullStackWebsite,
  mergeGeneratedFiles,
  projectPathForBlock,
  WEBSITE_GENERATOR_ACTIONS,
} from "./websiteGenerator";

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

describe("website generator", () => {
  it("ignores widget requests and accepts website requests", () => {
    expect(detectWebsiteRequest("Build a counter with HTML, CSS, and JS")).toBeNull();
    expect(detectWebsiteRequest("Create a navbar component")).toBeNull();
    expect(detectWebsiteRequest("Explain how a website works")).toBeNull();

    const brief = detectWebsiteRequest("Generate a full-stack portfolio website named Blue Harbor");
    expect(brief?.kind).toBe("portfolio");
    expect(brief?.name).toBe("Blue Harbor");
  });

  it("maps assistant actions onto site kinds", () => {
    for (const action of WEBSITE_GENERATOR_ACTIONS) {
      const brief = detectWebsiteRequest(action.prompt);
      expect(brief?.kind).toBe(action.id);
    }
  });

  it("writes a previewable client and a Node API", () => {
    const brief = detectWebsiteRequest('Generate a full-stack website "Hello <img>"');
    expect(brief).not.toBeNull();
    const site = generateFullStackWebsite(brief!);
    const paths = site.files.map((file) => file.path);
    expect(paths).toEqual([
      "client/index.html",
      "client/styles.css",
      "client/app.js",
      "server/server.js",
      "server/data.js",
      "package.json",
      "README.md",
    ]);

    const html = site.files[0].content;
    expect(html).toContain("Hello img");
    expect(html).not.toContain("Hello <img>");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(site.files[2].content).toContain("SEED");
    expect(site.files[2].content).not.toMatch(/<\w+[\s/>]/);
    expect(site.files[2].content).toContain(`/api/${site.apiResource}`);
    expect(site.files[3].content).toContain("http.createServer");
    expect(JSON.parse(site.files[5].content).scripts.start).toBe("node server/server.js");

    const tree = filesToTree(site.files);
    expect(tree.find((node) => node.name === "client")?.children?.map((child) => child.name)).toEqual([
      "index.html",
      "styles.css",
      "app.js",
    ]);
  });

  it("merges nested files without dropping the existing tree", () => {
    const merged = mergeGeneratedFiles(
      [{ id: "src", name: "src", type: "folder", isOpen: true, children: [
        { id: "src/app.js", name: "app.js", type: "file", language: "javascript", content: "old" },
      ] }],
      [{ path: "client/index.html", language: "html", content: "<h1>New</h1>" }],
    );
    expect(merged.find((node) => node.id === "src")?.children?.[0].content).toBe("old");
    expect(merged.find((node) => node.id === "client")?.children?.[0].content).toBe("<h1>New</h1>");
    expect(projectPathForBlock("client/index.html")).toBe("client/index.html");
    expect(projectPathForBlock("app.js")).toBe("src/app.js");
  });

  it("serves the generated page and API", async () => {
    const brief = detectWebsiteRequest("Generate a full-stack portfolio website");
    const site = generateFullStackWebsite(brief!);
    const dir = mkdtempSync(path.join(tmpdir(), "lunor-site-"));
    for (const file of site.files) {
      const dest = path.join(dir, file.path);
      mkdirSync(path.dirname(dest), { recursive: true });
      writeFileSync(dest, file.content);
      if (file.path.endsWith(".js")) execFileSync(process.execPath, ["--check", dest], { stdio: "pipe" });
    }

    const port = await freePort();
    const child = spawn(process.execPath, ["server/server.js"], {
      cwd: dir,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let logs = "";
    child.stdout?.on("data", (chunk) => { logs += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { logs += chunk.toString(); });

    const started = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(logs || "server did not start")), 5000);
      const check = () => {
        if (!logs.includes("running at")) return;
        clearTimeout(timer);
        child.stdout?.off("data", check);
        child.stderr?.off("data", check);
        resolve();
      };
      child.stdout?.on("data", check);
      child.stderr?.on("data", check);
      child.once("exit", (code) => {
        if (!logs.includes("running at")) {
          clearTimeout(timer);
          reject(new Error(`server exited ${code}: ${logs}`));
        }
      });
      check();
    });

    try {
      await started;

      const page = await fetch(`http://127.0.0.1:${port}/`);
      expect(page.status).toBe(200);
      expect(await page.text()).toContain(brief!.name);

      const catalog = await fetch(`http://127.0.0.1:${port}/api/${site.apiResource}`);
      expect(catalog.status).toBe(200);
      const body = await catalog.json() as { items: unknown[] };
      expect(body.items.length).toBeGreaterThan(0);

      const rejected = await fetch(`http://127.0.0.1:${port}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });
      expect(rejected.status).toBe(400);

      const accepted = await fetch(`http://127.0.0.1:${port}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ada", message: "Hello" }),
      });
      expect(accepted.status).toBe(201);

      const blocked = await fetch(`http://127.0.0.1:${port}/..%2fserver/data.js`);
      expect([400, 403, 404]).toContain(blocked.status);
    } finally {
      child.kill();
    }
  });
});
