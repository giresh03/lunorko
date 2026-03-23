import { useMemo, useEffect, useRef } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { buildSandpackFiles } from "@/lib/sandpackProject";
import { buildWebDevLivePreviewHtml } from "@/lib/webDevLivePreview";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: FileNode[];
}

function SandpackFileSync({ files }: { files: Record<string, string | { code: string }> }) {
  const { sandpack } = useSandpack();
  const prevFilesRef = useRef<string>("");

  useEffect(() => {
    const filesKey = JSON.stringify(files);
    if (filesKey === prevFilesRef.current) return;
    prevFilesRef.current = filesKey;

    const timer = setTimeout(() => {
      Object.entries(files).forEach(([path, content]) => {
        const code = typeof content === "string" ? content : content.code;
        if (path.startsWith("/") && code) {
          sandpack.updateFile(path, code);
        }
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [files, sandpack]);

  return null;
}

function LocalLivePreview({
  srcDoc,
  iframeKey,
  className,
}: {
  srcDoc: string;
  iframeKey: string;
  className: string;
}) {
  return (
    <div className={`flex flex-col min-h-0 h-full w-full bg-[#0f0f23] ${className}`}>
      <iframe
        key={iframeKey}
        title="Live preview"
        srcDoc={srcDoc}
        className="flex-1 w-full min-h-[280px] border-0 bg-[#0f0f23]"
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}

interface SandpackPreviewPanelProps {
  fileTree: FileNode[];
  projectName: string;
  showEditor?: boolean;
  className?: string;
  /**
   * `local` = Babel + React in iframe (no CodeSandbox bundler; works offline / strict networks).
   * `sandpack` = remote bundler (can TIME_OUT if codesandbox.io is blocked).
   */
  previewEngine?: "local" | "sandpack";
}

export default function SandpackPreviewPanel({
  fileTree,
  projectName,
  showEditor = false,
  className = "",
  previewEngine = "local",
}: SandpackPreviewPanelProps) {
  const files = useMemo(
    () => buildSandpackFiles(fileTree, projectName),
    [fileTree, projectName]
  );

  const srcDoc = useMemo(() => buildWebDevLivePreviewHtml(files), [files]);

  const iframeKey = useMemo(() => {
    let h = 0;
    const s = JSON.stringify(files);
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return `live-${h}`;
  }, [files]);

  if (previewEngine === "local") {
    return (
      <div className={`sandpack-preview-panel h-full flex flex-col min-h-0 ${className}`}>
        {showEditor ? (
          <div className="text-xs text-muted-foreground p-2 border-b border-border">
            Editor view uses Sandpack only — switch preview engine to <code className="text-[10px]">sandpack</code> if
            needed.
          </div>
        ) : null}
        <LocalLivePreview srcDoc={srcDoc} iframeKey={iframeKey} className={showEditor ? "min-h-[240px]" : ""} />
      </div>
    );
  }

  return (
    <div className={`sandpack-preview-panel h-full flex flex-col min-h-0 ${className}`}>
      <SandpackProvider
        template="react"
        files={files}
        customSetup={{
          dependencies: {
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            "lucide-react": "^0.462.0",
            "@radix-ui/react-tabs": "^1.1.2",
            "@radix-ui/react-accordion": "^1.2.2",
            "@radix-ui/react-alert-dialog": "^1.1.4",
            "class-variance-authority": "^0.7.1",
            clsx: "^2.1.1",
            "tailwind-merge": "^2.6.0",
          },
          entry: "/src/index.jsx",
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          autorun: true,
        }}
      >
        <SandpackFileSync files={files} />
        <SandpackLayout>
          {showEditor ? (
            <>
              <SandpackCodeEditor />
              <SandpackPreview />
            </>
          ) : (
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
              style={{ height: "100%", minHeight: 300 }}
            />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
