import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Max-Age": "86400",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

// Domain-specific interview question templates for ML-driven question generation
const domainInterviewContext: Record<string, string> = {
  "web-development": "Web Development: HTML, CSS, JavaScript, React, Node.js, TypeScript, REST APIs, responsive design, accessibility.",
  "app-development": "Mobile App Development: React Native, Flutter, iOS/Android, state management, native APIs, performance optimization.",
  "cybersecurity": "Cybersecurity: ethical hacking, OWASP, encryption, network security, penetration testing, secure coding.",
  "data-science": "Data Science: Python, Pandas, NumPy, ML algorithms, statistics, data visualization, NLP, TensorFlow.",
  "cloud-computing": "Cloud Computing: AWS, Azure, GCP, Docker, Kubernetes, serverless, IaC, cost optimization.",
  "devops": "DevOps: CI/CD, Jenkins, GitHub Actions, Terraform, Ansible, monitoring, Linux, Bash.",
  "database": "Database: SQL, PostgreSQL, MongoDB, Redis, indexing, query optimization, ACID, CAP theorem.",
  "iot": "IoT: Arduino, Raspberry Pi, MQTT, sensors, embedded systems, edge computing.",
  "blockchain": "Blockchain: Solidity, Ethereum, smart contracts, DeFi, Web3, gas optimization.",
  "ui-ux": "UI/UX: Figma, design systems, user research, prototyping, accessibility, WCAG.",
  "dsa": "DSA: algorithms, data structures, time complexity, problem-solving, competitive programming.",
  "system-design": "System Design: load balancing, caching, microservices, scalability, CAP theorem, distributed systems.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, domain, questionIndex, question, answer, sessionHistory } = body;

    const domainContext = domainInterviewContext[domain] || "Software Engineering and general technical concepts.";

    // ============= ACTION: generate-question =============
    if (action === "generate-question") {
      const history = sessionHistory || [];
      const historyText = history
        .map((h: { q: string; a: string }) => `Q: ${h.q}\nA: ${h.a}`)
        .join("\n\n");

      const prompt = `You are an AI interview robot conducting a technical job interview for a student. Domain: ${domainContext}

Generate exactly ONE interview question for question number ${(questionIndex || 0) + 1}. 
- Vary difficulty: early questions (1-3) are easier, later ones (4+) can be harder.
- Ask about real-world scenarios, concepts, or problem-solving.
- Be concise: 1-2 sentences max.
${historyText ? `\nPrevious Q&A in this session:\n${historyText}\n\nDo NOT repeat these topics. Ask something new.` : ""}

Return ONLY the question text, no numbering, no quotes, no preamble.`;

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: "You are a professional technical interviewer. Generate clear, relevant interview questions. Output only the question, nothing else.",
            },
            { role: "user", content: prompt },
          ],
          stream: false,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("[ai-interview] generate-question error:", response.status, text);
        return new Response(
          JSON.stringify({ error: "Failed to generate question" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const generatedQuestion = (data.choices?.[0]?.message?.content || "Tell me about your experience in this domain.").trim();

      return new Response(
        JSON.stringify({ question: generatedQuestion }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: evaluate-answer =============
    if (action === "evaluate-answer") {
      if (!question || !answer) {
        return new Response(
          JSON.stringify({ error: "Question and answer required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const prompt = `You are an AI interview evaluator using machine learning principles to assess candidate responses.

Domain: ${domainContext}

Question: ${question}
Candidate's answer: ${answer}

Evaluate the answer and return a JSON object with:
- "score": number 0-100 (overall quality)
- "feedback": string, 1-2 sentences of constructive feedback
- "strengths": array of 1-3 short strings (what they did well)
- "improvements": array of 1-3 short strings (what could be better)
- "followUp": string or null (optional follow-up question if answer was incomplete, else null)

Be fair and encouraging. Consider clarity, technical accuracy, and completeness. Return ONLY valid JSON, no markdown.`;

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: "You evaluate interview answers. Return ONLY a valid JSON object with keys: score, feedback, strengths, improvements, followUp. No markdown, no code blocks.",
            },
            { role: "user", content: prompt },
          ],
          stream: false,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("[ai-interview] evaluate-answer error:", response.status, text);
        return new Response(
          JSON.stringify({ error: "Failed to evaluate answer" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      let content = (data.choices?.[0]?.message?.content || "{}").trim();
      content = content.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");

      let evaluation;
      try {
        evaluation = JSON.parse(content);
      } catch {
        evaluation = {
          score: 70,
          feedback: "Thanks for your response. Let's move to the next question.",
          strengths: ["Engaged with the question"],
          improvements: ["Could add more technical depth"],
          followUp: null,
        };
      }

      return new Response(
        JSON.stringify({
          score: Math.min(100, Math.max(0, evaluation.score ?? 70)),
          feedback: evaluation.feedback || "Good response.",
          strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
          improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements : [],
          followUp: evaluation.followUp ?? null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: get-summary =============
    if (action === "get-summary") {
      const history = sessionHistory || [];
      if (history.length === 0) {
        return new Response(
          JSON.stringify({ summary: "No interview data to summarize.", overallScore: 0, tips: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const historyText = history
        .map((h: { q: string; a: string; score?: number }) => `Q: ${h.q}\nA: ${h.a}\nScore: ${h.score ?? "N/A"}`)
        .join("\n\n");

      const prompt = `You are an AI career coach. Summarize this technical interview session.

Domain: ${domainContext}

Interview transcript:
${historyText}

Return a JSON object with:
- "summary": 2-3 sentence overall assessment
- "overallScore": number 0-100 (average, be fair)
- "tips": array of 3-5 short strings with actionable improvement tips for the candidate

Return ONLY valid JSON, no markdown.`;

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: "You summarize interview performance. Return ONLY valid JSON with keys: summary, overallScore, tips. No markdown.",
            },
            { role: "user", content: prompt },
          ],
          stream: false,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            summary: "Interview completed. Keep practicing!",
            overallScore: 70,
            tips: ["Review domain fundamentals", "Practice explaining concepts aloud", "Prepare real-world examples"],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      let content = (data.choices?.[0]?.message?.content || "{}").trim();
      content = content.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");

      let result;
      try {
        result = JSON.parse(content);
      } catch {
        result = { summary: "Interview completed.", overallScore: 70, tips: [] };
      }

      return new Response(
        JSON.stringify({
          summary: result.summary || "Interview completed.",
          overallScore: Math.min(100, Math.max(0, result.overallScore ?? 70)),
          tips: Array.isArray(result.tips) ? result.tips : [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[ai-interview] error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
