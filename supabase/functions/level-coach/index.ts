import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MODEL = "google/gemini-2.5-flash";

async function callAI(messages: Array<{ role: string; content: string }>) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("AI is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, messages, stream: false }),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `AI request failed (${res.status})`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content as string) ?? "";
}

const extractJson = (raw: string) => {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in AI response");
  return JSON.parse(candidate.slice(start, end + 1));
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: claims, error: claimsError } = await (supabase.auth as any).getClaims(token);
  const userId = claims?.claims?.sub ?? claims?.sub;
  if (claimsError || !userId) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const {
      mode = "chat",
      domain_name = "Software Engineering",
      level_index = 1,
      level_title = "Fundamentals",
      tier = "Beginner",
      concepts = [],
      message = "",
      history = [],
      code = "",
      challenge = null,
      seed = Math.random().toString(36).slice(2, 8),
    } = body ?? {};

    const context = `Domain: ${domain_name}
Level ${level_index} — ${level_title} (difficulty tier: ${tier})
Key concepts: ${Array.isArray(concepts) ? concepts.join(", ") : ""}`;

    if (mode === "chat") {
      const system = `You are the Lunor.AI ${domain_name} tutor — a friendly, precise, domain-expert mentor for one student.
${context}

RULES
- Teach for THIS level only; never dump content from far-future levels.
- Be concise (max ~180 words) and use short code snippets when helpful.
- If the student is inside a challenge, give hints and Socratic guidance first. Only give the full solution if they explicitly ask for the answer/solution.
- If they share code, point at the exact line/cause of the bug and how to fix it.
- Encouraging, never condescending.`;
      const msgs = [
        { role: "system", content: system },
        ...(Array.isArray(history) ? history.slice(-8) : []),
        {
          role: "user",
          content: `${code ? `Student's current code:\n\`\`\`\n${String(code).slice(0, 6000)}\n\`\`\`\n` : ""}${challenge ? `Active challenge: ${JSON.stringify(challenge).slice(0, 1500)}\n` : ""}${message}`,
        },
      ];
      const reply = await callAI(msgs);
      return json({ reply });
    }

    if (mode === "challenge") {
      const system = `You generate coding challenges for the Lunor.AI gamified curriculum.
${context}
Variation seed: ${seed} — produce a challenge distinct from typical textbook examples.

Return ONLY JSON:
{"title":string,"statement":string,"requirements":string[],"constraints":string[],"example":string,"expected_output":string,"hints":string[],"test_cases":string[],"difficulty":string}
The challenge must be solvable in 10-25 minutes and must exercise the level's concepts.`;
      const raw = await callAI([
        { role: "system", content: system },
        { role: "user", content: `Generate the challenge for level ${level_index}: ${level_title}.` },
      ]);
      return json({ challenge: extractJson(raw) });
    }

    if (mode === "evaluate") {
      const system = `You are a strict but fair code examiner for Lunor.AI.
${context}

Evaluate the student's submission against the challenge. Return ONLY JSON:
{"score":number(0-100),"passed":boolean,"correctness":number(0-100),"code_quality":number(0-100),"concepts":number(0-100),"summary":string,"strengths":string[],"improvements":string[],"errors":string[]}
Pass requires score >= 70 and the core requirements met.`;
      const raw = await callAI([
        { role: "system", content: system },
        {
          role: "user",
          content: `Challenge:\n${JSON.stringify(challenge).slice(0, 4000)}\n\nSubmission:\n\`\`\`\n${String(code).slice(0, 12000)}\n\`\`\``,
        },
      ]);
      return json({ evaluation: extractJson(raw) });
    }

    return json({ error: "Unknown mode" }, 400);
  } catch (e) {
    const err = e as Error & { status?: number };
    const status = err.status === 429 ? 429 : err.status === 402 ? 402 : 500;
    return json({ error: err.message || "Tutor request failed" }, status);
  }
});
