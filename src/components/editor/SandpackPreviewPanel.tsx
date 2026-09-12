import { useMemo, useEffect, useRef } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { buildSandpackFiles } from "@/lib/sandpackProject";

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

interface SandpackPreviewPanelProps {
  fileTree: FileNode[];
  projectName: string;
  showEditor?: boolean;
  className?: string;
  /** Hosted Lunor runtime API URL — when set, /api calls are routed there live. */
  apiUrl?: string | null;
}

export default function SandpackPreviewPanel({
  fileTree,
  projectName,
  showEditor = false,
  className = "",
  apiUrl = null,
}: SandpackPreviewPanelProps) {
  const files = useMemo(
    () => buildSandpackFiles(fileTree, projectName, apiUrl),
    [fileTree, projectName, apiUrl]
  );

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
