/**
 * Cursor/Lovable-style AI studio embedded in Web Development domain.
 * Uses Supabase code-engine + Sandpack preview (no separate Node server).
 */

import { useCallback, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  ChevronRight,
  FileCode,
  Folder,
  Loader2,
  Maximize2,
  Minimize2,
  Send,
  Terminal as TerminalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import SandpackPreviewPanel from "@/components/editor/SandpackPreviewPanel";
import { supabase } from "@/integrations/supabase/client";
import type { FileNode } from "@/lib/sandpackProject";
import {
  defaultWebDevStarterTree,
  extractCodeBlocks,
  findFile,
  getLang,
  mergeAiBlocksIntoTree,
} from "@/lib/webDevAiMerge";

const CODE_ENGINE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/code-engine`;
const AUTH_REQUIRED = "AUTH_REQUIRED";

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error(AUTH_REQUIRED);
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function fetchCodeEngine(body: Record<string, unknown>) {
  const resp = await fetch(CODE_ENGINE_URL, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (resp.status === 401) throw new Error(AUTH_REQUIRED);
  return resp;
}

function TreeView({
  nodes,
  depth,
  activeId,
  onSelect,
  open,
  toggle,
}: {
  nodes: FileNode[];
  depth: number;
  activeId: string | null;
  onSelect: (n: FileNode) => void;
  open: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <ul className="text-xs space-y-0.5" style={{ paddingLeft: depth ? 10 : 0 }}>
      {nodes.map((n) =>
        n.type === "folder" ? (
          <li key={n.id}>
            <button
              type="button"
              className="flex items-center gap-1 w-full text-left text-muted-foreground hover:text-foreground py-0.5"
              onClick={() => toggle(n.id)}
            >
              <ChevronRight
                className={`w-3 h-3 shrink-0 transition-transform ${open.has(n.id) ? "rotate-90" : ""}`}
              />
              <Folder className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span className="truncate">{n.name}</span>
            </button>
            {open.has(n.id) && n.children?.length ? (
              <TreeView
                nodes={n.children}
                depth={depth + 1}
                activeId={activeId}
                onSelect={onSelect}
                open={open}
                toggle={toggle}
              />
            ) : null}
          </li>
        ) : (
          <li key={n.id}>
            <button
              type="button"
              className={`flex items-center gap-1.5 w-full text-left py-0.5 pl-5 rounded-sm ${
                activeId === n.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onSelect(n)}
            >
              <FileCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{n.name}</span>
            </button>
          </li>
        )
      )}
    </ul>
  );
}

interface WebDevAiStudioProps {
  /** Shown in header */
  domainLabel?: string;
  /** Expand to full viewport */
  embedded?: boolean;
  onRequestFullscreen?: () => void;
}

export default function WebDevAiStudio({
  domainLabel = "Web Development",
  embedded = true,
  onRequestFullscreen,
}: WebDevAiStudioProps) {
  const [projectName, setProjectName] = useState("My Web App");
  const [fileTree, setFileTree] = useState<FileNode[]>(() => defaultWebDevStarterTree("My Web App"));
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set(["src"]));
  const [activeFileId, setActiveFileId] = useState<string | null>("src/App.jsx");
  const [prompt, setPrompt] = useState("");
  const [log, setLog] = useState("");
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const activeFile = activeFileId ? findFile(fileTree, activeFileId) : null;

  const editorValue = activeFile?.type === "file" ? activeFile.content ?? "" : "";
  const editorLang = activeFile?.type === "file" ? activeFile.language || getLang(activeFile.name) : "plaintext";

  const onEditorChange = useCallback(
    (value: string | undefined) => {
      if (!activeFileId || !activeFile || activeFile.type !== "file") return;
      const v = value ?? "";
      setFileTree((prev) =>
        prev.map(function mapNode(n): FileNode {
          if (n.id === activeFileId && n.type === "file") return { ...n, content: v };
          if (n.children) return { ...n, children: n.children.map(mapNode) };
          return n;
        })
      );
    },
    [activeFileId, activeFile]
  );

  const appendLog = (s: string) => setLog((p) => (p + s).slice(-12000));

  const runGenerate = async () => {
    const p = prompt.trim();
    if (!p || generating) return;
    setGenerating(true);
    appendLog(`\n> ${p}\n`);
    let assistant = "";
    try {
      const messages = [
        {
          role: "user" as const,
          content: `${p}\n\nOutput a complete multi-file React + Vite style project using fenced blocks. Use paths like src/App.jsx before each block when possible.`,
        },
      ];
      const resp = await fetchCodeEngine({
        action: "generate",
        messages,
        domain: "web-development",
        model: "google/gemini-2.5-flash",
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        appendLog(`Error: ${(err as { error?: string }).error || resp.statusText}\n`);
        return;
      }
      if (!resp.body) return;
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ") || line.startsWith(":")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const o = JSON.parse(json);
            const c = o.choices?.[0]?.delta?.content;
            if (c) assistant += c;
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      const blocks = extractCodeBlocks(assistant, p);
      if (blocks.length === 0) {
        appendLog("No code blocks parsed — try a more specific prompt.\n");
        return;
      }
      let nextTree: FileNode[] = [];
      setFileTree((prev) => {
        nextTree = mergeAiBlocksIntoTree(prev, blocks, p);
        return nextTree;
      });
      const jsxBlock = blocks.find((b) => /\.(jsx|tsx)$/i.test(b.filename || ""));
      const pick = jsxBlock || blocks[0];
      let id = pick.filename?.replace(/^\/+/, "") || "src/App.jsx";
      if (!id.startsWith("src/")) id = `src/${id}`;
      if (!findFile(nextTree, id)) {
        const walk = (ns: FileNode[]): string | null => {
          for (const n of ns) {
            if (n.type === "file" && /\.(jsx|tsx|js)$/i.test(n.name)) return n.id;
            if (n.children) {
              const x = walk(n.children);
              if (x) return x;
            }
          }
          return null;
        };
        const w = walk(nextTree);
        if (w) id = w;
      }
      setActiveFileId(id);
      const inferred = p.slice(0, 48).replace(/\s+/g, " ").trim();
      if (inferred) setProjectName(inferred);
      appendLog(`Applied ${blocks.length} file(s).\n`);
      setOpenFolders((s) => new Set([...s, "src"]));
    } catch (e) {
      appendLog(`${e instanceof Error ? e.message : String(e)}\n`);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!activeFileId || !findFile(fileTree, activeFileId)) {
      const walk = (ns: FileNode[]): string | null => {
        for (const n of ns) {
          if (n.type === "file") return n.id;
          if (n.children) {
            const x = walk(n.children);
            if (x) return x;
          }
        }
        return null;
      };
      const first = walk(fileTree);
      if (first) setActiveFileId(first);
    }
  }, [fileTree, activeFileId]);

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const shell = (
      <div
        className={
          expanded
            ? "fixed inset-0 z-[60] flex flex-col bg-background border border-border"
            : "flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-[560px] h-[min(78vh,820px)]"
        }
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 shrink-0 flex-wrap">
          <span className="text-sm font-semibold text-foreground">AI Studio</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
            {domainLabel}
          </span>
          <div className="flex-1 min-w-[120px] flex items-center gap-2 max-w-xl">
            <input
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              placeholder='e.g. "Build a landing page with hero and CTA"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && runGenerate()}
              disabled={generating}
            />
            <Button size="sm" onClick={runGenerate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Generate
            </Button>
          </div>
          {onRequestFullscreen ? (
            <Button variant="outline" size="sm" onClick={onRequestFullscreen}>
              <Maximize2 className="h-4 w-4 mr-1" /> Full IDE
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setExpanded((e) => !e)}>
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={20} minSize={14} className="min-w-0 border-r border-border bg-muted/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 border-b border-border">
                Explorer
              </div>
              <div className="p-2 overflow-auto h-[calc(100%-28px)]">
                <TreeView
                  nodes={fileTree}
                  depth={0}
                  activeId={activeFileId}
                  onSelect={(n) => n.type === "file" && setActiveFileId(n.id)}
                  open={openFolders}
                  toggle={toggleFolder}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={38} minSize={24} className="min-w-0 flex flex-col">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 border-b border-border shrink-0">
                Editor — {activeFile?.name ?? "—"}
              </div>
              <div className="flex-1 min-h-0">
                {activeFile?.type === "file" ? (
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    path={activeFileId ?? undefined}
                    language={editorLang}
                    value={editorValue}
                    onChange={onEditorChange}
                    options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: "on" }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Select a file
                  </div>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={42} minSize={22} className="min-w-0 flex flex-col border-l border-border">
              <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel defaultSize={72} minSize={40} className="min-h-0 flex flex-col">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 border-b border-border shrink-0 flex items-center gap-1">
                    Live preview (Sandpack)
                  </div>
                  <div className="flex-1 min-h-0 bg-[#1a1a2e]">
                    <SandpackPreviewPanel
                      fileTree={fileTree}
                      projectName={projectName}
                      showEditor={false}
                      className="h-full w-full"
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={28} minSize={12} className="min-h-0 flex flex-col">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 border-b border-border flex items-center gap-1 shrink-0">
                    <TerminalIcon className="w-3 h-3" /> Output
                  </div>
                  <pre className="flex-1 overflow-auto p-2 text-[11px] font-mono text-green-600/90 dark:text-green-400/90 whitespace-pre-wrap">
                    {log || "Generation logs appear here. Sign in required for AI."}
                  </pre>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
  );

  if (!embedded) return shell;
  return <div className="w-full">{shell}</div>;
}
