import { useState, useCallback, useImperativeHandle, forwardRef, useMemo, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Play, RotateCcw, Copy, Check, ChevronRight, Loader2, X,
  File, FolderOpen, FolderClosed, Plus, Trash2, FilePlus, FolderPlus,
  Terminal as TerminalIcon, Bot, Send, Minimize2, Settings,
  Search, GitBranch, ArrowRightToLine, Sparkles, PanelRightClose, PanelRightOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

// -- Types --
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
const createDefaultProject = (domainName: string): FileNode[] => [
  {
    id: "src", name: "src", type: "folder", isOpen: true,
    children: [
      { id: "src/index.js", name: "index.js", type: "file", language: "javascript",
        content: `// Welcome to Lunor.AI Code Editor\n// ${domainName} Workspace\n\nfunction greet(name) {\n  return \`Hello, \${name}! Welcome to Lunor.AI 🚀\`;\n}\n\nconsole.log(greet("Engineer"));\nconsole.log("2 + 2 =", 2 + 2);\n` },
      { id: "src/app.js", name: "app.js", type: "file", language: "javascript",
        content: `// App entry point\n\nimport { greet } from './index.js';\n\nconst app = {\n  name: "${domainName} App",\n  version: "1.0.0",\n  init() {\n    console.log("App initialized!");\n  }\n};\n\napp.init();\n` },
      { id: "src/utils.js", name: "utils.js", type: "file", language: "javascript",
        content: `// Utility functions\n\nexport function formatDate(date) {\n  return new Date(date).toLocaleDateString();\n}\n\nexport function capitalize(str) {\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}\n` },
      {
        id: "src/styles", name: "styles", type: "folder", isOpen: false,
        children: [
          { id: "src/styles/main.css", name: "main.css", type: "file", language: "css",
            content: `/* Main styles */\n:root {\n  --primary: #00d4aa;\n  --bg: #0a0a1a;\n}\n\nbody {\n  font-family: 'Inter', sans-serif;\n  background: var(--bg);\n  color: #eee;\n  margin: 0;\n}\n` },
        ],
      },
    ],
  },
  {
    id: "public", name: "public", type: "folder", isOpen: false,
    children: [
      { id: "public/index.html", name: "index.html", type: "file", language: "html",
        content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${domainName} - Lunor.AI</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script src="/src/index.js"></script>\n</body>\n</html>` },
    ],
  },
  { id: "package.json", name: "package.json", type: "file", language: "json",
    content: `{\n  "name": "${domainName.toLowerCase().replace(/[^a-z0-9]/g, "-")}",\n  "version": "1.0.0",\n  "description": "${domainName} project on Lunor.AI",\n  "main": "src/index.js",\n  "scripts": {\n    "start": "node src/index.js",\n    "test": "echo \\"No tests yet\\""\n  }\n}\n` },
  { id: "README.md", name: "README.md", type: "file", language: "markdown",
    content: `# ${domainName}\n\nWelcome to your ${domainName} workspace on **Lunor.AI**.\n\n## Getting Started\n\n1. Edit files in the explorer\n2. Run code with the play button\n3. Ask the AI assistant for help\n` },
];

// -- Extract code blocks from markdown --
function extractCodeBlocks(markdown: string): { code: string; language: string }[] {
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  const blocks: { code: string; language: string }[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({ language: match[1] || "javascript", code: match[2].trim() });
  }
  return blocks;
}

// -- File Explorer Item --
const FileItem = ({
  node, depth, activeFileId, onSelect, onToggle, onDelete, onRename,
}: {
  node: FileNode; depth: number; activeFileId: string | null;
  onSelect: (node: FileNode) => void; onToggle: (id: string) => void;
  onDelete: (id: string) => void; onRename: (id: string, name: string) => void;
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
        className={`group flex items-center gap-1 px-2 py-[3px] cursor-pointer text-xs hover:bg-secondary/50 transition-colors ${
          isActive ? "bg-primary/15 text-primary" : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => node.type === "folder" ? onToggle(node.id) : onSelect(node)}
        onDoubleClick={handleDoubleClick}
      >
        {node.type === "folder" ? (
          <>
            <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${node.isOpen ? "rotate-90" : ""}`} />
            {node.isOpen ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary/70" /> : <FolderClosed className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
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
            className="flex-1 bg-input border border-border rounded px-1 text-xs text-foreground outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-destructive">
          <X className="h-3 w-3" />
        </button>
      </div>
      {node.type === "folder" && node.isOpen && node.children?.map((child) => (
        <FileItem key={child.id} node={child} depth={depth + 1} activeFileId={activeFileId} onSelect={onSelect} onToggle={onToggle} onDelete={onDelete} onRename={onRename} />
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/code-assistant`;

const CodeEditorComponent = forwardRef<CodeEditorHandle, IDEProps>(({ domainName, onExit }, ref) => {
  // File tree state
  const [fileTree, setFileTree] = useState<FileNode[]>(() => createDefaultProject(domainName));
  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => {
    const defaultFile = createDefaultProject(domainName)[0]?.children?.[0];
    return defaultFile ? [{ id: defaultFile.id, name: defaultFile.name, language: defaultFile.language || "javascript", content: defaultFile.content || "", isModified: false }] : [];
  });
  const [activeTabId, setActiveTabId] = useState<string | null>("src/index.js");

  // Panels
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"files" | "search">("files");
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [output, setOutput] = useState<string[]>(["$ Ready."]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

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

  const handleCodeChange = (val: string | undefined) => {
    if (!activeTabId) return;
    setOpenTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, content: val || "", isModified: true } : t));
    setFileTree((prev) => updateNode(prev, activeTabId, (n) => ({ ...n, content: val || "" })));
  };

  // Auto-apply code to editor
  const applyCodeToEditor = useCallback((code: string, language: string) => {
    if (activeTabId) {
      setOpenTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, content: code, isModified: true } : t));
      setFileTree((prev) => updateNode(prev, activeTabId, (n) => ({ ...n, content: code })));
    }
  }, [activeTabId, updateNode]);

  // -- Run Code --
  const handleRun = useCallback(async () => {
    if (!activeTab) return;
    setIsRunning(true);
    setShowTerminal(true);
    setOutput([`$ Running ${activeTab.name}...`]);
    const lang = activeTab.language;
    if (lang === "javascript" || lang === "typescript") {
      try {
        const { data, error } = await supabase.functions.invoke("run-code", {
          body: { code: activeTab.content, language: lang },
        });
        if (error) setOutput((p) => [...p, `❌ ${error.message}`]);
        else if (data?.output) setOutput((p) => [...p, ...data.output]);
        else if (data?.error) setOutput((p) => [...p, `❌ ${data.error}`]);
        else setOutput((p) => [...p, "✅ Done (no output)"]);
      } catch (err: unknown) {
        setOutput((p) => [...p, `❌ ${err instanceof Error ? err.message : String(err)}`]);
      }
    } else {
      setOutput((p) => [...p, `⚙️ ${lang} execution not supported yet.`]);
    }
    setIsRunning(false);
  }, [activeTab]);

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

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: updated.map((m) => ({ role: m.role, content: m.content })), domain: domainName }),
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
    } catch { upsert("❌ Connection error."); }

    // Auto-apply: extract last code block and apply to editor
    const codeBlocks = extractCodeBlocks(assistantSoFar);
    if (codeBlocks.length > 0) {
      const lastBlock = codeBlocks[codeBlocks.length - 1];
      applyCodeToEditor(lastBlock.code, lastBlock.language);
    }

    setChatLoading(false);
  }, [chatInput, chatLoading, messages, domainName, applyCodeToEditor]);

  const handleClearChat = () => {
    setMessages([{ role: "assistant", content: `👋 Chat cleared! I'm your **${domainName}** assistant. Ask me anything!` }]);
  };

  const firstFolderId = useMemo(() => {
    const find = (nodes: FileNode[]): string | null => {
      for (const n of nodes) { if (n.type === "folder") return n.id; if (n.children) { const f = find(n.children); if (f) return f; } }
      return null;
    };
    return find(fileTree);
  }, [fileTree]);

  return (
    <div className="flex flex-col h-screen w-full bg-[hsl(var(--background))] text-foreground overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between h-9 bg-card border-b border-border px-3 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary">Lunor.AI</span>
          <span className="text-[10px] text-muted-foreground">— {domainName} Workspace</span>
        </div>
        <div className="flex items-center gap-1">
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
        <div className="flex flex-col items-center w-10 bg-card border-r border-border py-2 gap-1 shrink-0">
          <button onClick={() => { setShowSidebar(true); setSidebarTab("files"); }} className={`p-2 rounded-md transition-colors ${showSidebar && sidebarTab === "files" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <File className="h-4 w-4" />
          </button>
          <button onClick={() => { setShowSidebar(true); setSidebarTab("search"); }} className={`p-2 rounded-md transition-colors ${showSidebar && sidebarTab === "search" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Search className="h-4 w-4" />
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
          <div className="flex flex-col w-56 bg-card border-r border-border shrink-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {sidebarTab === "files" ? "Explorer" : "Search"}
              </span>
              {sidebarTab === "files" && (
                <div className="flex gap-0.5">
                  <button onClick={() => { setNewItemParent(firstFolderId); setNewItemType("file"); setNewItemName(""); }} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="New File">
                    <FilePlus className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setNewItemParent(firstFolderId); setNewItemType("folder"); setNewItemName(""); }} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="New Folder">
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            {sidebarTab === "files" ? (
              <div className="flex-1 overflow-y-auto py-1 text-xs">
                {newItemParent !== null && (
                  <div className="flex items-center gap-1 px-3 py-1">
                    {newItemType === "folder" ? <FolderClosed className="h-3 w-3 text-muted-foreground" /> : <File className="h-3 w-3 text-muted-foreground" />}
                    <input
                      autoFocus value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateItem(); if (e.key === "Escape") setNewItemParent(null); }}
                      onBlur={handleCreateItem}
                      placeholder={`New ${newItemType}...`}
                      className="flex-1 bg-input border border-border rounded px-1 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
                {fileTree.map((node) => (
                  <FileItem key={node.id} node={node} depth={0} activeFileId={activeTabId} onSelect={handleSelectFile} onToggle={handleToggleFolder} onDelete={handleDeleteNode} onRename={handleRenameNode} />
                ))}
              </div>
            ) : (
              <div className="p-3">
                <input placeholder="Search files..." className="w-full rounded-md border border-border bg-input px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}
          </div>
        )}

        {/* Center: Editor */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Editor tabs */}
          <div className="flex items-center h-8 bg-card border-b border-border overflow-x-auto shrink-0">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                className={`group flex items-center gap-1.5 px-3 h-full border-r border-border cursor-pointer text-xs transition-colors shrink-0 ${
                  tab.id === activeTabId ? "bg-background text-foreground border-t-2 border-t-primary" : "text-muted-foreground hover:bg-secondary/30"
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <File className={`h-3 w-3 ${getFileIcon(tab.name)}`} />
                <span className="whitespace-nowrap">{tab.name}</span>
                {tab.isModified && <span className="h-2 w-2 rounded-full bg-primary/60" />}
                <button onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }} className="opacity-0 group-hover:opacity-100 ml-1 hover:text-destructive transition-opacity">
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
            </div>
          </div>

          {/* Monaco editor */}
          <div className="flex-1 overflow-hidden">
            {activeTab ? (
              <Editor
                height="100%"
                language={activeTab.language}
                value={activeTab.content}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
                  minimap: { enabled: true, scale: 1, maxColumn: 80 },
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

          {/* Terminal panel (bottom) */}
          {showTerminal && (
            <div className="flex flex-col h-40 border-t border-border shrink-0 bg-card">
              <div className="flex items-center h-7 border-b border-border px-2 shrink-0">
                <span className="px-2 py-1 text-[10px] font-medium text-foreground">Terminal</span>
                <div className="flex-1" />
                <button onClick={() => setShowTerminal(false)} className="p-0.5 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs bg-background">
                {output.map((line, i) => (
                  <div key={i} className="text-foreground/80 whitespace-pre-wrap">{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Assistant Panel */}
        {showAIPanel && (
          <div className="flex flex-col w-80 lg:w-96 border-l border-border bg-card shrink-0 overflow-hidden">
            {/* AI Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">AI Assistant</span>
              <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">Auto-Apply</span>
              <div className="flex-1" />
              <button onClick={handleClearChat} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Clear chat">
                <Trash2 className="h-3 w-3" />
              </button>
              <button onClick={() => setShowAIPanel(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${msg.role === "user" ? "bg-secondary" : "bg-primary/10"}`}>
                    {msg.role === "user" ? <span className="text-[9px] font-medium text-secondary-foreground">U</span> : <Bot className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div className={`max-w-[88%] rounded-lg px-3 py-2 text-xs ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background [&_pre]:p-2.5 [&_pre]:rounded-md [&_pre]:text-[10px] [&_pre]:my-2 [&_code]:text-primary [&_code]:bg-background/50 [&_code]:px-1 [&_code]:rounded-sm [&_pre]:relative [&_pre]:border [&_pre]:border-primary/20">
                      <ReactMarkdown
                        components={{
                          pre({ children, ...props }) {
                            const codeEl = (children as any)?.props;
                            const codeText = codeEl?.children || "";
                            const className = codeEl?.className || "";
                            const lang = className.replace("language-", "") || "javascript";
                            return (
                              <div className="relative group">
                                <div className="flex items-center justify-between bg-background/80 rounded-t-md border border-b-0 border-primary/20 px-2 py-1">
                                  <span className="text-[9px] text-muted-foreground font-mono">{lang}</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => applyCodeToEditor(String(codeText).trim(), lang)}
                                      className="flex items-center gap-1 rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary hover:bg-primary/30 transition-colors"
                                      title="Apply to Editor"
                                    >
                                      <ArrowRightToLine className="h-2.5 w-2.5" />
                                      Apply
                                    </button>
                                  </div>
                                </div>
                                <pre {...props} className="!rounded-t-none !mt-0">{children}</pre>
                              </div>
                            );
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
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10"><Bot className="h-3.5 w-3.5 text-primary" /></div>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* AI Input */}
            <div className="border-t border-border p-2 shrink-0">
              <div className="flex gap-1.5">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                  placeholder={`Ask about ${domainName.toLowerCase()}...`}
                  className="flex-1 rounded-md border border-border bg-input px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  disabled={chatLoading}
                />
                <Button size="sm" className="h-7 px-2" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="mt-1.5 text-[9px] text-muted-foreground text-center">
                Code is <span className="text-primary font-medium">auto-applied</span> to your active file
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between h-6 bg-primary/10 border-t border-border px-3 shrink-0 select-none">
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
