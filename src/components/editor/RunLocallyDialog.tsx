import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Terminal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: FileNode[];
}

function collectFiles(nodes: FileNode[]): { path: string; content: string }[] {
  const out: { path: string; content: string }[] = [];
  const walk = (ns: FileNode[], prefix = "") => {
    for (const n of ns) {
      if (n.type === "file" && n.content != null) {
        const path = prefix ? `${prefix}/${n.name}` : n.name;
        out.push({ path, content: n.content });
      }
      if (n.children) walk(n.children, prefix ? `${prefix}/${n.name}` : n.name);
    }
  };
  walk(nodes);
  return out;
}

function hasJSX(files: { path: string; content: string }[]): boolean {
  return files.some(
    (f) =>
      /\.(jsx|tsx)$/i.test(f.path) ||
      (/\.(js|ts)$/i.test(f.path) && /<\w+[\s/>]/.test(f.content))
  );
}

interface RunLocallyDialogProps {
  fileTree: FileNode[];
  domainName: string;
  projectName?: string;
  children: React.ReactNode;
}

const RunLocallyDialog = ({
  fileTree,
  domainName,
  projectName = "my-app",
  children,
}: RunLocallyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const files = collectFiles(fileTree);
  const isReact = hasJSX(files);
  const domainId = domainName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const safeName = projectName.replace(/[^a-z0-9-_]/gi, "-").toLowerCase() || "my-app";
  const packageFile = files.find((file) => file.path === "package.json" || file.path.endsWith("/package.json"));
  let hasStartScript = false;
  if (packageFile) {
    try {
      hasStartScript = Boolean(JSON.parse(packageFile.content)?.scripts?.start);
    } catch {
      hasStartScript = false;
    }
  }
  const runCommands = isReact
    ? `cd ${safeName}
npm install
npm run dev`
    : hasStartScript
    ? `cd ${safeName}
npm install
npm start
# Opens at http://localhost:3000`
    : `# Extract the zip, then:
cd ${safeName}
npx serve .
# Opens at http://localhost:3000`

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(runCommands);
    setCopied(true);
    toast.success("Commands copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(safeName)!;

      if (isReact) {
        // Vite + React project structure
        folder.file(
          "package.json",
          JSON.stringify(
            {
              name: safeName,
              private: true,
              version: "1.0.0",
              type: "module",
              scripts: {
                dev: "vite",
                build: "vite build",
                preview: "vite preview",
              },
              dependencies: {
                react: "^18.3.1",
                "react-dom": "^18.3.1",
                "lucide-react": "^0.462.0",
              },
              devDependencies: {
                "@vitejs/plugin-react-swc": "^3.11.0",
                vite: "^5.4.19",
              },
            },
            null,
            2
          )
        );

        folder.file(
          "vite.config.js",
          `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
})
`
        );

        folder.file(
          "index.html",
          `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
        );

        // Find App component and main entry
        const appFile = files.find(
          (f) =>
            /\/App\.(jsx|tsx|js|ts)$/i.test(f.path) || f.path === "App.jsx" || f.path === "App.tsx"
        );
        const indexFile = files.find(
          (f) =>
            /(index|main)\.(jsx|tsx|js|ts)$/i.test(f.path) &&
            /createRoot|ReactDOM\.render/.test(f.content)
        );

        const appContent =
          appFile?.content ||
          `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>${projectName}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}

export default App
`;

        const mainContent =
          indexFile?.content ||
          `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`;

        folder.file("src/App.jsx", appContent);
        folder.file("src/main.jsx", mainContent);

        // Add other project files (CSS, components, etc.) - skip App and main entry
        const skipPaths = ["App.jsx", "App.tsx", "App.js", "App.ts", "index.jsx", "index.tsx", "main.jsx", "main.tsx"];
        for (const { path, content } of files) {
          if (skipPaths.some((s) => path.endsWith(s))) continue;
          const dest = path.startsWith("src/") ? path : `src/${path}`;
          folder.file(dest, content);
        }
      } else {
        // HTML/CSS/JS - flat structure
        const indexHtml = files.find((f) => f.path.endsWith(".html") || f.path === "index.html");
        if (indexHtml) {
          folder.file(indexHtml.path, indexHtml.content);
        }
        for (const { path, content } of files) {
          if (path !== (indexHtml?.path || "index.html")) {
            folder.file(path, content);
          }
        }
        if (!indexHtml) {
          const firstJs = files.find((f) => f.path.endsWith(".js"))?.path?.split("/").pop() || "app.js";
          folder.file(
            "index.html",
            `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${projectName}</title></head>
<body><h1>${projectName}</h1>${files.some((f) => f.path.endsWith(".js")) ? `<script src="${firstJs}"></script>` : ""}</body>
</html>
`
          );
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Project downloaded! Extract and run the commands.");
      setOpen(false);
    } catch (e) {
      toast.error("Download failed. Please try again.");
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Run Project Locally
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download your project and run it on your machine.{" "}
            {isReact
              ? "Includes Vite + React setup — runs on http://localhost:5173"
              : "Static HTML/CSS/JS — open index.html or use a local server."}
          </p>

          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">Steps:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click &quot;Download Project&quot; below</li>
              <li>Extract the zip to a folder</li>
              <li>Open a terminal in that folder</li>
              <li>Run the commands (copy below)</li>
            </ol>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Terminal commands</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 gap-1 text-xs"
                onClick={handleCopyCommands}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap bg-muted/50 rounded p-2 overflow-x-auto">
              {runCommands}
            </pre>
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleDownload}
            disabled={downloading || files.length === 0}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Preparing..." : "Download Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RunLocallyDialog;
