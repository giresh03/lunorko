import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEBSITE_AUTOMATIONS,
  escapeHtml,
  filesToProjectTree,
  generateWebsite,
  isNodeServerSource,
  slugifySiteName,
  type WebsiteKind,
} from "@/lib/websiteGenerator";

function assertSyntax(source: string, filename: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "lunor-site-"));
  const file = path.join(dir, filename);
  writeFileSync(file, source);
  execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
}

describe("website generator", () => {
  it("escapes site names and slugs them for package.json", () => {
    expect(escapeHtml(`A <b> & "x"`)).toBe("A &lt;b&gt; &amp; &quot;x&quot;");
    expect(slugifySiteName("  Luna Studio!! ")).toBe("luna-studio");
    expect(slugifySiteName("***")).toBe("lunor-site");
  });

  it.each(WEBSITE_AUTOMATIONS.map((item) => [item.id] as [WebsiteKind]))(
    "builds a full-stack %s project",
    (kind) => {
      const site = generateWebsite(kind, `Acme <${kind}>`);
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
      expect(html).toContain('data-themed');
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="script.js"');
      expect(html).toContain("Acme &lt;");
      expect(html).not.toContain(`<${kind}>`);

      const client = site.files.find((file) => file.path === "client/script.js")!;
      const server = site.files.find((file) => file.path === "server/server.js")!;
      expect(isNodeServerSource(server.content)).toBe(true);
      expect(isNodeServerSource(client.content)).toBe(false);
      expect(server.content).toContain('from "express"');
      expect(server.content).toContain('express.static');
      assertSyntax(client.content, "script.js");
      assertSyntax(server.content, "server.mjs");

      const pkg = JSON.parse(site.files.find((file) => file.path === "server/package.json")!.content);
      expect(pkg.type).toBe("module");
      expect(pkg.dependencies.express).toBeTruthy();
      expect(pkg.scripts.start).toBe("node server.js");

      const tree = filesToProjectTree(site.files);
      expect(tree.find((node) => node.name === "client")?.type).toBe("folder");
      expect(tree.find((node) => node.name === "server")?.children?.some((node) => node.name === "server.js")).toBe(true);
      expect(site.summary).toContain("cd server && npm install && npm start");
    },
  );

  it("rejects an unknown automation", () => {
    expect(() => generateWebsite("wiki" as WebsiteKind, "Nope")).toThrow(/Unknown website automation/);
  });
});
