import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractCodeBlocks, editorPathForGeneratedFile } from "@/lib/codeBlocks";
import { insertProjectFile, readProjectFile } from "@/lib/projectTree";
import {
  WEBSITE_GENERATOR_FILES,
  buildWebsiteGeneratorPrompt,
  getWebsiteBlueprint,
  requestsFullStackWebsite,
  websiteBlueprints,
} from "@/lib/websiteGenerator";

describe("website generator blueprints", () => {
  it("includes a landing page, portfolio, blog, and store", () => {
    expect(websiteBlueprints.map((blueprint) => blueprint.id)).toEqual(["landing", "portfolio", "blog", "store"]);
  });

  it("gives every site a previewable client and an Express plus MongoDB backend", () => {
    for (const blueprint of websiteBlueprints) {
      const paths = blueprint.files.map((file) => file.path);
      expect(paths).toEqual([...WEBSITE_GENERATOR_FILES]);

      const html = blueprint.files.find((file) => file.path === "client/index.html")!.content;
      expect(html).toContain('data-themed');
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="script.js"');
      expect(html).toContain("images.unsplash.com");

      const server = blueprint.files.find((file) => file.path === "server/index.js")!.content;
      expect(server).toContain('require("express")');
      expect(server).toContain("/api/health");
      expect(server).toContain("../client");

      const model = blueprint.files.find((file) => file.path === "server/models/Item.js")!.content;
      expect(model).toContain("mongoose");
      expect(model).toContain("MONGODB_URI");

      const routes = blueprint.files.find((file) => file.path === "server/routes/api.js")!.content;
      expect(routes).toContain(`router.get("/${blueprint.resource}"`);
      expect(routes).toContain(`router.post("/${blueprint.resource}"`);

      const script = blueprint.files.find((file) => file.path === "client/script.js")!.content;
      expect(script).toContain(`/api/" + resource`);
      expect(script).toContain(blueprint.resource);
    }
  });

  it("adds an order route only for the store", () => {
    expect(getWebsiteBlueprint("store")!.files.find((file) => file.path === "server/routes/api.js")!.content).toContain('"/orders"');
    expect(getWebsiteBlueprint("blog")!.files.find((file) => file.path === "server/routes/api.js")!.content).not.toContain('"/orders"');
  });

  it("parses the generated server files", () => {
    const directory = mkdtempSync(join(tmpdir(), "lunor-site-"));
    const serverFiles = ["server/index.js", "server/routes/api.js", "server/models/Item.js", "client/script.js"];
    for (const blueprint of websiteBlueprints) {
      for (const path of serverFiles) {
        const file = blueprint.files.find((item) => item.path === path)!;
        const target = join(directory, `${blueprint.id}-${path.split("/").join("-")}`);
        writeFileSync(target, file.content);
        execFileSync(process.execPath, ["--check", target], { stdio: "pipe" });
      }
    }
  });
});

describe("website generator assistant wiring", () => {
  it("marks the automation prompt and recognizes full-stack requests", () => {
    const prompt = buildWebsiteGeneratorPrompt(websiteBlueprints[0], "A bakery in Lisbon");
    expect(prompt).toContain("[automation:fullstack-website]");
    expect(prompt).toContain("A bakery in Lisbon");
    expect(requestsFullStackWebsite(prompt)).toBe(true);
    expect(requestsFullStackWebsite("make a counter")).toBe(false);
    expect(requestsFullStackWebsite("hello", "fullstack-website")).toBe(true);
  });

  it("keeps generated project paths and nests them in the file tree", () => {
    const blocks = extractCodeBlocks(`client/index.html\n\`\`\`html\n<h1>Hi</h1>\n\`\`\`\nserver/index.js\n\`\`\`javascript\nconsole.log(1)\n\`\`\``);
    expect(blocks.map((block) => editorPathForGeneratedFile(block.filename!))).toEqual([
      "client/index.html",
      "server/index.js",
    ]);

    const tree = websiteBlueprints[0].files.reduce(
      (nodes, file) => insertProjectFile(nodes, file.path, { language: file.language, content: file.content }),
      [],
    );
    expect(readProjectFile(tree, "client/index.html")).toContain("Northwind");
    expect(readProjectFile(tree, "server/models/Item.js")).toContain("mongoose");
    expect(readProjectFile(tree, "package.json")).toContain("express");
  });
});
