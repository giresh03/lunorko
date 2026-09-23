import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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
    const { messages, domain } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const apiKey = GOOGLE_AI_API_KEY || LOVABLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY or LOVABLE_API_KEY is not configured");

    const useGoogleAI = !!GOOGLE_AI_API_KEY;
    console.log(`[code-assistant] domain=${domain}, messages=${messages.length}, provider=${useGoogleAI ? "google" : "lovable"}`);

    // Domain-specific system prompts
    const domainPrompts: Record<string, string> = {
      "web-development": `You are Lunor.AI's Web Development tutor. The live preview uses vanilla HTML, CSS, and JavaScript.

FORBIDDEN for the page: React, JSX, TSX, TypeScript, Vue, Angular, component files.
For a small demo, return one complete HTML file with <style> and <script> inside. Format: \`\`\`html ... \`\`\`
For a full website or API, also return client/ and server/ files as described in the reminder below.

Example structure:
\`\`\`html
<!DOCTYPE html>
<html>
<head><style>/* CSS here */</style></head>
<body>
  <!-- HTML here -->
  <script>/* JavaScript here */</script>
</body>
</html>
\`\`\`

Every response must include a runnable \`\`\`html code block. No .tsx, .ts, or .jsx files.`,
      "app-development": `You are Lunor.AI's expert Mobile App Development tutor covering React Native, Flutter, Swift, Kotlin, Expo, and Firebase. Understand platform nuances (iOS vs Android), navigation patterns, state management, and performance optimization. Generate production-ready cross-platform code.`,
      "cybersecurity": `You are Lunor.AI's expert Cybersecurity tutor specializing in ethical hacking, penetration testing, network security, cryptography, OWASP Top 10, and digital forensics. Explain vulnerabilities with real-world examples, provide secure coding practices. Always emphasize ethical and legal boundaries.`,
      "data-science": `You are Lunor.AI's expert Data Science & ML tutor covering Python, TensorFlow, PyTorch, Pandas, NumPy, Scikit-learn, NLP, and Computer Vision. Explain statistics intuitively, write vectorized code, guide through the full ML pipeline: EDA, feature engineering, training, evaluation, deployment.`,
      "cloud-computing": `You are Lunor.AI's expert Cloud Computing tutor covering AWS, Azure, GCP, Docker, Kubernetes, Terraform, serverless, and CI/CD. Explain cloud services with architecture diagrams in text, write IaC templates. Emphasize cost optimization, security, and scalability.`,
      "devops": `You are Lunor.AI's expert DevOps tutor covering CI/CD (Jenkins, GitHub Actions), IaC (Ansible, Terraform), monitoring (Prometheus, Grafana), Linux, Bash, and Nginx. Write production-grade pipeline configs and guide through automation best practices.`,
      "database": `You are Lunor.AI's expert Database Engineering tutor covering PostgreSQL, MongoDB, Redis, MySQL, database design, normalization, indexing, query optimization, and distributed databases. Write efficient queries, explain execution plans. Emphasize ACID, CAP theorem, and performance tuning.`,
      "iot": `You are Lunor.AI's expert IoT & Embedded Systems tutor covering Arduino, Raspberry Pi, ESP32, MQTT, edge computing, sensors, and Embedded C. Write efficient embedded code, explain protocols (I2C, SPI, UART, MQTT). Include circuit descriptions and pin configs.`,
      "blockchain": `You are Lunor.AI's expert Blockchain & Web3 tutor covering Solidity, Ethereum, smart contracts, DeFi, NFTs, Web3.js, and Hardhat. Write secure, gas-optimized contracts following OpenZeppelin standards. Highlight security vulnerabilities and prevention.`,
      "ui-ux": `You are Lunor.AI's expert UI/UX Design tutor covering Figma, design systems, wireframing, prototyping, user research, and accessibility (WCAG). Explain design principles, provide CSS/HTML implementations, guide through user-centered design.`,
      "dsa": `You are Lunor.AI's expert DSA & Competitive Programming tutor. Solve problems step-by-step: brute force → optimized, with time/space complexity. Write clean code in Python, Java, C++, JavaScript. Explain intuition before code.`,
      "system-design": `You are Lunor.AI's expert System Design tutor covering load balancing, caching, microservices, message queues, CAP theorem, sharding. Explain with component diagrams, estimate capacity, guide through trade-offs for real-world systems.`,
    };

    const basePrompt = domainPrompts[domain] || `You are Lunor.AI's expert coding assistant for the "${domain}" domain.`;
    let systemPrompt = `${basePrompt}

Rules:
- Always use markdown formatting with code blocks and syntax highlighting
- Be concise but thorough
- When generating code, include comments explaining key parts
- If asked to debug, explain what's wrong and provide the fix
- Suggest improvements when you see opportunity`;

    // For web-development: inject reinforcement so model strictly outputs HTML/CSS/JS
    if (domain === "web-development") {
      systemPrompt += `

REMINDER: The live preview is vanilla HTML/CSS/JS. No React, TSX, or TypeScript components.

When the user asks for a full website, portfolio, SaaS, restaurant, store, or full-stack/MERN app, also emit Express server files. Put the path on the line before each fence: client/index.html, client/styles.css, client/script.js, server/index.js, server/src/app.js, server/src/config/db.js, server/src/modules/site/site.routes.js, server/src/modules/site/site.controller.js, server/src/modules/site/site.service.js, server/package.json, package.json, .env.example, README.md. Use ESM. If MONGODB_URI is missing, keep data in memory. The browser script must still render with sample data when the API is offline.`;
    }

    if (useGoogleAI) {
      // Google AI API: convert messages to contents + systemInstruction
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      for (const m of messages) {
        if (m.role === "system") continue; // handled by systemInstruction
        const role = m.role === "assistant" ? "model" : "user";
        contents.push({ role, parts: [{ text: m.content }] });
      }
      if (contents.length === 0) contents.push({ role: "user", parts: [{ text: "Hello" }] });

      const preferred = (Deno.env.get("GEMINI_MODEL") || "").trim();
      const fallbacks = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
      const models: string[] = [];
      const seen = new Set<string>();
      if (preferred) {
        seen.add(preferred);
        models.push(preferred);
      }
      for (const m of fallbacks) {
        if (!seen.has(m)) {
          seen.add(m);
          models.push(m);
        }
      }

      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 8192, temperature: 0.3 },
      };

      let googleResp: Response | null = null;
      let usedModel = "";
      let lastText = "";
      let lastStatus = 500;

      for (const geminiModel of models) {
        const googleUrl =
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?key=${encodeURIComponent(GOOGLE_AI_API_KEY!)}&alt=sse`;
        const resp = await fetch(googleUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          googleResp = resp;
          usedModel = geminiModel;
          break;
        }
        lastText = await resp.text();
        lastStatus = resp.status;
        let detail = lastText.slice(0, 500);
        try {
          const j = JSON.parse(lastText);
          if (typeof j.error?.message === "string") detail = j.error.message.slice(0, 800);
        } catch {
          /* ignore */
        }
        const retry =
          resp.status === 404 ||
          (resp.status === 400 &&
            /not found|does not exist|unknown model|invalid model/i.test(detail));
        console.error(`[code-assistant] Gemini ${geminiModel} -> ${resp.status}`, detail);
        if (!retry) {
          return new Response(
            JSON.stringify({ error: "AI service error", detail, model: geminiModel }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      if (!googleResp) {
        let detail = lastText.slice(0, 500);
        try {
          const j = JSON.parse(lastText);
          if (typeof j.error?.message === "string") detail = j.error.message.slice(0, 800);
        } catch {
          /* ignore */
        }
        return new Response(
          JSON.stringify({
            error: "AI service error",
            detail,
            status: lastStatus,
            hint: "Set GEMINI_MODEL or verify GEMINI_API_KEY / API enablement.",
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`[code-assistant] Gemini ok model=${usedModel}`);

      // Transform Google SSE stream to OpenAI format for frontend compatibility
      let buffer = "";
      const decoder = new TextDecoder();
      const reader = googleResp.body!.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const json = line.slice(6).trim();
                if (!json) continue;
                try {
                  const parsed = JSON.parse(json);
                  const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (textPart) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: textPart } }] })}\n\n`));
                  }
                } catch {}
              }
            }
            // Flush remaining buffer
            if (buffer.trim().startsWith("data: ")) {
              const json = buffer.slice(6).trim();
              try {
                const parsed = JSON.parse(json);
                const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textPart) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: textPart } }] })}\n\n`));
                }
              } catch {}
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Lovable gateway (fallback)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error(`[code-assistant] AI gateway error: ${status}`, text);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({
          error: "AI credits exhausted. Set GOOGLE_AI_API_KEY in Supabase secrets for a free alternative (get key from aistudio.google.com/apikey).",
        }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("[code-assistant] error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
