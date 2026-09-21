import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  GENERATED_PATHS,
  detectSiteKind,
  generateFullStackSite,
  isFullStackWebsiteRequest,
} from "./websiteGenerator";

describe("full-stack website phrase detection", () => {
  it("accepts a generate verb together with full-stack", () => {
    expect(isFullStackWebsiteRequest("Generate a full-stack portfolio website")).toBe(true);
    expect(isFullStackWebsiteRequest("create a full stack restaurant site")).toBe(true);
    expect(isFullStackWebsiteRequest("build a fullstack dashboard")).toBe(true);
  });

  it("leaves ordinary website requests for the model", () => {
    expect(isFullStackWebsiteRequest("build a todo website")).toBe(false);
    expect(isFullStackWebsiteRequest("generate a portfolio website")).toBe(false);
    expect(isFullStackWebsiteRequest("explain full-stack architecture")).toBe(false);
  });

  it("picks the site kind from the prompt", () => {
    expect(detectSiteKind("Generate a full-stack portfolio website")).toBe("portfolio");
    expect(detectSiteKind("make a full-stack blog")).toBe("blog");
    expect(detectSiteKind("create a full-stack restaurant website")).toBe("restaurant");
    expect(detectSiteKind("build a full-stack store")).toBe("store");
    expect(detectSiteKind("scaffold a full-stack dashboard")).toBe("dashboard");
    expect(detectSiteKind("generate a full-stack website")).toBe("landing");
  });
});

describe("generated full-stack project", () => {
  it("writes the client, server, and package files", () => {
    const site = generateFullStackSite({ prompt: "Generate a full-stack portfolio website" });
    expect(site.kind).toBe("portfolio");
    expect(site.projectName).toBe("Northline");
    for (const filePath of GENERATED_PATHS) {
      expect(site.files[filePath]?.length).toBeGreaterThan(0);
    }
    expect(site.files["server/server.mjs"]).toContain('"/api/health"');
    expect(site.files["server/server.mjs"]).toContain('"/api/site"');
    expect(site.files["server/server.mjs"]).toContain('"/api/records"');
    expect(site.files["package.json"]).toContain('"start": "node server/server.mjs"');
    expect(site.files["client/index.html"]).toContain('data-themed="dark"');
  });

  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("serves health, site, and records from the generated Node server", async () => {
    const site = generateFullStackSite({
      prompt: "Generate a full-stack portfolio website",
      projectName: "Northline",
    });
    const dir = await mkdtemp(path.join(tmpdir(), "lunor-site-"));
    tempDirs.push(dir);
    for (const [filePath, content] of Object.entries(site.files)) {
      const absolute = path.join(dir, filePath);
      await mkdir(path.dirname(absolute), { recursive: true });
      await writeFile(absolute, content, "utf8");
    }

    const child = spawn(process.execPath, ["server/server.mjs"], {
      cwd: dir,
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let logs = "";
    const port = await new Promise<number>((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`server did not listen\n${logs}`));
      }, 8000);
      child.stdout.on("data", (chunk: Buffer) => {
        logs += chunk.toString();
        const match = logs.match(/listening (\d+)/);
        if (match) {
          clearTimeout(timer);
          resolve(Number(match[1]));
        }
      });
      child.stderr.on("data", (chunk: Buffer) => {
        logs += chunk.toString();
      });
      child.on("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`server exited ${code}\n${logs}`));
      });
    });

    try {
      const base = `http://127.0.0.1:${port}`;
      const health = await fetch(`${base}/api/health`).then((response) => response.json());
      const profile = await fetch(`${base}/api/site`).then((response) => response.json());
      const before = await fetch(`${base}/api/records`).then((response) => response.json());
      const createdResponse = await fetch(`${base}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Keel notes", summary: "A quieter billing view", meta: "Case study" }),
      });
      const created = await createdResponse.json();
      const after = await fetch(`${base}/api/records`).then((response) => response.json());

      expect(health.ok).toBe(true);
      expect(profile.name).toBe("Northline");
      expect(profile.kind).toBe("portfolio");
      expect(before.records.length).toBeGreaterThan(0);
      expect(createdResponse.status).toBe(201);
      expect(created.record.title).toBe("Keel notes");
      expect(after.records[0].title).toBe("Keel notes");
    } finally {
      child.kill();
    }
  }, 15000);
});
