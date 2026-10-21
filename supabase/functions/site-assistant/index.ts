import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { anthropicKey, claudeText, ClaudeError } from '../_shared/claude.ts';

const ROUTES: { path: string; what: string }[] = [
  { path: '/', what: 'Home / landing page' },
  { path: '/domains', what: 'All learning domains' },
  { path: '/domain/:domainId', what: 'A single domain: AI code editor, videos, materials' },
  { path: '/dashboard', what: 'Student dashboard: progress, bookmarks, activity' },
  { path: '/community', what: 'Community hub: chat + forum (free for everyone)' },
  { path: '/projects', what: 'Project builder: team formation and collaborative editor' },
  { path: '/visual-builder', what: 'UI/UX visual design studio' },
  { path: '/ai-interview', what: 'AI video interview practice' },
  { path: '/skill-radar', what: 'AI skill radar scores' },
  { path: '/resume-builder', what: 'ATS resume builder' },
  { path: '/challenge/:domainId', what: 'Daily coding challenge for a domain' },
  { path: '/pricing', what: 'Plans (Pro Rs150, Premium Rs250, Professional Rs500) and Rs50 credit top-ups' },
  { path: '/about', what: 'About Lunor.AI' },
  { path: '/assistant', what: 'This assistant page' },
];

const DOMAIN_HINTS =
  'Common domain ids: web-development, app-development, data-science, machine-learning, ai, cyber-security, cloud-computing, devops, blockchain, ui-ux-design, game-development.';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    const userId = claimsData?.claims?.sub as string | undefined;
    if (claimsError || !userId) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => null);
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body?.history) ? body.history.slice(-14) : [];
    const currentPath = typeof body?.currentPath === 'string' ? body.currentPath : '/';
    if (!message) return json({ error: 'message is required' }, 400);

    const claudeKey = anthropicKey();
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!claudeKey && !key) return json({ error: 'Assistant is not configured' }, 500);

    // ---- AI credit enforcement (admin exempt) ----
    const email = String(claimsData?.claims?.email ?? '').toLowerCase();
    const isAdmin = email === 'lunor.ko@gmail.com';
    if (!isAdmin) {
      const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { data: credit, error: creditErr } = await admin.rpc('consume_ai_credit', {
        _user_id: userId,
        _amount: 1,
        _feature: 'assistant',
      });
      if (creditErr) {
        console.error('consume_ai_credit failed', creditErr);
        return json({ error: 'Could not verify your AI credits.' }, 500);
      }
      if (!credit?.allowed) {
        return json(
          {
            error: 'You are out of AI credits. Top up to keep chatting with your assistant.',
            code: 'credits_exhausted',
            balance: credit?.balance ?? 0,
          },
          402,
        );
      }
    }

    // ---- Personal context (RLS-scoped to this user) ----
    const [profileRes, xpRes, progressRes, bookmarkRes, activityRes] = await Promise.all([
      supabase.rpc('get_my_profile').maybeSingle(),
      supabase.from('user_xp').select('total_xp, level, current_streak, longest_streak, last_activity_date').eq('user_id', userId).maybeSingle(),
      supabase.from('domain_progress').select('domain_id, completed_topics, last_accessed_at').eq('user_id', userId).order('last_accessed_at', { ascending: false }).limit(12),
      supabase.from('bookmarks').select('domain_id, resource_title, resource_type').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('activity_log').select('domain_id, action, detail, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(12),
    ]);

    const profile = profileRes.data;
    const xp = xpRes.data;
    const progress = progressRes.data ?? [];
    const bookmarks = bookmarkRes.data ?? [];
    const activity = activityRes.data ?? [];

    const progressLines = progress.length
      ? progress
          .map((p: any) => `- ${p.domain_id}: ${(p.completed_topics ?? []).length} topics completed (last opened ${String(p.last_accessed_at).slice(0, 10)})`)
          .join('\n')
      : '- No domain progress yet.';

    const bookmarkLines = bookmarks.length
      ? bookmarks.map((b: any) => `- ${b.resource_title} (${b.resource_type}, ${b.domain_id})`).join('\n')
      : '- No bookmarks yet.';

    const activityLines = activity.length
      ? activity.map((a: any) => `- ${String(a.created_at).slice(0, 10)} ${a.action}${a.detail ? `: ${a.detail}` : ''} [${a.domain_id}]`).join('\n')
      : '- No recent activity.';

    const learnerName = profile?.username || profile?.display_name || 'there';

    const systemPrompt = `You are Lunor, the personal AI study companion built into the Lunor.AI platform.

PERSONALITY
- Warm, upbeat and encouraging, like a friendly voice assistant (Alexa-style) who happens to be a great coding mentor.
- Your replies are SPOKEN ALOUD, so keep them short: 1-3 sentences, max ~60 words, plain conversational English.
- No markdown headings, no bullet lists, no code blocks, no emojis, no URLs read out loud.
- Address the learner as ${learnerName} occasionally, not every message.

WHAT YOU KNOW
The learner is currently on the page: ${currentPath}

Site map (route -> what it is):
${ROUTES.map((r) => `- ${r.path} -> ${r.what}`).join('\n')}
${DOMAIN_HINTS}

Learner profile: username ${profile?.username ?? 'not set'}${profile?.wants_to_join_team ? ', interested in joining the Lunor team' : ''}.
Gamification: ${xp ? `level ${xp.level}, ${xp.total_xp} XP, current streak ${xp.current_streak} days (best ${xp.longest_streak}), last active ${xp.last_activity_date ?? 'unknown'}` : 'no XP record yet'}.
Domain progress:
${progressLines}
Bookmarks:
${bookmarkLines}
Recent activity:
${activityLines}

WHAT YOU DO
1. Answer questions about the learner's own progress, streak, XP, bookmarks and what to study next using the data above. Be specific and reference real numbers.
2. Explain what any part of the platform does and guide the learner through it.
3. NAVIGATE the site when asked ("take me to pricing", "open my dashboard", "start web development"). Pick the best route from the site map and fill in real ids (e.g. /domain/web-development).
4. Give short coding help and study advice.

OUTPUT FORMAT — reply with a single JSON object and nothing else:
{"reply": "what you say out loud", "navigate": "/route-or-empty-string"}
Set "navigate" to a route ONLY when the learner clearly wants to go somewhere or you are taking them there; otherwise use "". When you navigate, mention it in the reply ("Sure, opening your dashboard now.").`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history
        .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
        .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
      { role: 'user', content: message.slice(0, 2000) },
    ];

    let raw = '';
    if (claudeKey) {
      try {
        const text = await claudeText({
          system: systemPrompt,
          messages: messages.filter((m: any) => m.role !== 'system'),
          maxTokens: 1024,
        });
        // Claude may wrap JSON in a code fence; keep just the object.
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        raw = start >= 0 && end > start ? text.slice(start, end + 1) : text;
      } catch (e) {
        if (e instanceof ClaudeError) {
          console.error('site-assistant claude error', e.status, e.detail.slice(0, 300));
          if (e.status === 429 || e.status === 529) return json({ error: 'The assistant is busy right now. Try again in a moment.' }, 429);
        }
        return json({ error: 'The assistant could not answer right now.' }, 502);
      }
    } else {
      const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.6,
        }),
      });

      if (aiRes.status === 429) return json({ error: 'The assistant is busy right now. Try again in a moment.' }, 429);
      if (aiRes.status === 402) return json({ error: 'AI credits are exhausted. Please top up to keep chatting.', code: 'credits_exhausted' }, 402);
      if (!aiRes.ok) {
        const detail = await aiRes.text().catch(() => '');
        console.error('site-assistant gateway error', aiRes.status, detail);
        return json({ error: 'The assistant could not answer right now.' }, 502);
      }

      const data = await aiRes.json();
      raw = data?.choices?.[0]?.message?.content ?? '';
    }
    let reply = '';
    let navigate = '';
    try {
      const parsed = JSON.parse(raw);
      reply = typeof parsed?.reply === 'string' ? parsed.reply : '';
      navigate = typeof parsed?.navigate === 'string' ? parsed.navigate : '';
    } catch {
      reply = String(raw).slice(0, 600);
    }
    if (!reply) reply = "I'm here, but I didn't quite catch that. Could you say it another way?";
    if (navigate && !navigate.startsWith('/')) navigate = '';

    return json({ reply, navigate });
  } catch (e) {
    console.error('site-assistant error', e);
    return json({ error: 'Unexpected assistant error' }, 500);
  }
});
