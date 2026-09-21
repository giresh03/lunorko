import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VERSION = "1.0.0";
const FILES: Record<string, string> = {
  mac: `${VERSION}/Lunor-mac-x64.zip`,
  windows: `${VERSION}/Lunor-win-x64.zip`,
  linux: `${VERSION}/Lunor-linux-x64.tar.gz`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const platform = (url.searchParams.get("platform") || "").toLowerCase();
    const objectPath = FILES[platform];

    if (!objectPath) {
      return new Response(
        JSON.stringify({ error: "Unknown platform. Use mac, windows or linux." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const fileName = objectPath.split("/").pop()!;
    const { data, error } = await supabase.storage
      .from("desktop-downloads")
      .createSignedUrl(objectPath, 60 * 60, { download: fileName });

    if (error || !data?.signedUrl) {
      console.error("signed url failed", error);
      return new Response(
        JSON.stringify({ error: "Download is temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: data.signedUrl, "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("desktop-download error", e);
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
