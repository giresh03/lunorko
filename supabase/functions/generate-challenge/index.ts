import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const supabaseAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !authUser) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { domain_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];

    // Check if challenge already exists for today
    const { data: existing } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("domain_id", domain_id)
      .eq("challenge_date", today)
      .maybeSingle();

    if (existing) {
      const { solution_code: _s, ...safeExisting } = existing as Record<string, unknown>;
      return new Response(JSON.stringify(safeExisting), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const domainNames: Record<string, string> = {
      "web-development": "Web Development (HTML, CSS, JS, React, Node.js)",
      "app-development": "Mobile App Development (React Native, Flutter)",
      "cybersecurity": "Cybersecurity & Ethical Hacking",
      "data-science": "Data Science & Machine Learning (Python)",
      "cloud-computing": "Cloud Computing (AWS, Docker, K8s)",
      "devops": "DevOps (CI/CD, Linux, Bash)",
      "database": "Database Engineering (SQL, NoSQL)",
      "iot": "IoT & Embedded Systems (Arduino, ESP32)",
      "blockchain": "Blockchain & Smart Contracts (Solidity)",
      "ui-ux": "UI/UX Design (CSS, Figma patterns)",
      "dsa": "Data Structures & Algorithms",
      "system-design": "System Design",
    };

    const domainLabel = domainNames[domain_id] || domain_id;
    const difficulties = ["easy", "medium", "hard"];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

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
            content: `You are a coding challenge generator for ${domainLabel}. Generate a ${difficulty} difficulty coding challenge. Return ONLY valid JSON with this exact structure:
{
  "title": "Challenge title (max 60 chars)",
  "description": "Clear problem statement with examples. Use markdown formatting.",
  "hints": ["hint1", "hint2"],
  "solution_code": "Complete solution code",
  "xp_reward": ${difficulty === "easy" ? 30 : difficulty === "medium" ? 50 : 80}
}
Do NOT wrap in markdown code blocks. Return raw JSON only.`,
          },
          { role: "user", content: `Generate a unique ${difficulty} ${domainLabel} coding challenge for today (${today}).` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_challenge",
              description: "Create a daily coding challenge",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  hints: { type: "array", items: { type: "string" } },
                  solution_code: { type: "string" },
                  xp_reward: { type: "number" },
                },
                required: ["title", "description", "hints", "solution_code", "xp_reward"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_challenge" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const challenge = JSON.parse(toolCall.function.arguments);

    const { data: inserted, error } = await supabase
      .from("daily_challenges")
      .insert({
        domain_id,
        title: challenge.title,
        description: challenge.description,
        difficulty,
        hints: challenge.hints || [],
        solution_code: challenge.solution_code,
        challenge_date: today,
        xp_reward: challenge.xp_reward || 50,
      })
      .select()
      .single();

    if (error) throw error;

    const { solution_code: _sc, ...safeInserted } = (inserted || {}) as Record<string, unknown>;
    return new Response(JSON.stringify(safeInserted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-challenge error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
