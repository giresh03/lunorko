import { useState, useCallback, useImperativeHandle, forwardRef, useMemo, useRef, useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import {
  Play, RotateCcw, Copy, Check, ChevronRight, Loader2, X,
  File, FolderOpen, FolderClosed, Plus, Trash2, FilePlus, FolderPlus,
  Terminal as TerminalIcon, Bot, Send, Minimize2, Settings,
  Search, GitBranch, ArrowRightToLine, Sparkles, PanelRightClose, PanelRightOpen,
  FolderPlus as NewProject, Clock, ChevronDown, Save, FolderInput, FileCode2,
  Eye, EyeOff, RefreshCw, Smartphone, Monitor, Tablet, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { editorThemes, getThemeById, type EditorTheme } from "@/lib/editorThemes";
import { getDomainEnvironment, domainEnvironments } from "@/lib/domainEnvironments";
import {
  syncTemplatesFromImport, getSnippetsForDomain, cacheAIResponse,
  findCachedAIResponse, isOnline, getOfflineStatus, setOfflineMode,
  type CachedSnippet,
} from "@/lib/offlineCache";

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
    js: "text-yellow-400", ts: "text-blue-400", py: "text-green-400",
    html: "text-orange-400", css: "text-purple-400", json: "text-yellow-300",
    jsx: "text-cyan-400", tsx: "text-blue-300", md: "text-muted-foreground",
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
  const regex = /(?:(?:[\*`]*(\w+\.\w+)[\*`]*\s*:?\s*\n))?```(\w*)\n([\s\S]*?)```/g;
  const blocks: { code: string; language: string; filename?: string }[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const filename = match[1] || undefined;
    const lang = match[2] || "javascript";
    blocks.push({ language: lang, code: match[3].trim(), filename });
  }
  // If no filenames found via regex, try to detect from common patterns like "<!-- filename: xxx -->" or "// filename: xxx"
  if (blocks.length > 0 && !blocks.some(b => b.filename)) {
    const filenameRegex = /(?:file(?:name)?|save\s+(?:as|to)|create)\s*:?\s*[`"']?(\w[\w\-]*\.\w+)[`"']?/gi;
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

// -- File Explorer Item --
const FileItem = ({
  node, depth, activeFileId, onSelect, onToggle, onDelete, onRename, themeColors,
}: {
  node: FileNode; depth: number; activeFileId: string | null;
  onSelect: (node: FileNode) => void; onToggle: (id: string) => void;
  onDelete: (id: string) => void; onRename: (id: string, name: string) => void;
  themeColors: EditorTheme["uiColors"];
}) => {
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

const CodeEditorComponent = forwardRef<CodeEditorHandle, IDEProps>(({ domainName, onExit }, ref) => {
  // File tree state
  const [fileTree, setFileTree] = useState<FileNode[]>(() => createDefaultProject(domainName));
  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => {
    const tree = createDefaultProject(domainName);
    const defaultFile = tree[0]?.children?.[0];
    return defaultFile ? [{ id: defaultFile.id, name: defaultFile.name, language: defaultFile.language || "javascript", content: defaultFile.content || "", isModified: false }] : [];
  });
  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    const tree = createDefaultProject(domainName);
    return tree[0]?.children?.[0]?.id || null;
  });

  // Panels
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"files" | "search" | "snippets">("files");
  const [showAIPanel, setShowAIPanel] = useState(true);
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
  const currentDevice = DEVICE_PRESETS[previewDevice];
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => `proj-${Date.now()}`);
  const [currentProjectName, setCurrentProjectName] = useState<string>(`${domainName} Workspace`);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectTemplate, setNewProjectTemplate] = useState("web-app");
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [recentProjects, setRecentProjects] = useState<SavedProject[]>(() => getSavedProjects());

  // AI Chat
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `👋 I'm your **${domainName}** AI assistant — like Cursor! Ask me to:\n\n- **Generate code** — it auto-updates in the editor\n- **Debug** — paste code and I'll fix it\n- **Explain concepts** — with examples\n- **Install packages** — I'll show you how\n\nCode I generate is **automatically applied** to your active file. 🚀` },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New file/folder input
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [newItemName, setNewItemName] = useState("");

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useImperativeHandle(ref, () => ({
    setExternalCode: (code: string, lang: string) => {
      const id = `untitled-${Date.now()}`;
      const name = `untitled.${lang === "typescript" ? "ts" : lang === "python" ? "py" : "js"}`;
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
  const collectFiles = useCallback((nodes: FileNode[]): Record<string, string> => {
    const files: Record<string, string> = {};
    const walk = (ns: FileNode[]) => {
      for (const n of ns) {
        if (n.type === "file" && n.content) files[n.name] = n.content;
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
    const strippedCode = code
      .replace(/^\s*import\s+.*?[;\n]/gm, "")
      .replace(/^\s*export\s+(default\s+)?/gm, "");
    const hasJSX = /<\w+[\s/>]/.test(code);
    const componentMatch = code.match(/(?:function|const)\s+(\w+)/);
    const componentName = componentMatch?.[1] || "App";

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
button { padding: 8px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; font-size: 14px; cursor: pointer; margin: 4px; }
button:active { opacity: 0.8; }
input, textarea { padding: 8px 12px; border-radius: 8px; border: 1px solid #333; background: #1a1a2e; color: #e0e0e0; font-size: 14px; width: 100%; margin: 4px 0; }
h1 { font-size: 24px; margin-bottom: 12px; } h2 { font-size: 20px; margin-bottom: 8px; }
p { font-size: 14px; line-height: 1.5; margin-bottom: 8px; }
${allCss}
</style>
</head><body>
<div id="root"></div>
<script type="text/babel">
const { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext } = React;
${strippedCode}
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(${componentName}));
} catch(e) {
  document.getElementById('root').innerHTML = '<div style="padding:16px;color:#ff6b6b;"><h3>Render Error</h3><pre style="font-size:12px;margin-top:8px;white-space:pre-wrap;">' + e.message + '</pre></div>';
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
h3 { color: #6366f1; margin-bottom: 8px; font-size: 14px; }
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

  // Build a full HTML document for preview by injecting sibling CSS/JS
  const buildPreviewHtml = useCallback((htmlContent: string, allFiles: Record<string, string>) => {
    let html = htmlContent;
    
    // Find referenced CSS files and inject inline if they exist in the project
    const cssLinkRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi;
    let cssMatch;
    while ((cssMatch = cssLinkRegex.exec(htmlContent)) !== null) {
      const cssFileName = cssMatch[1].split("/").pop() || "";
      if (allFiles[cssFileName]) {
        html = html.replace(cssMatch[0], `<style>/* ${cssFileName} */\n${allFiles[cssFileName]}</style>`);
      }
    }
    
    // Find referenced JS files and inject inline if they exist in the project
    const jsScriptRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi;
    let jsMatch;
    while ((jsMatch = jsScriptRegex.exec(htmlContent)) !== null) {
      const jsFileName = jsMatch[1].split("/").pop() || "";
      if (allFiles[jsFileName]) {
        html = html.replace(jsMatch[0], `<script>/* ${jsFileName} */\n${allFiles[jsFileName]}</script>`);
      }
    }
    
    return html;
  }, []);

  const isAppDomain = domainId === "app-development";

  // Update preview content with debouncing
  const updatePreview = useCallback(() => {
    if (!activeTab || !showPreview) return;
    const allFiles = collectFiles(fileTree);
    const isHtml = activeTab.language === "html" || activeTab.name.endsWith(".html");
    const isJsLike = ["javascript", "typescript"].includes(activeTab.language) || /\.(js|jsx|ts|tsx)$/.test(activeTab.name);

    if (isHtml) {
      setPreviewContent(buildPreviewHtml(activeTab.content, allFiles));
    } else if (isAppDomain && isJsLike) {
      setPreviewContent(buildAppPreviewHtml(activeTab.content, activeTab.language, allFiles));
    }
  }, [activeTab, showPreview, fileTree, collectFiles, buildPreviewHtml, buildAppPreviewHtml, isAppDomain]);

  // Debounced preview update when content changes
  useEffect(() => {
    if (!showPreview || !activeTab) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(updatePreview, 300);
    return () => { if (previewTimerRef.current) clearTimeout(previewTimerRef.current); };
  }, [activeTab?.content, showPreview, updatePreview]);

  // Auto-open preview when switching to HTML file or JS file in app-dev domain
  useEffect(() => {
    if (!activeTab) return;
    const isHtml = activeTab.language === "html" || activeTab.name.endsWith(".html");
    const isJsLike = ["javascript", "typescript"].includes(activeTab.language) || /\.(js|jsx|ts|tsx)$/.test(activeTab.name);
    if (isHtml || (isAppDomain && isJsLike)) {
      setShowPreview(true);
    }
  }, [activeTabId, isAppDomain]);

  const handleCodeChange = (val: string | undefined) => {
    if (!activeTabId) return;
    setOpenTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, content: val || "", isModified: true } : t));
    setFileTree((prev) => updateNode(prev, activeTabId, (n) => ({ ...n, content: val || "" })));
  };

  // Auto-apply code to editor — creates new file if language doesn't match active file
  const applyCodeToEditor = useCallback((code: string, language: string, filename?: string) => {
    const activeLanguage = activeTab?.language;
    const normalizedLang = LANG_MAP[language] || language;
    const langMatches = activeLanguage === normalizedLang || activeLanguage === language;

    if (activeTabId && langMatches && !filename) {
      // Same language — update active file
      setOpenTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, content: code, isModified: true } : t));
      setFileTree((prev) => updateNode(prev, activeTabId, (n) => ({ ...n, content: code })));
    } else {
      // Different language or explicit filename — create a new file
      const ext = LANG_EXT_MAP[normalizedLang] || LANG_EXT_MAP[language] || language || "js";
      const newName = filename || `untitled-${Date.now().toString(36)}.${ext}`;
      const newId = `src/${newName}`;
      const newNode: FileNode = { id: newId, name: newName, type: "file", language: normalizedLang || getLang(newName), content: code };
      const newTab: OpenTab = { id: newId, name: newName, language: normalizedLang || getLang(newName), content: code, isModified: true };

      // Add to src folder
      setFileTree((prev) => {
        const srcFolder = prev.find(n => n.id === "src" && n.type === "folder");
        if (srcFolder) return addChild(prev, "src", newNode);
        return [...prev, newNode];
      });
      setOpenTabs((prev) => [...prev, newTab]);
      setActiveTabId(newId);
    }
  }, [activeTabId, activeTab, updateNode, addChild]);

  // -- Run Code --
  const handleRun = useCallback(async () => {
    if (!activeTab) return;
    setIsRunning(true);
    setShowTerminal(true);
    const lang = activeTab.language;
    const isNative = lang === "javascript" || lang === "typescript";
    setOutput([`$ Running ${activeTab.name}...`, isNative ? "⚡ Native runtime" : `🤖 AI-simulated ${lang} runtime`]);

    try {
      const resp = await fetch(CODE_ENGINE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ action: "execute", code: activeTab.content, language: lang, domain: domainName }),
      });
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
      setOutput((p) => [...p, `❌ ${err instanceof Error ? err.message : String(err)}`]);
    }
    setIsRunning(false);
  }, [activeTab, domainName]);

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
  const handleChatSend = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: Message = { role: "user", content: chatInput };
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
      const cached = findCachedAIResponse(chatInput, domainId);
      if (cached) {
        upsert(cached.response);
      } else {
        upsert("📴 **Offline mode** — no cached response found for this query.\n\nTry browsing the **Snippets** tab in the sidebar for pre-loaded code examples.");
      }
    } else {
      try {
        const resp = await fetch(CODE_ENGINE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ action: "generate", messages: updated.map((m) => ({ role: m.role, content: m.content })), domain: domainName }),
        });
        if (!resp.ok) { upsert("❌ Request failed."); setChatLoading(false); return; }
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
        if (assistantSoFar) cacheAIResponse(chatInput, domainId, assistantSoFar);
      } catch { upsert("❌ Connection error. Switching to offline mode."); }
    }

    // Auto-apply: extract code blocks and create appropriate files
    const userPrompt = updated.filter(m => m.role === "user").pop()?.content;
    const codeBlocks = extractCodeBlocks(assistantSoFar, userPrompt);
    if (codeBlocks.length > 0) {
      // Apply each block — creates new files for different languages
      codeBlocks.forEach((block) => {
        applyCodeToEditor(block.code, block.language, block.filename);
      });
    }

    setChatLoading(false);
  }, [chatInput, chatLoading, messages, domainName, applyCodeToEditor]);

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
          <button className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <GitBranch className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <button onClick={() => setShowAIPanel(!showAIPanel)} className={`p-2 rounded-md transition-colors ${showAIPanel ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Sparkles className="h-4 w-4" />
          </button>
          <button onClick={() => setShowTerminal(!showTerminal)} className={`p-2 rounded-md transition-colors ${showTerminal ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <TerminalIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar - file explorer */}
        {showSidebar && (
          <div className="flex flex-col w-56 border-r shrink-0 overflow-hidden" style={{ backgroundColor: currentTheme.uiColors.card, borderColor: currentTheme.uiColors.border }}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: currentTheme.uiColors.border }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.uiColors.muted }}>
                {sidebarTab === "files" ? "Explorer" : sidebarTab === "snippets" ? "Snippets" : "Search"}
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
            {sidebarTab === "files" ? (
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
              <button onClick={handleCopy} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Copy">
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button onClick={handleReset} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Reset">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <Button size="sm" onClick={handleRun} disabled={isRunning || !activeTab} className="h-6 gap-1 px-2.5 text-[10px]">
                {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                Run
              </Button>
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
            <div className={`flex-1 overflow-hidden ${showPreview ? "w-1/2" : "w-full"}`}>
              {activeTab ? (
                <Editor
                  height="100%"
                  language={activeTab.language}
                  value={activeTab.content}
                  onChange={handleCodeChange}
                  theme={currentTheme.monacoTheme}
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
            {showPreview && activeTab && (
              <div className="flex flex-col w-1/2 border-l border-border overflow-hidden">
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
                  <div className="w-px h-3.5 bg-border mx-0.5" />
                  <button
                    onClick={updatePreview}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Refresh Preview"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className={`flex-1 flex items-center justify-center overflow-auto ${isAppDomain && currentDevice.type !== "desktop" ? "bg-[#1a1a2e] p-4" : "bg-[#1a1a2e] p-0"}`}>
                  {isAppDomain && currentDevice.type === "phone" ? (
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
                          ref={iframeRef}
                          srcDoc={previewContent}
                          className="border-0 w-full"
                          style={{ height: "calc(100% - 48px)" }}
                          sandbox="allow-scripts allow-modals allow-forms allow-popups"
                          title="App Preview"
                        />
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
                          ref={iframeRef}
                          srcDoc={previewContent}
                          className="border-0 w-full"
                          style={{ height: "calc(100% - 32px)" }}
                          sandbox="allow-scripts allow-modals allow-forms allow-popups"
                          title="App Preview"
                        />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-[#555]" />
                      </div>
                      <span className="mt-2 text-[9px] text-[#666]">{currentDevice.label} — {currentDevice.w}×{currentDevice.h}</span>
                    </div>
                  ) : (
                    <iframe
                      ref={iframeRef}
                      srcDoc={previewContent}
                      className="border-0 bg-background transition-all duration-200"
                      style={{
                        width: currentDevice.type === "phone" ? `${currentDevice.w}px` : currentDevice.type === "tablet" ? `${currentDevice.w}px` : "100%",
                        height: "100%",
                        maxWidth: "100%",
                      }}
                      sandbox="allow-scripts allow-modals allow-forms allow-popups"
                      title="Web Preview"
                    />
                  )}
                </div>
              </div>
            )}
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
              <span className="rounded-sm px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: currentTheme.uiColors.accent + "20", color: currentTheme.uiColors.accent }}>Auto-Apply</span>
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

            {/* AI Input */}
            <div className="border-t p-2 shrink-0" style={{ borderColor: currentTheme.uiColors.border, backgroundColor: currentTheme.uiColors.card }}>
              <div className="flex gap-1.5">
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
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-[9px] text-center" style={{ color: currentTheme.uiColors.muted }}>
                Code is <span className="font-medium" style={{ color: currentTheme.uiColors.accent }}>auto-applied</span> to your active file
              </p>
            </div>
          </div>
        )}
      </div>

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
