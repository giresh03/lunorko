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

    // Check admin role
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), { status: 403, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "stats") {
      const { count: totalUsers } = await adminClient.from("profiles").select("*", { count: "exact", head: true });
      const { count: totalSubscribers } = await adminClient.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
      const { data: revenueData } = await adminClient.from("subscriptions").select("amount").eq("status", "active");
      const totalRevenue = (revenueData || []).reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
      const { count: totalMentors } = await adminClient.from("mentors").select("*", { count: "exact", head: true });
      const { count: totalBookings } = await adminClient.from("bookings").select("*", { count: "exact", head: true });

      return new Response(JSON.stringify({
        totalUsers: totalUsers || 0,
        totalSubscribers: totalSubscribers || 0,
        totalRevenue: totalRevenue / 100,
        totalMentors: totalMentors || 0,
        totalBookings: totalBookings || 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "users") {
      const { data: users } = await adminClient.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
      // Get subscriptions for each user
      const { data: subs } = await adminClient.from("subscriptions").select("*");
      const subMap: Record<string, any[]> = {};
      (subs || []).forEach((s: any) => { 
        if (!subMap[s.user_id]) subMap[s.user_id] = [];
        subMap[s.user_id].push(s); 
      });

      // Get emails from auth
      const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const emailMap: Record<string, { email: string; last_sign_in_at: string | null; created_at: string }> = {};
      (authUsers || []).forEach((au: any) => { 
        emailMap[au.id] = { email: au.email || "", last_sign_in_at: au.last_sign_in_at, created_at: au.created_at }; 
      });

      // Get user roles
      const { data: roles } = await adminClient.from("user_roles").select("*");
      const roleMap: Record<string, string[]> = {};
      (roles || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });

      const enriched = (users || []).map((u: any) => ({
        ...u,
        email: emailMap[u.user_id]?.email || "",
        last_sign_in_at: emailMap[u.user_id]?.last_sign_in_at || null,
        auth_created_at: emailMap[u.user_id]?.created_at || u.created_at,
        subscriptions: subMap[u.user_id] || [],
        active_subscription: (subMap[u.user_id] || []).find((s: any) => s.status === "active") || null,
        roles: roleMap[u.user_id] || ["user"],
      }));

      return new Response(JSON.stringify(enriched), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "subscriptions") {
      const { data } = await adminClient.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(100);
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "mentors") {
      const { data } = await adminClient.from("mentors").select("*").order("created_at", { ascending: false });
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // POST actions for managing data
    if (req.method === "POST") {
      const body = await req.json();

      if (action === "add-mentor") {
        const { error } = await adminClient.from("mentors").insert(body);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "update-mentor") {
        const { id, ...updates } = body;
        const { error } = await adminClient.from("mentors").update(updates).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "delete-mentor") {
        const { error } = await adminClient.from("mentors").delete().eq("id", body.id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    console.error("Admin error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
