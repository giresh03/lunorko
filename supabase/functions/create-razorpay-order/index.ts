import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getPurchasePrice } from "../_shared/subscriptionPricing.ts";

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

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: corsHeaders });
    }
    const { plan_id, domain_id, coupon_code, project_id } = body;
    const purchase_type: "subscription" | "hackathon_project" =
      body.purchase_type === "hackathon_project" ? "hackathon_project" : "subscription";

    // Subscription prices are computed server-side; the client-sent amount is never trusted.
    let pricing: { amount: number; couponCode: string } = { amount: 0, couponCode: "" };
    if (purchase_type === "subscription") {
      try { pricing = getPurchasePrice(plan_id, coupon_code); } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid purchase" }), { status: 400, headers: corsHeaders });
      }
      if (plan_id !== "topup" && (!domain_id || typeof domain_id !== "string" || domain_id.length > 100)) {
        return new Response(JSON.stringify({ error: "Missing domain_id" }), { status: 400, headers: corsHeaders });
      }
    } else if (typeof project_id !== "string" || !project_id || project_id.length > 100) {
      return new Response(JSON.stringify({ error: "Missing project_id for hackathon project purchase" }), { status: 400, headers: corsHeaders });
    }
    const couponCode = pricing.couponCode;

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Razorpay not configured" }), { status: 500, headers: corsHeaders });
    }

    let resolvedAmount = pricing.amount;
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
      notes = {
        purchase_type: "subscription",
        plan_id,
        domain_id: plan_id === "topup" ? "all" : domain_id,
        user_id: userId,
        coupon_code: couponCode,
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

    // Record the order so payments are auditable and metrics have a revenue source
    try {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { error: recordError } = await adminClient.from("payment_orders").insert({
        user_id: userId,
        plan_id: purchase_type === "hackathon_project" ? "hackathon_project" : plan_id,
        amount_cents: order.amount,
        currency: order.currency ?? "INR",
        razorpay_order_id: order.id,
        status: "created",
        kind: purchase_type === "hackathon_project" ? "hackathon_project" : plan_id === "topup" ? "topup" : "subscription",
        coupon_code: couponCode || null,
      });
      if (recordError) throw recordError;
    } catch (recordErr) {
      console.error("payment_orders insert failed:", recordErr);
      return new Response(JSON.stringify({ error: "Unable to record payment order. Please try again." }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ order_id: order.id, amount: order.amount, currency: order.currency, key_id: RAZORPAY_KEY_ID }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
