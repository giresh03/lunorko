import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { projectTitle, projectDescription, techStack, domainId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            content: `You are a team-building AI assistant for a developer learning platform. Given a project idea, suggest:
1. Recommended team roles (3-5 roles with skills needed)
2. Project milestones (4-6 milestones)
3. Tips for effective collaboration
Keep responses concise and actionable. Format as JSON with keys: roles (array of {title, skills[], description}), milestones (array of {title, description, week}), tips (array of strings).`
          },
          {
            role: "user",
            content: `Project: ${projectTitle}\nDescription: ${projectDescription}\nTech Stack: ${techStack?.join(", ") || "Not specified"}\nDomain: ${domainId}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_team_structure",
            description: "Return team structure suggestions for the project",
            parameters: {
              type: "object",
              properties: {
                roles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      skills: { type: "array", items: { type: "string" } },
                      description: { type: "string" }
                    },
                    required: ["title", "skills", "description"]
                  }
                },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      week: { type: "number" }
                    },
                    required: ["title", "description", "week"]
                  }
                },
                tips: { type: "array", items: { type: "string" } }
              },
              required: ["roles", "milestones", "tips"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_team_structure" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ roles: [], milestones: [], tips: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("match-team error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
