import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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
    const plan_id = notes.plan_id;
    const domain_id = notes.domain_id;
    const amount = order.amount; // in paise, from Razorpay

    if (!plan_id || !domain_id) {
      return new Response(JSON.stringify({ error: "Order missing plan or domain" }), { status: 400, headers: corsHeaders });
    }
    if (notes.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Order does not belong to this user" }), { status: 403, headers: corsHeaders });
    }

    // Use service role to insert subscription
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
      return new Response(JSON.stringify({ success: true, plan_id, credits_added: TOPUP_CREDITS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error: insertError } = await adminClient.from("subscriptions").insert({
      user_id: userId,
      plan_id,
      status: "active",
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      domain_id,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save subscription" }), { status: 500, headers: corsHeaders });
    }

    // Refresh plan credits for the new plan
    await adminClient.rpc("sync_ai_credits", { _user_id: userId });

    return new Response(JSON.stringify({ success: true, plan_id, domain_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders });
  }
});
