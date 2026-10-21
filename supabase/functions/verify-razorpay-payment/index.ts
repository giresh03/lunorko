import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getPurchasePrice, matchesCapturedPayment } from "../_shared/subscriptionPricing.ts";

async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return hex === signature;
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (typeof razorpay_order_id !== "string" || !/^order_[A-Za-z0-9]{1,64}$/.test(razorpay_order_id) ||
        typeof razorpay_payment_id !== "string" || !/^pay_[A-Za-z0-9]{1,64}$/.test(razorpay_payment_id) ||
        typeof razorpay_signature !== "string" || !/^[a-f0-9]{64}$/.test(razorpay_signature)) {
      return new Response(JSON.stringify({ error: "Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature" }), { status: 400, headers: corsHeaders });
    }

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET || !RAZORPAY_KEY_ID) {
      return new Response(JSON.stringify({ error: "Razorpay not configured" }), { status: 500, headers: corsHeaders });
    }

    const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, RAZORPAY_KEY_SECRET);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), { status: 400, headers: corsHeaders });
    }

    // Fetch order from Razorpay to validate plan_id, amount, domain_id (never trust client)
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: {
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
    });
    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error("Razorpay order fetch error:", errText);
      return new Response(JSON.stringify({ error: "Invalid order" }), { status: 400, headers: corsHeaders });
    }
    const order = await orderRes.json();
    const notes = order.notes || {};
    const purchaseType = notes.purchase_type || "subscription";
    const plan_id = notes.plan_id;
    const domain_id = notes.domain_id;
    const project_id = notes.project_id;
    const amount = order.amount; // in paise, from Razorpay
    let pricing: { amount: number; couponCode: string } | undefined;
    if (purchaseType !== "hackathon_project") {
      try { pricing = getPurchasePrice(plan_id, notes.coupon_code); } catch {
        return new Response(JSON.stringify({ error: "Invalid order pricing" }), { status: 400, headers: corsHeaders });
      }
      if (amount !== pricing.amount || order.currency !== "INR") {
        return new Response(JSON.stringify({ error: "Order amount does not match plan price" }), { status: 400, headers: corsHeaders });
      }
    } else if (order.currency !== "INR") {
      return new Response(JSON.stringify({ error: "Invalid order currency" }), { status: 400, headers: corsHeaders });
    }
    const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`) },
    });
    if (!paymentRes.ok || !matchesCapturedPayment(order, await paymentRes.json())) {
      return new Response(JSON.stringify({ error: "Payment is not captured or does not match the order" }), { status: 400, headers: corsHeaders });
    }

    if (notes.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Order does not belong to this user" }), { status: 403, headers: corsHeaders });
    }

    // Use service role to insert subscription
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: recordedOrder, error: recordedError } = await adminClient.from("payment_orders")
      .select("user_id, plan_id, amount_cents, currency, coupon_code, status")
      .eq("razorpay_order_id", razorpay_order_id).maybeSingle();
    if (recordedError || !recordedOrder || recordedOrder.user_id !== userId || recordedOrder.plan_id !== (purchaseType === "hackathon_project" ? "hackathon_project" : plan_id) ||
        recordedOrder.amount_cents !== amount || recordedOrder.currency !== "INR" ||
        (recordedOrder.coupon_code || "") !== (pricing?.couponCode ?? "")) {
      return new Response(JSON.stringify({ error: "Payment order record does not match" }), { status: 400, headers: corsHeaders });
    }
    if (recordedOrder.status === "paid") {
      return new Response(
        JSON.stringify(purchaseType === "hackathon_project" ? { success: true, purchase_type: "hackathon_project", project_id } : { success: true, plan_id, domain_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (purchaseType === "hackathon_project") {
      if (!project_id) {
        return new Response(JSON.stringify({ error: "Order missing project_id" }), { status: 400, headers: corsHeaders });
      }

      const { data: projectRow, error: projectErr } = await adminClient
        .from("hackathon_projects")
        .select("price")
        .eq("id", project_id)
        .maybeSingle();
      if (projectErr || !projectRow || projectRow.price !== amount) {
        return new Response(JSON.stringify({ error: "Order amount does not match project price" }), { status: 400, headers: corsHeaders });
      }

      const { data: existing } = await adminClient
        .from("hackathon_project_purchases")
        .select("id")
        .eq("project_id", project_id)
        .eq("user_id", userId)
        .maybeSingle();

      if (!existing) {
        const { error: purchaseError } = await adminClient.from("hackathon_project_purchases").insert({
          user_id: userId,
          project_id,
          amount,
          currency: "INR",
          status: "paid",
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        });

        if (purchaseError) {
          console.error("Hackathon project insert error:", purchaseError);
          return new Response(JSON.stringify({ error: "Failed to save project purchase" }), { status: 500, headers: corsHeaders });
        }
      }

      await adminClient
        .from("payment_orders")
        .update({ status: "paid", paid_at: new Date().toISOString(), razorpay_payment_id })
        .eq("razorpay_order_id", razorpay_order_id);

      return new Response(JSON.stringify({ success: true, purchase_type: "hackathon_project", project_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Credit top-up purchase: add credits, no subscription row
    if (plan_id === "topup") {
      const TOPUP_CREDITS = 200;
      if (amount !== 5000) {
        return new Response(JSON.stringify({ error: "Invalid top-up amount" }), { status: 400, headers: corsHeaders });
      }
      const { error: topupError } = await adminClient.rpc("add_topup_credits", {
        _user_id: userId,
        _credits: TOPUP_CREDITS,
      });
      if (topupError) {
        console.error("Top-up error:", topupError);
        return new Response(JSON.stringify({ error: "Failed to add credits" }), { status: 500, headers: corsHeaders });
      }
      await adminClient
        .from("payment_orders")
        .update({ status: "paid", paid_at: new Date().toISOString(), razorpay_payment_id })
        .eq("razorpay_order_id", razorpay_order_id);
      await adminClient.from("analytics_events").insert({
        user_id: userId,
        event: "payment_paid",
        properties: { plan_id, amount, kind: "topup" },
      });
      return new Response(JSON.stringify({ success: true, plan_id, credits_added: TOPUP_CREDITS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Activate the plan atomically: mark order paid, create/extend subscription, grant credits
    const { data: activation, error: activateError } = await adminClient.rpc("activate_subscription", {
      _user_id: userId,
      _plan_id: plan_id,
      _order_id: razorpay_order_id,
      _payment_id: razorpay_payment_id,
      _domain_id: domain_id,
    });

    if (activateError) {
      console.error("Activation error:", activateError);
      return new Response(JSON.stringify({ error: "Failed to activate subscription" }), { status: 500, headers: corsHeaders });
    }

    await adminClient.from("analytics_events").insert({
      user_id: userId,
      event: "payment_paid",
      properties: { plan_id, domain_id, amount, kind: "subscription" },
    });

    return new Response(JSON.stringify({ success: true, plan_id, domain_id, activation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
