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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = authUser.id;

    const payload = await req.json();
    const {
      plan_id,
      amount,
      domain_id,
      purchase_type = "subscription",
      project_id,
    } = payload as {
      plan_id?: string;
      amount?: number;
      domain_id?: string;
      purchase_type?: "subscription" | "hackathon_project";
      project_id?: string;
    };

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Razorpay not configured" }), { status: 500, headers: corsHeaders });
    }

    let resolvedAmount = amount;
    let notes: Record<string, string> = { user_id: userId };

    if (purchase_type === "hackathon_project") {
      if (!project_id) {
        return new Response(JSON.stringify({ error: "Missing project_id for hackathon project purchase" }), { status: 400, headers: corsHeaders });
      }

      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: project, error: projectError } = await adminClient
        .from("hackathon_projects")
        .select("id, title, price, is_active, max_buyers, buyers_count")
        .eq("id", project_id)
        .maybeSingle();

      if (projectError || !project || !project.is_active) {
        return new Response(JSON.stringify({ error: "Project not found or inactive" }), { status: 404, headers: corsHeaders });
      }
      if ((project.max_buyers || 0) > 0 && (project.buyers_count || 0) >= (project.max_buyers || 0)) {
        return new Response(JSON.stringify({ error: "Project purchase limit reached" }), { status: 400, headers: corsHeaders });
      }

      resolvedAmount = project.price;
      notes = {
        purchase_type: "hackathon_project",
        project_id: project.id,
        project_title: project.title || "Hackathon Project",
        user_id: userId,
      };
    } else {
      if (!plan_id || !resolvedAmount || !domain_id) {
        return new Response(JSON.stringify({ error: "Missing plan_id, amount, or domain_id" }), { status: 400, headers: corsHeaders });
      }
      notes = {
        purchase_type: "subscription",
        plan_id,
        domain_id,
        user_id: userId,
      };
    }

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: resolvedAmount,
        currency: "INR",
        receipt: `${purchase_type === "hackathon_project" ? "hp" : "s"}_${userId.slice(0, 8)}_${Date.now()}`,
        notes,
      }),
    });

    if (!orderResponse.ok) {
      const errBody = await orderResponse.text();
      console.error("Razorpay order error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500, headers: corsHeaders });
    }

    const order = await orderResponse.json();

    return new Response(JSON.stringify({ order_id: order.id, amount: order.amount, currency: order.currency, key_id: RAZORPAY_KEY_ID }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
