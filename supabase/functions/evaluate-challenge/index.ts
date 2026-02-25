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

    // Get user from token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { challenge_id, code, time_taken_seconds } = await req.json();

    // Get challenge
    const { data: challenge } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("id", challenge_id)
      .single();

    if (!challenge) throw new Error("Challenge not found");

    // AI evaluation
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
            content: `You evaluate coding challenge submissions. Compare the student's code with the expected solution. Determine if the submission is correct (solves the problem, even if approach differs).`,
          },
          {
            role: "user",
            content: `Challenge: ${challenge.description}\n\nExpected solution:\n${challenge.solution_code}\n\nStudent's submission:\n${code}\n\nEvaluate correctness.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate",
              description: "Evaluate the submission",
              parameters: {
                type: "object",
                properties: {
                  is_correct: { type: "boolean", description: "Whether the submission solves the problem correctly" },
                  feedback: { type: "string", description: "Brief feedback for the student (2-3 sentences)" },
                  score: { type: "number", description: "Score out of 100" },
                },
                required: ["is_correct", "feedback", "score"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "evaluate" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI evaluation failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const evaluation = JSON.parse(toolCall.function.arguments);

    // Save submission
    await supabase.from("challenge_submissions").insert({
      user_id: user.id,
      challenge_id,
      code,
      is_correct: evaluation.is_correct,
      time_taken_seconds,
    });

    // Award XP if correct
    if (evaluation.is_correct) {
      const today = new Date().toISOString().split("T")[0];
      const { data: xpRow } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (xpRow) {
        const lastDate = xpRow.last_activity_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const newStreak = lastDate === yesterdayStr ? xpRow.current_streak + 1 : lastDate === today ? xpRow.current_streak : 1;

        await supabase.from("user_xp").update({
          total_xp: xpRow.total_xp + challenge.xp_reward,
          level: Math.floor((xpRow.total_xp + challenge.xp_reward) / 500) + 1,
          current_streak: newStreak,
          longest_streak: Math.max(xpRow.longest_streak, newStreak),
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      } else {
        await supabase.from("user_xp").insert({
          user_id: user.id,
          total_xp: challenge.xp_reward,
          level: 1,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        });
      }
    }

    return new Response(JSON.stringify({
      is_correct: evaluation.is_correct,
      feedback: evaluation.feedback,
      score: evaluation.score,
      xp_earned: evaluation.is_correct ? challenge.xp_reward : 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-challenge error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
