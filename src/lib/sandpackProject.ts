/**
 * Build Sandpack files from fileTree for browser-based React runtime
 * Sandpack format: { "/path/to/file": "content" | { code, readOnly?, active?, hidden? } }
 */

export interface FileNode {
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

/** Extract local component paths from imports like: import X from './Y' or import Navbar from './components/Navbar' */
function extractLocalImports(code: string): string[] {
  const paths: string[] = [];
  const regex = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]\.\/([^'"]+)['"]/g;
  let m;
  while ((m = regex.exec(code)) !== null) {
    const relPath = m[3].replace(/\.(jsx?|tsx?)$/, "");
    if (relPath && !paths.includes(relPath)) paths.push(relPath);
  }
  return paths;
}

/** Generate placeholder component for missing imports */
function placeholderComponent(name: string): string {
  return `export default function ${name}() {
  return <div style={{ padding: 8, border: '1px dashed #666', borderRadius: 4, color: '#888', fontSize: 12 }}>${name} (placeholder)</div>;
}`;
}

export function hasJSX(files: { path: string; content: string }[]): boolean {
  return files.some(
    (f) =>
      /\.(jsx|tsx)$/i.test(f.path) ||
      (/\.(js|ts)$/i.test(f.path) && /<\w+[\s/>]/.test(f.content))
  );
}

export type SandpackFiles = Record<string, string | { code: string; readOnly?: boolean; active?: boolean; hidden?: boolean }>;

export function buildSandpackFiles(
  fileTree: FileNode[],
  projectName: string
): SandpackFiles {
  const files = collectFiles(fileTree);
  const result: SandpackFiles = {};

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

  result["/package.json"] = JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-") || "app",
      private: true,
      version: "1.0.0",
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "lucide-react": "^0.462.0",
      },
    },
    null,
    2
  );

  result["/index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

  result["/src/index.jsx"] = mainContent;
  result["/src/App.jsx"] = appContent;

  const existingPaths = new Set<string>(["/src/App.jsx", "/src/index.jsx"]);
  const skipPaths = ["App.jsx", "App.tsx", "App.js", "App.ts", "index.jsx", "index.tsx", "main.jsx", "main.tsx"];

  for (const { path, content } of files) {
    if (skipPaths.some((s) => path.endsWith(s))) continue;
    const dest = path.startsWith("src/") ? `/src/${path}` : path.startsWith("/") ? path : `/src/${path}`;
    result[dest] = content;
    existingPaths.add(dest);
  }

  const allCode = Object.values(result).map((v) => (typeof v === "string" ? v : v.code)).join("\n");
  const localImports = extractLocalImports(allCode);
  for (const relPath of localImports) {
    const path = `/src/${relPath}.jsx`;
    const name = relPath.split("/").pop() || "Component";
    const displayName = name.replace(/^[a-z]/, (c) => c.toUpperCase());
    if (!existingPaths.has(path) && !result[path]) {
      result[path] = placeholderComponent(displayName);
    }
  }

  return result;
}
