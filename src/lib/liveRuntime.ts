/**
 * Lunor Live Runtime — client helpers for the hosted backend that powers
 * AI-generated full-stack projects (auth + REST persisted per project).
 */
import { supabase } from "@/integrations/supabase/client";

export type RuntimeScope = "domain" | "level" | "team";

export interface RuntimeTable {
  name: string;
  rows: number;
}

export interface RuntimeStats {
  users: number;
  documents: number;
  /** Real tables in the app's database schema, with live row counts. */
  tables: RuntimeTable[];
  /** Legacy alias: table names only. */
  collections: string[];
}

export interface RuntimeCredentials {
  host: string;
  port: string;
  database: string;
  schema: string;
  user: string;
  password: string;
  connectionString: string;
  scope: string;
}

/** A table the generated app declares up front. */
export interface DataModelTable {
  table: string;
  columns: { name: string; type?: string; required?: boolean }[];
}

export interface RuntimeInfo {
  projectId: string;
  scope: RuntimeScope;
  scopeKey: string;
  apiUrl: string;
  baseUrl: string;
  schemaName?: string;
  stats: RuntimeStats;
  credentials?: RuntimeCredentials;
  createdAt: string;
}

export class RuntimeError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function manage(
  action: "ensure" | "reset" | "stats" | "schema" | "credentials",
  scope: RuntimeScope,
  scopeKey: string,
  name?: string,
  extra?: Record<string, unknown>,
): Promise<RuntimeInfo> {
  const { data, error } = await supabase.functions.invoke("project-runtime/manage", {
    body: { action, scope, scopeKey, name, ...extra },
  });
  if (error) {
    // supabase-js wraps non-2xx in FunctionsHttpError with the Response in context
    let message = error.message || "Runtime request failed";
    let code: string | undefined;
    let status: number | undefined;
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      status = ctx.status;
      try {
        const body = await ctx.json();
        if (body?.error) message = typeof body.error === "string" ? body.error : JSON.stringify(body.error);
        code = body?.code;
      } catch {
        /* ignore */
      }
    }
    throw new RuntimeError(message, code, status);
  }
  if (!data?.apiUrl) throw new RuntimeError("Runtime did not return an API URL");
  return data as RuntimeInfo;
}

export const ensureRuntime = (scope: RuntimeScope, scopeKey: string, name?: string) =>
  manage("ensure", scope, scopeKey, name);
export const resetRuntime = (scope: RuntimeScope, scopeKey: string) => manage("reset", scope, scopeKey);
export const runtimeStats = (scope: RuntimeScope, scopeKey: string) => manage("stats", scope, scopeKey);
/** Create/extend the app's real tables from a declared data model. */
export const applyDataModel = (scope: RuntimeScope, scopeKey: string, model: DataModelTable[]) =>
  manage("schema", scope, scopeKey, undefined, { model });
/** Read-only database credentials for outside tools (psql, TablePlus, DBeaver). */
export const runtimeCredentials = (scope: RuntimeScope, scopeKey: string, rotate = false) =>
  manage("credentials", scope, scopeKey, undefined, { rotate });

/** Does this project look like it needs a backend? */
export function filesNeedBackend(files: { path: string; content: string }[]): boolean {
  return files.some(
    (f) =>
      /^(server|backend|api)\//i.test(f.path) ||
      /\/(server|backend)\//i.test(f.path) ||
      /(^|\/)api\.js$/i.test(f.path) ||
      /(^|\/)(login|signin|signup|sign-up|register|dashboard|admin|account)\.html$/i.test(f.path) ||
      /__LUNOR_API_URL__|lunorApi|["'`]\/api\//.test(f.content) ||
      /VITE_API_URL|\/api\/auth\/(login|register|me)|fetch\(\s*[`'"](\/api|https?:\/\/localhost:\d+\/api)/.test(f.content),
  );
}

/**
 * Browser-side shim: rewrites any request aimed at the generated Express
 * server (`/api/...`, `http://localhost:5000/api/...`, `${VITE_API_URL}/...`)
 * to the hosted Lunor runtime so previews run live with real auth + data.
 */
export function buildApiShimScript(apiUrl: string): string {
  const safe = JSON.stringify(apiUrl.replace(/\/+$/, ""));
  return `(function(){
  if (window.__LUNOR_RUNTIME_INSTALLED__) return;
  window.__LUNOR_RUNTIME_INSTALLED__ = true;
  var API = ${safe};
  var BASE = API.replace(/\\/api$/, "");
  window.__LUNOR_API_URL__ = API;
  window.LUNOR_API_URL = API;
  window.API_URL = window.API_URL || API;
  window.API_BASE_URL = window.API_BASE_URL || API;
  try {
    window.process = window.process || {};
    window.process.env = Object.assign({}, window.process.env || {}, {
      VITE_API_URL: API, REACT_APP_API_URL: API, API_URL: API, NEXT_PUBLIC_API_URL: API, NODE_ENV: "production"
    });
  } catch (e) {}
  function rewrite(input) {
    try {
      var u = typeof input === "string" ? input : (input && input.url) || String(input);
      if (!u) return u;
      if (u.indexOf(BASE) === 0) return u;
      var m = u.match(/^https?:\\/\\/(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)(:\\d+)?(\\/.*)?$/i);
      if (m) {
        var p = m[3] || "/";
        if (p.indexOf("/api") !== 0) p = "/api" + (p === "/" ? "" : p);
        return BASE + p;
      }
      if (u.indexOf("/api/") === 0 || u === "/api") return BASE + u;
      if (u.indexOf("api/") === 0) return BASE + "/" + u;
      if (u.indexOf("./api/") === 0) return BASE + u.slice(1);
      var here = (function(){ try { return new URL(u, window.location.href); } catch (e) { return null; } })();
      if (here && here.origin === window.location.origin && here.pathname.indexOf("/api/") === 0) return BASE + here.pathname + here.search;
      return u;
    } catch (e) { return input; }
  }
  var origFetch = window.fetch ? window.fetch.bind(window) : null;
  if (origFetch) {
    window.fetch = function(input, init) {
      var target = rewrite(input);
      if (target !== input && input && typeof input === "object" && input.url) {
        try { input = new Request(target, input); } catch (e) { input = target; }
      } else if (target !== input) { input = target; }
      return origFetch(input, init);
    };
  }
  var XO = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
  if (XO) {
    window.XMLHttpRequest.prototype.open = function(method, url) {
      var args = Array.prototype.slice.call(arguments);
      args[1] = rewrite(url);
      return XO.apply(this, args);
    };
  }
  window.lunorApi = {
    url: API,
    request: function(path, opts) {
      opts = opts || {};
      var headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
      var token = null; try { token = localStorage.getItem("token"); } catch (e) {}
      if (token && !headers.Authorization) headers.Authorization = "Bearer " + token;
      return origFetch(rewrite(path), Object.assign({}, opts, { headers: headers, body: opts.body && typeof opts.body !== "string" ? JSON.stringify(opts.body) : opts.body })).then(function(r){ return r.json(); });
    }
  };
  console.info("[Lunor] Live backend connected:", API);
})();`;
}

/** Inject the shim as the very first script in an HTML document. */
export function injectApiShim(html: string, apiUrl: string | null | undefined): string {
  if (!apiUrl) return html;
  // Replace any previously injected shim so a backend switch takes effect.
  html = html.replace(/<script data-lunor-runtime>[\s\S]*?<\/script>\n?/g, "");
  const tag = `<script data-lunor-runtime>${buildApiShimScript(apiUrl)}</script>`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}\n${tag}`);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}\n<head>${tag}</head>`);
  return `${tag}\n${html}`;
}

/** Replace `import.meta.env.VITE_API_URL` / `process.env.*_API_URL` references in source with the live URL. */
export function replaceEnvApiRefs(code: string, apiUrl: string | null | undefined): string {
  if (!apiUrl) return code;
  const lit = JSON.stringify(apiUrl);
  return code
    .replace(/import\.meta\.env\.(VITE_API_URL|VITE_API_BASE_URL|VITE_BACKEND_URL)/g, lit)
    .replace(/process\.env\.(REACT_APP_API_URL|API_URL|NEXT_PUBLIC_API_URL|VITE_API_URL)/g, lit)
    .replace(/(["'`])https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api\1/g, `$1${apiUrl}$1`);
}

/** Sandpack module that installs the shim (imported first from index.jsx). */
export function buildSandpackRuntimeModule(apiUrl: string): string {
  return `${buildApiShimScript(apiUrl)}\nexport const API_URL = ${JSON.stringify(apiUrl)};\nexport default API_URL;\n`;
}
