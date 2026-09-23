import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import {
  WEBSITE_FILE_PATHS,
  WEBSITE_PRESETS,
  buildWebsiteFileTree,
  detectWebsitePreset,
  generateFullStackWebsite,
  isServerModulePath,
  shouldGenerateWebsite,
  toPreviewFileMap,
} from "./websiteGenerator";

function file(site: ReturnType<typeof generateFullStackWebsite>, path: string) {
  const match = site.files.find((entry) => entry.path === path);
  if (!match) throw new Error(`Missing ${path}`);
  return match.content;
}

describe("website generator routing", () => {
  it("builds a restaurant site from a natural prompt", () => {
    expect(shouldGenerateWebsite("Build a restaurant website for Luna Bistro")).toBe(true);
    expect(detectWebsitePreset("Build a restaurant website for Luna Bistro")).toBe("restaurant");
    const site = generateFullStackWebsite({ prompt: "Build a restaurant website for Luna Bistro" });
    expect(site.preset).toBe("restaurant");
    expect(site.name).toBe("Luna Bistro");
    expect(generateFullStackWebsite({ prompt: "Build a shop website for North & Pine" }).name).toBe("North & Pine");
  });

  it("leaves debugging and explanation prompts for the model", () => {
    expect(shouldGenerateWebsite("Explain how a restaurant website is structured")).toBe(false);
    expect(shouldGenerateWebsite("Debug this TypeError in my fetch call")).toBe(false);
    expect(shouldGenerateWebsite("Fix the bug in my script")).toBe(false);
    expect(shouldGenerateWebsite("Create a todo list")).toBe(false);
  });

  it("covers every preset chip", () => {
    expect(WEBSITE_PRESETS.map((preset) => preset.id)).toEqual([
      "portfolio",
      "restaurant",
      "shop",
      "blog",
      "saas",
      "studio",
    ]);
    const names = new Set<string>();
    for (const preset of WEBSITE_PRESETS) {
      const site = generateFullStackWebsite({ prompt: preset.prompt, preset: preset.id });
      expect(site.preset).toBe(preset.id);
      names.add(file(site, "client/index.html"));
    }
    expect(names.size).toBe(WEBSITE_PRESETS.length);
  });
});

describe("generated full-stack project", () => {
  const site = generateFullStackWebsite({ prompt: "Build a restaurant website for Luna Bistro" });

  it("writes the client, server, package, and readme", () => {
    expect(site.files.map((entry) => entry.path)).toEqual([...WEBSITE_FILE_PATHS]);
    const tree = buildWebsiteFileTree(site);
    expect(tree.map((node) => node.name)).toEqual(["client", "server", "package.json", "README.md"]);
    expect(tree[0].children?.map((node) => node.name)).toEqual(["index.html", "styles.css", "app.js"]);
    expect(tree[1].children?.map((node) => node.name)).toEqual(["index.js", "routes.js", "data.js"]);
  });

  it("exposes the Express API and a seed-backed client", () => {
    const routes = file(site, "server/routes.js");
    const client = file(site, "client/app.js");
    const data = file(site, "server/data.js");
    const pkg = JSON.parse(file(site, "package.json"));
    const html = file(site, "client/index.html");

    expect(routes).toMatch(/router\.get\(\s*"\/health"/);
    expect(routes).toMatch(/router\.get\(\s*"\/items"/);
    expect(routes).toMatch(/router\.get\(\s*"\/items\/:id"/);
    expect(routes).toMatch(/router\.post\(\s*"\/inquiries"/);
    expect(file(site, "server/index.js")).toContain('from "express"');
    expect(file(site, "server/index.js")).not.toContain("require(");
    expect(pkg.type).toBe("module");
    expect(pkg.scripts.start).toBe("node server/index.js");
    expect(pkg.dependencies.express).toBeTruthy();
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(html).toContain("Luna Bistro");
    expect(client).toContain("SEED_ITEMS");
    expect(client).toContain('fetch("/api/items")');
    expect(client).toContain('fetch("/api/inquiries"');
    expect(client).not.toMatch(/\bimport\b|\bexport\b/);
    for (const title of ["Citrus Burrata", "Wood-Fired Branzino", "Olive Oil Cake"]) {
      expect(client).toContain(title);
      expect(data).toContain(title);
    }
    expect(site.assistantMessage).not.toContain("```");
  });

  it("keeps server modules out of the preview map", () => {
    expect(isServerModulePath("server/index.js")).toBe(true);
    expect(isServerModulePath("server/routes.js")).toBe(true);
    expect(isServerModulePath("client/app.js")).toBe(false);
    const preview = toPreviewFileMap(site.files);
    expect(preview["app.js"]).toContain("SEED_ITEMS");
    expect(preview["styles.css"]).toContain("--accent");
    expect(Object.keys(preview).some((key) => key.startsWith("server/"))).toBe(false);
    expect(Object.values(preview).join("\n")).not.toContain("express.static");
  });

  it("parses every JavaScript file", () => {
    const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
    for (const entry of site.files) {
      if (!entry.path.endsWith(".js")) continue;
      const full = join(dir, entry.path);
      mkdirSync(join(full, ".."), { recursive: true });
      writeFileSync(full, entry.content);
      execFileSync(process.execPath, ["--check", full], { stdio: "pipe" });
    }
  });

  it("renders seed menu items when the API is offline", async () => {
    const html = file(site, "client/index.html").replace(
      '<script src="app.js"></script>',
      `<script>${file(site, "client/app.js")}</script>`,
    );
    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      url: "https://preview.local/",
      beforeParse(window) {
        window.fetch = () => Promise.reject(new Error("preview has no server"));
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 30));

    const items = dom.window.document.getElementById("items");
    expect(dom.window.document.getElementById("site-name")?.textContent).toBe("Luna Bistro");
    expect(items?.textContent).toContain("Citrus Burrata");
    expect(items?.querySelectorAll(".card")).toHaveLength(3);

    const form = dom.window.document.getElementById("inquiry-form") as HTMLFormElement;
    (dom.window.document.getElementById("inquiry-name") as HTMLInputElement).value = "Ada";
    (dom.window.document.getElementById("inquiry-email") as HTMLInputElement).value = "ada@example.com";
    (dom.window.document.getElementById("inquiry-message") as HTMLTextAreaElement).value = "Table for two";
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(dom.window.document.getElementById("form-status")?.textContent).toContain("Saved in preview");
  });
});
