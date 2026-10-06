import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import {
  WEBSITE_BLUEPRINTS,
  buildWebsitePrompt,
  getWebsiteBlueprint,
  shouldInjectPreviewScript,
} from "./websiteGenerator";

const execFileAsync = promisify(execFile);

describe("website generator", () => {
  it("ships a previewable full-stack file set for every blueprint", () => {
    expect(WEBSITE_BLUEPRINTS.map((blueprint) => blueprint.id)).toEqual(["landing", "portfolio", "blog", "store"]);

    for (const blueprint of WEBSITE_BLUEPRINTS) {
      const byName = Object.fromEntries(blueprint.files.map((file) => [file.name, file.content]));
      expect(byName["index.html"]).toContain('href="styles.css"');
      expect(byName["index.html"]).toContain('src="script.js"');
      expect(byName["index.html"]).toContain("data-themed");
      expect(byName["script.js"]).toContain("FALLBACK");
      expect(byName["script.js"]).toContain("fetch(");
      expect(byName["server.js"]).toContain('require("http")');
      expect(byName["server.js"]).toContain("/api/");
      expect(byName["server.js"]).toContain("createServer");
      expect(JSON.parse(byName["package.json"]).scripts.start).toBe("node src/server.js");
      expect(shouldInjectPreviewScript("script.js", byName["script.js"])).toBe(true);
      expect(shouldInjectPreviewScript("server.js", byName["server.js"])).toBe(false);
    }
  });

  it("builds an AI prompt that asks for the full-stack files", () => {
    const prompt = buildWebsitePrompt("a bakery in Lisbon", "store");
    expect(prompt).toContain("a bakery in Lisbon");
    expect(prompt).toContain("index.html");
    expect(prompt).toContain("server.js");
    expect(prompt).toContain("No React");
    expect(getWebsiteBlueprint("store").label).toBe("Store");
  });

  it("runs the landing server and answers the features API", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "lunor-site-"));
    const src = path.join(root, "src");
    await mkdir(src);
    const blueprint = getWebsiteBlueprint("landing");
    for (const file of blueprint.files) {
      const atRoot = file.name === "package.json" || file.name === "README.md";
      await writeFile(path.join(atRoot ? root : src, file.name), file.content);
    }
    for (const site of WEBSITE_BLUEPRINTS) {
      const server = site.files.find((file) => file.name === "server.js")!;
      const script = site.files.find((file) => file.name === "script.js")!;
      const checkDir = path.join(root, site.id);
      await mkdir(checkDir);
      await writeFile(path.join(checkDir, "server.js"), server.content);
      await writeFile(path.join(checkDir, "script.js"), script.content);
      await execFileAsync("node", ["--check", "server.js"], { cwd: checkDir });
      await execFileAsync("node", ["--check", "script.js"], { cwd: checkDir });
    }

    const port = 36000 + Math.floor(Math.random() * 2000);
    const child = execFile("node", ["src/server.js"], { cwd: root, env: { ...process.env, PORT: String(port) } });
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("server did not start")), 4000);
        child.stdout?.on("data", () => {
          clearTimeout(timer);
          resolve(undefined);
        });
        child.once("error", reject);
        child.once("exit", (code) => {
          clearTimeout(timer);
          reject(new Error(`server exited ${code}`));
        });
      });
      const features = await fetch(`http://127.0.0.1:${port}/api/features`);
      expect(features.ok).toBe(true);
      const body = await features.json();
      expect(body.length).toBeGreaterThan(0);
      const page = await fetch(`http://127.0.0.1:${port}/`);
      expect(await page.text()).toContain("Lumen");
      const lead = await fetch(`http://127.0.0.1:${port}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ada", email: "ada@example.com", idea: "Cafe site" }),
      });
      expect(lead.status).toBe(201);
    } finally {
      child.kill();
      await rm(root, { recursive: true, force: true });
    }
  });
});
