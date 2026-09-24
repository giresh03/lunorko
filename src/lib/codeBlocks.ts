/**
 * Markdown code-block extraction for the in-editor AI assistant.
 * Filenames may be a single name (`app.js`) or a project path (`client/index.html`).
 */

export const LANG_MAP: Record<string, string> = {
  js: "javascript", ts: "typescript", py: "python", html: "html",
  css: "css", json: "json", jsx: "javascript", tsx: "typescript",
  md: "markdown", txt: "plaintext", xml: "xml", yaml: "yaml", yml: "yaml",
  sh: "shell", bash: "shell", sql: "sql",
};

export const LANG_EXT_MAP: Record<string, string> = {
  javascript: "js", typescript: "ts", python: "py", html: "html",
  css: "css", json: "json", jsx: "jsx", tsx: "tsx", xml: "xml",
  yaml: "yaml", shell: "sh", bash: "sh", sql: "sql", markdown: "md",
};

const FILE_PATH = String.raw`(?:[A-Za-z0-9_-]+/)*\.?[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+`;

const ROOT_FILES = new Set(["package.json", "README.md", ".env.example", ".gitignore"]);

export function getLang(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return LANG_MAP[ext] || "plaintext";
}

export function editorPathForGeneratedFile(filename: string): string {
  const clean = filename.replace(/^\.\//, "").replace(/^\/+/, "");
  if (!clean) return "src/untitled.js";
  if (clean.includes("/") || clean.startsWith(".") || ROOT_FILES.has(clean)) return clean;
  return `src/${clean}`;
}

function generateFileName(language: string, code: string, userPrompt?: string): string {
  const ext = LANG_EXT_MAP[language] || LANG_EXT_MAP[LANG_MAP[language] || ""] || language || "js";

  if (userPrompt) {
    const prompt = userPrompt.toLowerCase();
    const patterns = [
      /(?:build|create|make|generate|write|code)\s+(?:a|an|the)?\s*(.+?)(?:\s+(?:page|app|component|form|function|class|module|script|program|website|site|layout))/i,
      /(?:build|create|make|generate|write|code)\s+(?:a|an|the)?\s*(.+)/i,
      /(.+?)(?:\s+(?:page|app|component|form|function|class|module|script|program|website|site|layout))/i,
    ];
    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match?.[1]) {
        const name = match[1]
          .trim()
          .replace(/[^a-z0-9\s]/gi, "")
          .trim()
          .split(/\s+/)
          .slice(0, 3)
          .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("");
        if (name && name.length >= 2) return `${name}.${ext}`;
      }
    }
  }

  const titleMatch = code.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    const name = titleMatch[1].replace(/[^a-z0-9\s]/gi, "").trim().split(/\s+/).slice(0, 3)
      .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    if (name) return `${name}.${ext}`;
  }

  const classMatch = code.match(/(?:class|function)\s+(\w+)/);
  if (classMatch) return `${classMatch[1].charAt(0).toLowerCase() + classMatch[1].slice(1)}.${ext}`;

  return `untitled.${ext}`;
}

export function extractCodeBlocks(markdown: string, userPrompt?: string): { code: string; language: string; filename?: string }[] {
  const regex = new RegExp(
    `(?:(?:[\`*]*(${FILE_PATH})[\`*]*\\s*:?\\s*\\n))?\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\``,
    "g",
  );
  const blocks: { code: string; language: string; filename?: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const filename = match[1] || undefined;
    const lang = match[2] || "javascript";
    blocks.push({ language: lang, code: match[3].trim(), filename });
  }
  if (blocks.length > 0 && !blocks.some((b) => b.filename)) {
    const filenameRegex = new RegExp(
      `(?:file(?:name)?|save\\s+(?:as|to)|create)\\s*:?\\s*[\`"']?(${FILE_PATH})[\`"']?`,
      "gi",
    );
    let fnMatch: RegExpExecArray | null;
    while ((fnMatch = filenameRegex.exec(markdown)) !== null) {
      const unassigned = blocks.find((b) => !b.filename);
      if (unassigned) unassigned.filename = fnMatch[1];
    }
  }
  blocks.forEach((block) => {
    if (!block.filename) {
      block.filename = generateFileName(block.language, block.code, userPrompt);
    }
  });
  return blocks;
}
