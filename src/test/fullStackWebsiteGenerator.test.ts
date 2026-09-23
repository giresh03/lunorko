import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import {
  CONTACT_EMAIL_PATTERN,
  WEBSITE_BLUEPRINTS,
  WEBSITE_FILE_PATHS,
  detectWebsiteKind,
  formatWebsiteAssistantMessage,
  generateFullStackWebsite,
  isFullStackWebsitePrompt,
  isValidEmail,
  websiteFilesToTree,
  type WebsiteKind,
} from "@/lib/fullStackWebsiteGenerator";

const kinds = WEBSITE_BLUEPRINTS.map((blueprint) => blueprint.id);

describe("full-stack website generator", () => {
  it.each(kinds)("scaffolds client and Express files for %s", (kind: WebsiteKind) => {
    const site = generateFullStackWebsite({ kind, brief: WEBSITE_BLUEPRINTS.find((item) => item.id === kind)?.samplePrompt });
    const paths = site.files.map((file) => file.path);
    expect(paths).toEqual([...WEBSITE_FILE_PATHS]);

    const html = site.files.find((file) => file.path === "index.html")!.content;
    const css = site.files.find((file) => file.path === "styles.css")!.content;
    const app = site.files.find((file) => file.path === "app.js")!.content;
    const server = site.files.find((file) => file.path === "server/server.js")!.content;
    const routes = site.files.find((file) => file.path === "server/routes.js")!.content;
    const pkg = JSON.parse(site.files.find((file) => file.path === "package.json")!.content);

    expect(html).toContain("<body data-themed>");
    expect(html).toContain("window.__SITE_SEED__");
    expect(html).toContain('href="styles.css"');
    expect(html).toContain('src="app.js"');
    expect(html).not.toMatch(/react|jsx|tsx/i);
    expect(css).toContain(site.seed.heroImage);
    expect(app).toContain("/api/content");
    expect(app).toContain("/api/contact");
    expect(app).toContain("Offline — message kept in this browser");
    expect(server).toContain('app.use("/api", createRouter())');
    expect(server).toContain("express.static");
    expect(routes).toContain('router.get("/health"');
    expect(routes).toContain('router.get("/content"');
    expect(routes).toContain('router.get("/messages"');
    expect(routes).toContain('router.post("/contact"');
    expect(routes).toContain("status(400)");
    expect(routes).toContain(CONTACT_EMAIL_PATTERN.toString());
    expect(pkg.scripts.start).toBe("node server/server.js");
    expect(pkg.dependencies.express).toBeTruthy();
    expect(pkg.type).toBe("module");
  });

  it("turns a coffee-shop brief into a restaurant site", () => {
    const site = generateFullStackWebsite({ brief: "Generate a full-stack website for a coffee shop" });
    expect(site.kind).toBe("restaurant");
    expect(site.title).toBe("Northbean Coffee");
    expect(site.seed.items.some((item) => item.title === "Single Origin Flight")).toBe(true);
    expect(detectWebsiteKind("portfolio for a designer")).toBe("portfolio");
  });

  it("uses a named title and ignores debug prompts", () => {
    const site = generateFullStackWebsite({ brief: 'Build a portfolio website called "Olive Studio"' });
    expect(site.kind).toBe("portfolio");
    expect(site.title).toBe("Olive Studio");
    expect(isFullStackWebsitePrompt("Generate a full-stack website for a coffee shop")).toBe(true);
    expect(isFullStackWebsitePrompt("Create a landing page")).toBe(true);
    expect(isFullStackWebsitePrompt("Fix the portfolio CSS")).toBe(false);
    expect(isFullStackWebsitePrompt("Explain how websites work")).toBe(false);
    expect(isValidEmail("ada@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("builds a file tree with a server folder", () => {
    const site = generateFullStackWebsite({ kind: "blog" });
    const tree = websiteFilesToTree(site.files);
    expect(tree.some((node) => node.name === "index.html" && node.type === "file")).toBe(true);
    const server = tree.find((node) => node.name === "server");
    expect(server?.type).toBe("folder");
    expect(server?.children?.map((child) => child.name).sort()).toEqual(["routes.js", "server.js", "store.js"]);
    expect(formatWebsiteAssistantMessage(site)).toContain("npm start");
    expect(formatWebsiteAssistantMessage(site)).toContain("/api/contact");
  });

  it("renders seeded content and an offline contact status in the browser DOM", async () => {
    const site = generateFullStackWebsite({ brief: "Generate a full-stack website for a coffee shop" });
    const html = site.files.find((file) => file.path === "index.html")!.content;
    const app = site.files.find((file) => file.path === "app.js")!.content;
    const dom = new JSDOM(html.replace('<script src="app.js"></script>', `<script>${app}</script>`), {
      runScripts: "dangerously",
      url: "http://localhost/",
      beforeParse(window) {
        window.fetch = () => Promise.reject(new Error("offline"));
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    const document = dom.window.document;
    expect(document.getElementById("hero-title")?.textContent).toBe("Northbean Coffee");
    expect(document.getElementById("items")?.textContent).toContain("Single Origin Flight");
    expect(document.body.hasAttribute("data-themed")).toBe(true);

    const form = document.getElementById("contact-form") as HTMLFormElement;
    (form.querySelector("[name=name]") as HTMLInputElement).value = "Ada";
    (form.querySelector("[name=email]") as HTMLInputElement).value = "ada@example.com";
    (form.querySelector("[name=message]") as HTMLTextAreaElement).value = "Table for two";
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.getElementById("contact-status")?.textContent).toMatch(/Offline/);

    (form.querySelector("[name=email]") as HTMLInputElement).value = "bad-email";
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    expect(document.getElementById("contact-status")?.textContent).toMatch(/valid email/);
  });
});
