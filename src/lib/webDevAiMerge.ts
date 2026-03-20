/**
 * Merge AI markdown/code-fenced output into a file tree for Web Dev AI Studio.
 * Mirrors CodeEditor auto-apply behavior (paths, nested folders under src/).
 */

import type { FileNode } from "@/lib/sandpackProject";

export const LANG_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  html: "html",
  css: "css",
  json: "json",
  jsx: "javascript",
  tsx: "typescript",
  md: "markdown",
  txt: "plaintext",
};

export const LANG_EXT_MAP: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  html: "html",
  css: "css",
  json: "json",
  jsx: "jsx",
  tsx: "tsx",
};

export function getLang(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return LANG_MAP[ext] || "plaintext";
}

function generateFileName(language: string, code: string, userPrompt?: string): string {
  const ext =
    LANG_EXT_MAP[LANG_MAP[language] || language] ||
    LANG_EXT_MAP[language] ||
    language ||
    "js";
  if (userPrompt) {
    const p = userPrompt.toLowerCase();
    if (p.includes("todo")) return `TodoApp.${ext === "jsx" ? "jsx" : "jsx"}`;
    if (p.includes("counter")) return `Counter.${ext === "jsx" ? "jsx" : "jsx"}`;
  }
  const classMatch = code.match(/(?:class|function)\s+(\w+)/);
  if (classMatch) {
    const base = classMatch[1].charAt(0).toUpperCase() + classMatch[1].slice(1);
    return `${base}.${ext === "typescript" || ext === "ts" ? "tsx" : "jsx"}`;
  }
  return `App.${ext === "tsx" || ext === "ts" ? "tsx" : ext === "jsx" || ext === "js" ? "jsx" : ext}`;
}

export function extractCodeBlocks(
  markdown: string,
  userPrompt?: string
): { code: string; language: string; filename?: string }[] {
  const regex = /(?:(?:[\*`]*([\w\-./]+\.\w+)[\*`]*\s*:?\s*\n))?```(\w*)\n([\s\S]*?)```/g;
  const blocks: { code: string; language: string; filename?: string }[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const filename = match[1] || undefined;
    const lang = match[2] || "javascript";
    blocks.push({ language: lang, code: match[3].trim(), filename });
  }
  if (blocks.length > 0 && !blocks.some((b) => b.filename)) {
    const filenameRegex = /(?:file(?:name)?|save\s+(?:as|to)|create)\s*:?\s*[`"']?(\w[\w\-./]*\.\w+)[`"']?/gi;
    let fnMatch;
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

export function findFile(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findFile(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

export function updateNode(
  nodes: FileNode[],
  id: string,
  updater: (n: FileNode) => FileNode
): FileNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n);
    if (n.children) return { ...n, children: updateNode(n.children, id, updater) };
    return n;
  });
}

export function addChild(nodes: FileNode[], parentId: string, child: FileNode): FileNode[] {
  return nodes.map((n) => {
    if (n.id === parentId && n.type === "folder") {
      return { ...n, children: [...(n.children || []), child], isOpen: true };
    }
    if (n.children) return { ...n, children: addChild(n.children, parentId, child) };
    return n;
  });
}

/** Ensure folder chain exists (e.g. src, src/components). Returns updated tree. */
export function ensureFolderPath(tree: FileNode[], folderPath: string): FileNode[] {
  const segments = folderPath.split("/").filter(Boolean);
  if (segments.length === 0) return tree;
  let t = [...tree];
  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    acc = acc ? `${acc}/${segments[i]}` : segments[i];
    const id = acc;
    if (!findFile(t, id)) {
      const name = segments[i];
      const parentId = i === 0 ? "" : segments.slice(0, i).join("/");
      const folder: FileNode = {
        id,
        name,
        type: "folder",
        isOpen: true,
        children: [],
      };
      if (parentId) t = addChild(t, parentId, folder);
      else t = [...t, folder];
    }
  }
  return t;
}

export function mergeAiBlocksIntoTree(
  prev: FileNode[],
  blocks: { code: string; language: string; filename?: string }[],
  userPrompt?: string
): FileNode[] {
  if (blocks.length === 0) return prev;
  let tree = [...prev];
  if (!findFile(tree, "src")) {
    tree = [{ id: "src", name: "src", type: "folder", isOpen: true, children: [] }, ...tree];
  }

  for (const block of blocks) {
    const normalizedLang = LANG_MAP[block.language] || block.language;
    const ext = LANG_EXT_MAP[normalizedLang] || block.language || "js";
    let fname = block.filename || generateFileName(block.language, block.code, userPrompt);
    fname = fname.replace(/^\/+/, "");
    if (!fname.startsWith("src/")) fname = `src/${fname}`;

    const segments = fname.split("/").filter(Boolean);
    const fileName = segments[segments.length - 1];
    const folderPath = segments.slice(0, -1).join("/");

    tree = ensureFolderPath(tree, folderPath);
    const fileId = segments.join("/");
    const fileNode: FileNode = {
      id: fileId,
      name: fileName,
      type: "file",
      language: normalizedLang || getLang(fileName),
      content: block.code,
    };

    if (findFile(tree, fileId)) {
      tree = updateNode(tree, fileId, () => fileNode);
    } else {
      tree = addChild(tree, folderPath, fileNode);
    }
  }
  return tree;
}

export function defaultWebDevStarterTree(projectName: string): FileNode[] {
  return [
    {
      id: "src",
      name: "src",
      type: "folder",
      isOpen: true,
      children: [
        {
          id: "src/App.jsx",
          name: "App.jsx",
          type: "file",
          language: "javascript",
          content: `export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#22d3ee' }}>${projectName}</h1>
      <p style={{ color: '#94a3b8' }}>Describe what to build in the prompt bar, then Generate.</p>
    </div>
  );
}
`,
        },
        {
          id: "src/main.jsx",
          name: "main.jsx",
          type: "file",
          language: "javascript",
          content: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
        },
      ],
    },
    {
      id: "package.json",
      name: "package.json",
      type: "file",
      language: "json",
      content: `{
  "name": "${projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}",
  "private": true,
  "version": "0.0.0"
}
`,
    },
  ];
}
