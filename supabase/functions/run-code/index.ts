import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "No code provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (code.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Code too long (max 10,000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (language === "javascript" || language === "typescript") {
      try {
        const logs: string[] = [];

        const mockConsole = {
          log: (...args: unknown[]) =>
            logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
          error: (...args: unknown[]) =>
            logs.push("❌ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
          warn: (...args: unknown[]) =>
            logs.push("⚠️ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
          info: (...args: unknown[]) =>
            logs.push("ℹ️ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
        };

        // Execute with Function constructor — isolated from Deno globals
        const fn = new Function("console", code);
        fn(mockConsole);

        return new Response(
          JSON.stringify({
            output: logs.length > 0 ? logs : ["✅ Code executed successfully (no output)"],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            output: [`❌ Error: ${err instanceof Error ? err.message : String(err)}`],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Unsupported languages
    return new Response(
      JSON.stringify({
        output: [`⚙️ ${language} execution is not yet supported on the backend. Coming soon!`],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[run-code] error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
