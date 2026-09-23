import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WEBSITE_TEMPLATES, buildWebsiteProject, type WebsiteKind } from "./websiteGenerator";

const required = [
  "src/index.html",
  "src/styles.css",
  "src/script.js",
  "src/server.js",
  "src/data.json",
  "package.json",
  "README.md",
];

describe("website generator", () => {
  it("builds a full-stack file set for every template", () => {
    for (const template of WEBSITE_TEMPLATES) {
      const site = buildWebsiteProject({ kind: template.id, name: "Harbor & Co", focus: "Quiet tools for small teams" });
      expect(site.files.map((file) => file.path)).toEqual(required);
      const html = site.files.find((file) => file.path === "src/index.html")!.content;
      expect(html).toContain("Harbor &amp; Co");
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="script.js"');
      expect(html).not.toContain("server.js");
      expect(html).toContain('id="site-data"');
      expect(site.files.find((file) => file.name === "script.js")!.content).toContain('fetch(endpoint');
      expect(site.files.find((file) => file.name === "script.js")!.content).toContain("localStorage");
      expect(site.files.find((file) => file.name === "server.js")!.content).toContain("/api/content");
      expect(site.files.find((file) => file.name === "server.js")!.content).toContain(site.content.form.endpoint);
      const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);
      expect(pkg.scripts.start).toBe("node src/server.js");
      const data = JSON.parse(site.files.find((file) => file.path === "src/data.json")!.content);
      expect(data.kind).toBe(template.id);
      expect(data.items.length).toBeGreaterThan(0);
    }
  });

  it("escapes markup in the site name", () => {
    const site = buildWebsiteProject({
      kind: "landing" as WebsiteKind,
      name: '<script>alert("x")</script>',
      focus: "A calm launch",
    });
    const html = site.files.find((file) => file.name === "index.html")!.content;
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("\\u003cscript");
  });

  it("uses a fallback name when the field is empty", () => {
    const site = buildWebsiteProject({ kind: "store", name: "   " });
    expect(site.name).toBe("Store");
    expect(site.content.form.endpoint).toBe("/api/orders");
  });

  it("runs the Node API and stores a form post", async () => {
    const site = buildWebsiteProject({ kind: "restaurant", name: "Hearth", focus: "Weeknight dinners" });
    const root = mkdtempSync(join(tmpdir(), "lunor-site-"));
    mkdirSync(join(root, "src"));
    for (const file of site.files) {
      if (!file.path.startsWith("src/")) continue;
      writeFileSync(join(root, file.path), file.content);
    }
    execFileSync(process.execPath, ["--check", join(root, "src/server.js")]);
    execFileSync(process.execPath, ["--check", join(root, "src/script.js")]);

    const child = spawn(process.execPath, ["src/server.js"], {
      cwd: root,
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const port = await new Promise<number>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("server did not start")), 5000);
      child.stdout.on("data", (chunk: Buffer) => {
        const match = String(chunk).match(/localhost:(\d+)/);
        if (match) {
          clearTimeout(timer);
          resolve(Number(match[1]));
        }
      });
      child.on("error", reject);
    });

    try {
      const content = await fetch(`http://127.0.0.1:${port}/api/content`);
      expect(content.status).toBe(200);
      const body = await content.json();
      expect(body.name).toBe("Hearth");
      expect(body.focus).toBe("Weeknight dinners");

      const page = await fetch(`http://127.0.0.1:${port}/`);
      expect(page.status).toBe(200);
      expect(await page.text()).toContain("Hearth");

      const posted = await fetch(`http://127.0.0.1:${port}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ada", email: "ada@example.com", message: "2 people at 7" }),
      });
      expect(posted.status).toBe(201);
    } finally {
      child.kill();
    }
  });
});
