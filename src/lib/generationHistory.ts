// Project generation history — every AI generation is snapshotted so users can
// view, revisit and re-run previously created (full-stack) projects.
//
// Storage strategy: localStorage is the fast, always-available cache. When the
// user is signed in, entries are also mirrored to `workspace_history` in the
// backend so past works follow the account across devices.

import { supabase } from "@/integrations/supabase/client";

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
  /** true when the entry is saved to the user's account (not just this browser) */
  synced?: boolean;
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

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export function getHistory(domain?: string): GenerationEntry[] {
  const all = readAll().sort((a, b) => b.createdAt - a.createdAt);
  return domain ? all.filter((e) => e.domain === domain) : all;
}

/**
 * Pull the signed-in user's history from the backend, merge it with the local
 * cache and return the merged list. Local-only entries are pushed up so they
 * become available on other devices too.
 */
export async function syncHistory(domain?: string): Promise<GenerationEntry[]> {
  const userId = await currentUserId();
  if (!userId) return getHistory(domain);

  const local = readAll();
  const { data, error } = await supabase
    .from("workspace_history")
    .select("client_id, domain, project_id, project_name, prompt, is_full_stack, files, created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_ENTRIES);

  if (error) {
    console.warn("[history] cloud fetch failed", error.message);
    return getHistory(domain);
  }

  const remote: GenerationEntry[] = (data || []).map((r) => ({
    id: r.client_id,
    domain: r.domain,
    projectId: r.project_id,
    projectName: r.project_name,
    prompt: r.prompt,
    createdAt: new Date(r.created_at).getTime(),
    isFullStack: r.is_full_stack,
    files: Array.isArray(r.files) ? (r.files as unknown as GenerationFileSnapshot[]) : [],
    synced: true,
  }));

  const remoteIds = new Set(remote.map((r) => r.id));
  const localOnly = local.filter((e) => !remoteIds.has(e.id));

  // Best-effort upload of anything that only exists on this device.
  if (localOnly.length > 0) {
    const { error: upErr } = await supabase.from("workspace_history").upsert(
      localOnly.map((e) => ({
        user_id: userId,
        client_id: e.id,
        domain: e.domain,
        project_id: e.projectId,
        project_name: e.projectName,
        prompt: e.prompt,
        is_full_stack: e.isFullStack,
        files: e.files as unknown as never,
        created_at: new Date(e.createdAt).toISOString(),
      })),
      { onConflict: "user_id,client_id" }
    );
    if (!upErr) localOnly.forEach((e) => (e.synced = true));
  }

  const merged = [...remote, ...localOnly].sort((a, b) => b.createdAt - a.createdAt);
  writeAll(merged);
  return domain ? merged.filter((e) => e.domain === domain) : merged;
}

export function addHistoryEntry(
  entry: Omit<GenerationEntry, "id" | "createdAt">
): GenerationEntry {
  const full: GenerationEntry = {
    ...entry,
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    synced: false,
  };
  writeAll([full, ...readAll()]);

  // Mirror to the account in the background.
  void (async () => {
    const userId = await currentUserId();
    if (!userId) return;
    const { error } = await supabase.from("workspace_history").upsert(
      {
        user_id: userId,
        client_id: full.id,
        domain: full.domain,
        project_id: full.projectId,
        project_name: full.projectName,
        prompt: full.prompt,
        is_full_stack: full.isFullStack,
        files: full.files as unknown as never,
        created_at: new Date(full.createdAt).toISOString(),
      },
      { onConflict: "user_id,client_id" }
    );
    if (error) {
      console.warn("[history] cloud save failed", error.message);
      return;
    }
    writeAll(readAll().map((e) => (e.id === full.id ? { ...e, synced: true } : e)));
  })();

  return full;
}

export function deleteHistoryEntry(id: string) {
  writeAll(readAll().filter((e) => e.id !== id));
  void (async () => {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from("workspace_history").delete().eq("user_id", userId).eq("client_id", id);
  })();
}

export function clearHistory(domain?: string) {
  writeAll(domain ? readAll().filter((e) => e.domain !== domain) : []);
  void (async () => {
    const userId = await currentUserId();
    if (!userId) return;
    let q = supabase.from("workspace_history").delete().eq("user_id", userId);
    if (domain) q = q.eq("domain", domain);
    await q;
  })();
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
