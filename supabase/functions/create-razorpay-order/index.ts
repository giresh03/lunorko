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

    const { plan_id, domain_id } = await req.json();

    // Server-side price table (never trust client amounts)
    const PRICES: Record<string, number> = {
      pro: 15000,
      premium: 25000,
      professional: 50000,
      topup: 5000,
    };

    if (!plan_id || typeof plan_id !== "string" || !(plan_id in PRICES)) {
      return new Response(JSON.stringify({ error: "Invalid plan_id" }), { status: 400, headers: corsHeaders });
    }
    if (plan_id !== "topup" && (!domain_id || typeof domain_id !== "string")) {
      return new Response(JSON.stringify({ error: "Missing domain_id" }), { status: 400, headers: corsHeaders });
    }
    const amount = PRICES[plan_id];

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Razorpay not configured" }), { status: 500, headers: corsHeaders });
    }

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: amount,
        currency: "INR",
        receipt: `s_${userId.slice(0, 8)}_${Date.now()}`,
        notes: { plan_id, user_id: userId, domain_id: plan_id === "topup" ? "all" : domain_id },
      }),
    });

    if (!orderResponse.ok) {
      const errBody = await orderResponse.text();
      console.error("Razorpay order error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500, headers: corsHeaders });
    }

    const order = await orderResponse.json();

    // Record the order so payments are auditable and metrics have a revenue source
    try {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await adminClient.from("payment_orders").insert({
        user_id: userId,
        plan_id,
        amount_cents: order.amount,
        currency: order.currency ?? "INR",
        razorpay_order_id: order.id,
        status: "created",
        kind: plan_id === "topup" ? "topup" : "subscription",
      });
    } catch (recordErr) {
      console.error("payment_orders insert failed:", recordErr);
    }

    return new Response(JSON.stringify({ order_id: order.id, amount: order.amount, currency: order.currency, key_id: RAZORPAY_KEY_ID }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
