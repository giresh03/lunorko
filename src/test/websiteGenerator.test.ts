import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  generateWebsiteProject,
  interpretWebsitePrompt,
  isNodeModuleSource,
  WEBSITE_KINDS,
  type WebsiteKind,
} from "@/lib/websiteGenerator";

describe("website generator", () => {
  it("turns a web-development chat request into a website brief", () => {
    expect(interpretWebsitePrompt("Generate a full-stack portfolio website called Lumen Studio")).toMatchObject({
      kind: "portfolio",
      name: "Lumen Studio",
    });
    expect(interpretWebsitePrompt("Build a restaurant website named Hearth & Rye")).toMatchObject({
      kind: "restaurant",
      name: "Hearth & Rye",
    });
    expect(interpretWebsitePrompt("Create an online store called Harbor Goods")).toMatchObject({
      kind: "store",
      name: "Harbor Goods",
    });
    expect(interpretWebsitePrompt("debug my website css")).toBeNull();
    expect(interpretWebsitePrompt("Explain how to build a website")).toBeNull();
  });

  it.each(WEBSITE_KINDS.map((kind) => kind.id))("builds a runnable %s project", (kind: WebsiteKind) => {
    const meta = WEBSITE_KINDS.find((item) => item.id === kind)!;
    const project = generateWebsiteProject({
      kind,
      name: meta.defaultName,
      tagline: meta.defaultTagline,
    });

    const byPath = Object.fromEntries(project.files.map((file) => [file.path, file.content]));
    expect(byPath["client/index.html"]).toContain(meta.defaultName.replaceAll("&", "&amp;"));
    expect(byPath["client/index.html"]).toContain('href="styles.css"');
    expect(byPath["client/index.html"]).toContain('src="app.js"');
    expect(byPath["client/app.js"]).toContain("http://localhost:5000");
    expect(byPath["client/app.js"]).not.toMatch(/^\s*(import|export)\s/m);
    expect(isNodeModuleSource(byPath["server/index.js"])).toBe(true);
    expect(byPath["server/src/app.js"]).toContain("express");
    expect(byPath["server/src/config/db.js"]).toContain("MongoClient");
    expect(byPath["server/package.json"]).toContain('"type": "module"');
    expect(project.tree.some((node) => node.name === "client" && node.type === "folder")).toBe(true);
    expect(project.tree.some((node) => node.name === "server" && node.type === "folder")).toBe(true);
    expect(project.summary).toContain(meta.defaultName);

    const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
    for (const file of project.files.filter((entry) => entry.path.endsWith(".js"))) {
      const target = join(dir, file.path.replaceAll("/", "__"));
      writeFileSync(target, file.content);
      execFileSync(process.execPath, ["--check", target], { stdio: "pipe" });
    }
  });
});
