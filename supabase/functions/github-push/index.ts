import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const GH = "https://api.github.com";

function slugifyRepo(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return slug || `lunor-project-${Date.now()}`;
}

async function gh(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${GH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "lunor-ai",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let parsed: unknown = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!res.ok) {
    console.error(`[github-push] ${path} failed [${res.status}]: ${text}`);
    const message = (parsed as { message?: string } | null)?.message ?? "GitHub request failed";
    throw Object.assign(new Error(message), { status: res.status, details: parsed });
  }
  return parsed as any;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return json({ error: "Unauthorized" }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }

  const files = Array.isArray(body?.files) ? body.files : null;
  if (!files || files.length === 0) return json({ error: "No files to push" }, 400);
  if (files.length > 300) return json({ error: "Too many files (max 300)" }, 400);
  for (const f of files) {
    if (typeof f?.path !== "string" || !f.path.trim() || typeof f?.content !== "string") {
      return json({ error: "Each file needs a path and text content" }, 400);
    }
    if (f.path.includes("..") || f.path.startsWith("/")) return json({ error: `Invalid file path: ${f.path}` }, 400);
    if (f.content.length > 400_000) return json({ error: `File too large: ${f.path}` }, 400);
  }

  const isPrivate = body?.private !== false;
  const commitMessage = typeof body?.commitMessage === "string" && body.commitMessage.trim()
    ? body.commitMessage.trim().slice(0, 200)
    : "Update from Lunor.AI";

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: conn } = await admin
    .from("github_connections")
    .select("access_token, github_login, last_repo")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conn?.access_token) {
    return json({ error: "not_connected", message: "Connect your GitHub account first." }, 428);
  }

  const token = conn.access_token as string;
  const owner = conn.github_login as string;
  const repoName = slugifyRepo(
    typeof body?.repo === "string" && body.repo.trim()
      ? body.repo.trim().split("/").pop()!
      : (conn.last_repo?.split("/").pop() ?? `lunor-${Date.now()}`),
  );

  try {
    let created = false;
    let repo: any;
    try {
      repo = await gh(token, `/repos/${owner}/${repoName}`);
    } catch (e: any) {
      if (e.status !== 404) throw e;
      repo = await gh(token, "/user/repos", {
        method: "POST",
        body: JSON.stringify({
          name: repoName,
          private: isPrivate,
          description: "Built with Lunor.AI",
          auto_init: true,
        }),
      });
      created = true;
      // give GitHub a moment to initialise the default branch
      await new Promise((r) => setTimeout(r, 1500));
    }

    const branch: string = repo.default_branch || "main";
    const ref = `heads/${branch}`;

    let baseCommitSha: string | null = null;
    let baseTreeSha: string | undefined;
    try {
      const refData = await gh(token, `/repos/${owner}/${repoName}/git/ref/${ref}`);
      baseCommitSha = refData.object.sha;
      const commitData = await gh(token, `/repos/${owner}/${repoName}/git/commits/${baseCommitSha}`);
      baseTreeSha = commitData.tree.sha;
    } catch (e: any) {
      if (e.status !== 404 && e.status !== 409) throw e;
    }

    // create a blob per file, then one tree, then one commit
    const tree = [] as Array<{ path: string; mode: string; type: string; sha: string }>;
    for (const f of files) {
      const blob = await gh(token, `/repos/${owner}/${repoName}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
      });
      tree.push({ path: f.path.replace(/^\.\//, ""), mode: "100644", type: "blob", sha: blob.sha });
    }

    const newTree = await gh(token, `/repos/${owner}/${repoName}/git/trees`, {
      method: "POST",
      body: JSON.stringify(baseTreeSha ? { base_tree: baseTreeSha, tree } : { tree }),
    });

    const commit = await gh(token, `/repos/${owner}/${repoName}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message: commitMessage,
        tree: newTree.sha,
        parents: baseCommitSha ? [baseCommitSha] : [],
      }),
    });

    if (baseCommitSha) {
      await gh(token, `/repos/${owner}/${repoName}/git/refs/${ref}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
    } else {
      await gh(token, `/repos/${owner}/${repoName}/git/refs`, {
        method: "POST",
        body: JSON.stringify({ ref: `refs/${ref}`, sha: commit.sha }),
      });
    }

    await admin
      .from("github_connections")
      .update({ last_repo: `${owner}/${repoName}`, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return json({
      ok: true,
      created,
      repo: `${owner}/${repoName}`,
      repoUrl: repo.html_url ?? `https://github.com/${owner}/${repoName}`,
      commitUrl: `https://github.com/${owner}/${repoName}/commit/${commit.sha}`,
      branch,
      fileCount: files.length,
    });
  } catch (e: any) {
    console.error("[github-push] error", e);
    return json({ error: e?.message ?? "Push failed", status: e?.status ?? 500 }, e?.status && e.status < 500 ? e.status : 500);
  }
});
