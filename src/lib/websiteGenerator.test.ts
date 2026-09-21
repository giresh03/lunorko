import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  detectWebsiteRequest,
  generateWebsite,
  SITE_KINDS,
  WEBSITE_API_ROUTES,
} from "./websiteGenerator";

describe("website generator", () => {
  it("detects a full-stack portfolio request", () => {
    expect(detectWebsiteRequest("Generate a full-stack portfolio website")).toEqual({ kind: "portfolio" });
    expect(detectWebsiteRequest("Make a full stack restaurant site")).toEqual({ kind: "restaurant" });
    expect(detectWebsiteRequest("Create a full-stack dashboard web app")).toEqual({ kind: "dashboard" });
    expect(detectWebsiteRequest("Generate a full-stack website")).toEqual({ kind: "landing" });
  });

  it("leaves ordinary web questions to the assistant", () => {
    expect(detectWebsiteRequest("Build a todo website")).toBeNull();
    expect(detectWebsiteRequest("How do I generate a full-stack website?")).toBeNull();
    expect(detectWebsiteRequest("Explain CSS grid")).toBeNull();
  });

  it("writes the client, server, and four API routes for every site type", () => {
    for (const kind of SITE_KINDS) {
      const site = generateWebsite({ kind, name: `Sample ${kind}` });
      const paths = site.files.map((file) => file.path);
      expect(paths).toEqual([
        "client/index.html",
        "client/styles.css",
        "client/site.js",
        "server/server.mjs",
        "server/store.mjs",
        "package.json",
        "README.md",
      ]);
      const server = site.files.find((file) => file.path === "server/server.mjs")?.content || "";
      for (const route of WEBSITE_API_ROUTES) {
        expect(server).toContain(route.path);
      }
    }
  });

  it("serves health, site, and records from the generated Node server", async () => {
    const site = generateWebsite({ kind: "portfolio", name: "Northline Studio" });
    const dir = await mkdtemp(path.join(tmpdir(), "lunor-site-"));
    const port = await freePort();
    let child: ReturnType<typeof spawn> | undefined;
    try {
      for (const file of site.files) {
        const full = path.join(dir, file.path);
        await mkdir(path.dirname(full), { recursive: true });
        await writeFile(full, file.content);
      }
      const syntax = spawn(process.execPath, ["--check", "server/server.mjs"], { cwd: dir });
      await waitForExit(syntax, "server syntax");
      const clientSyntax = spawn(process.execPath, ["--check", "client/site.js"], { cwd: dir });
      await waitForExit(clientSyntax, "client syntax");

      child = spawn(process.execPath, ["server/server.mjs"], {
        cwd: dir,
        env: { ...process.env, PORT: String(port) },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let logs = "";
      child.stdout?.on("data", (chunk) => { logs += chunk.toString(); });
      child.stderr?.on("data", (chunk) => { logs += chunk.toString(); });

      const health = await waitForJson(port, "/api/health");
      expect(health).toMatchObject({ ok: true, service: "lunor-website" });

      const info = await readJson(port, "/api/site");
      expect(info).toMatchObject({ name: "Northline Studio", kind: "portfolio" });

      const before = await readJson(port, "/api/records");
      expect(Array.isArray(before.records)).toBe(true);
      expect(before.records.length).toBeGreaterThan(0);

      const created = await readJson(port, "/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Studio visit", detail: "Friday afternoon" }),
      });
      expect(created.record).toMatchObject({ title: "Studio visit", detail: "Friday afternoon" });

      const after = await readJson(port, "/api/records");
      expect(after.records[0]).toMatchObject({ title: "Studio visit" });

      const rejected = await fetch(`http://127.0.0.1:${port}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "  " }),
      });
      expect(rejected.status).toBe(400);
      if (!logs.includes("listening")) {
        throw new Error(logs || "server produced no logs");
      }
    } finally {
      child?.kill();
      await rm(dir, { recursive: true, force: true });
    }
  }, 20000);
});

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

function waitForExit(child: ReturnType<typeof spawn>, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with code ${code}`));
    });
  });
}

async function waitForJson(port: number, route: string): Promise<Record<string, unknown>> {
  const started = Date.now();
  let lastError = "server did not start";
  while (Date.now() - started < 8000) {
    try {
      return await readJson(port, route);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(lastError);
}

interface ApiJson {
  ok?: boolean;
  service?: string;
  name?: string;
  kind?: string;
  records?: Array<{ title?: string; detail?: string }>;
  record?: { title?: string; detail?: string };
}

async function readJson(port: number, route: string, init?: RequestInit): Promise<ApiJson> {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, init);
  if (!response.ok && response.status !== 201) {
    throw new Error(`${route} returned ${response.status}`);
  }
  return response.json();
}
