import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonRes = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// ------------------------------------------------------- generated-site theme
interface SiteFile { path: string; content: string; language?: string }
interface SiteTheme {
  accent?: string; accentDark?: string; background?: string; surface?: string; text?: string;
  headingFont?: string; bodyFont?: string;
}

const THEME_START = "/* lunor-admin-theme:start */";
const THEME_END = "/* lunor-admin-theme:end */";

const fontStack = (name?: string, fallback = "sans-serif") =>
  name ? `'${name}', ${fallback}` : "";

function themeBlock(theme: SiteTheme): string {
  const vars: string[] = [];
  if (theme.accent) vars.push(`  --accent: ${theme.accent};`, `  --primary: ${theme.accent};`, `  --brand: ${theme.accent};`);
  if (theme.accentDark) vars.push(`  --accent-dark: ${theme.accentDark};`);
  if (theme.background) vars.push(`  --bg: ${theme.background};`, `  --background: ${theme.background};`);
  if (theme.surface) vars.push(`  --surface: ${theme.surface};`, `  --card: ${theme.surface};`);
  if (theme.text) vars.push(`  --text: ${theme.text};`, `  --foreground: ${theme.text};`);
  if (theme.headingFont) vars.push(`  --font-heading: ${fontStack(theme.headingFont)};`);
  if (theme.bodyFont) vars.push(`  --font-body: ${fontStack(theme.bodyFont)};`);

  const rules: string[] = [];
  if (vars.length) rules.push(`:root {\n${vars.join("\n")}\n}`);
  if (theme.background) rules.push(`body { background: ${theme.background};${theme.text ? ` color: ${theme.text};` : ""} }`);
  if (theme.bodyFont) rules.push(`body { font-family: ${fontStack(theme.bodyFont)}; }`);
  if (theme.headingFont) rules.push(`h1, h2, h3, h4, h5, h6 { font-family: ${fontStack(theme.headingFont, "serif")}; }`);
  if (theme.accent) {
    rules.push(`a { color: ${theme.accent}; }`);
    rules.push(`.btn, .button, button.primary, .btn-primary, [class*="cta"] { background: ${theme.accent}; border-color: ${theme.accent}; }`);
  }
  if (!rules.length) return "";
  return `${THEME_START}\n${rules.join("\n")}\n${THEME_END}`;
}

function stripThemeBlock(css: string): string {
  const s = css.indexOf(THEME_START);
  const e = css.indexOf(THEME_END);
  if (s === -1 || e === -1 || e < s) return css;
  return (css.slice(0, s) + css.slice(e + THEME_END.length)).replace(/\n{3,}$/g, "\n");
}

function fontLink(theme: SiteTheme): string {
  const families = [theme.headingFont, theme.bodyFont]
    .filter((f): f is string => !!f)
    .filter((f, i, arr) => arr.indexOf(f) === i)
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800`);
  if (!families.length) return "";
  return `<link data-lunor-theme rel="stylesheet" href="https://fonts.googleapis.com/css2?${families.join("&")}&display=swap">`;
}

function applyTheme(files: SiteFile[], theme: SiteTheme): SiteFile[] {
  const block = themeBlock(theme);
  const link = fontLink(theme);
  return files.map((f) => {
    const path = (f.path || "").toLowerCase();
    if (/\.css$/.test(path)) {
      const base = stripThemeBlock(f.content || "").replace(/\s+$/, "");
      return { ...f, content: block ? `${base}\n\n${block}\n` : `${base}\n` };
    }
    if (/\.html$/.test(path)) {
      let html = (f.content || "").replace(/[ \t]*<link[^>]*data-lunor-theme[^>]*>\n?/gi, "");
      if (link && /<\/head>/i.test(html)) html = html.replace(/<\/head>/i, `  ${link}\n</head>`);
      else if (link) html = `${link}\n${html}`;
      return { ...f, content: html };
    }
    return f;
  });
}

function readTheme(files: unknown): SiteTheme {
  const list = Array.isArray(files) ? (files as SiteFile[]) : [];
  const css = list.find((f) => /\.css$/i.test(f?.path || ""))?.content || "";
  const s = css.indexOf(THEME_START);
  const e = css.indexOf(THEME_END);
  if (s === -1 || e === -1) return {};
  const block = css.slice(s, e);
  const grab = (name: string) => block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
  const font = (name: string) => grab(name)?.match(/'([^']+)'/)?.[1];
  return {
    accent: grab("accent"),
    accentDark: grab("accent-dark"),
    background: grab("bg"),
    surface: grab("surface"),
    text: grab("text"),
    headingFont: font("font-heading"),
    bodyFont: font("font-body"),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token || token === "null" || token === "undefined") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    const claims = claimsData?.claims as { sub?: string; email?: string } | undefined;

    if (claimsError || !claims?.sub) {
      console.error("Auth error:", claimsError?.message || "Missing token claims");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claims.sub;
    const userEmail = claims.email || "";

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // lunor.ko@gmail.com is the designated admin account; otherwise check user_roles
    const isDesignatedAdmin = userEmail === "lunor.ko@gmail.com";
    let hasAdminRole = false;
    if (!isDesignatedAdmin) {
      const { data: roleData } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      hasAdminRole = !!roleData;
    }

    if (!isDesignatedAdmin && !hasAdminRole) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), { status: 403, headers: corsHeaders });
    }

    const url = new URL(req.url);
    let action = (url.searchParams.get("action") || "").trim();

    // Parse body for POST requests first (action can also come from body as fallback)
    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        const raw = await req.text();
        body = raw ? JSON.parse(raw) : {};
        // Action from body as fallback when URL param is missing
        const bodyAction = typeof body.action === "string" ? (body.action as string).trim() : "";
        if (!action && bodyAction) action = bodyAction;
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Handle POST actions first
    if (req.method === "POST") {
      if (action === "approve-payment") {
        const { id } = body;
        const { data: pr, error: prErr } = await adminClient.from("payment_requests").select("*").eq("id", id).single();
        if (prErr || !pr) {
          return new Response(JSON.stringify({ error: "Payment request not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        const { error: subErr } = await adminClient.from("subscriptions").insert({
          user_id: pr.user_id,
          plan_id: pr.plan_id,
          status: "active",
          amount: pr.amount,
          domain_id: pr.domain_id,
          expires_at: expiresAt.toISOString(),
        });
        if (subErr) {
          return new Response(JSON.stringify({ error: subErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        await adminClient.from("payment_requests").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", id);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "reject-payment") {
        const { id, admin_notes } = body;
        await adminClient.from("payment_requests").update({ status: "rejected", admin_notes: admin_notes || null, reviewed_at: new Date().toISOString() }).eq("id", id);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "add-resource") {
        const { id: _id, action: _a, ...rest } = body as Record<string, unknown>;
        const insertData = {
          domain_id: rest.domain_id,
          title: rest.title,
          resource_type: rest.resource_type || "video",
          source: rest.source || "Custom",
          url: rest.url,
          duration: rest.duration ?? null,
          thumbnail: rest.thumbnail ?? null,
          description: rest.description ?? null,
          sort_order: Number(rest.sort_order) || 0,
          is_active: rest.is_active !== false,
        };
        const { error } = await adminClient.from("admin_resources").insert(insertData);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "update-resource") {
        const { id, action: _act, ...updates } = body as Record<string, unknown>;
        const cleanUpdates: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) {
          if (["domain_id","title","resource_type","source","url","duration","thumbnail","description","sort_order","is_active"].includes(k)) {
            cleanUpdates[k] = v;
          }
        }
        const { error } = await adminClient.from("admin_resources").update(cleanUpdates).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "delete-resource") {
        const { error } = await adminClient.from("admin_resources").delete().eq("id", (body as { id: string }).id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "add-pop-ad") {
        const { id: _id, action: _a, ...rest } = body as Record<string, unknown>;
        const { error } = await adminClient.from("pop_ads").insert({ ...rest });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "update-pop-ad") {
        const { id, action: _act, ...updates } = body as Record<string, unknown>;
        const { error } = await adminClient.from("pop_ads").update(updates).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "delete-pop-ad") {
        const { error } = await adminClient.from("pop_ads").delete().eq("id", (body as { id: string }).id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "remove-community-post") {
        const { id, reason } = body as { id: string; reason?: string };
        const { error } = await adminClient.from("community_posts").update({
          is_removed: true,
          removed_at: new Date().toISOString(),
          removed_by: userId,
          removal_reason: reason || "Violation of community guidelines",
        }).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "restore-community-post") {
        const { id } = body as { id: string };
        const { error } = await adminClient.from("community_posts").update({
          is_removed: false,
          removed_at: null,
          removed_by: null,
          removal_reason: null,
        }).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "add-guideline") {
        const { id: _id, action: _a, ...rest } = body as Record<string, unknown>;
        const { error } = await adminClient.from("community_guidelines").insert({ ...rest, updated_at: new Date().toISOString() });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "update-guideline") {
        const { id, ...updates } = body as Record<string, unknown>;
        const { error } = await adminClient.from("community_guidelines").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "delete-guideline") {
        const { error } = await adminClient.from("community_guidelines").delete().eq("id", (body as { id: string }).id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "set-user-role") {
        const { user_id, role } = body as { user_id: string; role: string };
        await adminClient.from("user_roles").delete().eq("user_id", user_id);
        if (role && role !== "user") {
          await adminClient.from("user_roles").insert({ user_id, role });
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "ban-user") {
        const { user_id } = body as { user_id: string };
        await adminClient.auth.admin.updateUserById(user_id, { ban_duration: "876000h" });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "unban-user") {
        const { user_id } = body as { user_id: string };
        await adminClient.auth.admin.updateUserById(user_id, { ban_duration: "none" });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "delete-user") {
        const { user_id } = body as { user_id: string };
        if (!user_id) return new Response(JSON.stringify({ success: false, error: "user_id required" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        try {
          // 1. Clear FK references that block auth user delete
          await adminClient.from("community_posts").update({ removed_by: null }).eq("removed_by", user_id);
          // 2. Delete user data in order
          await adminClient.from("payment_requests").delete().eq("user_id", user_id);
          await adminClient.from("subscriptions").delete().eq("user_id", user_id);
          // 3. Try auth delete
          const { error: delErr } = await adminClient.auth.admin.deleteUser(user_id);
          if (delErr) {
            // Fallback: revoke access (delete subs + ban) if deleteUser fails
            await adminClient.auth.admin.updateUserById(user_id, { ban_duration: "876000h" });
            return new Response(JSON.stringify({
              success: true,
              message: "User access revoked (subscriptions removed, account banned). Full delete failed: " + delErr.message,
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (e: any) {
          console.error("delete-user exception:", e);
          return new Response(JSON.stringify({ success: false, error: String(e?.message || e || "Failed to delete user") }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      return new Response(JSON.stringify({ error: `Unknown POST action: ${action || "(empty)"}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET actions
    if (action === "stats") {
      // Count unique site visitors (by visitor_id)
      const { data: visitorData } = await adminClient.rpc("count_unique_visitors") as any;
      let totalVisitors = 0;
      if (typeof visitorData === "number") {
        totalVisitors = visitorData;
      } else {
        // fallback: count all rows
        const { count } = await adminClient.from("site_visits").select("*", { count: "exact", head: true });
        totalVisitors = count || 0;
      }

      // Registered users (profiles created by trigger on sign-up; includes email + Google)
      const { count: totalUsers } = await adminClient.from("profiles").select("*", { count: "exact", head: true });

      // Paid users: users with active non-free subscriptions
      const { data: paidData } = await adminClient
        .from("subscriptions")
        .select("user_id")
        .eq("status", "active")
        .neq("plan_id", "free");
      const paidUserIds = new Set((paidData || []).map((s: any) => s.user_id));
      const totalPaidUsers = paidUserIds.size;

      const { data: revenueData } = await adminClient.from("subscriptions").select("amount").eq("status", "active");
      const totalRevenue = (revenueData || []).reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
      const { count: totalBookings } = await adminClient.from("bookings").select("*", { count: "exact", head: true });

      return new Response(JSON.stringify({
        totalVisitors: totalVisitors,
        totalUsers: totalUsers || 0,
        totalPaidUsers: totalPaidUsers,
        totalRevenue: totalRevenue / 100,
        totalBookings: totalBookings || 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "visitor-trends") {
      // Get daily visitor counts for the last 30 days
      const { data, error } = await adminClient.rpc("get_visitor_trends") as any;
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
      }
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "users") {
      // Primary source: ALL auth users (email + Google sign-in)
      const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const authList = authUsers || [];

      // Profiles (display_name, avatar_url)
      const { data: profiles } = await adminClient.from("profiles").select("user_id, display_name, avatar_url, created_at");
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });

      // Subscriptions
      const { data: subs } = await adminClient.from("subscriptions").select("*");
      const subMap: Record<string, any[]> = {};
      (subs || []).forEach((s: any) => {
        if (!subMap[s.user_id]) subMap[s.user_id] = [];
        subMap[s.user_id].push(s);
      });

      // User roles
      const { data: roles } = await adminClient.from("user_roles").select("*");
      const roleMap: Record<string, string[]> = {};
      (roles || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });

      const enriched = authList.map((au: any) => {
        const profile = profileMap[au.id];
        const provider = au.app_metadata?.provider || au.identities?.[0]?.provider || "email";
        return {
          id: profile?.id || au.id,
          user_id: au.id,
          banned_until: au.banned_until || null,
          display_name: profile?.display_name || au.user_metadata?.full_name || au.user_metadata?.name || au.user_metadata?.display_name || au.email?.split("@")[0] || "Unnamed",
          avatar_url: profile?.avatar_url || au.user_metadata?.picture || au.user_metadata?.avatar_url,
          email: au.email || au.user_metadata?.email || "",
          last_sign_in_at: au.last_sign_in_at || null,
          auth_created_at: au.created_at,
          created_at: profile?.created_at || au.created_at,
          provider,
          subscriptions: subMap[au.id] || [],
          active_subscription: (subMap[au.id] || []).find((s: any) => s.status === "active") || null,
          roles: roleMap[au.id] || ["user"],
        };
      });

      // Sort by created_at descending
      enriched.sort((a: any, b: any) => new Date(b.auth_created_at).getTime() - new Date(a.auth_created_at).getTime());

      return new Response(JSON.stringify(enriched.slice(0, 100)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "subscriptions") {
      const { data } = await adminClient.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(100);
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "payment-requests") {
      const { data } = await adminClient.from("payment_requests").select("*").order("created_at", { ascending: false }).limit(200);
      // Enrich with user emails
      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      const emailMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        (authUsers || []).forEach((au: any) => { emailMap[au.id] = au.email || ""; });
      }
      const enriched = (data || []).map((r: any) => ({ ...r, email: emailMap[r.user_id] || "" }));
      return new Response(JSON.stringify(enriched), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "resources") {
      try {
        const { data, error } = await adminClient.from("admin_resources").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
        if (error) return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (action === "pop-ads") {
      try {
        const { data, error } = await adminClient.from("pop_ads").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
        if (error) return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (action === "community-posts") {
      const { data: posts } = await adminClient.from("community_posts").select("*").order("created_at", { ascending: false }).limit(200);
      const userIds = [...new Set((posts || []).map((p: any) => p.user_id))];
      const { data: profiles } = await adminClient.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });
      const enriched = (posts || []).map((p: any) => ({ ...p, author: profileMap[p.user_id] }));
      return new Response(JSON.stringify(enriched), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "feedback") {
      const { data, error } = await adminClient.from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "community-guidelines") {
      try {
        const { data, error } = await adminClient.from("community_guidelines").select("*").order("sort_order", { ascending: true });
        if (error) {
          console.error("community_guidelines error:", error.message);
          return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        console.error("community_guidelines:", e);
        return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (action === "generated-sites") {
      const { data: projects } = await adminClient
        .from("runtime_projects")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(300);
      const list = projects || [];
      const { data: tables } = await adminClient.from("runtime_tables").select("project_id, collection");
      const { data: rtUsers } = await adminClient.from("runtime_users").select("project_id");
      const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const emailMap: Record<string, string> = {};
      (authUsers || []).forEach((au: any) => { emailMap[au.id] = au.email || ""; });
      const tableMap: Record<string, string[]> = {};
      (tables || []).forEach((t: any) => {
        if (!tableMap[t.project_id]) tableMap[t.project_id] = [];
        tableMap[t.project_id].push(t.collection);
      });
      const userCount: Record<string, number> = {};
      (rtUsers || []).forEach((u: any) => { userCount[u.project_id] = (userCount[u.project_id] || 0) + 1; });
      const enriched = list.map((p: any) => {
        const collections = tableMap[p.id] || [];
        const status = p.schema_name ? "live" : collections.length > 0 ? "provisioned" : "pending";
        return {
          id: p.id,
          name: p.name,
          scope: p.scope,
          scope_key: p.scope_key,
          schema_name: p.schema_name,
          owner_email: emailMap[p.owner_id] || "",
          collections,
          table_count: collections.length,
          app_users: userCount[p.id] || 0,
          created_at: p.created_at,
          updated_at: p.updated_at,
          status,
        };
      });
      return new Response(JSON.stringify(enriched), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- Load one generated site's files (admin, any owner) ---
    if (action === "site-files") {
      const body = await req.json().catch(() => ({}));
      const projectId = body?.projectId as string | undefined;
      if (!projectId) return jsonRes({ error: "projectId is required" }, 400);
      const { data: p } = await adminClient
        .from("runtime_projects")
        .select("id, name, owner_id, scope_key")
        .eq("id", projectId)
        .maybeSingle();
      if (!p) return jsonRes({ error: "Site not found" }, 404);
      const { data: hist } = await adminClient
        .from("workspace_history")
        .select("client_id, project_name, files, prompt, created_at")
        .eq("user_id", p.owner_id)
        .eq("domain", p.scope_key)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return jsonRes({
        id: p.id,
        name: p.name,
        clientId: hist?.client_id ?? null,
        projectName: hist?.project_name ?? p.name,
        prompt: hist?.prompt ?? "",
        files: Array.isArray(hist?.files) ? hist!.files : [],
        theme: readTheme(hist?.files),
      });
    }

    // --- Save name / theme / page content back onto the site ---
    if (action === "site-update") {
      const body = await req.json().catch(() => ({}));
      const { projectId, name, clientId, files, theme } = body || {};
      if (!projectId) return jsonRes({ error: "projectId is required" }, 400);
      const { data: p } = await adminClient
        .from("runtime_projects")
        .select("id, owner_id, scope_key")
        .eq("id", projectId)
        .maybeSingle();
      if (!p) return jsonRes({ error: "Site not found" }, 404);

      let next: SiteFile[] = Array.isArray(files) ? files : [];
      if (theme && next.length) next = applyTheme(next, theme as SiteTheme);

      if (typeof name === "string" && name.trim()) {
        await adminClient.from("runtime_projects").update({ name: name.trim() }).eq("id", p.id);
      }
      if (clientId && next.length) {
        const patch: Record<string, unknown> = { files: next };
        if (typeof name === "string" && name.trim()) patch.project_name = name.trim();
        const { error: upErr } = await adminClient
          .from("workspace_history")
          .update(patch)
          .eq("user_id", p.owner_id)
          .eq("client_id", clientId);
        if (upErr) return jsonRes({ error: upErr.message }, 500);
      }
      return jsonRes({ success: true, files: next });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action || "(empty)"}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Admin error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
