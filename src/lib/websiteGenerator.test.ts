import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  GENERATED_PATHS,
  detectFullStackRequest,
  generateFullStackSite,
  titleFromPrompt,
} from "./websiteGenerator";

const children: ChildProcess[] = [];
const dirs: string[] = [];

afterEach(() => {
  for (const child of children) child.kill("SIGTERM");
  children.length = 0;
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
  dirs.length = 0;
});

describe("full-stack website generator", () => {
  it("detects a generate verb plus full-stack, and leaves other website asks for the model", () => {
    expect(detectFullStackRequest("Generate a full-stack portfolio website")).toBe("portfolio");
    expect(detectFullStackRequest("Build a full-stack blog website")).toBe("blog");
    expect(detectFullStackRequest("create a full stack restaurant site")).toBe("restaurant");
    expect(detectFullStackRequest("make a fullstack store")).toBe("store");
    expect(detectFullStackRequest("scaffold a full-stack dashboard")).toBe("dashboard");
    expect(detectFullStackRequest("Generate a full-stack website")).toBe("landing");
    expect(detectFullStackRequest("build a todo website")).toBeNull();
    expect(detectFullStackRequest("explain how full-stack websites work")).toBeNull();
    expect(titleFromPrompt('Generate a full-stack portfolio called "Atlas Studio"', "portfolio")).toBe("Atlas Studio");
  });

  it("writes the client, Node server, and four API routes", () => {
    const site = generateFullStackSite("portfolio", "Studio North");
    expect(site.files.map((file) => file.path)).toEqual([...GENERATED_PATHS]);
    const server = site.files.find((file) => file.path === "server/server.mjs")?.content ?? "";
    expect(server).toContain('"/api/health"');
    expect(server).toContain('"/api/site"');
    expect(server).toContain('"/api/records"');
    expect(server).toContain('req.method === "POST"');
    expect(server).toContain('req.method === "GET"');
  });

  it("serves health, site, and records from the generated Node server", async () => {
    const site = generateFullStackSite("portfolio", "Studio North");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lunor-site-"));
    dirs.push(dir);
    for (const file of site.files) {
      const full = path.join(dir, file.path);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, file.content);
    }

    const port = await freePort();
    const child = spawn(process.execPath, ["server/server.mjs"], {
      cwd: dir,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    children.push(child);

    await waitForHealth(port);
    const page = await request(port, "GET", "/");
    expect(page.status).toBe(200);
    expect(page.raw).toContain("Studio North");
    expect(page.raw).toContain("styles.css");

    const health = await request(port, "GET", "/api/health");
    expect(health.status).toBe(200);
    expect(health.json).toMatchObject({ ok: true });

    const siteRes = await request(port, "GET", "/api/site");
    expect(siteRes.status).toBe(200);
    expect(siteRes.json).toMatchObject({ kind: "portfolio", title: "Studio North" });

    const listed = await request(port, "GET", "/api/records");
    expect(listed.status).toBe(200);
    expect(Array.isArray(listed.json.records)).toBe(true);

    const created = await request(port, "POST", "/api/records", JSON.stringify({ title: "New piece", body: "From the test" }));
    expect(created.status).toBe(201);
    expect(created.json.record.title).toBe("New piece");

    const again = await request(port, "GET", "/api/records");
    expect(again.json.records[0].title).toBe("New piece");
  });
});

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

interface ApiBody {
  ok?: boolean;
  kind?: string;
  title?: string;
  records?: { title: string }[];
  record?: { title: string };
}

function request(port: number, method: string, pathname: string, body?: string): Promise<{ status: number; raw: string; json: ApiBody | null }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: pathname,
        method,
        headers: body
          ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
          : undefined,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const json = pathname.startsWith("/api/") && raw ? JSON.parse(raw) as ApiBody : null;
          resolve({ status: res.statusCode || 0, raw, json });
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function waitForHealth(port: number) {
  const deadline = Date.now() + 8000;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const health = await request(port, "GET", "/api/health");
      if (health.status === 200) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw lastError instanceof Error ? lastError : new Error("generated server did not start");
}
