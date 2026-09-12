import { useState, useCallback, useImperativeHandle, forwardRef, useMemo, useRef, useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import {
  Play, RotateCcw, Copy, Check, ChevronRight, Loader2, X,
  File, FolderOpen, FolderClosed, Plus, Trash2, FilePlus, FolderPlus,
  Terminal as TerminalIcon, Bot, Send, Minimize2, Settings,
  Search, GitBranch, ArrowRightToLine, Sparkles, PanelRightClose, PanelRightOpen,
  FolderPlus as NewProject, Clock, ChevronDown, Save, FolderInput, FileCode2,
  Eye, EyeOff, RefreshCw, Smartphone, Monitor, Tablet, Palette, Grid3X3, Ruler,
  Maximize2, ExternalLink, TestTube2, BookOpen, Wand2, Download, Github,
  History as HistoryIcon, MousePointerClick, ZoomIn, ZoomOut, Undo2, Redo2, Coins
} from "lucide-react";
import { annotateHtml, applyVisualEdit, VISUAL_EDIT_AGENT, type VisualEditOp } from "@/lib/visualEdit";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import GitHubPushDialog from "@/components/GitHubPushDialog";
import { useGitHub } from "@/hooks/useGitHub";
import ReactMarkdown from "react-markdown";
import { editorThemes, getThemeById, type EditorTheme } from "@/lib/editorThemes";
import { getDomainEnvironment, domainEnvironments } from "@/lib/domainEnvironments";
import {
  syncTemplatesFromImport, getSnippetsForDomain, cacheAIResponse,
  findCachedAIResponse, isOnline, getOfflineStatus, setOfflineMode,
  type CachedSnippet,
} from "@/lib/offlineCache";
import RunLocallyDialog from "@/components/editor/RunLocallyDialog";
import SandpackPreviewPanel from "@/components/editor/SandpackPreviewPanel";
import LiveBackendPanel from "@/components/editor/LiveBackendPanel";
import { useLiveRuntime } from "@/hooks/useLiveRuntime";
import { injectApiShim, filesNeedBackend } from "@/lib/liveRuntime";
import { hasJSX } from "@/lib/sandpackProject";
import { scaffoldPage } from "@/lib/siteScaffold";
import VoiceAssistant from "@/components/editor/VoiceAssistant";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useCredits } from "@/hooks/useCredits";
import GenerationHistoryPanel from "@/components/editor/GenerationHistoryPanel";
import {
  getHistory, addHistoryEntry, deleteHistoryEntry, clearHistory, isFullStackFiles,
  type GenerationEntry,
} from "@/lib/generationHistory";
import {
  PREVIEW_SELF_TEST_SCRIPT, SELF_TEST_TIMEOUT_MS, summarizeResults, type SelfTestResult,
} from "@/lib/previewSelfTest";


// -- Preview runtime guard: sandbox-safe storage + error reporting --
const PREVIEW_RUNTIME_GUARD = `<script id="__lunor_guard">(function(){
  if (window.__lunorGuard) return; window.__lunorGuard = true;
  function memStore(){
    var m = {};
    return {
      getItem: function(k){ return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
      setItem: function(k, v){ m[k] = String(v); },
      removeItem: function(k){ delete m[k]; },
      clear: function(){ m = {}; },
      key: function(i){ return Object.keys(m)[i] || null; },
      get length(){ return Object.keys(m).length; }
    };
  }
  ['localStorage','sessionStorage'].forEach(function(name){
    var ok = false;
    try { var s = window[name]; s.setItem('__lunor_probe','1'); s.removeItem('__lunor_probe'); ok = true; } catch(e) { ok = false; }
    if (!ok) { try { Object.defineProperty(window, name, { value: memStore(), configurable: true, writable: true }); } catch(e) {} }
  });
  function report(m, s){
    try { parent.postMessage({ __lunorPreview: true, type: 'error', message: String(m || 'Unknown error'), stack: String(s || '') }, '*'); } catch(e) {}
  }
  // Only genuine script failures are reported. Missing images/fonts, console.error
  // noise and non-200 responses are NOT treated as app errors.
  window.addEventListener('error', function(e){
    if (e && e.target && e.target !== window && e.target.tagName) return;
    if (e && e.message) report(e.message, e.error && e.error.stack);
  }, true);
  window.addEventListener('unhandledrejection', function(e){ var r = e && e.reason; report((r && r.message) || r || 'Unhandled promise rejection', r && r.stack); });
})();<\/script>`;

function injectRuntimeGuard(html: string): string {
  if (!html || html.includes("__lunor_guard")) return html;
  const injected = PREVIEW_RUNTIME_GUARD + PREVIEW_SELF_TEST_SCRIPT;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + injected);
  if (/<body[^>]*>/i.test(html)) return html.replace(/<body[^>]*>/i, (m) => m + injected);
  return injected + html;
}


// -- Project types --
interface SavedProject {
  id: string;
  name: string;
  domain: string;
  fileTree: FileNode[];
  lastOpened: number;
  createdAt: number;
}

const PROJECTS_KEY = "lunor-ai-projects";

function getSavedProjects(): SavedProject[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");
  } catch { return []; }
}

function saveProject(project: SavedProject) {
  const projects = getSavedProjects().filter(p => p.id !== project.id);
  projects.unshift(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects.slice(0, 20)));
}

function deleteProject(id: string) {
  const projects = getSavedProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}


// Build a FileNode tree from a flat path/content snapshot (used by generation history)
function buildTreeFromSnapshot(files: { path: string; language?: string; content: string }[]): FileNode[] {
  const root: FileNode[] = [];
  files.forEach((f) => {
    const parts = f.path.split("/").filter(Boolean);
    let level = root;
    let prefix = "";
    parts.forEach((part, idx) => {
      prefix = prefix ? `${prefix}/${part}` : part;
      if (idx === parts.length - 1) {
        if (!level.some((n) => n.id === prefix)) {
          level.push({ id: prefix, name: part, type: "file", language: f.language || getLang(part), content: f.content });
        }
      } else {
        let folder = level.find((n) => n.id === prefix && n.type === "folder");
        if (!folder) {
          folder = { id: prefix, name: part, type: "folder", isOpen: true, children: [] };
          level.push(folder);
        }
        folder.children = folder.children || [];
        level = folder.children;
      }
    });
  });
  return root;
}

// -- Project templates --
const PROJECT_TEMPLATES = [
  { id: "blank", name: "Blank Project", description: "Empty project with a single file", icon: "📄" },
  { id: "web-app", name: "Web Application", description: "HTML, CSS, JS starter", icon: "🌐" },
  { id: "node-api", name: "Node.js API", description: "Express-style API boilerplate", icon: "🔧" },
  { id: "react", name: "React App", description: "React component boilerplate", icon: "⚛️" },
];

function createProjectFromTemplate(templateId: string, projectName: string, domain: string): FileNode[] {
  switch (templateId) {
    case "blank":
      return [{ id: "main.js", name: "main.js", type: "file", language: "javascript", content: `// ${projectName}\n// ${domain}\n\nconsole.log("Hello, World!");\n` }];
    case "web-app":
      return [
        { id: "src", name: "src", type: "folder", isOpen: true, children: [
          { id: "src/index.html", name: "index.html", type: "file", language: "html", content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${projectName}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>${projectName}</h1>\n  <script src="app.js"></script>\n</body>\n</html>` },
          { id: "src/style.css", name: "style.css", type: "file", language: "css", content: `/* ${projectName} styles */\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody {\n  font-family: 'Inter', sans-serif;\n  background: #0a0a1a;\n  color: #eee;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\nh1 { color: #00d4aa; }\n` },
          { id: "src/app.js", name: "app.js", type: "file", language: "javascript", content: `// ${projectName} - App\nconsole.log("${projectName} loaded!");\n\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("DOM ready!");\n});\n` },
        ]},
        { id: "package.json", name: "package.json", type: "file", language: "json", content: `{\n  "name": "${projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}",\n  "version": "1.0.0"\n}\n` },
      ];
    case "node-api":
      return [
        { id: "src", name: "src", type: "folder", isOpen: true, children: [
          { id: "src/server.js", name: "server.js", type: "file", language: "javascript", content: `// ${projectName} - Server\nconst http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({ message: 'Hello from ${projectName}!' }));\n});\n\nconst PORT = 3000;\nserver.listen(PORT, () => {\n  console.log(\`Server running on port \${PORT}\`);\n});\n` },
          { id: "src/routes.js", name: "routes.js", type: "file", language: "javascript", content: `// Route handlers\n\nmodule.exports = {\n  getHealth: (req, res) => res.json({ status: 'ok' }),\n  getUsers: (req, res) => res.json({ users: [] }),\n};\n` },
        ]},
        { id: "package.json", name: "package.json", type: "file", language: "json", content: `{\n  "name": "${projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}",\n  "version": "1.0.0",\n  "main": "src/server.js",\n  "scripts": { "start": "node src/server.js" }\n}\n` },
      ];
    case "react":
      return [
        { id: "src", name: "src", type: "folder", isOpen: true, children: [
          { id: "src/App.jsx", name: "App.jsx", type: "file", language: "javascript", content: `import React, { useState } from 'react';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="app">\n      <h1>${projectName}</h1>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>Increment</button>\n    </div>\n  );\n}\n\nexport default App;\n` },
          { id: "src/index.jsx", name: "index.jsx", type: "file", language: "javascript", content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n` },
          { id: "src/App.css", name: "App.css", type: "file", language: "css", content: `.app {\n  text-align: center;\n  padding: 2rem;\n}\n\nh1 { color: #00d4aa; }\n\nbutton {\n  padding: 0.5rem 1rem;\n  background: #00d4aa;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 1rem;\n}\n` },
        ]},
        { id: "package.json", name: "package.json", type: "file", language: "json", content: `{\n  "name": "${projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}",\n  "version": "1.0.0",\n  "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0" }\n}\n` },
      ];
    default:
      return createDefaultProject(domain);
  }
}

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

interface OpenTab {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// -- Language helpers --
const LANG_MAP: Record<string, string> = {
  js: "javascript", ts: "typescript", py: "python", html: "html",
  css: "css", json: "json", jsx: "javascript", tsx: "typescript",
  md: "markdown", txt: "plaintext", xml: "xml", yaml: "yaml", yml: "yaml",
  sh: "shell", bash: "shell", sql: "sql",
};
const getLang = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return LANG_MAP[ext] || "plaintext";
};
const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const colors: Record<string, string> = {
    js: "text-yellow-400", ts: "text-primary", py: "text-green-400",
    html: "text-orange-400", css: "text-primary", json: "text-yellow-300",
    jsx: "text-primary", tsx: "text-primary", md: "text-muted-foreground",
  };
  return colors[ext] || "text-muted-foreground";
};

// -- Default project structure --
const createDefaultProject = (domainName: string): FileNode[] => {
  const domainId = domainName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const env = getDomainEnvironment(domainId);

  // Build file tree from domain environment templates
  const templateChildren: FileNode[] = env.templateFiles.map((f) => ({
    id: `src/${f.name}`,
    name: f.name,
    type: "file" as const,
    language: f.language,
    content: f.content,
  }));

  // Add domain-specific starter code as main file if not already in templates
  const hasMainFile = templateChildren.some((f) => f.name === env.defaultFileName);
  if (!hasMainFile) {
    templateChildren.unshift({
      id: `src/${env.defaultFileName}`,
      name: env.defaultFileName,
      type: "file",
      language: env.primaryLanguage,
      content: env.starterCode,
    });
  }

  return [
    {
      id: "src", name: "src", type: "folder", isOpen: true,
      children: templateChildren,
    },
    {
      id: "public", name: "public", type: "folder", isOpen: false,
      children: [
        { id: "public/index.html", name: "index.html", type: "file", language: "html",
          content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${domainName} - Lunor.AI</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>` },
      ],
    },
    { id: "package.json", name: "package.json", type: "file", language: "json",
      content: `{\n  "name": "${domainName.toLowerCase().replace(/[^a-z0-9]/g, "-")}",\n  "version": "1.0.0",\n  "description": "${domainName} project on Lunor.AI",\n  "main": "src/${env.defaultFileName}"\n}\n` },
    { id: "README.md", name: "README.md", type: "file", language: "markdown",
      content: `# ${domainName}\n\nWelcome to your ${domainName} workspace on **Lunor.AI**.\n\n## Environment\n- **Primary Language:** ${env.primaryLanguage}\n- **Supported:** ${env.supportedLanguages.join(", ")}\n- **Runtime:** ${env.runtime === "native" ? "⚡ Native execution" : "🤖 AI-simulated execution"}\n\n## Getting Started\n\n1. Edit files in the explorer\n2. Run code with the play button (supports ${env.supportedLanguages.join(", ")})\n3. Ask the AI assistant for help\n` },
  ];
};

// -- Extract code blocks from markdown with filename detection --
const LANG_EXT_MAP: Record<string, string> = {
  javascript: "js", typescript: "ts", python: "py", html: "html",
  css: "css", json: "json", jsx: "jsx", tsx: "tsx", xml: "xml",
  yaml: "yaml", shell: "sh", bash: "sh", sql: "sql", markdown: "md",
};

// Generate a descriptive filename from the user's prompt and code content
function generateFileName(language: string, code: string, userPrompt?: string): string {
  const ext = LANG_EXT_MAP[language] || LANG_EXT_MAP[LANG_MAP[language] || ""] || language || "js";
  
  // Try to extract a meaningful name from the prompt
  if (userPrompt) {
    const prompt = userPrompt.toLowerCase();
    // Common patterns: "build a login page", "create a todo app", "make a calculator"
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
  
  // Try to extract name from code content (e.g., title tag, class name, function name)
  const titleMatch = code.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    const name = titleMatch[1].replace(/[^a-z0-9\s]/gi, "").trim().split(/\s+/).slice(0, 3)
      .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    if (name) return `${name}.${ext}`;
  }
  
  const classMatch = code.match(/(?:class|function)\s+(\w+)/);
  if (classMatch) return `${classMatch[1].charAt(0).toLowerCase() + classMatch[1].slice(1)}.${ext}`;
  
  // Fallback with readable name
  return `untitled.${ext}`;
}

function extractCodeBlocks(markdown: string, userPrompt?: string): { code: string; language: string; filename?: string }[] {
  // Match code blocks, and look for filename hints in the line before the code block
  const regex = /(?:(?:[\*`]*([\w./-]*\w\.\w+)[\*`]*\s*:?\s*\n))?```(\w*)\n([\s\S]*?)```/g;
  const blocks: { code: string; language: string; filename?: string }[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const filename = match[1] || undefined;
    const lang = match[2] || "javascript";
    blocks.push({ language: lang, code: match[3].trim(), filename });
  }
  // If no filenames found via regex, try to detect from common patterns like "<!-- filename: xxx -->" or "// filename: xxx"
  if (blocks.length > 0 && !blocks.some(b => b.filename)) {
    const filenameRegex = /(?:file(?:name)?|save\s+(?:as|to)|create)\s*:?\s*[`"']?([\w./-]*\w\.\w+)[`"']?/gi;
    let fnMatch;
    while ((fnMatch = filenameRegex.exec(markdown)) !== null) {
      const unassigned = blocks.find(b => !b.filename);
      if (unassigned) unassigned.filename = fnMatch[1];
    }
  }
  // Generate proper filenames for blocks that still don't have one
  blocks.forEach((block) => {
    if (!block.filename) {
      block.filename = generateFileName(block.language, block.code, userPrompt);
    }
  });
  return blocks;
}

// Flatten a file tree into a list of real files (path + content)
function flattenFiles(nodes: FileNode[]): { path: string; name: string; content: string; language?: string }[] {
  const out: { path: string; name: string; content: string; language?: string }[] = [];
  const walk = (ns: FileNode[]) => {
    for (const n of ns) {
      if (n.type === "file") out.push({ path: n.id, name: n.name, content: n.content ?? "", language: n.language });
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

// Map a filename returned by the AI onto an EXISTING project file when possible,
// so follow-up prompts edit the current build instead of creating duplicates.
function resolveTargetPath(
  filename: string,
  language: string,
  existing: { path: string; name: string; language?: string }[]
): string {
  const clean = filename.replace(/^\.?\//, "");
  const base = clean.split("/").pop() || clean;

  // 1. Exact path match
  const byPath = existing.find((f) => f.path === clean || f.path === `src/${clean}`);
  if (byPath) return byPath.path;

  // 2. Same basename anywhere in the tree (prefer src/)
  const byName = existing
    .filter((f) => f.name.toLowerCase() === base.toLowerCase())
    .sort((a, b) => (a.path.startsWith("src/") ? -1 : 1) - (b.path.startsWith("src/") ? -1 : 1));
  if (byName[0]) return byName[0].path;

  // 3. Untitled/generic name but a single existing file of the same extension → edit that file
  const ext = base.split(".").pop()?.toLowerCase() || "";
  const isGeneric = /^(untitled|index|main|app|script|style|styles)\./i.test(base);
  if (ext) {
    const sameExt = existing.filter((f) => f.name.toLowerCase().endsWith(`.${ext}`));
    if (isGeneric && sameExt.length === 1) {
      return sameExt[0].path;
    }
  }

  // 4. New file → place under src/
  return clean.startsWith("src/") ? clean : `src/${base}`;

}


// -- File Explorer Item --
interface FileItemProps {
  node: FileNode; depth: number; activeFileId: string | null;
  onSelect: (node: FileNode) => void; onToggle: (id: string) => void;
  onDelete: (id: string) => void; onRename: (id: string, name: string) => void;
  themeColors: EditorTheme["uiColors"];
}

const FileItem = ({
  node, depth, activeFileId, onSelect, onToggle, onDelete, onRename, themeColors,
}: FileItemProps) => {
  const isActive = node.id === activeFileId;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(node.name);
  };

  const handleRename = () => {
    if (editName.trim() && editName !== node.name) onRename(node.id, editName.trim());
    setIsEditing(false);
  };

  return (
    <div>
      <div
        className="group flex items-center gap-1 px-2 py-[3px] cursor-pointer text-xs transition-colors"
        style={{
          paddingLeft: `${depth * 12 + 8}px`,
          backgroundColor: isActive ? `${themeColors.accent}20` : "transparent",
          color: isActive ? themeColors.accent : themeColors.text,
        }}
        onClick={() => node.type === "folder" ? onToggle(node.id) : onSelect(node)}
        onDoubleClick={handleDoubleClick}
      >
        {node.type === "folder" ? (
          <>
            <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${node.isOpen ? "rotate-90" : ""}`} style={{ color: themeColors.muted }} />
            {node.isOpen ? <FolderOpen className="h-3.5 w-3.5 shrink-0" style={{ color: themeColors.accent }} /> : <FolderClosed className="h-3.5 w-3.5 shrink-0" style={{ color: themeColors.muted }} />}
          </>
        ) : (
          <>
            <span className="w-3" />
            <File className={`h-3.5 w-3.5 shrink-0 ${getFileIcon(node.name)}`} />
          </>
        )}
        {isEditing ? (
          <input
            autoFocus value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setIsEditing(false); }}
            className="flex-1 rounded px-1 text-xs outline-none"
            style={{ backgroundColor: themeColors.bg, borderColor: themeColors.border, color: themeColors.text, border: `1px solid ${themeColors.border}` }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5" style={{ color: themeColors.muted }}>
          <X className="h-3 w-3" />
        </button>
      </div>
      {node.type === "folder" && node.isOpen && node.children?.map((child) => (
        <FileItem key={child.id} node={child} depth={depth + 1} activeFileId={activeFileId} onSelect={onSelect} onToggle={onToggle} onDelete={onDelete} onRename={onRename} themeColors={themeColors} />
      ))}
    </div>
  );
};

// -- Main Component --
export interface CodeEditorHandle {
  setExternalCode: (code: string, language: string) => void;
}

interface IDEProps {
  domainName: string;
  onSendToEditor?: (code: string, language: string) => void;
  onExit?: () => void;
}

const CODE_ENGINE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/code-engine`;
const AUTH_REQUIRED_ERROR = "AUTH_REQUIRED";

function isAuthRequiredError(error: unknown) {
  return error instanceof Error && error.message === AUTH_REQUIRED_ERROR;
}

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error(AUTH_REQUIRED_ERROR);
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function fetchCodeEngine(body: Record<string, unknown>) {
  const resp = await fetch(CODE_ENGINE_URL, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (resp.status === 401) {
    throw new Error(AUTH_REQUIRED_ERROR);
  }

  return resp;
}

const RESPONSIVE_CHECKLIST = [
  { id: "safe-area", label: "Safe area insets handled", hint: "Use SafeAreaView or env(safe-area-inset-*) for notch/home indicator" },
  { id: "font-scale", label: "Dynamic font scaling supported", hint: "Use rem/sp units, avoid fixed px for text sizes" },
  { id: "landscape", label: "Landscape orientation works", hint: "Test rotated layout — scrollable containers, flex-wrap" },
  { id: "small-screen", label: "Works on 320px width (iPhone SE)", hint: "Check text truncation, button tap targets ≥44px" },
  { id: "tablet-layout", label: "Tablet layout optimized", hint: "Use split-view or wider grids for 744px+ screens" },
  { id: "touch-targets", label: "Touch targets ≥ 44×44pt", hint: "Buttons, links, checkboxes must be easily tappable" },
  { id: "keyboard", label: "Keyboard avoidance handled", hint: "Inputs scroll into view when keyboard appears" },
  { id: "dark-mode", label: "Dark mode colors tested", hint: "Check contrast ratios meet WCAG AA (4.5:1 for text)" },
  { id: "loading-states", label: "Loading/skeleton states shown", hint: "Show skeletons or spinners during data fetches" },
  { id: "offline", label: "Offline fallback provided", hint: "Show cached data or friendly message when offline" },
];

const LAYOUT_SUGGESTIONS = [
  { id: "stack", icon: "📱", label: "Stack Layout", desc: "Vertical scroll", prompt: "Generate a React Native ScrollView with a vertical stack layout using SafeAreaView, proper padding, and responsive spacing" },
  { id: "grid", icon: "🔲", label: "Responsive Grid", desc: "Adaptive columns", prompt: "Generate a responsive grid layout that shows 2 columns on phones and 3 on tablets using FlatList numColumns or flexbox" },
  { id: "tabs", icon: "📑", label: "Tab Navigation", desc: "Bottom tabs", prompt: "Generate a React Native bottom tab navigator with 4 tabs, icons, and proper safe area handling" },
  { id: "drawer", icon: "☰", label: "Drawer + Stack", desc: "Side menu", prompt: "Generate a React Native drawer navigator with a hamburger menu and nested stack screens" },
  { id: "card-list", icon: "🃏", label: "Card List", desc: "Scrollable cards", prompt: "Generate a scrollable card list with pull-to-refresh, image thumbnails, and responsive card sizing" },
  { id: "form", icon: "📝", label: "Adaptive Form", desc: "Keyboard-aware", prompt: "Generate a keyboard-aware form with TextInput fields, validation, and proper spacing that adapts to screen size" },
];

const CodeEditorComponent = forwardRef<CodeEditorHandle, IDEProps>(({ domainName, onExit }, ref) => {
  const { credits, refetch: refetchCredits } = useCredits();
  const initialWorkspace = useMemo(() => {
    const saved = getSavedProjects()
      .filter((project) => project.domain === domainName && project.fileTree.length > 0)
      .sort((a, b) => b.lastOpened - a.lastOpened)[0];
    const tree = saved?.fileTree || createDefaultProject(domainName);
    const findFirstHtml = (nodes: FileNode[]): FileNode | null => {
      for (const node of nodes) {
        if (node.type === "file" && (node.language === "html" || node.name.endsWith(".html"))) return node;
        if (node.children) {
          const match = findFirstHtml(node.children);
          if (match) return match;
        }
      }
      return null;
    };
    const firstHtml = findFirstHtml(tree);
    return { saved, tree, firstHtml };
  }, [domainName]);
  // File tree state
  const [fileTree, setFileTree] = useState<FileNode[]>(initialWorkspace.tree);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => initialWorkspace.firstHtml ? [{
    id: initialWorkspace.firstHtml.id,
    name: initialWorkspace.firstHtml.name,
    language: initialWorkspace.firstHtml.language || getLang(initialWorkspace.firstHtml.name),
    content: initialWorkspace.firstHtml.content || "",
    isModified: false,
  }] : []);
  const [activeTabId, setActiveTabId] = useState<string | null>(initialWorkspace.firstHtml?.id || null);

  // Panels
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"files" | "search" | "snippets" | "lessons" | "history">("files");
  const [genHistory, setGenHistory] = useState<GenerationEntry[]>(() => getHistory());
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showGitHub, setShowGitHub] = useState(false);
  const { status: githubStatus, push: githubPush } = useGitHub();
  const [online, setOnline] = useState(isOnline());

  // Sync offline cache on mount
  useEffect(() => {
    syncTemplatesFromImport(domainEnvironments);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  const domainId = useMemo(() => domainName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), [domainName]);
  const snippets = useMemo(() => getSnippetsForDomain(domainId), [domainId]);
  const [output, setOutput] = useState<string[]>(["$ Ready."]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  type DevicePreset = "iphone-se" | "iphone-15" | "pixel-8" | "ipad-mini" | "ipad-pro" | "android-tab" | "desktop";
  const DEVICE_PRESETS: Record<DevicePreset, { label: string; w: number; h: number; type: "phone" | "tablet" | "desktop"; notch: "dynamic-island" | "notch" | "punch-hole" | "none" }> = {
    "iphone-se": { label: "iPhone SE", w: 320, h: 568, type: "phone", notch: "none" },
    "iphone-15": { label: "iPhone 15 Pro", w: 393, h: 852, type: "phone", notch: "dynamic-island" },
    "pixel-8": { label: "Pixel 8", w: 412, h: 915, type: "phone", notch: "punch-hole" },
    "ipad-mini": { label: "iPad Mini", w: 744, h: 1133, type: "tablet", notch: "none" },
    "ipad-pro": { label: 'iPad Pro 11"', w: 834, h: 1194, type: "tablet", notch: "none" },
    "android-tab": { label: "Android Tablet", w: 800, h: 1280, type: "tablet", notch: "none" },
    "desktop": { label: "Desktop", w: 0, h: 0, type: "desktop", notch: "none" },
  };
  const [previewDevice, setPreviewDevice] = useState<DevicePreset>(() => {
    const id = domainName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return id === "app-development" ? "iphone-15" : "desktop";
  });
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [debugOverlay, setDebugOverlay] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  type VisualSnapshot = { fileId: string; fileName: string; before: string; after: string; kind: string };
  const [visualEditMode, setVisualEditMode] = useState(false);
  const [visualUndo, setVisualUndo] = useState<VisualSnapshot[]>([]);
  const [visualRedo, setVisualRedo] = useState<VisualSnapshot[]>([]);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({});
  const currentDevice = DEVICE_PRESETS[previewDevice];
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipPreviewRebuildRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Live backend (hosted runtime) — provisioned per user + domain when the
  // project contains server code or /api calls. Paid plans only.
  const projectNeedsBackend = useMemo(() => {
    const flat: { path: string; content: string }[] = [];
    const walk = (nodes: FileNode[], prefix = "") => {
      for (const n of nodes) {
        const p = prefix ? `${prefix}/${n.name}` : n.name;
        if (n.type === "file") flat.push({ path: p, content: n.content || "" });
        if (n.children) walk(n.children, p);
      }
    };
    walk(fileTree);
    return filesNeedBackend(flat);
  }, [fileTree]);
  const liveRuntime = useLiveRuntime({
    scope: "domain",
    scopeKey: domainId,
    name: domainName,
    enabled: projectNeedsBackend,
  });
  const liveApiUrlRef = useRef<string | null>(null);
  liveApiUrlRef.current = liveRuntime.apiUrl;

  // Preview runtime errors reported by the sandboxed iframe
  const [previewError, setPreviewError] = useState<{ message: string; stack?: string } | null>(null);
  const [resolvingError, setResolvingError] = useState(false);
  const previewErrorLogRef = useRef<string[]>([]);
  const verifyPendingRef = useRef(false);
  const setPreview = useCallback((html: string) => {
    setPreviewError(null);
    previewErrorLogRef.current = [];
    setPreviewContent(injectApiShim(injectRuntimeGuard(html), liveApiUrlRef.current));
  }, []);

  // Re-inject the shim into the current preview once the backend comes online.
  useEffect(() => {
    if (!liveRuntime.apiUrl) return;
    setPreviewContent((html) => (html && !html.includes("data-lunor-runtime") ? injectApiShim(html, liveRuntime.apiUrl) : html));
  }, [liveRuntime.apiUrl]);

  // Automated verification: does the app actually load and does login work?
  const [verify, setVerify] = useState<{ running: boolean; results: SelfTestResult[] } | null>(null);
  const selfTestResolveRef = useRef<((r: SelfTestResult[]) => void) | null>(null);
  const verificationMessageRef = useRef(false);
  const autoRepairRoundsRef = useRef(0);




  const runSelfTest = useCallback((): Promise<SelfTestResult[]> => {
    verificationMessageRef.current = false;
    setVerify({ running: true, results: [] });
    return new Promise<SelfTestResult[]>((resolve) => {
      let settled = false;
      const finish = (results: SelfTestResult[]) => {
        if (settled) return;
        settled = true;
        selfTestResolveRef.current = null;
        setVerify({ running: false, results });
        resolve(results);
      };
      selfTestResolveRef.current = finish;
      const frame = iframeRef.current;
      if (!frame?.contentWindow) {
        finish([{ id: "load", label: "App loads and renders", passed: false, detail: "Preview frame is not available" }]);
        return;
      }
      try {
        frame.contentWindow.postMessage({ __lunorSelfTest: "run" }, "*");
      } catch {
        finish([{ id: "load", label: "App loads and renders", passed: false, detail: "Could not reach the preview frame" }]);
        return;
      }
      setTimeout(() => {
        finish([{ id: "load", label: "App loads and renders", passed: false, detail: "The app did not respond within the check window (likely a blank screen or a crash during startup)" }]);
      }, SELF_TEST_TIMEOUT_MS);
    });
  }, []);

  // Start verification after the newly generated iframe has mounted.
  useEffect(() => {
    if (!verifyPendingRef.current || !showPreview || !previewContent) return;
    verifyPendingRef.current = false;
    const timer = setTimeout(() => { void runSelfTest(); }, 700);
    return () => clearTimeout(timer);
  }, [previewContent, showPreview, runSelfTest]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as {
        __lunorPreview?: boolean; type?: string; message?: string; stack?: string;
        __lunorSelfTest?: boolean | string; results?: SelfTestResult[];
      } | null;
      if (d && d.__lunorSelfTest === true && Array.isArray(d.results)) {
        selfTestResolveRef.current?.(d.results);
        return;
      }
      if (d && d.__lunorPreview && d.type === "error" && d.message) {
        setPreviewError({ message: d.message, stack: d.stack });
        const entry = d.message + (d.stack ? ` | ${d.stack.slice(0, 400)}` : "");
        const log = previewErrorLogRef.current;
        if (!log.includes(entry)) {
          log.push(entry);
          if (log.length > 8) log.shift();
        }
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);


  // Theme state
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => localStorage.getItem("lunor-editor-theme") || "vs-dark");
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const currentTheme = useMemo(() => getThemeById(currentThemeId), [currentThemeId]);
  const themesRegistered = useRef(false);

  // Register custom Monaco themes on mount
  useEffect(() => {
    if (themesRegistered.current) return;
    loader.init().then((monaco) => {
      editorThemes.forEach((t) => {
        if (!t.isBuiltin && t.definition) {
          monaco.editor.defineTheme(t.monacoTheme, t.definition as any);
        }
      });
      themesRegistered.current = true;
    });
  }, []);

  const handleThemeChange = useCallback((theme: EditorTheme) => {
    setCurrentThemeId(theme.id);
    localStorage.setItem("lunor-editor-theme", theme.id);
    setShowThemeMenu(false);
  }, []);

  // Project management
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => initialWorkspace.saved?.id || `proj-${Date.now()}`);
  const [currentProjectName, setCurrentProjectName] = useState<string>(() => initialWorkspace.saved?.name || `${domainName} Workspace`);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectTemplate, setNewProjectTemplate] = useState("web-app");
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [recentProjects, setRecentProjects] = useState<SavedProject[]>(() => getSavedProjects());

  // AI Chat
  const [selectedModel, setSelectedModel] = useState<string>(() => localStorage.getItem("lunor-ai-model") || "google/gemini-3-flash-preview");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `👋 I'm your **${domainName}** AI assistant — like Lovable! Ask me to:\n\n- **Generate code** — it auto-updates in the editor\n- **Debug** — paste code and I'll fix it\n- **Explain concepts** — with examples\n- **Install packages** — I'll show you how\n\nCode I generate is **automatically applied** to your files. 🚀` },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Ghost text state
  const ghostTextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const monacoEditorRef = useRef<any>(null);
  const ghostDisposableRef = useRef<any>(null);


  // New file/folder input
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [newItemName, setNewItemName] = useState("");

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const activeTabRef = useRef(activeTab);
  const activeTabIdRef = useRef(activeTabId);

  useEffect(() => {
    activeTabRef.current = activeTab;
    activeTabIdRef.current = activeTabId;
  }, [activeTab, activeTabId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useImperativeHandle(ref, () => ({
    setExternalCode: (code: string, lang: string) => {
      const id = `untitled-${Date.now()}`;
      const ext = LANG_EXT_MAP[lang] || (lang === "typescript" ? "ts" : lang === "python" ? "py" : lang === "html" ? "html" : lang === "css" ? "css" : "js");
      const name = `untitled.${ext}`;
      const tab: OpenTab = { id, name, language: lang, content: code, isModified: true };
      setOpenTabs((prev) => [...prev, tab]);
      setActiveTabId(id);
    },
  }));

  // -- File tree helpers --
  const updateNode = useCallback((nodes: FileNode[], id: string, updater: (n: FileNode) => FileNode): FileNode[] => {
    return nodes.map((n) => {
      if (n.id === id) return updater(n);
      if (n.children) return { ...n, children: updateNode(n.children, id, updater) };
      return n;
    });
  }, []);

  const removeNode = useCallback((nodes: FileNode[], id: string): FileNode[] => {
    return nodes.filter((n) => n.id !== id).map((n) => n.children ? { ...n, children: removeNode(n.children, id) } : n);
  }, []);

  const addChild = useCallback((nodes: FileNode[], parentId: string, child: FileNode): FileNode[] => {
    return nodes.map((n) => {
      if (n.id === parentId && n.type === "folder") return { ...n, children: [...(n.children || []), child], isOpen: true };
      if (n.children) return { ...n, children: addChild(n.children, parentId, child) };
      return n;
    });
  }, []);

  const findFile = useCallback((nodes: FileNode[], id: string): FileNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) { const f = findFile(n.children, id); if (f) return f; }
    }
    return null;
  }, []);

  const handleSelectFile = (node: FileNode) => {
    if (node.type !== "file") return;
    const existing = openTabs.find((t) => t.id === node.id);
    if (!existing) {
      setOpenTabs((prev) => [...prev, { id: node.id, name: node.name, language: node.language || getLang(node.name), content: node.content || "", isModified: false }]);
    }
    setActiveTabId(node.id);
  };

  const handleToggleFolder = (id: string) => {
    setFileTree((prev) => updateNode(prev, id, (n) => ({ ...n, isOpen: !n.isOpen })));
  };

  const handleDeleteNode = (id: string) => {
    setFileTree((prev) => removeNode(prev, id));
    setOpenTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTabId === id) setActiveTabId(openTabs.find((t) => t.id !== id)?.id || null);
  };

  const handleRenameNode = (id: string, newName: string) => {
    setFileTree((prev) => updateNode(prev, id, (n) => ({ ...n, name: newName })));
    setOpenTabs((prev) => prev.map((t) => t.id === id ? { ...t, name: newName, language: getLang(newName) } : t));
  };

  const handleCreateItem = () => {
    if (!newItemName.trim()) { setNewItemParent(null); return; }
    const id = `${newItemParent || "root"}/${newItemName.trim()}`;
    const child: FileNode = newItemType === "folder"
      ? { id, name: newItemName.trim(), type: "folder", children: [], isOpen: false }
      : { id, name: newItemName.trim(), type: "file", language: getLang(newItemName.trim()), content: "" };
    if (newItemParent) {
      setFileTree((prev) => addChild(prev, newItemParent, child));
    } else {
      setFileTree((prev) => [...prev, child]);
    }
    if (child.type === "file") handleSelectFile(child);
    setNewItemParent(null);
    setNewItemName("");
  };

  const handleCloseTab = (id: string) => {
    setOpenTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTabId === id) {
      const remaining = openTabs.filter((t) => t.id !== id);
      setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  // Collect all file contents from the tree (for injecting CSS/JS into preview)
  // Stores by both name and full path; src/ files take priority over public/ for same name
  const collectFiles = useCallback((nodes: FileNode[]): Record<string, string> => {
    const files: Record<string, string> = {};
    const walk = (ns: FileNode[]) => {
      for (const n of ns) {
        if (n.type === "file" && n.content) {
          // Store by full path id
          files[n.id] = n.content;
          // Store by name — prefer src/ files (first occurrence wins since src is walked first)
          if (!files[n.name]) files[n.name] = n.content;
        }
        if (n.children) walk(n.children);
      }
    };
    walk(nodes);
    return files;
  }, []);

  // Build an app preview HTML for JS/JSX/React code (app-development domain)
  const buildAppPreviewHtml = useCallback((code: string, language: string, allFiles: Record<string, string>) => {
    const allCss = Object.entries(allFiles)
      .filter(([name]) => name.endsWith(".css"))
      .map(([name, content]) => `/* ${name} */\n${content}`)
      .join("\n");
    // Replace lucide-react imports with shim (so icons like ShoppingBag work)
    let processedCode = code.replace(
      /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]\s*;?/g,
      (_, names) => names.split(",").map((n: string) => n.trim()).filter(Boolean)
        .map((n: string) => `const ${n} = window.${n} || window._iconProxy?.${n} || (p=>React.createElement('span',{style:{width:(p?.size||16)+'px',height:(p?.size||16)+'px',fontSize:'10px',border:'1px dashed #555',borderRadius:'2px',color:'#888'}},'⬡'));`)
        .join("\n")
    );
    const strippedCode = processedCode
      .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "")
      .replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, "")
      .replace(/^\s*export\s+(default\s+)?/gm, "");
    const hasJSX = /<\w+[\s/>]/.test(code);
    // Find the main component: prefer PascalCase function/const (not ALL_CAPS constants)
    const componentMatches = strippedCode.match(/(?:function|const)\s+([A-Z][a-z]\w*)/g);
    const componentName = componentMatches
      ? componentMatches[componentMatches.length - 1].replace(/^(function|const)\s+/, "")
      : (code.match(/(?:function|const)\s+(\w+)/) || [])[1] || "App";

    if (hasJSX) {
      return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; color: #e0e0e0; min-height: 100vh; }
.app { padding: 16px; }
button { padding: 8px 16px; border-radius: 8px; border: none; background: #ef4444; color: white; font-size: 14px; cursor: pointer; margin: 4px; }
button:active { opacity: 0.8; }
input, textarea { padding: 8px 12px; border-radius: 8px; border: 1px solid #333; background: #1a1a2e; color: #e0e0e0; font-size: 14px; width: 100%; margin: 4px 0; }
select { padding: 8px 12px; border-radius: 8px; border: 1px solid #333; background: #1a1a2e; color: #e0e0e0; font-size: 14px; }
h1 { font-size: 24px; margin-bottom: 12px; } h2 { font-size: 20px; margin-bottom: 8px; } h3 { font-size: 16px; margin-bottom: 6px; }
p { font-size: 14px; line-height: 1.5; margin-bottom: 8px; }
img { max-width: 100%; border-radius: 8px; }
a { color: #f87171; text-decoration: none; }
.error-boundary { padding: 16px; background: #1a0000; border: 1px solid #ff4444; border-radius: 8px; margin: 16px; }
.error-boundary h3 { color: #ff6b6b; margin-bottom: 8px; }
.error-boundary pre { font-size: 11px; color: #ff9999; white-space: pre-wrap; word-break: break-all; }
${allCss}
</style>
</head><body>
<div id="root"></div>
<script>
// React Native component shims — map RN components to HTML equivalents
window.View = (props) => React.createElement('div', {...props, style: {display:'flex', flexDirection:'column', padding: props?.style?.padding || '16px', ...props?.style}}, props?.children);
window.Text = (props) => React.createElement('span', {...props, style: {fontSize:'14px', color:'#e0e0e0', ...props?.style}}, props?.children);
window.TouchableOpacity = (props) => React.createElement('button', {...props, onClick: props?.onPress, style: {background:'transparent', border:'none', color:'inherit', padding:0, cursor:'pointer', opacity: 1, ...props?.style}}, props?.children);
window.Pressable = (props) => React.createElement('button', {...props, onClick: props?.onPress, style: {background:'transparent', border:'none', color:'inherit', padding:0, cursor:'pointer', ...props?.style}}, props?.children);
window.TextInput = (props) => React.createElement('input', {type:'text', placeholder: props?.placeholder, value: props?.value, onChange: (e) => props?.onChangeText?.(e.target.value), style: {padding:'8px 12px', borderRadius:'8px', border:'1px solid #333', background:'#1a1a2e', color:'#e0e0e0', fontSize:'14px', width:'100%', ...props?.style}});
window.ScrollView = (props) => React.createElement('div', {...props, style: {overflowY:'auto', flex:1, ...props?.style}}, props?.children);
window.FlatList = (props) => React.createElement('div', {style: props?.style}, props?.data?.map?.((item, index) => props?.renderItem?.({item, index})));
window.Image = (props) => React.createElement('img', {src: props?.source?.uri || props?.source, alt: '', style: {maxWidth:'100%', ...props?.style}});
window.SafeAreaView = (props) => React.createElement('div', {...props, style: {padding:'44px 0 34px', ...props?.style}}, props?.children);
window.StatusBar = () => null;
window.StyleSheet = { create: (s) => s, flatten: (s) => Object.assign({}, ...(Array.isArray(s) ? s : [s])) };
window.Alert = { alert: (title, msg) => window.alert(title + (msg ? '\\n' + msg : '')) };
window.Dimensions = { get: () => ({width: window.innerWidth, height: window.innerHeight}) };
window.Platform = { OS: 'web', select: (o) => o.web || o.default || o.ios };
window.ActivityIndicator = (props) => React.createElement('div', {style:{textAlign:'center', padding:'20px', color: props?.color || '#ef4444'}}, '⏳ Loading...');
window.Switch = (props) => React.createElement('input', {type:'checkbox', checked: props?.value, onChange: (e) => props?.onValueChange?.(e.target.checked), style:{width:'40px', height:'20px', cursor:'pointer'}});
window.Modal = (props) => props?.visible ? React.createElement('div', {style:{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}, React.createElement('div', {style:{background:'#1e1e2e',borderRadius:'12px',padding:'20px',maxWidth:'90%',maxHeight:'90%',overflow:'auto'}}, props?.children)) : null;
window.KeyboardAvoidingView = (props) => React.createElement('div', props, props?.children);
// React Native Button shim
window.Button = (props) => React.createElement('button', {onClick: props?.onPress, disabled: props?.disabled, style: {padding:'10px 20px', borderRadius:'8px', border:'none', background: props?.color || '#ef4444', color:'white', fontSize:'14px', cursor:'pointer', opacity: props?.disabled ? 0.5 : 1, margin:'4px'}}, props?.title || 'Button');
window.TouchableHighlight = (props) => React.createElement('button', {...props, onClick: props?.onPress, style: {background:'transparent', border:'none', color:'inherit', padding:0, cursor:'pointer', ...props?.style}}, props?.children);
window.TouchableWithoutFeedback = (props) => React.createElement('div', {...props, onClick: props?.onPress, style: {cursor:'pointer', ...props?.style}}, props?.children);
window.SectionList = (props) => React.createElement('div', {style: props?.style}, props?.sections?.map?.((section, si) => React.createElement('div', {key:si}, props?.renderSectionHeader?.({section}), section.data?.map?.((item, index) => props?.renderItem?.({item, index, section})))));
window.Animated = { View: (props) => React.createElement('div', props, props?.children), Text: (props) => React.createElement('span', props, props?.children), Image: (props) => React.createElement('img', {src: props?.source?.uri, alt:'', style: props?.style}), Value: function(v){this._value=v;this.setValue=function(n){this._value=n};this.interpolate=function(){return ''};}, timing: function(){return {start:function(cb){cb&&cb({finished:true})}}}, spring: function(){return {start:function(cb){cb&&cb({finished:true})}}}, parallel: function(){return {start:function(cb){cb&&cb({finished:true})}}}, sequence: function(){return {start:function(cb){cb&&cb({finished:true})}}} };
// Navigation shim
window.useNavigation = () => ({ navigate: (s) => console.log('Navigate to:', s), goBack: () => console.log('Go back'), push: (s) => console.log('Push:', s) });
window.useRoute = () => ({ params: {} });
// AsyncStorage shim
window.AsyncStorage = { getItem: (k) => Promise.resolve(localStorage.getItem(k)), setItem: (k,v) => Promise.resolve(localStorage.setItem(k,v)), removeItem: (k) => Promise.resolve(localStorage.removeItem(k)) };

// Lucide-react icon shim — creates simple SVG icon components for any icon name
const _iconSvgs = {
  Plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  Minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  X: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  Trash2: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  ArrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  ArrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  ChevronRight: '<polyline points="9 18 15 12 9 6"/>',
  ChevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  ChevronDown: '<polyline points="6 9 12 15 18 9"/>',
  ChevronUp: '<polyline points="18 15 12 9 6 15"/>',
  Check: '<polyline points="20 6 9 17 4 12"/>',
  Search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  Heart: '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21.3l7.8-7.8 1-1.1a5.5 5.5 0 000-7.8z"/>',
  Star: '<polygon points="12 2 15.1 8.3 22 9.2 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.2 8.9 8.3 12 2"/>',
  ShoppingCart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/>',
  ShoppingBag: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
  Home: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  User: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  Settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06"/>',
  Mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>',
  Bell: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
  Eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  EyeOff: '<path d="M17.9 17.9A10.1 10.1 0 0112 20c-7 0-11-8-11-8a18.5 18.5 0 015.1-5.9M9.9 4.2A9.1 9.1 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.2 3.2"/><line x1="1" y1="1" x2="23" y2="23"/>',
  Menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  Calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  MapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
  Phone: '<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.1 2 2 0 014.1 2h3a2 2 0 012 1.7 12.8 12.8 0 00.7 2.8 2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5 12.8 12.8 0 002.8.7 2 2 0 011.7 2z"/>',
  Camera: '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
  Download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  Upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  Share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>',
  Edit: '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  Trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
  Filter: '<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/>',
  Send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  Bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>',
  RefreshCw: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.5 9a9 9 0 0114.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0020.5 15"/>',
  LogOut: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  Lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
  Unlock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/>',
};
const _mkIcon = (name, svg) => {
  window[name] = (props) => React.createElement('svg', {
    xmlns:'http://www.w3.org/2000/svg', width: props?.size||24, height: props?.size||24,
    viewBox:'0 0 24 24', fill:'none', stroke: props?.color||'currentColor',
    strokeWidth: props?.strokeWidth||2, strokeLinecap:'round', strokeLinejoin:'round',
    style: props?.style, className: props?.className,
    dangerouslySetInnerHTML: {__html: svg}
  });
};
Object.entries(_iconSvgs).forEach(([n,s]) => _mkIcon(n, s));
// Proxy fallback: any unknown icon becomes a small □ placeholder
window._iconProxy = new Proxy({}, { get: (_, name) => {
  if (window[name]) return window[name];
  return (props) => React.createElement('span', {style:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:(props?.size||16)+'px',height:(props?.size||16)+'px',fontSize:'10px',border:'1px dashed #555',borderRadius:'2px',color:'#888'}}, '⬡');
}});
<\/script>
<script type="text/babel" data-type="module">
const { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, Fragment } = React;

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {className:'error-boundary'}, 
        React.createElement('h3', null, '⚠️ Render Error'),
        React.createElement('pre', null, this.state.error?.message || 'Unknown error'),
        React.createElement('button', {onClick: () => this.setState({hasError:false, error:null}), style:{marginTop:'8px',padding:'6px 12px',fontSize:'12px'}}, 'Try Again')
      );
    }
    return this.props.children;
  }
}

${strippedCode}

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(ErrorBoundary, null, React.createElement(${componentName})));
} catch(e) {
  document.getElementById('root').innerHTML = '<div class="error-boundary"><h3>⚠️ Initialization Error</h3><pre>' + e.message + '</pre></div>';
}
<\/script>
</body></html>`;
    }

    return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'SF Mono', 'Fira Code', monospace; background: #0f0f23; color: #e0e0e0; padding: 16px; font-size: 13px; }
.log-line { padding: 2px 0; white-space: pre-wrap; word-break: break-all; border-bottom: 1px solid #1a1a2e; }
.error { color: #ff6b6b; } .warn { color: #fbbf24; }
h3 { color: #ef4444; margin-bottom: 8px; font-size: 14px; }
${allCss}
</style>
</head><body>
<h3>📱 App Output</h3>
<div id="output"></div>
<script>
const output = document.getElementById('output');
const _log = console.log;
const addLine = (text, cls) => { const d = document.createElement('div'); d.className = 'log-line ' + (cls||''); d.textContent = text; output.appendChild(d); };
console.log = (...args) => { addLine(args.map(a => typeof a === 'object' ? JSON.stringify(a,null,2) : String(a)).join(' ')); _log(...args); };
console.error = (...args) => { addLine('ERROR ' + args.map(String).join(' '), 'error'); };
console.warn = (...args) => { addLine('WARN ' + args.map(String).join(' '), 'warn'); };
try {
${strippedCode}
} catch(e) { addLine('ERROR ' + e.message, 'error'); }
if(!output.children.length) addLine('Code executed successfully (no output)');
<\/script>
</body></html>`;
  }, []);

  // Assemble one HTML page with sibling CSS/JS injected inline (no nav shim)
  const assemblePage = useCallback((htmlContent: string, allFiles: Record<string, string>, pageName = "index.html") => {
    // Scaffold shared assets + site nav BEFORE inlining, so injected tags get inlined too
    let html = scaffoldPage(pageName, htmlContent, allFiles);


    // Inject a base visible style so content is never invisible against iframe bg
    const baseStyle = `<style id="__preview-base">body:not([data-themed]) { background: #ffffff; color: #1a1a1a; }</style>`;
    if (html.includes("</head>")) {
      html = html.replace("</head>", `${baseStyle}</head>`);
    } else if (html.includes("<body")) {
      html = html.replace("<body", `${baseStyle}<body`);
    } else {
      html = baseStyle + html;
    }

    // Track which CSS/JS files were already referenced and injected
    const injectedFiles = new Set<string>();
    const scaffolded = html;
    const lookup = (fileName: string): string | undefined => {
      if (allFiles[fileName] != null) return allFiles[fileName];
      const key = Object.keys(allFiles).find((k) => (k.split("/").pop() || k) === fileName);
      return key ? allFiles[key] : undefined;
    };

    // Find referenced CSS files and inject inline if they exist in the project
    const cssLinkRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi;
    let cssMatch;
    while ((cssMatch = cssLinkRegex.exec(scaffolded)) !== null) {
      const cssFileName = cssMatch[1].split("/").pop() || "";
      const cssContent = lookup(cssFileName);
      if (cssContent != null) {
        html = html.replace(cssMatch[0], `<style>/* ${cssFileName} */\n${cssContent}</style>`);
        injectedFiles.add(cssFileName);
      }
    }

    // Find referenced JS files and inject inline if they exist in the project
    const jsScriptRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi;
    let jsMatch;
    while ((jsMatch = jsScriptRegex.exec(scaffolded)) !== null) {
      const jsFileName = jsMatch[1].split("/").pop() || "";
      const jsContent = lookup(jsFileName);
      if (jsContent != null) {
        html = html.replace(jsMatch[0], `<script>/* ${jsFileName} */\n${jsContent}<\/script>`);
        injectedFiles.add(jsFileName);
      }
    }


    // Also inject any remaining CSS/JS files that weren't explicitly referenced
    const remainingCss = Object.entries(allFiles)
      .filter(([name]) => name.endsWith(".css") && !injectedFiles.has(name) && !name.includes("/"))
      .map(([name, content]) => `<style>/* ${name} */\n${content}</style>`)
      .join("\n");
    const remainingJs = Object.entries(allFiles)
      .filter(([name]) => /\.(js|ts)$/.test(name) && !injectedFiles.has(name) && !name.includes("/") && !name.endsWith(".html"))
      .map(([name, content]) => `<script>/* ${name} */\n${content}<\/script>`)
      .join("\n");

    if (remainingCss) {
      if (html.includes("</head>")) {
        html = html.replace("</head>", `${remainingCss}\n</head>`);
      } else if (html.includes("</body>")) {
        html = html.replace("</body>", `${remainingCss}\n</body>`);
      } else {
        html = remainingCss + html;
      }
    }
    if (remainingJs) {
      if (html.includes("</body>")) {
        html = html.replace("</body>", `${remainingJs}\n</body>`);
      } else {
        html += remainingJs;
      }
    }

    return injectRuntimeGuard(html);
  }, []);

  // Build a full HTML document for preview, with multi-page in-iframe navigation
  const buildPreviewHtml = useCallback((htmlContent: string, allFiles: Record<string, string>, currentPage?: string) => {
    // Identify which project page this content belongs to (so nav marks it active)
    const activeName =
      (currentPage && (currentPage.split("/").pop() || currentPage)) ||
      Object.keys(allFiles).find((n) => n.endsWith(".html") && allFiles[n] === htmlContent)?.split("/").pop() ||
      "index.html";
    let html = assemblePage(htmlContent, allFiles, activeName);

    // Multi-page navigation: pre-assemble every sibling .html page and swap in-iframe
    const pageNames = Object.keys(allFiles).filter((n) => n.endsWith(".html"));
    if (pageNames.length > 1) {
      const pages: Record<string, string> = {};
      for (const name of pageNames) {
        const short = name.split("/").pop() || name;
        const pageHtml = assemblePage(allFiles[name], allFiles, short);
        pages[short] = btoa(unescape(encodeURIComponent(pageHtml)));
      }

      const shim = `<script>(function(){
  var PAGES = ${JSON.stringify(pages)};
  function nav(name){
    var encoded = PAGES[name];
    if(!encoded) return;
    var doc = decodeURIComponent(escape(atob(encoded)));
    document.open(); document.write(doc); document.close();
    if (window.__attachPreviewNav) window.__attachPreviewNav();
  }
  window.__attachPreviewNav = function(){
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if(!a) return;
      var href = (a.getAttribute('href')||'').split('#')[0].split('?')[0];
      if(!href) return;
      var name = href.split('/').pop();
      if(!name || !PAGES[name]) return;
      e.preventDefault();
      nav(name);
    }, true);
  };
  window.__previewNavigate = nav;
  window.__attachPreviewNav();
})();<\/script>`;
      if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, `${shim}</body>`);
      } else {
        html += shim;
      }
    }

    return html;
  }, [assemblePage]);


  const isAppDomain = domainId === "app-development";

  // Update preview content with debouncing
  // Build a vanilla JS preview by finding the project's HTML and injecting JS + CSS
  const buildVanillaJsPreview = useCallback((jsCode: string, allFiles: Record<string, string>) => {
    // Collect all CSS from project
    const allCss = Object.entries(allFiles)
      .filter(([name]) => name.endsWith(".css"))
      .map(([, content]) => content)
      .join("\n");

    // Extract all getElementById references to auto-create missing elements
    const idRefs = [...jsCode.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
    const queryRefs = [...jsCode.matchAll(/querySelector\(['"]#([^'"]+)['"]\)/g)].map(m => m[1]);
    const allIds = [...new Set([...idRefs, ...queryRefs])];

    // Find the project's HTML file to use as a shell
    const htmlFile = allFiles["index.html"] || Object.entries(allFiles).find(([name]) => name.endsWith(".html"))?.[1];

    if (htmlFile) {
      let html = htmlFile;
      // Check which referenced IDs are missing from the HTML
      const missingIds = allIds.filter(id => !html.includes(`id="${id}"`) && !html.includes(`id='${id}'`));
      
      if (missingIds.length > 0) {
        // Create placeholder elements for missing IDs
        const placeholders = missingIds.map(id => `  <div id="${id}"></div>`).join("\n");
        // Inject before </body> or at end of body content
        if (html.includes("</body>")) {
          html = html.replace("</body>", `${placeholders}\n</body>`);
        } else {
          html += placeholders;
        }
      }

      // Inject base visible background so content isn't invisible
      const baseStyle = `<style id="__preview-base">body:not([data-themed]) { background: #ffffff; color: #1a1a1a; }</style>`;
      if (html.includes("</head>")) {
        html = html.replace("</head>", `${baseStyle}</head>`);
      } else {
        html = baseStyle + html;
      }
      // Remove existing script/link refs so we inject fresh
      html = html.replace(/<link[^>]+href=["'][^"']+\.css["'][^>]*>/gi, "");
      html = html.replace(/<script[^>]+src=["'][^"']+\.js["'][^>]*><\/script>/gi, "");
      // Inject CSS before </head> or at start
      const cssTag = `<style>${allCss}</style>`;
      if (html.includes("</head>")) {
        html = html.replace("</head>", `${cssTag}</head>`);
      } else {
        html = cssTag + html;
      }
      // Inject ALL JS files (not just active) so DOM references work
      const allJs = Object.entries(allFiles)
        .filter(([name]) => /\.(js|ts)$/.test(name) && name !== activeTab?.name)
        .map(([name, content]) => `/* ${name} */\n${content}`)
        .join("\n");
      const jsTag = `<script>${allJs}\n/* ${activeTab?.name || "active"} */\n${jsCode}<\/script>`;
      if (html.includes("</body>")) {
        html = html.replace("</body>", `${jsTag}</body>`);
      } else {
        html += jsTag;
      }
      return html;
    }

    // No HTML file found — create a DOM-ready shell with auto-detected elements
    const elementDivs = allIds.map(id => `<div id="${id}"></div>`).join("\n");
    return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; color: #e0e0e0; min-height: 100vh; padding: 16px; }
button { padding: 8px 16px; border-radius: 8px; border: none; background: #ef4444; color: white; font-size: 14px; cursor: pointer; margin: 4px; }
button:active { opacity: 0.8; }
input, textarea { padding: 8px 12px; border-radius: 8px; border: 1px solid #333; background: #1a1a2e; color: #e0e0e0; font-size: 14px; width: 100%; margin: 4px 0; }
h1 { font-size: 24px; margin-bottom: 12px; color: #ef4444; }
h2 { font-size: 20px; margin-bottom: 8px; }
p { font-size: 14px; line-height: 1.5; margin-bottom: 8px; }
${allCss}
</style>
</head><body>
<div id="root"></div>
<div id="app"></div>
${elementDivs}
<div id="output"></div>
<script>
try {
${jsCode}
} catch(e) {
  document.body.innerHTML += '<div style="padding:16px;background:#1a0000;border:1px solid #ff4444;border-radius:8px;margin:16px;"><h3 style="color:#ff6b6b">⚠️ Runtime Error</h3><pre style="color:#ff9999;font-size:12px;white-space:pre-wrap">' + e.message + '</pre></div>';
}
<\/script>
</body></html>`;
  }, [activeTab?.name]);

  const updatePreview = useCallback(() => {
    if (!activeTab || !showPreview) return;
    const allFiles = collectFiles(fileTree);
    const isHtml = activeTab.language === "html" || activeTab.name.endsWith(".html");
    const isJsLike = ["javascript", "typescript"].includes(activeTab.language) || /\.(js|jsx|ts|tsx)$/.test(activeTab.name);
    const hasJSXContent = /<\w+[\s/>]/.test(activeTab.content) && /\breturn\s*[\s(]/.test(activeTab.content);
    const usesDOM = /document\.|getElementById|querySelector|innerHTML|addEventListener/.test(activeTab.content);
    const filesList = Object.entries(allFiles).map(([path, content]) => ({ path, content }));
    const isReactProject = hasJSX(filesList);

    if (isHtml) {
      const src = visualEditMode ? annotateHtml(activeTab.content) : activeTab.content;
      let html = buildPreviewHtml(src, allFiles, activeTab.name);
      if (visualEditMode) {
        html = /<\/body>/i.test(html)
          ? html.replace(/<\/body>/i, `${VISUAL_EDIT_AGENT}</body>`)
          : html + VISUAL_EDIT_AGENT;
      }
      setPreview(html);
    } else if (isJsLike && hasJSXContent) {
      setPreview(buildAppPreviewHtml(activeTab.content, activeTab.language, allFiles));
    } else if (isAppDomain && isJsLike) {
      setPreview(buildAppPreviewHtml(activeTab.content, activeTab.language, allFiles));
    } else if (isJsLike && usesDOM) {
      // Vanilla JS with DOM usage — render in an HTML shell with DOM available
      setPreview(buildVanillaJsPreview(activeTab.content, allFiles));
    } else if (isJsLike) {
      // Pure JS without DOM — run and capture console output
      setPreview(buildAppPreviewHtml(activeTab.content, activeTab.language, allFiles));
    }
  }, [activeTab, showPreview, fileTree, collectFiles, buildPreviewHtml, buildAppPreviewHtml, buildVanillaJsPreview, isAppDomain, visualEditMode]);

  // Hard refresh: rebuild the document AND remount the iframe (works even when nothing changed)
  const hardRefreshPreview = useCallback(() => {
    setPreviewError(null);
    setPreviewKey((k) => k + 1);
    updatePreview();
  }, [updatePreview]);

  const copyPreviewHtml = useCallback(() => {
    if (!previewContent) return;
    navigator.clipboard.writeText(previewContent).then(() => toast.success("Preview HTML copied"));
  }, [previewContent]);

  const downloadPreviewHtml = useCallback(() => {
    if (!previewContent) return;
    const blob = new Blob([previewContent], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (activeTab?.name || "preview").replace(/\.[^.]+$/, "") + ".html";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Page downloaded");
  }, [previewContent, activeTab?.name]);


  // Debounced preview update when content or active tab changes
  useEffect(() => {
    if (!showPreview || !activeTab) return;
    if (skipPreviewRebuildRef.current) { skipPreviewRebuildRef.current = false; return; }
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(updatePreview, 300);
    return () => { if (previewTimerRef.current) clearTimeout(previewTimerRef.current); };
  }, [activeTabId, activeTab?.content, showPreview, updatePreview]);

  // Auto-open preview when switching to HTML/JS file OR when content changes
  useEffect(() => {
    if (!activeTab) return;
    const isHtml = activeTab.language === "html" || activeTab.name.endsWith(".html");
    const isJsLike = ["javascript", "typescript"].includes(activeTab.language) || /\.(js|jsx|ts|tsx)$/.test(activeTab.name);
    if (isHtml || isJsLike) {
      setShowPreview(true);
    }
  }, [activeTabId, activeTab?.content, isAppDomain]);

  const handleCodeChange = (val: string | undefined) => {
    if (!activeTabId) return;
    setOpenTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, content: val || "", isModified: true } : t));
    setFileTree((prev) => updateNode(prev, activeTabId, (n) => ({ ...n, content: val || "" })));
  };

  // Write a specific content string into a file + its open tab
  const writeFileContent = useCallback((fileId: string, name: string, content: string) => {
    setFileTree((prev) => updateNode(prev, fileId, (n) => ({ ...n, content })));
    setOpenTabs((prev) => prev.some((t) => t.id === fileId)
      ? prev.map((t) => t.id === fileId ? { ...t, content, isModified: true } : t)
      : [...prev, { id: fileId, name, language: getLang(name), content, isModified: true }]);
    if (activeTabIdRef.current === fileId && activeTabRef.current) {
      activeTabRef.current = { ...activeTabRef.current, content, isModified: true };
    }
  }, [updateNode]);

  const pushVisualSnapshot = useCallback((snap: VisualSnapshot) => {
    setVisualUndo((s) => [...s.slice(-49), snap]);
    setVisualRedo([]);
  }, []);

  const undoVisualEdit = useCallback(() => {
    setVisualUndo((stack) => {
      const snap = stack[stack.length - 1];
      if (!snap) { toast.info("Nothing to undo"); return stack; }
      writeFileContent(snap.fileId, snap.fileName, snap.before);
      setVisualRedo((r) => [...r, snap]);
      toast.success(`Undid ${snap.kind} in ${snap.fileName}`);
      return stack.slice(0, -1);
    });
  }, [writeFileContent]);

  const redoVisualEdit = useCallback(() => {
    setVisualRedo((stack) => {
      const snap = stack[stack.length - 1];
      if (!snap) { toast.info("Nothing to redo"); return stack; }
      writeFileContent(snap.fileId, snap.fileName, snap.after);
      setVisualUndo((u) => [...u, snap]);
      toast.success(`Redid ${snap.kind} in ${snap.fileName}`);
      return stack.slice(0, -1);
    });
  }, [writeFileContent]);

  // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z while Visual Edit is active
  useEffect(() => {
    if (!visualEditMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redoVisualEdit(); else undoVisualEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visualEditMode, undoVisualEdit, redoVisualEdit]);

  // Cursor / drag-and-drop edits made inside the preview -> patch the real source file
  useEffect(() => {
    const onEdit = (e: MessageEvent) => {
      const d = e.data as { __lunorVisualEdit?: boolean; op?: VisualEditOp } | null;
      const currentTab = activeTabRef.current;
      const currentId = activeTabIdRef.current;
      if (!d || !d.__lunorVisualEdit || !d.op || !currentId || !currentTab) return;
      if (iframeRef.current?.contentWindow && e.source !== iframeRef.current.contentWindow) return;
      const next = applyVisualEdit(currentTab.content, d.op);
      if (next && next !== currentTab.content) {
        if (d.op.kind !== "move" && d.op.kind !== "delete") skipPreviewRebuildRef.current = true;
        const updatedTab = { ...currentTab, content: next, isModified: true };
        pushVisualSnapshot({ fileId: currentId, fileName: currentTab.name, before: currentTab.content, after: next, kind: d.op.kind });
        activeTabRef.current = updatedTab;
        setOpenTabs((prev) => prev.map((t) => t.id === currentId ? updatedTab : t));
        setFileTree((prev) => updateNode(prev, currentId, (n) => ({ ...n, content: next })));
        toast.success(`${currentTab.name} updated (${d.op.kind})`);
      } else if (d.op.kind === "text" && d.op.previous && d.op.previous !== d.op.value) {
        const previousText = d.op.previous;
        const nextText = d.op.value;
        const candidates: FileNode[] = [];
        const visit = (nodes: FileNode[]) => {
          nodes.forEach((node) => {
            if (node.type === "folder") visit(node.children || []);
            else if (/\.(html?|jsx?|tsx?)$/i.test(node.name) && (node.content?.split(previousText).length || 0) === 2) candidates.push(node);
          });
        };
        visit(fileTree);
        if (candidates.length === 1) {
          const owner = candidates[0];
          const ownerContent = owner.content || "";
          const updatedContent = ownerContent.replace(previousText, nextText);
          pushVisualSnapshot({ fileId: owner.id, fileName: owner.name, before: ownerContent, after: updatedContent, kind: "dynamic text" });
          setFileTree((prev) => updateNode(prev, owner.id, (node) => ({ ...node, content: updatedContent })));
          setOpenTabs((prev) => prev.some((tab) => tab.id === owner.id)
            ? prev.map((tab) => tab.id === owner.id ? { ...tab, content: updatedContent, isModified: true } : tab)
            : [...prev, { id: owner.id, name: owner.name, language: owner.language || getLang(owner.name), content: updatedContent, isModified: true }]);
          activeTabRef.current = { id: owner.id, name: owner.name, language: owner.language || getLang(owner.name), content: updatedContent, isModified: true };
          activeTabIdRef.current = owner.id;
          setActiveTabId(owner.id);
          skipPreviewRebuildRef.current = true;
          toast.success(`${owner.name} updated (dynamic text)`);
        } else {
          toast.error(candidates.length > 1 ? "That text appears in multiple files; edit it in code." : "Could not locate this dynamic text in project source.");
        }
      }
    };
    window.addEventListener("message", onEdit);
    return () => window.removeEventListener("message", onEdit);
  }, [fileTree, updateNode, pushVisualSnapshot]);


  // Auto-apply code to editor — Lovable style: direct apply, no diff review
  const applyCodeToEditor = useCallback((code: string, language: string, filename?: string) => {
    const activeLanguage = activeTab?.language;
    const normalizedLang = LANG_MAP[language] || language;
    const langMatches = activeLanguage === normalizedLang || activeLanguage === language;

    if (activeTabId && langMatches && !filename) {
      // Same language — update active file directly
      setOpenTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, content: code, isModified: true } : t));
      setFileTree((prev) => updateNode(prev, activeTabId, (n) => ({ ...n, content: code })));
    } else {
      // Different language or explicit filename — create new file
      const ext = LANG_EXT_MAP[normalizedLang] || LANG_EXT_MAP[language] || language || "js";
      const newName = filename || `untitled-${Date.now().toString(36)}.${ext}`;
      const newId = `src/${newName}`;
      const newNode: FileNode = { id: newId, name: newName, type: "file", language: normalizedLang || getLang(newName), content: code };
      const newTab: OpenTab = { id: newId, name: newName, language: normalizedLang || getLang(newName), content: code, isModified: true };
      setFileTree((prev) => {
        const srcFolder = prev.find(n => n.id === "src" && n.type === "folder");
        if (srcFolder) return addChild(prev, "src", newNode);
        return [...prev, newNode];
      });
      setOpenTabs((prev) => [...prev, newTab]);
      setActiveTabId(newId);
    }
  }, [activeTabId, activeTab, updateNode, addChild]);

  // -- Ghost text inline completions --
  const fetchGhostSuggestion = useCallback(async (code: string, language: string, line: number, column: number) => {
    try {
      const resp = await fetchCodeEngine({ action: "autocomplete", code, language, cursorLine: line, cursorColumn: column, domain: domainId, model: selectedModel });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.suggestion || null;
    } catch { return null; }
  }, [domainId, selectedModel, fetchCodeEngine]);

  // Register Monaco inline completion provider
  useEffect(() => {
    if (!monacoEditorRef.current) return;
    const editor = monacoEditorRef.current;
    const monaco = (window as any).monaco;
    if (!monaco) return;

    // Dispose previous registration
    if (ghostDisposableRef.current) {
      ghostDisposableRef.current.dispose();
      ghostDisposableRef.current = null;
    }

    const disposable = monaco.languages.registerInlineCompletionsProvider("*", {
      provideInlineCompletions: async (model: any, position: any) => {
        const code = model.getValue();
        if (code.length < 10) return { items: [] };

        const suggestion = await fetchGhostSuggestion(code, activeTab?.language || "javascript", position.lineNumber - 1, position.column - 1);
        if (!suggestion) return { items: [] };

        return {
          items: [{
            insertText: suggestion,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          }],
        };
      },
      freeInlineCompletions: () => {},
    });

    ghostDisposableRef.current = disposable;
    return () => disposable.dispose();
  }, [fetchGhostSuggestion, activeTab?.language]);

  // -- AI-powered test generation --
  const handleGenerateTests = useCallback(async () => {
    if (!activeTab || chatLoading) return;
    setChatLoading(true);
    const userMsg: Message = { role: "user", content: `🧪 Generate tests for \`${activeTab.name}\`` };
    setMessages(prev => [...prev, userMsg]);
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1) return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetchCodeEngine({ action: "generate-tests", code: activeTab.content, language: activeTab.language, filename: activeTab.name, domain: domainName, model: selectedModel });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        upsert(`❌ ${err?.error || "Test generation failed."}`);
        setChatLoading(false);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) upsert(c); }
          catch { buf = line + "\n" + buf; break; }
        }
      }
      // Auto-apply test file
      if (assistantSoFar) {
        const blocks = extractCodeBlocks(assistantSoFar);
        if (blocks.length > 0) {
          const testFilename = activeTab.name.replace(/\.(\w+)$/, ".test.$1");
          applyCodeToEditor(blocks[0].code, blocks[0].language, testFilename);
        }
      }
    } catch (e) {
      upsert(isAuthRequiredError(e) ? "🔒 Please sign in to use AI test generation." : "❌ Connection error.");
    }
    setChatLoading(false);
  }, [activeTab, chatLoading, domainName, selectedModel, applyCodeToEditor, fetchCodeEngine]);

  // -- AI-powered doc generation --
  const handleGenerateDocs = useCallback(async () => {
    if (!activeTab || chatLoading) return;
    setChatLoading(true);
    const userMsg: Message = { role: "user", content: `📖 Generate documentation for \`${activeTab.name}\`` };
    setMessages(prev => [...prev, userMsg]);
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1) return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetchCodeEngine({ action: "generate-docs", code: activeTab.content, language: activeTab.language, filename: activeTab.name, domain: domainName, model: selectedModel });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        upsert(`❌ ${err?.error || "Doc generation failed."}`);
        setChatLoading(false);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) upsert(c); }
          catch { buf = line + "\n" + buf; break; }
        }
      }
      // Auto-apply doc file
      if (assistantSoFar) {
        const blocks = extractCodeBlocks(assistantSoFar);
        if (blocks.length > 0) {
          const docFilename = activeTab.name.replace(/\.\w+$/, ".docs.md");
          applyCodeToEditor(blocks[0].code, blocks[0].language, docFilename);
        }
      }
    } catch (e) {
      upsert(isAuthRequiredError(e) ? "🔒 Please sign in to use AI documentation generation." : "❌ Connection error.");
    }
    setChatLoading(false);
  }, [activeTab, chatLoading, domainName, selectedModel, applyCodeToEditor, fetchCodeEngine]);

  // -- Run Code --
  const handleRun = useCallback(async () => {
    if (!activeTab) return;
    setIsRunning(true);
    const lang = activeTab.language;
    const isHtml = lang === "html" || activeTab.name.endsWith(".html");
    const isJsLike = ["javascript", "typescript"].includes(lang) || /\.(js|jsx|ts|tsx)$/.test(activeTab.name);
    const allFiles = collectFiles(fileTree);
    const filesList = Object.entries(allFiles).map(([path, content]) => ({ path, content }));
    const isReactProject = hasJSX(filesList);
    const domainId = domainName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const isAppDomain = domainId === "app-development" || domainId === "web-development";

    // For React/JSX projects: use Sandpack - runs instantly in browser
    if (isReactProject && isAppDomain) {
      setShowPreview(true);
      setShowTerminal(true);
      setOutput([`$ Running ${activeTab.name}...`, "✅ Sandpack preview ready — edits auto-update"]);
      setIsRunning(false);
      return;
    }

    // For HTML/JS (non-React): use Babel/HTML preview
    if (isHtml || isJsLike) {
      setShowPreview(true);
      setShowTerminal(true);
      setOutput([`$ Running ${activeTab.name}...`, "🌐 Live preview rendering..."]);
      // Preview URL not needed for inline preview
      const hasJSXInFile = /<\w+[\s/>]/.test(activeTab.content) && /\breturn\s*[\s(]/.test(activeTab.content);
      const usesDOM = /document\.|getElementById|querySelector|innerHTML|addEventListener/.test(activeTab.content);

      if (isHtml) {
        setPreview(buildPreviewHtml(activeTab.content, allFiles, activeTab.name));
      } else if (isJsLike && hasJSXInFile) {
        setPreview(buildAppPreviewHtml(activeTab.content, lang, allFiles));
      } else if (isJsLike && usesDOM) {
        setPreview(buildVanillaJsPreview(activeTab.content, allFiles));
      } else {
        setPreview(buildAppPreviewHtml(activeTab.content, lang, allFiles));
      }
      setOutput((p) => [...p, "✅ Preview rendered successfully"]);
      setIsRunning(false);
      return;
    }

    // For non-web languages (Python, C++, etc.), use edge function AI-simulated execution
    setShowTerminal(true);
    setOutput([`$ Running ${activeTab.name}...`, `🤖 AI-simulated ${lang} runtime`]);

    try {
      const resp = await fetchCodeEngine({ action: "execute", code: activeTab.content, language: lang, domain: domainName });
      const data = await resp.json();
      if (!resp.ok) {
        setOutput((p) => [...p, `❌ ${data?.error || "Execution failed"}`]);
      } else if (data?.output) {
        setOutput((p) => [...p, ...data.output]);
        if (data.runtime === "ai-simulated") {
          setOutput((p) => [...p, `\n📋 Runtime: AI-simulated ${data.language} environment`]);
        }
      } else {
        setOutput((p) => [...p, "✅ Done (no output)"]);
      }
    } catch (err: unknown) {
      if (isAuthRequiredError(err)) {
        setOutput((p) => [...p, "🔒 Please sign in to run AI-powered execution."]);
      } else {
        setOutput((p) => [...p, `❌ ${err instanceof Error ? err.message : String(err)}`]);
      }
    }
    setIsRunning(false);
  }, [activeTab, domainName, fileTree, currentProjectName, collectFiles, buildPreviewHtml, buildAppPreviewHtml, buildVanillaJsPreview, fetchCodeEngine]);

  const handleCopy = () => {
    if (activeTab) navigator.clipboard.writeText(activeTab.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (!activeTabId) return;
    const original = findFile(createDefaultProject(domainName), activeTabId);
    if (original?.content) handleCodeChange(original.content);
  };

  // -- AI Chat with auto-apply --
  const handleChatSend = useCallback(async (overrideInput?: string) => {
    const input = (overrideInput ?? chatInput).trim();
    if (!input || chatLoading) return;

    // --- Automation: "push / upload this to my github" ---
    if (/\b(push|upload|export|publish|commit|save|send|deploy)\b[^.!?]{0,60}\bgit\s?hub\b/i.test(input)
      || /\bgit\s?hub\b[^.!?]{0,40}\b(push|upload|export|repo|repository)\b/i.test(input)) {
      const filesToPush = flattenFiles(fileTree).map((f) => ({ path: f.path, content: f.content || "" }));
      setChatInput("");
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      if (!filesToPush.length) {
        setMessages((prev) => [...prev, { role: "assistant", content: "There are no files in this project yet — generate something first, then I'll push it to GitHub." }]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: "Pushing your project to GitHub…" }]);
      try {
        const nameMatch = input.match(/(?:repo|repository|named|called)\s+["'`]?([A-Za-z0-9._-]{2,60})["'`]?/i);
        const result = await githubPush(filesToPush, {
          repo: nameMatch?.[1],
          private: !/\bpublic\b/i.test(input),
          commitMessage: "Update from Lunor.AI",
        });
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `${result.created ? "Created" : "Updated"} **${result.repo}** with ${result.fileCount} file(s) on \`${result.branch}\`.\n\n[Open repository](${result.repoUrl}) · [View commit](${result.commitUrl})`,
        }]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Push failed";
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: /connect your github/i.test(msg)
            ? "I need access to your GitHub account first — I've opened the connect panel for you."
            : `GitHub push failed: ${msg}`,
        }]);
        setShowGitHub(true);
      }
      return;
    }

    // Build FULL project context so follow-up prompts modify the existing build
    const projectFiles = flattenFiles(fileTree);
    const CHAR_BUDGET = 120000;
    const PER_FILE = 9000;
    let used = 0;
    const fileBlocks: string[] = [];
    // Active file first so the AI focuses on what the user is looking at
    const ordered = [...projectFiles].sort((a, b) => {
      if (activeTab && a.path === activeTab.id) return -1;
      if (activeTab && b.path === activeTab.id) return 1;
      return 0;
    });
    for (const f of ordered) {
      if (used >= CHAR_BUDGET) break;
      const body = (f.content || "").slice(0, PER_FILE);
      used += body.length;
      fileBlocks.push(`${f.path}\n\`\`\`${f.language || getLang(f.name)}\n${body}\n\`\`\``);
    }
    const fileContext = projectFiles.length
      ? `\n\n---\n[CURRENT PROJECT STATE — ${projectFiles.length} file(s). This is the website/app already built. Treat my request above as an EDIT to these files.]\n` +
        `Files: ${projectFiles.map((f) => f.path).join(", ")}\n` +
        (activeTab ? `Currently open file: ${activeTab.id}\n` : "") +
        `\n${fileBlocks.join("\n\n")}\n\n` +
        `[EDIT RULES: This is a TARGETED EDIT to the live project above. Change ONLY the exact part the user asked about; keep all other layout, structure, markup, ids, classes, styling, spacing, colors, fonts, animations, content and behavior byte-identical. Do NOT redesign, refactor, reorder or regenerate untouched sections, and do NOT add unrequested sections or files. Reuse the EXACT file paths above. Return the COMPLETE updated content of only the files that actually change (never diffs, never "// rest unchanged"). Do NOT rename or duplicate existing files. Do NOT restart the project from scratch.]\n---`
      : "";

    // Attach captured preview runtime errors when the user is asking for a fix
    const fixIntent = /\b(error|errors|not working|doesn'?t work|isn'?t working|broken|fix|debug|solve|issue|fails?|failing|crash|blank|white screen|can'?t (log|sign) ?in|login)\b/i.test(input);
    const capturedErrors = previewErrorLogRef.current;
    const errorContext = fixIntent && capturedErrors.length
      ? `\n\n---\n[CAPTURED RUNTIME ERRORS FROM THE LIVE PREVIEW — these are real, authoritative errors thrown by the code above. Fix their ROOT CAUSE, not the symptom.]\n` +
        capturedErrors.map((e, i) => `${i + 1}. ${e}`).join("\n") +
        `\n\n[FIX REQUIREMENTS: Trace each error to the exact file and line in the project above and fix it properly. Return the COMPLETE updated content of every file you change, using the EXACT existing file paths (format: path/to/file.ext followed by a fenced code block). Do not answer with prose only, explanations only, TODOs or placeholders. After fixing, confirm in one short line that each listed error can no longer occur.]\n---`
      : "";

    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChatInput("");
    setChatLoading(true);
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === updated.length + 1)
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    // Check for cached response when offline
    if (!online) {
      const cached = findCachedAIResponse(input, domainId);
      if (cached) {
        upsert(cached.response);
      } else {
        upsert("📴 **Offline mode** — no cached response found for this query.\n\nTry browsing the **Snippets** tab in the sidebar for pre-loaded code examples.");
      }
    } else {
      try {
        // Append file context to the last user message for AI awareness
        const messagesWithContext = updated.map((m, i) => {
          if (i === updated.length - 1 && m.role === "user") {
            return { role: m.role, content: m.content + fileContext + errorContext };
          }
          return { role: m.role, content: m.content };
        });
        const resp = await fetchCodeEngine({ action: "generate", messages: messagesWithContext, domain: domainName, model: selectedModel });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          let msg = err?.error || "Request failed.";
          if (resp.status === 404) msg = `AI service not deployed. Run: supabase functions deploy code-engine --project-ref ${import.meta.env.VITE_SUPABASE_PROJECT_ID || "YOUR_PROJECT_REF"}`;
          if (resp.status === 401) msg = "Please log in to use the AI assistant.";
          if (resp.status === 402) {
            if (err?.code === "credits_exhausted") {
              msg = `**You're out of AI credits.** Balance: ${err?.balance ?? 0}.\n\nTop up **20 credits for ₹50** or upgrade your plan on the [Pricing page](/pricing).`;
              refetchCredits();
            } else {
              let diagnostic = "";
              try {
                const pingResp = await fetchCodeEngine({ action: "ping" });
                if (pingResp.ok) {
                  const ping = await pingResp.json();
                  diagnostic = `\n\n**Diagnostic:** Provider=${ping.provider}, Project=${ping.projectRef}. ${ping.hint || ""}`;
                }
              } catch {}
              msg = `AI service credits exhausted on the provider side.${diagnostic}`;
            }
          }
          if (resp.status === 503 && err?.hint) msg = `${err.error} ${err.hint}`;
          upsert(`❌ ${msg}`);
          setChatLoading(false);
          return;
        }
        if (!resp.body) throw new Error("No body");
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ") || line.trim() === "" || line.startsWith(":")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) upsert(c); }
            catch { buf = line + "\n" + buf; break; }
          }
        }
        // Cache the response for offline use
        if (assistantSoFar) cacheAIResponse(input, domainId, assistantSoFar);
      } catch (e) {
        upsert(
          isAuthRequiredError(e)
            ? "🔒 Please sign in to use the AI assistant."
            : "❌ Connection error. Switching to offline mode."
        );
      }
    }

    // Auto-apply: extract code blocks, batch all file operations, then trigger preview
    const userPrompt = updated.filter(m => m.role === "user").pop()?.content;
    const codeBlocks = extractCodeBlocks(assistantSoFar, userPrompt);
    if (codeBlocks.length > 0) {
      // Prepare all new files/updates in one pass — resolve onto existing paths first
      const existingForResolve = flattenFiles(fileTree);
      const newFiles: { id: string; name: string; lang: string; code: string }[] = [];
      codeBlocks.forEach((block) => {
        const normalizedLang = LANG_MAP[block.language] || block.language;
        const ext = LANG_EXT_MAP[normalizedLang] || LANG_EXT_MAP[block.language] || block.language || "js";
        const fname = block.filename || `untitled.${ext}`;
        const newId = resolveTargetPath(fname, normalizedLang, existingForResolve);
        const displayName = newId.split("/").pop() || fname;
        if (newFiles.some((f) => f.id === newId)) {
          // Same file returned twice in one response — keep the latest version
          const idx = newFiles.findIndex((f) => f.id === newId);
          newFiles[idx] = { id: newId, name: displayName, lang: normalizedLang || getLang(displayName), code: block.code };
          return;
        }
        newFiles.push({ id: newId, name: displayName, lang: normalizedLang || getLang(displayName), code: block.code });
      });


      // Batch update file tree in a single setState
      setFileTree(prev => {
        let tree = [...prev];
        // Ensure src folder exists
        let srcFolder = tree.find(n => n.id === "src" && n.type === "folder");
        if (!srcFolder) {
          srcFolder = { id: "src", name: "src", type: "folder", isOpen: true, children: [] };
          tree = [srcFolder, ...tree];
        }

        newFiles.forEach(({ id, name, lang, code }) => {
          const existingInTree = findFile(tree, id);
          if (existingInTree) {
            tree = updateNode(tree, id, n => ({ ...n, content: code }));
          } else {
            const newNode: FileNode = { id, name, type: "file", language: lang, content: code };
            tree = addChild(tree, "src", newNode);
          }
        });
        return tree;
      });

      // Batch update tabs in a single setState
      setOpenTabs(prev => {
        let tabs = [...prev];
        newFiles.forEach(({ id, name, lang, code }) => {
          const existingTab = tabs.find(t => t.id === id);
          if (existingTab) {
            tabs = tabs.map(t => t.id === id ? { ...t, content: code, isModified: true } : t);
          } else {
            tabs = [...tabs, { id, name, language: lang, content: code, isModified: true }];
          }
        });
        return tabs;
      });

      // Auto-select the best file for preview (prefer HTML, then first JS)
      const htmlFile = newFiles.find(f => f.lang === "html" || f.name.endsWith(".html"));
      const jsFile = newFiles.find(f => ["javascript", "typescript"].includes(f.lang) || /\.(js|jsx|ts|tsx)$/.test(f.name));
      const bestFile = htmlFile || jsFile || newFiles[0];
      if (bestFile) setActiveTabId(bestFile.id);

      // Record this generation in the history feed (snapshot = existing files + new files)
      try {
        const snapshotMap = new Map<string, { path: string; language?: string; content: string }>();
        existingForResolve.forEach((f) => snapshotMap.set(f.path, { path: f.path, language: f.language, content: f.content || "" }));
        newFiles.forEach((f) => snapshotMap.set(f.id, { path: f.id, language: f.lang, content: f.code }));
        const snapshot = Array.from(snapshotMap.values());
        addHistoryEntry({
          domain: domainName,
          projectId: currentProjectId,
          projectName: currentProjectName,
          prompt: (userPrompt || "(no prompt)").slice(0, 2000),
          isFullStack: isFullStackFiles(snapshot.map((f) => f.path)),
          files: snapshot,
        });
        setGenHistory(getHistory());
      } catch (e) {
        console.warn("[editor] could not record generation history", e);
      }

      // Auto-open preview and build it directly from the code blocks (don't rely on stale state)
      const hasWebCode = newFiles.some(f => ["html", "javascript", "typescript", "css", "jsx", "tsx"].includes(f.lang));
      if (hasWebCode) {
        setShowPreview(true);
        verifyPendingRef.current = true;


        // Build a complete file map from existing tree + new files for immediate preview
        setTimeout(() => {
          // Collect files from current (updated) tree via a fresh read
          setFileTree(currentTree => {
            const allFiles = collectFiles(currentTree);

            // Determine which file to preview
            const previewFile = htmlFile || jsFile || newFiles[0];
            if (previewFile) {
              const isHtml = previewFile.lang === "html" || previewFile.name.endsWith(".html");
              const isJsLike = ["javascript", "typescript"].includes(previewFile.lang) || /\.(js|jsx|ts|tsx)$/.test(previewFile.name);
              const hasJSX = /<\w+[\s/>]/.test(previewFile.code) && /\breturn\s*[\s(]/.test(previewFile.code);
              const usesDOM = /document\.|getElementById|querySelector|innerHTML|addEventListener/.test(previewFile.code);

              if (isHtml) {
                setPreview(buildPreviewHtml(previewFile.code, allFiles, previewFile.name));
              } else if (isJsLike && hasJSX) {
                setPreview(buildAppPreviewHtml(previewFile.code, previewFile.lang, allFiles));
              } else if (isJsLike && usesDOM) {
                setPreview(buildVanillaJsPreview(previewFile.code, allFiles));
              } else if (isJsLike) {
                setPreview(buildAppPreviewHtml(previewFile.code, previewFile.lang, allFiles));
              }
            }

            return currentTree; // Don't modify tree, just reading
          });
        }, 200);
      }
    }

    // Live debugging hints for app-development domain
    if (isAppDomain && assistantSoFar) {
      const lowerInput = input.toLowerCase();
      const lowerResponse = assistantSoFar.toLowerCase();
      const isDebugging = /debug|error|crash|issue|fix|bug|not working|broken|fail|undefined|null|typeerror|referenceerror|warning|exception/.test(lowerInput + " " + lowerResponse);

      if (isDebugging) {
        const hints: string[] = [];
        if (/layout|overflow|scroll|flex|position|align|margin|padding|safe.?area/.test(lowerInput + " " + lowerResponse)) {
          hints.push("🔧 **Layout Tip:** Use the **Grid Debug Overlay** (⊞ icon in preview) to visualize safe areas, padding guides, and column grids across devices.");
        }
        if (/render|re-render|performance|slow|lag|memo|usememo|usecallback/.test(lowerInput + " " + lowerResponse)) {
          hints.push("⚡ **Performance Tip:** Wrap expensive components in `React.memo()` and use `useMemo`/`useCallback` for derived values and handlers passed as props.");
        }
        if (/state|usestate|setstate|stale|closure/.test(lowerInput + " " + lowerResponse)) {
          hints.push("🔄 **State Tip:** Use the functional updater `setState(prev => ...)` to avoid stale closure bugs — especially in event handlers and async callbacks.");
        }
        if (/navigation|screen|route|stack|tab|navigate/.test(lowerInput + " " + lowerResponse)) {
          hints.push("🗺️ **Navigation Tip:** Ensure all screens are registered before navigating. Use `navigation.canGoBack()` before calling `goBack()` to prevent crashes.");
        }
        if (/api|fetch|network|timeout|cors|401|403|500/.test(lowerInput + " " + lowerResponse)) {
          hints.push("🌐 **Network Tip:** Always wrap API calls in try/catch, check `response.ok`, and handle offline gracefully with cached data or retry logic.");
        }
        if (/style|css|responsive|breakpoint|device|width|height|pixel/.test(lowerInput + " " + lowerResponse)) {
          hints.push("📱 **Responsive Tip:** Test across device presets using the device switcher dropdown — iPhone SE (320px) through iPad Pro (834px) to catch layout breaks.");
        }
        if (hints.length === 0) {
          hints.push("💡 **Debug Tip:** Use `console.log()` at key points, check the terminal output, and switch device presets to reproduce layout-specific issues.");
        }

        const hintBlock = "\n\n---\n\n" + hints.join("\n\n");
        assistantSoFar += hintBlock;
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 && m.role === "assistant" ? { ...m, content: assistantSoFar } : m))
        );
      }
    }

    setChatLoading(false);
    refetchCredits();
  }, [chatInput, chatLoading, messages, domainName, applyCodeToEditor, isAppDomain, activeTab, selectedModel, online, domainId, fetchCodeEngine, fileTree, collectFiles, refetchCredits]);

  // -- Voice assistant: speak commands, hear friendly replies --
  const voice = useVoiceAssistant({
    onFinalTranscript: (text) => { void handleChatSend(text); },
  });
  const spokenRef = useRef<number>(-1);
  useEffect(() => {
    if (!voice.voiceEnabled || chatLoading) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (spokenRef.current === messages.length - 1) return;
    spokenRef.current = messages.length - 1;
    void voice.speak(last.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, chatLoading, voice.voiceEnabled]);

  // One-click AI fix for runtime errors surfaced by the preview
  const handleResolveError = useCallback(async () => {
    if (!previewError || resolvingError) return;
    setResolvingError(true);
    const prompt =
      `The generated site threw a runtime error in the preview. Fix the root cause in the project files.\n` +
      `Error: ${previewError.message}\n` +
      (previewError.stack ? `Stack: ${previewError.stack.slice(0, 1500)}\n` : "") +
      `Rules: keep the existing design and features, avoid APIs unavailable in a sandboxed iframe (use in-memory or guarded storage), and return the COMPLETE updated file(s) using the exact existing file paths.`;
    try {
      await handleChatSend(prompt);
    } finally {
      setPreviewError(null);
      setResolvingError(false);
    }
  }, [previewError, resolvingError, handleChatSend]);

  // Verification runs silently in the background. Only genuine passes are surfaced,
  // and a self-test timeout is never treated as an application error.
  useEffect(() => {
    if (!verify || verify.running || !verify.results.length || verificationMessageRef.current) return;
    verificationMessageRef.current = true;
    const passed = verify.results.every((result) => result.passed);
    if (passed) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `✅ **Verified in the live preview**\n\n${summarizeResults(verify.results)}`,
      }]);
    }
    // Auto-clear the badge so no persistent warning popup remains.
    const timer = window.setTimeout(() => setVerify(null), passed ? 4000 : 1200);
    return () => window.clearTimeout(timer);
  }, [verify]);

  const handleClearChat = () => {
    setMessages([{ role: "assistant", content: `👋 Chat cleared! I'm your **${domainName}** assistant. Ask me anything!` }]);
  };

  // -- Project management --
  const handleSaveProject = useCallback(() => {
    const proj: SavedProject = {
      id: currentProjectId,
      name: currentProjectName,
      domain: domainName,
      fileTree,
      lastOpened: Date.now(),
      createdAt: Date.now(),
    };
    saveProject(proj);
    setRecentProjects(getSavedProjects());
    setOutput(prev => [...prev, `💾 Project "${currentProjectName}" saved.`]);
    setShowTerminal(true);
  }, [currentProjectId, currentProjectName, domainName, fileTree]);

  const handleOpenProject = useCallback((proj: SavedProject) => {
    // Save current project first
    handleSaveProject();
    // Load selected project
    setFileTree(proj.fileTree);
    setCurrentProjectId(proj.id);
    setCurrentProjectName(proj.name);
    setOpenTabs([]);
    setActiveTabId(null);
    setShowWelcome(false);
    setShowNewProject(false);
    // Update last opened
    saveProject({ ...proj, lastOpened: Date.now() });
    setRecentProjects(getSavedProjects());
  }, [handleSaveProject]);

  const handleCreateNewProject = useCallback(() => {
    if (!newProjectName.trim()) return;
    // Save current first
    handleSaveProject();
    const newId = `proj-${Date.now()}`;
    const newTree = createProjectFromTemplate(newProjectTemplate, newProjectName.trim(), domainName);
    setFileTree(newTree);
    setCurrentProjectId(newId);
    setCurrentProjectName(newProjectName.trim());
    setOpenTabs([]);
    setActiveTabId(null);
    setShowNewProject(false);
    setShowWelcome(false);
    // Save the new project
    const proj: SavedProject = { id: newId, name: newProjectName.trim(), domain: domainName, fileTree: newTree, lastOpened: Date.now(), createdAt: Date.now() };
    saveProject(proj);
    setRecentProjects(getSavedProjects());
    setNewProjectName("");
  }, [newProjectName, newProjectTemplate, domainName, handleSaveProject]);

  const handleRevisitGeneration = useCallback((entry: GenerationEntry) => {
    const tree = buildTreeFromSnapshot(entry.files);
    setFileTree(tree);
    setCurrentProjectId(entry.projectId || `proj-${Date.now()}`);
    setCurrentProjectName(entry.projectName || "Restored project");
    setOpenTabs([]);
    setActiveTabId(null);
    setShowWelcome(false);
    const first = entry.files.find((f) => f.path.endsWith(".html")) || entry.files[0];
    if (first) {
      setOpenTabs([{ id: first.path, name: first.path.split("/").pop() || first.path, language: first.language || getLang(first.path), content: first.content, isModified: false }]);
      setActiveTabId(first.path);
    }
    setOutput((prev) => [...prev, `🕘 Restored generation from ${new Date(entry.createdAt).toLocaleString()} (${entry.files.length} files).`]);
    setShowTerminal(true);
  }, []);

  const handleRerunGeneration = useCallback((entry: GenerationEntry) => {
    setShowAIPanel(true);
    handleChatSend(entry.prompt);
  }, [handleChatSend]);

  const handleOpenHistoryFile = useCallback((entry: GenerationEntry, path: string) => {
    const file = entry.files.find((f) => f.path === path);
    if (!file) return;
    const name = path.split("/").pop() || path;
    setOpenTabs((prev) => (prev.some((t) => t.id === path)
      ? prev.map((t) => (t.id === path ? { ...t, content: file.content } : t))
      : [...prev, { id: path, name, language: file.language || getLang(name), content: file.content, isModified: false }]));
    setActiveTabId(path);
    setShowWelcome(false);
  }, []);

  const handleDeleteHistoryEntry = useCallback((id: string) => {
    deleteHistoryEntry(id);
    setGenHistory(getHistory());
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setGenHistory(getHistory());
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    deleteProject(id);
    setRecentProjects(getSavedProjects());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      switch (e.key.toLowerCase()) {
        case "s": e.preventDefault(); handleSaveProject(); break;
        case "n": e.preventDefault(); setShowNewProject(true); break;
        case "o": e.preventDefault(); setShowWelcome(true); break;
        case "b": e.preventDefault(); setShowSidebar(prev => !prev); break;
        case "j": e.preventDefault(); setShowTerminal(prev => !prev); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSaveProject]);

  const firstFolderId = useMemo(() => {
    const find = (nodes: FileNode[]): string | null => {
      for (const n of nodes) { if (n.type === "folder") return n.id; if (n.children) { const f = find(n.children); if (f) return f; } }
      return null;
    };
    return find(fileTree);
  }, [fileTree]);

  // Welcome / New Project screens
  if (showWelcome) {
    return (
      <div className="flex flex-col h-screen w-full bg-[hsl(var(--background))] text-foreground overflow-hidden">
        <div className="flex items-center h-9 bg-card border-b border-border px-3 shrink-0 select-none">
          <span className="text-xs font-semibold text-primary">Lunor.AI</span>
          <span className="text-[10px] text-muted-foreground ml-2">— Welcome</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => setShowWelcome(false)}>
            <X className="h-3 w-3" />
          </Button>
          {onExit && (
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={onExit}>
              <Minimize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Lunor.AI <span className="text-primary">Editor</span></h1>
              <p className="text-sm text-muted-foreground">Start a new project or open a recent one</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setShowWelcome(false); setShowNewProject(true); }}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FilePlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">New Project</p>
                  <p className="text-[10px] text-muted-foreground">Create from a template</p>
                </div>
              </button>
              <button
                onClick={() => setShowWelcome(false)}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderInput className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Current Project</p>
                  <p className="text-[10px] text-muted-foreground">Return to workspace</p>
                </div>
              </button>
            </div>

            {/* Recent projects */}
            {recentProjects.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Recent Projects
                </h3>
                <div className="space-y-1.5">
                  {recentProjects.map((proj) => (
                    <div key={proj.id} className="group flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => handleOpenProject(proj)}
                    >
                      <FileCode2 className="h-4 w-4 text-primary/60 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{proj.name}</p>
                        <p className="text-[10px] text-muted-foreground">{proj.domain} · {new Date(proj.lastOpened).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center h-6 bg-primary/10 border-t border-border px-3 shrink-0">
          <span className="text-[10px] text-muted-foreground">Lunor.AI Editor · {domainName}</span>
        </div>
      </div>
    );
  }

  // New Project dialog overlay
  const newProjectDialog = showNewProject && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowNewProject(false)}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Create New Project</h2>
          <button onClick={() => setShowNewProject(false)} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Project Name</label>
            <input
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateNewProject()}
              placeholder="My Awesome Project"
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Choose Template</label>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setNewProjectTemplate(tmpl.id)}
                  className={`flex items-center gap-2.5 rounded-md border p-3 text-left transition-colors ${
                    newProjectTemplate === tmpl.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <span className="text-lg">{tmpl.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{tmpl.name}</p>
                    <p className="text-[10px] opacity-70">{tmpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowNewProject(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateNewProject} disabled={!newProjectName.trim()}>
              <Plus className="h-3 w-3 mr-1" /> Create Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden" style={{ backgroundColor: currentTheme.uiColors.bg, color: currentTheme.uiColors.text }}>
      {newProjectDialog}


      {/* Title bar with File menu */}
      <div className="flex items-center justify-between h-9 border-b px-3 shrink-0 select-none" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold mr-1" style={{ color: currentTheme.uiColors.accent }}>Lunor.AI</span>

          {/* File menu */}
          <div className="relative">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              File <ChevronDown className="h-2.5 w-2.5" />
            </button>
            {showFileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFileMenu(false)} />
                <div className="absolute top-full left-0 z-50 mt-0.5 w-48 rounded-md border border-border bg-card py-1 shadow-xl">
                  <button onClick={() => { setShowNewProject(true); setShowFileMenu(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <FilePlus className="h-3 w-3" /> New Project
                  </button>
                  <button onClick={() => { setShowWelcome(true); setShowFileMenu(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <FolderInput className="h-3 w-3" /> Open Project...
                  </button>
                  <button onClick={() => { handleSaveProject(); setShowFileMenu(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <Save className="h-3 w-3" /> Save Project
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button onClick={() => { setNewItemParent(firstFolderId); setNewItemType("file"); setNewItemName(""); setShowFileMenu(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <File className="h-3 w-3" /> New File
                  </button>
                  <button onClick={() => { setNewItemParent(firstFolderId); setNewItemType("folder"); setNewItemName(""); setShowFileMenu(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <FolderPlus className="h-3 w-3" /> New Folder
                  </button>
                  {recentProjects.length > 0 && (
                    <>
                      <div className="my-1 border-t border-border" />
                      <div className="px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">Recent</div>
                      {recentProjects.slice(0, 5).map((proj) => (
                        <button key={proj.id} onClick={() => { handleOpenProject(proj); setShowFileMenu(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors truncate">
                          <Clock className="h-3 w-3 shrink-0" /> <span className="truncate">{proj.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <span className="text-[10px] text-muted-foreground ml-1">— {currentProjectName}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Theme picker */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => setShowThemeMenu(!showThemeMenu)} title="Change Theme">
              <Palette className="h-3 w-3" />
            </Button>
            {showThemeMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                <div className="absolute top-full right-0 z-50 mt-0.5 w-52 rounded-md border py-1 shadow-xl max-h-80 overflow-y-auto" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
                  <div className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.uiColors.muted }}>Editor Theme</div>
                  {editorThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme)}
                      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs transition-colors hover:opacity-80"
                      style={{
                        color: currentThemeId === theme.id ? theme.preview.accent : currentTheme.uiColors.text,
                        backgroundColor: currentThemeId === theme.id ? `${theme.preview.accent}15` : "transparent",
                      }}
                    >
                      <div className="flex gap-0.5 shrink-0">
                        <span className="h-3 w-3 rounded-sm border" style={{ backgroundColor: theme.preview.bg, borderColor: theme.preview.accent + "40" }} />
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: theme.preview.accent }} />
                      </div>
                      <span className="truncate">{theme.label}</span>
                      {currentThemeId === theme.id && <Check className="h-3 w-3 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={handleSaveProject} title="Save Project">
            <Save className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px]"
            onClick={() => setShowGitHub(true)}
            title={githubStatus.connected ? `Push to GitHub (${githubStatus.login})` : "Push to GitHub"}
          >
            <Github className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => setShowAIPanel(!showAIPanel)} title="Toggle AI Panel">
            {showAIPanel ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => setShowSidebar(!showSidebar)}>
            <Settings className="h-3 w-3" />
          </Button>
          {onExit && (
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={onExit}>
              <Minimize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <GitHubPushDialog
        open={showGitHub}
        onOpenChange={setShowGitHub}
        files={flattenFiles(fileTree).map((f) => ({ path: f.path, content: f.content || "" }))}
        projectName={domainName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Activity bar */}
        <div className="flex flex-col items-center w-10 border-r py-2 gap-1 shrink-0" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
          <button onClick={() => { setShowSidebar(true); setSidebarTab("files"); }} className={`p-2 rounded-md transition-colors ${showSidebar && sidebarTab === "files" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <File className="h-4 w-4" />
          </button>
          <button onClick={() => { setShowSidebar(true); setSidebarTab("search"); }} className={`p-2 rounded-md transition-colors ${showSidebar && sidebarTab === "search" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Search className="h-4 w-4" />
          </button>
          <button onClick={() => { setShowSidebar(true); setSidebarTab("snippets"); }} className={`p-2 rounded-md transition-colors ${showSidebar && sidebarTab === "snippets" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Offline Snippets">
            <FileCode2 className="h-4 w-4" />
          </button>
          <button onClick={() => { setShowSidebar(true); setSidebarTab("history"); }} className={`p-2 rounded-md transition-colors ${showSidebar && sidebarTab === "history" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Generation History">
            <HistoryIcon className="h-4 w-4" />
          </button>
          <button onClick={() => { setShowSidebar(true); setSidebarTab("lessons"); }} className={`p-2 rounded-md transition-colors ${showSidebar && sidebarTab === "lessons" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Lesson Instructions">
            <BookOpen className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <GitBranch className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <button onClick={() => setShowAIPanel(!showAIPanel)} className={`p-2 rounded-md transition-colors ${showAIPanel ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Sparkles className="h-4 w-4" />
          </button>
          <RunLocallyDialog fileTree={fileTree} domainName={domainName} projectName={currentProjectName || "my-app"}>
            <button className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors" title="Run Locally">
              <Download className="h-4 w-4" />
            </button>
          </RunLocallyDialog>
          <button onClick={() => setShowTerminal(!showTerminal)} className={`p-2 rounded-md transition-colors ${showTerminal ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <TerminalIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar - file explorer */}
        {showSidebar && (
          <div className="flex flex-col w-56 border-r shrink-0 overflow-hidden" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: currentTheme.uiColors.border }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.uiColors.muted }}>
                {sidebarTab === "files" ? "Explorer" : sidebarTab === "snippets" ? "Snippets" : sidebarTab === "lessons" ? "Lessons" : sidebarTab === "history" ? "History" : "Search"}
              </span>
              {!online && <span className="text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: currentTheme.uiColors.accent + "20", color: currentTheme.uiColors.accent }}>OFFLINE</span>}
              {sidebarTab === "files" && (
                <div className="flex gap-0.5">
                  <button onClick={() => { setNewItemParent(firstFolderId); setNewItemType("file"); setNewItemName(""); }} className="p-1 transition-colors" style={{ color: currentTheme.uiColors.muted }} title="New File">
                    <FilePlus className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setNewItemParent(firstFolderId); setNewItemType("folder"); setNewItemName(""); }} className="p-1 transition-colors" style={{ color: currentTheme.uiColors.muted }} title="New Folder">
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            {sidebarTab === "history" ? (
              <GenerationHistoryPanel
                entries={genHistory}
                colors={currentTheme.uiColors as any}
                onRevisit={handleRevisitGeneration}
                onRerun={handleRerunGeneration}
                onDelete={handleDeleteHistoryEntry}
                onClearAll={handleClearHistory}
                onOpenFile={handleOpenHistoryFile}
              />
            ) : sidebarTab === "files" ? (
              <div className="flex-1 overflow-y-auto py-1 text-xs">
                {newItemParent !== null && (
                  <div className="flex items-center gap-1 px-3 py-1">
                    {newItemType === "folder" ? <FolderClosed className="h-3 w-3" style={{ color: currentTheme.uiColors.muted }} /> : <File className="h-3 w-3" style={{ color: currentTheme.uiColors.muted }} />}
                    <input
                      autoFocus value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateItem(); if (e.key === "Escape") setNewItemParent(null); }}
                      onBlur={handleCreateItem}
                      placeholder={`New ${newItemType}...`}
                      className="flex-1 rounded px-1 py-0.5 text-xs outline-none"
                      style={{ backgroundColor: currentTheme.uiColors.bg, border: `1px solid ${currentTheme.uiColors.border}`, color: currentTheme.uiColors.text }}
                    />
                  </div>
                )}
                {fileTree.map((node) => (
                  <FileItem key={node.id} node={node} depth={0} activeFileId={activeTabId} onSelect={handleSelectFile} onToggle={handleToggleFolder} onDelete={handleDeleteNode} onRename={handleRenameNode} themeColors={currentTheme.uiColors} />
                ))}
              </div>
            ) : sidebarTab === "lessons" ? (
              <div className="flex-1 overflow-y-auto py-3 px-3">
                <div className="space-y-3 text-xs" style={{ color: currentTheme.uiColors.text }}>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.uiColors.accent }}>Lesson Instructions</h3>
                  <p style={{ color: currentTheme.uiColors.muted }}>
                    The AI assistant analyzes your code in real time. When you pause typing for 2 seconds or write incorrect code, it will:
                  </p>
                  <ul className="list-disc list-inside space-y-1" style={{ color: currentTheme.uiColors.muted }}>
                    <li>Generate code from your prompts</li>
                    <li>Debug and explain concepts</li>
                    <li>Send code to the editor</li>
                  </ul>
                </div>
              </div>
            ) : sidebarTab === "snippets" ? (
              <div className="flex-1 overflow-y-auto py-1">
                <div className="px-3 py-1.5 text-[9px] uppercase tracking-wider" style={{ color: currentTheme.uiColors.muted }}>
                  {snippets.length} snippets available offline
                </div>
                {snippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    className="w-full text-left px-3 py-2 text-xs transition-colors hover:opacity-80 border-b"
                    style={{ color: currentTheme.uiColors.text, borderColor: currentTheme.uiColors.border + "40" }}
                    onClick={() => {
                      const fileName = `${snippet.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${snippet.language === "javascript" ? "js" : snippet.language === "python" ? "py" : snippet.language === "typescript" ? "ts" : snippet.language}`;
                      const fileId = `src/${fileName}`;
                      const existing = openTabs.find((t) => t.id === fileId);
                      if (existing) { setActiveTabId(fileId); return; }
                      setOpenTabs((prev) => [...prev, { id: fileId, name: fileName, language: snippet.language, content: snippet.code, isModified: false }]);
                      setActiveTabId(fileId);
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <FileCode2 className="h-3 w-3 shrink-0" style={{ color: currentTheme.uiColors.accent }} />
                      <span className="font-medium truncate">{snippet.title}</span>
                    </div>
                    <span className="text-[10px] mt-0.5 block truncate" style={{ color: currentTheme.uiColors.muted }}>{snippet.language}</span>
                  </button>
                ))}
                {snippets.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs" style={{ color: currentTheme.uiColors.muted }}>No snippets for this domain</div>
                )}
              </div>
            ) : (
              <div className="p-3">
                <input placeholder="Search files..." className="w-full rounded-md px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: currentTheme.uiColors.bg, border: `1px solid ${currentTheme.uiColors.border}`, color: currentTheme.uiColors.text }} />
              </div>
            )}
          </div>
        )}

        {/* Center: Editor */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Editor tabs */}
          <div className="flex items-center h-8 border-b overflow-x-auto shrink-0" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                className="group flex items-center gap-1.5 px-3 h-full cursor-pointer text-xs transition-colors shrink-0"
                style={{
                  backgroundColor: tab.id === activeTabId ? currentTheme.uiColors.bg : "transparent",
                  color: tab.id === activeTabId ? currentTheme.uiColors.text : currentTheme.uiColors.muted,
                  borderRight: `1px solid ${currentTheme.uiColors.border}`,
                  borderTop: tab.id === activeTabId ? `2px solid ${currentTheme.uiColors.accent}` : "2px solid transparent",
                }}
                onClick={() => setActiveTabId(tab.id)}
              >
                <File className={`h-3 w-3 ${getFileIcon(tab.name)}`} />
                <span className="whitespace-nowrap">{tab.name}</span>
                {tab.isModified && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: currentTheme.uiColors.accent + "99" }} />}
                <button onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }} className="opacity-0 group-hover:opacity-100 ml-1 transition-opacity" style={{ color: currentTheme.uiColors.muted }}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-1 px-2 shrink-0">
              {credits && (
                <span
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    color: credits.balance > 0 ? currentTheme.uiColors.accent : "#ef4444",
                    backgroundColor: (credits.balance > 0 ? currentTheme.uiColors.accent : "#ef4444") + "15",
                  }}
                  title={`${credits.planCredits} plan + ${credits.topupCredits} top-up credits`}
                >
                  <Coins className="h-3 w-3" />
                  {credits.balance} credits
                  {credits.balance === 0 && <a href="/pricing" className="underline">Top up</a>}
                </span>
              )}

              <button onClick={handleCopy} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Copy">
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button onClick={handleReset} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Reset">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button onClick={handleGenerateTests} disabled={chatLoading || !activeTab} className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30" title="Generate Tests">
                <TestTube2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={handleGenerateDocs} disabled={chatLoading || !activeTab} className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30" title="Generate Docs">
                <BookOpen className="h-3.5 w-3.5" />
              </button>
              <Button size="sm" onClick={handleRun} disabled={isRunning || !activeTab} className="h-6 gap-1 px-2.5 text-[10px]">
                {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                Run
              </Button>
              <RunLocallyDialog fileTree={fileTree} domainName={domainName} projectName={currentProjectName || "my-app"}>
                <Button size="sm" variant="outline" className="h-6 gap-1 px-2.5 text-[10px]">
                  <Download className="h-3 w-3" />
                  Run Locally
                </Button>
              </RunLocallyDialog>
              {activeTab && (
                (activeTab.language === "html" || activeTab.name.endsWith(".html") ||
                  (isAppDomain && (["javascript", "typescript"].includes(activeTab.language) || /\.(js|jsx|ts|tsx)$/.test(activeTab.name)))
                )
              ) && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`p-1 transition-colors ${showPreview ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  title={showPreview ? "Hide Preview" : isAppDomain ? "Show App Preview" : "Show Web Preview"}
                >
                  {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : isAppDomain ? <Smartphone className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Monaco editor + Preview */}
          <div className="flex flex-1 overflow-hidden">
            {/* Editor */}
            <div className={`relative flex-1 overflow-hidden ${showPreview ? "w-1/2" : "w-full"}`}>
              {activeTab ? (
                <Editor
                  height="100%"
                  language={activeTab.language}
                  value={activeTab.content}
                  onChange={handleCodeChange}
                  theme={currentTheme.monacoTheme}
                  onMount={(editor, monaco) => {
                    monacoEditorRef.current = editor;
                    (window as any).monaco = monaco;
                  }}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
                    minimap: { enabled: !showPreview, scale: 1, maxColumn: 80 },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    renderLineHighlight: "line",
                    padding: { top: 8 },
                    wordWrap: "on",
                    tabSize: 2,
                    automaticLayout: true,
                    bracketPairColorization: { enabled: true },
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    renderWhitespace: "selection",
                    inlineSuggest: { enabled: true },
                    quickSuggestions: true,
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium">Lunor.AI Editor</p>
                    <p className="text-xs">Open a file from the explorer to start coding</p>
                  </div>
                </div>
              )}
            </div>

            {/* Web Preview */}
            {showPreview && activeTab && (() => {
              const allFilesForPreview = collectFiles(fileTree);
              const filesListForPreview = Object.entries(allFilesForPreview).map(([path, content]) => ({ path, content }));
              const isReactProjectPreview = hasJSX(filesListForPreview);
              const isAppDomainOnly = domainId === "app-development";
              const showSandpackPreview = isAppDomainOnly && isReactProjectPreview;
              return (
              <div className={`flex flex-col border-l border-border overflow-hidden ${previewFullscreen ? "fixed inset-0 z-50 w-full h-full border-l-0" : "w-1/2"}`}>
                <div className="flex items-center h-7 bg-card border-b border-border px-2 shrink-0 gap-1">
                  {isAppDomain ? <Smartphone className="h-3 w-3 text-primary" /> : <Eye className="h-3 w-3 text-primary" />}
                  <span className="text-[10px] font-medium text-foreground">{isAppDomain ? "App Preview" : "Preview"}</span>
                  <span className="text-[9px] text-muted-foreground ml-0.5">— Live</span>
                  {/* Device label & dimensions indicator */}
                  {isAppDomain && currentDevice.type !== "desktop" && (
                    <div className="flex items-center gap-1 ml-1.5 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                      <span className="text-[9px] font-semibold text-primary">{currentDevice.label}</span>
                      <span className="text-[8px] text-primary/70">·</span>
                      <span className="text-[8px] font-mono text-primary/70">{currentDevice.w}×{currentDevice.h}</span>
                      <span className="text-[8px] text-primary/70">·</span>
                      <span className="text-[8px] text-primary/60 capitalize">{currentDevice.type}</span>
                    </div>
                  )}
                  {isAppDomain && currentDevice.type === "desktop" && (
                    <div className="flex items-center gap-1 ml-1.5 px-1.5 py-0.5 rounded bg-secondary/50">
                      <span className="text-[9px] font-semibold text-secondary-foreground/80">Desktop</span>
                      <span className="text-[8px] text-muted-foreground">· Responsive</span>
                    </div>
                  )}
                  <div className="flex-1" />
                  {/* Device switcher - expanded for app domain */}
                  {isAppDomain ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors hover:bg-secondary/50"
                        style={{ color: currentTheme.uiColors.text }}
                      >
                        {currentDevice.type === "phone" ? <Smartphone className="h-3 w-3" /> : currentDevice.type === "tablet" ? <Tablet className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                        {currentDevice.label}
                        <ChevronDown className="h-2.5 w-2.5" />
                      </button>
                      {showDeviceMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowDeviceMenu(false)} />
                          <div className="absolute top-full right-0 z-50 mt-1 w-44 rounded-md border py-1 shadow-xl" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
                            <div className="px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.uiColors.muted }}>Phones</div>
                            {(["iphone-se", "iphone-15", "pixel-8"] as DevicePreset[]).map((d) => (
                              <button key={d} onClick={() => { setPreviewDevice(d); setShowDeviceMenu(false); }}
                                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-[10px] transition-colors ${previewDevice === d ? "font-semibold" : ""}`}
                                style={{ color: previewDevice === d ? currentTheme.uiColors.accent : currentTheme.uiColors.text }}
                              >
                                <Smartphone className="h-3 w-3" />
                                {DEVICE_PRESETS[d].label}
                                <span className="ml-auto text-[8px]" style={{ color: currentTheme.uiColors.muted }}>{DEVICE_PRESETS[d].w}×{DEVICE_PRESETS[d].h}</span>
                              </button>
                            ))}
                            <div className="my-0.5 border-t" style={{ borderColor: currentTheme.uiColors.border }} />
                            <div className="px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.uiColors.muted }}>Tablets</div>
                            {(["ipad-mini", "ipad-pro", "android-tab"] as DevicePreset[]).map((d) => (
                              <button key={d} onClick={() => { setPreviewDevice(d); setShowDeviceMenu(false); }}
                                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-[10px] transition-colors ${previewDevice === d ? "font-semibold" : ""}`}
                                style={{ color: previewDevice === d ? currentTheme.uiColors.accent : currentTheme.uiColors.text }}
                              >
                                <Tablet className="h-3 w-3" />
                                {DEVICE_PRESETS[d].label}
                                <span className="ml-auto text-[8px]" style={{ color: currentTheme.uiColors.muted }}>{DEVICE_PRESETS[d].w}×{DEVICE_PRESETS[d].h}</span>
                              </button>
                            ))}
                            <div className="my-0.5 border-t" style={{ borderColor: currentTheme.uiColors.border }} />
                            <button onClick={() => { setPreviewDevice("desktop"); setShowDeviceMenu(false); }}
                              className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-[10px] transition-colors ${previewDevice === "desktop" ? "font-semibold" : ""}`}
                              style={{ color: previewDevice === "desktop" ? currentTheme.uiColors.accent : currentTheme.uiColors.text }}
                            >
                              <Monitor className="h-3 w-3" /> Desktop <span className="ml-auto text-[8px]" style={{ color: currentTheme.uiColors.muted }}>100%</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setPreviewDevice("iphone-15")} className={`p-0.5 transition-colors ${currentDevice.type === "phone" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Mobile">
                        <Smartphone className="h-3 w-3" />
                      </button>
                      <button onClick={() => setPreviewDevice("ipad-mini")} className={`p-0.5 transition-colors ${currentDevice.type === "tablet" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Tablet">
                        <Tablet className="h-3 w-3" />
                      </button>
                      <button onClick={() => setPreviewDevice("desktop")} className={`p-0.5 transition-colors ${previewDevice === "desktop" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`} title="Desktop">
                        <Monitor className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  {isAppDomain && currentDevice.type !== "desktop" && (
                    <>
                      <div className="w-px h-3.5 bg-border mx-0.5" />
                      <button
                        onClick={() => setDebugOverlay(!debugOverlay)}
                        className={`p-0.5 transition-colors ${debugOverlay ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        title="Layout Debug Overlay"
                      >
                        <Grid3X3 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  <div className="w-px h-3.5 bg-border mx-0.5" />
                  <button
                    onClick={() => {
                      const isHtml = !!activeTab && (activeTab.language === "html" || activeTab.name.endsWith(".html"));
                      if (!isHtml && !visualEditMode) {
                        toast.error("Open an .html page to use Visual Edit");
                        return;
                      }
                      setVisualEditMode((v) => !v);
                    }}
                    className={`p-0.5 transition-all duration-200 ${visualEditMode ? "text-primary scale-110 drop-shadow-[0_0_6px_hsl(var(--primary))]" : "text-muted-foreground hover:text-foreground"}`}
                    title="Visual Edit — click text to edit, drag to reorder, drop images"
                  >
                    <MousePointerClick className="h-3 w-3" />
                  </button>
                  {visualEditMode && (
                    <>
                      <button
                        onClick={undoVisualEdit}
                        disabled={!visualUndo.length}
                        className="p-0.5 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
                        title="Undo visual edit (Ctrl+Z)"
                      >
                        <Undo2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={redoVisualEdit}
                        disabled={!visualRedo.length}
                        className="p-0.5 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
                        title="Redo visual edit (Ctrl+Shift+Z)"
                      >
                        <Redo2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setPreviewZoom((z) => Math.max(50, z - 10))}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setPreviewZoom(100)}
                    className="text-[9px] font-mono text-muted-foreground hover:text-foreground transition-colors px-0.5"
                    title="Reset zoom"
                  >
                    {previewZoom}%
                  </button>
                  <button
                    onClick={() => setPreviewZoom((z) => Math.min(150, z + 10))}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </button>
                  <button
                    onClick={copyPreviewHtml}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy preview HTML"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    onClick={downloadPreviewHtml}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Download page as .html"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <div className="w-px h-3.5 bg-border mx-0.5" />
                  <button
                    onClick={hardRefreshPreview}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-transform duration-300 hover:rotate-180"
                    title="Refresh Preview (hard reload)"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => setPreviewFullscreen(!previewFullscreen)}
                    className={`p-0.5 transition-colors ${previewFullscreen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    title={previewFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                  >
                    {previewFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={() => {
                      const newWindow = window.open("", "_blank");
                      if (newWindow && previewContent) {
                        newWindow.document.open();
                        newWindow.document.write(previewContent);
                        newWindow.document.close();
                      }
                    }}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Open in New Tab"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {visualEditMode && (
                  <div className="flex items-center gap-2 px-2 py-1 shrink-0 border-b border-primary/30 bg-primary/10 animate-in fade-in slide-in-from-top-1">
                    <MousePointerClick className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[9px] text-primary font-medium">
                      Visual Edit ON — click text to type · drag to reorder · drop an image to swap · Del to remove · Ctrl+Z undo / Ctrl+Shift+Z redo. Code updates live.
                    </span>
                  </div>
                )}
                <div className={`flex-1 flex items-center justify-center overflow-auto min-h-0 ${showSandpackPreview ? "bg-[#1a1a2e] p-0" : isAppDomain && currentDevice.type !== "desktop" ? "bg-[#1a1a2e] p-4" : "bg-[#1a1a2e] p-0"}`}>
                  {showSandpackPreview ? (
                    <SandpackPreviewPanel
                      fileTree={fileTree}
                      projectName={currentProjectName || "app"}
                      showEditor={false}
                      className="w-full h-full"
                      apiUrl={liveRuntime.apiUrl}
                    />
                  ) : isAppDomain && currentDevice.type === "phone" ? (
                    /* Phone frame */
                    <div className="relative flex flex-col items-center" style={{ transform: currentDevice.h > 700 ? "scale(0.72)" : "scale(0.85)", transformOrigin: "top center" }}>
                      <div className="relative rounded-[2.5rem] border-[3px] border-[#333] bg-[#111] shadow-2xl overflow-hidden" style={{ width: `${currentDevice.w}px`, height: `${currentDevice.h}px` }}>
                        {/* Notch / Dynamic Island / Punch Hole */}
                        {currentDevice.notch === "dynamic-island" && (
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-[#000] rounded-[20px] z-10 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e] mr-6" />
                          </div>
                        )}
                        {currentDevice.notch === "notch" && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-[#111] rounded-b-2xl z-10 flex items-center justify-center">
                            <div className="w-14 h-3.5 rounded-full bg-[#222]" />
                          </div>
                        )}
                        {currentDevice.notch === "punch-hole" && (
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#1a1a2e] rounded-full z-10 border border-[#333]" />
                        )}
                        {/* Status bar */}
                        <div className="h-12 bg-[#0f0f23] flex items-end justify-between px-6 pb-1 text-[9px] text-[#888]">
                          <span>9:41</span>
                          <div className="flex items-center gap-1">
                            <span>📶</span><span>🔋</span>
                          </div>
                        </div>
                        <iframe
                          key={previewKey}
                          ref={iframeRef}
                          srcDoc={previewContent}
                          className="border-0 w-full"
                          style={{ height: "calc(100% - 48px)", zoom: previewZoom / 100 }}
                          sandbox="allow-scripts allow-modals allow-forms allow-popups"
                          title="App Preview"
                        />
                        {/* Debug overlay - phone */}
                        {debugOverlay && (
                          <div className="absolute inset-0 z-20 pointer-events-none" style={{ top: "48px" }}>
                            {/* Safe area top */}
                            <div className="absolute top-0 left-0 right-0 h-11 border-b border-dashed border-primary/50 bg-primary/5">
                              <span className="absolute right-1 top-0.5 text-[7px] font-mono text-primary/70">safe-area-top</span>
                            </div>
                            {/* Safe area bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-8 border-t border-dashed border-primary/50 bg-primary/5">
                              <span className="absolute right-1 bottom-0.5 text-[7px] font-mono text-primary/70">safe-area-bottom</span>
                            </div>
                            {/* Center crosshair */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6">
                              <div className="absolute top-1/2 left-0 right-0 h-px bg-red-400/40" />
                              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-400/40" />
                            </div>
                            {/* Grid columns */}
                            <div className="absolute inset-0 flex">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex-1 border-r border-dashed border-primary/20" />
                              ))}
                            </div>
                            {/* Horizontal thirds */}
                            <div className="absolute left-0 right-0" style={{ top: "33%" }}>
                              <div className="h-px bg-primary/15" />
                            </div>
                            <div className="absolute left-0 right-0" style={{ top: "66%" }}>
                              <div className="h-px bg-primary/15" />
                            </div>
                            {/* Padding guides */}
                            <div className="absolute top-0 bottom-0 left-4 w-px border-l border-dotted border-yellow-400/30" />
                            <div className="absolute top-0 bottom-0 right-4 w-px border-r border-dotted border-yellow-400/30" />
                            {/* Breakpoint label */}
                            <div className="absolute top-12 left-1 bg-[#000]/70 rounded px-1.5 py-0.5 text-[7px] font-mono text-green-400">
                              {currentDevice.w}px · {currentDevice.w <= 375 ? "compact" : currentDevice.w <= 414 ? "regular" : "wide"}
                            </div>
                          </div>
                        )}
                        {/* Home indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-[#555]" />
                      </div>
                      <span className="mt-2 text-[9px] text-[#666]">{currentDevice.label} — {currentDevice.w}×{currentDevice.h}</span>
                    </div>
                  ) : isAppDomain && currentDevice.type === "tablet" ? (
                    /* Tablet frame */
                    <div className="relative flex flex-col items-center" style={{ transform: "scale(0.5)", transformOrigin: "top center" }}>
                      <div className="relative rounded-[1.5rem] border-[4px] border-[#333] bg-[#111] shadow-2xl overflow-hidden" style={{ width: `${currentDevice.w}px`, height: `${currentDevice.h}px` }}>
                        <div className="h-8 bg-[#0f0f23] flex items-end justify-between px-6 pb-1 text-[10px] text-[#888]">
                          <span>9:41</span>
                          <div className="flex items-center gap-1"><span>📶</span><span>🔋</span></div>
                        </div>
                        <iframe
                          key={previewKey}
                          ref={iframeRef}
                          srcDoc={previewContent}
                          className="border-0 w-full"
                          style={{ height: "calc(100% - 32px)", zoom: previewZoom / 100 }}
                          sandbox="allow-scripts allow-modals allow-forms allow-popups"
                          title="App Preview"
                        />
                        {/* Debug overlay - tablet */}
                        {debugOverlay && (
                          <div className="absolute inset-0 z-20 pointer-events-none" style={{ top: "32px" }}>
                            <div className="absolute top-0 left-0 right-0 h-6 border-b border-dashed border-primary/50 bg-primary/5">
                              <span className="absolute right-1 top-0.5 text-[7px] font-mono text-primary/70">safe-area-top</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-5 border-t border-dashed border-primary/50 bg-primary/5">
                              <span className="absolute right-1 bottom-0.5 text-[7px] font-mono text-primary/70">safe-area-bottom</span>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                              <div className="absolute top-1/2 left-0 right-0 h-px bg-red-400/40" />
                              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-400/40" />
                            </div>
                            <div className="absolute inset-0 flex">
                              {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex-1 border-r border-dashed border-primary/15" />
                              ))}
                            </div>
                            <div className="absolute top-0 bottom-0 left-5 w-px border-l border-dotted border-yellow-400/25" />
                            <div className="absolute top-0 bottom-0 right-5 w-px border-r border-dotted border-yellow-400/25" />
                            <div className="absolute top-7 left-1 bg-[#000]/70 rounded px-1.5 py-0.5 text-[8px] font-mono text-green-400">
                              {currentDevice.w}px · tablet
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-[#555]" />
                      </div>
                      <span className="mt-2 text-[9px] text-[#666]">{currentDevice.label} — {currentDevice.w}×{currentDevice.h}</span>
                    </div>
                  ) : (
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      srcDoc={previewContent}
                      className="border-0 bg-white transition-all duration-200"
                      style={{
                        width: currentDevice.type === "phone" ? `${currentDevice.w}px` : currentDevice.type === "tablet" ? `${currentDevice.w}px` : "100%",
                        height: "100%",
                        maxWidth: "100%",
                        zoom: previewZoom / 100,
                      }}
                      sandbox="allow-scripts allow-modals allow-forms allow-popups"
                      title="Web Preview"
                    />
                  )}
                </div>
              </div>
            );})()}
          </div>

          {/* Terminal panel (bottom) */}
          {showTerminal && (
            <div className="flex flex-col h-40 border-t shrink-0" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
              <div className="flex items-center h-7 border-b px-2 shrink-0" style={{ borderColor: currentTheme.uiColors.border }}>
                <span className="px-2 py-1 text-[10px] font-medium" style={{ color: currentTheme.uiColors.text }}>Terminal</span>
                <div className="flex-1" />
                <button onClick={() => setShowTerminal(false)} className="p-0.5" style={{ color: currentTheme.uiColors.muted }}>
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs" style={{ backgroundColor: currentTheme.uiColors.bg }}>
                {output.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap" style={{ color: currentTheme.uiColors.text + "cc" }}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Assistant Panel */}
        {showAIPanel && (
          <div className="flex flex-col w-80 lg:w-96 border-l shrink-0 overflow-hidden" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
            {/* AI Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: currentTheme.uiColors.border }}>
              <Sparkles className="h-4 w-4" style={{ color: currentTheme.uiColors.accent }} />
              <span className="text-xs font-semibold" style={{ color: currentTheme.uiColors.text }}>AI Assistant</span>
              <div className="flex-1" />
              <button onClick={handleClearChat} className="p-1 transition-colors" style={{ color: currentTheme.uiColors.muted }} title="Clear chat">
                <Trash2 className="h-3 w-3" />
              </button>
              <button onClick={() => setShowAIPanel(false)} className="p-1 transition-colors" style={{ color: currentTheme.uiColors.muted }}>
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ backgroundColor: currentTheme.uiColors.bg }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: msg.role === "user" ? currentTheme.uiColors.border : currentTheme.uiColors.accent + "20" }}>
                    {msg.role === "user" ? <span className="text-[9px] font-medium" style={{ color: currentTheme.uiColors.text }}>U</span> : <Bot className="h-3.5 w-3.5" style={{ color: currentTheme.uiColors.accent }} />}
                  </div>
                  <div
                    className="max-w-[88%] rounded-lg px-3 py-2 text-xs"
                    style={{
                      backgroundColor: msg.role === "user" ? currentTheme.uiColors.accent : currentTheme.uiColors.card,
                      color: msg.role === "user" ? "#ffffff" : currentTheme.uiColors.text,
                      border: msg.role === "user" ? "none" : `1px solid ${currentTheme.uiColors.border}`,
                    }}
                  >
                    <div className="prose prose-sm max-w-none break-words overflow-hidden [&_pre]:p-2.5 [&_pre]:rounded-md [&_pre]:text-[10px] [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:px-1 [&_code]:rounded-sm [&_code]:break-all [&_pre]:relative [&_pre_code]:break-normal [&_pre_code]:whitespace-pre"
                      style={{
                        // Override prose colors to match theme
                        ["--tw-prose-body" as string]: msg.role === "user" ? "#ffffff" : currentTheme.uiColors.text,
                        ["--tw-prose-headings" as string]: msg.role === "user" ? "#ffffff" : currentTheme.uiColors.text,
                        ["--tw-prose-code" as string]: currentTheme.uiColors.accent,
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          pre({ children, ...props }) {
                            const codeEl = (children as any)?.props;
                            const codeText = codeEl?.children || "";
                            const className = codeEl?.className || "";
                            const lang = className.replace("language-", "") || "javascript";
                            return (
                              <div className="relative group">
                                <div className="flex items-center justify-between rounded-t-md px-2 py-1" style={{ backgroundColor: currentTheme.uiColors.bg, border: `1px solid ${currentTheme.uiColors.border}`, borderBottom: "none" }}>
                                  <span className="text-[9px] font-mono" style={{ color: currentTheme.uiColors.muted }}>{lang}</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => applyCodeToEditor(String(codeText).trim(), lang)}
                                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors"
                                      style={{ backgroundColor: currentTheme.uiColors.accent + "25", color: currentTheme.uiColors.accent }}
                                      title="Apply to Editor"
                                    >
                                      <ArrowRightToLine className="h-2.5 w-2.5" />
                                      Apply
                                    </button>
                                  </div>
                                </div>
                                <pre {...props} className="!rounded-t-none !mt-0" style={{ backgroundColor: currentTheme.uiColors.bg, border: `1px solid ${currentTheme.uiColors.border}`, color: currentTheme.uiColors.text }}>{children}</pre>
                              </div>
                            );
                          },
                          code({ children, className, ...props }) {
                            const isInline = !className;
                            if (isInline) {
                              return <code style={{ color: currentTheme.uiColors.accent, backgroundColor: currentTheme.uiColors.bg + "80" }} {...props}>{children}</code>;
                            }
                            return <code style={{ color: currentTheme.uiColors.text }} {...props}>{children}</code>;
                          },
                          strong({ children }) {
                            return <strong style={{ color: currentTheme.uiColors.accent }}>{children}</strong>;
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: currentTheme.uiColors.accent + "20" }}><Bot className="h-3.5 w-3.5" style={{ color: currentTheme.uiColors.accent }} /></div>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: currentTheme.uiColors.card, border: `1px solid ${currentTheme.uiColors.border}` }}>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: currentTheme.uiColors.accent }} />
                    <span className="text-xs" style={{ color: currentTheme.uiColors.muted }}>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Responsive Checklist & Layout Suggestions (app-development only) */}
            {isAppDomain && showChecklist && (
              <div className="border-t overflow-y-auto shrink-0" style={{ borderColor: currentTheme.uiColors.border, backgroundColor: currentTheme.uiColors.bg, maxHeight: "260px" }}>
                <div className="px-3 py-2 flex items-center justify-between border-b" style={{ borderColor: currentTheme.uiColors.border, backgroundColor: currentTheme.uiColors.card }}>
                  <span className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: currentTheme.uiColors.text }}>
                    <Ruler className="h-3 w-3" style={{ color: currentTheme.uiColors.accent }} /> Responsive Checklist
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: currentTheme.uiColors.muted }}>
                    {Object.values(checklistItems).filter(Boolean).length}/{RESPONSIVE_CHECKLIST.length}
                  </span>
                </div>
                <div className="p-2 space-y-0.5">
                  {RESPONSIVE_CHECKLIST.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setChecklistItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="flex items-start gap-2 w-full text-left px-2 py-1.5 rounded transition-colors"
                      style={{ backgroundColor: checklistItems[item.id] ? currentTheme.uiColors.accent + "10" : "transparent" }}
                    >
                      <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[8px]"
                        style={{
                          borderColor: checklistItems[item.id] ? currentTheme.uiColors.accent : currentTheme.uiColors.border,
                          backgroundColor: checklistItems[item.id] ? currentTheme.uiColors.accent : "transparent",
                          color: checklistItems[item.id] ? "#fff" : "transparent",
                        }}
                      >{checklistItems[item.id] ? "✓" : ""}</div>
                      <div>
                        <span className="text-[10px] font-medium" style={{ color: currentTheme.uiColors.text, textDecoration: checklistItems[item.id] ? "line-through" : "none", opacity: checklistItems[item.id] ? 0.6 : 1 }}>{item.label}</span>
                        <p className="text-[8px] mt-0.5" style={{ color: currentTheme.uiColors.muted }}>{item.hint}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Auto-suggest layouts */}
                <div className="px-3 py-2 border-t" style={{ borderColor: currentTheme.uiColors.border }}>
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.uiColors.muted }}>Quick Layout Templates</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1">
                    {LAYOUT_SUGGESTIONS.map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => {
                          setChatInput(layout.prompt);
                          setShowChecklist(false);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-left transition-colors"
                        style={{ backgroundColor: currentTheme.uiColors.card, border: `1px solid ${currentTheme.uiColors.border}` }}
                      >
                        <span className="text-sm">{layout.icon}</span>
                        <div>
                          <span className="text-[9px] font-medium block" style={{ color: currentTheme.uiColors.text }}>{layout.label}</span>
                          <span className="text-[7px]" style={{ color: currentTheme.uiColors.muted }}>{layout.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Input */}
            <div className="border-t p-2 shrink-0" style={{ borderColor: currentTheme.uiColors.border, backgroundColor: currentTheme.uiColors.card }}>
              <div className="flex items-center justify-between mb-1">
                {isAppDomain && (
                  <button
                    onClick={() => setShowChecklist(!showChecklist)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors"
                    style={{ color: showChecklist ? currentTheme.uiColors.accent : currentTheme.uiColors.muted, backgroundColor: showChecklist ? currentTheme.uiColors.accent + "15" : "transparent" }}
                  >
                    <Ruler className="h-3 w-3" />
                    Responsive
                  </button>
                )}
              </div>
              {credits && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    color: credits.balance > 0 ? currentTheme.uiColors.accent : "#ef4444",
                    backgroundColor: (credits.balance > 0 ? currentTheme.uiColors.accent : "#ef4444") + "15",
                  }}
                  title={`${credits.planCredits} plan credits + ${credits.topupCredits} top-up credits`}
                >
                  {credits.balance} credits
                  {credits.balance === 0 && (
                    <a href="/pricing" className="underline ml-1">Top up</a>
                  )}
                </div>
              )}
              <VoiceAssistant
                supported={voice.supported}
                listening={voice.listening}
                speaking={voice.speaking}
                transcript={voice.transcript}
                error={voice.error}
                voiceEnabled={voice.voiceEnabled}
                disabled={chatLoading}
                accent={currentTheme.uiColors.accent}
                muted={currentTheme.uiColors.muted}
                onToggleListening={voice.toggleListening}
                onToggleVoice={() => voice.setVoiceEnabled(!voice.voiceEnabled)}
                onStopSpeaking={voice.stopSpeaking}
              />
              <div className="mt-1 flex gap-1.5">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                  placeholder={`Ask about ${domainName.toLowerCase()}...`}
                  className="flex-1 rounded-md px-2.5 py-1.5 text-xs outline-none"
                  style={{
                    backgroundColor: currentTheme.uiColors.bg,
                    color: currentTheme.uiColors.text,
                    border: `1px solid ${currentTheme.uiColors.border}`,
                  }}
                  disabled={chatLoading}
                />
                <button
                  className="h-7 px-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: currentTheme.uiColors.accent, color: "#ffffff" }}
                  onClick={() => handleChatSend()}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-[9px] text-center" style={{ color: currentTheme.uiColors.muted }}>
                Code is <span className="font-medium" style={{ color: currentTheme.uiColors.accent }}>automatically applied</span> to your files
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Automated preview verification — quiet success badge only */}
      {verify && !verify.running && verify.results.length > 0 && verify.results.every((r) => r.passed) && (
        <div className="fixed bottom-10 left-4 z-[9997] rounded-lg border border-primary/40 bg-card/95 px-3 py-2 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[11px] font-semibold text-primary">✓ Preview verified</p>
        </div>
      )}

      {/* Preview runtime error — one-click AI fix */}
      {previewError && (
        <div className="fixed bottom-10 right-4 z-[9998] w-72 rounded-lg border border-destructive/40 bg-card/95 p-3 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-destructive text-sm">⚠</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground">1 error in preview</p>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground line-clamp-3 break-words">{previewError.message}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handleResolveError}
                  disabled={resolvingError}
                  className="h-6 rounded-md bg-primary px-2 text-[10px] font-medium text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-60"
                >
                  {resolvingError ? "Resolving…" : "Resolve error"}
                </button>
                <button
                  onClick={() => setPreviewError(null)}
                  className="h-6 rounded-md px-2 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between h-6 border-t px-3 shrink-0 select-none" style={{ backgroundColor: currentTheme.uiColors.accent + "18", borderColor: currentTheme.uiColors.border }}>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> main</span>
          {isRunning && <span className="flex items-center gap-1 text-primary"><Loader2 className="h-3 w-3 animate-spin" /> Running...</span>}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {activeTab && <span>{activeTab.language}</span>}
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span className="text-primary font-medium">Lunor.AI</span>
        </div>
      </div>
    </div>
  );
});

export default CodeEditorComponent;
