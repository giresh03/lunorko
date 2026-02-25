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

    const { extra_info } = await req.json();

    // Fetch all user data
    const [profileRes, progressRes, xpRes, achievementsRes, challengeRes, bookingsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("domain_progress").select("*").eq("user_id", user.id),
      supabase.from("user_xp").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_achievements").select("*, achievements(*)").eq("user_id", user.id),
      supabase.from("challenge_submissions").select("*").eq("user_id", user.id).eq("is_correct", true),
      supabase.from("bookings").select("*").eq("student_id", user.id),
    ]);

    const profile = profileRes.data;
    const progress = progressRes.data || [];
    const xp = xpRes.data;
    const achievements = achievementsRes.data || [];
    const challenges = challengeRes.data || [];
    const bookings = bookingsRes.data || [];

    const totalTopics = progress.reduce((sum: number, p: any) => sum + (p.completed_topics?.length || 0), 0);
    const activeDomains = progress.filter((p: any) => p.completed_topics?.length > 0).map((p: any) => p.domain_id);

    const userData = `
Student Profile:
- Name: ${profile?.display_name || user.email?.split("@")[0] || "Student"}
- Email: ${user.email}
- Level: ${xp?.level || 1} (${xp?.total_xp || 0} XP)
- Learning Streak: ${xp?.current_streak || 0} days (Best: ${xp?.longest_streak || 0})
- Active Domains: ${activeDomains.join(", ") || "None yet"}
- Topics Completed: ${totalTopics}
- Daily Challenges Solved: ${challenges.length}
- Mentor Sessions: ${bookings.length}
- Achievements: ${achievements.map((a: any) => a.achievements?.name).filter(Boolean).join(", ") || "None"}
${extra_info ? `\nAdditional Info from Student:\n${extra_info}` : ""}
`;

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
            content: `You are an expert ATS-optimized resume writer for tech students. Generate a professional, clean resume in Markdown format. Include sections: Summary, Technical Skills, Projects & Learning, Achievements, Education (ask student to fill). Use quantified metrics from their Lunor.AI data. Make it compelling and professional.`,
          },
          {
            role: "user",
            content: `Generate a professional tech resume based on this Lunor.AI learning data:\n${userData}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const resume = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ resume }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
