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

    const body = await req.json().catch(() => ({}));
    const { plan_id, amount, domain_id, hackathon_project_id } = body as {
      plan_id?: string;
      amount?: number;
      domain_id?: string;
      hackathon_project_id?: string;
    };

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Razorpay not configured" }), { status: 500, headers: corsHeaders });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let orderAmount: number;
    let receipt: string;
    let notes: Record<string, string>;

    if (hackathon_project_id) {
      const { data: proj, error: pErr } = await adminClient
        .from("hackathon_projects")
        .select("id, price_paise, is_active, title")
        .eq("id", hackathon_project_id)
        .maybeSingle();

      if (pErr || !proj) {
        return new Response(JSON.stringify({ error: "Project not found" }), { status: 404, headers: corsHeaders });
      }
      if (!proj.is_active) {
        return new Response(JSON.stringify({ error: "This project is not available for purchase" }), { status: 400, headers: corsHeaders });
      }

      const { data: existing } = await adminClient
        .from("hackathon_purchases")
        .select("id")
        .eq("user_id", userId)
        .eq("project_id", hackathon_project_id)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: "You already own this project" }), { status: 400, headers: corsHeaders });
      }

      orderAmount = proj.price_paise;
      receipt = `h_${userId.slice(0, 8)}_${Date.now()}`;
      notes = {
        purchase_type: "hackathon_project",
        hackathon_project_id: proj.id,
        user_id: userId,
        title: (proj.title || "Hackathon project").slice(0, 200),
      };
    } else {
      if (!plan_id || amount == null || !domain_id) {
        return new Response(JSON.stringify({ error: "Missing plan_id, amount, or domain_id" }), { status: 400, headers: corsHeaders });
      }
      orderAmount = amount;
      receipt = `s_${userId.slice(0, 8)}_${Date.now()}`;
      notes = { plan_id, user_id: userId, domain_id, purchase_type: "subscription" };
    }

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: orderAmount,
        currency: "INR",
        receipt,
        notes,
      }),
    });

    if (!orderResponse.ok) {
      const errBody = await orderResponse.text();
      console.error("Razorpay order error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500, headers: corsHeaders });
    }

    const order = await orderResponse.json();

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: RAZORPAY_KEY_ID,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
