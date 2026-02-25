import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { domain_id, topics } = await req.json();

    // Get user's progress for this domain
    const { data: progressData } = await supabase
      .from("domain_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("domain_id", domain_id)
      .maybeSingle();

    const completedTopics = progressData?.completed_topics || [];

    // Get challenge performance
    const { data: challenges } = await supabase
      .from("challenge_submissions")
      .select("*, daily_challenges!inner(domain_id)")
      .eq("user_id", user.id)
      .eq("daily_challenges.domain_id", domain_id);

    const correctChallenges = (challenges || []).filter((c: any) => c.is_correct).length;
    const totalChallenges = (challenges || []).length;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You assess a student's skill level across topics in a domain. Based on their completion data and challenge performance, estimate a proficiency score (0-100) for each topic. Be realistic - topics marked as completed get 60-85, topics with challenge success get higher, uncompleted topics get 10-30 based on likely exposure.`,
          },
          {
            role: "user",
            content: `Domain: ${domain_id}\nTopics: ${topics.join(", ")}\nCompleted topics: ${completedTopics.join(", ")}\nChallenges: ${correctChallenges}/${totalChallenges} correct\n\nScore each topic 0-100.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_topics",
              description: "Assign scores to each topic",
              parameters: {
                type: "object",
                properties: {
                  scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        topic: { type: "string" },
                        score: { type: "number" },
                      },
                      required: ["topic", "score"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["scores"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "score_topics" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI assessment failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const { scores } = JSON.parse(toolCall.function.arguments);

    // Upsert scores
    for (const { topic, score } of scores) {
      await supabase
        .from("skill_assessments")
        .upsert(
          { user_id: user.id, domain_id, topic, score: Math.min(100, Math.max(0, Math.round(score))), assessed_at: new Date().toISOString() },
          { onConflict: "user_id,domain_id,topic" }
        );
    }

    return new Response(JSON.stringify({ scores }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("assess-skills error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
