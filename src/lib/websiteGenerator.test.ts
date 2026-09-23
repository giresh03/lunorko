import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  defaultWebsiteTitle,
  generateFullStackWebsite,
  isServerRuntimeSource,
  isWebsiteGenerationRequest,
  parseWebsiteRequest,
  websiteFilesToTree,
} from "./websiteGenerator";

const PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/app.js",
  "server/server.js",
  "server/package.json",
  "README.md",
];

describe("website generator", () => {
  it("parses a named restaurant request", () => {
    const prompt = "Generate a full-stack restaurant website for Hearth & Rye";
    expect(isWebsiteGenerationRequest(prompt)).toBe(true);
    expect(parseWebsiteRequest(prompt)).toEqual({ kind: "restaurant", name: "Hearth & Rye" });
    expect(defaultWebsiteTitle("restaurant")).toBe("Hearth & Rye");
  });

  it("ignores ordinary coding questions", () => {
    expect(isWebsiteGenerationRequest("How do I build a website?")).toBe(false);
    expect(parseWebsiteRequest("Explain CSS grid")).toBeNull();
  });

  it("writes a client and a Node API for every kind", () => {
    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const site = generateFullStackWebsite({ kind: blueprint.kind });
      expect(site.title).toBe(defaultWebsiteTitle(blueprint.kind));
      expect(site.files.map((file) => file.path)).toEqual(PATHS);
      const html = file(site.files, "client/index.html");
      const app = file(site.files, "client/app.js");
      const server = file(site.files, "server/server.js");
      expect(html).toContain("data-themed");
      expect(html).toContain(site.title.replace(/&/g, "&amp;"));
      expect(app).toContain("const SEED");
      expect(server.startsWith("/* @lunor-runtime server */")).toBe(true);
      expect(isServerRuntimeSource(server)).toBe(true);
      expect(isServerRuntimeSource(app)).toBe(false);
      for (const route of ["/api/health", "/api/items", "/api/plans", "/api/contact", "/api/cart"]) {
        expect(server).toContain(route);
      }
      const tree = websiteFilesToTree(site.files);
      expect(tree.find((node) => node.name === "client")?.type).toBe("folder");
      expect(tree.find((node) => node.name === "server")?.children?.map((node) => node.name).sort()).toEqual([
        "package.json",
        "server.js",
      ]);
    }
  });

  it("serves the client and the API", async () => {
    const site = generateFullStackWebsite({ kind: "restaurant", name: "Hearth & Rye" });
    const dir = await mkdtemp(path.join(tmpdir(), "lunor-site-"));
    let child: ChildProcess | undefined;
    try {
      for (const entry of site.files) {
        const full = path.join(dir, entry.path);
        await mkdir(path.dirname(full), { recursive: true });
        await writeFile(full, entry.content);
      }
      child = spawn("node", ["server/server.js"], {
        cwd: dir,
        env: { ...process.env, PORT: "0" },
        stdio: ["ignore", "pipe", "pipe"],
      });
      const port = await waitForPort(child);
      const page = await fetch(`http://127.0.0.1:${port}/`);
      expect(page.status).toBe(200);
      expect(await page.text()).toContain("Hearth &amp; Rye");
      const health = await fetch(`http://127.0.0.1:${port}/api/health`).then((res) => res.json());
      expect(health).toEqual({ ok: true, service: "Hearth & Rye" });
      const items = await fetch(`http://127.0.0.1:${port}/api/items`).then((res) => res.json());
      expect(items.items[0].title).toBe("Rye cavatelli");
      const plans = await fetch(`http://127.0.0.1:${port}/api/plans`).then((res) => res.json());
      expect(plans.plans.length).toBeGreaterThan(0);
      const contact = await fetch(`http://127.0.0.1:${port}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ada", message: "Table for two" }),
      });
      expect(contact.status).toBe(201);
      const cart = await fetch(`http://127.0.0.1:${port}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Citrus crudo", qty: 1 }),
      }).then((res) => res.json());
      expect(cart.cart.some((line: { title: string }) => line.title === "Citrus crudo")).toBe(true);
    } finally {
      child?.kill();
      await rm(dir, { recursive: true, force: true });
    }
  });
});

function file(files: { path: string; content: string }[], target: string): string {
  return files.find((entry) => entry.path === target)?.content ?? "";
}

function waitForPort(child: ChildProcess): Promise<number> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("server did not listen")), 8000);
    let buffer = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();
      const match = buffer.match(/listening (\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(Number(match[1]));
      }
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`server exited ${code}: ${buffer}`));
    });
  });
}
