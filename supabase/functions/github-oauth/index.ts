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

const SCOPES = "repo user:email";

async function githubUser(token: string) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "lunor-ai",
    },
  });
  if (!res.ok) {
    const details = await res.text();
    console.error(`[github-oauth] /user failed [${res.status}]: ${details}`);
    return null;
  }
  return await res.json() as { login: string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token === "null" || token === "undefined") return json({ error: "Unauthorized" }, 401);

  const authClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
  const claims = claimsData?.claims as { sub?: string; email?: string } | undefined;
  if (claimsError || !claims?.sub) {
    console.error("[github-oauth] auth error:", claimsError?.message ?? "missing claims");
    return json({ error: "Unauthorized" }, 401);
  }
  const user = { id: claims.sub, email: claims.email ?? "" };

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  const CLIENT_ID = Deno.env.get("GITHUB_OAUTH_CLIENT_ID") ?? "";
  const CLIENT_SECRET = Deno.env.get("GITHUB_OAUTH_CLIENT_SECRET") ?? "";

  try {
    if (action === "status") {
      const { data } = await admin
        .from("github_connections")
        .select("github_login, auth_type, last_repo")
        .eq("user_id", user.id)
        .maybeSingle();
      return json({
        connected: !!data,
        login: data?.github_login ?? null,
        auth_type: data?.auth_type ?? null,
        last_repo: data?.last_repo ?? null,
        oauth_available: !!(CLIENT_ID && CLIENT_SECRET),
      });
    }

    if (action === "start") {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        return json({ error: "GitHub one-click sign-in is not configured yet. Use a personal access token instead." }, 400);
      }
      const redirectUri = typeof body.redirect_uri === "string" ? body.redirect_uri : "";
      if (!/^https?:\/\/.+/.test(redirectUri)) return json({ error: "Invalid redirect_uri" }, 400);
      // state is bound to the user id so the callback cannot be replayed for someone else
      const state = `${user.id}.${crypto.randomUUID()}`;
      const url = new URL("https://github.com/login/oauth/authorize");
      url.searchParams.set("client_id", CLIENT_ID);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("scope", SCOPES);
      url.searchParams.set("state", state);
      return json({ url: url.toString(), state });
    }

    if (action === "callback") {
      if (!CLIENT_ID || !CLIENT_SECRET) return json({ error: "GitHub OAuth is not configured" }, 400);
      const code = typeof body.code === "string" ? body.code : "";
      const state = typeof body.state === "string" ? body.state : "";
      if (!code) return json({ error: "Missing code" }, 400);
      if (!state.startsWith(`${user.id}.`)) return json({ error: "Invalid state" }, 400);

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: typeof body.redirect_uri === "string" ? body.redirect_uri : undefined,
        }),
      });
      const tokenBody = await tokenRes.json().catch(() => null) as
        | { access_token?: string; error_description?: string; error?: string }
        | null;
      if (!tokenRes.ok || !tokenBody?.access_token) {
        console.error(`[github-oauth] token exchange failed [${tokenRes.status}]`, tokenBody?.error);
        return json({ error: tokenBody?.error_description ?? "GitHub authorization failed" }, 400);
      }

      const gh = await githubUser(tokenBody.access_token);
      if (!gh) return json({ error: "Could not read your GitHub profile" }, 400);

      const { error } = await admin.from("github_connections").upsert({
        user_id: user.id,
        github_login: gh.login,
        auth_type: "oauth",
        access_token: tokenBody.access_token,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;

      return json({ connected: true, login: gh.login, auth_type: "oauth" });
    }

    if (action === "save_pat") {
      const token = typeof body.token === "string" ? body.token.trim() : "";
      if (token.length < 20 || token.length > 512) return json({ error: "That does not look like a valid GitHub token" }, 400);

      const gh = await githubUser(token);
      if (!gh) return json({ error: "GitHub rejected that token. Make sure it has the 'repo' scope." }, 400);

      const { error } = await admin.from("github_connections").upsert({
        user_id: user.id,
        github_login: gh.login,
        auth_type: "pat",
        access_token: token,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;

      return json({ connected: true, login: gh.login, auth_type: "pat" });
    }

    if (action === "disconnect") {
      const { error } = await admin.from("github_connections").delete().eq("user_id", user.id);
      if (error) throw error;
      return json({ connected: false });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("[github-oauth] error", e);
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
