import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebsiteGeneratorPanel } from "@/components/editor/WebsiteGeneratorPanel";
import {
  applyWebsiteFiles,
  generateFullStackWebsite,
  parseWebsiteRequest,
  WEBSITE_TEMPLATES,
} from "@/lib/websiteGenerator";

const REQUIRED = [
  "client/index.html",
  "client/styles.css",
  "client/script.js",
  "server/package.json",
  "server/index.js",
  "server/src/app.js",
  "server/src/config/db.js",
  "server/src/modules/site/site.routes.js",
  "server/src/modules/site/site.controller.js",
  "server/src/modules/site/site.service.js",
  "README.md",
];

function content(path: string, files: { path: string; content: string }[]) {
  return files.find((file) => file.path === path)?.content ?? "";
}

function checkSyntax(name: string, source: string) {
  const dir = mkdtempSync(join(tmpdir(), "lunor-site-"));
  const file = join(dir, name);
  writeFileSync(file, source);
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  expect(result.status, result.stderr).toBe(0);
}

describe("website generator", () => {
  it("builds the express module layout for every template", () => {
    for (const template of WEBSITE_TEMPLATES) {
      const site = generateFullStackWebsite({ templateId: template.id, siteName: template.defaultName });
      expect(site.previewPath).toBe("client/index.html");
      expect(site.files.map((file) => file.path)).toEqual(REQUIRED);
      const html = content("client/index.html", site.files);
      expect(html).toContain('href="styles.css"');
      expect(html).toContain('src="script.js"');
      expect(html).toContain('id="nav-check"');
      expect(html).toContain("data-themed");
      expect(site.siteName).toBe(template.defaultName);
      expect(html).toContain(template.defaultName.replace(/&/g, "&amp;"));
      const routes = content("server/src/modules/site/site.routes.js", site.files);
      expect(routes).toContain('router.get("/health"');
      expect(routes).toContain(`router.get("/${template.listKey}"`);
      expect(routes).toContain(`router.post("/${template.formKey}"`);
      expect(routes).not.toContain("/records");
      const pkg = JSON.parse(content("server/package.json", site.files));
      expect(pkg.scripts.start).toBe("node index.js");
      expect(pkg.dependencies.express).toBeTruthy();
      for (const file of site.files) {
        if (file.language === "javascript") checkSyntax(file.name, file.content);
      }
    }
  });

  it("escapes a site name that contains markup", () => {
    const site = generateFullStackWebsite({ templateId: "saas", siteName: '<script>alert(1)</script>' });
    const html = content("client/index.html", site.files);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(content("client/script.js", site.files)).not.toContain("</script>");
  });

  it("parses assistant requests and ignores explanations", () => {
    expect(parseWebsiteRequest("Build a portfolio website called Northwind")?.templateId).toBe("portfolio");
    expect(parseWebsiteRequest('Create a restaurant website "Basil"')?.siteName).toBe("Basil");
    expect(parseWebsiteRequest("Make a shop website")?.templateId).toBe("shop");
    expect(parseWebsiteRequest("Create a full-stack website")?.templateId).toBe("saas");
    expect(parseWebsiteRequest("Explain how a website works")).toBeNull();
    expect(parseWebsiteRequest("Build a login form")).toBeNull();
  });

  it("upserts generated files into a project tree", () => {
    const site = generateFullStackWebsite({ templateId: "restaurant", siteName: "Basil" });
    const once = applyWebsiteFiles([], site.files);
    const twice = applyWebsiteFiles(once, site.files);
    const client = twice.find((node) => node.id === "client");
    expect(client?.type).toBe("folder");
    expect(client?.children?.filter((child) => child.name === "index.html")).toHaveLength(1);
    const server = twice.find((node) => node.id === "server");
    const src = server?.children?.find((child) => child.name === "src");
    const modules = src?.children?.find((child) => child.name === "modules");
    const siteModule = modules?.children?.find((child) => child.name === "site");
    expect(siteModule?.children?.map((child) => child.name).sort()).toEqual([
      "site.controller.js",
      "site.routes.js",
      "site.service.js",
    ]);
  });

  it("keeps the menu visible and saves the form when the API is offline", async () => {
    const site = generateFullStackWebsite({ templateId: "restaurant", siteName: "Basil & Rye" });
    const parsed = new DOMParser().parseFromString(
      content("client/index.html", site.files).replace(/<script src="script.js"><\/script>/, ""),
      "text/html",
    );
    document.body.innerHTML = parsed.body.innerHTML;
    const fetchMock = vi.fn(() => Promise.resolve(new Response("nope", { status: 404 })));
    vi.stubGlobal("fetch", fetchMock);
    const run = new Function(content("client/script.js", site.files));
    run();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.querySelectorAll("#item-list .card").length).toBeGreaterThan(0);
    expect(document.getElementById("nav-check")).toBeTruthy();
    const form = document.getElementById("site-form") as HTMLFormElement;
    (document.getElementById("field-name") as HTMLInputElement).value = "Ada";
    (document.getElementById("field-email") as HTMLInputElement).value = "ada@basil.test";
    (document.getElementById("field-party") as HTMLInputElement).value = "2";
    (document.getElementById("field-when") as HTMLInputElement).value = "Friday 7pm";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.getElementById("form-status")?.textContent).toMatch(/browser/i);
    vi.unstubAllGlobals();
  });
});

describe("website generator panel", () => {
  it("sends the selected template to the assistant", () => {
    const onGenerate = vi.fn();
    render(
      <WebsiteGeneratorPanel
        theme={{ bg: "#111", card: "#222", border: "#333", text: "#fff", muted: "#aaa", accent: "#0ff" }}
        onGenerate={onGenerate}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Portfolio/ }));
    fireEvent.change(screen.getByLabelText("Site name"), { target: { value: "Northwind" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate website" }));
    expect(onGenerate).toHaveBeenCalledWith({
      templateId: "portfolio",
      siteName: "Northwind",
      tagline: "Selected work, clearly presented.",
    });
  });
});
