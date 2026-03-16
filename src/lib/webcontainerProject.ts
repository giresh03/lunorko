/**
 * Build project file structure for WebContainer (Vite + React)
 * FileSystemTree format: { "name": { file: { contents } } | { directory: { ... } } }
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

export function hasJSX(files: { path: string; content: string }[]): boolean {
  return files.some(
    (f) =>
      /\.(jsx|tsx)$/i.test(f.path) ||
      (/\.(js|ts)$/i.test(f.path) && /<\w+[\s/>]/.test(f.content))
  );
}

type FileSystemTree = Record<string, { file: { contents: string } } | { directory: FileSystemTree }>;

function setInTree(tree: FileSystemTree, path: string, contents: string) {
  const parts = path.split("/");
  let current = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) current[part] = { directory: {} };
    current = (current[part] as { directory: FileSystemTree }).directory;
  }
  current[parts[parts.length - 1]] = { file: { contents } };
}

export function buildWebContainerFiles(
  fileTree: FileNode[],
  projectName: string
): FileSystemTree {
  const files = collectFiles(fileTree);
  const tree: FileSystemTree = {};

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

  setInTree(
    tree,
    "package.json",
    JSON.stringify(
        {
          name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-") || "app",
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

  setInTree(
    tree,
    "vite.config.js",
    `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
})
`
  );

  setInTree(
    tree,
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

  setInTree(tree, "src/App.jsx", appContent);
  setInTree(tree, "src/main.jsx", mainContent);

  const skipPaths = ["App.jsx", "App.tsx", "App.js", "App.ts", "index.jsx", "index.tsx", "main.jsx", "main.tsx"];
  for (const { path, content } of files) {
    if (skipPaths.some((s) => path.endsWith(s))) continue;
    const dest = path.startsWith("src/") ? path : `src/${path}`;
    setInTree(tree, dest, content);
  }

  return tree;
}
