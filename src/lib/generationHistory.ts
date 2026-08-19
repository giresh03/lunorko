// Project generation history — every AI generation is snapshotted so users can
// view, revisit and re-run previously created (full-stack) projects.

export interface GenerationFileSnapshot {
  path: string;
  language?: string;
  content: string;
}

export interface GenerationEntry {
  id: string;
  domain: string;
  projectId: string;
  projectName: string;
  prompt: string;
  createdAt: number;
  isFullStack: boolean;
  files: GenerationFileSnapshot[];
}

const KEY = "lunor-generation-history";
const MAX_ENTRIES = 40;

function readAll(): GenerationEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as GenerationEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: GenerationEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // storage blocked / quota exceeded — history is best-effort only
  }
}

export function getHistory(domain?: string): GenerationEntry[] {
  const all = readAll().sort((a, b) => b.createdAt - a.createdAt);
  return domain ? all.filter((e) => e.domain === domain) : all;
}

export function addHistoryEntry(
  entry: Omit<GenerationEntry, "id" | "createdAt">
): GenerationEntry {
  const full: GenerationEntry = {
    ...entry,
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  writeAll([full, ...readAll()]);
  return full;
}

export function deleteHistoryEntry(id: string) {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function clearHistory(domain?: string) {
  writeAll(domain ? readAll().filter((e) => e.domain !== domain) : []);
}

export function isFullStackFiles(paths: string[]): boolean {
  return paths.some((p) => /(^|\/)(db|server|functions|api)\//.test(p));
}

export function relativeTime(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
