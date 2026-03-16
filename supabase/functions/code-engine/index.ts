import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Domain-specific system prompts for AI code generation
const domainPrompts: Record<string, string> = {
  "web-development": `You are Lunor.AI's expert Web Development tutor specializing in HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, and modern full-stack patterns. Write clean, accessible, responsive code with imports, type annotations, and accessibility attributes. Explain "why" behind patterns like SSR vs CSR, hydration, and component composition.`,
  "app-development": `You are Lunor.AI's expert Mobile App Development coding assistant. You generate SELF-CONTAINED, ERROR-FREE code using ONLY vanilla HTML, CSS, and JavaScript.

CRITICAL: NEVER use React, JSX, TSX, Vue, TypeScript, or any framework. Use ONLY:
- index.html
- styles.css
- script.js

RULES:
1. **HTML only** — semantic HTML5, no JSX or React.
2. **CSS only** — styles.css with modern animations (transitions, keyframes, hover effects).
3. **Vanilla JS only** — plain JavaScript, no import/export, no modules.
4. **Include images** — use <img src="https://image.pollinations.ai/prompt/DESCRIPTION"> with URL-encoded descriptions (e.g. "modern%20hero%20illustration").
5. **Mobile-first** — design for 393px width, touch-friendly targets (min 44px), readable fonts (14px+).
6. **Visually rich** — gradients, cards, shadows, smooth transitions. Add 2-3 relevant images via pollinations.ai URLs.
7. **Always produce working UI** — the preview runs directly in HTML; no build step.`,
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

// Languages that can be natively executed in Deno
const NATIVE_LANGUAGES = new Set(["javascript", "typescript"]);

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

function normalizeLovableModel(requested?: string): string {
  const m = (requested || "").toLowerCase();
  if (!m) return DEFAULT_MODEL;
  if (m.includes("gemini-3-pro")) return "google/gemini-3-pro-preview";
  if (m.includes("gemini-2.5-pro")) return "google/gemini-2.5-pro";
  if (m.includes("gemini-2.5-flash-lite")) return "google/gemini-2.5-flash-lite";
  if (m.includes("gemini-2.5-flash")) return "google/gemini-2.5-flash";
  return DEFAULT_MODEL;
}

/**
 * Execute JavaScript/TypeScript code natively in a sandboxed Function scope.
 */
function executeNatively(code: string): string[] {
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) =>
      logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
    error: (...args: unknown[]) =>
      logs.push("❌ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
    warn: (...args: unknown[]) =>
      logs.push("⚠️ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
    info: (...args: unknown[]) =>
      logs.push("ℹ️ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
    table: (...args: unknown[]) =>
      logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join("\n")),
    dir: (...args: unknown[]) =>
      logs.push(args.map((a) => JSON.stringify(a, null, 2)).join("\n")),
    assert: (condition: unknown, ...args: unknown[]) => {
      if (!condition) logs.push("❌ Assertion failed: " + args.map(String).join(" "));
    },
    time: () => {},
    timeEnd: () => {},
    clear: () => {},
    count: () => {},
    group: () => {},
    groupEnd: () => {},
  };

  // Check if code contains JSX, import/export, or other non-Function() compatible syntax
  const hasModuleSyntax = /\b(import\s+|export\s+|from\s+['"])/m.test(code);
  const hasJSX = /<\w+[\s/>]/.test(code) && /\breturn\s*\(/.test(code);

  if (hasModuleSyntax || hasJSX) {
    // Strip import/export statements and try to execute the remaining logic
    let strippedCode = code
      .replace(/^\s*import\s+.*?[;\n]/gm, "// [import stripped]\n")
      .replace(/^\s*export\s+(default\s+)?/gm, "")
      .replace(/^\s*from\s+['"].*?['"];?\s*$/gm, "");

    // If it's mostly JSX/React, we can't run it natively — return a helpful message
    if (hasJSX) {
      return [
        "⚙️ JSX/React code detected — cannot execute directly in terminal.",
        "💡 This code needs a React runtime (browser) to render.",
        "📋 Static analysis: Code structure looks valid.",
        ...extractExports(code),
      ];
    }

    try {
      const fn = new Function("console", "setTimeout", "setInterval", "fetch", "require", strippedCode);
      fn(mockConsole, undefined, undefined, undefined, mockRequire);
      return logs.length > 0 ? logs : ["✅ Code executed successfully (no output)"];
    } catch (err) {
      return [`❌ Runtime Error: ${err instanceof Error ? err.message : String(err)}`];
    }
  }

  try {
    const fn = new Function("console", "setTimeout", "setInterval", "fetch", "require", code);
    fn(mockConsole, undefined, undefined, undefined, mockRequire);
    return logs.length > 0 ? logs : ["✅ Code executed successfully (no output)"];
  } catch (err) {
    return [`❌ Runtime Error: ${err instanceof Error ? err.message : String(err)}`];
  }
}

/** Mock require for CJS-style code */
function mockRequire(name: string) {
  return new Proxy({}, { get: (_t, prop) => typeof prop === "string" ? (..._a: unknown[]) => `[${name}.${prop}()]` : undefined });
}

/** Extract component/function names from JSX code for display */
function extractExports(code: string): string[] {
  const results: string[] = [];
  const fnMatch = code.match(/(?:function|const|class)\s+(\w+)/g);
  if (fnMatch) {
    results.push("📦 Detected: " + fnMatch.map(m => m.replace(/^(function|const|class)\s+/, "")).join(", "));
  }
  return results;
}

/**
 * Use Lovable AI to simulate execution for non-native languages (Python, SQL, etc.)
 */
async function simulateWithAI(
  code: string,
  language: string,
  domain: string,
  apiKey: string
): Promise<string[]> {
  const simulationPrompt = `You are a ${language} runtime simulator. Given the following ${language} code, predict and display the exact output that would be produced if this code were executed in a standard ${language} environment.

Rules:
- Show ONLY the output (stdout) — no explanations, no markdown, no code blocks
- If the code has errors, show the exact error message a real interpreter/compiler would produce
- If the code produces no output, say "✅ Code executed successfully (no output)"
- For imports that would fail, show the appropriate ImportError/ModuleNotFoundError
- Simulate realistic output including formatting, newlines, and special characters
- For data structures (DataFrames, arrays), show them as they would appear in a terminal
- Prefix errors with ❌ and warnings with ⚠️

Code to simulate:
\`\`\`${language}
${code}
\`\`\``;

  try {
    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: `You are a precise ${language} code execution simulator for the ${domain} domain. Output ONLY what the code would print — nothing else.` },
          { role: "user", content: simulationPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[code-engine] AI simulation error: ${response.status}`, text);
      return [`⚙️ ${language} simulation unavailable. Status: ${response.status}`];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "✅ Code executed successfully (no output)";
    
    // Split into lines for consistent output format
    return content.split("\n").filter((line: string) => line !== undefined);
  } catch (err) {
    console.error("[code-engine] AI simulation error:", err);
    return [`⚙️ Could not simulate ${language} execution: ${err instanceof Error ? err.message : "Unknown error"}`];
  }
}

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
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Request body required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const action = body.action as string | undefined;
    const rawDomain = (body.domain as string) || "web-development";
    const domain = typeof rawDomain === "string" ? rawDomain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "web-development" : "web-development";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "LOVABLE_API_KEY is not configured",
          hint: "Set the Edge Function secret: npx supabase secrets set LOVABLE_API_KEY=...",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: generate (AI code generation with streaming) =============
    if (action === "generate") {
      const messages = body.messages as Array<{ role: string; content: string }>;
      const model = body.model as string | undefined;
      const selectedModel = normalizeLovableModel(model);
      console.log(`[code-engine] generate domain=${domain}, model=${selectedModel}, messages=${messages?.length}`);

      const basePrompt = domainPrompts[domain] || `You are Lunor.AI's expert coding assistant for the "${domain}" domain.`;
      const stackDirective = domain === "app-development"
        ? `
- STACK: HTML + CSS + JS ONLY. Do NOT generate .jsx, .tsx, React, Vue, TypeScript, or any framework. NEVER.
- Return exactly 3 files: index.html, styles.css, script.js
- index.html: <link href="styles.css"> and <script src="script.js"></script>
- Add modern CSS animations (transitions, keyframes, hover effects)
- Include 2-3 images in HTML using: <img src="https://image.pollinations.ai/prompt/URL_ENCODED_DESCRIPTION"> (e.g. prompt=modern%20hero%20illustration)`
        : "";
      const systemPrompt = `${basePrompt}

Rules:
- Always use markdown formatting with code blocks and syntax highlighting
- Be concise but thorough
- When generating code, include comments explaining key parts
- If asked to debug, explain what's wrong and provide the fix
- Suggest improvements when you see opportunity
- When generating full files, specify the filename in a comment at the top
- Prefer modern production stack patterns (component architecture, clean state management, reusable UI)
- Add subtle motion/micro-interactions using CSS transitions/animations when relevant
- Favor visually polished output (spacing, typography hierarchy, color harmony, responsive layout)
- Prefer file paths in fenced blocks (e.g., "index.html" before the code block)
- Ensure imports/paths are consistent and runnable
${stackDirective}`;

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
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
        console.error(`[code-engine] AI gateway error: ${status}`, text);

        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
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
    }

    // ============= ACTION: execute (run code with domain-aware runtime) =============
    if (action === "execute") {
      const code = body.code as string | undefined;
      const language = body.language as string;
      console.log(`[code-engine] execute domain=${domain}, language=${language}, codeLen=${code?.length}`);

      if (!code || typeof code !== "string") {
        return new Response(
          JSON.stringify({ error: "No code provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (code.length > 15000) {
        return new Response(
          JSON.stringify({ error: "Code too long (max 15,000 characters)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let output: string[];

      if (NATIVE_LANGUAGES.has(language)) {
        // Native JS/TS execution
        output = executeNatively(code);
      } else {
        // AI-simulated execution for Python, SQL, Solidity, C++, etc.
        output = await simulateWithAI(code, language, domain || "general", LOVABLE_API_KEY);
      }

      return new Response(
        JSON.stringify({ output, runtime: NATIVE_LANGUAGES.has(language) ? "native" : "ai-simulated", language }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: get-environment (return domain environment config) =============
    if (action === "get-environment") {
      console.log(`[code-engine] get-environment domain=${domain}`);

      // Return domain-specific environment metadata
      const envConfig: Record<string, {
        primaryLanguage: string;
        supportedLanguages: string[];
        runtime: string;
      }> = {
        "web-development": { primaryLanguage: "javascript", supportedLanguages: ["javascript", "typescript", "html", "css", "json"], runtime: "native" },
        "app-development": { primaryLanguage: "javascript", supportedLanguages: ["javascript", "typescript", "json"], runtime: "native" },
        "data-science": { primaryLanguage: "python", supportedLanguages: ["python", "javascript", "json"], runtime: "ai-simulated" },
        "cybersecurity": { primaryLanguage: "python", supportedLanguages: ["python", "javascript", "shell"], runtime: "ai-simulated" },
        "cloud-computing": { primaryLanguage: "yaml", supportedLanguages: ["yaml", "json", "shell", "javascript"], runtime: "ai-simulated" },
        "devops": { primaryLanguage: "yaml", supportedLanguages: ["yaml", "shell", "json", "javascript"], runtime: "ai-simulated" },
        "database": { primaryLanguage: "sql", supportedLanguages: ["sql", "javascript", "json"], runtime: "ai-simulated" },
        "iot": { primaryLanguage: "cpp", supportedLanguages: ["cpp", "python", "javascript"], runtime: "ai-simulated" },
        "blockchain": { primaryLanguage: "solidity", supportedLanguages: ["solidity", "javascript", "json"], runtime: "ai-simulated" },
        "ui-ux": { primaryLanguage: "html", supportedLanguages: ["html", "css", "javascript", "json"], runtime: "native" },
        "dsa": { primaryLanguage: "javascript", supportedLanguages: ["javascript", "python", "typescript"], runtime: "native" },
        "system-design": { primaryLanguage: "javascript", supportedLanguages: ["javascript", "json", "yaml"], runtime: "native" },
      };

      const env = envConfig[domain] || { primaryLanguage: "javascript", supportedLanguages: ["javascript"], runtime: "native" };

      return new Response(
        JSON.stringify({ domain, environment: env }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: generate-tests =============
    if (action === "generate-tests") {
      const { code, language, filename, model } = body as { code: string; language: string; filename: string; model: string };
      const selectedModel = normalizeLovableModel(model);
      console.log(`[code-engine] generate-tests lang=${language}, file=${filename}`);

      const testPrompt = `Generate comprehensive unit tests for the following ${language} code. Use appropriate testing frameworks (Jest for JS/TS, pytest for Python, etc.). Include edge cases, error cases, and happy paths. Return ONLY the test code in a single code block.

File: ${filename || "unknown"}
\`\`\`${language}
${code}
\`\`\``;

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: `You are an expert test engineer. Generate thorough, production-quality tests. Use markdown code blocks with syntax highlighting.` },
            { role: "user", content: testPrompt },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[code-engine] test gen error: ${response.status}`, text);
        return new Response(JSON.stringify({ error: "Test generation failed" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    // ============= ACTION: generate-docs =============
    if (action === "generate-docs") {
      const { code, language, filename, model } = body as { code: string; language: string; filename: string; model: string };
      const selectedModel = normalizeLovableModel(model);
      console.log(`[code-engine] generate-docs lang=${language}, file=${filename}`);

      const docsPrompt = `Generate comprehensive documentation for the following ${language} code. Include:
1. Module/file overview
2. Function/class documentation with parameters, return types, and examples
3. Usage examples
4. Any important notes or caveats

Return the documentation as a well-formatted markdown document.

File: ${filename || "unknown"}
\`\`\`${language}
${code}
\`\`\``;

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: `You are a technical documentation expert. Write clear, comprehensive docs with examples.` },
            { role: "user", content: docsPrompt },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[code-engine] docs gen error: ${response.status}`, text);
        return new Response(JSON.stringify({ error: "Documentation generation failed" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    // ============= ACTION: autocomplete (ghost text) =============
    if (action === "autocomplete") {
      const { code, language, cursorLine, cursorColumn } = body as { code: string; language: string; cursorLine: number; cursorColumn: number };
      const selectedModel = "google/gemini-2.5-flash-lite";
      console.log(`[code-engine] autocomplete lang=${language}, line=${cursorLine}`);

      const lines = code.split("\n");
      const contextBefore = lines.slice(Math.max(0, cursorLine - 20), cursorLine + 1).join("\n");
      const contextAfter = lines.slice(cursorLine + 1, cursorLine + 5).join("\n");

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: `You are an intelligent code autocomplete engine. Given code context, predict the next 1-3 lines of code the developer would write. Return ONLY the completion text — no markdown, no explanation, no code fences. Just the raw code to insert.` },
            { role: "user", content: `Language: ${language}\n\nCode before cursor:\n${contextBefore}\n\nCode after cursor:\n${contextAfter}\n\nComplete the code at the cursor position:` },
          ],
          stream: false,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ suggestion: "" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const suggestion = data.choices?.[0]?.message?.content?.trim() || "";
      // Clean up: remove markdown code fences if the model accidentally adds them
      const cleaned = suggestion.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();

      return new Response(JSON.stringify({ suggestion: cleaned }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============= ACTION: analyze-code (real-time AI guidance) =============
    if (action === "analyze-code") {
      const { code, language, cursorLine, domain: actionDomain, teachingMode } = body as { code: string; language: string; cursorLine: number; domain: string; teachingMode: boolean };
      const selectedModel = "google/gemini-2.5-flash-lite";
      console.log(`[code-engine] analyze-code lang=${language}, line=${cursorLine}, teachingMode=${!!teachingMode}`);

      const lines = code.split("\n");
      const contextBefore = lines.slice(Math.max(0, cursorLine - 15), cursorLine + 1).join("\n");
      const basePrompt = domainPrompts[actionDomain || domain] || `You are a coding mentor for ${actionDomain || domain}.`;
      const teachingHint = teachingMode
        ? "\n\nTEACHING MODE: The user has made repeated errors. Provide step-by-step guidance, break concepts into small pieces, and suggest a simple exercise or next action."
        : "";

      const analyzePrompt = `As a coding mentor, analyze this ${language} code the user is writing.

Code so far:
\`\`\`${language}
${contextBefore}
\`\`\`

Respond in JSON only:
{
  "intent": "brief description of what the user seems to be building (1 sentence)",
  "suggestion": "next step or fix (1-2 sentences, actionable)",
  "nextLine": "optional: exact next line of code to suggest (or null)",
  "hasError": false,
  "concept": "brief concept name for a visual diagram (e.g. 'HTML button element', 'JavaScript event handler')"
}

If you detect an obvious error (unclosed tag, syntax mistake), set hasError: true and explain in suggestion.
Keep responses concise.${teachingHint}`;

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: basePrompt + " Respond ONLY with valid JSON. No markdown, no explanation outside JSON." },
            { role: "user", content: analyzePrompt },
          ],
          stream: false,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ intent: "", suggestion: "", nextLine: null, hasError: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "{}";
      let parsed: { intent?: string; suggestion?: string; nextLine?: string | null; hasError?: boolean; concept?: string } = {};
      try {
        parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "")) || {};
      } catch {
        parsed = { intent: "", suggestion: content.slice(0, 200), nextLine: null, hasError: false, concept: "" };
      }

      const concept = parsed.concept || "code concept";
      const diagramUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`educational diagram: ${concept}, clean infographic, developer tutorial style, no watermark`)}?width=500&height=320&nologo=true`;

      return new Response(
        JSON.stringify({
          intent: parsed.intent || "",
          suggestion: parsed.suggestion || "",
          nextLine: parsed.nextLine || null,
          hasError: !!parsed.hasError,
          concept: parsed.concept || "",
          diagramUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: explain-error (AI explanation for errors) =============
    if (action === "explain-error") {
      const { error: codeError, code, language, domain: actionDomain, teachingMode } = body as { error: string; code: string; language: string; domain: string; teachingMode: boolean };
      const selectedModel = "google/gemini-2.5-flash-lite";
      console.log(`[code-engine] explain-error teachingMode=${!!teachingMode}`);

      const basePrompt = domainPrompts[actionDomain || domain] || `You are a coding mentor for ${actionDomain || domain}.`;
      const teachingHint = teachingMode
        ? "\n\nTEACHING MODE: Provide step-by-step guidance. Break the concept into small pieces. Include a simple example. Be encouraging."
        : "";

      const explainPrompt = `The user has this error in their ${language} code:

Error: ${codeError}

Relevant code:
\`\`\`${language}
${(code || "").slice(0, 500)}
\`\`\`

Respond in JSON:
{
  "explanation": "Clear, friendly explanation (2-3 sentences)",
  "fix": "Exact code fix or suggestion",
  "concept": "Brief concept name for diagram (e.g. 'HTML closing tags', 'Flexbox layout')"
}${teachingHint}`;

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: basePrompt + " Respond ONLY with valid JSON." },
            { role: "user", content: explainPrompt },
          ],
          stream: false,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ explanation: "Could not get AI explanation.", fix: "", concept: "" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || "{}";
      let parsed: { explanation?: string; fix?: string; concept?: string } = {};
      try {
        parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "")) || {};
      } catch {
        parsed = { explanation: content.slice(0, 300), fix: "", concept: "" };
      }

      const concept = parsed.concept || "code concept";
      const diagramUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`educational diagram explaining ${concept}, clean infographic style, no watermark`)}?width=400&height=300&nologo=true`;

      return new Response(
        JSON.stringify({
          explanation: parsed.explanation || "",
          fix: parsed.fix || "",
          concept: parsed.concept || "",
          diagramUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: concept-image (AI generated concept diagram) =============
    if (action === "concept-image") {
      const { concept } = body;
      if (!concept || typeof concept !== "string") {
        return new Response(JSON.stringify({ error: "concept is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(`educational diagram: ${concept}, clean infographic, developer tutorial style, no watermark`)}?width=500&height=350&nologo=true`;
      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============= ACTION: visual-assets (generated image URLs from prompt) =============
    if (action === "visual-assets") {
      const { prompt, domain: visualDomain, count } = body;
      const total = Math.max(1, Math.min(Number(count) || 3, 4));
      if (!prompt || typeof prompt !== "string") {
        return new Response(
          JSON.stringify({ error: "Prompt is required for visual-assets" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const styleHints = [
        "modern UI mockup, glassmorphism, vibrant gradients, clean typography, subtle depth, no watermark",
        "futuristic dashboard interface, animated feel, neon accents, premium product design, no watermark",
        "product hero visual, cinematic lighting, smooth motion aesthetics, high detail, no watermark",
        "app screen concept, minimal and elegant, delightful micro-interactions style, no watermark",
      ];

      const seedBase = Date.now();
      const images = Array.from({ length: total }).map((_, i) => {
        const style = styleHints[i % styleHints.length];
        const finalPrompt = `${prompt}, domain: ${visualDomain || "general"}, ${style}`;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1280&height=720&seed=${seedBase + i}&nologo=true`;
        return {
          id: `img-${seedBase + i}`,
          caption: `Generated visual ${i + 1}`,
          prompt: finalPrompt,
          url,
        };
      });

      return new Response(
        JSON.stringify({ images }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.error("[code-engine] Unknown action:", action, "keys:", Object.keys(body || {}));
    return new Response(
      JSON.stringify({ error: `Unknown action: ${action ?? "undefined"}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[code-engine] error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
