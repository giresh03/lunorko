import { describe, expect, it } from "vitest";
import {
  WEBSITE_AUTOMATIONS,
  filesToFileTree,
  generateFullStackWebsite,
  parseWebsiteRequest,
} from "./websiteGenerator";

describe("website generator", () => {
  it("recognizes a website request and leaves other prompts alone", () => {
    expect(parseWebsiteRequest("explain how flexbox works")).toBeNull();
    expect(parseWebsiteRequest("Build a restaurant website called Harbor & Rye")).toEqual({
      kind: "restaurant",
      name: "Harbor & Rye",
      brief: "Build a restaurant website called Harbor & Rye",
    });
    expect(parseWebsiteRequest('Create a SaaS landing page "Lumen"')?.kind).toBe("saas");
  });

  it.each(WEBSITE_AUTOMATIONS.map((entry) => entry.id))("builds a runnable %s project", (kind) => {
    const site = generateFullStackWebsite({ kind, name: "Test Site <script>", brief: "A brief with <script>alert(1)</script>" });
    const byPath = new Map(site.files.map((file) => [file.path, file.content]));

    expect(byPath.has("client/index.html")).toBe(true);
    expect(byPath.has("client/styles.css")).toBe(true);
    expect(byPath.has("client/script.js")).toBe(true);
    expect(byPath.has("server/index.js")).toBe(true);
    expect(byPath.has("server/src/app.js")).toBe(true);
    expect(byPath.has("server/src/config/db.js")).toBe(true);
    expect(byPath.has("server/src/modules/site/site.routes.js")).toBe(true);
    expect(byPath.has("server/src/modules/site/site.controller.js")).toBe(true);
    expect(byPath.has("server/src/modules/site/site.service.js")).toBe(true);

    const preview = byPath.get("client/index.html") || "";
    expect(preview).toContain("<!DOCTYPE html>");
    expect(preview).toContain('href="styles.css"');
    expect(preview).toContain('src="script.js"');
    expect(preview).not.toContain("<script>alert(1)</script>");
    expect(preview).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");

    const script = byPath.get("client/script.js") || "";
    expect(script).toContain("paint(SEED)");
    expect(script).toContain(`/api/" + LIST_KEY`);

    const routes = byPath.get("server/src/modules/site/site.routes.js") || "";
    expect(routes).toContain('siteRouter.get("/" + LIST_KEY, list)');
    expect(routes).toContain('siteRouter.post("/" + FORM_KEY, create)');

    const app = byPath.get("server/src/app.js") || "";
    expect(app).toContain('app.get("/api/health"');
    expect(app).toContain('app.use("/api", siteRouter)');
    expect(app).not.toContain("/api/records");

    const db = byPath.get("server/src/config/db.js") || "";
    expect(db).toContain("MONGODB_URI");
  });

  it("nests the client preview and the site module", () => {
    const site = generateFullStackWebsite({ kind: "portfolio", name: "Northstar" });
    const tree = filesToFileTree(site.files);
    const client = tree.find((node) => node.id === "client");
    const server = tree.find((node) => node.id === "server");
    expect(client?.children?.some((child) => child.name === "index.html")).toBe(true);
    expect(server?.type).toBe("folder");
    expect(site.listKey).toBe("projects");
    expect(site.formKey).toBe("inquiries");
  });
});
