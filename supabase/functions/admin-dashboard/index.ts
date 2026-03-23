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
          updated_at: new Date().toISOString(),
        };
        const { error } = await adminClient.from("admin_resources").insert(insertData);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "update-resource") {
        const { id, ...updates } = body as Record<string, unknown>;
        const { error } = await adminClient.from("admin_resources").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
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

      if (action === "add-hackathon") {
        const { id: _i, action: _a, ...rest } = body as Record<string, unknown>;
        const insertData = {
          title: rest.title,
          description: rest.description ?? null,
          location_label: rest.location_label ?? null,
          is_online: rest.is_online === true,
          start_date: rest.start_date ? String(rest.start_date) : null,
          end_date: rest.end_date ? String(rest.end_date) : null,
          registration_url: rest.registration_url ?? null,
          website_url: rest.website_url ?? null,
          banner_image_url: rest.banner_image_url ?? null,
          sort_order: Number(rest.sort_order) || 0,
          is_active: rest.is_active !== false,
          updated_at: new Date().toISOString(),
        };
        const { error } = await adminClient.from("hackathons").insert(insertData);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "update-hackathon") {
        const { id, action: _a, ...updates } = body as Record<string, unknown>;
        const { error } = await adminClient.from("hackathons").update({
          ...updates,
          updated_at: new Date().toISOString(),
        }).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "delete-hackathon") {
        const id = (body as { id: string }).id;
        await adminClient.from("hackathon_projects").update({ hackathon_id: null }).eq("hackathon_id", id);
        const { error } = await adminClient.from("hackathons").delete().eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "add-hackathon-project") {
        const { id: _i, action: _a, deliverable_url, access_instructions, hackathon_id, ...proj } = body as Record<string, unknown>;
        const hid = hackathon_id && String(hackathon_id).trim() ? hackathon_id : null;
        const insertProject = {
          hackathon_id: hid,
          title: proj.title,
          description: proj.description ?? null,
          team_winner_name: proj.team_winner_name ?? null,
          price_paise: Math.round(Number(proj.price_paise) || 0),
          preview_image_url: proj.preview_image_url ?? null,
          tech_stack: proj.tech_stack ?? null,
          sort_order: Number(proj.sort_order) || 0,
          is_active: proj.is_active !== false,
          updated_at: new Date().toISOString(),
        };
        if (!insertProject.title || insertProject.price_paise <= 0) {
          return new Response(JSON.stringify({ error: "title and positive price_paise required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const { data: row, error } = await adminClient.from("hackathon_projects").insert(insertProject).select("id").single();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const pid = row?.id;
        if (pid && (deliverable_url || access_instructions)) {
          await adminClient.from("hackathon_project_deliverables").upsert({
            project_id: pid,
            deliverable_url: deliverable_url ? String(deliverable_url) : null,
            access_instructions: access_instructions ? String(access_instructions) : null,
            updated_at: new Date().toISOString(),
          });
        }
        return new Response(JSON.stringify({ success: true, id: pid }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "update-hackathon-project") {
        const { id, action: _a, deliverable_url, access_instructions, hackathon_id, ...proj } = body as Record<string, unknown>;
        const hid = hackathon_id !== undefined
          ? (hackathon_id && String(hackathon_id).trim() ? hackathon_id : null)
          : undefined;
        const updates: Record<string, unknown> = {
          ...proj,
          updated_at: new Date().toISOString(),
        };
        if (proj.price_paise !== undefined) updates.price_paise = Math.round(Number(proj.price_paise) || 0);
        if (proj.sort_order !== undefined) updates.sort_order = Number(proj.sort_order) || 0;
        if (hid !== undefined) updates.hackathon_id = hid;
        delete updates.deliverable_url;
        delete updates.access_instructions;
        delete updates.hackathons;
        delete updates.action;
        delete updates.id;
        const { error } = await adminClient.from("hackathon_projects").update(updates).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (deliverable_url !== undefined || access_instructions !== undefined) {
          await adminClient.from("hackathon_project_deliverables").upsert({
            project_id: id as string,
            deliverable_url: deliverable_url != null ? String(deliverable_url) : null,
            access_instructions: access_instructions != null ? String(access_instructions) : null,
            updated_at: new Date().toISOString(),
          });
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (action === "delete-hackathon-project") {
        const id = (body as { id: string }).id;
        const { count } = await adminClient.from("hackathon_purchases").select("*", { count: "exact", head: true }).eq("project_id", id);
        if (count && count > 0) {
          return new Response(JSON.stringify({ error: "Cannot delete: purchases exist. Set is_active to false instead." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        await adminClient.from("hackathon_project_deliverables").delete().eq("project_id", id);
        const { error } = await adminClient.from("hackathon_projects").delete().eq("id", id);
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
          await adminClient.from("hackathon_purchases").delete().eq("user_id", user_id);
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

    if (action === "hackathons") {
      const { data, error } = await adminClient.from("hackathons").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
      if (error) return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "hackathon-projects") {
      const { data: projects, error } = await adminClient
        .from("hackathon_projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) return new Response(JSON.stringify([]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data: hackRows } = await adminClient.from("hackathons").select("id, title");
      const hTitle: Record<string, string> = {};
      (hackRows || []).forEach((h: { id: string; title: string }) => { hTitle[h.id] = h.title; });
      const { data: dels } = await adminClient.from("hackathon_project_deliverables").select("project_id, deliverable_url, access_instructions");
      const delMap: Record<string, { deliverable_url: string | null; access_instructions: string | null }> = {};
      (dels || []).forEach((d: { project_id: string; deliverable_url: string | null; access_instructions: string | null }) => {
        delMap[d.project_id] = { deliverable_url: d.deliverable_url, access_instructions: d.access_instructions };
      });
      const enriched = (projects || []).map((p: { id: string; hackathon_id: string | null }) => ({
        ...p,
        hackathons: p.hackathon_id && hTitle[p.hackathon_id] ? { id: p.hackathon_id, title: hTitle[p.hackathon_id] } : null,
        deliverable_url: delMap[p.id]?.deliverable_url ?? "",
        access_instructions: delMap[p.id]?.access_instructions ?? "",
      }));
      return new Response(JSON.stringify(enriched), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "hackathon-purchases") {
      const { data: purchases } = await adminClient.from("hackathon_purchases").select("*").order("created_at", { ascending: false }).limit(500);
      const pList = purchases || [];
      const projectIds = [...new Set(pList.map((p: { project_id: string }) => p.project_id))];
      const userIds = [...new Set(pList.map((p: { user_id: string }) => p.user_id))];
      const projMap: Record<string, string> = {};
      if (projectIds.length) {
        const { data: pr } = await adminClient.from("hackathon_projects").select("id, title").in("id", projectIds);
        (pr || []).forEach((x: { id: string; title: string }) => { projMap[x.id] = x.title; });
      }
      const emailMap: Record<string, string> = {};
      if (userIds.length) {
        const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        (authUsers || []).forEach((au: { id: string; email?: string }) => { emailMap[au.id] = au.email || ""; });
      }
      const enriched = pList.map((p: { project_id: string; user_id: string }) => ({
        ...p,
        project_title: projMap[p.project_id] || "—",
        email: emailMap[p.user_id] || "—",
      }));
      return new Response(JSON.stringify(enriched), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "hackathon-project-stats") {
      const { data: projects } = await adminClient.from("hackathon_projects").select("id, title, price_paise, is_active");
      const stats: { project_id: string; title: string; price_paise: number; is_active: boolean; purchase_count: number; revenue_paise: number }[] = [];
      for (const pr of projects || []) {
        const { data: buys } = await adminClient.from("hackathon_purchases").select("amount_paise").eq("project_id", pr.id);
        const purchase_count = (buys || []).length;
        const revenue_paise = (buys || []).reduce((s: number, b: { amount_paise: number }) => s + (b.amount_paise || 0), 0);
        stats.push({
          project_id: pr.id,
          title: pr.title,
          price_paise: pr.price_paise,
          is_active: pr.is_active,
          purchase_count,
          revenue_paise,
        });
      }
      return new Response(JSON.stringify(stats), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action || "(empty)"}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Admin error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
