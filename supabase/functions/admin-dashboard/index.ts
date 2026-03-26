import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Use service role client for everything - it can verify any token
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the user's token using the admin client
    const { data: { user: authUser }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !authUser) {
      console.error("Auth error:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = authUser.id;
    const userEmail = authUser.email || "";

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
        const { error } = await adminClient.from("pop_ads").insert({ ...rest, updated_at: new Date().toISOString() });
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "update-pop-ad") {
        const { id, ...updates } = body as Record<string, unknown>;
        const { error } = await adminClient.from("pop_ads").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
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

    return new Response(JSON.stringify({ error: `Unknown action: ${action || "(empty)"}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Admin error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
