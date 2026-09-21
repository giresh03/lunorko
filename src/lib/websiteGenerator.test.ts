import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEBSITE_KINDS,
  detectWebsiteRequest,
  generateWebsite,
  type GeneratedWebsite,
} from "./websiteGenerator";

const FILE_PATHS = [
  "client/index.html",
  "client/styles.css",
  "client/site.js",
  "server/server.mjs",
  "server/store.mjs",
  "package.json",
  "README.md",
];

async function boot(site: GeneratedWebsite): Promise<{ base: string; stop: () => void }> {
  const dir = await mkdtemp(path.join(tmpdir(), "lunor-site-"));
  for (const file of site.files) {
    const dest = path.join(dir, file.path);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, file.content);
  }
  const child: ChildProcess = spawn(process.execPath, ["server/server.mjs"], {
    cwd: dir,
    env: { ...process.env, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const base = await new Promise<string>((resolve, reject) => {
    let logs = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`server timeout\n${logs}`));
    }, 8000);
    const onData = (chunk: Buffer) => {
      logs += chunk.toString();
      const match = logs.match(/LISTENING (\d+)/);
      if (!match) return;
      clearTimeout(timer);
      resolve(`http://127.0.0.1:${match[1]}`);
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("exit", (code) => {
      if (!logs.includes("LISTENING")) {
        clearTimeout(timer);
        reject(new Error(`server exited ${code}\n${logs}`));
      }
    });
  });
  return {
    base,
    stop: () => child.kill("SIGTERM"),
  };
}

describe("website generator", () => {
  it("detects full-stack website requests and ignores explanations", () => {
    expect(detectWebsiteRequest("Generate a full-stack portfolio website")).toMatchObject({
      kind: "portfolio",
      title: "Studio Hale",
    });
    expect(detectWebsiteRequest('Build a restaurant website called "Olive & Oak"')).toMatchObject({
      kind: "restaurant",
      title: "Olive & Oak",
    });
    expect(detectWebsiteRequest("Create an online store website")).toMatchObject({ kind: "store" });
    expect(detectWebsiteRequest("Make a dashboard site")).toMatchObject({ kind: "dashboard" });
    expect(detectWebsiteRequest("Design a landing page website")).toMatchObject({ kind: "landing" });
    expect(detectWebsiteRequest("How do I build a restaurant website")).toBeNull();
    expect(detectWebsiteRequest("Create a todo list")).toBeNull();
    expect(detectWebsiteRequest("Explain SQL injection")).toBeNull();
  });

  it("writes the client, server, and API routes for every kind", () => {
    for (const kind of WEBSITE_KINDS) {
      const site = generateWebsite({ kind, title: `Test ${kind}` });
      expect(site.files.map((file) => file.path)).toEqual(FILE_PATHS);
      expect(site.tree.map((node) => node.id)).toEqual(["client", "server", "package.json", "README.md"]);
      const server = site.files.find((file) => file.path === "server/server.mjs")?.content ?? "";
      expect(server).toContain('"/api/health"');
      expect(server).toContain('"/api/site"');
      expect(server).toContain('"/api/records"');
      const html = site.files.find((file) => file.path === "client/index.html")?.content ?? "";
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="site.js"');
      expect(html).toContain("Test " + kind);
      expect(html).not.toContain("<script>");
    }
  });

  it("serves health, site content, and records", async () => {
    const site = generateWebsite({ kind: "restaurant", title: "Harbor Table" });
    const running = await boot(site);
    try {
      const health = await fetch(`${running.base}/api/health`);
      expect(health.status).toBe(200);
      expect(await health.json()).toEqual({ ok: true, service: "Harbor Table" });

      const page = await fetch(running.base);
      expect(page.status).toBe(200);
      expect(page.headers.get("content-type")).toContain("text/html");
      expect(await page.text()).toContain("Harbor Table");

      const info = await fetch(`${running.base}/api/site`);
      expect((await info.json()).kind).toBe("restaurant");

      const before = await fetch(`${running.base}/api/records`);
      const seeded = await before.json();
      expect(seeded.length).toBeGreaterThan(0);

      const created = await fetch(`${running.base}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Ada", party: "2", date: "2026-10-01" }),
      });
      expect(created.status).toBe(201);
      const record = await created.json();
      expect(record.name).toBe("Ada");
      expect(record.id).toBeTruthy();

      const after = await fetch(`${running.base}/api/records`);
      const records = await after.json();
      expect(records[0].id).toBe(record.id);

      const empty = await fetch(`${running.base}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "   " }),
      });
      expect(empty.status).toBe(400);
    } finally {
      running.stop();
    }
  });
});
