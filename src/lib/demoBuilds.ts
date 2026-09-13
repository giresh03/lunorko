// Demo builds — pre-generated full-stack websites saved with their exact prompt.
// When a user sends a matching prompt, the workspace replays the saved answer
// instantly (no AI call, no credits) through the normal streaming pipeline.

import { supabase } from "@/integrations/supabase/client";

export interface DemoBuild {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string;
  prompt: string;
  domain: string;
  response: string;
  fileCount: number;
}

/** Case/punctuation/whitespace-insensitive key used for exact-prompt matching. */
export function normalizePrompt(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const mapRow = (r: {
  id: string; slug: string; title: string; description: string | null; level: string;
  prompt: string; domain: string; response: string; file_count: number;
}): DemoBuild => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  description: r.description,
  level: r.level,
  prompt: r.prompt,
  domain: r.domain,
  response: r.response,
  fileCount: r.file_count,
});

/** Find a saved build whose prompt matches the user's prompt exactly (normalized). */
export async function findDemoBuild(prompt: string, domain?: string): Promise<DemoBuild | null> {
  const key = normalizePrompt(prompt);
  if (key.length < 8) return null;
  try {
    let q = supabase
      .from("demo_builds")
      .select("id, slug, title, description, level, prompt, domain, response, file_count")
      .eq("prompt_key", key)
      .limit(1);
    if (domain) q = q.eq("domain", domain);
    const { data, error } = await q.maybeSingle();
    if (error || !data) return null;
    return mapRow(data);
  } catch {
    return null;
  }
}

/** Lightweight list (no response body) for the quick-pick chips. */
export async function listDemoBuilds(domain?: string): Promise<Omit<DemoBuild, "response">[]> {
  try {
    let q = supabase
      .from("demo_builds")
      .select("id, slug, title, description, level, prompt, domain, file_count")
      .order("sort_order", { ascending: true });
    if (domain) q = q.eq("domain", domain);
    const { data, error } = await q;
    if (error || !data) return [];
    return data.map((r) => mapRow({ ...r, response: "" })).map(({ response: _r, ...rest }) => rest);
  } catch {
    return [];
  }
}
