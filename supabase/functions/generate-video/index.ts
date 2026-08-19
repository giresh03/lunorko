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

const VIDEO_MODEL = "google/veo-3.1-lite";
const VIDEO_CREDITS = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY is not configured" }, 500);

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
    if (!token) return json({ error: "Please sign in to use the AI Studio." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: claimsData, error: claimsError } = await anon.auth.getClaims(token);
    const userId = claimsData?.claims?.sub as string | undefined;
    if (claimsError || !userId) return json({ error: "Unauthorized" }, 401);

    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));
    const action: string = body.action === "status" ? "status" : "create";
    const gatewayAuth = { Authorization: `Bearer ${LOVABLE_API_KEY}` };

    if (action === "create") {
      const prompt: string = typeof body.prompt === "string" ? body.prompt.trim() : "";
      // UI offers 30s / 45s / 1min / 2min. The video model renders clips of 4, 6 or 8 seconds,
      // so we keep the requested length in metadata and render the longest supported clip.
      const requestedSeconds: string = ["30", "45", "60", "120"].includes(String(body.seconds))
        ? String(body.seconds)
        : ["4", "6", "8"].includes(String(body.seconds))
          ? String(body.seconds)
          : "30";
      const seconds: string = ["4", "6", "8"].includes(requestedSeconds) ? requestedSeconds : "8";
      const size: string = body.size === "720x1280" ? "720x1280" : "1280x720";
      if (prompt.length < 3) return json({ error: "Please describe the video you want." }, 400);

      const { data: creditRow } = await service
        .from("ai_credits")
        .select("plan_credits, topup_credits")
        .eq("user_id", userId)
        .maybeSingle();
      const planCredits = creditRow?.plan_credits ?? 0;
      const topupCredits = creditRow?.topup_credits ?? 0;
      if (planCredits + topupCredits < VIDEO_CREDITS) {
        return json(
          { error: `Video generation needs ${VIDEO_CREDITS} credits. Top up from the Pricing page.` },
          402,
        );
      }

      const createRes = await fetch("https://ai.gateway.lovable.dev/v1/videos", {
        method: "POST",
        headers: { ...gatewayAuth, "Content-Type": "application/json" },
        body: JSON.stringify({ model: VIDEO_MODEL, prompt, seconds, size }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => null);
        return json({ error: err?.message ?? "Video generation failed." }, createRes.status);
      }
      const job = await createRes.json();

      const fromPlan = Math.min(planCredits, VIDEO_CREDITS);
      await service
        .from("ai_credits")
        .update({
          plan_credits: planCredits - fromPlan,
          topup_credits: topupCredits - (VIDEO_CREDITS - fromPlan),
        })
        .eq("user_id", userId);
      await service
        .from("ai_credit_usage")
        .insert({ user_id: userId, feature: "studio-video", amount: VIDEO_CREDITS });

      const { data: row } = await service
        .from("media_generations")
        .insert({
          user_id: userId,
          kind: "video",
          prompt,
          status: "in_progress",
          meta: { job_id: job.id, seconds, requested_seconds: requestedSeconds, size, model: VIDEO_MODEL },
        })
        .select("id")
        .maybeSingle();

      return json({ jobId: job.id, recordId: row?.id ?? null, status: job.status ?? "in_progress" });
    }

    // action === "status"
    const jobId: string = typeof body.jobId === "string" ? body.jobId : "";
    const recordId: string | null = typeof body.recordId === "string" ? body.recordId : null;
    if (!jobId) return json({ error: "Missing job id." }, 400);

    const jobRes = await fetch(`https://ai.gateway.lovable.dev/v1/videos/${jobId}`, {
      headers: gatewayAuth,
    });
    if (!jobRes.ok) {
      const err = await jobRes.json().catch(() => null);
      return json({ error: err?.message ?? "Could not check the video status." }, jobRes.status);
    }
    const job = await jobRes.json();

    if (job.status === "failed") {
      if (recordId) {
        await service
          .from("media_generations")
          .update({ status: "failed", meta: { job_id: jobId, error: job.error ?? null } })
          .eq("id", recordId)
          .eq("user_id", userId);
      }
      return json({ status: "failed", error: job.error?.message ?? "The video was rejected." });
    }

    if (job.status !== "completed") {
      return json({ status: job.status ?? "in_progress", progress: job.progress ?? 0 });
    }

    const path = `${userId}/videos/${jobId}.mp4`;
    const { data: existing } = await service.storage
      .from("generated-media")
      .list(`${userId}/videos`, { search: `${jobId}.mp4` });

    if (!existing || existing.length === 0) {
      const contentRes = await fetch(`https://ai.gateway.lovable.dev/v1/videos/${jobId}/content`, {
        headers: gatewayAuth,
      });
      if (!contentRes.ok) return json({ error: "Could not download the finished video." }, 502);
      const mp4 = await contentRes.arrayBuffer();
      const { error: uploadError } = await service.storage
        .from("generated-media")
        .upload(path, mp4, { contentType: "video/mp4", upsert: true });
      if (uploadError) return json({ error: uploadError.message }, 500);
    }

    const { data: signed } = await service.storage
      .from("generated-media")
      .createSignedUrl(path, 60 * 60 * 6);

    if (recordId) {
      await service
        .from("media_generations")
        .update({ status: "completed", asset_path: path })
        .eq("id", recordId)
        .eq("user_id", userId);
    }

    return json({ status: "completed", url: signed?.signedUrl ?? null, path });
  } catch (err) {
    console.error("generate-video error", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
