import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const IMAGE_MODEL = "google/gemini-3-pro-image";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY is not configured" }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Please sign in to use the AI Studio." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: claimsData, error: claimsError } = await anon.auth.getClaims(token);
    const userId = claimsData?.claims?.sub as string | undefined;
    if (claimsError || !userId) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const mode: string = body.mode === "edit" ? "edit" : "generate";
    const prompt: string = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const stream: boolean = body.stream !== false;
    const imageBase64: string | undefined =
      typeof body.imageBase64 === "string" ? body.imageBase64 : undefined;
    const mimeType: string = typeof body.mimeType === "string" ? body.mimeType : "image/png";

    if (prompt.length < 3) return json({ error: "Please describe what you want to create." }, 400);
    if (mode === "edit" && !imageBase64) return json({ error: "An image is required to edit." }, 400);

    // Credit guard (service role) — 1 credit per image generation or edit
    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: creditRow } = await service
      .from("ai_credits")
      .select("plan_credits, topup_credits")
      .eq("user_id", userId)
      .maybeSingle();
    const planCredits = creditRow?.plan_credits ?? 0;
    const topupCredits = creditRow?.topup_credits ?? 0;
    if (planCredits + topupCredits < 1) {
      return json(
        { error: "You are out of AI credits. Top up from the Pricing page to keep creating." },
        402,
      );
    }

    const content: unknown[] = [{ type: "text", text: prompt }];
    if (mode === "edit" && imageBase64) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${imageBase64}` },
      });
    }

    const gatewayRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
        ...(stream ? { stream: true } : {}),
      }),
    });

    if (!gatewayRes.ok) {
      const detail = await gatewayRes.text().catch(() => "");
      let message = "Image generation failed.";
      try {
        const parsed = JSON.parse(detail);
        message = parsed?.error?.message ?? parsed?.message ?? message;
      } catch {
        if (detail) message = detail.slice(0, 400);
      }
      return json({ error: message }, gatewayRes.status);
    }

    // Deduct one credit (plan credits first, then top-ups)
    const fromPlan = planCredits > 0 ? 1 : 0;
    await service
      .from("ai_credits")
      .update({
        plan_credits: planCredits - fromPlan,
        topup_credits: topupCredits - (1 - fromPlan),
      })
      .eq("user_id", userId);
    await service
      .from("ai_credit_usage")
      .insert({ user_id: userId, feature: mode === "edit" ? "studio-edit" : "studio-image", amount: 1 });

    if (stream && gatewayRes.body) {
      return new Response(gatewayRes.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const payload = await gatewayRes.json();
    return json({ b64_json: payload?.data?.[0]?.b64_json ?? null });
  } catch (err) {
    console.error("generate-media error", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
