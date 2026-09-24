import { describe, expect, it } from "vitest";
import {
  formatWebsiteAssistantMessage,
  generateFullStackWebsite,
  isWebsiteGenerationRequest,
  WEBSITE_GENERATOR_PRESETS,
} from "@/lib/fullStackWebsiteGenerator";

describe("full-stack website generator", () => {
  it("recognizes website requests and ignores small widgets", () => {
    expect(isWebsiteGenerationRequest("Generate a full-stack landing page website for a product called Lumen")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a restaurant website")).toBe(true);
    expect(isWebsiteGenerationRequest("Create a portfolio website")).toBe(true);
    expect(isWebsiteGenerationRequest("Build a counter with HTML, CSS, and JS")).toBe(false);
    expect(isWebsiteGenerationRequest("Explain how CSS grid works")).toBe(false);
  });

  it.each(WEBSITE_GENERATOR_PRESETS)("builds a runnable $id project for $label", (preset) => {
    const site = generateFullStackWebsite(preset.prompt);
    expect(site.kind).toBe(preset.id);
    expect(site.title.length).toBeGreaterThan(1);

    const byName = Object.fromEntries(site.files.map((file) => [file.name, file.content]));
    expect(Object.keys(byName).sort()).toEqual(
      ["README.md", "app.js", "index.html", "package.json", "server.js", "styles.css"].sort(),
    );

    expect(byName["index.html"]).toContain(`<title>${site.title}</title>`);
    expect(byName["index.html"]).toContain('href="styles.css"');
    expect(byName["index.html"]).toContain('src="app.js"');
    expect(byName["app.js"]).not.toMatch(/\brequire\s*\(/);
    expect(byName["app.js"]).not.toContain("lunor-node-server");
    expect(byName["server.js"]).toContain("lunor-node-server");
    expect(byName["server.js"]).toContain('require("express")');
    expect(byName["server.js"]).toContain(site.endpoints[1].path);

    const pkg = JSON.parse(byName["package.json"]);
    expect(pkg.scripts.start).toBe("node src/server.js");
    expect(pkg.dependencies.express).toBeTruthy();
    expect(() => new Function(byName["app.js"])).not.toThrow();
    expect(() => new Function(byName["server.js"])).not.toThrow();

    const message = formatWebsiteAssistantMessage(site);
    expect(message).toContain(site.title);
    expect(message).not.toContain("```");
  });
});
