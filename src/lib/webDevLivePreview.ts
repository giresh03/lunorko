/**
 * Browser-only React preview for Web Dev / AI Studio (no Sandpack / CodeSandbox bundler).
 * Bundles reachable files under src (jsx, tsx, js, ts) from a Sandpack-shaped file map; runs via Babel standalone + React UMD.
 */

export type SandpackLikeFiles = Record<string, string | { code: string }>;

function getCode(v: string | { code: string } | undefined): string {
  if (v == null) return "";
  return typeof v === "string" ? v : v.code;
}

function dirname(p: string): string {
  const i = p.lastIndexOf("/");
  return i <= 0 ? "" : p.slice(0, i);
}

/** Resolve ./ ../ and @/ (alias to /src/) */
function resolveModule(fromFile: string, spec: string): string | null {
  if (spec === "react" || spec === "react-dom" || spec === "react-dom/client" || spec === "react/jsx-runtime") {
    return null;
  }
  if (
    spec.startsWith("lucide-react") ||
    spec.startsWith("@radix-ui/") ||
    spec === "clsx" ||
    spec === "tailwind-merge" ||
    spec === "class-variance-authority"
  ) {
    return null;
  }

  let rel = spec;
  if (spec.startsWith("@/")) {
    const tail = spec.slice(2).replace(/^\//, "");
    return findWithExtensions("/src/" + tail);
  }
  if (!rel.startsWith(".")) return null;

  const fromDir = dirname(fromFile);
  const parts = fromDir.split("/").filter(Boolean);
  const segs = rel.split("/");
  for (const s of segs) {
    if (s === "..") parts.pop();
    else if (s !== ".") parts.push(s);
  }
  const base = "/" + parts.join("/");
  return findWithExtensions(base);
}

function findWithExtensions(base: string): string | null {
  const candidates = [
    base,
    base + ".jsx",
    base + ".tsx",
    base + ".js",
    base + ".ts",
  ];
  for (const c of candidates) {
    if (fileMapHas(c)) return c;
  }
  return null;
}

let _keysCache: Set<string> | null = null;

function fileMapHas(path: string): boolean {
  return _keysCache?.has(path) ?? false;
}

function collectLocalDeps(fromFile: string, code: string, keys: Set<string>): string[] {
  _keysCache = keys;
  const deps: string[] = [];
  const seen = new Set<string>();

  const tryAdd = (spec: string) => {
    const r = resolveModule(fromFile, spec);
    if (r && !seen.has(r)) {
      seen.add(r);
      deps.push(r);
    }
  };

  // import ... from 'x'
  const re =
    /import\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const spec = m[1] || m[2];
    if (spec) tryAdd(spec);
  }

  return deps;
}

/** DFS post-order: dependencies first */
function topoOrder(entry: string, map: Map<string, string>): string[] {
  const order: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (p: string) => {
    const code = map.get(p);
    if (!code) return;
    if (visited.has(p)) return;
    if (visiting.has(p)) return;
    visiting.add(p);
    const keys = new Set(map.keys());
    for (const d of collectLocalDeps(p, code, keys)) {
      if (map.has(d)) visit(d);
    }
    visiting.delete(p);
    visited.add(p);
    order.push(p);
  };

  visit(entry);
  return order;
}

function lucideShimLine(namesRaw: string): string {
  return namesRaw
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => {
      const parts = n.split(/\s+as\s+/);
      const local = (parts[1] || parts[0]).trim();
      const orig = parts[0].trim();
      return `const ${local} = window.${orig} || window._iconProxy?.${orig} || ((p) => React.createElement('span',{style:{width:(p?.size||16)+'px',height:(p?.size||16)+'px',fontSize:'10px',border:'1px dashed #555',borderRadius:'2px',color:'#888'}},'⬡'));`;
    })
    .join("\n");
}

/** Remove Vite entry mount — we mount once in the preview shell */
function stripClientMount(code: string): string {
  const rootEl = String.raw`document\.getElementById\s*\(\s*['"]root['"]\s*\)`;
  return code
    .replace(
      new RegExp(`ReactDOM\\.createRoot\\s*\\(\\s*${rootEl}\\s*\\)\\s*\\.render\\s*\\([\\s\\S]*?\\)\\s*;?`),
      "/* preview: mounted by shell */"
    )
    .replace(
      new RegExp(`createRoot\\s*\\(\\s*${rootEl}\\s*\\)\\s*\\.render\\s*\\([\\s\\S]*?\\)\\s*;?`),
      "/* preview: mounted by shell */"
    );
}

function stubRadixImport(line: string): string {
  const m = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]@radix-ui\/[^'"]+['"]\s*;?/);
  if (!m) {
    const d = line.match(/import\s+(\w+)\s+from\s+['"]@radix-ui\/[^'"]+['"]\s*;?/);
    if (d) {
      const name = d[1];
      return `const ${name} = (props) => React.createElement('div', props, props.children);`;
    }
    return "";
  }
  const names = m[1]
    .split(",")
    .map((s) => s.trim().split(/\s+as\s+/).map((x) => x.trim()))
    .filter((pair) => pair[0]);
  return names
    .map(([orig, alias]) => {
      const local = alias || orig;
      return `const ${local} = React.forwardRef((props, ref) => React.createElement('div', { ...props, ref }, props.children));`;
    })
    .join("\n");
}

function transformModule(code: string): string {
  let out = code;

  // lucide-react
  out = out.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]\s*;?/g, (_, names) =>
    lucideShimLine(names)
  );

  // Radix (line by line)
  out = out
    .split("\n")
    .map((line) => {
      if (/from\s+['"]@radix-ui\//.test(line) && /^\s*import\s/.test(line)) {
        const stub = stubRadixImport(line.trim());
        return stub || `/* stripped: ${line.trim()} */`;
      }
      return line;
    })
    .join("\n");

  // clsx / tailwind-merge / cva — globals in preview shell (avoid duplicate const)
  out = out.replace(/import\s+\{\s*clsx\s*\}\s+from\s+['"]clsx['"]\s*;?/g, "");
  out = out.replace(/import\s+\{\s*twMerge\s*\}\s+from\s+['"]tailwind-merge['"]\s*;?/g, "");
  out = out.replace(/import\s+\{\s*cva\s*\}\s+from\s+['"]class-variance-authority['"]\s*;?/g, "");
  out = out.replace(/import\s+cva\s+from\s+['"]class-variance-authority['"]\s*;?/g, "");

  // Drop package imports we don't bundle
  out = out.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, (line) => {
    if (/from\s+['"]react['"]/.test(line)) return "";
    if (/from\s+['"]react-dom/.test(line)) return "";
    if (/from\s+['"]react\/jsx-runtime['"]/.test(line)) return "";
    if (/from\s+['"]\.\//.test(line)) return "";
    if (/from\s+['"]\.\.\//.test(line)) return "";
    if (/from\s+['"]@\//.test(line)) return "";
    if (/from\s+['"]lucide-react['"]/.test(line)) return "";
    if (/from\s+['"]@radix-ui\//.test(line)) return "";
    if (/from\s+['"]clsx['"]/.test(line)) return "";
    if (/from\s+['"]tailwind-merge['"]/.test(line)) return "";
    if (/from\s+['"]class-variance-authority['"]/.test(line)) return "";
    /* bare side-effect import */
    if (/^\s*import\s+['"][^'"]+['"]\s*;?\s*$/.test(line)) return "";
    return `/* unbundled import stripped */\n`;
  });

  out = out.replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*$/gm, "");

  // exports → executable in bundle
  out = out.replace(/^\s*export\s+default\s+/gm, "");
  out = out.replace(/^\s*export\s+/gm, "");

  return out.trim();
}

function pickEntry(map: Map<string, string>): string {
  for (const k of ["/src/index.jsx", "/src/main.jsx", "/src/index.tsx", "/src/main.tsx"]) {
    if (map.has(k) && /createRoot|ReactDOM\.render/.test(map.get(k) || "")) return k;
  }
  if (map.has("/src/App.jsx")) return "/src/App.jsx";
  if (map.has("/src/App.tsx")) return "/src/App.tsx";
  const first = [...map.keys()].find((p) => /\/App\.(jsx|tsx|js|ts)$/.test(p));
  if (first) return first;
  return [...map.keys()][0] || "/src/App.jsx";
}

function detectRootComponent(combined: string, entry: string, entryCode: string): string {
  if (/\/src\/(index|main)\.(jsx|tsx)$/i.test(entry)) {
    const m = entryCode.match(/<\s*([A-Z][a-zA-Z0-9]*)\s*[\s/>]/);
    if (m) return m[1];
  }
  const stripped = combined.replace(/^\s*export\s+/gm, "");
  const matches = stripped.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/g);
  if (matches?.length) {
    const last = matches[matches.length - 1].replace(/^(function|const)\s+/, "");
    return last;
  }
  const fallback = entryCode.match(/(?:function|const)\s+(\w+)/);
  return fallback?.[1] || "App";
}

/** Inline tailwind play CDN + escape for script embedding */
function escapeForScript(s: string): string {
  return s.replace(/<\/script>/gi, "<\\/script>");
}

/**
 * Build full HTML document for iframe srcDoc from the same file map Sandpack uses.
 */
export function buildWebDevLivePreviewHtml(sandpackFiles: SandpackLikeFiles): string {
  const map = new Map<string, string>();
  for (const [k, v] of Object.entries(sandpackFiles)) {
    if (!/\.(jsx|tsx|js|ts)$/i.test(k)) continue;
    const code = getCode(v);
    if (code) map.set(k, code);
  }

  if (map.size === 0) {
    return minimalErrorHtml("No JS/JSX files in project.");
  }

  const entry = pickEntry(map);
  const entryCode = map.get(entry) || "";
  const ordered = topoOrder(entry, map);
  const combined = ordered
    .map((p) => {
      let raw = map.get(p) || "";
      if (/\/(index|main)\.(jsx|tsx|js|ts)$/i.test(p)) raw = stripClientMount(raw);
      return transformModule(raw);
    })
    .filter(Boolean)
    .join("\n\n");
  const rootName = detectRootComponent(combined, entry, entryCode);

  const babelBody = escapeForScript(`
const { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, Fragment } = React;
const clsx = (...a) => a.flat(Infinity).filter((x) => x != null && x !== false && x !== '').join(' ').trim();
const twMerge = (s) => (typeof s === 'string' ? s : '');
const cva = (base, config) => (props) => {
  let c = (base && String(base)) || '';
  const variants = config && config.variants;
  if (variants && props) {
    for (const key of Object.keys(variants)) {
      const val = props[key];
      if (val != null && variants[key][val]) c += ' ' + variants[key][val];
    }
  }
  if (config?.defaultVariants) {
    for (const [k, v] of Object.entries(config.defaultVariants)) {
      if (props && props[k] == null && variants?.[k]?.[v]) c += ' ' + variants[k][v];
    }
  }
  return c.trim();
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', { className: 'error-boundary' },
        React.createElement('h3', null, 'Render error'),
        React.createElement('pre', null, this.state.error?.message || 'Unknown'),
        React.createElement('button', { onClick: () => this.setState({ hasError: false, error: null }), style: { marginTop: 8, padding: '6px 12px' } }, 'Retry')
      );
    }
    return this.props.children;
  }
}

${combined}

try {
  const el = document.getElementById('root');
  if (window.ReactDOM && window.ReactDOM.createRoot) {
    const root = window.ReactDOM.createRoot(el);
    root.render(React.createElement(ErrorBoundary, null, React.createElement(${rootName})));
  } else {
    el.innerHTML = '<div class="error-boundary"><pre>ReactDOM.createRoot not available</pre></div>';
  }
} catch (e) {
  document.getElementById('root').innerHTML = '<div class="error-boundary"><h3>Init error</h3><pre>' + (e && e.message) + '</pre></div>';
}
`);

  // Icon shims (subset — proxy fills the rest)
  const iconBlock = /* same idea as CodeEditor */ `
const _iconSvgs = {
  Plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  Home: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  Menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  X: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
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
window._iconProxy = new Proxy({}, { get: (_, name) => {
  if (window[name]) return window[name];
  return (props) => React.createElement('span', {style:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:(props?.size||16)+'px',height:(props?.size||16)+'px',fontSize:'10px',border:'1px dashed #555',borderRadius:'2px',color:'#888'}}, '⬡');
}});
`;

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"><\/script>
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; color: #e0e0e0; min-height: 100vh; }
.error-boundary { padding: 16px; background: #1a0000; border: 1px solid #ff4444; border-radius: 8px; margin: 16px; }
.error-boundary h3 { color: #ff6b6b; margin-bottom: 8px; }
.error-boundary pre { font-size: 11px; color: #ff9999; white-space: pre-wrap; word-break: break-all; }
</style>
</head><body>
<div id="root"></div>
<script>
${iconBlock}
<\/script>
<script type="text/babel" data-type="module">
${babelBody}
<\/script>
</body></html>`;
}

function minimalErrorHtml(msg: string): string {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:16px;background:#1a1a2e;color:#e0e0e0;"><pre>${msg.replace(
    /</g,
    "&lt;"
  )}</pre></body></html>`;
}
