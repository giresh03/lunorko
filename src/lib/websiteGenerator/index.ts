import { isWebsiteGeneratorRequest, parseWebsiteBrief, WEBSITE_GENERATOR_PRESETS } from "./brief";
import { buildClientCss, buildClientHtml, buildClientJs } from "./codes/client";
import { buildEnvExample, buildPackageJson, buildReadme } from "./codes/project";
import { buildServer, collectionPath } from "./codes/server";
import type { GeneratedFile, GeneratedWebsite, GeneratorFileNode } from "./types";

export { isWebsiteGeneratorRequest, parseWebsiteBrief, WEBSITE_GENERATOR_PRESETS };
export type { GeneratedFile, GeneratedWebsite, GeneratorFileNode, WebsiteBrief, WebsiteKind } from "./types";

export function generateFullStackWebsite(prompt: string): GeneratedWebsite {
  const brief = parseWebsiteBrief(prompt);
  const files: GeneratedFile[] = [
    { path: "src/index.html", language: "html", content: buildClientHtml(brief) },
    { path: "src/style.css", language: "css", content: buildClientCss() },
    { path: "src/app.js", language: "javascript", content: buildClientJs() },
    { path: "server/server.cjs", language: "javascript", content: buildServer(brief) },
    { path: "package.json", language: "json", content: buildPackageJson(brief) },
    { path: "README.md", language: "markdown", content: buildReadme(brief) },
    { path: ".env.example", language: "plaintext", content: buildEnvExample() },
  ];

  const summary = [
    `Built **${brief.name}**, a full-stack ${brief.kind} website.`,
    "",
    "The preview is `src/index.html`. `server/server.cjs` is a Node HTTP server with no packages to install.",
    "",
    "**Files written**",
    ...files.map((file) => `- \`${file.path}\``),
    "",
    "**Run the API**",
    "1. `npm start`",
    "2. Open http://localhost:3000",
    "",
    `\`GET /api/health\`, \`GET /api/site\`, and \`GET ${collectionPath(brief.kind)}\` read the site. \`POST /api/contact\` checks name, email, and message.`,
  ].join("\n");

  return { brief, files, summary };
}

export function generatedFilesToTree(files: GeneratedFile[]): GeneratorFileNode[] {
  const root: GeneratorFileNode[] = [];
  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let level = root;
    let acc = "";
    parts.forEach((part, index) => {
      acc = acc ? `${acc}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = level.find((entry) => entry.name === part);
      if (!node) {
        node = isFile
          ? { id: file.path, name: part, type: "file", language: file.language, content: file.content }
          : { id: acc, name: part, type: "folder", isOpen: true, children: [] };
        level.push(node);
      } else if (isFile) {
        node.content = file.content;
        node.language = file.language;
      }
      if (!isFile) level = node.children || (node.children = []);
    });
  }
  return root;
}
